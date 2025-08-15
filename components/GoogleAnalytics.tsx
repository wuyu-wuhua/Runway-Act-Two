'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/languageContext';

export default function GoogleAnalytics() {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(false);
  const { language } = useLanguage();

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

  // 如果没有分析Cookie同意，不加载Google Analytics
  if (!hasAnalyticsConsent) {
    return null;
  }

  return (
    <>
      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-9VF8TMK0RD"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9VF8TMK0RD', {
            'custom_map': {
              'dimension1': 'language'
            }
          });
          
          // 设置语言维度
          gtag('event', 'page_view', {
            'custom_map': {
              'dimension1': '${language}'
            }
          });
        `}
      </Script>
    </>
  );
}
