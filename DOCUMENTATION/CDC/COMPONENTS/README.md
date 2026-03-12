# 🧩 Component Documentation Center (CDC) - Components

## 📋 Vue d'Ensemble

Ce répertoire contient la documentation exhaustive des composants React de Reviews-Maker.

Chaque composant dispose d'une documentation complète incluant:
- ✅ Props & Types
- ✅ Structure interne & State management
- ✅ Logique métier & validation
- ✅ Exemples d'usage
- ✅ Intégration système
- ✅ Troubleshooting
- ✅ Évolution & roadmap

---

## 📚 Composants Documentés

### Pipelines Components (Legacy)

#### [FertilizationPipeline.jsx](./FertilizationPipeline.md)
**Catégorie:** Pipeline - Fertilization Management

**Objectif:** Gestion complète de routines d'engraissage pour cultures de cannabis

**Fichier:** `client/src/components/pipelines/legacy/FertilizationPipeline.jsx`

**Statut:** ✅ Production Ready (Legacy)

**Fonctionnalités:**
- Ajout/suppression/réorganisation d'étapes d'engraissage
- Support NPK et engrais commerciaux
- Validation conditionnelle selon type d'engrais
- Configuration dose et fréquence
- Interface responsive avec thème CSS variables

**Props Principales:**
```javascript
{
  value: Array<FertilizerStep>,
  onChange: (steps) => void,
  availableFertilizers: string[]
}
```

**Documentation Complète:** [→ FertilizationPipeline.md](./FertilizationPipeline.md)

---

## 🎯 Navigation Rapide

### Par Catégorie

**Pipelines:**
- [FertilizationPipeline](./FertilizationPipeline.md) - Routine d'engraissage

**Forms:** *(À documenter)*
- ReviewForm
- GeneralInfoSection
- GeneticsSection
- VisualsSection
- AromasSection
- TastesSection
- EffectsSection

**Export:** *(À documenter)*
- ExportMaker
- ExportTemplateSelector
- ExportPreview

**Genetics:** *(À documenter)*
- GeneticsCanvas
- CultivarLibrary
- PhenoHuntProjects

**Gallery:** *(À documenter)*
- PublicGallery
- ReviewCard

---

## 📖 Comment Utiliser Cette Documentation

### Pour Développeurs Frontend

1. **Chercher un composant:** Utilisez l'index ci-dessus
2. **Lire la section Props:** Comprendre l'interface du composant
3. **Voir les exemples:** Section "Exemples d'Usage"
4. **Intégration:** Section "Intégration Système"

### Pour Debugging

1. **Consulter "Dépannage"** dans chaque doc
2. **Vérifier props** dans PropTypes
3. **Tester avec exemples** fournis

### Pour Évolution

1. **Lire "Limitations"** actuelles
2. **Consulter "Roadmap"** pour évolutions prévues
3. **Respecter conventions** en section "Notes de Développement"

---

## 🔧 Standards de Documentation

Chaque documentation de composant suit ce template:

```markdown
# Component Name

## Vue d'Ensemble
- Fichier source
- Type de composant
- Catégorie
- Statut

## Objectif
- Cas d'usage
- Contexte

## Props & Types
- PropTypes complets
- Détails paramètres

## Structure Interne
- State management
- Hooks utilisés

## Logique Métier
- Validations
- Fonctions clés

## Structure UI
- Architecture
- Styling

## Intégration Système
- Contexte d'utilisation
- Format données

## Exemples d'Usage
- Cas simples
- Cas complexes

## Limitations & Considérations
- Techniques
- UX
- Performance

## Dépannage
- Problèmes communs
- Solutions

## Évolution & Roadmap
- Version actuelle
- Futures versions

## Références
- Docs connexes
- Fichiers reliés
```

---

## 🚀 Contribuer

### Ajouter une Documentation

1. Créer fichier `ComponentName.md` dans ce dossier
2. Suivre le template standard
3. Ajouter référence dans ce README
4. Mettre à jour index principal

### Mettre à Jour

1. Modifier le fichier .md correspondant
2. Incrémenter version en footer
3. Noter date de mise à jour

---

## 📞 Questions & Support

**Documentation manquante?** Créer une issue avec label `documentation`

**Erreur trouvée?** Créer PR avec correction

**Besoin d'exemples supplémentaires?** Commenter dans issue correspondante

---

**Dernière Mise à Jour:** 2026-01-14
**Maintenu par:** Documentation Team Reviews-Maker
