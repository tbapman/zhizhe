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

NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"

log() { echo -e "\033[1;32m[INFO]\033[0m $1"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $1"; }
err() { echo -e "\033[1;31m[ERROR]\033[0m $1" && exit 1; }


# ============================
# 准备环境
# ============================
prepare_env() {
  log "加载 Node 环境..."

  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

  if [ -f "$APP_DIR/.nvmrc" ]; then
    nvm use || nvm install
  else
    nvm use --lts || nvm install --lts
  fi

  if ! command -v pnpm &>/dev/null; then
    log "安装 pnpm..."
    npm install -g pnpm
  fi

  if ! command -v pm2 &>/dev/null; then
    log "安装 PM2..."
    npm install -g pm2
  fi
}


# ============================
# 拉取 / 更新代码
# ============================
update_code() {
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
}


# ============================
# 申请 / 安装 SSL 证书（DNS 验证）
# ============================
setup_ssl() {
  log "使用阿里云 DNS 验证申请 SSL 证书..."

  mkdir -p "$SSL_DIR"

  acme.sh --set-default-ca --server letsencrypt

  if [ -z "$Ali_Key" ] || [ -z "$Ali_Secret" ]; then
    err "Ali_Key / Ali_Secret 环境变量未设置"
  fi

  export Ali_Key
  export Ali_Secret

  log "申请 SSL 证书（dns_ali）..."
  acme.sh --issue \
    --dns dns_ali \
    -d "$DOMAIN" \
    --force

  log "安装证书到 $SSL_DIR ..."
  acme.sh --install-cert -d "$DOMAIN" \
    --key-file "$SSL_DIR/$DOMAIN.key" \
    --fullchain-file "$SSL_DIR/$DOMAIN.pem" \
    --reloadcmd "systemctl reload nginx"

  log "SSL 证书安装完成！"
}


# ============================
# 构建 Next.js & PM2
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
# 配置 Nginx（最终正式配置）
# ============================
setup_nginx() {
  log "生成 Nginx 配置..."

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
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }

    location /health {
        return 200 "healthy\n";
    }
}
EOF

  sudo nginx -t && sudo systemctl reload nginx
  log "Nginx 配置完成。"
}


# ============================
# 主流程
# ============================
main() {
  log "🚀 开始部署 zhizhe 应用..."

  update_code
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
