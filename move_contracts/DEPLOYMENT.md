# Movement Blockchain Deployment Guide

This guide walks you through deploying the Bounty Campaign smart contract on Movement blockchain.

## Prerequisites

- **Movement CLI** installed
- **Movement account** with MOVE tokens
- **Git** for cloning dependencies

## Installation

### 1. Install Movement CLI

```bash
# Install Movement CLI (if not already installed)
curl -fsSL https://raw.githubusercontent.com/movementlabsxyz/aptos-core/main/scripts/dev_setup.sh | sh

# Verify installation
movement --version
```

### 2. Create/Import Account

```bash
# Initialize Movement account
movement init

# Follow prompts to:
# - Choose network (testnet/mainnet)
# - Create new account or import existing
# - Fund account with MOVE tokens
```

## Deployment Steps

### Step 1: Navigate to Contract Directory

```bash
cd C:\Users\jayan\Desktop\Repo-Exchange\move_contracts
```

### Step 2: Compile the Contract

```bash
movement move compile

# Expected output:
# SUCCESS Compiling module bounty_campaign::bounty_campaign
```

### Step 3: Publish to Movement

```bash
# For testnet deployment
movement move publish --named-addresses bounty_campaign=default

# For mainnet deployment (use with caution)
movement move publish --named-addresses bounty_campaign=default --network mainnet
```

**Note:** The CLI will prompt you to confirm the transaction and show gas fees.

### Step 4: Initialize the Registry

After publishing, initialize the campaign registry:

```bash
movement move run \
  --function-id 'default::bounty_campaign::init'

# Or with explicit address:
movement move run \
  --function-id '<YOUR_ADDRESS>::bounty_campaign::init'
```

**Expected Output:**
```
{
  "Result": "Success",
  "gas_used": <gas_amount>,
  "transaction_hash": "0x..."
}
```

## Verify Deployment

### Check Contract on Explorer

Visit Movement block explorer:
- **Testnet:** https://explorer.movementlabs.xyz/?network=testnet
- **Mainnet:** https://explorer.movementlabs.xyz

Search for your account address to see the published module.

### Test with View Function

```bash
movement move view \
  --function-id '<YOUR_ADDRESS>::bounty_campaign::get_total_campaigns' \
  --args address:<YOUR_ADDRESS>

# Should return: 0 (no campaigns created yet)
```

## Create Your First Campaign

```bash
movement move run \
  --function-id '<YOUR_ADDRESS>::bounty_campaign::create_campaign' \
  --args \
    string:"Test Campaign" \
    string:"Testing bounty campaign creation" \
    u64:100000000 \
    u64:86400

# This creates a campaign with:
# - Title: "Test Campaign"
# - Description: "Testing bounty campaign creation"
# - Reward: 1 MOVE (100000000 in smallest units, assuming 8 decimals)
# - Duration: 1 day (86400 seconds)
```

## Distribute Rewards

```bash
movement move run \
  --function-id '<YOUR_ADDRESS>::bounty_campaign::distribute_rewards' \
  --args \
    'vector<address>:[<RECIPIENT_1>,<RECIPIENT_2>]' \
    'vector<u64>:[50000000,50000000]'

# This distributes:
# - 0.5 MOVE to RECIPIENT_1
# - 0.5 MOVE to RECIPIENT_2
```

## Common Issues

### Issue: "Module not found"
**Solution:** Ensure you've published the module and are using the correct address.

### Issue: "Insufficient gas"
**Solution:** Ensure your account has enough MOVE tokens for gas fees.

### Issue: "Resource already exists"
**Solution:** The registry is already initialized. Skip step 4.

### Issue: "Sequence number too old"
**Solution:** Wait a few seconds and retry. The network may be processing previous transactions.

## Network Configuration

### Testnet
```bash
# Set testnet as default
movement init --network testnet

# Testnet faucet (get test MOVE tokens)
movement account fund-with-faucet --account default
```

### Mainnet
```bash
# Set mainnet as default
movement init --network mainnet

# WARNING: Use real MOVE tokens on mainnet
```

## Gas Optimization Tips

1. **Batch Distributions:** Distribute to multiple recipients in one call to save gas
2. **Keep Metadata Short:** Shorter titles/descriptions reduce storage costs
3. **Use View Functions:** Query state without gas using `view` functions

## Security Checklist

Before deploying to mainnet:

- [ ] Test all functions on testnet
- [ ] Verify error handling works correctly
- [ ] Test with small amounts first
- [ ] Ensure proper access control
- [ ] Review all recipient addresses carefully
- [ ] Consider professional security audit for large deployments

## Next Steps

After deployment:
1. Integrate with your Web3 frontend
2. Set up event monitoring
3. Create admin dashboard for campaign management
4. Document your specific use case

## Support

- Movement Documentation: https://docs.movementlabs.xyz
- Movement Discord: https://discord.gg/movementlabs
- Contract Repository: https://github.com/chandanjha34/Repo-Exchange

---

## Deployment Status

**✅ DEPLOYED**

**Contract Address:** `0xa492a23821f2f8575d42bbaa3cd65fd4a0afb922c57dc56d78b360a18211f884`

**Network:** Movement Testnet

**Deployment Date:** January 8, 2026

**Transaction Hash:** `0xda06bd41f23686b02fdff95db19e416a540791b7ce86336d1c7d0d4eab6bbf97`

**Registry Initialized:** Yes (Transaction: `0x6979c967ffa9f792773e94232cc0b3298530c3b2f266221abf97458b150786ab`)

**Explorer Link:** https://explorer.aptoslabs.com/account/0xa492a23821f2f8575d42bbaa3cd65fd4a0afb922c57dc56d78b360a18211f884?network=custom
