/**
 * ROUE AROMATIQUE - Cannabis Aroma Wheel
 * Basée sur Dev_cultures.md section 9.1
 * Structure CATA (Check-All-That-Apply)
 * 
 * 7 catégories principales + 80+ sous-catégories
 * Format : { id, label, emoji, category, description }
 */

export const AROMA_CATEGORIES = [
    { id: 'fruity', label: 'Fruité', emoji: '🍊', color: '#FF6B6B' },
    { id: 'floral', label: 'Floral', emoji: '🌸', color: '#FF69B4' },
    { id: 'earthy-woody', label: 'Terreux / Boisé', emoji: '🌲', color: '#8B4513' },
    { id: 'spicy', label: 'Piquant / Épicé', emoji: '🌶️', color: '#FF4500' },
    { id: 'skunky', label: 'Skunky / Animalic', emoji: '🦨', color: '#696969' },
    { id: 'chemical', label: 'Chimique / Gaz', emoji: '⛽', color: '#4169E1' },
    { id: 'sweet', label: 'Sucré / Gourmand', emoji: '🍯', color: '#FFD700' },
    { id: 'herbal', label: 'Végétal / Herbacé', emoji: '🌿', color: '#32CD32' }
]

export const AROMAS = [
    // ============================================================================
    // FRUITÉ
    // ============================================================================
    { id: 'citrus-lemon', label: 'Citron', emoji: '🍋', category: 'fruity', subcategory: 'Agrumes' },
    { id: 'citrus-lime', label: 'Citron vert', emoji: '🍈', category: 'fruity', subcategory: 'Agrumes' },
    { id: 'citrus-orange', label: 'Orange', emoji: '🍊', category: 'fruity', subcategory: 'Agrumes' },
    { id: 'citrus-grapefruit', label: 'Pamplemousse', emoji: '🍊', category: 'fruity', subcategory: 'Agrumes' },
    { id: 'citrus-tangerine', label: 'Mandarine', emoji: '🍊', category: 'fruity', subcategory: 'Agrumes' },
    { id: 'citrus-bergamot', label: 'Bergamote', emoji: '🍋', category: 'fruity', subcategory: 'Agrumes' },

    { id: 'berry-strawberry', label: 'Fraise', emoji: '🍓', category: 'fruity', subcategory: 'Baies' },
    { id: 'berry-blueberry', label: 'Myrtille', emoji: '🫐', category: 'fruity', subcategory: 'Baies' },
    { id: 'berry-raspberry', label: 'Framboise', emoji: '🍇', category: 'fruity', subcategory: 'Baies' },
    { id: 'berry-blackberry', label: 'Mûre', emoji: '🫐', category: 'fruity', subcategory: 'Baies' },
    { id: 'berry-cranberry', label: 'Canneberge', emoji: '🍒', category: 'fruity', subcategory: 'Baies' },
    { id: 'berry-cherry', label: 'Cerise', emoji: '🍒', category: 'fruity', subcategory: 'Baies' },
    { id: 'berry-grape', label: 'Raisin', emoji: '🍇', category: 'fruity', subcategory: 'Baies' },

    { id: 'tropical-mango', label: 'Mangue', emoji: '🥭', category: 'fruity', subcategory: 'Tropical' },
    { id: 'tropical-pineapple', label: 'Ananas', emoji: '🍍', category: 'fruity', subcategory: 'Tropical' },
    { id: 'tropical-papaya', label: 'Papaye', emoji: '🍈', category: 'fruity', subcategory: 'Tropical' },
    { id: 'tropical-passionfruit', label: 'Fruit de la passion', emoji: '🥥', category: 'fruity', subcategory: 'Tropical' },
    { id: 'tropical-coconut', label: 'Noix de coco', emoji: '🥥', category: 'fruity', subcategory: 'Tropical' },
    { id: 'tropical-banana', label: 'Banane', emoji: '🍌', category: 'fruity', subcategory: 'Tropical' },
    { id: 'tropical-guava', label: 'Goyave', emoji: '🍑', category: 'fruity', subcategory: 'Tropical' },

    { id: 'stone-peach', label: 'Pêche', emoji: '🍑', category: 'fruity', subcategory: 'Fruits à noyau' },
    { id: 'stone-apricot', label: 'Abricot', emoji: '🍑', category: 'fruity', subcategory: 'Fruits à noyau' },
    { id: 'stone-plum', label: 'Prune', emoji: '🍑', category: 'fruity', subcategory: 'Fruits à noyau' },

    { id: 'melon-watermelon', label: 'Pastèque', emoji: '🍉', category: 'fruity', subcategory: 'Melons' },
    { id: 'melon-cantaloupe', label: 'Melon cantaloup', emoji: '🍈', category: 'fruity', subcategory: 'Melons' },
    { id: 'melon-honeydew', label: 'Melon miel', emoji: '🍈', category: 'fruity', subcategory: 'Melons' },

    { id: 'dried-raisin', label: 'Raisin sec', emoji: '🍇', category: 'fruity', subcategory: 'Fruits secs' },
    { id: 'dried-fig', label: 'Figue', emoji: '🍇', category: 'fruity', subcategory: 'Fruits secs' },
    { id: 'dried-date', label: 'Datte', emoji: '🍂', category: 'fruity', subcategory: 'Fruits secs' },
    { id: 'dried-prune', label: 'Pruneau', emoji: '🍂', category: 'fruity', subcategory: 'Fruits secs' },

    { id: 'apple', label: 'Pomme', emoji: '🍎', category: 'fruity', subcategory: 'Pomme/Poire' },
    { id: 'pear', label: 'Poire', emoji: '🍐', category: 'fruity', subcategory: 'Pomme/Poire' },

    // ============================================================================
    // FLORAL
    // ============================================================================
    { id: 'floral-rose', label: 'Rose', emoji: '🌹', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-lavender', label: 'Lavande', emoji: '💜', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-jasmine', label: 'Jasmin', emoji: '🌸', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-lilac', label: 'Lilas', emoji: '💜', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-violet', label: 'Violette', emoji: '💜', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-honeysuckle', label: 'Chèvrefeuille', emoji: '🌺', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-hibiscus', label: 'Hibiscus', emoji: '🌺', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-geranium', label: 'Géranium', emoji: '🌸', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-chamomile', label: 'Camomille', emoji: '🌼', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-white', label: 'Fleur blanche', emoji: '🤍', category: 'floral', subcategory: 'Fleurs classiques' },
    { id: 'floral-perfume', label: 'Parfumé/Savonneux', emoji: '🧼', category: 'floral', subcategory: 'Fleurs classiques' },

    // ============================================================================
    // TERREUX / BOISÉ
    // ============================================================================
    { id: 'earthy-soil', label: 'Terre humide', emoji: '🌍', category: 'earthy-woody', subcategory: 'Terreux' },
    { id: 'earthy-moss', label: 'Mousse', emoji: '🍄', category: 'earthy-woody', subcategory: 'Terreux' },
    { id: 'earthy-mushroom', label: 'Champignon', emoji: '🍄', category: 'earthy-woody', subcategory: 'Terreux' },
    { id: 'earthy-peat', label: 'Tourbe', emoji: '🌾', category: 'earthy-woody', subcategory: 'Terreux' },
    { id: 'earthy-clay', label: 'Argile', emoji: '🪨', category: 'earthy-woody', subcategory: 'Terreux' },
    { id: 'earthy-compost', label: 'Compost', emoji: '🍂', category: 'earthy-woody', subcategory: 'Terreux' },

    { id: 'woody-pine', label: 'Pin', emoji: '🌲', category: 'earthy-woody', subcategory: 'Boisé' },
    { id: 'woody-cedar', label: 'Cèdre', emoji: '🌲', category: 'earthy-woody', subcategory: 'Boisé' },
    { id: 'woody-oak', label: 'Chêne', emoji: '🌳', category: 'earthy-woody', subcategory: 'Boisé' },
    { id: 'woody-sandalwood', label: 'Bois de santal', emoji: '🪵', category: 'earthy-woody', subcategory: 'Boisé' },
    { id: 'woody-cypress', label: 'Cyprès', emoji: '🌲', category: 'earthy-woody', subcategory: 'Boisé' },
    { id: 'woody-birch', label: 'Bouleau', emoji: '🌳', category: 'earthy-woody', subcategory: 'Boisé' },
    { id: 'woody-resin', label: 'Résine', emoji: '💧', category: 'earthy-woody', subcategory: 'Boisé' },
    { id: 'woody-incense', label: 'Encens', emoji: '🕯️', category: 'earthy-woody', subcategory: 'Boisé' },

    // ============================================================================
    // PIQUANT / ÉPICÉ
    // ============================================================================
    { id: 'spicy-pepper', label: 'Poivre noir', emoji: '🫑', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-clove', label: 'Clou de girofle', emoji: '🌰', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-cinnamon', label: 'Cannelle', emoji: '🥨', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-nutmeg', label: 'Noix de muscade', emoji: '🌰', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-cardamom', label: 'Cardamome', emoji: '🌰', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-anise', label: 'Anis', emoji: '⭐', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-ginger', label: 'Gingembre', emoji: '🫚', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-curry', label: 'Curry', emoji: '🍛', category: 'spicy', subcategory: 'Épices' },
    { id: 'spicy-allspice', label: 'Quatre-épices', emoji: '🌰', category: 'spicy', subcategory: 'Épices' },

    { id: 'herb-basil', label: 'Basilic', emoji: '🌿', category: 'spicy', subcategory: 'Herbes sèches' },
    { id: 'herb-thyme', label: 'Thym', emoji: '🌿', category: 'spicy', subcategory: 'Herbes sèches' },
    { id: 'herb-oregano', label: 'Origan', emoji: '🌿', category: 'spicy', subcategory: 'Herbes sèches' },
    { id: 'herb-sage', label: 'Sauge', emoji: '🌿', category: 'spicy', subcategory: 'Herbes sèches' },
    { id: 'herb-rosemary', label: 'Romarin', emoji: '🌿', category: 'spicy', subcategory: 'Herbes sèches' },
    { id: 'herb-mint', label: 'Menthe', emoji: '🌿', category: 'spicy', subcategory: 'Herbes sèches' },

    // ============================================================================
    // SKUNKY / ANIMALIC
    // ============================================================================
    { id: 'skunky-skunk', label: 'Mouffette', emoji: '🦨', category: 'skunky', subcategory: 'Skunky' },
    { id: 'skunky-musk', label: 'Musc', emoji: '🐾', category: 'skunky', subcategory: 'Skunky' },
    { id: 'skunky-barn', label: 'Ferme/Étable', emoji: '🐄', category: 'skunky', subcategory: 'Skunky' },
    { id: 'skunky-cheese', label: 'Fromage', emoji: '🧀', category: 'skunky', subcategory: 'Skunky' },
    { id: 'skunky-ammonia', label: 'Ammoniac/Urine', emoji: '💧', category: 'skunky', subcategory: 'Skunky' },
    { id: 'skunky-sulfur', label: 'Soufre', emoji: '💨', category: 'skunky', subcategory: 'Skunky' },
    { id: 'skunky-rotten', label: 'Pourri/Fermenté', emoji: '🦠', category: 'skunky', subcategory: 'Skunky' },

    // ============================================================================
    // CHIMIQUE / GAZ
    // ============================================================================
    { id: 'chemical-diesel', label: 'Diesel', emoji: '⛽', category: 'chemical', subcategory: 'Carburant' },
    { id: 'chemical-gasoline', label: 'Essence', emoji: '⛽', category: 'chemical', subcategory: 'Carburant' },
    { id: 'chemical-kerosene', label: 'Kérosène', emoji: '🛢️', category: 'chemical', subcategory: 'Carburant' },
    { id: 'chemical-turpentine', label: 'Térébenthine', emoji: '🛢️', category: 'chemical', subcategory: 'Carburant' },

    { id: 'chemical-solvent', label: 'Solvant', emoji: '🧪', category: 'chemical', subcategory: 'Chimique' },
    { id: 'chemical-acetone', label: 'Acétone', emoji: '🧪', category: 'chemical', subcategory: 'Chimique' },
    { id: 'chemical-alcohol', label: 'Alcool', emoji: '🧪', category: 'chemical', subcategory: 'Chimique' },
    { id: 'chemical-plastic', label: 'Plastique', emoji: '♻️', category: 'chemical', subcategory: 'Chimique' },
    { id: 'chemical-rubber', label: 'Caoutchouc', emoji: '🏀', category: 'chemical', subcategory: 'Chimique' },
    { id: 'chemical-paint', label: 'Peinture', emoji: '🎨', category: 'chemical', subcategory: 'Chimique' },
    { id: 'chemical-industrial', label: 'Industriel', emoji: '🏭', category: 'chemical', subcategory: 'Chimique' },

    // ============================================================================
    // SUCRÉ / GOURMAND
    // ============================================================================
    { id: 'sweet-candy', label: 'Bonbon', emoji: '🍬', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-caramel', label: 'Caramel', emoji: '🍮', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-honey', label: 'Miel', emoji: '🍯', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-vanilla', label: 'Vanille', emoji: '🍦', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-chocolate', label: 'Chocolat', emoji: '🍫', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-maple', label: 'Sirop d\'érable', emoji: '🍁', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-cotton-candy', label: 'Barbe à papa', emoji: '🍭', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-marshmallow', label: 'Guimauve', emoji: '☁️', category: 'sweet', subcategory: 'Sucré' },
    { id: 'sweet-butterscotch', label: 'Caramel au beurre', emoji: '🧈', category: 'sweet', subcategory: 'Sucré' },

    { id: 'bakery-bread', label: 'Pain', emoji: '🍞', category: 'sweet', subcategory: 'Boulangerie' },
    { id: 'bakery-cookie', label: 'Biscuit', emoji: '🍪', category: 'sweet', subcategory: 'Boulangerie' },
    { id: 'bakery-cake', label: 'Gâteau', emoji: '🎂', category: 'sweet', subcategory: 'Boulangerie' },
    { id: 'bakery-pastry', label: 'Pâtisserie', emoji: '🥐', category: 'sweet', subcategory: 'Boulangerie' },
    { id: 'bakery-dough', label: 'Pâte', emoji: '🥖', category: 'sweet', subcategory: 'Boulangerie' },

    // ============================================================================
    // VÉGÉTAL / HERBACÉ
    // ============================================================================
    { id: 'herbal-grass', label: 'Herbe coupée', emoji: '🌱', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-hay', label: 'Foin', emoji: '🌾', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-tea', label: 'Thé vert', emoji: '🍵', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-mate', label: 'Maté', emoji: '🧉', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-leaf', label: 'Feuille verte', emoji: '🍃', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-vegetal', label: 'Végétal vert', emoji: '🥬', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-cucumber', label: 'Concombre', emoji: '🥒', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-celery', label: 'Céleri', emoji: '🥬', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-asparagus', label: 'Asperge', emoji: '🌱', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-chlorophyll', label: 'Chlorophylle', emoji: '🌿', category: 'herbal', subcategory: 'Végétal frais' },
    { id: 'herbal-algae', label: 'Algue', emoji: '🌊', category: 'herbal', subcategory: 'Végétal frais' },
]

/**
 * Obtenir les arômes d'une catégorie
 */
export function getAromasByCategory(categoryId) {
    return AROMAS.filter(aroma => aroma.category === categoryId)
}

/**
 * Obtenir les sous-catégories d'une catégorie
 */
export function getSubcategories(categoryId) {
    const aromas = getAromasByCategory(categoryId)
    const subcategories = [...new Set(aromas.map(a => a.subcategory))]
    return subcategories
}

/**
 * Obtenir la catégorie principale d'un arôme
 */
export function getCategoryForAroma(aromaId) {
    const aroma = AROMAS.find(a => a.id === aromaId)
    return aroma ? AROMA_CATEGORIES.find(c => c.id === aroma.category) : null
}
