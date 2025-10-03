###############################
# Reviews Maker (API + Front)
# Usage:
#  docker build -t reviews-maker:latest .
#  docker run -d --name reviews-maker -p 3000:3000 -v $(pwd)/db:/app/db reviews-maker:latest
# Puis placer un reverse proxy (Nginx/Caddy/Traefik) devant pour HTTPS.
###############################

FROM node:20-alpine AS base
WORKDIR /app

# Copier uniquement le backend package.json pour cache layer
COPY server/package.json ./server/package.json
WORKDIR /app/server
RUN npm install --only=production

# Copier le reste du projet (frontend statique + code serveur)
WORKDIR /app
COPY . .

# Exposer le port interne
EXPOSE 3000

# Définir un volume pour la base sqlite et les images
VOLUME ["/app/db"]

WORKDIR /app/server
ENV PORT=3000 NODE_ENV=production
CMD ["node", "server.js"]
