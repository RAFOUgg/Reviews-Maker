# Laboratoires, techniques analytiques & matériel

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

### Équipement de laboratoire associé
- **HPLC** (colonne C18 typiquement, détecteur UV/DAD) : équipement de référence pour les cannabinoïdes.
- **GC-FID/GC-MS** : four à température programmée + colonne capillaire, pour les composés volatils (terpènes, solvants résiduels).
- **ICP-MS** : plasma à couplage inductif + spectromètre de masse, pour les traces métalliques à l'échelle du ppb.
- **qPCR** : amplification/quantification d'ADN cible, détection rapide de pathogènes spécifiques.
- **Microscope (grossissement x60-200)** : observation directe des trichomes (tête glandulaire, tige, maturité — base du champ `trichomesTranslucides/Laiteux/Ambres` déjà dans le schéma) — pas une "analyse de labo" à proprement parler mais l'outil terrain le plus utilisé pour estimer la maturité de récolte avant tout envoi en laboratoire.
- **Réfractomètre / loupe de poche 30x-60x** : outil terrain simplifié pour l'observation des trichomes par le cultivateur (moins précis que le microscope de labo, mais accessible).

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

- **Presse à rosin** : plaques chauffantes + pression hydraulique/pneumatique, paramètres clés température/pression/durée (le triptyque qui détermine le rendement et la qualité du rosin).
- **Système BHO/PHO closed-loop** : colonne d'extraction + collecteur + recovery tank pour recycler le solvant en circuit fermé (sécurité — le butane est hautement inflammable, l'extraction "open blasting" est dangereuse et déconseillée/illégale dans la plupart des juridictions).
- **Extracteur CO2 supercritique** : système sous pression avec pompes CO2 et séparateurs, permet un contrôle fin du profil d'extraction (sélectivité par pression/température) — coût d'équipement élevé, plutôt réservé aux opérateurs industriels/pharma.
- **Four à vide (vacuum oven)** : purge des solvants résiduels des concentrés (température modérée + vide poussé pour éviter la dégradation des terpènes).
- **Rotovap (évaporateur rotatif)** : élimination rapide du solvant (éthanol notamment) sous vide, étape courante avant distillation.
- **Colonne de distillation short-path** : séparation sous vide poussé par point d'ébullition, produit un distillat de haute pureté.

## 6. Implication pour l'app

Ces catégories (méthode analytique, norme, équipement) sont des candidats naturels pour enrichir les champs déjà existants côté "Données analytiques" (actuellement `labReportUrl` en simple URL) : un futur schéma plus riche pourrait distinguer méthode utilisée (HPLC/GC/ICP-MS/qPCR), labo accrédité (booléen + nom + norme), et date d'analyse — ce qui donnerait une vraie traçabilité scientifique au lieu d'un simple lien de fichier.
