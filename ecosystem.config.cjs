module.exports = {
  apps: [{
    name: 'reviews-maker',
    script: './server.js',
    cwd: '/home/ubuntu/Reviews-Maker/server-new',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/ubuntu/Reviews-Maker/logs/pm2-error.log',
    out_file: '/home/ubuntu/Reviews-Maker/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    time: true
  }]
}
