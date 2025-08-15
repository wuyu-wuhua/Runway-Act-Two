'use client';

import { useState, useEffect } from 'react';
import { ConsentModalProps, CookiePreferences, CookieCategory } from '../types';

export function ConsentModal({ 
  config, 
  onAccept, 
  onReject, 
  onCustomize, 
  isOpen, 
  onClose 
}: ConsentModalProps) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    social: false
  });

  // 默认Cookie分类配置
  const defaultCategories: CookieCategory[] = [
    {
      id: 'necessary',
      name: '必要Cookie',
      description: '这些Cookie是网站运行所必需的，无法禁用。包括会话管理、安全认证等核心功能。',
      required: true,
      defaultEnabled: true
    },
    {
      id: 'analytics',
      name: '分析Cookie',
      description: '帮助我们了解网站使用情况，改进用户体验。包括页面访问统计、用户行为分析等。',
      required: false,
      defaultEnabled: false
    },
    {
      id: 'marketing',
      name: '营销Cookie',
      description: '用于个性化广告投放和营销活动追踪。包括广告效果分析、再营销等。',
      required: false,
      defaultEnabled: false
    },
    {
      id: 'preferences',
      name: '偏好Cookie',
      description: '记住您的个人偏好设置，如语言选择、主题颜色等个性化选项。',
      required: false,
      defaultEnabled: false
    },
    {
      id: 'social',
      name: '社交媒体Cookie',
      description: '用于社交媒体插件的功能，如分享按钮、登录等。',
      required: false,
      defaultEnabled: false
    }
  ];

  const categories = config.categories.length > 0 ? config.categories : defaultCategories;

  useEffect(() => {
    if (isOpen) {
      setShowCustomize(false);
      // 重置偏好设置
      setPreferences({
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
        social: false
      });
    }
  }, [isOpen]);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      social: true
    };
    onAccept(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected: CookiePreferences = {
      necessary: true, // 必要Cookie始终允许
      analytics: false,
      marketing: false,
      preferences: false,
      social: false
    };
    onReject();
  };

  const handleCustomize = () => {
    setShowCustomize(true);
  };

  const handleSaveCustom = () => {
    onAccept(preferences);
  };

  const handlePreferenceChange = (category: keyof CookiePreferences, enabled: boolean) => {
    if (category === 'necessary') return; // 必要Cookie不能禁用
    
    setPreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 弹窗头部 */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {config.modalTitle || 'Cookie 使用同意'}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {config.modalDescription || 
              '根据法律，我们想用一些小文件来记录你的信息，以便提供更好的服务和广告。其中一些是网站运行必需的，但另一些（比如用于广告追踪的）需要得到你的明确许可。这是你的权利，请做出选择。'
            }
          </p>
        </div>

        {/* 弹窗内容 */}
        <div className="p-6">
          {!showCustomize ? (
            /* 主要选择界面 */
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-6">
                <p className="mb-2">我们使用以下类型的Cookie：</p>
                <ul className="space-y-1 ml-4">
                  {categories.map(category => (
                    <li key={category.id} className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="font-medium">{category.name}</span>
                      {category.required && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          必需
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  全部接受
                </button>
                <button
                  onClick={handleRejectAll}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  全部拒绝
                </button>
                <button
                  onClick={handleCustomize}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  自定义偏好
                </button>
              </div>
            </div>
          ) : (
            /* 自定义偏好设置界面 */
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-6">
                <p>请选择您希望允许的Cookie类型：</p>
              </div>

              {/* Cookie类别选择 */}
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                          {category.required && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              必需
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={preferences[category.id]}
                            onChange={(e) => handlePreferenceChange(category.id, e.target.checked)}
                            disabled={category.required}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 自定义偏好操作按钮 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCustomize(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={handleSaveCustom}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  保存偏好
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 弹窗底部 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            <p>
              点击"全部接受"即表示您同意我们使用所有Cookie。
              点击"全部拒绝"将仅使用必要的Cookie。
              您可以随时在{' '}
              <a 
                href={config.privacyPolicyUrl} 
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                隐私政策
              </a>
              {' '}中了解更多信息。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
