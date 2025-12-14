# Plan de correction complet - 14 décembre 2025

## 🔥 Problèmes identifiés

### 1. **Formulaires de création reviews ne s'affichent pas**
- **Route** : `/create/flower`, `/create/hash`, etc.
- **Symptôme** : Écran violet vide
- **Cause probable** : Erreur JS dans les composants Create*Review.jsx

### 2. **Tous les comptes ont le même workflow de connexion**
- **Problème** : Pas de redirection vers AccountSetupPage pour Influenceur/Producteur
- **Manque** : Vérification subscriptionStatus + kycStatus

### 3. **ExportMaker jamais visible**
- **Problème** : Bouton export dans ReviewDetailPage ne fait rien
- **Manque** : Intégration ExportMaker dans ReviewDetailPage

### 4. **Interface Liquid/Apple-like incomplète**
- **Manque** : Harmonisation des composants
- **Manque** : LiquidCard, LiquidButton pas utilisés partout

### 5. **Route `/account` ne fonctionne pas**
- **Symptôme** : Page vide
- **Cause** : Route non définie dans App.jsx

---

## ✅ Plan de correction (par priorité)

### PHASE 1 : Diagnostic & Nettoyage (20 min)
1. ✅ Identifier tous les fichiers obsolètes
2. ✅ Lister les routes manquantes
3. ✅ Vérifier l'état de chaque composant critique

### PHASE 2 : Corrections critiques (1h)
1. **Fixer les formulaires de création** (urgent)
   - Vérifier CreateFlowerReview.jsx ligne par ligne
   - Ajouter try-catch partout
   - Tester chaque formulaire

2. **Implémenter workflow différencié**
   - Après signup → vérifier accountType
   - Rediriger Influenceur/Producteur vers `/account-setup`
   - Bloquer accès si subscriptionStatus !== 'active'

3. **Intégrer ExportMaker**
   - Ajouter modal ExportMaker dans ReviewDetailPage
   - Bouton "Exporter" visible et fonctionnel
   - Tester export PNG/PDF

### PHASE 3 : Améliorations UX (30 min)
1. **Harmoniser l'interface**
   - Remplacer tous les `<button>` par `<LiquidButton>`
   - Utiliser `<LiquidCard>` pour les containers
   - Ajouter animations Framer Motion

2. **Créer les routes manquantes**
   - `/account` → Rediriger vers `/settings`
   - `/account-setup` → AccountSetupPage (déjà fait)

### PHASE 4 : Tests complets (20 min)
1. Tester chaque type de produit (Fleur, Hash, Concentré, Comestible)
2. Tester signup Amateur vs Influenceur vs Producteur
3. Tester export d'une review existante

---

## 📋 Checklist finale

- [ ] Tous les formulaires de création s'affichent
- [ ] Workflow Amateur fonctionne (signup → reviews directement)
- [ ] Workflow Influenceur/Producteur redirige vers setup
- [ ] ExportMaker accessible depuis ReviewDetailPage
- [ ] Interface Liquid/Apple-like cohérente partout
- [ ] Aucune route cassée
- [ ] Aucun composant obsolète importé
- [ ] Build sans warnings critiques

---

**Durée totale estimée** : 2h10
**Objectif** : Site 100% fonctionnel selon cahier des charges
