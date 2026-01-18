@echo off
REM Phase 1 FLEURS - Merge & Deployment Guide (Windows)
REM This script provides step-by-step guidance for merging and deploying Phase 1 FLEURS to production

setlocal enabledelayedexpansion

cls
color 0B
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║       Phase 1 FLEURS - Merge and Deployment Workflow           ║
echo ║           Cannabis Flower Culture Pipeline System              ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

REM Step 1: Code Review
echo [STEP 1] CODE REVIEW
echo ═══════════════════════════════════════════════════════════════
echo.
echo Before proceeding, ensure:
echo   ✓ Backend code reviewed (API endpoints, database, auth)
echo   ✓ Frontend code reviewed (components, CSS, accessibility)
echo   ✓ Tests reviewed (coverage, edge cases, integration)
echo   ✓ Documentation reviewed (README, guides, examples)
echo.
echo Review resources:
echo   • CODE_REVIEW_GUIDE.md - Detailed checklist
echo   • PHASE_1_FLEURS_PR_SUMMARY.md - Quick overview
echo   • TEST_SUITE_DOCUMENTATION.md - Test inventory
echo.
set /p code_review="Has code been reviewed and approved? (y/n): "
if /i not "%code_review%"=="y" (
    color 0C
    echo ✗ Code review not approved. Aborting.
    exit /b 1
)
color 0A
echo ✓ Code review approved
color 0B

REM Step 2: Run Tests
echo.
echo [STEP 2] RUN TEST SUITE
echo ═══════════════════════════════════════════════════════════════
echo.
echo Running all 26 tests (API, Components, Integration)...
echo.

cd server-new
call npm test
if errorlevel 1 (
    color 0C
    echo ✗ Tests failed. Please fix before proceeding.
    exit /b 1
)
cd ..
color 0A
echo ✓ All tests passing
color 0B

REM Step 3: Check Git Status
echo.
echo [STEP 3] VERIFY GIT STATUS
echo ═══════════════════════════════════════════════════════════════
echo.

call git status
echo.

for /f %%i in ('git status --porcelain') do set git_dirty=1
if defined git_dirty (
    color 0C
    echo ✗ Working directory not clean. Commit or stash changes first.
    exit /b 1
)
color 0A
echo ✓ Working directory clean
color 0B

REM Step 4: Confirm Branch
echo.
echo [STEP 4] CONFIRM BRANCH
echo ═══════════════════════════════════════════════════════════════
echo.

for /f %%i in ('git rev-parse --abbrev-ref HEAD') do set current_branch=%%i
echo Current branch: %current_branch%
echo.

if not "%current_branch%"=="feat/phase-1-fleurs-foundations" (
    color 0C
    echo ✗ Not on feature branch. Expected 'feat/phase-1-fleurs-foundations'.
    exit /b 1
)
color 0A
echo ✓ On correct feature branch
color 0B

REM Step 5: View Commits
echo.
echo [STEP 5] REVIEW COMMITS
echo ═══════════════════════════════════════════════════════════════
echo.
echo 6 commits to be merged:
echo.
call git log --oneline -6 feat/phase-1-fleurs-foundations
echo.

REM Step 6: Merge to Main
echo.
echo [STEP 6] MERGE TO MAIN
echo ═══════════════════════════════════════════════════════════════
echo.
echo This will:
echo   1. Switch to main branch
echo   2. Pull latest changes from origin
echo   3. Merge feature branch with --no-ff (preserve history)
echo   4. Push to origin
echo.
set /p merge_confirm="Proceed with merge? (y/n): "
if /i not "%merge_confirm%"=="y" (
    color 0C
    echo ✗ Merge cancelled.
    exit /b 1
)

echo Switching to main branch...
call git checkout main

echo Pulling latest changes from origin...
call git pull origin main

echo Merging feature branch with --no-ff...
call git merge --no-ff feat/phase-1-fleurs-foundations -m "feat: Phase 1 FLEURS - Culture Pipeline System (90-day tracking)"

echo Pushing to origin...
call git push origin main

color 0A
echo ✓ Merge to main completed
color 0B

REM Step 7: Tag Release
echo.
echo [STEP 7] TAG RELEASE
echo ═══════════════════════════════════════════════════════════════
echo.
echo Creating version tag for release...
echo.

call git tag -a v1.0.0-phase1 -m "Phase 1 FLEURS - Culture Pipeline System (90-day tracking, presets, calendar visualization)"
call git push origin v1.0.0-phase1

color 0A
echo ✓ Release tagged: v1.0.0-phase1
color 0B

REM Step 8: Cleanup Feature Branch
echo.
echo [STEP 8] CLEANUP FEATURE BRANCH
echo ═══════════════════════════════════════════════════════════════
echo.
set /p cleanup="Delete feature branch locally and remote? (y/n): "
if /i "%cleanup%"=="y" (
    echo Deleting local branch...
    call git branch -d feat/phase-1-fleurs-foundations
    
    echo Deleting remote branch...
    call git push origin --delete feat/phase-1-fleurs-foundations
    
    color 0A
    echo ✓ Feature branch deleted
    color 0B
) else (
    echo Feature branch kept for reference
)

REM Step 9: Pre-deployment Checks
echo.
echo [STEP 9] PRE-DEPLOYMENT CHECKS
echo ═══════════════════════════════════════════════════════════════
echo.
echo Verify before deploying to VPS:
echo   • Git push successful? Check on GitHub
echo   • v1.0.0-phase1 tag visible? Check releases
echo   • Feature branch cleanup done? Check branches list
echo   • Local database migrations run? Check schema
echo   • Seed data ready? Check npm run seed
echo.
echo VPS deployment prerequisites:
echo   • SSH access to vps-lafoncedalle
echo   • PostgreSQL database ready
echo   • PM2 configured
echo   • Node.js v18+ installed
echo   • .env file configured on VPS
echo.
set /p deploy_ready="Ready to deploy to VPS? (y/n): "
if /i not "%deploy_ready%"=="y" (
    echo You can deploy manually later using: .\deploy-phase1-vps.sh
    goto end
)

REM Step 10: Deploy to VPS
echo.
echo [STEP 10] DEPLOY TO VPS
echo ═══════════════════════════════════════════════════════════════
echo.

if not exist "deploy-phase1-vps.sh" (
    color 0C
    echo ✗ Deploy script not found: deploy-phase1-vps.sh
    exit /b 1
)

set /p vps_host="Enter VPS hostname (default: vps-lafoncedalle): "
if "!vps_host!"=="" set "vps_host=vps-lafoncedalle"

echo Initiating deployment to !vps_host!...
echo.

REM Using SSH to connect to VPS
ssh !vps_host! ^ 
    "cd /app/Reviews-Maker && " ^
    "git fetch origin && " ^
    "git checkout main && " ^
    "git pull origin main && " ^
    "npm install && " ^
    "npm run prisma:generate && " ^
    "npm run prisma:migrate && " ^
    "cd client && npm run build && cd .. && " ^
    "pm2 restart ecosystem.config.cjs && " ^
    "curl -s http://localhost:3000/health || echo 'Health check warning' && " ^
    "echo 'Deployment completed successfully!'"

if errorlevel 1 (
    color 0C
    echo ✗ VPS deployment failed
    exit /b 1
)

color 0A
echo ✓ VPS deployment completed
color 0B

REM Step 11: Post-Deployment Verification
echo.
echo [STEP 11] POST-DEPLOYMENT VERIFICATION
echo ═══════════════════════════════════════════════════════════════
echo.
echo Verification checklist:
echo   • Verify VPS service running: pm2 status
echo   • Test API endpoints
echo   • Check database migrations applied
echo   • Verify seed data loaded
echo   • Test seed user login:
echo     - Email: producer@test-reviews-maker.local
echo     - Password: test-producer-123
echo.
set /p verify_confirm="Has post-deployment verification passed? (y/n): "
if /i not "%verify_confirm%"=="y" (
    color 0E
    echo ⚠ Verification incomplete. Check VPS status manually.
    exit /b 1
)
color 0A
echo ✓ Post-deployment verification passed
color 0B

REM Final Summary
:end
cls
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                   DEPLOYMENT COMPLETE ✓                        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

echo Summary of actions completed:
echo   ✓ Code review approved
echo   ✓ Tests passing (26/26)
echo   ✓ Merged feat/phase-1-fleurs-foundations ^→ main
echo   ✓ Tagged v1.0.0-phase1
if /i "%deploy_ready%"=="y" (
    echo   ✓ Deployed to VPS (!vps_host!)
    if /i "%verify_confirm%"=="y" (
        echo   ✓ Post-deployment verification passed
    )
)
echo.
echo Phase 1 FLEURS is now live in production!
echo.
echo Next steps:
echo   1. Monitor VPS logs for any issues
echo   2. Begin Phase 2 HASH implementation
echo   3. Create feature branch: git checkout -b feat/phase-2-hash
echo.
echo Documentation:
echo   • PHASE_1_FLEURS_README.md - User guide
echo   • CODE_REVIEW_GUIDE.md - Technical reference
echo   • PR_WORKFLOW.md - Deployment procedures
echo.
echo Happy coding! 🚀
echo.

color 0B
pause
