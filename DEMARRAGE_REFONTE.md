# 🚀 Démarrage Rapide - Refonte Reviews Maker

> **Version autonome sans LaFoncedalle - Novembre 2025**

---

## ⚡ Quick Start (5 minutes)

### 1️⃣ Sauvegarde (CRITIQUE - À faire MAINTENANT)

```powershell
# Dans le terminal PowerShell
cd "c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker"

# Backup automatique
node scripts/backup-before-migration.js

# Export utilisateurs
node scripts/export-users-list.js
```

**✅ Résultat attendu** :
- `backups/reviews-YYYY-MM-DD.sqlite`
- `backups/images-YYYY-MM-DD/`
- `backups/users-export.json`

---

### 2️⃣ Configuration Discord OAuth2 (10 minutes)

1. Aller sur https://discord.com/developers/applications
2. Cliquer "New Application" → Nom: `Reviews Maker`
3. Onglet **OAuth2** :
   ```
   Redirects:
   - http://localhost:3000/auth/discord/callback
   - https://reviews-maker.fr/auth/discord/callback
   
   Scopes:
   ✅ identify
   ✅ email
   ```
4. **Copier** :
   - Client ID : `__________________`
   - Client Secret : `__________________`

---

### 3️⃣ Configuration Resend (5 minutes)

1. Créer compte sur https://resend.com (gratuit)
2. Vérifier domaine `reviews-maker.fr` (ou utiliser domaine test)
3. Générer API Key
4. **Copier** : `re_____________________`

---

### 4️⃣ Initialiser Frontend (5 minutes)

```powershell
# Créer projet React
npm create vite@latest client -- --template react

cd client

# Installer dépendances
npm install `
  react-router-dom `
  @tanstack/react-query `
  zustand `
  framer-motion `
  clsx `
  tailwind-merge

# Installer TailwindCSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Démarrer dev server
npm run dev
# → Ouvrir http://localhost:5173
```

---

### 5️⃣ Setup Backend avec Prisma (10 minutes)

```powershell
cd ../server

# Installer Prisma
npm install prisma @prisma/client
npm install -D @types/node

# Init Prisma
npx prisma init

# Copier le schema depuis REFONTE_AUTONOME_2025.md
# Puis générer
npx prisma generate
npx prisma migrate dev --name init
```

**Fichier `.env`** à créer :
```env
DATABASE_URL="file:../db/reviews.sqlite"

DISCORD_CLIENT_ID="votre_client_id"
DISCORD_CLIENT_SECRET="votre_client_secret"
DISCORD_REDIRECT_URI="http://localhost:3000/auth/discord/callback"

RESEND_API_KEY="re_votre_api_key"

PORT=3000
NODE_ENV="development"
```

---

## 📚 Documentation Complète

### Fichiers créés pour vous :

| Fichier | Description |
|---------|-------------|
| `REFONTE_AUTONOME_2025.md` | 📖 Vision complète + architecture |
| `PLAN_IMPLEMENTATION.md` | 📋 Plan détaillé phase par phase (20 jours) |
| `scripts/backup-before-migration.js` | 💾 Script sauvegarde automatique |
| `scripts/export-users-list.js` | 👥 Export liste utilisateurs |

---

## 🗺️ Roadmap Simplifiée

```
Semaine 1 : Backend & Auth
├── Jour 1-2  : Setup infra (Discord, Resend, Prisma)
├── Jour 3-4  : Auth Discord OAuth2
├── Jour 5-6  : API Reviews (migration)
└── Jour 7    : Migration base données

Semaine 2 : Frontend
├── Jour 8-9  : Design System (composants UI)
├── Jour 10-11: Pages principales (Accueil, Galerie)
├── Jour 12-13: Éditeur reviews (migration logique)
└── Jour 14   : Profil utilisateur

Semaine 3 : Tests & Deploy
├── Jour 15-16: Tests (E2E + unitaires)
├── Jour 17-18: Optimisations & polish
└── Jour 19-20: Déploiement production
```

---

## 🎯 Prochaines Actions IMMÉDIATES

### Action 1 : Backup (MAINTENANT) ⚠️
```powershell
node scripts/backup-before-migration.js
```

### Action 2 : Discord App (Aujourd'hui)
→ https://discord.com/developers/applications

### Action 3 : Resend Account (Aujourd'hui)
→ https://resend.com

### Action 4 : Valider Architecture (Aujourd'hui)
→ Lire `REFONTE_AUTONOME_2025.md`
→ Valider stack technique
→ Poser questions si besoin

---

## 🆘 Besoin d'Aide ?

### Questions Fréquentes

**Q: Peut-on garder SQLite ou faut-il PostgreSQL ?**  
R: SQLite suffit pour <10k users. PostgreSQL si >10k ou multi-serveurs.

**Q: Pourquoi React et pas Vue/Svelte ?**  
R: React = écosystème mature, TailwindCSS optimisé, Framer Motion top. Mais on peut adapter !

**Q: Les anciennes reviews seront perdues ?**  
R: NON ! Le script de migration garde TOUT (reviews + images + dates).

**Q: Combien de temps pour tout migrer ?**  
R: 2-3 semaines pour 1 dev full-stack. 1 semaine si équipe de 2-3.

**Q: Coût infrastructure ?**  
R: 
- VPS 4GB RAM: ~10€/mois (Contabo, Hetzner)
- Resend: Gratuit (3000 emails/mois)
- Discord OAuth: Gratuit
- **Total: ~10€/mois**

---

## 🔗 Liens Utiles

- **Discord Dev Portal** : https://discord.com/developers/applications
- **Discord OAuth2 Docs** : https://discord.com/developers/docs/topics/oauth2
- **Resend** : https://resend.com
- **Prisma Docs** : https://www.prisma.io/docs
- **TailwindCSS** : https://tailwindcss.com
- **Framer Motion** : https://www.framer.com/motion
- **React Router** : https://reactrouter.com
- **Zustand** : https://github.com/pmndrs/zustand

---

## 📞 Support

Si vous avez des questions pendant la migration :

1. **Consulter** les docs (REFONTE_AUTONOME_2025.md + PLAN_IMPLEMENTATION.md)
2. **Vérifier** les backups existent avant toute action risquée
3. **Tester** en local avant déploiement production
4. **Documenter** les problèmes rencontrés pour les autres

---

## ✅ Checklist Démarrage

Cochez au fur et à mesure :

- [ ] ✅ Backup effectué (DB + images)
- [ ] ✅ Export utilisateurs créé
- [ ] 🔑 Discord App créée (Client ID + Secret)
- [ ] 📧 Compte Resend créé (API Key)
- [ ] ⚛️ Projet React/Vite initialisé
- [ ] 🗄️ Prisma configuré + migrations
- [ ] 📖 Documentation lue et comprise
- [ ] 🎯 Plan d'implémentation validé

---

**Une fois ces 8 étapes complétées, vous êtes prêt à démarrer la phase 1 ! 🚀**

---

## 🎨 Aperçu Design

Voici à quoi ressemblera la nouvelle interface (Apple-like) :

```
┌─────────────────────────────────────────────┐
│  🌿 Reviews Maker        👤 Username    ▼   │ ← Header épuré
├─────────────────────────────────────────────┤
│                                             │
│         Créez des reviews                   │
│         professionnelles                    │
│         en quelques clics                   │
│                                             │
│     [🚀 Créer une review]  [📚 Galerie]    │ ← CTA gradient
│                                             │
├─────────────────────────────────────────────┤
│  🔥 Populaires                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│  │ 🌸   │ │ 🍯   │ │ ⚡   │ │ 🌿   │      │ ← Cards avec glass morphism
│  │Fleur │ │ Hash │ │Conc. │ │Fleur │      │
│  └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
└─────────────────────────────────────────────┘
```

**Caractéristiques visuelles** :
- 🎨 Gradients subtils (violet → rose)
- ✨ Animations fluides 60fps
- 🌫️ Glass morphism (blur + transparence)
- 🌓 Dark mode par défaut
- 📱 Responsive (mobile-first)
- ⌨️ Keyboard navigation

---

**Bon courage pour la migration ! 💪**

*Dernière mise à jour : 3 novembre 2025*
