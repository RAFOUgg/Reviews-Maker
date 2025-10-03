/**
 * Configuration PM2 pour Reviews Maker
 * Démarrage: pm2 start ecosystem.config.cjs --env production
 * Journal:   pm2 logs reviews-maker
 * Startup:   pm2 startup && pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'reviews-maker',
      script: 'server.js',
      cwd: __dirname, // dossier server/
      interpreter: 'node',
      instances: 1, // SQLite => 1 instance (éviter accès concurrent disque)
      exec_mode: 'fork',
      env: {
        PORT: 3000,
        NODE_ENV: 'development'
      },
      env_production: {
        PORT: process.env.PORT || 3000,
        NODE_ENV: 'production'
      },
      watch: false,
      max_memory_restart: '300M',
      out_file: '../logs/out.log',
      error_file: '../logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
