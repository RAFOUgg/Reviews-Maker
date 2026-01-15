# SECTION 1 - INFORMATIONS GÉNÉRALES (Fleurs)

## 📋 Finalité
Capturer les informations de base permettant l'identification et le contexte du produit.

---

## 🎯 Champs & Données

### FIELD 1.1: Nom Commercial

**Type de donnée:** `string`
**Obligatoire:** ✅ OUI
**Max length:** 255 caractères
**Format:** Texte libre
**Pattern:** Alphanumeric + caractères spéciaux autorisés

**Exemples valides:**
- "Girl Scout Cookies"
- "Skywalker OG"
- "Blue Dream #3"
- "Master Kush - Indoor"
- "GSC x OG Kush - Clone"

**Validations:**
- ❌ Vide (obligatoire)
- ❌ Plus de 255 caractères
- ✅ Caractères spéciaux (#, -, parenthèses)
- ✅ Majuscules/minuscules mélangées

**Interactions:**
- Affiche dans titres reviews
- Utilisé pour recherche galerie
- Export dans templates

**Stockage BDD:**
```typescript
generalInfo: {
  commercialName: string // Max 255 chars
}
```

---

### FIELD 1.2: Cultivar (Génétique/Variété)

**Type de donnée:** `cultivar-select` OU `create-new`
**Obligatoire:** ✅ OUI
**Source:** Bibliothèque utilisateur OU création à la volée

**Mode Sélection:**

#### Option A: Depuis Bibliothèque Utilisateur (Producteur)
```
[Autocomplete Search]
├─ Recherche par nom cultivar
├─ Affiche: Nom, Breeder, Type (Indica/Sativa/Hybride)
└─ Click → Sélectionne cultivar
```

**Données cultivar pré-remplis:**
- Nom cultivar
- Breeder
- Type génétique
- Parents (si enregistrés)
- Phénotype (si applicable)
- Notes historiques

#### Option B: Création Nouveau Cultivar
```
[+ Ajouter Nouveau Cultivar]
├─ Ouvre modal léger
├─ Champs: Nom, Breeder, Type
└─ Sauvegarde dans bibliothèque + sélectionne
```

**Champs création rapide:**
- Nom cultivar: string (obligatoire)
- Breeder: string (recommandé)
- Type: select (obligatoire) → Indica | Sativa | Hybride

**Validations:**
- ❌ Cultivar vide
- ✅ Création nouveau même si nom existe ailleurs
- ⚠️ Warning si nom très similaire à existants

**Interactions:**
- Pre-remplit Section 2 (Génétiques)
- Affiche parents potentiels
- Propose traits associés

**Stockage BDD:**
```typescript
reviewData: {
  cultivarId: string // FK Cultivar
  cultivar: Cultivar {
    name: string
    breeder: string
    type: "indica" | "sativa" | "hybrid"
  }
}
```

---

### FIELD 1.3: Farm / Producteur

**Type de donnée:** `string`
**Obligatoire:** ✅ OUI
**Max length:** 200 caractères
**Autocomplete:** OUI (données récurrentes utilisateur)

**Exemples valides:**
- "Green Paradise Farms"
- "Indoor Cultivation Studio #1"
- "Greenhouse Colorado"
- "Personal Grow - Balcony"

**Sources suggestions:**
- Farms utilisées précédemment (data récurrente)
- Farms publiques reconnus (si optionnel)
- Création libre si nouveau

**Validations:**
- ❌ Vide
- ✅ Caractères spéciaux sauf <> ` "
- ✅ Nombres & lettres mix

**Interactions:**
- Stockée comme "farm récurrente" après création
- Proposée en autocomplete futures reviews
- Affiche dans export

**Stockage BDD:**
```typescript
generalInfo: {
  farm: string // Max 200 chars
  farmFrequency: int // Nombre times utilisé
}
```

---

### FIELD 1.4: Type de Produit

**Type de donnée:** `select` (single choice)
**Obligatoire:** ✅ OUI
**Nombre choix:** 6

**Valeurs possibles:**
```
├─ "Indica"
├─ "Sativa"
├─ "Hybride Indica-dominant" (70%+ Indica)
├─ "Hybride Sativa-dominant" (70%+ Sativa)
├─ "Hybride Équilibré" (40-60% mix)
└─ "CBD-dominant" (CBD > THC)
```

**Représentation UI:**
```
Type de Plante:
○ Indica
○ Sativa  
○ Hybride Indica-dominant (70%+)
○ Hybride Sativa-dominant (70%+)
○ Hybride Équilibré (40-60%)
○ CBD-dominant (CBD > THC)
```

**Effets pré-affichés par type (informatif):**
- **Indica:** Relaxation, corps, sommeil
- **Sativa:** Énergie, créativité, focus
- **Hybride:** Mix équilibré
- **CBD:** Thérapeutique, calme

**Interactions:**
- Impacte tips/conseils affichés
- Détermine pipelines disponibles
- Influence export sections

**Validations:**
- ❌ Vide
- ✅ Un seul choix
- ⚠️ CBD-dominant restreint certaines features

**Stockage BDD:**
```typescript
generalInfo: {
  productType: enum {
    INDICA
    SATIVA
    HYBRID_INDICA_DOM
    HYBRID_SATIVA_DOM
    HYBRID_BALANCED
    CBD_DOMINANT
  }
}
```

---

### FIELD 1.5: Photos (Galerie)

**Type de donnée:** `file-upload` (multiple)
**Obligatoire:** ✅ OUI (au moins 1)
**Maximum:** 4 photos
**Formats acceptés:** JPG, PNG, JPEG, WEBP
**Taille max par fichier:** 25MB
**Résolution recommandée:** 1200x1200px minimum

**Structure Upload:**

#### Photo Principale (1ère)
- **Affichage:** Vignette grande
- **Destination:** Galerie publique (si review publiée)
- **Compression:** Auto 300dpi pour exports
- **Ratio:** Flexible

**UI Upload:**
```
[Drag & Drop Photo Principale]
ou
[Parcourir fichier]

Affichage:
[Thumbnail] [Infos: 2.5MB, 1920x1440] [✓ Valide]
```

#### Photos Additionnelles (2-4)
- **Optionnelles:** Oui (recommandées)
- **Affichage:** Thumbnails mini-grid
- **Usage:** Galerie interne, export multi-page

**Validations Photos:**
- ❌ Fichier > 25MB
- ❌ Format non supporté
- ❌ Image corrompue
- ✅ Métadonnées EXIF conservées (optionnel)
- ⚠️ Compression auto si > 2000px

**Données Métadonnées Conservées:**
```json
{
  "uploadedAt": "2025-01-15T10:30:00Z",
  "fileName": "gsc_main.jpg",
  "fileSize": 2145632,
  "resolution": "1920x1440",
  "format": "JPEG",
  "cdnUrl": "https://cdn.reviews-maker.com/...",
  "thumbnailUrl": "https://cdn.reviews-maker.com/.../thumb"
}
```

**Interactions Photos:**
- Affiche dans preview export
- Compression auto pour formats
- Suppression possible en édition
- Remplacement possible

**Stockage BDD:**
```typescript
generalInfo: {
  mainPhoto: string // URL CDN
  mainPhotoMetadata: Json
  additionalPhotos: string[] // Array URLs
}
```

---

### FIELD 1.6: Description Générale (Optionnel)

**Type de donnée:** `textarea`
**Obligatoire:** ❌ NON
**Max length:** 1000 caractères
**Min length:** 10 caractères (si rempli)

**Placeholder:**
```
"Ajoutez des notes générales sur cette fleur:
contexte culture, acquisition, observations initiales..."
```

**Exemples valides:**
- "Première récolte personnelle, culture indoor 80x80"
- "Achetée en dispensaire légal, très satisfait"
- "Phénotype spécial trouvé en cette génération"

**Validations:**
- ❌ < 10 caractères si rempli
- ❌ > 1000 caractères
- ✅ Sauts de ligne autorises
- ✅ Caractères spéciaux standards

**Interactions:**
- Affichable dans export "Complète"
- Searchable en galerie (full-text search)
- Editable à tout moment

**Stockage BDD:**
```typescript
generalInfo: {
  description: string? // Optional, max 1000
}
```

---

## 📊 Vue d'ensemble Données Section 1

```json
{
  "sectionType": "generalInfo",
  "section1_data": {
    "commercialName": "Girl Scout Cookies",
    "cultivarId": "cult-uuid-123",
    "cultivarData": {
      "name": "Girl Scout Cookies",
      "breeder": "Thin Mint Genetics",
      "type": "HYBRID_INDICA_DOM"
    },
    "farm": "Green Paradise Farms",
    "productType": "HYBRID_INDICA_DOM",
    "mainPhoto": "https://cdn.../photo-main.jpg",
    "mainPhotoMetadata": {
      "uploadedAt": "2025-01-15T10:30:00Z",
      "resolution": "1920x1440",
      "fileSize": 2145632
    },
    "additionalPhotos": [
      "https://cdn.../photo-2.jpg",
      "https://cdn.../photo-3.jpg"
    ],
    "description": "Première récolte personnel, très satisfait du résultat"
  }
}
```

---

## 🔗 Interactions avec Autres Sections

| Champ | Impacte | Comment |
|-------|---------|---------|
| **Cultivar** | Section 2 Génétique | Pre-remplit breeder, parents, traits |
| **Type Produit** | Toutes sections | Tips/conseils adaptés au type |
| **Farm** | Export | Affichage dans templates |
| **Photos** | Export | Compression selon format export |
| **Description** | Galerie Publique | Searchable, affichable |

---

## ✅ Checklist Complétude Section 1

- [ ] Nom commercial rempli (max 255 chars)
- [ ] Cultivar sélectionné ou créé
- [ ] Farm remplie (max 200 chars)
- [ ] Type de produit sélectionné
- [ ] Photo principale uploadée (1+ photos)
- [ ] Photos additionnelles (optionnel mais recommandé)
- [ ] Description optionnelle remplie (recommandé)

---

## 🔐 Permissions Section 1

| Tier | Créer | Éditer | Supprimer |
|------|-------|--------|-----------|
| Amateur | ✅ | ✅ | ✅ |
| Producteur | ✅ | ✅ | ✅ |
| Influenceur | ✅ | ✅ | ✅ |

*Tous les utilisateurs ont accès complet à Section 1*

