```md
## Reviews-Maker — Copilot Instructions (Nov 2025)

### Architecture Snapshot
- `index.html` + `review.html` load legacy `app.js`; modular replacement lives in `src/v2/` (core/services/ui) and plugs into existing DOM via ES modules.
- Backend (`server/server.js`) = Express + sqlite3, serves static assets from repo root, persists uploads in `db/review_images/`, data in `db/reviews.sqlite`.
- Auth flows mix LaFoncedalleBot (API or direct DB) with flat-file tokens in `server/tokens/` to unlock staff/private views.

### Frontend Playbook
- Legacy `app.js` uses global helpers (`dom`, `render*`, `showToast`)—prefer surgical edits and reuse existing utilities.
- V2 modules rely on `eventBus`, `stateManager`, `modalController`; attach new logic through events/modals instead of direct DOM wiring.
- Debugging: `scripts/logger.js` and the bootstrap gate mute `console.*`; enable with `?debug=1`, `localStorage.RM_DEBUG='1'`, or `window.DEBUG=true`.

### Backend Playbook
- Stick with sqlite3 callbacks and wrap responses with `rowToReview`; honor `req.auth.ownerId` / `roles` for privacy (staff bypasses filters).
- Startup migrations follow the pattern: `PRAGMA table_info('reviews')`, add missing columns, ensure `review_likes` table + index—extend this flow for schema changes.
- Error payloads stay `{ error: 'code', message?: 'human' }`; writes require auth and reject blank `holderName`.

### Data & Auth Facts
- Token filename = bearer token; file content can be plain ownerId or JSON with `roles`/discord fields—use `"roles": ["staff"]` for admin-only endpoints.
- Email verification codes are in-memory (`verificationCodes` Map); restarting the server clears pending codes and rate limits.
- Base-path support: frontend patches fetch/XHR to prefix `/reviews`, backend middleware rewrites `/reviews/api/*`—keep both halves aligned when touching routing.

### Developer Workflows
- Front preview: open `index.html` or `review.html` (VS Code tasks launch Edge on Windows).
- Full stack: `cd server; npm install; npm start`; set env vars via `.env` or PowerShell session (`$env:LAFONCEDALLE_DB_FILE=...`).
- Diagnostics: `server/test_smoke.ps1`, `scripts/diagnostic-*.js`, and restore helpers (`RESTORE_NOW.js`, `RESTORE_DATABASE_EMERGENCY.js`); archived originals live under `archive/debug/`.

### Export & Assets
- Export Studio uses `export-studio.js` + `export-studio-ui.js` with styles from `export-studio.css`; DOM hooks live in `review.html` on the element with id `exportStudioModal`.
- Image uploads land in `db/review_images/`, served from `/images` and `/reviews/images`; delete route also unlinks files—mirror this if you change storage.
- `scripts/logger.js` silences noisy logs in production; keep it loaded before other scripts when creating new HTML entry points.

### Operations Notes
- Production hosts run under PM2 (`pm2 start ecosystem.config.cjs --env production`) or systemd; restart with `pm2 restart reviews-maker` or `sudo systemctl restart reviews-maker`.
- Ensure `db/reviews.sqlite` + `db/review_images/` stay writable and backed up (`tar czf backup-$(date +%F).tar.gz db/reviews.sqlite db/review_images`).
- When serving from `/reviews`, keep Nginx proxying to `127.0.0.1:3000` and leave static files exposed; server already rewrites `/reviews/api/*`.

If any section needs deeper examples (auth flow traces, modal lifecycle, etc.), let me know so we can expand it.
```


