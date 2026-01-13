#!/usr/bin/env powershell
# Comprehensive fix for all ../../ imports in root components

$componentsDir = "client/src/components"
$files = Get-ChildItem -Path $componentsDir -Filter "*.jsx"

$fixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Fix all ../../../ to ../../
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/data\/', 'from ''../../data/'''
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/services\/', 'from ''../../services/'''
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/hooks\/', 'from ''../../hooks/'''
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/store\/', 'from ''../../store/'''
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/utils\/', 'from ''../../utils/'''
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/config\/', 'from ''../../config/'''
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "✓ Fixed: $($file.Name)"
        $fixed++
    }
}

Write-Host "`n📊 Fixed $fixed root components"
