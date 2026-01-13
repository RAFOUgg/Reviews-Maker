$pagesDir = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\pages"
cd $pagesDir

# Ensure directories exist
@('auth', 'reviews', 'gallery', 'library', 'genetics', 'account', 'home', 'demo') | % {
    if (-not (Test-Path $_)) { mkdir $_ | Out-Null }
}

# Mapping of files to target folders
$mappings = @{
    # Auth pages
    'LoginPage.jsx' = 'auth'
    'AgeVerificationPage.jsx' = 'auth'
    'RegisterPage.jsx' = 'auth'
    'EmailVerificationPage.jsx' = 'auth'
    'ForgotPasswordPage.jsx' = 'auth'
    'ResetPasswordPage.jsx' = 'auth'
    
    # Review pages
    'CreateReviewPage.jsx' = 'reviews'
    'EditReviewPage.jsx' = 'reviews'
    'ReviewDetailPage.jsx' = 'reviews'
    
    # Gallery page
    'GalleryPage.jsx' = 'gallery'
    
    # Library page
    'LibraryPage.jsx' = 'library'
    
    # Genetics pages
    'GeneticsManagementPage.jsx' = 'genetics'
    'PhenoHuntPage.jsx' = 'genetics'
    
    # Account pages
    'PaymentPage.jsx' = 'account'
    'PreferencesPage.jsx' = 'account'
    'ProfilePage.jsx' = 'account'
    'ProfileSettingsPage.jsx' = 'account'
    'SettingsPage.jsx' = 'account'
    'StatsPage.jsx' = 'account'
    'AccountSetupPage.jsx' = 'account'
    'AccountChoicePage.jsx' = 'account'
    
    # Home page
    'HomePage.jsx' = 'home'
    
    # Demo pages
    'ExamplePipelineIntegration.jsx' = 'demo'
    'TemplatesDemo.jsx' = 'demo'
}

$moved = 0
$skipped = 0

foreach ($file in (Get-ChildItem -File -Filter "*.jsx")) {
    if ($mappings.ContainsKey($file.Name)) {
        $target = $mappings[$file.Name]
        # Check if already in correct folder
        if ($file.DirectoryName -ne (Resolve-Path $target).Path) {
            Move-Item $file.FullName "$target\" -Force
            Write-Host "Moved $($file.Name) to $target\"
            $moved++
        } else {
            $skipped++
        }
    }
}

Write-Host ""
Write-Host "====== REORGANIZATION COMPLETE ======"
Write-Host "Moved: $moved files"
Write-Host "Skipped: $skipped files (already in correct location)"

# List final structure
Write-Host ""
Write-Host "Final structure:"
@('auth', 'reviews', 'gallery', 'library', 'genetics', 'account', 'home', 'demo') | % {
    $count = (Get-ChildItem "$_\" -Filter "*.jsx" 2>/dev/null | Measure-Object).Count
    Write-Host "  $_ : $count files"
}
