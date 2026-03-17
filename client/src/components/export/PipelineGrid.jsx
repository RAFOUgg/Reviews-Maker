/**
 * PipelineGrid — GitHub-style contribution grid for culture/curing pipeline data
 * Export-safe: inline styles only, no Tailwind/className
 */

const CULTURE_COLOR = '34,197,94'   // green
const CURING_COLOR = '245,158,11'   // amber

function getPhaseLabel(cell, config) {
    if (cell.phase) return cell.phase
    if (cell.label) return cell.label
    return null
}

function getCellIntensity(cell, type) {
    if (type === 'culture') {
        // Intensity based on how many fields are filled in this cell
        const keys = Object.keys(cell).filter(k =>
            !['timestamp', 'date', 'label', 'phase'].includes(k) && cell[k] != null && cell[k] !== ''
        )
        return Math.min(1, keys.length / 8)
    }
    // Curing: intensity based on quality scores
    const scores = ['visual', 'odor', 'taste', 'effects'].map(k => {
        const v = cell[k]
        return v && typeof v === 'object' ? (v.overall || 0) : 0
    })
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    return Math.min(1, avg / 10)
}

function extractPhases(data, config) {
    const phases = []
    let currentPhase = null
    data.forEach((cell, i) => {
        const phase = getPhaseLabel(cell, config)
        if (phase && phase !== currentPhase) {
            phases.push({ name: phase, startIndex: i })
            currentPhase = phase
        }
    })
    return phases
}

function computeMetrics(data, type, config) {
    const metrics = []
    if (data.length > 0) {
        metrics.push({ label: 'Étapes', value: data.length })
    }
    if (type === 'culture') {
        const mode = config?.mode || data[0]?.modeCulture
        if (mode) metrics.push({ label: 'Mode', value: mode })
        // Average temperature
        const temps = data.map(c => c.temperatureMoyenne).filter(v => v != null)
        if (temps.length > 0) {
            metrics.push({ label: 'Temp moy.', value: `${(temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)}°C` })
        }
        const hums = data.map(c => c.humiditeMoyenne).filter(v => v != null)
        if (hums.length > 0) {
            metrics.push({ label: 'Hum moy.', value: `${(hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(0)}%` })
        }
    } else {
        const curingType = config?.curingType || data[0]?.curingType
        if (curingType) metrics.push({ label: 'Type', value: curingType })
        const weights = data.map(c => c.weight).filter(v => v != null)
        if (weights.length >= 2) {
            const loss = ((weights[0] - weights[weights.length - 1]) / weights[0] * 100).toFixed(1)
            metrics.push({ label: 'Perte poids', value: `${loss}%` })
        }
        const hums = data.map(c => c.targetHumidity || c.ambientHumidity).filter(v => v != null)
        if (hums.length > 0) {
            metrics.push({ label: 'Hum moy.', value: `${(hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(0)}%` })
        }
    }
    return metrics.slice(0, 4)
}

export default function PipelineGrid({ data = [], config = {}, type = 'culture', compact = false }) {
    if (!data.length) return null

    const rgb = type === 'culture' ? CULTURE_COLOR : CURING_COLOR
    const phases = extractPhases(data, config)
    const metrics = computeMetrics(data, type, config)
    const cols = compact ? Math.min(data.length, 20) : Math.min(data.length, 28)
    const rows = compact ? 1 : Math.ceil(data.length / cols)
    const cellSize = compact ? 10 : 12
    const gap = 2

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? '4px' : '8px' }}>
            {/* Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${gap}px`, maxWidth: `${cols * (cellSize + gap)}px` }}>
                {data.slice(0, cols * rows).map((cell, i) => {
                    const intensity = getCellIntensity(cell, type)
                    const alpha = 0.15 + intensity * 0.65
                    return (
                        <div
                            key={i}
                            title={cell.label || cell.phase || `#${i + 1}`}
                            style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`,
                                borderRadius: '2px',
                                background: intensity > 0
                                    ? `rgba(${rgb},${alpha})`
                                    : 'rgba(255,255,255,0.04)',
                                border: `1px solid rgba(${rgb},${Math.min(0.4, alpha + 0.1)})`,
                            }}
                        />
                    )
                })}
                {data.length > cols * rows && (
                    <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.25)', alignSelf: 'center', marginLeft: '2px' }}>
                        +{data.length - cols * rows}
                    </span>
                )}
            </div>

            {/* Phase labels */}
            {!compact && phases.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {phases.map((p, i) => (
                        <span key={i} style={{
                            fontSize: '8px',
                            fontWeight: 600,
                            color: `rgba(${rgb},0.7)`,
                            padding: '1px 6px',
                            borderRadius: '8px',
                            background: `rgba(${rgb},0.1)`,
                            border: `1px solid rgba(${rgb},0.15)`,
                            textTransform: 'capitalize',
                        }}>
                            {i > 0 && <span style={{ marginRight: '3px', opacity: 0.4 }}>→</span>}
                            {p.name}
                        </span>
                    ))}
                </div>
            )}

            {/* Metrics summary */}
            {metrics.length > 0 && (
                <div style={{ display: 'flex', gap: compact ? '6px' : '10px', flexWrap: 'wrap' }}>
                    {metrics.map((m, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <span style={{ fontSize: compact ? '7px' : '8px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {m.label}
                            </span>
                            <span style={{ fontSize: compact ? '8px' : '9px', fontWeight: 700, color: `rgba(${rgb},0.85)` }}>
                                {m.value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
