# 📚 Documentation PAGES - Synthèse Complète & Navigation

## 🎯 Bienvenue dans la Documentation Reviews-Maker

Cette documentation structure **exhaustivement** toutes les pages, systèmes, données et fonctionnalités du projet Reviews-Maker.

---

## 📋 Table des Matières Complète

### 1. 🏠 **PAGES PRINCIPALES**

#### Avant Authentification
- Authentification (OAuth, Email/Mdp)
- Landing Page
- Guide Démarrage

#### Après Authentification
- [Home - Dashboard Principal](./Home/INDEX.md) → Accueil utilisateur
- [Create Reviews - Création de Reviews](#création-de-reviews-par-type)
- [Bibliothèque - Ressources Utilisateur](./BIBLIOTHEQUE/INDEX.md)
- [Export Maker - Export & Partage](#export-maker)
- [Galerie Publique - Découverte & Engagement](./GALERIE_PUBLIQUE/INDEX.md)
- [Profils - Gestion Compte](./PROFILS/INDEX.md)

---

## 🎯 CRÉATION DE REVIEWS (Par Type)

### Fleurs (Herbes/Buds)
📄 [Documentation Complète Fleurs](./CREATE_REVIEWS/FLEURS/INDEX.md)

**Sections:**
1. Informations Générales
2. Génétiques & Généalogie
3. Pipeline Culture (Producteur)
4. Visuel & Technique
5. Odeurs
6. Texture
7. Goûts
8. Effets Ressentis
9. Pipeline Curing/Maturation (Producteur)
10. Données Analytiques

**Permissions:** Tous | Pipelines: Producteur seulement

---

### Hash (Hash, Kief, Ice-O-Lator, Dry-Sift)
📄 [Documentation Complète Hash](./CREATE_REVIEWS/HASHS/INDEX.md)

**Sections:**
1. Informations Générales
2. Pipeline Séparation (Producteur)
3. Visuel & Technique
4. Odeurs
5. Texture
6. Goûts
7. Effets Ressentis
8. Pipeline Curing/Maturation (Producteur)

**Permissions:** Tous | Pipelines: Producteur seulement

---

### Concentrés (Rosin, BHO, CO₂, etc.)
📄 [Documentation Complète Concentrés](./CREATE_REVIEWS/CONCENTRES/INDEX.md)

**Sections:**
1. Informations Générales
2. Pipeline Extraction (Producteur)
3. Pipeline Purification (Producteur)
4. Visuel & Technique
5. Odeurs
6. Texture
7. Goûts
8. Effets Ressentis
9. Pipeline Curing/Maturation (Producteur)

**Permissions:** Tous | Pipelines: Producteur seulement

---

### Comestibles
📄 [Documentation Complète Comestibles](./CREATE_REVIEWS/COMESTIBLES/INDEX.md)

**Sections:**
1. Informations Générales
2. Pipeline Recette (Ingrédients + Étapes)
3. Goûts
4. Effets Ressentis

**Permissions:** Tous

---

## 🎨 SYSTÈMES TRANSVERSAUX

### Export Maker
📄 [Voir Systèmes Globaux](./SYSTEMES_GLOBAUX.md#1--export-maker)

**Templates:**
- Compact (1:1 seulement)
- Détaillé (1:1, 16:9, 9:16, A4)
- Complète (tous formats)
- Influenceur (9:16 seulement)
- Personnalisé (Producteur/Influenceur)

**Formats Export:** PNG, JPEG, SVG, PDF, CSV, JSON, HTML

**Personnalisation:** Thème, couleurs, polices, filigrane, drag & drop

---

### Système de PipeLines
📄 [Documentation Technique PipeLines](./PIPELINE_SYSTEME/sys.md)

**Types:**
- Culture (Fleurs)
- Séparation (Hash)
- Extraction (Concentrés)
- Purification (Concentrés)
- Recette (Comestibles)
- Maturation (Tous)

**Modes Temporels:** Secondes, Minutes, Heures, Jours, Semaines, Mois, Phases

---

### Authentification & Sessions
📄 [Voir Systèmes Globaux](./SYSTEMES_GLOBAUX.md#2--authentification--sessions)

**Méthodes:**
- OAuth2 (Discord, Google, Facebook, Amazon, Apple)
- Email/Mot de passe
- 2FA optionnel

**Architecture:** Passport.js + JWT + Sessions Cookie

---

### Base de Données
📄 [Schémas de Données Complets](./DONNEES_SCHEMAS.md)

**Entités Principales:**
- User + UserProfile
- Review + ReviewGeneralInfo + ReviewSection
- Pipeline + PipelineStage
- ExportTemplate + ExportRecord
- Cultivar (Producteur)
- Watermark
- Like + Comment

**ORM:** Prisma 5.22.0 | **BD:** SQLite (dev) / PostgreSQL (prod)

---

### Gestion des Fichiers
📄 [Voir Systèmes Globaux](./SYSTEMES_GLOBAUX.md#4--gestion-des-fichiers)

**Types:** Images reviews, Documents KYC, Filigranes, Exports générés

**Middleware:** Multer | **Limite:** 25MB (images), 50MB (documents)

---

### Internationalization (i18n)
📄 [Voir Systèmes Globaux](./SYSTEMES_GLOBAUX.md#5--internationalization-i18n)

**Langues:** Français, Anglais, + extensible

**Library:** i18next + react-i18next

---

### Données Statiques
📄 [Voir Systèmes Globaux](./SYSTEMES_GLOBAUX.md#6--données-statiques)

**Fichiers JSON:**
- `data/aromas.json` - Arômes par catégorie
- `data/effects.json` - Effets (mental, physical, therapeutic)
- `data/tastes.json` - Saveurs par catégorie
- `data/terpenes.json` - Profils terpéniques

---

### Système de Permissions
📄 [Matrice Complète des Permissions](./PERMISSIONS.md)

**Niveaux:**
- **Amateur** (Gratuit) → Basique
- **Producteur** (29.99€/mois) → Complet + templates perso
- **Influenceur** (15.99€/mois) → Aperçus + drag & drop

**Matrice:** Détaillée par feature, section et type de compte

---

## 📦 BIBLIOTHÈQUE (Ressources Utilisateur)

📄 [Documentation Complète Bibliothèque](./BIBLIOTHEQUE/INDEX.md)

**Sections:**
1. **Cultivars & Génétiques** (Producteur) → Arbre généalogique
2. **Reviews Sauvegardées** (Tous) → Édition, duplication, partage
3. **Templates & Aperçus** (Tous) → Sauvegarde, partage, importer
4. **Filigranes Personnalisés** (Tous) → Création, gestion
5. **Données Récurrentes** (Producteur) → Substrats, engrais, matériel, techniques

**Fonctionnalités:** Partage (code unique), auto-save, export backup

---

## 👤 PROFILS (Gestion Comptes)

📄 [Documentation Complète Profils](./PROFILS/INDEX.md)

**Sections:**
1. **Informations Personnelles** → Email, username, avatar, bio, langue
2. **Données Entreprise** (Producteur/Influenceur) → KYC, SIRET, logo
3. **Préférences & Paramètres** → Thème, notifications, export prefs
4. **Données de Facturation** (Payants) → Abonnement, paiements, factures
5. **Intégrations Externes** → API keys, webhooks, réseaux sociaux

**Sécurité:** 2FA, gestion sessions, audit trail

---

## 🌍 GALERIE PUBLIQUE

📄 [Documentation Complète Galerie](./GALERIE_PUBLIQUE/INDEX.md)

**Fonctionnalités:**
- Filtrage avancé (type, cultivar, rating, terpènes, effets)
- Tri (récent, trending, top, commentaires)
- Vue galerie + liste
- Détail review avec engagement
- Système likes/commentaires
- Signalement content
- Ranking (hebdo, mensuel, all-time)
- Profil utilisateur public

**Modération:** Signalement, approbation commentaires, suppression content

---

## 🏠 HOME (Dashboard Principal)

📄 [Documentation Complète Home](./Home/INDEX.md)

**Sections:**
1. **Header Navigation** → Logo, recherche, notifications, profil dropdown
2. **Navigation Principale** → Menu items (Home, New Review, Library, etc.)
3. **Dashboard Principal** → Bienvenue, quick actions, stats rapides
4. **Onglets Contenu:**
   - Aperçu (par défaut)
   - Mes Reviews
   - Favoris
   - Trending
5. **Statistiques Résumées** → Semaine, mois, graphiques

**Responsive:** Desktop, Tablet, Mobile

---

## 🔐 SYSTÈMES GLOBAUX (Transversaux)

📄 [Documentation Complète Systèmes Globaux](./SYSTEMES_GLOBAUX.md)

**Contient:**
1. Export Maker - Templates, formats, personnalisation
2. Authentification - OAuth, sessions, 2FA
3. Base de Données - Prisma, entités, schéma
4. Gestion Fichiers - Uploads, types, multer
5. i18n - Multilingue
6. Données Statiques - JSON lookup
7. Système Pipeline - Architecture, types
8. Permissions - Matrice par tier
9. UI/UX Standards - Design patterns, composants
10. Statistiques Utilisateur - Métriques, analytics
11. Recherche & Galerie - Filtrage, ranking
12. Sécurité - Headers, CORS, rate limiting
13. Déploiement - VPS, PM2, scripts

---

## 💾 SCHÉMAS DE DONNÉES

📄 [Documentation Complète Schémas](./DONNEES_SCHEMAS.md)

**Modèles Documentés:**
- User (avec tier, KYC status)
- UserProfile (préférences, stats)
- Review (métadonnées, sections, pipelines)
- ReviewGeneralInfo (infos spécifiques par type)
- ReviewSection (scores, évaluations)
- Pipeline (configuration, étapes)
- PipelineStage (mesures, observations, media)
- Cultivar (généalogie, traits)
- ExportTemplate (apparence, config)
- Watermark (filigrane personnalisé)
- ExportRecord (historique exports)
- Like / Comment (engagement)

**Fichiers JSON Lookup:**
- aromas.json
- effects.json
- tastes.json
- terpenes.json

**Relations & Graphiques** inclus

---

## 📊 MATRIX PERMISSIONS

📄 [Documentation Permissions](./PERMISSIONS.md)

**Détails par:**
- Sections Create_Reviews
- Bibliothèque
- Export Maker (formats, templates, personnalisation)
- Profils
- Statistiques
- Galerie Publique

**Format:** Tableaux détaillés Amateur/Producteur/Influenceur

---

## 🔗 NAVIGATION ENTRE DOCUMENTS

```
INDEX.md (ce fichier)
    ↓
├─ CREATE_REVIEWS/
│  ├─ FLEURS/INDEX.md
│  ├─ HASHS/INDEX.md
│  ├─ CONCENTRES/INDEX.md
│  └─ COMESTIBLES/INDEX.md
│
├─ BIBLIOTHEQUE/INDEX.md
├─ PROFILS/INDEX.md
├─ Home/INDEX.md
├─ GALERIE_PUBLIQUE/INDEX.md
│
├─ PIPELINE_SYSTEME/sys.md
├─ SYSTEMES_GLOBAUX.md
├─ PERMISSIONS.md
└─ DONNEES_SCHEMAS.md
```

---

## 📱 Hiérarchie Pages Utilisateur

```
UNAUTHENTICATED
├─ Landing Page
├─ Login/Register
└─ OAuth Connect

AUTHENTICATED
├─ HOME (Dashboard)
│  ├─ Overview
│  ├─ My Reviews
│  ├─ Favorites
│  └─ Trending
│
├─ CREATE_REVIEWS (Wizard)
│  ├─ Type Selection (Fleurs/Hash/Concentré/Comestible)
│  ├─ Product Type Details
│  ├─ Sections 1-X (selon type)
│  └─ Pipeline Configuration (si applicable)
│
├─ BIBLIOTHEQUE
│  ├─ My Reviews
│  ├─ Cultivars (Producteur)
│  ├─ Templates
│  ├─ Watermarks
│  └─ Recurring Data (Producteur)
│
├─ EXPORT_MAKER
│  ├─ Select Review
│  ├─ Choose Template
│  ├─ Customize Appearance
│  └─ Export/Share
│
├─ GALERIE_PUBLIQUE
│  ├─ Browse Reviews
│  ├─ Review Details
│  └─ User Profile
│
└─ PROFILS
   ├─ Personal Info
   ├─ Company Info (Producteur/Influenceur)
   ├─ Preferences
   ├─ Billing (si payant)
   └─ Integrations
```

---

## 🎓 Guides Rapides

### Créer une Review Fleur (Producteur)
1. Home → [+ Créer Review]
2. Sélectionner: Fleurs
3. Section 1: Infos générales (nom, cultivar, farm)
4. Section 2: Génétiques (breeder, phénotype)
5. **Section 3: Pipeline Culture**
   - Choix mode (jours/semaines/phases)
   - Dates début/fin
   - Ajouter étapes avec mesures
6. Sections 4-8: Évaluations (visuel, odeurs, texture, goûts, effets)
7. **Section 9: Pipeline Maturation**
   - Conteneur, température, humidité
   - Modifications au fil du temps
8. Sauvegarder → Exporter

### Exporter une Review en PDF
1. Bibliothèque → Mes Reviews
2. Sélectionner review
3. [Export] → Export Maker
4. Choix template
5. Personnaliser apparence (optionnel)
6. Choix format: PDF
7. Télécharger / Partager

### Publier dans Galerie Publique
1. Bibliothèque → Review
2. [Publier] ou [Partager]
3. Vérifier template par défaut
4. Marquer comme "public"
5. Review visible dans Galerie Publique

---

## 🔗 Références Fichiers Code

### Frontend
- `client/src/pages/Home.jsx`
- `client/src/pages/ReviewForm*.jsx`
- `client/src/pages/Library.jsx`
- `client/src/pages/ExportMaker.jsx`
- `client/src/pages/Gallery.jsx`
- `client/src/pages/Profile.jsx`
- `client/src/components/export/ExportMaker.jsx`
- `client/src/components/pipelines/`
- Data: `data/*.json`

### Backend
- `server-new/routes/reviews.js`
- `server-new/routes/pipelines.js`
- `server-new/routes/export.js`
- `server-new/routes/gallery.js`
- `server-new/routes/profile.js`
- `server-new/routes/library.js`
- Schema: `server-new/prisma/schema.prisma`

---

## ✅ Checklist Complétude Documentation

- [x] INDEX complet
- [x] Documentation Fleurs (10 sections)
- [x] Documentation Hash (8 sections)
- [x] Documentation Concentrés (9 sections)
- [x] Documentation Comestibles (4 sections)
- [x] Documentation Bibliothèque (5 subsections)
- [x] Documentation Profils (5 subsections)
- [x] Documentation Home (6 sections)
- [x] Documentation Galerie Publique
- [x] Documentation Systèmes Globaux (13 items)
- [x] Documentation Permissions (complète)
- [x] Documentation Schémas de Données (12 modèles)
- [x] Documentation PipeLines (6 types + architecture)

---

## 📞 Support & Feedback

Pour questions/corrections/améliorations:
- GitHub Issues
- Email support@reviews-maker.com
- Feedback form dans app

---

## 📋 Version & Mise à Jour

**Version Documentation:** 1.0.0
**Date:** Janvier 2025
**Dernière mise à jour:** 15 Jan 2025

*Documentation mise à jour lors des major releases*

