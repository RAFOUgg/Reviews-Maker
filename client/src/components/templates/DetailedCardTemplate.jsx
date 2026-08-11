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
    SEMANTIC_SCORE_TEXT_COLORS,
    ACCENT_TEXT_COLORS,
    ensureReadable,
    getTemplateColumns,
    blendOver,
    getScoreBand,
    RATIO_DIMENSIONS,
    MIN_FONT_PX,
    readableFontSize,
    getSelectedImages,
    TIMELINE_PIPELINES,
} from '../../utils/exportMakerHelpers';
import { resolveImageUrl } from '../../utils/export-maker/resolveImageUrl';
// Base d'icônes unique — remplace trois copies locales de la même table, dont une incomplète
// (Article de Blog n'avait ni `culture` ni `overflow`).
import { GROUP_ICONS } from '../../utils/fieldIcons';
import ReadOnlyGenealogyCanvas from '../export/interactive/ReadOnlyGenealogyCanvas';
import ReadOnlyProductionChainCanvas from '../export/interactive/ReadOnlyProductionChainCanvas';
import PipelineMiniGrid from '../export/interactive/PipelineMiniGrid';
import { noteWithEmoji } from '../../utils/noteEmoji';
import { getCannabinoidItems, GisementSections, isModuleOn } from './sections/RegistrySections';
import SensoryRadar from './sections/SensoryRadar';
import ScoreBoard from './sections/ScoreBoard';
import CultureStatsChart from './sections/CultureStatsChart';
import PipelineTimeline from './sections/PipelineTimeline';
import { QRCodeSVG } from 'qrcode.react';
import { getLotCode, getLotCodeUrl } from '../../utils/lotCode';
import { useDocumentSeal, formatIssuedAt } from '../../hooks/useDocumentSeal';

// Groupes du "gisement" rendus génériquement depuis le registre — 'lab' est retiré de cette liste
// car ses 7 champs sont désormais assemblés explicitement dans la section 04 "Données laboratoire
// & curing" (specs-direction-artistique.md), aux côtés des champs de curing (curingType/
// curingTemperature/curingHumidity/curingDuration, qui ne sont eux jamais dans le registre — cf.
// extractExtraData). Les retirer d'ici évite la duplication ; tous les autres groupes restent pour
// ne perdre aucune donnée réelle non couverte par le spec (celui-ci ne modélise qu'un cas simple).
const GISEMENT_GROUPS = ['harvest', 'culture', 'usage', 'separation', 'extraction', 'purification', 'recipe', 'overflow'];

const LAB_METHOD_LABELS = {
    hplc: 'HPLC',
    'gc-ms': 'GC-MS',
    'lc-ms-ms': 'LC-MS/MS',
    nirs: 'NIRS',
    rmn: 'RMN',
    'icp-ms': 'ICP-MS',
    other: 'Autre méthode',
};


// Aligné sur la pile de polices du SITE (tailwind.config.js > fontFamily.sans : -apple-system,
// SF Pro Display…). Inter en tête est l'équivalent web fidèle de cette pile et est réellement
// chargée depuis le 2026-08-04 (client/index.html) — auparavant ce template imposait Space Grotesk,
// une identité typographique qui n'existait nulle part ailleurs dans le produit.
const DISPLAY = 'Inter, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif';
const BODY = DISPLAY;
// Seule exception assumée : l'app n'a pas de police mono, mais les colonnes de chiffres ont besoin
// d'une chasse tabulaire pour s'aligner. Besoin fonctionnel, pas un choix d'identité.
const MONO = '"JetBrains Mono", "SF Mono", ui-monospace, monospace';

/**
 * DetailedCardTemplate — Fiche Technique Détaillée.
 *
 * STRUCTURE (issue de la DA v2 du 2026-07-30, specs-direction-artistique.md) : masthead stable,
 * sections numérotées 01-04, un seul gros chiffre dans le document (la note globale), chiffres en
 * chasse tabulaire, bandes sémantiques de score indépendantes de la palette active. Cette
 * organisation de l'information est conservée.
 *
 * COULEURS ET TYPOGRAPHIE — réalignées le 2026-08-04 sur la direction artistique du SITE
 * (LiquidUI) : le territoire "certificat de laboratoire" (charcoal-vert, ambre résine, Space
 * Grotesk) était une identité isolée, qui n'existait nulle part ailleurs dans le produit — un
 * utilisateur passant de l'app à sa fiche exportée changeait de marque. Désormais : palette
 * "Terpologie" dérivée de `theme-tokens.css`/`apple-liquid-glass.css`, accent violet, bandes
 * sémantiques emerald/amber/red (le système déjà utilisé par `LiquidBadge`/`LiquidAlert`), pile de
 * polices du site (Inter). Seule la chasse mono des chiffres est conservée — besoin fonctionnel.
 *
 * Mode papier (impression) déclenché automatiquement sur le ratio A4 — échelle neutre slate du
 * site (slate-50 papier / slate-900 encre), accents en nuances 600/700, seules à tenir AA sur
 * fond clair.
 */
export default function DetailedCardTemplate({ config, reviewData, dimensions }) {
    // AVANT tout retour anticipé : un hook appelé après un `return` conditionnel change l'ordre des
    // hooks d'un rendu à l'autre, ce que React interdit — placé plus bas, il faisait planter le
    // rendu (« Cannot read properties of null »), attrapé sur un export réel.
    const { shortHash } = useDocumentSeal(reviewData);
    const issuedAt = formatIssuedAt();

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

    // Mode papier réaligné sur l'échelle neutre du site (slate de tailwind.config.js) plutôt que
    // sur le crème/charcoal du territoire "certificat de laboratoire" abandonné : slate-50 pour le
    // papier, slate-900 pour l'encre, slate-200/100 pour les filets.
    const bg = isPaperMode ? '#F8FAFC' : colors.background;
    const surface = isPaperMode ? '#F1F5F9' : colorWithOpacity(tint, isLightScreenPalette ? 4 : 5);
    const line = isPaperMode ? '#CBD5E1' : colorWithOpacity(tint, 11);
    const lineSoft = isPaperMode ? '#E2E8F0' : colorWithOpacity(tint, 7);
    const textPrimary = isPaperMode ? '#0F172A' : (colors.textPrimary || '#E6EEF8');
    const textSecondary = isPaperMode ? '#475569' : (colors.textSecondary || '#CBD5E1');
    const titleColor = isPaperMode ? '#0F172A' : (colors.title || textPrimary);
    const accent = colors.accent || '#A78BFA';
    // Bandes sémantiques : `SEMANTIC_SCORE_COLORS` reste la couleur des SURFACES (barres, points,
    // dégradés — seuil WCAG 3:1) ; `scoreText` est la variante conforme AA (4.5:1) obligatoire dès
    // qu'un score colore du TEXTE. Cf. audit B3 §7 : hi/lo étaient à 3.73/3.76 en texte, et en mode
    // papier l'accent ambre tombe à 2.44 sur crème.
    const scoreText = isPaperMode ? SEMANTIC_SCORE_TEXT_COLORS.onPaper : SEMANTIC_SCORE_TEXT_COLORS.onDark;
    // Variante AA de l'accent pour le TEXTE : l'accent de palette (violet-500 par défaut) est une
    // couleur de surface, il échoue AA en petit texte sur le fond de l'app (4.42:1).
    const accentText = isPaperMode ? ACCENT_TEXT_COLORS.onPaper : ACCENT_TEXT_COLORS.onDark;
    // Accent de la palette UTILISATEUR rendu lisible sur le fond réellement en place : la teinte
    // choisie est conservée, seule la luminosité est corrigée du strict nécessaire. Sans ça, un
    // accent posé en texte sur le papier crème tombait à 2.48:1 (16 éléments mesurés).
    // Cible 4.8 et non 4.5 : le calcul se fait sur le fond de PAGE, alors que ces libellés
    // reposent souvent sur `surface`, légèrement plus sombre. Sans cette marge, le résultat
    // tombait à 4.38:1 — conforme sur le papier nu, juste en dessous sur les encadrés.
    const pageBg = isPaperMode ? '#F8FAFC' : '#0b1220';
    const accentReadable = ensureReadable(accent, pageBg, 4.8);
    // `getTemplateColumns` et non `getFormatLayout().columns` : la même source doit servir ici et
    // dans le budget de pagination, sans quoi les deux divergent — c'est cette divergence qui a
    // coupé du contenu sur Article de Blog (budget doublé, rendu sur une seule colonne).
    const templateColumns = getTemplateColumns('detailedCard', config.ratio);
    const sectionFlow = templateColumns > 1
        ? { columnCount: templateColumns, columnGap: `${spacing.section}px`, flex: 1, minHeight: 0 }
        : { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 };

    // Un chip d'arôme repose sur `accent` à 12 % au-dessus du fond, pas sur le fond nu : on
    // évalue le contraste contre cette surface réelle. Sans ça, 4.44:1 pour un seuil à 4.5.
    const chipBg = blendOver(accent, pageBg, 12);
    const accentOnChip = ensureReadable(accent, chipBg, 4.6);

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

    // Photos retenues par l'utilisateur (`config.image.selected`) — jamais `reviewData.images`
    // directement : sans ce filtre, décocher une photo n'avait aucun effet sur le rendu.
    const visibleImages = getSelectedImages(reviewData, config);
    const selectedImgIndex = config.image?.selectedIndex ?? 0;
    const mainImage = resolveImageUrl(
        visibleImages.length > 0
            ? (visibleImages[selectedImgIndex] || visibleImages[0])
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
    // `icon` remplace l'ancien `idx` ("01", "02"…). Cette numérotation venait du spec COA du
    // 2026-07-30, une identité « certificat de laboratoire » abandonnée depuis lors du
    // réalignement sur LiquidUI : elle n'existe nulle part ailleurs dans le produit (règle G4 de
    // l'audit). Une pastille d'icône reprend en revanche la grammaire des FORMULAIRES de saisie,
    // que l'utilisateur connaît déjà — et donne du repère visuel plutôt qu'un compteur.
    const SectionHeading = ({ icon, title }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: spacing.element * 2 }}>
            {icon && (
                <span style={{
                    flexShrink: 0, width: 26, height: 26, borderRadius: 8,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: fontSize.small,
                    background: colorWithOpacity(accent, 16),
                    border: `1px solid ${colorWithOpacity(accent, 30)}`,
                }}>{icon}</span>
            )}
            <h2 style={{ fontFamily: DISPLAY, fontSize: `${fontSize.section}px`, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: titleColor, flexShrink: 0, whiteSpace: 'nowrap' }}>{title}</h2>
            <span style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${line}, transparent)` }} />
        </div>
    );

    // Habillage commun d'un bloc du flux : filet de séparation et INSÉCABILITÉ. Extrait de
    // `Section` pour pouvoir l'appliquer à un bloc qui n'a pas son propre titre — un pipeline, par
    // exemple, qui doit être une unité de pagination à lui seul.
    const blockStyle = {
        padding: `${spacing.section}px 0`,
        borderTop: `1px solid ${lineSoft}`,
        // Insécable : en flux multi-colonnes, un bloc coupé en deux produirait un titre orphelin en
        // bas d'une colonne et son contenu en haut de la suivante.
        breakInside: 'avoid',
        WebkitColumnBreakInside: 'avoid',
    };

    const Section = ({ icon, title, moduleId, children }) => {
        if (moduleId && !isPageOn(moduleId)) return null;
        return (
            <div data-module={moduleId || undefined} style={blockStyle}>
                <SectionHeading icon={icon} title={title} />
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
                <div style={{ fontFamily: MONO, fontSize: `${readableFontSize(fontSize.small - 1)}px`, letterSpacing: '0.12em', color: textSecondary, textTransform: 'uppercase', marginBottom: spacing.gap + 2 }}>{title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {items.map((it, i) => (
                        <span key={i} style={{
                            fontSize: `${fontSize.small}px`,
                            padding: '5px 11px',
                            borderRadius: 99,
                            border: `1px solid ${variant === 'primary' ? colorWithOpacity(accent, 50) : line}`,
                            background: variant === 'primary' ? colorWithOpacity(accent, 12) : surface,
                            // `accentReadable` et non `accent` : sur le papier crème, un chip
                            // d'arôme en accent de palette tombait à 2.35:1 (mesuré).
                            color: variant === 'primary' ? accentOnChip : textPrimary,
                        }}>
                            {noteWithEmoji(extractLabel(it))}
                        </span>
                    ))}
                </div>
            </div>
        );
    };

    // Couleur d'un statut ok/warn, garantie lisible sur le fond où elle est POSÉE. Le fond compte :
    // la même teinte perd ~0,2 point de contraste entre le fond de page et `surface`, assez pour
    // passer sous le seuil. Factorisée parce qu'elle a deux sites d'appel (cellules de données et
    // méta-données du masthead) et que le second l'avait oubliée.
    const statusTextOn = (status, background, fallback = textPrimary) => {
        const raw = status === 'ok' ? scoreText.hi : status === 'warn' ? scoreText.lo : fallback;
        return isPaperMode ? ensureReadable(raw, background, 4.6) : raw;
    };

    const DataCell = ({ label, value, unit, status }) => {
        const statusColor = statusTextOn(status, surface);
        return (
            <div style={{ background: surface, padding: `${padding.card * 0.8}px ${padding.card}px` }}>
                <div style={{ fontFamily: MONO, fontSize: MIN_FONT_PX, letterSpacing: '0.1em', color: textSecondary, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: DISPLAY, fontSize: `${fontSize.text + 2}px`, fontWeight: 600, color: statusColor }}>
                    {value}{unit && <span style={{ fontSize: MIN_FONT_PX, color: textSecondary, fontWeight: 400 }}> {unit}</span>}
                </div>
            </div>
        );
    };

    // StepCard/PipelineTimeline locaux remplacés le 2026-08-04 par le composant partagé
    // `sections/PipelineTimeline.jsx` : la même boucle était réimplémentée dans 4 templates, et
    // c'est elle qui produisait le symptôme central (25 etapes a 24 C / 68 % / 888 ppm rendues en
    // 25 cartes identiques). Le composant partagé y ajoute le bandeau de conditions constantes et
    // le groupement par phase.
    // GRILLE DE CELLULES par défaut, comme dans les formulaires de saisie. La redondance
    // grille/liste avait été tranchée le 2026-08-02 en gardant la LISTE — mauvais arbitrage,
    // constaté sur capture le 2026-08-05 : une culture de 25 jours produisait 25 lignes
    // « TEMPÉRATURE JOUR · 24 °C » empilées sur toute la hauteur, illisibles et laissant la moitié
    // droite de la page vide. La grille dit la même chose en une poignée de cellules, avec la
    // grammaire visuelle que l'utilisateur connaît déjà de la saisie.
    //
    // La liste détaillée reste disponible en basculant `pipelineDetailGrids` sur `false`.
    // `heading` : le titre « Processus de production » est porté par le PREMIER pipeline de la page
    // au lieu d'envelopper tous les pipelines dans une `Section` commune. Cette enveloppe était
    // insécable (`breakInside: avoid`) : les deux pipelines formaient donc UN bloc de ~930px que le
    // flux à deux colonnes ne pouvait pas répartir, alors que le paginateur, lui, les comptait
    // séparément (363 + 515) et les croyait répartissables. Mesuré le 2026-08-06 en 16:9 : colonne
    // gauche à 451px, colonne droite à 1167px sur une page qui en fait 1032 — donc du contenu coupé
    // pendant que la moitié de la page restait vide. Chaque pipeline est maintenant sa propre unité
    // insécable, ce que le `data-module` posé sur lui annonçait déjà.
    const renderPipeline = (pipeline, moduleId, heading = null) => {
        if (contentModules.pipelineDetailGrids !== false) {
            const t = TIMELINE_PIPELINES.find((x) => pipeline.key?.includes(x.type))
                || TIMELINE_PIPELINES.find((x) => reviewData[x.dataKey]);
            if (t && reviewData[t.dataKey] && reviewData[t.configKey]) {
                return (
                    // PAS de `data-module` sur cette enveloppe : la grille se découpe elle-même en
                    // tranches paginables qui portent chacune le leur. Un module ne peut pas à la
                    // fois être mesuré ET contenir des modules mesurés — c'est exactement le double
                    // comptage qui produisait une page blanche sur le Rapport de Traçabilité.
                    <div key={moduleId} style={blockStyle}>
                        {heading}
                        <PipelineMiniGrid
                            type={t.type} name={t.name} icon={t.icon}
                            timelineData={reviewData[t.dataKey]}
                            timelineConfig={reviewData[t.configKey]}
                            accentColor={accent}
                            moduleId={moduleId}
                            isPageOn={isPageOn}
                        />
                    </div>
                );
            }
        }
        return renderPipelineList(pipeline, moduleId, heading);
    };

    // Variante LISTE (`pipelineDetailGrids: false`) : `PipelineTimeline` se découpe déjà lui-même
    // en tronçons `#N` paginables, on ne l'enferme donc pas dans un bloc insécable — seul le titre
    // de section a besoin d'un support.
    const renderPipelineList = (pipeline, moduleId, heading = null) => (
        <div key={moduleId}>
            {heading}
            <PipelineTimeline
                pipeline={pipeline}
                moduleId={moduleId}
                isPageOn={isPageOn}
                paged={!!pageModuleIds}
                compact={isSquare}
                fontSize={{ text: fontSize.text, small: fontSize.small }}
                spacing={{ element: spacing.element, gap: spacing.gap }}
                colors={{ textPrimary, textSecondary, title: titleColor, accent, accentText, surface, line }}
            />
        </div>
    );

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
    // Largeur d'UNE colonne du flux, pas du canevas entier. Le graphique vit dans `sectionFlow`,
    // qui coule en deux colonnes sur 16:9/4:3/A4 depuis le 2026-08-05 : calculé sur la pleine
    // largeur, il débordait sur la colonne voisine et se superposait à la section d'à côté —
    // constaté sur un PNG réellement exporté en 4:3 (« Caractéristiques détaillées » écrit
    // par-dessus les courbes), invisible dans les mesures de hauteur de l'auditeur.
    const columnWidth = (canvasDims.width - padding.container * 2 - spacing.section * (templateColumns - 1)) / templateColumns;
    const chartWidth = Math.round(columnWidth * (stacked ? 1 : 0.9));

    // `overflow-hidden`, jamais `overflow-auto` (corrigé 2026-08-03, retour utilisateur sur un
    // export réel en prod) : ce canevas est déjà à hauteur fixe (`TemplateRenderer.jsx`) et la
    // pagination adaptative est censée éliminer tout débordement en amont — un scroll interne
    // masquait silencieusement du contenu dans l'aperçu Studio au lieu de le rendre visible via
    // une page supplémentaire, contraire au principe "aucun rendu ne doit être scrollable".
    return (
        <div className="relative w-full h-full overflow-hidden" style={{ background: bg, fontFamily: BODY, color: textPrimary, padding: `${padding.container}px` }}>
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
                            <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: `${readableFontSize(fontSize.small - 1)}px`, letterSpacing: '0.1em', color: scoreText.hi, border: `1px solid ${line}`, padding: '4px 9px', borderRadius: 6, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                                Fiche technique · COA
                            </span>
                        </div>

                        {contentModules.category && (reviewData.category || reviewData.type) && (
                            <div style={{ fontFamily: MONO, fontSize: `${fontSize.small}px`, letterSpacing: '0.2em', color: accentReadable, textTransform: 'uppercase' }}>
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
                                        <div style={{ fontFamily: MONO, fontSize: MIN_FONT_PX, letterSpacing: '0.12em', color: textSecondary, textTransform: 'uppercase' }}>{m.label}</div>
                                        {/* Même garde de contraste que `DataCell` : la bande
                                            sémantique passe sous le seuil en mode papier (mesuré
                                            à 4,41:1 sur « Non disponible »). La règle existait
                                            déjà dans `DataCell` mais pas ici — deuxième site de
                                            rendu du même code couleur, une seule branche protégée.
                                            Ici le fond est celui de la PAGE, pas `surface`. */}
                                        <div style={{ fontFamily: DISPLAY, fontSize: `${fontSize.text + 1}px`, fontWeight: 600, marginTop: 2, color: statusTextOn(m.status, bg, titleColor) }}>
                                            {m.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {contentModules.rating && reviewData.rating != null && !isNaN(parseFloat(reviewData.rating)) && (
                            <div style={{ marginTop: stacked ? spacing.gap : 0, textAlign: stacked ? 'left' : 'right', ...(stacked ? {} : { position: 'absolute', right: padding.section, bottom: padding.section }) }}>
                                <div style={{ fontFamily: MONO, fontSize: MIN_FONT_PX, letterSpacing: '0.14em', color: textSecondary, textTransform: 'uppercase' }}>Note globale</div>
                                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: `${Math.round(fontSize.title * 0.85)}px`, lineHeight: 1, color: accentReadable }}>
                                    {parseFloat(reviewData.rating).toFixed(1)}<span style={{ fontSize: `${fontSize.text + 3}px`, color: textSecondary }}>/10</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* HAUTEUR IMPOSÉE PAR LA MISE EN PAGE, pas par la photo.
                            `minHeight` employait `image.maxHeight` — un PLAFOND utilisé comme
                            plancher — et l'image, posée en flux (`position: static`) avec sa
                            proportion naturelle, s'étirait donc bien au-delà. Mesuré sur une review
                            réelle en A4 : le masthead pesait 1964px sur une page de 2384, soit 82 %
                            de la page pour une seule photo, là où la règle de format en prévoit
                            20 % (496px). Une photo portrait mangeait la page, une photo paysage
                            non : la mise en page dépendait du fichier fourni. Signalé par
                            l'utilisateur (« mauvais placement entre mode fichier et image suivant
                            la taille de l'image »).
                            `height` ferme + `object-cover` : le cadre est constant, c'est la photo
                            qui se recadre — quel que soit son format. */}
                    {contentModules.mainImage !== false && mainImage && (
                        <div style={{ flex: stacked ? 'none' : '1 1 45%', position: 'relative', height: stacked ? responsive.image.maxHeight : 'auto', overflow: 'hidden', background: '#0a0f0c' }}>
                            <img src={mainImage} alt="" className="w-full h-full object-cover" style={{ position: 'absolute', inset: 0 }} />
                            {!stacked && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${colorWithOpacity(isPaperMode ? '#F8FAFC' : '#0b1220', 85)}, transparent 22%)` }} />}
                        </div>
                    )}
                </div>}

                {/* FLUX DES SECTIONS — en deux colonnes sur les formats larges (16:9, 4:3).
                    Empilées en une seule colonne, elles laissaient mécaniquement la moitié basse
                    de la page vide sur ces formats : un canevas 1920×1080 est large et bas, une
                    pile verticale n'en occupe que le tiers gauche. `columnCount` fait couler les
                    sections dans la largeur disponible ; `breakInside: avoid` (posé sur `Section`)
                    empêche qu'une section soit coupée entre deux colonnes. */}
                <div style={sectionFlow}>

                {/* ── 01 · ÉVALUATION SENSORIELLE ── */}
                {families.length > 0 && (
                    <Section icon="👁️" title="Évaluation sensorielle" moduleId="sensoryEvaluation">
                        {/* Synthèse en tête de section : jauge globale, point fort, point faible.
                            Les cinq barres disaient déjà les notes, mais il fallait les comparer de
                            tête pour savoir SUR QUOI le produit est bon ou faible — ce que le
                            tableau de bord donne d'un coup d'œil. Dans la section existante, donc
                            sans nouveau `data-module` : la mesure de pagination reprend simplement
                            la hauteur du bloc, sans vocabulaire supplémentaire à déclarer.
                            `showDial={false}` : le masthead affiche DÉJÀ la note globale en gros
                            chiffre, et la redire ici coûtait une page entière en A4 (2 pages à
                            80,5/80,7 % devenaient 3 à 80,5/44,3/45,7 %) pour zéro information
                            nouvelle. Ce que le bloc apporte vraiment — point fort, point faible —
                            tient en une ligne. */}
                        <ScoreBoard
                            categories={categoryRatings}
                            overall={reviewData.rating ?? reviewData.overallRating ?? reviewData.note}
                            colors={{ textPrimary, textSecondary }}
                            fontSize={fontSize.small}
                            spacing={spacing}
                            paper={isPaperMode}
                            compact={isSquare}
                            showDial={false}
                        />
                        <div className="grid" style={{ gridTemplateColumns: stacked ? '1fr' : `repeat(${families.length}, 1fr)`, gap: `${spacing.section}px` }}>
                            {families.map((f, i) => <FamilyBlock key={i} title={f.title} dot={f.dot} metrics={f.metrics} />)}
                        </div>
                    </Section>
                )}

                {/* ── EMPREINTE SENSORIELLE (radar) ──
                    Placée JUSTE APRÈS l'évaluation sensorielle, dont elle est la synthèse
                    graphique : plan de page validé le 2026-08-07. Elle vivait jusque-là après le
                    profil cannabinoïde, héritage du découpage du 2026-08-04 qui l'avait extraite de
                    ce bloc — un accident de refactor, pas une intention de lecture. Le paginateur
                    étant séquentiel, l'ordre du JSX EST l'ordre de lecture ; c'est aussi lui qui
                    décide quels blocs ont une chance de cohabiter sur une page. */}
                {radarAxes.length >= 3 && (
                    <Section title="Empreinte sensorielle" moduleId="sensoryRadar">
                        {/* Largeur BORNÉE à la taille nominale du radar : son SVG est en
                            `width="100%"` sur un viewBox carré, donc dans un conteneur pleine
                            largeur il s'étire à ~700px de côté. Mesuré avant garde-fou : 823px de
                            haut sur un canevas de 800px, soit 105% de débordement. Il était
                            jusqu'ici bridé par sa colonne de grille — en le sortant dans son
                            propre module, il fallait rétablir cette contrainte explicitement. */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: isSquare ? 200 : 240, maxWidth: '100%' }}>
                                <SensoryRadar axes={radarAxes} accentColor={accent} lineColor={line} textColor={textSecondary} size={isSquare ? 200 : 240} />
                            </div>
                        </div>
                    </Section>
                )}

                {/* ── PROFIL CANNABINOÏDE ──
                    Scindé du radar le 2026-08-04 (audit, règle E6) : réunis, la grille et le radar
                    mesuraient 1038px sur un canevas de 800px en 1:1 — un bloc insécable plus grand
                    qu'une page, qui débordait à 131% quoi qu'on fasse du budget de pagination.
                    Séparés, le packer les répartit normalement. Même principe que le découpage des
                    pipelines en tronçons. Ouvre le groupe « chimie » (cf. MODULE_GROUPS). */}
                {cannabinoidItems.length > 0 && (
                    <Section icon="🧪" title="Profil cannabinoïde" moduleId="cannabinoidGrid">
                        <div className="grid" style={{ gridTemplateColumns: '1fr', gap: `${spacing.section}px`, alignItems: 'start' }}>
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
                                            <span style={{ fontFamily: MONO, fontSize: `${fontSize.small + 1}px`, fontWeight: 700, color: scoreText.hi }}>Total</span>
                                            <span style={{ height: 9, borderRadius: 99, background: line, overflow: 'hidden', display: 'block' }}>
                                                <span style={{ display: 'block', height: '100%', width: '100%', borderRadius: 99, background: SEMANTIC_SCORE_COLORS.hi }} />
                                            </span>
                                            <span style={{ fontFamily: MONO, fontSize: `${fontSize.small + 1}px`, textAlign: 'right', fontWeight: 700, color: scoreText.hi }}>{total.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </Section>
                )}

                {/* ── PROFIL AROMATIQUE ── */}
                {(aromas.length > 0 || secondaryAromas.length > 0 || tastes.length > 0 || terpenes.length > 0) && contentModules.aromas && (
                    <Section icon="🌸" title="Profil aromatique · terpènes" moduleId="aromaticProfile">
                        <div className="grid" style={{ gridTemplateColumns: stacked ? '1fr' : 'repeat(2, 1fr)', gap: `${spacing.section}px` }}>
                            <ChipGroup title="Arômes dominants" items={aromas} variant="primary" />
                            <ChipGroup title="Arômes secondaires · goûts" items={secondaryAromas.length > 0 ? secondaryAromas : tastes} variant="default" />
                        </div>
                        {terpenes.length > 0 && <div style={{ marginTop: spacing.element }}><ChipGroup title="Terpènes" items={terpenes} variant="default" /></div>}
                    </Section>
                )}

                {/* ── 04 · DONNÉES LABORATOIRE & CURING ── */}
                {labCells.length > 0 && (
                    <Section icon="🔬" title="Données laboratoire & curing" moduleId="labData">
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
                        <CultureStatsChart steps={cultureSteps} pipelineType="culture" width={chartWidth} height={isSquare ? 180 : 220} textColor={textSecondary} lineColor={lineSoft} background={bg} />
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
                    groupIcons={GROUP_ICONS}
                />

                {/* Pipelines (production) — chaque pipeline porte son propre `data-module`
                    (`pipeline:<key>`) pour que la pagination adaptative puisse répartir Culture/
                    Curing/Extraction/Séparation/Purification sur des pages différentes selon leur
                    volume réel (au lieu du découpage fixe par ratio d'avant ce chantier). */}
                {(() => {
                    // DEUX formes d'identifiant, et il faut accepter les deux. `PipelineTimeline`
                    // (liste) découpe le pipeline en tronçons `pipeline:<key>#N` ; `PipelineMiniGrid`
                    // (grille, le rendu PAR DÉFAUT depuis le 2026-08-05) pose un bloc unique
                    // `pipeline:<key>`, sans `#`. Ce filtre n'acceptait que la forme à tronçons : le
                    // packer plaçait bien le pipeline sur une page (vu dans la sonde : coût 247 et
                    // 304px réservés), mais le rendu ne le reconnaissait plus et le supprimait —
                    // Culture ET Curing absents de TOUTES les pages, sur tous les ratios, dès que la
                    // pagination est active. Mesuré le 2026-08-06 : page à 46,9 % de remplissage,
                    // amputée de 471px de contenu dont personne ne signalait la disparition.
                    const pagePipelines = visiblePipelines.filter((p) => !pageModuleIds || [...pageModuleIds].some((id) => id === `pipeline:${p.key}` || id.startsWith(`pipeline:${p.key}#`)));
                    if (pagePipelines.length === 0) return null;
                    return pagePipelines.map((p, i) => renderPipeline(
                        p,
                        `pipeline:${p.key}`,
                        i === 0 ? <SectionHeading icon="⚙️" title="Processus de production" /> : null,
                    ));
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
                {/* Section SUPPRIMÉE de l'affichage par défaut : depuis le 2026-08-05, la grille
                    EST la représentation principale, rendue dans "Processus de production" par
                    `renderPipeline`. La garder ici la ferait apparaître deux fois — c'est la
                    redondance même que l'audit du 2026-08-02 avait relevée, dans l'autre sens. */}
                {false && (() => {
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
                    {/* Sceau du document : lot, date d'émission, empreinte. Sans la date et
                        l'empreinte, deux exports du même lot produits à trois mois d'écart — après
                        correction d'une valeur de labo — sont strictement indiscernables, et rien
                        ne dit lequel fait foi. Le libellé reste volontairement modeste : l'empreinte
                        permet de DÉTECTER une divergence, pas de prouver une antériorité (cf.
                        `useDocumentSeal`). */}
                    <div style={{ fontFamily: MONO, fontSize: `${fontSize.small}px`, color: textSecondary }}>
                        <b style={{ color: textPrimary }}>Identifiant interne — non réglementaire.</b>
                        {lotCode && <><br />Terpologie Export Maker · lot {lotCode} · émis le {issuedAt}</>}
                        {shortHash && <><br />empreinte {shortHash}</>}
                    </div>
                    <div style={{ marginLeft: 'auto', fontFamily: DISPLAY, fontSize: `${fontSize.text}px`, fontWeight: 600, color: textSecondary }}>
                        TERPO<span style={{ color: accentReadable }}>LOGIE</span>
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
                </div>
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
