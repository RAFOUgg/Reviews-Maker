import { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sélecteur de couleur « à peindre » (L6/L7/L8, 2026-10-28) : une silhouette du produit — bud,
 * hash ou rosin jar — découpée en bandes horizontales. On choisit une teinte, puis on passe le
 * doigt (ou la souris) sur la silhouette : les bandes touchées prennent la teinte, et le produit
 * apparaît peint d'un dégradé lissé.
 *
 * Pourquoi : l'ancien choix demandait d'ajouter chaque couleur PUIS de taper son pourcentage à la
 * main jusqu'à tomber pile sur 100 % — « il demande énormément d'action utilisateur ». Ici, deux
 * gestes suffisent (une teinte, un glissé), et le total fait 100 % par construction.
 *
 * Format stocké INCHANGÉ : `[{ id, percentage }]`, chaque bande valant 100 / bands %. Une review
 * existante se relit donc telle quelle (ses pourcentages sont répartis sur les bandes, de haut en
 * bas, dans l'ordre où ils sont enregistrés).
 */

const SHAPES = {
    // Bud : cône effilé + calices. Plusieurs éléments dans un clipPath = leur union.
    bud: {
        viewBox: '0 0 200 260',
        clip: (
            <>
                <path d="M100 8 C 132 46, 162 92, 158 148 C 154 204, 128 246, 100 252 C 72 246, 46 204, 42 148 C 38 92, 68 46, 100 8 Z" />
                <ellipse cx="62" cy="120" rx="26" ry="34" />
                <ellipse cx="138" cy="120" rx="26" ry="34" />
                <ellipse cx="66" cy="190" rx="24" ry="30" />
                <ellipse cx="134" cy="190" rx="24" ry="30" />
                <ellipse cx="100" cy="70" rx="24" ry="34" />
            </>
        ),
        decor: (
            // Petites feuilles de manucure — décor, non peint.
            <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round">
                <path d="M100 252 L100 258" />
                <path d="M58 150 Q 40 150 26 140" />
                <path d="M142 150 Q 160 150 174 140" />
            </g>
        ),
    },
    // Hash : galette pressée aux bords irréguliers.
    hash: {
        viewBox: '0 0 200 260',
        clip: <path d="M34 72 Q 28 48 54 44 L 148 38 Q 178 40 174 70 L 172 192 Q 170 218 144 220 L 56 224 Q 26 222 28 194 Z" />,
        decor: (
            <g fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5">
                <path d="M60 90 Q 90 84 120 92" />
                <path d="M70 160 Q 100 152 140 162" />
            </g>
        ),
    },
    // Rosin jar : seul le CONTENU du pot se peint ; couvercle et verre sont du décor.
    jar: {
        viewBox: '0 0 200 260',
        clip: <path d="M48 96 L152 96 Q 160 96 160 106 L 160 226 Q 160 238 148 238 L 52 238 Q 40 238 40 226 L 40 106 Q 40 96 48 96 Z" />,
        decor: (
            <g>
                <rect x="30" y="52" width="140" height="30" rx="8" fill="#3b3b44" stroke="rgba(255,255,255,0.25)" />
                <path d="M34 84 L166 84 L166 230 Q 166 248 148 248 L 52 248 Q 34 248 34 230 Z" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" />
                <path d="M46 104 L46 200" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeLinecap="round" />
            </g>
        ),
    },
};

const EMPTY = '#2e2e38';

function toBands(value, bands) {
    const out = [];
    const step = 100 / bands;
    for (const { id, percentage } of value || []) {
        const n = Math.round((Number(percentage) || 0) / step);
        for (let i = 0; i < n && out.length < bands; i++) out.push(id);
    }
    while (out.length < bands) out.push(null);
    return out;
}

function fromBands(bandColors, bands) {
    const step = 100 / bands;
    const order = [];
    const count = {};
    for (const id of bandColors) {
        if (!id) continue;
        if (!(id in count)) { count[id] = 0; order.push(id); }
        count[id] += 1;
    }
    return order.map((id) => ({ id, percentage: Math.round(count[id] * step) }));
}

export default function PaintableColorSilhouette({ shape = 'bud', palette, groups, value, onChange, bands = 10, label }) {
    const svgRef = useRef(null);
    const painting = useRef(false);
    const gradientId = useMemo(() => `paint-${shape}-${Math.random().toString(36).slice(2, 8)}`, [shape]);
    const clipId = `${gradientId}-clip`;
    const bandColors = useMemo(() => toBands(value, bands), [value, bands]);
    const hexOf = (id) => palette.find((c) => c.id === id)?.hex;
    const [brush, setBrush] = useState(() => (value?.[0]?.id ?? palette[0]?.id) || null);
    const def = SHAPES[shape] || SHAPES.bud;

    const commit = (next) => onChange?.(fromBands(next, bands));
    const paintAt = (clientY) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const i = Math.min(bands - 1, Math.max(0, Math.floor(((clientY - rect.top) / rect.height) * bands)));
        if (bandColors[i] === brush) return;
        const next = [...bandColors];
        next[i] = brush;
        commit(next);
    };

    // Dégradé : un arrêt au centre de chaque bande, les bandes vides restent sombres.
    const stops = bandColors.map((id, i) => ({ offset: `${((i + 0.5) / bands) * 100}%`, color: (id && hexOf(id)) || EMPTY }));
    const total = fromBands(bandColors, bands);
    const swatchGroups = groups?.length ? groups : [{ label: null, ids: palette.map((c) => c.id) }];

    return (
        <div className="space-y-3" data-paintable-silhouette={shape}>
            {label && <div className="text-sm font-semibold text-gray-200">{label}</div>}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                <svg
                    ref={svgRef}
                    viewBox={def.viewBox}
                    className="w-44 h-56 flex-shrink-0 touch-none select-none cursor-crosshair"
                    role="img"
                    aria-label="Silhouette à peindre : glissez dessus avec la teinte choisie"
                    onPointerDown={(e) => { painting.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); paintAt(e.clientY); }}
                    onPointerMove={(e) => { if (painting.current) paintAt(e.clientY); }}
                    onPointerUp={() => { painting.current = false; }}
                    onPointerCancel={() => { painting.current = false; }}
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            {stops.map((s, i) => <stop key={i} offset={s.offset} stopColor={s.color} />)}
                        </linearGradient>
                        <clipPath id={clipId}>{def.clip}</clipPath>
                    </defs>
                    {shape === 'jar' && def.decor}
                    <rect x="0" y="0" width="200" height="260" fill={`url(#${gradientId})`} clipPath={`url(#${clipId})`} />
                    {shape !== 'jar' && def.decor}
                </svg>

                <div className="flex-1 min-w-0 w-full space-y-2">
                    {swatchGroups.map((g) => (
                        <div key={g.label || 'all'}>
                            {g.label && <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">{g.label}</p>}
                            <div className="flex flex-wrap gap-1.5">
                                {g.ids.map((id) => {
                                    const c = palette.find((p) => p.id === id);
                                    if (!c) return null;
                                    return (
                                        <button
                                            key={id}
                                            type="button"
                                            title={c.name}
                                            aria-label={c.name}
                                            aria-pressed={brush === id}
                                            onClick={() => setBrush(id)}
                                            className={`w-8 h-8 rounded-lg border-2 transition-transform ${brush === id ? 'border-white ring-2 ring-violet-500 scale-110' : 'border-white/15 hover:scale-105'}`}
                                            style={{ backgroundColor: c.hex }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-wrap gap-2 pt-1">
                        <button type="button" onClick={() => brush && commit(Array(bands).fill(brush))} className="px-2.5 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/15 text-white/80">Tout en {palette.find((c) => c.id === brush)?.name || '…'}</button>
                        <button type="button" onClick={() => setBrush(null)} aria-pressed={brush === null} className={`px-2.5 py-1 rounded-lg text-xs ${brush === null ? 'bg-violet-600 text-white' : 'bg-white/10 hover:bg-white/15 text-white/80'}`}>Gomme</button>
                        <button type="button" onClick={() => commit(Array(bands).fill(null))} className="px-2.5 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/15 text-white/80">Effacer</button>
                    </div>
                    {total.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1" data-paint-legend>
                            {total.map(({ id, percentage }) => (
                                <span key={id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs text-white/85 bg-white/5 border border-white/10">
                                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: hexOf(id) }} />
                                    {palette.find((c) => c.id === id)?.name || id} · {percentage} %
                                </span>
                            ))}
                        </div>
                    )}
                    <p className="text-[11px] text-white/40">Choisissez une teinte, puis glissez sur la silhouette pour la peindre.</p>
                </div>
            </div>
        </div>
    );
}

PaintableColorSilhouette.propTypes = {
    shape: PropTypes.oneOf(['bud', 'hash', 'jar']),
    palette: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string, hex: PropTypes.string })).isRequired,
    groups: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string, ids: PropTypes.arrayOf(PropTypes.string) })),
    value: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, percentage: PropTypes.number })),
    onChange: PropTypes.func,
    bands: PropTypes.number,
    label: PropTypes.string,
};
