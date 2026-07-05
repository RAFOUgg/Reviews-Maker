# FLEURS — inventaire complet des champs, par section de formulaire

> Page : `client/src/pages/review/CreateFlowerReview/index.jsx`. Modèle Prisma : `FlowerReview`. 11 sections dans l'ordre réel d'affichage : Infos générales → Génétiques &amp; PhenoHunt* → Pipeline Culture* → Récolte → Analytiques → Visuel &amp; Technique → Odeurs → Texture → Goûts → Effets &amp; Expérience → Curing &amp; Maturation. (*sections réservées compte Producteur.)
>
> Les sections **Odeurs, Texture, Goûts, Effets&amp;Expérience, Analytiques** sont des composants **partagés** avec Hash/Concentré (et partiellement Comestible) — elles sont détaillées ici en intégralité une seule fois ; les documents 02/03/04 y renvoient et n'indiquent que les différences.

## 1. Informations générales

| Champ | Widget | Options / contraintes |
|---|---|---|
| `nomCommercial` | texte, max 100 | **Obligatoire** — seul champ texte obligatoire de toute la fiche |
| `cultivars` | texte libre | Optionnel, séparés par virgules si plusieurs |
| `farm` | texte libre | Optionnel |
| `photos` | upload image | **Obligatoire, 1 à 4** ; chaque photo taguée (multi-tags libres) parmi : `Macro`, `Full plant`, `Bud sec`, `Trichomes`, `Drying`, `Curing` |

Rien à discuter scientifiquement ici (métadonnées descriptives) — les tags photo correspondent à des angles de prise de vue réels utiles pour documenter un cycle de culture (du plant entier au bourgeon séché), pas des mesures.

## 2. Génétiques & PhenoHunt (Producteur)

Cf. **[05_GENETIQUE_GENEALOGIE.md](05_GENETIQUE_GENEALOGIE.md)** pour le détail complet du système PhenoHunt (nœuds/arêtes/cultivars). En complément, le panneau "Métadonnées" local de cette section (`Genetiques.jsx`) porte 5 champs propres au nœud sélectionné :

- `breeder` (texte), `type` (`indica`/`sativa`/`hybrid`), `sex` (`unknown`/`female`/`male`) — déjà discutés en doc 05.
- `relations` (multi-tags) : `clone élite`, `seed run`, `selfed (S1)`, `BX1`, `BX2`, `polyhybride`. ✅ Vocabulaire cohérent avec le reste du système breeding (S1/BX déjà validés en doc 05) — `clone élite` et `seed run` sont des désignations réelles de l'industrie (un "clone élite" est une coupe d'un individu sélectionné et jamais recroisé ; un "seed run" désigne une production de graines à partir d'un croisement donné, terme commercial courant chez les breeders/seedbanks).
- `phenotypeCode` : généré automatiquement (`PhenoCodeGenerator`) — cohérent avec la pratique de terrain de numéroter les phénotypes testés lors d'un hunt (ex: "Pheno #3").

## 3. Pipeline Culture (Producteur)

Cf. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md) §1** pour le détail complet (Général, Environnement, Irrigation, Nutrition, Lumière, Climat, Palissage, Morphologie, Récolte — 9 sous-sections, ~90 champs).

## 4. Récolte & Post-Récolte

Champs dédiés du modèle `FlowerReview` (distincts de la sous-section "RECOLTE" du Pipeline Culture — les deux systèmes coexistent, cf. anomalie en fin de document) :

| Champ | Type | Commentaire scientifique |
|---|---|---|
| `trichomesTranslucides` / `trichomesLaiteux` / `trichomesAmbres` | % | ✅ Cf. doc 06 §1.8 : heuristique terrain réelle mais empirique, corrélée à l'évolution chimique (accumulation puis dégradation du THC) sans être une horloge universelle précise. |
| `modeRecolte` | select (manuelle/mécanique/etc.) | Distinction réelle — la récolte mécanique (utilisée à grande échelle, notamment chanvre industriel) est plus rapide mais plus agressive sur la structure des trichomes que la coupe manuelle, ce qui peut affecter la qualité visuelle/texturale du produit fini. |
| `poidsBrut` / `poidsNet` | g | ✅ Distinction standard et utile : poids avant/après défoliation manucure — permet de calculer un taux de déchet de manucure et un rendement net réel, donnée agronomique factuelle. |

## 5. Données analytiques (composant partagé `AnalyticsSection.jsx`)

| Champ | Widget | Contrainte |
|---|---|---|
| `thcPercent` | number libre (%) | Désactivé tant qu'aucun certificat n'est uploadé |
| `cbdPercent` | number libre (%) | idem |
| `cbgPercent` | number libre (%) | idem |
| `cbcPercent` | number libre (%) | idem |
| `labReportUrl` (certificat) | upload `.pdf/.jpg/.jpeg/.png`, max 5 Mo | — |
| `terpeneFileUrl` (profil terpénique) | upload `.pdf/.jpg/.jpeg/.png`, max 5 Mo | Saisie manuelle non autorisée (upload uniquement) |

### ⚠️ Constat scientifique important
1. **Seuls 4 cannabinoïdes sont saisissables** (THC/CBD/CBG/CBC), en nombre libre — alors que le schéma Prisma `FlowerReview` définit déjà des colonnes `cbnPercent`, `thcvPercent`, `otherCannabinoids` **sans aucun champ UI correspondant** dans `AnalyticsSection.jsx` : ces colonnes existent en base mais ne sont jamais renseignées via ce formulaire.
2. **Aucune distinction acide/neutre** (THCA vs THC, CBDA vs CBD) — cf. doc 05 §7 : c'est pourtant la pratique standard d'un vrai COA de laboratoire (la plante fraîche/non chauffée contient majoritairement les formes acides, non intoxicantes ; c'est la décarboxylation qui produit les formes actives). Un futur champ `thcaPercent`/`cbdaPercent` distinct, avec `thcTotalCalculated = THC + THCA×0.877` calculé automatiquement, rapprocherait l'app de la pratique réelle des laboratoires.
3. **Le profil terpénique n'est jamais structuré** — uniquement un upload de fichier. Le fichier `client/src/data/terpenes.js` (20 terpènes documentés : Myrcène, Limonène, β-Caryophyllène, Linalol, α/β-Pinène, Terpinolène, Humulène, Ocimène, Bisabolol, Nérolidol, Guaïol, Valencène, Géraniol, Eucalyptol, Camphène, Bornéol, Pulégone, Sabinène, Phytol) existe dans le code mais **n'est câblé nulle part** — c'est une opportunité directe : transformer l'upload de certificat en une saisie structurée (terpène + %) permettrait des cas d'usage nouveaux (tri/recherche par profil terpénique dominant, cf. doc 08 §4 "recommandation de cultivar par profil terpénique").
4. Le fichier `client/src/data/cannabinoids.js` (18 cannabinoïdes documentés dont THCA, CBDA, CBGA, CBDV, Δ8-THC, Δ10-THC, CBL, CBT) est également orphelin et contient un **bug de clé dupliquée** (`id: 'thca'` utilisé deux fois — la seconde entrée, censée être THCVA, hérite par erreur de l'identifiant `thca`) : à corriger avant toute réutilisation de ce fichier.

## 6. Visuel & Technique

Fichier propre à Fleur : `VisuelTechnique.jsx` (⚠️ implémentation différente du composant partagé `VisualSection.jsx` utilisé par Hash/Concentré — cf. anomalie en fin de document).

- **Couleur** (`selectedColors`, roue chromatique) — **max 5 couleurs**, palette `CANNABIS_COLORS` (10 teintes) : vert lime, vert, vert forêt, vert foncé, bleu-vert, violet, violet foncé, orange, jaune, brun. ✅ Palette cohérente avec la diversité de couleur réellement observable sur la fleur de cannabis — les teintes violettes/bleutées sont dues à l'expression d'anthocyanes (pigments également présents chez de nombreuses autres plantes, ex. myrtille/chou rouge), favorisée par des températures nocturnes plus fraîches en fin de floraison — mécanisme botanique réel et bien documenté, pas une légende.
- 7 sliders /10 : `colorRating`, `densite` (densité visuelle du bourgeon), `trichomes` (densité de trichomes visibles), `pistils`, `manucure` (qualité de la coupe/taille), `moisissure` (10=aucune), `graines` (10=aucune).

### Commentaire scientifique
- **Trichomes** (score visuel de densité) : ✅ proxy visuel raisonnable de la capacité de production de résine (les trichomes glandulaires sont le site de synthèse et stockage des cannabinoïdes/terpènes) mais **n'est pas une mesure quantitative de taux de cannabinoïdes** — une densité élevée de trichomes ne garantit pas un THC élevé (dépend aussi de la taille des têtes glandulaires et de leur contenu, invisibles à l'œil nu).
- **Pistils** : les pistils (poils/stigmates) passent du blanc à l'orange/brun en maturant — indicateur de maturité réel mais moins précis que la couleur des trichomes (cf. doc 06 §1.8).
- **Moisissure** : ✅ défaut réel et important à noter — principalement *Botrytis cinerea* ("bud rot", pourriture grise) ou oïdium, favorisés par une humidité excessive en fin de floraison/curing ; un score bas ici est un vrai signal de risque sanitaire, pas seulement esthétique.
- **Graines** : présence de graines dans une fleur non destinée à la reproduction indique une pollinisation accidentelle (mâle non détecté à proximité) ou un stress hermaphrodite — dégrade le rendement fumable net et est un vrai indicateur de maîtrise culturale.

## 7. Odeurs (composant partagé `OdorSection.jsx`, données `aromasWheel.js`)

| Champ | Contrainte |
|---|---|
| `notesOdeursDominantes` | roue CATA, **max 7** |
| `notesOdeursSecondaires` | roue CATA, **max 7**, optionnel |
| `intensiteAromeScore` | slider /10 |
| `complexiteAromeScore` | slider /10 |
| `fideliteAromeScore` | slider /10 — **masqué pour Fleur** (n'a de sens que pour Hash/Concentré, comparaison au cultivar d'origine) |

### Méthodologie CATA
✅ Le principe de "roue d'arômes" avec sélection multiple (Check-All-That-Apply, CATA) est la méthodologie standard de l'analyse sensorielle descriptive (dérivée directement des roues d'arômes du vin/café/bière, elles-mêmes issues des travaux d'analyse sensorielle de l'AFNOR/ASTM) — c'est une approche scientifiquement reconnue pour capturer un profil aromatique complexe sans forcer un choix unique arbitraire. La limite à 7 notes évite la sur-sélection qui diluerait la valeur discriminante des données (pratique courante en dégustation professionnelle : se concentrer sur les notes réellement perceptibles plutôt que sur une liste exhaustive).

### 8 catégories, 100 notes (`AROMAS`, liste complète)
`fruity` 🍊 (Agrumes : Citron, Citron vert, Orange, Pamplemousse, Mandarine, Bergamote ; Baies : Fraise, Myrtille, Framboise, Mûre, Canneberge, Cerise, Raisin ; Tropical : Mangue, Ananas, Papaye, Fruit de la passion, Noix de coco, Banane, Goyave ; Fruits à noyau : Pêche, Abricot, Prune ; Melons : Pastèque, Melon cantaloup, Melon miel ; Fruits secs : Raisin sec, Figue, Datte, Pruneau ; Pomme, Poire)
`floral` 🌸 (Rose, Lavande, Jasmin, Lilas, Violette, Chèvrefeuille, Hibiscus, Géranium, Camomille, Fleur blanche, Parfumé/Savonneux)
`earthy-woody` 🌲 (Terreux : Terre humide, Mousse, Champignon, Tourbe, Argile, Compost ; Boisé : Pin, Cèdre, Chêne, Bois de santal, Cyprès, Bouleau, Résine, Encens)
`spicy` 🌶️ (Épices : Poivre noir, Clou de girofle, Cannelle, Noix de muscade, Cardamome, Anis, Gingembre, Curry, Quatre-épices ; Herbes sèches : Basilic, Thym, Origan, Sauge, Romarin, Menthe)
`skunky` 🦨 (Mouffette, Musc, Ferme/Étable, Fromage, Ammoniac/Urine, Soufre, Pourri/Fermenté)
`chemical` ⛽ (Carburant : Diesel, Essence, Kérosène, Térébenthine ; Chimique : Solvant, Acétone, Alcool, Plastique, Caoutchouc, Peinture, Industriel)
`sweet` 🍯 (Sucré : Bonbon, Caramel, Miel, Vanille, Chocolat, Sirop d'érable, Barbe à papa, Guimauve, Caramel au beurre ; Boulangerie : Pain, Biscuit, Gâteau, Pâtisserie, Pâte)
`herbal` 🌿 (Herbe coupée, Foin, Thé vert, Maté, Feuille verte, Végétal vert, Concombre, Céleri, Asperge, Chlorophylle, Algue)

**Base scientifique réelle** : la plupart de ces notes correspondent à des terpènes/terpénoïdes identifiés (le Myrcène évoque le "terreux/musqué", le Limonène le "citron/agrumes", le Pinène le "pin/résine", le Caryophyllène le "poivré/épicé", le Linalol le "floral/lavande") — la roue d'arômes est donc **cohérente avec la chimie terpénique sous-jacente**, même si le lien direct terpène↔note n'est pas câblé explicitement dans le code actuel (`terpenes.js` orphelin, cf. §5).

## 8. Texture (composant partagé `TextureSection.jsx`)

Champs Fleur : `durete`/`hardness`, `densiteTactile`/`density`, `collant`/`stickiness`, `elasticite`/`elasticity` (spécifique Fleur, absent Hash/Concentré).

Échelles littérales (1-10) :
- **Dureté** : Très mou → Mou → Souple → Semi-souple → Moyen → Ferme → Dur → Très dur → Compact → Béton
- **Densité tactile** : Très aéré → Aéré → Léger → Peu dense → Moyen → Dense → Très dense → Compact → Très compact → Massif
- **Élasticité** : Aucune → Très faible → Faible → Peu élastique → Moyen → Élastique → Très élastique → Rebond → Très rebondissant → Caoutchouteux
- **Collant** : Sec → Très peu → Peu collant → Légèrement → Moyen → Collant → Très collant → Gluant → Très gluant → Adhésif

### Commentaire scientifique
✅ L'élasticité et le collant d'une fleur sont directement liés à son **taux d'humidité résiduelle** (une fleur trop sèche est cassante/friable ; une fleur bien curée reste légèrement souple sans être humide ; une fleur mal séchée/pas assez curée reste collante par excès de résine encore "fraîche" et d'humidité) — ces sensations tactiles sont donc de bons proxys qualitatifs d'un curing réussi, cohérent avec le fait que la section Curing (§11) suit juste après dans le flux de saisie.

## 9. Goûts (composant partagé `TasteSection.jsx`, données `tasteNotes.js`)

| Champ | Contrainte |
|---|---|
| `intensiteGoutScore` | slider /10 |
| `agressiviteScore` (Agressivité/Piquant) | slider /10, échelle `AGGRESSIVENESS_LEVELS` |
| `dryPuffNotes` | roue CATA, **max 7** — "goût à froid avant allumage" |
| `inhalationNotes` | roue CATA, **max 7** |
| `expirationNotes` | roue CATA, **max 7** — arrière-goût |

### 10 familles de goût (`TASTE_FAMILIES`, liste complète)
`fruity`, `earthy`, `spicy`, `herbal`, `floral`, `sweet`, `pine` (Pin &amp; Résine), `diesel` (Diesel &amp; Chimique), `nutty` (Noisette &amp; Noix), `creamy` (Crémeux) — cf. doc extraction pour le détail des ~140 notes individuelles.

### Commentaire scientifique
✅ La distinction dry-puff / inhalation / expiration est **pertinente sensoriellement** : le goût perçu évolue réellement au fil de la combustion/vaporisation et de la rétro-olfaction (le "dry puff", tirage à froid avant allumage, permet de sentir les composés les plus volatils sans pyrolyse — technique de dégustation professionnelle réelle utilisée par les cigar/cannabis sommeliers). L'échelle `AGGRESSIVENESS_LEVELS` (piquant en gorge à la combustion) est corrélée à la présence de certains terpènes irritants et à la qualité de séchage/curing (une fleur mal curée est généralement plus agressive à fumer, dégageant davantage de sous-produits de combustion de la chlorophylle résiduelle).

## 10. Effets & Expérience (composant partagé `EffectsSectionImpl.jsx`)

### Effets ressentis (roue CATA, max 8) — `EFFECTS_CATEGORIES`
- **mental.positive** : Relaxant, Apaisant, Euphorique, Heureux, Énergisant, Stimulant, Créatif, Concentré, Motivant, Sociable, Rire, Lucide
- **mental.negative** : Paranoïa, Anxiété, Confusion
- **physical.positive** : Détente musculaire, Soulagement douleur, Anti-inflammatoire, Sédatif, Appétit stimulé, Sensation corporelle, Fourmillements, Sensation de chaleur
- **physical.negative** : Bouche sèche, Yeux secs, Étourdissements, Fatigue intense, Somnolence excessive
- **therapeutic** : Anti-stress, Anti-anxiété, Anti-dépression, Aide au sommeil, Anti-nausée, Anti-migraines, Anti-spasmes, Augmentation appétit, Focus

**⚠️ Nuance scientifique importante** : ces effets sont du **reporting subjectif auto-déclaré**, cohérent avec la pratique de la plupart des bases de données grand public (Leafly, AllBud) — mais à ne jamais présenter comme une allégation thérapeutique validée. Le tableau du document [07_MARCHE_MONDIAL.md](07_MARCHE_MONDIAL.md) §4 rappelle les seules indications avec un vrai niveau de preuve clinique (spasticité SEP, épilepsie réfractaire, nausées chimio, stimulation d'appétit) — la plupart des effets listés ici (anti-stress, créatif, énergisant...) relèvent du ressenti communautaire, pas d'un consensus médical.

### Onset & Intensité
`ONSET_LEVELS` (1-10, de "Très lente 30+min" à "Instantanée &lt;30sec"), `INTENSITY_LEVELS` (1-10, "Très faible" à "Extrême"), `duration` (`5-15min` à `24h+`).

✅ **Cohérence pharmacologique** : les échelles d'apparition rapide (secondes à quelques minutes) sont réalistes pour la voie **inhalée** (fumée/vapeur — absorption pulmonaire quasi immédiate du THC dans le sang, pic plasmatique en quelques minutes) — c'est bien la voie par défaut adressée par cette section pour la Fleur (par opposition au Comestible, cf. doc 04, qui a un onset structurellement plus long via l'échelle dédiée `debutEffetsEdible`).

### Méthode de consommation (`methodeConsommation`)
`combustion-joint`, `combustion-pipe`, `combustion-bong`, `combustion-blunt`, `vapeur-portable`, `vapeur-salon`, `vapeur-dab`, `infusion-the`, `infusion-beurre`, `comestible`, `autre`.

✅ Distinction combustion/vapeur pharmacologiquement significative : la **vaporisation** chauffe le matériau en dessous du point de combustion (~180-220°C, contre >400°C pour une flamme) — elle volatilise cannabinoïdes/terpènes sans pyrolyse, réduisant la production de sous-produits de combustion (goudrons, monoxyde de carbone) documentée dans la littérature sur la réduction des risques respiratoires par rapport à la combustion classique.

### Dosage, usages, profils
`dosageUtilise` + `dosageUnite` (g/mg/ml), `debutEffets` (immédiat &lt;2min → long 30+min, voie non-comestible), `dureeEffetsCategorie` (courte/moyenne/longue/très longue), `usagesPreferes` (max 10 : matin/journée/après-midi/soir/nuit/seul/social/médical/créatif/sportif/relaxation), `profilsEffets` (max 8, mêmes items que la roue CATA ci-dessus mais présentés en interface "chips"), `effetsSecondaires` (max 10 : yeux secs, bouche sèche, yeux rouges, faim intense, soif, fatigue, étourdissement, anxiété, paranoïa, tachycardie, maux de tête, nausée, confusion, aucun).

✅ Les effets secondaires listés correspondent bien aux effets indésirables aigus les plus fréquemment rapportés en pharmacologie clinique du THC (tachycardie et sécheresse buccale/oculaire sont des effets anticholinergiques-like documentés, la faim/"munchies" est un effet bien caractérisé via l'action du THC sur les récepteurs CB1 hypothalamiques régulant l'appétit).

## 11. Curing & Maturation

Cf. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md) §2**.

## Synthèse des points d'attention spécifiques Fleur

1. Deux implémentations parallèles de "Visuel &amp; Technique" existent dans le code (`VisuelTechnique.jsx` pour Fleur vs `VisualSection.jsx` pour Hash/Concentré) — la branche "Fleur" de ce second composant n'est jamais exécutée en production, code mort à nettoyer si une unification est envisagée (cf. [10_ANOMALIES_CODE_MORT.md](10_ANOMALIES_CODE_MORT.md)).
2. Cannabinoïdes analytiques limités à 4 (THC/CBD/CBG/CBC) malgré des colonnes DB (`cbnPercent`, `thcvPercent`, `otherCannabinoids`) déjà prêtes à l'emploi côté schéma.
3. Terpènes jamais structurés (upload de fichier uniquement) malgré un référentiel de 20 terpènes déjà écrit dans le code mais non branché.
4. Pas de distinction THCA/CBDA vs THC/CBD — écart avec la pratique réelle des COA de laboratoire.
