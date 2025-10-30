# Getting Started with Private Agricultural Futures Platform

## Welcome! 👋

Your static HTML application has been successfully converted to a modern React/Next.js application. This guide will help you get started quickly.

## What You Got

✅ **Complete React Application** with TypeScript
✅ **5 Modular Components** (WalletConnect, CreateContract, TraderProfile, ContractsList, MarketData)
✅ **2 Custom Hooks** (useWallet, useContract)
✅ **Full Type Safety** with TypeScript interfaces
✅ **Original Design Preserved** (cyberpunk theme)
✅ **Comprehensive Documentation** (6 markdown files)

## Quick Start (5 Minutes)

### Step 1: Install Dependencies (1 minute)
```bash
cd D:\fhevm-react-template\examples\private-agricultural-futures
npm install
```

### Step 2: Configure Contract Address (1 minute)
Open `src/lib/constants.ts` and update line 43:
```typescript
export const CONTRACT_ADDRESS = '0xYourActualContractAddressHere';
```

**Important**: Replace `0x0000000000000000000000000000000000000000` with your deployed contract address!

### Step 3: Run the Application (1 minute)
```bash
npm run dev
```

### Step 4: Open in Browser (30 seconds)
Navigate to: http://localhost:3000

### Step 5: Connect Wallet (30 seconds)
1. Click "Connect MetaMask Wallet"
2. Approve the connection in MetaMask
3. Start using the application!

## First-Time Setup Checklist

### Prerequisites
- [ ] Node.js 18 or higher installed
- [ ] MetaMask browser extension installed
- [ ] Test ETH in your wallet (for gas fees)
- [ ] Smart contract deployed (or have the address)

### Configuration
- [ ] Ran `npm install`
- [ ] Updated `CONTRACT_ADDRESS` in `src/lib/constants.ts`
- [ ] (Optional) Created `.env.local` with contract address
- [ ] Verified MetaMask is on correct network

### Testing
- [ ] Application starts without errors
- [ ] Wallet connects successfully
- [ ] Balance displays correctly
- [ ] Can view trader profile
- [ ] Market data displays

## Directory Guide

### Important Files to Know

**Configuration**
- `package.json` - Dependencies and scripts
- `src/lib/constants.ts` - Contract address and ABI (⚠️ CONFIGURE THIS!)

**Main Application**
- `src/app/page.tsx` - Main page component
- `src/app/layout.tsx` - Root layout
- `src/app/globals.css` - All styles

**Components** (in `src/components/`)
- `WalletConnect.tsx` - Wallet connection UI
- `CreateContract.tsx` - Create new contracts
- `TraderProfile.tsx` - Your trading stats
- `ContractsList.tsx` - Manage your contracts
- `MarketData.tsx` - Market statistics

**Hooks** (in `src/hooks/`)
- `useWallet.ts` - Wallet management
- `useContract.ts` - Smart contract interactions

**Utilities** (in `src/lib/`)
- `types.ts` - TypeScript types
- `constants.ts` - App constants
- `utils.ts` - Helper functions

### Documentation Files

1. **GETTING_STARTED.md** (this file) - Quick start guide
2. **QUICKSTART.md** - Detailed setup instructions
3. **README.md** - Full project documentation
4. **PROJECT_SUMMARY.md** - Complete overview
5. **CONVERSION_SUMMARY.md** - Technical conversion details
6. **FILE_STRUCTURE.md** - File descriptions

## Common Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)

# Production
npm run build        # Build for production
npm start            # Run production server

# Utilities
npm run lint         # Check code quality
```

## How to Use the Application

### 1. Connect Your Wallet
- Click "Connect MetaMask Wallet"
- Approve in MetaMask
- Your address and balance will display

### 2. Deposit Balance (Optional)
- Enter amount in ETH
- Click "Deposit Balance"
- Confirm transaction in MetaMask
- Automatically verifies you as a trader

### 3. Create a Contract
- Enter seller's Ethereum address
- Select crop type (Wheat, Rice, Corn, Soybeans, Cotton)
- Enter quantity in tons
- Enter price per ton in ETH
- Click "Create Contract"
- Confirm transaction

### 4. Manage Contracts
- View all your contracts in "My Contracts" section
- Click "Confirm" to approve a contract (buyer/seller)
- Click "Settle Contract" when both parties confirm and date arrives
- Click "Cancel" to cancel unconfirmed contracts

### 5. View Market Data
- See total volumes for each crop type
- Data updates automatically after operations

## Troubleshooting

### Application Won't Start
```bash
# Check Node version (should be 18+)
node --version

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Try running again
npm run dev
```

### Wallet Won't Connect
- Ensure MetaMask is installed
- Check MetaMask is unlocked
- Refresh page and try again
- Check browser console for errors

### Contract Address Error
```
Error: invalid address
```
**Solution**: Update `CONTRACT_ADDRESS` in `src/lib/constants.ts`

### Transactions Fail
- Check you have enough ETH for gas
- Verify you're on correct network
- Ensure contract address is correct
- Check MetaMask transaction settings

### Styles Look Wrong
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### TypeScript Errors
```bash
# Check TypeScript version
npx tsc --version

# Reinstall types
npm install --save-dev @types/react @types/react-dom @types/node
```

## Environment Variables (Optional)

Instead of editing code, you can use environment variables:

1. Create `.env.local`:
```bash
cp .env.example .env.local
```

2. Edit `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourActualContractAddressHere
```

3. Restart dev server:
```bash
npm run dev
```

## Building for Production

### Local Production Build
```bash
# Build the application
npm run build

# Start production server
npm start

# Visit http://localhost:3000
```

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts
```

### Deploy to Netlify
```bash
# Build
npm run build

# Upload .next folder to Netlify
```

## Getting Help

### Check Documentation
1. Read **QUICKSTART.md** for detailed setup
2. Review **README.md** for features
3. Check **PROJECT_SUMMARY.md** for overview
4. See **FILE_STRUCTURE.md** for code details

### Debug Steps
1. Check browser console (F12) for errors
2. Verify contract address is configured
3. Ensure MetaMask is connected
4. Check you're on correct network
5. Verify Node.js version is 18+

### Common Issues
- **"Invalid address"** → Update CONTRACT_ADDRESS
- **"Cannot connect"** → Check MetaMask
- **"Out of gas"** → Add more ETH to wallet
- **"Network error"** → Switch to correct network
- **"Build failed"** → Check Node.js version

## Next Steps

### Immediate (< 1 hour)
1. ✅ Install dependencies
2. ✅ Configure contract address
3. ✅ Run development server
4. ✅ Connect wallet
5. ✅ Test basic functionality

### Short Term (1-3 days)
1. Test all features thoroughly
2. Create some test contracts
3. Verify settlements work
4. Check market data updates
5. Deploy to test environment

### Medium Term (1-2 weeks)
1. Deploy to production
2. Monitor for issues
3. Gather user feedback
4. Plan enhancements
5. Update documentation

## Feature Overview

### Implemented Features ✅
- Wallet connection (MetaMask)
- Balance tracking and display
- Contract creation with validation
- Trader profile and statistics
- Balance deposits
- Contract confirmation (buyer/seller)
- Contract settlement
- Contract cancellation
- Market data display
- Real-time updates
- Loading states
- Error handling

### Ready for Enhancement 🚀
- Toast notifications (vs alerts)
- Transaction history
- Advanced filtering
- Multi-wallet support
- Mobile optimization
- Unit tests
- E2E tests

## Configuration Summary

### Must Configure
```typescript
// src/lib/constants.ts
export const CONTRACT_ADDRESS = '0xYourAddress'; // ⚠️ REQUIRED
```

### Optional Configuration
```typescript
// src/lib/constants.ts
export const CROP_NAMES = { ... }     // Customize crop names
export const CROP_EMOJIS = { ... }    // Change crop icons
export const CONTRACT_ABI = [ ... ]   // Update ABI if needed
```

### Style Customization
```css
/* src/app/globals.css */
body {
  background: linear-gradient(...);   /* Change colors */
  color: #00ff88;                     /* Change text color */
}
```

## Success Indicators

You'll know everything is working when:
✅ Dev server starts without errors
✅ Page loads at localhost:3000
✅ Wallet connects successfully
✅ Balance displays correctly
✅ Form validation works
✅ Transactions can be created
✅ UI updates after operations
✅ No console errors

## Resources

### Documentation
- **QUICKSTART.md** - Detailed setup guide
- **README.md** - Complete documentation
- **PROJECT_SUMMARY.md** - Project overview

### Code
- **src/app/page.tsx** - Main application logic
- **src/components/** - UI components
- **src/hooks/** - Business logic hooks
- **src/lib/** - Types and utilities

### External
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [ethers.js Docs](https://docs.ethers.org/v5/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## Support Checklist

Before asking for help:
- [ ] Read GETTING_STARTED.md (this file)
- [ ] Read QUICKSTART.md
- [ ] Checked browser console for errors
- [ ] Verified contract address is set
- [ ] Confirmed MetaMask is connected
- [ ] Tried restarting dev server
- [ ] Cleared cache (.next folder)
- [ ] Reinstalled dependencies

## Final Checklist

Before going live:
- [ ] Contract address configured correctly
- [ ] Tested on testnet thoroughly
- [ ] All features work as expected
- [ ] No console errors
- [ ] Production build succeeds
- [ ] Deployed to staging environment
- [ ] Security audit completed (if needed)
- [ ] Backup of smart contract verified
- [ ] Documentation updated
- [ ] Team trained on usage

---

## 🎉 You're Ready!

Your application is fully set up and ready to use. Just:
1. Install dependencies (`npm install`)
2. Configure contract address
3. Run dev server (`npm run dev`)
4. Start trading!

**Need help?** Check the other documentation files or open the browser console for detailed error messages.

**Happy Trading!** 🌾
