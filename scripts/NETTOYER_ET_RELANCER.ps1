# 🧹 NETTOYAGE ET RELANCE - Reviews-Maker

Write-Host "🧹 Nettoyage du cache TypeScript et des anciens fichiers..." -ForegroundColor Cyan

# Suppression caches
if (Test-Path "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\node_modules\.vite") {
    Remove-Item "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\node_modules\.vite" -Recurse -Force
    Write-Host "✅ Cache Vite supprimé" -ForegroundColor Green
}

if (Test-Path "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\.vite") {
    Remove-Item "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\.vite" -Recurse -Force
    Write-Host "✅ Cache .vite supprimé" -ForegroundColor Green
}

# Suppression ancien dossier data/ si existe
if (Test-Path "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\data") {
    Write-Host "⚠️  Dossier obsolète client/src/data trouvé" -ForegroundColor Yellow
    Remove-Item "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\data" -Recurse -Force
    Write-Host "✅ Dossier data/ supprimé" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ Nettoyage terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Relancer VS Code (Ctrl+Shift+P > 'Reload Window')" -ForegroundColor White
Write-Host "2. OU relancer manuellement les serveurs :" -ForegroundColor White
Write-Host ""
Write-Host "   Terminal 1 (Backend) :" -ForegroundColor Yellow
Write-Host "   cd server-new" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "   Terminal 2 (Frontend) :" -ForegroundColor Yellow
Write-Host "   cd client" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Magenta
Write-Host "🔧 Backend:  http://localhost:3000" -ForegroundColor Magenta
Write-Host ""
Write-Host "🎉 Reviews-Maker est prêt !" -ForegroundColor Green
