# Référentiel de données — Reviews-Maker

> Objectif : lister **chaque donnée** capturée par l'application (des arbres généalogiques génétiques jusqu'à la dernière section des comestibles), avec pour chacune ses **valeurs/configurations possibles** (pour alimenter des menus déroulants), une **vérification de véracité scientifique**, et le contexte marché/technologique/laboratoire qui entoure ces données. Produit à partir d'une double extraction exhaustive du code réel (pas de la documentation historique, qui peut être datée) + de connaissances de domaine (cannabis science, agronomie, chimie analytique, marché).
>
> Date de production : 2026-07-06. Sources : lecture directe de `server-new/prisma/schema.prisma`, et extraction exhaustive par exploration de code de tous les fichiers `client/src/data/*.js` et `client/src/config/*.js` pertinents.

## Sommaire

1. **[01_FLEURS.md](01_FLEURS.md)** — 11 sections du formulaire Fleur (Infos générales, Génétiques, Culture, Récolte, Analytiques, Visuel, Odeurs, Texture, Goûts, Effets, Curing)
2. **[02_HASH.md](02_HASH.md)** — 9 sections du formulaire Hash (Infos générales, Séparation, Analytiques, Visuel, Odeurs, Texture, Goûts, Effets, Curing)
3. **[03_CONCENTRES.md](03_CONCENTRES.md)** — 9 sections du formulaire Concentré (Infos générales, Extraction, Analytiques, Visuel, Odeurs, Texture, Goûts, Effets, Curing)
4. **[04_COMESTIBLES.md](04_COMESTIBLES.md)** — 4 sections du formulaire Comestible (Infos générales, Recette, Goûts, Effets)
5. **[05_GENETIQUE_GENEALOGIE.md](05_GENETIQUE_GENEALOGIE.md)** — Système PhenoHunt (arbres généalogiques, nœuds, arêtes, bibliothèque de cultivars), avec le point critique sur la validité scientifique de la classification Indica/Sativa vs chémotype
6. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md)** — Les 6 pipelines partagés (Culture, Curing, Séparation, Extraction, Purification, Recette) avec vérification scientifique de chaque paramètre
7. **[07_MARCHE_MONDIAL.md](07_MARCHE_MONDIAL.md)** — Segmentation du marché, panorama réglementaire par région, tendances, débouchés médicaux reconnus
8. **[08_TECHNOLOGIES.md](08_TECHNOLOGIES.md)** — Avancées technologiques culture/extraction/formulation/IA
9. **[09_LABORATOIRES_MATERIEL.md](09_LABORATOIRES_MATERIEL.md)** — Analyses de laboratoire (COA), normes/certifications, matériel de culture/post-récolte/extraction
10. **[10_ANOMALIES_CODE_MORT.md](10_ANOMALIES_CODE_MORT.md)** — Fichiers de données orphelins, pipelines non branchés, bugs de contenu — **à lire avant toute implémentation** pour ne pas travailler sur du code mort

## Comment utiliser ce référentiel

- **Pour construire un menu déroulant** : chercher le champ dans le document du produit concerné (01-04) ou du système transverse concerné (05-06) — chaque champ liste ses options exactes telles qu'elles existent dans le code aujourd'hui.
- **Pour vérifier la véracité d'une donnée** : les sections "Commentaire scientifique" de chaque document indiquent ce qui est solidement établi (ex. chémotype, PPFD/DLI, décarboxylation), ce qui est une heuristique de terrain utile mais approximative (ex. couleur des trichomes), et ce qui est une classification commerciale sans base scientifique stricte (ex. Indica/Sativa).
- **Avant de développer une nouvelle configuration/dropdown** : vérifier dans [10_ANOMALIES_CODE_MORT.md](10_ANOMALIES_CODE_MORT.md) que le fichier de données visé est bien celui réellement utilisé en production (plusieurs doublons orphelins existent).

## Constat transversal le plus important

Trois familles de référentiels riches existent dans le code mais **ne sont pas exploitées dans le formulaire réel** :
1. `cannabinoids.js` (18 cannabinoïdes dont formes acides THCA/CBDA) — seuls 4 (THC/CBD/CBG/CBC) sont saisissables.
2. `terpenes.js` (20 terpènes documentés) — le profil terpénique n'est aujourd'hui qu'un upload de fichier, jamais une saisie structurée.
3. `purificationSidebarContent.js` (17 méthodes de purification niveau laboratoire) — jamais branché dans un flux de review.

Ce sont les trois leviers les plus directs pour rapprocher l'app de la pratique réelle d'un certificat d'analyse (COA) de laboratoire et enrichir la recherche/filtrage par profil chimique — cf. les documents concernés pour le détail de chaque piste.
