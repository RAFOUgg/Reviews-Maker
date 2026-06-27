# Panneau Admin — État réel (vérifié 2026-06-19)

> Document réécrit à partir de la version précédente (rapport de complétion de session daté janvier 2026) pour servir de référence d'état actuel plutôt que d'annonce de livraison.

## Accès et sécurité

- **Frontend** : `client/src/pages/admin/AdminPanel.jsx`
- **Backend** : `server-new/routes/admin.js`
- **Protection** :
  - **Mode développement** : `ADMIN_MODE=true` dans `.env` → **bypass total de l'authentification**, accès libre à `/admin`. ⚠️ Ne jamais activer en production.
  - **Production** : nécessite `req.user.roles` contenant `"admin"` (`admin.js:31`)
  - Il n'existe **pas de champ `isAdmin` dédié** dans le modèle `User` — le statut admin est uniquement déterminé par le champ JSON `roles`. Pour promouvoir un utilisateur :
    ```sql
    UPDATE "User" SET roles = '["admin"]' WHERE id = 'USER_ID';
    ```

## Fonctionnalités réelles

| Endpoint | Méthode | Action |
|---|---|---|
| `/api/admin/check-auth` | GET | Vérifie l'accès admin |
| `/api/admin/users` | GET | Liste utilisateurs (max 100), champs : id/username/email/accountType/subscriptionStatus/isBanned/createdAt |
| `/api/admin/users/:id` | GET | Détails utilisateur |
| `/api/admin/users/:id/account-type` | PATCH | Change le tier (consumer/influencer/producer) — **sans vérification de paiement** |
| `/api/admin/users/:id/subscription` | PATCH | Change le statut d'abonnement (active/inactive/cancelled/expired) |
| `/api/admin/users/:id/ban` | PATCH | Ban/unban avec raison |
| `/api/admin/stats` | GET | Stats globales (nb utilisateurs, répartition par tier, bannis, total reviews) |

Frontend : recherche/filtrage utilisateurs, changement de tier via modal, ban/unban avec raison, dashboard de stats.

## Fichiers référence

- Frontend : `client/src/pages/admin/AdminPanel.jsx`, `client/src/pages/admin/AdminPanel.css`
- Backend : `server-new/routes/admin.js`
- Schéma : `server-new/prisma/schema.prisma` (modèle `User` — champs `accountType`, `subscriptionStatus`, `isBanned`, `roles`)
