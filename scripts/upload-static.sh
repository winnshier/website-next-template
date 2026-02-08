#!/usr/bin/env bash
#
# 上传 Next.js 静态资源到 OSS/COS（通过 Docker 容器执行）
#
# 功能：
# - 支持阿里云 OSS 和腾讯云 COS
# - 使用 Docker 容器执行上传，无需本地安装工具
# - 从环境变量读取认证信息
# - 支持独立调用或被其他脚本调用
#
# 用法：
#   ./scripts/upload-static.sh --env-file .env.production
#   ./scripts/upload-static.sh --provider aliyun --source .next/static
#

set -Eeuo pipefail

# ============================================================================
# 全局变量
# ============================================================================

SCRIPT_NAME="$(basename "$0")"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 临时文件列表（用于清理）
TMP_FILES=()

# 上传状态标记
UPLOAD_ATTEMPTED=0

# ============================================================================
# 日志函数
# ============================================================================

log_info() {
    printf '\033[0;34m[INFO]\033[0m %s\n' "$1"
}

log_success() {
    printf '\033[0;32m[SUCCESS]\033[0m %s\n' "$1"
}

log_warn() {
    printf '\033[0;33m[WARN]\033[0m %s\n' "$1" >&2
}

log_error() {
    printf '\033[0;31m[ERROR]\033[0m %s\n' "$1" >&2
}

# ============================================================================
# 帮助信息
# ============================================================================

usage() {
    cat <<'EOF'
上传 Next.js 静态资源到 OSS/COS（通过 Docker 容器执行）

用法：
  scripts/upload-static.sh [选项]

选项：
  --env-file <path>      指定要加载的环境变量文件（例如 .env.production）
  --provider <name>      强制指定 CDN 提供商（aliyun | tencent）
  --source <dir>         静态资源目录，默认 .next/static
  --target-prefix <path> 远程路径前缀，默认 _next/static
  --skip-on-error        上传失败时返回 0（不中断部署流程）
  --dry-run              仅打印将要执行的 Docker 命令，不实际执行
  -h, --help             显示帮助信息

环境变量：
  CDN_UPLOAD_ENABLED     是否启用 CDN 上传（默认 true）
  CDN_PROVIDER           CDN 提供商（aliyun | tencent，默认 aliyun）
  CDN_SOURCE_DIR         静态资源目录（默认 .next/static）
  CDN_TARGET_PREFIX      远程路径前缀（默认 _next/static）
  CDN_UPLOAD_JOBS        并发上传任务数（默认 8）
  CDN_SKIP_ON_ERROR      上传失败时是否继续（默认 false）
  CDN_DRY_RUN            是否为 dry-run 模式（默认 false）

阿里云 OSS 环境变量：
  OSS_BUCKET             OSS Bucket 名称（支持 oss://bucket 格式）
  OSS_ACCESS_KEY_ID      OSS Access Key ID
  OSS_ACCESS_KEY_SECRET  OSS Access Key Secret
  OSS_ENDPOINT           OSS Endpoint（默认 oss-cn-hangzhou.aliyuncs.com）
  OSS_STS_TOKEN          OSS STS Token（可选）

腾讯云 COS 环境变量：
  COS_BUCKET             COS Bucket 名称（格式：bucket-appid）
  COS_REGION             COS 区域（默认 ap-guangzhou）
  COS_SECRET_ID          COS Secret ID
  COS_SECRET_KEY         COS Secret Key
  COS_SESSION_TOKEN      COS Session Token（可选）
  COS_SCHEME             COS 协议（http | https，默认 https）

示例：
  # 使用环境文件上传
  ./scripts/upload-static.sh --env-file .env.production

  # 指定提供商和源目录
  ./scripts/upload-static.sh --provider tencent --source .next/static

  # Dry-run 模式（仅查看命令）
  ./scripts/upload-static.sh --env-file .env.staging --dry-run

  # 单独调用（需要先设置环境变量）
  export OSS_BUCKET=oss://my-bucket
  export OSS_ACCESS_KEY_ID=xxx
  export OSS_ACCESS_KEY_SECRET=xxx
  ./scripts/upload-static.sh
EOF
}

# ============================================================================
# 工具函数
# ============================================================================

# 检查布尔值
is_truthy() {
    local val
    val="$(echo "$1" | tr '[:upper:]' '[:lower:]')"
    case "$val" in
        1|true|yes|on) return 0 ;;
        *) return 1 ;;
    esac
}

# 检查命令是否存在
require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        log_error "缺少必需命令：$1"
        exit 1
    fi
}

# 规范化 bucket 名称（移除协议前缀）
normalize_bucket() {
    local bucket="${1:-}"
    bucket="${bucket#oss://}"
    bucket="${bucket#cos://}"
    bucket="${bucket#/}"
    bucket="${bucket%/}"
    printf '%s' "$bucket"
}

# 打印命令（用于 dry-run）
print_command() {
    local cmd_str=""
    for token in "$@"; do
        cmd_str+="$(printf '%q ' "$token")"
    done
    printf '%s' "${cmd_str% }"
}

# 执行 Docker 命令
run_docker_command() {
    local cmd_display
    cmd_display=$(print_command "$@")
    log_info "执行 Docker 命令："
    printf '  %s\n' "$cmd_display"

    if [ "$DRY_RUN" -eq 1 ]; then
        log_info "Dry-run 模式，未实际执行"
        return 0
    fi

    "$@"
}

# ============================================================================
# 清理函数
# ============================================================================

cleanup() {
    for file in "${TMP_FILES[@]+"${TMP_FILES[@]}"}"; do
        if [ -n "${file:-}" ] && [ -f "$file" ]; then
            rm -f "$file"
        fi
    done
}

trap cleanup EXIT

# ============================================================================
# 参数解析
# ============================================================================

ENV_FILE=""
SOURCE_OVERRIDE=""
TARGET_OVERRIDE=""
PROVIDER_OVERRIDE=""
SKIP_FLAG=""
DRY_RUN_FLAG=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        --provider)
            PROVIDER_OVERRIDE="$2"
            shift 2
            ;;
        --source)
            SOURCE_OVERRIDE="$2"
            shift 2
            ;;
        --target-prefix)
            TARGET_OVERRIDE="$2"
            shift 2
            ;;
        --skip-on-error)
            SKIP_FLAG=1
            shift
            ;;
        --dry-run)
            DRY_RUN_FLAG=1
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            usage
            exit 1
            ;;
    esac
done

# ============================================================================
# 加载环境变量
# ============================================================================

if [[ -n "$ENV_FILE" ]]; then
    if [ ! -f "$ENV_FILE" ]; then
        log_error "未找到环境变量文件：$ENV_FILE"
        exit 1
    fi

    # 安全检查：仅允许加载 .env 开头的文件（支持路径前缀）
    basename_check="$(basename "$ENV_FILE")"
    if [[ ! "$basename_check" =~ ^\.env ]]; then
        log_error "出于安全考虑，仅允许加载 .env 开头的文件（当前：$basename_check）"
        exit 1
    fi

    set -a
    # shellcheck disable=SC1090
    source "$ENV_FILE"
    set +a
    log_info "已加载环境文件：$ENV_FILE"
fi

# ============================================================================
# 配置初始化
# ============================================================================

SOURCE_DIR="${SOURCE_OVERRIDE:-${CDN_SOURCE_DIR:-.next/static}}"
TARGET_PREFIX="${TARGET_OVERRIDE:-${CDN_TARGET_PREFIX:-_next/static}}"
PROVIDER="${PROVIDER_OVERRIDE:-${CDN_PROVIDER:-aliyun}}"

# 处理 skip-on-error 标志
if [[ -n "$SKIP_FLAG" ]]; then
    SKIP_ON_ERROR=1
else
    if is_truthy "${CDN_SKIP_ON_ERROR:-false}"; then
        SKIP_ON_ERROR=1
    else
        SKIP_ON_ERROR=0
    fi
fi

# 处理 dry-run 标志
if [[ -n "$DRY_RUN_FLAG" ]]; then
    DRY_RUN=1
else
    if is_truthy "${CDN_DRY_RUN:-false}"; then
        DRY_RUN=1
    else
        DRY_RUN=0
    fi
fi

# 检查是否启用 CDN 上传
if [ -z "${CDN_UPLOAD_ENABLED:-}" ] || is_truthy "${CDN_UPLOAD_ENABLED:-true}"; then
    :
else
    log_info "CDN_UPLOAD_ENABLED 已禁用，跳过上传"
    exit 0
fi

# 检查源目录是否存在
if [ ! -d "$SOURCE_DIR" ]; then
    log_info "未找到静态目录：$SOURCE_DIR，跳过上传"
    exit 0
fi

# 获取源目录的绝对路径（安全处理）
if ! SOURCE_ABS="$(cd "$PROJECT_ROOT" && cd "$SOURCE_DIR" && pwd 2>/dev/null)"; then
    log_error "无法访问源目录：$SOURCE_DIR"
    exit 1
fi

# 规范化目标路径前缀
TARGET_PREFIX="${TARGET_PREFIX#/}"
TARGET_PREFIX="${TARGET_PREFIX%/}"
if [ -z "$TARGET_PREFIX" ]; then
    TARGET_PREFIX="_next/static"
fi

# 检查 Docker 是否可用
require_command docker

log_info "配置信息："
log_info "  提供商: $PROVIDER"
log_info "  源目录: $SOURCE_ABS"
log_info "  目标前缀: $TARGET_PREFIX"
log_info "  Dry-run: $DRY_RUN"
log_info "  失败时跳过: $SKIP_ON_ERROR"

# ============================================================================
# 阿里云 OSS 上传
# ============================================================================

run_aliyun_upload() {
    local bucket access secret endpoint remote cfg

    bucket="$(normalize_bucket "${OSS_BUCKET:-}")"
    access="${OSS_ACCESS_KEY_ID:-}"
    secret="${OSS_ACCESS_KEY_SECRET:-}"

    # 检查必需配置
    if [ -z "$bucket" ]; then
        log_info "OSS_BUCKET 未配置，跳过阿里云上传"
        return 0
    fi

    if [ -z "$access" ] || [ -z "$secret" ]; then
        log_warn "缺少 OSS 认证信息（OSS_ACCESS_KEY_ID 或 OSS_ACCESS_KEY_SECRET），跳过上传"
        return 0
    fi

    endpoint="${OSS_ENDPOINT:-oss-cn-hangzhou.aliyuncs.com}"
    remote="oss://${bucket}/${TARGET_PREFIX}"

    log_info "准备上传到阿里云 OSS："
    log_info "  Bucket: $bucket"
    log_info "  Endpoint: $endpoint"
    log_info "  远程路径: $remote"

    # 创建临时配置文件
    cfg="$(mktemp)"
    TMP_FILES+=("$cfg")

    # 构建配置文件（仅在 STS Token 存在时添加）
    cat >"$cfg" <<EOF
[Credentials]
language=CH
endpoint=$endpoint
accessKeyID=$access
accessKeySecret=$secret
EOF

    # 仅在 STS Token 存在时添加该行
    if [ -n "${OSS_STS_TOKEN:-}" ]; then
        echo "securityToken=$OSS_STS_TOKEN" >>"$cfg"
    fi

    UPLOAD_ATTEMPTED=1

    # 执行上传
    run_docker_command docker run --rm \
        -v "${SOURCE_ABS}:/upload:ro" \
        -v "${cfg}:/root/.ossutilconfig:ro" \
        registry.cn-hangzhou.aliyuncs.com/acs/ossutil:latest \
        ossutil64 cp -r -f /upload "${remote%/}/" --jobs "${CDN_UPLOAD_JOBS:-8}"
}

# ============================================================================
# 腾讯云 COS 上传
# ============================================================================

ensure_cos_image() {
    local image="$1"

    # 检查镜像是否存在
    if docker image inspect "$image" >/dev/null 2>&1; then
        log_info "COS 上传镜像已存在：$image"
        return 0
    fi

    local dockerfile="$PROJECT_ROOT/docker/cos-upload.Dockerfile"

    if [ "$DRY_RUN" -eq 1 ]; then
        log_warn "Dry-run：镜像 $image 不存在，实际运行时会根据 $dockerfile 构建"
        return 0
    fi

    if [ ! -f "$dockerfile" ]; then
        log_error "缺少 Dockerfile：$dockerfile"
        return 1
    fi

    log_info "未找到镜像 $image，开始构建..."
    docker build -f "$dockerfile" -t "$image" "$PROJECT_ROOT"
}

run_tencent_upload() {
    local bucket secret_id secret_key region image target cos_script

    # 仅使用 COS 专用的环境变量，不回退到 OSS 变量
    bucket="$(normalize_bucket "${COS_BUCKET:-}")"
    secret_id="${COS_SECRET_ID:-}"
    secret_key="${COS_SECRET_KEY:-}"

    # 检查必需配置
    if [ -z "$bucket" ]; then
        log_info "COS_BUCKET 未配置，跳过腾讯云上传"
        return 0
    fi

    if [ -z "$secret_id" ] || [ -z "$secret_key" ]; then
        log_warn "缺少 COS 认证信息（COS_SECRET_ID 或 COS_SECRET_KEY），跳过上传"
        return 0
    fi

    region="${COS_REGION:-ap-guangzhou}"
    image="${COS_IMAGE:-web-tem/coscmd:latest}"

    log_info "准备上传到腾讯云 COS："
    log_info "  Bucket: $bucket"
    log_info "  Region: $region"
    log_info "  远程路径: /${TARGET_PREFIX}"

    # 确保 COS 镜像存在
    ensure_cos_image "$image"

    # 创建临时上传脚本
    cos_script="$(mktemp)"
    TMP_FILES+=("$cos_script")

    cat <<'EOF' >"$cos_script"
#!/bin/sh
set -e

# 配置 coscmd
SCHEMA="${COSCMD_SCHEMA:-https}"
ARGS="-a $COSCMD_SECRET_ID -s $COSCMD_SECRET_KEY -b $COSCMD_BUCKET -r $COSCMD_REGION --schema $SCHEMA"

if [ -n "$COSCMD_SESSION_TOKEN" ]; then
    ARGS="$ARGS -t $COSCMD_SESSION_TOKEN"
fi

echo "[INFO] 配置 coscmd..."
coscmd config $ARGS >/tmp/coscmd-config.log 2>&1

echo "[INFO] 开始上传..."
coscmd upload -rs /upload "$COSCMD_TARGET" --delete

echo "[SUCCESS] 上传完成"
EOF

    chmod +x "$cos_script"

    target="/${TARGET_PREFIX}"
    target="${target%/}/"

    UPLOAD_ATTEMPTED=1

    # 执行上传
    run_docker_command docker run --rm \
        -v "${SOURCE_ABS}:/upload:ro" \
        -v "${cos_script}:/tmp/cos-upload.sh:ro" \
        -e COSCMD_SECRET_ID="$secret_id" \
        -e COSCMD_SECRET_KEY="$secret_key" \
        -e COSCMD_SESSION_TOKEN="${COS_SESSION_TOKEN:-}" \
        -e COSCMD_BUCKET="$bucket" \
        -e COSCMD_REGION="$region" \
        -e COSCMD_SCHEMA="${COS_SCHEME:-https}" \
        -e COSCMD_TARGET="$target" \
        "$image" \
        /bin/sh /tmp/cos-upload.sh
}

# ============================================================================
# 主流程
# ============================================================================

provider_status=0
provider_lower="$(echo "$PROVIDER" | tr '[:upper:]' '[:lower:]')"

case "$provider_lower" in
    aliyun|"")
        log_info "使用阿里云 OSS 上传"
        if ! run_aliyun_upload; then
            provider_status=$?
        fi
        ;;
    tencent)
        log_info "使用腾讯云 COS 上传"
        if ! run_tencent_upload; then
            provider_status=$?
        fi
        ;;
    *)
        log_error "不支持的 CDN_PROVIDER：$PROVIDER"
        exit 1
        ;;
esac

# ============================================================================
# 结果处理
# ============================================================================

if [ "$UPLOAD_ATTEMPTED" -eq 0 ]; then
    log_info "未满足上传条件，脚本结束"
    exit 0
fi

if [ "$DRY_RUN" -eq 1 ]; then
    log_success "Dry-run 完成，未执行实际上传"
    exit 0
fi

if [ "$provider_status" -ne 0 ]; then
    if [ "$SKIP_ON_ERROR" -eq 1 ]; then
        log_warn "上传失败但已根据 CDN_SKIP_ON_ERROR 忽略错误"
        exit 0
    fi
    log_error "CDN 上传失败"
    exit "$provider_status"
fi

log_success "CDN 上传完成"
exit 0
