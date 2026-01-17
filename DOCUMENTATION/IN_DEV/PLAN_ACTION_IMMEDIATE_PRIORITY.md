# 🔥 PLAN ACTION IMMÉDIAT - MVP V1
**Date**: 17 janvier 2026  
**Urgence**: CRITIQUE  
**Timeline**: 48-72H pour Priority 1 + 2

---

## ⚡ QUICK WINS (2-4H)

### 1. Admin Panel - Appliquer Dark Theme
**Fichier**: `client/src/pages/admin/AdminPanel.css`

#### Changements Nécessaires
```css
/* ❌ Avant (blanc/gris) */
.admin-panel {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 2rem;
}

/* ✅ Après (dark, cohérent) */
.admin-panel {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    min-height: 100vh;
    padding: 2rem;
    color: #e0e0e0;
}

.stat-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    padding: 1.5rem;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.stat-card:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(52, 211, 153, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 12px 48px 0 rgba(52, 211, 153, 0.15);
}
```

#### Steps
1. Remplacer gradient principal (blanc → dark)
2. Appliquer glassmorphism aux cards
3. Mettre à jour text colors (#1a1a1a → #e0e0e0)
4. Ajouter hover effects avec couleurs brand
5. Tester responsive

**Temps**: 2-3H  
**Impact**: Visual cohérence immédiate

---

### 2. AccountPage - Permission Checks Visibles
**Fichier**: `client/src/pages/account/AccountPage.jsx`

#### Ajouter au Return JSX
```jsx
{/* Afficher uniquement les sections payantes pour Producteur/Influenceur */}

{(accountType === 'Producteur' || accountType === 'Influenceur') && (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-8 border border-gray-700/50">
    <h2 className="text-xl md:text-2xl font-semibold mb-6 flex items-center gap-2">
      <Shield size={24} className="text-emerald-400" />
      {t('account.enterpriseData') || 'Données Entreprise'}
    </h2>
    
    {accountType === 'Producteur' && (
      <p className="text-gray-400 mb-4">Section Producteur visible</p>
    )}
    
    {accountType === 'Influenceur' && (
      <p className="text-gray-400 mb-4">Section Influenceur visible</p>
    )}
  </div>
)}

{/* Amateur reçoit info */}
{accountType === 'Amateur' && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 mb-8">
    <p className="text-amber-300">
      📦 Upgrade to Producteur to access enterprise features
    </p>
  </div>
)}
```

**Temps**: 1-2H  
**Impact**: Montre les manques, débloque psychologiquement l'utilisateur

---

## 📋 PRIORITY 1 - Page Profil Complète (24-48H)

### Phase 1.1: Refactorisation Architecture

**Créer structure modulaire**:
```
client/src/pages/account/
├── AccountPage.jsx          (orchestrateur)
├── sections/
│   ├── ProfileSection.jsx      (infos personnelles)
│   ├── BillingSection.jsx      (facturation)
│   ├── PreferencesSection.jsx  (paramètres)
│   ├── EnterpriseSection.jsx   (données entreprise)
│   └── IntegrationSection.jsx  (API, OAuth)
└── components/
    ├── AvatarUpload.jsx
    ├── OAuthButton.jsx
    ├── PaymentMethodCard.jsx
    └── SessionList.jsx
```

**Commandes Git**:
```bash
cd client/src/pages/account
mkdir sections components
touch sections/{ProfileSection,BillingSection,PreferencesSection,EnterpriseSection,IntegrationSection}.jsx
touch components/{AvatarUpload,OAuthButton,PaymentMethodCard,SessionList}.jsx
```

### Phase 1.2: ProfileSection (Infos Personnelles)

**Créer**: `client/src/pages/account/sections/ProfileSection.jsx`

```jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../../store'
import { User, Mail, Globe, Edit2, Save, X } from 'lucide-react'
import AvatarUpload from '../components/AvatarUpload'
import OAuthButton from '../components/OAuthButton'

export default function ProfileSection() {
  const { t } = useTranslation()
  const { user } = useStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    country: user?.country || '',
    bio: user?.bio || '',
    website: user?.website || '',
    publicProfile: user?.publicProfile || false,
    avatar: user?.avatar || null
  })

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (response.ok) {
        setIsEditing(false)
        // Update store
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <User size={24} className="text-blue-400" />
          {t('account.personalInfo') || 'Informations Personnelles'}
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-all"
        >
          {isEditing ? <X size={18} /> : <Edit2 size={18} />}
          {isEditing ? 'Annuler' : 'Éditer'}
        </button>
      </div>

      {/* Avatar Upload */}
      <div className="mb-6">
        <AvatarUpload 
          current={profile.avatar}
          onChange={(url) => setProfile({...profile, avatar: url})}
          disabled={!isEditing}
        />
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Username (Read-only) */}
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
          <label className="text-sm text-gray-400 mb-2 block">Username</label>
          <input
            type="text"
            value={profile.username}
            disabled
            className="w-full bg-gray-600/20 text-gray-400 px-3 py-2 rounded cursor-not-allowed"
          />
        </div>

        {/* Email (Read-only) */}
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
          <label className="text-sm text-gray-400 mb-2 block">{t('account.email')}</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full bg-gray-600/20 text-gray-400 px-3 py-2 rounded cursor-not-allowed"
          />
        </div>

        {/* First Name */}
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
          <label className="text-sm text-gray-400 mb-2 block">{t('account.firstName')}</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            disabled={!isEditing}
            className="w-full bg-gray-600/40 text-white px-3 py-2 rounded border border-gray-600/30 focus:border-blue-500/50 disabled:opacity-50"
          />
        </div>

        {/* Last Name */}
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
          <label className="text-sm text-gray-400 mb-2 block">{t('account.lastName')}</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            disabled={!isEditing}
            className="w-full bg-gray-600/40 text-white px-3 py-2 rounded border border-gray-600/30 focus:border-blue-500/50 disabled:opacity-50"
          />
        </div>

        {/* Country */}
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 md:col-span-2">
          <label className="text-sm text-gray-400 mb-2 block">{t('account.country')}</label>
          <select
            value={profile.country}
            onChange={(e) => setProfile({...profile, country: e.target.value})}
            disabled={!isEditing}
            className="w-full bg-gray-600/40 text-white px-3 py-2 rounded border border-gray-600/30 focus:border-blue-500/50 disabled:opacity-50"
          >
            <option value="">Sélectionner un pays</option>
            <option value="FR">France</option>
            <option value="BE">Belgique</option>
            <option value="CH">Suisse</option>
            {/* Ajouter tous les pays */}
          </select>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Bio (500 caractères max)</label>
        <textarea
          value={profile.bio}
          onChange={(e) => setProfile({...profile, bio: e.target.value.slice(0, 500)})}
          disabled={!isEditing}
          maxLength={500}
          className="w-full h-20 bg-gray-600/40 text-white px-3 py-2 rounded border border-gray-600/30 focus:border-blue-500/50 disabled:opacity-50 resize-none"
          placeholder="Décrivez-vous en 500 caractères..."
        />
        <p className="text-xs text-gray-400 mt-1">{profile.bio.length}/500</p>
      </div>

      {/* Website */}
      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 mb-6 flex items-center gap-2">
        <Globe size={18} className="text-emerald-400" />
        <input
          type="url"
          value={profile.website}
          onChange={(e) => setProfile({...profile, website: e.target.value})}
          disabled={!isEditing}
          placeholder="https://monsite.com"
          className="flex-1 bg-gray-600/40 text-white px-3 py-2 rounded border border-gray-600/30 focus:border-blue-500/50 disabled:opacity-50"
        />
      </div>

      {/* Public Profile Toggle */}
      <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30 mb-6 flex items-center justify-between">
        <span className="text-gray-300">{t('account.publicProfile')}</span>
        <input
          type="checkbox"
          checked={profile.publicProfile}
          onChange={(e) => setProfile({...profile, publicProfile: e.target.checked})}
          disabled={!isEditing}
          className="w-5 h-5 rounded cursor-pointer"
        />
      </div>

      {/* OAuth Links */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Comptes Liés</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <OAuthButton provider="google" linked={user?.oauth?.google} />
          <OAuthButton provider="discord" linked={user?.oauth?.discord} />
          <OAuthButton provider="facebook" linked={user?.oauth?.facebook} />
          <OAuthButton provider="apple" linked={user?.oauth?.apple} />
          <OAuthButton provider="amazon" linked={user?.oauth?.amazon} />
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-lg"
        >
          <Save size={20} />
          Sauvegarder les modifications
        </button>
      )}
    </div>
  )
}
```

**Temps**: 4-6H  
**Impact**: Section profil complète et fonctionnelle

---

### Phase 1.3: BillingSection (Facturation)

**Créer**: `client/src/pages/account/sections/BillingSection.jsx`

(Similaire structure à ProfileSection, ajouter):
- Abonnement actif (affichage)
- Dates renouvellement
- Historique factures (table)
- Méthodes paiement (liste)
- Boutons upgrade/downgrade/cancel

**Temps**: 6-8H  
**Impact**: Gestion complète des abonnements

---

### Phase 1.4: EnterpriseSection (Producteur/Influenceur)

**Créer**: `client/src/pages/account/sections/EnterpriseSection.jsx`

Afficher uniquement pour Producteur/Influenceur:
```jsx
const { accountType } = useStore()
if (accountType === 'Amateur') return null
```

Contenu:
- Infos entreprise (nom, type, SIRET/TVA)
- Adresse professionnelle
- KYC status & documents upload
- Historique vérification

**Temps**: 8-10H  
**Impact**: Conformité légale + tier gestion

---

### Phase 1.5: Intégration AccountPage

**Éditer**: `client/src/pages/account/AccountPage.jsx`

```jsx
import ProfileSection from './sections/ProfileSection'
import BillingSection from './sections/BillingSection'
import PreferencesSection from './sections/PreferencesSection'
import EnterpriseSection from './sections/EnterpriseSection'
import IntegrationSection from './sections/IntegrationSection'

export default function AccountPage() {
  const { accountType } = useStore()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      {/* Header */}
      <ProfileHeader />
      
      {/* Sections */}
      <ProfileSection />
      <PreferencesSection />
      {(accountType === 'Producteur' || accountType === 'Influenceur') && <EnterpriseSection />}
      <BillingSection />
      <IntegrationSection />
    </div>
  )
}
```

**Temps**: 2-3H  
**Impact**: Page complète et modulaire

---

## 🎨 PRIORITY 2 - Admin Panel Dark Theme (12-24H)

### Phase 2.1: CSS Update

**Fichier**: `client/src/pages/admin/AdminPanel.css`

Remplacer:
1. `.admin-panel` background
2. `.stat-card` styling (glassmorphism)
3. Text colors
4. Button styles
5. Hover effects
6. Shadow/depth

**Temps**: 3-4H  
**Impact**: Visuel cohérent immédiatement

### Phase 2.2: Component Integration

Utiliser `LiquidCard` et `LiquidButton`:

```jsx
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'

// Avant
<div className="stat-card">...</div>

// Après
<LiquidCard>...</LiquidCard>
```

**Temps**: 2-3H  
**Impact**: Cohérence design système

### Phase 2.3: Testing

- [ ] Responsive (mobile, tablet, desktop)
- [ ] Dark mode proper contrast
- [ ] Animations smooth
- [ ] Icons visible
- [ ] Forms inputs styled

**Temps**: 2-3H  
**Impact**: Production ready

---

## 🔒 PRIORITY 3 - Permission Checks (24-48H)

### Phase 3.1: Permission Matrix

**Créer**: `client/src/utils/permissions.js`

```javascript
export const PERMISSIONS = {
  'Amateur': {
    'create:flower': true,
    'create:flower:pipeline_culture': false,
    'create:flower:pipeline_curing': false,
    'create:flower:genealogy': false,
    'create:hash': true,
    'create:hash:pipeline': false,
    'create:concentrate': true,
    'create:concentrate:pipeline_extraction': false,
    'create:concentrate:pipeline_purification': false,
    'create:edible': true,
    'view:analytics_advanced': false,
    'export:svg': false,
    'export:csv': false,
    'export:json': false,
    'export:html': false,
    'template:custom': false,
    'access:phenohunt': false,
    'access:genetics_library': false,
  },
  'Producteur': {
    // Toutes les permissions = true
  },
  'Influenceur': {
    // Permissions mixtes (lecture pipeline, etc.)
  }
}

export function hasPermission(accountType, permission) {
  return PERMISSIONS[accountType]?.[permission] === true
}
```

**Temps**: 1-2H

### Phase 3.2: Permission Hook

**Créer**: `client/src/hooks/usePermissions.js`

```javascript
import { useStore } from '../store'
import { hasPermission } from '../utils/permissions'

export function usePermissions() {
  const { accountType } = useStore()
  
  return {
    can: (permission) => hasPermission(accountType, permission),
    canCreate: (type) => hasPermission(accountType, `create:${type}`),
    canExport: (format) => hasPermission(accountType, `export:${format}`),
    accountType
  }
}
```

**Temps**: 1H

### Phase 3.3: Route Protection

**Créer**: `client/src/components/PermissionGate.jsx`

```jsx
import { usePermissions } from '../hooks/usePermissions'
import { AlertCircle } from 'lucide-react'

export function PermissionGate({ permission, children, fallback }) {
  const { can } = usePermissions()
  
  if (!can(permission)) {
    return fallback || (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="text-amber-400" />
        <p className="text-amber-300">Feature non disponible pour votre compte</p>
      </div>
    )
  }
  
  return children
}
```

**Temps**: 2H

### Phase 3.4: Component Usage

```jsx
import { usePermissions } from '../hooks/usePermissions'
import { PermissionGate } from '../components/PermissionGate'

export function CreateReviewPage() {
  const { can } = usePermissions()
  
  return (
    <div>
      {/* Base sections - tous */}
      <InfoSection />
      
      {/* Pipeline avancé - producteur seulement */}
      <PermissionGate permission="create:flower:pipeline_culture">
        <PipelineSection />
      </PermissionGate>
      
      {/* Export avancé - payants seulement */}
      {can('export:csv') && <AdvancedExportOptions />}
    </div>
  )
}
```

**Temps**: 4-6H

---

## ✅ CHECKLIST PRIORITÉS

### Day 1 (Aujourd'hui)
- [ ] Admin Panel dark theme CSS (2-3H)
- [ ] AccountPage permission checks visibles (1-2H)
- [ ] Git commit + push
- [ ] Testing rapide

### Day 2-3 (Demain/Après-demain)
- [ ] ProfileSection complète (4-6H)
- [ ] BillingSection complète (6-8H)
- [ ] EnterpriseSection complète (8-10H)
- [ ] Intégration AccountPage (2-3H)
- [ ] Testing + fix bugs (3-4H)

### Day 3-4 (Cette semaine)
- [ ] Permission matrix + hooks (4-5H)
- [ ] PermissionGate component (2H)
- [ ] Component integration (4-6H)
- [ ] Route protection (2-3H)
- [ ] End-to-end testing (4-5H)

---

## 📝 GIT WORKFLOW

```bash
# Day 1
git checkout -b feat/admin-dark-theme
# ... changes ...
git add client/src/pages/admin/AdminPanel.css
git commit -m "feat: Apply dark theme to admin panel with glassmorphism"
git push origin feat/admin-dark-theme

# Open PR, merge after review

# Day 2
git checkout -b feat/account-page-refactor
# ... new sections ...
git add client/src/pages/account/sections/
git add client/src/pages/account/components/
git add client/src/pages/account/AccountPage.jsx
git commit -m "feat: Refactor AccountPage with modular sections (profile, billing, enterprise)"
git push origin feat/account-page-refactor

# Day 3
git checkout -b feat/permissions-system
# ... hooks, utils, components ...
git add client/src/utils/permissions.js
git add client/src/hooks/usePermissions.js
git add client/src/components/PermissionGate.jsx
git commit -m "feat: Implement centralized permission system with matrix and guards"
git push origin feat/permissions-system
```

---

## 🚀 APRÈS CES PRIORITÉS

1. Complétude Hash/Concentrés/Comestibles pipelines
2. Arbre généalogique (Fleurs)
3. KYC form + document upload
4. Tests e2e permissions
5. Load testing VPS

**Timeline Total**: ~1 semaine pour MVP vraiment complet

---

**Créé par**: Audit Copilot  
**Mise à jour**: 17 janvier 2026  
**Prochaine révision**: Après Priority 1
