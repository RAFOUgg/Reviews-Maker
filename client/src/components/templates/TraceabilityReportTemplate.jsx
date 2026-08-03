import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    colorWithOpacity,
    formatDate,
    getResponsiveAdjustments,
    safeParse,
} from '../../utils/exportMakerHelpers';
import { resolveImageUrl } from '../../utils/export-maker/resolveImageUrl';
import { getLotCode, getLotCodeUrl } from '../../utils/lotCode';
import { evaluateChainEventRules } from '../../utils/chainEventRules';
import { summarizeCellFields } from '../../utils/chainCellPipelines';
import ReadOnlyProductionChainCanvas from '../export/interactive/ReadOnlyProductionChainCanvas';
import ReadOnlyGenealogyCanvas from '../export/interactive/ReadOnlyGenealogyCanvas';
import TemplateSection from './sections/TemplateSection';
import PipelineStepFields from './sections/PipelineStepFields';
import { CannabinoidGrid, getCannabinoidItems, GisementSections } from './sections/RegistrySections';

const BUSINESS_TYPE_LABELS = {
    farm: 'Ferme', laboratory: 'Laboratoire', extractor: 'Extracteur',
    manufacturer: 'Fabricant', distributor: 'Distributeur', other: 'Producteur',
};

// Même liste que DetailedCardTemplate.jsx (source de vérité du "gisement" complet) — 'lab' exclu
// (déjà son propre badge de confiance ci-dessous). Léger recouvrement volontaire assumé entre
// 'harvest' (poidsBrut/poidsNet, groupe complet) et "Bilan matière" (mêmes 2 champs + rendement% et
// finalWeight/servings/poidsParPortion) — 'harvest' apporte aussi trichomes*/modeRecolte, réellement
// absents jusqu'ici ; ne pas exclure le groupe entier pour éviter 2 valeurs déjà affichées ailleurs.
const GISEMENT_GROUPS = ['harvest', 'culture', 'usage', 'separation', 'extraction', 'purification', 'recipe', 'overflow'];
const GISEMENT_ICONS = {
    harvest: '🌾', culture: '🌱', usage: '💨',
    separation: '🧊', extraction: '⚗️', purification: '💧', recipe: '🍯', overflow: '➕',
};

const LAB_METHOD_LABELS = {
    hplc: 'HPLC', gc: 'GC', gcms: 'GC-MS', hplcms: 'HPLC-MS', other: 'Autre méthode',
};

const TIMELINE_PIPELINES = [
    { type: 'culture', name: 'Culture', icon: '🌱', dataKey: 'cultureTimelineData', configKey: 'cultureTimelineConfig' },
    { type: 'curing', name: 'Curing & Maturation', icon: '🔥', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' },
    { type: 'extraction', name: 'Extraction', icon: '⚗️', dataKey: 'extractionTimelineData', configKey: 'extractionTimelineConfig' },
    { type: 'separation', name: 'Séparation', icon: '🔬', dataKey: 'separationTimelineData', configKey: 'separationTimelineConfig' },
];

function normalizeReviewType(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('hash')) return 'hash';
    if (t.includes('concentr')) return 'concentrate';
    if (t.includes('edible') || t.includes('comestible')) return 'edible';
    return 'flower';
}

// Bilan matière (Chantier 3) : n'affiche QUE les champs réellement renseignés, jamais de valeur
// inventée — cohérent avec l'échappatoire libre déjà en place sur le reste du produit.
function getMassBalanceRows(reviewData) {
    const rows = [];
    if (reviewData.poidsBrut || reviewData.poidsNet) {
        rows.push({
            label: 'Récolte', icon: '🌾',
            detail: [
                reviewData.poidsBrut && `${reviewData.poidsBrut}g brut`,
                reviewData.poidsNet && `${reviewData.poidsNet}g net`,
                reviewData.poidsBrut && reviewData.poidsNet && `rendement ${((reviewData.poidsNet / reviewData.poidsBrut) * 100).toFixed(1)}%`,
            ].filter(Boolean).join(' · '),
        });
    }
    if (reviewData.finalWeight || reviewData.servings) {
        rows.push({
            label: 'Recette', icon: '🍽️',
            detail: [
                reviewData.finalWeight && `${reviewData.finalWeight}g au total`,
                reviewData.servings && `${reviewData.servings} portions`,
                reviewData.poidsParPortion && `${reviewData.poidsParPortion}g/portion`,
            ].filter(Boolean).join(' · '),
        });
    }
    return rows;
}

function useReviewEvents(reviewData) {
    const [events, setEvents] = useState([]);
    // `ready` passe à true que le fetch réussisse ou échoue — jamais bloqué indéfiniment. Exposé en
    // DOM via `data-report-ready` (cf. rendu plus bas) pour qu'ExportModal.jsx puisse attendre la fin
    // réelle de ce chargement avant de capturer, au lieu du délai fixe précédent qui pouvait figer
    // le rapport de traçabilité sans le journal d'événements sur une connexion lente.
    const [ready, setReady] = useState(false);
    const reviewId = reviewData?.id;
    const reviewType = normalizeReviewType(reviewData?.type);

    useEffect(() => {
        if (!reviewId) { setReady(true); return; }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/production-chains/for-review/${reviewType}/${reviewId}/events`, { credentials: 'include' });
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (!cancelled) setEvents(Array.isArray(data) ? data : []);
            } catch {
                // pas d'événements — journal simplement vide
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => { cancelled = true; };
    }, [reviewId, reviewType]);

    return { events, ready };
}

/**
 * TraceabilityReportTemplate — rapport de traçabilité complet (Chantier 6 de la roadmap
 * traçabilité). Assemble en une page A4 : identité + confiance producteur/labo (Chantier 5),
 * identifiant de lot + QR (Chantier 8), bilan matière (Chantier 3), pipelines et chaîne de
 * production (vues interactives déjà existantes), journal d'événements (Chantier 1/2/4).
 * Contrairement à `DetailedCardTemplate`, ce template n'affiche QUE les sections qui ont des
 * données réelles — un rapport de traçabilité vide de contenu n'a aucune valeur probante.
 */
export default function TraceabilityReportTemplate({ config, reviewData, dimensions }) {
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                <p className="text-gray-500 text-lg">📋 Données manquantes pour le rapport</p>
            </div>
        );
    }

    const { typography, colors } = config;
    const responsive = getResponsiveAdjustments(config.ratio, typography);
    const { fontSize, padding, spacing } = responsive;

    const mainImage = resolveImageUrl(
        (Array.isArray(reviewData.images) && reviewData.images.length > 0)
            ? reviewData.images[0]
            : (reviewData.mainImageUrl || reviewData.imageUrl || null)
    );

    const massBalanceRows = getMassBalanceRows(reviewData);
    const { events, ready: eventsReady } = useReviewEvents(reviewData);
    const activeTimelines = TIMELINE_PIPELINES.filter(t => reviewData[t.dataKey] && reviewData[t.configKey]);

    const hasLabInfo = reviewData.labName || reviewData.labMethod || reviewData.labAccredited;
    const hasTrustInfo = reviewData.producerVerified || hasLabInfo;

    // Détail labo/curing complet — le badge "Confiance" ci-dessous reste un résumé rapide (Chantier
    // 5, volontairement compact) ; un rapport de TRAÇABILITÉ doit aussi porter le détail complet
    // (date d'analyse, certificats, norme d'accréditation) que Fiche Détaillée affiche déjà via sa
    // grille §04 — absent de ce template jusqu'ici (gap trouvé en audit 2026-08-02, Phase B).
    const labDetailCells = [
        reviewData.labName && { label: 'Laboratoire', value: reviewData.labName },
        reviewData.labMethod && { label: "Méthode d'analyse", value: LAB_METHOD_LABELS[reviewData.labMethod] || reviewData.labMethod },
        (reviewData.labAccredited !== undefined && reviewData.labAccredited !== null) && { label: 'Accrédité', value: reviewData.labAccredited ? 'Oui' : 'Non' },
        reviewData.labAccreditationStandard && { label: "Norme d'accréditation", value: reviewData.labAccreditationStandard },
        reviewData.labAnalysisDate && { label: "Date d'analyse", value: formatDate(reviewData.labAnalysisDate) },
        reviewData.labReportUrl && { label: "Certificat d'analyse", value: 'Disponible' },
        reviewData.terpeneFileUrl && { label: 'Certificat terpènes', value: 'Disponible' },
    ].filter(Boolean);

    // Délègue à `TemplateSection.jsx` (partagé avec `DetailedCardTemplate.jsx`, qui définissait
    // l'original) — props ajustées pour préserver le rendu exact déjà en place ici (fontWeight 700,
    // bordure 2px/opacité 35, gap 8/paddingBottom 6 en dur plutôt que `spacing.gap`).
    const Section = ({ title, icon, children }) => (
        <TemplateSection
            title={title} icon={icon}
            fontSize={fontSize} spacing={spacing} padding={padding} colors={colors}
            fontWeight={700} borderWidth={2} borderOpacity={35} gap={8}
        >
            {children}
        </TemplateSection>
    );

    return (
        <div
            className="w-full flex flex-col"
            data-report-ready={eventsReady ? 'true' : 'false'}
            style={{
                // Ce template est un rapport continu, toujours rendu en hauteur naturelle par
                // `TemplateRenderer` (`effectiveAllowOverflow`) — `h-full`/`overflowY:auto` créaient
                // une zone scrollable dont le contenu hors-écran ne survivait jamais à une capture
                // PNG statique (trouvé 2026-08-02 : rapport quasi vide en export réel).
                minHeight: '100%',
                // `background` (pas `backgroundColor`) : `colors.background` est un dégradé CSS
                // (`linear-gradient(...)`) pour 6 des 7 palettes — `backgroundColor` n'accepte pas
                // les dégradés, échoue silencieusement (aucune erreur, juste un fond transparent/noir
                // au lieu de la palette configurée). Bug pré-existant, trouvé en vérifiant Phase B
                // 2026-08-02 (repéré via la nouvelle section labo, mais présent sur tout le document).
                background: colors.background,
                padding: `${padding.container}px`,
                fontFamily: typography.fontFamily,
                color: colors.textPrimary,
                overflow: 'visible',
            }}
        >
            {/* En-tête : identité + identifiant de lot/QR (Chantier 8) */}
            <div style={{ display: 'flex', gap: spacing.section, marginBottom: `${spacing.section}px` }}>
                {mainImage && (
                    <img src={mainImage} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Rapport de traçabilité — {reviewData.type || normalizeReviewType(reviewData.type)}
                    </div>
                    <h1 style={{ fontSize: `${fontSize.title}px`, fontWeight: 800, color: colors.title, margin: '4px 0' }}>
                        {reviewData.holderName || reviewData.title || 'Sans nom'}
                    </h1>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                        Généré le {formatDate(new Date())} · Rédigé par {typeof reviewData.author === 'string' ? reviewData.author : (reviewData.author?.username || 'Anonyme')}
                    </div>
                </div>
                {reviewData.id && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ background: '#fff', padding: 4, borderRadius: 6, lineHeight: 0 }}>
                            <QRCodeSVG value={getLotCodeUrl(reviewData.id)} size={56} level="M" />
                        </div>
                        <div style={{ fontSize: `${fontSize.small}px` }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{getLotCode(reviewData.id)}</div>
                            <div style={{ opacity: 0.6, fontSize: `${fontSize.small - 2}px` }}>Identifiant interne — non réglementaire</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confiance producteur/labo (Chantier 5) */}
            {hasTrustInfo && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: `${spacing.section}px` }}>
                    {reviewData.producerVerified && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
                            background: colorWithOpacity('#22c55e', 15), border: `1px solid ${colorWithOpacity('#22c55e', 35)}`,
                            fontSize: `${fontSize.small}px`, color: '#22c55e', fontWeight: 700,
                        }}>
                            ✓ Producteur vérifié{BUSINESS_TYPE_LABELS[reviewData.producerBusinessType] ? ` · ${BUSINESS_TYPE_LABELS[reviewData.producerBusinessType]}` : ''}
                        </div>
                    )}
                    {hasLabInfo && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
                            background: colorWithOpacity(colors.accent, 12), border: `1px solid ${colorWithOpacity(colors.accent, 30)}`,
                            fontSize: `${fontSize.small}px`, color: colors.accent, fontWeight: 700,
                        }}>
                            🔬 {[
                                reviewData.labName,
                                reviewData.labMethod && (LAB_METHOD_LABELS[reviewData.labMethod] || reviewData.labMethod),
                                reviewData.labAccredited && `accrédité${reviewData.labAccreditationStandard ? ` ${reviewData.labAccreditationStandard}` : ''}`,
                            ].filter(Boolean).join(' · ')}
                        </div>
                    )}
                </div>
            )}

            {/* Données laboratoire & curing — détail complet, complémentaire au badge "Confiance"
                ci-dessus (résumé rapide seulement). */}
            {labDetailCells.length > 0 && (
                <Section title="Données laboratoire & curing" icon="🔬">
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(140px, 1fr))`, gap: 6 }}>
                        {labDetailCells.map((c, i) => (
                            <div key={i} style={{ background: colorWithOpacity(colors.accent, 6), borderRadius: 8, padding: '6px 10px' }}>
                                <div style={{ fontSize: `${Math.max(9, fontSize.small - 2)}px`, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                                <div style={{ fontSize: `${fontSize.text}px`, fontWeight: 700, color: colors.textPrimary }}>{c.value}</div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Profil cannabinoïde — absent de ce template jusqu'ici alors que la grille est déjà
                partagée avec Fiche Détaillée (`CannabinoidGrid`, RegistrySections.jsx). */}
            {getCannabinoidItems(reviewData, config.contentModules).length > 0 && (
                <Section title="Profil cannabinoïde" icon="🧪">
                    <CannabinoidGrid reviewData={reviewData} contentModules={config.contentModules} colors={colors} fontSize={fontSize} spacing={spacing} />
                </Section>
            )}

            {/* Bilan matière (Chantier 3) */}
            {massBalanceRows.length > 0 && (
                <Section title="Bilan matière" icon="⚖️">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {massBalanceRows.map(row => (
                            <div key={row.label} style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                                background: colorWithOpacity(colors.accent, 6), borderRadius: 8,
                                fontSize: `${fontSize.text}px`,
                            }}>
                                <span>{row.icon}</span>
                                <strong>{row.label}</strong>
                                <span style={{ color: colors.textSecondary }}>{row.detail}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Gisement complémentaire piloté par le registre (récolte, culture, usage, procédés,
                recette, données complémentaires) — absent de ce template jusqu'ici alors que Fiche
                Détaillée l'affiche déjà via le même composant partagé (`GisementSections`). */}
            <GisementSections
                reviewData={reviewData}
                contentModules={config.contentModules}
                groups={GISEMENT_GROUPS}
                Section={Section}
                colors={{ accent: colors.accent, textPrimary: colors.textPrimary, textSecondary: colors.textSecondary, title: colors.title }}
                fontSize={fontSize}
                spacing={spacing}
                groupIcons={GISEMENT_ICONS}
            />

            {/* Chaîne de production (vue interactive existante) */}
            <ReadOnlyProductionChainCanvas reviewData={reviewData} height={340} accentColor={colors.accent} titleColor={colors.title} textColor={colors.textSecondary} />

            {/* Généalogie / PhenoHunt */}
            <div style={{ marginTop: `${spacing.section}px` }}>
                <ReadOnlyGenealogyCanvas reviewData={reviewData} height={340} accentColor={colors.accent} titleColor={colors.title} textColor={colors.textSecondary} />
            </div>

            {/* Pipelines documentés — grille de cellules affichant directement les données de
                chaque étape (icône/libellé/valeur, via `PipelineStepFields`, déjà le composant
                partagé utilisé par les 4 autres templates), plutôt que l'ancienne grille de
                pastilles `PipelineMiniGrid` (interactive "cliquer pour révéler", pertinente dans
                l'aperçu Studio mais MUETTE une fois figée en export statique — un rapport de
                traçabilité en PDF/PNG ne peut pas être cliqué). Corrigé 2026-08-03 suite à un
                retour utilisateur sur un export réel en prod. */}
            {activeTimelines.length > 0 && (
                <Section title="Processus de production" icon="📅">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.section }}>
                        {activeTimelines.map((t) => {
                            const steps = safeParse(reviewData[t.dataKey], []);
                            if (!Array.isArray(steps) || steps.length === 0) return null;
                            return (
                                <div key={t.type}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: spacing.gap,
                                        marginBottom: 6, fontSize: `${fontSize.text}px`, fontWeight: 700, color: colors.title,
                                    }}>
                                        <span>{t.icon}</span>
                                        <span style={{ flex: 1 }}>{t.name}</span>
                                        <span style={{ fontSize: `${fontSize.small}px`, color: colors.accent, fontWeight: 600 }}>{steps.length} étapes</span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                                        {steps.map((step, si) => {
                                            const label = step.label || step.date || step.semaine || step.phase || step.jour || `${si + 1}`;
                                            const fields = summarizeCellFields(t.type, step);
                                            return (
                                                <div key={si} style={{
                                                    background: colorWithOpacity(colors.accent, 6),
                                                    borderRadius: 8,
                                                    padding: '8px 10px',
                                                    borderLeft: `3px solid ${colors.accent}`,
                                                }}>
                                                    <div style={{ fontSize: `${fontSize.small}px`, fontWeight: 700, color: colors.accent, marginBottom: 4 }}>
                                                        {String(label)}
                                                    </div>
                                                    <PipelineStepFields
                                                        fields={fields}
                                                        compact
                                                        fontSize={fontSize.small}
                                                        colors={{ textSecondary: colors.textSecondary, textPrimary: colors.textPrimary }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}

            {/* Journal d'événements (Chantier 1/2/4) */}
            {events.length > 0 && (
                <Section title="Journal d'événements" icon="📜">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {events.slice(0, 30).map(event => {
                            const derivedBadges = evaluateChainEventRules(event);
                            const isManual = event.action === 'manual.event';
                            const label = isManual ? (event.metadata?.title || 'Événement') : event.action;
                            return (
                                <div key={event.id} style={{
                                    padding: '6px 10px', borderRadius: 8,
                                    background: colorWithOpacity(colors.accent, 5),
                                    borderLeft: `3px solid ${derivedBadges.length > 0 ? '#f59e0b' : colorWithOpacity(colors.accent, 40)}`,
                                    fontSize: `${fontSize.small}px`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                        <strong>{label}</strong>
                                        <span style={{ opacity: 0.6 }}>{formatDate(event.createdAt)}</span>
                                    </div>
                                    {event.metadata?.description && (
                                        <div style={{ color: colors.textSecondary }}>{event.metadata.description}</div>
                                    )}
                                    {derivedBadges.map(badge => (
                                        <div key={badge} style={{ color: '#f59e0b', fontWeight: 600, marginTop: 2 }}>{badge}</div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}
        </div>
    );
}
