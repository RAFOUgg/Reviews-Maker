/**
 * ContentPanel Component
 * Panel gauche affichant TOUS les champs draggables disponibles pour l'aperçu Orchard
 * Version complète avec tous les champs détaillés par catégorie
 */

import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

// Types de champs disponibles pour le drag & drop (utilisé par dnd-kit ou react-dnd)
export const DRAGGABLE_FIELD_TYPES = {
    ORCHARD_FIELD: 'ORCHARD_FIELD'
};

// ============================================================================
// CONFIGURATION EXHAUSTIVE DES CHAMPS DRAGGABLES
// ============================================================================

export const DRAGGABLE_FIELDS = {
    // --- INFORMATIONS DE BASE ---
    basic: [
        { id: 'holderName', label: 'Nom du cultivar/produit', icon: '🏷️', type: 'text' },
        { id: 'title', label: 'Titre', icon: '🔖', type: 'text' },
        { id: 'author', label: 'Auteur', icon: '👤', type: 'text' },
        { id: 'ownerName', label: 'Publié par', icon: '🧾', type: 'text' },
        { id: 'breeder', label: 'Breeder', icon: '🧬', type: 'text' },
        { id: 'farm', label: 'Farm', icon: '🌱', type: 'text' },
        { id: 'hashmaker', label: 'Hash Maker', icon: '👨‍🔬', type: 'text' },
        { id: 'type', label: 'Type de produit', icon: '📦', type: 'text' },
        { id: 'strainType', label: 'Type de strain', icon: '🌿', type: 'text' },
        { id: 'mainImage', label: 'Image principale', icon: '🖼️', type: 'image' },
        { id: 'imageUrl', label: 'URL Image', icon: '🔗', type: 'image' },
        { id: 'images', label: 'Galerie d\'images', icon: '🖼️', type: 'gallery' },
        { id: 'date', label: 'Date', icon: '📅', type: 'date' },
        { id: 'createdAt', label: 'Date création', icon: '📅', type: 'date' }
    ],

    // --- NOTES GLOBALES ---
    ratings: [
        { id: 'rating', label: 'Note globale', icon: '⭐', type: 'rating' },
        { id: 'overallRating', label: 'Note (alt)', icon: '⭐', type: 'rating' },
        { id: 'note', label: 'Note', icon: '⭐', type: 'rating' },
        { id: 'categoryRatings', label: 'Notes par catégorie (bloc)', icon: '📊', type: 'category-block' }
    ],

    // --- NOTES VISUELLES DÉTAILLÉES ---
    visualRatings: [
        { id: 'categoryRatings.visual', label: '👁️ Note Visuelle (moyenne)', icon: '👁️', type: 'rating' },
        { id: 'densite', label: 'Densité des buds', icon: '🧱', type: 'slider' },
        { id: 'trichome', label: 'Trichomes', icon: '💎', type: 'slider' },
        { id: 'pistil', label: 'Pistils', icon: '🔶', type: 'slider' },
        { id: 'manucure', label: 'Manucure', icon: '✂️', type: 'slider' },
        { id: 'moisissure', label: 'Absence moisissure', icon: '🦠', type: 'slider' },
        { id: 'graines', label: 'Absence graines', icon: '🌰', type: 'slider' },
        { id: 'couleur', label: 'Couleur', icon: '🎨', type: 'slider' },
        { id: 'couleurTransparence', label: 'Couleur/Transparence', icon: '🎨', type: 'slider' },
        { id: 'pureteVisuelle', label: 'Pureté visuelle', icon: '✨', type: 'slider' },
        { id: 'viscosite', label: 'Viscosité', icon: '🍯', type: 'slider' },
        { id: 'melting', label: 'Melting', icon: '🔥', type: 'slider' },
        { id: 'residus', label: 'Résidus', icon: '💨', type: 'slider' },
        { id: 'pistils', label: 'Pistils (hash)', icon: '🔶', type: 'slider' }
    ],

    // --- NOTES ODEUR DÉTAILLÉES ---
    smellRatings: [
        { id: 'categoryRatings.smell', label: '👃 Note Odeur (moyenne)', icon: '👃', type: 'rating' },
        { id: 'aromasIntensity', label: 'Intensité aromatique', icon: '🌸', type: 'slider' },
        { id: 'intensiteAromatique', label: 'Intensité aromatique (alt)', icon: '🌸', type: 'slider' },
        { id: 'fideliteCultivars', label: 'Fidélité cultivars', icon: '🎯', type: 'slider' }
    ],

    // --- NOTES TEXTURE DÉTAILLÉES ---
    textureRatings: [
        { id: 'categoryRatings.texture', label: '🤚 Note Texture (moyenne)', icon: '🤚', type: 'rating' },
        { id: 'durete', label: 'Dureté', icon: '💪', type: 'slider' },
        { id: 'densiteTexture', label: 'Densité texture', icon: '🧱', type: 'slider' },
        { id: 'elasticite', label: 'Élasticité', icon: '🧘', type: 'slider' },
        { id: 'collant', label: 'Collant/Sticky', icon: '🍯', type: 'slider' },
        { id: 'friabiliteViscosite', label: 'Friabilité/Viscosité', icon: '🔧', type: 'slider' },
        { id: 'meltingResidus', label: 'Melting/Résidus', icon: '🔥', type: 'slider' },
        { id: 'aspectCollantGras', label: 'Aspect collant/gras', icon: '🍯', type: 'slider' },
        { id: 'viscositeTexture', label: 'Viscosité texture', icon: '🍯', type: 'slider' }
    ],

    // --- NOTES GOÛT DÉTAILLÉES ---
    tasteRatings: [
        { id: 'categoryRatings.taste', label: '👅 Note Goût (moyenne)', icon: '👅', type: 'rating' },
        { id: 'intensiteFumee', label: 'Intensité fumée', icon: '💨', type: 'slider' },
        { id: 'agressivite', label: 'Agressivité/Piquant', icon: '🌶️', type: 'slider' },
        { id: 'cendre', label: 'Qualité cendre', icon: '⚪', type: 'slider' },
        { id: 'intensiteGout', label: 'Intensité goût', icon: '👅', type: 'slider' },
        { id: 'textureBouche', label: 'Texture en bouche', icon: '🫦', type: 'slider' },
        { id: 'douceur', label: 'Douceur', icon: '🍬', type: 'slider' },
        { id: 'intensite', label: 'Intensité', icon: '📈', type: 'slider' },
        { id: 'goutIntensity', label: 'Intensité (comestible)', icon: '🍰', type: 'slider' }
    ],

    // --- NOTES EFFETS DÉTAILLÉES ---
    effectsRatings: [
        { id: 'categoryRatings.effects', label: '⚡ Note Effets (moyenne)', icon: '⚡', type: 'rating' },
        { id: 'montee', label: 'Montée', icon: '🚀', type: 'slider' },
        { id: 'intensiteEffet', label: 'Intensité effet', icon: '💥', type: 'slider' },
        { id: 'intensiteEffets', label: 'Intensité effets (alt)', icon: '💥', type: 'slider' },
        { id: 'effectsIntensity', label: 'Intensité (comestible)', icon: '🌟', type: 'slider' },
        { id: 'dureeEffet', label: 'Durée des effets', icon: '⏱️', type: 'slider' }
    ],

    // --- DONNÉES SENSORIELLES ---
    sensorial: [
        { id: 'aromas', label: 'Arômes', icon: '🌸', type: 'tags' },
        { id: 'tastes', label: 'Goûts', icon: '👅', type: 'tags' },
        { id: 'terpenes', label: 'Terpènes', icon: '🍋', type: 'tags' },
        { id: 'effects', label: 'Effets', icon: '⚡', type: 'tags' }
    ],

    // --- NIVEAUX THC/CBD ---
    levels: [
        { id: 'thcLevel', label: 'Niveau THC', icon: '🔥', type: 'text' },
        { id: 'cbdLevel', label: 'Niveau CBD', icon: '🛡️', type: 'text' },
        { id: 'indicaRatio', label: 'Ratio Indica/Sativa', icon: '⚖️', type: 'text' },
        { id: 'strainRatio', label: 'Ratio strain', icon: '📊', type: 'text' }
    ],

    // --- PIPELINES & CULTURE ---
    pipelines: [
        { id: 'cultivarsList', label: 'Liste des cultivars', icon: '🌱', type: 'cultivar-list' },
        { id: 'pipelineExtraction', label: 'Pipeline Extraction', icon: '⚗️', type: 'pipeline' },
        { id: 'pipelineSeparation', label: 'Pipeline Séparation', icon: '🧪', type: 'pipeline' },
        { id: 'pipelinePurification', label: 'Pipeline Purification', icon: '✨', type: 'pipeline' },
        { id: 'fertilizationPipeline', label: 'Pipeline Fertilisation', icon: '🌾', type: 'pipeline' },
        { id: 'substratMix', label: 'Substrat Mix', icon: '🧩', type: 'substrat-mix' },
        { id: 'purgevide', label: 'Purge à vide', icon: '🫧', type: 'boolean' }
    ],

    // --- CONTENU TEXTE ---
    content: [
        { id: 'description', label: 'Description', icon: '📝', type: 'textarea' },
        { id: 'conclusion', label: 'Conclusion', icon: '✅', type: 'textarea' },
        { id: 'tags', label: 'Tags', icon: '🏷️', type: 'tags' },
        { id: 'extraData', label: 'Données additionnelles', icon: '📋', type: 'json' }
    ],

    // --- STICKERS & DÉCORATIONS ---
    stickers: [
        { id: 'infoBubble', label: 'Bulle info', icon: '💬', type: 'bubble' },
        { id: 'emoji', label: 'Emoji', icon: '😊', type: 'bubble' },
        { id: 'badge', label: 'Badge', icon: '🏅', type: 'badge' },
        { id: 'separator', label: 'Séparateur', icon: '➖', type: 'separator' }
    ]
};

// Labels de section pour l'affichage
export const SECTION_LABELS = {
    basic: '📋 Informations de base',
    ratings: '⭐ Notes globales',
    visualRatings: '👁️ Détails Visuels',
    smellRatings: '👃 Détails Odeur',
    textureRatings: '🤚 Détails Texture',
    tasteRatings: '👅 Détails Goût',
    effectsRatings: '⚡ Détails Effets',
    sensorial: '🌸 Données Sensorielles',
    levels: '📊 Niveaux THC/CBD',
    pipelines: '⚗️ Pipelines & Culture',
    content: '📝 Contenu Texte',
    stickers: '🎨 Stickers & Déco'
};

// Helper pour extraire la valeur d'un champ (gère les chemins comme "categoryRatings.visual")
const getFieldValue = (id, data) => {
    if (!data) return undefined;
    if (id.includes('.')) {
        const parts = id.split('.');
        let val = data;
        for (const p of parts) {
            if (val === undefined || val === null) return undefined;
            val = val[p];
        }
        // Si c'est un objet avec des sous-valeurs (ex: {densite: 6.5, trichome: 5.5})
        // calculer la moyenne
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            const nums = Object.values(val).filter(v => typeof v === 'number');
            if (nums.length > 0) {
                return nums.reduce((a, b) => a + b, 0) / nums.length;
            }
        }
        return val;
    }
    return data[id];
};

// Vérifier si un champ a des données
const hasData = (id, data) => {
    const value = getFieldValue(id, data);
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    if (typeof value === 'number') return true;
    return Boolean(value);
};

// Obtenir un aperçu de la valeur
const getValuePreview = (id, data) => {
    const value = getFieldValue(id, data);
    if (value === undefined || value === null) return null;

    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        const first = typeof value[0] === 'object'
            ? (value[0].name || value[0].label || JSON.stringify(value[0]).slice(0, 20))
            : value[0];
        return value.length > 1 ? `${first} +${value.length - 1}` : String(first);
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        return keys.length > 0 ? `{${keys.slice(0, 2).join(', ')}${keys.length > 2 ? '...' : ''}}` : null;
    }
    if (typeof value === 'number') {
        return value % 1 === 0 ? String(value) : value.toFixed(1);
    }
    if (typeof value === 'string') return value.length > 25 ? value.slice(0, 25) + '...' : value;
    return String(value);
};

// ============================================================================
// COMPOSANTS UI - Utilisant @dnd-kit au lieu de react-dnd
// ============================================================================

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Composant pour un champ draggable avec @dnd-kit
function DraggableField({ field, isPlaced, hasValue, valuePreview }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: field.id,
        data: { field }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                p-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all select-none
                ${isDragging ? 'scale-105 shadow-xl z-50' : 'scale-100'}
                ${isPlaced
                    ? 'bg-green-500/20 border-green-500 border-2'
                    : hasValue
                        ? 'bg-purple-500/20 border-purple-500/50 border hover:border-purple-500 hover:bg-purple-500/30'
                        : 'bg-gray-700/30 border-gray-600/50 border border-dashed opacity-50'
                }
                hover:shadow-lg
            `}
            title={hasValue ? `Valeur: ${valuePreview}` : 'Aucune donnée'}
        >
            <div className="flex items-center gap-2">
                <span className="text-lg flex-shrink-0">{field.icon}</span>
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium block truncate text-white">{field.label}</span>
                    {hasValue && valuePreview && (
                        <span className="text-[10px] text-green-400/80 block truncate">{valuePreview}</span>
                    )}
                </div>
                {isPlaced && <span className="text-xs text-green-400 flex-shrink-0">✓</span>}
                {hasValue && !isPlaced && <span className="text-[10px] text-purple-400 flex-shrink-0">●</span>}
            </div>
        </div>
    );
}

DraggableField.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    }).isRequired,
    isPlaced: PropTypes.bool,
    hasValue: PropTypes.bool,
    valuePreview: PropTypes.string
};

// Section de champs avec titre (collapsible)
function FieldSection({ title, sectionKey, fields, placedFieldIds, reviewData, isOpen, onToggle, showOnlyWithData }) {
    const fieldsToShow = showOnlyWithData
        ? fields.filter(f => hasData(f.id, reviewData))
        : fields;
    const fieldsWithData = fields.filter(f => hasData(f.id, reviewData)).length;

    if (showOnlyWithData && fieldsToShow.length === 0) return null;

    return (
        <div className="mb-3">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wide">
                    {title}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-normal">
                        {fieldsWithData}/{fields.length}
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="mt-2 space-y-1.5 pl-1">
                    {fieldsToShow.map(field => (
                        <DraggableField
                            key={field.id}
                            field={field}
                            isPlaced={placedFieldIds.includes(field.id)}
                            hasValue={hasData(field.id, reviewData)}
                            valuePreview={getValuePreview(field.id, reviewData)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

FieldSection.propTypes = {
    title: PropTypes.string.isRequired,
    sectionKey: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    placedFieldIds: PropTypes.array,
    reviewData: PropTypes.object,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    showOnlyWithData: PropTypes.bool
};

// ============================================================================
// PANEL PRINCIPAL
// ============================================================================

export default function ContentPanel({ reviewData, placedFields, onFieldSelect }) {
    // État pour les sections ouvertes/fermées
    const [openSections, setOpenSections] = useState({
        basic: true,
        ratings: true,
        visualRatings: false,
        smellRatings: false,
        textureRatings: false,
        tasteRatings: false,
        effectsRatings: false,
        sensorial: true,
        levels: false,
        pipelines: false,
        content: false,
        stickers: false
    });

    // Filtre: afficher seulement les champs avec données
    const [showOnlyWithData, setShowOnlyWithData] = useState(false);

    // Boutons tout afficher / tout masquer
    const [allOpen, setAllOpen] = useState(false);

    // Debug: afficher les données reçues
    console.log('📦 ContentPanel - Données complètes:', {
        hasData: !!reviewData,
        keysCount: reviewData ? Object.keys(reviewData).length : 0,
        keys: reviewData ? Object.keys(reviewData).slice(0, 30) : [],
        sampleData: reviewData ? {
            holderName: reviewData.holderName,
            rating: reviewData.rating,
            aromasCount: reviewData.aromas?.length,
            effectsCount: reviewData.effects?.length,
            categoryRatingsKeys: reviewData.categoryRatings ? Object.keys(reviewData.categoryRatings) : [],
            densite: reviewData.densite,
            trichome: reviewData.trichome
        } : null
    });

    // Extraire les IDs des champs déjà placés
    const placedFieldIds = useMemo(() => {
        return (placedFields || []).reduce((acc, f) => {
            acc.push(f.id);
            if (f.assignedFields && Array.isArray(f.assignedFields)) {
                acc.push(...f.assignedFields);
            }
            return acc;
        }, []);
    }, [placedFields]);

    // Compter les champs avec données
    const totalFieldsWithData = useMemo(() => {
        let count = 0;
        Object.values(DRAGGABLE_FIELDS).forEach(fields => {
            fields.forEach(f => {
                if (hasData(f.id, reviewData)) count++;
            });
        });
        return count;
    }, [reviewData]);

    // Compter tous les champs
    const totalFields = useMemo(() => {
        return Object.values(DRAGGABLE_FIELDS).reduce((sum, fields) => sum + fields.length, 0);
    }, []);

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAll = (open) => {
        const newState = {};
        Object.keys(openSections).forEach(key => {
            newState[key] = open;
        });
        setOpenSections(newState);
        setAllOpen(open);
    };

    // Liste ordonnée des sections à afficher
    const sectionOrder = [
        'basic', 'ratings', 'visualRatings', 'smellRatings', 'textureRatings',
        'tasteRatings', 'effectsRatings', 'sensorial', 'levels', 'pipelines',
        'content', 'stickers'
    ];

    return (
        <div className="h-full bg-gray-900/95 backdrop-blur-sm flex flex-col border-r border-purple-500/30">
            {/* Header sticky */}
            <div className="sticky top-0 bg-gray-900 p-3 border-b border-purple-500/30 z-20">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <span>📦</span>
                    <span>Contenu Disponible</span>
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                    {totalFieldsWithData}/{totalFields} champs avec données
                </p>

                {/* Contrôles */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => toggleAll(true)}
                        className="px-2 py-1 text-[10px] rounded bg-purple-600/50 hover:bg-purple-600 text-white transition-colors"
                    >
                        Tout afficher
                    </button>
                    <button
                        onClick={() => toggleAll(false)}
                        className="px-2 py-1 text-[10px] rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        Tout masquer
                    </button>
                    <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer ml-auto">
                        <input
                            type="checkbox"
                            checked={showOnlyWithData}
                            onChange={(e) => setShowOnlyWithData(e.target.checked)}
                            className="w-3 h-3 rounded"
                        />
                        Remplis uniquement
                    </label>
                </div>
            </div>

            {/* Sections scrollables */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {sectionOrder.map(sectionKey => (
                    DRAGGABLE_FIELDS[sectionKey] && (
                        <FieldSection
                            key={sectionKey}
                            sectionKey={sectionKey}
                            title={SECTION_LABELS[sectionKey] || sectionKey}
                            fields={DRAGGABLE_FIELDS[sectionKey]}
                            placedFieldIds={placedFieldIds}
                            reviewData={reviewData}
                            isOpen={openSections[sectionKey]}
                            onToggle={() => toggleSection(sectionKey)}
                            showOnlyWithData={showOnlyWithData}
                        />
                    )
                ))}
            </div>

            {/* Footer avec actions */}
            <div className="p-3 border-t border-purple-500/30 bg-gray-900">
                <div className="text-[10px] text-gray-500 mb-2 flex items-center gap-2">
                    <span className="text-purple-400">●</span> = Données
                    <span className="text-green-400">✓</span> = Placé
                </div>
                <button
                    onClick={() => onFieldSelect?.({ type: 'zone' })}
                    className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                    ➕ Ajouter une zone libre
                </button>
            </div>
        </div>
    );
}

ContentPanel.propTypes = {
    reviewData: PropTypes.object,
    placedFields: PropTypes.array,
    onFieldSelect: PropTypes.func
};
