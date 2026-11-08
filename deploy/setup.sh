#!/usr/bin/env bash
# TramTrack - cài đặt máy chủ Ubuntu 22.04/24.04 bằng một lệnh.
# Cách chạy:  bash setup.sh ten-mien-cua-ban.online
# Chạy lại nhiều lần vẫn an toàn (không ghi đè .env và cơ sở dữ liệu đã có).
set -euo pipefail

DOMAIN="${1:-}"
if [ -z "$DOMAIN" ]; then echo "Thiếu tên miền. Ví dụ: bash setup.sh tramtrack.online"; exit 1; fi
if [ "$(id -u)" != "0" ]; then echo "Hãy chạy bằng tài khoản root."; exit 1; fi

APP=/opt/tramtrack
export DEBIAN_FRONTEND=noninteractive

echo "== 0/7 Bộ nhớ đệm dự phòng 2 GB (nếu chưa có)"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "== 1/7 Cập nhật hệ thống và cài gói cần thiết"
apt-get update -y
apt-get install -y curl gnupg ca-certificates ufw openssl postgresql apt-transport-https debian-keyring debian-archive-keyring

echo "== 2/7 Cài Node.js 20"
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | sed 's/v//' | cut -d. -f1)" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "== 3/7 Cài Caddy (tự cấp HTTPS)"
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "== 4/7 Giải nén mã nguồn"
if [ ! -f /root/tramtrack.tgz ]; then echo "Không thấy /root/tramtrack.tgz - hãy tải tệp lên trước."; exit 1; fi
id tramtrack >/dev/null 2>&1 || useradd --system --home "$APP" --shell /usr/sbin/nologin tramtrack
mkdir -p "$APP"
tar -xzf /root/tramtrack.tgz -C "$APP" server web
rm -rf "$APP/web.old"

echo "== 5/7 Cơ sở dữ liệu và tệp cấu hình"
systemctl enable --now postgresql
if [ ! -f "$APP/server/.env" ]; then
  DBPASS="$(openssl rand -hex 24)"
  TOKEN="$(openssl rand -base64 48 | tr '+/' '-_' | tr -d '=\n')"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE ROLE tramtrack LOGIN PASSWORD '${DBPASS}';"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE tramtrack OWNER tramtrack;"
  umask 077
  cat > "$APP/server/.env" <<ENVEOF
DATABASE_URL=postgresql://tramtrack:${DBPASS}@127.0.0.1:5432/tramtrack
DATABASE_SSL=false
PORT=3000
PUBLIC_BASE_URL=https://${DOMAIN}
CORS_ORIGIN=https://${DOMAIN}
TOKEN_SECRET=${TOKEN}
TOKEN_HAN_GIO=12
ENVEOF
  echo "Đã tạo .env mới (không in ra màn hình)."
else
  echo ".env đã có, giữ nguyên."
fi
chown -R tramtrack:tramtrack "$APP"
chmod 600 "$APP/server/.env"

echo "== 6/7 Cài thư viện và dựng bảng dữ liệu"
cd "$APP/server"
sudo -u tramtrack npm ci --omit=dev
sudo -u tramtrack npm run migrate

cat > /etc/systemd/system/tramtrack.service <<SVC
[Unit]
Description=TramTrack API
After=network.target postgresql.service

[Service]
User=tramtrack
WorkingDirectory=${APP}/server
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=3
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SVC
systemctl daemon-reload
systemctl enable tramtrack
systemctl restart tramtrack

echo "== 7/7 HTTPS, tường lửa"
cat > /etc/caddy/Caddyfile <<CADDY
${DOMAIN} {
  encode gzip
  header {
    X-Content-Type-Options nosniff
    Referrer-Policy strict-origin-when-cross-origin
    -Server
  }
  handle /api/* {
    reverse_proxy 127.0.0.1:3000
  }
  handle {
    root * ${APP}/web
    try_files {path} /index.html
    file_server
  }
}
CADDY
systemctl enable caddy
systemctl reload caddy || systemctl restart caddy

ufw allow OpenSSH >/dev/null
ufw allow 80/tcp >/dev/null
ufw allow 443/tcp >/dev/null
ufw --force enable >/dev/null

sleep 3
echo
echo "================ KẾT QUẢ ================"
systemctl is-active tramtrack && echo "API: đang chạy"
curl -s http://127.0.0.1:3000/api/v1/health || true
echo
echo "Tiếp theo: mở https://${DOMAIN} trên điện thoại."
