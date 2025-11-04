@echo off
title Reviews-Maker - Creer raccourci Bureau
color 0B

echo.
echo ========================================
echo    REVIEWS-MAKER v2.0
echo    Creation raccourci Bureau
echo ========================================
echo.

:: Creer un raccourci sur le Bureau
set SCRIPT_PATH=%~dp0START_DEV_AUTO.bat
set DESKTOP=%USERPROFILE%\Desktop

echo Creation du raccourci sur le Bureau...

powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%DESKTOP%\Reviews-Maker.lnk'); $s.TargetPath = '%SCRIPT_PATH%'; $s.WorkingDirectory = '%~dp0'; $s.IconLocation = '%SystemRoot%\System32\imageres.dll,3'; $s.Description = 'Lancer Reviews-Maker'; $s.Save()"

if exist "%DESKTOP%\Reviews-Maker.lnk" (
    echo.
    echo ========================================
    echo    RACCOURCI CREE !
    echo ========================================
    echo.
    echo Un raccourci "Reviews-Maker" a ete cree
    echo sur ton Bureau.
    echo.
    echo Double-clique dessus pour lancer le site !
    echo.
) else (
    echo.
    echo ERREUR : Impossible de creer le raccourci
    echo.
)

pause
