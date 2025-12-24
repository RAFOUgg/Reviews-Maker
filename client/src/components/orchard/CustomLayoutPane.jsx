/**
 * CustomLayoutPane Component
 * Mode personnalisé avec drag & drop pour placer les champs librement
 * Utilise @dnd-kit pour une meilleure compatibilité
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { DRAGGABLE_FIELDS } from './ContentPanel';
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
        for (const p of parts) {
            if (val === undefined || val === null) return null;
            val = val[p];
        }
        // Si c'est un objet (sous-notes), calculer la moyenne
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            const nums = Object.values(val).filter(v => typeof v === 'number');
            if (nums.length > 0) {
                return nums.reduce((a, b) => a + b, 0) / nums.length;
            }
        }
        return val;
    }
    return reviewData[id];
};

// Composant pour un champ placé (avec bouton supprimer)
function PlacedField({ field, value, onRemove, position, width = 25, height = 20, rotation = 0, onUpdate, reviewData }) {
    const isZone = field.type === 'zone' || field.zone === true;
    const fieldRef = React.useRef(null);

    // Toujours appeler useDroppable (pas conditionnellement)
    const { setNodeRef: setZoneRef, isOver } = useDroppable({
        id: `zone-drop-${field.id}`,
        data: { type: 'zone', zoneId: field.id },
        disabled: !isZone
    });

    // Combiner les refs
    const combinedRef = React.useCallback((node) => {
        fieldRef.current = node;
        if (isZone) {
            setZoneRef(node);
        }
    }, [isZone, setZoneRef]);

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
                minWidth: '120px',
                zIndex: 10
            }}
        >
            <div
                ref={combinedRef}
                className={`relative bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border shadow-xl ${isZone ? 'border-dashed border-2 /50' : '/50'} ${isOver ? 'border-green-500 bg-green-500/20' : ''}`}
                style={{
                    minHeight: `${Math.max(height * 2, 60)}px`,
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
                        <div className="text-sm font-medium mb-2">{field.label || 'Zone personnalisée'}</div>

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
                                <option value="sensorial">Détails Sensoriels</option>
                                <option value="pipelines">Pipelines & Culture</option>
                            </select>
                        </div>

                        {isOver && (
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
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path strokeWidth="2" d="M3 17L17 3M7 17H17V7" />
                    </svg>
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
    reviewData: PropTypes.object
};

// Zone de dépôt principale (le canvas) - avec useDroppable de @dnd-kit
function DropCanvas({ children, isOver }) {
    const { setNodeRef } = useDroppable({
        id: 'canvas-drop-zone',
        data: { type: 'canvas' }
    });

    return (
        <div
            ref={setNodeRef}
            className={`orchard-canvas-resize-parent relative w-full h-full overflow-hidden ${isOver ? 'ring-4 ring-green-500/50' : 'ring-2 /30'}`}
        >
            {/* Grille d'aide au positionnement */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-full" style={{
                    backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Indicateur de drop */}
            {isOver && (
                <div className="absolute inset-0 bg-green-500/10 backdrop-blur-sm flex items-center justify-center pointer-events-none z-50">
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
    isOver: PropTypes.bool
};

// Composant principal
export default function CustomLayoutPane({ reviewData, layout, onLayoutChange, isCanvasOver }) {
    const [placedFields, setPlacedFields] = useState(layout || []);
    const canvasRef = useRef(null);

    // Synchroniser placedFields avec le prop layout quand il change
    useEffect(() => {
        if (layout && JSON.stringify(layout) !== JSON.stringify(placedFields)) {
            setPlacedFields(layout);
        }
    }, [layout]);

    // Debug
    console.log('🎨 CustomLayoutPane:', {
        hasReviewData: !!reviewData,
        keysCount: reviewData ? Object.keys(reviewData).length : 0,
        placedCount: placedFields.length,
        isCanvasOver
    });

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
        <div ref={canvasRef} className="w-full h-full bg-gradient-to-br from-gray-900 /20 to-gray-900">
            <DropCanvas isOver={isCanvasOver}>
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
                            reviewData={reviewData}
                        />
                    ))}
                </AnimatePresence>
            </DropCanvas>
        </div>
    );
}

CustomLayoutPane.propTypes = {
    reviewData: PropTypes.object,
    layout: PropTypes.array,
    onLayoutChange: PropTypes.func,
    isCanvasOver: PropTypes.bool
};
