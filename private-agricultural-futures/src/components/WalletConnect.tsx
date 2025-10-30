'use client';

import React from 'react';
import { formatAddress, formatBalance } from '@/lib/utils';

interface WalletConnectProps {
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  onConnect: () => void;
}

export default function WalletConnect({ address, balance, isConnected, onConnect }: WalletConnectProps) {
  return (
    <div className="card">
      <div className="card-body text-center">
        <button
          id="connectWallet"
          className="btn btn-primary btn-lg"
          onClick={onConnect}
          disabled={isConnected}
        >
          {isConnected ? 'Wallet Connected' : 'Connect MetaMask Wallet'}
        </button>
        {isConnected && address && (
          <div id="walletInfo" className="mt-3">
            <p>
              <strong>Connected:</strong> <span id="walletAddress">{formatAddress(address)}</span>
            </p>
            <p>
              <strong>Balance:</strong> <span id="walletBalance">{formatBalance(balance || '0')}</span> ETH
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
