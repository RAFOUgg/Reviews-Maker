# 🚀 MVP1 Local Setup & Development Environment

**Goal:** Get fully functional local dev environment in 15 minutes

---

## ✅ Prerequisites

```bash
node --version    # Should be 18+ (current: 20.11.0)
npm --version     # Should be 9+
git --version     # Should be 2.40+
```

---

## 📦 Step 1: Clone & Install Dependencies

```bash
# Clone repo (if not already done)
git clone https://github.com/RAFOUgg/Reviews-Maker.git
cd Reviews-Maker

# Ensure on dev branch
git checkout dev/integrate-latest
git pull origin dev/integrate-latest

# Install frontend dependencies
cd client
npm install

# Install backend dependencies (new terminal)
cd server-new
npm install

# Return to root
cd ../..
```

**Expected output:** No errors, all packages installed

---

## 🔧 Step 2: Environment Setup

### Backend Configuration

```bash
cd server-new

# Copy example env
cp .env.example .env  # Or create .env manually

# Edit .env with your config
cat > .env << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# Server
PORT=3001
NODE_ENV=development

# OAuth (use test apps from GitHub OAuth settings)
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
# ... other OAuth providers

# Session
SESSION_SECRET=dev-secret-key-12345

# Payment (will use bypass for MVP1)
PAYMENT_BYPASS=true
STRIPE_SECRET=dev-key (optional for MVP1)

# File uploads
UPLOAD_MAX_SIZE=52428800  # 50MB

# Email (optional for MVP1)
SMTP_HOST=localhost
SMTP_PORT=1025
EOF
```

### Frontend Configuration

```bash
cd ../../client

# Check .env or vite.config.js
# Ensure API points to localhost:3001
cat vite.config.js | grep -A5 "proxy"

# Should have:
# proxy: { '/api': 'http://localhost:3001' }
```

---

## 🗄️ Step 3: Database Setup

```bash
cd server-new

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed test data
npm run prisma:seed

# Open Prisma Studio to inspect DB
npm run prisma:studio
# Opens http://localhost:5555 - see database content
```

**Expected:** Database created at `server-new/dev.db`

---

## 🏃 Step 4: Start Development Servers

### Terminal 1: Backend

```bash
cd server-new
npm run dev

# Expected output:
# [nodemon] starting `node --watch server.js`
# Server running on http://localhost:3001
```

### Terminal 2: Frontend

```bash
cd client
npm run dev

# Expected output:
# ✓ 292 modules transformed.
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### Terminal 3: Git/Development

```bash
cd Reviews-Maker  # Root directory
# Use this for git commands, scripts, etc
```

---

## ✨ Step 5: Verify Setup

### Check Connectivity

```bash
# Terminal 3 (or new terminal)

# Test backend health
curl http://localhost:3001/api/health

# Test frontend loads
curl http://localhost:5173/ | head -20

# Expected: HTML response (no errors)
```

### Open in Browser

```
Frontend: http://localhost:5173
Backend: http://localhost:3001
Prisma Studio: http://localhost:5555
```

---

## 🎯 Step 6: Start Development

### Pick a Feature

```bash
# List all 15 features
./mvp1-dev.sh list-features

# Start Feature 1
./mvp1-dev.sh start-feature 1

# You're now on: feat/backend-normalize-account-types
git branch --show-current
```

### Development Workflow

```bash
# 1. Make changes
# (Edit code in VS Code)

# 2. Test locally
# - Check browser for UI changes (reload)
# - Check backend logs for API changes
# - Run curl commands to test endpoints

# 3. Commit regularly
./mvp1-dev.sh commit "feat(backend): Normalize account types to strings"

# 4. Push when ready
./mvp1-dev.sh push

# 5. Create PR on GitHub
# (Link will be printed)
```

---

## 🧪 Testing Locally

### Run Tests (if available)

```bash
cd client
npm run test  # Frontend tests

cd ../server-new
npm run test  # Backend tests
```

### Manual Testing

#### Test Backend Permissions
```bash
# Start fresh with clean DB
cd server-new
rm dev.db && npm run prisma:migrate && npm run prisma:seed

# Restart backend
npm run dev
```

#### Test Frontend Tier System
```bash
# Login as Amateur
# - Verify can see sections (no Pipeline Culture)
# - Verify export limited to PNG/JPEG/PDF 150DPI

# Login as Influenceur
# - Verify see more sections
# - Verify export 300DPI + SVG

# Login as Producteur
# - Verify full access
# - Verify all export formats
```

---

## 🐛 Common Issues & Fixes

### Issue: `DATABASE_URL not set`
**Fix:** Check `.env` file exists with `DATABASE_URL` set

### Issue: `EADDRINUSE: address already in use :::3001`
**Fix:** Another process using port 3001
```bash
# Kill the process
lsof -i :3001  # Find process
kill -9 <PID>   # Kill it
# Or change PORT in .env
```

### Issue: `Cannot find module 'react'`
**Fix:** Dependencies not installed
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS errors in browser console
**Fix:** Vite proxy not configured
```bash
# Check vite.config.js
cat vite.config.js | grep -A10 "proxy"

# Should have:
# server: { proxy: { '/api': 'http://localhost:3001' } }
```

### Issue: Prisma schema out of sync
**Fix:** Regenerate Prisma client
```bash
cd server-new
npm run prisma:generate
npm run prisma:migrate
```

---

## 📊 Development Checklist

Before starting each feature:

- [ ] On correct branch: `git branch --show-current`
- [ ] Backend running: `npm run dev` (Terminal 1)
- [ ] Frontend running: `npm run dev` (Terminal 2)
- [ ] Database exists: Check Prisma Studio
- [ ] No console errors: Check both terminals
- [ ] Cahier des charges reference open
- [ ] PHASE1_CHECKLIST.md for feature tasks

---

## 🔄 Syncing with Remote

If others push updates:

```bash
# On your feature branch
./mvp1-dev.sh sync

# Or manually
git fetch origin
git pull origin dev/integrate-latest
git rebase dev/integrate-latest  # If on feature branch
```

---

## 📚 Useful Commands

```bash
# Git
git status                    # Current status
git log --oneline -10        # Recent commits
git diff                     # See changes
git stash                    # Temporarily save changes

# Node
npm run dev                  # Start dev server
npm test                     # Run tests
npm run build                # Build for prod

# Database
npm run prisma:studio        # Open DB UI
npm run prisma:migrate       # Run migrations
npm run prisma:generate      # Regenerate client

# Development helper
./mvp1-dev.sh help           # Show commands
```

---

## ✅ You're Ready!

When all steps complete:

1. ✅ Dependencies installed
2. ✅ Environment configured
3. ✅ Database ready
4. ✅ Servers running
5. ✅ Feature branch created
6. ✅ Ready to code

**Next:** Pick Feature 1 from PHASE1_CHECKLIST.md and start coding!

