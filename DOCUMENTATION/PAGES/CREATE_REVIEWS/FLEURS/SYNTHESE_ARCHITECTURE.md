# FLEURS - Synthèse Architecture Complète

## 🎯 Vision Générale

Type de produit **Fleurs (Herbes/Buds)** avec ambition **exhaustivité maximale** :
- Culture documentée en **3D** (plan physique + dimension temps)
- Traçabilité complète du cycle de vie plante
- Réutilisabilité configurations pour gains UX
- Support arbre généalogique (Producteur)

---

## 📊 Structure Générale: 9 SECTIONS

### SECTION 1: INFORMATIONS GÉNÉRALES
**Type**: Métadonnées
**Permissions**: Amateur+
**Contenu**:
- Nom commercial, photos, cultivar, farm, type (Indica/Sativa/Hybride)
- Informations de base identification

### SECTION 2: GÉNÉTIQUES & GÉNÉALOGIE
**Type**: Génétique
**Permissions**: Producteur (complet) / Amateur (basique)
**Contenu**:
- Breeder, variété, type génétique, pourcentages
- **Spécial Producteur**: Arbre généalogique interactif (PhenoHunt integration)
- Traits distinctifs, notes généalogiques

### SECTION 3: PIPELINE CULTURE ⚙️ **← CŒUR SYSTÈME**
**Type**: Processus 3D (plan + temps)
**Permissions**: Producteur uniquement
**Contenu**:
- **9 Groupes de Données réutilisables**:
  1. Espace de Culture
  2. Substrat & Composition
  3. Irrigation & Hydratation
  4. Engrais & Nutrition
  5. Lumière
  6. Environnement Climatique
  7. Palissage & Techniques
  8. Morphologie & Observations
  9. Récolte & Finition

- **3 Modes Pipeline**:
  - JOURS (calendrier 365j style Github)
  - SEMAINES (S1-S52)
  - PHASES (12 phases prédéfinies)

- **Sauvegarde Presets**: Chaque groupe → Réutilisable dans Bibliothèque
- **Traçabilité Complète**: Chaque étape enregistrée avec observations/photos

### SECTION 4: VISUEL & TECHNIQUE
**Type**: Évaluation sensorielle
**Permissions**: Amateur+
**Contenu**:
- Scores 0-10 sur: Couleur, Densité, Trichomes, Pistils, Manucure, Moisissure, Graines

### SECTION 5: ODEURS
**Type**: Évaluation sensorielle
**Permissions**: Amateur+
**Contenu**:
- Notes dominantes/secondaires (multi-select), arômes inhalation/expiration, intensité aromatique

### SECTION 6: TEXTURE
**Type**: Évaluation sensorielle
**Permissions**: Amateur+
**Contenu**:
- Scores 0-10 sur: Dureté, Densité tactile, Élasticité, Collant

### SECTION 7: GOÛTS
**Type**: Évaluation sensorielle
**Permissions**: Amateur+
**Contenu**:
- Intensité, agressivité, dry puff, inhalation, expiration/arrière-goût

### SECTION 8: EFFETS RESSENTIS
**Type**: Évaluation expérience
**Permissions**: Amateur+
**Contenu**:
- Rapidité montée, intensité, profils effets (8 max, catégorisés), durée
- Expérience consommation: Méthode, dosage, durée, effets secondaires, usage préféré

### SECTION 9: PIPELINE CURING MATURATION
**Type**: Processus post-récolte
**Permissions**: Producteur uniquement
**Contenu**:
- Similaire SECTION 3 pour phase curing/maturation
- Modification données sections 4-8 selon évolution

---

## 🔄 Interrelations Sections

```
SECTION 1: Infos Générales
    ↓
SECTION 2: Génétiques (Producteur: + Pheno Hunt)
    ↓
SECTION 3: PIPELINE CULTURE ← Central
    │   ├─ Génère progression phases
    │   ├─ Auto-calcule dates/durées
    │   ├─ Lien événements (arrosage ↔ engraissage)
    │   └─ Sauvegarde presets réutilisables
    │
    ├─→ SECTION 4: Visuel & Technique (observable)
    ├─→ SECTION 5: Odeurs (observations croissance)
    ├─→ SECTION 6: Texture (phase croissance/floraison)
    ├─→ SECTION 7: Goûts (post-récolte)
    └─→ SECTION 8: Effets (post-consommation)
    │
    ↓
SECTION 9: PIPELINE CURING MATURATION (suivi post-récolte)
    │
    ├─→ Modification SECTION 4: Visuel & Technique (évolution cure)
    ├─→ Modification SECTION 5: Odeurs (développement arômes)
    ├─→ Modification SECTION 7: Goûts (évolution flaveur)
    └─→ Modification SECTION 8: Effets (potentiation cure)
```

---

## 📚 Système de Bibliothèque Utilisateur

### Structure Complète

```
📚 MA BIBLIOTHÈQUE
│
├── 🌿 FICHES TECHNIQUES FLEURS
│   ├── [Review 1: GSC Indoor 2024]
│   │   ├─ Section 1-9 complètes
│   │   ├─ Presets utilisés
│   │   ├─ Exports générés
│   │   └─ Metadata création/modif
│   ├── [Review 2: OG Kush Outdoor]
│   └── ...
│
├── 🏗️ GROUPES DE DONNÉES RÉUTILISABLES
│   │
│   ├── 📁 SETUPS ENVIRONNEMENT
│   │   ├─ "Indoor LED 3x3m Tent"
│   │   ├─ "Outdoor Spring Garden 20m²"
│   │   ├─ "Greenhouse Tempéré"
│   │   ├─ Metadata:
│   │   │   ├─ Créé: 2024-01-01
│   │   │   ├─ Utilisé dans: 5 reviews
│   │   │   ├─ Dernière modif: 2024-01-14
│   │   │   ├─ Notes personnelles
│   │   │   └─ Rating: ⭐⭐⭐⭐⭐
│   │   └─ Data: {...}
│   │
│   ├── 📁 SETUPS SUBSTRAT
│   │   ├─ "Bio Composé Standard (Canna)"
│   │   ├─ "Hydro NFT System"
│   │   ├─ "Coco 70% + Perlite 30%"
│   │   └─ ...
│   │
│   ├── 📁 SETUPS IRRIGATION
│   │   ├─ "Goutte-à-goutte 10L/jour"
│   │   └─ ...
│   │
│   ├── 📁 SETUPS NUTRITION
│   │   ├─ "Biobizz Full Pack Gamme"
│   │   ├─ "Canna Aqua Hydro"
│   │   └─ ...
│   │
│   ├── 📁 SETUPS LUMIÈRE
│   │   ├─ "LED Spectrum King 300W"
│   │   ├─ "HPS 600W + MH Combo"
│   │   └─ ...
│   │
│   ├── 📁 SETUPS CLIMAT
│   │   ├─ "Climat Vegétatif Optimal"
│   │   └─ ...
│   │
│   └── 📁 SETUPS TECHNIQUES
│       ├─ "SCROG + Main-Lining Hybride"
│       └─ ...
│
├── 🧬 CULTIVARS
│   ├─ "GSC (Girl Scout Cookies)"
│   ├─ "OG Kush"
│   └─ ... [avec historique, stats]
│
└── ⚙️ PRÉFÉRENCES GLOBALES
    ├─ Unités par défaut (métrique/impérial)
    ├─ Marques favoris
    └─ Templates exports préférés
```

### Avantages Presets

1. **Gain UX**: Rechargement configurations testées = 80% moins de saisie
2. **Consistance**: Même setup dans plusieurs reviews → données comparables
3. **Analytics**: Meilleurs setups identifiables par stats
4. **Versioning**: Évolution configs trackable (preset v1, v2, etc.)
5. **Sharing**: Possibilité partager presets avec communauté (futur)

---

## 🎬 Workflow Complet Création Fiche

### Phase 1: Setup Initial (5-10 min)

```
1. Créer nouvelle Review (type: Fleur)
2. Remplir SECTION 1: Infos Générales
3. Remplir SECTION 2: Génétiques
4. SECTION 3 - Initialiser Pipeline Culture:
   ├─ Choix Mode: JOURS / SEMAINES / PHASES
   ├─ Définir dates culture
   └─ Choix Presets ou Créer Nouveaux:
       ├─ Sélectionner Espace (charger preset ou nouveau)
       ├─ Sélectionner Substrat (charger preset ou nouveau)
       ├─ Sélectionner Irrigation
       ├─ Sélectionner Engrais
       ├─ Sélectionner Lumière
       ├─ Configurer Climat
       ├─ Sélectionner Techniques Palissage
       └─ À chaque: "Enregistrer comme preset"?
```

### Phase 2: Suivi Pipeline (Quotidien/Hebdélataire)

```
Pendant la culture:
├─ Chaque jour/semaine/phase (selon mode):
│  ├─ Enregistrer étape (date/observations/photos)
│  ├─ Modifier groupes si changements
│  └─ Ajouter commentaires/événements
└─ Visualisation calendar mise à jour

À chaque phase nouvelle:
├─ Transitions automatiques détectées (ex: 16h→12h lumière)
├─ Confirmations utilisateur requises
└─ Enregistrement changements
```

### Phase 3: Récolte (Jour récolte)

```
1. Enregistrer données RÉCOLTE (Groupe 9):
   ├─ Date/heure
   ├─ Analyse trichomes
   ├─ Poids brut/net/sec
   ├─ Rendements calculés
   └─ Photos finales

2. Optionnel: Remplir sections évaluatives SECTION 4-8
   (si test immédiat post-récolte)
```

### Phase 4: Curing & Maturation (1-8 semaines)

```
1. Initialiser SECTION 9: Pipeline Curing
   ├─ Mode saisie (jours/semaines)
   ├─ Durée estimée
   └─ Paramètres curing

2. Suivi hebdo/décadaire:
   ├─ Enregistrer conditions curing
   ├─ Modifier évaluations SECTIONS 4-8
   │   (Odeurs développent, goûts affinent)
   └─ Photos progression

3. À fin curing:
   ├─ Test final complet
   ├─ Remplissage SECTIONS 4-8 finales
   └─ Review "COMPLÉTÉE"
```

### Phase 5: Export & Partage

```
1. Générer Export avec template
2. Sauvegarder dans Bibliothèque
3. Optionnel: Partager publiquement (si review publique)
```

---

## 🔧 Points d'Intégration Clés

### Avec Généalogie (Producteur)
- SECTION 2 permet créer/lier cultivars
- Arbre généalogique accessible depuis Review
- Phénotypes trackables

### Avec Export Maker
- SECTION 3 Pipeline visualisable en export (graphique timeline)
- SECTIONS 4-9 directement exportables
- Sélection données à inclure

### Avec Gallerie Publique
- Reviews publiques listées par type/cultivar
- Filtrage par critères (THC%, rendement, etc.)
- Comparaisons possibles reviews similaires

---

## 📈 Statistiques Utilisateur

### Amateur
- Nombre reviews créées (par type produit)
- Notes moyennes données (par catégorie)
- Meilleures notes reçues (si review publique)

### Producteur
- Statistiques culture exhaustives:
  - Rendements moyens (g/m², g/W)
  - Cycles durée moyenne
  - Setups optimaux identifiés
  - Cultivars meilleur rendement
  - Techniques efficacité
  - Évolutions (trends temporels)
  
- Statistiques engagement (si reviews publiques):
  - Likes/comments/shares
  - Croissance audience

---

## 🎯 Checklist Exhaustivité Fleur

### Documentation
- ✅ INDEX.md (vue globale)
- ✅ SECTION 1-2 (métadonnées, génétiques)
- ✅ SECTION 3 (Pipeline Culture exhaustive)
  - ✅ 9 Groupes détaillés
  - ✅ Modèles Prisma
  - ✅ Workflow presets
- ⏳ SECTIONS 4-9 (à détailler si besoin)
- ⏳ Integration PhenoHunt (pour plus tard)

### Implémentation Frontend
- ⏳ Pages formulaires SECTIONS 1-9
- ⏳ Gestion Pipeline (création, édition étapes)
- ⏳ Visualisation calendar
- ⏳ Système presets bibliothèque

### Implémentation Backend
- ⏳ Routes API CRUD review
- ⏳ Routes API presets
- ⏳ Calculs rendements/statistiques
- ⏳ Export templates

### Data/Seed
- ⏳ Listes composants substrat
- ⏳ Listes techniques palissage
- ⏳ Phases prédéfinies
- ⏳ Marques/produits (si applicable)

---

## 🚀 Prochaines Étapes

1. **Valider architecture** avec utilisateurs pilotes
2. **Détailler SECTIONS 4-9** au même niveau que SECTION 3
3. **Implémenter modèles Prisma** complets
4. **Créer pages formulaires** pour chaque section
5. **Développer visualisation calendar** pipeline
6. **Tester exhaustivité** avec cas réels utilisateurs
7. **Intégrer PhenoHunt** (Producteur seulement)
8. **Analytics/Statistiques** utilisateur

---

## 📝 Notes Importantes

- **Exhaustivité ≠ Complexité**: UI doit rester épurée (Apple-like) malgré données nombreuses
- **Réutilisabilité clé**: Presets doivent vraiment gagner temps pour adoption
- **Traçabilité 3D**: La dimension "temps" (pipeline) est différenciateur majeur
- **Extensibilité**: Architecture flexible pour ajout futurs champs/groupes
- **Privacy**: Données cultivation sensibles = protection requise

