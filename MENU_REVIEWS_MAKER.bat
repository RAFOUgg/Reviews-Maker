@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title Reviews-Maker - Menu Principal

:: Couleurs pour un affichage moderne
color 0B

:MENU
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🎨 REVIEWS-MAKER - MENU PRINCIPAL 🎨                ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.
echo  [1] ⚙️  Activer/Désactiver démarrage automatique
echo  [2] 🌐 Ouvrir le site (lance le serveur si nécessaire)
echo  [3] 🔄 Redémarrer le serveur
echo  [4] 📊 Afficher le statut du serveur
echo  [5] 📝 Ouvrir les logs du serveur
echo  [6] 📱 Accès réseau (mobile/tablette)
echo  [7] 🛑 Arrêter le serveur
echo  [8] 📂 Ouvrir le dossier du projet
echo  [9] 🔧 Installer dépendances (npm install)
echo  [0] ❌ Quitter
echo.
echo ════════════════════════════════════════════════════════════════
echo.

set /p choice="Votre choix : "

if "%choice%"=="1" goto AUTO_START
if "%choice%"=="2" goto OPEN_SITE
if "%choice%"=="3" goto RESTART
if "%choice%"=="4" goto STATUS
if "%choice%"=="5" goto LOGS
if "%choice%"=="6" goto NETWORK
if "%choice%"=="7" goto STOP
if "%choice%"=="8" goto OPEN_FOLDER
if "%choice%"=="9" goto INSTALL_DEPS
if "%choice%"=="0" goto EXIT

echo ❌ Choix invalide. Appuyez sur une touche...
pause >nul
goto MENU

:: ============================================================================
:: OPTION 1 : Activer/Désactiver démarrage automatique
:: ============================================================================
:AUTO_START
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           ⚙️  DÉMARRAGE AUTOMATIQUE                            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_PATH=%STARTUP_DIR%\Reviews-Maker.lnk"

if exist "%SHORTCUT_PATH%" (
    echo 📌 Le démarrage automatique est actuellement ACTIVÉ
    echo.
    echo Voulez-vous le DÉSACTIVER ?
    echo.
    set /p confirm="[O]ui / [N]on : "
    
    if /i "!confirm!"=="O" (
        del "%SHORTCUT_PATH%" 2>nul
        if !errorlevel! equ 0 (
            echo.
            echo ✅ Démarrage automatique DÉSACTIVÉ avec succès
        ) else (
            echo.
            echo ❌ Erreur lors de la désactivation
        )
    ) else (
        echo.
        echo ℹ️  Aucune modification effectuée
    )
) else (
    echo 📌 Le démarrage automatique est actuellement DÉSACTIVÉ
    echo.
    echo Voulez-vous l'ACTIVER ?
    echo.
    set /p confirm="[O]ui / [N]on : "
    
    if /i "!confirm!"=="O" (
        echo.
        echo 🔄 Activation en cours...
        
        powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "$WshShell = New-Object -ComObject WScript.Shell; ^
        $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); ^
        $Shortcut.TargetPath = '%~dp0START_DEV_AUTO.bat'; ^
        $Shortcut.WorkingDirectory = '%~dp0'; ^
        $Shortcut.WindowStyle = 7; ^
        $Shortcut.Description = 'Reviews-Maker Auto Start'; ^
        $Shortcut.Save()"
        
        if !errorlevel! equ 0 (
            echo.
            echo ✅ Démarrage automatique ACTIVÉ avec succès
            echo.
            echo 💡 Le serveur démarrera automatiquement au prochain démarrage du PC
        ) else (
            echo.
            echo ❌ Erreur lors de l'activation
        )
    ) else (
        echo.
        echo ℹ️  Aucune modification effectuée
    )
)

echo.
pause
goto MENU

:: ============================================================================
:: OPTION 2 : Ouvrir le site (avec vérification serveur)
:: ============================================================================
:OPEN_SITE
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🌐 OUVERTURE DU SITE                                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Vérification du serveur...
echo.

:: Vérifier si Node.js est en cours d'exécution
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Le serveur est déjà en cours d'exécution
    echo.
    timeout /t 1 /nobreak >nul
) else (
    echo 🚀 Démarrage du serveur en arrière-plan...
    echo.
    
    :: Lancer le backend en mode caché
    start /min "" cmd /c "cd /d "%~dp0server-new" && npm run dev"
    
    echo ⏳ Attente du démarrage du backend (5 secondes)...
    timeout /t 5 /nobreak >nul
    
    :: Lancer le frontend en mode caché
    start /min "" cmd /c "cd /d "%~dp0client" && npm run dev"
    
    echo ⏳ Attente du démarrage du frontend (3 secondes)...
    timeout /t 3 /nobreak >nul
    
    echo ✅ Serveur démarré avec succès
    echo.
)

echo 🌐 Ouverture du site dans le navigateur...
start "" http://localhost:5173

echo.
echo ✅ Opération terminée
timeout /t 2 /nobreak >nul
goto MENU

:: ============================================================================
:: OPTION 3 : Redémarrer le serveur
:: ============================================================================
:RESTART
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🔄 REDÉMARRAGE DU SERVEUR                            ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 🛑 Arrêt du serveur en cours...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Redémarrage du serveur...
echo.

:: Lancer le backend
start /min "" cmd /c "cd /d "%~dp0server-new" && npm run dev"
echo ✅ Backend démarré

timeout /t 3 /nobreak >nul

:: Lancer le frontend
start /min "" cmd /c "cd /d "%~dp0client" && npm run dev"
echo ✅ Frontend démarré

echo.
echo ✅ Serveur redémarré avec succès
timeout /t 2 /nobreak >nul
goto MENU

:: ============================================================================
:: OPTION 4 : Afficher le statut du serveur
:: ============================================================================
:STATUS
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           📊 STATUT DU SERVEUR                                 ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

:: Vérifier Node.js
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo ✅ Serveur Node.js : EN COURS D'EXÉCUTION
    echo.
    echo 📋 Processus actifs :
    echo.
    tasklist /FI "IMAGENAME eq node.exe" /FO TABLE
) else (
    echo ❌ Serveur Node.js : ARRÊTÉ
)

echo.
echo ════════════════════════════════════════════════════════════════
echo.
echo 🌐 URLs de l'application :
echo    Frontend : http://localhost:5173
echo    Backend  : http://localhost:3000
echo.

:: Vérifier si le port 5173 est écouté
netstat -an | find "5173" >nul
if "%ERRORLEVEL%"=="0" (
    echo ✅ Frontend accessible
) else (
    echo ❌ Frontend non disponible
)

:: Vérifier si le port 3000 est écouté
netstat -an | find "3000" >nul
if "%ERRORLEVEL%"=="0" (
    echo ✅ Backend accessible
) else (
    echo ❌ Backend non disponible
)

echo.
pause
goto MENU

:: ============================================================================
:: OPTION 5 : Ouvrir les logs du serveur
:: ============================================================================
:LOGS
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           📝 LOGS DU SERVEUR                                   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 📂 Recherche des fichiers de logs...
echo.

:: Vérifier et ouvrir les logs backend
if exist "%~dp0server-new\logs" (
    echo ✅ Logs backend trouvés
    start "" explorer "%~dp0server-new\logs"
) else (
    echo ℹ️  Aucun dossier de logs backend trouvé
)

:: Vérifier les logs d'erreur
if exist "%~dp0reviews_error.log.1" (
    echo ✅ Fichier d'erreur trouvé
    start "" notepad "%~dp0reviews_error.log.1"
) else (
    echo ℹ️  Aucun fichier d'erreur trouvé
)

:: Afficher les dernières lignes de console
echo.
echo 💡 Pour voir les logs en temps réel, utilisez l'option [3] pour redémarrer
echo    le serveur dans une fenêtre visible, ou modifiez START_DEV_AUTO.bat
echo.

pause
goto MENU

:: ============================================================================
:: OPTION 6 : Accès réseau (mobile/tablette)
:: ============================================================================
:NETWORK
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           📱 ACCÈS RÉSEAU                                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Détection de votre adresse IP locale...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    set ip=!ip: =!
    if not "!ip!"=="" (
        echo ✅ Adresse IP locale : !ip!
        echo.
        echo 📱 Accédez au site depuis votre mobile/tablette :
        echo.
        echo    http://!ip!:5173
        echo.
        echo 💡 Assurez-vous que votre appareil est sur le même réseau Wi-Fi
        echo.
        
        :: Ouvrir l'URL dans le navigateur
        set /p open="Voulez-vous ouvrir cette URL ? [O]ui / [N]on : "
        if /i "!open!"=="O" (
            start "" http://!ip!:5173
        )
        
        goto :NETWORK_END
    )
)

echo ❌ Impossible de détecter l'adresse IP locale
echo.

:NETWORK_END
pause
goto MENU

:: ============================================================================
:: OPTION 7 : Arrêter le serveur
:: ============================================================================
:STOP
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🛑 ARRÊT DU SERVEUR                                  ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 🛑 Arrêt de tous les processus Node.js...
taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo ✅ Serveur arrêté avec succès
) else (
    echo ℹ️  Aucun serveur en cours d'exécution
)

echo.
timeout /t 2 /nobreak >nul
goto MENU

:: ============================================================================
:: OPTION 8 : Ouvrir le dossier du projet
:: ============================================================================
:OPEN_FOLDER
start "" explorer "%~dp0"
goto MENU

:: ============================================================================
:: OPTION 9 : Installer les dépendances
:: ============================================================================
:INSTALL_DEPS
cls
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║           🔧 INSTALLATION DES DÉPENDANCES                      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo 📦 Installation des dépendances backend...
echo.
cd /d "%~dp0server-new"
call npm install
echo.

echo 📦 Installation des dépendances frontend...
echo.
cd /d "%~dp0client"
call npm install
echo.

echo ✅ Installation terminée
cd /d "%~dp0"
pause
goto MENU

:: ============================================================================
:: EXIT
:: ============================================================================
:EXIT
cls
echo.
echo 👋 Au revoir !
timeout /t 1 /nobreak >nul
exit
