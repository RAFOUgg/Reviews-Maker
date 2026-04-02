# Section Informations Générales - Documentation Technique

**Chemin** : `client/src/pages/review/CreateFlowerReview/sections/InfosGenerales.jsx`  
**Type de Compte** : Tous  
**Dernière Mise à Jour** : 2026-04-01

---

## 📋 Vue d'Ensemble

La section **Informations Générales** collecte les métadonnées de base du produit : nom commercial, cultivar(s), producteur, photos.

---

## 🎯 Fonctionnalités

### 1. **Nom Commercial** (Requis)
Seul champ texte libre obligatoire du formulaire.

### 2. **Cultivar(s)** (Multi-sélection)
- Recherche + création depuis bibliothèque
- Multi-sélection avec drag & drop

### 3. **Farm / Producteur** (Auto-complete)
Auto-complète depuis base données utilisateur.

### 4. **Photos du Produit** (1-4)
- Formats: JPEG, PNG, WebP
- Max: 10 MB par image
- Drag & drop pour réorganiser

---

## 🔧 Structure de Données
```javascript
{
  nomCommercial: 'BioCanna - Gelato 41 - Batch 2024-12',
  cultivars: [
    { id: 'uuid-1', name: 'Gelato 41', order: 0 }
  ],
  farm: 'Green Valley Farm'
}
```

---

**Version** : 1.0.0
