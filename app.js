// --- Hosting base-path support -------------------------------------------
// If the app is served under /reviews, transparently prefix any absolute
// API calls starting with /api/ so they hit /reviews/api/... behind Nginx.
// This keeps the frontend code unchanged while allowing path-based hosting.
(() => {
  try {
    const base = (typeof location !== 'undefined' && location.pathname && location.pathname.startsWith('/reviews')) ? '/reviews' : '';
    // Patch fetch
    if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
      const origFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        try {
          if (typeof input === 'string' && input.startsWith('/api/')) input = base + input;
        } catch {}
        return origFetch(input, init);
      };
    }
    // Patch XMLHttpRequest (au cas où)
    if (typeof window !== 'undefined' && window.XMLHttpRequest && window.XMLHttpRequest.prototype && window.XMLHttpRequest.prototype.open) {
      const origOpen = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        try {
          if (typeof url === 'string' && url.startsWith('/api/')) url = base + url;
        } catch {}
        return origOpen.call(this, method, url, ...rest);
      };
    }
  } catch {}
})();
// --------------------------------------------------------------------------

// --- Auto-advance on editor when ?type=... is provided ---------------------
(() => {
  try {
    if (typeof document === 'undefined') return;
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (!type) return;
    // Wait until the editor UI has rendered the type buttons, then click it
    let tries = 0;
    const lower = String(type).toLowerCase();
    const attempt = () => {
      const candidates = document.querySelectorAll('.type-card, [data-type]');
      let target = null;
      candidates.forEach((el) => {
        const dt = (el.getAttribute && el.getAttribute('data-type')) || '';
        if (dt && dt.toLowerCase() === lower) target = el;
      });
      if (target && typeof target.click === 'function') {
        target.click();
        return; // done
      }
      if (++tries < 80) setTimeout(attempt, 100); // retry up to ~8s
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attempt, { once: true });
    } else {
      attempt();
    }
  } catch {}
})();
// --------------------------------------------------------------------------
// DÉTECTION DE PAGE ET NAVIGATION
const isHomePage = document.body.classList.contains('home-page');
const isEditorPage = document.body.classList.contains('editor-page');

// Navigation entre les pages
function navigateToEditor(productType = null, reviewData = null, reviewId = null) {
  const url = new URL('review.html', window.location.href);
  if (productType) {
    url.searchParams.set('type', productType);
  }
  if (reviewId != null) {
    url.searchParams.set('id', String(reviewId));
  }
  if (reviewData) {
    // Stocker temporairement les données de review pour la page éditeur
    sessionStorage.setItem('pendingReviewData', JSON.stringify(reviewData));
  }
  window.location.href = url.toString();
}

function navigateToHome() {
  window.location.href = 'index.html';
}

// Récupérer les paramètres URL sur la page éditeur
function getEditorParams() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const reviewIdStr = params.get('id') || params.get('editId');
  const reviewId = reviewIdStr != null ? (isNaN(Number(reviewIdStr)) ? reviewIdStr : Number(reviewIdStr)) : null;
  const pendingData = sessionStorage.getItem('pendingReviewData');
  if (pendingData) {
    sessionStorage.removeItem('pendingReviewData');
    return { type, reviewData: JSON.parse(pendingData), reviewId };
  }
  return { type, reviewData: null, reviewId };
}

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
          { 
            key: "cultivarsList", 
            label: "Cultivars utilisés", 
            type: "cultivar-list",
            matiereChoices: ["Fleurs fraîches", "Fleurs sèches", "Trim", "Autre"]
          },
          {
            key: "pipelineSeparation",
            label: "Pipeline de séparation (ordre des étapes)",
            type: "pipeline-with-cultivars",
            choices: choiceCatalog.separationTypes,
            cultivarsSource: "cultivarsList"
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
          { key: "agressivite", label: "Agressivité/piquant", type: "number", max: 10 },
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
          { key: "cultivars", label: "Cultivar", type: "text" },
          { key: "breeder", label: "Breeder de la graine", type: "text" },
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
        title: "Visuel et Technique",
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
          { 
            key: "cultivarsList", 
            label: "Cultivars utilisés", 
            type: "cultivar-list",
            matiereChoices: ["Fleurs fraîches", "Fleurs sèches", "Trim", "Trichomes", "Autre"]
          },
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
                "Sand"
              ])
            )
          },
          {
            key: "pipelineExtraction",
            label: "Pipeline extraction/séparation (ordre)",
            type: "pipeline-with-cultivars",
            choices: Array.from(new Set([
              ...choiceCatalog.separationTypes,
              ...choiceCatalog.extractionSansSolvants,
              ...choiceCatalog.extractionSolvants,
              ...choiceCatalog.extractionAvancees
            ])),
            cultivarsSource: "cultivarsList"
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

const dom = {};
let currentType = "";
let formData = {};
let imageUrl = "";
let totals = {};
let activeSectionIndex = -1;
let layoutResizeHandle;
let isLandscapeMode = null;
let db = null; // IndexedDB handle
let currentReviewId = null; // Track loaded review for editing
let isReadOnlyView = false; // View mode vs edit mode
let draftSaveTimer = null; // Debounced draft persistence
let dbSaveTimer = null; // Debounced DB save
let dbFailedOnce = false; // If IndexedDB fails, fallback to localStorage silently next times
let isCompactPreview = true; // Track preview mode (compact vs full)
let homeGalleryLimit = 8; // 4x2 grid on the home page, increases with "Voir plus"
let isNonDraftRecord = false; // Track if current review has been explicitly saved as non-draft
// Remote backend flags
let remoteEnabled = false; // API détectée
let remoteBase = '';
let lastSelectedImageFile = null; // Original File pour upload
let isUserConnected = false; // Auth state shared across modules
let currentLibraryMode = 'public';

const LAYOUT_THRESHOLDS = {
  enterWidth: 1200,
  exitWidth: 1080,
  desktopAssistWidth: 980,
  enterAspect: 1.25,
  exitAspect: 1.08
};

// Initialize app once DOM is ready; if already ready, run immediately
if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  // DOM is already parsed
  init();
}

function init() {
  // Initialisation différente selon la page
  if (isHomePage) {
    initHomePage();
  } else if (isEditorPage) {
    initEditorPage();
  } else {
    // Fallback pour l'ancienne page review.html
    initEditorPage();
  }
  
  // Créer la navigation mobile pour tous les types de pages
  createMobileBottomNav();
  
  // Améliorer l'UX des champs de saisie
  setTimeout(() => {
    enhanceFormFields();
  }, 500); // Délai pour s'assurer que les éléments sont chargés
}

function createMobileBottomNav() {
  // Vérifier si on est sur mobile
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;
  
  // Chercher les boutons de navigation existants
  const openLibrary = document.getElementById('openLibrary');
  const openTips = document.getElementById('openTips');
  
  if (!openLibrary || !openTips) return;
  
  // Créer le conteneur de navigation mobile s'il n'existe pas
  let mobileNav = document.querySelector('.mobile-bottom-nav');
  if (!mobileNav) {
    mobileNav = document.createElement('div');
    mobileNav.className = 'mobile-bottom-nav';
    document.body.appendChild(mobileNav);
  }
  
  // Cloner les boutons et les ajouter à la navigation mobile
  const libraryBtn = openLibrary.cloneNode(true);
  const tipsBtn = openTips.cloneNode(true);
  
  // Ajuster les IDs pour éviter les conflits
  libraryBtn.id = 'mobileOpenLibrary';
  tipsBtn.id = 'mobileOpenTips';
  
  // Forcer l'affichage des boutons clonés
  libraryBtn.style.display = 'inline-flex';
  tipsBtn.style.display = 'inline-flex';
  
  // Ajouter les boutons à la navigation mobile
  mobileNav.innerHTML = '';
  mobileNav.appendChild(libraryBtn);
  mobileNav.appendChild(tipsBtn);
  
  // Copier les event listeners des boutons originaux
  libraryBtn.addEventListener('click', () => openLibrary.click());
  tipsBtn.addEventListener('click', () => openTips.click());
}

// Recréer la navigation mobile lors du redimensionnement
window.addEventListener('resize', createMobileBottomNav);

// Améliorations UX pour les champs de saisie
function enhanceFormFields() {
  // Auto-resize optimisé pour création de review
  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const maxHeight = 200; // Hauteur maximum raisonnable
    const minHeight = 100; // Hauteur minimum confortable
    const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
    textarea.style.height = newHeight + 'px';
    
    // Gestion du scroll si le contenu dépasse
    if (scrollHeight > maxHeight) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }
  
  // Appliquer l'auto-resize à toutes les textarea
  document.querySelectorAll('textarea').forEach(textarea => {
    // Auto-resize initial
    autoResizeTextarea(textarea);
    
    // Auto-resize lors de la saisie
    textarea.addEventListener('input', () => autoResizeTextarea(textarea));
    
    // Effet de focus amélioré
    textarea.addEventListener('focus', function() {
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });
  
  // Améliorations pour tous les champs de saisie
  document.querySelectorAll('input[type="text"], input[type="number"], select').forEach(field => {
    // Effet de focus avec animation du label
    field.addEventListener('focus', function() {
      const fieldGroup = this.closest('.field-group');
      if (fieldGroup) {
        fieldGroup.classList.add('focused');
      }
    });
    
    field.addEventListener('blur', function() {
      const fieldGroup = this.closest('.field-group');
      if (fieldGroup) {
        fieldGroup.classList.remove('focused');
      }
    });
    
    // Validation visuelle en temps réel
    field.addEventListener('input', function() {
      if (this.value.trim() !== '') {
        this.classList.add('has-content');
      } else {
        this.classList.remove('has-content');
      }
    });
  });
  
  // Amélioration des boutons radio et checkbox
  document.querySelectorAll('.radio, .checkbox-item').forEach(element => {
    element.addEventListener('click', function(e) {
      // Effet ripple
      const ripple = document.createElement('div');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(52, 211, 153, 0.4);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      `;
      
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      this.appendChild(ripple);
      
      // Supprimer l'effet après l'animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    });
  });
  
  // Placeholder dynamique pour les textarea
  document.querySelectorAll('textarea[placeholder]').forEach(textarea => {
    const originalPlaceholder = textarea.placeholder;
    
    textarea.addEventListener('focus', function() {
      if (this.value === '') {
        this.placeholder = 'Commencez à écrire...';
      }
    });
    
    textarea.addEventListener('blur', function() {
      this.placeholder = originalPlaceholder;
    });
  });
}

// CSS pour l'animation ripple
const rippleCSS = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .field-group.focused label {
    color: var(--primary) !important;
    transform: translateX(2px) !important;
  }
  
  .has-content {
    background: rgba(255, 255, 255, 0.12) !important;
  }
`;

// Ajouter le CSS
if (!document.getElementById('enhanced-ux-styles')) {
  const style = document.createElement('style');
  style.id = 'enhanced-ux-styles';
  style.textContent = rippleCSS;
  document.head.appendChild(style);
}

function initHomePage() {
  console.log('Initializing home page...');
  
  // Éléments spécifiques à la page d'accueil
  dom.typeCards = Array.from(document.querySelectorAll(".type-card"));
  dom.compactLibraryList = document.getElementById("compactLibraryList");
  dom.compactLibraryEmpty = document.getElementById("compactLibraryEmpty");
  dom.openTips = document.getElementById("openTips");
  dom.openFullLibrary = document.getElementById("openFullLibrary");
  dom.showMoreLibrary = document.getElementById("showMoreLibrary");
  dom.restoreDraft = document.getElementById("restoreDraft");
  // Preview-only modal elements on home page
  dom.previewOverlay = document.getElementById("previewOverlay");
  dom.previewModal = document.getElementById("previewModal");
  dom.previewModalContent = document.getElementById("previewModalContent");
  dom.downloadPreviewPng = document.getElementById("downloadPreviewPng");
  dom.closePreviewModal = document.getElementById("closePreviewModal");
  
  // Modals
  dom.libraryModal = document.getElementById("libraryModal");
  dom.libraryModalOverlay = document.getElementById("libraryModalOverlay");
  dom.closeLibrary = document.getElementById("closeLibrary");
  dom.tipsModal = document.getElementById("tipsModal");
  dom.tipsModalOverlay = document.getElementById("tipsModalOverlay");
  dom.closeTips = document.getElementById("closeTips");
  dom.libraryGrid = document.getElementById("libraryGrid");
  dom.homeTabs = document.getElementById('homeTabs');
  dom.libraryEmpty = document.getElementById("libraryEmpty");
  dom.librarySearch = document.getElementById("librarySearch");
  dom.libraryTitle = document.getElementById("libraryTitle");
  
  // Auth modal - needed for floating auth button
  dom.authModal = document.getElementById("authModal");
  dom.authModalOverlay = document.getElementById("authModalOverlay");
  dom.closeAuth = document.getElementById("closeAuth");
  dom.authStepEmail = document.getElementById("authStepEmail");
  dom.authStepCode = document.getElementById("authStepCode");
  dom.authStepConnected = document.getElementById("authStepConnected");
  dom.authEmailInput = document.getElementById("authEmailInput");
  dom.authCodeInput = document.getElementById("authCodeInput");
  dom.authEmailDisplay = document.getElementById("authEmailDisplay");
  dom.authConnectedEmail = document.getElementById("authConnectedEmail");
  dom.authSendCode = document.getElementById("authSendCode");
  dom.authVerifyCode = document.getElementById("authVerifyCode");
  dom.authResendCode = document.getElementById("authResendCode");
  dom.authBack = document.getElementById("authBack");
  dom.authDisconnect = document.getElementById("authDisconnect");
  dom.authStatus = document.getElementById("authStatus");
  dom.floatingAuthBtn = document.getElementById("floatingAuthBtn");
  dom.openLibrary = document.getElementById("openLibrary");

  console.log('DOM elements found:', {
    typeCards: dom.typeCards.length,
    restoreDraft: !!dom.restoreDraft,
    openTips: !!dom.openTips,
    showMore: !!dom.showMoreLibrary
  });

  // Setup events with error handling
  setTimeout(() => {
    setupHomePageEvents();
    initDatabase();
  }, 100);
}

async function initEditorPage() {
  // Éléments spécifiques à la page éditeur
  dom.typeCards = Array.from(document.querySelectorAll(".type-card"));
    dom.productTypeInput = document.getElementById("productType") || null;
  dom.dynamicSections = document.getElementById("dynamicSections");
  dom.reviewForm = document.getElementById("reviewForm");
  dom.previewPlaceholder = document.getElementById("previewPlaceholder");
  dom.reviewOutput = document.getElementById("reviewOutput");
  dom.reviewContent = document.getElementById("reviewContent");
  dom.exportImageBtn = document.getElementById("exportImageBtn");
  dom.generateBtn = document.getElementById("generateBtn");
  dom.newReviewBtn = document.getElementById("newReviewBtn");
  dom.brandLogo = document.getElementById("brandLogo");
  dom.resetBtn = document.getElementById("resetBtn");
  dom.saveBtn = document.getElementById("saveBtn");
  dom.prevSection = document.getElementById("prevSection");
  dom.nextSection = document.getElementById("nextSection");
  dom.openTips = document.getElementById("openTips");
  dom.togglePreviewBtn = document.getElementById("togglePreviewBtn");
  dom.togglePreviewText = document.getElementById("togglePreviewText");
  dom.togglePreviewPanel = document.getElementById("togglePreviewPanel");
  dom.selectedTypeChip = document.getElementById("selectedTypeChip");
  dom.progressBar = document.getElementById("progressBar");
  // Section navigation bar
  dom.sectionNav = document.getElementById("sectionNav");
  // Preview-only modal controls
  dom.previewOverlay = document.getElementById("previewOverlay");
  dom.previewModal = document.getElementById("previewModal");
  dom.previewModalContent = document.getElementById("previewModalContent");
  dom.downloadPreviewPng = document.getElementById("downloadPreviewPng");
  dom.closePreviewModal = document.getElementById("closePreviewModal");
  // Save modal controls
  dom.saveModal = document.getElementById('saveModal');
  dom.saveModalOverlay = document.getElementById('saveModalOverlay');
  dom.closeSaveModal = document.getElementById('closeSaveModal');
  dom.saveForm = document.getElementById('saveForm');
  dom.saveName = document.getElementById('saveName');
  dom.saveHolderDisplay = document.getElementById('saveHolderDisplay');
  dom.saveNameError = document.getElementById('saveNameError');
  dom.savePrivacy = document.getElementById('savePrivacy');
  dom.savePrivacySegment = document.getElementById('savePrivacySegment');
  dom.cancelSave = document.getElementById('cancelSave');
  dom.confirmSave = document.getElementById('confirmSave');
  
  // Modals
  dom.libraryModal = document.getElementById("libraryModal");
  dom.libraryModalOverlay = document.getElementById("libraryModalOverlay");
  dom.closeLibrary = document.getElementById("closeLibrary");
  dom.tipsModal = document.getElementById("tipsModal");
  dom.tipsModalOverlay = document.getElementById("tipsModalOverlay");
  dom.closeTips = document.getElementById("closeTips");
  dom.libraryGrid = document.getElementById("libraryGrid");
  dom.libraryEmpty = document.getElementById("libraryEmpty");
  dom.librarySearch = document.getElementById("librarySearch");
  dom.libraryTitle = document.getElementById("libraryTitle");
  // Auth modal
  dom.authModal = document.getElementById("authModal");
  dom.authModalOverlay = document.getElementById("authModalOverlay");
  dom.closeAuth = document.getElementById("closeAuth");
  // Email auth elements
  dom.authStepEmail = document.getElementById("authStepEmail");
  dom.authStepCode = document.getElementById("authStepCode");
  dom.authStepConnected = document.getElementById("authStepConnected");
  dom.authEmailInput = document.getElementById("authEmailInput");
  dom.authCodeInput = document.getElementById("authCodeInput");
  dom.authEmailDisplay = document.getElementById("authEmailDisplay");
  dom.authConnectedEmail = document.getElementById("authConnectedEmail");
  dom.authSendCode = document.getElementById("authSendCode");
  dom.authVerifyCode = document.getElementById("authVerifyCode");
  dom.authResendCode = document.getElementById("authResendCode");
  dom.authBack = document.getElementById("authBack");
  dom.authDisconnect = document.getElementById("authDisconnect");
  dom.authStatus = document.getElementById("authStatus");
  dom.floatingAuthBtn = document.getElementById("floatingAuthBtn");
  dom.openLibrary = document.getElementById("openLibrary");
  // Drawer-based library elements on the editor page
  dom.libraryOverlay = document.getElementById("libraryOverlay");
  dom.libraryDrawer = document.getElementById("libraryDrawer");
  dom.libraryList = document.getElementById("libraryList");
  dom.openLibrary = document.getElementById("openLibrary");

  // Masquer l'aperçu par défaut pour gagner de la place
  try {
    const workspace = document.querySelector('.workspace');
    const previewPanel = document.querySelector('.panel.panel-preview');
    if (workspace && previewPanel) {
      workspace.classList.add('no-preview');
      previewPanel.setAttribute('hidden','');
    }
  } catch {}

  // Récupérer les paramètres de l'URL
  const { type, reviewData, reviewId } = getEditorParams();

  setupEditorPageEvents();
  await initDatabase();
  
  // Initialize auth UI on editor page
  updateAuthUI();
  
  // Si un type est spécifié dans l'URL, l'appliquer automatiquement
  if (type) {
    // Sélection immédiate pour éviter tout clignotement de l'étape 1
    selectProductType(type);
    if (reviewData) {
      loadReviewIntoForm(reviewData, 'edit');
    } else if (reviewId != null) {
      // Charger depuis API distante si dispo, sinon DB locale
      let r = null;
      if (remoteEnabled) {
        try { r = await remoteGetReview(reviewId); } catch {}
      }
      if (!r) {
        try { r = await dbGetReviewById(reviewId); } catch {}
      }
      if (r) loadReviewIntoForm(r, 'edit');
    }
  }
}

function setupHomePageEvents() {
  console.log('Setting up home page events...', dom.typeCards?.length, 'type cards found');
  
  // Navigation vers l'éditeur lors de la sélection du type
  if (dom.typeCards && dom.typeCards.length > 0) {
    dom.typeCards.forEach(card => {
      console.log('Adding click listener to:', card.dataset.type);
      card.addEventListener("click", () => {
        const type = card.dataset.type;
        console.log('Type card clicked:', type);
        if (type) {
          navigateToEditor(type);
        }
      });
    });
  } else {
    console.warn('No type cards found on home page');
  }

  // Bouton restaurer brouillon
  // Plus de gestion dédiée: les brouillons sont accessibles via la galerie

  // Afficher plus (pagination simple par incréments de 8)
  if (dom.showMoreLibrary) {
    dom.showMoreLibrary.addEventListener('click', async () => {
      homeGalleryLimit += 8;
      // Always render public gallery
      await renderCompactLibrary();
    });
  }

  // Home preview-only modal controls
  dom.closePreviewModal?.addEventListener('click', closePreviewOnly);
  dom.previewOverlay?.addEventListener('click', closePreviewOnly);
  dom.downloadPreviewPng?.addEventListener('click', downloadPreviewAsPng);

  // Modals et autres événements
  setupModalEvents();
  
  // Initialize auth UI
  updateAuthUI();
  
  // Always show public gallery on home page
  if (dom.compactLibraryList) {
    dom.compactLibraryList.style.display = 'grid';
  }
}

function setupEditorPageEvents() {
  // Logo navigation
  if (dom.brandLogo) {
    dom.brandLogo.addEventListener("click", navigateToHome);
  }

  // Sélection du type de produit
  dom.typeCards.forEach(card => {
    card.addEventListener("click", () => {
      const type = card.dataset.type;
      if (type) selectProductType(type);
    });
  });

  // Boutons d'action
  if (dom.newReviewBtn) {
    dom.newReviewBtn.addEventListener("click", navigateToHome);
  }

  setupFormEvents();
  setupModalEvents();
  // Wire preview-only modal buttons if present
  dom.closePreviewModal?.addEventListener('click', closePreviewOnly);
  dom.previewOverlay?.addEventListener('click', closePreviewOnly);
  dom.downloadPreviewPng?.addEventListener('click', downloadPreviewAsPng);

  // Toggle panneau d'aperçu (ouvre la modale d'aperçu)
  if (dom.togglePreviewPanel) {
    dom.togglePreviewPanel.addEventListener('click', () => {
      // Open preview modal with the latest generated HTML
      if (!dom.previewModal || !dom.previewOverlay || !dom.reviewContent) return;
      // Toujours ouvrir (fermeture via croix ou clic extérieur)
      // Ensure content is up-to-date
      try { collectFormData(); generateReview(); } catch {}
      const html = dom.reviewContent.innerHTML || '';
      if (dom.previewModalContent) dom.previewModalContent.innerHTML = html;
      dom.previewOverlay.removeAttribute('hidden');
      dom.previewModal.removeAttribute('hidden');
    });
  }
}

function setupFormEvents() {
  if (!isEditorPage) return;

  // Boutons de formulaire
  if (dom.resetBtn) {
    dom.resetBtn.addEventListener("click", () => {
      const hasContent = hasSignificantContent();
      if (hasContent && !confirm("Réinitialiser le formulaire ? Les données saisies seront effacées.")) {
        return;
      }
      // Soft reset: efface tous les champs (y compris pipelines) et reste dans la page
      handleReset('soft');
    });
  }
  if (dom.saveBtn) {
    dom.saveBtn.addEventListener("click", async () => {
      // Ouvrir la modale immédiatement pour ne pas bloquer l'UX
      openSaveModal();
      // Pré-remplir ensuite (si une erreur survient, on ignore, la modale reste ouverte)
      try {
        collectFormData();
        const defName = buildSuggestedName();
        if (dom.saveName) dom.saveName.value = formData.productName || defName || '';
        // Afficher le titulaire automatique avec récupération async
        await updateHolderDisplay();
      } catch (e) { console.warn('Prefill save modal failed', e); }
    });
  }
  // Suppression via l'éditeur désactivée: suppression uniquement depuis la galerie
  if (dom.togglePreviewBtn) {
    dom.togglePreviewBtn.addEventListener("click", togglePreviewMode);
  }
  if (dom.exportImageBtn) {
    dom.exportImageBtn.addEventListener("click", exportImage);
  }

  // Navigation entre sections
  if (dom.prevSection) {
    dom.prevSection.addEventListener("click", () => {
      activateSection(activeSectionIndex - 1, true);
    });
  }
  if (dom.nextSection) {
    dom.nextSection.addEventListener("click", () => {
      const sections = getSections();
      if (!sections.length) return;
      if (activeSectionIndex >= sections.length - 1) {
        dom.exportBtn?.focus();
        showToast("Vous avez parcouru toutes les sections. Exporter quand vous êtes prêt·e.", "info");
        return;
      }
      activateSection(activeSectionIndex + 1, true);
    });
  }

  // Événements de formulaire
  if (dom.reviewForm) {
    dom.reviewForm.addEventListener('submit', handleSubmit);
    // Live image preview: intercept file inputs to update preview immediately
    dom.reviewForm.addEventListener('change', async (ev) => {
      const t = ev.target;
      if (!(t instanceof HTMLInputElement)) return;
      if (t.type !== 'file' || !t.files || !t.files[0]) return;
      try {
          lastSelectedImageFile = t.files[0];
          imageUrl = await readFileAsDataURL(t.files[0]);
        collectFormData();
        generateReview();
      } catch (e) {
        console.error('Image preview error', e);
        showToast("Impossible d'afficher la photo sélectionnée.", 'error');
      }
    }, true);

    // Auto-generate preview whenever inputs change
    dom.reviewForm.addEventListener("input", () => { 
      try { collectFormData(); generateReview(); updateSectionCompletionState(); } catch {} 
    });
    dom.reviewForm.addEventListener("change", () => { 
      try { collectFormData(); generateReview(); updateSectionCompletionState(); } catch {} 
    });
  }

  // Raccourcis clavier
  document.addEventListener("keydown", handleKeyboardShortcuts, { passive: false });

  updateProgress(0);
  updateSectionControls();

  // Fallback: delegated listener to ensure the Save modal opens even if direct binding failed
  document.addEventListener('click', async (e) => {
    const el = e.target;
    if (!(el instanceof Element)) return;
    const btn = el.closest('#saveBtn');
    if (!btn) return;
    try {
      openSaveModal();
      // Prefill best-effort
      try {
        collectFormData();
        const defName = buildSuggestedName();
        if (dom.saveName) dom.saveName.value = formData.productName || defName || '';
        // Afficher le titulaire automatique avec récupération async
        await updateHolderDisplay();
      } catch {}
    } catch {}
  }, { capture: true });
}

function setupModalEvents() {
  // Astuces - Utilise maintenant le modal sur toutes les pages
  if (dom.openTips) {
    const openTipsModal = () => { 
      // Réessayer de trouver le modal s'il n'est pas déjà chargé
      if (!dom.tipsModal) {
        dom.tipsModal = document.getElementById("tipsModal");
      }
      if (dom.tipsModal) {
        dom.tipsModal.style.display = 'flex'; 
      } else {
        console.error('Modal tipsModal introuvable dans le DOM');
        showToast('Modal astuces non disponible', 'warning');
      }
    };
    
    dom.openTips.addEventListener('click', openTipsModal);
    dom.openTips.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { 
        e.preventDefault(); 
        openTipsModal(); 
      }
    });
  }
  if (dom.closeTips) {
    dom.closeTips.addEventListener("click", () => {
      if (dom.tipsModal) dom.tipsModal.style.display = "none";
      const pop = document.getElementById('activeTipsPopover');
      if (pop) pop.remove();
    });
  }
  if (dom.tipsModalOverlay) {
    dom.tipsModalOverlay.addEventListener("click", () => {
      if (dom.tipsModal) dom.tipsModal.style.display = "none";
      const pop = document.getElementById('activeTipsPopover');
      if (pop) pop.remove();
    });
  }

  // "Ma bibliothèque" button opens MY reviews with full actions (requires auth)
  if (dom.openLibrary) {
    dom.openLibrary.addEventListener("click", () => {
      if (!isUserConnected) {
        showToast('Connectez-vous pour accéder à votre bibliothèque.', 'warning');
        if (dom.authModal) dom.authModal.style.display = 'flex';
        return;
      }
      if (isHomePage) {
        const section = dom.myLibrarySection || document.getElementById('myLibrarySection');
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      openLibraryModal('mine');
    });
  }
  // "Voir tout" button opens PUBLIC gallery in read-only mode
  if (dom.openFullLibrary) {
    dom.openFullLibrary.addEventListener("click", () => {
      openLibraryModal('public');
    });
  }
  if (dom.openMyFullLibrary && !isEditorPage) {
    dom.openMyFullLibrary.addEventListener('click', () => {
      if (!isUserConnected) {
        showToast('Connectez-vous pour accéder à votre bibliothèque.', 'warning');
        if (dom.authModal) dom.authModal.style.display = 'flex';
        return;
      }
      openLibraryModal('mine');
    });
  }
  if (dom.closeLibrary) {
    dom.closeLibrary.addEventListener("click", () => {
      if (dom.libraryModal) dom.libraryModal.style.display = "none";
      if (dom.libraryDrawer) toggleLibrary(false);
    });
  }
  if (dom.libraryOverlay) {
    dom.libraryOverlay.addEventListener('click', () => toggleLibrary(false));
  }
  if (dom.libraryModalOverlay) {
    dom.libraryModalOverlay.addEventListener("click", () => {
      if (dom.libraryModal) dom.libraryModal.style.display = "none";
    });
  }

  // Recherche dans la bibliothèque
  if (dom.librarySearch) {
    dom.librarySearch.addEventListener("input", debounce(() => {
      renderFullLibrary(currentLibraryMode);
    }, 300));
  }

  // Modal Auth - Email based
  if (dom.floatingAuthBtn) {
    dom.floatingAuthBtn.addEventListener("click", () => {
      if (dom.authModal) {
        dom.authModal.style.display = "flex";
        updateAuthUI();
      }
    });
  }
  
  if (dom.closeAuth) {
    dom.closeAuth.addEventListener("click", () => {
      if (dom.authModal) dom.authModal.style.display = "none";
    });
  }
  
  if (dom.authModalOverlay) {
    dom.authModalOverlay.addEventListener("click", () => {
      if (dom.authModal) dom.authModal.style.display = "none";
    });
  }
  
  // Send verification code
  if (dom.authSendCode) {
    dom.authSendCode.addEventListener("click", async () => {
      const email = dom.authEmailInput?.value?.trim()?.toLowerCase();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthStatus("Adresse email invalide", "error");
        return;
      }
      
      dom.authSendCode.disabled = true;
      dom.authSendCode.textContent = "Envoi en cours...";
      
      try {
        const r = await fetch(remoteBase + '/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await r.json();
        
        if (r.ok) {
          showAuthStatus("Code envoyé ! Vérifiez vos emails", "success");
          // Switch to code verification step
          if (dom.authStepEmail) dom.authStepEmail.style.display = 'none';
          if (dom.authStepCode) dom.authStepCode.style.display = 'flex';
          if (dom.authEmailDisplay) dom.authEmailDisplay.textContent = email;
          // Store email temporarily
          sessionStorage.setItem('authEmail', email);
        } else {
          showAuthStatus(data.message || "Erreur lors de l'envoi", "error");
        }
      } catch (err) {
        showAuthStatus("Erreur de connexion au serveur", "error");
        console.error('Send code error:', err);
      } finally {
        dom.authSendCode.disabled = false;
        dom.authSendCode.textContent = "Envoyer le code";
      }
    });
  }
  
  // Verify code
  if (dom.authVerifyCode) {
    dom.authVerifyCode.addEventListener("click", async () => {
      const email = sessionStorage.getItem('authEmail');
      const code = dom.authCodeInput?.value?.trim();
      
      if (!code || code.length !== 6) {
        showAuthStatus("Code invalide (6 chiffres)", "error");
        return;
      }
      
      dom.authVerifyCode.disabled = true;
      dom.authVerifyCode.textContent = "Vérification...";
      
      try {
        const r = await fetch(remoteBase + '/api/auth/verify-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code })
        });
        
        const data = await r.json();
        
        if (r.ok) {
          // Save token and email
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('authEmail', data.email);
          sessionStorage.removeItem('authEmail');
          
          showAuthStatus("Connexion réussie !", "success");
          
          setTimeout(() => {
            updateAuthUI();
            if (dom.authModal) dom.authModal.style.display = "none";
            if (isHomePage) {
              renderCompactLibrary();
              setupHomeTabs();
            }
          }, 800);
        } else {
          showAuthStatus(data.message || "Code incorrect", "error");
        }
      } catch (err) {
        showAuthStatus("Erreur de connexion", "error");
        console.error('Verify code error:', err);
      } finally {
        dom.authVerifyCode.disabled = false;
        dom.authVerifyCode.textContent = "Vérifier";
      }
    });
  }
  
  // Resend code
  if (dom.authResendCode) {
    dom.authResendCode.addEventListener("click", async () => {
      const email = sessionStorage.getItem('authEmail');
      if (!email) return;
      
      dom.authResendCode.disabled = true;
      dom.authResendCode.textContent = "Envoi...";
      
      try {
        const r = await fetch(remoteBase + '/api/auth/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        if (r.ok) {
          showAuthStatus("Nouveau code envoyé", "success");
        } else {
          showAuthStatus("Erreur lors de l'envoi", "error");
        }
      } catch (err) {
        showAuthStatus("Erreur de connexion", "error");
      } finally {
        dom.authResendCode.disabled = false;
        dom.authResendCode.textContent = "Renvoyer";
      }
    });
  }
  
  // Back button
  if (dom.authBack) {
    dom.authBack.addEventListener("click", () => {
      if (dom.authStepCode) dom.authStepCode.style.display = 'none';
      if (dom.authStepEmail) dom.authStepEmail.style.display = 'flex';
      if (dom.authCodeInput) dom.authCodeInput.value = '';
      sessionStorage.removeItem('authEmail');
    });
  }
  
  // Disconnect
  if (dom.authDisconnect) {
    dom.authDisconnect.addEventListener("click", async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          await fetch(remoteBase + '/api/auth/logout', {
            method: 'POST',
            headers: { 'X-Auth-Token': token }
          });
        } catch (err) {
          console.error('Logout error:', err);
        }
      }
      
      // Clear all auth-related data including Discord info
      localStorage.removeItem('authToken');
      localStorage.removeItem('authEmail');
      localStorage.removeItem('discordUsername');
      localStorage.removeItem('discordId');
      sessionStorage.removeItem('authEmail');
      
      showAuthStatus("Déconnecté", "info");
      updateAuthUI();
      
      setTimeout(() => {
        if (dom.authModal) dom.authModal.style.display = "none";
        if (isHomePage) {
          renderCompactLibrary();
          setupHomeTabs();
        }
      }, 800);
    });
  }

  // Fermeture par Échap
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (dom.tipsModal && dom.tipsModal.style.display === "flex") {
        dom.tipsModal.style.display = "none";
      }
      if (dom.libraryModal && dom.libraryModal.style.display === "flex") {
        dom.libraryModal.style.display = "none";
      }
      if (dom.authModal && dom.authModal.style.display === "flex") {
        dom.authModal.style.display = "none";
      }
      const pop = document.getElementById('activeTipsPopover');
      if (pop) pop.remove();
      const tipsOverlay = document.getElementById('tipsOverlay');
      if (tipsOverlay) tipsOverlay.remove();
      if (dom.saveModal && dom.saveModal.style.display === 'flex') closeSaveModal();
      if (dom.libraryDrawer && !dom.libraryDrawer.hasAttribute('hidden')) {
        toggleLibrary(false);
      }
    }
  });
}

// Helper function to get and display holder name
async function updateHolderDisplay() {
  if (!dom.saveHolderDisplay) return;
  
  const token = localStorage.getItem('authToken');
  const cachedUsername = localStorage.getItem('discordUsername');
  const cachedEmail = localStorage.getItem('authEmail');
  
  // Si on a un vrai pseudo Discord en cache (pas un User#xxxx), l'utiliser
  if (cachedUsername && !cachedUsername.startsWith('User#') && !cachedUsername.startsWith('Discord #')) {
    dom.saveHolderDisplay.textContent = cachedUsername;
    return cachedUsername;
  }
  
  // Sinon, essayer de le récupérer du serveur
  if (token && remoteBase) {
    try {
      dom.saveHolderDisplay.textContent = 'Récupération...';
      const response = await fetch(`${remoteBase}/api/auth/me`, {
        headers: { 'X-Auth-Token': token }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Essayer différents champs: discordUsername ou user_name (depuis la DB LaFoncedalle)
        const username = userData.discordUsername || userData.user_name;
        
        // Vérifier qu'on a un vrai pseudo Discord (pas un User#xxxx ou Discord #xxxx)
        if (username && !username.startsWith('User#') && !username.startsWith('Discord #')) {
          localStorage.setItem('discordUsername', username);
          dom.saveHolderDisplay.textContent = username;
          return username;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch Discord username:', err);
    }
  }
  
  // Fallback sur l'email (solution temporaire en attendant la configuration Discord côté serveur)
  const holder = cachedEmail || 'Utilisateur non connecté';
  dom.saveHolderDisplay.textContent = holder;
  return holder;
}

// Helper functions for auth UI
async function updateAuthUI() {
  const token = localStorage.getItem('authToken');
  const email = localStorage.getItem('authEmail');
  const isConnected = !!(token && email);
  
  // Show/hide auth steps based on connection state
  if (isConnected) {
    if (dom.authStepEmail) dom.authStepEmail.style.display = 'none';
    if (dom.authStepCode) dom.authStepCode.style.display = 'none';
    if (dom.authStepConnected) {
      dom.authStepConnected.style.display = 'flex';
      
      // Fetch user info from server to get Discord username
      try {
        const response = await fetch(`${remoteBase}/api/auth/me`, {
          headers: { 'X-Auth-Token': token }
        });
        
        if (response.ok) {
          const userData = await response.json();
          // Essayer différents champs: discordUsername ou user_name (depuis la DB LaFoncedalle)
          const username = userData.discordUsername || userData.user_name;
          
          // Display Discord username if available, otherwise Discord ID, otherwise email
          let displayName = username || email;
          
          // If no username but we have a Discord ID, format it nicely
          if (!username && userData.discordId) {
            displayName = `Discord #${userData.discordId.slice(-4)}`;
          }
          
          if (dom.authConnectedEmail) {
            dom.authConnectedEmail.textContent = displayName;
            // Store Discord info in localStorage for offline access
            if (username) {
              localStorage.setItem('discordUsername', username);
            }
            if (userData.discordId) {
              localStorage.setItem('discordId', userData.discordId);
            }
          }
        } else {
          // Fallback to email if API call fails
          if (dom.authConnectedEmail) dom.authConnectedEmail.textContent = email;
        }
      } catch (err) {
        console.error('[AUTH] Error fetching user info:', err);
        // Use cached Discord info if available
        const cachedUsername = localStorage.getItem('discordUsername');
        const cachedDiscordId = localStorage.getItem('discordId');
        if (dom.authConnectedEmail) {
          if (cachedUsername) {
            dom.authConnectedEmail.textContent = cachedUsername;
          } else if (cachedDiscordId) {
            dom.authConnectedEmail.textContent = `Discord #${cachedDiscordId.slice(-4)}`;
          } else {
            dom.authConnectedEmail.textContent = email;
          }
        }
      }
    }
  } else {
    if (dom.authStepEmail) dom.authStepEmail.style.display = 'flex';
    if (dom.authStepCode) dom.authStepCode.style.display = 'none';
    if (dom.authStepConnected) dom.authStepConnected.style.display = 'none';
    // Reset inputs
    if (dom.authEmailInput) dom.authEmailInput.value = '';
    if (dom.authCodeInput) dom.authCodeInput.value = '';
  }
  
  // Update floating button
  if (dom.floatingAuthBtn) {
    if (isConnected) {
      dom.floatingAuthBtn.innerHTML = '<span aria-hidden="true">✓</span>';
      dom.floatingAuthBtn.title = "Compte lié";
      dom.floatingAuthBtn.classList.add('connected');
    } else {
      dom.floatingAuthBtn.innerHTML = '<span aria-hidden="true">🔗</span>';
      dom.floatingAuthBtn.title = "Lier mon compte";
      dom.floatingAuthBtn.classList.remove('connected');
    }
  }
  
  // Persist auth state for other modules
  isUserConnected = isConnected;

  // Show/hide "Ma bibliothèque" entry points
  if (dom.openLibrary) {
    dom.openLibrary.style.display = isConnected ? 'inline-flex' : 'none';
  }
  if (dom.openMyFullLibrary) {
    dom.openMyFullLibrary.style.display = isConnected ? 'inline-flex' : 'none';
  }
  if (dom.myLibrarySection) {
    dom.myLibrarySection.style.display = isConnected ? '' : 'none';
  }

  if (dom.libraryModal && dom.libraryModal.style.display === 'flex') {
    await renderFullLibrary(currentLibraryMode);
  }
}

function showAuthStatus(message, type = "info") {
  if (!dom.authStatus) return;
  
  // Créer ou réutiliser l'élément de notification
  let notification = document.getElementById('globalAuthNotification');
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'globalAuthNotification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.className = `auth-status auth-status-${type}`;
  notification.style.display = 'block';
  
  // Supprimer l'ancien event listener pour éviter les doublons
  const newNotification = notification.cloneNode(true);
  notification.parentNode.replaceChild(newNotification, notification);
  
  // Clic pour fermer immédiatement
  newNotification.addEventListener('click', () => {
    newNotification.style.display = 'none';
  });
  
  // Auto-fermeture après 5 secondes
  setTimeout(() => {
    if (newNotification && newNotification.style.display === 'block') {
      newNotification.style.display = 'none';
    }
  }, 5000);
}

function setupHomeTabs() {
  if (!isHomePage || !dom.homeTabs) return;
  const token = localStorage.getItem('authToken');
  if (token) {
    dom.homeTabs.style.display = 'flex';
  } else {
    dom.homeTabs.style.display = 'none';
  }
}

// Utilitaire debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialisation de la base de données
async function initDatabase() {
  try {
    await setupDatabase();
    await migrateLocalStorageToDB();
    if (shouldDedupeOnStart()) {
      await dedupeDatabase();
    }
    
    // Charger la bibliothèque après l'initialisation de la DB
    if (isHomePage || isEditorPage) {
      renderCompactLibrary();
    }
    // Tentative d'activation du backend distant
    try { await tryEnableRemote(); } catch {}
  } catch (err) {
    console.error("Erreur d'initialisation de la base de données", err);
    showToast("Problème d'initialisation. Mode hors ligne activé.", "warning");
  }
  // Save modal events
  if (dom.closeSaveModal) dom.closeSaveModal.addEventListener('click', closeSaveModal);
  if (dom.saveModalOverlay) dom.saveModalOverlay.addEventListener('click', closeSaveModal);
  if (dom.cancelSave) dom.cancelSave.addEventListener('click', closeSaveModal);
  if (dom.saveForm) {
    dom.saveForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      // Validation
      const name = (dom.saveName?.value || '').trim();
      let ok = true;
      if (!name) { dom.saveNameError?.removeAttribute('hidden'); ok = false; } else { dom.saveNameError?.setAttribute('hidden',''); }
      if (!ok) return;
      
      // Récupérer automatiquement le pseudo Discord/email de l'utilisateur connecté
      // Utiliser la fonction qui récupère depuis le serveur si nécessaire
      const holder = await updateHolderDisplay() || 'Utilisateur';
      
      // Inject into formData and persist
      formData.productName = name;
      formData.holderName = holder; // automatiquement rempli avec le pseudo Discord
      // Privacy from Save modal
      const privVal = (dom.savePrivacy?.value || 'public');
      formData.isPrivate = privVal === 'private';
      try {
        const res = await saveReview(false);
        closeSaveModal();
      }
      catch(e){ console.error(e); showToast("Impossible d'enregistrer.", 'error'); }
    });
  }
  // Wire segmented privacy control
  if (dom.savePrivacySegment && dom.savePrivacy) {
    const updateSeg = (mode) => {
      dom.savePrivacy.value = mode;
      const btns = dom.savePrivacySegment.querySelectorAll('button[data-privacy]');
      btns.forEach(b => {
        const on = b.getAttribute('data-privacy') === mode;
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        b.classList.toggle('btn-secondary', on);
        b.classList.toggle('btn-outline', !on);
      });
    };
    dom.savePrivacySegment.addEventListener('click', (e) => {
      const t = e.target;
      if (!(t instanceof HTMLElement)) return;
      const btn = t.closest('button[data-privacy]');
      if (!btn) return;
      const mode = btn.getAttribute('data-privacy');
      if (!mode) return;
      updateSeg(mode);
    });
    // Default public unless editing an existing private review
    if (formData && formData.isPrivate) updateSeg('private'); else updateSeg('public');
  }
}

// Désactive la déduplication destructive par défaut pour éviter des "disparitions" perçues.
// Activez-la manuellement via ?dedupe=1 ou localStorage.setItem('rm_dedupeOnStart','1').
function shouldDedupeOnStart() {
  try {
    const params = new URLSearchParams(location.search);
    if (params.get('dedupe') === '1') return true;
  } catch {}
  try {
    return localStorage.getItem('rm_dedupeOnStart') === '1';
  } catch { return false; }
}

// Gestion des erreurs globales
window.addEventListener('error', (event) => {
  console.error('Erreur globale:', event.error);
  showToast("Une erreur inattendue s'est produite", "error");
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejetée:', event.reason);
  event.preventDefault();
});

// ---------- Database layer (IndexedDB) ----------
function setupDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.warn("IndexedDB non supporté, fallback sur localStorage.");
      resolve();
      return;
    }
    const req = indexedDB.open("reviewsMakerDB", 1);
    req.onupgradeneeded = (e) => {
      const dbi = e.target.result;
      if (!dbi.objectStoreNames.contains("reviews")) {
        const store = dbi.createObjectStore("reviews", { keyPath: "id", autoIncrement: true });
        store.createIndex("by_date", "date");
        store.createIndex("by_name", "productName", { unique: false });
        store.createIndex("by_type", "productType", { unique: false });
      }
    };
    req.onsuccess = () => { db = req.result; resolve(); };
    req.onerror = () => reject(req.error);
  });
}

async function migrateLocalStorageToDB() {
  if (!db) return; // Nothing to do if no DB
  let reviews = [];
  try { reviews = JSON.parse(localStorage.getItem("cannaReviews") || "[]"); } catch {}
  if (!Array.isArray(reviews) || reviews.length === 0) return;
  // 1) Normalize and deduplicate local entries by correlation/loose key
  const pickBetter = (a, b) => {
    // Prefer non-draft over draft; if equal, prefer most recent date
    if (!!a.isDraft !== !!b.isDraft) return a.isDraft ? b : a;
    const da = new Date(a.date || 0).getTime();
    const dbt = new Date(b.date || 0).getTime();
    return da >= dbt ? a : b;
  };
  const chosenByStrict = new Map();
  const chosenByLoose = new Map();
  for (const r0 of reviews) {
    const r = { ...r0 };
    r.correlationKey = r.correlationKey || computeCorrelationKey(r);
    const loose = computeLooseKey(r);
    // Merge by strict key first
    const prevS = chosenByStrict.get(r.correlationKey);
    if (prevS) {
      chosenByStrict.set(r.correlationKey, pickBetter(prevS, r));
    } else {
      chosenByStrict.set(r.correlationKey, r);
    }
    // Also keep best per loose key to collapse records that only differ by empty breeder/farm
    const prevL = chosenByLoose.get(loose);
    if (prevL) {
      chosenByLoose.set(loose, pickBetter(prevL, r));
    } else {
      chosenByLoose.set(loose, r);
    }
  }
  // Build a final list of winners ensuring uniqueness by strict key
  const winners = new Map();
  // Start with loose winners (covers early drafts without breeder/farm)
  for (const [lk, r] of chosenByLoose.entries()) {
    winners.set(r.correlationKey, r);
  }
  // Overlay strict winners (they are more precise)
  for (const [sk, r] of chosenByStrict.entries()) {
    winners.set(sk, r);
  }
  const locals = Array.from(winners.values());

  // 2) Avoid importing duplicates already present in DB and within this batch
  let existing = [];
  try { existing = await dbGetAllReviews(); } catch {}
  const seenKeys = new Set((existing || []).map(x => x.correlationKey || computeCorrelationKey(x)));
  let migrated = 0;
  for (const r of locals) {
    try {
      const k = r.correlationKey || computeCorrelationKey(r);
      const exists = seenKeys.has(k) || (existing || []).some(x => computeLooseKey(x) === computeLooseKey(r));
      if (exists) continue;
      await dbAddReview(r);
      seenKeys.add(k);
      migrated++;
    } catch (e) { console.warn("Migration entry failed", e); }
  }
  localStorage.removeItem("cannaReviews");
  if (migrated > 0) showToast(`Migration de ${migrated} review(s) vers la base`, "success");
}

// Deduplicate records already in DB by correlation key (strict and loose)
async function dedupeDatabase() {
  if (!db) return;
  try {
    const all = await dbGetAllReviews();
    if (!Array.isArray(all) || all.length < 2) return;

    const groupBy = (arr, selector) => {
      const map = new Map();
      for (const r of arr) {
        const key = selector(r);
        if (!key) continue;
        const list = map.get(key) || [];
        list.push(r);
        map.set(key, list);
      }
      return map;
    };

    const selectBest = (list) => {
      return list
        .slice()
        .sort((a, b) => {
          // Prefer non-draft
          if (!!a.isDraft !== !!b.isDraft) return a.isDraft ? 1 : -1;
          // Newest date first
          const da = new Date(a.date || 0).getTime();
          const dbt = new Date(b.date || 0).getTime();
          return dbt - da;
        })[0];
    };

    const byStrict = groupBy(all, (r) => r.correlationKey || computeCorrelationKey(r));
    const byLoose = groupBy(all, (r) => computeLooseKey(r));

    const toKeep = new Set();
    const toDelete = new Set();

    // First pass: strict groups
    for (const [key, list] of byStrict.entries()) {
      if (list.length <= 1) { toKeep.add(list[0].id); continue; }
      const best = selectBest(list);
      toKeep.add(best.id);
      for (const r of list) { if (r.id !== best.id) toDelete.add(r.id); }
    }
    // Second pass: loose groups (might connect records with empty breeder/farm)
    for (const [key, list] of byLoose.entries()) {
      if (list.length <= 1) { toKeep.add(list[0].id); continue; }
      const best = selectBest(list);
      toKeep.add(best.id);
      for (const r of list) { if (r.id !== best.id) toDelete.add(r.id); }
    }

    // Remove anything selected for deletion but not chosen to keep
    let removed = 0;
    for (const id of toDelete) {
      if (!toKeep.has(id)) {
        await dbDeleteReview(id);
        removed++;
      }
    }
    if (removed > 0) {
      showToast(`Nettoyage des doublons: ${removed} supprimé(s)`, 'info');
    }
  } catch (e) {
    console.warn('Dedupe skipped due to error', e);
  }
}

function dbAddReview(review) {
  return new Promise((resolve, reject) => {
    if (!db) { resolve(null); return; }
    const tx = db.transaction("reviews", "readwrite");
    const store = tx.objectStore("reviews");
    const req = store.add(review);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function dbUpdateReview(review) {
  return new Promise((resolve, reject) => {
    if (!db) { resolve(false); return; }
    const tx = db.transaction("reviews", "readwrite");
    const store = tx.objectStore("reviews");
    const req = store.put(review);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

function dbDeleteReview(id) {
  return new Promise((resolve, reject) => {
    if (!db) { resolve(false); return; }
    const tx = db.transaction("reviews", "readwrite");
    const store = tx.objectStore("reviews");
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

function dbGetAllReviews() {
  return new Promise((resolve, reject) => {
    if (!db) {
      // Fallback read from legacy localStorage
      try { resolve(JSON.parse(localStorage.getItem("cannaReviews") || "[]")); }
      catch { resolve([]); }
      return;
    }
    const tx = db.transaction("reviews", "readonly");
    const store = tx.objectStore("reviews");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function dbGetReviewById(id) {
  return new Promise((resolve, reject) => {
    if (!db) {
      try {
        const all = JSON.parse(localStorage.getItem('cannaReviews') || '[]');
        resolve(all.find(r => r && r.id === id) || null);
      } catch {
        resolve(null);
      }
      return;
    }
    const tx = db.transaction('reviews', 'readonly');
    const store = tx.objectStore('reviews');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// ---------- Library drawer UI ----------
function toggleLibrary(open, mode = 'mine') {
  if (open) {
    dom.libraryOverlay?.removeAttribute("hidden");
    dom.libraryDrawer?.removeAttribute("hidden");
    dom.libraryDrawer?.setAttribute("aria-hidden", "false");
    renderLibraryList(mode);
  } else {
    dom.libraryOverlay?.setAttribute("hidden", "");
    dom.libraryDrawer?.setAttribute("hidden", "");
    dom.libraryDrawer?.setAttribute("aria-hidden", "true");
  }
}

function openLibraryModal(mode = 'mine') {
  currentLibraryMode = mode;
  if (dom.libraryDrawer) {
    toggleLibrary(true, mode);
    return;
  }
  if (!dom.libraryModal) return;
  dom.libraryModal.style.display = "flex";
  renderFullLibrary(mode);
}

async function renderLibraryList(mode = 'mine') {
  if (!dom.libraryList) return;
  const q = (dom.librarySearch?.value || "").trim().toLowerCase();

  if (dom.libraryEmpty && !dom.libraryEmpty.dataset.defaultHtml) {
    dom.libraryEmpty.dataset.defaultHtml = dom.libraryEmpty.innerHTML;
  }

  if (mode === 'mine' && remoteEnabled && !isUserConnected) {
    dom.libraryList.innerHTML = '';
    if (dom.libraryEmpty) {
      dom.libraryEmpty.removeAttribute('hidden');
      dom.libraryEmpty.innerHTML = '<span class="empty-icon" aria-hidden="true">🔒</span><p>Connectez-vous pour accéder à votre bibliothèque.</p>';
    }
    return;
  }

  if (dom.libraryEmpty && dom.libraryEmpty.dataset.defaultHtml) {
    dom.libraryEmpty.innerHTML = dom.libraryEmpty.dataset.defaultHtml;
  }
  
  // Load reviews based on mode
  const items = mode === 'public' 
    ? (remoteEnabled ? await remoteListPublicReviews() : [])
    : (remoteEnabled ? await remoteListMyReviews() : await dbGetAllReviews());
  const list = items
    .sort((a,b) => (a.date || "").localeCompare(b.date || ""))
    .reverse()
    .filter(r => {
      if (!q) return true;
      const hay = `${r.productName || ""} ${r.productType || ""} ${r.farm || ""}`.toLowerCase();
      return hay.includes(q);
    });

  dom.libraryList.innerHTML = "";
  dom.libraryEmpty?.setAttribute("hidden", "");
  if (list.length === 0) {
    if (dom.libraryEmpty) {
      dom.libraryEmpty.innerHTML = dom.libraryEmpty.dataset.defaultHtml || dom.libraryEmpty.innerHTML;
      dom.libraryEmpty.removeAttribute("hidden");
    }
    return;
  }
  list.forEach(r => {
    const li = document.createElement("li");
    li.className = "library-item";
    const title = r.productName || r.cultivars || r.productType || "review";
    const date = new Date(r.date || Date.now()).toLocaleString("fr-FR");
    const thumb = r.image ? `<div style="width:44px;height:44px;border-radius:8px;overflow:hidden;border:1px solid var(--glass-border)"><img src="${r.image}" alt="" style="width:100%;height:100%;object-fit:cover"/></div>` : '';
    const draftBadge = r.isDraft ? `<span style="background:#f59e0b;color:white;font-size:11px;padding:2px 6px;border-radius:4px;margin-left:8px;">Brouillon</span>` : '';
    
    // Show actions only in 'mine' mode
    const actionsHtml = mode === 'mine' ? `
      <div class="actions">
        <button type="button" class="btn btn-outline btn-sm" data-act="load">👀</button>
        <button type="button" class="btn btn-secondary btn-sm" data-act="edit">✏️</button>
        <button type="button" class="btn btn-outline btn-sm" data-act="dup">⏩</button>
        <button type="button" class="btn btn-outline btn-sm" data-act="delete">🗑️</button>
      </div>
    ` : '';
    
    li.innerHTML = `
      <div class="meta">
        <div class="title" style="display:flex;align-items:center;gap:10px;">${thumb}${title}${draftBadge}</div>
        <div class="sub">${r.productType || ""} • ${r.farm || ""} • ${date}</div>
      </div>
      ${actionsHtml}`;
  
    // Always allow preview
    const previewAction = async () => { await openPreviewOnly(r); toggleLibrary(false, mode); };
    
    if (mode === 'mine') {
      li.querySelector('[data-act="load"]').addEventListener('click', previewAction);
      li.querySelector('[data-act="edit"]').addEventListener('click', () => { loadReviewIntoForm(r, 'edit'); toggleLibrary(false, mode); });
      li.querySelector('[data-act="dup"]').addEventListener('click', async () => { await duplicateReview(r); });
      li.querySelector('[data-act="delete"]').addEventListener('click', async () => {
        if (!r.id) { showToast("Suppression non disponible (entrée ancienne)", "warning"); return; }
        const ok = confirm(`Supprimer « ${title} » ?`);
        if (!ok) return;
        try {
          let remoteOk = true;
          if (remoteEnabled) {
            remoteOk = await remoteDeleteReview(r.id);
          }
          try { await dbDeleteReview(r.id); } catch {}
          showToast(remoteOk ? "Review supprimée." : "Supprimée localement, échec serveur", remoteOk ? 'success' : 'warning');
          renderLibraryList(mode);
          renderCompactLibrary();
        }
        catch(e){ showToast("Échec de la suppression", "error"); }
      });
      li.addEventListener('dblclick', previewAction);
    } else {
      // In public mode, just click to preview
      li.addEventListener('click', previewAction);
    }
    
    dom.libraryList.appendChild(li);
  });
}

// Fonction pour dupliquer une review
async function duplicateReview(review) {
  if (!review) return;
  
  try {
    const duplicatedReview = {
      ...review,
      id: undefined, // Nouvel ID sera généré
      date: new Date().toISOString(),
      isDraft: true, // La duplication crée un brouillon
      productName: (review.productName || review.cultivars || review.productType) + " (Copie)"
    };
    // Recompute correlation key for the duplicated draft
    duplicatedReview.correlationKey = computeCorrelationKey(duplicatedReview);
    
    if (db && !dbFailedOnce) {
      await dbAddReview(duplicatedReview);
    } else {
      let reviews = [];
      try { reviews = JSON.parse(localStorage.getItem("cannaReviews") || "[]"); } catch {}
      reviews.push(duplicatedReview);
      localStorage.setItem("cannaReviews", JSON.stringify(reviews));
    }
    
    showToast("Review dupliquée avec succès!", "success");
    renderLibraryList();
    renderCompactLibrary();
  } catch (e) {
    console.error("Erreur duplication:", e);
    showToast("Erreur lors de la duplication", "error");
  }
}

// Fonction pour rendre la bibliothèque compacte
async function renderCompactLibrary() {
  if (!dom.compactLibraryList) return;
  
  // Load only public reviews for public gallery
  const items = remoteEnabled ? await remoteListPublicReviews() : [];
  const list = items
    .sort((a,b) => (a.date || "").localeCompare(b.date || ""))
    .reverse()
    .slice(0, isHomePage ? homeGalleryLimit : 8); // 4x2 par défaut sur l'accueil

  dom.compactLibraryList.innerHTML = "";
  
  if (list.length === 0) {
    if (dom.compactLibraryEmpty) dom.compactLibraryEmpty.style.display = "block";
    if (dom.showMoreLibrary) dom.showMoreLibrary.style.display = 'none';
    return;
  }
  
  if (dom.compactLibraryEmpty) dom.compactLibraryEmpty.style.display = "none";
  // Afficher ou masquer le bouton "Voir plus"
  if (isHomePage && dom.showMoreLibrary) {
    dom.showMoreLibrary.style.display = items.length > list.length ? 'inline-flex' : 'none';
  }
  
  list.forEach(r => {
    const item = document.createElement("div");
    item.className = "compact-library-item";
    
    const title = r.productName || r.cultivars || r.productType || "Review";
    const date = new Date(r.date || Date.now()).toLocaleDateString("fr-FR", {
      day: 'numeric',
      month: 'short'
    });
    const holder = r.holderName ? ` • ${r.holderName}` : '';
    
    // Image d'aperçu si disponible
    const imageHtml = r.image ? 
      `<img src="${r.image}" alt="" class="compact-item-image" />` : 
      `<div class="compact-item-image" style="background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 0.6rem;">📷</div>`;
    
    // Public gallery: NO edit buttons, just preview
    item.innerHTML = `
      ${imageHtml}
      <div class="compact-item-content">
        <div class="compact-item-title">${title}</div>
        <div class="compact-item-meta">${r.productType || "Review"} • ${date}${holder}</div>
      </div>
    `;
    
    // Click to preview only (read-only)
    const openPreview = async () => { await openPreviewOnly(r); };
    item.addEventListener('click', openPreview);
    
    dom.compactLibraryList.appendChild(item);
  });
}


// Rendu de la bibliothèque complète dans la modal
async function renderFullLibrary(mode = (currentLibraryMode || 'mine')) {
  if (!dom.libraryGrid) return;

  currentLibraryMode = mode;
  if (dom.libraryModal) dom.libraryModal.setAttribute('data-mode', mode);
  if (dom.libraryTitle) {
    dom.libraryTitle.textContent = mode === 'public' ? '🖼️ Galerie publique' : '📁 Ma bibliothèque';
  }
  if (dom.librarySearch) {
    dom.librarySearch.placeholder = mode === 'public'
      ? 'Rechercher dans la galerie publique...'
      : 'Rechercher dans vos reviews...';
  }

  if (dom.libraryEmpty && !dom.libraryEmpty.dataset.defaultHtml) {
    dom.libraryEmpty.dataset.defaultHtml = dom.libraryEmpty.innerHTML;
  }

  if (mode === 'mine' && remoteEnabled && !isUserConnected) {
    dom.libraryGrid.innerHTML = '';
    if (dom.libraryEmpty) {
      dom.libraryEmpty.style.display = 'block';
      dom.libraryEmpty.innerHTML = '<span class="empty-icon" aria-hidden="true">🔒</span><p>Connectez-vous pour accéder à votre bibliothèque.</p>';
    }
    return;
  }

  // Load reviews based on mode:
  // - 'public': Only public reviews (read-only)
  // - 'mine': Only my reviews (full actions)
  const items = mode === 'public'
    ? (remoteEnabled ? await remoteListPublicReviews() : [])
    : (remoteEnabled ? await remoteListMyReviews() : await dbGetAllReviews());
  
  const searchTerm = dom.librarySearch?.value?.toLowerCase() || "";
  
  // Get current user token to identify ownership
  const token = localStorage.getItem('authToken');
  const isAuthenticated = !!token;
  
  const filteredItems = items.filter(r => {
    // Filter by search term
    if (searchTerm) {
      const searchFields = [
        r.productName, r.cultivars, r.productType, r.farm, r.description, r.notes
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchFields.includes(searchTerm)) return false;
    }
    
    // Filter private reviews: only show if user is authenticated
    // (server already filters by ownership, so if we receive a private review, it's ours)
    // But for extra safety, we can add client-side check
    // Actually, the server already handles this correctly in /api/reviews
    // So private reviews that appear here are either:
    // 1. Public reviews (isPrivate=false)
    // 2. User's own private reviews (when authenticated)
    // No additional filtering needed here as server handles it
    
    return true;
  });
  
  const list = filteredItems
    .sort((a,b) => (a.date || "").localeCompare(b.date || ""))
    .reverse();

  dom.libraryGrid.innerHTML = "";
  
  if (list.length === 0) {
    if (dom.libraryEmpty) {
      const defaultHtml = dom.libraryEmpty.dataset.defaultHtml || dom.libraryEmpty.innerHTML;
      if (mode === 'mine' && isUserConnected) {
        dom.libraryEmpty.innerHTML = '<span class="empty-icon" aria-hidden="true">📂</span><p>Vous n\'avez pas encore de review enregistrée.</p>';
      } else if (dom.libraryEmpty.dataset.defaultHtml) {
        dom.libraryEmpty.innerHTML = defaultHtml;
      }
      dom.libraryEmpty.style.display = "block";
    }
    return;
  }
  
  if (dom.libraryEmpty) {
    const defaultHtml = dom.libraryEmpty.dataset.defaultHtml;
    if (defaultHtml) dom.libraryEmpty.innerHTML = defaultHtml;
    dom.libraryEmpty.style.display = "none";
  }
  
  list.forEach(r => {
    const item = document.createElement("div");
    item.className = "library-item";
    if (r.isDraft) item.classList.add("is-draft");
    
    const title = r.productName || r.cultivars || r.productType || "Review";
    const date = new Date(r.date || Date.now()).toLocaleDateString("fr-FR", {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const draftBadge = r.isDraft ? `<span class="draft-badge" style="position: absolute; top: 8px; left: 8px; z-index: 10;">Draft</span>` : '';
    const holder = r.holderName ? `<div class="library-item-farm">${r.holderName}</div>` : '';
    
    // Image d'aperçu si disponible
    const imageHtml = r.image ? 
      `<img src="${r.image}" alt="${title}" class="library-item-image" />` : 
      `<div class="library-item-image" style="background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">📷</div>`;
    
    // Show actions only in 'mine' mode
    const actionsHtml = mode === 'mine' ? `
      <div class="library-item-actions">
        <button type="button" class="btn btn-outline btn-sm" data-act="edit" title="Éditer">
          <span aria-hidden="true">✏️</span>
          Éditer
        </button>
  ${(remoteEnabled && r.id != null) ? `<button type="button" class="btn btn-outline btn-sm" data-act="privacy" title="Basculer statut">${r.isPrivate ? '🔒 Privé' : '🌐 Public'}</button>` : ''}
        <button type="button" class="btn btn-danger btn-sm" data-act="delete" title="Supprimer">
          <span aria-hidden="true">🗑️</span>
          Supprimer
        </button>
      </div>
    ` : '';
    
    item.innerHTML = `
      ${draftBadge}
      ${imageHtml}
      <div class="library-item-content">
        <div class="library-item-type">${r.productType || "Review"}</div>
        <div class="library-item-title">${title}</div>
        ${r.farm ? `<div class="library-item-farm">${r.farm}</div>` : ''}
        ${holder}
        <div class="library-item-date">${date}</div>
      </div>
      ${actionsHtml}
    `;
    
    // Event listeners only in 'mine' mode
    if (mode === 'mine') {
      const editBtn = item.querySelector('[data-act="edit"]');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          // Fermer la modal
          if (dom.libraryModal) dom.libraryModal.style.display = "none";
          
          if (isHomePage) {
            navigateToEditor(r.productType, r);
          } else {
            loadReviewIntoForm(r, 'edit'); 
          }
        });
      }
      
      const delBtn = item.querySelector('[data-act="delete"]');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer "${title}" ?`)) {
        try {
          let remoteOk = true;
          if (remoteEnabled) {
            remoteOk = await remoteDeleteReview(r.id);
          }
          try { await dbDeleteReview(r.id); } catch {}
          renderFullLibrary(mode); // Recharger la liste avec le même mode
          renderCompactLibrary(); // Mettre à jour la vue compacte aussi
          showToast(remoteOk ? "Review supprimée" : "Supprimée localement, échec serveur", remoteOk ? 'success' : 'warning');
        } catch (e) {
          console.error("Erreur suppression:", e);
          showToast("Erreur lors de la suppression", "error");
        }
      }
        });
      }

      // Privacy toggle (owner or staff; server enforces authorization)
      const privacyBtn = item.querySelector('[data-act="privacy"]');
      if (privacyBtn) {
        privacyBtn.addEventListener('click', async () => {
          if (!remoteEnabled) return;
          try {
            const next = !r.isPrivate;
            const ok = await remoteTogglePrivacy(r.id, next);
            if (ok) {
              r.isPrivate = next;
              showToast(next ? 'Passée en privé' : 'Rendue publique', 'info');
              privacyBtn.textContent = r.isPrivate ? '🔒 Privé' : '🌐 Public';
              // Refresh lists to reflect server state
              await renderFullLibrary(mode); // Recharger avec le même mode
              await renderCompactLibrary();
            } else {
              showToast('Action non autorisée ou échec serveur', 'warning');
            }
          } catch (e) {
            console.warn(e);
            showToast('Impossible de changer la confidentialité', 'error');
          }
        });
      }
    } else {
      // In public mode, just add click to preview
      item.addEventListener('click', async () => {
        await openPreviewOnly(r);
      });
    }
    
    dom.libraryGrid.appendChild(item);
  });
}

// -------- Preview-only modal (no form) --------
async function openPreviewOnly(review) {
  if (!review) return;
  // Ensure correlationKey exists for legacy entries
  if (!review.correlationKey) { review.correlationKey = computeCorrelationKey(review); }
  // Render review HTML into modal without enabling the form panels
  // Build a minimal context to reuse generateReview-like output
  currentType = review.productType;
  formData = { ...review };
  imageUrl = review.image || "";
  totals = review.totals || {};
  // Create the same HTML as generateReview but into modal content
  if (!dom.previewModalContent) return;
  const structure = productStructures[currentType];
  const title = formData.cultivars || formData.strain || formData.productType;
  const date = new Date(review.date || Date.now()).toLocaleDateString("fr-FR", { day:'2-digit', month:'long', year:'numeric' });
  let html = `<div class="review-header"><h2>${title}</h2><div class="review-meta">${formData.productType} • ${date}</div></div>`;
  if (imageUrl) {
    html += `<div class="review-image"><img src="${imageUrl}" alt="Photo du produit ${title}"></div>`;
  }
  html += '<div class="review-grid">';
  structure.sections.forEach((section, index) => {
    let card = `<div class="review-card"><h3>${section.title}</h3>`;
    let hasContent = false;
    section.fields.forEach(field => {
      if (field.type === 'file') return;
      const value = formData[field.key];
      if (!value) return;
      hasContent = true;
      let displayValue = '';
      if (field.type === 'number') {
        displayValue = Number.parseFloat(value).toFixed(1).replace('.0','');
      } else if (field.type === 'sequence') {
        try { const steps = JSON.parse(value); displayValue = Array.isArray(steps) && steps.length ? steps.map((s,i)=>`${i+1}) ${s}`).join(' \u203A ') : ''; } catch { displayValue = value; }
      } else if (field.type === 'multiple-choice' || (Array.isArray(field.choices) && field.choices.length)) {
        try { const sel = JSON.parse(value); displayValue = Array.isArray(sel) && sel.length ? sel.join(' • ') : ''; } catch { displayValue = value; }
      } else {
        displayValue = value;
      }
      card += `<div class="review-item"><strong>${field.label}</strong><span>${displayValue}</span></div>`;
    });
    if (section.total && totals[`section-${index}`]) {
      const { sum, max } = totals[`section-${index}`];
      card += `<div class="review-item"><strong>Score global</strong><span>${Number(sum).toFixed(1)} / ${max}</span></div>`;
      hasContent = true;
    }
    if (!hasContent) {
      card += '<div class="review-item"><span>Aucune information renseignée.</span></div>';
    }
    card += '</div>';
    html += card;
  });
  html += '</div>';
  dom.previewModalContent.innerHTML = html;
  // Show modal
  dom.previewOverlay?.removeAttribute('hidden');
  dom.previewModal?.removeAttribute('hidden');
}

function closePreviewOnly() {
  dom.previewOverlay?.setAttribute('hidden','');
  dom.previewModal?.setAttribute('hidden','');
  // Le bouton garde toujours le même texte (pas besoin de le changer)
}

async function downloadPreviewAsPng() {
  if (!dom.previewModalContent) return;
  if (typeof html2canvas === 'undefined') { showToast("Impossible de générer l'image (html2canvas)", 'error'); return; }
  try {
    if (document.fonts?.ready) await document.fonts.ready;
    const canvas = await html2canvas(dom.previewModalContent, {
      backgroundColor: "#0f1628",
      scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
      useCORS: true,
      allowTaint: true
    });
    const link = document.createElement('a');
    const safeName = (formData.cultivars || formData.productType || 'review').replace(/\s+/g,'-').toLowerCase();
    link.download = `review_${safeName}_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (e) {
    console.error(e);
    showToast("Erreur lors de la génération de l'image", 'error');
  }
}

function loadReviewIntoForm(review, mode = 'view') {
  if (!review) return;
  // Reset and set current type
  // Use a non-navigating reset to avoid redirecting to index.html
  handleReset('soft');
  const type = review.productType;
  if (!type || !productStructures[type]) {
    showToast("Type de produit inconnu pour cette review", "error");
    return;
  }
  currentType = type;
  formData = { ...review };
  totals = review.totals || {}; // Restaurer les totaux sauvegardés
  imageUrl = review.image || "";
  currentReviewId = review.id || null;
  // Backfill correlation key for legacy entries
  if (!formData.correlationKey) {
    formData.correlationKey = computeCorrelationKey(formData);
  }
  if (dom.productTypeInput) dom.productTypeInput.value = currentType;
  renderForm();
  // Populate fields
  const sections = getSections();
  sections.forEach(section => {
    const inputs = section.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
      if (!input.id) return;
      const val = review[input.id];
      if (val == null) return;
      if (input.type === "file") return;
      if (input.type === "hidden") {
        // sequence, multiple/multiselect, cultivar-list, or pipeline-with-cultivars
        try {
          const parsed = JSON.parse(String(val));
          if (input.dataset.sequence === 'true') {
            rehydrateSequenceField(input.id, Array.isArray(parsed) ? parsed : []);
          } else if (input.dataset.cultivarList === 'true') {
            rehydrateCultivarList(input.id, Array.isArray(parsed) ? parsed : []);
          } else if (input.dataset.pipelineWithCultivars === 'true') {
            rehydratePipelineWithCultivars(input.id, Array.isArray(parsed) ? parsed : []);
          } else if (input.dataset.multiselect === 'true') {
            rehydrateMultipleChoice(input.id, Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []));
          } else {
            // Could be boolean or other simple hidden values stored as JSON string
            if (input.id === 'purgevide') {
              rehydrateBoolean(input.id, parsed);
            } else {
              rehydrateMultipleChoice(input.id, Array.isArray(parsed) ? parsed : (parsed ? [parsed] : []));
            }
          }
        } catch {
          // For non-JSON or legacy scalars
          if (input.id === 'purgevide') {
            rehydrateBoolean(input.id, String(val));
          } else {
            input.value = String(val);
          }
        }
        return;
      }
      if (input.tagName === "SELECT") {
        input.value = String(val);
        return;
      }
      input.value = String(val);
    });
  });
  
  // Recalculer après avoir rempli tous les champs
  setTimeout(() => {
    recalculateTotals();
    updateProgress();
    // Show preview immediately if review HTML can be generated
    generateReview();
    // S'assurer que les contrôles de section sont correctement mis à jour
    updateSectionControls();
  }, 50);
  
  // Ensure panels are visible like after type selection
  const workspace = document.querySelector('.workspace');
  if (workspace) {
    workspace.classList.add('has-content');
  }
  // Update compact assistant chip
  if (dom.selectedTypeChip) {
    dom.selectedTypeChip.textContent = `Type: ${currentType}`;
  }
  // Reveal content and preview panels
  const formPanel = document.querySelector('.panel.panel-form');
  const previewPanel = document.querySelector('.panel.panel-preview');
  if (formPanel) { formPanel.hidden = false; formPanel.removeAttribute('hidden'); }
  // Ne pas forcer l'aperçu: reste caché tant que l'utilisateur ne le révèle pas
  if (previewPanel) { previewPanel.setAttribute('hidden',''); }
  // Hide assistant immediately to avoid any flicker
  document.body.classList.add('assistant-hidden');
  formPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // View or edit mode
  if (mode === 'edit') {
    setReadOnly(false);
    setDraftFlag(true);
  } else {
    setReadOnly(true);
    setDraftFlag(false);
  }
  
  // S'assurer que les boutons sont bien réactivés après le chargement
  setTimeout(() => {
    updateSectionControls();
  }, 100);
}

function scheduleLayoutModeUpdate() {
  if (layoutResizeHandle) {
    window.cancelAnimationFrame(layoutResizeHandle);
  }
  layoutResizeHandle = window.requestAnimationFrame(applyLayoutMode);
}

function applyLayoutMode(force = false) {
  const body = document.body;
  if (!body) {
    return;
  }

  // Force landscape mode for all screen sizes
  isLandscapeMode = true;

  if (force || !body.classList.contains("layout-landscape")) {
    body.classList.add("layout-landscape");
    body.classList.remove("layout-portrait");
  }
}

function handleKeyboardShortcuts(event) {
  const usesModifier = event.ctrlKey || event.metaKey;
  if (!usesModifier || event.altKey || event.defaultPrevented) {
    return;
  }

  const key = event.key;

  if ((key === "ArrowUp" || key === "ArrowDown") && isEditableTarget(event.target)) {
    return;
  }

  if (key === "ArrowUp") {
    if (getSections().length) {
      event.preventDefault();
      activateSection(activeSectionIndex - 1, true);
    }
    return;
  }

  if (key === "ArrowDown") {
    if (getSections().length) {
      event.preventDefault();
      activateSection(activeSectionIndex + 1, true);
    }
    return;
  }

  if (key === "Enter") {
    event.preventDefault();
    if (dom.reviewForm) {
      dom.reviewForm.requestSubmit();
    } else {
      dom.generateBtn?.click();
    }
  }
}

function isEditableTarget(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const tagName = target.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

function getSections() {
  if (!dom.dynamicSections) {
    return [];
  }
  return Array.from(dom.dynamicSections.querySelectorAll(".section"));
}

function handleTypeSelection(card) {
  if (!card || !card.dataset.type) {
    return;
  }

  // Always proceed to render step 2, even if reselecting same type

  dom.typeCards.forEach(c => c.classList.remove("selected"));
  card.classList.add("selected");

  currentType = card.dataset.type;
  formData = { productType: currentType };
  imageUrl = "";
  totals = {};
  currentReviewId = null;
  isReadOnlyView = false;
  isNonDraftRecord = false;

  if (dom.productTypeInput) {
    dom.productTypeInput.value = currentType;
  }

  renderForm();
  updateProgress();
  showToast(`Type de produit sélectionné : ${currentType}`, "info");

  // Step 2: show content panels and adjust layout
  const workspace = document.querySelector('.workspace');
  if (workspace) {
    workspace.classList.add('has-content');
  }
  // Reveal compact assistant bar for step 2
  const compact = document.getElementById('assistantCompact');
  if (compact) compact.hidden = false;

  // Mettre à jour la puce compacte
  if (dom.selectedTypeChip) {
    dom.selectedTypeChip.textContent = `Type: ${currentType}`;
  }

  // Afficher les panneaux Formulaire et Aperçu
  const formPanel = document.querySelector('.panel.panel-form');
  const previewPanel = document.querySelector('.panel.panel-preview');
  if (formPanel) { formPanel.hidden = false; formPanel.removeAttribute('hidden'); }
  if (previewPanel) { previewPanel.setAttribute('hidden',''); }

  // Masquer l'assistant immédiatement pour éviter tout clignotement
  document.body.classList.add('assistant-hidden');
  formPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Marquer comme brouillon en édition
  setDraftFlag(true);
}

// Alias pour la compatibilité
function selectProductType(type) {
  const card = dom.typeCards.find(c => c.dataset.type === type);
  if (card) {
    handleTypeSelection(card);
  } else {
    // Fallback when no .type-card exists on this page (review.html)
    // Apply the type directly and render step 2
    if (!type || !productStructures[type]) return;
    currentType = type;
    formData = { productType: currentType };
    imageUrl = "";
    totals = {};
    currentReviewId = null;
    isReadOnlyView = false;
    isNonDraftRecord = false;

    if (dom.productTypeInput) {
      dom.productTypeInput.value = currentType;
    }

    renderForm();
    updateProgress();

    const workspace = document.querySelector('.workspace');
    if (workspace) workspace.classList.add('has-content');
    const compact = document.getElementById('assistantCompact');
    if (compact) compact.hidden = false;
    if (dom.selectedTypeChip) dom.selectedTypeChip.textContent = `Type: ${currentType}`;

    const formPanel = document.querySelector('.panel.panel-form');
    const previewPanel = document.querySelector('.panel.panel-preview');
    if (formPanel) { formPanel.hidden = false; formPanel.removeAttribute('hidden'); }
    if (previewPanel) { previewPanel.setAttribute('hidden',''); }

    document.body.classList.add('assistant-hidden');
    formPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setDraftFlag(true);
  }
}


function renderForm() {
  if (!dom.dynamicSections) {
    return;
  }

  dom.dynamicSections.innerHTML = "";
  dom.sectionNavButtons = [];
  totals = {};
  activeSectionIndex = -1;

  if (!currentType || !productStructures[currentType]) {
    renderSectionNav([]);
    updateSectionControls();
    updateProgress(0);
    return;
  }

  const structure = productStructures[currentType];

  structure.sections.forEach((section, index) => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "section";
    sectionElement.dataset.sectionIndex = String(index);

    const sectionHeader = document.createElement("div");
    sectionHeader.className = "section-header";

  const title = document.createElement("h2");
  title.textContent = section.title;
    sectionHeader.appendChild(title);

  const container = document.createElement("div");
  // Always use a stacked layout: one field per row to keep a perfect global indentation
  container.className = "fields-stack";

    section.fields.forEach(field => {
      container.appendChild(createFieldGroup(field, index, section));
    });

    if (section.total && Array.isArray(section.totalKeys) && section.totalKeys.length > 0) {
      totals[`section-${index}`] = {
        sum: 0,
        max: section.totalKeys.length * 10
      };
      const badge = document.createElement("div");
      badge.className = "total-badge";
      badge.innerHTML = `TOTAL : <span id="total-value-${index}">0</span>/${section.totalKeys.length * 10}`;
      sectionHeader.appendChild(badge);
    }

    sectionElement.appendChild(sectionHeader);
    sectionElement.appendChild(container);
    dom.dynamicSections.appendChild(sectionElement);
  });

  renderSectionNav(structure.sections);
  activateSection(0, true);
  updateProgress();
  // Update form panel header with selected type
  const formTitle = document.getElementById('form-title');
  if (formTitle) {
    formTitle.textContent = `Informations du produit — ${currentType}`;
  }
  // After initial render, generate a fresh preview if data exists
  try { updateConditionalVisibility(); collectFormData(); generateReview(); } catch {}
}

function renderSectionNav(sections = []) {
  if (!dom.sectionNav) {
    return;
  }

  dom.sectionNav.innerHTML = "";
  dom.sectionNavButtons = [];

  if (!sections.length) {
    updateSectionControls();
    return;
  }

  sections.forEach((section, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.sectionIndex = String(index);
    button.innerHTML = `
      <span class="nav-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="nav-title">${section.title}</span>
    `;
    button.addEventListener("click", () => activateSection(index, true));
    dom.sectionNav.appendChild(button);
    dom.sectionNavButtons.push(button);
  });
}

function activateSection(index, focusFirst = false) {
  const sections = getSections();
  if (!sections.length) {
    activeSectionIndex = -1;
    updateSectionControls();
    return;
  }

  const safeIndex = Math.min(Math.max(index, 0), sections.length - 1);
  if (safeIndex === activeSectionIndex && !focusFirst) {
    return;
  }

  sections.forEach((section, idx) => {
    section.classList.toggle("is-active", idx === safeIndex);
  });

  dom.sectionNavButtons.forEach((button, idx) => {
    button.classList.toggle("active", idx === safeIndex);
  });
  // S'assurer que l'onglet actif est centré dans la nav horizontale
  if (dom.sectionNav && dom.sectionNavButtons[safeIndex]) {
    const btn = dom.sectionNavButtons[safeIndex];
    const nav = dom.sectionNav;
    const center = btn.offsetLeft - nav.clientWidth / 2 + btn.clientWidth / 2;
    nav.scrollTo({ left: Math.max(center, 0), behavior: 'smooth' });
  }

  activeSectionIndex = safeIndex;
  // Update compact assistant current section indicator
  const activeTitle = sections[safeIndex]?.querySelector('h2')?.textContent || '';
  if (dom.currentSectionIndicator) {
    dom.currentSectionIndicator.textContent = activeTitle ? `Section: ${activeTitle}` : 'Aucune section';
  }
  updateSectionControls();
  try { updateSectionCompletionState(); } catch {}

  if (focusFirst) {
    requestAnimationFrame(() => {
      const activeSection = sections[safeIndex];
      const firstInteractive = activeSection?.querySelector(
        "input:not([type=\"hidden\"]), textarea, select"
      );
      if (firstInteractive) {
        firstInteractive.focus({ preventScroll: false });
      }
    });
  }
}

function updateSectionControls() {
  const sections = getSections();
  const hasSections = sections.length > 0;
  const isFirst = activeSectionIndex <= 0;
  const isLast = activeSectionIndex >= sections.length - 1;

  if (dom.prevSection) {
    dom.prevSection.disabled = !hasSections || isFirst;
  }

  if (dom.nextSection) {
    if (!hasSections) {
      dom.nextSection.disabled = true;
      dom.nextSection.innerHTML = 'Section suivante <span aria-hidden="true">➡</span>';
    } else {
      dom.nextSection.disabled = false;
      dom.nextSection.innerHTML = isLast
        ? 'Sections terminées <span aria-hidden="true">✅</span>'
        : 'Section suivante <span aria-hidden="true">➡</span>';
    }
  }
}

function createFieldGroup(field, sectionIndex, section) {
  const wrapper = document.createElement("div");
  wrapper.className = "field-group";
  // Allow conditional display rules via field.showWhen predicate (optional)
  if (typeof field.showWhen === 'function') {
    wrapper.dataset.conditional = 'true';
    // Initial state hidden; will be toggled after render
    wrapper.style.display = 'none';
  }

  const label = document.createElement("label");
  label.setAttribute("for", field.key);
  label.textContent = `${field.label}${field.type === "number" ? " /10" : ""}`;
  wrapper.appendChild(label);

  // Cultivar list: dynamic list of cultivars with farm and matiere properties
  if (field.type === "cultivar-list") {
    const container = document.createElement("div");
    container.className = "cultivar-list";
    
    const list = document.createElement("div");
    list.className = "cultivar-items";
    
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "btn btn-outline add-cultivar-btn";
    addBtn.innerHTML = '<span aria-hidden="true">⊕</span> Ajouter un cultivar';
    
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = field.key;
    hidden.dataset.cultivarList = "true";
    
    let cultivarCounter = 0;
    
    function serializeCultivars() {
      const items = Array.from(list.querySelectorAll('.cultivar-item')).map(item => ({
        name: item.querySelector('[data-cultivar-name]')?.value?.trim() || '',
        farm: item.querySelector('[data-cultivar-farm]')?.value?.trim() || '',
        breeder: item.querySelector('[data-cultivar-breeder]')?.value?.trim() || '',
        matiere: Array.from(item.querySelectorAll('[data-cultivar-matiere]:checked')).map(cb => cb.value)
      })).filter(c => c.name); // Only keep cultivars with a name
      hidden.value = JSON.stringify(items);
      updateProgress();
      try { collectFormData(); generateReview(); } catch {}
      // Notify pipeline fields to update their cultivar checkboxes
      updatePipelineCultivars();
    }
    
    function createCultivarItem(data = {}) {
      const item = document.createElement("div");
      item.className = "cultivar-item";
      item.dataset.cultivarId = ++cultivarCounter;
      
      const header = document.createElement("div");
      header.className = "cultivar-item-header";
      const title = document.createElement("span");
      title.className = "cultivar-item-number";
      title.textContent = `Cultivar ${cultivarCounter}`;
      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "btn-icon";
      delBtn.innerHTML = '🗑️';
      delBtn.title = "Supprimer ce cultivar";
      delBtn.addEventListener('click', () => {
        item.remove();
        serializeCultivars();
      });
      header.append(title, delBtn);
      
      const fields = document.createElement("div");
      fields.className = "cultivar-fields";
      
      // Cultivar name
      const nameGroup = document.createElement("div");
      nameGroup.className = "field-inline";
      const nameLabel = document.createElement("label");
      nameLabel.textContent = "Nom";
      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.placeholder = "Ex: Gelato 41";
      nameInput.dataset.cultivarName = "";
      nameInput.value = data.name || '';
      nameInput.addEventListener('input', serializeCultivars);
      nameGroup.append(nameLabel, nameInput);
      
      // Farm
      const farmGroup = document.createElement("div");
      farmGroup.className = "field-inline";
      const farmLabel = document.createElement("label");
      farmLabel.textContent = "Farm";
      const farmInput = document.createElement("input");
      farmInput.type = "text";
      farmInput.placeholder = "Ex: La Ferme Bio";
      farmInput.dataset.cultivarFarm = "";
      farmInput.value = data.farm || '';
      farmInput.addEventListener('input', serializeCultivars);
      farmGroup.append(farmLabel, farmInput);
      
      // Breeder
      const breederGroup = document.createElement("div");
      breederGroup.className = "field-inline";
      const breederLabel = document.createElement("label");
      breederLabel.textContent = "Breeder";
      const breederInput = document.createElement("input");
      breederInput.type = "text";
      breederInput.placeholder = "Ex: Cookies Fam";
      breederInput.dataset.cultivarBreeder = "";
      breederInput.value = data.breeder || '';
      breederInput.addEventListener('input', serializeCultivars);
      breederGroup.append(breederLabel, breederInput);
      
      // Matiere vegetale (checkboxes)
      const matiereGroup = document.createElement("div");
      matiereGroup.className = "field-inline matiere-group";
      const matiereLabel = document.createElement("label");
      matiereLabel.textContent = "Matière";
      const matiereChoices = document.createElement("div");
      matiereChoices.className = "checkbox-group";
      (field.matiereChoices || []).forEach(choice => {
        const lbl = document.createElement("label");
        lbl.className = "checkbox-label";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.value = choice;
        cb.dataset.cultivarMatiere = "";
        cb.checked = data.matiere && data.matiere.includes(choice);
        cb.addEventListener('change', serializeCultivars);
        lbl.append(cb, document.createTextNode(choice));
        matiereChoices.appendChild(lbl);
      });
      matiereGroup.append(matiereLabel, matiereChoices);
      
      fields.append(nameGroup, farmGroup, breederGroup, matiereGroup);
      item.append(header, fields);
      return item;
    }
    
    addBtn.addEventListener('click', () => {
      list.appendChild(createCultivarItem());
      serializeCultivars();
    });
    
    container.append(addBtn, list, hidden);
    wrapper.appendChild(container);
    wrapper.style.gridColumn = "1 / -1"; // Full width
    return wrapper;
  }

  // Pipeline with cultivars: sequence with cultivar assignment per step
  if (field.type === "pipeline-with-cultivars" && Array.isArray(field.choices) && field.choices.length) {
    const container = document.createElement("div");
    container.className = "pipeline-with-cultivars";
    container.dataset.cultivarsSource = field.cultivarsSource || '';

    const display = document.createElement("button");
    display.type = "button";
    display.className = "multi-select-display";
    display.setAttribute("aria-haspopup", "listbox");
    display.setAttribute("aria-expanded", "false");
    display.textContent = "Ajouter une étape";

    const menu = document.createElement("div");
    menu.className = "multi-select-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    const list = document.createElement("ol");
    list.className = "pipeline-list";

    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = field.key;
    hidden.dataset.pipelineWithCultivars = "true";

    // Helpers for special step types (same as sequence)
    function isSieveStep(name) {
      const n = (name || '').toLowerCase();
      return /tamis|bubble|ice\s*hash|ice\s*dry|wpff/.test(n);
    }
    function isRosinStep(name) {
      const n = (name || '').toLowerCase();
      return /rosin|pressage\s*(à|a)\s*chaud/.test(n);
    }
    function isCO2Step(name) {
      const n = (name || '').toLowerCase();
      return /(co2|co₂).*(supercritique)/.test(n);
    }

    function getCultivarsList() {
      const sourceKey = field.cultivarsSource;
      if (!sourceKey) return [];
      const sourceInput = document.getElementById(sourceKey);
      if (!sourceInput) return [];
      try {
        const data = JSON.parse(sourceInput.value || '[]');
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    }

    function currentEntries() {
      return Array.from(list.querySelectorAll('li.pipeline-item')).map(li => {
        const name = li.querySelector('.step-label')?.textContent || '';
        if (!name) return null;
        
        const entry = { name };
        
        // Get selected cultivars
        const selectedCultivars = Array.from(li.querySelectorAll('[data-step-cultivar]:checked')).map(cb => cb.value);
        if (selectedCultivars.length) entry.cultivars = selectedCultivars;
        
        // Mesh-capable steps
        if (li.dataset.sieve === 'true' || li.dataset.rosin === 'true') {
          const minV = li.querySelector('input[data-mesh-min]')?.value?.trim() || '';
          const maxV = li.querySelector('input[data-mesh-max]')?.value?.trim() || '';
          const any = minV || maxV;
          const mesh = (minV && maxV) ? `${minV}–${maxV}` : (any ? `0–${minV || maxV}` : '');
          if (mesh) entry.mesh = mesh;
          
          if (li.dataset.rosin === 'true') {
            const tempC = li.querySelector('input[data-rosin-temp]')?.value?.trim() || '';
            if (tempC) entry.tempC = tempC;
          }
        }
        
        if (li.dataset.co2 === 'true') {
          const pressureBar = li.querySelector('input[data-co2-pressure]')?.value?.trim() || '';
          const tempC = li.querySelector('input[data-co2-temp]')?.value?.trim() || '';
          if (pressureBar) entry.pressureBar = pressureBar;
          if (tempC) entry.tempC = tempC;
        }
        
        return entry;
      }).filter(Boolean);
    }

    function renderDisplay(values) {
      const arr = Array.isArray(values) ? values : [];
      if (!arr.length) {
        display.textContent = "Ajouter une étape";
        return;
      }
      display.innerHTML = arr.map(v => {
        const name = (v && typeof v === 'object') ? (v.name || '') : String(v);
        let meta = '';
        if (v && typeof v === 'object') {
          const parts = [];
          if (v.mesh) parts.push(`${v.mesh}`);
          if (v.pressureBar) parts.push(`${v.pressureBar} bar`);
          if (v.tempC) parts.push(`${v.tempC}°C`);
          if (v.cultivars && v.cultivars.length) {
            parts.push(`🌿 ${v.cultivars.join(', ')}`);
          }
          if (parts.length) meta = ` <small style="opacity:.82;">(${parts.join(', ')})</small>`;
        }
        return `<span class="chip">${name}${meta}</span>`;
      }).join("");
    }

    function serialize() {
      const entries = currentEntries();
      hidden.value = JSON.stringify(entries);
      renderDisplay(entries);
      updateProgress();
      
      // Update all subsequent steps' cultivar options (to include new extractions)
      list.querySelectorAll('.pipeline-item').forEach(item => {
        const currentSelected = Array.from(item.querySelectorAll('[data-step-cultivar]:checked')).map(cb => cb.value);
        updateItemCultivars(item, currentSelected);
      });
      
      try { collectFormData(); generateReview(); } catch {}
    }

    function createItem(text, meta = {}) {
      const li = document.createElement("li");
      li.className = "pipeline-item";
      
      const header = document.createElement("div");
      header.className = "pipeline-item-header";
      
      const label = document.createElement("span");
      label.className = "step-label";
      label.textContent = text;
      
      const actions = document.createElement("span");
      actions.className = "step-actions";
      const up = document.createElement("button");
      up.type = "button";
      up.className = "step-move";
      up.title = "Monter";
      up.textContent = "↑";
      const down = document.createElement("button");
      down.type = "button";
      down.className = "step-move";
      down.title = "Descendre";
      down.textContent = "↓";
      const del = document.createElement("button");
      del.type = "button";
      del.className = "step-del";
      del.title = "Supprimer";
      del.textContent = "✕";
      actions.append(up, down, del);
      header.append(label, actions);
      li.appendChild(header);

      // Cultivars selector
      const cultivarsDiv = document.createElement("div");
      cultivarsDiv.className = "step-cultivars";
      const cultivarsLabel = document.createElement("span");
      cultivarsLabel.textContent = "Cultivars pour cette étape :";
      cultivarsLabel.className = "step-cultivars-label";
      const cultivarsCheckboxes = document.createElement("div");
      cultivarsCheckboxes.className = "step-cultivars-checkboxes";
      cultivarsCheckboxes.dataset.cultivarsTarget = "";
      cultivarsDiv.append(cultivarsLabel, cultivarsCheckboxes);
      li.appendChild(cultivarsDiv);
      
      // Populate cultivars checkboxes
      updateItemCultivars(li, meta.cultivars || []);

      // Extra metadata editors (mesh, temp, pressure, etc.)
      const n = (text || '').toString();
      if (isSieveStep(n) || isRosinStep(n)) {
        if (isSieveStep(n)) li.dataset.sieve = 'true';
        if (isRosinStep(n)) li.dataset.rosin = 'true';
        const extra = document.createElement('div');
        extra.className = 'step-extra';
        const pair = document.createElement('div');
        pair.className = 'mesh-pair';
        const minInput = document.createElement('input');
        minInput.type = 'text';
        minInput.placeholder = 'min (µm)';
        minInput.setAttribute('data-mesh-min', '');
        const maxInput = document.createElement('input');
        maxInput.type = 'text';
        maxInput.placeholder = 'max (µm)';
        maxInput.setAttribute('data-mesh-max', '');
        if (meta && meta.mesh) {
          try {
            const str = String(meta.mesh);
            const m = str.match(/(\d+)\s*[–-]\s*(\d+)/);
            if (m) {
              minInput.value = m[1];
              maxInput.value = m[2];
            } else {
              const single = str.match(/(\d+)/);
              if (single) { maxInput.value = single[1]; }
            }
          } catch {}
        }
        minInput.addEventListener('input', serialize);
        maxInput.addEventListener('input', serialize);
        pair.append(minInput, maxInput);
        extra.appendChild(pair);
        if (li.dataset.rosin === 'true') {
          const temp = document.createElement('input');
          temp.type = 'text';
          temp.placeholder = 'Température (°C)';
          temp.setAttribute('data-rosin-temp', '');
          if (meta && (meta.tempC || meta.temperature)) {
            temp.value = String(meta.tempC || meta.temperature);
          }
          temp.addEventListener('input', serialize);
          extra.appendChild(temp);
        }
        li.appendChild(extra);
      } else if (isCO2Step(n)) {
        li.dataset.co2 = 'true';
        const extra = document.createElement('div');
        extra.className = 'step-extra';
        const pressure = document.createElement('input');
        pressure.type = 'text';
        pressure.placeholder = 'Pression (bar)';
        pressure.setAttribute('data-co2-pressure', '');
        const temp = document.createElement('input');
        temp.type = 'text';
        temp.placeholder = 'Température (°C)';
        temp.setAttribute('data-co2-temp', '');
        if (meta) {
          if (meta.pressureBar) pressure.value = String(meta.pressureBar);
          if (meta.tempC || meta.temperature) temp.value = String(meta.tempC || meta.temperature);
        }
        pressure.addEventListener('input', serialize);
        temp.addEventListener('input', serialize);
        extra.append(pressure, temp);
        li.appendChild(extra);
      }

      up.addEventListener("click", () => {
        if (li.previousElementSibling) {
          list.insertBefore(li, li.previousElementSibling);
          serialize();
        }
      });
      down.addEventListener("click", () => {
        if (li.nextElementSibling) {
          list.insertBefore(li.nextElementSibling, li);
          serialize();
        }
      });
      del.addEventListener("click", () => {
        li.remove();
        serialize();
      });

      return li;
    }
    
    function updateItemCultivars(item, selectedCultivars = []) {
      const checkboxesDiv = item.querySelector('[data-cultivars-target]');
      if (!checkboxesDiv) return;
      checkboxesDiv.innerHTML = '';
      
      const cultivars = getCultivarsList();
      
      // Get previous steps (extractions) as potential inputs
      const previousSteps = [];
      let current = item.previousElementSibling;
      while (current && current.classList.contains('pipeline-item')) {
        const stepName = current.querySelector('.step-label')?.textContent || '';
        const stepCultivars = Array.from(current.querySelectorAll('[data-step-cultivar]:checked')).map(cb => cb.value);
        
        // Build extraction name (e.g., "Dry Critical Kush 220µm")
        let extractionName = '';
        if (stepCultivars.length > 0) {
          const cultivarsPart = stepCultivars.join(' + ');
          
          // Get mesh info if available
          let meshInfo = '';
          if (current.dataset.sieve === 'true' || current.dataset.rosin === 'true') {
            const minV = current.querySelector('input[data-mesh-min]')?.value?.trim() || '';
            const maxV = current.querySelector('input[data-mesh-max]')?.value?.trim() || '';
            if (minV || maxV) {
              meshInfo = (minV && maxV) ? ` ${minV}–${maxV}µm` : ` ${minV || maxV}µm`;
            }
          }
          
          extractionName = `${stepName.split('(')[0].trim()}: ${cultivarsPart}${meshInfo}`;
        }
        
        if (extractionName) {
          previousSteps.push(extractionName);
        }
        current = current.previousElementSibling;
      }
      
      // Show message if no options available
      if (!cultivars.length && !previousSteps.length) {
        checkboxesDiv.innerHTML = '<em style="opacity:0.6;font-size:0.9em;">Aucun cultivar ou extraction défini</em>';
        return;
      }
      
      // Add base cultivars section
      if (cultivars.length > 0) {
        const cultivarsTitle = document.createElement('div');
        cultivarsTitle.className = 'step-cultivars-section-title';
        cultivarsTitle.textContent = '🌿 Cultivars de base :';
        checkboxesDiv.appendChild(cultivarsTitle);
        
        cultivars.forEach(c => {
          if (!c.name) return;
          const lbl = document.createElement('label');
          lbl.className = 'checkbox-label';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = c.name;
          cb.dataset.stepCultivar = '';
          cb.checked = selectedCultivars.includes(c.name);
          cb.addEventListener('change', serialize);
          lbl.append(cb, document.createTextNode(c.name));
          checkboxesDiv.appendChild(lbl);
        });
      }
      
      // Add previous extractions section
      if (previousSteps.length > 0) {
        const extractionsTitle = document.createElement('div');
        extractionsTitle.className = 'step-cultivars-section-title';
        extractionsTitle.textContent = '🔬 Extractions précédentes :';
        extractionsTitle.style.marginTop = '12px';
        checkboxesDiv.appendChild(extractionsTitle);
        
        previousSteps.forEach(extraction => {
          const lbl = document.createElement('label');
          lbl.className = 'checkbox-label';
          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = extraction;
          cb.dataset.stepCultivar = '';
          cb.checked = selectedCultivars.includes(extraction);
          cb.addEventListener('change', serialize);
          lbl.append(cb, document.createTextNode(extraction));
          checkboxesDiv.appendChild(lbl);
        });
      }
    }

    // Build adder menu
    field.choices.forEach(choice => {
      const opt = document.createElement("div");
      opt.className = "multi-select-option";
      opt.setAttribute("role", "option");
      opt.tabIndex = 0;
      opt.textContent = choice;
      opt.addEventListener("click", () => {
        list.appendChild(createItem(choice));
        serialize();
      });
      opt.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          opt.click();
        }
      });
      menu.appendChild(opt);
    });

    // Toggle menu
    display.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !menu.hidden;
      document.querySelectorAll(".multi-select-menu").forEach(el => {
        el.hidden = true;
        el.previousElementSibling?.setAttribute("aria-expanded","false");
      });
      menu.hidden = isOpen;
      display.setAttribute("aria-expanded", String(!isOpen));
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        menu.hidden = true;
        display.setAttribute("aria-expanded", "false");
      }
    });

    // Store update function globally for cross-field updates
    window.updatePipelineCultivars = function() {
      // Update all pipeline items with fresh cultivar list
      container.querySelectorAll('.pipeline-item').forEach(item => {
        const currentSelected = Array.from(item.querySelectorAll('[data-step-cultivar]:checked')).map(cb => cb.value);
        updateItemCultivars(item, currentSelected);
      });
      serialize();
    };

    container.append(display, menu, list, hidden);
    wrapper.appendChild(container);
    wrapper.style.gridColumn = "1 / -1"; // Full width
    return wrapper;
  }

  if (field.type === "sequence" && Array.isArray(field.choices) && field.choices.length) {
    // Sequence builder using a dropdown adder (like multi-select but ordered)
    const container = document.createElement("div");
    container.className = "sequence";

    // Display area showing current pipeline as chips
    const display = document.createElement("button");
    display.type = "button";
    display.className = "multi-select-display";
    display.setAttribute("aria-haspopup", "listbox");
    display.setAttribute("aria-expanded", "false");
    display.textContent = "Ajouter une étape";

    // Menu for adding steps (reuse multi-select menu styles)
    const menu = document.createElement("div");
    menu.className = "multi-select-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    const list = document.createElement("ol");
    list.className = "sequence-list";

    const hidden = document.createElement("input");
    hidden.type = "hidden"; hidden.id = field.key; hidden.dataset.sequence = "true";

    // Helpers
    function isSieveStep(name) {
      const n = (name || '').toLowerCase();
      return /tamis|bubble|ice\s*hash|ice\s*dry|wpff/.test(n);
    }
    function isRosinStep(name) {
      const n = (name || '').toLowerCase();
      // Matches 'Pressage à chaud (Rosin)' or anything containing 'rosin'
      return /rosin|pressage\s*(à|a)\s*chaud/.test(n);
    }
    function isCO2Step(name) {
      const n = (name || '').toLowerCase();
      // Matches 'Extraction au CO₂ supercritique' with either co2/co₂ and supercritique
      return /(co2|co₂).*(supercritique)/.test(n);
    }

    function currentEntries() {
      return Array.from(list.querySelectorAll('li.sequence-item')).map(li => {
        const name = li.querySelector('.step-label')?.textContent || '';
        if (!name) return null;
        // Mesh-capable steps (sieve and rosin)
        if (li.dataset.sieve === 'true' || li.dataset.rosin === 'true') {
          const minV = li.querySelector('input[data-mesh-min]')?.value?.trim() || '';
          const maxV = li.querySelector('input[data-mesh-max]')?.value?.trim() || '';
          const any = minV || maxV;
          const mesh = (minV && maxV) ? `${minV}–${maxV}` : (any ? `0–${minV || maxV}` : '');
          if (li.dataset.rosin === 'true') {
            const tempC = li.querySelector('input[data-rosin-temp]')?.value?.trim() || '';
            const obj = { name };
            if (mesh) obj.mesh = mesh;
            if (tempC) obj.tempC = tempC;
            return obj;
          }
          return mesh ? { name, mesh } : { name };
        }
        if (li.dataset.co2 === 'true') {
          const pressureBar = li.querySelector('input[data-co2-pressure]')?.value?.trim() || '';
          const tempC = li.querySelector('input[data-co2-temp]')?.value?.trim() || '';
          const obj = { name };
          if (pressureBar) obj.pressureBar = pressureBar;
          if (tempC) obj.tempC = tempC;
          return obj;
        }
        return { name };
      }).filter(Boolean);
    }

    function renderDisplay(values) {
      const arr = Array.isArray(values) ? values : [];
      if (!arr.length) {
        display.textContent = "Ajouter une étape";
        return;
      }
      display.innerHTML = arr.map(v => {
        const name = (v && typeof v === 'object') ? (v.name || '') : String(v);
        let meta = '';
        if (v && typeof v === 'object') {
          const parts = [];
          if (v.mesh) parts.push(`${v.mesh}`);
          if (v.pressureBar) parts.push(`${v.pressureBar} bar`);
          if (v.tempC) parts.push(`${v.tempC}°C`);
          if (parts.length) meta = ` <small style="opacity:.82;">(${parts.join(', ')})</small>`;
        }
        return `<span class="chip">${name}${meta}</span>`;
      }).join("");
    }

    function serialize() {
      const entries = currentEntries();
      const hasMeta = entries.some(e => e && typeof e === 'object' && Object.keys(e).some(k => k !== 'name'));
      const payload = hasMeta ? entries : entries.map(e => e?.name || '');
      hidden.value = JSON.stringify(payload);
      renderDisplay(payload);
      updateProgress();
      // Update conditional fields visibility based on sequence content
      try { updateConditionalVisibility(); } catch {}
      try { collectFormData(); generateReview(); } catch {}
    }

    function createItem(text, meta = {}) {
      const li = document.createElement("li");
      li.className = "sequence-item";
      const label = document.createElement("span");
      label.className = "step-label"; label.textContent = text;
      const actions = document.createElement("span");
      actions.className = "step-actions";
      const up = document.createElement("button"); up.type = "button"; up.className = "step-move"; up.title = "Monter"; up.textContent = "↑";
      const down = document.createElement("button"); down.type = "button"; down.className = "step-move"; down.title = "Descendre"; down.textContent = "↓";
      const del = document.createElement("button"); del.type = "button"; del.className = "step-del"; del.title = "Supprimer"; del.textContent = "✕";
      actions.append(up, down, del);
      li.append(label, actions);

      // Extra metadata editors per step type
      const n = (text || '').toString();
      if (isSieveStep(n) || isRosinStep(n)) {
        if (isSieveStep(n)) li.dataset.sieve = 'true';
        if (isRosinStep(n)) li.dataset.rosin = 'true';
        const extra = document.createElement('div');
        extra.className = 'step-extra';
        // Mesh range (common to sieve and rosin)
        const pair = document.createElement('div');
        pair.className = 'mesh-pair';
        const minInput = document.createElement('input');
        minInput.type = 'text';
        minInput.placeholder = 'min (µm)';
        minInput.setAttribute('data-mesh-min', '');
        const maxInput = document.createElement('input');
        maxInput.type = 'text';
        maxInput.placeholder = 'max (µm)';
        maxInput.setAttribute('data-mesh-max', '');
        if (meta && meta.mesh) {
          try {
            const str = String(meta.mesh);
            const m = str.match(/(\d+)\s*[–-]\s*(\d+)/);
            if (m) {
              minInput.value = m[1];
              maxInput.value = m[2];
            } else {
              const single = str.match(/(\d+)/);
              if (single) { maxInput.value = single[1]; }
            }
          } catch {}
        }
        const onPairChange = () => { serialize(); };
        minInput.addEventListener('input', onPairChange);
        maxInput.addEventListener('input', onPairChange);
        pair.append(minInput, maxInput);
        extra.appendChild(pair);
        // Rosin temperature
        if (li.dataset.rosin === 'true') {
          const temp = document.createElement('input');
          temp.type = 'text';
          temp.placeholder = 'Température (°C)';
          temp.setAttribute('data-rosin-temp', '');
          if (meta && (meta.tempC || meta.temperature)) {
            temp.value = String(meta.tempC || meta.temperature);
          }
          temp.addEventListener('input', () => serialize());
          extra.appendChild(temp);
        }
        li.appendChild(extra);
      } else if (isCO2Step(n)) {
        li.dataset.co2 = 'true';
        const extra = document.createElement('div');
        extra.className = 'step-extra';
        const pressure = document.createElement('input');
        pressure.type = 'text';
        pressure.placeholder = 'Pression (bar)';
        pressure.setAttribute('data-co2-pressure', '');
        const temp = document.createElement('input');
        temp.type = 'text';
        temp.placeholder = 'Température (°C)';
        temp.setAttribute('data-co2-temp', '');
        if (meta) {
          if (meta.pressureBar) pressure.value = String(meta.pressureBar);
          if (meta.tempC || meta.temperature) temp.value = String(meta.tempC || meta.temperature);
        }
        pressure.addEventListener('input', () => serialize());
        temp.addEventListener('input', () => serialize());
        extra.append(pressure, temp);
        li.appendChild(extra);
      }

      up.addEventListener("click", () => { if (li.previousElementSibling) { list.insertBefore(li, li.previousElementSibling); serialize(); } });
      down.addEventListener("click", () => { if (li.nextElementSibling) { list.insertBefore(li.nextElementSibling, li); serialize(); } });
      del.addEventListener("click", () => { li.remove(); serialize(); });

      return li;
    }

    // Build adder menu options; clicking appends step and keeps menu open
    field.choices.forEach(choice => {
      const opt = document.createElement("div");
      opt.className = "multi-select-option"; // reuse style
      opt.setAttribute("role", "option");
      opt.tabIndex = 0;
      opt.textContent = choice;
      opt.addEventListener("click", () => {
        list.appendChild(createItem(choice));
        serialize();
      });
      opt.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); opt.click(); } });
      menu.appendChild(opt);
    });

    // Toggle menu
    display.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !menu.hidden;
      document.querySelectorAll(".multi-select-menu").forEach(el => { el.hidden = true; el.previousElementSibling?.setAttribute("aria-expanded","false"); });
      menu.hidden = isOpen; // if open -> close, else open after closing others
      display.setAttribute("aria-expanded", String(!isOpen));
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!container.contains(e.target)) {
        menu.hidden = true;
        display.setAttribute("aria-expanded", "false");
      }
    });

    container.append(display, menu, list, hidden);
    wrapper.appendChild(container);
    return wrapper;
  }

  // Multi-select dropdown for all fields with predefined choices (including legacy multiple-choice)
  if ((field.type === "multiple-choice" || (Array.isArray(field.choices) && field.choices.length)) && field.type !== "sequence") {
    const ms = document.createElement("div");
    ms.className = "multi-select";

    const display = document.createElement("button");
    display.type = "button";
    display.className = "multi-select-display";
    display.setAttribute("aria-haspopup", "listbox");
    display.setAttribute("aria-expanded", "false");
    display.textContent = "Sélectionner";

    const menu = document.createElement("div");
    menu.className = "multi-select-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    const hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = field.key;
    hidden.dataset.multiselect = "true";

    function renderDisplay(values) {
      const arr = Array.isArray(values) ? values : [];
      if (!arr.length) {
        display.textContent = "Sélectionner";
        return;
      }
      display.innerHTML = arr.map(v => `<span class="chip">${v}</span>`).join("");
    }

    function updateFromMenu() {
      const selected = Array.from(menu.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      hidden.value = JSON.stringify(selected);
      renderDisplay(selected);
      updateProgress();
      try { collectFormData(); generateReview(); } catch {}
    }

    // Build options
    field.choices.forEach(choice => {
      const opt = document.createElement("label");
      opt.className = "multi-select-option";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = choice;
      cb.addEventListener("change", updateFromMenu);
      const span = document.createElement("span");
      span.textContent = choice;
      opt.append(cb, span);
      menu.appendChild(opt);
    });

    // Toggle menu
    display.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !menu.hidden;
      document.querySelectorAll(".multi-select-menu").forEach(el => { el.hidden = true; el.previousElementSibling?.setAttribute("aria-expanded","false"); });
      menu.hidden = isOpen; // if open -> close, else open after closing others
      display.setAttribute("aria-expanded", String(!isOpen));
    });

    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!ms.contains(e.target)) {
        menu.hidden = true;
        display.setAttribute("aria-expanded", "false");
      }
    });

    ms.append(display, menu, hidden);
    wrapper.appendChild(ms);
    return wrapper;
  }

  // Boolean yes/no
  if (field.type === 'boolean') {
    const group = document.createElement('div');
    group.className = 'boolean-group';
    const yesId = `${field.key}_yes`;
    const noId = `${field.key}_no`;
    const name = `${field.key}_bool`; // radios share a group name

    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.id = field.key;

    const makeRadio = (id, value, labelText) => {
      const lbl = document.createElement('label');
      lbl.className = 'radio';
      const r = document.createElement('input');
      r.type = 'radio';
      r.name = name;
      r.id = id;
      r.value = value;
      r.addEventListener('change', () => {
        hidden.value = value;
        updateProgress();
        try { collectFormData(); generateReview(); } catch {}
      });
      const span = document.createElement('span');
      span.textContent = labelText;
      lbl.append(r, span);
      return lbl;
    };

    group.appendChild(makeRadio(yesId, 'Oui', 'Oui'));
    group.appendChild(makeRadio(noId, 'Non', 'Non'));
    wrapper.appendChild(group);
    wrapper.appendChild(hidden);
    return wrapper;
  }

  let input;

  switch (field.type) {
    case "textarea":
      input = document.createElement("textarea");
      input.id = field.key;
      input.placeholder = field.placeholder || field.label;
      input.addEventListener("input", () => updateProgress());
      // Wide textareas: span both columns when possible
      wrapper.style.gridColumn = "1 / -1";
      break;
    case "number":
      input = document.createElement("input");
      input.type = "number";
      input.id = field.key;
      input.min = "0";
      input.max = String(field.max ?? 10);
      input.step = "0.1";
      input.placeholder = "0 - 10";
      input.addEventListener("input", () => {
        clampNumericValue(input, field.max ?? 10);
        updateSectionTotal(sectionIndex, section.totalKeys ?? []);
        updateProgress();
      });
      break;
    case "file":
      // Custom themed file input (button + filename)
      const fileWrap = document.createElement("div");
      fileWrap.className = "file-input";
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = field.key;
      fileInput.accept = "image/*";
      fileInput.className = "file-input-hidden";
      const fileBtn = document.createElement("button");
      fileBtn.type = "button";
      fileBtn.className = "btn btn-outline file-select-btn";
      fileBtn.innerHTML = '<span aria-hidden="true">📷</span> Choisir un fichier';
      const fileName = document.createElement("span");
      fileName.className = "file-name";
      fileName.textContent = "Aucun fichier";
      fileBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", () => {
        const name = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : "Aucun fichier";
        fileName.textContent = name;
        updateProgress();
      });
      fileWrap.append(fileBtn, fileName, fileInput);
      wrapper.appendChild(fileWrap);
      return wrapper;
    default:
      input = document.createElement("input");
      input.type = "text";
      input.id = field.key;
      input.placeholder = field.placeholder || field.label;
      input.addEventListener("input", () => updateProgress());
  }

  wrapper.appendChild(input);
  return wrapper;
}

// Toggle conditional field visibility: currently used to show mesh sizes when sequence contains a sieve step
function updateConditionalVisibility() {
  // Determine if the current Hash separation pipeline contains any sieve/tamis related step
  let hasSieve = false;
  try {
    const hidden = document.getElementById('pipelineSeparation');
    if (hidden && hidden.dataset.sequence === 'true') {
      const arr = JSON.parse(hidden.value || '[]');
      const names = Array.isArray(arr) ? arr.map(v => (v && typeof v === 'object') ? (v.name || '') : String(v)) : [];
      const joined = names.join(' ').toLowerCase();
      hasSieve = /tamis|bubble|ice\s*hash|whole\s*plant\s*fresh\s*frozen|wpff|dry\s*tamis|tamisage/.test(joined);
    }
  } catch {}

  // Show/hide the tamis field if present
  const tamisField = document.getElementById('tamisMaillages')?.closest('.field-group');
  if (tamisField && tamisField.dataset.conditional === 'true') {
    tamisField.style.display = hasSieve ? '' : 'none';
  }
}

function clampNumericValue(input, max) {
  if (!input) {
    return;
  }
  let value = parseFloat(input.value);
  if (Number.isNaN(value)) {
    return;
  }
  value = Math.min(Math.max(value, 0), max);
  input.value = value.toString();
}

// Helpers to rehydrate complex fields when loading a review
function rehydrateSequenceField(fieldId, steps) {
  const hidden = document.getElementById(fieldId);
  if (!hidden) return;
  const container = hidden.closest('.sequence');
  const list = container?.querySelector('ol.sequence-list');
  const display = container?.querySelector('.multi-select-display');
  if (!list) return;
  list.innerHTML = '';
  function isSieveStep(name) {
    const n = (name || '').toLowerCase();
    return /tamis|bubble|ice\s*hash|ice\s*dry|wpff/.test(n);
  }
  function isRosinStep(name) {
    const n = (name || '').toLowerCase();
    return /rosin|pressage\s*(à|a)\s*chaud/.test(n);
  }
  function isCO2Step(name) {
    const n = (name || '').toLowerCase();
    return /(co2|co₂).*(supercritique)/.test(n);
  }
  function createItem(text, meta = {}) {
    const li = document.createElement('li');
    li.className = 'sequence-item';
    const label = document.createElement('span');
    label.className = 'step-label';
    label.textContent = text;
    const actions = document.createElement('span');
    actions.className = 'step-actions';
    const up = document.createElement('button'); up.type='button'; up.className='step-move'; up.title='Monter'; up.textContent='↑';
    const down = document.createElement('button'); down.type='button'; down.className='step-move'; down.title='Descendre'; down.textContent='↓';
    const del = document.createElement('button'); del.type='button'; del.className='step-del'; del.title='Supprimer'; del.textContent='✕';
    actions.append(up, down, del);
    li.append(label, actions);
    // Extra metadata editors per step type
    const n = (text || '').toString();
    if (isSieveStep(n) || isRosinStep(n)) {
      if (isSieveStep(n)) li.dataset.sieve = 'true';
      if (isRosinStep(n)) li.dataset.rosin = 'true';
      const extra = document.createElement('div');
      extra.className = 'step-extra';
      const pair = document.createElement('div');
      pair.className = 'mesh-pair';
      const minInput = document.createElement('input');
      minInput.type = 'text';
      minInput.placeholder = 'min (µm)';
      minInput.setAttribute('data-mesh-min', '');
      const maxInput = document.createElement('input');
      maxInput.type = 'text';
      maxInput.placeholder = 'max (µm)';
      maxInput.setAttribute('data-mesh-max', '');
      if (meta && meta.mesh) {
        try {
          const str = String(meta.mesh);
          const m = str.match(/(\d+)\s*[–-]\s*(\d+)/);
          if (m) {
            minInput.value = m[1];
            maxInput.value = m[2];
          } else {
            const single = str.match(/(\d+)/);
            if (single) { maxInput.value = single[1]; }
          }
        } catch {}
      }
      const onPairChange = () => {
        try {
          const arr = Array.from(list.querySelectorAll('li.sequence-item')).map(li2 => {
            const name2 = li2.querySelector('.step-label')?.textContent || '';
            if (!name2) return null;
            if (li2.dataset.sieve === 'true' || li2.dataset.rosin === 'true') {
              const minV2 = li2.querySelector('input[data-mesh-min]')?.value?.trim() || '';
              const maxV2 = li2.querySelector('input[data-mesh-max]')?.value?.trim() || '';
              const any2 = minV2 || maxV2;
              const mesh2 = (minV2 && maxV2) ? `${minV2}–${maxV2}` : (any2 ? `0–${minV2 || maxV2}` : '');
              const obj = { name: name2 };
              if (mesh2) obj.mesh = mesh2;
              if (li2.dataset.rosin === 'true') {
                const t = li2.querySelector('input[data-rosin-temp]')?.value?.trim() || '';
                if (t) obj.tempC = t;
              }
              return obj;
            }
            if (li2.dataset.co2 === 'true') {
              const p = li2.querySelector('input[data-co2-pressure]')?.value?.trim() || '';
              const t = li2.querySelector('input[data-co2-temp]')?.value?.trim() || '';
              const obj = { name: name2 };
              if (p) obj.pressureBar = p;
              if (t) obj.tempC = t;
              return obj;
            }
            return { name: name2 };
          }).filter(Boolean);
          const hasMeta = arr.some(e => e && typeof e === 'object' && Object.keys(e).some(k => k !== 'name'));
          hidden.value = JSON.stringify(hasMeta ? arr : arr.map(e => e?.name || ''));
          if (display) {
            display.innerHTML = arr.length ? arr.map(v => {
              const nm = (v && typeof v === 'object') ? (v.name || '') : String(v);
              const parts = [];
              if (v && typeof v === 'object') {
                if (v.mesh) parts.push(`${v.mesh}`);
                if (v.pressureBar) parts.push(`${v.pressureBar} bar`);
                if (v.tempC) parts.push(`${v.tempC}°C`);
              }
              const metaStr = parts.length ? ` <small style="opacity:.82;">(${parts.join(', ')})</small>` : '';
              return `<span class="chip">${nm}${metaStr}</span>`;
            }).join('') : 'Ajouter une étape';
          }
        } catch {}
      };
      minInput.addEventListener('input', onPairChange);
      maxInput.addEventListener('input', onPairChange);
      pair.append(minInput, maxInput);
      extra.appendChild(pair);
      // Rosin temp
      if (isRosinStep(n)) {
        const temp = document.createElement('input');
        temp.type = 'text';
        temp.placeholder = 'Température (°C)';
        temp.setAttribute('data-rosin-temp', '');
        if (meta && (meta.tempC || meta.temperature)) {
          temp.value = String(meta.tempC || meta.temperature);
        }
        temp.addEventListener('input', onPairChange);
        extra.appendChild(temp);
      }
      li.appendChild(extra);
    } else if (isCO2Step(n)) {
      li.dataset.co2 = 'true';
      const extra = document.createElement('div');
      extra.className = 'step-extra';
      const pressure = document.createElement('input');
      pressure.type = 'text';
      pressure.placeholder = 'Pression (bar)';
      pressure.setAttribute('data-co2-pressure', '');
      const temp = document.createElement('input');
      temp.type = 'text';
      temp.placeholder = 'Température (°C)';
      temp.setAttribute('data-co2-temp', '');
      if (meta) {
        if (meta.pressureBar) pressure.value = String(meta.pressureBar);
        if (meta.tempC || meta.temperature) temp.value = String(meta.tempC || meta.temperature);
      }
      const onChange = () => {
        try {
          const arr = Array.from(list.querySelectorAll('li.sequence-item')).map(li2 => {
            const name2 = li2.querySelector('.step-label')?.textContent || '';
            if (!name2) return null;
            if (li2.dataset.sieve === 'true' || li2.dataset.rosin === 'true') {
              const minV2 = li2.querySelector('input[data-mesh-min]')?.value?.trim() || '';
              const maxV2 = li2.querySelector('input[data-mesh-max]')?.value?.trim() || '';
              const any2 = minV2 || maxV2;
              const mesh2 = (minV2 && maxV2) ? `${minV2}–${maxV2}` : (any2 ? `0–${minV2 || maxV2}` : '');
              const obj = { name: name2 };
              if (mesh2) obj.mesh = mesh2;
              if (li2.dataset.rosin === 'true') {
                const t2 = li2.querySelector('input[data-rosin-temp]')?.value?.trim() || '';
                if (t2) obj.tempC = t2;
              }
              return obj;
            }
            if (li2.dataset.co2 === 'true') {
              const p2 = li2.querySelector('input[data-co2-pressure]')?.value?.trim() || '';
              const t2 = li2.querySelector('input[data-co2-temp]')?.value?.trim() || '';
              const obj = { name: name2 };
              if (p2) obj.pressureBar = p2;
              if (t2) obj.tempC = t2;
              return obj;
            }
            return { name: name2 };
          }).filter(Boolean);
          const hasMeta = arr.some(e => e && typeof e === 'object' && Object.keys(e).some(k => k !== 'name'));
          hidden.value = JSON.stringify(hasMeta ? arr : arr.map(e => e?.name || ''));
          if (display) {
            display.innerHTML = arr.length ? arr.map(v => {
              const nm = (v && typeof v === 'object') ? (v.name || '') : String(v);
              const parts = [];
              if (v && typeof v === 'object') {
                if (v.mesh) parts.push(`${v.mesh}`);
                if (v.pressureBar) parts.push(`${v.pressureBar} bar`);
                if (v.tempC) parts.push(`${v.tempC}°C`);
              }
              const metaStr = parts.length ? ` <small style="opacity:.82;">(${parts.join(', ')})</small>` : '';
              return `<span class="chip">${nm}${metaStr}</span>`;
            }).join('') : 'Ajouter une étape';
          }
        } catch {}
      };
      pressure.addEventListener('input', onChange);
      temp.addEventListener('input', onChange);
      extra.append(pressure, temp);
      li.appendChild(extra);
    }
    const serialize = () => {
      try {
        const arr = Array.from(list.querySelectorAll('li.sequence-item')).map(li2 => {
          const name2 = li2.querySelector('.step-label')?.textContent || '';
          if (!name2) return null;
          if (li2.dataset.sieve === 'true') {
            const minV2 = li2.querySelector('input[data-mesh-min]')?.value?.trim() || '';
            const maxV2 = li2.querySelector('input[data-mesh-max]')?.value?.trim() || '';
            const any2 = minV2 || maxV2;
            const mesh2 = (minV2 && maxV2) ? `${minV2}–${maxV2}` : (any2 ? `0–${minV2 || maxV2}` : '');
            return mesh2 ? { name: name2, mesh: mesh2 } : { name: name2 };
          }
          return { name: name2 };
        }).filter(Boolean);
        const hasMeta = arr.some(e => e && typeof e === 'object' && Object.keys(e).some(k => k !== 'name'));
        hidden.value = JSON.stringify(hasMeta ? arr : arr.map(e => e?.name || ''));
        if (display) {
          display.innerHTML = arr.length ? arr.map(v => {
            const nm = (v && typeof v === 'object') ? (v.name || '') : String(v);
            const ms = (v && typeof v === 'object' && v.mesh) ? ` <small style="opacity:.82;">(${v.mesh})</small>` : '';
            return `<span class="chip">${nm}${ms}</span>`;
          }).join('') : 'Ajouter une étape';
        }
        updateProgress();
      } catch {}
    };
    up.addEventListener('click', () => { if (li.previousElementSibling) { list.insertBefore(li, li.previousElementSibling); serialize(); } });
    down.addEventListener('click', () => { if (li.nextElementSibling) { list.insertBefore(li.nextElementSibling, li); serialize(); } });
    del.addEventListener('click', () => { li.remove(); serialize(); });
    return li;
  }
  const vals = Array.isArray(steps) ? steps : [];
  vals.forEach(s => {
    if (s && typeof s === 'object') {
      list.appendChild(createItem(String(s.name || ''), s));
    } else {
      list.appendChild(createItem(String(s || '')));
    }
  });
  // Set hidden to the same structure
  const hasMeta = vals.some(v => v && typeof v === 'object' && Object.keys(v).some(k => k !== 'name'));
  hidden.value = JSON.stringify(hasMeta ? vals : vals.map(v => typeof v === 'object' ? (v?.name || '') : v));
  if (display) {
    display.innerHTML = vals.length ? vals.map(v => {
      const nm = (v && typeof v === 'object') ? (v.name || '') : String(v);
      const parts = [];
      if (v && typeof v === 'object') {
        if (v.mesh) parts.push(`${v.mesh}`);
        if (v.pressureBar) parts.push(`${v.pressureBar} bar`);
        if (v.tempC) parts.push(`${v.tempC}°C`);
      }
      const metaStr = parts.length ? ` <small style="opacity:.82;">(${parts.join(', ')})</small>` : '';
      return `<span class="chip">${nm}${metaStr}</span>`;
    }).join('') : 'Ajouter une étape';
  }
  try { updateConditionalVisibility(); } catch {}
}

function rehydrateMultipleChoice(fieldId, selections) {
  const hidden = document.getElementById(fieldId);
  if (!hidden) return;
  const setSel = new Set(Array.isArray(selections) ? selections : []);
  // Legacy checkbox grid
  const container = hidden.closest('.multiple-choice-container');
  if (container) {
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = setSel.has(cb.value);
    });
    hidden.value = JSON.stringify(Array.from(setSel));
    return;
  }
  // New multi-select dropdown
  const ms = hidden.closest('.multi-select');
  if (ms) {
    const menu = ms.querySelector('.multi-select-menu');
    const display = ms.querySelector('.multi-select-display');
    menu?.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = setSel.has(cb.value);
    });
    hidden.value = JSON.stringify(Array.from(setSel));
    if (display) {
      const arr = Array.from(setSel);
      display.innerHTML = arr.length ? arr.map(v => `<span class="chip">${v}</span>`).join('') : 'Sélectionner';
    }
  }
}

function rehydrateBoolean(fieldId, value) {
  const hidden = document.getElementById(fieldId);
  if (!hidden) return;
  const group = hidden.previousElementSibling;
  const val = String(value || '').toLowerCase();
  // Accept 'Oui'/'Non' or 'true'/'false'
  let norm;
  if (val === 'true' || val === 'oui' || val === 'yes') norm = 'oui';
  else if (val === 'false' || val === 'non' || val === 'no') norm = 'non';
  // Set radios
  const radios = group?.querySelectorAll(`input[type="radio"][name="${fieldId}_bool"]`) || [];
  radios.forEach(r => {
    const v = r.value.toLowerCase();
    r.checked = (norm ? (norm === 'oui' ? v === 'oui' : v === 'non') : false);
  });
  hidden.value = norm === 'non' ? 'Non' : (norm === 'oui' ? 'Oui' : '');
}

function rehydrateCultivarList(fieldId, cultivars) {
  const hidden = document.getElementById(fieldId);
  if (!hidden || !hidden.dataset.cultivarList) return;
  const container = hidden.closest('.cultivar-list');
  const list = container?.querySelector('.cultivar-items');
  if (!list) return;
  
  hidden.value = JSON.stringify(cultivars);
  
  // Clear and rebuild
  list.innerHTML = '';
  const addBtn = container.querySelector('.add-cultivar-btn');
  
  cultivars.forEach(c => {
    // Trigger the add button to create items (simulate click but pass data)
    if (addBtn) {
      addBtn.click();
      // Get the last added item and populate it
      const items = list.querySelectorAll('.cultivar-item');
      const lastItem = items[items.length - 1];
      if (lastItem) {
        lastItem.querySelector('[data-cultivar-name]').value = c.name || '';
        lastItem.querySelector('[data-cultivar-farm]').value = c.farm || '';
        lastItem.querySelector('[data-cultivar-breeder]').value = c.breeder || '';
        if (c.matiere && Array.isArray(c.matiere)) {
          c.matiere.forEach(m => {
            const cb = lastItem.querySelector(`[data-cultivar-matiere][value="${m}"]`);
            if (cb) cb.checked = true;
          });
        }
      }
    }
  });
}

function rehydratePipelineWithCultivars(fieldId, steps) {
  const hidden = document.getElementById(fieldId);
  if (!hidden || !hidden.dataset.pipelineWithCultivars) return;
  const container = hidden.closest('.pipeline-with-cultivars');
  const list = container?.querySelector('.pipeline-list');
  const menu = container?.querySelector('.multi-select-menu');
  if (!list || !menu) return;
  
  hidden.value = JSON.stringify(steps);
  
  // Clear and rebuild
  list.innerHTML = '';
  
  steps.forEach(step => {
    const stepName = (step && typeof step === 'object') ? step.name : String(step);
    if (!stepName) return;
    
    // Find and click the menu option to add the step
    const options = Array.from(menu.querySelectorAll('.multi-select-option'));
    const opt = options.find(o => o.textContent.trim() === stepName);
    if (opt) {
      opt.click();
      
      // Get the last added item and populate metadata
      const items = list.querySelectorAll('.pipeline-item');
      const lastItem = items[items.length - 1];
      if (lastItem && typeof step === 'object') {
        // Set cultivars
        if (step.cultivars && Array.isArray(step.cultivars)) {
          step.cultivars.forEach(cv => {
            const cb = lastItem.querySelector(`[data-step-cultivar][value="${cv}"]`);
            if (cb) cb.checked = true;
          });
        }
        
        // Set mesh/temp/pressure
        if (step.mesh) {
          try {
            const str = String(step.mesh);
            const m = str.match(/(\d+)\s*[–-]\s*(\d+)/);
            if (m) {
              const minInput = lastItem.querySelector('[data-mesh-min]');
              const maxInput = lastItem.querySelector('[data-mesh-max]');
              if (minInput) minInput.value = m[1];
              if (maxInput) maxInput.value = m[2];
            } else {
              const single = str.match(/(\d+)/);
              if (single) {
                const maxInput = lastItem.querySelector('[data-mesh-max]');
                if (maxInput) maxInput.value = single[1];
              }
            }
          } catch {}
        }
        
        if (step.tempC || step.temperature) {
          const tempInput = lastItem.querySelector('[data-rosin-temp], [data-co2-temp]');
          if (tempInput) tempInput.value = String(step.tempC || step.temperature);
        }
        
        if (step.pressureBar) {
          const pressureInput = lastItem.querySelector('[data-co2-pressure]');
          if (pressureInput) pressureInput.value = String(step.pressureBar);
        }
      }
    }
  });
}

function setReadOnly(on) {
  isReadOnlyView = !!on;
  const disable = !!on;
  getSections().forEach(section => {
    section.querySelectorAll('input, textarea, select, button.sequence-add, .step-move, .step-del, .multi-select-display').forEach(el => {
      if (el instanceof HTMLButtonElement) {
        el.disabled = disable;
      } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        if (el.type !== 'file') el.disabled = disable;
      }
    });
  });
  // Toggle generate button
  if (dom.generateBtn) dom.generateBtn.disabled = disable;
}

function updateSectionTotal(sectionIndex, keys) {
  if (!keys || keys.length === 0) {
    return;
  }

  let sum = 0;

  keys.forEach(key => {
    const field = document.getElementById(key);
    const numericValue = parseFloat(field?.value ?? "");
    if (!Number.isNaN(numericValue)) {
      sum += numericValue;
    }
  });

  totals[`section-${sectionIndex}`] = {
    sum,
    max: keys.length * 10
  };

  const totalSpan = document.getElementById(`total-value-${sectionIndex}`);
  if (totalSpan) {
    totalSpan.textContent = sum.toFixed(1);
  }
}

function recalculateTotals() {
  if (!currentType || !productStructures[currentType]) {
    return;
  }

  const structure = productStructures[currentType];
  structure.sections.forEach((section, index) => {
    if (section.total && Array.isArray(section.totalKeys) && section.totalKeys.length > 0) {
      updateSectionTotal(index, section.totalKeys);
    }
  });
}

function getSectionFillState(sectionEl) {
  if (!sectionEl) {
    return { total: 0, filled: 0 };
  }

  const inputs = sectionEl.querySelectorAll("input, textarea, select");
  let total = 0;
  let filled = 0;

  inputs.forEach(input => {
    if (input.disabled) {
      return;
    }

    // Count sequence hidden fields as a single item for progress (data-sequence="true")
    if (input.type === "hidden") {
      if (input.dataset.sequence === "true") {
        total += 1;
        if (input.value && input.value.trim().length > 0 && input.value !== "[]") {
          filled += 1;
        }
      } else {
        // Handle multiple-choice hidden fields
        total += 1;
        if (input.value && input.value.trim().length > 0 && input.value !== "[]") {
          filled += 1;
        }
      }
      return;
    }

    // Skip checkboxes as they're handled by their hidden field
    if (input.type === "checkbox") {
      return;
    }

    if (input.type === "file") {
      total += 1;
      if (input.files && input.files.length > 0) {
        filled += 1;
      }
      return;
    }

    total += 1;
    if (input.value && input.value.trim().length > 0) {
      filled += 1;
    }
  });

  return { total, filled };
}

function updateSectionCompletionState() {
  const sections = getSections();
  sections.forEach((section, index) => {
    const { total, filled } = getSectionFillState(section);
    const button = dom.sectionNavButtons?.[index];
    if (!button) {
      return;
    }
    const completed = total > 0 && filled >= total;
    button.classList.toggle("completed", completed);
    button.title = completed
      ? `${section.querySelector("h2")?.textContent ?? "Section"} ✔`
      : `${section.querySelector("h2")?.textContent ?? "Section"} (${filled}/${total})`;
  });
}

function updateProgress(forceValue) {
  const progressBar = document.getElementById("progressBar");
  if (!progressBar) {
    return;
  }

  if (typeof forceValue === "number") {
    setProgress(progressBar, Math.min(100, Math.max(0, forceValue)));
    return;
  }

  let totalFields = currentType ? 1 : 0;
  let completedFields = currentType ? 1 : 0;

  const sections = getSections();
  sections.forEach(section => {
    const { total, filled } = getSectionFillState(section);
    totalFields += total;
    completedFields += filled;
  });

  const computed = totalFields === 0 ? 0 : Math.round((completedFields / totalFields) * 100);
  const baseline = currentType ? Math.max(computed, 12) : computed;
  setProgress(progressBar, Math.min(baseline, 98));
  updateSectionCompletionState();

  // Toggle Library indicator (orange dot) when note is not complete
  const libBtn = document.getElementById('openLibrary');
  if (libBtn) {
    if (baseline < 98) libBtn.classList.add('has-indicator');
    else libBtn.classList.remove('has-indicator');
  }
}

function setProgress(element, value) {
  element.style.width = `${value}%`;
  element.setAttribute("aria-valuemin", "0");
  element.setAttribute("aria-valuemax", "100");
  element.setAttribute("aria-valuenow", String(value));
}

function handleSubmit(event) {
  event.preventDefault();

  if (!currentType) {
    showToast("Sélectionnez un type de produit avant de générer la review.", "warning");
    return;
  }

  if (!dom.dynamicSections || dom.dynamicSections.children.length === 0) {
    showToast("Complétez les informations du produit pour continuer.", "warning");
    return;
  }

  collectFormData();
}

function collectFormData() {
  // Preserve existing data and only update with current form values
  if (!formData) {
    formData = { productType: currentType };
  } else {
    formData.productType = currentType;
  }
  let fileReaders = [];

  const sections = getSections();
  sections.forEach(section => {
    const inputs = section.querySelectorAll("input, textarea, select");
    inputs.forEach(input => {
      if (!input.id) {
        return;
      }

      if (input.type === "file") {
        if (input.files && input.files[0]) {
          fileReaders.push(readFileAsDataURL(input.files[0]));
        }
        return;
      }

      const value = input.value?.trim();
      if (value) {
        formData[input.id] = value;
      } else {
        // Remove empty values, but preserve data that's not in current form
        if (input.id in formData) {
          delete formData[input.id];
        }
      }
    });
  });

  recalculateTotals();

  // Auto-generate and auto-save to Library (no manual generate)
  const finalize = () => {
    try { generateReview(); } catch {}
    if (dbSaveTimer) clearTimeout(dbSaveTimer);
    dbSaveTimer = setTimeout(async () => { 
      // Sauvegarder automatiquement seulement si le contenu est significatif
      if (hasSignificantContent()) {
        // Si la review a déjà été enregistrée explicitement, ne pas la repasser en brouillon
        await saveReview(isNonDraftRecord ? false : true);
        // Rafraîchir la bibliothèque compacte immédiatement après sauvegarde
        renderCompactLibrary();
      }
    }, 1000); // Augmenté de 400ms à 1000ms pour réduire la fréquence
    updateProgress();
  };

  if (fileReaders.length) {
    Promise.all(fileReaders)
      .then(results => {
        if (results.length > 0) {
          imageUrl = results[0];
        }
        finalize();
      })
      .catch(error => {
        console.error("Erreur lors de la lecture du fichier", error);
        showToast("Une erreur est survenue lors du traitement de la photo.", "error");
        finalize();
      });
  } else {
    finalize();
  }
}

// Build a smart default name depending on product type and filled fields
function buildSuggestedName() {
  const type = currentType || formData.productType || '';
  const val = (k) => (formData[k] || '').toString().trim();
  // Try to parse arrays from JSON strings where relevant
  const parseArr = (v) => { try { const a = JSON.parse(v||''); return Array.isArray(a) ? a : []; } catch { return []; } };
  const namesOnly = (arr) => (Array.isArray(arr) ? arr.map(x => (x && typeof x === 'object') ? (x.name || '') : String(x)).filter(Boolean) : []);
  
  // Helper to get cultivar names from cultivarsList
  const getCultivarNames = () => {
    try {
      const list = JSON.parse(formData['cultivarsList'] || '[]');
      return Array.isArray(list) ? list.map(c => c.name).filter(Boolean).join(', ') : '';
    } catch {
      return val('cultivars'); // Fallback to old field
    }
  };
  
  let parts = [];
  if (type === 'Hash') {
    const cultivars = getCultivarNames() || val('cultivars');
    const farms = (() => {
      try {
        const list = JSON.parse(formData['cultivarsList'] || '[]');
        const farmList = list.map(c => c.farm).filter(Boolean);
        return farmList.length ? [...new Set(farmList)].join(', ') : val('farm');
      } catch {
        return val('farm');
      }
    })();
    parts = [cultivars, farms];
    const sep = namesOnly(parseArr(formData['pipelineSeparation'])).join(' → ');
    if (sep) parts.push(sep);
  } else if (type === 'Concentré') {
    const cultivars = getCultivarNames() || val('cultivars');
    const farms = (() => {
      try {
        const list = JSON.parse(formData['cultivarsList'] || '[]');
        const farmList = list.map(c => c.farm).filter(Boolean);
        return farmList.length ? [...new Set(farmList)].join(', ') : val('farm');
      } catch {
        return val('farm');
      }
    })();
    parts = [cultivars, farms];
    const pipe = namesOnly(parseArr(formData['pipelineExtraction'])).join(' → ');
    const typeExt = val('typeExtraction');
    const add = [typeExt, pipe].filter(Boolean).join(' • ');
    if (add) parts.push(add);
  } else if (type === 'Fleur') {
    parts = [val('cultivars'), val('breeder'), val('farm')];
    const typeCult = val('typeCulture');
    if (typeCult) parts.push(typeCult);
  } else if (type === 'Comestible') {
    parts = [val('productName') || val('cultivars'), val('marque') || val('farm')];
    const t = val('typeComestible'); if (t) parts.push(t);
  } else {
    parts = [val('cultivars') || val('productName'), type];
  }
  const cleaned = parts.filter(Boolean).join(' - ').replace(/\s{2,}/g,' ').trim();
  return cleaned || (val('cultivars') || type || 'Review');
}

// Create a stable correlation key to relate drafts and finals of the same review
// Uses productType + productName (or cultivar/strain fallback) + farm, normalized
function removeDiacritics(str) {
  try { return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch { return str; }
}
function normalizePart(str) {
  if (!str) return '';
  return removeDiacritics(String(str).toLowerCase().trim().replace(/\s+/g, ' '));
}
function computeCorrelationKey(obj) {
  const type = normalizePart(obj?.productType || '');
  const name = normalizePart(
    obj?.productName || obj?.cultivars || obj?.strain || obj?.title || obj?.name || ''
  );
  const breeder = normalizePart(obj?.breeder || obj?.breeders || '');
  const farm = normalizePart(obj?.farm || '');
  return `${type}::${name}::${breeder}::${farm}`;
}

// Loose key to catch drafts saved before breeder/farm were filled
function computeLooseKey(obj) {
  const type = normalizePart(obj?.productType || '');
  const name = normalizePart(
    obj?.productName || obj?.cultivars || obj?.strain || obj?.title || obj?.name || ''
  );
  return `${type}::${name}`;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target?.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---- Save modal helpers ----
function openSaveModal() {
  if (!dom.saveModal) return;
  try {
    // Hide preview-only overlay/modal if visible to avoid stacking issues
    dom.previewOverlay?.setAttribute('hidden','');
    dom.previewModal?.setAttribute('hidden','');
  } catch {}
  dom.saveModal.style.display = 'flex';
  // In case some global style toggled visibility via hidden attr
  dom.saveModal.removeAttribute('hidden');
  console.debug('[ui] Save modal opened');
}
function closeSaveModal() {
  if (!dom.saveModal) return;
  dom.saveModal.style.display = 'none';
}

// -------- Backend distant (API REST) --------
async function tryEnableRemote() {
  try {
    // If hosted under /reviews, use that as base-path; otherwise root
    const basePath = (typeof location !== 'undefined' && location.pathname && location.pathname.startsWith('/reviews')) ? '/reviews' : '';
  const headers = {};
  const token = (localStorage.getItem('authToken') || new URLSearchParams(location.search).get('token'));
  if (token) headers['X-Auth-Token'] = token;
  const r = await fetch(basePath + '/api/ping', { cache: 'no-store', headers });
    if (!r.ok) return;
    const js = await r.json();
    if (js && js.ok) {
      remoteEnabled = true;
      remoteBase = basePath; // ensure subsequent calls hit /reviews/api when relevant
      console.info('[remote] API détectée');
      // Toast supprimé pour ne pas surcharger l'UI
      renderCompactLibrary();
    }
  } catch {}
}

async function remoteListReviews() {
  if (!remoteEnabled) return dbGetAllReviews();
  try {
    const headers = {};
    const token = (localStorage.getItem('authToken') || new URLSearchParams(location.search).get('token'));
    if (token) headers['X-Auth-Token'] = token;
    const r = await fetch(remoteBase + '/api/reviews', { headers });
    if (!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  } catch (e) { console.warn('Remote list erreur', e); return dbGetAllReviews(); }
}

// List only public reviews (for public gallery)
async function remoteListPublicReviews() {
  if (!remoteEnabled) return [];
  try {
    const r = await fetch(remoteBase + '/api/public/reviews');
    if (!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  } catch (e) { 
    console.warn('Remote public list error', e); 
    return []; 
  }
}

// List only MY reviews (for personal library)
async function remoteListMyReviews() {
  if (!remoteEnabled) return dbGetAllReviews();
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return [];
    
    const headers = { 'X-Auth-Token': token };
    const r = await fetch(remoteBase + '/api/my/reviews', { headers });
    if (!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  } catch (e) { 
    console.warn('Remote my reviews error', e); 
    return dbGetAllReviews(); 
  }
}

// Liste unifiée des reviews (serveur + locale) avec déduplication par correlationKey.
// On préfère les versions serveur lorsqu'elles existent, mais on ne perd pas les brouillons locaux
// si l'API renvoie une liste vide ou encore non synchronisée.
async function listUnifiedReviews() {
  const basePath = (typeof location !== 'undefined' && location.pathname && location.pathname.startsWith('/reviews')) ? '/reviews' : '';
  const normalizeImage = (img) => {
    try {
      if (!img || typeof img !== 'string') return img;
      if (img.startsWith('data:')) return img; // base64 local
      if (basePath && img.startsWith('/images/')) return basePath + img;
      return img;
    } catch { return img; }
  };

  let local = [];
  try { local = await dbGetAllReviews(); } catch {}
  if (!remoteEnabled) {
    return (local || []).map(r => ({ ...r, image: normalizeImage(r.image) }));
  }
  let remote = [];
  try { remote = await remoteListReviews(); } catch {}
  // Si le serveur ne renvoie rien, ne pas écraser les locales
  if (!Array.isArray(remote) || remote.length === 0) {
    return (local || []).map(r => ({ ...r, image: normalizeImage(r.image) }));
  }

  const strictKey = (r) => (r && (r.correlationKey || computeCorrelationKey(r))) || null;
  const looseKey = (r) => computeLooseKey(r);

  const localByStrict = new Map();
  const localByLoose = new Map();
  for (const r of local || []) {
    const s = strictKey(r) || `local-${r.id ?? Math.random()}`;
    localByStrict.set(s, { ...r, image: normalizeImage(r.image) });
    const l = looseKey(r);
    if (l && !localByLoose.has(l)) localByLoose.set(l, r);
  }

  const mergedByStrict = new Map();
  const usedLocalStrict = new Set();

  // Merge remote entries with local ones by strict key, otherwise by loose key
  for (const r of remote || []) {
    const normRemote = { ...r, image: normalizeImage(r.image) };
    const s = strictKey(r) || `remote-${r.id ?? Math.random()}`;
    let base = localByStrict.get(s);
    if (!base) {
      const l = looseKey(r);
      if (l && localByLoose.has(l)) {
        const candidate = localByLoose.get(l);
        const s2 = strictKey(candidate) || `local-${candidate.id ?? Math.random()}`;
        base = localByStrict.get(s2);
        if (base) usedLocalStrict.add(s2);
      }
    } else {
      usedLocalStrict.add(s);
    }
    if (base) {
      const merged = { ...base, ...normRemote };
      if (!normRemote.image && base.image) merged.image = base.image;
      mergedByStrict.set(s, merged);
    } else {
      mergedByStrict.set(s, normRemote);
    }
  }

  // Add remaining local entries not matched by any remote (keep drafts)
  // But filter out private reviews that are only local (they shouldn't be shown in public gallery)
  for (const [s, r] of localByStrict.entries()) {
    if (usedLocalStrict.has(s)) continue;
    // Don't add local-only private reviews to the unified list
    // They will only be visible in "Ma bibliothèque" via /api/my/reviews
    if (r.isPrivate && !r.id) continue; // Skip local-only private reviews
    if (!mergedByStrict.has(s)) mergedByStrict.set(s, r);
  }

  // Stable sort: by date desc, then image-first, then name
  const arr = Array.from(mergedByStrict.values());
  arr.sort((a, b) => {
    const da = new Date(a.date || 0).getTime();
    const db = new Date(b.date || 0).getTime();
    if (db !== da) return db - da;
    const ia = a.image ? 1 : 0;
    const ib = b.image ? 1 : 0;
    if (ib !== ia) return ib - ia;
    const na = (a.productName || a.cultivars || '').localeCompare(b.productName || b.cultivars || '');
    return na;
  });
  return arr;
}

// Récupération d'une review précise via l'API distante
async function remoteGetReview(id) {
  if (!remoteEnabled || id == null) return null;
  try {
    const headers = {};
    const token = (localStorage.getItem('authToken') || new URLSearchParams(location.search).get('token'));
    if (token) headers['X-Auth-Token'] = token;
    const r = await fetch(`${remoteBase}/api/reviews/${id}`, { headers });
    if (!r.ok) throw new Error('HTTP '+r.status);
    return await r.json();
  } catch (e) {
    console.warn('Remote get erreur', e);
    return null;
  }
}

async function remoteSave(reviewObj) {
  if (!remoteEnabled) return { ok: false, error: 'remote_disabled' };
  try {
    const method = reviewObj.id ? 'PUT' : 'POST';
    const url = remoteBase + '/api/reviews' + (reviewObj.id ? '/' + reviewObj.id : '');
    const token = (localStorage.getItem('authToken') || new URLSearchParams(location.search).get('token'));
    const headers = token ? { 'X-Auth-Token': token } : {};
    let resp;
    if (lastSelectedImageFile instanceof File) {
      const fd = new FormData();
      fd.append('data', JSON.stringify(reviewObj));
      fd.append('image', lastSelectedImageFile, lastSelectedImageFile.name);
      resp = await fetch(url, { method, body: fd, headers });
    } else {
      const copy = { ...reviewObj };
      if (copy.image && copy.image.length > 50000) delete copy.image; // éviter gros base64
      resp = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...(token ? { 'X-Auth-Token': token } : {}) }, body: JSON.stringify(copy) });
    }
    const status = resp.status;
    let js = null;
    try { js = await resp.json(); } catch {}
    if (!resp.ok) {
      return { ok: false, status, ...(js || {}), message: js?.message || ('HTTP '+status) };
    }
    return { ok: true, review: js?.review || js };
  } catch (e) {
    console.warn('Remote save erreur', e);
    return { ok: false, error: 'network_error', message: String(e?.message || e) };
  }
}

// Suppression d'une review côté serveur (si backend actif)
async function remoteDeleteReview(id) {
  if (!remoteEnabled || id == null) return false;
  try {
    const headers = {};
    const token = (localStorage.getItem('authToken') || new URLSearchParams(location.search).get('token'));
    if (token) headers['X-Auth-Token'] = token;
    const r = await fetch(`${remoteBase}/api/reviews/${id}`, { method: 'DELETE', headers });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return true;
  } catch (e) {
    console.warn('Remote delete erreur', e);
    return false;
  }
}

// Basculer la confidentialité côté serveur
async function remoteTogglePrivacy(id, isPrivate) {
  if (!remoteEnabled || id == null) return false;
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = (localStorage.getItem('authToken') || new URLSearchParams(location.search).get('token'));
    if (token) headers['X-Auth-Token'] = token;
    const r = await fetch(`${remoteBase}/api/reviews/${id}/privacy`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ isPrivate: !!isPrivate })
    });
    if (!r.ok) return false;
    return true;
  } catch (e) {
    console.warn('Remote privacy erreur', e);
    return false;
  }
}

// Preview mode management
let currentPreviewMode = localStorage.getItem('previewMode') || 'detailed';

function setPreviewMode(mode) {
  currentPreviewMode = mode;
  localStorage.setItem('previewMode', mode);
  
  // Update UI buttons
  document.querySelectorAll('.preview-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  
  // Regenerate preview
  generateReview();
  
  // Update modal content if it's open
  if (dom.previewModal && !dom.previewModal.hasAttribute('hidden')) {
    const html = dom.reviewContent?.innerHTML || '';
    if (dom.previewModalContent) dom.previewModalContent.innerHTML = html;
  }
}

// Rendre la fonction accessible globalement
window.setPreviewMode = setPreviewMode;

function generateReview() {
  if (!dom.reviewContent || !dom.reviewOutput) {
    return;
  }

  // Generate based on current mode
  switch (currentPreviewMode) {
    case 'compact':
      generateCompactPreview();
      break;
    case 'detailed':
      generateDetailedPreview();
      break;
    case 'card':
      generateCardPreview();
      break;
    case 'minimal':
      generateMinimalPreview();
      break;
    default:
      generateDetailedPreview();
  }
  
  // Always generate full review for export
  generateFullReview();
}

// Helper functions for preview generation
function getPreviewData() {
  const structure = productStructures[currentType];
  
  // Get cultivar info
  const getCultivarInfo = () => {
    try {
      const list = JSON.parse(formData['cultivarsList'] || '[]');
      if (Array.isArray(list) && list.length > 0) {
        return {
          title: list.map(c => c.name).filter(Boolean).join(' + ') || formData.cultivars || formData.productType || "Review en cours",
          details: list
        };
      }
    } catch {}
    return {
      title: formData.cultivars || formData.productType || "Review en cours",
      details: null
    };
  };
  
  const cultivarInfo = getCultivarInfo();
  
  // Product icons
  const productIcons = {
    'Hash': '🧊',
    'Fleur': '🌸', 
    'Concentré': '💎',
    'Comestible': '🍬'
  };

  // Calculate global score
  let globalScore = 0;
  let maxGlobalScore = 0;
  let sectionsWithData = 0;
  
  Object.values(totals).forEach(section => {
    if (section.sum && section.max) {
      globalScore += section.sum;
      maxGlobalScore += section.max;
      sectionsWithData++;
    }
  });
  
  const scoreOutOf10 = maxGlobalScore > 0 ? (globalScore / maxGlobalScore * 10) : 0;
  const percentage = maxGlobalScore > 0 ? (globalScore / maxGlobalScore * 100) : 0;
  
  return {
    structure,
    cultivarInfo,
    productIcon: productIcons[currentType] || '🌿',
    globalScore,
    maxGlobalScore,
    sectionsWithData,
    scoreOutOf10,
    percentage
  };
}

// MODE 1: COMPACT - Vue condensée avec scores principaux
function generateCompactPreview() {
  const data = getPreviewData();
  
  let html = `
    <div class="preview-compact">
      <div class="preview-mode-selector">
        <button class="preview-mode-btn ${currentPreviewMode === 'minimal' ? 'active' : ''}" data-mode="minimal" onclick="setPreviewMode('minimal')" title="Mode minimal">
          <span>━</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'compact' ? 'active' : ''}" data-mode="compact" onclick="setPreviewMode('compact')" title="Mode compact">
          <span>▤</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'detailed' ? 'active' : ''}" data-mode="detailed" onclick="setPreviewMode('detailed')" title="Mode détaillé">
          <span>☰</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'card' ? 'active' : ''}" data-mode="card" onclick="setPreviewMode('card')" title="Mode carte">
          <span>▣</span>
        </button>
      </div>
      
      <div class="compact-header">
        <div class="compact-badge">
          <span class="compact-icon">${data.productIcon}</span>
          <span class="compact-type">${currentType}</span>
        </div>
        <h3 class="compact-title">${data.cultivarInfo.title}</h3>
      </div>`;

  if (data.maxGlobalScore > 0) {
    html += `
      <div class="compact-score">
        <div class="compact-score-circle">
          <svg class="score-ring" viewBox="0 0 100 100">
            <circle class="score-ring-bg" cx="50" cy="50" r="45" />
            <circle class="score-ring-fill" cx="50" cy="50" r="45" 
              style="stroke-dasharray: ${data.percentage * 2.827}, 282.7" />
          </svg>
          <div class="score-ring-content">
            <span class="score-ring-value">${data.scoreOutOf10.toFixed(1)}</span>
            <span class="score-ring-unit">/10</span>
          </div>
        </div>
        <div class="compact-score-details">
          <div class="compact-score-item">
            <span class="score-label">Score total</span>
            <span class="score-value">${data.globalScore.toFixed(1)}/${data.maxGlobalScore}</span>
          </div>
          <div class="compact-score-item">
            <span class="score-label">Sections</span>
            <span class="score-value">${data.sectionsWithData}/${data.structure.sections.length}</span>
          </div>
        </div>
      </div>`;
  }

  html += '<div class="compact-sections">';
  data.structure.sections.forEach((section, index) => {
    const sectionScore = totals[`section-${index}`];
    const hasData = section.fields.some(f => f.type !== "file" && formData[f.key]);
    
    if (!hasData) return;
    
    const scoreText = sectionScore ? `${sectionScore.sum.toFixed(1)}/${sectionScore.max}` : '';
    const scorePercent = sectionScore ? (sectionScore.sum / sectionScore.max * 100) : 0;
    
    html += `
      <div class="compact-section">
        <div class="compact-section-header">
          <span class="compact-section-title">${section.title}</span>
          <span class="compact-section-score">${scoreText}</span>
        </div>
        ${sectionScore ? `<div class="compact-section-bar">
          <div class="compact-section-fill" style="width: ${scorePercent}%"></div>
        </div>` : ''}
      </div>`;
  });
  
  html += '</div></div>';

  if (dom.reviewContent) {
    dom.reviewContent.innerHTML = html;
  }
  if (dom.previewPlaceholder) {
    dom.previewPlaceholder.classList.add("hidden");
  }
  dom.reviewOutput.hidden = false;
}

// MODE 2: DETAILED - Vue complète avec tous les détails
function generateDetailedPreview() {
  const data = getPreviewData();
  
  let html = `
    <div class="preview-detailed">
      <div class="preview-mode-selector">
        <button class="preview-mode-btn ${currentPreviewMode === 'minimal' ? 'active' : ''}" data-mode="minimal" onclick="setPreviewMode('minimal')" title="Mode minimal">
          <span>━</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'compact' ? 'active' : ''}" data-mode="compact" onclick="setPreviewMode('compact')" title="Mode compact">
          <span>▤</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'detailed' ? 'active' : ''}" data-mode="detailed" onclick="setPreviewMode('detailed')" title="Mode détaillé">
          <span>☰</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'card' ? 'active' : ''}" data-mode="card" onclick="setPreviewMode('card')" title="Mode carte">
          <span>▣</span>
        </button>
      </div>
      
      <div class="detailed-header">
        <div class="detailed-badge">
          <span>${data.productIcon}</span>
          <span>${currentType}</span>
        </div>
        <h2 class="detailed-title">${data.cultivarInfo.title}</h2>
      </div>`;

  // Cultivars details
  if (data.cultivarInfo.details && data.cultivarInfo.details.length > 0) {
    html += '<div class="detailed-cultivars">';
    data.cultivarInfo.details.forEach((c, idx) => {
      const meta = [];
      if (c.farm) meta.push(`📍 ${c.farm}`);
      if (c.breeder) meta.push(`🧬 ${c.breeder}`);
      if (c.matiere && c.matiere.length) meta.push(`🌱 ${c.matiere.join(', ')}`);
      
      html += `
        <div class="detailed-cultivar">
          <span class="cultivar-badge">${idx + 1}</span>
          <div class="cultivar-info">
            <strong>${c.name || ''}</strong>
            ${meta.length ? `<span class="cultivar-meta">${meta.join(' • ')}</span>` : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }

  // Global score
  if (data.maxGlobalScore > 0) {
    html += `
      <div class="detailed-global-score">
        <div class="global-score-main">
          <div class="global-score-circle">
            <svg class="score-ring" viewBox="0 0 120 120">
              <circle class="score-ring-bg" cx="60" cy="60" r="54" />
              <circle class="score-ring-fill" cx="60" cy="60" r="54" 
                style="stroke-dasharray: ${data.percentage * 3.393}, 339.3" />
            </svg>
            <div class="score-ring-content">
              <span class="score-ring-value">${data.scoreOutOf10.toFixed(1)}</span>
              <span class="score-ring-unit">/10</span>
            </div>
          </div>
          <div class="global-score-info">
            <h3>Score global</h3>
            <p class="score-breakdown">${data.globalScore.toFixed(1)} / ${data.maxGlobalScore} points</p>
            <p class="score-sections">${data.sectionsWithData} section${data.sectionsWithData > 1 ? 's' : ''} complétée${data.sectionsWithData > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>`;
  }

  // Sections detailed
  html += '<div class="detailed-sections">';
  data.structure.sections.forEach((section, index) => {
    const sectionScore = totals[`section-${index}`];
    let hasContent = false;
    const fields = [];
    
    section.fields.forEach(field => {
      if (field.type === "file") return;
      const value = formData[field.key];
      if (!value) return;
      
      hasContent = true;
      let displayValue = value;
      let fieldClass = "detailed-field";
      
      // Format value based on type
      if (field.type === "number") {
        const numValue = Number.parseFloat(value);
        const percent = (numValue / (field.max || 10)) * 100;
        displayValue = `
          <span class="field-number">${numValue.toFixed(1)}</span>
          <div class="field-bar">
            <div class="field-bar-fill" style="width: ${percent}%"></div>
          </div>`;
        fieldClass += " field-number-type";
      } else if (field.type === "sequence" || field.type === "pipeline-with-cultivars") {
        try {
          const steps = JSON.parse(value);
          if (Array.isArray(steps) && steps.length) {
            displayValue = `<ol class="field-sequence">
              ${steps.map(s => {
                const name = (s && typeof s === 'object') ? s.name : String(s);
                const parts = [];
                if (s.mesh) parts.push(`${s.mesh}µm`);
                if (s.tempC) parts.push(`${s.tempC}°C`);
                if (s.pressureBar) parts.push(`${s.pressureBar}bar`);
                if (s.cultivars && s.cultivars.length) parts.push(`🌿 ${s.cultivars.join(', ')}`);
                const meta = parts.length ? ` <small>(${parts.join(', ')})</small>` : '';
                return `<li>${name}${meta}</li>`;
              }).join("")}
            </ol>`;
          }
        } catch {}
      } else if (field.type === "multiple-choice" || field.type === "cultivar-list") {
        try {
          const items = JSON.parse(value);
          if (Array.isArray(items) && items.length) {
            displayValue = `<div class="field-tags">
              ${items.map(item => {
                if (typeof item === 'object' && item.name) {
                  // cultivar-list format
                  return `<span class="field-tag cultivar-tag">${item.name}</span>`;
                }
                return `<span class="field-tag">${item}</span>`;
              }).join("")}
            </div>`;
          }
        } catch {}
      }
      
      fields.push({ label: field.label, value: displayValue, class: fieldClass });
    });
    
    if (!hasContent) return;
    
    const scorePercent = sectionScore ? (sectionScore.sum / sectionScore.max * 100) : 0;
    
    html += `
      <div class="detailed-section">
        <div class="detailed-section-header">
          <h3>${section.title}</h3>
          ${sectionScore ? `
            <div class="section-score">
              <span class="section-score-value">${sectionScore.sum.toFixed(1)}/${sectionScore.max}</span>
              <div class="section-score-bar">
                <div class="section-score-fill" style="width: ${scorePercent}%"></div>
              </div>
            </div>` : ''}
        </div>
        <div class="detailed-section-content">
          ${fields.map(f => `
            <div class="${f.class}">
              <label>${f.label}</label>
              <div class="field-value">${f.value}</div>
            </div>
          `).join("")}
        </div>
      </div>`;
  });
  
  html += '</div></div>';

  if (dom.reviewContent) {
    dom.reviewContent.innerHTML = html;
  }
  if (dom.previewPlaceholder) {
    dom.previewPlaceholder.classList.add("hidden");
  }
  dom.reviewOutput.hidden = false;
}

// MODE 3: CARD - Style carte sociale
function generateCardPreview() {
  const data = getPreviewData();
  
  let html = `
    <div class="preview-card">
      <div class="preview-mode-selector">
        <button class="preview-mode-btn ${currentPreviewMode === 'minimal' ? 'active' : ''}" data-mode="minimal" onclick="setPreviewMode('minimal')" title="Mode minimal">
          <span>━</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'compact' ? 'active' : ''}" data-mode="compact" onclick="setPreviewMode('compact')" title="Mode compact">
          <span>▤</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'detailed' ? 'active' : ''}" data-mode="detailed" onclick="setPreviewMode('detailed')" title="Mode détaillé">
          <span>☰</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'card' ? 'active' : ''}" data-mode="card" onclick="setPreviewMode('card')" title="Mode carte">
          <span>▣</span>
        </button>
      </div>
      
      <div class="card-container">`;
  
  // Image section
  if (imageUrl) {
    html += `
      <div class="card-image">
        <img src="${imageUrl}" alt="${data.cultivarInfo.title}" />
        <div class="card-overlay">
          <div class="card-badge">${data.productIcon} ${currentType}</div>
        </div>
      </div>`;
  } else {
    html += `
      <div class="card-image card-image-placeholder">
        <div class="card-placeholder-icon">${data.productIcon}</div>
        <div class="card-overlay">
          <div class="card-badge">${currentType}</div>
        </div>
      </div>`;
  }
  
  html += `
    <div class="card-content">
      <h2 class="card-title">${data.cultivarInfo.title}</h2>`;
  
  // Score badge
  if (data.maxGlobalScore > 0) {
    const scoreClass = data.scoreOutOf10 >= 8 ? 'excellent' : data.scoreOutOf10 >= 6 ? 'good' : 'average';
    html += `
      <div class="card-score ${scoreClass}">
        <span class="card-score-value">${data.scoreOutOf10.toFixed(1)}</span>
        <span class="card-score-unit">/10</span>
      </div>`;
  }
  
  // Quick stats
  html += `
    <div class="card-stats">
      <div class="card-stat">
        <span class="stat-icon">📊</span>
        <div class="stat-content">
          <span class="stat-label">Score</span>
          <span class="stat-value">${data.globalScore.toFixed(1)}/${data.maxGlobalScore}</span>
        </div>
      </div>
      <div class="card-stat">
        <span class="stat-icon">✓</span>
        <div class="stat-content">
          <span class="stat-label">Sections</span>
          <span class="stat-value">${data.sectionsWithData}/${data.structure.sections.length}</span>
        </div>
      </div>`;
  
  // Farm info if available
  const farmInfo = data.cultivarInfo.details?.[0]?.farm || formData.farm;
  if (farmInfo) {
    html += `
      <div class="card-stat">
        <span class="stat-icon">📍</span>
        <div class="stat-content">
          <span class="stat-label">Farm</span>
          <span class="stat-value">${farmInfo}</span>
        </div>
      </div>`;
  }
  
  html += `
    </div>
    
    <div class="card-sections">`;
  
  // Top sections with scores
  const sectionsWithScores = data.structure.sections
    .map((section, index) => ({ section, index, score: totals[`section-${index}`] }))
    .filter(s => s.score && s.score.sum > 0)
    .sort((a, b) => (b.score.sum / b.score.max) - (a.score.sum / a.score.max))
    .slice(0, 4);
  
  sectionsWithScores.forEach(({ section, score }) => {
    const percent = (score.sum / score.max) * 100;
    html += `
      <div class="card-section-item">
        <span class="card-section-name">${section.title}</span>
        <div class="card-section-score">
          <span>${score.sum.toFixed(1)}</span>
          <div class="card-section-bar">
            <div class="card-section-fill" style="width: ${percent}%"></div>
          </div>
        </div>
      </div>`;
  });
  
  html += `
    </div>
  </div>
</div>
</div>`;

  if (dom.reviewContent) {
    dom.reviewContent.innerHTML = html;
  }
  if (dom.previewPlaceholder) {
    dom.previewPlaceholder.classList.add("hidden");
  }
  dom.reviewOutput.hidden = false;
}

// MODE 4: MINIMAL - Vue ultra-simple
function generateMinimalPreview() {
  const data = getPreviewData();
  
  let html = `
    <div class="preview-minimal">
      <div class="preview-mode-selector">
        <button class="preview-mode-btn ${currentPreviewMode === 'minimal' ? 'active' : ''}" data-mode="minimal" onclick="setPreviewMode('minimal')" title="Mode minimal">
          <span>━</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'compact' ? 'active' : ''}" data-mode="compact" onclick="setPreviewMode('compact')" title="Mode compact">
          <span>▤</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'detailed' ? 'active' : ''}" data-mode="detailed" onclick="setPreviewMode('detailed')" title="Mode détaillé">
          <span>☰</span>
        </button>
        <button class="preview-mode-btn ${currentPreviewMode === 'card' ? 'active' : ''}" data-mode="card" onclick="setPreviewMode('card')" title="Mode carte">
          <span>▣</span>
        </button>
      </div>
      
      <div class="minimal-content">
        <div class="minimal-icon">${data.productIcon}</div>
        <h2 class="minimal-title">${data.cultivarInfo.title}</h2>
        <p class="minimal-type">${currentType}</p>`;
  
  if (data.maxGlobalScore > 0) {
    const scoreClass = data.scoreOutOf10 >= 8 ? 'excellent' : data.scoreOutOf10 >= 6 ? 'good' : 'average';
    html += `
      <div class="minimal-score ${scoreClass}">
        <div class="minimal-score-value">${data.scoreOutOf10.toFixed(1)}</div>
        <div class="minimal-score-label">/ 10</div>
      </div>
      <div class="minimal-progress">
        <div class="minimal-progress-bar">
          <div class="minimal-progress-fill" style="width: ${data.percentage}%"></div>
        </div>
        <span class="minimal-progress-text">${data.globalScore.toFixed(1)} / ${data.maxGlobalScore} points</span>
      </div>`;
  }
  
  html += `
    <div class="minimal-info">
      <span>${data.sectionsWithData} section${data.sectionsWithData > 1 ? 's' : ''} complétée${data.sectionsWithData > 1 ? 's' : ''}</span>
    </div>
  </div>
</div>`;

  if (dom.reviewContent) {
    dom.reviewContent.innerHTML = html;
  }
  if (dom.previewPlaceholder) {
    dom.previewPlaceholder.classList.add("hidden");
  }
  dom.reviewOutput.hidden = false;
}

function generateFullReview() {
  // Version complète pour l'export optimisée pour lisibilité et compacité
  const structure = productStructures[currentType];
  
  // Helper to get cultivar info
  const getCultivarInfo = () => {
    try {
      const list = JSON.parse(formData['cultivarsList'] || '[]');
      if (Array.isArray(list) && list.length > 0) {
        return {
          title: list.map(c => c.name).filter(Boolean).join(' + ') || formData.cultivars || formData.productType,
          details: list
        };
      }
    } catch {}
    return {
      title: formData.cultivars || formData.productType,
      details: null
    };
  };
  
  const cultivarInfo = getCultivarInfo();
  const title = cultivarInfo.title;
  
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  // Icônes pour chaque type de produit
  const productIcons = {
    'Hash': '🧊',
    'Fleur': '🌸', 
    'Concentré': '💎'
  };

  // En-tête optimisé avec informations essentielles
  let html = `<div class="review-header">
    <div class="header-top">
      <div class="product-type-badge">
        <span class="product-icon">${productIcons[currentType] || '🌿'}</span>
        <span>${formData.productType}</span>
      </div>
      <div class="review-meta">${date}</div>
    </div>
    <h2 class="product-title">${title}</h2>`;

  // Affichage des cultivars multiples avec leurs détails
  if (cultivarInfo.details && cultivarInfo.details.length > 0) {
    html += '<div class="cultivars-info">';
    cultivarInfo.details.forEach((c, idx) => {
      html += `<div class="cultivar-card">`;
      html += `<span class="cultivar-number">🌿 ${idx + 1}</span>`;
      html += `<div class="cultivar-details">`;
      if (c.name) html += `<strong>${c.name}</strong>`;
      const meta = [];
      if (c.farm) meta.push(`📍 ${c.farm}`);
      if (c.breeder) meta.push(`🧬 ${c.breeder}`);
      if (c.matiere && c.matiere.length) meta.push(`🌱 ${c.matiere.join(', ')}`);
      if (meta.length) html += `<span class="cultivar-meta">${meta.join(' • ')}</span>`;
      html += `</div></div>`;
    });
    html += '</div>';
  } else if (formData.farm) {
    // Fallback pour anciennes reviews
    html += `<div class="farm-info">📍 ${formData.farm}</div>`;
  }

  html += `</div>`;

  // Image du produit en format optimisé
  if (imageUrl) {
    html += `<div class="review-image-container">
      <img src="${imageUrl}" alt="Photo du produit ${title}" class="product-image">
    </div>`;
  }

  // Score global en version compacte mais informative
  let globalScore = 0;
  let maxGlobalScore = 0;
  Object.values(totals).forEach(section => {
    if (section.sum && section.max) {
      globalScore += section.sum;
      maxGlobalScore += section.max;
    }
  });

  if (maxGlobalScore > 0) {
    const percentage = (globalScore / maxGlobalScore) * 100;
    const scoreOut10 = (globalScore/maxGlobalScore*10);
    html += `<div class="global-score-compact">
      <div class="score-header">
        <h3>Score global</h3>
        <div class="score-main">
          <span class="score-value">${scoreOut10.toFixed(1)}</span>
          <span class="score-max">/10</span>
        </div>
      </div>
      <div class="score-details">
        <div class="score-bar">
          <div class="score-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="score-breakdown">${globalScore.toFixed(1)} / ${maxGlobalScore} points</span>
      </div>
    </div>`;
  }

  // Sections organisées en grille optimisée
  html += '<div class="review-content-grid">';

  structure.sections.forEach((section, index) => {
    let sectionHtml = `<div class="review-section">
      <div class="section-header">
        <h3 class="section-title">${section.title}</h3>`;

    // Score de section en header si disponible
    if (section.total && totals[`section-${index}`]) {
      const { sum, max } = totals[`section-${index}`];
      const percentage = (sum / max) * 100;
      sectionHtml += `<div class="section-score-header">
        <span class="section-score-value">${sum.toFixed(1)}/${max}</span>
        <div class="section-score-bar-mini">
          <div class="section-score-fill" style="width: ${percentage}%"></div>
        </div>
      </div>`;
    }

    sectionHtml += `</div><div class="section-content">`;

    let hasContent = false;
    const sectionFields = [];

    // Préparer les champs avec leurs valeurs
    section.fields.forEach(field => {
      if (field.type === "file") return;
      const value = formData[field.key];
      if (!value) return;

      hasContent = true;
      let displayValue;
      let fieldClass = "field-item";

      if (field.type === "number") {
        const numValue = Number.parseFloat(value);
        displayValue = numValue.toFixed(1).replace(".0", "");
        fieldClass += " field-numeric";
        // Indicateur visuel pour les scores
        if (field.max === 10) {
          const percentage = (numValue / 10) * 100;
          displayValue += `<div class="score-indicator">
            <div class="score-bar-inline">
              <div class="score-fill-inline" style="width: ${percentage}%"></div>
            </div>
          </div>`;
        }
      } else if (field.type === "sequence") {
        try {
          const steps = JSON.parse(value);
          if (Array.isArray(steps) && steps.length) {
            fieldClass += " field-sequence";
            displayValue = `<ol class="sequence-list">
              ${steps.map(s => {
                if (s && typeof s === 'object') {
                  const name = s.name || '';
                  const parts = [];
                  if (s.mesh) parts.push(`${s.mesh}`);
                  if (s.pressureBar) parts.push(`${s.pressureBar} bar`);
                  if (s.tempC) parts.push(`${s.tempC}°C`);
                  const meta = parts.length ? ` <small style="opacity:.8;">(${parts.join(', ')})</small>` : '';
                  return `<li class="sequence-item">${name}${meta}</li>`;
                }
                return `<li class="sequence-item">${s}</li>`;
              }).join("")}
            </ol>`;
          } else {
            return;
          }
        } catch (e) {
          displayValue = value;
        }
      } else if (field.type === "multiple-choice" || (Array.isArray(field.choices) && field.choices.length)) {
        try {
          const selections = JSON.parse(value);
          if (Array.isArray(selections) && selections.length) {
            fieldClass += " field-multiple";
            displayValue = `<div class="choice-tags">
              ${selections.map(s => `<span class="choice-tag">${s}</span>`).join("")}
            </div>`;
          } else {
            return;
          }
        } catch (e) {
          displayValue = value;
        }
      } else {
        displayValue = value;
        if (value.length > 50) {
          fieldClass += " field-text-long";
        }
      }

      sectionFields.push({
        label: field.label,
        value: displayValue,
        class: fieldClass,
        type: field.type
      });
    });

    // Affichage des champs organisés
    if (hasContent) {
      // Organiser en colonnes selon le type de contenu
      const numericFields = sectionFields.filter(f => f.type === "number");
      const textFields = sectionFields.filter(f => f.type !== "number" && f.type !== "sequence");
      const sequenceFields = sectionFields.filter(f => f.type === "sequence");

      // Scores numériques en grille compacte
      if (numericFields.length > 0) {
        sectionHtml += `<div class="numeric-grid">`;
        numericFields.forEach(field => {
          sectionHtml += `<div class="${field.class}">
            <span class="field-label">${field.label}</span>
            <span class="field-value">${field.value}</span>
          </div>`;
        });
        sectionHtml += `</div>`;
      }

      // Champs texte en format optimisé
      if (textFields.length > 0) {
        textFields.forEach(field => {
          sectionHtml += `<div class="${field.class}">
            <span class="field-label">${field.label}</span>
            <div class="field-value">${field.value}</div>
          </div>`;
        });
      }

      // Séquences en format spécial
      if (sequenceFields.length > 0) {
        sequenceFields.forEach(field => {
          sectionHtml += `<div class="${field.class}">
            <span class="field-label">${field.label}</span>
            <div class="field-value">${field.value}</div>
          </div>`;
        });
      }
    } else {
      sectionHtml += '<div class="no-content">Aucune information renseignée.</div>';
    }

    sectionHtml += '</div></div>';
    html += sectionHtml;
  });

  html += '</div>';

  // Stocker la version complète pour l'export
  window.fullReviewHtml = html;
}

function togglePreviewMode() {
  if (!window.fullReviewHtml) return;
  
  isCompactPreview = !isCompactPreview;
  
  if (isCompactPreview) {
    // Basculer vers l'aperçu compact
    generateLivePreview();
    if (dom.togglePreviewText) {
      dom.togglePreviewText.textContent = "Version complète";
    }
  } else {
    // Basculer vers la version complète
    dom.reviewContent.innerHTML = window.fullReviewHtml;
    if (dom.togglePreviewText) {
      dom.togglePreviewText.textContent = "Aperçu compact";
    }
  }
}

async function saveReview(isDraft = true) {
  const reviewToSave = {
    ...formData,
    image: imageUrl,
    date: new Date().toISOString(),
    productName: formData.productName || formData.cultivars || formData.productType,
    totals,
    id: currentReviewId || undefined,
    isDraft: isDraft // Utiliser le paramètre pour déterminer le statut
  };
  // Attach correlation key for dedupe
  reviewToSave.correlationKey = computeCorrelationKey(reviewToSave);
  try {
    if (db && !dbFailedOnce) {
      // If saving a final version, cleanup existing drafts with same correlationKey
      if (!isDraft) {
        try {
          const all = await dbGetAllReviews();
          const strictKey = reviewToSave.correlationKey;
          const looseKey = computeLooseKey(reviewToSave);
          const sameDrafts = (all || []).filter(r => {
            if (!r || !r.isDraft) return false;
            const key = r.correlationKey || computeCorrelationKey(r);
            const keyLoose = computeLooseKey(r);
            return key === strictKey || keyLoose === looseKey;
          });
          // If we don't already track an id, convert one of the drafts in place
          if (!currentReviewId && sameDrafts.length) {
            const chosen = sameDrafts[0];
            reviewToSave.id = chosen.id;
            currentReviewId = chosen.id;
          }
          for (const d of sameDrafts) {
            // If we're updating this very draft to a final, don't delete it; we'll update in place
            if (currentReviewId && d.id === currentReviewId) continue;
            await dbDeleteReview(d.id);
          }
        } catch {}
      }
      if (currentReviewId) {
        await dbUpdateReview(reviewToSave);
      } else {
        const id = await dbAddReview(reviewToSave);
        currentReviewId = id;
      }
    } else {
      // Fallback to localStorage if DB not available
      let reviews = [];
      try { reviews = JSON.parse(localStorage.getItem("cannaReviews") || "[]"); } catch {}
      if (Array.isArray(reviews)) {
        const strictKey = reviewToSave.correlationKey;
        const looseKey = computeLooseKey(reviewToSave);
        if (!isDraft) {
          // Final save: convert a matching draft in place and remove any other matching drafts
          let convertedIndex = -1;
          for (let i = 0; i < reviews.length; i++) {
            const r = reviews[i];
            if (!r || !r.isDraft) continue;
            const key = r.correlationKey || computeCorrelationKey(r);
            const lk = computeLooseKey(r);
            if (key === strictKey || lk === looseKey) { convertedIndex = i; break; }
          }
          if (convertedIndex >= 0) {
            reviews.splice(convertedIndex, 1, { ...reviewToSave });
          } else {
            reviews.push(reviewToSave);
          }
          // Always remove any remaining matching drafts besides the converted one
          reviews = reviews.filter((r, idx) => {
            if (!r || !r.isDraft) return true;
            if (convertedIndex >= 0 && idx === convertedIndex) return true;
            const key = r.correlationKey || computeCorrelationKey(r);
            const lk = computeLooseKey(r);
            return !(key === strictKey || lk === looseKey);
          });
        } else {
          // Draft autosave: update existing matching draft (by id if any, else by correlation/loose key), otherwise add new
          let updated = false;
          // Try by currentReviewId first (if we managed one in localStorage)
          if (currentReviewId != null) {
            const idx = reviews.findIndex(r => r && r.id === currentReviewId);
            if (idx >= 0) {
              reviews.splice(idx, 1, { ...reviewToSave, id: currentReviewId });
              updated = true;
            }
          }
          if (!updated) {
            for (let i = 0; i < reviews.length; i++) {
              const r = reviews[i];
              if (!r || !r.isDraft) continue;
              const key = r.correlationKey || computeCorrelationKey(r);
              const lk = computeLooseKey(r);
              if (key === strictKey || lk === looseKey) {
                const keepId = r.id != null ? r.id : undefined;
                reviews.splice(i, 1, { ...reviewToSave, id: keepId });
                if (keepId != null) currentReviewId = keepId;
                updated = true;
                break;
              }
            }
          }
          if (!updated) {
            // Create a synthetic id so next autosave updates this record
            const syntheticId = Date.now();
            reviews.push({ ...reviewToSave, id: syntheticId });
            currentReviewId = syntheticId;
          }
        }
      }
      localStorage.setItem("cannaReviews", JSON.stringify(reviews));
    }
    
    // Feedback pour sauvegarde explicite
    if (!isDraft) {
      showToast("Review enregistrée avec succès!", "success");
    }
    // Mémoriser l'état non-brouillon si sauvegarde explicite
    isNonDraftRecord = !isDraft;
    
    // Supprimer le brouillon localStorage une fois sauvegardé en base (même pour les drafts)
    clearSavedDraft(); 
    
    // Rafraîchir la bibliothèque compacte
    renderCompactLibrary();
  } catch (e) {
    console.error("Erreur sauvegarde:", e);
    // Mark DB as failed and fallback to localStorage silently next times
    dbFailedOnce = true;
    try {
      let reviews = [];
      try { reviews = JSON.parse(localStorage.getItem("cannaReviews") || "[]"); } catch {}
      // Cleanup matching drafts even on error path if saving a final
      if (!isDraft && Array.isArray(reviews) && reviews.length) {
        reviews = reviews.filter(r => {
          if (!r || !r.isDraft) return true;
          const key = r.correlationKey || computeCorrelationKey(r);
          const keyLoose = computeLooseKey(r);
          return key !== reviewToSave.correlationKey && keyLoose !== computeLooseKey(reviewToSave);
        });
      }
      reviews.push(reviewToSave);
      localStorage.setItem("cannaReviews", JSON.stringify(reviews));
      if (!document.body.dataset.lsInfoShown) {
        showToast("Sauvegarde locale activée (offline)", "info");
        document.body.dataset.lsInfoShown = "1";
      }
    } catch (e2) {
      showToast("Erreur lors de la sauvegarde", "error");
    }
  }

  // Sync distante (non bloquante pour l'utilisateur en dehors du await interne)
  if (remoteEnabled) {
    try {
      const remoteCopy = { ...reviewToSave };
      if (!(lastSelectedImageFile instanceof File) && remoteCopy.image && remoteCopy.image.length > 50000) {
        delete remoteCopy.image; // éviter envoi base64 lourd
      }
      const remoteRes = await remoteSave(remoteCopy);
      if (remoteRes?.ok && remoteRes.review?.id) {
        currentReviewId = remoteRes.review.id;
      } else if (remoteRes && remoteRes.error) {
        // Propager l'erreur serveur à l'appelant pour affichage UI
        return { ok: true, remoteError: remoteRes };
      }
    } catch (e) { console.warn('Sync distante échouée', e); }
  }

  return { ok: true };
}

async function exportImage(event) {
  if (!window.fullReviewHtml) {
    showToast("Générez d'abord une review avant d'exporter.", "warning");
    return;
  }

  const trigger = event?.currentTarget;
  if (!(trigger instanceof HTMLElement)) {
    return;
  }

  const previousLabel = trigger.innerHTML;
  trigger.disabled = true;
  trigger.innerHTML = '<span class="loading" aria-hidden="true"></span> Génération…';

  // Sauvegarder l'aperçu actuel et basculer vers la version complète
  const currentContent = dom.reviewContent.innerHTML;
  dom.reviewContent.innerHTML = window.fullReviewHtml;

  try {
    // Vérifier que html2canvas est chargé
    if (typeof html2canvas === 'undefined') {
      throw new Error('html2canvas n\'est pas chargé');
    }

    console.log('Début de l\'export image');
    console.log('Element à exporter:', dom.reviewContent);
    console.log('Contenu de l\'élément:', dom.reviewContent.innerHTML.length, 'caractères');

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    console.log('Appel html2canvas...');
    const canvas = await html2canvas(dom.reviewContent, {
      backgroundColor: "#0f1628",
      scale: window.devicePixelRatio < 2 ? 2 : window.devicePixelRatio,
      logging: true,
      useCORS: true,
      allowTaint: true,
      foreignObjectRendering: false
    });

    console.log('Canvas généré:', canvas.width, 'x', canvas.height);

    const link = document.createElement("a");
    const safeName = (formData.cultivars || formData.productType || "review").replace(/\s+/g, "-").toLowerCase();
    link.download = `review_${safeName}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    
    console.log('Téléchargement déclenché');
    showToast("Image exportée avec succès.");
    clearDraftFlag();
    clearSavedDraft();
  } catch (error) {
    console.error("Erreur export image détaillée:", error);
    console.error("Type d'erreur:", error.name);
    console.error("Message d'erreur:", error.message);
    console.error("Stack:", error.stack);
    showToast(`Impossible d'exporter l'image: ${error.message}`, "error");
  } finally {
    // Restaurer l'aperçu live
    dom.reviewContent.innerHTML = currentContent;
    trigger.disabled = false;
    trigger.innerHTML = previousLabel;
  }
}

function handleReset(mode = 'full', preserveDraft = false) {
  const isSoft = mode === 'soft';

  if (isSoft) {
    // Keep currentType and stay in step 2, just clear all inputs and preview
    formData = { productType: currentType };
    imageUrl = "";
    totals = {};
    activeSectionIndex = -1;
    currentReviewId = null;
    isReadOnlyView = false;
  isNonDraftRecord = false;

    // Clear form fields
    if (dom.reviewForm) {
      dom.reviewForm.reset();
    }
    // Re-render sections to ensure sequence/multi-choice cleared properly
    if (currentType && productStructures[currentType]) {
      renderForm();
    } else if (dom.dynamicSections) {
      dom.dynamicSections.innerHTML = "";
    }

    // Clear preview output
    if (dom.reviewContent) dom.reviewContent.innerHTML = "";
    if (dom.reviewOutput) dom.reviewOutput.hidden = true;
    if (dom.previewPlaceholder) dom.previewPlaceholder.classList.remove("hidden");

    updateProgress(0);
    updateSectionControls();
    showToast("Champs réinitialisés pour cette review.", "info");
    setDraftFlag(true);
    clearSavedDraft();
    return;
  }

  // Full reset: go back to step 1
  // Redirect to home to ensure a clean step-1 state (avoids legacy UI remnants)
  if (!preserveDraft) { setDraftFlag(false); clearSavedDraft(); } else { setDraftFlag(true); }
  navigateToHome();
}

// openLibraryDrawer replaced by real Library drawer

function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener(
      "transitionend",
      () => {
        toast.remove();
        if (container && container.children.length === 0) {
          container.remove();
        }
      },
      { once: true }
    );
  }, 4200);
}

function setDraftFlag(on) {
  if (!dom.draftBadge) return;
  dom.draftBadge.style.display = on ? 'inline-flex' : 'none';
}

function clearDraftFlag() { setDraftFlag(false); }

// Draft persistence API
// Vérifie si le formulaire contient du contenu significatif
function hasSignificantContent() {
  if (!currentType) return false;
  
  const data = serializeCurrentForm();
  
  // Vérifier s'il y a des champs texte remplis
  const textFields = ['cultivars', 'productName', 'farm', 'description', 'notes', 'conclusion'];
  const hasText = textFields.some(field => {
    const value = data[field];
    return value && typeof value === 'string' && value.trim().length > 0;
  });
  
  // Vérifier s'il y a une image
  const hasImage = imageUrl && imageUrl.trim().length > 0;
  
  // Vérifier s'il y a des scores/ratings non-zéro
  const hasRatings = Object.values(data).some(value => {
    if (typeof value === 'number' && value > 0) return true;
    if (typeof value === 'string') {
      const numValue = parseFloat(value);
      return !isNaN(numValue) && numValue > 0;
    }
    return false;
  });
  
  // Le contenu est significatif s'il y a du texte, une image, ou des ratings
  return hasText || hasImage || hasRatings;
}

function scheduleDraftSave() {
  if (isReadOnlyView) return;
  if (draftSaveTimer) clearTimeout(draftSaveTimer);
  
  // Vérifier s'il y a du contenu significatif avant de planifier la sauvegarde
  draftSaveTimer = setTimeout(() => {
    if (hasSignificantContent()) {
      persistDraftImmediate();
    } else {
      // Si le contenu est vide, supprimer le brouillon existant s'il y en a un
      clearSavedDraft();
    }
  }, 1500); // Augmenté de 600ms à 1500ms pour réduire la fréquence des sauvegardes
}

function serializeCurrentForm() {
  const data = { productType: currentType };
  const sections = getSections();
  sections.forEach(section => {
    const inputs = section.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      if (!input.id || input.disabled) return;
      if (input.type === 'file') return;
      if (input.type === 'hidden') { data[input.id] = input.value; return; }
      if (input.type === 'checkbox') return;
      if (input.type === 'select-one') { data[input.id] = input.value; return; }
      data[input.id] = input.value;
    });
  });
  return data;
}

function persistDraftImmediate() {
  if (!currentType) return;
  
  // Ne pas sauvegarder si le contenu n'est pas significatif
  if (!hasSignificantContent()) {
    clearSavedDraft(); // Supprimer le brouillon existant s'il y en a un
    return;
  }
  
  try {
    const payload = {
      id: currentReviewId || null,
      productType: currentType,
      formData: serializeCurrentForm(),
      image: imageUrl || null,
      date: new Date().toISOString(),
      isDraft: true // Marquer comme brouillon
    };
    localStorage.setItem('reviewsMakerDraft', JSON.stringify(payload));
    // Pas de renderCompactLibrary() ici car c'est juste un brouillon local
  } catch {}
}

function restoreDraftIfAny() {
  try {
    const raw = localStorage.getItem('reviewsMakerDraft');
    if (!raw) return;
    const d = JSON.parse(raw);
    if (!d || !d.productType) return;
    const reviewLike = {
      ...d.formData,
      productType: d.productType,
      image: d.image || null,
      id: d.id || null,
      productName: d.formData?.cultivars || d.productType,
      date: d.date || new Date().toISOString(),
      totals: d.totals || {},
      isDraft: true // Conserver le statut de brouillon
    };
    loadReviewIntoForm(reviewLike, 'edit');
    showToast('Brouillon restauré.', 'info');
  } catch {}
}

// Check if a draft exists in localStorage (top-level, used during init)
function hasSavedDraft() {
  try { return !!localStorage.getItem('reviewsMakerDraft'); } catch { return false; }
}

function clearSavedDraft() { try { localStorage.removeItem('reviewsMakerDraft'); } catch {} }
