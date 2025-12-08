#!/bin/bash
# Script de déploiement automatique pour VPS
# Usage: ./deploy-vps.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 DÉPLOIEMENT REVIEWS-MAKER SUR VPS"
echo "===================================="
echo ""

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration (ADAPTER CES VALEURS)
PROJECT_DIR="/var/www/Reviews-Maker"  # Adapter le chemin
PM2_APP_NAME="reviews-maker"          # Nom de l'app PM2
BRANCH="feat/templates-backend"       # Branche à déployer

echo -e "${YELLOW}📂 Répertoire du projet: ${PROJECT_DIR}${NC}"
echo -e "${YELLOW}🔀 Branche: ${BRANCH}${NC}"
echo ""

# Étape 1 : Navigation et pull
echo -e "${GREEN}[1/6] Pull des dernières modifications...${NC}"
cd "$PROJECT_DIR" || exit 1
git fetch origin
git pull origin "$BRANCH"
echo -e "${GREEN}✅ Pull terminé${NC}"
echo ""

# Étape 2 : Vérification des modifications
echo -e "${GREEN}[2/6] Fichiers modifiés dans ce commit:${NC}"
git log -1 --name-only --pretty=format:"%h - %s" | head -20
echo ""
echo ""

# Étape 3 : Installation des dépendances client
echo -e "${GREEN}[3/6] Installation des dépendances client...${NC}"
cd client
npm install --production
echo -e "${GREEN}✅ Dépendances installées${NC}"
echo ""

# Étape 4 : Build du client (CRITIQUE)
echo -e "${YELLOW}[4/6] 🔨 BUILD de production du client...${NC}"
echo "Cela peut prendre 30-60 secondes..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build réussi${NC}"
    echo "📦 Taille du bundle:"
    du -sh dist/
    echo "📄 Fichiers CSS générés:"
    ls -lh dist/assets/*.css 2>/dev/null || echo "Aucun fichier CSS trouvé"
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    exit 1
fi
echo ""

# Étape 5 : Installation des dépendances serveur
echo -e "${GREEN}[5/6] Installation des dépendances serveur...${NC}"
cd ../server
npm install --production
echo -e "${GREEN}✅ Dépendances serveur installées${NC}"
echo ""

# Étape 6 : Redémarrage PM2
echo -e "${YELLOW}[6/6] Redémarrage de l'application PM2...${NC}"
cd ..
pm2 restart "$PM2_APP_NAME"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application redémarrée${NC}"
    echo ""
    pm2 status "$PM2_APP_NAME"
else
    echo -e "${RED}❌ Erreur lors du redémarrage PM2${NC}"
    echo "Essayez: pm2 start ecosystem.config.cjs --env production"
    exit 1
fi
echo ""

# Étape 7 : Rechargement Nginx (optionnel)
echo -e "${GREEN}[BONUS] Rechargement de Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx rechargé${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx non rechargé (nécessite sudo)${NC}"
fi
echo ""

# Résumé
echo "======================================"
echo -e "${GREEN}✨ DÉPLOIEMENT TERMINÉ !${NC}"
echo "======================================"
echo ""
echo "📋 Prochaines étapes:"
echo "  1. Ouvrir votre site en production"
echo "  2. Forcer le rechargement du cache (Ctrl+Shift+R)"
echo "  3. Tester les 5 thèmes (Violet, Émeraude, Tahiti, Sakura, Minuit)"
echo "  4. Vérifier que tous les éléments sont opaques et lisibles"
echo ""
echo "🔍 Commandes de diagnostic:"
echo "  pm2 logs $PM2_APP_NAME"
echo "  pm2 monit"
echo "  sudo tail -f /var/log/nginx/error.log"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de vider le cache de votre navigateur !${NC}"
