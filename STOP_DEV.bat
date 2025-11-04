@echo off
REM Reviews-Maker - Arrêt des services

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║  🛑 Reviews-Maker - Arrêt des services                           ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Recherche des processus...

REM Arrêter les fenêtres par leur titre
taskkill /FI "WINDOWTITLE eq Reviews-Backend*" /F >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Backend arrêté
) else (
    echo ⚠️  Aucun backend en cours
)

taskkill /FI "WINDOWTITLE eq Reviews-Frontend*" /F >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Frontend arrêté
) else (
    echo ⚠️  Aucun frontend en cours
)

echo.
echo 🎯 Services Reviews-Maker arrêtés !
echo.
pause
