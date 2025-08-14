# Runway Act Two

一个基于Next.js、React和Tailwind CSS构建的现代化Web应用框架。

## 🚀 技术栈

- **Next.js 14** - React框架，支持App Router和Server Components
- **React 18** - 用户界面库
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **React Bits** - 可复用的React组件和模式

## 📦 安装

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 🏗️ 项目结构

```
Runway-Act-Two/
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── pricing/           # 价格页面
│   │   └── page.tsx       # 价格方案展示
│   ├── ai-effect-generator/ # AI特效生成器
│   ├── about/             # 关于我们
│   ├── blog/              # 博客
│   ├── privacy/           # 隐私政策
│   └── terms/             # 使用条款
├── components/            # React组件
│   ├── Header.tsx         # 头部导航
│   ├── Hero.tsx           # 英雄区域
│   ├── Features.tsx       # 功能展示
│   ├── Footer.tsx         # 页脚
│   └── ui/                # UI组件库
│       ├── Button.tsx     # 按钮组件
│       ├── Card.tsx       # 卡片组件
│       └── dialog.tsx     # 对话框组件
├── lib/                   # 工具库
│   ├── translations.ts    # 多语言翻译
│   ├── languageContext.tsx # 语言上下文
│   └── utils.ts           # 工具函数
├── public/                # 静态资源
├── package.json           # 项目配置
├── next.config.js         # Next.js配置
├── tailwind.config.js     # Tailwind CSS配置
├── postcss.config.js      # PostCSS配置
└── tsconfig.json          # TypeScript配置
```

## 🎨 功能特性

### 多语言支持
- 支持中文和英文双语切换
- 基于React Context的语言管理
- 完整的翻译系统

### 价格页面
- 三个订阅套餐：入门版、专业版、企业版
- 响应式设计，适配各种设备
- 高级简约的UI设计
- 常见问题解答区域

### AI特效生成器
- 基于Runway API的视频特效生成
- 三步式操作流程
- 实时处理状态显示

## 🎨 自定义样式

```javascript
colors: {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... 更多颜色
  }
}
```

## 📱 响应式设计

项目完全支持响应式设计，使用Tailwind CSS的响应式前缀：
- `sm:` - 640px及以上
- `md:` - 768px及以上
- `lg:` - 1024px及以上
- `xl:` - 1280px及以上

## 🔧 开发

### 添加新页面

在`app`目录下创建新的文件夹和`page.tsx`文件：

```typescript
// app/about/page.tsx
export default function AboutPage() {
  return (
    <div>
      <h1>关于我们</h1>
    </div>
  )
}
```

### 添加新组件

在`components`目录下创建新的组件文件：

```typescript
// components/NewComponent.tsx
export default function NewComponent() {
  return (
    <div className="card">
      <h2>新组件</h2>
    </div>
  )
}
```

## 🚀 部署

项目可以部署到各种平台：

### Vercel (推荐)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# 上传 .next 文件夹到 Netlify
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系

如有问题，请通过以下方式联系：
- 邮箱: contact@runway-act-two.com
- GitHub: [项目仓库](https://github.com/your-username/runway-act-two) 