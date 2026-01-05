import { useState, useMemo } from 'react'
import PipelineDragDropView from './PipelineDragDropView'
import { HASH_SEPARATION_SIDEBAR_CONTENT } from '../../config/hashSeparationSidebarContent'
import { Download, TrendingUp } from 'lucide-react'

/**
 * HashSeparationPipelineDragDrop - Pipeline Séparation Hash
 * 
 * Wrapper qui configure PipelineDragDropView pour la séparation Hash :
 * - Configuration batch & trame
 * - Matière première
 * - Ice-Water / Bubble Hash
 * - Dry-sift / Kief
 * - Rendement & Qualité
 * 
 * Conforme Dev_Séparations.md
 */
const HashSeparationPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    const [showStats, setShowStats] = useState(false)

    // Convertir HASH_SEPARATION_SIDEBAR_CONTENT (objet) vers format array
    const sidebarArray = useMemo(() => {
        return Object.entries(HASH_SEPARATION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'cyan',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Stats calculées
    const stats = useMemo(() => {
        if (timelineData.length === 0) return null

        // Extraire les valeurs de rendement
        const yields = timelineData
            .map(cell => cell.totalYield)
            .filter(val => val !== undefined && val !== null)

        const qualityGrades = timelineData
            .map(cell => cell.qualityGrade)
            .filter(val => val !== undefined && val !== null)

        return {
            cellsFilled: timelineData.length,
            avgYield: yields.length > 0 ? (yields.reduce((a, b) => a + b, 0) / yields.length).toFixed(2) : 0,
            topQuality: qualityGrades.filter(g => g === 'full-melt' || g === '5-star').length,
            totalMethods: new Set(timelineData.map(c => c.separationMethod)).size
        }
    }, [timelineData])

    // Export CSV handler (simplifié)
    const handleExportCSV = () => {
        try {
            const csvData = timelineData.map(cell => ({
                timestamp: cell.timestamp,
                ...cell
            }))

            const headers = Object.keys(csvData[0] || {})
            const csvContent = [
                headers.join(','),
                ...csvData.map(row => headers.map(h => row[h] || '').join(','))
            ].join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `hash-separation-${Date.now()}.csv`
            a.click()
        } catch (error) {
            console.error('Erreur export CSV:', error)
            alert('Erreur lors de l\'export CSV')
        }
    }

    return (
        <div className="space-y-4">
            {/* Header avec stats et actions */}
            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>❄️</span>
                        Pipeline Séparation Hash
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            {timelineData.length} cases remplies
                        </span>
                        {stats && stats.topQuality > 0 && (
                            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                {stats.topQuality} Full Melt/5★
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="liquid-btn"
                        title="Afficher statistiques"
                    >
                        <TrendingUp className="w-4 h-4" />
                        {showStats ? 'Masquer' : 'Stats'}
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="liquid-btn liquid-btn--primary"
                        title="Exporter en CSV"
                        disabled={timelineData.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Statistiques (conditionnel) */}
            {showStats && stats && (
                <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">📊 Statistiques</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{stats.cellsFilled}</div>
                            <div className="text-xs text-cyan-600 dark:text-cyan-400">Cases remplies</div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.avgYield}g</div>
                            <div className="text-xs text-green-600 dark:text-green-400">Rendement moyen</div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.topQuality}</div>
                            <div className="text-xs text-amber-600 dark:text-amber-400">Full Melt/5★</div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.totalMethods}</div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">Méthodes utilisées</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pipeline principal - PipelineDragDropView */}
            <PipelineDragDropView
                type="hash-separation"
                sidebarContent={sidebarArray}
                timelineConfig={timelineConfig}
                timelineData={timelineData}
                onConfigChange={onConfigChange}
                onDataChange={onDataChange}
            />
        </div>
    )
}

export default HashSeparationPipelineDragDrop
