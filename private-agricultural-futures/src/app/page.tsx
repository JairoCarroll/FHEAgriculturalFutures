'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContract } from '@/hooks/useContract';
import WalletConnect from '@/components/WalletConnect';
import CreateContract from '@/components/CreateContract';
import TraderProfile from '@/components/TraderProfile';
import ContractsList from '@/components/ContractsList';
import MarketData from '@/components/MarketData';
import { CropType, FuturesContract, TraderProfile as TraderProfileType, MarketData as MarketDataType } from '@/lib/types';

export default function Home() {
  const { address, balance, isConnected, connectWallet, signer, updateBalance } = useWallet();
  const {
    createContract,
    depositBalance,
    confirmContract,
    settleContract,
    cancelContract,
    getTraderInfo,
    getTraderContracts,
    getContractInfo,
    getMarketInfo,
    loading,
    error,
  } = useContract(signer, address);

  const [traderProfile, setTraderProfile] = useState<TraderProfileType | null>(null);
  const [contracts, setContracts] = useState<FuturesContract[]>([]);
  const [marketData, setMarketData] = useState<Record<CropType, MarketDataType | null>>({
    [CropType.WHEAT]: null,
    [CropType.RICE]: null,
    [CropType.CORN]: null,
    [CropType.SOYBEANS]: null,
    [CropType.COTTON]: null,
  });

  // Fetch trader profile
  const fetchTraderProfile = async () => {
    if (!address) return;
    const profile = await getTraderInfo(address);
    if (profile) {
      setTraderProfile(profile);
    }
  };

  // Fetch contracts
  const fetchContracts = async () => {
    if (!address) return;
    const contractIds = await getTraderContracts(address);
    const contractPromises = contractIds.map((id) => getContractInfo(id));
    const contractsData = await Promise.all(contractPromises);
    setContracts(contractsData.filter((c) => c !== null) as FuturesContract[]);
  };

  // Fetch market data
  const fetchMarketData = async () => {
    const cropTypes = [CropType.WHEAT, CropType.RICE, CropType.CORN, CropType.SOYBEANS, CropType.COTTON];
    const marketPromises = cropTypes.map((cropType) => getMarketInfo(cropType));
    const marketDataArray = await Promise.all(marketPromises);

    const newMarketData: Record<CropType, MarketDataType | null> = {
      [CropType.WHEAT]: marketDataArray[0],
      [CropType.RICE]: marketDataArray[1],
      [CropType.CORN]: marketDataArray[2],
      [CropType.SOYBEANS]: marketDataArray[3],
      [CropType.COTTON]: marketDataArray[4],
    };

    setMarketData(newMarketData);
  };

  // Fetch all data
  const fetchAllData = async () => {
    await Promise.all([fetchTraderProfile(), fetchContracts(), fetchMarketData()]);
  };

  // Load data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchAllData();
    }
  }, [isConnected, address]);

  // Handle create contract
  const handleCreateContract = async (
    sellerAddress: string,
    cropType: CropType,
    quantity: number,
    pricePerTon: string
  ) => {
    if (sellerAddress.toLowerCase() === address?.toLowerCase()) {
      alert('Cannot trade with yourself!');
      return;
    }

    const tx = await createContract(sellerAddress, cropType, quantity, pricePerTon);
    if (tx) {
      alert('Contract created successfully!');
      await fetchAllData();
      await updateBalance();
    } else {
      alert('Failed to create contract. Check console for details.');
    }
  };

  // Handle deposit
  const handleDeposit = async (amount: string) => {
    const tx = await depositBalance(amount);
    if (tx) {
      alert('Balance deposited successfully!');
      await fetchTraderProfile();
      await updateBalance();
    } else {
      alert('Failed to deposit balance. Check console for details.');
    }
  };

  // Handle confirm contract
  const handleConfirmContract = async (contractId: number) => {
    const tx = await confirmContract(contractId);
    if (tx) {
      alert('Contract confirmed successfully!');
      await fetchAllData();
    } else {
      alert('Failed to confirm contract. Check console for details.');
    }
  };

  // Handle settle contract
  const handleSettleContract = async (contractId: number) => {
    const tx = await settleContract(contractId);
    if (tx) {
      alert('Contract settled successfully!');
      await fetchAllData();
    } else {
      alert('Failed to settle contract. Check console for details.');
    }
  };

  // Handle cancel contract
  const handleCancelContract = async (contractId: number, reason: string) => {
    const tx = await cancelContract(contractId, reason);
    if (tx) {
      alert('Contract cancelled successfully!');
      await fetchAllData();
    } else {
      alert('Failed to cancel contract. Check console for details.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🌾 Private Agricultural Futures Platform</h1>
        <p className="lead">Secure and private agricultural commodity trading with homomorphic encryption</p>
        <div id="connectionStatus" className={`alert ${isConnected ? 'alert-success' : 'alert-warning'}`}>
          <strong>
            {isConnected ? 'Wallet connected! You can now start trading.' : 'Connect your wallet to start trading'}
          </strong>
        </div>
      </div>

      {/* Wallet Connection */}
      <WalletConnect
        address={address}
        balance={balance}
        isConnected={isConnected}
        onConnect={connectWallet}
      />

      {/* Contract Interaction Section */}
      {isConnected && (
        <div id="contractSection">
          <div className="row">
            {/* Create New Contract */}
            <div className="col-md-6">
              <CreateContract onCreateContract={handleCreateContract} loading={loading} />
            </div>

            {/* Trader Profile */}
            <div className="col-md-6">
              <TraderProfile profile={traderProfile} onDeposit={handleDeposit} loading={loading} />
            </div>
          </div>

          {/* My Contracts */}
          <ContractsList
            contracts={contracts}
            currentAddress={address}
            onRefresh={fetchContracts}
            onConfirm={handleConfirmContract}
            onSettle={handleSettleContract}
            onCancel={handleCancelContract}
            loading={loading}
          />

          {/* Market Data */}
          <MarketData marketData={marketData} />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="alert alert-danger mt-3">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
