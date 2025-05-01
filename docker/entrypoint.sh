#!/usr/bin/sh

cd /home/bun/app

# Set API and WebSocket URLs only if they aren't already set
if [ ! -z "$BASE_URL" ]; then
    export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"http://${BASE_URL}:${API_PORT}"}
    export NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL:-"ws://${BASE_URL}:${API_PORT}/ws"}
    echo "Using API URL: ${NEXT_PUBLIC_API_URL}"
    echo "Using WebSocket URL: ${NEXT_PUBLIC_WS_URL}"
else
    # Set some default values at least
    export NEXT_PUBLIC_API_URL="http://localhost:${API_PORT}"
    export NEXT_PUBLIC_WS_URL="ws://localhost:${API_PORT}/ws"
fi

# Set ports
sed -i 's|port: 8080|port: ${API_PORT}|' ./apps/server/src/index.ts
sed -i 's|"dev": "next dev"|"dev": "next dev -p ${WEB_PORT}"|' ./apps/client/package.json

# Run bun (should work with builds too)
bun dev