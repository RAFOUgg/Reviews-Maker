#!/bin/bash
# REVIEWS-MAKER V2 - Phase 1.1 : Design System
# Déploiement du nouveau système de thème

set -e

echo "🎨 =================================="
echo "   PHASE 1.1 : DESIGN SYSTEM V2"
echo "   Déploiement du système de thème"
echo "===================================="
echo ""

# Variables
BRANCH="feat/design-system-v2"
CLIENT_DIR="client"

echo "📋 Étape 1/6 : Vérification de la branche..."
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "⚠️  Création de la branche $BRANCH..."
    git checkout -b $BRANCH
else
    echo "✅ Déjà sur la branche $BRANCH"
fi

echo ""
echo "📦 Étape 2/6 : Installation des dépendances..."
cd $CLIENT_DIR
npm install

echo ""
echo "🔨 Étape 3/6 : Build du client..."
npm run build

echo ""
echo "✅ Étape 4/6 : Build réussi !"
ls -lh dist/

echo ""
echo "📤 Étape 5/6 : Commit des modifications..."
cd ..
git add .
git commit -m "feat(design-system): Phase 1.1 - Système de thème V2 avec Liquid Glass

- Création du ThemeStore (Zustand) avec 6 thèmes
- Thèmes disponibles: light, dark, violet-lean, vert-emeraude, bleu-tahiti, sakura
- Composant ThemeSwitcher avec UI Apple-like
- Intégration dans Layout principal
- Variables CSS Liquid Glass (glassmorphism)
- Auto-détection thème système
- Persistance localStorage

Prochaine étape: Composants UI Liquid Glass"

echo ""
echo "🚀 Étape 6/6 : Push vers GitHub..."
git push origin $BRANCH

echo ""
echo "✅ =================================="
echo "   DÉPLOIEMENT LOCAL TERMINÉ !"
echo "===================================="
echo ""
echo "📝 Prochaines étapes :"
echo "   1. Tester localement avec 'npm run dev'"
echo "   2. Vérifier les 6 thèmes"
echo "   3. SSH vers VPS pour déploiement production"
echo ""
