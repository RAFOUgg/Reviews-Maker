@echo off
:: Detecte automatiquement le port du frontend (5173 ou 5174)
title Reviews-Maker - Ouverture du site

echo Verification du serveur frontend...

:: Tester le port 5173
powershell -NoProfile -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 1 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo Frontend detecte sur le port 5173
    start http://localhost:5173
    exit
)

:: Tester le port 5174
powershell -NoProfile -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:5174' -TimeoutSec 1 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo Frontend detecte sur le port 5174
    start http://localhost:5174
    exit
)

:: Aucun serveur detecte
echo [ERREUR] Aucun serveur frontend detecte
echo Lancez d'abord le serveur avec START_DEV_AUTO.bat
pause
exit
