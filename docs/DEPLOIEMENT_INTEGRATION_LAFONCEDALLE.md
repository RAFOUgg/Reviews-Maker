# Guide de déploiement - Intégration Reviews Maker ↔ LaFoncedalleBot

## Prérequis

- LaFoncedalleBot déjà déployé et opérationnel sur le VPS
- Système de mailing fonctionnel dans LaFoncedalleBot
- Base de données Discord avec emails des utilisateurs
- Node.js et PM2 installés

## Étape 1: Configuration de LaFoncedalleBot

### 1.1 Générer une clé API sécurisée

Sur le VPS, générez une clé API forte :

```bash
openssl rand -hex 32
```

Copiez cette clé, vous en aurez besoin pour les deux applications.

### 1.2 Ajouter les endpoints API à LaFoncedalleBot

Ajoutez les deux endpoints suivants dans votre serveur LaFoncedalleBot :

**a) Middleware d'authentification API**

```javascript
// Dans votre fichier serveur LaFoncedalleBot
function authenticateApiKey(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'API key manquante' });
  }
  
  const apiKey = authHeader.substring(7);
  const validKey = process.env.REVIEWS_MAKER_API_KEY; // Variable d'environnement
  
  if (apiKey !== validKey) {
    return res.status(403).json({ error: 'forbidden', message: 'API key invalide' });
  }
  
  next();
}
```

**b) Endpoint: Vérifier email et récupérer profil Discord**

```javascript
app.post('/api/discord/user-by-email', authenticateApiKey, async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'missing_email' });
  }
  
  try {
    // Adaptez cette requête à votre structure de base de données
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

**c) Endpoint: Envoyer email de vérification**

```javascript
app.post('/api/mail/send-verification', authenticateApiKey, async (req, res) => {
  const { to, code, subject, appName, expiryMinutes } = req.body;
  
  if (!to || !code) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  try {
    // Utilisez votre service de mailing existant
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; }
            h2 { color: #38f4b8; }
            .code { font-size: 32px; letter-spacing: 8px; color: #38f4b8; text-align: center; margin: 30px 0; font-weight: bold; }
            .footer { color: #64748b; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Code de vérification ${appName || 'Reviews Maker'}</h2>
            <p>Bonjour,</p>
            <p>Votre code de vérification pour accéder à ${appName || 'Reviews Maker'} est :</p>
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
    
    // Adaptez à votre service de mailing (nodemailer, etc.)
    await yourMailingService.sendMail({
      to: to,
      subject: subject || 'Code de vérification',
      html: emailContent
    });
    
    console.log(`[MAIL] Verification code sent to ${to}`);
    res.json({ ok: true });
  } catch (error) {
    console.error('[MAIL] Error sending verification email:', error);
    res.status(500).json({ error: 'email_send_failed' });
  }
});
```

### 1.3 Configurer les variables d'environnement LaFoncedalleBot

Dans votre configuration PM2 ou `.env` de LaFoncedalleBot, ajoutez :

```bash
REVIEWS_MAKER_API_KEY=la_cle_generee_a_letape_1.1
```

### 1.4 Redémarrer LaFoncedalleBot

```bash
pm2 restart lafoncedalle-bot
pm2 logs lafoncedalle-bot --lines 50
```

## Étape 2: Déploiement de Reviews Maker sur le VPS

### 2.1 Cloner le projet

```bash
cd /var/www  # ou votre dossier d'applications
git clone https://github.com/RAFOUgg/Reviews-Maker.git
cd Reviews-Maker
```

### 2.2 Installer les dépendances

```bash
cd server
npm install
```

### 2.3 Configurer les variables d'environnement

Éditez `ecosystem.config.cjs` :

```bash
nano ecosystem.config.cjs
```

Modifiez la section `env_production` :

```javascript
env_production: {
  PORT: 3000,  // Ou un port libre sur votre VPS
  NODE_ENV: 'production',
  LAFONCEDALLE_API_URL: 'http://localhost:3001',  // Port de LaFoncedalleBot
  LAFONCEDALLE_API_KEY: 'la_cle_generee_a_letape_1.1'  // La même clé !
}
```

### 2.4 Créer les dossiers nécessaires

```bash
cd /var/www/Reviews-Maker
mkdir -p db/review_images
mkdir -p server/tokens
mkdir -p logs
```

### 2.5 Permissions

```bash
chmod -R 755 /var/www/Reviews-Maker
chown -R $USER:$USER /var/www/Reviews-Maker
```

### 2.6 Démarrer avec PM2

```bash
cd /var/www/Reviews-Maker/server
pm2 start ecosystem.config.cjs --env production
pm2 save
```

### 2.7 Vérifier que le serveur fonctionne

```bash
pm2 logs reviews-maker --lines 30
```

Vous devriez voir :
```
Reviews Maker API running on port 3000
```

## Étape 3: Configuration Nginx

### 3.1 Créer un nouveau site Nginx pour Reviews Maker

```bash
sudo nano /etc/nginx/sites-available/reviews-maker
```

Contenu du fichier :

```nginx
server {
    listen 80;
    server_name reviews.votredomaine.com;  # Changez selon votre domaine

    # Logs
    access_log /var/log/nginx/reviews-maker-access.log;
    error_log /var/log/nginx/reviews-maker-error.log;

    # Fichiers statiques (HTML, CSS, JS, images)
    location / {
        root /var/www/Reviews-Maker;
        try_files $uri $uri/ /index.html;
        
        # Cache des fichiers statiques
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg)$ {
            expires 7d;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Images uploadées
    location /images {
        proxy_pass http://localhost:3000/images;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Cache des images
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.2 Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/reviews-maker /etc/nginx/sites-enabled/
sudo nginx -t  # Vérifier la configuration
sudo systemctl reload nginx
```

### 3.3 (Optionnel) Activer HTTPS avec Let's Encrypt

```bash
sudo certbot --nginx -d reviews.votredomaine.com
```

## Étape 4: Tests de l'intégration

### 4.1 Tester la connexion API entre les deux services

```bash
# Test depuis le VPS
curl -X POST http://localhost:3001/api/discord/user-by-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -d '{"email":"un_email_existant@example.com"}'
```

Résultat attendu :
```json
{
  "discordId": "123456789",
  "username": "User#1234",
  "email": "un_email_existant@example.com"
}
```

### 4.2 Tester l'envoi d'email

```bash
curl -X POST http://localhost:3001/api/mail/send-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -d '{
    "to":"votre_email@example.com",
    "code":"123456",
    "subject":"Test Reviews Maker",
    "appName":"Reviews Maker",
    "expiryMinutes":10
  }'
```

### 4.3 Tester depuis le navigateur

1. Ouvrez `http://reviews.votredomaine.com` (ou votre domaine)
2. Cliquez sur le bouton de liaison (🔗) en bas à droite
3. Entrez un email lié à Discord
4. Vérifiez que vous recevez le code par email
5. Entrez le code et connectez-vous

## Étape 5: Monitoring

### 5.1 Surveiller les logs

```bash
# Reviews Maker
pm2 logs reviews-maker --lines 50

# LaFoncedalleBot
pm2 logs lafoncedalle-bot --lines 50

# Nginx
sudo tail -f /var/log/nginx/reviews-maker-error.log
```

### 5.2 Status des services

```bash
pm2 status
sudo systemctl status nginx
```

## Dépannage

### Problème: "Backend serveur détecté" n'apparaît pas

**Solution:**
```bash
# Vérifier que Reviews-Maker est démarré
pm2 list

# Vérifier les logs
pm2 logs reviews-maker

# Vérifier que le port est bien écouté
netstat -tlnp | grep 3000
```

### Problème: "Email non trouvé"

**Solution:**
```bash
# Tester l'endpoint directement
curl -X POST http://localhost:3001/api/discord/user-by-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE" \
  -d '{"email":"test@example.com"}'

# Vérifier la base de données Discord
# Connectez-vous à votre DB et vérifiez que l'email existe
```

### Problème: "Erreur lors de l'envoi du code"

**Solution:**
```bash
# Vérifier que LaFoncedalleBot répond
curl -X POST http://localhost:3001/api/mail/send-verification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE" \
  -d '{"to":"test@example.com","code":"123456"}'

# Vérifier les logs du service de mailing
pm2 logs lafoncedalle-bot | grep MAIL
```

### Problème: API Key invalide

**Solution:**
- Vérifiez que la clé est identique dans les deux applications
- Vérifiez qu'il n'y a pas d'espaces avant/après la clé
- Relancez les deux services après modification

```bash
pm2 restart reviews-maker
pm2 restart lafoncedalle-bot
```

## Sauvegarde et maintenance

### Backup de la base de données Reviews

```bash
# Créer un backup
cp /var/www/Reviews-Maker/db/reviews.sqlite /var/backups/reviews-$(date +%Y%m%d).sqlite

# Automatiser avec cron
crontab -e
# Ajouter: 0 2 * * * cp /var/www/Reviews-Maker/db/reviews.sqlite /var/backups/reviews-$(date +%Y%m%d).sqlite
```

### Mise à jour de Reviews Maker

```bash
cd /var/www/Reviews-Maker
git pull
cd server
npm install
pm2 restart reviews-maker
```

## Sécurité

### ✅ Checklist de sécurité

- [ ] Clé API forte et sécurisée (32+ caractères)
- [ ] HTTPS activé avec certificat valide
- [ ] Firewall configuré (UFW)
- [ ] Permissions fichiers correctes (755 pour dossiers, 644 pour fichiers)
- [ ] Logs rotatifs configurés
- [ ] Backup automatique de la base de données
- [ ] Rate limiting sur Nginx (optionnel)
- [ ] Monitoring actif (PM2, logs)

## Support

Pour toute question ou problème :
1. Consultez les logs: `pm2 logs reviews-maker`
2. Vérifiez la documentation: `INTEGRATION_LAFONCEDALLE_API.md`
3. Testez les endpoints API manuellement avec curl
4. Vérifiez la connectivité entre les services

## Ressources

- [Documentation PM2](https://pm2.keymetrics.io/)
- [Documentation Nginx](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
