'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletState } from '@/lib/types';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: null,
    isConnected: false,
  });

  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  const updateBalance = useCallback(async (address: string, web3Provider: ethers.providers.Web3Provider) => {
    try {
      const balance = await web3Provider.getBalance(address);
      const balanceInEth = ethers.utils.formatEther(balance);
      setWalletState((prev) => ({ ...prev, balance: balanceInEth }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application!');
      return;
    }

    try {
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      const web3Signer = web3Provider.getSigner();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setWalletState((prev) => ({ ...prev, address, isConnected: true }));

      await updateBalance(address, web3Provider);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  }, [updateBalance]);

  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      balance: null,
      isConnected: false,
    });
    setProvider(null);
    setSigner(null);
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [connectWallet, disconnectWallet]);

  return {
    ...walletState,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    updateBalance: () => walletState.address && provider ? updateBalance(walletState.address, provider) : Promise.resolve(),
  };
}
