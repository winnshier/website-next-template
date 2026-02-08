#!/bin/bash

# 本地开发环境 Docker 管理脚本
# 使用方法: ./scripts/docker-local.sh [up|down|restart|logs|status]

set -e

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

ENV_NAME="本地开发"
COMPOSE_FILE="docker/docker-compose.local.yml"
ENV_FILE=".env.docker"
CONTAINER_NAME="web-tem-local"
PORT="3000"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}🐳 ${ENV_NAME}环境 - Docker 管理${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 检查Docker是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon未运行"
        echo "请先启动Docker Desktop，然后重新运行此脚本"
        exit 1
    fi
}

# 检查环境文件
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "未找到 $ENV_FILE 文件"
        print_info "请复制示例文件：cp config/.env.docker.example .env.docker"
        exit 1
    fi
}

# 清理旧容器（如果存在）
cleanup_old_containers() {
    print_info "检查并清理旧容器..."

    # 获取所有相关容器
    local containers=$(docker ps -a --filter "name=${CONTAINER_NAME}" --format "{{.Names}}" 2>/dev/null)

    if [ -n "$containers" ]; then
        print_warning "发现旧容器，正在清理..."
        echo "$containers" | while read container; do
            if [ -n "$container" ]; then
                print_info "停止并删除容器: $container"
                docker stop "$container" >/dev/null 2>&1 || true
                docker rm "$container" >/dev/null 2>&1 || true
            fi
        done
        print_success "旧容器清理完成"
    else
        print_info "未发现旧容器"
    fi
    echo ""
}

# 启动服务
docker_up() {
    print_header
    print_info "启动${ENV_NAME}环境..."
    echo ""

    check_docker
    check_env_file

    # 清理旧容器
    cleanup_old_containers

    print_info "构建Docker镜像..."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

    if [ $? -ne 0 ]; then
        print_error "构建失败"
        exit 1
    fi

    print_success "构建成功"
    echo ""

    print_info "启动容器..."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

    if [ $? -ne 0 ]; then
        print_error "启动失败"
        exit 1
    fi

    print_success "容器启动成功！"
    echo ""

    print_info "容器状态："
    docker compose -f "$COMPOSE_FILE" ps
    echo ""

    print_info "等待服务启动（约10秒）..."
    sleep 10

    # 健康检查
    if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
        print_success "健康检查通过！"
        echo ""
        echo "🌐 访问地址："
        echo "   中文首页: http://localhost:${PORT}/zh"
        echo "   英文首页: http://localhost:${PORT}/en"
        echo "   健康检查: http://localhost:${PORT}/api/health"
    else
        print_warning "健康检查失败，请查看日志"
        echo "   docker compose -f $COMPOSE_FILE logs"
    fi

    echo ""
    print_info "常用命令："
    echo "   查看日志: ./docker-local.sh logs"
    echo "   停止服务: ./docker-local.sh down"
    echo "   重启服务: ./docker-local.sh restart"
    echo "   查看状态: ./docker-local.sh status"
    echo ""
}

# 停止服务
docker_down() {
    print_header
    print_info "停止${ENV_NAME}环境..."
    echo ""

    docker compose -f "$COMPOSE_FILE" down

    if [ $? -eq 0 ]; then
        print_success "容器已停止并删除"
    else
        print_error "停止失败"
        exit 1
    fi
    echo ""
}

# 重启服务
docker_restart() {
    print_header
    print_info "重启${ENV_NAME}环境..."
    echo ""

    docker compose -f "$COMPOSE_FILE" restart

    if [ $? -eq 0 ]; then
        print_success "容器已重启"
        echo ""

        print_info "等待服务启动（约5秒）..."
        sleep 5

        # 健康检查
        if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
            print_success "健康检查通过！"
        else
            print_warning "健康检查失败，请查看日志"
        fi
    else
        print_error "重启失败"
        exit 1
    fi
    echo ""
}

# 查看日志
docker_logs() {
    print_header
    print_info "查看${ENV_NAME}环境日志..."
    echo ""
    echo "按 Ctrl+C 退出日志查看"
    echo ""
    sleep 2

    docker compose -f "$COMPOSE_FILE" logs -f
}

# 查看状态
docker_status() {
    print_header
    print_info "${ENV_NAME}环境状态"
    echo ""

    # 容器状态
    echo "📦 容器状态："
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps 2>/dev/null || docker compose -f "$COMPOSE_FILE" ps
    echo ""

    # 健康检查
    if docker ps --format "{{.Names}}" | grep -q "$CONTAINER_NAME"; then
        HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$CONTAINER_NAME" 2>/dev/null || echo "no healthcheck")
        echo "🏥 健康状态: $HEALTH_STATUS"
        echo ""

        # API健康检查
        if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
            print_success "API健康检查通过"
        else
            print_warning "API健康检查失败"
        fi
    else
        print_warning "容器未运行"
    fi
    echo ""
}

# 显示帮助信息
show_help() {
    print_header
    echo "使用方法: ./docker-local.sh [命令]"
    echo ""
    echo "可用命令："
    echo "  up       - 构建并启动容器"
    echo "  down     - 停止并删除容器"
    echo "  restart  - 重启容器"
    echo "  logs     - 查看实时日志"
    echo "  status   - 查看容器状态"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo "示例："
    echo "  ./docker-local.sh up       # 启动服务"
    echo "  ./docker-local.sh down     # 停止服务"
    echo "  ./docker-local.sh restart  # 重启服务"
    echo "  ./docker-local.sh logs     # 查看日志"
    echo ""
}

# 主函数
main() {
    case "${1:-help}" in
        up)
            docker_up
            ;;
        down)
            docker_down
            ;;
        restart)
            docker_restart
            ;;
        logs)
            docker_logs
            ;;
        status)
            docker_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
