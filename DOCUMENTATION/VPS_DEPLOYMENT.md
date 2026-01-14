# 🚀 Guide de Déploiement VPS - Reviews-Maker

## 📋 Vue d'Ensemble

Guide complet pour déployer et maintenir Reviews-Maker sur le VPS `vps-lafoncedalle`.

**Infrastructure Cible:**
- **Serveur:** Linux (Ubuntu 20.04+)
- **Process Manager:** PM2
- **Web Server:** Nginx
- **Database:** SQLite3 (+ Prisma)
- **SSL/TLS:** Let's Encrypt
- **Monitoring:** PM2 Plus (optionnel)

---

## 🔧 Configuration Initiale du VPS

### 1. Connexion SSH

```bash
# Depuis terminal Windows ou WSL
ssh vps-lafoncedalle

# Ou manuellement avec IP
ssh -i ~/.ssh/id_rsa user@[IP_ADDRESS]

# Vérifier la connexion
echo "SSH OK"
```

### 2. Setup Initial

```bash
# Mettre à jour les packages
sudo apt update && sudo apt upgrade -y

# Installer Node.js (LTS 18+)
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm

# Vérifier versions
node --version    # v18.x.x
npm --version     # 9.x.x

# Installer PM2 globalement
sudo npm install -g pm2

# Installer Nginx
sudo apt install -y nginx

# Installer Git
sudo apt install -y git

# Installer certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx

# Vérifier installations
pm2 --version
nginx -v
```

### 3. Créer répertoire d'application

```bash
# Créer dossier principal
sudo mkdir -p /var/www/reviews-maker
sudo chown -R $USER:$USER /var/www/reviews-maker

# Structure
cd /var/www/reviews-maker
mkdir -p client server-new db/review_images db/kyc_documents logs

# Vérifier structure
tree -L 2
```

---

## 📦 Déploiement Initial

### 1. Cloner le Repository

```bash
cd /var/www/reviews-maker

# Clone depuis GitHub
git clone https://github.com/your-org/reviews-maker.git .

# Vérifier fichiers
ls -la
```

### 2. Setup Backend

```bash
cd /var/www/reviews-maker/server-new

# Installer dépendances
npm install --production

# Configurer environment
cp .env.example .env

# Éditer .env avec production values
nano .env

# Contenu typique .env:
# NODE_ENV=production
# PORT=3000
# JWT_SECRET=<strong-random-secret>
# DATABASE_URL=file:./../../db/reviews-maker.db
# SESSION_SECRET=<strong-random-secret>
# STRIPE_SECRET_KEY=sk_live_...
# DISCORD_CLIENT_ID=...
# DISCORD_CLIENT_SECRET=...

# Initialiser Prisma
npm run prisma:generate
npm run prisma:migrate

# Seeder données initiales
npm run seed

# Vérifier démarrage local
npm run dev
# Ctrl+C pour arrêter
```

### 3. Setup Frontend

```bash
cd /var/www/reviews-maker/client

# Installer dépendances
npm install --production

# Build statique
npm run build

# Vérifier build
ls -la dist/
```

### 4. Permissions

```bash
# Donner permissions d'écriture pour logs/uploads
sudo chown -R www-data:www-data /var/www/reviews-maker/db
sudo chown -R www-data:www-data /var/www/reviews-maker/logs

chmod -R 755 /var/www/reviews-maker/db
chmod -R 755 /var/www/reviews-maker/logs

# Vérifier
ls -ld /var/www/reviews-maker/db
```

---

## 🔄 Configuration PM2

### 1. Créer Configuration Ecosystem

**File:** `/var/www/reviews-maker/ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [
    {
      name: 'reviews-maker-api',
      script: './server.js',
      cwd: './server-new',
      
      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      // Clustering
      instances: 'max',
      exec_mode: 'cluster',
      merge_logs: true,
      
      // Logging
      out_file: '../logs/out.log',
      error_file: '../logs/error.log',
      log_file: '../logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Crash recovery
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'dist'],
      max_memory_restart: '500M',
      
      // Process management
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ],
  
  // Global settings
  deploy: {
    production: {
      user: 'www-data',
      host: 'your-vps-ip',
      ref: 'origin/main',
      repo: 'https://github.com/your-org/reviews-maker.git',
      path: '/var/www/reviews-maker',
      'post-deploy': 'npm install && npm run prisma:migrate && pm2 reload ecosystem.config.cjs --env production'
    }
  }
};
```

### 2. Démarrer avec PM2

```bash
cd /var/www/reviews-maker

# Démarrer l'app
pm2 start ecosystem.config.cjs --env production

# Vérifier status
pm2 status

# Voir logs
pm2 logs

# Sauvegarder configuration PM2
pm2 save

# Auto-start au reboot
sudo pm2 startup systemd -u www-data --hp /home/www-data
```

### 3. Commands PM2 Utiles

```bash
# Status détaillé
pm2 status
pm2 info reviews-maker-api

# Logs
pm2 logs                    # Logs en direct
pm2 logs --lines 100        # Dernières 100 lignes
pm2 logs reviews-maker-api  # Logs app spécifique

# Manage processes
pm2 restart reviews-maker-api
pm2 stop reviews-maker-api
pm2 delete reviews-maker-api

# Monitoring
pm2 monit

# Save/Restore
pm2 save
pm2 resurrect
```

---

## 🌐 Configuration Nginx

### 1. Créer Configuration Nginx

**File:** `/etc/nginx/sites-available/reviews-maker`

```nginx
upstream reviews_maker_backend {
    least_conn;
    server localhost:3000 max_fails=3 fail_timeout=30s;
    # Si utilisant clustering, PM2 gère le load balancing
}

# Redirection HTTP → HTTPS
server {
    listen 80;
    server_name reviews-maker.com www.reviews-maker.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Server HTTPS principal
server {
    listen 443 ssl http2;
    server_name reviews-maker.com www.reviews-maker.com;
    
    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/reviews-maker.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reviews-maker.com/privkey.pem;
    
    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;
    
    # Logging
    access_log /var/log/nginx/reviews-maker_access.log;
    error_log /var/log/nginx/reviews-maker_error.log;
    
    # Limiter taille uploads
    client_max_body_size 50M;
    
    # ============================================
    # Frontend - Static files
    # ============================================
    location ~* ^/(?!api/) {
        root /var/www/reviews-maker/client/dist;
        
        # Cache immuable pour assets
        location ~* \.(js|css|woff2?|ttf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Cache HTML
        location ~ \.html$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
        
        # Fallback pour SPA (React Router)
        try_files $uri $uri/ /index.html;
    }
    
    # ============================================
    # Backend API
    # ============================================
    location /api {
        proxy_pass http://reviews_maker_backend;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://reviews_maker_backend/health;
    }
}
```

### 2. Activer Configuration Nginx

```bash
# Créer lien symbolique
sudo ln -s /etc/nginx/sites-available/reviews-maker \
           /etc/nginx/sites-enabled/reviews-maker

# Retirer config par défaut si nécessaire
sudo rm /etc/nginx/sites-enabled/default

# Tester configuration
sudo nginx -t

# Recharger Nginx
sudo systemctl reload nginx

# Vérifier status
sudo systemctl status nginx
```

### 3. Setup SSL Let's Encrypt

```bash
# Générer certificat (premier coup)
sudo certbot certonly --nginx -d reviews-maker.com -d www.reviews-maker.com

# Auto-renewal test
sudo certbot renew --dry-run

# Vérifier auto-renewal (cron/systemd timer)
sudo systemctl list-timers | grep certbot
sudo systemctl status certbot.service
```

---

## 🔍 Monitoring & Maintenance

### 1. Health Checks

```bash
# Vérifier API
curl -s http://localhost:3000/health | jq

# Vérifier Frontend
curl -s https://reviews-maker.com/ | head -20

# Vérifier SSL
openssl s_client -connect reviews-maker.com:443

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### 2. Logs Monitoring

```bash
# API logs
pm2 logs reviews-maker-api --lines 50

# Nginx access logs
tail -f /var/log/nginx/reviews-maker_access.log

# Nginx error logs
tail -f /var/log/nginx/reviews-maker_error.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u pm2-www-data -f
```

### 3. Performance Monitoring

```bash
# CPU/Memory usage
top

# Disk usage
df -h
du -sh /var/www/reviews-maker

# Process monitoring
pm2 monit

# Network stats
netstat -an | grep ESTABLISHED | wc -l
```

---

## 🔄 Mise à Jour / Rollout

### 1. Deployment Script

**File:** `deploy-vps.sh`

```bash
#!/bin/bash

set -e

echo "🚀 Deploying Reviews-Maker..."

# Variables
VPS_USER="www-data"
VPS_PATH="/var/www/reviews-maker"
GIT_BRANCH="${1:-main}"

echo "📥 Pulling latest code (branch: $GIT_BRANCH)..."
cd $VPS_PATH
git pull origin $GIT_BRANCH

echo "🔨 Building frontend..."
cd client
npm install --production
npm run build
cd ..

echo "🔧 Setting up backend..."
cd server-new
npm install --production
npm run prisma:generate
npm run prisma:migrate
cd ..

echo "♻️  Restarting services..."
pm2 reload ecosystem.config.cjs --env production
pm2 save

echo "✅ Deployment complete!"
echo "📊 Status:"
pm2 status
```

### 2. Utiliser le Script

```bash
# Exécuter depuis VPS
./deploy-vps.sh main

# Ou manuellement depuis dev:
ssh vps-lafoncedalle "cd /var/www/reviews-maker && ./deploy-vps.sh main"

# Ou via PM2 deploy
pm2 deploy ecosystem.config.cjs production update
pm2 deploy ecosystem.config.cjs production start
```

### 3. Rollback en Cas de Problème

```bash
# Voir historique Git
git log --oneline -10

# Revenir à version précédente
git checkout [commit-sha]
git reset --hard [commit-sha]

# Rebuild et restart
npm install
npm run build
pm2 restart reviews-maker-api
```

---

## 🛡️ Sécurité

### 1. Firewall Configuration

```bash
# Installer UFW (Uncomplicated Firewall)
sudo apt install -y ufw

# Rules
sudo ufw allow 22/tcp        # SSH
sudo ufw allow 80/tcp        # HTTP
sudo ufw allow 443/tcp       # HTTPS
sudo ufw enable

# Vérifier
sudo ufw status
```

### 2. Fail2Ban (Protection brute force)

```bash
# Installer
sudo apt install -y fail2ban

# Configuration
sudo nano /etc/fail2ban/jail.d/reviews-maker.conf

# Contenu:
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

# Restart service
sudo systemctl restart fail2ban
```

### 3. Secrets Management

```bash
# Vérifier .env n'est pas commité
git status | grep ".env"  # Should be empty or .env.example

# Utiliser .env.local (non-versioné)
cp .env.example .env
# Éditer avec valeurs production

# Permissions restrictives
chmod 600 .env
```

---

## 📊 Backup & Recovery

### 1. Database Backup

```bash
# Manual backup
cd /var/www/reviews-maker
cp db/reviews-maker.db db/reviews-maker.db.backup-$(date +%Y%m%d-%H%M%S)

# Automated daily backup
# File: /etc/cron.daily/backup-reviews-maker

#!/bin/bash
BACKUP_DIR="/var/www/reviews-maker/db/backups"
mkdir -p $BACKUP_DIR
cp /var/www/reviews-maker/db/reviews-maker.db \
   $BACKUP_DIR/reviews-maker-$(date +%Y%m%d-%H%M%S).db
# Keep last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

### 2. Upload Directory Backup

```bash
# Manual
tar -czf reviews_images_backup.tar.gz /var/www/reviews-maker/db/review_images/
tar -czf kyc_documents_backup.tar.gz /var/www/reviews-maker/db/kyc_documents/

# Automated
# Ajouter aux cron ou script de backup
```

### 3. Recovery

```bash
# Restore database
cp db/reviews-maker.db.backup-[date] db/reviews-maker.db
pm2 restart reviews-maker-api

# Restore uploads
tar -xzf reviews_images_backup.tar.gz -C /
```

---

## 📈 Scaling & Optimization

### 1. Database Optimization

```javascript
// Prisma optimizations
// server-new/prisma/schema.prisma

model Review {
  @@index([userId])           // Faster lookups
  @@index([createdAt])        // Sorting
  @@index([isPublic])         // Filtering
  @@fulltext([name, description])  // Search
}
```

### 2. Caching Strategy

```nginx
# Nginx caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m;

location /api/gallery/public {
    proxy_cache api_cache;
    proxy_cache_valid 200 1h;
    proxy_cache_key "$scheme$request_method$host$request_uri";
}
```

### 3. Image Optimization

```bash
# Installer ImageMagick
sudo apt install -y imagemagick

# Script d'optimisation
# Redimensionner uploads automatiquement
convert input.jpg -resize 1920x1080 -quality 85 output.jpg
```

---

## 🚨 Troubleshooting

### API Not Responding

```bash
# 1. Check PM2
pm2 status
pm2 logs reviews-maker-api

# 2. Check port
netstat -antp | grep 3000

# 3. Check Nginx proxy
sudo nginx -t
curl -v http://localhost:3000

# 4. Restart
pm2 restart reviews-maker-api
```

### Database Issues

```bash
# Check database file
ls -lah db/reviews-maker.db

# Verify Prisma
npm run prisma:generate
npm run prisma:migrate

# Check constraints
sqlite3 db/reviews-maker.db ".tables"
```

### Memory Leaks

```bash
# Monitor memory usage
watch -n 1 'pm2 status | grep memory'

# Force garbage collection
pm2 restart reviews-maker-api

# Check for leaks in code
node --max-old-space-size=4096 server.js
```

### SSL Issues

```bash
# Check certificate validity
sudo certbot certificates

# Manual renewal
sudo certbot renew --force-renewal

# Test SSL
sudo certbot renew --dry-run
```

---

## 📋 Maintenance Checklist

- [ ] Weekly: Check logs pour erreurs
- [ ] Weekly: Monitor disk usage
- [ ] Monthly: Review security logs
- [ ] Monthly: Database backup verification
- [ ] Quarterly: Update Node.js si patch disponible
- [ ] Quarterly: Update npm packages
- [ ] Quarterly: SSL certificate check
- [ ] Yearly: Full disaster recovery test

---

## 📞 Support & Escalation

**Contacts:**
- VPS Provider Support: [contact info]
- Dev Team: Copilot
- Admin Dashboard: [internal URL]

**Emergency Procedures:**
- Service down: SSH → pm2 restart → check logs
- Database corruption: Restore from backup
- SSL expired: Manual renewal + restart Nginx
- Disk full: Clear old logs + uploads, expand storage
