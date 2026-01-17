# 📋 CAHIER DES CHARGES V1 MVP - SYSTÈME FLEURS

**Version**: 1.0  
**Date**: 16 janvier 2026  
**Scope**: Type Fleurs uniquement  
**Objectif**: Définir clairement la V1 MVP avant les 3 autres types

---

## 🎯 VISION GÉNÉRALE

**Qu'est-ce qu'on construit?**

Un système complet pour les utilisateurs qui veulent **documenter, tracer et exporter leurs revues de fleur (cannabis)**. 

La V1 MVP permet à un utilisateur de:

1. **Créer une revue Fleur** - Remplir 10 sections (infos → effets)
2. **Gérer son arbre généalogique** (PhenoHunt) - Tracer parents/enfants de cultivars
3. **Tracker la culture** - Documenter via pipeline jour/semaine/phase...
4. **Exporter sa revue** - PNG/PDF/JSON structuré
5. **Partager en galerie publique** - Si on veut
6. **Stocker sa bibliothèque** - Toutes ses revues + presets

**Permissions par type de compte**:
- Amateur: Basic (7 sections, pas pipeline détaillé)
- Producteur: Pro (10 sections, pipeline complet, PhenoHunt)
- Influenceur: Social (10 sections, optimisé réseaux sociaux)

---

## 📊 ARCHITECTURE GÉNÉRALE

```
UTILISATEUR
    ↓
┌─ INTERFACE CRÉATION
│  ├─ Section 1: Infos Générales
│  ├─ Section 2: Génétiques + PhenoHunt
│  ├─ Section 3: Pipeline Culture (données de cultivation)
│  ├─ Section 4: Données Analytiques (THC/CBD)
│  ├─ Section 5-10: Évaluations (Visuel, Odeurs, Goûts, etc.)
│  └─ Section 9: Pipeline Curing (maturation post-récolte)
│
├─ BIBLIOTHÈQUE UTILISATEUR
│  ├─ Mes Reviews (sauvegardées)
│  ├─ Mes Presets (groupes réutilisables)
│  ├─ Mes Cultivars (généalogie)
│  └─ Préférences globales
│
├─ EXPORT & RENDU
│  ├─ PNG/PDF/JSON
│  └─ Templates (Compact, Détaillé, Complète, etc.)
│
├─ GALERIE PUBLIQUE
│  ├─ Affichage reviews publiques
│  ├─ Recherche & filtres
│  └─ Likes, commentaires
│
└─ STOCKAGE PERSISTENT
   ├─ Base de données (Prisma)
   ├─ Fichiers images
   └─ Fichiers exports
```

---

## 🏗️ STRUCTURE DÉTAILLÉE

### SECTION 1: INFORMATIONS GÉNÉRALES

**Description**: Métadonnées de base de la revue

**Champs**:
- **Nom commercial*** (texte requis) - Nom du produit
- **Cultivar(s)** (multi-select) - Variétés utilisées
- **Farm/Producteur** (texte) - Qui a produit
- **Photos** (1-4 images requis) - Macro, full plant, séchage, etc.
- **Type de variété** (select) - Indica / Sativa / Hybride

**Permissions**:
- Amateur: ✅ Accès complet
- Producteur: ✅ Accès complet
- Influenceur: ✅ Accès complet

**Stockage**: Base de données + fichiers images

---

### SECTION 2: GÉNÉTIQUES & PHENOHUNT

**Description**: Information génétique + arbre généalogique (optional pour Producteur)

#### Partie A: Génétiques (pour tous)

**Champs**:
- **Breeder** (texte) - Créateur de la graine
- **Variété** (auto-complete) - Nom de la variété
- **Type génétique** (select) - Indica / Sativa / Hybride
- **% Indica** (slider 0-100)
- **% Sativa** (slider 0-100)
- **Généalogie texte** (texte) - Notes sur les parents

**Permissions**:
- Amateur: ✅ Basique
- Producteur: ✅ Complet
- Influenceur: ✅ Complet

#### Partie B: PhenoHunt - Arbre Généalogique (Producteur seulement)

**Description**: Tracer les relations parents/enfants entre cultivars

**Fonctionnalités**:
- **Créer un arbre** - Visuel interactif (graphe)
- **Ajouter cultivars** - Drag-drop depuis bibliothèque
- **Créer relations** - Parent1 → Offspring
- **Nommer phénotypes** - Pheno #1, #2, etc.
- **Sauvegarder** - Persisté en base
- **Partager** - Code unique ou export JSON

Front-end : 
Volet latéral gauche avec hierarchie des projets structuré avec arborescence, cultivars, phénotypes, projets, arbre génélogique etc...
Et à droite des canva sous forme de fenètre onglé comme des pages vscode ou navigateur internet, mais des page canva dans le style de obsidian avec les carte mental. 
Fonction : Permet de drag and drop des cultivars, projet, arbre directement de gauche à droite pour regarder et modifier ses arbres.


**Données persistées**:
```
- ID unique arbre
- Nœuds (cultivars)
- Arêtes (relations)
- Métadonnées (créé par, date, notes)
```

**Permissions**:
- Amateur: ❌ Pas d'accès
- Producteur: ✅ Accès complet
- Influenceur: ⚠️ Lecture seule

---

### SECTION 3: PIPELINE CULTURE (Système Pipeline plutôt propre, donnée et méthodes/listes de définission à revoir)

**Description**: Suivi de la culture en 3D (plan + temps + événements)

**Configuration initiale**:
- **Mode timeline** (select): Jours / Semaines / Phases
- **Dates culture** (date pickers): Début et fin
- **Durée totale** (calculé automatiquement)

**Trois modes de visualisation**:

#### Mode 1: JOURS
- Auto-génération depuis dates
- Grille de 365 carrés > pagination si plus
- 1 carré = 1 jour
- Click → modale édition données jour
- Chaque jour contient: donnée ajoutée par l'utilisateur
- Après la dernière celulle, une cellule avec un "+" permet d'ajouter une cellules.

#### Mode 2: SEMAINES
- Grille S1 à S52 > pagination si plus
- 1 carré = 1 semaine
- Click → modale édition données semaine
- Auto-génération depuis dates
- Après la dernière celulle, une cellule avec un "+" permet d'ajouter une cellules.

#### Mode 3: PHASES
- 12 phases prédéfinies:
  1. Graine
  2. Germination
  3. Plantule
  4. Croissance-début
  5. Croissance-milieu
  6. Croissance-fin
  7. Stretch-début
  8. Stretch-milieu
  9. Stretch-fin
  10. Floraison-début
  11. Floraison-milieu
  12. Floraison-fin
- 1 carré = 1 phase
- Click → modale édition données phase (ajout de donnée directement, OU possibilité de crée des groupe pré-configuré nommé et rangé par thèmes/lieu etc... définit par le producteur dans bibliothèque ou directement lors de l'ajout à la pipeline d'une donnée)

Après avoir choisi la trame et mis une donnée dans une cellule il ne doit pas être possible de modifier la trame, cela detruirait des informations, le seul moyen est de se servir de la case "+" en bous de chaine des cellule pour ajouter une cellule.


**Les 9 Groupes de Données** (réutilisables comme presets):

```
GROUPE 1: ESPACE DE CULTURE
├─ Mode (Indoor/Outdoor/Greenhouse/No-till)
├─ Type espace (Tente/Cabinet/Room/Serre/Ext)
├─ Dimensions L×l×H (cm ou m)
├─ Surface calculée (m²)
└─ Densité plantes (plants/m²)

GROUPE 2: SUBSTRAT
├─ Type (Solide/Hydro/Aéro)
├─ Volume total (L)
├─ Composition % (Terre, Coco, Perlite, Laine roche, etc.)
├─ Marques par component
└─ pH & EC (optionnel)

GROUPE 3: IRRIGATION
├─ Système (Goutte-à-goutte, Inondation, Manuel, NFT)
├─ Source eau (Robinet, Pluie, Osmosée)
├─ Schedule (par jour/semaine)
├─ Volume par arrosage (L)
└─ Suppléments eau (additifs)

GROUPE 4: ENGRAIS & NUTRITION
├─ Type (Bio/Chimique/Mixte)
├─ Marques & gammes
├─ Produits utilisés (Veg, Bloom, etc.)
├─ Dosages (g/L ou ml/L)
└─ Schedule d'application

GROUPE 5: LUMIÈRE
├─ Type lampe (LED/HPS/CFL/Naturelle/Mixte)
├─ Spectre (Complet, Bleu, Rouge, etc.)
├─ Puissance (W)
├─ Distance plante-lampe (cm)
├─ Durée éclairage par jour (h)
├─ PPFD (µmol/m²/s) optionnel
└─ Kelvin (température couleur) optionnel

GROUPE 6: CLIMAT
├─ Température moyenne (°C)
├─ Humidité relative (%)
├─ CO2 (ppm) optionnel
├─ Ventilation (type, fréquence)
└─ Cibles par phase (veg/floraison)

GROUPE 7: PALISSAGE & TECHNIQUES
├─ Techniques (SCROG, SOG, Main-Lining, LST, etc.)
├─ Semaine début
├─ Notes & photos avant/après

GROUPE 8: MORPHOLOGIE PLANTE
├─ Hauteur mesure (cm/m)
├─ Volume (l/m³)
├─ Poids (g, estimé)
├─ Branches principales (nb)
├─ État santé (échelle 1-10)

GROUPE 9: RÉCOLTE & FINITION
├─ Date récolte/cut (cut entier, juste certaines bud)
    - le cut peux définir la fin de la pipeline si l'utilisateur le souhaite.(evite que la pipeline auto-evolutive en mode dates continue à jamais d'augmanter.)
├─ Couleur trichomes (Translucide/Laiteux/Ambré/Marron/ : slider coloré stylysé pour choisir la couleur)
├─ Poids brut (g)
├─ Poids net séché (g)
├─ Rendement (g/m²)
└─ Methode de sechage
```

**Chaque jour/semaine/phase peut avoir**:
- Observation/note (500 chars max)
- Photos (1/jours)
- Données des 9 groupes (ajoutable/éditable/supprimable)
- Timestamp automatique

**Sauvegarde as Preset**:
Après remplir un groupe, pop-up modale : "Enregistrer ce setup comme preset?"
- Réutiliser dans autres reviews
- Nommer personnalisé / ranger dans dossier pour classer données dans bibliothèque


**Permissions**:
- Amateur: ❌ Pas d'accès
- Producteur: ✅ Accès complet 9 groupes + 3 modes
- Influenceur: ❌ Pas d'accès 

---

### SECTION 4: DONNÉES ANALYTIQUES

**Description**: Résultats de labo (THC/CBD/Terpènes)

**Champs**:
- **THC %** (nombre) - Pourcentage THC
- **CBD %** (nombre) - Pourcentage CBD
- **Autres cannabinoïdes** (JSON) - CBG, CBC, etc.
- **Profil terpénique** (texte ou upload PDF) - Depuis certificat labo
- **Lien certificat** (URL) - Scan du rapport

**Permissions**:
- Amateur: ✅ Accès
- Producteur: ✅ Accès
- Influenceur: ✅ Accès

---

### SECTIONS 5-10: ÉVALUATIONS SENSORIQUES

#### SECTION 5: VISUEL & TECHNIQUE (Observations physiques)

**Champs** (tous en sliders 0-10):
- Couleur (avec palette de couleurs visuelles)
- Densité visuelle
- Trichomes
- Pistils
- Manucure
- Moisissure (10=aucune)
- Graines (10=aucune)

**Permissions**: ✅ Tous

---

#### SECTION 6: ODEURS

**Champs**:
- Notes dominantes (multi-select: max 7 parmi 14 options)
  → Fruité, Terreux, Épicé, Floral, Menthe, Herbe, Sucré, etc.
- Notes secondaires (max 7)
- Arômes inhalation (primaire/secondaire)
- Saveur en bouche / Rétro-olfaction
- Intensité arôme (slider 0-10)

**Permissions**: ✅ Tous

---

#### SECTION 7: TEXTURE

**Champs** (sliders 0-10):
- Dureté
- Densité tactile
- Élasticité
- Collant

**Permissions**: ✅ Tous

---

#### SECTION 8: GOÛTS

**Champs**:
- Intensité goût (slider 0-10)
- Agressivité/piquant (slider 0-10)
- Dry puff (multi-select: max 7)
- Notes inhalation (multi-select: max 7)
- Expiration/arrière-goût (multi-select: max 7)

**Permissions**: ✅ Tous

---

#### SECTION 9: EFFETS RESSENTIS & EXPÉRIENCE

**Données expérience consommation**:
- Méthode (Combustion/Vapeur/Infusion)
- Dosage estimé (g/mg)
- Durée effets (HH:MM -> slider 1m->72h log) (Ajout de 3 point, début effets marqué, Pic, Descente rescenti)
- Intensité générale

**Profils effets** (multi-select: max 8 catégorisés):
- Mentaux: Euphorie, Créativité, Focus, Énergie, Relaxation, Anxiété
- Physiques: Douleur, Spasme, Sommeil
- Thérapeutiques: Anxiolytique, Anti-douleur, Relaxant

**Effets secondaires**: Multi-select (Yeux secs, Bouche sèche, Faim, Paranoïa, etc.)

**Usage préféré**: Multi-select (Soir/Journée/Seul/Social/Médical)

**Permissions**: ✅ Tous

---

### SECTION 10: PIPELINE CURING (Post-récolte)

**Description**: Suivi maturation/curing après récolte

**Identique à SECTION 3** mais pour curing:
- Mode timeline (Jours/Semaines/Mois)
- Durée curing
- Température & humidité
- Type récipient
- Emballage primaire

**À chaque étape**:
- Possibilité de modifier les données de maturation/curing.
- Possibilité modifier scores SECTION 5 (Visuel - peut changer en curing)
- Possibilité modifier scores SECTION 6 (Odeurs - développement arômes)
- Possibilité modifier scores SECTION 8 (Goûts - évolution flaveur)
- Possibilité modifier scores SECTION 9 (Effets - potentiation)

**Permissions**:
- Amateur: ❌ Pas d'accès
- Producteur: ✅ Accès complet
- Influenceur: ✅ Accès complet

---

## 📚 BIBLIOTHÈQUE UTILISATEUR (Refonte)

**Description**: Espace personnel pour stocker, organiser et réutiliser données, uniquement si utilisateur à accès à la donnée évidemment.

### Structure:

```
MA BIBLIOTHÈQUE
│
├─ 📁 FICHES TECHNIQUES FLEURS
│  ├─ [Review 1: GSC Indoor 2024]
│  │  ├─ Sections 1-10 complètes
│  │  ├─ Status (Brouillon/Complète/Archivée)
│  │  ├─ Créée: 2024-01-01
│  │  ├─ Modifiée: 2024-01-15
│  │  ├─ Visibilité (Privée/Publique/Lien)
│  │  └─ Export généré (PNG, PDF, JSON)
│  │
│  └─ [Review 2: OG Kush Outdoor]
│
├─ 📁 GROUPES RÉUTILISABLES
│  │
│  ├─ Setups Environnement
│  │  ├─ "Indoor LED 3×3m Tent"
│  │  ├─ "Outdoor Spring 20m²"
│  │  └─ "Greenhouse Tempéré"
│  │
│  ├─ Setups Substrat
│  │  ├─ "Bio Composé Standard"
│  │  ├─ "Hydro NFT System"
│  │  └─ "Coco 70% + Perlite"
│  │
│  ├─ Setups Irrigation
│  ├─ Setups Nutrition
│  ├─ Setups Lumière
│  ├─ Setups Climat
│  └─ Setups Techniques
│
├─ 🧬 CULTIVARS
│  ├─ "GSC (Girl Scout Cookies)"
│  │  ├─ Utilisé dans: 5 reviews
│  │  ├─ Stats: THC 19-22%, Rendement moyen 450g/m²
│  │  └─ Notes: Excellente saveur
│  │
│  └─ "OG Kush"
│
├─ 🌳 ARBRES GÉNÉALOGIQUES (PhenoHunt)
│  ├─ "Projet 2024 Breeding"
│  │  ├─ Nœuds: 10 cultivars
│  │  ├─ Relations: 5 croisements
│  │  ├─ Créé: 2024-01-01
│  │  └─ Status: En cours
│  │
│  └─ "Hunt GSC 2023"
│
├─ 🎨 TEMPLATES EXPORT
│  ├─ "Compact 1:1"
│  ├─ "Détaillé 16:9"
│  ├─ "Complète A4"
│  └─ "Perso Influenceur"
│
└─ ⚙️ PRÉFÉRENCES GLOBALES
   ├─ Unités par défaut (Métrique/Impérial)
   ├─ Marques favoris
   ├─ Format export préféré
   └─ Thème interface (Clair/Sombre)
```

### Fonctionnalités Bibliothèque:

Onglet : 
**Fiches techniques (4 types)**:
- Lister toutes reviews
- Filtrer (Type/Status/Date)
- Trier (Recent/Ancien/Favorite)
- Chercher par nom/cultivar
- Éditer
- Dupliquer (copier avec modifications)
    - Pour les producteur : dupliquer -> génération code phénotype proche -> ajout dans phenoHunt proposé avec pré-configuration depuis le phéno dupliqué
- Supprimer
- Changer visibilité (Privée ↔ Publique)
- Voir statistiques (notes moyennes, etc.)

**Groupes réutilisables (Trier dans des catégories par type de produit)**:
Pas mettre toutes les données d'une coup, ranger dans leurs types, section, groupe(pour pipeline) respectivement.
- Charger dans nouvelle review
- Éditer le preset
- Renommer
- Supprimer
- Marquer favorite
- Voir usage (utilisé dans X reviews)

**Arbres généalogiques phenohunt (Producteur)**:
Système phénohunt complet ICI ! (C'est ici qu'ils vont gêrer leurs projets phenohunt, dans la création de review fleurs section 2, il auront une sorte de version lite du phenohunt système.)

**Permissions**:
- Amateur: ✅ Fiches + Basic presets de leurs données
- Producteur: ✅ Tout complet
- Influenceur: ✅ Fiches + Presets de leurs données

---

## 🎨 EXPORT & RENDU (Orchad Maker dejà pas mal avancé, comparer et fusionner les bonnes idées dans le sys. existant Orchad maker)

**Description**: Générer et télécharger les reviews sous différents formats

### Formats supportés:

**Images**:
- PNG (standard)
- PNG haute qualité (300 DPI)
- PDF (A4)
- PDF qualité impression

**Data**:
- JSON (structure complète, importable)
- CSV (tableau plat pour Excel)
- HTML (page web printable)

### Templates disponibles:

#### Template "Compact" (Pour Amateur)
- Format: 1:1 uniquement
- Sections affichées:
  - Type produit
  - Nom commercial
  - Cultivar
  - Farm
  - Photo principale
  - Résumé scores (5-10)
  - Effets principaux
- Visibilité: Complet mais synthétique

#### Template "Détaillé" (Pour Producteur/Influenceur)
- Formats: 1:1, 16:9, 9:16, A4
- Sections affichées: Toutes sauf pipeline
- Pagination: Oui (max 9 pages)
- Visibilité: Toutes données + graphiques

#### Template "Complète" (Pour Producteur)
- Formats: A4 seulement
- Sections: Toutes (y compris pipelines)
- Pagination: Multi-page
- Inclut: Arbre généalogique (si PhenoHunt)
- Visibilité: Rapport technique complet

#### Template "Influenceur" (Pour Influenceur)
- Format: 9:16 uniquement (Stories Instagram)
- Sections: Visuel, Odeurs, Goûts, Effets
- Design: Optimisé réseaux sociaux
- Visibilité: Marketing/Social

#### Template "Personnalisé" (Producteur only)
- Format: Choix utilisateur (1:1, 9:16)
- Sections: Drag-drop config
- Design: Couleurs + polices custom
- Visibilité: Création libre

### Processus Export:

```
1. User clique "Apercu" : Personnalisation -> "Exporter" Configuration d'export
2. Popup sélecteur:
   ├─ Format (PNG/PDF/JSON/CSV/HTML)
   ├─ Template (Compact/Détaillé/etc.)
   ├─ Options qualité/compression
   └─ Prévisualisation live
3. Click "Télécharger"
4. Fichier généré + sauvegardé en bibliothèque
```

**Permissions**:
- Amateur: ✅ Compact + Détaillé (PNG/PDF)
- Producteur: ✅ Tous templates + tous formats
- Influenceur: ✅ Influenceur + Détaillé (PNG/PDF)

---

## 🌐 GALERIE PUBLIQUE

**Description**: Espace de partage communautaire

### Fonctionnalités:

**Affichage**:
- Afficher reviews publiques uniquement
- Filtre par: Toutes données possibles dans les 4 types.
- Recherche texte libre
- Trier: Récent/Populaire(nombre de vu)/etc...

**Interactions utilisateur**:
- Like (cœur)
- Partager (Facebook, Twitter, Reddit) -> Liens de redirection avec message auto copié.
- Ajouter à favoris perso -> bibliothèque.

**Modération**:
- Signaler contenu inapproprié -> alerte admin panel ( à créer. )
- Admin review reports -> admin panel

### Permissions affichage:

**Amateur** peut:
- ✅ Voir toutes les reviews publiques

**Producteur** peut:
- ✅ Voir toutes les reviews publiques

**Influenceur** peut:
- ✅ Voir toutes les reviews publiques

---

## 🔐 SYSTÈME PERMISSIONS & COMPTES

### Trois types de comptes:

#### 1. AMATEUR (Gratuit)
**Accès sections**:
- ✅ Section 1: Infos Générales
- ❌ Section 2: Génétiques
- ❌ Section 3: Pipeline Culture
- ✅ Section 4: Analytiques
- ✅ Section 5 : Visuel
- ✅ Section 6 : Touché
- ✅ Section 7 : Odeur
- ✅ Section 8 : Gouts 
- ✅ Section 9 : Effet
- ❌ Section 10: Pipeline Curing

**Export**:
- PNG/PDF standard (low quality)
- Template Compact seulement

**Bibliothèque**:
- Jusqu'à 10 reviews dans sa bibliothèque
- Presets basiques

**Galerie**:
- Peut partager reviews

---

#### 2. PRODUCTEUR (29.99€/mois)
**Accès sections**:
- ✅ Section 1: Infos Générales
- ✅ Section 2: Génétiques
- ✅ Section 3: Pipeline Culture
- ✅ Section 4: Analytiques
- ✅ Section 5 : Visuel
- ✅ Section 6 : Touché
- ✅ Section 7 : Odeur
- ✅ Section 8 : Gouts 
- ✅ Section 9 : Effet
- ✅ Section 10: Pipeline Curing

**Orhcad maker & Export** :
- PNG/PDF/JSON/CSV/HTML
- Tous formats qualité
- Tous templates
- Personnalisation avancée (couleurs, polices, filigrane, emplacement, logo, pagination etc...)

**Bibliothèque**:
- Illimité reviews
- Tous presets
- Arbre généalogique sauvegarde

**Galerie**:
- Voir toutes reviews
- Badge "Producteur" sur profil
- Analytics (vues, likes, commentaires) (VU DANS UN ONGLET DE LA BIBLIOTHEQUE)

**Features avancées**:
- Export batch (plusieurs reviews)
- Intégration API (futur)

---

#### 3. INFLUENCEUR (15.99€/mois)
**Accès sections**:
- ✅ Section 1: Infos Générales
- ⚠️ Section 2: Génétiques sans accès à PhenoHunt
- ❌ Section 3: Pipeline Culture 
- ✅ Section 4: Analytiques
- ✅ Section 5 : Visuel
- ✅ Section 6 : Touché
- ✅ Section 7 : Odeur
- ✅ Section 8 : Gouts 
- ✅ Section 9 : Effet
- ✅ Section 10: Pipeline Curing

**Export**:
- PNG/PDF
- Template Influenceur (9:16 optimisé social)
- Qualité HD (300 DPI)

**Bibliothèque**:
- Jusqu'à 50 reviews
- Presets essentiels

**Galerie**:
- Voir toutes reviews
- Badge "Influenceur" sur profil
- Analytics (vues, engagement)
- Share buttons réseaux

**Features sociales**:
- Format 9:16 Stories
- Watermark custom
- Hashtag suggestions
- Cross-posting schedule (futur)

---

## 📊 STOCKAGE & PERSISTANCE - Revoir avec mes modifs ci dessus du coup

### Base de données:

**Tables principales**:

```
User
├─ id (UUID)
├─ username, email
├─ accountType (Amateur/Producteur/Influenceur)
├─ subscription (actif/expiré)
└─ preferences (JSON)

FlowerReview
├─ id (UUID)
├─ userId (FK)
├─ Sections 1-10 (data JSON ou colonnes)
├─ status (Brouillon/Complète/Archivée)
├─ visibility (Privée/Publique/Lien)
├─ createdAt, updatedAt
└─ publicUrl (slug unique si publique)

PipelineStep (Culture + Curing)
├─ id, reviewId
├─ mode (Jours/Semaines/Phases)
├─ date/week/phase
├─ données 9 groupes (JSON)
└─ photos (array URLs)

GeneticTree (PhenoHunt)
├─ id, userId
├─ name, description
├─ nodes (JSON: cultivars + metadata)
├─ edges (JSON: relations)
├─ isPublic (pour partage)
└─ publicCode (partage code)

UserPreset
├─ id, userId
├─ group (Espace/Substrat/Irrigation/etc.)
├─ name, data (JSON)
├─ usageCount, lastUsed
└─ rating, notes

Export
├─ id, reviewId
├─ format (PNG/PDF/JSON)
├─ template, generatedAt
└─ fileUrl

GalleryView (Interactions)
├─ id, reviewId, userId
├─ liked (boolean)
├─ comment (texte)
└─ timestamp
```

### Stockage fichiers:

```
/db/
├─ /review_images/      → Photos reviews (jpg, png, webp)
├─ /exports/            → Fichiers générés (PNG, PDF, JSON, CSV, HTML)
├─ /kyc_documents/      → Docs KYC producteur/influenceur
└─ /backups/            → Backups réguliers
```

---

## 🔄 WORKFLOWS PRINCIPAUX

### Workflow 1: Créer une revue (tout utilisateur)

```
1. User accède /review/create?type=fleur
2. Choisit source:
   ├─ Nouvelle (formulaire vide)
   ├─ Depuis preset (charger groupe par groupe)
   └─ Dupliquer existante (copier + modifier)
3. Remplit sections 1 à 10
   ├─ Chaque section: Save & Continue
   ├─ Progress bar visible
   └─ Validation live
4. Enregistre review
   ├─ Status: Brouillon
   ├─ Stocké en base
   └─ Peut être modifiée
5. Option export (si complet)
```

### Workflow 2: Gérer PhenoHunt (Producteur)

```
1. Section 2 → "PhenoHunt"
2. Crée arbre vide ou depuis existant
3. Drag-drop cultivars depuis bibliothèque
4. Relie parents → enfants (draw line)
5. Nomme phénotypes (Pheno #1, etc.)
6. Clique "Sauvegarder arbre"
7. Arbre stocké en base
8. Peut l'exporter JSON ou partager via code
```

### Workflow 3: Tracker pipeline (Producteur)

```
1. Section 3 → Choisit mode (Jours/Semaines/Phases)
2. Définit dates culture
3. Grille auto-générée (365j, S1-S52, ou 12 phases)
4. Click jour/semaine/phase → modale édition
5. Remplit données (9 groupes)
6. Chaque groupe: "Enregistrer comme preset?" option
7. Save + continue à jour suivant
8. À la fin: Sauvegarde complète
```

### Workflow 4: Exporter (tout utilisateur selon permission)

```
1. Review complète → Click "Apercu" : Personnalisation -> "Exporter" Configuration d'export
2. Modal: Sélection
   ├─ Format (PNG/PDF/JSON selon compte)
   ├─ Template (selon compte)
   ├─ Options qualité
   └─ Prévisualisation
3. Click "Générer"
4. Fichier créé, téléchargé
5. Stocké en bibliothèque (historique exports)
```

### Workflow 5: Partager en galerie (tout utilisateur)

```
1. Review terminée & "Complète"
2. Toggle "Partager en galerie"
3. System génère URL publique unique
4. User peut partager lien
5. Autres users voient en galerie
6. Peuvent liker, commenter
7. User voit notifications interactions
```

---

## ✅ DÉFINITION "V1 MVP COMPLÈTE"

La V1 MVP est considérée **COMPLÈTE** quand:

**Création de review**:
- [x] Toutes 10 sections fonctionnelles
- [x] Formulaires validés
- [x] Données persistées en base

**PhenoHunt**:
- [x] Arbre généalogique créable (Producteur)
- [x] Persistance en base
- [x] Export/import JSON

**Données Culture**:
- [x] 3 modes visualisation (Jours/Semaines/Phases)
- [x] 9 groupes données remplissables
- [x] Persistance chaque étape
- [x] Option "Enregistrer comme preset"

**Pipeline Système**:
- [x] Unifier: Identique pour tous, juste donnée et config qui change

**Aperçus , rendu , Export**:
- [x] PNG/PDF basique (Amateur)
- [x] JSON/CSV/HTML (Producteur)
- [x] 4 templates minimum (Compact, Détaillé, Complète, Influenceur)

**Bibliothèque**:
- [x] Lister reviews
- [x] Charger presets
- [x] Gérer cultivars
- [x] PhenoHunt Arbres généalogiques

**Galerie Publique**:
- [x] Afficher reviews publiques
- [x] Likes/commentaires
- [x] Filtres & recherche
- [x] Modération basique

**Permissions**:
- [x] Amateur: Sections 1-8, export basique
- [x] Producteur: Toutes sections, tous exports
- [x] Influenceur: Sections 1-8, export social

---

**Document**: Cahier des Charges V1 MVP Fleurs  
**Date**: 16 janvier 2026  
**Statut**: ✅ COMPLET et PRÊT IMPLÉMENTATION
