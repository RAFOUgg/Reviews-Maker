secure-deploy.sh - README

This directory contains a helper script to securely deploy production env variables and restart PM2.

Usage:
  1. From the `server-new` directory on your VPS run:
     sudo bash scripts/secure-deploy.sh

  2. The script will:
     - Make a timestamped backup of `server-new/.env`.
     - Ask for FRONTEND_URL, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET and SESSION_SECRET.
     - Regenerate `SESSION_SECRET` if not provided.
     - Overwrite `server-new/.env` with secure values.
     - Set file permissions to `600`.
     - If `ecosystem.config.cjs` found, call `pm2 startOrReload` with `--env production`.
     - Run `node scripts/check-env.js` post-checks.

Security notes:
  - Never commit the `server-new/.env` file to Git.
  - If you suspect secrets were exposed in the Git history, rotate the secret(s) immediately in the provider (Discord, etc.).
  - Prefer to manage secrets using a proper secret manager or specify them in your process manager (PM2/systemd) without storing them in the repo.
