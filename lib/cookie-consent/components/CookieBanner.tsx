'use client';

import { useState } from 'react';
import { CookieBannerProps } from '../types';

export function CookieBanner({ 
  config, 
  onOpenSettings, 
  onAcceptAll, 
  onRejectAll 
}: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleAcceptAll = () => {
    onAcceptAll();
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    onRejectAll();
    setIsVisible(false);
  };

  const handleOpenSettings = () => {
    onOpenSettings();
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* 左侧内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="flex-shrink-0 mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Cookie 使用通知
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  我们使用Cookie来改善您的浏览体验。继续使用本网站即表示您同意我们的Cookie政策。
                </p>
              </div>
            </div>
          </div>

          {/* 右侧操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleAcceptAll}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              全部接受
            </button>
            <button
              onClick={handleRejectAll}
              className="w-full sm:w-auto bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              全部拒绝
            </button>
            <button
              onClick={handleOpenSettings}
              className="w-full sm:w-auto border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              自定义设置
            </button>
            <button
              onClick={handleClose}
              className="w-full sm:w-auto text-gray-500 hover:text-gray-700 px-3 py-2 text-sm transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>

        {/* 底部链接 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <a 
                href={config.privacyPolicyUrl}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                隐私政策
              </a>
              {config.termsUrl && (
                <a 
                  href={config.termsUrl}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  使用条款
                </a>
              )}
            </div>
            <div className="text-center sm:text-right">
              <p>
                {config.companyName} © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
