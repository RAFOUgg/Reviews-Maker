import React, { useState, useEffect } from 'react'
import { LiquidModal, LiquidButton, LiquidInput, LiquidChip } from '@/components/ui/LiquidUI'

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
        <LiquidModal
            isOpen={open}
            onClose={onClose}
            title={title}
            size="lg"
            glowColor="violet"
            footer={
                <div className="flex items-center justify-end gap-3">
                    <LiquidButton variant="ghost" onClick={onClose}>
                        Annuler
                    </LiquidButton>
                    <LiquidButton variant="primary" onClick={apply}>
                        Appliquer ({selected.length})
                    </LiquidButton>
                </div>
            }
        >
            <div className="space-y-4">
                <LiquidInput
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Rechercher..."
                    icon="🔍"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-auto">
                    {filtered.map(item => {
                        const active = selected.find(s => s.id === item.id)
                        return (
                            <LiquidChip
                                key={item.id}
                                selected={!!active}
                                onClick={() => toggleSelect(item)}
                                className="text-left p-3"
                            >
                                <div className="font-semibold text-sm">{item.label}</div>
                                {item.category && <div className="text-xs text-white/50">{item.category}</div>}
                            </LiquidChip>
                        )
                    })}
                </div>
            </div>
        </LiquidModal>
    )
}


