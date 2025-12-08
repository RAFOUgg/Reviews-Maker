# 🧪 Guide de Test - Lisibilité des Thèmes

## Instructions de Test Rapide

### Prérequis
1. Ouvrir l'application Reviews Maker
2. Accéder aux Paramètres (Settings)
3. Localiser le sélecteur de thème

### Tests à Effectuer par Thème

#### 🟣 Thème : Violet-Lean (Défaut)

**Checklist :**
- [ ] Titre principal lisible (texte gris foncé sur fond violet clair)
- [ ] Sous-titres visibles et contrastés
- [ ] Boutons primaires : texte blanc sur fond violet
- [ ] Boutons secondaires : texte lisible sur fond clair
- [ ] Inputs : placeholder gris visible
- [ ] Inputs : texte saisi en gris foncé lisible
- [ ] Labels de formulaire en gris foncé
- [ ] Badges/modules Orchard : texte blanc sur fond coloré
- [ ] Gradients : texte blanc automatique

**Commande de test console :**
```javascript
document.documentElement.setAttribute('data-theme', 'violet-lean')
```

---

#### 🟢 Thème : Emerald

**Checklist :**
- [ ] Titre principal lisible (texte vert foncé sur fond vert clair)
- [ ] Sous-titres en vert sombre visibles
- [ ] Boutons primaires : texte blanc sur fond vert
- [ ] Boutons secondaires : texte vert foncé
- [ ] Inputs : placeholder visible
- [ ] Inputs : texte en vert foncé lisible
- [ ] Labels bien contrastés
- [ ] Badges : texte blanc sur fond vert
- [ ] Navigation et menus lisibles

**Commande de test console :**
```javascript
document.documentElement.setAttribute('data-theme', 'emerald')
```

---

#### 🔵 Thème : Tahiti

**Checklist :**
- [ ] Titre principal lisible (texte cyan foncé sur fond cyan clair)
- [ ] Sous-titres en cyan sombre visibles
- [ ] Boutons primaires : texte blanc sur fond cyan
- [ ] Boutons secondaires : texte cyan foncé
- [ ] Inputs : placeholder cyan visible
- [ ] Inputs : texte saisi lisible
- [ ] Labels contrastés
- [ ] Badges : texte blanc sur fond cyan/teal
- [ ] Cards et containers lisibles

**Commande de test console :**
```javascript
document.documentElement.setAttribute('data-theme', 'tahiti')
```

---

#### 🌸 Thème : Sakura

**Checklist :**
- [ ] Titre principal lisible (texte rose foncé sur fond rose clair)
- [ ] Sous-titres en rose sombre visibles
- [ ] Boutons primaires : texte blanc sur fond rose
- [ ] Boutons secondaires : texte rose foncé
- [ ] Inputs : placeholder rose visible
- [ ] Inputs : texte en rose foncé lisible
- [ ] Labels contrastés
- [ ] Badges : texte blanc sur fond rose
- [ ] Modals et overlays lisibles

**Commande de test console :**
```javascript
document.documentElement.setAttribute('data-theme', 'sakura')
```

---

#### 🌙 Thème : Minuit/Dark

**Checklist :**
- [ ] Titre principal lisible (texte blanc sur fond gris foncé)
- [ ] Sous-titres en gris clair visibles
- [ ] Boutons primaires : texte blanc sur fond gris
- [ ] Boutons secondaires : texte clair
- [ ] Inputs : placeholder gris clair visible
- [ ] Inputs : texte blanc lisible sur fond sombre
- [ ] Labels en blanc/gris clair
- [ ] Badges : texte blanc maintenu
- [ ] Contraste global professionnel

**Commande de test console :**
```javascript
document.documentElement.setAttribute('data-theme', 'dark')
```

---

## 🎯 Tests Spécifiques par Composant

### 1. Page d'Accueil (Index)
- [ ] Header avec logo et navigation
- [ ] Boutons d'action principaux
- [ ] Cards de présentation
- [ ] Footer

### 2. Formulaire de Création/Édition
- [ ] Tous les labels de champs
- [ ] Inputs texte, textarea, select
- [ ] Boutons de soumission
- [ ] Messages d'erreur/succès
- [ ] Sections de catégorisation

### 3. Orchard Studio
- [ ] Panel latéral des modules
- [ ] Badges de contenu (Essentiels, Renvoi, Notes Clientes...)
- [ ] Zone de prévisualisation
- [ ] Boutons d'export
- [ ] Sliders et contrôles

### 4. Galerie de Reviews
- [ ] Cards de reviews
- [ ] Notes/ratings colorées
- [ ] Badges de type (Fleur, Hash, Concentré, Comestible)
- [ ] Boutons d'action (Éditer, Supprimer)
- [ ] Filtres et recherche

### 5. Page Profil/Settings
- [ ] Sélecteur de thème lui-même
- [ ] Options de configuration
- [ ] Boutons de sauvegarde
- [ ] Informations utilisateur

---

## 🔍 Points d'Attention Critiques

### Contrastes à Vérifier Absolument

1. **Texte sur fond principal**
   - Ratio minimal : 4.5:1 (WCAG AA)
   - Ratio cible : 7:1+ (WCAG AAA) ✅

2. **Boutons**
   - Tous les boutons primaires doivent avoir texte blanc
   - Tous les boutons secondaires doivent être lisibles

3. **Inputs**
   - Placeholder visible à 80% d'opacité minimum
   - Texte saisi en contraste maximal

4. **Badges colorés**
   - Toujours texte blanc sur fond saturé
   - Vérifier particulièrement dans Orchard Studio

### Cas Limites

- [ ] **Hover states** : Vérifier que le survol ne dégrade pas la lisibilité
- [ ] **Focus states** : Les anneaux de focus doivent être visibles
- [ ] **Disabled states** : Les éléments désactivés restent identifiables
- [ ] **Dark mode overlay** : Si thème dark + modal, contraste préservé

---

## 🐛 Problèmes Connus Résolus

| Problème | Avant | Après |
|----------|-------|-------|
| Texte blanc sur fond violet clair | Invisible | Gris foncé visible |
| Boutons sans contraste | Illisible | Blanc sur coloré |
| Placeholders trop clairs | Difficile à lire | 80% opacité |
| Badges Orchard invisibles | Texte coloré sur coloré | Blanc forcé |
| Inputs clairs illisibles | Blanc sur blanc | Gris foncé |

---

## 📊 Outils de Vérification

### Dans le Navigateur

**Chrome DevTools :**
1. Inspecter un élément
2. Onglet "Computed" > Voir "color" et "background-color"
3. Utiliser "Contrast Ratio" dans le color picker

**Console Commands :**
```javascript
// Lire le thème actuel
document.documentElement.getAttribute('data-theme')

// Lire les variables CSS
getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
getComputedStyle(document.documentElement).getPropertyValue('--bg-primary')

// Forcer un thème pour test
document.documentElement.setAttribute('data-theme', 'emerald')
```

### Outils Externes

- **WebAIM Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Chrome Lighthouse** : Audit d'accessibilité
- **axe DevTools** : Extension pour tests d'accessibilité

---

## ✅ Validation Finale

**Le test est réussi si :**

1. ✅ Tous les textes sont lisibles sur tous les thèmes
2. ✅ Aucun bouton n'a de texte invisible
3. ✅ Tous les placeholders sont visibles
4. ✅ Les badges ont du texte blanc
5. ✅ Les ratios de contraste sont ≥ 7:1 (AAA)
6. ✅ Aucune régression sur le thème Dark
7. ✅ L'expérience utilisateur est améliorée

**Si un élément échoue :**

1. Noter l'élément, le thème et la page
2. Vérifier les classes CSS appliquées
3. Consulter `CORRECTIF_LISIBILITE_THEMES.md`
4. Ajouter une règle CSS spécifique si nécessaire

---

## 🚀 Commandes de Test Automatisées

```bash
# Lancer l'application
cd client
npm run dev

# Ouvrir dans le navigateur
# Windows
start msedge http://localhost:5173

# Tester les 5 thèmes en séquence (dans la console)
['violet-lean', 'emerald', 'tahiti', 'sakura', 'dark'].forEach((theme, i) => {
    setTimeout(() => {
        document.documentElement.setAttribute('data-theme', theme);
        console.log(`🎨 Thème activé : ${theme}`);
    }, i * 3000);
});
```

---

**Date du correctif :** 3 décembre 2025  
**Fichier source :** `client/src/index.css`  
**Documentation :** `CORRECTIF_LISIBILITE_THEMES.md`
