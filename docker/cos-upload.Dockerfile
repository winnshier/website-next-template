FROM python:3.11-alpine

LABEL maintainer="web-tem deploy" \
      description="Minimal coscmd runtime for Tencent COS CDN uploads"

# 安装 coscmd（腾讯云对象存储命令行工具）
# 固定版本以确保可重复构建
RUN pip install --no-cache-dir coscmd==1.8.6

WORKDIR /workspace

# 由调用者提供命令（例如 /bin/sh /tmp/cos-upload.sh）
#
# 预构建镜像（可选，避免部署时构建）：
#   docker build -f docker/cos-upload.Dockerfile -t web-tem/coscmd:latest .
#
# 使用预构建镜像：
#   export COS_IMAGE=web-tem/coscmd:latest
#   ./scripts/upload-static.sh --provider tencent
ENTRYPOINT []
CMD ["coscmd", "--help"]
