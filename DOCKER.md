# Docker 部署指南

项目提供三个 Docker 管理脚本，简化部署流程。支持自动上传静态文件到 CDN。

## 环境变量配置

### 基础配置

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `NODE_ENV` | Node.js 环境 | 是 | - | `production` |
| `NEXT_PUBLIC_ENV` | 应用环境标识 | 是 | - | `development/staging/production` |
| `NEXT_PUBLIC_SITE_URL` | 站点完整 URL | 是 | - | `https://example.com` |
| `NEXT_PUBLIC_API_URL` | API 服务地址 | 是 | - | `https://api.example.com` |
| `API_SECRET_KEY` | API 密钥（服务端） | 否 | - | `your_secret_key` |

### CDN 配置（可选）

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `NEXT_PUBLIC_CDN_URL` | CDN 域名 | 否 | - | `https://cdn.example.com` |
| `CDN_PROVIDER` | CDN 提供商 | 否 | `aliyun` | `aliyun` 或 `tencent` |
| `CDN_UPLOAD_ENABLED` | 是否启用自动上传 | 否 | `false` | `true/false` |
| `CDN_SOURCE_DIR` | Next.js 构建产物目录 | 否 | `.next/static` | `.next/static` |
| `CDN_TARGET_PREFIX` | CDN 目标路径前缀 | 否 | `_next/static` | `_next/static` |
| `CDN_UPLOAD_JOBS` | 并发上传任务数 | 否 | `8` | `8` |
| `CDN_SKIP_ON_ERROR` | 上传失败是否跳过 | 否 | `false` | `true/false` |
| `CDN_DRY_RUN` | 仅模拟不实际上传 | 否 | `false` | `true/false` |

### Public 目录上传（可选）

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `CDN_UPLOAD_PUBLIC` | 是否上传 public 目录 | 否 | `false` | `true/false` |
| `CDN_PUBLIC_SOURCE_DIR` | public 源目录 | 否 | `public` | `public` |
| `CDN_PUBLIC_TARGET_PREFIX` | CDN 目标前缀 | 否 | `public` | `public` |

### 阿里云 OSS 配置（使用阿里云时必需）

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `OSS_BUCKET` | OSS Bucket 名称 | 是 | - | `oss://your-bucket` |
| `OSS_ACCESS_KEY_ID` | 阿里云 AccessKey ID | 是 | - | `LTAI5t...` |
| `OSS_ACCESS_KEY_SECRET` | 阿里云 AccessKey Secret | 是 | - | `xxx` |
| `OSS_ENDPOINT` | OSS 访问域名 | 否 | - | `oss-cn-hangzhou.aliyuncs.com` |
| `OSS_STS_TOKEN` | STS 临时凭证 | 否 | - | - |

### 腾讯云 COS 配置（使用腾讯云时必需）

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `COS_BUCKET` | COS Bucket 名称 | 是 | - | `your-bucket-1250000000` |
| `COS_REGION` | COS 地域 | 是 | - | `ap-guangzhou` |
| `COS_SECRET_ID` | 腾讯云 SecretId | 是 | - | `AKIDxxx` |
| `COS_SECRET_KEY` | 腾讯云 SecretKey | 是 | - | `xxx` |
| `COS_SESSION_TOKEN` | 临时密钥 Token | 否 | - | - |
| `COS_SCHEME` | 传输协议 | 否 | `https` | `https/http` |

### 调试与可选配置

| 变量名 | 说明 | 必需 | 默认值 | 示例 |
|--------|------|------|--------|------|
| `NEXT_PUBLIC_SHOW_DEBUG_INFO` | 显示调试信息 | 否 | `false` | `true/false` |
| `NEXT_PUBLIC_DEBUG` | 开启调试模式 | 否 | `false` | `true/false` |
| `DATABASE_URL` | 数据库连接 | 否 | - | `postgresql://user:pass@host:5432/db` |
| `GOOGLE_ANALYTICS_ID` | Google Analytics ID | 否 | - | `G-XXXXXXXXXX` |
| `SENTRY_DSN` | Sentry 错误追踪 | 否 | - | `https://xxx@sentry.io/xxx` |

### 配置说明

**CDN 上传工作流程**：
1. 配置 `NEXT_PUBLIC_CDN_URL` - CDN 域名
2. 配置 `CDN_UPLOAD_ENABLED=true` - 启用自动上传
3. 配置 `CDN_PROVIDER` - 选择提供商（aliyun/tencent）
4. 配置对应提供商的认证信息（OSS 或 COS）
5. 部署时自动通过 Docker 容器上传静态文件

**Public 目录上传**：
- 默认只上传 Next.js 构建产物（`.next/static/`）
- 设置 `CDN_UPLOAD_PUBLIC=true` 可上传 public 目录
- 需要在代码中使用 `getAssetUrl()` 函数引用资源

**环境文件位置**：
- 本地开发：`.env.docker`
- 测试环境：`.env.staging`
- 正式环境：`.env.production`

## 环境对比

| 脚本 | 环境 | 端口 | 配置文件 | 特性 |
|------|------|------|----------|------|
| `docker-local.sh` | 本地开发 | 3000 | `.env.docker` | 快速启动，无SSL |
| `docker-staging.sh` | 测试环境 | 8080/8443 | `.env.staging` | 支持SSL，自动备份，CDN上传 |
| `docker-production.sh` | 正式环境 | 80/443 | `.env.production` | 支持SSL，自动备份，回滚，CDN上传 |

## 脚本命令

| 命令 | 说明 | 适用环境 |
|------|------|----------|
| `up` | 构建并启动服务 | 全部 |
| `down` | 停止并删除容器 | 全部 |
| `restart` | 重启服务（不重新构建） | 全部 |
| `logs` | 实时查看日志 | 全部 |
| `status` | 查看容器状态和健康检查 | 全部 |
| `backups` | 列出所有备份镜像 | 测试/正式 |
| `rollback` | 回滚到上一个备份版本 | 测试/正式 |
| `help` | 显示帮助信息 | 全部 |

## 快速部署

### 本地开发环境

```bash
# 1. 准备环境变量
cp config/.env.example .env.docker

# 2. 启动服务
./docker-local.sh up

# 3. 访问应用
# http://localhost:3000/zh
# http://localhost:3000/en
```

### 测试环境

```bash
# 1. 准备环境变量
cp config/.env.staging.example .env.staging
vim .env.staging

# 2. 准备SSL证书（可选）
mkdir -p deploy/certs/staging
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deploy/certs/staging/privkey.pem \
  -out deploy/certs/staging/fullchain.pem \
  -subj "/CN=staging.example.com"

# 3. 启动服务
./docker-staging.sh up

# 4. 访问应用
# http://localhost:8080
# https://localhost:8443
```

### 正式环境

```bash
# 1. 准备环境变量
cp config/.env.production.example .env.production
vim .env.production

# 2. 准备SSL证书（推荐）
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem deploy/certs/production/

# 3. 启动服务
./docker-production.sh up

# 4. 验证部署
./docker-production.sh status
curl https://yourdomain.com/api/health
```

## 环境变量

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_SITE_URL` | 站点URL | `https://example.com` |
| `NEXT_PUBLIC_API_URL` | API地址 | `https://api.example.com` |
| `NEXT_PUBLIC_CDN_URL` | CDN地址 | `https://cdn.example.com` |
| `NEXT_PUBLIC_ENV` | 环境标识 | `development/staging/production` |

### CDN 配置（可选）

部署时会自动通过 Docker 容器上传静态文件到 CDN（无需本地安装工具）。

**基础配置**：

```bash
# .env.production
NEXT_PUBLIC_CDN_URL=https://cdn.example.com  # CDN 域名
CDN_PROVIDER=aliyun                          # aliyun 或 tencent

# 阿里云 OSS
OSS_BUCKET=oss://your-bucket
OSS_ACCESS_KEY_ID=xxx
OSS_ACCESS_KEY_SECRET=xxx

# 或腾讯云 COS
COS_BUCKET=your-bucket-1250000000
COS_REGION=ap-guangzhou
COS_SECRET_ID=xxx
COS_SECRET_KEY=xxx
```

详细配置说明见 `.env.production.example` 文件。

### 可选变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `API_SECRET_KEY` | API密钥 | - |
| `IMAGE_CDN_TOKEN` | CDN令牌 | - |
| `NEXT_PUBLIC_SHOW_DEBUG_INFO` | 显示调试信息 | `false` |

## 常见操作

### 代码更新

```bash
git pull
./docker-production.sh down
./docker-production.sh up  # 自动备份旧版本
```

### 快速回滚

```bash
./docker-production.sh rollback  # 回滚到上一版本
./docker-production.sh status    # 验证状态
```

### 查看日志

```bash
./docker-production.sh logs  # 实时日志
```

### 查看备份

```bash
./docker-production.sh backups  # 列出所有备份
```

### SSL证书更新

```bash
# 更新证书
sudo certbot renew
sudo cp /etc/letsencrypt/live/yourdomain.com/*.pem deploy/certs/production/

# 重启Nginx
docker compose -f docker-compose.production.yml restart nginx-production
```

## 故障排查

| 问题 | 解决方案 |
|------|----------|
| 脚本无执行权限 | `chmod +x docker-*.sh` |
| Docker未运行 | macOS: `open -a Docker`<br>Linux: `sudo systemctl start docker` |
| 端口被占用 | `lsof -i :3000` 查找进程，`kill -9 <PID>` |
| 环境变量文件不存在 | 复制对应的 `.env.*.example` 文件 |
| 健康检查失败 | 查看日志 `./docker-{env}.sh logs` |
| 容器启动失败 | `docker ps -a` 和 `docker logs <container_id>` |

## 目录结构

```
web-tem/
├── deploy/
│   ├── certs/              # SSL证书目录
│   │   ├── staging/        # 测试环境证书
│   │   └── production/     # 正式环境证书
│   ├── nginx.staging.conf  # 测试环境Nginx配置
│   └── nginx.production.conf # 正式环境Nginx配置
├── docker-local.sh         # 本地环境脚本
├── docker-staging.sh       # 测试环境脚本
├── docker-production.sh    # 正式环境脚本
├── Dockerfile              # Docker镜像构建文件
├── docker-compose.local.yml
├── docker-compose.staging.yml
└── docker-compose.production.yml
```

## 端口说明

| 环境 | HTTP | HTTPS | 容器内部 |
|------|------|-------|----------|
| 本地开发 | 3000 | - | 3000 |
| 测试环境 | 8080 | 8443 | 3000 |
| 正式环境 | 80 | 443 | 3000 |

## 最佳实践

1. **开发流程**：日常开发使用 `npm run dev`，提交前用 Docker 测试
2. **测试流程**：先在测试环境验证，确认无误后部署到正式环境
3. **备份管理**：保留最近5个备份，定期清理旧备份
4. **日志管理**：定期查看和导出日志
5. **安全建议**：
   - 不要将 `.env.*` 文件提交到 Git
   - 正式环境必须使用 HTTPS
   - 定期更新 SSL 证书（Let's Encrypt 证书有效期90天）
   - 使用强密码和密钥

## CDN 配置指南

### 为什么使用 CDN？

- ✅ 不占用服务器带宽
- ✅ 全球访问加速
- ✅ 降低成本

### 配置步骤

#### 1. 创建对象存储和 CDN

**阿里云 OSS**：
1. 创建 OSS Bucket（公共读）
2. 开启 CDN 加速，绑定域名 `cdn.example.com`
3. 配置 SSL 证书
4. 获取 AccessKey ID 和 Secret

**腾讯云 COS**：
1. 创建 COS Bucket（公共读）
2. 开启 CDN 加速，绑定域名 `cdn.example.com`
3. 配置 SSL 证书
4. 获取 Secret ID 和 Key

#### 2. 配置环境变量

编辑 `.env.production` 文件：

```bash
# CDN 基础配置
NEXT_PUBLIC_CDN_URL=https://cdn.example.com
CDN_PROVIDER=aliyun

# 阿里云 OSS 凭证
OSS_BUCKET=oss://your-bucket-name
OSS_ACCESS_KEY_ID=your_access_key_id
OSS_ACCESS_KEY_SECRET=your_access_key_secret
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com

# 或腾讯云 COS 凭证
# CDN_PROVIDER=tencent
# COS_BUCKET=your-bucket-1250000000
# COS_REGION=ap-guangzhou
# COS_SECRET_ID=your_secret_id
# COS_SECRET_KEY=your_secret_key
```

#### 3. 部署

```bash
# 部署时会自动上传静态文件到 CDN
./docker-production.sh up
```

**部署流程**：
1. 构建 Next.js 项目
2. 自动检测 CDN 配置
3. 步骤 1/2: 上传 `.next/static/` 到 CDN（Next.js 构建产物）
4. 步骤 2/2: 上传 `public/` 到 CDN（如果启用 `CDN_UPLOAD_PUBLIC=true`）
5. 构建并启动 Docker 容器

**注意**：
- 未配置 CDN 时会自动跳过上传
- 上传失败不会中断部署流程
- 首次使用腾讯云 COS 需要构建 Docker 镜像：
  ```bash
  docker build -f docker/cos-upload.Dockerfile -t web-tem/coscmd:latest .
  ```

### Public 目录上传（可选）

默认情况下，只上传 Next.js 构建产物（`.next/static/`）。如需上传 `public/` 目录的静态资源（图片、视频等）到 CDN：

**1. 启用上传**：
```bash
# .env.production 或 .env.staging
CDN_UPLOAD_PUBLIC=true
```

**2. 代码中使用**：
```tsx
import { getAssetUrl } from '@/lib/utils/cdn';

// 图片、视频等所有静态资源统一使用
<img src={getAssetUrl('/images/logo.png')} alt="Logo" />
<video src={getAssetUrl('/videos/intro.mp4')} controls />
```

**路径转换**：
- 未配置 CDN：`/images/logo.png`（走服务器）
- 配置 CDN：`https://cdn.example.com/public/images/logo.png`（走 CDN）

**使用建议**：
- 资源少（< 10MB）：保持关闭，走服务器
- 资源多（> 10MB）：启用上传，走 CDN

详细使用方法请查看 [CLAUDE.md - CDN 静态资源使用](./CLAUDE.md#cdn-静态资源使用)

### 独立上传脚本

也可以单独调用上传脚本：

```bash
# 查看帮助
./scripts/upload-static.sh --help

# 使用环境文件上传
./scripts/upload-static.sh --env-file .env.production

# Dry-run 模式（仅查看命令）
./scripts/upload-static.sh --env-file .env.staging --dry-run
```

### 缓存管理

Next.js 静态文件名包含哈希值（如 `webpack-b09e44ad183df33b.js`），文件内容变化时哈希值自动变化，**无需手动刷新 CDN 缓存**。

### 故障排查

| 问题 | 解决方案 |
|------|----------|
| 静态资源 404 | 检查 CDN 域名配置和 HTTPS 证书 |
| 上传失败 | 查看日志，检查 AccessKey 权限 |
| 跳过 CDN 上传 | 检查环境变量配置是否正确 |
| Docker 镜像构建失败 | 确保网络可访问 Docker Hub 和 PyPI |
| public 资源未走 CDN | 1. 检查是否启用 `CDN_UPLOAD_PUBLIC=true`<br>2. 检查是否使用了工具函数<br>3. 检查是否重新部署 |
| 图片路径错误 | 确保路径以 `/` 开头，使用 `getImageUrl('/images/logo.png')` 而非 `getImageUrl('images/logo.png')` |

---

**最后更新**: 2026-02-08
