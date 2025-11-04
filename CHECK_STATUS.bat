@echo off
chcp 65001 >nul
title Reviews-Maker - Statut
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         REVIEWS-MAKER - STATUT DU SERVEUR                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: ============================================================================
:: VÉRIFICATION DES PROCESSUS NODE.JS
:: ============================================================================

echo 🔍 Vérification des processus Node.js...
echo.

tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Serveur Node.js EN COURS D'EXÉCUTION
    echo.
    echo 📋 Processus actifs :
    tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
) else (
    echo ❌ Aucun processus Node.js détecté
    echo.
    echo 💡 Lancez le serveur avec START_SERVER.bat ou START_DEV_AUTO.bat
)

echo.
echo ════════════════════════════════════════════════════════════════

:: ============================================================================
:: VÉRIFICATION DES PORTS
:: ============================================================================

echo.
echo 🔍 Vérification des ports...
echo.

:: Backend (port 3000)
netstat -an | find ":3000 " | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend accessible sur http://localhost:3000
) else (
    echo ❌ Backend non disponible (port 3000 fermé)
)

:: Frontend (port 5173)
netstat -an | find ":5173 " | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend accessible sur http://localhost:5173
    set FRONTEND_STATUS=OK
    set FRONTEND_PORT=5173
    goto CHECK_COMPLETE
)

:: Frontend (port 5174)
netstat -an | find ":5174 " | find "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend accessible sur http://localhost:5174
    set FRONTEND_STATUS=OK
    set FRONTEND_PORT=5174
    goto CHECK_COMPLETE
)

echo ❌ Frontend non disponible (ports 5173/5174 fermés)
set FRONTEND_STATUS=KO

:CHECK_COMPLETE

echo.
echo ════════════════════════════════════════════════════════════════

:: ============================================================================
:: TEST DE CONNECTIVITÉ
:: ============================================================================

echo.
echo 🔍 Test de connectivité...
echo.

:: Test Backend Health
powershell -NoProfile -Command "try { $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/health' -TimeoutSec 2; Write-Host '✅ Backend API : OK (uptime: ' $([math]::Round($response.uptime, 1)) 's)' } catch { Write-Host '❌ Backend API : Erreur' }"

:: Test Frontend
if "%FRONTEND_STATUS%"=="OK" (
    powershell -NoProfile -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:%FRONTEND_PORT%' -TimeoutSec 2 -UseBasicParsing; Write-Host '✅ Frontend : OK' } catch { Write-Host '❌ Frontend : Erreur' }"
)

echo.
echo ════════════════════════════════════════════════════════════════

:: ============================================================================
:: RÉSUMÉ ET ACCÈS RÉSEAU
:: ============================================================================

echo.
echo 📡 Informations réseau :
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "169.254"') do (
    set ip=%%a
    set ip=!ip: =!
    if not "!ip!"=="" (
        echo 🌐 Adresse IP locale : !ip!
        if "%FRONTEND_STATUS%"=="OK" (
            echo 📱 Accès mobile : http://!ip!:%FRONTEND_PORT%
        )
        goto :IP_DONE
    )
)
:IP_DONE

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo 💡 Actions disponibles :
echo    - Ouvrir le site : OPEN_SITE.bat
echo    - Arrêter le serveur : STOP_DEV.bat
echo    - Redémarrer : START_SERVER.bat
echo.
pause

