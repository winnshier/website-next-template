# 企业级官网模板项目 - Claude 开发指南

## 项目概述

基于 Next.js 14 (App Router) 的企业级官网模板，支持多语言、SEO优化、响应式设计、Docker容器化部署。

## 技术栈

- **Next.js 14+** (App Router) + **TypeScript** + **React 18+**
- **Tailwind CSS** + **Framer Motion** - 样式与动画
- **next-intl** - 多语言支持（英文/中文）
- **Docker** + **Nginx** - 容器化部署（本地/测试/正式环境）

## 快速开始

```bash
# 开发环境
npm install
npm run dev  # 访问 http://localhost:3000

# 构建与测试
npm run build
npm run lint       # 代码检查
npm run type-check # 类型检查
npm start

# Docker 部署（推荐）
./docker-local.sh up      # 本地开发
./docker-staging.sh up    # 测试环境
./docker-production.sh up # 正式环境
```

## Docker 部署

项目提供三个 Docker 管理脚本，分别用于本地开发、测试和正式环境。

### 环境对比

| 脚本 | 环境 | 端口 | 配置文件 | 特性 |
|------|------|------|----------|------|
| `docker-local.sh` | 本地开发 | 3000 | `.env.docker` | 快速启动，无SSL |
| `docker-staging.sh` | 测试环境 | 8080/8443 | `.env.staging` | 支持SSL，自动备份 |
| `docker-production.sh` | 正式环境 | 80/443 | `.env.production` | 支持SSL，自动备份，回滚 |

### 快速开始

**本地开发环境**：
```bash
# 1. 准备环境变量
cp .env.example .env.docker

# 2. 启动服务
./docker-local.sh up

# 3. 访问应用
# 中文: http://localhost:3000/zh
# 英文: http://localhost:3000/en
```

**测试环境**：
```bash
# 1. 准备环境变量和SSL证书（可选）
cp .env.staging.example .env.staging
# 生成自签名证书（仅测试用）
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deploy/certs/staging/privkey.pem \
  -out deploy/certs/staging/fullchain.pem \
  -subj "/CN=staging.example.com"

# 2. 启动服务（自动备份旧版本）
./docker-staging.sh up

# 3. 访问应用
# HTTP: http://localhost:8080
# HTTPS: https://localhost:8443
```

**正式环境**：
```bash
# 1. 准备环境变量和SSL证书
cp .env.production.example .env.production
vim .env.production  # 配置生产环境变量

# 配置 Let's Encrypt SSL证书
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem deploy/certs/production/

# 2. 启动服务（自动备份旧版本）
./docker-production.sh up

# 3. 验证部署
./docker-production.sh status
curl https://yourdomain.com/api/health
```

### 脚本命令

所有脚本支持以下命令：

```bash
./docker-{env}.sh up       # 构建并启动服务
./docker-{env}.sh down     # 停止并删除容器
./docker-{env}.sh restart  # 重启服务（不重新构建）
./docker-{env}.sh logs     # 实时查看日志（Ctrl+C退出）
./docker-{env}.sh status   # 查看容器状态和健康检查
./docker-{env}.sh help     # 显示帮助信息
```

**测试/正式环境额外命令**：
```bash
./docker-{env}.sh backups  # 列出所有备份镜像
./docker-{env}.sh rollback # 回滚到上一个备份版本
```

### 常见操作场景

**场景1：代码更新部署**
```bash
git pull
./docker-production.sh down
./docker-production.sh up  # 自动备份当前版本
```

**场景2：部署失败快速回滚**
```bash
./docker-production.sh rollback  # 回滚到上一版本
./docker-production.sh status    # 验证回滚成功
```

**场景3：查看运行日志**
```bash
./docker-production.sh logs      # 实时日志
# 或查看最近100行
docker compose -f docker-compose.production.yml logs --tail=100
```

**场景4：SSL证书更新**
```bash
# 更新证书文件
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem deploy/certs/production/
# 重启nginx
docker compose -f docker-compose.production.yml restart nginx-production
```

### 故障排查

| 问题 | 解决方案 |
|------|----------|
| 脚本无执行权限 | `chmod +x docker-*.sh` |
| Docker未运行 | macOS: `open -a Docker`<br>Linux: `sudo systemctl start docker` |
| 端口被占用 | `lsof -i :3000` 查找进程，`kill -9 <PID>` 停止 |
| 环境变量文件不存在 | 复制对应的 `.env.*.example` 文件 |
| 健康检查失败 | 查看日志 `./docker-{env}.sh logs` |
| 容器启动失败 | 检查 `docker ps -a` 和 `docker logs <container_id>` |

## 项目结构

```
app/[locale]/          # 多语言路由（en/zh）
  ├── page.tsx         # 首页
  ├── products/        # 产品页
  └── about/           # 关于我们
components/            # React组件
  ├── layout/          # 导航栏、页脚
  ├── home/            # 首页组件
  └── shared/          # 共享组件
lib/                   # 工具库
  ├── api/             # API请求模块
  ├── i18n/            # 国际化配置
  └── hooks/           # React Hooks
public/locales/        # 多语言文件
```

## 核心功能

### 多语言国际化
- 支持英文(en)和简体中文(zh)，通过 `[locale]` 动态路由实现
- 使用 `next-intl`，语言文件位于 `public/locales/`
```typescript
import { getTranslations } from 'next-intl/server';
const t = await getTranslations({ locale, namespace: 'home' });
```

### SEO优化
- 自动生成 sitemap.xml、LD+JSON 结构化数据
- 动态 metadata（title、description、OG、Twitter Card）
- 健康检查端点：`/api/health`

### API请求模块
- 封装的 HTTP 客户端（`lib/api/client.ts`），支持超时、重试、缓存
- API失败时自动降级到静态JSON
```typescript
import { getHomeData } from '@/lib/api/fetchers/home';
const homeData = await getHomeData(locale);
```

## 环境变量

### 必需变量
```bash
NEXT_PUBLIC_SITE_URL=https://example.com
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
NEXT_PUBLIC_ENV=production  # development/staging/production
```

**注意**：完整的环境变量配置请参考项目根目录的 `.env.example`、`.env.staging.example` 和 `.env.production.example` 文件。

## 开发规范

### 组件规范
- Server Component 为默认，需要交互时使用 `'use client'`
- 文件名使用 PascalCase（如 `HeroSection.tsx`）

### 样式规范
- 优先使用 Tailwind CSS 类名
- 响应式使用断点前缀：sm(640px)、md(768px)、lg(1024px)、xl(1280px)

### 类型规范
- 所有API响应必须有类型定义（`lib/api/types.ts`）
- 避免使用 `any`，使用 `unknown` 代替

### 国际化规范
- 所有文案必须通过 `t()` 函数获取
- 翻译文件按命名空间组织（common、home、products等）

### API请求规范
- 所有API请求通过 `lib/api/client.ts` 发起
- 新增端点在 `lib/api/endpoints.ts` 定义
- 必须实现降级到静态JSON的逻辑

## 常见问题

### 构建失败
- 检查 TypeScript 类型错误
- 检查环境变量是否配置
- 检查依赖是否完整安装

### 多语言不生效
- 检查 `middleware.ts` 配置
- 检查 `public/locales/` 文件是否存在

### API请求失败
- 检查 `NEXT_PUBLIC_API_URL` 配置
- 会自动降级到静态JSON

### 性能与安全
- **性能目标**：LCP < 2.5s, FID < 100ms, CLS < 0.1
- **浏览器支持**：Chrome/Safari/Firefox/Edge 100+
- **安全要点**：敏感信息使用环境变量，正式环境必须启用HTTPS

## CDN 静态资源使用

### 基本用法

所有 `public/` 目录下的静态资源（图片、视频、字体等）统一使用 `getAssetUrl` 函数：

```tsx
import { getAssetUrl } from '@/lib/utils/cdn';
```

### 使用示例

**图片资源**：
```tsx
// ❌ 错误：直接使用路径
<img src="/images/logo.png" alt="Logo" />

// ✅ 正确：使用 getAssetUrl
<img src={getAssetUrl('/images/logo.png')} alt="Logo" />
```

**视频资源**：
```tsx
<video src={getAssetUrl('/videos/intro.mp4')} controls />
```

**背景图片**：
```tsx
<div style={{ backgroundImage: `url(${getAssetUrl('/images/hero-bg.jpg')})` }}>
  内容
</div>
```

**Next.js Image 组件**：
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

**动态路径**：
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

**条件判断**：
```tsx
import { isCdnEnabled } from '@/lib/utils/cdn';

if (isCdnEnabled()) {
  console.log('CDN 已启用，静态资源将从 CDN 加载');
}
```

### 注意事项

1. **路径格式**：必须以 `/` 开头
   ```tsx
   ✅ getAssetUrl('/images/logo.png')
   ❌ getAssetUrl('images/logo.png')
   ❌ getAssetUrl('../images/logo.png')
   ```

2. **环境自动适配**：
   - 开发环境：自动使用本地路径
   - 生产环境（未配置 CDN）：使用本地路径
   - 生产环境（已配置 CDN）：使用 CDN 路径

3. **文件组织**：
   ```
   public/
   ├── images/          # 图片资源
   ├── videos/          # 视频资源
   ├── fonts/           # 字体文件
   └── locales/         # 语言文件（建议走服务器）
   ```

4. **性能建议**：
   - 小文件（< 100KB）：可以走服务器
   - 大文件（> 100KB）：建议走 CDN

---

**最后更新**: 2026-02-08
**版本**: 2.0.0

