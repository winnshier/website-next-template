#!/bin/bash

echo "🛑 停止Docker容器..."
docker compose -f docker-compose.local.yml down

echo ""
echo "✅ 容器已停止"
echo ""
echo "💡 提示："
echo "   重新启动: ./docker-run.sh"
echo "   查看所有容器: docker ps -a"
echo "   清理未使用的镜像: docker image prune"
