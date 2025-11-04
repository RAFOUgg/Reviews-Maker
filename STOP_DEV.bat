@echo off
title Reviews-Maker - Arret des services
color 0C

echo.
echo ========================================
echo    REVIEWS-MAKER v2.0
echo    Arret des services
echo ========================================
echo.

echo Arret du backend...
taskkill /FI "WINDOWTITLE eq Reviews-Backend*" /F >nul 2>&1

echo Arret du frontend...
taskkill /FI "WINDOWTITLE eq Reviews-Frontend*" /F >nul 2>&1

echo Arret des processus Node.js...
taskkill /IM node.exe /F >nul 2>&1

echo.
echo ========================================
echo    Services arretes !
echo ========================================
echo.
timeout /t 3 /nobreak >nul
