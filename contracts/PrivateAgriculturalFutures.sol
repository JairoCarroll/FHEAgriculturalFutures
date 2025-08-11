// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint64, euint32, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateAgriculturalFutures is SepoliaConfig {

    address public owner;
    uint32 public nextContractId;
    uint8 public constant SETTLEMENT_PERIOD = 30; // days

    enum ContractStatus { ACTIVE, SETTLED, CANCELLED }
    enum CropType { WHEAT, RICE, CORN, SOYBEANS, COTTON }

    struct FuturesContract {
        uint32 contractId;
        address buyer;
        address seller;
        CropType cropType;
        euint32 encryptedQuantity; // tons, encrypted
        euint64 encryptedPrice; // price per ton in wei, encrypted
        euint64 encryptedTotalValue; // total contract value, encrypted
        uint256 settlementDate;
        ContractStatus status;
        bool buyerConfirmed;
        bool sellerConfirmed;
        uint256 creationTime;
    }

    struct TraderProfile {
        euint64 encryptedBalance; // encrypted balance
        uint32 activeContracts;
        uint256 totalTrades;
        bool isVerified;
    }

    struct MarketData {
        CropType cropType;
        euint64 encryptedAvgPrice; // encrypted average market price
        uint32 totalVolume;
        uint256 lastUpdated;
    }

    mapping(uint32 => FuturesContract) public futuresContracts;
    mapping(address => TraderProfile) public traders;
    mapping(CropType => MarketData) public marketData;
    mapping(address => uint32[]) public traderContracts;

    event ContractCreated(uint32 indexed contractId, address indexed buyer, address indexed seller, CropType cropType);
    event ContractConfirmed(uint32 indexed contractId, address indexed trader);
    event ContractSettled(uint32 indexed contractId, address indexed buyer, address indexed seller);
    event ContractCancelled(uint32 indexed contractId, string reason);
    event MarketDataUpdated(CropType indexed cropType, uint256 timestamp);
    event BalanceDeposited(address indexed trader, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier onlyVerifiedTrader() {
        require(traders[msg.sender].isVerified, "Trader not verified");
        _;
    }

    modifier onlyContractParty(uint32 _contractId) {
        FuturesContract storage futuresContract = futuresContracts[_contractId];
        require(
            msg.sender == futuresContract.buyer || msg.sender == futuresContract.seller,
            "Not a contract party"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        nextContractId = 1;

        // Initialize trader profile for owner
        traders[owner].isVerified = true;

        // Initialize market data for all crop types
        _initializeMarketData();
    }

    function _initializeMarketData() private {
        for (uint8 i = 0; i < 5; i++) {
            CropType crop = CropType(i);
            marketData[crop] = MarketData({
                cropType: crop,
                encryptedAvgPrice: FHE.asEuint64(uint64(1000000000000000000)), // 1 ETH as initial price
                totalVolume: 0,
                lastUpdated: block.timestamp
            });

            // Allow contract to access the encrypted price
            FHE.allowThis(marketData[crop].encryptedAvgPrice);
        }
    }

    function verifyTrader(address _trader) external onlyOwner {
        traders[_trader].isVerified = true;
    }

    function depositBalance() external payable {
        require(msg.value > 0, "Must deposit some ETH");

        // Auto-verify trader on first deposit
        if (!traders[msg.sender].isVerified) {
            traders[msg.sender].isVerified = true;
        }

        // Get current encrypted balance or initialize if first deposit
        euint64 currentBalance = traders[msg.sender].encryptedBalance;
        if (traders[msg.sender].totalTrades == 0) {
            currentBalance = FHE.asEuint64(uint64(0));
        }

        // Add new deposit to encrypted balance
        euint64 depositAmount = FHE.asEuint64(uint64(msg.value));
        euint64 newBalance = FHE.add(currentBalance, depositAmount);

        traders[msg.sender].encryptedBalance = newBalance;

        // Allow trader and contract to access their balance
        FHE.allowThis(newBalance);
        FHE.allow(newBalance, msg.sender);

        emit BalanceDeposited(msg.sender, block.timestamp);
    }

    function createFuturesContract(
        address _seller,
        CropType _cropType,
        uint32 _quantity,
        uint64 _pricePerTon
    ) external {
        require(_seller != msg.sender, "Cannot trade with yourself");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_pricePerTon > 0, "Price must be greater than 0");

        // Auto-verify both buyer and seller
        if (!traders[msg.sender].isVerified) {
            traders[msg.sender].isVerified = true;
        }
        if (!traders[_seller].isVerified) {
            traders[_seller].isVerified = true;
        }

        // Encrypt sensitive contract data
        euint32 encryptedQuantity = FHE.asEuint32(uint32(_quantity));
        euint64 encryptedPrice = FHE.asEuint64(uint64(_pricePerTon));
        euint64 encryptedTotalValue = FHE.mul(
            FHE.asEuint64(uint64(_quantity)),
            encryptedPrice
        );

        uint32 contractId = nextContractId++;

        futuresContracts[contractId] = FuturesContract({
            contractId: contractId,
            buyer: msg.sender,
            seller: _seller,
            cropType: _cropType,
            encryptedQuantity: encryptedQuantity,
            encryptedPrice: encryptedPrice,
            encryptedTotalValue: encryptedTotalValue,
            settlementDate: block.timestamp + (SETTLEMENT_PERIOD * 1 days),
            status: ContractStatus.ACTIVE,
            buyerConfirmed: true, // Creator automatically confirms
            sellerConfirmed: false,
            creationTime: block.timestamp
        });

        // Set ACL permissions
        FHE.allowThis(encryptedQuantity);
        FHE.allowThis(encryptedPrice);
        FHE.allowThis(encryptedTotalValue);
        FHE.allow(encryptedQuantity, msg.sender);
        FHE.allow(encryptedQuantity, _seller);
        FHE.allow(encryptedPrice, msg.sender);
        FHE.allow(encryptedPrice, _seller);
        FHE.allow(encryptedTotalValue, msg.sender);
        FHE.allow(encryptedTotalValue, _seller);

        // Add to trader's contract list
        traderContracts[msg.sender].push(contractId);
        traderContracts[_seller].push(contractId);

        // Update trader stats
        traders[msg.sender].activeContracts++;
        traders[_seller].activeContracts++;

        emit ContractCreated(contractId, msg.sender, _seller, _cropType);
    }

    function confirmContract(uint32 _contractId) external onlyContractParty(_contractId) {
        FuturesContract storage futuresContract = futuresContracts[_contractId];
        require(futuresContract.status == ContractStatus.ACTIVE, "Contract not active");

        if (msg.sender == futuresContract.buyer) {
            futuresContract.buyerConfirmed = true;
        } else if (msg.sender == futuresContract.seller) {
            futuresContract.sellerConfirmed = true;
        }

        emit ContractConfirmed(_contractId, msg.sender);

        // Check if both parties have confirmed and auto-settle if ready
        if (futuresContract.buyerConfirmed && futuresContract.sellerConfirmed) {
            if (block.timestamp >= futuresContract.settlementDate) {
                _settleContract(_contractId);
            }
        }
    }

    function settleContract(uint32 _contractId) external onlyContractParty(_contractId) {
        FuturesContract storage futuresContract = futuresContracts[_contractId];
        require(futuresContract.status == ContractStatus.ACTIVE, "Contract not active");
        require(block.timestamp >= futuresContract.settlementDate, "Settlement period not reached");
        require(
            futuresContract.buyerConfirmed && futuresContract.sellerConfirmed,
            "Both parties must confirm"
        );

        _settleContract(_contractId);
    }

    function _settleContract(uint32 _contractId) private {
        FuturesContract storage futuresContract = futuresContracts[_contractId];

        // Update contract status
        futuresContract.status = ContractStatus.SETTLED;

        // Update trader stats
        traders[futuresContract.buyer].activeContracts--;
        traders[futuresContract.buyer].totalTrades++;
        traders[futuresContract.seller].activeContracts--;
        traders[futuresContract.seller].totalTrades++;

        // Update market data (simplified - in practice would use oracles)
        MarketData storage market = marketData[futuresContract.cropType];
        market.totalVolume++;
        market.lastUpdated = block.timestamp;

        emit ContractSettled(_contractId, futuresContract.buyer, futuresContract.seller);
    }

    function cancelContract(uint32 _contractId, string memory _reason)
        external
        onlyContractParty(_contractId)
    {
        FuturesContract storage futuresContract = futuresContracts[_contractId];
        require(futuresContract.status == ContractStatus.ACTIVE, "Contract not active");
        require(
            !futuresContract.buyerConfirmed || !futuresContract.sellerConfirmed,
            "Cannot cancel confirmed contract"
        );

        futuresContract.status = ContractStatus.CANCELLED;

        // Update trader stats
        traders[futuresContract.buyer].activeContracts--;
        traders[futuresContract.seller].activeContracts--;

        emit ContractCancelled(_contractId, _reason);
    }

    function updateMarketPrice(CropType _cropType, uint64 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Price must be greater than 0");

        euint64 encryptedNewPrice = FHE.asEuint64(uint64(_newPrice));
        marketData[_cropType].encryptedAvgPrice = encryptedNewPrice;
        marketData[_cropType].lastUpdated = block.timestamp;

        FHE.allowThis(encryptedNewPrice);

        emit MarketDataUpdated(_cropType, block.timestamp);
    }

    function getContractInfo(uint32 _contractId) external view returns (
        address buyer,
        address seller,
        CropType cropType,
        uint256 settlementDate,
        ContractStatus status,
        bool buyerConfirmed,
        bool sellerConfirmed,
        uint256 creationTime
    ) {
        FuturesContract storage futuresContract = futuresContracts[_contractId];
        return (
            futuresContract.buyer,
            futuresContract.seller,
            futuresContract.cropType,
            futuresContract.settlementDate,
            futuresContract.status,
            futuresContract.buyerConfirmed,
            futuresContract.sellerConfirmed,
            futuresContract.creationTime
        );
    }

    function getTraderInfo(address _trader) external view returns (
        uint32 activeContracts,
        uint256 totalTrades,
        bool isVerified
    ) {
        TraderProfile storage trader = traders[_trader];
        return (
            trader.activeContracts,
            trader.totalTrades,
            trader.isVerified
        );
    }

    function getTraderContracts(address _trader) external view returns (uint32[] memory) {
        return traderContracts[_trader];
    }

    function getMarketInfo(CropType _cropType) external view returns (
        uint32 totalVolume,
        uint256 lastUpdated
    ) {
        MarketData storage market = marketData[_cropType];
        return (
            market.totalVolume,
            market.lastUpdated
        );
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function pauseContract() external onlyOwner {
        // Implementation for pausing contract operations
        // This would typically involve a paused state variable
    }
}