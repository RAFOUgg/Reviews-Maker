#!/usr/bin/env bash
# Restore a backup created by db-backup.sh
# Usage: ./scripts/db-restore.sh /path/to/backup.tar.gz
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 /path/to/backup.tar.gz"
  exit 1
fi

BACKUP_FILE="$1"
SRC_DB_DIR=/home/ubuntu/Reviews-Maker/db
REVIEW_IMAGES_DIR=/home/ubuntu/Reviews-Maker/db/review_images

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Stop PM2 or app to avoid writing to DB during restore
echo "Stopping pm2 app reviews-backend"
pm2 stop reviews-backend || true

# Extract DB
sudo tar -xzf "$BACKUP_FILE" -C "$SRC_DB_DIR" reviews.sqlite || true
# Extract review_images
if tar -tzf "$BACKUP_FILE" | grep -q '^./' || true; then
  sudo tar -xzf "$BACKUP_FILE" -C "$REVIEW_IMAGES_DIR" || true
fi

# Update ownership
sudo chown -R ubuntu:ubuntu "$SRC_DB_DIR" "$REVIEW_IMAGES_DIR" || true

# Start PM2 again
pm2 start reviews-backend || true

echo "Restore complete."
