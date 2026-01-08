# Bounty Campaign Smart Contract - Team Summary

## What is this?

A **Move smart contract for Movement blockchain** that enables trustless bounty campaigns with on-chain reward distribution.

## Core Features

### 🎯 Campaign Creation
- Lock MOVE tokens on-chain when creating a bounty
- Set campaign title, description, and deadline
- Funds are secured in the contract (not withdraw-able)

### 💰 Reward Distribution
- Creator distributes rewards to winners
- Atomic transactions (all-or-nothing)
- Prevents double-payouts automatically
- Supports flexible distribution (fixed/variable amounts)

### 🔒 Security
- **Resource safety**: Move's type system prevents fund loss/duplication
- **Access control**: Only campaign creator can distribute
- **Double-claim prevention**: Users can't claim twice from same campaign
- **Atomic operations**: All distributions succeed or fail together

### 🔍 Transparency
- All actions emit on-chain events
- View functions for querying campaign state (gas-free)
- Complete audit trail on Movement blockchain

## Use Cases

✅ Bug bounties
✅ Hackathon prizes
✅ Content creator rewards
✅ Community challenges
✅ Developer incentives

## How It Works

```
1. Creator locks 1000 MOVE → Campaign created
2. Users submit work/bugs/content
3. Creator distributes rewards → Winners receive MOVE automatically
4. If no submissions → Creator can cancel & get refund
```

## Tech Stack

- **Blockchain**: Movement (MoveVM)
- **Language**: Move
- **Token**: Native MOVE
- **Framework**: AptosFramework v3.5.0
- **Patterns**: Based on deployed `layr::access` contract

## Deployment

```bash
movement move compile
movement move publish --named-addresses bounty_campaign=default
movement move run --function-id 'default::bounty_campaign::init'
```

## Integration

Frontend can interact via Movement wallet and AptosClient:
- Create campaigns
- Monitor via events
- Query campaign status
- Distribute rewards

## Files

- `bounty_campaign.move` - Main contract (425 lines)
- `DEPLOYMENT.md` - Movement deployment guide
- `README.md` - Full documentation
- `examples.md` - Usage examples

## Status

✅ **Production-ready** for Movement blockchain
✅ Aligned with Movement deployment patterns
✅ Complete documentation
✅ Ready for testnet deployment

---

**Questions?** See [README.md](file:///C:/Users/jayan/Desktop/Repo-Exchange/move_contracts/README.md) or [DEPLOYMENT.md](file:///C:/Users/jayan/Desktop/Repo-Exchange/move_contracts/DEPLOYMENT.md)
