# Bounty Campaign Smart Contract

A Move smart contract for managing on-chain bounty campaigns with reward locking and distribution on the Movement blockchain.

## Overview

This contract enables trustless, transparent bounty campaign management where:
- Campaign creators lock MOVE tokens on-chain
- Rewards are distributed deterministically via contract logic
- All operations are transparent through on-chain events
- Double payouts and misuse are prevented through resource safety

## Features

✅ **Campaign Creation** - Lock MOVE tokens with metadata
✅ **Reward Distribution** - Atomic, all-or-nothing distribution to winners
✅ **Campaign Cancellation** - Refund unused funds to creator
✅ **Double-Payout Prevention** - Claim tracking per recipient
✅ **Event Transparency** - All actions emit on-chain events
✅ **Resource Safety** - Leverages Move's linear type system

## Architecture

### Storage Design

#### 1. Campaign Resource
```move
struct Campaign has key {
    id: u64,
    title: String,
    description: String,
    creator: address,
    total_reward_pool: u64,
    locked_funds: Coin<AptosCoin>,  // Actual locked tokens
    created_at: u64,
    deadline: u64,
    status: u8,
    distributed_amount: u64,
    num_recipients: u64,
    campaign_events: EventHandle<CampaignEvent>,
    distribution_events: EventHandle<DistributionEvent>,
}
```

**Key Points:**
- Stored under creator's account using Move's resource model
- `has key` ability makes it a first-class on-chain entity
- Cannot be copied or dropped (resource safety)
- `locked_funds` uses `Coin<AptosCoin>` for type-safe token handling

#### 2. Campaign Registry
```move
struct CampaignRegistry has key {
    next_campaign_id: u64,
    total_campaigns: u64,
    registry_events: EventHandle<RegistryEvent>,
}
```

**Purpose:**
- Global singleton for campaign ID generation
- Enables campaign discovery and enumeration
- Tracks total campaigns created

#### 3. Claim Record
```move
struct ClaimRecord has key {
    claims: vector<ClaimEntry>,
}

struct ClaimEntry has store, drop, copy {
    campaign_id: u64,
    recipient: address,
    amount: u64,
    claimed_at: u64,
}
```

**Purpose:**
- Stored under each recipient's account
- Prevents double-claim attacks
- Provides claim history for users

### Reward Locking Mechanism

**How It Works:**

1. **On Campaign Creation:**
   ```move
   let locked_funds = coin::withdraw<AptosCoin>(creator, reward_amount);
   ```
   - Tokens are withdrawn from creator's account
   - Moved into the `Campaign` resource
   - Held by the contract, not the creator

2. **Safety Guarantees:**
   - Move's linear type system prevents fund duplication
   - `Coin<AptosCoin>` cannot be copied or dropped
   - Must be explicitly extracted and deposited
   - No reentrancy attacks possible

3. **Fund Lifecycle:**
   ```
   Creator Account → Campaign.locked_funds → Recipients
                                          ↓
                                   (or back to creator on cancel)
   ```

### Distribution Logic

**Distribution Process:**

1. **Authorization Check**
   ```move
   assert!(campaign.creator == creator_addr, E_NOT_AUTHORIZED);
   ```
   Only campaign creator can distribute rewards

2. **Status Validation**
   ```move
   assert!(campaign.status == STATUS_ACTIVE, E_CAMPAIGN_ALREADY_DISTRIBUTED);
   assert!(now <= campaign.deadline, E_CAMPAIGN_EXPIRED);
   ```
   Campaign must be active and not expired

3. **Fund Validation**
   ```move
   let total_to_distribute = /* sum of all amounts */;
   assert!(total_to_distribute <= remaining_funds, E_INSUFFICIENT_FUNDS);
   ```
   Ensure sufficient locked funds

4. **Atomic Distribution**
   ```move
   while (i < num_recipients) {
       let reward_coins = coin::extract(&mut campaign.locked_funds, amount);
       coin::deposit(recipient, reward_coins);
       // Record claim
       // Emit event
       i = i + 1;
   }
   ```
   - All distributions happen in a single transaction
   - If any fails, entire transaction reverts
   - All-or-nothing guarantee

5. **Double-Claim Prevention**
   ```move
   // Check existing claims
   assert!(claim.campaign_id != campaign.id, E_ALREADY_CLAIMED);
   ```
   Before each distribution, verify recipient hasn't claimed

**Distribution Modes Supported:**

The contract is flexible and supports:
- **Fixed amounts**: Same amount to all winners
- **Variable amounts**: Different amounts per winner
- **Partial distribution**: Distribute in multiple batches
- **Full distribution**: Distribute entire pool at once

## Deployment

**For detailed Movement blockchain deployment instructions, see [DEPLOYMENT.md](file:///C:/Users/jayan/Desktop/Repo-Exchange/move_contracts/DEPLOYMENT.md)**

### Quick Deployment

```bash
# 1. Compile
movement move compile

# 2. Publish
movement move publish --named-addresses bounty_campaign=default

# 3. Initialize
movement move run --function-id 'default::bounty_campaign::init'
```

See [DEPLOYMENT.md](file:///C:/Users/jayan/Desktop/Repo-Exchange/move_contracts/DEPLOYMENT.md) for complete deployment guide with network configuration, troubleshooting, and gas optimization tips.

## Usage Examples

See [examples.md](file:///C:/Users/jayan/Desktop/Repo-Exchange/move_contracts/examples.md) for detailed usage scenarios.

### Quick Start

**1. Create a Campaign:**
```bash
movement move run \
  --function-id '<ADDRESS>::bounty_campaign::create_campaign' \
  --args \
    string:"Bug Bounty Q1" \
    string:"Find critical bugs in our protocol" \
    u64:1000000000 \
    u64:2592000
```

**2. Distribute Rewards:**
```bash
movement move run \
  --function-id '<ADDRESS>::bounty_campaign::distribute_rewards' \
  --args \
    'vector<address>:[0xWINNER1,0xWINNER2]' \
    'vector<u64>:[500000000,500000000]'
```

**3. Cancel Campaign:**
```bash
movement move run \
  --function-id '<ADDRESS>::bounty_campaign::cancel_campaign'
```

## Security Features

### 1. Resource Safety
- Move's linear type system prevents double-spending
- Coins cannot be duplicated or lost
- Explicit ownership transfers

### 2. Access Control
- Only campaign creator can distribute or cancel
- Enforced at contract level

### 3. Double-Claim Prevention
- Claim records tracked per recipient
- Checked before each distribution

### 4. Atomic Operations
- Distribution is all-or-nothing
- No partial failures

### 5. Event Transparency
- All major actions emit events
- On-chain audit trail

## View Functions

Query campaign state without gas costs:

```move
// Get campaign details
public fun get_campaign_info(creator: address): (u64, String, String, u64, u64, u64, u8, u64)

// Get remaining locked funds
public fun get_remaining_funds(creator: address): u64

// Check if address claimed from campaign
public fun has_claimed(recipient: address, campaign_id: u64): bool
```

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 1 | `E_NOT_AUTHORIZED` | Caller is not the campaign creator |
| 2 | `E_CAMPAIGN_NOT_FOUND` | Campaign does not exist |
| 3 | `E_CAMPAIGN_EXPIRED` | Campaign past deadline |
| 4 | `E_CAMPAIGN_ALREADY_DISTRIBUTED` | Campaign already completed |
| 5 | `E_INSUFFICIENT_FUNDS` | Not enough locked funds |
| 6 | `E_INVALID_REWARD_AMOUNT` | Invalid reward amount |
| 7 | `E_CAMPAIGN_NOT_EXPIRED` | Campaign still active |
| 8 | `E_ALREADY_CLAIMED` | Recipient already claimed |
| 9 | `E_CAMPAIGN_REGISTRY_NOT_INITIALIZED` | Registry not set up |
| 10 | `E_INVALID_RECIPIENT_COUNT` | Mismatched recipients/amounts |

## Integration with Web3 Products

### Frontend Integration

1. **Connect Wallet:** Use Movement wallet adapter
2. **Create Campaign:** Call `create_campaign` entry function
3. **Monitor Events:** Listen to `RegistryEvent`, `DistributionEvent`
4. **Query State:** Use view functions for UI display

### Example TypeScript/React:
```typescript
import { AptosClient, AptosAccount } from 'aptos';

const client = new AptosClient('https://fullnode.mainnet.movementlabs.xyz');

// Create campaign
const payload = {
  type: 'entry_function_payload',
  function: `${moduleAddress}::bounty_campaign::create_campaign`,
  arguments: ['Bug Bounty', 'Description', '1000000000', '2592000'],
  type_arguments: []
};

await wallet.signAndSubmitTransaction(payload);
```

## Testing

The contract includes test infrastructure:

```bash
movement move test
```

## Best Practices

1. **Test on Testnet First:** Always deploy to testnet before mainnet
2. **Verify Amounts:** Double-check reward amounts (in smallest units)
3. **Monitor Events:** Track all distributions via events
4. **Set Reasonable Deadlines:** Allow sufficient time for campaigns
5. **Batch Distributions:** For gas efficiency, distribute in batches if needed

## Limitations & Considerations

1. **One Campaign Per Creator:** Current design stores one campaign per account
   - **Solution:** Use resource accounts for multiple campaigns
2. **Gas Costs:** Large distributions incur higher gas
   - **Solution:** Batch distributions across multiple transactions
3. **Movement Framework:** Assumes Aptos-compatible framework
   - **Verify:** Check Movement's standard library compatibility

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- GitHub Issues: [Repo-Exchange](https://github.com/chandanjha34/Repo-Exchange)
- Movement Documentation: [Movement Labs](https://docs.movementlabs.xyz)

---

**⚠️ Security Notice:** This contract is provided as-is. Conduct thorough testing and consider professional audits before production deployment with real funds.
