# Enhanced Agricultural Futures Trading Platform - API Documentation

## 📖 Overview

This document provides comprehensive API documentation for the Enhanced Agricultural Futures Trading Platform, including all functions, events, and integration patterns for the new Gateway callback mode, refund mechanism, and timeout protection features.

## 🏗️ Smart Contract API

### Contract Address
- **Network**: Ethereum Sepolia Testnet
- **Address**: `0x3aA0E7401D4992423A77390e529598e805196ba4`
- **Chain ID**: 11155111

### Constants

```solidity
uint256 public constant DECRIPTION_TIMEOUT = 7 days;        // Gateway decryption timeout
uint256 public constant MAX_CONTRACT_VALUE = 1000 ether;     // Maximum contract value
uint256 public constant MIN_STAKE = 0.001 ether;             // Minimum platform stake
uint8 public constant SETTLEMENT_PERIOD = 30;               // Settlement period in days
```

### Enums

#### ContractStatus
```solidity
enum ContractStatus {
    ACTIVE,              // Contract created and active
    SETTLED,             // Successfully settled via Gateway
    CANCELLED,           // Cancelled before confirmation
    PENDING_DECRYPTION,  // Awaiting Gateway callback
    REFUNDED             // Timeout triggered, refund available
}
```

#### CropType
```solidity
enum CropType {
    WHEAT,       // Wheat futures
    RICE,        // Rice futures
    CORN,        // Corn futures
    SOYBEANS,    // Soybeans futures
    COTTON       // Cotton futures
}
```

## 🔄 Core Functions

### 1. Contract Management

#### `createFuturesContract`
Creates a new agricultural futures contract with enhanced security features.

```solidity
function createFuturesContract(
    address _seller,
    CropType _cropType,
    uint32 _quantity,
    uint64 _pricePerTon
) external payable minimumStake notZeroAddress(_seller) validContractValue(uint256(_quantity) * uint256(_pricePerTon))
```

**Parameters:**
- `_seller` (address): Address of the contract seller
- `_cropType` (CropType): Type of agricultural commodity
- `_quantity` (uint32): Quantity in tons (1 - 1,000,000)
- `_pricePerTon` (uint64): Price per ton in wei
- `msg.value` (uint256): Platform stake (minimum 0.001 ETH)

**Security Features:**
- ✅ Minimum stake validation
- ✅ Zero address protection
- ✅ Contract value limits
- ✅ Overflow protection
- ✅ Auto-verification for both parties

**Example:**
```javascript
// Create a wheat futures contract for 100 tons at 500 wei per ton
const tx = await contract.createFuturesContract(
    sellerAddress,
    0, // WHEAT
    100, // 100 tons
    500, // 500 wei per ton
    { value: ethers.parseEther("0.001") } // 0.001 ETH stake
);
```

#### `confirmContract`
Confirms participation in a futures contract.

```solidity
function confirmContract(uint32 _contractId) external onlyContractParty(_contractId)
```

**Parameters:**
- `_contractId` (uint32): ID of the contract to confirm

**Access Control:** Only contract parties (buyer/seller) can call

#### `settleContract`
Initiates settlement for a confirmed contract after the settlement period.

```solidity
function settleContract(uint32 _contractId) external onlyContractParty(_contractId)
```

**Parameters:**
- `_contractId` (uint32): ID of the contract to settle

**Requirements:**
- Contract must be active
- Settlement period must have passed
- Both parties must have confirmed

#### `cancelContract`
Cancels an unconfirmed contract.

```solidity
function cancelContract(uint32 _contractId, string memory _reason) external onlyContractParty(_contractId)
```

**Parameters:**
- `_contractId` (uint32): ID of the contract to cancel
- `_reason` (string): Reason for cancellation

**Requirements:**
- Contract must be active
- At least one party must not have confirmed

### 2. Enhanced Gateway Callback Mode Functions

#### `requestContractDecryption`
🆕 **NEW**: Requests Gateway decryption of encrypted contract data.

```solidity
function requestContractDecryption(uint32 _contractId) external onlyContractParty(_contractId)
```

**Parameters:**
- `_contractId` (uint32): ID of the contract for decryption

**Workflow:**
1. Validates contract state and timing
2. Prepares encrypted values (quantity, price, total value)
3. Submits decryption request to ZAMA Gateway
4. Sets timeout tracking (7 days)
5. Emits `DecryptionRequested` event

**Security Features:**
- ✅ Only contract parties can request
- ✅ Settlement period must have passed
- ✅ Prevents duplicate requests
- ✅ Automatic timeout protection

**Example:**
```javascript
// Request decryption after settlement period
const tx = await contract.requestContractDecryption(contractId);
const receipt = await tx.wait();

// Extract request ID from events
const decryptionEvent = receipt.events.find(e => e.event === 'DecryptionRequested');
const requestId = decryptionEvent.args.requestId;
const timeout = decryptionEvent.args.timeout;
```

#### `requestDecryptionWithFallback`
🆕 **NEW**: Enhanced function with automatic fallback handling.

```solidity
function requestDecryptionWithFallback(uint32 _contractId) external onlyContractParty(_contractId)
```

**Features:**
- Automatically requests decryption if not already requested
- Checks for timeout and triggers protection if needed
- One-stop function for settlement initiation

#### `gatewayDecryptionCallback`
🆕 **NEW**: Gateway callback function for processing decrypted results.

```solidity
function gatewayDecryptionCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
- `requestId` (uint256): Gateway request identifier
- `cleartexts` (bytes): Decrypted contract values
- `decryptionProof` (bytes): Cryptographic proof from Gateway

**Processing Steps:**
1. Verifies Gateway signatures and proofs
2. Decodes decrypted values (quantity, price, total value)
3. Validates decrypted data integrity
4. Updates contract status to SETTLED
5. Updates trader statistics
6. Emits completion events

**Note:** This function is called automatically by the ZAMA Gateway.

### 3. 🛡️ Timeout Protection & Refund Functions

#### `checkTimeoutProtection`
🆕 **NEW**: Triggers timeout protection for stuck decryption requests.

```solidity
function checkTimeoutProtection(uint32 _contractId) external
```

**Parameters:**
- `_contractId` (uint32): ID of the contract to check

**Requirements:**
- Contract must be in PENDING_DECRYPTION state
- Gateway callback must not have completed
- 7-day timeout period must have elapsed
- Timeout must not have been triggered already

**Effects:**
- Changes contract status to REFUNDED
- Marks contract as timed out
- Enables refund claiming for both parties

#### `claimTimeoutRefund`
🆕 **NEW**: Claims refund for contracts affected by timeout.

```solidity
function claimTimeoutRefund(uint32 _contractId) external onlyContractParty(_contractId)
```

**Parameters:**
- `_contractId` (uint32): ID of the contract to claim refund from

**Requirements:**
- Contract must be in REFUNDED state
- Timeout must have been triggered
- Refund must not have been claimed already

**Refund Distribution:**
- Stake amount is split equally between buyer and seller
- Refunds are transferred immediately
- Prevents double claiming with status tracking

**Example:**
```javascript
// Check if refund is available
const status = await contract.getContractStatus(contractId);
if (status.canClaimRefund) {
    // Claim the refund
    const tx = await contract.claimTimeoutRefund(contractId);
    await tx.wait();
    console.log("Refund claimed successfully");
}
```

### 4. Enhanced Query Functions

#### `getContractStatus`
🆕 **NEW**: Comprehensive contract status including enhanced features.

```solidity
function getContractStatus(uint32 _contractId) external view returns (
    ContractStatus status,
    bool hasPendingDecryption,
    uint256 decryptionRequestId,
    bool callbackCompleted,
    uint256 decryptionRequestTime,
    bool canClaimRefund,
    uint256 stakeAmount
)
```

**Returns:**
- `status`: Current contract status
- `hasPendingDecryption`: Whether decryption request exists
- `decryptionRequestId`: Gateway request ID
- `callbackCompleted`: Whether Gateway callback completed
- `decryptionRequestTime`: When decryption was requested
- `canClaimRefund`: Whether refund can be claimed
- `stakeAmount`: Platform stake amount

#### `getDecryptionRequestStatus`
🆕 **NEW**: Detailed status of Gateway decryption requests.

```solidity
function getDecryptionRequestStatus(uint256 _requestId) external view returns (
    bool exists,
    uint32 contractId,
    bool callbackCompleted,
    uint256 requestTime,
    bool isTimedOut
)
```

**Parameters:**
- `_requestId` (uint256): Gateway request ID to query

**Returns:**
- `exists`: Whether the request exists
- `contractId`: Associated contract ID
- `callbackCompleted`: Whether callback completed
- `requestTime`: When request was made
- `isTimedOut`: Whether timeout protection triggered

### 5. Existing Functions (Enhanced)

#### `depositBalance`
Deposit ETH to trader account with auto-verification.

```solidity
function depositBalance() external payable
```

**Enhancements:**
- Auto-verification on first deposit
- Encrypted balance management
- FHE permissions setup

#### `getContractInfo`
Get basic contract information.

```solidity
function getContractInfo(uint32 _contractId) external view returns (
    address buyer,
    address seller,
    CropType cropType,
    uint256 settlementDate,
    ContractStatus status,
    bool buyerConfirmed,
    bool sellerConfirmed,
    uint256 creationTime
)
```

#### `getTraderInfo`
Get trader profile information.

```solidity
function getTraderInfo(address _trader) external view returns (
    uint32 activeContracts,
    uint256 totalTrades,
    bool isVerified
)
```

## 📡 Event API

### 🆕 New Events for Enhanced Features

#### `DecryptionRequested`
```solidity
event DecryptionRequested(uint32 indexed contractId, uint256 requestId, uint256 timeout);
```

**Emitted when:**
- User requests Gateway decryption
- Provides timeout timestamp for monitoring

#### `GatewayCallbackCompleted`
```solidity
event GatewayCallbackCompleted(uint32 indexed contractId, uint256 requestId);
```

**Emitted when:**
- Gateway successfully completes decryption
- Contract settlement processing begins

#### `RefundProcessed`
```solidity
event RefundProcessed(uint32 indexed contractId, address indexed recipient, uint256 amount);
```

**Emitted when:**
- Timeout refund is processed
- Each party receives separate event

#### `TimeoutProtectionTriggered`
```solidity
event TimeoutProtectionTriggered(uint32 indexed contractId, uint256 timeoutTimestamp);
```

**Emitted when:**
- Timeout protection is triggered
- Refunds become available

### Existing Events
```solidity
event ContractCreated(uint32 indexed contractId, address indexed buyer, address indexed seller, CropType cropType);
event ContractConfirmed(uint32 indexed contractId, address indexed trader);
event ContractSettled(uint32 indexed contractId, address indexed buyer, address indexed seller);
event ContractCancelled(uint32 indexed contractId, string reason);
event MarketDataUpdated(CropType indexed cropType, uint256 timestamp);
event BalanceDeposited(address indexed trader, uint256 timestamp);
```

## 🔌 Integration Examples

### 1. Complete Contract Lifecycle

```javascript
// 1. Create contract
const createTx = await contract.createFuturesContract(
    sellerAddress,
    0, // WHEAT
    100, // 100 tons
    ethers.parseEther("0.5"), // 0.5 ETH per ton
    { value: ethers.parseEther("0.001") } // 0.001 ETH stake
);
const createReceipt = await createTx.wait();
const contractId = createReceipt.events[0].args.contractId;

// 2. Wait for seller confirmation (from seller account)
await contract.connect(seller).confirmContract(contractId);

// 3. Wait for settlement period (30 days in production)
// 4. Request decryption with fallback
const decryptTx = await contract.requestDecryptionWithFallback(contractId);
await decryptTx.wait();

// 5. Monitor Gateway callback
contract.on('GatewayCallbackCompleted', (contractId, requestId) => {
    console.log(`Contract ${contractId} settled successfully`);
});

// 6. Handle timeout case
contract.on('TimeoutProtectionTriggered', async (contractId, timeoutTimestamp) => {
    console.log(`Contract ${contractId} timed out, refunds available`);

    // Claim refund
    const refundTx = await contract.claimTimeoutRefund(contractId);
    await refundTx.wait();
    console.log('Refund claimed successfully');
});
```

### 2. Status Monitoring

```javascript
async function monitorContract(contractId) {
    const status = await contract.getContractStatus(contractId);

    console.log(`Contract ${contractId} Status:`);
    console.log(`- Status: ${status.status}`);
    console.log(`- Pending Decryption: ${status.hasPendingDecryption}`);
    console.log(`- Request ID: ${status.decryptionRequestId}`);
    console.log(`- Callback Completed: ${status.callbackCompleted}`);
    console.log(`- Can Claim Refund: ${status.canClaimRefund}`);
    console.log(`- Stake Amount: ${ethers.formatEther(status.stakeAmount)} ETH`);

    // Provide user guidance
    if (status.status === 0) { // ACTIVE
        if (Date.now() / 1000 > settlementDate) {
            console.log("✅ Settlement period reached, you can request decryption");
        } else {
            console.log(`⏳ Settlement period: ${new Date(settlementDate * 1000)}`);
        }
    } else if (status.status === 3) { // PENDING_DECRYPTION
        const timeRemaining = status.decryptionRequestTime + 7 * 24 * 60 * 60 - Date.now() / 1000;
        if (timeRemaining > 0) {
            console.log(`⏳ Decryption timeout: ${Math.floor(timeRemaining / 3600)} hours remaining`);
        } else {
            console.log("⚠️ Decryption timeout reached, you can claim refund");
        }
    } else if (status.canClaimRefund) {
        console.log("💰 Refund available for claim");
    }
}
```

### 3. Error Handling

```javascript
async function handleContractOperation(contractId, operation) {
    try {
        const result = await operation();
        return result;
    } catch (error) {
        // Handle specific error cases
        if (error.message.includes("Contract not active")) {
            console.log("❌ Contract is no longer active");
            const status = await contract.getContractStatus(contractId);
            if (status.canClaimRefund) {
                console.log("💰 Refund is available");
            }
        } else if (error.message.includes("Not a contract party")) {
            console.log("❌ You are not authorized to perform this operation");
        } else if (error.message.includes("Timeout not reached")) {
            console.log("⏳ Decryption timeout period not yet reached");
        } else {
            console.log("❌ Error:", error.message);
        }
        throw error;
    }
}

// Usage
await handleContractOperation(contractId, () =>
    contract.settleContract(contractId)
);
```

### 4. Frontend Integration

```typescript
// React Hook for contract status
export function useContractStatus(contractId: string | null) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const contract = useContract();

    useEffect(() => {
        if (!contractId || !contract) return;

        const fetchStatus = async () => {
            setLoading(true);
            try {
                const contractStatus = await contract.getContractStatus(contractId);
                setStatus(contractStatus);
            } catch (error) {
                console.error('Failed to fetch contract status:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();

        // Set up event listeners
        const handleDecryptionRequested = (id: string, requestId: string, timeout: string) => {
            if (id === contractId) {
                fetchStatus(); // Refresh status
            }
        };

        const handleGatewayCallbackCompleted = (id: string, requestId: string) => {
            if (id === contractId) {
                fetchStatus(); // Refresh status
            }
        };

        const handleTimeoutProtectionTriggered = (id: string, timeoutTimestamp: string) => {
            if (id === contractId) {
                fetchStatus(); // Refresh status
                showNotification('Timeout protection triggered, refunds available', 'warning');
            }
        };

        contract.on('DecryptionRequested', handleDecryptionRequested);
        contract.on('GatewayCallbackCompleted', handleGatewayCallbackCompleted);
        contract.on('TimeoutProtectionTriggered', handleTimeoutProtectionTriggered);

        return () => {
            contract.off('DecryptionRequested', handleDecryptionRequested);
            contract.off('GatewayCallbackCompleted', handleGatewayCallbackCompleted);
            contract.off('TimeoutProtectionTriggered', handleTimeoutProtectionTriggered);
        };
    }, [contractId, contract]);

    return { status, loading };
}
```

## 🛡️ Security Best Practices

### 1. Input Validation
- Always validate contract parameters before submission
- Check quantity limits and price ranges
- Verify address formats and permissions

### 2. Error Handling
- Implement comprehensive error handling
- Provide clear user feedback
- Handle timeout scenarios gracefully

### 3. Event Monitoring
- Monitor contract events for status updates
- Implement automated timeout checking
- Set up alerts for important events

### 4. Gas Optimization
- Batch operations when possible
- Use efficient view functions for status checks
- Optimize event subscriptions

## 🔍 Troubleshooting

### Common Issues

#### 1. Decryption Request Fails
**Solution:** Check contract status and settlement period
```javascript
const status = await contract.getContractStatus(contractId);
if (status.status !== 0) { // Not ACTIVE
    console.log("Contract not in active state");
}
```

#### 2. Refund Not Available
**Solution:** Verify timeout conditions
```javascript
const status = await contract.getContractStatus(contractId);
if (!status.canClaimRefund) {
    console.log("Refund not yet available");
    // Check timeout status
    const requestStatus = await contract.getDecryptionRequestStatus(status.decryptionRequestId);
    if (!requestStatus.isTimedOut) {
        console.log("Timeout period not reached");
    }
}
```

#### 3. Gateway Callback Not Received
**Solution:** Monitor timeout and trigger protection
```javascript
const status = await contract.getContractStatus(contractId);
if (status.hasPendingDecryption && !status.callbackCompleted) {
    const timeElapsed = Date.now() / 1000 - status.decryptionRequestTime;
    if (timeElapsed > 7 * 24 * 60 * 60) { // 7 days
        await contract.checkTimeoutProtection(contractId);
        await contract.claimTimeoutRefund(contractId);
    }
}
```

---

**This enhanced API provides comprehensive functionality for confidential agricultural futures trading with robust error handling, timeout protection, and user-friendly refund mechanisms.**