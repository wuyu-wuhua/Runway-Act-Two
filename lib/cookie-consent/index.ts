// 核心类导出
export { CookieConsentManager } from './core/manager';
export { StorageManager } from './core/storage';
export { CookieBlocker } from './core/blocker';

// 组件导出
export { ConsentModal } from './components/ConsentModal';
export { CookieBanner } from './components/CookieBanner';
export { CookieConsentProvider } from './CookieConsentProvider';
export { CookieConsentDebug } from './CookieConsentDebug';

// 类型导出
export type {
  CookiePreferences,
  ConsentRecord,
  CookieConsentConfig,
  CookieCategory,
  ConsentModalProps,
  CookieBannerProps
} from './types';

// 翻译导出
export { getCookieConsentTranslations, type CookieConsentTranslations } from './translations';

// 导入类型用于默认配置
import type { CookiePreferences } from './types';

// 默认配置
export const defaultCookieConfig = {
  companyName: 'Runway Act Two',
  privacyPolicyUrl: '/privacy',
  termsUrl: '/terms',
  modalTitle: 'Cookie 使用同意',
  modalDescription: '根据法律，我们想用一些小文件来记录你的信息，以便提供更好的服务和广告。其中一些是网站运行必需的，但另一些（比如用于广告追踪的）需要得到你的明确许可。这是你的权利，请做出选择。',
  categories: [
    {
      id: 'necessary' as keyof CookiePreferences,
      name: '必要Cookie',
      description: '这些Cookie是网站运行所必需的，无法禁用。包括会话管理、安全认证等核心功能。',
      required: true,
      defaultEnabled: true
    },
    {
      id: 'analytics' as keyof CookiePreferences,
      name: '分析Cookie',
      description: '帮助我们了解网站使用情况，改进用户体验。包括页面访问统计、用户行为分析等。',
      required: false,
      defaultEnabled: false
    },
    {
      id: 'marketing' as keyof CookiePreferences,
      name: '营销Cookie',
      description: '用于个性化广告投放和营销活动追踪。包括广告效果分析、再营销等。',
      required: false,
      defaultEnabled: false
    },
    {
      id: 'preferences' as keyof CookiePreferences,
      name: '偏好Cookie',
      description: '记住您的个人偏好设置，如语言选择、主题颜色等个性化选项。',
      required: false,
      defaultEnabled: false
    },
    {
      id: 'social' as keyof CookiePreferences,
      name: '社交媒体Cookie',
      description: '用于社交媒体插件的功能，如分享按钮、登录等。',
      required: false,
      defaultEnabled: false
    }
  ],
  theme: 'auto' as const,
  position: 'bottom' as const,
  autoShow: true,
  rememberForDays: 180,
  showOnReject: false
};
