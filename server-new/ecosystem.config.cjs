module.exports = {
    apps: [
        {
            name: 'reviews-backend',
            script: './server.js',
            cwd: '/home/ubuntu/Reviews-Maker/server-new',
            instances: 'max',
            exec_mode: 'cluster',
            autorestart: true,
            restart_delay: 2000,
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                FRONTEND_URL: 'https://reviews-maker.fr',
                // Use SESSION_SECURE=false for debug on local HTTP only; production should be true.
                SESSION_SECURE: 'true',
                // Recommended: set the production Discord OAuth values using PM2 env or a secure store (do not commit secrets here)
                // DISCORD_CLIENT_ID: 'REPLACE_CLIENT_ID',
                // DISCORD_CLIENT_SECRET: 'REPLACE_CLIENT_SECRET',
                // DISCORD_REDIRECT_URI: 'https://reviews-maker.fr/api/auth/discord/callback'
            },
        }
    ]
};
