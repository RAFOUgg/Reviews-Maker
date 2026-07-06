import React, { useState, useEffect, useRef } from 'react'

/**
 * Autocomplete texte branché sur la bibliothèque de cultivars de l'utilisateur (/api/cultivars) —
 * évite de retaper à la main un nom déjà documenté ailleurs (Bibliothèque > Cultivars). Fetch une
 * seule fois puis filtrage côté client (même approche que SourceLineageSelector.jsx), la valeur
 * stockée reste un simple texte (pas de FK), donc un nom hors bibliothèque reste saisissable.
 */
export default function CultivarAutocomplete({ value = '', onChange, placeholder = '' }) {
    const [cultivars, setCultivars] = useState([])
    const [open, setOpen] = useState(false)
    const containerRef = useRef(null)

    useEffect(() => {
        let cancelled = false
        fetch('/api/cultivars', { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .then(data => { if (!cancelled) setCultivars(Array.isArray(data) ? data : []) })
            .catch(() => {})
        return () => { cancelled = true }
    }, [])

    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const needle = (value || '').toLowerCase()
    const filtered = cultivars
        .filter(c => !needle || c.name?.toLowerCase().includes(needle))
        .slice(0, 8)

    return (
        <div ref={containerRef} className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => { onChange(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder || 'Nom du cultivar...'}
                className="liquid-input w-full"
            />
            {open && filtered.length > 0 && (
                <div className="absolute z-30 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl">
                    {filtered.map(c => (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => { onChange(c.name); setOpen(false) }}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-white/10 transition-colors"
                        >
                            <span className="text-sm text-white truncate">{c.name}</span>
                            {c.breeder && <span className="text-xs text-white/40 truncate ml-2">{c.breeder}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
