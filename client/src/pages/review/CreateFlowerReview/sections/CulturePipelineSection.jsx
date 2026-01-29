import { useState, useEffect } from 'react'
import { ChevronDown, Plus, Trash2, Calendar, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PipelineCalendarView from '../../../../components/forms/pipeline/PipelineCalendarView'
import PipelinePresetSelector from '../../../../components/forms/pipeline/PipelinePresetSelector'
import PipelineConfigModal from '../../../../components/forms/pipeline/PipelineConfigModal'
import '../../../../styles/sections/CulturePipelineSection.css'

/**
 * CulturePipelineSection - SECTION 3: Pipeline Culture & Curing
 * 
 * Composant responsable de:
 * 1. Configuration du pipeline de culture (mode, dates)
 * 2. Sélection de presets réutilisables (9 groupes de données)
 * 3. Visualisation calendrier GitHub-style (90 jours)
 * 4. Gestion des stages du pipeline
 * 
 * Props: data/onChange OU formData/handleChange (supporte les deux patterns)
 */
export default function CulturePipelineSection({ data, onChange, formData, handleChange, onPipelineCreate }) {
    // Support des deux patterns d'appel
    const cultureData = data || formData || {};

    const [expandedGroups, setExpandedGroups] = useState({
        setup: true,
        environment: false,
        harvest: false,
        notes: false
    })

    // État pipeline
    const [pipelineMode, setPipelineMode] = useState(cultureData.pipelineMode || 'jours')
    const [pipelineStartDate, setPipelineStartDate] = useState(cultureData.pipelineStartDate || '')
    const [pipelineEndDate, setPipelineEndDate] = useState(cultureData.pipelineEndDate || '')
    const [selectedPresets, setSelectedPresets] = useState(cultureData.selectedPresets || {})
    const [showConfigModal, setShowConfigModal] = useState(false)
    const [showPresetModal, setShowPresetModal] = useState(false)
    const [pipelineStages, setPipelineStages] = useState(cultureData.pipelineStages || [])

    // Sync avec parent - supporte les deux patterns
    useEffect(() => {
        const newData = {
            pipelineMode,
            pipelineStartDate,
            pipelineEndDate,
            selectedPresets,
            pipelineStages
        };

        // Pattern 1: onChange directement avec l'objet complet
        if (onChange) {
            onChange(newData);
        }
        // Pattern 2: handleChange avec clés individuelles
        else if (handleChange) {
            handleChange('pipelineMode', pipelineMode);
            handleChange('pipelineStartDate', pipelineStartDate);
            handleChange('pipelineEndDate', pipelineEndDate);
            handleChange('selectedPresets', selectedPresets);
            handleChange('pipelineStages', pipelineStages);
        }
    }, [pipelineMode, pipelineStartDate, pipelineEndDate, selectedPresets, pipelineStages, onChange, handleChange])

    const toggleGroup = (groupName) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }))
    }

    const handleModeChange = (newMode) => {
        setPipelineMode(newMode)
        // Réinitialiser les dates si changement de mode
        if (newMode === 'phases') {
            setPipelineStartDate('')
            setPipelineEndDate('')
        }
    }

    const handleAddStage = () => {
        const newStage = {
            id: `stage-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            data: {}
        }
        setPipelineStages([...pipelineStages, newStage])
    }

    const handleRemoveStage = (stageId) => {
        setPipelineStages(pipelineStages.filter(s => s.id !== stageId))
    }

    const handleUpdateStage = (stageId, updates) => {
        setPipelineStages(pipelineStages.map(s =>
            s.id === stageId ? { ...s, ...updates } : s
        ))
    }

    return (
        <div className="culture-pipeline-section">
            {/* SECTION 1: Configuration Pipeline */}
            <div className="pipeline-config-card">
                <div className="config-header" onClick={() => toggleGroup('setup')}>
                    <h3>
                        <Settings size={20} />
                        Configuration Pipeline
                    </h3>
                    <ChevronDown
                        size={20}
                        style={{
                            transform: expandedGroups.setup ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s'
                        }}
                    />
                </div>

                <AnimatePresence>
                    {expandedGroups.setup && (
                        <motion.div
                            className="config-content"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            {/* Mode Selection */}
                            <div className="form-group">
                                <label>Mode de suivi</label>
                                <div className="mode-selector">
                                    {['jours', 'semaines', 'phases'].map(mode => (
                                        <button
                                            key={mode}
                                            className={`mode-btn ${pipelineMode === mode ? 'active' : ''}`}
                                            onClick={() => handleModeChange(mode)}
                                        >
                                            {mode === 'jours' && '📅 Jours'}
                                            {mode === 'semaines' && '📆 Semaines'}
                                            {mode === 'phases' && '🔄 Phases'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range (for jours/semaines mode) */}
                            {pipelineMode !== 'phases' && (
                                <div className="date-range-group">
                                    <div className="form-group">
                                        <label>Date de début</label>
                                        <input
                                            type="date"
                                            value={pipelineStartDate}
                                            onChange={(e) => setPipelineStartDate(e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date de fin</label>
                                        <input
                                            type="date"
                                            value={pipelineEndDate}
                                            onChange={(e) => setPipelineEndDate(e.target.value)}
                                            className="date-input"
                                        />
                                    </div>
                                </div>
                            )}

                            {pipelineMode === 'phases' && (
                                <div className="info-box">
                                    <p>Mode Phases: 12 phases prédéfinies (Germination → Récolte)</p>
                                    <p className="small">Chaque phase peut être documentée indépendamment</p>
                                </div>
                            )}

                            <button
                                className="btn-primary"
                                onClick={() => setShowConfigModal(true)}
                            >
                                <Settings size={16} /> Configurer les données
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* SECTION 2: Sélection Presets */}
            <div className="presets-card">
                <div className="presets-header">
                    <h3>📦 Presets réutilisables</h3>
                    <button
                        className="btn-icon"
                        onClick={() => setShowPresetModal(true)}
                    >
                        <Plus size={16} /> Ajouter
                    </button>
                </div>

                <div className="presets-list">
                    {Object.entries(selectedPresets).map(([group, preset]) => (
                        <div key={group} className="preset-item">
                            <div className="preset-info">
                                <span className="group-label">{group}</span>
                                <span className="preset-name">{preset.name}</span>
                            </div>
                            <button
                                className="btn-remove"
                                onClick={() => {
                                    const newPresets = { ...selectedPresets }
                                    delete newPresets[group]
                                    setSelectedPresets(newPresets)
                                }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 3: Calendrier View */}
            {pipelineStartDate && (
                <PipelineCalendarView
                    startDate={pipelineStartDate}
                    endDate={pipelineEndDate}
                    mode={pipelineMode}
                    stages={pipelineStages}
                    onStageClick={(stage) => handleUpdateStage(stage.id, { active: !stage.active })}
                />
            )}

            {/* SECTION 4: Stages Management */}
            {pipelineStages.length > 0 && (
                <div className="stages-card">
                    <div className="stages-header">
                        <h3>📊 Étapes documentées ({pipelineStages.length})</h3>
                        <button
                            className="btn-primary"
                            onClick={handleAddStage}
                        >
                            <Plus size={16} /> Ajouter étape
                        </button>
                    </div>

                    <div className="stages-list">
                        <AnimatePresence>
                            {pipelineStages.map((stage, idx) => (
                                <motion.div
                                    key={stage.id}
                                    className="stage-item"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                >
                                    <div className="stage-number">{idx + 1}</div>
                                    <div className="stage-content">
                                        <input
                                            type="date"
                                            value={stage.date}
                                            onChange={(e) => handleUpdateStage(stage.id, { date: e.target.value })}
                                            className="stage-date"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Notes et observations..."
                                            value={stage.notes || ''}
                                            onChange={(e) => handleUpdateStage(stage.id, { notes: e.target.value })}
                                            className="stage-notes"
                                        />
                                    </div>
                                    <button
                                        className="btn-remove"
                                        onClick={() => handleRemoveStage(stage.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* SECTION 5: Autres données (Récolte, Notes) */}
            <div className="other-data-sections">
                {/* Harvest Data */}
                <div className="data-group">
                    <div className="group-header" onClick={() => toggleGroup('harvest')}>
                        <h4>🌾 Données de Récolte</h4>
                        <ChevronDown
                            size={16}
                            style={{
                                transform: expandedGroups.harvest ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}
                        />
                    </div>
                    {expandedGroups.harvest && (
                        <div className="group-content">
                            <div className="input-group">
                                <label>Poids brut (g)</label>
                                <input
                                    type="number"
                                    value={formData.harvestWeightBrut || ''}
                                    onChange={(e) => handleChange('harvestWeightBrut', e.target.value)}
                                    placeholder="Ex: 150"
                                />
                            </div>
                            <div className="input-group">
                                <label>Poids net après défoliation (g)</label>
                                <input
                                    type="number"
                                    value={formData.harvestWeightNet || ''}
                                    onChange={(e) => handleChange('harvestWeightNet', e.target.value)}
                                    placeholder="Ex: 120"
                                />
                            </div>
                            <div className="input-group">
                                <label>Rendement (g/m²)</label>
                                <input
                                    type="number"
                                    value={formData.harvestYield || ''}
                                    onChange={(e) => handleChange('harvestYield', e.target.value)}
                                    placeholder="Ex: 600"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* General Notes */}
                <div className="data-group">
                    <div className="group-header" onClick={() => toggleGroup('notes')}>
                        <h4>📝 Notes Générales</h4>
                        <ChevronDown
                            size={16}
                            style={{
                                transform: expandedGroups.notes ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}
                        />
                    </div>
                    {expandedGroups.notes && (
                        <div className="group-content">
                            <textarea
                                value={formData.cultureNotes || ''}
                                onChange={(e) => handleChange('cultureNotes', e.target.value)}
                                placeholder="Notes générales sur la culture, observations, etc..."
                                rows={4}
                                className="notes-textarea"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showConfigModal && (
                <PipelineConfigModal
                    mode={pipelineMode}
                    selectedPresets={selectedPresets}
                    onSave={(presets) => {
                        setSelectedPresets(presets)
                        setShowConfigModal(false)
                    }}
                    onClose={() => setShowConfigModal(false)}
                />
            )}

            {showPresetModal && (
                <PipelinePresetSelector
                    onSelect={(presets) => {
                        setSelectedPresets({ ...selectedPresets, ...presets })
                        setShowPresetModal(false)
                    }}
                    onClose={() => setShowPresetModal(false)}
                />
            )}
        </div>
    )
}
