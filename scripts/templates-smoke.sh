#!/usr/bin/env bash
set -euo pipefail

BASE=${BASE:-http://127.0.0.1:3000}
echo "Templates smoke tests against ${BASE}"

echo "GET /api/templates (public only)"
curl -sS "${BASE}/api/templates?publicOnly=true" | jq -C '.' || true

echo "GET /api/templates (all visible to anonymous - should return public templates)"
curl -sS "${BASE}/api/templates" | jq -C '.' || true

echo "GET /api/templates/:id for first template (if present)"
FIRST=$(curl -sS "${BASE}/api/templates?publicOnly=true" | jq -r '.[0].id // empty')
if [ -n "${FIRST}" ]; then
  echo "Found template ${FIRST} — fetching"
  curl -sS "${BASE}/api/templates/${FIRST}" | jq -C '.' || true
else
  echo "No public templates found — create one via POST /api/templates as authenticated user to continue tests."
fi

echo "Templates smoke tests finished"
