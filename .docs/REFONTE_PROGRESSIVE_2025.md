# Refonte Progressive Reviews-Maker - 2025

**Date début** : 12 décembre 2025  
**Branche** : feat/templates-backend  
**Référence** : CAHIER_DES_CHARGES

---

## 🎯 Objectif

Implémenter progressivement toutes les fonctionnalités définies dans le CAHIER_DES_CHARGES, en documentant chaque ajout/modification pour permettre aux IA de suivre l'évolution du projet.

---

## 📊 État Initial (12 déc 2025)

### ✅ Fonctionnalités Présentes (MVP Basique)

**Authentification :**
- ✅ Login Email/Password
- ✅ OAuth Discord/Google
- ✅ Types comptes (Amateur/Influenceur/Producteur)
- ✅ Page profil basique

**Reviews Basiques :**
- ✅ Informations générales (nom, producteur)
- ✅ Upload 1-4 photos
- ✅ Commentaire libre
- ✅ Sélection cultivars (Nouveaux/Bibliothèque)
- ✅ Navigation sections

**Bibliothèque :**
- ✅ Liste reviews personnelles
- ✅ Galerie publique (lecture seule)

### ❌ Fonctionnalités Manquantes (Cahier des Charges)

**Sections Reviews Détaillées :**
- ❌ 👁️ Visuel & Technique
- ❌ 👃 Odeurs (avec roues sélection)
- ❌ 🤚 Texture
- ❌ 😋 Goûts
- ❌ 💥 Effets ressentis
- ❌ 🔬 Données analytiques (PDF)

**Pipelines :**
- ❌ Pipeline Séparation (Hash)
- ❌ Pipeline Extraction (Concentrés)
- ❌ Pipeline Purification
- ❌ Pipeline Culture (Fleurs)
- ❌ Pipeline Curing Maturation
- ❌ Visualisation type GitHub

**Export Maker :**
- ❌ Templates prédéfinis
- ❌ Mode drag & drop (Producteur/Influenceur)
- ❌ Formats multiples (1:1, 16:9, 9:16, A4)
- ❌ Pagination
- ❌ Exports HD (300dpi, SVG, JSON, CSV)

**Canva Génétique :**
- ❌ Arbre généalogique cultivars
- ❌ Drag & drop
- ❌ Projets PhenoHunt

**Bibliothèque Avancée :**
- ❌ Sauvegarde templates/aperçus
- ❌ Préférences saisie rapide
- ❌ Filigranes personnalisés

---

## 📅 Planning de Refonte

### **PHASE 1 : Sections Reviews Détaillées** ⬅️ EN COURS
**Durée estimée** : 2-3 semaines  
**Priorité** : 🔴 HAUTE (base pour tout le reste)

#### 1.1 - Visuel & Technique (Hash/Concentré/Fleurs)
**Fichiers à créer :**
- `client/src/components/reviews/sections/VisualSection.jsx`
- `client/src/data/visualOptions.js` (couleurs, nuancier)

**Champs :**
- Couleur/Transparence/10 (nuancier visuel)
- Densité/10 (slider)
- Trichomes/10 (Fleurs uniquement)
- Moisissures/10 (inversé : 10=aucune)
- Graines/10 (inversé : 10=aucune)

**Statut** : ⏳ À IMPLÉMENTER

---

#### 1.2 - Odeurs (tous types)
**Fichiers à créer :**
- `client/src/components/reviews/sections/OdorSection.jsx`
- `client/src/components/reviews/OdorWheel.jsx` (roue sélection)
- `client/src/data/odorNotes.js` (liste complète notes)

**Champs :**
- Fidélité cultivars/10 (Hash/Concentré) ou Notes dominantes (Fleurs)
- Notes dominantes (max 7 parmi liste)
- Notes secondaires (max 7 parmi liste)
- Intensité arôme/10 (slider)

**Interface :**
- Roue de sélection Apple-like
- Max 7 sélections avec indicateur visuel
- Auto-complete intelligent

**Statut** : ⏳ À IMPLÉMENTER

---

#### 1.3 - Texture (Hash/Concentré/Fleurs)
**Fichiers à créer :**
- `client/src/components/reviews/sections/TextureSection.jsx`

**Champs :**
- Dureté/10
- Malléabilité/10
- Collant/10
- Melting/Résidus/10 (Hash/Concentré)

**Interface :**
- Sliders visuels 0-10
- Icônes représentatives

**Statut** : ⏳ À IMPLÉMENTER

---

#### 1.4 - Goûts (tous types)
**Fichiers à créer :**
- `client/src/components/reviews/sections/TasteSection.jsx`
- `client/src/components/reviews/TasteWheel.jsx`
- `client/src/data/tasteNotes.js`

**Champs :**
- Intensité/10
- Inhalation (notes max 7)
- Expiration/arrière-goût (notes max 7)

**Interface :**
- Roue sélection goûts
- Séparation visuelle inhalation/expiration

**Statut** : ⏳ À IMPLÉMENTER

---

#### 1.5 - Effets Ressentis (tous types)
**Fichiers à créer :**
- `client/src/components/reviews/sections/EffectsSection.jsx`
- `client/src/components/reviews/EffectsWheel.jsx`
- `client/src/data/effectsCategories.js`

**Champs :**
- Montée (rapidité)/10
- Intensité/10
- Durée (sélection prédéfinie)
- Effets mental/physique (roues sélection)

**Interface :**
- Roue effets mentaux (relaxation, euphorie, créativité, etc.)
- Roue effets physiques (analgésie, énergie, etc.)
- Timeline durée visuelle

**Statut** : ⏳ À IMPLÉMENTER

---

#### 1.6 - Données Analytiques (optionnel)
**Fichiers à créer :**
- `client/src/components/reviews/sections/AnalyticsSection.jsx`

**Champs :**
- THC % (input numérique)
- CBD % (input numérique)
- Upload PDF certificat analyse

**Statut** : ⏳ À IMPLÉMENTER

---

### **PHASE 2 : Pipelines Basiques**
**Durée estimée** : 3-4 semaines  
**Priorité** : 🟠 MOYENNE

#### 2.1 - Infrastructure Pipeline
**Fichiers à créer :**
- `client/src/components/pipelines/PipelineTimeline.jsx` (style GitHub)
- `client/src/components/pipelines/PipelineConfig.jsx` (config trame)
- `client/src/components/pipelines/PipelineCell.jsx` (cellule données)

**Fonctionnalités :**
- Configuration trame (jours/semaines/phases)
- Visualisation type GitHub (grille cases)
- Saisie données par cellule
- Export timeline

**Statut** : ⏳ À PLANIFIER

---

#### 2.2 - Pipeline Séparation (Hash)
**Fichiers :**
- `client/src/components/pipelines/hash/SeparationPipeline.jsx`
- `client/src/data/separationMethods.js`

**Données :**
- Méthode (Ice-O-Lator, Dry-Sift, etc.)
- Température par étape
- Durée par étape
- Matériel utilisé

**Statut** : ⏳ À PLANIFIER

---

#### 2.3 - Pipeline Extraction (Concentrés)
**Fichiers :**
- `client/src/components/pipelines/concentrate/ExtractionPipeline.jsx`
- `client/src/data/extractionMethods.js`

**Données :**
- Méthode (BHO, Rosin, CO₂, etc.)
- Paramètres spécifiques (pression, température)
- Rendement

**Statut** : ⏳ À PLANIFIER

---

#### 2.4 - Pipeline Curing (tous types)
**Fichiers :**
- `client/src/components/pipelines/shared/CuringPipeline.jsx`

**Données :**
- Humidité %
- Température
- Durée par phase

**Statut** : ⏳ À PLANIFIER

---

### **PHASE 3 : Export Maker MVP**
**Durée estimée** : 2-3 semaines  
**Priorité** : 🟡 HAUTE (mais après sections)

#### 3.1 - Templates Prédéfinis
**Fichiers :**
- `client/src/components/export/ExportMaker.jsx`
- `client/src/components/export/TemplateGallery.jsx`
- `client/src/templates/` (Compact, Détaillé, Complet)

**Templates :**
- Compact (minimal)
- Détaillé (sections principales)
- Complet (toutes données)

**Statut** : ⏳ À PLANIFIER

---

#### 3.2 - Formats Multiples
**Formats :**
- 1:1 (Instagram)
- 16:9 (Desktop)
- 9:16 (Stories)
- A4 (Impression)

**Statut** : ⏳ À PLANIFIER

---

#### 3.3 - Exports Basiques
**Formats export :**
- PNG (moyenne qualité - Amateur)
- JPEG (moyenne qualité - Amateur)
- PNG HD (300dpi - Producteur/Influenceur)

**Statut** : ⏳ À PLANIFIER

---

### **PHASE 4 : Bibliothèque Avancée**
**Durée estimée** : 2 semaines  
**Priorité** : 🟢 MOYENNE

#### 4.1 - Préférences Saisie Rapide
**Fonctionnalités :**
- Sauvegarde cultivars favoris
- Méthodes extraction récurrentes
- Paramètres culture standards

**Statut** : ⏳ À PLANIFIER

---

#### 4.2 - Gestion Templates
**Fonctionnalités :**
- Sauvegarde aperçus créés
- Partage templates (code unique)
- Duplication/édition

**Statut** : ⏳ À PLANIFIER

---

### **PHASE 5 : Pipelines Avancés**
**Durée estimée** : 4-5 semaines  
**Priorité** : 🟡 BASSE

#### 5.1 - Pipeline Culture Fleurs
**Données :**
- Germination → Récolte (12 phases)
- Paramètres environnement
- Engrais/irrigation

**Statut** : ⏳ À PLANIFIER

---

#### 5.2 - Pipeline Purification
**Méthodes :**
- Winterisation
- Chromatographie
- Distillation

**Statut** : ⏳ À PLANIFIER

---

### **PHASE 6 : Canva Génétique**
**Durée estimée** : 3-4 semaines  
**Priorité** : 🔵 BASSE (Producteur uniquement)

#### 6.1 - Arbre Généalogique
**Fonctionnalités :**
- Drag & drop cultivars
- Relations parents/enfants
- Visualisation graphique

**Statut** : ⏳ À PLANIFIER

---

#### 6.2 - Projets PhenoHunt
**Fonctionnalités :**
- Gestion sélections
- Notation phénotypes
- Tracking croisements

**Statut** : ⏳ À PLANIFIER

---

## 📝 Journal de Modifications

### 2025-12-12 - PHASE 1.1 TERMINÉE ✅

**Ajouts :**
- ✅ Création `REFONTE_PROGRESSIVE_2025.md` (ce fichier)
- ✅ Planning détaillé 6 phases
- ✅ **Section Visuel & Technique complète**

**Fichiers créés :**
- `client/src/data/visualOptions.js` - Nuancier couleurs cannabis complet (7 familles, 23 nuances)
- `client/src/components/reviews/sections/VisualSection.jsx` - Composant section visuel

**Fichiers modifiés :**
- `client/src/pages/CreateHashReview.jsx` - Intégration VisualSection
- `client/src/pages/CreateConcentrateReview.jsx` - Intégration VisualSection

**Fonctionnalités implémentées :**
- ✅ Nuancier couleurs interactif (Vert, Violet, Orange, Brun, Jaune, Blanc, Gris)
- ✅ Sélection couleur avec aperçu visuel
- ✅ Slider Transparence (Hash/Concentrés uniquement)
- ✅ Slider Densité (tous types)
- ✅ Slider Trichomes (Fleurs uniquement - à venir)
- ✅ Slider Moisissures inversé (10 = aucune)
- ✅ Slider Graines inversé (10 = aucune)
- ✅ Labels intelligents selon note (1-10)
- ✅ Résumé visuel auto-calculé
- ✅ Design Apple-like avec liquid glass

**Tests :**
- Hash : Nuancier noir → blanc, transparence visible
- Concentrés : Couleurs ambre/doré dominantes
- Interface responsive et accessible

**Prochaines étapes :**
- ⏳ Phase 1.2 - Section Odeurs (roues sélection)
- ⏳ Phase 1.3 - Section Texture
- ⏳ Phase 1.4 - Section Goûts

---

### 2025-12-12 - PHASE 1.1 EN COURS (archives)

**Ajouts :**
- Création `REFONTE_PROGRESSIVE_2025.md`
- Planning détaillé 6 phases

**Prochaines étapes :**
- Implémenter VisualSection (Visuel & Technique)
- Créer nuancier couleurs cannabis
- Sliders visuels 0-10

---

## 🔗 Références

- **Cahier des charges** : `.docs/CAHIER_DES_CHARGES`
- **Architecture actuelle** : `docs/INTEGRATION_COMPLETE_2025-12-12.md`
- **État projet** : `docs/CLEANUP_REPORT.md`

---

## 📌 Notes pour IA

**Avant chaque modification :**
1. ✅ Lire ce fichier pour contexte
2. ✅ Vérifier phase en cours
3. ✅ Documenter changements dans "Journal de Modifications"
4. ✅ Respecter structure fichiers définie
5. ✅ Tester localement avant commit

**Règles impératives :**
- Aucune saisie textuelle libre (sauf commentaires)
- Apple-like design (liquid glass, épuré)
- Roues sélection pour odeurs/goûts/effets
- Sliders visuels pour notes/10
- Auto-complete intelligent

**Commit message format :**
```
feat(phase1.X): description courte

- Détails changements
- Fichiers créés/modifiés
- Statut : En cours/Terminé
```

---

**Dernière mise à jour** : 12 décembre 2025, 15:45  
**Contributeur** : GitHub Copilot (refonte progressive)
