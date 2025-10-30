'use client';

import React, { useState } from 'react';
import { CropType } from '@/lib/types';
import { CROP_NAMES, CROP_EMOJIS } from '@/lib/constants';

interface CreateContractProps {
  onCreateContract: (sellerAddress: string, cropType: CropType, quantity: number, pricePerTon: string) => Promise<void>;
  loading: boolean;
}

export default function CreateContract({ onCreateContract, loading }: CreateContractProps) {
  const [sellerAddress, setSellerAddress] = useState('');
  const [cropType, setCropType] = useState<CropType>(CropType.WHEAT);
  const [quantity, setQuantity] = useState('');
  const [pricePerTon, setPricePerTon] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sellerAddress || !quantity || !pricePerTon) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await onCreateContract(sellerAddress, cropType, parseInt(quantity), pricePerTon);
      // Reset form
      setSellerAddress('');
      setQuantity('');
      setPricePerTon('');
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h5>📝 Create New Futures Contract</h5>
      </div>
      <div className="card-body">
        <form id="createContractForm" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="sellerAddress" className="form-label">
              Seller Address
            </label>
            <input
              type="text"
              className="form-control"
              id="sellerAddress"
              placeholder="0x... (must be different from your address)"
              value={sellerAddress}
              onChange={(e) => setSellerAddress(e.target.value)}
              required
            />
            <small className="text-warning">
              ⚠️ Note: You are the buyer. Enter a different address as the seller.
            </small>
          </div>
          <div className="mb-3">
            <label htmlFor="cropType" className="form-label">
              Crop Type
            </label>
            <select
              className="form-select"
              id="cropType"
              value={cropType}
              onChange={(e) => setCropType(parseInt(e.target.value) as CropType)}
              required
            >
              {Object.values(CropType)
                .filter((v) => typeof v === 'number')
                .map((type) => (
                  <option key={type} value={type}>
                    {CROP_EMOJIS[type as CropType]} {CROP_NAMES[type as CropType]}
                  </option>
                ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="quantity" className="form-label">
              Quantity (tons)
            </label>
            <input
              type="number"
              className="form-control"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="pricePerTon" className="form-label">
              Price per Ton (ETH)
            </label>
            <input
              type="number"
              className="form-control"
              id="pricePerTon"
              step="0.001"
              min="0.001"
              value={pricePerTon}
              onChange={(e) => setPricePerTon(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Creating...' : 'Create Contract'}
          </button>
        </form>
      </div>
    </div>
  );
}
