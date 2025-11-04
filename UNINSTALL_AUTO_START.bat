@echo off
title Reviews-Maker - Desinstallation demarrage automatique
color 0E

echo.
echo ========================================
echo    REVIEWS-MAKER v2.0
echo    Desinstallation demarrage auto
echo ========================================
echo.

set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

if exist "%STARTUP_FOLDER%\Reviews-Maker.lnk" (
    echo Suppression du raccourci...
    del "%STARTUP_FOLDER%\Reviews-Maker.lnk"
    echo.
    echo ========================================
    echo    DESINSTALLATION REUSSIE !
    echo ========================================
    echo.
    echo Reviews-Maker ne se lancera plus
    echo automatiquement au demarrage.
    echo.
) else (
    echo.
    echo Le raccourci n'existe pas dans le dossier Demarrage.
    echo Rien a desinstaller.
    echo.
)

pause
