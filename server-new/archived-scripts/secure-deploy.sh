#!/usr/bin/env bash
# Archived: secure-deploy.sh
# Moved to archived-scripts during cleanup. Original located in `scripts/`.

set -euo pipefail

ENV_FILE="$(pwd)/.env"
BACKUP_FILE="${ENV_FILE}.bak.$(date +%F_%H%M%S)"

if [ ! -f "${ENV_FILE}" ]; then
  echo "Error: .env not found in $(pwd). Run this script from server-new/"
  exit 1
fi

echo "(ARCHIVE) Backing up ${ENV_FILE} to ${BACKUP_FILE}"
cp "$ENV_FILE" "$BACKUP_FILE"
chmod 600 "$BACKUP_FILE"

echo "(ARCHIVE) This script has been archived. See archived-scripts/ for contents."
