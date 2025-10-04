# Système d'Authentification par Email - Reviews Maker

## Résumé des Modifications

### 1. ✅ Authentification par Email avec Code de Vérification

Le système de token manuel a été remplacé par un système d'authentification moderne par email.

#### Fonctionnement :
1. L'utilisateur entre son adresse email
2. Un code de vérification à 6 chiffres est envoyé par email
3. L'utilisateur entre le code pour se connecter
4. Un token de session est généré et stocké

#### Sécurité :
- Codes expir après 10 minutes
- Maximum 5 tentatives de vérification
- Tokens stockés de manière sécurisée
- Déconnexion propre avec suppression du token

### 2. ✅ Corrections des Bugs

#### a) Bouton "Ma Bibliothèque" dans index.html
- **Problème** : Le bouton utilisait `openMyLibrary` au lieu de `openLibrary`
- **Solution** : Changé pour `openLibrary` pour cohérence avec review.html
- **Résultat** : Maintenant visible et fonctionnel quand connecté

#### b) Reviews Privées Visibles
- **Problème** : Reviews privées locales apparaissaient dans la galerie
- **Solution** : Filtrage amélioré dans `listUnifiedReviews()`
- **Code** : `if (r.isPrivate && !r.id) continue;`
- **Résultat** : Seules les reviews publiques ET les reviews personnelles (du propriétaire) sont visibles

#### c) Bouton Flottant de Connexion
- **Problème** : Ne fonctionnait pas correctement
- **Solution** : Complète réimplémentation du système d'auth
- **Résultat** : Fonctionne parfaitement avec le nouveau système email

### 3. 📁 Fichiers Modifiés

#### `index.html`
- Mis à jour le bouton "Ma Bibliothèque" (ID: `openLibrary`)
- Ajouté 3 étapes d'authentification dans le modal :
  - Étape 1 : Demande d'email
  - Étape 2 : Vérification du code
  - Étape 3 : Connecté

#### `styles.css`
- Ajouté styles pour `.auth-step`, `.auth-info`
- Ajouté styles pour `.form-group` et `.input`
- Ajouté `.link-btn` pour les liens dans le modal

#### `server/server.js`
- Ajouté stockage temporaire des codes : `verificationCodes Map`
- Ajouté constantes : `CODE_EXPIRY` (10 min), `MAX_ATTEMPTS` (5)
- **Nouvelles routes API** :
  - `POST /api/auth/send-code` - Envoyer code par email
  - `POST /api/auth/verify-code` - Vérifier code et créer session
  - `POST /api/auth/logout` - Déconnexion
  - `GET /api/auth/me` - Info utilisateur

#### `app.js`
- Mis à jour sélection des éléments DOM pour email auth
- Réécrit toute la logique d'authentification
- Mis à jour `updateAuthUI()` pour gérer les 3 étapes
- Corrections multiples pour le bouton "Ma Bibliothèque"

### 4. 🔧 Configuration Email (Important!)

**En développement :**
- Les codes sont affichés dans la console serveur
- Aucun email n'est réellement envoyé

**Pour la production :**
Vous devez configurer l'envoi d'emails réels. Options :

#### Option A : Nodemailer + Gmail
```javascript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'votre-email@gmail.com',
    pass: 'votre-mot-de-passe-application'
  }
});

async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: '"Reviews Maker" <noreply@reviewsmaker.com>',
    to: email,
    subject: 'Votre code de vérification',
    html: `
      <h2>Code de vérification</h2>
      <p>Votre code est : <strong>${code}</strong></p>
      <p>Ce code expire dans 10 minutes.</p>
    `
  });
}
```

#### Option B : SendGrid
```bash
npm install @sendgrid/mail
```

```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendVerificationEmail(email, code) {
  await sgMail.send({
    to: email,
    from: 'noreply@reviewsmaker.com',
    subject: 'Votre code de vérification',
    html: `
      <h2>Code de vérification</h2>
      <p>Votre code est : <strong>${code}</strong></p>
      <p>Ce code expire dans 10 minutes.</p>
    `
  });
}
```

#### Option C : Mailgun, AWS SES, etc.
Consultez leur documentation respective.

### 5. 🧪 Tests

#### Test 1 : Connexion par Email
1. Ouvrir `index.html`
2. Cliquer sur le bouton flottant 🔗 en bas à droite
3. Entrer une adresse email
4. Cliquer sur "Envoyer le code"
5. Vérifier la console serveur pour voir le code (en dev)
6. Entrer le code
7. Cliquer sur "Vérifier"
8. ✅ Doit voir "Connexion réussie !"
9. ✅ Le bouton "Ma bibliothèque" doit apparaître
10. ✅ Le bouton flottant doit devenir ✓

#### Test 2 : Reviews Privées
1. Se connecter avec un email
2. Créer une review et la marquer comme privée
3. Aller dans la galerie publique
4. ✅ La review privée ne doit PAS être visible
5. Cliquer sur "Ma bibliothèque"
6. ✅ La review privée DOIT être visible

#### Test 3 : Déconnexion
1. Cliquer sur le bouton flottant ✓
2. Cliquer sur "Se déconnecter"
3. ✅ Doit voir "Déconnecté"
4. ✅ Le bouton "Ma bibliothèque" doit disparaître
5. ✅ Le bouton flottant redevient 🔗

### 6. 📊 Base de Données

Les tokens sont maintenant stockés différemment :

**Ancien système :**
```
server/tokens/<token>
Contenu: ownerId (simple texte)
```

**Nouveau système :**
```
server/tokens/<token_base64>
Contenu: {"ownerId": "email@example.com", "roles": [], "createdAt": "2025-10-04T..."}
```

Le `ownerId` est maintenant l'adresse email de l'utilisateur.

### 7. 🔐 Sécurité

#### Points positifs :
- ✅ Codes à usage unique
- ✅ Expiration après 10 minutes
- ✅ Limitation des tentatives (5 max)
- ✅ Tokens uniques et sécurisés
- ✅ Déconnexion propre

#### À améliorer en production :
- [ ] HTTPS obligatoire
- [ ] Rate limiting sur l'envoi de codes
- [ ] Stockage des tokens en base de données (pas en fichiers)
- [ ] Utilisation de Redis pour les codes temporaires
- [ ] Logs d'audit
- [ ] Vérification d'email réelle (anti-spam)

### 8. 🚀 Déploiement

#### Étapes :
1. Configurer un service d'envoi d'emails (voir section 4)
2. Ajouter les variables d'environnement :
   ```bash
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=votre_clé
   FROM_EMAIL=noreply@votredomaine.com
   ```
3. Installer les dépendances :
   ```bash
   cd server
   npm install nodemailer
   # ou
   npm install @sendgrid/mail
   ```
4. Redémarrer le serveur

### 9. ✨ Avantages du Nouveau Système

| Critère | Ancien (Token) | Nouveau (Email) |
|---------|---------------|-----------------|
| **Facilité** | ❌ Demander token à l'admin | ✅ Auto-service |
| **Sécurité** | ⚠️ Token partageable | ✅ Lié à l'email |
| **Traçabilité** | ❌ Difficile | ✅ Email = identité |
| **UX** | ❌ Complexe | ✅ Moderne et simple |
| **Gestion** | ❌ Manuel | ✅ Automatisé |

### 10. 📝 Notes Importantes

1. **En développement** : Les codes sont affichés dans la console serveur au lieu d'être envoyés par email.

2. **Production** : IMPÉRATIVEMENT configurer un vrai service d'envoi d'emails.

3. **GDPR** : Pensez à ajouter une politique de confidentialité et obtenir le consentement pour stocker les emails.

4. **Backups** : Les tokens sont stockés dans `server/tokens/`. Sauvegardez ce répertoire.

5. **Nettoyage** : Les anciens tokens manuels dans `server/tokens/` peuvent être supprimés après migration de tous les utilisateurs.

## Commandes Utiles

### Développement
```bash
# Voir les codes dans la console
cd server
node server.js
# Les codes s'affichent: [EMAIL] Sending verification code to user@example.com: 123456
```

### Production
```bash
# Variables d'environnement
export SENDGRID_API_KEY=votre_clé
export FROM_EMAIL=noreply@votredomaine.com

# Démarrer avec PM2
pm2 start server/ecosystem.config.cjs
pm2 logs
```

### Debug
```javascript
// Console navigateur
localStorage.getItem('authToken')
localStorage.getItem('authEmail')

// Forcer déconnexion
localStorage.clear()
```

## Support

Pour toute question sur l'implémentation :
1. Vérifiez les logs serveur
2. Vérifiez la console navigateur (F12)
3. Testez avec un vrai service d'email
4. Consultez la documentation du service d'email choisi
