import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { motion } from 'framer-motion'

/**
 * CuringEvolutionGraph - Mini-graphique d'évolution des notes /10
 * 
 * Affiche l'évolution d'une note (Visuel, Odeurs, Goûts, Effets) dans une cellule
 * 
 * @param {Array} data - Historique [{timestamp, value}]
 * @param {string} type - Type de note ('visual', 'odor', 'taste', 'effects')
 * @param {number} currentValue - Valeur actuelle /10
 * @param {boolean} compact - Mode compact (mini)
 */
const CuringEvolutionGraph = ({
    data = [],
    type = 'visual',
    currentValue = 0,
    compact = true
}) => {
    // Config couleurs par type
    const typeConfig = {
        visual: {
            color: '#3B82F6', // blue
            icon: '👁️',
            label: 'Visuel'
        },
        odor: {
            color: '#8B5CF6', // purple
            icon: '👃',
            label: 'Odeurs'
        },
        taste: {
            color: '#10B981', // green
            icon: '😋',
            label: 'Goûts'
        },
        effects: {
            color: '#F59E0B', // orange
            icon: '💥',
            label: 'Effets'
        },
        moisture: {
            color: '#06B6D4', // cyan
            icon: '💧',
            label: 'Humidité'
        },
        weight: {
            color: '#EF4444', // red
            icon: '⚖️',
            label: 'Poids'
        }
    }

    const config = typeConfig[type] || typeConfig.visual

    // Calculer tendance
    const calculateTrend = () => {
        if (data.length < 2) return 'stable'
        const first = data[0]?.value || 0
        const last = currentValue || data[data.length - 1]?.value || 0
        const diff = last - first

        if (Math.abs(diff) < 0.5) return 'stable'
        return diff > 0 ? 'up' : 'down'
    }

    const trend = calculateTrend()
    const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'
    const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
                    <p className="text-xs text-white font-semibold">
                        {config.icon} {payload[0].value.toFixed(1)}/10
                    </p>
                    {payload[0].payload.timestamp && (
                        <p className="text-xs text-gray-400">
                            {new Date(payload[0].payload.timestamp).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )
        }
        return null
    }

    if (compact) {
        // Mode compact pour cellule timeline
        return (
            <div className="relative w-full h-12 group">
                {data.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <YAxis domain={[0, 10]} hide />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={config.color}
                                    strokeWidth={2}
                                    dot={false}
                                    animationDuration={300}
                                />
                            </LineChart>
                        </ResponsiveContainer>

                        {/* Badge valeur actuelle */}
                        <div className="absolute top-0 right-0 px-1.5 py-0.5 bg-gray-900/90 rounded text-xs font-bold text-white">
                            {currentValue.toFixed(1)}
                        </div>

                        {/* Tendance */}
                        <div className={`absolute bottom-0 right-0 text-xs ${trendColor}`}>
                            {trendIcon}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-xs text-gray-500">
                        Aucune donnée
                    </div>
                )}
            </div>
        )
    }

    // Mode détaillé pour modal/sidebar
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{config.icon}</span>
                    <span className="text-sm font-semibold text-white">{config.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-sm ${trendColor}`}>{trendIcon}</span>
                    <span className="text-lg font-bold text-white">{currentValue.toFixed(1)}/10</span>
                </div>
            </div>

            {/* Graphique */}
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={data}>
                        <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={config.color}
                            strokeWidth={3}
                            dot={{ fill: config.color, r: 4 }}
                            activeDot={{ r: 6 }}
                            animationDuration={500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-32 text-sm text-gray-500">
                    <div className="text-center">
                        <div className="text-2xl mb-2">📊</div>
                        <div>Aucune donnée d'évolution</div>
                        <div className="text-xs mt-1">Ajoutez des mesures pour voir la tendance</div>
                    </div>
                </div>
            )}

            {/* Stats */}
            {data.length > 1 && (
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-gray-400">Départ</div>
                        <div className="font-semibold text-white">{data[0].value.toFixed(1)}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-gray-400">Variation</div>
                        <div className={`font-semibold ${trendColor}`}>
                            {(currentValue - data[0].value >= 0 ? '+' : '')}
                            {(currentValue - data[0].value).toFixed(1)}
                        </div>
                    </div>
                    <div className="text-center p-2 bg-gray-900/50 rounded">
                        <div className="text-gray-400">Points</div>
                        <div className="font-semibold text-white">{data.length}</div>
                    </div>
                </div>
            )}
        </motion.div>
    )
}

/**
 * CuringMultiGraph - Affichage de tous les graphiques d'évolution
 * 
 * @param {Object} evolutionData - { visual: [], odor: [], taste: [], effects: [] }
 * @param {Object} currentValues - { visual: 0, odor: 0, taste: 0, effects: 0 }
 */
export const CuringMultiGraph = ({ evolutionData = {}, currentValues = {} }) => {
    const types = ['visual', 'odor', 'taste', 'effects']

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {types.map(type => (
                <CuringEvolutionGraph
                    key={type}
                    type={type}
                    data={evolutionData[type] || []}
                    currentValue={currentValues[type] || 0}
                    compact={false}
                />
            ))}
        </div>
    )
}

export default CuringEvolutionGraph
