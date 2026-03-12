# ====================
# SETUP DEV LOCAL (Windows PowerShell)
# ====================
# Setup complet pour développement local sans VPS

Write-Host ""
Write-Host "🚀 Setup développement local Reviews-Maker" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "server-new/server.js")) {
    Write-Host "❌ Erreur: Exécute ce script depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# 1. Create .env if it doesn't exist
Write-Host ""
Write-Host "📝 Configuration du fichier .env..." -ForegroundColor Yellow

if (-not (Test-Path "server-new/.env")) {
    Write-Host "  Création de server-new/.env"
    
    $secret = & node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    
    $envContent = @"
# Discord OAuth2
DISCORD_CLIENT_ID=1435040931375091825
DISCORD_CLIENT_SECRET=9OSG60zxCD7gM4B3d3fnsXRKuphdj-cR
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# Google OAuth
GOOGLE_CLIENT_ID=732826204124-5fsssadqh8j86hgp3f0uegrfgq1kfeva.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Session
SESSION_SECRET=$secret
NODE_ENV=development

# Database
DATABASE_URL=file:./reviews.sqlite

# Server
PORT=3000

# Frontend URL
FRONTEND_URL=http://localhost:5173
"@
    
    Set-Content -Path "server-new/.env" -Value $envContent -Encoding UTF8
    Write-Host "✅ .env créé" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env existe déjà" -ForegroundColor Yellow
}

# 2. Install backend dependencies
Write-Host ""
Write-Host "📦 Installation des dépendances serveur..." -ForegroundColor Yellow

if (-not (Test-Path "server-new/node_modules")) {
    Push-Location "server-new"
    npm install
    Pop-Location
    Write-Host "✅ Dépendances serveur installées" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules/serveur existe déjà" -ForegroundColor Yellow
}

# 3. Install frontend dependencies
Write-Host ""
Write-Host "📦 Installation des dépendances client..." -ForegroundColor Yellow

if (-not (Test-Path "client/node_modules")) {
    Push-Location "client"
    npm install
    Pop-Location
    Write-Host "✅ Dépendances client installées" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules/client existe déjà" -ForegroundColor Yellow
}

# 4. Setup database
Write-Host ""
Write-Host "🗄️  Initialisation de la base de données..." -ForegroundColor Yellow

Push-Location "server-new"
npm run prisma:generate
npm run prisma:migrate
Pop-Location
Write-Host "✅ Base de données initialisée" -ForegroundColor Green

# 5. Summary
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup terminé avec succès!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Démarrage des serveurs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1 - Backend:" -ForegroundColor Yellow
Write-Host "  cd server-new && node --watch server.js" -ForegroundColor Gray
Write-Host ""
Write-Host "Terminal 2 - Frontend:" -ForegroundColor Yellow
Write-Host "  cd client && npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "Puis ouvre: http://localhost:5174/login" -ForegroundColor Cyan
Write-Host "Clique sur '🚀 Dev Quick Login'" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Bonne développement!" -ForegroundColor Green
Write-Host ""
