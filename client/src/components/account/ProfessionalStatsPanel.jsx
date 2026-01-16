import { useMemo, useState } from 'react'

export default function ProfessionalStatsPanel({ reviews = [], stats = {} }) {
    const [productType, setProductType] = useState('all')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [minRating, setMinRating] = useState(0)
    const [maxRating, setMaxRating] = useState(10)

    const productTypes = useMemo(() => {
        const setTypes = new Set()
        reviews.forEach(r => r.type && setTypes.add(r.type))
        return Array.from(setTypes)
    }, [reviews])

    const filtered = useMemo(() => {
        return reviews.filter(r => {
            if (productType !== 'all' && r.type !== productType) return false
            if (startDate && new Date(r.createdAt) < new Date(startDate)) return false
            if (endDate && new Date(r.createdAt) > new Date(endDate)) return false
            const rating = parseFloat(r.overallRating) || 0
            if (rating < minRating || rating > maxRating) return false
            return true
        })
    }, [reviews, productType, startDate, endDate, minRating, maxRating])

    const byType = useMemo(() => {
        const map = {}
        filtered.forEach(r => {
            const t = r.type || 'Unknown'
            map[t] = map[t] || { count: 0, totalRating: 0 }
            const rating = parseFloat(r.overallRating) || 0
            map[t].count += 1
            map[t].totalRating += rating
        })
        return map
    }, [filtered])

    const overall = useMemo(() => {
        if (!filtered.length) return { count: 0, avg: 0 }
        const total = filtered.reduce((s, r) => s + (parseFloat(r.overallRating) || 0), 0)
        return { count: filtered.length, avg: Math.round((total / filtered.length) * 10) / 10 }
    }, [filtered])

    return (
        <div className="bg-theme-surface backdrop-blur-sm rounded-xl p-6 shadow-sm border border-theme mb-8">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-4">Statistiques professionnelles</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="text-sm text-[rgb(var(--text-secondary))]">Type de produit</label>
                    <select className="w-full mt-2 p-2 rounded bg-theme-input" value={productType} onChange={e => setProductType(e.target.value)}>
                        <option value="all">Tous</option>
                        {productTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-sm text-[rgb(var(--text-secondary))]">Date début</label>
                    <input className="w-full mt-2 p-2 rounded bg-theme-input" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>

                <div>
                    <label className="text-sm text-[rgb(var(--text-secondary))]">Date fin</label>
                    <input className="w-full mt-2 p-2 rounded bg-theme-input" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>

                <div>
                    <label className="text-sm text-[rgb(var(--text-secondary))]">Note (min - max)</label>
                    <div className="flex gap-2 mt-2">
                        <input className="w-1/2 p-2 rounded bg-theme-input" type="number" min={0} max={10} step={0.1} value={minRating} onChange={e => setMinRating(Number(e.target.value))} />
                        <input className="w-1/2 p-2 rounded bg-theme-input" type="number" min={0} max={10} step={0.1} value={maxRating} onChange={e => setMaxRating(Number(e.target.value))} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] text-white">
                    <p className="text-sm opacity-90">Reviews filtrés</p>
                    <p className="text-3xl font-bold">{overall.count}</p>
                </div>
                <div className="p-4 rounded-lg bg-theme-surface border border-theme">
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Note moyenne (filtrée)</p>
                    <p className="text-3xl font-bold">{overall.avg}/10</p>
                </div>
                <div className="p-4 rounded-lg bg-theme-surface border border-theme">
                    <p className="text-sm text-[rgb(var(--text-secondary))]">Total reviews</p>
                    <p className="text-3xl font-bold">{stats.totalReviews || 0}</p>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="font-bold mb-2">Détail par type de produit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(byType).length === 0 ? (
                        <p className="text-[rgb(var(--text-secondary))] opacity-80">Aucun résultat pour les filtres sélectionnés.</p>
                    ) : (
                        Object.entries(byType).map(([t, v]) => (
                            <div key={t} className="p-4 rounded border border-theme bg-theme-input">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium">{t}</div>
                                    <div className="text-sm text-[rgb(var(--text-secondary))]">{v.count} review{v.count > 1 ? 's' : ''}</div>
                                </div>
                                <div className="text-sm">Note moyenne: {(v.totalRating / v.count).toFixed(1)}/10</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div>
                <h3 className="font-bold mb-2">Filtres avancés</h3>
                <p className="text-sm text-[rgb(var(--text-secondary))] opacity-80">Vous pouvez combiner type, période et note pour obtenir des rapports précis. Les exportations CSV/PDF peuvent être ajoutées plus tard.</p>
            </div>
        </div>
    )
}
