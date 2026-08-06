import PropTypes from 'prop-types';
import { readableFontSize } from '../../../utils/exportMakerHelpers';

// Icônes best-effort par identifiant de champ de pipeline (purement cosmétique) — source unique,
// auparavant dupliquée (et partiellement absente) entre DetailedCardTemplate/ModernCompactTemplate/
// BlogArticleTemplate.
// Table absorbée le 2026-08-06 dans `utils/fieldIcons.js`, base d'icônes unique de l'app. Elle ne
// couvrait que les champs de pipeline : le même champ pouvait donc avoir une icône ici et aucune
// ailleurs. Réexportée sous son ancien nom pour ne casser aucun appelant existant.
export { FIELD_ICONS as PIPELINE_FIELD_ICONS } from '../../../utils/fieldIcons';
import { getFieldIcon } from '../../../utils/fieldIcons';

export const NOTE_FIELD_KEYS = new Set(['note', 'comment', 'commentaire']);

/**
 * PipelineStepFields — rend les champs d'une étape de pipeline (déjà résumés par
 * `summarizeCellFields`) en grille de fiches label/valeur, plutôt qu'en pastilles "icône libellé :
 * valeur" empilées à la suite (illisible/dense au-delà de 4-5 champs, trouvé 2026-08-02 sur une
 * review réelle en production avec 20 étapes de culture à 5-7 champs chacune — capture utilisateur).
 * Composant partagé, seule source pour les 3 templates qui rendent le détail complet des étapes
 * (DetailedCardTemplate/ModernCompactTemplate/BlogArticleTemplate) — plus d'implémentation propre à
 * chacun.
 */
export default function PipelineStepFields({ fields, compact = false, fontSize, colors }) {
    const noteField = fields.find((f) => NOTE_FIELD_KEYS.has(f.key));
    const metricFields = fields.filter((f) => f !== noteField);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 4 : 6, minWidth: 0, flex: 1 }}>
            {metricFields.length > 0 && (
                <div style={{
                    display: 'grid',
                    // Élargi le 2026-08-04 : au plancher de 12px, des libellés réels comme « Humidité
                    // ambiante » (131px) ou « Température » (91px) ne tenaient plus dans des
                    // colonnes de 88-106px et étaient coupés à l'ellipse (audit, règle E3).
                    gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 132 : 150}px, 1fr))`,
                    gap: compact ? 4 : 6,
                }}>
                    {metricFields.map((f) => (
                        <div key={f.key} style={{ minWidth: 0 }}>
                            <div style={{
                                fontSize: `${readableFontSize(fontSize - 2)}px`,
                                color: colors.textSecondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 3,
                                marginBottom: 1,
                                // Le libellé PASSE À LA LIGNE au lieu d'être coupé à l'ellipse.
                                // Élargir la colonne avait déjà été tenté le 2026-08-04 (88→150px)
                                // et n'a tenu que jusqu'au passage de l'A4 en deux colonnes, qui
                                // les a resserrées : « Humidité ambiante » réclamait 131px dans
                                // 122px. Une largeur de colonne ne peut pas suivre indéfiniment la
                                // longueur des libellés — mieux vaut deux lignes qu'un mot coupé,
                                // le projet ayant pour principe de ne rien tronquer.
                                whiteSpace: 'normal',
                                lineHeight: 1.15,
                            }}>
                                <span style={{ flexShrink: 0 }}>{getFieldIcon(f.key)}</span>
                                <span>{f.label}</span>
                            </div>
                            <div style={{
                                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                                fontWeight: 700,
                                color: colors.textPrimary,
                                fontSize: `${fontSize}px`,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {f.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {noteField && (
                <div style={{ fontSize: `${fontSize}px`, color: colors.textSecondary, fontStyle: 'italic', lineHeight: '1.4' }}>
                    💬 {noteField.value}
                </div>
            )}
        </div>
    );
}

PipelineStepFields.propTypes = {
    fields: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    })).isRequired,
    compact: PropTypes.bool,
    fontSize: PropTypes.number.isRequired,
    colors: PropTypes.shape({
        textSecondary: PropTypes.string.isRequired,
        textPrimary: PropTypes.string.isRequired,
    }).isRequired,
};
