#!/bin/bash
# Script de gestion du serveur Reviews-Maker
# Usage: ./manage-server.sh {start|stop|restart|status}

ACTION=$1
NODE_BIN='/home/ubuntu/.nvm/versions/node/v24.11.1/bin/node'
SERVER_DIR='/home/ubuntu/Reviews-Maker/server-new'
PID_FILE="$SERVER_DIR/server.pid"

case "$ACTION" in
  start)
    echo '🚀 Démarrage du serveur...'
    cd $SERVER_DIR
    $NODE_BIN server.js > server.log 2>&1 &
    echo $! > $PID_FILE
    sleep 3
    echo ''
    echo '📋 Logs:'
    tail -20 server.log
    echo ''
    echo '✅ Serveur démarré (PID: '$(cat $PID_FILE)')'
    ;;
  stop)
    echo '🛑 Arrêt du serveur...'
    if [ -f $PID_FILE ]; then
      PID=$(cat $PID_FILE)
      kill $PID 2>/dev/null && echo "Processus $PID tué"
      rm $PID_FILE
    fi
    pkill -f 'node.*server.js'
    fuser -k 3000/tcp 2>/dev/null
    echo '✅ Serveur arrêté'
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    echo '🔍 Statut du serveur:'
    ps aux | grep '[n]ode.*server.js' || echo 'Aucun processus trouvé'
    echo ''
    echo '🧪 Test API /api/auth/providers:'
    curl -s http://localhost:3000/api/auth/providers | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/api/auth/providers
    ;;
  *)
    echo 'Usage: $0 {start|stop|restart|status}'
    exit 1
    ;;
esac
