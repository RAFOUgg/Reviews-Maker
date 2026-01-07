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

const ItemContextMenu = ({ item, position, anchorRect, onClose, onConfigure, isConfigured, cells = [], onAssignNow, onAssignFromSource, onAssignRange, onAssignAll }) => {
    const [value, setValue] = useState(item.defaultValue || '');
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

    // Positionner le menu intelligemment dans le conteneur
    useLayoutEffect(() => {
        const el = menuRef.current;
        if (!el) return;
        const menuRect = el.getBoundingClientRect();
        const margin = 8;
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        let x = position?.x ?? 16;
        let y = position?.y ?? 16;

        // Chercher le conteneur parent (panneau latéral)
        let containerRect = {
            left: 0,
            top: 0,
            right: winW,
            bottom: winH
        };

        let parent = el.parentElement;
        while (parent && parent !== document.body) {
            const style = window.getComputedStyle(parent);
            const overflowY = style.overflowY;

            // Si on trouve le panneau latéral avec scroll
            if (overflowY === 'auto' || overflowY === 'scroll' || parent.classList.contains('overflow-y-auto')) {
                const rect = parent.getBoundingClientRect();
                containerRect = {
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom
                };
                break;
            }
            parent = parent.parentElement;
        }

        if (anchorRect) {
            // Centrer horizontalement sur l'élément ancre
            x = Math.round(anchorRect.left + anchorRect.width / 2 - menuRect.width / 2);
            // Essayer d'afficher au-dessus
            if (anchorRect.top - menuRect.height - margin > containerRect.top) {
                y = Math.round(anchorRect.top - menuRect.height - 8);
            } else {
                // Placer en dessous
                y = Math.round(anchorRect.bottom + 8);
            }
        }

        // Ajuster pour rester dans le conteneur
        if (x + menuRect.width + margin > containerRect.right) {
            x = Math.max(containerRect.left + margin, containerRect.right - menuRect.width - margin);
        }
        if (x < containerRect.left + margin) {
            x = containerRect.left + margin;
        }
        if (y + menuRect.height + margin > containerRect.bottom) {
            y = Math.max(containerRect.top + margin, containerRect.bottom - menuRect.height - margin);
        }
        if (y < containerRect.top + margin) {
            y = containerRect.top + margin;
        }

        setAdjustedPos({ x, y });
    }, [position, anchorRect]);

    const handleSave = () => {
        onConfigure(item.key, value);
        onClose();
    };

    const handleClear = () => {
        onConfigure(item.key, null); // Supprimer la config
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 p-4 min-w-[320px] text-gray-900 dark:text-white"
            style={{
                left: `${adjustedPos.x}px`,
                top: `${adjustedPos.y}px`,
                animation: 'fadeIn 0.15s ease-out',
                maxWidth: 'calc(100vw - 24px)'
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 dark:" />
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
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.label}
                    </span>
                </div>

                {/* Formulaire selon type */}
                {item.type === 'select' ? (
                    <select
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:"
                        autoFocus
                    >
                        <option value="">-- Sélectionner --</option>
                        {item.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                ) : item.type === 'number' ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min={item.min}
                            max={item.max}
                            step={item.step || 1}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:"
                            placeholder={`${item.min || 0} - ${item.max || 100}`}
                            autoFocus
                        />
                        {item.unit && (
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {item.unit}
                            </span>
                        )}
                    </div>
                ) : (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:"
                        placeholder={item.placeholder || 'Entrer une valeur...'}
                        autoFocus
                    />
                )}
            </div>

            {/* Aide visuelle */}
            <div className="mb-3 p-2 dark: rounded-lg">
                <p className="text-xs dark:">
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
                            onAssignNow?.(item.key, value);
                            onClose();
                        }}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${!value && value !== 0 ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : ' hover: text-white'}`}
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
                                    onAssignFromSource?.(item.key, selectedSource);
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
                            onAssignRange?.(item.key, selectedSource, end, value || item.defaultValue || '');
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
                            // Assign to all
                            onAssignAll?.(item.key, value || item.defaultValue || '');
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
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1 ${!value && value !== 0 ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r hover: hover: text-white shadow-lg hover:shadow-xl'}`}
                >
                    <Check className="w-3 h-3" />
                    {isConfigured ? 'Mettre à jour' : 'Pré-configurer'}
                </button>
            </div>
        </div>
    );
};

export default ItemContextMenu;
