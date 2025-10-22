# Configuration Base de Données LaFoncedalleBot - VPS

## Contexte
Reviews-Maker et LaFoncedalleBot sont dans des dossiers séparés sur le VPS :
- Reviews-Maker : `/chemin/vers/reviews-maker/`
- LaFoncedalleBot : `/chemin/vers/lafoncedallebot/`

## Configuration requise

### 1. Identifier le chemin de la base de données
```bash
# Se connecter au container Docker du bot (si applicable)
docker exec -it lafoncedallebot_container bash
ls -la /app/db/data.db

# Ou directement sur le système de fichiers
ls -la /chemin/vers/lafoncedallebot/db/data.db
```

### 2. Configurer la variable d'environnement
Dans le fichier `.env` de Reviews-Maker :
```bash
# Ajouter cette ligne
LAFONCEDALLE_DB_FILE=/chemin/vers/lafoncedallebot/db/data.db
```

### 3. Redémarrer Reviews-Maker
```bash
# Avec PM2
pm2 restart reviews-maker

# Ou directement
cd /chemin/vers/reviews-maker/server
npm start
```

### 4. Vérifier les logs
Les logs devraient afficher :
```
[LaFoncedalle][DB] Found user: Username (DiscordID)
```

Au lieu de :
```
[LaFoncedalle] POST /api/discord/user-by-email returned 200
```

## Dépannage

### Erreur "Could not open LaFoncedalleBot database"
- Vérifier que le chemin est correct
- Vérifier les permissions d'accès au fichier
- S'assurer que LaFoncedalleBot a créé la base de données

### Erreur "DB path not configured"
- La variable `LAFONCEDALLE_DB_FILE` n'est pas définie
- L'application utilisera l'API comme fallback

### Base de données vide
- Lancer LaFoncedalleBot au moins une fois pour créer la structure
- Vérifier que des utilisateurs ont lié leur compte Discord