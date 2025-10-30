'use client';

import React from 'react';
import { FuturesContract, ContractStatus } from '@/lib/types';
import { CROP_NAMES, CROP_EMOJIS, CROP_CLASSES, STATUS_CLASSES, STATUS_LABELS } from '@/lib/constants';
import { formatAddress, formatDate } from '@/lib/utils';

interface ContractsListProps {
  contracts: FuturesContract[];
  currentAddress: string | null;
  onRefresh: () => void;
  onConfirm: (contractId: number) => Promise<void>;
  onSettle: (contractId: number) => Promise<void>;
  onCancel: (contractId: number, reason: string) => Promise<void>;
  loading: boolean;
}

export default function ContractsList({
  contracts,
  currentAddress,
  onRefresh,
  onConfirm,
  onSettle,
  onCancel,
  loading,
}: ContractsListProps) {
  const handleCancel = async (contractId: number) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (reason) {
      await onCancel(contractId, reason);
    }
  };

  return (
    <div className="card mt-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5>📋 My Contracts</h5>
        <button
          id="refreshContracts"
          className="btn btn-outline-primary btn-sm"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="card-body">
        <div id="contractsList">
          {contracts.length === 0 ? (
            <p className="text-muted">No contracts found. Create your first contract above!</p>
          ) : (
            contracts.map((contract) => (
              <div key={contract.contractId} className="card mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6>
                      <span
                        className={`status-indicator ${
                          STATUS_CLASSES[ContractStatus[contract.status] as keyof typeof STATUS_CLASSES]
                        }`}
                      ></span>
                      Contract #{contract.contractId}
                    </h6>
                    <span className={`crop-badge ${CROP_CLASSES[contract.cropType]}`}>
                      {CROP_EMOJIS[contract.cropType]} {CROP_NAMES[contract.cropType]}
                    </span>
                  </div>
                  <p>
                    <strong>Status:</strong>{' '}
                    {STATUS_LABELS[ContractStatus[contract.status] as keyof typeof STATUS_LABELS]}
                  </p>
                  <p>
                    <strong>Buyer:</strong> {formatAddress(contract.buyer)}{' '}
                    {contract.buyer.toLowerCase() === currentAddress?.toLowerCase() && '(You)'}
                  </p>
                  <p>
                    <strong>Seller:</strong> {formatAddress(contract.seller)}{' '}
                    {contract.seller.toLowerCase() === currentAddress?.toLowerCase() && '(You)'}
                  </p>
                  <p>
                    <strong>Settlement Date:</strong> {formatDate(contract.settlementDate)}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDate(contract.creationTime)}
                  </p>
                  <div className="mt-2">
                    <small>
                      Buyer Confirmed: {contract.buyerConfirmed ? '✓' : '✗'} | Seller Confirmed:{' '}
                      {contract.sellerConfirmed ? '✓' : '✗'}
                    </small>
                  </div>
                  {contract.status === ContractStatus.ACTIVE && (
                    <div className="mt-3">
                      {!contract.buyerConfirmed &&
                        contract.buyer.toLowerCase() === currentAddress?.toLowerCase() && (
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => onConfirm(contract.contractId)}
                            disabled={loading}
                          >
                            Confirm (Buyer)
                          </button>
                        )}
                      {!contract.sellerConfirmed &&
                        contract.seller.toLowerCase() === currentAddress?.toLowerCase() && (
                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => onConfirm(contract.contractId)}
                            disabled={loading}
                          >
                            Confirm (Seller)
                          </button>
                        )}
                      {contract.buyerConfirmed &&
                        contract.sellerConfirmed &&
                        Date.now() / 1000 >= contract.settlementDate && (
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={() => onSettle(contract.contractId)}
                            disabled={loading}
                          >
                            Settle Contract
                          </button>
                        )}
                      {(!contract.buyerConfirmed || !contract.sellerConfirmed) && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleCancel(contract.contractId)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
