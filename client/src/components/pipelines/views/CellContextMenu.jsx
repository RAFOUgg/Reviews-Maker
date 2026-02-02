/**
 * CellContextMenu - Menu contextuel pour les cellules de pipeline
 * Liquid Glass UI Design System
 * Utilise React Portal pour éviter le clipping
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ClipboardPaste, Trash2, Eraser, ChevronLeft, Check, X } from 'lucide-react';

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

    useEffect(() => {
        setShowFieldList(false);
        setSelectedFieldsToDelete([]);
        setIsVisible(false);
    }, [cellTimestamp, isOpen]);

    useLayoutEffect(() => {
        if (!isOpen || !menuRef.current) return;

        const positionMenu = () => {
            const menu = menuRef.current;
            if (!menu) return;

            const rect = menu.getBoundingClientRect();
            const m = 8;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let x = position.x + 4;
            let y = position.y + 4;

            if (x + rect.width > vw - m) {
                x = Math.max(m, position.x - rect.width - 4);
            }
            x = Math.max(m, Math.min(x, vw - rect.width - m));

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

    const dataFields = cellData ? Object.keys(cellData).filter(k =>
        !['timestamp', 'label', 'date', 'phase', 'week', 'day', 'hours', 'seconds', '_meta'].includes(k)
    ) : [];

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

    const menuContent = (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-[#0f0f1a]/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
            style={{
                width: '280px',
                maxWidth: 'calc(100vw - 16px)',
                maxHeight: 'calc(100vh - 16px)',
                pointerEvents: 'auto',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                <div className="text-sm font-semibold text-white">
                    {isBulk ? `📦 ${targetCount} cellules` : '📍 Cellule'}
                </div>
                {!isBulk && cellData?.label && (
                    <div className="text-xs text-white/50 mt-0.5">{cellData.label}</div>
                )}
            </div>

            {/* Mode normal: liste des actions */}
            {!showFieldList && (
                <div className="py-2">
                    {/* Copier */}
                    <button
                        onClick={() => { onCopy(); onClose(); }}
                        disabled={dataFields.length === 0}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 transition-colors text-white/80 hover:text-white"
                    >
                        <Copy className="w-4 h-4 text-violet-400" />
                        <span>Copier les données</span>
                        {dataFields.length > 0 && (
                            <span className="ml-auto text-xs text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
                                {dataFields.length}
                            </span>
                        )}
                    </button>

                    {/* Coller */}
                    <button
                        onClick={() => { onPaste(); onClose(); }}
                        disabled={!hasCopiedData}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 transition-colors text-white/80 hover:text-white"
                    >
                        <ClipboardPaste className="w-4 h-4 text-blue-400" />
                        <span>Coller</span>
                        {hasCopiedData && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                        )}
                    </button>

                    <div className="h-px bg-white/10 my-2 mx-4" />

                    {/* Effacer des champs spécifiques */}
                    <button
                        onClick={() => setShowFieldList(true)}
                        disabled={dataFields.length === 0}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 transition-colors text-white/80 hover:text-white"
                    >
                        <Eraser className="w-4 h-4 text-amber-400" />
                        <span>Effacer des champs...</span>
                        <span className="ml-auto text-xs text-white/40">{dataFields.length}</span>
                    </button>

                    {/* Effacer tout */}
                    <button
                        onClick={() => { onDeleteAll(); onClose(); }}
                        disabled={dataFields.length === 0}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Tout effacer</span>
                        {isBulk && <span className="ml-auto text-xs">({targetCount})</span>}
                    </button>
                </div>
            )}

            {/* Mode sélection de champs */}
            {showFieldList && (
                <div>
                    {/* Header sélection */}
                    <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between bg-white/5">
                        <button
                            onClick={() => setShowFieldList(false)}
                            className="text-xs text-white/60 hover:text-white flex items-center gap-1 transition-colors"
                        >
                            <ChevronLeft className="w-3 h-3" />
                            Retour
                        </button>
                        <div className="flex items-center gap-2">
                            <button onClick={selectAllFields} className="text-xs text-violet-400 hover:text-violet-300">Tout</button>
                            <span className="text-white/20">|</span>
                            <button onClick={deselectAllFields} className="text-xs text-white/50 hover:text-white/80">Aucun</button>
                            <span className="text-xs text-white/40 ml-1">{selectedFieldsToDelete.length}/{dataFields.length}</span>
                        </div>
                    </div>

                    {/* Liste des champs */}
                    <div className="max-h-[280px] overflow-y-auto">
                        {dataFields.map(field => {
                            const def = getFieldDef(field);
                            const val = cellData[field];
                            const isSelected = selectedFieldsToDelete.includes(field);

                            return (
                                <label
                                    key={field}
                                    className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors ${isSelected ? 'bg-red-500/10' : ''
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleField(field)}
                                        className="mt-0.5 w-4 h-4 accent-red-500 rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {getFieldLabel(field)}
                                        </div>
                                        <div className="text-xs text-white/40 truncate mt-0.5">
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
                    <div className="border-t border-white/10 p-3 flex gap-2 bg-white/5">
                        <button
                            onClick={() => setShowFieldList(false)}
                            className="flex-1 px-3 py-2 text-sm bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Annuler
                        </button>
                        <button
                            onClick={handleDeleteSelectedFields}
                            disabled={selectedFieldsToDelete.length === 0}
                            className="flex-1 px-3 py-2 text-sm bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Effacer ({selectedFieldsToDelete.length})
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );

    return createPortal(
        <AnimatePresence>{menuContent}</AnimatePresence>,
        document.body
    );
}

export default CellContextMenu;


