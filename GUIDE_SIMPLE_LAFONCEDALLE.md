# 🚀 GUIDE ULTRA-SIMPLE - Intégration Reviews-Maker

## 📍 Ce qu'il faut faire

Vous devez ajouter **2 endpoints** dans votre serveur Flask de LaFoncedalleBot.

## 🔧 ÉTAPE 1 : Ouvrir le bon fichier

Sur votre VPS, connectez-vous et ouvrez :

```bash
ssh votre_user@votre_vps
cd ~/LaFoncedalleBot
nano web_api/app.py
```

## 🔧 ÉTAPE 2 : Ajouter la config (ligne ~30)

Cherchez la section avec les autres `os.getenv()` (vers le haut du fichier) et ajoutez :

```python
# Configuration pour Reviews-Maker
REVIEWS_MAKER_API_KEY = os.getenv('REVIEWS_MAKER_API_KEY', 'your-api-key-here')
```

## 🔧 ÉTAPE 3 : Ajouter les endpoints (à la fin)

Scrollez tout en bas du fichier (juste AVANT `if __name__ == '__main__':`) et collez :

```python
# ========================================
# ENDPOINTS POUR REVIEWS-MAKER
# ========================================

@app.route('/api/discord/user-by-email', methods=['POST'])
def get_discord_user_by_email():
    """Vérifie si un email existe dans la base Discord."""
    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {REVIEWS_MAKER_API_KEY}"
    if not auth_header or auth_header != expected_header:
        Logger.warning("Tentative d'accès non autorisée à /api/discord/user-by-email")
        return jsonify({"error": "unauthorized", "message": "API key manquante ou invalide"}), 401
    
    data = request.get_json(silent=True) or {}
    email = data.get('email', '').strip().lower()
    
    if not email:
        return jsonify({"error": "missing_email", "message": "Email manquant"}), 400
    
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
        username = f"User#{discord_id[-4:]}"
        
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
    """Envoie un code de vérification par email pour Reviews-Maker."""
    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {REVIEWS_MAKER_API_KEY}"
    if not auth_header or auth_header != expected_header:
        Logger.warning("Tentative d'accès non autorisée à /api/mail/send-verification")
        return jsonify({"error": "unauthorized", "message": "API key manquante ou invalide"}), 401
    
    data = request.get_json(silent=True) or {}
    to_email = data.get('to', '').strip()
    code = data.get('code', '').strip()
    subject = data.get('subject', 'Code de vérification Reviews Maker')
    app_name = data.get('appName', 'Reviews Maker')
    expiry_minutes = data.get('expiryMinutes', 10)
    
    if not to_email or not code:
        return jsonify({"error": "missing_fields", "message": "Email et code requis"}), 400
    
    message = MIMEMultipart("alternative")
    message["Subject"] = str(Header(subject, 'utf-8'))
    message["From"] = f"LaFoncedalle <{SENDER_EMAIL}>"
    message["To"] = str(to_email)
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; background-color: #0f172a; color: #e2e8f0; padding: 20px; margin: 0; }}
            .container {{ max-width: 600px; margin: 0 auto; background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; }}
            h2 {{ color: #38f4b8; margin-bottom: 20px; margin-top: 0; }}
            .code {{ font-size: 32px; letter-spacing: 8px; color: #38f4b8; text-align: center; margin: 30px 0; font-weight: bold; background: #0f172a; padding: 20px; border-radius: 8px; }}
            .footer {{ color: #64748b; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; }}
            p {{ line-height: 1.6; margin: 15px 0; }}
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

Sauvegardez : `Ctrl+X`, puis `Y`, puis `Entrée`

## 🔧 ÉTAPE 4 : Ajouter la clé API dans .env

```bash
cd ~/LaFoncedalleBot
nano .env
```

Ajoutez à la fin :

```bash
REVIEWS_MAKER_API_KEY=7e5f5c97bf1ea98f0d9be2a4ad0300dc84a5c34d10d5d44f14d85af0ec5efd16
```

Pour générer une clé sécurisée :

```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

Copiez la clé générée et collez-la dans `.env`.

Sauvegardez : `Ctrl+X`, puis `Y`, puis `Entrée`

## 🔧 ÉTAPE 5 : Redémarrer

```bash
cd ~/LaFoncedalleBot
pm2 restart lafoncedalle-bot
pm2 logs lafoncedalle-bot --lines 20
```

## ✅ TEST

```bash
# Remplacez VOTRE_CLE par la clé que vous avez générée
curl -X POST http://localhost:5000/api/discord/user-by-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_CLE" \
  -d '{"email":"un_email_qui_existe@example.com"}'
```

Si ça marche, vous verrez :
```json
{"discordId":"123456","username":"User#1234","email":"..."}
```

## 🔧 ÉTAPE 6 : Configurer Reviews-Maker

```bash
cd ~/Reviews-Maker
nano server/ecosystem.config.cjs
```

Dans la section `env_production`, ajoutez :

```javascript
LAFONCEDALLE_API_URL: 'http://localhost:5000',
LAFONCEDALLE_API_KEY: 'la_meme_cle_que_dans_lafoncedalle'
```

Sauvegardez et redémarrez :

```bash
cd ~/Reviews-Maker/server
pm2 restart reviews-maker
```

## 🎉 C'EST FINI !

Testez depuis le navigateur :
1. Allez sur votre site Reviews-Maker
2. Cliquez sur le bouton 🔗 en bas à droite
3. Entrez votre email
4. Recevez le code
5. Entrez le code
6. Vous êtes connecté !

## 🆘 Problèmes ?

**"API key invalide"**
→ Les clés sont différentes. Vérifiez qu'elles sont identiques.

**"Email non trouvé"**
→ Normal si l'email n'existe pas. Créez un compte test avec `/lier_compte` sur Discord.

**"Erreur serveur"**
→ Regardez les logs : `pm2 logs lafoncedalle-bot`

**Le code ne fonctionne pas**
→ Vérifiez que vous avez bien copié TOUT le code, y compris la ligne de config en haut.

---

📚 **Documentations complètes disponibles dans :**
- `GUIDE_IMPLEMENTATION_LAFONCEDALLE.md`
- `ENDPOINTS_LAFONCEDALLE.md`
- `RECAP_INTEGRATION.md`
