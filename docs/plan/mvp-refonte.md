# Refonte MVP — plan d'exécution (révisé 2026-10-28)

Source : `rafou's plan.md` (racine du repo) + brainstorming du 2026-10-28. Contexte projet : `CLAUDE.md`.
Ce fichier est la version de référence (lue par Hermes sur le VPS) ; `~/.claude/plans/mvp-refonte-2026-10.md` en est une copie.

**Objectif MVP : démo à des partenaires.** Cible : producteurs/farms/ingénieurs 50 %, consommateurs 35 %, influenceurs 15 %.
**3 parcours de démo qui doivent être impeccables de bout en bout :**
- **A** — culture saisie (pipelines) → fiche technique exportée (PNG/PDF/HTML).
- **B** — Fleur → Hash → Rosin : lignage multi-review, page `/r/:id/lineage`.
- **C** — QR sur sachet → fiche publique lisible au téléphone.

Règle : 1 lot = 1 session ≤ 40k tokens = 1 branche `mvp/Lx-nom`. Jamais de push direct sur `main` (auto-push actif), jamais de déploiement automatique.

## Règles pour tout agent exécutant (Claude Code ou Hermes)
1. Lire `CLAUDE.md` § « Conventions & pièges » avant de toucher au code.
2. Ne jamais deviner un nom de champ : vérifier `fieldRegistry.js`, `DEFAULT_CONFIG.contentModules`, `*SidebarContent.js` (bug reproduit 8 fois).
3. Filet réel = `npm run build` + `npm run lint:critical` + sondes `tools/export-audit/*.mjs`.
4. Tout changement de rendu → vérif Playwright + PNG exporté réel, pas juste le DOM.
5. Aucune écriture directe en base pour contourner l'auth (`isPublic` etc.) — fixture jetable via route de création.
6. Fin de lot : résumé 5-10 lignes en mémoire (ou dans la PR pour Hermes), puis STOP — validation humaine avant le lot suivant.
7. **Statuts** (ligne `Statut :` sous chaque titre) : `à faire` / `prêt` (validé par l'humain → autorisé pour Hermes) / `en cours` / `PR ouverte` / `fait`. **Hermes ne prend que le premier lot `prêt` dans l'ordre ci-dessous, et jamais un lot portant un ⚠ non levé.** Seul l'humain passe un lot à `prêt` ou `fait`.
8. Interdits pour Hermes : `main`, `deploy.sh`, `/home/ubuntu/Reviews-Maker`, la base et le `.env` de prod, `ssh` vers un autre hôte.

---

## Ordre
**Jalon DÉMO :** L0 → L11 → L1 → L2 → L16 → L3 → L6 → L7 → L8 → L15a → L18 → L19 → L12a
**Après la démo :** L5 → L4 → L9 → L10 → L14 → L17 → L12b → L13 → L15b
Bloquants humains (⚠) : L3 (cas cassés), L10 (infos légales), L13 (preuve KYC influenceur), L15a (validation page de référence), L17 (clés PayPal).

---

## Jalon DÉMO

### L0 — Filet de sécurité
Statut : fait (2026-10-28, `npm run lint:critical`)
- `client/eslint.config.js` (ESLint 9 flat config) ; `@testing-library/dom` en devDependency.
- **Accepté si** : `npm run lint` s'exécute ; `npm test` collecte 136+ tests.

### L11 — Sécurité interne
Statut : fait (2026-10-28, 10 correctifs déployés ; reste : ligne `ADMIN_MODE` à retirer du `.env` VPS, `npm audit` serveur non appliqué)
- Audit routes `server-new/routes/*` : auth, IDOR, rate limiting, validation, uploads, en-têtes, secrets.
- **Accepté si** : chaque route sensible testée par curl sans session → 401/403.

### L1 — Corrections rapides formulaires/pipelines
Statut : à faire
- Pipelines : « Définir une évolution… » désactivé si < 2 cellules sélectionnées (`CellContextMenu.jsx` ~l.204, `PipelineDragDropView.jsx`).
- Jauges chiffrées : min/max explicites affichés (densité, dureté, collant, viscosité, résidus, melting au toucher, intensité gustative, agressivité/piquant). Lire les définitions réelles, ne pas inventer d'échelle.
- Effets : puissance /10 par effet (nouveau champ → schéma Prisma + routes des 4 types + `fieldRegistry.js`).
- **Accepté si** : sonde `curve-check.mjs` adaptée (1 cellule → entrée inactive) ; champ puissance persisté puis relu en base après rechargement.

### L2 — Export Maker : mode écran automatique
Statut : à faire
- Retirer les boutons PC/Téléphone et le bandeau « Mode Écran — la fiche telle qu'elle s'affiche en ligne… » (`ScreenPreviewPane.jsx`). Format déduit de la largeur (déjà le cas dans `SingleReviewCard`, seuil 760px).
- **Accepté si** : `screen-devices-check.mjs` vert ; texte du bandeau absent du DOM.

### L16 — Code de lot + QR (parcours C)
Statut : à faire
- `Review.shareCode String? @unique` (absent aujourd'hui ; convention déjà utilisée par `GeneticTree`/`ProductionChain`/`TemplateShare` dans `schema.prisma`). Généré au passage en public ; réutiliser le générateur existant (grep `shareCode` dans `server-new/routes/genetics.js` / `production-chains.js`).
- Route courte `/l/:code` → `/r/:id` : `GET /api/reviews/by-code/:code` côté serveur, droits via `resolveReviewForRead()` (`routes/reviews.js`).
- Étiquette imprimable (QR + code lisible + nom) : `qrcode.react` déjà présent ; QR déjà rendu dans `TraceabilityReportTemplate.jsx`/`DetailedCardTemplate.jsx` → les faire pointer sur `/l/:code`.
- **Accepté si** : QR scanné au téléphone (390×844) ouvre la fiche ; review privée → 403, aucune fuite.

### L3 — Export Maker : export réellement fonctionnel (parcours A et B)
Statut : à faire ⚠ l'humain fournit d'abord 1 review + 1 template + 1 format qui cassent, avec capture.
- Périmètre : PNG/PDF/HTML de `detailedCard` et `traceabilityReport`. Repro → fix → sonde de non-régression dédiée.
- Export HTML autonome ; si impossible pour un format, QR vers `/l/:code` (L16).
- **Accepté si** : les cas fournis exportent correctement (vérifiés à l'œil) ; 6 sondes existantes vertes.

### L6/L7/L8 — Sélecteurs de couleur visuels (1 lot par type)
Statut : à faire
- L6 Fleur : bud SVG peint par gradient (remplace le choix actuel, trop d'actions).
- L7 Séparation : hash SVG, palette + violet + blanc.
- L8 Extraction : rosin jar SVG, palette + violet + rouge.
- Composant partagé créé en L6, réutilisé L7/L8. Valeur stockée compatible avec l'existant (lire le format actuel avant).
- **Accepté si** : ≤ 3 actions pour définir une couleur ; anciennes reviews s'affichent toujours.

### L15a — DA des écrans de démo : plus pro, moins enfantine, pas « rendu IA »
Statut : à faire ⚠ direction validée par l'humain sur 1 page de référence AVANT le rollout.
- Périmètre : formulaires Fleur/Hash/Rosin, Export Maker, `/r/:id`, `/r/:id/lineage`, étiquette QR.
- Pistes : sobriété des glows violets, typographie plus éditoriale, moins d'emojis décoratifs, un seul set d'icônes, hiérarchie par l'espacement, couleurs sémantiques fixes.
- **Accepté si** : page de référence validée ; les 3 parcours rendus dans la nouvelle DA.

### L18 — Exploitation prod
Statut : à faire
- Sauvegarde quotidienne de la SQLite (pas de CLI `sqlite3` sur le VPS → script Node `VACUUM INTO` via Prisma `$executeRawUnsafe`), rotation 14 jours, copie hors VPS.
- Surveillance : `/api/health` et redémarrages `pm2` → remontés dans le rapport matinal Hermes.
- **Accepté si** : restauration testée sur une copie → base lisible, reviews présentes.

### L19 — Onboarding + SEO
Statut : à faire
- Parcours guidé d'un nouveau compte producteur : créer la farm → première review Fleur → premier export.
- `/r/:id` indexable : meta/OG dynamiques, `robots.txt`, `sitemap.xml` des reviews publiques (aucun n'existe aujourd'hui).
- **Accepté si** : aperçu OG correct sur un lien partagé ; nouveau compte guidé jusqu'au premier export.

### L12a — Review au nom de la farm
Statut : à faire
- Existant : SIRET vérifié, `ProducerProfile` + `CompanyMember`, `services/access.js`. Une review créée par un membre s'affiche au nom de l'entreprise (fiche, `/r/:id`, étiquette QR).
- **Accepté si** : review créée par un membre → nom de la farm sur la fiche publique ; un non-membre ne peut pas l'éditer (testé serveur).

---

## Après la démo

### L5 — Mode auto téléphone = parité mode normal
Statut : à faire
- Mêmes champs et outils que le mode normal, ergonomie tactile (`client/src/components/wizard/`).
- **Accepté si** : `mobile-forms-check.mjs` étendue — chaque section du mode normal a son équivalent en mode auto (390×844).

### L4 — Galerie publique : lisibilité + social de base
Statut : à faire
- Pseudo auteur cliquable → `ProfileModal`. Carte : Séparation = % cannabinoïde max + maillage + farm ; Fleur = producteur + strain + % max (`HomeReviewCard.jsx`).
- Likes : `ReviewLike` existe → câbler UI + compteur profil (`totalLikes`).
- **Accepté si** : like persisté et compté, profil ouvert au clic, infos visibles sur cartes Fleur et Hash réelles.

### L9 — Audit scientifique des données (lecture seule)
Statut : à faire
- Repartir de `DOCUMENTATION/DATA_REFERENCE/` (tiers T1-T5, `13_REGISTRE_SOURCES.md`). Couvrir échelles, unités, plages, listes des 4 types + pipelines + `cannabinoids.js`/`terpenes.js`.
- Livrable : tableau manque/erreur/ajustement par champ, avec source.
- **Accepté si** : chaque champ chiffré a une plage sourcée ou est marqué « non sourcé ».

### L10 — Mentions légales
Statut : à faire ⚠ raison sociale, adresse, contact, hébergeur fournis par l'humain ; textes à faire valider par un juriste.
- Résidu « Orchard Studio » / `legal@orchardstudio.app` (`server-new/routes/legal.js` + doublon `LegalNoticeModal.jsx` → une seule source).
- Bandeau cookies CNIL (refus aussi simple qu'accepter) après inventaire des cookies/localStorage réels.
- **Accepté si** : aucune mention « Orchard » servie ; cookies non essentiels bloqués avant consentement.

### L14 — Harmonisation des fonctionnalités redondantes
Statut : à faire
- Inventaire puis 1 fusion par lot : `ExportMaker.jsx`/`ExportModal.jsx`, `FieldRenderer.jsx`/`FieldRendererClean.jsx`, `Template`/`TemplateShare`/`SavedTemplate`, `usePhotoUpload` ×4, morts : `pipelineConfigs.js`, `EditReviewPage.jsx`, `StubTabs.jsx`, `ModuleBuilder.jsx`, `config/stripe.js`.
- Supprimer seulement après grep des imports + build vert.
- **Accepté si** : build + sondes vertes après chaque fusion ; zéro import cassé.

### L17 — Paiement PayPal réel
Statut : à faire ⚠ l'humain pose les clés (sandbox d'abord).
- Documenter `PAYPAL_ENV`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_PLAN_ID_INFLUENCER`, `PAYPAL_PLAN_ID_PRODUCER` dans `server-new/.env.example` ; retirer le bloc Stripe mort.
- **Accepté si** : `isPaypalConfigured()` vrai en sandbox ; abonnement test de bout en bout.

### L12b — Entreprise complète
Statut : à faire
- Invitation/retrait de membres, rôles hiérarchiques, logs d'actions (`AuditLog`).
- **Accepté si** : un membre à rôle limité se voit refuser une action réservée (testé serveur).

### L13 — Comptes Pro : Influenceur (KYC)
Statut : à faire ⚠ l'humain définit la preuve exigée avant de coder.
- Réutiliser `routes/kyc.js` (fonctionnel, UI orpheline), pas `userKYC.js` (mort).
- **Accepté si** : dépôt → validation admin → badge, de bout en bout.

### L15b — DA reste de l'app
Statut : à faire
- Couverture LiquidUI restante : `AdminPanel`, `FieldRenderer`, sous-modales Export Maker, `pipelines/legacy/`, `PipelineDragDropView`, dans la direction validée en L15a.
- **Accepté si** : plus aucun contrôle Tailwind brut dans ces zones.

---

## Post-MVP (à cadrer un par un)
- Emojis → images réelles (forms, filtres galerie, exports). ⚠ Pas de scraping Google : droits d'auteur. Photos propres, banques sous licence libre, ou génération IA.
- Partage réseaux sociaux.
- « Créer une review sur ce produit » (clic droit, reviews producteur uniquement).
- Gamification. Statistiques globales/publiques. Rapports & alertes / détection d'anomalies.
- GrowBrain IoT : **hors de ce repo** (`growbrain.terpologie.eu`).
