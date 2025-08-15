# Cookie 同意管理系统

这是一个完整的、可复用的Cookie同意管理系统，符合GDPR、CCPA等隐私法规要求。

## 🚀 功能特性

- ✅ **智能弹窗触发**：6个月有效期，设备指纹检测
- ✅ **三种选择模式**：全部接受、全部拒绝、自定义偏好
- ✅ **严格拒绝执行**：用户拒绝后立即阻止所有非必要追踪
- ✅ **设备指纹识别**：检测设备/浏览器变更
- ✅ **多语言支持**：中英文界面
- ✅ **完全前端实现**：无需后端支持

## 📦 安装使用

### 1. 基础集成

```tsx
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
```

### 2. 自定义配置

```tsx
import { CookieConsentManager, ConsentModal } from '@/lib/cookie-consent';

const customConfig = {
  companyName: '我的公司',
  privacyPolicyUrl: '/privacy',
  modalTitle: '自定义标题',
  modalDescription: '自定义描述',
  categories: [
    {
      id: 'necessary',
      name: '必要Cookie',
      description: '网站运行必需',
      required: true,
      defaultEnabled: true
    },
    // ... 更多类别
  ]
};

const manager = new CookieConsentManager(customConfig);
manager.initialize();
```

## 🔧 核心组件

### CookieConsentManager
主要的Cookie管理类，负责：
- 检查是否需要显示同意弹窗
- 处理用户选择
- 应用Cookie阻止规则
- 管理同意状态

### ConsentModal
Cookie同意弹窗组件，包含：
- 全部接受按钮
- 全部拒绝按钮
- 自定义偏好设置
- 响应式设计

### CookieBanner
页面底部横幅，提供：
- 快速访问Cookie设置
- 一键接受/拒绝
- 隐私政策链接

## 🎯 使用场景

### 新用户首次访问
1. 自动检测并显示同意弹窗
2. 用户选择Cookie偏好
3. 保存选择并应用阻止规则

### 老用户再次访问
1. 检查6个月有效期
2. 检查设备指纹是否变化
3. 如无变化，不显示弹窗

### 用户撤回同意
1. 清除所有Cookie偏好
2. 重新显示同意弹窗
3. 重新应用阻止规则

## 🛡️ 安全特性

### 严格拒绝执行
当用户选择"全部拒绝"时：
- 仅允许必要Cookie（会话管理、认证等）
- 阻止所有分析脚本（Google Analytics、Hotjar等）
- 阻止所有营销追踪（Facebook Pixel、Google Ads等）
- 阻止所有社交媒体插件

### 设备指纹检测
- 检测浏览器类型和版本
- 检测屏幕分辨率和颜色深度
- 检测时区和硬件信息
- 检测IP地址变化

## 📱 响应式设计

- 移动端友好的弹窗布局
- 自适应按钮排列
- 触摸友好的交互设计
- 支持键盘导航

## 🌐 多语言支持

默认支持中文，可轻松扩展其他语言：

```tsx
const config = {
  modalTitle: {
    zh: 'Cookie 使用同意',
    en: 'Cookie Consent'
  },
  modalDescription: {
    zh: '根据法律...',
    en: 'According to the law...'
  }
};
```

## 🧪 测试验证

### 开发环境测试面板
在开发环境中会显示测试控制面板，包含：
- 强制显示弹窗
- 撤回同意
- 查看当前设置
- 查看阻止统计

### 验证检查清单
- [ ] 清除数据后重新弹窗
- [ ] 拒绝后无追踪脚本加载
- [ ] 核心功能正常运行
- [ ] 同意记录正确保存
- [ ] 6个月后重新弹窗

## 📋 合规性

### GDPR 兼容
- 明确同意机制
- 撤回权利
- 数据最小化
- 透明披露

### CCPA 兼容
- 选择退出机制
- 数据披露权利
- 删除权利

## 🔄 在其他项目中使用

### 方法1：复制模块
```bash
cp -r lib/cookie-consent /path/to/new-project/lib/
```

### 方法2：Git子模块
```bash
git submodule add https://github.com/your-org/cookie-consent-manager.git lib/cookie-consent
```

### 方法3：创建npm包
将整个模块发布为npm包，供多个项目使用。

## 📝 更新日志

### v1.0.0 (当前版本)
- ✅ 基础Cookie管理功能
- ✅ 智能弹窗触发
- ✅ 严格拒绝执行
- ✅ 设备指纹检测
- ✅ 响应式UI设计

### 计划功能
- 🔄 高级分析报告
- 🔄 更多语言支持
- 🔄 主题定制
- 🔄 性能优化

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个系统！

## 📄 许可证

MIT License - 可自由使用和修改。
