# Stack Technologique - Reviews-Maker

## 📋 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────┐
│  FRONTEND (React Ecosystem)                         │
├─────────────────────────────────────────────────────┤
│  React 18.x              State Management           │
│  Vite (build)            ├─ Zustand 4.x           │
│  TypeScript (partiel)    └─ React Query (future)   │
│  TailwindCSS 3.x                                   │
│  React Router v6         Utilities                  │
│  React i18next           ├─ Axios / Fetch         │
│  Lucide React            ├─ Date-fns              │
│  Export libs             └─ UUID                  │
│  ├─ html-to-image                                 │
│  ├─ jspdf                                         │
│  └─ jszip                                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  BACKEND (Node.js Ecosystem)                        │
├─────────────────────────────────────────────────────┤
│  Node.js 18.x+           Database                   │
│  Express.js 4.x          ├─ SQLite3               │
│  TypeScript (partial)    ├─ Prisma 5.x ORM       │
│                          └─ Better-sqlite3        │
│  Authentication                                    │
│  ├─ Passport.js          Server Utils             │
│  ├─ passport-discord     ├─ Multer (uploads)     │
│  ├─ passport-local       ├─ bcryptjs             │
│  ├─ express-session      ├─ jsonwebtoken         │
│  └─ connect-mongo        ├─ Helmet               │
│                          ├─ express-rate-limit   │
│                          └─ Cors                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  DEVOPS & INFRASTRUCTURE                            │
├─────────────────────────────────────────────────────┤
│  Git / GitHub            Deployment                 │
│  GitHub Actions (CI)     ├─ PM2 (process manager) │
│  Docker (planned)        ├─ Nginx (reverse proxy) │
│                          └─ SSL/TLS              │
│  VPS                                              │
│  ├─ Linux (Ubuntu 20.04)                         │
│  ├─ Node.js 18.x                                 │
│  ├─ Nginx                                        │
│  └─ PM2 Cluster mode                             │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Frontend Stack Détaillé

### Core Framework
| Package | Version | Rôle |
|---------|---------|------|
| `react` | ^18.2.0 | UI library avec hooks |
| `react-dom` | ^18.2.0 | DOM rendering |
| `vite` | ^5.0.0 | Build tool ultra-rapide |
| `typescript` | ^5.0.0 | Typage statique (partiel) |

### Routing & Navigation
| Package | Version | Rôle |
|---------|---------|------|
| `react-router-dom` | ^6.x | Client-side routing |
| `react-router` | ^6.x | Router core |

### State Management
| Package | Version | Rôle |
|---------|---------|------|
| `zustand` | ^4.4.x | Global state (lightweight) |
| `immer` | ^10.x | Immutable state (utilisé via Zustand) |

### Styling & UI
| Package | Version | Rôle |
|---------|---------|------|
| `tailwindcss` | ^3.3.0 | Utility-first CSS |
| `lucide-react` | ^0.x | 300+ icons SVG |
| `postcss` | ^8.x | CSS processing |
| `autoprefixer` | ^10.x | Vendor prefixes |

### Form & Validation
| Package | Version | Rôle |
|---------|---------|------|
| `react-hook-form` | ^7.x | Lightweight form handling |
| `zod` | ^3.x | TypeScript-first validation |

### Internationalization
| Package | Version | Rôle |
|---------|---------|------|
| `i18next` | ^23.x | i18n framework |
| `react-i18next` | ^13.x | React integration |

### Export & Document Generation
| Package | Version | Rôle |
|---------|---------|------|
| `html-to-image` | ^1.11.x | DOM to PNG/JPG/SVG |
| `jspdf` | ^2.5.x | PDF generation |
| `jszip` | ^3.10.x | ZIP file creation |
| `file-saver` | ^2.0.x | Save files client-side |

### Utilities & Helpers
| Package | Version | Rôle |
|---------|---------|------|
| `axios` | ^1.x | HTTP client (ou Fetch API) |
| `date-fns` | ^2.x | Date manipulation |
| `uuid` | ^9.x | UUID generation |
| `clsx` | ^2.x | Conditional classNames |
| `react-hot-toast` | ^2.x | Toast notifications |

### Development Tools
| Package | Version | Rôle |
|---------|---------|------|
| `eslint` | ^8.x | Code linting |
| `prettier` | ^3.x | Code formatting |
| `tailwindcss` | ^3.3.x | CSS generation |

---

## ⚙️ Backend Stack Détaillé

### Core Framework
| Package | Version | Rôle |
|---------|---------|------|
| `express` | ^4.18.x | Web framework |
| `node` | 18.x+ | Runtime |

### Database & ORM
| Package | Version | Rôle |
|---------|---------|------|
| `prisma` | ^5.x | ORM type-safe |
| `@prisma/client` | ^5.x | Prisma client |
| `sqlite3` | ^5.x | SQLite driver |
| `better-sqlite3` | ^9.x | Synchronous SQLite |

### Authentication & Security
| Package | Version | Rôle |
|---------|---------|------|
| `passport` | ^0.7.x | Authentication middleware |
| `passport-discord` | ^0.1.x | Discord OAuth strategy |
| `passport-local` | ^1.0.x | Local strategy (email/password) |
| `bcryptjs` | ^2.4.x | Password hashing |
| `jsonwebtoken` | ^9.x | JWT tokens |
| `express-session` | ^1.17.x | Session management |
| `helmet` | ^7.x | Security headers |
| `express-rate-limit` | ^7.x | Rate limiting |
| `cors` | ^2.8.x | CORS handling |

### File Upload & Storage
| Package | Version | Rôle |
|---------|---------|------|
| `multer` | ^1.4.x | File upload middleware |
| `path` | builtin | Path utilities |
| `fs-extra` | ^11.x | File system utils |

### Server Utilities
| Package | Version | Rôle |
|---------|---------|------|
| `dotenv` | ^16.x | Environment variables |
| `morgan` | ^1.x | HTTP request logger |
| `nodemon` | ^3.x | Dev auto-restart |
| `pm2` | ^5.x | Process manager (prod) |

### API & Data
| Package | Version | Rôle |
|---------|---------|------|
| `express-json-middleware` | - | JSON parsing |
| `body-parser` | ^1.20.x | Request body parsing |

### Validation
| Package | Version | Rôle |
|---------|---------|------|
| `joi` | ^17.x | Data validation |
| `validator` | ^13.x | String validation |

---

## 📦 Dependencies Tree

### Frontend (client/package.json)
```
react 18.x
├── react-dom
├── react-router-dom
│   └── history
├── zustand 4.4.x
├── tailwindcss 3.3.x
├── lucide-react
├── react-i18next
│   └── i18next
├── html-to-image
├── jspdf
├── jszip
├── date-fns
├── uuid
├── axios
├── clsx
└── react-hot-toast
```

### Backend (server-new/package.json)
```
express 4.18.x
├── cors
├── helmet
├── morgan
├── body-parser
├── dotenv
├── express-session
├── express-rate-limit
├── passport 0.7.x
│   ├── passport-discord
│   └── passport-local
├── bcryptjs
├── jsonwebtoken
├── prisma 5.x
│   └── @prisma/client
├── sqlite3
├── multer
├── fs-extra
├── nodemon (dev)
└── pm2 (prod)
```

---

## 🔧 Versions Clés & Compatibilité

### Node.js Requirement
```
Node.js 18.x LTS ou 20.x LTS
npm 9.x+
```

### Browser Support (Frontend)
```
Chrome     95+
Firefox    94+
Safari     15+
Edge       95+
Mobile: iOS Safari 15+, Chrome Android 95+
```

### Database Compatibility
```
SQLite3: Version 3.35+ (full JSON support)
Prisma: Supports SQLite out of the box
```

---

## 📊 Package Statistics

| Catégorie | Nombre | Poids |
|-----------|--------|-------|
| Frontend Dependencies | ~25 | ~45 MB |
| Frontend DevDependencies | ~15 | ~150 MB |
| Backend Dependencies | ~20 | ~50 MB |
| Backend DevDependencies | ~5 | ~100 MB |
| **Total Prod** | ~45 | ~95 MB |
| **Total with node_modules** | - | ~300+ MB |

---

## 🔐 Security Packages

| Package | Version | Rôle |
|---------|---------|------|
| `helmet` | ^7.x | Security headers (HSTS, CSP, etc) |
| `express-rate-limit` | ^7.x | DDoS protection |
| `bcryptjs` | ^2.4.x | Password hashing (bcrypt algorithm) |
| `jsonwebtoken` | ^9.x | Secure token generation |
| `cors` | ^2.8.x | Cross-Origin protection |
| `validator` | ^13.x | Input validation |

---

## 🚀 Performance Packages

| Package | Rôle |
|---------|------|
| `vite` | Fast bundling & HMR |
| `zustand` | Minimal state lib |
| `date-fns` | Tree-shakeable date lib |
| `react-query` | (planned) Query caching |

---

## 🧪 Testing Packages (Future)

```json
{
  "@testing-library/react": "^14.x",
  "@testing-library/jest-dom": "^6.x",
  "vitest": "^0.x",
  "jest": "^29.x",
  "@testing-library/user-event": "^14.x"
}
```

---

## 📦 Installation & Setup

### Frontend
```bash
cd client
npm install
npm run dev        # Vite dev server
npm run build      # Production build
npm run preview    # Preview build
npm run lint       # ESLint check
```

### Backend
```bash
cd server-new
npm install
npm run check-env  # Validate .env
npm run dev        # Nodemon development
npm run build      # Compile (if TypeScript)
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
```

---

## 🔄 Migration & Upgrade Path

### Frontend
- React 18 → 19 (minor changes to hooks)
- Vite 5 → 6 (should be backward compatible)
- TailwindCSS 3 → 4 (CSS variable updates)

### Backend
- Prisma 5 → 6 (check migration guide)
- Express 4 → 5 (breaking changes likely)
- Node 18 → 20 (security updates)

---

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_OAUTH_DISCORD_ID=your_discord_client_id
VITE_APP_NAME=Reviews-Maker
```

### Backend (.env)
```
NODE_ENV=development|production
PORT=3000
DATABASE_URL=file:./reviews.sqlite

# Auth
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_secret
OAUTH_CALLBACK_URL=http://localhost:3000/auth/discord/callback

# File Upload
MAX_FILE_SIZE=10485760 (10MB)
UPLOAD_PATH=./db/review_images

# Email (future)
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=email@example.com
SMTP_PASS=password
```

---

## 🎯 Tech Decisions & Rationale

### React + Vite (vs Next.js)
**Pros**: Simple, fast builds, easy deployment
**Cons**: Manual routing setup

### Zustand (vs Redux)
**Pros**: Minimal boilerplate, easier learning curve
**Cons**: Smaller ecosystem than Redux

### SQLite (vs PostgreSQL)
**Pros**: No server setup, easy deployment
**Cons**: Limited concurrency (not an issue for MVP)

### Prisma (vs Raw SQL)
**Pros**: Type-safe, migrations, excellent DX
**Cons**: Learning curve, slight performance overhead

### TailwindCSS (vs CSS-in-JS)
**Pros**: Fast development, smaller bundle
**Cons**: Utility-first philosophy learning

---

## 🔗 External Services & APIs

| Service | Usage | Status |
|---------|-------|--------|
| Discord OAuth | Authentication | ✅ Active |
| Stripe | Payments (future) | ⏳ Prepared |
| SendGrid | Emails (future) | ⏳ Planned |
| AWS S3 | Image storage (future) | ⏳ Optional |

---

## 📚 Resources & Documentation

- [React Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS](https://tailwindcss.com)
- [Express.js](https://expressjs.com)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Dernière mise à jour**: 13 Jan 2026
