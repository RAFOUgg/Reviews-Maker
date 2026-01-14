# Architecture Pipeline Unifiée - Reviews-Maker

## Vue d'ensemble

Le système de pipeline est maintenant **UNIFIÉ et GÉNÉRALISÉ** selon le pattern suivant :

```
Section Wrapper → Legacy Wrapper → PipelineDragDropView (composant unifié)
```

## Architecture en 3 couches

### Couche 1 : Section Wrappers (Pages)
**Emplacement** : `client/src/pages/review/Create{Product}Review/sections/` ou `client/src/components/sections/`

**Rôle** : 
- Adapter les données entre le formulaire parent et le pipeline
- Gérer les refs pour éviter les problèmes de batching React
- **NE JAMAIS** ajouter de wrapper visuel (LiquidCard, div, etc.)
- Rendre DIRECTEMENT le wrapper legacy

**Exemples** :
- `CulturePipelineSection.jsx` → rend `<CulturePipelineDragDrop />`
- `CuringMaturationSection.jsx` → rend `<CuringPipelineDragDrop />`
- `SeparationPipelineSection.jsx` → devrait rendre `<SeparationPipelineDragDrop />`

**Pattern** :
```jsx
const SomeSection = ({ data, onChange }) => {
    const timelineDataRef = useRef(data.someTimeline || []);
    
    useEffect(() => {
        timelineDataRef.current = data.someTimeline || [];
    }, [data.someTimeline]);

    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.someConfig || {}), [key]: value };
        onChange({ ...data, someConfig: updatedConfig });
    };

    const handleDataChange = (timestamp, field, value) => {
        // Logique de suppression/mise à jour avec ref
        // ...
    };

    return (
        <SomePipelineDragDrop
            timelineConfig={data.someConfig || {}}
            timelineData={data.someTimeline || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
        />
    );
};
```

### Couche 2 : Legacy Wrappers
**Emplacement** : `client/src/components/pipelines/legacy/`

**Rôle** :
- Configurer `PipelineDragDropView` avec les données spécifiques au type
- Convertir les config objects en arrays pour sidebar
- Définir les phases ou intervalles selon le type
- Ajouter features spécifiques (graphiques, export GIF, etc.)

**Exemples** :
- `CulturePipelineDragDrop.jsx` → configure 84 champs + 12 phases
- `CuringPipelineDragDrop.jsx` → configure curing + graphique évolution
- _(à créer)_ `SeparationPipelineDragDrop.jsx` → configure séparation hash
- _(à créer)_ `ExtractionPipelineDragDrop.jsx` → configure extraction concentrés

**Pattern** :
```jsx
const SomePipelineDragDrop = ({ timelineConfig, timelineData, onConfigChange, onDataChange }) => {
    const sidebarArray = useMemo(() => {
        return Object.entries(SOME_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            items: section.items || []
        }));
    }, []);

    const configWithPhases = useMemo(() => {
        if (timelineConfig.type === 'phase') {
            return { ...timelineConfig, phases: SOME_PHASES };
        }
        return timelineConfig;
    }, [timelineConfig]);

    return (
        <PipelineDragDropView
            type="some-type"
            sidebarContent={sidebarArray}
            timelineConfig={configWithPhases}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
        />
    );
};
```

### Couche 3 : PipelineDragDropView (Composant Unifié)
**Emplacement** : `client/src/components/pipelines/views/PipelineDragDropView.jsx`

**Rôle** : 
- Rendu unifié de TOUTES les pipelines
- Layout horizontal : **Sidebar gauche** + **Timeline droite**
- Wrapper liquid : `bg-white/80 backdrop-blur-xl rounded-2xl`
- Gestion drag & drop, modals, sélection, historique

**Structure JSX** :
```jsx
return (
    <div className="bg-white/80 ...liquid wrapper...">
        <div className="flex flex-row gap-4 h-full">
            {/* Sidebar gauche (masquée mobile) */}
            {!isMobile && (
                <div className="w-80 flex-shrink-0 ...">
                    {/* Sections draggables */}
                </div>
            )}

            {/* Timeline droite */}
            <div className="flex-1 ...">
                {/* Header configuration */}
                {/* Grille de cellules */}
            </div>
        </div>

        {/* Modals (dans liquid wrapper, hors flex-row) */}
        <GroupedPresetModal ... />
        <SavePipelineModal ... />
        {/* etc */}
    </div>
);
```

## Règles strictes

### ✅ À FAIRE
1. **Uniformité visuelle** : Toutes les pipelines DOIVENT utiliser le même layout (sidebar + timeline)
2. **Pas de wrapper** : Les sections NE DOIVENT PAS ajouter de `<LiquidCard>`, `<div>`, ou autre wrapper
3. **Données via config** : Les différences entre pipelines sont dans `sidebarContent`, `phases`, et `type`
4. **Responsive** : Sidebar masquée sur mobile automatiquement via `{!isMobile && (...)}`

### ❌ À ÉVITER
1. **Dupliquer le layout** : Ne jamais créer un nouveau composant qui refait la structure sidebar+timeline
2. **Wrappers visuels** : Pas de LiquidCard autour de CulturePipelineDragDrop ou CuringPipelineDragDrop
3. **Logique dans sections** : Les sections sont des **adaptateurs de données**, pas des UI complexes
4. **Styles inline différents** : Utiliser les classes uniformes de PipelineDragDropView

## Problèmes identifiés et résolus

### Problème 1 : Fonds colorés différents ✅
**Cause** : `CuringMaturationSection` enveloppait `CuringPipelineDragDrop` dans `<LiquidCard className="p-6">`  
**Solution** : Supprimé tous les LiquidCard wrappers des sections

### Problème 2 : Cellules décalées ⚠️ EN COURS
**Cause probable** : Padding du LiquidCard (`p-6` = 24px) qui décale tout le contenu  
**Solution** : Après suppression des wrappers, à tester visuellement

### Problème 3 : Séparation Hash pas uniforme ⚠️ À VÉRIFIER
**Cause** : `SeparationPipelineSection` utilise LiquidCard + config custom au lieu de wrapper legacy  
**Solution** : Créer `SeparationPipelineDragDrop.jsx` et refactoriser la section

## Prochaines étapes

1. **Tester visuellement** les 3 pipelines (Culture/Curing/Separation)
2. **Vérifier** que les cellules sont à leur place (pas de décalage)
3. **Créer** `SeparationPipelineDragDrop.jsx` si nécessaire
4. **Créer** `ExtractionPipelineDragDrop.jsx` pour les concentrés
5. **Documenter** les différences de config entre chaque type

## Résumé

Le système est maintenant architecturé pour être **GÉNÉRALISÉ** :
- **1 seul composant visuel** (PipelineDragDropView)
- **N wrappers legacy** (un par type de produit/pipeline)
- **N sections** (adaptateurs de données entre formulaires et wrappers)

Les différences entre pipelines sont dans les **DONNÉES** (sidebar, phases, config), pas dans le **RENDU** (layout, styles, structure).
