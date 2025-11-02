@echo off
echo ========================================
echo   Reviews Maker - Ouverture Site Local
echo ========================================
echo.

echo Verification du serveur...
netstat -an | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERREUR: Le serveur n'est pas demarre!
    echo.
    echo 1. Executez d'abord: START_SERVER.bat
    echo 2. Attendez que le serveur demarre
    echo 3. Re-executez ce fichier
    echo.
    pause
    exit /b 1
)

echo   OK - Serveur demarre sur port 3000
echo.
echo Ouverture du site dans le navigateur...
start msedge "http://localhost:3000/index.html"

if %errorlevel% neq 0 (
    echo.
    echo Edge n'a pas pu ouvrir, tentative avec Chrome...
    start chrome "http://localhost:3000/index.html"
)

echo.
echo ========================================
echo   Site ouvert: localhost:3000
echo ========================================
echo.

timeout /t 3 >nul
