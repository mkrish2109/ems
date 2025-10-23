import React from 'react';
import AdBanner from '@/components/AdBanner';
import SmartAdBanner from '@/components/SmartAdBanner';

export default function TestAdsPage(): React.JSX.Element {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">AdSense Test Page</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Basic Ad Banner</h2>
          <AdBanner
            adUnit="ca-pub-7311140109585146"
            adSlot="1234567890"
            format="auto"
            className="border border-gray-300 p-4"
            testMode={true}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Smart Ad Banner (Lazy Loaded)</h2>
          <SmartAdBanner
            adUnit="ca-pub-7311140109585146"
            adSlot="0987654321"
            format="rectangle"
            lazyLoad={true}
            className="border border-gray-300 p-4"
            fallback={
              <div className="bg-gray-100 p-8 text-center">
                <p>Advertisement placeholder</p>
              </div>
            }
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Responsive Ad</h2>
          <AdBanner
            adUnit="ca-pub-7311140109585146"
            adSlot="1122334455"
            format="fluid"
            className="border border-gray-300 p-4"
            testMode={true}
          />
        </section>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check browser console for &quot;AdSense script loaded successfully&quot; message</li>
          <li>In development mode, you&apos;ll see placeholder ads with your client ID</li>
          <li>In production mode, real AdSense ads will load</li>
          <li>Verify ads.txt is accessible at /ads.txt</li>
        </ul>
      </div>
    </div>
  );
}
