# ✅ CHECKLIST VALIDATION V1 MVP - SYSTÈME FLEURS

**Version**: 1.0  
**Date**: 16 janvier 2026  
**Statut**: 🔴 À VALIDER  
**Critère**: 100% fonctionnel = V1 MVP prêt déploiement

---

## 🔐 PART 1: PERMISSIONS & CONTRÔLE D'ACCÈS (PRIORITÉ 🔴 CRITIQUE)

**Raison**: Base du modèle commercial. Contrôle l'accès à TOUTES les features.

### Matrice Permissions

| Fonctionnalité | Amateur | Producteur | Influenceur | Statut |
|---|---|---|---|---|
| **Section 1: Infos Générales** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 2: Génétiques (basique)** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 2: PhenoHunt** | ❌ | ✅ | ⚠️ Lecture seule | ❓ À tester |
| **Section 3: Pipeline Culture** | ❌ | ✅ | ❌ | ❓ À tester |
| **Section 4: Analytiques** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 5: Visuel & Technique** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 6: Odeurs** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 7: Texture** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 8: Goûts** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 9: Effets** | ✅ | ✅ | ✅ | ❓ À tester |
| **Section 10: Pipeline Curing** | ❌ | ✅ | ✅ | ❓ À tester |
| **Bibliothèque: Max Reviews** | 10 | ∞ | 50 | ❓ À vérifier |
| **Export: PNG/PDF** | ✅ | ✅ | ✅ | ❓ À tester |
| **Export: JSON/CSV/HTML** | ❌ | ✅ | ❌ | ❓ À tester |
| **Export: Template Compact** | ✅ | ✅ | ❌ | ❓ À tester |
| **Export: Template Détaillé** | ✅ | ✅ | ✅ | ❓ À tester |
| **Export: Template Complète** | ❌ | ✅ | ❌ | ❓ À tester |
| **Export: Template Influenceur** | ❌ | ❌ | ✅ | ❓ À tester |
| **Export: Template Personnalisé** | ❌ | ✅ | ❌ | ❓ À tester |
| **Galerie Publique: Partager** | ✅ | ✅ | ✅ | ❓ À tester |
| **Galerie Publique: Analytics** | ❌ | ✅ | ✅ | ❓ À tester |

### Checklist Implémentation Permissions

#### Backend (server-new/)

- [ ] **Middleware Auth** 
  - [ ] Vérifier `user.accountType` sur toutes les routes protégées
  - [ ] Routes: `/api/flower-reviews/*`
  - [ ] Routes: `/api/pipeline-culture/*`
  - [ ] Routes: `/api/genetics/trees/*`
  - [ ] Routes: `/api/export/*`
  - [ ] Retourner **403 Forbidden** si permission manquante
  - [ ] Logger tentatives non-autorisées

- [ ] **Validation Section 2 (PhenoHunt)**
  - [ ] POST `/api/genetics/trees` → Vérifier `accountType === 'producteur'`
  - [ ] GET `/api/genetics/trees/:id` → Si Influenceur: lecture seule (pas d'édition)
  - [ ] DELETE `/api/genetics/trees/:id` → Vérifier `accountType === 'producteur'`

- [ ] **Validation Section 3 (Pipeline Culture)**
  - [ ] POST `/api/pipeline-culture/*` → Vérifier `accountType !== 'amateur'`
  - [ ] GET `/api/pipeline-culture/:reviewId` → Vérifier propriété review

- [ ] **Validation Exports**
  - [ ] POST `/api/export/generate` → Vérifier format autorisé par compte
  - [ ] Amateur: PNG/PDF uniquement
  - [ ] Producteur: Tous formats
  - [ ] Influenceur: PNG/PDF

- [ ] **Validation Bibliothèque Limite**
  - [ ] Avant création review: Vérifier limite (`Amateur: 10`, `Influenceur: 50`, `Producteur: ∞`)
  - [ ] Si dépassé: Retourner **402 Payment Required** ou bloquer UI

- [ ] **Validation Pipeline Curing**
  - [ ] PUT `/api/pipeline-curing/*` → Vérifier `accountType !== 'amateur'` ET `accountType !== 'influenceur'`

#### Frontend (client/src/)

- [ ] **Masquage Sections**
  - [ ] Section 2 (PhenoHunt) : Masquer si Amateur ✅
  - [ ] Section 3 (Pipeline Culture) : Masquer si Amateur ou Influenceur ✅
  - [ ] Section 10 (Pipeline Curing) : Masquer si Amateur ✅
  - [ ] Code: `if (user.accountType === 'producteur') { return <Section2 /> }`

- [ ] **Désactivation Boutons Export**
  - [ ] "Export JSON" : Désactivé si Amateur/Influenceur
  - [ ] "Template Complète" : Désactivé si pas Producteur
  - [ ] "Template Influenceur" : Désactivé si pas Influenceur

- [ ] **Masquage Éléments Bibliothèque**
  - [ ] Onglet "Arbres Généalogiques" : Masquer si Amateur ✅
  - [ ] Bouton "PhenoHunt Mode" : Masquer si Amateur ✅
  - [ ] Affichage limite: "10/10 reviews" si Amateur

- [ ] **Toast Erreur Permissions**
  - [ ] Message: "Cette fonctionnalité est réservée aux comptes Producteur"
  - [ ] Redirection vers page upgrade

#### Tests Permissions

- [ ] Test 1: Amateur try Section 3 → Backend reject + Frontend hide ✅
- [ ] Test 2: Influenceur try PhenoHunt edit → Backend reject (readonly) ✅
- [ ] Test 3: Amateur try export JSON → Backend reject ✅
- [ ] Test 4: Producteur try 11e review → Backend reject (limite) ✅
- [ ] Test 5: Switch account type → UI updated immediately ✅

---

## 📋 PART 2: CRÉATION REVIEW FLEURS (SECTIONS 1-10)

### Section 1: Infos Générales ✅ COMPLET

**État**: 95% fonctionnel

- [x] Champ: Nom commercial (requis)
- [x] Champ: Cultivar(s) multi-select
- [x] Champ: Farm/Producteur
- [x] Champ: Photos (1-4 requises)
- [x] Champ: Type variété (Indica/Sativa/Hybride)
- [x] Upload images → Stockage `/db/review_images/`
- [x] Validation: nom + photos obligatoires
- [x] Stockage: Base Prisma FlowerReview
- [x] Navigation: Bouton "Suivant" → Section 2
- [ ] **À vérifier**: Drag-drop photos possible?
- [ ] **À vérifier**: Compression images automatique?

**Blockers**: Aucun visible

---

### Section 2: Génétiques & PhenoHunt ⚠️ PARTIEL

**État**: 60% fonctionnel

#### Partie A: Génétiques (tous)

- [x] Champ: Breeder (texte)
- [x] Champ: Variété (auto-complete)
- [x] Champ: Type génétique (select)
- [x] Champ: % Indica (slider 0-100)
- [x] Champ: % Sativa (slider 0-100)
- [x] Champ: Généalogie texte
- [x] Validation: Indica + Sativa = 100%?
- [ ] **À vérifier**: Auto-complete depuis table Cultivars?

**Blockers**: Aucun majeur

#### Partie B: PhenoHunt (Producteur only) 🔴 CRITIQUE

**État**: 40% fonctionnel

- [ ] **Backend**:
  - [ ] Route `POST /api/genetics/trees` existe? ✅
  - [ ] Route `GET /api/genetics/trees/:userId` existe? ✅
  - [ ] Route `PUT /api/genetics/trees/:id` existe? ✅
  - [ ] Route `DELETE /api/genetics/trees/:id` existe? ✅
  - [ ] Modèle Prisma `GeneticTree` avec nodes/edges JSON? ✅
  - [ ] Validation permission Producteur? ❓ À implémenter

- [ ] **Frontend**:
  - [ ] React Flow component importé? ⚠️ À vérifier
  - [ ] Drag-drop cultivars vers canvas? ❌ À implémenter
  - [ ] Draw edges entre nodes? ❌ À implémenter
  - [ ] Modal édition node (cultivar + pheno name)? ❌ À implémenter
  - [ ] Bouton "Sauvegarder arbre"? ❌ À implémenter
  - [ ] Wiring API: `saveTree()` appel backend? ❌ À implémenter
  - [ ] Volet latéral gauche (projets/cultivars)? ❌ À implémenter
  - [ ] Tabs canva (Cultivars/Arbre/PhenoHunt)? ❌ À implémenter

- [ ] **Stockage**:
  - [ ] Persistance arbre en base? ❓ À vérifier
  - [ ] Export JSON possible? ❌ À implémenter
  - [ ] Import JSON possible? ❌ À implémenter
  - [ ] Partage via code unique? ❌ À implémenter

**Blockers majeurs**: 
- 🔴 UI canva + drag-drop manquante
- 🔴 Wiring API incomplete
- 🔴 Volet latéral manquant

**Effort estimé**: 3-4 jours frontend

---

### Sections 3 & 10: Pipelines Culture & Curing 🔴 CRITIQUE

**État**: 40% fonctionnel (backend ✅, frontend ❌)

#### Partie A: Configuration Initiale

- [x] Champ: Mode timeline (Jours/Semaines/Phases) → select
- [x] Champ: Dates début/fin → date pickers
- [x] Auto-calcul durée totale
- [x] Backend routes: POST/GET/PUT `/api/pipeline-*`
- [x] Validation dates

**OK**: Configuration initiale complète

#### Partie B: Visualisation Grille 🔴 MANQUANTE

- [ ] **Mode JOURS**:
  - [ ] Grille 365 carrés générés? ❌ À implémenter
  - [ ] Click carré → modale édition jour? ❌ À implémenter
  - [ ] Pagination si > 365? ❌ À implémenter
  - [ ] Bouton "+" last carré pour ajouter jour? ❌ À implémenter

- [ ] **Mode SEMAINES**:
  - [ ] Grille S1-S52 générée? ❌ À implémenter
  - [ ] Click semaine → modale édition? ❌ À implémenter
  - [ ] Bouton "+" last carré? ❌ À implémenter

- [ ] **Mode PHASES**:
  - [ ] 12 carrés phases prédéfinies? ❌ À implémenter
  - [ ] Click phase → modale édition? ❌ À implémenter

#### Partie C: Modale Édition Jour/Semaine/Phase 🔴 MANQUANTE

- [ ] Afficher 9 groupes de données (Espace, Substrat, etc.)
- [ ] Chaque groupe: collapsible / expandable
- [ ] Édition données in-place
- [ ] "Enregistrer comme preset?" modale
- [ ] Save → backend POST step
- [ ] Photos upload (1/jour max)
- [ ] Timestamp automatique

**Blockers majeurs**:
- 🔴 Composant GithubStylePipelineGrid manquant
- 🔴 Modale édition étapes manquante
- 🔴 Intégration 9 groupes incomplete

**Effort estimé**: 4-5 jours frontend

#### Partie D: Les 9 Groupes Données ✅ À VALIDER

**Groupe 1: Espace de Culture**
- [ ] Mode (Indoor/Outdoor/Greenhouse/No-till) → select
- [ ] Type espace (Tente/Cabinet/Room/Serre/Ext) → select
- [ ] Dimensions L×l×H (inputs cm ou m)
- [ ] Surface calculée (m²) → auto
- [ ] Densité plantes (plants/m²) → input
- [ ] Backend fields? ✅
- [ ] Validation? ✅

**Groupe 2: Substrat**
- [ ] Type (Solide/Hydro/Aéro) → select
- [ ] Volume total (L) → input
- [ ] Composition % (multi-check avec %)
- [ ] Marques par component
- [ ] pH & EC (optionnel)

**Groupe 3: Irrigation**
- [ ] Système (select)
- [ ] Source eau (select)
- [ ] Schedule (select)
- [ ] Volume par arrosage (input)
- [ ] Suppléments (multi-select)

**Groupe 4: Engrais & Nutrition**
- [ ] Type (select)
- [ ] Marques & gammes (multi-select + texte)
- [ ] Produits (multi-select)
- [ ] Dosages (input)
- [ ] Schedule (input)

**Groupe 5: Lumière**
- [ ] Type lampe (select)
- [ ] Spectre (select)
- [ ] Puissance (input W)
- [ ] Distance (input)
- [ ] Durée éclairage (input h)
- [ ] PPFD, Kelvin (optionnel)

**Groupe 6: Climat**
- [ ] Température (input °C)
- [ ] Humidité relative (input %)
- [ ] CO2 (input ppm, optionnel)
- [ ] Ventilation (select + fréquence)
- [ ] Cibles par phase (optional)

**Groupe 7: Palissage & Techniques**
- [ ] Techniques (multi-select: SCROG/SOG/Main-Lining/LST)
- [ ] Semaine début (input)
- [ ] Notes & photos avant/après

**Groupe 8: Morphologie Plante**
- [ ] Hauteur (input cm/m)
- [ ] Volume (input)
- [ ] Poids (input g, estimé)
- [ ] Branches principales (input nb)
- [ ] État santé (slider 1-10)

**Groupe 9: Récolte & Finition**
- [ ] Date récolte (date picker)
- [ ] Couleur trichomes (slider coloré: Translucide/Laiteux/Ambré/Marron)
- [ ] Poids brut (input g)
- [ ] Poids net séché (input g)
- [ ] Rendement (input g/m²)
- [ ] Méthode séchage (select)

---

### Sections 5-9: Évaluations Sensoriques ✅ COMPLET

#### Section 5: Visuel & Technique ✅ 95%

- [x] 7 sliders 0-10 (Couleur, Densité, Trichomes, Pistils, Manucure, Moisissure, Graines)
- [x] Color picker pour couleur
- [x] Validation
- [x] Stockage
- [ ] À vérifier: Palette couleur stylisée?

#### Section 6: Odeurs ✅ 95%

- [x] Multi-select dominantes (max 7)
- [x] Multi-select secondaires (max 7)
- [x] Arômes inhalation
- [x] Saveur/rétro-olfaction
- [x] Intensité slider (0-10)
- [x] Validation (max 7)

#### Section 7: Texture ✅ 95%

- [x] 4 sliders (Dureté, Densité, Élasticité, Collant)
- [x] Validation
- [x] Stockage

#### Section 8: Goûts ✅ 95%

- [x] Intensité & agressivité sliders
- [x] Dry puff (multi-select max 7)
- [x] Inhalation (multi-select max 7)
- [x] Expiration (multi-select max 7)

#### Section 9: Effets Ressentis ✅ 95%

- [x] Méthode consommation (select)
- [x] Dosage estimé (input g/mg)
- [x] Durée effets (slider 1m → 72h)
- [x] Intensité générale (slider 0-10)
- [x] Profils effets (multi-select max 8, catégorisés)
- [x] Effets secondaires (multi-select)
- [x] Usage préféré (multi-select)

#### Section 4: Analytiques ✅ 95%

- [x] THC % (input)
- [x] CBD % (input)
- [x] Autres cannabinoïdes (JSON input?)
- [x] Profil terpénique (upload PDF ou URL)
- [x] Lien certificat (URL input)

---

## 📚 PART 3: BIBLIOTHÈQUE UTILISATEUR (Refonte)

**État**: 70% fonctionnel

### Structure Bibliothèque

- [ ] **Fiches Techniques**:
  - [x] Backend routes CRUD FlowerReview
  - [ ] Frontend: Lister reviews? ⚠️ À vérifier
  - [ ] Frontend: Filtrer (Type/Status/Date)? ❓ À implémenter
  - [ ] Frontend: Trier (Récent/Ancien/Favorite)? ❓ À implémenter
  - [ ] Frontend: Chercher par nom/cultivar? ❓ À implémenter
  - [ ] Frontend: Bouton "Éditer"? ❓ À implémenter
  - [ ] Frontend: Bouton "Dupliquer"? ❌ À implémenter
  - [ ] Frontend: Bouton "Supprimer"? ⚠️ À vérifier
  - [ ] Frontend: Changer visibilité (Privée ↔ Publique)? ❌ À implémenter
  - [ ] Frontend: Voir stats (notes moyennes, etc.)? ❌ À implémenter

- [ ] **Groupes Réutilisables (Presets)**:
  - [x] Backend routes CRUD UserPreset
  - [ ] Frontend: Lister presets par groupe? ❓ À implémenter
  - [ ] Frontend: Charger preset dans review? ⚠️ À vérifier
  - [ ] Frontend: Éditer preset? ❓ À implémenter
  - [ ] Frontend: Renommer? ✅ Possiblement OK
  - [ ] Frontend: Supprimer? ⚠️ À vérifier
  - [ ] Frontend: Marquer favorite? ❌ À implémenter
  - [ ] Frontend: Voir usage (X reviews)? ❌ À implémenter

- [ ] **Cultivars**:
  - [x] Table Cultivars Prisma exist
  - [ ] Frontend: Lister cultivars? ❓ À implémenter
  - [ ] Frontend: Ajouter cultivar custom? ❌ À implémenter
  - [ ] Frontend: Voir stats (utilisé X fois)? ❌ À implémenter

- [ ] **Arbres Généalogiques (PhenoHunt - Producteur)**:
  - [x] Backend routes CRUD GeneticTree
  - [ ] Frontend: Lister arbres? ❌ À implémenter
  - [ ] Frontend: Ouvrir arbre? ❌ À implémenter
  - [ ] Frontend: Créer nouvel arbre? ⚠️ Partiellement
  - [ ] Frontend: Supprimer arbre? ❌ À implémenter

- [ ] **Templates Export**:
  - [ ] Frontend: Lister templates? ❓ À implémenter
  - [ ] Frontend: Charger template? ❓ À implémenter
  - [ ] Frontend: Sauvegarder template custom? ❌ À implémenter

- [ ] **Préférences Globales**:
  - [ ] Unités par défaut (Métrique/Impérial)? ⚠️ À implémenter
  - [ ] Marques favorites? ❌ À implémenter
  - [ ] Format export préféré? ❌ À implémenter
  - [ ] Thème interface (Clair/Sombre)? ⚠️ À implémenter

**Blockers majeurs**:
- 🔴 UI Bibliothèque: structure + filtres + tri incomplete
- 🔴 Charger presets: integration incomplete

**Effort estimé**: 3-4 jours frontend

---

## 🎨 PART 4: EXPORT & RENDU

**État**: 50% fonctionnel

### Formats

- [x] PNG standard ✅
- [x] PDF standard ✅
- [ ] PNG 300 DPI? ❌ À implémenter
- [ ] PDF 300 DPI? ⚠️ À vérifier
- [ ] JSON structuré? ❌ À implémenter
- [ ] CSV tableau plat? ❌ À implémenter
- [ ] HTML printable? ❌ À implémenter

### Templates

- [x] Backend: Templates dans Prisma? ✅
- [ ] Frontend: Sélecteur template? ⚠️ À vérifier
- [ ] Compact (1:1) OK? ⚠️ À vérifier
- [ ] Détaillé (1:1/16:9/9:16/A4) OK? ⚠️ À vérifier
- [ ] Complète (A4) OK? ❌ À implémenter
- [ ] Influenceur (9:16) OK? ❌ À implémenter
- [ ] Personnalisé (Producteur) OK? ❌ À implémenter

### Processus Export

- [ ] UI: Popup sélecteur format? ❌ À implémenter
- [ ] UI: Sélecteur template? ⚠️ À vérifier
- [ ] UI: Options qualité? ❌ À implémenter
- [ ] UI: Prévisualisation live? ❌ À implémenter
- [ ] Backend: `POST /api/export/generate`? ⚠️ À vérifier
- [ ] Fichier généré → stockage `/db/exports/`? ⚠️ À vérifier
- [ ] Téléchargement client? ⚠️ À vérifier
- [ ] Historique exports en bibliothèque? ❌ À implémenter

**Blockers majeurs**:
- 🔴 Popup export UI incomplete
- 🔴 Format JSON/CSV/HTML manquants
- 🔴 Templates Complète/Influenceur/Perso manquants

**Effort estimé**: 4-6 jours frontend + backend

---

## 🌐 PART 5: GALERIE PUBLIQUE

**État**: 60% fonctionnel

### Affichage

- [x] Afficher reviews publiques? ✅
- [ ] Filtres avancés? ⚠️ À vérifier
- [ ] Recherche texte? ⚠️ À vérifier
- [ ] Tri (Récent/Populaire/Top)? ⚠️ À vérifier
- [ ] Pagination? ✅

### Interactions

- [x] Like (cœur)? ✅
- [ ] Partage Facebook/Twitter/Reddit? ❌ À implémenter
- [ ] Ajouter favoris perso? ❌ À implémenter
- [ ] Commentaires? ⚠️ À vérifier

### Modération

- [ ] Signaler contenu? ❌ À implémenter
- [ ] Admin panel reports? ❌ À implémenter

**Blockers majeurs**:
- 🔴 Partage réseaux sociaux manquant
- 🔴 Admin panel modération manquant

**Effort estimé**: 2-3 jours frontend + admin

---

## 🗂️ PART 6: STOCKAGE & BASE DONNÉES

**État**: 90% fonctionnel

### Modèles Prisma

- [x] User (auth + subscription)
- [x] FlowerReview (10 sections)
- [x] PipelineStep (culture + curing)
- [x] GeneticTree (PhenoHunt)
- [x] UserPreset (presets)
- [x] Export (historique)
- [x] Cultivar (lookup)
- [ ] À vérifier: Tous les champs présents? 

### Tables Validées

- [ ] User: accountType, subscription, oauth fields? ✅
- [ ] FlowerReview: Section 1-10 fields? ⚠️ À vérifier
- [ ] PipelineStep: mode, dates, 9 groupes JSON? ⚠️ À vérifier
- [ ] GeneticTree: nodes/edges JSON? ✅
- [ ] UserPreset: group, data JSON? ✅

### Fichiers

- [x] `/db/review_images/` → Photos reviews
- [x] `/db/exports/` → Fichiers générés
- [x] `/db/kyc_documents/` → Docs KYC (futur)
- [x] `/db/backups/` → Backups

---

## 🚀 PART 7: WORKFLOWS PRINCIPAUX

### Workflow 1: Créer Review ✅ 80%

- [x] Accès `/review/create?type=fleur`
- [x] Choix source (Nouvelle/Preset/Dupliquer)
- [x] Remplissage 10 sections (carousel)
- [x] Save & Continue chaque section
- [x] Progress bar
- [x] Validation live
- [x] Enregistrement final
- [ ] À tester: Bout-en-bout complet?

### Workflow 2: PhenoHunt ❌ 40%

- [ ] Créer arbre
- [ ] Drag-drop cultivars
- [ ] Relier parents → enfants
- [ ] Nommer phénotypes
- [ ] Sauvegarder
- [ ] Exporter JSON
- [ ] Partager code unique

### Workflow 3: Pipeline Culture ❌ 40%

- [ ] Choisir mode (Jours/Semaines/Phases)
- [ ] Définir dates
- [ ] Grille auto-générée
- [ ] Click jour → modale édition
- [ ] Remplir 9 groupes
- [ ] Enregistrer comme preset?
- [ ] Save étape
- [ ] Continuer jours suivants

### Workflow 4: Export ⚠️ 50%

- [ ] Review complète
- [ ] Click "Exporter"
- [ ] Popup sélecteur (format/template)
- [ ] Prévisualisation
- [ ] Click "Générer"
- [ ] Fichier téléchargé
- [ ] Historique stocké

### Workflow 5: Galerie ✅ 70%

- [ ] Review "Complète"
- [ ] Toggle "Partager en galerie"
- [ ] URL publique générée
- [ ] Affichage galerie
- [ ] Like/partage
- [ ] Notifications interactions

---

## 🐛 PART 8: BUGS & EDGE CASES

### Connues

- [ ] Validation Section 3 dates: fin < début? ❌ À valider
- [ ] Validation Section 3 pipeline: limites carrés? ❌ À valider
- [ ] Sauvegarder preset: déduplication? ❌ À vérifier
- [ ] Upload images: formats supportés? ⚠️ À vérifier
- [ ] Export: fichiers > 50MB? ⚠️ À tester
- [ ] Galerie: pagination > 1000 reviews? ❌ À tester

### À Tester

- [ ] Créer review → Refresh page → Données persistent?
- [ ] Changer section, revenir section 1 → Données persistent?
- [ ] Mode hors-ligne → Données synced?
- [ ] Compte Amateur try unlock Producteur feature → Blocked?
- [ ] Supprimer review → Exports orphelins?
- [ ] GeneticTree export JSON → Re-import identique?

---

## ✨ PART 9: REFACTORISATION & POLISH

### Code Quality

- [ ] Composants React réutilisables? ⚠️ À valider
- [ ] Pas de duplications champs? ⚠️ À valider
- [ ] Error handling exhaustif? ⚠️ À valider
- [ ] Logs info/warn/error adéquats? ⚠️ À valider
- [ ] Types TypeScript complets? ⚠️ À valider

### Performance

- [ ] Export > 10 pages: performance? ❌ À tester
- [ ] Galerie: chargement pagination rapide? ⚠️ À tester
- [ ] Pipeline: 365 carrés rendu smooth? ❌ À tester
- [ ] PhenoHunt: 50+ nodes graph smooth? ❌ À tester

### UX/Design

- [ ] Interface Apple-like épurée? ⚠️ À valider
- [ ] Transitions smooth entre sections? ⚠️ À valider
- [ ] Responsive mobile? ⚠️ À valider
- [ ] Dark mode fonctionne? ⚠️ À valider
- [ ] Tooltips contextuels ajoutés? ❌ À implémenter

---

## 📊 RÉSUMÉ STATUT GLOBAL

| Composant | Statut | Critique? | Effort |
|---|---|---|---|
| **Permissions** | 🔴 À implémenter | 🔴 OUI | 2-3 jours |
| **Section 1: Infos** | ✅ OK | ❌ Non | 0 jours |
| **Section 2: Génétiques** | ⚠️ 60% | ❌ Non | 0.5 jour |
| **Section 2: PhenoHunt** | 🔴 40% | 🔴 OUI | 3-4 jours |
| **Section 3: Pipeline Culture** | 🔴 40% | 🔴 OUI | 4-5 jours |
| **Section 4: Analytiques** | ✅ 95% | ❌ Non | 0 jours |
| **Sections 5-9: Évaluations** | ✅ 95% | ❌ Non | 0.5 jour |
| **Section 10: Pipeline Curing** | 🔴 40% | 🔴 OUI | 3-4 jours |
| **Bibliothèque** | ⚠️ 70% | ⚠️ Oui | 3-4 jours |
| **Export** | ⚠️ 50% | 🔴 OUI | 4-6 jours |
| **Galerie** | ✅ 60% | ❌ Non | 2-3 jours |
| **Stockage BD** | ✅ 90% | ❌ Non | 0.5 jour |
| **Workflows** | ⚠️ 65% | ⚠️ Oui | - |

### Décompte Heures

- **Permissions**: 16-24h 🔴 CRITIQUE
- **PhenoHunt**: 24-32h 🔴 CRITIQUE
- **Pipelines (Culture + Curing)**: 32-40h 🔴 CRITIQUE
- **Bibliothèque**: 24-32h ⚠️ Important
- **Export**: 32-48h 🔴 CRITIQUE
- **Galerie**: 16-24h ✅ Normal
- **Testing & Polish**: 16-24h ✅ Normal

**TOTAL ESTIMÉ**: 160-224 heures (20-28 jours @ 8h/jour, 2-3 devs = 7-14 jours)

---

## ✅ V1 MVP VALIDÉ QUAND:

- [ ] Permissions: 100% implémentées & testées
- [ ] Sections 1-10: Toutes fonctionnelles
- [ ] PhenoHunt: Full lifecycle (create/edit/save/export)
- [ ] Pipelines: Visualization + édition complètes
- [ ] Export: Tous formats & templates working
- [ ] Bibliothèque: CRUD + filtres fonctionnels
- [ ] Galerie: Affichage + interactions OK
- [ ] Tests: Coverage > 80%
- [ ] Bugs: Zéro blockers
- [ ] Perf: Export < 5s, Galerie smooth

**Date cible**: 3-4 semaines (16-28 jours effort combiné)

---

**Document**: Validation V1 MVP Fleurs  
**Prochaine étape**: Corriger chaque ❌, puis ⚠️, puis ✅ tester
