# Bibliothèque (Library) — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit. La version précédente décrivait un modèle `LibraryItem` générique fictif et une structure de sous-dossiers (`CULTIVARS/`, `REVIEWS/`, `TEMPLATES/`, etc.) qui n'existe pas dans le code — la page réelle est un composant unique à onglets.

## Vue d'ensemble

- **Page** : `client/src/pages/library/LibraryPage.jsx` (326 lignes), 6 onglets
- **Garde de tier réel** (l.103-104) :
  ```js
  const isProducer = user?.accountType === 'producer'
  const availableTabs = TABS.filter(t => t.all || (t.producerOnly && isProducer))
  ```

## Les 6 onglets réels

| Onglet | Fichier | Disponibilité réelle | Routes API | Modèle Prisma |
|---|---|---|---|---|
| Reviews | `ReviewsTab.jsx` | Tous tiers | `GET /api/reviews/my`, `DELETE /api/reviews/:id`, `PATCH /api/reviews/:id/visibility` | `Review` + sous-types |
| Templates | `TemplatesTab.jsx` | Tous (quota par tier) | `GET/POST /api/library/templates`, `GET/DELETE/PUT /api/library/templates/:id`, `POST .../share` | `ExportTemplate`, `TemplateShare` |
| Filigranes | `WatermarksTab.jsx` | Tous (quota par tier, Consumer = 0) | `GET/POST /api/library/watermarks`, `PUT/DELETE .../:id`, `POST .../upload` | `Watermark` |
| Données récurrentes | `DataTab.jsx` | **Producer uniquement** (`producerOnly: true`) | `GET/POST /api/library/data`, `PUT/DELETE .../:id` | `SavedData` |
| Cultivars & Génétiques | `CultivarsTab.jsx` | **Producer uniquement** (`producerOnly: true`) | `GET /api/library/cultivars` (alias `/api/cultivars`), `GET /api/genetics/trees` | `Cultivar`, `GeneticTree`, `GenNode`, `GenEdge` |
| Stats | `StatsTab.jsx` | Tous tiers | — | `UserStats` |

### Détails par onglet

**Reviews** : filtres type produit + visibilité, vues Grille/Liste/Timeline. La **duplication de review est en développement** (TODO visible dans le code, ligne ~175) — pas encore fonctionnelle.

**Templates** : quotas réels (`EXPORT_LIMITS` dans `server-new/middleware/permissions.js`) — Consumer 3 max, Influencer 20 max, Producer illimité. Partage via code unique (`TemplateShare`).

**Filigranes** : Consumer = **0 filigrane autorisé** (bloqué complètement), Influencer 10 max, Producer illimité. CRUD complet, position (9 zones), opacité, rotation, upload image.

**Données récurrentes** (Producer only) : substrats, engrais, matériel (6 catégories), techniques de culture, presets environnement par phase — stockées génériquement dans `SavedData` (`dataType`, `category`, `data` JSON).

**Cultivars & Génétiques** (Producer only) : bibliothèque de cultivars + arbres généalogiques PhenoHunt — voir [Phenohunt/phenohunt_sys.md](./Phenohunt/phenohunt_sys.md).

**Stats** : agrégats sur `UserStats` (reviews par type, exports par format, likes/vues/partages/commentaires reçus).

## Fichiers référence

- Frontend : `client/src/pages/library/LibraryPage.jsx` + `client/src/pages/library/tabs/*.jsx`
- Backend : `server-new/routes/library.js`, `server-new/routes/cultivars.js`, `server-new/routes/genetics.js`
- Permissions/quotas : `server-new/middleware/permissions.js` (`EXPORT_LIMITS`)
- Schéma : `server-new/prisma/schema.prisma` (modèles `ExportTemplate`, `TemplateShare`, `Watermark`, `SavedData`, `Cultivar`, `GeneticTree`, `GenNode`, `GenEdge`, `UserStats`)
