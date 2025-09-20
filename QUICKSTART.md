# Quick Start Guide

Get started with the Agricultural Futures Trading Platform in 5 minutes.

## Setup (2 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your credentials
# Required: SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
```

## Development (1 minute)

### Compile and Test

```bash
# Compile contracts
npm run compile

# Run tests
npm test
```

## Local Deployment (1 minute)

### Start Local Network

```bash
# Terminal 1 - Start Hardhat node
npm run node
```

### Deploy and Interact

```bash
# Terminal 2 - Deploy to local network
npm run deploy:local

# Run interactive CLI
npm run interact:local
```

## Sepolia Deployment (1 minute)

### Deploy to Testnet

```bash
# Get Sepolia ETH from faucet:
# https://sepoliafaucet.com/

# Deploy contract
npm run deploy

# Verify on Etherscan
npm run verify

# Interact with deployed contract
npm run interact
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run test suite |
| `npm run deploy` | Deploy to Sepolia |
| `npm run verify` | Verify on Etherscan |
| `npm run interact` | Interactive CLI tool |
| `npm run simulate` | Run simulation |
| `npm run node` | Start local network |
| `npm run clean` | Clean build artifacts |

## What's Next?

1. **Explore the Contract**: Read `contracts/PrivateAgriculturalFutures.sol`
2. **Run Simulation**: Try `npm run simulate` to see full workflow
3. **Read Docs**: Check `DEPLOYMENT.md` for detailed guide
4. **Test Features**: Use `npm run interact` to test all functions

## Need Help?

- **Documentation**: See [README.md](./README.md) and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Test Examples**: Check `test/PrivateAgriculturalFutures.test.js`
- **Scripts**: Review files in `scripts/` directory

## Common Issues

### "Insufficient funds"
Get Sepolia ETH from [https://sepoliafaucet.com/](https://sepoliafaucet.com/)

### "Network not configured"
Check `.env` file has correct `SEPOLIA_RPC_URL`

### "Module not found"
Run `npm install` to install dependencies

### "Verification failed"
Ensure `ETHERSCAN_API_KEY` is set in `.env`

---

**Happy Coding! 🚀**
