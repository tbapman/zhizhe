#!/usr/bin/env bash
set -e

# ============================
# zhizhe (Next.js) 自动部署脚本
# ============================

APP_NAME="zhizhe"
REPO="git@github.com:tbapman/zhizhe.git"
APP_DIR="/home/codespace/$APP_NAME"
DOMAIN="zhizhe.pulchic.com"
PORT=3000

SSL_DIR="$APP_DIR/ssl"
WEBROOT="/var/www/acme-challenge"

NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
NGINX_ACME_CONF="/etc/nginx/conf.d/${APP_NAME}_acme.conf"

log() { echo -e "\033[1;32m[INFO]\033[0m $1"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }
err() { echo -e "\033[1;31m[ERROR]\033[0m $1" && exit 1; }


# ============================
# 准备环境
# ============================
prepare_env() {
  log "加载 Node 环境..."

  # 加载 NVM
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  # Node 版本
  if [ -f "$APP_DIR/.nvmrc" ]; then
    nvm use || nvm install
  else
    nvm use --lts || nvm install --lts
  fi

  # PNPM
  if ! command -v pnpm &>/dev/null; then
    log "安装 pnpm..."
    npm install -g pnpm
  fi

  # PM2
  if ! command -v pm2 &>/dev/null; then
    log "安装 PM2..."
    npm install -g pm2
  fi
}


# ============================
# 拉取 / 更新代码
# ============================
update_code() {
  local commit_hash="$1"

  if [ -d "$APP_DIR" ]; then
    cd "$APP_DIR"
    log "更新代码..."
    git fetch --all
    git reset --hard origin/main
  else
    log "克隆仓库..."
    git clone "$REPO" "$APP_DIR"
    cd "$APP_DIR"
  fi

  if [ -n "$commit_hash" ]; then
    git checkout "$commit_hash" || err "无法切换到 commit $commit_hash"
  fi
}


# ============================
# 申请 / 安装 SSL 证书
# ============================
setup_ssl() {
  log "准备 ACME 挑战目录..."
  sudo mkdir -p "$WEBROOT"
  sudo chown -R $USER:$USER "$WEBROOT"

  mkdir -p "$SSL_DIR"

  # 切回 Let's Encrypt
  log "设置默认 CA 为 Let's Encrypt..."
  acme.sh --set-default-ca --server letsencrypt

  log "创建临时 Nginx 配置用于 ACME 验证..."
  sudo tee "$NGINX_ACME_CONF" >/dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location /.well-known/acme-challenge/ {
        root $WEBROOT;
    }
}
EOF

  sudo nginx -t && sudo systemctl reload nginx

  log "申请 SSL 证书（Let's Encrypt）..."
  acme.sh --issue -d "$DOMAIN" -w "$WEBROOT" --force

  log "安装证书到 $SSL_DIR ..."
  acme.sh --install-cert -d "$DOMAIN" \
    --key-file "$SSL_DIR/$DOMAIN.key" \
    --fullchain-file "$SSL_DIR/$DOMAIN.pem" \
    --reloadcmd "systemctl reload nginx"

  log "SSL 证书安装完成！"
}


# ============================
# 构建 Next.js & PM2 启动
# ============================
build_and_start() {
  cd "$APP_DIR"

  log "安装依赖..."
  pnpm install --frozen-lockfile || {
    warn "lockfile 兼容问题，重新生成..."
    rm -f pnpm-lock.yaml
    pnpm install
  }

  log "构建 Next.js..."
  pnpm build

  mkdir -p "$APP_DIR/logs"

  log "启动 PM2..."
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  NODE_ENV=production PORT=$PORT pm2 start "pnpm" --name "$APP_NAME" -- start
  pm2 save
}


# ============================
# 配置 Nginx
# ============================
setup_nginx() {
  log "生成正式的 Nginx 配置..."

  sudo tee "$NGINX_CONF" >/dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    ssl_certificate $SSL_DIR/$DOMAIN.pem;
    ssl_certificate_key $SSL_DIR/$DOMAIN.key;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /health {
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

  # 删除临时 ACME 配置
  sudo rm -f "$NGINX_ACME_CONF"

  sudo nginx -t && sudo systemctl reload nginx
  log "Nginx 配置完成。"
}


# ============================
# 主流程
# ============================
main() {
  local commit=""
  if [ "$1" = "--commit" ]; then
    commit="$2"
  fi

  log "🚀 开始部署 zhizhe 应用..."

  update_code "$commit"
  prepare_env
  setup_ssl
  setup_nginx
  build_and_start

  log "====================================="
  log "✅ 部署完成！"
  log "访问地址: https://$DOMAIN"
  log "查看日志: pm2 logs $APP_NAME"
  log "====================================="
}

trap 'err "❌ 部署失败，请检查日志"' ERR
main "$@"
