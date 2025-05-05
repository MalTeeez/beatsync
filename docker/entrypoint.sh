#!/usr/bin/env bash
set -euo pipefail

# Enter workdir
cd /home/bun/app

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

export NEXT_PUBLIC_API_URL=$BASE_URL_API
# Use wss for https, ws for http
NEXT_PUBLIC_WS_URL=$(sed -r "s|https|wss|" <<< "$BASE_URL_API/ws")
export NEXT_PUBLIC_WS_URL=$(sed -r "s|http|ws|" <<< $NEXT_PUBLIC_WS_URL)

# Export BASE_PATH_WEB to nextjs clientside
export NEXT_PUBLIC_BASE_PATH=$BASE_PATH_WEB

# Extract base path & remove trailing slash
API_PATH=$(sed -E 's~^[^/]+//[^/]+(/[^/?#][^?#]*)?.*~\1~' <<< $BASE_URL_API)
export API_PATH=$(sed -e 's~/$~~' <<< $API_PATH)

# Set ports
# sed -i 's|port: 8080|port: ${PORT_API}|' ./apps/server/src/index.ts
# sed -i 's|"dev": "next dev"|"dev": "next dev -p ${PORT_WEB}"|' ./apps/client/package.json

# Insert variables into nginx config
sed -i "s|\[PORT_WEB\]|$PORT_WEB|g" /etc/nginx/conf.d/beatsync.conf.template
sed -i "s|\[BASE_PATH_WEB\]|$BASE_PATH_WEB|g" /etc/nginx/conf.d/beatsync.conf.template
mv /etc/nginx/conf.d/beatsync.conf.template /etc/nginx/conf.d/beatsync.conf

# Build nextjs static app
cd apps/client/ && bun run next build
mv out/* /usr/share/nginx/html/

# Execute docker CMD
exec "$@"