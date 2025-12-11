# 🎨 Mise à Jour Système d'Export et i18n — Reviews-Maker
**Date**: 11 décembre 2025  
**Branche**: `feat/templates-backend`

---

## 📋 Résumé des Modifications

### 1. ✅ Correction du Système i18n

**Problème**: Le système de traduction était configuré mais non fonctionnel en production.

**Solution**:
- Ajout du wrapper `I18nextProvider` dans `App.jsx`
- Import direct de l'instance `i18n` au lieu du simple import de fichier
- Le système i18n est maintenant actif sur toute l'application

**Fichiers modifiés**:
- `client/src/App.jsx` : Ajout de `I18nextProvider` et wrapping de l'app

**Impact**: Les traductions FR/EN/DE/ES fonctionnent maintenant correctement.

---

### 2. 🎯 Système d'Export par Type de Compte

**Basé sur**: Cahier des charges `COMPTE_FONCTIONNALITES`

**Nouveaux fichiers**:
- `client/src/config/exportConfig.js` : Configuration centralisée des permissions par compte

**Permissions implémentées**:

| Type de Compte | Prix | Formats Export | Qualité Max | Templates Custom | Drag & Drop | Branding |
|---|---|---|---|---|---|---|
| **Consumer (Amateur)** | Gratuit | PNG, JPEG, PDF | 150 DPI | ❌ | ❌ | Obligatoire |
| **Influencer Basic** | 7.99€/mois | PNG, JPEG, PDF, SVG | 300 DPI | ✅ | ✅ | Optionnel |
| **Influencer Pro** | 15.99€/mois | PNG, JPEG, PDF, SVG | 300 DPI | ✅ | ✅ | Optionnel |
| **Producteur** | 29.99€/mois | Tous (+ CSV, JSON, HTML) | 300 DPI | ✅ | ✅ | Optionnel |

**Fonctionnalités**:
- ✅ Vérification des permissions en temps réel
- ✅ Blocage des options premium avec messages d'upgrade
- ✅ Limitation de qualité selon le compte (150 DPI vs 300 DPI)
- ✅ Branding obligatoire pour comptes gratuits

---

### 3. 🗄️ Extension du Schéma Base de Données

**Fichier**: `server-new/prisma/schema.prisma`

**Nouveaux champs `Template`**:
```prisma
isPremium           Boolean  // Template réservé premium
category            String   // "predefined", "custom", "shared"
templateType        String   // "compact", "detailed", "complete", "custom"
format              String   // "1:1", "16:9", "9:16", "A4"
maxPages            Int      // Pagination (1 à 9)
allowedAccountTypes String   // JSON des comptes autorisés
exportOptions       String   // JSON des options d'export
```

**Nouvelle table `TemplateShare`**:
- Gestion des codes de partage uniques
- Statistiques d'utilisation (compteur, limite)
- Date d'expiration optionnelle
- Activation/désactivation

**Migration SQL**: `server-new/db/migrations/2025-01-11_templates_permissions.sql`
- Ajout des colonnes sur `templates`
- Création de `template_shares`
- Insertion de 4 templates prédéfinis (Compact 1:1, Détaillé 16:9, Complet A4, Stories 9:16 Premium)

---

### 4. 🚀 Routes API Templates Étendues

**Fichier**: `server-new/routes/templates.js`

**Nouvelles fonctionnalités**:

#### Helpers de permissions:
```javascript
getUserAccountType(user)       // Détermine le type de compte
canAccessTemplate(tpl, type)   // Vérifie l'accès au template
getExportOptions(tpl, type)    // Obtient les options selon le compte
```

#### Route GET `/api/templates/:id`:
- Vérification des permissions par type de compte
- Ajout de `exportOptions` et `userAccountType` dans la réponse
- Message d'erreur explicite si template premium

#### Route POST `/api/templates/:id/share`:
- Création d'un code de partage unique (8 caractères)
- Gestion de `maxUses` et `expiresInDays`
- Retourne `shareCode` et `shareUrl`

#### Route GET `/api/templates/import/:code`:
- Import d'un template partagé
- Vérifications: validité, expiration, limite d'usage
- Création automatique d'une copie pour l'utilisateur
- Incrémentation du compteur d'utilisations

---

### 5. 🎨 Interface ExportModal Améliorée

**Fichier**: `client/src/components/orchard/ExportModal.jsx`

**Améliorations**:

#### Badge de type de compte:
- Affichage du type de compte actuel (Amateur, Influenceur, Producteur)

#### Formats avec indicateurs Premium:
- Badge "PRO" sur les formats réservés (SVG, CSV, JSON, HTML)
- Message d'upgrade pour comptes gratuits

#### Options de résolution intelligentes:
- Limitation dynamique selon `maxQuality` du compte
- Icône 🔒 sur les résolutions bloquées
- Tooltip explicatif pour upgrade

#### Branding obligatoire:
- Checkbox désactivée pour comptes gratuits
- Badge "Obligatoire"
- Message informatif sur l'upgrade nécessaire

---

## 📦 Structure des Fichiers Modifiés

```
client/
├── src/
│   ├── App.jsx                          ✏️ Ajout I18nextProvider
│   ├── config/
│   │   └── exportConfig.js              ✨ NOUVEAU
│   └── components/
│       └── orchard/
│           └── ExportModal.jsx          ✏️ Permissions par compte

server-new/
├── prisma/
│   └── schema.prisma                    ✏️ Template + TemplateShare
├── routes/
│   └── templates.js                     ✏️ Partage + permissions
└── db/
    └── migrations/
        └── 2025-01-11_templates_permissions.sql  ✨ NOUVEAU
```

---

## 🔄 Migration et Déploiement

### Étapes locales:

1. **Mettre à jour la DB Prisma**:
```powershell
cd server-new
npx prisma generate
npx prisma db push
```

2. **Appliquer la migration SQL**:
```powershell
sqlite3 db/reviews.sqlite < db/migrations/2025-01-11_templates_permissions.sql
```

3. **Tester localement**:
```powershell
# Backend
cd server-new
npm run dev

# Frontend
cd client
npm run dev
```

### Déploiement VPS:

```bash
# Connexion SSH
ssh vps-lafoncedalle

# Aller dans le dossier du projet
cd /var/www/reviews-maker

# Pull des modifications
git pull origin feat/templates-backend

# Migration DB
cd server-new
sqlite3 ../db/reviews.sqlite < db/migrations/2025-01-11_templates_permissions.sql

# Régénérer Prisma client
npx prisma generate

# Build frontend
cd ../client
npm run build

# Restart backend (adapter selon votre setup: PM2, systemd, etc.)
pm2 restart reviews-maker
# OU
sudo systemctl restart reviews-maker
```

---

## ✅ Tests à Effectuer

### Frontend:
- [ ] Traductions s'affichent correctement (FR/EN/DE/ES)
- [ ] ExportModal affiche le bon type de compte
- [ ] Formats premium sont bloqués pour comptes gratuits
- [ ] Résolution 3x est bloquée pour comptes < 300 DPI
- [ ] Branding non-désactivable pour comptes gratuits

### Backend:
- [ ] GET `/api/templates` filtre selon le type de compte
- [ ] GET `/api/templates/:id` retourne `exportOptions`
- [ ] POST `/api/templates/:id/share` crée un code unique
- [ ] GET `/api/templates/import/:code` importe correctement
- [ ] Templates prédéfinis présents en DB

### Base de données:
- [ ] Table `templates` contient les nouveaux champs
- [ ] Table `template_shares` existe
- [ ] 4 templates prédéfinis insérés
- [ ] Index créés correctement

---

## 🎯 Prochaines Étapes

1. **Système de Templates Custom** (Influenceurs):
   - Interface drag & drop pour créer templates
   - Éditeur visuel de zones
   - Sauvegarde dans bibliothèque personnelle

2. **Export Multi-Pages**:
   - Pagination pour formats 1:1 et 16:9 (max 9 pages)
   - Navigation entre pages dans l'aperçu
   - Export PDF multi-pages

3. **Formats Avancés** (Producteurs):
   - Export CSV avec toutes les données
   - Export JSON structuré (API-ready)
   - Export HTML autonome

4. **Watermark Personnalisé** (Influenceurs):
   - Upload de logo personnel
   - Positionnement du watermark
   - Transparence réglable

---

## 🐛 Bugs Connus / Limitations

- ⚠️ Migration SQL doit être appliquée manuellement (pas de système auto-migrate pour SQLite)
- ⚠️ Templates existants n'ont pas les nouveaux champs (defaults appliqués)
- ⚠️ Partage de templates nécessite authentification (pas de mode anonyme)

---

## 📚 Références

- Cahier des charges: `.docs/COMPTE_FONCTIONNALITES`
- Instructions Copilot: `.github/copilot-instructions.md`
- Schema Prisma: `server-new/prisma/schema.prisma`
- Config export: `client/src/config/exportConfig.js`

---

**Auteur**: GitHub Copilot (Claude Sonnet 4.5)  
**Review**: En attente  
**Status**: ✅ Prêt pour tests
