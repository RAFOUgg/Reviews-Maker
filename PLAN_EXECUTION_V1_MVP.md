# 🎯 PLAN EXÉCUTION V1 MVP - ACTIONS IMMÉDIATES

**Version**: 1.0  
**Date**: 16 janvier 2026  
**Durée Totale**: 3-4 semaines (20-28 jours de dev)  
**Ressources**: 2-3 développeurs  
**Fin Cible**: ~5 février 2026

---

## 📍 SITUATION ACTUELLE

**Composants Prêts** (90%+ fonctionnel):
- ✅ Sections 1, 4-9 (Infos, Analytiques, Évaluations)
- ✅ Backend complet (routes, Prisma, CRUD)
- ✅ Galerie publique display
- ✅ Authentification

**Composants À Faire** (30-50% fonctionnel):
- 🔴 **CRITIQUE**: Permissions (0% enforcement)
- 🔴 **CRITIQUE**: PhenoHunt UI + persistance (40%)
- 🔴 **CRITIQUE**: Pipelines UI (40%)
- 🔴 **CRITIQUE**: Export complet (50%)
- ⚠️ **Important**: Bibliothèque (70%)
- ✅ **Normal**: Galerie interactions (60%)

---

## 🔴 SPRINT 1: PERMISSIONS & BASE (SEMAINE 1)

**Objectif**: Implémenter contrôle d'accès complet (business-critical)

### Tâches

#### T1.1: Middleware Auth Backend [1-2 jours]
- [ ] Créer middleware `checkAccountType(requiredType)`
- [ ] Appliquer sur TOUTES les routes protégées
- [ ] Routes cibles:
  - `/api/flower-reviews/*` (check Amateur OK)
  - `/api/genetics/trees/*` (check Producteur)
  - `/api/pipeline-culture/*` (check non-Amateur)
  - `/api/pipeline-curing/*` (check Producteur/Influenceur)
  - `/api/export/*` (check permissions format)
  - `/api/library/*` (check limites)
- [ ] Retourner 403 Forbidden si denied
- [ ] Logger tentatives non-autorisées
- [ ] Tests: curl chaque endpoint avec 3 account types

**Validation**: Toutes routes tested, logs propres

#### T1.2: Frontend Permission Checks [1 jour]
- [ ] Masquer Section 2 (PhenoHunt) si Amateur ✅
- [ ] Masquer Section 3 (Pipeline Culture) si Amateur/Influenceur ✅
- [ ] Masquer Section 10 (Pipeline Curing) si Amateur ✅
- [ ] Masquer onglet "PhenoHunt" bibliothèque si Amateur ✅
- [ ] Désactiver boutons export formats/templates non-autorisés ✅
- [ ] Toast messages: "Feature réservée à [compte type]"
- [ ] Code pattern: `if (user.accountType === 'producteur') { return <Component /> }`

**Validation**: Chaque compte type voit/masque correct

#### T1.3: Limite Bibliothèque Backend [1 jour]
- [ ] Vérifier limite avant création review:
  - Amateur: max 10
  - Influenceur: max 50
  - Producteur: ∞
- [ ] Query count reviews user
- [ ] Retourner 402 Payment Required si dépassé
- [ ] Ajouter colonne `reviewCount` User pour perfo

**Validation**: Amateur cannot exceed 10, error message clear

#### T1.4: Test Permissions Complet [0.5 jour]
- [ ] Matrix: 3 account types × 20 features = 60 tests
- [ ] Checklist: VALIDATION_V1_MVP_FLEURS.md Part 1

**Validation**: ✅ All 60 tests passing

---

## 🔴 SPRINT 2: PHENOHUNT & FICHES TECHNIQUES (SEMAINE 1.5)

**Objectif**: Arbre généalogique complet (producteur feature clé)

### Tâches

#### T2.1: Volet Latéral Bibliothèque [1.5 jours]
- [ ] Créer composant `LibrarySidebar.jsx`
- [ ] Onglet 1: "Fiches Techniques"
  - [ ] Lister reviews user
  - [ ] Filtrer (Type/Status/Date)
  - [ ] Trier (Récent/Ancien/Favorite)
  - [ ] Chercher par nom/cultivar
  - [ ] Boutons: Éditer, Dupliquer, Supprimer, Partager
- [ ] Onglet 2: "Cultivars"
  - [ ] Lister cultivars user
  - [ ] Ajouter cultivar custom
  - [ ] Voir stats "utilisé X fois"
- [ ] Onglet 3: "PhenoHunt" (Producteur only)
  - [ ] Lister arbres généalogiques
  - [ ] Bouton "Nouvel arbre"
  - [ ] Bouton "Importer JSON"
- [ ] Onglet 4: "Presets"
  - [ ] Lister par groupe (Espace, Substrat, etc.)
  - [ ] Charger preset → review

**Validation**: Sidebar navigation fluid, données affichées correct

#### T2.2: Canvas PhenoHunt React Flow [2 jours]
- [ ] Setup React Flow library
- [ ] Composant `GeneticTreeCanvas.jsx`
- [ ] Features:
  - [ ] Drag-drop cultivars sidebar → canvas
  - [ ] Auto-layout nodes
  - [ ] Draw edges (parent → child)
  - [ ] Click node → modal édition (nom cultivar, pheno #)
  - [ ] Delete node/edge
  - [ ] Pan/zoom canvas
  - [ ] Mini-map
- [ ] Styling: Obsidian-like dark + card mental

**Validation**: Drag-drop works, graph renders smooth, no lag with 20+ nodes

#### T2.3: Backend PhenoHunt Wiring [1 jour]
- [ ] Route `POST /api/genetics/trees` → save nodes/edges
- [ ] Route `GET /api/genetics/trees/:id` → load full tree
- [ ] Route `PUT /api/genetics/trees/:id` → update
- [ ] Route `DELETE /api/genetics/trees/:id`
- [ ] Validation: Producteur only
- [ ] JSON structure: `{ nodes: [...], edges: [...], metadata: {...} }`

**Validation**: Créer arbre → Refresh page → Data persistent

#### T2.4: Export/Import JSON PhenoHunt [0.5 jour]
- [ ] Bouton "Export JSON" → download file
- [ ] Bouton "Import JSON" → parse + load tree
- [ ] Validation JSON schema
- [ ] Share via unique code (futur: v1.1)

**Validation**: Export-then-import = identical tree

#### T2.5: Intégration Section 2 (Génétiques) [1 jour]
- [ ] Section 2: Lite PhenoHunt selector
- [ ] Click "Gérer arbre complet" → ouvre canvas en sidebar
- [ ] Canvas read-only view si Amateur
- [ ] Save arbre → persist review.geneticsTree

**Validation**: Section 2 can reference + update PhenoHunt

---

## 🔴 SPRINT 3: PIPELINES GRILLE & ÉDITION (SEMAINE 2-2.5)

**Objectif**: Visualisation culture/curing par jour/semaine/phase (UX majeure)

### Tâches

#### T3.1: Composant GithubStylePipelineGrid [2 jours]
- [ ] Créer `GithubStylePipelineGrid.jsx`
- [ ] Props: `{ mode, startDate, endDate, steps, onCellClick }`
- [ ] Mode JOURS:
  - [ ] Grille 365 carrés (7 rows × ~52 cols)
  - [ ] 1 carré = 1 jour
  - [ ] Color intensity: vide (light), data (medium), full (dark)
  - [ ] Pagination si > 365 days
  - [ ] Bouton "+" last cell pour ajouter jour
- [ ] Mode SEMAINES:
  - [ ] Grille S1-S52 (simple 52 carrés)
  - [ ] Bouton "+" last cell
- [ ] Mode PHASES:
  - [ ] 12 carrés fixes (phases prédéfinies)
  - [ ] Layout: 4 rows × 3 cols
- [ ] Styling: Apple-like minimal, smooth hover
- [ ] Tooltip hover: affiche résumé données jour

**Validation**: 365 carrés render smooth, no lag, colors correct

#### T3.2: Modal Édition Étape [2 jours]
- [ ] Créer `PipelineStepModal.jsx`
- [ ] Props: `{ stepData, onSave, onClose }`
- [ ] Layout:
  - [ ] Tabs: Groupe 1-9 (Espace, Substrat, etc.)
  - [ ] Chaque tab: collapsible groupe données
  - [ ] Photo upload (1 file max)
  - [ ] Notes texte (500 chars max)
  - [ ] Timestamp auto-set
- [ ] Groupe 1 exemple (Espace):
  - [ ] Mode (select)
  - [ ] Type espace (select)
  - [ ] Dimensions inputs
  - [ ] Surface auto-calc
- [ ] Bouton "Enregistrer comme preset?" → modal
- [ ] Button Save → POST /api/pipeline-*/steps
- [ ] Error handling: validation live

**Validation**: Modal open, fill group 1, save, data persists

#### T3.3: Intégration Grid + Modal [1.5 jours]
- [ ] Section 3 (Pipeline Culture):
  - [ ] Select mode (Jours/Semaines/Phases)
  - [ ] Date pickers (début/fin)
  - [ ] Auto-generate grid
  - [ ] Click carré → open modal
  - [ ] Close modal → update grid UI
- [ ] Section 10 (Pipeline Curing):
  - [ ] Identique logique
- [ ] State management: form state + pipeline steps
- [ ] Navigation: "Précédent/Suivant" étapes

**Validation**: Click jour → modal opens, edit data, save → grid updated

#### T3.4: Les 9 Groupes Données [1 jour]
- [ ] Implémenter tous groupes dans modal
- [ ] Focus: Validations, inputs types corrects
- [ ] Groupe 1 (Espace): ✅ Done
- [ ] Groupe 2 (Substrat): Composition % selects + marques texte
- [ ] Groupe 3 (Irrigation): Système + source + schedule selects
- [ ] Groupe 4 (Engrais): Marques multi-select + dosages
- [ ] Groupe 5 (Lumière): Type/spectre/puissance/distance inputs
- [ ] Groupe 6 (Climat): Temp/humidité inputs
- [ ] Groupe 7 (Palissage): Techniques multi-select + notes
- [ ] Groupe 8 (Morphologie): Hauteur/poids/branches inputs
- [ ] Groupe 9 (Récolte): Date/trichomes/poids inputs

**Validation**: Chaque groupe remplissable, sauvegardable

#### T3.5: Preset System [1.5 jours]
- [ ] After each group save: "Enregistrer comme preset?"
- [ ] Modal: Name + Category (Espace/Substrat/etc.)
- [ ] Backend: `POST /api/presets` → UserPreset
- [ ] Bibliothèque: Charger preset → auto-fill groupe
- [ ] Usage counter: "Utilisé dans X reviews"

**Validation**: Save preset, create new review, load preset → group prefilled

---

## 🔴 SPRINT 4: EXPORT COMPLET (SEMAINE 2.5-3)

**Objectif**: Générer tous formats (PNG/PDF/JSON/CSV/HTML) + templates

### Tâches

#### T4.1: Popup Export UI [1 jour]
- [ ] Créer `ExportModal.jsx`
- [ ] Layout:
  - [ ] Format selector (radio): PNG/PDF/JSON/CSV/HTML (permissions filtered)
  - [ ] Template selector (radio): Compact/Détaillé/Complète/Influenceur/Perso
  - [ ] Quality slider (si PNG/PDF)
  - [ ] Live preview pane (mini render)
- [ ] Permissions:
  - Amateur: PNG/PDF seulement
  - Producteur: tous formats
  - Influenceur: PNG/PDF
- [ ] Buttons: "Générer" + "Annuler"
- [ ] Backend call: `POST /api/export/generate`

**Validation**: Modal shows correct formats/templates per account, preview works

#### T4.2: Template JSON Structure [1 jour]
- [ ] Créer `templateConfigs.js`
- [ ] Define structure chaque template:
  ```
  Compact: {
    sections: [1, 2(lite), 4, 5, 6, 7, 8, 9],
    format: "1:1",
    fields: ["nomCommercial", "cultivar", "scores"]
  }
  
  Détaillé: {
    sections: [1, 2(lite), 4, 5, 6, 7, 8, 9],
    format: "1:1 | 16:9 | 9:16 | A4",
    fields: ["all basic fields"],
    pagination: true
  }
  
  Complète: {
    sections: [1-10],
    format: "A4",
    fields: ["ALL"],
    includeTree: true,
    multipage: true
  }
  
  Influenceur: {
    sections: [1, 2(lite), 4, 5, 6, 7, 8, 9],
    format: "9:16",
    optimization: "social media"
  }
  
  Personnalisé: {
    format: user-chosen,
    sections: user-drag-drop,
    design: custom colors/fonts
  }
  ```

**Validation**: Templates define correct sections

#### T4.3: Image Export (PNG/PDF) [1.5 jours]
- [ ] Use `html-to-image` + `jspdf`
- [ ] Fonction `generateImageExport(review, template, format, quality)`
- [ ] Steps:
  1. Build HTML template
  2. Render to canvas
  3. Convert to image (PNG/PDF)
  4. Apply quality settings
  5. Save file
  6. Return download URL
- [ ] Save export record: `POST /api/export` → Export table
- [ ] Error handling: timeout > 5s?

**Validation**: Export PNG works, file downloadable, quality selectable

#### T4.4: Data Export (JSON/CSV/HTML) [1.5 jours]
- [ ] JSON export: Full nested structure
  ```json
  {
    review: { ...all 10 sections },
    pipelines: [ { culture: [...] }, { curing: [...] } ],
    geneticTree: { nodes, edges },
    metadata: { created, updated, by }
  }
  ```
- [ ] CSV export: Flatten all data
  ```
  review_id, nom_commercial, cultivar, section4_thc, section5_couleur, ...
  ```
- [ ] HTML export: Printable template
  ```html
  <html>
    <head>styles</head>
    <body>rendered review</body>
  </html>
  ```
- [ ] Backend functions: `/api/export/json`, `/api/export/csv`, `/api/export/html`

**Validation**: Export JSON, reimport, data identical; CSV opens in Excel

#### T4.5: Export Buttons & History [0.5 jour]
- [ ] Bouton "Exporter" dans review viewer
- [ ] Historique exports → Bibliothèque onglet "Exports"
- [ ] Lister fichiers générés
- [ ] Re-download option
- [ ] Delete export file

**Validation**: Export appears in history, can re-download

---

## 📚 SPRINT 5: BIBLIOTHÈQUE COMPLÈTE (SEMAINE 3)

**Objectif**: CRUD complet fiches + presets + cultivars

### Tâches

#### T5.1: Lister Reviews [1 jour]
- [ ] Page `/library/reviews`
- [ ] Table view:
  - Columns: Nom, Cultivar, Date créée, Status, Visibilité, Actions
  - [ ] Filtrer (Status: Brouillon/Complète; Visibilité: Privée/Publique)
  - [ ] Trier (Récent/Ancien/Favorite)
  - [ ] Chercher (texte libre nom/cultivar)
- [ ] Buttons (per review):
  - [ ] Éditer → `/review/edit/:id`
  - [ ] Dupliquer → copy + modal rename
  - [ ] Supprimer → confirm
  - [ ] Partager → toggle public + copy link
  - [ ] Stats → modal (notes moyennes, etc.)

**Validation**: List shows correct reviews, filters work, edit opens review

#### T5.2: Manage Presets [1 jour]
- [ ] Page `/library/presets`
- [ ] View: Grouped by category (Espace/Substrat/etc.)
- [ ] Each preset:
  - [ ] Name, category, usage count
  - [ ] Edit, rename, delete, duplicate, mark favorite
  - [ ] Show review list using this preset
- [ ] Buttons:
  - [ ] "Créer preset" → modal (name + category)
  - [ ] "Charger" → load in new review

**Validation**: Load preset → new review, group prefilled

#### T5.3: Cultivars Library [0.5 jour]
- [ ] Page `/library/cultivars`
- [ ] Table: Cultivar name, breeder, type, usage count, actions
- [ ] Buttons:
  - [ ] "Ajouter cultivar" → modal (name, breeder, type, notes)
  - [ ] Edit, delete
  - [ ] See "Utilisé dans X reviews"

**Validation**: Add custom cultivar, appears in multi-select

#### T5.4: PhenoHunt Trees Library [0.5 jour]
- [ ] Already done in T2.1 sidebar onglet 3
- [ ] Click tree → open canvas full-screen
- [ ] Edit, delete, export JSON, import JSON

**Validation**: Open tree, edit, save, reopen = data persistent

#### T5.5: Templates & Preferences [0.5 jour]
- [ ] Page `/library/settings`
- [ ] Preferences:
  - [ ] Units default (Métrique/Impérial)
  - [ ] Theme (Clair/Sombre)
  - [ ] Format export préféré
- [ ] Favorite marques: Multi-input texte
- [ ] Save → User profile

**Validation**: Change preference, apply across UI

---

## ✨ SPRINT 6: POLISH & GALERIE (SEMAINE 3-3.5)

**Objectif**: UX final + galerie interactions

### Tâches

#### T6.1: Galerie Interactions [0.5 jour]
- [ ] Partage réseaux sociaux (Facebook/Twitter/Reddit)
  - [ ] Share buttons generate links
  - [ ] Copy message automatique
- [ ] Ajouter favoris → bibliothèque "Favoris"
- [ ] Voir commentaires (si existant)

**Validation**: Click share → link copied, favoris appears in lib

#### T6.2: Validation Forms [1 jour]
- [ ] Review sections: validation live
- [ ] Error messages clairs
- [ ] Highlight required fields
- [ ] Prevent save si validation fail
- [ ] Tests: empty fields, wrong types, etc.

**Validation**: Can't save incomplete required fields

#### T6.3: UX Responsive [0.5 jour]
- [ ] Test mobile: library, export modal
- [ ] Test tablet: grid pipeline 365 carrés
- [ ] Fix breakpoints CSS

**Validation**: Mobile library scrollable, export works on tablet

#### T6.4: Dark Mode [0.5 jour]
- [ ] Toggle button
- [ ] Apply to all components
- [ ] Color scheme: dark backgrounds, light text
- [ ] Test export dark mode rendering

**Validation**: Dark mode toggle works, all pages themed

#### T6.5: Tooltips & Help [0.5 jour]
- [ ] Context help icons (?) on complex fields
- [ ] Hover → tooltip (Terpène, PPFD, etc.)
- [ ] Inline help text (spans)

**Validation**: Hover tooltips appear, text clear

---

## 🧪 SPRINT 7: TESTING & VALIDATION (SEMAINE 4)

**Objectif**: 100% test coverage, zéro blockers

### Tâches

#### T7.1: Backend Tests [1.5 jours]
- [ ] Unit tests: Routes + permissions
- [ ] Integration tests: DB operations
- [ ] API tests: All endpoints (GET/POST/PUT/DELETE)
- [ ] Coverage: > 80%
- [ ] Run: `npm test --coverage`

**Validation**: All tests passing, coverage green

#### T7.2: Frontend E2E Tests [1.5 jours]
- [ ] Test workflows:
  1. Create review (all 10 sections)
  2. Create PhenoHunt tree
  3. Track pipeline culture
  4. Export PNG/JSON
  5. Share galerie
- [ ] Test permissions: Amateur vs Producteur vs Influenceur
- [ ] Test edge cases: empty fields, large files, etc.
- [ ] Use Cypress or Playwright

**Validation**: All workflows passing, permissions tested

#### T7.3: Performance Testing [1 jour]
- [ ] Export > 10 pages: < 5s?
- [ ] Galerie pagination: smooth?
- [ ] Grid 365 carrés: no lag?
- [ ] PhenoHunt 50+ nodes: smooth?
- [ ] Profile large review (10MB): handled?

**Validation**: All performance targets met

#### T7.4: Security Testing [0.5 jour]
- [ ] Try bypass permissions (SQL injection, etc.)
- [ ] Check file upload security
- [ ] Validate CORS headers
- [ ] Check sensitive data not logged

**Validation**: No security vulnerabilities found

#### T7.5: UX Testing [1 jour]
- [ ] Usability walkthrough (team member)
- [ ] Navigation clear?
- [ ] Buttons/forms intuitive?
- [ ] Error messages helpful?
- [ ] Collect feedback + iterate

**Validation**: UX feedback addressed

---

## 🚀 DEPLOYMENT & GO-LIVE (SEMAINE 4-4.5)

### Tasks

#### D1: Staging Deployment [0.5 jour]
- [ ] Deploy to staging server
- [ ] Run smoke tests
- [ ] Verify all features working
- [ ] Check database integrity

**Validation**: Staging fully functional

#### D2: UAT with Stakeholders [1 jour]
- [ ] Share staging URL with team
- [ ] Collect feedback
- [ ] Fix critical bugs only
- [ ] Sign-off from PM

**Validation**: Stakeholders approve

#### D3: Production Deployment [0.5 jour]
- [ ] Backup production DB
- [ ] Deploy code
- [ ] Verify no errors
- [ ] Monitor logs

**Validation**: Production live, no errors

#### D4: Post-Launch Monitoring [2 jours]
- [ ] Watch error logs
- [ ] Monitor performance
- [ ] Respond to critical issues
- [ ] Collect user feedback

**Validation**: Stable, zero critical bugs

---

## 📊 TIMELINE FINAL

| Sprint | Semaine | Effort | Devs | Dates |
|---|---|---|---|---|
| 1: Permissions | W1 | 4-5 jours | 1 | Jan 16-22 |
| 2: PhenoHunt | W1.5 | 6-7 jours | 2 | Jan 22-28 |
| 3: Pipelines | W2-2.5 | 8-9 jours | 2 | Jan 28-Feb 4 |
| 4: Export | W2.5-3 | 6-7 jours | 1 | Feb 4-11 |
| 5: Bibliothèque | W3 | 4-5 jours | 1 | Feb 11-16 |
| 6: Polish | W3-3.5 | 3-4 jours | 1 | Feb 16-20 |
| 7: Testing | W4 | 5-6 jours | 1 | Feb 20-27 |
| Deploy | W4-4.5 | 2-3 jours | 1 | Feb 27-Mar 2 |

**TOTAL**: 3.5-4.5 semaines  
**Effort**: 39-46 jours dev  
**Team**: 2-3 devs parallèles  
**GO-LIVE**: ~March 2, 2026

---

## ⚠️ BLOCKERS & MITIGATIONS

### Risk: PhenoHunt UI Complexity
- **Mitigation**: Start early (Sprint 2), iterate UI
- **Fallback**: Simplified graph if React Flow issues

### Risk: Pipeline Grid Performance (365 cells)
- **Mitigation**: Virtualization, pagination
- **Fallback**: Simplified day-by-day navigation

### Risk: Export Format Complexity (JSON/CSV/HTML)
- **Mitigation**: Start with JSON (simplest), extend
- **Fallback**: PNG/PDF only for V1 → formats in V1.1

### Risk: Timeline Slippage
- **Mitigation**: Daily standups, track blockers
- **Buffer**: 1-2 week buffer built in

---

## 🎯 SUCCESS CRITERIA

V1 MVP is **DONE** when:

✅ **Permissions**: 100% enforced (60 tests passing)  
✅ **Sections 1-10**: All functional, data persists  
✅ **PhenoHunt**: Create/edit/save/export working  
✅ **Pipelines**: Visualization + all 9 groupes editable  
✅ **Export**: PNG/PDF/JSON/CSV/HTML + templates working  
✅ **Bibliothèque**: Full CRUD + presets  
✅ **Galerie**: Share + interactions working  
✅ **Tests**: Coverage > 80%, no blockers  
✅ **Perf**: Export < 5s, UI smooth  
✅ **UX**: Team approved, ready public  

---

## 📝 RESOURCES & DOCUMENTATION

**Main References**:
1. `CAHIER_DES_CHARGES_V1_MVP_FLEURS.md` ← Specifications
2. `VALIDATION_V1_MVP_FLEURS.md` ← Checklist
3. `GUIDE_LECTURE_CAHIER_DES_CHARGES.md` ← Team guide

**Sprint Planning**:
- Jira/Azure tickets from this document
- Daily standups 10am
- Weekly review Friday

**Communication**:
- Slack #v1-mvp-fleurs channel
- Blockers posted immediately
- Daily status: ✅ On track / ⚠️ At risk / 🔴 Blocked

---

**Document**: Plan Exécution V1 MVP  
**Statut**: 🟢 Ready → Sprint 1 starts Monday  
**Next**: Create Jira tickets from sprints above
