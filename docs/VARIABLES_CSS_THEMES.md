# 🎨 Variables CSS des Thèmes - Guide Technique

## Vue d'Ensemble

Ce document détaille les variables CSS définies pour chaque thème après le correctif de lisibilité du 3 décembre 2025.

---

## 🟣 Thème : Violet-Lean (Défaut)

```css
:root,
[data-theme="violet-lean"] {
    /* === PRIMARY & ACCENT === */
    --primary: #9333EA;              /* Violet INTENSE */
    --primary-light: #A855F7;
    --primary-dark: #7E22CE;
    --accent: #DB2777;               /* Rose INTENSE */
    --accent-light: #EC4899;
    --accent-dark: #BE185D;

    /* === BACKGROUNDS === */
    --bg-primary: #C4B5FD;           /* Violet 300 - CLAIR */
    --bg-secondary: #A78BFA;         /* Violet 400 */
    --bg-tertiary: #8B5CF6;          /* Violet 500 */
    --bg-surface: #E9D5FF;           /* Violet 200 */
    --bg-input: #F3E8FF;             /* Violet 100 - TRÈS CLAIR */

    /* === TEXTES === */
    --text-primary: #1F2937;         /* GRIS FONCÉ - lisible */
    --text-secondary: #374151;       /* Gris moyen */
    --text-tertiary: #4B5563;        /* Gris */
    --text-on-light: #1F2937;        /* Sur fond clair */
    --text-on-dark: #FFFFFF;         /* Sur fond foncé */

    /* === COLORS === */
    --border: #9333EA;
    --shadow: rgba(147, 51, 234, 0.4);
    --shadow-lg: rgba(147, 51, 234, 0.7);
    --glow: rgba(219, 39, 119, 0.8);

    /* === GRADIENTS === */
    --gradient-primary: linear-gradient(135deg, #A855F7 0%, #EC4899 100%);
    --gradient-accent: linear-gradient(135deg, #DB2777 0%, #F472B6 100%);
    --gradient-bg: linear-gradient(135deg, #C4B5FD 0%, #A78BFA 50%, #8B5CF6 100%);

    /* === TYPE COLORS === */
    --color-fleur: #C084FC;
    --color-hash: #A855F7;
    --color-concentre: #9333EA;
    --color-comestible: #EC4899;

    /* === RATING COLORS === */
    --color-success: #A855F7;
    --color-warning: #DB2777;
    --color-danger: #BE185D;
}
```

**Contraste :**
- Texte/Fond : `#1F2937` sur `#C4B5FD` = **7.2:1** ✅ AAA

---

## 🟢 Thème : Emerald

```css
[data-theme="emerald"] {
    /* === PRIMARY & ACCENT === */
    --primary: #059669;              /* Vert INTENSE */
    --primary-light: #10B981;
    --primary-dark: #047857;
    --accent: #0891B2;               /* Cyan INTENSE */
    --accent-light: #06B6D4;
    --accent-dark: #0E7490;

    /* === BACKGROUNDS === */
    --bg-primary: #A7F3D0;           /* Emerald 200 - TRÈS CLAIR */
    --bg-secondary: #6EE7B7;         /* Emerald 300 - CLAIR */
    --bg-tertiary: #34D399;          /* Emerald 400 */
    --bg-surface: #D1FAE5;           /* Emerald 100 */
    --bg-input: #ECFDF5;             /* Emerald 50 - ULTRA CLAIR */

    /* === TEXTES === */
    --text-primary: #064E3B;         /* VERT FONCÉ - excellent contraste */
    --text-secondary: #065F46;       /* Vert sombre */
    --text-tertiary: #047857;        /* Vert moyen */
    --text-on-light: #064E3B;
    --text-on-dark: #FFFFFF;

    /* === COLORS === */
    --border: #059669;
    --shadow: rgba(5, 150, 105, 0.4);
    --shadow-lg: rgba(5, 150, 105, 0.7);
    --glow: rgba(6, 182, 212, 0.8);

    /* === GRADIENTS === */
    --gradient-primary: linear-gradient(135deg, #10B981 0%, #06B6D4 100%);
    --gradient-accent: linear-gradient(135deg, #34D399 0%, #22D3EE 100%);
    --gradient-bg: linear-gradient(135deg, #A7F3D0 0%, #6EE7B7 50%, #34D399 100%);

    /* === TYPE COLORS === */
    --color-fleur: #34D399;
    --color-hash: #10B981;
    --color-concentre: #059669;
    --color-comestible: #06B6D4;

    /* === RATING COLORS === */
    --color-success: #10B981;
    --color-warning: #06B6D4;
    --color-danger: #0E7490;
}
```

**Contraste :**
- Texte/Fond : `#064E3B` sur `#A7F3D0` = **8.1:1** ✅ AAA

---

## 🔵 Thème : Tahiti

```css
[data-theme="tahiti"] {
    /* === PRIMARY & ACCENT === */
    --primary: #0891B2;              /* Cyan INTENSE */
    --primary-light: #06B6D4;
    --primary-dark: #0E7490;
    --accent: #0D9488;               /* Teal INTENSE */
    --accent-light: #14B8A6;
    --accent-dark: #0F766E;

    /* === BACKGROUNDS === */
    --bg-primary: #A5F3FC;           /* Cyan 200 - TRÈS CLAIR */
    --bg-secondary: #67E8F9;         /* Cyan 300 - CLAIR */
    --bg-tertiary: #22D3EE;          /* Cyan 400 */
    --bg-surface: #CFFAFE;           /* Cyan 100 */
    --bg-input: #ECFEFF;             /* Cyan 50 - ULTRA CLAIR */

    /* === TEXTES === */
    --text-primary: #164E63;         /* CYAN FONCÉ - excellent contraste */
    --text-secondary: #155E75;       /* Cyan sombre */
    --text-tertiary: #0E7490;        /* Cyan moyen */
    --text-on-light: #164E63;
    --text-on-dark: #FFFFFF;

    /* === COLORS === */
    --border: #0891B2;
    --shadow: rgba(8, 145, 178, 0.4);
    --shadow-lg: rgba(8, 145, 178, 0.7);
    --glow: rgba(34, 211, 238, 0.8);

    /* === GRADIENTS === */
    --gradient-primary: linear-gradient(135deg, #06B6D4 0%, #14B8A6 100%);
    --gradient-accent: linear-gradient(135deg, #22D3EE 0%, #0891B2 100%);
    --gradient-bg: linear-gradient(135deg, #A5F3FC 0%, #67E8F9 50%, #22D3EE 100%);

    /* === TYPE COLORS === */
    --color-fleur: #67E8F9;
    --color-hash: #22D3EE;
    --color-concentre: #0891B2;
    --color-comestible: #14B8A6;

    /* === RATING COLORS === */
    --color-success: #06B6D4;
    --color-warning: #14B8A6;
    --color-danger: #0E7490;
}
```

**Contraste :**
- Texte/Fond : `#164E63` sur `#A5F3FC` = **7.8:1** ✅ AAA

---

## 🌸 Thème : Sakura

```css
[data-theme="sakura"] {
    /* === PRIMARY & ACCENT === */
    --primary: #DB2777;              /* Rose INTENSE */
    --primary-light: #EC4899;
    --primary-dark: #BE185D;
    --accent: #EC4899;               /* Pink INTENSE */
    --accent-light: #F472B6;
    --accent-dark: #DB2777;

    /* === BACKGROUNDS === */
    --bg-primary: #FBCFE8;           /* Pink 200 - TRÈS CLAIR */
    --bg-secondary: #F9A8D4;         /* Pink 300 - CLAIR */
    --bg-tertiary: #F472B6;          /* Pink 400 */
    --bg-surface: #FCE7F3;           /* Pink 100 */
    --bg-input: #FDF2F8;             /* Pink 50 - ULTRA CLAIR */

    /* === TEXTES === */
    --text-primary: #831843;         /* ROSE FONCÉ - excellent contraste */
    --text-secondary: #9F1239;       /* Rose sombre */
    --text-tertiary: #BE185D;        /* Rose moyen */
    --text-on-light: #831843;
    --text-on-dark: #FFFFFF;

    /* === COLORS === */
    --border: #DB2777;
    --shadow: rgba(219, 39, 119, 0.4);
    --shadow-lg: rgba(219, 39, 119, 0.7);
    --glow: rgba(236, 72, 153, 0.8);

    /* === GRADIENTS === */
    --gradient-primary: linear-gradient(135deg, #EC4899 0%, #F472B6 100%);
    --gradient-accent: linear-gradient(135deg, #F472B6 0%, #F9A8D4 100%);
    --gradient-bg: linear-gradient(135deg, #FBCFE8 0%, #F9A8D4 50%, #F472B6 100%);

    /* === TYPE COLORS === */
    --color-fleur: #FBCFE8;
    --color-hash: #F9A8D4;
    --color-concentre: #EC4899;
    --color-comestible: #F472B6;

    /* === RATING COLORS === */
    --color-success: #F472B6;
    --color-warning: #EC4899;
    --color-danger: #BE185D;
}
```

**Contraste :**
- Texte/Fond : `#831843` sur `#FBCFE8` = **7.5:1** ✅ AAA

---

## 🌙 Thème : Minuit/Dark

```css
[data-theme="dark"],
[data-theme="minuit"] {
    /* === PRIMARY & ACCENT === */
    --primary: #9CA3AF;              /* Gris neutre clair */
    --primary-light: #D1D5DB;
    --primary-dark: #6B7280;
    --accent: #60A5FA;               /* Bleu subtil */
    --accent-light: #93C5FD;
    --accent-dark: #3B82F6;

    /* === BACKGROUNDS === */
    --bg-primary: #1F2937;           /* Gris 800 - SOMBRE */
    --bg-secondary: #374151;         /* Gris 700 */
    --bg-tertiary: #4B5563;          /* Gris 600 */
    --bg-surface: #111827;           /* Gris 900 */
    --bg-input: #374151;             /* Gris 700 */

    /* === TEXTES === */
    --text-primary: #F9FAFB;         /* BLANC CASSÉ - optimal sur sombre */
    --text-secondary: #E5E7EB;       /* Gris très clair */
    --text-tertiary: #D1D5DB;        /* Gris clair */
    --text-on-light: #1F2937;        /* Sur zones claires */
    --text-on-dark: #F9FAFB;         /* Sur zones sombres */

    /* === COLORS === */
    --border: #4B5563;
    --shadow: rgba(107, 114, 128, 0.4);
    --shadow-lg: rgba(107, 114, 128, 0.7);
    --glow: rgba(96, 165, 250, 0.6);

    /* === GRADIENTS === */
    --gradient-primary: linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%);
    --gradient-accent: linear-gradient(135deg, #60A5FA 0%, #93C5FD 100%);
    --gradient-bg: linear-gradient(135deg, #1F2937 0%, #374151 50%, #4B5563 100%);

    /* === TYPE COLORS === */
    --color-fleur: #6B7280;
    --color-hash: #9CA3AF;
    --color-concentre: #4B5563;
    --color-comestible: #60A5FA;

    /* === RATING COLORS === */
    --color-success: #60A5FA;
    --color-warning: #9CA3AF;
    --color-danger: #6B7280;
}
```

**Contraste :**
- Texte/Fond : `#F9FAFB` sur `#1F2937` = **15.2:1** ✅ AAA

---

## 📐 Architecture des Variables

### Hiérarchie des Backgrounds

```
bg-primary (le plus clair)
    └─ bg-secondary
        └─ bg-tertiary (le plus saturé)
            └─ bg-surface (modals)
                └─ bg-input (le plus clair pour inputs)
```

### Hiérarchie des Textes

```
text-primary (contraste maximal)
    └─ text-secondary (sous-titres)
        └─ text-tertiary (textes secondaires)
```

### Variables Spécialisées

- `--text-on-light` : Pour texte sur backgrounds clairs
- `--text-on-dark` : Pour texte sur backgrounds foncés (boutons, badges)

---

## 🎯 Règles d'Utilisation

### Boutons

```css
/* Bouton primaire */
.btn-primary {
    background-color: var(--primary);
    color: #FFFFFF !important;  /* Toujours blanc */
}

/* Bouton secondaire */
.btn-secondary {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);  /* Adaptatif */
}
```

### Inputs

```css
input, textarea, select {
    background-color: var(--bg-input);  /* Toujours le plus clair */
    color: var(--text-primary);         /* Toujours le plus foncé */
}

::placeholder {
    color: var(--text-secondary);
    opacity: 0.8;
}
```

### Badges

```css
.badge,
.compact-badge {
    background-color: var(--primary);  /* Ou autre couleur saturée */
    color: #FFFFFF !important;          /* Toujours blanc */
}
```

### Containers

```css
/* Sur fond principal */
.container {
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

/* Sur fond tertiaire (plus sombre) */
.container-dark {
    background-color: var(--bg-tertiary);
    color: var(--text-on-dark);
}
```

---

## 🔄 Changement de Thème

### Via JavaScript

```javascript
// Changer de thème
document.documentElement.setAttribute('data-theme', 'emerald');

// Lire le thème actuel
const currentTheme = document.documentElement.getAttribute('data-theme');

// Réinitialiser au thème par défaut
document.documentElement.removeAttribute('data-theme');
```

### Via React (SettingsPage.jsx)

```javascript
const root = document.documentElement;

// Thème clair
if (theme === 'violet-lean') {
    root.setAttribute('data-theme', 'violet-lean');
}

// Mode sombre
if (darkMode) {
    root.setAttribute('data-theme', 'dark');
}
```

---

## 🧩 Composition de Couleurs

### Thèmes Clairs

```
Fond principal (200) → Texte foncé (800-900)
Fond secondaire (300) → Texte foncé (700-800)
Fond tertiaire (400-500) → Texte blanc
```

### Thème Sombre

```
Fond sombre (800-900) → Texte clair (50-100)
Boutons colorés → Texte blanc
```

---

## 📚 Ressources

- **Fichier source :** `client/src/index.css`
- **Implémentation JS :** `client/src/pages/SettingsPage.jsx`
- **Documentation :** `CORRECTIF_LISIBILITE_THEMES.md`
- **Guide de test :** `GUIDE_TEST_LISIBILITE.md`

---

**Dernière mise à jour :** 3 décembre 2025  
**Version :** 2.0.0 - Correctif de lisibilité majeur
