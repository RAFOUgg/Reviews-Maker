# Guide d'adaptation mobile - Reviews-Maker

## 🎯 Vue d'ensemble

Cette guide explique comment adapter **toutes les sections** des formulaires au format mobile avec les nouveaux composants.

### Principes clés:
1. **Sections collapsibles** - Réduire le scroll sur mobile
2. **Grilles adaptatives** - 1 col mobile, 2-3 desktop
3. **Pipelines simplifiés** - Pas de drag & drop, clics directs sur cellules
4. **Dimensionnement réduit** - Padding/gap serrés sur petit écran
5. **Préréglages visibles** - Bouton "Groupe de préréglages" toujours accessible

---

## 📦 Composants disponibles

### 1. **useMobileFormSection** (Hook)
```jsx
const { isMobile, isTablet, isDesktop, containerClasses, gridClasses, spacing, inputClasses, buttonClasses } = useMobileFormSection('section-name');
```

Fournit:
- `isMobile`, `isTablet`, `isDesktop` - Breakpoints
- `containerClasses` - Wrapper, header, title, content
- `gridClasses` - Grilles (auto, auto2, full, double, triple)
- `spacing` - padding, gap, mb
- `inputClasses` - Base, small
- `buttonClasses` - sm, md, lg

### 2. **ResponsiveSectionComponents**
```jsx
import {
    ResponsiveSection,      // Conteneur avec header collapsible
    ResponsiveGrid,         // Grid adaptatif
    ResponsiveFormField,    // Champ form avec label/hint/error
    ResponsiveInput,        // Input adaptatif
    ResponsiveSelect,       // Select adaptatif
    ResponsiveButton,       // Button adaptatif
    ResponsiveCard,         // Card simple
    ResponsiveSlider,       // Slider avec label/valeur
} from '@/components/ui/ResponsiveSectionComponents';
```

### 3. **MobileReviewLayout**
```jsx
import {
    MobileReviewLayout,      // Wrapper page entière
    MobileSectionContainer,  // Container section
    MobileFormRow,           // Ligne responsive
    CollapsibleMobileSection, // Section collapsible optimisée
    MobileFormGroup,         // Groupe de champs
    MobileActionBar,         // Barre action sticky bottom
} from '@/components/layout/MobileReviewLayout';
```

### 4. **MobilePipelineOptimized**
Pipeline sans sidebar, avec cellules cliquables et modal éditeur.

### 5. **MobilePipelineCellEditor**
Modal pour éditer cellule avec:
- Affichage des données actuelles
- Catégories rapides d'ajout
- Édition progressif de champs

---

## 🚀 Patterns d'adaptation

### Pattern 1: Section simple collapsible

**AVANT (Desktop):**
```jsx
<div className="p-6 bg-slate-900/60 rounded-xl">
    <h3 className="text-xl font-semibold mb-4">Titre</h3>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contenu */}
    </div>
</div>
```

**APRÈS (Mobile responsive):**
```jsx
import { ResponsiveSection, ResponsiveGrid, ResponsiveFormField } from '@/components/ui/ResponsiveSectionComponents';

<ResponsiveSection title="Titre" icon="📋">
    <ResponsiveGrid columns="auto2">
        <ResponsiveFormField label="Label 1">
            <ResponsiveInput placeholder="..." />
        </ResponsiveFormField>
        {/* Autres champs */}
    </ResponsiveGrid>
</ResponsiveSection>
```

### Pattern 2: Sliders et ratings

**AVANT:**
```jsx
<div className="flex items-center gap-4">
    <input type="range" min="0" max="10" />
    <span>{value}/10</span>
</div>
```

**APRÈS:**
```jsx
import { ResponsiveSlider } from '@/components/ui/ResponsiveSectionComponents';

<ResponsiveSlider
    value={value}
    onChange={setValue}
    min={0}
    max={10}
    label="Densité visuelle"
    showValue={true}
    unit="/10"
/>
```

### Pattern 3: Multi-select/Pills

**AVANT:**
```jsx
<div className="grid grid-cols-3 gap-3">
    {options.map(opt => (
        <button key={opt} onClick={() => toggle(opt)}>
            {selected.includes(opt) && '✓'} {opt}
        </button>
    ))}
</div>
```

**APRÈS:**
```jsx
import { ResponsiveGrid } from '@/components/ui/ResponsiveSectionComponents';
const { gridClasses } = useMobileFormSection('pills');

<div className={`grid ${gridClasses.double}`}>
    {options.map(opt => (
        <button key={opt} /* ... */>
            {selected.includes(opt) && '✓'} {opt}
        </button>
    ))}
</div>
```

### Pattern 4: Pipeline sur mobile

**AVANT:** PipelineWithSidebar (complexe, drag & drop)

**APRÈS:**
```jsx
import MobilePipelineOptimized from '@/components/pipeline/MobilePipelineOptimized';
import MobilePipelineCellEditor from '@/components/pipeline/MobilePipelineCellEditor';

<MobilePipelineOptimized
    cells={cells}
    config={config}
    cellIndices={cellIndices}
    onCellChange={handleCellChange}
    onPresetsClick={handlePresetsClick}
    type="culture"
/>

<MobilePipelineCellEditor
    isOpen={editorOpen}
    onClose={closeEditor}
    cellIndex={selectedCell}
    cellLabel={getCellLabel(selectedCell)}
    cellData={cells[selectedCell]}
    onSave={saveCellData}
    onDelete={deleteCellData}
    type="culture"
/>
```

---

## 🎨 Styling responsive

### Breakpoints:
```
Mobile:   < 640px   (xs, sm)
Tablet:   640-1024px (md, lg)
Desktop:  ≥ 1024px (xl, 2xl)
```

### Exemples Tailwind:
```jsx
// Font size
<h1 className="text-lg md:text-2xl lg:text-3xl">Titre</h1>

// Padding
<div className="p-3 md:p-4 lg:p-6">Contenu</div>

// Grid columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">

// Max height
<div className="max-h-[85vh] overflow-y-auto scrollbar-thin">
```

---

## 📝 Exemple complet: Section Infos Générales

```jsx
import React, { useState } from 'react';
import { MobileReviewLayout, CollapsibleMobileSection, MobileFormRow } from '@/components/layout/MobileReviewLayout';
import { ResponsiveFormField, ResponsiveInput, ResponsiveButton, ResponsiveGrid } from '@/components/ui/ResponsiveSectionComponents';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const InfosGeneralesSection = ({ data, onChange }) => {
    const { isMobile } = useResponsiveLayout();

    return (
        <CollapsibleMobileSection
            title="Informations générales"
            icon="📋"
            defaultOpen={true}
        >
            <ResponsiveGrid columns="auto2">
                <ResponsiveFormField
                    label="Nom commercial"
                    required
                    hint="Ex: Marque – Cultivar – Batch #"
                >
                    <ResponsiveInput
                        value={data.name || ''}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="Ex: OG Kush - Pheno A"
                    />
                </ResponsiveFormField>

                <ResponsiveFormField
                    label="Cultivar(s)"
                    hint="Sélectionner depuis bibliothèque"
                >
                    <ResponsiveInput
                        value={data.cultivars?.join(', ') || ''}
                        placeholder="Ajouter cultivar..."
                    />
                </ResponsiveFormField>

                <ResponsiveFormField label="Farm">
                    <ResponsiveInput
                        value={data.farm || ''}
                        onChange={(e) => onChange('farm', e.target.value)}
                        placeholder="Farm name"
                    />
                </ResponsiveFormField>
            </ResponsiveGrid>

            {/* Photos */}
            <ResponsiveFormField label="Photos" hint="Max 4 photos">
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-2`}>
                    {/* Photo components */}
                </div>
            </ResponsiveFormField>
        </CollapsibleMobileSection>
    );
};

export default InfosGeneralesSection;
```

---

## ✅ Checklist d'adaptation pour chaque section

Pour chaque section (Infos générales, Visuel & Technique, Odeurs, Goûts, Effets, Pipelines, etc.):

- [ ] **Enveloppe** - Utiliser `CollapsibleMobileSection`
- [ ] **Grille** - Remplacer `grid grid-cols-X` par `ResponsiveGrid columns="auto2"`
- [ ] **Champs** - Envelopper dans `ResponsiveFormField`
- [ ] **Inputs** - Utiliser `ResponsiveInput` ou `ResponsiveSelect`
- [ ] **Buttons** - Utiliser `ResponsiveButton`
- [ ] **Sliders** - Utiliser `ResponsiveSlider`
- [ ] **Espacements** - Utiliser `spacing` du hook
- [ ] **Pipelines** - Remplacer par `MobilePipelineOptimized`
- [ ] **Action bar** - Envelopper dans `MobileActionBar` avec `sticky={true}`
- [ ] **Test mobile** - Ctrl+Shift+I et tester < 640px

---

## 🔧 Integration checklist

1. **Importer les hooks et composants** 
2. **Adapter le layout global** - Utiliser `MobileReviewLayout`
3. **Adapter chaque section** - Utiliser les patterns ci-dessus
4. **Pipelines** - Remplacer par version mobile optimisée
5. **Tester responsive** - Mobile (< 640px), Tablet (640-1024px), Desktop (> 1024px)
6. **Optimiser scroll** - Sections collapsibles, max-height sur containers
7. **Déployer et valider** - Sur vrai téléphone

---

## 📱 Points clés pour le mobile

✅ **Faire** 
- Sections collapsibles
- Grilles à 1 colonne
- Padding/gap réduits (p-3 gap-2)
- Boutons grands (px-3 py-2)
- Font-size adapté (text-xs, text-sm)
- Sticky header et action bar
- Click sur cellules pipeline (pas drag & drop)

❌ **Éviter**
- Grilles > 2 colonnes sur mobile
- Padding excessif (< p-3)
- Petits boutons (< py-2)
- Drag & drop sur mobile
- Modals complexes
- Texte long non-truncated
- Sidebars côtés (trop narrow)

