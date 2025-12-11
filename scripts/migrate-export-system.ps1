# Script de migration pour le système d'export et templates
# Date: 2025-01-11

Write-Host "🚀 Migration Reviews-Maker - Système d'Export et Templates" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier qu'on est dans le bon dossier
if (-not (Test-Path "server-new/prisma/schema.prisma")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis la racine du projet Reviews-Maker" -ForegroundColor Red
    exit 1
}

# Chemin de la base de données
$dbPath = "db/reviews.sqlite"
if (-not (Test-Path $dbPath)) {
    Write-Host "⚠️  Base de données non trouvée à: $dbPath" -ForegroundColor Yellow
    $dbPath = Read-Host "Entrez le chemin de la base de données"
    if (-not (Test-Path $dbPath)) {
        Write-Host "❌ Fichier introuvable: $dbPath" -ForegroundColor Red
        exit 1
    }
}

Write-Host "📦 Base de données: $dbPath" -ForegroundColor Green

# Backup de la DB
$backupPath = "db/backups/reviews-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss').sqlite"
Write-Host "`n📋 Création d'un backup..." -ForegroundColor Yellow

# Créer le dossier de backup si nécessaire
$backupDir = Split-Path $backupPath -Parent
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

Copy-Item $dbPath $backupPath
Write-Host "✅ Backup créé: $backupPath" -ForegroundColor Green

# Appliquer la migration SQL
$migrationFile = "server-new/db/migrations/2025-01-11_templates_permissions.sql"
if (-not (Test-Path $migrationFile)) {
    Write-Host "❌ Fichier de migration introuvable: $migrationFile" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔧 Application de la migration SQL..." -ForegroundColor Yellow

# Vérifier si sqlite3 est disponible
$sqlite3 = Get-Command sqlite3 -ErrorAction SilentlyContinue
if (-not $sqlite3) {
    Write-Host "❌ sqlite3 n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "📥 Installation via: winget install SQLite.SQLite" -ForegroundColor Yellow
    exit 1
}

# Appliquer la migration
try {
    $migrationContent = Get-Content $migrationFile -Raw
    $migrationContent | sqlite3 $dbPath
    Write-Host "✅ Migration SQL appliquée avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'application de la migration: $_" -ForegroundColor Red
    Write-Host "🔄 Restauration du backup..." -ForegroundColor Yellow
    Copy-Item $backupPath $dbPath -Force
    Write-Host "✅ Base de données restaurée" -ForegroundColor Green
    exit 1
}

# Vérifier que les templates prédéfinis ont été créés
Write-Host "`n🔍 Vérification des templates prédéfinis..." -ForegroundColor Yellow
$templateCount = sqlite3 $dbPath "SELECT COUNT(*) FROM templates WHERE category='predefined';"
Write-Host "✅ $templateCount templates prédéfinis trouvés" -ForegroundColor Green

# Régénérer le client Prisma
Write-Host "`n🔨 Régénération du client Prisma..." -ForegroundColor Yellow
Push-Location server-new
try {
    npx prisma generate
    Write-Host "✅ Client Prisma régénéré" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors de la génération Prisma: $_" -ForegroundColor Yellow
    Write-Host "Vous devrez exécuter 'npx prisma generate' manuellement" -ForegroundColor Yellow
}
Pop-Location

# Résumé
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "✅ Migration terminée avec succès!" -ForegroundColor Green
Write-Host "`nRésumé:" -ForegroundColor Cyan
Write-Host "  • Backup: $backupPath"
Write-Host "  • Templates prédéfinis: $templateCount"
Write-Host "  • Nouveaux champs ajoutés à la table templates"
Write-Host "  • Table template_shares créée"
Write-Host "`nProchaines étapes:" -ForegroundColor Yellow
Write-Host "  1. Redémarrer le serveur backend"
Write-Host "  2. Rebuild le frontend si nécessaire"
Write-Host "  3. Tester l'ExportModal avec différents types de comptes"
Write-Host "`n📚 Documentation: .docs/EXPORT_SYSTEM_UPDATE_2025-01-11.md" -ForegroundColor Cyan
