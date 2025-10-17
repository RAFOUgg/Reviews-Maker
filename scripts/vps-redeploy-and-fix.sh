#!/usr/bin/env bash
set -euo pipefail

OUTDIR="/tmp/reviews-maker-fix-$(date +%Y%m%d%H%M%S)"
mkdir -p "$OUTDIR"
echo "Diagnostics+fix run - output -> $OUTDIR"

echo "1) Repository status" > "$OUTDIR/step1_repo.txt"
cd "$HOME/Reviews-Maker" || { echo "Reviews-Maker folder not found in $HOME"; exit 1; }
pwd >> "$OUTDIR/step1_repo.txt"
git remote -v >> "$OUTDIR/step1_repo.txt" 2>&1 || true
git branch -avv >> "$OUTDIR/step1_repo.txt" 2>&1 || true
git rev-parse --abbrev-ref HEAD >> "$OUTDIR/step1_repo.txt" 2>&1 || true

echo "Pulling latest main from origin..." | tee -a "$OUTDIR/step1_repo.txt"
# try to safely update the working tree
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git fetch origin --quiet || true
  git reset --hard origin/main || true
  git submodule update --init --recursive || true
fi

echo "2) Backend install" > "$OUTDIR/step2_backend.txt"
if [ -d "$HOME/Reviews-Maker/server" ]; then
  cd "$HOME/Reviews-Maker/server"
  echo "cwd: $(pwd)" >> "$OUTDIR/step2_backend.txt"
  echo "node version: $(node -v 2>/dev/null || echo 'node not found')" >> "$OUTDIR/step2_backend.txt"
  echo "npm version: $(npm -v 2>/dev/null || echo 'npm not found')" >> "$OUTDIR/step2_backend.txt"
  echo "Installing npm deps (server)..." | tee -a "$OUTDIR/step2_backend.txt"
  npm install --no-audit --no-fund >> "$OUTDIR/step2_backend.txt" 2>&1 || echo "npm install finished with errors" >> "$OUTDIR/step2_backend.txt"
else
  echo "server folder not found" >> "$OUTDIR/step2_backend.txt"
fi

# Ensure dotenv exists in node_modules (best-effort)
if [ -d "$HOME/Reviews-Maker/server" ]; then
  if [ ! -d "$HOME/Reviews-Maker/server/node_modules/dotenv" ]; then
    echo "dotenv not found in node_modules, attempting to install" >> "$OUTDIR/step2_backend.txt"
    (cd "$HOME/Reviews-Maker/server" && npm install dotenv@16.1.4 --no-audit --no-fund) >> "$OUTDIR/step2_backend.txt" 2>&1 || echo "failed to install dotenv" >> "$OUTDIR/step2_backend.txt"
  else
    echo "dotenv already present" >> "$OUTDIR/step2_backend.txt"
  fi
fi

echo "3) PM2 processes" > "$OUTDIR/step3_pm2.txt"
if command -v pm2 >/dev/null 2>&1; then
  pm2 list >> "$OUTDIR/step3_pm2.txt" 2>&1 || true
  pm2 jlist >> "$OUTDIR/step3_pm2.txt" 2>&1 || true
  echo "Checking for 'reviews-maker' process..." >> "$OUTDIR/step3_pm2.txt"
  pm2 info reviews-maker >> "$OUTDIR/step3_pm2.txt" 2>&1 || echo "reviews-maker pm2 app not found" >> "$OUTDIR/step3_pm2.txt"
else
  echo "pm2 not installed" >> "$OUTDIR/step3_pm2.txt"
fi

# If pm2 exists, attempt safe restart of the reviews-maker process; if it doesn't exist, start it
if command -v pm2 >/dev/null 2>&1; then
  # show current pm2 entries for user
  echo "Current pm2 processes:" | tee -a "$OUTDIR/step3_pm2.txt"
  pm2 list | tee -a "$OUTDIR/step3_pm2.txt" || true

  # Try to restart existing named process
  if pm2 info reviews-maker >/dev/null 2>&1; then
    echo "Restarting existing pm2 app 'reviews-maker'..." | tee -a "$OUTDIR/step3_pm2.txt"
    pm2 restart reviews-maker >> "$OUTDIR/step3_pm2.txt" 2>&1 || echo "restart failed" >> "$OUTDIR/step3_pm2.txt"
  else
    echo "No pm2 entry 'reviews-maker' found; starting a new one pointing to server/server.js" | tee -a "$OUTDIR/step3_pm2.txt"
    pm2 start "$HOME/Reviews-Maker/server/server.js" --name reviews-maker --cwd "$HOME/Reviews-Maker/server" --interpreter node >> "$OUTDIR/step3_pm2.txt" 2>&1 || echo "start failed" >> "$OUTDIR/step3_pm2.txt"
  fi
  pm2 save >> "$OUTDIR/step3_pm2.txt" 2>&1 || true
else
  echo "pm2 not installed; skipping pm2 restart/start" >> "$OUTDIR/step3_pm2.txt"
fi

# Pause so logs flush
sleep 1

echo "4) Tail logs (pm2 + app logs if present)" > "$OUTDIR/step4_logs.txt"
if command -v pm2 >/dev/null 2>&1; then
  pm2 logs reviews-maker --lines 200 > "$OUTDIR/step4_logs.txt" 2>&1 &
  sleep 2
fi

if [ -d "$HOME/Reviews-Maker/logs" ]; then
  echo "-- app log files --" >> "$OUTDIR/step4_logs.txt"
  ls -la "$HOME/Reviews-Maker/logs" >> "$OUTDIR/step4_logs.txt" 2>&1 || true
  tail -n 200 "$HOME/Reviews-Maker/logs/out-0.log" >> "$OUTDIR/step4_logs.txt" 2>&1 || true
  tail -n 200 "$HOME/Reviews-Maker/logs/error-0.log" >> "$OUTDIR/step4_logs.txt" 2>&1 || true
fi

# run diagnostics script if present
if [ -x "$HOME/Reviews-Maker/scripts/vps-diagnostics.sh" ]; then
  echo "Running full diagnostics script to collect system info..." > "$OUTDIR/step5_diagnostics.txt"
  "$HOME/Reviews-Maker/scripts/vps-diagnostics.sh" >> "$OUTDIR/step5_diagnostics.txt" 2>&1 || true
else
  echo "No diagnostics script found or not executable" > "$OUTDIR/step5_diagnostics.txt"
fi

# Summarize
echo "

=== SUMMARY ==="
echo "Output directory: $OUTDIR"
ls -la "$OUTDIR"
echo "Last lines of pm2 logs file (if any):"
sudo tail -n 60 "$OUTDIR/step4_logs.txt" 2>/dev/null || true

echo "Script finished. Review files in $OUTDIR and paste contents if you want me to analyze further."

exit 0
