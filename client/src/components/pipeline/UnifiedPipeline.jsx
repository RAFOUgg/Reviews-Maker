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
            const cell = { ...newTimelineData[existingIndex] };
            const newData = { ...(cell.data || {}) };

            if (value === null || value === undefined) {
                // Supprimer la clé réellement
                delete newData[field];
            } else {
                newData[field] = value;
            }

            // Si plus de données, supprimer la cellule entière
            if (Object.keys(newData).length === 0) {
                newTimelineData.splice(existingIndex, 1);
            } else {
                newTimelineData[existingIndex] = { ...cell, data: newData };
            }
        } else {
            // Créer nouvelle cellule uniquement si value non-null
            if (value !== null && value !== undefined) {
                newTimelineData.push({
                    timestamp,
                    data: { [field]: value }
                });
            }
        }

        onChange?.({
            ...data,
            timelineData: newTimelineData
        })
    }

    // Handler sauvegarde préréglage (add/update/delete)
    const handleSavePreset = (preset) => {
        let newPresets

        if (preset._action === 'delete') {
            // Supprimer le preset
            newPresets = presets.filter(p => p.id !== preset.id)
        } else {
            // Ajouter ou modifier
            const existingIndex = presets.findIndex(p => p.id === preset.id)

            if (existingIndex >= 0) {
                // Modifier existant
                newPresets = [...presets]
                newPresets[existingIndex] = preset
            } else {
                // Nouveau - vérifier qu'il n'existe pas déjà avec le même nom
                const duplicateCheck = presets.find(p => p.name === preset.name && p.id !== preset.id)
                if (duplicateCheck) {
};

export default UnifiedPipeline;
