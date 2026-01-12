# 🧪 Guide de test - Carrousel & HomePage Mobile

## 🚀 Lancer l'application en développement

```bash
# Terminal 1: Frontend
cd client
npm run dev
# ➜ http://localhost:5173/

# Terminal 2: Backend (optionnel pour voir les data)
cd server-new
npm run dev
# ➜ http://localhost:3000
```

---

## 📱 Tests sur simulateur (DevTools Chrome)

### 1. Vérifier la responsive du titre

**Étape 1:** Ouvrir DevTools (F12)  
**Étape 2:** Cliquer sur "Toggle device toolbar" (Ctrl+Shift+M)  
**Étape 3:** Changer la résolution:

```
iPhone SE (375x667):
  ✓ Titre "Terpologie" doit être en text-4xl
  ✓ Sous-titre "Créez et partagez..." doit être en text-sm
  ✓ Pas de débordement à droite/gauche

Tablet (768x1024):
  ✓ Titre passe à text-6xl
  ✓ Sous-titre passe à text-lg

Desktop (1920x1080):
  ✓ Titre en text-7xl (le plus grand)
  ✓ Sous-titre en text-xl
```

---

### 2. Vérifier le carrousel (Création review)

**Étape 1:** Sur iPhone (375px), cliquer "Créer une review Fleur"  
**Étape 2:** Vérifier le carrousel en haut:

```
✓ EXACTEMENT 5 sections visibles (📋 👃 🤚 😋 💥)
✓ Section du milieu (position 2) plus grande et brillante
✓ Sections côté progressivement transparentes
✓ Pas de flèches (ou chevron icons)
✓ Pas de boutons "Précédent/Suivant" dans le header
```

---

### 3. Tester le drag-to-scroll

**Étape 1:** En mode mobile (375px), faire un drag horizontal:

#### Drag vers la GAUCHE (50px+):
```
Avant:  📋 👃 🤚 😋 💥
Drag:   ↶ drag left 
Après:  👃 🤚 😋 💥 🏡

✓ Carousel glisse vers la droite
✓ Nouvelle section (🏡) apparaît à droite
✓ Transition fluide
✓ Pas de flicker
```

#### Drag vers la DROITE (50px+):
```
Avant:  👃 🤚 😋 💥 🏡
Drag:   drag right ↷
Après:  📋 👃 🤚 😋 💥

✓ Carousel glisse vers la gauche
✓ Section (📋) réapparaît à gauche
✓ Transition fluide
```

#### Drag petit (< 50px):
```
Avant:  📋 👃 🤚 😋 💥
Drag:   drag 30px left
Après:  📋 👃 🤚 😋 💥

✓ Rien ne change (snap back)
✓ Pas de transition
```

---

### 4. Tester le clic sur un emoji

**Étape 1:** Dans le carrousel, cliquer sur le dernier emoji visible (💥):

```
Avant:  State = Section 1 (👃)
Click:  On 💥 (index 4)
Après:  State = Section 4 (💥)
         Formulaire change
         Carrousel recentre si nécessaire

✓ Contenu change immédiatement
✓ Pas de reload de page
```

**Étape 2:** Cliquer sur un emoji en-dehors de la vue:

```
Current carousel: 📋 👃 🤚 😋 💥
Try to click:    🏡 (not visible)

✓ Carrousel scroll pour montrer 🏡
✓ 🏡 devient central
✓ Formulaire change
```

---

### 5. Vérifier les indicateurs

**Footer mobile:**
```
✓ Affiche "X/Y" (exemple: "3/10")
✓ Pas de boutons "Précédent/Suivant"
✓ Uniquement le compteur

Footer desktop:
✓ Bouton "← Précédent" (grisé si first)
✓ Compteur + barre de progression au centre
✓ Bouton "Suivant →" (grisé si last)
```

---

## 📱 Tests sur vrai appareil (Recommandé)

### iPhone (Safari)

1. **Lancer en local avec exposition réseau:**
   ```bash
   cd client
   npm run dev
   # Note: http://192.168.1.38:5173/
   ```

2. **Sur iPhone:**
   - Ouvrir Safari
   - Aller à: `http://192.168.1.38:5173`
   - Tester le carrousel drag
   - Vérifier pas de débordement

3. **DevTools iPhone:**
   - Settings → Safari → Advanced → Web Inspector
   - Connecter Mac et iPhone par USB
   - DevTools sur Mac verra l'iPhone

### Android (Chrome)

1. **Même réseau WiFi**

2. **Sur Chrome Android:**
   - Ouvrir: `http://192.168.1.38:5173`
   - Tester le drag (peut être différent d'iOS)
   - Vérifier les touch events

3. **DevTools Android:**
   - `chrome://inspect` sur Chrome desktop
   - Vérifier l'appareil Android est là
   - Inspecter

---

## 🐛 Bugs à chercher

### Performance
- [ ] Frame rate stable (60fps) pendant le drag
- [ ] Pas de lag ou stutter
- [ ] Transitions fluides

### UX
- [ ] Curseur = "grab" avant drag, "grabbing" pendant
- [ ] Pas de sélection de texte pendant drag
- [ ] Double-tap zoom désactivé (si needed)
- [ ] Pas de double-scroll (carrousel + page)

### Responsive
- [ ] Aucun overflow-x (scroll horizontal page)
- [ ] Padding respecté sur les côtés
- [ ] Pas de clipping du contenu

### Interaction
- [ ] Drag sur liste d'input ne interfère pas
- [ ] Click sur emoji toujours fonctionne
- [ ] Pas de preventDefault() qui casse d'autres trucs

---

## ✅ Checklist avant merge

```bash
# 1. Build sans erreurs
npm run build
# ✓ dist/ créé
# ✓ Aucune error

# 2. Dev server fonctionne
npm run dev
# ✓ http://localhost:5173 charge
# ✓ Console propre (pas d'error)

# 3. Tests visuels (DevTools)
# ✓ Mobile 375px: carousel OK
# ✓ Tablet 768px: transition OK
# ✓ Desktop 1920px: buttons OK

# 4. Tests interactifs (DevTools)
# ✓ Drag left: OK
# ✓ Drag right: OK
# ✓ Click emoji: OK

# 5. Tests sur vrai appareil
# ✓ iPhone: drag smooth
# ✓ Android: touch OK

# 6. Pas de régression
# ✓ HomePage charge
# ✓ Les autres pages inchangées
# ✓ Pas de broken links
```

---

## 🎬 Enregistrer le test

### Navigateur DevTools
```
F12 → Console → ⋮ → More tools → Rendering
Performance tab → Record
[Faire le test du carousel]
Performance tab → Stop

Analyser: 
- FPS steady?
- Long tasks?
- Paint/Composite times?
```

### Screen recording (Mac)
```bash
# Terminal
ffmpeg -f avfoundation -i "1" -t 10 carousel-test.mov
# Faire le test du drag
```

### Screen recording (Windows)
```bash
Win+G  # Xbox Game Bar
Record le test
```

---

## 📊 Résultats attendus

### Avant (❌)
```
Mobile: Titre déborde, carrousel 3 items + flèches
Desktop: Same thing (pas responsive)
```

### Après (✅)
```
Mobile:  Titre responsive, carrousel 5 items, drag, pas flèches
Tablet:  Titre grossir, carrousel desktop mode
Desktop: Grand titre, tous émojis, boutons navs
```

---

## 🔗 Fichiers à tester

| Page | URL | Test |
|------|-----|------|
| Home | `/` | Titre responsive |
| Create Flower | `/create/flower` | Carrousel drag |
| Create Hash | `/create/hash` | Carrousel drag |
| Create Concentrate | `/create/concentrate` | Carrousel drag |
| Create Edible | `/create/edible` | Carrousel drag |

---

## 📝 Notes de test

```
Date: 12 Janvier 2026
Testeur: [Votre nom]
Appareil: [iPhone 13, Galaxy S21, etc.]
OS: [iOS 15.2, Android 12, etc.]
Navigateur: [Chrome, Safari, Firefox]

Résultats:
[ ] Titre responsive: PASS/FAIL
[ ] Carrousel 5 items: PASS/FAIL
[ ] Drag left: PASS/FAIL
[ ] Drag right: PASS/FAIL
[ ] Click emoji: PASS/FAIL
[ ] Pas de débordement: PASS/FAIL
[ ] Animations fluides: PASS/FAIL

Issues trouvées:
1. [Description issue]
   Reproduction: [Étapes]
   Grave: [Critical/High/Medium/Low]

Conclusion: APPROVED / NEEDS FIXES
```

---

**Bon testing! 🚀**
