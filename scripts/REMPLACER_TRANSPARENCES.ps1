# Script de remplacement global des transparences
# Remplace toutes les classes Tailwind rgba() par des variables CSS opaques

Write-Host "🔍 Recherche de tous les fichiers .jsx dans client/src..." -ForegroundColor Cyan

$files = Get-ChildItem -Path "client/src" -Filter "*.jsx" -Recurse
$totalFiles = $files.Count
$modifiedFiles = 0
$totalReplacements = 0

Write-Host "📁 $totalFiles fichiers trouvés`n" -ForegroundColor Green

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $fileReplacements = 0
    
    # Backgrounds avec opacité → Variables opaques
    $replacements = @(
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.05\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-surface)" }}'; Name = 'bg 0.05 → bg-surface' },
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.1\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-input)" }}'; Name = 'bg 0.1 → bg-input' },
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.15\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-input)" }}'; Name = 'bg 0.15 → bg-input' },
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.2\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-secondary)" }}'; Name = 'bg 0.2 → bg-secondary' },
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.3\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-secondary)" }}'; Name = 'bg 0.3 → bg-secondary' },
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.4\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-secondary)" }}'; Name = 'bg 0.4 → bg-secondary' },
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.85\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-primary)" }}'; Name = 'bg 0.85 → bg-primary' },
        @{Pattern = 'bg-\[rgba\(var\(--color-primary\),0\.9\)\]'; Replace = 'style={{ backgroundColor: "var(--bg-primary)" }}'; Name = 'bg 0.9 → bg-primary' }
    )
    
    foreach ($rep in $replacements) {
        $matches = [regex]::Matches($content, $rep.Pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $rep.Pattern, $rep.Replace
            $fileReplacements += $matches.Count
            Write-Host "  ✓ $($rep.Name): $($matches.Count) occurrence(s)" -ForegroundColor Yellow
        }
    }
    
    # Borders avec opacité → var(--border)
    $borderPatterns = @(
        'border-\[rgba\(var\(--color-primary\),0\.2\)\]',
        'border-\[rgba\(var\(--color-primary\),0\.3\)\]',
        'border-\[rgba\(var\(--color-primary\),0\.4\)\]',
        'border-\[rgba\(var\(--color-primary\),0\.5\)\]'
    )
    
    foreach ($pattern in $borderPatterns) {
        $matches = [regex]::Matches($content, $pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $pattern, 'style={{ borderColor: "var(--border)" }}'
            $fileReplacements += $matches.Count
            Write-Host "  ✓ border rgba → var(--border): $($matches.Count) occurrence(s)" -ForegroundColor Yellow
        }
    }
    
    # Accent backgrounds
    $accentPatterns = @(
        @{Pattern = 'bg-\[rgba\(var\(--color-accent\),0\.1\)\]'; Replace = 'style={{ backgroundColor: "var(--accent-light)" }}' },
        @{Pattern = 'bg-\[rgba\(var\(--color-accent\),0\.15\)\]'; Replace = 'style={{ backgroundColor: "var(--accent-light)" }}' },
        @{Pattern = 'bg-\[rgba\(var\(--color-accent\),0\.2\)\]'; Replace = 'style={{ backgroundColor: "var(--accent-light)" }}' },
        @{Pattern = 'bg-\[rgba\(var\(--color-accent\),0\.3\)\]'; Replace = 'style={{ backgroundColor: "var(--accent)" }}' }
    )
    
    foreach ($rep in $accentPatterns) {
        $matches = [regex]::Matches($content, $rep.Pattern)
        if ($matches.Count -gt 0) {
            $content = $content -replace $rep.Pattern, $rep.Replace
            $fileReplacements += $matches.Count
            Write-Host "  ✓ accent rgba → var(--accent): $($matches.Count) occurrence(s)" -ForegroundColor Yellow
        }
    }
    
    # Si le contenu a changé, sauvegarder
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline -Encoding UTF8
        $modifiedFiles++
        $totalReplacements += $fileReplacements
        Write-Host "✅ $($file.Name): $fileReplacements remplacement(s)`n" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🎉 TERMINÉ !" -ForegroundColor Green
Write-Host "📊 Statistiques:" -ForegroundColor Cyan
Write-Host "  - Fichiers modifiés: $modifiedFiles / $totalFiles" -ForegroundColor Yellow
Write-Host "  - Total remplacements: $totalReplacements" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan
