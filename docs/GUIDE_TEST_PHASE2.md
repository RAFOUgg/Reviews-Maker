# 🧪 Guide de Test Utilisateur - Phase 2

**Date** : 7 décembre 2025  
**Version** : Phase 2 OAuth & Account System  
**Testeur** : Manuel

---

## 🚀 Préparation

### 1. Démarrer le Serveur Backend

Ouvrez PowerShell et exécutez :

```powershell
cd c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\server-new
node server.js
```

**Résultat attendu** :
```
[passport] Discord ClientId set: YES
[passport] Discord CallbackURL: http://51.75.22.192/api/auth/discord/callback
[passport] Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)

🚀 Server running on http://0.0.0.0:3000
📊 Environment: production
🎯 Frontend URL: http://51.75.22.192

✅ Ready to accept requests!
```

⚠️ **Note** : Le warning Google OAuth est normal - les credentials ne sont pas configurés mais la route est prête.

### 2. Ouvrir la Page de Test

Dans votre navigateur (Edge recommandé), ouvrez :
```
c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\test-phase2.html
```

Ou via URL :
```
file:///c:/Users/Rafi/Documents/.0AMes-Logiciel/Reviews-Maker/test-phase2.html
```

---

## 📋 Plan de Test - Séquence Recommandée

### 🟢 Test 1 : Vérification État Système (2 min)

**Objectif** : Confirmer que le serveur et les routes sont opérationnels.

**Procédure** :
1. La page de test s'ouvre avec un dashboard violet
2. Vérifier les badges d'état en haut :
   - **Serveur** : Doit afficher "✅ En ligne" (vert)
   - **Discord OAuth** : "✅ Configuré" (vert)
   - **Google OAuth** : "⚠️ Non configuré" (jaune - normal)
   - **Routes Account** : "✅ Opérationnelles" (vert)

**Résultat attendu** :
- ✅ Tous les indicateurs verts sauf Google OAuth (jaune attendu)
- Si "Serveur : ❌ Hors ligne" → Vérifier que `node server.js` tourne bien

---

### 🟢 Test 2 : Liste des Types de Compte (3 min)

**Objectif** : Tester la route publique qui retourne les types de comptes disponibles.

**Procédure** :
1. Trouver la carte **"📋 Liste des Types de Compte"** (badge bleu "Public")
2. Cliquer sur le bouton **"GET /api/account/types"**
3. Une zone grise apparaît en dessous avec du JSON

**Résultat attendu** :
```json
✅ Status 200

[
  {
    "type": "consumer",
    "name": "Consommateur",
    "description": "Accès gratuit...",
    "price": 0,
    "features": ["Lecture reviews", "Créer avis personnels", ...],
    "requirements": []
  },
  {
    "type": "influencer_basic",
    "name": "Influenceur Basic",
    "description": "Mode Orchard basique...",
    "price": 7.99,
    "currency": "EUR",
    "features": [...],
    "requirements": ["Abonnement Stripe requis"]
  },
  // ... 2 autres types
]
```

**Validation** :
- ✅ 4 types retournés (consumer, influencer_basic, influencer_pro, producer)
- ✅ Consumer a price: 0
- ✅ Influencer_basic a price: 7.99
- ✅ Tous les types ont features array et requirements array

**❌ Si échec** : Status 500 ou erreur CORS
- Vérifier que le serveur tourne
- Vérifier la console du navigateur (F12) pour erreurs CORS

---

### 🟡 Test 3 : Informations du Compte (Non connecté) (2 min)

**Objectif** : Tester que la route protégée refuse l'accès sans authentification.

**Procédure** :
1. Trouver la carte **"👤 Informations du Compte"** (badge jaune "Auth Required")
2. Cliquer sur **"GET /api/account/info"**

**Résultat attendu** :
```json
❌ Status 401

{
  "error": "Not authenticated"
}
```

**Validation** :
- ✅ Status 401 Unauthorized
- ✅ Message d'erreur clair

**Note** : C'est le comportement correct - sans session, l'accès est refusé.

---

### 🟢 Test 4 : Connexion Discord OAuth (5 min)

**Objectif** : Lancer le flux d'authentification Discord et créer une session.

**Procédure** :
1. Trouver la carte **"🎮 Connexion Discord"** (badge vert "OAuth")
2. Cliquer sur **"Se connecter avec Discord"**
3. Vous êtes redirigé vers Discord
4. Si pas connecté à Discord : Entrer vos identifiants
5. Cliquer **"Autoriser"** pour l'application Reviews-Maker
6. Vous êtes redirigé vers `http://51.75.22.192/auth/callback`

**Résultat attendu** :
- Redirection Discord fonctionne
- Page de callback s'affiche (peut afficher erreur si frontend React pas lancé - c'est OK)
- Session créée dans la base de données

**Validation backend** :
Dans le terminal PowerShell où tourne `node server.js`, vous devriez voir :
```
[AUTH-DBG] Start discord route - method: GET originalUrl: /api/auth/discord
[AUTH-DBG] Discord callback received - method: GET
[AUTH-DBG] User authenticated successfully: { discordId: '...', username: '...' }
[AUTH-DBG] Redirecting to frontend: https://reviews-maker.fr/auth/callback
```

**❌ Si échec** :
- **Erreur Discord "Invalid OAuth2 redirect_uri"** → Vérifier DISCORD_CALLBACK_URL dans `.env`
- **403 Forbidden** → Vérifier que l'app Discord a l'URL de callback autorisée
- **Session non créée** → Vérifier les logs backend

**⚠️ Important** : Après ce test, vous êtes maintenant **authentifié** (session active dans cookies).

---

### 🟢 Test 5 : Utilisateur Actuel (Connecté) (2 min)

**Objectif** : Vérifier que la session est active et récupère les infos utilisateur.

**Procédure** :
1. Trouver la carte **"🔐 Utilisateur Actuel"** (badge jaune "Auth Required")
2. Cliquer sur **"GET /api/auth/me"**

**Résultat attendu** :
```json
✅ Status 200

{
  "id": 123,
  "discordId": "your_discord_id",
  "username": "YourUsername",
  "email": "your@email.com",
  "avatarUrl": "https://cdn.discordapp.com/avatars/...",
  "roles": "[]",
  "legalAge": false,
  "consentRDR": false,
  "consentDate": null,
  "country": null,
  "createdAt": "2025-12-07T...",
  "updatedAt": "2025-12-07T..."
}
```

**Validation** :
- ✅ Status 200 OK
- ✅ Vos infos Discord affichées
- ✅ `legalAge: false` et `consentRDR: false` (nouvel utilisateur)
- ✅ `roles: "[]"` (account type = consumer par défaut)

---

### 🟢 Test 6 : Informations du Compte (Connecté) (3 min)

**Objectif** : Récupérer les infos complètes du compte utilisateur.

**Procédure** :
1. Retourner à la carte **"👤 Informations du Compte"**
2. Cliquer à nouveau sur **"GET /api/account/info"**

**Résultat attendu** :
```json
✅ Status 200

{
  "accountType": "consumer",
  "user": {
    "id": 123,
    "username": "YourUsername",
    "email": "your@email.com",
    "avatarUrl": "...",
    "roles": "[]",
    "legalAge": false,
    "consentRDR": false,
    "country": null
  },
  "subscription": null,
  "producerProfile": null,
  "influencerProfile": null
}
```

**Validation** :
- ✅ Status 200 OK (plus 401 comme avant - session active !)
- ✅ `accountType: "consumer"` (type par défaut)
- ✅ `subscription: null` (pas d'abonnement Stripe)
- ✅ Profils null (consumer n'a pas de profils spéciaux)

---

### 🟡 Test 7 : Changement Type de Compte (Bloqué par Validation) (3 min)

**Objectif** : Tenter de changer le type de compte et voir la validation légale se déclencher.

**Procédure** :
1. Trouver la carte **"🔄 Changer Type de Compte"** (badge jaune "Auth Required")
2. Cliquer sur **"POST /api/account/change-type"** (→ Influencer Basic)

**Résultat attendu** :
```json
❌ Status 403

{
  "error": "legal_verification_required",
  "message": "Vous devez d'abord compléter la vérification d'âge et le consentement RDR"
}
```

**Validation** :
- ✅ Status 403 Forbidden (pas 200 !)
- ✅ Erreur `legal_verification_required`
- ✅ Message explicite demandant de compléter la vérification légale

**Explication** : Le backend refuse le changement de type car `legalAge` et `consentRDR` sont à `false`. C'est le comportement attendu - la validation fonctionne ! ✅

---

### 🟢 Test 8 : Statut Légal (2 min)

**Objectif** : Vérifier l'état de la conformité légale utilisateur.

**Procédure** :
1. Trouver la carte **"⚖️ Statut Légal"** (badge jaune "Auth Required")
2. Cliquer sur **"GET /api/legal/status"**

**Résultat attendu** :
```json
✅ Status 200

{
  "legalAge": false,
  "consentRDR": false,
  "consentDate": null,
  "country": null,
  "ipAddress": "127.0.0.1"
}
```

**Validation** :
- ✅ Status 200 OK
- ✅ `legalAge: false` (pas encore vérifié)
- ✅ `consentRDR: false` (pas encore accepté)
- ✅ `ipAddress` correspond à votre IP locale

---

### 🟢 Test 9 : Déconnexion (1 min)

**Objectif** : Détruire la session et vérifier que l'accès est révoqué.

**Procédure** :
1. Dans la carte **"🔐 Utilisateur Actuel"**
2. Cliquer sur le bouton gris **"Déconnexion"**

**Résultat attendu** :
```json
✅ Déconnecté

{
  "message": "Logged out successfully"
}
```

**Validation** :
- ✅ Message de confirmation
- ✅ Session détruite

**Vérification** :
- Cliquer à nouveau sur **"GET /api/auth/me"**
- Résultat attendu : `❌ Status 401 - Not authenticated`

---

## 📊 Résultats Attendus - Checklist

Cochez au fur et à mesure :

- [ ] **Test 1** : Dashboard affiche tous les statuts (serveur ✅, routes ✅)
- [ ] **Test 2** : GET /api/account/types → 200 OK, 4 types retournés
- [ ] **Test 3** : GET /api/account/info (non connecté) → 401 Unauthorized
- [ ] **Test 4** : Connexion Discord → Redirection OK, session créée
- [ ] **Test 5** : GET /api/auth/me → 200 OK, infos utilisateur affichées
- [ ] **Test 6** : GET /api/account/info (connecté) → 200 OK, accountType: consumer
- [ ] **Test 7** : POST /api/account/change-type → 403 Forbidden (validation légale)
- [ ] **Test 8** : GET /api/legal/status → 200 OK, legalAge: false
- [ ] **Test 9** : Déconnexion → 200 OK, puis /api/auth/me → 401

**Score de réussite** : __/9 tests

---

## 🐛 Dépannage

### Serveur ne démarre pas
```powershell
# Tuer les processus Node existants
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Redémarrer
cd c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\server-new
node server.js
```

### Erreur CORS dans la console navigateur
Vérifier que `server.js` contient :
```javascript
origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    if (process.env.NODE_ENV !== 'production') return callback(null, true)
    if (origin === 'null') return callback(null, true) // ← Cette ligne
    // ...
}
```

### Page test-phase2.html ne charge pas
Ouvrir directement dans le navigateur :
```
file:///c:/Users/Rafi/Documents/.0AMes-Logiciel/Reviews-Maker/test-phase2.html
```

### Discord OAuth erreur "Invalid redirect_uri"
Vérifier dans `.env` :
```env
DISCORD_CALLBACK_URL=http://51.75.22.192/api/auth/discord/callback
```

Et que cette URL est ajoutée dans Discord Developer Portal → OAuth2 → Redirects.

---

## 📝 Notes pour Phase 3

### Fonctionnalités testées aujourd'hui
- ✅ OAuth Discord fonctionnel
- ✅ Système de comptes (5 types disponibles)
- ✅ Validation légale (bloque changement type si non vérifié)
- ✅ Session management (cookies, auth/déconnexion)
- ✅ Routes API protégées (401 sans session)

### À implémenter Phase 3
- ⏳ Stripe Integration (abonnements influencer/producer)
- ⏳ Producer Verification Workflow (upload documents)
- ⏳ Frontend React complet (AgeVerification, ConsentModal, AccountTypeSelector modales)
- ⏳ Settings Page (gestion compte complète)
- ⏳ Google OAuth credentials (route prête, credentials manquants)

---

## 🎉 Conclusion

Si tous les tests passent, **la Phase 2 est validée** ! 🎊

Le système d'authentification OAuth et de gestion des comptes fonctionne correctement :
- Discord OAuth ✅
- Account types backend ✅
- Validation légale ✅
- Session management ✅

**Prochaine étape** : Phase 3 - Intégration Stripe + Frontend React complet

---

**Bon test !** 🚀
