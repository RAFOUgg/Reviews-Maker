/**
 * PurityGraph.jsx
 * 
 * Composants de visualisation pour Pipeline Purification
 * - PurityComparisonGraph: Graphique avant/après avec gain
 * - MethodComparisonGraph: Comparaison de plusieurs méthodes
 * - YieldVsPurityScatter: Nuage de points rendement vs pureté
 * - PurityEvolutionLine: Évolution pureté sur plusieurs passes
 * 
 * Conforme CDC - Phase 4
 */

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { TrendingUp, TrendingDown, Award, AlertCircle, Droplet, Beaker } from 'lucide-react'

/**
 * Graphique principal: Comparaison pureté avant/après
 */
export function PurityComparisonGraph({ data, compact = false }) {
    if (!data || !data.purity_before || !data.purity_after) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Données de pureté manquantes</span>
            </div>
        )
    }

    const chartData = [
        {
            name: 'Avant',
            pureté: parseFloat(data.purity_before) || 0,
            fill: '#94a3b8'
        },
        {
            name: 'Après',
            pureté: parseFloat(data.purity_after) || 0,
            fill: '#10b981'
        }
    ]

    const gain = (data.purity_after || 0) - (data.purity_before || 0)
    const gainPercent = data.purity_before > 0 ? ((gain / data.purity_before) * 100).toFixed(1) : 0

    const getPurityColor = (value) => {
        if (value >= 99) return '#fbbf24' // Or - Ultra pure
        if (value >= 95) return '#10b981' // Vert - Excellente
        if (value >= 90) return '#3b82f6' // Bleu - Bonne
        if (value >= 80) return '#f59e0b' // Orange - Moyenne
        return '#ef4444' // Rouge - Faible
    }

    if (compact) {
        return (
            <div className="space-y-3">
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(10px)'
                            }}
                            labelStyle={{ color: '#e2e8f0' }}
                        />
                        <Bar dataKey="pureté" radius={[6, 6, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getPurityColor(entry.pureté)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-2">
                    <StatsCard
                        icon={<Droplet className="w-4 h-4" />}
                        label="Gain"
                        value={`+${gain.toFixed(1)}%`}
                        color={gain > 0 ? 'text-green-400' : 'text-red-400'}
                        compact
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-4 h-4" />}
                        label="Amélioration"
                        value={`${gainPercent}%`}
                        color="text-blue-400"
                        compact
                    />
                    <StatsCard
                        icon={<Award className="w-4 h-4" />}
                        label="Finale"
                        value={`${data.purity_after}%`}
                        color={getPurityColor(data.purity_after).replace('#', 'text-')}
                        compact
                    />
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 space-y-6"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-purple-400" />
                    Comparaison Pureté
                </h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${gain > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {gain > 0 ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                    <span className={gain > 0 ? 'text-green-400' : 'text-red-400'}>
                        {gain > 0 ? '+' : ''}{gain.toFixed(1)}%
                    </span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 13 }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 13 }} domain={[0, 100]} label={{ value: 'Pureté (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        formatter={(value) => [`${value.toFixed(2)}%`, 'Pureté']}
                    />
                    <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Seuil 90%', fill: '#f59e0b', fontSize: 11 }} />
                    <ReferenceLine y={95} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Seuil 95%', fill: '#10b981', fontSize: 11 }} />
                    <Bar dataKey="pureté" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getPurityColor(entry.pureté)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            <div className="grid grid-cols-4 gap-4">
                <StatsCard
                    icon={<Droplet className="w-5 h-5" />}
                    label="Pureté initiale"
                    value={`${data.purity_before}%`}
                    color="text-gray-400"
                />
                <StatsCard
                    icon={<Award className="w-5 h-5" />}
                    label="Pureté finale"
                    value={`${data.purity_after}%`}
                    color={getPurityColor(data.purity_after).replace('#', 'text-')}
                />
                <StatsCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Gain absolu"
                    value={`+${gain.toFixed(1)}%`}
                    color={gain > 0 ? 'text-green-400' : 'text-red-400'}
                />
                <StatsCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    label="Amélioration"
                    value={`${gainPercent}%`}
                    color="text-blue-400"
                />
            </div>
        </motion.div>
    )
}

/**
 * Graphique d'évolution de pureté sur plusieurs passes
 */
export function PurityEvolutionLine({ passes }) {
    if (!passes || passes.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Aucune donnée de passe disponible</span>
            </div>
        )
    }

    const chartData = passes.map((pass, index) => ({
        pass: `Pass ${index + 1}`,
        pureté: parseFloat(pass.purity || 0),
        rendement: parseFloat(pass.yield || 0)
    }))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 space-y-4"
        >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Évolution de la Pureté
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="pass" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} label={{ value: 'Pureté (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" tick={{ fill: '#f59e0b', fontSize: 12 }} domain={[0, 100]} label={{ value: 'Rendement (%)', angle: 90, position: 'insideRight', fill: '#f59e0b' }} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="pureté" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} activeDot={{ r: 7 }} name="Pureté (%)" />
                    <Line yAxisId="right" type="monotone" dataKey="rendement" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#f59e0b', r: 4 }} name="Rendement (%)" />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    )
}

/**
 * Nuage de points: Rendement vs Pureté
 */
export function YieldVsPurityScatter({ methods }) {
    if (!methods || methods.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Aucune donnée de méthode disponible</span>
            </div>
        )
    }

    const chartData = methods.map(method => ({
        method: method.name || 'Sans nom',
        rendement: parseFloat(method.yield_percentage || 0),
        pureté: parseFloat(method.purity_after || 0),
        fill: method.color || '#3b82f6'
    }))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 space-y-4"
        >
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Rendement vs Pureté
            </h3>

            <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="rendement" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Rendement (%)', position: 'insideBottom', offset: -10, fill: '#94a3b8' }} domain={[0, 100]} />
                    <YAxis dataKey="pureté" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} label={{ value: 'Pureté (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} domain={[0, 100]} />
                    <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                        formatter={(value, name) => [
                            `${value.toFixed(1)}%`,
                            name === 'rendement' ? 'Rendement' : 'Pureté'
                        ]}
                    />
                    <Scatter data={chartData} fill="#8884d8">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Scatter>
                    <ReferenceLine y={95} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Pureté 95%', fill: '#10b981', fontSize: 11 }} />
                    <ReferenceLine x={80} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Rendement 80%', fill: '#f59e0b', fontSize: 11, angle: 90 }} />
                </ScatterChart>
            </ResponsiveContainer>

            <div className="text-sm text-gray-400 text-center">
                Zone optimale: Rendement &gt; 80% + Pureté &gt; 95%
            </div>
        </motion.div>
    )
}

/**
 * Comparaison de plusieurs méthodes
 */
export function MethodComparisonGraph({ methods, compact = false }) {
    if (!methods || methods.length === 0) {
        return (
            <div className="flex items-center justify-center h-40 text-gray-400">
                <AlertCircle className="w-5 h-5 mr-2" />
                <span>Aucune méthode à comparer</span>
            </div>
        )
    }

    const chartData = methods.map(method => ({
        name: method.name || 'Sans nom',
        'Pureté finale': parseFloat(method.purity_after || 0),
        'Rendement': parseFloat(method.yield_percentage || 0),
        'Gain pureté': parseFloat(method.purity_gain || 0)
    }))

    const height = compact ? 200 : 320

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={compact ? 'space-y-3' : 'glass-panel p-6 space-y-4'}
        >
            {!compact && (
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Beaker className="w-5 h-5 text-cyan-400" />
                    Comparaison des Méthodes
                </h3>
            )}

            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            backdropFilter: 'blur(10px)'
                        }}
                        labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Bar dataKey="Pureté finale" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Rendement" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gain pureté" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    )
}

/**
 * Carte de statistique réutilisable
 */
function StatsCard({ icon, label, value, color = 'text-white', compact = false }) {
    return (
        <div className={`glass-panel ${compact ? 'p-2' : 'p-4'} flex flex-col items-center justify-center text-center`}>
            <div className={`${color} mb-1`}>{icon}</div>
            <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-400 mb-1`}>{label}</div>
            <div className={`${compact ? 'text-base' : 'text-xl'} font-bold ${color}`}>{value}</div>
        </div>
    )
}

export default PurityComparisonGraph


