/**
 * CustomLayoutPane Component
 * Mode personnalisé avec drag & drop pour placer les champs librement
 */

import { useState, useCallback, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { DRAGGABLE_FIELD_TYPES, DRAGGABLE_FIELDS } from './ContentPanel';
import FieldRenderer from './FieldRendererClean';

// Helper pour récupérer la définition d'un champ
const getFieldDefFromId = (id) => {
    for (const section in DRAGGABLE_FIELDS) {
        const arr = DRAGGABLE_FIELDS[section];
        if (!Array.isArray(arr)) continue;
        const found = arr.find(f => f.id === id);
        if (found) return found;
    }
    return { id, label: id, icon: '🔲', type: 'text' };
};

// Helper pour récupérer la valeur d'un champ
const getFieldValueFromData = (id, reviewData) => {
    if (!reviewData) return null;
    if (id.includes('.')) {
        const parts = id.split('.');
        let val = reviewData;
        for (const p of parts) val = val?.[p];
        return val;
    }
    return reviewData[id];
};

// Composant pour un champ placé (avec bouton supprimer)
function PlacedField({ field, value, onRemove, position, width = 25, height = 20, rotation = 0, onUpdate, onAssignToZone, reviewData }) {
    const isZone = field.type === 'zone' || field.zone === true;

    // If zone, create a drop target to accept fields
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: DRAGGABLE_FIELD_TYPES.ORCHARD_FIELD,
        drop: (item) => {
            if (isZone) {
                onAssignToZone?.(field.id, item.field);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }), [field, isZone, onAssignToZone]);

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute group"
            style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${width}%`,
                minWidth: '100px',
                zIndex: 10
            }}
        >
            <div
                ref={isZone ? drop : undefined}
                className={`
                    relative bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border shadow-xl
                    ${isZone ? 'border-dashed border-2 border-blue-500/50' : 'border-purple-500/30'}
                    ${isOver && canDrop ? 'border-green-500 bg-green-500/20' : ''}
                `}
                style={{
                    minHeight: `${height * 2}px`,
                    transform: `rotate(${rotation}deg)`
                }}
            >
                {/* Bouton supprimer */}
                <button
                    onClick={() => onRemove(field.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                    title="Supprimer"
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {isZone ? (
                    <div className="w-full h-full flex flex-col items-center justify-center min-h-[80px]">
                        <div className="text-sm text-blue-300 font-medium mb-2">{field.label || 'Zone personnalisée'}</div>

                        {/* Section selector for zone */}
                        <div className="mb-3">
                            <select
                                value={field.sectionKey || ''}
                                onChange={(e) => onUpdate?.({ sectionKey: e.target.value })}
                                className="text-xs px-2 py-1 bg-gray-900 border border-white/10 rounded-lg text-white"
                            >
                                <option value="">— Tous les champs —</option>
                                <option value="basic">Informations de base</option>
                                <option value="ratings">Notes & Évaluations</option>
                                <option value="details">Détails Sensoriels</option>
                                <option value="advanced">Informations Avancées</option>
                            </select>
                        </div>

                        {isOver && canDrop && (
                            <div className="text-xs text-green-400 mb-2">📥 Relâcher pour placer</div>
                        )}

                        {/* Render assigned fields inside the zone */}
                        <div className="w-full space-y-2">
                            {(field.assignedFields || []).map((fid) => {
                                const fieldDef = getFieldDefFromId(fid);
                                const fieldValue = getFieldValueFromData(fid, reviewData);
                                return (
                                    <div key={fid} className="bg-gray-700/50 p-2 rounded">
                                        <FieldRenderer field={fieldDef} value={fieldValue} compact={true} />
                                    </div>
                                );
                            })}
                        </div>

                        {(!field.assignedFields || field.assignedFields.length === 0) && !isOver && (
                            <div className="text-xs text-gray-500 text-center">
                                Glissez des champs ici
                            </div>
                        )}
                    </div>
                ) : (
                    <FieldRenderer field={field} value={value} compact={true} />
                )}

                {/* Resize handle bottom-right */}
                <div
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startWidth = width;

                        const onMove = (evt) => {
                            const parent = document.querySelector('.orchard-canvas-resize-parent');
                            if (parent) {
                                const rect = parent.getBoundingClientRect();
                                const deltaX = evt.clientX - startX;
                                const deltaW = (deltaX / rect.width) * 100;
                                onUpdate?.({ width: Math.max(10, Math.min(90, startWidth + deltaW)) });
                            }
                        };

                        const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                        };

                        window.addEventListener('mousemove', onMove);
                        window.addEventListener('mouseup', onUp);
                    }}
                    className="absolute -right-2 -bottom-2 w-6 h-6 bg-white rounded-full text-gray-800 flex items-center justify-center shadow-md cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    title="Redimensionner"
                >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeWidth="2" d="M3 17L17 3M7 17H17V7" /></svg>
                </div>
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
    }).isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    rotation: PropTypes.number,
    onUpdate: PropTypes.func,
    onAssignToZone: PropTypes.func,
    reviewData: PropTypes.object
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
            className={`orchard-canvas-resize-parent
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

    // Synchroniser placedFields avec le prop layout quand il change
    useEffect(() => {
        if (layout && JSON.stringify(layout) !== JSON.stringify(placedFields)) {
            setPlacedFields(layout);
        }
    }, [layout]);

    // 🔍 Debug - Afficher les données reçues
    console.log('🎨 CustomLayoutPane - Données:', {
        hasReviewData: !!reviewData,
        reviewDataKeys: reviewData ? Object.keys(reviewData).slice(0, 20) : [],
        sampleData: reviewData ? {
            title: reviewData.title,
            holderName: reviewData.holderName,
            rating: reviewData.rating,
            aromasLength: reviewData.aromas?.length || 0,
            effectsLength: reviewData.effects?.length || 0
        } : null,
        layoutLength: layout?.length || 0,
        placedFieldsLength: placedFields.length
    });

    // Vérifier si un champ a une valeur
    const hasValueForField = useCallback((fld) => {
        try {
            const id = fld.id || fld.key || fld.name;
            if (!id) return false;

            const value = getFieldValueFromData(id, reviewData);
            if (value === undefined || value === null) return false;
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'string') return value.trim().length > 0;
            return true;
        } catch (err) {
            console.warn('hasValueForField error', err);
            return false;
        }
    }, [reviewData]);

    const handleDrop = useCallback((field, position) => {
        // Pour les zones, on accepte toujours
        if (field.type === 'zone') {
            const zoneId = `zone_${Date.now()}`;
            const newZone = {
                ...field,
                id: zoneId,
                label: 'Zone personnalisée',
                position,
                width: 30,
                height: 30,
                rotation: 0,
                assignedFields: []
            };
            const updated = [...placedFields, newZone];
            setPlacedFields(updated);
            onLayoutChange?.(updated);
            return;
        }

        // Vérifier que le champ a une valeur
        if (!hasValueForField(field)) {
            const idLabel = field.label || field.id || '';
            console.warn(`Orchard: champ vide, placement autorisé mais sans données: ${idLabel}`);
        }

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
            const updated = [...placedFields, { ...field, position, width: 25, height: 20, rotation: 0 }];
            setPlacedFields(updated);
            onLayoutChange?.(updated);
        }
    }, [placedFields, hasValueForField, onLayoutChange]);

    const assignFieldToZone = useCallback((zoneId, fieldToAssign) => {
        const updated = placedFields.map(pf => {
            if (pf.id === zoneId) {
                // Éviter les doublons
                const assignedFields = Array.from(new Set([...(pf.assignedFields || []), fieldToAssign.id]));
                return { ...pf, assignedFields };
            }
            // Si le champ était placé directement, le retirer
            if (pf.id === fieldToAssign.id) {
                return null;
            }
            return pf;
        }).filter(Boolean);

        setPlacedFields(updated);
        onLayoutChange?.(updated);
    }, [placedFields, onLayoutChange]);

    const handleRemove = useCallback((fieldId) => {
        const updated = placedFields.filter(pf => pf.id !== fieldId);
        setPlacedFields(updated);
        onLayoutChange?.(updated);
    }, [placedFields, onLayoutChange]);

    const handleFieldUpdate = useCallback((fieldId, updates) => {
        const updated = placedFields.map(pf =>
            pf.id === fieldId ? { ...pf, ...updates } : pf
        );
        setPlacedFields(updated);
        onLayoutChange?.(updated);
    }, [placedFields, onLayoutChange]);

    // Récupérer la valeur d'un champ depuis reviewData
    const getFieldValue = useCallback((field) => {
        return getFieldValueFromData(field.id, reviewData);
    }, [reviewData]);

    return (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            <DropCanvas onDrop={handleDrop}>
                <AnimatePresence>
                    {placedFields.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div className="text-center space-y-4 text-gray-400">
                                <svg className="w-24 h-24 mx-auto opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div>
                                    <p className="text-lg font-semibold mb-2">Canvas vide</p>
                                    <p className="text-sm">Glissez des éléments depuis le panel "Contenu" pour construire votre layout</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {placedFields.map((placedField) => (
                        <PlacedField
                            key={placedField.id}
                            field={placedField}
                            value={getFieldValue(placedField)}
                            width={placedField.width}
                            height={placedField.height}
                            rotation={placedField.rotation}
                            onUpdate={(updates) => handleFieldUpdate(placedField.id, updates)}
                            position={placedField.position}
                            onRemove={handleRemove}
                            onAssignToZone={assignFieldToZone}
                            reviewData={reviewData}
                        />
                    ))}
                </AnimatePresence>
            </DropCanvas>
        </div>
    );
}

CustomLayoutPane.propTypes = {
    reviewData: PropTypes.object.isRequired,
    layout: PropTypes.array,
    onLayoutChange: PropTypes.func
};
