# 🔧 PLAN REFONTE ACCOUNT PAGE - STRUCTURE COMPLÈTE PAR TYPE

**Date**: 22 janvier 2026  
**Scope**: Refonte complète de AccountPage selon type de compte (Amateur/Producteur/Influenceur)  
**Priority**: P0 - Bloquant pour Phase 1 Fleur

---

## 📋 ONGLETS PAR TYPE DE COMPTE

### **STRUCTURE COMMUNE (Tous les types)**
- ✅ Profil
- ✅ Abonnement
- ✅ Préférences
- ✅ Sécurité
- ✅ Données sauvegardées (LITE)

---

### **AMATEUR** (5 tabs)
```
1️⃣ PROFIL
   ├─ Avatar upload
   ├─ Nom + Prénom
   ├─ Email (changeable)
   ├─ Date de naissance
   ├─ Pays
   ├─ Bio (opt)
   └─ Lien website (opt)

2️⃣ ABONNEMENT
   ├─ Badge "Amateur" (gratuit)
   ├─ Fonctionnalités incluses
   ├─ Bouton "Upgrade to Producteur"
   ├─ Bouton "Upgrade to Influenceur"
   └─ FAQ "Pourquoi upgrade?"

3️⃣ PRÉFÉRENCES
   ├─ Langue (FR/EN/ES)
   ├─ Thème (Light/Dark)
   ├─ Notifications email
   ├─ Visibilité profil (private/friends/public)
   ├─ Auto-save drafts
   └─ Partage réseaux sociaux

4️⃣ SÉCURITÉ
   ├─ Mot de passe
   ├─ 2FA setup
   ├─ Historique de connexion
   └─ Sessions actives

5️⃣ DONNÉES SAUVEGARDÉES
   └─ Auto-complete data (cultivars, substrats, engrais)

❌ HIDDEN: Templates, Filigranes, Company, Paiements
```

---

### **PRODUCTEUR** (9 tabs)
```
1️⃣ PROFIL
   ├─ Avatar upload
   ├─ Nom + Prénom
   ├─ Email (changeable)
   ├─ Date de naissance
   ├─ Pays
   ├─ Bio / About
   ├─ Lien website
   └─ Numéro téléphone

2️⃣ ABONNEMENT
   ├─ Badge "Producteur" (29.99€/mois)
   ├─ Fonctionnalités incluses
   ├─ Date de renouvellement
   ├─ Historique facturation
   ├─ Bouton "Gérer mon abonnement"
   └─ Option "Downgrade to Amateur"

3️⃣ PAIEMENTS (NEW)
   ├─ Méthodes de paiement
   │   ├─ Ajouter carte de crédit
   │   ├─ Ajouter compte bancaire
   │   └─ Liste des méthodes
   ├─ Adresse de facturation
   ├─ Numéro TVA/SIRET
   └─ Historique des factures (avec DL)

4️⃣ ENTREPRISE / SOCIÉTÉS (NEW)
   ├─ Nom de l'entreprise
   ├─ Type légal (SARL/EIRL/Auto-entrepreneur/etc)
   ├─ Numéro SIRET/APE
   ├─ Adresse professionnelle
   ├─ Secteur d'activité
   ├─ Nombre d'employés
   ├─ Logo upload
   ├─ Site web
   ├─ Contacts réseaux sociaux
   └─ Contacts principaux

5️⃣ KYC / VÉRIFICATION (NEW)
   ├─ État de vérification
   ├─ Documents téléchargés
   │   ├─ Pièce d'identité
   │   ├─ Justificatif adresse
   │   ├─ Registre commerce (si SARL)
   │   └─ Selfie avec pièce d'identité
   ├─ Statut: En attente / Vérifié / Rejeté
   └─ Messages de rejet (if any)

6️⃣ FILIGRANES (NEW)
   ├─ Créer filigrane personnalisé
   │   ├─ Text filigrane
   │   ├─ Upload logo
   │   ├─ Position presets
   │   ├─ Opacité
   │   └─ Preview
   ├─ Bibliothèque filigranes
   └─ Définir comme défaut

7️⃣ TEMPLATES EXPORT (NEW)
   ├─ Templates prédéfinis (lecture seule)
   ├─ Mes templates personnalisés
   │   ├─ Éditeur canvas (drag-drop)
   │   ├─ Sélection couleurs
   │   ├─ Choix polices
   │   ├─ Configuration zones
   │   └─ Preview temps réel
   ├─ Gestion templates (DL / DUP / DEL)
   └─ Définir comme défaut

8️⃣ PRÉFÉRENCES
   ├─ Langue
   ├─ Thème
   ├─ Notifications
   ├─ Visibilité profil
   ├─ Auto-save
   └─ Partage réseaux

9️⃣ SÉCURITÉ
   ├─ Mot de passe
   ├─ 2FA
   ├─ Historique connexions
   └─ Sessions actives
```

**DONNÉES SAUVEGARDÉES** (Accessed via Library, not here):
- Cultivars + genealogy
- Substrats préférés
- Engrais préférés
- Équipement
- Fournisseurs/Contacts

---

### **INFLUENCEUR** (7 tabs)
```
1️⃣ PROFIL
   ├─ Avatar upload
   ├─ Nom + Prénom
   ├─ Email
   ├─ Date de naissance
   ├─ Pays
   ├─ Bio/Description
   ├─ Lien website
   ├─ Handles réseaux (Twitter, Instagram, TikTok)
   └─ Numéro téléphone

2️⃣ ABONNEMENT
   ├─ Badge "Influenceur" (15.99€/mois)
   ├─ Fonctionnalités incluses
   ├─ Date renouvellement
   ├─ Historique facturation
   ├─ Bouton "Gérer abonnement"
   └─ Option "Downgrade to Amateur"

3️⃣ PAIEMENTS
   ├─ Méthodes paiement
   ├─ Adresse facturation
   └─ Historique factures

4️⃣ KYC / VÉRIFICATION
   ├─ État vérification
   ├─ Documents
   └─ Statut badge

5️⃣ PRÉFÉRENCES
   ├─ Langue
   ├─ Thème
   ├─ Notifications
   ├─ Visibilité profil
   ├─ Auto-save
   └─ Partage réseaux

6️⃣ STATISTIQUES PUBLIQUES (NEW)
   ├─ Afficher stats sur profil? (toggle)
   ├─ Badges badges de vérification
   └─ Bio publique

7️⃣ SÉCURITÉ
   ├─ Mot de passe
   ├─ 2FA
   ├─ Historique
   └─ Sessions

❌ HIDDEN: Filigranes, Templates avancés (templates READ-ONLY), Entreprise
```

---

## 🏗️ COMPOSANTS À CRÉER/MODIFIER

### **Fichiers à créer**
```
client/src/pages/account/
├─ sections/ProfileSection.jsx ✅ (existe, adapter)
├─ sections/SubscriptionSection.jsx (NEW)
├─ sections/PaymentSection.jsx (NEW - Producteur only)
├─ sections/CompanySection.jsx (NEW - Producteur only)
├─ sections/KycSection.jsx (NEW - Producteur + Influenceur)
├─ sections/WatermarkSection.jsx (NEW - Producteur only)
├─ sections/TemplateSection.jsx (NEW - Producteur only)
├─ sections/StatisticsSection.jsx (NEW - Influenceur only)
├─ sections/PreferencesSection.jsx (adapter existing)
├─ sections/SecuritySection.jsx (NEW)
├─ sections/SavedDataSection.jsx (adapter existing - LITE pour amateur)
├─ AccountPage.jsx (refactoriser)
└─ AccountPageLayout.jsx (NEW - structure par type)

client/src/components/account/
├─ KycDocumentUpload.jsx (NEW)
├─ PaymentMethodManager.jsx (NEW)
├─ WatermarkEditor.jsx (NEW)
├─ TemplateCanvasEditor.jsx (NEW)
├─ SubscriptionComparison.jsx (adapter existing UpgradeModal)
└─ CompanyForm.jsx (NEW)
```

---

## 🎯 LOGIQUE PRINCIPALE (AccountPageLayout.jsx)

```javascript
// Pseudo-code
const getTabsForType = (accountType) => {
  const common = ['profile', 'subscription', 'preferences', 'security']
  
  switch(accountType) {
    case 'amateur':
      return [...common, 'saved-data']
    
    case 'producteur':
      return [
        'profile', 'subscription', 'payments', 'company', 'kyc',
        'watermarks', 'templates', 'preferences', 'security',
        'saved-data'
      ]
    
    case 'influenceur':
      return [
        'profile', 'subscription', 'payments', 'kyc',
        'preferences', 'statistics', 'security'
      ]
    
    default:
      return common
  }
}

const renderSection = (activeTab) => {
  switch(activeTab) {
    case 'profile': return <ProfileSection />
    case 'subscription': return <SubscriptionSection accountType={accountType} />
    case 'payments': return <PaymentSection /> // Prod + Inf
    case 'company': return <CompanySection /> // Prod only
    case 'kyc': return <KycSection accountType={accountType} /> // Prod + Inf
    case 'watermarks': return <WatermarkSection /> // Prod only
    case 'templates': return <TemplateSection /> // Prod only
    case 'statistics': return <StatisticsSection /> // Inf only
    case 'preferences': return <PreferencesSection />
    case 'security': return <SecuritySection />
    case 'saved-data': return <SavedDataSection /> // Amateur only (LITE)
    default: return null
  }
}
```

---

## 📊 PRISMA SCHEMA UPDATES NEEDED

```prisma
// Ajouter/Modifier User model
model User {
  // Existant
  id String @id @default(cuid())
  email String @unique
  password String
  
  // NEW: Profile complet
  firstName String?
  lastName String?
  avatar String?
  birthDate DateTime?
  phone String?
  website String?
  bio String?
  country String?
  language String @default("fr")
  
  // NEW: Company (Producteur only)
  company Company?
  
  // NEW: KYC (Producteur + Influenceur)
  kyc KycVerification?
  
  // NEW: Payment methods
  paymentMethods PaymentMethod[]
  
  // NEW: Watermarks
  watermarks Watermark[]
  
  // NEW: Export templates
  exportTemplates ExportTemplate[]
  
  // NEW: Preferences
  preferences UserPreferences?
  
  // NEW: Subscription
  subscription Subscription?
}

model Company {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name String
  legalType String // SARL, EIRL, Auto-entrepreneur, etc.
  siret String?
  ape String?
  addressProfessional String?
  sector String?
  employees Int?
  logoUrl String?
  website String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model KycVerification {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status String @default("pending") // pending, verified, rejected
  idDocument String?
  addressProof String?
  registryDocument String? // Commerce registry
  selfie String?
  rejectionReason String?
  rejectedAt DateTime?
  verifiedAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model PaymentMethod {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type String // credit_card, bank_transfer
  provider String // stripe, paypal, etc.
  token String
  last4 String?
  expiryMonth String?
  expiryYear String?
  isDefault Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Watermark {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name String
  type String // text, image, both
  textContent String?
  imageUrl String?
  positionX Float @default(0.5)
  positionY Float @default(0.9)
  opacity Float @default(1)
  scale Float @default(1)
  isDefault Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ExportTemplate {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name String
  description String?
  preset String? // compact, detailed, complete, custom
  format String // 1:1, 16:9, 9:16, A4
  config Json // Canvas layout, colors, fonts, etc.
  isDefault Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model UserPreferences {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  language String @default("fr")
  theme String @default("dark")
  notificationsEmail Boolean @default(true)
  defaultVisibility String @default("private")
  autoSaveDrafts Boolean @default(true)
  allowSocialSharing Boolean @default(false)
  showDetailedStats Boolean @default(true)
}

model Subscription {
  id String @id @default(cuid())
  userId String @unique
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  accountType String @default("amateur") // amateur, producteur, influenceur
  status String @default("active") // active, inactive, cancelled
  stripeCustomerId String?
  stripeSubscriptionId String?
  renewalDate DateTime?
  cancelledAt DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## ✅ CHECKLIST IMPLÉMENTATION

### Phase 1: Core Structure
- [ ] Créer AccountPageLayout.jsx (router par type)
- [ ] Créer SubscriptionSection.jsx
- [ ] Créer SecuritySection.jsx
- [ ] Modifier ProfileSection.jsx (ajouter champs manquants)
- [ ] Adapter PreferencesSection.jsx
- [ ] Migrer SavedDataSection.jsx

### Phase 2: Producteur Specifics
- [ ] Créer PaymentSection.jsx + PaymentMethodManager
- [ ] Créer CompanySection.jsx + CompanyForm
- [ ] Créer KycSection.jsx + KycDocumentUpload
- [ ] Créer WatermarkSection.jsx + WatermarkEditor
- [ ] Créer TemplateSection.jsx + TemplateCanvasEditor

### Phase 3: Influenceur Specifics
- [ ] Ajouter StatisticsSection.jsx (lié à /stats page)
- [ ] Adapter KycSection pour Influenceur
- [ ] Créer statistiques publiques toggle

### Phase 4: Backend Integration
- [ ] Mettre à jour API /account endpoints
- [ ] Implémenter KYC document upload (AWS S3 ou local)
- [ ] Implémenter Stripe integration stub
- [ ] Créer endpoints paiements
- [ ] Créer endpoints entreprise

---

## 🚀 ORDRE D'EXÉCUTION

**Jour 1** (4h):
1. Créer AccountPageLayout.jsx structure
2. Créer SubscriptionSection.jsx
3. Créer SecuritySection.jsx
4. Refactoriser ProfileSection (ajouter phone, website, bio)

**Jour 2** (6h):
5. Créer PaymentSection.jsx + PaymentMethodManager
6. Créer CompanySection.jsx
7. Créer KycSection.jsx (base)
8. Créer WatermarkSection.jsx (interface simple)

**Jour 3** (4h):
9. Créer TemplateSection.jsx (interface simple)
10. Tests intégration
11. Responsive fixes
12. Prisma migrations

**Jour 4** (2h):
13. Influenceur StatisticsSection
14. Polish & edge cases

**Total Estimated**: 16h = 2 jours full

---

## 🎨 UI/UX GUIDELINES

- Consistent avec reste app (Tailwind + Framer Motion)
- Tabs navigation en haut (responsive grid)
- Sections indépendantes (chacune peut être sauvegardée)
- Loading states sur tous les formulaires
- Success/error messages explicites
- Confirmations avant deletion/downgrade
- Help tooltips sur champs complexes

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Mitigation |
|------|--------|-----------|
| KYC documents trop complexe | 4h | Implémenter interface simple upload + validation backend |
| Stripe integration bloquée | 4h | Faire stub avec localStorage, intégrer après |
| Account type routing confus | 3h | Tester exhaustivement chaque type |
| Performance avec grandes listes | 2h | Paginer, virtualize if needed |

---
