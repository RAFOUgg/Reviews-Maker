#!/bin/bash
# Script de déploiement rapide pour VPS
# Usage: ./deploy.sh [branche]

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Déterminer le répertoire du projet
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# Branche par défaut
BRANCH="${1:-main}"

echo -e "${GREEN}🚀 DÉPLOIEMENT REVIEWS-MAKER${NC}"
echo "======================================"
echo -e "${YELLOW}📂 Répertoire: ${PROJECT_DIR}${NC}"
echo -e "${YELLOW}🔀 Branche: ${BRANCH}${NC}"
echo ""

cd "$PROJECT_DIR"

# Nettoyer les modifications locales du deploy.sh
git stash > /dev/null 2>&1 || true

# 1. Pull
echo -e "${GREEN}[1/5] Pull des dernières modifications...${NC}"
git fetch origin
git pull origin "$BRANCH"
echo -e "${GREEN}✅ Pull terminé${NC}"
echo ""

# 2. Client - dépendances
echo -e "${GREEN}[2/5] Installation dépendances client...${NC}"
cd client
npm install 2>&1 | grep -E "(added|up to date|removed)" || true
echo -e "${GREEN}✅ Client dépendances installées${NC}"
echo ""

# 3. Client - build
echo -e "${YELLOW}[3/5] 🔨 Build client...${NC}"
npm run build
echo -e "${GREEN}✅ Build client terminé${NC}"
echo ""

# 4. Serveur - dépendances
echo -e "${GREEN}[4/5] Installation dépendances serveur...${NC}"
cd ../server-new
npm install 2>&1 | grep -E "(added|up to date|removed)" || true
echo -e "${GREEN}✅ Serveur dépendances installées${NC}"
echo ""

# 5. Redémarrage
echo -e "${YELLOW}[5/5] 🔄 Redémarrage avec PM2...${NC}"

# Utiliser PM2 local du projet si disponible
PM2_BIN="${PROJECT_DIR}/server-new/node_modules/.bin/pm2"

if [ -f "$PM2_BIN" ]; then
    $PM2_BIN restart reviews-maker || $PM2_BIN start ecosystem.config.cjs --name reviews-maker
    echo -e "${GREEN}✅ Serveur redémarré avec PM2 local${NC}"
elif command -v pm2 &> /dev/null; then
    pm2 restart reviews-maker || pm2 start ecosystem.config.cjs
    echo -e "${GREEN}✅ Serveur redémarré avec PM2 global${NC}"
else
    echo -e "${RED}⚠️  PM2 non trouvé - redémarrage manuel nécessaire${NC}"
    echo -e "${YELLOW}   Installez PM2: npm install -g pm2${NC}"
fi
echo ""

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✨ DÉPLOIEMENT TERMINÉ${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "Vérifiez l'app: ${YELLOW}curl http://localhost:5173${NC}"
echo -e "Logs: ${YELLOW}pm2 logs reviews-maker${NC}"
