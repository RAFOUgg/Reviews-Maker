#!/usr/bin/env bash
# Simple backup script for reviews-maker sqlite DB and review_images
# Usage: ./scripts/db-backup.sh [backup-dir]
set -euo pipefail

BACKUP_DIR=${1:-/home/ubuntu/Reviews-Maker/db/backups}
SRC_DB_DIR=/home/ubuntu/Reviews-Maker/db
REVIEW_IMAGES_DIR=/home/ubuntu/Reviews-Maker/db/review_images
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')

mkdir -p "$BACKUP_DIR"

# Create a tarball with DB and review_images
BACKUP_FILE="$BACKUP_DIR/reviews-backup-${TIMESTAMP}.tar.gz"

echo "Creating backup: $BACKUP_FILE"
sudo tar -czf "$BACKUP_FILE" -C "$SRC_DB_DIR" reviews.sqlite || true
# Try to include review_images if it exists
if [ -d "$REVIEW_IMAGES_DIR" ]; then
  sudo tar -rzf "$BACKUP_FILE" -C "$REVIEW_IMAGES_DIR" . || true
fi

# Cleanup old backups (keep 7)
echo "Cleaning old backups (keep last 7)"
ls -1t "$BACKUP_DIR" | tail -n +8 | xargs -r -I {} rm -f "$BACKUP_DIR/{}"

echo "Backup created: $BACKUP_FILE"

# Ensure permissions
sudo chown ubuntu:ubuntu "$BACKUP_FILE" || true
sudo chmod 640 "$BACKUP_FILE" || true

# Print summary
echo "Backup size: $(du -h "$BACKUP_FILE" | cut -f1)"
