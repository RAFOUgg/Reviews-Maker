# Quick Commands for VPS Recovery

Copy and paste these commands directly into your VPS terminal:

---

## 🔧 **QUICK FIX (Try This First)**

```bash
# Pull the latest fix
cd ~/Reviews-Maker
git pull origin refactor/project-structure

# Restart PM2
pm2 restart reviews-maker

# Watch the logs for 10 seconds
pm2 logs reviews-maker --lines 20
```

---

## 🔍 **Diagnose the Problem**

```bash
# Check PM2 error logs
pm2 logs reviews-maker --err --lines 100
```

If you see any errors, copy them and we can fix them.

---

## 🚀 **Full Recovery (If Quick Fix Doesn't Work)**

```bash
# Stop PM2
pm2 stop reviews-maker

# Go to project
cd ~/Reviews-Maker

# Pull latest code
git fetch origin
git reset --hard origin/refactor/project-structure

# Install dependencies
cd server-new
npm install
cd ..

# Run the deploy script
./deploy.sh

# Check logs
pm2 logs reviews-maker --lines 50
```

---

## 📊 **Diagnostic Checks**

```bash
# 1. Check which branch you're on
cd ~/Reviews-Maker
git branch -v
# Should show: * refactor/project-structure

# 2. Check last few commits
git log --oneline -5

# 3. Check PM2 status
pm2 list
pm2 describe reviews-maker

# 4. Check if port is listening
netstat -tuln | grep 5000
# or
ss -tuln | grep 5000

# 5. Test backend directly
curl -I http://localhost:5000/api/auth/me
# Should NOT show 502

# 6. Test via nginx
curl -I https://terpologie.eu/api/auth/me
# Should NOT show 502

# 7. Check error logs
tail -50 /home/ubuntu/Reviews-Maker/logs/pm2-error.log
```

---

## 🛑 **If Backend Still Won't Start**

Try running the server directly to see the actual error:

```bash
# Stop PM2 first
pm2 stop reviews-maker

# Go to server directory
cd ~/Reviews-Maker/server-new

# Run server directly (you'll see errors immediately)
node server.js

# If you see errors, note them down
# To stop: Press Ctrl+C
```

---

## 🔄 **Restart Everything**

```bash
pm2 kill
cd ~/Reviews-Maker
pm2 start ecosystem.config.cjs --name reviews-maker
pm2 logs reviews-maker
```

---

## ✅ **Verify It's Working**

```bash
# This should NOT return 502
curl -I https://terpologie.eu/api/auth/me

# Should show something like:
# HTTP/2 200
# or
# HTTP/2 401
# But NOT 502
```

---

## 📝 **Send Me This Info If It's Still Broken**

```bash
# Run all these and copy the output:

echo "=== BRANCH ===" && git branch -v && \
echo "=== LAST COMMITS ===" && git log --oneline -3 && \
echo "=== PM2 STATUS ===" && pm2 list && \
echo "=== PM2 ERRORS ===" && tail -50 /home/ubuntu/Reviews-Maker/logs/pm2-error.log && \
echo "=== LISTENING PORTS ===" && ss -tuln | grep -E ':(5000|3000|8000|3001)' && \
echo "=== ENV CHECK ===" && echo "PORT=$PORT" && echo "NODE_ENV=$NODE_ENV"
```

Copy the entire output and send it to us!

---

## 🎯 **Summary**

1. **Pull latest**: `cd ~/Reviews-Maker && git pull origin refactor/project-structure`
2. **Restart PM2**: `pm2 restart reviews-maker`
3. **Check logs**: `pm2 logs reviews-maker --err --lines 50`
4. **Test API**: `curl -I https://terpologie.eu/api/auth/me` (should NOT be 502)

If it's still 502, run the diagnostic checks and share the output!
