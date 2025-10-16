#!/usr/bin/env bash
set -e

# --------------------------
# 智者 (zhizhe) 部署脚本
# --------------------------
# 用法:
#   ./deploy-prod.sh                    # 部署最新版本
#   ./deploy-prod.sh --commit abc123    # 部署指定commit
#   ./deploy-prod.sh --help             # 显示帮助信息
# --------------------------

APP_NAME="zhizhe"
REPO="git@github.com:tbapman/zhizhe.git"
APP_DIR="/home/codespace/$APP_NAME"
DOMAIN="zhizhe.pulchic.com"
SSL_CRT="/home/codespace/zhizhe/ssl/$DOMAIN.pem"
SSL_KEY="/home/codespace/zhizhe/ssl/$DOMAIN.key"
BUILD_DIR="$APP_DIR/.next"
NGINX_ROOT="/var/www/$APP_NAME"
NEXT_PORT=3000

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${GREEN}智者 (zhizhe) 部署脚本${NC}"
    echo ""
    echo -e "${YELLOW}用法:${NC}"
    echo "  $0 [选项]"
    echo ""
    echo -e "${YELLOW}选项:${NC}"
    echo "  --commit COMMIT_HASH    部署指定的commit版本"
    echo "  --help                  显示帮助信息"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  $0                      # 部署最新版本"
    echo "  $0 --commit abc123      # 部署commit为abc123的版本"
    echo "  $0 --help               # 显示此帮助信息"
    echo ""
    echo -e "${YELLOW}环境要求:${NC}"
    echo "  - Node.js (支持nvm管理)"
    echo "  - pnpm包管理器"
    echo "  - PM2进程管理器"
    echo "  - Nginx服务器"
    echo "  - SSL证书文件"
    echo ""
    echo -e "${YELLOW}部署流程:${NC}"
    echo "  1. 检查部署要求"
    echo "  2. 备份当前版本"
    echo "  3. 更新代码"
    echo "  4. 安装依赖并构建"
    echo "  5. 复制SSL证书"
    echo "  6. 设置Next.js生产环境"
    echo "  7. 生成Nginx配置"
    echo "  8. 重载Nginx"
    echo "  9. 健康检查"
    echo "  10. 清理旧版本"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要的文件和目录
check_requirements() {
    log_info "检查部署要求..."

    # 检查SSL证书
    if [ ! -f "$SSL_CRT" ]; then
        log_error "SSL证书文件不存在: $SSL_CRT"
        exit 1
    fi

    if [ ! -f "$SSL_KEY" ]; then
        log_error "SSL密钥文件不存在: $SSL_KEY"
        exit 1
    fi

    # 检查pnpm
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm未安装，请先安装pnpm"
        exit 1
    fi

    # 检查Node.js版本
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi

    NODE_VERSION=$(node --version)
    log_info "Node.js版本: $NODE_VERSION"

    log_info "所有要求检查通过"
}

# 备份现有版本
backup_current_version() {
    if [ -d "$APP_DIR" ]; then
        BACKUP_DIR="${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        log_info "备份当前版本到: $BACKUP_DIR"
        cp -r "$APP_DIR" "$BACKUP_DIR"
    fi
}

# 拉取或更新代码
update_code() {
    log_info "更新代码..."

    if [ -d "$APP_DIR" ]; then
        cd "$APP_DIR"
        log_info "拉取最新代码..."
        git fetch --all
        git reset --hard origin/main
        git clean -fd
    else
        log_info "克隆代码库..."
        git clone "$REPO" "$APP_DIR"
        cd "$APP_DIR"
    fi

    # 如果有指定commit hash，则checkout到指定版本
    if [ -n "$commit_hash" ]; then
        log_info "切换到指定commit: $commit_hash"
        git checkout "$commit_hash" || {
            log_error "无法切换到commit $commit_hash"
            exit 1
        }
    fi
}

# 安装依赖并构建
build_application() {
    log_info "设置Node.js环境..."

    # 加载 nvm 和 Node.js 环境
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # 使用项目指定的 Node.js 版本（如果有 .nvmrc）
    if [ -f ".nvmrc" ]; then
        log_info "使用.nvmrc指定的Node.js版本"
        nvm use
    else
        log_info "使用LTS版本的Node.js"
        nvm use --lts  # 或者指定具体版本，如：nvm use 18
    fi

    # 检查 pnpm 是否安装，如果没有则安装
    if ! command -v pnpm &> /dev/null; then
        log_warn "pnpm未安装，正在安装..."
        npm install -g pnpm
    fi

    log_info "安装依赖..."
    pnpm install --frozen-lockfile

    log_info "构建应用..."
    pnpm build

    if [ $? -ne 0 ]; then
        log_error "构建失败"
        exit 1
    fi

    log_info "构建完成"
}

# 复制SSL证书到部署目录
copy_ssl_certificates() {
    log_info "复制SSL证书..."

    SSL_DIR="$APP_DIR/ssl"
    mkdir -p "$SSL_DIR"

    cp "$SSL_CRT" "$SSL_DIR/"
    cp "$SSL_KEY" "$SSL_DIR/"

    chmod 600 "$SSL_DIR/$DOMAIN.key"
    chmod 644 "$SSL_DIR/$DOMAIN.pem"

    log_info "SSL证书复制完成"
}

# 设置Next.js生产环境
setup_nextjs_production() {
    log_info "设置Next.js生产环境..."

    # 创建PM2配置文件
    PM2_CONFIG="$APP_DIR/ecosystem.config.js"

    cat > "$PM2_CONFIG" <<EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'pnpm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $NEXT_PORT
    },
    error_file: '$APP_DIR/logs/err.log',
    out_file: '$APP_DIR/logs/out.log',
    log_file: '$APP_DIR/logs/combined.log',
    time: true
  }]
};
EOF

    # 创建日志目录
    mkdir -p "$APP_DIR/logs"

    # 检查PM2是否安装
    if ! command -v pm2 &> /dev/null; then
        log_warn "PM2未安装，正在安装..."
        npm install -g pm2
    fi

    # 停止现有进程
    pm2 stop "$APP_NAME" || true
    pm2 delete "$APP_NAME" || true

    # 启动应用
    cd "$APP_DIR"
    pm2 start ecosystem.config.js
    pm2 save

    log_info "Next.js生产环境设置完成"
}

# 生成Nginx配置
generate_nginx_config() {
    log_info "生成Nginx配置..."

    NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"

    sudo tee "$NGINX_CONF" > /dev/null <<EOF
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTPS主配置
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL配置
    ssl_certificate $APP_DIR/ssl/$DOMAIN.pem;
    ssl_certificate_key $APP_DIR/ssl/$DOMAIN.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:1m;
    ssl_session_timeout 5m;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 客户端上传限制
    client_max_body_size 10M;

    # Next.js应用代理
    location / {
        proxy_pass http://127.0.0.1:$NEXT_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 静态资源缓存
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp|avif)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;

        proxy_pass http://127.0.0.1:$NEXT_PORT;
        proxy_set_header Host \$host;
    }

    # API代理（如果Next.js中有API路由）
    location /api/ {
        proxy_pass http://127.0.0.1:$NEXT_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # API超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    log_info "Nginx配置生成完成"
}

# 测试并重载Nginx
reload_nginx() {
    log_info "测试Nginx配置..."
    sudo nginx -t

    log_info "重载Nginx..."
    sudo systemctl reload nginx

    log_info "Nginx重载完成"
}

# 健康检查
health_check() {
    log_info "进行健康检查..."

    # 等待应用启动
    sleep 10

    # 检查应用状态
    if pm2 status "$APP_NAME" | grep -q "online"; then
        log_info "应用运行正常"
    else
        log_error "应用运行异常"
        pm2 logs "$APP_NAME" --lines 50
        exit 1
    fi

    # 检查HTTP响应
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$NEXT_PORT/health || echo "000")
    if [ "$HTTP_STATUS" = "200" ]; then
        log_info "HTTP健康检查通过"
    else
        log_error "HTTP健康检查失败，状态码: $HTTP_STATUS"
        exit 1
    fi

    # 检查HTTPS响应
    HTTPS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --insecure https://$DOMAIN/ || echo "000")
    if [ "$HTTPS_STATUS" = "200" ] || [ "$HTTPS_STATUS" = "308" ]; then
        log_info "HTTPS访问测试通过，状态码: $HTTPS_STATUS"
    else
        log_warn "HTTPS访问测试异常，状态码: $HTTPS_STATUS"
    fi
}

# 清理旧版本
cleanup_old_versions() {
    log_info "清理旧版本..."

    # 保留最近3个备份
    cd /home/codespace
    ls -dt ${APP_NAME}_backup_* | tail -n +4 | xargs rm -rf 2>/dev/null || true

    log_info "旧版本清理完成"
}

# 主部署流程
main() {
    # 解析命令行参数
    commit_hash=""
    while [[ $# -gt 0 ]]; do
        case $1 in
            --commit)
                commit_hash="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_warn "未知参数: $1"
                shift
                ;;
        esac
    done

    if [ -n "$commit_hash" ]; then
        log_info "指定部署commit: $commit_hash"
    fi

    log_info "开始部署智者应用..."

    check_requirements
    backup_current_version
    update_code
    build_application
    copy_ssl_certificates
    setup_nextjs_production
    generate_nginx_config
    reload_nginx
    health_check
    cleanup_old_versions

    log_info "✅ 部署完成！"
    log_info "应用地址: https://$DOMAIN"
    log_info "管理命令:"
    log_info "  - 查看状态: pm2 status $APP_NAME"
    log_info "  - 查看日志: pm2 logs $APP_NAME"
    log_info "  - 重启应用: pm2 restart $APP_NAME"
    log_info "  - 停止应用: pm2 stop $APP_NAME"
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 运行主函数
main "$@"