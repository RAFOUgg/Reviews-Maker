/**
 * EFFETS RESSENTIS - Liste exhaustive
 * Basé sur Dev_cultures.md section 11.1
 * 
 * Catégorisation : Mental | Physique | Thérapeutique | Autres
 * Tags : positif | neutre | négatif
 * 
 * Format : { id, label, emoji, category, tag, description }
 */

export const EFFECTS = [
    // === EFFETS MENTAUX ===
    {
        id: 'euphorique',
        label: 'Euphorique',
        emoji: '😊',
        category: 'mental',
        tag: 'positif',
        description: 'Sensation de bonheur intense et d\'euphorie'
    },
    {
        id: 'creatif',
        label: 'Créatif',
        emoji: '🎨',
        category: 'mental',
        tag: 'positif',
        description: 'Stimulation de la créativité et de l\'imagination'
    },
    {
        id: 'focus',
        label: 'Focalisé / Concentré',
        emoji: '🎯',
        category: 'mental',
        tag: 'positif',
        description: 'Amélioration de la concentration et de l\'attention'
    },
    {
        id: 'sociable',
        label: 'Sociable / Loquace',
        emoji: '💬',
        category: 'mental',
        tag: 'positif',
        description: 'Augmentation de la sociabilité et de la communication'
    },
    {
        id: 'motivant',
        label: 'Motivant',
        emoji: '💪',
        category: 'mental',
        tag: 'positif',
        description: 'Augmentation de la motivation et de l\'énergie mentale'
    },
    {
        id: 'introspectif',
        label: 'Introspectif',
        emoji: '🧘',
        category: 'mental',
        tag: 'neutre',
        description: 'Facilite la réflexion intérieure et l\'introspection'
    },
    {
        id: 'psychedelique',
        label: 'Psychédélique',
        emoji: '🌀',
        category: 'mental',
        tag: 'neutre',
        description: 'Altération de la perception sensorielle et cognitive'
    },
    {
        id: 'dissociatif',
        label: 'Dissociatif',
        emoji: '🌫️',
        category: 'mental',
        tag: 'neutre',
        description: 'Sensation de détachement de soi ou de la réalité'
    },
    {
        id: 'confusant',
        label: 'Confusant / Brouillard mental',
        emoji: '😵',
        category: 'mental',
        tag: 'négatif',
        description: 'Difficulté de concentration, pensées confuses'
    },
    {
        id: 'anxiogene',
        label: 'Anxiogène',
        emoji: '😰',
        category: 'mental',
        tag: 'négatif',
        description: 'Augmentation de l\'anxiété ou du stress'
    },
    {
        id: 'paranoiaque',
        label: 'Paranoïaque',
        emoji: '😨',
        category: 'mental',
        tag: 'négatif',
        description: 'Sentiment de paranoïa ou de méfiance excessive'
    },

    // === EFFETS PHYSIQUES ===
    {
        id: 'relaxant',
        label: 'Relaxant',
        emoji: '😌',
        category: 'physique',
        tag: 'positif',
        description: 'Détente musculaire et corporelle'
    },
    {
        id: 'energisant',
        label: 'Énergisant',
        emoji: '⚡',
        category: 'physique',
        tag: 'positif',
        description: 'Augmentation de l\'énergie physique'
    },
    {
        id: 'stimulant',
        label: 'Stimulant',
        emoji: '🔥',
        category: 'physique',
        tag: 'positif',
        description: 'Stimulation générale du corps'
    },
    {
        id: 'sedatif',
        label: 'Sédatif / Somnolent',
        emoji: '😴',
        category: 'physique',
        tag: 'neutre',
        description: 'Envie de dormir, effet sédatif prononcé'
    },
    {
        id: 'lourdeur',
        label: 'Lourdeur corporelle (Body high)',
        emoji: '🪨',
        category: 'physique',
        tag: 'neutre',
        description: 'Sensation de poids ou de lourdeur dans le corps'
    },
    {
        id: 'picotements',
        label: 'Picotements / Fourmillements',
        emoji: '✨',
        category: 'physique',
        tag: 'neutre',
        description: 'Sensations de picotements ou fourmillements corporels'
    },
    {
        id: 'spasmes',
        label: 'Spasmes / Tremblements',
        emoji: '🌊',
        category: 'physique',
        tag: 'négatif',
        description: 'Tremblements ou spasmes musculaires involontaires'
    },
    {
        id: 'tachycardie',
        label: 'Tachycardie / Palpitations',
        emoji: '💓',
        category: 'physique',
        tag: 'négatif',
        description: 'Accélération du rythme cardiaque'
    },
    {
        id: 'vertiges',
        label: 'Vertiges / Étourdissements',
        emoji: '🌀',
        category: 'physique',
        tag: 'négatif',
        description: 'Sensation de vertige ou perte d\'équilibre'
    },

    // === EFFETS THÉRAPEUTIQUES ===
    {
        id: 'analgesique',
        label: 'Analgésique / Soulage la douleur',
        emoji: '💊',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Réduction de la douleur'
    },
    {
        id: 'anti-inflammatoire',
        label: 'Anti-inflammatoire',
        emoji: '🩹',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Réduction de l\'inflammation'
    },
    {
        id: 'anxiolytique',
        label: 'Anxiolytique / Anti-stress',
        emoji: '🧘‍♀️',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Réduction de l\'anxiété et du stress'
    },
    {
        id: 'antidepresseur',
        label: 'Antidépresseur',
        emoji: '☀️',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Amélioration de l\'humeur, lutte contre la dépression'
    },
    {
        id: 'sommeil',
        label: 'Aide au sommeil',
        emoji: '😴',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Facilite l\'endormissement et améliore le sommeil'
    },
    {
        id: 'anti-nausee',
        label: 'Anti-nausée / Antiémétique',
        emoji: '🤢',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Réduit les nausées et vomissements'
    },
    {
        id: 'appetit',
        label: 'Stimulant d\'appétit',
        emoji: '🍽️',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Augmentation de l\'appétit (munchies thérapeutique)'
    },
    {
        id: 'neuroprotecteur',
        label: 'Neuroprotecteur',
        emoji: '🧠',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Protection du système nerveux'
    },
    {
        id: 'anticonvulsivant',
        label: 'Anticonvulsivant',
        emoji: '🛡️',
        category: 'therapeutique',
        tag: 'positif',
        description: 'Prévention ou réduction des convulsions'
    },

    // === AUTRES EFFETS ===
    {
        id: 'fou-rire',
        label: 'Fou rire / Hilarant',
        emoji: '😂',
        category: 'autres',
        tag: 'positif',
        description: 'Provoque le rire et l\'hilarité'
    },
    {
        id: 'munchies',
        label: 'Munchies / Fringale',
        emoji: '🍕',
        category: 'autres',
        tag: 'neutre',
        description: 'Forte envie de manger, fringales'
    },
    {
        id: 'yeux-rouges',
        label: 'Yeux rouges',
        emoji: '👁️',
        category: 'autres',
        tag: 'neutre',
        description: 'Rougeur des yeux'
    },
    {
        id: 'bouche-seche',
        label: 'Bouche sèche / Pâteuse',
        emoji: '💧',
        category: 'autres',
        tag: 'neutre',
        description: 'Sensation de sécheresse buccale (cottonmouth)'
    },
    {
        id: 'alteration-temps',
        label: 'Altération du temps',
        emoji: '⏱️',
        category: 'autres',
        tag: 'neutre',
        description: 'Perception modifiée du temps qui passe'
    },
    {
        id: 'sensibilite-sensorielle',
        label: 'Sensibilité sensorielle accrue',
        emoji: '🎧',
        category: 'autres',
        tag: 'neutre',
        description: 'Amplification des sens (musique, toucher, goût)'
    },
    {
        id: 'couch-lock',
        label: 'Couch-lock / Paralysie canapé',
        emoji: '🛋️',
        category: 'autres',
        tag: 'neutre',
        description: 'Impossibilité de bouger, cloué au canapé'
    }
]

// === CATÉGORIES D'EFFETS ===
export const EFFECT_CATEGORIES = [
    {
        id: 'mental',
        label: 'Effets Mentaux',
        emoji: '🧠',
        color: '#9B59B6',
        description: 'Effets sur l\'esprit, la cognition et l\'humeur'
    },
    {
        id: 'physique',
        label: 'Effets Physiques',
        emoji: '💪',
        color: '#3498DB',
        description: 'Effets sur le corps et les sensations physiques'
    },
    {
        id: 'therapeutique',
        label: 'Effets Thérapeutiques',
        emoji: '🏥',
        color: '#2ECC71',
        description: 'Effets médicaux et bénéfices thérapeutiques'
    },
    {
        id: 'autres',
        label: 'Autres Effets',
        emoji: '✨',
        color: '#F39C12',
        description: 'Effets divers et secondaires courants'
    }
]

// === TAGS D'EFFETS ===
export const EFFECT_TAGS = [
    {
        id: 'positif',
        label: 'Positif',
        color: '#2ECC71',
        emoji: '✅'
    },
    {
        id: 'neutre',
        label: 'Neutre',
        color: '#95A5A6',
        emoji: '⚪'
    },
    {
        id: 'négatif',
        label: 'Négatif',
        color: '#E74C3C',
        emoji: '⚠️'
    }
]

// === FONCTIONS UTILITAIRES ===

/**
 * Récupère les effets par catégorie
 */
export function getEffectsByCategory(categoryId) {
    return EFFECTS.filter(effect => effect.category === categoryId)
}

/**
 * Récupère les effets par tag
 */
export function getEffectsByTag(tagId) {
    return EFFECTS.filter(effect => effect.tag === tagId)
}

/**
 * Récupère les effets par catégorie ET tag
 */
export function getEffectsByCategoryAndTag(categoryId, tagId) {
    return EFFECTS.filter(effect =>
        effect.category === categoryId && effect.tag === tagId
    )
}

/**
 * Récupère un effet par ID
 */
export function getEffectById(effectId) {
    return EFFECTS.find(effect => effect.id === effectId)
}

/**
 * Récupère la catégorie d'un effet
 */
export function getCategoryForEffect(effectId) {
    const effect = getEffectById(effectId)
    if (!effect) return null
    return EFFECT_CATEGORIES.find(cat => cat.id === effect.category)
}

/**
 * Récupère le tag d'un effet
 */
export function getTagForEffect(effectId) {
    const effect = getEffectById(effectId)
    if (!effect) return null
    return EFFECT_TAGS.find(tag => tag.id === effect.tag)
}

/**
 * Compte les effets par catégorie pour une sélection donnée
 */
export function countEffectsByCategory(selectedEffectIds) {
    const counts = {
        mental: 0,
        physique: 0,
        therapeutique: 0,
        autres: 0
    }

    selectedEffectIds.forEach(effectId => {
        const effect = getEffectById(effectId)
        if (effect && counts.hasOwnProperty(effect.category)) {
            counts[effect.category]++
        }
    })

    return counts
}

/**
 * Compte les effets par tag pour une sélection donnée
 */
export function countEffectsByTag(selectedEffectIds) {
    const counts = {
        positif: 0,
        neutre: 0,
        négatif: 0
    }

    selectedEffectIds.forEach(effectId => {
        const effect = getEffectById(effectId)
        if (effect && counts.hasOwnProperty(effect.tag)) {
            counts[effect.tag]++
        }
    })

    return counts
}

/**
 * Validation de la sélection (max 8 effets)
 */
export function validateEffectsSelection(selectedEffectIds, maxEffects = 8) {
    if (!Array.isArray(selectedEffectIds)) {
        return {
            valid: false,
            message: 'La sélection doit être un tableau'
        }
    }

    if (selectedEffectIds.length > maxEffects) {
        return {
            valid: false,
            message: `Maximum ${maxEffects} effets autorisés (${selectedEffectIds.length} sélectionnés)`
        }
    }

    return {
        valid: true,
        count: selectedEffectIds.length,
        remaining: maxEffects - selectedEffectIds.length
    }
}

export default EFFECTS
