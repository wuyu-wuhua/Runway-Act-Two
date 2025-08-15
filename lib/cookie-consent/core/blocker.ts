import { CookiePreferences } from '../types';

export class CookieBlocker {
  private blockedScripts: Set<string> = new Set();
  private blockedDomains: Set<string> = new Set();

  constructor() {
    // 初始化阻止器
    this.initializeBlocker();
  }

  /**
   * 应用用户Cookie偏好设置
   */
  applyPreferences(preferences: CookiePreferences): void {
    if (preferences.analytics === false) {
      this.blockAnalytics();
    }
    
    if (preferences.marketing === false) {
      this.blockMarketing();
    }
    
    if (preferences.social === false) {
      this.blockSocial();
    }
    
    if (preferences.preferences === false) {
      this.blockPreferences();
    }

    // 必要Cookie始终允许
    this.allowNecessary();
  }

  /**
   * 阻止分析脚本
   */
  private blockAnalytics(): void {
    const analyticsDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'googleadservices.com',
      'doubleclick.net',
      'facebook.com',
      'facebook.net',
      'hotjar.com',
      'mixpanel.com',
      'amplitude.com',
      'segment.com'
    ];

    analyticsDomains.forEach(domain => {
      this.blockedDomains.add(domain);
    });

    // 阻止常见的分析脚本
    this.blockScripts([
      'gtag',
      'ga',
      'google-analytics',
      'hotjar',
      'mixpanel',
      'amplitude',
      'segment'
    ]);
  }

  /**
   * 阻止营销脚本
   */
  private blockMarketing(): void {
    const marketingDomains = [
      'facebook.com',
      'facebook.net',
      'googleadservices.com',
      'doubleclick.net',
      'criteo.com',
      'adnxs.com',
      'googlesyndication.com',
      'amazon-adsystem.com'
    ];

    marketingDomains.forEach(domain => {
      this.blockedDomains.add(domain);
    });

    // 阻止常见的营销脚本
    this.blockScripts([
      'fbq',
      'facebook-pixel',
      'google-ads',
      'criteo',
      'adnxs'
    ]);
  }

  /**
   * 阻止社交媒体脚本
   */
  private blockSocial(): void {
    const socialDomains = [
      'facebook.com',
      'facebook.net',
      'twitter.com',
      'platform.twitter.com',
      'linkedin.com',
      'platform.linkedin.com',
      'instagram.com',
      'pinterest.com'
    ];

    socialDomains.forEach(domain => {
      this.blockedDomains.add(domain);
    });

    // 阻止社交媒体插件
    this.blockScripts([
      'facebook-sdk',
      'twitter-widgets',
      'linkedin-sdk',
      'instagram-embed',
      'pinterest-pin'
    ]);
  }

  /**
   * 阻止偏好设置脚本
   */
  private blockPreferences(): void {
    // 阻止个性化设置脚本
    this.blockScripts([
      'personalization',
      'user-preferences',
      'theme-switcher'
    ]);
  }

  /**
   * 允许必要Cookie
   */
  private allowNecessary(): void {
    // 允许会话管理、认证等必要Cookie
    const necessaryDomains = [
      window.location.hostname, // 当前域名
      'localhost',
      '127.0.0.1'
    ];

    necessaryDomains.forEach(domain => {
      this.blockedDomains.delete(domain);
    });
  }

  /**
   * 阻止特定脚本
   */
  private blockScripts(scriptNames: string[]): void {
    scriptNames.forEach(name => {
      this.blockedScripts.add(name);
    });
  }

  /**
   * 初始化阻止器
   */
  private initializeBlocker(): void {
    // 拦截fetch请求
    this.interceptFetch();
    
    // 拦截XMLHttpRequest
    this.interceptXHR();
    
    // 阻止动态脚本加载
    this.preventDynamicScripts();
    
    // 阻止iframe加载
    this.preventIframeLoading();
  }

  /**
   * 拦截fetch请求
   */
  private interceptFetch(): void {
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      if (this.shouldBlockRequest(url)) {
        console.log('Cookie Blocker: 阻止请求', url);
        return new Response('', { status: 403, statusText: 'Blocked by Cookie Blocker' });
      }
      
      return originalFetch(input, init);
    };
  }

  /**
   * 拦截XMLHttpRequest
   */
  private interceptXHR(): void {
    const originalOpen = XMLHttpRequest.prototype.open;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
      const urlString = url.toString();
      
      // 检查是否应该阻止
      if ((window as any).cookieBlocker?.shouldBlockRequest(urlString)) {
        console.log('Cookie Blocker: 阻止XHR请求', urlString);
        return;
      }
      
      return originalOpen.call(this, method, url, async, username, password);
    };
  }

  /**
   * 阻止动态脚本加载
   */
  private preventDynamicScripts(): void {
    const originalCreateElement = document.createElement;
    
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute;
        
        element.setAttribute = function(name: string, value: string) {
          if (name === 'src' && (window as any).cookieBlocker?.shouldBlockRequest(value)) {
            console.log('Cookie Blocker: 阻止脚本加载', value);
            return;
          }
          
          return originalSetAttribute.call(this, name, value);
        };
      }
      
      return element;
    };
  }

  /**
   * 阻止iframe加载
   */
  private preventIframeLoading(): void {
    const originalCreateElement = document.createElement;
    
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'iframe') {
        const originalSetAttribute = element.setAttribute;
        
        element.setAttribute = function(name: string, value: string) {
          if (name === 'src' && (window as any).cookieBlocker?.shouldBlockRequest(value)) {
            console.log('Cookie Blocker: 阻止iframe加载', value);
            return;
          }
          
          return originalSetAttribute.call(this, name, value);
        };
      }
      
      return element;
    };
  }

  /**
   * 检查是否应该阻止请求
   */
  shouldBlockRequest(url: string): boolean {
    try {
      const urlObj = new URL(url, window.location.origin);
      const hostname = urlObj.hostname.toLowerCase();
      
      // 检查是否在阻止列表中
      for (const blockedDomain of Array.from(this.blockedDomains)) {
        if (hostname.includes(blockedDomain) || blockedDomain.includes(hostname)) {
          return true;
        }
      }
      
      // 检查脚本名称
      for (const blockedScript of Array.from(this.blockedScripts)) {
        if (url.toLowerCase().includes(blockedScript.toLowerCase())) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      // 如果URL解析失败，允许请求
      return false;
    }
  }

  /**
   * 获取阻止统计
   */
  getBlockingStats(): { blockedDomains: number; blockedScripts: number } {
    return {
      blockedDomains: this.blockedDomains.size,
      blockedScripts: this.blockedScripts.size
    };
  }

  /**
   * 清除所有阻止规则
   */
  clearBlockingRules(): void {
    this.blockedScripts.clear();
    this.blockedDomains.clear();
  }
}
