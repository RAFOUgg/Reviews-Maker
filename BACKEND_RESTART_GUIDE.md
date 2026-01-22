# VPS Backend Restart & Diagnostics

## Status Check Commands
```bash
# Check if backend is running
ssh vps-lafoncedalle "ps aux | grep 'node server' | grep -v grep"

# Check PM2 status
ssh vps-lafoncedalle "npx pm2 status"

# Check if port 3000 is listening
ssh vps-lafoncedalle "netstat -tlnp | grep 3000"

# Check Nginx status
ssh vps-lafoncedalle "sudo systemctl status nginx"

# View Nginx error log
ssh vps-lafoncedalle "sudo tail -20 /var/log/nginx/error.log"

# View Nginx access log
ssh vps-lafoncedalle "sudo tail -20 /var/log/nginx/access.log"
```

## Restart Commands
```bash
# Restart PM2 process
ssh vps-lafoncedalle "cd /home/ubuntu/Reviews-Maker && npx pm2 restart reviews-maker"

# Check logs after restart
ssh vps-lafoncedalle "npx pm2 logs reviews-maker --lines 50 --nostream"

# Restart Nginx if needed
ssh vps-lafoncedalle "sudo systemctl restart nginx"

# Full restart sequence
ssh vps-lafoncedalle "cd /home/ubuntu/Reviews-Maker && npx pm2 stop reviews-maker && sleep 2 && npx pm2 start ecosystem.config.cjs --name reviews-maker && sleep 3 && npx pm2 status"
```

## Issue Analysis
- **502 Error**: Backend not responding or Nginx can't reach it
- **Server responded with 502**: Check if Express server is running on port 3000
- **HTML in JSON response**: Nginx returning error page instead of proxying to backend

## Solutions
1. Restart PM2: `ssh vps-lafoncedalle "npx pm2 restart reviews-maker"`
2. Check logs: `ssh vps-lafoncedalle "npx pm2 logs reviews-maker --lines 100"`
3. Check Nginx config: `ssh vps-lafoncedalle "sudo nginx -t"`
4. Restart Nginx: `ssh vps-lafoncedalle "sudo systemctl restart nginx"`
