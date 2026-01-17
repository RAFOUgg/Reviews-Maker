# 🎯 Local Development Checklist

## ✅ Setup Initial (Une fois)

- [ ] Télécharge le repo
- [ ] Exécute `setup-dev-local.ps1` (Windows) ou `setup-dev-local.sh` (Mac/Linux)
- [ ] Attends la fin du setup (~2-3 minutes)
- [ ] Vérifie que tout est vert ✅

## 🚀 Avant de Coder (Chaque session)

### Terminal 1 - Backend
```bash
cd server-new
npm run dev
```
✅ Voir: `✨ Server running on http://localhost:3000`

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```
✅ Voir: `➜ Local: http://localhost:5173/`

### Navigateur
- [ ] Ouvre http://localhost:5173
- [ ] Attends le chargement (~5 sec)
- [ ] Vérifie la page se charge sans erreurs

## 🔐 Authentication

### Option 1: Auto-Login (Recommandé)
- Dans `App.jsx` ou ta page principale:
```jsx
import { useDevelopmentAutoLogin } from '@/hooks/useDevelopmentAutoLogin'

export default function App() {
    useDevelopmentAutoLogin()  // Auto-login en dev
    return (...)
}
```

### Option 2: Login Manual
- Email: `test@example.com`
- Mot de passe: `test123456`

## 🎨 Workflow Développement

1. **Code dans VS Code** → Changes auto-détectées
2. **Frontend**: Champs `.jsx` rechargent auto (hot reload)
3. **Backend**: Doit être relancé si tu changes le serveur
4. **Ouvre DevTools** (F12) pour voir les logs

## 🧪 Tester tes Changes

### Frontend Changes
```
Fichier modifié → Auto hot reload → Visible en 1-2 sec
```

### Backend Changes  
```
Fichier modifié → Arrête npm run dev (Ctrl+C)
                → npm run dev (relance)
                → Rechargis le navigateur
```

### DB Changes
- Voir la DB en temps réel:
```bash
cd server-new
npm run prisma:studio
# Ouvre http://localhost:5555
```

## 🗂️ Base de Données

### Voir les données
```bash
cd server-new
npm run prisma:studio
```
✅ Ouvre l'interface graphique Prisma Studio

### Réinitialiser la DB
```bash
# Supprime toutes les données
rm db/reviews.sqlite

# Recrée la DB vide
cd server-new
npm run prisma:migrate

# Recrée l'utilisateur de test
node seed-test-user.js
```

## 📊 Monitoring

### Backend Logs
Regarde la console du Terminal 1:
```
[Timestamp] POST /api/reviews 200
[Timestamp] GET /api/auth/me 401
```

### Frontend Logs
Ouvre F12 → Console et vois les logs React:
```
GET http://localhost:3000/api/reviews 200
POST http://localhost:3000/api/auth/login 200
```

### Network Requests
F12 → Network Tab:
- Vois toutes les requêtes API
- Vois les réponses (JSON)
- Vois les headers

## 🐛 Troubleshooting Quick

| Problème | Solution |
|----------|----------|
| "ECONNREFUSED 3000" | Backend pas lancé (Terminal 1) |
| "ECONNREFUSED 5173" | Frontend pas lancé (Terminal 2) |
| "Port 3000 en usage" | `lsof -i :3000` puis `kill -9 <PID>` |
| "Module not found" | `npm install` dans le bon dossier |
| "Prisma error" | `npm run prisma:generate` dans server-new |
| "DB empty" | `node seed-test-user.js` dans server-new |

## 🎁 Pro Tips

- 📝 **Logs:** Utilise `console.log()` partout, les logs apparaissent immédiatement
- 🔥 **Hot Reload:** Sauvegarde avec Ctrl+S = refresh auto du navigateur
- 🎯 **API Test:** Utilise Postman/Thunder Client pour tester les endpoints
- 📸 **Screenshot:** Utilise Shift+S dans DevTools pour capturer des zones
- 🔗 **Direct Links:** 
  - Frontend: http://localhost:5173/create/flower
  - Backend API: http://localhost:3000/api/reviews
  - Prisma Studio: http://localhost:5555

## ✨ Avant de Commit

- [ ] Code fonctionne localement
- [ ] Pas d'erreurs en console (F12)
- [ ] Teste au moins 2 scénarios
- [ ] Commit avec message clair

```bash
git add .
git commit -m "feat: description de ce que tu as changé"
git push origin feat/ma-branche
```

## 🚀 Deployment (Après Merge)

Une fois merge sur `main`, le VPS redéploie automatiquement.
Vérifie: https://reviews-maker.fr

---

**Besoin d'aide?** Consulte [DEV_LOCAL_SETUP.md](./DEV_LOCAL_SETUP.md) 📚
