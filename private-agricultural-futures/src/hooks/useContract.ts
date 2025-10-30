'use client';

import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/constants';
import { FuturesContract, TraderProfile, MarketData, CropType } from '@/lib/types';

export function useContract(signer: ethers.Signer | null, address: string | null) {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signer && CONTRACT_ADDRESS !== '0x0000000000000000000000000000000000000000') {
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);
    }
  }, [signer]);

  const createContract = useCallback(
    async (sellerAddress: string, cropType: CropType, quantity: number, pricePerTon: string) => {
      if (!contract) {
        setError('Contract not initialized');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const priceInWei = ethers.utils.parseEther(pricePerTon);
        const tx = await contract.createFuturesContract(
          sellerAddress,
          cropType,
          quantity,
          priceInWei
        );
        await tx.wait();
        setLoading(false);
        return tx;
      } catch (err: any) {
        setError(err.message || 'Failed to create contract');
        setLoading(false);
        return null;
      }
    },
    [contract]
  );

  const depositBalance = useCallback(
    async (amount: string) => {
      if (!contract) {
        setError('Contract not initialized');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const amountInWei = ethers.utils.parseEther(amount);
        const tx = await contract.depositBalance({ value: amountInWei });
        await tx.wait();
        setLoading(false);
        return tx;
      } catch (err: any) {
        setError(err.message || 'Failed to deposit balance');
        setLoading(false);
        return null;
      }
    },
    [contract]
  );

  const confirmContract = useCallback(
    async (contractId: number) => {
      if (!contract) {
        setError('Contract not initialized');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contract.confirmContract(contractId);
        await tx.wait();
        setLoading(false);
        return tx;
      } catch (err: any) {
        setError(err.message || 'Failed to confirm contract');
        setLoading(false);
        return null;
      }
    },
    [contract]
  );

  const settleContract = useCallback(
    async (contractId: number) => {
      if (!contract) {
        setError('Contract not initialized');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contract.settleContract(contractId);
        await tx.wait();
        setLoading(false);
        return tx;
      } catch (err: any) {
        setError(err.message || 'Failed to settle contract');
        setLoading(false);
        return null;
      }
    },
    [contract]
  );

  const cancelContract = useCallback(
    async (contractId: number, reason: string) => {
      if (!contract) {
        setError('Contract not initialized');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const tx = await contract.cancelContract(contractId, reason);
        await tx.wait();
        setLoading(false);
        return tx;
      } catch (err: any) {
        setError(err.message || 'Failed to cancel contract');
        setLoading(false);
        return null;
      }
    },
    [contract]
  );

  const getTraderInfo = useCallback(
    async (traderAddress: string): Promise<TraderProfile | null> => {
      if (!contract) return null;

      try {
        const info = await contract.getTraderInfo(traderAddress);
        return {
          activeContracts: info.activeContracts.toNumber(),
          totalTrades: info.totalTrades.toNumber(),
          isVerified: info.isVerified,
        };
      } catch (err) {
        console.error('Error fetching trader info:', err);
        return null;
      }
    },
    [contract]
  );

  const getTraderContracts = useCallback(
    async (traderAddress: string): Promise<number[]> => {
      if (!contract) return [];

      try {
        const contractIds = await contract.getTraderContracts(traderAddress);
        return contractIds.map((id: any) => id.toNumber());
      } catch (err) {
        console.error('Error fetching trader contracts:', err);
        return [];
      }
    },
    [contract]
  );

  const getContractInfo = useCallback(
    async (contractId: number): Promise<FuturesContract | null> => {
      if (!contract) return null;

      try {
        const info = await contract.getContractInfo(contractId);
        return {
          contractId,
          buyer: info.buyer,
          seller: info.seller,
          cropType: info.cropType,
          settlementDate: info.settlementDate.toNumber(),
          status: info.status,
          buyerConfirmed: info.buyerConfirmed,
          sellerConfirmed: info.sellerConfirmed,
          creationTime: info.creationTime.toNumber(),
        };
      } catch (err) {
        console.error('Error fetching contract info:', err);
        return null;
      }
    },
    [contract]
  );

  const getMarketInfo = useCallback(
    async (cropType: CropType): Promise<MarketData | null> => {
      if (!contract) return null;

      try {
        const info = await contract.getMarketInfo(cropType);
        return {
          totalVolume: info.totalVolume.toNumber(),
          lastUpdated: info.lastUpdated.toNumber(),
        };
      } catch (err) {
        console.error('Error fetching market info:', err);
        return null;
      }
    },
    [contract]
  );

  return {
    contract,
    loading,
    error,
    createContract,
    depositBalance,
    confirmContract,
    settleContract,
    cancelContract,
    getTraderInfo,
    getTraderContracts,
    getContractInfo,
    getMarketInfo,
  };
}
