/**
 * CONFIGURATION FORMULAIRE FLEURS
 * Basé sur Dev_cultures.md - Conformité 100% CDC
 * 
 * Principe : AUCUNE SAISIE TEXTUELLE LIBRE (sauf nom commercial et commentaires techniques)
 * Tout en boutons, sliders, selects, multi-selects, segmented controls, roues, steppers
 */

import { AROMAS, AROMA_CATEGORIES, getAromasByCategory } from '../data/aromasWheel'
import { CANNABINOIDS, CANNABINOID_CATEGORIES } from '../data/cannabinoids'
import { TERPENES } from '../data/terpenes'
import { EFFECTS, EFFECT_CATEGORIES, EFFECT_TAGS, getEffectsByCategory } from '../data/effects'

// ============================================================================
// 1. INFORMATIONS GÉNÉRALES
// ============================================================================
export const INFOS_GENERALES_CONFIG = {
    id: 'infos-generales',
    title: '📋 Informations générales',
    description: 'Identité du produit et informations de base',
    required: true,
    icon: '📋',

    fields: [
        {
            id: 'nomCommercial',
            label: 'Nom commercial',
            icon: '🏷️',
            type: 'text',
            required: true,
            autocomplete: true,
            placeholder: 'Ex: Marque – Cultivar – Batch #',
            helper: 'SEUL CHAMP TEXTE OBLIGATOIRE du formulaire',
            maxLength: 100
        },
        {
            id: 'cultivars',
            label: 'Cultivar(s)',
            icon: '🌿',
            type: 'multiselect-pills',
            source: 'user-library', // Bibliothèque personnelle utilisateur
            placeholder: 'Sélectionner ou créer des cultivars',
            helper: 'Multi-sélection depuis bibliothèque + bouton "nouveau cultivar"',
            draggable: true, // Réorganiser ordre par drag & drop
            addNewButton: true,
            addNewLabel: '+ Nouveau cultivar'
        },
        {
            id: 'farm',
            label: 'Farm / Producteur',
            icon: '🏭',
            type: 'select',
            autocomplete: true,
            source: 'farms-database', // Base de données des producteurs enregistrés
            placeholder: 'Sélectionner ou saisir farm',
            helper: 'Auto-complete depuis base de données',
            addNewButton: true
        },
        {
            id: 'typeGenetique',
            label: 'Type génétique',
            icon: '🧬',
            type: 'segmented-control',
            required: true,
            options: [
                { id: 'indica-pure', label: 'Indica pure', emoji: '🌙' },
                { id: 'sativa-pure', label: 'Sativa pure', emoji: '☀️' },
                { id: 'hybride-indica', label: 'Hybride indica-dominant', emoji: '🌓' },
                { id: 'hybride-sativa', label: 'Hybride sativa-dominant', emoji: '🌔' },
                { id: 'hybride-50-50', label: 'Hybride 50/50', emoji: '🌗' },
                { id: 'cbd-dominant', label: 'CBD-dominant', emoji: '💊' },
                { id: 'cbg-dominant', label: 'CBG-dominant', emoji: '🧪' },
                { id: 'non-determine', label: 'Non déterminé', emoji: '❓' }
            ],
            helper: 'Classification génétique du cultivar'
        },
        {
            id: 'photos',
            label: 'Photos du produit',
            icon: '📸',
            type: 'photo-upload',
            required: true,
            min: 1,
            max: 4,
            layout: '2x2-grid',
            draggable: true, // Réorganiser par drag & drop
            tags: ['Macro', 'Full plant', 'Bud sec', 'Trichomes', 'Drying', 'Curing'],
            helper: 'Entre 1 et 4 photos. Drag & drop pour réorganiser.',
            acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
            maxSize: 10, // Mo
            preview: true
        }
    ]
}

// ============================================================================
// 2. GÉNÉTIQUES & PHENOHUNT
// ============================================================================
export const GENETIQUES_CONFIG = {
    id: 'genetiques',
    title: '🧬 Génétiques & PhenoHunt',
    description: 'Informations génétiques détaillées et généalogie',
    icon: '🧬',

    fields: [
        {
            id: 'breeder',
            label: 'Breeder / Sélectionneur',
            icon: '👨‍🌾',
            type: 'select',
            autocomplete: true,
            source: 'breeders-database',
            placeholder: 'Sélectionner breeder',
            helper: 'Sélectionneur de la graine originale',
            addNewButton: true,
            addNewLabel: '+ Nouveau breeder',
            addNewModal: true
        },
        {
            id: 'variete',
            label: 'Variété / Strain',
            icon: '🌱',
            type: 'autocomplete',
            source: 'user-library',
            placeholder: 'Nom de la variété',
            helper: 'Auto-complete depuis bibliothèque cultivars'
        },
        {
            id: 'typeGenetiqueDetail',
            label: 'Type génétique détaillé',
            icon: '🔬',
            type: 'buttons',
            options: [
                { id: 'indica', label: 'Indica', color: '#9B59B6' },
                { id: 'sativa', label: 'Sativa', color: '#F39C12' },
                { id: 'hybride', label: 'Hybride', color: '#3498DB' }
            ]
        },
        {
            id: 'pourcentagesGenetique',
            label: 'Pourcentages génétiques',
            icon: '📊',
            type: 'percentage-wheel', // Ou sliders verrouillés
            max: 3, // Maximum 3 segments (A/B/C)
            lockedTotal: 100, // Total doit faire 100%
            segments: [
                { id: 'segment-a', label: 'Parent A', color: '#E74C3C' },
                { id: 'segment-b', label: 'Parent B', color: '#3498DB' },
                { id: 'segment-c', label: 'Parent C (optionnel)', color: '#2ECC71' }
            ],
            helper: 'Répartition génétique (total = 100%)',
            validation: 'sum-equals-100'
        },
        {
            id: 'genealogie',
            label: 'Généalogie / Arbre génétique',
            icon: '🌳',
            type: 'genetic-canvas',
            canva: true, // Active le mode canva drag & drop
            helper: 'Drag & drop des cultivars de votre bibliothèque pour créer l\'arbre',
            tags: [
                'Clone élite',
                'Seed run',
                'Selfed S1',
                'Backcross BX1',
                'Backcross BX2',
                'Backcross BX3',
                'Polyhybride',
                'F1',
                'F2',
                'F3',
                'IBL'
            ]
        },
        {
            id: 'codePheno',
            label: 'Code phénotype',
            icon: '🔢',
            type: 'pheno-code',
            format: 'auto-increment', // PH-01, PH-02, F1-01, CUT-01
            prefixes: ['PH', 'F', 'CUT', 'CLONE', 'S'],
            autoIncrement: true,
            customAllowed: true,
            helper: 'Format auto-incrémenté (ex: PH-01, F2-03) ou personnalisé'
        }
    ]
}

// ============================================================================
// 3. DONNÉES ANALYTIQUES (Cannabinoïdes & Terpènes)
// ============================================================================
export const ANALYTIQUES_CONFIG = {
    id: 'analytiques',
    title: '🔬 Données analytiques',
    description: 'Cannabinoïdes, terpènes et certificat d\'analyse',
    icon: '🔬',

    fields: [
        {
            id: 'thc',
            label: 'THC %',
            icon: '🔴',
            type: 'slider',
            min: 0,
            max: 40,
            step: 0.1,
            unit: '%',
            color: '#FF6B6B',
            helper: 'Taux de THC (Δ9-tétrahydrocannabinol)',
            showValue: true
        },
        {
            id: 'cbd',
            label: 'CBD %',
            icon: '🔵',
            type: 'slider',
            min: 0,
            max: 25,
            step: 0.1,
            unit: '%',
            color: '#4ECDC4',
            helper: 'Taux de CBD (Cannabidiol)',
            showValue: true
        },
        {
            id: 'cannabinoidesAdditionnels',
            label: 'Autres cannabinoïdes',
            icon: '➕',
            type: 'dynamic-list',
            addButtonLabel: '+ Ajouter un cannabinoïde',
            options: CANNABINOIDS.filter(c => !['thc', 'cbd'].includes(c.id)),
            itemConfig: {
                select: {
                    placeholder: 'Choisir cannabinoïde',
                    source: 'cannabinoids-data'
                },
                slider: {
                    min: 0,
                    max: 'dynamic', // Max dépend du cannabinoïde sélectionné
                    step: 0.1,
                    unitToggle: true, // Bascule % ↔ mg/g
                    units: ['%', 'mg/g']
                }
            },
            helper: 'Ajoutez CBG, CBC, CBN, THCV, THCA, CBDA, etc.'
        },
        {
            id: 'sommeCannabinoides',
            label: 'Total cannabinoïdes',
            icon: '∑',
            type: 'calculated',
            formula: 'sum-all-cannabinoids',
            unit: '%',
            display: 'badge',
            validation: {
                max: 100,
                warning: 'Le total ne devrait pas dépasser 100%',
                warningThreshold: 100
            },
            helper: 'Calculé automatiquement (vérification cohérence ≤100%)'
        },
        {
            id: 'terpenes',
            label: 'Profil terpénique',
            icon: '🌿',
            type: 'terpene-list',
            options: TERPENES,
            addButtonLabel: '+ Ajouter un terpène',
            itemConfig: {
                select: {
                    placeholder: 'Choisir terpène',
                    source: 'terpenes-data',
                    showIcon: true,
                    showBoilingPoint: true
                },
                slider: {
                    min: 0,
                    max: 10, // % ou mg/g
                    step: 0.01,
                    unitToggle: true,
                    units: ['%', 'mg/g']
                }
            },
            helper: 'Myrcène, Limonène, Caryophyllène, Linalol, Pinène, etc.'
        },
        {
            id: 'roueAromatiqueTerpenique',
            label: 'Roue aromatique terpénique',
            icon: '🎨',
            type: 'display-only',
            component: 'TerpeneAromaWheel',
            source: 'calculated-from-terpenes',
            helper: 'Affichage des top 5 arômes calculés depuis le profil terpénique'
        },
        {
            id: 'certificatAnalyse',
            label: 'Certificat d\'analyse (PDF)',
            icon: '📄',
            type: 'file-upload',
            optional: true,
            acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
            maxSize: 5, // Mo
            helper: 'Upload optionnel du certificat officiel (lab test)'
        }
    ]
}

// ============================================================================
// 4. VISUEL & TECHNIQUE
// ============================================================================
export const VISUAL_CONFIG = {
    id: 'visuel-technique',
    title: '👁️ Visuel & Technique',
    description: 'Évaluation visuelle du produit',
    icon: '👁️',

    fields: [
        {
            id: 'couleur',
            label: 'Couleur',
            icon: '🎨',
            type: 'color-wheel-slider',
            slider: {
                min: 0,
                max: 10,
                step: 1,
                helper: 'Intensité/richesse de la couleur'
            },
            colorWheel: {
                colors: [
                    { id: 'vert-clair', label: 'Vert clair', hex: '#90EE90' },
                    { id: 'vert-fonce', label: 'Vert foncé', hex: '#228B22' },
                    { id: 'lime', label: 'Lime', hex: '#32CD32' },
                    { id: 'jaune', label: 'Jaune', hex: '#FFD700' },
                    { id: 'orange', label: 'Orange', hex: '#FF8C00' },
                    { id: 'violet', label: 'Violet', hex: '#9370DB' },
                    { id: 'noir', label: 'Noir', hex: '#2F4F4F' },
                    { id: 'marron', label: 'Marron', hex: '#8B4513' },
                    { id: 'bleute', label: 'Bleuté', hex: '#4682B4' }
                ],
                multiSelect: true,
                helper: 'Sélectionner la(les) couleur(s) dominante(s)'
            }
        },
        {
            id: 'densiteVisuelle',
            label: 'Densité visuelle',
            icon: '🪨',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Fluffy / Aéré',
                5: 'Moyenne',
                10: 'Ultra dense'
            },
            helper: 'Compacité apparente des buds'
        },
        {
            id: 'trichomes',
            label: 'Trichomes',
            icon: '💎',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Peu visibles',
                5: 'Bien présents',
                10: 'Tapis complet'
            },
            helper: 'Couverture de trichomes (cristaux)'
        },
        {
            id: 'pistils',
            label: 'Pistils',
            icon: '🧡',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Absents',
                5: 'Présents',
                10: 'Très nombreux'
            },
            helper: 'Quantité et visibilité des pistils oranges'
        },
        {
            id: 'manucure',
            label: 'Qualité de la manucure',
            icon: '✂️',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Feuilles larges',
                5: 'Trim standard',
                10: 'Full trim parfait'
            },
            helper: 'Qualité du trimming (taille des feuilles)'
        },
        {
            id: 'moisissure',
            label: 'Moisissure',
            icon: '🍄',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            inverted: true, // 0 = très présente, 10 = aucune
            labels: {
                0: 'Très présente',
                5: 'Traces',
                10: 'Aucune'
            },
            warningBelow: 7,
            helper: '10 = aucune moisissure (score inversé)'
        },
        {
            id: 'graines',
            label: 'Graines',
            icon: '🌰',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            inverted: true, // 0 = très grainé, 10 = aucune
            labels: {
                0: 'Très grainé',
                5: 'Quelques graines',
                10: 'Aucune graine'
            },
            warningBelow: 7,
            helper: '10 = aucune graine (score inversé)'
        },
        {
            id: 'corpsEtrangers',
            label: 'Corps étrangers',
            icon: '⚠️',
            type: 'multiselect',
            options: [
                { id: 'cheveux', label: 'Cheveux', emoji: '👨' },
                { id: 'fibre', label: 'Fibre textile', emoji: '🧵' },
                { id: 'poussiere', label: 'Poussière visible', emoji: '💨' },
                { id: 'insectes', label: 'Insectes morts', emoji: '🦟' },
                { id: 'aucun', label: 'Aucun', emoji: '✅', exclusive: true }
            ],
            helper: 'Présence d\'impuretés visibles (multi-sélection)'
        },
        {
            id: 'propreteGlobale',
            label: 'Propreté globale',
            icon: '✨',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Sale',
                5: 'Correcte',
                10: 'Impeccable'
            },
            helper: 'Impression générale de propreté du produit'
        }
    ]
}

// ============================================================================
// 5. ODEURS (Roue Aromatique CATA)
// ============================================================================
export const ODEURS_CONFIG = {
    id: 'odeurs',
    title: '👃 Odeurs',
    description: 'Profil aromatique - Méthode CATA',
    icon: '👃',

    fields: [
        {
            id: 'notesDominantes',
            label: 'Notes dominantes',
            icon: '🎯',
            type: 'aroma-wheel',
            max: 7,
            source: AROMAS,
            categories: AROMA_CATEGORIES,
            helper: 'Sélectionner jusqu\'à 7 arômes dominants depuis la roue CATA',
            required: true
        },
        {
            id: 'notesSecondaires',
            label: 'Notes secondaires',
            icon: '🎨',
            type: 'aroma-wheel',
            max: 7,
            source: AROMAS,
            categories: AROMA_CATEGORIES,
            helper: 'Sélectionner jusqu\'à 7 arômes secondaires',
            optional: true
        },
        {
            id: 'intensiteGlobale',
            label: 'Intensité globale',
            icon: '💪',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très faible',
                5: 'Moyenne',
                10: 'Très intense'
            },
            helper: 'Force générale des arômes'
        },
        {
            id: 'complexiteAromatique',
            label: 'Complexité aromatique',
            icon: '🌈',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très simple',
                5: 'Moyennement complexe',
                10: 'Très complexe'
            },
            helper: 'Richesse et diversité du profil aromatique'
        }
    ]
}

// ============================================================================
// 6. GOÛTS / BOUCHE
// ============================================================================
export const GOUTS_CONFIG = {
    id: 'gouts',
    title: '😋 Goûts / Bouche',
    description: 'Profil gustatif en 3 phases',
    icon: '😋',

    fields: [
        {
            id: 'dryPuff',
            label: 'Dry puff / Tirage à sec',
            icon: '💨',
            type: 'aroma-wheel',
            max: 7,
            source: AROMAS,
            categories: AROMA_CATEGORIES,
            helper: 'Goûts perçus à froid, sans combustion (max 7)'
        },
        {
            id: 'inhalation',
            label: 'Inhalation',
            icon: '🌬️',
            type: 'aroma-wheel',
            max: 7,
            source: AROMAS,
            categories: AROMA_CATEGORIES,
            helper: 'Goûts lors de l\'inhalation de la fumée/vapeur (max 7)'
        },
        {
            id: 'expiration',
            label: 'Expiration / Rétro-olfaction',
            icon: '💨',
            type: 'aroma-wheel',
            max: 7,
            source: AROMAS,
            categories: AROMA_CATEGORIES,
            helper: 'Arrière-goût et saveurs persistantes (max 7)'
        },
        {
            id: 'intensiteGout',
            label: 'Intensité du goût',
            icon: '🔥',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très fade',
                5: 'Moyenne',
                10: 'Très prononcée'
            },
            helper: 'Force générale des saveurs'
        },
        {
            id: 'agressivite',
            label: 'Agressivité / Gratte gorge',
            icon: '🌶️',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très doux',
                5: 'Moyennement âpre',
                10: 'Très agressif'
            },
            helper: 'Effet irritant sur la gorge'
        },
        {
            id: 'douceur',
            label: 'Douceur / Rondeur en bouche',
            icon: '🍯',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très rêche',
                5: 'Équilibrée',
                10: 'Très douce'
            },
            helper: 'Sensation de douceur et rondeur'
        }
    ]
}

// ============================================================================
// 7. TEXTURE & TOUCHER
// ============================================================================
export const TEXTURE_CONFIG = {
    id: 'texture',
    title: '🤚 Texture & Toucher',
    description: 'Évaluation tactile du produit',
    icon: '🤚',

    fields: [
        {
            id: 'dureteDoigt',
            label: 'Dureté au doigt',
            icon: '👆',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très mou',
                5: 'Ferme',
                10: 'Dur comme roche'
            },
            helper: 'Résistance à la pression du doigt'
        },
        {
            id: 'densiteTactile',
            label: 'Densité tactile',
            icon: '🪨',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très léger',
                5: 'Dense',
                10: 'Très lourd'
            },
            helper: 'Poids ressenti pour la taille'
        },
        {
            id: 'elasticite',
            label: 'Élasticité',
            icon: '🪀',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très friable',
                5: 'Spongieux',
                10: 'Très élastique'
            },
            helper: 'Capacité à reprendre sa forme après pression'
        },
        {
            id: 'collant',
            label: 'Collant / Résineux',
            icon: '🍯',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très sec',
                5: 'Légèrement collant',
                10: 'Colle aux doigts'
            },
            helper: 'Résine collante sur les doigts'
        },
        {
            id: 'humidite',
            label: 'Humidité perçue',
            icon: '💧',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Trop sec',
                5: 'Optimal',
                10: 'Trop humide'
            },
            warningBelow: 3,
            warningAbove: 7,
            helper: 'Niveau d\'humidité du produit (5 = idéal)'
        },
        {
            id: 'friabilite',
            label: 'Friabilité',
            icon: '💨',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Poudreux',
                5: 'Se casse bien',
                10: 'Ne se casse pas'
            },
            helper: 'Facilité à égrener/émietter'
        }
    ]
}

// ============================================================================
// 8. EFFETS RESSENTIS
// ============================================================================
export const EFFETS_CONFIG = {
    id: 'effets',
    title: '💥 Effets ressentis',
    description: 'Effets psychoactifs et physiques',
    icon: '💥',

    fields: [
        {
            id: 'montee',
            label: 'Montée / Rapidité d\'action',
            icon: '🚀',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très lent',
                5: 'Moyen',
                10: 'Instantané'
            },
            helper: 'Vitesse d\'apparition des effets'
        },
        {
            id: 'intensiteGlobale',
            label: 'Intensité globale',
            icon: '⚡',
            type: 'slider',
            min: 0,
            max: 10,
            step: 1,
            labels: {
                0: 'Très faible',
                5: 'Moyenne',
                10: 'Très intense'
            },
            helper: 'Force générale des effets'
        },
        {
            id: 'effets',
            label: 'Effets ressentis',
            icon: '✨',
            type: 'effects-selector',
            max: 8,
            source: EFFECTS,
            categories: EFFECT_CATEGORIES,
            tags: EFFECT_TAGS,
            filters: ['tous', 'positif', 'neutre', 'négatif'],
            categoryGroups: {
                mental: getEffectsByCategory('mental'),
                physique: getEffectsByCategory('physique'),
                therapeutique: getEffectsByCategory('therapeutique'),
                autres: getEffectsByCategory('autres')
            },
            helper: 'Sélectionner jusqu\'à 8 effets (catégorisés et taggés)',
            required: true
        }
    ]
}

// ============================================================================
// 9. EXPÉRIENCE D'UTILISATION
// ============================================================================
export const EXPERIENCE_CONFIG = {
    id: 'experience',
    title: '🎯 Expérience d\'utilisation',
    description: 'Contexte et modalités de consommation',
    icon: '🎯',

    fields: [
        {
            id: 'methodeConsommation',
            label: 'Méthode de consommation',
            icon: '💨',
            type: 'buttons',
            options: [
                { id: 'joint', label: 'Joint', emoji: '🚬' },
                { id: 'bang', label: 'Bang', emoji: '🫙' },
                { id: 'pipe', label: 'Pipe', emoji: '🪈' },
                { id: 'vapo-herbe', label: 'Vaporisateur herbe sèche', emoji: '💨' },
                { id: 'vape-cart', label: 'Vape cart / stylo', emoji: '🖊️' },
                { id: 'autre', label: 'Autre', emoji: '❓' }
            ],
            required: true,
            helper: 'Comment le produit a été consommé'
        },
        {
            id: 'dosage',
            label: 'Dosage estimé',
            icon: '⚖️',
            type: 'slider',
            min: 0.05,
            max: 1.0,
            step: 0.05,
            unit: 'g',
            showValue: true,
            helper: 'Quantité approximative consommée'
        },
        {
            id: 'dureeEffets',
            label: 'Durée des effets',
            icon: '⏱️',
            type: 'duration-picker', // Time picker HH:MM ou catégories
            modes: ['time-picker', 'categories'],
            categories: [
                { id: 'moins-1h', label: '< 1h', value: 60 },
                { id: '1-2h', label: '1-2h', value: 90 },
                { id: '2-4h', label: '2-4h', value: 180 },
                { id: 'plus-4h', label: '4h+', value: 240 }
            ],
            helper: 'Durée totale des effets ressentis'
        },
        {
            id: 'momentJournee',
            label: 'Moment de la journée',
            icon: '🌅',
            type: 'segmented-control',
            options: [
                { id: 'matin', label: 'Matin', emoji: '🌄' },
                { id: 'apres-midi', label: 'Après-midi', emoji: '☀️' },
                { id: 'soir', label: 'Soir', emoji: '🌆' },
                { id: 'nuit', label: 'Nuit', emoji: '🌙' }
            ],
            helper: 'Quand le produit a été testé'
        },
        {
            id: 'contexte',
            label: 'Contexte de consommation',
            icon: '🎪',
            type: 'multiselect',
            options: [
                { id: 'seul', label: 'Seul', emoji: '🧘' },
                { id: 'amis', label: 'Entre amis', emoji: '👥' },
                { id: 'social', label: 'Événement social', emoji: '🎉' },
                { id: 'creatif', label: 'Travail créatif', emoji: '🎨' },
                { id: 'medical', label: 'Usage médical', emoji: '🏥' },
                { id: 'autre', label: 'Autre', emoji: '❓' }
            ],
            helper: 'Situation lors de la consommation (multi-sélection)'
        },
        {
            id: 'usagePrefe',
            label: 'Usage préféré recommandé',
            icon: '⭐',
            type: 'multiselect',
            options: [
                { id: 'soir', label: 'Soir', emoji: '🌙' },
                { id: 'journee', label: 'Journée', emoji: '☀️' },
                { id: 'social', label: 'Social', emoji: '🎊' },
                { id: 'solo', label: 'Solo', emoji: '🧘' },
                { id: 'productif', label: 'Productif', emoji: '💼' },
                { id: 'medical', label: 'Médical', emoji: '💊' }
            ],
            helper: 'Moments/contextes recommandés pour ce produit'
        }
    ]
}

// ============================================================================
// 10. EFFETS SECONDAIRES & TOLÉRANCE
// ============================================================================
export const SECONDAIRES_CONFIG = {
    id: 'secondaires',
    title: '⚠️ Effets secondaires & Tolérance',
    description: 'Effets indésirables et niveau de tolérance',
    icon: '⚠️',

    fields: [
        {
            id: 'effetsSecondaires',
            label: 'Effets secondaires ressentis',
            icon: '🚨',
            type: 'multiselect',
            options: [
                { id: 'yeux-secs', label: 'Yeux secs', emoji: '👁️' },
                { id: 'bouche-seche', label: 'Bouche sèche', emoji: '💧' },
                { id: 'faim', label: 'Faim intense (munchies)', emoji: '🍔' },
                { id: 'anxiete', label: 'Anxiété', emoji: '😰' },
                { id: 'paranoïa', label: 'Paranoïa', emoji: '😨' },
                { id: 'tachycardie', label: 'Tachycardie', emoji: '💓' },
                { id: 'somnolence', label: 'Somnolence excessive', emoji: '😴' },
                { id: 'confusion', label: 'Confusion', emoji: '😵' },
                { id: 'aucun', label: 'Aucun effet secondaire', emoji: '✅', exclusive: true }
            ],
            helper: 'Effets indésirables ou désagréables constatés'
        },
        {
            id: 'tolerance',
            label: 'Tolérance du testeur',
            icon: '🎚️',
            type: 'segmented-control',
            options: [
                { id: 'faible', label: 'Faible', emoji: '🔰' },
                { id: 'moyenne', label: 'Moyenne', emoji: '⚖️' },
                { id: 'elevee', label: 'Élevée', emoji: '💪' },
                { id: 'tres-elevee', label: 'Très élevée', emoji: '🏆' }
            ],
            helper: 'Niveau de tolérance habituel au cannabis'
        }
    ]
}

// ============================================================================
// EXPORT CONFIGURATION COMPLÈTE
// ============================================================================
export const FLOWER_REVIEW_SECTIONS = [
    INFOS_GENERALES_CONFIG,
    GENETIQUES_CONFIG,
    ANALYTIQUES_CONFIG,
    VISUAL_CONFIG,
    ODEURS_CONFIG,
    GOUTS_CONFIG,
    TEXTURE_CONFIG,
    EFFETS_CONFIG,
    EXPERIENCE_CONFIG,
    SECONDAIRES_CONFIG
]

/**
 * Récupère une section par ID
 */
export function getSectionById(sectionId) {
    return FLOWER_REVIEW_SECTIONS.find(section => section.id === sectionId)
}

/**
 * Récupère toutes les sections requises
 */
export function getRequiredSections() {
    return FLOWER_REVIEW_SECTIONS.filter(section => section.required)
}

/**
 * Compte le nombre total de champs configurés
 */
export function getTotalFieldsCount() {
    return FLOWER_REVIEW_SECTIONS.reduce(
        (total, section) => total + (section.fields?.length || 0),
        0
    )
}

export default {
    sections: FLOWER_REVIEW_SECTIONS,
    INFOS_GENERALES_CONFIG,
    GENETIQUES_CONFIG,
    ANALYTIQUES_CONFIG,
    VISUAL_CONFIG,
    ODEURS_CONFIG,
    GOUTS_CONFIG,
    TEXTURE_CONFIG,
    EFFETS_CONFIG,
    EXPERIENCE_CONFIG,
    SECONDAIRES_CONFIG
}
