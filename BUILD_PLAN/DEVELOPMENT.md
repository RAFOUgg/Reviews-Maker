# Développement - Reviews-Maker

## 📋 Workflow Développement

### Git Workflow

```bash
# 1. Mise à jour locale
git pull origin main

# 2. Créer branche feature
git checkout -b feat/ma-fonctionnalite

# 3. Coder, tester, committer
git add .
git commit -m "feat: description courte"

# 4. Push et créer PR
git push origin feat/ma-fonctionnalite
# → Créer PR sur GitHub

# 5. Après review + merge
git checkout main
git pull origin main
```

### Nommage Branches

```
feat/nom-feature       # Nouvelles fonctionnalités
fix/nom-bug            # Bug fixes
refactor/nom-change    # Refactoring
docs/nom-doc           # Documentation
style/nom-style        # Formatting
test/nom-test          # Tests
```

### Messages Commits

```
Format: <type>: <description>

Types:
- feat:     Nouvelle fonctionnalité
- fix:      Correction bug
- refactor: Restructuration code
- docs:     Documentation
- style:    Formatage (pas de logique)
- test:     Tests
- chore:    Dépendances, config

Exemples:
✅ feat: ajouter export SVG
✅ fix: corriger bug pipeline drag-drop
✅ refactor: simplifier ReviewForm component
❌ update stuff
❌ fix bug
```

---

## 🏗️ Structure Frontend

### Création d'une Page

```javascript
// pages/MyPage.jsx
import React from 'react';
import Layout from '@/components/layout/Layout';

export default function MyPage() {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1>My Page</h1>
        {/* Content */}
      </div>
    </Layout>
  );
}
```

### Création d'un Composant

```javascript
// components/[category]/MyComponent.jsx
import React from 'react';
import PropTypes from 'prop-types';

export default function MyComponent({ title, onAction }) {
  return (
    <div className="bg-white rounded-lg p-4">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func
};
```

### Création d'un Hook

```javascript
// hooks/useMyLogic.js
import { useState, useCallback } from 'react';

export function useMyLogic() {
  const [state, setState] = useState(null);
  
  const action = useCallback(() => {
    // Logic
    setState(newValue);
  }, []);
  
  return { state, action };
}
```

### Utilisation Zustand Store

```javascript
// store/myStore.js
import { create } from 'zustand';

export const useMyStore = create((set) => ({
  data: [],
  add: (item) => set((state) => ({ data: [...state.data, item] })),
  clear: () => set({ data: [] })
}));

// Dans un composant:
function MyComponent() {
  const { data, add } = useMyStore();
  return <div>{data.length}</div>;
}
```

---

## ⚙️ Structure Backend

### Créer une Route API

```javascript
// routes/myroute.js
const express = require('express');
const router = express.Router();

// GET /api/myroute
router.get('/', async (req, res) => {
  try {
    // Logic
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/myroute
router.post('/', async (req, res) => {
  try {
    const { data } = req.body;
    // Validate
    // Save to DB
    res.json({ id: 123 });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

### Intégrer Route dans Server

```javascript
// server.js
const myRoute = require('./routes/myroute');
app.use('/api/myroute', myRoute);
```

### Créer un Service

```javascript
// services/myService.js
const prisma = require('@prisma/client');

async function createItem(data) {
  return await prisma.item.create({ data });
}

async function getItems() {
  return await prisma.item.findMany();
}

module.exports = { createItem, getItems };
```

### Utiliser Service dans Route

```javascript
// routes/items.js
const { getItems, createItem } = require('../services/itemService');

router.get('/', async (req, res) => {
  const items = await getItems();
  res.json(items);
});

router.post('/', async (req, res) => {
  const item = await createItem(req.body);
  res.json(item);
});
```

---

## 🗄️ Prisma Database

### Modifier Schema

```prisma
// prisma/schema.prisma
model MyModel {
  id       String   @id @default(cuid())
  name     String
  email    String   @unique
  users    User[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Créer Migration

```bash
# Après modification schema.prisma
npm run prisma:migrate -- --name add_mymodel

# Cela crée migration et applique
```

### Seed Données (Optionnel)

```javascript
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const item = await prisma.item.create({
    data: { name: 'Test Item' }
  });
  console.log(item);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```bash
npm run prisma:seed
```

### Query Exemples

```javascript
// Find
const user = await prisma.user.findUnique({ where: { email } });
const users = await prisma.user.findMany();

// Create
const newUser = await prisma.user.create({ data: { email, name } });

// Update
const updated = await prisma.user.update({
  where: { id },
  data: { name: 'New Name' }
});

// Delete
await prisma.user.delete({ where: { id } });

// Relations
const userWithPosts = await prisma.user.findUnique({
  where: { id },
  include: { posts: true }
});
```

---

## 🎨 Frontend Styling

### TailwindCSS Patterns

```jsx
// Spacing
className="p-4 m-2 px-6 py-3"

// Colors
className="bg-blue-500 text-white"

// Responsive
className="w-full md:w-1/2 lg:w-1/3"

// Flexbox
className="flex items-center justify-between gap-4"

// Grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Dark mode
className="dark:bg-slate-900 dark:text-white"
```

### LiquidGlass Components

```jsx
import { LiquidButton, LiquidCard, LiquidSelect } from '@/components/ui';

<LiquidCard>
  <h2>Title</h2>
  <LiquidButton>Click me</LiquidButton>
</LiquidCard>
```

---

## 🔍 Debugging

### Frontend

```javascript
// React DevTools (install extension)
// TailwindCSS IntelliSense

// Logs
console.log('value:', value);
console.table(arrayOfObjects);

// React state logging
import { inspect } from 'react-query/devtools';
```

### Backend

```javascript
// Logs
console.log('Debug:', data);
console.error('Error:', error);

// Prisma Studio
npm run prisma:studio  // GUI database viewer

// Morgan logging
const morgan = require('morgan');
app.use(morgan('dev'));
```

### VS Code Debug

**.vscode/launch.json**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/server-new/server.js",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## 📝 Code Quality

### ESLint

```bash
npm run lint          # Check
npm run lint -- --fix # Auto-fix
```

### Prettier (optional)

```bash
npx prettier --write "src/**/*.jsx"
```

---

## 🧪 Testing (Manual)

### Frontend Testing

1. **Component Rendering**
   ```bash
   npm run dev
   # Visiter http://localhost:5173
   # Vérifier component s'affiche
   ```

2. **User Interaction**
   ```
   Cliquer, remplir forms, vérifier résultats
   ```

3. **Browser DevTools**
   ```
   F12 → Console (check pour erreurs)
   F12 → Network (check API calls)
   F12 → Application → LocalStorage (check state)
   ```

### Backend Testing

1. **API Testing**
   ```bash
   # Utiliser Postman, Insomnia, ou curl
   curl -X GET http://localhost:3000/api/reviews
   curl -X POST http://localhost:3000/api/reviews \
     -H "Content-Type: application/json" \
     -d '{"name":"Test"}'
   ```

2. **Database Testing**
   ```bash
   npm run prisma:studio
   # Vérifier données dans GUI
   ```

3. **Logs**
   ```
   Vérifier terminal backend pour logs/errors
   ```

---

## ⚡ Performance Tips

### Frontend
- **Code Splitting**: Utiliser React.lazy() pour routes
- **Image Optimization**: Compresser images avant upload
- **State**: Minimiser re-renders avec Zustand
- **Debounce**: Pour événements fréquents (typing, scrolling)

### Backend
- **Database Indexes**: Sur UserID, reviewType, etc.
- **Pagination**: Limiter 20 items par page
- **Caching**: Static data (effects.json, etc.)
- **Rate Limiting**: 100 req/min par IP

---

## 🚀 Déploiement Local

```bash
# Build frontend
cd client && npm run build
# → dist/ folder

# Start backend production mode
cd server-new
NODE_ENV=production npm start
```

---

## 📚 Ressources Utiles

- React Patterns: https://react-patterns.com
- Zustand: https://zustand-demo.vercel.app
- Prisma: https://www.prisma.io/docs
- TailwindCSS: https://tailwindcss.com/docs
- Express: https://expressjs.com

---

**Questions?** → Vérifiez [ARCHITECTURE.md](ARCHITECTURE.md)
