import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, BarChart3, Download } from 'lucide-react'
import PipelineDragDropView from './PipelineDragDropView'
import { PURIFICATION_SIDEBAR_CONTENT } from '../../config/purificationSidebarContent'
import { PurityComparisonGraph, PurityEvolutionLine, MethodComparisonGraph } from './PurityGraph'
import { PurificationMethodModal } from './PurificationMethodForm'
import { exportPurificationToCSV } from '../../utils/PurificationCSVExporter'

/**
 * PurificationPipelineDragDrop - Pipeline Purification utilisant PipelineDragDropView
 * 
 * Particularités :
 * - Gestion multi-étapes (winterization, chromatography, distillation, etc.)
 * - Graphiques évolution pureté
 * - Export CSV détaillé
 */
export default function PurificationPipelineDragDrop({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange
}) {
    const [purificationSteps, setPurificationSteps] = useState([])
    const [showStepModal, setShowStepModal] = useState(false)
    const [editingStep, setEditingStep] = useState(null)
    const [showGraphs, setShowGraphs] = useState(false)

    // Convertir PURIFICATION_SIDEBAR_CONTENT (objet) vers format array
    const sidebarArray = useMemo(() => {
        return Object.entries(PURIFICATION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'amber',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Handler export CSV
    const handleExportCSV = () => {
        try {
            const generalData = timelineData.find(d => d.data)?.data || {}
            const csvContent = exportPurificationToCSV(generalData, purificationSteps)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `purification-${Date.now()}.csv`
            link.click()
            URL.revokeObjectURL(link.href)
        } catch (error) {
}
