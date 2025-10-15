import os
import sqlite3
import random
import time
import threading
import asyncio
import traceback # Ajouté pour un meilleur logging d'erreur
import base64

# Imports pour l'e-mail
import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header # [CORRECTION] Importé pour gérer l'encodage du sujet
import csv
import io
from email.mime.application import MIMEApplication
# Imports Flask et Shopify
from flask import Flask, request, jsonify
from typing import Any
import shopify as _shopify
# The official 'shopify' package exposes attributes dynamically which static analyzers
# (Pylance) often can't resolve; expose it as Any to reduce false-positive diagnostics.
shopify: Any = _shopify
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
import json
from utils.shared_utils import Logger, DB_FILE, anonymize_email, get_db_connection


# --- Initialisation : Charger les clés secrètes depuis les variables d'environnement ---
load_dotenv()
app = Flask(__name__)
FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY') # On lit la variable
app.secret_key = FLASK_SECRET_KEY # On l'assigne à l'application
SHOP_URL = os.getenv('SHOPIFY_SHOP_URL')
SHOPIFY_API_VERSION = os.getenv('SHOPIFY_API_VERSION')

# Variable critique sans valeur par défaut - doit être dans .env
REVIEWS_MAKER_API_KEY = os.getenv('REVIEWS_MAKER_API_KEY')
if not REVIEWS_MAKER_API_KEY:
    raise ValueError("REVIEWS_MAKER_API_KEY est requis dans le fichier .env")

# Récupération des secrets depuis les variables d'environnement SMTP
SENDER_EMAIL = os.getenv('SENDER_EMAIL')
INFOMANIAK_APP_PASSWORD = os.getenv('INFOMANIAK_APP_PASSWORD')
SHOPIFY_ADMIN_ACCESS_TOKEN = os.getenv('SHOPIFY_ADMIN_ACCESS_TOKEN')

# On utilise le même chemin que le bot pour avoir une seule DB
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
paris_tz = timezone(timedelta(hours=2))

CLAIMED_WELCOME_CODES_FILE = os.path.join(BASE_DIR, "claimed_welcome_codes.json")
WELCOME_CODES_FILE = os.path.join(BASE_DIR, "welcome_codes.txt")

# --- Initialisation de la Base de Données ---
# Dans app.py

def initialize_db():
    """Initialise les tables pour la liaison de comptes, les rappels et la liste noire dans la DB partagée."""
    print(f"INFO: Initialisation des tables dans la base de données: {DB_FILE}")
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Table principale user_links avec toutes les colonnes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_links (
                discord_id TEXT PRIMARY KEY,
                user_email TEXT NOT NULL,
                user_name TEXT,
                verified BOOLEAN DEFAULT 0,
                active BOOLEAN DEFAULT 1,
                linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Migrations: Ajouter les colonnes si elles n'existent pas
        migrations = [
            ("user_name", "ALTER TABLE user_links ADD COLUMN user_name TEXT"),
            ("verified", "ALTER TABLE user_links ADD COLUMN verified BOOLEAN DEFAULT 0"),
            ("active", "ALTER TABLE user_links ADD COLUMN active BOOLEAN DEFAULT 1"),
            ("linked_at", "ALTER TABLE user_links ADD COLUMN linked_at DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ("last_updated", "ALTER TABLE user_links ADD COLUMN last_updated DATETIME DEFAULT CURRENT_TIMESTAMP")
        ]
        
        for col_name, migration_sql in migrations:
            try:
                cursor.execute(migration_sql)
                print(f"INFO: Colonne {col_name} ajoutée à la table user_links")
            except Exception:
                # La colonne existe déjà
                pass
        
        # Mettre à jour les comptes existants qui n'ont pas de valeur active
        cursor.execute("UPDATE user_links SET active = 1 WHERE active IS NULL")
        
        # Créer les index
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_links_active ON user_links(active)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_user_links_verified ON user_links(verified)")
        
        cursor.execute("CREATE TABLE IF NOT EXISTS verification_codes (discord_id TEXT PRIMARY KEY, user_email TEXT NOT NULL, code TEXT NOT NULL, expires_at INTEGER NOT NULL);")
        
        # Table pour suivre les rappels envoyés
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reminders (
                discord_id TEXT NOT NULL,
                order_id INTEGER NOT NULL,
                notified_at TEXT NOT NULL,
                PRIMARY KEY (discord_id, order_id)
            );
        """)
        
        # Table pour la liste noire
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reminder_blacklist (
                discord_id TEXT PRIMARY KEY,
                added_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        conn.commit()
        print("INFO: Tables initialisées avec succès.")

initialize_db()


# --- Routes de l'API ---

@app.route('/')
def health_check():
    return "L'application pont Shopify-Discord est en ligne.", 200

@app.route('/api/start-verification', methods=['POST'])
def start_verification():
    force = request.args.get('force', 'false').lower() == 'true'
    data = request.get_json(silent=True) or {}
    discord_id, email = data.get('discord_id'), data.get('email')

    if not all([discord_id, email]): return jsonify({"error": "Données manquantes."}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()

        if not force:
            # Vérifier si un compte ACTIF existe déjà pour ce discord_id
            cursor.execute("SELECT user_email, active FROM user_links WHERE discord_id = ?", (discord_id,))
            result = cursor.fetchone()
            if result:
                existing_email, is_active = result
                if is_active:
                    # Compte déjà actif
                    anonymized_email = anonymize_email(existing_email)
                    return jsonify({"status": "conflict", "existing_email": anonymized_email}), 409
                # Si active=0, on peut réactiver avec un nouveau code (continue)

        # Vérifier si l'email est utilisé par un AUTRE utilisateur ACTIF
        cursor.execute("SELECT discord_id FROM user_links WHERE user_email = ? AND discord_id != ? AND active = 1", (email, discord_id))
        if cursor.fetchone():
            return jsonify({"error": "Cet e-mail est déjà utilisé par un autre compte actif."}), 409
        
        code = str(random.randint(100000, 999999))
        expires_at = int(time.time()) + 600
        message = MIMEMultipart("alternative")
        sujet = "Votre code de vérification LaFoncedalle"
        expediteur_formate = f"LaFoncedalle <{SENDER_EMAIL}>"
        # Cast Header to str so static checkers accept assignment to message headers
        message["Subject"] = str(Header(sujet, 'utf-8'))
        message["From"] = expediteur_formate
        message["To"] = str(email)
        html_body = f'Bonjour !<br>Voici votre code de vérification : <strong>{code}</strong><br>Ce code expire dans 10 minutes.'
        message.attach(MIMEText(html_body, "html", "utf-8"))
        context = ssl.create_default_context()
        try:
            with smtplib.SMTP_SSL("mail.infomaniak.com", 465, context=context) as server:
                auth_string = f"\0{SENDER_EMAIL}\0{INFOMANIAK_APP_PASSWORD}"
                auth_bytes_utf8 = auth_string.encode('utf-8')
                auth_bytes_b64 = base64.b64encode(auth_bytes_utf8)
                server.docmd("AUTH", f"PLAIN {auth_bytes_b64.decode('ascii')}")
                server.sendmail(str(SENDER_EMAIL), str(email), message.as_string())
        except Exception as e:
            print(f"ERREUR SMTP CRITIQUE: {e}")
            traceback.print_exc()
            return jsonify({"error": "Impossible d'envoyer l'e-mail de vérification."}), 500

        cursor.execute("INSERT OR REPLACE INTO verification_codes VALUES (?, ?, ?, ?)", (discord_id, email, code, expires_at))
        
        # 🔥 Sauvegarder IMMÉDIATEMENT dans user_links (verified=0, active=1)
        # Si le compte existait avec active=0, on le réactive
        cursor.execute("SELECT user_name FROM user_links WHERE discord_id = ?", (discord_id,))
        existing = cursor.fetchone()
        user_name = existing[0] if existing and existing[0] else f"User#{str(discord_id)[-4:]}"
        
        Logger.info(f"API: Enregistrement immédiat dans user_links pour {discord_id} avec email {anonymize_email(str(email))}")
        
        cursor.execute("""
            INSERT OR REPLACE INTO user_links (discord_id, user_email, user_name, verified, active, linked_at, last_updated)
            VALUES (?, ?, ?, 0, 1, 
                COALESCE((SELECT linked_at FROM user_links WHERE discord_id = ?), CURRENT_TIMESTAMP),
                CURRENT_TIMESTAMP)
        """, (discord_id, email, user_name, discord_id))
        
        conn.commit()
        
        Logger.success(f"API: Compte {discord_id} enregistré dans user_links (verified=0, active=1)")
    return jsonify({"success": True}), 200

@app.route('/api/blacklist_user_for_reminders', methods=['POST'])
def blacklist_user_for_reminders():
    """Ajoute un utilisateur à la liste noire pour les rappels."""
    data = request.get_json(silent=True) or {}
    discord_id = data.get('discord_id')

    if not discord_id:
        return jsonify({"error": "L'ID Discord est manquant."}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            # On insère ou on remplace s'il existe déjà (ce qui ne devrait pas arriver avec un custom_id unique)
            cursor.execute("INSERT OR REPLACE INTO reminder_blacklist (discord_id, blacklisted_at) VALUES (?, ?)",
                           (discord_id, datetime.utcnow().isoformat()))
            conn.commit()
            Logger.success(f"API: L'utilisateur {discord_id} a été ajouté à la liste noire des rappels.")
            return jsonify({"success": True}), 200
        except Exception as e:
            Logger.error(f"API DB Error dans blacklist_user_for_reminders: {e}")
            return jsonify({"error": "Erreur interne lors de l'ajout à la liste noire."}), 500

@app.route('/api/is_user_blacklisted', methods=['POST'])
def is_user_blacklisted():
    """Vérifie si un utilisateur est sur la liste noire pour les rappels."""
    data = request.get_json(silent=True) or {}
    discord_id = data.get('discord_id')

    if not discord_id:
        return jsonify({"error": "L'ID Discord est manquant."}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("SELECT 1 FROM reminder_blacklist WHERE discord_id = ?", (discord_id,))
            is_blacklisted = cursor.fetchone() is not None
            Logger.info(f"API: Vérification liste noire pour {discord_id}. Résultat: {is_blacklisted}")
            return jsonify({"blacklisted": is_blacklisted}), 200
        except Exception as e:
            Logger.error(f"API DB Error dans is_user_blacklisted: {e}")
            return jsonify({"error": "Erreur interne lors de la vérification de la liste noire."}), 500
        
@app.route('/api/test-email', methods=['POST'])
def test_email():
    # --- LOG DE DIAGNOSTIC ---
    data = request.get_json(silent=True) or {}
    recipient_email = data.get('recipient_email')
    Logger.info(f"Appel de /api/test-email reçu pour le destinataire : {recipient_email}")

    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {FLASK_SECRET_KEY}"
    if not auth_header or auth_header != expected_header:
        return jsonify({"error": "Accès non autorisé."}), 401

    if not recipient_email:
        return jsonify({"error": "E-mail destinataire manquant."}), 400

    message = MIMEMultipart("alternative")
    sujet = "Email de Test - LaFoncedalleBot"
    # Header expects string; convert to str to satisfy type checkers
    message["Subject"] = str(Header(sujet, 'utf-8'))
    message["From"] = f"LaFoncedalle <{SENDER_EMAIL}>"
    message["To"] = str(recipient_email)
    html_body = f"""
    <html><body><h3>Ceci est un e-mail de test.</h3>
    <p>Si vous recevez cet e-mail, la configuration SMTP est <strong>correcte</strong>.</p>
    <p><b>Heure du test:</b> {datetime.now(paris_tz).strftime('%Y-%m-%d %H:%M:%S')}</p>
    </body></html>"""
    message.attach(MIMEText(html_body, "html", "utf-8"))
    
    context = ssl.create_default_context()
    try:
        with smtplib.SMTP_SSL("mail.infomaniak.com", 465, context=context) as server:
            auth_string = f"\0{SENDER_EMAIL}\0{INFOMANIAK_APP_PASSWORD}"
            auth_bytes_utf8 = auth_string.encode('utf-8')
            auth_bytes_b64 = base64.b64encode(auth_bytes_utf8)
            server.docmd("AUTH", f"PLAIN {auth_bytes_b64.decode('ascii')}")
            server.sendmail(str(SENDER_EMAIL), str(recipient_email), message.as_string())
        
        Logger.success(f"E-mail de test envoyé avec succès à {recipient_email}.")
        return jsonify({"success": True, "message": f"E-mail de test envoyé à {recipient_email}."}), 200

    except Exception as e:
        Logger.error(f"ERREUR SMTP CRITIQUE lors du test: {e}"); traceback.print_exc()
        return jsonify({"error": "Impossible d'envoyer l'e-mail de test.", "details": str(e)}), 500
    
@app.route('/api/add-comment', methods=['POST'])
def add_comment():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id')
    product_name = data.get('product_name')
    comment_text = data.get('comment')

    if not all([user_id, product_name, comment_text]):
        return jsonify({"error": "Données manquantes pour ajouter le commentaire."}), 400

    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("""
                UPDATE ratings 
                SET comment = ? 
                WHERE user_id = ? AND product_name = ?
            """, (comment_text, user_id, product_name))
            conn.commit()
            
            # On vérifie si une ligne a bien été modifiée
            if conn.total_changes == 0:
                return jsonify({"error": "Aucune note correspondante à mettre à jour."}), 404
            
        print(f"INFO: Commentaire ajouté pour {user_id} sur le produit {product_name}")
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"Erreur SQL lors de l'ajout du commentaire : {e}")
        traceback.print_exc()
    return jsonify({"error": "Erreur lors de la sauvegarde du commentaire."}), 500
    
@app.route('/api/confirm-verification', methods=['POST'])
def confirm_verification():
    data = request.get_json(silent=True) or {}
    discord_id = data.get('discord_id')
    code = data.get('code')
    user_name = data.get('user_name')  # NOUVEAU: Recevoir depuis le client

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_email, expires_at FROM verification_codes WHERE discord_id = ? AND code = ?", (discord_id, code))
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": "Code invalide ou expiré."}), 400
        
        user_email, expires_at = result
        if time.time() > expires_at:
            return jsonify({"error": "Le code de vérification a expiré."}), 400
        
        # Si user_name n'est pas fourni, créer un fallback
        if not user_name:
            user_name = f"User#{str(discord_id)[-4:]}"
        
        # 🔥 MODIFICATION: UPDATE verified=1 et active=1 (l'email est déjà dans user_links depuis /lier_compte)
        cursor.execute("""
            UPDATE user_links 
            SET user_name = ?, verified = 1, active = 1, last_updated = CURRENT_TIMESTAMP
            WHERE discord_id = ?
        """, (user_name, discord_id))
        
        cursor.execute("DELETE FROM verification_codes WHERE discord_id = ?", (discord_id,))
        conn.commit()

    # --- Nouvelle logique d'envoi de code de bienvenue avec API ---
    try:
        from .reward_handlers import handle_welcome_reward
        import asyncio

        # Cast to str to satisfy the handler's signature and static checkers
        success, gift_code, reason = asyncio.run(handle_welcome_reward(str(discord_id), str(user_email)))

        if not success:
            # Une erreur s'est produite
            if reason == "already_claimed":
                Logger.info(f"L'utilisateur {discord_id} a déjà réclamé un code de bienvenue.")
                return jsonify({"success": True, "gift_sent": False, "reason": "already_claimed", "email": user_email}), 200
            elif reason == "no_codes_available":
                Logger.error("Plus de codes de bienvenue disponibles !")
                return jsonify({"success": True, "gift_sent": False, "reason": "no_codes_available", "email": user_email}), 200
            else:
                Logger.error(f"Erreur lors de l'attribution du code de bienvenue : {reason}")
                return jsonify({"error": f"Erreur lors de l'envoi du code de bienvenue : {reason}", "email": user_email}), 500

        # Code attribué avec succès
        Logger.success(f"Code de bienvenue '{gift_code}' envoyé à {user_email} pour l'utilisateur {discord_id}.")
        return jsonify({
            "success": True,
            "gift_sent": True,
            "code": gift_code,
            "email": user_email
        }), 200

    except Exception as e:
        Logger.error(f"ERREUR CRITIQUE lors de l'envoi du code de bienvenue : {e}")
        traceback.print_exc()
        return jsonify({"error": f"Erreur lors de l'envoi du code de bienvenue : {str(e)}"}), 500

@app.route('/api/unlink', methods=['POST'])
def unlink_account():
    """Délie un compte en le désactivant (active=0) SANS supprimer les métadonnées."""
    data = request.get_json(silent=True) or {}
    discord_id = data.get('discord_id')
    if not discord_id: return jsonify({"error": "ID Discord manquant."}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Vérifier qu'un compte ACTIF existe
        cursor.execute("SELECT user_email FROM user_links WHERE discord_id = ? AND active = 1", (discord_id,))
        result = cursor.fetchone()

        if not result:
            return jsonify({"error": "Aucun compte actif n'est lié à cet ID Discord."}), 404

        # 🔥 NOUVEAU: On désactive au lieu de supprimer (conserve les métadonnées)
        cursor.execute("""
            UPDATE user_links 
            SET active = 0, last_updated = CURRENT_TIMESTAMP
            WHERE discord_id = ?
        """, (discord_id,))
        conn.commit()
        
        Logger.info(f"Compte {discord_id} délié (email: {anonymize_email(result[0])}) - métadonnées conservées")
    return jsonify({"success": True, "unlinked_email": result[0]}), 200

@app.route('/api/force-link', methods=['POST'])
def force_link():
    force = request.args.get('force', 'false').lower() == 'true'
    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {FLASK_SECRET_KEY}"
    if not auth_header or auth_header != expected_header:
        return jsonify({"error": "Accès non autorisé."}), 401

    data = request.get_json(silent=True) or {}
    discord_id, email = data.get('discord_id'), data.get('email')
    user_name = data.get('user_name')  # NOUVEAU
    
    if not all([discord_id, email]): 
        return jsonify({"error": "ID Discord ou e-mail manquant."}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()

        if not force:
            cursor.execute("SELECT user_email, active FROM user_links WHERE discord_id = ?", (discord_id,))
            result = cursor.fetchone()
            if result and result[1]:  # Si active=1
                anonymized_email = anonymize_email(result[0])
                return jsonify({"status": "conflict", "existing_email": anonymized_email}), 409
        
        # Si user_name n'est pas fourni, créer un fallback
        if not user_name:
            user_name = f"User#{str(discord_id)[-4:]}"
        
        # Vérifier si compte existait
        cursor.execute("SELECT linked_at FROM user_links WHERE discord_id = ?", (discord_id,))
        existing = cursor.fetchone()
        linked_at_value = existing[0] if existing else None
        
        # MODIFICATION: Insérer/remplacer avec toutes les colonnes
        cursor.execute("""
            INSERT OR REPLACE INTO user_links (discord_id, user_email, user_name, verified, active, linked_at, last_updated)
            VALUES (?, ?, ?, 1, 1, COALESCE(?, CURRENT_TIMESTAMP), CURRENT_TIMESTAMP)
        """, (discord_id, email, user_name, linked_at_value))
        
        cursor.execute("DELETE FROM verification_codes WHERE discord_id = ?", (discord_id,))
        conn.commit()
    return jsonify({"success": True, "message": f"Compte {discord_id} forcé à être lié à {email}."}), 200

@app.route('/api/get_user_email/<discord_id>')
def get_user_email(discord_id):
    """
    Endpoint pour Review-Maker : récupère l'email d'un utilisateur lié.
    Retourne l'email si le compte est actif, sinon erreur 404.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_email FROM user_links WHERE discord_id = ? AND active = 1", (discord_id,))
        result = cursor.fetchone()
    
    if not result:
        Logger.warning(f"API: get_user_email - Aucun compte actif pour discord_id={discord_id}")
        return jsonify({"error": "user_not_linked", "message": "Aucun compte actif lié à cet utilisateur"}), 404
    
    Logger.info(f"API: get_user_email - Email récupéré pour discord_id={discord_id}")
    return jsonify({"email": result[0]}), 200

@app.route('/api/get_all_linked_users')
def get_all_linked_users():
    """
    Endpoint pour Review-Maker : récupère tous les utilisateurs avec comptes liés.
    Retourne une liste de {discord_id, email, user_name, linked_at}
    
    ⚠️ SÉCURISÉ : Requiert une clé API dans les headers
    """
    # Vérification de la clé API
    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {FLASK_SECRET_KEY}"
    
    if not auth_header or auth_header != expected_header:
        Logger.warning("API: get_all_linked_users - Accès non autorisé (clé API invalide)")
        return jsonify({"error": "Unauthorized", "message": "Clé API manquante ou invalide"}), 401
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT discord_id, user_email, user_name, linked_at 
            FROM user_links 
            WHERE active = 1 
            ORDER BY linked_at DESC
        """)
        results = cursor.fetchall()
    
    users = []
    for row in results:
        users.append({
            "discord_id": row[0],
            "email": row[1],
            "user_name": row[2],
            "linked_at": row[3]
        })
    
    Logger.info(f"API: get_all_linked_users - {len(users)} comptes actifs récupérés")
    return jsonify({"users": users, "count": len(users)}), 200

@app.route('/api/get_purchased_products/<discord_id>')
def get_purchased_products(discord_id):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        # Ne retourner que les comptes ACTIFS (verified n'est plus utilisé)
        cursor.execute("SELECT user_email FROM user_links WHERE discord_id = ? AND active = 1", (discord_id,))
        result = cursor.fetchone()

    if not result:
        return jsonify({"error": "user_not_linked"}), 404

    user_email = result[0]
    session = shopify.Session(SHOP_URL, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_ACCESS_TOKEN)
    shopify.ShopifyResource.activate_session(session)
    
    try:
        orders = shopify.Order.find(email=user_email, status='any', limit=250)
        
        # --- NOUVELLE LOGIQUE DE FILTRAGE ---
        purchased_products_dict = {}
        # Mots-clés à exclure (insensible à la casse)
        exclude_keywords = ["telegram", "instagram", "tiktok", "briquet", "feuille", "box"]

        for order in orders:
            order_date = datetime.fromisoformat(order.created_at).astimezone(paris_tz).strftime('%d/%m/%Y')
            for item in order.line_items:
                title_lower = (item.title or '').lower()
                # Exclure explicitement les titres de box et les entrées synthétiques de type '/s ...'
                if any(keyword in title_lower for keyword in exclude_keywords):
                    continue
                # Exclude synthetic box-content markers (legacy behavior that prefixed items with '/s ')
                if title_lower.startswith(('/s ', 's/')) or '/s ' in title_lower:
                    continue
                # Utiliser variant_id pour l'unicité, car c'est ce qui est dans le panier.
                # Si un produit est commandé plusieurs fois, on ne l'affiche qu'une fois.
                # Exclure les produits de la collection/accessoires par titre ou product_type
                if ('accessoire' in (item.title or '').lower()) or ('accessoire' in ((getattr(item, 'product_type', None) or '').lower())):
                    continue

                if item.variant_id not in purchased_products_dict:
                    # Utiliser directement le nom du produit tel qu'il apparaît dans Shopify
                    # Ne pas ajouter d'émojis artificiels
                    purchased_products_dict[item.variant_id] = {
                        "id": str(item.variant_id),
                        "name": item.title,
                        "title": item.title,
                        "date": order_date,
                        "purchase_date": order.created_at,
                        "emoji": ""  # Pas d'emoji, utiliser le nom exact de Shopify
                    }
        
        purchased_products = list(purchased_products_dict.values())
        purchase_count = len(orders)
        total_spent = sum(float(order.total_price) for order in orders)

    except Exception as e:
        Logger.error(f"Erreur API Shopify dans get_purchased_products: {e}")
        return jsonify({"error": "Erreur lors de la récupération des commandes."}), 500
    finally:
        shopify.ShopifyResource.clear_session()

    return jsonify({
        "products": purchased_products,
        "purchase_count": purchase_count,
        "total_spent": total_spent
    })

@app.route('/api/submit-rating', methods=['POST'])
def submit_rating():
    data = request.get_json(silent=True) or {}
    required_keys = ['user_id', 'user_name', 'product_name', 'scores']
    if not data or not all(key in data for key in required_keys):
        return jsonify({"error": "Données manquantes."}), 400

    # On récupère toutes les données du payload
    user_id = data['user_id']
    user_name = data['user_name']
    product_name = data['product_name']
    scores = data['scores']
    comment_text = data.get('comment')  # .get() pour gérer le cas où le commentaire est optionnel

    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("""
                INSERT OR REPLACE INTO ratings 
                (user_id, user_name, product_name, visual_score, smell_score, touch_score, taste_score, effects_score, rating_timestamp, comment) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                user_id, user_name, product_name, 
                scores.get('visual'), scores.get('smell'), scores.get('touch'), 
                scores.get('taste'), scores.get('effects'), 
                datetime.utcnow().isoformat(), comment_text
            ))
            conn.commit()
        print(f"INFO: Note enregistrée pour {user_name} sur le produit {product_name}")
        return jsonify({"success": True}), 200
    except Exception as e:
        print(f"Erreur SQL lors de l'enregistrement de la note : {e}")
        traceback.print_exc()
    return jsonify({"error": "Erreur lors de la sauvegarde de la note."}), 500

# --- AJOUTER CET ENDPOINT ÉGALEMENT ---
@app.route('/api/get_user_stats/<discord_id>')
def get_user_stats(discord_id):
    try:
        user_id_int = int(discord_id)
        with get_db_connection() as conn:
            conn.row_factory = sqlite3.Row
            c = conn.cursor()

            # Récupérer les notes de l'utilisateur
            c.execute("SELECT * FROM ratings WHERE user_id = ? ORDER BY rating_timestamp DESC", (user_id_int,))
            user_ratings = [dict(row) for row in c.fetchall()]

            # Calculer les statistiques
            c.execute("""
                WITH UserAverageNotes AS (
                    SELECT user_id, 
                           (COALESCE(visual_score, 0) + COALESCE(smell_score, 0) + COALESCE(touch_score, 0) + COALESCE(taste_score, 0) + COALESCE(effects_score, 0)) / 5.0 AS avg_note
                    FROM ratings
                ),
                AllRanks AS (
                    SELECT user_id, 
                           COUNT(user_id) as rating_count, 
                           AVG(avg_note) as global_avg, 
                           MIN(avg_note) as min_note, 
                           MAX(avg_note) as max_note,
                           RANK() OVER (ORDER BY COUNT(user_id) DESC, AVG(avg_note) DESC) as user_rank
                    FROM UserAverageNotes 
                    GROUP BY user_id
                )
                SELECT user_rank, rating_count, global_avg, min_note, max_note
                FROM AllRanks 
                WHERE user_id = ?
            """, (user_id_int,))
            stats_row = c.fetchone()
            
            user_stats = {'rank': 'N/C', 'count': 0, 'avg': 0, 'min_note': 0, 'max_note': 0}
            if stats_row:
                user_stats.update(dict(zip(stats_row.keys(), stats_row)))

            # Badge Top 3 du mois
            one_month_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()
            c.execute("SELECT user_id FROM ratings WHERE rating_timestamp >= ? GROUP BY user_id ORDER BY COUNT(id) DESC LIMIT 3", (one_month_ago,))
            top_3_monthly_ids = [row['user_id'] for row in c.fetchall()]
            user_stats['is_top_3_monthly'] = user_id_int in top_3_monthly_ids

        return jsonify({
            "user_stats": user_stats,
            "user_ratings": user_ratings
        })
    except Exception as e:
        print(f"Erreur lors de la récupération des stats pour {discord_id}: {e}")
        return jsonify({"error": "Erreur interne du serveur."}), 500

@app.route('/api/get_shop_ranking/<discord_id>')
def get_shop_ranking(discord_id):
    """Récupère le classement d'un utilisateur dans la boutique."""
    try:
        # Récupérer l'email de l'utilisateur (compte actif uniquement)
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT user_email FROM user_links WHERE discord_id = ? AND active = 1", (discord_id,))
            result = cursor.fetchone()
        
        if not result:
            return jsonify({"error": "user_not_linked", "shop_rank": 0, "total_shoppers": 0}), 404
        
        user_email = result[0]
        
        # Activer la session Shopify
        session = shopify.Session(SHOP_URL, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_ACCESS_TOKEN)
        shopify.ShopifyResource.activate_session(session)
        
        try:
            # Récupérer tous les utilisateurs ACTIFS
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT discord_id, user_email FROM user_links WHERE active = 1")
                all_users = cursor.fetchall()
            
            # Calculer le total dépensé pour chaque utilisateur
            user_spending = []
            for db_discord_id, db_email in all_users:
                try:
                    orders = shopify.Order.find(email=db_email, status='any', limit=250)
                    if orders:
                        total_spent = sum(float(order.total_price) for order in orders)
                        purchase_count = len(orders)
                        
                        if purchase_count > 0:  # N'inclure que les utilisateurs ayant fait des achats
                            user_spending.append({
                                'discord_id': db_discord_id,
                                'total_spent': total_spent,
                                'purchase_count': purchase_count
                            })
                except Exception as e:
                    Logger.debug(f"Error fetching orders for {db_email}: {e}")
                    continue
            
            # Trier par argent dépensé (décroissant)
            user_spending.sort(key=lambda x: x['total_spent'], reverse=True)
            
            # Trouver la position de l'utilisateur
            user_rank = 0
            for i, user in enumerate(user_spending, 1):
                if user['discord_id'] == discord_id:
                    user_rank = i
                    break
            
            total_shoppers = len(user_spending)
            
            return jsonify({
                "shop_rank": user_rank,
                "total_shoppers": total_shoppers
            }), 200
            
        except Exception as e:
            Logger.error(f"Erreur API Shopify dans get_shop_ranking: {e}")
            return jsonify({"error": "Erreur lors de la récupération du classement.", "shop_rank": 0, "total_shoppers": 0}), 500
        finally:
            shopify.ShopifyResource.clear_session()
            
    except Exception as e:
        Logger.error(f"Erreur lors de la récupération du classement pour {discord_id}: {e}")
        return jsonify({"error": "Erreur interne du serveur.", "shop_rank": 0, "total_shoppers": 0}), 500

@app.route('/api/get_shop_stats')
def get_shop_stats():
    # Sécurisation de l'endpoint
    auth_header = request.headers.get('Authorization')
    expected_header = f"Bearer {FLASK_SECRET_KEY}"
    if not auth_header or auth_header != expected_header:
        return jsonify({"error": "Accès non autorisé."}), 401

    session = shopify.Session(SHOP_URL, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_ACCESS_TOKEN)
    shopify.ShopifyResource.activate_session(session)
    
    try:
        now = datetime.utcnow()
        # Calculer la date d'il y a 7 jours
        seven_days_ago_iso = (datetime.utcnow() - timedelta(days=7)).isoformat()

        # Récupérer les commandes des 7 derniers jours
        orders = shopify.Order.find(created_at_min=seven_days_ago_iso, status='any', limit=250)
        
        weekly_revenue = sum(float(order.total_price) for order in orders)
        weekly_order_count = len(orders)

        first_day_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        first_day_of_month_iso = first_day_of_month.isoformat()
        
        # Récupérer les commandes depuis le début du mois
        monthly_orders = shopify.Order.find(created_at_min=first_day_of_month_iso, status='any', limit=250)
        
        monthly_revenue = sum(float(order.total_price) for order in monthly_orders)
        monthly_order_count = len(monthly_orders)

    except Exception as e:
        print(f"Erreur API Shopify dans get_shop_stats: {e}")
        return jsonify({"error": "Erreur lors de la récupération des statistiques de la boutique."}), 500
    finally:
        shopify.ShopifyResource.clear_session()

    return jsonify({
        "weekly_revenue": weekly_revenue,
        "weekly_order_count": weekly_order_count,
        "monthly_revenue": monthly_revenue,
        "monthly_order_count": monthly_order_count
    })
    
@app.route('/api/get_last_order/<discord_id>')
def get_last_order(discord_id):
    # 1. Récupérer l'email de l'utilisateur (compte actif uniquement)
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT user_email FROM user_links WHERE discord_id = ? AND active = 1", (discord_id,))
        result = cursor.fetchone()

    if not result:
        return jsonify({"error": "Votre compte Discord n'est pas lié. Utilisez d'abord `/lier_compte`."}), 404

    user_email = result[0]
    
    # 2. Interroger l'API Shopify
    session = shopify.Session(SHOP_URL, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_ACCESS_TOKEN)
    shopify.ShopifyResource.activate_session(session)
    
    try:
        # On récupère LA dernière commande
        orders = shopify.Order.find(email=user_email, status='any', limit=1, order='created_at DESC')
        
        if not orders:
            return jsonify({"error": "Aucune commande trouvée pour cet e-mail."}), 404
            
        last_order = orders[0]
        
        # 3. Traduire les statuts
        payment_status_map = {"paid": "✅ Payé", "pending": "⏳ En attente", "refunded": "remboursé"}
        fulfillment_status_map = {"fulfilled": "✅ Expédiée", "unfulfilled": "⏳ En préparation", "partial": "partiellement expédiée"}

        # 4. Formater la réponse pour le bot
        # Récupérer les infos de suivi si disponibles
        tracking_url = None
        tracking_number = None
        tracking_company = None
        if last_order.fulfillments and len(last_order.fulfillments) > 0:
            fulfillment = last_order.fulfillments[0]
            tracking_url = getattr(fulfillment, 'tracking_url', None)
            tracking_number = getattr(fulfillment, 'tracking_number', None)
            tracking_company = getattr(fulfillment, 'tracking_company', None) or getattr(fulfillment, 'tracking_company', None) or getattr(fulfillment, 'carrier', None)

        response_data = {
            "order": {
                "name": last_order.name, # Le numéro de commande comme #1001
                "date": datetime.fromisoformat(last_order.created_at).astimezone(paris_tz).strftime('%d/%m/%Y à %H:%M'),
                "total_price": last_order.total_price,
                "payment_status_fr": payment_status_map.get(last_order.financial_status, last_order.financial_status),
                "fulfillment_status_fr": fulfillment_status_map.get(last_order.fulfillment_status, last_order.fulfillment_status or "En préparation"),
                "tracking_url": tracking_url,
                "tracking_number": tracking_number,
                "tracking_company": tracking_company,
                "line_items": [{"title": item.title, "quantity": item.quantity} for item in last_order.line_items]
            }
        }
        
        return jsonify(response_data), 200

    except Exception as e:
        Logger.error(f"Erreur API Shopify dans get_last_order: {e}")
        return jsonify({"error": "Erreur lors de la récupération de la commande."}), 500
    finally:
        shopify.ShopifyResource.clear_session()

@app.route('/api/get_users_to_notify')
def get_users_to_notify():
    """
    Scanne tous les utilisateurs liés pour trouver ceux éligibles à un rappel de notation.
    Un utilisateur est éligible si sa dernière commande a été expédiée il y a entre 3 et 30 jours,
    et qu'il n'a ni noté les produits de cette commande, ni reçu de rappel pour celle-ci.
    """
    Logger.info("API: Recherche des utilisateurs à notifier pour un rappel de notation.")
    with get_db_connection() as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # Ne notifier que les utilisateurs ACTIFS
        cursor.execute("SELECT discord_id, user_email FROM user_links WHERE active = 1")
        linked_users = cursor.fetchall()

    session = shopify.Session(SHOP_URL, SHOPIFY_API_VERSION, SHOPIFY_ADMIN_ACCESS_TOKEN)
    shopify.ShopifyResource.activate_session(session)

    users_to_notify = []
    
    try:
        for user in linked_users:
            # 1. Trouver la dernière commande de l'utilisateur
            orders = shopify.Order.find(email=user['user_email'], status='any', limit=1, order='created_at DESC')
            if not orders:
                continue

            last_order = orders[0]
            
            # 2. Vérifier les conditions d'éligibilité
            # a) La commande doit être payée et expédiée
            if last_order.financial_status != 'paid' or last_order.fulfillment_status != 'fulfilled':
                continue

            # b) La commande doit avoir été passée il y a entre 3 et 30 jours
            three_days_ago = datetime.now(timezone.utc) - timedelta(days=3)
            thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
            order_date = datetime.fromisoformat(last_order.created_at)

            if not (thirty_days_ago < order_date < three_days_ago):
                continue
            
            # c) Vérifier si un rappel a déjà été envoyé pour cette commande
            cursor.execute("SELECT 1 FROM reminders WHERE discord_id = ? AND order_id = ?", (user['discord_id'], last_order.id))
            if cursor.fetchone():
                continue

            # d) Vérifier quels produits de cette commande n'ont pas encore été notés
            product_titles_in_order = {item.title for item in last_order.line_items}
            
            placeholders = ','.join('?' for _ in product_titles_in_order)
            with get_db_connection() as conn_inner:
                cursor_inner = conn_inner.cursor()
                cursor_inner.execute(f"""
                    SELECT product_name FROM ratings 
                    WHERE user_id = ? AND product_name IN ({placeholders})
                """, (user['discord_id'], *product_titles_in_order))
                
                rated_products = {row['product_name'] for row in cursor_inner.fetchall()}
            unrated_products = list(product_titles_in_order - rated_products)

            if unrated_products:
                users_to_notify.append({
                    "discord_id": user['discord_id'],
                    "order_id": last_order.id,
                    "unrated_products": unrated_products
                })
    except Exception as e:
        Logger.error(f"Erreur API Shopify dans get_users_to_notify: {e}")
        traceback.print_exc()
    finally:
        shopify.ShopifyResource.clear_session()

    Logger.success(f"API: Trouvé {len(users_to_notify)} utilisateur(s) à notifier.")
    return jsonify(users_to_notify)


@app.route('/api/mark_reminder_sent', methods=['POST'])
def mark_reminder_sent():
    """Marque dans la DB qu'un rappel a été envoyé pour une commande spécifique à un utilisateur."""
    data = request.get_json(silent=True) or {}
    discord_id = data.get('discord_id')
    order_id = data.get('order_id')

    if not discord_id or not order_id:
        return jsonify({"error": "Données manquantes."}), 400

    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("INSERT INTO reminders (discord_id, order_id, notified_at) VALUES (?, ?, ?)",
                           (discord_id, order_id, datetime.utcnow().isoformat()))
            conn.commit()
            Logger.info(f"API: Rappel marqué comme envoyé pour l'utilisateur {discord_id}, commande {order_id}.")
            return jsonify({"success": True}), 200
        except sqlite3.IntegrityError:
            # Le rappel existait déjà, ce qui est ok.
            return jsonify({"success": True, "message": "Rappel déjà existant."}), 200
        except Exception as e:
            Logger.error(f"Erreur DB dans mark_reminder_sent: {e}")
            return jsonify({"error": "Erreur interne du serveur."}), 500

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
            # Vérifier que le compte est ACTIF
            cursor.execute(
                "SELECT discord_id, user_email, user_name FROM user_links WHERE LOWER(user_email) = ? AND active = 1",
                (email,)
            )
            result = cursor.fetchone()
        
        if not result:
            Logger.info(f"Email {anonymize_email(email)} non trouvé ou compte inactif")
            return jsonify({
                "error": "not_found",
                "message": "Email non lié à un compte Discord actif"
            }), 404
        
        discord_id, user_email, user_name = result
        
        # Utiliser user_name si disponible, sinon fallback
        username = user_name if user_name else f"User#{discord_id[-4:]}"
        
        Logger.success(f"Email {anonymize_email(email)} trouvé pour Discord ID {discord_id}, username: {username}")
        
        return jsonify({
            "discordId": str(discord_id),
            "username": username,
            "user_name": user_name,  # Ajouter explicitement
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
    
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)