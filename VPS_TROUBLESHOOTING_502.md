# VPS Troubleshooting: 502 Bad Gateway Error

The deployment completed successfully, but the backend is still returning 502 errors. PM2 shows the process as "online" but it's not actually handling requests.

## Immediate Actions

Since you're on the VPS shell, run these commands to diagnose:

### 1. First, pull the latest fix (test file import issue)
```bash
cd ~/Reviews-Maker
git pull origin refactor/project-structure
```

### 2. Check PM2 Error Logs
```bash
# View last 50 lines of error log
pm2 logs reviews-maker --err --lines 50

# Or check directly
tail -50 /home/ubuntu/Reviews-Maker/logs/pm2-error.log
```

Look for any `SyntaxError`, `ImportError`, or module loading issues.

### 3. Check the Backend Process Status
```bash
# Check if process is actually running
pm2 status
pm2 describe reviews-maker

# Check current memory and CPU
ps aux | grep reviews-maker
```

### 4. Test the Backend Locally on VPS
```bash
# Try to connect to the backend directly (if it's listening on localhost)
curl -I http://localhost:5000/api/auth/me 2>&1

# Or check if the port is listening
netstat -tuln | grep 5000
# Or for newer systems:
ss -tuln | grep 5000
```

### 5. Manual Backend Test
```bash
# Stop PM2 and try running the server directly to see real errors
pm2 stop reviews-maker

# Navigate to server directory
cd ~/Reviews-Maker/server-new

# Try running the server directly (you'll see errors in the console)
node server.js

# If you see errors, note them down and share them
# To exit: Ctrl+C
```

### 6. Check Environment Variables
```bash
# Make sure .env is present and valid
ls -la ~/Reviews-Maker/server-new/.env
cat ~/Reviews-Maker/server-new/.env | head -20

# Check DATABASE_URL points to correct location
echo "DATABASE_URL: $DATABASE_URL"
```

### 7. Check Database
```bash
# Check if the SQLite database exists and is accessible
ls -la ~/Reviews-Maker/db/reviews.sqlite

# Test basic database connectivity
sqlite3 ~/Reviews-Maker/db/reviews.sqlite ".tables"
```

### 8. Restart Everything
```bash
# First, stop the process
pm2 stop reviews-maker

# Clear the logs
pm2 flush

# Restart with full logs
pm2 restart reviews-maker

# Watch the logs in real-time
pm2 logs reviews-maker
```

### 9. Check nginx Configuration
The 502 error is coming from nginx. It means nginx is running but can't reach the backend.

```bash
# Check if nginx is running
sudo systemctl status nginx
sudo service nginx status

# Check nginx error logs
tail -50 /var/log/nginx/error.log

# Check nginx config
cat /etc/nginx/sites-available/default | grep -A 10 "upstream reviews-maker"
# Or wherever your config is, possibly:
cat /etc/nginx/sites-enabled/terpologie.conf | grep -A 10 "upstream"
```

### 10. Check What Port the Backend Should Use
```bash
# Check PM2 ecosystem config
cat ~/Reviews-Maker/ecosystem.config.cjs | grep -i "port\|listen"

# Or in .env
cat ~/Reviews-Maker/server-new/.env | grep PORT
```

## Most Likely Issues & Fixes

### Issue 1: Backend Starts But Then Crashes
**Symptom**: PM2 shows "online" but no requests reach it

**Check**:
```bash
pm2 logs reviews-maker --err --lines 100
```

**Look for**: 
- Module import errors
- Database connection errors
- Port already in use

**Fix if it's a module error**:
```bash
cd ~/Reviews-Maker/server-new
npm install
cd ~/Reviews-Maker
./deploy.sh
```

### Issue 2: Port Not Listening
**Check**:
```bash
netstat -tuln | grep 5000
ss -tuln | grep 5000
lsof -i :5000
```

**Fix**: 
- Check `.env` for correct PORT setting
- Make sure nothing else is using the port
- Restart PM2: `pm2 restart reviews-maker`

### Issue 3: nginx Can't Reach Backend
**Check nginx config**:
```bash
# Find the nginx config
sudo find /etc/nginx -name "*.conf" -type f | xargs grep -l "reviews-maker\|5000"

# Check the upstream definition
sudo cat /etc/nginx/sites-available/default
```

**Expected**: Should have something like:
```
upstream reviews-maker {
    server 127.0.0.1:5000;  # or your actual port
}
```

**Fix**:
- Update upstream if port changed
- Reload nginx: `sudo systemctl reload nginx`

### Issue 4: Database Issues
**Check**:
```bash
# Test database
sqlite3 ~/Reviews-Maker/db/reviews.sqlite "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"

# Run migrations
cd ~/Reviews-Maker/server-new
npm run prisma:migrate
npm run prisma:generate
```

## Step-by-Step Recovery

If nothing above works, try this complete recovery:

```bash
# 1. Stop everything
cd ~/Reviews-Maker
pm2 stop reviews-maker
pm2 delete reviews-maker

# 2. Clean dependencies
rm -rf server-new/node_modules
rm server-new/package-lock.json

# 3. Pull latest code
git fetch origin
git reset --hard origin/refactor/project-structure

# 4. Reinstall
cd server-new
npm install

# 5. Generate Prisma
npm run prisma:generate

# 6. Run migrations
npm run prisma:migrate

# 7. Start manually to see errors
node server.js

# If it works (no errors), stop it (Ctrl+C) and restart with PM2
# If it errors, copy the error and troubleshoot

# 8. Start with PM2
cd ~/Reviews-Maker
pm2 start ecosystem.config.cjs --name reviews-maker

# 9. Check status
pm2 status
pm2 logs reviews-maker --lines 50
```

## Getting Help

When you run into issues, gather this information:

```bash
# 1. Last 100 error lines
pm2 logs reviews-maker --err --lines 100 > /tmp/pm2-error.txt

# 2. PM2 status
pm2 status > /tmp/pm2-status.txt

# 3. Current branch and commits
cd ~/Reviews-Maker && git log --oneline -5 > /tmp/git-log.txt

# 4. Environment check
echo "Node: $(node --version)" > /tmp/env.txt
echo "npm: $(npm --version)" >> /tmp/env.txt
echo "PORT: $PORT" >> /tmp/env.txt
echo "DATABASE_URL: $DATABASE_URL" >> /tmp/env.txt

# Copy these files to share
cat /tmp/pm2-error.txt
cat /tmp/pm2-status.txt
cat /tmp/git-log.txt
cat /tmp/env.txt
```

## Recent Commits to Test

If the above doesn't work, test each fix individually:

```bash
git log --oneline -10
```

You should see:
- `0381e28` - fix: Remove non-existent requireAccountType import from test file
- `7c3cf7b` - fix: Update deploy script to use refactor/project-structure branch
- `68cee17` - fix: Correct import sources for auth and permissions middleware
- `21728cf` - chore: Resolve merge conflict
- `decf384` - fix: Add missing permission middleware functions

Each commit should work independently. If one specific commit breaks things, we can revert it:

```bash
git revert <commit-hash>
pm2 restart reviews-maker
```

---

**Next Steps**: Run the diagnostics above and share the output, and we can pinpoint exactly what's causing the 502 error!
