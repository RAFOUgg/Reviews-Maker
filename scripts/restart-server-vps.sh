#!/bin/bash
# Script de redémarrage du serveur Reviews-Maker sur VPS
# Usage: ./restart-server-vps.sh

set -e

echo "🔄 Redémarrage du serveur Reviews-Maker..."

# Charger NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Aller dans le répertoire du serveur
cd ~/Reviews-Maker/server-new

# Tuer l'ancien processus s'il existe
echo "🛑 Arrêt de l'ancien processus..."
pkill -f "server.js" || true
sleep 1

# Démarrer le nouveau serveur
echo "🚀 Démarrage du nouveau serveur..."
nohup node server.js > server.log 2>&1 &

# Attendre que le serveur démarre
sleep 3

# Afficher les logs
echo "📋 Logs de démarrage:"
echo "===================="
tail -20 server.log
echo "===================="

# Tester l'API providers
echo ""
echo "🧪 Test de l'API /api/auth/providers:"
curl -s http://localhost:3000/api/auth/providers | jq . || curl -s http://localhost:3000/api/auth/providers

echo ""
echo "✅ Serveur redémarré avec succès!"
