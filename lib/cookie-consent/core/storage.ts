import { ConsentRecord, CookiePreferences } from '../types';

export class StorageManager {
  private readonly CONSENT_KEY = 'cookie-consent';
  private readonly CONSENT_COOKIE = 'cookie-consent-status';
  private readonly VERSION = '1.0.0';
  private readonly DEFAULT_EXPIRE_DAYS = 180; // 6个月

  /**
   * 保存用户同意记录
   */
  saveConsent(preferences: CookiePreferences): void {
    const deviceFingerprint = this.generateDeviceFingerprint();
    const expiresAt = Date.now() + (this.DEFAULT_EXPIRE_DAYS * 24 * 60 * 60 * 1000);
    
    const consentRecord: ConsentRecord = {
      timestamp: Date.now(),
      version: this.VERSION,
      deviceFingerprint,
      preferences,
      expiresAt
    };

    // 保存到localStorage
    try {
      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consentRecord));
    } catch (error) {
      console.warn('无法保存到localStorage:', error);
    }

    // 保存到Cookie作为备份
    this.setCookie(this.CONSENT_COOKIE, JSON.stringify(consentRecord), this.DEFAULT_EXPIRE_DAYS);
  }

  /**
   * 获取用户同意记录
   */
  getConsent(): ConsentRecord | null {
    // 优先从localStorage获取
    try {
      const localStorageData = localStorage.getItem(this.CONSENT_KEY);
      if (localStorageData) {
        const consent = JSON.parse(localStorageData);
        if (this.isValidConsent(consent)) {
          return consent;
        }
      }
    } catch (error) {
      console.warn('无法从localStorage读取:', error);
    }

    // 从Cookie获取备份
    const cookieData = this.getCookie(this.CONSENT_COOKIE);
    if (cookieData) {
      try {
        const consent = JSON.parse(cookieData);
        if (this.isValidConsent(consent)) {
          // 同步到localStorage
          try {
            localStorage.setItem(this.CONSENT_KEY, cookieData);
          } catch (error) {
            console.warn('无法同步到localStorage:', error);
          }
          return consent;
        }
      } catch (error) {
        console.warn('无法解析Cookie数据:', error);
      }
    }

    return null;
  }

  /**
   * 检查是否需要显示同意弹窗
   */
  shouldShowConsent(): boolean {
    const consent = this.getConsent();
    
    if (!consent) {
      return true;
    }

    // 检查是否过期
    if (Date.now() > consent.expiresAt) {
      return true;
    }

    // 检查版本是否匹配
    if (consent.version !== this.VERSION) {
      return true;
    }

    // 检查设备指纹是否变化
    const currentFingerprint = this.generateDeviceFingerprint();
    if (consent.deviceFingerprint !== currentFingerprint) {
      return true;
    }

    return false;
  }

  /**
   * 清除所有同意记录
   */
  clearConsent(): void {
    try {
      localStorage.removeItem(this.CONSENT_KEY);
    } catch (error) {
      console.warn('无法清除localStorage:', error);
    }
    
    this.deleteCookie(this.CONSENT_COOKIE);
  }

  /**
   * 验证同意记录是否有效
   */
  private isValidConsent(consent: any): consent is ConsentRecord {
    const isValid = (
      consent &&
      typeof consent === 'object' &&
      typeof consent.timestamp === 'number' &&
      typeof consent.version === 'string' &&
      typeof consent.deviceFingerprint === 'string' &&
      typeof consent.preferences === 'object' &&
      typeof consent.expiresAt === 'number' &&
      // 确保preferences对象有实际的属性
      Object.keys(consent.preferences).length > 0
    );
    
    return isValid;
  }

  /**
   * 生成设备指纹
   */
  private generateDeviceFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      (navigator as any).deviceMemory || 'unknown'
    ];

    return btoa(components.join('|')).slice(0, 32);
  }

  /**
   * 设置Cookie
   */
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * 获取Cookie
   */
  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    return null;
  }

  /**
   * 删除Cookie
   */
  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}
