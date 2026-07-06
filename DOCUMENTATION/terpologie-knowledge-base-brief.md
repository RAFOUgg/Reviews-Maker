# Brief de constitution — Base de connaissances cannabis « scientifiquement tangible »
### Destiné à Claude Code · Projet Terpologie (traçabilité)

> **But** : donner à l'agent une carte complète du savoir cannabis (graine → gâteau + science + réglementation), une méthode pour ne stocker que des données solides et sourcées, une liste d'acteurs/labos/journaux à étudier, et un schéma de données prêt à alimenter la plateforme de traçabilité.

---

## 0. Principe directeur : la « tangibilité scientifique » = niveau de preuve + source + contexte

**Règle d'or : aucune donnée n'entre en base sans être taguée avec son niveau de preuve, sa source, sa date et sa juridiction.** C'est ce qui distinguera Terpologie d'un wiki cannabique de plus.

### Hiérarchie de preuve (à stocker dans un champ `evidence_tier`)

| Tier | Type de source | Exemples | Usage en DB |
|------|----------------|----------|-------------|
| **T1** | Peer-reviewed, méta-analyses, revues systématiques | *British J. of Pharmacology*, *Cannabis and Cannabinoid Research*, *Frontiers in Plant Science/Pharmacology*, PMC/PubMed | Fait établi (avec réserves si études petites) |
| **T2** | Agences, pharmacopées, standards, métrologie | EUDA, ANSM, WHO ECDD, USP, NIST, AOAC SMPR, ASTM D37, ISO 17025 | Référence normative / réglementaire |
| **T3** | Technique industriel, brevets, COA de labos accrédités | USPTO/EPO, notes d'application (Sigma, Shimadzu), COA COFRAC/ISO 17025 | Donnée opérationnelle, à recouper |
| **T4** | Praticiens experts, SOP artisanales, communauté technique | HashCru SOP, Press Club, seminars solventless | Savoir-faire, à valider empiriquement |
| **T5** | Marketing, forums, blogs vendeurs, anecdotes | Sites e-commerce, Leafly (effets), Reddit | **Quarantaine** — n'entre pas comme fait |

### Champs obligatoires par enregistrement
`claim` · `evidence_tier` · `source_citation` (DOI/URL) · `date_published` · `jurisdiction` (si applicable) · `method` (analytique/expérimentale) · `uncertainty` (LOD/LOQ, IC, taille d'échantillon) · `contested` (booléen) · `last_verified`

### Deux réflexes non négociables
1. **Stocker le contradictoire.** Certains « faits » cannabis sont disputés. Ex. l'**effet d'entourage** : popularisé par Russo (2011), mais des études (ex. *Frontiers in Pharmacology* 2020 : les terpénoïdes n'agissent pas aux récepteurs cannabinoïdes ; essais THC pur vs fleur ne montrant pas de différence) le remettent en cause. → champ `contested = true` + stocker les deux positions, jamais trancher unilatéralement.
2. **Nom de variété ≠ génétique ≠ effet.** La nomenclature « indica/sativa » et les noms commerciaux sont scientifiquement peu fiables (croisements clandestins sans pedigree). Rattacher toujours à un **chémotype** (profil cannabinoïdes+terpènes mesuré) et, si possible, à un **génotype** (SNPs), pas à un nom marketing.

---

## 1. Carte des domaines à couvrir

Pour chaque domaine : **(a)** ce qu'il faut verrouiller, **(b)** sources autoritatives, **(c)** requêtes de recherche prêtes à l'emploi.

### 1.1 — Génétique & sélection (généalogie / phénohunt)
**À verrouiller** : biosynthèse des cannabinoïdes (gènes synthases THCA/CBDA/CBCA), détermination du sexe (ratio loci Y/X), chémotypes I–V, marqueurs MAS, culture tissulaire & assainissement viroïde (HLVd), haploïdes/doublage, cryoconservation, dérive somaclonale des clones.
**Sources** : Kannapedia / Medicinal Genomics (StrainSEEK, génomes de référence), CannabisGDB, NCBI/ENA/DDBJ, génomes de référence (van Bakel *Purple Kush/Finola*, Laverty, Grassa *CBDRx*), labos Torkamaneh (U. Laval), A. M. P. Jones & Hesami (U. Guelph).
**Requêtes** :
- `cannabis THCA synthase CBDA synthase gene variant chemotype`
- `Cannabis sativa reference genome CBDRx Laverty chromosome assembly`
- `cannabis tissue culture HLVd viroid elimination protocol`
- `cannabis haploid doubled haploid breeding 2025`
- `somaclonal variation clonal cannabis whole genome sequencing`

### 1.2 — Culture & agronomie
**À verrouiller** : photopériode/autofloraison, VPD, spectre lumineux (LED), substrats/hydro, nutrition (NPK + micro), IPM (ravageurs, oïdium, botrytis), stress abiotiques, densité, defoliation, contrôle environnemental/automation (capteurs, IoT).
**Sources** : littérature horticole peer-reviewed, extension universitaires, revues *Cannabis Science and Tech*.
**Requêtes** :
- `cannabis VPD photoperiod flowering optimization study`
- `cannabis integrated pest management powdery mildew botrytis`
- `cannabis LED spectrum cannabinoid terpene yield trial`

### 1.3 — Récolte / séchage / curing (post-harvest) ⟵ *axe Vonsnel*
**À verrouiller** : fenêtre de récolte (maturité trichomes), séchage (T°/HR/temps), **activité de l'eau (aw)**, seuils microbiens (CFU, TYM/YM, Aspergillus), curing (dégradation vs préservation terpénique, conversion THCA→CBN), lyophilisation du hash, burping, transport frais.
**Sources** : Cannatrol (moisture management), littérature food-science appliquée, seuils réglementaires par juridiction, *Cannabis Science and Tech* post-harvest.
**Requêtes** :
- `cannabis water activity aw mold threshold storage`
- `cannabis curing terpene preservation temperature humidity study`
- `cannabis microbial limits total yeast mold Aspergillus regulation`
- `freeze dry bubble hash water activity`

### 1.4 — Phytochimie (cannabinoïdes / terpènes / flavonoïdes)
**À verrouiller** : structures et voies de biosynthèse (CBGA → THCA/CBDA/CBCA), formes acides vs neutres, décarboxylation (cinétique), cannabinoïdes mineurs (CBG, CBN, CBC, THCV, CBDV), >120 terpénoïdes (myrcène, limonène, β-caryophyllène, linalol, α/β-pinène, terpinolène), flavonoïdes (cannflavines), oxydation/vieillissement.
**Sources** : PubChem (structures, InChI/SMILES), revues ElSohly & Slade (dénombrement terpènes), *Big Book of Terps* (Russ Hudson) comme index à recouper en T1.
**Requêtes** :
- `cannabis cannabinoid biosynthesis CBGA pathway review`
- `THCA decarboxylation kinetics temperature time`
- `cannabis terpene profile chemotype classification`
- `cannflavin flavonoid cannabis pharmacology`

### 1.5 — Pharmacologie / système endocannabinoïde / PK-PD ⟵ *monographe « De 420 à 710 »*
**À verrouiller** : CB1/CB2, endocannabinoïdes (AEA, 2-AG), FAAH/MAGL, métabolisme hépatique (CYP), **11-OH-THC** (voie orale), PK fumé vs oral vs sublingual, 11-OH-THC/Cmax, biodisponibilité, tolérance, interactions médicamenteuses.
**Sources T1** : Mechoulam, Di Marzo, Russo, McPartland ; essais PK récents (nanoémulsion 2025). **Toujours flag `contested` sur l'entourage.**
**Requêtes** :
- `endocannabinoid system CB1 CB2 review`
- `THC oral pharmacokinetics 11-OH-THC first pass metabolism`
- `cannabis nanoemulsion bioavailability clinical trial 2025`
- `entourage effect evidence critique terpenoid cannabinoid receptor`

### 1.6 — Séparation solventless (hash) ⟵ *cœur de métier*
**À verrouiller** : dry sift (mesh microns, dénombrement étoiles/full-melt), ice water (fresh-frozen, No-Ice tek, chlorophylle), rosin (T°/P/microns), cold cure, temple balls, Piatella ; **frontière R&D** : Headhunter SRS (retire l'électrostatique), centrifugation densimétrique (roSpin/spun hash, sans chaleur), Sonicure (texture par ultrasons), Teflon/triboélectrique, hashwrap.
**Sources** : HashCru (SOP + IP « True Solventless »), The Press Club, Bubbleman (rating system), archives Frenchy Cannoli (fondamentaux, figure historique). ⚠️ Ces sources sont **T4** → à valider par mesure (COA, aw, rendement).
**Requêtes** :
- `HashCru Headhunter stalk removal sieve solventless`
- `bubble hash micron sieve full melt star rating`
- `no ice technique bubble hash chlorophyll`
- `rosin press temperature pressure micron terpene`
- `dry sift electrostatic separation trichome`

### 1.7 — Extraction à solvant (concentrés)
**À verrouiller** : hydrocarbure (BHO : butane/propane, closed-loop, C1D1, live resin/diamonds/sauce), CO₂ supercritique, éthanol, winterisation, distillation short-path / wiped-film, isolats, décarb (réacteur MW), sécurité (LEL, explosivité, solvants résiduels).
**Sources** : Root Sciences, Illuminated Extractors (brevets), WKU Consulting (ingénierie de labo), notes d'application fabricants.
**Requêtes** :
- `hydrocarbon extraction closed loop live resin process`
- `wiped film short path distillation cannabinoid recovery`
- `residual solvent testing cannabis concentrate limits`
- `supercritical CO2 vs ethanol vs BHO yield comparison`

### 1.8 — Transformation / formulation (edibles / « gâteaux » / boissons / topiques)
**À verrouiller** : décarboxylation contrôlée pour corps gras (beurre, MCT), infusion, **nanoémulsion** (homogénéisation HP / ultrasonication, gouttelettes 20–200 nm, onset 5–15 min, durée plus courte), water-soluble, dosage/homogénéité, stabilité, topiques (pénétration cutanée).
**Sources T1** : essais PK nanoémulsion 2025 (petits, parfois financés industrie → flag) ; brevets USPTO décarb/fat product.
**Requêtes** :
- `cannabis nanoemulsion ultrasonication droplet size bioavailability`
- `controlled decarboxylation infused fat butter patent`
- `cannabis edible dose uniformity stability study`

### 1.9 — Analytique / QC / métrologie ⟵ *cœur Terpologie (analyse profils)*
**À verrouiller** : HPLC/UHPLC-DAD (acides/neutres sans décarb), LC-MS/MS & GC-MS/MS (multi-analytes, THC-free < 0,1 %), profils terpéniques (GC-FID/GC-MS, headspace), LOD/LOQ, incertitude, échantillonnage/homogénéisation, matériaux de référence, PT (proficiency testing).
**Sources T2** : AOAC CASP (SMPR, méthodes officielles), ASTM D37, NIST (matériaux de référence, QA), ISO/IEC 17025 & 17043, COFRAC (FR).
**Requêtes** :
- `AOAC SMPR cannabinoids plant material concentrate`
- `LC-MS/MS 16 cannabinoids hemp method validation`
- `ASTM D37 cannabis standard test method`
- `NIST cannabis reference material hemp value assignment`
- `cannabis terpene analysis GC-MS headspace method`

### 1.10 — Contaminants & sécurité
**À verrouiller** : pesticides (listes par état/pays), métaux lourds (Pb, Cd, As, Hg — ICP-MS), microbio (TYM, coliformes, *Aspergillus* spp.), mycotoxines (aflatoxines, ochratoxine), solvants résiduels (GC-headspace), aw, seuils réglementaires **par juridiction**.
**Sources T2** : listes réglementaires par état US / EU, AccuStandard (CRM), AOAC microbio (working group).
**Requêtes** :
- `cannabis heavy metals limits ICP-MS regulation`
- `cannabis Aspergillus testing requirement state`
- `cannabis residual solvent limits category`

### 1.11 — Réglementation / conformité / traçabilité ⟵ *finalité produit*
**À verrouiller** : statut par juridiction (FR/UE/US/CA), novel food CBD (EFSA, limite ~2 mg/j discutée), seuils THC (0,3 %), stupéfiants (listes ANSM, HHC/THCP interdits, Annexe II ONU HHC déc. 2025), track-and-trace (seed-to-sale : Metrc, BioTrack), EU-GMP pour médical, étiquetage/COA.
**Sources T2** : EUDA (ex-EMCDDA, European Drug Report), ANSM, WHO ECDD, UN CND, EFSA, réglementations nationales.
**Requêtes** :
- `EUDA European drug report new psychoactive substances cannabinoids`
- `HHC scheduling UN CND 1971 convention 2025`
- `cannabis seed to sale traceability Metrc system`
- `EFSA CBD novel food safety limit`

### 1.12 — Taxonomie / nomenclature / chémotypes
**À verrouiller** : débat *sativa/indica/ruderalis*, types chimiques I–V, cartographie chémotype↔génotype, invalidité des noms commerciaux comme prédicteurs.
**Requêtes** :
- `cannabis chemotype type I II III classification`
- `sativa indica genetic basis unreliable study`

---

## 2. Acteurs, labos & sources à suivre et étudier

> ⚠️ Vérifier chaque personne/entité avant de stocker des affirmations à leur sujet ; certaines figures sont historiques. Utiliser cette liste comme **points d'entrée de recherche**, pas comme faits.

### Scientifiques fondateurs & pharmacologie (T1)
- **Raphael Mechoulam** — isolation/structure THC & CBD ; « grand-père » de la recherche cannabis (œuvre à archiver).
- **Ethan Russo** — effet d'entourage (2011, *Br. J. Pharmacol.*), déficience endocannabinoïde clinique ; CReDO Science. *(À stocker avec le contradictoire.)*
- **Vincenzo Di Marzo** — endocannabinoïdes, système EC.
- **John McPartland** — cannabis & extraits, anatomie/EC.
- **Mahmoud ElSohly** (U. Mississippi) — chimie, dénombrement terpènes/cannabinoïdes.
- **Voix critiques de l'entourage** — études sceptiques (Frontiers 2020, essais THC pur vs fleur) : à suivre pour l'équilibre épistémique.

### Génomique & sélection (T1–T3)
- **Kevin McKernan / Medicinal Genomics** — StrainSEEK, Kannapedia, génomique appliquée au breeding.
- **Davoud Torkamaneh** (U. Laval) — GWAS, génomique cannabis.
- **Andrew Maxwell P. Jones & Mohsen Hesami** (U. Guelph) — culture tissulaire, biotech.
- Auteurs des génomes de référence : **van Bakel** (Purple Kush/Finola), **Laverty**, **Grassa** (CBDRx).
- Projets/patrimoine génétique : **Phylos Bioscience** (Open Cannabis Project), **Sawler/Lynch** (datasets publics).

### Terpènes & phytochimie (T1 + T4)
- **Russ Hudson** — *The Big Book of Terps* (index à recouper en T1).

### Hashmakers / solventless (T4 — savoir-faire à valider)
- **HashCru** — R&D publique (Headhunter SRS, centrifuge/roSpin, Sonicure, Teflon tech, hashwrap ; IP « True Solventless »).
- **The Press Club** / **Rosin Tech Labs** — teks & équipement, seminars.
- **Bubbleman** — système de notation full-melt (fondamental).
- **Frenchy Cannoli** (†2021) — méthode ice water & temple balls ; corpus/archives à étudier comme socle historique.

### Ingénierie extraction / procédé (T3)
- **WKU Consulting** — ingénierie de labos d'extraction.
- **Root Sciences**, **Illuminated Extractors** (brevets hydrocarbure), **MACH Technologies** — équipements/procédés.
- **Cannatrol** — science du séchage/curing (moisture management).

### Labos, standards & agences (T2 — normatif)
- **AOAC INTERNATIONAL — CASP** (Cannabis Analytical Science Program) : SMPR, méthodes officielles, PT.
- **ASTM International — Committee D37** : normes cannabis.
- **NIST** : matériaux de référence, QA labo.
- **ISO/IEC 17025** (labos) & **17043** (PT) ; **COFRAC** (accréditation FR).
- **EUDA** (ex-EMCDDA), **ANSM**, **WHO ECDD**, **UN CND**, **EFSA**.

### Journaux & médias techniques
- **T1** : *Cannabis and Cannabinoid Research*, *British Journal of Pharmacology*, *Frontiers in Plant Science / Pharmacology*, *Journal of AOAC International*, PMC/PubMed.
- **T3–T4** : *Cannabis Science and Technology*, *Analytical Cannabis*, *Terpenes and Testing*, *Newsweed* (FR, veille réglementaire/marché).

### Bases de données à ingérer / relier
- **PubChem** (structures, SMILES/InChI) · **NCBI/ENA/DDBJ** (séquences) · **Kannapedia** & **CannabisGDB** (génomique cultivars) · **PubMed/PMC** (littérature) · registres réglementaires nationaux · **COFRAC** (labos accrédités).

---

## 3. Schéma de données suggéré (ontologie Terpologie)

Pensé pour une plateforme de traçabilité : chaque fait est un nœud sourcé, chaque produit/lot pointe vers ces nœuds.

### Entités « savoir »
- **Cultivar** (`id`, `name`, `aliases[]`, `chemotype_id`, `genotype_ref`, `lineage[]`, `breeder`)
- **Chemotype** (`id`, `type_I_to_V`, `dominant_cannabinoids[]`, `dominant_terpenes[]`)
- **Compound** (`id`, `class` = cannabinoid|terpene|flavonoid, `iupac`, `smiles`, `inchikey`, `acid_form_of?`, `pubchem_cid`)
- **PharmacologyFact** (`compound_id`, `target` = CB1|CB2|…, `effect`, `evidence_tier`, `contested`)
- **ProcessStep** (`id`, `stage` = grow|harvest|dry|cure|separation|extraction|formulation, `params{}`)
- **Method** (`id`, `kind` = analytical|extraction|separation, `name`, `loq`, `lod`, `standard_ref` = AOAC/ASTM/ISO)
- **ContaminantThreshold** (`analyte`, `matrix`, `limit`, `unit`, `jurisdiction`, `source`)
- **RegulatoryStatus** (`substance`, `jurisdiction`, `status`, `effective_date`, `source`)

### Entités « traçabilité » (reliées au savoir)
- **Batch/Lot** (`id`, `cultivar_id`, `process_chain[]`, `lab_results[]`)
- **LabResult / COA** (`batch_id`, `method_id`, `analytes[]`, `accreditation`, `date`)

### Entité transversale critique
- **Source** (`id`, `citation`, `doi_url`, `evidence_tier`, `date`, `jurisdiction`, `accessed_at`)
  → **toute** valeur factuelle référence au moins une `Source`. Pas de fait orphelin.

---

## 4. Workflow d'exécution pour Claude Code

1. **Amorçage par domaine** (§1) : itérer les requêtes, prioriser T1/T2, descendre en T3/T4 seulement pour l'opérationnel.
2. **Extraction structurée** : pour chaque source → produire des enregistrements atomiques (1 claim = 1 ligne) avec métadonnées §0.
3. **Déduplication & réconciliation** : fusionner claims identiques, garder la source de plus haut tier ; conserver les variantes juridictionnelles séparées.
4. **Détection de contradiction** : si deux sources T1 divergent → créer 2 enregistrements liés + `contested = true`, ne jamais écraser.
5. **Validation croisée** : un fait T3/T4 (ex. SOP hash) n'est « confirmé » que recoupé par une mesure ou une source ≥ T2.
6. **Versioning** : `last_verified` + re-crawl périodique des domaines volatils (réglementation, marché gris — molécules qui changent tous les 6 mois).
7. **Droit d'auteur** : stocker **faits paraphrasés + citation/DOI**, jamais de longs extraits verbatim.

---

## 5. Garde-fous épistémiques (à coder en règles de rejet)

- **Rejeter** toute affirmation d'effet basée uniquement sur nom de variété ou source T5.
- **Marquer contesté** : entourage effect, allégations thérapeutiques non cliniques, « indica = sédatif / sativa = énergisant ».
- **Se méfier** des puissances annoncées (inflation marketing) → privilégier COA de labos accrédités.
- **Isoler par juridiction** : un statut légal, un seuil de contaminant ou une limite THC n'est valable que pour son territoire + sa date.
- **Volatilité du marché gris** : les néo-cannabinoïdes et leur statut changent en continu → domaine à re-vérifier fréquemment, jamais figé.
- **Petites études** : la plupart des essais PK/cliniques cannabis ont de faibles effectifs et parfois un financement industriel → noter `uncertainty` et ne pas surinterpréter.

---

*Ce brief est une carte de collecte, pas une base de faits en soi : chaque élément ci-dessus doit être vérifié à la source avant d'entrer en DB, avec son niveau de preuve.*
