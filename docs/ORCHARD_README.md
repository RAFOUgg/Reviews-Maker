# 🌳 Orchard Studio - Système de Rendu et d'Exportation

## Vue d'ensemble

Orchard Studio est un système complet, intuitif et esthétiquement raffiné pour la prévisualisation en temps réel, le rendu personnalisable et l'exportation multi-format des reviews. L'expérience utilisateur est fluide, ergonomique et inspirée des interfaces Apple : minimaliste, claire et réactive.

**✅ INTÉGRÉ:** Orchard Studio est maintenant accessible depuis les pages de création et d'édition de reviews via le bouton **"🎨 Aperçu"** dans le header.

→ [Guide d'utilisation complet](./orchard-guide-utilisation.html)  
→ [Documentation d'intégration](./ORCHARD_INTEGRATION_COMPLETE.md)

## ✨ Fonctionnalités principales

### 🎨 Interface à deux volets
- **Volet de Configuration** (gauche) : Panneau de contrôle élégant pour configurer l'apparence
- **Volet de Prévisualisation** (droite) : Aperçu en temps réel avec mise à jour instantanée

### 🎭 Moteur de Templates Dynamiques
- **4 thèmes de base** :
  - Moderne Compact (1:1, 16:9, 9:16)
  - Fiche Technique Détaillée (16:9, 4:3, A4)
  - Article de Blog (A4, 16:9)
  - Story Social Media (9:16)
- **Ratios adaptatifs** : 1:1, 16:9, 9:16, 4:3, A4
- Basculement instantané entre les formats

### ✏️ Personnalisation "Live"

#### Typographie
- 10+ polices Google Fonts
- Contrôles de taille (20-72px pour titres, 12-32px pour texte)
- 6 niveaux de graisse (Light à Extra Bold)
- Aperçu en temps réel

#### Palette de Couleurs
- 6 palettes harmonieuses prédéfinies
- Mode personnalisé avec sélecteurs de couleur
- Support des dégradés CSS
- Contrôle des couleurs : fond, texte, accent, titre

#### Contenu Modulaire
- 13 modules activables/désactivables :
  - Titre, Note, Auteur, Image, Tags
  - Description, Date, Catégorie
  - THC/CBD, Effets, Arômes, Cultivar
- **Drag & Drop** pour réorganiser l'ordre d'affichage
- Actions rapides : Tout afficher / Tout masquer

#### Image & Branding
- Contrôle des coins arrondis (0-40px)
- Opacité de l'image (0-100%)
- 4 filtres : Aucun, Sépia, Noir & Blanc, Flou
- **Logo/Filigrane** :
  - Upload ou URL
  - 5 positions (coins + centre)
  - 3 tailles (Petit, Moyen, Grand)
  - Opacité réglable

### 💾 Gestion des Préréglages
- Sauvegarde illimitée de configurations
- Nommage et description personnalisés
- Galerie visuelle avec aperçu des couleurs
- Édition et suppression des préréglages
- Persistance locale (localStorage)

### 🔲 Canvas et templates personnalisés (nouveauté)

- Le canvas de personnalisation passe au niveau supérieur : vous pouvez désormais placer les modules où vous le souhaitez, redimensionner (width/height en pourcentage) et pivoter (rotation en degrés) chaque élément.
- La configuration du layout est persistée dans le préréglage Orchard et peut être réappliquée avec le bouton "Appliquer".
- Ajout d'un éditeur de templates minimal : créez un nouveau template (ID, nom) qui utilise un renderer générique (CustomTemplate) pour construire des templates variés à partir des modules activés et de l'ordre des modules.

### 🧩 Exportation avancée (nouveauté)

- Étendue d'export : choisissez entre l'aperçu complet, le canvas seul ou une exportation optimisée pour les réseaux sociaux (Open Graph 1200x630).
- Possibilité d'enlever le logo/filigrane pour les exports (utile pour les images de démonstration ou les CGU). Les exports Open Graph appliquent automatiquement un ratio et une mise à l'échelle optimisée.


### 📦 Exportation Multi-Format

#### PNG
- Résolution : 1x, 2x, 3x
- Option fond transparent
- Haute qualité

#### JPEG
- Qualité réglable (50-100%)
- Compression optimisée

#### PDF
- Formats : A4, Lettre, A3
- Orientations : Portrait, Paysage
- Métadonnées intégrées

#### Markdown
- Export texte brut
- Structure complète de la review
- Tags et métadonnées

## 🚀 Installation

```bash
# Dépendances déjà installées :
npm install html-to-image jspdf @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## 📖 Utilisation

### Import du composant principal

```jsx
import OrchardPanel from './components/orchard/OrchardPanel';
import './assets/orchard.css';
```

### Exemple d'utilisation

```jsx
import { useState } from 'react';
import OrchardPanel from './components/orchard/OrchardPanel';

function MyReviewApp() {
    const [showOrchard, setShowOrchard] = useState(false);
    
    const reviewData = {
        title: "Purple Haze",
        rating: 4.5,
        category: "Fleur",
        author: "John Doe",
        date: new Date().toISOString(),
        imageUrl: "/path/to/image.jpg",
        thcLevel: 22,
        cbdLevel: 0.5,
        cultivar: "Sativa",
        description: "Une variété légendaire avec des arômes fruités...",
        effects: ["Euphorique", "Créatif", "Énergisant"],
        aromas: ["Fruité", "Terreux", "Sucré"],
        tags: ["Premium", "Daytime", "Social"]
    };

    return (
        <>
            <button onClick={() => setShowOrchard(true)}>
                Ouvrir Orchard Studio
            </button>
            
            {showOrchard && (
                <OrchardPanel
                    reviewData={reviewData}
                    onClose={() => setShowOrchard(false)}
                />
            )}
        </>
    );
}
```

## 🎨 Structure du projet

```
client/src/
├── store/
│   └── orchardStore.js              # Store Zustand avec état global
├── components/
│   └── orchard/
│       ├── OrchardPanel.jsx         # Conteneur principal
│       ├── ConfigPane.jsx           # Panneau de configuration
│       ├── PreviewPane.jsx          # Panneau d'aperçu
│       ├── TemplateRenderer.jsx     # Moteur de rendu
│       ├── PresetManager.jsx        # Gestionnaire de préréglages
│       ├── ExportModal.jsx          # Modal d'exportation
│       ├── controls/
│       │   ├── TemplateSelector.jsx
│       │   ├── TypographyControls.jsx
│       │   ├── ColorPaletteControls.jsx
│       │   ├── ContentModuleControls.jsx
│       │   └── ImageBrandingControls.jsx
│       └── templates/
│           ├── ModernCompactTemplate.jsx
│           ├── DetailedCardTemplate.jsx
│           ├── BlogArticleTemplate.jsx
│           └── SocialStoryTemplate.jsx
└── assets/
    └── orchard.css                  # Styles personnalisés
```

## 🛠️ Stack Technique

- **React** : Framework UI
- **Zustand** : Gestion d'état simple et performante
- **Framer Motion** : Animations fluides
- **Tailwind CSS** : Framework CSS utility-first
- **html-to-image** : Conversion HTML → Image
- **jsPDF** : Génération de PDF
- **@dnd-kit** : Drag & Drop accessible

## 🎯 Principes de Design

### Minimalisme Fonctionnel
- Aucun élément superflu
- Chaque contrôle a une fonction claire
- Utilisation généreuse de l'espace blanc

### Feedback Visuel Instantané
- Changements immédiats dans l'aperçu
- Survols subtils
- Animations fluides et discrètes

### Accessibilité
- Navigation au clavier
- Contrastes de couleurs suffisants
- Labels ARIA appropriés

## 📊 Performances

- Rendu optimisé avec React
- Persistance locale des préréglages
- Export haute qualité sans ralentissement
- Gestion mémoire optimale

## 🔧 Configuration Avancée

### Ajouter un nouveau template

```jsx
// 1. Créer le composant template
// client/src/components/orchard/templates/MyCustomTemplate.jsx
export default function MyCustomTemplate({ config, reviewData, dimensions }) {
    // Votre implémentation
}

// 2. L'enregistrer dans orchardStore.js
const DEFAULT_TEMPLATES = {
    // ...autres templates
    myCustom: {
        id: 'myCustom',
        name: 'Mon Template',
        description: 'Description',
        layout: 'custom',
        defaultRatio: '16:9',
        supportedRatios: ['16:9', '1:1']
    }
};

// 3. L'importer dans TemplateRenderer.jsx
import MyCustomTemplate from './templates/MyCustomTemplate';

const TEMPLATES = {
    // ...
    myCustom: MyCustomTemplate
};
```

### Personnaliser les palettes de couleurs

```javascript
// Dans orchardStore.js
const COLOR_PALETTES = {
    // ...palettes existantes
    myPalette: {
        name: 'Ma Palette',
        background: 'linear-gradient(135deg, #ff0000 0%, #00ff00 100%)',
        textPrimary: '#ffffff',
        textSecondary: '#cccccc',
        accent: '#ffff00',
        title: '#ffffff'
    }
};
```

## 🐛 Dépannage

### L'export ne fonctionne pas
- Vérifiez que le conteneur `orchard-preview-container` existe
- Assurez-vous que toutes les images sont chargées
- Vérifiez les CORS pour les images externes

### Les polices ne s'affichent pas
- Ajoutez les Google Fonts dans votre HTML :
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Les préréglages ne se sauvent pas
- Vérifiez le localStorage de votre navigateur
- Assurez-vous que le domaine autorise le stockage local

## 📝 Licence

Ce système fait partie de Reviews-Maker et suit la même licence que le projet principal.

## 🤝 Contribution

Pour contribuer à Orchard Studio :
1. Créez une branche `feat/orchard-*`
2. Respectez les conventions de code
3. Testez tous les formats d'export
4. Soumettez une PR avec description détaillée

## 📞 Support

Pour toute question ou bug, ouvrez une issue sur le repo GitHub avec le tag `orchard`.

---

**Orchard Studio** - Créé avec ❤️ pour Reviews-Maker
