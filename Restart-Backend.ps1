#!/usr/bin/env powershell
# Restart Reviews-Maker Backend

Write-Host "🔄 Restarting Reviews-Maker backend..." -ForegroundColor Cyan

# Execute via SSH
$output = & ssh vps-lafoncedalle @"
cd /home/ubuntu/Reviews-Maker
npx pm2 restart reviews-maker
sleep 2
npx pm2 status
"@

Write-Host $output

Write-Host "✅ Restart command sent" -ForegroundColor Green
