#!/bin/bash

##############################################################################
# Script de déploiement complet Reviews-Maker
# 
# Ce script peut être exécuté :
# 1. EN LOCAL : compile frontend + git push + déploie sur VPS
# 2. SUR VPS : git pull + cache clear + nginx reload + PM2 restart
# 
# Utilisation :
#   ./deploy.sh                             # EN LOCAL : demande un message
#   ./deploy.sh "feat: new feature"         # EN LOCAL : message spécifié
#   ./deploy.sh --force                     # EN LOCAL : force sans confirmations
#   ./deploy.sh --vps                       # SUR VPS : déploie directement
#
# Options :
#   --force                 : Force sans demandes
#   --skip-git              : Saute la phase git
#   --vps                   : Force le mode VPS (même en local)
#   --local                 : Force le mode LOCAL (même sur VPS)
##############################################################################

set -e

# Couleurs ANSI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Flags
FORCE_DEPLOY=false
SKIP_GIT=false
FORCE_VPS_MODE=false
FORCE_LOCAL_MODE=false
COMMIT_MSG=""
TARGET_BRANCH="main"

# Parser arguments
for arg in "$@"; do
    case $arg in
        --force)
            FORCE_DEPLOY=true
            ;;
        --skip-git)
            SKIP_GIT=true
            ;;
        --vps)
            FORCE_VPS_MODE=true
            ;;
        --local)
            FORCE_LOCAL_MODE=true
            ;;
        *)
            if [ -z "$COMMIT_MSG" ]; then
                COMMIT_MSG="$arg"
            fi
            ;;
    esac
done

# Si pas de message commit spécifié
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update Reviews-Maker"
fi

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

step() {
    echo -e "${MAGENTA}▶ $1${NC}"
}

# ==============================================================================
# Détecter l'environnement (LOCAL ou VPS)
# ==============================================================================

IS_VPS=false
if [ -d "/home/ubuntu/Reviews-Maker" ]; then
    IS_VPS=true
fi

# Forcer le mode si spécifié
if [ "$FORCE_VPS_MODE" = true ]; then
    IS_VPS=true
elif [ "$FORCE_LOCAL_MODE" = true ]; then
    IS_VPS=false
fi

# ==============================================================================
# MODE LOCAL : Build + Git + Déploie sur VPS
# ==============================================================================

if [ "$IS_VPS" = false ]; then
    
header "🚀 MODE LOCAL : Build + Git + Déploiement VPS"

# PHASE 1: Vérifications locales
header "PHASE 1 : Vérifications locales"

if ! command -v git &> /dev/null; then
    log_error "Git n'est pas installé"
fi

if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
fi

log_success "Git et npm détectés"

# PHASE 2: Build frontend
header "PHASE 2 : Build du frontend (Vite)"

if [ ! -d "client" ]; then
    log_error "Répertoire 'client' non trouvé"
fi

cd client

step "Installation des dépendances frontend..."
npm install --legacy-peer-deps 2>&1 | grep -E "added|up to date" | tail -2 || true

step "Build de la production..."
if npm run build 2>&1 | tail -5; then
    if [ ! -d "dist" ]; then
        log_error "Répertoire dist/ non créé"
    fi
    log_success "Frontend builté avec succès"
else
    log_error "Erreur lors du build"
fi

cd ..

# PHASE 3: Git operations
header "PHASE 3 : Synchronisation Git"

if [ "$SKIP_GIT" != "true" ]; then
    DIRTY=$(git status --porcelain | wc -l)
    
    if [ "$DIRTY" -gt 0 ]; then
        log_warning "Changements détectés ($DIRTY fichiers)"
        git status --short | head -10
        
        if [ "$FORCE_DEPLOY" != "true" ]; then
            echo ""
            read -p "Continuer ? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Annulé"
            fi
        fi
    fi
    
    step "Fetch des changements..."
    git fetch origin $TARGET_BRANCH 2>&1 | tail -1 || true
    
    step "Staging des fichiers..."
    git add -A
    
    step "Commit..."
    git commit -m "$COMMIT_MSG" 2>&1 | head -2 || log_warning "Aucun changement"
    
    step "Push vers GitHub..."
    git push origin $TARGET_BRANCH
    
    log_success "Git synchronisé"
else
    log_warning "Git skippé"
fi

# PHASE 4: Déploiement VPS via SSH
header "PHASE 4 : Déploiement sur VPS via SSH"

log_info "Exécution du déploiement sur VPS..."
ssh vps-lafoncedalle "cd ~/Reviews-Maker && bash deploy.sh --vps" || log_error "Erreur SSH"

header "🎉 DÉPLOIEMENT LOCAL → VPS TERMINÉ"

log_success "Toutes les phases complétées!"
echo ""
log_info "Résumé :"
echo "  ✓ Frontend builté"
echo "  ✓ Changements commitées"
echo "  ✓ Poussé vers GitHub"
echo "  ✓ Déployé sur VPS"
echo ""
log_info "Logs VPS : ssh vps-lafoncedalle 'pm2 logs reviews-maker'"
echo ""

# ==============================================================================
# MODE VPS : Git Pull + Cache Clear + Nginx Reload + PM2 Restart
# ==============================================================================

else

header "🚀 MODE VPS : Déploiement Direct"

# Source NVM si disponible
if [ -s "$HOME/.nvm/nvm.sh" ]; then
    . "$HOME/.nvm/nvm.sh"
fi

# Vérifier que git est disponible
if ! command -v git &> /dev/null; then
    log_error "Git non trouvé"
fi

# PHASE 1: Git Pull
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 1/5 : Git Pull${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

step "Récupération des changements..."
git fetch origin main
git pull origin main
log_success "Git pull terminé"

# PHASE 2: Nginx Cache Clear
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 2/5 : Nettoyage du cache Nginx${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

step "Suppression du cache nginx..."
sudo rm -rf /var/cache/nginx/* 2>/dev/null || log_warning "Cache vide"

step "Nettoyage et copie des fichiers frontend..."
# IMPORTANT: Nettoyer l'ancien dist avant de copier le nouveau
sudo rm -rf /var/www/reviews-maker/client/dist/*
sudo cp -r ~/Reviews-Maker/client/dist/* /var/www/reviews-maker/client/dist/
sudo chown -R www-data:www-data /var/www/reviews-maker/client/dist/

log_success "Cache vidé et frontend déployé"

# PHASE 3: Nginx Reload
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 3/5 : Reload Nginx${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

step "Reload de Nginx..."
sudo systemctl reload nginx

if systemctl is-active --quiet nginx; then
    log_success "Nginx rechargé et actif"
else
    log_error "Nginx n'est pas actif"
fi

# PHASE 4: Backend Dependencies
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 4/5 : Dépendances Backend${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd server-new || exit 1

step "Mise à jour des dépendances..."
npm install --legacy-peer-deps 2>&1 | grep -E "added|up to date" | tail -1 || true

step "Prisma generate..."
npm run prisma:generate 2>&1 | tail -1

step "Prisma migrate (apply pending migrations)..."
npm run prisma:deploy 2>&1 | tail -5

log_success "Backend dépendances à jour"
cd .. || exit 1

# PHASE 5: PM2 Restart
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 5/5 : Redémarrage (PM2)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Chercher PM2 (peut être dans nvm ou node_modules)
PM2_CMD=""
if command -v pm2 &> /dev/null; then
    PM2_CMD="pm2"
elif [ -f "$HOME/.nvm/versions/node/v24.11.1/bin/pm2" ]; then
    PM2_CMD="$HOME/.nvm/versions/node/v24.11.1/bin/pm2"
elif [ -f "$(npm root -g)/pm2/bin/pm2.js" ]; then
    PM2_CMD="node $(npm root -g)/pm2/bin/pm2.js"
fi

if [ -z "$PM2_CMD" ]; then
    log_error "PM2 introuvable. Installez-le : npm install -g pm2"
fi

step "Graceful reload du serveur..."
$PM2_CMD gracefulReload reviews-maker || {
    log_warning "Graceful reload échoué, restart normal..."
    $PM2_CMD restart reviews-maker --wait-ready
}

sleep 2
log_success "PM2 redémarré"

# Vérification santé
echo ""
step "Statut du service..."
$PM2_CMD list || true

echo ""
step "Derniers logs..."
$PM2_CMD logs reviews-maker --lines 10 --nostream 2>/dev/null | tail -8 || true

echo ""
header "✨ DÉPLOIEMENT VPS TERMINÉ"

log_success "Application mise à jour en production!"
echo ""
log_info "Commandes utiles :"
echo "  pm2 status         : vérifier le statut"
echo "  pm2 logs reviews-maker  : voir les logs"
echo "  pm2 restart reviews-maker : redémarrer"
echo ""

fi
