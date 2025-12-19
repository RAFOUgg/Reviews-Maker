# RAPPORT NON-CONFORMITÉ CDC - SYSTÈME PIPELINES
**Date**: 19 décembre 2025  
**Contexte**: Les pipelines Culture et Curing ne respectent pas les exigences du CDC

---

## 📋 RÉSUMÉ EXÉCUTIF

### Conformité globale pipelines: ⚠️ 42%

| Composant | Conformité | Statut |
|-----------|------------|---------|
| **Configuration Timeline** | 60% | ⚠️ Partiel |
| **Drag & Drop System** | 30% | ❌ Incomplet |
| **Préréglages Globaux** | 20% | ❌ Non fonctionnel |
| **Cases Timeline CDC** | 40% | ❌ Design non-conforme |
| **Modales de données** | 50% | ⚠️ Manque fonctionnalités |
| **Panneau latéral** | 70% | ⚠️ Structure OK mais incomplet |
| **Gradients intensité cases** | 30% | ⚠️ Basique |
| **Attribution en masse** | 80% | ⚠️ Presque conforme |
| **Clic droit pré-config** | 0% | ❌ Non implémenté |

---

## 🔍 ANALYSE DÉTAILLÉE DES ÉCARTS

### 1. CONFIGURATION TIMELINE - ⚠️ 60%

#### ✅ CE QUI FONCTIONNE:
- Segmented control type d'intervalle présent
- Support des modes: heures, jours, semaines, phases, dates
- Validation des limites (365 jours max, etc.)
- Pourcentage de complétion affiché

#### ❌ ÉCARTS CDC:

**1.1 Type "SECONDES" et "MOIS" manquants**
```
CDC EXIGE: Secondes / Minutes / Heures / Jours / Semaines / Mois / Phases / Dates
ACTUEL: Heures / Jours / Semaines / Phases / Dates
MANQUE: Secondes, Mois
```

**1.2 Secondes - Limite et stepper non-conformes**
```
CDC: "stepper (24, 48, 72, 96, 168, 336 h)"
CDC: "Maximum 900 secondes (pagination automatique si dépassement)"
ACTUEL: Non implémenté
```

**1.3 Mois - Pas implémenté**
```
CDC: "Mois : slider 1–12"
ACTUEL: Type mois absent
```

**1.4 Dates - Pagination automatique > 365 jours manquante**
```
CDC: "date-pickers début/fin + calcul auto de jours, pagination si >365"
ACTUEL: Alerte warning mais pas de pagination automatique
```

**1.5 Presets durées manquants**
```
CDC Jours: "slider 1–120 jours + presets (60/70/90)"
ACTUEL: Slider simple sans presets
```

---

### 2. DRAG & DROP SYSTEM - ❌ 30%

#### ✅ CE QUI FONCTIONNE:
- Drag depuis panneau latéral vers timeline ✓
- Feedback visuel hover/drop ✓
- Structure hiérarchisée panneau latéral ✓

#### ❌ ÉCARTS CDC CRITIQUES:

**2.1 Comportement drop incomplet**
```
CDC: "Glisser les contenus depuis le panneau latéral vers les cases de la timeline"
CDC: "Drag & drop des paramètres depuis le panneau latéral"
```

**PROBLÈME ACTUEL:**
```jsx
// Dans PipelineDragDropView.jsx ligne 260-285
const handleDrop = (e, timestamp) => {
    e.preventDefault();
    setHoveredCell(null);
    
    if (!draggedContent) return;
    
    // ❌ OUVRE LA MODALE IMMÉDIATEMENT au lieu d'ajouter directement
    setDroppedItem(draggedContent);
    setCurrentCellTimestamp(timestamp);
    setIsModalOpen(true); // ← ERREUR CDC
    
    setDraggedContent(null);
};
```

**CE QUE LE CDC EXIGE:**
1. Drop direct → Ajouter le paramètre à la case avec valeur par défaut
2. Badge emoji immédiat dans la case
3. Clic sur case → ALORS ouvre modale pour éditer
4. **PAS** de modale au drop

**CORRECTION REQUISE:**
```jsx
const handleDrop = (e, timestamp) => {
    e.preventDefault();
    setHoveredCell(null);
    
    if (!draggedContent) return;
    
    // ✅ AJOUTER DIRECTEMENT avec valeur par défaut
    onDataChange(timestamp, draggedContent.key, draggedContent.defaultValue);
    
    // ✅ Feedback visuel succès
    showToast(`✓ ${draggedContent.label} ajouté`);
    
    setDraggedContent(null);
};
```

**2.2 Première case "Configuration générale" pas claire**
```
CDC: "💡 Première case : Configuration générale (mode, espace, etc.)"
CDC: "📊 Autres cases : Drag & drop des paramètres depuis le panneau latéral"

PROBLÈME: Col-span-2 + couleur différente OK, mais:
- Pas de distinction visuelle forte
- Contenus drag GENERAL vs ENVIRONNEMENT/SUBSTRAT/etc pas assez clair
```

---

### 3. PRÉRÉGLAGES GLOBAUX - ❌ 20%

#### ❌ PROBLÈMES MAJEURS:

**3.1 Système préréglages non-fonctionnel selon CDC**
```
CDC: [Préréglages 📋]
     ├─ Substrats courants  ☐ ☐ ☐ ☐ ☐ ☐ + 
     ├─ Engrais Phase 1 2 3 4 5
     ├─ Environnement
     └─ [Sauvegarder preset]

ACTUEL: 
- PresetSelector existe mais design différent
- Pas de catégories hiérarchiques (Substrats / Engrais / Environnement)
- Pas de numérotation Phase 1 2 3 4 5
- Pas de checkbox multiples ☐☐☐
```

**3.2 Interface préréglages non-conforme CDC**

**CDC EXIGE:**
```
Section "Préréglages" en haut du panneau latéral avec:
1. Checkboxes pour sélectionner plusieurs presets
2. Organisation par catégories (Substrats / Engrais / Environnement)
3. Bouton "+ Créer préréglage global"
4. Application des presets sélectionnés = drag sur timeline
```

**ACTUEL:**
```jsx
// PresetSelector.jsx - Non conforme
- Simple liste déroulante
- Pas de multi-sélection visuelle
- Pas de catégorisation
- Logique trop complexe
```

**3.3 Drag des préréglages vers cases manquant**
```
CDC: "Drag & drop des préréglages vers les cases"
ACTUEL: Bouton "Appliquer" en mode masse uniquement
```

---

### 4. CASES TIMELINE CDC - ❌ 40%

#### ❌ DESIGN NON-CONFORME:

**4.1 Emojis superposés manquants**
```
CDC VISUEL:
┌─────────────┐
│ 🧪 🌡️ 📊 💧 │  ← 4 emojis superposés max
│ Phase 3     │
│ [Détails ▼] │
└─────────────┘

ACTUEL: CellEmojiOverlay.jsx existe mais:
- Pas de limite 4 emojis visible
- Disposition inline simple
- Pas de bouton "Détails ▼"
```

**PROBLÈME CODE:**
```jsx
// CellEmojiOverlay.jsx ligne 25-40
return (
    <div className="absolute top-1 right-1 flex gap-1">
        {emojis.map((emoji, index) => (
            <span key={index} className="text-sm">
                {emoji}
            </span>
        ))}
    </div>
);

// ❌ DEVRAIT ÊTRE:
// Grille 2x2 emojis, max 4, superposés en overlay, bouton "Détails ▼" en bas
```

**4.2 Style GitHub commits manquant**
```
CDC: "J'aimerais reprendre le principe visuel du nombre de commit de github"
CDC: "On voit les 365 cases équivalentes aux 365 jours de l'année"

ACTUEL:
- Grid 7 colonnes OK
- Mais pas de gradient d'intensité selon remplissage
- Pas d'effet visuel type heatmap
```

**CORRECTION REQUISE:**
```jsx
// Ajouter gradients selon nombre de données
const dataCount = Object.keys(cellData).filter(k => 
    !['timestamp', 'date', 'label'].includes(k)
).length;

const intensity = Math.min(dataCount / 10, 1); // 0 à 1

className={`
    ${hasData 
        ? `bg-green-${Math.ceil(intensity * 5)}00/20 border-green-${Math.ceil(intensity * 5)}00`
        : 'border-gray-300 bg-gray-50'
    }
`}
```

**4.3 Tooltip au survol incomplet**
```
CDC: "Case Pipeline (hover/click)"
CDC Tooltip devrait montrer:
- Nombre de paramètres assignés
- Liste emojis + labels
- "Cliquer pour éditer"

ACTUEL: PipelineCellTooltip existe mais données partielles
```

---

### 5. MODALE DE DONNÉES - ⚠️ 50%

#### ✅ CE QUI FONCTIONNE:
- PipelineDataModal existe
- Édition des valeurs ✓
- Sauvegarde/suppression ✓

#### ❌ ÉCARTS CDC:

**5.1 Interface modale non-conforme CDC**
```
CDC MODALE:
┌─────────────────────────────────────┐
│ Données assignées à Phase 3         │
├─────────────────────────────────────┤
│ 🧪 Engrais A : 2ml/L [✏️][🗑️]       │
│ 🌡️ Temp: 24°C [✏️][🗑️]             │
│ 📊 PPFD: 800µmol [✏️][🗑️]           │
│                                     │
│ [Drag depuis gauche] [Preset rapide]│
└─────────────────────────────────────┘

MANQUE:
- Zone "[Drag depuis gauche]" pour ajouter items
- Bouton "[Preset rapide]" pour appliquer preset
- Design liste avec icônes edit/delete inline
```

**5.2 Drag dans modale non implémenté**
```
CDC: "Zone réceptive drag & drop dans la modale"
ACTUEL: Seulement formulaires statiques
```

---

### 6. PANNEAU LATÉRAL - ⚠️ 70%

#### ✅ CE QUI FONCTIONNE:
- Structure hiérarchique sections ✓
- Icônes et labels ✓
- Expand/collapse ✓
- Items draggables ✓

#### ❌ ÉCARTS:

**6.1 Section MODE manquante dans Culture**
```
CDC CulturePipelineTimeline ligne 71-103:
{
    id: 'mode',
    label: 'MODE PIPELINE',
    icon: '🎯',
    special: 'mode-selector',
    component: <ModeSelector />
}

PROBLÈME: 
- Défini dans CulturePipelineTimeline.jsx ✓
- Mais ne s'affiche PAS dans PipelineDragDropView
- Car sidebarContent n'inclut pas les sections "special"
```

**CORRECTION:**
```jsx
// PipelineDragDropView.jsx ligne 503-530
{sidebarContent.map((section) => {
    // ✅ GÉRER LES SECTIONS SPÉCIALES
    if (section.special === 'mode-selector') {
        return section.component; // Rendre le composant direct
    }
    
    return (
        <div key={section.id}>
            {/* ... existing code ... */}
        </div>
    );
})}
```

---

### 7. GRADIENTS INTENSITÉ CASES - ⚠️ 30%

```
CDC: "principe visuel du nombre de commit de github"
CDC: Cases avec gradients selon densité de données

MANQUE:
1. Gradient de couleur selon intensité données dans cases existantes
2. Effet vert plus foncé = beaucoup de données
3. Tooltip condensé au hover montrant nombre de paramètres
```

**EXEMPLE VISUEL ATTENDU (dans grille existante):**
```
Cases avec 0 données:    bg-gray-50    border-gray-300
Cases avec 1-2 données:  bg-green-100  border-green-300
Cases avec 3-4 données:  bg-green-300  border-green-500
Cases avec 5+ données:   bg-green-500  border-green-700
```

**Note**: Pas de vue heatmap calendrier séparée - juste améliorer visuels des cases dans la grille timeline existante.

---

### 8. ATTRIBUTION EN MASSE - ⚠️ 80%

#### ✅ CE QUI FONCTIONNE:
- Mode sélection multiple ✓
- Checkbox cases ✓
- Bouton "Appliquer" ✓
- MassAssignModal ✓

#### ❌ ÉCARTS MINEURS:

**8.1 Drag préréglage sur sélection multiple**
```
CDC: "Drag d'un préréglage sur sélection = apply à toutes"
ACTUEL: Seulement bouton modal
```

---

### 9. CLIC DROIT PRÉ-CONFIGURATION - ❌ 0%

#### ❌ FONCTIONNALITÉ MANQUANTE:

**9.1 Menu contextuel sur items panneau latéral**
```
DEMANDE UTILISATEUR:
"Si depuis le volet latéral gauche on clique droit sur une donnée 
→ définir une/des valeurs : lorsqu'on drag and drop une donnée avec 
des valeurs assignées depuis le volet latéral gauche jusqu'à dans une case, 
ne pas faire remplir le formulaire et assigner directement à la case."

COMPORTEMENT ATTENDU:
1. Clic droit sur item panneau → Menu contextuel "Pré-configurer"
2. Mini formulaire pour définir valeur(s)
3. Indicateur visuel "item pré-configuré" (badge, couleur)
4. Drag & drop item pré-configuré → Assignment direct sans formulaire
5. Drag & drop item normal → Assignment avec valeur par défaut
```

**EXEMPLE:**
```jsx
// Clic droit sur "Température jour"
→ Menu: [Pré-configurer cette valeur]
→ Popup: Input "26°C" + Bouton Valider
→ Badge vert sur "🌡️ Température jour" = configuré
→ Drag vers case J5 → Assigne directement 26°C
```

---

## 🎯 PLAN DE REFONTE COMPLET

### Phase 1: Configuration Timeline (2-3h)
- [ ] Ajouter type "Secondes" avec stepper
- [ ] Ajouter type "Mois" avec slider 1-12
- [ ] Implémenter pagination auto > 365 jours
- [ ] Ajouter presets durées (60/70/90 jours)
- [ ] Tester toutes configurations

### Phase 2: Drag & Drop (3-4h)
- [ ] Corriger comportement drop (ajout direct, PAS modale)
- [ ] Implémenter feedback toast succès
- [ ] Améliorer distinction première case "Config générale"
- [ ] Ajouter zone drag dans modale
- [ ] Tester tous scénarios drag

### Phase 3: Préréglages (4-5h)
- [ ] Refondre PresetSelector avec catégories
- [ ] Multi-sélection checkboxes ☐
- [ ] Organisation Substrats/Engrais/Environnement
- [ ] Drag préréglages vers cases
- [ ] Bouton "Preset rapide" dans modale
- [ ] Tests complets système presets

### Phase 4: Cases Timeline (2-3h)
- [ ] Refondre CellEmojiOverlay (grille 2x2, max 4)
- [ ] Ajouter bouton "Détails ▼"
- [ ] Implémenter gradients type GitHub heatmap
- [ ] Améliorer tooltip (nombre params, liste, etc.)
- [ ] Tester visuels toutes densités

### Phase 5: Modale données (2h)
- [ ] Refondre interface selon CDC
- [ ] Liste items avec edit/delete inline
- [ ] Zone drag & drop réceptive
- [ ] Bouton "Preset rapide"
- [ ] Tests édition/suppression

### Phase 6: Panneau latéral (1-2h)
- [ ] Gérer sections "special" (mode-selector)
- [ ] Vérifier affichage MODE dans Culture
- [ ] Tests expand/collapse/drag
Clic droit pré-configuration (3-4h)
- [ ] Menu contextuel clic droit items panneau
- [ ] Mini formulaire pré-configuration valeurs
- [ ] Badge visuel items pré-configurés
- [ ] Détection drag item pré-configuré
- [ ] Assignment direct sans formulaire
- [ ] Tests tous scénarios clic droit

### Phase 8: Gradients intensité cases (1-2h)
- [ ] Calcul densité données par case
- [ ] Gradients couleur selon densité
- [ ] Tooltip nombre paramètres hover
- [ ] Tests visuels toutes densités

### Phase 9
### Phase 8: Tests & Documentation (2h)
- [ ] Tests manuels tous scénarios
- [ ] Documentation architecture
- [ ] Guide utilisateur
- [ ] Captures écran2%
- Configuration: 60%
- Drag & Drop: 30%
- Préréglages: 20%
- Cases: 40%
- Modale: 50%
- Latéral: 70%
- Gradients: 30%
- Masse: 80%
- Clic droit: 0%

### OBJECTIF APRÈS REFONTE: 100%
- Tous systèmes conformes CDC
- Clic droit pré-configuration fonctionnel
- Latéral: 70%
- GitHub: 0%
- Masse: 80%

### OBJECTIF APRÈS REFONTE: 100%
- Tous systèmes conformes CDC
- Architecture scalable
- Tests complets
- Documentation exhaustive

---

## 🔄 DÉPENDANCES ET RISQUES

### Dépendances
1. `@hello-pangea/dnd` (déjà installé)
2. Zustand store (existant)
3. Composants modales (existants)

### Risques
1. **Breaking changes**: Refonte peut casser existant
   - Mitigation: Tests exhaustifs
2. **Performances**: Grille 365 cases
   - Mitigation: Virtualisation si nécessaire
3. **Complexité UX**: Beaucoup de fonctionnalités
   - Mitigation: Tutoriel interactif

---

## 📝 FICHIERS À MODIFIER

### Composants principaux
1. `PipelineDragDropView.jsx` (refonte majeure)
2. `CulturePConfigStepper.jsx` (presets durées)
2. `PresetCategorySelector.jsx` (catégories presets)
3. `ItemContextMenu.jsx` (clic droit pré-config)
4. `PreConfigBadge.jsx` (badge items configuré
5. `PresetSelector.jsx` (refonte complète)
6. `CellEmojiOverlay.jsx` (refonte visuelle)
7. `PipelineCellTooltip.jsx` (enrichissement)

### Nouveaux composants
1. `PipelineHeatmapView.jsx` (GitHub-style)
2. `PipelineConfigStepper.jsx` (presets durées)
3. `PresetCategorySelector.jsx` (catégories presets)

### Utilitaires
1. `pipelineUtils.js` (helpers calculs)
2. `pipelineTypes.js` (types TypeScript)

---

## ✅ CHECKLIST VALIDATION CONFORMITÉ

### Configuration
- [ ] 8 types intervalles supportés (s/m/h/j/sem/mois/phases/dates)
- [ ] Presets durées pour jours
- [ ] Pagination auto > 365
- [ ] Validation limites tous types

### Drag & Drop
- [ ] Drop direct ajoute paramètre
- [ ] Toast feedback succès
- [ ] Pas de modale au drop
- [ ] Modale uniquement au clic case
- [ ] Distinction claire première case

### Préréglages
- [ ] Catégories hiérarchiques
- [ ] Multi-sélection checkboxes
- [ ] Drag preset vers case
- [ ] Bouton preset dans modale
- [ ] Sauvegarde/chargement

### Cases Timeline
- [ ] Emojis superposés max 4
- [ ] Grille 2x2 emojis
- [ ] Bouton "Détails ▼"
- [ ] Gradients type GitHub
- [ ] Tooltip complet hover

### Modale
- [ ] Liste items edit/delete inline
- [ ] Zone drag réceptive
- [ Gradients
- [ ] Gradients intensité cases existantes
- [ ] Tooltip nombre paramètres
- [ ] Effet visuel densité données

### Clic droit
- [ ] Menu contextuel items
- [ ] Formulaire pré-configuration
- [ ] Badge items configurés
- [ ] Drag & drop direct valeurs pré-définies
- [ ] Distinction item normal vs pré-configuré
- [ ] Tooltip condensé
- [ ] Vue miniature > 365
- [ ] Toggle heatmap/liste

---

**FIN DU RAPPORT**

Ce document servira de référence pour la refonte complète du système pipelines.
