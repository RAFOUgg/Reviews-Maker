# D1 — Plan de refonte produit : Terpologie comme infrastructure de preuve

> Demande du 2026-08-10 : plan de refonte totale, avec recherche IoT, campagne marketing, analyse
> concurrentielle et merchandising dérivé des rendus. Ambition posée : SaaS professionnel et
> scientifique, pouvant servir de banque de données étatique pour le cannabis européen.
>
> **Ce document distingue partout ce qui est SOURCÉ de ce qui est HYPOTHÈSE.** Les sources sont
> listées au §9. Rien n'est présenté comme acquis sans référence.

---

## 0. Trois constats de recherche qui recadrent l'ambition

### 0.1 Il n'existe pas d'autorité cannabis européenne — et ce n'est pas un détail

Le cannabis relève de la **compétence des États membres** (principe de subsidiarité). L'UE n'a pas
cherché à créer un cadre commun et ne montre aucun signe d'aller dans ce sens à court terme.

**Conséquence directe** : « banque de données étatique pour le cannabis européen » n'a **aucun
acheteur au niveau UE aujourd'hui**. Viser Bruxelles, c'est viser un guichet qui n'existe pas.

Ce n'est pas un abandon de l'ambition : c'est un changement d'adresse. Le marché existe, mais il est
**national**, et il y a une porte d'entrée précise (§0.2).

### 0.2 L'Allemagne, Pilier 2 : la seule porte d'entrée « étatique » réellement ouverte

Les projets pilotes allemands (Pillar 2 / KCanG) sont structurés ainsi :

- durée **5 ans**, avec évaluations scientifiques périodiques ;
- **suivi seed-to-sale obligatoire**, intégrant vente, stock et journaux de consommation ;
- et surtout : **les sites candidats doivent démontrer un partenariat avec une institution
  scientifique, académique ou de santé publique**, et **soumettre un plan détaillé expliquant
  comment ils collecteront et analyseront les données**.

C'est le point qu'il faut retenir. Le goulot d'étranglement d'un pilote allemand n'est pas la vente,
c'est **la capacité à produire de la donnée exploitable scientifiquement**. Terpologie ne produit
que ça.

> **Positionnement recommandé** : ne pas se vendre comme un système de conformité (METRC-like,
> déjà pris et fait pour l'État), mais comme **l'outil de documentation scientifique que le pilote
> doit fournir à son partenaire académique**. C'est un besoin réglementairement imposé, actuellement
> mal servi, et qui correspond exactement à ce que le produit sait déjà faire.

### 0.3 Le rendu devient une pièce réglementaire, pas un visuel

Deux mouvements convergent :

- les QR de COA doivent **dépasser le simple lien PDF statique** pour aller vers **GS1 Digital
  Link**, seul moyen de survivre aux vérifications de rappel **au niveau du lot** et aux audits ;
- le **Digital Product Passport** européen pousse l'étiquetage vers la comptabilité de cycle de vie —
  tout devient scannable, auditable et permanent ;
- en parallèle, la réglementation **revient vers l'étiquette physique** : les avertissements et
  dosages doivent être lisibles directement sur le contenant, le QR ne suffisant plus.

**Traduction pour Export Maker** : la fiche n'est plus un objet marketing, c'est un **document
opposable**. Elle doit exister en trois formes cohérentes — écran (vivant), fichier (figé, archivable),
**et imprimé (étiquette physique)** — toutes trois adossées au même identifiant.

---

## 1. Le verrou unique : il n'y a pas d'identifiant de lot

L'étude de marché du 2026-07-09 l'avait déjà nommé, et rien n'a changé depuis : **aucun identifiant
unique de lot / plante / tag n'existe dans `schema.prisma`** (le seul « batch » est `batchSize`, une
quantité, pas un identifiant). Or c'est la brique de base de **tous** les systèmes examinés — tag
RFID METRC, CPLI GS1, empreinte blockchain.

**Tout le reste de ce plan en dépend.** Sans identifiant de lot :

- pas de GS1 Digital Link, donc pas de QR conforme (§0.3) ;
- pas de vérification de rappel au niveau du lot ;
- pas de Digital Product Passport ;
- pas de chaîne de garde inter-entreprises (2e écart déjà identifié : `ProductionChain` est
  mono-utilisateur) ;
- et donc pas de dossier crédible pour un pilote allemand.

C'est **le** chantier fondateur, et il est modeste techniquement : le repo a déjà une convention
d'identifiant partageable (`shareCode`, unique, déjà utilisé sur `GeneticTree`, `ProductionChain`,
`TemplateShare`). Il s'agit de l'étendre à un `BatchId` porté par le nœud de chaîne de production,
et de le faire remonter dans les rendus.

> **Ordre non négociable** : identifiant de lot → QR/DPP dans le rendu → dossier pilote. Inverser
> cet ordre produit une démo qui ne survit pas à la première question d'un régulateur.

---

## 2. Refonte du rendu : de l'image au document probant

Export Maker est « la part majeure du produit ». Voici ce que « fini » veut dire, concrètement.

### 2.1 Trois surfaces, un seul document

| Surface | Rôle | État actuel |
|---|---|---|
| **Écran** (`/r/:id`, onglet Studio) | document vivant, interactif, partageable | fonctionnel ; audité pour la 1re fois le 2026-08-10 (157 → 2 erreurs) |
| **Fichier** (PNG/PDF/SVG) | pièce archivable, opposable | 5 templates, pagination adaptative ; 8 erreurs résiduelles, aucune perte de contenu |
| **Imprimé** (étiquette, encart) | obligation réglementaire montante (§0.3) | **n'existe pas** |

La troisième surface est le manque. Elle n'exige pas un nouveau moteur : c'est un format de sortie
supplémentaire (dimensions physiques en mm, marges d'impression, quadrichromie, code-barres/QR).

### 2.2 Ce qui manque au document pour être opposable

1. **Identifiant de lot visible et scannable** (§1) — aujourd'hui le QR pointe vers un identifiant
   interne explicitement marqué « non réglementaire ».
2. **Horodatage et version figée.** Un document opposable doit dire *quand* il a été émis et sur
   quelle version des données — sinon il n'est pas archivable.
3. **Traçabilité de la mesure.** Le rendu affiche des valeurs de labo ; il doit dire **qui** a
   mesuré, **selon quelle méthode**, **avec quelle accréditation** (les champs existent déjà dans le
   registre — ils ne sont pas mis en valeur comme une chaîne de preuve).
4. **Signature/intégrité.** Une empreinte du contenu, vérifiable depuis le QR. C'est ce qui distingue
   une fiche technique d'une jolie image.

### 2.3 Direction artistique : « certificat », pas « carte »

La refonte COA v2 du 2026-07-30 avait déjà pris cette direction pour la Fiche Technique (identité
laboratoire, bandes sémantiques de score fixes, chiffres en chasse tabulaire). **Elle n'a été
appliquée qu'à un seul des cinq templates.** Les quatre autres sont restés sur l'idiome
glassmorphism, pensé pour l'écran.

Proposition : **deux familles assumées**, au lieu de cinq templates hétérogènes.

- **Famille « Certificat »** (Fiche Technique, Traçabilité) — papier, encre, filets, chasse
  tabulaire, destinée au fichier et à l'imprimé.
- **Famille « Vitrine »** (Compact, Story, Blog) — écran, réseaux, glassmorphism, destinée au partage.

Cela clarifie aussi le choix utilisateur, aujourd'hui posé comme cinq options équivalentes alors
qu'elles répondent à deux besoins opposés.

---

## 3. IoT — ce que dit la recherche, et où GrowBrain se place

### 3.1 État du marché

- Les capteurs IoT couvrent température, humidité, CO₂, pH, concentration en nutriments, en temps
  réel ; le « crop steering » ajuste ces conditions dynamiquement selon la phase végétative ou
  générative.
- **Consolidation en cours** : Canix et Trym ont fusionné, la plateforme combinée sert plus de
  **650 sites dans 6 pays**.
- **L'IA arrive côté grower** : AROYA a livré en avril 2026 un « second cerveau » qui fait émerger
  des motifs dans les données du cultivateur **sans les envoyer à des plateformes tierces** — le
  positionnement se joue explicitement sur la **souveraineté de la donnée**.
- Une architecture académique de référence (SmartGrow DataControl, *SoftwareX*) met en avant trois
  propriétés : **compatibilité avec tous les capteurs quelle que soit la marque**, redondance de
  stockage, et outillage entièrement open-source.

### 3.2 Lecture pour Terpologie

`growbrain.terpologie.eu` existe déjà comme sous-domaine pro (liaison des installations de culture
pour relevés automatiques + IA de gestion), **externe à ce dépôt**. C'est l'ancrage IoT naturel, et
il n'a pas besoin d'être reconstruit.

Ce qui manque n'est pas le capteur, c'est **la jonction** : aujourd'hui le pipeline de culture est
saisi **à la main** (`cultureTimelineData`). Un relevé automatique alimentant les mêmes cellules
transformerait la nature du produit — la fiche cesserait d'être déclarative pour devenir **mesurée**.

C'est très exactement ce qui fait la différence entre « un carnet de dégustation soigné » et « une
source de données scientifique » — donc entre l'ambition affichée et la réalité.

**Deux principes à ne pas perdre**, tirés du marché :
- **agnosticisme capteur** (ne jamais lier le produit à une marque) ;
- **souveraineté de la donnée** (argument différenciant assumé par le concurrent le plus avancé) —
  et c'est un argument d'autant plus fort en Europe, où le pilote allemand impose l'anonymisation
  stricte des données personnelles.

---

## 4. Analyse concurrentielle — actualisation 2026

L'étude de 2026-07-09 comparait six familles et concluait à une **absence de concurrence directe**.
Cette conclusion tient toujours, avec deux évolutions à intégrer :

| Famille | Exemples | Ce qu'ils font | Ce qu'ils ne font pas |
|---|---|---|---|
| Conformité réglementaire | METRC, BioTrack | inventaire imposé par l'État | aucune donnée qualitative ni sensorielle |
| ERP / exploitation | Distru, GrowFlow, Trellis | opérations, stock, ventes | ne documentent pas le *produit* |
| **Cultivation + IoT** | **Canix/Trym (650 sites, 6 pays), AROYA** | pilotage environnemental, IA | **pas de fiche produit publiable** |
| Provenance / blockchain | TruTrace | preuve d'intégrité | pas de contenu documentaire |
| Standards | GS1 (CPLI, Digital Link), ISO 22095 | l'identifiant et le lien | ce sont des normes, pas des produits |
| Grand public | Leafly, Weedmaps | avis, découverte | aucune rigueur de production |

**Le créneau réel de Terpologie n'a pas bougé** : documentation de production professionnelle,
généalogie scientifique, richesse sensorielle. Personne ne l'occupe.

**Le risque, lui, s'est rapproché** : la consolidation IoT (Canix/Trym) monte vers la donnée de
culture, et il ne leur manque qu'une couche de restitution publiable — c'est-à-dire Export Maker.
La fenêtre n'est pas indéfinie.

---

## 5. Positionnement : trois marchés, un seul produit

| Marché | Ce qu'il achète | Prérequis |
|---|---|---|
| **Producteur pro** (aujourd'hui) | une fiche qui vend son lot et prouve son sérieux | rendu imprimable + lot identifié |
| **Pilote / recherche** (12-24 mois) | une collecte structurée et exploitable scientifiquement | export de jeu de données, anonymisation, versionnage |
| **Autorité nationale** (36 mois+) | une base consultable et vérifiable | intégrité, chaîne de garde inter-entreprises |

C'est une **progression**, pas trois produits. Chaque étage se vend au précédent, et chacun a besoin
du même socle : identifiant de lot, intégrité, rendu opposable.

---

## 6. Campagne marketing — ce que la recherche impose

L'angle n'est pas à inventer : le marché a déjà basculé. « La conformité est traitée comme un
**mécanisme de confiance** plutôt qu'une charge », et l'étiquette devient centrale dans la confiance
du consommateur. Les QR relient COA, profil terpénique et date de récolte pour une base d'acheteurs
« qui préfère la donnée au mystère ».

**Message central proposé** : *« La preuve, pas la promesse. »* Terpologie ne note pas un produit —
il en documente la fabrication, du parent génétique à l'étape de curing, et rend cette
documentation vérifiable.

Trois campagnes, dans l'ordre des marchés du §5 :

1. **Producteurs** — « Votre fiche technique, pas votre flyer. » Démonstration par comparaison :
   une fiche Terpologie contre une étiquette classique, sur le même lot. Le rendu **est** la publicité :
   chaque fiche publiée porte la marque et le lien.
2. **Recherche / pilotes** — publication d'un **jeu de données de démonstration** et d'une note de
   méthode (référentiel de sources, tiers de preuve T1-T5 — le projet possède déjà cette
   méthodologie dans `DOCUMENTATION/DATA_REFERENCE`). C'est ce document, pas une plaquette, qui
   ouvre la porte d'un partenariat académique exigé par le Pilier 2.
3. **Notoriété** — la généalogie et la chaîne de production rendues en une page publique
   (`/r/:id/lineage`, déjà livré) sont un objet visuellement fort et partageable, rare dans ce
   secteur. C'est l'actif de contenu à exploiter.

**Le levier structurel** : chaque fiche exportée est un support de diffusion. Le produit se vend par
son rendu — d'où le fait que la qualité d'Export Maker soit une décision *commerciale*, pas
seulement technique.

---

## 7. Merchandising dérivé des rendus

Le moteur de rendu produit déjà des documents paginés à dimensions maîtrisées. Le passage au
physique est un **format de sortie**, pas un nouveau produit.

| Objet | Dérivé de | Intérêt |
|---|---|---|
| **Étiquette de pot / sachet** | Fiche Technique, format mm | répond au retour de l'obligation d'étiquette physique (§0.3) |
| **Encart COA** glissé dans l'emballage | Fiche Technique A4 réduite | le document opposable, dans la main du client |
| **Carte de lot** (format carte à jouer) | Fiche Compact | objet collectionnable par cultivar — fort potentiel communautaire |
| **Planche généalogique** | `/r/:id/lineage` | objet d'affichage pour boutique/salon ; très différenciant |
| **Étiquette QR seule** | identifiant de lot | le minimum viable, vendable dès le §1 livré |

**Attention, et c'est une limite réelle** : passer à l'imprimé impose des contraintes que le moteur
actuel n'a pas — CMJN (les palettes sont en RVB), fonds perdus, résolution 300 dpi minimum, et
polices intégrées. Ce n'est pas insurmontable, mais ce n'est pas gratuit non plus, et je ne l'ai pas
mesuré : **à traiter comme un chantier à part entière**, pas comme une case à cocher.

---

## 8. Séquencement recommandé

L'ordre est contraint par les dépendances, pas par l'envie.

### Étape 1 — L'identifiant de lot (fondation, tout en dépend)
`BatchId` sur le nœud de chaîne de production, sur le modèle de `shareCode` déjà en place. Affichage
et QR dans les rendus. *Sans lui, les étapes 2 à 4 sont impossibles.*

### Étape 2 — Le document opposable
GS1 Digital Link à la place du QR interne actuel ; horodatage et version figée ; chaîne de preuve du
laboratoire mise en avant ; empreinte d'intégrité vérifiable.

### Étape 3 — Les deux familles de rendu
Certificat (papier/fichier) et Vitrine (écran/réseaux), au lieu de cinq templates hétérogènes.
Inclut le format **imprimé** avec ses contraintes propres (§7).

### Étape 4 — La jonction IoT
GrowBrain alimente les cellules de pipeline en relevés automatiques. La fiche passe de déclarative à
mesurée — c'est le saut qualitatif qui rend l'ambition scientifique défendable.

### Étape 5 — Le dossier pilote
Export de jeu de données anonymisé + note de méthode, pour se présenter comme le fournisseur de
documentation d'un pilote allemand et de son partenaire académique.

### En parallèle, sans dépendance
Chaîne de garde inter-entreprises (lever le caractère mono-utilisateur de `ProductionChain`, 2e écart
identifié dès juillet).

---

## 9. Sources

- [Germany Cannabis Pilot Projects in 2026: Cities, Eligibility](https://www.cannabisregulations.ai/cannabis-and-hemp-regulations-compliance-ai-blog/germany-pillar-2-cannabis-pilot-projects-2025-2026)
- [Germany's 'Pillar 2' at a Crossroads: 2025 Model Projects](https://www.cannabisregulations.ai/cannabis-and-hemp-regulations-compliance-ai-blog/germany-2025-pillar-2-cannabis-model-projects)
- [EU Cannabis Regulation 2026: Country Laws, Markets & Policy](https://businessofcannabis.com/eu-cannabis-regulation/)
- [Cannabis Track-and-Trace Requirements by Country: 2026](https://groweriq.ca/2026/07/07/cannabis-track-and-trace-by-country-2026/)
- [Germany Pillar 2 Cannabis: Commercial Retail Delay Explained](https://groweriq.ca/2026/04/15/germany-pillar-2-cannabis-retail-delay/)
- [SmartGrow DataControl : architecture IoT pour Cannabis sativa (SoftwareX)](https://www.sciencedirect.com/science/article/pii/S2352711024002504)
- [Top 9 Cannabis Cultivation Technologies to Watch in 2026](https://cannabisriskmanager.com/top-9-cannabis-cultivation-technologies-to-watch-in-2026/)
- [Cannabis Grow Apps 2026: From Commercial Sensors to AI Assistants](https://cannabistech.com/articles/the-best-smart-grow-apps/)
- [Cannabis Labeling & Packaging Compliance in 2026](https://innorhino.com/blog/packaging-trend/cannabis-labeling-and-packaging-compliance-in-2026)
- [Beyond the QR Code: Why Physical ECLs Are Vital for 2026](https://www.pioneerpresscolorado.com/blog/beyond-the-qr-code-why-physical-ecls-are-vital-for-2026-cannabis-transparency/)
- [QR Codes for Cannabis Retail: 2026 Setup for COAs](https://www.qrelix.com/blogs/qr-codes-for-cannabis-retail)

Étude de marché interne du 2026-07-09 (six familles d'outils, matrice à 12 capacités) : mémoire
`market-study-traceability-positioning-2026-07`.
