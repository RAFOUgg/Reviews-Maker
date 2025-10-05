# 🚀 Récapitulatif de l'intégration Reviews-Maker ↔ LaFoncedalleBot

## ✅ Ce qui a été fait

### 1. Architecture mise en place

Reviews-Maker utilise maintenant LaFoncedalleBot pour :
- ✅ Vérifier si un email est lié à un compte Discord
- ✅ Envoyer des codes de vérification par email
- ✅ Récupérer automatiquement le pseudo Discord de l'utilisateur

**Code déjà en place dans `server/server.js`** :
- Fonction `getDiscordUserByEmail()` - Interroge l'API LaFoncedalleBot
- Fonction `sendVerificationEmail()` - Envoie le code via LaFoncedalleBot
- Endpoints `/api/auth/send-code` et `/api/auth/verify-code` - Gestion de l'authentification

### 2. Configuration

**Variables d'environnement configurées** :
- `LAFONCEDALLE_API_URL` - URL de l'API LaFoncedalleBot
- `LAFONCEDALLE_API_KEY` - Clé API partagée

Voir : `server/ecosystem.config.cjs` et `server/.env.example`

### 3. Interface utilisateur

**Déjà fonctionnel côté Reviews-Maker** :
- ✅ Bouton flottant de liaison (🔗) en bas à droite
- ✅ Modal de connexion avec 3 étapes :
  1. Saisie de l'email
  2. Vérification du code
  3. Compte connecté
- ✅ Notifications positionnées en bas à gauche

### 4. Documentation créée

1. **`INTEGRATION_LAFONCEDALLE_API.md`** - Documentation complète de l'intégration
2. **`ENDPOINTS_LAFONCEDALLE.md`** - Liste simple des endpoints à implémenter
3. **`DEPLOIEMENT_INTEGRATION_LAFONCEDALLE.md`** - Guide de déploiement complet
4. **`test-integration.sh`** - Script de test automatique
5. **`server/.env.example`** - Template de configuration
6. **`server/ecosystem.config.cjs`** - Configuration PM2 mise à jour
7. **`README.md`** - Documentation principale mise à jour

## 🔧 Ce qu'il reste à faire dans LaFoncedalleBot

### Étape 1 : Générer une clé API

```bash
openssl rand -hex 32
```

Copiez cette clé, elle sera utilisée dans les deux applications.

### Étape 2 : Implémenter les 2 endpoints

#### Endpoint 1 : `/api/discord/user-by-email`

Vérifie si un email existe dans la base Discord et retourne les infos de l'utilisateur.

```javascript
app.post('/api/discord/user-by-email', authenticateApiKey, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'missing_email' });
  }
  
  try {
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
    console.error('[API] Error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});
```

#### Endpoint 2 : `/api/mail/send-verification`

Envoie un code de vérification par email.

```javascript
app.post('/api/mail/send-verification', authenticateApiKey, async (req, res) => {
  const { to, code, subject, appName, expiryMinutes } = req.body;
  
  if (!to || !code) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; }
            h2 { color: #38f4b8; }
            .code { font-size: 32px; letter-spacing: 8px; color: #38f4b8; text-align: center; margin: 30px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Code de vérification ${appName || 'Reviews Maker'}</h2>
            <p>Votre code de vérification est :</p>
            <div class="code">${code}</div>
            <p>Ce code expire dans ${expiryMinutes || 10} minutes.</p>
          </div>
        </body>
      </html>
    `;
    
    await votreServiceMail.sendMail({
      to: to,
      subject: subject || 'Code de vérification',
      html: emailHtml
    });
    
    res.json({ ok: true });
  } catch (error) {
    console.error('[MAIL] Error:', error);
    res.status(500).json({ error: 'email_send_failed' });
  }
});
```

#### Middleware d'authentification

```javascript
function authenticateApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  
  const apiKey = authHeader.substring(7);
  const validKey = process.env.REVIEWS_MAKER_API_KEY;
  
  if (apiKey !== validKey) {
    return res.status(403).json({ error: 'forbidden' });
  }
  
  next();
}
```

### Étape 3 : Configurer les variables d'environnement

Dans LaFoncedalleBot, ajoutez :
```bash
REVIEWS_MAKER_API_KEY=la_cle_generee_a_letape_1
```

Dans Reviews-Maker (`server/ecosystem.config.cjs`), configurez :
```javascript
env_production: {
  LAFONCEDALLE_API_URL: 'http://localhost:3001', // URL de LaFoncedalleBot
  LAFONCEDALLE_API_KEY: 'la_cle_generee_a_letape_1' // Même clé !
}
```

### Étape 4 : Tester

```bash
# Redémarrer LaFoncedalleBot
pm2 restart lafoncedalle-bot

# Tester l'intégration
cd /var/www/Reviews-Maker
chmod +x test-integration.sh
./test-integration.sh

# Ou tester manuellement
curl -X POST http://localhost:3001/api/discord/user-by-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE" \
  -d '{"email":"test@example.com"}'
```

## 📋 Ordre des opérations pour le déploiement

### Sur le VPS

1. **Configurer LaFoncedalleBot** (si pas déjà fait)
   - Implémenter les 2 endpoints
   - Ajouter la variable `REVIEWS_MAKER_API_KEY`
   - Redémarrer : `pm2 restart lafoncedalle-bot`

2. **Cloner Reviews-Maker**
   ```bash
   cd /var/www
   git clone https://github.com/RAFOUgg/Reviews-Maker.git
   cd Reviews-Maker/server
   npm install
   ```

3. **Configurer Reviews-Maker**
   - Éditer `ecosystem.config.cjs` avec l'URL et la clé API
   - Créer les dossiers : `mkdir -p ../db/review_images ../logs`

4. **Démarrer Reviews-Maker**
   ```bash
   pm2 start ecosystem.config.cjs --env production
   pm2 save
   ```

5. **Configurer Nginx**
   - Créer le fichier de configuration
   - Activer le site
   - Configurer HTTPS avec Let's Encrypt

6. **Tester l'intégration**
   ```bash
   ./test-integration.sh
   ```

## 🎯 Résultat attendu

Une fois tout configuré :

1. L'utilisateur clique sur le bouton 🔗 sur Reviews-Maker
2. Il entre son email (lié à Discord via LaFoncedalleBot)
3. Un code est envoyé par email
4. Il entre le code
5. Son compte est créé avec son pseudo Discord
6. Il peut maintenant sauvegarder et synchroniser ses reviews

## 📚 Documentation

- **Pour comprendre l'intégration** : `INTEGRATION_LAFONCEDALLE_API.md`
- **Pour implémenter les endpoints** : `ENDPOINTS_LAFONCEDALLE.md`
- **Pour déployer** : `DEPLOIEMENT_INTEGRATION_LAFONCEDALLE.md`
- **Pour configurer** : `server/.env.example`
- **Pour tester** : `test-integration.sh`

## 🆘 Support

**Vérifications rapides** :
```bash
# Status des services
pm2 status

# Logs Reviews-Maker
pm2 logs reviews-maker

# Logs LaFoncedalleBot
pm2 logs lafoncedalle-bot

# Tester la connexion
curl http://localhost:3000/api/ping  # Reviews-Maker
curl http://localhost:3001/health     # LaFoncedalleBot (si endpoint existe)
```

**Problèmes courants** :
- ❌ "Backend serveur détecté" n'apparaît pas → Reviews-Maker n'est pas démarré
- ❌ "Email non trouvé" → Email pas dans la base Discord
- ❌ "Erreur lors de l'envoi du code" → Service de mailing ou endpoint non configuré
- ❌ "API key invalide" → Clés différentes ou mal configurées

## ✅ Checklist finale

- [ ] Clé API générée et identique dans les 2 apps
- [ ] Endpoint `/api/discord/user-by-email` implémenté dans LaFoncedalleBot
- [ ] Endpoint `/api/mail/send-verification` implémenté dans LaFoncedalleBot
- [ ] Service de mailing fonctionnel dans LaFoncedalleBot
- [ ] Variables d'environnement configurées dans les 2 apps
- [ ] LaFoncedalleBot redémarré avec la nouvelle config
- [ ] Reviews-Maker déployé et démarré
- [ ] Nginx configuré avec proxy vers les 2 services
- [ ] HTTPS activé
- [ ] Test de l'intégration réussi (`test-integration.sh`)
- [ ] Test end-to-end depuis le navigateur réussi

Bonne chance ! 🚀
