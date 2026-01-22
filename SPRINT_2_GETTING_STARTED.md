# 🚀 GUIDE DÉMARRAGE SPRINT 2 - JOUR 1

**Date**: 22 janvier 2026 (MAINTENANT!)  
**Durée**: SPRINT 2 = 5 jours (22-26 jan)  
**Objectif**: Foundation complète (Account + ExportMaker + Library base)

---

## ✅ PRÉ-REQUIS AVANT DE COMMENCER

### **Environnement Setup**
```bash
# 1. Vérifier Node.js & npm
node --version  # v18+
npm --version   # v9+

# 2. Clone latest main
cd Reviews-Maker
git pull origin main
git status  # Should be clean

# 3. Installer dépendances
cd client
npm install
cd ../server-new
npm install

# 4. Vérifier Prisma
npm run prisma:generate

# 5. Créer branch pour Sprint 2
git checkout -b feat/sprint-2-foundation

# 6. Démarrer dev servers
# Terminal 1:
cd client && npm run dev

# Terminal 2:
cd server-new && npm run dev
```

### **Vérifications**
```
✅ Client running on http://localhost:5173
✅ Server running on http://localhost:3001 (or 3000)
✅ Database accessible (npm run prisma:studio)
✅ No console errors
✅ Auth working (can login with existing account)
```

---

## 📋 TÂCHE 1: ACCOUNT PAGE REFONTE (16 heures)

### **Jour 1: Structure & Core Sections (6h)**

#### **1.1: Create AccountPageLayout.jsx** (2h)
```javascript
// client/src/pages/account/AccountPageLayout.jsx

// Nouveau:
// - Routes tabs basé sur accountType
// - Grid layout responsive (adapts to number of tabs)
// - Tab navigation avec icons
// - Animation between tabs

// Pseudo-code:
const AccountPageLayout = ({ accountType, children }) => {
  const tabs = getTabsForAccountType(accountType)
  const [activeTab, setActiveTab] = useState('profile')
  
  return (
    <div className="account-layout">
      <Sidebar />
      <TabNavigation tabs={tabs} active={activeTab} onChange={setActiveTab} />
      <TabContent activeTab={activeTab}>
        {children}
      </TabContent>
    </div>
  )
}
```

**Steps**:
1. Copy current AccountPage content
2. Extract tab navigation into AccountPageLayout
3. Create getTabsForAccountType(type) function
4. Implement responsive grid
5. Test navigation between tabs

#### **1.2: Refactor ProfileSection.jsx** (2h)
Current: Exists but minimal

**Add Fields**:
```javascript
// Current: name, email, country, birthdate, avatar
// ADD:
- firstName / lastName (split from name)
- phoneNumber
- website
- bio (longer description)
- linkedinUrl / twitterHandle (optional)
- address (street, city, postal code)
```

**Implementation**:
1. Read current ProfileSection code
2. Update form fields
3. Add validation
4. Update API endpoint (GET/PATCH /api/account/profile)
5. Test all fields save/load correctly

#### **1.3: Create SubscriptionSection.jsx** (1h)
```javascript
// client/src/components/account/SubscriptionSection.jsx

// Display:
// - Current subscription badge (Amateur/Producteur/Influenceur)
// - Price & renewal date
// - Features included (checkmark list)
// - "Manage Subscription" button
// - FAQ: "Why upgrade?"

// Features by tier already exist in useAccountFeatures hook
// Reuse from AccountTypeDisplay component (already created)
```

**Implementation**:
1. Create component shell
2. Use useStore for accountType
3. Use useAccountFeatures for features list
4. Import AccountTypeDisplay (reuse)
5. Add "Manage Subscription" button handler
6. Test displays correct tier

#### **1.4: Create SecuritySection.jsx** (1h)
```javascript
// client/src/components/account/SecuritySection.jsx

// Display:
// - Change password form
// - 2FA setup (stub for now)
// - Login history (last 5 logins)
// - Active sessions (logout other devices)

// Implementation is straightforward
```

---

### **JOur 2: Advanced Sections (10h)**

#### **2.1: Create PaymentSection.jsx** (2h) [Producteur + Influenceur]

```javascript
// client/src/components/account/PaymentSection.jsx

// Display:
// - Add/manage payment methods (credit card, bank transfer)
// - Billing address
// - Invoice history (table with download)
// - VAT/Tax ID field

// For now: Form + localStorage (real Stripe in Phase 2)
```

#### **2.2: Create CompanySection.jsx** (2h) [Producteur only]

```javascript
// client/src/components/account/CompanySection.jsx

// Display:
// - Company name & type (SARL, EIRL, Auto-entrepreneur)
// - SIRET/APE numbers
// - Business address
// - Sector / number of employees
// - Logo upload
// - Website & social links
// - Contact persons

// Implementation: Form + validation
```

#### **2.3: Create KycSection.jsx** (2h) [Producteur + Influenceur]

```javascript
// client/src/components/account/KycSection.jsx

// Display:
// - KYC status badge (pending/verified/rejected)
// - Document uploads:
//   ├─ ID document (JPG/PNG)
//   ├─ Address proof (utility bill, rental contract)
//   ├─ Business registry (for SARL)
//   └─ Selfie with ID
// - Upload progress
// - Rejection reason (if rejected)
// - Messages about verification time

// Implementation: File upload + preview
// Use simple file input for now, AWS S3 in Phase 2
```

#### **2.4: Create WatermarkSection.jsx** (2h) [Producteur only]

```javascript
// client/src/components/account/WatermarkSection.jsx

// Display:
// - Watermark library (list current watermarks)
// - Upload new watermark
// - Preview on sample image
// - Position/opacity/scale sliders
// - Set as default button

// Implementation: Simple management UI
// Advanced editor in Library section
```

#### **2.5: Create TemplateSection.jsx** (1h) [Producteur only]

```javascript
// client/src/components/account/TemplateSection.jsx

// Display:
// - Link to Library > Export Templates
// - Recent templates (3-5 most used)
// - Quick actions (Use, Edit, Duplicate)
// - "Create new" button

// Implementation: Simple list view
```

#### **2.6: Create StatisticsSection.jsx** (1h) [Influenceur only]

```javascript
// client/src/components/account/StatisticsSection.jsx

// Display:
// - Link to /stats page
// - Public statistics toggle (show/hide on public profile)
// - Badges (verification status)
// - Bio visibility

// Implementation: Simple toggles + link
```

---

### **Checklist TÂCHE 1**
- [ ] AccountPageLayout.jsx created & tested
- [ ] ProfileSection.jsx updated with all fields
- [ ] SubscriptionSection.jsx created
- [ ] SecuritySection.jsx created
- [ ] PaymentSection.jsx created (Prod+Inf)
- [ ] CompanySection.jsx created (Prod only)
- [ ] KycSection.jsx created (Prod+Inf)
- [ ] WatermarkSection.jsx created (Prod only)
- [ ] TemplateSection.jsx created (Prod only)
- [ ] StatisticsSection.jsx created (Inf only)
- [ ] All components integrated into AccountPage
- [ ] Tabs appear/hide based on accountType
- [ ] All sections save data to backend
- [ ] Form validation working
- [ ] Responsive on mobile/tablet/desktop
- [ ] No console errors
- [ ] Tests pass (or manual tests documented)

---

## 📦 TÂCHE 2: EXPORTMAKER CORE (20 heures)

### **JOur 2-3: Main Structure & Steps (8h)**

#### **2.1: Create ExportMaker.jsx** (2h)
```javascript
// client/src/components/export/ExportMaker.jsx

// Main controller:
// - State for: format, template, customization, preview
// - Step navigation (1/5 → 5/5)
// - Wrapper component for modality

// Pseudo:
const ExportMaker = ({ review, onClose }) => {
  const [step, setStep] = useState(1)
  const [format, setFormat] = useState('png')
  const [template, setTemplate] = useState('compact')
  const [customization, setCustomization] = useState({})
  
  return (
    <Modal>
      {step === 1 && <StepFormatSelector ... />}
      {step === 2 && <StepTemplateSelector ... />}
      {step === 3 && <StepCustomization ... />}
      {step === 4 && <StepPreview ... />}
      {step === 5 && <StepGeneration ... />}
    </Modal>
  )
}
```

#### **2.2: Create StepFormatSelector.jsx** (1h)

```javascript
// Select format: PNG, JPEG, PDF
// Select DPI: Standard (150), High (300)
// Show restrictions per account type
// Next button when ready
```

#### **2.3: Create StepTemplateSelector.jsx** (1h)

```javascript
// Show template options: Compact, Detailed, Complete
// Show format compatibility
// Show format auto-selected from Step 1
// Description for each template
// Next button
```

#### **2.4: Create StepCustomization.jsx** (2h)

```javascript
// Settings panel with:
// - Theme selector (light/dark)
// - Color palette (predefined colors)
// - Font selector (basic fonts)
// - Layout visibility (sections checkboxes)
// - Save preset option
// - Next button
```

#### **2.5: Create StepPreview.jsx** (1h)

```javascript
// Full-screen preview canvas:
// - Render template with current data
// - Responsive view options (mobile/tablet/desktop)
// - Zoom controls
// - Previous/Next buttons
```

#### **2.6: Create StepGeneration.jsx** (1h)

```javascript
// Final step:
// - "Generate & Download" button
// - Progress bar during generation
// - Download triggers automatically
// - "Save as preset" option
// - "Share" buttons (stub)
```

---

### **JOur 4: Template Components (6h)**

#### **3.1: Create TemplateCompact.jsx** (2h)
```javascript
// Render Fleur review in COMPACT format
// Show: Name, Cultivar, Photo, Mini ratings (visual only)
// Size: 1:1 square
// CSS: export-templates.css
```

#### **3.2: Create TemplateDetailed.jsx** (2h)
```javascript
// Render Fleur review in DETAILED format
// Show: Info + First 5 pipeline stages + Detailed ratings
// Sizes: 1:1, 16:9, 9:16, A4
// CSS: export-templates.css
```

#### **3.3: Create TemplateComplete.jsx** (2h)
```javascript
// Render Fleur review in COMPLETE format
// Show: Everything (all info + full pipeline + all ratings)
// Any size
// CSS: export-templates.css
```

---

### **JOur 5: Generators (4h)**

#### **4.1: Create generateHTML.js** (2h)
```javascript
// Takes: review data + template + customization
// Returns: HTML string ready to render
// Handles: Colors, fonts, layout, images
// Validates: All required fields present
```

#### **4.2: Create generatePNG.js** (1h)
```javascript
// Uses: html-to-image library
// Converts: HTML → PNG canvas → download
// Options: 150 or 300 dpi
```

#### **4.3: Create generatePDF.js** (1h)
```javascript
// Uses: jsPDF library
// Converts: HTML → PDF
// Options: Page size (A4, etc), margins, compression
```

---

### **Checklist TÂCHE 2**
- [ ] ExportMaker.jsx structure complete
- [ ] All 5 step components created
- [ ] All 3 templates created
- [ ] HTML generator working
- [ ] PNG generator working
- [ ] PDF generator working
- [ ] Preview system responsive
- [ ] Customization persists across steps
- [ ] Download works correctly
- [ ] Mobile/responsive design
- [ ] No console errors
- [ ] Tested with Fleur review data

---

## 📚 TÂCHE 3: LIBRARY BASE (12 heures)

### **JOur 3-4: Database & API (6h)**

#### **5.1: Update Prisma Schema** (2h)
```prisma
// Add/update models:
- Review (if not exists)
- Cultivar
- SavedDataItem
- TechnicalSheet
- ExportTemplate (already exists in Account)

// Run migration
npm run prisma:migrate
```

#### **5.2: Create Backend API** (4h)
```javascript
// server-new/routes/library.js

// Endpoints:
GET    /api/library/reviews
POST   /api/library/reviews
GET    /api/library/reviews/:id
PATCH  /api/library/reviews/:id
DELETE /api/library/reviews/:id

GET    /api/library/cultivars
POST   /api/library/cultivars
// ... (CRUD for all)

GET    /api/library/saved-data/:category
POST   /api/library/saved-data
// ... (CRUD for all)
```

---

### **JOur 5: Frontend Library (6h)**

#### **6.1: Create LibraryPage.jsx** (2h)
```javascript
// Main library page wrapper
// Navigation: Sidebar + main area
// Responsive layout
```

#### **6.2: Create ReviewsSection.jsx** (2h)
```javascript
// Display saved reviews
// Grid/list/timeline view options
// Filters: type, date, rating
// Search box
// Actions: edit, duplicate, export, delete
```

#### **6.3: Create CultivarsSection.jsx** (1h)
```javascript
// Display cultivars library
// Cards with photo + info
// Actions: edit, view genealogy, delete
```

#### **6.4: Create SavedDataSection.jsx** (1h)
```javascript
// Quick access to:
// - Frequent cultivars
// - Substrat presets
// - Fertilizer profiles
// - Equipment list
// Actions: add, edit, delete
```

---

### **Checklist TÂCHE 3**
- [ ] Prisma models created
- [ ] Database migrations successful
- [ ] All API endpoints working
- [ ] ReviewsSection displays reviews
- [ ] CultivarsSection displays cultivars
- [ ] SavedDataSection displays saved data
- [ ] CRUD operations all working
- [ ] Search & filter working
- [ ] Responsive design
- [ ] No console errors
- [ ] API returns correct data types

---

## 🧪 TÂCHE 4: TESTING (8 heures)

### **JOur 5: Testing Sprint** (8h)

#### **Manual Testing**
- [ ] Test account type routing (Amateur/Prod/Inf see different tabs)
- [ ] Test profile save/load
- [ ] Test subscription display correct tier
- [ ] Test security features accessible
- [ ] Test payment form (Amateur can't see)
- [ ] Test company form (Producteur only)
- [ ] Test KYC upload UI
- [ ] Test export flow for Fleur review
- [ ] Test PNG generation
- [ ] Test PDF generation
- [ ] Test library list/add/delete
- [ ] Test cultivar management
- [ ] Test saved data quick access
- [ ] Mobile responsive test
- [ ] No console errors

#### **Integration Testing**
- [ ] Flow: Account → Review → Export → Download
- [ ] Flow: Cultivar add → Save → Library list → Use in review
- [ ] Flow: Create profile → Upload KYC → Verify status display

#### **Cross-browser Testing**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## 🎯 DAILY CHECKLIST

### **Jour 1 (22 jan)**
- [ ] Setup environment & git branch
- [ ] Create AccountPageLayout
- [ ] Update ProfileSection
- [ ] Create SubscriptionSection
- [ ] Create SecuritySection
- [ ] Commit: "feat: Account page structure"

### **Jour 2 (23 jan)**
- [ ] Create PaymentSection + CompanySection
- [ ] Create KycSection + WatermarkSection
- [ ] Create TemplateSection
- [ ] Create ExportMaker.jsx
- [ ] Commit: "feat: Account advanced sections + ExportMaker core"

### **Jour 3 (24 jan)**
- [ ] Create all 5 step components
- [ ] Create template components (Compact, Detailed, Complete)
- [ ] Update Prisma schema
- [ ] Create library API endpoints
- [ ] Commit: "feat: ExportMaker steps + Library API"

### **Jour 4 (25 jan)**
- [ ] Create HTML/PNG/PDF generators
- [ ] Create LibraryPage + ReviewsSection
- [ ] Create CultivarsSection + SavedDataSection
- [ ] Test account → export flow
- [ ] Commit: "feat: ExportMaker generators + Library UI"

### **Jour 5 (26 jan)**
- [ ] Full manual testing (all flows)
- [ ] Cross-browser testing
- [ ] Mobile responsive tests
- [ ] Fix bugs & console errors
- [ ] Commit: "test: Sprint 2 validation"
- [ ] Prepare merge to main

---

## 🚨 COMMON ISSUES & SOLUTIONS

```
Issue: Account type not showing in tabs
Solution: Verify accountType in useStore is set correctly
         Check extractAccountType function in useStore

Issue: ExportMaker preview blank
Solution: Check HTML generator returns valid HTML
         Check image paths are absolute URLs
         Check CSS is properly scoped

Issue: Library API returns 401
Solution: Check authentication middleware on routes
         Verify user ID in JWT token
         Check permission checks in API

Issue: Forms not saving
Solution: Check API endpoint URLs match backend routes
         Verify request body format matches schema
         Check error handling on frontend
```

---

## 📝 COMMIT STRATEGY

```
Daily commits:
git add .
git commit -m "feat: [TÂCHE] [section] - [description]"

Example:
git commit -m "feat: TÂCHE 1 - Account Profile section complete"
git commit -m "feat: TÂCHE 2 - ExportMaker step components"
git commit -m "feat: TÂCHE 3 - Library API endpoints"
```

---

## 🎬 READY TO START?

```
✅ Environment setup complete
✅ All documentation reviewed
✅ Team ready
✅ Git branch created
✅ Development server running

STARTING SPRINT 2 NOW!
```

---

**Good luck! 🚀**

Questions? Check:
- PLAN_ACCOUNT_PAGE_REFONTE.md (Account details)
- PLAN_EXPORTMAKER_UNIFIEE.md (Export details)
- PLAN_LIBRARY_COMPLETE.md (Library details)
- PLAN_EXECUTION_FINAL.md (Full timeline)

---

**Estimated Completion**: Jan 26, 2026  
**Next Phase**: SPRINT 3 (Feb starting)

---
