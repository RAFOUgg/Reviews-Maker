# Admin Panel - Deployment & Testing Guide

## Overview

The Admin Panel allows administrators to manage users, change account types, manage subscriptions, and ban users. This guide covers deployment and testing.

## Files Created

### Backend
- `server-new/routes/admin.js` - Admin API routes
  - `GET /api/admin/check-auth` - Verify admin access
  - `GET /api/admin/users` - List all users
  - `GET /api/admin/users/:id` - Get specific user
  - `PATCH /api/admin/users/:id/account-type` - Change account type
  - `PATCH /api/admin/users/:id/subscription` - Update subscription status
  - `PATCH /api/admin/users/:id/ban` - Ban/unban user
  - `GET /api/admin/stats` - Get user statistics

### Frontend
- `client/src/pages/admin/AdminPanel.jsx` - React component
- `client/src/pages/admin/AdminPanel.css` - Styling

### Integration
- Modified `server-new/server.js` - Added admin routes
- Modified `client/src/App.jsx` - Added admin route
- Modified `server-new/.env` - Set `ADMIN_MODE=true` for development

## Local Testing (Development)

### Prerequisites
```bash
cd Reviews-Maker
```

### 1. Start Backend Server

```bash
cd server-new
npm install
npm run check-env
npm run dev
```

Server will start on `http://localhost:3000`

### 2. Start Frontend Dev Server (in another terminal)

```bash
cd client
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

### 3. Access Admin Panel

Open browser and navigate to:
```
http://localhost:5173/admin
```

### 4. Test Admin Features

#### Search Users
- Type username or email in search box
- Results filter in real-time

#### Change Account Type
1. Find user in table
2. Click account type dropdown
3. Select: [C]onsumer, [I]nfluencer, or [P]roducer
4. Change updates immediately

#### Manage Subscription
1. Find user with active subscription
2. Click subscription dropdown
3. Select: Active, Inactive, Cancelled, or Expired
4. Status updates immediately

#### Ban/Unban User
1. Click "Ban" button on user row
2. Add reason (optional)
3. Confirm ban
4. User marked as banned
5. Click "Unban" to remove ban

### 5. Run API Tests

```bash
chmod +x test-admin-endpoints.sh
./test-admin-endpoints.sh
```

### 6. Verify API Endpoints

Test individually:

```bash
# Check auth
curl http://localhost:3000/api/admin/check-auth

# Get all users
curl http://localhost:3000/api/admin/users

# Get stats
curl http://localhost:3000/api/admin/stats

# Get specific user (replace USER_ID)
curl http://localhost:3000/api/admin/users/USER_ID
```

## VPS Deployment

### Prerequisites

- SSH access to VPS
- SSH key configured for `vps-lafoncedalle` or `vps-main` (check with ops team)
- PM2 running on VPS
- nginx configured

### 1. Automatic Deployment

```bash
chmod +x deploy-admin-panel.sh
./deploy-admin-panel.sh
```

The script will:
- Pull latest code from main branch
- Install dependencies
- Build frontend
- Restart PM2 services
- Verify deployment

### 2. Manual Deployment Steps

If automatic script fails, follow these steps:

#### On VPS Server

```bash
# Connect to VPS
ssh root@vps-lafoncedalle

# Navigate to project
cd /home/reviews-maker

# Pull latest code
git checkout main
git pull origin main

# Update backend
cd server-new
npm ci

# Update frontend
cd ../client
npm ci
npm run build

# Restart services
cd ..
pm2 restart ecosystem.config.cjs --env production

# Verify
pm2 logs
```

### 3. Verify Deployment

```bash
# Check health endpoint
curl https://reviews-maker.terpologie.fr/api/health

# Check admin auth
curl https://reviews-maker.terpologie.fr/api/admin/check-auth

# Test in browser
https://reviews-maker.terpologie.fr/admin
```

## Configuration

### Enable/Disable Admin Mode

The admin panel can be accessed in two ways:

#### Development Mode
```bash
# In server-new/.env
ADMIN_MODE=true
```
Anyone can access `/admin` endpoint (USE ONLY IN DEVELOPMENT)

#### Production Mode
```bash
# In server-new/.env
ADMIN_MODE=false
```
Only users with `admin` role in database can access `/admin`

### VPS Environment Variables

Edit `/home/reviews-maker/server-new/.env` on VPS:

```
ADMIN_MODE=false
# ... other config
```

## Security Notes

⚠️ **IMPORTANT FOR PRODUCTION**

1. **ADMIN_MODE must be false in production** - Require proper authentication
2. **SSH Keys** - Use SSH key authentication, not passwords
3. **Firewall** - Restrict admin panel access by IP if possible
4. **Audit Logs** - Admin actions are logged in database
5. **Rate Limiting** - Admin API endpoints have no rate limiting (add if needed)

### Adding Admin Role to Users

In production, add admin role via database:

```sql
UPDATE "User" SET roles = '["admin"]' WHERE id = 'USER_ID';
```

Or via Prisma Studio:
```bash
npm run prisma:studio
```

## Troubleshooting

### Admin Panel Not Accessible

**Problem:** Getting "Access Denied" message

**Solution:**
- Check `ADMIN_MODE=true` in development `.env`
- Verify backend is running: `pm2 logs`
- Clear browser cache
- Check console for API errors

### API Returns 500 Error

**Problem:** Server error when accessing admin endpoints

**Solution:**
1. Check server logs: `pm2 logs`
2. Verify database connection: `npm run prisma:studio`
3. Restart server: `pm2 restart all`

### Permission Denied Errors

**Problem:** Getting "Permission Denied" when trying to deploy

**Solution:**
- Verify SSH key is configured
- Check SSH key permissions: `chmod 600 ~/.ssh/id_rsa`
- Verify user has permissions to project directory
- Contact DevOps team

### Slow Queries

**Problem:** Admin panel takes long time to load users

**Solution:**
- Only first 100 users are loaded (pagination can be added)
- Check database performance: `npm run prisma:studio`
- Add database indexes if needed

## Rollback

If deployment goes wrong, rollback to previous version:

```bash
# On VPS
ssh root@vps-lafoncedalle
cd /home/reviews-maker

# Revert last commit
git revert HEAD

# Restart
pm2 restart all
```

Or manually restore from backup:

```bash
# Check commit history
git log --oneline

# Checkout previous version
git checkout PREVIOUS_COMMIT_HASH

# Restart
pm2 restart all
```

## Monitoring

### Check Admin Panel Status

```bash
# SSH to VPS
ssh root@vps-lafoncedalle

# Check PM2 status
pm2 status

# View logs
pm2 logs 0  # Replace 0 with app ID

# Monitor in real-time
pm2 monit
```

### Performance Metrics

The `/api/admin/stats` endpoint provides:
- Total users
- Consumer/Influencer/Producer breakdown
- Banned users count
- Total reviews count

## Future Improvements

- [ ] Add pagination to user list
- [ ] Add bulk actions (ban multiple users)
- [ ] Add user activity logs
- [ ] Add export to CSV
- [ ] Add advanced filters
- [ ] Add user messaging system
- [ ] Add support tickets integration
- [ ] Add audit trail for admin actions

## Support

For issues or questions:
1. Check this guide
2. Review server logs: `pm2 logs`
3. Check database: `npm run prisma:studio`
4. Contact development team
