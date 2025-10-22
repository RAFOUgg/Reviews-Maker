# 🎨 Export Studio - Documentation

## Vue d'ensemble

Export Studio est un système avancé de génération et d'export d'images pour Reviews Maker. Il permet de créer des rendus visuels professionnels et hautement personnalisables de vos reviews.

## Fonctionnalités principales

### 📐 Templates de rendu

5 templates professionnels sont disponibles, chacun optimisé pour un usage spécifique :

#### ⚡ Minimal
- **Usage** : Partage rapide, aperçu compact
- **Dimensions** : 800 × 1000 px
- **Contenu** : En-tête + Scores principaux
- **Style** : Design épuré, focus sur l'essentiel

#### 🎴 Carte
- **Usage** : Instagram, réseaux sociaux (format 4:5)
- **Dimensions** : 1080 × 1350 px
- **Contenu** : En-tête + Scores + Détails essentiels
- **Style** : Format carte avec coins arrondis

#### ✨ Studio (par défaut)
- **Usage** : Qualité professionnelle, présentation complète
- **Dimensions** : 1200 × 1800 px
- **Contenu** : Toutes les sections disponibles
- **Style** : Mise en page premium avec effets de lumière

#### 📱 Réseaux sociaux
- **Usage** : Stories Instagram/Facebook (format 9:16)
- **Dimensions** : 1080 × 1920 px
- **Contenu** : Optimisé pour lecture mobile
- **Style** : Texte large, hiérarchie visuelle forte

#### 📰 Magazine
- **Usage** : Publication éditoriale, impression
- **Dimensions** : 1400 × 2000 px
- **Contenu** : Layout éditorial complet
- **Style** : Fond clair, typographie élégante

### 🎛️ Options de personnalisation

#### Sections affichées
Cochez/décochez les éléments à inclure :
- ✅ En-tête & Titre
- ✅ Scores & Notes
- ✅ Détails par section
- ✅ Notes & Commentaires
- ✅ Signature & Date

#### Couleurs
- **Couleur principale** : Accent utilisé pour les scores et éléments clés
- **Presets** : 6 couleurs prédéfinies (Émeraude, Bleu, Violet, Rose, Orange, Jaune)
- **Thème** : Sombre ou Clair

#### Qualité
- **Échelle** : 1x à 4x (multiplicateur de résolution)
  - 1x : Standard (rapide)
  - 2x : Haute qualité (recommandé)
  - 3-4x : Qualité exceptionnelle (impression)

#### Format d'export
- **PNG** : Sans perte, idéal pour la qualité maximale
- **JPG** : Fichier plus léger, bon pour le web
- **WebP** : Format moderne, excellent compromis qualité/taille

### 🖼️ Aperçu en temps réel

L'aperçu central se met à jour instantanément quand vous modifiez les options :
- **Zoom** : 50%, 75%, 100% pour vérifier les détails
- **Navigation** : Scroll pour voir l'image complète
- **Temps réel** : Toutes les modifications sont visibles immédiatement

### ✍️ Personnalisation du branding

- **Signature** : Ajoutez votre nom ou pseudo en bas de l'image
- **Watermark** : "Reviews Maker" par défaut
- **Logo** : 🌿 icône affichée automatiquement
- **Date** : Date de génération formatée en français

## Utilisation

### Ouverture du studio

1. Complétez une review dans l'éditeur
2. Cliquez sur le bouton **"📸 Exporter en image"**
3. Export Studio s'ouvre avec l'aperçu par défaut

### Configuration

1. **Choisir un template** dans la sidebar gauche
2. **Personnaliser** les couleurs, sections, qualité
3. **Prévisualiser** en temps réel au centre
4. **Vérifier** les dimensions dans le panneau droit

### Export

1. Sélectionnez le **format** (PNG/JPG/WebP)
2. Ajoutez une **signature** si désiré
3. Cliquez sur **"📥 Télécharger l'image"**
4. L'image est générée et téléchargée automatiquement

### Raccourcis

- `ESC` : Fermer Export Studio
- Clic extérieur : Fermer le modal

## Architecture technique

### Fichiers

```
export-studio.js        # Module de génération (ExportRenderer)
export-studio.css       # Styles de l'interface et des rendus
export-studio-ui.js     # Gestionnaire d'interface utilisateur
```

### Classes principales

#### `ExportRenderer`
Classe qui génère le HTML stylisé et l'image finale.

**Méthodes** :
- `generateHTML()` : Génère le HTML complet du rendu
- `generateImage()` : Capture le HTML avec html2canvas
- `downloadImage(filename)` : Télécharge l'image générée

**Usage** :
```javascript
const renderer = new ExportRenderer(config, data);
const html = renderer.generateHTML();
await renderer.downloadImage('review.png');
```

#### Configuration

```javascript
const config = {
  template: 'studio',
  dimensions: {
    width: 1200,
    height: 1800,
    scale: 2,
    format: 'png'
  },
  sections: {
    header: true,
    scores: true,
    details: true,
    notes: true,
    branding: true
  },
  style: {
    colorScheme: 'dark',
    accentColor: '#34d399',
    backgroundColor: '#0f1628',
    fontFamily: 'Inter'
  },
  branding: {
    watermark: 'Reviews Maker',
    signature: null
  }
};
```

### Données requises

```javascript
const data = {
  formData: { /* données du formulaire */ },
  currentType: 'Hash',
  totals: { /* totaux par section */ },
  cultivarInfo: { title: '...', details: [...] },
  productIcon: '🧊',
  structure: { /* structure du type de produit */ },
  globalScore: 85.5,
  maxGlobalScore: 100,
  scoreOutOf10: 8.5,
  percentage: 85.5
};
```

## Personnalisation avancée

### Ajouter un nouveau template

1. Définir dans `exportTemplates` :

```javascript
exportTemplates.custom = {
  name: '🎯 Custom',
  description: 'Mon template personnalisé',
  dimensions: { width: 1000, height: 1400 },
  layout: 'custom',
  showSections: ['header', 'scores'],
  style: {
    fontSize: 'large',
    padding: 80,
    spacing: 'comfortable'
  }
};
```

2. Ajouter les styles CSS correspondants :

```css
.export-custom {
  /* Styles spécifiques */
}
```

### Modifier les couleurs par défaut

Dans `export-studio.css`, ajoutez vos presets :

```css
.color-mycolor { background: #yourcolor; }
```

Puis dans le HTML :

```html
<div class="color-mycolor export-color-preset" data-color="#yourcolor"></div>
```

## Optimisations

### Performance
- Les aperçus utilisent du HTML/CSS pur (pas de canvas)
- La génération d'image n'a lieu qu'au téléchargement
- Les polices sont préchargées via Google Fonts

### Qualité
- Support multi-échelle (1x à 4x)
- Anti-aliasing activé
- Polices web natives pour meilleur rendu

### Compatibilité
- html2canvas pour la capture
- Formats PNG, JPG, WebP supportés
- Fonctionne sur tous les navigateurs modernes

## Améliorations futures

### Prévu
- [ ] Export SVG vectoriel
- [ ] Templates animés (GIF/MP4)
- [ ] Éditeur drag-and-drop des éléments
- [ ] Bibliothèque de filtres visuels
- [ ] Upload de logos personnalisés
- [ ] Batch export (plusieurs reviews)
- [ ] API d'export programmable

### Suggestions bienvenues
Ouvrez une issue sur GitHub pour proposer de nouvelles fonctionnalités !

## Dépannage

### L'aperçu ne s'affiche pas
- Vérifiez que vous avez complété une review
- Rechargez la page
- Ouvrez la console pour voir les erreurs

### L'image téléchargée est floue
- Augmentez l'échelle de qualité (2x ou plus)
- Vérifiez votre navigateur supporte html2canvas

### Les couleurs ne s'appliquent pas
- Certains templates ont des couleurs fixes
- Essayez un autre template

### L'export est lent
- Réduisez l'échelle de qualité
- Fermez les autres onglets
- Désactivez les sections inutiles

## Support

Pour toute question ou problème :
- 📧 Email : support@reviews-maker.com
- 💬 Discord : [Lien vers serveur]
- 🐛 Issues : GitHub repository

---

**Version** : 1.0.0  
**Dernière mise à jour** : Octobre 2025  
**Auteur** : Reviews Maker Team
