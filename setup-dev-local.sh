#!/bin/bash

# ====================
# SETUP DEV LOCAL
# ====================
# Setup complet pour développement local sans VPS
# Crée .env, initialise DB avec user test, lance backend + frontend

set -e

echo "🚀 Setup développement local Reviews-Maker"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if we're in the right directory
if [ ! -f "server-new/server.js" ]; then
    echo "❌ Erreur: Exécute ce script depuis la racine du projet"
    exit 1
fi

# 2. Copy .env.example to .env if it doesn't exist
echo -e "${BLUE}📝 Configuration du fichier .env...${NC}"
if [ ! -f "server-new/.env" ]; then
    cp server-new/.env.example server-new/.env
    echo -e "${GREEN}✅ .env créé${NC}"
    
    # Generate SESSION_SECRET
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    
    # Update SESSION_SECRET in .env
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/your_generated_secret_here_64_characters_minimum/$SESSION_SECRET/" server-new/.env
    else
        sed -i "s/your_generated_secret_here_64_characters_minimum/$SESSION_SECRET/" server-new/.env
    fi
    echo -e "${GREEN}✅ SESSION_SECRET généré${NC}"
else
    echo -e "${YELLOW}⚠️  .env existe déjà${NC}"
fi

# 3. Install dependencies if needed
echo -e "${BLUE}📦 Installation des dépendances...${NC}"
if [ ! -d "server-new/node_modules" ]; then
    cd server-new
    npm install
    cd ..
    echo -e "${GREEN}✅ Dépendances serveur installées${NC}"
fi

if [ ! -d "client/node_modules" ]; then
    cd client
    npm install
    cd ..
    echo -e "${GREEN}✅ Dépendances client installées${NC}"
fi

# 4. Setup Prisma
echo -e "${BLUE}🗄️  Configuration Prisma...${NC}"
cd server-new
npm run prisma:generate
npm run prisma:migrate
cd ..
echo -e "${GREEN}✅ Prisma configuré${NC}"

# 5. Seed test user (optional - seeds if seed script exists)
if [ -f "server-new/seed-test-user.js" ]; then
    echo -e "${BLUE}👤 Création de l'utilisateur de test...${NC}"
    cd server-new
    node seed-test-user.js
    cd ..
    echo -e "${GREEN}✅ Utilisateur de test créé${NC}"
else
    echo -e "${YELLOW}⚠️  Script seed-test-user.js non trouvé (optionnel)${NC}"
fi

# 6. Instructions finales
echo -e "${GREEN}
========================================
✅ Setup complété!
========================================

📌 Pour lancer l'app en local:

Terminal 1 - Backend:
  cd server-new
  npm run dev

Terminal 2 - Frontend:
  cd client
  npm run dev

Puis ouvre: http://localhost:5173

🔑 Credentials de test:
  Email: test@example.com
  Mot de passe: test123456

💡 Tips:
  - Les données sont stockées dans db/reviews.sqlite
  - Réinitialiser la DB: rm db/reviews.sqlite && npm run prisma:migrate
  - Consulter la DB: cd server-new && npm run prisma:studio
${NC}"
