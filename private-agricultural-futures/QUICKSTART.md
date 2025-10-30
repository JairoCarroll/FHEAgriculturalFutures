# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- MetaMask browser extension
- Basic understanding of Ethereum and Web3

## Step 1: Install Dependencies

```bash
cd D:\fhevm-react-template\examples\private-agricultural-futures
npm install
```

## Step 2: Configure Smart Contract Address

### Option A: Using Environment Variable (Recommended)
1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and add your contract address:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddressHere
```

### Option B: Direct Configuration
Edit `src/lib/constants.ts`:
```typescript
export const CONTRACT_ADDRESS = '0xYourContractAddressHere';
```

## Step 3: Run Development Server

```bash
npm run dev
```

The application will start at http://localhost:3000

## Step 4: Connect Your Wallet

1. Open http://localhost:3000 in your browser
2. Click "Connect MetaMask Wallet"
3. Approve the connection in MetaMask popup
4. Ensure you're on the correct network (Sepolia testnet by default)

## Step 5: Try Creating a Contract

1. Fill in the form with:
   - **Seller Address**: Any Ethereum address different from yours
   - **Crop Type**: Select from dropdown (Wheat, Rice, Corn, Soybeans, Cotton)
   - **Quantity**: Number of tons (e.g., 100)
   - **Price per Ton**: Price in ETH (e.g., 0.001)

2. Click "Create Contract"
3. Confirm the transaction in MetaMask
4. Wait for transaction confirmation

## Step 6: View Your Contracts

Your newly created contracts will appear in the "My Contracts" section. You can:
- Confirm contracts (as buyer or seller)
- Settle contracts (when both parties confirm and settlement date arrives)
- Cancel unconfirmed contracts

## Troubleshooting

### Wallet Won't Connect
- Ensure MetaMask is installed
- Check that MetaMask is unlocked
- Refresh the page and try again

### Transaction Fails
- Check you have enough ETH for gas fees
- Verify contract address is correct
- Ensure you're on the correct network

### Contract Address Not Set
If you see errors about invalid contract address:
1. Check `src/lib/constants.ts` has the correct address
2. Or set `NEXT_PUBLIC_CONTRACT_ADDRESS` in `.env.local`
3. Restart the development server after changes

### Styles Not Loading
- Ensure Bootstrap is imported in layout.tsx
- Check globals.css is properly imported
- Clear browser cache and restart dev server

## Production Build

### Build the application:
```bash
npm run build
```

### Start production server:
```bash
npm start
```

### Deploy to Vercel:
```bash
npx vercel
```

## Smart Contract Deployment

If you need to deploy the smart contract:

1. Navigate to contracts directory
2. Use Hardhat or Remix to deploy `PrivateAgriculturalFutures.sol`
3. Update the contract address in your configuration
4. Restart the application

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Getting Test ETH

For Sepolia testnet:
- https://sepoliafaucet.com/
- https://faucet.sepolia.dev/

## Next Steps

1. Deposit some balance using the "Deposit Balance" button
2. Create a test contract with a friend's address
3. Have both parties confirm the contract
4. Experiment with settling and canceling contracts

## Support

If you encounter issues:
1. Check the CONVERSION_SUMMARY.md for detailed information
2. Review the README.md for architecture details
3. Check browser console for error messages
4. Verify MetaMask connection and network

## Security Note

This is a demonstration application. For production use:
- Conduct thorough security audits
- Use hardware wallets for large transactions
- Test extensively on testnets first
- Never share private keys or seed phrases
