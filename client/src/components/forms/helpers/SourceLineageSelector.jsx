import React, { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react'
import { Search, X, ChevronDown, Plus, Flower2, Link2 } from 'lucide-react'
import { TYPE_META } from '../../../utils/reviewTypeMeta'

/**
 * SourceLineageSelector
 * Sélecteur multi-source pour lier une review à un ou plusieurs produits "matière première"
 * (ex: un concentré peut être fabriqué à partir de plusieurs fleurs et/ou hash).
 * allowedTypes: sous-ensemble de ['flower', 'hash', 'concentrate'] selon le type de produit courant.
 * value: tableau [{ type, id, label, cultivars }]
 * onChange(newValue, aggregatedCultivars): aggregatedCultivars = liste dédupliquée des cultivars
 *   de toutes les sources liées, pratique pour auto-remplir le champ Cultivar(s) utilisés.
 * compact: variante sans label ni bloc pleine largeur — un petit bouton "Lier une fiche" +
 *   chips, pensée pour se poser directement sous le champ texte "Matière première(s) utilisée(s)"
 *   (même question : soit on tape, soit on lie une fiche existante — pas deux sections séparées).
 */
export default function SourceLineageSelector({ value = [], onChange, allowedTypes = ['flower'], compact = false }) {
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const dropdownRef = useRef(null)
    // Positionnement intelligent du panneau déroulant : celui-ci vivait en `position: absolute`
    // relatif à son bouton, ce qui le fait déborder hors du viewport (ou d'un ancêtre à overflow
    // limité) dès que le champ est proche du bord droit/bas de l'écran — inaccessible au clic.
    // On le passe en `position: fixed` avec des coordonnées calculées après montage (comme
    // NodeContextMenu.jsx), et on le recale/retourne (au-dessus, ou aligné à droite) s'il
    // déborderait sinon.
    const triggerRef = useRef(null)
    const panelRef = useRef(null)
    const [panelStyle, setPanelStyle] = useState({ position: 'fixed', top: -9999, left: -9999 })

    useLayoutEffect(() => {
        if (!open) return
        const compute = () => {
            const trigger = triggerRef.current
            const panel = panelRef.current
            if (!trigger || !panel) return
            const margin = 8
            const triggerRect = trigger.getBoundingClientRect()
            const panelWidth = panel.offsetWidth || 288
            const panelHeight = panel.offsetHeight || 300

            let left = triggerRect.left
            if (left + panelWidth > window.innerWidth - margin) {
                left = Math.max(margin, triggerRect.right - panelWidth)
            }
            left = Math.max(margin, left)

            let top = triggerRect.bottom + 8
            if (top + panelHeight > window.innerHeight - margin) {
                const upTop = triggerRect.top - panelHeight - 8
                top = upTop >= margin ? upTop : Math.max(margin, window.innerHeight - panelHeight - margin)
            }

            setPanelStyle({ position: 'fixed', left, top, width: compact ? panelWidth : triggerRect.width })
        }
        compute()
        window.addEventListener('resize', compute)
        window.addEventListener('scroll', compute, true)

        // Le contenu du panneau change de hauteur de façon asynchrone (liste de candidats
        // chargée après le premier calcul de position, résultats de recherche qui filtrent la
        // liste) — sans ResizeObserver, la position calculée au premier rendu (panneau encore
        // vide/court) devient fausse une fois le contenu réel affiché, et le panneau déborde en
        // bas de l'écran sans jamais se recorriger.
        let resizeObserver
        if (panelRef.current && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => compute())
            resizeObserver.observe(panelRef.current)
        }

        return () => {
            window.removeEventListener('resize', compute)
            window.removeEventListener('scroll', compute, true)
            resizeObserver?.disconnect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        fetch('/api/reviews/my', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (cancelled) return
                const list = Array.isArray(data) ? data : []
                const allowedApiTypes = allowedTypes.map(t => TYPE_META[t]?.apiType).filter(Boolean)
                const filtered = list
                    .filter(r => allowedApiTypes.includes(r.type))
                    .map(r => ({
                        id: r.id,
                        type: allowedTypes.find(t => TYPE_META[t]?.apiType === r.type),
                        label: r.holderName || r.name,
                        cultivars: r.cultivars || '',
                        note: r.note,
                    }))
                setCandidates(filtered)
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowedTypes.join(',')])

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    const selectedIds = useMemo(() => new Set(value.map(v => v.id)), [value])

    const filtered = candidates.filter(c =>
        !selectedIds.has(c.id) &&
        (!search || c.label?.toLowerCase().includes(search.toLowerCase()) || c.cultivars?.toLowerCase().includes(search.toLowerCase()))
    )

    const computeAggregatedCultivars = (sources) => {
        const all = sources.flatMap(s => (s.cultivars || '').split(',').map(c => c.trim()).filter(Boolean))
        return [...new Set(all)]
    }

    const handleAdd = (candidate) => {
        const next = [...value, candidate]
        onChange(next, computeAggregatedCultivars(next))
        setSearch('')
    }

    const handleRemove = (id) => {
        const next = value.filter(v => v.id !== id)
        onChange(next, computeAggregatedCultivars(next))
    }

    const allowedLabels = allowedTypes.map(t => TYPE_META[t]?.label).join(' / ')

    if (compact) {
        return (
            <div className="space-y-1.5">
                {value.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {value.map(v => {
                            const meta = TYPE_META[v.type] || TYPE_META.flower
                            const Icon = meta.icon
                            return (
                                <span
                                    key={v.id}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs"
                                >
                                    <Icon className={`w-3 h-3 ${meta.color}`} />
                                    <span className="text-white">{v.label}</span>
                                    <button type="button" onClick={() => handleRemove(v.id)} className="text-white/40 hover:text-red-400 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                )}

                <div ref={dropdownRef} className="relative inline-block">
                    <button
                        ref={triggerRef}
                        type="button"
                        onClick={() => setOpen(o => !o)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/15 hover:bg-green-500/25 text-green-300 hover:text-green-200 text-[11px] font-medium transition-colors"
                    >
                        <Link2 className="w-3 h-3" />
                        Lier une fiche {allowedLabels}
                    </button>

                    {open && (
                        <div ref={panelRef} style={panelStyle} className="z-50 rounded-xl border border-white/15 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                            <div className="p-2 border-b border-white/10">
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                                    <Search className="w-4 h-4 text-white/40 shrink-0" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Rechercher..."
                                        className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="max-h-52 overflow-y-auto">
                                {candidates.length === 0 && !loading && (
                                    <div className="px-4 py-6 text-center text-sm text-white/40">
                                        Aucune review {allowedLabels} trouvée
                                    </div>
                                )}
                                {filtered.length === 0 && candidates.length > 0 && (
                                    <div className="px-4 py-4 text-center text-sm text-white/40">
                                        {candidates.length === selectedIds.size ? 'Toutes les reviews disponibles sont déjà liées' : 'Aucun résultat'}
                                    </div>
                                )}
                                {filtered.map(candidate => {
                                    const meta = TYPE_META[candidate.type] || TYPE_META.flower
                                    const Icon = meta.icon
                                    return (
                                        <button
                                            key={candidate.id}
                                            type="button"
                                            onClick={() => handleAdd(candidate)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${meta.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-white truncate">{candidate.label}</div>
                                                {candidate.cultivars && (
                                                    <div className="text-xs text-white/40 truncate">{candidate.cultivars}</div>
                                                )}
                                            </div>
                                            {candidate.note != null && (
                                                <span className="text-xs font-bold text-amber-400 shrink-0">{candidate.note}/10</span>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-white/70">
                <Flower2 className="inline w-4 h-4 mr-1.5 text-green-400" />
                Matière(s) première(s) ({allowedLabels})
            </label>

            {/* Chips des sources sélectionnées */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map(v => {
                        const meta = TYPE_META[v.type] || TYPE_META.flower
                        const Icon = meta.icon
                        return (
                            <span
                                key={v.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm"
                            >
                                <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                                <span className="text-white">{v.label}</span>
                                {v.cultivars && <span className="text-white/40 text-xs">({v.cultivars})</span>}
                                <button type="button" onClick={() => handleRemove(v.id)} className="ml-1 text-white/40 hover:text-red-400 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        )
                    })}
                </div>
            )}

            <div ref={dropdownRef} className="relative">
                <button
                    ref={triggerRef}
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
                >
                    <Plus className="w-4 h-4 text-white/30 shrink-0" />
                    <span className="flex-1 text-white/30 text-sm">
                        {loading ? 'Chargement...' : `Ajouter une review ${allowedLabels}`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-white/30 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                    <div ref={panelRef} style={panelStyle} className="z-50 rounded-xl border border-white/15 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                        <div className="p-2 border-b border-white/10">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                                <Search className="w-4 h-4 text-white/40 shrink-0" />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                                />
                            </div>
                        </div>

                        <div className="max-h-52 overflow-y-auto">
                            {candidates.length === 0 && !loading && (
                                <div className="px-4 py-6 text-center text-sm text-white/40">
                                    Aucune review {allowedLabels} trouvée
                                </div>
                            )}
                            {filtered.length === 0 && candidates.length > 0 && (
                                <div className="px-4 py-4 text-center text-sm text-white/40">
                                    {candidates.length === selectedIds.size ? 'Toutes les reviews disponibles sont déjà liées' : 'Aucun résultat'}
                                </div>
                            )}
                            {filtered.map(candidate => {
                                const meta = TYPE_META[candidate.type] || TYPE_META.flower
                                const Icon = meta.icon
                                return (
                                    <button
                                        key={candidate.id}
                                        type="button"
                                        onClick={() => handleAdd(candidate)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                                    >
                                        <Icon className={`w-4 h-4 shrink-0 ${meta.color}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-white truncate">{candidate.label}</div>
                                            {candidate.cultivars && (
                                                <div className="text-xs text-white/40 truncate">{candidate.cultivars}</div>
                                            )}
                                        </div>
                                        {candidate.note != null && (
                                            <span className="text-xs font-bold text-amber-400 shrink-0">{candidate.note}/10</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
