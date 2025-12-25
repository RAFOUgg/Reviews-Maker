/**
 * Configuration centralisée des mappings de champs pour le calcul des notes par catégorie
 * 
 * Structure: Pour chaque type de produit, on définit les catégories de notation
 * et les champs (sliders numériques) qui contribuent à chaque catégorie.
 * 
 * Note: Les noms de champs doivent correspondre EXACTEMENT aux clés définies
 * dans productStructures.js
 */

export const CATEGORY_FIELD_MAPPINGS = {
    /**
     * FLEUR
     * Catégories: visual, smell, texture, taste, effects
     */
    Fleur: {
        visual: {
            label: '👁️ Visuel',
            icon: '👁️',
            fields: ['densite', 'trichome', 'pistil', 'manucure', 'moisissure', 'graines']
        },
        smell: {
            label: '👃 Odeur',
            icon: '👃',
            fields: ['aromasIntensity']
        },
        texture: {
            label: '🤚 Touché',
            icon: '🤚',
            fields: ['durete', 'densiteTexture', 'elasticite', 'collant']
        },
        taste: {
            label: '👅 Goût',
            icon: '👅',
            fields: ['intensiteFumee', 'agressivite', 'cendre']
        },
        effects: {
            label: '⚡ Effets',
            icon: '⚡',
            fields: ['montee', 'intensiteEffet']
        }
    },

    /**
     * HASH
     * Catégories: visual, smell, texture, taste, effects
     * Note: La texture ne doit PAS impacter le visuel
     */
    Hash: {
        visual: {
            label: '👁️ Visuel',
            icon: '👁️',
            fields: ['couleurTransparence', 'pureteVisuelle', 'densite', 'pistils', 'moisissure', 'graines']
        },
        smell: {
            label: '👃 Odeur',
            icon: '👃',
            fields: ['fideliteCultivars', 'intensiteAromatique']
        },
        texture: {
            label: '🤚 Touché',
            icon: '🤚',
            fields: ['durete', 'friabiliteViscosite', 'meltingResidus', 'aspectCollantGras']
            // Note: 'densite' est déjà dans visual, ne pas dupliquer
        },
        taste: {
            label: '👅 Goût',
            icon: '👅',
            fields: ['intensiteFumee', 'agressivite', 'cendre']
        },
        effects: {
            label: '⚡ Effets',
            icon: '⚡',
            fields: ['montee', 'intensiteEffet']
        }
    },

    /**
     * CONCENTRÉ
     * Catégories: visual, smell, texture, taste, effects
     * Note: TOUS les champs de goûts doivent être mappés
     */
    Concentré: {
        visual: {
            label: '👁️ Visuel',
            icon: '👁️',
            fields: ['couleur', 'viscosite', 'pureteVisuelle', 'melting', 'residus', 'pistils', 'moisissure']
        },
        smell: {
            label: '👃 Odeur',
            icon: '👃',
            fields: ['intensiteAromatique']
        },
        texture: {
            label: '🤚 Touché',
            icon: '🤚',
            fields: ['durete', 'friabiliteViscosite', 'densiteTexture', 'viscositeTexture', 'collant']
        },
        taste: {
            label: '👅 Goût',
            icon: '👅',
            // Tous les champs numériques de la section Goûts
            fields: [
                'intensiteAromatique', // Intensité aromatique
                'cendre',              // Cendre
                'textureBouche',       // Texture en bouche
                'douceur',             // Douceur / Agressivité
                'intensite',           // Intensité
                'intensiteFumee',      // Intensité fumée
                'agressivite'          // Agressivité/piquant
            ]
        },
        effects: {
            label: '⚡ Effets',
            icon: '⚡',
            fields: ['montee', 'intensiteEffets'] // Note: avec 's' pour Concentré
        }
    },

    /**
     * COMESTIBLE
     * Catégories: taste, effects
     * Note: PAS de catégorie visual, smell, ni texture (pas de sliders physiques)
     */
    Comestible: {
        taste: {
            label: '👅 Goût',
            icon: '👅',
            fields: ['goutIntensity']
        },
        effects: {
            label: '⚡ Effets',
            icon: '⚡',
            fields: ['effectsIntensity']
        }
    }
};

/**
 * Ordre d'affichage des catégories dans l'interface
 * Les comestibles n'ont que taste et effects
 */
export const CATEGORY_DISPLAY_ORDER = {
    Fleur: ['visual', 'smell', 'texture', 'taste', 'effects'],
    Hash: ['visual', 'smell', 'texture', 'taste', 'effects'],
    Concentré: ['visual', 'smell', 'texture', 'taste', 'effects'],
    Comestible: ['taste', 'effects'] // PAS de visual, smell, texture
};

/**
 * Fonction utilitaire pour calculer les notes par catégorie
 * @param {Object} formData - Les données du formulaire
 * @param {String} productType - Le type de produit (Fleur, Hash, Concentré, Comestible)
 * @returns {Object} - Notes par catégorie + note globale
 */
export function calculateCategoryRatings(formData, productType) {
    const mapping = CATEGORY_FIELD_MAPPINGS[productType] || CATEGORY_FIELD_MAPPINGS.Fleur;
    const ratings = {};

    // Helper to lookup a field value in multiple possible locations and key variants
    const lookupField = (fd, key) => {
        if (!fd) return undefined;

        const tryGet = (obj, k) => (obj && Object.prototype.hasOwnProperty.call(obj, k) ? obj[k] : undefined);

        // direct top-level or nested path (dot notation)
        const getByPath = (obj, path) => {
            if (!obj) return undefined;
            if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path];
            const parts = path.split('.');
            return parts.reduce((acc, p) => (acc && Object.prototype.hasOwnProperty.call(acc, p) ? acc[p] : undefined), obj);
        };

        let v = getByPath(fd, key);
        if (v !== undefined) return v;

        // search common containers explicitly
        v = getByPath(fd.extraData, key);
        if (v !== undefined) return v;
        v = getByPath(fd.categoryRatings, key);
        if (v !== undefined) return v;
        v = getByPath(fd.ratings, key);
        if (v !== undefined) return v;

        // Build a normalized key index to support underscore/dot/case/accents variants
        const normalize = s => String(s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/[^a-z0-9]/g, '');

        const sources = [fd, fd.extraData, fd.categoryRatings, fd.ratings].filter(Boolean);
        const normIndex = new Map();
        sources.forEach(src => {
            if (typeof src !== 'object') return;
            Object.keys(src).forEach(k => {
                const nk = normalize(k);
                if (!normIndex.has(nk)) normIndex.set(nk, src[k]);
            });
        });

        const targetNorm = normalize(key);
        if (normIndex.has(targetNorm)) {
            // Found exact normalized match
            // console.debug to keep logs readable during development
            console.debug(`lookupField: normalized exact match for "${key}" -> ${targetNorm}`);
            return normIndex.get(targetNorm);
        }

        // try plural/singular normalized forms
        const plural = key.endsWith('s') ? key : `${key}s`;
        const singular = key.endsWith('s') ? key.replace(/s$/, '') : key;
        if (normalize(plural) !== targetNorm && normIndex.has(normalize(plural))) {
            console.debug(`lookupField: normalized plural match for "${key}" -> ${normalize(plural)}`);
            return normIndex.get(normalize(plural));
        }
        if (normalize(singular) !== targetNorm && normIndex.has(normalize(singular))) {
            console.debug(`lookupField: normalized singular match for "${key}" -> ${normalize(singular)}`);
            return normIndex.get(normalize(singular));
        }

        // last resort: fuzzy-ish search over normalized keys (includes/startsWith)
        const allNormKeys = Array.from(normIndex.keys());
        const fuzzy = allNormKeys.find(nk => nk === targetNorm || nk.includes(targetNorm) || targetNorm.includes(nk));
        if (fuzzy) {
            console.debug(`lookupField: fuzzy normalized match for "${key}" -> ${fuzzy}`);
            return normIndex.get(fuzzy);
        }

        return undefined;
    };

    console.log('🔍 calculateCategoryRatings:', { productType /* formData omitted for brevity */ });

    // Calculer la note pour chaque catégorie
    Object.keys(mapping).forEach(category => {
        const categoryConfig = mapping[category];
        const fields = categoryConfig.fields;

        const validValues = fields
            .map(fieldKey => {
                const value = lookupField(formData, fieldKey);
                console.log(`  📊 ${category}.${fieldKey} = ${value}`);
                return value;
            })
            .filter(v => v !== undefined && v !== null && v !== '' && !isNaN(v))
            .map(v => parseFloat(v));

        if (validValues.length > 0) {
            const average = validValues.reduce((sum, v) => sum + v, 0) / validValues.length;
            ratings[category] = Math.round(average * 2) / 2; // Arrondi à 0.5 près
            console.log(`  ✅ ${category} = ${ratings[category]} (${validValues.length} champs)`);
        } else {
            ratings[category] = 0;
            console.log(`  ⚠️ ${category} = 0 (aucune valeur valide)`);
        }
    });

    // Calculer la note globale (moyenne des catégories non-nulles)
    const categoryValues = Object.values(ratings).filter(v => v > 0);
    const overallRating = categoryValues.length > 0
        ? Math.round((categoryValues.reduce((sum, v) => sum + v, 0) / categoryValues.length) * 2) / 2
        : 0;

    console.log('🎯 Résultat final:', { ...ratings, overall: overallRating });

    return { ...ratings, overall: overallRating };
}

/**
 * Obtenir le libellé d'une catégorie
 */
export function getCategoryLabel(productType, category) {
    const mapping = CATEGORY_FIELD_MAPPINGS[productType];
    return mapping?.[category]?.label || category;
}

/**
 * Obtenir l'icône d'une catégorie
 */
export function getCategoryIcon(productType, category) {
    const mapping = CATEGORY_FIELD_MAPPINGS[productType];
    return mapping?.[category]?.icon || '📊';
}
