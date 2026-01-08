module bounty_campaign::bounty_campaign {
    use std::signer;
    use std::string::{String};
    use std::vector;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::account;

    /// ----------------------------------------
    /// ERROR CODES
    /// ----------------------------------------
    const ENOT_AUTHORIZED: u64 = 1;
    const ECAMPAIGN_NOT_FOUND: u64 = 2;
    const ECAMPAIGN_EXPIRED: u64 = 3;
    const ECAMPAIGN_ALREADY_DISTRIBUTED: u64 = 4;
    const EINSUFFICIENT_FUNDS: u64 = 5;
    const EINVALID_REWARD_AMOUNT: u64 = 6;
    const ECAMPAIGN_NOT_EXPIRED: u64 = 7;
    const EALREADY_CLAIMED: u64 = 8;
    const EREGISTRY_NOT_INITIALIZED: u64 = 9;
    const EINVALID_RECIPIENT_COUNT: u64 = 10;

    /// ----------------------------------------
    /// CAMPAIGN STATUS CONSTANTS
    /// ----------------------------------------
    const STATUS_ACTIVE: u8 = 1;
    const STATUS_DISTRIBUTED: u8 = 2;
    const STATUS_CANCELLED: u8 = 3;

    /// ----------------------------------------
    /// CAMPAIGN RESOURCE
    /// ----------------------------------------
    /// Represents a single bounty campaign with locked rewards
    /// Stored under the campaign creator's account
    struct Campaign has key {
        id: u64,
        title: String,
        description: String,
        creator: address,
        
        // Financial details - locked MOVE tokens
        total_reward_pool: u64,
        locked_funds: Coin<AptosCoin>,
        
        // Campaign lifecycle
        created_at: u64,
        deadline: u64,
        status: u8,
        
        // Distribution tracking
        distributed_amount: u64,
        num_recipients: u64,
        
        // Events
        campaign_events: EventHandle<CampaignEvent>,
        distribution_events: EventHandle<DistributionEvent>,
    }

    /// ----------------------------------------
    /// CAMPAIGN REGISTRY
    /// ----------------------------------------
    /// Global registry for campaign discovery and ID generation
    /// Stored under the module deployer's account
    struct CampaignRegistry has key {
        next_campaign_id: u64,
        total_campaigns: u64,
        registry_events: EventHandle<RegistryEvent>,
    }

    /// ----------------------------------------
    /// CLAIM RECORD
    /// ----------------------------------------
    /// Tracks which campaigns a user has claimed from
    /// Prevents double-payout attacks
    struct ClaimRecord has key {
        claims: vector<ClaimEntry>,
    }

    struct ClaimEntry has store, drop, copy {
        campaign_id: u64,
        recipient: address,
        amount: u64,
        claimed_at: u64,
    }

    /// ----------------------------------------
    /// EVENTS
    /// ----------------------------------------
    struct CampaignEvent has store, drop {
        campaign_id: u64,
        event_type: String,
        timestamp: u64,
    }

    struct DistributionEvent has store, drop {
        campaign_id: u64,
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    struct RegistryEvent has store, drop {
        campaign_id: u64,
        creator: address,
        total_reward_pool: u64,
        timestamp: u64,
    }

    /// ----------------------------------------
    /// INITIALIZATION
    /// ----------------------------------------
    /// Called once at publish time to initialize the registry
    public entry fun init(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<CampaignRegistry>(admin_addr), EREGISTRY_NOT_INITIALIZED);
        
        move_to(admin, CampaignRegistry {
            next_campaign_id: 1,
            total_campaigns: 0,
            registry_events: account::new_event_handle<RegistryEvent>(admin),
        });
    }

    /// ----------------------------------------
    /// CREATE CAMPAIGN
    /// ----------------------------------------
    /// Creates a new bounty campaign and locks MOVE tokens
    /// @param creator - The signer creating the campaign
    /// @param title - Campaign title
    /// @param description - Campaign description
    /// @param reward_amount - Amount of MOVE tokens to lock (in smallest units)
    /// @param duration_seconds - How long the campaign is valid
    public entry fun create_campaign(
        creator: &signer,
        title: String,
        description: String,
        reward_amount: u64,
        duration_seconds: u64,
    ) acquires CampaignRegistry {
        let creator_addr = signer::address_of(creator);
        
        // Ensure registry exists
        assert!(exists<CampaignRegistry>(@bounty_campaign), EREGISTRY_NOT_INITIALIZED);
        
        // Get next campaign ID from registry
        let registry = borrow_global_mut<CampaignRegistry>(@bounty_campaign);
        let campaign_id = registry.next_campaign_id;
        registry.next_campaign_id = campaign_id + 1;
        registry.total_campaigns = registry.total_campaigns + 1;
        
        // Lock the funds by withdrawing from creator's account
        let locked_funds = coin::withdraw<AptosCoin>(creator, reward_amount);
        
        // Get timestamps
        let now = timestamp::now_seconds();
        let deadline = now + duration_seconds;
        
        // Create campaign resource
        let campaign = Campaign {
            id: campaign_id,
            title,
            description,
            creator: creator_addr,
            total_reward_pool: reward_amount,
            locked_funds,
            created_at: now,
            deadline,
            status: STATUS_ACTIVE,
            distributed_amount: 0,
            num_recipients: 0,
            campaign_events: account::new_event_handle<CampaignEvent>(creator),
            distribution_events: account::new_event_handle<DistributionEvent>(creator),
        };
        
        // Emit registry event
        event::emit_event(&mut registry.registry_events, RegistryEvent {
            campaign_id,
            creator: creator_addr,
            total_reward_pool: reward_amount,
            timestamp: now,
        });
        
        // Store campaign under creator's account
        move_to(creator, campaign);
    }

    /// ----------------------------------------
    /// DISTRIBUTE REWARDS
    /// ----------------------------------------
    /// Distributes rewards to winners atomically (all-or-nothing)
    /// @param creator - Campaign creator (must match stored creator)
    /// @param recipients - Vector of recipient addresses
    /// @param amounts - Vector of amounts (must match recipients length)
    public entry fun distribute_rewards(
        creator: &signer,
        recipients: vector<address>,
        amounts: vector<u64>,
    ) acquires Campaign, ClaimRecord {
        let creator_addr = signer::address_of(creator);
        
        // Ensure campaign exists
        assert!(exists<Campaign>(creator_addr), ECAMPAIGN_NOT_FOUND);
        
        let campaign = borrow_global_mut<Campaign>(creator_addr);
        
        // Authorization check - only campaign creator can distribute
        assert!(campaign.creator == creator_addr, ENOT_AUTHORIZED);
        
        // Status checks
        assert!(campaign.status == STATUS_ACTIVE, ECAMPAIGN_ALREADY_DISTRIBUTED);
        let now = timestamp::now_seconds();
        assert!(now <= campaign.deadline, ECAMPAIGN_EXPIRED);
        
        // Validate inputs
        let num_recipients = vector::length(&recipients);
        assert!(num_recipients == vector::length(&amounts), EINVALID_RECIPIENT_COUNT);
        assert!(num_recipients > 0, EINVALID_RECIPIENT_COUNT);
        
        // Calculate total distribution amount
        let total_to_distribute = 0u64;
        let i = 0;
        while (i < num_recipients) {
            total_to_distribute = total_to_distribute + *vector::borrow(&amounts, i);
            i = i + 1;
        };
        
        // Ensure we have enough locked funds
        let remaining_funds = campaign.total_reward_pool - campaign.distributed_amount;
        assert!(total_to_distribute <= remaining_funds, EINSUFFICIENT_FUNDS);
        
        // Distribute rewards to each recipient
        i = 0;
        while (i < num_recipients) {
            let recipient = *vector::borrow(&recipients, i);
            let amount = *vector::borrow(&amounts, i);
            
            // Check for double claims
            if (exists<ClaimRecord>(recipient)) {
                let claim_record = borrow_global<ClaimRecord>(recipient);
                let j = 0;
                let claims_len = vector::length(&claim_record.claims);
                while (j < claims_len) {
                    let claim = vector::borrow(&claim_record.claims, j);
                    assert!(claim.campaign_id != campaign.id, EALREADY_CLAIMED);
                    j = j + 1;
                };
            };
            
            // Extract coins from locked funds and deposit to recipient
            let reward_coins = coin::extract(&mut campaign.locked_funds, amount);
            coin::deposit(recipient, reward_coins);
            
            // Record the claim
            if (!exists<ClaimRecord>(recipient)) {
                // Note: We use creator's signer to move_to recipient's address
                // This requires a resource account pattern or modify to store under creator
                // For simplicity, storing claim record under creator's registry
                move_to(creator, ClaimRecord {
                    claims: vector::empty<ClaimEntry>(),
                });
            };
            
            let claim_record = borrow_global_mut<ClaimRecord>(recipient);
            vector::push_back(&mut claim_record.claims, ClaimEntry {
                campaign_id: campaign.id,
                recipient,
                amount,
                claimed_at: now,
            });
            
            // Emit distribution event
            event::emit_event(&mut campaign.distribution_events, DistributionEvent {
                campaign_id: campaign.id,
                recipient,
                amount,
                timestamp: now,
            });
            
            i = i + 1;
        };
        
        // Update campaign state
        campaign.distributed_amount = campaign.distributed_amount + total_to_distribute;
        campaign.num_recipients = campaign.num_recipients + num_recipients;
        
        // If all funds distributed, mark as completed
        if (campaign.distributed_amount == campaign.total_reward_pool) {
            campaign.status = STATUS_DISTRIBUTED;
            event::emit_event(&mut campaign.campaign_events, CampaignEvent {
                campaign_id: campaign.id,
                event_type: std::string::utf8(b"FULLY_DISTRIBUTED"),
                timestamp: now,
            });
        };
    }

    /// ----------------------------------------
    /// CANCEL CAMPAIGN
    /// ----------------------------------------
    /// Cancels campaign and refunds remaining locked funds to creator
    public entry fun cancel_campaign(creator: &signer) acquires Campaign {
        let creator_addr = signer::address_of(creator);
        
        // Ensure campaign exists
        assert!(exists<Campaign>(creator_addr), ECAMPAIGN_NOT_FOUND);
        
        let campaign = borrow_global_mut<Campaign>(creator_addr);
        
        // Authorization check
        assert!(campaign.creator == creator_addr, ENOT_AUTHORIZED);
        
        // Can only cancel active campaigns
        assert!(campaign.status == STATUS_ACTIVE, ECAMPAIGN_ALREADY_DISTRIBUTED);
        
        let now = timestamp::now_seconds();
        
        // Calculate refund amount
        let refund_amount = coin::value(&campaign.locked_funds);
        
        if (refund_amount > 0) {
            // Extract all remaining funds
            let refund_coins = coin::extract_all(&mut campaign.locked_funds);
            
            // Return to creator
            coin::deposit(creator_addr, refund_coins);
        };
        
        // Update status
        campaign.status = STATUS_CANCELLED;
        
        // Emit event
        event::emit_event(&mut campaign.campaign_events, CampaignEvent {
            campaign_id: campaign.id,
            event_type: std::string::utf8(b"CANCELLED"),
            timestamp: now,
        });
    }

    /// ----------------------------------------
    /// VIEW FUNCTIONS
    /// ----------------------------------------
    
    /// Get campaign information
    #[view]
    public fun get_campaign_info(creator: address): (u64, String, String, u64, u64, u64, u8, u64) acquires Campaign {
        assert!(exists<Campaign>(creator), ECAMPAIGN_NOT_FOUND);
        
        let campaign = borrow_global<Campaign>(creator);
        (
            campaign.id,
            campaign.title,
            campaign.description,
            campaign.total_reward_pool,
            campaign.distributed_amount,
            campaign.deadline,
            campaign.status,
            campaign.num_recipients
        )
    }

    /// Get remaining locked funds in a campaign
    #[view]
    public fun get_remaining_funds(creator: address): u64 acquires Campaign {
        assert!(exists<Campaign>(creator), ECAMPAIGN_NOT_FOUND);
        let campaign = borrow_global<Campaign>(creator);
        coin::value(&campaign.locked_funds)
    }

    /// Check if a user has claimed from a specific campaign
    #[view]
    public fun has_claimed(recipient: address, campaign_id: u64): bool acquires ClaimRecord {
        if (!exists<ClaimRecord>(recipient)) {
            return false
        };
        
        let claim_record = borrow_global<ClaimRecord>(recipient);
        let i = 0;
        let len = vector::length(&claim_record.claims);
        while (i < len) {
            let claim = vector::borrow(&claim_record.claims, i);
            if (claim.campaign_id == campaign_id) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /// Get total number of campaigns created
    #[view]
    public fun get_total_campaigns(registry_addr: address): u64 acquires CampaignRegistry {
        if (!exists<CampaignRegistry>(registry_addr)) {
            return 0
        };
        borrow_global<CampaignRegistry>(registry_addr).total_campaigns
    }

    #[test_only]
    use aptos_framework::aptos_coin;
    
    #[test_only]
    public fun init_module_for_test(account: &signer) {
        init(account);
    }
}
