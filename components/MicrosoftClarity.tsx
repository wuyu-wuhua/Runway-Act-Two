'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function MicrosoftClarity() {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);

  useEffect(() => {
    // 检查用户是否同意了分析Cookie
    const checkAnalyticsConsent = () => {
      try {
        const consentData = localStorage.getItem('cookie-consent');
        if (consentData) {
          const consent = JSON.parse(consentData);
          if (consent.preferences && consent.preferences.analytics) {
            setHasAnalyticsConsent(true);
          }
        }
      } catch (error) {
        console.warn('无法检查Cookie同意状态:', error);
      }
    };

    // 初始检查
    checkAnalyticsConsent();

    // 监听Cookie同意变化
    const handleConsentUpdate = () => {
      checkAnalyticsConsent();
    };

    window.addEventListener('cookie-consent-updated', handleConsentUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'cookie-consent') {
        checkAnalyticsConsent();
      }
    });

    return () => {
      window.removeEventListener('cookie-consent-updated', handleConsentUpdate);
    };
  }, []);

  // 如果没有分析Cookie同意，不加载Microsoft Clarity
  if (!hasAnalyticsConsent) {
    return null;
  }

  return (
    <>
      {/* Microsoft Clarity */}
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "sv2s7retpt");
        `}
      </Script>
    </>
  );
}
