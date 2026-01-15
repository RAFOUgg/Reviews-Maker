# Profils - Gestion des Comptes Utilisateur

## 📋 Overview

Le système **PROFILS** gère tous les éléments de configuration et données personnelles de l'utilisateur.

---

## 🎯 Sections du Profil

### **1. INFORMATIONS PERSONNELLES**

**Disponibilité**: Tous les niveaux

#### Données Basiques
- **Email** `email` - Unique, vérifié
- **Nom d'utilisateur** `username` - Unique, alphanumeric
- **Prénom** `string` - Optionnel
- **Nom** `string` - Optionnel
- **Pays** `select` - Liste pays
- **Langue préférée** `select` - "Français" | "Anglais" | "Autres"

#### Profil Public
- **Avatar** `image-upload` - Photo de profil
- **Bio** `textarea` - Description utilisateur (max 500 char)
- **Profil public** `toggle` - Visible ou privé dans galerie
- **Website URL** `url` - Site personnel/professionnel (optionnel)

#### Compte Social Linked
- **Discord** `oauth-link` - Lien Discord
- **Google** `oauth-link` - Lien Google
- **Facebook** `oauth-link` - Lien Facebook
- **Apple** `oauth-link` - Lien Apple
- **Amazon** `oauth-link` - Lien Amazon

**Actions**:
- Connecter nouveau compte
- Déconnecter compte existant
- Voir liste appareils/sessions actives

#### Sécurité Compte
- **Mot de passe** `password-input` - Changer mot de passe
- **2FA (Two-Factor Auth)** `toggle` - Activer/désactiver
  - Si activé: sélectionner authenticator (TOTP via app) ou SMS
- **Session Management** `list` - Voir sessions actives, déconnecter à distance

---

### **2. DONNÉES ENTREPRISE** (Producteur/Influenceur)

#### Informations Professionnelles
- **Nom Entreprise** `string` - Nom légal
- **Type Entreprise** `select` - "Producteur" | "Extracteur" | "Influenceur" | "Autre"
- **SIRET/TVA** `string` - Numéro enregistrement (optionnel, pour vérification)
- **Adresse** `address` - Adresse professionnelle
- **Téléphone** `phone` - Numéro professionnel

#### KYC & Vérification

**Statut KYC**
- "Pending" → En attente de vérification
- "Verified" → Compte vérifié
- "Rejected" → Vérification refusée

**Documents KYC**
- **Pièce d'identité** `file-upload` - ID/Passeport (image/PDF)
- **Justificatif d'adresse** `file-upload` - Facture utility/autre (image/PDF)
- **Document professionnel** `file-upload` - Licence, certification, etc.

**Historique Vérification**
- Date soumission
- Statut actuel
- Messages de rejet (si applicable)
- Date approbation (si approuvé)

#### Données Entreprise Optionnelles
- **Logo** `image-upload` - Logo entreprise
- **Description Business** `textarea` - Qui êtes-vous, ce que vous faites
- **Website Entreprise** `url` - Site officiel
- **Instagram Pro** `text` - Compte Instagram lié
- **Années d'expérience** `number` - Expérience production/expertise

---

### **3. PRÉFÉRENCES & PARAMÈTRES**

#### Préférences Interface
- **Thème** `select` - "Light" | "Dark" | "Auto"
- **Langue** `select` - Multilingue
- **Format date** `select` - "JJ/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
- **Unités** `select` - "Métrique (°C, g, L)" | "Impérial (°F, oz, etc)"

#### Notifications Email
- **Review Likes** `toggle` - Notifié quand review reçoit un like
- **Review Comments** `toggle` - Notifié commentaires sur reviews
- **New Features** `toggle` - Alertes nouvelles fonctionnalités
- **Newsletter** `toggle` - Emails marketing/tips
- **Important Updates** `toggle` - Mises à jour importantes (obligatoire)

#### Export Preferences
- **Format par défaut** `select` - PNG | PDF | SVG | etc.
- **Qualité par défaut** `select` - "Standard" | "Haute" (selon tier)
- **Template par défaut** `select` - Sélectionner template à utiliser automatiquement
- **Watermark par défaut** `select` - Filigrane automatique sur exports

#### Privacy & Data
- **Profil public** `toggle` - Visible galerie publique
- **Reviews publiques** `toggle` - Possibilité publier reviews
- **Voir compte stats** `toggle` - Permettre voir statistiques publiques
- **Analytics tracking** `toggle` - Permettre tracking utilisation

#### RGPD
- **Télécharger mes données** `button` - Export complet compte (JSON/CSV)
- **Supprimer compte** `button` - Suppression irréversible avec confirmation

---

### **4. DONNÉES DE FACTURATION** (Producteur/Influenceur payants)

#### Abonnement Actif
- **Type abonnement** `display` - "Producteur 29.99€" | "Influenceur 15.99€"
- **Date début** `display` - Date actuelle cycle
- **Date renouvellement** `display` - Prochain renouvellement
- **Statut** `display` - "Actif" | "En attente paiement" | "Expiré"

#### Méthodes de Paiement
- **Carte crédit** `list` - Cartes enregistrées
  - Ajouter nouvelle carte
  - Supprimer carte
  - Marquer comme principale
- **PayPal** `link` - Lié/Pas lié

**Historique Factures**
- Télécharger PDF factures
- Voir détails paiement
- Resend invoice email

#### Changer Abonnement
- Upgrade/Downgrade
- Annuler abonnement
- Mode pause (optionnel)

---

### **5. INTÉGRATIONS EXTERNES**

#### API Keys
- **Générer API Key** `button` - Pour intégrations tierces
- **API Keys existantes** `list`
  - Voir clé (masked)
  - Régénérer clé
  - Supprimer clé
  - Scope permissions

#### Webhooks
- **Configurer webhooks** - Pour notifications événements
  - URL endpoint
  - Événements sélectionnés
  - Actif/Inactif
  - Historique deliveries

#### Social Media Links
- **Partage automatique** `toggle` - Auto-publish reviews sur réseaux
- **Instagram** `link` - Compte Instagram pro
- **Twitter** `link` - Compte Twitter/X
- **TikTok** `link` - Compte TikTok (optionnel)

---

## 📊 Statistiques Utilisateur (Dashboard Profile)

### Vue d'Ensemble

**Card Principal**
```
┌─────────────────────────────┐
│ Profil: [Username]          │
│ Tier: Producteur             │
│ Member depuis: Jan 2024      │
│ ┌──────────────────────────┐ │
│ │ 42 Reviews | 156 Exports  │ │
│ │ 3,245 Likes | 87 Comments │ │
│ └──────────────────────────┘ │
└─────────────────────────────┘
```

### Statistiques Détaillées

**Par Type Produit**
```
Fleurs: 25 reviews
Hash: 12 reviews
Concentré: 4 reviews
Comestible: 1 review
```

**Engagement Public** (si profil public)
- Nombre followers (optionnel feature)
- Nombre reviews visionnées
- Nombre likes reçus
- Nombre commentaires reçus
- Top reviews (by engagement)

**Activité Récente**
- Reviews créées: dernières 5
- Exports réalisés: derniers 10
- Engagements reçus: dernières 15

**Ranking & Badges** (optionnel)
- "Top Reviewer" si parmi top 100
- "Active Producer" si 10+ reviews
- "Expert Extractor" si spécialité concentré
- Badges achievements

---

## 💾 Modèle de Données

### UserProfile
```typescript
model UserProfile {
  id: String @id @default(cuid())
  userId: String @unique
  user: User @relation(fields: [userId], references: [id])
  
  // Personal
  firstName: String?
  lastName: String?
  avatar: String?
  bio: String?
  country: String?
  language: String @default("fr")
  
  // Professional (Producteur/Influenceur)
  companyName: String?
  companyType: String? // "producteur" | "extracteur" | "influenceur"
  businessLicense: String?
  website: String?
  instagramPro: String?
  yearsExperience: Int?
  
  // Preferences
  theme: String @default("auto")
  dateFormat: String @default("DD/MM/YYYY")
  units: String @default("metric")
  
  // Privacy
  isPublic: Boolean @default(false)
  allowPublicReviews: Boolean @default(false)
  showPublicStats: Boolean @default(false)
  
  // Notifications
  emailNotifications: Json @default("{}")
  
  // Stats
  totalReviews: Int @default(0)
  totalExports: Int @default(0)
  totalLikes: Int @default(0)
  totalComments: Int @default(0)
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### KYCDocument
```typescript
model KYCDocument {
  id: String @id @default(cuid())
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  documentType: String // "id" | "address_proof" | "professional"
  fileUrl: String
  fileName: String
  
  verificationStatus: String @default("pending") // "pending" | "verified" | "rejected"
  verificationNotes: String?
  verifiedAt: DateTime?
  
  submittedAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

---

## 🔐 Sécurité & Confidentialité

### Données Sensibles
- Mot de passe: hashé (bcryptjs)
- 2FA secrets: encrypté
- Informations KYC: hautement sécurisées, conformes RGPD
- Paiements: traité PCI-DSS compliant

### Audit Trail
- Log accès sessions
- Log modifications paramètres
- Log accès données sensibles
- Durée rétention: 90 jours

---

## 🔗 Fichiers Référence

- Frontend: `client/src/pages/Profile*.jsx`
- Backend: `server-new/routes/profile.js`
- Auth: `server-new/routes/auth.js`
- Schema: `server-new/prisma/schema.prisma`
- Middleware: `server-new/middleware/auth.js`

