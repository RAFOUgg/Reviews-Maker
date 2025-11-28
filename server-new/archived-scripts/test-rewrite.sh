#!/usr/bin/env bash
# Archived: test-rewrite.sh
# Moved to archived-scripts during production cleanup.

HOST=${1:-http://127.0.0.1:3000}
echo "(ARCHIVE) Testing API base endpoints on: $HOST"
echo "(ARCHIVE) GET /api/health"
curl -i $HOST/api/health || true

echo "(ARCHIVE) GET /api/auth/discord (may 302)"
curl -i -L -s -S -o /dev/null -w "%{http_code}\n" -I $HOST/api/auth/discord || true

echo "(ARCHIVE) GET /reviews/api/auth/discord (if BASE_PATH=/reviews)"
curl -i -L -s -S -o /dev/null -w "%{http_code}\n" -I $HOST/reviews/api/auth/discord || true
