# 企业级官网模板项目规划文档

## 项目概述

本项目旨在构建一个高性能、SEO友好、支持多语言的企业级官网模板，采用现代化技术栈，提供优秀的用户体验和开发体验。

---

## 技术栈

### 核心框架
- **Next.js 14+** (App Router)
- **TypeScript** - 类型安全
- **React 18+** - UI框架

### 样式与UI
- **Tailwind CSS** - 原子化CSS框架
- **clsx / cva** - 条件样式管理
- 自定义主题配置（品牌色、断点等）

### 国际化
- **next-intl** 或 **next-i18next** - 多语言支持
- 基于 `app/[locale]` 路由结构
- 支持服务端语言检测和客户端切换

### 动画与交互

- **Framer Motion** - 主要动画库（SSR友好）
- **keen-slider** - PPT式全屏切换和轮播

### 图片与媒体优化

- **next/image** - 内置图片优化（lazy loading、WebP/AVIF）
- **Intersection Observer API** - 视频懒加载
- 外部CDN（可选）：Cloudinary / ImageKit

### SEO工具

- **next-sitemap** - 自动生成sitemap.xml和robots.txt
- 内置 `generateMetadata` - 动态SEO配置

---

## 项目目录结构

```plaintext
web-tem/
├── app/
│   ├── [locale]/                    # 多语言路由
│   │   ├── layout.tsx              # 根布局（导航、页脚）
│   │   ├── loading.tsx             # 加载骨架屏
│   │   ├── error.tsx               # 错误边界
│   │   ├── not-found.tsx           # 404页面
│   │   ├── page.tsx                # 首页
│   │   ├── products/
│   │   │   ├── page.tsx            # 产品页（PPT式展示）
│   │   │   ├── loading.tsx         # 产品页加载状态
│   │   │   └── error.tsx           # 产品页错误处理
│   │   └── about/
│   │       ├── page.tsx            # 关于我们页
│   │       └── loading.tsx         # 关于页加载状态
│   ├── api/                        # API路由（可选）
│   ├── icon.tsx                    # 动态favicon生成
│   ├── opengraph-image.tsx         # 动态OG图片生成
│   ├── manifest.ts                 # PWA manifest
│   ├── sitemap.ts                  # 动态sitemap生成
│   └── robots.ts                   # robots.txt配置
│
├── middleware.ts                    # 国际化中间件（语言检测、重定向）
│
├── components/
│   ├── layout/
│   │   ├── navigation/
│   │   │   ├── DesktopNav.tsx     # PC端导航
│   │   │   └── MobileNav.tsx      # 移动端导航
│   │   ├── footer/
│   │   │   ├── DesktopFooter.tsx  # PC端页脚
│   │   │   └── MobileFooter.tsx   # 移动端页脚
│   │   └── ResponsiveLayout.tsx   # 响应式布局容器（Client Component）
│   ├── home/                       # 首页组件
│   ├── products/
│   │   └── FullScreenSlider.tsx   # PPT式产品展示
│   ├── about/                      # 关于我们组件
│   ├── shared/
│   │   ├── LazyImage.tsx          # 懒加载图片组件
│   │   ├── LazyVideo.tsx          # 懒加载视频组件
│   │   └── AnimatedSection.tsx    # 通用动画容器
│   └── locale/
│       └── LocaleSwitcher.tsx     # 语言切换器
│
├── lib/
│   ├── api/
│   │   ├── client.ts              # 封装的HTTP客户端
│   │   ├── endpoints.ts           # API端点定义
│   │   ├── types.ts               # API响应类型定义
│   │   └── fetchers/              # 数据获取函数
│   │       ├── home.ts            # 首页数据
│   │       ├── products.ts        # 产品数据
│   │       └── about.ts           # 关于我们数据
│   ├── i18n/
│   │   ├── config.ts              # i18n配置
│   │   └── request.ts             # 服务端i18n
│   ├── seo/
│   │   ├── metadata.ts            # 通用metadata生成（含metadataBase）
│   │   └── structured-data.ts     # LD+JSON结构化数据
│   ├── hooks/
│   │   ├── useMediaQuery.ts       # 响应式断点hook（Client）
│   │   ├── useIntersectionObserver.ts  # 懒加载hook
│   │   └── usePrefersReducedMotion.ts  # 动画降级hook（Client）
│   └── utils/
│       └── animations.ts          # 动画配置常量
│
├── public/
│   ├── locales/                   # 多语言JSON文件
│   │   ├── en/
│   │   │   └── common.json
│   │   └── zh/
│   │       └── common.json
│   ├── images/                    # 静态图片资源
│   └── videos/                    # 静态视频资源
│
├── styles/
│   └── globals.css                # 全局样式
│
├── content/                        # 内容数据（可选）
│   ├── home.json
│   ├── products.json
│   └── about.json
│
├── next.config.js                 # Next.js配置
├── tailwind.config.ts             # Tailwind配置
├── tsconfig.json                  # TypeScript配置
└── package.json
```

---

## 数据获取与API请求模块

### 数据来源策略

项目支持两种数据来源方式：

1. **静态JSON文件**（默认）：内容存储在 `content/` 目录
2. **外部API接口**：从外部API获取数据，构建时预生成页面

### API请求模块架构

#### 1. HTTP客户端封装

```typescript
// lib/api/client.ts
import { cache } from 'react';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
  timeout?: number;
}

class APIClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private buildURL(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    return url.toString();
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { params, timeout = 10000, ...fetchConfig } = config;
    const url = this.buildURL(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        headers: {
          ...this.defaultHeaders,
          ...fetchConfig.headers,
        },
        signal: controller.signal,
        // Next.js 缓存配置
        next: {
          revalidate: fetchConfig.next?.revalidate ?? 3600, // 默认1小时
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// 创建单例实例
export const apiClient = new APIClient(
  process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'
);

// 使用 React cache 包装，避免重复请求
export const cachedGet = cache(apiClient.get.bind(apiClient));
```

#### 2. API端点定义

```typescript
// lib/api/endpoints.ts
export const API_ENDPOINTS = {
  // 首页
  HOME: '/api/home',
  HOME_HERO: '/api/home/hero',
  HOME_FEATURES: '/api/home/features',

  // 产品
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,

  // 关于我们
  ABOUT: '/api/about',
  ABOUT_TEAM: '/api/about/team',
  ABOUT_TIMELINE: '/api/about/timeline',

  // 通用
  SETTINGS: '/api/settings',
} as const;
```

#### 3. 类型定义

```typescript
// lib/api/types.ts
export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 首页数据类型
export interface HomeHeroData {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  backgroundVideo?: string;
}

export interface HomeFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface HomeData {
  hero: HomeHeroData;
  features: HomeFeature[];
  stats: {
    label: string;
    value: string;
  }[];
}

// 产品数据类型
export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  order: number;
}

export interface ProductsData {
  products: Product[];
  total: number;
}

// 关于我们数据类型
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  avatar: string;
  bio?: string;
}

export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface AboutData {
  company: {
    name: string;
    description: string;
    mission: string;
    vision: string;
  };
  team: TeamMember[];
  timeline: TimelineEvent[];
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}
```

#### 4. 数据获取函数

```typescript
// lib/api/fetchers/home.ts
import { cachedGet } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { APIResponse, HomeData } from '../types';

export async function getHomeData(locale: string): Promise<HomeData> {
  try {
    const response = await cachedGet<APIResponse<HomeData>>(
      API_ENDPOINTS.HOME,
      {
        params: { locale },
        next: { revalidate: 3600 }, // 1小时重新验证
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch home data');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching home data:', error);

    // 降级到静态JSON
    const fallbackData = await import(`@/content/home.json`);
    return fallbackData.default[locale] || fallbackData.default.en;
  }
}
```

```typescript
// lib/api/fetchers/products.ts
import { cachedGet } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { APIResponse, ProductsData, Product } from '../types';

export async function getProducts(locale: string): Promise<Product[]> {
  try {
    const response = await cachedGet<APIResponse<ProductsData>>(
      API_ENDPOINTS.PRODUCTS,
      {
        params: { locale },
        next: { revalidate: 1800 }, // 30分钟
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch products');
    }

    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);

    // 降级到静态JSON
    const fallbackData = await import(`@/content/products.json`);
    return fallbackData.default[locale] || fallbackData.default.en;
  }
}

export async function getProductById(
  id: string,
  locale: string
): Promise<Product | null> {
  try {
    const response = await cachedGet<APIResponse<Product>>(
      API_ENDPOINTS.PRODUCT_DETAIL(id),
      {
        params: { locale },
        next: { revalidate: 3600 },
      }
    );

    if (!response.success) {
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}
```

```typescript
// lib/api/fetchers/about.ts
import { cachedGet } from '../client';
import { API_ENDPOINTS } from '../endpoints';
import { APIResponse, AboutData } from '../types';

export async function getAboutData(locale: string): Promise<AboutData> {
  try {
    const response = await cachedGet<APIResponse<AboutData>>(
      API_ENDPOINTS.ABOUT,
      {
        params: { locale },
        next: { revalidate: 7200 }, // 2小时
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to fetch about data');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching about data:', error);

    // 降级到静态JSON
    const fallbackData = await import(`@/content/about.json`);
    return fallbackData.default[locale] || fallbackData.default.en;
  }
}
```

### 在页面中使用

#### 首页示例

```typescript
// app/[locale]/page.tsx
import { getHomeData } from '@/lib/api/fetchers/home';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  // 从API获取数据（构建时预生成）
  const homeData = await getHomeData(locale);

  return (
    <div>
      <HeroSection data={homeData.hero} />
      <FeaturesSection features={homeData.features} />
      <StatsSection stats={homeData.stats} />
    </div>
  );
}

// 预生成所有语言版本
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' },
  ];
}
```

#### 产品页示例

```typescript
// app/[locale]/products/page.tsx
import { getProducts } from '@/lib/api/fetchers/products';
import { FullScreenSlider } from '@/components/products/FullScreenSlider';

export default async function ProductsPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  const products = await getProducts(locale);

  return <FullScreenSlider slides={products} />;
}

// ISR: 每30分钟重新生成
export const revalidate = 1800;
```

### 环境变量配置

```bash
# .env.local (开发环境)
NEXT_PUBLIC_API_URL=http://localhost:4000
API_SECRET_KEY=dev_secret_key

# .env.production (生产环境)
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET_KEY=prod_secret_key
```

### 静态JSON降级方案

当API请求失败时，自动降级到静态JSON文件：

```json
// content/home.json
{
  "en": {
    "hero": {
      "title": "Welcome to Our Company",
      "subtitle": "Building the future together",
      "ctaText": "Get Started",
      "ctaLink": "/products",
      "backgroundImage": "/images/hero-bg.jpg"
    },
    "features": [
      {
        "id": "1",
        "icon": "🚀",
        "title": "Fast Performance",
        "description": "Lightning-fast load times"
      }
    ],
    "stats": [
      { "label": "Clients", "value": "500+" },
      { "label": "Projects", "value": "1000+" }
    ]
  },
  "zh": {
    "hero": {
      "title": "欢迎来到我们公司",
      "subtitle": "共同构建未来",
      "ctaText": "开始使用",
      "ctaLink": "/products",
      "backgroundImage": "/images/hero-bg.jpg"
    },
    "features": [
      {
        "id": "1",
        "icon": "🚀",
        "title": "快速性能",
        "description": "闪电般的加载速度"
      }
    ],
    "stats": [
      { "label": "客户", "value": "500+" },
      { "label": "项目", "value": "1000+" }
    ]
  }
}
```

### 构建时数据预生成

Next.js会在构建时调用这些数据获取函数，生成静态HTML：

```bash
# 构建时会请求API并生成静态页面
npm run build

# 输出示例：
# ✓ Generating static pages (6/6)
# ├ /en
# ├ /en/products
# ├ /en/about
# ├ /zh
# ├ /zh/products
# └ /zh/about
```

### ISR（增量静态再生成）

对于需要定期更新的内容，使用ISR：

```typescript
// 页面级别配置
export const revalidate = 3600; // 每小时重新生成

// 或在fetch中配置
fetch(url, {
  next: { revalidate: 3600 }
});
```

### 错误处理和重试

```typescript
// lib/api/client.ts 中添加重试逻辑
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 2);
  }
}
```

### 优势

1. **灵活性**: 支持API和静态JSON两种数据源
2. **性能**: 构建时预生成，运行时无需请求
3. **可靠性**: API失败时自动降级到静态数据
4. **类型安全**: 完整的TypeScript类型定义
5. **缓存优化**: 使用React cache避免重复请求
6. **ISR支持**: 可配置定期更新策略

---

## 核心功能实现要点

### 1. 多语言国际化

#### 实现方案
- 使用 `app/[locale]` 动态路由结构
- 在 `layout.tsx` 中通过 `generateStaticParams` 预生成所有语言版本
- **中间件处理**: 在 `middleware.ts` 中检测 `Accept-Language` 头、读取locale cookie、执行语言重定向
- 客户端通过 `LocaleSwitcher` 组件切换语言（更新cookie并刷新）

#### 中间件配置
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'zh'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // 1. 检查cookie中的语言偏好
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. 检测Accept-Language头
  const headers = { 'accept-language': request.headers.get('accept-language') || '' };
  const languages = new Negotiator({ headers }).languages();

  try {
    return match(languages, locales, defaultLocale);
  } catch {
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 检查路径是否已包含locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // 路径已包含locale，刷新cookie并继续
    const locale = pathname.split('/')[1];
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', locale, { maxAge: 31536000 }); // 1年
    return response;
  }

  // 重定向到带locale的路径
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set('NEXT_LOCALE', locale, { maxAge: 31536000 }); // 1年
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)']
};
```

#### 语言文件组织
```json
// public/locales/en/common.json
{
  "nav": {
    "home": "Home",
    "products": "Products",
    "about": "About Us"
  },
  "footer": {
    "copyright": "© 2024 Company Name. All rights reserved."
  }
}
```

#### 关键代码位置
- `lib/i18n/config.ts` - 支持的语言列表、默认语言
- `app/[locale]/layout.tsx` - 语言路由和布局
- `components/locale/LocaleSwitcher.tsx` - 语言切换UI

---

### 2. SEO优化

#### Sitemap生成
- 使用 `next-sitemap` 自动生成多语言sitemap
- 配置 `next-sitemap.config.js` 包含所有页面和语言版本
- 支持 hreflang 标签自动生成

#### 结构化数据（LD+JSON）
每个页面注入对应的结构化数据：
- **首页**: Organization、WebSite、BreadcrumbList
- **产品页**: Product、ItemList
- **关于我们**: AboutPage、Organization、ContactPoint

额外SEO要素：
- **metadataBase**: 配置基础URL用于生成绝对路径
- **x-default hreflang**: 为未匹配语言提供默认版本
- **动态OG图片**: 使用 `app/opengraph-image.tsx` 生成动态Open Graph图片
- **验证标签**: Google Search Console、Bing Webmaster等验证meta标签
- **Sitelinks SearchBox**: 添加搜索框结构化数据（可选）

```typescript
// lib/seo/metadata.ts
import { Metadata } from 'next';

export const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'
);

export function generatePageMetadata(params: {
  title: string;
  description: string;
  locale: string;
  path: string;
}): Metadata {
  const { title, description, locale, path } = params;
  const url = `/${locale}${path}`;

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Company Name',
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
      languages: {
        'en': `/en${path}`,
        'zh': `/zh${path}`,
        'x-default': `/en${path}`,
      },
    },
    verification: {
      google: 'your-google-verification-code',
      // bing: 'your-bing-verification-code',
    },
  };
}
```

```typescript
// lib/seo/structured-data.ts
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-xxx-xxx-xxxx",
    "contactType": "customer service"
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Company Name",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://example.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
```

#### 动态Meta标签

使用 `generateMetadata` 为每个页面生成动态meta，包含：title、description、Open Graph、Twitter Card、canonical、hreflang。

```typescript
// app/[locale]/page.tsx
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale,
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'en': '/en',
        'zh': '/zh',
        'x-default': '/en',
      }
    }
  };
}
```

---

### 3. 响应式设计

#### 断点策略
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // 移动端
      'md': '768px',   // 平板
      'lg': '1024px',  // 小屏PC
      'xl': '1280px',  // 标准PC
      '2xl': '1536px'  // 大屏
    }
  }
}
```

#### 双端差异化组件
- **导航栏**: PC端横向菜单 vs 移动端汉堡菜单
- **页脚**: PC端多列布局 vs 移动端单列堆叠
- 使用 `useMediaQuery` hook（Client Component）或 Tailwind 的 `hidden/block` 类控制显示

**重要**: `useMediaQuery` 是客户端hook，不能直接在Server Component中使用。需要创建Client Component包装器。

```typescript
// lib/hooks/useMediaQuery.ts
'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  // 避免SSR/CSR不匹配，首次渲染返回false
  return mounted ? matches : false;
}
```

```tsx
// components/layout/ResponsiveLayout.tsx
'use client';

import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { DesktopNav } from './navigation/DesktopNav';
import { MobileNav } from './navigation/MobileNav';
import { DesktopFooter } from './footer/DesktopFooter';
import { MobileFooter } from './footer/MobileFooter';

export function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {isMobile ? <MobileNav /> : <DesktopNav />}
      <main>{children}</main>
      {isMobile ? <MobileFooter /> : <DesktopFooter />}
    </>
  );
}
```

```tsx
// app/[locale]/layout.tsx (Server Component)
import { Inter, Noto_Sans_SC } from 'next/font/google';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['chinese-simplified'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  weight: ['400', '500', '700'],
});

export async function generateMetadata({ params: { locale } }): Promise<Metadata> {
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'),
    // 其他metadata配置...
  };
}

export default function Layout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={locale} className={`${inter.variable} ${notoSansSC.variable}`}>
      <body>
        <ResponsiveLayout>{children}</ResponsiveLayout>
      </body>
    </html>
  );
}
```

---

### 4. 性能优化

#### 性能目标（Core Web Vitals）
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s

#### 浏览器兼容性

- **最低支持**: Chrome 100+, Safari 15+, Firefox 100+, Edge 100+
- **移动端**: iOS Safari 15+, Chrome Android 100+
- **渐进增强**: 旧浏览器降级为基础样式，无动画

#### 图片懒加载
- 使用 `next/image` 组件，默认启用懒加载
- 首屏关键图片设置 `priority={true}`
- 配置 `sizes` 属性优化响应式图片加载

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority={true}  // 首屏图片
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

#### 视频懒加载
- 使用 Intersection Observer 监听视频元素进入视口
- 进入视口后才加载视频源

```tsx
// components/shared/LazyVideo.tsx
export function LazyVideo({ src, poster }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVisible = useIntersectionObserver(videoRef);

  return (
    <video ref={videoRef} poster={poster}>
      {isVisible && <source src={src} type="video/mp4" />}
    </video>
  );
}
```

#### 代码分割
- 使用 `dynamic()` 懒加载重型组件
- 非首屏组件延迟加载

```typescript
const ProductSlider = dynamic(
  () => import('@/components/products/FullScreenSlider'),
  { ssr: false }
);
```

---

### 5. 动画效果

#### Framer Motion 配置

页面级过渡动画、滚动触发动画、组件进入/退出动画。

```typescript
// lib/utils/animations.ts
// 动画配置常量（可在Server和Client Component中导入）
export const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

#### 无障碍降级

检测 `prefers-reduced-motion` 媒体查询，用户偏好减少动画时禁用或简化动画。

**重要**: 必须在客户端组件中使用，并在 `useEffect` 中检测，避免SSR错误。

```typescript
// lib/hooks/usePrefersReducedMotion.ts
'use client';

import { useEffect, useState } from 'react';

export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}
```

```tsx
// 使用示例
'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks/usePrefersReducedMotion';
import { fadeInUp } from '@/lib/utils/animations';

export function AnimatedSection({ children }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <motion.div {...(prefersReducedMotion ? {} : fadeInUp)}>
      {children}
    </motion.div>
  );
}
```

---

### 6. PPT式产品展示页

#### 功能需求
- 全屏图片/内容展示
- 支持键盘方向键、鼠标滚轮、触摸滑动切换
- 页面指示器（当前页/总页数）
- 平滑过渡动画

#### 技术实现
使用 **keen-slider** + **Framer Motion**：

```tsx
// components/products/FullScreenSlider.tsx
import { useKeenSlider } from 'keen-slider/react';
import { motion } from 'framer-motion';

export function FullScreenSlider({ slides }) {
  const [sliderRef, instanceRef] = useKeenSlider({
    vertical: true,
    slides: { perView: 1 },
    rubberband: false
  });

  return (
    <div ref={sliderRef} className="keen-slider h-screen">
      {slides.map((slide, idx) => (
        <motion.div
          key={idx}
          className="keen-slider__slide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Image src={slide.image} alt={slide.title} fill />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2>{slide.title}</h2>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

#### 键盘支持
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') instanceRef.current?.next();
    if (e.key === 'ArrowUp') instanceRef.current?.prev();
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

---

### 7. 导航栏与页脚

#### PC端导航
- 横向菜单布局
- 悬停效果
- 语言切换器
- 固定顶部或透明渐变

#### 移动端导航
- 汉堡菜单图标
- 侧边栏抽屉或全屏菜单
- 动画展开/收起

#### 实现方式
参考上面"响应式设计"章节中的 `ResponsiveLayout` 组件实现。

---

## 页面结构设计

### 首页 (Home)
- **Hero区域**: 全屏背景图/视频 + 标题 + CTA按钮
- **特色介绍**: 3-4个核心特性卡片（带图标和动画）
- **产品预览**: 产品轮播或网格展示
- **客户案例/数据**: 统计数字动画展示
- **CTA区域**: 引导用户行动（联系我们、了解更多）

### 产品页 (Products)
- **PPT式全屏展示**: 每个产品一屏，支持滑动切换
- **产品详情**: 图片、标题、描述、特性列表
- **导航指示器**: 显示当前页码和总页数
- **快速导航**: 侧边栏或底部缩略图导航（可选）

### 关于我们页 (About)
- **公司介绍**: 品牌故事、使命愿景
- **团队展示**: 核心成员卡片（头像、姓名、职位）
- **发展历程**: 时间轴展示（带动画）
- **联系方式**: 地址、邮箱、社交媒体链接

---

## 开发流程

### 阶段一：项目初始化
1. 创建 Next.js 项目（App Router）
2. 配置 TypeScript、Tailwind CSS
3. 安装依赖包（i18n、动画库、SEO工具）
4. 设置项目目录结构

### 阶段二：基础架构
1. 配置多语言路由和i18n
2. 创建布局组件（导航、页脚）
3. 实现响应式断点和媒体查询hooks
4. 配置SEO基础设施（sitemap、metadata）

### 阶段三：页面开发
1. **首页**: Hero、特性、产品预览、CTA
2. **产品页**: PPT式滑块、产品详情
3. **关于我们**: 公司介绍、团队、时间轴

### 阶段四：优化与完善
1. 图片/视频懒加载实现
2. 动画效果添加和调优
3. SEO结构化数据注入
4. 可访问性优化（ARIA、键盘导航）
5. 性能测试和优化

### 阶段五：部署准备
1. 环境变量配置
2. 构建优化（静态生成 vs SSR）
3. CDN配置（图片、字体）
4. 部署到Vercel/Netlify等平台

---

## 技术细节补充

### 安全与合规
- **CSP (Content Security Policy)**: 配置内容安全策略
- **隐私政策**: 添加隐私政策页面
- **Cookie提示**: 多语言cookie同意横幅（GDPR合规）

### 可访问性 (A11y)
- 所有图片必须有 `alt` 属性
- 导航支持键盘焦点和Tab导航
- 颜色对比度符合 WCAG 2.1 AA标准
- 滑块组件支持 `aria-live` 和键盘切换
- 表单元素有明确的 `label` 关联

### 部署与缓存策略
- **静态生成**: 使用 `generateStaticParams` 预生成所有语言版本
- **ISR (Incremental Static Regeneration)**: 设置 `revalidate` 定期更新内容
- **CDN缓存**: 静态资源（图片、字体、JS/CSS）走CDN
- **Edge Functions**: 可选使用边缘函数做语言路由优化

---

## 依赖包清单

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "next-intl": "^3.0.0",
    "framer-motion": "^11.0.0",
    "keen-slider": "^6.8.0",
    "next-sitemap": "^4.2.0",
    "clsx": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "@formatjs/intl-localematcher": "^0.5.0",
    "negotiator": "^0.6.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/negotiator": "^0.6.3",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**说明**:
- 移除了 `next-seo`（使用Next.js内置 `generateMetadata`）
- 移除了 `GSAP`、`Swiper`、`react-use-gesture`（使用 `keen-slider` + `framer-motion` 足够）
- 添加了 `@formatjs/intl-localematcher` 和 `negotiator`（用于中间件语言检测）

---

## 关键决策（已确定）

### 1. 内容管理策略
✅ **采用静态JSON文件，预留CMS接口**
- 内容存储在 `content/` 目录下的JSON文件
- 预留CMS数据获取接口，方便后续升级
- 适合内容更新不频繁的企业官网

### 2. 支持的语言
✅ **默认支持英文(en)和简体中文(zh)**
- 中间件配置支持这两种语言
- 使用 Inter 字体（英文）+ Noto Sans SC（中文）
- 翻译文件位于 `public/locales/en` 和 `public/locales/zh`

### 3. 部署环境
✅ **自托管（Docker + Node.js）**
- 使用Docker多阶段构建优化镜像大小
- docker-compose编排服务（Next.js + Nginx）
- 完全控制部署环境和配置
- **支持测试环境和正式环境**：独立配置、独立部署

### 4. 图片/视频托管
✅ **外部CDN + 内部保留图标资源**
- 大图片/视频托管在外部CDN（如Cloudinary、阿里云OSS等）
- 小图标、Logo等保留在 `public/images/` 目录
- 通过 `next.config.js` 配置CDN域名

---

## 多环境配置（测试环境 & 正式环境）

### 环境划分

项目支持三个环境：
1. **开发环境（Development）** - 本地开发
2. **测试环境（Staging）** - 预发布测试
3. **正式环境（Production）** - 生产环境

### 环境变量文件

```bash
# 项目根目录
.env.local              # 本地开发环境（不提交到Git）
.env.staging            # 测试环境配置
.env.production         # 正式环境配置
.env.example            # 环境变量模板（提交到Git）
```

#### .env.local（开发环境）
```bash
NODE_ENV=development

# 站点配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# API配置
NEXT_PUBLIC_API_URL=http://localhost:4000
API_SECRET_KEY=dev_secret_key_12345

# CDN配置（开发环境可以不用CDN）
NEXT_PUBLIC_CDN_URL=

# 调试选项
NEXT_PUBLIC_DEBUG=true
```

#### .env.staging（测试环境）
```bash
NODE_ENV=production

# 站点配置
NEXT_PUBLIC_SITE_URL=https://staging.example.com

# API配置
NEXT_PUBLIC_API_URL=https://api-staging.example.com
API_SECRET_KEY=staging_secret_key_67890

# CDN配置
NEXT_PUBLIC_CDN_URL=https://cdn-staging.example.com
IMAGE_CDN_TOKEN=staging_cdn_token

# 测试环境标识
NEXT_PUBLIC_ENV=staging

# 可选：测试环境特殊配置
NEXT_PUBLIC_SHOW_DEBUG_INFO=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

#### .env.production（正式环境）
```bash
NODE_ENV=production

# 站点配置
NEXT_PUBLIC_SITE_URL=https://example.com

# API配置
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET_KEY=prod_secret_key_abcdef

# CDN配置
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
IMAGE_CDN_TOKEN=prod_cdn_token

# 正式环境标识
NEXT_PUBLIC_ENV=production

# 安全配置
NEXT_PUBLIC_SHOW_DEBUG_INFO=false
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
```

### Docker多环境部署

#### docker-compose.staging.yml（测试环境）
```yaml
version: "3.9"

services:
  web-staging:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_ENV=staging
    image: web-tem:staging
    container_name: web-tem-staging
    env_file: .env.staging
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      NEXT_PUBLIC_CDN_URL: ${NEXT_PUBLIC_CDN_URL}
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_ENV: staging
    expose:
      - "3000"
    restart: unless-stopped
    networks:
      - staging-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx-staging:
    image: nginx:1.25-alpine
    container_name: nginx-staging
    depends_on:
      - web-staging
    ports:
      - "8080:80"
      - "8443:443"
    volumes:
      - ./deploy/nginx.staging.conf:/etc/nginx/conf.d/default.conf:ro
      - ./deploy/certs/staging:/etc/nginx/certs:ro
    restart: unless-stopped
    networks:
      - staging-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  staging-network:
    driver: bridge
```

#### docker-compose.production.yml（正式环境）
```yaml
version: "3.9"

services:
  web-production:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - BUILD_ENV=production
    image: web-tem:production
    container_name: web-tem-production
    env_file: .env.production
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      NEXT_PUBLIC_CDN_URL: ${NEXT_PUBLIC_CDN_URL}
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
      NEXT_PUBLIC_ENV: production
    expose:
      - "3000"
    restart: unless-stopped
    networks:
      - production-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx-production:
    image: nginx:1.25-alpine
    container_name: nginx-production
    depends_on:
      - web-production
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/nginx.production.conf:/etc/nginx/conf.d/default.conf:ro
      - ./deploy/certs/production:/etc/nginx/certs:ro
    restart: unless-stopped
    networks:
      - production-network
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  production-network:
    driver: bridge
```

### Nginx多环境配置

#### deploy/nginx.staging.conf
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=next_static:10m max_size=1g inactive=24h use_temp_path=off;

server {
  listen 80;
  server_name staging.example.com;

  # 测试环境添加基本认证（可选）
  # auth_basic "Staging Environment";
  # auth_basic_user_file /etc/nginx/.htpasswd;

  # 测试环境标识头
  add_header X-Environment "staging" always;

  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

  location / {
    proxy_pass http://web-staging:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Environment "staging";
  }

  location /_next/static {
    proxy_cache next_static;
    proxy_cache_valid 200 1h;  # 测试环境缓存时间较短
    proxy_pass http://web-staging:3000;
  }

  location /api/health {
    proxy_pass http://web-staging:3000;
    access_log off;
  }
}
```

#### deploy/nginx.production.conf
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=next_static:10m max_size=1g inactive=24h use_temp_path=off;

server {
  listen 80;
  server_name example.com www.example.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name example.com www.example.com;

  ssl_certificate /etc/nginx/certs/fullchain.pem;
  ssl_certificate_key /etc/nginx/certs/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # 安全头
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;

  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

  location / {
    proxy_pass http://web-production:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /_next/static {
    proxy_cache next_static;
    proxy_cache_valid 200 24h;
    proxy_pass http://web-production:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location /api/health {
    proxy_pass http://web-production:3000;
    access_log off;
  }
}
```

### 环境识别组件

```typescript
// lib/utils/env.ts
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isStaging: process.env.NEXT_PUBLIC_ENV === 'staging',
  isProduction: process.env.NEXT_PUBLIC_ENV === 'production',

  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || '',

  showDebugInfo: process.env.NEXT_PUBLIC_SHOW_DEBUG_INFO === 'true',
} as const;

export function getEnvironmentName(): string {
  if (ENV.isDevelopment) return 'Development';
  if (ENV.isStaging) return 'Staging';
  if (ENV.isProduction) return 'Production';
  return 'Unknown';
}
```

```tsx
// components/shared/EnvironmentBadge.tsx
'use client';

import { ENV, getEnvironmentName } from '@/lib/utils/env';

export function EnvironmentBadge() {
  // 只在非正式环境显示
  if (ENV.isProduction) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        px-3 py-1 rounded-full text-xs font-semibold
        ${ENV.isStaging ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'}
      `}>
        {getEnvironmentName()}
      </div>
    </div>
  );
}
```

### 部署脚本

#### scripts/deploy-staging.sh
```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Staging Environment..."

# 拉取最新代码
git pull origin develop

# 构建并启动测试环境
docker compose -f docker-compose.staging.yml build
docker compose -f docker-compose.staging.yml up -d

# 等待服务启动
echo "⏳ Waiting for service to start..."
sleep 10

# 健康检查
if curl -f http://localhost:8080/api/health > /dev/null 2>&1; then
  echo "✅ Staging deployment successful!"
  echo "🌐 Visit: https://staging.example.com"
else
  echo "❌ Health check failed!"
  exit 1
fi

# 清理旧镜像
docker image prune -f

echo "📊 Container status:"
docker compose -f docker-compose.staging.yml ps
```

#### scripts/deploy-production.sh
```bash
#!/bin/bash
set -e

echo "🚀 Deploying to Production Environment..."

# 确认部署
read -p "⚠️  Are you sure you want to deploy to PRODUCTION? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "❌ Deployment cancelled"
  exit 1
fi

# 拉取最新代码
git pull origin main

# 备份当前运行的容器
echo "📦 Creating backup..."
docker commit web-tem-production web-tem:backup-$(date +%Y%m%d-%H%M%S) || true

# 构建并启动正式环境
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# 等待服务启动
echo "⏳ Waiting for service to start..."
sleep 15

# 健康检查
if curl -f https://example.com/api/health > /dev/null 2>&1; then
  echo "✅ Production deployment successful!"
  echo "🌐 Visit: https://example.com"
else
  echo "❌ Health check failed! Rolling back..."
  docker compose -f docker-compose.production.yml down
  # 这里可以添加回滚逻辑
  exit 1
fi

# 清理旧镜像（保留最近3个）
docker images | grep web-tem | tail -n +4 | awk '{print $3}' | xargs -r docker rmi || true

echo "📊 Container status:"
docker compose -f docker-compose.production.yml ps
```

### 部署流程

#### 测试环境部署
```bash
# 1. 切换到项目目录
cd /opt/web-tem

# 2. 执行测试环境部署脚本
chmod +x scripts/deploy-staging.sh
./scripts/deploy-staging.sh

# 或手动部署
docker compose -f docker-compose.staging.yml up -d --build
```

#### 正式环境部署
```bash
# 1. 切换到项目目录
cd /opt/web-tem

# 2. 执行正式环境部署脚本
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh

# 或手动部署
docker compose -f docker-compose.production.yml up -d --build
```

### 环境隔离策略

#### 1. 服务器隔离
- **测试环境**: 独立服务器或使用不同端口（8080/8443）
- **正式环境**: 独立服务器，使用标准端口（80/443）

#### 2. 数据库隔离
- 测试环境和正式环境使用不同的数据库实例
- 测试环境可以使用正式环境的数据快照（脱敏后）

#### 3. API隔离
- 测试环境API: `https://api-staging.example.com`
- 正式环境API: `https://api.example.com`

#### 4. CDN隔离
- 测试环境CDN: `https://cdn-staging.example.com`
- 正式环境CDN: `https://cdn.example.com`

### 环境切换检查清单

部署前检查：
- [ ] 环境变量文件已正确配置
- [ ] API端点指向正确的环境
- [ ] CDN配置正确
- [ ] SSL证书已配置（正式环境）
- [ ] 数据库连接正确
- [ ] 日志配置正确
- [ ] 备份已创建（正式环境）

部署后验证：
- [ ] 健康检查通过
- [ ] 页面可以正常访问
- [ ] API请求正常
- [ ] 图片/视频加载正常
- [ ] 多语言切换正常
- [ ] 性能指标正常

### 监控和日志

```bash
# 查看测试环境日志
docker compose -f docker-compose.staging.yml logs -f web-staging

# 查看正式环境日志
docker compose -f docker-compose.production.yml logs -f web-production

# 查看特定时间段的日志
docker compose -f docker-compose.production.yml logs --since 1h web-production

# 导出日志
docker compose -f docker-compose.production.yml logs --no-color > logs/production-$(date +%Y%m%d).log
```

---

## Docker部署配置

### 部署架构
```
[用户] → [Nginx:80/443] → [Next.js:3000] → [外部CDN]
```

### 所需文件
- `Dockerfile` - 多阶段构建配置
- `docker-compose.yml` - 服务编排
- `.dockerignore` - 排除不必要的文件
- `deploy/nginx.conf` - Nginx反向代理配置
- `.env.production` - 生产环境变量
- `app/api/health/route.ts` - 健康检查端点

### Dockerfile（多阶段构建）
```dockerfile
# Stage 1: 安装依赖
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm ci; \
  fi

# Stage 2: 构建应用
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: 生产运行
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 创建非特权用户
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
```

### .dockerignore
```
node_modules
npm-debug.log
yarn-error.log
.next
out
.git
.gitignore
Dockerfile
docker-compose.yml
.env*
!.env.example
.vscode
coverage
README.md
PROJECT_PLAN.md
```

### docker-compose.yml
```yaml
version: "3.9"

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    image: web-tem:latest
    env_file: .env.production
    environment:
      NODE_ENV: production
      NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
      NEXT_PUBLIC_CDN_URL: ${NEXT_PUBLIC_CDN_URL}
    expose:
      - "3000"
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:1.25-alpine
    depends_on:
      - web
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deploy/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./deploy/certs:/etc/nginx/certs:ro  # TLS证书（可选）
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### deploy/nginx.conf
```nginx
# 静态资源缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=next_static:10m max_size=1g inactive=24h use_temp_path=off;

server {
  listen 80;
  server_name example.com;

  # 如果配置了HTTPS，取消下面的注释
  # return 301 https://$server_name$request_uri;

  # Gzip压缩
  gzip on;
  gzip_vary on;
  gzip_min_length 1024;
  gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

  # 代理到Next.js
  location / {
    proxy_pass http://web:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_cache_bypass $http_upgrade;
  }

  # 静态资源缓存
  location /_next/static {
    proxy_cache next_static;
    proxy_cache_valid 200 24h;
    proxy_pass http://web:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  # 健康检查
  location /api/health {
    proxy_pass http://web:3000;
    access_log off;
  }
}

# HTTPS配置（可选）
# server {
#   listen 443 ssl http2;
#   server_name example.com;
#
#   ssl_certificate /etc/nginx/certs/fullchain.pem;
#   ssl_certificate_key /etc/nginx/certs/privkey.pem;
#   ssl_protocols TLSv1.2 TLSv1.3;
#   ssl_ciphers HIGH:!aNULL:!MD5;
#
#   # ... 其他配置同上
# }
```

### .env.production（示例）
```bash
# 站点URL
NEXT_PUBLIC_SITE_URL=https://example.com

# CDN URL（用于静态资源）
NEXT_PUBLIC_CDN_URL=https://cdn.example.com

# API配置
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET_KEY=your_api_secret_key_here

# CDN访问凭证（如果需要）
IMAGE_CDN_TOKEN=your_cdn_token_here

# 其他环境变量
# DATABASE_URL=...
```

### next.config.js（CDN配置）
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用standalone输出模式（Docker部署必需）
  output: 'standalone',

  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/**',
      },
      // 添加其他CDN域名
    ],
    minimumCacheTTL: 31536000, // 1年
  },

  // 静态资源CDN前缀
  assetPrefix: process.env.NEXT_PUBLIC_CDN_URL || undefined,

  // 性能优化
  experimental: {
    optimizePackageImports: ['framer-motion', 'keen-slider'],
  },

  // 国际化配置
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
};

module.exports = nextConfig;
```

### 健康检查端点
```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

### 部署流程

#### 1. 准备服务器
```bash
# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo apt-get install docker-compose-plugin

# 创建项目目录
mkdir -p /opt/web-tem
cd /opt/web-tem
```

#### 2. 上传项目文件
```bash
# 方式1: Git克隆
git clone <repository-url> .

# 方式2: 直接上传
scp -r ./web-tem user@server:/opt/web-tem
```

#### 3. 配置环境变量
```bash
# 复制环境变量模板
cp .env.example .env.production

# 编辑环境变量
nano .env.production
```

#### 4. 构建和启动
```bash
# 构建镜像
docker compose build

# 启动服务
docker compose up -d

# 查看日志
docker compose logs -f web

# 检查健康状态
curl http://localhost/api/health
```

#### 5. 配置HTTPS（可选）
```bash
# 使用Let's Encrypt
sudo apt-get install certbot
sudo certbot certonly --standalone -d example.com

# 复制证书到项目目录
mkdir -p deploy/certs
sudo cp /etc/letsencrypt/live/example.com/fullchain.pem deploy/certs/
sudo cp /etc/letsencrypt/live/example.com/privkey.pem deploy/certs/

# 更新nginx配置，启用HTTPS
# 重启nginx
docker compose restart nginx
```

#### 6. 设置自动重启
```bash
# 创建systemd服务
sudo nano /etc/systemd/system/web-tem.service
```

```ini
[Unit]
Description=Web Template Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/web-tem
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# 启用服务
sudo systemctl enable web-tem
sudo systemctl start web-tem
```

### 更新部署
```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build

# 清理旧镜像
docker image prune -f
```

### 监控和维护
```bash
# 查看容器状态
docker compose ps

# 查看资源使用
docker stats

# 查看日志
docker compose logs -f web
docker compose logs -f nginx

# 进入容器调试
docker compose exec web sh

# 备份数据（如果有）
docker compose exec web tar czf /tmp/backup.tar.gz /app/content
docker cp web-tem-web-1:/tmp/backup.tar.gz ./backup.tar.gz
```

---

## 注意事项

### 不包含的功能
- ❌ 监控系统（如Sentry、Google Analytics）
- ❌ 单元测试/E2E测试
- ❌ 后台管理系统
- ❌ 用户认证系统

### 可扩展方向
- 接入 Headless CMS（Contentful、Sanity、Strapi）
- 添加博客/新闻模块
- 集成表单提交（联系我们表单）
- 添加搜索功能
- 集成在线客服

---

## 参考资源

- [Next.js 官方文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Framer Motion 文档](https://www.framer.com/motion/)
- [next-intl 文档](https://next-intl-docs.vercel.app/)
- [Schema.org 结构化数据](https://schema.org/)
- [Web.dev SEO 指南](https://web.dev/learn/seo/)

---

## 总结

本规划文档提供了企业级官网模板的完整技术方案，涵盖了架构设计、技术选型、功能实现、性能优化等各个方面。通过采用现代化的技术栈和最佳实践，可以构建出高性能、SEO友好、用户体验优秀的企业官网。

**下一步行动**:
1. 确认内容来源（静态JSON vs CMS）
2. 确定支持的语言列表
3. 准备设计稿和品牌资源
4. 开始项目初始化和基础架构搭建
