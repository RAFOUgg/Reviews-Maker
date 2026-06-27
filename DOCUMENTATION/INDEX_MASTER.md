# 📚 DOCUMENTATION REVIEWS-MAKER - INDEX MASTER

**Dernière mise à jour** : 19 juin 2026 (révision complète après audit du code réel)
**Référence à jour** : [PAGES/INDEX.md](./PAGES/INDEX.md) — chaque document de ce dossier a été comparé au code réel et réécrit en conséquence.

---

## 🚀 COMMENCER ICI

Toute la documentation fonctionnelle à jour vit sous [PAGES/](./PAGES/INDEX.md) :

| Domaine | Document |
|---|---|
| Création de reviews (4 types) | [PAGES/CREATE_REVIEWS/*/INDEX.md](./PAGES/INDEX.md#création-de-reviews) |
| Système Pipeline | [PAGES/CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md](./PAGES/CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md) |
| Bibliothèque / PhenoHunt | [PAGES/BIBLIOTHEQUE/INDEX.md](./PAGES/BIBLIOTHEQUE/INDEX.md) |
| Compte / Profil | [PAGES/PROFILS/INDEX.md](./PAGES/PROFILS/INDEX.md) |
| Home / Galerie | [PAGES/Home/INDEX.md](./PAGES/Home/INDEX.md) |
| Admin | [PAGES/PANNEAU_ADMIN/ADMIN_PANEL_README.md](./PAGES/PANNEAU_ADMIN/ADMIN_PANEL_README.md) |
| Permissions / Tiers | [PAGES/PERMISSIONS.md](./PAGES/PERMISSIONS.md) |
| Systèmes globaux | [PAGES/SYSTEMES_GLOBAUX.md](./PAGES/SYSTEMES_GLOBAUX.md) |
| Schémas de données | [PAGES/DONNEES_SCHEMAS.md](./PAGES/DONNEES_SCHEMAS.md) |

## 📁 Dossier `IN_DEV/`

`IN_DEV/` contient ~60 fichiers d'audits, sprints et rapports de session datés (janvier-avril 2026). C'est une **archive historique du développement**, pas une référence d'état actuel — beaucoup de ces audits ont des pourcentages de conformité et des listes de blockers qui ont depuis été traités (ou ont évolué différemment). Pour l'état courant, toujours préférer `PAGES/`.

## 📁 Dossier `CDC/`

`CDC/COMPONENTS/` documente un composant spécifique (`FertilizationPipeline`) en détail technique — non ré-audité dans cette révision, à vérifier avant usage si le composant a évolué.

---

## 🔴 Points critiques vérifiés (2026-06-19) — à connaître avant toute estimation produit

1. **Paiement non implémenté** : `server-new/routes/payment.js` est un stub complet (Stripe commenté, sessions mock). Les tiers payants (Influencer/Producer) sont activables sans aucune transaction réelle, via le panneau admin ou en base directement. Voir [PERMISSIONS.md](./PAGES/PERMISSIONS.md) et [PROFILS/INDEX.md](./PAGES/PROFILS/INDEX.md).
2. **Upload de certificats d'analyse cassé pour Flower et absent pour Edible** : fonctionne pour Hash/Concentrate. Voir mémoire projet `ARCHITECTURAL_AUDIT_2026-04-01.md` et [CREATE_REVIEWS/FLEURS/INDEX.md](./PAGES/CREATE_REVIEWS/FLEURS/INDEX.md).
3. **Bypass d'authentification en développement** : `NODE_ENV=development` injecte un faux utilisateur tier Producer sur toute route protégée (`server-new/middleware/auth.js`). Pareil pour `ADMIN_MODE=true`. Ne jamais activer en production.
4. **Code mort confirmé** dans le système Pipeline : `PipelineCore.jsx`, `PipelineCellEditor.jsx`, `PipelineManager.jsx`, et plusieurs composants `legacy/` référencés uniquement par des pages de redirection deprecated. Voir [PIPELINE_SYSTEME/sys.md](./PAGES/CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md).

## 🔗 LIENS RAPIDES

- Frontend : `client/src/`
- Backend : `server-new/`
- Schéma DB : `server-new/prisma/schema.prisma`
- Données statiques : `data/*.json`

---

*Ce fichier est le point d'entrée unique pour naviguer la documentation. Les anciens audits restent disponibles dans `IN_DEV/` à titre historique.*
