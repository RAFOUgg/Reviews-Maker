#!/bin/bash

# setup-phase1-local.sh
# Script de setup pour Phase 1 FLEURS en développement local
# Automatise: Migration DB, Seed données, démarrage serveurs

set -e

echo "================================"
echo "🚀 Phase 1 FLEURS Local Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ========================================
# STEP 1: Check prerequisites
# ========================================
echo -e "${BLUE}1️⃣ Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
echo -e "${GREEN}✓ npm $(npm -v)${NC}"
echo ""

# ========================================
# STEP 2: Install dependencies
# ========================================
echo -e "${BLUE}2️⃣ Installing dependencies...${NC}"

echo "Backend dependencies..."
cd server-new
npm install --legacy-peer-deps || true
cd ..

echo "Frontend dependencies..."
cd client
npm install --legacy-peer-deps || true
cd ..

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ========================================
# STEP 3: Setup environment files
# ========================================
echo -e "${BLUE}3️⃣ Setting up environment variables...${NC}"

# Backend .env
if [ ! -f server-new/.env ]; then
    echo "Creating server-new/.env..."
    cat > server-new/.env << 'EOF'
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
EOF
    echo -e "${GREEN}✓ server-new/.env created${NC}"
else
    echo -e "${YELLOW}⚠️ server-new/.env already exists${NC}"
fi

# Frontend .env (if needed)
if [ ! -f client/.env.local ]; then
    echo "Creating client/.env.local..."
    cat > client/.env.local << 'EOF'
VITE_API_URL=http://localhost:3001
VITE_APP_NAME="Reviews-Maker"
EOF
    echo -e "${GREEN}✓ client/.env.local created${NC}"
else
    echo -e "${YELLOW}⚠️ client/.env.local already exists${NC}"
fi

echo ""

# ========================================
# STEP 4: Database migration
# ========================================
echo -e "${BLUE}4️⃣ Running database migration...${NC}"

cd server-new

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate

# Run migration
echo "Running migrations..."
npx prisma migrate deploy || npx prisma migrate dev --name "Initial migration"

echo -e "${GREEN}✓ Database migrated${NC}"
echo ""

# ========================================
# STEP 5: Seed data
# ========================================
echo -e "${BLUE}5️⃣ Seeding Phase 1 FLEURS test data...${NC}"

echo "Running seed script..."
node seed-phase1-fleurs.js

echo ""

# ========================================
# STEP 6: Summary and next steps
# ========================================
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

echo "📋 Test User Credentials:"
echo "   Email: producer@test-reviews-maker.local"
echo "   Password: test-producer-123"
echo ""

echo "🚀 To start development servers:"
echo ""
echo "   Terminal 1 (Backend):"
echo "   ${YELLOW}cd server-new && npm run dev${NC}"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   ${YELLOW}cd client && npm run dev${NC}"
echo ""

echo "🌐 Then open:"
echo "   ${YELLOW}http://localhost:5173${NC}"
echo ""

echo "🧪 To run tests:"
echo "   ${YELLOW}npm test${NC}"
echo ""

echo "📚 Documentation:"
echo "   - API: http://localhost:3001/api/docs"
echo "   - Tests: cat TEST_SUITE_DOCUMENTATION.md"
echo ""

cd ..
