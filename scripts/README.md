# Production Scripts

This folder contains helper scripts and documentation to build, deploy and verify a production instance of Reviews-Maker on a VPS.

Files
- start-prod.sh: Build the client, copy client/dist to /var/www/reviews-maker/client/dist (modify if your Nginx path differs) and reload PM2.
- pm2-clean-restart.sh: Helper to safely stop and restart PM2 apps and kill stray node processes.
- diagnostics.sh: Run this to output key diagnostics (pm2, nginx, curl checks).

Usage
- Ensure you are the `ubuntu` user (or the user that runs pm2) and git repo is up-to-date.
- Set proper env vars in `server-new/.env`.
- Run: `./scripts/start-prod.sh` to rebuild the client and restart the app.

Notes
- start-prod.sh uses a production static folder `/var/www/reviews-maker/client/dist`. Modify if your server uses a different path.
- TLS is recommended for production. Use Certbot or similar to generate certificates.
- Double-check the Discord OAuth redirect entries and FRONTEND_URL in the `server-new/.env` file.

Troubleshooting
- If auth fails, `pm2 logs reviews-backend` and `sudo tail -n 200 /var/log/nginx/reviews-maker.access.log` are useful.
- Ensure `FRONTEND_URL` and `DISCORD_REDIRECT_URI` are set and match exactly the domains in Discord dev portal.
