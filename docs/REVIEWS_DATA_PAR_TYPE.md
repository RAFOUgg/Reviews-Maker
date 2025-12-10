# Données des reviews — par type de produit

Ce document énumère, en français, les champs de données recommandés pour les reviews selon le type de produit. Il sert de référence pour le frontend, le backend et la base de données.

**Remarques générales**
- Tous les types partagent un socle commun de métadonnées (auteur, date, visibilités, notes globales, images, likes, etc.).
- Pour chaque champ j'indique : **nom suggéré** (format JSON / colonne DB), **type**, **description / règles**.
- Les noms sont des suggestions ; adaptez-les au schéma existant (`reviews` table, `review_likes`, etc.).

**Socle commun (champs partagés)**
- **reviewId**: string | Identifiant unique de la review (UUID ou entier selon DB).
- **productId**: string | Référence au produit évalué (peut être null si review libre).
- **productType**: string | Type de produit (ex: "Fleur", "Concentré", "Comestible", "Huile", "Vape", "Topique").
- **title**: string | Titre court de la review.
- **body**: string | Texte principal de la review.
- **authorId**: string | Référence à l'utilisateur auteur.
- **authorName**: string | Affichage public du nom (ou pseudonyme).
- **createdAt**: datetime | Date de création.
- **updatedAt**: datetime | Date de dernière modification.
- **visibility**: string | Ex: "public", "private", "staff".
- **likesCount**: integer | Nombre de likes.
- **images**: array[string] | URLs vers images associées (photoversion, thumbnails).
- **attachments**: array[object] | Fichiers supplémentaires (nom, url, type).
- **globalRating**: number | Note globale (ex. 0–10 ou 0–5 selon convention).
- **ratings**: object | Notes détaillées (voir champs ci-dessous).
- **tags**: array[string] | Étiquettes libres (ex: "terpene-rich", "indica-dominant").
- **moderationStatus**: string | Ex: "pending", "approved", "rejected".
- **meta**: object | Données libres / extension (JSONB) pour champs non standards.

**Structure recommandée pour `ratings` (sous `ratings` object)**
- **visual**: number | Apparence, aspect (0–10).
- **aroma**: number | Odeurs/arômes.
- **taste**: number | Goût.
- **texture**: number | Texture, consistance.
- **effectiveness**: number | Effets (puissance, onset, durée) — générique.
- **potency**: number | Puissance ressentie (si applicable).

---------------------------------

**1) Fleur (flower / bud)**
- **productType**: "Fleur"
- Champs spécifiques :
  - **cultivarName**: string | Nom du cultivar/variété.
  - **brand**: string | Marque/producteur.
  - **thcPct**: number | % THC (si disponible).
  - **cbdPct**: number | % CBD.
  - **terpeneProfile**: array[object] | Liste de terpènes (nom, % ou score).
  - **harvestDate**: date | Date de récolte (si connue).
  - **growMethod**: string | Ex: "Indoor", "Outdoor", "Greenhouse".
  - **culturePlan**: object | Champs issus de l'UI "Plan cultural & Engraissage" :
    - **typeCulture**: string | Ex: "Hydroponie", "Soleil", "Culture intérieure".
    - **lightSpectrum**: string | Spectre lumineux utilisé.
    - **substrateComposition**: array[object] | Composants et pourcentages (ex: vermiculite 30%).
  - **curing**: object | Détails de séchage et cure (durée, méthode).
  - **moistureContent**: number | Pourcentage d'humidité.
  - **visualNotes**: string | Ex: trichomes, densité des buds.

Exemple JSON minimal pour `Fleur`:
{
  "productType": "Fleur",
  "cultivarName": "Gelato #33",
  "thcPct": 21.3,
  "terpeneProfile": [{"name":"Limonene","pct":0.7}],
  "ratings": {"visual":8.5,"aroma":9},
  "culturePlan": {"typeCulture":"Indoor","lightSpectrum":"FullSpectrum"}
}

---------------------------------

**2) Concentré (shatter, wax, rosin, etc.)**
- **productType**: "Concentré"
- Champs spécifiques :
  - **extractionMethod**: string | Ex: "Butane", "CO2", "Rosin", "Ethanol".
  - **solventUsed**: string | Si extraction solventée.
  - **purgeQuality**: string | Ex: "low", "good", "traces" (ou note numérique).
  - **consistency**: string | Ex: "Shatter", "Wax", "Budder", "Rosin".
  - **terpeneRetention**: number | Estimation de conservation des terpènes.
  - **residualSolvents**: object | Résidus mesurés (si lab).
  - **yield**: string | Rendement (optionnel).

Exemple JSON `Concentré`:
{
  "productType": "Concentré",
  "extractionMethod": "Rosin",
  "consistency": "Rosin",
  "ratings": {"taste":8,"potency":9}
}

---------------------------------

**3) Comestible (edible)**
- **productType**: "Comestible"
- Champs spécifiques :
  - **dosePerUnitMg**: number | mg THC/CBD par unité.
  - **unitsPerPackage**: integer | Nombre d'unités.
  - **totalThcMg**: number | Total THC du paquet.
  - **onset**: string | Ex: "30–90 min".
  - **duration**: string | Ex: "3–6 h".
  - **ingredients**: array[string] | Liste d'ingrédients.
  - **flavor**: string | Goût principal.
  - **safetyNotes**: string | Renseignements / allergènes.

Exemple JSON `Comestible`:
{
  "productType": "Comestible",
  "dosePerUnitMg": 10,
  "unitsPerPackage": 10,
  "ratings": {"effectiveness":7,"taste":6}
}

---------------------------------

**4) Huile / Teinture (oil, tincture)**
- **productType**: "Huile"
- Champs spécifiques :
  - **thcPerMl**: number | mg/ml.
  - **cbdPerMl**: number | mg/ml.
  - **carrierOil**: string | Ex: "MCT", "Olive", "HempSeed".
  - **administration**: string | Sub-lingual, ingestion, topique.
  - **flavor**: string | Si aromatisée.

---------------------------------

**5) Vape / Cartridge**
- **productType**: "Vape"
- Champs spécifiques :
  - **cartridgeType**: string | Ex: "510", "POD".
  - **thcPct**: number | % THC ou mg.
  - **carrier**: string | Ex: "PG/VG", "MCT".
  - **coilType**: string | Si pertinent.
  - **tankCompatibility**: string | Notes sur compatibilité.

---------------------------------

**6) Topique (crème, baume)**
- **productType**: "Topique"
- Champs spécifiques :
  - **formulationBase**: string | Ex: "huile", "gel", "crème".
  - **intendedUse**: string | Ex: "douleur", "peau".
  - **absorption**: string | Rapidité d'absorption.

---------------------------------

**Champs opérationnels / modération / analytics**
- **reportsCount**: integer | Nombre de signalements.
- **flagReasons**: array[string] | Raisons de signalement.
- **language**: string | Langue du contenu.
- **geo**: object | Informations géographiques (si collectées).
- **engagement**: object | vues, partages, commentairesCount.

---------------------------------

**Recommandations d'implémentation**
- Conserver un objet `specifics` ou `typeData` (JSONB) dans la table `reviews` pour champs propres au `productType` afin d'éviter schémas rigides.
- Valider en frontend les champs obligatoires par type (ex: `dosePerUnitMg` obligatoire pour `Comestible`).
- Ajouter des endpoints backend pour normaliser (ex: extractionMethod normalisée via énumération).
- Documenter les unités (%, mg, mg/ml, échelle des notes) pour la cohérence.

---------------------------------

Si vous souhaitez, je peux :
- Générer un JSON Schema par type (fichier `schemas/review-*.json`).
- Adapter les noms de champs au schéma DB existant dans le projet.
- Créer des composants UI/forms sur le frontend (`client/src/...`) pour chaque type.


---
Fichier créé automatiquement : `docs/REVIEWS_DATA_PAR_TYPE.md` — modifiez-moi si vous voulez des formats supplémentaires (CSV, JSON Schema, ERD).
