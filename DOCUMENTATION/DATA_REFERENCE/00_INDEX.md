# Référentiel de données — Reviews-Maker

> Objectif : lister **chaque donnée** capturée par l'application (des arbres généalogiques génétiques jusqu'à la dernière section des comestibles), avec pour chacune ses **valeurs/configurations possibles** (pour alimenter des menus déroulants), une **vérification de véracité scientifique**, et le contexte marché/technologique/laboratoire qui entoure ces données. Produit à partir d'une double extraction exhaustive du code réel (pas de la documentation historique, qui peut être datée) + de connaissances de domaine (cannabis science, agronomie, chimie analytique, marché).
>
> Date de production : 2026-07-06. Sources : lecture directe de `server-new/prisma/schema.prisma`, extraction exhaustive par exploration de code de tous les fichiers `client/src/data/*.js` et `client/src/config/*.js` pertinents, une synthèse scientifique dédiée fournie par l'utilisateur (**« De 420 à 710 »**, M.R. — Terpologie, 2023-2025, ~150 références peer-reviewed indexées PubMed/DOI, 15 chapitres), une vérification web ciblée sur les sources listées en mémoire (`sources-fiables-cannabis-technique`), et le cadre méthodologique **[terpologie-knowledge-base-brief.md](../terpologie-knowledge-base-brief.md)** (système de tiers de preuve T1-T5, `contested`, `uncertainty`, ontologie de traçabilité) — appliqué en retrofit sur l'ensemble des documents ci-dessous.

## Sommaire

1. **[01_FLEURS.md](01_FLEURS.md)** — 11 sections du formulaire Fleur (Infos générales, Génétiques, Culture, Récolte, Analytiques, Visuel, Odeurs, Texture, Goûts, Effets, Curing)
2. **[02_HASH.md](02_HASH.md)** — 9 sections du formulaire Hash (Infos générales, Séparation, Analytiques, Visuel, Odeurs, Texture, Goûts, Effets, Curing)
3. **[03_CONCENTRES.md](03_CONCENTRES.md)** — 9 sections du formulaire Concentré (Infos générales, Extraction, Analytiques, Visuel, Odeurs, Texture, Goûts, Effets, Curing)
4. **[04_COMESTIBLES.md](04_COMESTIBLES.md)** — 4 sections du formulaire Comestible (Infos générales, Recette, Goûts, Effets)
5. **[05_GENETIQUE_GENEALOGIE.md](05_GENETIQUE_GENEALOGIE.md)** — Système PhenoHunt, avec chémotype McPartland (5 types, Sawler 2015 : 35%+ d'étiquettes Indica/Sativa mal attribuées génétiquement), pharmacologie précise des cannabinoïdes (Ki/mécanismes/LD50, tiers de preuve), biologie des trichomes et biosynthèse
6. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md)** — Les 6 pipelines partagés, avec cinétiques précises (décarboxylation Wang 2016, oxydation THC→CBN, tableau complet des réactions de vieillissement/curing), rosin recalibré (60-104°C vérifié)
7. **[07_MARCHE_MONDIAL.md](07_MARCHE_MONDIAL.md)** — Segmentation du marché, panorama réglementaire par région, tendances, débouchés médicaux reconnus — explicitement classé **hors échelle T1-T5** (estimation qualitative)
8. **[08_TECHNOLOGIES.md](08_TECHNOLOGIES.md)** — Séparation vs extraction, panorama complet (charas→triboélectricité→CO2 SFE-SFC), écosystème HashCru vérifié (Naked Press, HashVac, Headhunter SRS — tous tagués **T4**)
9. **[09_LABORATOIRES_MATERIEL.md](09_LABORATOIRES_MATERIEL.md)** — Méthodes analytiques précises (HPLC/GC-MS/LC-MS-MS/RMN/NIRS avec specs LOD/LOQ/coût, tiers T1/T2), températures de libération terpènes/cannabinoïdes par voie de consommation
10. **[10_ANOMALIES_CODE_MORT.md](10_ANOMALIES_CODE_MORT.md)** — Fichiers de données orphelins, pipelines non branchés, bugs de contenu — **à lire avant toute implémentation** pour ne pas travailler sur du code mort
11. **[11_TRACABILITE_ET_EXTENSIBILITE.md](11_TRACABILITE_ET_EXTENSIBILITE.md)** — Philosophie de conception ("le cannabis n'est pas une science exacte, il faut tout prévoir") + registre consolidé de toutes les recommandations concrètes des documents 01-10
12. **[12_SAISIE_VALEURS_UNITES.md](12_SAISIE_VALEURS_UNITES.md)** — Convention de saisie pour toute valeur à unité (jauge + sélecteur d'unité + auto-conversion) : température/pression/masse/volume/durée/micron, avec les pièges à ne pas convertir automatiquement (EC⇄PPM double échelle, PPFD⇄lux, g/m²⇄g/plante)
13. **[13_REGISTRE_SOURCES.md](13_REGISTRE_SOURCES.md)** — Entité `Source` centrale (brief méthodologique) : chaque citation des documents 01-12 y renvoie par `id`, avec tier de preuve T1-T5, `contested`, `uncertainty` — **point d'entrée pour toute vérification de véracité**

## Comment utiliser ce référentiel

- **Pour construire un menu déroulant** : chercher le champ dans le document du produit concerné (01-04) ou du système transverse concerné (05-06) — chaque champ liste ses options exactes telles qu'elles existent dans le code aujourd'hui.
- **Pour vérifier la véracité d'une donnée** : consulter le tier de preuve (T1-T5) associé dans **[13_REGISTRE_SOURCES.md](13_REGISTRE_SOURCES.md)** — T1 = peer-reviewed solide (chémotype McPartland, cinétique de décarboxylation, PPFD/DLI), T4 = savoir de praticien à valider empiriquement (écosystème HashCru), `contested` = deux positions scientifiques opposées à ne jamais trancher unilatéralement (entourage effect, CBN sédatif), hors échelle = estimation qualitative (marché mondial).
- **Avant de développer une nouvelle configuration/dropdown** : vérifier dans [10_ANOMALIES_CODE_MORT.md](10_ANOMALIES_CODE_MORT.md) que le fichier de données visé est bien celui réellement utilisé en production, puis consulter le registre consolidé de [11_TRACABILITE_ET_EXTENSIBILITE.md](11_TRACABILITE_ET_EXTENSIBILITE.md) pour la liste priorisée des ajouts recommandés.
- **Principe non négociable** (brief méthodologique) : un nom de cultivar/variété n'est **jamais** un prédicteur fiable de composition chimique ou d'effet — toujours rattacher au chémotype mesuré (`Cultivar.chemotype`) plutôt qu'au nom déclaratif.

## Constat transversal le plus important

Trois familles de référentiels riches existent dans le code mais **ne sont pas exploitées dans le formulaire réel** :
1. `cannabinoids.js` (18 cannabinoïdes dont formes acides THCA/CBDA) — seuls 4 (THC/CBD/CBG/CBC) sont saisissables.
2. `terpenes.js` (20 terpènes documentés, sur >200 recensés scientifiquement dans l'espèce) — le profil terpénique n'est aujourd'hui qu'un upload de fichier, jamais une saisie structurée.
3. `purificationSidebarContent.js` (17 méthodes de purification niveau laboratoire) — jamais branché dans un flux de review.

Ce sont les trois leviers les plus directs pour rapprocher l'app de la pratique réelle d'un certificat d'analyse (COA) de laboratoire et enrichir la recherche/filtrage par profil chimique. Le registre complet et priorisé de toutes les recommandations (y compris les techniques HashCru vérifiées et le chémotype "Type V" manquant) est dans [11_TRACABILITE_ET_EXTENSIBILITE.md](11_TRACABILITE_ET_EXTENSIBILITE.md).
