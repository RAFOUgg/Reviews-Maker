export const choiceCatalog = {
    // Ingrédients cuisine (Comestible)
    ingredientsCuisine: [
        // Matières grasses
        "Beurre",
        "Beurre clarifié (ghee)",
        "Huile d'olive",
        "Huile de coco",
        "Huile de tournesol",
        "Huile d'avocat",
        "Huile de sésame",
        "Margarine",
        "Graisse végétale",
        "Crème fraîche",
        "Crème liquide",
        "Lait entier",
        "Lait végétal (amande, soja, avoine)",
        // Farines et céréales
        "Farine de blé",
        "Farine complète",
        "Farine d'amande",
        "Farine de coco",
        "Fécule de maïs",
        "Fécule de pomme de terre",
        "Flocons d'avoine",
        "Riz",
        "Quinoa",
        "Pâtes",
        // Sucres et édulcorants
        "Sucre blanc",
        "Sucre roux",
        "Cassonade",
        "Sucre glace",
        "Miel",
        "Sirop d'érable",
        "Sirop d'agave",
        "Stévia",
        // Œufs et produits laitiers
        "Œufs",
        "Fromage (type au choix)",
        "Parmesan",
        "Mozzarella",
        "Fromage à la crème",
        "Yaourt nature",
        "Yaourt grec",
        // Chocolat et cacao
        "Chocolat noir",
        "Chocolat au lait",
        "Chocolat blanc",
        "Poudre de cacao",
        "Pépites de chocolat",
        // Fruits et légumes
        "Bananes",
        "Pommes",
        "Citrons",
        "Oranges",
        "Fraises",
        "Framboises",
        "Myrtilles",
        "Mangue",
        "Ananas",
        "Tomates",
        "Oignons",
        "Ail",
        "Gingembre",
        "Carottes",
        "Épinards",
        // Fruits secs et noix
        "Amandes",
        "Noix",
        "Noisettes",
        "Cacahuètes",
        "Noix de cajou",
        "Pistaches",
        "Raisins secs",
        "Dattes",
        "Figues séchées",
        // Épices et aromates
        "Sel",
        "Poivre noir",
        "Cannelle",
        "Vanille (extrait ou gousse)",
        "Muscade",
        "Gingembre en poudre",
        "Cardamome",
        "Clou de girofle",
        "Curcuma",
        "Paprika",
        "Piment de Cayenne",
        "Basilic",
        "Thym",
        "Romarin",
        "Menthe",
        "Coriandre",
        // Agents levants
        "Levure chimique",
        "Levure de boulanger",
        "Bicarbonate de soude",
        // Autres
        "Gélatine",
        "Agar-agar",
        "Lécithine de soja",
        "Poudre à flan",
        "Confiture",
        "Nutella",
        "Beurre de cacahuète",
        "Autre (personnalisé)"
    ],
    // Actions de protocole (Comestible) - Structure avancée
    actionsProtocole: [
        {
            name: "Préchauffer le four",
            needsTemp: true,
            tempRange: [100, 250],
            defaultTemp: 180,
            category: "temperature"
        },
        {
            name: "Décarboxyler",
            needsTemp: true,
            needsDuration: true,
            tempRange: [100, 130],
            defaultTemp: 115,
            durationRange: [20, 45],
            defaultDuration: 30,
            category: "cannabis"
        },
        {
            name: "Infuser dans la matière grasse",
            needsTemp: true,
            needsDuration: true,
            tempRange: [60, 100],
            defaultTemp: 80,
            durationRange: [60, 360],
            defaultDuration: 120,
            category: "cannabis"
        },
        {
            name: "Faire fondre au bain-marie",
            needsPrecision: true,
            precisions: ["Feu doux", "Feu moyen", "Jusqu'à texture lisse", "En remuant"],
            category: "cuisson"
        },
        {
            name: "Faire fondre au micro-ondes",
            needsDuration: true,
            durationRange: [0.5, 5],
            defaultDuration: 2,
            needsPrecision: true,
            precisions: ["Puissance maximale", "Puissance moyenne", "Par intervalles de 30s"],
            category: "cuisson"
        },
        {
            name: "Cuire au four",
            needsTemp: true,
            needsDuration: true,
            tempRange: [140, 240],
            defaultTemp: 180,
            durationRange: [10, 90],
            defaultDuration: 30,
            needsPrecision: true,
            precisions: ["Chaleur tournante", "Chaleur statique", "Jusqu'à coloration dorée"],
            category: "cuisson"
        },
        {
            name: "Laisser mijoter",
            needsDuration: true,
            durationRange: [5, 180],
            defaultDuration: 20,
            needsPrecision: true,
            precisions: ["Feu doux", "Feu moyen", "À couvert", "Sans couvercle", "En remuant régulièrement"],
            category: "cuisson"
        },
        {
            name: "Chauffer",
            needsPrecision: true,
            precisions: ["Feu doux", "Feu moyen", "Feu vif", "Jusqu'à ébullition", "Jusqu'à frémissement"],
            category: "temperature"
        },
        {
            name: "Laisser refroidir",
            needsDuration: true,
            durationRange: [5, 120],
            defaultDuration: 15,
            needsPrecision: true,
            precisions: ["À température ambiante", "Sur grille", "Dans le moule"],
            category: "refroidissement"
        },
        {
            name: "Réfrigérer",
            needsDuration: true,
            durationRange: [30, 1440],
            defaultDuration: 120,
            needsPrecision: true,
            precisions: ["À couvert", "Film alimentaire", "Jusqu'à prise", "Minimum 2h", "Une nuit"],
            category: "refroidissement"
        },
        {
            name: "Congeler",
            needsDuration: true,
            durationRange: [60, 1440],
            defaultDuration: 240,
            needsPrecision: true,
            precisions: ["Dans contenant hermétique", "Jusqu'à prise complète"],
            category: "refroidissement"
        },
        {
            name: "Laisser reposer",
            needsDuration: true,
            durationRange: [5, 60],
            defaultDuration: 10,
            needsPrecision: true,
            precisions: ["À température ambiante", "À couvert"],
            category: "preparation"
        },
        {
            name: "Mélanger les ingrédients secs",
            needsPrecision: true,
            precisions: ["Au fouet", "À la cuillère", "Jusqu'à homogénéité"],
            category: "melange"
        },
        {
            name: "Mélanger les ingrédients liquides",
            needsPrecision: true,
            precisions: ["Au fouet", "À la cuillère", "Jusqu'à homogénéité"],
            category: "melange"
        },
        {
            name: "Incorporer délicatement",
            needsPrecision: true,
            precisions: ["Avec une maryse", "Mouvement du bas vers le haut", "Sans trop mélanger"],
            category: "melange"
        },
        {
            name: "Fouetter énergiquement",
            needsDuration: true,
            durationRange: [1, 10],
            defaultDuration: 3,
            needsPrecision: true,
            precisions: ["Au fouet manuel", "Au batteur électrique", "Jusqu'à obtenir des pics"],
            category: "melange"
        },
        {
            name: "Battre les œufs",
            needsPrecision: true,
            precisions: ["En omelette", "En neige", "Avec le sucre jusqu'à blanchiment"],
            category: "melange"
        },
        {
            name: "Remuer",
            needsPrecision: true,
            precisions: ["Constamment", "De temps en temps", "Toutes les 5 minutes", "Régulièrement"],
            category: "melange"
        },
        {
            name: "Ajouter progressivement",
            needsPrecision: true,
            precisions: ["En 3 fois", "En pluie", "Petit à petit en mélangeant"],
            category: "melange"
        },
        {
            name: "Émulsionner",
            needsPrecision: true,
            precisions: ["Au fouet", "Au blender", "Jusqu'à texture homogène"],
            category: "melange"
        },
        {
            name: "Faire revenir",
            needsDuration: true,
            durationRange: [2, 15],
            defaultDuration: 5,
            needsPrecision: true,
            precisions: ["Feu doux", "Feu moyen", "Feu vif", "Jusqu'à translucidité", "Jusqu'à coloration"],
            category: "cuisson"
        },
        {
            name: "Faire dorer",
            needsDuration: true,
            durationRange: [2, 10],
            defaultDuration: 5,
            needsPrecision: true,
            precisions: ["Feu moyen", "Feu vif", "Des deux côtés"],
            category: "cuisson"
        },
        {
            name: "Faire caraméliser",
            needsDuration: true,
            durationRange: [5, 20],
            defaultDuration: 10,
            needsPrecision: true,
            precisions: ["Feu doux", "Feu moyen", "Sans brûler", "En remuant"],
            category: "cuisson"
        },
        {
            name: "Filtrer",
            needsPrecision: true,
            precisions: ["À travers un tamis fin", "À travers une étamine", "À travers un filtre à café"],
            category: "preparation"
        },
        {
            name: "Passer au tamis",
            needsPrecision: true,
            precisions: ["Tamis fin", "Tamis moyen", "En pressant avec une maryse"],
            category: "preparation"
        },
        {
            name: "Verser dans un moule",
            needsPrecision: true,
            precisions: ["Moule beurré et fariné", "Moule chemisé de papier cuisson", "Moule graissé"],
            category: "preparation"
        },
        {
            name: "Étaler uniformément",
            needsPrecision: true,
            precisions: ["Avec une spatule", "Avec une maryse", "Sur toute la surface"],
            category: "preparation"
        },
        {
            name: "Couvrir",
            needsPrecision: true,
            precisions: ["De papier aluminium", "De film alimentaire", "D'un couvercle", "D'un torchon propre"],
            category: "preparation"
        },
        {
            name: "Assaisonner",
            needsPrecision: true,
            precisions: ["Sel et poivre", "Selon le goût", "Généreusement", "Légèrement"],
            category: "finition"
        },
        {
            name: "Décorer",
            needsPrecision: true,
            precisions: ["Avec du sucre glace", "Avec des fruits", "Avec du chocolat fondu", "Au choix"],
            category: "finition"
        },
        {
            name: "Servir",
            needsPrecision: true,
            precisions: ["Chaud", "Tiède", "Froid", "À température ambiante", "Immédiatement"],
            category: "finition"
        },
        {
            name: "Autre action personnalisée",
            isCustom: true,
            category: "autre"
        }
    ],

    // Précisions générales pour protocole
    precisionsCuisson: [
        "Chaleur tournante",
        "Chaleur statique",
        "Grill activé",
        "Jusqu'à coloration dorée",
        "Jusqu'à ce qu'un cure-dent ressorte sec"
    ],
    precisionsMelange: [
        "Au fouet manuel",
        "Au batteur électrique",
        "À la cuillère en bois",
        "Avec une maryse",
        "Jusqu'à homogénéité",
        "Sans trop mélanger"
    ],
    precisionsRefroidissement: [
        "À température ambiante",
        "Sur grille",
        "Dans le moule",
        "À couvert",
        "Film alimentaire",
        "Une nuit au frigo"
    ],
    // Types de culture (Fleur)
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
    // Types de spectre lumineux
    TypesSpectre: [
        "Soleil",
        "HPS",
        "LED Complet",
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
    // Composants de substrat (pour mélange personnalisé)
    composantsSubstrat: [
        "Terre naturelle",
        "Terreau enrichi",
        "Terre de jardin",
        "Terre argileuse",
        "Terre sableuse",
        "Tourbe blonde",
        "Tourbe brune",
        "Fibre de coco",
        "Coco chips",
        "Perlite",
        "Vermiculite",
        "Laine de roche",
        "Pouzzolane",
        "Billes d'argile (hydroton)",
        "Ponce volcanique",
        "Zéolite",
        "Biochar (charbon végétal)",
        "Compost végétal",
        "Compost de champignon",
        "Fumier composté",
        "Humus de lombric (vermicompost)",
        "Guano",
        "Sphaigne",
        "Écorces compostées",
        "Copeaux de bois",
        "Sciure de bois",
        "Paille",
        "Chanvre (chènevotte)",
        "Lin",
        "Riz (balle de riz)",
        "Mousse de polyuréthane",
        "Laine de verre",
        "Sable horticole",
        "Gravier",
        "Pierre ponce",
        "Mica",
        "Autre"
    ],
    // Techniques de propagation
    techniquesPropagation: [
        "Bouturage",
        "Semis",
        "Culture de tissus",
        "Greffage",
        "Autre"
    ],
    // Engrais organiques
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
    // Engrais minéraux
    engraisMineraux: [
        "Solutions nutritives NPK",
        "Nitrate de calcium",
        "Phosphate monopotassique",
        "Sulfate de magnésium",
        "Chélates de fer",
        "Solutions hydroponiques complètes",
        "Autre"
    ],
    // Additifs & stimulants
    additifsStimulants: [
        "Stimulateurs racinaires",
        "Enzymes digestives",
        "Trichoderma",
        "Mycorrhizes",
        "Acides humiques et fulviques",
        "Régulateurs de pH",
        "Autre"
    ],
    // Méthodes d'extraction avec solvants
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
    // Méthodes d'extraction sans solvants
    extractionSansSolvants: [
        "Pressage à chaud (Rosin)",
        "Pressage à froid",
        "Extraction par ultrasons (UAE)",
        "Extraction assistée par micro-ondes (MAE)",
        "Extraction avec tensioactifs (Tween 20)",
        "Autre"
    ],
    // Techniques d'extraction avancées
    extractionAvancees: [
        "Extraction par ultrasons (UAE)",
        "Extraction assistée par micro-ondes (MAE)",
        "Extraction avec tensioactifs (Tween 20)"
    ],
    // Types de séparation (Hash)
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
    // Purifications avancées
    purificationsAvancees: [
        "Recristallisation",
        "Sublimation",
        "Extraction liquide-liquide",
        "Adsorption sur charbon actif",
        "Filtration membranaire",
        "Autre"
    ],
    // Séparations chromatographiques
    separationsChromato: [
        "Chromatographie sur colonne",
        "Flash Chromatography",
        "HPLC",
        "GC",
        "TLC",
        "Autre"
    ],
    // Techniques de fractionnement
    fractionnement: [
        "Winterisation",
        "Décarboxylation",
        "Fractionnement par température",
        "Fractionnement par solubilité",
        "Autre"
    ],
    // Séparations physiques
    separationsPhysiques: [
        "Filtration",
        "Centrifugation",
        "Décantation",
        "Séchage sous vide",
        "Autre"
    ],
    // Durée des effets
    dureeEffet: [
        "5-15min",
        "15-30min",
        "30min-1h",
        "1h-2h",
        "2h-4h",
        "4h-8h",
        "8h+"
    ],
    // Types de genetics Landrace
    landraceTypes: [
        "Skunk",
        "Haze",
        "OG",
        "Kush",
        "Afghan",
        "Thai",
        "Colombian",
        "Malawi",
        "Durban",
        "Autre"
    ],
    // Textures Hash
    textureHash: [
        "Poudreuse",
        "Sableuse",
        "Crémeuse",
        "Cireuse",
        "Collante",
        "Sèche",
        "Autre"
    ],
    // Textures Concentré
    textureConcentre: [
        "Shatter",
        "Crumble",
        "Budder",
        "Sauce",
        "Diamonds",
        "Live Resin",
        "Rosin",
        "Wax",
        "Autre"
    ],

    // ===========================
    // CURING & MATURATION
    // ===========================

    // Types de curing
    curingTypes: [
        "Froid (<5°C)",
        "Frais (5-15°C)",
        "Température ambiante (15-25°C)",
        "Chaud (>25°C)"
    ],

    // Containers de curing
    curingContainers: [
        "Bocal en verre Mason",
        "Bocal hermétique clip",
        "Pot CVault",
        "Pot Infinity Jar",
        "Sac Grove Bags",
        "Sac sous vide",
        "Tupperware alimentaire",
        "Boîte inox",
        "Boîte bois cèdre",
        "Humidor",
        "Aire libre (séchage)",
        "Autre"
    ],

    // Emballages primaires
    emballagesPrimaires: [
        "Aucun (contact direct)",
        "Cellophane",
        "Papier cuisson",
        "Papier aluminium",
        "Paper hash (papier à hash)",
        "Papier sulfurisé",
        "Sac congélation",
        "Sac sous vide (machine)",
        "Sac sous vide (manuel)",
        "Film alimentaire",
        "Sac antistatique",
        "Autre"
    ],

    // Opacité des récipients
    opaciteRecipients: [
        "Transparent",
        "Semi-transparent",
        "Ambré (UV filter)",
        "Violet (Miron glass)",
        "Semi-opaque",
        "Opaque",
        "Noir total"
    ],

    // Intervalles de suivi curing
    curingTimeframes: [
        { value: "heures", label: "Par heure", maxSteps: 168 },
        { value: "jours", label: "Par jour", maxSteps: 180 },
        { value: "semaines", label: "Par semaine", maxSteps: 52 },
        { value: "mois", label: "Par mois", maxSteps: 24 }
    ],

    // ===========================
    // EXPÉRIENCE UTILISATION
    // ===========================

    // Méthodes de consommation
    methodesConsommation: [
        "Combustion - Joint",
        "Combustion - Blunt",
        "Combustion - Bong",
        "Combustion - Pipe",
        "Combustion - Chicha",
        "Vaporisation - Portable",
        "Vaporisation - Desktop",
        "Dab - Banger quartz",
        "Dab - E-nail",
        "Dab - Puffco/E-rig",
        "Infusion - Tisane",
        "Infusion - Beurre/Huile",
        "Ingestion orale",
        "Sublingual",
        "Topique",
        "Autre"
    ],

    // Effets secondaires
    effetsSecondaires: [
        "Aucun",
        "Bouche sèche",
        "Yeux rouges",
        "Yeux secs",
        "Faim (munchies)",
        "Soif intense",
        "Anxiété légère",
        "Paranoïa légère",
        "Vertiges",
        "Nausées",
        "Maux de tête",
        "Fatigue",
        "Somnolence",
        "Palpitations",
        "Toux",
        "Irritation gorge"
    ],

    // Usages préférés
    usagesPreferes: [
        "Matinée",
        "Journée",
        "Après-midi",
        "Soirée",
        "Nuit/Coucher",
        "Seul",
        "En couple",
        "En petit groupe",
        "En soirée/fête",
        "Médical/Thérapeutique",
        "Créativité/Artistique",
        "Productivité/Focus",
        "Sport/Activité physique",
        "Méditation/Relaxation",
        "Social",
        "Intimité"
    ],

    // Profils d'effets
    profilsEffets: [
        "Anxiolytique",
        "Relaxant",
        "Sédatif",
        "Énergisant",
        "Stimulant",
        "Euphorique",
        "Créatif",
        "Concentré/Focus",
        "Social",
        "Introspectif",
        "Psychédélique léger",
        "Corporel/Body high",
        "Cérébral/Head high"
    ],

    // Début des effets
    debutEffets: [
        "Immédiat (<30s)",
        "Très rapide (30s-2min)",
        "Rapide (2-5min)",
        "Modéré (5-15min)",
        "Progressif (15-30min)",
        "Lent (30min-1h)",
        "Très lent (>1h)"
    ],

    // ===========================
    // PIPELINE CULTURE GLOBAL
    // ===========================

    // Phases de culture prédéfinies
    phasesCulture: [
        { id: "germination", label: "🌱 Germination", defaultDays: 3, color: "#8B5CF6" },
        { id: "plantule", label: "🌿 Plantule", defaultDays: 7, color: "#10B981" },
        { id: "croissance_debut", label: "📈 Début croissance", defaultDays: 14, color: "#34D399" },
        { id: "croissance_milieu", label: "📈 Milieu croissance", defaultDays: 14, color: "#6EE7B7" },
        { id: "croissance_fin", label: "📈 Fin croissance", defaultDays: 14, color: "#A7F3D0" },
        { id: "stretch_debut", label: "🚀 Début stretch", defaultDays: 7, color: "#FCD34D" },
        { id: "stretch_milieu", label: "🚀 Milieu stretch", defaultDays: 7, color: "#FBBF24" },
        { id: "stretch_fin", label: "🚀 Fin stretch", defaultDays: 7, color: "#F59E0B" },
        { id: "floraison_debut", label: "🌸 Début floraison", defaultDays: 14, color: "#F472B6" },
        { id: "floraison_milieu", label: "🌸 Milieu floraison", defaultDays: 21, color: "#EC4899" },
        { id: "floraison_fin", label: "🌸 Fin floraison/Mûrissement", defaultDays: 14, color: "#DB2777" },
        { id: "recolte", label: "✂️ Récolte", defaultDays: 1, color: "#DC2626" }
    ],

    // Types de trame pipeline
    pipelineTimeframes: [
        { value: "jours", label: "Par jour", requiresDates: true },
        { value: "semaines", label: "Par semaine", requiresStart: true },
        { value: "phases", label: "Par phase", usePredefined: true }
    ],

    // Couleurs trichomes (récolte)
    couleursTrichomes: [
        "100% Translucide (trop tôt)",
        "75% Translucide / 25% Laiteux",
        "50% Translucide / 50% Laiteux",
        "25% Translucide / 75% Laiteux",
        "100% Laiteux (pic THC)",
        "90% Laiteux / 10% Ambré",
        "80% Laiteux / 20% Ambré (optimal)",
        "70% Laiteux / 30% Ambré",
        "50% Laiteux / 50% Ambré (sédatif)",
        "30% Laiteux / 70% Ambré (très sédatif)"
    ],

    // Types d'espaces de culture
    typesEspaceCulture: [
        "Armoire de culture",
        "Tente de culture",
        "Placard aménagé",
        "Pièce dédiée",
        "Serre",
        "Balcon/Terrasse",
        "Jardin extérieur",
        "Champ",
        "Container maritime",
        "Autre"
    ],

    // Systèmes d'irrigation
    systemesIrrigation: [
        "Manuel (arrosoir)",
        "Goutte à goutte",
        "Flood and drain (Ebb & Flow)",
        "NFT (Nutrient Film)",
        "DWC (Deep Water Culture)",
        "Aéroponie",
        "Blumat/Autopot (passif)",
        "Irrigation programmée",
        "Wicking (mèche)",
        "Autre"
    ],

    // ===========================
    // TYPES DE COMESTIBLES
    // ===========================

    typesComestibles: [
        "Gâteau/Brownie",
        "Cookie",
        "Bonbon/Gummy",
        "Chocolat",
        "Boisson",
        "Tisane/Infusion",
        "Huile/Teinture",
        "Capsule",
        "Beurre infusé",
        "Miel infusé",
        "Sirop",
        "Sauce/Condiment",
        "Plat cuisiné",
        "Autre"
    ]
};

export const productStructures = {
    Fleur: {
        sections: [
            {
                title: "📋 Informations générales",
                fields: [
                    { key: "holderName", label: "Nom commercial", type: "text", required: true },
                    { key: "cultivars", label: "Cultivar(s)", type: "text" },
                    { key: "breeder", label: "Breeder de la graine", type: "text" },
                    { key: "farm", label: "Farm", type: "text" },
                    { key: "strainType", label: "Type", type: "select", choices: ["Indica", "Hybride Indica", "Équilibré", "Hybride Sativa", "Sativa"] },
                    { key: "images", label: "Photos (1-4)", type: "images", required: true },
                    { key: "description", label: "Commentaire détaillé", type: "textarea", rows: 5 }
                ]
            },
            {
                title: "🌱 Plan cultural & Engraissage",
                fields: [
                    { key: "typeCulture", label: "Type de culture", type: "select", choices: choiceCatalog.typesCulture },
                    { key: "spectre", label: "Spectre lumineux", type: "select", choices: choiceCatalog.TypesSpectre },
                    {
                        key: "substratMix",
                        label: "Composition du substrat personnalisé",
                        type: "substrat-mixer",
                        availableSubstrats: choiceCatalog.composantsSubstrat
                    },
                    { key: "techniquesPropagation", label: "Techniques de propagation", type: "select", choices: choiceCatalog.techniquesPropagation },
                    {
                        key: "fertilizationPipeline",
                        label: "Routine d'engraissage (croissance & floraison)",
                        type: "fertilization-pipeline",
                        availableFertilizers: [
                            ...choiceCatalog.engraisOrganiques,
                            ...choiceCatalog.engraisMineraux,
                            ...choiceCatalog.additifsStimulants
                        ]
                    }
                ]
            },
            {
                title: "👁️ Visuel et Technique",
                fields: [
                    { key: "densiteVisuelle", label: "Densité visuelle", type: "slider", max: 10 },
                    { key: "trichome", label: "Trichomes", type: "slider", max: 10 },
                    { key: "pistil", label: "Pistils", type: "slider", max: 10 },
                    { key: "manucure", label: "Manucure", type: "slider", max: 10 },
                    { key: "moisissure", label: "Moisissure (10=aucune)", type: "slider", max: 10 },
                    { key: "graines", label: "Graines (10=aucune)", type: "slider", max: 10 }
                ]
            },
            {
                title: "👃 Odeurs",
                fields: [
                    { key: "aromasIntensity", label: "Intensité aromatique", type: "slider", max: 10 },
                    { key: "notesDominantesOdeur", label: "Notes dominantes (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "notesSecondairesOdeur", label: "Notes secondaires (max 7)", type: "wheel", maxSelections: 7 }
                ]
            },
            {
                title: "🤚 Texture",
                fields: [
                    { key: "durete", label: "Dureté", type: "slider", max: 10 },
                    { key: "densiteTactile", label: "Densité tactile", type: "slider", max: 10 },
                    { key: "elasticite", label: "Élasticité", type: "slider", max: 10 },
                    { key: "collant", label: "Collant", type: "slider", max: 10 }
                ]
            },
            {
                title: "😋 Goûts",
                fields: [
                    { key: "intensiteFumee", label: "Intensité", type: "slider", max: 10 },
                    { key: "agressivite", label: "Agressivité/piquant", type: "slider", max: 10 },
                    { key: "cendre", label: "Cendre", type: "slider", max: 10 },
                    { key: "dryPuff", label: "Dry puff/tirage à sec (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "inhalation", label: "Inhalation (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "expiration", label: "Expiration/arrière-goût (max 7)", type: "wheel", maxSelections: 7 }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "montee", label: "Montée (rapidité)", type: "slider", max: 10 },
                    { key: "intensiteEffet", label: "Intensité", type: "slider", max: 10 },
                    { key: "effects", label: "Effets", type: "effects" },
                    { key: "dureeEffet", label: "Durée des effets", type: "select", choices: choiceCatalog.dureeEffet }
                ]
            },
            {
                title: "🔥 PipeLine CURING MATURATION",
                fields: [
                    { key: "curingTimeframe", label: "Intervalle de suivi", type: "select", choices: ["heures", "jours", "semaines", "mois"], default: "jours" },
                    { key: "curingDuration", label: "Durée totale (unités)", type: "number", min: 1, max: 365 },
                    { key: "curingType", label: "Type de curing", type: "select", choices: choiceCatalog.curingTypes },
                    { key: "curingTemp", label: "Température moyenne (°C)", type: "number", min: -5, max: 35 },
                    { key: "curingHumidity", label: "Humidité relative (%)", type: "slider", max: 100, default: 62 },
                    { key: "curingContainer", label: "Type de récipient", type: "select", choices: choiceCatalog.curingContainers },
                    { key: "curingEmballage", label: "Emballage primaire", type: "select", choices: choiceCatalog.emballagesPrimaires },
                    { key: "curingOpacite", label: "Opacité récipient", type: "select", choices: choiceCatalog.opaciteRecipients },
                    { key: "curingVolume", label: "Volume occupé (mL)", type: "number", min: 0 },
                    { key: "curingPipeline", label: "Évolution du curing", type: "curing-pipeline" }
                ]
            },
            {
                title: "🧪 Expérience d'utilisation",
                fields: [
                    { key: "consumptionMethod", label: "Méthode de consommation", type: "select", choices: choiceCatalog.methodesConsommation },
                    { key: "dosageUsed", label: "Dosage utilisé (g)", type: "number", step: 0.1, min: 0 },
                    { key: "effectsDurationMinutes", label: "Durée des effets (minutes)", type: "number", min: 0 },
                    { key: "effectsProfile", label: "Profil des effets", type: "multiselect", choices: choiceCatalog.profilsEffets },
                    { key: "sideEffectsExperienced", label: "Effets secondaires", type: "multiselect", choices: choiceCatalog.effetsSecondaires },
                    { key: "effectsOnset", label: "Début des effets", type: "select", choices: choiceCatalog.debutEffets },
                    { key: "preferredUsage", label: "Usage préféré", type: "multiselect", choices: choiceCatalog.usagesPreferes }
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
                    { key: "hashmaker", label: "Hashmaker", type: "text" },
                    { key: "cultivarsList", label: "Cultivars utilisés", type: "cultivar-list", matiereChoices: ["Fleurs fraîches", "Fleurs sèches", "Trim frais", "Trim sec", "Autre"], showBreeder: true },
                    { key: "images", label: "Photos (1-4)", type: "images", required: true },
                    { key: "description", label: "Commentaire détaillé", type: "textarea", rows: 5 }
                ]
            },
            {
                title: "🔬 Pipeline & Séparation",
                fields: [
                    { key: "pipelineSeparation", label: "Type de séparation (ordre des étapes)", type: "pipeline-with-cultivars", choices: choiceCatalog.separationTypes, cultivarsSource: "cultivarsList" },
                    {
                        key: "purificationPipeline", label: "Pipeline de purification", type: "purification-pipeline", availableMethods: [
                            ...choiceCatalog.separationsChromato,
                            ...choiceCatalog.fractionnement,
                            ...choiceCatalog.separationsPhysiques,
                            ...choiceCatalog.purificationsAvancees
                        ]
                    }
                ]
            },
            {
                title: "👁️ Visuel & Technique",
                fields: [
                    { key: "couleurTransparence", label: "Couleur/transparence", type: "slider", max: 10 },
                    { key: "pureteVisuelle", label: "Pureté visuelle", type: "slider", max: 10 },
                    { key: "densiteVisuelle", label: "Densité visuelle", type: "slider", max: 10 },
                    { key: "pistils", label: "Pistils", type: "slider", max: 10 },
                    { key: "moisissure", label: "Moisissure (10=aucune)", type: "slider", max: 10 },
                    { key: "graines", label: "Graines (10=aucune)", type: "slider", max: 10 }
                ]
            },
            {
                title: "👃 Odeurs",
                fields: [
                    { key: "fideliteCultivars", label: "Fidélité au cultivars", type: "slider", max: 10 },
                    { key: "intensiteAromatique", label: "Intensité aromatique", type: "slider", max: 10 },
                    { key: "notesDominantesOdeur", label: "Notes dominantes (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "notesSecondairesOdeur", label: "Notes secondaires (max 7)", type: "wheel", maxSelections: 7 }
                ]
            },
            {
                title: "🤚 Texture",
                fields: [
                    { key: "durete", label: "Dureté", type: "slider", max: 10 },
                    { key: "densiteTactile", label: "Densité tactile", type: "slider", max: 10 },
                    { key: "friabiliteViscosite", label: "Friabilité/Viscosité", type: "slider", max: 10 },
                    { key: "meltingResidus", label: "Melting/Résidus", type: "slider", max: 10 },
                    { key: "aspectCollantGras", label: "Aspect collant/gras", type: "slider", max: 10 }
                ]
            },
            {
                title: "😋 Goûts",
                fields: [
                    { key: "intensiteFumee", label: "Intensité", type: "slider", max: 10 },
                    { key: "agressivite", label: "Agressivité/piquant", type: "slider", max: 10 },
                    { key: "cendre", label: "Cendre", type: "slider", max: 10 },
                    { key: "dryPuff", label: "Dry puff/tirage à sec (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "inhalation", label: "Inhalation (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "expiration", label: "Expiration/arrière-goût (max 7)", type: "wheel", maxSelections: 7 }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "effects", label: "Effets", type: "effects" },
                    { key: "montee", label: "Montée (rapidité)", type: "slider", max: 10 },
                    { key: "intensiteEffet", label: "Intensité", type: "slider", max: 10 },
                    { key: "dureeEffet", label: "Durée des effets", type: "select", choices: choiceCatalog.dureeEffet }
                ]
            },
            {
                title: "🔥 PipeLine CURING MATURATION",
                fields: [
                    { key: "curingTimeframe", label: "Intervalle de suivi", type: "select", choices: ["heures", "jours", "semaines", "mois"], default: "jours" },
                    { key: "curingDuration", label: "Durée totale (unités)", type: "number", min: 1, max: 365 },
                    { key: "curingType", label: "Type de curing", type: "select", choices: choiceCatalog.curingTypes },
                    { key: "curingTemp", label: "Température moyenne (°C)", type: "number", min: -5, max: 35 },
                    { key: "curingHumidity", label: "Humidité relative (%)", type: "slider", max: 100, default: 62 },
                    { key: "curingContainer", label: "Type de récipient", type: "select", choices: choiceCatalog.curingContainers },
                    { key: "curingEmballage", label: "Emballage primaire", type: "select", choices: choiceCatalog.emballagesPrimaires },
                    { key: "curingOpacite", label: "Opacité récipient", type: "select", choices: choiceCatalog.opaciteRecipients },
                    { key: "curingVolume", label: "Volume occupé (mL)", type: "number", min: 0 },
                    { key: "curingPipeline", label: "Évolution du curing", type: "curing-pipeline" }
                ]
            },
            {
                title: "🧪 Expérience d'utilisation",
                fields: [
                    { key: "consumptionMethod", label: "Méthode de consommation", type: "select", choices: choiceCatalog.methodesConsommation },
                    { key: "dosageUsed", label: "Dosage utilisé (g)", type: "number", step: 0.1, min: 0 },
                    { key: "effectsDurationMinutes", label: "Durée des effets (minutes)", type: "number", min: 0 },
                    { key: "effectsProfile", label: "Profil des effets", type: "multiselect", choices: choiceCatalog.profilsEffets },
                    { key: "sideEffectsExperienced", label: "Effets secondaires", type: "multiselect", choices: choiceCatalog.effetsSecondaires },
                    { key: "effectsOnset", label: "Début des effets", type: "select", choices: choiceCatalog.debutEffets },
                    { key: "preferredUsage", label: "Usage préféré", type: "multiselect", choices: choiceCatalog.usagesPreferes }
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
                    { key: "breeder", label: "Extracteur/Breeder", type: "text" },
                    { key: "cultivarsList", label: "Cultivars utilisés", type: "cultivar-list", matiereChoices: ["Fleurs fraîches", "Fleurs sèches", "Trim frais", "Trim sec", "Autre"], showBreeder: true },
                    { key: "images", label: "Photos (1-4)", type: "images", required: true },
                    { key: "description", label: "Commentaire détaillé", type: "textarea", rows: 5 }
                ]
            },
            {
                title: "🔬 Pipeline Extraction",
                fields: [
                    { key: "pipelineExtraction", label: "Méthode d'extraction", type: "pipeline-with-cultivars", choices: [...choiceCatalog.extractionSolvants, ...choiceCatalog.extractionSansSolvants], cultivarsSource: "cultivarsList" },
                    { key: "purgevide", label: "Purge à vide effectuée", type: "checkbox" },
                    {
                        key: "purificationPipeline", label: "Pipeline de purification", type: "purification-pipeline", availableMethods: [
                            ...choiceCatalog.separationsChromato,
                            ...choiceCatalog.fractionnement,
                            ...choiceCatalog.separationsPhysiques,
                            ...choiceCatalog.purificationsAvancees
                        ]
                    }
                ]
            },
            {
                title: "👁️ Visuel & Technique",
                fields: [
                    { key: "couleur", label: "Couleur / Transparence", type: "slider", max: 10 },
                    { key: "viscosite", label: "Viscosité", type: "slider", max: 10 },
                    { key: "pureteVisuelle", label: "Pureté visuelle", type: "slider", max: 10 },
                    { key: "melting", label: "Melting (10=FullMelt)", type: "slider", max: 10 },
                    { key: "residus", label: "Résidus (10=aucune)", type: "slider", max: 10 },
                    { key: "pistils", label: "Pistils (10=aucune)", type: "slider", max: 10 },
                    { key: "moisissure", label: "Moisissure (10=aucune)", type: "slider", max: 10 }
                ]
            },
            {
                title: "👃 Odeurs",
                fields: [
                    { key: "intensiteAromatique", label: "Intensité aromatique", type: "slider", max: 10 },
                    { key: "notesDominantesOdeur", label: "Notes dominantes (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "notesSecondairesOdeur", label: "Notes secondaires (max 7)", type: "wheel", maxSelections: 7 }
                ]
            },
            {
                title: "🤚 Texture",
                fields: [
                    { key: "durete", label: "Dureté", type: "slider", max: 10 },
                    { key: "friabiliteViscosite", label: "Friabilité/Viscosité", type: "slider", max: 10 },
                    { key: "densiteTactile", label: "Densité tactile", type: "slider", max: 10 },
                    { key: "viscositeTexture", label: "Viscosité", type: "slider", max: 10 },
                    { key: "collant", label: "Collant", type: "slider", max: 10 }
                ]
            },
            {
                title: "😋 Goûts",
                fields: [
                    { key: "intensiteGustative", label: "Intensité gustative", type: "slider", max: 10 },
                    { key: "cendreFumee", label: "Cendre fumée", type: "slider", max: 10 },
                    { key: "textureBouche", label: "Texture en bouche", type: "slider", max: 10 },
                    { key: "douceur", label: "Douceur / Agressivité", type: "slider", max: 10 },
                    { key: "intensiteGout", label: "Intensité goût", type: "slider", max: 10 },
                    { key: "intensiteFumeeDab", label: "Intensité fumée/dab", type: "slider", max: 10 },
                    { key: "agressivitePiquant", label: "Agressivité/piquant", type: "slider", max: 10 },
                    { key: "dryPuff", label: "Dry puff/tirage à sec (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "inhalation", label: "Inhalation (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "expiration", label: "Expiration/arrière-goût (max 7)", type: "wheel", maxSelections: 7 }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "montee", label: "Montée", type: "slider", max: 10 },
                    { key: "intensiteEffets", label: "Intensité des effets", type: "slider", max: 10 },
                    { key: "effects", label: "Effets", type: "effects" },
                    { key: "dureeEffet", label: "Durée", type: "select", choices: choiceCatalog.dureeEffet }
                ]
            },
            {
                title: "🔥 PipeLine CURING MATURATION",
                fields: [
                    { key: "curingTimeframe", label: "Intervalle de suivi", type: "select", choices: ["heures", "jours", "semaines", "mois"], default: "jours" },
                    { key: "curingDuration", label: "Durée totale (unités)", type: "number", min: 1, max: 365 },
                    { key: "curingType", label: "Type de curing", type: "select", choices: choiceCatalog.curingTypes },
                    { key: "curingTemp", label: "Température moyenne (°C)", type: "number", min: -5, max: 35 },
                    { key: "curingHumidity", label: "Humidité relative (%)", type: "slider", max: 100, default: 62 },
                    { key: "curingContainer", label: "Type de récipient", type: "select", choices: choiceCatalog.curingContainers },
                    { key: "curingEmballage", label: "Emballage primaire", type: "select", choices: choiceCatalog.emballagesPrimaires },
                    { key: "curingOpacite", label: "Opacité récipient", type: "select", choices: choiceCatalog.opaciteRecipients },
                    { key: "curingVolume", label: "Volume occupé (mL)", type: "number", min: 0 },
                    { key: "curingPipeline", label: "Évolution du curing", type: "curing-pipeline" }
                ]
            },
            {
                title: "🧪 Expérience d'utilisation",
                fields: [
                    { key: "consumptionMethod", label: "Méthode de consommation", type: "select", choices: choiceCatalog.methodesConsommation },
                    { key: "dosageUsed", label: "Dosage utilisé (g)", type: "number", step: 0.1, min: 0 },
                    { key: "effectsDurationMinutes", label: "Durée des effets (minutes)", type: "number", min: 0 },
                    { key: "effectsProfile", label: "Profil des effets", type: "multiselect", choices: choiceCatalog.profilsEffets },
                    { key: "sideEffectsExperienced", label: "Effets secondaires", type: "multiselect", choices: choiceCatalog.effetsSecondaires },
                    { key: "effectsOnset", label: "Début des effets", type: "select", choices: choiceCatalog.debutEffets },
                    { key: "preferredUsage", label: "Usage préféré", type: "multiselect", choices: choiceCatalog.usagesPreferes }
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
                    { key: "typeProduit", label: "Type de comestible", type: "select", choices: choiceCatalog.typesComestibles },
                    { key: "breeder", label: "Fabricant", type: "text" },
                    { key: "typeGenetique", label: "Type de génétiques", type: "select", choices: ["Indica", "Hybride Indica", "Équilibré", "Hybride Sativa", "Sativa"] },
                    { key: "images", label: "Photos (1-4)", type: "images", required: true },
                    { key: "description", label: "Commentaire détaillé", type: "textarea", rows: 5 }
                ]
            },
            {
                title: "📖 Recette",
                fields: [
                    { key: "recipe", label: "Recette complète", type: "recipe" }
                ]
            },
            {
                title: "😋 Goûts",
                fields: [
                    { key: "goutIntensity", label: "Intensité gustative", type: "slider", max: 10 },
                    { key: "agressivite", label: "Agressivité/piquant", type: "slider", max: 10 },
                    { key: "saveursProduit", label: "Saveurs du produit (max 7)", type: "wheel", maxSelections: 7 },
                    { key: "saveursCannabis", label: "Saveurs cannabis (max 7)", type: "wheel", maxSelections: 7 }
                ]
            },
            {
                title: "⚡ Effets",
                fields: [
                    { key: "montee", label: "Montée (rapidité)", type: "slider", max: 10 },
                    { key: "effectsIntensity", label: "Intensité des effets", type: "slider", max: 10 },
                    { key: "effects", label: "Effets", type: "effects" },
                    { key: "dureeEffet", label: "Durée des effets", type: "select", choices: choiceCatalog.dureeEffet }
                ]
            },
            {
                title: "🧪 Expérience d'utilisation",
                fields: [
                    { key: "dosageUsed", label: "Dosage cannabinoïdes (mg THC)", type: "number", min: 0 },
                    { key: "effectsDurationMinutes", label: "Durée des effets (minutes)", type: "number", min: 0 },
                    { key: "effectsProfile", label: "Profil des effets", type: "multiselect", choices: choiceCatalog.profilsEffets },
                    { key: "sideEffectsExperienced", label: "Effets secondaires", type: "multiselect", choices: choiceCatalog.effetsSecondaires },
                    { key: "effectsOnset", label: "Début des effets", type: "select", choices: choiceCatalog.debutEffets },
                    { key: "preferredUsage", label: "Usage préféré", type: "multiselect", choices: choiceCatalog.usagesPreferes }
                ]
            }
        ]
    }
};
