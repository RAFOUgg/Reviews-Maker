import { useState } from 'react';
import { generatePipelineCells } from '../../../utils/pipelineCellUtils';
import { safeParse, colorWithOpacity } from '../../../utils/exportMakerHelpers';
import { getFieldLabel, humanizeKey } from '../../../utils/fieldRegistry';

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

    // Trouve la ou les entrées réelles correspondant à une case générée par `generatePipelineCells`.
    // Bug trouvé 2026-08-02 : pour les pipelines à intervalle 'phases' (culture/curing/séparation/
    // extraction — voir `generatePipelineCells`), la case générée a `timestamp` = l'id de phase
    // (`'phase-1'`...) MAIS les entrées réellement enregistrées par `PipelineDragDropView.jsx`
    // portent cet id de phase dans leur propre champ `phase`, pas dans `timestamp` — `timestamp`
    // y est un compteur d'occurrence (une phase peut avoir plusieurs entrées, ex. "Semaine 1" et
    // "Semaine 2" toutes deux `phase: 'phase-1'`) ou un ancien identifiant `'legacy-phase-X'` sur
    // les entrées créées avant une restructuration de formulaire. En ne comparant que sur
    // `timestamp`, AUCUNE entrée ne matchait jamais une case de phase — "0/13 documentées" même
    // avec des données réelles. Les pipelines à intervalle non-phase (jour/semaine/date/heure/...)
    // continuent, eux, à écrire `timestamp` au même format que la case (`'day-3'`...), donc le
    // matching par `timestamp` reste tenté en premier ; `phase` est un repli, pas un remplacement.
    // Plusieurs entrées peuvent matcher la même case de phase (plusieurs semaines dans une même
    // phase) — leurs champs sont fusionnés (dernière entrée prioritaire en cas de collision de clé)
    // plutôt que de n'en montrer arbitrairement qu'une seule.
    const getCellFields = (timestamp) => {
        const matches = data.filter(d => d && (String(d.timestamp) === String(timestamp) || String(d.phase) === String(timestamp)));
        if (matches.length === 0) return null;
        const fields = {};
        matches.forEach(entry => {
            if (entry.data && typeof entry.data === 'object') Object.assign(fields, entry.data);
            Object.keys(entry).forEach(k => {
                if (!['timestamp', 'date', 'label', 'phase', 'data', '_meta'].includes(k)) fields[k] = entry[k];
            });
        });
        return fields;
    };

    const filledCount = cells.filter(c => {
        const f = getCellFields(c.timestamp);
        return f && Object.keys(f).length > 0;
    }).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                <span>{icon}</span>
                <span style={{ flex: 1 }}>{name}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{filledCount}/{cells.length} documentées</span>
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
                        fontSize: 13,
                    }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{cell?.label}</div>
                        {entries.length === 0 && <div style={{ opacity: 0.6 }}>Aucune donnée pour cette étape</div>}
                        {entries.map(([k, v]) => (
                            <div key={k}>{getFieldLabel(k) || humanizeKey(k)} : {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                        ))}
                    </div>
                );
            })()}
        </div>
    );
}
