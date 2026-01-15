@echo off
REM ====================
REM SETUP DEV LOCAL (Windows)
REM ====================
REM Setup complet pour développement local sans VPS
REM Crée .env, initialise DB avec user test, lance backend + frontend

setlocal enabledelayedexpansion

echo.
echo 🚀 Setup développement local Reviews-Maker
echo ==========================================

REM Check if we're in the right directory
if not exist "server-new\server.js" (
    echo ❌ Erreur: Exécute ce script depuis la racine du projet
    exit /b 1
)

REM 1. Copy .env.example to .env if it doesn't exist
echo.
echo 📝 Configuration du fichier .env...
if not exist "server-new\.env" (
    copy server-new\.env.example server-new\.env
    echo ✅ .env créé
    
    REM Generate SESSION_SECRET (using Node)
    for /f "delims=" %%i in ('node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"') do set SESSION_SECRET=%%i
    
    REM Update SESSION_SECRET in .env (using PowerShell for better handling)
    powershell -Command "(Get-Content 'server-new\.env') -replace 'your_generated_secret_here_64_characters_minimum', '%SESSION_SECRET%' | Set-Content 'server-new\.env'"
    echo ✅ SESSION_SECRET généré
) else (
    echo ⚠️  .env existe déjà
)

REM 2. Install dependencies if needed
echo.
echo 📦 Installation des dépendances...
if not exist "server-new\node_modules" (
    cd server-new
    call npm install
    cd ..
    echo ✅ Dépendances serveur installées
)

if not exist "client\node_modules" (
    cd client
    call npm install
    cd ..
    echo ✅ Dépendances client installées
)

REM 3. Setup Prisma
echo.
echo 🗄️  Configuration Prisma...
cd server-new
call npm run prisma:generate
call npm run prisma:migrate
cd ..
echo ✅ Prisma configuré

REM 4. Seed test user (optional)
if exist "server-new\seed-test-user.js" (
    echo.
    echo 👤 Création de l'utilisateur de test...
    cd server-new
    node seed-test-user.js
    cd ..
    echo ✅ Utilisateur de test créé
) else (
    echo.
    echo ⚠️  Script seed-test-user.js non trouvé (optionnel)
)

REM 5. Final instructions
echo.
echo ========================================
echo ✅ Setup complété!
echo ========================================
echo.
echo 📌 Pour lancer l'app en local:
echo.
echo Terminal 1 - Backend:
echo   cd server-new
echo   npm run dev
echo.
echo Terminal 2 - Frontend:
echo   cd client
echo   npm run dev
echo.
echo Puis ouvre: http://localhost:5173
echo.
echo 🔑 Credentials de test:
echo   Email: test@example.com
echo   Mot de passe: test123456
echo.
echo 💡 Tips:
echo   - Les données sont stockées dans db/reviews.sqlite
echo   - Réinitialiser la DB: rm db/reviews.sqlite ^&^& npm run prisma:migrate
echo   - Consulter la DB: cd server-new ^&^& npm run prisma:studio
echo.
echo ========================================

pause
