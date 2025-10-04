# Résolution des Problèmes - Reviews Maker

## Problème: "Erreur de connexion au serveur"

### Diagnostic

Cette erreur apparaît quand le frontend ne peut pas contacter l'API backend.

### Solutions

#### 1. Vérifier que le serveur tourne

Sur le VPS :
```bash
pm2 status
# ou
pm2 list
```

Si le serveur n'est pas en cours d'exécution :
```bash
cd ~/Reviews-Maker/server
pm2 start ecosystem.config.cjs
pm2 save
```

#### 2. Vérifier l'URL de l'API

Dans `app.js`, vérifiez la variable `API_BASE_URL` :

**Développement local** :
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

**Production (VPS)** :
```javascript
const API_BASE_URL = ''; // URL relative - utilise le même domaine
```

Pour modifier en production, éditez `app.js` ligne ~1-10 et changez :
```javascript
const remoteBase = location.origin; // Utilise le domaine actuel
```

#### 3. Vérifier les Logs

```bash
pm2 logs reviews-maker --lines 50
```

Recherchez des erreurs comme :
- `ECONNREFUSED` - Le serveur n'écoute pas sur le bon port
- `Cannot POST /api/auth/send-code` - Route non trouvée
- Erreurs LaFoncedalle API

#### 4. Tester l'API manuellement

```bash
# Depuis le VPS
curl http://localhost:3000/api/ping

# Depuis votre machine
curl http://51.75.22.192:3000/api/ping
```

#### 5. Vérifier le Firewall

Si l'API ne répond pas depuis l'extérieur :

```bash
sudo ufw status
sudo ufw allow 3000/tcp  # Si nécessaire
```

#### 6. Vérifier Nginx (si utilisé)

Si vous utilisez Nginx comme reverse proxy :

```bash
sudo nginx -t
sudo systemctl status nginx
```

Configuration Nginx recommandée (`/etc/nginx/sites-available/reviews-maker`) :

```nginx
server {
    listen 80;
    server_name 51.75.22.192 reviews.votre-domaine.com;

    root /home/ubuntu/Reviews-Maker;
    index index.html;

    # Servir les fichiers statiques
    location / {
        try_files $uri $uri/ =404;
    }

    # Proxy vers l'API Node.js
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Servir les images
    location /images/ {
        alias /home/ubuntu/Reviews-Maker/db/review_images/;
    }
}
```

Activer et recharger :
```bash
sudo ln -s /etc/nginx/sites-available/reviews-maker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Problème: Caractères mal affichés (╝Üǿ, ƒó¿, etc.)

### Cause

Problème d'encodage UTF-8 dans les fichiers HTML.

### Solution

✅ **Corrigé dans le dernier commit**

Les fichiers ont été corrigés pour utiliser les bons caractères UTF-8. Faites :

```bash
cd ~/Reviews-Maker
git pull origin main
pm2 restart reviews-maker
```

Ensuite, videz le cache du navigateur : **Ctrl+Shift+R** ou **Ctrl+F5**

---

## Problème: Le modal de connexion ne s'ouvre pas

### Diagnostic

1. **Ouvrir la Console du navigateur** : F12 → Console
2. Chercher des erreurs JavaScript

### Solutions possibles

#### Le bouton n'est pas visible
- Vérifiez que vous avez fait `git pull` sur le VPS
- Videz le cache : Ctrl+Shift+R

#### Le bouton ne fait rien au clic
```javascript
// Dans la Console du navigateur (F12)
document.getElementById('floatingAuthBtn')
// Devrait retourner l'élément, pas null

document.getElementById('authModal')
// Devrait retourner le modal
```

Si l'un retourne `null`, le HTML n'est pas à jour.

#### Erreur JavaScript dans app.js
Vérifiez les logs de la Console (F12) pour des erreurs comme :
- `Uncaught TypeError: Cannot read property 'addEventListener' of null`
- `dom.floatingAuthBtn is null`

---

## Problème: Les notifications ne s'affichent pas correctement

### Solution

✅ **Corrigé dans le dernier commit**

Les notifications sont maintenant :
- Positionnées en **bas à gauche**
- **Cliquables** pour disparaître immédiatement
- Avec animation d'entrée fluide
- Auto-disparition après 5 secondes

Faites `git pull` et videz le cache.

---

## Problème: LaFoncedalle API ne répond pas

### Diagnostic

Vérifiez les logs du serveur Reviews Maker :
```bash
pm2 logs reviews-maker | grep LaFoncedalle
# ou
pm2 logs reviews-maker | grep discord
```

### Solutions

#### 1. Vérifier que LaFoncedalle API est accessible

```bash
# Sur le VPS
curl http://localhost:3001/health
# ou l'endpoint de health check de votre API
```

#### 2. Vérifier la configuration

```bash
cd ~/Reviews-Maker/server
cat .env
```

Devrait contenir :
```env
LAFONCEDALLE_API_URL=http://localhost:3001
LAFONCEDALLE_API_KEY=votre-clé-api
```

#### 3. Tester les endpoints LaFoncedalle

```bash
# Test de vérification email
curl -X POST http://localhost:3001/api/discord/user-by-email \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test d'envoi d'email
curl -X POST http://localhost:3001/api/mail/send-verification \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","code":"123456","subject":"Test"}'
```

#### 4. Mode Mock pour tester sans LaFoncedalle

En attendant que LaFoncedalle API soit prête, vous pouvez temporairement mocker les fonctions dans `server/server.js` :

```javascript
// Remplacer getDiscordUserByEmail par :
async function getDiscordUserByEmail(email) {
  console.log('[MOCK] Discord verification for:', email);
  return {
    discordId: '123456789',
    username: 'TestUser#1234',
    email: email
  };
}

// Remplacer sendVerificationEmail par :
async function sendVerificationEmail(email, code) {
  console.log(`[MOCK] Email to ${email}: ${code}`);
  return { ok: true };
}
```

Puis redémarrez :
```bash
pm2 restart reviews-maker
```

---

## Checklist de Déploiement

Avant de déclarer que tout fonctionne :

- [ ] `git pull origin main` effectué sur le VPS
- [ ] `npm install` exécuté dans `server/`
- [ ] Fichier `.env` configuré avec les bonnes valeurs
- [ ] PM2 redémarré : `pm2 restart reviews-maker`
- [ ] Serveur accessible : `curl http://localhost:3000/api/ping`
- [ ] Cache navigateur vidé : Ctrl+Shift+R
- [ ] Bouton flottant 🔗 visible sur review.html ET index.html
- [ ] Modal s'ouvre au clic sur le bouton
- [ ] Notifications apparaissent en bas à gauche
- [ ] Notifications disparaissent au clic
- [ ] Pas d'erreurs dans la Console navigateur (F12)
- [ ] Pas d'erreurs dans les logs PM2 : `pm2 logs reviews-maker`

---

## Commandes de Debug Utiles

```bash
# État des services
pm2 status
systemctl status nginx

# Logs en temps réel
pm2 logs reviews-maker --lines 100

# Tester l'API
curl http://localhost:3000/api/ping

# Voir les processus Node
ps aux | grep node

# Voir les ports utilisés
netstat -tulpn | grep 3000

# Redémarrer proprement
pm2 restart reviews-maker
pm2 flush  # Vider les logs

# En cas de problème majeur
pm2 delete reviews-maker
cd ~/Reviews-Maker/server
pm2 start ecosystem.config.cjs
pm2 save
```

---

## Support Rapide

### Le bouton de connexion ne fonctionne que sur review.html ?

**C'est maintenant corrigé !** Le modal et le bouton sont présents sur les deux pages. Si ça ne marche pas sur index.html :

1. Vérifiez la Console (F12) pour des erreurs
2. Vérifiez que `app.js` est bien chargé
3. Videz le cache : Ctrl+Shift+R

### Les caractères sont toujours mal affichés ?

1. `git pull origin main` sur le VPS
2. Vider le cache navigateur : Ctrl+Shift+Del → Tout cocher
3. Fermer et rouvrir le navigateur

### Toujours des problèmes ?

Partagez les informations suivantes :
- Screenshot de la Console (F12)
- Logs PM2 : `pm2 logs reviews-maker --lines 50`
- Résultat de : `curl http://localhost:3000/api/ping`
