# 🚀 Plan de Travail - Refonte Reviews-Maker

**Date de début** : 3 novembre 2025  
**Mode** : Développement local (pas de VPS/domaine)  
**Stack** : React + Vite + Prisma + Discord OAuth2

---

## 📋 Phase 0 : Préparation du Plan de Travail ✅

### ✅ Étape 0.1 : Sauvegardes
- [x] Backup de `db/reviews.sqlite`
- [x] Backup de `db/review_images/`

### ✅ Étape 0.2 : Documentation
- [x] REFONTE_AUTONOME_2025.md (architecture)
- [x] PLAN_IMPLEMENTATION.md (roadmap)
- [x] DESIGN_SYSTEM.md (UI/UX)
- [x] UX_SAISIE_FACILITEE.md (composants interactifs)
- [x] INDEX_REFONTE.md (hub central)

### 🔄 Étape 0.3 : Préparation des Listes de Données
- [ ] Extraire profils terpéniques depuis `UI-Graphics-REFONTE/roue des terpènes.png`
- [ ] Créer liste complète des **goûts** (saveurs)
- [ ] Créer liste complète des **odeurs** (arômes)
- [ ] Créer liste complète des **effets** (physiques + mentaux)
- [ ] Créer profils terpéniques associés
- [ ] Créer fichier JSON de référence

### 📁 Étape 0.4 : Organisation du Workspace
- [ ] Créer dossier `client/` pour React frontend
- [ ] Créer dossier `server-new/` pour nouveau backend Prisma
- [ ] Créer dossier `data/` pour listes JSON (goûts/odeurs/effets)
- [ ] Créer dossier `docs-refonte/` pour regrouper toute la doc

---

## 🎯 Phase 1 : Initialisation Projet Frontend

### Étape 1.1 : Setup Vite + React
```powershell
npm create vite@latest client -- --template react
cd client
npm install
```

### Étape 1.2 : Dépendances UI
```powershell
npm install react-router-dom zustand framer-motion
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Étape 1.3 : Configuration TailwindCSS
- [ ] Configurer `tailwind.config.js` avec thème personnalisé
- [ ] Importer directives dans `index.css`

---

## 🔧 Phase 2 : Initialisation Projet Backend

### Étape 2.1 : Setup Prisma + Express
```powershell
cd server-new
npm init -y
npm install express prisma @prisma/client
npm install dotenv cors express-session
npx prisma init --datasource-provider sqlite
```

### Étape 2.2 : Schema Prisma
- [ ] Copier schema depuis `REFONTE_AUTONOME_2025.md`
- [ ] Adapter modèle Review avec champs terpènes/tags
- [ ] `npx prisma migrate dev --name init`

### Étape 2.3 : Discord OAuth2
- [ ] Créer app Discord Developer Portal
- [ ] Configurer redirects localhost:5173
- [ ] Créer `.env` avec Client ID/Secret

---

## 📊 Phase 3 : Migration des Données

### Étape 3.1 : Export données SQLite existantes
```powershell
node scripts/export-users-list.js
```

### Étape 3.2 : Script de migration
- [ ] Créer `scripts/migrate-reviews-to-prisma.js`
- [ ] Mapper anciens champs → nouveaux champs
- [ ] Migrer images (copie vers nouveau dossier)
- [ ] Validation + logs d'erreurs

---

## 🎨 Phase 4 : Implémentation UI/UX

### Étape 4.1 : Composants de base
- [ ] Button, Card, Modal, Input (Design System)
- [ ] Layout principal avec navigation
- [ ] Page d'accueil (grille de reviews)

### Étape 4.2 : Composants Terpènes/Tags
- [ ] TerpeneWheel (basé sur `roue des terpènes.png`)
- [ ] QuickRating (boutons 1-10)
- [ ] TagSelector (goûts/odeurs/effets)
- [ ] StrainRatioSlider (Indica/Sativa)

### Étape 4.3 : Pages principales
- [ ] Page liste reviews (filtres, recherche)
- [ ] Page détail review (affichage complet)
- [ ] Page création/édition review (formulaire simplifié)

---

## 🔐 Phase 5 : Authentification Discord

### Étape 5.1 : Backend Auth
- [ ] Routes `/auth/discord` et `/auth/discord/callback`
- [ ] Middleware de vérification session
- [ ] Génération tokens JWT

### Étape 5.2 : Frontend Auth
- [ ] Hook `useAuth` avec Zustand
- [ ] Composant Login/Logout
- [ ] Redirection protégée

---

## 🧪 Phase 6 : Tests & Validation

### Étape 6.1 : Tests fonctionnels
- [ ] Création review avec nouveaux composants
- [ ] Affichage reviews existantes (migration)
- [ ] Upload images
- [ ] Filtres par tags/terpènes

### Étape 6.2 : Tests performance
- [ ] Chargement grille 100+ reviews
- [ ] Animations 60fps
- [ ] Taille bundle frontend

---

## 📦 Phase 7 : Build & Packaging

### Étape 7.1 : Build Production
```powershell
cd client
npm run build
```

### Étape 7.2 : Configuration serveur
- [ ] Express serve `client/dist`
- [ ] Routes API `/api/*`
- [ ] Routes statiques `/images/*`

### Étape 7.3 : Script de lancement
- [ ] `start.ps1` (Windows PowerShell)
- [ ] Variables d'environnement
- [ ] Port configuration

---

## 🎉 Phase 8 : Lancement

### Checklist finale
- [ ] Toutes les reviews migrées
- [ ] Toutes les images accessibles
- [ ] Auth Discord fonctionnelle
- [ ] Interface fluide et responsive
- [ ] Backup final avant switch

### Go Live
```powershell
# Arrêter ancien serveur
pm2 stop reviews-maker

# Lancer nouveau serveur
cd server-new
npm start
```

---

## 📝 Notes importantes

### Ressources clés
- **Image roue terpènes** : `UI-Graphics-REFONTE/roue des terpènes.png`
- **Backup BDD** : `db-backup-2025-10-23_131255.tgz`
- **Doc complète** : `INDEX_REFONTE.md`

### Décisions techniques
- SQLite en dev, PostgreSQL optionnel pour scale
- Email en mode DEV = console.log (pas d'envoi réel)
- Discord OAuth2 direct (pas de LaFoncedalleBot)
- Coût total : **0€** (tout en local)

### Prochaines actions immédiates
1. **Créer listes goûts/odeurs/effets** basées sur roue terpènes
2. **Organiser workspace** (dossiers client/server-new/data)
3. **Initialiser React + Vite**
4. **Initialiser Prisma + Express**

---

**Objectif** : Site autonome, rapide, avec UX 10x meilleure pour la saisie de reviews cannabis ! 🌿✨
