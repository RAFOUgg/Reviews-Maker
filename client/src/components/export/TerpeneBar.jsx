import React from 'react'

export default function TerpeneBar({ profile = [], maxWidth = 300 }) {
    // profile = [{ name, percent }]
    const total = profile.reduce((s, p) => s + (p.percent || 0), 0) || 0
    return (
        <div className="space-y-2">
            {profile.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-gray-300 truncate">{p.name}</div>
                    <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                        <div
                            style={{ width: `${Math.min(100, (p.percent || 0) / (total || 100) * 100)}%`, background: '#10B981' }}
                            className="h-3 rounded-full"
                        />
                    </div>
                    <div className="w-10 text-right text-xs font-semibold">{p.percent ?? 0}%</div>
                </div>
            ))}
        </div>
    )
}
