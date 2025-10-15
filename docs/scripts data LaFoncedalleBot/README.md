# Base de Données LaFoncedalleBot

## 📁 Structure

```
db/
├── schema.sql              # Schéma complet de la base de données
├── migrations/             # Scripts de migration
│   ├── 001_initial.sql
│   ├── 002_add_product_tracking.sql
│   └── ...
├── backups/               # Sauvegardes automatiques
└── README.md             # Ce fichier
```

## 📊 Tables

### `user_links`
Liaison entre comptes Discord et emails Shopify.
- **Clé primaire**: `discord_id`
- **Index**: `user_email` (unique)

### `reminder_blacklist`
Utilisateurs qui ont désactivé les rappels.
- **Clé primaire**: `discord_id`
- **Relation**: FK vers `user_links`

### `reminders`
Historique des rappels envoyés.
- **Clé primaire**: `(discord_id, order_id)`
- **Relation**: FK vers `user_links`

### `user_actions`
Log des actions utilisateurs pour analytics.
- **Clé primaire**: `id` (autoincrement)
- **Index**: `user_id`, `timestamp`

### `review_votes`
Votes sur les avis Judge.me.
- **Clé primaire**: `(review_id, user_id)`
- **Index**: `review_id`

### `product_tracking`
**NOUVEAU** : Suivi des produits pour détecter les nouveaux produits.
- **Clé primaire**: `product_handle`
- **Index**: `announced`, `available`
- **Usage**: Permet de détecter quand un produit devient `available:true` pour l'annoncer

## 🔄 Migrations

Les migrations sont appliquées automatiquement au démarrage du bot.

### Migration depuis l'ancien schéma

Si vous migrez depuis l'ancienne structure :

```bash
# 1. Sauvegarder l'ancienne DB
cp data.db db/backups/data_backup_$(date +%Y%m%d).db

# 2. Le bot appliquera automatiquement les migrations au démarrage
```

### Table `ratings` (OBSOLÈTE)

⚠️ **Cette table a été supprimée** car les notations se font maintenant via Judge.me, pas par le bot.

## 🆕 Système de Détection de Nouveaux Produits

Le système fonctionne comme suit :

1. **Synchronisation** : À chaque refresh du cache produits (toutes les 15 min)
2. **Détection** : Compare les produits actuels avec `product_tracking`
3. **Identification** : Si un produit a `available:true` et n'est pas dans la table → NOUVEAU
4. **Annonce** : Envoi d'un message dans le salon configuré (`menu_channel_id`)
5. **Marquage** : Le produit est marqué comme `announced:true` pour ne pas le réannoncer

## 🔧 Configuration

Le salon de notification est configuré via `/config` :
- **Salon Menu (nouveau drop)** : Où les nouveaux produits sont annoncés

## 📝 Vues

### `users_with_reminders`
Liste des utilisateurs avec le nombre de rappels reçus.

### `new_products_to_announce`
Liste des nouveaux produits non encore annoncés.

## 🛠️ Maintenance

### Nettoyage des anciennes données
```sql
-- Supprimer les rappels de plus de 6 mois
DELETE FROM reminders WHERE notified_at < datetime('now', '-6 months');

-- Nettoyer les produits trackés qui ne sont plus disponibles depuis 30 jours
DELETE FROM product_tracking 
WHERE available = FALSE 
  AND last_checked < datetime('now', '-30 days');
```

### Vérification de l'intégrité
```sql
-- Vérifier les liens orphelins
SELECT * FROM reminders 
WHERE discord_id NOT IN (SELECT discord_id FROM user_links);

-- Compter les produits par statut
SELECT 
    announced,
    available,
    COUNT(*) as count
FROM product_tracking
GROUP BY announced, available;
```

## 📦 Backups

Les backups sont automatiquement créés :
- **Fréquence** : Toutes les 3 semaines (configurable)
- **Destination** : `db/backups/` ou salon Discord configuré
- **Format** : `backup_YYYYMMDD_HHMMSS.db`

## 🔐 Sécurité

- ✅ Contraintes de clés étrangères activées
- ✅ Index sur les colonnes fréquemment requêtées
- ✅ Triggers pour maintenir les timestamps
- ✅ Validation des types de données
- ✅ Pas de données sensibles (mots de passe, etc.)
