'use client';

import React from 'react';
import { CropType, MarketData as MarketDataType } from '@/lib/types';
import { CROP_NAMES, CROP_EMOJIS, CROP_CLASSES } from '@/lib/constants';

interface MarketDataProps {
  marketData: Record<CropType, MarketDataType | null>;
}

export default function MarketData({ marketData }: MarketDataProps) {
  const cropTypes = [CropType.WHEAT, CropType.RICE, CropType.CORN, CropType.SOYBEANS, CropType.COTTON];

  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5>📊 Market Data</h5>
      </div>
      <div className="card-body">
        <div id="marketData">
          <div className="row">
            {cropTypes.map((cropType) => (
              <div key={cropType} className="col-md-2">
                <span className={`crop-badge ${CROP_CLASSES[cropType]}`}>
                  {CROP_EMOJIS[cropType]} {CROP_NAMES[cropType]}
                </span>
                <br />
                <small>
                  Volume: <span id={`${CROP_NAMES[cropType].toLowerCase()}Volume`}>
                    {marketData[cropType]?.totalVolume || 0}
                  </span>
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
