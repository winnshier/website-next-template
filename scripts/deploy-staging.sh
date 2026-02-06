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
