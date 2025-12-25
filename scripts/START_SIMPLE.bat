@echo off
setlocal enabledelayedexpansion

REM ============================================================================
REM Reviews-Maker - Lanceur Simple Windows
REM Lance Backend + Frontend dans des fenêtres séparées
REM ============================================================================

title Reviews-Maker - Demarrage
cls
echo.
echo ================================================================
echo            REVIEWS-MAKER - DEMARRAGE
echo ================================================================
echo.

REM Vérifier Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH
    echo Telechargez-le sur https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detecte
node --version

REM Arrêter les anciens processus Node
echo.
echo Nettoyage des anciens processus...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo [OK] Anciens processus arretes

REM Installer les dépendances si nécessaire
echo.
echo Verification des dependances...

if not exist "server-new\node_modules\" (
    echo Installation des dependances backend...
    cd server-new
    call npm install
    cd ..
)

if not exist "client\node_modules\" (
    echo Installation des dependances frontend...
    cd client
    call npm install
    cd ..
)

echo [OK] Dependances installees

REM Créer le dossier db si nécessaire
if not exist "db\" mkdir db

REM Lancer le backend dans une nouvelle fenêtre
echo.
echo Demarrage du backend...
start "Reviews-Maker Backend" cmd /k "cd /d %~dp0server-new && npm start"
timeout /t 5 /nobreak >nul

REM Lancer le frontend dans une nouvelle fenêtre
echo Demarrage du frontend...
start "Reviews-Maker Frontend" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ================================================================
echo            REVIEWS-MAKER EST PRET !
echo ================================================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Les serveurs tournent dans des fenetres separees
echo Fermez les fenetres pour arreter les serveurs
echo.
echo Ouverture du navigateur dans 3 secondes...

timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo Appuyez sur une touche pour fermer cette fenetre
echo (Les serveurs continueront de tourner)
pause >nul

exit /b 0
