# Backend Reviews Maker

API Express + SQLite pour la persistance des reviews et stockage fichiers (images uploadées).

## 1. Démarrage local

```bash
cd server
npm install
npm start   # lance sur http://localhost:3000
```

Le backend sert aussi les fichiers statiques du dossier racine (index.html, review.html, app.js...).

## 2. Structure

- `server/server.js` : API Express
- `db/reviews.sqlite` : base SQLite générée automatiquement
- `db/review_images/` : stockage des images uploadées

## 3. Endpoints

### 3.1 Reviews

|---------|---------------------|-------------|
| GET     | /api/ping           | Test vie serveur |
| GET     | /api/reviews        | Liste (max 500) |
| GET     | /api/reviews/:id    | Détail |
| POST    | /api/reviews        | Création (multipart ou JSON) |

### 3.2 Authentification (LaFoncedalleBot Integration)

| Méthode | URL                      | Description |
|---------|--------------------------|-------------|
| GET     | /api/auth/me             | Récupérer les infos de l'utilisateur connecté |

Reviews-Maker (backend/server.js)
    ↓ API calls
LaFoncedalleBot (API + Service de mailing + Base de données Discord)
```

#### Flux d'authentification
1. L'utilisateur entre son email sur Reviews-Maker
2. Reviews-Maker interroge l'API de LaFoncedalleBot pour vérifier si l'email existe dans la base Discord
3. Si l'email est trouvé, LaFoncedalleBot renvoie le profil Discord (ID + pseudo)
4. Reviews-Maker demande à LaFoncedalleBot d'envoyer un code de vérification par email
5. L'utilisateur entre le code reçu
6. Reviews-Maker vérifie le code et crée une session
7. Le compte est nommé automatiquement avec le pseudo Discord

#### Configuration requise
- `LAFONCEDALLE_API_URL` : URL de l'API LaFoncedalleBot (ex: http://localhost:3001)
- `LAFONCEDALLE_API_KEY` : Clé API partagée pour sécuriser les requêtes
- `LAFONCEDALLE_DB_FILE` : **NOUVEAU** - Chemin absolu vers la base de données LaFoncedalleBot (optionnel)


**Configuration sur VPS :**

**Avantages :**
- ✅ Vérification instantanée (pas d'appel API)
- ✅ Fonctionne même si l'API LaFoncedalleBot est down
- ✅ Plus sécurisé (pas de transmission réseau)

**Si non configuré :** Fallback vers l'API comme avant.

Voir [INTEGRATION_LAFONCEDALLE_API.md](../INTEGRATION_LAFONCEDALLE_API.md) pour la documentation complète.
Voir [DEPLOIEMENT_INTEGRATION_LAFONCEDALLE.md](../DEPLOIEMENT_INTEGRATION_LAFONCEDALLE.md) pour le guide de déploiement.

Payload JSON principal = l'objet complet de la review (les champs utilisés dans `app.js`).
Si une image est uploadée via champ `image`, on renvoie `image: /images/<fichier>`.

## 4. Déploiement sur un serveur Ubuntu (production)

- Ubuntu 22.04+ recommandé.
- Ports 80 et 443 ouverts.

### 4.2 Installer Node.js (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs git
node -v
npm -v
```

### 4.3 Cloner et installer
```bash
cd /var/www
sudo git clone https://github.com/RAFOUgg/Reviews-Maker.git
sudo chown -R $USER:$USER Reviews-Maker
cd Reviews-Maker/server
npm install
```

### 4.4 Lancement test
```bash
npm start
# Doit afficher: Reviews Maker API running on port 3000
# Tester: curl http://localhost:3000/api/ping
```
Arrêter (Ctrl+C) avant de passer en service.

### 4.5 (Option A) Service systemd
Créer `/etc/systemd/system/reviews-maker.service` :
```ini
[Unit]
Description=Reviews Maker API
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/Reviews-Maker/server
ExecStart=/usr/bin/node server.js
Restart=on-failure
User=www-data
Group=www-data
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

Activer + démarrer :
```bash
sudo systemctl daemon-reload
sudo systemctl enable reviews-maker
sudo systemctl start reviews-maker
sudo systemctl status reviews-maker
```

### 4.6 (Option B) PM2 (alternative à systemd)
PM2 simplifie la supervision et la rotation des logs.

Installation globale puis démarrage:
```bash
sudo npm install -g pm2
cd /var/www/Reviews-Maker/server
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 startup  # exécuter la commande affichée pour activer au boot
```

Logs / statut:
```bash
pm2 status
pm2 logs reviews-maker
```

Redémarrage après mise à jour de code:
```bash
pm2 restart reviews-maker
```

### 4.7 Nginx reverse proxy
Installer :
```bash
sudo apt install -y nginx
```
Créer `/etc/nginx/sites-available/reviews-maker.conf` :
```nginx
server {
    listen 80;
    server_name exemple.com www.exemple.com;

    location / {
        proxy_pass http://127.0.0.1:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Activer + tester :
```bash
sudo ln -s /etc/nginx/sites-available/reviews-maker.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
Aller sur http://exemple.com/index.html

### 4.8 HTTPS (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d exemple.com -d www.exemple.com
# Répondre aux questions, choisir redirection HTTPS
```
Certificat auto-renouvelé par timer systemd.

### 4.9 Sauvegardes / Mises à jour
- DB = fichier `db/reviews.sqlite` + images `db/review_images/`.
- Sauvegarde régulière :
```bash
tar czf backup-$(date +%F).tar.gz db/reviews.sqlite db/review_images
```
- Mise à jour code :
```bash
cd /var/www/Reviews-Maker
git pull
sudo systemctl restart reviews-maker
```

### 4.10 Sécurité rapide
- Garder le port 3000 fermé en externe (pare-feu UFW: autoriser seulement 80/443).
```bash
sudo ufw allow 80,443/tcp
sudo ufw enable
sudo ufw status
```

## 5. Variables d'environnement optionnelles
| Nom | Rôle | Défaut |
|-----|------|--------|
| PORT | Port HTTP interne | 3000 |

## 6. Alternatives d'hébergement

Si tu n'utilises PAS le backend (mode 100% localStorage), tu peux déployer le front :

- GitHub Pages / Netlify / Vercel : déposer `index.html`, `review.html`, `app.js`, `styles.css`.
- Mais les fonctions d'API distante (/api/...) seront inactives.

Pour garder l'API :
- Render.com (service web + disque persistant pour `/db`).
- Railway.app (prévoir volume persistant pour SQLite).
- Fly.io (volume attaché pour `/db`).

## 7. Tests rapides API
```bash
curl -s http://localhost:3000/api/ping
curl -s http://localhost:3000/api/reviews | jq
```

## 8. Problèmes fréquents
| Problème | Cause probable | Solution |
|----------|----------------|----------|
| `SQLITE_BUSY` | Accès concurrent (rare) | Retenter, usage léger | 
| 404 /api/... | Reverse proxy mal configuré | Vérifier proxy_pass | 
| Pas d'images | Droits dossier `db/review_images` | `chown www-data` | 

---
Bon déploiement ! 🌿

---

## 9. Déploiement via Docker

### 9.1 Construction locale
```bash
docker build -t reviews-maker:latest .
docker run -d --name reviews-maker \
    -p 3000:3000 \
    -v $(pwd)/db:/app/db \
    reviews-maker:latest
```
Accès: http://localhost:3000/index.html

### 9.2 Production (exemple)
1. Copier le dépôt sur le serveur dans /opt/reviews-maker
2. Construire l'image (ou récupérer depuis GHCR si workflow activé):
```bash
docker pull ghcr.io/RAFOUgg/reviews-maker:latest || true
cd /opt/reviews-maker
docker build -t reviews-maker:latest .
```
3. Lancer avec un volume persistant:
```bash
docker run -d --name reviews-maker \
    --restart=unless-stopped \
    -p 127.0.0.1:3000:3000 \
    -v /opt/reviews-maker/db:/app/db \
    reviews-maker:latest
```
4. Mettre Nginx devant (voir section 4.7) en pointant vers 127.0.0.1:3000

### 9.3 Mises à jour
```bash
docker pull ghcr.io/RAFOUgg/reviews-maker:latest
docker stop reviews-maker && docker rm reviews-maker
docker run -d --name reviews-maker -p 127.0.0.1:3000:3000 -v /opt/reviews-maker/db:/app/db reviews-maker:latest
```

### 9.4 Sauvegarde hors conteneur
`/opt/reviews-maker/db` contient la base et les images. Sauvegarder ce dossier régulièrement.

## 10. Intégration Continue (CI)

Le workflow GitHub Actions `docker-image.yml` construit et pousse automatiquement l'image multi-architecture sur GHCR à chaque push sur `main`.

Pour la déployer sur un VPS via Docker pull, ajouter un second workflow avec SSH (ex: `appleboy/ssh-action`) si désiré.

---
## 11. Checklist rapide Production
| Élément | OK ? |
|--------|------|
| Node 20 LTS ou Docker |  |
| Port interne 3000 accessible seulement local |  |
| Reverse proxy + HTTPS |  |
| Sauvegarde planifiée `db/` |  |
| PM2 ou systemd actif (non les deux) |  |
| Logs surveillés |  |
| MàJ sécurité (unattended-upgrades) |  |

---

## 12. Auth par token (brouillons privés, staff) et mini admin

Le serveur supporte un header `X-Auth-Token` (ou `?token=`). Il cherche un fichier `server/tokens/<TOKEN>`.

Format du fichier token:
- Contenu simple: l'`ownerId` (ex: ID Discord)
- JSON avancé:
```json
{ "ownerId": "123456789012345678", "roles": ["staff"] }
```

Règles d'accès:
- Sans token: on voit uniquement les reviews publiées (isDraft=0) et non privées (isPrivate=0).
- Avec token (non-staff): on voit les publiées non privées + toutes ses reviews (brouillons, privées incluses).
- Staff: accès à tout.

Endpoints utiles:
- `GET /api/reviews` — filtrage selon règles ci-dessus
- `GET /api/public/reviews` — publiées & non privées (galerie publique)
- `GET /api/my/reviews` — toutes mes reviews (token requis)
- `GET /api/admin/stats` — stats globales (staff)
- `GET /api/admin/tokens` — liste des fichiers tokens (staff, lecture seule)
- `PUT /api/reviews/:id/privacy` — changer `isPrivate` (owner ou staff)

Créer un token (staff):
```bash
echo '{"ownerId":"123456789012345678","roles":["staff"]}' | sudo tee server/tokens/MON_TOKEN
sudo chown www-data:www-data server/tokens/MON_TOKEN
```
Créer un token (utilisateur standard):
```bash
echo '123456789012345678' | sudo tee server/tokens/TOKEN_USER
sudo chown www-data:www-data server/tokens/TOKEN_USER
```
Côté client, utiliser `https://exemple.com/index.html?token=MON_TOKEN` ou `localStorage.authToken = 'MON_TOKEN'`.

Important: pour des raisons de sécurité, la création de reviews sur le serveur exige maintenant une authentification (token). Les clients non authentifiés recevront HTTP 401 lors de POST /api/reviews. De plus, les sauvegardes locales côté navigateur (IndexedDB/localStorage) sont désactivées par défaut dans la version front-end fournie — l'application attend une sauvegarde côté serveur.

Exemple intégration bot Discord/LaFoncedalle:
1) Le bot génère un token (UUID) lors de l'onboarding utilisateur.
2) Écrit `server/tokens/<TOKEN>` avec `{ ownerId: <discordId>, roles: [] }` (ou `["staff"]` pour un staff).
3) Envoie au user l'URL `https://exemple.com/index.html?token=<TOKEN>`.

Mini pages:
- `admin.html` (staff): statistiques + liste des tokens (lecture seule)
- `gallery.html` (public): galerie des reviews publiées non privées

Rappel HTTPS & sécurité:
- Nginx en frontal avec Certbot (section 4.8)
- UFW: n'ouvrir que 80/443
- Service Node écoutant sur 127.0.0.1:3000
- Sauvegarder `db/` régulièrement (base + images)

