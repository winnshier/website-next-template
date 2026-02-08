#!/bin/bash

# 正式环境 Docker 管理脚本
# 使用方法: ./scripts/docker-production.sh [up|down|restart|logs|status]

set -e

# 获取项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

ENV_NAME="正式"
COMPOSE_FILE="docker/docker-compose.production.yml"
ENV_FILE=".env.production"
CONTAINER_NAME="web-tem-production"
NGINX_CONTAINER="nginx-production"
PORT="80"
HTTPS_PORT="443"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
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

print_critical() {
    echo -e "${MAGENTA}🚨 $1${NC}"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${MAGENTA}🐳 ${ENV_NAME}环境 - Docker 管理${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

# 检查Docker是否运行
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon未运行"
        echo "请先启动Docker，然后重新运行此脚本"
        exit 1
    fi
}

# 检查环境文件
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "未找到 $ENV_FILE 文件"
        echo ""
        echo "请先创建环境变量文件："
        echo "  cp config/.env.production.example $ENV_FILE"
        echo "  # 然后编辑 $ENV_FILE 填入真实的生产环境配置"
        echo ""
        print_critical "警告：生产环境配置必须使用真实的密钥和URL！"
        exit 1
    fi
}

# 检查SSL证书（仅警告，不阻止）
check_ssl_certs() {
    if [ ! -f "deploy/certs/production/fullchain.pem" ] || [ ! -f "deploy/certs/production/privkey.pem" ]; then
        print_warning "未找到SSL证书文件"
        echo ""
        echo "建议配置SSL证书以启用HTTPS："
        echo "  deploy/certs/production/fullchain.pem"
        echo "  deploy/certs/production/privkey.pem"
        echo ""
        echo "获取Let's Encrypt证书："
        echo "  sudo certbot certonly --standalone -d yourdomain.com"
        echo "  sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem deploy/certs/production/"
        echo "  sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem deploy/certs/production/"
        echo ""
        print_info "继续启动（仅HTTP模式）..."
        echo ""
    fi
}

# 备份当前镜像
backup_image() {
    # 检查容器是否存在
    if docker ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"; then
        local BACKUP_TAG="backup-$(date +%Y%m%d-%H%M%S)"
        print_info "备份当前镜像..."

        # 获取当前镜像
        local CURRENT_IMAGE=$(docker inspect --format='{{.Config.Image}}' "$CONTAINER_NAME" 2>/dev/null)

        if [ -n "$CURRENT_IMAGE" ]; then
            docker tag "$CURRENT_IMAGE" "web-tem:${BACKUP_TAG}"
            if [ $? -eq 0 ]; then
                print_success "镜像已备份: web-tem:${BACKUP_TAG}"
                echo "$BACKUP_TAG" > .last-backup-tag
                return 0
            else
                print_warning "镜像备份失败，继续部署..."
                return 1
            fi
        else
            print_info "未找到运行中的容器，跳过备份"
            return 1
        fi
    else
        print_info "首次部署，无需备份"
        return 1
    fi
}

# 上传静态文件到 CDN（通过独立脚本）
upload_static_assets() {
    if [ ! -f "scripts/upload-static.sh" ]; then
        print_info "未找到 scripts/upload-static.sh，跳过 CDN 上传"
        return 0
    fi

    print_info "调用 CDN 上传脚本..."
    if ./scripts/upload-static.sh --env-file "$ENV_FILE"; then
        print_success "CDN 上传完成"
    else
        print_warning "CDN 上传失败（可通过设置 CDN_SKIP_ON_ERROR=1 忽略错误）"
    fi
}

# 清理旧容器（如果存在）
cleanup_old_containers() {
    print_info "检查并清理旧容器..."

    # 获取所有相关容器
    local containers=$(docker ps -a --filter "name=${CONTAINER_NAME}" --filter "name=${NGINX_CONTAINER}" --format "{{.Names}}" 2>/dev/null)

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
    check_ssl_certs

    # 清理旧容器
    cleanup_old_containers

    # 备份当前镜像（忽略返回值）
    backup_image || true
    echo ""

    print_info "构建Docker镜像..."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" build

    if [ $? -ne 0 ]; then
        print_error "构建失败"
        exit 1
    fi

    print_success "构建成功"
    echo ""

    # 上传静态文件到 CDN（如果配置了）
    upload_static_assets || true
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

    print_info "等待服务启动（约20秒）..."
    sleep 20

    # 健康检查
    if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
        print_success "健康检查通过！"
        echo ""
        echo "🌐 访问地址："
        echo "   HTTP:  http://localhost:${PORT}"
        echo "   HTTPS: https://localhost:${HTTPS_PORT}"
        echo "   健康检查: http://localhost:${PORT}/api/health"
        echo ""
        print_success "生产环境部署成功！"
    else
        print_error "健康检查失败！"
        echo ""
        echo "请立即检查日志："
        echo "   docker compose -f $COMPOSE_FILE logs"
        echo ""
        print_critical "生产环境可能无法正常访问！"
    fi

    echo ""
    print_info "常用命令："
    echo "   查看日志: ./docker-production.sh logs"
    echo "   停止服务: ./docker-production.sh down"
    echo "   重启服务: ./docker-production.sh restart"
    echo "   查看状态: ./docker-production.sh status"
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

        print_info "等待服务启动（约15秒）..."
        sleep 15

        # 健康检查
        if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
            print_success "健康检查通过！服务已恢复"
        else
            print_error "健康检查失败！"
            print_critical "请立即检查日志！"
        fi
    else
        print_error "重启失败"
        print_critical "生产环境可能无法访问！"
        exit 1
    fi
    echo ""
}

# 回滚到上一个版本
docker_rollback() {
    print_header
    print_info "回滚${ENV_NAME}环境..."
    echo ""

    # 检查是否有备份
    if [ ! -f ".last-backup-tag" ]; then
        print_error "未找到备份标签文件"
        echo ""
        echo "可用的备份镜像："
        docker images web-tem --format "table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | grep backup
        echo ""
        echo "手动回滚："
        echo "  docker tag web-tem:backup-YYYYMMDD-HHMMSS web-tem:production"
        echo "  ./docker-production.sh restart"
        exit 1
    fi

    local BACKUP_TAG=$(cat .last-backup-tag)
    print_info "找到备份: web-tem:${BACKUP_TAG}"
    echo ""

    # 检查备份镜像是否存在
    if ! docker images web-tem:${BACKUP_TAG} --format "{{.Tag}}" | grep -q "${BACKUP_TAG}"; then
        print_error "备份镜像不存在: web-tem:${BACKUP_TAG}"
        exit 1
    fi

    print_warning "即将回滚到备份版本"
    echo ""
    read -p "确认回滚？[yes/NO] " -r
    echo
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        print_info "回滚已取消"
        exit 0
    fi

    # 停止当前容器
    print_info "停止当前容器..."
    docker compose -f "$COMPOSE_FILE" down

    # 标记备份镜像为production
    print_info "恢复备份镜像..."
    docker tag "web-tem:${BACKUP_TAG}" "web-tem:production"

    if [ $? -ne 0 ]; then
        print_error "恢复镜像失败"
        exit 1
    fi

    # 启动容器
    print_info "启动容器..."
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d

    if [ $? -ne 0 ]; then
        print_error "启动失败"
        exit 1
    fi

    print_success "回滚成功！"
    echo ""

    print_info "等待服务启动（约15秒）..."
    sleep 15

    # 健康检查
    if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
        print_success "健康检查通过！"
        echo ""
        print_success "已成功回滚到: ${BACKUP_TAG}"
    else
        print_error "健康检查失败！"
        print_critical "请立即检查日志！"
    fi
    echo ""
}

# 列出所有备份
docker_list_backups() {
    print_header
    print_info "可用的备份镜像"
    echo ""

    echo "📦 备份列表："
    docker images web-tem --format "table {{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | grep -E "(TAG|backup)"

    if [ -f ".last-backup-tag" ]; then
        echo ""
        local LAST_BACKUP=$(cat .last-backup-tag)
        print_info "最近备份: web-tem:${LAST_BACKUP}"
    fi

    echo ""
    echo "💡 使用方法："
    echo "   回滚到最近备份: ./docker-production.sh rollback"
    echo "   手动回滚到指定版本:"
    echo "     docker tag web-tem:backup-YYYYMMDD-HHMMSS web-tem:production"
    echo "     ./docker-production.sh restart"
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
        echo "🏥 Web容器健康状态: $HEALTH_STATUS"

        # API健康检查
        if curl -f http://localhost:${PORT}/api/health > /dev/null 2>&1; then
            print_success "API健康检查通过"
        else
            print_error "API健康检查失败"
            print_critical "生产环境可能无法正常访问！"
        fi
    else
        print_error "Web容器未运行"
        print_critical "生产环境已停止！"
    fi

    # Nginx状态
    if docker ps --format "{{.Names}}" | grep -q "$NGINX_CONTAINER"; then
        print_success "Nginx容器运行中"
    else
        print_error "Nginx容器未运行"
        print_critical "HTTPS访问不可用！"
    fi

    echo ""

    # 资源使用情况
    echo "💻 资源使用："
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" "$CONTAINER_NAME" "$NGINX_CONTAINER" 2>/dev/null || echo "无法获取资源信息"
    echo ""
}

# 显示帮助信息
show_help() {
    print_header
    echo "使用方法: ./docker-production.sh [命令]"
    echo ""
    echo "可用命令："
    echo "  up       - 构建并启动容器（自动备份旧版本）"
    echo "  down     - 停止并删除容器"
    echo "  restart  - 重启容器"
    echo "  rollback - 回滚到上一个版本"
    echo "  backups  - 列出所有备份"
    echo "  logs     - 查看实时日志"
    echo "  status   - 查看容器状态"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo "示例："
    echo "  ./docker-production.sh up        # 启动服务（自动备份）"
    echo "  ./docker-production.sh down      # 停止服务"
    echo "  ./docker-production.sh restart   # 重启服务"
    echo "  ./docker-production.sh rollback  # 回滚到上一个版本"
    echo "  ./docker-production.sh backups   # 查看所有备份"
    echo "  ./docker-production.sh logs      # 查看日志"
    echo "  ./docker-production.sh status    # 查看状态"
    echo ""
    print_info "生产环境注意事项："
    echo "  1. 每次部署会自动备份当前版本"
    echo "  2. 可使用 rollback 命令快速回滚"
    echo "  3. 建议配置SSL证书以启用HTTPS"
    echo "  4. 必须使用真实的环境变量"
    echo "  5. 默认端口: HTTP ${PORT}, HTTPS ${HTTPS_PORT}"
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
        rollback)
            docker_rollback
            ;;
        backups|backup)
            docker_list_backups
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
