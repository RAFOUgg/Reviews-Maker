**
 * CustomLayoutPane Component
    * Mode personnalisé avec drag & drop pour placer les champs librement
        */

import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { DRAGGABLE_FIELD_TYPES, DRAGGABLE_FIELDS } from './ContentPanel';
import FieldRenderer from './FieldRendererClean';
import { useToastStore } from '../ToastContainer';

// Composant pour un champ placé (avec bouton supprimer)
function PlacedField({ field, value, onRemove, position, width = 25, height = 20, rotation = 0, onUpdate, onAssignToZone }) {
    const isZone = field.type === 'zone' || field.zone === true;
    // If zone, create a drop target to accept fields
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: DRAGGABLE_FIELD_TYPES.ORCHARD_FIELD,
        drop: (item, monitor) => {
            if (isZone) {
                onAssignToZone?.(field.id, item.field);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    }), [field]);
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
            <div ref={isZone ? drop : undefined} className="relative bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border border-purple-500/30 shadow-xl" style={{ width: width + '%', height: height + '%', transform: 'rotate(' + rotation + 'deg)' }}>
                <button
                    onClick={() => onRemove(field.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Supprimer"
                >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                {isZone ? (
                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-lg">
                        <div className="text-sm text-gray-300">{field.label || 'Zone'}</div>
                        {/* Section selector for zone */}
                        <div className="mt-2">
                            <label className="text-xs text-gray-400 mr-2">Section</label>
                            <select
                                value={field.sectionKey || ''}
                                onChange={(e) => onUpdate?.({ sectionKey: e.target.value })}
                                className="text-xs px-2 py-1 bg-gray-900 border border-white/10 rounded-lg"
                            >
                                <option value="">— Aucune —</option>
                                <option value="basic">Informations de base</option>
                                <option value="ratings">Notes & Évaluations</option>
                                <option value="details">Détails Sensoriels</option>
                                <option value="advanced">Informations Avancées</option>
                            </select>
                        </div>
                        {isOver && canDrop && <div className="mt-2 text-xs text-green-400">Relâcher pour placer</div>}
                        {/* Render assigned fields inside the zone */}
                        <div className="mt-3 w-full">
                            {(field.assignedFields || []).map((fid) => (
                                <div key={fid} className="mb-2">
                                    <FieldRenderer field={getFieldDef(fid)} value={getFieldValueById(fid)} compact={true} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <FieldRenderer field={field} value={value} compact={true} />
                )}

                {/* Resize handle bottom-right */}
                <div
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startWidth = width;
                        const startHeight = height;

                        const onMove = (evt) => {
                            const deltaX = evt.clientX - startX;
                            const deltaY = evt.clientY - startY;
                            // Calculate percent based on parent size
                            const parent = evt.currentTarget ? evt.currentTarget.closest('.orchard-canvas-resize-parent') : null;
                            let deltaW = (deltaX / window.innerWidth) * 100;
                            let deltaH = (deltaY / window.innerHeight) * 100;
                            if (parent) {
                                const rect = parent.getBoundingClientRect();
                                deltaW = (deltaX / rect.width) * 100;
                                deltaH = (deltaY / rect.height) * 100;
                            }
                            onUpdate?.({ width: Math.max(5, Math.min(100, startWidth + deltaW)), height: Math.max(5, Math.min(100, startHeight + deltaH)) });
                        };

                        const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                        };

                        window.addEventListener('mousemove', onMove);
                        window.addEventListener('mouseup', onUp);
                    }}
                    className="absolute -right-2 -bottom-2 w-6 h-6 bg-white rounded-full text-gray-800 flex items-center justify-center shadow-md cursor-se-resize"
                    title="Redimensionner"
                >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeWidth="2" d="M3 17L17 3M7 17H17V7" /></svg>
                </div>

                {/* Rotate handle top-left */}
                <div
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        const startX = e.clientX;
                        const startY = e.clientY;
                        const startRotation = rotation;

                        const onMove = (evt) => {
                            const deltaX = evt.clientX - startX;
                            const newRotation = (startRotation + deltaX / 2) % 360;
                            onUpdate?.({ rotation: newRotation });
                        };

                        const onUp = () => {
                            window.removeEventListener('mousemove', onMove);
                            window.removeEventListener('mouseup', onUp);
                        };

                        window.addEventListener('mousemove', onMove);
                        window.addEventListener('mouseup', onUp);
                    }}
                    className="absolute -left-2 -top-2 w-6 h-6 bg-white rounded-full text-gray-800 flex items-center justify-center shadow-md cursor-grab"
                    title="Pivoter"
                >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path strokeWidth="2" d="M11 3a8 8 0 11-1.999 4.999L7 7" /></svg>
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
    }).isRequired
    ,
    width: PropTypes.number,
    height: PropTypes.number,
    rotation: PropTypes.number,
    onUpdate: PropTypes.func
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

    const handleDrop = (field, position) => {
        // Vérifier que le champ a bien une valeur dans `reviewData` avant d'accepter le drop
        const hasValueForField = (fld) => {
            try {
                // Supporter les clés imbriquées type "categoryRatings.visual"
                const id = fld.id || fld.key || fld.name
                if (!id) return false
                if (id.includes('.')) {
                    const parts = id.split('.')
                    let val = reviewData
                    for (const p of parts) {
                        val = val?.[p]
                    }
                    if (val === undefined || val === null) return false
                    if (Array.isArray(val)) return val.length > 0
                    if (typeof val === 'string') return val.trim().length > 0
                    return true // numbers/objects considered present
                }

                const value = reviewData?.[id]
                if (value === undefined || value === null) return false
                if (Array.isArray(value)) return value.length > 0
                if (typeof value === 'string') return value.trim().length > 0
                return true
            } catch (err) {
                console.warn('hasValueForField error', err)
                return false
            }
        }

        if (!hasValueForField(field)) {
            // Ne pas autoriser le drop d'un champ qui n'a pas de contenu
            const idLabel = field.id || field.label || ''
            console.warn(`Orchard: drop refusé, champ vide: ${idLabel}`)
            try {
                const store = useToastStore.getState()
                if (store && typeof store.addToast === 'function') {
                    store.addToast({ type: 'warning', message: `Champ vide — impossible de placer: ${idLabel}` })
                }
            } catch (e) {
                // Ignore errors; fallback to console
            }
            return
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
            // Default size/rotation for new fields
            const updated = [...placedFields, { ...field, position, width: 25, height: 20, rotation: 0 }];
            setPlacedFields(updated);
            onLayoutChange?.(updated);
        }
    };

    const assignFieldToZone = (zoneId, fieldToAssign) => {
        // If the zone is restricted by section (sectionKey), prevent assigning fields from other sections
        const getFieldCategory = (fid) => {
            for (const sec in DRAGGABLE_FIELDS) {
                if (DRAGGABLE_FIELDS[sec].some(f => f.id === fid)) return sec
            }
            return null
        }
        const updated = placedFields.map(pf => {
            if (pf.id === zoneId) {
                // avoid duplicates
                const assignedFields = Array.from(new Set([...(pf.assignedFields || []), fieldToAssign.id]));
                // Section check
                if (pf.sectionKey) {
                    const cat = getFieldCategory(fieldToAssign.id)
                    if (cat && cat !== pf.sectionKey) {
                        const store = useToastStore.getState()
                        store?.addToast?.({ type: 'warning', message: `Le champ ${fieldToAssign.label || fieldToAssign.id} ne appartient pas à la section sélectionnée.` })
                        return pf
                    }
                }
                return { ...pf, assignedFields };
            }
            // If the field was previously placed outside, remove it
            if (pf.id === fieldToAssign.id) {
                return null; // remove direct placement
            }
            return pf;
        }).filter(Boolean);

        setPlacedFields(updated);
        onLayoutChange?.(updated);
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

    const getFieldDef = (id) => {
        for (const section in DRAGGABLE_FIELDS) {
            const arr = DRAGGABLE_FIELDS[section];
            if (!Array.isArray(arr)) continue;
            const found = arr.find(f => f.id === id);
            if (found) return found;
        }
        return { id, label: id, icon: '🔲', type: 'text' };
    };

    const getFieldValueById = (id) => {
        if (!reviewData) return null;
        if (id.includes('.')) {
            const parts = id.split('.')
            let val = reviewData
            for (const p of parts) val = val?.[p]
            return val
        }
        return reviewData[id]
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
                        width={placedField.width}
                        height={placedField.height}
                        rotation={placedField.rotation}
                        onUpdate={(updates) => {
                            const updated = placedFields.map(pf => pf.id === placedField.id ? { ...pf, ...updates } : pf);
                            setPlacedFields(updated);
                            onLayoutChange?.(updated);
                        }}
                        position={placedField.position}
                        onRemove={handleRemove}
                        onAssignToZone={assignFieldToZone}
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
