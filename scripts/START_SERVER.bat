@echo off
REM Script de lancement du serveur Reviews-Maker
REM Phase 2 - OAuth & Account System

echo ========================================
echo   Reviews-Maker - Backend Server
echo   Phase 2: OAuth ^& Account System
echo ========================================
echo.

REM Tuer les processus Node existants
echo [1/3] Arret des processus Node existants...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo   - Processus Node arretes
) else (
    echo   - Aucun processus Node en cours
)

timeout /t 2 /nobreak >nul

REM Se deplacer vers server-new
echo.
echo [2/3] Navigation vers server-new...
cd /d "%~dp0server-new"
if %errorlevel% neq 0 (
    echo   ERREUR: Impossible de trouver le dossier server-new
    pause
    exit /b 1
)
echo   - Repertoire: %cd%

REM Lancer le serveur
echo.
echo [3/3] Demarrage du serveur Node.js...
echo ========================================
echo.
node server.js

REM Si le serveur s'arrete
echo.
echo ========================================
echo   Serveur arrete
echo ========================================
pause
