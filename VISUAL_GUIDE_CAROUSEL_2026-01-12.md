# 📱 Guide Visuel - Carousel Mobile & Homepage

## 🏠 HomePage - Titre "Terpologie"

### Avant (❌ Non-responsive)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
║ Terpologi                          ║  ← text-7xl (trop gros)
║ Créez et partagez vos avis...      ║  ← text-xl (déborde)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Après (✅ Responsive)

#### Mobile (< 768px)
```
┌──────────────────────────────────────┐
│                                      │
│            Terpologie               │  ← text-4xl
│    Créez et partagez vos avis        │  ← text-sm, px-2
│       sur les produits cannabis      │
│                                      │
└──────────────────────────────────────┘
```

#### Tablet (768px - 1024px)
```
┌──────────────────────────────────────────────────┐
│                                                  │
│               Terpologie                        │  ← text-6xl
│        Créez et partagez vos avis               │  ← text-lg
│           sur les produits cannabis            │
│                                                  │
└──────────────────────────────────────────────────┘
```

#### Desktop (> 1024px)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                  ┃
┃                       Terpologie                               ┃  ← text-7xl
┃              Créez et partagez vos avis                        ┃  ← text-xl
┃                 sur les produits cannabis                     ┃
┃                                                                  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🎠 Carrousel - Création Review

### Avant (❌ Problème)
```
Mobile:
┌───────────────────────────────────┐
│ ◀  📋  👃  🤚  😋      ▶          │  ← 3 items + flèches
│    Très limité                    │
└───────────────────────────────────┘
```

### Après (✅ Amélioré)

#### Mobile (Drag-to-scroll, 5 items visibles)

**État 1: Sections 0-4 visibles**
```
┌─────────────────────────────────────┐
│ ░░░  ░░░  ███  ░░░  ░░░            │
│ 📋   👃   🤚   😋   💥             │
│ 25%  50% 100% 50%  25%            │  ← Opacité
│ opacity opacity opacity opacity opacity │
│                                    │
│ State: Drag-enabled, grab cursor   │  ← Interaction
│                      Section 2/10  │  ← Indicateur
└─────────────────────────────────────┘
```

**Après drag vers la gauche:**
```
┌─────────────────────────────────────┐
│ ░░░  ░░░  ███  ░░░  ░░░            │
│ 👃   🤚   😋   💥   🏡             │  ← Scroll +1
│ 25%  50% 100% 50%  25%            │
│                                    │
│ State: Drag smooth transition      │
│                      Section 3/10  │
└─────────────────────────────────────┘
```

**Après drag vers la droite:**
```
┌─────────────────────────────────────┐
│ ░░░  ░░░  ███  ░░░  ░░░            │
│ 📋   👃   🤚   😋   💥             │  ← Scroll -1
│ 25%  50% 100% 50%  25%            │
│                                    │
│ State: Normal, grab cursor         │
│                      Section 2/10  │
└─────────────────────────────────────┘
```

#### Explication opacité:

- **Position -2 (gauche extrême)**: `opacity: 0.25` → très transparent
- **Position -1 (gauche)**: `opacity: 0.50` → semi-transparent  
- **Position 0 (CENTRE)**: `opacity: 1.0` → 100% opaque + agrandissement (scale-1.1) + glow
- **Position +1 (droite)**: `opacity: 0.50` → semi-transparent
- **Position +2 (droite extrême)**: `opacity: 0.25` → très transparent

#### Visualisation du fade:
```
[1%] [5%] [25%] [50%] [100%] [50%] [25%] [5%] [1%]
 ▓▓   ▓░   ░░░   ░░░   ███   ░░░   ░░░   ▓░   ▓▓
 ↑                               ↑
 Externe                      Externe
```

#### Desktop (> 768px)

```
┌──────────────────────────────────────────────────┐
│ 📋  👃  🤚  😋  💥  🏡  🍃  🔬  📊  🎯  🌟   │  ← Tous visibles
│                                                  │
│ ← Précédent            Section 2/10          Suivant → │  ← Boutons
└──────────────────────────────────────────────────┘
```

---

## 👆 Interactions

### Drag (Mobile uniquement)
```
┌─────────────────────────────────────┐
│    Finger position X                │
│    ↓                                │
│ Start: X=200 (dragStart)            │
│    ↓ drag left                      │
│ End:   X=100 (dragEnd)              │
│ Diff = 200-100 = 100px (> 50)       │ ✅ Scroll right
│                                    │
│ ----- Threshold: 50px -----         │
│                                    │
│ Start: X=200                        │
│    ↓ drag right                     │
│ End:   X=150                        │
│ Diff = 200-150 = 50px (= 50)        │ ❌ No change
│ Need > 50px                         │
└─────────────────────────────────────┘
```

### Click (Mobile & Desktop)
```
┌─────────────────────────────────────┐
│ ░░░  ░░░  ███  ░░░  ░░░            │
│ 📋   👃   🤚   😋   💥             │
│ Click on 💥                        │
│    ↓                                │
│ onChange(index=4)                   │
│    ↓                                │
│ Section changes to 4                │
│ Carousel recenters if needed        │
└─────────────────────────────────────┘
```

---

## 📊 Breakpoints

| Appareil | Largeur | Titre | Carrousel | Boutons |
|----------|---------|-------|-----------|---------|
| iPhone SE | 320px | text-4xl | 5 items + drag | ❌ Non |
| iPhone 12/13 | 390px | text-4xl | 5 items + drag | ❌ Non |
| Galaxy S21 | 360px | text-4xl | 5 items + drag | ❌ Non |
| iPad Mini | 768px | text-6xl | Desktop mode | ✅ Oui |
| iPad | 1024px | text-7xl | Desktop mode | ✅ Oui |
| MacBook | 1920px | text-7xl | Desktop mode | ✅ Oui |

---

## 🎨 Styling Details

### Section centrale (En focus)
```css
className={`
  scale-1.1              /* Agrandie 10% */
  bg-purple-600          /* Couleur foncée */
  ring-2 ring-purple-400 /* Bordure lumineuse */
  drop-shadow(...)       /* Glow effect */
`}
```

### Sections côté (Dimmed)
```css
opacity: 0.5   /* ou 0.25 */
bg-gray-700/30 /* Plus transparent */
hover:bg-gray-700/50
```

### Curseur
```css
isDragging ? 'cursor-grabbing' : 'cursor-grab'
```

---

## ✨ Animations

- **Entrée**: `opacity: 0 → 1`, `scale: 0.8 → 1.1`
- **Sortie**: `opacity: 1 → 0`, `scale: 1.1 → 0.8`
- **Transition**: `150ms ease-out`
- **Drag**: Smooth scroll sans animation (snap)

---

## 📲 Exemple réel - Séquence d'actions

### Utilisateur sur iPhone crée une review "Fleur"

1. **Page HomePage charge** 
   ```
   ✅ Titre "Terpologie" responsive (text-4xl)
   ✅ Sous-titre lisible (text-sm)
   ✅ Pas de débordement
   ```

2. **Clique "Créer une review"**
   ```
   ✅ Page caroussel sections charge
   ✅ 5 émojis visibles: 📋 👃 🤚 😋 💥
   ✅ Section 1 (👃) au centre, opaque
   ```

3. **Swipe (drag) vers la gauche**
   ```
   ✅ Carousel glisse vers la droite
   ✅ Section 2 (🤚) devient centrale
   ✅ Smooth transition sans flick
   ✅ Indicateur: "2/10"
   ```

4. **Clique sur 💥 (section 4)**
   ```
   ✅ Contenu change immédiatement
   ✅ Carrousel recentre avec 💥 au centre
   ✅ Pas de page reload
   ```

5. **Remplit le formulaire et clique "Suivant"**
   ```
   ✅ Progresse à la section suivante
   ✅ Carousel auto-scroll si nécessaire
   ✅ Footer montre "3/10"
   ```

---

**Résultat final:** ✅ Expérience mobile fluide et intuitive  
