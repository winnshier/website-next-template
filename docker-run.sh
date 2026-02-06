#!/bin/bash

echo "🐳 企业级官网模板 - Docker运行脚本"
echo "=================================="
echo ""

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker daemon未运行"
    echo "请先启动Docker Desktop，然后重新运行此脚本"
    exit 1
fi

echo "✅ Docker daemon正在运行"
echo ""

# 检查环境文件
if [ ! -f .env.docker ]; then
    echo "❌ 未找到 .env.docker 文件"
    exit 1
fi

echo "📦 开始构建Docker镜像..."
docker compose -f docker-compose.local.yml build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo ""
echo "✅ 构建成功"
echo ""
echo "🚀 启动容器..."
docker compose -f docker-compose.local.yml up -d

if [ $? -ne 0 ]; then
    echo "❌ 启动失败"
    exit 1
fi

echo ""
echo "✅ 容器启动成功！"
echo ""
echo "📊 容器状态："
docker compose -f docker-compose.local.yml ps
echo ""
echo "🌐 访问地址："
echo "   http://localhost:3000"
echo ""
echo "📝 常用命令："
echo "   查看日志: docker compose -f docker-compose.local.yml logs -f"
echo "   停止服务: docker compose -f docker-compose.local.yml down"
echo "   重启服务: docker compose -f docker-compose.local.yml restart"
echo ""
echo "⏳ 等待服务启动（约10秒）..."
sleep 10

# 健康检查
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ 健康检查通过！"
    echo "🎉 项目已成功运行在 http://localhost:3000"
else
    echo "⚠️  健康检查失败，请查看日志："
    echo "   docker compose -f docker-compose.local.yml logs"
fi
