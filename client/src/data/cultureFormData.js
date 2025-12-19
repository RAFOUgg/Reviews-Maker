/**
 * DONNÉES DES FORMULAIRES CULTURE - CDC COMPLET
 * 
 * Toutes les valeurs assignables depuis PIPELINE_DONNEE_CULTURES.md
 * Organisé par sections pour faciliter la maintenance
 */

export const CULTURE_FORM_DATA = {
    // Section GENERAL
    modes_culture: [
        { value: 'indoor', label: 'Indoor (intérieur)' },
        { value: 'outdoor', label: 'Outdoor (extérieur plein champ)' },
        { value: 'greenhouse-chauffee', label: 'Greenhouse / Serre chauffée' },
        { value: 'greenhouse-froide', label: 'Greenhouse froide / non chauffée' },
        { value: 'greenhouse-lumiere', label: 'Greenhouse avec assistance lumineuse' },
        { value: 'no-till-indoor', label: 'No-till indoor' },
        { value: 'no-till-outdoor', label: 'No-till outdoor' },
        { value: 'container', label: 'Culture en container / bac hors-sol' },
        { value: 'verticale', label: 'Culture verticale (multi-niveaux)' },
        { value: 'mixte', label: 'Culture mixte' }
    ],

    espaces_culture: [
        { value: 'armoire', label: 'Armoire de culture' },
        { value: 'tente', label: 'Tente de culture' },
        { value: 'chambre', label: 'Chambre dédiée' },
        { value: 'piece-industrielle', label: 'Pièce industrielle / salle blanche' },
        { value: 'serre-verre', label: 'Serre verre' },
        { value: 'serre-polycarbonate', label: 'Serre polycarbonate' },
        { value: 'tunnel-plastique', label: 'Tunnel plastique' },
        { value: 'plein-champ', label: 'Plein champ extérieur' },
        { value: 'balcon-terrasse', label: 'Balcon / terrasse' },
        { value: 'box-diy', label: 'Box DIY / caisson technique' },
        { value: 'autre', label: 'Autre' }
    ],

    unites_dimensions: [
        { value: 'cm', label: 'cm' },
        { value: 'm', label: 'm' }
    ],

    // Section ENVIRONNEMENT
    techniques_propagation: [
        { value: 'graine-substrat', label: 'Graine directement en substrat' },
        { value: 'graine-jiffy', label: 'Graine en pastille Jiffy / tourbe' },
        { value: 'graine-laine-roche', label: 'Graine en laine de roche' },
        { value: 'graine-root-riot', label: 'Graine en cube Root Riot / similaire' },
        { value: 'germ-sopalin', label: 'Germination sur sopalin' },
        { value: 'germ-coton', label: 'Germination sur coton' },
        { value: 'germ-serviette', label: 'Germination dans serviette humide' },
        { value: 'germ-eau', label: 'Germination en eau (verre d\'eau)' },
        { value: 'germ-propagateur', label: 'Germination en propagateur chauffant' },
        { value: 'clone-interne', label: 'Clone / bouture prélevée en interne' },
        { value: 'clone-externe', label: 'Clone acheté / externe' },
        { value: 'bouture-eau', label: 'Bouture en eau claire' },
        { value: 'bouture-eau-hormone', label: 'Bouture en eau + hormone d\'enracinement' },
        { value: 'bouture-substrat', label: 'Bouture en substrat (tourbe/terre/coco)' },
        { value: 'bouture-laine-roche', label: 'Bouture en laine de roche' },
        { value: 'bouture-cube', label: 'Bouture en cube de propagation (Root Riot, etc.)' },
        { value: 'micropropagation', label: 'Micropropagation / in vitro (rare mais possible pro)' },
        { value: 'autre', label: 'Autre' }
    ],

    // SUBSTRAT
    types_substrat: [
        { value: 'hydro-recircule', label: 'Hydroponique recirculé' },
        { value: 'hydro-drain', label: 'Hydroponique drain-to-waste' },
        { value: 'dwc', label: 'DWC (deep water culture)' },
        { value: 'rdwc', label: 'RDWC (recirculating DWC)' },
        { value: 'nft', label: 'NFT (nutrient film technique)' },
        { value: 'aero-haute', label: 'Aéroponie haute pression' },
        { value: 'aero-basse', label: 'Aéroponie basse pression' },
        { value: 'inerte', label: 'Substrat inerte (coco, laine de roche, billes d\'argile, perlite, vermiculite)' },
        { value: 'terreau-bio', label: 'Terreau « Bio »' },
        { value: 'organique-vivant', label: 'Terreau organique vivant (living soil)' },
        { value: 'super-soil', label: 'Super-soil / no-till' },
        { value: 'terre-coco', label: 'Mélange terre / coco' },
        { value: 'terre-perlite', label: 'Mélange terre / perlite' },
        { value: 'coco-perlite', label: 'Mélange coco / perlite' },
        { value: 'coco-billes', label: 'Mélange coco / billes d\'argile' },
        { value: 'personnalise', label: 'Mélange personnalisé (composition précisée)' }
    ],

    drainage_substrat: [
        { value: 'bon', label: 'Bon' },
        { value: 'moyen', label: 'Moyen' },
        { value: 'faible', label: 'Faible' },
        { value: 'aucun', label: 'Aucun (hydro/aéro)' }
    ],

    composants_substrat: [
        // Minéraux / inertes
        { value: 'laine-roche', label: 'Laine de roche', category: 'mineraux' },
        { value: 'coco-fibres', label: 'Coco (fibres, chips, peat)', category: 'mineraux' },
        { value: 'billes-argile', label: 'Billes d\'argile expansée', category: 'mineraux' },
        { value: 'perlite', label: 'Perlite', category: 'mineraux' },
        { value: 'vermiculite', label: 'Vermiculite', category: 'mineraux' },
        { value: 'sable', label: 'Sable (siliceux)', category: 'mineraux' },
        { value: 'pouzzolane', label: 'Pouzzolane', category: 'mineraux' },
        { value: 'pumice', label: 'Pumice / pierre ponce', category: 'mineraux' },
        { value: 'gravillon', label: 'Gravillon / graviers', category: 'mineraux' },
        { value: 'brique', label: 'Brique concassée / matériaux céramiques inertes', category: 'mineraux' },

        // Terreux et organiques
        { value: 'terre-vegetale', label: 'Terre végétale', category: 'terreux' },
        { value: 'terreau-horticole', label: 'Terreau horticole générique', category: 'terreux' },
        { value: 'terreau-cannabis', label: 'Terreau spécial cannabis', category: 'terreux' },
        { value: 'tourbe-blonde', label: 'Tourbe blonde', category: 'terreux' },
        { value: 'tourbe-brune', label: 'Tourbe brune', category: 'terreux' },
        { value: 'compost-vegetal', label: 'Compost végétal', category: 'terreux' },
        { value: 'compost-animal', label: 'Compost animal', category: 'terreux' },
        { value: 'lombricompost', label: 'Lombricompost / vermicompost', category: 'terreux' },
        { value: 'humus-foret', label: 'Humus de forêt (si autorisé)', category: 'terreux' },

        // Amendements organiques
        { value: 'guano-chauve-souris', label: 'Guano de chauve-souris', category: 'amendements-organiques' },
        { value: 'guano-oiseau', label: 'Guano d\'oiseau marin', category: 'amendements-organiques' },
        { value: 'farine-sang', label: 'Farine de sang', category: 'amendements-organiques' },
        { value: 'farine-os', label: 'Farine d\'os', category: 'amendements-organiques' },
        { value: 'farine-poisson', label: 'Farine de poisson', category: 'amendements-organiques' },
        { value: 'farine-plumes', label: 'Farine de plumes', category: 'amendements-organiques' },
        { value: 'fumier-bovin', label: 'Fumier composté (bovin)', category: 'amendements-organiques' },
        { value: 'fumier-cheval', label: 'Fumier composté (cheval)', category: 'amendements-organiques' },
        { value: 'fumier-volaille', label: 'Fumier composté (volaille)', category: 'amendements-organiques' },
        { value: 'fumier-ovin', label: 'Fumier composté (ovin/caprin)', category: 'amendements-organiques' },
        { value: 'vinasse', label: 'Vinasse de betterave sèche', category: 'amendements-organiques' },
        { value: 'tourteaux', label: 'Tourteaux (ricin, neem, etc.)', category: 'amendements-organiques' },
        { value: 'melasse', label: 'Mélasse solide / sucre brut', category: 'amendements-organiques' },

        // Amendements minéraux
        { value: 'dolomie', label: 'Dolomie (carbonate de calcium/magnésium)', category: 'amendements-mineraux' },
        { value: 'chaux', label: 'Chaux agricole', category: 'amendements-mineraux' },
        { value: 'gypse', label: 'Gypse', category: 'amendements-mineraux' },
        { value: 'poudre-basalte', label: 'Poudre de basalte', category: 'amendements-mineraux' },
        { value: 'poudre-lave', label: 'Poudre de lave', category: 'amendements-mineraux' },
        { value: 'poudre-roche', label: 'Poudre de roche (rock dust générique)', category: 'amendements-mineraux' },
        { value: 'zeolite', label: 'Zeolite', category: 'amendements-mineraux' },
        { value: 'argile', label: 'Argile (bentonite, kaolinite, etc.)', category: 'amendements-mineraux' },
        { value: 'sels-encapsules', label: 'Sels minéraux encapsulés / à libération lente', category: 'amendements-mineraux' },

        // Autres
        { value: 'biochar', label: 'Biochar / charbon végétal', category: 'autres' },
        { value: 'fibre-bois', label: 'Fibre de bois', category: 'autres' },
        { value: 'ecorce', label: 'Écorce compostée', category: 'autres' },
        { value: 'coques-riz', label: 'Coques de riz', category: 'autres' },
        { value: 'coques-coco', label: 'Coques de coco (brutes)', category: 'autres' }
    ],

    marques_substrat: [
        { value: 'canna', label: 'Canna' },
        { value: 'plagron', label: 'Plagron' },
        { value: 'biobizz', label: 'Biobizz' },
        { value: 'atami', label: 'Atami' },
        { value: 'advanced-nutrients', label: 'Advanced Nutrients' },
        { value: 'house-garden', label: 'House & Garden' },
        { value: 'gh-terra-aquatica', label: 'General Hydroponics / Terra Aquatica' },
        { value: 'foxfarm', label: 'FoxFarm' },
        { value: 'mills', label: 'Mills' },
        { value: 'greenhouse-feeding', label: 'Green House Feeding' },
        { value: 'bac', label: 'BAC' },
        { value: 'aptus', label: 'Aptus' },
        { value: 'remo', label: 'Remo' },
        { value: 'autre', label: 'Autre' }
    ],

    // IRRIGATION
    systemes_irrigation: [
        { value: 'manuel-arrosoir', label: 'Arrosage manuel (arrosoir)' },
        { value: 'manuel-pompe', label: 'Arrosage manuel + pompe électrique' },
        { value: 'goutte-simple', label: 'Goutte à goutte simple' },
        { value: 'goutte-piquets', label: 'Goutte à goutte avec piquets' },
        { value: 'goutte-reglable', label: 'Goutte à goutte réglable' },
        { value: 'goutte-multi', label: 'Goutte à goutte multi-sorties' },
        { value: 'drip-line', label: 'Ligne de goutte à goutte (drip line)' },
        { value: 'ebb-flow', label: 'Ebb & Flow / Flood & Drain (table inondation)' },
        { value: 'sub-irrigation', label: 'Sub-irrigation / bottom feeding (plateaux, SIP)' },
        { value: 'top-feed', label: 'Systèmes top-feed automatisés' },
        { value: 'wicking', label: 'Systèmes à mèche / wicking' },
        { value: 'dwc-bullage', label: 'DWC avec bullage' },
        { value: 'rdwc', label: 'RDWC' },
        { value: 'nft', label: 'NFT' },
        { value: 'aero-basse', label: 'Aéroponie basse pression' },
        { value: 'aero-haute', label: 'Aéroponie haute pression' },
        { value: 'hybride', label: 'Système hybride (préciser)' },
        { value: 'brumisation', label: 'Brumisation / fogponic' }
    ],

    frequences_arrosage_jour: [
        { value: '1', label: '1 fois/jour' },
        { value: '2', label: '2 fois/jour' },
        { value: '3', label: '3 fois/jour' },
        { value: '4', label: '4 fois/jour' },
        { value: '6', label: '6 fois/jour' },
        { value: '8', label: '8 fois/jour' },
        { value: '12', label: '12 fois/jour' }
    ],

    frequences_arrosage_semaine: [
        { value: '1', label: '1 fois/semaine' },
        { value: '2', label: '2 fois/semaine' },
        { value: '3', label: '3 fois/semaine' },
        { value: '4', label: '4 fois/semaine' },
        { value: '5', label: '5 fois/semaine' },
        { value: '6', label: '6 fois/semaine' },
        { value: '7', label: '7 fois/semaine' }
    ],

    frequences_arrosage_speciales: [
        { value: 'continu', label: 'Irrigation en continu' },
        { value: 'demande', label: 'Irrigation à la demande (capteurs, tensiomètre)' }
    ],

    modes_volume_eau: [
        { value: 'fixe-pot', label: 'Volume fixe par pot' },
        { value: 'fixe-m2', label: 'Volume fixe par m²' },
        { value: 'variable', label: 'Volume variable (commentaire)' }
    ],

    unites_volume_eau: [
        { value: 'L', label: 'L' },
        { value: 'mL', label: 'mL' }
    ],

    unites_duree_arrosage: [
        { value: 'secondes', label: 'Secondes' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'heures', label: 'Heures' }
    ],

    // ENGRAIS
    types_engrais: [
        { value: 'mineral', label: 'Minéral / chimique' },
        { value: 'organique', label: 'Organique' },
        { value: 'mixte', label: 'Organique-minéral / mixte' },
        { value: 'bio-certifie', label: 'Biologique certifié' },
        { value: 'liberation-lente', label: 'Amendement solide à libération lente' },
        { value: 'hydro', label: 'Solution nutritive hydroponique' },
        { value: 'booster-racines', label: 'Booster / stimulateur racinaire' },
        { value: 'booster-floraison', label: 'Booster floraison' },
        { value: 'additifs', label: 'Additifs (enzymes, sucres, PK, etc.)' }
    ],

    marques_engrais: [
        { value: 'canna', label: 'Canna (Terra, Aqua, Coco, BioCanna, etc.)' },
        { value: 'plagron', label: 'Plagron (Terra, Alga, Coco, etc.)' },
        { value: 'biobizz', label: 'Biobizz (Bio-Grow, Bio-Bloom, etc.)' },
        { value: 'advanced-nutrients', label: 'Advanced Nutrients (pH Perfect, etc.)' },
        { value: 'gh-terra-aquatica', label: 'General Hydroponics / Terra Aquatica' },
        { value: 'house-garden', label: 'House & Garden' },
        { value: 'greenhouse-feeding', label: 'Green House Feeding' },
        { value: 'foxfarm', label: 'FoxFarm' },
        { value: 'mills', label: 'Mills' },
        { value: 'aptus', label: 'Aptus' },
        { value: 'remo', label: 'Remo Nutrients' },
        { value: 'autre', label: 'Autre' }
    ],

    unites_dosage: [
        { value: 'g/L', label: 'g/L' },
        { value: 'ml/L', label: 'ml/L' },
        { value: 'ml/10L', label: 'ml/10L' },
        { value: 'EC', label: 'EC (mS/cm)' },
        { value: 'ppm', label: 'ppm' }
    ],

    frequences_application_engrais: [
        { value: 'chaque-arrosage', label: 'À chaque arrosage' },
        { value: '1-sur-2', label: '1 arrosage sur 2' },
        { value: '1-par-jour', label: '1 fois par jour' },
        { value: '1-tous-2-jours', label: '1 fois tous les 2 jours' },
        { value: '1-par-semaine', label: '1 fois par semaine' },
        { value: '1-toutes-2-semaines', label: '1 fois toutes les 2 semaines' },
        { value: 'continu', label: 'Continu (fertigation permanente)' },
        { value: 'ponctuel', label: 'Ponctuel (début stretch, etc.)' }
    ],

    // LUMIÈRE
    types_lampe: [
        { value: 'led-panneau', label: 'LED panneau' },
        { value: 'led-barre', label: 'LED barre linéaire' },
        { value: 'led-quantum', label: 'LED quantum board' },
        { value: 'led-cob', label: 'LED COB' },
        { value: 'hps', label: 'HPS (sodium haute pression)' },
        { value: 'mh', label: 'MH (métal halide)' },
        { value: 'cmh-lec', label: 'CMH / LEC' },
        { value: 'cfl-neon', label: 'CFL / néon / T5' },
        { value: 'plasma', label: 'Plasma' },
        { value: 'halogenure', label: 'Halogénure céramique' },
        { value: 'multibar', label: 'Multibar industrial LED' },
        { value: 'naturel', label: 'Lumière naturelle uniquement' },
        { value: 'naturel-led', label: 'Lumière naturelle + complément LED' },
        { value: 'naturel-hps', label: 'Lumière naturelle + HPS' },
        { value: 'autre', label: 'Autre' }
    ],

    fabricants_lampe: [
        { value: 'spider-farmer', label: 'Spider Farmer' },
        { value: 'mars-hydro', label: 'Mars Hydro' },
        { value: 'hlg', label: 'HLG (Horticulture Lighting Group)' },
        { value: 'lumatek', label: 'Lumatek' },
        { value: 'migro', label: 'Migro' },
        { value: 'samsung', label: 'Samsung (LM301B/H)' },
        { value: 'sanlight', label: 'Sanlight' },
        { value: 'gavita', label: 'Gavita' },
        { value: 'lumii', label: 'Lumii' },
        { value: 'viparspectra', label: 'Viparspectra' },
        { value: 'secret-jardin', label: 'Secret Jardin' },
        { value: 'adjust-wings', label: 'Adjust-A-Wings' },
        { value: 'osram', label: 'Osram' },
        { value: 'philips', label: 'Philips' },
        { value: 'autre', label: 'Autre' }
    ],

    spectres_lumiere: [
        { value: 'complet', label: 'Spectre complet' },
        { value: 'bleu', label: 'Dominante bleue' },
        { value: 'rouge', label: 'Dominante rouge' },
        { value: 'croissance', label: 'Croissance (blue heavy)' },
        { value: 'floraison', label: 'Floraison (red heavy)' },
        { value: 'uv-a', label: 'UV-A inclus' },
        { value: 'uv-b', label: 'UV-B inclus' },
        { value: 'ir-far-red', label: 'IR / Far-red inclus' },
        { value: 'ajustable', label: 'Spectre ajustable / multi-canaux' },
        { value: 'non-specifie', label: 'Non spécifié' }
    ],

    unites_distance_lampe: [
        { value: 'cm', label: 'cm' },
        { value: 'm', label: 'm' },
        { value: 'pouces', label: 'pouces' }
    ],

    modes_distance_lampe: [
        { value: 'fixe', label: 'Fixe' },
        { value: 'variable', label: 'Variable (suivi dans pipeline)' }
    ],

    photoperiodes: [
        { value: '24/0', label: '24/0' },
        { value: '20/4', label: '20/4' },
        { value: '18/6', label: '18/6' },
        { value: '16/8', label: '16/8' },
        { value: '12/12', label: '12/12' },
        { value: '11/13', label: '11/13' },
        { value: '10/14', label: '10/14' },
        { value: 'personnalisee', label: 'Personnalisée' }
    ],

    temperatures_couleur_kelvin: [
        { value: '2700', label: '2700 K' },
        { value: '3000', label: '3000 K' },
        { value: '3500', label: '3500 K' },
        { value: '4000', label: '4000 K' },
        { value: '5000', label: '5000 K' },
        { value: '6500', label: '6500 K' },
        { value: 'mixte', label: 'Spectre mixte / non applicable' }
    ],

    // ENVIRONNEMENT CLIMATIQUE
    modes_controle_temperature: [
        { value: 'controlee', label: 'Contrôlée' },
        { value: 'non-controlee', label: 'Non contrôlée' }
    ],

    // CO2
    modes_injection_co2: [
        { value: 'injection-bouteille', label: 'Injection bouteille' },
        { value: 'generateur', label: 'Générateur' },
        { value: 'hvacd', label: 'HVACD' },
        { value: 'pas-controle', label: 'Pas de contrôle' }
    ],

    // VENTILATION
    types_ventilation: [
        { value: 'extracteur', label: 'Extracteur d\'air' },
        { value: 'intracteur', label: 'Intracteur d\'air' },
        { value: 'oscillant', label: 'Ventilateur oscillant' },
        { value: 'plafond', label: 'Ventilation au plafond' },
        { value: 'gaines', label: 'Ventilation par gaines (HVACD)' },
        { value: 'deshumidificateur', label: 'Déshumidificateur' },
        { value: 'humidificateur', label: 'Humidificateur' },
        { value: 'filtre-charbon', label: 'Filtre à charbon' }
    ],

    modes_ventilation: [
        { value: 'continu', label: 'Continu' },
        { value: 'cycle', label: 'Cyclé (minuterie)' },
        { value: 'hygro-thermo', label: 'Piloté par hygromètre/thermostat' },
        { value: 'pression', label: 'Piloté par pression différentielle' }
    ],

    // PALISSAGE
    methodologies_palissage: [
        { value: 'lst', label: 'LST (Low Stress Training)' },
        { value: 'hst', label: 'HST (High Stress Training)' },
        { value: 'topping', label: 'Topping (étêtage)' },
        { value: 'fimming', label: 'Fimming' },
        { value: 'main-lining', label: 'Main-Lining / Manifolding' },
        { value: 'scrog', label: 'SCROG (Screen of Green)' },
        { value: 'sog', label: 'SOG (Sea of Green)' },
        { value: 'lollipopping', label: 'Lollipopping' },
        { value: 'super-cropping', label: 'Super-cropping' },
        { value: 'defoliation', label: 'Defoliation ciblée' },
        { value: 'super-cropping-support', label: 'Super-cropping + support tuteur / filet' },
        { value: 'splitting', label: 'Splitting / fente de tige (avancé)' },
        { value: 'tuteurs-individuels', label: 'Tuteurs individuels' },
        { value: 'filets-multi', label: 'Filets multi-niveaux' },
        { value: 'horizontal', label: 'Palissage horizontal' },
        { value: 'vertical', label: 'Palissage vertical' },
        { value: 'ligaturage-simple', label: 'Ligaturage / tie-down simple' },
        { value: 'ligaturage-etoile', label: 'Ligaturage en étoile' },
        { value: 'taille-apicale', label: 'Taille apicale répétée' },
        { value: 'taille-laterale', label: 'Taille latérale' },
        { value: 'taille-racines', label: 'Taille de racines (rares, hydro)' },
        { value: 'aucun', label: 'Pas de palissage' },
        { value: 'autre', label: 'Autre technique' }
    ],

    // MORPHOLOGIE (catégories rapides)
    categories_taille: [
        { value: '<30', label: '<30 cm' },
        { value: '30-60', label: '30–60 cm' },
        { value: '60-90', label: '60–90 cm' },
        { value: '90-120', label: '90–120 cm' },
        { value: '120-150', label: '120–150 cm' },
        { value: '150-200', label: '150–200 cm' },
        { value: '>200', label: '>200 cm' }
    ],

    categories_volume_canopee: [
        { value: 'petit', label: 'Petit' },
        { value: 'moyen', label: 'Moyen' },
        { value: 'grand', label: 'Grand' },
        { value: 'tres-volumineux', label: 'Très volumineux' }
    ],

    categories_branches: [
        { value: '1-4', label: '1–4' },
        { value: '5-8', label: '5–8' },
        { value: '9-12', label: '9–12' },
        { value: '>12', label: '>12' }
    ],

    categories_feuilles: [
        { value: '<50', label: '<50' },
        { value: '50-100', label: '50–100' },
        { value: '100-200', label: '100–200' },
        { value: '>200', label: '>200' }
    ],

    categories_buds: [
        { value: '<20', label: '<20' },
        { value: '20-50', label: '20–50' },
        { value: '50-100', label: '50–100' },
        { value: '>100', label: '>100' }
    ],

    unites_poids_plante: [
        { value: 'g', label: 'g' },
        { value: 'kg', label: 'kg' }
    ],

    // RÉCOLTE
    couleurs_trichomes: [
        { value: 'transparent', label: 'Transparent / translucide' },
        { value: 'laiteux', label: 'Laiteux / opaque' },
        { value: 'ambre', label: 'Ambré' },
        { value: 'transparent-laiteux', label: 'Mélange transparent–laiteux' },
        { value: 'laiteux-ambre', label: 'Mélange laiteux–ambré' },
        { value: 'majorite-laiteux', label: 'Majorité laiteux' },
        { value: 'majorite-ambre', label: 'Majorité ambré' }
    ],

    categories_rendement: [
        { value: 'faible', label: 'Faible' },
        { value: 'moyen', label: 'Moyen' },
        { value: 'bon', label: 'Bon' },
        { value: 'tres-eleve', label: 'Très élevé' }
    ]
};
