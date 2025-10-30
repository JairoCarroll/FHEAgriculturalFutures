import { CropType } from './types';

export const CROP_NAMES: Record<CropType, string> = {
  [CropType.WHEAT]: 'Wheat',
  [CropType.RICE]: 'Rice',
  [CropType.CORN]: 'Corn',
  [CropType.SOYBEANS]: 'Soybeans',
  [CropType.COTTON]: 'Cotton',
};

export const CROP_EMOJIS: Record<CropType, string> = {
  [CropType.WHEAT]: '🌾',
  [CropType.RICE]: '🍚',
  [CropType.CORN]: '🌽',
  [CropType.SOYBEANS]: '🫘',
  [CropType.COTTON]: '🤍',
};

export const CROP_CLASSES: Record<CropType, string> = {
  [CropType.WHEAT]: 'wheat',
  [CropType.RICE]: 'rice',
  [CropType.CORN]: 'corn',
  [CropType.SOYBEANS]: 'soybeans',
  [CropType.COTTON]: 'cotton',
};

export const STATUS_CLASSES = {
  ACTIVE: 'status-active',
  SETTLED: 'status-settled',
  CANCELLED: 'status-cancelled',
};

export const STATUS_LABELS = {
  ACTIVE: 'Active',
  SETTLED: 'Settled',
  CANCELLED: 'Cancelled',
};

// Contract ABI - Update this with your deployed contract address
export const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with actual deployed address

export const CONTRACT_ABI = [
  'function createFuturesContract(address _seller, uint8 _cropType, uint32 _quantity, uint64 _pricePerTon) external',
  'function confirmContract(uint32 _contractId) external',
  'function settleContract(uint32 _contractId) external',
  'function cancelContract(uint32 _contractId, string memory _reason) external',
  'function depositBalance() external payable',
  'function getContractInfo(uint32 _contractId) external view returns (address buyer, address seller, uint8 cropType, uint256 settlementDate, uint8 status, bool buyerConfirmed, bool sellerConfirmed, uint256 creationTime)',
  'function getTraderInfo(address _trader) external view returns (uint32 activeContracts, uint256 totalTrades, bool isVerified)',
  'function getTraderContracts(address _trader) external view returns (uint32[] memory)',
  'function getMarketInfo(uint8 _cropType) external view returns (uint32 totalVolume, uint256 lastUpdated)',
  'event ContractCreated(uint32 indexed contractId, address indexed buyer, address indexed seller, uint8 cropType)',
  'event ContractConfirmed(uint32 indexed contractId, address indexed trader)',
  'event ContractSettled(uint32 indexed contractId, address indexed buyer, address indexed seller)',
  'event ContractCancelled(uint32 indexed contractId, string reason)',
  'event BalanceDeposited(address indexed trader, uint256 timestamp)',
];
