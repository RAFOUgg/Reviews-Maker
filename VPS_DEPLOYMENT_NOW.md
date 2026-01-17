## URGENT: Run This on VPS NOW

### SSH to VPS and execute:
```bash
cd ~/Reviews-Maker && \
git pull origin main && \
npm run build --prefix client && \
pm2 restart reviews-maker && \
sleep 3 && \
pm2 logs reviews-maker --lines 40
```

### What This Does:
1. ✅ Pulls latest code (commit 6a68916) with debugging logs
2. ✅ Rebuilds frontend with error boundaries
3. ✅ Restarts PM2
4. ✅ Shows you the logs

### After Running:
1. Open browser: `https://terpologie.eu/admin`
2. Press **Ctrl+Shift+R** (hard refresh)
3. Press **F12** (Developer Console)
4. Look for console messages:
   - `📄 AdminPanel.jsx module loaded!` - Module imported successfully
   - `🔨 AdminPanel component function called!` - Component rendering
   - `🔧 AdminPanel useEffect - checking auth...` - useEffect running
   - `🔐 Calling /api/admin/check-auth` - API call starting
   - `⚠️ Admin Panel Load Error` - If error boundary catches exception

### If Still Blank:
Check console for one of these messages. If you see:
- **None of the above**: Component isn't loading (cache issue or build failed)
- **Only 📄 message**: Component module loaded but not rendering
- **Only 🔨 message**: Component started but useEffect has issue
- **Red error**: React exception caught by error boundary

---

**Latest commits:**
- 6a68916: Add error boundary and module-level logging
- 59abde2: Improved error visibility with inline styles

**Status**: Ready for VPS deployment
