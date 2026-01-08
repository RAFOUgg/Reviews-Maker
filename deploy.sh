#!/bin/bash
# Script de déploiement automatique Reviews-Maker
# Usage: ./deploy.sh

set -e  # Arrêt si erreur

echo "🚀 Démarrage du déploiement Reviews-Maker..."

# 1. Pull dernières modifications
echo "📥 Pull des modifications GitHub..."
cd /home/ubuntu/Reviews-Maker
git checkout main
git reset --hard origin/main
git pull --rebase origin main

# 2. Build client
echo "🔨 Build du client React..."
cd client
rm -rf dist node_modules/.vite
npm run build

# 3. Copie vers Nginx
echo "📦 Copie des fichiers vers Nginx..."
sudo rm -rf /var/www/reviews-maker/client/dist
sudo cp -r dist /var/www/reviews-maker/client/
sudo chown -R www-data:www-data /var/www/reviews-maker/client/dist

# 4. Restart backend (si schema Prisma modifié)
echo "🔄 Vérification Prisma..."
cd /home/ubuntu/Reviews-Maker/server-new
if [ -f "prisma/schema.prisma" ]; then
    npx prisma generate
    # npx prisma migrate deploy  # Décommenter si migration nécessaire
fi

# 5. Restart serveur
echo "♻️  Redémarrage serveur Node..."
/home/ubuntu/.nvm/versions/node/v24.11.1/bin/pm2 restart reviews-maker

# 6. Reload Nginx
echo "🌐 Rechargement Nginx..."
sudo systemctl reload nginx

echo "✅ Déploiement terminé avec succès !"
echo "🌐 Vérifiez sur https://terpologie.eu"
echo "💡 Pensez à vider le cache navigateur (Ctrl+Shift+R)"
