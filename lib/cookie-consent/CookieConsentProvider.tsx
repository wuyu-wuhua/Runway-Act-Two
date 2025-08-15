'use client';

import { useEffect, useState } from 'react';
import { 
  CookieConsentManager, 
  ConsentModal, 
  CookieBanner, 
  defaultCookieConfig,
  type CookiePreferences 
} from './index';
import { getCookieConsentTranslations } from './translations';
import { useLanguage } from '@/lib/languageContext';


// 生产环境使用的Cookie管理系统组件
export function CookieConsentProvider() {
  const [manager, setManager] = useState<CookieConsentManager | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomSettings, setShowCustomSettings] = useState(false);
  const [customPreferences, setCustomPreferences] = useState({
    functional: true,
    performance: true,
    analytics: false,
    marketing: false
  });
  
  // 获取当前语言
  const { language } = useLanguage();
  
  // 获取翻译（动态根据当前语言）
  const t = getCookieConsentTranslations(language);
  


  useEffect(() => {
    // 创建Cookie管理器实例
    const cookieManager = new CookieConsentManager(defaultCookieConfig);
    setManager(cookieManager);

    // 监听事件
    const handleShowConsent = () => {
      setShowBanner(true);
    };
    const handleHideConsent = () => {
      setShowBanner(false);
    };
    const handleConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      setShowBanner(false);
    };

    window.addEventListener('show-cookie-consent', handleShowConsent);
    window.addEventListener('hide-cookie-consent', handleHideConsent);
    window.addEventListener('cookie-consent-updated', handleConsentUpdated);

    // 初始化管理器
    cookieManager.initialize();
    
    // 检查是否需要显示底部横条
    const shouldShow = cookieManager.shouldShowConsent();
    
    if (shouldShow) {
      setShowBanner(true);
    }
    


    return () => {
      window.removeEventListener('show-cookie-consent', handleShowConsent);
      window.removeEventListener('hide-cookie-consent', handleHideConsent);
      window.removeEventListener('cookie-consent-updated', handleConsentUpdated);
      cookieManager.destroy();
    };
  }, []);

  const handleAccept = (preferences: CookiePreferences) => {
    if (manager) {
      manager.acceptCustom(preferences);
    }
  };

  const handleReject = () => {
    if (manager) {
      manager.rejectAll();
    }
  };

  const handleOpenSettings = () => {
    setShowCustomSettings(true);
  };

  const handleAcceptAll = () => {
    if (manager) {
      manager.acceptAll();
    }
  };

  const handleRejectAll = () => {
    if (manager) {
      manager.rejectAll();
    }
  };

  const handleCustomPreferences = () => {
    setShowCustomSettings(true);
    setShowBanner(false); // 隐藏横条
  };

  const handleSaveCustomPreferences = () => {
    if (manager) {
      // 构建自定义偏好对象，映射到CookiePreferences类型
      const preferences = {
        necessary: true, // 必需Cookie始终为true
        analytics: customPreferences.analytics,
        marketing: customPreferences.marketing,
        preferences: customPreferences.functional, // 功能性Cookie映射到preferences
        social: false // 社交Cookie默认关闭
      };
      manager.acceptCustom(preferences);
      setShowCustomSettings(false);
    }
  };

  const handleTogglePreference = (key: keyof typeof customPreferences) => {
    setCustomPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!manager) return null;

  return (
    <>



      {/* 自定义偏好设置弹窗 - 简化版 */}
      {showCustomSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
          }}>
            {/* 弹窗头部 */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                                      <h2 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1f2937'
                      }}>
                        {t.customPreferencesTitle}
                      </h2>
                <button
                  onClick={() => {
                    setShowCustomSettings(false);
                    setShowBanner(true); // 重新显示横条
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '18px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Cookie分类设置 */}
            <div style={{padding: '20px 24px'}}>
              {/* 必要的Cookie - 始终启用 */}
              <div style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '12px',
                background: '#f9fafb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {t.necessary}
                  </h4>
                  <span style={{
                    padding: '4px 8px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {t.alwaysActive}
                  </span>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {t.necessaryDesc}
                </p>
              </div>

              {/* 功能性Cookie */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{flex: 1, marginRight: '16px'}}>
                                      <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>
                      {t.functional}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {t.functionalDesc}
                    </p>
                </div>
                <input
                  type="checkbox"
                  checked={customPreferences.functional}
                  onChange={() => handleTogglePreference('functional')}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
              </div>

              {/* 分析统计Cookie */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{flex: 1, marginRight: '16px'}}>
                                      <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>
                      {t.analytics}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {t.analyticsDesc}
                    </p>
                </div>
                <input
                  type="checkbox"
                  checked={customPreferences.analytics}
                  onChange={() => handleTogglePreference('analytics')}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
              </div>

              {/* 性能优化Cookie */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '12px'
              }}>
                <div style={{flex: 1, marginRight: '16px'}}>
                                      <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>
                      {t.performance}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {t.performanceDesc}
                    </p>
                </div>
                <input
                  type="checkbox"
                  checked={customPreferences.performance}
                  onChange={() => handleTogglePreference('performance')}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
              </div>

              {/* 营销推广Cookie */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <div style={{flex: 1, marginRight: '16px'}}>
                                      <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1f2937'
                    }}>
                      {t.marketing}
                    </h4>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: '#6b7280',
                      lineHeight: '1.5'
                    }}>
                      {t.marketingDesc}
                    </p>
                </div>
                <input
                  type="checkbox"
                  checked={customPreferences.marketing}
                  onChange={() => handleTogglePreference('marketing')}
                  style={{
                    width: '20px',
                    height: '20px',
                    marginTop: '2px',
                    flexShrink: 0
                  }}
                />
              </div>

              {/* 操作按钮 */}
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    handleRejectAll();
                    setShowCustomSettings(false);
                    setShowBanner(true); // 重新显示横条
                  }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {t.rejectAllCookies}
                </button>
                <button
                  onClick={() => {
                    handleSaveCustomPreferences();
                    setShowBanner(true); // 重新显示横条
                  }}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {t.savePreferences}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookie同意横幅 - 底部横条 */}
      {showBanner && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          zIndex: 9999,
          padding: '16px 24px'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}>
            {/* 左侧内容 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flex: 1
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                background: '#dbeafe',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
    
              </div>
              <div style={{flex: 1}}>
                <h3 style={{
                  margin: '0 0 4px 0',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  {t.title}
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {t.description}
                </p>
              </div>
            </div>

            {/* 右侧按钮组 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexShrink: 0
            }}>
              <button
                onClick={() => {
                  handleAcceptAll();
                  setShowBanner(false);
                }}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
              >
                {t.acceptAll}
              </button>
              <button
                onClick={() => {
                  handleRejectAll();
                  setShowBanner(false);
                }}
                style={{
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
              >
                {t.rejectAll}
              </button>
              <button
                onClick={handleCustomPreferences}
                style={{
                  background: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                {t.customPreferences}
              </button>
              <button
                onClick={() => setShowBanner(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  transition: 'color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#6b7280'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
              >
              
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
