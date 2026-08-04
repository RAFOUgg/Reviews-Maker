import PropTypes from 'prop-types';
import { detectPipelineConstants, summarizeCellFields } from '../../../utils/chainCellPipelines';
import { colorWithOpacity, readableFontSize } from '../../../utils/exportMakerHelpers';
import PipelineStepFields from './PipelineStepFields';

/**
 * Traduit la clé d'un pipeline (telle que produite par `extractPipelines`) vers l'identifiant de
 * type attendu par `summarizeCellFields`.
 *
 * SOURCE UNIQUE. Cette table était dupliquée dans 3 templates, avec le commentaire aveu « même
 * mapping que DetailedCardTemplate » — et l'oubli des clés de REPLI y a déjà causé une disparition
 * silencieuse de pipeline en production (correctif #3). `extractPipelines` pousse en effet
 * `cultureTimeline`/`curingTimeline`/`extractionTimelineData`/`separationTimelineData` quand
 * l'adaptateur n'a pas déjà synthétisé la clé canonique : les deux formes doivent figurer ici.
 */
export const PIPELINE_TYPE_BY_KEY = {
    pipelineGlobal: 'culture',
    cultureTimeline: 'culture',
    pipelineCuring: 'curing',
    curingTimeline: 'curing',
    pipelineExtraction: 'extraction',
    extractionTimelineData: 'extraction',
    pipelineSeparation: 'separation',
    separationTimelineData: 'separation',
    pipelinePurification: 'purification',
    purificationTimelineData: 'purification',
};

/**
 * Libellé d'étape. Reprend les champs de repli de `extractPipelines.stepToString`, en y ajoutant
 * `cellLabel` — le libellé d'affichage réellement produit par `generateTimelineCells()`
 * (`J1`, `S3`, `12/04`…). Sans lui, une cellule générée par la timeline retombait sur son index :
 * la pastille affichait « 1, 2, 3 » là où le reste de l'app affiche « J1, J2, J3 ».
 */
function stepLabel(step, index) {
    return String(step.label || step.cellLabel || step.date || step.semaine || step.phase || step.jour || index + 1);
}

/**
 * Bandeau des conditions constantes — affiché UNE fois par pipeline.
 *
 * C'est la moitié de la réponse au symptôme central : une culture saisie à 24 °C / 68 % / 888 ppm
 * sur 25 jours affichait 25 cartes identiques. Ces valeurs remontent ici, et les étapes ne
 * montrent plus que ce qui les distingue.
 */
function ConstantsBanner({ items, compact, fontSize, colors }) {
    if (!items.length) return null;
    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: compact ? 6 : 10,
            padding: `${compact ? 6 : 8}px ${compact ? 8 : 12}px`,
            marginBottom: compact ? 5 : 7,
            background: colorWithOpacity(colors.accent, 10),
            border: `1px solid ${colorWithOpacity(colors.accent, 22)}`,
            borderRadius: compact ? 8 : 10,
        }}>
            <span style={{
                fontSize: `${readableFontSize(fontSize - 2)}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: colors.accentText || colors.textSecondary,
                fontWeight: 700,
                whiteSpace: 'nowrap',
            }}>
                Conditions constantes
            </span>
            {items.map((item) => (
                <span key={item.key} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4, minWidth: 0 }}>
                    <span style={{ fontSize: `${readableFontSize(fontSize - 2)}px`, color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                        {item.label}
                    </span>
                    <span style={{
                        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                        fontSize: `${fontSize}px`,
                        fontWeight: 700,
                        color: colors.textPrimary,
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                    }}>
                        {item.value}
                    </span>
                </span>
            ))}
        </div>
    );
}

ConstantsBanner.propTypes = {
    items: PropTypes.array.isRequired,
    compact: PropTypes.bool,
    fontSize: PropTypes.number.isRequired,
    colors: PropTypes.object.isRequired,
};

/** Une étape : pastille de libellé + uniquement les champs qui la distinguent. */
function StepCard({ step, index, pipelineType, hiddenKeys, compact, fontSize, colors }) {
    const fields = summarizeCellFields(pipelineType, step).filter((f) => !hiddenKeys.has(f.key));
    // Une étape entièrement conforme aux constantes n'a plus rien à dire : on la réduit à sa
    // pastille plutôt que de la supprimer (la continuité de la chronologie reste une information).
    const isConform = fields.length === 0;

    return (
        <div style={{
            display: 'flex',
            gap: compact ? 8 : 10,
            alignItems: isConform ? 'center' : 'flex-start',
            padding: `${compact ? 6 : 8}px ${compact ? 10 : 12}px`,
            background: colors.surface,
            borderRadius: 8,
            borderLeft: `3px solid ${isConform ? colorWithOpacity(colors.accent, 35) : colors.accent}`,
        }}>
            <div style={{
                flexShrink: 0,
                textAlign: 'center',
                padding: `4px ${compact ? 7 : 9}px`,
                background: colorWithOpacity(colors.accent, 16),
                borderRadius: compact ? 5 : 7,
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: `${fontSize}px`,
                fontWeight: 700,
                // Texte sur fond DÉJÀ teinté d'accent : la nuance 400 de l'accent s'y détache
                // mal (mesuré 3.44:1 sur Moderne Compact, 3.92:1 sur Article de Blog — sous le
                // seuil AA, 215 occurrences à l'audit). L'identité accentuée reste portée par le
                // fond et la bordure de la pastille ; le texte, lui, doit être lisible.
                color: colors.textPrimary,
                whiteSpace: 'nowrap',
            }}>
                {stepLabel(step, index)}
            </div>
            {isConform ? (
                <span style={{ fontSize: `${readableFontSize(fontSize - 1)}px`, color: colors.textSecondary, fontStyle: 'italic' }}>
                    conditions nominales
                </span>
            ) : (
                <PipelineStepFields
                    fields={fields}
                    compact={compact}
                    fontSize={fontSize}
                    colors={{ textSecondary: colors.textSecondary, textPrimary: colors.textPrimary }}
                />
            )}
        </div>
    );
}

StepCard.propTypes = {
    step: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    pipelineType: PropTypes.string.isRequired,
    hiddenKeys: PropTypes.instanceOf(Set).isRequired,
    compact: PropTypes.bool,
    fontSize: PropTypes.number.isRequired,
    colors: PropTypes.object.isRequired,
};

/**
 * PipelineTimeline — rendu complet d'un pipeline de production.
 *
 * COMPOSANT PARTAGÉ, seule source pour les 4 templates qui rendent le détail des étapes
 * (DetailedCard / ModernCompact / BlogArticle / TraceabilityReport). Chacun réimplémentait
 * auparavant sa propre boucle : corriger le symptôme central template par template aurait signifié
 * l'écrire 4 fois — et c'est exactement ce qui a produit les régressions « corrigé sur une surface,
 * pas sur les autres » de l'historique (correctifs #3, #11).
 *
 * Groupement par phase : dérivé de `step.phase` quand la donnée existe réellement. Aucune taxonomie
 * de phases n'est inventée ici — sans phase déclarée, les étapes restent en une seule liste.
 */
export default function PipelineTimeline({
    pipeline, moduleId, compact = false, fontSize, spacing, colors, glass = null,
    isPageOn = null, paged = false,
}) {
    const rawSteps = pipeline.rawSteps || pipeline.steps.map((s) => ({ label: s }));
    const pipelineType = PIPELINE_TYPE_BY_KEY[pipeline.key] || pipeline.key;
    const { constants, constantKeysByStep } = detectPipelineConstants(pipelineType, rawSteps);

    // Groupes de phase — uniquement si la donnée les porte.
    const groups = [];
    rawSteps.forEach((step, i) => {
        const phase = typeof step.phase === 'string' && step.phase.trim() ? step.phase.trim() : null;
        const last = groups[groups.length - 1];
        if (last && last.phase === phase) last.items.push({ step, i });
        else groups.push({ phase, items: [{ step, i }] });
    });
    const hasPhases = groups.some((g) => g.phase);

    // ── Découpage en tronçons paginables (2026-08-04) ────────────────────────────────────────
    //
    // Un pipeline était jusqu'ici UN SEUL `data-module`, donc insécable pour la pagination
    // adaptative. Mesuré sur un cas réel : 25 étapes de culture = 1229px de contenu sur un canevas
    // de 800px, soit 158% — les étapes au-delà de J15 étaient purement coupées, alors qu'une
    // chronologie est par nature une LISTE, parfaitement divisible.
    //
    // Chaque tronçon devient une unité paginable indépendante. Frontière sémantique d'abord (une
    // phase = un tronçon), puis découpe par paquets si une phase dépasse à elle seule ce qu'une
    // page peut porter. Le packer répartit ensuite ces tronçons comme n'importe quel autre module.
    const STEPS_PER_CHUNK = 6;
    const chunks = [];
    groups.forEach((group) => {
        for (let off = 0; off < group.items.length; off += STEPS_PER_CHUNK) {
            chunks.push({
                id: `${moduleId}#${chunks.length}`,
                phase: group.phase,
                items: group.items.slice(off, off + STEPS_PER_CHUNK),
                isPhaseStart: off === 0,
                phaseTotal: group.items.length,
            });
        }
    });

    const visibleChunks = isPageOn ? chunks.filter((c) => isPageOn(c.id)) : chunks;
    if (visibleChunks.length === 0) return null;
    // L'en-tête complet (icône, nom, compte d'étapes) et le bandeau de constantes n'apparaissent que
    // sur la page qui porte le PREMIER tronçon ; les pages suivantes reçoivent un rappel « (suite) ».
    // Reporter un en-tête de continuation est la pratique attendue d'un document paginé — et ce
    // n'est pas une répétition de donnée : les constantes, elles, ne sont affichées qu'une fois.
    const isContinuation = visibleChunks[0].id !== chunks[0].id;

    // Enveloppe "carte de verre" optionnelle — recette de `.liquid-card` (apple-liquid-glass.css),
    // réservée aux grandes surfaces conformément à la hiérarchie de LiquidUI. Fournie par les
    // templates qui présentent le pipeline comme un panneau (ex. Moderne Compact) ; omise par ceux
    // qui l'intègrent au flux du document.
    const wrapperStyle = glass
        ? {
            marginBottom: `${spacing.element}px`,
            padding: `${compact ? 8 : 12}px`,
            borderRadius: compact ? 16 : 24,
            background: glass.background,
            border: `1px solid ${glass.border}`,
            backdropFilter: 'blur(24px) saturate(150%)',
            WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            boxShadow: `0 4px 24px -4px ${glass.shadow}, inset 0 1px 1px ${glass.borderHighlight}`,
        }
        : { marginBottom: `${spacing.element}px` };

    return (
        <div style={wrapperStyle}>
            {/* En-tête du pipeline (complet, ou rappel de continuation).
                `data-module="<moduleId>#hdr"` : cet en-tête est reporté sur CHAQUE page portant un
                tronçon, il ne fait donc partie d'aucun tronçon mesuré. Sans id propre, sa hauteur
                (en-tête + bandeau de constantes) échappait au budget de pagination — mesuré à
                88,5% de remplissage réel là où le packer croyait être à ~76%. Le bandeau est
                DANS cet élément et non frère, sinon il échapperait à son tour à la mesure. Le
                packer réserve ce coût une fois par page et par pipeline (adaptivePagination.js). */}
            <div data-module={`${moduleId}#hdr`}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing.element,
                marginBottom: spacing.gap + 2,
                padding: `${compact ? 5 : 7}px ${compact ? 8 : 12}px`,
                background: colors.surface,
                borderRadius: compact ? 8 : 10,
            }}>
                <span style={{ fontSize: compact ? '16px' : '20px' }}>{pipeline.icon}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: `${fontSize.text}px`, fontWeight: 700, color: colors.title }}>
                        {pipeline.name}{isContinuation ? ' (suite)' : ''}
                    </span>
                    {!isContinuation && pipeline.configMeta && (
                        <span style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>{pipeline.configMeta}</span>
                    )}
                </div>
                <span style={{
                    fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                    fontSize: `${fontSize.small}px`,
                    // Texte sur fond DÉJÀ teinté d'accent : la nuance 400 de l'accent s'y détache
                // mal (mesuré 3.44:1 sur Moderne Compact, 3.92:1 sur Article de Blog — sous le
                // seuil AA, 215 occurrences à l'audit). L'identité accentuée reste portée par le
                // fond et la bordure de la pastille ; le texte, lui, doit être lisible.
                color: colors.textPrimary,
                    background: colorWithOpacity(colors.accent, 16),
                    padding: '2px 7px',
                    borderRadius: 20,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                }}>
                    {rawSteps.length} étape{rawSteps.length > 1 ? 's' : ''}
                </span>
            </div>

            {!isContinuation && (
                <ConstantsBanner items={constants} compact={compact} fontSize={fontSize.small} colors={colors} />
            )}
            </div>

            {visibleChunks.map((chunk, vi) => {
                // Un en-tête de phase n'est reporté que s'il ouvre réellement la phase, ou si le
                // tronçon précédent de cette phase est sur une AUTRE page. Deux tronçons consécutifs
                // d'une même phase affichés l'un sous l'autre produisaient sinon « FLORAISON » puis
                // « FLORAISON (SUITE) » à quelques centimètres d'intervalle sur la même page.
                const prev = visibleChunks[vi - 1];
                const samePhaseAbove = prev && prev.phase === chunk.phase;
                const showPhaseHeader = chunk.phase && !samePhaseAbove;
                return (
                <div key={chunk.id} data-module={chunk.id} style={{ marginBottom: hasPhases ? spacing.gap + 2 : 0 }}>
                    {showPhaseHeader && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            margin: `${spacing.gap}px 0 ${spacing.gap}px`,
                        }}>
                            <span style={{
                                fontSize: `${readableFontSize(fontSize.small - 1)}px`,
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                fontWeight: 700,
                                color: colors.textSecondary,
                                whiteSpace: 'nowrap',
                            }}>
                                {chunk.phase}{chunk.isPhaseStart ? '' : ' (suite)'}
                            </span>
                            <span style={{ flex: 1, height: 1, background: colors.line }} />
                            <span style={{
                                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                                fontSize: `${readableFontSize(fontSize.small - 1)}px`,
                                color: colors.textSecondary,
                            }}>
                                {chunk.phaseTotal}
                            </span>
                        </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {chunk.items.map(({ step, i }) => (
                            <StepCard
                                key={i}
                                step={step}
                                index={i}
                                pipelineType={pipelineType}
                                hiddenKeys={constantKeysByStep[i] || new Set()}
                                compact={compact}
                                fontSize={fontSize.small}
                                colors={colors}
                            />
                        ))}
                    </div>
                </div>
                );
            })}
        </div>
    );
}

PipelineTimeline.propTypes = {
    /** Élément produit par `extractPipelines` (clé, nom, icône, rawSteps, configMeta?). */
    pipeline: PropTypes.object.isRequired,
    /** Préfixe des `data-module` des tronçons (`<moduleId>#N`) — contrat de la pagination adaptative. */
    moduleId: PropTypes.string,
    /** Filtre de page fourni par le template — restreint les tronçons rendus sur CETTE page. */
    isPageOn: PropTypes.func,
    /** Vrai quand une pagination est active (réservé, l'en-tête de continuation en dérive déjà). */
    paged: PropTypes.bool,
    compact: PropTypes.bool,
    fontSize: PropTypes.shape({ text: PropTypes.number, small: PropTypes.number }).isRequired,
    spacing: PropTypes.shape({ element: PropTypes.number, gap: PropTypes.number }).isRequired,
    colors: PropTypes.shape({
        textPrimary: PropTypes.string.isRequired,
        textSecondary: PropTypes.string.isRequired,
        title: PropTypes.string,
        accent: PropTypes.string.isRequired,
        /** Variante AA de l'accent pour le texte — cf. ACCENT_TEXT_COLORS. */
        accentText: PropTypes.string,
        surface: PropTypes.string.isRequired,
        line: PropTypes.string,
    }).isRequired,
    /** Tokens de `getGlassTokens()` — si fournis, le pipeline est rendu en carte de verre. */
    glass: PropTypes.shape({
        background: PropTypes.string,
        border: PropTypes.string,
        borderHighlight: PropTypes.string,
        shadow: PropTypes.string,
    }),
};
