# 🚀 Guide de Mise à Jour sur le VPS

## ✅ Étapes à Suivre sur le VPS Ubuntu

Vous êtes déjà connecté en SSH. Exécutez ces commandes :

### 1. Récupérer les Changements

```bash
cd ~/Reviews-Maker
git pull origin main
```

### 2. Installer les Dépendances (si nécessaire)

```bash
cd ~/Reviews-Maker/server
npm install
```

### 3. Redémarrer le Serveur

```bash
pm2 restart reviews-maker
```

### 4. Vérifier que Tout Fonctionne

```bash
# Vérifier les logs
pm2 logs reviews-maker --lines 30

# Tester l'API
curl http://localhost:3000/api/ping
```

Devrait retourner : `{"ok":true,"time":1696...}`

### 5. Tester dans le Navigateur

1. **Ouvrir** : `http://51.75.22.192/review.html` (ou votre domaine)
2. **Vider le cache** : `Ctrl + Shift + R` ou `Ctrl + F5`
3. **Vérifier** :
   - Les boutons affichent bien les émojis (👁️ 💡 📁 🔗)
   - Les caractères français sont corrects (é, è, à, ô)
   - Le bouton flottant 🔗 en bas à droite fonctionne
   - Les notifications apparaissent en bas à gauche et sont cliquables

---

## 🔧 Ce Qui a Été Corrigé

### Problème 1: Encodage UTF-8 Corrompu
**Symptôme** : ƒü¿ ØÅ, ƒÉ¥, ƒôå au lieu de 👁️ 💡 📁

**Cause** : Le middleware Express forçait `text/html` sur toutes les réponses, même les JSON

**Solution** : 
- Supprimé le middleware global
- Ajouté `setHeaders` uniquement pour les fichiers statiques (.html, .css, .js)
- Les réponses JSON ne sont plus affectées

### Problème 2: Notifications Non Cliquables
**Symptôme** : Notifications s'affichent mais ne disparaissent pas au clic

**Solution** :
- Modifié `showAuthStatus()` dans `app.js`
- Notifications créées dynamiquement dans le DOM
- Event listener ajouté pour fermer au clic
- Positionnement en bas à gauche avec animation

### Problème 3: Modal Uniquement sur review.html
**Symptôme** : Le bouton de connexion ne fonctionnait que sur review.html

**Solution** :
- Le modal existe déjà sur les deux pages (index.html et review.html)
- Les event listeners sont globaux dans app.js
- Si le problème persiste, vider le cache navigateur

---

## 📋 Checklist Post-Déploiement

Une fois que vous avez fait `git pull` et `pm2 restart` :

- [ ] `curl http://localhost:3000/api/ping` retourne un JSON valide
- [ ] Les logs PM2 ne montrent pas d'erreurs : `pm2 logs reviews-maker`
- [ ] Cache navigateur vidé : Ctrl+Shift+R
- [ ] Émojis correctement affichés : 👁️ 💡 📁 🔗
- [ ] Caractères français corrects : é è à ç ô
- [ ] Bouton flottant 🔗 visible en bas à droite
- [ ] Modal s'ouvre au clic sur le bouton
- [ ] Notifications apparaissent en bas à gauche
- [ ] Notifications disparaissent au clic
- [ ] Console navigateur (F12) sans erreurs JavaScript

---

## ❌ Si Les Caractères Sont Toujours Mal Affichés

### Option 1: Problème de Cache Navigateur

```bash
# Sur le VPS, vérifier que les fichiers sont corrects
cd ~/Reviews-Maker
head -20 review.html
```

Les premières lignes devraient être :
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
```

**Pas** :
```html
<!DOCTYPE html>
<html lang="fr">          <button type="button"
```

Si le fichier est corrompu sur le VPS, faites :

```bash
cd ~/Reviews-Maker
git fetch origin
git reset --hard origin/main
pm2 restart reviews-maker
```

### Option 2: Problème Nginx (si utilisé)

Si vous utilisez Nginx, ajoutez dans la config :

```nginx
server {
    charset utf-8;
    
    location / {
        try_files $uri $uri/ =404;
    }
}
```

Puis :
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Option 3: Le Fichier review.html Est Corrompu dans Git

Si `head -20 review.html` montre un fichier corrompu, le problème est dans Git.

**Solution radicale** :
```bash
cd ~/Reviews-Maker
# Sauvegarder les reviews
cp -r db db_backup

# Supprimer le fichier corrompu
rm review.html

# Télécharger une version propre depuis index.html comme base
cp index.html review_template.html

# Vous devrez ensuite adapter review_template.html manuellement
# OU attendre un nouveau commit propre depuis le développement local
```

---

## 🆘 Support Rapide

### Le serveur ne démarre pas
```bash
pm2 logs reviews-maker --lines 50
```

Cherchez des erreurs comme :
- `Error: Cannot find module` → `npm install`
- `EADDRINUSE` → Port 3000 déjà utilisé → `pm2 restart reviews-maker`
- `SyntaxError` → Problème dans le code → Vérifiez les derniers commits

### L'API ne répond pas
```bash
# Tester l'API
curl -v http://localhost:3000/api/ping

# Vérifier le processus
pm2 status

# Voir les ports
netstat -tulpn | grep 3000
```

### Les changements ne s'appliquent pas
```bash
# Forcer la mise à jour
cd ~/Reviews-Maker
git fetch origin
git reset --hard origin/main
pm2 restart reviews-maker

# Vider les logs PM2
pm2 flush

# Tester à nouveau
pm2 logs reviews-maker
```

---

## 📚 Documentation Complète

- **INTEGRATION_LAFONCEDALLE.md** - Intégration avec l'API LaFoncedalle
- **TROUBLESHOOTING.md** - Guide de résolution des problèmes courants
- **DEPLOIEMENT_VPS.md** - Guide complet de déploiement
- **REPARATION_REVIEW_HTML.md** - Réparer le fichier review.html corrompu

---

## 🎯 Résumé des Commandes

```bash
# Mise à jour standard
cd ~/Reviews-Maker && git pull && pm2 restart reviews-maker

# Mise à jour forcée (si problèmes)
cd ~/Reviews-Maker && git fetch origin && git reset --hard origin/main && pm2 restart reviews-maker

# Diagnostic complet
pm2 status && pm2 logs reviews-maker --lines 30 && curl http://localhost:3000/api/ping

# Nettoyage complet
cd ~/Reviews-Maker && git clean -fd && git reset --hard origin/main && cd server && npm install && cd .. && pm2 restart reviews-maker
```

---

**Bon déploiement ! 🚀**

Si vous rencontrez encore des problèmes après avoir suivi ces étapes, partagez :
1. Le résultat de `pm2 logs reviews-maker`
2. Le résultat de `curl http://localhost:3000/api/ping`
3. Un screenshot de la console navigateur (F12)
