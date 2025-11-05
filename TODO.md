# 📋 TODO - Reviews-Maker V1DEV

**Dernière mise à jour** : 18 décembre 2025

---

## ✅ Complété récemment (Décembre 2025)

- [x] **Système professionnel cultivars & pipelines** (18 déc 2025)
  - [x] Composant CultivarList pour gestion multi-cultivars
  - [x] Composant PipelineWithCultivars pour extraction/séparation
  - [x] Intégration dans productStructures (Hash & Concentré)
  - [x] Support mailles/microns pour tamisages
  - [x] Documentation complète (SYSTEME_PROFESSIONNEL_CULTIVARS.md)
  - [x] Plan de tests exhaustif (TESTS_CULTIVARS_PIPELINES.md)

---

## 🚨 Critiques (À faire IMMÉDIATEMENT)

- [ ] **Tests** : Ajouter tests unitaires backend (au moins pour routes auth)
- [ ] **Validation** : Implémenter Zod pour valider tous les inputs API
- [ ] **Error Handling** : Error boundaries React + gestion d'erreurs uniforme backend
- [ ] **Logs** : Implémenter Winston pour logs structurés
- [ ] **Rate Limiting** : Protéger les endpoints contre les abus

---

## 🔥 Haute priorité (Cette semaine)

- [ ] **Tests unitaires**
  - [ ] Backend : Jest + Supertest
  - [ ] Frontend : Vitest + Testing Library
  - [ ] Couverture minimale : 60%

- [ ] **Validation des données**
  - [ ] Zod schemas pour tous les endpoints
  - [ ] Validation frontend avec React Hook Form + Zod

- [ ] **Amélioration sécurité**
  - [ ] Rate limiting (express-rate-limit)
  - [ ] Helmet.js pour headers sécurisés
  - [ ] CORS strict en production
  - [ ] Sanitization des inputs (DOMPurify)

- [ ] **Monitoring**
  - [ ] Logs structurés (Winston)
  - [ ] Health checks avancés
  - [ ] Métriques basiques (temps réponse, erreurs)

---

## 📌 Moyenne priorité (Ce mois)

### Backend

- [ ] **Optimisation base de données**
  - [ ] Indexes sur colonnes souvent requêtées
  - [ ] Pagination cursor-based (plus performant)
  - [ ] Eager loading des relations Prisma

- [ ] **Gestion d'erreurs**
  - [ ] Middleware d'erreur centralisé
  - [ ] Codes d'erreur standardisés
  - [ ] Messages d'erreur i18n

- [ ] **Features**
  - [ ] Système de likes/favoris
  - [ ] Commentaires sur reviews
  - [ ] Tags personnalisés
  - [ ] Notifications (webhooks Discord?)

### Frontend

- [ ] **UX/UI**
  - [ ] Skeleton loaders partout
  - [ ] Optimistic updates (likes, création review)
  - [ ] Toast notifications (react-hot-toast)
  - [ ] Mode sombre persistant

- [ ] **Performance**
  - [ ] Lazy loading des images
  - [ ] Code splitting des routes
  - [ ] Memoization des composants lourds
  - [ ] Virtual scrolling pour longues listes

- [ ] **Accessibilité**
  - [ ] ARIA labels complets
  - [ ] Navigation clavier
  - [ ] Focus management
  - [ ] Contraste couleurs WCAG AA

---

## 🌟 Basse priorité (Quand temps libre)

- [ ] **PWA**
  - [ ] Manifest.json
  - [ ] Service Worker
  - [ ] Offline mode basique
  - [ ] Install prompt

- [ ] **Analytics**
  - [ ] Tracking événements (Google Analytics / Plausible)
  - [ ] Dashboard stats personnelles
  - [ ] Graphiques (Chart.js / Recharts)

- [ ] **Social**
  - [ ] Partage reviews (Twitter, Facebook)
  - [ ] Preview cards (Open Graph)
  - [ ] Export PDF
  - [ ] QR Code génération

- [ ] **Admin**
  - [ ] Panel admin (modération)
  - [ ] Statistiques globales
  - [ ] Gestion utilisateurs
  - [ ] Logs système

---

## 🔮 Futur (Roadmap long terme)

- [ ] **Migration TypeScript**
  - [ ] Backend complet
  - [ ] Frontend complet
  - [ ] Types partagés (monorepo?)

- [ ] **Infrastructure**
  - [ ] Docker + Docker Compose
  - [ ] CI/CD GitHub Actions
  - [ ] Tests automatisés sur PR
  - [ ] Déploiement automatique

- [ ] **Architecture**
  - [ ] Migration PostgreSQL
  - [ ] Cache Redis
  - [ ] CDN pour images (Cloudinary?)
  - [ ] GraphQL API (ou tRPC?)

- [ ] **Mobile**
  - [ ] React Native app
  - [ ] Push notifications
  - [ ] Biometric auth
  - [ ] Offline-first

---

## ✅ Terminé

- [x] Authentification Discord OAuth2
- [x] CRUD reviews complet
- [x] Upload images
- [x] Sessions persistantes
- [x] Scripts de démarrage Windows
- [x] Documentation complète
- [x] Frontend responsive
- [x] Filtrage et recherche

---

## 🐛 Bugs connus

### Critiques
- Aucun pour le moment 🎉

### Mineurs
- [ ] Images trop grandes peuvent saturer le serveur (ajouter limite taille)
- [ ] Pas de feedback visuel pendant upload image
- [ ] Session expirée = pas de refresh auto
- [ ] Mobile : menu dropdown parfois bloqué

### Nice to fix
- [ ] Favicon par défaut
- [ ] Meta tags manquants pour SEO
- [ ] Console warnings React en dev
- [ ] Scroll position pas restaurée sur navigation back

---

## 💡 Idées en vrac

- [ ] Système de badges/achievements
- [ ] Leaderboard des reviewers
- [ ] IA pour suggestions de terpènes basées sur arômes
- [ ] OCR pour extraire info d'étiquettes produit
- [ ] Intégration Telegram bot
- [ ] API publique pour developers externes
- [ ] Marketplace de reviews (?)
- [ ] Gamification (points, niveaux)

---

## 📝 Notes techniques

### Optimisations possibles
```javascript
// Utiliser React.memo pour ReviewCard
const ReviewCard = React.memo(({ review }) => {
  // ...
})

// Lazy load des pages
const CreateReview = lazy(() => import('./pages/CreateReview'))

// Debounce search input
const debouncedSearch = useMemo(
  () => debounce(handleSearch, 300),
  []
)
```

### Migrations Prisma à prévoir
```prisma
// Likes
model Like {
  id        Int      @id @default(autoincrement())
  reviewId  Int
  userId    Int
  createdAt DateTime @default(now())
  @@unique([reviewId, userId])
}

// Comments
model Comment {
  id        Int      @id @default(autoincrement())
  reviewId  Int
  authorId  Int
  content   String
  createdAt DateTime @default(now())
}

// Tags
model Tag {
  id      Int      @id @default(autoincrement())
  name    String   @unique
  reviews Review[]
}
```

---

## 🎯 Objectifs chiffrés

### Performance
- [ ] Lighthouse score > 90 (mobile & desktop)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size frontend < 300kb (gzipped)

### Qualité
- [ ] Couverture tests > 80%
- [ ] 0 erreurs ESLint
- [ ] 0 warnings console en production
- [ ] Accessibilité score > 95

### Sécurité
- [ ] Score A+ Mozilla Observatory
- [ ] Tous les headers sécurisés (Helmet)
- [ ] Rate limiting actif
- [ ] Toutes les dépendances à jour

---

**Contribuez à cette TODO list !**  
Ajoutez vos idées, marquez les tâches terminées, priorisez selon vos besoins.
