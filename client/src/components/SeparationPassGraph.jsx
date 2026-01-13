import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { TrendingUp, Award, Droplet } from 'lucide-react'

/**
 * SeparationPassGraph - Graphiques pour visualiser les passes de séparation
 * 
 * Features:
 * - Graphique en barres par passe (poids, qualité)
 * - Stats globales (rendement total, qualité moyenne)
 * - Couleurs par qualité (rouge < 5, jaune 5-7, vert 7-9, or ≥9)
 * - Mode compact et detailed
 */

/**
 * Graphique principal des passes de séparation
 */
const SeparationPassGraph = ({ passes = [], mode = 'detailed' }) => {
    if (!passes || passes.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-gray-400">
                <p className="text-sm">Aucune passe enregistrée</p>
            </div>
        )
    }

    // Préparer les données pour Recharts
    const chartData = passes.map((pass, index) => ({
        name: `#${pass.passNumber || index + 1}`,
        poids: pass.weight || 0,
        qualité: pass.quality || 0,
        microns: pass.microns || '?',
        melt: pass.melt || 0
    }))

    // Calculer les stats
    const totalWeight = passes.reduce((sum, p) => sum + (p.weight || 0), 0)
    const avgQuality = passes.length > 0
        ? (passes.reduce((sum, p) => sum + (p.quality || 0), 0) / passes.length).toFixed(1)
        : 0
    const premiumCount = passes.filter(p => (p.quality || 0) >= 8).length

    // Couleurs par qualité
    const getQualityColor = (quality) => {
        if (quality >= 9) return '#fbbf24' // Or
        if (quality >= 7) return '#10b981' // Vert
        if (quality >= 5) return '#f59e0b' // Jaune
        return '#ef4444' // Rouge
    }

    if (mode === 'compact') {
        return (
            <div className="space-y-2">
                {/* Stats compactes */}
                <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-blue-400" />
                        <span className="text-gray-400">{totalWeight.toFixed(1)}g</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Award className="w-3 h-3 text-yellow-400" />
                        <span className="text-gray-400">{avgQuality}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-gray-400">{premiumCount} premium</span>
                    </div>
                </div>

                {/* Mini graphique */}
                <ResponsiveContainer width="100%" height={80}>
                    <BarChart data={chartData}>
                        <Bar dataKey="poids" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getQualityColor(entry.qualité)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        )
    }

    // Mode detailed
    return (
        <div className="space-y-4">
            {/* Stats header */}
            <div className="grid grid-cols-3 gap-4">
                <StatsCard
                    icon={<Droplet className="w-5 h-5" />}
                    label="Rendement total"
                    value={`${totalWeight.toFixed(2)}g`}
                    color="blue"
                />
                <StatsCard
                    icon={<Award className="w-5 h-5" />}
                    label="Qualité moyenne"
                    value={`${avgQuality}/10`}
                    color="yellow"
                />
                <StatsCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Passes premium"
                    value={`${premiumCount}/${passes.length}`}
                    color="green"
                />
            </div>

            {/* Graphique principal */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-3">Rendement par passe</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                            dataKey="name"
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                        />
                        <Legend
                            wrapperStyle={{ fontSize: '12px' }}
                            iconType="circle"
                        />
                        <Bar
                            dataKey="poids"
                            name="Poids (g)"
                            radius={[8, 8, 0, 0]}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getQualityColor(entry.qualité)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Liste des passes */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-white">Détail des passes</h3>
                <div className="space-y-2">
                    {passes.map((pass, index) => (
                        <PassCard key={index} pass={pass} index={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Carte de stats
 */
const StatsCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
        yellow: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
        green: 'bg-green-500/10 border-green-500/30 text-green-400'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors[color]} border rounded-lg p-3 flex items-center gap-3`}
        >
            <div className={`${colors[color]}`}>
                {icon}
            </div>
            <div>
                <div className="text-xs text-gray-400">{label}</div>
                <div className="text-lg font-bold text-white">{value}</div>
            </div>
        </motion.div>
    )
}

/**
 * Carte d'une passe
 */
const PassCard = ({ pass, index }) => {
    const qualityColor =
        (pass.quality >= 9) ? 'bg-yellow-500/20 border-yellow-500/50' :
            (pass.quality >= 7) ? 'bg-green-500/20 border-green-500/50' :
                (pass.quality >= 5) ? 'bg-orange-500/20 border-orange-500/50' :
                    'bg-red-500/20 border-red-500/50'

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${qualityColor} border rounded-lg p-3`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-white">
                        #{pass.passNumber || index + 1}
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-white">
                            {pass.weight?.toFixed(2) || 0}g
                        </div>
                        <div className="text-xs text-gray-400">
                            {pass.microns}µm • {pass.duration || '?'}min
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-xs text-gray-400">Qualité</div>
                        <div className="text-sm font-bold text-white">
                            {pass.quality?.toFixed(1) || 0}/10
                        </div>
                    </div>
                    {pass.melt > 0 && (
                        <div className="text-right">
                            <div className="text-xs text-gray-400">Melt</div>
                            <div className="text-sm font-bold text-white">
                                {pass.melt?.toFixed(1)}/10
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {pass.notes && (
                <div className="mt-2 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">{pass.notes}</p>
                </div>
            )}
        </motion.div>
    )
}

/**
 * Tooltip personnalisé
 */
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload

    return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
            <div className="text-sm font-semibold text-white mb-2">
                Passe {data.name}
            </div>
            <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400">Poids:</span>
                    <span className="text-white font-semibold">{data.poids}g</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400">Qualité:</span>
                    <span className="text-white font-semibold">{data.qualité}/10</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400">Microns:</span>
                    <span className="text-white font-semibold">{data.microns}µm</span>
                </div>
                {data.melt > 0 && (
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-gray-400">Melt:</span>
                        <span className="text-white font-semibold">{data.melt}/10</span>
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Graphique de comparaison rendement
 */
export const SeparationYieldComparison = ({ passes = [], batchSize = 0 }) => {
    if (!passes || passes.length === 0) return null

    const totalYield = passes.reduce((sum, p) => sum + (p.weight || 0), 0)
    const yieldPercentage = batchSize > 0 ? ((totalYield / batchSize) * 100).toFixed(2) : 0

    const data = [
        { name: 'Matière', value: batchSize, fill: '#64748b' },
        { name: 'Hash obtenu', value: totalYield, fill: '#10b981' },
        { name: 'Perte', value: Math.max(0, batchSize - totalYield), fill: '#ef4444' }
    ]

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Rendement global</h3>
                <div className="text-2xl font-bold text-green-400">
                    {yieldPercentage}%
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                        }}
                        formatter={(value) => `${value}g`}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default SeparationPassGraph

