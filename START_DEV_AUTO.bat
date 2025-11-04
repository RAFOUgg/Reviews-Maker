@echo off
title Reviews-Maker - Demarrage automatique
color 0A

echo.
echo ========================================
echo    REVIEWS-MAKER v2.0
echo    Demarrage automatique
echo ========================================
echo.

:: Aller dans le dossier du projet
cd /d "%~dp0"

:: Verifier si Node.js est installe
where node >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Node.js n'est pas installe ou pas dans le PATH
    echo Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

:: Verifier si les dossiers existent
if not exist "server-new" (
    echo [ERREUR] Le dossier server-new n'existe pas
    pause
    exit /b 1
)

if not exist "client" (
    echo [ERREUR] Le dossier client n'existe pas
    pause
    exit /b 1
)

:: Demarrer le backend en arriere-plan
echo [1/3] Demarrage du backend Express...
start "Reviews-Backend" /min cmd /c "cd server-new && npm run dev"
timeout /t 5 /nobreak >nul

:: Demarrer le frontend en arriere-plan
echo [2/3] Demarrage du frontend React...
start "Reviews-Frontend" /min cmd /c "cd client && npm run dev"
timeout /t 8 /nobreak >nul

:: Ouvrir le navigateur automatiquement
echo [3/3] Ouverture du navigateur...
timeout /t 2 /nobreak >nul

:: Essayer le port 5173 d'abord, puis 5174 si necessaire
start http://localhost:5173
timeout /t 1 /nobreak >nul

echo.
echo ========================================
echo    PRET ! Le site est accessible :
echo    http://localhost:5173
echo    (ou http://localhost:5174 si 5173 occupe)
echo ========================================
echo.
echo Les serveurs tournent en arriere-plan.
echo Ferme cette fenetre quand tu veux.
echo.
pause
