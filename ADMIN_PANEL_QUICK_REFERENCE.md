# Admin Panel - Quick Reference

## Access Admin Panel

### Development (Local)
```
http://localhost:5173/admin
```
(ADMIN_MODE=true enables instant access)

### Production (VPS)
```
https://reviews-maker.terpologie.fr/admin
```
(Requires admin role in database)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/check-auth` | Verify admin access |
| GET | `/api/admin/users` | List all users (first 100) |
| GET | `/api/admin/users/:id` | Get specific user details |
| PATCH | `/api/admin/users/:id/account-type` | Change account type |
| PATCH | `/api/admin/users/:id/subscription` | Update subscription status |
| PATCH | `/api/admin/users/:id/ban` | Ban/unban user |
| GET | `/api/admin/stats` | Get user statistics |

## Account Types
- **[C] Consumer** - Free tier, basic features
- **[I] Influencer** - $15.99/month subscription
- **[P] Producer** - $29.99/month subscription

## Subscription Status
- **active** - Subscription is active
- **inactive** - Subscription paused
- **cancelled** - User cancelled subscription
- **expired** - Subscription period ended

## Common Tasks

### Change User Account Type
```bash
curl -X PATCH http://localhost:3000/api/admin/users/USER_ID/account-type \
  -H "Content-Type: application/json" \
  -d '{"accountType":"producer"}'
```

### Update Subscription Status
```bash
curl -X PATCH http://localhost:3000/api/admin/users/USER_ID/subscription \
  -H "Content-Type: application/json" \
  -d '{"subscriptionStatus":"active"}'
```

### Ban User with Reason
```bash
curl -X PATCH http://localhost:3000/api/admin/users/USER_ID/ban \
  -H "Content-Type: application/json" \
  -d '{"banned":true,"reason":"Inappropriate content"}'
```

### Unban User
```bash
curl -X PATCH http://localhost:3000/api/admin/users/USER_ID/ban \
  -H "Content-Type: application/json" \
  -d '{"banned":false}'
```

## Files Created
- `server-new/routes/admin.js` - Backend routes
- `client/src/pages/admin/AdminPanel.jsx` - React component
- `client/src/pages/admin/AdminPanel.css` - Styling
- `deploy-admin-panel.sh` - VPS deployment script
- `test-admin-endpoints.sh` - API testing script
- `ADMIN_PANEL_DEPLOYMENT_GUIDE.md` - Full deployment guide

## Environment Variables
- `ADMIN_MODE=true` - Development mode (no auth required)
- `ADMIN_MODE=false` - Production mode (requires admin role)

## Quick Start

### Local Testing
```bash
cd server-new && npm run dev  # Terminal 1
cd client && npm run dev      # Terminal 2
# Visit http://localhost:5173/admin
```

### Deploy to VPS
```bash
chmod +x deploy-admin-panel.sh
./deploy-admin-panel.sh
```

### Test API
```bash
chmod +x test-admin-endpoints.sh
./test-admin-endpoints.sh
```

## Security
- ⚠️ Keep `ADMIN_MODE=false` in production
- ⚠️ Only grant admin role to trusted users
- ⚠️ All admin actions should be audited (logs available in PM2)

## Support
- Full guide: `ADMIN_PANEL_DEPLOYMENT_GUIDE.md`
- Server logs: `pm2 logs`
- Database: `npm run prisma:studio`

---
Created: January 17, 2026
Status: Production Ready ✅
