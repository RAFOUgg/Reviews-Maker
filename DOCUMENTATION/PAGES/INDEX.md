# Documentation PAGES — Index (état réel, vérifié 2026-06-19)

> Cet index a été corrigé : l'ancienne version pointait vers des dizaines de fichiers qui n'ont jamais existé (`BIBLIOTHEQUE/CULTIVARS/INDEX.md`, `PROFILS/INFORMATIONS_PERSONNELLES/INDEX.md`, `Home/NAVIGATION/INDEX.md`, `GALERIE_PUBLIQUE/INDEX.md`, etc.). Tous les liens ci-dessous mènent vers des fichiers réels, réécrits pour refléter le code actuel plutôt qu'une spec aspirationnelle.

## Création de Reviews

- [Fleurs](./CREATE_REVIEWS/FLEURS/INDEX.md) — 11 sections, pipeline Culture + Curing, **upload analytics cassé** (bug connu)
- [Hash](./CREATE_REVIEWS/HASHS/INDEX.md) — 9 sections, pipeline Séparation + Curing, upload analytics ✅
- [Concentrés](./CREATE_REVIEWS/CONCENTRES/INDEX.md) — 9 sections, pipeline Extraction + Curing, upload analytics ✅
- [Comestibles](./CREATE_REVIEWS/COMESTIBLES/INDEX.md) — 4 sections seulement (pas de section Analytiques par design)
- [Système Pipeline](./CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md) — architecture réelle du drag-and-drop, presets, bibliothèque de setups

## Bibliothèque (Library)

- [Bibliothèque](./BIBLIOTHEQUE/INDEX.md) — 6 onglets réels (Reviews, Templates, Filigranes, Données récurrentes*, Cultivars & Génétiques*, Stats) — *Producer uniquement
- [PhenoHunt](./BIBLIOTHEQUE/Phenohunt/phenohunt_sys.md) — arbre généalogique React Flow, état réel + notes de vision

## Compte

- [Profils / Compte](./PROFILS/INDEX.md) — tiers réels, KYC, OAuth, **paiement mocké** (point critique)

## Accueil & Galerie

- [Home](./Home/INDEX.md) — landing page simple + galerie publique (qui, elle, est complète et fonctionnelle)

## Admin

- [Panneau Admin](./PANNEAU_ADMIN/ADMIN_PANEL_README.md) — gestion utilisateurs, tiers, bans

## Systèmes transversaux

- [Systèmes Globaux](./SYSTEMES_GLOBAUX.md) — Export Maker, Auth, DB, fichiers, sécurité
- [Permissions](./PERMISSIONS.md) — tiers, quotas réels, formats d'export par tier, **paiement non implémenté**
- [Schémas de Données](./DONNEES_SCHEMAS.md) — vrai schéma Prisma (pas le modèle générique fictif de l'ancienne version)

## Archive historique (ne pas utiliser comme référence d'état actuel)

- `IN_DEV/` (dossier `DOCUMENTATION/IN_DEV/`) — logs de sprints/audits passés, datés, utiles pour l'historique mais pas pour l'état courant
- `CREATE_REVIEWS/FLEURS/PHASE_1_*`, `SYNTHESE_ARCHITECTURE.md`, `START_HERE.md`, etc. — artefacts de développement de la Phase 1, supersédés par `FLEURS/INDEX.md` ci-dessus
- `00-VALIDATION_SYNTHESE.md`, `PAGES_AUDIT_MISSING.md` (racine `DOCUMENTATION/`), `DOCUMENTATION_COMPLETE.md`, `INDEX_TECHNIQUE_MASTER.md`, `DATA.md` — checklists/audits de sessions précédentes référençant des fichiers jamais créés ou depuis remplacés
