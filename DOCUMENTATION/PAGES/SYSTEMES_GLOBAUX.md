# Systèmes Globaux — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit. Plusieurs sections de la version précédente étaient aspirationnelles (CSV/JSON/HTML annoncés "tous tiers" alors qu'ils sont Producer-only ; pas de mention du paiement mocké ; système Pipeline décrit avec un modèle générique fictif). Voir aussi [PERMISSIONS.md](./PERMISSIONS.md), [PROFILS/INDEX.md](./PROFILS/INDEX.md), [CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md](./CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md) pour le détail de chaque système.

## 1. Export Maker

**Fichier** : `client/src/components/export/ExportMaker.jsx` (>1000 lignes)

- **Formats réellement implémentés** (`server-new/middleware/permissions.js`, `EXPORT_FORMATS`) : PNG/JPEG/PDF (tous tiers), SVG/GIF (Influencer+), CSV/JSON/HTML (Producer/Merchant uniquement — pas "tous" comme l'ancienne doc le disait)
- **Qualité** : 150 DPI (Consumer), 300 DPI (Influencer/Producer)
- **Templates** : système basé sur `orchardStore`/`DEFAULT_TEMPLATES` — vérifier les IDs actuels dans `client/src/components/export/orchardConstants.js` avant de s'y référer dans du code, les noms ont été remaniés au moins une fois (anciens noms `modernCompact`/`detailedCard`/`blogArticle`/`socialStory` repérés dans `TEMPLATE_MODULE_PRESETS`, possiblement remappés vers `compact`/`detailed`/`standard` côté store — à confirmer avant toute intégration)
- **Personnalisation custom (drag & drop layout)** : Producer uniquement (`canCreateCustomTemplate`)
- **`ExportModal.jsx` legacy** : toujours présent dans le repo mais plus importé nulle part — code mort, candidat à suppression

## 2. Authentification & Sessions

- **OAuth réellement configuré** : Discord, Google. Apple/Amazon/Facebook ont le code de vérification mais pas de credentials renseignées actuellement (voir [PROFILS/INDEX.md](./PROFILS/INDEX.md))
- Email/mot de passe : fonctionnel (bcrypt)
- 2FA (TOTP) : champs DB + service existent, branchement complet au flux de login non confirmé
- **🔴 Bypass développement** : `server-new/middleware/auth.js` injecte un faux utilisateur (tier Producer) sur toute route protégée quand `NODE_ENV=development`. Ne jamais déployer avec cette variable en production.
- Sessions : `connect-sqlite3` (`server-new/session-options.js`), cookie `sessionId`, `secure`/`sameSite` pilotés par `NODE_ENV`/env vars

## 3. Base de Données

- **ORM** : Prisma, **SQLite** (dev et — à vérifier — prod ; pas de confirmation d'un vrai PostgreSQL en prod lors de cet audit, contrairement à ce qu'annonçait l'ancienne doc)
- Pas de modèle `Review` générique unique avec sous-tables `ReviewSection`/`Pipeline`/`PipelineStage` — chaque type de produit a son propre modèle complet (`FlowerReview`, `HashReview`, `ConcentrateReview`, `EdibleReview`) avec ses colonnes directement, liés à un `Review` commun (métadonnées partagées). Voir [DONNEES_SCHEMAS.md](./DONNEES_SCHEMAS.md) pour le détail réel.

## 4. Gestion des Fichiers

- Photos de review : multer, champs `images`/`photos` selon le type (voir docs `CREATE_REVIEWS/*`)
- Certificats labo/terpènes : `certificateFile`/`terpeneFile` — **fonctionne pour Hash/Concentrate uniquement**, cassé pour Flower (mauvais nom de champ multer), absent par design pour Edible. Voir mémoire projet `ARCHITECTURAL_AUDIT_2026-04-01.md`.
- Documents KYC : `server-new/routes/kyc.js`, stockage disque `/db/kyc_documents/{userId}/`

## 5. Internationalisation (i18n)

- `client/src/i18n/` (react-i18next), locales `fr`/`en` — non ré-audité en détail dans cette passe, considéré stable.

## 6. Données Statiques (JSON)

- `data/aromas.json`, `data/effects.json`, `data/tastes.json`, `data/terpenes.json` — non ré-audités en détail, considérés stables.

## 7. Système Pipeline

Voir [CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md](./CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md) — réécrit en détail. Pour mémo : pas de table Prisma `Pipeline`/`PipelineStage`, chaque type stocke ses pipelines en colonnes JSON-string directement sur son modèle (`cultureTimelineConfig`/`cultureTimelineData`, etc.).

## 8. Permissions

Voir [PERMISSIONS.md](./PERMISSIONS.md) — réécrit avec les vraies limites/formats et le constat que **le paiement n'est pas implémenté** (tiers modifiables sans paiement réel via admin ou DB directe).

## 9. UI/UX

Stack confirmée : Tailwind CSS, Framer Motion, Lucide React, dnd-kit/react-dnd (drag & drop pipelines), Recharts. Style "Liquid UI" custom (`client/src/components/ui/LiquidUI.jsx`). Non ré-audité en détail dans cette passe.

## 10. Statistiques Utilisateur

Modèle réel `UserStats` (pas l'ancien schéma générique) — voir [DONNEES_SCHEMAS.md](./DONNEES_SCHEMAS.md) et [BIBLIOTHEQUE/INDEX.md](./BIBLIOTHEQUE/INDEX.md) (onglet Stats).

## 11. Recherche & Galerie

Voir [Home/INDEX.md](./Home/INDEX.md) — la Galerie publique (`server-new/routes/gallery.js`) est réellement fonctionnelle (likes, commentaires, vues, filtres, tri). La "recherche globale" multi-entités décrite dans l'ancienne doc Home n'existe pas.

## 12. Sécurité

Points réels à connaître, au-delà des mesures standard (Helmet, CORS, bcrypt) :
- Bypass d'auth en dev (voir section 2)
- `ADMIN_MODE=true` bypass total de l'admin en dev (voir [PANNEAU_ADMIN/ADMIN_PANEL_README.md](./PANNEAU_ADMIN/ADMIN_PANEL_README.md))
- Paiement mocké — aucune transaction réelle ne protège l'accès aux tiers payants actuellement

## 13. Déploiement

Non ré-audité dans cette passe (scripts VPS/PM2/Nginx) — voir fichiers `DEPLOY_*.md`/`VPS_*.md` à la racine du repo pour l'état des scripts de déploiement (hors périmètre de cette mise à jour documentaire).

## 📚 Fichiers Référence

- Frontend : `client/src/`
- Backend : `server-new/`
- Schéma DB : `server-new/prisma/schema.prisma`
