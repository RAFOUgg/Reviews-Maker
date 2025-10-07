# Guide de Déploiement - Reviews Maker sur VPS Ubuntu

## État Actuel
Vous avez déjà fait un `git pull` sur le VPS qui a récupéré les modifications incluant :
- Intégration LaFoncedalle API
- Système d'authentification par email
- Modal d'authentification avec 3 étapes
- Bouton flottant de connexion

## Configuration Requise sur le VPS

### 1. Variables d'Environnement

Créez ou éditez le fichier `.env` dans le dossier `server/` :

```bash
cd ~/Reviews-Maker/server
nano .env
```

Ajoutez :
```env
PORT=3000
LAFONCEDALLE_API_URL=http://localhost:3001
LAFONCEDALLE_API_KEY=votre-clé-api-lafoncedalle
```

**Important** : Remplacez `votre-clé-api-lafoncedalle` par la vraie clé API.

### 2. Installer les Dépendances

Si vous avez ajouté de nouvelles dépendances :

```bash
cd ~/Reviews-Maker/server
npm install
```

### 3. Redémarrer le Service

#### Option A: Avec PM2 (recommandé)
```bash
pm2 restart reviews-maker
# ou
pm2 restart server/ecosystem.config.cjs
```

#### Option B: Sans PM2
```bash
cd ~/Reviews-Maker/server
node server.js
```

### 4. Vérifier les Logs

```bash
# Logs PM2
pm2 logs reviews-maker

# Ou logs Docker si vous utilisez Docker
docker-compose logs -f
```

### 5. Tester l'API

```bash
# Test du serveur
curl http://localhost:3000/api/ping

# Test de l'endpoint d'authentification
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Intégration LaFoncedalle

### Endpoints Requis de LaFoncedalle API

Le serveur Reviews Maker a besoin de deux endpoints sur l'API LaFoncedalle :

#### 1. Vérification Discord par Email
```
POST /api/discord/user-by-email
Authorization: Bearer <API_KEY>
Body: { "email": "user@example.com" }

Response: { 
  "discordId": "123456789", 
  "username": "User#1234",
  "email": "user@example.com"
}
```

#### 2. Envoi d'Email de Vérification
```
POST /api/mail/send-verification
Authorization: Bearer <API_KEY>
Body: {
  "to": "user@example.com",
  "code": "123456",
  "subject": "Code de vérification Reviews Maker",
  "appName": "Reviews Maker",
  "expiryMinutes": 10
}

Response: { "ok": true, "messageId": "..." }
```

## Configuration Nginx (si utilisé)

Si vous utilisez Nginx comme reverse proxy, ajoutez cette configuration :

```nginx
server {
    listen 80;
    server_name reviews.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Puis rechargez Nginx :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Vérification du Déploiement

### Checklist

- [ ] Git pull effectué sur le VPS
- [ ] Fichier `.env` configuré avec les bonnes valeurs
- [ ] `npm install` exécuté si nécessaire
- [ ] Service redémarré (PM2 ou autre)
- [ ] API LaFoncedalle accessible depuis le VPS
- [ ] Endpoints LaFoncedalle testés
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Test dans le navigateur : bouton de connexion visible
- [ ] Test du flux complet : email → code → connexion

### Tests Manuels

1. **Test du Bouton**
   - Ouvrir `http://votre-domaine.com/review.html`
   - Vérifier que le bouton flottant 🔗 est visible en bas à droite
   - Cliquer dessus → le modal de connexion doit s'ouvrir

2. **Test de l'Authentification**
   - Entrer une adresse email liée à Discord
   - Vérifier les logs serveur pour voir si l'API LaFoncedalle est appelée
   - Vérifier la réception de l'email avec le code
   - Entrer le code → devrait afficher "Connecté"

3. **Test des Erreurs**
   - Tester avec un email non lié → doit afficher un message d'erreur
   - Tester avec un code invalide → doit afficher "Code invalide"
   - Tester avec un code expiré → doit afficher "Code expiré"

## Debugging

### Le bouton ne s'affiche pas
```bash
# Vérifier que le fichier review.html est à jour
grep "floatingAuthBtn" ~/Reviews-Maker/review.html

# Vérifier que app.js est chargé
curl http://localhost:3000/app.js | grep "floatingAuthBtn"
```

### Le bouton ne fait rien au clic
1. Ouvrir la console du navigateur (F12)
2. Chercher des erreurs JavaScript
3. Vérifier que `app.js` est bien chargé
4. Vérifier que le DOM est bien initialisé

### L'API ne répond pas
```bash
# Vérifier que le serveur tourne
pm2 list
# ou
ps aux | grep node

# Vérifier les ports
netstat -tulpn | grep 3000

# Tester l'API localement
curl http://localhost:3000/api/ping
```

### Erreurs LaFoncedalle API
```bash
# Vérifier les logs PM2
pm2 logs reviews-maker --lines 100

# Tester la connexion à LaFoncedalle
curl http://localhost:3001/health
# (adapter selon votre config)
```

## Commandes Utiles

```bash
# Voir l'état du serveur
pm2 status

# Redémarrer le serveur
pm2 restart reviews-maker

# Voir les logs en temps réel
pm2 logs reviews-maker --lines 50

# Sauvegarder la config PM2
pm2 save

# Mettre à jour depuis Git
cd ~/Reviews-Maker
git pull origin main
cd server
npm install
pm2 restart reviews-maker

# Nettoyer les anciens tokens (optionnel)
rm -f ~/Reviews-Maker/server/tokens/*
```

## Support

Si vous rencontrez des problèmes :

1. Vérifiez d'abord les logs : `pm2 logs reviews-maker`
2. Vérifiez la console navigateur (F12)
3. Testez les endpoints manuellement avec `curl`
4. Vérifiez que LaFoncedalle API est accessible

Pour toute question sur l'intégration LaFoncedalle, consultez `INTEGRATION_LAFONCEDALLE.md`.
