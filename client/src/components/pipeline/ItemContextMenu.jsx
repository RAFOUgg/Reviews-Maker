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

import { useState, useEffect, useRef } from 'react';
import { Settings, X, Check } from 'lucide-react';

const ItemContextMenu = ({ item, position, onClose, onConfigure, isConfigured }) => {
    const [value, setValue] = useState(item.defaultValue || '');
    const menuRef = useRef(null);

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
            className="fixed z-[9999] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-purple-500 p-4 min-w-[280px]"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                animation: 'fadeIn 0.15s ease-out'
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
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
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
                            className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
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
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder={item.placeholder || 'Entrer une valeur...'}
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
