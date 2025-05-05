#!/usr/bin/env bash
set -euo pipefail

# Enter workdir
cd /home/bun/app

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Trap signals for clean shutdown
trap 'kill $(jobs -p)' EXIT

# Start services with proper logging
log "Starting nginx frontend..."
nginx -g 'daemon off;' &

log "Starting bun backend..."
cd ./apps/server
bun run src/index.ts &

# Wait for all background processes
wait -n

# If any process exits, terminate all
log "A process has exited, shutting down..."
kill $(jobs -p) 2>/dev/null
exit 1