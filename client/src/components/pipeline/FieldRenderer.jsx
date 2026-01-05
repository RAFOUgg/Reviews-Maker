import React from 'react'
import { LiquidInput, LiquidSelect } from '../liquid'
import {
    DimensionsField,
    FrequencyField,
    PhotoperiodField,
    PieCompositionField,
    PhasesField,
    AutocompleteField
} from './fields'

/**
 * FieldRenderer - Rendu intelligent de champ selon son type
 * 
 * Supporte tous les types de champs définis dans cultureSidebarContent.js
 * 
 * Types supportés :
 * - text, number, date, textarea
 * - select, multiselect, autocomplete
 * - slider, stepper, toggle
 * - dimensions, frequency, photoperiod, pie, phases
 * - computed (lecture seule)
 * 
 * @param {Object} field - Définition du champ depuis sidebarContent
 * @param {*} value - Valeur actuelle
 * @param {Function} onChange - Callback onChange(newValue)
 * @param {Object} allData - Toutes les données (pour champs computed/dependsOn)
 */
const FieldRenderer = ({ field, value, onChange, allData = {} }) => {
    const { type, label, icon, tooltip, unit, min, max, step, options, defaultValue } = field

    // Vérifier dépendances
    if (field.dependsOn && field.showIf && !field.showIf(allData)) {
        return null // Champ masqué car dépendance non satisfaite
    }

    // Valeur par défaut
    const currentValue = value !== undefined && value !== null ? value : defaultValue

    // ============================================================================
    // CHAMPS TEXTUELS
    // ============================================================================
    if (type === 'text') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <LiquidInput
                    type="text"
                    value={currentValue || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    title={tooltip}
                />
            </div>
        )
    }

    // ============================================================================
    // CHAMPS NUMÉRIQUES
    // ============================================================================
    if (type === 'number') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label} {unit && <span className="text-gray-500">({unit})</span>}
                </label>
                <LiquidInput
                    type="number"
                    min={min}
                    max={max}
                    step={step || 1}
                    value={currentValue || 0}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    placeholder={field.placeholder}
                    title={tooltip}
                />
            </div>
        )
    }

    // ============================================================================
    // DATE
    // ============================================================================
    if (type === 'date') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <LiquidInput
                    type="date"
                    value={currentValue || ''}
                    onChange={(e) => onChange(e.target.value)}
                    title={tooltip}
                />
            </div>
        )
    }

    // ============================================================================
    // TEXTAREA
    // ============================================================================
    if (type === 'textarea') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <textarea
                    value={currentValue || ''}
                    onChange={(e) => onChange(e.target.value)}
                    maxLength={field.maxLength}
                    placeholder={field.placeholder}
                    title={tooltip}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-purple-500 focus:outline-none resize-none"
                    rows={3}
                />
                {field.maxLength && (
                    <div className="text-xs text-gray-500 mt-1">
                        {(currentValue || '').length}/{field.maxLength}
                    </div>
                )}
            </div>
        )
    }

    // ============================================================================
    // SELECT
    // ============================================================================
    if (type === 'select') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <LiquidSelect
                    value={currentValue || ''}
                    onChange={(e) => onChange(e.target.value)}
                    title={tooltip}
                >
                    <option value="">-- Sélectionner --</option>
                    {options.map((opt, idx) => (
                        <option key={idx} value={opt.value}>
                            {opt.icon && `${opt.icon} `}{opt.label}
                        </option>
                    ))}
                </LiquidSelect>
            </div>
        )
    }

    // ============================================================================
    // MULTISELECT
    // ============================================================================
    if (type === 'multiselect') {
        const selectedValues = Array.isArray(currentValue) ? currentValue : []

        const toggleOption = (optValue) => {
            if (selectedValues.includes(optValue)) {
                onChange(selectedValues.filter(v => v !== optValue))
            } else {
                onChange([...selectedValues, optValue])
            }
        }

        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => toggleOption(opt.value)}
                            className={`
                px-3 py-2 text-xs font-medium rounded-lg border-2 transition text-left
                ${selectedValues.includes(opt.value)
                                    ? 'bg-purple-600 border-purple-500 text-white'
                                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                                }
              `}
                        >
                            {opt.icon && <span className="mr-1">{opt.icon}</span>}
                            {opt.label}
                        </button>
                    ))}
                </div>
                {selectedValues.length > 0 && (
                    <div className="text-xs text-gray-400 mt-2">
                        {selectedValues.length} sélectionné(s)
                    </div>
                )}
            </div>
        )
    }

    // ============================================================================
    // AUTOCOMPLETE
    // ============================================================================
    if (type === 'autocomplete') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <AutocompleteField
                    value={currentValue || ''}
                    onChange={onChange}
                    suggestions={field.suggestions || field.autocomplete || []}
                    placeholder={field.placeholder || 'Tapez pour rechercher...'}
                    maxSuggestions={field.maxSuggestions || 5}
                />
            </div>
        )
    }

    // ============================================================================
    // SLIDER
    // ============================================================================
    if (type === 'slider') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                    <span className="ml-auto text-purple-400 font-semibold">
                        {currentValue || min || 0} {unit}
                    </span>
                </label>
                <input
                    type="range"
                    min={min || 0}
                    max={max || 100}
                    step={step || 1}
                    value={currentValue || min || 0}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    title={tooltip}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                {field.zones && (
                    <div className="flex gap-1 mt-2 text-xs">
                        {field.zones.map((zone, idx) => (
                            <div
                                key={idx}
                                className={`px-2 py-1 rounded ${currentValue >= zone.min && currentValue <= zone.max
                                    ? `bg-${zone.color}-600 text-white`
                                    : 'bg-gray-800 text-gray-500'
                                    }`}
                            >
                                {zone.label}
                            </div>
                        ))}
                    </div>
                )}
                {field.suggestions && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {field.suggestions.map((sugg, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChange(sugg.value)}
                                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition"
                            >
                                {sugg.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // ============================================================================
    // STEPPER
    // ============================================================================
    if (type === 'stepper') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onChange(Math.max((min || 0), (currentValue || 0) - 1))}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition"
                    >
                        −
                    </button>
                    <div className="flex-1 text-center bg-gray-900 px-4 py-2 rounded-lg border border-gray-600 font-semibold text-white">
                        {currentValue || min || 0} {unit}
                    </div>
                    <button
                        onClick={() => onChange(Math.min((max || 999), (currentValue || 0) + 1))}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition"
                    >
                        +
                    </button>
                </div>
            </div>
        )
    }

    // ============================================================================
    // TOGGLE
    // ============================================================================
    if (type === 'toggle') {
        return (
            <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-300 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <button
                    onClick={() => onChange(!currentValue)}
                    className={`
            relative w-12 h-6 rounded-full transition
            ${currentValue ? 'bg-purple-600' : 'bg-gray-700'}
          `}
                    title={tooltip}
                >
                    <div
                        className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
              ${currentValue ? 'translate-x-6' : 'translate-x-0'}
            `}
                    />
                </button>
            </div>
        )
    }

    // ============================================================================
    // CHAMPS SPÉCIALISÉS
    // ============================================================================
    if (type === 'dimensions') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <DimensionsField value={currentValue} onChange={onChange} unit={unit} />
            </div>
        )
    }

    if (type === 'frequency') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <FrequencyField value={currentValue} onChange={onChange} presets={field.presets} />
            </div>
        )
    }

    if (type === 'photoperiod') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <PhotoperiodField value={currentValue} onChange={onChange} presets={field.presets} />
            </div>
        )
    }

    if (type === 'pie') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <PieCompositionField value={currentValue} onChange={onChange} components={field.components} />
            </div>
        )
    }

    if (type === 'phases') {
        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-2 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <PhasesField value={currentValue} onChange={onChange} phases={field.phases} />
            </div>
        )
    }

    // ============================================================================
    // COMPUTED (lecture seule)
    // ============================================================================
    if (type === 'computed') {
        const computedValue = field.computeFn ? field.computeFn(allData) : currentValue

        return (
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                    {icon && <span>{icon}</span>}
                    {label}
                </label>
                <div className="px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white font-semibold">
                    {computedValue} {unit}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    Calculé automatiquement
                </div>
            </div>
        )
    }

    // ============================================================================
    // TYPE INCONNU
    // ============================================================================
    return (
        <div className="text-xs text-red-400">
            Type de champ inconnu : {type}
        </div>
    )
}

export default FieldRenderer
