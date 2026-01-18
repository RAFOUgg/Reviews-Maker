# Phase 1 FLEURS - Reviews-Maker

## 🌱 Overview

Phase 1 FLEURS implements the complete culture pipeline system for cannabis flower (fleur) product reviews.

**Key Features:**
- 🔄 90-day culture tracking pipeline (jours/semaines/phases modes)
- 📦 9 reusable preset groups (Espace, Substrat, Lumière, etc.)
- 📅 GitHub-style calendar visualization
- 🧪 26 comprehensive tests (API + Components + E2E)
- 🌿 Genetic tree management with PhenoHunt integration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

#### Linux/Mac
```bash
chmod +x setup-phase1-local.sh
./setup-phase1-local.sh
```

#### Windows (PowerShell)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-phase1-local.ps1
```

### Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server-new
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Open: http://localhost:5173

---

## 📋 Test User Credentials

After setup, use these credentials to login:

```
Email: producer@test-reviews-maker.local
Password: test-producer-123
```

Account Tier: **Producteur** (paid - full feature access)

---

## 🧪 Running Tests

```bash
# All tests
npm test

# Specific suite
npm test -- test/routes/pipeline-culture.test.js
npm test -- test/components/CulturePipelineSection.test.jsx
npm test -- test/integration/pipeline-culture.integration.test.js

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

**Test Coverage:**
- **18 API Tests**: CRUD operations, auth, validation
- **5 Component Tests**: React rendering, interactions
- **3 Integration Tests**: End-to-end workflows

See [TEST_SUITE_DOCUMENTATION.md](./TEST_SUITE_DOCUMENTATION.md) for details.

---

## 📁 Project Structure

### Backend
```
server-new/
├── prisma/
│   ├── schema.prisma          # Database models (CultureSetup, Pipeline, PipelineStage)
│   └── migrations/            # Database migration files
├── routes/
│   └── pipeline-culture.js    # 15 API endpoints (CRUD operations)
├── seed-phase1-fleurs.js      # Seed data script
└── server.js                  # Express server
```

### Frontend
```
client/src/
├── components/forms/pipeline/
│   ├── PipelineCalendarView.jsx        # GitHub-style 90-day calendar
│   ├── PipelinePresetSelector.jsx      # 9-group preset modal
│   ├── PipelineConfigModal.jsx         # Data tracking config
│   └── *.css                           # Component styling
├── pages/review/CreateFlowerReview/
│   └── sections/
│       └── CulturePipelineSection.jsx  # SECTION 3 form
└── styles/sections/
    └── CulturePipelineSection.css      # Main styles
```

### Tests
```
test/
├── routes/
│   └── pipeline-culture.test.js        # 18 API unit tests
├── components/
│   └── CulturePipelineSection.test.jsx # 5 component tests
└── integration/
    └── pipeline-culture.integration.test.js # 3 E2E workflows
```

---

## 🔌 API Endpoints

### Culture Setup (Presets)
```
POST   /api/culture-setups              # Create preset
GET    /api/culture-setups              # List presets (with group filter)
PUT    /api/culture-setups/:id          # Update preset
POST   /api/culture-setups/:id/duplicate # Clone preset
DELETE /api/culture-setups/:id          # Delete preset
```

### Pipeline
```
POST   /api/reviews/:reviewId/pipeline  # Create 90-day pipeline
GET    /api/pipelines/:pipelineId       # Get pipeline details
PUT    /api/pipelines/:pipelineId       # Update configuration
```

### Pipeline Stages
```
PUT    /api/pipelines/:pipelineId/stages/:stageId  # Update stage with data
GET    /api/pipelines/:pipelineId/stages           # List stages (with date filter)
```

---

## 📊 Database Schema

### CultureSetup Model
```prisma
model CultureSetup {
  id        String   @id @default(cuid())
  userId    String
  name      String
  group     String   // space, substrate, lighting, nutrients, etc.
  data      Json     // Flexible data storage
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Pipeline Model
```prisma
model Pipeline {
  id        String   @id @default(cuid())
  reviewId  String   @unique
  mode      String   // "jours", "semaines", "phases"
  startDate String
  endDate   String
  config    Json     // tracking preferences
  stages    PipelineStage[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### PipelineStage Model
```prisma
model PipelineStage {
  id         String   @id @default(cuid())
  pipelineId String
  date       String
  dayNumber  Int
  data       Json     // temperature, humidity, notes, etc.
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

---

## 🎨 UI Components

### CulturePipelineSection (SECTION 3)
Main form component with:
- Mode selector (jours/semaines/phases)
- Date range picker
- Preset selector (9 groups)
- Stages management
- Harvest data inputs
- Notes field

### PipelineCalendarView
GitHub-style 90-day calendar:
- 13 weeks × 7 days grid
- Color intensity for data density
- Hover tooltips
- Coverage stats

### PipelinePresetSelector Modal
Choose from 9 preset groups:
1. 🏠 Espace de Culture
2. 🌱 Substrat
3. 💡 Éclairage
4. 🥗 Engrais
5. 🌡️ Environnement
6. 💧 Arrosage
7. ✂️ Palissage/Training
8. 🔥 Curing/Maturation
9. 📊 Suivi/Monitoring

---

## 🔐 Authentication

All endpoints require user authentication via JWT token in header:
```
Authorization: Bearer <token>
```

Tests use mocked authentication with test user context.

---

## 📝 Commit History

Phase 1 FLEURS was implemented in 3 commits:

1. **Commit 1**: Prisma models + database migration + API routes (15 endpoints)
2. **Commit 2**: Frontend components + CSS + component tests
3. **Commit 3**: Integration tests + test documentation + seed data + setup scripts

All commits follow the feature branch workflow (`feat/phase-1-fleurs-foundations`).

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
cd server-new
npx prisma migrate reset

# View database
npx prisma studio
```

### Port Already in Use
```bash
# Change PORT in server-new/.env (default: 3001)
# or kill process on port
# Linux/Mac: lsof -i :3001 | kill -9 <PID>
# Windows: netstat -ano | findstr :3001
```

### Tests Failing
```bash
# Ensure database is clean
npm run test:reset

# Run single test file
npm test -- test/routes/pipeline-culture.test.js
```

---

## 📚 Documentation

- [API Documentation](./server-new/routes/pipeline-culture.js)
- [Component Guide](./client/src/components/forms/pipeline/)
- [Test Suite](./TEST_SUITE_DOCUMENTATION.md)
- [Setup Guide](./DEBUT_LISEZ_MOI.txt)

---

## 🚀 Next Phases

Phase 2 and beyond planned:
- **Phase 2 HASH**: Hash/Kief/ICE production pipeline
- **Phase 3 CONCENTRATE**: BHO/Rosin/Extract production
- **Phase 4 EDIBLES**: Recipe & cooking pipeline
- **Phase 5 GENETICS**: Full PhenoHunt breeding system
- **Phase 6 EXPORTS**: Advanced export templates
- **Phase 7 ANALYTICS**: Dashboard & statistics

---

## 📞 Support

For issues or questions:
1. Check [TEST_SUITE_DOCUMENTATION.md](./TEST_SUITE_DOCUMENTATION.md)
2. Review [CAHIER_DES_CHARGES_V1_MVP_FLEURS.md](./CAHIER_DES_CHARGES_V1_MVP_FLEURS.md)
3. Check error logs in browser console

---

## 📄 License

Reviews-Maker © 2025 - All rights reserved

---

**Built with ❤️ for cannabis cultivation tracking**
