# Configuration Session et Démarrage

## 🔧 Problèmes Résolus

### 1. Persistance de Session (DB se souvient de vous)

**Configuration serveur** (`server-new/server.js`):
```javascript
app.use(session({
    store: new Store({
        dir: path.join(__dirname, '../db'),
        db: 'sessions.db',              // ✅ Base SQLite persistante
        concurrentDb: true
    }),
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // ✅ 7 jours de persistence
        httpOnly: true,
        secure: false,                    // ✅ false en dev, true en prod
        sameSite: 'lax',                  // ✅ Autorise les cookies cross-site
        path: '/'
    },
    name: 'sessionId'
}))
```

**Configuration CORS** (credentials activés):
```javascript
app.use(cors({
    origin: true,                    // ✅ Autorise toutes les origines en dev
    credentials: true,               // ✅ ESSENTIEL pour cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}))
```

**Configuration Vite** (`client/vite.config.js`):
```javascript
proxy: {
    '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,          // ✅ Accepte les certificats auto-signés
        ws: true,               // ✅ Support WebSocket
        configure: (proxy) => {
            // Logs de debug pour voir les requêtes
        }
    }
}
```

### 2. Script de Démarrage Simplifié (START.bat)

**Avant**: Script PowerShell complexe avec jobs, difficile à debugger

**Après**: Script batch simple qui lance 2 fenêtres séparées

**Fonctionnalités**:
- ✅ Vérifie Node.js installé
- ✅ Nettoie les anciens processus node.exe
- ✅ Installe les dépendances si manquantes
- ✅ Lance backend dans une fenêtre dédiée
- ✅ Lance frontend dans une fenêtre dédiée
- ✅ Ouvre automatiquement le navigateur
- ✅ Fenêtres nommées pour identification facile

**Usage**:
```cmd
# Double-clic sur START.bat
# ou en ligne de commande:
START.bat
```

**Avantages**:
- Fenêtres séparées = logs visibles en permanence
- Fermer une fenêtre = arrêter ce serveur uniquement
- Pas de problème de timeout ou de race condition
- Facile à debugger (erreurs visibles dans chaque fenêtre)

### 3. Structure des Dossiers

```
Reviews-Maker/
├── START.bat               ← LANCEUR PRINCIPAL (double-clic)
├── START_SIMPLE.bat        ← Backup de la version simple
├── START.ps1               ← Version PowerShell (optionnelle)
│
├── client/                 ← Frontend React + Vite
│   ├── src/
│   ├── vite.config.js      ← Config proxy + HMR
│   └── package.json
│
├── server-new/             ← Backend Express + Prisma
│   ├── server.js           ← Config session + CORS
│   ├── routes/
│   └── package.json
│
└── db/                     ← Bases de données
    ├── sessions.db         ← Sessions persistantes ✅
    ├── sessions.db-shm
    └── sessions.db-wal
```

## 🚀 Flux de Connexion

1. **Utilisateur clique "Se connecter"**
   ```
   Frontend → /api/auth/discord
   ```

2. **Redirection Discord OAuth**
   ```
   Discord → Callback → /api/auth/discord/callback
   ```

3. **Création de session**
   ```javascript
   req.login(user, (err) => {
       // Session créée et stockée dans sessions.db
       // Cookie 'sessionId' envoyé au navigateur
   })
   ```

4. **Requêtes authentifiées**
   ```
   Chaque requête → Cookie 'sessionId' → Vérification session
   ```

5. **Persistence**
   - Cookie valide 7 jours
   - Session stockée dans SQLite (survit aux redémarrages)
   - Tant que le cookie existe, l'utilisateur reste connecté

## 🔍 Debug / Vérification

### Vérifier la session dans le navigateur
1. Ouvrir DevTools (F12)
2. Application → Cookies → http://localhost:5173
3. Chercher le cookie `sessionId`
4. Valeur = identifiant de session
5. Expires = date d'expiration (7 jours)

### Vérifier la base de données
```powershell
# PowerShell
sqlite3 db/sessions.db "SELECT * FROM sessions;"
```

### Logs serveur
- Backend: Fenêtre "Reviews-Maker Backend"
- Frontend: Fenêtre "Reviews-Maker Frontend"
- Rechercher "Session created" ou "User authenticated"

## 📝 Troubleshooting

### Session ne persiste pas
1. Vérifier que `db/sessions.db` existe
2. Vérifier les cookies dans DevTools
3. Vérifier CORS credentials: true
4. Vérifier cookie sameSite: 'lax'

### Backend ne démarre pas
1. Vérifier port 3000 libre: `netstat -ano | findstr :3000`
2. Arrêter processus: `taskkill /F /PID <PID>`
3. Relancer START.bat

### Frontend ne se connecte pas au backend
1. Vérifier proxy Vite (vite.config.js)
2. Vérifier backend actif: http://localhost:3000/api/health
3. Vérifier logs dans fenêtre Backend

## ✅ Checklist de Validation

- [x] START.bat lance les 2 serveurs
- [x] Backend écoute sur :3000
- [x] Frontend écoute sur :5173
- [x] Navigateur s'ouvre automatiquement
- [x] Connexion Discord fonctionne
- [x] Session persiste après redémarrage serveur
- [x] Cookies envoyés avec chaque requête
- [ ] Tester déconnexion/reconnexion
- [ ] Tester expiration après 7 jours

## 📚 Références

- Express Session: https://www.npmjs.com/package/express-session
- Connect SQLite3: https://www.npmjs.com/package/connect-sqlite3
- Vite Proxy: https://vitejs.dev/config/server-options.html#server-proxy
- CORS Credentials: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
