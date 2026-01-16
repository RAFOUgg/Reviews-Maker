# VPS Deployment Commands

## Quick Fix for the Backend 502 Error

The backend fixes are now ready and committed. Run these commands on the VPS:

### Option 1: Run the deploy script (recommended)
```bash
cd ~/Reviews-Maker
./deploy.sh
```

The script will now automatically use the `refactor/project-structure` branch where all the fixes are.

### Option 2: Manual deployment steps

If you're already on the VPS, run these commands one by one:

```bash
# Navigate to the project
cd ~/Reviews-Maker

# Fetch latest from GitHub
git fetch origin

# Switch to the correct branch
git checkout refactor/project-structure

# Reset to latest remote state
git reset --hard origin/refactor/project-structure

# Check status
git status
git log --oneline -3

# Restart PM2
pm2 restart reviews-maker

# Check the logs
pm2 logs reviews-maker --lines 20
```

### What was fixed:

1. ✅ Added missing `ACCOUNT_TYPES` export in `permissions.js`
2. ✅ Added missing permission middleware functions:
   - `canAccessSection`
   - `requireSectionAccess`
   - `requirePhenoHunt`
   - `requireActiveSubscription`
3. ✅ Fixed incorrect imports in `export.js`:
   - Moved `requireAuth` import to correct location (`auth.js`)
   - Removed calls to non-existent middleware functions

### After deployment:

Test the backend is responding:
```bash
curl -I https://terpologie.eu/api/auth/me
```

You should get a 200 or 401 response (not 502).

## Related Commits:

- `7c3cf7b` - fix: Update deploy script to use refactor/project-structure branch by default
- `68cee17` - fix: Correct import sources for auth and permissions middleware in export.js
- `21728cf` - chore: Resolve merge conflict - sync with VPS refactor/project-structure
- `decf384` - fix: Add missing permission middleware functions (with `canAccessSection`, `requireSectionAccess`, etc.)

## If you encounter issues:

1. Check git status: `git status`
2. Check PM2 logs: `pm2 logs reviews-maker --lines 50 --err`
3. Check which branch you're on: `git branch -v`
4. Verify the code compiled: `node -c server-new/server.js` (should output "No syntax errors detected")
