# Fix UI et colorimétrie - 16 décembre 2025

## 🎯 Problèmes identifiés

### 1. Variables CSS incohérentes
- **`index.css`** et **`themes-v2.css`** définissent des variables différentes
- Résultat : textes illisibles (même couleur que le fond)
- Exemple : `--text-primary` défini différemment dans chaque fichier

### 2. Boutons HomePage non centrés
- Flex layout incorrect dans HeroSection.jsx
- Boutons "Se connecter" et "Créer un compte" mal alignés

### 3. Ancienne UI Login/Register
- Design obsolète avec classes hardcodées
- Pas d'utilisation des variables CSS du thème
- Contraste insuffisant

## ✅ Solution : Système CSS unifié

### Architecture proposée
```
themes-v2.css (MASTER) 
    ↓
index.css (import + overrides minimes)
    ↓  
Composants React (utilisent var(--xxx))
```

### Variables CSS standardisées
Toutes les variables suivent la même convention dans **tous les thèmes** :

```css
/* Backgrounds */
--bg-primary: ...     /* Fond principal */
--bg-secondary: ...   /* Containers */
--bg-tertiary: ...    /* Cards */
--bg-surface: ...     /* Modals */
--bg-input: ...       /* Inputs */

/* Textes */
--text-primary: ...   /* Texte principal (contraste max) */
--text-secondary: ... /* Sous-titres */
--text-tertiary: ...  /* Textes secondaires */

/* Accents */
--accent-primary: ... /* Couleur principale */
--accent-secondary: ...
--accent-hover: ...

/* Bordures */
--border-primary: ...
--border-secondary: ...

/* Glass effect */
--glass-bg: ...
--glass-border-color: ...
--glass-shadow-color: ...
```

## 📋 Correctifs appliqués

### 1. Harmonisation `index.css`
- Import de `themes-v2.css` en priorité
- Suppression des redéfinitions conflictuelles
- Conservation uniquement des utility classes Tailwind

### 2. Centrage HeroSection.jsx
```jsx
<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  <Link to="/login">Se connecter</Link>
  <Link to="/choose-account">Créer un compte</Link>
</div>
```

### 3. Modernisation LoginPage.jsx
- Utilisation exclusive de `var(--xxx)`
- Suppression des classes hardcodées type `bg-purple-600`
- Design cohérent avec LiquidCard et LiquidButton

## 🧪 Tests à effectuer

### Test colorimétrie par thème
Pour chaque thème, vérifier :
- [ ] Textes lisibles sur tous les fonds
- [ ] Inputs avec bon contraste
- [ ] Boutons hover visibles
- [ ] Modals claires

### Thèmes à tester
1. `violet-lean` (défaut)
2. `dark`
3. `light`
4. `vert-emeraude`
5. `bleu-tahiti`
6. `sakura`

### Pages critiques
- [ ] HomePage (boutons centrés)
- [ ] LoginPage (formulaire lisible)
- [ ] RegisterPage (formulaire lisible)
- [ ] AccountChoicePage (cartes contrastées)
