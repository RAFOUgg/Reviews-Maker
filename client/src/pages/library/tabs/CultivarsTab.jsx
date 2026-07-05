/**
 * CultivarsTab.jsx - Onglet Cultivars de la Bibliothèque (Producteur uniquement)
 * 
 * Conforme au CDC:
 * - Gestion de la bibliothèque de cultivars
 * - Création et gestion des arbres généalogiques (édition dans PhenoHunt)
 * - Canvas de sélection drag & drop
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton, LiquidChip } from '@/components/ui/LiquidUI'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Flower2, Plus, Trash2, Edit, Eye, GitBranch, Search,
    Filter, Grid3X3, List, FolderTree, Dna, LayoutGrid, Moon, Sun, Shuffle, HeartPulse,
    X, Check, ChevronRight, Tag, User, ExternalLink, RefreshCw, Download
} from 'lucide-react'
import useGeneticsStore from '../../../store/useGeneticsStore'
import { getImageUrl, parseImages } from '../../../utils/imageUtils'

// Types de cultivars — la couleur est restreinte aux 4 teintes de glow réellement définies pour
// LiquidChip actif (purple/green/cyan/amber, cf. apple-liquid-glass.css .liquid-chip.active.*) ;
// "Tous" et "Indica" partagent le violet sans ambiguïté visuelle puisqu'un seul chip est actif
// à la fois.
const CULTIVAR_TYPES = [
    { id: 'all', label: 'Tous', color: 'purple', icon: LayoutGrid },
    { id: 'indica', label: 'Indica', color: 'purple', icon: Moon },
    { id: 'sativa', label: 'Sativa', color: 'green', icon: Sun },
    { id: 'hybrid', label: 'Hybride', color: 'amber', icon: Shuffle },
    { id: 'cbd', label: 'CBD', color: 'cyan', icon: HeartPulse },
]

// Types de projet d'arbre généalogique — même principe que CULTIVAR_TYPES (badge coloré en
// haut à droite de la carte), mappé sur GeneticTree.projectType côté Prisma.
const TREE_TYPES = {
    phenohunt: { label: 'PhenoHunt', color: 'purple' },
    selection: { label: 'Sélection', color: 'green' },
    crossing: { label: 'Croisement', color: 'amber' },
    hunt: { label: 'Hunt', color: 'cyan' },
}

function formatTreeDate(iso) {
    if (!iso) return null
    try {
        return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
        return null
    }
}

const CANNABINOID_SOURCE_LABELS = {
    breeder_claim: 'Annoncé breeder',
    lab_tested: 'Analyse labo (COA)'
}

const YIELD_UNIT_LABELS = { g_m2: 'g/m²', g_plant: 'g/plant' }

function formatPctRange(min, max) {
    if (min === null || min === undefined) {
        if (max === null || max === undefined) return null
        return `<${max}%`
    }
    if (max === null || max === undefined) return `>${min}%`
    return min === max ? `${min}%` : `${min}-${max}%`
}

function formatWeeksRange(min, max) {
    if (min === null || min === undefined || max === null || max === undefined) return null
    return min === max ? `${min} sem` : `${min}-${max} sem`
}

// Libellé lisible pour une entrée de `linkedReferences` (cf. server-new/utils/cultivarReferences.js)
function formatRefText(field, ref) {
    if (field === 'type') return CULTIVAR_TYPES.find(t => t.id === ref.value)?.label || ref.value
    if (field === 'indicaRatio') return `${ref.value}% Indica`
    if (field === 'thc' || field === 'cbd') {
        const range = formatPctRange(ref.min, ref.max)
        return range ? `${range}${ref.source === 'lab_tested' ? ' 🧪' : ''}` : null
    }
    if (field === 'floweringWeeks') return `${Math.round(ref.value)} sem`
    if (field === 'yield') return `${ref.value} ${YIELD_UNIT_LABELS[ref.unit] || ref.unit || ''}`
    return String(ref.value)
}

// Bloc lecture affiché à la place d'un input manuel quand des sources liées existent pour ce
// champ (review Fleur / nœud PhenoHunt) — avec bascule "Remplacer manuellement" en secours.
function LinkedFieldNote({ field, refs, onOverride }) {
    if (!refs?.length) return null
    return (
        <div className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-xl bg-green-500/5 border border-green-500/20">
            <div className="text-xs text-white/70 space-y-1 min-w-0">
                {refs.map((ref, i) => {
                    const text = formatRefText(field, ref)
                    if (!text) return null
                    return (
                        <p key={i} className="truncate">
                            <span className="text-white">{text}</span>
                            <span className="text-white/40"> — {ref.origin.label}{ref.origin.date ? ` · ${formatTreeDate(ref.origin.date)}` : ''}</span>
                        </p>
                    )
                })}
            </div>
            <button
                type="button"
                onClick={onOverride}
                className="text-xs text-white/40 hover:text-white/70 whitespace-nowrap flex-shrink-0"
            >
                🔓 Remplacer
            </button>
        </div>
    )
}

export default function CultivarsTab({ userTier = 'producer' }) {
    const toast = useToast()
    const navigate = useNavigate()

    const [cultivars, setCultivars] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('library') // 'library', 'phenohunt', 'arbres'
    const [viewMode, setViewMode] = useState('grid')
    const [typeFilter, setTypeFilter] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [editingCultivar, setEditingCultivar] = useState(null)
    // Champs pour lesquels on affiche l'input manuel malgré des références liées (reviews/nœuds
    // PhenoHunt) — initialisé dans openEdit() à partir des colonnes déjà remplies à la main,
    // et modifiable via le bouton "Remplacer manuellement" de LinkedFieldNote.
    const [manualOverrides, setManualOverrides] = useState(new Set())
    const [confirmDeleteTree, setConfirmDeleteTree] = useState({ open: false, treeId: null })
    // Reviews Fleurs importables comme cultivars (bibliothèque vide malgré des reviews/arbres
    // existants — la bibliothèque de cultivars est une table à part, jamais peuplée
    // automatiquement) et suivi local des reviews déjà importées cette session (pas de lien
    // Cultivar↔Review en base, donc pas de détection serveur possible).
    const [myFlowerReviews, setMyFlowerReviews] = useState([])
    const [importingReviewId, setImportingReviewId] = useState(null)
    const [importedReviewIds, setImportedReviewIds] = useState(new Set())

    // Formulaire cultivar
    const [formData, setFormData] = useState({
        name: '',
        breeder: '',
        type: 'hybrid',
        genetics: '', // Lignée parentale
        phenotype: '',
        indicaRatio: '',
        thcMin: '', thcMax: '', thcSource: 'breeder_claim',
        cbdMin: '', cbdMax: '', cbdSource: 'breeder_claim',
        labReportUrl: '',
        floweringMinWeeks: '', floweringMaxWeeks: '',
        yieldValue: '', yieldUnit: 'g_m2',
        image: '',
        description: '',
        tags: []
    })

    // Génétiques store
    const {
        trees,
        treeLoading: treesLoading,
        fetchTrees,
        createTree,
        deleteTree: deleteTreeApi,
        loadTree
    } = useGeneticsStore()

    // Charger les données
    const fetchData = useCallback(async () => {
        try {
            setLoading(true)

            // Charger cultivars
            const cultivarsRes = await fetch('/api/library/cultivars', {
                credentials: 'include'
            })
            if (cultivarsRes.ok) {
                const data = await cultivarsRes.json()
                setCultivars(data.cultivars || [])
            }

            // Reviews Fleurs de l'utilisateur — proposées en import rapide quand la bibliothèque
            // de cultivars est vide (même pattern que PhenoHuntPage.jsx "Mes reviews Fleurs").
            const reviewsRes = await fetch('/api/reviews/my', { credentials: 'include' })
            if (reviewsRes.ok) {
                const data = await reviewsRes.json()
                const all = Array.isArray(data) ? data : (data.reviews || [])
                setMyFlowerReviews(all.filter(r => r.type === 'Fleurs' || r.productType === 'flower'))
            }
        } catch (error) {
            toast.error('Erreur lors du chargement')
        } finally {
            setLoading(false)
        }
    }, [toast])

    // Importer une review Fleur comme entrée de bibliothèque — pré-remplit ce qu'on connaît déjà
    // (nom, breeder, lignée, photo) ; l'utilisateur complète le reste (type/THC-CBD/etc.) ensuite
    // via "Modifier" comme pour n'importe quel cultivar.
    const importReviewAsCultivar = async (review) => {
        setImportingReviewId(review.id)
        try {
            const images = parseImages(review.images)
            const response = await fetch('/api/library/cultivars', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    name: review.holderName || review.name || 'Sans nom',
                    breeder: review.breeder || review.farm || '',
                    // Le type (Indica/Sativa/Hybride/CBD) n'est pas connu depuis cette liste de reviews :
                    // laisser vide plutôt que de mal-classer, l'utilisateur le complète via "Modifier".
                    type: null,
                    genetics: review.cultivars || '',
                    image: images[0] || ''
                })
            })
            if (response.ok) {
                const saved = await response.json()
                setCultivars(prev => [...prev, saved])
                setImportedReviewIds(prev => new Set(prev).add(review.id))
                toast.success(`"${saved.name}" ajouté à la bibliothèque`)
            } else {
                toast.error('Erreur lors de l\'import')
            }
        } catch {
            toast.error('Erreur de connexion')
        } finally {
            setImportingReviewId(null)
        }
    }

    useEffect(() => {
        fetchData()
        fetchTrees()
    }, [fetchData])

    // Filtrer les cultivars
    const filteredCultivars = cultivars
        .filter(c => {
            if (typeFilter !== 'all' && c.type !== typeFilter) return false
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                return (
                    c.name?.toLowerCase().includes(query) ||
                    c.breeder?.toLowerCase().includes(query) ||
                    c.genetics?.toLowerCase().includes(query)
                )
            }
            return true
        })

    // Réinitialiser formulaire
    const resetForm = () => {
        setFormData({
            name: '',
            breeder: '',
            type: 'hybrid',
            genetics: '',
            phenotype: '',
            indicaRatio: '',
            thcMin: '', thcMax: '', thcSource: 'breeder_claim',
            cbdMin: '', cbdMax: '', cbdSource: 'breeder_claim',
            labReportUrl: '',
            floweringMinWeeks: '', floweringMaxWeeks: '',
            yieldValue: '', yieldUnit: 'g_m2',
            image: '',
            description: '',
            tags: []
        })
        setIsCreating(false)
        setEditingCultivar(null)
        setManualOverrides(new Set())
    }

    // Ouvrir édition
    const openEdit = (cultivar) => {
        // Un champ démarre en mode "input manuel" soit parce qu'il a déjà une valeur manuelle en
        // base (elle prime de toute façon sur les références liées côté API), soit parce qu'il
        // n'a aucune référence liée à afficher.
        const initialOverrides = new Set()
        if (cultivar.breeder) initialOverrides.add('breeder')
        if (cultivar.type) initialOverrides.add('type')
        if (cultivar.indicaRatio !== null && cultivar.indicaRatio !== undefined) initialOverrides.add('indicaRatio')
        if (cultivar.thcMin !== null && cultivar.thcMin !== undefined) initialOverrides.add('thc')
        if (cultivar.cbdMin !== null && cultivar.cbdMin !== undefined) initialOverrides.add('cbd')
        if (cultivar.labReportUrl) initialOverrides.add('labReportUrl')
        if (cultivar.floweringMinWeeks !== null && cultivar.floweringMinWeeks !== undefined) initialOverrides.add('floweringWeeks')
        if (cultivar.yieldValue !== null && cultivar.yieldValue !== undefined) initialOverrides.add('yield')
        setManualOverrides(initialOverrides)

        setFormData({
            name: cultivar.name || '',
            breeder: cultivar.breeder || '',
            type: cultivar.type || 'hybrid',
            genetics: cultivar.genetics || '',
            phenotype: cultivar.phenotype || '',
            indicaRatio: cultivar.indicaRatio ?? '',
            thcMin: cultivar.thcMin ?? '', thcMax: cultivar.thcMax ?? '', thcSource: cultivar.thcSource || 'breeder_claim',
            cbdMin: cultivar.cbdMin ?? '', cbdMax: cultivar.cbdMax ?? '', cbdSource: cultivar.cbdSource || 'breeder_claim',
            labReportUrl: cultivar.labReportUrl || '',
            floweringMinWeeks: cultivar.floweringMinWeeks ?? '', floweringMaxWeeks: cultivar.floweringMaxWeeks ?? '',
            yieldValue: cultivar.yieldValue ?? '', yieldUnit: cultivar.yieldUnit || 'g_m2',
            image: cultivar.image || '',
            description: cultivar.description || '',
            tags: cultivar.tags || []
        })
        setEditingCultivar(cultivar)
    }

    // Références liées (reviews/nœuds PhenoHunt) du cultivar en cours d'édition — vide en création.
    const linkedRefs = editingCultivar?.linkedReferences || {}
    // Un champ s'affiche en lecture (bloc LinkedFieldNote) seulement s'il a des références liées
    // ET que l'utilisateur n'a pas demandé à le remplacer manuellement.
    const showManualInput = (field) => !linkedRefs[field]?.length || manualOverrides.has(field)
    const overrideField = (field) => setManualOverrides(prev => new Set(prev).add(field))

    // Sauvegarder cultivar
    const saveCultivar = async () => {
        if (!formData.name.trim()) {
            toast.error('Le nom est requis')
            return
        }

        try {
            const url = editingCultivar
                ? `/api/library/cultivars/${editingCultivar.id}`
                : '/api/library/cultivars'

            const response = await fetch(url, {
                method: editingCultivar ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const saved = await response.json()
                if (editingCultivar) {
                    setCultivars(cultivars.map(c => c.id === saved.id ? saved : c))
                    toast.success('Cultivar mis à jour')
                } else {
                    setCultivars([...cultivars, saved])
                    toast.success('Cultivar créé')
                }
                resetForm()
            } else {
                toast.error('Erreur lors de la sauvegarde')
            }
        } catch (error) {
            toast.error('Erreur de connexion')
        }
    }

    // Supprimer cultivar
    const deleteCultivar = async (id) => {
        if (!window.confirm('Supprimer ce cultivar ?')) return

        try {
            const response = await fetch(`/api/library/cultivars/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setCultivars(cultivars.filter(c => c.id !== id))
                toast.success('Cultivar supprimé')
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    // Rendu carte cultivar
    const renderCultivarCard = (cultivar, index) => {
        // effective* = valeur manuelle si renseignée, sinon connue depuis une review/un nœud
        // PhenoHunt lié (calculé côté API, cf. server-new/utils/cultivarReferences.js) — les
        // cartes doivent rester correctes même pour un cultivar jamais rempli à la main.
        const typeConfig = CULTIVAR_TYPES.find(t => t.id === (cultivar.effectiveType || cultivar.type))
        const linkedCount = Object.values(cultivar.linkedReferences || {}).reduce((sum, arr) => sum + arr.length, 0)

        if (viewMode === 'list') {
            return (
                <motion.div
                    key={cultivar.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                >
                    <LiquidCard glow="none" padding="sm" className="hover:border-green-500/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg bg-${typeConfig?.color || 'green'}-500/20 flex items-center justify-center flex-shrink-0`}>
                                <Flower2 className={`w-5 h-5 text-${typeConfig?.color || 'green'}-400`} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white truncate">{cultivar.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-white/50">
                                    <span>{cultivar.breeder || 'Breeder inconnu'}</span>
                                    <span className={`px-2 py-0.5 rounded bg-${typeConfig?.color || 'green'}-500/20 text-${typeConfig?.color || 'green'}-400`}>
                                        {typeConfig?.label}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <LiquidButton
                                    onClick={() => openEdit(cultivar)}
                                    variant="ghost"
                                    size="sm"
                                    icon={Edit}
                                />
                                <LiquidButton
                                    onClick={() => deleteCultivar(cultivar.id)}
                                    variant="ghost"
                                    size="sm"
                                    icon={Trash2}
                                    className="hover:!text-red-400"
                                />
                            </div>
                        </div>
                    </LiquidCard>
                </motion.div>
            )
        }

        // Vue Grid
        return (
            <motion.div
                key={cultivar.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
            >
                <LiquidCard glow="none" padding="md" className="hover:border-green-500/30 transition-all group">
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-${typeConfig?.color || 'green'}-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                            {cultivar.image ? (
                                <img
                                    src={getImageUrl(cultivar.image)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                                />
                            ) : null}
                            <Flower2 className={`w-6 h-6 text-${typeConfig?.color || 'green'}-400`} style={cultivar.image ? { display: 'none' } : undefined} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{cultivar.name}</h3>
                            <p className="text-sm text-white/50">{cultivar.effectiveBreeder || cultivar.breeder || 'Breeder inconnu'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg bg-${typeConfig?.color || 'green'}-500/20 text-${typeConfig?.color || 'green'}-400 text-xs font-bold`}>
                            {typeConfig?.label}
                        </span>
                    </div>

                    {/* Génétique */}
                    {cultivar.genetics && (
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
                            <Dna className="w-4 h-4" />
                            <span className="truncate">{cultivar.genetics}</span>
                        </div>
                    )}

                    {/* Lié à des reviews/nœuds PhenoHunt — valeurs affichées ci-dessous incluent ces sources */}
                    {linkedCount > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-green-400/80 mb-3">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Lié à {linkedCount} source{linkedCount > 1 ? 's' : ''}</span>
                        </div>
                    )}

                    {/* Stats rapides */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        {formatPctRange(cultivar.effectiveThcMin, cultivar.effectiveThcMax) && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60" title={CANNABINOID_SOURCE_LABELS[cultivar.effectiveThcSource] || ''}>
                                THC: {formatPctRange(cultivar.effectiveThcMin, cultivar.effectiveThcMax)}
                                {cultivar.effectiveThcSource === 'lab_tested' ? ' 🧪' : ''}
                            </div>
                        )}
                        {formatWeeksRange(cultivar.effectiveFloweringMinWeeks, cultivar.effectiveFloweringMaxWeeks) && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                                🌸 {formatWeeksRange(cultivar.effectiveFloweringMinWeeks, cultivar.effectiveFloweringMaxWeeks)}
                            </div>
                        )}
                        {cultivar.effectiveYieldValue !== null && cultivar.effectiveYieldValue !== undefined && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                                🌾 {cultivar.effectiveYieldValue} {YIELD_UNIT_LABELS[cultivar.effectiveYieldUnit] || ''}
                            </div>
                        )}
                        {cultivar.effectiveIndicaRatio !== null && cultivar.effectiveIndicaRatio !== undefined && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                                ⚖️ {cultivar.effectiveIndicaRatio}% Indica
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {cultivar.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {cultivar.tags.slice(0, 3).map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">
                                    {tag}
                                </span>
                            ))}
                            {cultivar.tags.length > 3 && (
                                <span className="px-2 py-0.5 bg-white/10 text-white/40 rounded text-xs">
                                    +{cultivar.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <LiquidButton
                            onClick={() => openEdit(cultivar)}
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            className="flex-1"
                        >
                            Modifier
                        </LiquidButton>
                        <LiquidButton
                            onClick={() => deleteCultivar(cultivar.id)}
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="hover:!text-red-400"
                        />
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    // Créer un arbre depuis la bibliothèque
    const handleCreateTree = async () => {
        try {
            const result = await createTree({
                name: `Arbre Généalogique ${trees.length + 1}`,
                description: 'Créé depuis la bibliothèque',
                projectType: 'selection'
            })
            if (result?.data) {
                await loadTree(result.data.id)
                navigate('/phenohunt')
            }
        } catch (error) {
            toast.error('Erreur lors de la création de l\'arbre')
        }
    }

    // Supprimer un arbre
    const handleDeleteTree = (treeId, e) => {
        e?.stopPropagation()
        setConfirmDeleteTree({ open: true, treeId })
    }

    const confirmDeleteTreeNow = async () => {
        const treeId = confirmDeleteTree.treeId
        setConfirmDeleteTree({ open: false, treeId: null })
        if (!treeId) return
        await deleteTreeApi(treeId)
        toast.success('Arbre supprimé')
    }

    // Rendu d'un arbre généalogique — même gabarit visuel que renderCultivarCard (header icône
    // carrée + titre/sous-titre + badge coloré, grille de stats rapides, actions révélées au
    // survol) pour que les deux onglets de la bibliothèque (Cultivars / Arbres Généalogiques)
    // se lisent comme un seul système cohérent plutôt que deux designs différents.
    const renderTreeCard = (tree, index) => {
        const typeConfig = TREE_TYPES[tree.projectType] || TREE_TYPES.phenohunt
        const nodesCount = tree._count?.nodes ?? tree.nodes?.length ?? 0
        const edgesCount = tree._count?.edges ?? tree.edges?.length ?? 0
        const dateLabel = formatTreeDate(tree.updatedAt || tree.createdAt)

        if (viewMode === 'list') {
            return (
                <motion.div
                    key={tree.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                >
                    <LiquidCard glow="none" padding="sm" className="hover:border-violet-500/30 transition-all cursor-pointer" onClick={() => navigate(`/phenohunt?tree=${tree.id}`)}>
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg bg-${typeConfig.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                                <Dna className={`w-5 h-5 text-${typeConfig.color}-400`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-white truncate">{tree.name}</h3>
                                <div className="flex items-center gap-3 text-sm text-white/50">
                                    <span>{nodesCount} nœuds • {edgesCount} liens</span>
                                    <span className={`px-2 py-0.5 rounded bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400`}>
                                        {typeConfig.label}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <LiquidButton
                                    onClick={(e) => { e.stopPropagation(); navigate(`/phenohunt?tree=${tree.id}`) }}
                                    variant="ghost"
                                    size="sm"
                                    icon={Edit}
                                />
                                <LiquidButton
                                    onClick={(e) => handleDeleteTree(tree.id, e)}
                                    variant="ghost"
                                    size="sm"
                                    icon={Trash2}
                                    className="hover:!text-red-400"
                                />
                            </div>
                        </div>
                    </LiquidCard>
                </motion.div>
            )
        }

        // Vue Grid — même structure que renderCultivarCard
        return (
            <motion.div
                key={tree.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
            >
                <LiquidCard
                    glow="none"
                    padding="md"
                    className="hover:border-violet-500/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/phenohunt?tree=${tree.id}`)}
                >
                    <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-${typeConfig.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                            <Dna className={`w-6 h-6 text-${typeConfig.color}-400`} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{tree.name}</h3>
                            <p className="text-sm text-white/50 truncate">{tree.description || 'Aucune description'}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-lg bg-${typeConfig.color}-500/20 text-${typeConfig.color}-400 text-xs font-bold`}>
                            {typeConfig.label}
                        </span>
                    </div>

                    {/* Stats rapides — même grille que cultivar (THC/floraison/etc.) */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                            🌿 {nodesCount} nœud{nodesCount > 1 ? 's' : ''}
                        </div>
                        <div className="px-2 py-1 bg-white/5 rounded text-white/60">
                            🔗 {edgesCount} lien{edgesCount > 1 ? 's' : ''}
                        </div>
                        {dateLabel && (
                            <div className="px-2 py-1 bg-white/5 rounded text-white/60 col-span-2">
                                📅 {dateLabel}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <LiquidButton
                            onClick={(e) => { e.stopPropagation(); navigate(`/phenohunt?tree=${tree.id}`) }}
                            variant="ghost"
                            size="sm"
                            icon={Edit}
                            className="flex-1"
                        >
                            Ouvrir
                        </LiquidButton>
                        <LiquidButton
                            onClick={(e) => handleDeleteTree(tree.id, e)}
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            className="hover:!text-red-400"
                        />
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        )
    }

    return (
        <>
        <div className="space-y-6">
            {/* Tabs Bibliothèque / PhenoHunt / Arbres */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'library'
                        ? 'bg-green-500/20 text-green-400'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <FolderTree className="w-4 h-4" />
                    Bibliothèque
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">{cultivars.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('arbres')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'arbres'
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Dna className="w-4 h-4" />
                    Arbres Généalogiques
                    <span className="text-xs px-1.5 py-0.5 rounded bg-white/10">{trees.length}</span>
                </button>
            </div>

            {activeTab === 'library' ? (
                <>
                    {/* Toolbar */}
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Filtres type */}
                        <div className="flex flex-wrap gap-2">
                            {CULTIVAR_TYPES.map((type) => {
                                const isActive = typeFilter === type.id
                                const count = type.id === 'all'
                                    ? cultivars.length
                                    : cultivars.filter(c => c.type === type.id).length

                                return (
                                    <LiquidChip
                                        key={type.id}
                                        active={isActive}
                                        color={type.color}
                                        icon={type.icon}
                                        onClick={() => setTypeFilter(type.id)}
                                    >
                                        {type.label}
                                        <span className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                                            {count}
                                        </span>
                                    </LiquidChip>
                                )
                            })}
                        </div>

                        <div className="flex-1" />

                        {/* Recherche + Vue */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm w-48 focus:outline-none focus:border-green-500/50"
                                />
                            </div>

                            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 gap-1">
                                <LiquidButton
                                    onClick={() => setViewMode('grid')}
                                    variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                                    size="sm"
                                    icon={Grid3X3}
                                />
                                <LiquidButton
                                    onClick={() => setViewMode('list')}
                                    variant={viewMode === 'list' ? 'primary' : 'ghost'}
                                    size="sm"
                                    icon={List}
                                />
                            </div>

                            <LiquidButton
                                onClick={() => setIsCreating(true)}
                                variant="primary"
                                size="sm"
                                icon={Plus}
                            >
                                Ajouter
                            </LiquidButton>
                        </div>
                    </div>

                    {/* Formulaire création/édition */}
                    <AnimatePresence>
                        {(isCreating || editingCultivar) && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <LiquidCard glow="green" padding="lg">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Flower2 className="w-5 h-5 text-green-400" />
                                        {editingCultivar ? 'Modifier le cultivar' : 'Nouveau cultivar'}
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Nom *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="ex: Zkittlez"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Breeder</label>
                                            {showManualInput('breeder') ? (
                                                <input
                                                    type="text"
                                                    value={formData.breeder}
                                                    onChange={(e) => setFormData({ ...formData, breeder: e.target.value })}
                                                    placeholder="ex: 3rd Gen Family"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                />
                                            ) : (
                                                <LinkedFieldNote field="breeder" refs={linkedRefs.breeder} onOverride={() => overrideField('breeder')} />
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Type</label>
                                            {showManualInput('type') ? (
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                                >
                                                    {CULTIVAR_TYPES.filter(t => t.id !== 'all').map(t => (
                                                        <option key={t.id} value={t.id} className="bg-[#1a1a2e]">{t.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <LinkedFieldNote field="type" refs={linkedRefs.type} onOverride={() => overrideField('type')} />
                                            )}
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Génétique / Lignée</label>
                                            <input
                                                type="text"
                                                value={formData.genetics}
                                                onChange={(e) => setFormData({ ...formData, genetics: e.target.value })}
                                                placeholder="ex: Grape Ape x Grapefruit"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Photo (URL)</label>
                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                                placeholder="https://..."
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                            <p className="text-xs text-white/40 mt-1">Reprise automatiquement sur le nœud lors du glisser-déposer dans un arbre PhenoHunt.</p>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Ratio Indica/Sativa (%)</label>
                                            {showManualInput('indicaRatio') ? (
                                                <input
                                                    type="number" min="0" max="100"
                                                    value={formData.indicaRatio}
                                                    onChange={(e) => setFormData({ ...formData, indicaRatio: e.target.value })}
                                                    placeholder="ex: 70 (0 = Sativa pur, 100 = Indica pur)"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                />
                                            ) : (
                                                <LinkedFieldNote field="indicaRatio" refs={linkedRefs.indicaRatio} onOverride={() => overrideField('indicaRatio')} />
                                            )}
                                            <p className="text-xs text-white/40 mt-1">
                                                Classification Indica/Sativa empirique/commerciale, pas une taxonomie scientifiquement validée — le chémotype (profil cannabinoïdes/terpènes) est l'indicateur rigoureux moderne.
                                            </p>
                                        </div>

                                        {showManualInput('thc') ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">THC min (%)</label>
                                                    <input
                                                        type="number" min="0" max="100" step="0.1"
                                                        value={formData.thcMin}
                                                        onChange={(e) => setFormData({ ...formData, thcMin: e.target.value })}
                                                        placeholder="ex: 18"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">THC max (%)</label>
                                                    <input
                                                        type="number" min="0" max="100" step="0.1"
                                                        value={formData.thcMax}
                                                        onChange={(e) => setFormData({ ...formData, thcMax: e.target.value })}
                                                        placeholder="ex: 24"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">Source THC</label>
                                                    <select
                                                        value={formData.thcSource}
                                                        onChange={(e) => setFormData({ ...formData, thcSource: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                                    >
                                                        <option value="breeder_claim" className="bg-[#1a1a2e]">Annoncé breeder</option>
                                                        <option value="lab_tested" className="bg-[#1a1a2e]">Analyse labo (COA)</option>
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="md:col-span-2 lg:col-span-3">
                                                <label className="block text-sm text-white/60 mb-2">THC</label>
                                                <LinkedFieldNote field="thc" refs={linkedRefs.thc} onOverride={() => overrideField('thc')} />
                                            </div>
                                        )}

                                        {showManualInput('cbd') ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">CBD min (%)</label>
                                                    <input
                                                        type="number" min="0" max="100" step="0.1"
                                                        value={formData.cbdMin}
                                                        onChange={(e) => setFormData({ ...formData, cbdMin: e.target.value })}
                                                        placeholder="ex: 0"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">CBD max (%)</label>
                                                    <input
                                                        type="number" min="0" max="100" step="0.1"
                                                        value={formData.cbdMax}
                                                        onChange={(e) => setFormData({ ...formData, cbdMax: e.target.value })}
                                                        placeholder="ex: 1"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">Source CBD</label>
                                                    <select
                                                        value={formData.cbdSource}
                                                        onChange={(e) => setFormData({ ...formData, cbdSource: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                                    >
                                                        <option value="breeder_claim" className="bg-[#1a1a2e]">Annoncé breeder</option>
                                                        <option value="lab_tested" className="bg-[#1a1a2e]">Analyse labo (COA)</option>
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="md:col-span-2 lg:col-span-3">
                                                <label className="block text-sm text-white/60 mb-2">CBD</label>
                                                <LinkedFieldNote field="cbd" refs={linkedRefs.cbd} onOverride={() => overrideField('cbd')} />
                                            </div>
                                        )}

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Lien du certificat d'analyse (COA)</label>
                                            {showManualInput('labReportUrl') ? (
                                                <input
                                                    type="url"
                                                    value={formData.labReportUrl}
                                                    onChange={(e) => setFormData({ ...formData, labReportUrl: e.target.value })}
                                                    placeholder="https://..."
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                />
                                            ) : (
                                                <LinkedFieldNote field="labReportUrl" refs={linkedRefs.labReportUrl} onOverride={() => overrideField('labReportUrl')} />
                                            )}
                                        </div>

                                        {showManualInput('floweringWeeks') ? (
                                            <>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">Floraison min (semaines)</label>
                                                    <input
                                                        type="number" min="0"
                                                        value={formData.floweringMinWeeks}
                                                        onChange={(e) => setFormData({ ...formData, floweringMinWeeks: e.target.value })}
                                                        placeholder="ex: 8"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm text-white/60 mb-2">Floraison max (semaines)</label>
                                                    <input
                                                        type="number" min="0"
                                                        value={formData.floweringMaxWeeks}
                                                        onChange={(e) => setFormData({ ...formData, floweringMaxWeeks: e.target.value })}
                                                        placeholder="ex: 9"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm text-white/60 mb-2">Floraison</label>
                                                <LinkedFieldNote field="floweringWeeks" refs={linkedRefs.floweringWeeks} onOverride={() => overrideField('floweringWeeks')} />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Rendement</label>
                                            {showManualInput('yield') ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number" min="0" step="0.1"
                                                        value={formData.yieldValue}
                                                        onChange={(e) => setFormData({ ...formData, yieldValue: e.target.value })}
                                                        placeholder="ex: 450"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                                    />
                                                    <select
                                                        value={formData.yieldUnit}
                                                        onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                                                        className="px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-green-500/50"
                                                    >
                                                        <option value="g_m2" className="bg-[#1a1a2e]">g/m²</option>
                                                        <option value="g_plant" className="bg-[#1a1a2e]">g/plant</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <LinkedFieldNote field="yield" refs={linkedRefs.yield} onOverride={() => overrideField('yield')} />
                                            )}
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Étiquettes (séparées par des virgules)</label>
                                            <input
                                                type="text"
                                                value={formData.tags.join(', ')}
                                                onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                                placeholder="ex: fruité, résistant, indoor"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50"
                                            />
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3">
                                            <label className="block text-sm text-white/60 mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                placeholder="Notes sur ce cultivar..."
                                                rows={3}
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-green-500/50 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                                        <LiquidButton onClick={resetForm} variant="ghost" icon={X}>
                                            Annuler
                                        </LiquidButton>
                                        <LiquidButton onClick={saveCultivar} variant="primary" icon={Check}>
                                            {editingCultivar ? 'Mettre à jour' : 'Créer'}
                                        </LiquidButton>
                                    </div>
                                </LiquidCard>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Liste cultivars */}
                    {filteredCultivars.length === 0 ? (
                        <LiquidCard glow="none" padding="lg">
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                                    <Flower2 className="w-8 h-8 text-white/30" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    {cultivars.length === 0 ? 'Aucun cultivar' : 'Aucun résultat'}
                                </h3>
                                <p className="text-white/50 mb-6">
                                    {cultivars.length === 0
                                        ? 'Commencez par ajouter votre premier cultivar'
                                        : 'Essayez de modifier vos filtres'
                                    }
                                </p>
                                {cultivars.length === 0 && (
                                    <LiquidButton
                                        onClick={() => setIsCreating(true)}
                                        variant="primary"
                                        icon={Plus}
                                    >
                                        Ajouter un cultivar
                                    </LiquidButton>
                                )}
                            </div>
                        </LiquidCard>
                    ) : null}

                    {/* Import rapide depuis les reviews Fleurs existantes — la bibliothèque de
                        cultivars est une table à part, jamais peuplée automatiquement par les
                        reviews ou les arbres PhenoHunt : sans ce raccourci, "Aucun cultivar"
                        reste vrai indéfiniment même avec des fiches techniques déjà créées. */}
                    {cultivars.length === 0 && myFlowerReviews.filter(r => !importedReviewIds.has(r.id)).length > 0 && (
                        <LiquidCard glow="none" padding="md">
                            <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                                <Download className="w-4 h-4 text-green-400" />
                                Importer depuis vos fiches techniques Fleurs
                            </h3>
                            <p className="text-xs text-white/40 mb-3">
                                Ajoute une entrée de bibliothèque pré-remplie (nom, breeder, lignée, photo) à partir d'une review existante.
                            </p>
                            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                {myFlowerReviews.filter(r => !importedReviewIds.has(r.id)).map(review => {
                                    const images = parseImages(review.images)
                                    return (
                                        <div
                                            key={review.id}
                                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-white/5 border border-white/5"
                                        >
                                            <div className="w-8 h-8 rounded-lg overflow-hidden bg-green-500/10 flex items-center justify-center flex-shrink-0">
                                                {images[0] ? (
                                                    <img src={images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Flower2 className="w-4 h-4 text-green-400/60" />
                                                )}
                                            </div>
                                            <span className="flex-1 min-w-0 truncate text-sm text-white/70">
                                                {review.holderName || review.name || 'Sans nom'}
                                            </span>
                                            <LiquidButton
                                                onClick={() => importReviewAsCultivar(review)}
                                                variant="ghost"
                                                size="sm"
                                                icon={Plus}
                                                loading={importingReviewId === review.id}
                                            >
                                                Ajouter
                                            </LiquidButton>
                                        </div>
                                    )
                                })}
                            </div>
                        </LiquidCard>
                    )}

                    {filteredCultivars.length > 0 && (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                            : 'space-y-2'
                        }>
                            <AnimatePresence>
                                {filteredCultivars.map((cultivar, index) => renderCultivarCard(cultivar, index))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            ) : (
                /* Tab Arbres Généalogiques — même structure/style que ProductionChainTab.jsx
                   (titre+icône+sous-titre à gauche, un seul CTA primaire à droite, carte
                   cliquable en entier plutôt que des boutons d'action séparés) */
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Dna className="w-5 h-5 text-violet-400" />
                                Arbres généalogiques
                            </h2>
                            <p className="text-sm text-white/50 mt-1">
                                Construisez et éditez vos lignées dans l'éditeur PhenoHunt complet
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <LiquidButton onClick={() => navigate('/phenohunt')} variant="ghost" icon={ExternalLink}>
                                Ouvrir PhenoHunt
                            </LiquidButton>
                            <LiquidButton onClick={handleCreateTree} variant="primary" icon={Plus}>
                                Nouvel arbre
                            </LiquidButton>
                        </div>
                    </div>

                    {treesLoading ? (
                        <div className="text-center py-16">
                            <RefreshCw className="w-8 h-8 animate-spin text-violet-400 mx-auto" />
                        </div>
                    ) : trees.length === 0 ? (
                        <LiquidCard glow="none" padding="lg" className="text-center py-16">
                            <Dna className="w-12 h-12 mx-auto text-white/20 mb-4" />
                            <p className="text-white/50">Aucun arbre généalogique pour le moment</p>
                            <p className="text-xs text-white/30 mt-1">Créez-en un pour construire vos lignées</p>
                        </LiquidCard>
                    ) : (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                            : 'space-y-2'
                        }>
                            <AnimatePresence>
                                {trees.map((tree, index) => renderTreeCard(tree, index))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            )}
        </div>
        <ConfirmModal
            open={confirmDeleteTree.open}
            title="Supprimer cet arbre"
            message={(() => {
                const tree = trees.find(t => t.id === confirmDeleteTree.treeId)
                const count = tree?._count?.flowerReviews || 0
                return count > 0
                    ? `Cet arbre est lié à ${count} review${count > 1 ? 's' : ''}. La suppression déliera ces reviews (elles resteront intactes mais perdront leur généalogie). Continuer ?`
                    : 'Supprimer cet arbre généalogique ? Cette action est irréversible.'
            })()}
            confirmLabel="Supprimer"
            onCancel={() => setConfirmDeleteTree({ open: false, treeId: null })}
            onConfirm={confirmDeleteTreeNow}
        />
        </>
    )
}
