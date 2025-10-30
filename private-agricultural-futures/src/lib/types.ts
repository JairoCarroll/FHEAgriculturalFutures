export enum CropType {
  WHEAT = 0,
  RICE = 1,
  CORN = 2,
  SOYBEANS = 3,
  COTTON = 4,
}

export enum ContractStatus {
  ACTIVE = 0,
  SETTLED = 1,
  CANCELLED = 2,
}

export interface FuturesContract {
  contractId: number;
  buyer: string;
  seller: string;
  cropType: CropType;
  settlementDate: number;
  status: ContractStatus;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  creationTime: number;
}

export interface TraderProfile {
  activeContracts: number;
  totalTrades: number;
  isVerified: boolean;
}

export interface MarketData {
  totalVolume: number;
  lastUpdated: number;
}

export interface WalletState {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
}
