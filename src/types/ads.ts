// types/ads.ts
export interface AdBannerProps {
    adUnit: string;
    adSlot: string;
    format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
    layout?: string;
    layoutKey?: string;
    className?: string;
    testMode?: boolean;
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }
  
  export interface AdConfig {
    ad_units: {
      header: string;
      sidebar: string;
      in_content: string;
      [key: string]: string;
    };
    targeting: {
      user_tier: 'guest' | 'basic' | 'premium';
      page_type: string;
    };
  }
  
  export interface AdPerformanceData {
    date: string;
    ad_unit: string;
    clicks: number;
    page_views: number;
    earnings: number;
  }
  
  // Window interface extension for ad scripts
  declare global {
    interface Window {
      adsbygoogle: { push: (config?: object) => void }[];
      gtag: (...args: any[]) => void;
    }
  }