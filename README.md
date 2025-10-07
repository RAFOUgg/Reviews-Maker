# Reviews Maker

Studio web ergonomique pour composer, visualiser et exporter des fiches de review produits cannabiniques avec un rendu premium prêt à partager.

## ✨ Points clés

- Assistant de création guidé par type de produit (Hash, Fleur, Concentré, Comestible).
- Interface en 2 étapes : choix du type puis formulaire détaillé.
- Mise en page responsive optimisée desktop avec masquage automatique de l'assistant.
- Indentation uniforme: une ligne par champ (fields-stack) pour une lecture fluide.
- Menus à sélection multiple unifiés pour tous les champs à choix prédéfinis (chips, menu déroulant cliquable).
- Pipelines (séquences ordonnées) avec ajout par menu déroulant cliquable, réordonnables, suppression rapide.
- Système de pipeline de séparation/extraction avec étapes ordonnées.
- Sauvegarde automatique en temps réel des brouillons lors de modifications.
- Distinction claire entre brouillons (auto-sauvegardés) et reviews terminées.
- Système de score global avec affichage visuel des performances.
- Rendu optimisé avec badges de type de produit et barres de progression.
- Calcul automatique des totaux et suivi de progression dynamique.
- Aperçu en temps réel de la fiche de review stylisée.
- Export instantané en PNG haute définition.
- Boutons harmonisés (primaire/secondaire/ghost/danger) et champ fichier stylé.
- Barres de défilement (scrollbars) stylisées et cohérentes.
- Invite de nom intelligent lors de l'enregistrement (prérempli selon le type et les champs clés).
- Raccourcis clavier dédiés (Ctrl/⌘ + ↑/↓, Ctrl/⌘ + Entrée) pour accélérer la saisie sur PC.

## 🚀 Prise en main

1. Ouvrez `index.html` dans votre navigateur.
    Le bouton de la bibliothèque de reviews sauvegardées/brouillons s'affiche en haut à droite.
    Les dernières reviews enregistrées et brouillons sont visible en galerie sous l'assistant de création.

2. **Étape 1** : `index.html` Sélectionnez le type de produit (Hash, Fleur, Concentré, Comestible).

3. **Étape 2** : `review.html` s'ouvre avec les blocs adaptés au type choisi.
    - Formulaire dynamique avec sections et champs adaptés. + barre de progression de la review.
    - Aperçu en temps réel de la fiche de review stylisée avec bascule compact/complète et modal d'aperçu.

4. Renseignez les informations dans le formulaire (sauvegarde automatique en temps réel).

5. Cliquez sur **Enregistrer** pour marquer votre review comme terminée et complète.

6. Utilisez le bouton **Exporter en image** pour récupérer votre livrable final.

7. Le logo/branding en haut à gauche renvoie vers `index.html`.
(Si des infos étaient renseignées sans que la review soit enregistrée, elles seront sauvegardées comme brouillon).

8. Depuis `index.html` il est possible de visualiser la bibliothèque complète des reviews et brouillons, de les éditer ou supprimer. Lors de l'édition, il ne faut modifier et sauvegarder que les champs nécessaires.
> **Astuce** : Les reviews en cours d'édition sont automatiquement sauvegardées comme brouillons. Utilisez le bouton *Bibliothèque* pour consulter vos reviews et brouillons. (Ou depuis l'aperçu compact sous l'assistant de création).
> **Raccourcis** : `Ctrl/⌘ + ↑/↓` change la section active, `Ctrl/⌘ + Entrée` déclenche la génération.

## Technique de filtrations nécessitant une indication particulière
    // Catalogues de choix thématiques pour accélérer la saisie
const choiceCatalog = {
  // WEED : Cannabis
  typesCulture: [
    "Indoor",
    "Outdoor",
    "Greenhouse",
    "Living Soil",
    "Culture en terre naturelle",
    "Culture en substrat de coco",
    "Culture en perlite",
    "Culture en laine de roche",
    "Hydroponie Deep Water Culture (DWC)",
    "Hydroponie à flux et reflux (Ebb and Flow)",
    "Hydroponie goutte-à-goutte",
    "Aéroponie haute pression",
    "Aéroponie basse pression",
    "Culture verticale en tours",
    "NFT (Nutrient Film Technique)",
    "Autre"
  ],
  // TYPE DE SPECTRE LUMINEUX 
  TypesSpectre: [
    "Complet",
    "Far-red",
    "Mint green",
    "Blanc froid",
    "Blanc chaud",
    "UV-A",
    "UV-B",
    "HPS",
    "Autre"
  ],
  // Substrats & systèmes de culture
  substratsSystemes: [
    "Culture en terre naturelle",
    "Culture en substrat de coco",
    "Culture en perlite",
    "Culture en laine de roche",
    "Hydroponie Deep Water Culture (DWC)",
    "Hydroponie à flux et reflux (Ebb and Flow)",
    "Hydroponie goutte-à-goutte",
    "Aéroponie haute pression",
    "Aéroponie basse pression",
    "Culture verticale en tours",
    "NFT (Nutrient Film Technique)",
    "Autre"
  ],
  // Techniques de propagation (ajoutées car référencées dans README)
  techniquesPropagation: [
    "Bouturage",
    "Semis",
    "Culture de tissus",
    "Greffage",
    "Autre"
  ],
  // Engrais & additifs
  engraisOrganiques: [
    "Fumiers compostés",
    "Compost végétal",
    "Tourteaux de ricin",
    "Tourteaux de neem",
    "Guano de chauve-souris",
    "Émulsion de poisson",
    "Farines d'os et de sang",
    "Algues marines (kelp)",
    "Mélasses",
    "Autre"
  ],
  engraisMineraux: [
    "Solutions nutritives NPK",
    "Nitrate de calcium",
    "Phosphate monopotassique",
    "Sulfate de magnésium",
    "Chélates de fer",
    "Solutions hydroponiques complètes",
    "Autre"
  ],
  additifsStimulants: [
    "Stimulateurs racinaires",
    "Enzymes digestives",
    "Trichoderma",
    "Mycorrhizes",
    "Acides humiques et fulviques",
    "Régulateurs de pH",
    "Autre"
  ],
  // Méthodes d'extraction (pour les concentrés)
  extractionSolvants: [
    "Extraction à l'éthanol (EHO)",
    "Extraction à l'alcool isopropylique (IPA)",
    "Extraction à l'acétone (AHO)",
    "Extraction au butane (BHO)",
    "Extraction a l'isobutane (IHO)",
    "Extraction au propane (PHO)",
    "Extraction à l'hexane (HHO)",
    "Extraction aux huiles végétales (coco, olive)",
    "Extraction au CO₂ supercritique",
    "Autre"
  ],
  extractionSansSolvants: [
    "Pressage à chaud (Rosin)",
    "Pressage à froid",
    "Extraction par ultrasons (UAE)",
    "Extraction assistée par micro-ondes (MAE)",
    "Extraction avec tensioactifs (Tween 20)",
    "Autre"
  ],
  // Techniques d'extraction avancées (regroupe certaines méthodes spécifiques)
  extractionAvancees: [
    "Extraction par ultrasons (UAE)",
    "Extraction assistée par micro-ondes (MAE)",
    "Extraction avec tensioactifs (Tween 20)"
  ],
  // Types de séparation (pour les hashs)
  separationTypes: [
    "Tamisage WPFF (Whole Plant Fresh Frozen)",
    "Tamisage à l'eau glacée (Bubble Hash)",
    "Tamisage à la glace carbonique (Ice Hash)",
    "Tamisage à sec (Dry)",
    "Tamisage à sec congelé (Ice Dry)",
    "Séparation électrostatique (Static)",
    "Friction manuelle (Charas)",
    "Séparation par densité",
    "Décantation",
    "Autre"
  ],
  // Purifications & séparations (pour les concentrés uniquement)
  purificationsAvancees: [
    "Recristallisation",
    "Sublimation",
    "Extraction liquide-liquide",
    "Adsorption sur charbon actif",
    "Filtration membranaire",
    "Autre"
  ],
  // Listes manquantes mentionnées par README pour hash/concentré
  separationsChromato: [
    "Chromatographie sur colonne",
    "Flash Chromatography",
    "HPLC",
    "GC",
    "TLC",
    "Autre"
  ],
  fractionnement: [
    "Winterisation",
    "Décarboxylation",
    "Fractionnement par température",
    "Fractionnement par solubilité",
    "Autre"
  ],
  separationsPhysiques: [
    "Filtration",
    "Centrifugation",
    "Décantation",
    "Séchage sous vide",
    "Autre"
  ]
};

// Structures de données pour chaque type de produit avec prises en charge des choix rapides
const productStructures = {
  Hash: {
    sections: [
      {
        title: "Informations générales",
        fields: [
          { key: "cultivars", label: "Cultivars de la/les matière(s) organique(s)", type: "text" },
          { key: "breeder", label: "Breeders de la/les graine(s)", type: "text" },
          { key: "farm", label: "Farm(s)", type: "text" },
          {
            key: "matiereVegetale",
            label: "Type de matière végétale",
            type: "multiple-choice",
            choices: ["Fleurs fraîches", "Fleurs sèches", "Trim", "Autre"]
          },
          {
            key: "pipelineSeparation",
            label: "Pipeline de séparation (ordre des étapes)",
            type: "sequence",
            choices: choiceCatalog.separationTypes
          },
          { key: "hashmaker", label: "Hash Maker", type: "text" },
          { key: "photo", label: "Photo", type: "file" }
        ]
      },
      {
        title: "Post-traitement & purification",
        fields: [
          {
            key: "separationsChromato",
            label: "Séparations chromatographiques",
            type: "text",
            choices: choiceCatalog.separationsChromato
          },
          {
            key: "fractionnement",
            label: "Techniques de fractionnement",
            type: "text",
            choices: choiceCatalog.fractionnement
          },
          {
            key: "separationsPhysiques",
            label: "Séparations physiques",
            type: "text",
            choices: choiceCatalog.separationsPhysiques
          },
          {
            key: "purificationsAvancees",
            label: "Purifications avancées",
            type: "text",
            choices: choiceCatalog.purificationsAvancees
          }
        ]
      },
      {
        title: "Visuel & Technique",
        fields: [
          { key: "couleurTransparence", label: "Couleur/transparence", type: "number", max: 10 },
          { key: "pureteVisuelle", label: "Pureté visuelle", type: "number", max: 10 },
          { key: "densite", label: "Densité", type: "number", max: 10 },
        ],
        total: true,
        totalKeys: ["couleurTransparence","pureteVisuelle", "densite"]
      },
      {
        title: "Odeur",
        fields: [
          { key: "intensiteAromatique", label: "Intensité aromatique", type: "number", max: 10 },
          { key: "notesDominantesOdeur", label: "Notes dominantes", type: "textarea" },
          { key: "notesSecondairesOdeur", label: "Notes secondaires", type: "textarea" },
          { key: "fideliteCultivars", label: "Fidélité au cultivars", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["intensiteAromatique", "fideliteCultivars"]
      },
      {
        title: "Texture",
        fields: [
          { key: "durete", label: "Dureté", type: "number", max: 10 },
          { key: "densite", label: "Densité", type: "number", max: 10 },
          { key: "friabiliteViscosite", label: "Friabilité/Viscosité", type: "number", max: 10 },
          { key: "meltingResidus", label: "Melting/Résidus", type: "number", max: 10 },
          { key: "aspectCollantGras", label: "Aspect collant/gras", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["durete", "densite", "friabiliteViscosite", "meltingResidus", "aspectCollantGras"]
      },
      {
        title: "Goûts & expériences fumée",
        fields: [
          { key: "dryPuff", label: "Notes (dry puff/tirage à sec/froid)", type: "textarea" },
          { key: "inhalation", label: "Notes (inhalation)", type: "textarea" },
          { key: "expiration", label: "Notes (expiration)", type: "textarea" },
          { key: "intensiteFumee", label: "Intensité", type: "number", max: 10 },
          { key: "agressivite", label: "Agressivité/piquant", type: "number", max: 10 }
          { key: "cendre", label: "Cendre", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["intensiteFumee", "agressivite", "cendre"]
      },
      {
        title: "Effet",
        fields: [
          { key: "montee", label: "Montée (rapidité)", type: "number", max: 10 },
          { key: "intensiteEffet", label: "Intensité", type: "number", max: 10 },
          { key: "typeEffet", label: "Type d'effet", type: "textarea" },
          { 
            key: "duree", 
            label: "Durée", 
            type: "multiple-choice",
            choices: ["<15min", "<30min", "<1h", "<2h", "2h+"]
          }
        ],
        total: true,
        totalKeys: ["montee", "intensiteEffet"]
      }
    ]
  },
  Fleur: {
    sections: [
      {
        title: "Informations générales",
        fields: [
          { key: "cultivars", label: "Cultivars", type: "text" },
          { key: "breeder", label: "Breeder de la graines", type: "text" },
          { key: "farm", label: "Farm", type: "text" },
          {
            key: "typeCulture",
            label: "Type de culture",
            type: "text",
            choices: choiceCatalog.typesCulture
          },
          { key: "spectre", label: "Spectre", type: "text", choices: choiceCatalog.TypesSpectre },
          { key: "photo", label: "Photo", type: "file" }
        ]
      },
      {
        title: "Plan cultural",
        fields: [
          {
            key: "substratSysteme",
            label: "Substrats & systèmes culturaux",
            type: "text",
            choices: choiceCatalog.substratsSystemes
          },
          {
            key: "techniquesPropagation",
            label: "Techniques de propagation",
            type: "text",
            choices: choiceCatalog.techniquesPropagation
          },
          {
            key: "engraisOrganiques",
            label: "Engrais organiques",
            type: "multiple-choice",
            choices: choiceCatalog.engraisOrganiques
          },
          {
            key: "engraisMineraux",
            label: "Engrais minéraux",
            type: "multiple-choice",
            choices: choiceCatalog.engraisMineraux
          },
          {
            key: "additifsStimulants",
            label: "Additifs & stimulants",
            type: "multiple-choice",
            choices: choiceCatalog.additifsStimulants
          }
        ]
      },
      {
        title: "Visuel",
        fields: [
          { key: "densite", label: "Densité", type: "number", max: 10 },
          { key: "trichome", label: "Trichome", type: "number", max: 10 },
          { key: "pistil", label: "Pistil", type: "number", max: 10 },
          { key: "manucure", label: "Manucure", type: "number", max: 10 },
        ],
        total: true,
        totalKeys: ["densite", "trichome", "pistil", "manucure"]
      },
      {
        title: "Odeur",
        fields: [
          { key: "intensiteOdeur", label: "Intensité", type: "number", max: 10 },
          { key: "notesDominantesOdeur", label: "Notes dominantes", type: "textarea" },
          { key: "notesSecondairesOdeur", label: "Notes secondaires", type: "textarea" }
        ],
        total: true,
        totalKeys: ["intensiteOdeur"]
      },
      {
        title: "Texture",
        fields: [
          { key: "durete", label: "Dureté", type: "number", max: 10 },
          { key: "densiteTexture", label: "Densité", type: "number", max: 10 },
          { key: "elasticite", label: "Élasticité", type: "number", max: 10 },
          { key: "collant", label: "Collant", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["durete", "densiteTexture", "elasticite", "collant"]
      },
      {
        title: "Goûts & Expérience fumée",
        fields: [
          { key: "dryPuff", label: "Notes (dry puff/tirage à sec/froid)", type: "textarea" },
          { key: "inhalation", label: "Notes (inhalation)", type: "textarea" },
          { key: "expiration", label: "Notes (expiration)", type: "textarea" },
          { key: "intensiteFumee", label: "Intensité", type: "number", max: 10 },
          { key: "agressivite", label: "Agressivité/piquant", type: "number", max: 10 },
          { key: "cendre", label: "Cendre", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["intensiteFumee", "agressivite", "cendre"]
      },
      {
        title: "Effet",
        fields: [
          { key: "montee", label: "Montée", type: "number", max: 10 },
          { key: "intensiteEffet", label: "Intensité", type: "number", max: 10 },
          { key: "typeEffet", label: "Type d'effet", type: "textarea" },
          { 
            key: "duree", 
            label: "Durée", 
            type: "multiple-choice",
            choices: ["<15min", "<30min", "<1h", "<2h", "2h+"]
          }
        ],
        total: true,
        totalKeys: ["montee", "intensiteEffet"]
      }
    ]
  },
  Concentré: {
    sections: [
      {
        title: "Informations générales",
        fields: [
          { key: "cultivars", label: "Cultivars de la/les matière(s) organique(s)", type: "text" },
          { key: "farm", label: "Farm(s) / Producteur(s)", type: "text" },
          {
            key: "typeExtraction",
            label: "Type d'extraction",
            type: "text",
            choices: Array.from(
              new Set([
                "Rosin",
                "Live Resin",
                "Wax",
                "Crumble",
                "Sauce",
                "Distillate",
                "Diamonds",
                "RSO",
                "Shatter",
                "Budder",
                "Wax",
                "Budder",
                "Sand",

              ])
            )
          },
          {
            key: "pipelineExtraction",
            label: "Pipeline extraction/séparation (ordre)",
            type: "sequence",
            choices: Array.from(new Set([
              ...choiceCatalog.separationTypes,
              ...choiceCatalog.extractionSansSolvants,
              ...choiceCatalog.extractionSolvants,
              ...choiceCatalog.extractionAvancees
            ]))
          },
          { key: "purgevide", label: "Purge à vide", type: "boolean" },
          { key: "photo", label: "Photo", type: "file" }
        ]
      },
      // Section "Procédés d'extraction" supprimée car redondante avec la section 01
      {
        title: "Purification & séparation",
        fields: [
          {
            key: "separationsChromato",
            label: "Séparations chromatographiques",
            type: "text",
            choices: choiceCatalog.separationsChromato
          },
          {
            key: "fractionnement",
            label: "Techniques de fractionnement",
            type: "text",
            choices: choiceCatalog.fractionnement
          },
          {
            key: "separationsPhysiques",
            label: "Séparations physiques",
            type: "text",
            choices: choiceCatalog.separationsPhysiques
          },
          {
            key: "purificationsAvancees",
            label: "Purifications avancées",
            type: "text",
            choices: choiceCatalog.purificationsAvancees
          }
        ]
      },
      {
        title: "Visuel & Technique",
        fields: [
          { key: "couleur", label: "Couleur / Transparence", type: "number", max: 10 },
          { key: "viscosite", label: "Viscosité", type: "number", max: 10 },
          { key: "pureteVisuelle", label: "Pureté visuelle", type: "number", max: 10 },
          { key: "odeur", label: "Odeur", type: "number", max: 10 },
          { key: "melting", label: "Melting", type: "number", max: 10 },
          { key: "residus", label: "Résidus", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["couleur", "viscosite", "pureteVisuelle", "odeur", "melting", "residus"]
      },
      {
        title: "Odeur",
        fields: [
          { key: "intensiteAromatique", label: "Intensité aromatique", type: "number", max: 10 },
          { key: "notesDominantesOdeur", label: "Notes dominantes", type: "textarea" },
          { key: "notesSecondairesOdeur", label: "Notes secondaires", type: "textarea" },
          { key: "fideliteCultivars", label: "Fidélité au cultivars", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["intensiteAromatique", "fideliteCultivars"]
      },
      {
        title: "Goût",
        fields: [
          { key: "intensiteAromatique", label: "Intensité aromatique", type: "number", max: 10 },
          { key: "dryPuff", label: "Notes (dry puff/tirage à sec/froid)", type: "textarea" },
          { key: "inhalation", label: "Notes (inhalation)", type: "textarea" },
          { key: "expiration", label: "Notes (expiration)", type: "textarea" },
          { key: "notesDominantes", label: "Notes dominantes", type: "textarea" },
          { key: "notesSecondaires", label: "Notes secondaires", type: "textarea" },
        ],
        total: true,
        totalKeys: ["intensiteAromatique"]
      },
      {
        title: "Texture",
        fields: [
          { key: "durete", label: "Dureté", type: "number", max: 10 },
          { key: "densiteTexture", label: "Densité", type: "number", max: 10 },
          { key: "viscositeTexture", label: "Viscosité", type: "number", max: 10 },
          { key: "collant", label: "Collant", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["durete", "densiteTexture", "viscositeTexture", "collant"]
      },
      {
        title: "Expérience Inhalation",
        fields: [
          { key: "textureBouche", label: "Texture en bouche", type: "number", max: 10 },
          { key: "douceur", label: "Douceur / Agressivité", type: "number", max: 10 },
          { key: "intensite", label: "Intensité", type: "number", max: 10 },
          { key: "intensiteFumee", label: "Intensité", type: "number", max: 10 },
          { key: "agressivite", label: "Agressivité/piquant", type: "number", max: 10 },
          { key: "cendre", label: "Cendre", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["textureBouche", "douceur", "intensite"]
      },
      {
        title: "Effet",
        fields: [
          { key: "montee", label: "Montée", type: "number", max: 10 },
          { key: "intensiteEffets", label: "Intensité des effets", type: "number", max: 10 },
          { key: "typeEffet", label: "Type d'effet", type: "textarea" },
          { 
            key: "duree", 
            label: "Durée", 
            type: "multiple-choice",
            choices: ["<15min", "<30min", "<1h", "<2h", "2h+"]
          }
        ],
        total: true,
        totalKeys: ["montee", "intensiteEffets", "duree"]
      }
    ]
  }
  ,
  Comestible: {
    sections: [
      {
        title: "Informations générales",
        fields: [
          { key: "productName", label: "Nom du produit", type: "text" },
          { key: "marque", label: "Marque / Producteur / Cuisinier", type: "text" },
          { key: "typeComestible", label: "Type de produit", type: "text", choices: [
            "Pâtisserie", "Confiserie", "Boisson", "Capsule", "Huile", "Chocolat", "Bonbon", "Gélule", "Autre"
          ] },
          { key: "ingredients", label: "Ingrédients principaux (hors cannabis)", type: "textarea" },
          { key: "infoDiet", label: "Informations diététiques", type: "multiple-choice", choices: [
            "Vegan", "Sans gluten", "Sans sucre", "Sans lactose", "Bio", "Halal", "Kasher"
          ] },
          { key: "photo", label: "Photo du produit", type: "file" }
        ]
      },
      {
        title: "Informations sur l'infusion",
        fields: [
          { key: "matiere", label: "Matière première cannabis utilisée", type: "text" },
          { key: "cultivars", label: "Cultivars (variété)", type: "text" },
          { key: "typeExtrait", label: "Type d'extrait pour l'infusion", type: "multiple-choice", choices: [
            "Distillat", "Rosin", "RSO/FECO", "Beurre de Marrakech", "Huile infusée", "Isolat", "Autre"
          ] },
          { key: "thcMg", label: "THC (mg)", type: "number", max: 1000 },
          { key: "cbdMg", label: "CBD (mg)", type: "number", max: 1000 },
          { key: "autresCanna", label: "Autres cannabinoïdes (mg)", type: "number", max: 1000 },
          { key: "terpenes", label: "Profil terpénique (si connu)", type: "textarea" }
        ]
      },
      {
        title: "Expérience gustative & sensorielle",
        fields: [
          { key: "experience", label: "Le comestible — description", type: "textarea" },
          { key: "apparence", label: "Apparence", type: "number", max: 10 },
          { key: "intensiteOdeur", label: "Intensité odeur", type: "number", max: 10 },
          { key: "gout", label: "Goût", type: "number", max: 10 },
          { key: "notesDominantes", label: "Notes dominantes", type: "textarea" },
          { key: "notesCannabis", label: "Notes de cannabis", type: "textarea" },
          { key: "equilibreSaveurs", label: "Équilibre des saveurs", type: "textarea" },
          { key: "texture", label: "Texture", type: "number", max: 10 },
          { key: "qualiteAlimentaire", label: "Qualité globale du produit alimentaire", type: "number", max: 10 }
        ],
        total: true,
        totalKeys: ["apparence","intensiteOdeur","gout","texture","qualiteAlimentaire"]
      },
      {
        title: "Effets & expérience psychotrope",
        fields: [
          { key: "dosagePris", label: "Dosage pris", type: "text" },
          { key: "tempsMontee", label: "Temps de montée", type: "text", choices: ["<30min","30-60min","60-90min","90min+"] },
          { key: "intensiteMax", label: "Intensité maximale", type: "number", max: 10 },
          { key: "plateau", label: "Plateau (durée de l'effet principal)", type: "text", choices: ["<1h","1-2h","2-4h","4h+"] },
          { key: "typeEffet", label: "Type d'effet", type: "textarea" }
        ],
        total: true,
        totalKeys: ["intensiteMax"]
      }
    ]
  }
};


## 🧱 Structure du projet

```
Reviews-Maker/
├── index.html                    # Page d'accueil avec sélection du type
├── review.html                   # Éditeur de review avec formulaire dynamique
├── gallery.html                  # Galerie complète des reviews
├── admin.html                    # Page d'administration
├── app.js                        # Logique métier et interactions dynamiques
├── styles.css                    # Thème graphique et responsive design
├── server/                       # Backend Node.js + Express
│   ├── server.js                 # API REST pour reviews et authentification
│   ├── ecosystem.config.cjs      # Configuration PM2 pour production
│   ├── package.json              # Dépendances Node.js
│   ├── tokens/                   # Tokens de session utilisateur
│   └── README.md                 # Documentation du backend
├── db/                           # Base de données et images
│   ├── reviews.sqlite            # Base SQLite (généré automatiquement)
│   └── review_images/            # Images uploadées
└── docs/                         # Documentation
    ├── README.md                 # Ce guide
    ├── INTEGRATION_LAFONCEDALLE_API.md         # Doc intégration API
    └── DEPLOIEMENT_INTEGRATION_LAFONCEDALLE.md # Guide de déploiement
```

## 🔐 Authentification et synchronisation

Reviews-Maker s'intègre avec **LaFoncedalleBot** pour l'authentification des utilisateurs :

- **Base de données partagée** : LaFoncedalleBot gère les utilisateurs Discord et leurs emails
- **Service de mailing** : LaFoncedalleBot envoie les codes de vérification
- **Flux simplifié** :
  1. L'utilisateur entre son email
  2. Reviews-Maker vérifie via l'API LaFoncedalleBot si l'email est lié à Discord
  3. Un code est envoyé par email via LaFoncedalleBot
  4. L'utilisateur entre le code pour activer son compte
  5. Le compte est nommé avec le pseudo Discord

**Documentation complète** :
- API Integration : [INTEGRATION_LAFONCEDALLE_API.md](INTEGRATION_LAFONCEDALLE_API.md)
- Guide de déploiement : [DEPLOIEMENT_INTEGRATION_LAFONCEDALLE.md](DEPLOIEMENT_INTEGRATION_LAFONCEDALLE.md)

## 🔧 Personnalisation

- Ajoutez ou ajustez des sections/critères dans `app.js` via l'objet `productStructures`.
- Affinez la palette ou les effets visuels dans `styles.css` (variables CSS en tête de fichier).
- Pour des intégrations externes (base de données, API), greffez-vous sur la fonction `saveReview()`.
- Pour modifier le comportement de l'aperçu (modal/colonne), voyez `setupEditorPageEvents()` et `togglePreviewMode()`.
- Les pipelines utilisent un composant "dropdown-adder" réutilisant le style du multi-select.

## 📋 Prérequis & compatibilité

- Aucune dépendance serveur ou build : un simple navigateur moderne suffit.
- `html2canvas` est chargé via CDN pour l'export d'images.
- Pour exécuter des vérifications syntaxiques JS en local, installez Node.js (`node --check app.js`).

Bonnes reviews ! 🌿


TODOLIST :
- [ ] Faire en sorte que le bouton Réinitialiser demande confirmation si des données ont été saisies. Puis qu'il remette à zero tout les zone de séléction (y compris les pipelines) etc...
- [ ] Afficher/Masquer l'aperçu en modal depuis le bouton d'entête.
- [ ] Activer le bouton Astuce (popover/modal)
- [ ] Ouvrir la bibliothèque depuis review.html (comme sur l'accueil)
- [ ] Dans le contenu détaillé, "Informations du produit" inclut le type sélectionné (Hash, Fleur, Concentré, Comestible)

## Nettoyage V1

Dans le cadre de la préparation de la V1, un petit nettoyage a été effectué pour retirer des copies de sauvegarde obsolètes présentes dans la racine du projet. Cela n'affecte aucune fonctionnalité : les fichiers actifs sont toujours `index.html`, `review.html`, `app.js`, `styles.css` et le dossier `server/`.

Fichiers supprimés :

- `review_backup.html`
- `review_propre.html`

Pourquoi :

- Ces fichiers étaient des copies historiques/non référencées par le code. Les supprimer réduit le bruit dans le dépôt et évite les confusions.

Vérifications recommandées après nettoyage :

1. Rechercher d'éventuelles références : utilisez votre éditeur ou `git grep review_backup.html review_propre.html`.
2. Ouvrir `index.html` et `review.html` dans un navigateur et vérifier le flux (choisir un type → remplissage → aperçu/export).
3. Optionnel : si vous utilisez le backend, testez l'API :
  - cd server
  - npm install
  - npm start

Si vous préférez conserver des copies historiques, utilisez git (tags/branches) au lieu de fichiers `*_backup.html` dans la racine.

Besoin d'aide ? Je peux scanner le dépôt pour d'autres artefacts non référencés et proposer un nettoyage additionnel ou générer un petit script `scripts/clean.(sh|ps1)` pour automatiser cette étape.
