# Docker 部署指南

项目提供三个 Docker 管理脚本，简化部署流程。

## 环境对比

| 脚本 | 环境 | 端口 | 配置文件 | 特性 |
|------|------|------|----------|------|
| `docker-local.sh` | 本地开发 | 3000 | `.env.docker` | 快速启动，无SSL |
| `docker-staging.sh` | 测试环境 | 8080/8443 | `.env.staging` | 支持SSL，自动备份 |
| `docker-production.sh` | 正式环境 | 80/443 | `.env.production` | 支持SSL，自动备份，回滚 |

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
cp .env.example .env.docker

# 2. 启动服务
./docker-local.sh up

# 3. 访问应用
# http://localhost:3000/zh
# http://localhost:3000/en
```

### 测试环境

```bash
# 1. 准备环境变量
cp .env.staging.example .env.staging
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
cp .env.production.example .env.production
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

---

**最后更新**: 2026-02-08
