# 🔍 DIAGNOSTIC - LaFoncedalleBot ne répond pas

## ❌ Erreur observée
```
curl: (7) Failed to connect to localhost port 5000 after 0 ms: Could not connect to server
```

## ✅ SOLUTIONS

### Solution 1 : Vérifier si LaFoncedalleBot est démarré

```bash
pm2 list
```

**Cherchez :** `lafoncedalle-bot` ou similaire dans la liste

**Si absent ou "stopped" :**
```bash
cd ~/LaFoncedalleBot
pm2 start ecosystem.config.js  # ou le nom de votre fichier de config
# ou
pm2 start web_api/app.py --name lafoncedalle-bot --interpreter python3
```

### Solution 2 : Vérifier quel port est utilisé

```bash
pm2 logs lafoncedalle-bot --lines 50
```

**Cherchez une ligne comme :**
```
* Running on http://0.0.0.0:5000/
* Running on http://127.0.0.1:5000/
```

Si vous voyez un **autre port** (par exemple 8000, 8080, 3001), utilisez ce port dans vos tests !

### Solution 3 : Vérifier les ports ouverts

```bash
netstat -tlnp | grep python
# ou
ss -tlnp | grep python
```

**Cherchez :** `:5000` ou un autre port où Python écoute

### Solution 4 : Démarrer manuellement pour tester

```bash
cd ~/LaFoncedalleBot
source venv/bin/activate  # Si vous utilisez un venv
python3 web_api/app.py
```

Vous devriez voir :
```
* Running on http://0.0.0.0:5000/
```

**Laissez tourner** et dans un **autre terminal**, refaites le test curl.

### Solution 5 : Test avec l'API existante

Si LaFoncedalleBot tourne déjà, testez un endpoint existant :

```bash
# Test de santé
curl http://localhost:5000/

# Devrait retourner : "L'application pont Shopify-Discord est en ligne."
```

Si ça ne marche pas, le serveur Flask n'est vraiment pas démarré.

## 🔧 COMMANDES DE DIAGNOSTIC COMPLÈTES

Exécutez ces commandes dans l'ordre :

```bash
# 1. Vérifier les processus PM2
echo "=== PM2 Status ==="
pm2 list

# 2. Vérifier les ports ouverts
echo "=== Ports ouverts ==="
sudo netstat -tlnp | grep -E ':(5000|8000|3001)'

# 3. Vérifier les logs récents
echo "=== Logs récents ==="
pm2 logs --lines 20 --nostream

# 4. Vérifier si le fichier app.py existe
echo "=== Fichier app.py ==="
ls -la ~/LaFoncedalleBot/web_api/app.py

# 5. Tester le serveur directement
echo "=== Test direct ==="
curl -v http://localhost:5000/
```

## 🎯 RÉSOLUTION PROBABLE

**Scénario le plus probable :** LaFoncedalleBot utilise un **autre nom de service** ou un **autre port**.

### Vérifiez avec :
```bash
pm2 list | grep -i fonce
```

Vous devriez voir quelque chose comme :
- `lafoncedalle-analytics` (port 5000)
- `lafoncedalle-bot` (le bot Discord, pas l'API)

**L'API web est probablement dans `lafoncedalle-analytics` !**

### Test avec le bon service :
```bash
# Si c'est lafoncedalle-analytics
pm2 logs lafoncedalle-analytics --lines 20

# Test API
curl http://localhost:5000/
```

## 📋 CHECKLIST RAPIDE

- [ ] `pm2 list` montre un service actif (status: "online")
- [ ] Les logs ne montrent pas d'erreur : `pm2 logs`
- [ ] Le port 5000 est bien utilisé : `netstat -tlnp | grep 5000`
- [ ] curl vers `/` fonctionne : `curl http://localhost:5000/`
- [ ] Le fichier `web_api/app.py` existe et contient les endpoints

## 🚀 DÉMARRAGE RAPIDE DE LAFONCEDALLE

Si rien ne fonctionne, démarrez manuellement :

```bash
cd ~/LaFoncedalleBot

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances si besoin
pip install -r requirements.txt

# Lancer l'application
python3 web_api/app.py
```

Vous verrez :
```
 * Running on http://0.0.0.0:5000/
 * Running on http://127.0.0.1:5000/
Press CTRL+C to quit
```

**Puis dans un autre terminal**, refaites le test curl.

## 💡 NOTE IMPORTANTE

D'après votre architecture Docker visible dans le terminal, il semble que LaFoncedalleBot tourne peut-être dans un **container Docker** !

### Si c'est le cas :

```bash
# Lister les containers
docker ps

# Accéder au container
docker exec -it lafoncedalle-bot bash  # ou le nom du container

# Tester depuis le container
curl http://localhost:5000/
```

**OU depuis l'hôte :**
```bash
# Trouver l'IP du container
docker inspect lafoncedalle-bot | grep IPAddress

# Tester avec l'IP
curl http://172.17.0.2:5000/  # Remplacer par la bonne IP
```

---

**Faites-moi savoir ce que donnent ces commandes et je pourrai vous aider précisément !**
