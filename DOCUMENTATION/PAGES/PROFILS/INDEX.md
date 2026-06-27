# Profils / Compte — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit. La version précédente décrivait des modèles `UserProfile`/`KYCDocument` séparés et un vrai système de facturation (cartes, factures PDF, API keys, webhooks) — **rien de tout cela n'existe** dans le code réel actuel. Le profil est porté directement par le modèle `User`, et le paiement est entièrement mocké.

## Page

`client/src/pages/account/AccountPage.jsx`, onglets : Profile, Subscription, Preferences, Security.

## Tier de compte — champ réel et valeurs

Le tier est déterminé par `User.roles` (string JSON, ex. `{"roles":["consumer"]}`), avec un champ `accountType` legacy en parallèle (string simple, `consumer`/`influencer`/`producer`) maintenu en rétrocompatibilité. Fonction `getUserAccountType()` (`server-new/services/account.js:71-98`) lit `roles` en priorité, ordre : `admin` > `producer` > `influencer` > `consumer`.

**Valeurs réelles possibles** : `consumer` (gratuit), `influencer` (15,99 €/mois visé), `producer` (29,99 €/mois visé), `admin`, `beta_tester`, `merchant`. Ce ne sont pas "Amateur/Producteur/Influenceur" comme l'ancienne doc le disait — les libellés FR existent seulement côté UI, pas en DB.

⚠️ Le tier peut être changé **directement via le panneau admin ou en base de données, sans aucun paiement réel** — voir [PERMISSIONS.md](../PERMISSIONS.md) section paiement.

## KYC — réellement implémenté, mais vérification manuelle

`server-new/routes/kyc.js` (359 lignes) :
- Upload réel de documents (carte ID, passeport, permis, licence pro), max 10 Mo, JPEG/PNG/PDF
- Stockage disque dans `/db/kyc_documents/{userId}/` + métadonnées DB
- Champs `User.kycStatus` (`none`/`pending`/`verified`/`rejected`), `User.kycDocuments` (JSON array)
- Réservé aux comptes Producer/Influencer
- **Pas de vérification automatique** — un admin doit valider manuellement, pas d'API de vérification tierce (pas d'Onfido/Stripe Identity etc.)

## OAuth — providers réellement configurés

Endpoint `GET /api/auth/providers` détecte dynamiquement les providers utilisables (rejette les valeurs vides/placeholder dans les env vars) :
- **Discord** ✅ configuré (credentials présents)
- **Google** ✅ configuré
- **Apple, Amazon, Facebook** ❌ non configurés (variables d'environnement vides ou placeholder) — le code de vérification existe pour les 5, mais seuls Discord/Google ont de vraies credentials actuellement

Email/mot de passe fonctionnel (`POST /api/auth/email/signup`, `/login`, hash bcrypt).

## 2FA — infrastructure présente, branchement incomplet

Champs `User.totpSecret`/`totpEnabled` existent, service `server-new/services/totp.js` existe, UI affichée dans `SecurityTab.jsx` — mais la logique de vérification au login n'a pas été confirmée comme pleinement branchée. À vérifier avant de communiquer "2FA disponible" comme une garantie produit.

## Paiement / Abonnement — 🔴 mocké, pas fonctionnel

`server-new/routes/payment.js` : aucune intégration Stripe réelle. Le code Stripe est commenté (`// TODO`), et l'endpoint de checkout retourne une session **mock** :
```js
res.json({ sessionId: 'mock_session_' + Date.now(), url: `${clientUrl}/payment?...&mock_payment=success`, message: 'MOCK: Paiement simulé (Stripe non configuré)' })
```
Le webhook Stripe est également mocké. Le modèle `Subscription` (schema.prisma:378-406) existe avec des champs `stripeCustomerId`/`stripeSubscriptionId` vides en pratique. **Aucun paiement réel ne transite actuellement par l'application.**

## Mode développement — bypass d'authentification

`server-new/middleware/auth.js` injecte automatiquement un faux utilisateur (`id: 'dev-test-user-id'`, tier `PRODUCTEUR`) sur toute route protégée quand `NODE_ENV === 'development'`. Une route `POST /api/auth/dev/quick-login` existe pour déclencher ce mode côté frontend (bouton visible uniquement en dev sur `LoginPage.jsx`). Implication pratique : certaines routes qui vont chercher cet ID factice en DB (ex. `/api/account/info`) renvoient quand même 401 si l'utilisateur réel n'existe pas — il faut créer/seed un utilisateur réel pour tester complètement en local (voir `server-new/seed-test-user.js`).

## Fichiers référence

- Frontend : `client/src/pages/account/AccountPage.jsx` + `tabs/*.jsx`
- Backend : `server-new/routes/auth.js`, `server-new/routes/kyc.js`, `server-new/routes/payment.js`, `server-new/services/account.js`
- Middleware : `server-new/middleware/auth.js`, `server-new/middleware/permissions.js`
- Schéma : `server-new/prisma/schema.prisma` (modèle `User`, l.14-116 ; `Subscription`, l.378-406)
