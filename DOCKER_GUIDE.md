# Docker运行指南

## 🚀 快速开始

### 1. 启动Docker Desktop

确保Docker Desktop正在运行：
- macOS: 打开 Applications → Docker.app
- 等待菜单栏的Docker图标显示为运行状态

### 2. 运行项目

```bash
# 方式一：使用便捷脚本（推荐）
./docker-run.sh

# 方式二：手动运行
docker compose -f docker-compose.local.yml up -d --build
```

### 3. 访问项目

打开浏览器访问：
- 英文版：http://localhost:3000/en
- 中文版：http://localhost:3000/zh
- 健康检查：http://localhost:3000/api/health

### 4. 停止项目

```bash
# 方式一：使用便捷脚本
./docker-stop.sh

# 方式二：手动停止
docker compose -f docker-compose.local.yml down
```

---

## 📋 常用命令

### 查看日志
```bash
# 实时查看所有日志
docker compose -f docker-compose.local.yml logs -f

# 查看最近100行日志
docker compose -f docker-compose.local.yml logs --tail=100
```

### 重启服务
```bash
docker compose -f docker-compose.local.yml restart
```

### 查看容器状态
```bash
docker compose -f docker-compose.local.yml ps
```

### 进入容器
```bash
docker compose -f docker-compose.local.yml exec web sh
```

### 清理资源
```bash
# 停止并删除容器
docker compose -f docker-compose.local.yml down

# 删除镜像
docker rmi web-tem:local

# 清理未使用的镜像
docker image prune -f

# 清理所有未使用的资源
docker system prune -a
```

---

## 🔧 配置说明

### 环境变量

编辑 `.env.docker` 文件来修改配置：

```bash
# 站点URL
NEXT_PUBLIC_SITE_URL=http://localhost

# API地址
NEXT_PUBLIC_API_URL=http://localhost/api

# 环境标识
NEXT_PUBLIC_ENV=production
```

### 端口配置

默认端口是3000。如果需要修改，编辑 `docker-compose.local.yml`：

```yaml
ports:
  - "8080:3000"  # 改为8080端口
```

---

## 🐛 故障排查

### 问题1：Docker daemon未运行

**错误信息**：
```
Cannot connect to the Docker daemon at unix:///var/run/docker.sock
```

**解决方案**：
1. 启动Docker Desktop
2. 等待Docker完全启动
3. 重新运行脚本

### 问题2：端口被占用

**错误信息**：
```
Bind for 0.0.0.0:3000 failed: port is already allocated
```

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :3000

# 停止占用端口的进程
kill -9 <PID>

# 或者修改docker-compose.local.yml使用其他端口
```

### 问题3：构建失败

**解决方案**：
```bash
# 清理缓存重新构建
docker compose -f docker-compose.local.yml build --no-cache

# 查看详细构建日志
docker compose -f docker-compose.local.yml build --progress=plain
```

### 问题4：健康检查失败

**解决方案**：
```bash
# 查看容器日志
docker compose -f docker-compose.local.yml logs

# 检查容器是否运行
docker compose -f docker-compose.local.yml ps

# 重启容器
docker compose -f docker-compose.local.yml restart
```

---

## 📊 多环境部署

### 测试环境

```bash
# 使用测试环境配置
docker compose -f docker-compose.staging.yml up -d --build

# 访问地址
http://localhost:8080
```

### 正式环境

```bash
# 使用正式环境配置
docker compose -f docker-compose.production.yml up -d --build

# 访问地址
http://localhost
```

---

## 💡 最佳实践

### 1. 开发流程

```bash
# 1. 修改代码
# 2. 重新构建
docker compose -f docker-compose.local.yml build

# 3. 重启服务
docker compose -f docker-compose.local.yml up -d

# 4. 查看日志
docker compose -f docker-compose.local.yml logs -f
```

### 2. 性能优化

- 使用 `.dockerignore` 排除不必要的文件
- 利用Docker层缓存加速构建
- 定期清理未使用的镜像和容器

### 3. 安全建议

- 不要在镜像中包含敏感信息
- 使用环境变量管理配置
- 定期更新基础镜像

---

## 📚 相关文档

- [Dockerfile](./Dockerfile) - Docker镜像配置
- [docker-compose.local.yml](./docker-compose.local.yml) - 本地环境配置
- [docker-compose.staging.yml](./docker-compose.staging.yml) - 测试环境配置
- [docker-compose.production.yml](./docker-compose.production.yml) - 正式环境配置
- [README.md](./README.md) - 项目说明

---

**最后更新**: 2026-02-06
