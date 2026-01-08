/**
 * ItemContextMenu - Menu contextuel compact et responsive
 * Toujours 100% visible dans le viewport, adapté au type de donnée
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { X, Check, Plus, Minus } from 'lucide-react';

const ItemContextMenu = ({ item, position, anchorRect, onClose, onConfigure, isConfigured, cells = [], onAssignNow, onAssignFromSource, onAssignRange, onAssignAll }) => {
    const [value, setValue] = useState(item.defaultValue || '');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const menuRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

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

    // Positionnement intelligent - TOUJOURS dans le viewport
    useLayoutEffect(() => {
        const el = menuRef.current;
        if (!el) return;

        const positionMenu = () => {
            const rect = el.getBoundingClientRect();
            const m = 8; // marge
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const maxW = Math.min(300, vw - m * 2);
            const maxH = vh - m * 2;

            let x = position?.x ?? vw / 2;
            let y = position?.y ?? vh / 2;
            if (anchorRect) {
                x = anchorRect.left + anchorRect.width / 2;
                y = anchorRect.bottom + 4;
            }

            // Centrer horizontalement
            x = x - Math.min(rect.width, maxW) / 2;
            // Contraintes strictes
            x = Math.max(m, Math.min(x, vw - Math.min(rect.width, maxW) - m));

            // Vertical
            if (y + Math.min(rect.height, maxH) > vh - m) {
                if (anchorRect && anchorRect.top - rect.height - 4 > m) {
                    y = anchorRect.top - rect.height - 4;
                } else {
                    y = vh - Math.min(rect.height, maxH) - m;
                }
            }
            y = Math.max(m, y);

            el.style.left = `${Math.round(x)}px`;
            el.style.top = `${Math.round(y)}px`;
            el.style.maxWidth = `${maxW}px`;
            el.style.maxHeight = `${maxH}px`;
            setIsVisible(true);
        };

        requestAnimationFrame(() => requestAnimationFrame(positionMenu));
    }, [position, anchorRect]);

    const itemKey = item.key || item.id;

    const handleSave = () => {
        if (value !== '' && value !== null && value !== undefined) {
            onConfigure(itemKey, value);
        }
        onClose();
    };

    const handleAssignAll = () => {
        if (value !== '' && value !== null && value !== undefined) {
            onAssignAll?.(itemKey, value);
        }
        onClose();
    };

    const handleAssignRange = () => {
        if (rangeStart && rangeEnd && (value !== '' && value !== null && value !== undefined)) {
            onAssignRange?.(itemKey, rangeStart, rangeEnd, value);
            onClose();
        }
    };

    // Input CSS commun
    const inputCls = "w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500";

    // Rendu du formulaire selon le type
    const renderInput = () => {
        // SELECT
        if (item.type === 'select' && Array.isArray(item.options)) {
            return (
                <select value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputCls} autoFocus>
                    <option value="">-- Choisir --</option>
                    {item.options.map((opt, i) => {
                        const v = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const l = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        return <option key={i} value={v}>{l}</option>;
                    })}
                </select>
            );
        }

        // MULTISELECT
        if (item.type === 'multiselect' && Array.isArray(item.options)) {
            const sel = Array.isArray(value) ? value : [];
            return (
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-gray-50 dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
                    {item.options.slice(0, 15).map((opt, i) => {
                        const v = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const l = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const checked = sel.includes(v);
                        return (
                            <label key={i} className={`text-xs px-1.5 py-0.5 rounded cursor-pointer border ${checked ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-400' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'}`}>
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
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setValue(Math.max(min, (num || min) - step))} className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        <Minus className="w-3 h-3" />
                    </button>
                    <input type="number" min={min} max={max} step={step} value={num} onChange={(e) => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`${inputCls} flex-1 text-center`} autoFocus />
                    <button type="button" onClick={() => setValue(Math.min(max, (num || min) + step))} className="p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        <Plus className="w-3 h-3" />
                    </button>
                    {item.unit && <span className="text-xs text-gray-500 ml-1">{item.unit}</span>}
                </div>
            );
        }

        // DATE
        if (item.type === 'date') {
            return <input type="date" value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputCls} autoFocus />;
        }

        // CHECKBOX
        if (item.type === 'checkbox' || item.type === 'boolean') {
            return (
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={Boolean(value)} onChange={(e) => setValue(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-purple-600" />
                    <span className="text-sm">{value ? 'Activé' : 'Désactivé'}</span>
                </label>
            );
        }

        // DIMENSIONS
        if (item.type === 'dimensions') {
            const dims = typeof value === 'object' && value ? value : { length: '', width: '', height: '' };
            return (
                <div className="grid grid-cols-3 gap-1">
                    {['length', 'width', 'height'].map((k, i) => (
                        <input key={k} type="number" placeholder={['L', 'l', 'H'][i]} value={dims[k] || ''} onChange={(e) => setValue({ ...dims, [k]: e.target.value === '' ? '' : parseFloat(e.target.value) })} className={`${inputCls} text-center`} min={0} />
                    ))}
                </div>
            );
        }

        // TEXT par défaut
        return <input type="text" value={value || ''} onChange={(e) => setValue(e.target.value)} className={inputCls} placeholder={item.placeholder || 'Valeur...'} autoFocus />;
    };

    const hasValue = value !== '' && value !== null && value !== undefined;

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.1s', width: 'max-content', minWidth: '220px' }}
        >
            {/* Header compact */}
            <div className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm flex-shrink-0">{item.icon}</span>
                    <span className="text-xs font-medium truncate">{item.label}</span>
                    {item.unit && <span className="text-xs text-gray-400">({item.unit})</span>}
                </div>
                <button onClick={onClose} className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex-shrink-0">
                    <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
            </div>

            {/* Contenu */}
            <div className="p-2.5 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                {/* Input */}
                <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Valeur</label>
                    {renderInput()}
                </div>

                {/* Boutons principaux */}
                <div className="flex gap-1.5">
                    <button onClick={handleSave} disabled={!hasValue} className="flex-1 px-2 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded transition-colors flex items-center justify-center gap-1">
                        <Check className="w-3 h-3" />
                        Pré-config
                    </button>
                    {isConfigured && (
                        <button onClick={() => { onConfigure(itemKey, null); onClose(); }} className="px-2 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded" title="Retirer config">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Assignation (si cells disponibles) */}
                {cells.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Assigner à</label>
                        <div className="flex gap-1 flex-wrap">
                            <select value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="flex-1 min-w-[70px] px-1.5 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                                <option value="">Début</option>
                                {cells.map((c) => <option key={c.timestamp} value={c.timestamp}>{c.label}</option>)}
                            </select>
                            <select value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="flex-1 min-w-[70px] px-1.5 py-1 text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                                <option value="">Fin</option>
                                {cells.map((c) => <option key={c.timestamp} value={c.timestamp}>{c.label}</option>)}
                            </select>
                            <button onClick={handleAssignRange} disabled={!rangeStart || !rangeEnd || !hasValue} className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded" title="Assigner à la plage">
                                OK
                            </button>
                            <button onClick={handleAssignAll} disabled={!hasValue} className="px-2 py-1 text-xs font-medium bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded" title="Assigner à toutes">
                                Tous
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemContextMenu;
