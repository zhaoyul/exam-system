#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# exam-system 部署脚本
# 构建 uberjar（含前端 SPA）→ 上传至服务器 → 切换版本 → 重启
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
APP_DIR="$PROJECT_DIR/app"

# 服务器配置（可被环境变量覆盖）
SSH_HOST="${DEPLOY_SSH_HOST:-gpu}"
DEPLOY_DIR="${DEPLOY_DIR:-/mnt/exam-system}"
RELEASES_DIR="$DEPLOY_DIR/releases"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
JAR_NAME="exam-system-backend-${TIMESTAMP}.jar"
LOCAL_JAR="$BACKEND_DIR/target/exam-system-backend-standalone.jar"

# JVM 路径（服务器上的 Java 21）
REMOTE_JAVA="${REMOTE_JAVA:-/usr/lib/jvm/java-21-openjdk-amd64/bin/java}"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

# ============================================================
# 步骤 1：构建
# ============================================================
build() {
  info "===== 步骤 1/4：构建 uberjar ====="

  if [ ! -d "$APP_DIR" ]; then
    error "前端目录不存在: $APP_DIR"
    exit 1
  fi
  if [ ! -d "$BACKEND_DIR" ]; then
    error "后端目录不存在: $BACKEND_DIR"
    exit 1
  fi

  info "构建前端 ($APP_DIR)..."
  cd "$APP_DIR"
  npm install --silent 2>&1 | tail -1
  npm run build 2>&1 | tail -5
  info "前端构建完成"

  info "构建 Clojure uberjar..."
  cd "$BACKEND_DIR"
  clj -T:build all 2>&1 | tail -5
  info "uberjar 构建完成: $(ls -lh "$LOCAL_JAR" | awk '{print $5}')"

  cd "$PROJECT_DIR"
}

# ============================================================
# 步骤 2：上传
# ============================================================
upload() {
  info "===== 步骤 2/4：上传 JAR 至服务器 ====="

  if [ ! -f "$LOCAL_JAR" ]; then
    error "本地 JAR 不存在，请先执行 build: $LOCAL_JAR"
    exit 1
  fi

  info "上传至 $SSH_HOST:$RELEASES_DIR/$JAR_NAME ..."
  scp -q -o ConnectTimeout=10 "$LOCAL_JAR" "$SSH_HOST:$RELEASES_DIR/$JAR_NAME"
  info "上传完成"
}

# ============================================================
# 步骤 3：切换版本
# ============================================================
switch_version() {
  info "===== 步骤 3/4：切换版本 ====="

  ssh -o ConnectTimeout=5 "$SSH_HOST" bash -s -- "$DEPLOY_DIR" "$JAR_NAME" <<'SSH_SWITCH'
DEPLOY_DIR="$1"
JAR_NAME="$2"
RELEASES_DIR="$DEPLOY_DIR/releases"

if [ ! -f "$RELEASES_DIR/$JAR_NAME" ]; then
  echo "[ERROR] 远程 JAR 文件不存在: $RELEASES_DIR/$JAR_NAME"
  exit 1
fi

# 原子操作：创建临时链接再 mv 覆盖
ln -sf "releases/$JAR_NAME" "$DEPLOY_DIR/app.jar.tmp"
mv -f "$DEPLOY_DIR/app.jar.tmp" "$DEPLOY_DIR/app.jar"
echo "[INFO] 软链接已更新: app.jar -> releases/$JAR_NAME"
SSH_SWITCH

  info "版本切换完成"
}

# ============================================================
# 步骤 4：重启服务
# ============================================================
restart() {
  info "===== 步骤 4/4：重启服务 ====="

  ssh -o ConnectTimeout=5 "$SSH_HOST" bash -s -- "$REMOTE_JAVA" <<'SSH_RESTART'
REMOTE_JAVA="$1"

echo "[INFO] 重启 exam-system.service ..."
systemctl restart exam-system.service

# 等待启动
for i in $(seq 1 12); do
  sleep 2
  STATUS="$(systemctl is-active exam-system.service 2>/dev/null || echo 'inactive')"
  if [ "$STATUS" = "active" ]; then
    echo "[INFO] 服务启动成功（第 ${i} 次检查）"
    break
  fi
  if [ "$i" -eq 12 ]; then
    echo "[ERROR] 服务启动超时"
    systemctl status exam-system.service --no-pager | tail -10
    exit 1
  fi
done

# 验证前端
sleep 2
HEALTH=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:29527/ 2>/dev/null || true)
HEALTH="${HEALTH:-000}"
if [ "$HEALTH" = "200" ]; then
  echo "[INFO] 前端页面 200 OK"
else
  echo "[WARN] 前端页面响应码: $HEALTH"
fi

# 验证 API
API_CHECK=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:29527/api/question/subject-sort 2>/dev/null || true)
API_CHECK="${API_CHECK:-000}"
if [ "$API_CHECK" = "200" ]; then
  echo "[INFO] API 接口 200 OK"
else
  echo "[WARN] API 接口响应码: $API_CHECK"
fi
SSH_RESTART

  info "重启完成"
}

# ============================================================
# 快捷命令
# ============================================================
rollback() {
  info "===== 回滚到上一版本 ====="

  local prev_jar
  prev_jar=$(ssh -o ConnectTimeout=5 "$SSH_HOST" "ls -t $RELEASES_DIR/*.jar 2>/dev/null | sed -n '2p'")

  if [ -z "$prev_jar" ]; then
    error "没有可回滚的版本"
    exit 1
  fi

  local prev_name
  prev_name=$(basename "$prev_jar")
  info "回滚至: $prev_name"

  ssh -o ConnectTimeout=5 "$SSH_HOST" bash -s -- "$DEPLOY_DIR" "$prev_name" <<'SSH_ROLLBACK'
DEPLOY_DIR="$1"
PREV_NAME="$2"
ln -sf "releases/$PREV_NAME" "$DEPLOY_DIR/app.jar.tmp"
mv -f "$DEPLOY_DIR/app.jar.tmp" "$DEPLOY_DIR/app.jar"
systemctl restart exam-system.service
echo "[INFO] 已回滚至: $PREV_NAME"
SSH_ROLLBACK

  info "回滚完成"
}

list_versions() {
  info "===== 服务器上的版本列表 ====="
  ssh -o ConnectTimeout=5 "$SSH_HOST" bash -s -- "$DEPLOY_DIR" <<'SSH_LIST'
DEPLOY_DIR="$1"
echo "当前: $(readlink "$DEPLOY_DIR/app.jar")"
echo "---"
ls -lh "$DEPLOY_DIR"/releases/*.jar 2>/dev/null | awk '{print $NF, "(" $5 ")"}'
SSH_LIST
}

# ============================================================
# 主入口
# ============================================================
usage() {
  cat <<EOF
用法: $0 <command>

命令:
  deploy    完整部署：构建 -> 上传 -> 切换版本 -> 重启
  build     仅构建 uberjar（含前端 SPA）
  upload    仅上传 JAR 至服务器
  switch    仅切换软链接到最新版本
  restart   仅重启服务
  rollback  回滚到上一版本
  versions  查看服务器上的版本列表
EOF
}

case "${1:-deploy}" in
  deploy)
    build
    upload
    switch_version
    restart
    info "===== 部署完成 ====="
    list_versions
    ;;
  build)      build ;;
  upload)     upload ;;
  switch)     switch_version ;;
  restart)    restart ;;
  rollback)   rollback ;;
  versions)   list_versions ;;
  *)          usage ;;
esac
