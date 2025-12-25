/**
 * ItemContextMenu - Menu contextuel clic droit sur items panneau pipeline
 * 
 * Fonctionnalités:
 * - Clic droit sur item → Menu "Pré-configurer"
 * - Mini formulaire saisie valeur
 * - Sauvegarde valeur pré-configurée
 * - Badge visuel sur items configurés
 * - Drag & drop item configuré → assignment direct
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Settings, X, Check } from 'lucide-react';

const ItemContextMenu = ({ item, items = [], position, anchorRect, onClose, onConfigure, isConfigured, cells = [], onAssignNow, onAssignFromSource, onAssignRange, onAssignAll }) => {
    // Support single item (`item`) or multiple selected items (`items`)
    const targets = (items && items.length > 0) ? items : (item ? [item] : []);
    const primary = targets[0] || {};
    const [value, setValue] = useState(primary.defaultValue || '');
    const [selectedSource, setSelectedSource] = useState('');
    const menuRef = useRef(null);
    const [adjustedPos, setAdjustedPos] = useState({ x: position.x, y: position.y });

    useEffect(() => {
        // Fermer au clic extérieur
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Positionner le menu centré sur l'anchorRect si fourni, sinon utiliser position
    useLayoutEffect(() => {
        const el = menuRef.current;
        if (!el) return;
        const menuRect = el.getBoundingClientRect();
        const margin = 8;
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        let x = position?.x ?? 16;
        let y = position?.y ?? 16;

        if (anchorRect) {
            // Center horizontally over the anchor element and place above if there's space, otherwise below
            x = Math.round(anchorRect.left + anchorRect.width / 2 - menuRect.width / 2);
            // Try to show above
            if (anchorRect.top - menuRect.height - margin > 0) {
                y = Math.round(anchorRect.top - menuRect.height - 8);
            } else {
                // Place below
                y = Math.round(anchorRect.bottom + 8);
            }
        }

        // Clamp
        if (x + menuRect.width + margin > winW) x = Math.max(margin, winW - menuRect.width - margin);
        if (x < margin) x = margin;
        if (y + menuRect.height + margin > winH) y = Math.max(margin, winH - menuRect.height - margin);
        if (y < margin) y = margin;

        setAdjustedPos({ x, y });
    }, [position, anchorRect, primary]);

    const handleSave = () => {
        // Apply same value to all targets
        targets.forEach((t) => {
            onConfigure?.(t.key, value);
        });
        onClose();
    };

    const handleClear = () => {
        targets.forEach((t) => onConfigure?.(t.key, null));
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-purple-700 p-4 min-w-[320px] text-gray-900 dark:text-white"
            style={{
                left: `${adjustedPos.x}px`,
                top: `${adjustedPos.y}px`,
                animation: 'fadeIn 0.15s ease-out',
                maxWidth: 'calc(100vw - 24px)'
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                        Pré-configurer
                    </h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{primary.icon}</span>
                    <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {targets.length > 1 ? `Sélection (${targets.length} éléments)` : primary.label}
                        </div>
                        {targets.length > 1 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">Applique la même valeur à tous les éléments sélectionnés</div>
                        )}
                    </div>
                </div>

                {/* If multiple targets are selected, prefer a unified input. Otherwise show type-specific form. */}
                {targets.length > 1 ? (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder={'Entrer une valeur à appliquer à tous...'}
                        autoFocus
                    />
                ) : primary.type === 'select' ? (
                    <select
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        autoFocus
                    >
                        <option value="">-- Sélectionner --</option>
                        {primary.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : primary.type === 'number' ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={primary.min}
                            max={primary.max}
                            step={primary.step || 1}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                            placeholder={`${primary.min || 0} - ${primary.max || 100}`}
                            autoFocus
                        />
                        {primary.unit && (
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {primary.unit}
                            </span>
                        )}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder={primary.placeholder || 'Entrer une valeur...'}
                        autoFocus
                    />
                )}
            </div>

            {/* Aide visuelle */}
            <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-purple-800 dark:text-purple-300">
                    💡 Cette valeur sera assignée directement lors du drag & drop
                </p>
            </div>

            {/* Assign or copy actions */}
            <div className="mb-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Assigner maintenant</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if ((value === '' || value === null || value === undefined) && !isConfigured) {
                                alert('Veuillez saisir une valeur avant d\'assigner.');
                                return;
                            }
                            // For multiple targets, call assign for each
                            targets.forEach((t) => onAssignNow?.(t.key, value));
                            onClose();
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${!value && value !== 0
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                    >
                        Assigner maintenant
                    </button>

                    <div className="flex-1">
                        <label className="text-xs text-gray-500 mb-1 block">Copier depuis une case</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedSource}
                                onChange={(e) => setSelectedSource(e.target.value)}
                                className="flex-1 px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            >
                                <option value="">-- choisir une case --</option>
                                {cells.map((c) => (
                                    <option key={c.timestamp} value={c.timestamp}>{c.label || c.timestamp}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => {
                                        if (!selectedSource) { alert('Choisir une case source'); return; }
                                        // Copy for all targets from same source
                                        targets.forEach((t) => onAssignFromSource?.(t.key, selectedSource));
                                        onClose();
                                    }}
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                            >
                                Copier
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign to range / all / selected */}
            <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Assigner à :</label>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="px-2 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex-1"
                    >
                        <option value="">-- Début (sélectionner) --</option>
                        {cells.map((c) => (
                            <option key={`start-${c.timestamp}`} value={c.timestamp}>{c.label || c.timestamp}</option>
                        ))}
                    </select>

                    <select
                        value={''}
                        onChange={(e) => {
                            const end = e.target.value;
                            if (!selectedSource) { alert('Choisir d\'abord une case de début'); return; }
                            // Apply range assign for all targets
                            targets.forEach((t) => onAssignRange?.(t.key, selectedSource, end, value || t.defaultValue || ''));
                            onClose();
                        }}
                        className="px-2 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex-1"
                    >
                        <option value="">-- Fin (sélectionner) --</option>
                        {cells.map((c) => (
                            <option key={`end-${c.timestamp}`} value={c.timestamp}>{c.label || c.timestamp}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => {
                            // Assign to all selected targets
                            targets.forEach((t) => onAssignAll?.(t.key, value || t.defaultValue || ''));
                            onClose();
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                    >
                        Tous
                    </button>
                </div>
                <div className="mt-2 text-xs text-gray-500">Ou déposer directement sur une sélection de cases pour assigner.</div>
            </div>

            {/* Boutons actions */}
            <div className="flex gap-2">
                {isConfigured && (
                    <button
                        onClick={handleClear}
                        className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Retirer config
                    </button>
                )}
                <button
                    onClick={handleSave}
                    disabled={!value && value !== 0}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${!value && value !== 0
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl'
                        }`}
                >
                    <Check className="w-3 h-3" />
                    {isConfigured ? 'Mettre à jour' : 'Pré-configurer'}
                </button>
            </div>
        </div>
    );
};

export default ItemContextMenu;
