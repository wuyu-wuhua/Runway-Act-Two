'use client';

import { useEffect, useState } from 'react';
import { 
  CookieConsentManager, 
  ConsentModal, 
  CookieBanner, 
  defaultCookieConfig,
  type CookiePreferences 
} from './index';

// 使用示例：在您的网站中集成Cookie管理系统
export function CookieConsentExample() {
  const [manager, setManager] = useState<CookieConsentManager | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 创建Cookie管理器实例
    const cookieManager = new CookieConsentManager(defaultCookieConfig);
    setManager(cookieManager);

    // 监听事件
    const handleShowConsent = () => setShowModal(true);
    const handleHideConsent = () => setShowModal(false);
    const handleConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('Cookie同意已更新:', customEvent.detail.preferences);
      setShowBanner(false);
    };

    window.addEventListener('show-cookie-consent', handleShowConsent);
    window.addEventListener('hide-cookie-consent', handleHideConsent);
    window.addEventListener('cookie-consent-updated', handleConsentUpdated);

    // 初始化管理器
    cookieManager.initialize();

    // 检查是否需要显示横幅
    if (!cookieManager.shouldShowConsent()) {
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
    setShowModal(true);
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

  const handleWithdrawConsent = () => {
    if (manager) {
      manager.withdrawConsent();
    }
  };

  if (!manager) return null;

  return (
    <>
      {/* Cookie同意弹窗 */}
      <ConsentModal
        config={defaultCookieConfig}
        onAccept={handleAccept}
        onReject={handleReject}
        onCustomize={() => {}} // 在弹窗内部处理
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Cookie设置横幅 */}
      {showBanner && (
        <CookieBanner
          config={defaultCookieConfig}
          onOpenSettings={handleOpenSettings}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
        />
      )}

      {/* 测试控制面板（开发时使用，生产环境可删除） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
          <h3 className="font-bold mb-2">Cookie 测试控制</h3>
          <div className="space-y-2">
            <button
              onClick={() => manager.forceShowConsent()}
              className="block w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              强制显示弹窗
            </button>
            <button
              onClick={handleWithdrawConsent}
              className="block w-full px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              撤回同意
            </button>
            <button
              onClick={() => console.log('当前偏好:', manager.getCurrentPreferences())}
              className="block w-full px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              查看当前设置
            </button>
            <button
              onClick={() => console.log('阻止统计:', manager.getBlockingStats())}
              className="block w-full px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
            >
              查看阻止统计
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// 在您的layout.tsx或页面中使用：
/*
import { CookieConsentExample } from '@/lib/cookie-consent/example-usage';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <CookieConsentExample />
      </body>
    </html>
  );
}
*/
