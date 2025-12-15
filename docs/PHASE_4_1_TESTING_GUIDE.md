# Guide de Test Manuel - Phase 4.1 PipelineGitHubGrid

**Date:** 15 décembre 2025  
**Version:** Phase 4.1 - GitHub-style Pipeline System  
**Statut:** Tests manuels à effectuer avant déploiement

---

## 📋 Checklist Complète

### 1. Tests d'Interface - Modes d'Intervalles

#### Mode Jours (Days) ✅
- [ ] Ouvrir CreateFlowerReview (section Curing ou Culture)
- [ ] Sélectionner mode "Jours" dans intervalType
- [ ] Définir une date début (ex: 01/12/2025)
- [ ] Définir une date fin optionnelle (ex: 31/12/2025)
- [ ] Vérifier que la grille affiche ~30 cases (nombre de jours)
- [ ] Cliquer sur une case (ex: J+5)
- [ ] Remplir: température (20°C), humidité (65%), notes
- [ ] Sauvegarder et vérifier que la case devient verte
- [ ] Survol: tooltip affiche les données correctement

#### Mode Semaines (Weeks) ✅
- [ ] Changer intervalType vers "Semaines"
- [ ] Définir semaine début S1
- [ ] Définir semaine fin S12 (optionnel)
- [ ] Vérifier 12 cases affichées (S1 → S12)
- [ ] Éditer S3: ajouter temp, humidity, container type
- [ ] Vérifier intensité visuelle progressive (verte)
- [ ] Tester plusieurs éditions (S1, S5, S10)

#### Mode Phases (Culture uniquement) ✅
- [ ] Ouvrir CreateFlowerReview → Section Culture
- [ ] Sélectionner intervalType "Phases"
- [ ] Vérifier affichage des 12 phases prédéfinies:
  - Graine 🌰
  - Germination 🌱
  - Plantule 🌿
  - Début/Milieu/Fin Croissance 🌳🌲🎋
  - Stretch ⬆️
  - Début/Milieu/Fin Floraison 🌸🌺🌻
  - Séchage 💨
  - Curing 📦
- [ ] Éditer phase "Milieu Floraison"
- [ ] Vérifier que les couleurs de phase s'appliquent correctement
- [ ] Tester 4 niveaux d'intensité (vide, partiel, rempli, complet)

#### Modes Secondes/Minutes/Heures ⏱️
- [ ] Tester mode "Secondes" (60 cases max)
- [ ] Tester mode "Minutes" (60 cases)
- [ ] Tester mode "Heures" (24 cases)
- [ ] Vérifier labels corrects (s1, min1, h1, etc.)

---

### 2. Tests CRUD - Persistence des Données

#### Création de Review avec Pipeline ✅
- [ ] Créer une nouvelle FlowerReview
- [ ] Remplir section Culture avec mode Phases
- [ ] Éditer 5 phases différentes avec données complètes
- [ ] Sauvegarder la review
- [ ] Vérifier dans Network tab: POST `/api/reviews`
- [ ] Vérifier payload contient `pipelineGithub` avec config + cells

#### Chargement de Review avec Pipeline ✅
- [ ] Actualiser la page
- [ ] Ouvrir la review créée précédemment
- [ ] Vérifier que la grille GitHub s'affiche avec les 5 phases éditées
- [ ] Vérifier couleurs/intensités correctes
- [ ] Modifier une phase (ex: ajouter notes)
- [ ] Re-sauvegarder
- [ ] Recharger: vérifier modifications persistées

#### Update Multiple Times ✅
- [ ] Éditer 10 cellules différentes dans la grille
- [ ] Sauvegarder
- [ ] Recharger
- [ ] Vérifier que les 10 cellules sont remplies
- [ ] Modifier 3 cellules supplémentaires
- [ ] Vérifier que les modifications se cumulent (13 cellules totales)

---

### 3. Tests Responsive - Mobile/Tablet

#### Mobile (320px → 768px) 📱
- [ ] Ouvrir DevTools → Mode responsive 375px (iPhone SE)
- [ ] Tester CreateHashReview → Section Séparation
- [ ] Vérifier grille redimensionnée correctement
- [ ] Cases cliquables et lisibles
- [ ] Modal d'édition s'adapte au mobile
- [ ] Bouton "Export GIF" visible et fonctionnel
- [ ] Tester scroll horizontal si nécessaire

#### Tablet (768px → 1024px) 📱
- [ ] Mode responsive 768px (iPad)
- [ ] Vérifier layout 2 colonnes (config + grille)
- [ ] Tester interactions tactiles simulées
- [ ] Vérifier taille des cases (w-3 h-3 md:w-3.5 md:h-3.5)

#### Desktop (>1024px) 🖥️
- [ ] Écran 1920x1080
- [ ] Vérifier affichage optimal
- [ ] Tester hover effects (scale 1.15, shadow)
- [ ] Tooltip au survol précis et rapide

---

### 4. Tests Tooltips & Modal

#### Tooltips ✅
- [ ] Survol case vide: "Non renseigné"
- [ ] Survol case partielle: affiche température seulement
- [ ] Survol case complète: affiche toutes les données
- [ ] Vérifier délai d'apparition (<200ms)
- [ ] Tester sur 10 cases différentes

#### Modal d'Édition ✅
- [ ] Cliquer sur une case
- [ ] Modal s'ouvre avec animation (framer-motion)
- [ ] Titre affiche "Jours J+5" ou "Semaine S3" ou "Phase Floraison"
- [ ] 6 champs visibles:
  - Température (°C)
  - Humidité (%)
  - Type de récipient (select)
  - Type d'emballage (select)
  - Opacité (select)
  - Notes (textarea 500 char)
- [ ] Remplir tous les champs
- [ ] Cliquer "Sauvegarder"
- [ ] Modal se ferme
- [ ] Case mise à jour (intensité 4/4, verte complète)
- [ ] Réouvrir modal: données conservées

#### Fermeture Modal ✅
- [ ] Tester fermeture avec bouton X
- [ ] Tester fermeture avec clic backdrop
- [ ] Tester fermeture avec Échap (keyboard)
- [ ] Vérifier que les changements non sauvegardés sont perdus

---

### 5. Tests Export GIF

#### Export GIF - Mode Jours ✅
- [ ] Créer pipeline avec 30 jours
- [ ] Remplir 10 cellules aléatoirement
- [ ] Cliquer "Export GIF"
- [ ] Vérifier:
  - Icône Film visible
  - Progress bar apparaît (0% → 100%)
  - Message console: "📸 Capturing X frames"
  - Temps d'export: <10 secondes pour 30 frames
  - Téléchargement automatique fichier .gif
- [ ] Ouvrir le GIF: vérifier animation fluide
- [ ] Vérifier taille fichier <2MB

#### Export GIF - Mode Semaines ✅
- [ ] Pipeline 12 semaines
- [ ] Remplir 5 semaines
- [ ] Export GIF
- [ ] Vérifier 12 frames capturées
- [ ] Animation dure ~2.4s (12 frames × 200ms)

#### Export GIF - Mode Phases ✅
- [ ] Pipeline 12 phases culture
- [ ] Remplir toutes les phases
- [ ] Export GIF
- [ ] Vérifier 12 frames (une par phase)
- [ ] Couleurs de phases conservées dans le GIF
- [ ] Transitions fluides

#### Cas Limites Export ⚠️
- [ ] Grille vide (0 cellules): bouton disabled ✅
- [ ] 1 seule cellule: export réussit
- [ ] 365 cellules (mode jours complet): limité à 50 frames
- [ ] Vérifier optimisation: max 50 frames même avec 365 cases
- [ ] Tester pendant export: bouton disabled + spinner
- [ ] Annuler pendant export: non supporté (à implémenter si besoin)

---

### 6. Tests Backend API

#### POST /api/pipeline-github ✅
- [ ] Ouvrir Network tab
- [ ] Créer une review avec pipeline
- [ ] Sauvegarder
- [ ] Vérifier requête POST `/api/reviews` contient `pipelineGithub`
- [ ] Vérifier réponse 200 OK
- [ ] Vérifier structure response:
  ```json
  {
    "id": "xxx",
    "reviewId": "yyy",
    "pipelineType": "curing",
    "intervalType": "days",
    "cells": { "0": {...}, "5": {...} },
    "totalCells": 30,
    "filledCells": 2,
    "completionRate": 6.67
  }
  ```

#### GET /api/pipeline-github/:reviewId/:pipelineType ✅
- [ ] Après création, tester GET manuel via Postman/Thunder Client
- [ ] URL: `http://localhost:3000/api/pipeline-github/{reviewId}/curing`
- [ ] Vérifier réponse contient config + cells
- [ ] Vérifier cells est un objet JSON parsé (pas string)

#### DELETE /api/pipeline-github/:id ❌
- [ ] Pas encore implémenté dans UI
- [ ] Tester manuellement via API
- [ ] Vérifier suppression réussie
- [ ] Vérifier champ pipelineGithubId nullifié dans review

---

### 7. Tests de Compatibilité - Types de Reviews

#### FlowerReview ✅
- [ ] Section Culture: mode phases
- [ ] Section Curing: mode jours/semaines
- [ ] 2 pipelines simultanés (culture + curing)
- [ ] Sauvegarder: vérifier 2 champs `culturePipelineGithubId` et `curingPipelineGithubId`

#### HashReview ✅
- [ ] Section Séparation: mode secondes/minutes
- [ ] Section Purification: mode heures
- [ ] Section Curing: mode jours
- [ ] 3 pipelines simultanés
- [ ] Vérifier champs: `separationPipelineGithubId`, `purificationPipelineGithubId`, `curingPipelineGithubId`

#### ConcentrateReview ✅
- [ ] Section Extraction: mode minutes/heures
- [ ] Section Purification: mode heures
- [ ] Section Curing: mode jours
- [ ] Vérifier champs: `extractionPipelineGithubId`, `purificationPipelineGithubIdConcentrate`, `curingPipelineGithubIdConcentrate`

#### EdibleReview ✅
- [ ] Section Recette: mode minutes/heures
- [ ] Vérifier champ: `recipePipelineGithubId`

---

### 8. Tests de Performance

#### Rendering Performance ⚡
- [ ] Grille 365 cases (mode jours): temps de rendu <500ms
- [ ] Hover sur 100 cases consécutives: fluidité 60fps
- [ ] Éditer 10 cellules rapidement: pas de lag
- [ ] Changement intervalType: re-render instantané

#### Memory Leaks 🔍
- [ ] Ouvrir 5 reviews différentes avec pipelines
- [ ] Vérifier RAM stable (pas de croissance continue)
- [ ] Fermer modals: vérifier cleanup (DevTools Memory Profiler)

#### Network Optimization 🌐
- [ ] 1 seule requête POST par save (pas de doublons)
- [ ] Payload compressé (cells en JSON)
- [ ] GET response time <200ms

---

### 9. Tests de Régression

#### Anciennes Reviews (Backward Compatibility) ✅
- [ ] Ouvrir une review créée AVANT Phase 4.1
- [ ] Vérifier qu'elle charge sans erreur
- [ ] Section pipeline affiche message "Aucune donnée" ou grille vide
- [ ] Éditer et sauvegarder: création nouveau pipeline
- [ ] Recharger: vérifier migration réussie

#### Anciennes Données Pipeline ⚠️
- [ ] Si review a ancien champ `pipeline` (array)
- [ ] Vérifier coexistence avec `pipelineGithub`
- [ ] Pas de conflit lors du save

---

### 10. Tests UX/UI

#### Accessibilité (a11y) ♿
- [ ] Navigation clavier: Tab entre les cases
- [ ] Enter pour ouvrir modal
- [ ] Escape pour fermer modal
- [ ] Aria-labels présents sur boutons
- [ ] Contrast ratio textes >4.5:1

#### Feedback Utilisateur ✅
- [ ] Hover feedback: scale + shadow
- [ ] Click feedback: scale down
- [ ] Save success: case devient verte progressivement
- [ ] Export GIF: progress bar animée
- [ ] Erreurs: messages clairs (alert ou toast)

#### Animations Fluides ✨
- [ ] Framer Motion: modal slide-in
- [ ] Cell hover: smooth scale transition
- [ ] Progress bar: linear interpolation
- [ ] Phase colors: gradient transitions

---

## 🐛 Bugs Connus à Vérifier

1. **Export GIF sans html2canvas:**  
   - ⚠️ GIFExporter.js nécessite html2canvas  
   - Solution: `npm install html2canvas` (déjà inclus dans build)

2. **gif.worker.js manquant:**  
   - ⚠️ Worker script doit être copié dans `public/`  
   - Solution: Copier `node_modules/gif.js/dist/gif.worker.js` → `client/public/gif.worker.js`

3. **Timezone issues dates:**  
   - ⚠️ startDate/endDate peuvent désynchroniser selon timezone  
   - Solution: Utiliser UTC ou forcer timezone côté backend

4. **Mobile landscape overflow:**  
   - ⚠️ Grille 53 colonnes déborde sur mobile landscape  
   - Solution: Scroll horizontal ou réduction colonnes

---

## 📊 Résultats Attendus

### Succès Minimum (MVP)
- ✅ 3 modes fonctionnels (jours, semaines, phases)
- ✅ CRUD complet (create, read, update)
- ✅ Export GIF pour au moins 1 mode
- ✅ Responsive mobile/desktop
- ✅ Aucune erreur console critique

### Succès Idéal (Production-Ready)
- ✅ 7 modes fonctionnels (tous intervalTypes)
- ✅ Export GIF pour tous les modes
- ✅ <200ms load time
- ✅ 60fps animations
- ✅ 0 bugs critiques
- ✅ Backward compatibility 100%

---

## 📝 Notes de Test

**Testeur:**  
**Date début:** ___/___/2025  
**Date fin:** ___/___/2025  

**Environnement:**
- OS: Windows 11  
- Navigateur: Edge/Chrome  
- Résolution: 1920x1080  
- Node version: v22.x  
- Build version: Phase 4.1

**Observations:**
```
[Espace pour notes libres]
```

---

## ✅ Validation Finale

- [ ] Tous les tests critiques passent (jours/semaines/phases)
- [ ] Export GIF fonctionnel
- [ ] Aucune erreur console
- [ ] Performance acceptable (<500ms render)
- [ ] Build production OK
- [ ] Prêt pour déploiement VPS

**Approuvé par:** _____________  
**Date:** ___/___/2025
