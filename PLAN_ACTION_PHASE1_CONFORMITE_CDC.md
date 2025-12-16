# 🎯 PLAN D'ACTION - CONFORMITÉ TOTALE CDC REVIEWS-MAKER
**Phase 1 : Système de Création de Reviews Complet**

---
**Date:** 16 Décembre 2025  
**Objectif:** Conformité 100% CDC pour création/édition/sauvegarde reviews  
**Référence:** REAL_VISION_CDC_DEV.md  
**Priorité:** 🔥 CRITIQUE - Fondation de l'application

---

## 📋 MÉTHODOLOGIE

### Principe de développement :
1. ✅ **Complétion par type de produit** (un à la fois)
2. ✅ **Validation exhaustive CDC** après chaque type
3. ✅ **Tests manuels systématiques** (création/édition/sauvegarde)
4. ✅ **Vérification permissions** selon type de compte

### Ordre d'implémentation :
1. **Fleurs** (priorité haute - pipeline culture complexe)
2. **Hash** (pipeline séparation + purification)
3. **Concentrés** (pipeline extraction + purification)
4. **Comestibles** (pipeline recette - plus simple)

---

## 1️⃣ FLEURS - CONFORMITÉ CDC

### 📊 État actuel : 75% conforme

#### ✅ Sections DÉJÀ conformes :
- Informations générales (nom, cultivar, farm, photos)
- Visuel & Technique (7 sliders /10)
- Odeurs (notes dominantes/secondaires, intensité)
- Texture (4 sliders /10)
- Goûts (intensité, agressivité, inhalation/expiration)
- Effets ressentis (montée, intensité, choix filtrable)

#### ❌ Sections MANQUANTES ou PARTIELLES :

### A. GÉNÉTIQUES (Section dédiée) - 🔴 À CRÉER

**Selon CDC :**
```
- Breeder de la graine
- Variété (auto-complete)
- Type : Indica / Sativa / Hybride
- Pourcentage de chaque génétique (si dispo)
- Généalogie (parents, lignée, phénotype/clone)
- Code phénotype ou sélection ("Pheno" pour hunt)
```

**Fichiers à créer/modifier :**
```
✅ CRÉER : client/src/components/reviews/sections/GeneticsSection.jsx
✅ MODIFIER : client/src/pages/CreateFlowerReview/index.jsx (ajouter section)
✅ MODIFIER : client/src/utils/productStructures.js (ajouter champs genetics)
```

**Structure données :**
```javascript
genetics: {
  breeder: String,           // Auto-complete depuis cultivars
  variety: String,           // Auto-complete
  type: String,              // Select: Indica/Sativa/Hybride
  indicaRatio: Number,       // Slider 0-100%
  sativaRatio: Number,       // Calculé automatiquement (100 - indica)
  parentage: {
    mother: String,          // Cultivar parent
    father: String,          // Cultivar parent
    lineage: String,         // Texte libre court
  },
  phenotype: String,         // Ex: "Pheno #3"
  cloneCode: String          // Code unique si clone
}
```

---

### B. PIPELINE CULTURE - 🟡 PARTIEL (70%)

**Selon CDC :**
```
CONFIGURATIONS TRAME :
- Trames: heures, jours, dates, semaines, mois, phases
- Phases: 0day=Graine, Germination, Plantule, 
  Debut/Milieu/Fin Croissance, Debut/Milieu/Fin Stretch, 
  Debut/Milieu/Fin Floraison

DONNÉES MODIFIABLES PAR CELLULE :
[GENERAL]
- Mode : Indoor/Outdoor/Greenhouse/No-till/Autre
- Espace de culture (type, dimensions, surface, volume)

[ENVIRONNEMENT]
- Technique de propagation
- Substrat (type, volume, composition%, marques)
- Système d'irrigation (type, fréquence, volume)
- Engrais (type, marque, dosage, fréquence)
- Lumière (type, spectre PDF, distance, puissance, durée, DLI, PPFD, Kelvin)
- Environnement (température, humidité, CO2, ventilation)
- Palissage LST/HST (méthodologies, commentaire)
- Morphologie plante (taille, volume, poids, branches, feuilles, buds)
- Récolte (couleur trichomes, date, poids brut/net, rendement)
```

**CE QUI MANQUE :**

#### 1. Configuration trame phases prédéfinies
```
❌ 12 phases culture non configurées
❌ Pas d'icônes/couleurs par phase
❌ Pas de sélecteur visuel phases
```

**Fichiers à modifier :**
```
✅ client/src/types/pipelineTypes.js - Ajouter CULTURE_PHASES
✅ client/src/components/pipeline/PipelineCore.jsx - Gérer phases prédéfinies
✅ client/src/components/reviews/sections/CulturePipelineSection.jsx - UI sélecteur
```

**Constantes à ajouter :**
```javascript
export const CULTURE_PHASES = [
  { id: 'day-0', name: 'Jour 0 - Graine', icon: '🌰', color: '#8B4513', duration: 1 },
  { id: 'germination', name: 'Germination', icon: '🌱', color: '#90EE90', duration: 3 },
  { id: 'plantule', name: 'Plantule', icon: '🌿', color: '#32CD32', duration: 7 },
  { id: 'croissance-debut', name: 'Début Croissance', icon: '🌳', color: '#228B22', duration: 7 },
  { id: 'croissance-milieu', name: 'Milieu Croissance', icon: '🌲', color: '#006400', duration: 7 },
  { id: 'croissance-fin', name: 'Fin Croissance', icon: '🎋', color: '#2F4F2F', duration: 7 },
  { id: 'stretch-debut', name: 'Début Stretch', icon: '📈', color: '#FFD700', duration: 7 },
  { id: 'stretch-milieu', name: 'Milieu Stretch', icon: '🌾', color: '#FFA500', duration: 7 },
  { id: 'stretch-fin', name: 'Fin Stretch', icon: '🌺', color: '#FF8C00', duration: 7 },
  { id: 'floraison-debut', name: 'Début Floraison', icon: '🌸', color: '#FF69B4', duration: 14 },
  { id: 'floraison-milieu', name: 'Milieu Floraison', icon: '🌼', color: '#FF1493', duration: 14 },
  { id: 'floraison-fin', name: 'Fin Floraison', icon: '💐', color: '#C71585', duration: 14 }
];
```

#### 2. Drag & drop contenus sidebar → cases
```
❌ PipelineContentsSidebar.jsx non intégré
❌ Pas de drag & drop fonctionnel
❌ Pas de sections hiérarchisées (GENERAL, ENVIRONNEMENT, etc.)
```

**Tâche :**
```
✅ Intégrer PipelineContentsSidebar dans CulturePipelineSection
✅ Implémenter react-dnd ou native HTML5 drag & drop
✅ Organiser contenus par catégories dépliables
```

#### 3. Sélection multiple + application en masse
```
❌ Pas de sélection multiple cases (shift+click, ctrl+click)
❌ Pas de bouton "Appliquer à plusieurs"
❌ Pas de copier/coller données entre cases
```

**Tâche :**
```
✅ Ajouter state selectedCells dans PipelineCore
✅ Créer BulkEditModal pour édition groupée
✅ Implémenter logique application en masse
```

#### 4. Préréglages utilisateur
```
❌ Pas de sauvegarde substrats fréquents
❌ Pas de sauvegarde engrais fréquents
❌ Pas de sauvegarde matériel (lampes, ventilation)
❌ Pas d'auto-complete intelligent
```

**Fichiers à créer :**
```
✅ CRÉER: client/src/pages/PresetsLibraryPage.jsx
✅ CRÉER: client/src/components/presets/SubstrateManager.jsx
✅ CRÉER: client/src/components/presets/FertilizerManager.jsx
✅ CRÉER: client/src/components/presets/EquipmentManager.jsx
✅ CRÉER: server-new/routes/presets.js
```

**Schéma Prisma :**
```prisma
model Preset {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // 'substrate', 'fertilizer', 'equipment', 'irrigation'
  name      String
  config    Json     // Configuration complète du preset
  useCount  Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId, type])
}
```

#### 5. Champs spécifiques manquants
```
❌ Upload PDF spectre lumière
❌ Nuancier couleur trichomes récolte
❌ Calcul automatique rendement (g/m² ou g/plante)
```

**Tâche :**
```
✅ Ajouter FileUpload pour spectre lumière (PDF/image)
✅ Créer ColorPicker trichomes (translucide/laiteux/ambré)
✅ Implémenter calcul rendement automatique
```

---

### C. DONNÉES ANALYTIQUES - 🟡 PARTIEL (50%)

**Selon CDC :**
```
- Taux THC (%)
- Taux CBD (%)
- Taux CBG/CBC autres (%) ou mg/g
- Profil terpénique complet (par certificat d'analyse pdf/image uniquement)
```

**CE QUI MANQUE :**
```
❌ Upload certificat d'analyse (PDF/image)
❌ Parser automatique données si possible
❌ Affichage profil terpénique graphique
```

**Fichiers à créer/modifier :**
```
✅ CRÉER: client/src/components/reviews/sections/AnalyticsSection.jsx
✅ Intégrer react-dropzone pour upload certificat
✅ Afficher image/PDF en preview
```

---

### D. PIPELINE CURING - 🟡 PARTIEL (80%)

**Selon CDC :**
```
MODIFICATIONS DES NOTES :
- Visuel & Technique (évolution dans le temps)
- Odeurs (évolution dans le temps)
- Goûts (évolution dans le temps)
- Effets ressentis (évolution dans le temps)
```

**CE QUI MANQUE :**
```
❌ Pas de système "snapshot" notes à chaque étape curing
❌ Pas de graphiques évolution temporelle
❌ Pas de comparaison avant/après curing
```

**Tâche :**
```
✅ Ajouter ratingsSnapshots dans PipelineCell curing
✅ Créer RatingEvolutionChart.jsx (Chart.js)
✅ Permettre copie notes section principale → curing step
```

---

## 2️⃣ HASH - CONFORMITÉ CDC

### 📊 État actuel : 70% conforme

#### ❌ Sections MANQUANTES :

### A. PIPELINE SÉPARATION - 🟡 PARTIEL (60%)

**Selon CDC :**
```
DONNÉES PAR ÉTAPE :
- Méthode séparation (manuelle, tamisage sec, eau/glace, autre)
- Nombre de passes
- Température eau (si eau/glace)
- Taille mailles utilisées
- Type matière première (trim, buds, sugar leaves, etc.)
- Qualité matière première (/10)
- Rendement % estimé
- Temps total séparation
```

**CE QUI MANQUE :**
```
❌ Formulaire dédié par méthode séparation
❌ Calcul rendement automatique (poids entrant/sortant)
❌ Validation contraintes (ex: température eau si eau/glace)
```

---

### B. PIPELINE PURIFICATION - 🔴 MINIMAL (30%)

**Selon CDC :**
```
MÉTHODES DISPONIBLES :
"Chromatographie sur colonne, Flash Chromatography, HPLC, GC, TLC, 
Winterisation, Décarboxylation, Fractionnement par température, 
Fractionnement par solubilité, Filtration, Centrifugation, Décantation, 
Séchage sous vide, Recristallisation, Sublimation, Extraction liquide-liquide, 
Adsorption sur charbon actif, Filtration membranaire"

POUR CHAQUE MÉTHODE :
- Paramètres spécifiques (température, durée, solvant, etc.)
```

**CE QUI MANQUE :**
```
❌ Formulaires spécifiques par méthode
❌ Validation paramètres selon méthode
❌ Configuration JSON par méthode
```

**Fichiers à créer :**
```
✅ CRÉER: client/src/data/purificationMethods.js
✅ CRÉER: client/src/components/pipeline/PurificationMethodSelector.jsx
✅ CRÉER: client/src/components/pipeline/PurificationMethodForm.jsx
```

**Structure données :**
```javascript
export const PURIFICATION_METHODS = {
  winterisation: {
    id: 'winterisation',
    name: 'Winterisation',
    icon: '❄️',
    fields: [
      { key: 'temperature', label: 'Température', unit: '°C', type: 'number', min: -80, max: -20 },
      { key: 'duration', label: 'Durée', unit: 'h', type: 'number' },
      { key: 'solvent', label: 'Solvant', type: 'select', options: ['Éthanol', 'Méthanol', 'Isopropanol'] }
    ]
  },
  // ... autres méthodes
}
```

---

## 3️⃣ CONCENTRÉS - CONFORMITÉ CDC

### 📊 État actuel : 65% conforme

#### ❌ Sections MANQUANTES :

### A. PIPELINE EXTRACTION - 🟡 PARTIEL (50%)

**Selon CDC :**
```
MÉTHODES D'EXTRACTION :
"Extraction à l'éthanol (EHO), IPA, acétone (AHO), butane (BHO), 
isobutane (IHO), propane (PHO), hexane (HHO), huiles végétales, 
CO₂ supercritique, Pressage à chaud (Rosin), Pressage à froid, 
Ultrasons (UAE), Micro-ondes (MAE), Tensioactifs (Tween 20), Autre"

PARAMÈTRES PAR MÉTHODE :
- Température, pression, durée, solvant, etc.
```

**CE QUI MANQUE :**
```
❌ Formulaires spécifiques par méthode extraction
❌ Validation paramètres (ex: pression CO₂ supercritique)
❌ Warnings sécurité (butane, propane = danger)
```

**Fichiers à créer :**
```
✅ CRÉER: client/src/data/extractionMethods.js
✅ CRÉER: client/src/components/pipeline/ExtractionMethodSelector.jsx
✅ CRÉER: client/src/components/pipeline/ExtractionMethodForm.jsx
```

---

## 4️⃣ COMESTIBLES - CONFORMITÉ CDC

### 📊 État actuel : 80% conforme

#### ❌ Sections MANQUANTES :

### A. PIPELINE RECETTE - 🟡 PARTIEL (70%)

**Selon CDC :**
```
INGRÉDIENTS :
- Choix : produit standard / produit cannabinique
- Quantité + unité (g, ml, pcs, etc.)
- Étapes de préparation (actions prédéfinies assignables)
```

**CE QUI MANQUE :**
```
❌ Distinction visuelle standard/cannabinique
❌ Calcul dosage total cannabinoïdes
❌ Actions prédéfinies (mélanger, chauffer, infuser, etc.)
❌ Ordre des étapes drag & drop
```

**Fichiers à modifier :**
```
✅ MODIFIER: client/src/components/RecipeSection.jsx
✅ Ajouter toggle standard/cannabinique par ingrédient
✅ Créer RecipeStepsManager.jsx (drag & drop étapes)
```

---

## 🔧 CHECKLIST D'IMPLÉMENTATION

### Phase 1.1 - FLEURS (3-4 jours)
- [ ] **Jour 1 : Section Génétiques**
  - [ ] Créer GeneticsSection.jsx
  - [ ] Implémenter formulaire complet
  - [ ] Intégrer auto-complete cultivars
  - [ ] Tests création/édition
  
- [ ] **Jour 2 : Pipeline Culture - Phases**
  - [ ] Définir constantes CULTURE_PHASES
  - [ ] Implémenter sélecteur phases UI
  - [ ] Adapter PipelineCore pour phases
  - [ ] Tests affichage phases
  
- [ ] **Jour 3 : Pipeline Culture - Drag & Drop**
  - [ ] Intégrer PipelineContentsSidebar
  - [ ] Implémenter drag & drop HTML5
  - [ ] Organiser contenus par catégories
  - [ ] Tests interaction utilisateur
  
- [ ] **Jour 4 : Données Analytiques + Finitions**
  - [ ] Créer AnalyticsSection.jsx
  - [ ] Upload certificat analyse
  - [ ] Nuancier trichomes
  - [ ] Upload spectre lumière
  - [ ] Tests complets Fleurs

### Phase 1.2 - HASH (2 jours)
- [ ] **Jour 5 : Pipeline Séparation**
  - [ ] Formulaires par méthode séparation
  - [ ] Calcul rendement automatique
  - [ ] Tests séparation
  
- [ ] **Jour 6 : Pipeline Purification**
  - [ ] Définir purificationMethods.js
  - [ ] Créer formulaires dynamiques
  - [ ] Tests purification

### Phase 1.3 - CONCENTRÉS (1.5 jours)
- [ ] **Jour 7 : Pipeline Extraction**
  - [ ] Définir extractionMethods.js
  - [ ] Créer formulaires dynamiques
  - [ ] Warnings sécurité
  - [ ] Tests extraction

### Phase 1.4 - COMESTIBLES (0.5 jour)
- [ ] **Jour 7-8 : Pipeline Recette**
  - [ ] Distinction standard/cannabinique
  - [ ] RecipeStepsManager drag & drop
  - [ ] Tests recette

### Phase 1.5 - PRÉRÉGLAGES (2 jours)
- [ ] **Jour 8-9 : Bibliothèque Préréglages**
  - [ ] Schéma Prisma Preset
  - [ ] API routes/presets.js
  - [ ] PresetsLibraryPage.jsx
  - [ ] SubstrateManager, FertilizerManager, EquipmentManager
  - [ ] Auto-complete dans formulaires
  - [ ] Tests CRUD préréglages

### Phase 1.6 - PERMISSIONS & TESTS (1 jour)
- [ ] **Jour 10 : Validation Finale**
  - [ ] Vérifier permissions par type compte
  - [ ] Tests création/édition tous types
  - [ ] Tests sauvegarde privée
  - [ ] Tests édition existantes
  - [ ] Validation conformité CDC 100%

---

## 📈 MÉTRIQUES DE SUCCÈS

### Critères validation Phase 1 :
- ✅ Tous champs CDC présents par type produit
- ✅ Tous pipelines fonctionnels avec trames
- ✅ Drag & drop contenus opérationnel
- ✅ Préréglages sauvegardés/réutilisables
- ✅ Permissions respectées (Amateur/Influenceur/Producteur)
- ✅ Tests manuels passés sur tous types
- ✅ Aucune régression fonctionnelle

### Après Phase 1 → Phase 2 : EXPORT MAKER
(Plan détaillé après validation Phase 1)

---

**Estimation totale Phase 1 : 10 jours ouvrés**  
**Date début estimée : 17 Décembre 2025**  
**Date fin estimée : 30 Décembre 2025**

---

**Document créé par :** GitHub Copilot (Claude Sonnet 4.5)  
**Version :** 1.0 - Plan d'action initial
