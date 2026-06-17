import React, { useState, useEffect, useRef } from 'react'
import { Flower2, Search, X, ChevronDown, Leaf } from 'lucide-react'

/**
 * ParentFlowerSelector
 * Permet de lier un hash/concentré à une review fleur parente.
 * Charge les reviews 'Fleurs' de l'utilisateur et affiche un dropdown de recherche.
 */
export default function ParentFlowerSelector({ value, onChange }) {
    const [flowerReviews, setFlowerReviews] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const dropdownRef = useRef(null)
    const selectedReview = flowerReviews.find(r => r.id === value) || null

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        fetch('/api/reviews/my', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                if (cancelled) return
                const flowers = (Array.isArray(data) ? data : []).filter(r => r.type === 'Fleurs' || r.productType === 'flower')
                setFlowerReviews(flowers)
            })
            .catch(() => {})
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    const filtered = flowerReviews.filter(r =>
        !search || r.holderName?.toLowerCase().includes(search.toLowerCase()) ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.cultivars?.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = (review) => {
        onChange(review.id)
        setOpen(false)
        setSearch('')
    }

    const handleClear = (e) => {
        e.stopPropagation()
        onChange(null)
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-white/70">
                <Flower2 className="inline w-4 h-4 mr-1.5 text-green-400" />
                Review fleur parente (matière première)
            </label>

            <div ref={dropdownRef} className="relative">
                {/* Trigger */}
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
                >
                    {selectedReview ? (
                        <>
                            <Leaf className="w-4 h-4 text-green-400 shrink-0" />
                            <span className="flex-1 text-white text-sm font-medium truncate">
                                {selectedReview.holderName || selectedReview.name}
                            </span>
                            {selectedReview.cultivars && (
                                <span className="text-xs text-white/40 truncate max-w-[120px]">{selectedReview.cultivars}</span>
                            )}
                            <button
                                type="button"
                                onClick={handleClear}
                                className="ml-auto p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors shrink-0"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4 text-white/30 shrink-0" />
                            <span className="flex-1 text-white/30 text-sm">
                                {loading ? 'Chargement...' : 'Sélectionner une review fleur'}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-white/30 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
                        </>
                    )}
                </button>

                {/* Dropdown */}
                {open && (
                    <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/15 bg-gray-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                        {/* Search */}
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

                        {/* Options */}
                        <div className="max-h-52 overflow-y-auto">
                            {flowerReviews.length === 0 && !loading && (
                                <div className="px-4 py-6 text-center text-sm text-white/40">
                                    Aucune review fleur trouvée
                                </div>
                            )}
                            {filtered.length === 0 && flowerReviews.length > 0 && (
                                <div className="px-4 py-4 text-center text-sm text-white/40">
                                    Aucun résultat
                                </div>
                            )}
                            {filtered.map(review => (
                                <button
                                    key={review.id}
                                    type="button"
                                    onClick={() => handleSelect(review)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left ${
                                        value === review.id ? 'bg-green-500/10 border-l-2 border-green-400' : ''
                                    }`}
                                >
                                    <Leaf className="w-4 h-4 text-green-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">
                                            {review.holderName || review.name}
                                        </div>
                                        {review.cultivars && (
                                            <div className="text-xs text-white/40 truncate">{review.cultivars}</div>
                                        )}
                                    </div>
                                    {review.note != null && (
                                        <span className="text-xs font-bold text-amber-400 shrink-0">{review.note}/10</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Footer — option aucun */}
                        {value && (
                            <div className="border-t border-white/10 p-2">
                                <button
                                    type="button"
                                    onClick={() => { onChange(null); setOpen(false) }}
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                    Retirer la liaison
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedReview && (
                <p className="text-xs text-green-400/70 flex items-center gap-1">
                    <Leaf className="w-3 h-3" />
                    Lié à : {selectedReview.holderName || selectedReview.name}
                </p>
            )}
        </div>
    )
}
