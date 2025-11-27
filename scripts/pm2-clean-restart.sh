#!/bin/bash
# Usage: sudo ./scripts/pm2-clean-restart.sh
set -e
APP_NAME="reviews-backend"
WORKDIR="/home/ubuntu/Reviews-Maker/server-new"
ECOSYSTEM="$WORKDIR/ecosystem.config.cjs"

# Stop and remove existing app
if pm2 list | grep -iq "$APP_NAME"; then
  echo "Stopping existing $APP_NAME..."
  pm2 stop "$APP_NAME" || true
  pm2 delete "$APP_NAME" || true
fi

# Optional: kill stray node processes on port 3000
STRAY_PIDS=$(ss -tulpn | grep ":3000" | awk '{print $6}' | awk -F"/" '{print $1}' | sort -u)
if [ -n "$STRAY_PIDS" ]; then
  echo "Found stray PIDs using :3000 -> $STRAY_PIDS"
  for pid in $STRAY_PIDS; do
    echo "Killing $pid"
    sudo kill -9 $pid || true
  done
fi

# Start app via ecosystem config (production) if found, otherwise use script
if [ -f "$ECOSYSTEM" ]; then
  echo "Starting $APP_NAME via $ECOSYSTEM (production)"
  cd $WORKDIR
  pm2 startOrRestart "$ECOSYSTEM" --env production
else
  echo "ecosystem not found -> starting direct script (single instance)"
  pm2 start $WORKDIR/server.js --name "$APP_NAME" -i 1 --update-env
fi

# Show status
pm2 list
ss -tulpn | grep :3000 || true

# Tail logs
pm2 logs "$APP_NAME" --lines 50
