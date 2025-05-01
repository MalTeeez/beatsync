#!/usr/bin/sh

cd /home/bun/app

echo "Running with api url ${NEXT_PUBLIC_API_URL}"

# Set ports
sed -i 's|port: 8080|port: ${API_PORT}|' ./apps/server/src/index.ts
sed -i 's|"dev": "next dev"|"dev": "next dev -p ${WEB_PORT}"|' ./apps/client/package.json

# Run bun (should work with builds too)
bun dev