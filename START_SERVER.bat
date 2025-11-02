@echo off
echo ========================================
echo   Reviews Maker - Demarrage Serveur
echo ========================================
echo.

cd /d "%~dp0server"

echo [1/3] Verification de Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe!
    echo Telechargez Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo   OK - Node.js trouve

echo.
echo [2/3] Verification des dependances...
if not exist "node_modules\" (
    echo Installation des dependances...
    call npm install
    if %errorlevel% neq 0 (
        echo ERREUR: Installation des dependances echouee
        pause
        exit /b 1
    )
)
echo   OK - Dependances installees

echo.
echo [3/3] Demarrage du serveur...
echo.
echo ========================================
echo   Serveur demarre sur:
echo   http://localhost:3000
echo ========================================
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

npm start

pause
