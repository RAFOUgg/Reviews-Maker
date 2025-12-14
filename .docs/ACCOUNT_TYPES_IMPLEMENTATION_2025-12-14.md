# Implémentation Système de Types de Comptes - 14 décembre 2025

## ✅ Fonctionnalité ajoutée

Système de sélection du type de compte à l'inscription conforme au cahier des charges [REAL_VISION_CDC_DEV.md](./REAL_VISION_CDC_DEV.md).

## 🎯 Types de comptes disponibles

### 1. Amateur (Gratuit)
- Accès aux sections : Infos générales, Visuel & Technique, PipeLine Curing, Odeurs, Goûts, Effets
- Templates prédéfinis : Compact, Détaillé, Complète
- Export PNG/JPEG/PDF moyenne qualité
- Personnalisation limitée (thèmes, couleurs, images, typo)

### 2. Influenceur (15.99€/mois)
- Tous les avantages Amateur +
- Accès aux aperçus détaillés et complets
- Système drag & drop pour composition
- Configuration avancée des rendus
- Export haute qualité : PNG/JPEG/SVG/PDF 300dpi
- ⚠️ Vérification KYC requise

### 3. Producteur (29.99€/mois)
- Tous les avantages Influenceur +
- Accès à TOUS les templates (y compris Personnalisé)
- Mode contenus personnalisable avec drag & drop
- Export très haute qualité : PNG/JPEG/PDF 300dpi, SVG, CSV, JSON, HTML
- Personnalisation avancée complète (polices, filigrane, agencement)
- PipeLine configurable pour exports détaillés
- Bibliothèque génétique avec arbres généalogiques
- ⚠️ Vérification KYC requise

## 📁 Fichiers créés

### Frontend
- **`client/src/components/auth/AccountTypeSelector.jsx`** (122 lignes)
  - Composant de sélection de type de compte
  - Design Apple-like avec cards interactives
  - Animation Framer Motion
  - Liste détaillée des fonctionnalités par type
  - Indication des prix et obligations légales (KYC)

### Backend
- **Modifications dans `server-new/prisma/schema.prisma`**
  - Ajout du champ `accountType String @default("consumer")`
  - Valeurs possibles : `consumer | influencer | producer`

## 🔧 Modifications apportées

### 1. LoginPage.jsx
```jsx
// Import du composant
import AccountTypeSelector from '../components/auth/AccountTypeSelector'

// Ajout du sélecteur en mode signup
{mode === 'signup' && (
    <div className="mb-6">
        <AccountTypeSelector
            selected={selectedType}
            onChange={setSelectedType}
        />
    </div>
)}
```

### 2. Schéma Prisma
```prisma
model User {
  // ... autres champs
  
  // Type de compte (Amateur, Influenceur, Producteur)
  accountType   String   @default("consumer") // consumer | influencer | producer
}
```

### 3. Signup avec accountType
Le champ `accountType` est maintenant envoyé lors de l'inscription :
```javascript
payload.accountType = selectedType || 'consumer'
```

## 📦 Déploiement

```bash
# 1. Build local
cd client && npm run build

# 2. Commit
git commit -m "feat: ajouter AccountTypeSelector et champ accountType en DB"

# 3. Déploiement VPS
ssh vps-lafoncedalle "cd /home/ubuntu/Reviews-Maker && \\
  git pull && \\
  cd server-new && npx prisma db push && npx prisma generate && \\
  cd ../client && npm run build && \\
  npx pm2 restart reviews-maker"

# ✅ PM2 restart #45 - Status: online
```

## 🧪 Tests

1. ✅ Ouvrir https://www.terpologie.eu/login
2. ✅ Cliquer sur "Créer un compte"
3. ✅ Vérifier l'affichage du sélecteur AccountTypeSelector
4. ✅ Sélectionner chaque type (Amateur/Influenceur/Producteur)
5. ✅ Vérifier l'animation et le badge "✓" sur sélection
6. ✅ Créer un compte et vérifier que `accountType` est bien sauvegardé en DB

## 🔜 Prochaines étapes

### 1. Middleware de restrictions (TODO #4)
Créer `server-new/middleware/accountFeatures.js` :
```javascript
const featureRestrictions = {
  consumer: {
    templates: ['compact', 'detailed', 'complete'],
    exportFormats: ['png', 'jpeg', 'pdf-low'],
    maxExportQuality: 150, // dpi
    pipelineAccess: false,
    customTemplates: false
  },
  influencer: {
    templates: ['compact', 'detailed', 'complete'],
    exportFormats: ['png', 'jpeg', 'svg', 'pdf-high'],
    maxExportQuality: 300,
    pipelineAccess: false,
    customTemplates: false,
    dragDropComposition: true
  },
  producer: {
    templates: ['compact', 'detailed', 'complete', 'custom'],
    exportFormats: ['png', 'jpeg', 'svg', 'pdf-high', 'csv', 'json', 'html'],
    maxExportQuality: 300,
    pipelineAccess: true,
    customTemplates: true,
    dragDropComposition: true,
    genealogySystem: true
  }
}
```

### 2. Frontend restrictions (TODO #5)
- Implémenter `useAccountFeatures()` hook
- Masquer/désactiver les fonctionnalités selon `accountType`
- Afficher messages d'upgrade pour comptes gratuits
- Bloquer exports haute qualité pour Amateurs

### 3. Système de paiement
- Intégration Stripe pour abonnements Influenceur/Producteur
- Gestion des upgrades/downgrades
- Webhook Stripe pour sync statut abonnement

### 4. KYC pour comptes payants
- Upload documents d'identité sécurisé
- Vérification manuelle ou via service eKYC
- Statut : pending / verified / rejected

## 📊 État actuel

| Fonctionnalité | État | Notes |
|----------------|------|-------|
| Sélecteur type compte | ✅ Fonctionnel | Design Apple-like |
| Champ DB accountType | ✅ Ajouté | Migration appliquée |
| Sauvegarde à l'inscription | ✅ OK | Testé |
| Middleware restrictions | ⏳ À faire | TODO #4 |
| Frontend restrictions | ⏳ À faire | TODO #5 |
| Système paiement | ❌ Pas commencé | Stripe requis |
| KYC documents | ❌ Pas commencé | Routes à créer |

## 🎯 Commits

- **Hash**: 32dcb66
- **Branche**: feat/templates-backend
- **Message**: feat: ajouter AccountTypeSelector et champ accountType en DB (consumer/influencer/producer)
- **Fichiers modifiés**:
  - `client/src/components/auth/AccountTypeSelector.jsx` (nouveau)
  - `client/src/pages/LoginPage.jsx` (import + intégration)
  - `server-new/prisma/schema.prisma` (ajout accountType)
  - `client/dist/*` (rebuild)

---

**Date**: 14 décembre 2025, 17:40 UTC+1
**VPS**: terpologie.eu (51.75.22.192)
**PM2 Restart**: #45
**Build Size**: 2009.23kb (547.91kb gzipped)
