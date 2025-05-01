#!/usr/bin/env bash

cd /home/bun/app


export NEXT_PUBLIC_API_URL=$BASE_URL_API
# Replace http(s) with ws
export NEXT_PUBLIC_WS_URL=$(sed -r "s|https?|ws|" <<< "$BASE_URL_API/ws")

# Extract base path & remove trailing slash
API_PATH=$(sed -E 's~^[^/]+//[^/]+(/[^/?#][^?#]*)?.*~\1~' <<< $BASE_URL_API)
export API_PATH=$(sed -e 's~/$~~' <<< $API_PATH)

# Set ports
# sed -i 's|port: 8080|port: ${PORT_API}|' ./apps/server/src/index.ts
# sed -i 's|"dev": "next dev"|"dev": "next dev -p ${PORT_WEB}"|' ./apps/client/package.json

# Run bun (should work with builds too)
bun run dev