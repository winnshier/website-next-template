FROM alpine:3.19

LABEL maintainer="web-tem deploy" \
      description="Minimal ossutil runtime for Alibaba Cloud OSS CDN uploads"

# 安装 ossutil（阿里云对象存储命令行工具）
# 使用官方下载地址
RUN apk add --no-cache wget ca-certificates && \
    wget -O /usr/local/bin/ossutil64 https://gosspublic.alicdn.com/ossutil/1.7.18/ossutil64 && \
    chmod +x /usr/local/bin/ossutil64 && \
    apk del wget

WORKDIR /workspace

# 由调用者提供命令
ENTRYPOINT []
CMD ["ossutil64", "--help"]
