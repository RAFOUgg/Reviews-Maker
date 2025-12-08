# 🐛 Troubleshooting & Fixes - Reviews-Maker MVP

**Guide complet de résolution des problèmes courants**  
**Version:** 1.0.0  
**Date:** 7 décembre 2025  

---

## 📋 Table des Matières

1. [Problèmes Installation](#problèmes-installation)
2. [Problèmes Authentification](#problèmes-authentification)
3. [Problèmes Base de Données](#problèmes-base-de-données)
4. [Problèmes Frontend](#problèmes-frontend)
5. [Problèmes Backend](#problèmes-backend)
6. [Problèmes Déploiement](#problèmes-déploiement)
7. [Fixes Prioritaires](#fixes-prioritaires)
8. [Diagnostic Avancé](#diagnostic-avancé)

---

## 🔧 Problèmes Installation

### ❌ `npm install` échoue

**Symptômes :**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE could not resolve dependency
```

**Causes probables :**
- Conflit versions dépendances
- Cache npm corrompu
- Node.js version incompatible

**Solutions :**

```powershell
# 1. Vérifier version Node.js
node --version  # Doit être ≥ 18.0.0

# Si version < 18
# Télécharger depuis https://nodejs.org/ (LTS)

# 2. Nettoyer cache npm
npm cache clean --force

# 3. Supprimer node_modules et package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 4. Réinstaller
npm install

# 5. Si toujours en échec, forcer résolution
npm install --legacy-peer-deps
```

---

### ❌ Prisma génération échoue

**Symptômes :**
```
Error: P1003: Database does not exist
```

**Solutions :**

```powershell
cd server-new

# 1. Vérifier DATABASE_URL dans .env
cat .env | Select-String "DATABASE_URL"

# 2. Créer dossier db si inexistant
New-Item -ItemType Directory -Path "../db" -Force

# 3. Régénérer Prisma client
npx prisma generate

# 4. Créer base de données
npx prisma migrate dev --name init

# 5. Vérifier création
Test-Path "../db/reviews.sqlite"  # Doit retourner True
```

---

## 🔐 Problèmes Authentification

### ❌ OAuth Discord redirect loop infini

**Symptômes :**
- User clique "Se connecter avec Discord"
- Autorise l'app Discord
- Redirect vers app → redirect Discord → boucle

**Causes :**
- FRONTEND_URL incorrect dans `.env`
- Callback URL mal configuré
- Cookies bloqués

**Solutions :**

```powershell
# 1. Vérifier .env backend
cd server-new
cat .env

# Doit contenir :
# FRONTEND_URL=http://localhost:5173
# DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# 2. Vérifier Discord Developer Portal
# https://discord.com/developers/applications
# OAuth2 → Redirects doit contenir EXACTEMENT :
# http://localhost:3000/api/auth/discord/callback

# 3. Tester cookies navigateur
# F12 → Application → Cookies → localhost:3000
# Doit voir cookie "sessionId"

# 4. Si cookies bloqués, autoriser dans navigateur
# Chrome : chrome://settings/cookies
# Edge : edge://settings/content/cookies
# Autoriser tous les cookies (au moins en dev)
```

---

### ❌ Session non persistante après login

**Symptômes :**
- User se connecte avec succès
- Page refresh → User déconnecté

**Causes :**
- SESSION_SECRET manquant
- express-session mal configuré
- Cookies httpOnly non envoyés

**Solutions :**

```powershell
# 1. Vérifier SESSION_SECRET dans .env
cd server-new
cat .env | Select-String "SESSION_SECRET"

# Si absent ou vide, générer un secret :
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copier résultat dans .env :
# SESSION_SECRET="le_secret_genere_ici"

# 2. Vérifier configuration session dans server.js
# Doit contenir :
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,  # 7 jours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
}))

# 3. Tester session
# Terminal 1 : npm run dev
# Terminal 2 :
curl -c cookies.txt http://localhost:3000/api/auth/discord
curl -b cookies.txt http://localhost:3000/api/auth/me
# Doit retourner user, pas 401
```

---

### ❌ Erreur "401 Unauthorized" sur toutes requêtes API

**Symptômes :**
```javascript
fetch('/api/reviews/my')  // → 401 Unauthorized
```

**Causes :**
- `credentials: 'include'` manquant dans fetch
- CORS mal configuré
- Session expirée

**Solutions :**

```javascript
// 1. TOUJOURS inclure credentials dans fetch
const res = await fetch('/api/reviews/my', {
    credentials: 'include'  // ← ESSENTIEL pour cookies
})

// 2. Vérifier CORS backend (server.js)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true  // ← Doit être true
}))

// 3. Vérifier session côté serveur
// Ajouter logs dans middleware auth :
export const requireAuth = (req, res, next) => {
    console.log('[AUTH]', {
        isAuthenticated: req.isAuthenticated(),
        sessionID: req.sessionID,
        user: req.user
    })
    
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'unauthorized' })
    }
    next()
}
```

---

## 💾 Problèmes Base de Données

### ❌ Erreur Prisma "P2002: Unique constraint failed"

**Symptômes :**
```
PrismaClientKnownRequestError: 
Invalid `prisma.user.create()` invocation:
Unique constraint failed on the fields: (`discordId`)
```

**Cause :**
Tentative de créer un user avec discordId déjà existant.

**Solutions :**

```javascript
// Utiliser upsert au lieu de create
const user = await prisma.user.upsert({
    where: { discordId: profile.id },
    update: {
        username: profile.username,
        avatar: profile.avatar
    },
    create: {
        discordId: profile.id,
        username: profile.username,
        avatar: profile.avatar,
        email: profile.email
    }
})
```

---

### ❌ Migrations Prisma en conflit

**Symptômes :**
```
Error: P3005: The database schema is not empty. Prisma Migrate cannot be used on a database with an existing schema.
```

**Solutions :**

```powershell
cd server-new

# Option 1 : Reset DB (ATTENTION : Perd toutes données)
npx prisma migrate reset

# Option 2 : Résoudre manuellement migration
npx prisma migrate resolve --applied "migration_name"

# Option 3 : Créer migration baseline
npx prisma migrate dev --create-only --name baseline
# Éditer migration générée, supprimer lignes conflictuelles
npx prisma migrate deploy
```

---

### ❌ DB locked (SQLite)

**Symptômes :**
```
Error: SQLITE_BUSY: database is locked
```

**Cause :**
Plusieurs processus accèdent simultanément à SQLite.

**Solutions :**

```powershell
# 1. Vérifier processus Node.js multiples
Get-Process node

# Si plusieurs, tuer tous sauf un :
Stop-Process -Name node -Force

# 2. Supprimer fichiers lock
Remove-Item "../db/reviews.sqlite-journal" -ErrorAction SilentlyContinue

# 3. En production, migrer vers PostgreSQL
# SQLite ne supporte qu'un seul writer à la fois
```

---

## 🎨 Problèmes Frontend

### ❌ Page blanche après build

**Symptômes :**
- `npm run dev` → OK
- `npm run build && npm run preview` → Page blanche

**Causes :**
- Chemins absolus au lieu de relatifs
- Import manquant
- Erreur JavaScript non catchée

**Solutions :**

```powershell
# 1. Vérifier console navigateur (F12)
# Noter erreurs JavaScript

# 2. Vérifier vite.config.js
# Doit contenir base: '/' en dev, base: '/reviews' si sous-chemin prod

# 3. Build avec sourcemaps pour debug
npm run build -- --sourcemap

# 4. Tester preview
npm run preview
# Ouvrir http://localhost:4173 → F12 Console
```

---

### ❌ Images ne s'affichent pas

**Symptômes :**
```html
<img src="/images/abc123.jpg" alt="Review" />
<!-- → 404 Not Found -->
```

**Causes :**
- Route `/images` mal configurée
- Permissions fichiers
- Chemins absolus vs relatifs

**Solutions :**

```javascript
// Backend : Vérifier route static (server.js)
app.use('/images', express.static(path.join(__dirname, '../db/review_images')))

// Tester accès direct
// http://localhost:3000/images/nom_fichier.jpg

// Frontend : Construire URL correcte
const imageUrl = `${import.meta.env.VITE_API_URL}/images/${review.mainImage}`
<img src={imageUrl} alt={review.holderName} />
```

```powershell
# Vérifier permissions dossier
ls -l ../db/review_images/

# Si permission denied, corriger :
chmod -R 755 ../db/review_images/
```

---

### ❌ Traductions i18n manquantes

**Symptômes :**
```
{t('auth.login.title')}  # → Affiche "auth.login.title" au lieu du texte
```

**Solutions :**

```javascript
// 1. Vérifier fichier i18n/fr.json contient la clé
{
  "auth": {
    "login": {
      "title": "Connexion"
    }
  }
}

// 2. Vérifier import i18n dans App.jsx
import './i18n/i18n'

// 3. Vérifier namespace correct
const { t } = useTranslation('translation')  // Namespace par défaut

// 4. Fallback pour clés manquantes
i18next.init({
  fallbackLng: 'fr',
  debug: true  // Logs clés manquantes en console
})
```

---

## ⚙️ Problèmes Backend

### ❌ Multer upload échoue

**Symptômes :**
```
Error: ENOENT: no such file or directory, open 'uploads/...'
```

**Solutions :**

```powershell
# 1. Créer dossier uploads
New-Item -ItemType Directory -Path "uploads" -Force

# 2. Vérifier config Multer (routes/reviews.js)
const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 10 * 1024 * 1024 },  # 10 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only images allowed'))
        }
    }
})

# 3. Tester upload
curl -X POST http://localhost:3000/api/reviews \
  -F "holderName=Test" \
  -F "type=Weed" \
  -F "images=@./test.jpg"
```

---

### ❌ Rate limiting trop agressif

**Symptômes :**
```
429 Too Many Requests
Retry-After: 60
```

**Cause :**
Trop de requêtes depuis même IP (rate limit atteint).

**Solutions :**

```javascript
// Ajuster limite dans middleware/ratelimit.js
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,  // ← Augmenter de 5 à 10 en dev
    message: { error: 'too_many_requests', retryAfter: 15 }
})

// Désactiver en dev si gênant
if (process.env.NODE_ENV !== 'production') {
    authLimiter.max = 1000  // Très permissif en dev
}
```

---

### ❌ Winston logs non écrits

**Symptômes :**
- `console.log()` fonctionne
- `logger.info()` ne produit rien

**Solutions :**

```javascript
// Vérifier config Winston (config/logger.js)
import winston from 'winston'

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),  // ← Console en dev
        new winston.transports.File({ filename: 'server.log' })
    ]
})

// Utiliser
logger.info('User logged in', { userId: user.id })
logger.error('Database error', { error: err.message })
```

---

## 🚀 Problèmes Déploiement

### ❌ PM2 process crash au démarrage

**Symptômes :**
```bash
pm2 start ecosystem.config.cjs
# → Status: errored
```

**Solutions :**

```bash
# 1. Vérifier logs PM2
pm2 logs reviews-maker --lines 50

# 2. Causes courantes :
# - .env manquant ou mal configuré
# - PORT déjà utilisé
# - Permissions fichiers DB

# 3. Tester démarrage manuel
cd server-new
node server.js
# Noter erreur exacte

# 4. Vérifier ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'reviews-maker',
    script: './server.js',
    cwd: './server-new',  # ← Chemin correct
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}

# 5. Restart avec env
pm2 restart reviews-maker --update-env
```

---

### ❌ Nginx 502 Bad Gateway

**Symptômes :**
Site affiche "502 Bad Gateway" au lieu de l'app.

**Causes :**
- Backend Node.js non démarré
- Mauvais port proxy_pass
- Firewall bloque connexion

**Solutions :**

```bash
# 1. Vérifier backend écoute sur bon port
ss -tlnp | grep 3000  # Doit voir Node.js sur :3000

# 2. Tester backend directement
curl http://127.0.0.1:3000/api/health
# Doit retourner JSON {"status":"ok"}

# 3. Vérifier config Nginx
sudo nano /etc/nginx/sites-available/reviews-maker

# proxy_pass doit pointer vers http://127.0.0.1:3000 (pas localhost!)

# 4. Tester config Nginx
sudo nginx -t

# 5. Recharger Nginx
sudo systemctl reload nginx

# 6. Logs Nginx
sudo tail -f /var/log/nginx/error.log
```

---

### ❌ Certificat SSL Certbot échoue

**Symptômes :**
```
Failed authorization procedure. reviews-maker.fr (http-01): unauthorized
```

**Solutions :**

```bash
# 1. Vérifier DNS pointe vers serveur
nslookup reviews-maker.fr
# Doit retourner IP de votre VPS

# 2. Vérifier port 80 ouvert
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 3. Arrêter Nginx temporairement
sudo systemctl stop nginx

# 4. Obtenir certificat en standalone
sudo certbot certonly --standalone -d reviews-maker.fr

# 5. Redémarrer Nginx
sudo systemctl start nginx

# 6. Configurer renouvellement auto
sudo certbot renew --dry-run
```

---

## 🔥 Fixes Prioritaires

### Fix #1 : Migration Schema Prisma OAuth Multi-Providers

**Priorité** : 🔴 Critique  
**Temps estimé** : 30 min  

```prisma
// server-new/prisma/schema.prisma
model User {
  // ... champs existants
  
  // 🆕 Ajouter OAuth providers
  googleId      String?  @unique
  appleId       String?  @unique
  amazonId      String?  @unique
  facebookId    String?  @unique
  
  // 🆕 Email backup
  emailBackup   String?
  
  // 🆕 TOTP
  totpSecret    String?
  totpEnabled   Boolean  @default(false)
  
  // 🆕 Légal
  birthdate     DateTime?
  country       String?
  region        String?
  legalAge      Boolean  @default(false)
  consentRDR    Boolean  @default(false)
  consentDate   DateTime?
  
  // 🆕 Rôles
  roles         String   @default("consumer")  // JSON: ["consumer","influencer"]
  isBanned      Boolean  @default(false)
  bannedAt      DateTime?
  banReason     String?
  
  // 🆕 Préférences
  locale        String   @default("fr")
  theme         String   @default("violet-lean")
}
```

```powershell
# Appliquer migration
cd server-new
npx prisma migrate dev --name add_oauth_legal_rbac_fields
npx prisma generate
```

---

### Fix #2 : Créer Middleware Legal

**Priorité** : 🔴 Critique  
**Temps estimé** : 45 min  

```javascript
// server-new/middleware/legal.js
export const verifyLegalAge = async (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next()  // Auth check géré par requireAuth
    }
    
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { legalAge, consentRDR }
    })
    
    if (!user.legalAge) {
        return res.status(403).json({
            error: 'age_verification_required',
            message: 'You must verify your age to access this content'
        })
    }
    
    if (!user.consentRDR) {
        return res.status(403).json({
            error: 'consent_required',
            message: 'You must accept RDR policy to proceed'
        })
    }
    
    next()
}

// Pays autorisés
export const LEGAL_COUNTRIES = [
    'FR', 'DE', 'ES', 'PT', 'IT', 'NL', 'BE', 'CH',  // Europe
    'CA',  // Canada
    'US'   // USA (états spécifiques)
]

export const US_LEGAL_STATES_21 = [
    'CA', 'WA', 'OR', 'NV', 'CO', 'IL', 'MA', 'MI', 'AZ', 'NJ', 'NY', 'MT'
]

export function calculateLegalAge(birthdate, country, region = null) {
    const age = Math.floor((new Date() - new Date(birthdate)) / 31557600000)  // ms/year
    
    // USA : 21 ans dans certains états
    if (country === 'US' && US_LEGAL_STATES_21.includes(region)) {
        return age >= 21
    }
    
    // Par défaut : 18 ans
    return age >= 18
}
```

---

### Fix #3 : Créer Composant RDRBanner

**Priorité** : 🔴 Critique  
**Temps estimé** : 30 min  

```jsx
// client/src/components/legal/RDRBanner.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

export default function RDRBanner() {
    const { t } = useTranslation()
    const [isVisible, setIsVisible] = useState(false)
    
    useEffect(() => {
        // Vérifier si user a déjà fermé le banner (session)
        const dismissed = sessionStorage.getItem('rdr_banner_dismissed')
        if (!dismissed) {
            setIsVisible(true)
        }
    }, [])
    
    const handleDismiss = () => {
        sessionStorage.setItem('rdr_banner_dismissed', 'true')
        setIsVisible(false)
    }
    
    if (!isVisible) return null
    
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur text-black p-3">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <p className="text-sm font-medium">
                    {t('legal.rdr.message')}
                    {' '}
                    <a href="/legal" className="underline font-semibold">
                        {t('legal.rdr.learn_more')}
                    </a>
                </p>
                <button 
                    onClick={handleDismiss}
                    className="p-1 hover:bg-yellow-600 rounded transition"
                    aria-label={t('common.close')}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
```

```json
// client/src/i18n/fr.json
{
  "legal": {
    "rdr": {
      "message": "⚠️ Le cannabis est réglementé dans votre région. Consommez de manière responsable et conformément aux lois locales.",
      "learn_more": "En savoir plus"
    }
  }
}
```

---

### Fix #4 : Créer Modal Age Verification

**Priorité** : 🔴 Critique  
**Temps estimé** : 1h  

```jsx
// client/src/components/legal/AgeVerification.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../../store/useStore'

export default function AgeVerification({ onVerified }) {
    const { t } = useTranslation()
    const user = useStore((state) => state.user)
    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('FR')
    const [error, setError] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    const countries = [
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Allemagne' },
        { code: 'ES', name: 'Espagne' },
        { code: 'CA', name: 'Canada' },
        { code: 'US', name: 'États-Unis' }
    ]
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)
        
        try {
            const res = await fetch('/api/legal/verify-age', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ birthdate, country })
            })
            
            const data = await res.json()
            
            if (!res.ok) {
                if (data.error === 'underage') {
                    setError(t('legal.age.error_underage'))
                } else {
                    setError(data.message || t('common.error_occurred'))
                }
                return
            }
            
            // Succès
            onVerified()
        } catch (err) {
            setError(t('common.error_occurred'))
        } finally {
            setIsSubmitting(false)
        }
    }
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="glass rounded-2xl p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4">
                    {t('legal.age.title')}
                </h2>
                <p className="text-dark-muted mb-6">
                    {t('legal.age.description')}
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="birthdate" className="block text-sm font-medium mb-2">
                            {t('legal.age.birthdate')}
                        </label>
                        <input 
                            type="date"
                            id="birthdate"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                            className="input w-full"
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium mb-2">
                            {t('legal.age.country')}
                        </label>
                        <select 
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            className="input w-full"
                        >
                            {countries.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500 text-red-600 p-3 rounded">
                            {error}
                        </div>
                    )}
                    
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full"
                    >
                        {isSubmitting ? t('common.loading') : t('legal.age.verify')}
                    </button>
                </form>
            </div>
        </div>
    )
}
```

---

### Fix #5 : Setup i18n Basique

**Priorité** : 🟡 Important  
**Temps estimé** : 45 min  

```javascript
// client/src/i18n/i18n.js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import fr from './fr.json'
import en from './en.json'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            fr: { translation: fr },
            en: { translation: en }
        },
        fallbackLng: 'fr',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false
        }
    })

export default i18n
```

```javascript
// client/src/main.jsx
import './i18n/i18n'  // ← Importer AVANT App
import App from './App'
```

---

## 🔍 Diagnostic Avancé

### Activer Debug Mode Complet

```powershell
# Backend : Logs verbeux
$env:NODE_ENV="development"
$env:DEBUG="express:*,passport:*"
cd server-new
npm run dev

# Frontend : React DevTools + Logs
# F12 → Console
localStorage.setItem('debug', '*')
# Refresh page
```

### Analyser Requêtes Réseau

```javascript
// Intercepter tous les fetch pour debug
const originalFetch = window.fetch
window.fetch = async (...args) => {
    console.log('[FETCH]', args[0], args[1])
    const res = await originalFetch(...args)
    console.log('[RESPONSE]', res.status, res.statusText)
    return res
}
```

### Profiler Performances

```bash
# Backend : Flamegraph avec clinic.js
npm install -g clinic
clinic doctor -- node server.js

# Frontend : Lighthouse CI
npm install -g @lhci/cli
lhci autorun
```

---

**Ce document sera enrichi au fur et à mesure des problèmes rencontrés**  
**Dernière mise à jour** : 7 décembre 2025
