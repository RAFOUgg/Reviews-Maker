# Fonctionnalités - Reviews-Maker

## 📋 Vue d'Ensemble

Reviews-Maker est une plateforme complète avec **4 types de produits**, **3 tiers d'abonnement**, et un **système de pipeline évolutif**.

---

## 🌾 Type 1: Fleurs (Cannabis Séché)

### Données Complètes

#### 📋 Informations Générales
- Nom commercial
- Cultivar(s) associé(s)
- Farm/Producteur
- Type génétique (Indica/Sativa/Hybride/CBD)
- Photos (1-4)
- Breeder de la graine
- Pourcentage génétique

#### 🔬 Pipeline Culture (Phase 4.1)
**Système de saisie temporelle:**
- Définition de la trame (Jours/Semaines/Phases)
- Durée culture (dates début/fin)
- **Données par étape**:
  - Mode: Indoor/Outdoor/Greenhouse/No-till
  - Espace: Type, dimensions, surface, volume
  - Propagation: Graine/Clone/Bouture
  - Substrat: Type, volume, composition
  - Irrigation: Type, fréquence, volume
  - Engrais: Type, marque, dosage, fréquence
  - Lumière: Type, spectre, distance, puissance, DLI, PPFD, Kelvin
  - Environnement: Température, humidité, CO2, ventilation
  - Palissage: LST, SCROG, SOG, etc.
  - Morphologie: Taille, volume, poids, branches, feuilles, buds
  - Récolte: Couleur trichomes, date, poids brut/net, rendement

#### 👁️ Visuel & Technique (Notation /10)
- Couleur (nuancier dégradé)
- Densité visuelle
- Trichomes
- Pistils
- Manucure
- Moisissure
- Graines

#### 👃 Odeurs
- Notes dominantes (max 7)
- Notes secondaires (max 7)
- Arômes inhalation (primaire/secondaire)
- Saveur rétro-olfaction
- Intensité arôme (/10)

#### 🤚 Texture (Notation /10)
- Dureté
- Densité tactile
- Élasticité
- Collant

#### 😋 Goûts (Notation /10)
- Intensité
- Agressivité/piquant
- Dry puff (max 7 notes)
- Inhalation (max 7)
- Expiration/arrière-goût (max 7)

#### 💥 Effets Ressentis (Notation /10)
- Montée (rapidité)
- Intensité
- Choix effets (max 8)
  - Types: Mentaux, Physiques, Thérapeutiques
- Filtre: Tous, Neutre, Positif, Négatif

**Expérience d'utilisation:**
- Méthode consommation: Combustion/Vapeur/Infusion
- Dosage (estimé en g/mg)
- Durée effets (HH:MM)
- Profils effets: Anxiolytique, Relaxant, Énergisant, etc.
- Effets secondaires
- Début des effets
- Durée: Courte/Moyenne/Longue
- Usage préféré: Soir/Journée/Seul/Social/Médical

#### 🔥 Pipeline Curing/Maturation (Phase 4.1)
**Système de saisie temporelle (après récolte):**
- Trame: Secondes/Minutes/Heures/Jours/Semaines/Mois
- Type curing: Froid (<5°C) / Chaud (>5°C)
- Température curing
- Humidité relative
- Type récipient
- Emballage primaire
- Opacité récipient
- Volume occupé
- **Modifications notes** (Visuel, Odeurs, Goûts, Effets évoluent)

#### 📊 Données Analytiques
- Taux THC (%)
- Taux CBD (%)
- Taux CBG/CBC (%)
- Profil terpénique complet

#### 🧬 Génétiques (Producteur uniquement)
- Arbre généalogique parents/enfants
- Phénotype/clone (code "Pheno")
- PhenoHunt management

---

## 🪨 Type 2: Hash (Concentrés Séparation)

### Données Complètes

#### 📋 Infos Générales
- Nom commercial
- Hashmaker
- Laboratoire production
- Cultivars utilisés (liaison bibliothèque)
- Photos (1-4)

#### 🔬 Pipeline Séparation (Phase 4.1)
**Système de saisie temporelle:**
- Trame: Secondes/Minutes/Heures
- Méthode: Manuelle/Tamisage sec/Eau-glace/Autre
- Nombre passes (eau/glace)
- Température eau
- Taille mailles
- Matière première: Trim/Buds/Sugar leaves
- Qualité matière (/10)
- Rendement (%)
- Temps total

#### 🔬 Pipeline Purification
Chromatographie, Flash Chromatography, HPLC, GC, TLC, Winterisation, Décarboxylation, Fractionnement, Filtration, Centrifugation, Décantation, Séchage vide, Recristallisation, Sublimation, Extraction L-L, Adsorption charbon, Filtration membranaire

#### 👁️ Visuel & Technique (/10)
- Couleur/Transparence
- Pureté visuelle
- Densité visuelle
- Pistils
- Moisissure
- Graines

#### Autres Sections
- Odeurs (Fidélité, Intensité, Notes)
- Texture (Dureté, Densité, Friabilité, Melting)
- Goûts (Intensité, Agressivité, Puff, Inhalation, Expiration)
- Effets (Montée, Intensité, Choix, Expérience)

#### 🔥 Pipeline Curing
Comme fleur (post-extraction)

---

## 💧 Type 3: Concentrés (Rosin, BHO, etc.)

### Données Complètes

#### 📋 Infos Générales
- Nom commercial
- Hashmaker
- Laboratoire production
- Cultivars utilisés
- Photos (1-4)

#### 🔬 Pipeline Extraction (Phase 4.1)
**Méthodes supportées:**
- Éthanol (EHO)
- Alcool isopropylique (IPA)
- Acétone (AHO)
- Butane (BHO) / Isobutane (IHO) / Propane (PHO)
- Hexane (HHO)
- Huiles végétales
- CO₂ supercritique
- Pressage chaud/froid (Rosin)
- Ultrasons (UAE)
- Micro-ondes (MAE)
- Tensioactifs

**Données par étape:**
- Trame temporelle
- Paramètres selon méthode
- Données d'extraction

#### 🔬 Pipeline Purification
Même que hash

#### 👁️ Visuel & Technique (/10)
- Couleur/Transparence
- Viscosité
- Pureté visuelle
- Melting (FullMelt)
- Résidus
- Pistils
- Moisissure

#### Autres Sections
- Odeurs
- Texture
- Goûts
- Effets
- Pipeline Curing

---

## 🍬 Type 4: Comestibles

### Données Complètes

#### 📋 Infos Générales
- Nom produit
- Type comestible (Brownie, Gummi, Chocolat, etc.)
- Fabricant
- Type génétiques
- Photos (1-4)

#### 🥘 Pipeline Recette (Phase 4.1)
**Ingrédients:**
- Sélection produit (standard ou cannabinique)
- Quantité + Unité
- Étapes préparation (actions prédéfinies)

#### 😋 Goûts (/10)
- Intensité
- Agressivité
- Saveurs dominantes (max 7)

#### 💥 Effets Ressentis (/10)
- Montée
- Intensité
- Choix effets
- Durée: 5-15min / 15-30min / 30-60min / 1-2h / 2h+ / 4h+ / 8h+ / 24h+

---

## 👥 Tiers d'Abonnement

### Amateur (Gratuit)

**Accès Sections:**
- Infos Générales
- Visuel & Technique
- Pipeline Curing/Maturation
- Odeurs
- Goûts
- Effets Ressentis

**Fonctionnalités:**
- ✅ Créer max 3 reviews
- ✅ Templates prédéfinis (Compact, Détaillé, Complète)
- ✅ Export PNG/JPEG/PDF (qualité basique)
- ✅ Personnalisation limitée (thème, couleurs)
- ❌ Pas: Pipelines avancées, génétiques, templates perso

### Producteur (29.99€/mois)

**Accès Complet:**
- ✅ Tous les champs
- ✅ Pipelines Culture/Curing/Extraction/Séparation/Purification
- ✅ Système génétiques complet
- ✅ PhenoHunt avec canvas sélection
- ✅ Reviews illimités
- ✅ Templates personnalisés (drag & drop)
- ✅ Exports multi-formats:
  - PNG/JPEG/PDF 300dpi
  - SVG (vectoriel)
  - CSV (données)
  - JSON (structured)
  - HTML (web)
- ✅ Personnalisation avancée:
  - Polices personnalisées
  - Filigrane
  - Agencement complet
- ✅ Pipeline configurable pour exports

### Influenceur (15.99€/mois)

**Accès Focus:**
- ✅ Aperçus et rendus détaillés
- ✅ Système drag & drop
- ✅ Configuration avancée
- ✅ Exports haute qualité:
  - PNG/JPEG/SVG/PDF 300dpi
- ✅ Format 9:16 optimisé
- ✅ Partage réseaux sociaux facile
- ✅ Analytics basiques

---

## 🎨 Système d'Export

### Templates Prédéfinis

**Compact** (1:1 uniquement)
- Contenus: Type, Nom, Cultivars, Farm, Photo, Pipeline Curing, Totaux Visual/Odeurs/Goûts/Effets

**Détaillé** (1:1, 16:9, 9:16, A4)
- Infos générales complètes
- 5 étapes chaque pipeline
- Chaque note détaillée

**Complète**
- Infos générales complètes
- Toutes les pipelines
- Toutes les sections détaillées
- Arbre généalogique (si fleur)

**Influenceur** (9:16 uniquement)
- Focus content visuel
- Optimisé mobile

**Personnalisé** (Producteur/Influenceur)
- Drag & drop contenus
- Zones configurables

### Formats d'Export

| Format | Amateur | Producteur | Influenceur |
|--------|---------|-----------|------------|
| PNG | ✅ Basique | ✅ 300dpi | ✅ 300dpi |
| JPEG | ✅ Basique | ✅ 300dpi | ✅ 300dpi |
| PDF | ✅ Basique | ✅ 300dpi | ✅ 300dpi |
| SVG | ❌ | ✅ | ✅ |
| CSV | ❌ | ✅ | ❌ |
| JSON | ❌ | ✅ | ❌ |
| HTML | ❌ | ✅ | ❌ |

### Dimensions

- **1:1** (Square): Instagram, Twitter
- **16:9** (Landscape): Desktop, YouTube
- **9:16** (Portrait): TikTok, Instagram Stories
- **A4** (Document): Print

---

## 🔐 Authentification & Sécurité

### Méthodes d'Auth
- ✅ Email/Password (traditionnel)
- ✅ OAuth2 Discord
- ✅ Vérification âge obligatoire
- ✅ KYC optionnel (producteurs)

### Sécurité
- ✅ Sessions httpOnly
- ✅ HTTPS obligatoire prod
- ✅ Rate limiting
- ✅ Password hashing (bcrypt)
- ✅ CSRF protection

---

## 📚 Galerie Publique

### Fonctionnalités
- ✅ Reviews publiques visibles
- ✅ Système de likes/partages
- ✅ Commentaires modérés
- ✅ Classements (top hebdo/mensuel/annuel)
- ✅ Recherche avancée (filtres multiples)
- ✅ Système de modération (signalement)

### Confidentialité
- Reviews privées: Pas visibles galerie
- Reviews publiques: Visibles mais modérables

---

## 📊 Statistiques Utilisateur

### Pour Tous
- Nombre reviews créées
- Nombre exports
- Types produits favoris
- Notes moyennes données
- Notes moyennes reçues

### Producteur (Avancé)
- Statistiques cultures
- Rendements par culture
- Comparaison variétés
- Taux de succès
- Engagements reviews

### Influenceur
- Likes reçus
- Commentaires
- Partages
- Audience reach

---

## 🔄 Système de Pipeline

### Concept Clé

**Trame Temporelle**: Chaque cell représente une période
```
Jours:    365 cells (un par jour)
Semaines: 52 cells (une par semaine)
Phases:   12 cells (phases prédéfinies)
Mois:     12 cells (un par mois)
```

**Chaque Cell Contient:**
- Notes (500 chars max)
- Images
- Données chiffrées
- Champs custom

### Types de Pipelines
1. **Culture** - Germination → Floraison → Récolte
2. **Curing** - Post-récolte maturation
3. **Extraction** - Processus d'extraction
4. **Séparation** - Tamisage/ice-water
5. **Purification** - Nettoyage/raffinage
6. **Recette** - Préparation comestibles

---

## 🧬 Système de Génétiques (Producteur)

### Bibliothèque Cultivars
- ✅ Créer cultivars personnels
- ✅ Lier à reviews
- ✅ Arbre généalogique (parents/enfants)
- ✅ Phénotypes/clones
- ✅ PhenoHunt projects

### Canvas Généalogie
- Drag & drop cultivars
- Visualisation graphique
- Relations parents/enfants
- Modifier directement canvas

---

## 🎯 Prochaines Phases

### Phase 2 (Planifiée)
- ✅ Système génétiques complet
- ✅ PhenoHunt finalisé
- ✅ Canvas généalogie avancé

### Phase 3 (Futur)
- ⏳ Système de paiement Stripe
- ⏳ Email notifications
- ⏳ Mobile app native
- ⏳ Intégration réseaux sociaux

---

**Dernière mise à jour**: 13 Jan 2026  
**Status**: MVP Beta Ready ✅
