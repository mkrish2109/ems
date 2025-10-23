// components/AdBanner.tsx
'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AdBannerProps } from '@/types/ads';

export default function AdBanner({ 
  adUnit, 
  adSlot, 
  format = 'auto',
  layout: _layout = '',
  layoutKey: _layoutKey = '',
  className = '',
  testMode = false,
  onLoad,
  onError
}: AdBannerProps): React.JSX.Element {
  const adRef = useRef<HTMLModElement>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const checkAdConsent = useCallback((): boolean => {
    // Implement your consent logic here
    // Check GDPR/CCPA compliance
    try {
      const consent = localStorage.getItem('ad-consent');
      return consent === 'true';
    } catch {
      return false; // Default to no consent if storage access fails
    }
  }, []);

  const loadAd = useCallback((): void => {
    if (testMode || hasError || !window.adsbygoogle) {
      return;
    }

    const hasConsent = checkAdConsent();
    
    if (hasConsent) {
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
        setIsLoaded(true);
        onLoad?.();
      } catch (error) {
        const adError = error instanceof Error ? error : new Error('Failed to load ad');
        setHasError(true);
        onError?.(adError);
        console.error('Error loading ad:', adError);
      }
    }
  }, [testMode, hasError, checkAdConsent, onLoad, onError]);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  // Test mode or development placeholder
  if (testMode || process.env.NODE_ENV === 'development') {
    return (
      <div 
        className={`ad-placeholder ${className}`}
        data-testid="ad-placeholder"
      >
        <div 
          style={{ 
            background: '#f0f0f0', 
            border: '1px dashed #ccc',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          Ad Unit: {adUnit} | Slot: {adSlot}
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div 
        className={`ad-error ${className}`}
        data-testid="ad-error"
      >
        <div style={{ 
          background: '#ffe6e6', 
          border: '1px solid #ffcccc',
          padding: '10px',
          textAlign: 'center',
          fontSize: '12px'
        }}>
          Advertisement
        </div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adUnit}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-ad-region="region-1"
        data-ad-status={isLoaded ? 'loaded' : 'loading'}
      />
    </div>
  );
}