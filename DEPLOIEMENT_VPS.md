# 🚀 Déploiement sur VPS - Reviews-Maker v2.0

## 📋 Prérequis VPS

- Ubuntu/Debian Linux
- Node.js 18+ installé
- PM2 installé globalement (`npm install -g pm2`)
- Nginx installé
- Git configuré avec accès au repo

## 🔑 Étape 1 : Connexion SSH au VPS

```bash
ssh vps-lafoncedalle
# ou
ssh user@your-vps-ip
```

## 📥 Étape 2 : Pull depuis GitHub

```bash
# Aller dans le dossier du projet
cd /path/to/Reviews-Maker

# Pull les dernières modifications depuis la bonne branche
git fetch origin
git checkout prod/from-vps-2025-10-28
git pull origin prod/from-vps-2025-10-28
```

**⚠️ IMPORTANT** : Les changements de la refonte sont sur la branche `prod/from-vps-2025-10-28`, **PAS** sur `main` !

## ⚙️ Étape 3 : Configuration Backend

```bash
cd server-new

# Créer le fichier .env si pas déjà fait
nano .env
```

**Contenu du .env :**
```env
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

DATABASE_URL="file:../db/reviews.sqlite"

DISCORD_CLIENT_ID=your_production_client_id
DISCORD_CLIENT_SECRET=your_production_client_secret
DISCORD_CALLBACK_URL=https://your-domain.com/api/auth/discord/callback

SESSION_SECRET=your_super_secret_random_string_here_minimum_32_chars
```

**🔴 IMPORTANT** : Mettre à jour l'URL de callback Discord dans Discord Developer Portal :
- Aller sur https://discord.com/developers/applications
- Sélectionner votre application
- OAuth2 → Redirects → Ajouter `https://your-domain.com/api/auth/discord/callback`

## 📦 Étape 4 : Installation & Build

```bash
# Installation backend
cd server-new
npm ci --production
npx prisma generate
npx prisma migrate deploy

# Installation et build frontend
cd ../client
npm ci
npm run build
```

## 🔄 Étape 5 : Arrêter l'ancien serveur

```bash
# Lister les processus PM2
pm2 list

# Arrêter l'ancien serveur (si existe)
pm2 stop all
pm2 delete all
```

## 🚀 Étape 6 : Lancer le nouveau serveur

```bash
# Depuis la racine du projet
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # Suivre les instructions affichées
```

## 🌐 Étape 7 : Configuration Nginx

```bash
# Éditer la config Nginx
sudo nano /etc/nginx/sites-available/reviews-maker
```

**Contenu recommandé :**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend React (build Vite)
    root /path/to/Reviews-Maker/client/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Images uploadées
    location /images/ {
        alias /path/to/Reviews-Maker/db/review_images/;
        expires 30d;
    }
}
```

**Activer et recharger :**
```bash
sudo ln -s /etc/nginx/sites-available/reviews-maker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Étape 8 : SSL avec Let's Encrypt (Optionnel mais recommandé)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## ✅ Étape 9 : Vérification

```bash
# Vérifier que PM2 tourne
pm2 status
pm2 logs reviews-backend

# Tester l'API
curl http://localhost:3000/api/health

# Tester le frontend
curl -I https://your-domain.com
```

## 🐛 Troubleshooting

### Le serveur PM2 ne démarre pas

```bash
cd server-new
node server.js  # Lancer manuellement pour voir les erreurs
```

Vérifier :
- ✅ Fichier `.env` existe et contient toutes les variables
- ✅ Base de données accessible : `ls -la ../db/reviews.sqlite`
- ✅ Port 3000 libre : `lsof -i :3000`

### Erreur "Cannot find module"

```bash
cd server-new
rm -rf node_modules package-lock.json
npm install --production
npx prisma generate
```

### Le frontend ne charge pas

Vérifier Nginx :
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Les images ne s'affichent pas

```bash
# Vérifier les permissions
sudo chown -R www-data:www-data /path/to/Reviews-Maker/db/review_images/
sudo chmod -R 755 /path/to/Reviews-Maker/db/review_images/
```

## 🔄 Mise à jour future

```bash
cd /path/to/Reviews-Maker

# Pull dernières modifs
git pull origin prod/from-vps-2025-10-28

# Utiliser le script de déploiement
chmod +x deploy.sh
./deploy.sh production
```

## 📊 Monitoring

```bash
# Logs en temps réel
pm2 logs reviews-backend

# Redémarrer
pm2 restart reviews-backend

# Arrêter
pm2 stop reviews-backend

# Statistiques
pm2 monit
```

---

## 🎯 Checklist Déploiement

- [ ] SSH connecté au VPS
- [ ] Git pull sur branche `prod/from-vps-2025-10-28`
- [ ] `.env` créé dans `server-new/` avec credentials production
- [ ] Discord OAuth2 callback URL mis à jour
- [ ] `npm ci` backend + `npx prisma migrate deploy`
- [ ] `npm ci` + `npm run build` frontend
- [ ] PM2 lancé avec `ecosystem.config.cjs`
- [ ] Nginx configuré et rechargé
- [ ] SSL configuré (Let's Encrypt)
- [ ] Tests : API `/api/health` + frontend accessible
- [ ] PM2 `pm2 save` + `pm2 startup`

---

**Une fois tout configuré, ton app sera accessible sur `https://your-domain.com` ! 🎉**
