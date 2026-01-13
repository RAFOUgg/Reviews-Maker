# Déploiement & DevOps - Reviews-Maker

## 🌐 VPS Deployment

### Serveur: vps-lafoncedalle

**Accès SSH:**
```bash
ssh vps-lafoncedalle
# (Authentification par public key SSH)
```

**Stack:**
- Ubuntu 20.04 LTS
- Node.js 18.x
- Nginx (reverse proxy)
- PM2 (process manager)
- SSL/TLS (Let's Encrypt)

---

## 🚀 Deploy Process

### 1. Local Preparation

```bash
# S'assurer d'être sur main branch
git checkout main
git pull origin main

# Build frontend
cd client
npm run build
# → dist/ folder créé

# Pas besoin de build backend (Node.js directement)
cd server-new
# Vérifier .env production
```

### 2. Deploy via Script

```bash
# À la racine du projet
./deploy-vps.sh

# Or manually
./deploy.sh
```

**Qu'il fait:**
1. Build frontend
2. Push code sur VPS
3. Install dépendances
4. Run migrations Prisma
5. Restart PM2 processes
6. Reload Nginx

### 3. Vérifier Déploiement

```bash
ssh vps-lafoncedalle

# Check PM2 status
pm2 status

# Check logs
pm2 logs

# Check Nginx
sudo systemctl status nginx

# Test site
curl https://reviews-maker.com
```

---

## 🔧 Configuration VPS

### PM2 Configuration

```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: 'reviews-maker-api',
      script: './server-new/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true
    }
  ]
};
```

**Commandes PM2:**
```bash
# Start
pm2 start ecosystem.config.cjs

# Stop
pm2 stop all

# Restart
pm2 restart all

# Logs
pm2 logs

# Monitor
pm2 monit

# Delete
pm2 delete all
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/reviews-maker-ssl.conf

upstream node_backend {
  server localhost:3000;
}

server {
  listen 443 ssl http2;
  server_name reviews-maker.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  location / {
    proxy_pass http://node_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location /api {
    proxy_pass http://node_backend;
  }
}

# Redirect HTTP → HTTPS
server {
  listen 80;
  server_name reviews-maker.com;
  return 301 https://$server_name$request_uri;
}
```

**Activer:**
```bash
sudo ln -s /etc/nginx/sites-available/reviews-maker-ssl.conf \
           /etc/nginx/sites-enabled/

sudo systemctl restart nginx
```

---

## 🔐 SSL/TLS Certificates

### Let's Encrypt Renewal

```bash
sudo certbot renew --quiet

# Auto-renewal (cron)
0 3 * * * /usr/bin/certbot renew --quiet
```

### Manual Certificate

```bash
sudo certbot certonly --standalone \
  -d reviews-maker.com \
  -d www.reviews-maker.com

# Certificats in: /etc/letsencrypt/live/reviews-maker.com/
```

---

## 📦 Database Management

### Backup

```bash
# Backup local
sqlite3 db/reviews.sqlite ".backup db/backups/reviews-$(date +%Y%m%d_%H%M%S).sqlite"

# On VPS
ssh vps-lafoncedalle
sqlite3 /path/to/reviews.sqlite ".backup reviews-$(date +%Y%m%d_%H%M%S).sqlite"
```

### Restore

```bash
# Restore from backup
sqlite3 db/reviews.sqlite ".restore db/backups/reviews-20250113_120000.sqlite"
```

### Migration

```bash
# After schema changes
cd server-new
npm run prisma:migrate -- --name description
npm run prisma:generate

# Deploy as usual
./deploy-vps.sh
```

---

## 📊 Monitoring & Logging

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Save logs
pm2 save
pm2 startup

# Clear logs
pm2 flush
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Application Logs

```bash
pm2 logs reviews-maker-api
pm2 logs reviews-maker-api --lines 100
```

---

## 🔄 CI/CD (Future)

### GitHub Actions (Prepared)

```yaml
# .github/workflows/deploy.yml (future)
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        run: |
          ssh user@vps-lafoncedalle './deploy-vps.sh'
```

---

## 🆘 Troubleshooting

### Site Down

```bash
# Check PM2
pm2 status

# Restart
pm2 restart all

# Check logs
pm2 logs
```

### Out of Memory

```bash
# Check
free -h

# Scale down PM2 instances
pm2 scale app_name 2
```

### Database Locked

```bash
# Check
lsof | grep reviews.sqlite

# Kill process
kill -9 <PID>
```

### SSL Certificate Expired

```bash
# Check expiry
sudo certbot certificates

# Renew
sudo certbot renew --force-renewal
```

### Nginx Config Error

```bash
# Test config
sudo nginx -t

# Restart carefully
sudo systemctl reload nginx
```

---

## 📋 Deployment Checklist

- [ ] Toutes les feature branches mergées
- [ ] Pas de console.log en production
- [ ] .env production correct
- [ ] Database migrations appliquées
- [ ] Build frontend successful
- [ ] Pas d'erreurs TypeScript
- [ ] Tests manuels OK
- [ ] SSL certificate valide
- [ ] Backups réalisés
- [ ] PM2 ecosystem.config correct
- [ ] Nginx config reloadé
- [ ] Site accessible
- [ ] Pas d'erreurs dans logs

---

## 🔍 Health Check

```bash
# Test API
curl -I https://reviews-maker.com/api/reviews

# Check database
npm run prisma:studio

# Check disk space
df -h

# Check memory
free -h

# Check processes
ps aux | grep node
```

---

## 📞 Emergency Contacts

- **VPS Provider**: Digital Ocean / Linode (update as needed)
- **Domain**: Registrar contact
- **SSL**: Let's Encrypt automated renewal

---

## 📚 Resources

- PM2 Docs: https://pm2.keymetrics.io
- Nginx: https://nginx.org/en/docs/
- Let's Encrypt: https://letsencrypt.org
- Digital Ocean: https://www.digitalocean.com/docs/

---

**Dernière mise à jour**: 13 Jan 2026
