# Script de correction des classes rgba() transparentes
# Remplace toutes les classes Tailwind avec rgba() par des classes utilitaires opaques

$sourcePath = "client\src"
$files = Get-ChildItem -Path $sourcePath -Include "*.jsx","*.tsx" -Recurse

Write-Host "🔍 Recherche des fichiers à corriger dans $sourcePath..." -ForegroundColor Cyan
Write-Host ""

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $originalContent = $content
    $fileReplacements = 0
    
    # === BACKGROUNDS ===
    
    # bg-[rgba(var(--color-primary),0.05)] → bg-theme-surface
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.05\)\]', 'bg-theme-surface'
    
    # bg-[rgba(var(--color-primary),0.1)] et 0.08 → bg-theme-input
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.0?8\)\]', 'bg-theme-input'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.1\)\]', 'bg-theme-input'
    
    # bg-[rgba(var(--color-primary),0.15)] et 0.2 → bg-theme-secondary
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.15\)\]', 'bg-theme-secondary'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.2\)\]', 'bg-theme-secondary'
    
    # bg-[rgba(var(--color-primary),0.25)] et 0.3 → bg-theme-tertiary
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.25\)\]', 'bg-theme-tertiary'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.3\)\]', 'bg-theme-tertiary'
    
    # bg-[rgba(var(--color-primary),0.4)] → bg-theme-tertiary aussi
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.4\)\]', 'bg-theme-tertiary'
    
    # bg-[rgba(var(--color-primary),0.85)] et 0.9 → bg-theme-primary
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.85\)\]', 'bg-theme-primary'
    $content = $content -replace 'bg-\[rgba\(var\(--color-primary\),0\.9\)\]', 'bg-theme-primary'
    
    # bg-[rgba(var(--color-accent),X)] → bg-theme-accent
    $content = $content -replace 'bg-\[rgba\(var\(--color-accent\),[0-9.]+\)\]', 'bg-theme-accent'
    
    # bg-[rgba(var(--color-warning),X)] → garder tel quel pour le moment ou convertir
    $content = $content -replace 'bg-\[rgba\(var\(--color-warning\),0\.1\)\]', 'bg-yellow-100 dark:bg-yellow-900/20'
    
    # bg-[rgba(var(--color-danger),X)] → classes danger
    $content = $content -replace 'bg-\[rgba\(var\(--color-danger\),0\.2\)\]', 'bg-red-100 dark:bg-red-900/20'
    $content = $content -replace 'bg-\[rgba\(var\(--color-danger\),0\.3\)\]', 'bg-red-200 dark:bg-red-900/30'
    
    # === BORDERS ===
    
    # border-[rgba(var(--color-primary),X)] → border-theme
    $content = $content -replace 'border-\[rgba\(var\(--color-primary\),[0-9.]+\)\]', 'border-theme'
    
    # border-[rgba(var(--color-accent),X)] → border-theme-accent
    $content = $content -replace 'border-\[rgba\(var\(--color-accent\),[0-9.]+\)\]', 'border-theme-accent'
    
    # border-[rgba(var(--color-warning),X)]
    $content = $content -replace 'border-\[rgba\(var\(--color-warning\),[0-9.]+\)\]', 'border-yellow-300 dark:border-yellow-700'
    
    # === HOVER STATES ===
    
    # hover:bg-[rgba(var(--color-primary),0.1)] → hover:bg-theme-input
    $content = $content -replace 'hover:bg-\[rgba\(var\(--color-primary\),0\.1\)\]', 'hover:bg-theme-input'
    
    # hover:bg-[rgba(var(--color-primary),0.15)] → hover:bg-theme-secondary
    $content = $content -replace 'hover:bg-\[rgba\(var\(--color-primary\),0\.15\)\]', 'hover:bg-theme-secondary'
    
    # hover:bg-[rgba(var(--color-primary),0.2)] → hover:bg-theme-secondary
    $content = $content -replace 'hover:bg-\[rgba\(var\(--color-primary\),0\.2\)\]', 'hover:bg-theme-secondary'
    
    # hover:bg-[rgba(var(--color-primary),0.3)] et 0.4 → hover:bg-theme-tertiary
    $content = $content -replace 'hover:bg-\[rgba\(var\(--color-primary\),0\.3\)\]', 'hover:bg-theme-tertiary'
    $content = $content -replace 'hover:bg-\[rgba\(var\(--color-primary\),0\.4\)\]', 'hover:bg-theme-tertiary'
    
    # === SHADOWS ===
    
    # shadow-[0_0_15px_rgba(...)] → shadow-lg (Tailwind standard)
    $content = $content -replace 'shadow-\[0_0_15px_rgba\(var\(--color-primary\),[0-9.]+\)\]', 'shadow-lg'
    $content = $content -replace 'shadow-\[0_0_20px_rgba\(var\(--color-primary\),[0-9.]+\)\]', 'shadow-xl'
    $content = $content -replace 'hover:shadow-\[0_0_15px_rgba\(var\(--color-primary\),[0-9.]+\)\]', 'hover:shadow-lg'
    $content = $content -replace 'hover:shadow-\[0_0_20px_rgba\(var\(--color-primary\),[0-9.]+\)\]', 'hover:shadow-xl'
    
    # Compter les changements
    if ($content -ne $originalContent) {
        $changes = @()
        if ($originalContent -match 'bg-\[rgba' -and $content -notmatch 'bg-\[rgba') {
            $changes += "backgrounds"
        }
        if ($originalContent -match 'border-\[rgba' -and $content -notmatch 'border-\[rgba') {
            $changes += "borders"
        }
        if ($originalContent -match 'hover:bg-\[rgba' -and $content -notmatch 'hover:bg-\[rgba') {
            $changes += "hover states"
        }
        if ($originalContent -match 'shadow-\[.*rgba' -and $content -notmatch 'shadow-\[.*rgba') {
            $changes += "shadows"
        }
        
        $fileReplacements = ($changes | Measure-Object).Count
        $totalReplacements += $fileReplacements
        
        Write-Host "✅ $($file.Name)" -ForegroundColor Green
        Write-Host "   → Corrigé: $($changes -join ', ')" -ForegroundColor Gray
        
        # Sauvegarder le fichier
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
    }
}

Write-Host ""
Write-Host "✨ Terminé! $totalReplacements fichiers corrigés." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Vérifier que le serveur Vite recompile correctement" -ForegroundColor Gray
Write-Host "   2. Tester sur les 5 thèmes (Violet, Émeraude, Tahiti, Sakura, Minuit)" -ForegroundColor Gray
Write-Host "   3. Vérifier la visibilité de tous les composants" -ForegroundColor Gray
