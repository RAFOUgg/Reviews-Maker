# Intégration LaFoncedalle - Reviews Maker

Ce document décrit l'intégration entre Reviews Maker et les services LaFoncedalle (API et Bot Discord).

## Architecture

Reviews Maker utilise les services LaFoncedalle pour :
1. **Vérification des emails** : Vérifier qu'un email est lié à un compte Discord
2. **Envoi d'emails** : Envoyer les codes de vérification via le service de mailing LaFoncedalle
3. **Attribution des reviews** : Associer automatiquement les reviews au pseudo Discord de l'utilisateur

## Endpoints LaFoncedalle Requis

### 1. Vérification Discord par Email

**Endpoint** : `POST /api/discord/user-by-email`

**Headers** :
```
Authorization: Bearer <LAFONCEDALLE_API_KEY>
Content-Type: application/json
```

**Body** :
```json
{
  "email": "user@example.com"
}
```

**Réponse Success (200)** :
```json
{
  "discordId": "123456789012345678",
  "username": "Username#1234",
  "email": "user@example.com"
}
```

**Réponse Not Found (404)** :
```json
{
  "error": "email_not_found",
  "message": "Cette adresse email n'est pas liée à un compte Discord"
}
```

### 2. Envoi de Code de Vérification

**Endpoint** : `POST /api/mail/send-verification`

**Headers** :
```
Authorization: Bearer <LAFONCEDALLE_API_KEY>
Content-Type: application/json
```

**Body** :
```json
{
  "to": "user@example.com",
  "code": "123456",
  "subject": "Code de vérification Reviews Maker",
  "appName": "Reviews Maker",
  "expiryMinutes": 10
}
```

**Réponse Success (200)** :
```json
{
  "ok": true,
  "messageId": "unique-message-id"
}
```

**Réponse Error (500)** :
```json
{
  "error": "email_error",
  "message": "Erreur lors de l'envoi de l'email"
}
```

## Configuration

### Variables d'Environnement

Créez un fichier `.env` dans le dossier `server/` avec :

```env
PORT=3000
LAFONCEDALLE_API_URL=http://localhost:3001
LAFONCEDALLE_API_KEY=your-api-key-here
```

### Fichier de Configuration

Dans `server/server.js`, les constantes suivantes sont définies :

```javascript
const LAFONCEDALLE_API_URL = process.env.LAFONCEDALLE_API_URL || 'http://localhost:3001';
const LAFONCEDALLE_API_KEY = process.env.LAFONCEDALLE_API_KEY || 'your-api-key';
```

## Flux d'Authentification

### 1. Demande de Code

```
Client                  Reviews Maker Server              LaFoncedalle API
  |                              |                                |
  |-- POST /api/auth/send-code ->|                                |
  |    { email: "..." }          |                                |
  |                              |                                |
  |                              |-- POST /api/discord/user-by-email ->
  |                              |    { email: "..." }            |
  |                              |                                |
  |                              |<-- 200 OK ----------------------|
  |                              |    { discordId, username }     |
  |                              |                                |
  |                              |-- POST /api/mail/send-verification ->
  |                              |    { to, code, subject }       |
  |                              |                                |
  |                              |<-- 200 OK ----------------------|
  |                              |    { ok: true }                |
  |                              |                                |
  |<-- 200 OK -------------------|                                |
  |    { ok: true }              |                                |
```

### 2. Vérification du Code

```
Client                  Reviews Maker Server
  |                              |
  |-- POST /api/auth/verify-code ->
  |    { email, code }           |
  |                              |
  |<-- 200 OK -------------------|
  |    { ok: true, token }       |
```

Le token généré contient :
```json
{
  "ownerId": "user@example.com",
  "discordId": "123456789012345678",
  "discordUsername": "Username#1234",
  "roles": [],
  "createdAt": "2025-01-01T12:00:00.000Z"
}
```

## Stockage des Tokens

Les tokens sont stockés dans `server/tokens/<token>` sous forme de fichiers JSON.

**Exemple de fichier token** : `server/tokens/dXNlckBleGFtcGxlLmNvbToxNzM1...`

```json
{
  "ownerId": "user@example.com",
  "discordId": "123456789012345678",
  "discordUsername": "Username#1234",
  "roles": [],
  "createdAt": "2025-01-01T12:00:00.000Z"
}
```

## Attribution des Reviews

Les reviews créées par un utilisateur authentifié sont automatiquement attribuées à son pseudo Discord.

Le champ `ownerId` dans la base de données SQLite contient l'email de l'utilisateur, et le pseudo Discord est récupéré via le token lors de l'affichage.

## Gestion des Erreurs

### Email Non Trouvé

Si l'email n'est pas lié à un compte Discord :

```json
{
  "error": "email_not_found",
  "message": "Cette adresse email n'est pas liée à un compte Discord. Veuillez d'abord lier votre email sur le serveur Discord LaFoncedalle."
}
```

**Message utilisateur** : L'utilisateur est invité à lier son email sur le serveur Discord avant de pouvoir utiliser Reviews Maker.

### Erreur d'API

Si l'API LaFoncedalle est indisponible :

```json
{
  "error": "server_error",
  "message": "Erreur lors de la vérification de l'email ou de l'envoi du code"
}
```

### Code Invalide

Si le code de vérification est incorrect :

```json
{
  "error": "invalid_code",
  "message": "Code invalide",
  "attemptsLeft": 4
}
```

L'utilisateur a droit à 5 tentatives maximum (`MAX_ATTEMPTS = 5`).

### Code Expiré

Si le code a expiré (10 minutes par défaut) :

```json
{
  "error": "code_expired",
  "message": "Code expiré"
}
```

## Sécurité

### API Key

L'API key LaFoncedalle doit être stockée en tant que variable d'environnement et **jamais** committée dans Git.

### Expiration des Codes

Les codes de vérification expirent automatiquement après 10 minutes (`CODE_EXPIRY = 10 * 60 * 1000`).

### Limitation des Tentatives

Un maximum de 5 tentatives est autorisé par code (`MAX_ATTEMPTS = 5`).

### Nettoyage Automatique

Les codes expirés sont automatiquement supprimés de la mémoire après 10 minutes.

## Tests de Développement

### Mock de l'API LaFoncedalle

Pour tester sans l'API LaFoncedalle, vous pouvez temporairement modifier les fonctions :

```javascript
// Remplacer getDiscordUserByEmail par :
async function getDiscordUserByEmail(email) {
  console.log('[MOCK] Discord verification for:', email);
  return {
    discordId: '123456789',
    username: 'TestUser#1234',
    email: email
  };
}

// Remplacer sendVerificationEmail par :
async function sendVerificationEmail(email, code) {
  console.log(`[MOCK] Email sent to ${email}: ${code}`);
  return { ok: true };
}
```

### Commandes de Test

```bash
# Test de vérification email
curl -X POST http://localhost:3000/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Test de vérification code (utilisez le code affiché dans les logs)
curl -X POST http://localhost:3000/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","code":"123456"}'

# Test de récupération des infos utilisateur
curl http://localhost:3000/api/auth/me \
  -H "X-Auth-Token: <token>"
```

## Production

### Checklist de Déploiement

- [ ] Configurer `LAFONCEDALLE_API_URL` avec l'URL de production
- [ ] Configurer `LAFONCEDALLE_API_KEY` avec la clé API de production
- [ ] Vérifier que le service LaFoncedalle API est accessible depuis le serveur Reviews Maker
- [ ] Tester le flux complet d'authentification
- [ ] Vérifier les logs pour s'assurer que les emails sont bien envoyés
- [ ] Tester avec un compte Discord réel

### Monitoring

Surveillez les logs pour :
- Erreurs de connexion à l'API LaFoncedalle
- Échecs d'envoi d'emails
- Tentatives d'authentification échouées
- Codes expirés

### Points de Maintenance

- Nettoyer périodiquement les fichiers de tokens expirés dans `server/tokens/`
- Surveiller la taille du dossier `server/tokens/`
- Vérifier régulièrement la disponibilité de l'API LaFoncedalle

## Support

Pour toute question ou problème d'intégration, contacter l'équipe LaFoncedalle.
