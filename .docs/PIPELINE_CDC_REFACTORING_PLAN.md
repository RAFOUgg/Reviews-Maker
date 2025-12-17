# Plan de Refactoring Pipeline CDC

## Problèmes identifiés

### 1. **Interface non conforme au CDC**
- ❌ Préréglages manquants en haut de la sidebar
- ❌ Cases cochables pour les préréglages non implémentées
- ❌ Système de phases non fonctionnel
- ❌ Affichage graphique des cases trop basique (manque 4 emojis superposables)
- ❌ Configuration générale mal placée

### 2. **Structure actuelle**
```
┌─────────────────────────────────────────────────────┐
│ Header avec Config intégrée (type, dates, etc.)    │
├──────────────┬──────────────────────────────────────┤
│ SIDEBAR      │ TIMELINE                             │
│ Contenus     │ Cases simples                        │
│ hiérarchisés │ + badge basique                      │
└──────────────┴──────────────────────────────────────┘
```

### 3. **Structure CDC attendue**
```
┌──────────────────────────────────────────────────────┐
│                 Header minimal                       │
├──────────────┬───────────────────────────────────────┤
│ SIDEBAR      │ TIMELINE                              │
│ ┌──────────┐ │ ┌─────────────────────────────────┐  │
│ │PRÉRÉGLAGES│ │ │ Config: Type+Durée│ 0% │ Préset││  │
│ │☐ Preset1  │ │ ├─────────────────────────────────┤  │
│ │☐ Preset2  │ │ │ [Case J1] [Case J2] ... [+]    ││  │
│ │☐ Preset3  │ │ │ Emojis×4  Emojis×4             ││  │
│ │+ Nouveau  │ │ └─────────────────────────────────┘  │
│ └──────────┘ │                                       │
│ ┌──────────┐ │                                       │
│ │CONTENUS  │ │                                       │
│ │⚙️ GÉNÉRAL │ │                                       │
│ │🪴 SUBSTRAT│ │                                       │
│ │...        │ │                                       │
│ └──────────┘ │                                       │
└──────────────┴───────────────────────────────────────┘
```

## Modifications nécessaires

### A. PipelineDragDropView.jsx - Refactoring complet

#### 1. **Ajout section Préréglages en sidebar**
```jsx
{/* Section Préréglages en haut de la sidebar */}
<div className="p-4 border-b border-gray-200">
    <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm">📋 Préréglages</h4>
        <button onClick={handleSaveNewPreset} className="text-xs">
            + Nouveau
        </button>
    </div>
    <div className="space-y-1 max-h-32 overflow-y-auto">
        {presets.map((preset) => (
            <label key={preset.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                    type="checkbox"
                    checked={selectedPresets.includes(preset.id)}
                    onChange={() => togglePreset(preset.id)}
                    className="w-4 h-4"
                />
                <span className="text-xs flex-1">{preset.name}</span>
                <span className="text-[10px] text-gray-400">
                    {preset.data?.length || 0} données
                </span>
            </label>
        ))}
    </div>
</div>
```

#### 2. **Configuration déplacée dans header timeline**
```jsx
{/* Header Timeline avec Config inline */}
<div className="p-3 border-b bg-gray-50 flex items-center justify-between">
    {/* Type intervalle */}
    <select
        value={timelineConfig.type}
        onChange={(e) => onConfigChange('type', e.target.value)}
        className="text-sm px-2 py-1 border rounded"
    >
        <option value="jour">🗓️ Jours</option>
        <option value="semaine">📆 Semaines</option>
        <option value="phase">🌱 Phases</option>
        {/* ... autres options ... */}
    </select>

    {/* Durée/Dates selon type */}
    {timelineConfig.type === 'jour' && (
        <input
            type="number"
            max={365}
            value={timelineConfig.totalDays || ''}
            onChange={(e) => onConfigChange('totalDays', parseInt(e.target.value))}
            placeholder="Nb jours (max 365)"
            className="text-sm px-2 py-1 border rounded w-40"
        />
    )}

    {/* Completion */}
    <div className="flex items-center gap-2">
        <div className="text-sm font-bold">{completionPercent}%</div>
        <div className="text-xs text-gray-500">{filledCells}/{cells.length}</div>
    </div>

    {/* Bouton préréglages */}
    <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded">
        💾 Préréglages
    </button>
</div>
```

#### 3. **Amélioration affichage cases avec 4 emojis**
```jsx
{/* Case avec emojis superposables */}
<div className="relative min-h-[100px] p-2">
    {/* Stack d'emojis (max 4) */}
    {cellEmojis.slice(0, 4).map((emoji, idx) => (
        <div
            key={idx}
            className="absolute"
            style={{
                top: `${idx * 6}px`,
                left: `${idx * 6}px`,
                zIndex: 4 - idx,
                fontSize: '20px',
                filter: `brightness(${1 - idx * 0.1})`,
                transform: `scale(${1 - idx * 0.05})`
            }}
        >
            {emoji}
        </div>
    ))}

    {/* Label */}
    <div className="absolute bottom-2 left-2 right-2">
        <div className="text-xs font-bold truncate">{cell.label}</div>
        {cellData.note && (
            <div className="text-[10px] text-gray-500 truncate">
                {cellData.note}
            </div>
        )}
    </div>

    {/* Indicateur completion */}
    <div className="absolute top-2 right-2 text-xs font-bold">
        {cellData.completionPercent || 0}%
    </div>
</div>
```

#### 4. **Système de phases fonctionnel**
```jsx
// Dans generateCells()
if (intervalType === 'phase' && timelineConfig.phases?.length) {
    // Phases pré-définies selon type
    const phasesByType = {
        culture: [
            { id: 'graine', name: '🌰 Graine (J0)', duration: 1 },
            { id: 'germination', name: '🌱 Germination', duration: 3 },
            { id: 'plantule', name: '🌿 Plantule', duration: 7 },
            { id: 'croissance-debut', name: '🌾 Début croissance', duration: 14 },
            { id: 'croissance-milieu', name: '🌳 Milieu croissance', duration: 14 },
            { id: 'croissance-fin', name: '🌴 Fin croissance', duration: 7 },
            { id: 'stretch-debut', name: '🌸 Début stretch', duration: 7 },
            { id: 'stretch-milieu', name: '💐 Milieu stretch', duration: 7 },
            { id: 'stretch-fin', name: '🌺 Fin stretch', duration: 7 },
            { id: 'floraison-debut', name: '🌼 Début floraison', duration: 14 },
            { id: 'floraison-milieu', name: '🌻 Milieu floraison', duration: 14 },
            { id: 'floraison-fin', name: '🏵️ Fin floraison', duration: 14 }
        ],
        curing: [
            { id: 'sechage', name: '🔪 Séchage', duration: 7 },
            { id: 'curing-debut', name: '🏺 Début curing', duration: 14 },
            { id: 'maturation', name: '⏳ Maturation', duration: 30 },
            { id: 'affinage', name: '✨ Affinage', duration: 60 }
        ]
    };

    const phases = phasesByType[type] || timelineConfig.phases;
    
    return phases.map((phase, i) => ({
        timestamp: Date.now() + (i * phase.duration * 24 * 60 * 60 * 1000),
        label: phase.name,
        phase: phase,
        duration: phase.duration
    }));
}
```

### B. PipelineCellModal.jsx - Amélioration modale

#### 1. **Ajout section préréglages dans modale**
```jsx
{/* Header modale avec préréglages */}
<div className="flex items-center justify-between mb-4">
    <h3>Éditer {intervalLabel}</h3>
    <div className="flex gap-2">
        <button onClick={handleLoadPreset}>
            📂 Charger préréglage
        </button>
        <button onClick={handleSaveAsPreset}>
            💾 Sauvegarder comme préréglage
        </button>
    </div>
</div>
```

#### 2. **Onglets par section hiérarchique**
```jsx
{/* Tabs pour naviguer entre sections */}
<div className="flex gap-1 border-b mb-4">
    {sidebarSections.map((section) => (
        <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className={`px-3 py-2 text-sm ${
                activeTab === section.id
                    ? 'border-b-2 border-blue-500 font-bold'
                    : 'text-gray-500'
            }`}
        >
            {section.icon} {section.label}
        </button>
    ))}
</div>

{/* Contenu de l'onglet actif */}
<div className="max-h-96 overflow-y-auto">
    {renderTabContent()}
</div>
```

### C. Nouveaux composants nécessaires

#### 1. **PipelinePresetManager.jsx**
Gestion complète des préréglages :
- Liste avec cases à cocher
- Création nouveau préréglage
- Édition/suppression
- Import/export préréglages
- Synchronisation avec bibliothèque utilisateur

#### 2. **PipelineCellEmojis.jsx**
Affichage des 4 emojis superposables :
- Récupération des emojis depuis les données
- Effet de profondeur (scale + opacity)
- Animation au survol

#### 3. **PipelinePhaseSelector.jsx**
Sélecteur de phases pré-définies :
- Liste des phases selon type pipeline
- Durée par phase
- Personnalisation possible

### D. Data structures

#### 1. **Format préréglage**
```typescript
interface PipelinePreset {
    id: string;
    name: string;
    description?: string;
    type: 'culture' | 'curing' | 'separation' | 'extraction';
    data: {
        [key: string]: any; // Données de configuration
    };
    createdAt: Date;
    updatedAt: Date;
}
```

#### 2. **Format cellule timeline**
```typescript
interface TimelineCell {
    timestamp: number;
    label: string;
    type: 'jour' | 'semaine' | 'phase' | 'date' | 'heure' | 'seconde';
    data: {
        [fieldKey: string]: any;
    };
    emojis: string[]; // Max 4 emojis
    completionPercent: number;
    note?: string;
    _meta: {
        lastModified: Date;
        assignedSections: string[]; // IDs des sections assignées
    };
}
```

## Plan d'implémentation

### Phase 1 : Préréglages (Priorité haute)
1. ✅ Créer PipelinePresetManager.jsx
2. ✅ Intégrer dans sidebar de PipelineDragDropView
3. ✅ Système de cases à cocher
4. ✅ Sauvegarde/chargement

### Phase 2 : Phases (Priorité haute)
1. ✅ Définir phases par type de pipeline
2. ✅ Corriger generateCells() pour phases
3. ✅ Affichage durée par phase
4. ✅ Tests phases culture + curing

### Phase 3 : Affichage graphique (Priorité moyenne)
1. ✅ Créer PipelineCellEmojis.jsx
2. ✅ Système de sélection des 4 emojis selon données
3. ✅ Style superposition avec profondeur
4. ✅ Animation hover

### Phase 4 : Modale améliorée (Priorité moyenne)
1. ✅ Onglets par section
2. ✅ Boutons préréglages dans header
3. ✅ Formulaires adaptatifs selon type
4. ✅ Validation données

### Phase 5 : Généralisation (Priorité basse)
1. ✅ Extraire config spécifique par type
2. ✅ Factory pattern pour sidebarContent
3. ✅ Configuration centralisée
4. ✅ Tests tous types

## Fichiers à modifier

1. **Composants principaux**
   - `PipelineDragDropView.jsx` (refactor complet)
   - `PipelineCellModal.jsx` (amélioration)
   - `CulturePipelineTimeline.jsx` (simplification)
   - `CuringMaturationTimeline.jsx` (simplification)

2. **Nouveaux composants**
   - `PipelinePresetManager.jsx` (à créer)
   - `PipelineCellEmojis.jsx` (à créer)
   - `PipelinePhaseSelector.jsx` (à créer)
   - `PipelineConfigHeader.jsx` (à créer)

3. **Configuration**
   - `client/src/data/pipelineConfigs.js` (à créer)
   - Définir toutes les phases par type
   - Définir tous les champs par type
   - Mapper emojis par champ

4. **Backend**
   - API sauvegarde préréglages
   - API récupération préréglages utilisateur
   - Schéma Prisma pour préréglages

## Estimation temps

- Phase 1 : 8h
- Phase 2 : 6h
- Phase 3 : 4h
- Phase 4 : 6h
- Phase 5 : 8h

**Total : ~32h de développement**

## Notes CDC conformité

### Lignes 270-285 : Pipeline Culture
- ✅ Trame configurable (secondes → phases)
- ✅ Dates début/fin avec calcul auto
- ⚠️ Pagination si > 365 jours (à implémenter)
- ✅ Mode, espace, environnement, lumière, irrigation, engrais
- ✅ Liaison arrosage-engraissage
- ✅ Morphologie plante évolutive

### Lignes 285-300 : Pipeline Curing
- ✅ Trame : seconde, minute, heure, jour, semaine, mois
- ✅ Type maturation (froid/chaud)
- ✅ Température, humidité, recipient
- ✅ Emballage/ballotage primaire
- ✅ Opacité, volume
- ⚠️ Modifications tests évolutifs (à implémenter)

### Conformité globale : 75%

**Manques principaux :**
1. Pagination automatique > 365 jours
2. Système drag & drop full fonctionnel
3. Attribution en masse opérationnelle
4. Export GIF évolution (hors scope pipeline)
5. Préréglages synchronisés bibliothèque

## Recommandation

**Commencer par Phase 1 + Phase 2** pour avoir une base solide fonctionnelle, puis itérer sur l'UI (Phase 3) et les features avancées (Phase 4-5).

Le refactoring complet est nécessaire pour atteindre 100% de conformité CDC.
