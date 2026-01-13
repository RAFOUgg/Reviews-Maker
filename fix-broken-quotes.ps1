#!/usr/bin/env powershell
# Fix all broken imports from regex replacement with extra quotes

$dirs = @("client/src/components", "client/src/pages")

foreach ($dir in $dirs) {
    $files = Get-ChildItem -Path $dir -Filter "*.jsx" -Recurse
    
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        $original = $content
        
        # Specific patterns for broken paths with extra quotes
        $content = $content -replace "from ['\"]([.\/]+)store/'useGeneticsStore", "from '`$1store/useGeneticsStore"
        $content = $content -replace "from ['\"]([.\/]+)store/'orchardStore", "from '`$1store/orchardStore"
        $content = $content -replace "from ['\"]([.\/]+)store/'orchardConstants", "from '`$1store/orchardConstants"
        $content = $content -replace "from ['\"]([.\/]+)utils/'orchardHelpers", "from '`$1utils/orchardHelpers"
        $content = $content -replace "from ['\"]([.\/]+)hooks/'useMobileFormSection", "from '`$1hooks/useMobileFormSection"
        $content = $content -replace "from ['\"]([.\/]+)data/'visualOptions", "from '`$1data/visualOptions"
        $content = $content -replace "from ['\"]([.\/]+)data/'formValues", "from '`$1data/formValues"
        $content = $content -replace "from ['\"]([.\/]+)data/'effectsCategories", "from '`$1data/effectsCategories"
        $content = $content -replace "from ['\"]([.\/]+)data/'flowerData", "from '`$1data/flowerData"
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content
            Write-Host "✓ Fixed: $(Resolve-Path $file.FullName -Relative)"
        }
    }
}

Write-Host "`n✅ All broken imports fixed"
