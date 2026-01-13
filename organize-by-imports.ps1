$compDir = "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\client\src\components"

# Create necessary subdirectories
@('legal', 'account', 'ui') | % {
    if (-not (Test-Path "$compDir\$_")) {
        mkdir "$compDir\$_" | Out-Null
    } else {
        # Remove if it's a file instead of directory
        if ((Get-Item "$compDir\$_").PSIsContainer -eq $false) {
            Remove-Item "$compDir\$_" -Force
            mkdir "$compDir\$_" | Out-Null
        }
    }
}

# Move legal components
$legalFiles = @('RDRBanner.jsx', 'AgeVerification.jsx', 'ConsentModal.jsx', 'DisclaimerRDRModal.jsx', 'DisclaimerRDR.jsx', 'LegalWelcomeModal.jsx', 'LegalConsentGate.jsx', 'RDRModal.jsx')
foreach ($file in $legalFiles) {
    $path = "$compDir\$file"
    if (Test-Path $path) {
        Move-Item $path "$compDir\legal\" -Force 2>&1 | Out-Null
        Write-Host "Moved $file to legal/"
    }
}

# Move account components
$accountFiles = @('AccountSelector.jsx', 'UserProfileDropdown.jsx', 'UpgradePrompt.jsx', 'UsageQuotas.jsx', 'ThemeSwitcher.jsx', 'AuthorStatsModal.jsx')
foreach ($file in $accountFiles) {
    $path = "$compDir\$file"
    if (Test-Path $path) {
        Move-Item $path "$compDir\account\" -Force 2>&1 | Out-Null
        Write-Host "Moved $file to account/"
    }
}

# Move ui components
$uiFiles = @('AnimatedMeshGradient.jsx')
foreach ($file in $uiFiles) {
    $path = "$compDir\$file"
    if (Test-Path $path) {
        Move-Item $path "$compDir\ui\" -Force 2>&1 | Out-Null
        Write-Host "Moved $file to ui/"
    }
}

Write-Host ""
Write-Host "Organization by App.jsx imports complete!"
