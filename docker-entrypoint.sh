#!/bin/sh
set -e

# Ensure persistent directories exist
mkdir -p /app/client /app/media /app/data /app/data/backups /app/data/branding

# Download client bundle if not already present
if [ ! -f "/app/client/build.json" ]; then
    echo "[xitter] Client build not found. Downloading client bundle..."
    bun scripts/fetch-client.ts
fi

echo "[xitter] Starting application..."
exec "$@"
