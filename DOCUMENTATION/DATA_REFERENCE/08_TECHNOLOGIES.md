# Avancées technologiques — culture, extraction, formulation, IA

## 1. Culture (agronomie & environnement contrôlé)

### Éclairage
- **HPS (High Pressure Sodium)** : technologie historique, spectre orangé/rouge dominant, bon rendement mais forte chaleur dégagée et efficience énergétique faible comparée au LED moderne.
- **MH (Metal Halide)** : spectre plus bleu, traditionnellement utilisé en végétatif.
- **CMH/LEC (Ceramic Metal Halide / Light Emitting Ceramic)** : spectre plein plus proche de la lumière naturelle, meilleure efficience que le HPS classique.
- **LED horticole (quantum board, COB)** : spectre ajustable (ratio rouge/bleu/blanc, ajout UV-A/UV-B et IR lointain), forte efficience énergétique, permet un pilotage fin de la photopériode et de l'intensité (dimming).
- **Notions clés à modéliser si champ futur** :
  - **PPFD** (Photosynthetic Photon Flux Density, µmol/m²/s) : intensité lumineuse reçue par la plante.
  - **DLI** (Daily Light Integral, mol/m²/jour) : intégrale de la lumière reçue sur 24h — plus pertinent que le PPFD instantané pour prédire la croissance.
  - **Photopériode** : 18/6 (végétatif classique), 12/12 (floraison photopériodique classique), autofloraison (indépendante de la photopériode, génétique ruderalis).
- **UV supplémentaire** : hypothèse de recherche (stimulation de production de trichomes/THC en réponse au stress UV), preuves scientifiques encore mitigées/en cours — à traiter comme "technique expérimentale", pas comme fait établi.

### Irrigation & substrat
- **Sol vivant ("living soil")** : substrat organique auto-fertile, écosystème microbien actif, pas d'apport d'engrais de synthèse — associé au segment "craft"/terroir.
- **Coco coir** : substrat inerte à rétention d'eau modérée, nécessite fertigation complète (comme l'hydroponie), tampon EC/pH plus stable que la laine de roche.
- **Laine de roche (rockwool)** : substrat inerte standard en production indoor intensive, bonne rétention d'air/eau, non biodégradable.
- **Hydroponie** : NFT (Nutrient Film Technique, film nutritif en circulation continue), DWC (Deep Water Culture, racines immergées oxygénées), RDWC (recirculating DWC, bacs reliés), aéroponie (racines en suspension, brumisation nutritive à haute fréquence — rendement potentiel élevé mais système sensible aux pannes).
- **Fertigation automatisée** : injection proportionnelle d'engrais pilotée par capteurs EC (conductivité électrique, proxy de la concentration en nutriments) et pH en continu, avec correction automatique.

### Capteurs & pilotage climatique
- **VPD (Vapor Pressure Deficit)** : différentiel de pression de vapeur d'eau entre la feuille et l'air ambiant — pilote de référence moderne pour l'irrigation/climatisation (remplace le pilotage par simple % d'humidité relative, car le VPD dépend aussi de la température).
- **Contrôleurs climatiques intégrés** : gestion croisée température/hygrométrie/CO2/lumière avec courbes programmées par phase de croissance.
- **Enrichissement CO2** : augmentation de la concentration en CO2 ambiant (jusqu'à ~1200-1500 ppm en floraison, contre ~400 ppm atmosphérique) pour accélérer la photosynthèse — n'a d'effet que si lumière et température ne sont pas limitantes.

### Techniques de conduite / training
- **LST (Low Stress Training)** : palissage/courbure des branches sans les casser, pour aplanir le couvert végétal.
- **HST (High Stress Training)** : topping (étêtage), fimming (topping partiel), super-cropping (écrasement contrôlé de la tige) — stress mécanique volontaire pour stimuler la ramification.
- **SCROG (Screen of Green)** : grille horizontale pour répartir la canopée et exposer un maximum de sites de floraison à la lumière.
- **SOG (Sea of Green)** : forte densité de petits plants à cycle court, floraison précoce, un seul cola principal par plant.
- **Défoliation** : retrait ciblé de feuillage (souvent en milieu de floraison) pour améliorer la pénétration lumineuse — pratique débattue selon l'intensité.

### Génétique & propagation
- **Sélection assistée par marqueurs (MAS)** : utilisation de marqueurs génétiques (SNP) pour prédire des caractères (sexe, chimiotype, résistances) avant l'expression phénotypique complète — accélère la sélection par rapport au phénotypage visuel seul.
- **Sexage précoce par marqueur moléculaire** : détection du sexe avant floraison (économie de temps/espace en sélection).
- **Culture de tissus (tissue culture / micropropagation in vitro)** : conservation et multiplication de génétique en milieu stérile — permet aussi le "cleanup" sanitaire d'une lignée.
- **HLVd (Hop Latent Viroid)** : viroïde latent, un des problèmes phytosanitaires majeurs et sous-diagnostiqués de l'industrie légale (rendement et puissance dégradés sans symptôme toujours visible) — la culture de tissus avec thermothérapie/méristème est la voie de "nettoyage" génétique de référence.
- **Génomique** : séquençage du génome du cannabis de plus en plus accessible, cartographie des gènes de biosynthèse des cannabinoïdes (THCAS, CBDAS) et des terpène-synthases — base scientifique de la sélection de nouvelles chimiovariétés.

## 2. Extraction & post-production

| Technique | Principe | Produit typique | Solvant résiduel à contrôler |
|---|---|---|---|
| Rosin (pressage) | Chaleur + pression mécanique, sans solvant | Rosin (fleur, hash, ou fleur fraîche/live rosin) | Aucun (méthode "solventless") |
| BHO (Butane Hash Oil) | Extraction par butane liquide à froid | Wax, shatter, badder, crumble, sauce/diamants | Résidus de butane (purge sous vide obligatoire) |
| PHO (Propane Hash Oil) | Extraction par propane, souvent en mélange avec le butane | Textures similaires au BHO, souvent plus "stable"/moins cireuse | Résidus de propane |
| CO2 supercritique | CO2 porté au-delà de son point critique (31,1 °C / 73,8 bar) devient un fluide aux propriétés intermédiaires liquide/gaz, solvant ajustable par pression/température | Huile, distillat | Aucun résidu solvant (CO2 s'évapore complètement) |
| Éthanol | Extraction par éthanol, souvent à froid (extraction cryogénique) pour limiter la co-extraction de chlorophylle | Huile brute avant raffinage, teintures | Résidus d'éthanol (évaporation) |
| Live resin / live rosin | Extraction à partir de matière fraîche congelée (jamais séchée) pour préserver le profil terpénique original | Concentré au profil aromatique jugé plus fidèle au cultivar vivant | Selon méthode utilisée en aval (solvant ou pressage) |

### Purification / raffinage post-extraction
- **Winterisation** : dissolution de l'extrait dans l'éthanol puis congélation pour précipiter/retirer les lipides et cires (élimination du "fat").
- **Filtration** : filtration sur charbon actif/terre de diatomées pour la clarté et l'élimination de résidus de couleur/chlorophylle.
- **Distillation short-path (à trajet court)** : séparation sous vide poussé par point d'ébullition des différents composés (cannabinoïdes, terpènes) pour obtenir un distillat très pur (souvent >90% cannabinoïde cible).
- **Chromatographie préparative** : isolation de molécules individuelles à haute pureté (isolats de CBD/THC cristallins, >99%).
- **Décarboxylation** : conversion thermique des formes acides (THCA → THC, CBDA → CBD) — étape indispensable avant toute activité psychoactive/orale efficace (comestibles notamment), typiquement 100-120 °C sur 30-60 min selon protocole.

## 3. Formulation (comestibles / produits dérivés)

- **Nanoémulsion** : réduction de la taille des gouttelettes lipidiques du cannabinoïde à l'échelle nanométrique pour améliorer sa dispersion en milieu aqueux — accélère l'apparition des effets et améliore la biodisponibilité par rapport à un comestible gras classique (pertinent notamment pour les boissons infusées).
- **Encapsulation liposomale** : protection de la molécule active dans une bicouche lipidique pour améliorer son absorption intestinale.
- **Enjeu de biodisponibilité orale** : le THC ingéré est métabolisé par le foie en 11-hydroxy-THC, un métabolite actif plus puissant et à action plus longue que le THC inhalé — explique la cinétique différente (délai d'apparition ~30-90 min, durée plus longue) déjà capturée par le champ `effectOnset`/`effectDuration` de l'app.

## 4. Intelligence artificielle & données

- **Phénotypage assisté par imagerie** (caméras multispectrales/hyperspectrales) : détection de stress hydrique/nutritif ou de maladies avant l'apparition de symptômes visibles à l'œil nu — technologie de recherche/haut de gamme, pas encore standard en production classique.
- **Modèles prédictifs de rendement** : à partir de séries de capteurs (lumière, climat, irrigation) pour anticiper la date de récolte optimale et le rendement attendu.
- **Recommandation de cultivar par profil terpénique/effet désiré** : cas d'usage direct pour une future fonctionnalité de l'app (matching entre profil recherché par l'utilisateur et bibliothèque de cultivars/reviews).
- **Traçabilité blockchain / seed-to-sale** : registres imposés réglementairement dans plusieurs juridictions nord-américaines (Metrc, BioTrackTHC) pour tracer chaque lot de la graine à la vente — modèle conceptuellement proche du système `ProductionChain`/`ChainNode`/`ChainEdge` déjà présent dans l'app, mais à visée réglementaire plutôt qu'éditoriale.
