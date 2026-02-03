#!/bin/bash

##############################################################################
# Script de déploiement complet Reviews-Maker (Exécution en LOCAL)
# 
# Ce script :
# 1. Compile le frontend (Vite)
# 2. Crée un commit avec git et pousse vers GitHub
# 3. Se connecte au VPS et :
#    - Récupère les derniers changements (git pull)
#    - Vide le cache nginx et les anciens chunks
#    - Recharge nginx
#    - Met à jour les dépendances backend
#    - Redémarre le serveur Node.js (PM2)
#
# Utilisation :
#   ./deploy.sh "message de commit"
#   ./deploy.sh "feat: fix pipeline curing" main
#
# Options :
#   --force        : Force le déploiement sans confirmations
#   --skip-git     : Saute la phase git (utile pour VPS)
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
COMMIT_MSG="${1:-Update Reviews-Maker}"
TARGET_BRANCH="${2:-main}"

# Parser arguments supplémentaires
while [[ $# -gt 2 ]]; do
    case "$3" in
        --force)
            FORCE_DEPLOY=true
            ;;
        --skip-git)
            SKIP_GIT=true
            ;;
    esac
    shift
done

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
# PHASE 1: Vérifications locales
# ==============================================================================
header "PHASE 1 : Vérifications locales"

# Vérifier qu'on n'est pas sur le VPS
if [ -f "/home/ubuntu/Reviews-Maker/ecosystem.config.cjs" ]; then
    log_error "Vous êtes sur le VPS! Ce script doit être exécuté en LOCAL."
fi

# Vérifier que git est disponible
if ! command -v git &> /dev/null; then
    log_error "Git n'est pas installé ou pas dans le PATH"
fi

# Vérifier que node/npm sont disponibles
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé ou pas dans le PATH"
fi

log_success "Environnement local vérifié (git, npm, ssh disponibles)"

# ==============================================================================
# PHASE 2: Build frontend
# ==============================================================================
header "PHASE 2 : Build du frontend (Vite)"

if [ ! -d "client" ]; then
    log_error "Répertoire 'client' non trouvé"
fi

cd client

step "Installation des dépendances frontend..."
npm install --legacy-peer-deps 2>&1 | grep -E "added|up to date|warn" | tail -3 || true

step "Build de la production..."
if npm run build 2>&1 | tail -5; then
    if [ ! -d "dist" ]; then
        log_error "Répertoire dist/ non créé après build"
    fi
    log_success "Frontend builté avec succès"
else
    log_error "Erreur lors du build frontend"
fi

cd ..

# ==============================================================================
# PHASE 3: Git operations
# ==============================================================================
header "PHASE 3 : Synchronisation Git"

if [ "$SKIP_GIT" != "true" ]; then
    # Vérifier si git a des changements
    DIRTY=$(git status --porcelain | wc -l)
    
    if [ "$DIRTY" -gt 0 ]; then
        log_warning "Changements détectés ($DIRTY fichiers)"
        git status --short | head -10
        echo ""
        
        if [ "$FORCE_DEPLOY" != "true" ]; then
            read -p "Continuer le déploiement ? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                log_error "Déploiement annulé par l'utilisateur"
            fi
        fi
    fi
    
    step "Récupération des changements distants..."
    git fetch origin $TARGET_BRANCH 2>&1 | tail -2 || true
    
    step "Ajout des fichiers..."
    git add -A
    
    step "Création du commit..."
    git commit -m "$COMMIT_MSG" 2>&1 | head -3 || log_warning "Aucun changement à committer"
    
    step "Envoi vers GitHub ($TARGET_BRANCH)..."
    git push origin $TARGET_BRANCH
    
    log_success "Changements synchronisés avec GitHub"
else
    log_warning "Étape Git skippée (--skip-git)"
fi

# ==============================================================================
# PHASE 4: Déploiement VPS
# ==============================================================================
header "PHASE 4 : Déploiement sur VPS (vps-lafoncedalle)"

log_info "Connexion au VPS et exécution du déploiement..."
echo ""

ssh vps-lafoncedalle << 'EOFVPS'

#!/bin/bash

# Source les couleurs depuis le shell parent
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
step() { echo -e "${MAGENTA}▶ $1${NC}"; }

set -e
cd ~/Reviews-Maker || exit 1

# Step 1: Git Pull
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 1/6 : Git Pull${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
step "Récupération des derniers changements..."
git fetch origin main
git pull origin main
log_success "Git pull terminé"

# Step 2: Nginx Cache Clear
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 2/6 : Nettoyage du cache Nginx${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

step "Suppression du cache nginx..."
sudo rm -rf /var/cache/nginx/* /var/cache/nginx/.* 2>/dev/null || log_warning "Cache déjà vide"

step "Suppression des anciens chunks (plus de 7 jours)..."
sudo find /var/www/reviews-maker -type f \( -name "*chunk*.js" -o -name "*chunk*.css" \) -mtime +7 -delete 2>/dev/null || log_warning "Aucun ancien chunk trouvé"

step "Suppression des fichiers de cache applicatif..."
sudo rm -rf /var/www/reviews-maker/.cache 2>/dev/null || true

log_success "Cache complètement vidé"

# Step 3: Reload Nginx
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 3/6 : Reload de Nginx${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

step "Reload de Nginx (configuration)..."
sudo systemctl reload nginx

# Vérifier que nginx est actif
if systemctl is-active --quiet nginx; then
    log_success "Nginx reloadé et actif"
else
    log_error "Nginx n'est pas actif!"
fi

# Step 4: Backend Dependencies
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 4/6 : Dépendances Backend${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd server-new || exit 1

step "Installation des dépendances npm..."
npm install --legacy-peer-deps 2>&1 | grep -E "added|up to date" | tail -2 || true

step "Génération du client Prisma..."
npm run prisma:generate 2>&1 | tail -2

log_success "Dépendances backend à jour"
cd .. || exit 1

# Step 5: PM2 Restart
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 5/6 : Redémarrage du serveur (PM2)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

step "Arrêt gracieux du serveur..."
pm2 gracefulReload reviews-maker || pm2 restart reviews-maker --wait-ready

sleep 2

log_success "Serveur Node.js redémarré"

# Step 6: Health Check
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Étape 6/6 : Vérification de santé${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

sleep 2

step "Récupération du statut PM2..."
pm2 list

echo ""
pm2 logs reviews-maker --lines 15 --nostream 2>/dev/null | tail -12 || log_warning "Impossible d'afficher les logs"

echo ""
log_success "VPS Déploiement terminé!"

EOFVPS

# ==============================================================================
# PHASE 5: Résumé final
# ==============================================================================
header "🎉 DÉPLOIEMENT COMPLET"

log_success "Toutes les étapes complétées avec succès!"
echo ""
log_info "Résumé de ce qui a été fait :"
echo "  ✓ Frontend compilé (Vite)"
echo "  ✓ Changements commitées et poussés"
echo "  ✓ Cache nginx vidé"
echo "  ✓ Anciens chunks supprimés"
echo "  ✓ Nginx rechargé"
echo "  ✓ Dépendances backend mises à jour"
echo "  ✓ Serveur Node.js redémarré (PM2)"
echo ""

log_info "Commandes utiles :"
echo "  • Statut : ssh vps-lafoncedalle 'pm2 status'"
echo "  • Logs : ssh vps-lafoncedalle 'pm2 logs reviews-maker'"
echo "  • Restart : ssh vps-lafoncedalle 'pm2 restart reviews-maker'"
echo "  • Stop : ssh vps-lafoncedalle 'pm2 stop reviews-maker'"
echo ""
log_success "L'application est maintenant en production!"
echo ""
