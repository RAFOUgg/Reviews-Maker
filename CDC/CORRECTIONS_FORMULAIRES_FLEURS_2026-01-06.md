# 🔧 CORRECTIONS FORMULAIRE FLEURS - Session 6 janvier 2026

## Problèmes identifiés et statut

### ✅ Section 1 - Infos Générales
**Problèmes :**
- ~~Boutons type génétique non responsive~~ → ✅ **DÉJÀ CORRIGÉ** (SegmentedControl avec grid responsive)
- ~~Photo tags manquants~~ → ✅ **DÉJÀ CORRIGÉ** (PHOTO_TAGS avec togglePhotoTag)

**État : Conforme CDC**

---

### 🔄 Section 2 - Génétiques & PhenoHunt
**Problèmes :**
- Système canva génétique non implémenté
- Manque volet latéral (Fleurs + Projets)
- Manque zone drag & drop avec fond points
- Manque barre outils relations parenté

**État : Refonte complète nécessaire (Phase 7 du plan)**

---

### ⚠️ Section 3 - Pipeline Culture
**Problèmes identifiés:**
1. Bugs drop données dans cases
2. Ctrl+Click sélectionne tout (comportement inattendu)
3. Système pipeline incomplet

**État : En cours de finalisation (Phase 1)**

---

### 🎨 Section 5 - Visuel & Technique
**Problèmes :**
1. ❌ Jauges colorées (`/`) → Doivent être blanches
2. ❌ Manque roue de couleur visuelle
3. ❌ Manque weed stylisée qui change couleur

**Corrections à appliquer :**
```jsx
// AVANT (coloré) :
<LiquidSlider color="green" />

// APRÈS (blanc) :
<LiquidSlider color="white" />
```

---

### 🎨 Section 6 - Odeurs
**Problèmes :**
1. ❌ Fond blanc derrière odeurs (incompatible thème dark)

**Corrections à appliquer :**
```jsx
// Fichier : OdorSection.jsx ligne ~27
// AVANT :
className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80..."

// APRÈS :
className="space-y-8 p-6 bg-gray-900/90 dark:bg-gray-900/95..."
```

---

### 🎨 Section 7 - Texture
**Problèmes :**
1. ❌ Jauges colorées → Doivent être blanches

**Corrections à appliquer :**
```jsx
// Tous les LiquidSlider :
<LiquidSlider color="white" />
```

---

### 🍓 Section 8 - Goûts
**Problèmes :**
1. ❌ Tous les emojis sont 🍓 (fraise)
2. ❌ Jauges colorées → Doivent être blanches

**Cause :** Utilisation de `note.familyIcon` qui renvoie toujours l'emoji de la famille (fruity = 🍓)

**Solution :** Créer mapping emoji par note individuelle

**Corrections à appliquer :**
- Ajouter emojis individuels dans `tasteNotes.js`
- Modifier `TasteSection.jsx` pour utiliser `note.icon` au lieu de `note.familyIcon`

---

### 💥 Section 9 - Effets
**Problèmes :**
1. ❌ Jauges colorées → Doivent être blanches

**Corrections à appliquer :**
```jsx
// Tous les LiquidSlider :
<LiquidSlider color="white" />
```

---

### 🔥 Section 10 - Pipeline Curing
**Problèmes :**
1. ❓ Core pipeline différent de Section 3
2. ❓ Pourquoi 2 systèmes différents ?

**Analyse nécessaire :**
- Comparer `PipelineGitHubGrid` (Section 3) vs `CuringMaturationTimeline` (Section 10)
- Unifier sous UnifiedPipeline

---

## 🎯 Plan de corrections immédiat

### Étape 1 : Corriger jauges blanches (10 min)
- [ ] VisualSection.jsx (5 sliders)
- [ ] TextureSection.jsx (4 sliders)
- [ ] TasteSection.jsx (2 sliders)
- [ ] EffectsSection.jsx (2 sliders)

### Étape 2 : Corriger emojis goûts (15 min)
- [ ] Ajouter emojis individuels dans tasteNotes.js
- [ ] Modifier TasteSection.jsx

### Étape 3 : Harmoniser thème dark (5 min)
- [ ] OdorSection.jsx fond

### Étape 4 : Audit Pipeline Culture vs Curing (20 min)
- [ ] Comparer les 2 systèmes
- [ ] Documenter différences
- [ ] Proposer unification

---

**Total estimé : 50 minutes**
