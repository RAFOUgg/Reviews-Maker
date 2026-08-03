import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import React from 'react';
import {
    asArray,
    extractLabel,
    formatDate,
    extractCategoryRatings,
    extractPipelines,
    filterVisiblePipelines,
    extractExtraData,
    colorWithOpacity,
    getResponsiveAdjustments,
    SEMANTIC_SCORE_COLORS,
    getScoreBand,
    RATIO_DIMENSIONS,
} from '../../utils/exportMakerHelpers';
import { resolveImageUrl } from '../../utils/export-maker/resolveImageUrl';
import { summarizeCellFields } from '../../utils/chainCellPipelines';
import ReadOnlyGenealogyCanvas from '../export/interactive/ReadOnlyGenealogyCanvas';
import ReadOnlyProductionChainCanvas from '../export/interactive/ReadOnlyProductionChainCanvas';
import PipelineMiniGrid from '../export/interactive/PipelineMiniGrid';
import { getCannabinoidItems, GisementSections, isModuleOn } from './sections/RegistrySections';
import SensoryRadar from './sections/SensoryRadar';
import CultureStatsChart from './sections/CultureStatsChart';
import PipelineStepFields from './sections/PipelineStepFields';
import { QRCodeSVG } from 'qrcode.react';
import { getLotCode, getLotCodeUrl } from '../../utils/lotCode';

// Groupes du "gisement" rendus génériquement depuis le registre — 'lab' est retiré de cette liste
// car ses 7 champs sont désormais assemblés explicitement dans la section 04 "Données laboratoire
// & curing" (specs-direction-artistique.md), aux côtés des champs de curing (curingType/
// curingTemperature/curingHumidity/curingDuration, qui ne sont eux jamais dans le registre — cf.
// extractExtraData). Les retirer d'ici évite la duplication ; tous les autres groupes restent pour
// ne perdre aucune donnée réelle non couverte par le spec (celui-ci ne modélise qu'un cas simple).
const GISEMENT_GROUPS = ['harvest', 'culture', 'usage', 'separation', 'extraction', 'purification', 'recipe', 'overflow'];
const GISEMENT_ICONS = {
    harvest: '🌾', culture: '🌱', usage: '💨',
    separation: '🧊', extraction: '⚗️', purification: '💧', recipe: '🍯', overflow: '➕',
};

const LAB_METHOD_LABELS = {
    hplc: 'HPLC',
    'gc-ms': 'GC-MS',
    'lc-ms-ms': 'LC-MS/MS',
    nirs: 'NIRS',
    rmn: 'RMN',
    'icp-ms': 'ICP-MS',
    other: 'Autre méthode',
};

const TIMELINE_PIPELINES = [
    { type: 'culture', name: 'Culture', icon: '🌱', dataKey: 'cultureTimelineData', configKey: 'cultureTimelineConfig' },
    { type: 'curing', name: 'Curing & Maturation', icon: '🔥', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' },
    { type: 'extraction', name: 'Extraction', icon: '⚗️', dataKey: 'extractionTimelineData', configKey: 'extractionTimelineConfig' },
    { type: 'separation', name: 'Séparation', icon: '🔬', dataKey: 'separationTimelineData', configKey: 'separationTimelineConfig' },
];

// Traduit la clé du pipeline (`extractPipelines`) vers l'identifiant de type attendu par
// `summarizeCellFields` (chainCellPipelines.js) — même mapping que les autres templates.
const PIPELINE_TYPE_BY_KEY = {
    pipelineGlobal: 'culture',
    cultureTimeline: 'culture',
    pipelineCuring: 'curing',
    curingTimeline: 'curing',
    pipelineExtraction: 'extraction',
    extractionTimelineData: 'extraction',
    pipelineSeparation: 'separation',
    separationTimelineData: 'separation',
};

const DISPLAY = '"Space Grotesk", "Inter", sans-serif';
const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, monospace';

/**
 * DetailedCardTemplate — Fiche Technique Détaillée, direction artistique v2 (2026-07-30,
 * specs-direction-artistique.md + terpologie-coa-v2.html). Remplace le glassmorphism (livré
 * 2026-07-29) par une identité "certificat de laboratoire" : fond charcoal-vert par défaut
 * (palette "Résine"), 3 bandes sémantiques FIXES pour les scores (vert conforme / ambre moyen /
 * terracotta bas — `SEMANTIC_SCORE_COLORS`, indépendantes de la palette active), Space Grotesk
 * pour les titres, JetBrains Mono pour tous les chiffres/données (chasse tabulaire). Un seul gros
 * chiffre du document : la note globale.
 *
 * Mode papier (impression/document) déclenché automatiquement sur le ratio A4 — fond crème/encre
 * sombre/filets fins, les accents (résine/plante/terracotta + accent de palette) restent
 * identiques entre écran et papier (cf. spec §2).
 */
export default function DetailedCardTemplate({ config, reviewData, dimensions }) {
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 p-8">
                <p className="text-gray-400 text-lg">📋 Données manquantes pour la fiche technique</p>
            </div>
        );
    }

    const { typography, colors, contentModules, image, branding } = config;
    const responsive = getResponsiveAdjustments(config.ratio, typography);
    const { isSquare, isPortrait, isA4, fontSize, padding, spacing, limits, grid } = responsive;

    // Pagination adaptative (Chantier D, 2026-07-31) : `config.pageModuleIds` (Set/array d'ids ou
    // absent) restreint quels blocs s'affichent sur CETTE page — orthogonal aux booléens
    // `contentModules` existants (qui pilotent "ce champ est-il activé par l'utilisateur du tout",
    // indépendamment de la pagination). Absent (rendu normal/non paginé/pages statiques) : tout
    // s'affiche, comportement 100% identique à avant ce chantier. Voir `Section` plus bas et les
    // blocs non-Section (masthead, canevas, pipelines) qui portent chacun leur propre `data-module`
    // pour la mesure réelle de hauteur (`measureDetailedCardModules.js`).
    const pageModuleIds = config.pageModuleIds
        ? (config.pageModuleIds instanceof Set ? config.pageModuleIds : new Set(config.pageModuleIds))
        : null;
    const isPageOn = (moduleId) => !pageModuleIds || pageModuleIds.has(moduleId);

    // Mode papier = ratio A4 (cf. tableau d'adaptation par format du spec : Document/PDF → mode
    // papier ; tous les autres ratios → mode écran). Pas ajouté à `getResponsiveAdjustments`
    // (ratio-driven only, partagé par les 4 autres templates) — dérivé localement ici.
    const isPaperMode = isA4;
    const isLightScreenPalette = !colors.background?.includes('gradient');
    const tint = (isPaperMode || isLightScreenPalette) ? '#000000' : '#ffffff';

    const bg = isPaperMode ? '#F5F2E9' : colors.background;
    const surface = isPaperMode ? '#EAE5D7' : colorWithOpacity(tint, isLightScreenPalette ? 4 : 5);
    const line = isPaperMode ? '#D8D2C2' : colorWithOpacity(tint, 11);
    const lineSoft = isPaperMode ? '#DCD6C6' : colorWithOpacity(tint, 7);
    const textPrimary = isPaperMode ? '#1A211D' : (colors.textPrimary || '#EDEAE0');
    const textSecondary = isPaperMode ? '#4a5049' : (colors.textSecondary || '#A9B2AA');
    const titleColor = isPaperMode ? '#1A211D' : (colors.title || textPrimary);
    const accent = colors.accent || '#C9922E';

    // Extraction des données
    const categoryRatings = extractCategoryRatings(reviewData.categoryRatings, reviewData);
    const categoryByKey = Object.fromEntries(categoryRatings.map((c) => [c.key, c]));
    const pipelines = extractPipelines(reviewData);
    const aromas = asArray(reviewData.aromas).slice(0, limits.maxTags);
    const secondaryAromas = asArray(reviewData.secondaryAromas).slice(0, limits.maxTags);
    const tastes = asArray(reviewData.tastes).slice(0, limits.maxTags);
    const terpenes = asArray(reviewData.terpenes).slice(0, limits.maxTags);
    const cannabinoidItems = getCannabinoidItems(reviewData, contentModules);
    const extraData = extractExtraData(reviewData.extraData, reviewData).slice(0, limits.maxInfoCards);

    const selectedImgIndex = config.image?.selectedIndex ?? 0;
    const mainImage = resolveImageUrl(
        (Array.isArray(reviewData.images) && reviewData.images.length > 0)
            ? (reviewData.images[selectedImgIndex] || reviewData.images[0])
            : (reviewData.mainImageUrl || reviewData.imageUrl || null)
    );

    const producerName = reviewData.farm || reviewData.hashmaker || reviewData.breeder || '';
    const authorName = reviewData.ownerName || (typeof reviewData.author === 'string' ? reviewData.author : reviewData.author?.username) || 'Anonyme';
    const lotCode = reviewData.id ? getLotCode(reviewData.id) : null;
    const docDate = formatDate(reviewData.date || reviewData.createdAt);

    // ── Section 01 : familles sensorielles ────────────────────────────────────────────────
    // 3 familles du spec, combinant les 5 catégories réelles (visual/smell/texture/taste/effects)
    // deux par deux + smell seule — "Odeur & Arôme" ne reprend QUE la catégorie smell (les tags
    // d'arômes/dominants-secondaires sont une section à part, 03).
    const combineSubDetails = (...cats) => cats
        .filter(Boolean)
        .flatMap((c) => c.subDetails || (c.value != null ? [{ key: c.key, label: c.label, value: c.value }] : []));
    const families = [
        { title: 'Visuel & Texture', dot: accent, metrics: combineSubDetails(categoryByKey.visual, categoryByKey.texture) },
        { title: 'Odeur & Arôme', dot: SEMANTIC_SCORE_COLORS.hi, metrics: combineSubDetails(categoryByKey.smell) },
        { title: 'Goût & Effets', dot: SEMANTIC_SCORE_COLORS.lo, metrics: combineSubDetails(categoryByKey.taste, categoryByKey.effects) },
    ].filter((f) => f.metrics.length > 0);

    // ── Section 02 : radar 6 axes ──────────────────────────────────────────────────────────
    // 5 axes = moyenne des 5 catégories réelles ; "Arôme" (6e) dérivé d'une sous-métrique déjà
    // réelle de la catégorie smell (complexité/intensité aromatique) — décision actée avec
    // l'utilisateur plutôt que d'inventer une donnée qui n'existe pas.
    const aromeSubDetail = categoryByKey.smell?.subDetails?.find((s) => s.key === 'complexiteAromas' || s.key === 'intensiteAromatique' || s.key === 'aromasIntensity');
    const radarAxes = [
        categoryByKey.visual && { label: 'Visuel', value: categoryByKey.visual.value },
        categoryByKey.smell && { label: 'Odeur', value: categoryByKey.smell.value },
        categoryByKey.texture && { label: 'Texture', value: categoryByKey.texture.value },
        categoryByKey.taste && { label: 'Goût', value: categoryByKey.taste.value },
        categoryByKey.effects && { label: 'Effets', value: categoryByKey.effects.value },
        (aromeSubDetail || categoryByKey.smell) && { label: 'Arôme', value: aromeSubDetail?.value ?? categoryByKey.smell?.value },
    ].filter(Boolean);

    // ── Section 04 : grille labo & curing ──────────────────────────────────────────────────
    const labCells = [];
    if (isModuleOn(contentModules, 'labName') && reviewData.labName) labCells.push({ label: 'Laboratoire', value: reviewData.labName });
    if (isModuleOn(contentModules, 'labMethod') && reviewData.labMethod) labCells.push({ label: "Méthode d'analyse", value: LAB_METHOD_LABELS[reviewData.labMethod] || reviewData.labMethod });
    if (isModuleOn(contentModules, 'labAccredited') && reviewData.labAccredited !== undefined && reviewData.labAccredited !== null) {
        labCells.push({ label: 'Laboratoire accrédité', value: reviewData.labAccredited ? 'Oui' : 'Non', status: reviewData.labAccredited ? 'ok' : 'warn' });
    }
    if (isModuleOn(contentModules, 'labAccreditationStandard') && reviewData.labAccreditationStandard) labCells.push({ label: "Norme d'accréditation", value: reviewData.labAccreditationStandard });
    if (isModuleOn(contentModules, 'labAnalysisDate') && reviewData.labAnalysisDate) labCells.push({ label: "Date d'analyse", value: formatDate(reviewData.labAnalysisDate) });
    if (isModuleOn(contentModules, 'labReportUrl') && reviewData.labReportUrl) labCells.push({ label: "Certificat d'analyse", value: 'Disponible', status: 'ok' });
    if (isModuleOn(contentModules, 'terpeneFileUrl') && reviewData.terpeneFileUrl) labCells.push({ label: 'Certificat terpènes', value: 'Disponible', status: 'ok' });
    if (reviewData.curingType) labCells.push({ label: 'Type de curing', value: reviewData.curingType });
    if (reviewData.curingTemperature != null) labCells.push({ label: 'Température curing', value: reviewData.curingTemperature, unit: '°C' });
    if (reviewData.curingHumidity != null) labCells.push({ label: 'Humidité curing', value: reviewData.curingHumidity, unit: '%' });
    if (reviewData.curingDuration) labCells.push({ label: 'Durée curing', value: reviewData.curingDuration });

    // ── Composants locaux ──────────────────────────────────────────────────────────────────

    // Titre de section — numéroté (spec) ou non (sections réelles hors périmètre du spec, ex.
    // pipelines/généalogie/données complémentaires), toujours un simple filet + libellé, jamais
    // de carte/verre (la direction v2 abandonne délibérément le glassmorphism).
    // `moduleId` (optionnel) : identifiant de pagination adaptative — porte `data-module` (mesure
    // réelle de hauteur) et se masque si `pageModuleIds` est posé et ne le contient pas. Les
    // `Section` sans `moduleId` (aucune section n'en manque volontairement aujourd'hui) resteraient
    // toujours visibles, par sécurité (mieux vaut un doublon qu'une disparition silencieuse).
    const Section = ({ idx, title, moduleId, children }) => {
        if (moduleId && !isPageOn(moduleId)) return null;
        return (
            <div data-module={moduleId || undefined} style={{ padding: `${spacing.section}px 0`, borderTop: `1px solid ${lineSoft}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: spacing.element * 2 }}>
                    {idx && <span style={{ fontFamily: MONO, fontSize: fontSize.small, color: accent, letterSpacing: '0.05em', flexShrink: 0 }}>{idx}</span>}
                    <h2 style={{ fontFamily: DISPLAY, fontSize: `${fontSize.section}px`, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: titleColor, flexShrink: 0, whiteSpace: 'nowrap' }}>{title}</h2>
                    <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${line}, transparent)` }} />
                </div>
                {children}
            </div>
        );
    };

    const Metric = ({ label, value }) => {
        const band = getScoreBand(value);
        return (
            <div style={{ marginBottom: spacing.gap + 3 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontSize: `${fontSize.small}px`, color: textSecondary }}>{label}</span>
                    <span style={{ fontFamily: MONO, fontSize: `${fontSize.small}px`, fontWeight: 600, color: textPrimary }}>{Number(value).toFixed(1)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: line, overflow: 'hidden' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(10, value)) * 10}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 99, background: SEMANTIC_SCORE_COLORS[band] }}
                    />
                </div>
            </div>
        );
    };

    const FamilyBlock = ({ title, dot, metrics }) => {
        const avg = metrics.reduce((s, m) => s + m.value, 0) / metrics.length;
        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: spacing.element, paddingBottom: spacing.gap, borderBottom: `1px solid ${lineSoft}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                    <span style={{ fontFamily: DISPLAY, fontSize: `${fontSize.small + 1}px`, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: titleColor, whiteSpace: 'nowrap' }}>{title}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: `${fontSize.small}px`, color: textSecondary }}>moy {avg.toFixed(1)}</span>
                </div>
                {metrics.map((m, i) => <Metric key={i} label={m.label} value={m.value} />)}
            </div>
        );
    };

    const ChipGroup = ({ title, items, variant = 'default' }) => {
        if (!items || items.length === 0) return null;
        return (
            <div>
                <div style={{ fontFamily: MONO, fontSize: `${Math.max(9, fontSize.small - 1)}px`, letterSpacing: '0.12em', color: textSecondary, textTransform: 'uppercase', marginBottom: spacing.gap + 2 }}>{title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {items.map((it, i) => (
                        <span key={i} style={{
                            fontSize: `${fontSize.small}px`,
                            padding: '5px 11px',
                            borderRadius: 99,
                            border: `1px solid ${variant === 'primary' ? colorWithOpacity(accent, 50) : line}`,
                            background: variant === 'primary' ? colorWithOpacity(accent, 12) : surface,
                            color: variant === 'primary' ? accent : textPrimary,
                        }}>
                            {extractLabel(it)}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    const DataCell = ({ label, value, unit, status }) => {
        const statusColor = status === 'ok' ? SEMANTIC_SCORE_COLORS.hi : status === 'warn' ? SEMANTIC_SCORE_COLORS.lo : textPrimary;
        return (
            <div style={{ background: surface, padding: `${padding.card * 0.8}px ${padding.card}px` }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.1em', color: textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: `${fontSize.text + 2}px`, fontWeight: 600, color: statusColor }}>
                    {value}{unit && <span style={{ fontSize: 11, color: textSecondary, fontWeight: 400 }}> {unit}</span>}
                </div>
            </div>
        );
    };

    const StepCard = ({ step, index, pipelineType }) => {
        const label = step.label || step.date || step.semaine || step.phase || step.jour || `${index + 1}`;
        const fields = summarizeCellFields(pipelineType, step);

        return (
            <div style={{
                display: 'flex', gap: isSquare ? 8 : 10, alignItems: 'flex-start',
                padding: `${isSquare ? 8 : 10}px ${isSquare ? 10 : 12}px`,
                background: surface,
                borderRadius: 8,
                borderLeft: `3px solid ${accent}`,
            }}>
                <div style={{
                    flexShrink: 0, textAlign: 'center',
                    padding: `4px ${isSquare ? 7 : 9}px`,
                    background: colorWithOpacity(accent, 16),
                    borderRadius: isSquare ? 5 : 7,
                    fontFamily: MONO,
                    fontSize: `${fontSize.small}px`, fontWeight: '700',
                    color: accent, whiteSpace: 'nowrap',
                }}>
                    {String(label)}
                </div>
                <PipelineStepFields
                    fields={fields}
                    compact={isSquare}
                    fontSize={fontSize.small}
                    colors={{ textSecondary, textPrimary }}
                />
            </div>
        );
    };

    const PipelineTimeline = ({ pipeline, moduleId }) => {
        const rawSteps = pipeline.rawSteps || pipeline.steps.map((s) => ({ label: s }));
        const pipelineType = PIPELINE_TYPE_BY_KEY[pipeline.key] || pipeline.key;
        return (
            <div data-module={moduleId} style={{ marginBottom: `${spacing.element}px` }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: spacing.element,
                    marginBottom: spacing.gap + 2,
                    padding: `${isSquare ? 5 : 7}px ${isSquare ? 8 : 12}px`,
                    background: surface,
                    borderRadius: isSquare ? 8 : 10,
                }}>
                    <span style={{ fontSize: isSquare ? '16px' : '20px' }}>{pipeline.icon}</span>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span style={{ fontFamily: DISPLAY, fontSize: `${fontSize.text}px`, fontWeight: '700', color: titleColor }}>{pipeline.name}</span>
                        {pipeline.configMeta && <span style={{ fontSize: `${fontSize.small}px`, color: textSecondary }}>{pipeline.configMeta}</span>}
                    </div>
                    <span style={{
                        fontFamily: MONO, fontSize: `${fontSize.small}px`, color: accent,
                        background: colorWithOpacity(accent, 16),
                        padding: '2px 7px', borderRadius: 20, fontWeight: '600',
                    }}>
                        {rawSteps.length} étape{rawSteps.length > 1 ? 's' : ''}
                    </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {rawSteps.map((step, i) => <StepCard key={i} step={step} index={i} pipelineType={pipelineType} />)}
                </div>
            </div>
        );
    };

    const renderBranding = () => {
        if (!branding?.enabled || !branding?.logoUrl) return null;
        const positionMap = {
            'top-left': { top: '20px', left: '20px' },
            'top-right': { top: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' },
            'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        };
        const sizeMap = { small: '50px', medium: '70px', large: '90px' };
        return (
            <div
                className="absolute pointer-events-none export-maker-branding"
                style={{
                    ...positionMap[branding.position || 'bottom-right'],
                    opacity: branding.opacity || 0.8,
                    width: sizeMap[branding.size || 'medium'],
                    height: sizeMap[branding.size || 'medium'],
                }}
            >
                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
        );
    };

    const metaItems = [
        contentModules.type && reviewData.type && { label: 'Type', value: reviewData.type },
        contentModules.consumptionMethod !== false && reviewData.consumptionMethod && { label: 'Consommation', value: reviewData.consumptionMethod },
        reviewData.labAccredited !== undefined && reviewData.labAccredited !== null && { label: 'Labo accrédité', value: reviewData.labAccredited ? 'Oui' : 'Non', status: reviewData.labAccredited ? 'ok' : 'warn' },
        { label: 'Certificat', value: reviewData.labReportUrl ? 'Disponible' : 'Non disponible', status: reviewData.labReportUrl ? 'ok' : 'warn' },
    ].filter(Boolean);

    const stacked = isPortrait || isSquare;
    const visiblePipelines = filterVisiblePipelines(pipelines, contentModules);

    // ── Statistiques de culture (Chantier A, 2026-07-30) ──────────────────────────────────
    // Largeur explicite dérivée des dimensions réelles du canevas (pas de `ResponsiveContainer`
    // Recharts, jamais testé dans le pipeline `html-to-image` — cf. plan) : le canevas exporté a
    // une taille en pixels fixe et connue (`RATIO_DIMENSIONS`), donc pas besoin de mesure au runtime.
    const canvasDims = RATIO_DIMENSIONS[config.ratio] || RATIO_DIMENSIONS['1:1'];
    const cultureSteps = Array.isArray(reviewData.cultureTimelineData) ? reviewData.cultureTimelineData : null;
    const chartWidth = Math.round((canvasDims.width - padding.container * 2) * (stacked ? 1 : 0.9));

    // `overflow-hidden`, jamais `overflow-auto` (corrigé 2026-08-03, retour utilisateur sur un
    // export réel en prod) : ce canevas est déjà à hauteur fixe (`TemplateRenderer.jsx`) et la
    // pagination adaptative est censée éliminer tout débordement en amont — un scroll interne
    // masquait silencieusement du contenu dans l'aperçu Studio au lieu de le rendre visible via
    // une page supplémentaire, contraire au principe "aucun rendu ne doit être scrollable".
    return (
        <div className="relative w-full h-full overflow-hidden" style={{ background: bg, fontFamily: 'Inter, sans-serif', color: textPrimary, padding: `${padding.container}px` }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full h-full flex flex-col">

                {/* ── MASTHEAD ── */}
                {isPageOn('masthead') && <div data-module="masthead" style={{
                    display: 'flex', flexDirection: stacked ? 'column' : 'row',
                    gap: stacked ? spacing.section : 0,
                    background: surface,
                    borderRadius: 14,
                    border: `1px solid ${line}`,
                    overflow: 'hidden',
                    marginBottom: `${spacing.section}px`,
                    flexShrink: 0,
                }}>
                    <div style={{ flex: stacked ? 'none' : '1 1 55%', padding: `${padding.section}px`, position: 'relative', display: 'flex', flexDirection: 'column', gap: spacing.gap }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 22, height: 22, borderRadius: 6, background: `conic-gradient(from 210deg, ${accent}, ${SEMANTIC_SCORE_COLORS.hi}, ${accent})`, flexShrink: 0 }} />
                            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: `${fontSize.small + 1}px`, color: titleColor }}>
                                TERPOLOGIE{producerName && <span style={{ color: textSecondary, fontWeight: 500 }}> / {producerName}</span>}
                            </span>
                            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: `${fontSize.small - 1}px`, letterSpacing: '0.1em', color: SEMANTIC_SCORE_COLORS.hi, border: `1px solid ${line}`, padding: '4px 9px', borderRadius: 6, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                Fiche technique · COA
                            </span>
                        </div>

                        {contentModules.category && (reviewData.category || reviewData.type) && (
                            <div style={{ fontFamily: MONO, fontSize: `${fontSize.small}px`, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase' }}>
                                {reviewData.category || reviewData.type}
                            </div>
                        )}

                        {contentModules.title && (reviewData.title || reviewData.holderName) && (
                            <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: `${Math.round(fontSize.title * 1.35)}px`, lineHeight: 0.98, letterSpacing: '-0.02em', color: titleColor }}>
                                {reviewData.title || reviewData.holderName}
                            </h1>
                        )}

                        <div style={{ fontSize: `${fontSize.text}px`, color: textSecondary }}>
                            Rédigé par <b style={{ color: titleColor, fontWeight: 600 }}>{authorName}</b>
                            {lotCode && <> · Lot <b style={{ color: titleColor, fontWeight: 600, fontFamily: MONO }}>{lotCode}</b></>}
                            {docDate && <> · {docDate}</>}
                        </div>

                        {metaItems.length > 0 && (
                            <div style={{ display: 'flex', gap: spacing.section, marginTop: spacing.gap, flexWrap: 'wrap' }}>
                                {metaItems.map((m, i) => (
                                    <div key={i}>
                                        <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.12em', color: textSecondary, textTransform: 'uppercase' }}>{m.label}</div>
                                        <div style={{ fontFamily: DISPLAY, fontSize: `${fontSize.text + 1}px`, fontWeight: 600, marginTop: 2, color: m.status === 'ok' ? SEMANTIC_SCORE_COLORS.hi : m.status === 'warn' ? SEMANTIC_SCORE_COLORS.lo : titleColor }}>
                                            {m.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {contentModules.rating && reviewData.rating != null && !isNaN(parseFloat(reviewData.rating)) && (
                            <div style={{ marginTop: stacked ? spacing.gap : 0, textAlign: stacked ? 'left' : 'right', ...(stacked ? {} : { position: 'absolute', right: padding.section, bottom: padding.section }) }}>
                                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '0.14em', color: textSecondary, textTransform: 'uppercase' }}>Note globale</div>
                                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: `${Math.round(fontSize.title * 0.85)}px`, lineHeight: 1, color: accent }}>
                                    {parseFloat(reviewData.rating).toFixed(1)}<span style={{ fontSize: `${fontSize.text + 3}px`, color: textSecondary }}>/10</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {contentModules.mainImage !== false && mainImage && (
                        <div style={{ flex: stacked ? 'none' : '1 1 45%', position: 'relative', minHeight: stacked ? responsive.image.maxHeight : 'auto', overflow: 'hidden', background: '#0a0f0c' }}>
                            <img src={mainImage} alt="" className="w-full h-full object-cover" style={{ position: stacked ? 'static' : 'absolute', inset: 0 }} />
                            {!stacked && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${colorWithOpacity(isPaperMode ? '#F5F2E9' : '#0E1512', 85)}, transparent 22%)` }} />}
                        </div>
                    )}
                </div>}

                {/* ── 01 · ÉVALUATION SENSORIELLE ── */}
                {families.length > 0 && (
                    <Section idx="01" title="Évaluation sensorielle" moduleId="sensoryEvaluation">
                        <div className="grid" style={{ gridTemplateColumns: stacked ? '1fr' : `repeat(${families.length}, 1fr)`, gap: `${spacing.section}px` }}>
                            {families.map((f, i) => <FamilyBlock key={i} title={f.title} dot={f.dot} metrics={f.metrics} />)}
                        </div>
                    </Section>
                )}

                {/* ── 02 · PROFIL CANNABINOÏDE ── */}
                {(cannabinoidItems.length > 0 || radarAxes.length >= 3) && (
                    <Section idx="02" title="Profil cannabinoïde" moduleId="cannabinoidProfile">
                        <div className="grid" style={{ gridTemplateColumns: stacked ? '1fr' : '1.4fr 1fr', gap: `${spacing.section}px`, alignItems: 'start' }}>
                            {cannabinoidItems.length > 0 && (() => {
                                const max = Math.max(...cannabinoidItems.map((c) => c.value));
                                const total = cannabinoidItems.reduce((s, c) => s + c.value, 0);
                                return (
                                    <div>
                                        {cannabinoidItems.map((c, i) => (
                                            <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 56px', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: `1px solid ${lineSoft}` }}>
                                                <span style={{ fontFamily: MONO, fontSize: `${fontSize.small + 1}px`, fontWeight: 600, color: titleColor }}>{c.label}</span>
                                                <span style={{ height: 9, borderRadius: 99, background: line, overflow: 'hidden', display: 'block' }}>
                                                    <motion.span initial={{ width: 0 }} animate={{ width: `${(c.value / max) * 100}%` }} transition={{ duration: 0.7 }} style={{ display: 'block', height: '100%', borderRadius: 99, background: accent }} />
                                                </span>
                                                <span style={{ fontFamily: MONO, fontSize: `${fontSize.small + 1}px`, textAlign: 'right', color: titleColor }}>{c.value}{c.unit}</span>
                                            </div>
                                        ))}
                                        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 56px', alignItems: 'center', gap: 12, borderTop: `1px solid ${line}`, marginTop: 4, paddingTop: 12 }}>
                                            <span style={{ fontFamily: MONO, fontSize: `${fontSize.small + 1}px`, fontWeight: 700, color: SEMANTIC_SCORE_COLORS.hi }}>Total</span>
                                            <span style={{ height: 9, borderRadius: 99, background: line, overflow: 'hidden', display: 'block' }}>
                                                <span style={{ display: 'block', height: '100%', width: '100%', borderRadius: 99, background: SEMANTIC_SCORE_COLORS.hi }} />
                                            </span>
                                            <span style={{ fontFamily: MONO, fontSize: `${fontSize.small + 1}px`, textAlign: 'right', fontWeight: 700, color: SEMANTIC_SCORE_COLORS.hi }}>{total.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            })()}
                            {radarAxes.length >= 3 && (
                                <div style={{ background: surface, border: `1px solid ${lineSoft}`, borderRadius: 9, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', color: textSecondary, textTransform: 'uppercase', alignSelf: 'flex-start', marginBottom: 2 }}>Empreinte sensorielle</div>
                                    <SensoryRadar axes={radarAxes} accentColor={accent} lineColor={line} textColor={textSecondary} size={isSquare ? 200 : 240} />
                                </div>
                            )}
                        </div>
                    </Section>
                )}

                {/* ── 03 · PROFIL AROMATIQUE ── */}
                {(aromas.length > 0 || secondaryAromas.length > 0 || tastes.length > 0 || terpenes.length > 0) && contentModules.aromas && (
                    <Section idx="03" title="Profil aromatique · terpènes" moduleId="aromaticProfile">
                        <div className="grid" style={{ gridTemplateColumns: stacked ? '1fr' : 'repeat(2, 1fr)', gap: `${spacing.section}px` }}>
                            <ChipGroup title="Arômes dominants" items={aromas} variant="primary" />
                            <ChipGroup title="Arômes secondaires · goûts" items={secondaryAromas.length > 0 ? secondaryAromas : tastes} variant="default" />
                        </div>
                        {terpenes.length > 0 && <div style={{ marginTop: spacing.element }}><ChipGroup title="Terpènes" items={terpenes} variant="default" /></div>}
                    </Section>
                )}

                {/* ── 04 · DONNÉES LABORATOIRE & CURING ── */}
                {labCells.length > 0 && (
                    <Section idx="04" title="Données laboratoire & curing" moduleId="labData">
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${stacked ? Math.min(2, grid.cols) : grid.cols}, 1fr)`, gap: 1, background: lineSoft, border: `1px solid ${lineSoft}`, borderRadius: 9, overflow: 'hidden' }}>
                            {labCells.map((c, i) => <DataCell key={i} {...c} />)}
                        </div>
                    </Section>
                )}

                {/* Commentaire — texte libre du rédacteur (`review.description`, le seul champ de
                    commentaire réellement peuplé de l'app — `notes`/`comments`/`conclusion`/
                    `recommendations`/`warnings` sont des clés `contentModules` mortes, sans colonne
                    Prisma ni formulaire qui les alimente, cf. audit 2026-07-30). Retiré par erreur
                    lors de la refonte COA v2 (aucune régression de données voulue) — réintroduit. */}
                {contentModules.description && reviewData.description && (
                    <Section title="Commentaire" moduleId="description">
                        <p style={{ fontSize: `${fontSize.text}px`, color: textSecondary, lineHeight: 1.6, fontStyle: 'italic' }}>
                            « {reviewData.description} »
                        </p>
                    </Section>
                )}

                {/* Statistiques de culture — tendance des paramètres environnementaux (température,
                    humidité, CO2, PPFD, pH/EC…) sur la timeline de culture. Ne s'affiche que si au
                    moins 2 étapes ont des valeurs numériques (une tendance a besoin d'≥2 points) —
                    `CultureStatsChart` se masque lui-même sinon. */}
                {contentModules.pipelineInteractiveView !== false && cultureSteps && (
                    <Section title="Statistiques de culture" moduleId="cultureStats">
                        <CultureStatsChart steps={cultureSteps} pipelineType="culture" width={chartWidth} height={isSquare ? 180 : 220} textColor={textSecondary} lineColor={lineSoft} />
                    </Section>
                )}

                {/* Gisement complémentaire piloté par le registre (récolte, culture, usage, procédés…) —
                    non couvert par le spec (cas simple), conservé pour ne perdre aucune donnée réelle. */}
                <GisementSections
                    reviewData={reviewData}
                    contentModules={contentModules}
                    groups={GISEMENT_GROUPS}
                    Section={Section}
                    colors={{ accent, textPrimary, textSecondary, title: titleColor }}
                    fontSize={fontSize}
                    spacing={spacing}
                    groupIcons={GISEMENT_ICONS}
                />

                {/* Pipelines (production) — chaque pipeline porte son propre `data-module`
                    (`pipeline:<key>`) pour que la pagination adaptative puisse répartir Culture/
                    Curing/Extraction/Séparation/Purification sur des pages différentes selon leur
                    volume réel (au lieu du découpage fixe par ratio d'avant ce chantier). */}
                {(() => {
                    const pagePipelines = visiblePipelines.filter((p) => isPageOn(`pipeline:${p.key}`));
                    if (pagePipelines.length === 0) return null;
                    return (
                        <Section title="Processus de production">
                            {pagePipelines.map((p, i) => <PipelineTimeline key={i} pipeline={p} moduleId={`pipeline:${p.key}`} />)}
                        </Section>
                    );
                })()}

                {/* Vues interactives — vrais canevas React Flow en lecture seule (Chantier B,
                    2026-07-30 ; état 100% local, cf. commentaires des composants pour le
                    raisonnement d'isolation) ; se masquent elles-mêmes si aucune donnée liée. */}
                {contentModules.phenoHuntView !== false && isPageOn('genealogyCanvas') && (
                    <div data-module="genealogyCanvas" style={{ marginBottom: `${spacing.section}px` }}>
                        <ReadOnlyGenealogyCanvas reviewData={reviewData} height={isSquare ? 260 : 340} accentColor={accent} titleColor={titleColor} textColor={textSecondary} />
                    </div>
                )}
                {contentModules.productionChainView !== false && isPageOn('productionChainCanvas') && (
                    <div data-module="productionChainCanvas" style={{ marginBottom: `${spacing.section}px` }}>
                        <ReadOnlyProductionChainCanvas reviewData={reviewData} height={isSquare ? 200 : 260} accentColor={accent} titleColor={titleColor} textColor={textSecondary} />
                    </div>
                )}
                {/* Off par défaut (`pipelineDetailGrids`) : cette grille compacte affiche la même
                    donnée que "Processus de production" (PipelineStepFields) juste au-dessus, en
                    détail complet — redondance trouvée en audit 2026-08-02, laissée en option pour
                    qui préfère une vue résumée en plus. */}
                {contentModules.pipelineDetailGrids === true && (() => {
                    const activeTimelines = TIMELINE_PIPELINES.filter((t) => reviewData[t.dataKey] && reviewData[t.configKey]);
                    if (activeTimelines.length === 0) return null;
                    return (
                        <Section title="Pipelines — vue détaillée" moduleId="pipelineDetailGrids">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing.section}px` }}>
                                {activeTimelines.map((t) => (
                                    <PipelineMiniGrid key={t.type} type={t.type} name={t.name} icon={t.icon} timelineData={reviewData[t.dataKey]} timelineConfig={reviewData[t.configKey]} accentColor={accent} />
                                ))}
                            </div>
                        </Section>
                    );
                })()}

                {/* Caractéristiques supplémentaires (overflow) */}
                {contentModules.extraData && extraData.length > 0 && (
                    <Section title="Caractéristiques détaillées" moduleId="extraData">
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gap: 1, background: lineSoft, border: `1px solid ${lineSoft}`, borderRadius: 9, overflow: 'hidden' }}>
                            {extraData.map((d, i) => <DataCell key={i} label={d.label} value={d.value} />)}
                        </div>
                    </Section>
                )}

                {/* ── PIED ── */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                    paddingTop: `${spacing.element}px`, marginTop: `${spacing.section}px`,
                    borderTop: `1px solid ${line}`, flexShrink: 0,
                }}>
                    {reviewData.id && (
                        <div style={{ background: '#fff', padding: 3, borderRadius: 4, lineHeight: 0, flexShrink: 0 }}>
                            <QRCodeSVG value={getLotCodeUrl(reviewData.id)} size={36} level="M" />
                        </div>
                    )}
                    <div style={{ fontFamily: MONO, fontSize: `${fontSize.small}px`, color: textSecondary }}>
                        <b style={{ color: textPrimary }}>Identifiant interne — non réglementaire.</b>
                        {lotCode && <><br />Généré par Terpologie Export Maker · doc {lotCode}</>}
                    </div>
                    <div style={{ marginLeft: 'auto', fontFamily: DISPLAY, fontSize: `${fontSize.text}px`, fontWeight: 600, color: textSecondary }}>
                        TERPO<span style={{ color: accent }}>LOGIE</span>
                    </div>
                </div>

                {/* Debug — visible si ?debug=1 */}
                {typeof window !== 'undefined' && window.location.search.includes('debug=1') && (
                    <div className="mt-8 p-4 bg-black/50 rounded-xl border border-yellow-500/30">
                        <h4 className="text-yellow-400 font-bold mb-2">🔧 Debug - Données disponibles</h4>
                        <div className="text-xs text-gray-300 max-h-64 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(reviewData).map(([key, value]) => {
                                    let displayValue = value;
                                    if (value === null || value === undefined) displayValue = '(vide)';
                                    else if (Array.isArray(value)) displayValue = `[${value.length} items]`;
                                    else if (typeof value === 'object') displayValue = '{...}';
                                    else if (typeof value === 'string' && value.length > 30) displayValue = value.slice(0, 30) + '...';
                                    return (
                                        <div key={key} className={`p-1 rounded ${value && value !== '' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                            <span className="">{key}:</span> {String(displayValue)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {renderBranding()}
        </div>
    );
}

DetailedCardTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired,
};
