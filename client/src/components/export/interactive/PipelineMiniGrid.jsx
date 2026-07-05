import { useState } from 'react';
import { generatePipelineCells } from '../../../utils/pipelineCellUtils';
import { safeParse, colorWithOpacity } from '../../../utils/orchardHelpers';

/**
 * PipelineMiniGrid - Grille interactive lecture seule d'une timeline de pipeline
 * (culture/curing/extraction/séparation), pour affichage dans Export Maker
 * (Fiche Détaillée) et la galerie.
 *
 * Réutilise generatePipelineCells() (même logique de génération de cases que
 * l'éditeur PipelineDragDropView.jsx) — pas de drag-drop, juste un survol/clic
 * pour voir le détail d'une case.
 */
export default function PipelineMiniGrid({ type, name, icon, timelineData, timelineConfig, accentColor = '#a78bfa' }) {
    const [selected, setSelected] = useState(null);

    const config = safeParse(timelineConfig, null);
    const data = safeParse(timelineData, []);
    if (!config || !Array.isArray(data) || data.length === 0) return null;

    const cells = generatePipelineCells(config, type);
    if (cells.length === 0) return null;

    const getCellFields = (timestamp) => {
        const entry = data.find(d => d.timestamp === timestamp);
        if (!entry) return null;
        const fields = entry.data && typeof entry.data === 'object' ? { ...entry.data } : {};
        Object.keys(entry).forEach(k => {
            if (!['timestamp', 'date', 'label', 'phase', 'data', '_meta'].includes(k)) fields[k] = entry[k];
        });
        return fields;
    };

    const filledCount = cells.filter(c => {
        const f = getCellFields(c.timestamp);
        return f && Object.keys(f).length > 0;
    }).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
                <span>{icon}</span>
                <span style={{ flex: 1 }}>{name}</span>
                <span style={{ fontSize: 11, opacity: 0.7 }}>{filledCount}/{cells.length} documentées</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, position: 'relative' }}>
                {cells.map((cell) => {
                    const fields = getCellFields(cell.timestamp);
                    const hasData = fields && Object.keys(fields).length > 0;
                    const isSelected = selected === cell.timestamp;
                    return (
                        <button
                            key={cell.id}
                            type="button"
                            onClick={() => setSelected(isSelected ? null : cell.timestamp)}
                            title={cell.label}
                            style={{
                                width: 22, height: 22, borderRadius: 5,
                                backgroundColor: colorWithOpacity(accentColor, hasData ? 55 : 15),
                                border: isSelected ? `2px solid ${accentColor}` : `1px solid ${colorWithOpacity(accentColor, hasData ? 45 : 20)}`,
                                cursor: hasData ? 'pointer' : 'default',
                                padding: 0,
                            }}
                        />
                    );
                })}
            </div>
            {selected && (() => {
                const cell = cells.find(c => c.timestamp === selected);
                const fields = getCellFields(selected) || {};
                const entries = Object.entries(fields).filter(([k]) => !['timestamp', 'date'].includes(k));
                return (
                    <div style={{
                        padding: '6px 10px', borderRadius: 8,
                        backgroundColor: colorWithOpacity(accentColor, 10),
                        border: `1px solid ${colorWithOpacity(accentColor, 25)}`,
                        fontSize: 12,
                    }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{cell?.label}</div>
                        {entries.length === 0 && <div style={{ opacity: 0.6 }}>Aucune donnée pour cette étape</div>}
                        {entries.map(([k, v]) => (
                            <div key={k}>{k} : {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                        ))}
                    </div>
                );
            })()}
        </div>
    );
}
