import { useState, useMemo } from 'react'
import PipelineDragDropView from './PipelineDragDropView'
import { Download, TrendingUp, Beaker } from 'lucide-react'

/**
 * EXTRACTION SIDEBAR CONTENT - Configuration complète pour Concentrés
 * Conforme Dev_Séparations.md & instructions projet
 * 
 * Méthodes d'extraction : 18+ méthodes (solvants, mécaniques, avancées)
 */
const EXTRACTION_SIDEBAR_CONTENT = {
    CONFIG: {
        icon: '⚙️',
        label: 'Configuration Extraction',
        color: 'blue',
        collapsed: false,
        items: [
            {
                id: 'extractionMethod',
                label: 'Méthode d\'extraction',
                type: 'select',
                options: [
                    { value: 'eho', label: 'Éthanol (EHO)', icon: '🧪' },
                    { value: 'ipa', label: 'Isopropanol (IPA)', icon: '⚗️' },
                    { value: 'aho', label: 'Acétone (AHO)', icon: '🧴' },
                    { value: 'bho', label: 'Butane (BHO)', icon: '💨' },
                    { value: 'iho', label: 'Isobutane (IHO)', icon: '⚡' },
                    { value: 'pho', label: 'Propane (PHO)', icon: '🔥' },
                    { value: 'hho', label: 'Hexane (HHO)', icon: '🧬' },
                    { value: 'co2', label: 'CO₂ supercritique', icon: '☁️' },
                    { value: 'vegetal-oil', label: 'Huiles végétales', icon: '🥥' },
                    { value: 'rosin-hot', label: 'Pressage chaud (Rosin)', icon: '🔨' },
                    { value: 'rosin-cold', label: 'Pressage froid (Live Rosin)', icon: '❄️' },
                    { value: 'ultrasound', label: 'Ultrasons (UAE)', icon: '🔊' },
                    { value: 'microwave', label: 'Micro-ondes (MAE)', icon: '📡' },
                    { value: 'other', label: 'Autre méthode', icon: '❓' }
                ],
                icon: '🔬',
                defaultValue: 'eho',
                tooltip: 'Méthode principale d\'extraction'
            },
            {
                id: 'materialType',
                label: 'Type de matière première',
                type: 'multiselect',
                options: [
                    { value: 'fresh-buds', label: 'Buds fraîches', icon: '🌸' },
                    { value: 'dry-buds', label: 'Buds sèches', icon: '🌿' },
                    { value: 'fresh-frozen', label: 'Fresh frozen', icon: '❄️' },
                    { value: 'trim', label: 'Trim', icon: '✂️' },
                    { value: 'sugar-leaves', label: 'Sugar leaves', icon: '🍃' },
                    { value: 'hash', label: 'Hash (re-extraction)', icon: '💎' },
                    { value: 'other', label: 'Autre', icon: '📦' }
                ],
                icon: '🌿',
                tooltip: 'Type(s) de matière végétale utilisée'
            },
            {
                id: 'batchSize',
                label: 'Taille du batch',
                type: 'slider',
                min: 10,
                max: 5000,
                step: 10,
                unit: 'g',
                icon: '⚖️',
                defaultValue: 100,
                tooltip: 'Quantité de matière première'
            }
        ]
    },

    PARAMETRES: {
        icon: '🔬',
        label: 'Paramètres Extraction',
        color: 'purple',
        collapsed: true,
        items: [
            {
                id: 'solventType',
                label: 'Type de solvant',
                type: 'text',
                icon: '🧪',
                dependsOn: 'extractionMethod',
                showIf: (data) => !['rosin-hot', 'rosin-cold'].includes(data.extractionMethod),
                tooltip: 'Nom du solvant utilisé'
            },
            {
                id: 'solventVolume',
                label: 'Volume de solvant',
                type: 'slider',
                min: 10,
                max: 5000,
                step: 10,
                unit: 'mL',
                icon: '📏',
                defaultValue: 500,
                dependsOn: 'extractionMethod',
                showIf: (data) => !['rosin-hot', 'rosin-cold', 'co2'].includes(data.extractionMethod)
            },
            {
                id: 'temperature',
                label: 'Température',
                type: 'slider',
                min: -80,
                max: 200,
                step: 5,
                unit: '°C',
                icon: '🌡️',
                defaultValue: 20,
                tooltip: 'Température du processus'
            },
            {
                id: 'pressure',
                label: 'Pression',
                type: 'slider',
                min: 0.1,
                max: 500,
                step: 0.5,
                unit: 'bar',
                icon: '📊',
                defaultValue: 1,
                dependsOn: 'extractionMethod',
                showIf: (data) => ['bho', 'pho', 'iho', 'co2', 'rosin-hot', 'rosin-cold'].includes(data.extractionMethod),
                tooltip: 'Pression appliquée'
            },
            {
                id: 'duration',
                label: 'Durée totale',
                type: 'slider',
                min: 1,
                max: 240,
                step: 1,
                unit: 'min',
                icon: '⏱️',
                defaultValue: 30,
                tooltip: 'Durée du processus d\'extraction'
            },
            {
                id: 'passes',
                label: 'Nombre de passes',
                type: 'stepper',
                min: 1,
                max: 10,
                icon: '🔄',
                defaultValue: 1,
                tooltip: 'Nombre de passages/extractions'
            },
            {
                id: 'agitation',
                label: 'Agitation',
                type: 'boolean',
                icon: '🌀',
                tooltip: 'Agitation mécanique appliquée'
            }
        ]
    },

    RENDEMENT: {
        icon: '📊',
        label: 'Rendement & Qualité',
        color: 'green',
        collapsed: true,
        items: [
            {
                id: 'totalYield',
                label: 'Rendement total',
                type: 'slider',
                min: 0,
                max: 500,
                step: 0.1,
                unit: 'g',
                icon: '⚖️',
                defaultValue: 0,
                tooltip: 'Poids total de concentré produit'
            },
            {
                id: 'yieldPercentage',
                label: 'Rendement (%)',
                type: 'computed',
                unit: '%',
                icon: '📈',
                computeFrom: ['totalYield', 'batchSize'],
                computeFn: (data) => {
                    if (!data.totalYield || !data.batchSize) return 0
                    return ((data.totalYield / data.batchSize) * 100).toFixed(2)
                },
                tooltip: 'Pourcentage de rendement'
            },
            {
                id: 'purity',
                label: 'Pureté estimée',
                type: 'slider',
                min: 0,
                max: 100,
                step: 1,
                unit: '%',
                icon: '💎',
                defaultValue: 70,
                tooltip: 'Pureté estimée du concentré'
            },
            {
                id: 'consistency',
                label: 'Consistance',
                type: 'select',
                options: [
                    { value: 'shatter', label: 'Shatter (vitreux)', icon: '🔷' },
                    { value: 'wax', label: 'Wax (cire)', icon: '🟡' },
                    { value: 'budder', label: 'Budder (beurre)', icon: '🧈' },
                    { value: 'crumble', label: 'Crumble', icon: '🍪' },
                    { value: 'sauce', label: 'Sauce (liquide)', icon: '🍯' },
                    { value: 'diamonds', label: 'Diamonds (cristaux)', icon: '💎' },
                    { value: 'rosin', label: 'Rosin', icon: '🍯' },
                    { value: 'distillate', label: 'Distillat', icon: '💧' },
                    { value: 'isolate', label: 'Isolat', icon: '⚪' },
                    { value: 'other', label: 'Autre', icon: '❓' }
                ],
                icon: '🧈',
                tooltip: 'Texture finale du concentré'
            },
            {
                id: 'color',
                label: 'Couleur',
                type: 'select',
                options: [
                    { value: 'clear', label: 'Transparent/Clair', icon: '⚪' },
                    { value: 'light-amber', label: 'Ambré clair', icon: '🟡' },
                    { value: 'amber', label: 'Ambré', icon: '🟠' },
                    { value: 'dark-amber', label: 'Ambré foncé', icon: '🟤' },
                    { value: 'black', label: 'Noir', icon: '⚫' }
                ],
                icon: '🎨',
                tooltip: 'Couleur visuelle du concentré'
            }
        ]
    }
}

/**
 * ExtractionPipelineDragDrop - Pipeline Extraction pour Concentrés
 * 
 * Wrapper qui configure PipelineDragDropView pour l'extraction :
 * - 18+ méthodes d'extraction
 * - Paramètres dynamiques selon méthode
 * - Stats rendement & qualité
 */
const ExtractionPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    const [showStats, setShowStats] = useState(false)

    // Convertir vers format array
    const sidebarArray = useMemo(() => {
        return Object.entries(EXTRACTION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'purple',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Stats calculées
    const stats = useMemo(() => {
        if (timelineData.length === 0) return null

        const yields = timelineData
            .map(cell => cell.totalYield)
            .filter(val => val !== undefined && val !== null)

        const purities = timelineData
            .map(cell => cell.purity)
            .filter(val => val !== undefined && val !== null)

        return {
            cellsFilled: timelineData.length,
            avgYield: yields.length > 0 ? (yields.reduce((a, b) => a + b, 0) / yields.length).toFixed(2) : 0,
            avgPurity: purities.length > 0 ? (purities.reduce((a, b) => a + b, 0) / purities.length).toFixed(1) : 0,
            totalMethods: new Set(timelineData.map(c => c.extractionMethod)).size
        }
    }, [timelineData])

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
            a.download = `extraction-${Date.now()}.csv`
            a.click()
        } catch (error) {
            console.error('Erreur export CSV:', error)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Beaker className="w-5 h-5" />
                        Pipeline Extraction
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            {timelineData.length} extractions
                        </span>
                        {stats && stats.avgPurity > 0 && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                {stats.avgPurity}% pureté moy.
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="liquid-btn"
                    >
                        <TrendingUp className="w-4 h-4" />
                        {showStats ? 'Masquer' : 'Stats'}
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="liquid-btn liquid-btn--primary"
                        disabled={timelineData.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats */}
            {showStats && stats && (
                <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="text-sm font-bold mb-3 text-gray-900 dark:text-white">📊 Statistiques</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.cellsFilled}</div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">Extractions</div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.avgYield}g</div>
                            <div className="text-xs text-green-600 dark:text-green-400">Rendement moyen</div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.avgPurity}%</div>
                            <div className="text-xs text-amber-600 dark:text-amber-400">Pureté moyenne</div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-lg">
                            <div className="text-2xl font-bold text-pink-700 dark:text-pink-300">{stats.totalMethods}</div>
                            <div className="text-xs text-pink-600 dark:text-pink-400">Méthodes utilisées</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pipeline principal */}
            <PipelineDragDropView
                type="extraction"
                sidebarContent={sidebarArray}
                timelineConfig={timelineConfig}
                timelineData={timelineData}
                onConfigChange={onConfigChange}
                onDataChange={onDataChange}
            />
        </div>
    )
}

export default ExtractionPipelineDragDrop
