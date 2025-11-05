import React, { useState, useEffect } from 'react'

export default function QuickSelectModal({ open, onClose, items = [], onApply, multiple = true, title = 'Sélection rapide', initialSelected = [] }) {
    const [query, setQuery] = useState('')
    const [filtered, setFiltered] = useState(items)
    const [selected, setSelected] = useState(initialSelected || [])

    useEffect(() => {
        setFiltered(
            items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || (i.aliases || []).some(a => a.toLowerCase().includes(query.toLowerCase())))
        )
    }, [query, items])

    useEffect(() => {
        setSelected(initialSelected || [])
    }, [initialSelected])

    if (!open) return null

    const toggleSelect = (item) => {
        if (!multiple) return onApply([item])
        setSelected(prev => {
            const exists = prev.find(p => p.id === item.id)
            if (exists) return prev.filter(p => p.id !== item.id)
            return [...prev, item]
        })
    }

    const apply = () => {
        onApply(selected)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
            <div className="relative bg-gray-900 rounded-xl w-full max-w-2xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="mb-3">
                    <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Rechercher..." className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-white" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto mb-3">
                    {filtered.map(item => {
                        const active = selected.find(s => s.id === item.id)
                        return (
                            <button key={item.id} onClick={() => toggleSelect(item)} className={`text-left p-2 rounded-md border ${active ? 'bg-green-600 text-white border-green-600' : 'bg-gray-800 text-gray-200 border-gray-700'} transition-colors`}>
                                <div className="font-semibold text-sm">{item.label}</div>
                                {item.category && <div className="text-xs text-gray-400">{item.category}</div>}
                            </button>
                        )
                    })}
                </div>

                <div className="flex items-center justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-800 text-gray-300">Annuler</button>
                    <button onClick={apply} className="px-4 py-2 rounded-md bg-green-600 text-white">Appliquer ({selected.length})</button>
                </div>
            </div>
        </div>
    )
}
