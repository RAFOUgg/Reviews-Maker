@echo off
title Reviews-Maker - Installation demarrage automatique
color 0B

echo.
echo ========================================
echo    REVIEWS-MAKER v2.0
echo    Installation demarrage auto
echo ========================================
echo.
echo Ce script va creer un raccourci dans le
echo dossier Demarrage de Windows.
echo.
echo Le site se lancera automatiquement
echo a chaque demarrge de ton PC.
echo.
pause

:: Creer le raccourci dans le dossier Demarrage
set SCRIPT_PATH=%~dp0START_DEV_AUTO.bat
set STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

echo.
echo Creation du raccourci...

:: Utiliser PowerShell pour creer un raccourci propre
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%STARTUP_FOLDER%\Reviews-Maker.lnk'); $s.TargetPath = '%SCRIPT_PATH%'; $s.WorkingDirectory = '%~dp0'; $s.WindowStyle = 7; $s.Description = 'Demarrage automatique Reviews-Maker'; $s.Save()"

if exist "%STARTUP_FOLDER%\Reviews-Maker.lnk" (
    echo.
    echo ========================================
    echo    INSTALLATION REUSSIE !
    echo ========================================
    echo.
    echo Le raccourci a ete cree dans :
    echo %STARTUP_FOLDER%
    echo.
    echo Au prochain demarrage de Windows,
    echo Reviews-Maker se lancera automatiquement !
    echo.
    echo Pour desactiver : supprime le fichier
    echo "Reviews-Maker.lnk" dans le dossier Demarrage
    echo.
) else (
    echo.
    echo ERREUR : Impossible de creer le raccourci
    echo.
)

pause
