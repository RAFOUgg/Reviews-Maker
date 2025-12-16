# 📋 SUIVI DE CONFORMITÉ CDC - Reviews-Maker
**Document créé** : 16 décembre 2025  
**Dernière mise à jour** : 16 décembre 2025  
**Périmètre** : CDC Lignes 280-671 (Pipelines & Canva génétique)  
**Objectif** : Conformité 100%

---

## 📊 TABLEAU DE BORD

| Métrique | Actuel | Objectif | Progression |
|----------|--------|----------|-------------|
| **Conformité globale** | 31% | 100% | ████░░░░░░░░░░░░░░░░ |
| **Fleurs - Culture** | 60% | 100% | ████████████░░░░░░░░ |
| **Fleurs - Curing** | 70% | 100% | ██████████████░░░░░░ |
| **Hash** | 0% | 100% | ░░░░░░░░░░░░░░░░░░░░ |
| **Concentrés** | 0% | 100% | ░░░░░░░░░░░░░░░░░░░░ |
| **Comestibles** | 0% | 100% | ░░░░░░░░░░░░░░░░░░░░ |
| **Génétique** | 40% | 100% | ████████░░░░░░░░░░░░ |

**Tâches complétées** : 0/68  
**Tâches en cours** : 0/68  
**Tâches bloquées** : 0/68  
**Tâches à faire** : 68/68

---

## 🎯 PHASE 1 : COMPLÉTION FLEURS (URGENT)
**Objectif** : Fleurs Culture 100% + Curing 100%  
**Durée estimée** : 2-3 jours  
**Priorité** : 🔴 CRITIQUE  
**Statut global** : ⏳ À DÉMARRER

---

### 1.1 Menu Contextuel Cellules (BLOQUANT)
**CDC** : Ligne 324-326  
**Impact** : CRITIQUE - Sans cela, pas de saisie de données  
**Fichiers** : `PipelineDragDropView.jsx`, nouveau `PipelineCellModal.jsx`

#### Tâches
- [ ] **1.1.1** Créer composant `PipelineCellModal.jsx`
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Modal réutilisable avec props : `isOpen`, `onClose`, `cellData`, `sidebarSections`, `onSave`
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.1.2** Ajouter gestionnaire `onClick` sur cellules
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Dans `PipelineDragDropView.jsx`, ajouter `onClick={handleCellClick}` sur chaque cellule
  - **Dépendance** : 1.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.1.3** Implémenter formulaires dynamiques dans modal
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Générer formulaire basé sur `sidebarSections` avec tous les types de champs (text, number, select, textarea, date, time, file)
  - **Dépendance** : 1.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.1.4** Système de sauvegarde données cellule
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Stocker données dans `cellsData[timestamp]`, persister dans state parent
  - **Dépendance** : 1.1.3
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.1.5** Tests end-to-end modal
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Tester ouverture, saisie, sauvegarde, fermeture
  - **Dépendance** : 1.1.4
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 11h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 1.2 Visualisation Données dans Cases
**CDC** : Ligne 328-330  
**Impact** : MAJEUR - Feedback utilisateur essentiel  
**Fichiers** : `PipelineDragDropView.jsx`, nouveau `PipelineCellBadge.jsx`

#### Tâches
- [ ] **1.2.1** Créer composant `PipelineCellBadge.jsx`
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Affiche icônes/badges pour données saisies (ex: 🌡️ temp, 💧 humidité, 💡 lumière)
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.2.2** Système de couleurs par niveau de remplissage
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : 
    - 0% rempli : bg-gray-100
    - 1-33% : bg-yellow-100 border-yellow-400
    - 34-66% : bg-orange-100 border-orange-400
    - 67-99% : bg-blue-100 border-blue-400
    - 100% : bg-green-100 border-green-500
  - **Dépendance** : 1.2.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.2.3** Mini-graphiques pour données numériques
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Afficher sparkline pour température/humidité/pH sur timeline
  - **Dépendance** : 1.2.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.2.4** Tooltip hover avec résumé données
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Au survol, afficher popup avec toutes les données de la cellule
  - **Dépendance** : 1.2.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.2.5** Tests visuels
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Vérifier rendu avec différents niveaux de remplissage
  - **Dépendance** : 1.2.4
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 11h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 1.3 Système Attribution en Masse
**CDC** : Ligne 330-332  
**Impact** : MAJEUR - Productivité utilisateur  
**Fichiers** : `PipelineDragDropView.jsx`, nouveau `PipelineMassAssignToolbar.jsx`

#### Tâches
- [ ] **1.3.1** Créer composant `PipelineMassAssignToolbar.jsx`
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Toolbar avec boutons "Appliquer à tout", "Appliquer à sélection", "Annuler sélection"
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.3.2** Mode sélection multiple cellules
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Clic sur cellule = toggle sélection, afficher border blue-500 sur sélectionnées
  - **Dépendance** : 1.3.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.3.3** Modal choix champs à appliquer
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Ouvrir modal avec checkboxes pour choisir quels champs copier
  - **Dépendance** : 1.3.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.3.4** Logique application en masse
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Copier données source vers toutes cellules sélectionnées/toutes
  - **Dépendance** : 1.3.3
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.3.5** Confirmation avant application
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Dialog "Appliquer à X cellules ?"
  - **Dépendance** : 1.3.4
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.3.6** Tests scénarios multiples
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Tester apply all, apply selection, annulation
  - **Dépendance** : 1.3.5
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 14h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 1.4 Upload PDF Spectre Lumière
**CDC** : Ligne 396-397  
**Impact** : MAJEUR - Data technique manquante  
**Fichiers** : `CulturePipelineTimeline.jsx`, backend API

#### Tâches
- [ ] **1.4.1** Ajouter champ upload dans section LUMIÈRE
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Input type="file" accept=".pdf,.jpg,.png" max 1 fichier
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.4.2** API endpoint upload spectre
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : POST `/api/upload/spectre` avec multer, stocker dans `/db/spectre_documents/`
  - **Dépendance** : 1.4.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.4.3** Preview PDF/Image uploadé
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Afficher thumbnail après upload
  - **Dépendance** : 1.4.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.4.4** Stockage référence dans cellData
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Sauvegarder URL/path dans données pipeline
  - **Dépendance** : 1.4.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.4.5** Tests upload/suppression
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Vérifier upload, preview, suppression
  - **Dépendance** : 1.4.4
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 9h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 1.5 Modification Notes Pendant Curing
**CDC** : Ligne 479-483  
**Impact** : CRITIQUE - Évolution produit non trackée  
**Fichiers** : `CuringMaturationTimeline.jsx`, `PipelineCellModal.jsx`

#### Tâches
- [ ] **1.5.1** Ajouter section "Modifications notes" dans sidebar Curing
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : 
    ```javascript
    { 
      id: 'notes-evolution', 
      label: 'MODIFICATIONS NOTES', 
      items: [
        { id: 'visuel-technique', label: 'Visuel & Technique', type: 'group' },
        { id: 'odeurs', label: 'Odeurs', type: 'group' },
        { id: 'gouts', label: 'Goûts', type: 'group' },
        { id: 'effets', label: 'Effets ressentis', type: 'group' }
      ] 
    }
    ```
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.5.2** Formulaires notes dans modal cellule
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Pour chaque note, afficher sliders 0-10 avec labels
  - **Dépendance** : 1.5.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.5.3** Graphiques évolution notes
  - **Statut** : ⏳ À faire
  - **Durée** : 5h
  - **Description** : Line chart montrant évolution de chaque note sur timeline
  - **Dépendance** : 1.5.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.5.4** Export comparatif début/fin curing
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Table "Avant curing / Après curing" dans exports
  - **Dépendance** : 1.5.3
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.5.5** Tests saisie évolutive
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Vérifier notes différentes à J+0, J+7, J+14, J+30
  - **Dépendance** : 1.5.4
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 15h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 1.6 Bouton "+" Ajout Étapes
**CDC** : Ligne 319  
**Impact** : MOYEN - Flexibilité timeline  
**Fichiers** : `PipelineDragDropView.jsx`

#### Tâches
- [ ] **1.6.1** Ajouter bouton "+" après dernière cellule
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Bouton bleu avec icon Plus
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.6.2** Handler ajout cellule dynamique
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : `handleAddCell()` qui ajoute 1 unité selon intervalType
  - **Dépendance** : 1.6.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.6.3** Mise à jour config timeline
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Incrémenter `timelineConfig.duration` automatiquement
  - **Dépendance** : 1.6.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.6.4** Tests ajout multiple
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Cliquer 5 fois, vérifier 5 cellules ajoutées
  - **Dépendance** : 1.6.3
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 5h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 1.7 Liaison Arrosage-Engraissage
**CDC** : Ligne 381  
**Impact** : MOYEN - UX améliorée  
**Fichiers** : `CulturePipelineTimeline.jsx`, `PipelineCellModal.jsx`

#### Tâches
- [ ] **1.7.1** Ajouter checkbox "Lier à arrosage" dans Engrais
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Si coché, afficher les données d'arrosage liées
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.7.2** Système de liaison timestamp
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Enregistrer `linkedTo: 'irrigation'` dans cellData
  - **Dépendance** : 1.7.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.7.3** Affichage visuel liaison
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Icône 🔗 dans cellule si liaison active
  - **Dépendance** : 1.7.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **1.7.4** Tests liaison
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Vérifier liaison, déliaison, affichage
  - **Dépendance** : 1.7.3
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 7h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

## 📈 RÉCAPITULATIF PHASE 1

| Tâche | Durée | Statut | Priorité |
|-------|-------|--------|----------|
| 1.1 Menu Contextuel Cellules | 11h | ⏳ À faire | 🔴 CRITIQUE |
| 1.2 Visualisation Données | 11h | ⏳ À faire | 🔴 CRITIQUE |
| 1.3 Attribution en Masse | 14h | ⏳ À faire | 🟠 HAUTE |
| 1.4 Upload PDF Spectre | 9h | ⏳ À faire | 🟠 HAUTE |
| 1.5 Modification Notes Curing | 15h | ⏳ À faire | 🔴 CRITIQUE |
| 1.6 Bouton "+" Ajout | 5h | ⏳ À faire | 🟡 MOYENNE |
| 1.7 Liaison Arrosage-Engrais | 7h | ⏳ À faire | 🟡 MOYENNE |

**TOTAL PHASE 1** : 72h (9 jours ouvrés)

---

## 🧊 PHASE 2 : HASH (BLOQUANT)
**Objectif** : Hash 0% → 100%  
**Durée estimée** : 5-7 jours  
**Priorité** : 🔴 CRITIQUE  
**Statut global** : ⏳ À DÉMARRER

---

### 2.1 Pipeline Séparation Hash
**CDC** : Ligne 492-508  
**Impact** : BLOQUANT - Type produit inexploitable  
**Fichiers** : Nouveau `HashSeparationPipeline.jsx`

#### Tâches
- [ ] **2.1.1** Créer composant `HashSeparationPipeline.jsx`
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Wrapper de PipelineDragDropView avec intervalles s/m/h
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.1.2** Sidebar section MÉTHODE
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : 
    - méthode séparation (select: manuelle, tamisage sec, eau/glace, autre)
    - nombre passes (number)
    - température eau (number + °C)
    - taille mailles (text + µm)
  - **Dépendance** : 2.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.1.3** Sidebar section MATIÈRE PREMIÈRE
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** :
    - type matière (select: trim, buds, sugar leaves, autre)
    - qualité (slider 1-10)
  - **Dépendance** : 2.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.1.4** Sidebar section RENDEMENT
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** :
    - rendement estimé (number + %)
    - temps total (number + minutes)
  - **Dépendance** : 2.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.1.5** Intégration dans CreateHashReview
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Importer et afficher composant dans formulaire Hash
  - **Dépendance** : 2.1.4
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.1.6** Tests pipeline Séparation
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Tester création, saisie, sauvegarde
  - **Dépendance** : 2.1.5
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 15h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 2.2 Pipeline Purification Hash
**CDC** : Ligne 509-512  
**Impact** : BLOQUANT - Feature Pro manquante  
**Fichiers** : Nouveau `HashPurificationPipeline.jsx`

#### Tâches
- [ ] **2.2.1** Créer composant `HashPurificationPipeline.jsx`
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Wrapper avec intervalles s/m/h
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.2.2** Définir paramètres par méthode purification
  - **Statut** : ⏳ À faire
  - **Durée** : 8h
  - **Description** : Recherche + documentation pour chaque méthode (16 méthodes)
    - Chromatographie : colonnes, solvants, débit
    - Winterisation : température, durée, solvant
    - Filtration : type filtre, taille pores
    - Centrifugation : RPM, durée, température
    - Séchage sous vide : pression, température, durée
    - ... (11 autres méthodes)
  - **Dépendance** : 2.2.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.2.3** Sidebar dynamique selon méthode
  - **Statut** : ⏳ À faire
  - **Durée** : 6h
  - **Description** : Switch case pour afficher champs spécifiques à chaque méthode
  - **Dépendance** : 2.2.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.2.4** Intégration dans CreateHashReview
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Afficher après pipeline Séparation
  - **Dépendance** : 2.2.3
  - **Validé par** : _______
  - **Date** : _______

- [ ] **2.2.5** Tests pipeline Purification
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Tester 5 méthodes différentes
  - **Dépendance** : 2.2.4
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 23h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

## 💎 PHASE 3 : CONCENTRÉS (BLOQUANT)
**Objectif** : Concentrés 0% → 100%  
**Durée estimée** : 5-7 jours  
**Priorité** : 🔴 CRITIQUE  
**Statut global** : ⏳ À DÉMARRER

---

### 3.1 Pipeline Extraction Concentrés
**CDC** : Ligne 576-583  
**Impact** : BLOQUANT - Type produit inexploitable  
**Fichiers** : Nouveau `ConcentratesExtractionPipeline.jsx`

#### Tâches
- [ ] **3.1.1** Créer composant `ConcentratesExtractionPipeline.jsx`
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Wrapper avec intervalles s/m/h
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.1.2** Select méthode extraction (15 options)
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Dropdown avec EHO, IPA, AHO, BHO, IHO, PHO, HHO, huiles végétales, CO₂, Rosin chaud/froid, UAE, MAE, tensioactifs
  - **Dépendance** : 3.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.1.3** Définir paramètres par méthode extraction
  - **Statut** : ⏳ À faire
  - **Durée** : 10h
  - **Description** : Recherche + documentation
    - BHO/PHO/IHO : pression, température, temps, quantité solvant
    - EHO/IPA/AHO : concentration, temps macération, filtrations
    - Rosin : température, pression, durée, taille mailles
    - CO₂ : pression, température, débit
    - UAE/MAE : puissance, fréquence, durée
    - ... (autres méthodes)
  - **Dépendance** : 3.1.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.1.4** Sidebar dynamique selon méthode
  - **Statut** : ⏳ À faire
  - **Durée** : 6h
  - **Description** : Switch case pour champs spécifiques
  - **Dépendance** : 3.1.3
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.1.5** Validation cultivars requis
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Bloquer création pipeline si cultivars non définis (CDC ligne 578)
  - **Dépendance** : 3.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.1.6** Intégration dans CreateConcentrateReview
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Importer et afficher composant
  - **Dépendance** : 3.1.5
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.1.7** Tests pipeline Extraction
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Tester BHO, Rosin, CO₂, EHO
  - **Dépendance** : 3.1.6
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 29h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

### 3.2 Pipeline Purification Concentrés
**CDC** : Ligne 584-586  
**Impact** : BLOQUANT - Feature Pro manquante  
**Fichiers** : Réutiliser `HashPurificationPipeline.jsx`

#### Tâches
- [ ] **3.2.1** Adapter `HashPurificationPipeline.jsx` pour Concentrés
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Renommer en `PurificationPipeline.jsx`, ajouter prop `productType`
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.2.2** Intégration dans CreateConcentrateReview
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Afficher après pipeline Extraction
  - **Dépendance** : 3.2.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **3.2.3** Tests pipeline Purification
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Tester winterisation, filtration, centrifugation
  - **Dépendance** : 3.2.2
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 5h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

## 🍪 PHASE 4 : COMESTIBLES (MOYENNE)
**Objectif** : Comestibles 0% → 100%  
**Durée estimée** : 2-3 jours  
**Priorité** : 🟡 MOYENNE  
**Statut global** : ⏳ À DÉMARRER

---

### 4.1 Pipeline Recette Comestibles
**CDC** : Ligne 657-662  
**Impact** : BLOQUANT type Comestibles  
**Fichiers** : Nouveau `EdiblesRecipePipeline.jsx`

#### Tâches
- [ ] **4.1.1** Créer composant `EdiblesRecipePipeline.jsx`
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Structure différente : liste ingrédients + étapes
  - **Validé par** : _______
  - **Date** : _______

- [ ] **4.1.2** Système ajout ingrédient
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : 
    - Toggle : Standard / Cannabinique
    - Nom ingrédient (text)
    - Quantité (number)
    - Unité (select: g, ml, pcs, L, kg, etc.)
    - Bouton "Ajouter ingrédient"
  - **Dépendance** : 4.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **4.1.3** Liste ingrédients avec édition/suppression
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Table avec actions edit/delete par ligne
  - **Dépendance** : 4.1.2
  - **Validé par** : _______
  - **Date** : _______

- [ ] **4.1.4** Étapes de préparation
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : 
    - Select actions prédéfinies (mélanger, chauffer, refroidir, infuser, mixer, cuire, etc.)
    - Assigner action à ingrédient(s)
    - Ordre étapes drag & drop
  - **Dépendance** : 4.1.3
  - **Validé par** : _______
  - **Date** : _______

- [ ] **4.1.5** Intégration dans CreateEdiblesReview
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Vérifier si page existe, sinon créer
  - **Dépendance** : 4.1.4
  - **Validé par** : _______
  - **Date** : _______

- [ ] **4.1.6** Tests pipeline Recette
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Créer recette brownie, space cake, gummies
  - **Dépendance** : 4.1.5
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 17h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

## 🧬 PHASE 5 : GÉNÉTIQUE (FINITIONS)
**Objectif** : Génétique 40% → 100%  
**Durée estimée** : 2-3 jours  
**Priorité** : 🟢 BASSE  
**Statut global** : ⏳ À DÉMARRER

---

### 5.1 Intégration Canva Génétique
**CDC** : Ligne 361-373  
**Impact** : MOYEN - Feature Producteur avancée  
**Fichiers** : `GeneticsLibraryCanvas.jsx`, routing

#### Tâches
- [ ] **5.1.1** Créer route `/genetics`
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Ajouter route dans App.jsx
  - **Validé par** : _______
  - **Date** : _______

- [ ] **5.1.2** Ajouter lien depuis bibliothèque
  - **Statut** : ⏳ À faire
  - **Durée** : 1h
  - **Description** : Bouton "Gérer génétiques" dans Library
  - **Dépendance** : 5.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **5.1.3** API endpoints génétique
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : 
    - GET `/api/genetics/library` (liste cultivars)
    - POST `/api/genetics/tree` (sauvegarder arbre)
    - GET `/api/genetics/tree/:id` (charger arbre)
  - **Dépendance** : 5.1.1
  - **Validé par** : _______
  - **Date** : _______

- [ ] **5.1.4** Schema Prisma génétique
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : 
    ```prisma
    model GeneticTree {
      id String @id
      userId String
      cultivars Json
      relationships Json
      canvas Json
      createdAt DateTime
      updatedAt DateTime
    }
    ```
  - **Dépendance** : 5.1.3
  - **Validé par** : _______
  - **Date** : _______

- [ ] **5.1.5** Sauvegarde/chargement canva
  - **Statut** : ⏳ À faire
  - **Durée** : 3h
  - **Description** : Connecter composant aux API endpoints
  - **Dépendance** : 5.1.4
  - **Validé par** : _______
  - **Date** : _______

- [ ] **5.1.6** Export canva pour reviews
  - **Statut** : ⏳ À faire
  - **Durée** : 4h
  - **Description** : Snapshot SVG canva, intégrer dans exports
  - **Dépendance** : 5.1.5
  - **Validé par** : _______
  - **Date** : _______

- [ ] **5.1.7** Tests end-to-end
  - **Statut** : ⏳ À faire
  - **Durée** : 2h
  - **Description** : Créer arbre, sauvegarder, charger, exporter
  - **Dépendance** : 5.1.6
  - **Validé par** : _______
  - **Date** : _______

**Total durée** : 17h  
**Date début** : _______  
**Date fin prévue** : _______  
**Date fin réelle** : _______

---

## 📝 JOURNAL DE BORD

### 2025-12-16 - Création document
**Auteur** : GitHub Copilot  
**Actions** :
- ✅ Création structure suivi conformité
- ✅ Définition 68 tâches détaillées
- ✅ Estimation durées par tâche
- ✅ Organisation en 5 phases

**Prochaines étapes** :
- [ ] Validation plan par équipe
- [ ] Assignation responsables
- [ ] Lancement Phase 1

---

## 📋 TEMPLATE ENTRÉE JOURNAL

```markdown
### YYYY-MM-DD - [Titre mise à jour]
**Auteur** : [Nom]  
**Tâches complétées** :
- ✅ [ID tâche] [Description]
- ✅ [ID tâche] [Description]

**Tâches en cours** :
- 🔄 [ID tâche] [Description] - [% progression]

**Blocages** :
- ⚠️ [Description blocage] - [Impact]

**Prochaines étapes** :
- [ ] [Action 1]
- [ ] [Action 2]

**Notes** : [Observations diverses]
```

---

## 🎯 OBJECTIFS HEBDOMADAIRES

### Semaine du 16-20 décembre 2025
- [ ] Compléter tâches 1.1 (Menu contextuel)
- [ ] Compléter tâches 1.2 (Visualisation)
- [ ] Démarrer tâches 1.3 (Attribution masse)

### Semaine du 23-27 décembre 2025
- [ ] Compléter Phase 1 (Fleurs 100%)
- [ ] Démarrer Phase 2 (Hash Séparation)

### Semaine du 30 déc - 3 janvier 2026
- [ ] Compléter tâches 2.1 (Hash Séparation)
- [ ] Démarrer tâches 2.2 (Hash Purification)

### Semaine du 6-10 janvier 2026
- [ ] Compléter Phase 2 (Hash 100%)
- [ ] Démarrer Phase 3 (Concentrés)

### Semaine du 13-17 janvier 2026
- [ ] Compléter Phase 3 (Concentrés 100%)
- [ ] Compléter Phase 4 (Comestibles 100%)

### Semaine du 20-24 janvier 2026
- [ ] Compléter Phase 5 (Génétique 100%)
- [ ] Tests finaux
- [ ] **CONFORMITÉ CDC 100%** 🎉

---

## 📊 INDICATEURS DE PERFORMANCE

### Vélocité par semaine
| Semaine | Tâches prévues | Tâches complétées | Taux complétion |
|---------|----------------|-------------------|-----------------|
| S51 (16-20 déc) | 15 | 0 | 0% |
| S52 (23-27 déc) | 12 | 0 | 0% |
| S01 (30-3 jan) | 10 | 0 | 0% |
| S02 (6-10 jan) | 10 | 0 | 0% |
| S03 (13-17 jan) | 11 | 0 | 0% |
| S04 (20-24 jan) | 10 | 0 | 0% |

### Burndown Chart
```
Tâches restantes
68 ┤●
60 ┤
50 ┤
40 ┤
30 ┤
20 ┤
10 ┤
 0 ┤          ○ (objectif fin janvier)
   └──────────────────────────────────
   16/12  23/12  30/12  06/01  13/01  20/01
```

---

## ✅ CRITÈRES D'ACCEPTATION GLOBAUX

Pour considérer une phase comme **COMPLÉTÉE**, tous les critères suivants doivent être remplis :

### Phase 1 : Fleurs
- [ ] Menu contextuel ouvre formulaire complet sur clic cellule
- [ ] Cellules remplies affichent badges/couleurs
- [ ] Attribution en masse fonctionne (apply all + selection)
- [ ] Upload PDF spectre sauvegarde et affiche preview
- [ ] Notes évoluent pendant curing avec graphiques
- [ ] Bouton "+" ajoute cellules dynamiquement
- [ ] Liaison arrosage-engraissage fonctionnelle
- [ ] Tests utilisateurs validés

### Phase 2 : Hash
- [ ] Pipeline Séparation créée avec 3 sections
- [ ] Intervalles s/m/h fonctionnels
- [ ] Pipeline Purification avec 16 méthodes
- [ ] Paramètres définis pour chaque méthode
- [ ] Intégration CreateHashReview complète
- [ ] Tests end-to-end validés

### Phase 3 : Concentrés
- [ ] Pipeline Extraction avec 15 méthodes
- [ ] Paramètres définis pour chaque méthode
- [ ] Validation cultivars requis avant création
- [ ] Pipeline Purification réutilisée
- [ ] Intégration CreateConcentrateReview complète
- [ ] Tests end-to-end validés

### Phase 4 : Comestibles
- [ ] Pipeline Recette avec système ingrédients
- [ ] Toggle standard/cannabinique fonctionnel
- [ ] Étapes préparation assignables
- [ ] Intégration CreateEdiblesReview complète
- [ ] Tests end-to-end validés

### Phase 5 : Génétique
- [ ] Route `/genetics` accessible
- [ ] Sauvegarde backend arbre génétique
- [ ] Export canva dans reviews
- [ ] Tests end-to-end validés

---

**DOCUMENT VIVANT - MISE À JOUR QUOTIDIENNE RECOMMANDÉE**
