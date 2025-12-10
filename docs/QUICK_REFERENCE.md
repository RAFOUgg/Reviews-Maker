# Quick Reference - Système de Gestion de Compte

**Implémentation complète:** Décembre 10, 2025

---

## 🗺️ Carte Mentale du Système

```
┌─────────────────────────────────────────────────────────────┐
│  USER FLOW - Nouveau Utilisateur                            │
└─────────────────────────────────────────────────────────────┘

Login → Auth Callback → Home
    ↓
[AgeVerification Modal]
    - Saisir date de naissance
    - Sélectionner pays (FR/US/CA)
    - POST /api/legal/verify-age
    - Si underage → block access
    - Si legal → next step
    ↓
[ConsentModal - RDR]
    - Lire avertissement
    - Accepter → POST /api/legal/consent
    ↓
[AccountSelector Modal]
    - Choisir type de compte
    - 4 options disponibles
    - localStorage.preferredAccountType
    ↓
[Home Page]
    - Accès au site déverrouillé
    - Profil accessible via avatar menu

┌─────────────────────────────────────────────────────────────┐
│  USER FLOW - Utilisateur Existant                          │
└─────────────────────────────────────────────────────────────┘

Login → Auth Callback → Home
    ↓
[Utilisateur vérifié?]
    - Si OUI → Home directement
    - Si NON → Vérification d'âge (reflo)
    ↓
[Avatar Menu (top-right)]
    - "Mon Profil" → /profile
    ↓
[ProfilePage]
    - Onglet Info: édition username, email, thème
    - Onglet Légal: CGU, Mentions
    - Onglet Sécurité: 2FA (future)
```

---

## 📍 Quick Navigation

### Frontend Components
```
client/src/
├── components/
│   ├── account/
│   │   ├── AccountSelector.jsx ← Sélection compte
│   │   └── ThemeModal.jsx ← Sélection thème
│   ├── legal/
│   │   ├── AgeVerification.jsx ← Vérification d'âge
│   │   ├── TermsModal.jsx ← CGU
│   │   ├── LegalNoticeModal.jsx ← Mentions légales
│   │   └── ConsentModal.jsx ← Consentement RDR
│   └── UserProfileDropdown.jsx ← Menu profil
├── pages/
│   └── ProfilePage.jsx ← Page profil
└── App.jsx ← Routes + Modales

Key Props:
- AccountSelector: isOpen, onAccountSelected
- ProfilePage: (automatic - uses useAuth)
- TermsModal: isOpen, onClose, onAccept
- ThemeModal: isOpen, onClose, currentTheme, onThemeChange
```

### Backend Routes
```
server-new/routes/
├── account.js
│   ├── GET /api/account/info (existant)
│   ├── GET /api/account/types (existant)
│   ├── POST /api/account/change-type (existant)
│   ├── PUT /api/account/update ✨ NEW
│   ├── GET /api/account/profile ✨ NEW
│   └── GET /api/account/multiple ✨ NEW
│
└── legal.js
    ├── POST /api/legal/verify-age (existant)
    ├── POST /api/legal/consent (existant)
    ├── GET /api/legal/countries (existant)
    ├── GET /api/legal/terms ✨ NEW
    ├── GET /api/legal/privacy ✨ NEW
    ├── GET /api/legal/notice ✨ NEW
    └── POST /api/legal/consent (update) ✨ ENHANCED
```

---

## 🔑 Fichiers Clés par Fonctionnalité

### Vérification d'Âge
```
Frontend:
- AgeVerification.jsx (modal)
- App.jsx (condition needsAgeVerification)

Backend:
- legal.js → POST /api/legal/verify-age
- legal.js → GET /api/legal/countries
- config/legal.js → calculateLegalAge()

Flow:
1. User login → AgeVerification modal appears
2. Fill birthdate + country
3. POST /api/legal/verify-age
4. Backend validates via calculateLegalAge()
5. Update user.legalAge = true
6. Redirect to ConsentModal
```

### Sélection Type de Compte
```
Frontend:
- AccountSelector.jsx (modal - NEW)
- App.jsx (condition needsAccountTypeSelection)

Backend:
- account.js → GET /api/account/types
- account.js → POST /api/account/change-type

Flow:
1. After consent → AccountSelector modal
2. User picks tier (Consumer, Influencer, etc)
3. POST /api/account/change-type (optional)
4. localStorage.preferredAccountType saved
5. Redirect to home
```

### Profil Utilisateur
```
Frontend:
- ProfilePage.jsx (3 onglets)
- UserProfileDropdown.jsx (link to profile)
- ThemeModal.jsx (theme selector)

Backend:
- account.js → GET /api/account/profile
- account.js → PUT /api/account/update

Flow:
1. Click avatar → "Mon Profil"
2. ProfilePage loads (fetch /api/account/info)
3. Show current data (username, email, theme, etc)
4. Click "Modifier" → editable inputs
5. PUT /api/account/update
6. Page refresh, data persists
```

### Contenus Légaux
```
Frontend:
- TermsModal.jsx (CGU)
- LegalNoticeModal.jsx (Mentions)
- ProfilePage.jsx → Onglet Légal

Backend:
- legal.js → GET /api/legal/terms
- legal.js → GET /api/legal/privacy
- legal.js → GET /api/legal/notice

Flow:
1. ProfilePage onglet "Légal"
2. Fetch /api/legal/terms, /notice
3. Display in modales/cards
4. User can read, scroll, accept
```

---

## 🧬 Data Models

### User Schema (Prisma)
```prisma
model User {
  // Auth
  id String @id @default(uuid())
  discordId String? @unique
  googleId String? @unique
  username String
  email String?
  avatar String?

  // Legal Verification
  birthdate DateTime?           // DD validated
  country String?               // ISO 2-letter code
  region String?                // State/Province
  legalAge Boolean @default(false)
  
  // Consent
  consentRDR Boolean @default(false)
  consentDate DateTime?

  // Preferences
  theme String @default("violet-lean")
  locale String @default("fr")
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### API Response Examples
```json
// GET /api/account/profile
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "avatar": "https://cdn.discord...",
  "theme": "violet-lean",
  "locale": "fr",
  "accountType": "consumer",
  "legalAge": true,
  "consentRDR": true,
  "createdAt": "2025-12-10T00:00:00Z"
}

// PUT /api/account/update (request)
{
  "username": "new_name",
  "email": "new@email.com",
  "theme": "emerald",
  "locale": "en"
}

// POST /api/legal/verify-age (request)
{
  "birthdate": "1990-01-01",
  "country": "FR",
  "region": null
}

// POST /api/legal/consent (request)
{
  "terms": true,
  "privacy": true,
  "rdr": true
}
```

---

## 🎨 UI Components

### Colors Used
```css
Primary: #9333EA (Violet)
Accent: #DB2777 (Rose)
Background: #C4B5FD (Violet Light)
Text: #0F172A (Dark Gray)
Border: #4C1D95 (Violet Dark)
Success: #10B981 (Green)
Warning: #F97316 (Orange)
Error: #DC2626 (Red)
```

### Component Sizes
```
Modal: max-w-2xl (768px)
Card: p-6 (padding)
Input: px-4 py-3
Button: px-6 py-3
Avatar: w-32 h-32 (profile), w-10 h-10 (header)
```

### Responsive Breakpoints
```
Mobile: < 640px
Tablet: 640px - 1024px
Desktop: > 1024px

Profile: grid-cols-1 md:grid-cols-2
Forms: w-full (mobile), max-w-2xl (desktop)
```

---

## 🐛 Common Issues & Solutions

### Pop-up doesn't appear
```javascript
// Check in browser console
console.log('needsAgeVerification:', needsAgeVerification)
// Should be true after first login

// Check local storage
localStorage.getItem('legalAge')
// Should be empty for new users
```

### API returns 401 Unauthorized
```bash
# Session expired or invalid
# Clear storage and re-login
localStorage.clear()
sessionStorage.clear()

# Check cookies exist
document.cookie
# Should contain "sid=..."
```

### Profil doesn't save
```bash
# Check endpoint response
curl -X PUT http://localhost:3000/api/account/update \
  -d '{"username": "test"}'

# Look for validation errors:
# - username already taken
# - email already taken
# - invalid theme value
```

### Theme not applying
```javascript
// Force theme reapply
const root = document.documentElement
root.setAttribute('data-theme', 'emerald')
root.classList.remove('dark')

// Check CSS variables loaded
console.log(getComputedStyle(root).getPropertyValue('--primary'))
// Should output #9333EA (or other theme color)
```

---

## 📊 Database Queries

### Check verification status
```sql
SELECT id, username, legalAge, country, region, consentRDR, theme
FROM users
WHERE id = 'userid';
```

### Update user theme
```sql
UPDATE users
SET theme = 'emerald'
WHERE id = 'userid';
```

### List all verified users
```sql
SELECT COUNT(*) FROM users
WHERE legalAge = true AND consentRDR = true;
```

### Check user's country distribution
```sql
SELECT country, COUNT(*) as total
FROM users
WHERE legalAge = true
GROUP BY country
ORDER BY total DESC;
```

---

## 📱 Testing Checklist

### Frontend Tests
- [ ] Age verification modal appears on login
- [ ] Can select country and date
- [ ] Age validation works (reject underage)
- [ ] Account selector shows 4 tiers
- [ ] Profile page loads and edits work
- [ ] Theme change applies immediately
- [ ] Legal docs readable and scrollable
- [ ] Responsive on mobile (375px), tablet, desktop

### Backend Tests
- [ ] GET /api/account/profile returns 200
- [ ] PUT /api/account/update saves to DB
- [ ] POST /api/legal/verify-age validates age
- [ ] GET /api/legal/terms returns full content
- [ ] POST /api/legal/consent updates consentRDR
- [ ] All endpoints require authentication
- [ ] Error responses are meaningful (400, 401, 403)

### Database Tests
- [ ] User.legalAge set to true after verification
- [ ] User.consentRDR set after consent
- [ ] User.birthdate stored correctly
- [ ] User.country updated properly
- [ ] User.theme saves and loads

---

## 🚀 Deployment Checklist

- [ ] All files committed to git
- [ ] No console.log() left in production code
- [ ] Environment variables set on server
- [ ] Database backed up before deploy
- [ ] Frontend built: `npm run build`
- [ ] Backend restarted: `pm2 restart reviews-backend`
- [ ] Health check: all endpoints responding
- [ ] Manual tests passed (15-min test guide)
- [ ] Monitoring alerts set up
- [ ] Rollback plan documented

---

## 📞 Contact & Support

For issues or questions:
1. Check browser console for errors
2. Check network tab for API responses
3. Check PM2 logs: `pm2 logs reviews-backend`
4. Check database integrity: `sqlite3 db.sqlite "PRAGMA integrity_check"`
5. Review documentation files in `docs/`

---

**Last Updated:** 2025-12-10  
**Status:** ✅ Production Ready  
**Version:** 1.0.0
