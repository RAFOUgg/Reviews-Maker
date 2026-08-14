import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import PropTypes from 'prop-types';
import { getFieldMeta } from '../../../utils/chainCellPipelines';
import { MIN_FONT_PX, ensureReadable } from '../../../utils/exportMakerHelpers';

// Palette de lignes — reprend les 3 signaux de la direction v2 (résine/plante/terracotta) puis
// des teintes neutres de repli, plutôt que d'inventer une nouvelle palette arc-en-ciel.
// Séries alignées sur la DA du site (LiquidUI) : nuances 400 des accents de l'app — violet
// (`--liquid-primary`), cyan (`--liquid-secondary`), emerald, amber, red. Toutes tiennent AA sur
// le fond sombre de l'app (≥ 6.4:1), contrairement aux nuances 500 utilisées en surface.
const LINE_COLORS = ['#A78BFA', '#22D3EE', '#34D399', '#FBBF24', '#F87171'];

// Mêmes clés que `META_KEYS` dans `chainCellPipelines.js` (non exporté) — jamais des mesures.
const META_KEYS = new Set(['timestamp', 'label', 'date', 'phase', '_meta']);

/**
 * Séries réellement traçables d'un pipeline : lignes du graphique + noms des courbes.
 *
 * Extrait du corps du composant pour que sa CONDITION D'EXISTENCE soit lisible de l'extérieur.
 * Sans ça, l'appelant ne pouvait qu'approximer (« il y a des étapes ») et affichait un titre de
 * section « Statistiques de culture » au-dessus d'un graphique qui se masquait lui-même — un titre
 * sans contenu, exactement ce que l'utilisateur signale le 2026-08-14 (« les titres devraient
 * suivre les elements »). Une seule source, donc pas de règle recopiée qui puisse diverger.
 */
export function buildCultureSeries(steps, pipelineType) {
    if (!Array.isArray(steps) || steps.length < 2) return { chartData: [], dataKeys: [] };
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
    return { chartData, dataKeys };
}

/** Le graphique aura-t-il quelque chose à tracer ? À interroger AVANT d'écrire un titre au-dessus. */
export function hasCultureSeries(steps, pipelineType) {
    return buildCultureSeries(steps, pipelineType).dataKeys.length > 0;
}

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
export default function CultureStatsChart({ steps, pipelineType, width = 560, height = 220, textColor = '#CBD5E1', lineColor = 'rgba(255,255,255,0.12)', background = '#0b1220' }) {
    if (!Array.isArray(steps) || steps.length < 2) return null;

    // Recharts colore le TEXTE de légende avec la couleur de la série. `LINE_COLORS` étant des
    // nuances 400 pensées pour le fond sombre, ces libellés tombaient à 1.6–2.6:1 en mode papier
    // (mesuré sur l'export A4). On adapte la teinte au fond réellement utilisé : les courbes
    // restent reconnaissables, les libellés redeviennent lisibles.
    const seriesColors = LINE_COLORS.map((c) => ensureReadable(c, background, 4.8));

    const { chartData, dataKeys } = buildCultureSeries(steps, pipelineType);

    if (dataKeys.length === 0) return null;

    // ── UN AXE PAR ORDRE DE GRANDEUR ───────────────────────────────────────────────────────────
    //
    // Toutes les séries partageaient un axe Y unique. Or un pipeline de culture mélange des mesures
    // sans commune mesure : CO₂ ~800 ppm, PPFD ~600, température ~22 °C, pH ~6, EC ~1,4. Sur une
    // échelle commune, tout ce qui est en dessous de la centaine s'écrase en une ligne plate au ras
    // de l'axe — le graphique affichait donc deux bandes illisibles au lieu de douze mesures
    // (signalé le 2026-08-12, capture à l'appui).
    //
    // On regroupe par ORDRE DE GRANDEUR observé, pas par nom de champ : aucune liste à maintenir, et
    // un champ ajouté demain au formulaire trouve sa place tout seul — même principe que
    // `getOverflowFields` pour les champs non curés.
    const maxParSerie = new Map(dataKeys.map((k) => [
        k,
        chartData.reduce((max, row) => (Number.isFinite(row[k]) ? Math.max(max, Math.abs(row[k])) : max), 0),
    ]));
    const ordreDe = (v) => (v >= 100 ? 'centaines' : v >= 10 ? 'dizaines' : 'unites');
    const groupes = [];
    ['centaines', 'dizaines', 'unites'].forEach((ordre) => {
        const cles = dataKeys.filter((k) => ordreDe(maxParSerie.get(k) || 0) === ordre);
        if (cles.length > 0) groupes.push({ ordre, cles });
    });

    // La hauteur TOTALE reste celle demandée : le budget de pagination l'a déjà mesurée, la changer
    // ici décalerait la mise en page sans que le paginateur le sache.
    const hauteurGroupe = Math.max(72, Math.floor(height / groupes.length));
    let indexCouleur = 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {groupes.map(({ ordre, cles }) => {
                const couleurs = cles.map(() => seriesColors[indexCouleur++ % seriesColors.length]);
                return (
                    <LineChart key={ordre} width={width} height={hauteurGroupe} data={chartData}
                        // `left: 0` et non `-12` : la marge négative décalait la zone de tracé vers
                        // la gauche, si bien que les graduations sortaient du conteneur et se
                        // faisaient couper — vu sur un export A4 réel, l'axe affichait « 00 » et
                        // « 50 » pour 800 et 1500 ppm. Un axe dont on ne lit pas les valeurs ne
                        // documente rien : les 12px regagnés sur la largeur du tracé ne les valaient pas.
                        margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={lineColor} />
                        {/* L'axe des étapes n'est légendé que sous le dernier graphique : les trois
                            partagent exactement les mêmes abscisses, le répéter mangerait de la
                            hauteur utile pour redire la même chose. */}
                        <XAxis dataKey="index" stroke={textColor} tick={{ fontSize: MIN_FONT_PX, fill: textColor }}
                            hide={ordre !== groupes[groupes.length - 1].ordre} />
                        {/* 44px : la place d'un nombre à quatre chiffres (« 1500 » ppm) à 12px, graduation comprise.
                            À 34px, la valeur était rognée d'un ou deux caractères. */}
                        <YAxis stroke={textColor} tick={{ fontSize: MIN_FONT_PX, fill: textColor }} width={44} />
                        <Tooltip contentStyle={{ background: '#16201B', border: `1px solid ${lineColor}`, borderRadius: 8, fontSize: MIN_FONT_PX }} labelStyle={{ color: textColor }} />
                        <Legend wrapperStyle={{ fontSize: MIN_FONT_PX, color: textColor }} />
                        {cles.map((key, idx) => (
                            <Line key={key} type="monotone" dataKey={key} stroke={couleurs[idx]} strokeWidth={2} dot={{ r: 2.5 }} activeDot={{ r: 4 }} isAnimationActive={false} />
                        ))}
                    </LineChart>
                );
            })}
        </div>
    );
}

CultureStatsChart.propTypes = {
    steps: PropTypes.array,
    pipelineType: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    textColor: PropTypes.string,
    lineColor: PropTypes.string,
    /** Fond réellement utilisé — sert à garantir la lisibilité des libellés de légende. */
    background: PropTypes.string,
};
