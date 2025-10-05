# Intégration avec LaFoncedalleBot - Documentation API

## Vue d'ensemble

Reviews-Maker s'intègre avec LaFoncedalleBot pour l'authentification des utilisateurs. Au lieu de gérer sa propre base de données utilisateurs et son propre système d'envoi d'emails, Reviews-Maker utilise les services existants de LaFoncedalleBot.

## Architecture

```
┌─────────────────┐
│  Reviews-Maker  │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌──────────────────┐
│  Reviews-Maker  │◄─────►│ LaFoncedalleBot  │
│    (Backend)    │       │      (API)       │
│   server.js     │       └──────────────────┘
└─────────────────┘               │
         │                        │
         ▼                        ▼
┌─────────────────┐       ┌──────────────────┐
│   reviews.db    │       │   Discord DB     │
│  (Reviews only) │       │ (Users + Emails) │
└─────────────────┘       └──────────────────┘
```

## Flux d'authentification

1. **Utilisateur entre son email** sur Reviews-Maker
2. **Reviews-Maker interroge LaFoncedalleBot** pour vérifier si l'email est lié à un compte Discord
3. **LaFoncedalleBot renvoie** les informations Discord (ID, pseudo) si l'email existe
4. **Reviews-Maker demande à LaFoncedalleBot** d'envoyer un code de vérification par email
5. **LaFoncedalleBot envoie le code** via son service de mailing
6. **Utilisateur entre le code** sur Reviews-Maker
7. **Reviews-Maker vérifie le code** et crée une session
8. **Le compte Reviews-Maker est activé** avec le pseudo Discord

## Configuration des variables d'environnement

Dans le fichier `.env` ou `ecosystem.config.cjs` de Reviews-Maker, configurez :

```javascript
// URL de l'API LaFoncedalleBot
LAFONCEDALLE_API_URL=http://localhost:3001
// ou pour la production:
LAFONCEDALLE_API_URL=https://api.lafoncedalle.com

// Clé API pour authentifier les requêtes de Reviews-Maker vers LaFoncedalleBot
LAFONCEDALLE_API_KEY=votre_cle_secrete_partagee
```

## Endpoints requis dans LaFoncedalleBot

LaFoncedalleBot doit exposer les endpoints suivants :

### 1. Vérification d'email et récupération du profil Discord

**Endpoint:** `POST /api/discord/user-by-email`

**Headers requis:**
```
Content-Type: application/json
Authorization: Bearer {LAFONCEDALLE_API_KEY}
```

**Body:**
```json
{
  "email": "utilisateur@example.com"
}
```

**Réponse succès (200):**
```json
{
  "discordId": "123456789012345678",
  "username": "PseudoDiscord#1234",
  "email": "utilisateur@example.com"
}
```

**Réponse email non trouvé (404):**
```json
{
  "error": "not_found",
  "message": "Email non lié à un compte Discord"
}
```

**Implémentation suggérée dans LaFoncedalleBot:**
```javascript
app.post('/api/discord/user-by-email', authenticateApiKey, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'missing_email' });
  }
  
  try {
    // Requête SQL vers votre base de données Discord
    const user = await db.query(
      'SELECT discord_id, username, email FROM discord_users WHERE LOWER(email) = LOWER(?)',
      [email]
    );
    
    if (!user) {
      return res.status(404).json({ 
        error: 'not_found',
        message: 'Email non lié à un compte Discord' 
      });
    }
    
    res.json({
      discordId: user.discord_id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    res.status(500).json({ error: 'server_error' });
  }
});
```

### 2. Envoi d'email de vérification

**Endpoint:** `POST /api/mail/send-verification`

**Headers requis:**
```
Content-Type: application/json
Authorization: Bearer {LAFONCEDALLE_API_KEY}
```

**Body:**
```json
{
  "to": "utilisateur@example.com",
  "code": "123456",
  "subject": "Code de vérification Reviews Maker",
  "appName": "Reviews Maker",
  "expiryMinutes": 10
}
```

**Réponse succès (200):**
```json
{
  "ok": true,
  "messageId": "optional-message-id"
}
```

**Implémentation suggérée dans LaFoncedalleBot:**
```javascript
app.post('/api/mail/send-verification', authenticateApiKey, async (req, res) => {
  const { to, code, subject, appName, expiryMinutes } = req.body;
  
  if (!to || !code) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  try {
    // Utilisez votre service de mailing existant (nodemailer, etc.)
    const emailContent = `
      <h2>Code de vérification ${appName || 'Reviews Maker'}</h2>
      <p>Votre code de vérification est :</p>
      <h1 style="font-size: 32px; letter-spacing: 8px; color: #10b981;">${code}</h1>
      <p>Ce code expire dans ${expiryMinutes || 10} minutes.</p>
      <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
    `;
    
    await sendEmail({
      to: to,
      subject: subject || 'Code de vérification',
      html: emailContent
    });
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'email_send_failed' });
  }
});
```

## Middleware d'authentification API (LaFoncedalleBot)

Pour sécuriser vos endpoints, ajoutez ce middleware :

```javascript
function authenticateApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key manquante' });
  }
  
  const apiKey = authHeader.substring(7);
  const validKey = process.env.LAFONCEDALLE_API_KEY || 'votre_cle_secrete';
  
  if (apiKey !== validKey) {
    return res.status(403).json({ error: 'forbidden', message: 'API key invalide' });
  }
  
  next();
}
```

## Structure de la base de données Discord (LaFoncedalleBot)

Votre table d'utilisateurs Discord devrait avoir au minimum :

```sql
CREATE TABLE discord_users (
  discord_id VARCHAR(20) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON discord_users(email);
```

## Gestion des tokens dans Reviews-Maker

Quand un utilisateur se connecte avec succès :

1. Reviews-Maker génère un token de session
2. Le token est stocké dans `/server/tokens/{token}`
3. Le fichier contient :
```json
{
  "ownerId": "utilisateur@example.com",
  "discordId": "123456789012345678",
  "discordUsername": "PseudoDiscord#1234",
  "roles": [],
  "createdAt": "2025-10-05T12:00:00.000Z"
}
```

## Messages utilisateur

### Email non trouvé
Si l'email n'est pas lié à Discord :
```
"Cette adresse email n'est pas liée à un compte Discord. 
Veuillez d'abord lier votre email sur le serveur Discord LaFoncedalle."
```

### Code envoyé
```
"Code envoyé par email"
```

### Compte activé
Le compte est nommé automatiquement avec le pseudo Discord de l'utilisateur.

## Sécurité

### Côté Reviews-Maker
- ✅ Validation des emails (regex)
- ✅ Codes à 6 chiffres (100000-999999)
- ✅ Expiration après 10 minutes
- ✅ Maximum 5 tentatives par code
- ✅ Nettoyage automatique des codes expirés

### Côté LaFoncedalleBot
- ✅ Authentification par API key
- ✅ Rate limiting (recommandé)
- ✅ Logs des requêtes
- ✅ Validation des emails
- ✅ Protection CORS si nécessaire

## Tests

### Test 1: Vérifier la connexion API
```bash
curl -X POST http://localhost:3001/api/discord/user-by-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre_cle_api" \
  -d '{"email":"test@example.com"}'
```

### Test 2: Tester l'envoi d'email
```bash
curl -X POST http://localhost:3001/api/mail/send-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre_cle_api" \
  -d '{
    "to":"test@example.com",
    "code":"123456",
    "subject":"Test",
    "appName":"Reviews Maker",
    "expiryMinutes":10
  }'
```

## Déploiement

1. **Sur le VPS**, assurez-vous que LaFoncedalleBot et Reviews-Maker peuvent communiquer
2. **Configurez les variables d'environnement** dans `ecosystem.config.cjs`
3. **Testez la connexion** entre les deux services
4. **Vérifiez les logs** pour tout problème de communication

## Dépannage

### "Backend serveur détecté" n'apparaît pas
- Vérifiez que le serveur Reviews-Maker est démarré
- Vérifiez l'URL dans le navigateur (doit pointer vers le serveur)

### "Email non trouvé"
- Vérifiez que l'email existe dans la base Discord
- Vérifiez les logs de LaFoncedalleBot

### "Erreur lors de l'envoi du code"
- Vérifiez que LaFoncedalleBot répond sur `/api/mail/send-verification`
- Vérifiez la configuration du service de mailing
- Vérifiez l'API key

### "Code invalide"
- Le code expire après 10 minutes
- Maximum 5 tentatives par code
- Vérifiez que l'utilisateur entre le bon code

## Contact

Pour toute question sur l'intégration, consultez les logs :
- Reviews-Maker: `pm2 logs reviews-maker`
- LaFoncedalleBot: `pm2 logs lafoncedalle-bot`
