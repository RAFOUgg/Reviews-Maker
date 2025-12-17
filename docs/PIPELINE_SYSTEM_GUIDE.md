# 📋 Guide du Système PipeLine Complet - Conforme CDC

## Vue d'ensemble

Le système PipeLine est maintenant **100% conforme au CDC** avec deux types de préréglages complémentaires :

1. **Préréglages individuels par champ** : Sauvegarder une valeur spécifique (ex: "Température Standard = 24°C")
2. **Préréglages globaux** : Définir TOUTES les valeurs de la pipeline en une seule fois

---

## 🎯 1. Drag & Drop d'une Donnée sur une Case

### Fonctionnement (Screen 1)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (Gauche)          →   TIMELINE (Droite)                │
├─────────────────────────────────────────────────────────────────┤
│  📁 ENVIRONNEMENT              ┌─────┬─────┬─────┐              │
│    🌡️ Température             │ J1  │ J2  │ J3  │              │
│    💧 Humidité                 └─────┴─────┴─────┘              │
│                                                                  │
│  Drag 🌡️ → Drop sur J2                                          │
└─────────────────────────────────────────────────────────────────┘
```

**Étapes :**
1. Glisser une donnée (ex: 🌡️ Température) depuis le sidebar
2. Déposer sur une case (ex: J2)
3. **Modal s'ouvre automatiquement** avec 2 onglets :
   - **📝 Formulaire** : Saisir la valeur (ex: 24°C)
   - **📌 Préréglages (X)** : Liste des préréglages sauvegardés pour ce champ

### Onglet "Préréglages"

Dans l'onglet préréglages :
- **Section verte** : Sauvegarder un nouveau préréglage
  - Saisir une valeur dans le formulaire
  - Donner un nom (ex: "Temp Standard")
  - Cliquer "Enregistrer"
- **Liste** : Préréglages disponibles avec boutons :
  - **Charger** : Applique la valeur au formulaire
  - **✖** : Supprime le préréglage

**Avantages :**
- Réutilisation rapide de valeurs fréquentes
- Gain de temps sur les saisies répétitives
- Stockage local par type de pipeline (`culture`, `curing`, etc.)

---

## 🎯 2. Création d'un Préréglage Global

### Fonctionnement (Screen 2 + 3)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR (Gauche)                                                │
├─────────────────────────────────────────────────────────────────┤
│  📦 PRÉRÉGLAGES SAUVEGARDÉS                                      │
│                                                                  │
│  ☐ Configuration Standard (12 champs)                           │
│  ☐ Config Bio Outdoor (18 champs)                               │
│  ☐ Setup Indoor LED (9 champs)                                  │
│                                                                  │
│  [➕ + Nouveau]  ← Cliquer ici                                   │
└─────────────────────────────────────────────────────────────────┘
```

**Étapes :**

### Screen 2 : Nom + Description
1. Cliquer sur **"+ Nouveau"**
2. Modal simple :
   - **Nom** : "Configuration Optimisée Indoor"
   - **Description** : "Pour culture sous LED avec substrat terre"
3. Cliquer **"Créer"**

### Screen 3 : Modal Complète CDC

Une **fenêtre modale complète** s'ouvre avec :

```
┌─────────────────────────────────────────────────────────────────┐
│  Préréglage : Configuration Optimisée Indoor                    │
├─────────────────────────────────────────────────────────────────┤
│  📊 Progression : 12/45 champs définis (27%)                    │
├─────────────────────────────────────────────────────────────────┤
│  [GÉNÉRAL] [SUBSTRAT] [ENVIRONNEMENT] [LUMIÈRE] [IRRIGATION]    │
│  ▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tab 1 : GÉNÉRAL (6 champs)                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🏠 Mode de culture :  [Indoor ▼]                         │   │
│  │ 📦 Type d'espace :    [Tente ▼]                          │   │
│  │ 📏 Dimensions :       [120x120x200]                      │   │
│  │ 📐 Surface au sol :   [1.44 m²]                          │   │
│  │ 📊 Volume total :     [2.88 m³]                          │   │
│  │ 📝 Notes :            [Armoire modifiée...]              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [← Précédent]                    [Suivant : SUBSTRAT →]        │
└─────────────────────────────────────────────────────────────────┘
```

**Navigation par onglets :**
- **Tab 1 : GÉNÉRAL** (6 champs)
  - Mode de culture, Type d'espace, Dimensions, etc.
- **Tab 2 : SUBSTRAT & COMPOSITION** (4 champs)
  - Type, Volume, Composition, Marque
- **Tab 3 : ENVIRONNEMENT** (5 champs)
  - Température, Humidité, CO2, Ventilation
- **Tab 4 : LUMIÈRE** (7 champs)
  - Type lampe, Spectre, Distance, Puissance, Durée, DLI, PPFD
- **Tab 5 : IRRIGATION** (4 champs)
  - Type système, Fréquence, Volume, pH
- **Tab 6 : ENGRAIS** (6 champs)
  - Type, Marque, Dosage, Fréquence, etc.
- **Tab 7 : PALISSAGE** (3 champs)
  - Méthodologies, Actions, Commentaires
- **Tab 8 : MORPHOLOGIE** (7 champs)
  - Taille, Volume, Poids, Branches, etc.

**Caractéristiques :**
- ✅ **Tous les champs accessibles** en un seul endroit
- ✅ **Navigation fluide** avec boutons Précédent/Suivant
- ✅ **Progression en temps réel** (12/45 = 27%)
- ✅ **Champs optionnels** : Pas besoin de tout remplir
- ✅ **Sauvegarde complète** : Toutes les valeurs définies

**Dernier onglet :**
```
┌─────────────────────────────────────────────────────────────────┐
│  Récapitulatif                                                   │
│  ────────────────────────────────────────────────────────────   │
│  ✓ 12 champs définis sur 45 disponibles                         │
│  ✓ GÉNÉRAL : 6/6 complet                                        │
│  ✓ SUBSTRAT : 4/4 complet                                       │
│  ⚠ ENVIRONNEMENT : 2/5 partiel                                  │
│                                                                  │
│  [← Retour]              [💾 Enregistrer le préréglage]         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 3. Application des Préréglages

### A. Application sur UNE cellule

**Méthode 1 : Clic direct avec préréglage sélectionné**
```
1. Cocher un ou plusieurs préréglages dans le sidebar
   ☑ Configuration Standard
   ☐ Config Bio Outdoor
   
2. Cliquer sur une case (ex: J5)
   
3. Confirmation popup :
   "Voulez-vous appliquer le(s) 1 préréglage(s) sélectionné(s) à cette cellule ?"
   [Non] [Oui]
   
4. Si Oui → Toutes les valeurs du préréglage sont appliquées à J5
```

### B. Application sur PLUSIEURS cellules (Attribution en masse)

**Méthode 2 : Mode sélection multiple**
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 Pipeline Culture                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3 cellule(s) sélectionnée(s)  [✓ Appliquer]            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Étapes :**
1. **Activer le mode sélection** (bouton dans le header)
2. **Sélectionner des préréglages** dans le sidebar :
   ☑ Configuration Standard
3. **Cliquer sur plusieurs cases** : J5, J6, J7 (elles deviennent violettes)
4. **Cliquer "✓ Appliquer"** dans le bandeau violet
5. **Confirmation** : "✓ Préréglage(s) appliqué(s) à 3 cellule(s) !"

---

## 📊 Différences entre les deux systèmes

| Feature | Préréglage Individuel | Préréglage Global |
|---------|----------------------|-------------------|
| **Portée** | 1 champ spécifique | TOUS les champs |
| **Accès** | Onglet dans modal donnée | Sidebar + Modal CDC |
| **Usage** | Valeurs répétitives (24°C) | Configuration complète |
| **Stockage** | `culture_field_temperature_presets` | `culturePipelinePresets` |
| **Exemple** | "Temp Standard = 24°C" | "Setup Indoor Complet" |

---

## 🗂️ Stockage localStorage

### Structure des préréglages individuels
```javascript
localStorage.getItem('culture_field_temperature_presets')
// Retourne :
[
  {
    id: "preset_1234567890",
    name: "Temp Standard",
    value: 24,
    fieldKey: "temperature",
    fieldLabel: "Température",
    createdAt: "2025-12-17T10:30:00Z"
  },
  {
    id: "preset_1234567891",
    name: "Temp Floraison",
    value: 22,
    fieldKey: "temperature",
    fieldLabel: "Température",
    createdAt: "2025-12-17T10:35:00Z"
  }
]
```

### Structure des préréglages globaux
```javascript
localStorage.getItem('culturePipelinePresets')
// Retourne :
[
  {
    id: "preset_1734435000000",
    name: "Configuration Optimisée Indoor",
    description: "Pour culture sous LED avec substrat terre",
    data: {
      modeCulture: "Indoor",
      typeEspace: "Tente",
      dimensions: "120x120x200",
      surfaceAuSol: 1.44,
      volumeTotal: 2.88,
      temperature: 24,
      humidite: 60,
      typeSubstrat: "Terre",
      volumeSubstrat: 20,
      typeLampe: "LED",
      puissanceLampe: 200,
      // ... tous les autres champs définis
    },
    dataCount: 12, // Nombre de champs définis
    createdAt: "2025-12-17T10:30:00Z",
    updatedAt: "2025-12-17T10:35:00Z"
  }
]
```

---

## ✅ Conformité CDC

Le système respecte intégralement les spécifications CDC :

> "L'utilisateur doit pouvoir créer une configuration générale, en créant un préréglage (templates), il définit les valeurs de TOUTES les données dispo pour cette pipeline."

✅ **Réalisé** :
- Modal complète avec onglets par sections
- TOUTES les 45+ données accessibles
- Progression visible (X/Y champs)
- Navigation fluide
- Sauvegarde complète

> "Lorsque je drag and drop une donnée sur une case cela devrait ouvrir un modale de définitions des valeurs de la données en questions (avec onglet des préréglages enregistré)"

✅ **Réalisé** :
- Modal avec 2 onglets (Formulaire + Préréglages)
- Préréglages spécifiques au champ
- Sauvegarde/chargement/suppression

> "Pour par la suite assigner le préréglages avec toutes les valeurs d'un coup sur une ou plusieurs cases"

✅ **Réalisé** :
- Application sur 1 cellule (clic avec préréglage sélectionné)
- Application en masse (mode sélection multiple)
- Confirmation visuelle

---

## 🚀 Workflow Recommandé

### Pour un Producteur

1. **Créer des préréglages globaux** :
   - "Setup Indoor LED" (config complète)
   - "Setup Outdoor Bio" (config complète)
   - "Phase Floraison" (config complète)

2. **Créer des préréglages individuels** pour valeurs fréquentes :
   - Température : "Temp Croissance (24°C)", "Temp Floraison (22°C)"
   - Humidité : "Humidité Croissance (60%)", "Humidité Floraison (50%)"
   - Engrais : "Dosage Standard", "Dosage Boost"

3. **Workflow de saisie** :
   - Appliquer préréglage global sur J1-J30 (croissance)
   - Ajuster certaines cellules manuellement
   - Appliquer préréglage individuel sur cellules spécifiques

### Pour un Influenceur

1. **Pipeline Curing** :
   - Préréglage "Curing Froid" (temp=5°C, humidité=62%)
   - Préréglage "Curing Chaud" (temp=20°C, humidité=55%)

2. **Application rapide** :
   - Sélectionner J1-J14
   - Appliquer "Curing Froid"
   - Ajuster température certains jours

---

## 📝 Notes Techniques

### Fichiers modifiés
- `client/src/components/pipeline/PipelineDataModal.jsx`
  - Ajout onglet "Préréglages"
  - Système sauvegarde/chargement préréglages par champ
- `client/src/components/pipeline/PipelineDragDropView.jsx`
  - Application préréglages sur cellules
  - Mode sélection multiple avec bouton "Appliquer"
- `client/src/components/pipeline/PresetConfigModal.jsx`
  - Modal complète CDC (déjà implémenté)

### localStorage Keys
```javascript
// Préréglages individuels
`${pipelineType}_field_${fieldKey}_presets`
// Exemples :
// - culture_field_temperature_presets
// - culture_field_humidite_presets
// - curing_field_temperature_presets

// Préréglages globaux
`${pipelineType}PipelinePresets`
// Exemples :
// - culturePipelinePresets
// - curingPipelinePresets
// - separationPipelinePresets
```

---

## 🎉 Résultat Final

Le système PipeLine est maintenant **100% CDC-compliant** avec :

1. ✅ Drag & drop → Modal avec préréglages par champ
2. ✅ Création préréglage global → Modal complète avec TOUS les champs
3. ✅ Application sur 1 ou N cellules
4. ✅ Progression visible
5. ✅ Stockage persistant
6. ✅ Build sans erreurs

**Prêt pour test utilisateur !** 🚀
