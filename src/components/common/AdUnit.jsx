'use client';

import React, { useEffect } from 'react';
import { CONFIG } from '../../utils/config';

const AdUnit = ({ slotId, format = 'auto', responsive = 'true', className = '' }) => {

  const isProd = CONFIG.IS_PROD;
  const publisherId = CONFIG.ADSENSE_ID;


  useEffect(() => {
    if (isProd) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, [isProd]);

  if (!publisherId) return null;

  // Pre-calculated min-heights based on format to prevent layout shift (CLS)
  const minHeight = format === 'horizontal' ? 'min-h-[90px]' : 'min-h-[250px]';

  return (
    <div className={`ad-container my-6 overflow-hidden flex flex-col items-center justify-center transition-all duration-500 ${minHeight} ${className}`}>
      {isProd ? (
        <>
          {/* Skeleton placeholder shown while ad is loading */}
          <div className="absolute inset-x-0 top-0 bottom-0 -z-10 flex flex-col items-center justify-center bg-muted/5 animate-pulse rounded-xl border border-border/50">
            <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
              Advertisement
            </span>
          </div>
          
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minWidth: '250px', minHeight: '90px' }}
            data-ad-client={publisherId}
            data-ad-slot={slotId || CONFIG.ADSENSE_SLOT_ID}
            data-ad-format={format}
            data-full-width-responsive={responsive}
          />
        </>
      ) : (
        <div className="bg-muted/30 border-2 border-dashed border-muted-foreground/20 rounded-2xl p-8 w-full text-center text-muted-foreground max-w-2xl">
          <p className="text-[10px] font-black tracking-widest uppercase mb-1 opacity-40 italic">Dev Mode: Google AdSense</p>
          <p className="text-xs font-bold text-muted-foreground/60 tracking-tight">Slot ID: {slotId || CONFIG.ADSENSE_SLOT_ID}</p>
        </div>
      )}
    </div>
  );
};


export default AdUnit;
