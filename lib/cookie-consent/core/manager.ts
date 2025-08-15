import { StorageManager } from './storage';
import { CookieBlocker } from './blocker';
import { CookiePreferences, CookieConsentConfig, ConsentRecord } from '../types';

export class CookieConsentManager {
  private _storage: StorageManager;
  private blocker: CookieBlocker;
  private config: CookieConsentConfig;
  private isInitialized: boolean = false;

  // 公共getter方法，供测试页面使用
  get storage(): StorageManager {
    return this._storage;
  }

  constructor(config: CookieConsentConfig) {
    this.config = config;
    this._storage = new StorageManager();
    this.blocker = new CookieBlocker();
    
    // 将阻止器暴露到全局，供拦截器使用
    (window as any).cookieBlocker = this.blocker;
  }

  /**
   * 初始化Cookie管理器
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    // 检查是否需要显示同意弹窗
    const shouldShow = this.shouldShowConsent();
    
    if (shouldShow) {
      this.showConsentModal();
    } else {
      // 应用已保存的偏好设置
      const consent = this.storage.getConsent();
      if (consent) {
        this.applyConsent(consent.preferences);
      }
    }
    
    this.isInitialized = true;
  }

  /**
   * 检查是否需要显示同意弹窗
   */
  shouldShowConsent(): boolean {
    return this.storage.shouldShowConsent();
  }

  /**
   * 显示同意弹窗
   */
  showConsentModal(): void {
    // 触发自定义事件，让UI组件显示弹窗
    const event = new CustomEvent('show-cookie-consent', {
      detail: { config: this.config }
    });
    window.dispatchEvent(event);
  }

  /**
   * 处理用户接受所有Cookie
   */
  acceptAll(): void {
    const preferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      social: true
    };
    
    this.applyConsent(preferences);
  }

  /**
   * 处理用户拒绝所有非必要Cookie
   */
  rejectAll(): void {
    const preferences: CookiePreferences = {
      necessary: true,  // 必要Cookie始终允许
      analytics: false,
      marketing: false,
      preferences: false,
      social: false
    };
    
    this.applyConsent(preferences);
  }

  /**
   * 处理用户自定义偏好设置
   */
  acceptCustom(preferences: CookiePreferences): void {
    // 确保必要Cookie始终为true
    preferences.necessary = true;
    
    this.applyConsent(preferences);
  }

  /**
   * 应用用户Cookie偏好设置
   */
  private applyConsent(preferences: CookiePreferences): void {
    // 保存用户选择
    this.storage.saveConsent(preferences);
    
    // 应用阻止规则
    this.blocker.applyPreferences(preferences);
    
    // 触发同意事件
    const event = new CustomEvent('cookie-consent-updated', {
      detail: { preferences }
    });
    window.dispatchEvent(event);
    
    // 隐藏弹窗
    this.hideConsentModal();
  }

  /**
   * 隐藏同意弹窗
   */
  hideConsentModal(): void {
    const event = new CustomEvent('hide-cookie-consent');
    window.dispatchEvent(event);
  }

  /**
   * 获取当前Cookie偏好设置
   */
  getCurrentPreferences(): CookiePreferences | null {
    const consent = this.storage.getConsent();
    return consent ? consent.preferences : null;
  }

  /**
   * 更新Cookie偏好设置
   */
  updatePreferences(preferences: Partial<CookiePreferences>): void {
    const current = this.getCurrentPreferences();
    if (current) {
      const updated = { ...current, ...preferences };
      this.applyConsent(updated);
    }
  }

  /**
   * 撤回Cookie同意
   */
  withdrawConsent(): void {
    this.storage.clearConsent();
    this.blocker.clearBlockingRules();
    
    // 重新显示同意弹窗
    this.showConsentModal();
    
    // 触发撤回事件
    const event = new CustomEvent('cookie-consent-withdrawn');
    window.dispatchEvent(event);
  }

  /**
   * 获取同意状态信息
   */
  getConsentInfo(): {
    hasConsent: boolean;
    lastUpdated: Date | null;
    expiresAt: Date | null;
    preferences: CookiePreferences | null;
  } {
    const consent = this.storage.getConsent();
    
    return {
      hasConsent: !!consent,
      lastUpdated: consent ? new Date(consent.timestamp) : null,
      expiresAt: consent ? new Date(consent.expiresAt) : null,
      preferences: consent ? consent.preferences : null
    };
  }

  /**
   * 检查特定Cookie类别是否被允许
   */
  isCategoryAllowed(category: keyof CookiePreferences): boolean {
    const preferences = this.getCurrentPreferences();
    if (!preferences) return false;
    
    // 必要Cookie始终允许
    if (category === 'necessary') return true;
    
    return preferences[category] || false;
  }

  /**
   * 获取阻止统计信息
   */
  getBlockingStats(): { blockedDomains: number; blockedScripts: number } {
    return this.blocker.getBlockingStats();
  }

  /**
   * 强制重新显示同意弹窗（用于测试或政策更新）
   */
  forceShowConsent(): void {
    this.storage.clearConsent();
    this.showConsentModal();
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.blocker.clearBlockingRules();
    delete (window as any).cookieBlocker;
    this.isInitialized = false;
  }
}
