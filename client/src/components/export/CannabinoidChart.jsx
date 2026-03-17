/**
 * CannabinoidChart — Full cannabinoid profile visualization
 * Export-safe: inline styles only, no Tailwind/className
 */

const CANNABINOID_COLORS = {
    thc: '#22C55E',   // green
    cbd: '#3B82F6',   // blue
    cbg: '#A78BFA',   // purple
    cbc: '#EC4899',   // pink
    cbn: '#F97316',   // orange
    thcv: '#06B6D4',  // cyan
}

const CANNABINOID_LABELS = {
    thc: 'THC',
    cbd: 'CBD',
    cbg: 'CBG',
    cbc: 'CBC',
    cbn: 'CBN',
    thcv: 'THCV',
}

export default function CannabinoidChart({ thc, cbd, cbg, cbc, cbn, thcv, labReportUrl, compact = false }) {
    const entries = [
        { key: 'thc', value: thc },
        { key: 'cbd', value: cbd },
        { key: 'cbg', value: cbg },
        { key: 'cbc', value: cbc },
        { key: 'cbn', value: cbn },
        { key: 'thcv', value: thcv },
    ].filter(e => e.value != null && e.value !== '-' && e.value !== '')

    if (!entries.length) return null

    const maxVal = Math.max(...entries.map(e => Number(e.value) || 0), 1)

    if (compact) {
        return (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {entries.slice(0, 3).map(e => {
                    const color = CANNABINOID_COLORS[e.key]
                    return (
                        <span key={e.key} style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: `${color}18`,
                            fontSize: '9px',
                            fontWeight: 700,
                            color: color,
                            border: `1px solid ${color}25`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                        }}>
                            {CANNABINOID_LABELS[e.key]} {Number(e.value).toFixed(1)}%
                        </span>
                    )
                })}
                {entries.length > 3 && (
                    <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)' }}>+{entries.length - 3}</span>
                )}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {entries.map(e => {
                const color = CANNABINOID_COLORS[e.key]
                const pct = Math.min(100, (Number(e.value) / maxVal) * 100)
                return (
                    <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                            width: '36px',
                            fontSize: '9px',
                            fontWeight: 700,
                            color: color,
                            letterSpacing: '0.04em',
                        }}>{CANNABINOID_LABELS[e.key]}</div>
                        <div style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255,255,255,0.05)',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                width: `${pct}%`,
                                height: '100%',
                                borderRadius: '3px',
                                background: `linear-gradient(90deg, ${color}AA, ${color})`,
                                boxShadow: `0 0 8px ${color}25`,
                            }} />
                        </div>
                        <div style={{
                            width: '40px',
                            fontSize: '10px',
                            fontWeight: 700,
                            textAlign: 'right',
                            color: 'rgba(255,255,255,0.85)',
                            fontVariantNumeric: 'tabular-nums',
                        }}>{Number(e.value).toFixed(1)}%</div>
                    </div>
                )
            })}
            {labReportUrl && (
                <div style={{
                    marginTop: '2px',
                    fontSize: '8px',
                    color: 'rgba(139,92,246,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}>
                    <span style={{ fontSize: '10px' }}>🔬</span>
                    Rapport labo vérifié
                </div>
            )}
        </div>
    )
}
