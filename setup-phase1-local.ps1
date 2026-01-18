# setup-phase1-local.ps1
# Script de setup pour Phase 1 FLEURS en développement local (Windows)
# Automatise: Migration DB, Seed données, démarrage serveurs

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Green
Write-Host "🚀 Phase 1 FLEURS Local Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# ========================================
# STEP 1: Check prerequisites
# ========================================
Write-Host "1️⃣  Checking prerequisites..." -ForegroundColor Blue

# Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm -v
    Write-Host "✓ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# STEP 2: Install dependencies
# ========================================
Write-Host "2️⃣  Installing dependencies..." -ForegroundColor Blue

Write-Host "Backend dependencies..."
Push-Location server-new
npm install --legacy-peer-deps 2>$null
Pop-Location

Write-Host "Frontend dependencies..."
Push-Location client
npm install --legacy-peer-deps 2>$null
Pop-Location

Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# ========================================
# STEP 3: Setup environment files
# ========================================
Write-Host "3️⃣  Setting up environment variables..." -ForegroundColor Blue

# Backend .env
$serverEnvPath = "server-new\.env"
if (!(Test-Path $serverEnvPath)) {
    Write-Host "Creating server-new\.env..."
    $env_content = @"
# Database
DATABASE_URL="file:./dev.db"

# Session
SESSION_SECRET="local-dev-secret-change-in-prod"

# Auth
JWT_SECRET="local-jwt-secret-change-in-prod"
REFRESH_TOKEN_SECRET="local-refresh-secret-change-in-prod"

# OAuth (optional for dev)
OAUTH_GOOGLE_ID=""
OAUTH_GOOGLE_SECRET=""
OAUTH_GITHUB_ID=""
OAUTH_GITHUB_SECRET=""

# Email (optional for dev)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# File Upload
UPLOAD_DIR="./db"
MAX_FILE_SIZE=10485760

# App
NODE_ENV="development"
PORT=3001
CLIENT_URL="http://localhost:5173"
"@
    $env_content | Out-File -FilePath $serverEnvPath -Encoding UTF8
    Write-Host "✓ server-new\.env created" -ForegroundColor Green
} else {
    Write-Host "⚠️  server-new\.env already exists" -ForegroundColor Yellow
}

# Frontend .env
$clientEnvPath = "client\.env.local"
if (!(Test-Path $clientEnvPath)) {
    Write-Host "Creating client\.env.local..."
    $client_env = @"
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="Reviews-Maker"
"@
    $client_env | Out-File -FilePath $clientEnvPath -Encoding UTF8
    Write-Host "✓ client\.env.local created" -ForegroundColor Green
} else {
    Write-Host "⚠️  client\.env.local already exists" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# STEP 4: Database migration
# ========================================
Write-Host "4️⃣  Running database migration..." -ForegroundColor Blue

Push-Location server-new

Write-Host "Generating Prisma Client..."
npx prisma generate

Write-Host "Running migrations..."
try {
    npx prisma migrate deploy
} catch {
    Write-Host "Deploying initial migration..."
    npx prisma migrate dev --name "Initial migration"
}

Write-Host "✓ Database migrated" -ForegroundColor Green

Pop-Location
Write-Host ""

# ========================================
# STEP 5: Seed data
# ========================================
Write-Host "5️⃣  Seeding Phase 1 FLEURS test data..." -ForegroundColor Blue

Write-Host "Running seed script..."
Push-Location server-new
node seed-phase1-fleurs.js
Pop-Location

Write-Host ""

# ========================================
# STEP 6: Summary and next steps
# ========================================
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Test User Credentials:" -ForegroundColor Cyan
Write-Host "   Email: producer@test-reviews-maker.local"
Write-Host "   Password: test-producer-123"
Write-Host ""

Write-Host "🚀 To start development servers:" -ForegroundColor Cyan
Write-Host ""

Write-Host "   Terminal 1 (Backend):" -ForegroundColor Yellow
Write-Host "   cd server-new && npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "   Terminal 2 (Frontend):" -ForegroundColor Yellow
Write-Host "   cd client && npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 Then open:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173" -ForegroundColor Gray
Write-Host ""

Write-Host "🧪 To run tests:" -ForegroundColor Cyan
Write-Host "   npm test" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   - Tests: cat TEST_SUITE_DOCUMENTATION.md" -ForegroundColor Gray
Write-Host ""

Write-Host "💡 Tip: Open multiple PowerShell tabs and run the commands above in each" -ForegroundColor Magenta
