# Deployment Guide

Complete guide for deploying and managing the Agricultural Futures Platform smart contract.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Verification](#verification)
- [Testing](#testing)
- [Contract Interaction](#contract-interaction)
- [Network Information](#network-information)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git**
- **MetaMask** wallet or similar Web3 wallet

### Required Accounts and Keys

1. **Ethereum Wallet**: Private key for deployment
2. **Alchemy/Infura Account**: RPC endpoint for Sepolia testnet
3. **Etherscan Account**: API key for contract verification
4. **Sepolia ETH**: For gas fees (get from faucets)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd agricultural-futures-platform
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Hardhat framework
- Ethers.js v6
- Testing utilities
- FHE libraries
- Development tools

## Configuration

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your credentials:

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Optional: Gas reporting
REPORT_GAS=true
COINMARKETCAP_API_KEY=your_coinmarketcap_key
```

### 3. Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file to version control
- Use a dedicated wallet for deployments
- Keep private keys secure
- Don't use mainnet keys on testnet

## Development Workflow

### Compile Contracts

```bash
npm run compile
```

This compiles all Solidity contracts in the `contracts/` directory.

### Run Local Node

```bash
npm run node
```

Starts a local Hardhat network node at `http://127.0.0.1:8545`.

### Run Tests

```bash
# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run with coverage
npm run test:coverage
```

### Lint and Format

```bash
# Lint Solidity files
npm run lint

# Format code
npm run format
```

## Deployment

### Deploy to Local Network

1. Start local node (in separate terminal):
```bash
npm run node
```

2. Deploy contract:
```bash
npm run deploy:local
```

### Deploy to Sepolia Testnet

1. Ensure you have Sepolia ETH in your wallet
   - Use [Alchemy Faucet](https://sepoliafaucet.com/)
   - Or [Infura Faucet](https://www.infura.io/faucet/sepolia)

2. Deploy contract:
```bash
npm run deploy
```

3. Expected output:
```
============================================================
Starting Agricultural Futures Platform Deployment
============================================================

Deploying to network: sepolia (Chain ID: 11155111)
Deployer address: 0x...
Deployer balance: 1.5 ETH

------------------------------------------------------------
Deploying PrivateAgriculturalFutures Contract...
------------------------------------------------------------

Estimating deployment gas...
Estimated gas: 2500000
Deploying contract...
Transaction hash: 0x...
Waiting for confirmations...

============================================================
✅ Deployment Successful!
============================================================
Contract address: 0x...
Deployment transaction: 0x...
Block number: 12345
Contract owner: 0x...
✓ Owner verification successful

Deployment info saved to: deployments/sepolia-1234567890.json
Latest deployment info: deployments/sepolia-latest.json

------------------------------------------------------------
Network Information
------------------------------------------------------------
Network: Sepolia Testnet
Block explorer: https://sepolia.etherscan.io/address/0x...

📝 Next Steps:
1. Verify the contract on Etherscan:
   npm run verify
2. Interact with the contract:
   npm run interact
```

### Deployment Files

After deployment, check the `deployments/` directory:
- `sepolia-latest.json`: Latest deployment information
- `sepolia-{timestamp}.json`: Historical deployment records

## Verification

Verify your contract on Etherscan after deployment:

```bash
npm run verify
```

Expected output:
```
============================================================
Contract Verification on Etherscan
============================================================

Network: sepolia (Chain ID: 11155111)
Contract address: 0x...
Deployer: 0x...
Transaction: 0x...

------------------------------------------------------------
Starting Verification Process...
------------------------------------------------------------

Verifying contract on Etherscan...
This may take a few moments...

Successfully submitted source code for contract verification
Successfully verified contract PrivateAgriculturalFutures

============================================================
✅ Verification Successful!
============================================================

Contract verified at:
https://sepolia.etherscan.io/address/0x...#code
```

### Manual Verification

If automatic verification fails:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

## Testing

### Run Test Suite

```bash
npm test
```

### Test Coverage

Generate coverage report:

```bash
npm run test:coverage
```

Coverage report will be available in `coverage/index.html`.

### Gas Usage Report

```bash
npm run test:gas
```

## Contract Interaction

### Interactive CLI

Launch the interactive CLI tool:

```bash
npm run interact
```

Available actions:
1. View contract information
2. Deposit balance
3. Create futures contract
4. Confirm contract
5. View my contracts
6. View trader profile
7. View market data
8. Settle contract
9. Cancel contract
10. Update market price (owner only)

### Simulation Mode

Run automated simulation on local network:

```bash
npm run simulate
```

This executes a complete workflow including:
- Contract deployment
- Trader deposits
- Contract creation
- Confirmations
- Market updates
- Cancellations

## Network Information

### Sepolia Testnet

| Parameter | Value |
|-----------|-------|
| Chain ID | 11155111 |
| Currency | SepoliaETH |
| RPC URL | https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY |
| Explorer | https://sepolia.etherscan.io |

### Getting Sepolia ETH

Faucets for Sepolia testnet:
- [Alchemy Faucet](https://sepoliafaucet.com/)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)
- [Chainlink Faucet](https://faucets.chain.link/sepolia)

## Deployed Contract Information

### Current Deployment (Sepolia)

```
Contract Address: 0x3aA0E7401D4992423A77390e529598e805196ba4
Network: Sepolia Testnet
Explorer: https://sepolia.etherscan.io/address/0x3aA0E7401D4992423A77390e529598e805196ba4
```

### Contract Features

- **FHE Encryption**: Sensitive data encrypted using Zama's fhEVM
- **Crop Types**: WHEAT, RICE, CORN, SOYBEANS, COTTON
- **Settlement Period**: 30 days
- **Auto-Verification**: Traders auto-verified on first interaction
- **Encrypted Fields**:
  - Quantities (euint32)
  - Prices (euint64)
  - Total values (euint64)
  - Trader balances (euint64)

## Troubleshooting

### Common Issues

#### 1. Deployment Fails

**Problem**: Transaction reverts or times out

**Solutions**:
- Check deployer balance: `npm run deploy` shows balance
- Increase gas limit in `hardhat.config.js`
- Verify RPC endpoint is working
- Check network congestion

#### 2. Verification Fails

**Problem**: Etherscan verification fails

**Solutions**:
- Verify ETHERSCAN_API_KEY is correct
- Wait a few blocks after deployment
- Try manual verification with exact constructor args
- Check compiler version matches (0.8.24)

#### 3. Insufficient Funds

**Problem**: "Insufficient funds for gas"

**Solutions**:
- Get more Sepolia ETH from faucets
- Check wallet address has ETH
- Verify PRIVATE_KEY is correct

#### 4. Connection Errors

**Problem**: Cannot connect to network

**Solutions**:
- Verify RPC URL is correct
- Check network status
- Try alternative RPC providers
- Check firewall/VPN settings

#### 5. FHE Library Errors

**Problem**: FHE import or compilation errors

**Solutions**:
- Ensure `@fhevm/solidity` is installed: `npm install`
- Check version compatibility
- Clear cache: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Getting Help

- **Documentation**: Check this file and README.md
- **Issues**: Create GitHub issue with error details
- **Hardhat Docs**: https://hardhat.org/docs
- **Zama fhEVM Docs**: https://docs.zama.ai/fhevm

## Advanced Configuration

### Custom Network

Add custom network in `hardhat.config.js`:

```javascript
networks: {
  customNetwork: {
    url: "https://rpc.custom-network.com",
    accounts: [process.env.PRIVATE_KEY],
    chainId: 12345,
  }
}
```

### Gas Optimization

Modify optimizer settings in `hardhat.config.js`:

```javascript
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200, // Increase for more optimized code
    },
  },
}
```

### Custom Tasks

Create Hardhat tasks in `hardhat.config.js`:

```javascript
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});
```

## Security Best Practices

1. **Private Keys**
   - Never share or commit private keys
   - Use hardware wallets for production
   - Separate development and production keys

2. **Smart Contract**
   - Audit code before mainnet deployment
   - Test extensively on testnet
   - Use multi-signature for owner functions
   - Implement upgrade mechanisms if needed

3. **Environment**
   - Keep dependencies updated
   - Use `.gitignore` for sensitive files
   - Regular security audits
   - Monitor deployed contracts

## Maintenance

### Update Dependencies

```bash
npm update
npm audit fix
```

### Clean Build Artifacts

```bash
npm run clean
```

### Backup Deployment Info

Regularly backup the `deployments/` directory containing deployment records.

## Next Steps

After successful deployment:

1. ✅ Verify contract on Etherscan
2. ✅ Test all functions with `npm run interact`
3. ✅ Document contract address
4. ✅ Set up monitoring/alerts
5. ✅ Create frontend integration
6. ✅ Perform security audit
7. ✅ Plan for production deployment

---

**Need Help?** Check the [README.md](./README.md) or create an issue on GitHub.
