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

:: Demarrer le backend en arriere-plan
echo [1/3] Demarrage du backend Express...
start "Reviews-Backend" /min cmd /c "cd server-new && npm run dev"
timeout /t 3 /nobreak >nul

:: Demarrer le frontend en arriere-plan
echo [2/3] Demarrage du frontend React...
start "Reviews-Frontend" /min cmd /c "cd client && npm run dev"
timeout /t 5 /nobreak >nul

:: Ouvrir le navigateur automatiquement
echo [3/3] Ouverture du navigateur...
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo    PRET ! Le site est accessible :
echo    http://localhost:5173
echo ========================================
echo.
echo Les serveurs tournent en arriere-plan.
echo Ferme cette fenetre quand tu veux.
echo.
pause
