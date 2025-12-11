#!/bin/bash
# Frontend Build & Deploy Script for PM2

set -e

PROJECT_ROOT="/home/ubuntu/Reviews-Maker"
CLIENT_DIR="$PROJECT_ROOT/client"
DIST_DIR="$CLIENT_DIR/dist"
NGINX_DIR="/var/www/reviews-maker/client/dist"

echo "[$(date)] Starting frontend build and deploy..."

# Change to client directory
cd "$CLIENT_DIR"

# Install dependencies if needed
echo "[$(date)] Installing dependencies..."
npm install --prefer-offline --no-audit

# Build the frontend
echo "[$(date)] Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "$DIST_DIR" ]; then
    echo "[$(date)] ERROR: Build failed - dist directory not found"
    exit 1
fi

# Copy built files to nginx directory
echo "[$(date)] Deploying to nginx..."
sudo rm -rf "$NGINX_DIR"
sudo cp -r "$DIST_DIR" "$NGINX_DIR"

# Fix permissions
echo "[$(date)] Fixing permissions..."
sudo chown -R www-data:www-data "$NGINX_DIR"

# Reload nginx
echo "[$(date)] Reloading nginx..."
sudo systemctl reload nginx

echo "[$(date)] Frontend build and deploy completed successfully!"
