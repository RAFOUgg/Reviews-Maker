# Backend Reviews Maker

API Express + SQLite pour la persistance des reviews et stockage fichiers (images uploadées).

## 1. Démarrage local

```bash
cd server
npm install
npm start   # lance sur http://localhost:3000
```

Le backend sert aussi les fichiers statiques du dossier racine (index.html, review.html, app.js...).
Tu peux donc ouvrir: http://localhost:3000/index.html

## 2. Structure

- `server/server.js` : API Express
- `db/reviews.sqlite` : base SQLite générée automatiquement
- `db/review_images/` : stockage des images uploadées

## 3. Endpoints

| Méthode | URL                  | Description |
|---------|---------------------|-------------|
| GET     | /api/ping           | Test vie serveur |
| GET     | /api/reviews        | Liste (max 500) |
| GET     | /api/reviews/:id    | Détail |
| POST    | /api/reviews        | Création (multipart ou JSON) |
| PUT     | /api/reviews/:id    | Mise à jour |
| DELETE  | /api/reviews/:id    | Suppression |

Payload JSON principal = l'objet complet de la review (les champs utilisés dans `app.js`).
Si une image est uploadée via champ `image`, on renvoie `image: /images/<fichier>`.

## 4. Déploiement sur un serveur Ubuntu (production)

### 4.1 Pré-requis
- Nom de domaine pointant vers le serveur (A / AAAA).
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

### 4.5 Service systemd
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

### 4.6 Nginx reverse proxy
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

### 4.7 HTTPS (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d exemple.com -d www.exemple.com
# Répondre aux questions, choisir redirection HTTPS
```
Certificat auto-renouvelé par timer systemd.

### 4.8 Sauvegardes / Mises à jour
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

### 4.9 Sécurité rapide
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
