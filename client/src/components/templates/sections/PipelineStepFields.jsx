import PropTypes from 'prop-types';

// Icônes best-effort par identifiant de champ de pipeline (purement cosmétique) — source unique,
// auparavant dupliquée (et partiellement absente) entre DetailedCardTemplate/ModernCompactTemplate/
// BlogArticleTemplate.
export const PIPELINE_FIELD_ICONS = {
    temperature: '🌡️', temp: '🌡️', temperatureDay: '🌡️', temperatureNight: '🌡️', temperatureEau: '🌡️',
    humidity: '💧', ambientHumidity: '💧', humidityDay: '💧', humidityNight: '💧', humidite: '💧', hr: '💧',
    co2: '☁️', co2Ppm: '☁️', co2Level: '☁️', vpd: '💨',
    ppfd: '☀️', lightType: '☀️',
    ph: '🧪', ec: '🧪',
    container: '🫙', recipient: '🫙',
    packaging: '📦', emballage: '📦',
    action: '⚡', event: '⚡', evenement: '⚡',
    method: '⚙️', methode: '⚙️', spaceType: '🏠', seedType: '🌱',
};

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
                    gridTemplateColumns: `repeat(auto-fill, minmax(${compact ? 88 : 106}px, 1fr))`,
                    gap: compact ? 4 : 6,
                }}>
                    {metricFields.map((f) => (
                        <div key={f.key} style={{ minWidth: 0 }}>
                            <div style={{
                                fontSize: `${Math.max(9, fontSize - 2)}px`,
                                color: colors.textSecondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                marginBottom: 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                            }}>
                                <span style={{ flexShrink: 0 }}>{PIPELINE_FIELD_ICONS[f.key] || '•'}</span>
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</span>
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
