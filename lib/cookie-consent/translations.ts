export interface CookieConsentTranslations {
  // 底部横条
  title: string;
  description: string;
  acceptAll: string;
  rejectAll: string;
  customPreferences: string;
  close: string;
  
  // 自定义偏好弹窗
  customPreferencesTitle: string;
  necessary: string;
  necessaryDesc: string;
  alwaysActive: string;
  functional: string;
  functionalDesc: string;
  performance: string;
  performanceDesc: string;
  analytics: string;
  analyticsDesc: string;
  marketing: string;
  marketingDesc: string;
  rejectAllCookies: string;
  savePreferences: string;
}

export const cookieConsentTranslations: Record<string, CookieConsentTranslations> = {
  zh: {
    // 底部横条
    title: "Cookie 使用同意",
    description: "我们使用Cookie来改善您的浏览体验、分析网站流量并了解您如何使用我们的服务。通过点击\"全部接受\"，您同意我们使用所有类型的Cookie。您也可以选择\"自定义偏好\"来管理特定的Cookie设置。",
    acceptAll: "全部接受",
    rejectAll: "全部拒绝",
    customPreferences: "自定义偏好",
    close: "关闭",
    
    // 自定义偏好弹窗
    customPreferencesTitle: "自定义同意偏好",
    necessary: "必要的",
    necessaryDesc: "必要的 Cookie 是启用本网站基本功能（例如提供安全登录或调整您的同意偏好设置）所必需的。这些 Cookie 不会存储任何可识别个人身份的数据。",
    alwaysActive: "始终处于活动状态",
    functional: "功能",
    functionalDesc: "功能性 cookie 有助于执行某些功能，例如在社交媒体平台上分享网站内容、收集反馈和其他第三方功能。",
    performance: "表现",
    performanceDesc: "性能 cookie 用于了解和分析网站的关键性能指标，有助于为访问者提供更好的用户体验。",
    analytics: "分析",
    analyticsDesc: "分析性 Cookie 用于了解访客如何与网站互动。这些 Cookie 有助于提供访客数量、跳出率、流量来源等指标信息。",
    marketing: "广告",
    marketingDesc: "广告 cookie 用于根据访问者之前访问过的页面向他们提供定制广告，并分析广告活动的有效性。",
    rejectAllCookies: "全部拒绝",
    savePreferences: "保存偏好"
  },
  
  en: {
    // Bottom banner
    title: "Cookie Consent",
    description: "We use cookies to improve your browsing experience, analyze website traffic, and understand how you use our services. By clicking \"Accept All\", you consent to our use of all types of cookies. You can also choose \"Custom Preferences\" to manage specific cookie settings.",
    acceptAll: "Accept All",
    rejectAll: "Reject All",
    customPreferences: "Custom Preferences",
    close: "Close",
    
    // Custom preferences modal
    customPreferencesTitle: "Custom Consent Preferences",
    necessary: "Necessary",
    necessaryDesc: "Necessary cookies are essential for enabling basic website functionality, such as providing secure login or adjusting your consent preference settings. These cookies do not store any personally identifiable data.",
    alwaysActive: "Always Active",
    functional: "Functional",
    functionalDesc: "Functional cookies help perform certain functions, such as sharing website content on social media platforms, collecting feedback, and other third-party functions.",
    performance: "Performance",
    performanceDesc: "Performance cookies are used to understand and analyze key performance metrics of the website, helping to provide visitors with a better user experience.",
    analytics: "Analytics",
    analyticsDesc: "Analytics cookies are used to understand how visitors interact with the website. These cookies help provide information about visitor numbers, bounce rates, traffic sources, and other metrics.",
    marketing: "Marketing",
    marketingDesc: "Marketing cookies are used to provide visitors with customized advertisements based on pages they have previously visited, and to analyze the effectiveness of advertising campaigns.",
    rejectAllCookies: "Reject All",
    savePreferences: "Save Preferences"
  }
};

// 获取当前语言的翻译
export function getCookieConsentTranslations(language: string = 'zh'): CookieConsentTranslations {
  return cookieConsentTranslations[language] || cookieConsentTranslations['zh'];
}
