# 🎯 Guide d'implémentation - Endpoints pour Reviews-Maker dans LaFoncedalleBot

## 📍 Fichier à modifier

Le fichier principal à modifier est : **`web_api/app.py`**

## 🔧 Étapes d'implémentation

### Étape 1 : Ajouter la configuration

Dans le fichier `web_api/app.py`, ajoutez cette configuration en haut avec les autres variables d'environnement (autour de la ligne 30) :

```python
# Configuration pour Reviews-Maker
REVIEWS_MAKER_API_KEY = os.getenv('REVIEWS_MAKER_API_KEY', 'your-api-key-here')
```

### Étape 2 : Ajouter les 2 nouveaux endpoints

Ajoutez ces deux endpoints dans `web_api/app.py`, après les endpoints existants (par exemple après `@app.route('/api/mark_reminder_sent', ...)` vers la ligne 730) :

```python
# ========================================
# ENDPOINTS POUR REVIEWS-MAKER
# ========================================

@app.route('/api/discord/user-by-email', methods=['POST'])
def get_discord_user_by_email():
    """
    Vérifie si un email existe dans la base Discord et retourne le profil utilisateur.
    Utilisé par Reviews-Maker pour l'authentification.
    """
    # Vérification de l'authentification API
    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {REVIEWS_MAKER_API_KEY}"
    if not auth_header or auth_header != expected_header:
        Logger.warning("Tentative d'accès non autorisée à /api/discord/user-by-email")
        return jsonify({"error": "unauthorized", "message": "API key manquante ou invalide"}), 401
    
    # Récupération de l'email
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({"error": "missing_email", "message": "Email manquant"}), 400
    
    # Recherche dans la base de données
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT discord_id, user_email FROM user_links WHERE LOWER(user_email) = ?",
                (email,)
            )
            result = cursor.fetchone()
        
        if not result:
            Logger.info(f"Email {anonymize_email(email)} non trouvé dans la base Discord")
            return jsonify({
                "error": "not_found",
                "message": "Email non lié à un compte Discord"
            }), 404
        
        discord_id, user_email = result
        
        # Récupérer le nom d'utilisateur Discord (si disponible via le bot)
        # Pour simplifier, on utilise l'ID Discord comme username
        # Vous pouvez améliorer ça en stockant le username dans user_links
        username = f"User#{discord_id[-4:]}"  # Format simple avec les 4 derniers chiffres
        
        Logger.success(f"Email {anonymize_email(email)} trouvé pour Discord ID {discord_id}")
        
        return jsonify({
            "discordId": str(discord_id),
            "username": username,
            "email": user_email
        }), 200
        
    except Exception as e:
        Logger.error(f"Erreur lors de la recherche d'email pour Reviews-Maker: {e}")
        traceback.print_exc()
        return jsonify({"error": "server_error", "message": "Erreur serveur"}), 500


@app.route('/api/mail/send-verification', methods=['POST'])
def send_verification_code():
    """
    Envoie un code de vérification par email pour Reviews-Maker.
    """
    # Vérification de l'authentification API
    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {REVIEWS_MAKER_API_KEY}"
    if not auth_header or auth_header != expected_header:
        Logger.warning("Tentative d'accès non autorisée à /api/mail/send-verification")
        return jsonify({"error": "unauthorized", "message": "API key manquante ou invalide"}), 401
    
    # Récupération des données
    data = request.get_json(silent=True) or {}
    to_email = data.get('to', '').strip()
    code = data.get('code', '').strip()
    subject = data.get('subject', 'Code de vérification Reviews Maker')
    app_name = data.get('appName', 'Reviews Maker')
    expiry_minutes = data.get('expiryMinutes', 10)
    
    if not to_email or not code:
        return jsonify({"error": "missing_fields", "message": "Email et code requis"}), 400
    
    # Construction de l'email HTML
    message = MIMEMultipart("alternative")
    message["Subject"] = str(Header(subject, 'utf-8'))
    message["From"] = f"LaFoncedalle <{SENDER_EMAIL}>"
    message["To"] = str(to_email)
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ 
                font-family: Arial, sans-serif; 
                background-color: #0f172a; 
                color: #e2e8f0; 
                padding: 20px; 
                margin: 0;
            }}
            .container {{ 
                max-width: 600px; 
                margin: 0 auto; 
                background: #1e293b; 
                padding: 30px; 
                border-radius: 12px;
                border: 1px solid #334155;
            }}
            h2 {{ 
                color: #38f4b8; 
                margin-bottom: 20px;
                margin-top: 0;
            }}
            .code {{ 
                font-size: 32px; 
                letter-spacing: 8px; 
                color: #38f4b8; 
                text-align: center; 
                margin: 30px 0; 
                font-weight: bold;
                background: #0f172a;
                padding: 20px;
                border-radius: 8px;
            }}
            .footer {{ 
                color: #64748b; 
                font-size: 14px; 
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #334155;
            }}
            p {{
                line-height: 1.6;
                margin: 15px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🔐 Code de vérification {app_name}</h2>
            <p>Bonjour,</p>
            <p>Votre code de vérification pour accéder à <strong>{app_name}</strong> est :</p>
            <div class="code">{code}</div>
            <p>Ce code expire dans <strong>{expiry_minutes} minutes</strong>.</p>
            <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            <div class="footer">
                <p>Cet email a été envoyé automatiquement depuis LaFoncedalle.</p>
                <p>Merci de ne pas y répondre.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    message.attach(MIMEText(html_body, "html", "utf-8"))
    
    # Envoi de l'email via SMTP
    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("mail.infomaniak.com", 465, context=context) as server:
            auth_string = f"\0{SENDER_EMAIL}\0{INFOMANIAK_APP_PASSWORD}"
            auth_bytes_utf8 = auth_string.encode('utf-8')
            auth_bytes_b64 = base64.b64encode(auth_bytes_utf8)
            server.docmd("AUTH", f"PLAIN {auth_bytes_b64.decode('ascii')}")
            server.sendmail(str(SENDER_EMAIL), str(to_email), message.as_string())
        
        Logger.success(f"Code de vérification Reviews-Maker envoyé à {anonymize_email(to_email)}")
        return jsonify({"ok": True}), 200
        
    except Exception as e:
        Logger.error(f"Erreur SMTP lors de l'envoi du code Reviews-Maker: {e}")
        traceback.print_exc()
        return jsonify({"error": "email_send_failed", "message": "Erreur lors de l'envoi de l'email"}), 500
```

### Étape 3 : Configurer la clé API

#### Dans votre fichier `.env` de LaFoncedalleBot :

Ajoutez cette ligne :

```bash
REVIEWS_MAKER_API_KEY=votre_cle_secrete_generee
```

#### Générer une clé sécurisée :

Sur votre VPS ou en local, exécutez :

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Ou avec openssl :

```bash
openssl rand -hex 32
```

Copiez la clé générée et mettez-la dans votre `.env`.

### Étape 4 : Redémarrer LaFoncedalleBot

```bash
pm2 restart lafoncedalle-bot
pm2 logs lafoncedalle-bot --lines 50
```

## 🧪 Test des endpoints

### Test 1 : Vérifier un email

```bash
curl -X POST http://localhost:5000/api/discord/user-by-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -d '{"email":"un_email_existant@example.com"}'
```

**Réponse attendue (email trouvé) :**
```json
{
  "discordId": "123456789",
  "username": "User#6789",
  "email": "un_email_existant@example.com"
}
```

**Réponse attendue (email non trouvé) :**
```json
{
  "error": "not_found",
  "message": "Email non lié à un compte Discord"
}
```

### Test 2 : Envoyer un code

```bash
curl -X POST http://localhost:5000/api/mail/send-verification \
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

**Réponse attendue :**
```json
{
  "ok": true
}
```

## 📝 Notes importantes

### 1. Amélioration du username Discord

Actuellement, le code utilise un username simple basé sur l'ID Discord. Pour avoir le vrai pseudo Discord, vous avez 2 options :

**Option A** : Stocker le username lors de la liaison du compte

Modifiez la table `user_links` pour ajouter une colonne `discord_username` :

```python
# Dans initialize_db() de web_api/app.py
cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_links (
        discord_id TEXT PRIMARY KEY,
        user_email TEXT UNIQUE NOT NULL,
        discord_username TEXT,
        linked_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
""")
```

Puis lors de la liaison (`/api/confirm-verification`), récupérez et stockez le username.

**Option B** : Garder le format simple

Le format actuel `User#6789` fonctionne bien et est plus simple à implémenter.

### 2. Sécurité

- ✅ Les endpoints sont protégés par clé API
- ✅ Les emails sont anonymisés dans les logs
- ✅ Les erreurs sont loggées correctement
- ✅ Le code utilise les mêmes pratiques que le reste de LaFoncedalleBot

### 3. Compatibilité

Le code s'intègre parfaitement avec :
- ✅ Le système d'email existant (SMTP Infomaniak)
- ✅ La base de données `user_links` déjà utilisée
- ✅ Le système de logging `Logger`
- ✅ Les utilitaires `anonymize_email` et `get_db_connection`

## 🔗 Configuration de Reviews-Maker

Une fois les endpoints ajoutés dans LaFoncedalleBot, configurez Reviews-Maker :

Dans `Reviews-Maker/server/ecosystem.config.cjs` :

```javascript
env_production: {
  PORT: 3000,
  NODE_ENV: 'production',
  LAFONCEDALLE_API_URL: 'http://localhost:5000',  // Port de LaFoncedalleBot
  LAFONCEDALLE_API_KEY: 'la_meme_cle_que_dans_lafoncedalle'  // Important !
}
```

## ✅ Checklist

- [ ] Code des 2 endpoints ajouté dans `web_api/app.py`
- [ ] Variable `REVIEWS_MAKER_API_KEY` ajoutée en haut du fichier
- [ ] Clé API générée (avec `openssl rand -hex 32`)
- [ ] Clé API ajoutée dans `.env` de LaFoncedalleBot
- [ ] LaFoncedalleBot redémarré (`pm2 restart`)
- [ ] Test endpoint 1 (user-by-email) réussi
- [ ] Test endpoint 2 (send-verification) réussi
- [ ] Email de test bien reçu
- [ ] Même clé API configurée dans Reviews-Maker
- [ ] Test de l'intégration complète depuis le navigateur

## 🆘 En cas de problème

**Erreur 401 "unauthorized"**
- Vérifiez que la clé API est identique dans les 2 applications
- Vérifiez que le header `Authorization` est bien `Bearer VOTRE_CLE`

**Erreur 404 "email not found"**
- L'email n'existe pas dans `user_links`
- Créez un compte test avec `/lier_compte` sur Discord

**Erreur 500 lors de l'envoi d'email**
- Vérifiez les logs : `pm2 logs lafoncedalle-bot`
- Vérifiez que SMTP est bien configuré
- Testez avec l'endpoint `/api/test-email` existant

**Module manquant**
```bash
cd ~/LaFoncedalleBot
source venv/bin/activate
pip install -r requirements.txt
```

Bon courage ! 🚀
