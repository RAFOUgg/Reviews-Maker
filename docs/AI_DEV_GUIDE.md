# 🤖 AI Developer Guide - Reviews-Maker V1DEV

**Ce fichier est spécifiquement conçu pour les IA qui vont continuer le développement.**

---

## 🎯 Mission

Vous êtes une IA chargée d'améliorer et maintenir l'application **Reviews-Maker V1DEV**.  
Cette base de code est **propre, fonctionnelle et documentée** pour faciliter votre travail.

---

## 📖 Lecture obligatoire AVANT tout changement

1. **`V1DEV.md`** - Vue d'ensemble complète du projet ⭐
2. **`server-new/prisma/schema.prisma`** - Schéma de base de données
3. **`server-new/routes/`** - Structure des endpoints API
4. **`client/src/`** - Architecture frontend React

---

## 🏗️ Architecture simplifiée

```
┌─────────────┐      HTTP      ┌─────────────┐     Prisma    ┌──────────┐
│   Frontend  │ ◄────────────► │   Backend   │ ◄───────────► │ SQLite   │
│  React/Vite │   REST API     │   Express   │    ORM        │   DB     │
│  Port 5173  │                │  Port 3000  │               │          │
└─────────────┘                └─────────────┘               └──────────┘
       │                              │
       │                              │
       └──────────── Discord ─────────┘
                  OAuth2 Flow
```

---

## 🔑 Points clés de l'architecture

### Frontend (client/)
- **Framework** : React 18 + Vite
- **Routing** : React Router DOM v7
- **State** : Zustand (store global)
- **Styling** : TailwindCSS
- **Auth** : Custom hook `useAuth()` (étendu Phase 2: legal + account)
- **i18n** : react-i18next (FR/EN) ✅
- **OAuth** : Discord (opérationnel), Google (préparé)

### Backend (server-new/)
- **Framework** : Express.js
- **ORM** : Prisma (SQLite dev, PostgreSQL prod)
- **Auth** : Passport.js (Discord ✅, Google ⚠️ credentials manquants)
- **Session** : express-session (cookie httpOnly, 7 jours)
- **Upload** : Multer (images)
- **Legal** : Age verification + RDR consent + country validation
- **Accounts** : 5 types (consumer, influencer_basic/pro, producer, merchant)

### Base de données
- **Type** : SQLite (`db/reviews.sqlite`)
- **ORM** : Prisma Client
- **Migrations** : `npx prisma migrate dev`

---

## 🚦 Avant de modifier du code

### 1. Vérifier l'état actuel
```cmd
CHECK_STATUS.bat
```

### 2. Lire le code existant
```bash
# Backend : routes et logique métier
server-new/routes/auth.js       # Authentification Discord
server-new/routes/reviews.js    # CRUD reviews
server-new/routes/users.js      # Profils utilisateurs

# Frontend : composants principaux
client/src/components/Layout.jsx      # Layout + header
client/src/pages/Home.jsx             # Page d'accueil
client/src/pages/CreateReview.jsx     # Formulaire création
client/src/hooks/useAuth.js           # Hook d'authentification
```

### 3. Comprendre le flow d'authentification (Phase 2)
```
1. User → "Se connecter" → /api/auth/discord (ou /google)
2. Backend → Redirect Discord/Google OAuth2
3. Provider → User autorise → Callback /api/auth/discord/callback
4. Backend → Prisma upsert User → Create session
5. Backend → Redirect frontend /auth/callback
6. Frontend → GET /api/auth/me → Récupère user
7. Frontend → Update Zustand store → User connecté

8. 🆕 Frontend → useAuth checks legal status (legalAge, consentRDR)
9. 🆕 Si needsAgeVerification → Affiche AgeVerification modal
10. 🆕 Si needsConsent → Affiche ConsentModal
11. 🆕 Si needsAccountTypeSelection → Affiche AccountTypeSelector
12. 🆕 POST /api/account/change-type → Update account type
13. 🆕 User accède à l'app (onboarding complet)
```

---

## 📝 Convention de code

### Backend
- **Nommage** : camelCase pour variables, PascalCase pour models Prisma
- **Async/await** : Toujours utiliser try/catch
- **Erreurs** : Renvoyer `{ error: 'message' }` avec status HTTP approprié
- **Logs** : Utiliser `console.log`, `console.error` (TODO: Winston)

### Frontend
- **Composants** : PascalCase, un composant par fichier
- **Hooks** : Préfixe `use`, fichiers dans `hooks/`
- **State** : Zustand pour global, useState pour local
- **Fetch** : Toujours inclure `credentials: 'include'` pour les cookies

---

## 🛠️ Commandes utiles

### Développement
```bash
# Backend
cd server-new
npm run dev              # Lance avec --watch

# Frontend
cd client
npm run dev              # Vite dev server

# Prisma
cd server-new
npx prisma studio        # Interface DB visuelle
npx prisma migrate dev   # Nouvelle migration
npx prisma generate      # Régénérer client
```

### Debug
```powershell
# Logs backend
Get-Content -Path "server-new\server.log" -Tail 50 -Wait

# Tester API
Invoke-RestMethod http://localhost:3000/api/health

# Vérifier processus
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

---

## 🎨 Ajouter une nouvelle fonctionnalité

### Exemple : Ajouter un système de likes

#### 1. Modifier le schéma Prisma
```prisma
// server-new/prisma/schema.prisma
model Like {
  id        Int      @id @default(autoincrement())
  reviewId  Int
  review    Review   @relation(fields: [reviewId], references: [id])
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([reviewId, userId])
}

model Review {
  // ... champs existants
  likes     Like[]
}

model User {
  // ... champs existants
  likes     Like[]
}
```

#### 2. Créer la migration
```bash
cd server-new
npx prisma migrate dev --name add-likes
npx prisma generate
```

#### 3. Ajouter les routes backend
```javascript
// server-new/routes/reviews.js
router.post('/:id/like', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  
  try {
    const like = await prisma.like.create({
      data: {
        reviewId: parseInt(req.params.id),
        userId: req.user.id
      }
    })
    res.json(like)
  } catch (error) {
    res.status(400).json({ error: 'Already liked' })
  }
})
```

#### 4. Ajouter le composant frontend
```jsx
// client/src/components/LikeButton.jsx
export default function LikeButton({ reviewId, likesCount }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(likesCount)
  
  const handleLike = async () => {
    const response = await fetch(`/api/reviews/${reviewId}/like`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (response.ok) {
      setLiked(true)
      setCount(count + 1)
    }
  }
  
  return (
    <button onClick={handleLike} disabled={liked}>
      ❤️ {count}
    </button>
  )
}
```

---

## 🧪 Tester vos modifications

### 1. Tests manuels
```bash
# Redémarrer les serveurs
STOP_DEV.bat
START_SERVER.bat

# Vérifier le statut
CHECK_STATUS.bat
```

### 2. Tests API (PowerShell)
```powershell
# Test GET
Invoke-RestMethod http://localhost:3000/api/reviews

# Test POST
$body = @{
  holderName = "Test"
  type = "Fleur"
  rating = 4.5
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/reviews `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -SessionVariable session
```

### 3. Tests frontend
- Ouvrir http://localhost:5173
- Tester dans la console navigateur (F12)
- Vérifier les requêtes réseau

---

## 🔒 Sécurité - À NE PAS faire

❌ **NE JAMAIS** commit `.env` avec de vrais secrets  
❌ **NE JAMAIS** exposer les tokens/secrets dans les logs  
❌ **NE JAMAIS** faire confiance aux données user sans validation  
❌ **NE JAMAIS** modifier le schéma DB sans migration Prisma  

✅ **TOUJOURS** valider les inputs  
✅ **TOUJOURS** utiliser `req.isAuthenticated()` pour les routes protégées  
✅ **TOUJOURS** échapper les données avant affichage  
✅ **TOUJOURS** tester avant de commit  

---

## 📊 Métriques de qualité

### Code actuel
- ✅ Authentification sécurisée
- ✅ Sessions persistantes
- ✅ Validation basique
- ⚠️ Pas de tests unitaires
- ⚠️ Logs basiques
- ⚠️ Pas de rate limiting

### Objectifs
- [ ] 80%+ couverture tests
- [ ] Logs structurés (Winston)
- [ ] Rate limiting sur API
- [ ] Validation stricte (Zod)
- [ ] Error boundaries React
- [ ] Monitoring (Sentry?)

---

## 🐛 Debug courant

### "Port already in use"
```powershell
taskkill /F /IM node.exe
START_SERVER.bat
```

### "Cannot find module"
```bash
cd server-new && npm install
cd ../client && npm install
```

### "Prisma Client outdated"
```bash
cd server-new
npx prisma generate
```

### "Discord callback failed"
- Vérifier `DISCORD_REDIRECT_URI` dans `.env`
- Vérifier redirect URI dans Discord Developer Portal
- Vérifier que `FRONTEND_URL` est correct

---

## 📦 Dépendances à jour (4 Nov 2025)

### Backend
- express ^4.18.2
- @prisma/client ^6.0.0
- passport ^0.7.0
- passport-discord ^0.1.4

### Frontend  
- react ^18.3.1
- vite ^6.4.1
- react-router-dom ^7.0.2
- zustand ^5.0.2

---

## 🎓 Ressources

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Guide](https://expressjs.com/en/guide/routing.html)
- [React Docs](https://react.dev)
- [Discord OAuth2](https://discord.com/developers/docs/topics/oauth2)
- [Passport.js](https://www.passportjs.org/)

---

## 💡 Idées d'amélioration prioritaires

1. **Tests** : Jest backend + Vitest frontend
2. **Validation** : Zod pour tous les inputs
3. **Monitoring** : Logs structurés + health checks avancés
4. **Performance** : Cache Redis, CDN pour images
5. **UX** : Skeleton loaders, optimistic updates
6. **Accessibilité** : ARIA labels, navigation clavier
7. **SEO** : Meta tags dynamiques, sitemap

---

## ✅ Checklist avant commit

- [ ] Code testé localement
- [ ] Pas de `console.log` inutiles
- [ ] Variables sensibles dans `.env` (pas dans le code)
- [ ] Documentation mise à jour si nouvelle feature
- [ ] Pas de warnings ESLint/TypeScript
- [ ] Format code (Prettier si configuré)
- [ ] Commit message descriptif

---

## 🆘 Besoin d'aide ?

1. Lire `V1DEV.md`
2. Vérifier `CHECK_STATUS.bat`
3. Consulter les logs backend/frontend
4. Chercher dans `docs/`
5. Analyser le code existant similaire

---

**Bon développement ! Cette base est solide, à toi de la faire briller 🌟**
