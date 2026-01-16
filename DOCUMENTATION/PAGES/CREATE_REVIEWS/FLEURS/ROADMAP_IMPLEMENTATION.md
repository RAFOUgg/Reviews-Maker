# FLEURS - Roadmap d'Implémentation

## 🎯 Vue d'Ensemble

Roadmap complète pour finaliser implémentation type produit **Fleurs** avec ambition d'exhaustivité maximale.

Document Living: Mis à jour au fur et à mesure implémentation.

---

## 📊 État Actuel vs Objectif

### État Actuel
- ✅ Documentation Fleurs complète (9 sections)
- ✅ Architecture SECTION 3 (Pipeline Culture) définie
- ✅ Modèles Prisma spécifiés
- ✅ Workflow UX planifié
- ⏳ Implémentation frontend: 0%
- ⏳ Implémentation backend: 0%

### Objectif Final
- ✅ Reviews fleurs créables/modifiables
- ✅ Pipeline culture documentée avec traçabilité complète
- ✅ Presets réutilisables dans bibliothèque
- ✅ Export multi-format
- ✅ Statistiques utilisateur exhaustives
- ✅ Galerie publique fonctionnelle

---

## 🏗️ PHASE 1: FONDATIONS (2 semaines)

### 1.1 Modèles Prisma ✅ PLAN
**Objectif**: Modèles Prisma implémentés et testés
**Fichier Reference**: [PRISMA_MODELS.md](SECTION_3_PIPELINE_CULTURE/PRISMA_MODELS.md)

- [ ] Créer migration Prisma pour `CultureSetup`
- [ ] Créer migration Prisma pour `Pipeline`
- [ ] Créer migration Prisma pour `PipelineStage`
- [ ] Mettre à jour modèle `Review` (ajouter relation Pipeline)
- [ ] Mettre à jour modèle `ReviewSection` (add versionDate, linkedPipelineStageId)
- [ ] Générer types TypeScript
- [ ] Tester queries de base

### 1.2 Routes API Stub ✅ PLAN
**Objectif**: Routes API créées (logique basique)

- [ ] `POST /api/reviews/:reviewId/pipeline` - Créer pipeline
- [ ] `GET /api/reviews/:reviewId/pipeline` - Récupérer pipeline
- [ ] `PUT /api/reviews/:reviewId/pipeline` - Mettre à jour config pipeline
- [ ] `POST /api/pipelines/:pipelineId/stages` - Ajouter étape
- [ ] `PUT /api/pipelines/:pipelineId/stages/:stageId` - Modifier étape
- [ ] `GET /api/pipelines/:pipelineId/stages?date=...` - Lister étapes
- [ ] `POST /api/library/setups` - Créer preset
- [ ] `GET /api/users/me/library/setups` - Récupérer presets
- [ ] `PUT /api/library/setups/:setupId` - Modifier preset
- [ ] `DELETE /api/library/setups/:setupId` - Supprimer preset

### 1.3 Data Seed ✅ PLAN
**Objectif**: Données initiales pour testing

- [ ] Listes composants substrat (sol, coco, perlite, etc.)
- [ ] Listes techniques palissage (SCROG, SOG, LST, etc.)
- [ ] 12 phases pipeline prédéfinies
- [ ] Marques/produits courants (optional)
- [ ] Presets exemples (pour démo)

---

## 🖼️ PHASE 2: FRONTEND SECTION 1-2 (2 semaines)

### 2.1 Section 1: Infos Générales
**Objectif**: Formulaire complet création review fleur

- [ ] Component `ReviewFlowerForm_Section1`
- [ ] Champs: Nom, photos, cultivar, farm, type
- [ ] Champs optionnels: photos additionnelles, description
- [ ] Intégration photo upload
- [ ] Intégration sélecteur cultivar (charger depuis library)
- [ ] Validation champs obligatoires
- [ ] Save/Load persistence
- [ ] Tests unitaires

### 2.2 Section 2: Génétiques
**Objectif**: Saisie génétiques

- [ ] Component `ReviewFlowerForm_Section2`
- [ ] Champs: Breeder, variété, type génétique, %, code phénotype
- [ ] Multi-select traits distinctifs
- [ ] Textarea notes généalogiques
- [ ] Relations parent1/parent2 (selectors cultivar)
- [ ] Validation % = 100 si saisie
- [ ] Save/Load persistence
- [ ] Tests unitaires

### 2.3 Navigation Sections
**Objectif**: Navigation fluide entre sections

- [ ] Tab navigation (1, 2, 3, 4, ...)
- [ ] Progress bar (X% complété)
- [ ] Boutons prev/next
- [ ] Save automatique par section
- [ ] Validation avant passage section suivante

---

## ⚙️ PHASE 3: FRONTEND SECTION 3 - PIPELINE CULTURE (4 semaines)

### 3.1 Initialisation Pipeline
**Objectif**: Choix mode + dates

- [ ] Component `ReviewFlowerForm_Section3_Init`
- [ ] Radio buttons: Mode JOURS / SEMAINES / PHASES
- [ ] Date pickers: Début/Fin culture
- [ ] Auto-calcul durée
- [ ] Validation dates (fin > début)
- [ ] Affichage estimé phase/nombre jours

### 3.2 Interface Groupes Données
**Objectif**: UI réutilisable pour chaque groupe

- [ ] Component `CultureGroupForm` (réutilisable)
- [ ] Support collapse/expand
- [ ] Champs dynamiques selon groupe
- [ ] Validation champs
- [ ] Checkbox "Enregistrer comme preset"
- [ ] Selector "Charger preset existant"
- [ ] Support modifications après chargement

Implémentation pour chaque groupe:

#### 3.2.1 Groupe 1: Espace de Culture
- [ ] Mode culture select (Indoor/Outdoor/etc)
- [ ] Type espace (Tente/Armoire/etc)
- [ ] Dimensions LxlxH (with unit selector)
- [ ] Auto-calc surface/volume
- [ ] Densité plantes

#### 3.2.2 Groupe 2: Substrat
- [ ] Type select (Solide/Hydro/Aéro)
- [ ] Volume total
- [ ] Array components:
  - [ ] Component selector
  - [ ] Percentage input (total = 100)
  - [ ] Brand autocomplete
  - [ ] Component-specific fields
- [ ] pH/EC inputs

#### 3.2.3 Groupe 3: Irrigation
- [ ] System select
- [ ] Water source select
- [ ] Schedule (frequency, times per day)
- [ ] Water characteristics (pH, EC, temp)
- [ ] Volume per watering
- [ ] Runoff %
- [ ] Array supplementation products

#### 3.2.4 Groupe 4: Engrais/Nutrition
- [ ] Brand autocomplete
- [ ] Type select (Bio/Chimique/etc)
- [ ] Array product lines:
  - [ ] Product name
  - [ ] Stage (veg/flower)
  - [ ] Dosage
  - [ ] Frequency
  - [ ] NPK display
- [ ] Supplementary products array
- [ ] Phase-specific overrides

#### 3.2.5 Groupe 5: Lumière
- [ ] Lamp type select
- [ ] Quantity
- [ ] Total power
- [ ] Brand/model
- [ ] Spectrum info
- [ ] Distance from canopy
- [ ] Schedule by phase (vegetative, pre-flowering, flowering)
- [ ] DLI/PPFD/Kelvin optionnels

#### 3.2.6 Groupe 6: Climat
- [ ] Ventilation type/model
- [ ] Target values by phase:
  - [ ] Temperature min/opt/max
  - [ ] Humidity min/opt/max
  - [ ] CO2 levels
- [ ] Display current vs targets

#### 3.2.7 Groupe 7: Palissage
- [ ] Array techniques:
  - [ ] Technique select
  - [ ] Start week
  - [ ] Description textarea
  - [ ] Expected outcome
  - [ ] Tools array
  - [ ] Recovery days
- [ ] Estimated canopy height
- [ ] Estimated bud sites

#### 3.2.8 Groupe 8: Morphologie
- [ ] Measurements (height, volume, weight)
- [ ] Plant structure (branches, nodes, buds)
- [ ] Observations (growth rate, leaf color, health score)
- [ ] Photo upload
- [ ] Read-only at this stage (measurements only during pipeline)

#### 3.2.9 Groupe 9: Récolte
- [ ] Harvest date/time
- [ ] Trichome color selection (visual nuancer)
- [ ] Percentages (clear, cloudy, amber)
- [ ] Harvesting method, duration
- [ ] Weights (brut, after defoliation, dry, cured)
- [ ] Auto-calc yields (g/plant, g/m², g/W, dry yield %)
- [ ] Drying parameters (method, temp, humidity, duration)

### 3.3 Visualisation Pipeline
**Objectif**: Calendar-style interface

- [ ] Component `PipelineCalendar`
- [ ] Github-style commit calendar
- [ ] Color intensity based on events
- [ ] Hover = stage count
- [ ] Click = stage details modal
- [ ] Legend (colors meaning)
- [ ] Month/year navigation

### 3.4 Gestion Étapes
**Objectif**: Créer/modifier étapes

- [ ] Component `PipelineStageForm`
- [ ] Auto-generate stages according to mode (JOURS/SEMAINES/PHASES)
- [ ] Each stage:
  - [ ] Scheduled date (auto-filled, editable)
  - [ ] Interval label (auto-filled)
  - [ ] Event dropdown (watering/fertilizing/technique/climate/morphology/note)
  - [ ] Event-specific fields shown dynamically
  - [ ] Observations textarea
  - [ ] Photo upload
  - [ ] Completion checkbox
- [ ] Bulk edit possible (ex: change all irrigation frequency)
- [ ] Copy stage to following intervals

### 3.5 Système Presets Library
**Objectif**: Sauvegarde/chargement presets

- [ ] Component `PresetsLibrary`
- [ ] Show presets by group (folders UI)
- [ ] Each preset shows:
  - [ ] Name, description
  - [ ] Usage count
  - [ ] Last used date
  - [ ] Rating/notes
- [ ] Actions:
  - [ ] Load into form
  - [ ] Edit preset
  - [ ] Delete preset
  - [ ] Duplicate & modify
  - [ ] Share (future)
- [ ] Create new preset from form

### 3.6 Integration avec Review
**Objectif**: Section 3 intégré au formulaire review

- [ ] Tab SECTION 3 in review form
- [ ] Navigation prev/next sections
- [ ] Progress tracking (SECTION 3 = X% complet)
- [ ] Save all data on submit

---

## 📊 PHASE 4: FRONTEND SECTIONS 4-9 (3 semaines)

### 4.1 Section 4: Visuel & Technique
**Objectif**: Évaluation visuelle

- [ ] Component `ReviewFlowerForm_Section4`
- [ ] 7 sliders 0-10:
  - Color, density, trichomes, pistils, manicure, mold, seeds
- [ ] Color nuancer picker
- [ ] Notes textarea
- [ ] Validation

### 4.2 Section 5: Odeurs
**Objectif**: Profile aromatique

- [ ] Component `ReviewFlowerForm_Section5`
- [ ] Multi-select dominant notes (max 7 from data/aromas.json)
- [ ] Multi-select secondary notes (max 7)
- [ ] Inhalation aromas (primary/secondary)
- [ ] Mouth feel, retroolfaction textareas
- [ ] Intensity slider 0-10
- [ ] Validation

### 4.3 Section 6: Texture
**Objectif**: Évaluation tactile

- [ ] Component `ReviewFlowerForm_Section6`
- [ ] 4 sliders 0-10: Hardness, density, elasticity, stickiness
- [ ] Notes textarea
- [ ] Validation

### 4.4 Section 7: Goûts
**Objectif**: Profile gustatif

- [ ] Component `ReviewFlowerForm_Section7`
- [ ] Intensity, aggression sliders
- [ ] Multi-select dry puff (max 7)
- [ ] Multi-select inhalation (max 7)
- [ ] Multi-select expiration (max 7)
- [ ] Validation

### 4.5 Section 8: Effets Ressentis
**Objectif**: Experience utilisateur

- [ ] Component `ReviewFlowerForm_Section8`
- [ ] Onset speed slider (1-10)
- [ ] Intensity slider (1-10)
- [ ] Multi-select effects (max 8, categorized)
- [ ] Filter toggle: All/Neutral/Positive/Negative
- [ ] Consumption experience section:
  - [ ] Method select (Combustion/Vapeur/Infusion)
  - [ ] Dosage input + unit
  - [ ] Duration input (HH:MM)
  - [ ] Effect profiles select
  - [ ] Side effects select
  - [ ] Onset select (Immediate/Delayed/etc)
  - [ ] Duration select (Short/Medium/Long/Very Long)
  - [ ] Usage preference select (Evening/Daytime/Solo/Social/Medical)

### 4.6 Section 9: Pipeline Curing
**Objectif**: Post-harvest tracking

- [ ] Component `ReviewFlowerForm_Section9`
- [ ] Similar to SECTION 3 but post-harvest:
  - [ ] Curing start date
  - [ ] Parameters (temp, humidity, container type, packaging)
  - [ ] Timeline view
  - [ ] Modify sections 4-8 over time
- [ ] Link to SECTION 3 (reference harvest data)

---

## 🔗 PHASE 5: INTÉGRATIONS & BACKEND (3 semaines)

### 5.1 Validation & Error Handling
- [ ] Input validation tous champs
- [ ] Error messages i18n
- [ ] Field-level validation (ex: pH range)
- [ ] Cross-field validation (ex: dimensions calc)

### 5.2 API Implementation Complète
- [ ] Error handling
- [ ] Validation serveur
- [ ] Authentication checks
- [ ] Authorization checks (Producteur-only sections)
- [ ] Rate limiting

### 5.3 Statistics Calculation
- [ ] Yield calculations (g/m², g/W, etc.)
- [ ] Average scores by section
- [ ] Timeline metrics (duration trends)
- [ ] Setup effectiveness scoring

### 5.4 Export Integration
- [ ] Export maker support
  - [ ] Select sections to include
  - [ ] Pipeline visualization (graph)
  - [ ] Data formatting for PDF/PNG/etc
- [ ] Template presets

### 5.5 Public Gallery Support
- [ ] Query public reviews
- [ ] Filter/search by:
  - [ ] Cultivar
  - [ ] Yield range
  - [ ] Effects
  - [ ] Techniques used
- [ ] Like/comment mechanics
- [ ] Sharing links

---

## 📈 PHASE 6: QA & POLISH (2 semaines)

### 6.1 Testing
- [ ] Unit tests (model functions)
- [ ] Integration tests (API flows)
- [ ] E2E tests (complete review creation)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness

### 6.2 Performance
- [ ] Database indexes optimization
- [ ] Query optimization
- [ ] Frontend bundle size check
- [ ] Load testing pipelines

### 6.3 Documentation
- [ ] User guide (how to create review)
- [ ] FAQ
- [ ] API documentation
- [ ] Developer guide

### 6.4 Bug Fixes & Polish
- [ ] UI/UX refinements
- [ ] Edge cases handling
- [ ] Error recovery
- [ ] Accessibility checks

---

## 🚀 PHASE 7: LAUNCH (1 semaine)

### 7.1 Production Deployment
- [ ] Database migration to production
- [ ] API deployment
- [ ] Frontend deployment
- [ ] Monitoring setup
- [ ] Backup procedures

### 7.2 Launch Activities
- [ ] Announcement
- [ ] Community onboarding
- [ ] Support team training
- [ ] Feedback collection

---

## 📋 Timeline Estimé

```
Phase 1 (Foundations):        2 semaines    [Jan 20 - Feb 3]
Phase 2 (Sections 1-2):       2 semaines    [Feb 3 - Feb 17]
Phase 3 (Section 3):          4 semaines    [Feb 17 - Mar 17]
Phase 4 (Sections 4-9):       3 semaines    [Mar 17 - Apr 7]
Phase 5 (Intégrations):       3 semaines    [Apr 7 - Apr 28]
Phase 6 (QA & Polish):        2 semaines    [Apr 28 - May 12]
Phase 7 (Launch):             1 semaine     [May 12 - May 19]
────────────────────────────────────────────
TOTAL:                        17 semaines   (~4 mois)
```

**Note**: Timeline peut varier selon ressources disponibles et complexité rencontrée.

---

## 🎯 Success Criteria

✅ **Technique**:
- All sections functional and validated
- Pipeline auto-generates 100+ stages correctly
- Presets save/load without errors
- All APIs tested and documented
- Performance: <200ms API response time

✅ **UX**:
- Apple-like design maintained
- No free text where possible (selectors prioritized)
- Form completion: ~45 min per review
- Preset reuse: 70%+ of users save presets
- Mobile: 90% functionality parity

✅ **Exhaustivité**:
- All 9 sections complete
- All data groups captured
- Traçabilité 3D (time + space) functional
- Presets library operational
- Statistics calculated correctly

---

## 🔄 Post-Launch Roadmap (Futures)

- [ ] **Integration PhenoHunt**: Arbre généalogique avancé
- [ ] **Community Presets**: Partage presets entre utilisateurs
- [ ] **AI Insights**: Recommandations basées données utilisateur
- [ ] **Automation**: Intégration capteurs IoT pour measurements auto
- [ ] **Mobile App**: Native app for on-field logging
- [ ] **Autres types produits**: Hash, Concentrés, Comestibles

---

## 📝 Notes Importants

1. **Modularité**: Phases peuvent être parallélisées (ex: SECTION 4-9 en même temps que SECTION 3)
2. **Feedback**: Intégrer feedback utilisateurs après Phase 2
3. **Documentation**: Doit être maintenue Live au fur et mesure
4. **Testing**: Commencer tests unitaires dès Phase 1
5. **Performance**: Monitoring requis pour pipeline complexes
6. **Extensibilité**: Architecture doit supporter futurs types produits

