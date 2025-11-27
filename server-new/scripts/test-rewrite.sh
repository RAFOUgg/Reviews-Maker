#!/usr/bin/env bash
# Quick test helper for base path rewrite
# Usage: ./test-rewrite.sh [host]
HOST=${1:-http://127.0.0.1:3000}
echo "Testing API base endpoints on: $HOST"
echo "GET /api/health"
curl -i $HOST/api/health

echo "GET /api/auth/discord (should 302 redirect to Discord or 200)"
curl -i -L -s -S -o /dev/null -w "%{http_code}\n" -I $HOST/api/auth/discord

echo "GET /reviews/api/auth/discord (if BASE_PATH=/reviews)"
curl -i -L -s -S -o /dev/null -w "%{http_code}\n" -I $HOST/reviews/api/auth/discord
