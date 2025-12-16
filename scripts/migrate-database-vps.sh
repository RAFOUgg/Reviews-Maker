#!/bin/bash

# Script de migration de la base de données sur le VPS
# À exécuter depuis le dossier server-new sur le VPS

echo "🔄 Migration de la base de données Reviews-Maker..."

cd ~/Reviews-Maker/server-new || exit 1

# Backup de la base avant migration
echo "📦 Backup de la base de données..."
BACKUP_DIR="../db/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).db"
cp ../db/reviews-maker.db "$BACKUP_FILE"
echo "✅ Backup créé: $BACKUP_FILE"

# Générer le client Prisma
echo "🔨 Génération du client Prisma..."
npx prisma generate

# Appliquer les migrations
echo "🚀 Application des migrations..."
npx prisma migrate deploy

# Vérifier que la colonne accountType existe
echo "🔍 Vérification de la structure..."
npx prisma db execute --stdin <<SQL
SELECT 
    name,
    type,
    sql
FROM 
    sqlite_master
WHERE 
    type='table' 
    AND name='User';
SQL

echo "✅ Migration terminée avec succès !"
echo "💡 Redémarrez le serveur PM2 : pm2 restart reviews-maker"
