import { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION COMPLÈTE DES MODULES PAR CATÉGORIE
// ═══════════════════════════════════════════════════════════════════════════════

const MODULE_CATEGORIES = {
    essential: {
        name: '🎯 Essentiels',
        description: 'Informations principales de la review',
        color: 'purple',
        modules: ['holderName', 'rating', 'image', 'description', 'type', 'category']
    },
    identity: {
        name: '🏷️ Identité Produit',
        description: 'Nom, auteur, date, tags',
        color: 'blue',
        modules: ['title', 'author', 'ownerName', 'date', 'tags', 'images', 'mainImage']
    },
    provenance: {
        name: '🌱 Provenance & Cultivar',
        description: 'Origine, génétique, producteur',
        color: 'green',
        modules: ['cultivar', 'cultivarsList', 'breeder', 'farm', 'hashmaker', 'origin', 'country', 'region']
    },
    ratings: {
        name: '⭐ Notes & Évaluations',
        description: 'Notes globales et par catégorie',
        color: 'yellow',
        modules: ['overallRating', 'categoryRatings', 'categoryRatings.visual', 'categoryRatings.smell', 'categoryRatings.taste', 'categoryRatings.effects', 'ratings', 'qualityScore']
    },
    sensory: {
        name: '🌸 Profil Sensoriel',
        description: 'Arômes, goûts, effets, terpènes',
        color: 'pink',
        modules: ['terpenes', 'aromas', 'tastes', 'effects', 'aromasIntensity', 'tastesIntensity', 'effectsIntensity', 'flavors', 'smell', 'taste']
    },
    technical: {
        name: '🔬 Données Techniques',
        description: 'THC, CBD, ratios, mesures',
        color: 'cyan',
        modules: ['thcLevel', 'cbdLevel', 'strainType', 'indicaRatio', 'sativaRatio', 'dureeEffet', 'purgevide', 'yield', 'floweringTime', 'harvestDate']
    },
    pipelines: {
        name: '⚗️ Process & Pipelines',
        description: 'Extraction, fertilisation, substrat',
        color: 'orange',
        modules: ['pipelineExtraction', 'pipelineSeparation', 'pipelinePurification', 'fertilizationPipeline', 'substratMix', 'curing', 'drying', 'processing']
    },
    extra: {
        name: '📎 Données Supplémentaires',
        description: 'Toutes les données additionnelles',
        color: 'gray',
        modules: ['extraData', 'notes', 'comments', 'recommendations', 'warnings', 'certifications', 'awards', 'labResults']
    }
};

const MODULE_LABELS = {
    // === ESSENTIELS ===
    holderName: { name: 'Nom du produit', icon: '🏷️', desc: 'Nom principal affiché' },
    rating: { name: 'Note globale', icon: '⭐', desc: 'Score de 0 à 10' },
    image: { name: 'Image principale', icon: '🖼️', desc: 'Photo du produit' },
    description: { name: 'Description', icon: '📄', desc: 'Texte descriptif' },
    type: { name: 'Type de produit', icon: '📦', desc: 'Fleur, Concentré, Hash...' },
    category: { name: 'Catégorie', icon: '📂', desc: 'Classification du produit' },

    // === IDENTITÉ ===
    title: { name: 'Titre / Nom commercial', icon: '📝', desc: 'Titre alternatif' },
    author: { name: 'Auteur', icon: '👤', desc: 'Auteur de la review' },
    ownerName: { name: 'Publié par', icon: '🧾', desc: 'Propriétaire du contenu' },
    date: { name: 'Date de publication', icon: '📅', desc: 'Date de création' },
    tags: { name: 'Tags', icon: '🏷️', desc: 'Mots-clés associés' },
    images: { name: 'Galerie d\'images', icon: '📷', desc: 'Photos additionnelles' },
    mainImage: { name: 'Couverture', icon: '🖼️', desc: 'Image mise en avant' },

    // === PROVENANCE ===
    cultivar: { name: 'Cultivar', icon: '🌱', desc: 'Variété cultivée' },
    cultivarsList: { name: 'Liste des cultivars', icon: '🌿', desc: 'Toutes les variétés' },
    breeder: { name: 'Breeder / Génétique', icon: '🧬', desc: 'Créateur de la génétique' },
    farm: { name: 'Farm / Producteur', icon: '🏡', desc: 'Lieu de production' },
    hashmaker: { name: 'Hash Maker', icon: '👨‍🔬', desc: 'Artisan extracteur' },
    origin: { name: 'Origine', icon: '🌍', desc: 'Provenance géographique' },
    country: { name: 'Pays', icon: '🗺️', desc: 'Pays d\'origine' },
    region: { name: 'Région', icon: '📍', desc: 'Région de production' },

    // === NOTES ===
    overallRating: { name: 'Note globale (alt)', icon: '⭐', desc: 'Score global alternatif' },
    categoryRatings: { name: 'Notes détaillées', icon: '📊', desc: 'Toutes les notes par critère' },
    'categoryRatings.visual': { name: 'Note Visuel', icon: '👁️', desc: 'Apparence, couleur, texture' },
    'categoryRatings.smell': { name: 'Note Odeur', icon: '👃', desc: 'Intensité et qualité aromatique' },
    'categoryRatings.taste': { name: 'Note Goût', icon: '👅', desc: 'Saveurs et persistance' },
    'categoryRatings.effects': { name: 'Note Effets', icon: '⚡', desc: 'Puissance et qualité' },
    ratings: { name: 'Toutes les notes', icon: '📋', desc: 'Vue complète des scores' },
    qualityScore: { name: 'Score qualité', icon: '🏆', desc: 'Indicateur global' },

    // === SENSORIEL ===
    terpenes: { name: 'Terpènes', icon: '🍃', desc: 'Profil terpénique' },
    aromas: { name: 'Arômes', icon: '🌸', desc: 'Notes olfactives' },
    tastes: { name: 'Goûts', icon: '👅', desc: 'Notes gustatives' },
    effects: { name: 'Effets', icon: '✨', desc: 'Effets ressentis' },
    aromasIntensity: { name: 'Intensité arômes', icon: '💨', desc: 'Force des arômes (1-5)' },
    tastesIntensity: { name: 'Intensité goûts', icon: '🔥', desc: 'Force des goûts (1-5)' },
    effectsIntensity: { name: 'Intensité effets', icon: '💪', desc: 'Force des effets (1-5)' },
    flavors: { name: 'Saveurs', icon: '🍇', desc: 'Notes de dégustation' },
    smell: { name: 'Odeur', icon: '👃', desc: 'Description olfactive' },
    taste: { name: 'Goût (simple)', icon: '👅', desc: 'Description gustative' },

    // === TECHNIQUE ===
    thcLevel: { name: 'Niveau THC', icon: '🔬', desc: 'Taux de THC (%)' },
    cbdLevel: { name: 'Niveau CBD', icon: '💊', desc: 'Taux de CBD (%)' },
    strainType: { name: 'Type (Indica/Sativa)', icon: '🧪', desc: 'Classification génétique' },
    indicaRatio: { name: 'Ratio Indica', icon: '⚖️', desc: 'Pourcentage Indica' },
    sativaRatio: { name: 'Ratio Sativa', icon: '⚖️', desc: 'Pourcentage Sativa' },
    dureeEffet: { name: 'Durée des effets', icon: '⏱️', desc: 'Temps d\'action' },
    purgevide: { name: 'Purge à vide', icon: '🫧', desc: 'Méthode de purge' },
    yield: { name: 'Rendement', icon: '📈', desc: 'Production par plante' },
    floweringTime: { name: 'Temps de floraison', icon: '🌺', desc: 'Durée en semaines' },
    harvestDate: { name: 'Date de récolte', icon: '🌾', desc: 'Période de récolte' },

    // === PIPELINES ===
    pipelineExtraction: { name: 'Pipeline Extraction', icon: '⚗️', desc: 'Méthode d\'extraction' },
    pipelineSeparation: { name: 'Pipeline Séparation', icon: '🧪', desc: 'Processus de séparation' },
    pipelinePurification: { name: 'Pipeline Purification', icon: '✨', desc: 'Étapes de purification' },
    fertilizationPipeline: { name: 'Fertilisation', icon: '🌾', desc: 'Protocole nutritif' },
    substratMix: { name: 'Substrat', icon: '🪴', desc: 'Composition du sol' },
    curing: { name: 'Curing', icon: '🫙', desc: 'Affinage / Séchage lent' },
    drying: { name: 'Séchage', icon: '💨', desc: 'Méthode de séchage' },
    processing: { name: 'Transformation', icon: '⚙️', desc: 'Traitement appliqué' },

    // === EXTRA ===
    extraData: { name: 'Données supplémentaires', icon: '📎', desc: 'Informations diverses' },
    notes: { name: 'Notes personnelles', icon: '📝', desc: 'Remarques du reviewer' },
    comments: { name: 'Commentaires', icon: '💬', desc: 'Avis utilisateurs' },
    recommendations: { name: 'Recommandations', icon: '✅', desc: 'Conseils d\'utilisation' },
    warnings: { name: 'Avertissements', icon: '⚠️', desc: 'Mises en garde' },
    certifications: { name: 'Certifications', icon: '📜', desc: 'Labels et certifs' },
    awards: { name: 'Récompenses', icon: '🏆', desc: 'Prix obtenus' },
    labResults: { name: 'Analyses labo', icon: '🔬', desc: 'Résultats de tests' }
};

// Présets rapides par type de review
const QUICK_PRESETS = {
    minimal: {
        name: '🎯 Minimal',
        desc: 'Essentiel uniquement',
        modules: ['holderName', 'rating', 'image', 'type']
    },
    standard: {
        name: '📋 Standard',
        desc: 'Review classique',
        modules: ['holderName', 'rating', 'image', 'description', 'type', 'category', 'aromas', 'effects', 'terpenes', 'categoryRatings']
    },
    complete: {
        name: '📊 Complète',
        desc: 'Toutes les infos',
        modules: ['holderName', 'rating', 'image', 'description', 'type', 'category', 'cultivar', 'breeder', 'farm', 'aromas', 'tastes', 'effects', 'terpenes', 'categoryRatings', 'thcLevel', 'cbdLevel', 'strainType']
    },
    hash: {
        name: '🟤 Hash/Concentré',
        desc: 'Optimisé extraction',
        modules: ['holderName', 'rating', 'image', 'description', 'type', 'hashmaker', 'cultivarsList', 'pipelineExtraction', 'pipelinePurification', 'aromas', 'effects', 'categoryRatings', 'purgevide']
    },
    grower: {
        name: '🌱 Grower',
        desc: 'Focus cultivation',
        modules: ['holderName', 'rating', 'image', 'description', 'cultivar', 'breeder', 'farm', 'fertilizationPipeline', 'substratMix', 'yield', 'floweringTime', 'strainType', 'terpenes']
    },
    social: {
        name: '📱 Social Media',
        desc: 'Pour Instagram/Stories',
        modules: ['holderName', 'rating', 'image', 'type', 'effects', 'aromas']
    }
};

// Couleurs par catégorie
const CATEGORY_COLORS = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300',
    pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300',
    orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300',
    gray: 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT MODULE DRAGGABLE
// ═══════════════════════════════════════════════════════════════════════════════

function SortableModule({ id, module, isVisible, onToggle, compact = false }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto'
    };

    if (!module) {
        module = { name: id, icon: '📦', desc: 'Module personnalisé' };
    }

    if (compact) {
        return (
            <motion.div
                ref={setNodeRef}
                style={style}
                whileHover={{ scale: 1.02 }}
                className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isVisible
                        ? 'bg-purple-100 dark:bg-purple-900/40 border border-purple-400 dark:border-purple-600'
                        : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60'
                    }
                `}
                onClick={onToggle}
            >
                <span className="text-sm">{module.icon}</span>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {module.name}
                </span>
                {isVisible && (
                    <span className="ml-auto text-purple-500">✓</span>
                )}
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                flex items-center gap-3 p-3 rounded-xl transition-all shadow-sm
                ${isVisible
                    ? 'bg-white dark:bg-gray-800 border-2 border-purple-500 shadow-purple-100 dark:shadow-purple-900/20'
                    : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                }
                ${isDragging ? 'shadow-lg ring-2 ring-purple-500' : ''}
            `}
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Glisser pour réorganiser"
            >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
                </svg>
            </button>

            {/* Icon et label */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-lg flex-shrink-0">{module.icon}</span>
                    <span className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {module.name}
                    </span>
                </div>
                {module.desc && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate pl-7">
                        {module.desc}
                    </p>
                )}
            </div>

            {/* Toggle */}
            <button
                onClick={onToggle}
                className={`
                    relative w-12 h-6 rounded-full transition-all flex-shrink-0
                    ${isVisible
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }
                `}
                title={isVisible ? 'Désactiver' : 'Activer'}
            >
                <motion.span
                    layout
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
                    animate={{ left: isVisible ? '1.625rem' : '0.125rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </button>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT CATÉGORIE PLIABLE
// ═══════════════════════════════════════════════════════════════════════════════

function CategorySection({ category, categoryKey, modules, contentModules, onToggle, expanded, onExpandToggle }) {
    const activeCount = category.modules.filter(m => contentModules[m]).length;
    const totalCount = category.modules.length;
    const colorClass = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.gray;

    const toggleAll = (enable) => {
        category.modules.forEach(moduleName => {
            if (enable && !contentModules[moduleName]) {
                onToggle(moduleName);
            } else if (!enable && contentModules[moduleName]) {
                onToggle(moduleName);
            }
        });
    };

    return (
        <div className={`rounded-xl border overflow-hidden ${colorClass}`}>
            {/* Header */}
            <button
                onClick={onExpandToggle}
                className="w-full flex items-center justify-between p-3 hover:bg-white/30 dark:hover:bg-black/20 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <motion.span
                        animate={{ rotate: expanded ? 90 : 0 }}
                        className="text-sm"
                    >
                        ▶
                    </motion.span>
                    <span className="font-semibold text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs opacity-75">{category.description}</span>
                    <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${activeCount > 0 ? 'bg-white/50 dark:bg-black/30' : 'bg-black/10 dark:bg-white/10'}
                    `}>
                        {activeCount}/{totalCount}
                    </span>
                </div>
            </button>

            {/* Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 pt-0 space-y-2">
                            {/* Quick actions pour la catégorie */}
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => toggleAll(true)}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-white/50 dark:bg-black/30 hover:bg-white/70 dark:hover:bg-black/50 transition-colors font-medium"
                                >
                                    ✓ Tout activer
                                </button>
                                <button
                                    onClick={() => toggleAll(false)}
                                    className="flex-1 text-xs py-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors font-medium"
                                >
                                    ✕ Tout désactiver
                                </button>
                            </div>

                            {/* Modules grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {category.modules.map(moduleName => {
                                    const module = modules[moduleName] || { name: moduleName, icon: '📦' };
                                    return (
                                        <SortableModule
                                            key={moduleName}
                                            id={moduleName}
                                            module={module}
                                            isVisible={contentModules[moduleName]}
                                            onToggle={() => onToggle(moduleName)}
                                            compact
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export default function ContentModuleControls() {
    const config = useOrchardStore((state) => state.config);
    const toggleContentModule = useOrchardStore((state) => state.toggleContentModule);
    const reorderModules = useOrchardStore((state) => state.reorderModules);
    const setContentModules = useOrchardStore((state) => state.setContentModules);

    const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'list' | 'search'
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({ essential: true });
    const [showPresets, setShowPresets] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Filtrer les modules par recherche
    const filteredModules = useMemo(() => {
        if (!searchQuery.trim()) return config.moduleOrder;
        const query = searchQuery.toLowerCase();
        return config.moduleOrder.filter(moduleName => {
            const module = MODULE_LABELS[moduleName];
            if (!module) return moduleName.toLowerCase().includes(query);
            return (
                module.name.toLowerCase().includes(query) ||
                (module.desc && module.desc.toLowerCase().includes(query)) ||
                moduleName.toLowerCase().includes(query)
            );
        });
    }, [config.moduleOrder, searchQuery]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = config.moduleOrder.indexOf(active.id);
            const newIndex = config.moduleOrder.indexOf(over.id);
            const newOrder = arrayMove(config.moduleOrder, oldIndex, newIndex);
            reorderModules(newOrder);
        }
    };

    const applyPreset = (presetKey) => {
        const preset = QUICK_PRESETS[presetKey];
        if (!preset) return;

        // Désactiver tous les modules d'abord
        const newModules = {};
        Object.keys(config.contentModules).forEach(key => {
            newModules[key] = false;
        });

        // Activer ceux du preset
        preset.modules.forEach(moduleName => {
            newModules[moduleName] = true;
        });

        if (setContentModules) {
            setContentModules(newModules);
        } else {
            // Fallback si setContentModules n'existe pas
            Object.keys(config.contentModules).forEach(key => {
                if (config.contentModules[key] && !preset.modules.includes(key)) {
                    toggleContentModule(key);
                } else if (!config.contentModules[key] && preset.modules.includes(key)) {
                    toggleContentModule(key);
                }
            });
        }
        setShowPresets(false);
    };

    const toggleCategory = (catKey) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catKey]: !prev[catKey]
        }));
    };

    const visibleCount = Object.values(config.contentModules).filter(Boolean).length;
    const totalCount = Object.keys(config.contentModules).length;

    return (
        <div className="space-y-4">
            {/* Header avec stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        📦 Modules de Contenu
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Choisissez les éléments à afficher
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold">
                        {visibleCount}/{totalCount}
                    </span>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value) setViewMode('search');
                        else setViewMode('categories');
                    }}
                    placeholder="🔍 Rechercher un module..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(''); setViewMode('categories'); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Toggle vue + Presets */}
            <div className="flex gap-2">
                <div className="flex-1 flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setViewMode('categories')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'categories'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        📂 Catégories
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'list'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        📋 Liste
                    </button>
                </div>
                <button
                    onClick={() => setShowPresets(!showPresets)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors ${showPresets
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    ⚡ Presets
                </button>
            </div>

            {/* Presets rapides */}
            <AnimatePresence>
                {showPresets && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-2 overflow-hidden"
                    >
                        {Object.entries(QUICK_PRESETS).map(([key, preset]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => applyPreset(key)}
                                className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 text-left hover:border-purple-400 transition-colors"
                            >
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                    {preset.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {preset.desc}
                                </div>
                                <div className="text-xs text-purple-500 mt-1">
                                    {preset.modules.length} modules
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Vue par catégories */}
            {viewMode === 'categories' && !searchQuery && (
                <div className="space-y-3">
                    {Object.entries(MODULE_CATEGORIES).map(([catKey, category]) => (
                        <CategorySection
                            key={catKey}
                            category={category}
                            categoryKey={catKey}
                            modules={MODULE_LABELS}
                            contentModules={config.contentModules}
                            onToggle={toggleContentModule}
                            expanded={expandedCategories[catKey] || false}
                            onExpandToggle={() => toggleCategory(catKey)}
                        />
                    ))}
                </div>
            )}

            {/* Vue liste avec drag & drop */}
            {(viewMode === 'list' || viewMode === 'search') && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>⚡ Glissez pour réorganiser</span>
                        <span>{filteredModules.length} modules</span>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredModules}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                {filteredModules.map((moduleName) => (
                                    <SortableModule
                                        key={moduleName}
                                        id={moduleName}
                                        module={MODULE_LABELS[moduleName]}
                                        isVisible={config.contentModules[moduleName]}
                                        onToggle={() => toggleContentModule(moduleName)}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {filteredModules.length === 0 && searchQuery && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <span className="text-3xl mb-2 block">🔍</span>
                            <p className="text-sm">Aucun module trouvé pour "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            )}

            {/* Actions globales */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        Object.keys(config.contentModules).forEach(key => {
                            if (!config.contentModules[key]) toggleContentModule(key);
                        });
                    }}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm"
                >
                    ✓ Tout afficher
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        Object.keys(config.contentModules).forEach(key => {
                            if (config.contentModules[key]) toggleContentModule(key);
                        });
                    }}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    ✕ Tout masquer
                </motion.button>
            </div>
        </div>
    );
}
