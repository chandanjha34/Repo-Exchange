module layr::access {

    use std::signer;
    use std::vector;

    /// ----------------------------------------
    /// ERRORS
    /// ----------------------------------------
    const EACCESS_ALREADY_GRANTED: u64 = 1;
    const ENOT_INITIALIZED: u64 = 2;
    const ENOT_FOUND: u64 = 3;

    /// ----------------------------------------
    /// ACCESS RECORD
    /// ----------------------------------------
    struct AccessRecord has store, drop, copy {
        user: address,
        repo_id: u64,
        access_type: u8, // 1 = view, 2 = download
    }

    /// ----------------------------------------
    /// ACCESS REGISTRY
    /// ----------------------------------------
    /// Stored under admin account, contains all access grants
    struct AccessRegistry has key {
        grants: vector<AccessRecord>,
    }

    /// ----------------------------------------
    /// INITIALIZATION
    /// ----------------------------------------
    /// Called once at publish time
    public entry fun init(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<AccessRegistry>(admin_addr), EACCESS_ALREADY_GRANTED);
        
        move_to(admin, AccessRegistry {
            grants: vector::empty<AccessRecord>(),
        });
    }

    /// ----------------------------------------
    /// ACCESS GRANT (called after payment)
    /// ----------------------------------------
    /// This is the function your backend / x402 flow calls
    public entry fun grant_access(
        admin: &signer,
        user: address,
        repo_id: u64,
        access_type: u8
    ) acquires AccessRegistry {
        let admin_addr = signer::address_of(admin);
        
        // Only admin can grant access
        assert!(exists<AccessRegistry>(admin_addr), ENOT_INITIALIZED);

        let registry = borrow_global_mut<AccessRegistry>(admin_addr);
        
        // Check if access already exists
        let len = vector::length(&registry.grants);
        let i = 0;
        while (i < len) {
            let record = vector::borrow(&registry.grants, i);
            if (record.user == user && record.repo_id == repo_id) {
                abort EACCESS_ALREADY_GRANTED
            };
            i = i + 1;
        };

        // Add new access record
        vector::push_back(&mut registry.grants, AccessRecord {
            user,
            repo_id,
            access_type,
        });
    }

    /// ----------------------------------------
    /// READ FUNCTIONS (VIEW)
    /// ----------------------------------------
    #[view]
    public fun has_access(admin: address, user: address, repo_id: u64): bool acquires AccessRegistry {
        if (!exists<AccessRegistry>(admin)) {
            return false
        };

        let registry = borrow_global<AccessRegistry>(admin);
        let len = vector::length(&registry.grants);
        let i = 0;
        while (i < len) {
            let record = vector::borrow(&registry.grants, i);
            if (record.user == user && record.repo_id == repo_id) {
                return true
            };
            i = i + 1;
        };
        false
    }

    #[view]
    public fun get_access_type(admin: address, user: address, repo_id: u64): u8 acquires AccessRegistry {
        let registry = borrow_global<AccessRegistry>(admin);
        let len = vector::length(&registry.grants);
        let i = 0;
        while (i < len) {
            let record = vector::borrow(&registry.grants, i);
            if (record.user == user && record.repo_id == repo_id) {
                return record.access_type
            };
            i = i + 1;
        };
        abort ENOT_FOUND
    }
}
