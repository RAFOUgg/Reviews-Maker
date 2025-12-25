@echo off
REM Script d'ouverture de la page de test Phase 2
REM Reviews-Maker - Test Suite Interactive

echo ========================================
echo   Reviews-Maker - Test Suite
echo   Phase 2: OAuth ^& Account System
echo ========================================
echo.

REM Verifier si le serveur tourne
echo [1/2] Verification du serveur...
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo   - Serveur Node.js detecte ^(OK^)
) else (
    echo   - ATTENTION: Aucun serveur Node.js detecte
    echo   - Lancez START_SERVER.bat d'abord !
    echo.
    choice /C YN /M "Continuer quand meme"
    if errorlevel 2 exit /b
)

REM Ouvrir la page de test
echo.
echo [2/2] Ouverture de la page de test...
start msedge "%~dp0test-phase2.html"

if %errorlevel% equ 0 (
    echo   - Page de test ouverte dans Edge
) else (
    echo   - Ouverture dans le navigateur par defaut...
    start "" "%~dp0test-phase2.html"
)

echo.
echo ========================================
echo   Page de test lancee
echo ========================================
echo.
echo Instructions:
echo 1. Verifiez les statuts en haut de la page
echo 2. Suivez le guide: GUIDE_TEST_PHASE2.md
echo 3. Commencez par Test 1: Verification Etat Systeme
echo.
echo Bon test !
echo ========================================

timeout /t 3 /nobreak >nul
