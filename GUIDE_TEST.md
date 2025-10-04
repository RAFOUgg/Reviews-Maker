# Guide de test des nouvelles fonctionnalités

## Prérequis
- Le serveur doit être lancé : `cd server && node server.js`
- Ouvrir `index.html` dans un navigateur

## Test 1 : Bouton flottant de connexion

### Sans être connecté
1. Ouvrir `index.html`
2. ✅ Vérifier la présence du bouton flottant 🔗 en bas à droite
3. ✅ Le bouton "Ma bibliothèque" ne doit PAS être visible dans le header
4. ✅ Vérifier que seuls les onglets de la galerie ne s'affichent pas

### Test de connexion
1. Créer un fichier de token : `echo "test_user_1" > server/tokens/test_token_123`
2. Cliquer sur le bouton flottant 🔗
3. ✅ Une modale "Connexion" doit s'ouvrir
4. Entrer le token : `test_token_123`
5. Cliquer sur "Se connecter"
6. ✅ Message "Connexion réussie!" doit apparaître
7. ✅ Le bouton flottant devient ✓ (vert)
8. ✅ Le bouton "Ma bibliothèque" 📚 apparaît dans le header
9. ✅ La modale se ferme automatiquement

## Test 2 : Bouton "Ma bibliothèque"

### Avec connexion active
1. Être connecté (suivre Test 1)
2. Cliquer sur le bouton "Ma bibliothèque" 📚 dans le header
3. ✅ La page doit défiler jusqu'à la section galerie
4. ✅ L'onglet "Ma bibliothèque" doit être activé
5. ✅ Seules les reviews de l'utilisateur connecté doivent être affichées

## Test 3 : Visibilité des reviews privées

### Création d'une review privée
1. Créer une nouvelle review (choisir un type de produit)
2. Remplir les champs obligatoires
3. Cocher "Review privée" lors de la sauvegarde
4. Sauvegarder la review
5. ✅ La review apparaît dans "Ma bibliothèque"

### Vérification de la visibilité
1. Ouvrir la galerie publique (onglet "Galerie publique")
2. ✅ La review privée ne doit PAS apparaître dans la galerie publique
3. Ouvrir un navigateur en mode incognito (ou se déconnecter)
4. Ouvrir `index.html`
5. ✅ La review privée ne doit PAS être visible

### Vérification avec un autre utilisateur
1. Créer un second token : `echo "test_user_2" > server/tokens/test_token_456`
2. Dans un autre navigateur (ou en mode incognito), se connecter avec `test_token_456`
3. ✅ La review privée de test_user_1 ne doit PAS être visible
4. ✅ Seules les reviews publiques et celles de test_user_2 doivent être visibles

## Test 4 : Déconnexion

1. Cliquer sur le bouton flottant ✓
2. ✅ La modale s'ouvre avec le bouton "Se déconnecter"
3. Cliquer sur "Se déconnecter"
4. ✅ Message "Déconnecté" apparaît
5. ✅ Le bouton flottant redevient 🔗
6. ✅ Le bouton "Ma bibliothèque" disparaît du header
7. ✅ Les onglets de la galerie disparaissent

## Test 5 : Persistance de la connexion

1. Se connecter avec un token
2. Fermer l'onglet du navigateur
3. Ouvrir à nouveau `index.html`
4. ✅ L'utilisateur doit toujours être connecté (bouton ✓ et "Ma bibliothèque" visible)
5. ✅ Le token doit être présent dans localStorage

## Test 6 : Token invalide

1. Cliquer sur le bouton flottant
2. Entrer un token inexistant : `invalid_token_999`
3. Cliquer sur "Se connecter"
4. ✅ Message d'erreur "Token invalide" doit apparaître
5. ✅ L'utilisateur ne doit PAS être connecté

## Résolution de problèmes

### Le bouton flottant n'apparaît pas
- Vider le cache du navigateur et recharger
- Vérifier que `styles.css` a bien été modifié
- Ouvrir la console (F12) et chercher les erreurs

### Les reviews privées sont toujours visibles
- Vérifier que le serveur est bien lancé
- Vider le cache du navigateur
- Vérifier dans la base de données que `isPrivate=1` pour la review
- Utiliser l'onglet Réseau (F12) pour voir les requêtes API

### Le bouton "Ma bibliothèque" n'apparaît pas
- Vérifier que le token est valide
- Ouvrir la console et taper : `localStorage.getItem('authToken')`
- Si null, se reconnecter

### Commandes de debug utiles

```javascript
// Dans la console du navigateur (F12)

// Voir le token actuel
localStorage.getItem('authToken')

// Supprimer le token
localStorage.removeItem('authToken')

// Voir toutes les reviews
fetch('/api/reviews').then(r => r.json()).then(console.log)

// Voir les reviews avec authentification
fetch('/api/reviews', { 
  headers: { 'X-Auth-Token': localStorage.getItem('authToken') }
}).then(r => r.json()).then(console.log)

// Voir uniquement mes reviews
fetch('/api/my/reviews', { 
  headers: { 'X-Auth-Token': localStorage.getItem('authToken') }
}).then(r => r.json()).then(console.log)
```
