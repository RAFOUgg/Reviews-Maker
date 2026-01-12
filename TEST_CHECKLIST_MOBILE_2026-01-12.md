# ✅ Checklist de tests mobiles - Carrousel & HomePage

## 🏠 Tests HomeP age - Titre "Terpologie"

### ✓ Desktop (1920px+)
- [ ] Titre "Terpologie" en `text-7xl` 
- [ ] Sous-titre "Créez et partagez..." en `text-xl`
- [ ] Pas de débordement de texte
- [ ] Espacement vertical: `space-y-6`

### ✓ Tablet (768px - 1024px)
- [ ] Titre passe à `text-6xl`
- [ ] Sous-titre passe à `text-lg`
- [ ] Espacement vertical correct: `space-y-6`
- [ ] Contenu centré

### ✓ Mobile (< 768px) 
- [ ] Titre passe à `text-4xl` avec `leading-tight`
- [ ] Sous-titre passe à `text-sm` avec `px-2`
- [ ] Espacement vertical réduit: `space-y-3`
- [ ] **❌ Pas de débordement** du texte à droite/gauche
- [ ] Padding global `px-3` respecté

---

## 🎠 Tests Carrousel - Création Review (Fleur, Hash, etc.)

### ✓ Desktop (1920px+)
- [ ] **TOUS les émojis affichés** (pas de carrousel)
- [ ] Layout en `flex-wrap` horizontal
- [ ] Boutons "← Précédent" et "Suivant →" visibles et fonctionnels
- [ ] Navigation clavier/souris fonctionne
- [ ] Indicateur `X/Y` visible en bas

### ✓ Tablet (768px - 1024px)
- [ ] Passer en mode mobile (flex-wrap → carrousel)
- [ ] **5 sections visibles**
- [ ] Section centrale agrandie (`scale-1.1`)
- [ ] Pas de boutons Précédent/Suivant
- [ ] Indicateur `X/Y` centré

### ✓ Mobile (< 768px) - **TESTS CRITIQUES**

#### Affichage du carrousel
- [ ] **Exactement 5 émojis affichés** (pas 3, pas 7)
- [ ] Section centrale (position 2/4) en `scale-1.1`
- [ ] Section du milieu à 100% opacity (très visible)
- [ ] Sections positions ±1: 50% opacity (semi-transparent)
- [ ] Sections positions ±2: 25% opacity (très transparent)
- [ ] Shadow sur section centrale: `drop-shadow(0 0 12px rgba(168, 85, 247, 0.4))`

#### Interactions drag
- [ ] **Pas de flèches visibles** (supprimées)
- [ ] Curseur change en "grab" au survol du carrousel
- [ ] Curseur change en "grabbing" pendant le drag
- [ ] **Drag gauche** (50px+): Section suivante devient centrale
- [ ] **Drag droite** (-50px): Section précédente devient centrale
- [ ] Drag < 50px: Pas de changement (snap back)
- [ ] Drag aux limites: Pas de débordement (index min/max)

#### Navigation par clic
- [ ] Cliquer sur un émoji change la section active
- [ ] Sélectionner une section hors de la vue: Le carrousel recentre pour la montrer
- [ ] Sélection remonte la section au centre avec animations

#### Transition et animations
- [ ] Animations fluides lors du drag (pas de saccade)
- [ ] Pas de flicker lors du changement de section
- [ ] Effet de fade smooth entre les opacités

#### Tests de bord
- [ ] Si total sections < 5: Tous visibles, pas de débordement
- [ ] Si total sections = 5: Tous visibles, parfait
- [ ] Si total sections = 6: Drag marche dans un sens
- [ ] Si total sections = 20: Drag fluide dans les deux sens partout
- [ ] Première section sélectionnée: Carrousel positionné au début
- [ ] Dernière section sélectionnée: Carrousel positionné à la fin

#### Footer (Mobile)
- [ ] Section Indicator `X/Y` visible et centré
- [ ] **Pas de boutons "Précédent/Suivant"** visibles
- [ ] Progress bar visible

#### Footer (Desktop)
- [ ] Bouton "← Précédent" à gauche
- [ ] Indicateur `X/Y` au centre avec `%`
- [ ] Bouton "Suivant →" à droite
- [ ] Tous les boutons actifs/désactivés correctement

---

## 📐 Tests responsivité

### Rotation d'écran (iPhone/Android)
- [ ] Portrait (< 768px): Carrousel 5 items, mobile layout
- [ ] Landscape: Carrousel 5 items, layout adapté
- [ ] Pas de débordement dans aucun mode

### Largeurs spécifiques
- [ ] 320px (iPhone SE): Tout adapté
- [ ] 375px (iPhone 12): Texte lisible
- [ ] 425px (Galaxy S10): Carrousel OK
- [ ] 768px (iPad): Transition desktop complète
- [ ] 1024px (iPad Pro): Desktop complet
- [ ] 1920px (Desktop): Layout large

---

## 🐛 Bugs potentiels à vérifier

- [ ] Pas de console errors en dev
- [ ] Pas de memory leaks (ref cleanup)
- [ ] Performance: FPS stable lors du drag (60fps)
- [ ] Pas de scroll horizontal accidentel
- [ ] Touch events fonctionnent sur mobile/tablet
- [ ] Mouse events fonctionnent sur desktop
- [ ] Drag-and-drop ne sélectionne pas le texte
- [ ] Pas de débordement de la div `.carousel`

---

## 🎯 Performance checks

```bash
# Build sans erreurs
npm run build

# Vérifier les assets
ls -la client/dist/

# Dev server sans lag
npm run dev
```

---

## ✨ Checklist finale

- [ ] Tous les tests mobiles passent
- [ ] Tous les tests desktop passent
- [ ] Pas de régression sur les autres pages
- [ ] Build de production OK
- [ ] Deploy sur VPS OK
- [ ] Vérification post-deploy sur mobile

---

**À tester:** Immédiatement sur vrai appareils (pas juste DevTools)  
**Navigateurs:** Chrome, Safari, Firefox  
**Appareils:** iPhone, Galaxy, iPad  
