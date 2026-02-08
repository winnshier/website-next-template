# CDN 静态资源使用指南

## 概述

本项目支持将静态资源上传到 CDN，以提升全球访问速度并降低服务器带宽成本。

## 资源类型

### 1. Next.js 构建产物（自动处理）

**位置**：`.next/static/`

**包含**：
- JavaScript 代码（chunks）
- CSS 样式文件
- 字体文件

**特点**：
- ✅ 自动上传到 CDN
- ✅ 文件名包含哈希值，自动缓存失效
- ✅ 无需手动处理

### 2. Public 目录静态资源（可选上传）

**位置**：`public/`

**包含**：
- 图片（images/）
- 视频（videos/）
- 字体（fonts/）
- 其他静态文件

**特点**：
- 🔧 需要配置开关启用
- 🔧 需要使用工具函数引用

## 配置方式

### 1. 启用 CDN 上传

编辑 `.env.production` 或 `.env.staging`：

```bash
# 启用 CDN
NEXT_PUBLIC_CDN_URL=https://cdn.example.com

# 启用 public 目录上传（可选）
CDN_UPLOAD_PUBLIC=true

# 自定义配置（可选）
CDN_PUBLIC_SOURCE_DIR=public
CDN_PUBLIC_TARGET_PREFIX=public
```

### 2. 配置说明

| 变量 | 说明 | 默认值 | 必需 |
|------|------|--------|------|
| `NEXT_PUBLIC_CDN_URL` | CDN 域名 | - | 是 |
| `CDN_UPLOAD_PUBLIC` | 是否上传 public 目录 | `false` | 否 |
| `CDN_PUBLIC_SOURCE_DIR` | public 源目录 | `public` | 否 |
| `CDN_PUBLIC_TARGET_PREFIX` | CDN 目标前缀 | `public` | 否 |

## 使用方法

### 1. 导入工具函数

```tsx
import { getAssetUrl } from '@/lib/utils/cdn';
```

### 2. 图片资源

```tsx
// ❌ 错误：直接使用路径
<img src="/images/logo.png" alt="Logo" />

// ✅ 正确：使用 getAssetUrl
<img src={getAssetUrl('/images/logo.png')} alt="Logo" />
```

**效果**：
- 未配置 CDN：`/images/logo.png`（走服务器）
- 配置 CDN：`https://cdn.example.com/public/images/logo.png`（走 CDN）

### 3. 视频资源

```tsx
<video src={getAssetUrl('/videos/intro.mp4')} controls />
```

### 4. 背景图片

```tsx
<div
  style={{
    backgroundImage: `url(${getAssetUrl('/images/hero-bg.jpg')})`,
  }}
>
  内容
</div>
```

### 5. Next.js Image 组件

```tsx
import Image from 'next/image';
import { getAssetUrl } from '@/lib/utils/cdn';

<Image
  src={getAssetUrl('/images/product.jpg')}
  alt="Product"
  width={800}
  height={600}
/>
```

### 6. 动态路径

```tsx
const products = [
  { id: 1, image: '/images/product-1.jpg' },
  { id: 2, image: '/images/product-2.jpg' },
];

{products.map(product => (
  <img
    key={product.id}
    src={getAssetUrl(product.image)}
    alt={`Product ${product.id}`}
  />
))}
```

### 7. 条件判断

```tsx
import { isCdnEnabled } from '@/lib/utils/cdn';

if (isCdnEnabled()) {
  console.log('CDN 已启用');
}
```

## 工具函数 API

### `getAssetUrl(path: string): string`

获取静态资源的完整 URL，适用于所有类型的静态资源（图片、视频、字体等）。

**参数**：
- `path` - 资源路径，必须以 `/` 开头

**返回**：
- 完整的资源 URL

**示例**：
```tsx
getAssetUrl('/images/logo.png')
// 未配置 CDN: '/images/logo.png'
// 配置 CDN: 'https://cdn.example.com/public/images/logo.png'
```

### `isCdnEnabled(): boolean`

检查是否启用了 CDN。

**返回**：
- `true` - CDN 已启用
- `false` - CDN 未启用

**示例**：
```tsx
if (isCdnEnabled()) {
  console.log('CDN 已启用');
}
```

### `getCdnBaseUrl(): string`

获取 CDN 基础 URL。

**返回**：
- CDN 基础 URL，未配置则返回空字符串

**示例**：
```tsx
const cdnUrl = getCdnBaseUrl();
// => 'https://cdn.example.com' 或 ''
```

**注意**：
- `getImageUrl` 和 `getVideoUrl` 是 `getAssetUrl` 的别名，功能完全相同
- 推荐统一使用 `getAssetUrl` 处理所有静态资源

## 部署流程

### 1. 配置环境变量

```bash
# 复制示例配置
cp config/.env.production.example .env.production

# 编辑配置
vim .env.production
```

### 2. 启用 public 上传（可选）

```bash
# .env.production
CDN_UPLOAD_PUBLIC=true
```

### 3. 部署

```bash
./docker-production.sh up
```

**部署流程**：
1. 构建 Next.js 项目
2. 上传 `.next/static/` 到 CDN ✅
3. 上传 `public/` 到 CDN（如果启用）✅
4. 启动 Docker 容器

### 4. 验证

访问你的网站，检查静态资源是否从 CDN 加载：

```bash
# 打开浏览器开发者工具 -> Network
# 查看图片/视频的请求 URL
# 应该显示：https://cdn.example.com/public/...
```

## 最佳实践

### 1. 路径规范

✅ **正确**：
```tsx
getAssetUrl('/images/logo.png')  // 以 / 开头
```

❌ **错误**：
```tsx
getAssetUrl('images/logo.png')   // 缺少开头的 /
getAssetUrl('../images/logo.png') // 使用相对路径
```

### 2. 文件组织

```
public/
├── images/          # 图片资源
│   ├── logo.png
│   ├── hero-bg.jpg
│   └── products/
├── videos/          # 视频资源
│   └── intro.mp4
├── fonts/           # 字体文件
│   └── custom.woff2
└── locales/         # 语言文件（建议走服务器）
```

### 3. 性能优化

**小文件（< 100KB）**：
- 可以走服务器
- 如：favicon.ico、小图标

**大文件（> 100KB）**：
- 建议走 CDN
- 如：高清图片、视频

### 4. 开发环境

开发环境不需要配置 CDN：

```bash
# .env.local
# NEXT_PUBLIC_CDN_URL=  # 留空或不配置
```

工具函数会自动降级到本地路径。

## 故障排查

### 问题 1：图片 404

**原因**：未上传 public 目录到 CDN

**解决**：
```bash
# 1. 检查配置
cat .env.production | grep CDN_UPLOAD_PUBLIC

# 2. 启用上传
echo "CDN_UPLOAD_PUBLIC=true" >> .env.production

# 3. 重新部署
./docker-production.sh up
```

### 问题 2：路径错误

**原因**：未使用工具函数

**解决**：
```tsx
// ❌ 错误
<img src="/images/logo.png" />

// ✅ 正确
import { getAssetUrl } from '@/lib/utils/cdn';
<img src={getAssetUrl('/images/logo.png')} />
```

### 问题 3：CDN 未生效

**检查清单**：
1. ✅ 是否配置了 `NEXT_PUBLIC_CDN_URL`
2. ✅ 是否启用了 `CDN_UPLOAD_PUBLIC=true`
3. ✅ 是否重新部署
4. ✅ 是否使用了工具函数

## 示例代码

### 完整示例

```tsx
// app/[locale]/page.tsx
import { getAssetUrl } from '@/lib/utils/cdn';

export default function HomePage() {
  return (
    <div>
      {/* 图片 */}
      <img
        src={getAssetUrl('/images/logo.png')}
        alt="Logo"
        width={200}
        height={100}
      />

      {/* 背景图 */}
      <div
        style={{
          backgroundImage: `url(${getAssetUrl('/images/hero-bg.jpg')})`,
          height: '400px',
        }}
      >
        <h1>欢迎</h1>
      </div>

      {/* 视频 */}
      <video
        src={getAssetUrl('/videos/intro.mp4')}
        controls
        width="100%"
      />

      {/* 图片列表 */}
      {[1, 2, 3].map(i => (
        <img
          key={i}
          src={getAssetUrl(`/images/product-${i}.jpg`)}
          alt={`Product ${i}`}
        />
      ))}
    </div>
  );
}
```

---

**最后更新**: 2026-02-08
**版本**: 1.0.0
