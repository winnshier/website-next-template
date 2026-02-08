# 企业级官网模板项目

> 基于 Next.js 14 的现代化企业级官网模板，支持多语言、SEO优化、响应式设计和Docker部署。

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ 特性

- 🌍 **多语言支持** - 内置英文和简体中文，易于扩展
- 🎨 **响应式设计** - PC端和移动端完美适配
- 🚀 **性能优化** - 静态生成、ISR、图片懒加载
- 🔍 **SEO友好** - 自动生成sitemap、结构化数据、动态metadata
- 🐳 **Docker部署** - 支持测试和正式环境
- 📱 **PWA就绪** - 支持离线访问和安装
- 🎭 **动画效果** - Framer Motion平滑过渡动画
- 🔒 **类型安全** - 完整的TypeScript类型系统

## 📸 预览

### 首页
- Hero区域（全屏背景 + CTA）
- 核心特性展示
- 统计数据动画
- 行动号召区域

### 产品页
- PPT式全屏滑块展示
- 键盘方向键控制
- 平滑过渡动画
- 页面指示器

### 关于我们
- 公司介绍（使命、愿景）
- 团队成员展示
- 发展历程时间轴
- 联系方式

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn 或 pnpm

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd web-tem

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建

```bash
# 生产构建
npm run build

# 启动生产服务器
npm start
```

## 📁 项目结构

```
web-tem/
├── app/                      # Next.js App Router
│   ├── [locale]/            # 多语言路由
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页
│   │   ├── products/        # 产品页
│   │   └── about/           # 关于我们
│   ├── api/health/          # 健康检查API
│   ├── sitemap.ts           # Sitemap生成
│   └── robots.ts            # Robots.txt
├── components/              # React组件
│   ├── layout/             # 布局组件
│   ├── products/           # 产品组件
│   └── shared/             # 共享组件
├── lib/                    # 工具库
│   ├── api/                # API请求模块
│   ├── seo/                # SEO工具
│   ├── hooks/              # React Hooks
│   └── utils/              # 工具函数
├── public/                 # 静态资源
│   ├── locales/            # 多语言文件
│   ├── images/             # 图片
│   └── videos/             # 视频
├── content/                # 静态内容（JSON）
├── middleware.ts           # 国际化中间件
└── next.config.js          # Next.js配置
```

## 🌐 多语言

项目默认支持英文（en）和简体中文（zh）。

### 添加新语言

1. 在 `public/locales/` 创建新语言目录
2. 复制翻译文件并翻译
3. 更新 `middleware.ts` 的 `locales` 数组
4. 更新 `lib/i18n/config.ts`

## 🎨 自定义

### 修改主题颜色

编辑 `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### 修改内容

编辑 `content/` 目录下的JSON文件：
- `home.json` - 首页内容
- `products.json` - 产品数据
- `about.json` - 关于我们数据

### 连接外部API

配置环境变量：

```bash
NEXT_PUBLIC_API_URL=https://your-api.com
```

API请求失败时会自动降级到静态JSON。

## 🐳 Docker部署

项目提供三个 Docker 管理脚本，简化部署流程。**支持自动上传静态文件到 CDN**。

### 快速部署

```bash
# 本地开发环境（端口3000）
./docker-local.sh up

# 测试环境（端口8080/8443）
./docker-staging.sh up

# 正式环境（端口80/443）
./docker-production.sh up
```

### CDN 加速（可选）

如果配置了 CDN，部署时会自动上传静态文件到对象存储：

**配置方法**：
```bash
# 在 .env.production 中添加
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
OSS_BUCKET=oss://your-bucket-name
CDN_PROVIDER=aliyun  # 或 tencent
```

**优势**：
- ✅ 全球 CDN 加速，访问更快
- ✅ 不占用服务器带宽
- ✅ 自动上传，无需手动操作
- ✅ 上传失败不影响部署

详细配置请查看 [DOCKER.md - CDN 配置指南](./DOCKER.md#cdn-配置指南)

### 常用命令

```bash
./docker-{env}.sh up       # 启动服务
./docker-{env}.sh down     # 停止服务
./docker-{env}.sh restart  # 重启服务
./docker-{env}.sh logs     # 查看日志
./docker-{env}.sh status   # 查看状态
./docker-{env}.sh help     # 帮助信息
```

### 环境准备

```bash
# 本地环境
cp config/.env.example .env.docker

# 测试环境
cp config/.env.staging.example .env.staging

# 正式环境
cp config/.env.production.example .env.production
vim .env.production  # 配置环境变量
```

### 健康检查

```bash
# 本地环境
curl http://localhost:3000/api/health

# 测试环境
curl http://localhost:8080/api/health

# 正式环境
curl https://yourdomain.com/api/health
```

详细部署文档请查看 [DOCKER.md](./DOCKER.md)

## 📝 环境变量

创建 `.env.local` 文件：

```bash
# 站点配置
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_ENV=development

# API配置
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET_KEY=your_secret_key

# CDN配置
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
```

## 🧪 开发

### 可用命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm start            # 启动生产服务器
npm run lint         # 代码检查
npm run type-check   # 类型检查
```

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

## 📚 文档

- [部署指南](./DOCKER.md) - Docker 部署完整文档（含 CDN 配置）
- [CDN 使用指南](./docs/CDN_USAGE.md) - 静态资源 CDN 配置和使用方法
- [开发指南](./CLAUDE.md) - 开发规范和快速参考
- [完整规划文档](./PROJECT_PLAN.md) - 详细技术方案
- [开发进度](./DEVELOPMENT.md) - 实时进度记录

## 🔧 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3
- **动画**: Framer Motion 11
- **国际化**: next-intl 3
- **SEO**: next-sitemap 4
- **部署**: Docker + Nginx

## 📊 性能

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **First Load JS**: ~96KB (gzipped)

## 🌟 特色功能

### 1. 智能语言检测
- 自动检测浏览器语言
- Cookie持久化语言偏好
- 一键切换语言

### 2. SEO优化
- 自动生成sitemap.xml
- LD+JSON结构化数据
- 多语言hreflang标签
- 动态Open Graph图片

### 3. 响应式设计
- PC端和移动端不同的导航栏
- PC端和移动端不同的页脚
- 自适应布局和字体大小

### 4. API降级
- API请求失败自动使用静态JSON
- 保证网站始终可用
- 无缝切换，用户无感知

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👥 作者

企业级官网模板项目团队

---

**最后更新**: 2026-02-08
