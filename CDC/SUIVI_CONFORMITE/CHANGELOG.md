# CHANGELOG - Conformité CDC Reviews-Maker

## 🚀 [19/12/2025 - 00h15] - Fichiers de Données Créés ✅

### 📦 Nouveaux Fichiers

#### 1. **aromasWheel.js** (✅ CRÉÉ)
- **Lignes** : ~370 lignes
- **Contenu** : Roue aromatique CATA complète
  - 8 catégories principales avec emojis et couleurs
  - 120+ arômes avec sous-catégories
  - Fonctions utilitaires (getAromasByCategory, getSubcategories, etc.)
  
**Catégories** :
- 🍊 Fruité (40+ arômes : agrumes, baies, tropical, fruits à noyau, melons, fruits secs)
- 🌸 Floral (11 arômes : rose, lavande, jasmin, etc.)
- 🌲 Terreux/Boisé (14 arômes : terre, mousse, pin, cèdre, etc.)
- 🌶️ Piquant/Épicé (15 arômes : poivre, cannelle, herbes sèches)
- 🦨 Skunky/Animalic (7 arômes : mouffette, musc, fromage)
- ⛽ Chimique/Gaz (11 arômes : diesel, solvant, plastique)
- 🍯 Sucré/Gourmand (14 arômes : bonbon, caramel, pâtisserie)
- 🌿 Végétal/Herbacé (11 arômes : herbe coupée, foin, thé vert)

#### 2. **cannabinoids.js** (✅ CRÉÉ)
- **Lignes** : ~260 lignes
- **Contenu** : Liste exhaustive des cannabinoïdes
  - 17 cannabinoïdes (majeurs, mineurs, acides, rares, synthétiques)
  - Propriétés complètes : effets, usages médicaux, psychoactivité
  - Fonctions de calcul et validation
  
**Cannabinoïdes inclus** :
- **Majeurs** : THC, CBD
- **Acides** : THCA, CBDA, CBGA, THCVA
- **Mineurs** : CBG, CBC, CBN, CBDV, THCV
- **Rares** : Δ8-THC, Δ10-THC, CBL, CBT
- **Synthétiques** : THC-O-Acétate (avec warning)

**Fonctions utilitaires** :
- `getCannabinoidsByCategory()`
- `calculateTotalCannabinoids()`
- `validateCannabinoidValues()` (vérification total ≤100%)

#### 3. **terpenes.js** (✅ CRÉÉ)
- **Lignes** : ~420 lignes
- **Contenu** : 20 terpènes avec données complètes
  - Arômes associés
  - Effets et usages médicaux
  - Points d'ébullition
  - Présence dans autres plantes
  
**Terpènes majeurs** :
- Myrcène, Limonène, β-Caryophyllène, Linalol
- α-Pinène, β-Pinène, Terpinolène, Humulène
- Ocimène, Bisabolol, Nérolidol, Guaïol
- Valencène, Géraniol, Eucalyptol, Camphène
- Bornéol, Pulégone (⚠️), Sabinène, Phytol

**Fonctions utilitaires** :
- `searchTerpenesByAroma()`
- `searchTerpenesByEffect()`
- `calculateAromaProfile()` (top 5 arômes depuis terpènes)
- `calculateEffectProfile()` (top 5 effets depuis terpènes)

---

## 🚀 [19/12/2025] - Configuration Formulaires Fleurs selon Dev_cultures.md

### 📋 Contexte
Création des configurations de formulaires pour les reviews de fleurs en conformité stricte avec [Dev_cultures.md](../PLAN/Dev_cultures.md).

**Principe fondamental** : AUCUNE SAISIE TEXTUELLE LIBRE (sauf nom commercial et commentaires techniques).
Tout doit être en boutons, sliders, selects, multi-selects, segmented controls, steppers, roues de sélection, etc.

---

### ✅ Configurations Déjà Complétées

#### 1. **Pipeline Culture** (`pipelineConfigs.js` - `CULTURE_PIPELINE_CONFIG`)
- ✅ 85+ champs configurés selon CDC
- ✅ Utilisation de `CULTURE_FORM_DATA` (800+ lignes de données)
- ✅ Sections : GÉNÉRAL, SUBSTRAT, IRRIGATION, ENGRAIS, LUMIÈRE, ENVIRONNEMENT, PALISSAGE, MORPHOLOGIE, RÉCOLTE
- ✅ Tous les champs numériques = LIBRES (pas de validation stricte)
- ✅ Unités sélectionnables (cm/m, g/kg, L/mL, etc.)
- ✅ Formules auto-calculées (W/m², g/W, taux de perte)
- ✅ Helpers UX pour suggestions (température, humidité, catégories)

#### 2. **Pipeline Curing** (`pipelineConfigs.js` - `CURING_PIPELINE_CONFIG`)
- ✅ Trame configurable : secondes, minutes, heures, jours, semaines, mois
- ✅ Sections : TEMPÉRATURE, HUMIDITÉ, CONTENANT, EMBALLAGE
- ✅ Type de curing (froid/ambiant/chaud)
- ✅ Humidité relative + Boveda
- ✅ Type de récipient (8 options)
- ✅ Opacité (5 options)
- ✅ Emballage primaire (9 options multi-select)

---

### 📝 Configurations À Créer

#### 3. **Sections Non-Pipeline** (nouveau fichier `flowerReviewConfig.js`)

##### 3.1 Informations Générales
**Fichier source** : Dev_cultures.md section 1.1
- [x] Nom commercial* (SEUL champ texte obligatoire)
- [x] Cultivar(s) (multi-select + bibliothèque personnelle)
- [x] Farm/Producteur (select + auto-complete)
- [x] Type génétique (segmented control : Indica / Sativa / Hybride)
- [x] Photos 1-4* (dropzone + grille 2×2 drag & drop)

##### 3.2 Génétiques & PhenoHunt
**Fichier source** : Dev_cultures.md section 1.2
- [x] Breeder (select + modal "nouveau breeder")
- [x] Variété (auto-complete bibliothèque)
- [x] Type génétique (boutons Indica/Sativa/Hybride)
- [x] Pourcentages génétique (wheel ou sliders verrouillés total=100%)
- [x] Généalogie (canva graphique drag & drop - système avancé)
- [x] Code phénotype (format auto-incrémenté + custom)

##### 3.3 Données Analytiques (Cannabinoïdes & Terpènes)
**Fichier source** : Dev_cultures.md section 7
- [x] THC % (slider 0-40%)
- [x] CBD % (slider 0-20%)
- [x] Cannabinoïdes additionnels (liste dynamique + slider % ou mg/g)
  - CBG, CBC, CBN, THCV, THCA, CBDA, CBGA, Delta-8, Delta-10
- [x] Somme calculée automatiquement avec vérification cohérence
- [x] Terpènes (liste standard + slider % ou mg/g)
  - Myrcène, Limonène, Caryophyllène, Linalol, Pinène α/β, Terpinolène, Humulène, Ocimène, Bisabolol, Nerolidol, Guaïol, Valencène, Geraniol
- [x] Affichage roue aromatique terpénique
- [x] Upload PDF certificat d'analyse (optionnel)

##### 3.4 Visuel & Technique
**Fichier source** : Dev_cultures.md section 8
- [x] Couleur (slider 0-10 + roue de couleur nuancier cannabis)
  - Vert clair, vert foncé, lime, jaune, orange, violet, noir, marron, bleuté
- [x] Densité visuelle (slider 0-10 : fluffy → ultra dense)
- [x] Trichomes (slider 0-10 : peu visibles → tapis complet)
- [x] Pistils (slider 0-10 : absents → très nombreux)
- [x] Manucure (slider 0-10 : feuilles larges → full trim)
- [x] Moisissure (slider 0-10 : 0=très présente, 10=aucune)
- [x] Graines (slider 0-10 : 0=très grainé, 10=aucune)
- [x] Corps étrangers (multi-select)
  - Cheveux, Fibre textile, Poussière visible, Insectes morts, Aucun
- [x] Propreté globale (slider 0-10)

##### 3.5 Odeurs (Roue Aromatique)
**Fichier source** : Dev_cultures.md section 9.1
- [x] Notes dominantes (max 7, roue aromatique CATA)
  - Catégories : Fruité, Floral, Boisé, Épicé, Terreux, Chimique, Herbacé
  - Sous-catégories riches (ex: Fruité → Agrumes, Baies, Tropical, etc.)
- [x] Notes secondaires (max 7, même roue)
- [x] Intensité globale (slider 0-10)
- [x] Complexité aromatique (slider 0-10 : simple → très complexe)

##### 3.6 Goûts / Bouche
**Fichier source** : Dev_cultures.md section 9.2
- [x] Dry puff / tirage à sec (multi-select max 7 depuis roue aromatique)
- [x] Inhalation (multi-select max 7)
- [x] Expiration / rétro-olfaction (multi-select max 7)
- [x] Intensité du goût (slider 0-10)
- [x] Agressivité / gratte gorge (slider 0-10)
- [x] Douceur / rondeur en bouche (slider 0-10)

##### 3.7 Texture & Toucher
**Fichier source** : Dev_cultures.md section 10
- [x] Dureté au doigt (slider 0-10 : très mou → roche)
- [x] Densité tactile (slider 0-10)
- [x] Élasticité (slider 0-10 : friable → très spongieux)
- [x] Collant / résineux (slider 0-10 : sec → colle aux doigts)
- [x] Humidité perçue (slider 0-10 : trop sec → trop humide)
- [x] Friabilité (slider 0-10 : poudreux → ne se casse pas)

##### 3.8 Effets Ressentis
**Fichier source** : Dev_cultures.md section 11.1
- [x] Montée / rapidité (slider 0-10 : très lent → instantané)
- [x] Intensité globale (slider 0-10)
- [x] Effets (max 8, multi-select avec tags positif/neutre/négatif)
  - **Mental** : euphorisant, créatif, focus, sociable, anxiogène, dissociatif, psychédélique, introspectif, motivant, confusant
  - **Physique** : relaxant, énergisant, analgésique, anti-inflammatoire, sédatif, stimulant, lourdeur corporelle, spasmes
  - **Thérapeutique** : anti-nausée, appétit, sommeil, anxiolytique, antidépresseur, anti-stress
  - **Autres** : fou rire, munchies, yeux rouges, bouche sèche, paranoïa, vertiges, tachycardie

##### 3.9 Expérience d'Utilisation
**Fichier source** : Dev_cultures.md section 11.2
- [x] Méthode de consommation (boutons)
  - Joint, Bang, Pipe, Vaporisateur herbe sèche, Vape cart, Autre
- [x] Dosage estimé (slider 0.05–1.0 g)
- [x] Durée des effets (time-picker HH:MM ou catégories)
  - <1h / 1-2h / 2-4h / 4h+
- [x] Moment de la journée (segmented control)
  - Matin, Après-midi, Soir, Nuit
- [x] Contexte (multi-select)
  - Seul, Entre amis, Événement social, Travail créatif, Usage médical, Autre
- [x] Usage préféré (multi-select)
  - Soir, Journée, Social, Solo, Productif, Médical

##### 3.10 Effets Secondaires & Tolérance
**Fichier source** : Dev_cultures.md section 11.3
- [x] Effets secondaires (multi-select)
  - Yeux secs, Bouche sèche, Faim, Anxiété, Paranoïa, Tachycardie, Somnolence, Confusion, Aucun
- [x] Tolérance du testeur (segmented control)
  - Faible, Moyenne, Élevée, Très élevée

---

### 📂 Structure Fichiers À Créer

```
client/src/config/
├── flowerReviewConfig.js (PROCHAIN - ~800 lignes estimées)
│   ├── INFOS_GENERALES_CONFIG
│   ├── GENETIQUES_CONFIG
│   ├── ANALYTIQUES_CONFIG
│   ├── VISUAL_CONFIG
│   ├── ODEURS_CONFIG (roue aromatique)
│   ├── GOUTS_CONFIG
│   ├── TEXTURE_CONFIG
│   ├── EFFETS_CONFIG
│   ├── EXPERIENCE_CONFIG
│   └── SECONDAIRES_CONFIG

client/src/data/
├── aromasWheel.js (✅ CRÉÉ - 370 lignes)
├── cannabinoids.js (✅ CRÉÉ - 260 lignes)
└── terpenes.js (✅ CRÉÉ - 420 lignes)
```

---

### 🎯 Prochaines Actions

1. **✅ FAIT** : Créer `aromasWheel.js`
2. **✅ FAIT** : Créer `cannabinoids.js`
3. **✅ FAIT** : Créer `terpenes.js`
4. **⏳ EN COURS** : Créer `flowerReviewConfig.js` (10 configurations de sections)
5. **⏳ À FAIRE** : Mettre à jour composants React pour utiliser les nouvelles configs

---

### 📊 Statistiques

- **Fichiers complétés** : 4/5 (80%)
  - ✅ `pipelineConfigs.js` (CULTURE + CURING)
  - ✅ `cultureFormData.js` (données sources)
  - ✅ `aromasWheel.js` (roue aromatique)
  - ✅ `cannabinoids.js` (17 cannabinoïdes)
  - ✅ `terpenes.js` (20 terpènes)

- **Fichiers à créer** : 1/5 (20%)
  - ⏳ `flowerReviewConfig.js`

- **Données totales** :
  - 120+ arômes (8 catégories)
  - 17 cannabinoïdes (5 catégories)
  - 20 terpènes (profils complets)
  - 85 champs pipeline culture
  - 10 champs pipeline curing
  - **Total : ~250+ éléments configurables**

---

**Référence CDC** : [Dev_cultures.md](../PLAN/Dev_cultures.md)
**Dernière mise à jour** : 19/12/2025 - 00h15

