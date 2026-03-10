import React from 'react'

const TERPENE_COLORS = {
    myrcene: '#22C55E', myrcène: '#22C55E',
    limonene: '#EAB308', limonène: '#EAB308',
    caryophyllene: '#F97316', caryophyllène: '#F97316',
    linalool: '#A78BFA', linalol: '#A78BFA',
    pinene: '#059669', pinène: '#059669',
    terpinolene: '#06B6D4', terpinolène: '#06B6D4',
    humulene: '#D97706', humulène: '#D97706',
    ocimene: '#EC4899', ocimène: '#EC4899',
    bisabolol: '#8B5CF6',
    nerolidol: '#F472B6', nérolidol: '#F472B6',
    guaiol: '#38BDF8',
}

function getTerpColor(name) {
    const k = (name || '').toLowerCase().trim()
    for (const [t, c] of Object.entries(TERPENE_COLORS)) {
        if (k.includes(t)) return c
    }
    return '#64748B'
}

export default function TerpeneBar({ profile = [], compact = false }) {
    if (!profile.length) return null
    const maxPct = Math.max(...profile.map(p => p.percent || 0), 0.1)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '3px' : '5px' }}>
            {profile.slice(0, compact ? 5 : 8).map((p, i) => {
                const pct = Math.min(100, ((p.percent || 0) / maxPct) * 100)
                const color = getTerpColor(p.name)
                return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: compact ? '54px' : '68px',
                            fontSize: compact ? '8px' : '9px',
                            fontWeight: 600,
                            color: color,
                            letterSpacing: '0.02em',
                            textTransform: 'capitalize',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>{p.name}</div>
                        <div style={{
                            flex: 1,
                            height: compact ? '3px' : '5px',
                            borderRadius: '3px',
                            background: 'rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                width: `${pct}%`,
                                height: '100%',
                                borderRadius: '3px',
                                background: `linear-gradient(90deg, ${color}AA, ${color})`,
                                boxShadow: `0 0 6px ${color}30`,
                            }} />
                        </div>
                        <div style={{
                            width: '34px',
                            fontSize: compact ? '8px' : '9px',
                            fontWeight: 700,
                            textAlign: 'right',
                            color: 'rgba(255,255,255,0.7)',
                            fontVariantNumeric: 'tabular-nums',
                        }}>{(p.percent || 0).toFixed(1)}%</div>
                    </div>
                )
            })}
        </div>
    )
}
