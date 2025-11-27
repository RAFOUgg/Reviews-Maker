# Plan d'Implémentation - Phase par Phase

## 🎯 Vue d'ensemble

**Durée totale estimée** : 2-3 semaines  
**Équipe** : 1 développeur full-stack  
**Priorité** : Migration sans perte de données

---

## Phase 0️⃣ : Sauvegarde Critique (AUJOURD'HUI - 1h)

### Objectifs
- ✅ Sauvegarder toutes les données existantes
- ✅ Documenter l'état actuel
- ✅ Créer point de restauration

### Actions
```bash
# 1. Backup automatique
cd c:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker
node scripts/backup-before-migration.js

# 2. Backup manuel VPS (si applicable)
ssh user@vps
cd /path/to/reviews-maker
tar czf backup-$(date +%F).tar.gz db/
scp backup-*.tar.gz local:/safe/location/

# 3. Documenter les utilisateurs
node scripts/export-users-list.js > users-backup.json
```

### Livrables
- [x] `backups/reviews-YYYY-MM-DD.sqlite`
- [x] `backups/images-YYYY-MM-DD/`
- [x] `backups/backup-reviews-YYYY-MM-DD.tar.gz`
- [ ] `users-backup.json` (liste des Discord IDs)

---

## Phase 1️⃣ : Setup Infrastructure (Jour 1-2)

### 1.1 Configuration Discord OAuth2
```bash
# Étapes sur Discord Developer Portal
# https://discord.com/developers/applications

1. Créer nouvelle application "Reviews Maker"
2. Onglet OAuth2 :
   - Add Redirect: http://localhost:3000/auth/discord/callback
   - Add Redirect: https://reviews-maker.fr/auth/discord/callback
   - Scopes: identify, email
3. Copier Client ID et Client Secret
```

### 1.2 Configuration Resend (Email)
```bash
# Sur https://resend.com

1. Créer compte (gratuit 3000 emails/mois)
2. Vérifier domaine reviews-maker.fr
3. Générer API Key
```

### 1.3 Initialiser Nouveau Projet Frontend
```bash
# Créer projet React moderne
npm create vite@latest client -- --template react

cd client
npm install

# Dépendances principales
npm install \
  react-router-dom \
  @tanstack/react-query \
  zustand \
  framer-motion \
  tailwindcss \
  autoprefixer \
  postcss

# Setup Tailwind
npx tailwindcss init -p
```

### 1.4 Setup Backend avec Prisma
```bash
# Dans le dossier server/
npm install prisma @prisma/client

# Init Prisma
npx prisma init

# Copier le schema depuis REFONTE_AUTONOME_2025.md
# Puis générer
npx prisma generate
npx prisma migrate dev --name init
```

### Livrables Phase 1
- [ ] Discord App configurée
- [ ] Compte Resend actif
- [ ] Frontend Vite fonctionnel
- [ ] Prisma configuré et migrations créées

---

## Phase 2️⃣ : Backend - Auth & API (Jour 3-5)

### 2.1 Implémentation Discord OAuth2
**Fichier** : `server/src/routes/auth.js`

```javascript
// Routes à implémenter
GET  /auth/discord           // Redirect vers Discord
GET  /auth/discord/callback  // Callback Discord → créer session
POST /auth/logout            // Supprimer session
GET  /auth/me                // Info utilisateur connecté
```

**Tests** :
```bash
# Test flow complet
curl http://localhost:3000/auth/discord
# → Suivre redirect navigateur
# → Vérifier création session en DB
```

### 2.2 Migration Routes Reviews
**Fichier** : `server/src/routes/reviews.js`

Migrer depuis `server/routes/reviews.js` actuel vers nouveau système :

```javascript
// Routes à migrer (avec userId au lieu de ownerId)
GET    /api/reviews              // Liste (public + user si auth)
GET    /api/reviews/:id          // Détail
POST   /api/reviews              // Créer (auth required)
PUT    /api/reviews/:id          // Modifier (auth + owner)
DELETE /api/reviews/:id          // Supprimer (auth + owner)
POST   /api/reviews/:id/image    // Upload image
GET    /api/reviews/user/:userId // Reviews d'un user
```

**Middleware Auth** : `server/src/middleware/auth.js`
```javascript
async function requireAuth(req, res, next) {
  const sessionToken = req.cookies.session;
  if (!sessionToken) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  
  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    include: { user: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ error: 'session_expired' });
  }
  
  req.user = session.user;
  next();
}
```

### 2.3 Service Email
**Fichier** : `server/src/services/email.js`

```javascript
// Templates email
- sendVerificationCode(email, code)
- sendWelcomeEmail(email, username)
- sendPasswordReset(email, resetLink)
```

### Livrables Phase 2
- [ ] Auth Discord fonctionnelle
- [ ] Routes API reviews migrées
- [ ] Middleware auth en place
- [ ] Service email opérationnel
- [ ] Tests Postman/Thunder Client passants

---

## Phase 3️⃣ : Migration Base de Données (Jour 6-7)

### 3.1 Script de Migration
**Fichier** : `scripts/migrate-data.js`

```javascript
// Étapes du script
1. Lire ancienne DB reviews.sqlite
2. Extraire tous les ownerId uniques (Discord IDs)
3. Créer users avec Discord ID
4. Pour chaque review :
   - Mapper ownerId → userId
   - Migrer data JSON
   - Copier imagePath
   - Préserver dates
5. Vérifier intégrité
6. Rapport de migration
```

**Exécution** :
```bash
# Dry run (simulation)
node scripts/migrate-data.js --dry-run

# Migration réelle
node scripts/migrate-data.js --execute

# Vérification
node scripts/verify-migration.js
```

### 3.2 Vérifications Post-Migration
```sql
-- Compter reviews
SELECT COUNT(*) FROM Review;
SELECT COUNT(*) FROM reviews; -- ancienne table

-- Vérifier users
SELECT COUNT(*) FROM User;
SELECT COUNT(DISTINCT ownerId) FROM reviews;

-- Vérifier intégrité
SELECT r.id, r.name, u.discordId 
FROM Review r 
JOIN User u ON r.userId = u.id 
LIMIT 10;
```

### Livrables Phase 3
- [ ] Script migration testé (dry-run)
- [ ] Migration exécutée avec succès
- [ ] Rapport de migration (stats)
- [ ] Backup post-migration créé
- [ ] Vérifications intégrité OK

---

## Phase 4️⃣ : Frontend - Design System (Jour 8-10)

### 4.1 Design Tokens
**Fichier** : `client/src/styles/tokens.css`

```css
/* Définir toutes les variables CSS */
- Couleurs (thèmes : violet, émeraude, rose)
- Typographie
- Espacements
- Ombres
- Animations
```

### 4.2 Composants UI de Base
**Dossier** : `client/src/components/ui/`

Composants à créer (Apple-like) :
```
Button.jsx       // Primary, Secondary, Ghost, Danger
Card.jsx         // Surface avec shadow & radius
Modal.jsx        // Overlay + animation
Input.jsx        // Champs formulaire stylisés
Badge.jsx        // Pills pour tags
Avatar.jsx       // Photo profil Discord
Spinner.jsx      // Loading state
Toast.jsx        // Notifications
Dropdown.jsx     // Menus contextuels
```

**Storybook** (optionnel) : Pour tester composants isolés

### 4.3 Layout & Navigation
**Composants** :
```jsx
<Header />       // Logo, nav, avatar user
<Sidebar />      // Navigation principale (mobile drawer)
<Footer />       // Liens légaux, social
<Container />    // Wrapper responsive
```

### Livrables Phase 4
- [ ] Design tokens définis
- [ ] 10+ composants UI créés
- [ ] Layout responsive
- [ ] Dark mode fonctionnel
- [ ] Animations fluides (Framer Motion)

---

## Phase 5️⃣ : Frontend - Pages Principales (Jour 11-13)

### 5.1 Page Accueil
**Fichier** : `client/src/pages/Home.jsx`

```jsx
// Sections
- Hero (CTA "Créer une review")
- Galerie publique (grid reviews)
- Statistiques (total reviews, users)
- Footer
```

### 5.2 Galerie Publique
**Fichier** : `client/src/pages/Gallery.jsx`

```jsx
// Features
- Filtres (type produit, date)
- Recherche
- Pagination infinie
- Lightbox preview
- Tri (récent, populaire)
```

### 5.3 Éditeur de Review
**Fichier** : `client/src/pages/Editor.jsx`

```jsx
// Migrer logique depuis app.js
- Formulaire multi-étapes (Type → Infos → Validation)
- Preview temps réel (panneau latéral)
- Upload image
- Export PNG/JPG
- Sauvegarde auto (draft)
```

### 5.4 Profil Utilisateur
**Fichier** : `client/src/pages/Profile.jsx`

```jsx
// Sections
- Avatar + username Discord
- Stats personnelles
- Mes reviews (grid)
- Paramètres compte
```

### 5.5 Système d'Auth
**Composants** :
```jsx
<LoginButton />    // "Se connecter avec Discord"
<AuthModal />      // Modal connexion (si pas redirect)
<UserMenu />       // Dropdown profil
<ProtectedRoute /> // HOC pour routes privées
```

### Livrables Phase 5
- [ ] 4 pages principales créées
- [ ] Routing fonctionnel (React Router)
- [ ] Auth flow complet (login/logout)
- [ ] Éditeur migré et fonctionnel
- [ ] Responsive mobile/tablet/desktop

---

## Phase 6️⃣ : Intégration & Tests (Jour 14-15)

### 6.1 Connexion Frontend ↔ Backend
```javascript
// client/src/lib/api.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getReviews(filters = {}) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${API_BASE}/api/reviews?${params}`, {
    credentials: 'include', // Envoyer cookies
  });
  return res.json();
}

// Autres fonctions API...
```

### 6.2 State Management
```javascript
// client/src/stores/authStore.js (Zustand)
export const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  login: async () => { /* Discord OAuth */ },
  logout: async () => { /* Clear session */ },
  checkAuth: async () => { /* GET /auth/me */ },
}));
```

### 6.3 Tests E2E (Playwright)
```javascript
// tests/e2e/auth.spec.js
test('should login with Discord', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('text=Se connecter');
  // Mock Discord OAuth...
  await expect(page.locator('.user-menu')).toBeVisible();
});

// tests/e2e/review.spec.js
test('should create review', async ({ page }) => {
  // Login first...
  await page.goto('/editor');
  await page.click('text=Fleur');
  // Fill form...
  await page.click('text=Générer');
  await expect(page.locator('.review-output')).toBeVisible();
});
```

### 6.4 Tests Unitaires (Vitest)
```javascript
// client/src/components/ui/Button.test.jsx
import { render, fireEvent } from '@testing-library/react';
import Button from './Button';

test('should call onClick', () => {
  const handleClick = vi.fn();
  const { getByText } = render(<Button onClick={handleClick}>Click</Button>);
  fireEvent.click(getByText('Click'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Livrables Phase 6
- [ ] API client configuré
- [ ] React Query setup (cache)
- [ ] Zustand stores implémentés
- [ ] 10+ tests E2E passants
- [ ] Couverture tests unitaires >70%

---

## Phase 7️⃣ : Optimisations & Polish (Jour 16-17)

### 7.1 Performance
```javascript
// Lazy loading routes
const Editor = lazy(() => import('./pages/Editor'));
const Gallery = lazy(() => import('./pages/Gallery'));

// Image optimization
<img loading="lazy" ... />

// Bundle analysis
npm run build -- --analyze
```

### 7.2 SEO & Meta Tags
```jsx
// client/src/components/SEO.jsx
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, image }) {
  return (
    <Helmet>
      <title>{title} | Reviews Maker</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:image" content={image} />
    </Helmet>
  );
}
```

### 7.3 Animations & Micro-interactions
```jsx
// Framer Motion variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

<motion.div variants={fadeInUp} transition={{ duration: 0.3 }}>
  {content}
</motion.div>
```

### 7.4 Accessibilité (a11y)
```jsx
// ARIA labels
<button aria-label="Fermer modal">×</button>

// Focus management
const modalRef = useRef();
useEffect(() => {
  modalRef.current?.focus();
}, []);

// Keyboard navigation
onKeyDown={(e) => {
  if (e.key === 'Escape') closeModal();
}}
```

### Livrables Phase 7
- [ ] Lighthouse score >90
- [ ] Bundle size optimisé (<200KB gzip)
- [ ] Images lazy-loaded
- [ ] Meta tags configurés
- [ ] ARIA labels ajoutés
- [ ] Keyboard navigation OK

---

## Phase 8️⃣ : Déploiement (Jour 18-19)

### 8.1 Configuration CI/CD
**Fichier** : `.github/workflows/deploy.yml`

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install dependencies
        run: |
          cd client && npm ci
          cd ../server && npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Build frontend
        run: cd client && npm run build
      
      - name: Deploy to VPS
        run: |
          # SSH deploy script
          ./scripts/deploy-to-vps.sh
```

### 8.2 Configuration VPS
```bash
# Sur le VPS
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
sudo npm install -g pm2

# 3. Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/reviews-maker

# Configuration Nginx
server {
    listen 80;
    server_name reviews-maker.fr;
    
    # Frontend (SPA)
    location / {
        root /var/www/reviews-maker/client/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    # In normal deployment (hosted at root)
    # Match /api/* and proxy to backend. Using '^~' ensures this prefix wins over regex locations
    location ^~ /api {
        proxy_pass http://localhost:3000;
      # Add original request URI for debugging and to track rewrites
      proxy_set_header X-Original-Uri $request_uri;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    # If you serve the app under a subpath like /reviews (eg. https://host/reviews),
    # proxy /reviews/api/* to the backend and leave the rest to the SPA.
    location /reviews/api {
      rewrite ^/reviews/api/(.*)$ /api/$1 break;
      proxy_pass http://localhost:3000;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
}

# 4. Activer & recharger
sudo ln -s /etc/nginx/sites-available/reviews-maker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 5. SSL avec Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d reviews-maker.fr
```

### 8.3 Variables d'Environnement Production
```bash
# server/.env.production
DATABASE_URL="file:/var/www/reviews-maker/db/reviews.sqlite"
DISCORD_CLIENT_ID="..."
DISCORD_CLIENT_SECRET="..."
DISCORD_REDIRECT_URI="https://reviews-maker.fr/auth/discord/callback"
RESEND_API_KEY="..."
NODE_ENV="production"
PORT=3000
SESSION_SECRET="..." # générer avec: openssl rand -hex 32
# FRONTEND & API
FRONTEND_URL="https://reviews-maker.fr"
VITE_API_BASE=/api
BASE_PATH=
SESSION_SECURE=true
CORS_ORIGIN="https://reviews-maker.fr"
```

### 8.4 PM2 Ecosystem
**Fichier** : `ecosystem.config.cjs`

```javascript
module.exports = {
  apps: [{
    name: 'reviews-backend',
    script: './server-new/server.js',
    cwd: '/var/www/reviews-maker',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }],
};
```

### 8.5 Script de Déploiement
**Fichier** : `scripts/deploy-to-vps.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Déploiement Reviews Maker"

# 1. Build local
cd client
npm run build
cd ..

# 2. Upload vers VPS
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'db' \
  ./ user@vps:/var/www/reviews-maker/

# 3. Install dependencies sur VPS
ssh user@vps << 'EOF'
  cd /var/www/reviews-maker/server
  npm ci --production
  npx prisma generate
  npx prisma migrate deploy
  pm2 restart reviews-maker
EOF

echo "✅ Déploiement terminé"
```

### Livrables Phase 8
- [ ] CI/CD configuré (GitHub Actions)
- [ ] VPS configuré (Nginx + PM2)
- [ ] SSL actif (HTTPS)
- [ ] Domaine configuré
- [ ] Monitoring actif (PM2)
- [ ] Backups automatiques configurés

---

## Phase 9️⃣ : Migration Utilisateurs (Jour 20)

### 9.1 Communication Utilisateurs
```markdown
# Email aux utilisateurs existants

Sujet : [Action requise] Nouvelle version de Reviews Maker 🎉

Bonjour !

Reviews Maker fait peau neuve ! Pour continuer à accéder à vos reviews, 
reconnectez-vous simplement avec Discord.

🔗 https://reviews-maker.fr

Vos reviews sont sauvegardées et vous les retrouverez après connexion.

L'équipe Reviews Maker
```

### 9.2 Réconciliation Comptes
```javascript
// Lors du premier login Discord après migration
async function reconcileAccount(discordUser) {
  // Chercher utilisateur migré par Discord ID
  const existingUser = await prisma.user.findUnique({
    where: { discordId: discordUser.id },
  });
  
  if (existingUser) {
    // Mettre à jour email et infos
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        email: discordUser.email,
        discordUsername: discordUser.username,
        discordAvatar: discordUser.avatar,
        lastLogin: new Date(),
      },
    });
    return existingUser;
  }
  
  // Nouveau utilisateur
  return prisma.user.create({
    data: { /* ... */ },
  });
}
```

### Livrables Phase 9
- [ ] Email migration envoyé
- [ ] Système réconciliation actif
- [ ] Support utilisateurs en place
- [ ] FAQ migration publiée

---

## Phase 🔟 : Monitoring & Maintenance (Ongoing)

### 10.1 Monitoring
```bash
# PM2 monitoring
pm2 monit

# Logs
pm2 logs reviews-maker

# Status
pm2 status
```

### 10.2 Backups Automatiques
```bash
# Crontab sur VPS
0 2 * * * /var/www/reviews-maker/scripts/daily-backup.sh

# daily-backup.sh
#!/bin/bash
BACKUP_DIR="/var/backups/reviews-maker"
DATE=$(date +%Y-%m-%d)

mkdir -p $BACKUP_DIR
tar czf $BACKUP_DIR/backup-$DATE.tar.gz \
  /var/www/reviews-maker/db/

# Garder 30 derniers jours
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +30 -delete
```

### 10.3 Métriques à Suivre
```javascript
// server/src/middleware/metrics.js
import prometheus from 'prom-client';

const requestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

// Exposer /metrics pour Grafana
```

### Livrables Phase 10
- [ ] PM2 monitoring actif
- [ ] Backups quotidiens configurés
- [ ] Alertes configurées (uptime, errors)
- [ ] Dashboard métriques (optionnel)

---

## 📋 Checklist Finale

### Avant Mise en Production
- [ ] Tous les tests passent (E2E + unitaires)
- [ ] Backup complet effectué
- [ ] Variables d'environnement configurées
- [ ] SSL actif et valide
- [ ] Monitoring opérationnel
- [ ] Documentation à jour
- [ ] Performance validée (Lighthouse >90)
- [ ] Sécurité auditée (dépendances, CORS, CSP)

### Après Mise en Production
- [ ] Migration données vérifiée
- [ ] Users peuvent se connecter
- [ ] Reviews visibles et éditables
- [ ] Images chargent correctement
- [ ] Email notifications fonctionnent
- [ ] Pas d'erreurs JS console
- [ ] Logs serveur normaux

---

## 🆘 Plan de Rollback

En cas de problème critique :

```bash
# 1. Arrêter nouveau serveur
pm2 stop reviews-maker

# 2. Restaurer ancien code
cd /var/www/reviews-maker
git checkout prod/from-vps-2025-10-28

# 3. Restaurer DB
cp /var/backups/reviews-maker/backup-YYYY-MM-DD.tar.gz .
tar xzf backup-YYYY-MM-DD.tar.gz

# 4. Redémarrer ancien serveur
pm2 restart reviews-maker-legacy

# 5. Communiquer aux users
```

---

**Dernière mise à jour** : 3 novembre 2025  
**Statut** : 📋 Prêt pour exécution
