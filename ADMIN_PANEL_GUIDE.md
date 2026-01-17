# 🔐 Admin Panel - Instructions d'utilisation

## Accès au Panel Admin

### 1. **Activation Développeur (LOCAL TESTING)**

Pour tester le panel admin en développement, définissez la variable d'environnement:

```bash
# Dans terminal Windows (PowerShell)
$env:ADMIN_MODE="true"
npm run dev

# Ou dans .env du serveur
ADMIN_MODE=true
```

Puis accédez à: `http://localhost:5173/admin`

### 2. **Accès en Production (VPS)**

En production, seuls les utilisateurs avec le rôle `admin` dans leur tableau `roles` peuvent accéder.

Les endpoints admin vérifient:
1. Soit `ADMIN_MODE=true` (développement)
2. Soit `user.roles` contient `"admin"` (production)

## Fonctionnalités du Panel

### 📊 Dashboard Statistiques

Le panel affiche automatiquement:
- **Total Users**: Nombre d'utilisateurs enregistrés
- **Amateur**: Comptes de type consumer
- **Influencer**: Comptes de type influencer
- **Producer**: Comptes de type producer
- **Banned**: Utilisateurs bannis
- **Reviews**: Nombre total de reviews créées

### 👥 Gestion des Utilisateurs

#### 1. **Recherche et Filtrage**

```
[Champ de recherche] → Cherche par username ou email
[Filtres]
- All (tous les utilisateurs)
- Consumer
- Influencer
- Producer
```

#### 2. **Changement de Type de Compte (ACTION PRINCIPAL)**

**C'est LA fonctionnalité clé pour tester les permissions V1 MVP**

```
Dans la colonne "Account Type":
Hover sur le type de compte → Apparaît 3 boutons rapides:
[C] = Consumer
[I] = Influencer  
[P] = Producer

Click sur un bouton = Changement INSTANTANÉ du type de compte
```

**Exemple de test V1 MVP**:

1. Select utilisateur test (e.g., "testuser")
2. Click [C] → Change to Consumer
3. Refresh page → Verify Genetics section HIDDEN
4. Click [I] → Change to Influencer
5. Refresh page → Verify Genetics VISIBLE
6. Click [P] → Change to Producer
7. Refresh page → Verify ALL features VISIBLE

#### 3. **Gestion des Subscriptions**

```
Dropdown "Subscription" per utilisateur:
- Inactive (défaut)
- Active
- Cancelled
- Expired

Change immédiat, affecte les permissions
```

#### 4. **Ban/Unban Utilisateurs**

```
Bouton "🔒" ou "🔓" en dernière colonne:
🔒 = Unban (utilisateur est actuellement banni)
🔓 = Ban (utilisateur est actif)

Click pour bannir/débannir
Popup: Entrez raison de ban si applicable
```

## API Endpoints Utilisés

Le panel utilise les endpoints suivants:

```javascript
// Vérifier accès admin
GET /api/admin/check-auth
Response: { isAdmin: boolean, authenticated: boolean, roles?: string[] }

// Récupérer tous les utilisateurs
GET /api/admin/users
Response: { users: User[] }

// Récupérer statistiques
GET /api/admin/stats
Response: { totalUsers, amateurs, influencers, producers, bannedUsers, totalReviews }

// CHANGER TYPE DE COMPTE (🎯 PRINCIPAL)
PATCH /api/admin/users/:id/account-type
Body: { accountType: "consumer" | "influencer" | "producer" }
Response: Updated user

// Changer status subscription
PATCH /api/admin/users/:id/subscription
Body: { subscriptionStatus: "active" | "inactive" | "cancelled" | "expired" }
Response: Updated user

// Ban/Unban
PATCH /api/admin/users/:id/ban
Body: { banned: boolean, reason?: string }
Response: Updated user
```

## Scénarios de Test V1 MVP

### Test 1: Permissions par Type de Compte (Flowers)

```
1. Login en tant qu'admin
2. Accéder à /admin
3. Chercher utilisateur test
4. Click [C] (Consumer)
5. Logout admin, login utilisateur test
6. Aller à /create/flower
7. VÉRIFIER: Genetics section NOT VISIBLE (consumer)
8. Return to admin
9. Click [I] (Influencer)
10. Refresh utilisateur test page
11. VÉRIFIER: Genetics section VISIBLE
12. Click [P] (Producer)
13. Refresh utilisateur test page
14. VÉRIFIER: Genetics section VISIBLE avec PhenoHunt
```

### Test 2: Permissions Hash/Concentrés

```
1. Change account type à Producer
2. Aller à /create/hash
3. VÉRIFIER: Section "Pipeline Separation" visible
4. VÉRIFIER: Section "Pipeline Purification" visible
5. Change account type à Consumer
6. VÉRIFIER: Ces sections NOT visible
```

### Test 3: Permissions Edibles

```
1. Change account type à Consumer
2. Aller à /create/edible
3. VÉRIFIER: Basic sections visible
4. Change account type à Producer
5. VÉRIFIER: Plus de sections détaillées visible
```

## Dépannage

### "❌ Access Denied"

- L'utilisateur connecté n'est pas admin
- Vérifiez que ADMIN_MODE=true (dev) OU utilisateur a rôle admin (prod)

### Stats ne changent pas après modifications

- Rafraîchissez la page (F5)
- Les stats se rechargent au chargement du panel

### Changement de compte type ne prend effet

- L'utilisateur doit se reconnecter
- OU rafraîchir le page (F5) pour recharger les permissions

### Boutons rapides de type de compte ne s'affichent pas

- Hover sur la cellule "Account Type"
- Les boutons s'affichent au survol

## Environnement Requis

### Développement

```
.env (server-new):
ADMIN_MODE=true
```

### Production (VPS)

```
Pas besoin de définir ADMIN_MODE
L'utilisateur doit avoir "admin" dans son tableau roles
```

## Sécurité

⚠️ **IMPORTANT**:
- Ne jamais committer ADMIN_MODE=true en production
- En production, utiliser uniquement le contrôle basé rôles (admin in roles array)
- Les modifications d'admin ne produisent PAS d'audit log actuellement (TODO)

## Prochaines Étapes (TODOs)

- [ ] Ajouter audit logging pour toutes les modifications admin
- [ ] Ajouter pagination pour les listes d'utilisateurs
- [ ] Ajouter possibilité de modifier email/username
- [ ] Ajouter dashboard pour graphiques statistiques
- [ ] Ajouter modération des reviews (flag, suppress)
- [ ] Ajouter export des logs d'activité

---

**Version**: 1.0  
**Date**: 2025-01-17  
**Statut**: ✅ ACTIVE
