import PropTypes from 'prop-types';
import { MIN_FONT_PX } from '../../../utils/exportMakerHelpers';

/**
 * SensoryRadar — radar SVG générique à N axes (2026-07-30, Fiche Technique Détaillée v2,
 * specs-direction-artistique.md). Géométrie adaptée de `client/src/components/shared/charts/
 * EffectsRadar.jsx` (variant 'radar', catégories fixes) mais généralisée : les axes sont fournis
 * en props plutôt que codés en dur, pour accepter n'importe quel jeu de métriques (ici, les
 * moyennes des 5 catégories réelles + un axe "Arôme" dérivé).
 *
 * Labels rendus en `<text>` SVG (pas en `<div>` HTML positionné par-dessus, contrairement à
 * `EffectsRadar`) — plus sûr pour le pipeline d'export `html-to-image` de cette app : un overlay
 * HTML positionné en `absolute` par rapport à un conteneur peut se désynchroniser du SVG selon la
 * mise à l'échelle du canevas au moment de la rasterisation, un `<text>` SVG ne le peut pas.
 */
export default function SensoryRadar({
    axes,
    accentColor = '#A78BFA',
    lineColor = '#2C3A32',
    textColor = '#6E7A72',
    size = 260,
}) {
    if (!axes || axes.length < 3) return null;

    const cx = size / 2;
    const cy = size / 2 - 6; // léger décalage vers le haut pour laisser respirer les labels du bas
    const R = size * 0.32;
    const N = axes.length;

    const pt = (i, r) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
        return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    };

    const rings = [1, 2, 3, 4].map((ring) => {
        const points = axes.map((_, i) => pt(i, (R * ring) / 4).join(',')).join(' ');
        return <polygon key={ring} points={points} fill="none" stroke={lineColor} strokeWidth="1" />;
    });

    const spokes = axes.map((_, i) => {
        const [x, y] = pt(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={lineColor} strokeWidth="1" />;
    });

    const dataPoints = axes.map((a, i) => pt(i, (R * Math.max(0, Math.min(10, a.value))) / 10));
    const dataPolygon = dataPoints.map((p) => p.join(',')).join(' ');

    const labels = axes.map((a, i) => {
        const [x, y] = pt(i, R + 18);
        return (
            <text
                key={i}
                x={x}
                y={y}
                fill={textColor}
                fontSize={MIN_FONT_PX}
                fontFamily='"JetBrains Mono", monospace'
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {a.label}
            </text>
        );
    });

    return (
        <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
            {rings}
            {spokes}
            <polygon
                points={dataPolygon}
                fill={accentColor}
                fillOpacity="0.2"
                stroke={accentColor}
                strokeWidth="2"
            />
            {dataPoints.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="2.6" fill={accentColor} />
            ))}
            {labels}
        </svg>
    );
}

SensoryRadar.propTypes = {
    axes: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.number.isRequired,
    })).isRequired,
    accentColor: PropTypes.string,
    lineColor: PropTypes.string,
    textColor: PropTypes.string,
    size: PropTypes.number,
};
