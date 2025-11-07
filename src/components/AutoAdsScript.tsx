import Script from "next/script";

interface AutoAdsScriptProps {
  clientId: string;
}

const AutoAdsScript: React.FC<AutoAdsScriptProps> = ({ clientId }) => {
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
};

export default AutoAdsScript;
