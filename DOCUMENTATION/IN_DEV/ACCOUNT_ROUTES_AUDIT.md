# 🔍 AUDIT DES ROUTES ACCOUNT - STRUCTURE RÉELLE

**Date**: 17 janvier 2026  
**Status**: Pre-refactoring audit

---

## 📍 ROUTES ACTUELLES

### Dans App.jsx
```jsx
<Route path="/stats" element={<StatsPage />} />                     ✅
<Route path="/account" element={<AccountPage />} />                 ✅
<Route path="/manage-subscription" element={<ManageSubscription />} /> ✅
<Route path="/phenohunt" element={<PhenoHuntPage />} />             ✅
<Route path="/genetics" element={<GeneticsManagementPage />} />     ✅
<Route path="/choose-account" element={<AccountChoicePage />} />    ✅
```

❌ **SUPPRIMÉES** (n'existaient pas):
- `/profile-settings` → ProfileSettingsPage (n'existe pas)
- `/settings` → SettingsPage (n'existe pas)

---

## 📄 FILES EXISTANTS

### `/account` Route - AccountPage.jsx (326 lignes)
**Current Implementation**:
- Language selector (FR/EN/ES)
- Preference toggles (6 toggles: notifications, auto-save, visibility, stats, sharing, profile privacy)
- Member since date display
- Account type display (Amateur/Producteur/Influenceur)
- Upgrade button (if Amateur)
- Manage subscription button (if Producteur/Influenceur)
- Logout button
- Save preferences to localStorage

**API Calls**:
```
PATCH /api/account/language
POST /api/auth/logout
```

**Missing Features**:
- KYC management
- Email/username editing
- Avatar upload
- Enterprise info (SIRET, address, company name)
- 2FA setup
- Password change
- Session management
- OAuth linking
- Billing details
- Download data

---

### `/preferences` Route - PreferencesPage.jsx (214 lignes) - **ORPHELINE?**
**Current Implementation**:
- 5-tab interface:
  1. **General** - (Not seen in read)
  2. **Saved-Data** - (Not seen in read)
  3. **Templates** - (Not seen in read)
  4. **Watermarks** - (Not seen in read)
  5. **Export** - (Not seen in read)
- UsageQuotas component (usage statistics)
- Responsive sidebar + main content area

**Status**: 
- File exists but NOT REFERENCED in App.jsx routes!
- Accessible if user navigates directly to `/preferences`
- Unclear if this is dead code or intentional

**API Calls**: Unknown (not reviewed full file)

---

### Other Account Pages
```
✅ StatsPage.jsx      (route: /stats)
✅ PaymentPage.jsx    (route: /payment)
✅ ManageSubscription.jsx (route: /manage-subscription)
✅ AccountChoicePage.jsx (route: /choose-account)
```

---

## 🚨 PROBLEMS IDENTIFIED

### Problem 1: Orphaned PreferencesPage
- File exists but no route in App.jsx
- No way to navigate to it (dead code?)
- Overlaps with AccountPage preferences section

**Solution**: 
- Option A: Remove PreferencesPage entirely
- Option B: Make it a sub-section of AccountPage (tabs inside /account)
- Option C: Create route `/preferences` with redirect from `/account`
- **Recommended**: Option B - Integrate tabs into AccountPage

### Problem 2: Incomplete AccountPage
- Only basic features implemented
- Missing KYC, enterprise data, security, billing
- No structure for enhancement

**Solution**:
- Refactor AccountPage into modular sections
- Create sub-components for each section
- Support lazy-loading if sections get complex

### Problem 3: Missing Links Between Pages
- `/manage-subscription` separate from `/account`
- `/payment` separate from `/account`
- `/stats` separate from `/account`
- User might be confused about where to manage account

**Solution**:
- Create navigation menu in AccountPage or sidebar
- Clear hierarchy: /account as main page with tabs

---

## 🛠️ PROPOSED STRUCTURE

### Option A: Single /account Page with Tabs (RECOMMENDED)
```
/account
├─ Section 1: Profile & Info
│  ├─ Email, username
│  ├─ Avatar
│  ├─ Language selection
│  └─ Member since
├─ Section 2: Enterprise Data (Producteur/Influenceur only)
│  ├─ KYC status
│  ├─ SIRET/Company name
│  └─ Verification documents
├─ Section 3: Preferences (from PreferencesPage)
│  ├─ Tabs: General, Saved-Data, Templates, Watermarks, Export
│  └─ UsageQuotas
├─ Section 4: Billing & Subscription
│  ├─ Link to /manage-subscription
│  └─ Link to /payment
├─ Section 5: Security
│  ├─ Change password
│  ├─ 2FA setup
│  ├─ Sessions
│  └─ OAuth linking
└─ Section 6: Data & Privacy
   ├─ Download data
   ├─ Privacy settings
   └─ Logout button
```

**Routes**:
```
/account                    → AccountPage (main)
/manage-subscription        → Modal or separate page (keeps for billing flow)
/payment                    → Modal or separate page (keeps for billing flow)
/stats                      → Separate page (different purpose)
/preferences                → REMOVED or REDIRECT to /account
```

### Option B: Hierarchical Pages (ALTERNATIVE)
```
/account                      → Main profile page
  └─ /account/preferences     → Sub-route (uses parent layout)
  └─ /account/security       → Sub-route
  └─ /account/billing        → Sub-route
```

---

## ✅ DECISION: Use Option A

**Why**:
- Single page (`/account`) easier to maintain
- All account settings in one place
- Tabs/sections within page for organization
- Clearer UX (less navigation)
- Easier permission checks (all in one place)

**Implementation**:
1. Refactor AccountPage into sections
2. Integrate PreferencesPage tabs into Section 3
3. Remove PreferencesPage file (obsolete)
4. Keep /manage-subscription and /payment as separate routes (billing flows)
5. Integrate /stats access into AccountPage (link or embed)

---

## 🎯 NEXT STEPS

### Phase 1A: Cleanup (1H)
- [x] Remove phantom imports (SettingsPage, ProfileSettingsPage)
- [x] Remove phantom routes
- [ ] Verify build succeeds
- [ ] Check if PreferencesPage is linked anywhere else

### Phase 1B: Plan Refactoring (30 min)
- [ ] Design AccountPage section components
- [ ] Plan state management (preferences, KYC data)
- [ ] Plan API calls needed

### Phase 1C: Execute Refactoring (2-4H)
- [ ] Create section components
- [ ] Integrate PreferencesPage into AccountPage
- [ ] Add KYC, enterprise data sections
- [ ] Add security section
- [ ] Test all routes

---

## 📋 REFERENCES
- AccountPage.jsx: 326 lines (current implementation)
- PreferencesPage.jsx: 214 lines (to be integrated)
- App.jsx: Routes (cleaned, verified)

---

**Status**: Ready for Phase 1A cleanup verification ✅
