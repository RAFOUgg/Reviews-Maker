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
                FRONTEND_URL: 'http://51.75.22.192',
                // Use SESSION_SECURE=false for debug on local HTTP only; production should be true.
                SESSION_SECURE: 'true'
            },
        }
    ]
};
