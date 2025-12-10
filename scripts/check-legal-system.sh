#!/bin/bash

# Script de vérification du système de pop-up légale
# Exécuter sur le VPS pour vérifier que tous les fichiers sont bien déployés

echo "🔍 Vérification du système de pop-up légale"
echo "============================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1 (manquant)"
        ((FAILED++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $1/ (manquant)"
        ((FAILED++))
    fi
}

# Vérifier les fichiers frontend
echo "📁 Fichiers Frontend"
echo "-------------------"
check_file "client/src/components/LegalWelcomeModal.jsx"
check_file "client/src/components/LegalConsentGate.jsx"
check_file "client/src/hooks/useLegalConsent.js"
check_file "client/src/data/legalConfig.json"
check_file "client/src/i18n/legalWelcome.json"
check_file "client/src/utils/legalSystemTests.js"
check_file "client/src/components/LEGAL_README.md"
echo ""

# Vérifier les fichiers backend
echo "📁 Fichiers Backend"
echo "------------------"
check_file "server-new/routes/legal.js"
echo ""

# Vérifier la documentation
echo "📁 Documentation"
echo "---------------"
check_file "docs/LEGAL_WELCOME_SYSTEM.md"
echo ""

# Vérifier App.jsx
echo "📁 Intégration"
echo "-------------"
if grep -q "LegalConsentGate" client/src/App.jsx 2>/dev/null; then
    echo -e "${GREEN}✓${NC} LegalConsentGate intégré dans App.jsx"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} LegalConsentGate non trouvé dans App.jsx"
    ((FAILED++))
fi
echo ""

# Vérifier les endpoints API
echo "📡 Endpoints API"
echo "---------------"
if grep -q "/user-preferences" server-new/routes/legal.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} GET /api/legal/user-preferences"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} GET /api/legal/user-preferences (manquant)"
    ((FAILED++))
fi

if grep -q "/update-preferences" server-new/routes/legal.js 2>/dev/null; then
    echo -e "${GREEN}✓${NC} POST /api/legal/update-preferences"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} POST /api/legal/update-preferences (manquant)"
    ((FAILED++))
fi
echo ""

# Vérifier la configuration JSON
echo "🌍 Configuration pays"
echo "--------------------"
if [ -f "client/src/data/legalConfig.json" ]; then
    COUNTRIES=$(grep -o '"[A-Z][A-Z]":' client/src/data/legalConfig.json | wc -l)
    echo -e "${GREEN}✓${NC} $COUNTRIES pays configurés"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Configuration pays manquante"
    ((FAILED++))
fi

if [ -f "client/src/i18n/legalWelcome.json" ]; then
    LANGS=$(grep -o '"[a-z][a-z]":' client/src/i18n/legalWelcome.json | head -3 | wc -l)
    echo -e "${GREEN}✓${NC} $LANGS langues traduites"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Traductions manquantes"
    ((FAILED++))
fi
echo ""

# Résumé
echo "============================================"
echo -e "Résumé: ${GREEN}${PASSED} réussis${NC}, ${RED}${FAILED} échoués${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les fichiers sont présents et correctement configurés${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "1. npm install (si nouvelles dépendances)"
    echo "2. npm run build (pour production)"
    echo "3. Redémarrer le serveur"
    exit 0
else
    echo -e "${RED}❌ Certains fichiers sont manquants${NC}"
    echo ""
    echo "Vérifiez que tous les fichiers ont été correctement déployés."
    exit 1
fi
