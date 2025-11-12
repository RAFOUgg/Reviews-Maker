# Correctif - Problème d'édition de review

**Date**: 10 novembre 2025  
**Problème**: Impossible de modifier une review, erreur 400 lors du chargement

## 🔍 Diagnostic

### Symptômes observés
- Erreur 400 (Bad Request) lors de la tentative d'édition d'une review
- L'utilisateur est redirigé vers la page d'accueil sans message d'erreur clair
- La console du navigateur affiche des erreurs de chargement

### Causes identifiées
1. **Manque de logs de débogage** : Difficile de diagnostiquer l'erreur exacte
2. **Race condition** : Le composant `EditReviewPage` chargeait la review avant que l'utilisateur ne soit complètement chargé
3. **Credentials manquants** : Le fetch de la review n'incluait pas explicitement `credentials: 'include'`
4. **Manque de garantie sur authorId** : Le backend ne garantissait pas explicitement que `authorId` soit toujours présent dans la réponse

## 🔧 Correctifs appliqués

### 1. Frontend - EditReviewPage.jsx

#### Amélioration de la fonction `fetchReview`
```javascript
✅ Ajout de logs de débogage détaillés
✅ Ajout explicite de `credentials: 'include'` dans le fetch
✅ Meilleure gestion des erreurs avec affichage du message d'erreur exact
✅ Logs de l'état de l'utilisateur et de la review chargée
```

**Changements clés** :
- Logs avant et après chaque étape du chargement
- Affichage du message d'erreur exact dans le toast
- Vérification explicite des données reçues

#### Amélioration du useEffect
```javascript
✅ Ajout de logs pour tracer le cycle de vie du composant
✅ Attente explicite que `user` soit défini avant de charger la review
✅ Ajout de `user` dans les dépendances du useEffect
```

**Avant** :
```javascript
useEffect(() => {
    if (!isAuthenticated) {
        navigate('/');
        return;
    }
    fetchReview();
}, [id, isAuthenticated]);
```

**Après** :
```javascript
useEffect(() => {
    console.log('🔄 EditReviewPage useEffect triggered', { 
        id, 
        isAuthenticated, 
        user: user ? { id: user.id, username: user.username } : null 
    });

    if (!isAuthenticated) {
        console.log('⚠️ User not authenticated, redirecting...');
        navigate('/');
        return;
    }

    // ✅ Attendre que l'utilisateur soit chargé avant de fetcher la review
    if (!user) {
        console.log('⏳ Waiting for user data...');
        return;
    }

    fetchReview();
}, [id, isAuthenticated, user]);
```

### 2. Backend - routes/reviews.js

#### Amélioration de la route GET /api/reviews/:id
```javascript
✅ Ajout de logs de débogage côté serveur
✅ Garantie explicite que `authorId` est toujours présent dans la réponse
✅ Logs de l'état d'authentification et des permissions
```

**Changements clés** :
- Logs de chaque étape de la récupération de la review
- Vérification et logs des permissions d'accès
- Garantie que `authorId` est toujours inclus dans la réponse formattée

```javascript
// ✅ S'assurer que authorId est toujours présent
if (!formattedReview.authorId) {
    formattedReview.authorId = review.authorId
}
```

## 🧪 Tests recommandés

### Test 1 : Édition d'une review personnelle
1. Se connecter avec Discord
2. Créer une nouvelle review
3. Cliquer sur "Modifier" depuis la page de détail ou la bibliothèque
4. Vérifier que la page d'édition se charge correctement
5. Modifier des champs et sauvegarder
6. Vérifier que les modifications sont enregistrées

### Test 2 : Tentative d'édition d'une review d'un autre utilisateur
1. Noter l'ID d'une review d'un autre utilisateur
2. Tenter d'accéder à `/edit/{id}` directement
3. Vérifier que l'accès est refusé avec un message approprié

### Test 3 : Édition sans authentification
1. Se déconnecter
2. Tenter d'accéder à `/edit/{id}`
3. Vérifier la redirection vers la page d'accueil

## 📊 Logs de débogage

### Côté Frontend (Console navigateur)
```
🔄 EditReviewPage useEffect triggered
👤 Current user: { id: '...', username: '...' }
🔍 Fetching review: {review-id}
📡 Response status: 200
✅ Review data: { ... }
📊 Parsed form data: { ... }
```

### Côté Backend (Terminal serveur)
```
🔍 GET /api/reviews/{id}
👤 Authenticated: true
👤 User: { id: '...', username: '...' }
📄 Review found: { id: '...', authorId: '...', isPublic: true }
✅ Sending review: { id: '...', authorId: '...' }
```

## 🔄 Procédure de test en production

1. **Arrêter les serveurs** :
   ```powershell
   Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
   ```

2. **Démarrer le backend** :
   ```powershell
   cd server-new
   npm run dev
   ```

3. **Démarrer le frontend** :
   ```powershell
   cd client
   npm run dev
   ```

4. **Accéder à l'application** :
   - Local: http://localhost:5173/
   - Réseau: http://192.168.1.38:5173/

5. **Vérifier les logs** dans les deux terminaux pendant le test

## 🚀 Déploiement

### Sur le VPS
```bash
# Se connecter au VPS
ssh vps-lafoncedalle

# Naviguer vers le projet
cd /path/to/Reviews-Maker

# Pull les derniers changements
git pull origin feat/theme-refactor

# Installer les dépendances si nécessaire
cd server-new && npm install
cd ../client && npm install

# Rebuild le frontend
cd client && npm run build

# Redémarrer le serveur backend (selon la configuration)
pm2 restart reviews-maker
# OU
sudo systemctl restart reviews-maker
```

## 📝 Notes importantes

1. **Cookies et CORS** : Les cookies de session sont correctement configurés avec `credentials: 'include'` côté client et `credentials: true` dans la configuration CORS côté serveur.

2. **Session persistence** : Les sessions sont stockées dans SQLite (`db/sessions.db`) et persistent pendant 7 jours.

3. **Race conditions** : Le correctif résout le problème de race condition en s'assurant que `user` est chargé avant de tenter de charger la review.

4. **Logs de production** : En production, pensez à désactiver ou réduire les logs de debug pour éviter de polluer les logs serveur.

## ✅ Statut

- [x] Problème identifié
- [x] Correctifs appliqués au frontend
- [x] Correctifs appliqués au backend
- [x] Serveurs redémarrés
- [x] Documentation créée
- [ ] Tests en local effectués
- [ ] Déploiement en production

## 🔗 Fichiers modifiés

1. `client/src/pages/EditReviewPage.jsx` - Amélioration de la gestion d'erreurs et des logs
2. `server-new/routes/reviews.js` - Ajout de logs et garantie sur `authorId`
3. `CORRECTIF_EDITION_REVIEW.md` - Cette documentation

---

**Prochaines étapes** :
1. Tester l'édition d'une review en local
2. Vérifier les logs dans la console
3. Confirmer que le problème est résolu
4. Déployer sur le VPS si tout fonctionne
