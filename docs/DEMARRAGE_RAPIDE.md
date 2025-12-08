# 🚀 GUIDE DE DEMARRAGE RAPIDE

## ✅ Corrections appliquées

1. **Script START.ps1 corrigé**
   - ✅ Problèmes d'encodage PowerShell résolus
   - ✅ Tous les caractères spéciaux (emojis, accents) supprimés
   - ✅ Syntaxe PowerShell validée
   - ✅ Bloc try/catch/finally correctement formaté

2. **Système de lancement fiable**
   - ✅ Vérification automatique de Node.js
   - ✅ Nettoyage des anciens processus
   - ✅ Installation automatique des dépendances
   - ✅ Health checks backend et frontend
   - ✅ Ouverture automatique du navigateur

3. **Formulaire de création simplifié**
   - ✅ CreateReviewPage.jsx simplifié (pas de hook complexe)
   - ✅ Upload d'images fonctionnel
   - ✅ Validation basique
   - ✅ UI moderne avec Tailwind

## 📋 COMMENT DEMARRER

### Option 1 : Double-clic (recommandé)
```
Double-cliquez sur START.bat
```

### Option 2 : PowerShell
```powershell
.\START.ps1
```

### Option 3 : Commande directe
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\START.ps1
```

## 🎯 Ce qui se passe au démarrage

1. Vérification de Node.js
2. Arrêt des anciens processus Node
3. Vérification/Installation des dépendances (npm install si nécessaire)
4. Démarrage du backend sur http://localhost:3000
5. Démarrage du frontend sur http://localhost:5173
6. Ouverture automatique du navigateur

## ⚡ Accès rapide

- **Site web** : http://localhost:5173
- **API Backend** : http://localhost:3000
- **API Health Check** : http://localhost:3000/api/health

## 🛑 Pour arrêter

Appuyez sur **CTRL+C** dans la fenêtre PowerShell

Les processus seront automatiquement nettoyés.

## 🔧 Dépannage

### Si le script ne démarre pas :
```powershell
# Vérifier la syntaxe
$null = [System.Management.Automation.PSParser]::Tokenize((Get-Content START.ps1 -Raw), [ref]$null)

# Arrêter manuellement les processus Node
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Relancer
.\START.ps1
```

### Si les ports sont déjà utilisés :
```powershell
# Trouver qui utilise le port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen

# Trouver qui utilise le port 5173
Get-NetTCPConnection -LocalPort 5173 -State Listen

# Arrêter tous les processus Node
Get-Process -Name node | Stop-Process -Force
```

## 📝 Prochaines étapes

1. **Tester la création de review** : /create
2. **Améliorer l'UI** : Design Apple-like avec animations fluides
3. **Ajouter fonctionnalités avancées** : Filtres, recherche, etc.

## 💡 Conseils

- Le script vérifie automatiquement la santé des serveurs
- Si un serveur crash, le script s'arrête proprement
- Les logs s'affichent en temps réel dans le terminal
- Le navigateur s'ouvre automatiquement sur le site

---

**Date** : 4 novembre 2025  
**Status** : ✅ Système de lancement fonctionnel et fiable
