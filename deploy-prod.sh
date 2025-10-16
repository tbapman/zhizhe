#!/usr/bin/env bash
set -e

# --------------------------
# vcc-frontend 部署脚本
# --------------------------

APP_NAME="vcc-frontend"
REPO="git@github.com:tbapman/vcc-frontend.git"
APP_DIR="/home/codespace/$APP_NAME"
DOMAIN="www.shimaipay.com"
SSL_CRT="$APP_DIR/ssl/$DOMAIN.pem"
SSL_KEY="$APP_DIR/ssl/$DOMAIN.key"
BUILD_DIR="$APP_DIR/dist"
NGINX_ROOT="/var/www/$APP_NAME"

# 加载 nvm
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 拉取或更新代码
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git fetch --all
  git reset --hard origin/main
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# 安装依赖 & 构建（生产环境）
pnpm install
pnpm run build:prod

# 拷贝到 Nginx
sudo mkdir -p "$NGINX_ROOT"
sudo cp -r "$BUILD_DIR"/* "$NGINX_ROOT"

# 生成 Nginx 配置
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
sudo tee "$NGINX_CONF" > /dev/null <<'EOF'
server {
    listen 80;
    server_name www.shimaipay.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.shimaipay.com;

    ssl_certificate /home/codespace/vcc-frontend/ssl/www.shimaipay.com.pem;
    ssl_certificate_key /home/codespace/vcc-frontend/ssl/www.shimaipay.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/vcc-frontend;
    index index.html;

    # SPA 前端路由
    location / {
        try_files $uri /index.html;
    }

    # 静态资源缓存
    location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg)$ {
        expires 30d;
        access_log off;
        add_header Cache-Control "public";
    }

    # API 代理
    location /api/ {
        proxy_pass http://38.181.25.100:8900/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 资源文件代理
    location ^~ /resources/ {
        rewrite ^/resources/(.*)$ /$1 break;
        proxy_pass https://shimaipay.oss-cn-shenzhen.aliyuncs.com;
        proxy_set_header Host shimaipay.oss-cn-shenzhen.aliyuncs.com;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        access_log /var/log/nginx/resources-vcc-frontend.log;
    }
}
EOF

# 测试并重载 Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ ${APP_NAME} 部署完成，域名: ${DOMAIN}"