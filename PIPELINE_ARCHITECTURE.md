# Architecture des Pipelines - Reviews Maker
**Date:** 2026-01-14  
**Version:** 2.0 - Restructuration complète

---

## 🎯 Objectif

Créer une architecture unifiée pour toutes les pipelines avec:
- **UI commune** pour toutes les pipelines
- **Contenus/formulaires spécifiques** selon le type
- **Layout cohérent** et responsive

---

## 📐 Structure Visuelle

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LIQUID WRAPPER CONTAINER (rounded-2xl, shadow, backdrop-blur)          │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ FLEX ROW LAYOUT (gap-4, p-4)                                        │ │
│ │ ┌──────────────────────┬──────────────────────────────────────────┐ │ │
│ │ │ SIDEBAR GAUCHE       │ TIMELINE CONTAINER DROITE                │ │ │
│ │ │ (w-80, flex-shrink-0)│ (flex-1, flex-col)                       │ │ │
│ │ │                      │                                          │ │ │
│ │ │ 📦 Contenus          │ ┌──────────────────────────────────────┐ │ │ │
│ │ │ ┌──────────────────┐ │ │ HEADER CONFIGURATION                 │ │ │ │
│ │ │ │ + Préréglages    │ │ │ - Titre (Culture/Curing/etc)         │ │ │ │
│ │ │ └──────────────────┘ │ │ - Undo/Redo                          │ │ │ │
│ │ │                      │ │ - Type intervalle (select)           │ │ │ │
│ │ │ 📂 Section 1         │ │ - Configuration trame                │ │ │ │
│ │ │   • Item 1 (drag)    │ │ - Progress bar                        │ │ │ │
│ │ │   • Item 2 (drag)    │ └──────────────────────────────────────┘ │ │ │
│ │ │                      │                                          │ │ │
│ │ │ 📂 Section 2         │ ┌──────────────────────────────────────┐ │ │ │
│ │ │   • Item 3 (drag)    │ │ TIMELINE GRID                        │ │ │ │
│ │ │   • Item 4 (drag)    │ │ ┌────────────────────────────────┐   │ │ │ │
│ │ │                      │ │ │ [■][■][■][■][■][■][■][■][■][■] │   │ │ │ │
│ │ │ 📂 Section 3         │ │ │ [■][■][■][■][■][■][■][■][■][■] │   │ │ │ │
│ │ │   • Item 5 (drag)    │ │ │ [■][■][■][■][■][■][■][■][■][■] │   │ │ │ │
│ │ │                      │ │ │                                │   │ │ │ │
│ │ │ (scrollable y)       │ │ │ (grid auto-fill, scrollable)   │   │ │ │ │
│ │ │                      │ │ └────────────────────────────────┘   │ │ │ │
│ │ │                      │ └──────────────────────────────────────┘ │ │ │
│ │ └──────────────────────┴──────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Hiérarchie des Composants

### 1. PipelineDragDropView (Composant Core)
**Responsabilité:** Layout, drag & drop, état global  
**Props:**
- `type`: 'culture' | 'curing' | 'separation' | 'extraction'
- `sidebarContent`: Array des sections hiérarchisées
- `timelineConfig`: Configuration de la trame
- `timelineData`: Données des cellules
- `onConfigChange`: Callback modification config
- `onDataChange`: Callback modification données

**Structure interne:**
```jsx
<div className="liquid-wrapper"> {/* Container global */}
  <div className="flex flex-row gap-4"> {/* Layout horizontal */}
    <SidebarLeft /> {/* Panneau gauche fixe */}
    <TimelineRight /> {/* Container droite flexible */}
  </div>
</div>
```

### 2. Wrappers Spécifiques par Type

#### CulturePipelineDragDrop
- Configure `sidebarContent` avec 84+ champs culture
- Configure `phases` avec 12 phases de croissance
- Gère l'état spécifique culture

#### CuringPipelineDragDrop  
- Configure `sidebarContent` avec champs curing
- Configure `phases` avec 4 phases (séchage → affinage)
- Gère l'état spécifique curing

#### SeparationPipelineDragDrop (À créer)
- Configure `sidebarContent` avec champs séparation
- Méthodes: tamisage, eau/glace, dry-sift, etc.
- Gère l'état spécifique séparation

#### ExtractionPipelineDragDrop (À créer)
- Configure `sidebarContent` avec champs extraction
- Méthodes: BHO, Rosin, CO2, etc.
- Gère l'état spécifique extraction

### 3. Sections de Page

#### CulturePipelineSection
```jsx
<CulturePipelineDragDrop
  timelineConfig={data.cultureTimelineConfig}
  timelineData={data.cultureTimelineData}
  onConfigChange={handleConfigChange}
  onDataChange={handleDataChange}
/>
```

#### CuringPipelineSection
```jsx
<CuringPipelineDragDrop
  timelineConfig={data.curingTimelineConfig}
  timelineData={data.curingTimelineData}
  onConfigChange={handleConfigChange}
  onDataChange={handleDataChange}
/>
```

---

## 🎨 Styling Unifié

### Container Global (Liquid Wrapper)
```css
.pipeline-liquid-wrapper {
  @apply bg-white/80 dark:bg-gray-900/80;
  @apply backdrop-blur-xl rounded-2xl shadow-xl;
  @apply border border-gray-200/50 dark:border-gray-700/50;
  @apply p-4;
  @apply min-h-[600px] max-h-[800px];
}
```

### Sidebar Gauche
```css
.pipeline-sidebar {
  @apply w-80 flex-shrink-0;
  @apply overflow-y-auto;
  @apply bg-white/50 dark:bg-gray-800/50;
  @apply rounded-xl border border-gray-200 dark:border-gray-700;
  @apply p-3;
}
```

### Timeline Container Droite
```css
.pipeline-timeline {
  @apply flex-1 flex flex-col;
  @apply overflow-hidden;
  @apply bg-white/50 dark:bg-gray-800/50;
  @apply rounded-xl border border-gray-200 dark:border-gray-700;
}
```

### Configuration Header
```css
.pipeline-config {
  @apply p-4 border-b border-gray-200 dark:border-gray-700;
  @apply bg-gradient-to-b from-white/80 to-transparent;
  @apply dark:from-gray-900/80;
  @apply flex-shrink-0;
}
```

### Grid Cellules
```css
.pipeline-grid {
  @apply flex-1 overflow-auto p-4;
  @apply grid gap-2;
  @apply auto-rows-min;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
}
```

---

## 📊 Types de Pipelines

### 1. Culture (Fleurs)
**Phases:** 12 phases (Graine → Récolte)  
**Intervalles:** Phases, Jours, Semaines  
**Champs:** 84+ (environnement, substrat, engrais, lumière, etc.)  
**Fichiers:**
- `CulturePipelineDragDrop.jsx` (wrapper)
- `cultureSidebarContent.js` (config)
- `pipelinePhases.js` (phases)

### 2. Curing (Fleurs, Hash, Concentré)
**Phases:** 4 phases (Séchage → Affinage)  
**Intervalles:** Phases, Jours, Semaines  
**Champs:** Température, humidité, container, emballage, observations  
**Fichiers:**
- `CuringPipelineDragDrop.jsx` (wrapper) - À créer
- `curingSidebarContent.js` (config) - À créer

### 3. Séparation (Hash)
**Phases:** Custom selon méthode  
**Intervalles:** Secondes, Minutes, Heures  
**Champs:** Méthode, température, passes, mailles, rendement  
**Fichiers:**
- `SeparationPipelineDragDrop.jsx` (wrapper) - À créer
- `separationSidebarContent.js` (config) - À créer

### 4. Extraction (Concentrés)
**Phases:** Custom selon méthode  
**Intervalles:** Secondes, Minutes, Heures  
**Champs:** Méthode extraction, solvant, purification, rendement  
**Fichiers:**
- `ExtractionPipelineDragDrop.jsx` (wrapper) - À créer
- `extractionSidebarContent.js` (config) - À créer

---

## 🔄 Responsive Behavior

### Desktop (>768px)
- Sidebar gauche visible (w-80)
- Layout flex-row
- Grille cellules: 10+ colonnes

### Tablet (768px - 1024px)
- Sidebar collapsible
- Layout flex-row
- Grille cellules: 6-8 colonnes

### Mobile (<768px)
- Sidebar en modal/drawer
- Layout flex-col
- Grille cellules: 4 colonnes
- Configuration compacte

---

## 📝 Checklist Implementation

- [ ] Restructurer PipelineDragDropView avec layout flex-row
- [ ] Déplacer sidebar dans container gauche fixe
- [ ] Créer container droite avec config + grid
- [ ] Tester Culture Pipeline
- [ ] Tester Curing Pipeline
- [ ] Créer SeparationPipelineDragDrop wrapper
- [ ] Créer ExtractionPipelineDragDrop wrapper
- [ ] Créer configs sidebar pour chaque type
- [ ] Tester drag & drop sur tous les types
- [ ] Vérifier responsive sur mobile/tablet
- [ ] Documenter l'API de chaque wrapper

---

## 🎯 Prochaines Étapes

1. ✅ Créer schéma architecture
2. ⏳ Modifier PipelineDragDropView
3. ⏳ Créer CuringPipelineDragDrop
4. ⏳ Créer SeparationPipelineDragDrop
5. ⏳ Créer ExtractionPipelineDragDrop
6. ⏳ Tester end-to-end
