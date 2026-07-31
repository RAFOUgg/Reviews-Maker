import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PropTypes from 'prop-types';
import { getFieldMeta } from '../../../utils/chainCellPipelines';

// Palette de lignes — reprend les 3 signaux de la direction v2 (résine/plante/terracotta) puis
// des teintes neutres de repli, plutôt que d'inventer une nouvelle palette arc-en-ciel.
const LINE_COLORS = ['#C9922E', '#3E7C5A', '#B5533A', '#38BDF8', '#A78BFA'];

// Mêmes clés que `META_KEYS` dans `chainCellPipelines.js` (non exporté) — jamais des mesures.
const META_KEYS = new Set(['timestamp', 'label', 'date', 'phase', '_meta']);

/**
 * CultureStatsChart — graphique en courbes de l'évolution des paramètres environnementaux d'un
 * pipeline (température, humidité, CO2, PPFD, pH/EC…), pour la section "Statistiques" de la Fiche
 * Technique Détaillée (Chantier A, 2026-07-30). Version présentationnelle de
 * `client/src/components/shared/charts/CultureEvolutionGraph.jsx` (pensé pour l'UI d'édition de
 * pipeline, avec ses propres contrôles) — pas de contrôles, dimensions explicites plutôt que
 * `ResponsiveContainer` (jamais testé dans le pipeline d'export `html-to-image`, où un conteneur
 * mesuré par ResizeObserver au moment de la capture est un risque réel).
 *
 * Lit les libellés via `getFieldMeta` (même registre de référence que `summarizeCellFields`/le
 * canevas Chaîne de production) mais les VALEURS directement sur l'entrée brute — `summarizeCellFields`
 * retourne des chaînes déjà formatées pour l'affichage (unité suffixée, ex. "22 °C"), inexploitables
 * pour un graphique numérique (`Number("22 °C")` vaut `NaN`) : bug réel trouvé en testant (2026-07-30,
 * le graphique ne s'affichait jamais sur une review réelle, silencieusement masqué par son propre
 * garde-fou `dataKeys.length === 0`).
 */
export default function CultureStatsChart({ steps, pipelineType, width = 560, height = 220, textColor = '#A9B2AA', lineColor = '#2C3A32' }) {
    if (!Array.isArray(steps) || steps.length < 2) return null;

    const chartData = steps.map((step, i) => {
        const row = { index: i + 1 };
        Object.keys(step || {}).forEach((k) => {
            if (META_KEYS.has(k)) return;
            const raw = step[k];
            const n = typeof raw === 'number' ? raw : (typeof raw === 'string' && raw.trim() !== '' && !isNaN(Number(raw)) ? Number(raw) : NaN);
            if (!Number.isFinite(n)) return;
            const label = getFieldMeta(pipelineType, k)?.label || k;
            row[label] = n;
        });
        return row;
    });

    const dataKeys = Array.from(
        chartData.reduce((keys, row) => {
            Object.keys(row).forEach((k) => k !== 'index' && keys.add(k));
            return keys;
        }, new Set())
    );

    if (dataKeys.length === 0) return null;

    return (
        <LineChart width={width} height={height} data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={lineColor} />
            <XAxis dataKey="index" stroke={textColor} tick={{ fontSize: 10, fill: textColor }} />
            <YAxis stroke={textColor} tick={{ fontSize: 10, fill: textColor }} />
            <Tooltip contentStyle={{ background: '#16201B', border: `1px solid ${lineColor}`, borderRadius: 8, fontSize: 11 }} labelStyle={{ color: textColor }} />
            <Legend wrapperStyle={{ fontSize: 10, color: textColor }} />
            {dataKeys.map((key, idx) => (
                <Line key={key} type="monotone" dataKey={key} stroke={LINE_COLORS[idx % LINE_COLORS.length]} strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
            ))}
        </LineChart>
    );
}

CultureStatsChart.propTypes = {
    steps: PropTypes.array,
    pipelineType: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    textColor: PropTypes.string,
    lineColor: PropTypes.string,
};
