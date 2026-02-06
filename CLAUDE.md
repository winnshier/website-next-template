# 企业级官网模板项目 - Claude 开发指南

## 项目概述

这是一个基于 Next.js 14 (App Router) 的企业级官网模板项目，支持多语言、SEO优化、响应式设计、Docker部署等企业级特性。

## 技术栈

### 核心框架
- **Next.js 14+** (App Router) - React框架
- **TypeScript** - 类型安全
- **React 18+** - UI库

### 样式与动画
- **Tailwind CSS** - 原子化CSS
- **Framer Motion** - 动画库
- **keen-slider** - 轮播/滑块

### 国际化与SEO
- **next-intl** - 多语言支持（英文/中文）
- **next-sitemap** - 自动生成sitemap
- 内置 `generateMetadata` - 动态SEO

### 部署
- **Docker** + **Nginx** - 容器化部署
- 支持测试环境和正式环境

## 项目结构

```
web-tem/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # 多语言路由
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   ├── products/            # 产品页
│   │   └── about/               # 关于我们
│   ├── api/health/              # 健康检查
│   ├── icon.tsx                 # Favicon
│   ├── opengraph-image.tsx      # OG图片
│   └── sitemap.ts               # Sitemap
│
├── components/                   # React组件
│   ├── layout/                  # 布局组件
│   │   ├── navigation/          # 导航栏（PC/移动端）
│   │   ├── footer/              # 页脚（PC/移动端）
│   │   └── ResponsiveLayout.tsx # 响应式布局容器
│   ├── home/                    # 首页组件
│   ├── products/                # 产品页组件
│   ├── about/                   # 关于我们组件
│   └── shared/                  # 共享组件
│
├── lib/                         # 工具库
│   ├── api/                     # API请求模块
│   │   ├── client.ts           # HTTP客户端
│   │   ├── endpoints.ts        # API端点
│   │   ├── types.ts            # 类型定义
│   │   └── fetchers/           # 数据获取函数
│   ├── i18n/                   # 国际化配置
│   ├── seo/                    # SEO工具
│   ├── hooks/                  # React Hooks
│   └── utils/                  # 工具函数
│
├── public/                      # 静态资源
│   ├── locales/                # 多语言文件
│   ├── images/                 # 图片
│   └── videos/                 # 视频
│
├── content/                     # 静态内容（JSON）
├── middleware.ts                # 国际化中间件
├── next.config.js              # Next.js配置
├── tailwind.config.ts          # Tailwind配置
├── Dockerfile                  # Docker配置
├── docker-compose.yml          # Docker编排
└── .env.example                # 环境变量模板
```

## 核心功能

### 1. 多语言国际化

- 支持英文(en)和简体中文(zh)
- 使用 `middleware.ts` 自动检测语言
- 语言文件位于 `public/locales/`
- 通过 `[locale]` 动态路由实现

**使用示例：**
```typescript
import { getTranslations } from 'next-intl/server';

const t = await getTranslations({ locale, namespace: 'home' });
const title = t('title');
```

### 2. SEO优化

- 自动生成 sitemap.xml
- LD+JSON 结构化数据
- 动态 metadata（title、description、OG、Twitter Card）
- 多语言 hreflang 标签
- 健康检查端点：`/api/health`

### 3. 响应式设计

- PC端和移动端不同的导航栏/页脚
- 使用 `useMediaQuery` hook（Client Component）
- Tailwind 断点：sm(640px)、md(768px)、lg(1024px)、xl(1280px)

### 4. API请求模块

- 封装的 HTTP 客户端（`lib/api/client.ts`）
- 支持超时、重试、缓存
- API失败时自动降级到静态JSON
- 构建时预生成页面（ISR支持）

**使用示例：**
```typescript
import { getHomeData } from '@/lib/api/fetchers/home';

const homeData = await getHomeData(locale);
```

### 5. 性能优化

- 图片懒加载（next/image）
- 视频懒加载（Intersection Observer）
- 代码分割（dynamic import）
- 字体优化（next/font）
- 动画降级（prefers-reduced-motion）

### 6. Docker部署

支持三个环境：
- **开发环境**: 本地开发（localhost:3000）
- **测试环境**: docker-compose.staging.yml（端口8080/8443）
- **正式环境**: docker-compose.production.yml（端口80/443）

**部署命令：**
```bash
# 测试环境
docker compose -f docker-compose.staging.yml up -d --build

# 正式环境
docker compose -f docker-compose.production.yml up -d --build
```

## 环境变量

### 必需变量
```bash
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
NEXT_PUBLIC_ENV=production  # development/staging/production
```

### 可选变量
```bash
API_SECRET_KEY=your_secret_key
IMAGE_CDN_TOKEN=your_cdn_token
NEXT_PUBLIC_SHOW_DEBUG_INFO=false
```

## 开发规范

### 1. 组件规范

- Server Component 为默认，需要交互时使用 `'use client'`
- 文件名使用 PascalCase（如 `HeroSection.tsx`）
- 组件导出使用命名导出

### 2. 样式规范

- 优先使用 Tailwind CSS 类名
- 复杂样式使用 `clsx` 或 `cva` 管理
- 响应式使用 Tailwind 断点前缀（sm:、md:、lg:等）

### 3. 类型规范

- 所有API响应必须有类型定义（`lib/api/types.ts`）
- Props 使用 TypeScript interface
- 避免使用 `any`，使用 `unknown` 代替

### 4. 国际化规范

- 所有文案必须通过 `t()` 函数获取
- 翻译文件按命名空间组织（common、home、products等）
- 新增语言需要更新 `middleware.ts` 和 `lib/i18n/config.ts`

### 5. API请求规范

- 所有API请求通过 `lib/api/client.ts` 发起
- 新增端点在 `lib/api/endpoints.ts` 定义
- 数据获取函数放在 `lib/api/fetchers/` 目录
- 必须实现降级到静态JSON的逻辑

## 常用命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 类型检查
npm run type-check

# Lint检查
npm run lint

# Docker构建
docker compose build

# Docker启动
docker compose up -d

# 查看日志
docker compose logs -f web
```

## 页面说明

### 首页 (`app/[locale]/page.tsx`)
- Hero区域：全屏背景 + 标题 + CTA
- 特色介绍：3-4个特性卡片
- 产品预览：产品展示
- 统计数据：动画数字展示

### 产品页 (`app/[locale]/products/page.tsx`)
- PPT式全屏滑块展示
- 支持键盘、鼠标、触摸操作
- 页面指示器

### 关于我们 (`app/[locale]/about/page.tsx`)
- 公司介绍
- 团队展示
- 发展历程（时间轴）
- 联系方式

## 故障排查

### 1. 构建失败
- 检查 TypeScript 类型错误
- 检查环境变量是否配置
- 检查依赖是否完整安装

### 2. 多语言不生效
- 检查 `middleware.ts` 配置
- 检查 `public/locales/` 文件是否存在
- 检查浏览器 Accept-Language 头

### 3. Docker启动失败
- 检查端口是否被占用
- 检查 `.env.production` 文件是否存在
- 检查 Docker 日志：`docker compose logs`

### 4. API请求失败
- 检查 `NEXT_PUBLIC_API_URL` 配置
- 检查网络连接
- 查看浏览器控制台错误
- 会自动降级到静态JSON

## 扩展指南

### 添加新页面
1. 在 `app/[locale]/` 下创建新目录
2. 创建 `page.tsx` 和 `loading.tsx`
3. 实现 `generateMetadata` 函数
4. 更新导航栏链接

### 添加新语言
1. 在 `public/locales/` 创建新语言目录
2. 复制翻译文件并翻译
3. 更新 `middleware.ts` 的 `locales` 数组
4. 更新 `lib/i18n/config.ts`
5. 添加对应字体（如需要）

### 添加新API端点
1. 在 `lib/api/endpoints.ts` 定义端点
2. 在 `lib/api/types.ts` 定义类型
3. 在 `lib/api/fetchers/` 创建获取函数
4. 实现降级逻辑

## 性能指标

### Core Web Vitals 目标
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **FCP**: < 1.8s

### 浏览器支持
- Chrome 100+
- Safari 15+
- Firefox 100+
- Edge 100+

## 安全注意事项

1. **环境变量**: 敏感信息不要提交到Git
2. **API密钥**: 使用环境变量管理
3. **HTTPS**: 正式环境必须使用HTTPS
4. **CSP**: 配置内容安全策略
5. **依赖更新**: 定期更新依赖包

## 参考文档

- [完整规划文档](./PROJECT_PLAN.md)
- [Next.js 官方文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [next-intl 文档](https://next-intl-docs.vercel.app/)

## 联系方式

如有问题，请查看：
1. `PROJECT_PLAN.md` - 完整技术方案
2. `DEVELOPMENT.md` - 开发进度记录
3. GitHub Issues - 问题追踪

---

**最后更新**: 2026-02-06
**版本**: 1.0.0
