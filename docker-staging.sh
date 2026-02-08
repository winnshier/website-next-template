#!/bin/bash
# 快捷脚本 - 调用 scripts/docker-staging.sh
exec "$(dirname "$0")/scripts/docker-staging.sh" "$@"
