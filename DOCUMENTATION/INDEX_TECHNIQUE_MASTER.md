# 📚 Documentation Technique Complète - Reviews-Maker

**Date de Création** : 2026-04-01  
**Version** : 2.0.0  
**Dernière Mise à Jour** : 2026-04-01

---

## 🎯 Organisation de la Documentation

Cette documentation est organisée par **fonctionnalité et page**, permettant une navigation intuitive et une maintenance simplifiée.

---

## 📖 Table des Matières

### [1. CREATE REVIEWS - Création de Reviews](#1-create-reviews)
- [1.1 Fleurs (Flowers)](#11-fleurs)
- [1.2 Hash](#12-hash)
- [1.3 Concentrés](#13-concentres)
- [1.4 Comestibles](#14-comestibles)
- [1.5 Export Maker](#15-export-maker)
- [1.6 Pipeline Système](#16-pipeline-systeme)

### [2. BIBLIOTHÈQUE (Library)](#2-bibliotheque)
- [2.1 Gestion Reviews](#21-gestion-reviews)
- [2.2 PhenoHunt](#22-phenohunt)

### [3. PROFILS & COMPTES](#3-profils--comptes)
- [3.1 Types de Comptes](#31-types-de-comptes)
- [3.2 Permissions](#32-permissions)

### [4. SYSTÈMES GLOBAUX](#4-systemes-globaux)
- [4.1 Sauvegarde Automatique](#41-sauvegarde-automatique)
- [4.2 Permissions](#42-permissions)

### [5. CORRECTIONS & BUGS](#5-corrections--bugs)

### [6. CDC & COMPOSANTS](#6-cdc--composants)

---

## 1. CREATE REVIEWS

### 1.1 Fleurs

#### Section 1 - Informations Générales
📄 **[INFO_GENERALES_TECHNICAL_GUIDE.md](./PAGES/CREATE_REVIEWS/FLEURS/SECTION 1 INFO GENERAL/INFO_GENERALES_TECHNICAL_GUIDE.md)**

**Contenu** :
- Nom commercial (requis)
- Cultivar(s) multi-sélection
- Farm/Producteur (auto-complete)
- Photos (1-4, drag & drop)

**Fichiers Liés** :
- `client/src/pages/review/CreateFlowerReview/sections/InfosGenerales.jsx`
- `client/src/pages/review/CreateFlowerReview/hooks/usePhotoUpload.js`

---

#### Section 2 - Génétiques & PhenoHunt
📄 **[GENETICS_PHENOHUNT_GUIDE.md](./PAGES/CREATE_REVIEWS/FLEURS/SECTION 2 GENETIC/GENETICS_PHENOHUNT_GUIDE.md)**

**Contenu** :
- Arbre généalogique (canvas drag & drop)
- Breeder, variety, type génétique
- Pourcentages Indica/Sativa
- Projets PhenoHunt
- Code phénotype

**Permissions** : 🔒 Producteur uniquement

**Fichiers Liés** :
- `client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx`
- `client/src/components/genetics/UnifiedGeneticsCanvas.jsx`

---

#### Section 3 - Pipeline Culture
📄 **[PIPELINE_CULTURE_TECHNICAL_GUIDE.md](./PAGES/CREATE_REVIEWS/FLEURS/SECTION_3_PIPELINE_CULTURE/PIPELINE_CULTURE_TECHNICAL_GUIDE.md)**

**Contenu** :
- 3 modes : Jours / Semaines / Phases
- 12 phases prédéfinies (Graine → Récolte)
- Données environnementales par étape
- Lumière, substrat, engrais, irrigation
- Palissage LST/HST
- Morphologie plante
- Export GIF d'évolution

**Permissions** : 🔒 Producteur uniquement

**Fichiers Liés** :
- `client/src/components/pipelines/sections/CulturePipelineSection.jsx`
- `client/src/components/pipelines/UnifiedPipeline.jsx`
- `client/src/utils/GIFExporter.js`

---

#### Section 4 - Données Analytiques
📄 **[ANALYTICS_TECHNICAL_GUIDE.md](./PAGES/CREATE_REVIEWS/FLEURS/SECTION_4_DONNEES_ANALYTIQUES/ANALYTICS_TECHNICAL_GUIDE.md)**

**Contenu** :
- Saisie manuelle : THC, CBD, CBG, CBC (%)
- Upload certificat cannabinoïdes (PDF/image, max 5MB)
- Upload profil terpénique (PDF/image, max 5MB)
- Conformité CDC (saisie manuelle terpènes interdite)
- Aperçu fichiers en modal

**Corrections** : ✅ Bug #1 résolu (fichiers non sauvegardés) - 2026-04-01

**Fichiers Liés** :
- `client/src/components/sections/AnalyticsSection.jsx`
- `client/src/utils/formDataFlattener.js`

---

#### Section 5 - Visuel & Technique
📄 **[VISUEL_TECHNIQUE_GUIDE.md](./PAGES/CREATE_REVIEWS/FLEURS/SECTION_5_VISUEL_TECHNIQUE/VISUEL_TECHNIQUE_GUIDE.md)**

**Contenu** :
- Roue colorimétrique interactive (12 couleurs, max 5)
- 6 sliders de notation (0-10) :
  - Densité visuelle
  - Trichomes
  - Pistils
  - Manucure
  - Moisissure (10=aucune)
  - Graines (10=aucune)

**Fichiers Liés** :
- `client/src/pages/review/CreateFlowerReview/sections/VisuelTechnique.jsx`
- `client/src/components/ui/ColorWheel.jsx`

---

#### Section 6 - Odeurs
📄 **[Documentation à venir]**

**Contenu** :
- Notes dominantes (max 7)
- Notes secondaires (max 7)
- Intensité aromatique (slider)
- Complexité (slider)
- Fidélité au cultivar (slider)

**Fichiers Liés** :
- `client/src/components/sections/OdorSection.jsx`
- `data/aromas.json`

---

#### Section 7 - Texture
📄 **[Documentation à venir]**

**Contenu** :
- Dureté, densité tactile
- Élasticité, collant
- Friabilité, viscosité
- Melting, résidus

**Fichiers Liés** :
- `client/src/components/sections/TextureSection.jsx`

---

#### Section 8 - Goûts
📄 **[Documentation à venir]**

**Contenu** :
- Intensité, agressivité
- Dry puff (tirage à sec)
- Inhalation
- Expiration/arrière-goût

**Fichiers Liés** :
- `client/src/components/sections/TasteSection.jsx`
- `data/tastes.json`

---

#### Section 9 - Effets Ressentis
📄 **[Documentation à venir]**

**Contenu** :
- Montée (rapidité)
- Intensité
- Sélection effets (max 8 avec filtres positif/négatif/neutre)
- Expérience d'utilisation :
  - Méthode consommation
  - Dosage
  - Durée effets
  - Effets secondaires

**Fichiers Liés** :
- `client/src/components/sections/EffectsSectionImpl.jsx`
- `data/effects.json`

---

#### Section 10 - Pipeline Curing/Maturation
📄 **[Documentation à venir]**

**Contenu** :
- Configuration timeline (s/m/h/j/semaines/mois)
- Type curing (froid <5°C / chaud >5°C)
- Température, humidité
- Type récipient, emballage
- Opacité, volume
- Modification tests visuels/odeurs/goûts/effets

**Permissions** : Tous (optionnel)

**Fichiers Liés** :
- `client/src/components/sections/CuringMaturationSection.jsx`

---

### 1.2 Hash

📁 **Emplacement** : `DOCUMENTATION/PAGES/CREATE_REVIEWS/HASHS/`

**Sections** :
1. Informations générales (nom, hashmaker, laboratoire, cultivars)
2. Pipeline Séparation (méthode, température, mailles, rendement)
3. Pipeline Purification (winterisation, décarboxylation, etc.)
4. Visuel & Technique (couleur/transparence, pureté, densité)
5. Odeurs (fidélité cultivars, intensité)
6. Texture (friabilité, melting, résidus)
7. Goûts
8. Effets
9. Pipeline Curing/Maturation

**Fichiers Liés** :
- `client/src/pages/review/CreateHashReview/`

---

### 1.3 Concentrés

📁 **Emplacement** : `DOCUMENTATION/PAGES/CREATE_REVIEWS/CONCENTRES/`

**Sections** :
1. Informations générales
2. Pipeline Extraction (méthodes solvants/pressions)
3. Pipeline Purification (chromatographie, filtration)
4. Visuel & Technique (viscosité, transparence, melting)
5-9. Odeurs, Texture, Goûts, Effets, Curing

**Fichiers Liés** :
- `client/src/pages/review/CreateConcentrateReview/`

---

### 1.4 Comestibles

📁 **Emplacement** : `DOCUMENTATION/PAGES/CREATE_REVIEWS/COMESTIBLES/`

**Sections** :
1. Informations générales
2. Pipeline Recette (ingrédients, étapes préparation)
3. Goûts (saveurs dominantes)
4. Effets (durée spécifique)

**Fichiers Liés** :
- `client/src/pages/review/CreateEdibleReview/`

---

### 1.5 Export Maker

📁 **Emplacement** : `DOCUMENTATION/PAGES/CREATE_REVIEWS/EXPORT_MAKER/`

**Fonctionnalités** :
- 4 templates prédéfinis (Compact, Détaillé, Complète, Influenceur)
- 4 formats canvas (1:1, 16:9, A4, 9:16)
- Export : PNG, JPEG, SVG, PDF, GIF
- Personnalisation :
  - Thème clair/sombre
  - Couleurs (palette complète)
  - Polices (Google Fonts)
  - Filigrane (position, opacité, rotation)
  - Agencement (drag & drop sections)
- Mode Producteur/Influenceur : Contenu personnalisable (drag & drop modules)
- Sauvegarde templates dans bibliothèque
- Partage templates via code unique

**Corrections** : ✅ Bug #2 résolu (données non affichées) - 2026-04-01

**Fichiers Liés** :
- `client/src/components/export/ExportMaker.jsx`
- `client/src/components/export/hooks/useReviewData.js`
- `client/src/components/export/hooks/useCanvasLayout.js`
- `client/src/components/export/services/exportService.js`

---

### 1.6 Pipeline Système

📁 **Emplacement** : `DOCUMENTATION/PAGES/PIPELINE_SYSTEME/`

**Composant Universel** : `UnifiedPipeline.jsx`

**Caractéristiques** :
- Utilisé par Culture, Curing, Séparation, Extraction, Recette
- Modes : Jours, Semaines, Heures, Minutes, Secondes, Phases
- Configuration flexible par type produit
- Données modifiables par étape
- Export GIF d'évolution
- Compatibilité rétro-active (ancienne structure data.culture)

**Fichiers Liés** :
- `client/src/components/pipelines/UnifiedPipeline.jsx`
- `client/src/utils/formDataFlattener.js`

---

## 2. BIBLIOTHÈQUE

### 2.1 Gestion Reviews

📁 **Emplacement** : `DOCUMENTATION/PAGES/BIBLIOTHEQUE/`

**Fonctionnalités** :
- Liste reviews sauvegardées
- Suppression, édition, duplication
- Gestion visibilité (public/privé)
- Sauvegarde templates/config aperçus
- Sauvegarde filigranes
- Données fréquentes (substrat, engrais, matériel)

**Fichiers Liés** :
- `client/src/pages/BibliothequeRefonte.jsx`

---

### 2.2 PhenoHunt

📁 **Emplacement** : `DOCUMENTATION/PAGES/BIBLIOTHEQUE/Phenohunt/`

**Fonctionnalités** :
- Création projets PhenoHunt
- Canvas de sélection phénotypes
- Nomination cultivars (A, B, C...)
- Tracking évolution
- Sélection gagnant → Créer cultivar

**Fichiers Liés** :
- `client/src/pages/PhenoHuntPage.jsx`
- `client/src/components/genetics/PhenoHuntCanvas.jsx`

---

## 3. PROFILS & COMPTES

### 3.1 Types de Comptes

📄 **[Documentation existante](./PAGES/PROFILS/INDEX.md)**

#### Amateur (Gratuit)
- Accès sections : Infos, Visuel, Curing, Odeurs, Goûts, Effets
- Templates : Compact, Détaillé, Complète (imposés)
- Export : PNG/JPEG/PDF moyenne qualité
- Personnalisation limitée

#### Producteur (29.99€/mois)
- Accès : Génétiques, Pipeline Culture
- Templates : Tous + Personnalisé (drag & drop)
- Export : Haute qualité (PNG/JPEG/PDF 300dpi, SVG, CSV, JSON, HTML)
- Personnalisation complète (polices, filigrane, agencement)
- Pipeline configurable

#### Influenceur (15.99€/mois)
- Aperçus détaillés + système drag & drop
- Export : Haute qualité (PNG/JPEG/SVG/PDF 300dpi)
- Template Influenceur (format 9:16)

---

### 3.2 Permissions

📄 **[PERMISSIONS.md](./PAGES/PERMISSIONS.md)**

**Hook** : `useAccountFeatures()`

```javascript
const {
  isProducteur,
  isInfluenceur,
  isAmateur,
  canConfigurePipeline,
  canAccessGeneticsCanvas,
  canExportSVG,
  canExportAdvanced,
  canCreateCustomTemplate,
  canExportGIF
} = useAccountFeatures()
```

**Fichiers Liés** :
- `client/src/hooks/useAccountFeatures.js`
- `client/src/hooks/useAccountType.js`

---

## 4. SYSTÈMES GLOBAUX

### 4.1 Sauvegarde Automatique

📄 **[INTERSAUVEGARDE.md](./PAGES/INTERSAUVEGARDE.md)**

**Fonctionnalités** :
- Auto-save toutes les 30 secondes
- Indicateur visuel (💾 Sauvegarde...)
- Détection changements (debounce 500ms)
- Gestion conflits (warn si modification concurrente)

**Fichiers Liés** :
- `client/src/hooks/useAutoSave.js`

---

### 4.2 Permissions

📄 **[PERMISSIONS.md](./PAGES/PERMISSIONS.md)**

**Système de Features Gates** :
- Contrôle accès sections
- Contrôle formats export
- Contrôle fonctionnalités avancées
- Synchronisation permissions backend

**Fichiers Liés** :
- `client/src/components/account/FeatureGate.jsx`
- `client/src/utils/permissionSync.js`

---

## 5. CORRECTIONS & BUGS

### Corrections Récentes (2026-04-01)

📄 **[CORRECTIONS_APPLIQUEES.md](../CORRECTIONS_APPLIQUEES.md)**

#### ✅ Bug #1 : Fichiers Analytiques Non Sauvegardés
**Fichiers Modifiés** :
- `client/src/utils/formDataFlattener.js`
  - Ajout `certificateFile` et `terpeneFile` dans `flattenFlowerFormData()`
  - Gestion File objects dans `createFormDataFromFlat()`

**Solution** : Les fichiers sont maintenant ajoutés au FormData comme objets File natifs (pas JSON.stringified).

---

#### ✅ Bug #2 : ExportMaker N'Affiche Pas Tous Les Contenus
**Fichiers Modifiés** :
- `client/src/components/export/hooks/useReviewData.js`
  - Support clés françaises (`odeurs`, `gouts`, `effets`)
  - Fonctions de normalisation (français → anglais)
  - Mapping automatique champs imbriqués

**Solution** : `templateData` normalise maintenant tous les formats de champs (français/anglais, imbriqué/plat).

---

## 6. CDC & COMPOSANTS

### Cahier des Charges

📁 **Emplacement** : `DOCUMENTATION/CDC/`

**Documents Clés** :
- Spécifications fonctionnelles
- Règles métier (PipeLine model)
- Contraintes techniques
- Wireframes

---

### Composants Réutilisables

📁 **Emplacement** : `DOCUMENTATION/CDC/COMPONENTS/`

**Composants Documentés** :
- FertilizationPipeline
- UnifiedPipeline
- ColorWheel
- LiquidUI (LiquidCard, LiquidInput, LiquidSlider, etc.)

**Fichiers Liés** :
- `client/src/components/ui/LiquidUI.jsx`
- `client/src/components/ui/LiquidGlass.jsx`

---

## 📝 Conventions de Documentation

### Nommage des Fichiers
- **Pages/Fonctionnalités** : `FEATURE_NAME_TECHNICAL_GUIDE.md`
- **Index Section** : `INDEX.md` ou `README.md`
- **Corrections** : `CORRECTIONS_APPLIQUEES.md`

### Structure Markdown
```markdown
# Titre - Documentation Technique

**Chemin** : `client/src/.../Component.jsx`
**Type de Compte** : Tous | Producteur | Influenceur
**Dernière Mise à Jour** : YYYY-MM-DD

---

## 📋 Vue d'Ensemble
## 🎯 Fonctionnalités
## 🔧 Implémentation Technique
## 🎨 UI/UX
## 📤 Affichage dans ExportMaker (si applicable)
## ⚠️ Problèmes Connus & Solutions
## 🧪 Tests
## 📚 Références
```

---

## 🔗 Liens Rapides

### Développement Local
- **Setup** : `DOCUMENTATION/IN_DEV/DEV_LOCAL_SETUP.md`
- **Local Checklist** : `DOCUMENTATION/IN_DEV/LOCAL_DEV_CHECKLIST.md`

### Déploiement
- **VPS** : `VPS_BUILD_INSTRUCTIONS.md`
- **Deployment** : `DEPLOYMENT_INSTRUCTIONS.md`

### Audits
- **MVP V1** : `DOCUMENTATION/IN_DEV/AUDIT_MVP_V1_JANVIER_2026.md`
- **Sprint 2-3** : `DOCUMENTATION/IN_DEV/AUDIT_STRUCTURE_SPRINT2.md`

---

## 📊 État de la Documentation

| Section | Statut | Fichiers |
|---------|--------|----------|
| **Fleurs - Section 1** | ✅ Complet | 1 |
| **Fleurs - Section 2** | ✅ Complet | 1 |
| **Fleurs - Section 3** | ✅ Complet | 1 |
| **Fleurs - Section 4** | ✅ Complet | 1 |
| **Fleurs - Section 5** | ✅ Complet | 1 |
| **Fleurs - Section 6-10** | 🚧 En cours | 0 |
| **Hash** | 📝 À faire | 0 |
| **Concentrés** | 📝 À faire | 0 |
| **Comestibles** | 📝 À faire | 0 |
| **ExportMaker** | 🚧 En cours | 0 |
| **Bibliothèque** | 📝 À faire | 0 |
| **PhenoHunt** | 📝 À faire | 0 |
| **Permissions** | ✅ Existant | 1 |
| **Corrections** | ✅ Complet | 1 |

**Progression Globale** : 35% complété

---

## 🆘 Support & Contact

**Pour toute question sur la documentation** :
- Créer une issue GitHub
- Consulter les fichiers IN_DEV pour contexte historique

**Mainteneurs** :
- Copilot AI (génération initiale)
- RAFOU (reviews & maintenance)

---

**Dernière révision complète** : 2026-04-01  
**Prochaine révision prévue** : TBD  
**Version Documentation** : 2.0.0
