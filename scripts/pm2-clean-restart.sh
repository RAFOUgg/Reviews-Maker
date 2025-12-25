#!/usr/bin/env bash
set -euo pipefail
APP_NAME="reviews-backend"
WORKDIR="/home/ubuntu/Reviews-Maker/server-new"
ECOSYSTEM="/home/ubuntu/Reviews-Maker/server-new/ecosystem.config.cjs"

echo "Running pm2-clean-restart.sh (non-sudo). This script expects pm2 in your PATH."
if ! command -v pm2 >/dev/null 2>&1; then
  echo "ERROR: pm2 CLI not found in PATH. Please install pm2 for this user or run without sudo (npm i -g pm2)."
  exit 1
fi

echo "Stopping existing PM2 app (if present): $APP_NAME"
pm2 stop "$APP_NAME" || true
pm2 delete "$APP_NAME" || true

# Kill stray processes using :3000 (safe, only PIDs not owned by pm2)
echo "Checking for processes listening on :3000"
STRAY_PIDS=$(ss -tulpn | grep ":3000" | awk '{print $6}' | awk -F"/" '{print $1}' | sort -u || true)
if [ -n "$STRAY_PIDS" ]; then
  echo "Found stray PIDs on port 3000: $STRAY_PIDS"
  for pid in $STRAY_PIDS; do
    echo "Killing PID $pid"
    sudo kill -9 $pid || true
  done
fi

echo "Starting app using ecosystem config (recommended)"
cd "$WORKDIR" || exit 1
if [ -f "$ECOSYSTEM" ]; then
  pm2 startOrReload "$ECOSYSTEM" --env production || pm2 start "$ECOSYSTEM" --env production
else
  echo "ecosystem config not found; starting single instance for debugging"
  pm2 start ./server.js --name "$APP_NAME" -i 1 --update-env
fi

echo "PM2 list after start:"
pm2 list
echo "Listening sockets on :3000"
ss -tulpn | grep :3000 || true
echo "Tailing pm2 logs:"
pm2 logs "$APP_NAME" --lines 50
