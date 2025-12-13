#!/bin/bash
# REVIEWS-MAKER MVP - Script de déploiement automatique complet
# Version: 1.0.0

set -e

echo "🚀 =================================="
echo "   REVIEWS-MAKER MVP"
echo "   Déploiement automatique"
echo "===================================="
echo ""

# Configuration
REMOTE_USER="ubuntu"
REMOTE_HOST="vps-lafoncedalle"
REMOTE_DIR="/home/ubuntu/Reviews-Maker"
LOCAL_DIR="$(pwd)"
BRANCH="feat/mvp-v1"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Étape 1/8 : Vérification branche Git...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo -e "${YELLOW}⚠️  Création de la branche $BRANCH...${NC}"
    git checkout -b $BRANCH 2>/dev/null || git checkout $BRANCH
fi
echo -e "${GREEN}✅ Branche: $CURRENT_BRANCH${NC}"

echo ""
echo -e "${BLUE}📦 Étape 2/8 : Build du client React...${NC}"
cd client
npm run build
echo -e "${GREEN}✅ Build client terminé${NC}"

echo ""
echo -e "${BLUE}📝 Étape 3/8 : Commit des modifications...${NC}"
cd ..
git add .
git commit -m "feat(mvp): Phase 1 MVP - Design System + Auth améliorée

✨ Nouveautés:
- Système de thème V2 (6 thèmes Liquid Glass)
- Composants UI: LiquidButton, LiquidModal, LiquidCard, LiquidInput
- LoginPage refonte complète avec nouveau design
- Configuration accountFeatures (Amateur/Influenceur/Producteur)
- Store 2FA (préparation authentification renforcée)
- ThemeSwitcher dans navbar
- Transitions fluides et animations Framer Motion

🎨 Design:
- Glassmorphism Apple-like partout
- Variables CSS thématiques
- Responsive mobile/desktop

📦 MVP Features:
- Authentification email/OAuth améliorée
- Base pour pipelines (à venir)
- Base pour exports avancés (à venir)

Prochaine étape: Implémentation pipelines + exports" || echo "Rien à commiter"
echo -e "${GREEN}✅ Commit créé${NC}"

echo ""
echo -e "${BLUE}🌐 Étape 4/8 : Push vers GitHub...${NC}"
git push origin $BRANCH -f
echo -e "${GREEN}✅ Push réussi${NC}"

echo ""
echo -e "${BLUE}🔐 Étape 5/8 : Connexion SSH au VPS...${NC}"
ssh $REMOTE_HOST << 'ENDSSH'
    set -e
    cd /home/ubuntu/Reviews-Maker
    
    echo "📥 Pull des modifications..."
    git fetch origin
    git checkout feat/mvp-v1 || git checkout -b feat/mvp-v1 origin/feat/mvp-v1
    git pull origin feat/mvp-v1
    
    echo "📦 Build client sur le serveur..."
    cd client
    npm install --production=false
    npm run build
    
    echo "📋 Copie vers Nginx..."
    sudo rm -rf /var/www/reviews-maker/client/dist
    sudo cp -r dist /var/www/reviews-maker/client/
    sudo chown -R www-data:www-data /var/www/reviews-maker/client/dist
    
    echo "🔄 Restart PM2..."
    cd ../server-new
    /home/ubuntu/.nvm/versions/node/v24.11.1/bin/pm2 restart reviews-maker
    
    echo "🌐 Reload Nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Déploiement VPS terminé !"
ENDSSH

echo ""
echo -e "${GREEN}✅ =================================="
echo "   DÉPLOIEMENT RÉUSSI !"
echo "====================================${NC}"
echo ""
echo -e "${BLUE}🌐 Application disponible sur:${NC}"
echo "   https://terpologie.eu"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "   1. Vider le cache navigateur (Ctrl+Shift+R)"
echo "   2. Tester les 6 thèmes"
echo "   3. Tester login email + OAuth"
echo ""
echo -e "${BLUE}📝 Prochaines étapes MVP:${NC}"
echo "   - Pipelines de culture/curing"
echo "   - Exports avancés avec templates"
echo "   - 2FA fonctionnel"
echo ""
