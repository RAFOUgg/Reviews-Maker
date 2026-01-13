# Fix root component imports that have broken ../ paths
$componentsDir = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\components"

# Get all .jsx files at root level only
$files = Get-ChildItem -Path $componentsDir -Filter "*.jsx"

$fixed = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    # Replace patterns like: from '../../../components/liquid' -> from './LiquidComponent'
    # Replace patterns like: from '../../components/SegmentedControl' -> from './SegmentedControl'
    # Replace patterns like: from '../../ui/Component' -> from './Component'
    
    # Pattern 1: ../../../components/X -> ./X
    $content = $content -replace 'from [''"]\.\.\/\.\.\/\.\.\/components\/([^''\"]+)[''"]', 'from ''./$1'''
    
    # Pattern 2: ../../components/X -> ./X
    $content = $content -replace 'from [''"]\.\.\/\.\.\/components\/([^''\"]+)[''"]', 'from ''./$1'''
    
    # Pattern 3: ../components/X -> ./X  
    $content = $content -replace 'from [''"]\.\.\/components\/([^''\"]+)[''"]', 'from ''./$1'''
    
    # Pattern 4: ../../ui/X -> ./X
    $content = $content -replace 'from [''"]\.\.\/\.\.\/ui\/([^''\"]+)[''"]', 'from ''./$1'''
    
    # Pattern 5: ../ui/X -> ./X
    $content = $content -replace 'from [''"]\.\.\/ui\/([^''\"]+)[''"]', 'from ''./$1'''
    
    # Pattern 6: ../../pipeline/X -> ./X
    $content = $content -replace 'from [''"]\.\.\/\.\.\/pipeline\/([^''\"]+)[''"]', 'from ''./$1'''
    
    # Pattern 7: ../pipeline/X -> ./X
    $content = $content -replace 'from [''"]\.\.\/pipeline\/([^''\"]+)[''"]', 'from ''./$1'''
    
    # Pattern 8: ../../liquid -> ./LiquidComponent
    $content = $content -replace 'from [''"]\.\.\/\.\.\/liquid[''"]', 'from ''./liquid'''
    
    # Pattern 9: ../liquid -> ./liquid
    $content = $content -replace 'from [''"]\.\.\/liquid[''"]', 'from ''./liquid'''
    
    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content
        Write-Host "✓ Fixed: $($file.Name)"
        $fixed++
    }
}

Write-Host "`n📊 Fixed $fixed root components"
