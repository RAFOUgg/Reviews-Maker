#!/bin/bash
# 🚀 DÉPLOIEMENT EXPRESS - À EXÉCUTER SUR LE VPS

echo "🚀 Déploiement Reviews-Maker..."

# ADAPTER CES 2 LIGNES SELON VOTRE CONFIG
PROJECT_DIR="/var/www/Reviews-Maker"
PM2_APP="reviews-maker"

cd $PROJECT_DIR
git pull origin feat/templates-backend
cd client
npm install
npm run build
cd ..
pm2 restart $PM2_APP
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Déploiement terminé !"
echo "⚠️  Videz le cache navigateur (Ctrl+Shift+R) !"
