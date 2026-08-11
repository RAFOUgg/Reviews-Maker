import PropTypes from 'prop-types';
import {
    colorWithOpacity,
    getScoreBand,
    getScoreTextColor,
    readableFontSize,
    SEMANTIC_SCORE_COLORS,
    MIN_FONT_PX,
} from '../../../utils/exportMakerHelpers';

/**
 * ScoreBoard — synthèse visuelle des notes : jauge globale, point fort, point faible.
 *
 * POURQUOI. Les notes étaient rendues en liste de barres, toutes de même poids : pour savoir si un
 * produit est bon, et surtout SUR QUOI il est bon ou faible, il fallait lire cinq lignes et les
 * comparer de tête. Un tableau de bord répond à la même question d'un coup d'œil — et ce n'est pas
 * décoratif : « meilleure catégorie » et « catégorie la plus faible » sont de l'information dérivée
 * des données, pas un ornement.
 *
 * Réutilise les primitives existantes plutôt que d'en créer : `getScoreBand` et
 * `SEMANTIC_SCORE_COLORS` (bandes vert/ambre/terracotta, indépendantes de la palette, comme partout
 * ailleurs), `getScoreTextColor` (variante conforme AA pour le chiffre, le seuil du TEXTE étant
 * 4,5:1 quand celui d'une SURFACE est 3:1) et `readableFontSize` (plancher de lisibilité).
 *
 * SVG et non canvas : le pipeline d'export rasterise via `html-to-image`, et le SVG y survit —
 * c'est déjà le choix fait pour `SensoryRadar`, vérifié sur des PNG réels.
 */

/** Jauge circulaire : anneau de fond + arc coloré proportionnel à la note. */
function Dial({ value, max, size, stroke, colors, paper }) {
    const pct = Math.max(0, Math.min(1, (Number(value) || 0) / max));
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const band = getScoreBand((Number(value) || 0) / max * 10);
    const arcColor = SEMANTIC_SCORE_COLORS[band];
    const valueColor = getScoreTextColor((Number(value) || 0) / max * 10, paper);
    const numberSize = readableFontSize(size * 0.3);

    return (
        <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Rotation de -90° pour que l'arc démarre en haut plutôt qu'à 3 heures. */}
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none" strokeWidth={stroke}
                        stroke={colorWithOpacity(colors.textSecondary, 15)}
                    />
                    <circle
                        cx={size / 2} cy={size / 2} r={r}
                        fill="none" strokeWidth={stroke} stroke={arcColor} strokeLinecap="round"
                        strokeDasharray={`${c * pct} ${c}`}
                    />
                </g>
                {/* Le chiffre est posé en <text> SVG, pas en <div> superposé : un calque HTML
                    au-dessus d'un SVG peut se désaligner à la rasterisation selon la mise à
                    l'échelle du canevas (même raison que dans `SensoryRadar`). */}
                <text
                    x={size / 2} y={size / 2}
                    textAnchor="middle" dominantBaseline="central"
                    fill={valueColor}
                    style={{ fontSize: numberSize, fontWeight: 700 }}
                >
                    {(Math.round((Number(value) || 0) * 10) / 10).toFixed(1)}
                </text>
            </svg>
        </div>
    );
}

Dial.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    max: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    stroke: PropTypes.number.isRequired,
    colors: PropTypes.object.isRequired,
    paper: PropTypes.bool,
};

/** Étiquette « point fort / point faible » : icône, libellé, note, pastille de bande. */
function Highlight({ title, cat, colors, fontSize, paper }) {
    if (!cat) return null;
    const band = getScoreBand(cat.value);
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 8, minWidth: 0,
            padding: '2px 8px', borderRadius: 999,
            background: colorWithOpacity(SEMANTIC_SCORE_COLORS[band], 12),
            border: `1px solid ${colorWithOpacity(SEMANTIC_SCORE_COLORS[band], 30)}`,
        }}>
            <span style={{ fontSize: readableFontSize(fontSize) }}>{cat.icon}</span>
            {/* Une seule ligne : « POINT FORT · Odeur 8.0 ». Sur deux lignes, la même information
                doublait la hauteur du bloc pour rien. */}
            <span style={{
                fontSize: readableFontSize(fontSize), color: colors.textPrimary,
                fontWeight: 600, whiteSpace: 'nowrap', minWidth: 0,
            }}>
                <span style={{
                    color: colors.textSecondary, fontWeight: 500,
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{title} · </span>
                {cat.label} {cat.value.toFixed(1)}
            </span>
        </div>
    );
}

Highlight.propTypes = {
    title: PropTypes.string.isRequired,
    cat: PropTypes.object,
    colors: PropTypes.object.isRequired,
    fontSize: PropTypes.number.isRequired,
    paper: PropTypes.bool,
};

export default function ScoreBoard({
    categories = [], overall, colors, fontSize, spacing, max = 10, paper = false, compact = false,
    // La jauge REDIT la note globale. Là où le template l'affiche déjà en grand (le masthead de la
    // Fiche Technique), la répéter coûtait une page entière en A4 pour zéro information nouvelle —
    // mesuré : 2 pages à 80,5/80,7 % devenaient 3 pages à 80,5/44,3/45,7 %. L'apport réel du bloc,
    // ce sont le point fort et le point faible, qui n'existent nulle part ailleurs et tiennent en
    // une ligne. `showDial` laisse donc chaque template décider selon ce qu'il montre déjà.
    showDial = true,
}) {
    const rated = categories.filter((c) => Number.isFinite(Number(c?.value)) && Number(c.value) > 0);
    // La note globale n'est calculée à partir des catégories que si elle n'est pas déjà fournie —
    // la moyenne des catégories n'est PAS toujours la note globale (l'utilisateur peut la saisir).
    const globalValue = Number.isFinite(Number(overall)) && Number(overall) > 0
        ? Number(overall)
        : (rated.length ? rated.reduce((s, c) => s + Number(c.value), 0) / rated.length : null);

    if (globalValue === null && rated.length === 0) return null;

    const sorted = [...rated].sort((a, b) => b.value - a.value);
    const best = sorted[0];
    // Point faible affiché SEULEMENT s'il se distingue vraiment du point fort — sinon on
    // désignerait un « point faible » sur un produit régulier, ce qui serait faux.
    const worst = sorted.length >= 2 && (best.value - sorted[sorted.length - 1].value) >= 0.5
        ? sorted[sorted.length - 1]
        : null;

    // Gabarit délibérément SERRÉ. Première version (jauge 88px, étiquettes sur deux lignes) :
    // +96px de hauteur, ce qui suffisait à faire basculer une page en A4 — la Fiche Technique
    // passait de 2 pages à 80,5/80,7 % à 3 pages à 80,5/45,6/45,7 %. Payer une page entière pour
    // une synthèse est un mauvais marché : elle doit tenir dans la marge d'une section, pas en
    // créer une. Mesuré après resserrement, cf. le commentaire d'intégration dans le template.
    const dialSize = compact ? 48 : 58;
    const base = typeof fontSize === 'number' ? fontSize : MIN_FONT_PX;

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: spacing?.gap ? spacing.gap + 6 : 12,
            flexWrap: 'wrap', marginBottom: Math.max(4, (spacing?.gap ?? 6)),
        }}>
            {showDial && globalValue !== null && (
                <Dial value={globalValue} max={max} size={dialSize} stroke={compact ? 7 : 9} colors={colors} paper={paper} />
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
                <Highlight title="Point fort" cat={best} colors={colors} fontSize={base} paper={paper} />
                <Highlight title="Point faible" cat={worst} colors={colors} fontSize={base} paper={paper} />
            </div>
        </div>
    );
}

ScoreBoard.propTypes = {
    categories: PropTypes.array,
    overall: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    colors: PropTypes.object.isRequired,
    fontSize: PropTypes.number,
    spacing: PropTypes.object,
    max: PropTypes.number,
    paper: PropTypes.bool,
    compact: PropTypes.bool,
    showDial: PropTypes.bool,
};
