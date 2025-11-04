@echo off
title Reviews-Maker - Acces reseau local
color 0B

echo.
echo ========================================
echo    REVIEWS-MAKER v2.0
echo    Acces reseau local
echo ========================================
echo.
echo Recherche de ton adresse IP locale...
echo.

:: Trouver l'adresse IP locale
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)

:found
:: Enlever les espaces
set IP=%IP: =%

echo Ton adresse IP locale : %IP%
echo.
echo Pour acceder depuis un autre appareil
echo sur le meme reseau WiFi :
echo.
echo   http://%IP%:5173
echo.
echo ========================================
echo.
echo Ouvrir dans le navigateur ?
pause

start http://%IP%:5173
