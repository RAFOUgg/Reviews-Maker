import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import './PipelineConfigModal.css'

/**
 * PipelineConfigModal - Configuration avancée des données du pipeline
 * Permet de configurer quels champs sont suivi pour chaque étape
 */
export default function PipelineConfigModal({ mode, selectedPresets, onSave, onClose }) {
    const [config, setConfig] = useState({
        trackEnvironment: true,
        trackNutrients: true,
        trackMorphology: true,
        customFields: []
    })

    // Champs disponibles par catégorie
    const availableFields = {
        environment: [
            { id: 'temp', label: 'Température (°C)', unit: '°C' },
            { id: 'humidity', label: 'Humidité (%)', unit: '%' },
            { id: 'co2', label: 'CO2 (ppm)', unit: 'ppm' },
            { id: 'ph', label: 'pH de l\'eau', unit: '' },
            { id: 'ec', label: 'EC (Conductivité)', unit: 'µS/cm' }
        ],
        nutrients: [
            { id: 'npk', label: 'Ratio N-P-K', unit: 'PPM' },
            { id: 'nitrogen', label: 'Azote (N)', unit: 'PPM' },
            { id: 'phosphorus', label: 'Phosphore (P)', unit: 'PPM' },
            { id: 'potassium', label: 'Potassium (K)', unit: 'PPM' }
        ],
        morphology: [
            { id: 'height', label: 'Hauteur plante', unit: 'cm' },
            { id: 'width', label: 'Largeur plante', unit: 'cm' },
            { id: 'leaf_count', label: 'Nombre de feuilles', unit: 'pcs' },
            { id: 'bud_count', label: 'Nombre de buds', unit: 'pcs' }
        ]
    }

    const handleToggleCategory = (category) => {
        setConfig(prev => ({
            ...prev,
            [`track${category.charAt(0).toUpperCase() + category.slice(1)}`]:
                !prev[`track${category.charAt(0).toUpperCase() + category.slice(1)}`]
        }))
    }

    const handleAddCustomField = () => {
        setConfig(prev => ({
            ...prev,
            customFields: [
                ...prev.customFields,
                {
                    id: `custom-${Date.now()}`,
                    name: '',
                    unit: '',
                    type: 'text'
                }
            ]
        }))
    }

    const handleUpdateCustomField = (fieldId, updates) => {
        setConfig(prev => ({
            ...prev,
            customFields: prev.customFields.map(f =>
                f.id === fieldId ? { ...f, ...updates } : f
            )
        }))
    }

    const handleRemoveCustomField = (fieldId) => {
        setConfig(prev => ({
            ...prev,
            customFields: prev.customFields.filter(f => f.id !== fieldId)
        }))
    }

    const handleSave = () => {
        onSave({
            ...selectedPresets,
            _config: config
        })
    }

    return (
        <div className="config-modal-overlay">
            <motion.div
                className="config-modal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="modal-header">
                    <h2>Configuration des Données Suivi</h2>
                    <p>Définissez quels champs documenter à chaque étape</p>
                    <button className="btn-close" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-content">
                    {/* Catégories prédéfinies */}
                    <div className="categories-section">
                        {['environment', 'nutrients', 'morphology'].map(category => (
                            <div key={category} className="category-block">
                                <div className="category-header">
                                    <input
                                        type="checkbox"
                                        checked={config[`track${category.charAt(0).toUpperCase() + category.slice(1)}`]}
                                        onChange={() => handleToggleCategory(category)}
                                    />
                                    <h3>
                                        {category === 'environment' && '🌡️ Environnement'}
                                        {category === 'nutrients' && '🥗 Nutriments'}
                                        {category === 'morphology' && '📊 Morphologie'}
                                    </h3>
                                </div>
                                <div className="fields-list">
                                    {availableFields[category].map(field => (
                                        <label key={field.id} className="field-item">
                                            <input type="checkbox" defaultChecked />
                                            <span className="field-label">
                                                {field.label}
                                                {field.unit && <span className="field-unit">({field.unit})</span>}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Champs personnalisés */}
                    <div className="custom-fields-section">
                        <div className="section-header">
                            <h3>➕ Champs Personnalisés</h3>
                            <button
                                className="btn-add-field"
                                onClick={handleAddCustomField}
                            >
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>

                        <div className="custom-fields-list">
                            {config.customFields.map(field => (
                                <motion.div
                                    key={field.id}
                                    className="custom-field-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    <input
                                        type="text"
                                        placeholder="Nom du champ"
                                        value={field.name}
                                        onChange={(e) => handleUpdateCustomField(field.id, { name: e.target.value })}
                                        className="field-name"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Unité (ex: g, ml, °C)"
                                        value={field.unit}
                                        onChange={(e) => handleUpdateCustomField(field.id, { unit: e.target.value })}
                                        className="field-unit-input"
                                    />
                                    <select
                                        value={field.type}
                                        onChange={(e) => handleUpdateCustomField(field.id, { type: e.target.value })}
                                        className="field-type"
                                    >
                                        <option value="text">Texte</option>
                                        <option value="number">Nombre</option>
                                        <option value="date">Date</option>
                                    </select>
                                    <button
                                        className="btn-remove-field"
                                        onClick={() => handleRemoveCustomField(field.id)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Info sur le mode */}
                    <div className="mode-info">
                        <p>
                            <strong>Mode sélectionné:</strong> {mode === 'jours' ? 'Suivi Quotidien' : mode === 'semaines' ? 'Suivi Hebdomadaire' : 'Suivi par Phases'}
                        </p>
                        <p className="small">
                            Ces champs seront disponibles pour chaque {mode === 'jours' ? 'jour' : mode === 'semaines' ? 'semaine' : 'phase'} de votre culture.
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        ✓ Appliquer Configuration
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
