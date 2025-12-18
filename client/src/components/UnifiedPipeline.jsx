/**
 * UNIFIED PIPELINE - Composant générique CDC
 * 
 * Système de pipeline universel qui fonctionne pour TOUS les types :
 * - Culture (Fleurs)
 * - Curing/Maturation (tous produits)
 * - Séparation (Hash)
 * - Extraction (Concentrés)
 * - Recette (Edibles)
 * 
 * Seules les configurations statiques changent (données disponibles, phases, etc.)
 */

import { useState, useEffect } from 'react'
import { getPipelineConfig } from '../config/pipelineConfigs'
import PipelineDragDropView from './pipeline/PipelineDragDropView'
import LiquidCard from './ui/LiquidCard'

const UnifiedPipeline = ({
    type = 'culture', // 'culture' | 'curing' | 'separation' | 'extraction' | 'recipe'
    data = {},
    onChange
}) => {
    // Récupérer la configuration statique selon le type
    const config = getPipelineConfig(type)

    // État local pour préréglages
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem(`${type}PipelinePresets`)
        return saved ? JSON.parse(saved) : []
    })

    // Configuration de la timeline
    const timelineConfig = data.timelineConfig || {
        type: config.intervalTypes[0].value, // Premier type par défaut
        start: '',
        end: '',
        duration: 90,
        totalCells: 90,
        phases: config.phases || []
    }

    // Données de la timeline (array d'objets {timestamp, data})
    const timelineData = data.timelineData || []

    // Sauvegarder presets dans localStorage à chaque modification
    useEffect(() => {
        localStorage.setItem(`${type}PipelinePresets`, JSON.stringify(presets))
    }, [presets, type])

    // Handler changement de configuration timeline
    const handleConfigChange = (field, value) => {
        const newConfig = {
            ...timelineConfig,
            [field]: value
        }

        // Recalculer le nombre de cases selon le type d'intervalle
        if (field === 'type') {
            const intervalType = config.intervalTypes.find(t => t.value === value)
            if (intervalType) {
                newConfig.totalCells = intervalType.maxCells
            }
        }

        onChange?.({
            ...data,
            timelineConfig: newConfig
        })
    }

    // Handler changement de données timeline
    const handleDataChange = (timestamp, field, value) => {
        const existingIndex = timelineData.findIndex(d => d.timestamp === timestamp)
        let newTimelineData = [...timelineData]

        if (existingIndex >= 0) {
            // Mettre à jour cellule existante
            newTimelineData[existingIndex] = {
                ...newTimelineData[existingIndex],
                data: {
                    ...newTimelineData[existingIndex].data,
                    [field]: value
                }
            }
        } else {
            // Créer nouvelle cellule
            newTimelineData.push({
                timestamp,
                data: { [field]: value }
            })
        }

        onChange?.({
            ...data,
            timelineData: newTimelineData
        })
    }

    // Handler sauvegarde préréglage
    const handleSavePreset = (preset) => {
        const existingIndex = presets.findIndex(p => p.id === preset.id)
        let newPresets

        if (existingIndex >= 0) {
            newPresets = [...presets]
            newPresets[existingIndex] = preset
        } else {
            newPresets = [...presets, preset]
        }

        setPresets(newPresets)
    }

    // Handler chargement préréglage
    const handleLoadPreset = (presetId) => {
        const preset = presets.find(p => p.id === presetId)
        if (!preset) return

        // Appliquer les données du préréglage
        // (logique à implémenter selon besoin)
        console.log('Chargement preset:', preset)
    }

    return (
        <LiquidCard
            title={config.title}
            subtitle={config.description}
            bordered
        >
            {/* Instructions utilisateur */}
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    🌱 {config.title} : Timeline interactive CDC
                </h4>
                <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
                    <li>📍 <strong>Glissez</strong> les contenus depuis le panneau latéral vers les cases de la timeline</li>
                    <li>🖱️ <strong>Drag & drop</strong> : Sélectionnez un contenu à gauche et déposez-le sur une case</li>
                    <li>📝 <strong>Édition</strong> : Cliquez sur une case pour modifier ses données</li>
                    <li>💾 <strong>Préréglages</strong> : Sauvegardez des configurations réutilisables</li>
                    <li>📊 <strong>Clic droit</strong> sur un contenu : définir valeurs ou assigner à une plage</li>
                </ul>
            </div>

            {/* Composant Pipeline unifié */}
            <PipelineDragDropView
                type={type}
                sidebarContent={config.sidebarContent}
                timelineConfig={timelineConfig}
                timelineData={timelineData}
                onConfigChange={handleConfigChange}
                onDataChange={handleDataChange}
                presets={presets}
                onSavePreset={handleSavePreset}
                onLoadPreset={handleLoadPreset}
                intervalTypes={config.intervalTypes}
                phases={config.phases}
            />
        </LiquidCard>
    );
};

export default UnifiedPipeline;
