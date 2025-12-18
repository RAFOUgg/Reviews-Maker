# Système de PipeLine Timeline - Guide d'utilisation

**Date**: 18 décembre 2025  
**Version**: 1.0  
**Conforme à**: REAL_VISION_CDC_DEV.md

---

## Vue d'ensemble

Le système de **PipeLine Timeline** est une interface interactive permettant de documenter de manière structurée et évolutive toutes les étapes de production d'un produit cannabinique (culture, extraction, curing, etc.).

### Principe clé (selon CDC)

> "Une culture ou fabrication/maturation de résine n'est pas toutes simple et récitable en quelque ligne, en plusieurs mois il peut se passer des milliers d'actions sur un plant de cannabis. C'est pour cela qu'il doit être possible non pas de faire une review en 2D, mais en 3D, le plan, et le temps."

---

## Architecture du système

### Composants principaux

1. **PipelineTimeline.jsx** - Composant principal
   - Timeline GitHub-style interactive
   - Panneau latéral avec préréglages et contenus
   - Système de drag & drop
   - Modals de configuration

2. **PipelineCulture.jsx** - Implémentation pour fleurs
   - Définit tous les champs de données disponibles (40+ champs)
   - Organisés par sections (GÉNÉRAL, ENVIRONNEMENT, ENGRAIS, LUMIÈRE, etc.)

---

## Interface utilisateur

### Layout

```
┌──────────────────────────────────────────────────────────┐
│  Pipeline de culture : Timeline interactive CDC          │
├────────────────┬─────────────────────────────────────────┤
│  PANNEAU       │  ZONE PRINCIPALE                        │
│  LATÉRAL       │                                         │
│  (320px)       │  ┌─────────────────────────────────┐   │
│                │  │  Configuration Timeline         │   │
│  ┌──────────┐  │  │  - Type: jours/semaines/phases │   │
│  │Préréglages│  │  │  - Nombre: 90                  │   │
│  │  • Config1│  │  └─────────────────────────────────┘   │
│  │  • Config2│  │                                         │
│  └──────────┘  │  ┌─────────────────────────────────┐   │
│                │  │  Timeline GitHub-style          │   │
│  ┌──────────┐  │  │  ☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐          │   │
│  │ Contenus  │  │  │  ☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐          │   │
│  │           │  │  │  ☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐☐          │   │
│  │ GÉNÉRAL   │  │  └─────────────────────────────────┘   │
│  │ • Mode    │  │                                         │
│  │ • Espace  │  │                                         │
│  │           │  │                                         │
│  │ ENVIRONN. │  │                                         │
│  │ • Substrat│  │                                         │
│  └──────────┘  │                                         │
└────────────────┴─────────────────────────────────────────┘
```

---

## Fonctionnalités

### 1. Configuration de la Timeline

**Types d'intervalles disponibles**:
- `secondes` : max 900 (pagination)
- `minutes` : max illimité
- `heures` : max 336
- `jours` : max 365
- `semaines` : illimité
- `mois` : illimité
- `phases` : 12 phases prédéfinies (Graine, Germination, Plantule, etc.)
- `dates` : avec date de début et fin (calcul automatique du nombre de jours)

**Pagination**: Activée automatiquement si > 365 cases.

---

### 2. Système de Préréglages

#### Création d'un préréglage global

1. Cliquer sur **"Créer un préréglage global"** dans le panneau latéral
2. Une modale s'ouvre avec **TOUS** les champs configurables
3. Définir les valeurs par défaut pour chaque champ (optionnel)
4. Donner un nom et une description au préréglage
5. Sauvegarder

**Structure d'un préréglage**:
```javascript
{
  id: "timestamp",
  name: "Culture Indoor LED Bio",
  description: "Config standard pour indoor LED avec substrat bio",
  createdAt: "2025-12-18T...",
  config: {
    mode: "Indoor",
    spaceType: "Tente",
    spaceDimensions: "120x120x200",
    lightType: "LED",
    lightPower: "600",
    temperature: "24",
    humidity: "60",
    substrateType: "Bio",
    // ... tous les autres champs
  }
}
```

#### Utilisation d'un préréglage

**Méthode 1 : Sélection + Assignation**
1. Sélectionner une ou plusieurs cases sur la timeline
   - Clic simple : sélection unique
   - Ctrl/Cmd + Clic : sélection multiple
   - Shift + Clic : sélection de plage
2. Cliquer sur un préréglage dans le panneau latéral (devient actif)
3. Cliquer sur **"Assigner le préréglage aux X case(s) sélectionnée(s)"**

**Méthode 2 : Drag & Drop (à implémenter)**
- Faire glisser un préréglage vers une case

---

### 3. Système de Contenus (Drag & Drop)

#### Contenus disponibles

Organisés par **sections hiérarchiques**:

**GÉNÉRAL**
- Mode de culture
- Type d'espace
- Dimensions

**ENVIRONNEMENT**
- Technique de propagation
- Type de substrat
- Volume substrat
- Composition substrat
- Système d'irrigation
- Fréquence d'arrosage
- Volume d'eau

**ENGRAIS**
- Type d'engrais
- Marque et gamme
- Dosage

**LUMIÈRE**
- Type de lampe
- Type de spectre
- Distance lampe/plante
- Puissance totale
- Durée d'éclairage
- DLI
- PPFD

**CLIMAT**
- Température moyenne
- Humidité relative
- CO₂
- Ventilation

**PALISSAGE**
- Méthodologie LST/HST
- Description manipulation

**MORPHOLOGIE**
- Taille
- Volume
- Poids
- Nombre branches principales

**RÉCOLTE**
- Couleur des trichomes
- Date de récolte
- Poids brut
- Poids net
- Rendement

#### Utilisation du Drag & Drop

1. Dans le panneau latéral, section **Contenus**
2. Sélectionner un contenu spécifique (ex: "Température moyenne")
3. Le faire glisser vers une case de la timeline
4. Le déposer → la donnée est ajoutée à cette case spécifique

**Résultat**: Chaque case peut avoir des données différentes, permettant une évolution temporelle fine.

---

### 4. Visualisation de la Timeline

#### Représentation visuelle type GitHub

- **Cases vides** : Gris (`bg-gray-200`)
- **Cases avec données** : Vert (`bg-green-500`)
- **Cases sélectionnées** : Bordure bleue (`ring-2 ring-primary-500`)

#### Labels des cases

- **Jours** : `J1`, `J2`, ..., `J90`
- **Semaines** : `S1`, `S2`, ..., `S12`
- **Mois** : `M1`, `M2`, ..., `M6`
- **Phases** : `Graine`, `Germination`, `Plantule`, ...
- **Dates** : `12/01`, `13/01`, ... (format DD/MM)

#### Interaction avec les cases

- **Clic simple** : Sélectionner
- **Ctrl/Cmd + Clic** : Ajout/retrait de la sélection
- **Shift + Clic** : Sélection de plage
- **Drag over** : Zone de drop active
- **Drop** : Ajout de contenu

---

## Flux de travail typique

### Scénario 1 : Culture complète avec préréglages

1. **Configuration initiale**
   - Choisir "jours" comme type d'intervalle
   - Définir 90 jours (période de culture)

2. **Création des préréglages**
   - Créer "Phase croissance" (18h lumière, 24°C, substrat bio, etc.)
   - Créer "Phase floraison" (12h lumière, 20°C, substrat bio, etc.)
   - Créer "Phase flush" (eau pure, 18°C, etc.)

3. **Assignation en masse**
   - Sélectionner J1 à J21 → Assigner "Phase croissance"
   - Sélectionner J22 à J70 → Assigner "Phase floraison"
   - Sélectionner J71 à J90 → Assigner "Phase flush"

4. **Ajustements fins**
   - Drag & drop "Température" sur J45 → modifier pour canicule
   - Drag & drop "Engrais" sur J30 → ajouter boost floraison

---

### Scénario 2 : Évolution détaillée jour par jour

1. **Pas de préréglages**
   - Utiliser uniquement le drag & drop

2. **Remplissage progressif**
   - J1 : Drag "Propagation" → Graine
   - J2 : Drag "Température" → 22°C
   - J3 : Drag "Humidité" → 70%
   - ...
   - J45 : Drag "Palissage" → LST
   - ...

3. **Export GIF** (pour comptes Producteur)
   - Générer un GIF animé montrant l'évolution des paramètres

---

## Stockage des données

### Structure JSON

```json
{
  "intervalType": "jours",
  "totalIntervals": 90,
  "startDate": "2025-01-01",
  "endDate": "2025-04-01",
  "presets": [
    {
      "id": "1734524800000",
      "name": "Phase croissance",
      "description": "18h lumière, bio",
      "config": { "lightDuration": "18", ... }
    }
  ],
  "timelineData": {
    "0": {
      "presetId": "1734524800000",
      "data": {
        "mode": "Indoor",
        "temperature": "24",
        "humidity": "60"
      }
    },
    "1": {
      "data": {
        "temperature": "22"
      }
    }
  }
}
```

### Clés importantes

- `timelineData[index]` : Données d'une case spécifique
- `presetId` : Référence au préréglage appliqué (si assigné)
- `data` : Valeurs des champs (écrasent ou complètent le préréglage)

---

## Validation et export

### Validation

- Cases vides autorisées (pas de données obligatoires)
- Si données présentes, validation type par type :
  - `number` : doit être numérique
  - `select` : doit être dans les options
  - `date` : format ISO valide

### Export

Les données de la timeline sont intégrées à la review complète :

```javascript
{
  type: "Fleurs",
  generalInfo: { ... },
  genetics: { ... },
  culturePipeline: {
    // Toutes les données de la timeline
  },
  visual: { ... },
  // ...
}
```

---

## Points techniques

### Performance

- **Lazy rendering** : Les cases ne sont rendues que si visibles
- **Pagination** : Au-delà de 365 cases, pagination automatique
- **Debounce** : Les modifications sont debounced (300ms)

### Accessibilité

- Navigation au clavier possible
- ARIA labels sur les cases
- Focus visible

### Responsive

- Mobile : panneau latéral en modal
- Tablet : layout 2 colonnes ajusté
- Desktop : layout complet

---

## Migration depuis l'ancien système

### Ancien PipelineManager

```javascript
// Avant
{
  cultureSteps: [
    { stepName: "Germination", intervalValue: 7, data: {...} },
    { stepName: "Croissance", intervalValue: 21, data: {...} }
  ]
}
```

### Nouveau PipelineTimeline

```javascript
// Après
{
  culturePipeline: {
    intervalType: "jours",
    totalIntervals: 28,
    timelineData: {
      0-6: { data: { phase: "Germination", ... } },
      7-27: { data: { phase: "Croissance", ... } }
    }
  }
}
```

**Script de migration** (à créer si besoin).

---

## Limitations connues

1. **Pagination manuelle** : Si > 365 cases, l'utilisateur doit naviguer entre pages
2. **Export GIF** : Nécessite une implémentation backend supplémentaire
3. **Drag & Drop préréglages** : Partiellement implémenté (à compléter)

---

## Prochaines évolutions

- [ ] Système de recherche dans les préréglages
- [ ] Import/export de préréglages (JSON)
- [ ] Partage de préréglages entre utilisateurs
- [ ] Templates de préréglages communautaires
- [ ] Visualisation graphique des données (courbes de température, etc.)
- [ ] Export GIF animé de la timeline
- [ ] Mode "Journal de bord" avec ajout automatique de la date du jour

---

## Support et documentation

- **CDC complet** : `.docs/REAL_VISION_CDC_DEV.md`
- **Composants** : `client/src/components/forms/flower/PipelineTimeline.jsx`
- **Types de produits** : Fleurs, Hash, Concentrés, Comestibles (chacun avec sa propre configuration)

---

**Dernière mise à jour** : 18 décembre 2025  
**Auteur** : GitHub Copilot  
**Statut** : ✅ Conforme au CDC
