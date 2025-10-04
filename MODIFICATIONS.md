# Modifications apportées

## Résumé des changements

### 1. Bouton "Ma bibliothèque" dans le header
- **Fichier**: `index.html`
- **Ajout**: Bouton "Ma bibliothèque" à côté du bouton "Astuce" dans le header
- **Comportement**: 
  - Visible uniquement lorsqu'un utilisateur est connecté avec un token
  - Permet d'accéder rapidement à la vue "Ma bibliothèque" (onglet personnel)
  - Fait défiler automatiquement jusqu'à la section galerie

### 2. Bouton flottant de connexion
- **Fichier**: `index.html`, `styles.css`, `app.js`
- **Ajout**: Bouton flottant en bas à droite de la page
- **Comportement**:
  - Icône 🔗 quand non connecté, ✓ quand connecté
  - Change de couleur selon l'état de connexion
  - Ouvre la modale d'authentification au clic

### 3. Modale d'authentification
- **Fichier**: `index.html`, `app.js`
- **Ajout**: Modale permettant de se connecter/déconnecter
- **Fonctionnalités**:
  - Champ pour entrer le token d'authentification
  - Validation du token via `/api/ping`
  - Stockage du token dans localStorage
  - Boutons Connexion/Déconnexion
  - Messages de statut (succès, erreur, info)

### 4. Logique d'authentification
- **Fichier**: `app.js`
- **Fonctions ajoutées**:
  - `updateAuthUI()`: Met à jour l'interface selon l'état de connexion
  - `showAuthStatus()`: Affiche les messages de statut
  - `setupHomeTabs()`: Configure l'affichage des onglets selon l'authentification
- **Comportement**:
  - Le token est stocké dans localStorage
  - Le bouton "Ma bibliothèque" apparaît/disparaît selon l'état de connexion
  - Les onglets "Galerie publique" / "Ma bibliothèque" sont affichés selon l'état

### 5. Styles CSS
- **Fichier**: `styles.css`
- **Ajouts**:
  - `.floating-auth-btn`: Style du bouton flottant
  - `.floating-auth-btn.connected`: État connecté
  - `.auth-content`: Layout de la modale d'authentification
  - `.auth-status-*`: Styles des messages de statut
  - `.auth-actions`: Styles des boutons d'action
  - `.auth-help`: Style du texte d'aide

## Fonctionnement de la visibilité des reviews privées

### Côté serveur (`server.js`)
Le serveur gère correctement la visibilité des reviews :
- **Route `/api/reviews`**:
  - Sans token : retourne uniquement les reviews publiques (isDraft=0 AND isPrivate=0)
  - Avec token : retourne les reviews publiques + les reviews personnelles de l'utilisateur (draft ou privé)
  - Staff : retourne toutes les reviews

### Côté client (`app.js`)
- **Galerie publique** : Affiche les reviews retournées par `/api/reviews` (filtrées par le serveur)
- **Ma bibliothèque** : Affiche les reviews de l'utilisateur via `/api/my/reviews`

## Comment utiliser

### Pour un utilisateur
1. Cliquer sur le bouton flottant 🔗 en bas à droite
2. Entrer le token d'authentification fourni par un administrateur
3. Cliquer sur "Se connecter"
4. Le bouton devient ✓ et le bouton "Ma bibliothèque" apparaît dans le header
5. Cliquer sur "Ma bibliothèque" pour voir uniquement ses propres reviews

### Pour un administrateur
1. Créer un fichier dans `server/tokens/` avec comme nom le token (ex: `mytoken123`)
2. Le contenu du fichier doit être l'ownerId de l'utilisateur (ex: `user_discord_123`)
3. Ou utiliser le format JSON pour les rôles : `{"ownerId": "user_123", "roles": ["staff"]}`

## Notes importantes

- Les reviews privées d'un utilisateur sont visibles uniquement par cet utilisateur
- Les brouillons d'un utilisateur sont visibles uniquement par cet utilisateur
- Le serveur filtre automatiquement les reviews selon le token fourni
- Le token est stocké dans localStorage et persiste entre les sessions
- Les reviews privées ne sont jamais affichées dans la galerie publique pour les autres utilisateurs
