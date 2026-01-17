# 🔧 COMMANDES À EXÉCUTER SUR VPS

Exécute ces commandes sur le VPS:

```bash
# 1. Rentre dans le répertoire
cd ~/Reviews-Maker

# 2. Pull les derniers changements (App.jsx est maintenant propre)
git pull origin main

# 3. Build le client
cd client
npm run build
cd ..

# 4. Redémarre PM2
pm2 restart reviews-maker

# 5. Vérifie que tout fonctionne
pm2 logs reviews-maker --lines 50
```

## ✅ Changements Poussés

- ✅ **App.jsx nettoyé**: Suppression des imports fantômes (SettingsPage, ProfileSettingsPage, PreferencesPage)
- ✅ **Route /admin protégée**: Maintenant avec PrivateRoute + requiredRole="admin"
- ✅ **PrivateRoute.jsx créé**: Composant de protection des routes

## 🧪 Tests À Faire Après Deploy

- [ ] Ouvrir http://vps-address/
- [ ] Test `/account` avec 6 onglets
- [ ] Test `/admin` (devrait rediriger vers /login si pas auth)
- [ ] Test export pour fleurs, hash, concentrés, comestibles
