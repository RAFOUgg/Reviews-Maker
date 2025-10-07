# 🐳 Configuration Docker - LaFoncedalleBot + Reviews-Maker

## 🎯 Votre situation

- ✅ LaFoncedalleBot tourne dans Docker
- ✅ Reviews-Maker tourne avec PM2 (hors Docker)
- ❌ Reviews-Maker ne peut pas joindre LaFoncedalleBot

## 🔧 Solution 1 : Exposer le port Flask (RAPIDE)

### Étape 1 : Vérifier si le port est exposé

```bash
docker ps
```

**Cherchez la colonne PORTS :**
- ✅ `0.0.0.0:5000->5000/tcp` → Le port EST exposé
- ❌ `5000/tcp` → Le port N'EST PAS exposé

### Étape 2A : Si le port N'EST PAS exposé

**Avec docker run :**
```bash
docker stop lafoncedalle
docker rm lafoncedalle

docker run -d \
  --name lafoncedalle \
  -p 5000:5000 \  # ← AJOUTER CETTE LIGNE
  -v /chemin/vers/data:/app/data \
  votre-image-lafoncedalle
```

**Avec docker-compose.yml :**
```yaml
version: '3.8'

services:
  lafoncedalle:
    image: votre-image
    container_name: lafoncedalle
    ports:
      - "5000:5000"  # ← AJOUTER CETTE LIGNE
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

Puis :
```bash
docker-compose down
docker-compose up -d
```

### Étape 2B : Si le port EST déjà exposé

Testez simplement depuis l'hôte :
```bash
curl http://localhost:5000/
```

Vous devriez voir : `"L'application pont Shopify-Discord est en ligne."`

### Étape 3 : Configurer Reviews-Maker

```bash
nano ~/Reviews-Maker/server/ecosystem.config.cjs
```

```javascript
env_production: {
  PORT: 3000,
  NODE_ENV: 'production',
  LAFONCEDALLE_API_URL: 'http://localhost:5000',  // ← localhost car port exposé
  LAFONCEDALLE_API_KEY: 'votre_cle_api'
}
```

Redémarrer :
```bash
pm2 restart reviews-maker
```

---

## 🔧 Solution 2 : Utiliser l'IP du container (SANS REDÉMARRAGE)

Si vous ne pouvez pas redémarrer le container :

### Étape 1 : Trouver l'IP du container

```bash
docker inspect lafoncedalle | grep \"IPAddress\"
```

**Résultat attendu :**
```json
"IPAddress": "172.17.0.2",
```

### Étape 2 : Tester l'accès

```bash
curl http://172.17.0.2:5000/
```

Si ça fonctionne, continuez.

### Étape 3 : Configurer Reviews-Maker

```bash
nano ~/Reviews-Maker/server/ecosystem.config.cjs
```

```javascript
env_production: {
  PORT: 3000,
  NODE_ENV: 'production',
  LAFONCEDALLE_API_URL: 'http://172.17.0.2:5000',  // ← IP du container
  LAFONCEDALLE_API_KEY: 'votre_cle_api'
}
```

Redémarrer :
```bash
pm2 restart reviews-maker
```

---

## 🔧 Solution 3 : Mettre Reviews-Maker dans Docker (OPTIMAL)

### Étape 1 : Créer un Dockerfile pour Reviews-Maker

```bash
cd ~/Reviews-Maker
nano Dockerfile
```

**Contenu :**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers du serveur
COPY server/package*.json ./
RUN npm install

# Copier tout le code
COPY . .

# Exposer le port
EXPOSE 3000

# Créer les dossiers nécessaires
RUN mkdir -p /app/db/review_images /app/server/tokens /app/logs

# Démarrer l'application
CMD ["node", "server/server.js"]
```

### Étape 2 : Créer un docker-compose.yml complet

```bash
cd ~
nano docker-compose.yml
```

**Contenu :**
```yaml
version: '3.8'

services:
  # Service LaFoncedalleBot existant
  lafoncedalle-bot:
    container_name: lafoncedalle
    image: votre-image-lafoncedalle  # Ou build: ./LaFoncedalleBot
    ports:
      - "5000:5000"
    volumes:
      - ./LaFoncedalleBot/data:/app/data
    environment:
      - REVIEWS_MAKER_API_KEY=${REVIEWS_MAKER_API_KEY}
    networks:
      - app-network
    restart: unless-stopped

  # Nouveau service Reviews-Maker
  reviews-maker:
    container_name: reviews-maker
    build: ./Reviews-Maker
    ports:
      - "3000:3000"
    volumes:
      - ./Reviews-Maker/db:/app/db
      - ./Reviews-Maker/server/tokens:/app/server/tokens
    environment:
      - PORT=3000
      - NODE_ENV=production
      - LAFONCEDALLE_API_URL=http://lafoncedalle-bot:5000  # ← Nom du service
      - LAFONCEDALLE_API_KEY=${LAFONCEDALLE_API_KEY}
    networks:
      - app-network
    depends_on:
      - lafoncedalle-bot
    restart: unless-stopped

networks:
  app-network:
    driver: bridge
```

### Étape 3 : Créer un fichier .env

```bash
nano .env
```

**Contenu :**
```bash
REVIEWS_MAKER_API_KEY=votre_cle_generee_ici
LAFONCEDALLE_API_KEY=votre_cle_generee_ici
```

### Étape 4 : Démarrer tout

```bash
# Arrêter l'ancien setup
pm2 stop reviews-maker
docker stop lafoncedalle

# Démarrer avec docker-compose
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

---

## 🧪 Tests selon la solution choisie

### Test 1 : Depuis l'hôte (Solution 1)

```bash
# Test LaFoncedalleBot
curl http://localhost:5000/

# Test Reviews-Maker
curl http://localhost:3000/api/ping
```

### Test 2 : Avec IP du container (Solution 2)

```bash
# Test LaFoncedalleBot
curl http://172.17.0.2:5000/

# Reviews-Maker reste sur PM2
pm2 logs reviews-maker
```

### Test 3 : Avec Docker Compose (Solution 3)

```bash
# Test depuis l'extérieur
curl http://localhost:5000/
curl http://localhost:3000/api/ping

# Test de communication entre containers
docker exec reviews-maker curl http://lafoncedalle-bot:5000/
```

---

## 📊 Comparaison des solutions

| Solution | Avantages | Inconvénients |
|----------|-----------|---------------|
| **1. Exposer port** | ✅ Rapide<br>✅ Pas de changement majeur | ❌ Docker → PM2 (pas idéal)<br>❌ IP peut changer |
| **2. IP container** | ✅ Aucun redémarrage<br>✅ Test rapide | ❌ IP peut changer au reboot<br>❌ Temporaire |
| **3. Docker Compose** | ✅ Architecture propre<br>✅ Scalable<br>✅ Resilient | ❌ Plus de setup initial<br>❌ Apprentissage Docker |

---

## 🎯 Recommandation

**Pour le test immédiat :** Solution 2 (IP du container)

**Pour la production :** Solution 3 (Docker Compose)

---

## 🔍 Diagnostic rapide

```bash
# 1. Container tourne ?
docker ps | grep lafoncedalle

# 2. Port exposé ?
docker port lafoncedalle

# 3. IP du container ?
docker inspect lafoncedalle | grep IPAddress

# 4. Logs du container ?
docker logs lafoncedalle --tail 50

# 5. Test depuis le container ?
docker exec lafoncedalle curl http://localhost:5000/
```

---

## 🆘 En cas de problème

**Container ne démarre pas :**
```bash
docker logs lafoncedalle
```

**Port déjà utilisé :**
```bash
sudo netstat -tlnp | grep 5000
# Changer le port dans docker-compose.yml
```

**Pas d'accès réseau :**
```bash
# Vérifier le réseau Docker
docker network ls
docker network inspect bridge
```

**Reviews-Maker ne peut pas joindre LaFoncedalle :**
```bash
# Test depuis Reviews-Maker
docker exec reviews-maker curl http://lafoncedalle-bot:5000/
```

---

## 📚 Prochaines étapes

1. ✅ Choisir une solution (2 pour test, 3 pour prod)
2. ✅ Appliquer la configuration
3. ✅ Tester les endpoints avec curl
4. ✅ Tester depuis le navigateur
5. ✅ Surveiller les logs : `docker logs -f`

**Besoin d'aide ? Montrez-moi le résultat de `docker ps` et `docker inspect lafoncedalle | grep IPAddress` !**
