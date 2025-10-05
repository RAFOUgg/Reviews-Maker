# Correctifs Urgents - Reviews Maker

## 1. Changer l'ownership des 2 reviews de test

```sql
-- Se connecter au VPS et exécuter :
sqlite3 ~/Reviews-Maker/db/reviews.db

-- Vérifier les reviews actuelles :
SELECT id, productName, ownerId, isPrivate FROM reviews;

-- Changer l'ownership vers ton email (remplace par ton email) :
UPDATE reviews SET ownerId = 'bgmgaming09@gmail.com' WHERE id IN (1, 2);

-- Vérifier :
SELECT id, productName, ownerId, isPrivate FROM reviews;

-- Quitter :
.quit
```

## 2. Vérifier/Corriger le statut public/privé

```sql
sqlite3 ~/Reviews-Maker/db/reviews.db

-- Voir toutes les reviews :
SELECT id, productName, ownerId, isDraft, isPrivate FROM reviews;

-- Mettre "Home made rosin" en public (remplace ID par le bon) :
UPDATE reviews SET isPrivate = 0, isDraft = 0 WHERE productName LIKE '%rosin%';

-- Vérifier :
SELECT id, productName, ownerId, isDraft, isPrivate FROM reviews;

.quit
```

## 3. Redémarrer PM2 pour recharger

```bash
cd ~/Reviews-Maker/server
pm2 restart reviews-maker
```

## 4. Bot Discord - L'application ne répond plus

Le bot tourne bien (les logs le montrent), mais Discord dit "L'application ne répond plus".

**Solutions possibles :**
1. Les commandes slash ne sont peut-être pas synchronisées
2. Le bot n'a peut-être pas les bonnes permissions

```bash
# Redémarrer le bot Discord
cd ~/LaFoncedalleBot
docker-compose restart lafoncedallebot

# Vérifier les logs
docker-compose logs -f lafoncedallebot
```

Si le problème persiste, il faudra re-sync les commandes slash manuellement via le code Discord.

## 5. Test final

1. Aller sur http://51.75.22.192/
2. La galerie publique devrait afficher "Home made rosin" ET "Zkittles"
3. Cliquer sur "Ma bibliothèque" → voir toutes tes reviews avec boutons d'action
4. Aller sur review.html → le bouton bibliothèque devrait ouvrir le drawer avec actions
