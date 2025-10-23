// components/AdScripts.tsx
'use client';
import React from 'react';
import Script, { ScriptProps } from 'next/script';

interface AdScriptsProps {
  clientId?: string;
  enableAnalytics?: boolean;
}

export default function AdScripts({ 
  clientId,
  enableAnalytics = false 
}: AdScriptsProps): React.JSX.Element {
  // Use the passed clientId or fallback to environment variable or default
  const adsenseClientId = clientId || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-7311140109585146';
  const scriptStrategy: ScriptProps['strategy'] = 'afterInteractive';

  const handleAdSenseLoad = (): void => {
    console.log('AdSense script loaded successfully');
  };

  const handleAdSenseError = (e: any): void => {
    console.error('AdSense script failed to load', e);
  };

  return (
    <>
      {/* AdSense Script */}
      {adsenseClientId && (
        <Script
          id="adsense-script"
          strategy={scriptStrategy}
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          onLoad={handleAdSenseLoad}
          onError={handleAdSenseError}
          crossOrigin="anonymous"
          async
        />
      )}
      
      {/* Analytics if enabled - using Google Analytics instead of placeholder */}
      {enableAnalytics && (
        <Script
          id="google-analytics"
          strategy="lazyOnload"
          src="https://www.googletagmanager.com/gtag/js"
        />
      )}
    </>
  );
}