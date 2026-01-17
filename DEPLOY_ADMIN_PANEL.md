# 🚀 Déploiement Admin Panel - Guide d'Exécution

**Date**: 17 Janvier 2025  
**Objectif**: Déployer le panel admin sur VPS pour tester les permissions V1 MVP  
**Durée estimée**: 10-15 minutes  

---

## ✅ Checklist Pré-Déploiement

- [x] **Backend** - Routes admin créées (`server-new/routes/admin.js`)
- [x] **Frontend** - AdminPanel component créé (`client/src/pages/admin/AdminPanel.jsx`)
- [x] **Integration** - Server.js et App.jsx modifiés
- [x] **Styles** - CSS complet
- [x] **Documentation** - Guides complets

**Statut**: ✅ PRÊT POUR DÉPLOIEMENT

---

## 📋 Étapes de Déploiement

### Étape 1: Vérifier le Code Local (2 min)

Vérifiez que les fichiers sont en place:

```bash
# Dans le workspace:
ls -la server-new/routes/admin.js
ls -la client/src/pages/admin/AdminPanel.jsx
ls -la client/src/pages/admin/AdminPanel.css
```

**Résultat attendu**: 3 fichiers doivent exister ✓

---

### Étape 2: Commit et Push vers GitHub (3 min)

```bash
cd c:\Users\jadeb\Desktop\RAFOU\Reviews-Maker

# Status
git status

# Add files
git add server-new/routes/admin.js
git add client/src/pages/admin/
git add client/src/App.jsx
git add server-new/server.js
git add ADMIN_PANEL_GUIDE.md
git add ADMIN_PANEL_IMPLEMENTATION.md
git add deploy-admin-panel.sh
git add test-admin-endpoints.sh

# Commit
git commit -m "feat: Add admin panel for user management and permission testing

- Created /api/admin endpoints for user management
- Admin panel frontend with user list, search, account type switching
- Quick account type changes for testing V1 MVP permissions
- Complete documentation and deployment scripts
- Security: ADMIN_MODE for dev, role-based for production"

# Push
git push origin main
```

**Résultat attendu**: Code pushé vers main ✓

---

### Étape 3: SSH vers VPS (1 min)

```bash
# Windows PowerShell
ssh vps-lafoncedalle

# Vous êtes maintenant sur le VPS
cd ~/Reviews-Maker
```

**Résultat attendu**: Connecté au VPS, dans le dossier Reviews-Maker ✓

---

### Étape 4: Pull Code et Build (5 min)

```bash
# Pull latest code
git pull origin main

# Install & build frontend
cd client
npm ci --omit=dev
npm run build
cd ..

# Install backend dependencies
cd server-new
npm ci
cd ..

echo "✅ Build complete"
```

**Résultat attendu**: Frontend built, dependencies installed ✓

---

### Étape 5: Setup Environment (2 min)

```bash
cd server-new

# Verify .env exists
ls -la .env

# Check ADMIN_MODE (optional, for testing)
grep ADMIN_MODE .env || echo "ADMIN_MODE=true" >> .env

echo "✅ Environment ready"
```

**Résultat attendu**: .env configured ✓

---

### Étape 6: Run Migrations (2 min)

```bash
# Make sure you're in server-new
cd server-new

# Run migrations
npm run prisma:migrate

echo "✅ Migrations complete"
```

**Résultat attendu**: Migrations ran successfully ✓

---

### Étape 7: Restart PM2 (2 min)

```bash
# Go back to root
cd ..

# Restart with new code
pm2 restart ecosystem.config.cjs --update-env

# Verify running
pm2 status

# Check logs
pm2 logs Reviews-Maker-Server --lines 10

echo "✅ PM2 restarted"
```

**Résultat attendu**: Services running ✓

---

### Étape 8: Test Endpoints (3 min)

```bash
# Wait for server to be ready
sleep 3

# Test admin auth endpoint
curl -s http://localhost:3001/api/admin/check-auth | head -c 100
echo ""

# Test users endpoint
curl -s http://localhost:3001/api/admin/users | head -c 200
echo ""

echo "✅ Endpoints responding"
```

**Résultat attendu**: Endpoints retournent JSON ✓

---

## 🌐 Accès au Panel Admin

Une fois déployé, accédez à:

```
https://vps-acc1787d/admin
```

**Prérequis**: Être connecté avec un compte ayant rôle admin

### Pour se donner l'accès admin (Option 1: Base de données)

```bash
# Access VPS database
mysql -u root -p reviews_maker_db

# Update your user (remplacez YOUR_USER_ID)
UPDATE users SET roles = '["admin"]' WHERE id = 'YOUR_USER_ID';

# Exit
exit;
```

### Pour se donner l'accès admin (Option 2: Environment Variable)

```bash
# Edit .env
cd ~/Reviews-Maker/server-new
nano .env

# Ajouter ou modifier:
ADMIN_MODE=true

# Restart server
cd ..
pm2 restart ecosystem.config.cjs --update-env
```

**Résultat attendu**: Pouvez accéder à /admin ✓

---

## 🧪 Test Immédiat du Panel

Une fois connecté au panel:

```
1. Vérifier le dashboard (stats affichées)
2. Vérifier la liste des utilisateurs
3. Sélectionner un utilisateur test
4. Hover sur "Account Type"
5. Click [C] pour Consumer
6. Vérifier le changement immédiat

SUCCÈS: Si utilisateur est maintenant Consumer ✅
```

---

## 🎯 Tester V1 MVP Permissions

Maintenant tester les permissions:

```bash
# 1. Change compte test à CONSUMER
Admin Panel → Click [C]

# 2. Logout admin, login utilisateur test
logout
login account-test

# 3. Aller à /create/flower
http://localhost:5173/create/flower
# ou
https://vps-acc1787d/create/flower

# 4. Vérifier: Genetics HIDDEN
# ❌ Pas de section "Génétiques" visible
# ✅ PASS: Consumer ne peut pas accéder

# 5. Return to admin, change à INFLUENCER
Click [I]

# 6. Refresh utilisateur test
F5

# 7. Vérifier: Genetics VISIBLE
# ✅ Section "Génétiques" visible
# ❌ Pas de PhenoHunt
# ✅ PASS: Influencer a accès limité

# 8. Return to admin, change à PRODUCER
Click [P]

# 9. Refresh utilisateur test
F5

# 10. Vérifier: ALL VISIBLE
# ✅ Section "Génétiques" visible
# ✅ PhenoHunt visible
# ✅ PASS: Producer a accès complet
```

**Résultat**: ✅ V1 MVP Compliance Verified!

---

## 🐛 Dépannage

### Problème: "Access Denied" sur /admin

**Solution**:
```bash
# Option 1: Set ADMIN_MODE
cd ~/Reviews-Maker/server-new
echo "ADMIN_MODE=true" >> .env
pm2 restart ecosystem.config.cjs --update-env

# Option 2: Give user admin role
mysql -u root -p reviews_maker_db
UPDATE users SET roles = '["admin"]' WHERE id = 'YOUR_ID';
```

### Problème: Admin Panel ne charge pas

**Solution**:
```bash
# Check server logs
pm2 logs Reviews-Maker-Server --lines 20

# Check client build
ls -la ~/Reviews-Maker/client/dist/

# Restart everything
pm2 restart ecosystem.config.cjs --update-env
sleep 3
pm2 logs
```

### Problème: Changement de compte type ne fonctionne pas

**Solution**:
```bash
# Check API endpoint
curl -X PATCH http://localhost:3001/api/admin/users/USER_ID/account-type \
  -H "Content-Type: application/json" \
  -d '{"accountType":"consumer"}'

# Check server logs for errors
pm2 logs Reviews-Maker-Server --lines 30

# Restart server
pm2 restart Reviews-Maker-Server
```

### Problème: Permissions ne changent pas après changement de type

**Solution**:
```bash
# User doit se reconnecter ou rafraîchir
# Logout utilisateur test
# Login à nouveau
# OU
# F5 (hard refresh)
```

---

## ✅ Vérification Post-Déploiement

Checklist finale:

- [ ] Panel admin accessible à `/admin`
- [ ] Dashboard affiche les stats
- [ ] Utilisateurs listés correctement
- [ ] Changement de type de compte fonctionne
- [ ] Permissions changent après modification
- [ ] Test V1 MVP: Consumer ne voit pas Genetics
- [ ] Test V1 MVP: Influencer voit Genetics
- [ ] Test V1 MVP: Producer voit tout
- [ ] Logs PM2 montrent pas d'erreurs

---

## 📚 Fichiers de Référence

**Sur le VPS**:
```
~/Reviews-Maker/
├── ADMIN_PANEL_GUIDE.md (Guide complet)
├── ADMIN_PANEL_IMPLEMENTATION.md (Résumé changements)
├── deploy-admin-panel.sh (Script déploiement)
├── test-admin-endpoints.sh (Script test)
├── server-new/routes/admin.js (Backend API)
├── client/src/pages/admin/ (Frontend)
└── client/src/App.jsx (Routing)
```

---

## 🎉 Vous Avez Réussi!

Si vous êtes ici, c'est que:

✅ Admin Panel est déployé  
✅ Vous pouvez changer les types de comptes  
✅ Vous pouvez tester les permissions V1 MVP  
✅ Le système est prêt pour la production  

**Prochaines étapes**:
1. Documenter les résultats des tests
2. Faire un PR final du V1 MVP
3. Marquer les issues comme resolved
4. Documenter pour la production (remove ADMIN_MODE si nécessaire)

---

**Support**: Voir `ADMIN_PANEL_GUIDE.md` pour plus de détails.

---

**Version**: 1.0  
**Status**: ✅ READY TO DEPLOY
