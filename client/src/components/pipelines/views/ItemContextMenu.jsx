/**
 * ItemContextMenu - Menu contextuel pour pré-configuration des items pipeline
 * Liquid Glass UI Design System
 * Rendu via React Portal pour éviter le clipping parent overflow
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Zap } from 'lucide-react';
import { LiquidButton, LiquidSelect, LiquidInput } from '@/components/ui/LiquidUI';

const ItemContextMenu = ({
    item,
    position,
    anchorRect,
    onClose,
    isConfigured,
    cells = [],
    onAssignNow,
    onAssignRange,
    onAssignAll
}) => {
    const [value, setValue] = useState(item.defaultValue || '');
    const [rangeStart, setRangeStart] = useState('');
    const [rangeEnd, setRangeEnd] = useState('');
    const menuRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

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

    useLayoutEffect(() => {
        const el = menuRef.current;
        if (!el) return;

        const positionMenu = () => {
            const rect = el.getBoundingClientRect();
            const m = 8;
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let x = position?.x ?? (anchorRect ? anchorRect.right + 4 : vw / 2);
            let y = position?.y ?? (anchorRect ? anchorRect.top : vh / 2);

            if (x + rect.width > vw - m) {
                x = Math.max(m, (position?.x || anchorRect?.left || vw) - rect.width - 4);
            }
            x = Math.max(m, Math.min(x, vw - rect.width - m));

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

    const renderInput = () => {
        // SELECT
        if (item.type === 'select' && Array.isArray(item.options)) {
            return (
                <select
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white/5 border border-white/20 rounded-xl text-white focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    autoFocus
                >
                    <option value="" className="bg-[#0f0f1a]">-- Sélectionner --</option>
                    {item.options.map((opt, i) => {
                        const v = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const l = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const icon = typeof opt === 'object' ? opt.icon : '';
                        return <option key={i} value={v} className="bg-[#0f0f1a]">{icon ? `${icon} ` : ''}{l}</option>;
                    })}
                </select>
            );
        }

        // MULTISELECT
        if (item.type === 'multiselect' && Array.isArray(item.options)) {
            const sel = Array.isArray(value) ? value : [];
            return (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10">
                    {item.options.map((opt, i) => {
                        const v = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const l = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const checked = sel.includes(v);
                        return (
                            <label
                                key={i}
                                className={`text-xs px-2 py-1 rounded-lg cursor-pointer border transition-all ${checked
                                        ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                                        : 'bg-white/5 border-white/10 text-white/60 hover:border-violet-500/30'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => setValue(e.target.checked ? [...sel, v] : sel.filter(x => x !== v))}
                                    className="sr-only"
                                />
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
                        <button
                            type="button"
                            onClick={() => setValue(Math.max(min, (num || min) - step))}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/15 transition-colors text-white"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <input
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={num}
                            onChange={(e) => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="flex-1 text-center px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white font-mono"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setValue(Math.min(max, (num || min) + step))}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/15 transition-colors text-white"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        {item.unit && <span className="text-sm text-white/50 font-medium">{item.unit}</span>}
                    </div>
                    {item.type === 'slider' && (
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={num || min}
                            onChange={(e) => setValue(parseFloat(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                        />
                    )}
                </div>
            );
        }

        // DATE
        if (item.type === 'date') {
            return (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white"
                    autoFocus
                />
            );
        }

        // CHECKBOX / BOOLEAN
        if (item.type === 'checkbox' || item.type === 'boolean') {
            return (
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => setValue(e.target.checked)}
                        className="w-5 h-5 rounded border-white/30 text-violet-500 focus:ring-violet-500"
                    />
                    <span className="text-sm font-medium text-white">{value ? '✓ Activé' : '✗ Désactivé'}</span>
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
                                <label className="text-xs text-white/50 mb-1 block">{label}</label>
                                <input
                                    type="number"
                                    value={dims[k] || ''}
                                    onChange={(e) => setValue({ ...dims, [k]: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                    className="w-full px-2 py-1.5 bg-white/5 border border-white/20 rounded-lg text-white text-center text-sm"
                                    min={0}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="text-xs text-white/40 text-center">{item.unit || 'cm'}</div>
                </div>
            );
        }

        // TEXTAREA
        if (item.type === 'textarea') {
            return (
                <textarea
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white resize-none"
                    rows={3}
                    placeholder={item.placeholder || 'Description...'}
                    autoFocus
                />
            );
        }

        // TEXT par défaut
        return (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white"
                placeholder={item.placeholder || 'Entrer une valeur...'}
                autoFocus
            />
        );
    };

    const menuContent = (
        <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-[#0f0f1a]/95 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
            style={{
                width: '340px',
                maxWidth: 'calc(100vw - 16px)',
                maxHeight: 'calc(100vh - 16px)',
                pointerEvents: 'auto',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.4)'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-lg">{item.icon}</span>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold truncate text-white">{item.label}</div>
                        {item.unit && <div className="text-xs text-white/40">Unité: {item.unit}</div>}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-white/50" />
                </button>
            </div>

            {/* Tabs si cells disponibles */}
            {cells.length > 0 && (
                <div className="flex border-b border-white/10">
                    <button className="flex-1 px-4 py-2.5 text-xs font-medium text-violet-400 border-b-2 border-violet-500 bg-violet-500/10">
                        <Zap className="w-3.5 h-3.5 inline mr-1" />Assigner
                    </button>
                </div>
            )}

            {/* Contenu - Assignation */}
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                {cells.length > 0 && (
                    <div className="space-y-4">
                        {/* Valeur à assigner */}
                        <div>
                            <label className="block text-xs font-medium text-white/60 mb-2">
                                Valeur à assigner
                            </label>
                            {renderInput()}
                        </div>

                        {/* Assigner à une plage */}
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-3">
                            <label className="block text-xs font-medium text-white">
                                📍 Assigner à une plage
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={rangeStart}
                                    onChange={(e) => setRangeStart(e.target.value)}
                                    className="px-2 py-1.5 text-xs bg-white/5 border border-white/20 rounded-lg text-white"
                                >
                                    <option value="" className="bg-[#0f0f1a]">De...</option>
                                    {cells.map((c) => <option key={c.timestamp} value={c.timestamp} className="bg-[#0f0f1a]">{c.label}</option>)}
                                </select>
                                <select
                                    value={rangeEnd}
                                    onChange={(e) => setRangeEnd(e.target.value)}
                                    className="px-2 py-1.5 text-xs bg-white/5 border border-white/20 rounded-lg text-white"
                                >
                                    <option value="" className="bg-[#0f0f1a]">À...</option>
                                    {cells.map((c) => <option key={c.timestamp} value={c.timestamp} className="bg-[#0f0f1a]">{c.label}</option>)}
                                </select>
                            </div>
                            <button
                                onClick={handleAssignRange}
                                disabled={!rangeStart || !rangeEnd || !hasValue}
                                className={`w-full px-3 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${rangeStart && rangeEnd && hasValue
                                        ? 'bg-blue-500/20 border border-blue-500/50 text-blue-300 hover:bg-blue-500/30'
                                        : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                Assigner à la plage
                            </button>
                        </div>

                        {/* Assigner à toutes */}
                        <button
                            onClick={handleAssignAll}
                            disabled={!hasValue}
                            className={`w-full px-3 py-2.5 text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${hasValue
                                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                                    : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            <Zap className="w-3.5 h-3.5" />
                            Assigner à toutes les cellules
                        </button>
                    </div>
                )}

                {/* Si pas de cells, afficher message */}
                {cells.length === 0 && (
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-white/50 text-center">
                        Sélectionnez des cellules pour assigner des valeurs
                    </div>
                )}
            </div>
        </motion.div>
    );

    return createPortal(menuContent, document.body);
};

export default ItemContextMenu;


