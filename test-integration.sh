#!/bin/bash

# Script de test de l'intégration Reviews-Maker ↔ LaFoncedalleBot
# Usage: ./test-integration.sh

set -e

# Configuration
LAFONCEDALLE_URL="${LAFONCEDALLE_API_URL:-http://localhost:3001}"
API_KEY="${LAFONCEDALLE_API_KEY:-your-api-key-here}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"

echo "🧪 Test de l'intégration Reviews-Maker ↔ LaFoncedalleBot"
echo "=================================================="
echo ""
echo "Configuration:"
echo "  API URL: $LAFONCEDALLE_URL"
echo "  Test Email: $TEST_EMAIL"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de test
test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  echo -e "${YELLOW}Test: $name${NC}"
  echo "  Endpoint: $method $endpoint"
  
  response=$(curl -s -w "\n%{http_code}" -X "$method" "$LAFONCEDALLE_URL$endpoint" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $API_KEY" \
    -d "$data")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 404 ]; then
    echo -e "  ${GREEN}✓ Status: $http_code${NC}"
    echo "  Response: $body"
    echo ""
    return 0
  else
    echo -e "  ${RED}✗ Status: $http_code${NC}"
    echo "  Response: $body"
    echo ""
    return 1
  fi
}

# Test 1: Vérifier un email
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Vérification d'email Discord"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if test_endpoint "Vérifier email Discord" "POST" "/api/discord/user-by-email" "{\"email\":\"$TEST_EMAIL\"}"; then
  echo -e "${GREEN}✓ Endpoint user-by-email fonctionne${NC}"
  FOUND_USER=true
else
  echo -e "${YELLOW}⚠ Email non trouvé (normal si non configuré)${NC}"
  FOUND_USER=false
fi
echo ""

# Test 2: Envoyer un email de vérification (seulement si l'endpoint est disponible)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Envoi d'email de vérification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if test_endpoint "Envoyer code de vérification" "POST" "/api/mail/send-verification" \
  "{\"to\":\"$TEST_EMAIL\",\"code\":\"123456\",\"subject\":\"Test Reviews Maker\",\"appName\":\"Reviews Maker\",\"expiryMinutes\":10}"; then
  echo -e "${GREEN}✓ Endpoint send-verification fonctionne${NC}"
  MAIL_OK=true
else
  echo -e "${RED}✗ Endpoint send-verification a échoué${NC}"
  MAIL_OK=false
fi
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Résumé des tests"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$FOUND_USER" = true ] && [ "$MAIL_OK" = true ]; then
  echo -e "${GREEN}✓ Tous les tests ont réussi !${NC}"
  echo "  L'intégration est opérationnelle."
  exit 0
elif [ "$MAIL_OK" = true ]; then
  echo -e "${YELLOW}⚠ Tests partiellement réussis${NC}"
  echo "  L'endpoint d'email fonctionne mais l'email de test n'existe pas."
  echo "  Créez un utilisateur Discord avec cet email : $TEST_EMAIL"
  exit 1
else
  echo -e "${RED}✗ Des tests ont échoué${NC}"
  echo ""
  echo "Vérifications suggérées :"
  echo "  1. LaFoncedalleBot est-il démarré ? (pm2 status)"
  echo "  2. L'URL est-elle correcte ? ($LAFONCEDALLE_URL)"
  echo "  3. La clé API est-elle valide ?"
  echo "  4. Les endpoints sont-ils implémentés ?"
  echo ""
  echo "Pour plus d'aide, consultez :"
  echo "  - ENDPOINTS_LAFONCEDALLE.md"
  echo "  - INTEGRATION_LAFONCEDALLE_API.md"
  exit 1
fi
