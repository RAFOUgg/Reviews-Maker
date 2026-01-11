/**
 * CellContextMenu - Menu contextuel réutilisable pour TOUTES les cellules de pipeline
 * 
 * Utilisé par :
 * - PipelineDragDropView (Culture, Séparation, Extraction, Curing, Purification)
 * - Tous les types de pipelines réutilisent le même composant
 * 
 * Positionnement unique et cohérent pour tous les systèmes de pipeline
 * 
 * IMPORTANT: Utilise React Portal pour éviter le clipping par les conteneurs parent avec overflow
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

function CellContextMenu({
    isOpen,
    position,
    cellTimestamp,
    selectedCells,
    cellData,
    sidebarContent,
    onClose,
    onDeleteAll,
    onDeleteFields,
    onCopy,
    onPaste,
    hasCopiedData
}) {
    const [showFieldList, setShowFieldList] = useState(false);
    const [selectedFieldsToDelete, setSelectedFieldsToDelete] = useState([]);
    const menuRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Fermer au clic extérieur ou Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    // Reset au changement de cellule
    useEffect(() => {
        setShowFieldList(false);
        setSelectedFieldsToDelete([]);
        setIsVisible(false);
    }, [cellTimestamp, isOpen]);

    // ✅ Positionnement UNIFIÉ pour TOUTES les pipelines
    // Système cohérent: offset +4px à droite/bas du clic, ajustements intelligent si sortie écran
    useLayoutEffect(() => {
        if (!isOpen || !menuRef.current) return;

        const positionMenu = () => {
            const menu = menuRef.current;
            if (!menu) return;

            const rect = menu.getBoundingClientRect();
            const m = 8;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Position de base: décalage +4px à droite et en bas du clic
            let x = position.x + 4;
            let y = position.y + 4;

            // Ajustement horizontal : si menu sort à droite, placer à gauche du clic
            if (x + rect.width > vw - m) {
                x = Math.max(m, position.x - rect.width - 4);
            }
            x = Math.max(m, Math.min(x, vw - rect.width - m));

            // Ajustement vertical : si menu sort en bas, placer au-dessus du clic
            if (y + rect.height > vh - m) {
                y = Math.max(m, position.y - rect.height - 4);
            }
            y = Math.max(m, Math.min(y, vh - rect.height - m));

            menu.style.left = `${Math.round(x)}px`;
            menu.style.top = `${Math.round(y)}px`;
            setIsVisible(true);
        };

        requestAnimationFrame(() => requestAnimationFrame(positionMenu));
    }, [isOpen, position, showFieldList]);

    if (!isOpen) return null;

    const targetCount = selectedCells?.length > 0 ? selectedCells.length : 1;
    const isBulk = targetCount > 1;

    // Extraire les champs présents dans la cellule
    const dataFields = cellData ? Object.keys(cellData).filter(k =>
        !['timestamp', 'label', 'date', 'phase', 'week', 'day', 'hours', 'seconds', '_meta'].includes(k)
    ) : [];

    // Trouver la définition complète d'un champ
    const getFieldDef = (fieldKey) => {
        for (const section of (sidebarContent || [])) {
            const item = (section.items || []).find(i => i.id === fieldKey || i.key === fieldKey);
            if (item) return { ...item, sectionLabel: section.label };
        }
        return null;
    };

    const getFieldLabel = (fieldKey) => {
        const def = getFieldDef(fieldKey);
        return def ? `${def.icon || '📌'} ${def.label}` : `📌 ${fieldKey}`;
    };

    const handleDeleteSelectedFields = () => {
        if (selectedFieldsToDelete.length === 0) return;
        onDeleteFields(selectedFieldsToDelete);
        onClose();
    };

    const toggleField = (field) => {
        setSelectedFieldsToDelete(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
    };

    const selectAllFields = () => setSelectedFieldsToDelete([...dataFields]);
    const deselectAllFields = () => setSelectedFieldsToDelete([]);

    if (!isOpen) return null;

    const menuContent = (
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.15s ease-out',
                width: '260px',
                maxWidth: 'calc(100vw - 16px)',
                maxHeight: 'calc(100vh - 16px)',
                pointerEvents: 'auto'
            }}
        >
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isBulk ? `📦 ${targetCount} cellules` : '📍 Cellule'}
                </div>
                {!isBulk && cellData?.label && (
                    <div className="text-xs text-gray-500">{cellData.label}</div>
                )}
            </div>

            {/* Mode normal: liste des actions */}
            {!showFieldList && (
                <div className="py-1">
                    {/* Copier */}
                    <button
                        onClick={() => { onCopy(); onClose(); }}
                        disabled={dataFields.length === 0}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
                    >
                        <span className="text-base">📋</span>
                        <span>Copier les données</span>
                        {dataFields.length > 0 && <span className="ml-auto text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{dataFields.length}</span>}
                    </button>

                    {/* Coller */}
                    <button
                        onClick={() => { onPaste(); onClose(); }}
                        disabled={!hasCopiedData}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
                    >
                        <span className="text-base">📄</span>
                        <span>Coller</span>
                        {hasCopiedData && <span className="ml-auto text-xs text-green-600">●</span>}
                    </button>

                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                    {/* Effacer des champs spécifiques */}
                    <button
                        onClick={() => setShowFieldList(true)}
                        disabled={dataFields.length === 0}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 transition-colors"
                    >
                        <span className="text-base">🗑️</span>
                        <span>Effacer des champs...</span>
                        <span className="ml-auto text-xs text-gray-400">{dataFields.length}</span>
                    </button>

                    {/* Effacer tout */}
                    <button
                        onClick={() => { onDeleteAll(); onClose(); }}
                        disabled={dataFields.length === 0}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 font-medium transition-colors"
                    >
                        <span className="text-base">💥</span>
                        <span>Tout effacer</span>
                        {isBulk && <span className="ml-auto text-xs">({targetCount})</span>}
                    </button>
                </div>
            )}

            {/* Mode sélection de champs */}
            {showFieldList && (
                <div>
                    {/* Header sélection */}
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800">
                        <button onClick={() => setShowFieldList(false)} className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors">
                            ← Retour
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={selectAllFields} className="text-xs text-blue-600 hover:text-blue-700">Tout</button>
                            <span className="text-gray-300">|</span>
                            <button onClick={deselectAllFields} className="text-xs text-gray-500 hover:text-gray-700">Aucun</button>
                            <span className="text-xs text-gray-400 ml-1">{selectedFieldsToDelete.length}/{dataFields.length}</span>
                        </div>
                    </div>

                    {/* Liste des champs avec valeurs */}
                    <div className="max-h-[280px] overflow-y-auto">
                        {dataFields.map(field => {
                            const def = getFieldDef(field);
                            const val = cellData[field];
                            const isSelected = selectedFieldsToDelete.includes(field);

                            return (
                                <label key={field} className={`flex items-start gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 transition-colors ${isSelected ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                                    <input type="checkbox" checked={isSelected} onChange={() => toggleField(field)} className="mt-0.5 w-4 h-4 accent-red-600 rounded" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                            {getFieldLabel(field)}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {def?.type === 'multiselect' && Array.isArray(val) ? (
                                                val.length > 0 ? val.slice(0, 3).join(', ') + (val.length > 3 ? `... (+${val.length - 3})` : '') : '(vide)'
                                            ) : def?.type === 'slider' || def?.type === 'number' ? (
                                                <span className="font-mono">{val ?? '—'}{def.unit ? ` ${def.unit}` : ''}</span>
                                            ) : (
                                                String(val ?? '(vide)').slice(0, 30)
                                            )}
                                        </div>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    {/* Actions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-2 flex gap-2 bg-gray-50 dark:bg-gray-800">
                        <button onClick={() => setShowFieldList(false)} className="flex-1 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors">
                            Annuler
                        </button>
                        <button onClick={handleDeleteSelectedFields} disabled={selectedFieldsToDelete.length === 0} className="flex-1 px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                            Effacer ({selectedFieldsToDelete.length})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // Render via portal to avoid clipping from parent containers with overflow
    return createPortal(menuContent, document.body);
