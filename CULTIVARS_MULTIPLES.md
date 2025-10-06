# 🌿 Système de Cultivars Multiples - Documentation

## 📋 Vue d'ensemble

Le système a été mis à jour pour permettre la gestion de **plusieurs cultivars** avec leurs propriétés individuelles et leur association aux étapes de pipeline pour les **Hash** et **Concentrés**.

## ✨ Fonctionnalités implémentées

### 1. **Nouveau type de champ : `cultivar-list`**

Permet d'ajouter dynamiquement plusieurs cultivars avec pour chacun :
- ✅ **Nom du cultivar** (ex: Gelato 41)
- ✅ **Farm** (ex: La Ferme Bio)
- ✅ **Breeder** (ex: Cookies Fam)
- ✅ **Type(s) de matière végétale** (fleurs fraîches, sèches, trim, etc.) - choix multiples

#### Interface utilisateur :
```
┌─ Cultivars utilisés ────────────────────────────┐
│ ⊕ Ajouter un cultivar                           │
│                                                  │
│ 🌿 Cultivar 1                          🗑️       │
│   Nom:     [Gelato 41____________]              │
│   Farm:    [La Ferme Bio_________]              │
│   Breeder: [Cookies Fam__________]              │
│   Matière: ☑ Fleurs fraîches ☐ Fleurs sèches   │
│                                                  │
│ 🌿 Cultivar 2                          🗑️       │
│   Nom:     [Zkittlez______________]              │
│   Farm:    [Green Valley_________]              │
│   Breeder: [Dying Breed Seeds____]              │
│   Matière: ☐ Fleurs fraîches ☑ Fleurs sèches   │
└──────────────────────────────────────────────────┘
```

### 2. **Nouveau type de champ : `pipeline-with-cultivars`**

Extension du système de pipeline existant qui permet d'associer des cultivars à chaque étape.

#### Fonctionnalités :
- ✅ Même système de pipeline qu'avant (ordre des étapes, mesh, température, pression)
- ✅ **Nouveau** : Sélection des cultivars utilisés pour chaque étape via checkboxes
- ✅ Mise à jour automatique des cultivars disponibles quand la liste change
- ✅ Affichage visuel des cultivars sélectionnés dans les chips de la pipeline

#### Interface utilisateur :
```
┌─ Pipeline de séparation ────────────────────────┐
│ [Ajouter une étape ▼]                           │
│                                                  │
│ 1. Tamisage WPFF              ↑ ↓ ✕            │
│    Cultivars pour cette étape :                 │
│    ☑ Gelato 41  ☑ Zkittlez                     │
│    Mesh: [90___] - [120___] µm                  │
│                                                  │
│ 2. Tamisage à l'eau glacée    ↑ ↓ ✕            │
│    Cultivars pour cette étape :                 │
│    ☑ Gelato 41  ☐ Zkittlez                     │
│    Mesh: [45___] - [73____] µm                  │
└──────────────────────────────────────────────────┘
```

## 🎯 Modifications apportées

### Structure des produits

#### **Hash** :
- ❌ **Supprimé** : Champs `cultivars`, `breeder`, `farm` (texte simple)
- ❌ **Supprimé** : Champ `matiereVegetale` (choix multiple standalone)
- ✅ **Ajouté** : Champ `cultivarsList` (type: `cultivar-list`)
- ✅ **Modifié** : `pipelineSeparation` → type `pipeline-with-cultivars`

#### **Concentré** :
- ❌ **Supprimé** : Champs `cultivars`, `breeder`, `farm` (texte simple)
- ❌ **Supprimé** : Champ `matiereVegetale` (choix multiple standalone)
- ✅ **Ajouté** : Champ `cultivarsList` (type: `cultivar-list`)
- ✅ **Modifié** : `pipelineExtraction` → type `pipeline-with-cultivars`

### Génération de la review

#### Affichage dans l'aperçu :
Le titre combine maintenant tous les cultivars :
```
"Gelato 41 + Zkittlez"
```

#### Affichage dans la review complète :
Les cultivars sont affichés sous forme de cartes détaillées :

```html
🌿 1
Gelato 41
📍 La Ferme Bio • 🧬 Cookies Fam • 🌱 Fleurs fraîches

🌿 2
Zkittlez
📍 Green Valley • 🧬 Dying Breed Seeds • 🌱 Fleurs sèches
```

## 💾 Format de données

### `cultivarsList` :
```json
[
  {
    "name": "Gelato 41",
    "farm": "La Ferme Bio",
    "breeder": "Cookies Fam",
    "matiere": ["Fleurs fraîches"]
  },
  {
    "name": "Zkittlez",
    "farm": "Green Valley",
    "breeder": "Dying Breed Seeds",
    "matiere": ["Fleurs sèches"]
  }
]
```

### `pipelineSeparation` / `pipelineExtraction` :
```json
[
  {
    "name": "Tamisage WPFF",
    "cultivars": ["Gelato 41", "Zkittlez"],
    "mesh": "90–120"
  },
  {
    "name": "Tamisage à l'eau glacée",
    "cultivars": ["Gelato 41"],
    "mesh": "45–73"
  }
]
```

## 🔄 Compatibilité

### Rétrocompatibilité :
- ✅ Les anciennes reviews avec `cultivars` (texte simple) continuent de fonctionner
- ✅ Le système détecte automatiquement si `cultivarsList` existe, sinon utilise `cultivars`
- ✅ Les anciennes pipelines sans cultivars associés fonctionnent normalement

### Chargement de reviews existantes :
Lorsqu'une review est chargée :
1. Si `cultivarsList` existe → utilise le nouveau système
2. Sinon → affiche le champ `cultivars` en texte simple (mode legacy)

## 🎨 Styles ajoutés

Nouveaux styles CSS dans `styles.css` :
- `.cultivar-list` : Conteneur principal
- `.cultivar-item` : Carte de cultivar individuelle
- `.cultivar-fields` : Champs du formulaire
- `.pipeline-with-cultivars` : Conteneur de pipeline
- `.pipeline-item` : Étape de pipeline
- `.step-cultivars` : Zone de sélection des cultivars
- `.cultivars-info` : Affichage dans la review générée
- `.cultivar-card` : Carte de cultivar dans la review

## 🔧 Fonctions ajoutées

### Rendu UI :
- Intégré dans `createFieldGroup()` pour les types `cultivar-list` et `pipeline-with-cultivars`

### Collecte de données :
- Automatique via les champs `input[type="hidden"]` avec datasets spécifiques
- `data-cultivar-list="true"`
- `data-pipeline-with-cultivars="true"`

### Réhydratation :
- `rehydrateCultivarList(fieldId, cultivars)` : Recharge une liste de cultivars
- `rehydratePipelineWithCultivars(fieldId, steps)` : Recharge une pipeline avec cultivars

### Génération :
- `getCultivarNames()` : Extrait les noms pour le titre
- `getCultivarInfo()` : Extrait toutes les infos pour l'affichage détaillé
- Intégré dans `generateLivePreview()` et `generateFullReview()`

## 🚀 Utilisation

### Pour créer une nouvelle review Hash ou Concentré :

1. **Sélectionnez le type** (Hash ou Concentré)
2. **Section "Informations générales"** :
   - Cliquez sur **"⊕ Ajouter un cultivar"**
   - Remplissez les informations pour chaque cultivar
   - Ajoutez autant de cultivars que nécessaire
3. **Pipeline de séparation/extraction** :
   - Ajoutez les étapes comme avant
   - Pour chaque étape, cochez les cultivars utilisés
   - Remplissez les paramètres techniques (mesh, température, etc.)
4. **Sauvegardez** : Le système génère automatiquement un nom basé sur tous les cultivars

## ⚠️ Notes importantes

- **Cross-field updates** : Quand vous ajoutez/supprimez/modifiez un cultivar, tous les pipelines se mettent à jour automatiquement
- **Validation** : Seuls les cultivars avec un nom sont sauvegardés
- **Performance** : Les mises à jour sont debounced pour éviter les ralentissements

## 📝 Prochaines étapes (si besoin)

- [ ] Étendre aux **Comestibles** (si vous le souhaitez)
- [ ] Ajouter des photos individuelles par cultivar
- [ ] Statistiques par cultivar dans la review finale
- [ ] Export détaillé des cultivars en CSV

---

**Statut** : ✅ **Fonctionnel et prêt à tester**

Testez en créant une nouvelle review Hash ou Concentré pour voir le système en action !
