```md
## Reviews-Maker — Copilot Instructions (2025)

Concise, actionable guidance for AI coding agents working in this codebase. Focus on safe, project-specific edits and workflows.

### Architecture Overview
- **Frontend:** Plain HTML + vanilla JS in repo root. Main files: `index.html`, `review.html`, `app.js`, `export-studio.js`, `export-studio-ui.js`, `styles.css`.
- **Backend (optional):** Express + SQLite in `server/`. Main: `server/server.js`. DB: `db/reviews.sqlite`. Images: `db/review_images/` (served at `/images` and `/reviews/images`).
- **Auth:** File-based tokens in `server/tokens/` (filename = token, content = ownerId or JSON with roles/discord info).

### Key Patterns & Conventions
- **Frontend:**
  - Avoid large refactors; prefer minimal DOM edits in `index.html`, `review.html`, or `app.js`.
  - UI logic is direct JS, no framework. See `export-studio.js` for modular UI logic.
- **Backend:**
  - API endpoints in `server/server.js` use synchronous sqlite3 callbacks.
  - Use `rowToReview` for DB-to-JSON transforms. Copy this pattern for new endpoints.
  - Auth: check `req.auth` (populated from token file). Simulate auth by creating a file in `server/tokens/` and using `X-Auth-Token` or `?token=`.
  - DB migrations: Additive/idempotent, run at startup via `PRAGMA table_info` + `ALTER TABLE` (see `server/server.js`).
  - API errors: Always `{ error: 'code', message: 'human' }`.

### Developer Workflows
- **Frontend-only:** Open `index.html` or `review.html` in browser. VS Code tasks exist to open in Edge.
- **Backend:**
  - `cd server && npm install && npm start` (serves frontend at http://localhost:3000)
  - Quick API check: `Invoke-RestMethod -Uri http://localhost:3000/api/ping` (PowerShell)
  - Docker: `docker build -t reviews-maker:latest .` then `docker run -v ${PWD}\db:/app/db -p 3000:3000 reviews-maker:latest`
- **Debugging:**
  - Startup logs print config (LAFONCEDALLE_API_URL, LAFONCEDALLE_DB_FILE)
  - For SQLite `SQLITE_BUSY`, retry or serialize writes
  - For auth issues, inspect `server/tokens/` and in-memory `verificationCodes` (runtime-only)

### Integration & External Dependencies
- **LaFoncedalleBot:**
  - Integration via DB file (`LAFONCEDALLE_DB_FILE`) or API (`LAFONCEDALLE_API_URL` + `LAFONCEDALLE_API_KEY`).
  - Use resilient candidate-try pattern for lookups (see `getDiscordUserByEmail` in `server/server.js`).
- **Images:** Stored in `db/review_images/`, served statically.

### Project-Specific Gotchas
- Token auth is file-based; add/remove files in `server/tokens/` for testing.
- DB migrations must be additive/idempotent; update startup logic if schema changes.
- File permissions: `db/review_images/` and `server/tokens/` must be writable on VPS.
- Avoid breaking legacy LaFoncedalle integrations; follow fallback patterns in `server/server.js`.

### Examples
- **Additive DB migration:** See startup logic in `server/server.js` (uses `PRAGMA table_info` + `ALTER TABLE`).
- **API error:** `{ error: 'not_found', message: 'No review found' }`
- **Token file:** Filename = token, content = `{ "ownerId": "...", "roles": ["admin"] }`

### Key Files to Review
- `server/server.js` — API, DB, and auth logic
- `server/README.md` — env vars, deploy/run notes
- `index.html`, `review.html`, `app.js` — UI logic

---
If any section is unclear or incomplete, ask for clarification or request examples to expand.
```## Reviews-Maker — Copilot instructions

This repository contains a lightweight frontend (vanilla JS) and an optional Node/Express backend (SQLite). The goal of these instructions is to help an AI coding agent become productive quickly when making edits, bug fixes, or small features.

Keep answers short and actionable. Prefer small, safe changes and add tests or simple checks when changing runtime code.

Key places to look
- Frontend: `index.html`, `review.html`, `app.js`, `export-studio.js`, `export-studio-ui.js`, `styles.css` — UI is plain HTML/JS, no framework.
- Backend: `server/server.js` (main API), `server/package.json`, `server/README.md` — Express + SQLite. DB file is `db/reviews.sqlite` and images are stored under `db/review_images/`.
- Dev/deploy docs: top-level `README.md` and `server/README.md` contain run, Docker and VPS deployment guidance.
- Tokens: `server/tokens/` — token files (one file per token) are used for auth (`X-Auth-Token` header or ?token=). Token content can be plain ownerId or JSON with roles.

Project architecture (quick)
- Static frontend served from repository root or by Express. Frontend talks to backend at `/api/*`.
- Backend exposes REST endpoints in `server/server.js` (e.g., `/api/reviews`, `/api/auth/*`, `/api/public/reviews`, `/api/my/reviews`).
- Auth integration with LaFoncedalleBot: server attempts direct DB lookup (env `LAFONCEDALLE_DB_FILE`) then falls back to API (`LAFONCEDALLE_API_URL` + `LAFONCEDALLE_API_KEY`). See `server/server.js` for resilient lookup and multiple candidate endpoints.

What changes are safe
- Small UI fixes in `index.html` / `review.html` and related JS. Avoid large refactors; prefer minimal DOM edits.
- API additions that follow existing patterns (e.g., add a new query param to `/api/reviews`): mimic style in `server/server.js` (synchronous sqlite3 callbacks, rowToReview helper).
- Token-related behavior: add/remove files in `server/tokens/`. Tests or features requiring auth should use a token file with the expected shape.

Important patterns and conventions
- Database: SQLite file at `db/reviews.sqlite`. Migrations are idempotent and applied at startup in `server/server.js` using `PRAGMA table_info` + `ALTER TABLE` if needed.
- Image storage: uploads are saved to `db/review_images/`; served from `/images` and `/reviews/images`.
- Config via env vars: `PORT`, `LAFONCEDALLE_API_URL`, `LAFONCEDALLE_API_KEY`, `LAFONCEDALLE_DB_FILE` (optional, preferred for fast verification).
- Token files: file name = token string; content = ownerId or JSON { ownerId, roles, discordId, discordUsername }.
- Backwards-compat: server accepts multiple legacy LaFoncedalle endpoints — when adding integrations, follow the resilient candidate-try pattern used in `getDiscordUserByEmail` and `sendVerificationEmail`.

Developer workflows & commands
- Run frontend-only locally: open `index.html` or `review.html` in a browser.
- Run backend locally (serves frontend too):
  - cd `server`
  - `npm install`
  - `npm start` (serves on http://localhost:3000)
- Docker (local): `docker build -t reviews-maker:latest .` then run with `-v $(pwd)/db:/app/db -p 3000:3000`.
- On VPS, prefer PM2 or systemd. See `server/README.md` for exact commands and Nginx reverse proxy examples.

Quick debugging tips
- Check console logs: `server/server.js` prints config on startup (LAFONCEDALLE_API_URL, LAFONCEDALLE_DB_FILE) — useful under PM2/docker where env is lost.
- Reproduce API errors with curl: `curl -s http://localhost:3000/api/ping` and `curl -s http://localhost:3000/api/reviews | jq`.
- For auth flow issues, inspect files in `server/tokens/` and the in-memory `verificationCodes` map (only available at runtime).

Edge cases to watch
- Concurrent writes to SQLite can produce `SQLITE_BUSY`. Solution: retry logic or serialize writes; the server currently expects light usage.
- File permissions on VPS: ensure `db/review_images` and `server/tokens` are writable by the process user (e.g., `www-data` for systemd).
- LaFoncedalle integration: prefer `LAFONCEDALLE_DB_FILE` when available — fallback to API may return heterogeneous payloads, normalize them as in `getDiscordUserByEmail`.

If you edit or add endpoints
- Follow the existing patterns: `rowToReview` for transforming DB rows, `req.auth` for token-based owner scoping, and consistent error shapes: { error: 'code', message: 'human' }.
- Add tests or at least a curl example in the PR description showing the new endpoint working.

Files worth opening first when triaging bugs
- `server/server.js` — core logic and most of the API surface.
- `server/README.md` — run/deploy instructions and env var expectations.
- `index.html`, `review.html`, `app.js` — reproduce frontend issues quickly.

Questions for maintainers when unsure
- Should a change modify the on-disk DB schema? If yes, prefer additive idempotent migrations (as done in `server/server.js`).
- If you need to add background jobs or Redis for verification codes, confirm whether VPS supports extra services (docs in `docs/DEPLOIEMENT_VPS.md`).

If anything here is unclear or you'd like the file to include more examples (curl requests, sample token file, or common PR checklists), tell me which section to expand.
