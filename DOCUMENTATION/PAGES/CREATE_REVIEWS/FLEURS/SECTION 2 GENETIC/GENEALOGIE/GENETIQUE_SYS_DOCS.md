# SECTION 2 - GÉNÉTIQUE & GÉNÉALOGIE (Fleurs)

## 📋 Finalité
Documenter les données génétiques et construire l'arbre généalogique du cultivar.

---

## 🎯 Champs & Données

### FIELD 2.1: Breeder (Créateur Graine)

**Type de donnée:** `string`
**Obligatoire:** ✅ OUI
**Max length:** 150 caractères
**Autocomplete:** OUI (données récurrentes)

**Exemples valides:**
- "Thin Mint Genetics"
- "DNA Genetics"
- "Delicious Seeds"
- "Personal Collection"
- "Unknown/Anonymous"

**Source données:**
- Packaging graine original
- Breeder website
- Seed bank documentation
- Création libre

**Validations:**
- ❌ Vide
- ✅ Caractères spéciaux (-, &, +)
- ⚠️ "Unknown" si vraiment pas d'info

**Stockage BDD:**
```typescript
geneticData: {
  breeder: string // Max 150 chars
}
```

---

### FIELD 2.2: Variété

**Type de donnée:** `autocomplete-select` OU `free-text`
**Obligatoire:** ❌ NON
**Source:** data/terpenes.json OU saisie libre

**Structure Autocomplete:**
```
[Recherche Variété...]
├─ Suggestions depuis data/terpenes.json
├─ Exemples: "Myrcène", "Limonène", "Pinène"
├─ Affiche: Nom + profil aromatique
└─ Ou: Créer nouveau libre-text
```

**Validations:**
- ✅ Peut rester vide
- ✅ Sélection depuis liste
- ✅ Création texte libre
- ❌ > 100 caractères

**Interactions:**
- Suggère profil terpénique
- Propose effets associés (informatif)
- Searchable galerie

**Stockage BDD:**
```typescript
geneticData: {
  variety: string? // Optional, max 100
  varietySource: enum { "PREDEFINED" | "CUSTOM" }
}
```

---

### FIELD 2.3: Type Génétique

**Type de donnée:** `select` (single)
**Obligatoire:** ✅ OUI
**Pré-rempli:** OUI (depuis Section 1)

**Valeurs possibles:**
```
○ Indica
○ Sativa
○ Hybride
```

**Comportement:**
- **Auto-pré-rempli** depuis Section 1 (Type de Produit)
- Peut être modifié séparément si plus précis
- Affiche à titre informatif

**Interactions:**
- Filtre galerie publique
- Impacte suggestions profils

**Stockage BDD:**
```typescript
geneticData: {
  geneticType: enum {
    INDICA
    SATIVA
    HYBRID
  }
}
```

---

### FIELD 2.4: Pourcentages Génétiques

**Type de donnée:** `number-slider` (2 sliders)
**Obligatoire:** ❌ NON (recommandé)
**Range:** 0-100% chacun
**Constraint:** Must total 100%

**Structure:**
```
Pourcentage Indica:    [========|] 70%
Pourcentage Sativa:    [|========] 30%
Total:                 100% ✓
```

**Règles:**
- Deux sliders liés (adjusting one recalculates other)
- Doit toujours = 100%
- Display feedback: "70% Indica dominant"

**Exemples valides:**
- 100% Indica, 0% Sativa
- 50% Indica, 50% Sativa (équilibré)
- 80% Sativa, 20% Indica

**Validations:**
- ✅ Peut rester vide (no requirement)
- ❌ Total ≠ 100%
- ✅ Nombres décimaux (70.5%)

**Stockage BDD:**
```typescript
geneticData: {
  indicaPercentage: number? // 0-100
  sativaPercentage: number? // 0-100
  // Constraint: indica + sativa = 100 si présents
}
```

---

### FIELD 2.5: Code Phénotype

**Type de donnée:** `string`
**Obligatoire:** ❌ NON
**Max length:** 50 caractères
**Format:** Alphanumeric + underscore

**Exemples valides:**
- "Pheno#1"
- "Pheno_3"
- "M2"
- "GSC-Clone-A"
- "Skywalker_OG_Hunt_2024"

**Usage:**
- Identifier phénotypes spécifiques dans hunt
- Donner alias à clones
- Tracker générations

**Validations:**
- ✅ Alphanum + _, #, -
- ❌ Vide ok
- ❌ > 50 chars
- ⚠️ Unique pas requise (duplicates ok)

**Interactions:**
- Affiche dans export
- Searchable galerie
- Utilisable pour tracking hunt

**Stockage BDD:**
```typescript
geneticData: {
  phenotypeCode: string? // Max 50
}
```

---

### FIELD 2.6: Traits Distinctifs

**Type de donnée:** `multi-select` OU `tags-input`
**Obligatoire:** ❌ NON
**Max sélections:** 10

**Choix Traits:**
```
Prédéfinis (sélectionnables):
├─ "Croissance Rapide"
├─ "Haute Productivité"
├─ "Résistant Maladies"
├─ "Petite Stature"
├─ "Arôme Intense"
├─ "Trichomes Abondants"
├─ "Saveur Complexe"
├─ "Couleurs Uniques"
├─ "Effets Puissants"
└─ "+ Ajouter Custom..."
```

**Format Custom Traits:**
```
[Champ texte] [+ Ajouter]
"Très collant" → Ajoute tag
"Clone stable" → Ajoute tag
```

**Validations:**
- ✅ Vide ok
- ✅ Multi-select prédéfinis
- ✅ Custom traits libre
- ❌ Duplicates
- ❌ > 10 traits

**Interactions:**
- Affiche badge review
- Filtrable galerie publique
- Searchable

**Stockage BDD:**
```typescript
geneticData: {
  distinctiveTraits: string[] // Max 10 items
  // Can be from predefined list OR custom tags
}
```

---

### FIELD 2.7: Données Parente (Généalogie)

**Type de donnée:** `genealogy-builder` (visual)
**Obligatoire:** ❌ NON (Producteur seulement)
**Permissions:** Producteur uniquement

#### A. Sélection Parents Simples

```
Parent 1 (Mère): [Autocomplete Cultivars]
Parent 2 (Père): [Autocomplete Cultivars]
```

**Source Parents:**
- Sélection depuis Cultivars bibliothèque utilisateur
- Affiche: Nom, Breeder, Type génétique

**Validations:**
- ✅ Peut laisser vide
- ✅ Même parent pour P1 & P2 (incest tracking)
- ✅ Seul Parent 1 rempli ok
- ✅ Parents d'autres utilisateurs (ref ID only)

#### B. Arbre Généalogique Visuel (Canvas)

**Technologie:** React Flow ou similaire

**Interaction:**
```
[Cultivar Actuel]
     ↙        ↘
[Parent 1]  [Parent 2]
    ↙ ↘         ↙ ↘
[GP1] [GP2]  [GP3] [GP4]
     ...continuer

Interactions:
├─ Drag & drop cultivars
├─ Click sur nœud → voir infos
├─ Supprimer relation
├─ Ajouter générations
└─ Export image généalogie
```

**Données Généalogie:**
```typescript
parentData: {
  parent1Id: string? // FK Cultivar
  parent1Name: string?
  parent1Breeder: string?
  parent2Id: string?
  parent2Name: string?
  parent2Breeder: string?
  geneticLineage: Json? // Full tree data
}
```

---

### FIELD 2.8: Notes Complètes Génétiques

**Type de donnée:** `textarea`
**Obligatoire:** ❌ NON
**Max length:** 2000 caractères

**Placeholder:**
```
"Notes sur la génétique et généalogie:
- Provenance graine
- Sélection phénotypique
- Stabilité génétique observée
- Résultats élevage
- Évolution générations..."
```

**Exemples:**
- "F1 très homogène, tous phénotypes similaires"
- "Intéressant pour hunt: 3 phénotypes distincts"
- "Léger hermaphrodite trait génétique observé"
- "Très stable sur 4 générations"

**Validations:**
- ✅ Vide ok
- ❌ > 2000 chars
- ✅ Sauts de ligne

**Interactions:**
- Affichable export "Complète"
- Searchable galerie full-text
- Utile pour producteurs

**Stockage BDD:**
```typescript
geneticData: {
  completeNotes: string? // Max 2000
}
```

---

## 📊 Vue d'ensemble Données Section 2

```json
{
  "sectionType": "genetics",
  "section2_data": {
    "breeder": "Thin Mint Genetics",
    "variety": "Myrcène",
    "geneticType": "HYBRID",
    "indicaPercentage": 70,
    "sativaPercentage": 30,
    "phenotypeCode": "GSC_Pheno3",
    "distinctiveTraits": [
      "Arôme Intense",
      "Haute Productivité",
      "Trichomes Abondants",
      "Très collant"
    ],
    "parentData": {
      "parent1Id": "cult-uuid-gsc-female",
      "parent1Name": "Girl Scout Cookies",
      "parent1Breeder": "Thin Mint Genetics",
      "parent2Id": "cult-uuid-og-male",
      "parent2Name": "OG Kush",
      "parent2Breeder": "Unknown"
    },
    "completeNotes": "F2 depuis cross GSC x OG Kush. Très stable, tous phénotypes ressemblent beaucoup. Sélectionné ce phénotype pour production car high yielding."
  }
}
```

---

## 🔗 Interactions avec Autres Sections

| Champ | Impacte | Comment |
|-------|---------|---------|
| **Breeder** | Export | Affichage source génétique |
| **Traits** | Galerie | Filtrage avancé |
| **Parents** | Arbre Généalogie | Visualisation |
| **Notes** | Galerie Publique | Full-text search |

---

## ✅ Checklist Complétude Section 2

- [ ] Breeder rempli (source graine)
- [ ] Variété remplie (optionnel mais recommandé)
- [ ] Type génétique vérifié
- [ ] Pourcentages (si connus)
- [ ] Code phénotype (si applicable)
- [ ] Traits distinctifs identifiés
- [ ] Parents documentés (si disponible)
- [ ] Notes généalogiques (si producteur)

---

## 🔐 Permissions Section 2

| Tier | Visualiser | Généalogie | Parents |
|------|-----------|-----------|---------|
| Amateur | ✅ Basique | ❌ | ❌ |
| Producteur | ✅ Complète | ✅ | ✅ |
| Influenceur | ✅ Basique | ❌ | ❌ |

