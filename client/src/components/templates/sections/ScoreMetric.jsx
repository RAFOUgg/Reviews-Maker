import PropTypes from 'prop-types';
import { colorWithOpacity, getScoreBand, getScoreTextColor, SEMANTIC_SCORE_COLORS } from '../../../utils/exportMakerHelpers';

/**
 * ScoreMetric — barre de score /10 avec bande sémantique de couleur (vert/ambre/terracotta,
 * `SEMANTIC_SCORE_COLORS`), seule source pour toute note affichée dans les 5 templates d'export.
 * Extrait du composant `Metric` de DetailedCardTemplate.jsx (COA v2, 2026-07-30) mais sans
 * l'animation framer-motion (largeur posée directement au montage, comme le faisait déjà
 * SocialStoryTemplate) : élimine par construction tout risque de capture mi-animation par
 * html-to-image, plutôt que de dépendre du délai de 600ms déjà utilisé ailleurs pour ça.
 */
export default function ScoreMetric({ label, value, icon, max = 10, fontSize, colors, compact = false, paper = false }) {
    const numValue = Number(value) || 0;
    const normalized = (numValue / max) * 10;
    const band = getScoreBand(normalized);
    // Surface (barre) et texte (chiffre) ont des seuils WCAG différents — 3:1 vs 4.5:1. La barre
    // garde la couleur d'origine, le chiffre utilise la variante conforme AA (cf. audit B3 §7.1 :
    // hi/lo étaient à 3.73/3.76 en couleur de texte, sous la norme, sur les 5 templates).
    const barColor = SEMANTIC_SCORE_COLORS[band];
    const valueColor = getScoreTextColor(normalized, paper);
    const pct = Math.max(0, Math.min(100, (numValue / max) * 100));
    const trackColor = colorWithOpacity(colors.textSecondary, 15);

    return (
        <div style={{ marginBottom: compact ? 6 : 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4, gap: 6 }}>
                <span style={{ fontSize, color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                    {icon && <span style={{ flexShrink: 0 }}>{icon}</span>}
                    <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                </span>
                <span style={{ fontSize, fontWeight: 700, color: valueColor, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {numValue.toFixed(1)}
                </span>
            </div>
            <div style={{ height: compact ? 4 : 5, borderRadius: 3, background: trackColor, overflow: 'hidden' }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    borderRadius: 3,
                    background: `linear-gradient(90deg, ${colorWithOpacity(barColor, 80)}, ${barColor})`,
                    // Pas de glow : le territoire visuel retenu (moodboard B2, "Lab Clinique
                    // Sombre") exclut explicitement le halo décoratif, héritage du glassmorphism
                    // écarté. Il ne portait aucune information et se rasterisait mal en petite
                    // taille (barres de 4-5px).
                }} />
            </div>
        </div>
    );
}

ScoreMetric.propTypes = {
    label: PropTypes.node,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    icon: PropTypes.node,
    max: PropTypes.number,
    fontSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    colors: PropTypes.shape({ textSecondary: PropTypes.string }).isRequired,
    compact: PropTypes.bool,
    /** Mode papier A4 (fond crème) — bascule sur les variantes de texte assombries. */
    paper: PropTypes.bool,
};
