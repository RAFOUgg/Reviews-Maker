@echo off
REM Reviews-Maker - Démarrage automatique développement
REM Ce script lance le backend et le frontend en arrière-plan

echo.
echo ╔══════════════════════════════════════════════════════════════════╗
echo ║  🌿 Reviews-Maker - Démarrage automatique                        ║
echo ╚══════════════════════════════════════════════════════════════════╝
echo.

REM Aller dans le dossier du projet
cd /d "%~dp0"

echo 📦 Démarrage du backend Express...
start "Reviews-Backend" cmd /k "cd server-new && npm run dev"

REM Attendre 3 secondes que le backend démarre
timeout /t 3 /nobreak >nul

echo 🎨 Démarrage du frontend React...
start "Reviews-Frontend" cmd /k "cd client && npm run dev"

echo.
echo ✅ Services lancés :
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:5173
echo.
echo 🌐 Accès réseau local :
echo    Depuis un autre PC : http://[TON_IP]:5173
echo    Trouve ton IP : ipconfig
echo.
echo 💡 Les fenêtres peuvent être réduites mais NE PAS les fermer !
echo.

REM Attendre 5 secondes avant de fermer cette fenêtre
timeout /t 5 /nobreak >nul
exit
