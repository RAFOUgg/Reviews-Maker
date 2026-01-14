#!/bin/bash
# Script pour désactiver temporairement le cache JS/CSS

NGINX_CONF="/etc/nginx/sites-available/terpologie.eu"

# Backup
sudo cp "$NGINX_CONF" "${NGINX_CONF}.backup-$(date +%Y%m%d-%H%M%S)"

# Ajouter la règle no-cache pour JS/CSS après le bloc HTML
sudo sed -i '/location ~ \\\.html$/,/}/ {
    /}/a\
\
        # TEMPORAIRE: Force refresh assets après déploiement\
        location ~* \\.(js|css)$ {\
            root /var/www/reviews-maker/client/dist;\
            add_header Cache-Control "no-cache, no-store, must-revalidate";\
            add_header Pragma "no-cache";\
            add_header Expires "0";\
            try_files $uri =404;\
        }
}' "$NGINX_CONF"

# Test et reload
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✅ Nginx rechargé avec no-cache pour JS/CSS"
else
    echo "❌ Erreur config nginx, restauration backup"
    sudo cp "${NGINX_CONF}.backup-$(date +%Y%m%d)-"* "$NGINX_CONF"
    exit 1
fi
