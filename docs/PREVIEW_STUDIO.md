# Preview Studio - Système d'aperçu avancé

## Vue d'ensemble

Le **Preview Studio** est un système complet de prévisualisation et de personnalisation des reviews. Il permet aux utilisateurs de :

- ✨ Choisir parmi **6 templates** de rendu différents
- 🎨 Personnaliser les **couleurs et thèmes**
- 📋 Sélectionner les **sections à afficher**
- 👁️ Visualiser l'aperçu **en temps réel**
- 💾 Sauvegarder les préférences de style avec chaque review

## Architecture

### Fichiers principaux

- **`preview-studio.js`** : Module JavaScript principal (classe `PreviewStudio`)
- **`preview-studio.css`** : Styles pour l'interface et les rendus
- **`review.html`** : Panneau d'interface intégré
- **`app.js`** : Intégration avec le système existant

### Flux de données

```
Utilisateur clique "Afficher l'aperçu"
    ↓
app.js collecte formData + calcule scores
    ↓
previewStudio.open(reviewData)
    ↓
Génération du rendu selon config
    ↓
Affichage dans le panneau Preview Studio
```

## Templates disponibles

### 1. ⚡ Minimal
- **Description** : Scores essentiels uniquement
- **Sections par défaut** : Header, Scores
- **Usage** : Partage rapide, focus sur la note globale
- **Style** : Grande police, espacement compact

### 2. ▤ Compact
- **Description** : Vue condensée avec scores principaux
- **Sections par défaut** : Header, Cultivars, Scores, Détails
- **Usage** : Vue d'ensemble rapide
- **Style** : Police moyenne, espacement compact

### 3. ☰ Détaillé (par défaut)
- **Description** : Tous les détails de la review
- **Sections par défaut** : Toutes sauf Branding
- **Usage** : Review complète pour documentation
- **Style** : Police moyenne, espacement confortable

### 4. ▣ Carte
- **Description** : Format carte style social
- **Sections par défaut** : Header, Scores, Détails
- **Usage** : Partage sur réseaux sociaux
- **Style** : Police moyenne, coins arrondis (24px)

### 5. 📱 Story
- **Description** : Optimisé pour stories (9:16)
- **Sections par défaut** : Header, Scores, Effets
- **Usage** : Instagram/Facebook Stories
- **Style** : Grande police, espacement spacieux

### 6. 📰 Magazine
- **Description** : Mise en page éditoriale premium
- **Sections par défaut** : Header, Cultivars, Infos, Scores, Détails, Notes, Branding
- **Usage** : Publication professionnelle
- **Style** : Police moyenne, espacement spacieux

## Configuration et personnalisation

### Sections disponibles

Chaque section peut être activée/désactivée indépendamment :

| Section | Clé | Description |
|---------|-----|-------------|
| **En-tête & Titre** | `header` | Type de produit + nom du cultivar |
| **Cultivars** | `cultivars` | Détails des cultivars utilisés (pourcentage, origine) |
| **Infos générales** | `generalInfo` | Informations spécifiques au type de produit |
| **Scores** | `scores` | Score global et pourcentage |
| **Détails** | `details` | Détails par section avec scores individuels |
| **Textures** | `textures` | Section texture (si présente) |
| **Saveurs** | `flavors` | Notes de goût et fumée |
| **Effets** | `effects` | Effets et durée |
| **Notes** | `notes` | Commentaires supplémentaires |
| **Signature** | `branding` | Watermark et signature |

### Personnalisation visuelle

#### Couleurs prédéfinies

8 palettes de couleurs disponibles :

- 💚 **Emeraude** : `#34d399` (par défaut)
- 💙 **Bleu** : `#38bdf8`
- 💜 **Violet** : `#a78bfa`
- 💗 **Rose** : `#f472b6`
- 🧡 **Orange** : `#fb923c`
- 💠 **Cyan** : `#22d3ee`
- 💚 **Lime** : `#84cc16`
- 🟡 **Ambre** : `#fbbf24`

#### Thèmes

- **Sombre (dark)** : Fond `#0f1628`, texte clair
- **Clair (light)** : Fond `#f8fafc`, texte sombre

#### Options de style

- **Taille de police** : Petite / Moyenne / Grande
- **Espacement** : Compact / Confortable / Spacieux
- **Rayon des coins** : Configurable (par défaut 18px)

### Contrôles de zoom

4 niveaux de zoom disponibles dans l'aperçu :

- **50%** : Vue très réduite
- **75%** : Vue réduite
- **100%** : Taille réelle (par défaut)
- **125%** : Vue agrandie

## Utilisation

### Ouverture du Preview Studio

```javascript
// Depuis le bouton "Afficher l'aperçu"
const reviewData = {
  formData: formData,
  currentType: currentType,
  totals: totals,
  structure: productStructures[currentType],
  cultivarInfo: getCultivarInfo(),
  productIcon: getProductIcon(),
  globalScore: calculateGlobalScore().globalScore,
  maxGlobalScore: calculateGlobalScore().maxGlobalScore,
  scoreOutOf10: calculateGlobalScore().scoreOutOf10,
  percentage: calculateGlobalScore().percentage
};

previewStudio.open(reviewData);
```

### Sauvegarde de la configuration

La configuration est automatiquement sauvegardée dans `localStorage` :

```javascript
localStorage.setItem('previewStudioConfig', JSON.stringify(config));
```

### Récupération de la configuration

```javascript
const config = previewStudio.loadConfig();
```

## Intégration avec la galerie publique

### Comportement dans la galerie publique

Lorsqu'un utilisateur clique sur une review dans la galerie publique, **le style/template choisi lors de la création est utilisé** pour afficher la review.

### Comportement dans la bibliothèque personnelle

Dans la bibliothèque personnelle, **la review complète (template "Détaillé")** est toujours affichée, quelle que soit la préférence de style sauvegardée.

### Stockage de la préférence

La préférence de style d'aperçu doit être sauvegardée avec chaque review dans la base de données :

```javascript
{
  // ... autres champs de la review
  previewConfig: {
    template: 'card',
    sections: { ... },
    style: { ... }
  }
}
```

## API JavaScript

### Classe PreviewStudio

```javascript
class PreviewStudio {
  constructor()                    // Initialise le Preview Studio
  loadConfig()                     // Charge la config depuis localStorage
  saveConfig()                     // Sauvegarde la config dans localStorage
  open(reviewData)                 // Ouvre le panneau avec les données
  close()                          // Ferme le panneau
  initControls()                   // Initialise les événements UI
  setTemplate(templateName)        // Change le template actif
  toggleSection(key, enabled)      // Active/désactive une section
  setAccentColor(color)            // Change la couleur d'accent
  setColorScheme(scheme)           // Change le thème (dark/light)
  setFontSize(size)                // Change la taille de police
  setSpacing(spacing)              // Change l'espacement
  setZoom(zoom)                    // Change le zoom de l'aperçu
  generatePreview()                // Génère l'aperçu HTML
  renderPreview(data)              // Génère le HTML complet
  renderHeader(data, textColor)    // Rendu de l'en-tête
  renderCultivars(data, color)     // Rendu des cultivars
  renderScores(data, ...)          // Rendu des scores
  renderDetails(data, ...)         // Rendu des détails
  renderNotes(data, color)         // Rendu des notes
  renderBranding(color)            // Rendu du branding
}
```

### Fonctions helper globales

```javascript
getCultivarInfo()              // Extrait les infos cultivars de formData
getProductIcon()               // Retourne l'icône du type de produit
calculateGlobalScore()         // Calcule le score global et pourcentages
```

### Instance globale

```javascript
window.previewStudio           // Instance unique du Preview Studio
window.previewTemplates        // Liste des templates disponibles
window.colorPresets            // Liste des palettes de couleurs
```

## Styles CSS

### Variables CSS principales

```css
--accent: Couleur d'accent principale
--accent-hover: Couleur d'accent au survol
--accent-bg: Fond avec accent
--accent-glow: Lueur d'accent pour box-shadow
--text: Couleur du texte principal
--text-soft: Couleur du texte secondaire
--text-muted: Couleur du texte désactivé
--surface: Fond de surface
--surface-elevated: Fond de surface élevée
--surface-hover: Fond de surface au survol
--border: Couleur des bordures
```

### Classes principales

- `.preview-studio-panel` : Conteneur principal (fullscreen overlay)
- `.preview-studio-container` : Grid 3 colonnes (sidebar, preview, actions)
- `.preview-config-sidebar` : Barre latérale de configuration
- `.preview-area` : Zone d'aperçu centrale
- `.preview-actions-panel` : Panneau d'actions à droite
- `.preview-render` : Conteneur du rendu généré
- `.preview-template-btn` : Bouton de sélection de template
- `.preview-section-toggle` : Toggle de section
- `.preview-color-preset` : Preset de couleur

### Responsive

- **Desktop (>1200px)** : 3 colonnes (sidebar + preview + actions)
- **Tablet (768-1200px)** : 2 colonnes (sidebar + preview, actions en overlay)
- **Mobile (<768px)** : 1 colonne (preview fullscreen, actions en bottom sheet)

## Exemples

### Exemple 1 : Ouvrir avec données personnalisées

```javascript
previewStudio.open({
  formData: { cultivars: 'Gelato 41', ... },
  currentType: 'Hash',
  totals: { 'section-0': { sum: 18, max: 20 } },
  structure: productStructures['Hash'],
  cultivarInfo: { title: 'Gelato 41', details: [...] },
  productIcon: '🧊',
  globalScore: 82,
  maxGlobalScore: 100,
  scoreOutOf10: 8.2,
  percentage: 82
});
```

### Exemple 2 : Changer la configuration programmatiquement

```javascript
previewStudio.config.template = 'card';
previewStudio.config.style.accentColor = '#38bdf8';
previewStudio.config.sections.notes = false;
previewStudio.generatePreview();
previewStudio.saveConfig();
```

### Exemple 3 : Personnalisation avancée

```javascript
// Charger une config personnalisée
const customConfig = {
  template: 'magazine',
  sections: {
    header: true,
    cultivars: true,
    scores: true,
    details: true,
    branding: true
  },
  style: {
    colorScheme: 'light',
    accentColor: '#f472b6',
    fontSize: 'large',
    spacing: 'spacious'
  }
};

Object.assign(previewStudio.config, customConfig);
previewStudio.generatePreview();
```

## Évolutions futures

### Fonctionnalités prévues

- [ ] Export direct de l'aperçu en PNG/JPG
- [ ] Templates personnalisés (créés par l'utilisateur)
- [ ] Animations de transition entre templates
- [ ] Mode comparaison (afficher 2 styles côte à côte)
- [ ] Prévisualisation multi-résolution (mobile/tablet/desktop)
- [ ] Thèmes personnalisés avec couleurs multiples
- [ ] Import/Export de configurations de style

### Améliorations possibles

- Préchargement des templates pour performance
- Cache des rendus générés
- Support de fonts personnalisées
- Gestion des images d'arrière-plan
- Mode sombre/clair automatique selon l'heure
- Raccourcis clavier pour navigation rapide

## Dépannage

### Le panneau ne s'ouvre pas

**Cause** : `previewStudio` non chargé ou données manquantes

**Solution** :
1. Vérifier que `preview-studio.js` est bien chargé avant `app.js`
2. Vérifier la console pour erreurs JavaScript
3. S'assurer que `formData` et `currentType` sont définis

### L'aperçu est vide

**Cause** : Données de review invalides ou incomplètes

**Solution** :
1. Vérifier que `reviewData` contient toutes les propriétés requises
2. Remplir au moins un champ du formulaire
3. Vérifier que `currentType` est valide

### Les styles ne s'appliquent pas

**Cause** : Variables CSS manquantes ou conflits de styles

**Solution** :
1. Vérifier que `preview-studio.css` est chargé
2. Vérifier l'ordre de chargement des CSS
3. Inspecter les éléments pour conflits CSS

### La configuration ne se sauvegarde pas

**Cause** : `localStorage` désactivé ou quota dépassé

**Solution** :
1. Vérifier que `localStorage` est disponible
2. Nettoyer le `localStorage` si nécessaire
3. Réduire la taille de la config (supprimer champs inutiles)

## Support et contributions

Pour toute question, bug ou suggestion d'amélioration :

1. Ouvrir une issue sur GitHub
2. Contacter l'équipe de développement
3. Consulter la documentation du projet principal

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2025  
**Auteurs** : Équipe Reviews Maker
