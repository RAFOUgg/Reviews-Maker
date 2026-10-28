# Refonte MVP — plan d'exécution (révisé 2026-10-28, soir)

Source : `rafou's plan.md` (racine du repo) + brainstorming du 2026-10-28 + constats de la session Claude du 2026-10-28.
Ce fichier est la version de référence (lue par Hermes sur le VPS) ; `~/.claude/plans/mvp-refonte-2026-10.md` en est une copie.

**Objectif MVP : démo à des partenaires.** Cible : producteurs/farms/ingénieurs 50 %, consommateurs 35 %, influenceurs 15 %.
**3 parcours de démo qui doivent être impeccables de bout en bout :**
- **A** — culture saisie (pipelines) → fiche technique exportée (PNG/PDF/HTML).
- **B** — Fleur → Hash → Rosin : lignage multi-review, page `/r/:id/lineage`.
- **C** — QR sur sachet → `/l/:code` → fiche publique lisible au téléphone (**livré, L16**).

Règle : 1 lot = 1 session ≤ 40k tokens = 1 branche `mvp/Lx-nom`, empilée sur la précédente.

## Règles pour tout agent exécutant (Claude Code ou Hermes)
1. Lire `CLAUDE.md` § « Conventions & pièges » avant de toucher au code.
2. Ne jamais deviner un nom de champ : vérifier `fieldRegistry.js`, `DEFAULT_CONFIG.contentModules`, `*SidebarContent.js` (bug reproduit 8 fois). `review.type` n'a PAS de forme uniforme (`Fleurs`, `hash`, `concentrate`, `edible`…) : toujours normaliser.
3. **Barrières, toutes obligatoires avant un commit** : `cd client && npm run lint:critical` (0 erreur hors fichiers listés comme mortes), `npm run build`, et les sondes `tools/export-audit/*.mjs` touchant la zone modifiée. Le build NE détecte PAS une variable non définie — seul `lint:critical` la voit.
4. Tout changement de rendu → vérif Playwright + capture réelle, pas juste le DOM.
5. Aucune écriture directe en base pour contourner l'auth (`isPublic` etc.) — fixture jetable via la route de création (`tools/export-audit/fixtures.mjs`), supprimée en fin de sonde. **Sur le VPS, `localhost:3000` est l'API de PRODUCTION.** Ne jamais y lancer une sonde ni un serveur de test : passer par `node tools/export-audit/run-all.mjs` (pile isolée : API dev :3199 + base SQLite jetable + Vite :5199, variables `AUDIT_BASE`/`AUDIT_API`/`VITE_API_PROXY_TARGET`). Chromium peut manquer de bibliothèques système sur le VPS : voir l'en-tête de `run-all.mjs`.
6. **Tests serveur** : en `NODE_ENV=development`, `requireAuth`/`optionalAuth` injectent un utilisateur de test auteur de toutes les fixtures → pour tester un VISITEUR anonyme, lancer un 2e serveur `NODE_ENV=test PORT=39xx`.
7. Toute migration Prisma : générée par `npx prisma migrate diff --from-schema-datasource … --to-schema-datamodel … --script` dans `prisma/migrations/<horodatage>_<nom>/` (`migrate dev` refuse le mode non interactif), appliquée en local par `migrate deploy`. `deploy.sh` l'applique en prod.
8. Fin de lot : résumé 5-10 lignes en mémoire (ou dans la description de branche pour Hermes) et mise à jour de la ligne `Statut :`.
9. **Statuts** : `à faire` / `prêt` / **`prêt — deploy main final`** / `en cours` / `PR ouverte` / `fait`. Hermes ne prend que les lots `prêt…`, dans l'ordre de la section « Nuit », et jamais un lot portant un ⚠ non levé. Seul l'humain passe un lot à `prêt` ou `fait`.
10. **`prêt — deploy main final`** (autorisé par l'humain le 2026-10-28) : chaque nuit, Hermes prend les lots `prêt — deploy main final` suivants dans l'ordre « Nuit », autant que le budget API le permet (référence : ~1 lot par nuit), chacun sur sa branche empilée, SANS merger. Puis il exécute **L20 en fin de nuit, à chaque fois**, sur la dernière branche produite : merge sur `main` + déploiement uniquement si toutes les barrières (règle 3) sont vertes. Une barrière rouge = rien n'est mergé ni déployé, rapport au matin. Un lot commencé mais non terminé avant la fin du budget n'est ni mergé ni déployé.
11. Interdits pour Hermes en toutes circonstances : la base et le `.env` de prod en écriture, `force-push`, suppression de branche, `ssh` vers un autre hôte, `git add -A` (des sessions parallèles laissent des fichiers non commités dans l'arbre — ajouter les fichiers un par un).

---

## État au 2026-10-28 soir

| Lot | Statut | Où |
|---|---|---|
| L0, L0b (lint/tests + crashs) | fait | `main` |
| L11 (sécurité, 10 correctifs) | fait, **déployé** | `main` + prod |
| L1, L2 | fait, **déployés** (2026-10-28 01:32, migration `effets_puissance` appliquée) | `main` + prod |
| L4 galerie + fix `optionalAuth` | fait, **déployé** (2026-10-28 22:07, main `86ef3b92`, migration `review_share_code` appliquée) | `main` + prod |
| L16 code de lot + QR | fait, **déployé** (2026-10-28 22:07, main `86ef3b92`, migration `review_share_code` appliquée) | `main` + prod |
| L6/L7/L8 couleurs à peindre | fait, **déployé** (2026-10-28 22:07, main `86ef3b92`, migration `review_share_code` appliquée) | `main` + prod |
| L21 sondes fiables + correctif `seal` | fait, **déployé** (2026-10-28 22:07, main `86ef3b92`, migration `review_share_code` appliquée) | `main` + prod |

Branches empilées : `main` ⊂ `mvp/L4-galerie` ⊂ `mvp/L16-code-lot` ⊂ `mvp/L6-couleurs`. **Point de départ de la nuit : `mvp/L6-couleurs`.**
Migration en attente de déploiement : `20261028020000_review_share_code` (branche L16).

**Reste : 13 lots du plan d'origine + 5 nouveaux = 18 lots.** 6 sont bloqués par un ⚠ humain (L3, L10, L13, L15a, L15b, L17) ; 12 sont prêts pour la nuit.

---

## Nuit (ordre d'exécution Hermes)
L21 → L22 → L23 → L24 → L12a → L19 → L18 → L5 → L9 → L14 → L12b, **puis L20 en fin de CHAQUE nuit** (merge + déploiement de ce qui a été terminé).
La première nuit, L20 intègre aussi les branches en attente (L4, L16, L6-L8) même si aucun lot n'a pu être fait.

### L21 — Sondes fiables (nouveau)
Statut : fait, **déployé** (2026-10-28 22:07, main `86ef3b92`). Barrières vertes sur l'arbre exact déployé : `lint:critical` 0 erreur, build, `run-all` **43/43** (pile isolée). Inclut le correctif `seal` (`/r/:id` réaffiche l'empreinte ; le Studio relit `updatedAt`). Lot suivant : L22, sur une branche partant de `main`.
- `pdf-check.mjs` et `format-check.mjs` sont PÉRIMÉES (datent du 2026-08-11 ; cherchent les boutons « A4 (Document) »/« Écran » déplacés le 2026-08-13 dans la modale d'export `ExportModal.jsx`/`RatioSelector.jsx`) → les réécrire sur l'UI actuelle.
- `tools/export-audit/run-all.mjs` : lance toutes les sondes en série (une fixture chacune), résumé OK/KO par sonde, code de sortie ≠ 0 si un KO. C'est la barrière de L20.
- **Accepté si** : `run-all` vert sur `mvp/L6-couleurs` ; toute sonde rouge est soit corrigée (sonde périmée) soit signalée (bug produit réel, alors STOP et rapport).

### L22 — Dette sécurité résiduelle (nouveau, suite de L11)
Statut : prêt — deploy main final
- `npm audit fix` (SANS `--force`) côté `server-new` : 15 vulns dont `proxy-addr` (critique, usurpation d'IP → contourne le rate limit), `tar`, `nodemailer` ; puis **démarrer le vrai process** (`node server.js`, health 200) — cf. mémoire « dépendance fantôme uuid a planté la prod ».
- Rate limiting des écritures hors auth : commentaires, likes, uploads, `POST /api/reviews/:id/share-code`.
- `DELETE /api/pipeline-github/:id` fait `include: { review }` alors que `PipelineGithub` n'a pas cette relation → plante à l'appel ; corriger (contrôle via `prisma.review.findUnique` comme le GET).
- Générateurs de code dupliqués (`templates.js generateShareCode`, `production-chains.js generateChainShareCode`, `Math.random`) → `utils/shareCode.js` (crypto).
- ⚠ humain, hors lot : retirer la ligne `ADMIN_MODE` du `.env` VPS (ignorée depuis le 2026-10-28, mais à nettoyer).
- **Accepté si** : `npm audit --omit=dev` sans critique/haute corrigeable ; serveur démarre ; 429 obtenu en rafale sur un commentaire.

### L23 — Vérification visuelle de L1 + rendu de la puissance des effets (nouveau)
Statut : prêt — deploy main final
- Sonde Playwright : curseurs « Puissance de chaque effet » (section Effets, 4 types) et légendes de bornes « 1 · … ··· 10 · … » (Texture, Goûts) — présents, lisibles à 390×844.
- `effectsPower` (champ registre `list`) visible dans les 5 templates d'export quand renseigné.
- **Accepté si** : sonde verte + captures relues.

### L24 — Petits défauts relevés le 2026-10-28 (nouveau)
Statut : prêt — deploy main final
- `EditGroupModal` (`PresetGroupsManager.jsx`) s'ouvre VIDE : le groupe édité n'est jamais pré-rempli → passer `group` à `CreateGroupModal` en valeurs initiales.
- `NodeContextMenu.jsx`/`ChainNodeContextMenu.jsx` : `pinTargets` utilisé sans définition dans une modification non commitée d'une autre session (constaté le 2026-10-28) — si elle a été commitée entre-temps, rétablir la définition (HEAD du 2026-10-28 la contenait) ; sinon ne pas toucher.
- `HomeReviewCard.jsx` : composant mort (la galerie publique a sa propre carte dans `GalleryPage.jsx`) → à verser dans L14.
- **Accepté si** : modale d'édition de groupe pré-remplie (sonde) ; `lint:critical` = 0.

### L12a — Review au nom de la farm
Statut : prêt — deploy main final
- Existant : SIRET vérifié, `ProducerProfile` + `CompanyMember`, `services/access.js`. Une review créée par un membre s'affiche au nom de l'entreprise (fiche, `/r/:id`, étiquette QR `/l/:code/etiquette`, carte de galerie).
- **Accepté si** : review créée par un membre → nom de la farm sur la fiche publique et l'étiquette ; un non-membre ne peut pas l'éditer (testé serveur, NODE_ENV=test).

### L19 — Onboarding + SEO
Statut : prêt — deploy main final
- Parcours guidé d'un nouveau compte producteur : créer la farm → première review Fleur → premier export → première étiquette QR.
- `/r/:id` indexable : meta/OG dynamiques (le front est une SPA servie par nginx → OG nécessite un rendu serveur minimal des balises pour `/r/:id`, à faire côté Express ou nginx), `robots.txt`, `sitemap.xml` des reviews publiques.
- **Accepté si** : aperçu OG correct (curl de la page avec un user-agent de robot) ; nouveau compte guidé jusqu'au premier export.

### L18 — Exploitation prod
Statut : prêt — deploy main final
- Script `server-new/scripts/backup-db.mjs` : `VACUUM INTO` via Prisma `$executeRawUnsafe` (pas de CLI `sqlite3` sur le VPS), rotation 14 jours. **Hermes livre le script + la doc ; l'activation (cron, copie hors VPS) reste une action humaine** (règle 11).
- Surveillance : `/api/health` et redémarrages `pm2` → rapport matinal Hermes.
- **Accepté si** : restauration testée sur une COPIE locale → base lisible, reviews présentes.

### L5 — Mode auto téléphone = parité mode normal
Statut : prêt — deploy main final
- Mêmes champs et outils que le mode normal, ergonomie tactile (`client/src/components/wizard/`) — y compris les ajouts du 2026-10-28 : puissance des effets, silhouette de couleur à peindre (geste tactile déjà géré par `PaintableColorSilhouette`).
- **Accepté si** : `mobile-forms-check.mjs` étendue — chaque section du mode normal a son équivalent en mode auto (390×844).

### L9 — Audit scientifique des données (lecture seule)
Statut : prêt — deploy main final
- Repartir de `DOCUMENTATION/DATA_REFERENCE/` (tiers T1-T5, `13_REGISTRE_SOURCES.md`). Couvrir échelles, unités, plages, listes des 4 types + pipelines + `cannabinoids.js`/`terpenes.js`, et les ajouts du 2026-10-28 (palettes de couleur hash/rosin, puissance d'effets).
- Livrable : `DOCUMENTATION/DATA_REFERENCE/14_AUDIT_2026-10.md`, tableau manque/erreur/ajustement par champ, avec source. Aucune modification de code dans ce lot.
- **Accepté si** : chaque champ chiffré a une plage sourcée ou est marqué « non sourcé ».

### L14 — Harmonisation des fonctionnalités redondantes
Statut : prêt — deploy main final
- 1 fusion/suppression par commit, uniquement après grep des imports + graphe esbuild depuis `src/main.jsx` (méthode du 2026-10-28) + build vert.
- Morts confirmés le 2026-10-28 (aucun chemin depuis `main.jsx`) : `PresetConfigModal.jsx`, `SectionGuard.jsx`, `components/pipelines/sections/RecipePipelineSection.jsx`, `ReviewCompletionExamples.js`, `SeparationPDFExporter.js`, `legalSystemTests.js`, `CuringGIFExporter.js`, `permissionErrors.js`, `permissionSync.js`, `HomeReviewCard.jsx`, `routes/pipelines.js` (démonté) — les retirer aussi de la liste `DEAD` de `client/eslint.critical.config.js`.
- Doublons : `FieldRenderer.jsx`/`FieldRendererClean.jsx`, `Template`/`TemplateShare`/`SavedTemplate`, `usePhotoUpload` ×4, `pipelineConfigs.js`, `EditReviewPage.jsx`, `StubTabs.jsx`, `ModuleBuilder.jsx`, `config/stripe.js`. Tests `permissions.*.test.js` qui ne parsent pas : réécrire ou supprimer.
- **NE PAS toucher** `ExportMaker.jsx` (gardé pour ses tests + `ExportValidationDashboard`).
- **Accepté si** : build + `run-all` verts après chaque commit ; zéro import cassé.

### L12b — Entreprise complète
Statut : prêt — deploy main final
- Invitation/retrait de membres, rôles hiérarchiques, journal des actions des membres sur les ressources de l'entreprise (`AuditLog`, déjà utilisé par la Chaîne de production).
- **Accepté si** : un membre à rôle limité se voit refuser une action réservée (testé serveur, NODE_ENV=test) ; l'action apparaît au journal.

### L20 — Intégration + déploiement final (nouveau, en fin de CHAQUE nuit)
Statut : prêt — deploy main final
- Sur la dernière branche de la nuit : `lint:critical` = 0, `npm run build` vert, `node tools/export-audit/run-all.mjs` vert, serveur local démarré (`/api/health` 200) avec les migrations appliquées.
- Si tout est vert : fast-forward de `main` sur cette branche, `git push origin main`, puis déploiement — **pour Hermes (utilisateur `hermes` sur le VPS)** : `ssh -i ~/.ssh/deploy_key ubuntu@localhost` (clé restreinte côté `ubuntu` à la seule commande `cd ~/Reviews-Maker && bash deploy.sh --vps`, aucun autre argument n'est exécuté) ; depuis le poste de dev : `timeout 300 ssh vps-lafoncedalle "cd ~/Reviews-Maker && bash deploy.sh --vps 2>&1"`. Puis contrôle externe : `/api/health` 200, page d'accueil 200, `/api/admin/check-auth` anonyme → `isAdmin:false`, `/l/<code inconnu>` → 404 API.
- Si une barrière est rouge : RIEN n'est mergé ni déployé ; rapport au matin avec la barrière fautive.
- ⚠ La première exécution contient des lots encore « PR ouverte » (L4, L16, L6-L8) que l'humain a autorisés au déploiement final le 2026-10-28 sans les avoir relus un par un.
- **Accepté si** : prod à jour, contrôles externes verts, rapport rédigé.

---

## Bloqués (⚠ humain)

### L3 — Export Maker : export réellement fonctionnel (parcours A et B)
Statut : à faire ⚠ l'humain fournit 1 review + 1 template + 1 format qui cassent, avec capture.
- Constat 2026-10-28 : `pagination-check` (export réel) vert ; les échecs `pdf-check`/`format-check` venaient de sondes périmées (→ L21), pas d'un bug produit identifié.

### L15a — DA des écrans de démo : plus pro, moins enfantine, pas « rendu IA »
Statut : à faire ⚠ direction validée par l'humain sur 1 page de référence AVANT le rollout.
- Périmètre : formulaires Fleur/Hash/Rosin (dont la silhouette à peindre, dessin encore sommaire), Export Maker, `/r/:id`, `/r/:id/lineage`, étiquette QR, galerie.

### L15b — DA reste de l'app
Statut : à faire ⚠ dépend de L15a.

### L10 — Mentions légales
Statut : à faire ⚠ raison sociale, adresse, contact, hébergeur fournis par l'humain ; textes à faire valider par un juriste.

### L13 — Comptes Pro : Influenceur (KYC)
Statut : à faire ⚠ l'humain définit la preuve exigée avant de coder. Réutiliser `routes/kyc.js`, pas `userKYC.js` (mort).

### L17 — Paiement PayPal réel
Statut : à faire ⚠ l'humain pose les clés (sandbox d'abord).

---

## Faits (pour mémoire)

- **L0/L0b** — `npm run lint:critical` ; 11 crashs d'exécution corrigés. fait.
- **L11** — 2 IDOR de lecture, garde des bannis, pagination bornée, filtres d'upload, suppression de média par propriétaire, `/api/pipelines` démonté, XSS de l'export HTML de template, **`ADMIN_MODE` ouvrait l'admin aux anonymes en prod** (supprimé). fait, déployé.
- **L1** — évolution ≥ 2 cases, légendes de bornes sur les jauges, puissance /10 par effet (migration `effets_puissance`). Déployé.
- **L2** — format d'écran automatique, boutons et bandeau retirés. Déployé.
- **L4** — cartes de galerie (faits clés, pseudo → profil, like réel). PR ouverte.
- **L16** — `Review.shareCode`, `/l/:code`, étiquette 85×55 mm, QR des templates → lien court. PR ouverte.
- **L6/L7/L8** — `PaintableColorSilhouette` (bud, hash + violet/blanc, rosin jar + violet/rouge), format stocké inchangé. PR ouverte.

## Post-MVP (à cadrer un par un)
- Emojis → images réelles (forms, filtres galerie, exports). ⚠ Pas de scraping Google : droits d'auteur. Photos propres, banques sous licence libre, ou génération IA.
- Partage réseaux sociaux. « Créer une review sur ce produit » (clic droit, reviews producteur uniquement).
- Gamification (les likes existent désormais). Statistiques globales/publiques. Rapports & alertes / détection d'anomalies.
- GrowBrain IoT : **hors de ce repo** (`growbrain.terpologie.eu`).
