/**
 * OverviewTab.jsx - Vue d'ensemble de la Bibliothèque
 *
 * Page d'accueil de la Bibliothèque : agrège les indicateurs clés (reviews,
 * répartition par type, cultivars, chaînes de production) et propose un accès
 * rapide vers chaque section, sans dupliquer la logique métier de chaque onglet.
 *
 * Navigation : chaque conteneur affichant un chiffre est un raccourci cliquable vers
 * l'endroit qui détaille ce chiffre (une stat "Publiques" ouvre les reviews déjà
 * filtrées sur les publiques, une pastille de type ouvre ce type, etc.) — les filtres
 * sont transportés par `onNavigate(tab, { filters })` (cf. LibraryPage.goToTab).
 * Chaque raccourci porte une info-bulle qui dit à la fois ce que le chiffre mesure et
 * où le clic mène ; la modale "Guide" reprend la même information pour le tactile,
 * où le survol n'existe pas.
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LiquidCard, LiquidModal, LiquidTooltip } from '@/components/ui/LiquidUI'
import { motion } from 'framer-motion'
import { parseImages } from '../../../utils/imageUtils'
import { canonicalReviewType, reviewEditPath } from '../../../utils/reviewTypeMeta'
import useProductionChainStore from '../../../store/useProductionChainStore'
import useGeneticsStore from '../../../store/useGeneticsStore'
import {
    FileText, TrendingUp, Eye, EyeOff, Dna, GitBranch, Database,
    Palette, BarChart3, Flower2, Hash, FlaskConical, Cookie,
    ArrowRight, Clock, HelpCircle, ExternalLink, Edit, Compass, Lock
} from 'lucide-react'

// Mêmes IDs bruts que review.type (cf. ReviewsTab.jsx) : pas de casse uniforme entre types
const TYPE_META = {
    Fleurs: { label: 'Fleurs', icon: Flower2, color: 'text-green-400', bg: 'bg-green-500/15' },
    hash: { label: 'Hash', icon: Hash, color: 'text-amber-400', bg: 'bg-amber-500/15' },
    concentrate: { label: 'Concentrés', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-500/15' },
    edible: { label: 'Comestibles', icon: Cookie, color: 'text-pink-400', bg: 'bg-pink-500/15' },
}

// Pas de table de slugs de route locale ici : la route d'édition est produite par
// reviewEditPath() (reviewTypeMeta.js), source unique partagée avec ReviewsTab.jsx.

// Classes littérales (pas d'interpolation) : Tailwind ne génère que les classes
// détectées telles quelles dans le code source, une classe construite dynamiquement
// (ex: `bg-${color}-500`) ne serait pas produite par le build.
const COLOR_CLASSES = {
    purple: { bg: 'bg-purple-500/15', text: 'text-purple-400' },
    green: { bg: 'bg-green-500/15', text: 'text-green-400' },
    blue: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
    gray: { bg: 'bg-gray-500/15', text: 'text-gray-400' },
    emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    pink: { bg: 'bg-pink-500/15', text: 'text-pink-400' },
}

/**
 * Carte d'indicateur. Devient un vrai raccourci dès qu'`onClick` est fourni :
 * `tooltip` doit alors dire ce que mesure le chiffre ET où mène le clic.
 */
const StatCard = ({ icon: Icon, label, value, color = 'purple', onClick, tooltip, tooltipPosition = 'bottom' }) => {
    const c = COLOR_CLASSES[color] || COLOR_CLASSES.purple
    const clickable = typeof onClick === 'function'

    const card = (
        <LiquidCard
            glow="none"
            padding="md"
            className={`w-full h-full transition-all ${clickable
                ? 'hover:border-purple-500/40 hover:bg-white/[0.04] cursor-pointer group'
                : 'hover:border-white/20'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="min-w-0 text-left">
                    <p className="text-2xl font-bold text-white leading-tight">{value}</p>
                    <p className="text-xs text-white/50 truncate">{label}</p>
                </div>
                {/* Masquée sous `sm` : sur un écran étroit, la flèche rognait la largeur
                    disponible et tronquait les libellés ("Reviews au total" → "Review..."). */}
                {clickable && (
                    <ArrowRight className="hidden sm:block w-4 h-4 text-white/15 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-auto" />
                )}
            </div>
        </LiquidCard>
    )

    const body = clickable
        ? <button type="button" onClick={onClick} className="w-full h-full text-left">{card}</button>
        : card

    if (!tooltip) return body

    return (
        <LiquidTooltip content={tooltip} position={tooltipPosition} multiline wrapperClassName="w-full">
            {body}
        </LiquidTooltip>
    )
}

const QuickAccessCard = ({ icon: Icon, label, description, color, locked, onClick, index, tooltip }) => {
    const c = COLOR_CLASSES[color] || COLOR_CLASSES.purple
    const button = (
    <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        onClick={onClick}
        className="text-left w-full h-full"
    >
        <LiquidCard glow="none" padding="md" className="h-full hover:border-white/20 transition-all group cursor-pointer">
            <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">{label}</h3>
                        {locked && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded shrink-0">
                                PRO
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </div>
        </LiquidCard>
    </motion.button>
    )

    if (!tooltip) return button

    return (
        <LiquidTooltip content={tooltip} position="top" multiline wrapperClassName="w-full">
            {button}
        </LiquidTooltip>
    )
}

/**
 * Contenu de la modale "Guide" : une entrée par destination réelle de la Bibliothèque.
 * `pro` marque les sections réservées aux comptes producteur — elles restent listées pour
 * un compte non-pro (avec un cadenas et sans navigation), pour que l'existence de la
 * fonctionnalité soit découvrable plutôt que simplement absente.
 * Les `id` doivent correspondre aux ids d'onglets de LibraryPage.TABS.
 */
const SECTION_GUIDE = [
    {
        id: 'reviews',
        icon: FileText,
        color: 'purple',
        label: 'Mes Reviews',
        text: "Toutes vos fiches, filtrables par type de produit, par visibilité et par recherche. C'est ici que vous modifiez, publiez, dupliquez ou supprimez une review.",
    },
    {
        id: 'templates',
        icon: Palette,
        color: 'pink',
        label: 'Templates Export',
        text: "Les gabarits d'export et les filigranes appliqués à vos fiches techniques. Le rendu final d'une review (Export Maker) s'appuie sur ces réglages.",
    },
    {
        id: 'stats',
        icon: BarChart3,
        color: 'blue',
        label: 'Statistiques',
        text: "L'activité détaillée de votre bibliothèque : évolution dans le temps, exports générés, vues et interactions sur vos reviews publiques.",
    },
    {
        id: 'cultivars',
        icon: Dna,
        color: 'emerald',
        label: 'Arbres Généalogiques',
        pro: true,
        text: "PhenoHunt : construisez vos lignées (croisements, phénotypes sélectionnés) sur un canevas, et rattachez-les à vos reviews pour afficher la génétique sur la fiche exportée.",
    },
    {
        id: 'production-chain',
        icon: GitBranch,
        color: 'emerald',
        label: 'Chaîne de production',
        pro: true,
        text: "Reliez vos fiches entre elles (Fleur → Hash → Concentré → Comestible) et documentez chaque transformation, avec bilan matière. C'est le cœur de la traçabilité.",
    },
    {
        id: 'data',
        icon: Database,
        color: 'emerald',
        label: 'Données Récurrentes',
        pro: true,
        text: "Vos substrats, engrais, techniques et équipements enregistrés une fois, puis réutilisables dans tous les pipelines sans les ressaisir.",
    },
]

// Source unique des explications : les info-bulles de l'accès rapide réutilisent le texte
// du guide plutôt que d'en maintenir une seconde version qui divergerait.
const guideText = (id) => SECTION_GUIDE.find(s => s.id === id)?.text

/** Modale "Guide" : explique chaque section et permet d'y aller directement d'un clic. */
const GuideModal = ({ open, onClose, isProducer, onGo }) => (
    <LiquidModal
        isOpen={open}
        onClose={onClose}
        size="xl"
        title={
            <span className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-400" />
                Guide de la Bibliothèque
            </span>
        }
    >
        <p className="text-sm text-white/50 mb-4">
            Votre bibliothèque regroupe tout ce qui gravite autour de vos reviews. Cliquez une
            section pour vous y rendre directement.
        </p>
        <div className="space-y-2">
            {SECTION_GUIDE.map((section) => {
                const Icon = section.icon
                const c = COLOR_CLASSES[section.color] || COLOR_CLASSES.purple
                const available = !section.pro || isProducer
                return (
                    <button
                        key={section.id}
                        type="button"
                        disabled={!available}
                        onClick={() => { onGo(section.id); onClose() }}
                        className={`w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all ${available
                            ? 'bg-white/[0.03] border-white/10 hover:border-purple-500/40 hover:bg-white/[0.06] cursor-pointer'
                            : 'bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed'}`}
                    >
                        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                            <Icon className={`w-4 h-4 ${c.text}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-sm">{section.label}</span>
                                {section.pro && (
                                    <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded shrink-0">
                                        PRO
                                    </span>
                                )}
                                {!available && <Lock className="w-3 h-3 text-white/30 shrink-0" />}
                            </div>
                            <p className="text-xs text-white/50 mt-1 leading-relaxed">{section.text}</p>
                        </div>
                        {available && <ArrowRight className="w-4 h-4 text-white/20 shrink-0 mt-1" />}
                    </button>
                )
            })}
        </div>
        {!isProducer && (
            <p className="text-xs text-white/40 mt-4 flex items-center gap-1.5">
                <Lock className="w-3 h-3 shrink-0" />
                Les sections marquées PRO nécessitent un compte producteur vérifié.
            </p>
        )}
    </LiquidModal>
)

export default function OverviewTab({ isProducer, username, onNavigate }) {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recentReviews, setRecentReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [guideOpen, setGuideOpen] = useState(false)
    const { chains, fetchChains } = useProductionChainStore()
    const { trees, fetchTrees } = useGeneticsStore()

    // Raccourci vers les reviews avec des filtres pré-appliqués (cf. LibraryPage.goToTab)
    const goToReviews = useCallback((filters) => {
        onNavigate('reviews', filters ? { filters } : undefined)
    }, [onNavigate])

    const fetchOverview = useCallback(async () => {
        try {
            setLoading(true)
            const [statsRes, reviewsRes] = await Promise.all([
                fetch('/api/library/stats?range=all', { credentials: 'include' }),
                fetch('/api/reviews/my', { credentials: 'include' }),
            ])
            if (statsRes.ok) setStats(await statsRes.json())
            if (reviewsRes.ok) {
                const reviews = await reviewsRes.json()
                setRecentReviews(
                    [...reviews]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .slice(0, 5)
                )
            }
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOverview()
    }, [fetchOverview])

    useEffect(() => {
        if (isProducer) {
            fetchChains()
            fetchTrees()
        }
    }, [isProducer, fetchChains, fetchTrees])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    const total = stats?.reviews?.total ?? 0
    const thisMonth = stats?.reviews?.thisMonth ?? 0
    const publicCount = stats?.reviews?.public ?? 0
    const privateCount = stats?.reviews?.private ?? 0

    // `byType` arrive avec les valeurs BRUTES de review.type, qui ne sont pas normalisées en
    // base : un même produit y apparaît sous plusieurs graphies ('hash' ET 'Hash', 'concentrate'
    // ET 'Concentré', 'edible' ET 'Comestible'). Sans ce repli, les lignes en graphie française
    // étaient simplement absentes du décompte affiché — et, depuis que la pastille est un
    // raccourci, le listing atteint ne correspondrait pas au chiffre annoncé.
    const byType = Object.entries(stats?.reviews?.byType ?? {}).reduce((acc, [rawType, count]) => {
        const key = canonicalReviewType(rawType)
        acc[key] = (acc[key] || 0) + count
        return acc
    }, {})

    return (
        <div className="space-y-8">
            {/* Salutation + accès au guide */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-xl font-bold text-white">Bonjour {username} 👋</h2>
                    <p className="text-sm text-white/50 mt-1">
                        Voici un aperçu de votre bibliothèque — chaque carte est un raccourci
                    </p>
                </div>
                <LiquidTooltip content="Ouvrir le guide : à quoi sert chaque section, et s'y rendre d'un clic" position="left" multiline>
                    <button
                        type="button"
                        onClick={() => setGuideOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-white/70 hover:text-white transition-all text-sm shrink-0"
                    >
                        <HelpCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Guide</span>
                    </button>
                </LiquidTooltip>
            </div>

            {/* Stats principales — chacune ouvre la liste de reviews correspondante */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={FileText}
                    label="Reviews au total"
                    value={total}
                    color="purple"
                    onClick={() => goToReviews({ type: 'all', visibility: 'all' })}
                    tooltip="Toutes vos reviews, tous types confondus. Cliquez pour ouvrir la liste complète."
                />
                <StatCard
                    icon={TrendingUp}
                    label="Ce mois-ci"
                    value={thisMonth}
                    color="green"
                    onClick={() => goToReviews({ period: 'month' })}
                    tooltip="Reviews créées sur les 30 derniers jours (fenêtre glissante, pas le mois calendaire). Cliquez pour ne lister que celles-là."
                />
                <StatCard
                    icon={Eye}
                    label="Publiques"
                    value={publicCount}
                    color="blue"
                    onClick={() => goToReviews({ visibility: 'public' })}
                    tooltip="Reviews visibles par tous et partageables via un lien public. Cliquez pour ne lister que les publiques."
                />
                <StatCard
                    icon={EyeOff}
                    label="Privées"
                    value={privateCount}
                    color="gray"
                    onClick={() => goToReviews({ visibility: 'private' })}
                    tooltip="Reviews visibles de vous seul. Une review a besoin d'un aperçu Export Maker avant de pouvoir être publiée. Cliquez pour ne lister que les privées."
                />
            </div>

            {/* Répartition par type */}
            {total > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3">Répartition par type</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(TYPE_META).map(([id, meta]) => {
                            const Icon = meta.icon
                            const count = byType[id] || 0
                            return (
                                <LiquidTooltip
                                    key={id}
                                    multiline
                                    position="bottom"
                                    wrapperClassName="w-full"
                                    content={count > 0
                                        ? `${count} review${count > 1 ? 's' : ''} de type ${meta.label}. Cliquez pour ouvrir la liste filtrée sur ce type.`
                                        : `Aucune review ${meta.label} pour l'instant. Cliquez pour ouvrir la liste filtrée sur ce type.`}
                                >
                                    <button
                                        type="button"
                                        onClick={() => goToReviews({ type: id })}
                                        className="w-full text-left"
                                    >
                                        <LiquidCard
                                            glow="none"
                                            padding="sm"
                                            className={`flex items-center gap-2 w-full transition-all cursor-pointer group hover:border-purple-500/40 hover:bg-white/[0.04] ${count === 0 ? 'opacity-60' : ''}`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0`}>
                                                <Icon className={`w-4 h-4 ${meta.color}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white">{count}</p>
                                                <p className="text-[11px] text-white/50 truncate">{meta.label}</p>
                                            </div>
                                            <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-white/10 group-hover:text-purple-400 transition-colors shrink-0 ml-auto" />
                                        </LiquidCard>
                                    </button>
                                </LiquidTooltip>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Stats producteur */}
            {isProducer && (
                <div>
                    <h3 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-1.5">
                        Outils Producteur
                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-400 rounded">PRO</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            icon={Dna}
                            label="Arbres généalogiques"
                            value={trees?.length ?? 0}
                            color="emerald"
                            onClick={() => onNavigate('cultivars')}
                            tooltip="Vos lignées PhenoHunt (croisements, phénotypes sélectionnés). Cliquez pour ouvrir le canevas généalogique."
                        />
                        <StatCard
                            icon={GitBranch}
                            label="Chaînes de production"
                            value={chains?.length ?? 0}
                            color="emerald"
                            onClick={() => onNavigate('production-chain')}
                            tooltip="Vos chaînes reliant les fiches entre elles (Fleur → Hash → Concentré → Comestible) avec bilan matière. Cliquez pour ouvrir le canevas."
                        />
                    </div>
                </div>
            )}

            {/* Reviews récentes */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white/70">Reviews récentes</h3>
                    {recentReviews.length > 0 && (
                        <LiquidTooltip content="Ouvrir la liste complète de vos reviews, sans filtre">
                            <button
                                onClick={() => goToReviews()}
                                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                                Voir tout <ArrowRight className="w-3 h-3" />
                            </button>
                        </LiquidTooltip>
                    )}
                </div>

                {recentReviews.length === 0 ? (
                    <LiquidCard glow="none" padding="lg" className="text-center py-10">
                        <FileText className="w-10 h-10 mx-auto text-white/20 mb-3" />
                        <p className="text-white/50">Aucune review pour le moment</p>
                        <button
                            type="button"
                            onClick={() => navigate('/create')}
                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                        >
                            Créer ma première review
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </LiquidCard>
                ) : (
                    <div className="space-y-2">
                        {recentReviews.map((review, idx) => {
                            // Canonicalisé : une review stockée 'Hash'/'Concentré'/'Comestible'
                            // afficherait sinon l'icône de repli (Fleurs).
                            const canonicalType = canonicalReviewType(review.type)
                            const meta = TYPE_META[canonicalType] || TYPE_META.Fleurs
                            const Icon = meta.icon
                            const images = parseImages(review.images)
                            const editPath = reviewEditPath(review)
                            const openReview = () => navigate(`/review/${review.id}`)
                            return (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                >
                                        {/* Ligne cliquable en <div> et non en <button> : elle contient elle-même
                                            des boutons d'action (un bouton imbriqué dans un bouton est invalide
                                            et casse le clic sur certains navigateurs).
                                            Pas d'info-bulle sur la ligne entière : elle resterait affichée en
                                            même temps que celle des boutons d'action au survol de ceux-ci
                                            (le survol du parent n'est pas interrompu en entrant dans un enfant).
                                            Les métadonnées qu'elle aurait portées sont écrites dans la ligne. */}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={openReview}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    openReview()
                                                }
                                            }}
                                            title={`Ouvrir la fiche « ${review.holderName} »`}
                                            className="w-full text-left cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 rounded-2xl"
                                        >
                                            <LiquidCard glow="none" padding="sm" className="flex items-center gap-3 transition-all group-hover:border-purple-500/40 group-hover:bg-white/[0.04]">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center shrink-0">
                                                    {images[0] ? (
                                                        <img src={images[0]} alt={review.holderName} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon className={`w-5 h-5 ${meta.color}`} />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-white truncate">{review.holderName}</p>
                                                    <div className="flex items-center gap-2 text-[11px] text-white/40">
                                                        <span className={meta.color}>{meta.label}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                                        </span>
                                                        <span className={review.isPublic ? 'text-green-400/70' : 'text-white/30'}>
                                                            {review.isPublic ? 'Publique' : 'Privée'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions directes — toujours présentes au clavier/tactile,
                                                    simplement plus discrètes tant que la ligne n'est pas survolée */}
                                                <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                                    <LiquidTooltip content="Ouvrir la fiche">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); openReview() }}
                                                            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                                                            aria-label={`Ouvrir la fiche ${review.holderName}`}
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </button>
                                                    </LiquidTooltip>
                                                    <LiquidTooltip content="Modifier la review">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); navigate(editPath) }}
                                                            className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-amber-400 transition-colors"
                                                            aria-label={`Modifier ${review.holderName}`}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </LiquidTooltip>
                                                </div>
                                            </LiquidCard>
                                        </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Accès rapide */}
            <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">Accès rapide</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <QuickAccessCard
                        index={0}
                        icon={FileText}
                        label="Mes Reviews"
                        description="Gérez vos reviews sauvegardées"
                        color="purple"
                        onClick={() => goToReviews()}
                        tooltip={guideText('reviews')}
                    />
                    <QuickAccessCard
                        index={1}
                        icon={Palette}
                        label="Templates Export"
                        description="Templates d'export et filigranes"
                        color="pink"
                        onClick={() => onNavigate('templates')}
                        tooltip={guideText('templates')}
                    />
                    <QuickAccessCard
                        index={2}
                        icon={BarChart3}
                        label="Statistiques"
                        description="Statistiques de votre bibliothèque"
                        color="blue"
                        onClick={() => onNavigate('stats')}
                        tooltip={guideText('stats')}
                    />
                    {isProducer && (
                        <>
                            <QuickAccessCard
                                index={3}
                                icon={Dna}
                                label="Arbres Généalogiques"
                                description="Construisez et explorez vos lignées généalogiques (PhenoHunt)"
                                color="emerald"
                                locked
                                onClick={() => onNavigate('cultivars')}
                                tooltip={guideText('cultivars')}
                            />
                            <QuickAccessCard
                                index={4}
                                icon={GitBranch}
                                label="Chaîne de production"
                                description="Liez vos fiches techniques entre elles"
                                color="emerald"
                                locked
                                onClick={() => onNavigate('production-chain')}
                                tooltip={guideText('production-chain')}
                            />
                            <QuickAccessCard
                                index={5}
                                icon={Database}
                                label="Données Récurrentes"
                                description="Substrats, engrais, techniques sauvegardés"
                                color="emerald"
                                locked
                                onClick={() => onNavigate('data')}
                                tooltip={guideText('data')}
                            />
                        </>
                    )}
                </div>
            </div>

            <GuideModal
                open={guideOpen}
                onClose={() => setGuideOpen(false)}
                isProducer={isProducer}
                onGo={(tabId) => onNavigate(tabId)}
            />
        </div>
    )
}
