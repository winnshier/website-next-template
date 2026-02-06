#!/bin/bash
set -e

echo "🚀 Deploying to Production Environment..."
echo "⚠️  This will deploy to PRODUCTION. Are you sure? (yes/no)"
read -r confirmation

if [ "$confirmation" != "yes" ]; then
  echo "❌ Deployment cancelled."
  exit 0
fi

# 拉取最新代码
git pull origin main

# 构建并启动正式环境
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# 等待服务启动
echo "⏳ Waiting for service to start..."
sleep 15

# 健康检查
if curl -f http://localhost/api/health > /dev/null 2>&1; then
  echo "✅ Production deployment successful!"
  echo "🌐 Visit: https://example.com"
else
  echo "❌ Health check failed!"
  echo "🔄 Rolling back..."
  docker compose -f docker-compose.production.yml down
  exit 1
fi

# 清理旧镜像
docker image prune -f

echo "📊 Container status:"
docker compose -f docker-compose.production.yml ps

echo "📝 Deployment completed at: $(date)"
