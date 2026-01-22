# ✅ ACCOUNT PAGE REFONTE - STRUCTURE & FILES À CRÉER

**Durée**: 16 heures  
**Start**: NOW  
**Basé sur**: PAGES/PROFILS documentation

---

## 📁 FILE STRUCTURE À CRÉER

```
client/src/pages/account/
├─ AccountPage.jsx (refactored - main component)
├─ tabs/
│  ├─ ProfileTab.jsx (Amateur/Producteur/Influenceur)
│  ├─ SubscriptionTab.jsx (all tiers)
│  ├─ CompanyTab.jsx (Producteur)
│  ├─ KYCTab.jsx (Producteur/Influenceur)
│  ├─ PaymentTab.jsx (Producteur/Influenceur)
│  ├─ InvoicesTab.jsx (Producteur/Influenceur)
│  ├─ BankTab.jsx (Producteur)
│  ├─ PreferencesTab.jsx (all)
│  ├─ SecurityTab.jsx (all)
│  └─ SupportTab.jsx (all)
├─ components/
│  ├─ TabNavigation.jsx
│  ├─ ProfileForm.jsx
│  ├─ SubscriptionCard.jsx
│  ├─ UpgradeModal.jsx
│  ├─ KYCUploadZone.jsx
│  ├─ PaymentMethodForm.jsx
│  └─ PasswordChangeForm.jsx

server-new/routes/
├─ userProfile.js (new)
├─ userSettings.js (new)
└─ userKYC.js (new)

Prisma schema updates:
├─ Add fields to User model
├─ Create Company model
├─ Create KYCDocument model
└─ Create PaymentMethod model
```

---

## 🎯 AMATEUR VERSION (5 tabs)

1. **Profil**: Name, Email, Avatar, Bio
2. **Abonnement**: Current tier (Amateur free), Upgrade button
3. **Préférences**: Language, Theme, Notifications
4. **Sécurité**: Password change, 2FA
5. **Support**: Help, Contact, FAQ

---

## 🎯 PRODUCTEUR VERSION (9 tabs)

1. **Profil**: Name, Email, Avatar, Bio, Phone, Website
2. **Abonnement**: Current tier ($29.99/mo), Manage subscription
3. **Entreprise**: Company name, type, registration, tax ID
4. **KYC**: Document upload + verification status
5. **Paiement**: Payment method management, Stripe integration
6. **Factures**: Invoice history, download
7. **Banque**: Bank account, IBAN, routing
8. **Préférences**: Language, Theme, Notifications, Default settings
9. **Sécurité**: Password, 2FA, Login history

---

## 🎯 INFLUENCEUR VERSION (7 tabs)

1. **Profil**: Name, Email, Avatar, Bio, Phone, Social links
2. **Abonnement**: Current tier ($15.99/mo), Manage subscription
3. **KYC**: Document upload + verification status
4. **Paiement**: Payment method, Stripe
5. **Factures**: Invoice history
6. **Préférences**: Language, Theme, Notifications
7. **Sécurité**: Password, 2FA

---

## 🔧 IMPLEMENTATION STEPS

### STEP 1: PRISMA SCHEMA UPDATES (1h)

```prisma
// Add to User model:
extend model User {
  // Profile
  firstName        String?
  lastName         String?
  phoneNumber      String?
  website          String?
  bio              String?     @db.Text
  
  // Account type (existing but ensure)
  accountType      String      @default("amateur") // amateur, producteur, influenceur
  
  // Settings
  theme            String      @default("light")
  language         String      @default("fr")
  
  // 2FA
  twoFactorEnabled Boolean     @default(false)
  twoFactorSecret  String?
  
  // Relations
  company          Company?
  paymentMethods   PaymentMethod[]
  kycDocuments     KYCDocument[]
  invoices         Invoice[]
}

// New model: Company (Producteur)
model Company {
  id                String      @id @default(cuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name              String      @db.VarChar(255)
  businessType      String      // 'sole_proprietor', 'llc', 'corp'
  registrationNumber String?    @unique
  taxId             String?     @unique
  
  // Address
  street            String?
  city              String?
  province          String?
  zipCode           String?
  country           String?
  
  // Banking
  bankName          String?
  accountName       String?
  accountNumber     String?     @db.Text // encrypted
  iban              String?
  routingNumber     String?
  
  // Status
  isVerified        Boolean     @default(false)
  verifiedAt        DateTime?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
}

// New model: PaymentMethod
model PaymentMethod {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type              String      // 'card', 'bank_transfer'
  
  // Card
  cardBrand         String?     // visa, mastercard, amex
  cardLastFour      String?
  cardExpiryMonth   Int?
  cardExpiryYear    Int?
  
  // Bank
  bankName          String?
  accountName       String?
  iban              String?
  
  isDefault         Boolean     @default(false)
  createdAt         DateTime    @default(now())
}

// New model: KYCDocument
model KYCDocument {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  documentType      String      // 'id_proof', 'address_proof', 'business_license'
  fileName          String      @db.VarChar(255)
  fileUrl           String      // S3 URL
  fileSize          Int
  mimeType          String
  
  status            String      @default("pending") // pending, approved, rejected
  notes             String?     @db.Text
  
  uploadedAt        DateTime    @default(now())
  approvedAt        DateTime?
  rejectedAt        DateTime?
  
  @@index([userId])
}

// New model: Invoice
model Invoice {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  invoiceNumber     String      @unique
  amountDue         Float
  currency          String      @default("USD")
  
  status            String      @default("pending") // pending, paid, overdue
  
  issuedAt          DateTime    @default(now())
  dueAt             DateTime
  paidAt            DateTime?
  
  fileUrl           String?     // PDF URL
  
  @@index([userId])
  @@index([status])
}
```

---

### STEP 2: BACKEND ROUTES (3h)

#### **server-new/routes/userProfile.js**

```javascript
import express from 'express';
import { prisma } from '../db.js';
import { authenticateUser } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/avatars' });

// GET /api/users/profile
router.get('/profile', authenticateUser, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      website: true,
      bio: true,
      accountType: true,
      avatar: true,
      company: true,
    },
  });
  res.json(user);
});

// PUT /api/users/profile
router.put('/profile', authenticateUser, async (req, res) => {
  const { firstName, lastName, phoneNumber, website, bio, avatar } = req.body;
  
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      firstName,
      lastName,
      phoneNumber,
      website,
      bio,
      avatar,
    },
  });
  
  res.json(user);
});

// POST /api/users/profile/avatar (upload)
router.post('/profile/avatar', authenticateUser, upload.single('avatar'), async (req, res) => {
  // Upload to S3 or keep local
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { avatar: req.file.path },
  });
  res.json(user);
});

// GET /api/users/company
router.get('/company', authenticateUser, async (req, res) => {
  const company = await prisma.company.findUnique({
    where: { userId: req.user.id },
  });
  res.json(company);
});

// PUT /api/users/company
router.put('/company', authenticateUser, async (req, res) => {
  const company = await prisma.company.upsert({
    where: { userId: req.user.id },
    create: {
      userId: req.user.id,
      ...req.body,
    },
    update: req.body,
  });
  res.json(company);
});

export default router;
```

#### **server-new/routes/userSettings.js**

```javascript
import express from 'express';
import { prisma } from '../db.js';
import { authenticateUser } from '../middleware/auth.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// GET /api/users/settings
router.get('/settings', authenticateUser, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      theme: true,
      language: true,
      twoFactorEnabled: true,
    },
  });
  res.json(user);
});

// PUT /api/users/settings
router.put('/settings', authenticateUser, async (req, res) => {
  const { theme, language } = req.body;
  
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { theme, language },
  });
  
  res.json(user);
});

// PUT /api/users/password
router.put('/password', authenticateUser, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Verify current password
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const isValid = await bcrypt.compare(currentPassword, user.password);
  
  if (!isValid) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: hashedPassword },
  });
  
  res.json({ ok: true });
});

// POST /api/users/2fa/enable
router.post('/2fa/enable', authenticateUser, async (req, res) => {
  // Generate 2FA secret using speakeasy or similar
  // Return QR code + secret
});

// POST /api/users/2fa/verify
router.post('/2fa/verify', authenticateUser, async (req, res) => {
  // Verify TOTP token
});

export default router;
```

#### **server-new/routes/userKYC.js**

```javascript
import express from 'express';
import { prisma } from '../db.js';
import { authenticateUser } from '../middleware/auth.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/kyc' });

// GET /api/users/kyc/documents
router.get('/kyc/documents', authenticateUser, async (req, res) => {
  const documents = await prisma.kycDocument.findMany({
    where: { userId: req.user.id },
  });
  res.json(documents);
});

// POST /api/users/kyc/upload
router.post('/kyc/upload', authenticateUser, upload.single('document'), async (req, res) => {
  const { documentType } = req.body;
  
  const doc = await prisma.kycDocument.create({
    data: {
      userId: req.user.id,
      documentType,
      fileName: req.file.originalname,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    },
  });
  
  // Trigger KYC verification process (async)
  // e.g., call Stripe or manual review
  
  res.json(doc);
});

// GET /api/users/kyc/status
router.get('/kyc/status', authenticateUser, async (req, res) => {
  const documents = await prisma.kycDocument.findMany({
    where: { userId: req.user.id },
  });
  
  const status = documents.every(d => d.status === 'approved') ? 'verified' : 'pending';
  
  res.json({ status, documents });
});

export default router;
```

---

### STEP 3: FRONTEND COMPONENTS (8h)

#### **client/src/pages/account/AccountPage.jsx** (main refactored)

```javascript
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../../store/useStore';
import TabNavigation from './components/TabNavigation';
import ProfileTab from './tabs/ProfileTab';
import SubscriptionTab from './tabs/SubscriptionTab';
import CompanyTab from './tabs/CompanyTab';
import KYCTab from './tabs/KYCTab';
import PaymentTab from './tabs/PaymentTab';
import InvoicesTab from './tabs/InvoicesTab';
import BankTab from './tabs/BankTab';
import PreferencesTab from './tabs/PreferencesTab';
import SecurityTab from './tabs/SecurityTab';
import SupportTab from './tabs/SupportTab';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, accountType } = useStore();
  
  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => fetch('/api/users/profile').then(r => r.json()),
  });
  
  // Determine available tabs per account type
  const getTabs = () => {
    const baseTabs = [
      { id: 'profile', label: '👤 Profil' },
      { id: 'subscription', label: '📦 Abonnement' },
      { id: 'preferences', label: '⚙️ Préférences' },
      { id: 'security', label: '🔐 Sécurité' },
      { id: 'support', label: '💬 Support' },
    ];
    
    if (accountType === 'producteur') {
      return [
        { id: 'profile', label: '👤 Profil' },
        { id: 'subscription', label: '📦 Abonnement' },
        { id: 'company', label: '🏢 Entreprise' },
        { id: 'kyc', label: '✓ KYC' },
        { id: 'payment', label: '💳 Paiement' },
        { id: 'invoices', label: '📄 Factures' },
        { id: 'bank', label: '🏦 Banque' },
        { id: 'preferences', label: '⚙️ Préférences' },
        { id: 'security', label: '🔐 Sécurité' },
      ];
    }
    
    if (accountType === 'influenceur') {
      return [
        { id: 'profile', label: '👤 Profil' },
        { id: 'subscription', label: '📦 Abonnement' },
        { id: 'kyc', label: '✓ KYC' },
        { id: 'payment', label: '💳 Paiement' },
        { id: 'invoices', label: '📄 Factures' },
        { id: 'preferences', label: '⚙️ Préférences' },
        { id: 'security', label: '🔐 Sécurité' },
      ];
    }
    
    return baseTabs;
  };
  
  const tabs = getTabs();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Mon Compte</h1>
          <p className="text-neutral-600">Gérez vos paramètres et informations</p>
        </div>
      </div>
      
      {/* Tabs + Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />
          </div>
          
          {/* Tab Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && <ProfileTab profile={profile} />}
            {activeTab === 'subscription' && <SubscriptionTab />}
            {activeTab === 'company' && <CompanyTab />}
            {activeTab === 'kyc' && <KYCTab />}
            {activeTab === 'payment' && <PaymentTab />}
            {activeTab === 'invoices' && <InvoicesTab />}
            {activeTab === 'bank' && <BankTab />}
            {activeTab === 'preferences' && <PreferencesTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'support' && <SupportTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### **client/src/pages/account/tabs/ProfileTab.jsx**

```javascript
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function ProfileTab({ profile }) {
  const [formData, setFormData] = useState(profile || {});
  
  const saveMutation = useMutation({
    mutationFn: (data) => fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      // Show success message
    },
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };
  
  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <img
          src={formData.avatar || '/avatar-placeholder.png'}
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold mb-2">Photo de profil</h3>
          <input type="file" accept="image/*" className="text-sm" />
        </div>
      </div>
      
      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prénom</label>
          <input
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email || ''}
          disabled
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-50 cursor-not-allowed"
        />
      </div>
      
      {/* Producteur/Influenceur fields */}
      {(formData.accountType === 'producteur' || formData.accountType === 'influenceur') && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Téléphone</label>
            <input
              type="tel"
              value={formData.phoneNumber || ''}
              onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Site Web</label>
            <input
              type="url"
              value={formData.website || ''}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
            />
          </div>
        </>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Biographie</label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows="4"
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
          maxLength={500}
        />
        <p className="text-xs text-neutral-600 mt-1">
          {formData.bio?.length || 0}/500 caractères
        </p>
      </div>
      
      <button
        type="submit"
        disabled={saveMutation.isPending}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {saveMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </motion.form>
  );
}
```

#### **client/src/pages/account/tabs/SubscriptionTab.jsx**

```javascript
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../../../store/useStore';

export default function SubscriptionTab() {
  const { accountType } = useStore();
  
  const { data: subscription } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => fetch('/api/subscriptions/current').then(r => r.json()),
  });
  
  const tiers = {
    amateur: {
      name: 'Amateur',
      price: 'Gratuit',
      color: 'blue',
      features: [
        'Créer des reviews (Fleurs)',
        'Exporter PNG/JPEG/PDF',
        'Accès à templates prédéfinis',
      ],
    },
    producteur: {
      name: 'Producteur',
      price: '$29.99/mois',
      color: 'green',
      features: [
        'Tous types produits',
        'Exporter SVG/CSV/JSON',
        'Système Phenohunt',
        'Bibliothèque complète',
        'Statistiques avancées',
      ],
    },
    influenceur: {
      name: 'Influenceur',
      price: '$15.99/mois',
      color: 'purple',
      features: [
        'Exporter SVG/PDF haute qualité',
        'Système de partage avancé',
        'Statistiques audience',
      ],
    },
  };
  
  const currentTier = tiers[accountType];
  
  return (
    <div className="space-y-6">
      {/* Current subscription */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-2">Abonnement Actuel</h3>
        <div className={`inline-block px-3 py-1 bg-${currentTier.color}-100 text-${currentTier.color}-700 rounded-full font-medium`}>
          {currentTier.name}
        </div>
        <p className="text-2xl font-bold mt-4">{currentTier.price}</p>
        
        {subscription?.renewalDate && (
          <p className="text-sm text-neutral-600 mt-2">
            Renouvellement: {new Date(subscription.renewalDate).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {/* Upgrade options */}
      {accountType === 'amateur' && (
        <div className="grid grid-cols-2 gap-4">
          {['producteur', 'influenceur'].map((tier) => {
            const tierInfo = tiers[tier];
            return (
              <div key={tier} className="bg-white border border-neutral-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">{tierInfo.name}</h4>
                <p className="text-lg font-bold mb-3">{tierInfo.price}</p>
                <button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                  Passer à {tierInfo.name}
                </button>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Cancel subscription (Producteur/Influenceur) */}
      {accountType !== 'amateur' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2">Annuler l'abonnement</h4>
          <p className="text-sm text-red-800 mb-3">
            Vous perdrez accès aux fonctionnalités premium
          </p>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            Annuler l'abonnement
          </button>
        </div>
      )}
    </div>
  );
}
```

(Continue with other tabs...)

---

### STEP 4: INTEGRATION (2h)

- [ ] Link routes to server
- [ ] Connect Zustand store
- [ ] Add navigation menu
- [ ] Test all tabs per tier
- [ ] Error handling

---

## ✅ IMPLEMENTATION CHECKLIST

```
PHASE 1: DATABASE (1h)
- [ ] Update Prisma schema
- [ ] Run migration
- [ ] Verify tables created

PHASE 2: BACKEND ROUTES (3h)
- [ ] userProfile.js
- [ ] userSettings.js
- [ ] userKYC.js
- [ ] Test endpoints with Postman

PHASE 3: FRONTEND (10h)
- [ ] AccountPage.jsx refactored
- [ ] All 10 tab components
- [ ] TabNavigation component
- [ ] Form components
- [ ] Integration with store
- [ ] Test all 3 tiers

PHASE 4: TESTING (2h)
- [ ] Amateur tier flows
- [ ] Producteur tier flows
- [ ] Influenceur tier flows
- [ ] Form submissions
- [ ] Error handling
```

---

**Total**: 16 hours  
**Status**: 🚀 READY TO START

