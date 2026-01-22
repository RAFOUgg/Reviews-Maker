# 🔧 Backend Recovery - Issue Analysis & Solution

## 📋 Problem Identified

**502 Bad Gateway Error** on frontend when calling `/api/auth/providers` and `/api/auth/me`

### Root Cause
The Express backend server has **shut down gracefully** (as of 2026-01-22T13:33:41)

From PM2 logs:
```
0|reviews- | 2026-01-22T13:33:41:
0|reviews- | 2026-01-22T13:33:41: ƒøæ Shutting down gracefully...
```

### Why This Happens
- Backend was stopped or crashed
- PM2 process exists but is not running the actual Node.js server
- Nginx is configured to forward to `http://localhost:3000`
- When backend isn't listening on port 3000, Nginx returns 502 error

## ✅ Solution - Quick Restart

### Option 1: Via SSH (Recommended)
```bash
ssh vps-lafoncedalle "cd /home/ubuntu/Reviews-Maker && npx pm2 restart reviews-maker"
```

### Option 2: Manual Restart
1. SSH to VPS: `ssh vps-lafoncedalle`
2. Run restart: `cd /home/ubuntu/Reviews-Maker && npx pm2 restart reviews-maker`
3. Verify: `npx pm2 status`
4. Check logs: `npx pm2 logs reviews-maker --lines 50`

### Option 3: Full Restart Sequence
```bash
cd /home/ubuntu/Reviews-Maker
npx pm2 stop reviews-maker
sleep 2
npx pm2 start ecosystem.config.cjs --name reviews-maker
sleep 3
npx pm2 status
```

## 🔍 Verification Steps

After restart, verify:

```bash
# 1. Check PM2 status
ssh vps-lafoncedalle "npx pm2 status"
# Should show: online status for reviews-maker

# 2. Check port 3000
ssh vps-lafoncedalle "netstat -tlnp | grep 3000"
# Should show: LISTEN on 127.0.0.1:3000

# 3. Test backend directly
ssh vps-lafoncedalle "curl -s http://localhost:3000/api/auth/providers"
# Should return JSON, not HTML

# 4. Check Nginx forwarding
ssh vps-lafoncedalle "sudo nginx -t"
# Should show: "nginx: configuration file test is successful"
```

## 🛠️ If Restart Fails

### Check Logs for Errors
```bash
ssh vps-lafoncedalle "npx pm2 logs reviews-maker --lines 200 --err"
```

### Check Server Dependencies
```bash
ssh vps-lafoncedalle "cd /home/ubuntu/Reviews-Maker && npm list"
```

### Check Database Connection
```bash
ssh vps-lafoncedalle "ls -lh /home/ubuntu/Reviews-Maker/db/reviews.sqlite"
```

### Restart Nginx If Needed
```bash
ssh vps-lafoncedalle "sudo systemctl restart nginx"
```

## 📊 Current Status

| Service | Status | Last Action |
|---------|--------|-------------|
| PM2 Process | Online | Running (but server shut down) |
| Express Server | ❌ Down | Shut down at 13:33:41 |
| Nginx | Unknown | Should be forwarding requests |
| Database | ✅ OK | SQLite file exists |
| Frontend | ✅ OK | Built and deployed |

## 🎯 Next Steps

1. **Restart Backend** - Execute one of the SSH commands above
2. **Verify Response** - Test `/api/auth/providers` endpoint
3. **Check Logs** - If errors appear, review PM2 logs for specific issue
4. **Clear Browser Cache** - Hard refresh (Ctrl+Shift+R) to reload JavaScript

## 📝 Notes

- The PM2 process shows as "online" even though the server shut down
- This is because PM2 manages the process manager, not the actual app
- The graceful shutdown suggests the app exited cleanly (no crash)
- Nginx is correctly configured to forward to port 3000
- Once backend restarts, requests should work immediately
