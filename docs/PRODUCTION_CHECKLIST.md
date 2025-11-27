Production readiness checklist
=============================

Follow these steps before going to production. These checks are minimal but cover frequent causes of broken deployment.

1) Domain & TLS
 - Ensure your public domain resolves to the server.
 - Configure Nginx for HTTPS using Certbot (Let's Encrypt) and enable TLS.
 - Ensure Nginx configuration uses `proxy_set_header X-Forwarded-Proto $scheme` and `set_real_ip_from` if behind a cloud provider.

2) Environment variables
 - Set `FRONTEND_URL` to the public domain or IP.
 - Set `DISCORD_REDIRECT_URI` to `https://yourdomain/api/auth/discord/callback` and register it in Discord Developer Portal.
 - Set `SESSION_SECRET` (a strong random value), `SESSION_SECURE=true`, and `CORS_ORIGIN=https://yourdomain`.
 - If using a subpath (eg `/reviews`), set `BASE_PATH=/reviews`.

3) Nginx proxy
 - Use `location ^~ /api` to proxy API requests and prevent the `location /` fallback.
 - Ensure `proxy_pass http://127.0.0.1:3000;` (no trailing slash).
 - Add `proxy_set_header X-Original-Uri $request_uri;
   add_header X-Proxy-Server $server_name;
   add_header X-Proxy-Path $request_uri;` for debugging.

4) Session/cookies
 - Use `SESSION_SECURE=true` and `SameSite=None` for cross-site usage.
 - Set `app.set('trust proxy', 1)` in Express.

5) Build & Static Assets
 - Build the client: `cd client && npm ci && npm run build`.
 - Copy `client/dist` to the static folder served by Nginx (eg `/var/www/reviews-maker/client/dist`).
 - Verify no references to `http://localhost:3000` remain in assets.

6) PM2 / process manager
 - Use `ecosystem.config.cjs` and `pm2 startOrReload ecosystem.config.cjs --env production`.
 - Validate process: `pm2 list` and `ss -tulpn | grep :3000`.

7) Security
 - Confirm no secrets are embedded in the client bundle.
 - Use CSP and secure headers.
 - Review firewall rules (allow 80 & 443 only publicly).

8) Health checks
 - `/api/health` should return HTTP 200.
 - Tests: `curl -i http://127.0.0.1:3000/api/health` and `curl -i https://yourdomain/api/health`.

9) OAuth
 - Make sure Discord Developer Portal redirect URIs are exact and match `FRONTEND_URL` environment variable if needed.
 - Test login flow and verify `Set-Cookie` headers are present and cookies stored.

10) Monitoring & backups
 - Enable `pm2` logs and rotate them.
 - Ensure database backups are configured and files are writable.

If you want, I can create a small `start-prod.sh` and `deploy` script to automate the above steps (I created a basic `scripts/start-prod.sh` if you want me to extend it further).

End of checklist
