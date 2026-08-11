import { useEffect, useMemo, useRef, useState } from 'react'
import { extractCategoryRatings, extractExtraData, extractPipelines, extractSubstrat, formatDate, TIMELINE_PIPELINES } from '../../utils/exportMakerHelpers'
import { getLotCode } from '../../utils/lotCode'
import { useDocumentSeal } from '../../hooks/useDocumentSeal'
import { LiquidCard, LiquidDivider, LiquidRating } from '../ui/LiquidUI'
import { Star, Calendar, User, Leaf, Factory, FlaskConical, Image as ImageIcon, MessageSquare, X, ChevronLeft, ChevronRight, Flower2, Droplets, Wind, GitBranch, Workflow, Radar as RadarIcon, LineChart } from 'lucide-react'
import PipelineMiniGrid from '../export/interactive/PipelineMiniGrid'
import { GisementSections, isModuleOn } from '../templates/sections/RegistrySections'
import { GROUP_ICONS } from '../../utils/fieldIcons'
import UserMention from '../shared/UserMention'
import TrustBadge from '../shared/TrustBadge'
import SensoryRadar from '../templates/sections/SensoryRadar'
import CultureStatsChart from '../templates/sections/CultureStatsChart'
import ReadOnlyGenealogyCanvas from '../export/interactive/ReadOnlyGenealogyCanvas'
import ReadOnlyProductionChainCanvas from '../export/interactive/ReadOnlyProductionChainCanvas'
import { DEFAULT_CONFIG } from '../../store/exportMakerStore'

// Groupes du registre rendus dans la Vue Détaillée. Liste identique à celle des templates
// d'export, 'overflow' compris — c'est lui qui fait remonter automatiquement tout champ de
// formulaire que le registre ne couvre pas encore.
const REGISTRY_GROUPS = [
    'analytics', 'lab', 'visual', 'smell', 'texture', 'taste', 'effects', 'usage',
    'genetics', 'culture', 'harvest', 'separation', 'extraction', 'purification', 'recipe', 'overflow',
];

/**
 * Tokens de rendu dérivés de la config Export Maker (C10-3 : « la configuration doit la piloter
 * comme elle pilote les templates »). Les 5 templates lisent déjà `config.colors`/`typography` ;
 * la Vue Détaillée les ignorait entièrement (accent cyan et tailles codés en dur), donc changer de
 * palette ou de police dans le Studio n'avait aucun effet sur le rendu écran.
 *
 * On ne dérive QUE les tokens qui ont un sens ici : l'accent, les couleurs de texte et la
 * typographie. Le fond et les surfaces restent ceux de LiquidUI — la Vue Détaillée est l'UI réelle
 * de l'app, pas un canevas à fond peint comme les templates de fichier.
 */
function useRenderTokens(config) {
    return useMemo(() => {
        const colors = { ...DEFAULT_CONFIG.colors, ...(config?.colors || {}) };
        const typography = { ...DEFAULT_CONFIG.typography, ...(config?.typography || {}) };
        const contentModules = { ...DEFAULT_CONFIG.contentModules, ...(config?.contentModules || {}) };
        // La Vue Détaillée porte sa propre hiérarchie typographique (classes Tailwind, en rem) :
        // `titleSize`/`textSize` ne peuvent pas la redimensionner globalement sans casser la mise
        // en page fluide. Ils pilotent en revanche `GisementSections`, la partie dense en données,
        // qui prend déjà ses tailles en pixels comme dans les templates de fichier.
        const base = Math.max(11, Math.min(22, typography.textSize || 16));
        return {
            colors,
            typography,
            contentModules,
            accent: colors.accent,
            textPrimary: colors.textPrimary,
            textSecondary: colors.textSecondary,
            titleColor: colors.title || colors.textPrimary,
            registryFontSize: { text: base - 2, small: base - 4, section: base },
            fontFamily: `'${typography.fontFamily}', Inter, system-ui, sans-serif`,
        };
    }, [config]);
}

/**
 * En-tête de groupe au style de la page, attendu par `GisementSections`.
 *
 * La couleur vient de la variable CSS `--vd-accent` posée par le conteneur racine, PAS d'une prop :
 * `GisementSections` reçoit ce composant en prop `Section`, donc le définir dans le corps de
 * `ReviewFullDisplay` (pour lui passer l'accent en portée) en changerait l'identité à chaque rendu
 * et remonterait tout le sous-arbre — infobulles et observateurs de taille compris.
 */
function RegistrySection({ title, icon, children }) {
    return (
        <div className="mb-6 last:mb-0">
            <h3
                className="text-lg font-bold mb-3 border-b border-white/10 pb-2 flex items-center gap-2"
                style={{ color: 'var(--vd-accent)' }}
            >
                <span>{icon}</span>{title}
            </h3>
            {children}
        </div>
    );
}

/** Section de la Vue Détaillée : carte LiquidUI, titre à l'accent de la palette configurée. */
function ViewSection({ icon: Icon, title, glow = 'purple', children }) {
    return (
        <LiquidCard glow={glow} padding="lg">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5" style={{ color: 'var(--vd-accent)' }} />
                {title}
            </h2>
            {children}
        </LiquidCard>
    );
}

/**
 * Carte qui disparaît tant que son contenu ne rend rien.
 *
 * Les deux canevas de traçabilité chargent leur graphe en asynchrone et se masquent eux-mêmes
 * (`return null`) quand la review n'a ni arbre ni chaîne — et ils portent déjà leur propre titre.
 * Les envelopper dans une section titrée classique produirait donc un double titre, et une carte
 * vide sur toute review sans traçabilité. On observe le conteneur plutôt que de dupliquer ici la
 * logique « y a-t-il une chaîne ? », qui vit dans le canevas et n'est connue qu'après son fetch.
 */
function AutoHideCard({ glow, children }) {
    const ref = useRef(null);
    const [hasContent, setHasContent] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const check = () => setHasContent(el.childElementCount > 0);
        check();
        const mo = new MutationObserver(check);
        mo.observe(el, { childList: true });
        return () => mo.disconnect();
    }, []);
    return (
        <LiquidCard glow={glow} padding="lg" className={hasContent ? '' : 'hidden'}>
            <div ref={ref}>{children}</div>
        </LiquidCard>
    );
}

/** Largeur réellement disponible — les graphiques Recharts exigent une largeur en pixels. */
function useMeasuredWidth() {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    return { ref, width };
}

export default function ReviewFullDisplay({ review, config }) {
    // Empreinte du document, calculée sur la MÊME projection que l'export.
    //
    // Le fichier exporté imprime une empreinte, mais rien nulle part ne permettait de la comparer :
    // une empreinte invérifiable n'est qu'une décoration. Le QR du document pointe vers cette page —
    // c'est donc ici, et nulle part ailleurs, qu'elle doit pouvoir se recalculer.
    //
    // La projection canonique est imposée par le hook (`id` + `updatedAt`) : les deux surfaces
    // partent d'objets différents — API brute ici, objet enrichi côté export — et hacher l'objet
    // reçu tel quel produisait deux empreintes systématiquement différentes, mesuré par
    // `tools/export-audit/seal-check.mjs`.
    const { shortHash: docHash } = useDocumentSeal(review)
    const [lightboxImg, setLightboxImg] = useState(null)
    const [lightboxIdx, setLightboxIdx] = useState(0)
    const tokens = useRenderTokens(config)
    const chart = useMeasuredWidth()
    if (!review) return null

    const { accent, textSecondary, titleColor, contentModules, fontFamily } = tokens
    const isOn = (key) => isModuleOn(contentModules, key)

    // Parse des données JSON avec protection contre les erreurs
    let categoryRatings = []
    let extraData = []
    let pipelines = []
    let substrat = null

    try {
        categoryRatings = extractCategoryRatings(review.categoryRatings, review) || []
    } catch (e) {
        console.error('Error extracting category ratings:', e)
    }

    try {
        extraData = extractExtraData(review.extraData, review) || []
    } catch (e) {
        console.error('Error extracting extra data:', e)
    }

    try {
        pipelines = extractPipelines(review) || []
    } catch (e) {
        console.error('Error extracting pipelines:', e)
    }

    try {
        substrat = extractSubstrat(review.substratMix)
    } catch (e) {
        console.error('Error extracting substrat:', e)
    }

    // Parse cultivars list
    let cultivarsList = []
    try {
        if (typeof review.cultivarsList === 'string') {
            cultivarsList = JSON.parse(review.cultivarsList)
        } else if (Array.isArray(review.cultivarsList)) {
            cultivarsList = review.cultivarsList
        }
    } catch (e) {
        // Ignore
    }

    const displayScore = review.computedOverall || review.overallRating || review.note || 0

    // Parse arrays from review (may be JSON strings)
    const parseArray = (val) => {
        if (!val) return []
        if (Array.isArray(val)) return val
        if (typeof val === 'string') {
            try { return JSON.parse(val) } catch { return val.split(',').map(s => s.trim()).filter(Boolean) }
        }
        return []
    }
    const extractLabel = (item) => {
        if (typeof item === 'string') return item
        return item?.label || item?.name || item?.value || String(item)
    }

    const aromas = parseArray(review.aromas)
    const secondaryAromas = parseArray(review.secondaryAromas)
    const tastes = parseArray(review.tastes)
    const dryPuffNotes = parseArray(review.dryPuffNotes)
    const inhalationNotes = parseArray(review.inhalationNotes)
    const exhalationNotes = parseArray(review.exhalationNotes)
    const effects = parseArray(review.effects)
    const terpenes = parseArray(review.terpenes)
    const images = parseArray(review.images)

    // Axes du radar : mêmes 6 axes que la Fiche Technique Détaillée (`DetailedCardTemplate.jsx`),
    // dont le 6e « Arôme » dérivé d'une sous-métrique réelle de la catégorie odeur — repris tel
    // quel plutôt que recalculé autrement, pour que les deux surfaces disent la même chose.
    const categoryByKey = Object.fromEntries(categoryRatings.map((c) => [c.key, c]))
    const aromeSubDetail = categoryByKey.smell?.subDetails?.find(
        (s) => s.key === 'complexiteAromas' || s.key === 'intensiteAromatique' || s.key === 'aromasIntensity'
    )
    const radarAxes = [
        categoryByKey.visual && { label: 'Visuel', value: categoryByKey.visual.value },
        categoryByKey.smell && { label: 'Odeur', value: categoryByKey.smell.value },
        categoryByKey.texture && { label: 'Texture', value: categoryByKey.texture.value },
        categoryByKey.taste && { label: 'Goût', value: categoryByKey.taste.value },
        categoryByKey.effects && { label: 'Effets', value: categoryByKey.effects.value },
        (aromeSubDetail || categoryByKey.smell) && { label: 'Arôme', value: aromeSubDetail?.value ?? categoryByKey.smell?.value },
    ].filter(Boolean)

    const cultureSteps = Array.isArray(review.cultureTimelineData) ? review.cultureTimelineData : null

    return (
        <div
            className="space-y-6"
            style={{ '--vd-accent': accent, fontFamily }}
        >
            {/* Header Section */}
            <LiquidCard glow="purple" padding="lg">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Image principale */}
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                        {review.mainImageUrl ? (
                            <img
                                src={review.mainImageUrl}
                                alt={review.holderName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                                <span className="text-8xl">🌿</span>
                            </div>
                        )}
                    </div>

                    {/* Infos principales */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-white/50 uppercase tracking-wider">{review.type}</span>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">{review.holderName}</h1>
                        </div>

                        {/* Note globale */}
                        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl sm:text-6xl font-black" style={{ color: accent }}>
                                    {displayScore}
                                </div>
                                <div>
                                    <div className="text-lg text-white/60">sur 10</div>
                                    <div className="flex gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${i < Math.round(displayScore / 2) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Infos produit */}
                        <div className="space-y-3 text-sm">
                            {review.cultivars && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                    <Leaf className="w-4 h-4 text-green-400" />
                                    <span className="text-white/50">Cultivar:</span>
                                    <span className="text-white font-medium">{review.cultivars}</span>
                                </div>
                            )}
                            {/* Breeder (Flower) / Hashmaker (Hash+Concentrate) — la vraie valeur vit sur la
                                sous-table du type (review.breeder/hashmaker de base ne sont jamais écrits par
                                aucune route, colonnes historiques mortes). */}
                            {(review.flowerData?.breeder || review.hashData?.hashmaker || review.concentrateData?.hashmaker) && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                    <User className="w-4 h-4 text-cyan-400" />
                                    <span className="text-white/50">{review.flowerData?.breeder ? 'Breeder' : 'Hashmaker'}:</span>
                                    <UserMention
                                        userId={review.hashData?.hashmakerLinkedUserId || review.concentrateData?.hashmakerLinkedUserId}
                                        className="text-white font-medium"
                                    >
                                        {review.flowerData?.breeder || review.hashData?.hashmaker || review.concentrateData?.hashmaker}
                                    </UserMention>
                                </div>
                            )}
                            {review.farm && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                    <Factory className="w-4 h-4 text-amber-400" />
                                    <span className="text-white/50">Farm:</span>
                                    <UserMention userId={review.flowerData?.farmLinkedUserId} className="text-white font-medium">
                                        {review.farm}
                                    </UserMention>
                                </div>
                            )}
                            {review.edibleData?.fabricant && (
                                <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                    <Factory className="w-4 h-4 text-amber-400" />
                                    <span className="text-white/50">Fabricant:</span>
                                    <UserMention userId={review.edibleData?.fabricantLinkedUserId} className="text-white font-medium">
                                        {review.edibleData.fabricant}
                                    </UserMention>
                                </div>
                            )}
                            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2">
                                <Calendar className="w-4 h-4 text-purple-400" />
                                <span className="text-white/50">Date:</span>
                                <span className="text-white">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white/5 rounded-lg px-3 py-2 flex-wrap">
                                <User className="w-4 h-4 text-pink-400" />
                                <span className="text-white/50">Auteur:</span>
                                <UserMention userId={typeof review.author === 'object' ? review.author?.id : null} className="text-white">
                                    {(typeof review.author === 'object' ? review.author?.username : review.author) || review.ownerName || 'Anonyme'}
                                </UserMention>
                                {typeof review.author === 'object' && (
                                    <TrustBadge
                                        producerProfile={review.author?.producerProfile}
                                        influencerProfile={review.author?.influencerProfile}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                {review.description && isOn('description') && (
                    <>
                        <LiquidDivider className="my-6" />
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <MessageSquare className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-bold text-white">Commentaire</h3>
                            </div>
                            <p className="text-white/60 leading-relaxed">{review.description}</p>
                        </div>
                    </>
                )}
            </LiquidCard>

            {/* Category Ratings */}
            {categoryRatings.length > 0 && isOn('categoryRatings') && (
                <ViewSection icon={Star} title="Notes par Catégorie" glow="amber">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryRatings.map(cat => (
                            <div key={cat.key} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <span className="font-semibold text-white">{cat.label}</span>
                                    </div>
                                    <span className="text-2xl font-bold" style={{ color: accent }}>{cat.value}/10</span>
                                </div>
                                {/* Barre de lecture, pas un contrôle. `value/10, max=1` affichait
                                    « 0.78/1 » — une valeur normalisée qui ne veut rien dire pour un
                                    lecteur — juste sous le « 7.8/10 » déjà présent, et la pastille
                                    du rail répétait le même score une TROISIÈME fois en pourcentage
                                    (« 78 ») sur ce qui ressemblait à une poignée de curseur.
                                    Unités réelles, en-tête et pastille supprimés : la note est déjà
                                    écrite au-dessus, la barre ne fait que la donner à voir. */}
                                <LiquidRating value={cat.value} max={10} color="amber" showValue={false} knob={false} />
                                {cat.subDetails && cat.subDetails.length > 0 && (
                                    <div className="space-y-1 text-xs mt-3">
                                        {cat.subDetails.map(sub => (
                                            <div key={sub.key} className="flex justify-between text-white/50">
                                                <span>{sub.label}:</span>
                                                <span className="font-medium text-white/70">{sub.value}/10</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </ViewSection>
            )}

            {/* Empreinte sensorielle — mêmes axes que la Fiche Technique Détaillée. */}
            {radarAxes.length >= 3 && isOn('categoryRatings') && (
                <ViewSection icon={RadarIcon} title="Empreinte Sensorielle" glow="amber">
                    <div className="flex justify-center">
                        <SensoryRadar
                            axes={radarAxes}
                            accentColor={accent}
                            lineColor="rgba(255,255,255,0.12)"
                            textColor={textSecondary}
                            size={280}
                        />
                    </div>
                </ViewSection>
            )}

            {/* DONNÉES TECHNIQUES — pilotées par le REGISTRE (`fieldRegistry.js`), plus par une
                taxonomie écrite à la main.

                Cette section listait des catégories codées en dur (`quality`, `smoke`, `sensory`,
                `process`) qui ne correspondent à AUCUN groupe réel du registre. Résultat : tout ce
                qui est analytique, laboratoire, odeurs, goûts, récolte, usage, séparation ou
                extraction n'avait nulle part où s'afficher et disparaissait de la vue — c'est le
                « il manque beaucoup de données des forms » signalé par l'utilisateur.

                `GisementSections` est le composant déjà utilisé par les 5 templates d'export : il
                dérive ses groupes du registre et rattrape par `getOverflowFields()` tout champ
                nouveau. Un champ ajouté à un formulaire apparaîtra donc ici sans qu'on y touche. */}
            <ViewSection icon={FlaskConical} title="Données Techniques" glow="cyan">
                {/* `contentModules` VIENT de la config Export Maker (C10-3), il était figé à `{}` :
                    désactiver un champ dans l'onglet Contenu du Studio n'avait donc aucun effet
                    sur le rendu écran, alors que le même réglage pilote déjà les 5 templates. */}
                <GisementSections
                    reviewData={review}
                    contentModules={contentModules}
                    groups={REGISTRY_GROUPS}
                    groupIcons={GROUP_ICONS}
                    Section={RegistrySection}
                    colors={{ accent, textPrimary: tokens.textPrimary, textSecondary, title: titleColor }}
                    fontSize={tokens.registryFontSize}
                    spacing={{ section: 20, element: 10, gap: 6 }}
                />
            </ViewSection>

            {/* Pipelines - Interactive */}
            {pipelines.length > 0 && isOn('pipelineInteractiveView') && (
                <ViewSection icon={FlaskConical} title="Pipelines & Processus" glow="green">
                    <div className="space-y-6">
                        {/* LA grille des formulaires (`PipelineGridView` via `PipelineMiniGrid`),
                            et non plus un troisième rendu de pipeline propre à cette page.
                            Demande de l'utilisateur : « pour les pipelines il faut utiliser ce style
                            de rendu (déjà utilisé dans les forms) ». C'est aussi ce que le C13 §1.2
                            réclamait — `InteractivePipelineViewer` était la troisième
                            implémentation de la même idée, avec sa propre typographie sous le
                            plancher de lisibilité et ses propres contrastes. Une seule grille
                            désormais : saisie, écran et fichier montrent la même chose. */}
                        {TIMELINE_PIPELINES
                            .filter((t) => review[t.dataKey] && review[t.configKey])
                            .map((t) => (
                                <PipelineMiniGrid
                                    key={t.type}
                                    type={t.type}
                                    name={t.name}
                                    icon={t.icon}
                                    timelineData={review[t.dataKey]}
                                    timelineConfig={review[t.configKey]}
                                    accentColor={tokens.accent}
                                />
                            ))}
                    </div>
                </ViewSection>
            )}

            {/* Statistiques de culture — se masque lui-même s'il n'y a pas ≥2 points numériques.
                Recharts exige une largeur en pixels : `chart.ref` la mesure, il n'y a pas de
                dimension de canevas connue d'avance comme dans les templates de fichier. */}
            {cultureSteps && isOn('pipelineInteractiveView') && (
                <ViewSection icon={LineChart} title="Statistiques de Culture" glow="green">
                    <div ref={chart.ref} className="w-full">
                        {chart.width > 0 && (
                            <CultureStatsChart
                                steps={cultureSteps}
                                pipelineType="culture"
                                width={chart.width}
                                height={240}
                                textColor={textSecondary}
                                lineColor="rgba(255,255,255,0.12)"
                                background="transparent"
                            />
                        )}
                    </div>
                </ViewSection>
            )}

            {/* TRAÇABILITÉ — les deux canevas réels, en lecture seule.

                Ils étaient rendus par la Fiche Technique Détaillée mais ABSENTS de la Vue
                Détaillée : en basculant `/r/:id` sur cette vue (C10-3), la généalogie et la chaîne
                de production — le cœur du produit — disparaissaient de la page publique. Mêmes
                composants que les templates, pas une seconde implémentation. */}
            {isOn('phenoHuntView') && (
                <AutoHideCard glow="purple">
                    <ReadOnlyGenealogyCanvas
                        reviewData={review}
                        height={420}
                        accentColor={accent}
                        titleColor={titleColor}
                        textColor={textSecondary}
                    />
                </AutoHideCard>
            )}

            {isOn('productionChainView') && (
                <AutoHideCard glow="cyan">
                    <ReadOnlyProductionChainCanvas
                        reviewData={review}
                        height={420}
                        accentColor={accent}
                        titleColor={titleColor}
                        textColor={textSecondary}
                    />
                </AutoHideCard>
            )}

            {/* Cultivars List */}
            {cultivarsList.length > 0 && isOn('cultivarsList') && (
                <ViewSection icon={Leaf} title="Cultivars Utilisés" glow="green">
                    <div className="space-y-3">
                        {cultivarsList.map((cult, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-bold text-white text-lg">
                                            {cult.cultivar || cult.name || `Cultivar ${idx + 1}`}
                                        </div>
                                        {cult.breeder && (
                                            <div className="text-sm text-white/50 mt-1">
                                                <span className="font-medium text-white/70">Breeder:</span> {cult.breeder}
                                            </div>
                                        )}
                                        {cult.matiere && (
                                            <div className="text-sm text-white/50 mt-1">
                                                <span className="font-medium text-white/70">Matière:</span> {cult.matiere}
                                            </div>
                                        )}
                                    </div>
                                    {cult.percentage && (
                                        <div className="text-2xl font-bold" style={{ color: accent }}>{cult.percentage}%</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ViewSection>
            )}

            {/* Profil Sensoriel - Arômes, Goûts, Effets, Terpènes. Chaque bloc suit sa propre clé
                `contentModules` (`aromas`/`tastes`/`effects`/`terpenes`), les mêmes que les
                templates de fichier — la carte disparaît si les quatre sont désactivées. */}
            {((aromas.length > 0 || secondaryAromas.length > 0) && isOn('aromas')
                || (tastes.length > 0 || dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0) && isOn('tastes')
                || effects.length > 0 && isOn('effects')
                || terpenes.length > 0 && isOn('terpenes')) && (
                <ViewSection icon={Flower2} title="Profil Sensoriel" glow="pink">
                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Arômes */}
                        {aromas.length > 0 && isOn('aromas') && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    🌸 Arômes dominants
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {aromas.map((a, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-pink-500/15 text-pink-300 text-sm font-medium border border-pink-500/25">
                                            {extractLabel(a)}
                                        </span>
                                    ))}
                                </div>
                                {secondaryAromas.length > 0 && (
                                    <div className="mt-3">
                                        <span className="text-xs text-white/40 block mb-2">Arômes secondaires</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {secondaryAromas.map((a, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">
                                                    {extractLabel(a)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Goûts */}
                        {(dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0 || tastes.length > 0) && isOn('tastes') && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    👅 Goûts
                                </h3>
                                {dryPuffNotes.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-xs text-white/40 block mb-1.5">💨 Tirage à sec</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {dryPuffNotes.map((t, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/25">
                                                    {extractLabel(t)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {inhalationNotes.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-xs text-white/40 block mb-1.5">🌬️ Inhalation</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {inhalationNotes.map((t, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/25">
                                                    {extractLabel(t)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {exhalationNotes.length > 0 && (
                                    <div className="mb-3">
                                        <span className="text-xs text-white/40 block mb-1.5">↩️ Arrière-goût</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {exhalationNotes.map((t, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-full bg-white/5 text-white/50 text-xs border border-white/10">
                                                    {extractLabel(t)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {tastes.length > 0 && dryPuffNotes.length === 0 && inhalationNotes.length === 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {tastes.map((t, i) => (
                                            <span key={i} className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium border border-amber-500/25">
                                                {extractLabel(t)}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Effets */}
                        {effects.length > 0 && isOn('effects') && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    ⚡ Effets ressentis
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {effects.map((e, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-300 text-sm font-medium border border-violet-500/25">
                                            {extractLabel(e)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Terpènes */}
                        {terpenes.length > 0 && isOn('terpenes') && (
                            <div>
                                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    🧪 Terpènes
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {terpenes.map((t, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-full bg-cyan-500/15 text-cyan-300 text-sm font-medium border border-cyan-500/25">
                                            {extractLabel(t)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </ViewSection>
            )}

            {/* Substrat */}
            {substrat && substrat.length > 0 && isOn('substratMix') && (
                <ViewSection icon={Leaf} title="Substrat" glow="amber">
                    <div className="flex flex-wrap gap-3">
                        {substrat.map((sub, idx) => (
                            <div key={idx} className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                                <div className="font-semibold text-white">{sub.name}</div>
                                {sub.percentage && (
                                    <div className="text-sm font-bold" style={{ color: accent }}>{sub.percentage}%</div>
                                )}
                            </div>
                        ))}
                    </div>
                </ViewSection>
            )}

            {/* Galerie d'images - interactive with lightbox */}
            {images.length > 1 && isOn('images') && (
                <ViewSection icon={ImageIcon} title="Galerie" glow="purple">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setLightboxImg(img); setLightboxIdx(idx); }}
                                className="aspect-square rounded-xl overflow-hidden border border-white/10 group relative cursor-pointer"
                            >
                                <img
                                    src={img}
                                    alt={`${review.holderName} - Image ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                                        Agrandir
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ViewSection>
            )}

            {/* Lightbox */}
            {/* Sceau vérifiable — la contrepartie à l'écran de l'empreinte imprimée. */}
            {docHash && review?.id && (
                <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-1 font-mono text-xs text-white/50">
                    <span>lot {getLotCode(review.id)}</span>
                    <span>empreinte actuelle {docHash}</span>
                    <span className="text-white/60 font-sans">
                        Comparez-la à celle imprimée sur votre document : si elles diffèrent, la fiche a changé depuis son édition.
                    </span>
                </div>
            )}

            {lightboxImg && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setLightboxImg(null)}
                >
                    <button
                        onClick={() => setLightboxImg(null)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); const prev = (lightboxIdx - 1 + images.length) % images.length; setLightboxIdx(prev); setLightboxImg(images[prev]); }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); const next = (lightboxIdx + 1) % images.length; setLightboxIdx(next); setLightboxImg(images[next]); }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                    <img
                        src={lightboxImg}
                        alt="Agrandir"
                        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-4 text-white/50 text-sm">
                        {lightboxIdx + 1} / {images.length}
                    </div>
                </div>
            )}
        </div>
    )
}


