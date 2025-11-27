#!/usr/bin/env bash
# Small diagnostics helper to gather logs and show network/proxy state
set -euo pipefail
echo "Diagnostics - start"
if ! command -v pm2 >/dev/null 2>&1; then
	echo "PM2 not found in PATH. Run as the user that installed pm2 (avoid sudo)."
else
	echo "-- PM2 binary info --"
	which pm2 || true
	echo "-- PM2 status --"
	pm2 list || true
	echo "-- PM2 describe reviews-backend --"
	pm2 describe reviews-backend || true
fi

echo "-- Listening socket on port 3000 --"
ss -tulpn | grep :3000 || true
echo "-- Nginx config test --"
sudo nginx -t || true
echo "-- Nginx sites-enabled --"
sudo ls -la /etc/nginx/sites-enabled || true
echo "-- Nginx config (site) --"
sudo sed -n '1,240p' /etc/nginx/sites-available/reviews-maker || true
echo "-- tail nginx access log --"
sudo tail -n 40 /var/log/nginx/reviews-maker.access.log || true
echo "-- tail nginx error log --"
sudo tail -n 40 /var/log/nginx/reviews-maker.error.log || true

if command -v pm2 >/dev/null 2>&1; then
	echo "-- tail pm2 logs last 100 lines --"
	pm2 logs reviews-backend --lines 100 || true
fi

echo "-- Curl local health (127.0.0.1) --"
curl -i http://127.0.0.1:3000/api/health || true
echo "-- Curl public health (public IP) --"
curl -i http://51.75.22.192/api/health || true
echo "-- Trying oauth request (public IP) --"
curl -i -L -v http://51.75.22.192/api/auth/discord || true
echo "Diagnostics - end"
