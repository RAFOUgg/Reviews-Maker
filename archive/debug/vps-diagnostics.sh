#!/usr/bin/env bash
# Collecte d'infos diagnostiques pour Reviews-Maker
OUTDIR=/tmp/reviews-maker-diagnostics-$(date +%Y%m%d%H%M%S)
mkdir -p "$OUTDIR"
echo "Collecting diagnostics into $OUTDIR"

echo "--- uname ---" > "$OUTDIR/system.txt"
uname -a >> "$OUTDIR/system.txt"

echo "--- node & npm ---" > "$OUTDIR/node.txt"
node -v >> "$OUTDIR/node.txt" 2>&1 || echo "node not found" >> "$OUTDIR/node.txt"
npm -v >> "$OUTDIR/node.txt" 2>&1 || echo "npm not found" >> "$OUTDIR/node.txt"

echo "--- pm2 list ---" > "$OUTDIR/pm2.txt"
pm2 list >> "$OUTDIR/pm2.txt" 2>&1 || pm2 list >> "$OUTDIR/pm2.txt" 2>&1 || echo "pm2 not found" >> "$OUTDIR/pm2.txt"

echo "--- pm2 logs (last 200) ---" > "$OUTDIR/pm2_logs.txt"
pm2 logs --lines 200 >> "$OUTDIR/pm2_logs.txt" 2>&1 || pm2 logs --lines 200 >> "$OUTDIR/pm2_logs.txt" 2>&1 || echo "pm2 logs failed" >> "$OUTDIR/pm2_logs.txt"

echo "--- tail server logs ---" > "$OUTDIR/server_logs.txt"
if [ -d "~/Reviews-Maker/logs" ]; then
  tail -n 500 ~/Reviews-Maker/logs/*.log >> "$OUTDIR/server_logs.txt" 2>&1 || true
fi

echo "Diagnostics collected: $OUTDIR"
ls -l "$OUTDIR"

# Print a short summary to stdout
echo "--- SUMMARY ---"
cat "$OUTDIR/node.txt"
cat "$OUTDIR/pm2.txt" | head -n 50

echo "Script finished. You can download $OUTDIR for further analysis."