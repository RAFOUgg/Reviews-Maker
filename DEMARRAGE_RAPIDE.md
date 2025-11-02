# 🚀 DÉMARRAGE RAPIDE - Reviews Maker

## ⚡ Méthode Simple (Windows)

### 1️⃣ Démarrer le serveur
**Double-cliquez sur**: `START_SERVER.bat`

Vous verrez:
```
========================================
  Reviews Maker - Demarrage Serveur
========================================

[1/3] Verification de Node.js...
  OK - Node.js trouve

[2/3] Verification des dependances...
  OK - Dependances installees

[3/3] Demarrage du serveur...

========================================
  Serveur demarre sur:
  http://localhost:3000
========================================

Reviews Maker API running on port 3000
```

✅ Le serveur est maintenant actif!

---

### 2️⃣ Ouvrir le site
**Double-cliquez sur**: `OPEN_SITE.bat`

Le site s'ouvrira automatiquement dans votre navigateur à l'adresse:
```
http://localhost:3000/index.html
```

✅ Vous pouvez maintenant utiliser le site!

---

## 🛠️ Méthode Manuelle (Ligne de commande)

### Démarrer le serveur:
```bash
cd server
npm install  # Première fois uniquement
npm start
```

### Ouvrir le site:
```
http://localhost:3000/index.html
```

---

## 🧪 Tester les Corrections

Une fois le site ouvert sur `localhost:3000`, testez:

### ✅ Test #1: Stats Utilisateur
1. Se connecter avec votre email
2. Créer quelques reviews
3. Cliquer "Mon compte"
4. **Vérifier**: Les stats affichent le bon nombre

### ✅ Test #2: Profil Public
1. Cliquer sur une review d'un autre utilisateur
2. Le profil public s'ouvre
3. Cliquer "Mon compte" dans le header
4. **Vérifier**: Le profil public se ferme, seul "Mon compte" reste visible

### ✅ Test #3: Dropdowns
1. Ouvrir "Mon compte"
2. Cliquer sur le dropdown des thèmes
3. Cliquer sur un profil public
4. **Vérifier**: Le dropdown se ferme automatiquement

### ✅ Test #4: Page Editor
1. Aller sur `http://localhost:3000/review.html?type=Fleur`
2. Ouvrir la console (F12)
3. **Vérifier**: Le formulaire est visible, pas d'erreur

---

## ❌ En Cas de Problème

### Le serveur ne démarre pas
**Erreur**: `node: command not found`  
**Solution**: Installer Node.js depuis https://nodejs.org/

**Erreur**: `Error: Cannot find module`  
**Solution**: 
```bash
cd server
npm install
npm start
```

### Le site ne charge pas
**Erreur**: `ERR_CONNECTION_REFUSED`  
**Solution**: Le serveur n'est pas démarré. Lancez `START_SERVER.bat`

**Erreur**: `404 Not Found`  
**Solution**: Vérifiez l'URL: `http://localhost:3000/index.html` (pas juste `localhost:3000`)

### Erreur 400 dans la console
**Cause**: Vous êtes sur `reviews-maker.fr` au lieu de `localhost:3000`  
**Solution**: Utilisez `http://localhost:3000/index.html`

---

## 📁 Structure du Projet

```
Reviews-Maker/
├── START_SERVER.bat       ← 🔴 Démarrer le serveur (DOUBLE-CLIQUER)
├── OPEN_SITE.bat          ← 🌐 Ouvrir le site (DOUBLE-CLIQUER)
├── index.html             ← Page d'accueil
├── review.html            ← Page éditeur
├── app.js                 ← Code principal
├── styles.css             ← Styles
├── server/                ← Backend Node.js
│   ├── server.js          ← Serveur principal
│   ├── routes/            ← Routes API
│   └── package.json       ← Dépendances
├── db/                    ← Base de données
│   ├── reviews.sqlite     ← Données des reviews
│   └── review_images/     ← Images uploadées
└── src/                   ← Modules JavaScript
    └── storage-manager.js ← Gestion du stockage
```

---

## 🔧 Commandes Utiles

### Arrêter le serveur:
**Windows**: Appuyez sur `Ctrl+C` dans le terminal où le serveur tourne  
**Ligne de commande**: `taskkill /F /IM node.exe`

### Vérifier si le serveur tourne:
```bash
netstat -an | findstr :3000
# Devrait afficher: LISTENING
```

### Redémarrer le serveur:
1. Arrêter (Ctrl+C)
2. Relancer `npm start`

### Vider le cache du navigateur:
**Méthode rapide**: `Ctrl + Shift + R` (force reload)  
**Méthode complète**: `Ctrl + Shift + Delete` → Cocher "Cached images and files" → Clear

---

## 📚 Documentation Complète

- **GUIDE_SERVEUR_LOCAL.md** - Différence local vs en ligne
- **GUIDE_VIDER_CACHE.md** - Comment vider le cache navigateur
- **DIAGNOSTIC_BUGS_CRITIQUES.md** - Analyse des bugs
- **CORRECTIONS_APPLIQUEES.md** - Liste des corrections backend
- **CORRECTIONS_BUGS_GRAPHIQUES.md** - Liste des corrections CSS
- **RECAPITULATIF_COMPLET.md** - Résumé de toutes les corrections

---

## 🚀 Workflow Complet

### 1. Développement Local
```
1. START_SERVER.bat       (Démarrer backend)
2. OPEN_SITE.bat          (Ouvrir site local)
3. Tester les corrections (localhost:3000)
```

### 2. Après Validation
```
1. git add .
2. git commit -m "fix: corrections"
3. git push
```

### 3. Déploiement VPS
```
1. ssh vps-lafoncedalle
2. cd /path/to/reviews-maker
3. git pull
4. pm2 restart reviews-maker
```

### 4. Production
```
https://reviews-maker.fr (corrections maintenant en ligne)
```

---

## 🎯 Résumé

| Étape | Action | Fichier |
|-------|--------|---------|
| 1 | Démarrer le serveur | `START_SERVER.bat` |
| 2 | Ouvrir le site | `OPEN_SITE.bat` OU `http://localhost:3000/index.html` |
| 3 | Tester | Voir checklist tests ci-dessus |
| 4 | Commit | `git add`, `git commit`, `git push` |
| 5 | Déployer | SSH VPS → `git pull` → `pm2 restart` |

---

## ✅ Corrections Appliquées

- ✅ Endpoint `/api/reviews/stats` pour les stats utilisateur
- ✅ Fermeture automatique du profil public
- ✅ Fermeture automatique des dropdowns
- ✅ Z-index des modals harmonisé
- ✅ Ordre de chargement des scripts corrigé
- ✅ CSS overlay profil public ajouté

**Toutes les corrections sont maintenant disponibles sur `localhost:3000`!** 🎉

---

**🔴 IMPORTANT**: Utilisez toujours `localhost:3000` pour tester, pas `reviews-maker.fr` (version en ligne sans corrections).
