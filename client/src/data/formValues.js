// Listes de valeurs prédéfinies pour les formulaires
// Permet de minimiser les champs texte libre et standardiser les données

export const CULTURE_VALUES = {
    // Modes de culture
    mode: [
        { value: 'indoor', label: 'Indoor / Intérieur' },
        { value: 'outdoor', label: 'Outdoor / Extérieur' },
        { value: 'greenhouse', label: 'Serre / Greenhouse' },
        { value: 'no-till', label: 'No-till' },
        { value: 'autre', label: 'Autre' }
    ],

    // Types d'espace
    typeEspace: [
        { value: 'armoire', label: 'Armoire' },
        { value: 'tente', label: 'Tente de culture' },
        { value: 'serre', label: 'Serre' },
        { value: 'exterieur', label: 'Extérieur' },
        { value: 'autre', label: 'Autre' }
    ],

    // Techniques de propagation
    techniquePropagation: [
        { value: 'graine', label: 'Graine' },
        { value: 'clone', label: 'Clone' },
        { value: 'bouture', label: 'Bouture' },
        { value: 'sopalin', label: 'Sopalin' },
        { value: 'coton', label: 'Coton' },
        { value: 'serviette', label: 'Serviette humide' },
        { value: 'germoir', label: 'Germoir / Root Riot' },
        { value: 'eau', label: 'Verre d\'eau' },
        { value: 'autre', label: 'Autre' }
    ],

    // Types de substrat
    typeSubstrat: [
        { value: 'hydro', label: 'Hydro' },
        { value: 'bio', label: 'Bio' },
        { value: 'organique', label: 'Organique' },
        { value: 'terre', label: 'Terre' },
        { value: 'coco', label: 'Coco' },
        { value: 'laine-roche', label: 'Laine de roche' },
        { value: 'perlite', label: 'Perlite' },
        { value: 'vermiculite', label: 'Vermiculite' },
        { value: 'hydrobilles', label: 'Billes d\'argile' },
        { value: 'mixte', label: 'Mélange custom' }
    ],

    // Types d'irrigation
    typeIrrigation: [
        { value: 'goutte-a-goutte', label: 'Goutte à goutte' },
        { value: 'inondation', label: 'Inondation / Flood & Drain' },
        { value: 'manuel', label: 'Manuel (arrosoir)' },
        { value: 'automatique', label: 'Automatique programmé' },
        { value: 'hydro-passive', label: 'Hydro passive (mèche)' },
        { value: 'nft', label: 'NFT (Nutrient Film Technique)' },
        { value: 'dwc', label: 'DWC (Deep Water Culture)' },
        { value: 'autre', label: 'Autre' }
    ],

    // Types d'engrais
    typeEngrais: [
        { value: 'bio', label: 'Bio / Organique' },
        { value: 'chimique', label: 'Chimique / Minéral' },
        { value: 'mixte', label: 'Mixte (bio + chimique)' },
        { value: 'compost', label: 'Compost' },
        { value: 'the-compost', label: 'Thé de compost' },
        { value: 'guano', label: 'Guano' },
        { value: 'autre', label: 'Autre' }
    ],

    // Marques d'engrais populaires (suggestives)
    marquesEngrais: [
        'BioBizz', 'Advanced Nutrients', 'Canna', 'General Hydroponics',
        'Plagron', 'Terra Aquatica (ex-GHE)', 'House & Garden', 'Hesi',
        'Botanicare', 'Fox Farm', 'Emerald Harvest', 'Nectar for the Gods',
        'Athena', 'Front Row Ag', 'Mills Nutrients', 'Autre (préciser)'
    ],

    // Types de lampe
    typeLampe: [
        { value: 'led', label: 'LED' },
        { value: 'led-full', label: 'LED Full Spectrum' },
        { value: 'led-quantum', label: 'LED Quantum Board' },
        { value: 'led-cob', label: 'LED COB' },
        { value: 'hps', label: 'HPS (Sodium haute pression)' },
        { value: 'mh', label: 'MH (Halogénure métallique)' },
        { value: 'cfl', label: 'CFL / Néon' },
        { value: 'cmh', label: 'CMH / LEC' },
        { value: 'naturel', label: 'Naturel / Soleil' },
        { value: 'mixte', label: 'Mixte (plusieurs types)' }
    ],

    // Spectres lumineux
    spectreLumiere: [
        { value: 'complet', label: 'Spectre complet (Full Spectrum)' },
        { value: 'bleu', label: 'Bleu dominant (Végétation)' },
        { value: 'rouge', label: 'Rouge dominant (Floraison)' },
        { value: 'mixte', label: 'Mixte ajustable' },
        { value: 'blanc-chaud', label: 'Blanc chaud (3000K)' },
        { value: 'blanc-froid', label: 'Blanc froid (6500K)' }
    ],

    // Types de ventilation
    typeVentilation: [
        { value: 'continue', label: 'Continue 24h/24' },
        { value: 'intermittente', label: 'Intermittente (cycles)' },
        { value: 'passive', label: 'Passive (naturelle)' },
        { value: 'extracteur', label: 'Extracteur seul' },
        { value: 'extracteur-intracteur', label: 'Extracteur + Intracteur' },
        { value: 'extracteur-ventilo', label: 'Extracteur + Ventilateur' },
        { value: 'complet', label: 'Système complet (extraction/intraction/brassage)' }
    ],

    // Méthodologies de palissage
    methodePalissage: [
        { value: 'scrog', label: 'SCROG (Screen of Green)' },
        { value: 'sog', label: 'SOG (Sea of Green)' },
        { value: 'mainlining', label: 'Main-Lining' },
        { value: 'manifold', label: 'Manifold' },
        { value: 'lst', label: 'LST (Low Stress Training)' },
        { value: 'hst', label: 'HST (High Stress Training)' },
        { value: 'topping', label: 'Topping' },
        { value: 'fimming', label: 'Fimming (FIM)' },
        { value: 'lollipopping', label: 'Lollipopping' },
        { value: 'defoliation', label: 'Défoliation' },
        { value: 'supercropping', label: 'Supercropping' },
        { value: 'schwazzing', label: 'Schwazzing' },
        { value: 'aucun', label: 'Aucun palissage' },
        { value: 'autre', label: 'Autre technique' }
    ],

    // Couleurs des trichomes (récolte)
    couleurTrichomes: [
        { value: 'translucide', label: 'Translucide / Transparent' },
        { value: 'laiteux', label: 'Laiteux / Blanc opaque' },
        { value: 'ambre', label: 'Ambré' },
        { value: 'mixte-laiteux-ambre', label: 'Mixte (laiteux + ambré)' },
        { value: 'mixte', label: 'Mixte (autres combinaisons)' }
    ],

    // Phases de culture (suggestions)
    phasesType: [
        { value: 'germination', label: 'Germination', dureeTypique: 3 },
        { value: 'plantule', label: 'Plantule / Seedling', dureeTypique: 7 },
        { value: 'debut-croissance', label: 'Début croissance', dureeTypique: 14 },
        { value: 'croissance', label: 'Croissance végétative', dureeTypique: 21 },
        { value: 'fin-croissance', label: 'Fin croissance / Pré-floraison', dureeTypique: 7 },
        { value: 'debut-stretch', label: 'Début stretch', dureeTypique: 14 },
        { value: 'floraison', label: 'Floraison', dureeTypique: 56 },
        { value: 'flush', label: 'Rinçage / Flush', dureeTypique: 7 },
        { value: 'recolte', label: 'Récolte', dureeTypique: 1 },
        { value: 'custom', label: 'Phase custom' }
    ]
}

export const CURING_VALUES = {
    // Type de maturation
    typeMaturation: [
        { value: 'froid', label: 'Froid (<5°C)' },
        { value: 'chaud', label: 'Chaud (>5°C)' },
        { value: 'temperature-ambiante', label: 'Température ambiante' }
    ],

    // Méthode de séchage
    methodeSechage: [
        { value: 'air', label: 'Séchage à l\'air libre' },
        { value: 'dark', label: 'Séchage dans le noir' },
        { value: 'rack', label: 'Séchoir / Rack' },
        { value: 'hang', label: 'Suspendu (branches entières)' },
        { value: 'screen', label: 'Sur filet / Screen' },
        { value: 'freeze-dry', label: 'Lyophilisation' },
        { value: 'autre', label: 'Autre méthode' }
    ],

    // Type de récipient
    typeRecipient: [
        { value: 'aire-libre', label: 'Air libre (aucun)' },
        { value: 'bocal-verre', label: 'Bocal en verre' },
        { value: 'bocal-plastique', label: 'Bocal plastique' },
        { value: 'tupperware', label: 'Tupperware / Boîte hermétique' },
        { value: 'grove', label: 'Grove Bag' },
        { value: 'paper', label: 'Sac papier' },
        { value: 'cvault', label: 'CVault / Humidor' },
        { value: 'sous-vide', label: 'Sous vide' },
        { value: 'autre', label: 'Autre' }
    ],

    // Emballage/Ballotage primaire
    emballagePrimaire: [
        { value: 'aucun', label: 'Aucun (direct)' },
        { value: 'celophane', label: 'Cellophane' },
        { value: 'papier-cuisson', label: 'Papier cuisson / Parchment' },
        { value: 'aluminium', label: 'Papier aluminium' },
        { value: 'paper-hash', label: 'Paper hash' },
        { value: 'sac-viande', label: 'Sac à viande' },
        { value: 'congelation', label: 'Sac congélation' },
        { value: 'sous-vide-complet', label: 'Sous vide complet (machine)' },
        { value: 'sous-vide-partiel', label: 'Sous vide partiel (manuel)' },
        { value: 'autre', label: 'Autre' }
    ],

    // Opacité du récipient
    opaciteRecipient: [
        { value: 'opaque', label: 'Opaque (lumière bloquée)' },
        { value: 'semi-opaque', label: 'Semi-opaque' },
        { value: 'transparent', label: 'Transparent / Clair' },
        { value: 'ambre', label: 'Ambré (verre ambré)' },
        { value: 'noir', label: 'Noir / UV-protégé' }
    ]
}

export const EXPERIENCE_VALUES = {
    // Méthode de consommation
    methodeConsommation: [
        { value: 'combustion-joint', label: 'Combustion - Joint' },
        { value: 'combustion-pipe', label: 'Combustion - Pipe' },
        { value: 'combustion-bong', label: 'Combustion - Bong / Bang' },
        { value: 'combustion-blunt', label: 'Combustion - Blunt' },
        { value: 'vapeur-portable', label: 'Vapeur - Vaporisateur portable' },
        { value: 'vapeur-salon', label: 'Vapeur - Vaporisateur de salon' },
        { value: 'vapeur-dab', label: 'Vapeur - Dab / E-nail' },
        { value: 'infusion-the', label: 'Infusion - Thé / Tisane' },
        { value: 'infusion-beurre', label: 'Infusion - Beurre cannabique' },
        { value: 'comestible', label: 'Comestible / Edible' },
        { value: 'autre', label: 'Autre méthode' }
    ],

    // Début des effets
    debutEffets: [
        { value: 'immediat', label: 'Immédiat (< 2 min)' },
        { value: 'rapide', label: 'Rapide (2-5 min)' },
        { value: 'moyen', label: 'Moyen (5-15 min)' },
        { value: 'differe', label: 'Différé (15-30 min)' },
        { value: 'long', label: 'Long (30+ min)' }
    ],

    // Durée des effets
    dureeEffets: [
        { value: 'courte', label: 'Courte (< 1h)' },
        { value: 'moyenne', label: 'Moyenne (1-3h)' },
        { value: 'longue', label: 'Longue (3-5h)' },
        { value: 'tres-longue', label: 'Très longue (5h+)' }
    ],

    // Usage préféré
    usagesPreferes: [
        { value: 'matin', label: 'Matin / Réveil' },
        { value: 'journee', label: 'Journée' },
        { value: 'apres-midi', label: 'Après-midi' },
        { value: 'soir', label: 'Soirée' },
        { value: 'nuit', label: 'Nuit / Coucher' },
        { value: 'seul', label: 'Seul / Solo' },
        { value: 'social', label: 'Social / Entre amis' },
        { value: 'medical', label: 'Médical / Thérapeutique' },
        { value: 'creatif', label: 'Créatif / Artistique' },
        { value: 'sportif', label: 'Sportif / Actif' },
        { value: 'relaxation', label: 'Relaxation / Détente' }
    ],

    // Profils d'effets
    profilsEffets: [
        // Mentaux positifs
        { value: 'euphorique', label: 'Euphorique', categorie: 'mental', type: 'positif' },
        { value: 'heureux', label: 'Heureux', categorie: 'mental', type: 'positif' },
        { value: 'creatif', label: 'Créatif', categorie: 'mental', type: 'positif' },
        { value: 'concentre', label: 'Concentré', categorie: 'mental', type: 'positif' },
        { value: 'sociable', label: 'Sociable', categorie: 'mental', type: 'positif' },
        { value: 'motive', label: 'Motivé', categorie: 'mental', type: 'positif' },
        { value: 'lucide', label: 'Lucide', categorie: 'mental', type: 'positif' },
        { value: 'introspectif', label: 'Introspectif', categorie: 'mental', type: 'positif' },

        // Physiques positifs
        { value: 'energique', label: 'Énergique', categorie: 'physique', type: 'positif' },
        { value: 'relaxe', label: 'Relaxé', categorie: 'physique', type: 'positif' },
        { value: 'leger', label: 'Léger / Aérien', categorie: 'physique', type: 'positif' },

        // Thérapeutiques
        { value: 'anti-douleur', label: 'Anti-douleur', categorie: 'therapeutique', type: 'positif' },
        { value: 'anti-stress', label: 'Anti-stress', categorie: 'therapeutique', type: 'positif' },
        { value: 'anti-nausee', label: 'Anti-nausée', categorie: 'therapeutique', type: 'positif' },
        { value: 'anti-inflammatoire', label: 'Anti-inflammatoire', categorie: 'therapeutique', type: 'positif' },
        { value: 'anxiolytique', label: 'Anxiolytique', categorie: 'therapeutique', type: 'positif' },
        { value: 'anti-insomnie', label: 'Aide au sommeil', categorie: 'therapeutique', type: 'positif' },

        // Neutres
        { value: 'faim', label: 'Faim / Munchies', categorie: 'physique', type: 'neutre' },
        { value: 'somnolent', label: 'Somnolent', categorie: 'physique', type: 'neutre' },
        { value: 'yeux-secs', label: 'Yeux secs', categorie: 'physique', type: 'neutre' },
        { value: 'bouche-seche', label: 'Bouche sèche / Cotton mouth', categorie: 'physique', type: 'neutre' },
        { value: 'yeux-rouges', label: 'Yeux rouges', categorie: 'physique', type: 'neutre' },

        // Négatifs
        { value: 'anxieux', label: 'Anxieux', categorie: 'mental', type: 'negatif' },
        { value: 'paranoia', label: 'Paranoïa', categorie: 'mental', type: 'negatif' },
        { value: 'confus', label: 'Confus / Foggy', categorie: 'mental', type: 'negatif' },
        { value: 'etourdi', label: 'Étourdi / Vertige', categorie: 'physique', type: 'negatif' },
        { value: 'maux-tete', label: 'Maux de tête', categorie: 'physique', type: 'negatif' },
        { value: 'nausee', label: 'Nausée', categorie: 'physique', type: 'negatif' },
        { value: 'tachycardie', label: 'Tachycardie', categorie: 'physique', type: 'negatif' }
    ],

    // Effets secondaires
    effetsSecondaires: [
        { value: 'yeux-secs', label: 'Yeux secs' },
        { value: 'bouche-seche', label: 'Bouche sèche' },
        { value: 'yeux-rouges', label: 'Yeux rouges' },
        { value: 'faim', label: 'Faim intense' },
        { value: 'soif', label: 'Soif' },
        { value: 'fatigue', label: 'Fatigue' },
        { value: 'etourdissement', label: 'Étourdissement' },
        { value: 'anxiete', label: 'Anxiété' },
        { value: 'paranoia', label: 'Paranoïa' },
        { value: 'tachycardie', label: 'Tachycardie / Palpitations' },
        { value: 'maux-tete', label: 'Maux de tête' },
        { value: 'nausee', label: 'Nausée' },
        { value: 'confusion', label: 'Confusion mentale' },
        { value: 'aucun', label: 'Aucun effet secondaire notable' }
    ]
}
