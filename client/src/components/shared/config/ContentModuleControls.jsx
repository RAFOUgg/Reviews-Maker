import { useState, useMemo } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';
import { getCategoryFieldsByType, getExportSectionsByType } from '../../../utils/orchard/productTypeMappings';
import { getModulesByProductType, getModuleSectionsByProductType } from '../../../utils/orchard/moduleMappings';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION COMPLÈTE DES MODULES PAR CATÉGORIE
// ═══════════════════════════════════════════════════════════════════════════════


// `MODULE_LABELS` has been migrated to runtime metadata built from
// the authoritative `moduleMappings.js` sections. Humanized fallbacks
// are used when no explicit label/icon is available.



// Couleurs par catégorie
const CATEGORY_COLORS = {
    purple: ' dark:  dark:  dark:',
    blue: ' dark:  dark:  dark:',
    green: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300',
    pink: ' dark: border-pink-300 dark:border-pink-700  dark:',
    cyan: ' dark: border-cyan-300 dark:border-cyan-700  dark:',
    orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300',
    gray: 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
    red: 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300',
    violet: ' dark: border-violet-300 dark:border-violet-700  dark:',
    lime: 'bg-lime-100 dark:bg-lime-900/30 border-lime-300 dark:border-lime-700 text-lime-700 dark:text-lime-300',
    slate: 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
};

// DEPRECATED: `MODULE_CATEGORIES` (above) is obsolete —
// keep it for compatibility but prefer sections defined in
// `moduleMappings.js`. Build computed categories at runtime
// so new review types / sections are reflected automatically.
import { getModuleSectionsByProductType } from '../../../utils/orchard/moduleMappings';

/**
 * Build categories from the canonical module sections for a given product type.
 * Returns an array of category objects: { key, name, description, color, modules }
 */
function buildComputedCategories(productType) {
    try {
        const sections = getModuleSectionsByProductType(productType) || [];
        return sections.map((s, idx) => {
            const key = s.id || s.key || `section_${idx}`;
            return {
                key,
                name: s.name || s.title || key,
                description: s.description || s.desc || '',
                color: s.color || 'gray',
                modules: Array.isArray(s.modules) ? s.modules : (s.items || [])
            };
        });
    } catch (e) {
        // If moduleMappings lookup fails, return empty array (no fallback)
        return [];
    }
}


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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${isVisible ? ' dark: border dark:' : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60'}`}
                onClick={onToggle}
            >
                <span className="text-sm">{module.icon}</span>
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                    {module.name}
                </span>
                {isVisible && (
                    <span className="ml-auto">✓</span>
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
            className={`flex items-center gap-3 p-3 rounded-xl transition-all shadow-sm ${isVisible ? 'bg-white dark:bg-gray-800 border-2 shadow-purple-100 dark:shadow-purple-900/20' : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'} ${isDragging ? 'shadow-lg ring-2 ' : ''}`}
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
                className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${isVisible ? 'bg-gradient-to-r ' : 'bg-gray-300 dark:bg-gray-600'}`}
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeCount > 0 ? 'bg-white/50 dark:bg-black/30' : 'bg-black/10 dark:bg-white/10'}`}>
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
    const reviewData = useOrchardStore((state) => state.reviewData);
    const toggleContentModule = useOrchardStore((state) => state.toggleContentModule);
    const reorderModules = useOrchardStore((state) => state.reorderModules);
    const setContentModules = useOrchardStore((state) => state.setContentModules);

    const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'list' | 'search'
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({ essential: true });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Helper to produce humanized labels when metadata is missing
    const humanize = (id) => {
        if (!id) return id;
        const s = id.replace(/\./g, ' ').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
        return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Build dynamic module metadata from canonical mappings when possible
    const moduleMeta = useMemo(() => {
        const meta = {};
        Array.from(relevantModulesSet).forEach(id => {
            // try to pick label data from getModuleSectionsByProductType via sections
            // but fallback to a humanized name/icon
            meta[id] = {
                name: humanize(id),
                icon: '📦',
                desc: ''
            };
        });
        return meta;
    }, [relevantModulesSet]);

    // Filtrer les modules par recherche
    const filteredModules = useMemo(() => {
        if (!searchQuery.trim()) return config.moduleOrder;
        const query = searchQuery.toLowerCase();
        return config.moduleOrder.filter(moduleName => {
            const module = moduleMeta[moduleName];
            if (!module) return moduleName.toLowerCase().includes(query);
            return (
                module.name.toLowerCase().includes(query) ||
                (module.desc && module.desc.toLowerCase().includes(query)) ||
                moduleName.toLowerCase().includes(query)
            );
        });
    }, [config.moduleOrder, searchQuery, moduleMeta]);

    // Determine relevant modules based on current product type (from reviewData)
    const productType = (reviewData && reviewData.type) ? reviewData.type : 'flower';
    // Build a Set of modules allowed for this product type for fast lookups
    const relevantModulesSet = useMemo(() => new Set(getModulesByProductType(productType)), [productType]);

    // Build categories from moduleMappings sections for this product type first.
    // This ensures any section added/edited in `moduleMappings.js` is reflected
    // directly in the Export UI. We then merge remaining UI categories to show
    // any modules not covered by explicit sections.
    const computedCategories = useMemo(() => {
        const sections = getModuleSectionsByProductType(productType) || [];

        // Convert sections into category-like objects
        const sectionCategories = sections.map(sec => ({
            key: `sec_${sec.id}`,
            name: sec.label || sec.name || sec.id,
            description: sec.access || '',
            color: 'gray',
            modules: (sec.fields || []).filter(f => relevantModulesSet.has(f))
        })).filter(c => c.modules && c.modules.length > 0);

        // Only use sections defined for the product type — no legacy fallbacks.
        return sectionCategories;
    }, [productType, relevantModulesSet]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = config.moduleOrder.indexOf(active.id);
            const newIndex = config.moduleOrder.indexOf(over.id);
            const newOrder = arrayMove(config.moduleOrder, oldIndex, newIndex);
            reorderModules(newOrder);
        }
    };


    const toggleCategory = (catKey) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catKey]: !prev[catKey]
        }));
    };

    const visibleCount = Object.keys(config.contentModules).filter(k => relevantModulesSet.has(k) && config.contentModules[k]).length;
    const totalCount = Array.from(relevantModulesSet).filter(k => k && (config.contentModules.hasOwnProperty(k) || moduleMeta[k])).length;

    // `moduleMeta` and `humanize` are defined earlier to provide runtime
    // metadata for modules (labels/icons) with sensible fallbacks.

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
                    <span className="px-3 py-1 rounded-full dark: dark: text-sm font-bold">
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus: focus:border-transparent"
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
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'categories' ? ' text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        📂 Catégories
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${viewMode === 'list' ? ' text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        📋 Liste
                    </button>
                </div>
                {/* Presets removed — QUICK_PRESETS deleted (breaking change) */}
            </div>

            {/* Presets removed */}

            {/* Vue par catégories */}
            {viewMode === 'categories' && !searchQuery && (
                <div className="space-y-3">
                    {computedCategories.map((category) => {
                        const catCopy = { ...category };
                        return (
                            <CategorySection
                                key={category.key}
                                category={catCopy}
                                categoryKey={category.key}
                                modules={moduleMeta}
                                contentModules={config.contentModules}
                                onToggle={toggleContentModule}
                                expanded={expandedCategories[category.key] || false}
                                onExpandToggle={() => toggleCategory(category.key)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Vue liste avec drag & drop */}
            {(viewMode === 'list' || viewMode === 'search') && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>⚡ Glissez pour réorganiser</span>
                        <span>{filteredModules.filter(m => relevantModulesSet.has(m)).length} modules</span>
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
                                {filteredModules.filter(m => relevantModulesSet.has(m)).map((moduleName) => (
                                    <SortableModule
                                        key={moduleName}
                                        id={moduleName}
                                        module={moduleMeta[moduleName] || { name: humanize(moduleName), icon: '📦', desc: '' }}
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
                        Array.from(relevantModulesSet).forEach(key => {
                            if (!config.contentModules[key]) toggleContentModule(key);
                        });
                    }}
                    className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r text-white text-sm font-medium hover: hover: transition-all shadow-sm"
                >
                    ✓ Tout afficher
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        Array.from(relevantModulesSet).forEach(key => {
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




