/**
 * ItemContextMenu - Menu contextuel pour pré-configuration des items pipeline
 * Position naturelle à côté du clic, responsive, fonctionnel
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X, Check, Plus, Minus, Copy, Clipboard, Zap } from 'lucide-react';

const ItemContextMenu = ({ item, position, anchorRect, onClose, onConfigure, isConfigured, cells = [], onAssignNow, onAssignFromSource, onAssignRange, onAssignAll, selectedCells = [] }) => {
    const [value, setValue] = useState(item.defaultValue || '');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const [copySource, setCopySource] = useState('');
    const menuRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const hasSelection = selectedCells && selectedCells.length > 0;

    // Fermer au clic extérieur ou Escape
    useEffect(() => {
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
    }, [onClose]);

    // Positionnement naturel - à côté du clic comme un vrai menu contextuel
    useLayoutEffect(() => {
        const el = menuRef.current;
        if (!el) return;

        const positionMenu = () => {
            const rect = el.getBoundingClientRect();
            const m = 8;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            // Position de départ = point de clic
            let x = position?.x ?? (anchorRect ? anchorRect.right + 4 : vw / 2);
            let y = position?.y ?? (anchorRect ? anchorRect.top : vh / 2);

            // Ajustement horizontal : préférer à droite, sinon à gauche
            if (x + rect.width > vw - m) {
                x = Math.max(m, (position?.x || anchorRect?.left || vw) - rect.width - 4);
            }
            x = Math.max(m, Math.min(x, vw - rect.width - m));

            // Ajustement vertical : rester dans le viewport
            if (y + rect.height > vh - m) {
                y = vh - rect.height - m;
            }
            y = Math.max(m, y);

            el.style.left = `${Math.round(x)}px`;
            el.style.top = `${Math.round(y)}px`;
            setIsVisible(true);
        };

        requestAnimationFrame(() => requestAnimationFrame(positionMenu));
    }, [position, anchorRect]);

    const itemKey = item.key || item.id;
    const hasValue = value !== '' && value !== null && value !== undefined;

    const handleAssignAll = () => {
        if (hasValue) onAssignAll?.(itemKey, value);
        onClose();
    };

    const handleAssignRange = () => {
        if (rangeStart && rangeEnd && hasValue) {
            onAssignRange?.(itemKey, rangeStart, rangeEnd, value);
            onClose();
        }
    };

    const handleCopyFrom = () => {
        if (copySource) {
            onAssignFromSource?.(itemKey, copySource);
            onClose();
        }
    };

    // CSS commun
    const inputCls = "w-full px-2.5 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all";
    const btnCls = "px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5";

    // Rendu du formulaire selon le type
    const renderInput = () => {
        // SELECT
        if (item.type === 'select' && Array.isArray(item.options)) {
            return (
                <select value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputCls} autoFocus>
                    <option value="">-- Sélectionner --</option>
                    {item.options.map((opt, i) => {
                        const v = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const l = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const icon = typeof opt === 'object' ? opt.icon : '';
                        return <option key={i} value={v}>{icon ? `${icon} ` : ''}{l}</option>;
                    })}
                </select>
            );
        }

        // MULTISELECT
        if (item.type === 'multiselect' && Array.isArray(item.options)) {
            const sel = Array.isArray(value) ? value : [];
            return (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600">
                    {item.options.map((opt, i) => {
                        const v = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const l = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const checked = sel.includes(v);
                        return (
                            <label key={i} className={`text-xs px-2 py-1 rounded-md cursor-pointer border transition-all ${checked ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-400 text-purple-700 dark:text-purple-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-300'}`}>
                                <input type="checkbox" checked={checked} onChange={(e) => setValue(e.target.checked ? [...sel, v] : sel.filter(x => x !== v))} className="sr-only" />
                                {l}
                            </label>
                        );
                    })}
                </div>
            );
        }

        // NUMBER / SLIDER / STEPPER
        if (item.type === 'number' || item.type === 'slider' || item.type === 'stepper') {
            const num = value === '' ? '' : Number(value);
            const step = item.step || 1;
            const min = item.min ?? 0;
            const max = item.max ?? 9999;
            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setValue(Math.max(min, (num || min) - step))} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <Minus className="w-4 h-4" />
                        </button>
                        <input type="number" min={min} max={max} step={step} value={num} onChange={(e) => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`${inputCls} flex-1 text-center font-mono`} autoFocus />
                        <button type="button" onClick={() => setValue(Math.min(max, (num || min) + step))} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <Plus className="w-4 h-4" />
                        </button>
                        {item.unit && <span className="text-sm text-gray-500 font-medium">{item.unit}</span>}
                    </div>
                    {item.type === 'slider' && (
                        <input type="range" min={min} max={max} step={step} value={num || min} onChange={(e) => setValue(parseFloat(e.target.value))} className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                    )}
                </div>
            );
        }

        // DATE
        if (item.type === 'date') {
            return <input type="date" value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputCls} autoFocus />;
        }

        // CHECKBOX / BOOLEAN
        if (item.type === 'checkbox' || item.type === 'boolean') {
            return (
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input type="checkbox" checked={Boolean(value)} onChange={(e) => setValue(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="text-sm font-medium">{value ? '✓ Activé' : '✗ Désactivé'}</span>
                </label>
            );
        }

        // DIMENSIONS
        if (item.type === 'dimensions') {
            const dims = typeof value === 'object' && value ? value : { length: '', width: '', height: '' };
            return (
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        {[['length', 'L'], ['width', 'l'], ['height', 'H']].map(([k, label]) => (
                            <div key={k}>
                                <label className="text-xs text-gray-500 mb-1 block">{label}</label>
                                <input type="number" value={dims[k] || ''} onChange={(e) => setValue({ ...dims, [k]: e.target.value === '' ? '' : parseFloat(e.target.value) })} className={`${inputCls} text-center`} min={0} />
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-gray-500 text-center">{item.unit || 'cm'}</div>
                </div>
            );
        }

        // TEXTAREA
        if (item.type === 'textarea') {
            return <textarea value={value || ''} onChange={(e) => setValue(e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder={item.placeholder || 'Description...'} autoFocus />;
        }

        // TEXT par défaut
        return <input type="text" value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputCls} placeholder={item.placeholder || 'Entrer une valeur...'} autoFocus />;
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.15s ease-out', width: '320px', maxWidth: 'calc(100vw - 16px)', maxHeight: 'calc(100vh - 16px)' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{item.icon}</span>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-gray-900 dark:text-white">{item.label}</div>
                        {item.unit && <div className="text-xs text-gray-500">Unité: {item.unit}</div>}
                    </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            {/* Tabs si cells disponibles */}
            {cells.length > 0 && (
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button className={`flex-1 px-3 py-2 text-xs font-medium transition-colors text-purple-600 border-b-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20`}>
                        <Zap className="w-3.5 h-3.5 inline mr-1" />Assigner
                    </button>
                </div>
            )}

            {/* Contenu - Assignation */}
            <div className="p-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                {cells.length > 0 && (
                    <div className="space-y-4">
                        {/* Valeur à assigner */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                Valeur à assigner
                            </label>
                            {renderInput()}
                        </div>

                        {/* Bouton Assigner - à la sélection ou à toutes les cellules */}
                        <div className={`p-2 rounded-lg ${hasSelection ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'}`}>
                            <div className="text-xs font-medium mb-2 flex items-center gap-1">
                                {hasSelection ? (
                                    <><span>✓</span> <span className="text-blue-700 dark:text-blue-300">{selectedCells.length} cellule(s) sélectionnée(s)</span></>
                                ) : (
                                    <><span>⚠️</span> <span className="text-orange-700 dark:text-orange-300">Aucune sélection</span></>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    if (hasValue) {
                                        if (hasSelection) {
                                            onAssignNow?.(itemKey, value);
                                        } else {
                                            onAssignAll?.(itemKey, value);
                                        }
                                    }
                                    onClose();
                                }}
                                disabled={!hasValue}
                                className={`${btnCls} w-full ${hasValue ? (hasSelection ? 'bg-blue-600 hover:bg-blue-700' : 'bg-orange-600 hover:bg-orange-700') + ' text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                {hasSelection ? `Assigner à ${selectedCells.length} cellule(s)` : 'Assigner à toutes'}
                            </button>
                        </div>

                        <div className="h-px bg-gray-200 dark:bg-gray-700" />

                        {/* Assigner à une plage */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                📍 Assigner à une plage
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <select value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option value="">De...</option>
                                    {cells.map((c) => <option key={c.timestamp} value={c.timestamp}>{c.label}</option>)}
                                </select>
                                <select value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option value="">À...</option>
                                    {cells.map((c) => <option key={c.timestamp} value={c.timestamp}>{c.label}</option>)}
                                </select>
                            </div>
                            <button onClick={handleAssignRange} disabled={!rangeStart || !rangeEnd || !hasValue} className={`${btnCls} w-full ${rangeStart && rangeEnd && hasValue ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                                Assigner à la plage
                            </button>
                        </div>

                        {/* Copier depuis une cellule */}
                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                <Copy className="w-3.5 h-3.5 inline mr-1" />Copier depuis
                            </label>
                            <div className="flex gap-2">
                                <select value={copySource} onChange={(e) => setCopySource(e.target.value)} className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                                    <option value="">Choisir une cellule...</option>
                                    {cells.map((c) => <option key={c.timestamp} value={c.timestamp}>{c.label}</option>)}
                                </select>
                                <button onClick={handleCopyFrom} disabled={!copySource} className={`${btnCls} ${copySource ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                                    <Clipboard className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Assigner à toutes */}
                        <button onClick={handleAssignAll} disabled={!hasValue} className={`${btnCls} w-full ${hasValue ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
                            <Zap className="w-3.5 h-3.5" />
                            Assigner à toutes les cellules
                        </button>
                    </div>
                )}

                {/* Si pas de cells, afficher message */}
                {cells.length === 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400 text-center">
                        Sélectionnez des cellules pour assigner des valeurs
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemContextMenu;
