# 🔥 PLAN REFONTE - AccountPage MVP V1
**Date**: 17 janvier 2026  
**Status**: ⚠️ **URGENT - Page incohérente avec la DA**  
**Timeline**: 3-5 jours (2H/jour)

---

## 📊 DIAGNOSTIC CRITIQUE

### ❌ État Actuel (CE QUI NE VA PAS)
La page Account affichée contient:
```
❌ Tab "Profil" - Affiche infos PARTIELLES (avatar, username, email)
❌ Tab "Préférences" - Affiche 6 toggles GÉNÉRIQUES
❌ Tab "Données sauvegardées" - Affiche données MOCKÉES
❌ Tab "Templates" - Affiche template FACTICE
❌ Tab "Filigranes" - Interface VIDE
❌ Tab "Export" - Config ÉLÉMENTAIRE

MANQUENT COMPLÈTEMENT:
- ❌ Section Infos Personnelles COMPLÈTES (firstName, lastName, pays, bio, website)
- ❌ Section Données Entreprise (pour Producteur/Influenceur)
- ❌ Section KYC & Vérification
- ❌ Section Facturation & Abonnement
- ❌ Section Intégrations OAuth complètes
- ❌ Section Sécurité Compte (2FA, Sessions)
- ❌ Section RGPD (export data, delete account)
```

### ✅ Ce Qui Est Bon
```
✅ Architecture Tab-based (bonne fondation)
✅ Code français accessible (Complétez votre profil)
✅ Responsive mobile/desktop
✅ Framer Motion transitions
✅ UsageQuotas affichées
```

---

## 🎯 OBJECTIF FINAL

Transformer AccountPage en **vrai centre de gestion de compte** avec **5 sections architecturales**:

```
AccountPage
├─ Infos Personnelles (nom, email, avatar, bio, oauth)
├─ Données Entreprise (visible si Producteur/Influenceur)
├─ Préférences & Paramètres (6-8 catégories)
├─ Facturation & Abonnement (visible si payant)
└─ Sécurité & Intégrations (2FA, sessions, API keys)
```

---

## 📋 STRUCTURE MODULAIRE À CRÉER

### Dossier Structure
```
client/src/pages/account/
├── AccountPage.jsx                 (orchestrateur principal)
├── hooks/
│   ├── useProfileData.js
│   ├── useEnterpriseData.js
│   ├── usePreferences.js
│   ├── useBillingData.js
│   └── useSecurityData.js
├── sections/
│   ├── ProfileSection.jsx          (Infos personnelles)
│   ├── EnterpriseSection.jsx       (Données entreprise)
│   ├── PreferencesSection.jsx      (Paramètres)
│   ├── BillingSection.jsx          (Facturation)
│   └── SecuritySection.jsx         (Sécurité & 2FA)
├── components/
│   ├── AvatarUpload.jsx
│   ├── OAuthButton.jsx
│   ├── PaymentMethodCard.jsx
│   ├── SessionList.jsx
│   ├── KYCUploadPanel.jsx
│   ├── TwoFactorSetup.jsx
│   └── ApiKeyManager.jsx
└── styles/
    └── account.module.css
```

---

## 🔥 PRIORITÉS DE REFONTE

### PHASE 1: Architecture & ProfileSection (2H)
**Fichiers à créer/modifier**:
1. `AccountPage.jsx` - Refactoriser orchestrateur
2. `hooks/useProfileData.js` - Hook récupération profil
3. `sections/ProfileSection.jsx` - Section infos personnelles
4. `components/AvatarUpload.jsx` - Upload avatar
5. `components/OAuthButton.jsx` - Boutons OAuth

**Contenu ProfileSection**:
```jsx
// Afficher:
├─ Avatar + Upload
├─ Username (read-only)
├─ Email (read-only mais avec update password)
├─ FirstName / LastName (éditable)
├─ Country (select list)
├─ Bio (textarea 500 char)
├─ Website URL (optionnel)
├─ Public Profile Toggle
├─ Linked OAuth Accounts (Discord, Google, etc.)
├─ List Sessions Actives (app, browser, location)
└─ Connected Devices
```

**Status**: 🔴 BLOQUANT - Dépend de rien
**Temps**: 2H
**Priorité**: P0

---

### PHASE 2: EnterpriseSection (2-3H)
**Conditions**: Visible si `accountType === 'Producteur' || 'Influenceur'`

**Contenu**:
```jsx
├─ Infos Entreprise
│  ├─ Nom Entreprise
│  ├─ Type Entreprise (select)
│  ├─ SIRET/TVA (optionnel)
│  ├─ Adresse Pro
│  └─ Téléphone Pro
├─ KYC Status & Upload Panel
│  ├─ Current Status (Pending/Verified/Rejected)
│  ├─ Upload Pièce d'Identité
│  ├─ Upload Justificatif d'Adresse
│  ├─ Upload Doc Professionnel
│  └─ Historique Vérification
└─ Données Optionnelles
   ├─ Logo Entreprise
   ├─ Description Business
   ├─ Website Entreprise
   └─ Instagram Pro
```

**Components à créer**:
- `KYCUploadPanel.jsx` - Upload documents KYC
- `EnterpriseForm.jsx` - Édition infos pro

**Status**: 🟡 Attendu après Phase 1
**Temps**: 2-3H
**Priorité**: P1

---

### PHASE 3: PreferencesSection - Réimplémenter (1-2H)
**Modifications sur existant**:

```jsx
// Remplacer les 6 toggles par structure catégorisée:

Interface Preferences
├─ Thème (select: Light/Dark/Auto)
├─ Langue (select: FR/EN/ES)
├─ Format Date (select: JJ/MM/YYYY, etc.)
└─ Unités (select: Métrique/Impérial)

Notifications Email
├─ Review Likes
├─ Review Comments
├─ New Features
├─ Newsletter
└─ Important Updates (obligatoire)

Export Preferences
├─ Format par défaut (select)
├─ Qualité par défaut (select)
├─ Template par défaut (select)
└─ Watermark par défaut (select)

Privacy & Data
├─ Profil public
├─ Reviews publiques
├─ Voir statistiques
├─ Analytics tracking
└─ [Buttons] Télécharger données | Supprimer compte
```

**Status**: 🟡 Attendu après Phase 1
**Temps**: 1-2H
**Priorité**: P1

---

### PHASE 4: BillingSection (2-3H)
**Conditions**: Visible si `accountType === 'Producteur' || 'Influenceur'` ET payant

**Contenu**:
```jsx
Abonnement Actif
├─ Type (Producteur 29.99€ / Influenceur 15.99€)
├─ Date début cycle
├─ Prochain renouvellement
└─ Statut (Actif/En attente/Expiré)

Méthodes de Paiement
├─ List Cartes Crédit
│  ├─ Ajouter nouvelle
│  ├─ Supprimer
│  └─ Marquer principale
└─ PayPal Lié

Historique Factures
├─ List Factures
├─ Télécharger PDF
└─ Resend Email

Actions
├─ [Button] Upgrade/Downgrade
├─ [Button] Pause Abonnement
└─ [Button] Annuler Abonnement
```

**Components à créer**:
- `BillingCard.jsx` - Affichage abonnement
- `PaymentMethodManager.jsx` - Gestion cartes

**Status**: 🟡 Attendu après Phase 2
**Temps**: 2-3H
**Priorité**: P2

---

### PHASE 5: SecuritySection (2-3H)
**Contenu**:
```jsx
Sécurité Compte
├─ Changer Mot de Passe
│  ├─ Current Password
│  ├─ New Password
│  └─ Confirm Password
├─ Two-Factor Authentication
│  ├─ Status Toggle
│  ├─ TOTP Setup (QR Code)
│  └─ SMS Backup Option
└─ Session Management
   ├─ List Sessions Actives
   └─ Déconnecter à distance

API & Intégrations
├─ API Keys Management
│  ├─ Générer nouvelle clé
│  ├─ List clés existantes (masked)
│  └─ Révoquer clé
└─ OAuth Integrations (Discord, Google, etc.)
```

**Components à créer**:
- `TwoFactorSetup.jsx` - Setup 2FA avec TOTP
- `ApiKeyManager.jsx` - Gestion API keys
- `SessionManager.jsx` - Gestion sessions

**Status**: 🟡 Attendu après Phase 3
**Temps**: 2-3H
**Priorité**: P2

---

## 🛠️ IMPLÉMENTATION DÉTAILLÉE

### PHASE 1: ProfileSection - CODE COMPLET

**Fichier 1: `hooks/useProfileData.js`**
```javascript
import { useState, useEffect } from 'react'

export const useProfileData = (user) => {
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    country: user?.country || '',
    bio: user?.bio || '',
    website: user?.website || '',
    publicProfile: user?.publicProfile ?? true,
    oauthAccounts: user?.oauthAccounts || {},
    activeSessions: []
  })

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Récupérer sessions actives
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/account/sessions')
        if (res.ok) {
          const sessions = await res.json()
          setProfileData(prev => ({ ...prev, activeSessions: sessions }))
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      }
    }
    fetchSessions()
  }, [])

  const updateProfile = async (updatedData) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      })
      
      if (res.ok) {
        setProfileData(prev => ({ ...prev, ...updatedData }))
        setSaveMessage('✅ Profil mis à jour')
        setTimeout(() => setSaveMessage(''), 2000)
        setIsEditing(false)
      } else {
        setSaveMessage('❌ Erreur lors de la sauvegarde')
      }
    } catch (error) {
      setSaveMessage('❌ ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const disconnectOAuth = async (provider) => {
    try {
      await fetch(`/api/account/oauth/${provider}`, { method: 'DELETE' })
      setProfileData(prev => ({
        ...prev,
        oauthAccounts: {
          ...prev.oauthAccounts,
          [provider]: false
        }
      }))
    } catch (error) {
      console.error('Failed to disconnect OAuth:', error)
    }
  }

  const revokeSession = async (sessionId) => {
    try {
      await fetch(`/api/account/sessions/${sessionId}`, { method: 'DELETE' })
      setProfileData(prev => ({
        ...prev,
        activeSessions: prev.activeSessions.filter(s => s.id !== sessionId)
      }))
    } catch (error) {
      console.error('Failed to revoke session:', error)
    }
  }

  return {
    profileData,
    isEditing,
    setIsEditing,
    isSaving,
    saveMessage,
    updateProfile,
    disconnectOAuth,
    revokeSession
  }
}
```

**Fichier 2: `sections/ProfileSection.jsx`** (voir suite...)

---

## 📅 TIMELINE PROPOSÉE

```
JOUR 1 (2H):
├─ PHASE 1: ProfileSection architecture
├─ Créer hooks/useProfileData.js
├─ Créer sections/ProfileSection.jsx
└─ Créer components/AvatarUpload.jsx

JOUR 2 (2H):
├─ PHASE 2: EnterpriseSection
├─ Créer sections/EnterpriseSection.jsx
└─ Créer components/KYCUploadPanel.jsx

JOUR 3 (2H):
├─ PHASE 3: PreferencesSection refactor
├─ Restructurer sections/PreferencesSection.jsx
└─ Tester et déboguer

JOUR 4 (2-3H):
├─ PHASE 4: BillingSection
├─ Créer sections/BillingSection.jsx
└─ Intégrer API facturation

JOUR 5 (2-3H):
├─ PHASE 5: SecuritySection
├─ Créer sections/SecuritySection.jsx
├─ Implémenter 2FA
└─ Testing complet
```

---

## ✅ CHECKLIST DE VALIDATION

- [ ] ProfileSection affiche tous les champs
- [ ] EnterpriseSection visible si Producteur/Influenceur
- [ ] KYC upload fonctionne
- [ ] OAuth connect/disconnect OK
- [ ] PreferencesSection catégorisée
- [ ] BillingSection affiche abonnement actif
- [ ] 2FA setup fonctionnel
- [ ] Sessions management OK
- [ ] API keys manager OK
- [ ] Responsive mobile/desktop
- [ ] Traductions i18n complètes
- [ ] Tests E2E pass
- [ ] Documentation mise à jour

---

## 🚀 NEXT STEP IMMÉDIAT

**COMMANDES GIT + STRUCTURE**:
```bash
# 1. Créer branche de développement
git checkout -b feat/account-page-mvp-v1

# 2. Créer structure de dossiers
mkdir -p client/src/pages/account/{hooks,sections,components,styles}

# 3. Créer fichiers skeleton
touch client/src/pages/account/hooks/{useProfileData,useEnterpriseData,usePreferences,useBillingData,useSecurityData}.js
touch client/src/pages/account/sections/{ProfileSection,EnterpriseSection,PreferencesSection,BillingSection,SecuritySection}.jsx
touch client/src/pages/account/components/{AvatarUpload,OAuthButton,KYCUploadPanel,TwoFactorSetup,ApiKeyManager,SessionManager}.jsx

# 4. Commit skeleton
git add client/src/pages/account/
git commit -m "chore: Create AccountPage MVP V1 modular structure"
```

**T'es prêt à commencer?** 🚀

