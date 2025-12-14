# 📚 Documentation Complète - Reviews-Maker

**Version** : 2.0.0 (Refonte complète)  
**Date** : Décembre 2025  
**Auteur** : RAFOUgg  

---

## 🎯 Vue d'ensemble

Reviews-Maker est une application web moderne de gestion et création de reviews de produits à base de cannabis. Elle permet aux utilisateurs de créer, partager et consulter des reviews détaillées avec authentification Discord, upload d'images, et un système de notation complet.

### Architecture
- **Frontend** : React 18 + Vite + TailwindCSS + Framer Motion
- **Backend** : Express.js + Prisma ORM + SQLite
- **Authentification** : Discord OAuth2
- **Stockage** : Images locales, données SQLite

---

## 🚀 Fonctionnalités Principales

### 1. Authentification Discord
- **Connexion OAuth2 complète** : Flux sécurisé avec Discord (scopes: identify, email)
- **Sessions persistantes** : Gestion via express-session avec SQLite
- **Profils utilisateurs enrichis** : Avatar Discord, username, email, discriminator
- **Hook personnalisé useAuth** : Gestion centralisée de l'état d'authentification
- **Callback automatique** : Composant AuthCallback pour traitement post-connexion
- **Vérification de session** : Check automatique au démarrage de l'app
- **Menu profil dropdown** : Navigation vers bibliothèque, stats, paramètres
- **Déconnexion sécurisée** : Nettoyage session + cookies
- **Avatars avec fallback** : CDN Discord ou génération automatique via UI-Avatars
- **Persistence cross-session** : État utilisateur maintenu entre rechargements

### 2. Gestion des Reviews
- **Création complète** : Formulaire détaillé avec tous les champs nécessaires
- **Types de produits** : Fleur, Hash, Concentré, Comestible
- **Notation détaillée** : Apparence, arôme, goût, effets (échelle /10)
- **Sélection terpénique** : Interface visuelle avec roue des terpènes
- **Upload d'images** : Jusqu'à 10 images par review (10MB max chacune)
- **Visibilité** : Publique ou privée
- **Modification/Suppression** : Par propriétaire uniquement

### 3. Profils Utilisateurs
- **Bibliothèque personnelle** : Toutes les reviews de l'utilisateur avec double filtrage
- **Statistiques détaillées** : Page StatsPage avec graphiques et métriques
- **Paramètres personnalisables** : Page SettingsPage avec thème dynamique
- **Menu profil professionnel** : Dropdown avec navigation claire
- **Profils publics** : Consultation des reviews d'autres utilisateurs
- **Thèmes persistants** : Clair/sombre/auto avec localStorage
- **Préférences utilisateur** : Type produit par défaut, visibilité, format export

### 4. Système de Données Cannabis
- **Terpènes** : 20+ terpènes avec arômes, goûts, effets associés
- **Arômes** : Liste complète des arômes possibles
- **Goûts** : Palette gustative détaillée
- **Effets** : Effets physiques et mentaux

### 5. Interface Moderne
- **Design system** : Style Apple-like, épuré et professionnel
- **Thèmes** : Violet (défaut), Émeraude, Rose
- **Responsive** : Optimisé mobile et desktop
- **Animations fluides** : Framer Motion pour UX premium
- **Mode sombre** : Support complet avec persistence

### 6. Fonctionnalités Avancées
- **Système de cultivars** : Gestion multi-cultivars pour hash/concentrés
- **Pipelines d'extraction/séparation** : Traçabilité professionnelle
- **Likes/Dislikes** : Système de notation communautaire
- **Recherche et filtrage** : Par type, nom, critères
- **Tri personnalisé** : Date, note, popularité

---

## 🏗️ Architecture Technique

### Frontend (`client/`)
```
client/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages principales
│   ├── services/      # Services API
│   ├── store/         # State management (Zustand)
│   ├── hooks/         # Hooks personnalisés
│   ├── utils/         # Utilitaires
│   └── data/          # Données statiques
├── index.html
├── package.json
└── vite.config.js
```

#### Technologies Frontend
- **React 18** : Framework UI moderne
- **Vite 6** : Build tool ultra-rapide
- **TailwindCSS 3** : Framework CSS utilitaire
- **Framer Motion** : Animations et transitions
- **React Router 6** : Navigation SPA
- **Zustand** : State management léger

#### Composants Authentification
- `AuthCallback.jsx` : Gestion du callback OAuth2 post-connexion
- `UserProfileDropdown.jsx` : Menu profil avec navigation
- `Layout.jsx` : Navigation conditionnelle selon état auth

#### Hooks Personnalisés
- `useAuth.js` : Gestion centralisée de l'authentification
  - Vérification automatique de session
  - Connexion via Discord OAuth2
  - Déconnexion sécurisée
  - État utilisateur en temps réel

#### Pages Principales
- `HomePage.jsx` : Page d'accueil avec liste des reviews
- `CreateReviewPage.jsx` : Création de nouvelle review
- `ReviewDetailPage.jsx` : Détail d'une review
- `LibraryPage.jsx` : Bibliothèque personnelle
- `StatsPage.jsx` : Statistiques utilisateur
- `SettingsPage.jsx` : Paramètres utilisateur

### Backend (`server-new/`)
```
server-new/
├── routes/           # Endpoints API
│   ├── auth.js       # Authentification Discord
│   ├── reviews.js    # CRUD reviews
│   └── users.js      # Gestion utilisateurs
├── config/           # Configuration Passport
├── prisma/           # Schema base de données
├── middleware/       # Middlewares Express
├── server.js         # Point d'entrée
└── package.json
```

#### Technologies Backend
- **Express 4** : Framework web Node.js
- **Prisma ORM** : Gestion base de données
- **SQLite** : Base de données légère
- **Passport.js** : Authentification
- **Multer** : Upload de fichiers
- **Express-session** : Gestion des sessions

#### Modèles de Données

##### User
```prisma
model User {
  id            String   @id @default(uuid())
  discordId     String   @unique
  username      String
  discriminator String?
  avatar        String?
  email         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  reviews  Review[]
  sessions Session[]
  likes    ReviewLike[]
}
```

##### Review
```prisma
model Review {
  id          String   @id @default(uuid())
  holderName  String   // Nom de la variété
  type        String   // Fleur, Hash, Concentré, Comestible
  description String?
  
  // Notation
  note        Float?
  ratings     String?  // JSON: {apparence: 8, odeur: 9, gout: 7, effets: 8.5}
  
  // Profil sensoriel
  terpenes    String?  // JSON: ["Myrcène", "Limonène"]
  tastes      String?  // JSON: ["Citron", "Terreux"]
  aromas      String?  // JSON: ["Citron", "Boisé"]
  effects     String?  // JSON: ["Relaxant", "Euphorique"]
  
  // Métadonnées
  strainType  String?  // Type de variété
  indicaRatio Int?     // Ratio Indica/Sativa
  
  // Champs spécialisés
  cultivarsList      String? // JSON: Cultivars utilisés
  pipelineExtraction String? // Pipeline extraction
  pipelineSeparation String? // Pipeline séparation
  purgevide          Boolean? // Purge à vide
  hashmaker          String? // Fabricant hash
  breeder            String? // Éleveur
  farm               String? // Producteur
  
  // Images
  images      String?  // JSON: Liste des images
  mainImage   String?  // Image principale
  
  // Visibilité
  isPublic    Boolean  @default(true)
  isPrivate   Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  authorId    String
  author      User     @relation(...)
  likes       ReviewLike[]
}
```

##### ReviewLike
```prisma
model ReviewLike {
  id        String   @id @default(uuid())
  reviewId  String
  userId    String
  isLike    Boolean  // true = like, false = dislike
  createdAt DateTime @default(now())

  review Review @relation(...)
  user   User   @relation(...)
  
  @@unique([reviewId, userId])
}
```

---

## 📡 API Endpoints

### Authentification (`/api/auth`)
- `GET /discord` : Initier connexion Discord OAuth2
- `GET /discord/callback` : Callback OAuth2 avec traitement automatique
- `GET /me` : Informations utilisateur connecté (avec avatar Discord)
- `POST /logout` : Déconnexion avec nettoyage session

### Routes Frontend
- `GET /auth/callback` : Page de callback post-connexion Discord

### Reviews (`/api/reviews`)
- `GET /` : Liste reviews (avec filtres : type, search, sortBy, order)
- `GET /:id` : Détail d'une review
- `POST /` : Créer review (auth + multipart/form-data)
- `PUT /:id` : Modifier review (ownership requis)
- `DELETE /:id` : Supprimer review (ownership requis)

### Utilisateurs (`/api/users`)
- `GET /me/reviews` : Reviews de l'utilisateur connecté
- `GET /me/stats` : Statistiques personnelles
- `GET /:id/profile` : Profil public d'un utilisateur
- `GET /:id/reviews` : Reviews publiques d'un utilisateur

---

## 🎨 Design System

### Principes
- **Simplicité** : Interface épurée, hiérarchie claire
- **Cohérence** : Composants réutilisables, comportements prévisibles
- **Accessibilité** : Contraste WCAG AA, navigation clavier

### Palette de Couleurs
- **Violet (défaut)** : `#8B5CF6`, `#A78BFA`, `#C4B5FD`
- **Émeraude** : `#10B981`, `#34D399`, `#6EE7B7`
- **Rose** : `#F43F5E`, `#FB7185`, `#FDA4AF`

### Typographie
- **Police principale** : Inter (sans-serif)
- **Police monospace** : JetBrains Mono
- **Tailles** : xs (12px) à 2xl (24px)

### Espacements
- **Grille 8px** : De 0px à 96px
- **Unités** : space-1 (4px) à space-24 (96px)

---

## 📊 Données Cannabis

### Terpènes (20+)
Chaque terpène contient :
- Nom français et anglais
- Arômes associés
- Goûts associés
- Effets associés
- Souches représentatives
- Couleur et icône

**Exemples** :
- Myrcène : Terreux, Relaxant
- Limonène : Citron, Énergisant
- Pinène : Pin, Anti-inflammatoire

### Arômes, Goûts, Effets
- **Arômes** : 50+ descripteurs (Citron, Boisé, Fruité, etc.)
- **Goûts** : 40+ saveurs (Sucré, Amer, Épicé, etc.)
- **Effets** : 30+ effets (Relaxant, Euphorique, Créatif, etc.)

---

## 🔧 Installation & Configuration

### Prérequis
- Node.js 18+
- npm
- Compte Discord Developer

### Configuration Discord OAuth2
1. Créer application sur https://discord.com/developers/applications
2. Copier Client ID et Client Secret
3. Ajouter redirect URI : `http://localhost:3000/api/auth/discord/callback`

### Backend
```bash
cd server-new
npm install
cp .env.example .env
# Éditer .env avec les clés Discord
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

### Accès
- Frontend : http://localhost:5173
- Backend : http://localhost:3000
- Prisma Studio : `npx prisma studio`

---

## 🚀 Déploiement

### Environnement de Production
- Variables d'environnement pour production
- Base de données PostgreSQL recommandée
- Serveur web (Nginx) pour servir les assets
- PM2 pour gestion des processus
- HTTPS obligatoire

### Commandes Déploiement
```bash
# Build frontend
cd client && npm run build

# Démarrage production
cd server-new
NODE_ENV=production npm start
```

---

## 🐛 Dépannage

### Erreurs Courantes
- **OAuth2Strategy** : Vérifier clés Discord dans `.env`
- **CORS** : Frontend et backend sur ports différents
- **Database** : Migrations Prisma non appliquées
- **Images** : Dossier `db/review_images/` doit être writable

### Logs et Debug
- Console navigateur pour erreurs frontend
- Logs serveur dans terminal
- Prisma Studio pour inspection DB
- Variables `DEBUG=true` ou `localStorage.RM_DEBUG='1'`

---

## 📈 Métriques & Performance

### Performance Cible
- Lighthouse > 90 (mobile & desktop)
- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Bundle size < 300kb (gzipped)

### Qualité Code
- Couverture tests > 80%
- 0 erreurs ESLint
- Accessibilité > 95
- Sécurité : Score A+ Observatory

---

## 🔮 Roadmap & Évolutions Futures

Voir le document `EVOLUTIONS_EN_COURS.md` pour les développements planifiés et en cours.

Voir le document `DOCUMENTATION_COMPTES_FONCTIONNALITES.md` pour les types de comptes et fonctionnalités détaillées.

---

**Documentation générée automatiquement le 9 décembre 2025**  
**Dernière mise à jour authentification : 9 décembre 2025**</content>
<parameter name="filePath">c:\Users\jadeb\Desktop\RAFOU\Reviews-Maker\DOCUMENTATION_COMPLETE.md
