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
                // Using VPS IP directly when DNS is not available
                FRONTEND_URL: 'http://51.75.22.192',
                // Use SESSION_SECURE=false for debug on local HTTP only; production should be true.
                SESSION_SECURE: 'true',
                // Recommended: set the production Discord OAuth values using PM2 env or a secure store (do not commit secrets here)
                // DISCORD_CLIENT_ID: 'REPLACE_CLIENT_ID',
                // DISCORD_CLIENT_SECRET: 'REPLACE_CLIENT_SECRET',
                // When using IP instead of DNS, set the redirect accordingly (do not store secrets here):
                // DISCORD_REDIRECT_URI: 'http://51.75.22.192/api/auth/discord/callback'
            },
        }
    ]
};
