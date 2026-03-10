import React from 'react'

function getBarColor(value, max) {
    const pct = (value / max) * 100
    if (pct >= 80) return '#A78BFA'
    if (pct >= 60) return '#22C55E'
    if (pct >= 40) return '#F59E0B'
    return '#EF4444'
}

export default function MiniBars({ items = [], max = 10, compact = false }) {
    if (!items.length) return null
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '3px' : '5px' }}>
            {items.map((it, idx) => {
                const pct = Math.min(100, (Number(it.value || 0) / max) * 100)
                const barColor = it.color || getBarColor(it.value, max)
                return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: compact ? '58px' : '70px',
                            fontSize: compact ? '8px' : '9px',
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.5)',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>{it.label}</div>
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
                                background: `linear-gradient(90deg, ${barColor}CC, ${barColor})`,
                                boxShadow: `0 0 8px ${barColor}30`,
                            }} />
                        </div>
                        <div style={{
                            width: '26px',
                            fontSize: compact ? '9px' : '10px',
                            fontWeight: 700,
                            textAlign: 'right',
                            color: 'rgba(255,255,255,0.85)',
                            fontVariantNumeric: 'tabular-nums',
                        }}>{it.value ?? '-'}</div>
                    </div>
                )
            })}
        </div>
    )
}
