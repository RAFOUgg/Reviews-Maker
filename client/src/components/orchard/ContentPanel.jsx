/**
 * ContentPanel Component
 * Panel gauche affichant tous les champs draggables disponibles pour l'aperçu Orchard
 */

import { useMemo } from 'react';
import { useDrag } from 'react-dnd';
import PropTypes from 'prop-types';

// Types de champs disponibles pour le drag & drop
export const DRAGGABLE_FIELD_TYPES = {
    ORCHARD_FIELD: 'ORCHARD_FIELD'
};

// Configuration des champs draggables par catégorie
export const DRAGGABLE_FIELDS = {
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
        { id: 'images', label: 'Galerie d\'images', icon: '🖼️', type: 'gallery' }
    ],
    ratings: [
        { id: 'rating', label: 'Note globale', icon: '⭐', type: 'rating' },
        { id: 'overallRating', label: 'Note (alt)', icon: '⭐', type: 'rating' },
        { id: 'categoryRatings', label: 'Notes par catégorie', icon: '📊', type: 'json' },
        { id: 'categoryRatings.visual', label: 'Note visuelle', icon: '👁️', type: 'rating' },
        { id: 'categoryRatings.smell', label: 'Note odeur', icon: '👃', type: 'rating' },
        { id: 'categoryRatings.taste', label: 'Note goût', icon: '👅', type: 'rating' },
        { id: 'categoryRatings.effects', label: 'Note effets', icon: '⚡', type: 'rating' }
    ],
    details: [
        { id: 'terpenes', label: 'Terpènes', icon: '🌿', type: 'tags' },
        { id: 'aromas', label: 'Arômes', icon: '🌸', type: 'tags' },
        { id: 'tastes', label: 'Goûts', icon: '👅', type: 'tags' },
        { id: 'effects', label: 'Effets', icon: '⚡', type: 'tags' },
        { id: 'thcLevel', label: 'THC', icon: '💥', type: 'text' },
        { id: 'cbdLevel', label: 'CBD', icon: '🛡️', type: 'text' },
        { id: 'indicaRatio', label: 'Indica Ratio', icon: '⚖️', type: 'text' },
        { id: 'dureeEffet', label: 'Durée des effets', icon: '⏱️', type: 'text' }
    ],
    advanced: [
        { id: 'description', label: 'Description', icon: '📝', type: 'textarea' },
        { id: 'cultivarsList', label: 'Liste des cultivars', icon: '🌱', type: 'cultivar-list' },
        { id: 'substratMix', label: 'Substrat Mix', icon: '🧩', type: 'substrat-mix' },
        { id: 'pipelineExtraction', label: 'Pipeline Extraction', icon: '⚗️', type: 'pipeline' },
        { id: 'pipelineSeparation', label: 'Pipeline Separation', icon: '🧪', type: 'pipeline' },
        { id: 'pipelinePurification', label: 'Pipeline Purification', icon: '✨', type: 'pipeline' },
        { id: 'fertilizationPipeline', label: 'Pipeline fertilisation', icon: '🌾', type: 'pipeline' },
        { id: 'purgevide', label: 'Purge à vide', icon: '🫧', type: 'boolean' },
        { id: 'extraData', label: 'Données additionnelles', icon: '📋', type: 'json' }
    ]
};

// Add stickers / info bubbles
DRAGGABLE_FIELDS.stickers = [
    { id: 'infoBubble', label: 'Bulle info', icon: '💬', type: 'bubble' },
    { id: 'emoji', label: 'Emoji', icon: '😊', type: 'bubble' }
];

// Helper pour extraire la valeur d'un champ
const getFieldValue = (id, data) => {
    if (!data) return undefined;
    if (id.includes('.')) {
        const parts = id.split('.');
        let val = data;
        for (const p of parts) {
            val = val?.[p];
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
        const first = typeof value[0] === 'object' ? (value[0].name || value[0].label || JSON.stringify(value[0]).slice(0, 20)) : value[0];
        return value.length > 1 ? `${first} +${value.length - 1}` : String(first);
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        return keys.length > 0 ? `{${keys.slice(0, 2).join(', ')}${keys.length > 2 ? '...' : ''}}` : null;
    }
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value.length > 30 ? value.slice(0, 30) + '...' : value;
    return String(value);
};

// Composant pour un champ draggable
function DraggableField({ field, isPlaced, hasValue, valuePreview }) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: DRAGGABLE_FIELD_TYPES.ORCHARD_FIELD,
        item: { field },
        collect: (monitor) => ({
            isDragging: monitor.isDragging()
        })
    }), [field]);

    return (
        <div
            ref={drag}
            className={`
                p-3 rounded-lg cursor-move transition-all select-none
                ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                ${isPlaced
                    ? 'bg-green-500/20 border-green-500 border-2'
                    : hasValue
                        ? 'bg-purple-500/20 border-purple-500/50 border-2 hover:border-purple-500 hover:bg-purple-500/30'
                        : 'bg-gray-700/30 border-gray-600/50 border border-dashed opacity-60'
                }
                hover:shadow-lg
            `}
            style={{ touchAction: 'none' }}
            title={hasValue ? `Valeur: ${valuePreview}` : 'Aucune donnée'}
        >
            <div className="flex items-center gap-2">
                <span className="text-xl">{field.icon}</span>
                <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{field.label}</span>
                    {hasValue && valuePreview && (
                        <span className="text-xs text-green-400/80 block truncate">{valuePreview}</span>
                    )}
                </div>
                {isPlaced && <span className="text-xs text-green-400 flex-shrink-0">✓</span>}
                {hasValue && !isPlaced && <span className="text-xs text-purple-400 flex-shrink-0">●</span>}
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

// Section de champs avec titre
function FieldSection({ title, fields, placedFieldIds, reviewData }) {
    const fieldsWithData = fields.filter(f => hasData(f.id, reviewData)).length;

    return (
        <div className="mb-4">
            <h3 className="text-sm font-bold mb-2 text-purple-300 uppercase tracking-wide flex items-center justify-between">
                <span>{title}</span>
                <span className="text-xs text-gray-500 font-normal">
                    {fieldsWithData}/{fields.length} rempli{fieldsWithData > 1 ? 's' : ''}
                </span>
            </h3>
            <div className="space-y-2">
                {fields.map(field => (
                    <DraggableField
                        key={field.id}
                        field={field}
                        isPlaced={placedFieldIds.includes(field.id)}
                        hasValue={hasData(field.id, reviewData)}
                        valuePreview={getValuePreview(field.id, reviewData)}
                    />
                ))}
            </div>
        </div>
    );
}

FieldSection.propTypes = {
    title: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    placedFieldIds: PropTypes.array,
    reviewData: PropTypes.object
};

// Panel principal de contenu
export default function ContentPanel({ reviewData, placedFields, onFieldSelect }) {
    // Debug: afficher les données reçues
    console.log('📦 ContentPanel - reviewData:', {
        hasData: !!reviewData,
        keys: reviewData ? Object.keys(reviewData) : [],
        title: reviewData?.title,
        holderName: reviewData?.holderName,
        rating: reviewData?.rating,
        aromas: reviewData?.aromas,
        effects: reviewData?.effects,
    });

    // Extraire les IDs des champs déjà placés
    const placedFieldIds = useMemo(() => {
        return placedFields.reduce((acc, f) => {
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

    return (
        <div className="w-80 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg overflow-y-auto max-h-screen border border-purple-500/30">
            <div className="sticky top-0 bg-gray-900/95 pb-3 mb-4 border-b border-purple-500/30 -mx-4 px-4 -mt-4 pt-4 z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📦</span>
                    <span>Contenu Disponible</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    {totalFieldsWithData} champs avec données • Glissez vers le canvas
                </p>
            </div>

            <div className="space-y-6">
                <FieldSection
                    title="Informations de base"
                    fields={DRAGGABLE_FIELDS.basic}
                    placedFieldIds={placedFieldIds}
                    reviewData={reviewData}
                />
                <FieldSection
                    title="Notes & Évaluations"
                    fields={DRAGGABLE_FIELDS.ratings}
                    placedFieldIds={placedFieldIds}
                    reviewData={reviewData}
                />
                <FieldSection
                    title="Détails Sensoriels"
                    fields={DRAGGABLE_FIELDS.details}
                    placedFieldIds={placedFieldIds}
                    reviewData={reviewData}
                />
                <FieldSection
                    title="Informations Avancées"
                    fields={DRAGGABLE_FIELDS.advanced}
                    placedFieldIds={placedFieldIds}
                    reviewData={reviewData}
                />
                <FieldSection
                    title="Stickers & Bulles"
                    fields={DRAGGABLE_FIELDS.stickers}
                    placedFieldIds={placedFieldIds}
                    reviewData={reviewData}
                />
            </div>

            <div className="mt-6 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="text-xs text-gray-300 mb-2">
                    <span className="text-purple-400">●</span> = Données disponibles
                    <br />
                    <span className="text-green-400">✓</span> = Déjà placé
                </p>
                <button
                    onClick={() => onFieldSelect?.({ type: 'zone' })}
                    className="mt-2 w-full px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                    ➕ Ajouter une zone
                </button>
            </div>
        </div>
    );
}

ContentPanel.propTypes = {
    reviewData: PropTypes.object.isRequired,
    placedFields: PropTypes.array.isRequired,
    onFieldSelect: PropTypes.func
};
