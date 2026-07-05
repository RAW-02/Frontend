#!/bin/bash
set -e

# ── Update system ──────────────────────────────────────────────
yum update -y
yum install -y nginx

# ── Create web root ────────────────────────────────────────────
mkdir -p /var/www/frontend
chown -R nginx:nginx /var/www/frontend
chmod -R 755 /var/www/frontend

# ── Nginx main config ──────────────────────────────────────────
cat > /etc/nginx/conf.d/frontend.conf << 'NGINXCONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/frontend;
    index index.html;

    # Security headers
    add_header X-Frame-Options         "SAMEORIGIN"                      always;
    add_header X-Content-Type-Options  "nosniff"                         always;
    add_header X-XSS-Protection        "1; mode=block"                   always;
    add_header Referrer-Policy         "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy      "geolocation=(), microphone=()"   always;

    # Backend proxy routes — written by GitHub Actions on each deploy
    # Backend IP stored in GitHub Secret — never visible in browser
    include /etc/nginx/conf.d/proxy.conf;

    # SPA routing — all unknown routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Block hidden files — never expose .env or .git
    location ~ /\. {
        deny all;
        return 404;
    }

    error_page 404 /index.html;
}
NGINXCONF

# ── Empty proxy config — GitHub Actions fills this on first deploy ──
cat > /etc/nginx/conf.d/proxy.conf << 'PROXYCONF'
# Backend proxy routes
# This file is overwritten by GitHub Actions on every deploy
# Backend IP comes from GitHub Secret — never stored in this file permanently
PROXYCONF

# Remove default nginx page
rm -f /etc/nginx/conf.d/default.conf

# ── Placeholder page until first GitHub Actions deploy ─────────
cat > /var/www/frontend/index.html << 'HTML'
<!DOCTYPE html>
<html>
<head>
  <title>UniVulner</title>
  <style>
    body {
      background: #07111f;
      color: #94a3b8;
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
    }
    h1 { color: #06b6d4; }
  </style>
</head>
<body>
  <div style="text-align:center">
    <h1>UniVulner</h1>
    <p>Deployment in progress...</p>
  </div>
</body>
</html>
HTML

chown nginx:nginx /var/www/frontend/index.html

# ── Start nginx ────────────────────────────────────────────────
nginx -t
systemctl enable nginx
systemctl start nginx

echo "Bootstrap complete"