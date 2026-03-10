import React from 'react'

function getScoreColor(score, max = 10) {
    const pct = (score / max) * 100
    if (pct >= 80) return '#A78BFA'
    if (pct >= 60) return '#22C55E'
    if (pct >= 40) return '#F59E0B'
    return '#EF4444'
}

export default function ScoreGauge({ score, max = 10, size = 64, label, showMax = true }) {
    const s = Math.min(max, Math.max(0, Number(score) || 0))
    const pct = s / max
    const r = (size - 8) / 2
    const circ = 2 * Math.PI * r
    const offset = circ * (1 - pct)
    const color = getScoreColor(s, max)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none" stroke={color} strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ filter: `drop-shadow(0 0 4px ${color}50)` }}
                    />
                </svg>
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{
                        fontSize: size * 0.32, fontWeight: 800,
                        color: '#fff', lineHeight: 1,
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {typeof s === 'number' ? (Number.isInteger(s) ? s : s.toFixed(1)) : '—'}
                    </span>
                    {showMax && (
                        <span style={{ fontSize: size * 0.13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>/{max}</span>
                    )}
                </div>
            </div>
            {label && (
                <span style={{
                    fontSize: '9px', fontWeight: 600,
                    color: 'rgba(255,255,255,0.45)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    textAlign: 'center',
                }}>{label}</span>
            )}
        </div>
    )
}
