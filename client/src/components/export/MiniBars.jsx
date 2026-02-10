import React from 'react'

export default function MiniBars({ items = [], max = 10 }) {
    return (
        <div className="space-y-2">
            {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-300 truncate">{it.label}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                        <div
                            style={{ width: `${Math.min(100, (Number(it.value || 0) / max) * 100)}%`, background: it.color || '#F59E0B' }}
                            className="h-3 rounded-full shadow-inner"
                        />
                    </div>
                    <div className="w-10 text-right text-xs font-semibold">{it.value ?? '-'}</div>
                </div>
            ))}
        </div>
    )
}
