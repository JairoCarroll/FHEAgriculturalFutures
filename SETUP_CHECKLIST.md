# Setup Checklist

Complete checklist for setting up and deploying the Agricultural Futures Trading Platform.

## ✅ Phase 1: Initial Setup

### Prerequisites
- [ ] Node.js v18+ installed
- [ ] npm v9+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] MetaMask wallet installed

### Installation
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Verify installation: `npx hardhat --version`

## ✅ Phase 2: Configuration

### Environment Setup
- [ ] Copy `.env.example` to `.env`
- [ ] Get Alchemy/Infura API key
- [ ] Add `SEPOLIA_RPC_URL` to `.env`
- [ ] Export wallet private key
- [ ] Add `PRIVATE_KEY` to `.env` (without 0x)
- [ ] Get Etherscan API key
- [ ] Add `ETHERSCAN_API_KEY` to `.env`

### Verification
- [ ] Check `.env` file is not tracked by git
- [ ] Verify all environment variables are set
- [ ] Test RPC connection

## ✅ Phase 3: Development

### Compilation
- [ ] Run `npm run compile`
- [ ] Verify artifacts are generated
- [ ] Check for compilation errors
- [ ] Review contract ABI

### Testing
- [ ] Run `npm test`
- [ ] Verify all 40+ tests pass
- [ ] Run `npm run test:coverage`
- [ ] Review coverage report
- [ ] Run `npm run test:gas`
- [ ] Check gas consumption

### Code Quality
- [ ] Run `npm run lint`
- [ ] Fix any linting errors
- [ ] Run `npm run format`
- [ ] Review formatted code

## ✅ Phase 4: Local Testing

### Local Network
- [ ] Start Hardhat node: `npm run node`
- [ ] Deploy to local: `npm run deploy:local`
- [ ] Verify deployment success
- [ ] Note contract address

### Simulation
- [ ] Run `npm run simulate`
- [ ] Verify all scenarios pass
- [ ] Check console output
- [ ] Review transaction logs

### Interaction
- [ ] Run `npm run interact:local`
- [ ] Test each menu option
- [ ] Create test contract
- [ ] Confirm contract
- [ ] View trader profile
- [ ] Check market data

## ✅ Phase 5: Testnet Preparation

### Get Testnet ETH
- [ ] Add Sepolia network to MetaMask
- [ ] Visit Alchemy faucet: https://sepoliafaucet.com/
- [ ] Request Sepolia ETH
- [ ] Verify balance in wallet
- [ ] Ensure at least 0.1 ETH for deployment

### Pre-deployment Checks
- [ ] Verify `.env` has Sepolia RPC
- [ ] Check private key is correct
- [ ] Confirm wallet has sufficient ETH
- [ ] Review contract code one final time
- [ ] Check compiler version (0.8.24)

## ✅ Phase 6: Testnet Deployment

### Deploy Contract
- [ ] Run `npm run deploy`
- [ ] Wait for deployment confirmation
- [ ] Copy contract address
- [ ] Save deployment transaction hash
- [ ] Check deployment on Sepolia Etherscan
- [ ] Verify deployment info saved in `deployments/`

### Verify Contract
- [ ] Run `npm run verify`
- [ ] Wait for verification confirmation
- [ ] Check verified contract on Etherscan
- [ ] Review contract source code
- [ ] Test "Read Contract" functions
- [ ] Test "Write Contract" functions

## ✅ Phase 7: Post-Deployment Testing

### Contract Interaction
- [ ] Run `npm run interact`
- [ ] Test deposit balance
- [ ] Create futures contract
- [ ] Confirm contract as seller
- [ ] View my contracts
- [ ] Check trader profile
- [ ] View market data
- [ ] Test cancel contract
- [ ] Update market price (as owner)

### Verification Tests
- [ ] Call contract functions via Etherscan
- [ ] Verify events are emitted
- [ ] Check transaction history
- [ ] Confirm gas usage is reasonable
- [ ] Test with multiple wallets
- [ ] Verify access controls work

## ✅ Phase 8: Documentation

### Update Documentation
- [ ] Update README.md with contract address
- [ ] Add deployment date
- [ ] Document any issues encountered
- [ ] Update network information
- [ ] Add screenshots if needed
- [ ] Update DEPLOYMENT.md with lessons learned

### Create Deployment Report
- [ ] Contract address
- [ ] Deployment transaction
- [ ] Block number
- [ ] Gas used
- [ ] Verification status
- [ ] Etherscan link
- [ ] Owner address
- [ ] Network details

## ✅ Phase 9: Security Review

### Security Checks
- [ ] Review access control functions
- [ ] Test emergency withdraw (owner only)
- [ ] Verify trader verification works
- [ ] Test self-trading prevention
- [ ] Check mutual confirmation requirement
- [ ] Test cancellation restrictions
- [ ] Verify FHE encryption is working
- [ ] Review ACL permissions

### Best Practices
- [ ] Private key stored securely
- [ ] `.env` file not committed
- [ ] Multi-signature considered for owner
- [ ] Emergency procedures documented
- [ ] Monitoring plan in place
- [ ] Backup of deployment info

## ✅ Phase 10: Maintenance

### Regular Tasks
- [ ] Monitor contract activity
- [ ] Check for failed transactions
- [ ] Update market prices regularly
- [ ] Review trader statistics
- [ ] Monitor gas prices
- [ ] Keep dependencies updated

### Documentation Maintenance
- [ ] Keep README.md current
- [ ] Update deployment records
- [ ] Document any issues
- [ ] Maintain changelog
- [ ] Update troubleshooting guide

## 🎯 Quick Reference

### Essential Commands
```bash
npm install              # Install dependencies
npm run compile          # Compile contracts
npm test                 # Run tests
npm run deploy           # Deploy to Sepolia
npm run verify           # Verify on Etherscan
npm run interact         # Interact with contract
```

### Essential Files
- `hardhat.config.js` - Configuration
- `.env` - Environment variables
- `contracts/PrivateAgriculturalFutures.sol` - Smart contract
- `scripts/deploy.js` - Deployment script
- `test/PrivateAgriculturalFutures.test.js` - Tests

### Essential Links
- Sepolia Faucet: https://sepoliafaucet.com/
- Etherscan: https://sepolia.etherscan.io
- Alchemy: https://www.alchemy.com/
- Hardhat Docs: https://hardhat.org/docs

## 📊 Success Criteria

### Development
- ✅ All tests pass
- ✅ Code coverage > 80%
- ✅ No linting errors
- ✅ Gas usage optimized

### Deployment
- ✅ Contract deployed successfully
- ✅ Contract verified on Etherscan
- ✅ All functions working
- ✅ Events emitting correctly

### Documentation
- ✅ README.md complete
- ✅ Deployment guide available
- ✅ Code commented
- ✅ API documented

### Security
- ✅ Access controls tested
- ✅ Emergency functions working
- ✅ No critical vulnerabilities
- ✅ Private keys secure

## 🚨 Troubleshooting

### Common Issues

**Problem**: npm install fails
- Solution: Delete `node_modules` and `package-lock.json`, run `npm install` again

**Problem**: Compilation errors
- Solution: Check Solidity version, verify imports, run `npm run clean`

**Problem**: Tests fail
- Solution: Check network connection, verify contract logic, review test assertions

**Problem**: Deployment fails
- Solution: Check wallet balance, verify RPC URL, increase gas limit

**Problem**: Verification fails
- Solution: Wait a few blocks, check API key, verify constructor arguments

**Problem**: Interaction fails
- Solution: Check network, verify contract address, ensure wallet connected

## 📞 Getting Help

- Check README.md
- Review DEPLOYMENT.md
- Read QUICKSTART.md
- Examine test files
- Review script files
- Check Hardhat documentation
- Search GitHub issues

---

**Good luck with your deployment! 🚀**
