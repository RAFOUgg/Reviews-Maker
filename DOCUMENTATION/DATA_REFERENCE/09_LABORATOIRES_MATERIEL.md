# Laboratoires, techniques analytiques & matériel

> **Sourcing** : `id` renvoyant au registre **[13_REGISTRE_SOURCES.md](13_REGISTRE_SOURCES.md)**. Les méthodes analytiques (§1) sont **T1/T2** (littérature + normes USP/Pharmacopée) ; le matériel de séparation de frontière (§5, HashCru) est explicitement **T4**.

## 1. Analyses de laboratoire (contrôle qualité / certificats d'analyse — COA)

Un certificat d'analyse (COA, Certificate of Analysis) complet couvre typiquement les catégories suivantes. C'est la référence à viser pour la véracité scientifique des champs `labReportUrl`/`terpeneFileUrl`/`otherCannabinoids`/`terpeneProfile` déjà présents dans le schéma.

| Catégorie de test | Méthode analytique standard | Ce qui est mesuré |
|---|---|---|
| Puissance (cannabinoïdes) | HPLC-UV/DAD (High Performance Liquid Chromatography) | THC/THCA, CBD/CBDA, CBG/CBGA, CBC, CBN, THCV, delta-8-THC — la HPLC est préférée à la GC pour les cannabinoïdes car elle ne dégrade pas les formes acides (THCA ne se convertit pas artificiellement en THC pendant l'analyse, contrairement à une GC classique qui chauffe l'échantillon) |
| Terpènes | GC-FID ou GC-MS (Gas Chromatography) | Profil terpénique complet, souvent 20 à 40+ terpènes quantifiés individuellement |
| Résidus de pesticides | LC-MS/MS et GC-MS/MS | Panel de dizaines de pesticides interdits (listes réglementaires variables par juridiction) |
| Métaux lourds | ICP-MS (Inductively Coupled Plasma Mass Spectrometry) | Plomb, arsenic, cadmium, mercure — les "Big 4" réglementaires |
| Mycotoxines | LC-MS/MS ou ELISA | Aflatoxines, ochratoxine A (produites par certaines moisissures, risque notable sur fleur mal séchée/curée) |
| Microbiologie | qPCR (Quantitative PCR) ou culture microbienne | E. coli (STEC pathogène), Salmonella spp., levures et moisissures totales (Total Yeast and Mold, TYM), parfois Aspergillus spécifiquement (risque respiratoire aggravé chez les immunodéprimés) |
| Solvants résiduels | GC-MS (headspace) | Butane, propane, éthanol, isopropanol — pertinent uniquement pour les extraits obtenus par solvant |
| Terpènes/cannabinoïdes de dégradation | HPLC/GC | CBN comme marqueur de dégradation/oxydation du THC dans le temps (produit vieillissant) |

### Équipement de laboratoire associé — spécifications précises

> Section enrichie à partir d'une synthèse scientifique dédiée (« De 420 à 710 », M.R. — Terpologie, 2023-2025, chapitre XIII).

- **HPLC-UV/DAD** (`citti2018`, **T1**, méthode aussi inscrite USP/Pharmacopée Européenne = **T2**) (détection 220-280nm, colonne C18 100-250mm/4,6mm, gradient eau/acétonitrile ou eau/méthanol) : méthode de référence, opère à **température ambiante (25-35°C)** — évite la décarboxylation thermique des formes acides qui survient en GC. Résolution de 11 cannabinoïdes majeurs (THCA, THC, CBDA, CBD, CBN, CBG, CBGA, CBC, CBCA, THCV, Δ⁸-THC) en 15-25 min. LOD 0,01-0,1 mg/L, LOQ 0,05-0,5 mg/L.
- **GC-MS/GC-FID** (colonnes DB-5MS/HP-5MS, impact électronique 70eV, bases de spectres NIST/Wiley >350 000 références) : méthode de référence pour les **terpènes** (>50 en un run de 30-45 min). ⚠️ **Limite majeure pour les cannabinoïdes** : l'injecteur chauffé (250-280°C) décarboxyle partiellement à totalement les formes acides, rendant impossible la quantification séparée THCA/THC sans dérivatisation (silylation TMS) — d'où la préférence systématique pour l'HPLC sur les cannabinoïdes.
- **LC-MS/MS** (triple quadrupôle QqQ en mode SRM, ou Q-TOF haute résolution pour le screening non ciblé) : standard pour la quantification en traces (ng à pg/mL) — cannabinoïdes mineurs, métabolites (THC-COOH urinaire), contaminants (pesticides, solvants résiduels, mycotoxines, métaux lourds). Sensibilité 2-3 ordres de grandeur supérieure à l'HPLC-UV.
- **RMN (¹H/¹³C, 400-800MHz, 2D COSY/HSQC/HMBC/NOESY)** : référence pour l'élucidation structurale de nouveaux cannabinoïdes/métabolites — non destructive, quantitative (qNMR), identification absolue sans standard. Coût 500 k€ à 5 M€, expertise avancée requise — recherche académique principalement.
- **NIRS portable (proche infrarouge, 800-2500nm)** : outil de terrain/contrôle qualité rapide et non destructif — précision **±0,5-1 %** pour le THC total, **±0,2-0,5 %** pour le CBD après calibration sur jeu de données HPLC. Analyse en 30-60 secondes, sans préparation d'échantillon. Coût 4 000-15 000 €. Adapté au triage rapide/vérification de maturité en cours de production — **doit être complété par HPLC/LC-MS/MS pour toute analyse réglementaire officielle** (précision insuffisante seule).
- **ICP-MS** : plasma à couplage inductif + spectromètre de masse, pour les traces métalliques à l'échelle du ppb (Pb, As, Cd, Hg).
- **qPCR** : amplification/quantification d'ADN cible, détection rapide de pathogènes spécifiques (E. coli, Salmonella).
- **Microscope (grossissement x60-200) / loupe de poche 30x-60x** : observation directe des trichomes — outil terrain de référence pour estimer la maturité de récolte (cf. document 06 §1.8, tableau couleur/biochimie quantifié) avant tout envoi en laboratoire.

### Températures de libération — profil terpénique/cannabinoïdique selon la voie de consommation

Donnée directement exploitable pour affiner la science derrière les champs `consumptionMethod`/`methodeConsommation` (documents 01-04) — la vaporisation à température contrôlée permet une personnalisation réelle et mesurable du profil ressenti (source : synthèse §10.3) :

| Composé | Point de libération |
|---|---|
| β-Ocimène | 50°C |
| α-Humulène | 106°C |
| β-Caryophyllène | 119-130°C |
| α-Pinène | 155°C |
| THC | 157°C |
| CBD | 160°C |
| Myrcène | 166°C |
| Limonène | 176°C |
| CBN | 185°C |
| Linalol | 198°C |
| THCV | ~220°C |

Au-delà de **200°C**, apparition de pyrolysats toxiques (benzène, toluène, naphtalène, acroléine) même en vaporisation. Comparaison quantifiée vaporisation (185-210°C) vs combustion (`pomahacova2009`, T1) : **+50 % de transfert de cannabinoïdes** dans l'aérosol de vaporisation, fraction de HAP cancérogènes **réduite de 95 %**. La combustion génère >2000 composés chimiques distincts par pyrolyse (>800°C), dont HAP (benzo[a]pyrène), acroléine, CO, formaldéhyde — la fumée de joint contient ~70 % des HAP de la fumée de tabac à équivalence pondérale (`moir2008`, T1).

## 2. Normes & certifications structurantes

| Norme/certification | Portée | Pertinence |
|---|---|---|
| ISO/IEC 17025 | Accréditation des laboratoires d'essais et d'étalonnage | Un COA n'a de valeur probante que si le labo émetteur est accrédité selon cette norme — champ potentiel à ajouter (`labAccreditation`) |
| GACP (Good Agricultural and Collection Practices) | Bonnes pratiques agricoles et de récolte | Référentiel pour la culture de plantes médicinales, appliqué au cannabis médical |
| EU-GMP (Good Manufacturing Practice) | Bonnes pratiques de fabrication pharmaceutique | Obligatoire pour le cannabis médical importé/vendu en pharmacie dans l'UE — niveau d'exigence bien supérieur au GACP |
| HACCP (Hazard Analysis Critical Control Point) | Sécurité alimentaire | Pertinent pour les comestibles (analyse des dangers, points critiques de maîtrise) |

## 3. Matériel de culture (équipement terrain)

- **Éclairage** : voir 08_TECHNOLOGIES.md (HPS/MH/CMH/LED).
- **Systèmes d'irrigation** : goutte-à-goutte (drip) programmable, tables à marée (ebb & flow), NFT, aéroponie.
- **Climatisation** : climatiseurs split dédiés, déshumidificateurs, extracteurs d'air avec filtre à charbon actif (contrôle odeur), gaines de brassage d'air (limite les micro-climats et le risque d'oïdium).
- **Contrôleurs environnementaux** : centrales de pilotage climat/lumière/CO2 programmables, souvent avec courbes par phase de croissance.
- **Bacs/pots** : pots en tissu ("fabric pots", favorise l'air pruning des racines), pots classiques, systèmes hydroponiques dédiés (seaux DWC, gouttières NFT).

## 4. Matériel de post-récolte (séchage / curing)

- **Séchage** : pièce dédiée à température (~15-21 °C) et hygrométrie (~50-60% HR) contrôlées, séchage lent (7-14 jours typiquement) préféré pour la qualité aromatique finale.
- **Curing** : bocaux hermétiques avec "burping" (ouverture périodique pour évacuer l'humidité excédentaire), hygromètres digitaux placés dans le bocal, sachets de régulation d'humidité (type Boveda/Integra, à ±2% HR cible autour de 58-62%).
- **Trim** : à la main (préserve mieux les trichomes, standard "craft"/premium) vs machine à trim (rendement de main d'œuvre, léger risque d'arrachage de trichomes selon réglage).

## 5. Matériel d'extraction

- **Presse à rosin** : plaques chauffantes + pression hydraulique/pneumatique, paramètres clés température/pression/durée (le triptyque qui détermine le rendement et la qualité du rosin). Plage de température réellement pratiquée (vérifiée 2026-07-06) : hash/dry-sift 60-93°C, fleur/trim 82-104°C selon cold/hot press — cf. document 06 §4.
- **Système BHO/PHO closed-loop** : colonne d'extraction + collecteur + recovery tank pour recycler le solvant en circuit fermé (sécurité — le butane est hautement inflammable, l'extraction "open blasting" est dangereuse et déconseillée/illégale dans la plupart des juridictions).
- **Extracteur CO2 supercritique** : système sous pression avec pompes CO2 et séparateurs, permet un contrôle fin du profil d'extraction (sélectivité par pression/température) — coût d'équipement élevé, plutôt réservé aux opérateurs industriels/pharma.
- **Four à vide (vacuum oven)** : purge des solvants résiduels des concentrés (température modérée + vide poussé pour éviter la dégradation des terpènes).
- **Rotovap (évaporateur rotatif)** : élimination rapide du solvant (éthanol notamment) sous vide, étape courante avant distillation.
- **Colonne de distillation short-path** : séparation sous vide poussé par point d'ébullition, produit un distillat de haute pureté.
- **Système triboélectrique/électrostatique ("Teflon Tech"/"Electrostatic Separator", HashCru)** (`hashcru_site`, **T4**) : plaques/tiges PTFE (Téflon) exploitant la charge électrostatique de friction pour séparer les têtes glandulaires (chargées négativement) des tiges/contaminants (chargés positivement) — cf. document 08 §2.1-2.2 pour le principe physique et le statut épistémologique (paramètres kV/température non publiés par le fabricant à ce stade).
- **Naked Press (HashCru)** (`hashcru_site`, **T4**, `uncertainty` : specs de filtration non publiées) : presse à rosin sans sac filtrant intermédiaire — protocole de filtration exact non publié publiquement (SOP privée) ; la valeur de 0,5µm rapportée reste une donnée de praticien non vérifiée indépendamment — cf. document 08 §2.2.
- **HashVac (HashCru)** (`hashcru_site`, **T4**) : aspirateur (4-6HP) + tamis fin (70µm nylon typique) pour sécher et raffiner le hash humide immédiatement après extraction à l'eau glacée — Aw <0,6 en <60min rapporté — cf. document 08 §2.2.
- **Headhunter Stalk Removal Sieves (SRS)** (`hashcru_site`, **T4** — specs matériel publiques donc plus vérifiables que la moyenne T4) : tamis de finition en acier inoxydable 304 (30×30cm), retire les fragments de tige résiduels du hash en fin de tamisage, >99% de pureté en têtes rapportée — cf. document 08 §2.2.

## 6. Implication pour l'app

Ces catégories (méthode analytique, norme, équipement) sont des candidats naturels pour enrichir les champs déjà existants côté "Données analytiques" (actuellement `labReportUrl` en simple URL) : un futur schéma plus riche pourrait distinguer méthode utilisée (HPLC/GC/ICP-MS/qPCR), labo accrédité (booléen + nom + norme), et date d'analyse — ce qui donnerait une vraie traçabilité scientifique au lieu d'un simple lien de fichier.
