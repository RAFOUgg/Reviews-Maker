# Traçabilité totale & extensibilité — principes de conception

> Ce document répond directement au constat de fond formulé par l'utilisateur : *« le cannabis ce n'est pas une science exacte, c'est tout l'enjeu de notre site, il faut permettre une traçabilité 100 % complète d'un produit, tout est possible, donc on doit tout prévoir. »* Il consolide en un seul endroit les recommandations concrètes disséminées dans les documents 01-10, et pose des principes de conception pour toute future extension de champ.

## 1. Pourquoi le cannabis résiste à la rigidité des menus déroulants

La synthèse scientifique ayant servi de base à la mise à jour de ce référentiel (« De 420 à 710 », M.R. — Terpologie) le formule elle-même explicitement dans sa conclusion (§15.1) : *« Le cannabis ne devrait pas être compris comme une molécule unique, mais comme une matrice chimique complexe. »* Trois raisons structurelles rendent la donnée cannabis intrinsèquement plus mouvante qu'un simple catalogue produit :

1. **La classification de référence change avec la science.** Il y a 20 ans, Indica/Sativa/Hybride suffisait. Aujourd'hui, le standard pharmaceutique/analytique est le chémotype (McPartland 2018, 5 types — document 05 §3), et il n'est pas garanti qu'il n'existe pas un système encore plus fin demain (biomarqueurs génomiques directs, cf. document 08 §6). **Un champ figé fige une science qui, elle, ne l'est pas.**
2. **Les techniques de production évoluent plus vite que la documentation académique.** La triboélectricité (document 08 §2.1) est physiquement fondée mais partiellement propriétaire ; les techniques que vous avez signalées (filtration céramique sub-micronique, Hash-Vac, SRS sieved — document 08 §2.2) ne sont pas encore dans la littérature peer-reviewed du tout. **Un praticien de terrain est parfois en avance sur la publication scientifique** — la synthèse elle-même le reconnaît en consacrant une section entière à Frenchy Cannoli, dont "les observations empiriques ont préfiguré des caractérisations scientifiques formelles" avant que la science ne les rattrape.
3. **La déclaration n'est pas la mesure.** Un taux de THC "annoncé par le breeder" et un taux "mesuré par COA de laboratoire accrédité" ne sont pas la même donnée (déjà bien géré par `thcSource`/`cbdSource`, document 05 §2) — cette distinction déclaratif/vérifié doit devenir un **principe systématique**, pas une exception ponctuelle sur 2 champs.

## 2. Principes de conception à appliquer systématiquement

| Principe | Ce qu'il implique concrètement | État actuel dans l'app |
|---|---|---|
| **Toujours une échappatoire libre** | Chaque `select`/enum doit avoir une option "Autre" + champ texte libre associé, jamais une liste fermée sans issue | ✅ Déjà largement le cas (`'__custom__'` sur `ChainEdgeFormModal`, `other` sur la plupart des selects pipeline) — à vérifier systématiquement sur tout nouveau champ |
| **Distinguer déclaratif vs vérifié** | Un champ scientifique/chiffré doit pouvoir porter une source (`breeder_claim`/`lab_tested`, ou `confirmed`/`probable`/`claimed`) | ✅ Fait sur THC/CBD (`Cultivar.thcSource`) et sur la fiabilité de généalogie (`parentageReliability`) — **absent** sur `otherCannabinoids`/`terpeneProfile` (document 01 §5) |
| **Fourchette plutôt que valeur unique** | Le vivant varie — un taux de cannabinoïde, un rendement, une durée de floraison sont des plages, pas des constantes | ✅ Déjà fait (`thcMin`/`thcMax`, `floweringMinWeeks`/`floweringMaxWeeks`) — bon réflexe à généraliser à tout futur champ quantitatif variétal |
| **Ne jamais figer une borne numérique comme contrainte serveur** | Les sliders/min-max sont des repères UX, pas des règles de validation bloquantes | ✅ Déjà un principe explicite du code (`pipelineConfigs.js`, document 06) — à préserver absolument pour toute technique de frontière (une extraction expérimentale peut légitimement sortir des plages "standard") |
| **Séparer axe scientifique et axe commercial/déclaratif** | Ne jamais remplacer un champ commercial (`type` Indica/Sativa) par un champ scientifique (`chemotype`) — les garder tous les deux, avec le bon niveau de confiance affiché | ✅ Déjà la bonne architecture (document 05 §3) |
| **Versionner les techniques non stabilisées** | Une technique nouvelle (triboélectricité, filtration céramique) doit pouvoir entrer dans un menu avec un champ notes/détail obligatoire tant qu'elle n'a pas de paramètres standard reconnus | ⚠️ À appliquer pour les 3 techniques de frontière signalées (document 08 §2.2) |

## 3. Registre consolidé des recommandations concrètes (toutes sources)

### Champs à ajouter
1. **`Cultivar.chemotype`** : ajouter l'option `negligible` ("Type V — cannabinoïdes négligeables/chanvre") — McPartland 2018 en reconnaît 5, l'app n'en expose que 4 (document 05 §3, §8).
2. **Données analytiques (Fleur/Hash/Concentré)** : ajouter des champs THCA/CBDA distincts des formes neutres THC/CBD, avec calcul automatique du "THC total" (`THC + THCA×0,877`) — document 01 §5, document 05 §7.
3. **`GenNode.generation`** : ajouter `IBL` pour cohérence avec `Cultivar.generationStatus` qui l'a déjà (document 05 §8).
4. **Comestible** : champ "à jeun / avec repas" — impact ×2-3 documenté sur la biodisponibilité orale du THC (Zgair et al. 2017) — document 08 §5.
5. **`separationType`** (Hash) : ajouter l'option **électrostatique/triboélectrique** ("Teflon Tech"/"Electrostatic Separator", HashCru) — technique physiquement fondée, vérifiée sur le site du fabricant (document 08 §2.1-2.2).
6. **`extractionMethod`** (Concentré) : ajouter **"Naked Press (HashCru)"** — rosin pressé sans sac filtrant intermédiaire (document 08 §2.2).
6bis. **Pipeline Séparation (Hash)** : ajouter **"HashVac"** comme sous-étape de séchage/raffinage juste après `ice-water`, et **"Stalk removal (Headhunter SRS)"** comme prétraitement/finition de matière première — les deux avec specs vérifiées sur hashcru.com/lowtemp-plates.com (document 08 §2.2, document 06 §3).
7. **`labReportUrl`** : faire évoluer vers un objet structuré (méthode analytique HPLC/GC-MS/LC-MS-MS/NIRS, laboratoire, accréditation ISO 17025, date) plutôt qu'une simple URL — document 09 §6.
8. **`inbreedingLevel`** (PhenoHunt) : calculer automatiquement le coefficient de consanguinité F depuis la structure de l'arbre plutôt que le laisser en saisie libre — document 05 §5.
8bis. **`plateTemperature`** (rosin) : recalibrer le hint par défaut sur la plage réellement pratiquée (60-104°C selon hash/fleur et cold/hot press, vérifié 2026-07-06) — la borne haute actuelle (220°C) ne correspond à aucun réglage rosin réel, cf. document 06 §4.

### Clarifications de chevauchement conceptuel (pas de nouveau champ, juste de la cohérence)
9. `GenNode.origin` vs `GenNode.geneticType` capturent deux axes différents (provenance commerciale vs statut génétique) avec un vocabulaire qui se recoupe — document 05 §2.
10. Divergence `pipelineStarterSetups.js` vs noms de champs réels (`ph`/`ec` vs `waterPH`/`waterEC`) — dette technique, document 06 §7 / document 10.

### Saisie des valeurs à unité (nouveau principe transverse)
11. Remplacer tout champ numérique à unité figée (température, pression, masse, volume, durée) par une jauge à unité convertible (auto-conversion valeur + bornes), en excluant explicitement les familles à piège (EC⇄PPM double échelle, PPFD⇄lux, g/m²⇄g/plante) qui ne doivent jamais se convertir silencieusement — spécification complète, formules et cartographie de tous les champs concernés dans **[12_SAISIE_VALEURS_UNITES.md](12_SAISIE_VALEURS_UNITES.md)**.

### Recalibrages de bornes par défaut (basés sur cinétique documentée, pas juste une préférence)
11. `decarboxylationTemp`/`decarboxylationDuration` : la cinétique de Wang et al. (2016) montre qu'un protocole ~110°C/20-30min atteint >95 % de conversion sans franchir le seuil de dégradation (145°C) — le défaut actuel (120°C/60min) est fonctionnel mais plus agressif que nécessaire (document 06 §5).

## 4. Ce qui reste hors périmètre de cet audit (pour transparence)

La synthèse scientifique fournie couvre aussi en détail des chapitres non encore exploités dans ce référentiel : flavonoïdes/cannflavines (chapitre IV), système endocannabinoïde complet — récepteurs CB1/CB2, endocannabinoïdes anandamide/2-AG (chapitre V), pharmacocinétique comparée de 9 voies d'administration (chapitre X), addictologie/DSM-5 et intoxication aiguë (chapitre XI), interactions médicamenteuses CYP450 détaillées (chapitre XII). Si vous voulez que ces chapitres nourrissent à leur tour l'app (par exemple un futur module "usage thérapeutique" ou une mise en garde structurée sur les interactions médicamenteuses), il faudra une passe dédiée — signal-le si c'est la prochaine priorité.
