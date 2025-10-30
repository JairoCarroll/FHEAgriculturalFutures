# Private Agricultural Futures Platform

A secure and private agricultural commodity trading platform built with React, Next.js, and homomorphic encryption (FHE).

## Features

- **Wallet Integration**: Connect with MetaMask to interact with the platform
- **Create Futures Contracts**: Create agricultural futures contracts for various crops (Wheat, Rice, Corn, Soybeans, Cotton)
- **Trader Profile**: View your trading statistics and deposit balances
- **Contract Management**: Confirm, settle, or cancel contracts
- **Market Data**: View real-time market statistics for different crops
- **Private Trading**: Utilizes homomorphic encryption to keep sensitive data private

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Bootstrap 5, Custom CSS
- **Blockchain**: Ethereum, ethers.js v5
- **Smart Contracts**: Solidity with fhEVM (Fully Homomorphic Encryption)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MetaMask browser extension
- Access to a blockchain network with fhEVM support

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Copy `.env.example` to `.env.local` and update with your contract address:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

4. Update the contract address in `src/lib/constants.ts`:

```typescript
export const CONTRACT_ADDRESS = 'your_deployed_contract_address';
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
private-agricultural-futures/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout component
│   │   ├── page.tsx            # Main page component
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── WalletConnect.tsx   # Wallet connection component
│   │   ├── CreateContract.tsx  # Contract creation form
│   │   ├── TraderProfile.tsx   # Trader profile display
│   │   ├── ContractsList.tsx   # List of user contracts
│   │   └── MarketData.tsx      # Market statistics
│   ├── hooks/
│   │   ├── useWallet.ts        # Wallet connection hook
│   │   └── useContract.ts      # Smart contract interaction hook
│   └── lib/
│       ├── types.ts            # TypeScript type definitions
│       ├── constants.ts        # Application constants
│       └── utils.ts            # Utility functions
├── contracts/
│   └── PrivateAgriculturalFutures.sol  # Smart contract
├── public/                     # Static assets
├── package.json
├── tsconfig.json
└── next.config.js
```

## Usage

### Connecting Your Wallet

1. Click "Connect MetaMask Wallet" button
2. Approve the connection in MetaMask
3. Your address and balance will be displayed

### Creating a Contract

1. Enter the seller's Ethereum address (must be different from yours)
2. Select the crop type
3. Enter quantity in tons
4. Enter price per ton in ETH
5. Click "Create Contract"
6. Confirm the transaction in MetaMask

### Managing Contracts

- **Confirm**: Both buyer and seller must confirm the contract
- **Settle**: Once both parties confirm and settlement date is reached, settle the contract
- **Cancel**: Cancel unconfirmed contracts with a reason

### Depositing Balance

1. Enter the amount in ETH in the deposit field
2. Click "Deposit Balance"
3. Confirm the transaction in MetaMask

## Smart Contract

The platform uses the `PrivateAgriculturalFutures.sol` smart contract which leverages fhEVM for private data handling:

- **Encrypted Data**: Quantities, prices, and balances are encrypted using homomorphic encryption
- **Private Trading**: Contract details remain private between parties
- **Secure Settlement**: Automated settlement process after confirmation from both parties

## Security Features

- Homomorphic encryption for sensitive data
- Wallet-based authentication
- Smart contract-enforced trading rules
- Private balance management

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue in the repository.
