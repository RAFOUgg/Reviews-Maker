```md
## Reviews-Maker — Copilot instructions (merged & improved)

Short, actionable guidance to help an AI coding agent make safe edits, fixes and small features.

Core architecture (read these first)
- Frontend: plain HTML + vanilla JS in repo root. Key files: `index.html`, `review.html`, `app.js`, `export-studio.js`, `export-studio-ui.js`, `styles.css`.
- Backend (optional): Express + SQLite in `server/`. Main file: `server/server.js`. DB: `db/reviews.sqlite`. Images: `db/review_images/` served from `/images` and `/reviews/images`.
- Auth: file-based tokens in `server/tokens/`. Files named by token string; contents are either an ownerId or JSON `{ ownerId, roles, discordId, discordUsername }`.

Why this shape
- Simple static frontend so small DOM edits are safest. Backend is designed for light usage and simple file-based auth to ease VPS deployments.

Safe/typical edits
- Small UI changes: prefer DOM tweaks in `index.html`/`review.html` or `app.js` over large refactors.
- API changes: follow `server/server.js` patterns (synchronous sqlite3 callbacks, use `rowToReview` to convert rows). Additive query params and read endpoints are low-risk.
- Auth/tests: to simulate owner-scoped requests, create a token file in `server/tokens/` and call endpoints with header `X-Auth-Token: <filename>` or `?token=<filename>`.

Important conventions and examples
- DB migrations: applied at startup in `server/server.js` via `PRAGMA table_info` + `ALTER TABLE`. If you change schema, make migrations additive and idempotent.
- Error shape: API errors use `{ error: 'code', message: 'human' }` — reuse this in new endpoints.
- Example row transformer: search `rowToReview` in `server/server.js` and copy-style for new DB-to-JSON transforms.

Run / debug (PowerShell-friendly examples)
- Frontend-only: open `index.html` or `review.html` in a browser (VS Code task exists to open in Edge).
- Backend local (serves frontend):
  - cd server
  - npm install
  - npm start   # serves on http://localhost:3000
- Quick checks (PowerShell):
  - Invoke-RestMethod -Uri http://localhost:3000/api/ping
  - Invoke-RestMethod -Uri http://localhost:3000/api/reviews | ConvertTo-Json -Depth 5
- Docker: `docker build -t reviews-maker:latest .` then run mounting the db and images (PowerShell):
  - docker run -v ${PWD}\db:/app/db -p 3000:3000 reviews-maker:latest

Debugging tips
- Startup logs: `server/server.js` prints config (LAFONCEDALLE_API_URL, LAFONCEDALLE_DB_FILE). Useful under PM2/docker.
- SQLite lock (`SQLITE_BUSY`): expect under concurrency. Solutions: retry/serialize writes or reduce concurrency.
- Auth issues: inspect `server/tokens/` files and the in-memory `verificationCodes` map (runtime-only). For verification flows, review `sendVerificationEmail` & `getDiscordUserByEmail` resilient-candidate pattern in `server/server.js`.

Files to open first when triaging
- `server/server.js` — most API logic and patterns.
- `server/README.md` — env vars and deploy/run notes.
- `index.html`, `review.html`, `app.js` — reproduce frontend issues quickly.

When adding endpoints or changing behavior
- Follow style in `server/server.js`: synchronous sqlite3 callbacks, `rowToReview`, `req.auth` for owner scoping, and consistent error objects.
- Include a short curl/Invoke-RestMethod example in the PR description demonstrating the new endpoint.

Project-specific gotchas
- Token auth is file-based: adding/removing token files is an acceptable test approach on dev/VPS.
- Images are stored on disk; ensure `db/review_images/` permissions on VPS.

Questions to ask maintainers (use before risky changes)
- Does this change require an on-disk DB migration? If yes, ensure it's additive/idempotent and update startup migrations in `server/server.js`.
- Will the VPS environment allow extra services (Redis, background workers)? See `docs/DEPLOIEMENT_VPS.md`.

If anything here is unclear, tell me which section to expand and I will iterate.
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
