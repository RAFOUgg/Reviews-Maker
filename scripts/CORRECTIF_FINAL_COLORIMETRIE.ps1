#!/usr/bin/env pwsh
# ============================================================================
# CORRECTIF FINAL - COLORIMÉTRIE ET TRANSPARENCES
# ============================================================================
# Corrige TOUS les problèmes de lisibilité et transparence dans le frontend
# 1. Supprime colorWithOpacity() dans Orchard
# 2. Remplace opacity-{X} classes Tailwind
# 3. Supprime bg-black/80, bg-white/10, text-white hardcodés
# ============================================================================

$ErrorActionPreference = "Stop"
$clientSrc = "client\src"

Write-Host "`n🎨 CORRECTIF FINAL - COLORIMÉTRIE ET TRANSPARENCES" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

# ============================================================================
# PHASE 1: Supprimer colorWithOpacity() dans Orchard Templates
# ============================================================================
Write-Host "`n📋 PHASE 1: Suppression colorWithOpacity() dans templates Orchard" -ForegroundColor Yellow

$orchardTemplates = @(
    "$clientSrc\components\orchard\templates\DetailedCardTemplate.jsx",
    "$clientSrc\components\orchard\templates\ModernCompactTemplate.jsx",
    "$clientSrc\components\orchard\templates\BlogArticleTemplate.jsx"
)

$colorWithOpacityReplacements = @{
    # Transparences légères → bg-theme-surface
    "colorWithOpacity\(colors\.accent,\s*5\)" = "colors.bgSurface"
    "colorWithOpacity\(colors\.accent,\s*8\)" = "colors.bgSurface"
    "colorWithOpacity\(colors\.accent,\s*10\)" = "colors.bgSecondary"
    
    # Transparences moyennes → bg-theme-secondary
    "colorWithOpacity\(colors\.accent,\s*15\)" = "colors.bgSecondary"
    "colorWithOpacity\(colors\.accent,\s*20\)" = "colors.bgSecondary"
    
    # Transparences fortes → bg-theme-tertiary
    "colorWithOpacity\(colors\.accent,\s*30\)" = "colors.bgTertiary"
    
    # Borders avec transparence → border-theme
    "border:\s*`\$\{.*\}\s*solid\s*\$\{colorWithOpacity\(colors\.accent,\s*\d+\)\}`" = "border: `1px solid ${colors.accent}`"
    "borderTop:\s*`\$\{.*\}\s*solid\s*\$\{colorWithOpacity\(colors\.accent,\s*\d+\)\}`" = "borderTop: `1px solid ${colors.accent}`"
    "borderBottom:\s*`\$\{.*\}\s*solid\s*\$\{colorWithOpacity\(colors\.accent,\s*\d+\)\}`" = "borderBottom: `1px solid ${colors.accent}`"
}

$orchardFixed = 0
foreach ($template in $orchardTemplates) {
    if (Test-Path $template) {
        Write-Host "  Processing: $template" -ForegroundColor Gray
        $content = Get-Content $template -Raw -Encoding UTF8
        $originalContent = $content
        
        foreach ($pattern in $colorWithOpacityReplacements.Keys) {
            $replacement = $colorWithOpacityReplacements[$pattern]
            $content = $content -replace $pattern, $replacement
        }
        
        # Supprimer l'import inutile de colorWithOpacity
        $content = $content -replace "colorWithOpacity,\s*", ""
        $content = $content -replace ",\s*colorWithOpacity", ""
        $content = $content -replace "colorWithOpacity", ""
        
        if ($content -ne $originalContent) {
            Set-Content $template -Value $content -Encoding UTF8 -NoNewline
            $orchardFixed++
            Write-Host "    ✅ Fixed colorWithOpacity" -ForegroundColor Green
        }
    }
}

Write-Host "  📊 $orchardFixed templates Orchard corrigés" -ForegroundColor Green

# ============================================================================
# PHASE 2: Remplacer opacity-{X} classes Tailwind
# ============================================================================
Write-Host "`n📋 PHASE 2: Remplacement classes opacity-{X} Tailwind" -ForegroundColor Yellow

$allJsxFiles = Get-ChildItem -Path $clientSrc -Filter *.jsx -Recurse | Select-Object -ExpandProperty FullName

$opacityReplacements = @{
    # opacity-70 sur texte → text-[rgb(var(--text-secondary))]
    'className="([^"]*\s+)opacity-70(\s+[^"]*)"' = 'className="$1text-[rgb(var(--text-secondary))]$2"'
    'className="opacity-70([^"]*)"'              = 'className="text-[rgb(var(--text-secondary))]$1"'
    
    # opacity-80 sur texte → text-[rgb(var(--text-secondary))]
    'className="([^"]*\s+)opacity-80(\s+[^"]*)"' = 'className="$1text-[rgb(var(--text-secondary))]$2"'
    'className="opacity-80([^"]*)"'              = 'className="text-[rgb(var(--text-secondary))]$1"'
    
    # opacity-90 sur texte → text-[rgb(var(--text-primary))]
    'className="([^"]*\s+)opacity-90(\s+[^"]*)"' = 'className="$1text-[rgb(var(--text-primary))]$2"'
    'className="opacity-90([^"]*)"'              = 'className="text-[rgb(var(--text-primary))]$1"'
    
    # opacity-50 → text-[rgb(var(--text-tertiary))] (très clair)
    'className="([^"]*\s+)opacity-50(\s+[^"]*)"' = 'className="$1text-[rgb(var(--text-tertiary))]$2"'
    'className="opacity-50([^"]*)"'              = 'className="text-[rgb(var(--text-tertiary))]$1"'
    
    # opacity-40 → disabled (garder)
    # opacity-25 → SVG/icons (garder)
}

$opacityFixed = 0
foreach ($file in $allJsxFiles) {
    $content = Get-Content $file -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    
    foreach ($pattern in $opacityReplacements.Keys) {
        $replacement = $opacityReplacements[$pattern]
        $content = $content -replace $pattern, $replacement
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        $opacityFixed++
        Write-Host "  ✅ Fixed opacity classes: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
}

Write-Host "  📊 $opacityFixed fichiers avec opacity-{X} corrigés" -ForegroundColor Green

# ============================================================================
# PHASE 3: Remplacer hardcoded bg-black/white et text-white
# ============================================================================
Write-Host "`n📋 PHASE 3: Remplacement hardcoded bg-black/white/text-white" -ForegroundColor Yellow

$hardcodedReplacements = @{
    # bg-black/80 → bg-[rgb(var(--bg-overlay))]
    'bg-black/80'                   = 'bg-[rgba(0,0,0,0.85)]'
    'bg-black/60'                   = 'bg-[rgba(0,0,0,0.7)]'
    
    # bg-white/10 → bg-[rgba(255,255,255,0.1)]
    'bg-white/10'                   = 'bg-[rgba(var(--color-primary),0.1)]'
    'bg-white/20'                   = 'bg-[rgba(var(--color-primary),0.15)]'
    
    # text-white hardcodé (SAUF sur boutons gradients) → var(--text-on-dark)
    'text-white(?!\s+rounded)'      = 'text-[rgb(var(--text-on-dark))]'
    
    # bg-gray-{X} dark mode → CSS variables
    'bg-gray-100 dark:bg-gray-700'  = 'bg-theme-surface'
    'bg-gray-200 dark:bg-gray-600'  = 'bg-theme-secondary'
    'text-gray-900 dark:text-white' = 'text-[rgb(var(--text-primary))]'
    'text-gray-400'                 = 'text-[rgb(var(--text-secondary))]'
}

$hardcodedFixed = 0
foreach ($file in $allJsxFiles) {
    $content = Get-Content $file -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $originalContent = $content
    
    foreach ($pattern in $hardcodedReplacements.Keys) {
        $replacement = $hardcodedReplacements[$pattern]
        $content = $content -replace $pattern, $replacement
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file -Value $content -Encoding UTF8 -NoNewline
        $hardcodedFixed++
        Write-Host "  ✅ Fixed hardcoded colors: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
}

Write-Host "  📊 $hardcodedFixed fichiers avec hardcoded colors corrigés" -ForegroundColor Green

# ============================================================================
# RÉSUMÉ FINAL
# ============================================================================
Write-Host "`n" + ("=" * 80) -ForegroundColor Cyan
Write-Host "📊 RÉSUMÉ CORRECTIF COLORIMÉTRIE" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan

Write-Host "`n✅ CORRECTIONS APPLIQUÉES:" -ForegroundColor Green
Write-Host "  Phase 1: $orchardFixed templates Orchard (colorWithOpacity supprimé)" -ForegroundColor White
Write-Host "  Phase 2: $opacityFixed fichiers (opacity-{X} classes remplacées)" -ForegroundColor White
Write-Host "  Phase 3: $hardcodedFixed fichiers (hardcoded colors corrigés)" -ForegroundColor White

Write-Host "`n🎯 TOTAL: $($orchardFixed + $opacityFixed + $hardcodedFixed) fichiers modifiés" -ForegroundColor Cyan

Write-Host "`n📝 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "  1. Tester localement: http://localhost:5173" -ForegroundColor White
Write-Host "  2. Vérifier TOUS les 5 thèmes (Violet/Émeraude/Tahiti/Sakura/Minuit)" -ForegroundColor White
Write-Host "  3. Si OK → git add -A; git commit; git push" -ForegroundColor White
Write-Host "  4. Déployer sur VPS: git pull && npm run build && pm2 restart" -ForegroundColor White

Write-Host "`n⚠️  NOTE IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  Les dropdowns <select> restent en style navigateur (limitation CSS)" -ForegroundColor White
Write-Host "  → Solution finale: créer CustomSelect.jsx React component (prochaine étape)" -ForegroundColor White

Write-Host "`n✅ CORRECTIF COLORIMÉTRIE TERMINÉ!" -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan
