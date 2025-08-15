export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  social: boolean;
}

export interface ConsentRecord {
  timestamp: number;
  version: string;
  deviceFingerprint: string;
  preferences: CookiePreferences;
  expiresAt: number;
}

export interface CookieConsentConfig {
  // 基础配置
  companyName: string;
  privacyPolicyUrl: string;
  termsUrl?: string;
  
  // 弹窗配置
  modalTitle?: string;
  modalDescription?: string;
  
  // Cookie分类
  categories: CookieCategory[];
  
  // 样式配置
  theme?: 'light' | 'dark' | 'auto';
  position?: 'bottom' | 'top' | 'center';
  
  // 行为配置
  autoShow?: boolean;
  rememberForDays?: number;
  showOnReject?: boolean;
}

export interface CookieCategory {
  id: keyof CookiePreferences;
  name: string;
  description: string;
  required: boolean;
  defaultEnabled: boolean;
}

export interface ConsentModalProps {
  config: CookieConsentConfig;
  onAccept: (preferences: CookiePreferences) => void;
  onReject: () => void;
  onCustomize: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface CookieBannerProps {
  config: CookieConsentConfig;
  onOpenSettings: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}
