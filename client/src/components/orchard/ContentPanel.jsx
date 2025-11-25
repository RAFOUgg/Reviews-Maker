/**
 * ContentPanel Component
 * Panel gauche affichant tous les champs draggables disponibles pour l'aperçu Orchard
 */

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
        { id: 'breeder', label: 'Breeder', icon: '🧬', type: 'text' },
        { id: 'farm', label: 'Farm', icon: '🌱', type: 'text' },
        { id: 'hashmaker', label: 'Hash Maker', icon: '👨‍🔬', type: 'text' },
        { id: 'images', label: 'Image principale', icon: '🖼️', type: 'image' }
    ],
    ratings: [
        { id: 'overallRating', label: 'Note globale', icon: '⭐', type: 'rating' },
        { id: 'categoryRatings.visual', label: 'Note visuelle', icon: '👁️', type: 'rating' },
        { id: 'categoryRatings.smell', label: 'Note odeur', icon: '👃', type: 'rating' },
        { id: 'categoryRatings.texture', label: 'Note texture', icon: '🤚', type: 'rating' },
        { id: 'categoryRatings.taste', label: 'Note goût', icon: '👅', type: 'rating' },
        { id: 'categoryRatings.effects', label: 'Note effets', icon: '⚡', type: 'rating' }
    ],
    details: [
        { id: 'aromas', label: 'Arômes', icon: '🌸', type: 'wheel' },
        { id: 'effects', label: 'Effets', icon: '⚡', type: 'effects' },
        { id: 'tastes', label: 'Goûts', icon: '👅', type: 'wheel' },
        { id: 'type', label: 'Type de produit', icon: '📦', type: 'text' },
        { id: 'strainType', label: 'Type de strain', icon: '🌿', type: 'text' }
    ],
    advanced: [
        { id: 'holderComment', label: 'Commentaire', icon: '💬', type: 'textarea' },
        { id: 'description', label: 'Description', icon: '📝', type: 'textarea' },
        { id: 'fertilization', label: 'Pipeline fertilisation', icon: '🧪', type: 'pipeline' },
        { id: 'purification', label: 'Pipeline purification', icon: '✨', type: 'pipeline' }
    ]
};

// Add stickers / info bubbles
DRAGGABLE_FIELDS.stickers = [
    { id: 'infoBubble', label: 'Bulle info', icon: '💬', type: 'bubble' },
    { id: 'emoji', label: 'Emoji', icon: '😊', type: 'bubble' }
];

// Composant pour un champ draggable
function DraggableField({ field, isPlaced }) {
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
                    : 'bg-purple-500/20 border-purple-500/50 border-2 hover:border-purple-500 hover:bg-purple-500/30'
                }
                hover:shadow-lg
            `}
            style={{ touchAction: 'none' }}
        >
            <div className="flex items-center gap-2">
                <span className="text-xl">{field.icon}</span>
                <span className="text-sm font-medium flex-1">{field.label}</span>
                {isPlaced && <span className="text-xs text-green-400">✓ Placé</span>}
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
    isPlaced: PropTypes.bool
};

// Section de champs avec titre
function FieldSection({ title, fields, placedFieldIds }) {
    return (
        <div className="mb-4">
            <h3 className="text-sm font-bold mb-2 text-purple-300 uppercase tracking-wide">
                {title}
            </h3>
            <div className="space-y-2">
                {fields.map(field => (
                    <DraggableField
                        key={field.id}
                        field={field}
                        isPlaced={placedFieldIds.includes(field.id)}
                    />
                ))}
            </div>
        </div>
    );
}

FieldSection.propTypes = {
    title: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    placedFieldIds: PropTypes.array
};

// Panel principal de contenu
export default function ContentPanel({ reviewData, placedFields, onFieldSelect }) {
    // Extraire les IDs des champs déjà placés
    // Includes fields assigned into zones (zone.assignedFields)
    const placedFieldIds = placedFields.reduce((acc, f) => {
        acc.push(f.id);
        if (f.assignedFields && Array.isArray(f.assignedFields)) {
            acc.push(...f.assignedFields);
        }
        return acc;
    }, []);

    return (
        <div className="w-80 bg-gray-900/90 backdrop-blur-sm p-4 rounded-lg overflow-y-auto max-h-screen border border-purple-500/30">
            <div className="sticky top-0 bg-gray-900/95 pb-3 mb-4 border-b border-purple-500/30 -mx-4 px-4 -mt-4 pt-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📦</span>
                    <span>Contenu Disponible</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                    Glissez les éléments vers la zone de prévisualisation
                </p>
            </div>

            <div className="space-y-6">
                <FieldSection
                    title="Informations de base"
                    fields={DRAGGABLE_FIELDS.basic}
                    placedFieldIds={placedFieldIds}
                />
                <FieldSection
                    title="Notes & Évaluations"
                    fields={DRAGGABLE_FIELDS.ratings}
                    placedFieldIds={placedFieldIds}
                />
                <FieldSection
                    title="Détails Sensoriels"
                    fields={DRAGGABLE_FIELDS.details}
                    placedFieldIds={placedFieldIds}
                />
                <FieldSection
                    title="Informations Avancées"
                    fields={DRAGGABLE_FIELDS.advanced}
                    placedFieldIds={placedFieldIds}
                />
                <FieldSection
                    title="Stickers & Bulles"
                    fields={DRAGGABLE_FIELDS.stickers}
                    placedFieldIds={placedFieldIds}
                />
            </div>

            <div className="mt-6 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="text-xs text-gray-300">
                    <strong className="text-purple-300">💡 Astuce :</strong> Les champs marqués d'un ✓ sont déjà placés dans votre layout.
                </p>
                <button
                    onClick={() => onFieldSelect?.({ type: 'zone' })}
                    className="mt-3 w-full px-3 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
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

// Note: 'onFieldSelect' when called with { type: 'zone' } instructs the parent to create a new empty zone on the canvas
