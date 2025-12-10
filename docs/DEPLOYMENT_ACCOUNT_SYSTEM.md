# Guide de Déploiement - Système de Gestion de Compte

**Date:** Décembre 2025

---

## 📋 Pré-requis

- Node.js 24.11.1+ (VPS)
- npm/yarn
- Git
- PM2 ou systemd pour gestion processus

---

## 🔧 Étapes de Déploiement

### 1. **Cloner les fichiers modifiés**

```bash
cd ~/Reviews-Maker
git pull origin feat/templates-backend
```

### 2. **Vérifier les nouveaux fichiers**

Frontend:
```bash
ls -la client/src/components/account/
ls -la client/src/components/legal/
ls -la client/src/pages/ProfilePage.jsx
```

Backend:
```bash
ls -la server-new/routes/account.js
ls -la server-new/routes/legal.js
```

### 3. **Installer dépendances (si nécessaire)**

Frontend:
```bash
cd client && npm install
```

Backend:
```bash
cd server-new && npm install
```

### 4. **Build Frontend**

```bash
cd client
npm run build
# Génère dist/
```

### 5. **Redémarrer le serveur**

Via PM2:
```bash
pm2 restart reviews-backend --update-env
```

Vérifier logs:
```bash
pm2 logs reviews-backend | grep -E "(Account|Legal|ERROR)"
```

Via systemd:
```bash
sudo systemctl restart reviews-maker
journalctl -u reviews-maker -f
```

### 6. **Tester les endpoints**

```bash
# Test vérification d'âge
curl -X POST http://localhost:3000/api/legal/verify-age \
  -H "Content-Type: application/json" \
  -d '{
    "birthdate": "1990-01-01",
    "country": "FR",
    "region": null
  }' \
  -b "cookies.txt" -c "cookies.txt"

# Test récupérer profil
curl http://localhost:3000/api/account/profile \
  -b "cookies.txt"

# Test mettre à jour profil
curl -X PUT http://localhost:3000/api/account/update \
  -H "Content-Type: application/json" \
  -d '{"username": "newname", "theme": "emerald"}' \
  -b "cookies.txt"

# Test CGU
curl http://localhost:3000/api/legal/terms

# Test Mentions Légales
curl http://localhost:3000/api/legal/notice
```

---

## 🌐 Configuration Production

### Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl http2;
    server_name terpologie.eu www.terpologie.eu;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend static
    location / {
        alias /home/user/Reviews-Maker/client/dist/;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads images
    location /images/ {
        alias /home/user/Reviews-Maker/db/review_images/;
        expires 30d;
    }
}
```

### Variables d'environnement

Créer `.env` ou configurer via PM2:

```bash
# Authentication
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Database
DATABASE_URL=file:/home/user/Reviews-Maker/db/reviews.sqlite

# Frontend
FRONTEND_URL=https://www.terpologie.eu
BASE_PATH=/reviews  # Si derrière un path prefix

# Serveur
PORT=3000
NODE_ENV=production

# Session
SESSION_SECRET=xxxxx-long-random-string
```

---

## ✅ Checklist Pré-Déploiement

- [ ] Code poussé sur main/production
- [ ] Tests locaux effectués (age verification, profile, legal)
- [ ] Base de données sauvegardée
- [ ] Variables d'env configurées
- [ ] SSL certificats valides
- [ ] Logs configurés (PM2)
- [ ] Backup automatique en place
- [ ] Monitoring alertes activé

---

## 🧪 Tests Manuels Essentiels

### Test Vérification d'Âge:
1. Connectez-vous
2. Accédez à `/` → Devrait afficher AgeVerification
3. Entrez date de naissance valide
4. Sélectionnez pays (FR, US, CA)
5. Pour US, sélectionnez état légal
6. Cliquez "Vérifier mon âge"
7. Devrait être redirigé vers consentement

### Test Sélection Compte:
1. Après vérification d'âge
2. Devrait afficher AccountSelector
3. Sélectionnez "Consommateur"
4. Cliquez "Continuer"
5. Devrait être redirigé vers home

### Test Profil:
1. Connecté, cliquez avatar → "Mon Profil"
2. Vérifiez affichage infos
3. Cliquez "Modifier"
4. Changez username, email, thème
5. Cliquez "Enregistrer"
6. Vérifiez mise à jour dans la base
7. Rechargez page, données doivent persister

### Test CGU:
1. Depuis profil, onglet "Légal"
2. Scrollez CGU, vérifiez lecture complète
3. Vérifiez sections (intro, âge, utilisation, etc.)

### Test Mentions Légales:
1. Depuis profil, onglet "Légal"
2. Scrollez mentions, vérifiez complétude
3. Vérifiez infos conformité RGPD

---

## 📊 Monitoring

### Logs à surveiller:
```bash
# Via PM2
pm2 logs reviews-backend | grep -E "(Account|Legal|Update|ERROR|WARN)"

# Via systemd
journalctl -u reviews-maker -f

# File logs
tail -f /var/log/reviews-maker/server.log
```

### Métriques importantes:
- Temps réponse `/api/account/*` < 200ms
- Temps réponse `/api/legal/*` < 100ms
- Zéro erreur 500 sur account
- Zéro erreur 401 pour authenticated endpoints

---

## 🐛 Troubleshooting

### "Erreur authentification requise" sur /profile

**Cause:** Session non valide ou cookie expiré

**Solution:**
```bash
# Vérifier session en base
sqlite3 /path/to/reviews.sqlite \
  "SELECT COUNT(*) FROM sessions WHERE userId='xxxxx'"

# Nettoyer sessions expirées
sqlite3 /path/to/reviews.sqlite \
  "DELETE FROM sessions WHERE expiresAt < datetime('now')"
```

### "Pays non autorisé" sur vérification d'âge

**Cause:** Code pays invalide

**Solution:**
- Valider code ISO 2 lettres (FR, US, CA, etc.)
- Vérifier LEGAL_COUNTRIES dans `server-new/config/legal.js`
- Ajouter pays si nécessaire

### Profil ne se met pas à jour

**Cause:** Validation échouée (username/email déjà existant)

**Solution:**
```bash
# Vérifier unicité
sqlite3 /path/to/reviews.sqlite \
  "SELECT id, username, email FROM users WHERE username='test'"

# Modifier manuellement si nécessaire
sqlite3 /path/to/reviews.sqlite \
  "UPDATE users SET username='newname' WHERE id='userid'"
```

---

## 📈 Rollback d'Urgence

Si un problème en production:

```bash
# Revert les fichiers
git revert <commit-hash>
git push origin main

# Redémarrer service
pm2 restart reviews-backend

# Vérifier logs
pm2 logs reviews-backend

# Restaurer base si nécessaire
cp /backup/reviews.sqlite /path/to/reviews.sqlite
pm2 restart reviews-backend
```

---

## 📞 Support & Questions

- **Frontend issue?** Check browser console + network tab
- **Backend issue?** Check PM2 logs, database integrity
- **Database issue?** Run repair: `sqlite3 db/reviews.sqlite "PRAGMA integrity_check"`
- **Deployment issue?** Verify env vars, permissions, SSL certs

---

**Document créé:** 2025-12-10  
**Dernière révision:** 2025-12-10
