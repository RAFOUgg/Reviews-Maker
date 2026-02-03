#!/bin/bash

# 🚀 QUICK START DEPLOY

# ═══════════════════════════════════════════════════════════════
# MODE 1: DEPUIS LE LOCAL (Recommandé)
# ═══════════════════════════════════════════════════════════════

# Déployer une nouvelle version
./deploy.sh "feat: mon changement"

# Déployer rapidement (sans confirmations)
./deploy.sh "fix: bug fix" --force

# ═══════════════════════════════════════════════════════════════
# MODE 2: DIRECTEMENT SUR LE VPS
# ═══════════════════════════════════════════════════════════════

# Vous êtes SSH sur le VPS, vous voulez mettre à jour ?
./deploy.sh --vps

# ═══════════════════════════════════════════════════════════════
# Ce que le script fait automatiquement
# ═══════════════════════════════════════════════════════════════

# EN LOCAL :
# 1. npm install (frontend)
# 2. npm run build (Vite)
# 3. git add + git commit + git push
# 4. SSH vers VPS et lance le déploiement

# SUR LE VPS :
# 1. git pull
# 2. sudo rm -rf /var/cache/nginx/* (vide le cache)
# 3. sudo systemctl reload nginx
# 4. npm install (backend)
# 5. pm2 restart reviews-maker
# 6. Affiche les logs

# ═══════════════════════════════════════════════════════════════
# VÉRIFICATIONS
# ═══════════════════════════════════════════════════════════════

# Voir les logs en direct
pm2 logs reviews-maker

# Vérifier le statut
pm2 status

# Vérifier la configuration nginx
sudo nginx -t

# ═══════════════════════════════════════════════════════════════
# PLUS D'INFO
# ═══════════════════════════════════════════════════════════════

# Lire le guide complet
cat DEPLOY_GUIDE.md

# Ou voir l'aide du script
head -50 deploy.sh
