module.exports = {
  apps: [
    {
      // Server Application
      name: 'reviews-maker-server',
      script: './server.js',
      cwd: '/home/ubuntu/Reviews-Maker/server-new',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      // Auto-restart on changes
      watch: [
        '/home/ubuntu/Reviews-Maker/server-new/routes',
        '/home/ubuntu/Reviews-Maker/server-new/services',
        '/home/ubuntu/Reviews-Maker/server-new/utils'
      ],
      watch_delay: 2000,
      ignore_watch: [
        'node_modules',
        'logs',
        'db',
        '.env*'
      ],
      // Restart strategy
      max_memory_restart: '500M',
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 5000,
      kill_timeout: 5000,
      // Logs
      error_file: '/home/ubuntu/Reviews-Maker/logs/server-error.log',
      out_file: '/home/ubuntu/Reviews-Maker/logs/server-out.log',
      log_file: '/home/ubuntu/Reviews-Maker/logs/pm2.log',
      time: true
    }
  ]
}
