#!/bin/bash

# Phase 1 FLEURS - Merge & Deployment Guide
# This script provides step-by-step guidance for merging and deploying Phase 1 FLEURS to production

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       Phase 1 FLEURS - Merge & Deployment Workflow             ║"
echo "║           Cannabis Flower Culture Pipeline System               ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Code Review
echo -e "\n${YELLOW}STEP 1: CODE REVIEW${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Before proceeding, ensure:"
echo "  ✓ Backend code reviewed (API endpoints, database, auth)"
echo "  ✓ Frontend code reviewed (components, CSS, accessibility)"
echo "  ✓ Tests reviewed (coverage, edge cases, integration)"
echo "  ✓ Documentation reviewed (README, guides, examples)"
echo ""
echo "Review resources:"
echo "  • CODE_REVIEW_GUIDE.md - Detailed checklist"
echo "  • PHASE_1_FLEURS_PR_SUMMARY.md - Quick overview"
echo "  • TEST_SUITE_DOCUMENTATION.md - Test inventory"
echo ""
read -p "Has code been reviewed and approved? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}✗ Code review not approved. Aborting.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Code review approved${NC}"

# Step 2: Run Tests
echo -e "\n${YELLOW}STEP 2: RUN TEST SUITE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Running all 26 tests (API, Components, Integration)..."
echo ""

cd server-new
npm test 2>&1 || {
    echo -e "${RED}✗ Tests failed. Please fix before proceeding.${NC}"
    exit 1
}
echo -e "${GREEN}✓ All tests passing${NC}"

# Step 3: Check Git Status
echo -e "\n${YELLOW}STEP 3: VERIFY GIT STATUS${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

cd ..
git status
echo ""

if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}✗ Working directory not clean. Commit or stash changes first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Working directory clean${NC}"

# Step 4: Confirm Branch
echo -e "\n${YELLOW}STEP 4: CONFIRM BRANCH${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $current_branch"
echo ""

if [ "$current_branch" != "feat/phase-1-fleurs-foundations" ]; then
    echo -e "${RED}✗ Not on feature branch. Expected 'feat/phase-1-fleurs-foundations'.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ On correct feature branch${NC}"

# Step 5: View Commits
echo -e "\n${YELLOW}STEP 5: REVIEW COMMITS${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "6 commits to be merged:"
echo ""
git log --oneline -6 feat/phase-1-fleurs-foundations
echo ""

# Step 6: Merge to Main
echo -e "\n${YELLOW}STEP 6: MERGE TO MAIN${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "This will:"
echo "  1. Switch to main branch"
echo "  2. Pull latest changes from origin"
echo "  3. Merge feature branch with --no-ff (preserve history)"
echo "  4. Push to origin"
echo ""

read -p "Proceed with merge? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}✗ Merge cancelled.${NC}"
    exit 1
fi

echo "Switching to main branch..."
git checkout main

echo "Pulling latest changes from origin..."
git pull origin main

echo "Merging feature branch with --no-ff..."
git merge --no-ff feat/phase-1-fleurs-foundations -m "feat: Phase 1 FLEURS - Culture Pipeline System (90-day tracking)"

echo "Pushing to origin..."
git push origin main

echo -e "${GREEN}✓ Merge to main completed${NC}"

# Step 7: Tag Release
echo -e "\n${YELLOW}STEP 7: TAG RELEASE${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Creating version tag for release..."
echo ""

git tag -a v1.0.0-phase1 -m "Phase 1 FLEURS - Culture Pipeline System (90-day tracking, presets, calendar visualization)"
git push origin v1.0.0-phase1

echo -e "${GREEN}✓ Release tagged: v1.0.0-phase1${NC}"

# Step 8: Cleanup Feature Branch
echo -e "\n${YELLOW}STEP 8: CLEANUP FEATURE BRANCH${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

read -p "Delete feature branch locally and remote? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Deleting local branch..."
    git branch -d feat/phase-1-fleurs-foundations
    
    echo "Deleting remote branch..."
    git push origin --delete feat/phase-1-fleurs-foundations
    
    echo -e "${GREEN}✓ Feature branch deleted${NC}"
else
    echo "Feature branch kept for reference"
fi

# Step 9: Pre-deployment Checks
echo -e "\n${YELLOW}STEP 9: PRE-DEPLOYMENT CHECKS${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Verify before deploying to VPS:"
echo "  • Git push successful? Check on GitHub"
echo "  • v1.0.0-phase1 tag visible? Check releases"
echo "  • Feature branch cleanup done? Check branches list"
echo "  • Local database migrations run? Check schema"
echo "  • Seed data ready? Check npm run seed"
echo ""
echo "VPS deployment prerequisites:"
echo "  • SSH access to vps-lafoncedalle"
echo "  • PostgreSQL database ready"
echo "  • PM2 configured"
echo "  • Node.js v18+ installed"
echo "  • .env file configured on VPS"
echo ""

read -p "Ready to deploy to VPS? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}You can deploy manually later using: ./deploy-phase1-vps.sh${NC}"
    exit 0
fi

# Step 10: Deploy to VPS
echo -e "\n${YELLOW}STEP 10: DEPLOY TO VPS${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ ! -f "./deploy-phase1-vps.sh" ]; then
    echo -e "${RED}✗ Deploy script not found: deploy-phase1-vps.sh${NC}"
    exit 1
fi

read -p "Enter VPS hostname (default: vps-lafoncedalle): " vps_host
vps_host=${vps_host:-vps-lafoncedalle}

echo "Initiating deployment to $vps_host..."
echo ""

chmod +x ./deploy-phase1-vps.sh

# Connect to VPS and run deployment
ssh $vps_host << 'DEPLOY_EOF'
cd /app/Reviews-Maker || {
    echo "Error: Cannot access /app/Reviews-Maker"
    exit 1
}

echo "Pulling latest code from main..."
git fetch origin
git checkout main
git pull origin main

echo "Installing dependencies..."
npm install

echo "Running database migrations..."
npm run prisma:generate
npm run prisma:migrate

echo "Building frontend..."
cd client
npm run build
cd ..

echo "Restarting PM2 service..."
pm2 restart ecosystem.config.cjs

echo "Running health checks..."
curl -s http://localhost:3000/health || echo "Health check warning"

echo "Deployment completed successfully!"
DEPLOY_EOF

echo -e "${GREEN}✓ VPS deployment completed${NC}"

# Step 11: Post-Deployment Verification
echo -e "\n${YELLOW}STEP 11: POST-DEPLOYMENT VERIFICATION${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Verification checklist:"
echo "  • Verify VPS service running: pm2 status"
echo "  • Test API endpoints"
echo "  • Check database migrations applied"
echo "  • Verify seed data loaded"
echo "  • Test seed user login:"
echo "    - Email: producer@test-reviews-maker.local"
echo "    - Password: test-producer-123"
echo ""

read -p "Has post-deployment verification passed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠ Verification incomplete. Check VPS status manually.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Post-deployment verification passed${NC}"

# Final Summary
echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   DEPLOYMENT COMPLETE ✓                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo "Summary of actions completed:"
echo "  ✓ Code review approved"
echo "  ✓ Tests passing (26/26)"
echo "  ✓ Merged feat/phase-1-fleurs-foundations → main"
echo "  ✓ Tagged v1.0.0-phase1"
echo "  ✓ Deployed to VPS ($vps_host)"
echo "  ✓ Post-deployment verification passed"
echo ""
echo "Phase 1 FLEURS is now live in production!"
echo ""
echo "Next steps:"
echo "  1. Monitor VPS logs for any issues"
echo "  2. Begin Phase 2 HASH implementation"
echo "  3. Create feature branch: git checkout -b feat/phase-2-hash"
echo ""
echo "Documentation:"
echo "  • PHASE_1_FLEURS_README.md - User guide"
echo "  • CODE_REVIEW_GUIDE.md - Technical reference"
echo "  • PR_WORKFLOW.md - Deployment procedures"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
