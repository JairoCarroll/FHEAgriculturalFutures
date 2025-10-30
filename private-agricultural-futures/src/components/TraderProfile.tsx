'use client';

import React, { useState } from 'react';
import { TraderProfile as TraderProfileType } from '@/lib/types';

interface TraderProfileProps {
  profile: TraderProfileType | null;
  onDeposit: (amount: string) => Promise<void>;
  loading: boolean;
}

export default function TraderProfile({ profile, onDeposit, loading }: TraderProfileProps) {
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    try {
      await onDeposit(depositAmount);
      setDepositAmount('');
    } catch (error) {
      console.error('Error depositing:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>👤 Trader Profile</h5>
      </div>
      <div className="card-body">
        <div id="traderProfile">
          <p>
            <strong>Status:</strong>{' '}
            <span id="verificationStatus">
              {profile?.isVerified ? (
                <span className="text-success">Verified</span>
              ) : (
                'Not Verified'
              )}
            </span>
          </p>
          <p>
            <strong>Active Contracts:</strong>{' '}
            <span id="activeContracts">{profile?.activeContracts || 0}</span>
          </p>
          <p>
            <strong>Total Trades:</strong>{' '}
            <span id="totalTrades">{profile?.totalTrades || 0}</span>
          </p>
          <div className="mt-3">
            <button
              id="depositBalance"
              className="btn btn-warning"
              onClick={handleDeposit}
              disabled={loading || !depositAmount}
            >
              {loading ? 'Depositing...' : 'Deposit Balance'}
            </button>
            <input
              type="number"
              id="depositAmount"
              className="form-control mt-2"
              placeholder="Amount in ETH"
              step="0.01"
              min="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
