# 🚀 DÉPLOIEMENT DES CORRECTIONS SUR VPS

## 📋 Procédure de déploiement complète

### Étape 1 : Commit et push des modifications locales

```powershell
# Dans le terminal local (VS Code)
git add .
git commit -m "fix: correction complète des thèmes - remplacement rgba() par classes utilitaires

- Ajout de 20+ classes CSS utilitaires (bg-theme-*, border-theme, text-theme-*)
- Correction de 94+ occurrences rgba() transparentes dans 17 fichiers JSX
- Fix dropdowns non stylisés sur tous les thèmes
- Fix modals transparents (CultivarLibraryModal)
- Fix inputs/selects illisibles sur thèmes clairs (Sakura, Émeraude, Tahiti)
- Fix textes blancs sur fonds clairs
- Fix Pipeline & Fertilization transparents
- Compatible avec tous les 5 thèmes

Fichiers modifiés:
- index.css (classes utilitaires + dropdown styles)
- FertilizationPipeline, PipelineWithCultivars, PurificationPipeline
- CultivarLibraryModal, CultivarList, EffectSelector
- CreateReviewPage, EditReviewPage, FilterBar
- HomePage, LibraryPage, StatsPage
- SectionNavigator, UserProfileDropdown, WheelSelector, HomeReviewCard"

git push origin feat/templates-backend
```

### Étape 2 : Connexion au VPS et mise à jour

```powershell
# Connexion SSH
ssh vps-lafoncedalle
```

```bash
# Une fois connecté au VPS
cd /chemin/vers/Reviews-Maker  # Adapter le chemin

# Pull des dernières modifications
git fetch origin
git pull origin feat/templates-backend  # Ou main si vous avez mergé

# Vérifier les fichiers modifiés
git log -1 --stat
```

### Étape 3 : Rebuild du client (CRITIQUE)

```bash
# Naviguer vers le dossier client
cd client

# Installer les dépendances si nécessaire
npm install

# REBUILD de production avec les nouvelles modifications
npm run build

# Vérifier que dist/ a été créé/mis à jour
ls -lh dist/
```

### Étape 4 : Redémarrer PM2

```bash
# Redémarrer l'application
pm2 restart reviews-maker  # Adapter le nom de votre app PM2

# Ou si vous avez plusieurs instances
pm2 restart all

# Vérifier le statut
pm2 status
pm2 logs reviews-maker --lines 50
```

### Étape 5 : Vider le cache Nginx (optionnel mais recommandé)

```bash
# Si Nginx met en cache les assets statiques
sudo nginx -t  # Tester la config
sudo systemctl reload nginx

# Ou redémarrer complètement
sudo systemctl restart nginx
```

### Étape 6 : Test sur le navigateur

1. **Ouvrir votre site en production** (ex: https://votre-domaine.com/reviews)

2. **FORCER le rechargement du cache navigateur :**
   - `Ctrl + Shift + R` (Windows/Linux)
   - `Cmd + Shift + R` (Mac)
   - Ou mode navigation privée

3. **Tester les 5 thèmes :**
   - Violet Lean
   - Émeraude
   - Tahiti
   - Sakura
   - Minuit

4. **Vérifier que tout est opaque et lisible**

---

## 🔧 Configuration PM2 de référence

### Si vous utilisez ecosystem.config.cjs :

```javascript
module.exports = {
  apps: [{
    name: 'reviews-maker',
    script: './server/server.js',
    cwd: '/chemin/vers/Reviews-Maker',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M'
  }]
}
```

### Commandes PM2 utiles :

```bash
# Démarrer avec config
pm2 start ecosystem.config.cjs --env production

# Redémarrer après modifications
pm2 restart reviews-maker

# Logs en temps réel
pm2 logs reviews-maker

# Monitorer
pm2 monit

# Sauvegarder la config pour auto-restart au boot
pm2 save
pm2 startup
```

---

## 🔍 Configuration Nginx de référence

### Exemple de config pour /reviews :

```nginx
location /reviews {
    alias /chemin/vers/Reviews-Maker/client/dist;
    try_files $uri $uri/ /reviews/index.html;
    
    # Headers pour forcer le rechargement (développement)
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

location /reviews/api {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

location /reviews/images {
    alias /chemin/vers/Reviews-Maker/db/review_images;
}
```

### Après modification de la config Nginx :

```bash
# Tester la syntaxe
sudo nginx -t

# Recharger sans downtime
sudo systemctl reload nginx

# Redémarrer complètement si nécessaire
sudo systemctl restart nginx
```

---

## ✅ Checklist de vérification post-déploiement

### Sur le VPS :
- [ ] `git pull` effectué avec succès
- [ ] `npm run build` dans client/ terminé sans erreur
- [ ] `dist/` contient les nouveaux fichiers (vérifier la date de modification)
- [ ] PM2 redémarré sans erreur (`pm2 status` = online)
- [ ] Nginx redémarré/rechargé

### Sur le navigateur (en prod) :
- [ ] Cache vidé (Ctrl+Shift+R)
- [ ] Thème Émeraude : tout visible et opaque
- [ ] Thème Sakura : tout visible et opaque
- [ ] Thème Tahiti : tout visible et opaque
- [ ] Dropdowns stylisés avec couleur du thème
- [ ] CultivarLibraryModal opaque
- [ ] Pipeline/Fertilization visible
- [ ] Pas de texte blanc sur fond clair

---

## 🐛 Troubleshooting

### Problème : Les changements ne sont pas visibles après déploiement

**Solution 1 : Vérifier que le build a bien pris les modifications**
```bash
cd client
rm -rf dist/
npm run build
ls -lh dist/assets/*.css  # Vérifier la date de modification
```

**Solution 2 : Vérifier les logs PM2**
```bash
pm2 logs reviews-maker --lines 100
# Chercher des erreurs de compilation
```

**Solution 3 : Forcer Nginx à ne pas cacher (temporaire)**
```nginx
# Dans la config Nginx location /reviews
add_header Cache-Control "no-cache, no-store, must-revalidate";
```

**Solution 4 : Vérifier que Nginx sert bien le bon dossier**
```bash
# Tester l'accès au fichier CSS
curl -I http://localhost/reviews/assets/*.css
# Doit retourner 200 avec la bonne date de modification
```

**Solution 5 : Mode navigation privée**
Toujours tester en mode incognito pour éviter les problèmes de cache navigateur

---

## 📊 Résumé des modifications déployées

### Fichiers CSS modifiés :
- `client/src/index.css` : +80 lignes
  - Classes utilitaires `.bg-theme-*`
  - Styles dropdowns `select option`
  - Classes danger `.bg-theme-danger`

### Fichiers JSX modifiés : 17 fichiers
**Tous les `bg-[rgba(...)]` remplacés par `bg-theme-*`**

### Impact attendu :
- ✅ 100% lisibilité sur les 5 thèmes
- ✅ Tous les dropdowns stylisés
- ✅ Tous les modals opaques
- ✅ Tous les inputs/buttons visibles

---

## 🚨 IMPORTANT

**NE PAS oublier de rebuild le client !**

Les modifications JSX/CSS ne prennent effet en production que si vous exécutez :
```bash
cd client && npm run build
```

Sans cela, Nginx sert l'ancien `dist/` et les modifications ne sont pas visibles.

---

**Prochaine étape : Exécutez les commandes ci-dessus sur le VPS et testez !**
