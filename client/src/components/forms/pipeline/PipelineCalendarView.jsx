import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import './PipelineCalendarView.css'

/**
 * PipelineCalendarView - Vue calendrier GitHub-style (90 jours)
 * Affiche un grid de 13x7 (91 jours) comme sur GitHub
 * Chaque cellule représente un jour/semaine/phase
 */
export default function PipelineCalendarView({ startDate, endDate, mode = 'jours', stages = [], onStageClick }) {
    const [hoveredDate, setHoveredDate] = useState(null)

    // Générer les cellules du calendrier
    const calendarCells = useMemo(() => {
        const start = new Date(startDate)
        const end = new Date(endDate || new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000))
        const cells = []

        // Créer 13 semaines x 7 jours = 91 cellules
        const weeks = 13
        const daysPerWeek = 7

        for (let week = 0; week < weeks; week++) {
            for (let day = 0; day < daysPerWeek; day++) {
                const cellDate = new Date(start)
                cellDate.setDate(cellDate.getDate() + week * 7 + day)

                if (cellDate <= end) {
                    const dateStr = cellDate.toISOString().split('T')[0]
                    const stage = stages.find(s => s.date === dateStr)
                    const daysFromStart = Math.floor((cellDate - start) / (1000 * 60 * 60 * 24))

                    cells.push({
                        id: dateStr,
                        date: dateStr,
                        label: cellDate.getDate(),
                        week: week,
                        day: day,
                        daysFromStart,
                        hasData: !!stage,
                        stage,
                        intensity: stage ? Math.min((stage.notes?.length || 0) / 100, 1) : 0
                    })
                }
            }
        }

        return cells
    }, [startDate, endDate, stages])

    // Grouper les cellules par semaine pour le rendu
    const weekRows = useMemo(() => {
        const rows = []
        for (let i = 0; i < calendarCells.length; i += 7) {
            rows.push(calendarCells.slice(i, i + 7))
        }
        return rows
    }, [calendarCells])

    const getIntensityColor = (intensity) => {
        if (intensity === 0) return 'rgba(200, 200, 200, 0.1)'
        if (intensity < 0.25) return 'rgba(100, 180, 100, 0.3)'
        if (intensity < 0.5) return 'rgba(100, 180, 100, 0.6)'
        if (intensity < 0.75) return 'rgba(100, 180, 100, 0.8)'
        return 'rgba(100, 180, 100, 1)'
    }

    const getMonthLabel = (week) => {
        const startDate_ = new Date(startDate)
        const weekDate = new Date(startDate_)
        weekDate.setDate(weekDate.getDate() + week * 7)
        return weekDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
    }

    return (
        <div className="pipeline-calendar-view">
            <div className="calendar-header">
                <h3>📅 Timeline de Culture (90 jours)</h3>
                <div className="legend">
                    <div className="legend-item">
                        <div className="legend-box" style={{ backgroundColor: 'rgba(200, 200, 200, 0.1)' }}></div>
                        <span>Pas de données</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-box" style={{ backgroundColor: 'rgba(100, 180, 100, 0.6)' }}></div>
                        <span>Données documentées</span>
                    </div>
                </div>
            </div>

            <div className="calendar-container">
                {weekRows.map((week, weekIdx) => (
                    <div key={weekIdx} className="calendar-week">
                        {/* Étiquette de semaine/mois */}
                        <div className="week-label">
                            {weekIdx === 0 || weekIdx % 4 === 0 ? (
                                <small>{getMonthLabel(weekIdx)}</small>
                            ) : (
                                <small>W{weekIdx + 1}</small>
                            )}
                        </div>

                        {/* Cellules de la semaine */}
                        <div className="week-cells">
                            {week.map(cell => (
                                <motion.div
                                    key={cell.id}
                                    className="calendar-cell"
                                    onClick={() => onStageClick?.(cell)}
                                    onMouseEnter={() => setHoveredDate(cell.id)}
                                    onMouseLeave={() => setHoveredDate(null)}
                                    whileHover={{ scale: 1.1 }}
                                    style={{
                                        backgroundColor: getIntensityColor(cell.intensity),
                                        cursor: 'pointer',
                                        border: hoveredDate === cell.id ? '2px solid #4a9d6f' : '1px solid #ddd'
                                    }}
                                    title={`${cell.date} - ${cell.stage?.notes || 'Aucune donnée'}`}
                                >
                                    <span className="cell-date">{cell.label}</span>
                                    {cell.hasData && <span className="cell-indicator">●</span>}
                                </motion.div>
                            ))}
                        </div>

                        {/* Tooltip au hover */}
                        {hoveredDate && (
                            <div className="week-tooltip">
                                {(() => {
                                    const cell = week.find(c => c.id === hoveredDate)
                                    return cell ? (
                                        <>
                                            <strong>{cell.date}</strong>
                                            <p>{cell.stage?.notes || '(Aucune donnée)'}</p>
                                        </>
                                    ) : null
                                })()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="calendar-stats">
                <div className="stat">
                    <span className="stat-label">Jours documentés:</span>
                    <strong>{calendarCells.filter(c => c.hasData).length}</strong>
                </div>
                <div className="stat">
                    <span className="stat-label">Couverture:</span>
                    <strong>
                        {Math.round((calendarCells.filter(c => c.hasData).length / calendarCells.length) * 100)}%
                    </strong>
                </div>
            </div>
        </div>
    )
}
