# Système de Préréglages - Version Finale CDC Conforme

**Date** : 18 décembre 2025  
**Statut** : ✅ Simplifié et conforme au CDC

---

## 🎯 Principe selon le CDC

> "L'utilisateur doit pouvoir créer une configuration générale, en créant un préréglage (template), il définit les valeurs de TOUTES les données dispo pour cette pipeline. Les préréglages sont sauvegardés dans la bibliothèque utilisateur pour réutilisation rapide."

---

## 🏗️ Architecture simplifiée

### ❌ AVANT (Confus - 3 boutons)

1. Bouton "+ Nouveau" dans l'onglet Préréglages
2. Bouton "Créer un préréglage global" dans Contenus
3. Bouton "Assignation masse" dans la zone principale

**Problème** : Trop de points d'entrée, rôles pas clairs

---

### ✅ APRÈS (Simple - 1 workflow)

**UN SEUL système avec 3 étapes claires** :

```
┌─────────────────────────────────────────────────┐
│ ÉTAPE 1 : CRÉATION                             │
│ Bouton "Créer un nouveau préréglage"           │
│ → Ouvre modal avec TOUTES les données          │
│ → Sauvegarde dans la bibliothèque utilisateur  │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ ÉTAPE 2 : ACTIVATION                           │
│ Cliquer sur un préréglage dans l'onglet        │
│ → Bordure bleue = actif                        │
│ → Icône ✓ visible                              │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ ÉTAPE 3 : APPLICATION                          │
│ Sélectionner des cases (Shift/Ctrl+clic)       │
│ Bouton "🚀 Assigner aux X cases"               │
│ → Toutes les données appliquées en masse       │
└─────────────────────────────────────────────────┘
```

---

## 📋 Interface utilisateur

### Panneau latéral gauche

**Onglet "Mes préréglages"** :

```
┌──────────────────────────────────────┐
│ ⚙️ Mes préréglages                   │
├──────────────────────────────────────┤
│ 💡 Workflow :                        │
│ 1. Créer un préréglage (↓)          │
│ 2. Cliquer dessus pour l'activer    │
│ 3. Sélectionner des cases           │
│ 4. "Assigner aux X cases"           │
├──────────────────────────────────────┤
│                                      │
│ ✓ Phase croissance                  │
│   18h lumière, 24°C, bio            │
│                                   [🗑]│
│                                      │
│ Phase floraison                     │
│   12h lumière, 20°C                 │
│                                   [🗑]│
│                                      │
│ Phase flush                         │
│   Eau pure uniquement               │
│                                   [🗑]│
│                                      │
└──────────────────────────────────────┘
        (scroll si + de préréglages)

┌──────────────────────────────────────┐
│ 📦 Contenus                          │
│ • Glissez vers les cases →          │
│ • Ctrl+clic pour sélection multiple │
│ • Clic droit → Définir la valeur    │
├──────────────────────────────────────┤
│ GÉNÉRAL                              │
│ Mode de culture                      │
│ Type d'espace                        │
│ ...                                  │
├──────────────────────────────────────┤
│ [+ Créer un nouveau préréglage]     │
└──────────────────────────────────────┘
```

### Zone principale (Timeline)

**États possibles** :

1️⃣ **Aucune sélection** :
```
Pipeline Culture
Type: jours | Nombre: 90
0% - 0/90 cases
```

2️⃣ **Cases sélectionnées, pas de préréglage actif** :
```
⚠️ 15 case(s) sélectionnée(s)
Cliquez sur un préréglage pour l'activer
```

3️⃣ **Préréglage actif, pas de cases** :
```
💡 Préréglage "Phase croissance" actif
Sélectionnez des cases pour l'appliquer
```

4️⃣ **Préréglage actif + Cases sélectionnées** (ACTION POSSIBLE) :
```
┌────────────────────────────────────┐
│ ✓ Préréglage actif : Phase croiss.│
│                                    │
│ [🚀 Assigner aux 15 cases]        │
└────────────────────────────────────┘
```

---

## 🔧 Fonctionnalités du système

### 1. Création d'un préréglage

**Déclenchement** : Clic sur "Créer un nouveau préréglage"

**Modal affiché** :
```
┌──────────────────────────────────────────────────┐
│ 📦 Nouveau préréglage                           │
├──────────────────────────────────────────────────┤
│ Définissez toutes les données de la pipeline.   │
│ Ce préréglage sera sauvegardé dans votre        │
│ bibliothèque.                                    │
├──────────────────────────────────────────────────┤
│ Nom du préréglage * :                           │
│ [Phase de croissance végétative              ] │
│                                                  │
│ Description (optionnel) :                        │
│ [18h lumière, 24°C, substrat bio            ]  │
│                                                  │
│ ─────────────────────────────────────────────   │
│                                                  │
│ Configuration des données                        │
│                                                  │
│ GÉNÉRAL                                          │
│ Mode de culture: [Indoor ▼]                     │
│ Type d'espace: [Tente ▼]                        │
│                                                  │
│ ENVIRONNEMENT                                    │
│ Substrat: [Bio ▼]                               │
│ Volume (L): [11          ]                       │
│                                                  │
│ LUMIÈRE                                          │
│ Type: [LED ▼]                                   │
│ Puissance (W): [600      ]                       │
│ Durée (h): [18       ]                           │
│                                                  │
│ (... tous les autres champs organisés)          │
│                                                  │
│ [Annuler]  [💾 Sauvegarder le préréglage]      │
└──────────────────────────────────────────────────┘
```

**Résultat** :
- ✅ Préréglage ajouté à l'onglet "Mes préréglages"
- ✅ Sauvegardé dans `data.presets`
- ✅ Persisté dans le localStorage/base de données utilisateur

---

### 2. Activation d'un préréglage

**Action** : Clic sur un préréglage dans la liste

**Feedback visuel** :
- Bordure bleue épaisse
- Fond bleu clair
- Icône ✓ devant le nom
- État `activePresetId` mis à jour

**Message d'aide** :
```
💡 Préréglage "Phase croissance" actif
Sélectionnez des cases pour l'appliquer
```

---

### 3. Application en masse

**Pré-requis** :
- ✓ Préréglage actif
- ✓ Au moins 1 case sélectionnée

**Action** : Clic sur "🚀 Assigner aux X cases"

**Traitement** :
```javascript
// Copie TOUTES les données du préréglage
// vers TOUTES les cases sélectionnées
selectedCells.forEach(cellIdx => {
  timelineData[cellIdx] = {
    presetId: activePresetId,
    data: { ...preset.config }  // Toutes les données
  }
})
```

**Résultat** :
- Cases passent en vert
- Compteur mis à jour : `15/90 cases remplies`
- Données appliquées instantanément

---

## 📊 Stockage des données

### Structure JSON complète

```json
{
  "culturePipeline": {
    "intervalType": "jours",
    "totalIntervals": 90,
    "startDate": "2025-01-01",
    "endDate": "2025-04-01",
    
    "presets": [
      {
        "id": "1734524800000",
        "name": "Phase croissance",
        "description": "18h lumière, 24°C, bio",
        "createdAt": "2025-12-18T10:30:00Z",
        "config": {
          "mode": "Indoor",
          "spaceType": "Tente",
          "spaceDimensions": "120x120x200",
          "propagation": "Graine",
          "substrateType": "Bio",
          "substrateVolume": "11",
          "lightType": "LED",
          "lightPower": "600",
          "lightDuration": "18",
          "temperature": "24",
          "humidity": "60",
          // ... toutes les autres données (40+ champs)
        }
      },
      {
        "id": "1734525000000",
        "name": "Phase floraison",
        "description": "12h lumière, 20°C",
        "config": {
          "lightDuration": "12",
          "temperature": "20",
          // ... autres données
        }
      }
    ],
    
    "timelineData": {
      "0": {
        "presetId": "1734524800000",
        "data": {
          "mode": "Indoor",
          "temperature": "24",
          // ... données héritées du préréglage
        }
      },
      "21": {
        "presetId": "1734525000000",
        "data": {
          "lightDuration": "12",
          "temperature": "20"
        }
      }
    }
  }
}
```

---

## 🎬 Workflows complets

### Workflow 1 : Culture complète en 3 préréglages

```
JOUR 1 : CRÉATION DES PRÉRÉGLAGES

1. Créer "Phase germination"
   - Propagation: Sopalin
   - Température: 22°C
   - Humidité: 70%
   
2. Créer "Phase croissance"
   - Mode: Indoor
   - Lumière: LED 600W, 18h
   - Température: 24°C
   - Substrat: Bio 11L
   
3. Créer "Phase floraison"
   - Lumière: LED 600W, 12h
   - Température: 20°C
   - Engrais: Bio boost floraison

JOUR 1 : APPLICATION

4. Clic sur "Phase germination" → Actif
5. Sélectionner J1-J7 (Shift+clic)
6. "Assigner aux 7 cases" → ✓

7. Clic sur "Phase croissance" → Actif
8. Sélectionner J8-J35 (Shift+clic)
9. "Assigner aux 28 cases" → ✓

10. Clic sur "Phase floraison" → Actif
11. Sélectionner J36-J90 (Shift+clic)
12. "Assigner aux 55 cases" → ✓

RÉSULTAT : 90 cases configurées en 1 minute !
```

---

### Workflow 2 : Ajustements fins sur préréglages

```
SITUATION : J1-J30 ont le préréglage "Phase croissance"
BESOIN : Modifier température pour J15 (canicule)

1. Clic sur J15 (sélection unique)
2. Clic droit sur "Température" dans Contenus
3. Saisir "28" au lieu de "24"
4. Valider → Seul J15 est modifié

Note : Les autres cases gardent leur préréglage intact
```

---

### Workflow 3 : Duplication et modification

```
BESOIN : Créer "Phase croissance outdoor" basé sur "Phase croissance"

⚠️ À implémenter : Bouton "Dupliquer" sur chaque préréglage

1. Clic droit sur "Phase croissance"
2. "Dupliquer" → Copie créée
3. Renommer en "Phase croissance outdoor"
4. Modifier : Mode: Outdoor, Lumière: Naturel
5. Sauvegarder
```

---

## ✅ Avantages du système unique

### Pour l'utilisateur

✅ **Clarté** : Un seul bouton de création, workflow évident  
✅ **Rapidité** : Configuration de 90 cases en quelques clics  
✅ **Flexibilité** : Préréglages + ajustements fins possibles  
✅ **Réutilisabilité** : Bibliothèque persistante entre sessions  
✅ **Évolutivité** : Ajouter/modifier des préréglages à tout moment  

### Pour le développement

✅ **Simplicité** : Un seul modal, un seul workflow  
✅ **Maintenabilité** : Code centralisé, pas de redondance  
✅ **Cohérence** : Même UX pour tous les types de pipelines  
✅ **Testabilité** : Workflow linéaire facile à tester  

---

## 🔮 Évolutions futures suggérées

### Court terme

- [ ] Import/export de préréglages (JSON)
- [ ] Duplication de préréglages existants
- [ ] Recherche/filtre dans la liste des préréglages
- [ ] Tri par date/nom/fréquence d'utilisation

### Moyen terme

- [ ] Partage de préréglages entre utilisateurs
- [ ] Bibliothèque communautaire de préréglages
- [ ] Templates recommandés par type de culture
- [ ] Prévisualisation avant application

### Long terme

- [ ] Versioning des préréglages (historique)
- [ ] Préréglages collaboratifs (équipes)
- [ ] Analytics : préréglages les plus utilisés
- [ ] AI : suggestion de préréglages selon contexte

---

## 📝 Checklist de validation

### Fonctionnel

- [x] Un seul bouton de création de préréglage
- [x] Modal avec TOUS les champs de données
- [x] Sauvegarde dans la bibliothèque utilisateur
- [x] Activation par clic (bordure bleue + ✓)
- [x] Application en masse aux cases sélectionnées
- [x] Suppression avec confirmation
- [x] Persistence des données

### UX

- [x] Workflow expliqué dans l'interface
- [x] Feedback visuel clair (couleurs, icônes)
- [x] Messages d'aide contextuelle
- [x] Pas de confusion entre création/application
- [x] États impossibles bloqués (pas de bouton si conditions non remplies)

### Conformité CDC

- [x] Toutes les données configurables dans un préréglage
- [x] Sauvegarde permanente (jusqu'à suppression)
- [x] Assignation en masse supportée
- [x] Réutilisation rapide depuis la bibliothèque
- [x] Pas de saisie textuelle forcée (sélecteurs)

---

## 🎯 Résumé

**AVANT** : 3 boutons → Confusion  
**APRÈS** : 1 bouton → Clarté

**Workflow final** :
```
Créer → Activer → Appliquer
  ↓       ↓         ↓
Modal   Clic    Assignation
        +       en masse
     Cases
```

**Résultat** : Système 100% conforme au CDC, simple et puissant ! 🎉

---

**Date de finalisation** : 18 décembre 2025  
**Version** : 3.0 Final  
**Statut** : ✅ Production Ready  
**Conformité CDC** : 100%
