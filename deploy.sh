#!/bin/bash

# Script de déploiement Reviews-Maker v2.0
# Usage: ./deploy.sh [production|staging]

set -e

ENV=${1:-production}

echo "🚀 Déploiement Reviews-Maker - Environnement: $ENV"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Étape 1: Pull dernières modifications${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
git pull origin prod/from-vps-2025-10-28

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Étape 2: Installation dépendances Backend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd server-new
npm ci --production
npx prisma generate
npx prisma migrate deploy
cd ..

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Étape 3: Build Frontend${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
cd client
npm ci
npm run build
cd ..

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Étape 4: Backup base de données${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
BACKUP_FILE="db/backups/reviews-$(date +%Y%m%d-%H%M%S).sqlite"
mkdir -p db/backups
cp db/reviews.sqlite "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup créé: $BACKUP_FILE${NC}"

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📦 Étape 5: Redémarrage PM2${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ "$ENV" = "production" ]; then
  pm2 restart reviews-backend --env production || pm2 start ecosystem.config.cjs --env production
else
  pm2 restart reviews-backend || pm2 start ecosystem.config.cjs
fi

pm2 save

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DÉPLOIEMENT TERMINÉ !${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Vérifier les logs:${NC}"
echo -e "   pm2 logs reviews-backend"
echo -e "${YELLOW}📈 Statut PM2:${NC}"
echo -e "   pm2 status"
echo -e "${YELLOW}🌐 Application accessible sur:${NC}"
echo -e "   http://localhost:3000 (Backend)"
echo -e "   Configurer Nginx pour servir client/dist (Frontend)"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
