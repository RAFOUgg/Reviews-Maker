/**
 * TERPÈNES - Liste exhaustive
 * Basé sur Dev_cultures.md section 7.2
 * 
 * Format : { id, label, aromas, effects, boilingPoint, description }
 */

export const TERPENES = [
    {
        id: 'myrcene',
        label: 'Myrcène',
        emoji: '🌿',
        aromas: ['Terreux', 'Musqué', 'Clou de girofle', 'Herbes'],
        effects: ['Relaxant', 'Sédatif', 'Analgésique', 'Anti-inflammatoire', 'Aide au sommeil'],
        medicalUses: ['Insomnie', 'Douleurs', 'Inflammation', 'Anxiété'],
        boilingPoint: 167,
        unit: '°C',
        description: 'Terpène le plus abondant dans le cannabis, effet d\'entourage avec THC',
        color: '#8B7355',
        alsoFoundIn: ['Mangue', 'Houblon', 'Citronnelle', 'Thym']
    },
    {
        id: 'limonene',
        label: 'Limonène',
        emoji: '🍋',
        aromas: ['Citron', 'Orange', 'Agrumes', 'Frais'],
        effects: ['Énergisant', 'Antidépresseur', 'Antistress', 'Immunostimulant', 'Euphorisant'],
        medicalUses: ['Dépression', 'Anxiété', 'Reflux gastrique', 'Antifongique'],
        boilingPoint: 176,
        unit: '°C',
        description: 'Arôme citrus caractéristique, effets stimulants et améliorateurs d\'humeur',
        color: '#FFD700',
        alsoFoundIn: ['Citron', 'Orange', 'Genévrier', 'Menthe poivrée']
    },
    {
        id: 'caryophyllene',
        label: 'β-Caryophyllène',
        emoji: '🌶️',
        aromas: ['Poivre', 'Boisé', 'Épicé', 'Clou de girofle'],
        effects: ['Anti-inflammatoire', 'Analgésique', 'Anxiolytique', 'Neuroprotecteur', 'Gastroprotecteur'],
        medicalUses: ['Douleurs chroniques', 'Arthrite', 'Anxiété', 'Dépression', 'Ulcères'],
        boilingPoint: 130,
        unit: '°C',
        description: 'Seul terpène connu à agir comme cannabinoïde (agoniste CB2)',
        color: '#8B4513',
        alsoFoundIn: ['Poivre noir', 'Clou de girofle', 'Cannelle', 'Houblon']
    },
    {
        id: 'linalool',
        label: 'Linalol',
        emoji: '💜',
        aromas: ['Lavande', 'Floral', 'Épicé', 'Boisé'],
        effects: ['Relaxant', 'Anxiolytique', 'Anticonvulsivant', 'Analgésique', 'Sédatif'],
        medicalUses: ['Anxiété', 'Insomnie', 'Crises', 'Douleurs', 'Inflammation'],
        boilingPoint: 198,
        unit: '°C',
        description: 'Arôme floral de lavande, puissant calmant et relaxant',
        color: '#E6E6FA',
        alsoFoundIn: ['Lavande', 'Menthe', 'Cannelle', 'Laurier']
    },
    {
        id: 'pinene-alpha',
        label: 'α-Pinène',
        emoji: '🌲',
        aromas: ['Pin', 'Résineux', 'Frais', 'Forêt'],
        effects: ['Bronchodilatateur', 'Anti-inflammatoire', 'Alerte mentale', 'Aide mémoire', 'Énergisant'],
        medicalUses: ['Asthme', 'Mémoire', 'Inflammation', 'Infections respiratoires'],
        boilingPoint: 156,
        unit: '°C',
        description: 'Arôme de pin/sapin, améliore la vigilance et la mémoire',
        color: '#228B22',
        alsoFoundIn: ['Pin', 'Sapin', 'Romarin', 'Basilic', 'Persil']
    },
    {
        id: 'pinene-beta',
        label: 'β-Pinène',
        emoji: '🌲',
        aromas: ['Pin', 'Houblon', 'Boisé', 'Résineux'],
        effects: ['Anti-inflammatoire', 'Bronchodilatateur', 'Aide mémoire'],
        medicalUses: ['Inflammation', 'Asthme', 'Ulcères'],
        boilingPoint: 166,
        unit: '°C',
        description: 'Isomère du α-Pinène, arôme de houblon et pin',
        color: '#2E8B57',
        alsoFoundIn: ['Houblon', 'Pin', 'Cumin', 'Persil']
    },
    {
        id: 'terpinolene',
        label: 'Terpinolène',
        emoji: '🌸',
        aromas: ['Floral', 'Pin', 'Herbes', 'Agrumes'],
        effects: ['Sédatif', 'Antioxydant', 'Antibactérien', 'Anticancéreux (recherche)'],
        medicalUses: ['Insomnie', 'Inflammation', 'Infections', 'Prévention cancer'],
        boilingPoint: 186,
        unit: '°C',
        description: 'Arôme complexe floral et herbacé, propriétés sédatives',
        color: '#DDA0DD',
        alsoFoundIn: ['Sauge', 'Romarin', 'Pomme', 'Cumin']
    },
    {
        id: 'humulene',
        label: 'Humulène',
        emoji: '🍺',
        aromas: ['Terreux', 'Boisé', 'Houblon', 'Épicé'],
        effects: ['Anti-inflammatoire', 'Antibactérien', 'Coupe-faim', 'Analgésique'],
        medicalUses: ['Inflammation', 'Douleurs', 'Allergies', 'Tumeurs'],
        boilingPoint: 198,
        unit: '°C',
        description: 'Arôme de houblon, propriétés anti-inflammatoires et coupe-faim',
        color: '#CD853F',
        alsoFoundIn: ['Houblon', 'Coriandre', 'Basilic', 'Ginseng']
    },
    {
        id: 'ocimene',
        label: 'Ocimène',
        emoji: '🌼',
        aromas: ['Sucré', 'Herbes', 'Boisé', 'Agrumes'],
        effects: ['Antiviral', 'Antifongique', 'Antiseptique', 'Décongestionnant'],
        medicalUses: ['Infections virales', 'Infections fongiques', 'Congestion'],
        boilingPoint: 100,
        unit: '°C',
        description: 'Arôme floral sucré, propriétés antivirales et antifongiques',
        color: '#FFB6C1',
        alsoFoundIn: ['Menthe', 'Persil', 'Poivre', 'Orchidées']
    },
    {
        id: 'bisabolol',
        label: 'Bisabolol',
        emoji: '🌼',
        aromas: ['Floral', 'Sucré', 'Camomille', 'Doux'],
        effects: ['Anti-inflammatoire', 'Antibactérien', 'Antioxydant', 'Cicatrisant', 'Apaisant'],
        medicalUses: ['Irritations cutanées', 'Inflammation', 'Infections', 'Anxiété'],
        boilingPoint: 153,
        unit: '°C',
        description: 'Arôme doux de camomille, effets apaisants et cicatrisants',
        color: '#FFFACD',
        alsoFoundIn: ['Camomille', 'Candeia (arbre)', 'Baume']
    },
    {
        id: 'nerolidol',
        label: 'Nérolidol',
        emoji: '🌳',
        aromas: ['Boisé', 'Floral', 'Agrumes', 'Rose'],
        effects: ['Sédatif', 'Anxiolytique', 'Antifongique', 'Antiparasitaire', 'Anticancéreux (recherche)'],
        medicalUses: ['Anxiété', 'Insomnie', 'Infections fongiques', 'Paludisme'],
        boilingPoint: 122,
        unit: '°C',
        description: 'Arôme boisé floral, effets sédatifs et propriétés médicinales prometteuses',
        color: '#F0E68C',
        alsoFoundIn: ['Gingembre', 'Jasmin', 'Lavande', 'Arbre à thé']
    },
    {
        id: 'guaiol',
        label: 'Guaïol',
        emoji: '🌲',
        aromas: ['Pin', 'Boisé', 'Rose', 'Terreux'],
        effects: ['Anti-inflammatoire', 'Antimicrobien', 'Antioxydant', 'Diurétique'],
        medicalUses: ['Inflammation', 'Infections', 'Hypertension'],
        boilingPoint: 92,
        unit: '°C',
        description: 'Arôme de bois de pin et rose, propriétés anti-inflammatoires',
        color: '#CD853F',
        alsoFoundIn: ['Cyprès', 'Guaïac (bois)', 'Sauge']
    },
    {
        id: 'valencene',
        label: 'Valencène',
        emoji: '🍊',
        aromas: ['Orange', 'Pamplemousse', 'Herbes', 'Boisé'],
        effects: ['Anti-inflammatoire', 'Insectifuge', 'Neuroprotecteur'],
        medicalUses: ['Inflammation', 'Allergies', 'Protection neuronale'],
        boilingPoint: 125,
        unit: '°C',
        description: 'Arôme d\'orange valencienne, propriétés anti-inflammatoires',
        color: '#FFA500',
        alsoFoundIn: ['Oranges Valencia', 'Pamplemousse', 'Mangue']
    },
    {
        id: 'geraniol',
        label: 'Géraniol',
        emoji: '🌹',
        aromas: ['Rose', 'Floral', 'Fruité', 'Sucré'],
        effects: ['Antioxydant', 'Neuroprotecteur', 'Anticancéreux (recherche)', 'Relaxant'],
        medicalUses: ['Inflammation', 'Neuroprotection', 'Prévention cancer'],
        boilingPoint: 230,
        unit: '°C',
        description: 'Arôme de rose et géranium, propriétés neuroprotectrices',
        color: '#FFB6C1',
        alsoFoundIn: ['Rose', 'Géranium', 'Citron', 'Tabac']
    },
    {
        id: 'eucalyptol',
        label: 'Eucalyptol (1,8-cinéole)',
        emoji: '🌿',
        aromas: ['Eucalyptus', 'Menthol', 'Camphre', 'Frais'],
        effects: ['Anti-inflammatoire', 'Analgésique', 'Bronchodilatateur', 'Cognition'],
        medicalUses: ['Asthme', 'Sinusite', 'Douleurs', 'Alzheimer (recherche)'],
        boilingPoint: 176,
        unit: '°C',
        description: 'Arôme d\'eucalyptus, effets respiratoires et cognitifs',
        color: '#7FFFD4',
        alsoFoundIn: ['Eucalyptus', 'Romarin', 'Laurier', 'Sauge']
    },
    {
        id: 'camphene',
        label: 'Camphène',
        emoji: '🌲',
        aromas: ['Camphre', 'Pin', 'Terreux', 'Moisi'],
        effects: ['Antioxydant', 'Hypolipidémiant', 'Anti-inflammatoire'],
        medicalUses: ['Cholestérol', 'Cardiovasculaire', 'Infections fongiques'],
        boilingPoint: 159,
        unit: '°C',
        description: 'Arôme de camphre et pin, effets sur le cholestérol',
        color: '#556B2F',
        alsoFoundIn: ['Sapin', 'Camphre', 'Gingembre', 'Noix de muscade']
    },
    {
        id: 'borneol',
        label: 'Bornéol',
        emoji: '🌲',
        aromas: ['Menthol', 'Camphre', 'Herbes', 'Terreux'],
        effects: ['Analgésique', 'Anti-inflammatoire', 'Sédatif', 'Antispasmodique'],
        medicalUses: ['Douleurs', 'Fièvre', 'Inflammation', 'Spasmes'],
        boilingPoint: 210,
        unit: '°C',
        description: 'Arôme mentholé camphreux, utilisé en médecine traditionnelle chinoise',
        color: '#98D8C8',
        alsoFoundIn: ['Romarin', 'Menthe', 'Gingembre', 'Valériane']
    },
    {
        id: 'pulegone',
        label: 'Pulégone',
        emoji: '🌿',
        aromas: ['Menthe', 'Camphre', 'Bonbon'],
        effects: ['Sédatif', 'Antipyrétique', 'Insectifuge'],
        medicalUses: ['Fièvre', 'Digestion'],
        boilingPoint: 224,
        unit: '°C',
        description: 'Arôme de menthe poivrée, propriétés sédatives',
        color: '#90EE90',
        alsoFoundIn: ['Menthe pouliot', 'Romarin', 'Pennyroyal'],
        warning: true,
        warningText: 'Toxique à hautes concentrations'
    },
    {
        id: 'sabinene',
        label: 'Sabinène',
        emoji: '🌲',
        aromas: ['Pin', 'Épicé', 'Citrus', 'Boisé'],
        effects: ['Antioxydant', 'Anti-inflammatoire', 'Antibactérien'],
        medicalUses: ['Inflammation', 'Infections', 'Digestion'],
        boilingPoint: 163,
        unit: '°C',
        description: 'Arôme de pin épicé, propriétés antioxydantes',
        color: '#4F7942',
        alsoFoundIn: ['Noix de muscade', 'Poivre noir', 'Carvi']
    },
    {
        id: 'phytol',
        label: 'Phytol',
        emoji: '🌿',
        aromas: ['Floral', 'Balsamique', 'Vert'],
        effects: ['Relaxant', 'Immunostimulant', 'Métabolisme vitamine E/K'],
        medicalUses: ['Anxiété', 'Immunité', 'Métabolisme'],
        boilingPoint: 203,
        unit: '°C',
        description: 'Produit de dégradation de la chlorophylle, effets relaxants',
        color: '#9ACD32',
        alsoFoundIn: ['Thé vert', 'Algues', 'Légumes verts']
    }
]

/**
 * Catégories de terpènes
 */
export const TERPENE_CATEGORIES = {
    dominant: { label: 'Dominants', description: 'Terpènes généralement >1%' },
    secondary: { label: 'Secondaires', description: 'Terpènes 0.1-1%' },
    trace: { label: 'Traces', description: 'Terpènes <0.1%' }
}

/**
 * Obtenir un terpène par ID
 */
export function getTerpeneById(id) {
    return TERPENES.find(t => t.id === id)
}

/**
 * Rechercher des terpènes par arôme
 */
export function searchTerpenesByAroma(aromaQuery) {
    const query = aromaQuery.toLowerCase()
    return TERPENES.filter(t =>
        t.aromas.some(aroma => aroma.toLowerCase().includes(query))
    )
}

/**
 * Rechercher des terpènes par effet
 */
export function searchTerpenesByEffect(effectQuery) {
    const query = effectQuery.toLowerCase()
    return TERPENES.filter(t =>
        t.effects.some(effect => effect.toLowerCase().includes(query))
    )
}

/**
 * Calculer le profil aromatique à partir des terpènes
 */
export function calculateAromaProfile(terpeneValues) {
    const aromaCount = {}

    Object.entries(terpeneValues).forEach(([terpeneId, value]) => {
        if (!value) return
        const terpene = getTerpeneById(terpeneId)
        if (!terpene) return

        terpene.aromas.forEach(aroma => {
            aromaCount[aroma] = (aromaCount[aroma] || 0) + value
        })
    })

    return Object.entries(aromaCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([aroma]) => aroma)
}

/**
 * Calculer le profil d'effets à partir des terpènes
 */
export function calculateEffectProfile(terpeneValues) {
    const effectCount = {}

    Object.entries(terpeneValues).forEach(([terpeneId, value]) => {
        if (!value) return
        const terpene = getTerpeneById(terpeneId)
        if (!terpene) return

        terpene.effects.forEach(effect => {
            effectCount[effect] = (effectCount[effect] || 0) + value
        })
    })

    return Object.entries(effectCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([effect]) => effect)
}
