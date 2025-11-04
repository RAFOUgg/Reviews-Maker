# 📝 Changelog - Reviews-Maker

Toutes les modifications notables du projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] - V1DEV - 2025-11-04

### 🎉 Version stable initiale - Base propre pour développement

### ✅ Ajouté
- Authentification Discord OAuth2 complète et fonctionnelle
- Backend Express avec Prisma ORM (SQLite)
- Frontend React + Vite + TailwindCSS
- CRUD complet pour les reviews
- Upload d'images avec Multer
- Sessions persistantes (7 jours) avec cookies httpOnly
- Scripts Windows (.bat) pour démarrage/arrêt/diagnostic
- Documentation complète pour développeurs et IA
- Support mobile via accès réseau local
- Filtrage et recherche de reviews
- Profils utilisateurs Discord

### 🔧 Configuration
- Variables d'environnement via `.env`
- Port backend: 3000
- Port frontend: 5173 (auto 5174 si occupé)
- Base de données SQLite locale
- Images stockées en local (`db/review_images/`)

### 📚 Documentation
- `V1DEV.md` - Vue d'ensemble complète du projet
- `AI_DEV_GUIDE.md` - Guide spécifique pour les IA développeurs
- `README.md` - Documentation utilisateur
- `QUICKSTART.md` - Démarrage rapide 5 minutes
- `docs/` - Documentation technique détaillée

### 🛠️ Scripts
- `START_SERVER.bat` - Démarrage optimisé avec vérifications
- `CHECK_STATUS.bat` - Diagnostic complet des serveurs
- `STOP_DEV.bat` - Arrêt propre de tous les processus
- `OPEN_SITE.bat` - Ouverture auto du site (détection port)
- `MENU_REVIEWS_MAKER.bat` - Menu interactif complet

### 🔒 Sécurité
- Authentification obligatoire pour créer/modifier/supprimer
- Cookies httpOnly pour les sessions
- Validation basique des inputs
- Ownership check sur modifications/suppressions
- Secrets dans variables d'environnement

### 📦 Dépendances principales
**Backend:**
- express 4.18.2
- @prisma/client 6.0.0
- passport 0.7.0
- passport-discord 0.1.4
- express-session 1.18.2
- multer 1.4.5

**Frontend:**
- react 18.3.1
- vite 6.4.1
- react-router-dom 7.0.2
- zustand 5.0.2
- tailwindcss 3.4.17

---

## [0.9.0] - 2025-11-04

### 🔧 Corrigé
- Port frontend incorrect dans `.env` (5174 → 5173)
- Scripts `.bat` utilisant ancien chemin `server` au lieu de `server-new`
- Détection automatique du port dans `OPEN_SITE.bat`
- Gestion dynamique du port dans `MENU_REVIEWS_MAKER.bat`

### 📝 Modifié
- Credentials Discord configurés
- SESSION_SECRET généré de manière sécurisée
- FRONTEND_URL ajouté dans `.env`

### 🗑️ Supprimé
- Fichiers de debug temporaires (archivés)
- Documentation obsolète (archivée)

---

## [0.8.0] - 2025-11-03

### ✅ Ajouté
- Configuration Discord OAuth2
- Endpoints d'authentification
- Middleware Passport.js
- Stratégie Discord

### 🔧 Modifié
- Refactorisation architecture backend
- Migration vers Prisma ORM
- Nouveau frontend React

---

## À venir (Roadmap)

### [1.1.0] - Tests et Validation
- [ ] Tests unitaires backend (Jest)
- [ ] Tests unitaires frontend (Vitest)
- [ ] Tests d'intégration API
- [ ] Validation stricte avec Zod
- [ ] Tests E2E (Playwright?)

### [1.2.0] - Amélioration UX
- [ ] Mode sombre persistant
- [ ] Skeleton loaders
- [ ] Optimistic updates
- [ ] Pagination infinie (scroll)
- [ ] Filtres avancés avec chips
- [ ] Preview images avant upload

### [1.3.0] - Features avancées
- [ ] Système de likes/favoris
- [ ] Commentaires sur reviews
- [ ] Notifications temps réel
- [ ] Statistiques personnelles
- [ ] Export PDF
- [ ] Partage social

### [1.4.0] - Production Ready
- [ ] Logging structuré (Winston)
- [ ] Monitoring (Sentry)
- [ ] Rate limiting
- [ ] Compression images auto
- [ ] Cache Redis
- [ ] CI/CD GitHub Actions
- [ ] Docker + Docker Compose
- [ ] Déploiement cloud

### [2.0.0] - Major refactor
- [ ] Migration TypeScript
- [ ] GraphQL API
- [ ] PostgreSQL
- [ ] Microservices?
- [ ] WebSockets temps réel
- [ ] Mobile app (React Native?)

---

## Légende des tags

- `✅ Ajouté` - Nouvelles fonctionnalités
- `🔧 Modifié` - Modifications de fonctionnalités existantes
- `🔒 Sécurité` - Correctifs de vulnérabilités
- `🐛 Corrigé` - Corrections de bugs
- `🗑️ Supprimé` - Fonctionnalités retirées
- `📚 Documentation` - Modifications de la doc uniquement
- `⚠️ Déprécié` - Fonctionnalités qui seront retirées

---

## Format de version

**MAJOR.MINOR.PATCH**

- **MAJOR** : Changements incompatibles avec l'API
- **MINOR** : Ajout de fonctionnalités rétro-compatibles
- **PATCH** : Corrections de bugs rétro-compatibles

---

**Dernière mise à jour** : 4 novembre 2025  
**Version actuelle** : 1.0.0 - V1DEV
