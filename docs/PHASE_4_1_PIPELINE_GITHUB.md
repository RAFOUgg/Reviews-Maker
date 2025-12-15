# 🚀 Phase 4.1 - Système PipeLines GitHub-style CDC-compliant

**Date de début**: 12 janvier 2025  
**Statut**: 🟢 EN COURS (40% complété)  
**Priorité**: ⚠️ CRITIQUE (Gap principal CDC)

---

## 📋 Objectif

Implémenter le système de **PipeLines GitHub-style** conforme au cahier des charges (CDC) pour permettre une **tracabilité évolutive 3D** (plan + temps) des processus de culture, curing, extraction et préparation.

---

## ✅ Réalisations (40%)

### 1. Composant PipelineGitHubGrid créé ✅
**Fichier**: `client/src/components/pipeline/PipelineGitHubGrid.jsx` (850+ lignes)

**Fonctionnalités implémentées**:
- ✅ **Trame configurable**: 7 types (secondes, minutes, heures, jours, semaines, mois, phases)
- ✅ **Mode phases**: 12 phases prédéfinies culture (graine → curing)
- ✅ **Grille GitHub**: 365 cases max pour mode jours (style heatmap commits)
- ✅ **Cases éditables**: Clic → Modal avec température, humidité, contenant, emballage, notes
- ✅ **Système d'intensité**: 4 niveaux visuels (vide → complet) selon complétude données
- ✅ **Tooltips**: Au survol, affichage données case
- ✅ **Configuration avancée**: Date début/fin OU durée, type curing (froid/chaud)
- ✅ **Statistiques**: Pourcentage de complétion, nombre cases renseignées
- ✅ **Animations**: Framer Motion pour survol/modal
- ✅ **Responsive**: Grid adaptatif selon type trame

**Phases prédéfinies (CULTURE_PHASES)**:
1. 🌰 Graine (1j)
2. 🌱 Germination (3j)
3. 🌿 Plantule (7j)
4. 🌳 Début Croissance (14j)
5. 🌲 Milieu Croissance (14j)
6. 🎋 Fin Croissance (7j)
7. ⬆️ Stretch (14j)
8. 🌸 Début Floraison (14j)
9. 🌺 Milieu Floraison (21j)
10. 🌻 Fin Floraison (14j)
11. 💨 Séchage (14j)
12. 📦 Curing (30j)

**Intervalles supportés (INTERVAL_TYPES)**:
- Secondes (max 3600)
- Minutes (max 1440)
- Heures (max 168)
- **Jours (max 365)** ← GitHub-style avec 53 colonnes
- Semaines (max 52)
- Mois (max 12)
- Phases (12 fixes)

### 2. Intégration dans CuringPipelineSection ✅
**Fichier**: `client/src/components/reviews/sections/CuringPipelineSection.jsx`

- ✅ Import PipelineGitHubGrid
- ✅ Remplacé ancien PipelineTimeline par PipelineGitHubGrid
- ✅ Conservé config rapide (méthode jars/groove/auto, paramètres cibles)
- ✅ Support rétrocompatibilité anciennes données (process.method)
- ✅ Handler `handlePipelineChange` pour onChange centralisé

### 3. Export mis à jour ✅
**Fichier**: `client/src/components/pipeline/index.js`

```javascript
export { default as PipelineGitHubGrid } from './PipelineGitHubGrid';
export { CULTURE_PHASES, INTERVAL_TYPES } from './PipelineGitHubGrid';
```

---

## ⏳ Prochaines étapes (60% restant)

### Phase 4.1.2 - Intégration formulaires review (20%)
**Priorité**: Haute  
**Durée estimée**: 1 jour

#### Tâches:
- [ ] Intégrer PipelineGitHubGrid dans **CreateFlowerReview**
  - Ajouter Pipeline GLOBAL culture (mode phases par défaut)
  - Conserver Pipeline CURING existant
- [ ] Intégrer dans **CreateHashReview**
  - Pipeline Séparation/Extraction (mode heures/jours)
  - Pipeline Curing (mode jours/semaines)
- [ ] Intégrer dans **CreateConcentrateReview**
  - Pipeline Extraction (mode minutes/heures selon méthode)
  - Pipeline Purification (mode heures)
  - Pipeline Curing
- [ ] Intégrer dans **CreateEdibleReview**
  - Pipeline Recette/Préparation (mode minutes/heures)

**Fichiers à modifier**:
- `client/src/pages/CreateFlowerReview.jsx`
- `client/src/pages/CreateHashReview.jsx`
- `client/src/pages/CreateConcentrateReview.jsx`
- `client/src/pages/CreateEdibleReview.jsx`

---

### Phase 4.1.3 - Backend Prisma (15%)
**Priorité**: Haute  
**Durée estimée**: 0.5 jour

#### Tâches:
- [ ] Modifier modèle `PipelineEntry` dans `schema.prisma`:
  ```prisma
  model PipelineEntry {
    id            String   @id @default(cuid())
    reviewId      String
    type          String   // 'culture', 'curing', 'extraction', 'recipe'
    
    // NEW FIELDS
    intervalType  String   // 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'phases'
    startDate     DateTime?
    endDate       DateTime?
    duration      Int?
    curingType    String?  // 'cold', 'warm'
    
    // Data cells (JSON)
    cells         Json     // { "0": { temp: 18, humidity: 62, ... }, "1": { ... } }
    
    review        Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade)
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
  }
  ```

- [ ] Créer migration: `npm run prisma:migrate dev -- --name add_pipeline_github_fields`
- [ ] Tester migration sur DB de dev
- [ ] Mettre à jour API routes:
  - `server-new/routes/reviews.js`: Save pipeline data
  - Support ancien format (rétrocompatibilité)

**Commandes**:
```bash
cd server-new
npm run prisma:generate
npm run prisma:migrate dev -- --name pipeline_github_system
```

---

### Phase 4.1.4 - Export GIF évolution (20%)
**Priorité**: Moyenne  
**Durée estimée**: 1 jour

#### Tâches:
- [ ] Installer dépendances:
  ```bash
  cd client
  npm install gif.js
  ```

- [ ] Créer utilitaire `GIFExporter.js`:
  ```javascript
  // client/src/utils/GIFExporter.js
  import GIF from 'gif.js';
  import htmlToImage from 'html-to-image';
  
  export const exportPipelineGIF = async (pipelineData, config) => {
    // 1. Créer encoder GIF
    const gif = new GIF({ workers: 2, quality: 10, width: 800, height: 600 });
    
    // 2. Capturer frames pour chaque case renseignée
    const cells = Object.keys(pipelineData.cells);
    for (let i = 0; i < cells.length; i++) {
      // Render state at cell i
      const canvas = await renderPipelineFrame(pipelineData, i);
      gif.addFrame(canvas, { delay: 200 }); // 200ms par frame
    }
    
    // 3. Render et download
    gif.on('finished', (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pipeline-evolution-${Date.now()}.gif`;
      a.click();
    });
    
    gif.render();
  };
  ```

- [ ] Ajouter bouton "Export GIF" dans PipelineGitHubGrid
- [ ] Gérer optimisation (max 50 frames pour éviter taille excessive)
- [ ] Ajouter options: vitesse (100ms, 200ms, 500ms), résolution (800px, 1200px)

---

### Phase 4.1.5 - Tests et Validation (5%)
**Priorité**: Haute  
**Durée estimée**: 0.5 jour

#### Tâches:
- [ ] Tester mode jours (365 cases)
- [ ] Tester mode semaines (52 cases)
- [ ] Tester mode phases (12 cases)
- [ ] Valider sauvegarde/chargement données
- [ ] Tester performance avec grille 365 cases
- [ ] Vérifier tooltips et modal édition
- [ ] Tester export GIF (si implémenté)
- [ ] Valider sur mobile/tablette (responsive)
- [ ] Build production et test déploiement

**Checklist validation**:
- [ ] Aucune erreur console
- [ ] Données persistées correctement
- [ ] Calcul dates début/fin fonctionnel
- [ ] Intensité visuelle cohérente
- [ ] Performance fluide (<100ms interaction)

---

## 🎯 Critères de succès Phase 4.1

### ✅ Fonctionnel
- [x] Grille GitHub-style avec 365 cases pour mode jours
- [x] 12 phases prédéfinies culture
- [x] 7 types d'intervalles (s, min, h, j, S, M, P)
- [x] Modal édition case avec tous les champs CDC
- [ ] Intégration dans 4 types de reviews
- [ ] Backend Prisma refactoré
- [ ] Export GIF évolution

### ✅ UX/UI
- [x] Animations Framer Motion fluides
- [x] Tooltips informatifs au survol
- [x] Statistiques complétion temps réel
- [x] Responsive (mobile/desktop)
- [x] Intensité visuelle (4 niveaux vert)
- [x] Légende claire (vide → complet)

### ✅ Technique
- [x] Code modulaire et réutilisable
- [x] Props onChange standardisé
- [x] Support rétrocompatibilité anciennes données
- [ ] Prisma model refactoré
- [ ] API routes mises à jour
- [ ] Build stable sans erreurs

### ✅ CDC Compliance
- [x] ✅ Trame configurable (jours/semaines/phases)
- [x] ✅ Intervalles complets (s → mois)
- [x] ✅ 12 phases prédéfinies
- [x] ✅ Cases éditables (température, humidité, etc.)
- [x] ✅ Système 3D: plan (données) + temps (timeline)
- [ ] ⏳ Export GIF évolution (en cours)
- [ ] ⏳ Intégration complète 4 types produits

---

## 📊 Métriques

| Métrique | Valeur | Cible |
|----------|--------|-------|
| **Progression Phase 4.1** | 40% | 100% |
| **Fichiers créés** | 1 | 3 |
| **Fichiers modifiés** | 2 | 8 |
| **Lignes de code ajoutées** | ~900 | ~1500 |
| **Fonctionnalités CDC** | 80% | 100% |
| **Tests validés** | 0% | 100% |

---

## 🐛 Issues connues

Aucune issue connue actuellement. Système en cours d'implémentation.

---

## 📝 Notes techniques

### Structure données Pipeline
```javascript
{
  config: {
    intervalType: 'days',
    startDate: '2025-01-01',
    endDate: '2025-04-01',
    duration: 90,
    curingType: 'cold'
  },
  cells: {
    0: { temperature: 18, humidity: 62, containerType: 'glass', notes: 'Début curing' },
    7: { temperature: 18.5, humidity: 60, containerType: 'glass', notes: 'Première semaine OK' },
    14: { temperature: 19, humidity: 58, containerType: 'glass', notes: 'Burping réduit' }
  }
}
```

### Calcul nombre de cases
- **Mode jours**: `(endDate - startDate) / 86400000` OU `duration`
- **Mode semaines**: `Math.ceil(nbJours / 7)` OU `duration`
- **Mode phases**: Toujours 12 (fixe)
- **Autres**: `duration` directement

### Grid layout
- **Jours**: 53 colonnes (comme GitHub, 1 an = 53 semaines × 7j)
- **Semaines**: 52 colonnes (1 par semaine)
- **Phases**: 4 colonnes (3 lignes de 4)
- **Autres**: Adaptatif selon durée

---

## 🔗 Fichiers clés

### Nouveaux fichiers
- `client/src/components/pipeline/PipelineGitHubGrid.jsx` ✅

### Fichiers modifiés
- `client/src/components/pipeline/index.js` ✅
- `client/src/components/reviews/sections/CuringPipelineSection.jsx` ✅

### À modifier
- `client/src/pages/CreateFlowerReview.jsx`
- `client/src/pages/CreateHashReview.jsx`
- `client/src/pages/CreateConcentrateReview.jsx`
- `client/src/pages/CreateEdibleReview.jsx`
- `server-new/prisma/schema.prisma`
- `server-new/routes/reviews.js`

### À créer
- `client/src/utils/GIFExporter.js`
- `server-new/prisma/migrations/XXX_pipeline_github_system/`

---

## 🚀 Commandes utiles

```bash
# Développement client
cd client
npm run dev

# Build production
npm run build

# Backend + Prisma
cd server-new
npm run dev
npm run prisma:studio
npm run prisma:migrate dev

# Tests
npm test

# Deploy
cd ..
./deploy-vps.sh
```

---

**Dernière mise à jour**: 12 janvier 2025 - 21:45  
**Prochaine étape**: Phase 4.1.2 - Intégration dans CreateFlowerReview  
**Responsable**: Copilot Agent  
**Statut**: 🟢 ON TRACK
