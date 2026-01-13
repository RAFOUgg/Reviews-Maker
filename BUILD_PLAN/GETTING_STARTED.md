# Guide de Démarrage - Reviews-Maker

## ⚡ Démarrage Rapide (5 minutes)

### 1. Prérequis
```bash
Node.js 18+ LTS
npm 9+
Git
```

Vérifiez:
```bash
node --version    # v18.x ou v20.x
npm --version     # 9.x+
git --version     # 2.x+
```

### 2. Clone & Installation

```bash
# Clone repo
git clone https://github.com/RAFOUgg/Reviews-Maker.git
cd Reviews-Maker

# Install dependencies
cd client && npm install
cd ../server-new && npm install
```

### 3. Configuration Environnement

**Backend (.env)**
```bash
cd server-new
cp .env.example .env

# Remplir:
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./reviews.sqlite

# OAuth Discord
DISCORD_CLIENT_ID=your_id
DISCORD_CLIENT_SECRET=your_secret
OAUTH_CALLBACK_URL=http://localhost:3000/auth/discord/callback

# Sessions
JWT_SECRET=your_secret
SESSION_SECRET=your_secret
```

**Frontend (.env)**
```bash
cd ../client
# Normalement pas de .env nécessaire en dev
# (Les variables sont dans vite.config.js)
```

### 4. Lancement

**Terminal 1 - Backend:**
```bash
cd server-new
npm run check-env    # Valide la config
npm run dev          # Démarre le serveur (port 3000)
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev          # Démarre Vite (port 5173)
```

**Résultat:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Prisma Studio: http://localhost:5555 (optionnel)

### 5. Validation Setup

Visitez http://localhost:5173 et:
- [ ] Page charge sans erreurs
- [ ] Vous pouvez créer un compte
- [ ] Vous pouvez vous connecter
- [ ] Vous pouvez créer une review
- [ ] Vous pouvez exporter une review

---

## 📂 Structure Projet Clé

```
Reviews-Maker/
├── client/           # Frontend React + Vite
├── server-new/       # Backend Express + Node.js
├── data/             # Données statiques (JSON)
├── db/               # Base de données
├── PLAN/             # Documentation
└── scripts/          # Utilitaires
```

## 🔧 Commandes Utiles

### Frontend (client/)
```bash
npm run dev          # Dev server (Vite)
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # ESLint check
```

### Backend (server-new/)
```bash
npm run dev          # Dev avec nodemon
npm run check-env    # Valide .env
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (GUI DB)
```

### Database (server-new/)
```bash
# Réinitialiser DB complètement
rm db/reviews.sqlite
npm run prisma:migrate
npm run prisma:seed  # (si seed script existe)
```

---

## 📖 Documentation

| Document | Contenu |
|----------|---------|
| [README.md](README.md) | Vue d'ensemble |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture système |
| [STACK.md](STACK.md) | Technologies utilisées |
| [FEATURES.md](FEATURES.md) | Fonctionnalités complètes |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Workflow développement |
| [API.md](API.md) | API endpoints |
| [CONVENTIONS.md](CONVENTIONS.md) | Standards de code |

---

## 🚀 Vos Premiers Pas

### 1. Créer une Review

1. Allez sur http://localhost:5173
2. Connectez-vous (créez un compte si nécessaire)
3. Cliquez "Créer Review"
4. Choisissez le type (Fleur, Hash, etc.)
5. Remplissez les sections
6. Cliquez "Enregistrer"

### 2. Exporter une Review

1. Allez à votre review créée
2. Cliquez "Exporter"
3. Choisissez template + format
4. Cliquez "Télécharger"

### 3. Voir la Galerie

1. Menu → "Galerie"
2. Voyez les reviews publiques d'autres utilisateurs
3. Cliquez pour détails

### 4. Voir Votre Profil

1. Menu → "Profil"
2. Voyez vos stats
3. Modifiez vos préférences

---

## 🐛 Troubleshooting

### Erreur: "Cannot find module"
```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 / 5173 occupé
```bash
# Changer port backend
PORT=3001 npm run dev

# Frontend est auto-configurable si 5173 occupé
npm run dev
```

### Database corrupted
```bash
# Supprimer et recréer
cd server-new
rm db/reviews.sqlite db/reviews.sqlite-shm db/reviews.sqlite-wal
npm run prisma:migrate
```

### OAuth Discord non configuré
```
Utilisez Email/Password pour tester
(OAuth optionnel pour dev local)
```

### Erreurs CORS
```
S'assure que:
- Backend démarre sur :3000
- Frontend sur :5173
- .env OAUTH_CALLBACK_URL correct
```

---

## 📚 Ressources

- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Express**: https://expressjs.com
- **Prisma**: https://www.prisma.io/docs
- **TailwindCSS**: https://tailwindcss.com

---

## 🎯 Prochaines Étapes

1. **Lire** [ARCHITECTURE.md](ARCHITECTURE.md) pour comprendre le système
2. **Explorer** [DEVELOPMENT.md](DEVELOPMENT.md) pour le workflow
3. **Vérifier** [API.md](API.md) pour les endpoints
4. **Suivre** [CONVENTIONS.md](CONVENTIONS.md) pour coder

---

**Besoin d'aide?**
- Vérifiez les logs (console du browser + terminal)
- Lisez la documentation correspondante
- Vérifiez que .env est bien configuré

**Prêt à coder?** → [DEVELOPMENT.md](DEVELOPMENT.md)
