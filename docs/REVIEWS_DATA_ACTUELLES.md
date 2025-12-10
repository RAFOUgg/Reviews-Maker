# Données actuelles des reviews (extraction du code)

Ce document recense les champs de données réellement utilisés par l'implémentation actuelle (backend `server-new/` et frontend `client/`). Il est basé sur l'analyse de `server-new/utils/validation.js`, `server-new/utils/reviewFormatter.js`, `server-new/routes/reviews.js` et un exemple frontend `client/tmp_review_detail.json`.

**Remarque**: les champs listés ci‑dessous correspondent aux noms réellement lus/écrits par le backend et attendus par le frontend.

---

## Socle commun (champs principaux)
- `id` : string — Identifiant de la review (UUID / CUID selon validation).
- `holderName` : string — Titre / nom de la review (obligatoire d'après validation).
- `type` : string — Type de produit (les valeurs validées incluent `'Fleur'`, `'Hash'`, `'Rosin'`, `'Concentré'`).
- `description` : string|null — Texte libre.
- `note` : number|null — Note globale (champ enregistré côté DB sous `note`, peut venir aussi d'`overallRating`).
- `overallRating` : (exposé parfois dans `extraData`) — valeur facultative fournie par le frontend.
- `createdAt` / `updatedAt` : datetime — Horodatages.
- `authorId` : string — Référence à l'auteur.
- `author` : object — Objet auteur inclus par les routes (id, username, avatar, discordId).
- `isPublic` : boolean — Visibilité publique.
- `isPrivate` : boolean — Marqueur privé.
- `images` : JSON string (stocke un tableau) — Liste des noms de fichiers images (ex: `"review-...jpg"`).
- `mainImage` : string — Nom du fichier principal.
- `mainImageUrl` / `thumbnailUrl` : string (calculés) — URLs résolues côté serveur (/images/...).
- `extraData` : JSON string — Stocke champs additionnels non listés explicitement (orchard, preview, etc.).

## Champs de notation et évaluations
- `ratings` : JSON string/object — Notes détaillées (ex: visual, aroma, taste...). Converti / parsé par `reviewFormatter`.
- `categoryRatings` : JSON string/object — Variante/section de notes par catégorie.
- `sectionScores` / `computedOverall` : calculés par `reviewFormatter` (non persistés automatiquement).

## Champs JSON / tableaux (stockés en DB en tant que JSON string par `prepareReviewData`)
Ces champs sont explicitement parsés et préparés :
- `terpenes` : array — Profil de terpènes.
- `tastes` : array — Notes de goût.
- `aromas` : array — Notes d'arôme.
- `effects` : array — Effets listés.
- `substratMix` : array — Composition du substrat (frontend montre `substratMix`).
- `cultivarsList` : array — Liste des cultivars liés.
- `pipelineExtraction` : object|null — Pipeline d'extraction (concentrés), mis en JSON.
- `pipelineSeparation` : object|null — Étapes de séparation/purification.
- `images` : array — Liste d'images (convertie en string pour stockage), see above.
- `extraData` : object — Objet libre (orchard presets, preview keys, overallRating, etc.).
- `categoryRatings` : object — autre objet de notes.

## Champs texte simples (validation via `simpleTextFields`)
- `strainType` : string|null
- `hashmaker` : string|null
- `breeder` : string|null
- `farm` : string|null
- `cultivars` : string|null  (champ texte libre)
- `dureeEffet` : string|null

## Champs booléens
- `isPublic` : boolean
- `isPrivate` : boolean
- `purgevide` : boolean

## Champs numériques
- `indicaRatio` : number|null — ratio indica (0-100)
- `note` / `overallRating` : number (échelle 0-10 attendue, le code accepte aussi 0-5 et 0-100 et normalise)

## Champs d'image / upload
- `images` : upload via `multipart/form-data` (multer), stockés sur disque dans `db/review_images/`.
- `mainImage` : premier élément de `images` si fourni.
- `existingImages` : champ utilisé lors d'un PUT pour conserver certaines images (peut être stringifié JSON ou tableau).
- `preferredMain` : optionnel, permet de choisir l'image principale lors d'un update (format `new:INDEX` ou filename).

## Champs présents dans l'exemple frontend (`client/tmp_review_detail.json`)
Le fichier d'exemple illustre des champs additionnels présents en pratique — souvent persistés dans `extraData` ou comme colonnes :
- `toucheDensite`, `toucheFriabilite`, `toucheElasticite`, `toucheHumidite`, `toucheTexture`, `toucheMalleabilite`, `toucheCollant`, etc. (nombres ou textes qualitatifs)
- `aromasPiquant`, `aromasIntensity`, `tastesIntensity`, `goutIntensity`, `effectsIntensity`
- `typeCulture`, `spectre`, `substratSysteme`, `techniquesPropagation`, `engraisOrganiques`, `engraisMineraux`, `additifsStimulants`
- `densite`, `trichome`, `pistil`, `manucure`, `moisissure`, `graines`, `couleurTransparence`, `pureteVisuelle`, `couleur`
- `viscosite`, `melting`, `residus`, `intensiteAromatique`, `notesDominantesOdeur`, `notesSecondairesOdeur`, `fideliteCultivars`
- `durete`, `densiteTexture`, `elasticite`, `collant`, `friabiliteViscosite`, `meltingResidus`, `aspectCollantGras`, `viscositeTexture`
- `dryPuff`, `inhalation`, `expiration`, `intensiteFumee`, `agressivite`, `cendre`, `textureBouche`, `douceur`, `intensite`, `montee`, `intensiteEffet`, `intensiteEffets`, `typeEffet`, `dureeEffet`
- `purificationPipeline`, `fertilizationPipeline`, `recipe`

Ces champs apparaissent dans les objets JSON manipulés côté client et sont pris en charge par la logique serveur via `extraData` ou des colonnes JSON dédiées (ex: `substratMix`, `pipelineExtraction`).

## Liaisons / relations
- `likes` : relation via `prisma.reviewLike` (table `reviewLike`) — utilisée pour calculer `likesCount`, `dislikesCount` et l'état de like pour l'utilisateur.
- `author` : relation user (inclus `id`, `username`, `avatar`, `discordId`).

## Règles importantes observées dans le code
- `holderName` est requis (validation côté serveur).
- `type` est requis et doit faire partie d'une énumération (`['Fleur','Hash','Rosin','Concentré']` dans `validation.js`).
- Le backend accepte et stocke de nombreux champs libres dans `extraData` pour préserver la compatibilité et éviter un schéma trop rigide.
- Les tableaux/objets sont persistés en tant que JSON strings; `prepareReviewData` s'assure que les champs listés sont stringifiés.
- `images` doivent contenir au moins une image lors de la création (POST).
- `note`/`overallRating` sont normalisés côté `reviewFormatter` pour produire `computedOverall` (échelle 0-10).

---

## Proposition d'action suivante (au choix)
- Générer automatiquement un document plus structuré (`CSV` ou `JSON Schema`) à partir des champs détectés.
- Lister précisément quelles colonnes existent dans la table `review` (si vous voulez, je peux lire le fichier `prisma/schema.prisma` ou la migration correspondante pour confirmer les types SQL exacts).
- Adapter `docs/REVIEWS_DATA_PAR_TYPE.md` pour refléter ces noms de champs réels (je peux fusionner les deux docs).

Souhaitez-vous que je :
- crée un `JSON Schema` pour validation côté frontend/backend ?
- inspecte `prisma/schema.prisma` ou les migrations pour extraire les types SQL exacts ?
- génère un fichier de mapping entre `extraData` keys et colonnes persistées ?

Faites-moi savoir la prochaine étape à automatiser et je la lance.
