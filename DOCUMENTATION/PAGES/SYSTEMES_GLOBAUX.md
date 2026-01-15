# Systèmes Globaux - Documentation Complète

## 1. 🎯 Export Maker

### Finalité
Système complet d'export des reviews en multiples formats avec personnalisation d'apparence.

### Composants Clés
- **Templates Prédéfinis**
  - Compact (1:1 uniquement)
  - Détaillé (1:1, 16:9, 9:16, A4)
  - Complète (tous formats)
  - Influenceur (9:16 uniquement)
  - Personnalisé (Producteur uniquement)

- **Formats de Sortie**
  - PNG (qualité configurable)
  - JPEG (qualité configurable)
  - SVG (vectoriel)
  - PDF (300dpi haute qualité)
  - CSV (export données)
  - JSON (export données)
  - HTML (export formaté)

- **Formats de Canva**
  - 1:1 (carré)
  - 16:9 (paysage)
  - 9:16 (portrait)
  - A4 (document)

### Personnalisation
- Thème clair/sombre
- Palette de couleurs (texte, bordures, fonds)
- Polices personnalisées (Google Fonts, web-safe)
- Filigrane personnalisé (position, taille, opacité)
- Effets sur images (bordure, filtres, flou)
- Drag & drop des contenus (Producteur/Influenceur)

### Fichier Référence
`client/src/components/export/ExportMaker.jsx`

---

## 2. 🔐 Authentification & Sessions

### Méthodes de Connexion
- OAuth2 (Discord, Google, Facebook, Amazon, Apple)
- Email/Mot de passe
- KYC optionnel (KYC = Know Your Customer)

### Structure Sessions
- `server-new/session-options.js` - Configuration sessions
- `server-new/routes/auth.js` - Routes authentification

### Gestion des Tokens
- JWT pour API calls
- Session cookies pour persistance
- Refresh tokens
- CSRF protection

### Architecture
```
Passport Strategies:
├── passport-discord
├── passport-google-oauth20
├── passport-facebook
├── passport-amazon
└── passport-apple

Local Strategy:
├── Email validation
├── Password hashing (bcryptjs)
└── 2FA optionnel (speakeasy)
```

---

## 3. 🗄️ Base de Données

### Technologie
- **ORM**: Prisma 5.22.0
- **Database**: SQLite (local) / PostgreSQL (production)
- **Fichier Schema**: `server-new/prisma/schema.prisma`

### Entités Principales
- **Users** - Comptes utilisateurs
- **Reviews** - Reviews créées
- **ReviewData** - Données détaillées par section
- **Cultivars** - Génétiques (pour producteurs)
- **Templates** - Templates d'export sauvegardés
- **Watermarks** - Filigranes personnalisés
- **Uploads** - Métadonnées fichiers

### Schéma Résumé
```
User
├── profile: UserProfile
├── reviews: Review[]
├── templates: ExportTemplate[]
├── watermarks: Watermark[]
└── library: LibraryItem[]

Review
├── metadata: ReviewMetadata
├── sections: ReviewSection[]
├── pipeline: Pipeline[]
└── exports: ExportRecord[]
```

### Commandes Prisma
```bash
npm run prisma:generate   # Générer types
npm run prisma:migrate    # Appliquer migrations
npm run prisma:studio     # Interface Prisma Studio
```

---

## 4. 📁 Gestion des Fichiers

### Types de Uploads
- **Images de Reviews** - `db/review_images/`
- **Documents KYC** - `db/kyc_documents/`
- **Filigrane** - `uploads/watermarks/`
- **Exports générés** - `uploads/exports/`

### Middleware Multer
- Configuration: `server-new/config/multer.js`
- Limite taille: 25MB (images), 50MB (documents)
- Formats acceptés: JPG, PNG, PDF, ZIP

### Routes Upload
- `POST /api/upload/review-image` - Images reviews
- `POST /api/upload/kyc-document` - Documents KYC
- `POST /api/upload/watermark` - Filigranes

---

## 5. 🌍 Internationalization (i18n)

### Configuration
- `client/src/i18n/` - Configuration i18n
- `client/src/i18n/locales/` - Fichiers de traduction

### Langues Supportées
- Français (fr)
- Anglais (en)
- Autres (extensible)

### Utilisation
```jsx
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();
// t('key.path') pour traductions
// i18n.changeLanguage('en') pour changement
```

---

## 6. 📊 Données Statiques

### Fichiers JSON de Lookup

#### `data/aromas.json`
```json
{
  "categories": [
    {
      "name": "Fruité",
      "aromas": ["Citron", "Pomme", "Fraise", ...]
    },
    ...
  ]
}
```

#### `data/effects.json`
```json
{
  "mental": ["Créatif", "Énergique", ...],
  "physical": ["Relaxant", "Douleur", ...],
  "therapeutic": ["Anxiété", "Insomnie", ...]
}
```

#### `data/tastes.json`
Saveurs disponibles par catégorie

#### `data/terpenes.json`
Profils terpéniques complets

### Utilisation Frontend
```jsx
import aromas from '../../data/aromas.json';
// Utilisation dans sélecteurs/autocomplete
```

---

## 7. 🔄 Système Pipeline

### Concept Clé
Les PipeLines sont des systèmes de saisie structurée documentant les étapes de production/transformation.

### Types de PipeLines

#### Culture (Fleurs)
- **Phases**: Germination → Croissance → Stretch → Floraison → Récolte → Curing
- **Intervalles**: Jours, Semaines, Phases
- **Données par étape**: Env, nutrition, éclairage, morphologie, etc.

#### Séparation (Hash)
- **Méthodes**: Tamisage, Eau/Glace, etc.
- **Intervalles**: Secondes, Minutes, Heures
- **Données**: Température, rendement, passes, etc.

#### Extraction (Concentrés)
- **Méthodes**: BHO, Rosin, CO₂, etc.
- **Purification**: Chromatographie, Winterisation, etc.
- **Données**: Solvants, températures, rendements

#### Recette (Comestibles)
- **Ingrédients**: Choix multi-select
- **Étapes**: Actions prédéfinies assignables
- **Données**: Quantités, unités, modifications

#### Maturation (Tous produits)
- **Variables**: Température, humidité, durée
- **Conteneur**: Type, opacité, volume
- **Impact**: Modification des tests visuels/sensoriels

### Fichier Référence
`DOCUMENTATION/CDC/PAGES/PIPELINE_SYSTEME/sys.md`

---

## 8. 👥 Système de Permissions

### Niveaux d'Accès

| Feature | Amateur | Producteur | Influenceur |
|---------|---------|-----------|------------|
| Templates prédéfinis | ✓ | ✓ | ✓ |
| Template personnalisé | ✗ | ✓ | ✓ |
| Export haute qualité | ✗ | ✓ | ✓ |
| Drag & Drop layout | ✗ | ✓ | ✓ |
| Pipeline complet | ✗ | ✓ | ✓ |
| Arbre généalogique | ✗ | ✓ (Fleurs) | ✗ |
| Statistiques avancées | ✗ | ✓ | Limité |

Voir: [PERMISSIONS.md](./PERMISSIONS.md)

---

## 9. 🎨 UI/UX Standards

### Design Pattern
- Apple-like: Épuré, moderne, intuitif
- Liquid UI: Animations fluides (Framer Motion)
- Accessible: WCAG 2.1 Level AA
- Responsive: Mobile-first approach

### Composants Clés
- Selectors (multi-select, single)
- Autocomplete avec suggestions
- Drag & Drop (dnd-kit, react-dnd)
- Modales d'aide contextuelle
- Tooltips explicatifs

### Librairies UI
- Lucide React - Icônes
- Recharts - Graphiques
- React Select - Selectors
- Framer Motion - Animations
- Tailwind CSS - Styling

---

## 10. 📈 Statistiques Utilisateur

### Données Collectées
- Nombre de reviews créées
- Nombre d'exports réalisés
- Types de produits les plus documentés
- Notes moyennes données/reçues
- Engagements sur reviews publiques (likes, partages, commentaires)

### Accès par Rôle
- **Amateur**: Statistiques basiques personnelles
- **Producteur**: Stats détaillées (cultures, rendements, engagements)
- **Influenceur**: Stats engagement public

### Routes API
- `GET /api/user/statistics` - Profil utilisateur
- `GET /api/user/reviews-stats` - Stats reviews
- `GET /api/user/exports-stats` - Stats exports

---

## 11. 🔍 Système de Recherche & Galerie

### Galerie Publique
- Navigation par type de produit
- Filtrage par: popularité, notes, récence, cultivars
- Système de likes, commentaires, partages
- Modération de contenu

### Recherche Avancée
- Filtres multiples par champ
- Full-text search
- Agrégation par tags

### Ranking
- Top hebdomadaire
- Top mensuel
- Top annuel
- Top all-time

---

## 12. 🛡️ Sécurité

### Measures
- Helmet.js pour headers HTTP
- CORS configuré
- Rate limiting
- CSRF protection (csurf)
- Input validation (Zod)
- Password hashing (bcryptjs)

### Fichiers
- `server-new/middleware/` - Middlewares sécurité
- `server-new/utils/validators.js` - Validation Zod

---

## 13. 🚀 Déploiement

### VPS
- SSH alias: `vps-lafoncedalle`
- PM2 config: `ecosystem.config.cjs`
- Nginx: `nginx-terpologie.conf`

### Scripts
```bash
deploy-vps.sh          # Déploiement complet
pm2-clean-restart.sh   # Redémarrage PM2
db-backup.sh          # Sauvegarde BD
```

### Commandes Courantes
```bash
ssh vps-lafoncedalle
pm2 list              # Voir services
pm2 logs app-name     # Voir logs
pm2 restart app-name  # Redémarrer
```

Voir: [VPS_DEPLOYMENT.md](../../DEPLOYMENT.md)

---

## 📚 Fichiers Référence

- Frontend: `client/src/`
- Backend: `server-new/`
- Données: `data/*.json`
- Scripts: `scripts/`
- DB: `server-new/prisma/schema.prisma`
