# Bounty Campaign Contract - Usage Examples

This document provides practical examples for interacting with the bounty campaign smart contract.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Creating a Campaign](#creating-a-campaign)
3. [Distributing Rewards](#distributing-rewards)
4. [Querying Campaign Status](#querying-campaign-status)
5. [Canceling a Campaign](#canceling-a-campaign)
6. [Advanced Scenarios](#advanced-scenarios)

---

## Initial Setup

### Deploy and Initialize

```bash
# 1. Compile the contract
cd move_contracts
movement move compile

# 2. Publish to Movement blockchain
movement move publish --named-addresses bounty_campaign=0xYOUR_ADDRESS

# 3. Initialize the campaign registry (one-time setup)
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::initialize_registry'
```

---

## Creating a Campaign

### Example 1: Simple Bug Bounty Campaign

Create a bug bounty with 1000 MOVE tokens, valid for 30 days:

```bash
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::create_campaign' \
  --args \
    string:"Q1 Bug Bounty" \
    string:"Find and report critical vulnerabilities in our smart contracts" \
    u64:1000000000000 \
    u64:2592000
```

**Parameters:**
- `title`: "Q1 Bug Bounty"
- `description`: Campaign details
- `reward_amount`: 1000000000000 (1000 MOVE in smallest units, assuming 8 decimals)
- `duration_seconds`: 2592000 (30 days = 30 * 24 * 60 * 60)

**What happens:**
1. 1000 MOVE tokens withdrawn from your account
2. Tokens locked in the Campaign resource
3. Campaign stored under your address
4. `RegistryEvent` emitted with campaign details
5. Campaign ID assigned automatically

---

### Example 2: Marketing Campaign

Create a marketing bounty for content creators:

```bash
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::create_campaign' \
  --args \
    string:"Content Creator Rewards" \
    string:"Create educational content about Movement blockchain" \
    u64:500000000000 \
    u64:1209600
```

**Parameters:**
- Reward: 500 MOVE
- Duration: 14 days

---

## Distributing Rewards

### Example 3: Fixed Amount Distribution

Distribute 100 MOVE to each of 5 winners:

```bash
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args \
    'vector<address>:[0xWINNER1,0xWINNER2,0xWINNER3,0xWINNER4,0xWINNER5]' \
    'vector<u64>:[100000000000,100000000000,100000000000,100000000000,100000000000]'
```

**What happens:**
1. Contract verifies you're the campaign creator
2. Checks campaign is active and not expired
3. Validates total (500 MOVE) ≤ remaining funds
4. Checks each recipient hasn't claimed before
5. Extracts coins from `locked_funds`
6. Deposits to each recipient atomically
7. Records claim for each recipient
8. Emits `DistributionEvent` for each transfer
9. Updates campaign's `distributed_amount`

---

### Example 4: Variable Amount Distribution

Distribute different amounts based on contribution quality:

```bash
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args \
    'vector<address>:[0xTOP_CONTRIBUTOR,0xMID_CONTRIBUTOR,0xLOW_CONTRIBUTOR]' \
    'vector<u64>:[500000000000,300000000000,200000000000]'
```

**Distribution:**
- Top contributor: 500 MOVE
- Mid contributor: 300 MOVE
- Low contributor: 200 MOVE
- **Total: 1000 MOVE**

---

### Example 5: Partial Distribution

Distribute rewards in multiple batches:

**Batch 1:**
```bash
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args \
    'vector<address>:[0xUSER1,0xUSER2]' \
    'vector<u64>:[250000000000,250000000000]'
```

**Batch 2 (later):**
```bash
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args \
    'vector<address>:[0xUSER3,0xUSER4]' \
    'vector<u64>:[250000000000,250000000000]'
```

**Use case:** Distribute as bugs are discovered, not all at once.

---

## Querying Campaign Status

### Example 6: Get Campaign Information

Use view function to query campaign details (no gas cost):

```bash
movement move view \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::get_campaign_info' \
  --args address:0xCREATOR_ADDRESS
```

**Returns:**
```
(
  campaign_id: 1,
  title: "Q1 Bug Bounty",
  description: "Find and report critical vulnerabilities...",
  total_reward_pool: 1000000000000,
  distributed_amount: 500000000000,
  deadline: 1736387200,
  status: 1,  // STATUS_ACTIVE
  num_recipients: 2
)
```

---

### Example 7: Check Remaining Funds

```bash
movement move view \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::get_remaining_funds' \
  --args address:0xCREATOR_ADDRESS
```

**Returns:**
```
500000000000  // 500 MOVE remaining in locked_funds
```

---

### Example 8: Check if User Has Claimed

```bash
movement move view \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::has_claimed' \
  --args \
    address:0xRECIPIENT_ADDRESS \
    u64:1
```

**Returns:**
```
true  // User has claimed from campaign ID 1
```

---

## Canceling a Campaign

### Example 9: Cancel and Refund

Cancel the campaign and refund all remaining locked funds:

```bash
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::cancel_campaign'
```

**What happens:**
1. Verifies you're the campaign creator
2. Checks campaign status is `STATUS_ACTIVE`
3. Extracts ALL remaining funds from `locked_funds`
4. Deposits back to your account
5. Sets campaign status to `STATUS_CANCELLED`
6. Emits `CampaignEvent` with "CANCELLED" type

**Use case:** Campaign deadline approaching with no valid submissions.

---

## Advanced Scenarios

### Example 10: Zero-Claim Verification Before Distribution

**Programmatically check claims before distributing:**

```typescript
const recipients = ['0xUSER1', '0xUSER2', '0xUSER3'];
const campaignId = 1;

for (const recipient of recipients) {
  const hasClaimed = await client.view({
    function: `${moduleAddress}::bounty_campaign::has_claimed`,
    arguments: [recipient, campaignId],
    type_arguments: []
  });
  
  if (hasClaimed) {
    console.log(`${recipient} already claimed!`);
    // Remove from distribution list
  }
}

// Proceed with filtered list
```

---

### Example 11: Monitoring Events

Listen for distribution events in your frontend:

```typescript
import { AptosClient } from 'aptos';

const client = new AptosClient('https://fullnode.mainnet.movementlabs.xyz');

// Get transactions from creator account
const txns = await client.getAccountTransactions(creatorAddress);

// Filter for distribution events
const distributions = txns.filter(txn => 
  txn.payload?.function?.includes('distribute_rewards')
);

distributions.forEach(txn => {
  console.log('Distribution Event:', {
    campaign_id: txn.events.find(e => e.type.includes('DistributionEvent')),
    recipients: txn.payload.arguments[0],
    amounts: txn.payload.arguments[1]
  });
});
```

---

### Example 12: Multi-Campaign Management

Create multiple campaigns using resource accounts:

```bash
# Create resource account for Campaign 1
movement account create-resource-account \
  --seed "campaign1" \
  --address 0xYOUR_ADDRESS

# Create resource account for Campaign 2
movement account create-resource-account \
  --seed "campaign2" \
  --address 0xYOUR_ADDRESS

# Create campaign from each resource account
movement move run \
  --function-id '0xRESOURCE1::bounty_campaign::create_campaign' \
  --args string:"Campaign 1" ...

movement move run \
  --function-id '0xRESOURCE2::bounty_campaign::create_campaign' \
  --args string:"Campaign 2" ...
```

---

### Example 13: Complete Lifecycle

Full campaign lifecycle from creation to completion:

```bash
# 1. Create campaign (locks 1000 MOVE for 7 days)
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::create_campaign' \
  --args string:"Weekly Bounty" string:"Description" u64:1000000000000 u64:604800

# 2. Wait for submissions...

# 3. Distribute to first winner (400 MOVE)
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args 'vector<address>:[0xWINNER1]' 'vector<u64>:[400000000000]'

# 4. Check remaining funds
movement move view \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::get_remaining_funds' \
  --args address:0xYOUR_ADDRESS
# Returns: 600000000000

# 5. Distribute to more winners (600 MOVE total)
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args 'vector<address>:[0xWINNER2,0xWINNER3]' 'vector<u64>:[400000000000,200000000000]'

# 6. Check status - should be STATUS_DISTRIBUTED (2)
movement move view \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::get_campaign_info' \
  --args address:0xYOUR_ADDRESS
# status field = 2 (fully distributed)
```

---

## Error Scenarios

### Example 14: Handling Errors

**Attempting double distribution:**
```bash
# First distribution succeeds
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args 'vector<address>:[0xUSER1]' 'vector<u64>:[100000000000]'

# Second distribution to same user FAILS
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args 'vector<address>:[0xUSER1]' 'vector<u64>:[100000000000]'

# Error: E_ALREADY_CLAIMED (8)
```

**Insufficient funds:**
```bash
# Campaign has 500 MOVE remaining
# Trying to distribute 600 MOVE FAILS
movement move run \
  --function-id '0xYOUR_ADDRESS::bounty_campaign::distribute_rewards' \
  --args 'vector<address>:[0xUSER1]' 'vector<u64>:[600000000000]'

# Error: E_INSUFFICIENT_FUNDS (5)
```

---

## Integration Example: Web Application

### React Component Example

```tsx
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { AptosClient } from 'aptos';

const CreateCampaignForm = () => {
  const { signAndSubmitTransaction } = useWallet();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  
  const handleCreateCampaign = async () => {
    const payload = {
      type: 'entry_function_payload',
      function: `${MODULE_ADDRESS}::bounty_campaign::create_campaign`,
      arguments: [
        title,
        description,
        (parseFloat(amount) * 100000000).toString(), // Convert to smallest units
        '2592000' // 30 days
      ],
      type_arguments: []
    };
    
    try {
      const response = await signAndSubmitTransaction(payload);
      console.log('Campaign created:', response.hash);
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };
  
  return (
    <form onSubmit={handleCreateCampaign}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <input value={amount} onChange={e => setAmount(e.target.value)} />
      <button type="submit">Create Campaign</button>
    </form>
  );
};
```

---

## Testing Checklist

- [ ] Create campaign with valid parameters
- [ ] Create campaign with insufficient balance (should fail)
- [ ] Distribute rewards to single recipient
- [ ] Distribute rewards to multiple recipients
- [ ] Try to distribute more than locked amount (should fail)
- [ ] Try to distribute to same recipient twice (should fail)
- [ ] Query campaign info using view function
- [ ] Check remaining funds
- [ ] Cancel campaign and verify refund
- [ ] Try to cancel already-distributed campaign (should fail)
- [ ] Verify events are emitted correctly

---

## Tips & Best Practices

1. **Always Test on Testnet:** Use testnet MOVE before mainnet deployment
2. **Verify Addresses:** Double-check recipient addresses before distribution
3. **Calculate Units:** MOVE has 8 decimals (1 MOVE = 100000000 smallest units)
4. **Monitor Gas:** Large distributions cost more gas
5. **Use View Functions:** Query state without gas costs for UI display
6. **Batch Distributions:** For 100+ winners, distribute in batches
7. **Set Realistic Deadlines:** Account for timezones and human review time

---

## Need Help?

- Check error codes in [README.md](file:///C:/Users/jayan/Desktop/Repo-Exchange/move_contracts/README.md#error-codes)
- Review contract source: [bounty_campaign.move](file:///C:/Users/jayan/Desktop/Repo-Exchange/move_contracts/sources/bounty_campaign.move)
- Movement documentation: https://docs.movementlabs.xyz
