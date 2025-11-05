// Catalogues de choix thématiques pour accélérer la saisie
export const choiceCatalog = {
    typesCulture: [
        "Indoor", "Outdoor", "Greenhouse", "Living Soil",
        "Culture en terre naturelle", "Culture en substrat de coco",
        "Culture en perlite", "Culture en laine de roche",
        "Hydroponie Deep Water Culture (DWC)",
        "Hydroponie à flux et reflux (Ebb and Flow)",
        "Hydroponie goutte-à-goutte", "Aéroponie haute pression",
        "Aéroponie basse pression", "Culture verticale en tours",
        "NFT (Nutrient Film Technique)", "Autre"
    ],
    TypesSpectre: [
        "Complet", "Far-red", "Mint green", "Blanc froid", "Blanc chaud",
        "UV-A", "UV-B", "HPS", "Autre"
    ],
    techniquesPropagation: [
        "Bouturage", "Semis", "Culture de tissus", "Greffage", "Autre"
    ],
    engraisOrganiques: [
        "Fumiers compostés", "Compost végétal", "Tourteaux de ricin",
        "Tourteaux de neem", "Guano de chauve-souris", "Émulsion de poisson",
        "Farines d'os et de sang", "Algues marines (kelp)", "Mélasses", "Autre"
    ],
    engraisMineraux: [
        "Solutions nutritives NPK", "Nitrate de calcium",
        "Phosphate monopotassique", "Sulfate de magnésium",
        "Chélates de fer", "Solutions hydroponiques complètes", "Autre"
    ],
    additifsStimulants: [
        "Stimulateurs racinaires", "Enzymes digestives", "Trichoderma",
        "Mycorrhizes", "Acides humiques et fulviques", "Régulateurs de pH", "Autre"
    ],
    separationTypes: [
        "Tamisage WPFF (Whole Plant Fresh Frozen)",
        "Tamisage à l'eau glacée (Bubble Hash)",
        "Tamisage à la glace carbonique (Ice Hash)",
        "Tamisage à sec (Dry)", "Tamisage à sec congelé (Ice Dry)",
        "Séparation électrostatique (Static)", "Friction manuelle (Charas)",
        "Séparation par densité", "Décantation", "Autre"
    ],
    extractionSolvants: [
        "Extraction à l'éthanol (EHO)",
        "Extraction à l'alcool isopropylique (IPA)",
        "Extraction à l'acétone (AHO)", "Extraction au butane (BHO)",
        "Extraction a l'isobutane (IHO)", "Extraction au propane (PHO)",
        "Extraction à l'hexane (HHO)",
        "Extraction aux huiles végétales (coco, olive)",
        "Extraction au CO₂ supercritique", "Autre"
    ],
    extractionSansSolvants: [
        "Pressage à chaud (Rosin)", "Pressage à froid",
        "Extraction par ultrasons (UAE)",
        "Extraction assistée par micro-ondes (MAE)",
        "Extraction avec tensioactifs (Tween 20)", "Autre"
    ],
    dureeEffet: ["<15min", "<30min", "<1h", "<2h", "2h+"]
};

// Structures complètes pour chaque type de produit
export const productStructures = {
    Fleur: {
        sections: [
            {
                title: "📋 Informations générales",
                fields: [
                    { key: "holderName", label: "Nom commercial", type: "text", required: true },
                    { key: "cultivars", label: "Cultivar", type: "text" },
                    { key: "breeder", label: "Breeder de la graine", type: "text" },
                    { key: "farm", label: "Farm", type: "text" },
                    { key: "typeCulture", label: "Type de culture", type: "select", choices: choiceCatalog.typesCulture },
                    { key: "spectre", label: "Spectre lumineux", type: "select", choices: choiceCatalog.TypesSpectre }
                ]
            },
            {
                title: "📸 Photos",
                fields: [
                    { key: "images", label: "Photos (1-4)", type: "images", required: true }
                ]
            },
            {
                title: "🌱 Plan cultural",
                fields: [
                    { key: "techniquesPropagation", label: "Techniques de propagation", type: "multiselect", choices: choiceCatalog.techniquesPropagation },
                    { key: "engraisOrganiques", label: "Engrais organiques", type: "multiselect", choices: choiceCatalog.engraisOrganiques },
                    { key: "engraisMineraux", label: "Engrais minéraux", type: "multiselect", choices: choiceCatalog.engraisMineraux },
                    { key: "additifsStimulants", label: "Additifs & stimulants", type: "multiselect", choices: choiceCatalog.additifsStimulants }
                ]
            },
            {
                title: "👁️ Visuel et Technique",
                fields: [
                    { key: "densite", label: "Densité", type: "slider", max: 10 },
                    { key: "trichome", label: "Trichome", type: "slider", max: 10 },
                    { key: "pistil", label: "Pistil", type: "slider", max: 10 },
                    { key: "manucure", label: "Manucure", type: "slider", max: 10 }
                ]
            },
            {
                title: "🌸 Odeurs & Arômes",
                fields: [
                    { key: "aromas", label: "Sélection d'arômes", type: "wheel" }
                ]
            },
            {
                title: "👅 Saveurs",
                fields: [
                    { key: "tastes", label: "Sélection de saveurs", type: "wheel" }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "effects", label: "Sélection d'effets", type: "effects" }
                ]
            },
            {
                title: "💭 Expérience & Notes",
                fields: [
                    { key: "description", label: "Votre expérience complète", type: "textarea", rows: 5 },
                    { key: "overallRating", label: "Note globale", type: "slider", max: 10, default: 5 }
                ]
            }
        ]
    },

    Hash: {
        sections: [
            {
                title: "📋 Informations générales",
                fields: [
                    { key: "holderName", label: "Nom commercial", type: "text", required: true },
                    { key: "hashmaker", label: "Hash Maker", type: "text" }
                ]
            },
            {
                title: "📸 Photos",
                fields: [
                    { key: "images", label: "Photos (1-4)", type: "images", required: true }
                ]
            },
            {
                title: "🌱 Cultivars & Matières",
                fields: [
                    {
                        key: "cultivarsList",
                        label: "Cultivars utilisés (détaillé)",
                        type: "cultivar-list",
                        matiereChoices: ["Fleurs fraîches", "Fleurs sèches", "Trim", "Larf", "Sugar Leaves", "Autre"]
                    }
                ]
            },
            {
                title: "🧪 Pipeline de Séparation",
                fields: [
                    {
                        key: "pipelineSeparation",
                        label: "Process de séparation",
                        type: "pipeline-with-cultivars",
                        choices: choiceCatalog.separationTypes,
                        cultivarsSource: "cultivarsList"
                    }
                ]
            },
            {
                title: "👁️ Visuel & Technique",
                fields: [
                    { key: "couleurTransparence", label: "Couleur/Transparence", type: "slider", max: 10 },
                    { key: "pureteVisuelle", label: "Pureté visuelle", type: "slider", max: 10 },
                    { key: "densite", label: "Densité", type: "slider", max: 10 }
                ]
            },
            {
                title: "🌸 Odeurs",
                fields: [
                    { key: "aromas", label: "Sélection d'arômes", type: "wheel" }
                ]
            },
            {
                title: "👅 Saveurs",
                fields: [
                    { key: "tastes", label: "Sélection de saveurs", type: "wheel" }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "effects", label: "Sélection d'effets", type: "effects" }
                ]
            },
            {
                title: "💭 Expérience & Notes",
                fields: [
                    { key: "description", label: "Votre expérience complète", type: "textarea", rows: 5 },
                    { key: "overallRating", label: "Note globale", type: "slider", max: 10, default: 5 }
                ]
            }
        ]
    },

    Concentré: {
        sections: [
            {
                title: "📋 Informations générales",
                fields: [
                    { key: "holderName", label: "Nom commercial", type: "text", required: true },
                    {
                        key: "typeExtraction", label: "Type d'extraction", type: "select",
                        choices: ["Rosin", "Live Resin", "Wax", "Crumble", "Sauce", "Distillate", "Diamonds", "RSO", "Shatter", "Budder", "Sand"]
                    }
                ]
            },
            {
                title: "📸 Photos",
                fields: [
                    { key: "images", label: "Photos (1-4)", type: "images", required: true }
                ]
            },
            {
                title: "🌱 Cultivars & Matières",
                fields: [
                    {
                        key: "cultivarsList",
                        label: "Cultivars utilisés (détaillé)",
                        type: "cultivar-list",
                        matiereChoices: ["Fleurs fraîches", "Fleurs sèches", "Trim", "Trichomes", "Hash", "Larf", "Autre"]
                    }
                ]
            },
            {
                title: "🧪 Pipeline d'Extraction",
                fields: [
                    {
                        key: "pipelineExtraction",
                        label: "Process d'extraction",
                        type: "pipeline-with-cultivars",
                        choices: [...choiceCatalog.extractionSolvants, ...choiceCatalog.extractionSansSolvants],
                        cultivarsSource: "cultivarsList"
                    },
                    { key: "purgevide", label: "Purge à vide", type: "checkbox" }
                ]
            },
            {
                title: "👁️ Visuel & Technique",
                fields: [
                    { key: "couleur", label: "Couleur / Transparence", type: "slider", max: 10 },
                    { key: "viscosite", label: "Viscosité", type: "slider", max: 10 },
                    { key: "pureteVisuelle", label: "Pureté visuelle", type: "slider", max: 10 },
                    { key: "melting", label: "Melting", type: "slider", max: 10 }
                ]
            },
            {
                title: "🌸 Odeurs",
                fields: [
                    { key: "aromas", label: "Sélection d'arômes", type: "wheel" }
                ]
            },
            {
                title: "👅 Saveurs",
                fields: [
                    { key: "tastes", label: "Sélection de saveurs", type: "wheel" }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "effects", label: "Sélection d'effets", type: "effects" }
                ]
            },
            {
                title: "💭 Expérience & Notes",
                fields: [
                    { key: "description", label: "Votre expérience complète", type: "textarea", rows: 5 },
                    { key: "overallRating", label: "Note globale", type: "slider", max: 10, default: 5 }
                ]
            }
        ]
    },

    Comestible: {
        sections: [
            {
                title: "📋 Informations générales",
                fields: [
                    { key: "holderName", label: "Nom du produit", type: "text", required: true },
                    { key: "marque", label: "Marque / Producteur", type: "text" },
                    {
                        key: "typeComestible", label: "Type de produit", type: "select",
                        choices: ["Pâtisserie", "Confiserie", "Boisson", "Capsule", "Huile", "Chocolat", "Bonbon", "Gélule", "Autre"]
                    }
                ]
            },
            {
                title: "📸 Photos",
                fields: [
                    { key: "images", label: "Photos (1-4)", type: "images", required: true }
                ]
            },
            {
                title: "🧪 Infusion Cannabis",
                fields: [
                    { key: "cultivars", label: "Cultivars utilisés", type: "text" },
                    {
                        key: "typeExtrait", label: "Type d'extrait", type: "select",
                        choices: ["Distillat", "Rosin", "RSO/FECO", "Beurre de Marrakech", "Huile infusée", "Isolat", "Autre"]
                    },
                    { key: "thcMg", label: "THC (mg)", type: "number", max: 1000 },
                    { key: "cbdMg", label: "CBD (mg)", type: "number", max: 1000 }
                ]
            },
            {
                title: "👅 Expérience gustative",
                fields: [
                    { key: "apparence", label: "Apparence", type: "slider", max: 10 },
                    { key: "gout", label: "Goût", type: "slider", max: 10 },
                    { key: "texture", label: "Texture", type: "slider", max: 10 },
                    { key: "qualiteAlimentaire", label: "Qualité globale", type: "slider", max: 10 }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "effects", label: "Sélection d'effets", type: "effects" }
                ]
            },
            {
                title: "💭 Expérience & Notes",
                fields: [
                    { key: "description", label: "Votre expérience complète", type: "textarea", rows: 5 },
                    { key: "overallRating", label: "Note globale", type: "slider", max: 10, default: 5 }
                ]
            }
        ]
    }
};
