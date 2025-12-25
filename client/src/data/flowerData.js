/**
 * Données prédéfinies pour les reviews de Fleurs
 * Listes complètes pour odeurs, goûts et effets
 */

// Notes d'odeurs dominantes et secondaires (max 7 chacun)
export const ODEURS_NOTES = [
    // Fruités
    { id: 'citron', label: 'Citron', category: 'fruité' },
    { id: 'orange', label: 'Orange', category: 'fruité' },
    { id: 'pamplemousse', label: 'Pamplemousse', category: 'fruité' },
    { id: 'mangue', label: 'Mangue', category: 'fruité' },
    { id: 'ananas', label: 'Ananas', category: 'fruité' },
    { id: 'fraise', label: 'Fraise', category: 'fruité' },
    { id: 'framboise', label: 'Framboise', category: 'fruité' },
    { id: 'myrtille', label: 'Myrtille', category: 'fruité' },
    { id: 'raisin', label: 'Raisin', category: 'fruité' },
    { id: 'pomme', label: 'Pomme', category: 'fruité' },
    { id: 'poire', label: 'Poire', category: 'fruité' },
    { id: 'banane', label: 'Banane', category: 'fruité' },
    { id: 'melon', label: 'Melon', category: 'fruité' },
    { id: 'peche', label: 'Pêche', category: 'fruité' },

    // Floraux
    { id: 'lavande', label: 'Lavande', category: 'floral' },
    { id: 'rose', label: 'Rose', category: 'floral' },
    { id: 'jasmin', label: 'Jasmin', category: 'floral' },
    { id: 'lilas', label: 'Lilas', category: 'floral' },

    // Boisés
    { id: 'pin', label: 'Pin', category: 'boisé' },
    { id: 'cedre', label: 'Cèdre', category: 'boisé' },
    { id: 'santal', label: 'Santal', category: 'boisé' },
    { id: 'chene', label: 'Chêne', category: 'boisé' },

    // Terreux
    { id: 'terreux', label: 'Terreux', category: 'terreux' },
    { id: 'mousse', label: 'Mousse', category: 'terreux' },
    { id: 'champignon', label: 'Champignon', category: 'terreux' },
    { id: 'humide', label: 'Humide', category: 'terreux' },

    // Épicés
    { id: 'poivre', label: 'Poivre', category: 'épicé' },
    { id: 'clou-girofle', label: 'Clou de girofle', category: 'épicé' },
    { id: 'cannelle', label: 'Cannelle', category: 'épicé' },
    { id: 'gingembre', label: 'Gingembre', category: 'épicé' },
    { id: 'anis', label: 'Anis', category: 'épicé' },
    { id: 'muscade', label: 'Muscade', category: 'épicé' },

    // Sucrés
    { id: 'miel', label: 'Miel', category: 'sucré' },
    { id: 'caramel', label: 'Caramel', category: 'sucré' },
    { id: 'vanille', label: 'Vanille', category: 'sucré' },
    { id: 'chocolat', label: 'Chocolat', category: 'sucré' },

    // Herbes
    { id: 'menthe', label: 'Menthe', category: 'herbes' },
    { id: 'basilic', label: 'Basilic', category: 'herbes' },
    { id: 'thym', label: 'Thym', category: 'herbes' },
    { id: 'romarin', label: 'Romarin', category: 'herbes' },
    { id: 'sauge', label: 'Sauge', category: 'herbes' },

    // Diesel/Carburant
    { id: 'diesel', label: 'Diesel', category: 'diesel' },
    { id: 'essence', label: 'Essence', category: 'diesel' },
    { id: 'chimique', label: 'Chimique', category: 'diesel' },

    // Autres
    { id: 'ammoniac', label: 'Ammoniac', category: 'autre' },
    { id: 'fromage', label: 'Fromage', category: 'autre' },
    { id: 'skunk', label: 'Skunk', category: 'autre' },
    { id: 'tabac', label: 'Tabac', category: 'autre' },
    { id: 'cafe', label: 'Café', category: 'autre' },
]

// Notes de goûts (dry puff, inhalation, expiration) - max 7 chacun
export const GOUTS_NOTES = [
    // Réutilise les mêmes que ODEURS_NOTES + quelques spécifiques
    ...ODEURS_NOTES,
    { id: 'cendre', label: 'Cendre', category: 'fumée' },
    { id: 'brulé', label: 'Brûlé', category: 'fumée' },
    { id: 'amer', label: 'Amer', category: 'saveur' },
    { id: 'acide', label: 'Acide', category: 'saveur' },
    { id: 'sale', label: 'Salé', category: 'saveur' },
    { id: 'metallique', label: 'Métallique', category: 'saveur' },
]

// Effets ressentis (max 8) classés par type
export const EFFETS = [
    // Mentaux
    { id: 'relaxant', label: 'Relaxant', category: 'mentaux', sentiment: 'positif' },
    { id: 'euphorique', label: 'Euphorique', category: 'mentaux', sentiment: 'positif' },
    { id: 'creatif', label: 'Créatif', category: 'mentaux', sentiment: 'positif' },
    { id: 'concentre', label: 'Concentré', category: 'mentaux', sentiment: 'positif' },
    { id: 'energisant', label: 'Énergisant', category: 'mentaux', sentiment: 'positif' },
    { id: 'sociable', label: 'Sociable', category: 'mentaux', sentiment: 'positif' },
    { id: 'joyeux', label: 'Joyeux', category: 'mentaux', sentiment: 'positif' },
    { id: 'motivant', label: 'Motivant', category: 'mentaux', sentiment: 'positif' },

    { id: 'anxiete', label: 'Anxiété', category: 'mentaux', sentiment: 'negatif' },
    { id: 'paranoïa', label: 'Paranoïa', category: 'mentaux', sentiment: 'negatif' },
    { id: 'confusion', label: 'Confusion', category: 'mentaux', sentiment: 'negatif' },
    { id: 'lethargie', label: 'Léthargie', category: 'mentaux', sentiment: 'negatif' },

    // Physiques
    { id: 'couch-lock', label: 'Couch-lock', category: 'physiques', sentiment: 'neutre' },
    { id: 'detente-musculaire', label: 'Détente musculaire', category: 'physiques', sentiment: 'positif' },
    { id: 'lourdeur-corporelle', label: 'Lourdeur corporelle', category: 'physiques', sentiment: 'neutre' },
    { id: 'legerete', label: 'Légèreté', category: 'physiques', sentiment: 'positif' },
    { id: 'fourmillements', label: 'Fourmillements', category: 'physiques', sentiment: 'neutre' },
    { id: 'chaleur', label: 'Chaleur', category: 'physiques', sentiment: 'neutre' },

    { id: 'yeux-secs', label: 'Yeux secs', category: 'physiques', sentiment: 'negatif' },
    { id: 'bouche-seche', label: 'Bouche sèche', category: 'physiques', sentiment: 'negatif' },
    { id: 'faim', label: 'Fringales', category: 'physiques', sentiment: 'neutre' },
    { id: 'vertiges', label: 'Vertiges', category: 'physiques', sentiment: 'negatif' },
    { id: 'nausee', label: 'Nausée', category: 'physiques', sentiment: 'negatif' },
    { id: 'mal-de-tete', label: 'Mal de tête', category: 'physiques', sentiment: 'negatif' },

    // Thérapeutiques
    { id: 'anti-douleur', label: 'Anti-douleur', category: 'thérapeutiques', sentiment: 'positif' },
    { id: 'anti-stress', label: 'Anti-stress', category: 'thérapeutiques', sentiment: 'positif' },
    { id: 'anti-inflammatoire', label: 'Anti-inflammatoire', category: 'thérapeutiques', sentiment: 'positif' },
    { id: 'aide-sommeil', label: 'Aide au sommeil', category: 'thérapeutiques', sentiment: 'positif' },
    { id: 'stimule-appetit', label: 'Stimule appétit', category: 'thérapeutiques', sentiment: 'positif' },
    { id: 'anti-nausee', label: 'Anti-nausée', category: 'thérapeutiques', sentiment: 'positif' },
    { id: 'anti-convulsion', label: 'Anti-convulsion', category: 'thérapeutiques', sentiment: 'positif' },
    { id: 'anti-anxiete', label: 'Anti-anxiété', category: 'thérapeutiques', sentiment: 'positif' },
]

// Nuancier de couleurs pour le cannabis
export const COULEURS_CANNABIS = [
    { id: 'vert-clair', label: 'Vert clair', hex: '#9ACD32' },
    { id: 'vert-moyen', label: 'Vert moyen', hex: '#4CAF50' },
    { id: 'vert-fonce', label: 'Vert foncé', hex: '#1B5E20' },
    { id: 'vert-olive', label: 'Vert olive', hex: '#808000' },
    { id: 'violet-clair', label: 'Violet clair', hex: '#BA68C8' },
    { id: 'violet-fonce', label: 'Violet foncé', hex: '#6A1B9A' },
    { id: 'pourpre', label: 'Pourpre', hex: '#8E24AA' },
    { id: 'orange', label: 'Orange', hex: '#FF9800' },
    { id: 'rouge', label: 'Rouge', category: 'rouge', hex: '#F44336' },
    { id: 'jaune', label: 'Jaune', hex: '#FDD835' },
    { id: 'dore', label: 'Doré', hex: '#FFB300' },
    { id: 'brun-clair', label: 'Brun clair', hex: '#A1887F' },
    { id: 'brun-fonce', label: 'Brun foncé', hex: '#5D4037' },
    { id: 'gris', label: 'Gris', hex: '#9E9E9E' },
    { id: 'blanc-glace', label: 'Blanc glacé', hex: '#ECEFF1' },
]

// Types de culture
export const CULTURE_MODES = [
    { id: 'indoor', label: 'Indoor' },
    { id: 'outdoor', label: 'Outdoor' },
    { id: 'greenhouse', label: 'Greenhouse (Serre)' },
    { id: 'no-till', label: 'No-till' },
    { id: 'autre', label: 'Autre' },
]

// Types d'espaces de culture
export const CULTURE_SPACES = [
    { id: 'armoire', label: 'Armoire' },
    { id: 'tente', label: 'Tente de culture' },
    { id: 'serre', label: 'Serre' },
    { id: 'exterieur', label: 'Extérieur' },
    { id: 'piece-dediee', label: 'Pièce dédiée' },
    { id: 'autre', label: 'Autre' },
]

// Types de lampes
export const LIGHT_TYPES = [
    { id: 'led', label: 'LED' },
    { id: 'hps', label: 'HPS (Sodium haute pression)' },
    { id: 'mh', label: 'MH (Halogénures métalliques)' },
    { id: 'cfl', label: 'CFL (Fluocompacte)' },
    { id: 'naturel', label: 'Lumière naturelle' },
    { id: 'mixte', label: 'Mixte' },
    { id: 'autre', label: 'Autre' },
]

// Types de substrat
export const SUBSTRATE_TYPES = [
    { id: 'hydro', label: 'Hydroponie' },
    { id: 'bio', label: 'Bio' },
    { id: 'organique', label: 'Organique' },
    { id: 'terre', label: 'Terre' },
    { id: 'coco', label: 'Fibre de coco' },
    { id: 'laine-roche', label: 'Laine de roche' },
    { id: 'perlite', label: 'Perlite' },
    { id: 'vermiculite', label: 'Vermiculite' },
    { id: 'autre', label: 'Autre' },
]

// Méthodes de consommation
export const CONSUMPTION_METHODS = [
    { id: 'combustion', label: 'Combustion (Joint/Pipe)' },
    { id: 'vapeur', label: 'Vaporisation' },
    { id: 'infusion', label: 'Infusion' },
    { id: 'comestible', label: 'Comestible' },
]

// Durée des effets
export const EFFECT_DURATIONS = [
    { id: 'courte', label: 'Courte (< 1h)' },
    { id: 'moyenne', label: 'Moyenne (1-2h)' },
    { id: 'longue', label: 'Longue (2-4h)' },
    { id: 'tres-longue', label: 'Très longue (4h+)' },
]

// Début des effets
export const EFFECT_ONSETS = [
    { id: 'immediat', label: 'Immédiat (< 5min)' },
    { id: 'rapide', label: 'Rapide (5-15min)' },
    { id: 'differe', label: 'Différé (15-30min)' },
    { id: 'lent', label: 'Lent (30min+)' },
]

// Usage préféré
export const PREFERRED_USES = [
    { id: 'matin', label: 'Matin' },
    { id: 'journee', label: 'Journée' },
    { id: 'soir', label: 'Soir' },
    { id: 'nuit', label: 'Nuit' },
    { id: 'seul', label: 'Seul' },
    { id: 'social', label: 'Social' },
    { id: 'medical', label: 'Médical' },
    { id: 'recreatif', label: 'Récréatif' },
]
