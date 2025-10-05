# Endpoints à implémenter dans LaFoncedalleBot

## Vue d'ensemble

Reviews-Maker a besoin de 2 endpoints dans l'API de LaFoncedalleBot pour fonctionner.

---

## 1️⃣ Vérifier un email et récupérer le profil Discord

### Endpoint
```
POST /api/discord/user-by-email
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {VOTRE_CLE_API_PARTAGEE}
```

### Body
```json
{
  "email": "utilisateur@example.com"
}
```

### Réponse succès (200)
```json
{
  "discordId": "123456789012345678",
  "username": "PseudoDiscord#1234",
  "email": "utilisateur@example.com"
}
```

### Réponse erreur - Email non trouvé (404)
```json
{
  "error": "not_found",
  "message": "Email non lié à un compte Discord"
}
```

### Code d'implémentation (exemple)
```javascript
app.post('/api/discord/user-by-email', authenticateApiKey, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'missing_email' });
  }
  
  try {
    // Chercher dans votre base de données Discord
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
    console.error('[API] Error fetching Discord user:', error);
    res.status(500).json({ error: 'server_error' });
  }
});
```

---

## 2️⃣ Envoyer un email de vérification

### Endpoint
```
POST /api/mail/send-verification
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {VOTRE_CLE_API_PARTAGEE}
```

### Body
```json
{
  "to": "utilisateur@example.com",
  "code": "123456",
  "subject": "Code de vérification Reviews Maker",
  "appName": "Reviews Maker",
  "expiryMinutes": 10
}
```

### Réponse succès (200)
```json
{
  "ok": true
}
```

### Code d'implémentation (exemple)
```javascript
app.post('/api/mail/send-verification', authenticateApiKey, async (req, res) => {
  const { to, code, subject, appName, expiryMinutes } = req.body;
  
  if (!to || !code) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  try {
    // Template HTML de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              background-color: #0f172a; 
              color: #e2e8f0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #1e293b; 
              padding: 30px; 
              border-radius: 12px; 
              border: 1px solid #334155;
            }
            h2 { 
              color: #38f4b8; 
              margin-bottom: 20px;
            }
            .code { 
              font-size: 32px; 
              letter-spacing: 8px; 
              color: #38f4b8; 
              text-align: center; 
              margin: 30px 0; 
              font-weight: bold; 
              background: #0f172a;
              padding: 20px;
              border-radius: 8px;
            }
            .footer { 
              color: #64748b; 
              font-size: 14px; 
              margin-top: 30px; 
              padding-top: 20px;
              border-top: 1px solid #334155;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🔐 Code de vérification ${appName || 'Reviews Maker'}</h2>
            <p>Bonjour,</p>
            <p>Votre code de vérification pour accéder à <strong>${appName || 'Reviews Maker'}</strong> est :</p>
            <div class="code">${code}</div>
            <p>Ce code expire dans <strong>${expiryMinutes || 10} minutes</strong>.</p>
            <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            <div class="footer">
              <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Utiliser votre service de mailing (nodemailer, etc.)
    await votreServiceMail.sendMail({
      to: to,
      subject: subject || 'Code de vérification',
      html: emailHtml
    });
    
    console.log(`[MAIL] Verification code sent to ${to}`);
    res.json({ ok: true });
  } catch (error) {
    console.error('[MAIL] Error sending verification email:', error);
    res.status(500).json({ error: 'email_send_failed' });
  }
});
```

---

## 🔐 Middleware d'authentification

Les deux endpoints doivent être protégés par une clé API :

```javascript
function authenticateApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'unauthorized', 
      message: 'API key manquante' 
    });
  }
  
  const apiKey = authHeader.substring(7);
  const validKey = process.env.REVIEWS_MAKER_API_KEY; // Variable d'environnement
  
  if (apiKey !== validKey) {
    return res.status(403).json({ 
      error: 'forbidden', 
      message: 'API key invalide' 
    });
  }
  
  next();
}
```

---

## ⚙️ Configuration

### Dans LaFoncedalleBot
Ajoutez cette variable d'environnement :
```bash
REVIEWS_MAKER_API_KEY=votre_cle_secrete_partagee
```

### Dans Reviews-Maker
Configurez dans `server/ecosystem.config.cjs` :
```javascript
env_production: {
  LAFONCEDALLE_API_URL: 'http://localhost:3001', // ou votre URL
  LAFONCEDALLE_API_KEY: 'votre_cle_secrete_partagee' // La même clé !
}
```

---

## 🧪 Tests

### Tester l'endpoint de vérification d'email
```bash
curl -X POST http://localhost:3001/api/discord/user-by-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer votre_cle_api" \
  -d '{"email":"test@example.com"}'
```

### Tester l'endpoint d'envoi d'email
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

---

## 📊 Structure de base de données suggérée

Si vous n'avez pas encore de table pour les utilisateurs Discord :

```sql
CREATE TABLE discord_users (
  discord_id VARCHAR(20) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON discord_users(email);
```

---

## ✅ Checklist d'implémentation

- [ ] Ajouter l'endpoint `/api/discord/user-by-email`
- [ ] Ajouter l'endpoint `/api/mail/send-verification`
- [ ] Implémenter le middleware `authenticateApiKey`
- [ ] Configurer la variable `REVIEWS_MAKER_API_KEY`
- [ ] Tester les deux endpoints avec curl
- [ ] Vérifier les logs lors d'un test complet
- [ ] Documenter l'URL de l'API pour le déploiement de Reviews-Maker

---

## 📝 Notes importantes

1. **Clé API** : La même clé doit être configurée dans les deux applications
2. **CORS** : Si nécessaire, autorisez les requêtes depuis le domaine de Reviews-Maker
3. **Rate limiting** : Recommandé pour éviter les abus
4. **Logs** : Loggez toutes les requêtes pour le débogage
5. **Sécurité** : Ne jamais exposer la clé API dans le code frontend

---

## 🆘 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs lafoncedalle-bot`
2. Tester les endpoints avec curl
3. Vérifier que la clé API est identique dans les deux apps
4. Consulter [INTEGRATION_LAFONCEDALLE_API.md](INTEGRATION_LAFONCEDALLE_API.md)
