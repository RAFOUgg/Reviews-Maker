# 🔗 API Review-Maker - Documentation des Endpoints

## 📋 Endpoints disponibles

### 1️⃣ **GET /api/get_user_email/<discord_id>**

Récupère l'email d'un utilisateur spécifique à partir de son Discord ID.

**URL** : `http://lafoncedalleapi:5000/api/get_user_email/<discord_id>`

**Méthode** : `GET`

**Authentification** : Aucune (endpoint public)

**Paramètres** :
- `discord_id` (path) : L'ID Discord de l'utilisateur

**Réponse succès (200)** :
```json
{
  "email": "user@example.com"
}
```

**Réponse erreur (404)** :
```json
{
  "error": "user_not_linked",
  "message": "Aucun compte actif lié à cet utilisateur"
}
```

**Exemple d'utilisation** :
```javascript
// JavaScript (Review-Maker)
const discordId = "458674191911092226";
const response = await fetch(`http://lafoncedalleapi:5000/api/get_user_email/${discordId}`);
const data = await response.json();

if (response.ok) {
  console.log("Email:", data.email);
} else {
  console.error("Compte non lié");
}
```

```python
# Python
import requests

discord_id = "458674191911092226"
response = requests.get(f"http://lafoncedalleapi:5000/api/get_user_email/{discord_id}")

if response.status_code == 200:
    email = response.json()["email"]
    print(f"Email: {email}")
else:
    print("Compte non lié")
```

---

### 2️⃣ **GET /api/get_all_linked_users**

Récupère la liste complète de tous les utilisateurs avec comptes liés actifs.

**URL** : `http://lafoncedalleapi:5000/api/get_all_linked_users`

**Méthode** : `GET`

**Authentification** : **REQUISE** (clé API dans le header)

**Headers requis** :
```
Authorization: Bearer <FLASK_SECRET_KEY>
```

**Réponse succès (200)** :
```json
{
  "users": [
    {
      "discord_id": "458674191911092226",
      "email": "user1@example.com",
      "user_name": "Username#1234",
      "linked_at": "2025-10-11 11:50:19"
    },
    {
      "discord_id": "123456789012345678",
      "email": "user2@example.com",
      "user_name": "AnotherUser#5678",
      "linked_at": "2025-10-10 14:30:00"
    }
  ],
  "count": 2
}
```

**Réponse erreur (401)** :
```json
{
  "error": "Unauthorized",
  "message": "Clé API manquante ou invalide"
}
```

**Exemple d'utilisation** :
```javascript
// JavaScript (Review-Maker)
const FLASK_SECRET_KEY = process.env.FLASK_SECRET_KEY; // Clé depuis .env

const response = await fetch('http://lafoncedalleapi:5000/api/get_all_linked_users', {
  headers: {
    'Authorization': `Bearer ${FLASK_SECRET_KEY}`
  }
});

const data = await response.json();

if (response.ok) {
  console.log(`${data.count} utilisateurs trouvés`);
  data.users.forEach(user => {
    console.log(`Discord ID: ${user.discord_id}, Email: ${user.email}`);
  });
} else {
  console.error("Accès refusé");
}
```

```python
# Python
import requests
import os

FLASK_SECRET_KEY = os.getenv("FLASK_SECRET_KEY")

response = requests.get(
    "http://lafoncedalleapi:5000/api/get_all_linked_users",
    headers={"Authorization": f"Bearer {FLASK_SECRET_KEY}"}
)

if response.status_code == 200:
    data = response.json()
    print(f"{data['count']} utilisateurs trouvés")
    for user in data['users']:
        print(f"Discord ID: {user['discord_id']}, Email: {user['email']}")
else:
    print("Accès refusé")
```

---

## 🔐 Configuration de la clé API

La clé API `FLASK_SECRET_KEY` est stockée dans le fichier `.env` :

```env
FLASK_SECRET_KEY="votre_cle_secrete_ici"
```

**Important** : Cette clé doit être la même dans :
1. Le projet `LaFoncedalleBot` (API Flask)
2. Le projet `Review-Maker` (pour l'authentification)

---

## 📊 Cas d'usage pour Review-Maker

### Scénario 1 : Connexion utilisateur via Discord ID
```javascript
// L'utilisateur se connecte avec Discord OAuth
const discordId = session.discordId;

// Récupérer son email depuis LaFoncedalleBot
const response = await fetch(`http://lafoncedalleapi:5000/api/get_user_email/${discordId}`);

if (response.ok) {
  const { email } = await response.json();
  
  // Utiliser cet email pour l'identifier dans Review-Maker
  const userSession = createUserSession(discordId, email);
} else {
  // Compte non lié - afficher un message
  showError("Vous devez lier votre compte sur Discord avec /lier_compte");
}
```

### Scénario 2 : Synchronisation complète des utilisateurs
```javascript
// Synchroniser tous les utilisateurs de LaFoncedalle vers Review-Maker
async function syncUsers() {
  const response = await fetch('http://lafoncedalleapi:5000/api/get_all_linked_users', {
    headers: { 'Authorization': `Bearer ${FLASK_SECRET_KEY}` }
  });
  
  const { users } = await response.json();
  
  // Mettre à jour la base Review-Maker
  for (const user of users) {
    await upsertUser({
      discordId: user.discord_id,
      email: user.email,
      username: user.user_name,
      linkedAt: user.linked_at
    });
  }
}
```

---

## 🚀 Déploiement

### En local (développement)
```bash
# LaFoncedalleBot API
python web_api/app.py
# URL: http://localhost:5000
```

### En production (Docker)
```bash
# LaFoncedalleBot déployé avec Docker Compose
# URL: http://lafoncedalleapi:5000 (dans le réseau Docker)
# OU
# URL: http://votre-domaine.com:5000 (depuis l'extérieur)
```

---

## ✅ Checklist d'intégration

- [ ] Ajouter `FLASK_SECRET_KEY` dans le `.env` de Review-Maker
- [ ] Tester `/api/get_user_email/<discord_id>` avec un ID de test
- [ ] Tester `/api/get_all_linked_users` avec authentification
- [ ] Implémenter la logique de connexion dans Review-Maker
- [ ] Gérer les cas d'erreur (compte non lié, API indisponible)
- [ ] Ajouter un cache côté Review-Maker pour éviter trop d'appels API

---

## 📝 Notes importantes

1. **Seuls les comptes ACTIFS sont retournés** (`active=1` dans `user_links`)
2. **La colonne `verified` n'est plus utilisée** - tous les comptes liés sont valides
3. **Les emails sont retournés en clair** (non anonymisés) pour Review-Maker
4. **Pas de rate limiting** pour l'instant - à implémenter si nécessaire
5. **CORS** : Si Review-Maker est une application web, il faudra configurer CORS dans Flask

---

## 🔧 Dépannage

### Erreur 404 "user_not_linked"
- L'utilisateur n'a jamais utilisé `/lier_compte`
- Le compte a été délié avec `/delier_compte` (active=0)

### Erreur 401 "Unauthorized"
- La clé API `FLASK_SECRET_KEY` est incorrecte
- Le header `Authorization` est mal formaté

### Timeout / Connexion refusée
- L'API Flask n'est pas démarrée
- URL incorrecte (vérifier localhost vs lafoncedalleapi)
- Problème de réseau Docker

---

## 📞 Support

En cas de problème, vérifier :
1. Les logs de l'API : `docker-compose logs lafoncedalleapi`
2. La base de données : `SELECT * FROM user_links WHERE active=1;`
3. Les variables d'environnement : `echo $FLASK_SECRET_KEY`
