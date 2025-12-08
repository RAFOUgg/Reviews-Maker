# Script de remplacement massif - Suppression transparences

## Pattern à remplacer

Rechercher : `bg-[rgba(var(--color-primary),0.X)]`
Remplacer par : `var(--bg-X)` approprié

### Mapping

| Ancien (avec transparence) | Nouveau (opaque) |
|----------------------------|------------------|
| `bg-[rgba(var(--color-primary),0.05)]` | `style={{ backgroundColor: 'var(--bg-surface)' }}` |
| `bg-[rgba(var(--color-primary),0.1)]` | `style={{ backgroundColor: 'var(--bg-input)' }}` |
| `bg-[rgba(var(--color-primary),0.15)]` | `style={{ backgroundColor: 'var(--bg-input)' }}` |
| `bg-[rgba(var(--color-primary),0.2)]` | `style={{ backgroundColor: 'var(--bg-secondary)' }}` |
| `bg-[rgba(var(--color-primary),0.3)]` | `style={{ backgroundColor: 'var(--bg-secondary)' }}` |
| `bg-[rgba(var(--color-primary),0.85)]` | `style={{ backgroundColor: 'var(--bg-primary)' }}` |

| Ancien border | Nouveau |
|--------------|---------|
| `border-[rgba(var(--color-primary),0.2)]` | `style={{ borderColor: 'var(--border)' }}` |
| `border-[rgba(var(--color-primary),0.3)]` | `style={{ borderColor: 'var(--border)' }}` |
| `border-[rgba(var(--color-primary),0.4)]` | `style={{ borderColor: 'var(--border)' }}` |
| `border-[rgba(var(--color-primary),0.5)]` | `style={{ borderColor: 'var(--border)' }}` |

## Fichiers à corriger (94 occurrences)

1. **FertilizationPipeline.jsx** - 30+ occurrences
2. **CultivarList.jsx** - 20+ occurrences  
3. **PipelineWithCultivars.jsx** - 10+ occurrences
4. **EffectSelector.jsx** - 10+ occurrences
5. **WheelSelector.jsx** - 8 occurrences
6. **CultivarLibraryModal.jsx** - 4 occurrences
7. **SectionNavigator.jsx** - 6 occurrences
8. **UserProfileDropdown.jsx** - 5 occurrences
9. **Layout.jsx** - 1 occurrence
10. **PurificationPipeline.jsx** - 2 occurrences
11. **HomeReviewCard.jsx** - 4 occurrences

## Solution GLOBALE

Au lieu de modifier 94 occurrences manuellement, il faut :

1. **Ajouter des utilitaires Tailwind custom** dans `index.css`
2. OU **Rechercher/Remplacer global** avec VS Code
3. OU **Supprimer les opacités** dans les définitions CSS des thèmes

### Option 1 : Utilitaires Tailwind Custom (RECOMMANDÉ)

Ajouter dans `index.css` :

```css
/* === UTILITAIRES BACKGROUND OPAQUES === */
.bg-primary-opaque {
    background-color: var(--bg-primary) !important;
}

.bg-secondary-opaque {
    background-color: var(--bg-secondary) !important;
}

.bg-tertiary-opaque {
    background-color: var(--bg-tertiary) !important;
}

.bg-input-opaque {
    background-color: var(--bg-input) !important;
}

.bg-surface-opaque {
    background-color: var(--bg-surface) !important;
}

.border-theme {
    border-color: var(--border) !important;
}
```

Ensuite rechercher/remplacer :
- `bg-[rgba(var(--color-primary),0.1)]` → `bg-input-opaque`
- `bg-[rgba(var(--color-primary),0.2)]` → `bg-secondary-opaque`
- `border-[rgba(var(--color-primary),0.3)]` → `border-theme`

### Option 2 : PowerShell Global Replace

```powershell
# Remplacer dans tous les fichiers JSX
$files = Get-ChildItem -Path "client/src/components" -Filter "*.jsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Backgrounds
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.05\)\]', 'bg-surface-opaque'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.1\d?\)\]', 'bg-input-opaque'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.2\)\]', 'bg-secondary-opaque'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.3\)\]', 'bg-secondary-opaque'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.85\)\]', 'bg-primary-opaque'
    
    # Borders
    $content = $content -replace 'border-\[rgba\(var\(--color-primary\),0\.\d+\)\]', 'border-theme'
    
    Set-Content $file.FullName $content -NoNewline
}
```

## DÉCISION

Utiliser **Option 1** (utilitaires CSS) car :
- ✅ Plus maintenable
- ✅ Réutilisable
- ✅ Pas de regex complexe
- ✅ Compatible avec tous les thèmes
