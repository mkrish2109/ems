// components/SmartAdBanner.tsx
'use client';
import React, { useState } from 'react';
import AdBanner from './AdBanner';
import { useAdVisibility } from '@/hooks/useAdVisibility';
import { AdBannerProps } from '@/types/ads';

interface SmartAdBannerProps extends AdBannerProps {
  lazyLoad?: boolean;
  fallback?: React.ReactNode;
}

export default function SmartAdBanner({
  lazyLoad = true,
  fallback,
  onError,
  ...adProps
}: SmartAdBannerProps): React.JSX.Element {
  const [hasAdError, setHasAdError] = useState<boolean>(false);
  const { ref, shouldLoad } = useAdVisibility();

  const handleAdError = (error: Error): void => {
    setHasAdError(true);
    onError?.(error);
  };

  // Show fallback on error
  if (hasAdError && fallback) {
    return <>{fallback}</>;
  }

  // Lazy loading: show placeholder until visible
  if (lazyLoad && !shouldLoad) {
    return (
      <div 
        ref={ref}
        className="ad-skeleton"
        style={{
          width: '100%',
          height: '250px',
          background: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        Loading advertisement...
      </div>
    );
  }

  return (
    <div ref={lazyLoad ? ref : undefined}>
      <AdBanner
        {...adProps}
        onError={handleAdError}
      />
    </div>
  );
}