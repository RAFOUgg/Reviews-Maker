$pagesDir = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\pages"
$compDir = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\components"

# Function to move all nested files to root
function Flatten-Dir {
    param($dir)
    
    Get-ChildItem $dir -Recurse -File -Filter "*.jsx" | ForEach-Object {
        $file = $_
        # Only move if not already at root
        if ($file.DirectoryName -ne $dir) {
            Move-Item -Path $file.FullName -Destination $dir -Force 2>&1 | Out-Null
        }
    }
}

Write-Host "Flattening pages directory..."
Flatten-Dir $pagesDir

Write-Host "Flattening components directory..."
Flatten-Dir $compDir

# Now remove all empty subdirectories
Get-ChildItem $pagesDir -Directory | Remove-Item -Force -Recurse 2>&1 | Out-Null
Get-ChildItem $compDir -Directory | Remove-Item -Force -Recurse 2>&1 | Out-Null

Write-Host ""
Write-Host "Flattening COMPLETE!"
Write-Host ""
Write-Host "Pages at root: $((Get-ChildItem $pagesDir -Filter '*.jsx' | Measure-Object).Count)"
Write-Host "Components at root: $((Get-ChildItem $compDir -Filter '*.jsx' | Measure-Object).Count)"
