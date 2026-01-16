# SECTION 3: PIPELINE CULTURE - Index Documentation

> ⚠️ **Documentation Complète** : Voir [SECTION_3_DATA_COMPLETE.md](SECTION_3_DATA_COMPLETE.md)

## 🎯 Système de Pipeline Culture - Vue Rapide

### Concept Central
Chaque groupe de données est sauvegardable indépendamment comme **PRESET** réutilisable dans la Bibliothèque utilisateur.

### 9 Groupes de Données

| # | Groupe | Réutilisabilité | Permutabilité | Mode Optimal |
|---|--------|-----------------|---------------|--------------|
| 1 | Espace de Culture | ✅ Oui | ✅ Oui | Tous |
| 2 | Substrat & Composition | ✅ Oui | ✅ Oui | Tous |
| 3 | Irrigation & Hydratation | ✅ Oui | ⚠️ Moyen | Jour/Semaine |
| 4 | Engrais & Nutrition | ✅ Oui | ⚠️ Moyen | Jour/Semaine |
| 5 | Lumière | ✅ Oui | ❌ Non | Phases |
| 6 | Environnement Climatique | ⚠️ Moyen | ✅ Oui | Jour |
| 7 | Palissage & Techniques | ⚠️ Moyen | ✅ Oui | Phase/Semaine |
| 8 | Morphologie & Observations | ❌ Non | ❌ Non | Jour |
| 9 | Récolte & Finition | ❌ Non | ❌ Non | Final |

### Modes Pipeline

**Choix obligatoire au démarrage :**
- **JOURS** : Date début/fin obligatoires, calendrier 365 jours style Github commits
- **SEMAINES** : Semaine début obligatoire, S1→S52
- **PHASES** : 12 phases prédéfinies (Germination, Croissance-début/milieu/fin, Floraison-début/milieu/fin, etc.)

### Bibliothèque Utilisateur - Structure Presets

```
📚 Ma Bibliothèque
├── 🏗️ Groupes de Données Réutilisables
│   ├── 📁 Setups Environnement
│   │   ├── "Indoor LED 3x3"
│   │   ├── "Outdoor Spring"
│   │   └── "Greenhouse"
│   ├── 📁 Setups Substrat
│   │   ├── "Bio Composé Standard"
│   │   ├── "Hydro NFT"
│   │   └── "Coco 70-30"
│   ├── 📁 Setups Irrigation
│   ├── 📁 Setups Nutrition
│   ├── 📁 Setups Lumière
│   ├── 📁 Setups Climat
│   └── 📁 Setups Techniques
└── 🌿 Fiches Techniques Fleurs
    ├── [Reviews sauvegardées avec tous presets]
```

### Workflow Création Fiche

```
1. Infos Générales + Génétiques (SECTIONS 1-2)
2. Créer Pipeline Culture (SECTION 3):
   ├─ Choix Mode (Jours/Semaines/Phases)
   ├─ Définir Dates Culture
   ├─ Charger ou Créer 9 Groupes:
   │  ├─ Chaque groupe → Sauvegarder comme Preset?
   │  ├─ Remplir Étapes (auto-générées selon mode)
   │  └─ À chaque étape: modifier groupes au besoin
3. Remplir Sections Évaluatives (SECTIONS 4-9)
4. Générer Export
```

### Propriétés Chaque Preset

```json
{
  "presetId": "unique_id",
  "name": "Setup Indoor LED Standard 2024",
  "group": "environnement",
  "createdAt": "2024-01-01",
  "usageCount": 5,
  "usedInReviews": ["review_id_1", "review_id_2"],
  "isActive": true,
  "data": { /* structure complète groupe */ }
}
```

---

## 📖 Documentation Complète

Pour détails exhaustifs (structure JSON, champs Prisma, exemples, etc.):
👉 **[SECTION_3_DATA_COMPLETE.md](SECTION_3_DATA_COMPLETE.md)**

Contient:
- ✅ Structure JSON détaillée chaque groupe
- ✅ Tous champs avec types et options
- ✅ Modèles Prisma (`CultureSetup`, `Pipeline`, `PipelineStage`)
- ✅ Points d'intégration pipeline
- ✅ Visualisation calendar
- ✅ Workflow complet + statistiques
