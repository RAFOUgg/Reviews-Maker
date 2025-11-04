@echo off
chcp 65001 >nul
title Reviews-Maker - Démarrage Serveur v2.0
color 0A

:: ============================================================================
:: REVIEWS-MAKER - Script de démarrage optimisé
:: ============================================================================

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         REVIEWS-MAKER v2.0 - Démarrage Serveur                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Aller dans le dossier du projet
cd /d "%~dp0"

:: ============================================================================
:: VÉRIFICATIONS PRÉALABLES
:: ============================================================================

echo [1/6] Vérification de Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Node.js n'est pas installé ou pas dans le PATH
    echo.
    echo 💡 Installez Node.js depuis https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo ✅ Node.js détecté

echo.
echo [2/6] Vérification des dossiers...
if not exist "server-new" (
    echo ❌ ERREUR: Le dossier server-new n'existe pas
    pause
    exit /b 1
)
if not exist "client" (
    echo ❌ ERREUR: Le dossier client n'existe pas
    pause
    exit /b 1
)
echo ✅ Dossiers validés

echo.
echo [3/6] Vérification des dépendances backend...
if not exist "server-new\node_modules" (
    echo ⚠️  Dépendances backend manquantes
    echo 📦 Installation en cours...
    cd server-new
    call npm install
    cd ..
    echo ✅ Installation terminée
) else (
    echo ✅ Dépendances backend OK
)

echo.
echo [4/6] Vérification des dépendances frontend...
if not exist "client\node_modules" (
    echo ⚠️  Dépendances frontend manquantes
    echo 📦 Installation en cours...
    cd client
    call npm install
    cd ..
    echo ✅ Installation terminée
) else (
    echo ✅ Dépendances frontend OK
)

:: ============================================================================
:: ARRÊT DES PROCESSUS EXISTANTS
:: ============================================================================

echo.
echo [5/6] Nettoyage des processus Node.js existants...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Processus précédents arrêtés
    timeout /t 2 /nobreak >nul
) else (
    echo ℹ️  Aucun processus à arrêter
)

:: ============================================================================
:: DÉMARRAGE DES SERVEURS
:: ============================================================================

echo.
echo [6/6] Démarrage des serveurs...
echo.

:: Démarrer le backend
echo 🚀 Backend Express (port 3000)...
start "Reviews-Backend" cmd /c "cd /d "%~dp0server-new" && npm run dev"
timeout /t 5 /nobreak >nul
echo ✅ Backend démarré

echo.
echo 🚀 Frontend React (port 5173/5174)...
start "Reviews-Frontend" cmd /c "cd /d "%~dp0client" && npm run dev"
timeout /t 8 /nobreak >nul
echo ✅ Frontend démarré

:: ============================================================================
:: OUVERTURE DU NAVIGATEUR
:: ============================================================================

echo.
echo 🌐 Ouverture du navigateur...
timeout /t 2 /nobreak >nul

:: Tester le port 5173 d'abord
powershell -NoProfile -Command "try { $null = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 2 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    start http://localhost:5173
    set FRONTEND_PORT=5173
) else (
    start http://localhost:5174
    set FRONTEND_PORT=5174
)

:: ============================================================================
:: RÉSUMÉ
:: ============================================================================

cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         ✅ REVIEWS-MAKER DÉMARRÉ AVEC SUCCÈS                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo 🌐 URLs d'accès :
echo    Frontend : http://localhost:%FRONTEND_PORT%
echo    Backend  : http://localhost:3000
echo.
echo 📱 Pour accéder depuis mobile/tablette :
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4" ^| findstr /v "169.254"') do (
    set ip=%%a
    set ip=!ip: =!
    if not "!ip!"=="" (
        echo    http://!ip!:%FRONTEND_PORT%
        goto :IP_FOUND
    )
)
:IP_FOUND
echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo 💡 Les serveurs tournent en arrière-plan
echo 💡 Pour les arrêter : exécutez STOP_DEV.bat
echo 💡 Pour voir les logs : regardez les fenêtres minimisées
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause

