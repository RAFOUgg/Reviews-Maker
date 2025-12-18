# SYSTÈME PIPELINE UNIFIÉ - DOCUMENTATION TECHNIQUE

## 📋 Vue d'ensemble

Le système Pipeline Unifié est une architecture générique et réutilisable permettant de gérer toutes les pipelines du projet Reviews-Maker selon les spécifications du CDC.

### Principe fondamental

**UN SEUL COMPOSANT (`UnifiedPipeline`) + DES CONFIGURATIONS STATIQUES = TOUS LES TYPES DE PIPELINE**

```
UnifiedPipeline({ type: 'culture' }) → Pipeline Culture (Fleurs)
UnifiedPipeline({ type: 'curing' }) → Pipeline Curing (tous produits)
UnifiedPipeline({ type: 'separation' }) → Pipeline Séparation (Hash)
UnifiedPipeline({ type: 'extraction' }) → Pipeline Extraction (Concentrés)
UnifiedPipeline({ type: 'recipe' }) → Pipeline Recette (Edibles)
```

---

## 🏗️ Architecture

```
📦 client/src/
├── config/
│   └── pipelineConfigs.js          ← CONFIGURATIONS STATIQUES (85+ champs par type)
│
├── components/
│   ├── UnifiedPipeline.jsx         ← COMPOSANT GÉNÉRIQUE PRINCIPAL
│   └── pipeline/
│       └── PipelineDragDropView.jsx ← SYSTÈME D&D ET TIMELINE
│
└── pages/
    ├── CreateFlowerReview/sections/
    │   ├── PipelineCulture.jsx     → type="culture"
    │   └── PipelineCuring.jsx      → type="curing"
    │
    ├── CreateHashReview/sections/
    │   ├── SeparationPipelineSection.jsx → type="separation"
    │   └── PipelineCuring.jsx            → type="curing"
    │
    ├── CreateConcentrateReview/sections/
    │   ├── ExtractionPipelineSection.jsx → type="extraction"
    │   └── PipelineCuring.jsx            → type="curing"
    │
    └── CreateEdibleReview/sections/
        ├── RecipePipelineSection.jsx → type="recipe"
        └── PipelineCuring.jsx        → type="curing"
```

---

## 🔧 Configurations disponibles

### 1. CULTURE_PIPELINE_CONFIG (Fleurs - 85+ champs)

**Sections :**
- GÉNÉRAL (9 champs) : mode, espace, dimensions, propagation, etc.
- SUBSTRAT & COMPOSITION (10 champs) : type, volume, composition %, pH, EC
- ENVIRONNEMENT (9 champs) : températures, humidité, VPD, CO₂, ventilation
- LUMIÈRE & SPECTRE (7 champs) : type lampe, spectre, distance, puissance, PPFD, DLI
- IRRIGATION & FRÉQUENCE (6 champs) : système, fréquence, volume, pH eau, EC eau
- ENGRAIS & DOSAGE (6 champs) : type, marque, dosage NPK, fréquence, additifs
- PALISSAGE & TECHNIQUES (2 champs) : méthodes (SCROG, SOG, LST, etc.), commentaires
- MORPHOLOGIE PLANTE (6 champs) : taille, volume, poids, branches, feuilles, buds
- RÉCOLTE (5 champs) : couleur trichomes, date, poids brut/net, rendement

**Types d'intervalles :**
- Jours (365 max)
- Semaines (52 max)
- Phases physiologiques (12 phases prédéfinies)

---

### 2. CURING_PIPELINE_CONFIG (Tous produits)

**Sections :**
- TEMPÉRATURE : type curing (froid/ambiant/chaud), température °C
- HUMIDITÉ : humidité relative %, Boveda/Integra
- CONTENANT : type récipient, opacité, volume occupé
- EMBALLAGE PRIMAIRE : cellophane, papier, aluminium, sous vide, etc.

**Types d'intervalles :**
- Secondes (3600 max)
- Minutes (1440 max)
- Heures (720 max)
- Jours (365 max)
- Semaines (52 max)
- Mois (24 max)

---

### 3. SEPARATION_PIPELINE_CONFIG (Hash)

**Sections :**
- MÉTHODE DE SÉPARATION : manuel, dry-sift, ice-water, bubble hash, etc.
- MATIÈRE PREMIÈRE : type, qualité, rendement, temps séparation

**Champs spécifiques :**
- Nombre de passes
- Température eau (pour ice-water)
- Taille des mailles (220µm, 190µm, 160µm, 120µm, 90µm, 73µm, 45µm, 25µm)

**Types d'intervalles :**
- Secondes (3600 max)
- Minutes (180 max)
- Heures (24 max)

---

### 4. EXTRACTION_PIPELINE_CONFIG (Concentrés)

**Méthodes d'extraction (18 techniques) :**
- Solvants : Éthanol (EHO), IPA, Acétone, Butane (BHO), Propane (PHO), Hexane (HHO)
- Mécaniques : Rosin (chaud/froid)
- Avancées : CO₂ supercritique, Ultrasons (UAE), Micro-ondes (MAE)
- Organiques : Huiles végétales, Tensioactifs

**Champs :**
- Température extraction (-80°C à 300°C)
- Pression (0-500 bar)
- Durée (minutes)
- Rendement (%)

---

### 5. PURIFICATION_PIPELINE_CONFIG (Hash & Concentrés)

**Méthodes de purification (18 techniques) :**
- Chromatographie : Colonne, Flash, HPLC, GC, TLC
- Séparation : Winterisation, Fractionnement (température/solubilité)
- Filtration : Mécanique, Centrifugation, Charbon actif, Membranaire
- Cristallisation : Recristallisation, Sublimation
- Autres : Décarboxylation, Séchage sous vide, Décantation

**Champs :**
- Méthode(s) (multiselect)
- Température (-80°C à 300°C)
- Durée (minutes)
- Solvant utilisé

---

### 6. RECIPE_PIPELINE_CONFIG (Edibles)

**Sections :**
- INGRÉDIENTS : type (cannabique/standard), nom, quantité, unité
- ÉTAPES DE PRÉPARATION : action, température, durée, commentaire

**Phases prédéfinies :**
1. Préparation ingrédients (15min)
2. Décarboxylation (40min)
3. Infusion/Mélange (60min)
4. Cuisson (30min)
5. Refroidissement (120min)
6. Conservation (1440min)

**Actions disponibles :**
- Hacher/Broyer, Mélanger, Chauffer, Cuire (four/poêle)
- Infuser, Décarboxyler, Refroidir, Filtrer
- Émulsionner, Fouetter, Laisser reposer

---

## 🎯 Fonctionnalités du système

### Interface utilisateur

1. **Panneau latéral gauche** : Contenus disponibles organisés par sections
   - Sections collapsibles
   - Icônes représentatives
   - Données selon configuration

2. **Timeline centrale** : Grille de cases GitHub-style
   - Nombre de cases selon `intervalType` et `maxCells`
   - Labels dynamiques (J1, S1, Phase 1, etc.)
   - Jauge de progression (% cases remplies)
   - Pagination automatique si > 365 cases

3. **Interactions**
   - **Drag & Drop** : Glisser contenu → case
   - **Clic gauche case vide** : Ouvrir modal ajout données
   - **Clic gauche case remplie** : Ouvrir modal édition (onglets : données actuelles + disponibles)
   - **Clic droit contenu** : Menu contextuel (définir valeurs, assigner plage)
   - **Ctrl/Shift + clic** : Sélection multiple de cases

4. **Préréglages utilisateur**
   - Bouton "Créer un préréglage global"
   - Sauvegarder toutes les données configurées
   - Charger un préréglage pour l'appliquer
   - localStorage par type de pipeline

---

## 💻 Utilisation développeur

### Ajouter une nouvelle pipeline

```jsx
// 1. Créer la configuration dans pipelineConfigs.js
export const MY_PIPELINE_CONFIG = {
    type: 'my-type',
    title: '🔥 Mon Pipeline',
    description: 'Description',
    intervalTypes: [/* ... */],
    sidebarContent: [/* sections et items */]
}

// 2. Ajouter au mapper
export const getPipelineConfig = (type) => {
    const configs = {
        // ...existing configs
        'my-type': MY_PIPELINE_CONFIG
    }
    return configs[type]
}

// 3. Utiliser dans un composant
import UnifiedPipeline from '@/components/UnifiedPipeline'

export default function MyPipelineSection({ formData, handleChange }) {
    return (
        <UnifiedPipeline
            type="my-type"
            data={formData.myPipeline || {}}
            onChange={(data) => handleChange('myPipeline', data)}
        />
    )
}
```

### Format des données

```javascript
// Structure timelineConfig
{
    type: 'jour',           // Type d'intervalle
    start: '2025-01-01',    // Date début (optionnel)
    end: '2025-04-01',      // Date fin (optionnel)
    duration: 90,           // Durée en unités
    totalCells: 90,         // Nombre de cases
    phases: [/* ... */]     // Phases prédéfinies (si type='phase')
}

// Structure timelineData
[
    {
        timestamp: 0,       // Index de la case (0-indexed)
        data: {
            modeCulture: 'indoor',
            temperatureJour: 26,
            humiditeJour: 55,
            // ... autres champs
        }
    },
    {
        timestamp: 7,
        data: { /* ... */ }
    }
]
```

---

## 🔍 Points techniques importants

### 1. Gestion des hooks React

**TOUS les composants modaux DOIVENT être des arrow functions :**

```jsx
// ✅ CORRECT
const MyModal = ({ props }) => {
    const [state, setState] = useState()
    return <div>...</div>
}

// ❌ INCORRECT (cause React Error #31)
function MyModal({ props }) {
    const [state, setState] = useState()
    return <div>...</div>
}
```

### 2. localStorage et persistence

Chaque type de pipeline a son propre espace de stockage :
- `culturePipelinePresets`
- `curingPipelinePresets`
- `separationPipelinePresets`
- etc.

### 3. Performance

- Pagination automatique pour > 365 cases
- Lazy loading des données
- Debounce sur les sauvegardes onChange

---

## 🧪 Tests et validation

### Checklist fonctionnelle

- [ ] Drag & drop d'un contenu vers une case
- [ ] Clic gauche sur case vide → Modal s'ouvre
- [ ] Clic gauche sur case remplie → Modal avec données actuelles
- [ ] Clic droit sur contenu → Menu contextuel
- [ ] Option "Définir valeurs" fonctionnelle
- [ ] Option "Assigner à plage" (ex: J7 à J45)
- [ ] Sélection multiple (Ctrl+clic)
- [ ] Création préréglage global
- [ ] Sauvegarde préréglage
- [ ] Chargement préréglage
- [ ] Jauge de progression (% cases remplies)
- [ ] Affichage emojis/badges sur cases remplies
- [ ] Tooltip au survol des cases
- [ ] Changement type d'intervalle (jour → semaine → phase)
- [ ] Données persiste dans formData parent

---

## 📚 Références CDC

- **PIPELINE_DONNEE_CULTURES.md** : 85 champs culture détaillés
- **CDC complet** : Spécifications des 6 types de pipelines
- **UI/UX** : Design liquid glass, Apple-like, moderne

---

## 🚀 Prochaines étapes

1. ✅ Migration PipelineCulture → UnifiedPipeline
2. ✅ Migration PipelineCuring → UnifiedPipeline
3. ⏳ Intégration Hash (séparation + purification)
4. ⏳ Intégration Concentrés (extraction + purification)
5. ⏳ Intégration Edibles (recipe)
6. ⏳ Tests end-to-end sur tous types
7. ⏳ Déploiement VPS

---

**Dernière mise à jour** : 18 décembre 2025
**Version système** : 2.0.0 (Refonte complète)
**État** : ✅ Culture/Curing migrés | ⏳ Hash/Concentrés/Edibles en cours
