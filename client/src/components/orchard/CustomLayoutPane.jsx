/**
 * CustomLayoutPane Component
 * Mode personnalisé avec drag & drop pour placer les champs librement
 */

import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { DRAGGABLE_FIELD_TYPES } from './ContentPanel';
import FieldRenderer from './FieldRenderer';

// Composant pour un champ placé (avec bouton supprimer)
function PlacedField({ field, value, onRemove, position }) {
    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute group"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                maxWidth: '300px'
            }}
        >
            <div className="relative bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 shadow-xl">
                <button
                    onClick={() => onRemove(field.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Supprimer"
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <FieldRenderer field={field} value={value} compact={true} />
            </div>
        </motion.div>
    );
}

PlacedField.propTypes = {
    field: PropTypes.object.isRequired,
    value: PropTypes.any,
    onRemove: PropTypes.func.isRequired,
    position: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }).isRequired
};

// Zone de dépôt pour le canvas
function DropCanvas({ children, onDrop }) {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: DRAGGABLE_FIELD_TYPES.ORCHARD_FIELD,
        drop: (item, monitor) => {
            const offset = monitor.getClientOffset();
            const canvasRect = monitor.getTargetClientRect();

            if (offset && canvasRect) {
                const x = ((offset.x - canvasRect.left) / canvasRect.width) * 100;
                const y = ((offset.y - canvasRect.top) / canvasRect.height) * 100;

                onDrop(item.field, { x, y });
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }));

    return (
        <div
            ref={drop}
            className={`
                relative w-full h-full overflow-hidden
                ${isOver && canDrop ? 'ring-4 ring-green-500/50' : ''}
                ${canDrop ? 'ring-2 ring-purple-500/30' : ''}
            `}
        >
            {/* Grille d'aide au positionnement */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Indicateur de drop */}
            {isOver && canDrop && (
                <div className="absolute inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                    <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-bold">Déposer ici</span>
                    </div>
                </div>
            )}

            {children}
        </div>
    );
}

DropCanvas.propTypes = {
    children: PropTypes.node,
    onDrop: PropTypes.func.isRequired
};

// Composant principal
export default function CustomLayoutPane({ reviewData, layout, onLayoutChange }) {
    const [placedFields, setPlacedFields] = useState(layout || []);

    const handleDrop = (field, position) => {
        // Vérifier si le champ n'est pas déjà placé
        const alreadyPlaced = placedFields.find(pf => pf.id === field.id);
        if (alreadyPlaced) {
            // Mettre à jour la position
            const updated = placedFields.map(pf =>
                pf.id === field.id ? { ...pf, position } : pf
            );
            setPlacedFields(updated);
            onLayoutChange?.(updated);
        } else {
            // Ajouter le nouveau champ
            const updated = [...placedFields, { ...field, position }];
            setPlacedFields(updated);
            onLayoutChange?.(updated);
        }
    };

    const handleRemove = (fieldId) => {
        const updated = placedFields.filter(pf => pf.id !== fieldId);
        setPlacedFields(updated);
        onLayoutChange?.(updated);
    };

    // Récupérer la valeur d'un champ depuis reviewData
    const getFieldValue = (field) => {
        if (!reviewData) return null;

        // Gérer les champs avec notation par points (ex: categoryRatings.visual)
        if (field.id.includes('.')) {
            const parts = field.id.split('.');
            let value = reviewData;
            for (const part of parts) {
                value = value?.[part];
            }
            return value;
        }

        return reviewData[field.id];
    };

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <DropCanvas onDrop={handleDrop}>
                {placedFields.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center space-y-4 text-gray-400">
                            <svg className="w-24 h-24 mx-auto opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <p className="text-lg font-semibold mb-2">Canvas vide</p>
                                <p className="text-sm">Glissez des éléments depuis le panel "Contenu" pour construire votre layout</p>
                            </div>
                        </div>
                    </div>
                )}

                {placedFields.map((placedField) => (
                    <PlacedField
                        key={placedField.id}
                        field={placedField}
                        value={getFieldValue(placedField)}
                        position={placedField.position}
                        onRemove={handleRemove}
                    />
                ))}
            </DropCanvas>
        </div>
    );
}

CustomLayoutPane.propTypes = {
    reviewData: PropTypes.object.isRequired,
    layout: PropTypes.array,
    onLayoutChange: PropTypes.func
};
