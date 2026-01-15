# Bibliothèque - Système de Ressources Utilisateur

## 📋 Overview

La **Bibliothèque** est le système de gestion centralisé des ressources sauvegardées et réutilisables de l'utilisateur.

---

## 🗂️ Sections de la Bibliothèque

### **1. CULTIVARS & GÉNÉTIQUES**

**Disponibilité**: Producteur seulement

#### Fonctionnalités

**Création Cultivar**
- Nom cultivar
- Breeder
- Type: Indica | Sativa | Hybride
- Génétique %: Indica/Sativa
- Code phénotype
- Traits distinctifs
- Photos (1-4)
- Historique reviews utilisant ce cultivar

**Arbre Généalogique**
- Sélection parents depuis biblio
- Création lignée visuelle
- Drag & drop dans canvas
- Export généalogie (image/PDF)

**Gestion**
- Édition
- Suppression
- Duplication
- Statistiques d'utilisation

**Filtres**
- Par breeder
- Par type (Indica/Sativa/Hybride)
- Par traits
- Recherche libre

---

### **2. REVIEWS SAUVEGARDÉES**

**Disponibilité**: Tous les niveaux

#### Fonctionnalités

**Affichage**
- Liste avec filtres:
  - Par type produit (Fleurs, Hash, Concentré, Comestible)
  - Par date création/modification
  - Par statut (brouillon, finalisée, publiée)
  - Recherche par titre/cultivar

- Galerie (cards avec aperçu)

**Actions**
- Édition review
- Duplication review
- Suppression
- Partage (lien privé)
- Visibilité publique/privée
- Publication galerie publique

**Export depuis Library**
- Sélection review
- Choix template
- Format sortie
- Téléchargement / partage social

---

### **3. TEMPLATES & APERÇUS EXPORT**

**Disponibilité**: Tous (prédéfinis) | Producteur/Influenceur (personnalisés)

#### Saved Templates

**Prédéfinis (lecture seule)**
- Compact
- Détaillé
- Complète
- Influenceur

**Personnalisés Utilisateur (créés)**
- Créer nouveau template
- Éditer template existant
- Duplicata template
- Supprimer template

**Détails Template Sauvegardé**
```json
{
  "id": "template-uuid",
  "name": "Template Custom Fleur",
  "description": "Template personnalisé pour fleurs",
  "templateType": "custom",
  "exportConfig": {
    "formats": ["png", "pdf"],
    "canvaFormat": "1:1",
    "sections": [
      "general_info",
      "visual_technique",
      "odors",
      "effects"
    ],
    "includePipeline": true,
    "pipelineDepth": "full"
  },
  "appearance": {
    "theme": "dark",
    "colorScheme": {
      "primary": "#FF6B6B",
      "secondary": "#4ECDC4",
      "background": "#1A1A2E"
    },
    "fonts": {
      "heading": "Montserrat",
      "body": "Open Sans"
    },
    "watermark": {
      "enabled": true,
      "watermarkId": "wm-uuid"
    }
  },
  "isDefault": false,
  "usageCount": 5,
  "lastUsed": "2025-01-14T10:30:00Z",
  "createdAt": "2025-01-10T15:20:00Z"
}
```

**Utilisation**
- Sélectionner comme default pour nouvelle review
- Voir statistiques utilisation
- Partager template avec autres utilisateurs (code unique)
- Importer template partagé (code)

---

### **4. FILIGRANES PERSONNALISÉS**

**Disponibilité**: Tous (limité) | Producteur/Influenceur (complet)

#### Gestion Filigranes

**Créer Filigrane**
- Type: `select` - "Texte" | "Image" | "Logo"
- Contenu: string (texte) ou URL (image)
- Position: `select` - Angles, centres, custom
- Opacité: slider 0-100%
- Échelle: slider 0.1x - 2.0x
- Prévisualisation en temps réel

**Gestion**
- Édition
- Suppression
- Duplication
- Marquage comme "default"
- Statistiques d'utilisation

**Filtres**
- Par type (texte/image/logo)
- Par utilisation récente
- Par défaut/personnalisé

---

### **5. DONNÉES RÉCURRENTES** (Producteur seulement)

Interface d'auto-save de données fréquemment utilisées pour pré-remplir formulaires.

#### Substrats Récurrents
```json
{
  "name": "Terre Bio Premium",
  "type": "organique",
  "volume": 50,
  "composition": {
    "terre": 50,
    "coco": 30,
    "perlite": 20
  },
  "brands": ["BioBizz", "Plagron"],
  "usageCount": 8,
  "lastUsed": "2024-12-15"
}
```

#### Engrais Récurrents
```json
{
  "name": "Engrais Cannabis Pro",
  "type": "chimique",
  "brand": "Advanced Nutrients",
  "dosage": "2ml/L",
  "frequency": "each_watering",
  "usageCount": 15,
  "lastUsed": "2025-01-12"
}
```

#### Matériel Récurrent
```json
{
  "name": "Lampe LED 600W",
  "type": "LED",
  "spectrum": "full_spectrum",
  "power": 600,
  "brand": "Gavita",
  "usageCount": 5,
  "lastUsed": "2024-12-20"
}
```

#### Techniques Récurrentes
```json
{
  "name": "SCROG Grid",
  "technique": "scrog",
  "description": "Grille 60x80cm",
  "usageCount": 12,
  "notes": "Très efficace, rendement +20%"
}
```

---

## 📊 Statistiques Bibliothèque

### Vue d'ensemble
- Total reviews créées: int
- Total exports réalisés: int
- Cultivars enregistrés: int
- Templates personnalisés: int
- Filigranes créés: int

### Par Type Produit
- Fleurs: count reviews
- Hash: count reviews
- Concentré: count reviews
- Comestible: count reviews

### Tendances
- Produits les plus documentés
- Cultivars préférés
- Templates les plus utilisés
- Données récurrentes les plus employées

---

## 🔄 Gestion Bibliothèque

### Partage Ressources

**Partage Template**
```
Générer lien unique:
├─ Copier code partage
├─ Lien de partage direct
├─ QR code
└─ Partage réseau social (si public)
```

**Importer Template Partagé**
```
Utilisateur peut:
├─ Copier/coller code partage
├─ Scanner QR code
├─ Cliquer lien direct
└─ Approuver import + renommer
```

### Sauvegarde & Backup

**Auto-save**
- Reviews en cours de création
- Templates modifiés
- Filigranes récemment créés

**Export Complet Bibliothèque**
```json
{
  "backup_date": "2025-01-14",
  "user_id": "user-uuid",
  "reviews": [...],
  "templates": [...],
  "watermarks": [...],
  "cultivars": [...],
  "recurringData": [...]
}
```

---

## 🔍 Recherche & Filtrage Avancé

**Filtres Multi-level**
```
Bibliothèque
├─ Type ressource (cultivar, review, template, watermark)
├─ Sous-filtres selon type:
│  ├─ Reviews: par type produit, date, statut
│  ├─ Templates: par type, utilisations
│  ├─ Cultivars: par breeder, type génétique
│  └─ Données: par catégorie (substrat, engrais, etc.)
├─ Tri par: créé, modifié, utilisation, nom
└─ Recherche libre (full-text)
```

---

## 💾 Modèle de Données

### LibraryItem (Générique)
```typescript
model LibraryItem {
  id: String @id
  userId: String
  
  itemType: String // "review" | "template" | "watermark" | "cultivar" | "recurring"
  itemId: String // Reference vers item réel
  
  archived: Boolean @default(false)
  pinned: Boolean @default(false)
  
  tags: String[]
  notes: String?
  
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## 🔗 Fichiers Référence

- Frontend: `client/src/pages/Library*.jsx`
- Backend: `server-new/routes/library.js`
- Schema: `server-new/prisma/schema.prisma`
- Hooks: `client/src/hooks/useLibrary.js`

