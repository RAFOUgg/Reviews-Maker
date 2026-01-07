/**
 * ItemContextMenu - Menu contextuel clic droit sur items panneau pipeline
 * 
 * Fonctionnalités:
 * - Clic droit sur item → Menu "Pré-configurer"
 * - Mini formulaire saisie valeur ADAPTÉ AU TYPE DE DONNÉE
 * - Sauvegarde valeur pré-configurée
 * - Badge visuel sur items configurés
 * - Drag & drop item configuré → assignment direct
 * 
 * Types supportés:
 * - select: Liste déroulante
 * - multiselect: Checkboxes multiples
 * - number/slider/stepper: Input numérique avec min/max
 * - date: Sélecteur de date
 * - checkbox: Case à cocher
 * - dimensions: Champs L×l×H
 * - text: Input texte (défaut)
 */

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Settings, X, Check, Plus, Minus } from 'lucide-react';

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

    // Positionner le menu intelligemment
    useLayoutEffect(() => {
        const el = menuRef.current;
        if (!el) return;

        const menuRect = el.getBoundingClientRect();
        const margin = 8;
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        let x = position?.x ?? 16;
        let y = position?.y ?? 16;

        // Ajustement horizontal simple
        if (x + menuRect.width > viewport.width - margin) {
            x = Math.max(margin, viewport.width - menuRect.width - margin);
        }
        if (x < margin) {
            x = margin;
        }

        // Ajustement vertical simple
        if (y + menuRect.height > viewport.height - margin) {
            y = Math.max(margin, viewport.height - menuRect.height - margin);
        }
        if (y < margin) {
            y = margin;
        }

        setAdjustedPos({ x, y });
    }, [position]);
    // Fonction de rendu des formulaires adaptés selon le type de donnée
    const renderFormInput = () => {
        const baseClass = "w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent";

        // SELECT - Liste déroulante
        if (item.type === 'select' && Array.isArray(item.options)) {
            return (
                <select
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    className={baseClass}
                    autoFocus
                >
                    <option value="">-- Sélectionner --</option>
                    {item.options.map((opt, idx) => {
                        const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const lab = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const icon = typeof opt === 'object' ? opt.icon : '';
                        return (
                            <option key={idx} value={val}>
                                {icon ? `${icon} ` : ''}{lab}
                            </option>
                        );
                    })}
                </select>
            );
        }

        // MULTISELECT - Checkboxes multiples
        if (item.type === 'multiselect' && Array.isArray(item.options)) {
            const selected = Array.isArray(value) ? value : [];
            return (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
                    {item.options.map((opt, idx) => {
                        const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const lab = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const icon = typeof opt === 'object' ? opt.icon : '';
                        const isChecked = selected.includes(val);
                        return (
                            <label
                                key={idx}
                                className={`inline-flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all ${isChecked
                                        ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-400 dark:border-purple-600 text-purple-700 dark:text-purple-300'
                                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                        const next = e.target.checked
                                            ? [...selected, val]
                                            : selected.filter(s => s !== val);
                                        setValue(next);
                                    }}
                                    className="sr-only"
                                />
                                {icon && <span>{icon}</span>}
                                <span>{lab}</span>
                            </label>
                        );
                    })}
                </div>
            );
        }

        // NUMBER / SLIDER / STEPPER - Input numérique avec contrôles
        if (item.type === 'number' || item.type === 'slider' || item.type === 'stepper') {
            const numValue = value === '' || value === null || value === undefined ? '' : Number(value);
            const step = item.step || 1;
            const min = item.min !== undefined ? item.min : 0;
            const max = item.max !== undefined ? item.max : 9999;

            return (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        {/* Bouton diminuer */}
                        <button
                            type="button"
                            onClick={() => {
                                const current = numValue === '' ? min : numValue;
                                const newVal = Math.max(min, current - step);
                                setValue(newVal);
                            }}
                            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>

                        {/* Input numérique */}
                        <input
                            type="number"
                            min={min}
                            max={max}
                            step={step}
                            value={numValue}
                            onChange={(e) => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className={`${baseClass} flex-1 text-center`}
                            placeholder={item.defaultValue !== undefined ? String(item.defaultValue) : `${min} - ${max}`}
                            autoFocus
                        />

                        {/* Bouton augmenter */}
                        <button
                            type="button"
                            onClick={() => {
                                const current = numValue === '' ? min : numValue;
                                const newVal = Math.min(max, current + step);
                                setValue(newVal);
                            }}
                            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>

                        {/* Unité */}
                        {item.unit && (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 min-w-[40px]">
                                {item.unit}
                            </span>
                        )}
                    </div>

                    {/* Slider visuel si type slider */}
                    {item.type === 'slider' && (
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            value={numValue || min}
                            onChange={(e) => setValue(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                    )}

                    {/* Suggestions si disponibles */}
                    {item.suggestions && item.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.suggestions.map((sug, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setValue(sug.value)}
                                    className={`text-xs px-2 py-1 rounded-md border transition-all ${numValue === sug.value
                                            ? 'bg-purple-100 dark:bg-purple-900/50 border-purple-400 text-purple-700 dark:text-purple-300'
                                            : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-purple-300'
                                        }`}
                                >
                                    {sug.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // DATE - Sélecteur de date
        if (item.type === 'date') {
            return (
                <input
                    type="date"
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    className={baseClass}
                    autoFocus
                />
            );
        }

        // CHECKBOX - Case à cocher
        if (item.type === 'checkbox' || item.type === 'boolean') {
            return (
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => setValue(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {value ? 'Activé' : 'Désactivé'}
                    </span>
                </label>
            );
        }

        // DIMENSIONS - Champs L×l×H
        if (item.type === 'dimensions') {
            const dims = typeof value === 'object' && value !== null
                ? value
                : { length: '', width: '', height: '' };

            return (
                <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Longueur</label>
                            <input
                                type="number"
                                value={dims.length || ''}
                                onChange={(e) => setValue({ ...dims, length: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                placeholder="L"
                                className={`${baseClass} text-center`}
                                min={0}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Largeur</label>
                            <input
                                type="number"
                                value={dims.width || ''}
                                onChange={(e) => setValue({ ...dims, width: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                placeholder="l"
                                className={`${baseClass} text-center`}
                                min={0}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Hauteur</label>
                            <input
                                type="number"
                                value={dims.height || ''}
                                onChange={(e) => setValue({ ...dims, height: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                                placeholder="H"
                                className={`${baseClass} text-center`}
                                min={0}
                            />
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {item.unit || 'cm'} (L × l × H)
                    </div>
                </div>
            );
        }

        // TEXTAREA - Zone de texte multiligne
        if (item.type === 'textarea') {
            return (
                <textarea
                    value={value || ''}
                    onChange={(e) => setValue(e.target.value)}
                    className={`${baseClass} min-h-[80px] resize-y`}
                    placeholder={item.placeholder || 'Entrer une description...'}
                    rows={3}
                    autoFocus
                />
            );
        }

        // COMPUTED - Champs calculés (lecture seule avec info)
        if (item.type === 'computed') {
            return (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        ⚡ Valeur calculée automatiquement
                    </div>
                    {item.computeFrom && (
                        <div className="text-xs text-gray-400 mt-1">
                            Basé sur: {item.computeFrom.join(', ')}
                        </div>
                    )}
                </div>
            );
        }

        // TEXT (default) - Input texte simple
        return (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
                className={baseClass}
                placeholder={item.placeholder || 'Entrer une valeur...'}
                autoFocus
            />
        );
    };
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
                    {item.unit && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">({item.unit})</span>
                    )}
                </div>

                {/* Formulaire adapté selon type - CDC Complet */}
                {renderFormInput()}
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
