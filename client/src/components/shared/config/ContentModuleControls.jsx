import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';
import { getFieldRegistry, GROUPS, GROUP_LABELS } from '../../../utils/fieldRegistry';

// ═══════════════════════════════════════════════════════════════════════════════
// Ce panneau pilote `config.contentModules[<clé canonique>]` — LES MÊMES clés que
// lisent les templates (contentModules.thcLevel, .cultivar, .effects, .categoryRatings…).
// Il dérive entièrement de fieldRegistry.js : plus de vocabulaire pointé fantôme
// (analytics.thcLevel, texture.hardness) qui ne pilotait rien et comptait faux.
// ═══════════════════════════════════════════════════════════════════════════════

const GROUP_ICONS = {
    presentation: '🖼️', general: '📋', genetics: '🧬', culture: '🌱', harvest: '🌾',
    analytics: '🔬', lab: '🧪', visual: '👁️', smell: '👃', texture: '✋', taste: '👅',
    effects: '⚡', usage: '💨', curing: '🫙', separation: '🧊', extraction: '⚗️',
    purification: '💧', recipe: '🍯', traceability: '🔗',
};

const GROUP_COLORS = {
    presentation: 'slate', general: 'gray', genetics: 'violet', culture: 'lime',
    harvest: 'amber', analytics: 'cyan', lab: 'blue', visual: 'purple', smell: 'green',
    texture: 'orange', taste: 'yellow', effects: 'cyan', usage: 'pink', curing: 'emerald',
    separation: 'blue', extraction: 'violet', purification: 'cyan', recipe: 'amber',
    traceability: 'slate',
};

const CATEGORY_COLORS = {
    purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300',
    green: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300',
    pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 text-pink-700 dark:text-pink-300',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300',
    orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300',
    gray: 'bg-gray-100 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300',
    violet: 'bg-violet-100 dark:bg-violet-900/30 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300',
    lime: 'bg-lime-100 dark:bg-lime-900/30 border-lime-300 dark:border-lime-700 text-lime-700 dark:text-lime-300',
    slate: 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
};

// ── Détection de données réelle, via les `sources[]` du registre ─────────────────
function isFilled(v) {
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    return true;
}

function fieldHasData(reviewData, field) {
    if (!reviewData || !field) return false;
    for (const s of field.sources) {
        if (isFilled(reviewData[s])) return true;
        if (reviewData.extraData && typeof reviewData.extraData === 'object' && isFilled(reviewData.extraData[s])) return true;
    }
    // Un sous-score contribue à categoryRatings : présent si sa catégorie l'a reconstruit
    if (field.cat && reviewData.categoryRatings && typeof reviewData.categoryRatings === 'object') {
        const catObj = reviewData.categoryRatings[field.cat];
        if (typeof catObj === 'number' && !isNaN(catObj)) return true;
        if (catObj && typeof catObj === 'object' && isFilled(catObj[field.key])) return true;
    }
    return false;
}

// ── Un module (toggle) ───────────────────────────────────────────────────────────
function ModuleToggle({ field, isVisible, hasData, onToggle }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${isVisible ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-300 dark:border-purple-700' : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-70'}`}
            onClick={onToggle}
            title={hasData ? 'Données disponibles' : 'Aucune donnée pour cette review'}
        >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${hasData ? 'bg-green-400 shadow-sm shadow-green-400/50' : 'bg-gray-400/40'}`} />
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                {field.label}{field.unit ? <span className="opacity-50"> ({field.unit})</span> : null}
            </span>
            {isVisible && <span className="ml-auto text-purple-500 text-xs">✓</span>}
        </motion.div>
    );
}

// ── Une catégorie pliable ─────────────────────────────────────────────────────────
function CategorySection({ category, contentModules, reviewData, onToggle, onToggleAll, expanded, onExpandToggle }) {
    const activeCount = category.fields.filter((f) => contentModules[f.key]).length;
    const totalCount = category.fields.length;
    const dataCount = reviewData ? category.fields.filter((f) => fieldHasData(reviewData, f)).length : null;
    const colorClass = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.gray;

    return (
        <div className={`rounded-xl border overflow-hidden ${colorClass}`}>
            <button onClick={onExpandToggle} className="w-full flex items-center justify-between p-3 hover:bg-white/30 dark:hover:bg-black/20 transition-colors">
                <div className="flex items-center gap-2">
                    <motion.span animate={{ rotate: expanded ? 90 : 0 }} className="text-sm">▶</motion.span>
                    <span className="text-base">{category.icon}</span>
                    <span className="font-semibold text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    {dataCount !== null && (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${dataCount > 0 ? 'bg-green-500/20 text-green-500 dark:text-green-300' : 'bg-black/10 dark:bg-white/5 text-gray-400'}`}
                              title={`${dataCount} champ(s) avec données`}>
                            {dataCount > 0 ? `📊${dataCount}` : '∅'}
                        </span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeCount > 0 ? 'bg-white/50 dark:bg-black/30' : 'bg-black/10 dark:bg-white/10'}`}>
                        {activeCount}/{totalCount}
                    </span>
                </div>
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="p-3 pt-0 space-y-2">
                            <div className="flex gap-2 mb-3">
                                <button onClick={() => onToggleAll(category, true)} className="flex-1 text-xs py-1.5 rounded-lg bg-white/50 dark:bg-black/30 hover:bg-white/70 dark:hover:bg-black/50 transition-colors font-medium">✓ Tout activer</button>
                                <button onClick={() => onToggleAll(category, false)} className="flex-1 text-xs py-1.5 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 transition-colors font-medium">✕ Tout désactiver</button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {category.fields.map((f) => (
                                    <ModuleToggle
                                        key={f.key}
                                        field={f}
                                        isVisible={!!contentModules[f.key]}
                                        hasData={reviewData ? fieldHasData(reviewData, f) : false}
                                        onToggle={() => onToggle(f.key)}
                                    />
                                ))}
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

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState({ presentation: true, general: true });

    const productType = (reviewData && (reviewData.type || reviewData.productType || reviewData.typeProduit)) || 'flower';

    // Catégories = groupes du registre, dans l'ordre GROUPS, filtrés au type de produit
    const categories = useMemo(() => {
        const fields = getFieldRegistry(productType);
        const byGroup = {};
        for (const f of fields) {
            (byGroup[f.group] = byGroup[f.group] || []).push(f);
        }
        return GROUPS
            .filter((g) => byGroup[g] && byGroup[g].length > 0)
            .map((g) => ({
                key: g,
                name: GROUP_LABELS[g] || g,
                icon: GROUP_ICONS[g] || '📦',
                color: GROUP_COLORS[g] || 'gray',
                fields: byGroup[g],
            }));
    }, [productType]);

    const allFields = useMemo(() => categories.flatMap((c) => c.fields), [categories]);

    const filteredFields = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        return allFields.filter((f) => f.label.toLowerCase().includes(q) || f.key.toLowerCase().includes(q));
    }, [searchQuery, allFields]);

    const contentModules = config.contentModules || {};
    const visibleCount = allFields.filter((f) => contentModules[f.key]).length;
    const totalCount = allFields.length;
    const dataCount = reviewData ? allFields.filter((f) => fieldHasData(reviewData, f)).length : null;

    const toggleCategory = (key) => setExpandedCategories((p) => ({ ...p, [key]: !p[key] }));

    const handleToggleAll = (category, enable) => {
        category.fields.forEach((f) => {
            const on = !!contentModules[f.key];
            if (enable && !on) toggleContentModule(f.key);
            else if (!enable && on) toggleContentModule(f.key);
        });
    };

    const setAll = (enable) => {
        allFields.forEach((f) => {
            const on = !!contentModules[f.key];
            if (enable && !on) toggleContentModule(f.key);
            else if (!enable && on) toggleContentModule(f.key);
        });
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">📦 Modules de Contenu</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Choisissez les éléments à afficher</p>
                </div>
                <div className="flex items-center gap-2">
                    {dataCount !== null && (
                        <span className="px-2 py-1 rounded-full bg-green-500/15 text-green-500 dark:text-green-400 text-xs font-bold" title="Champs avec données">📊 {dataCount}</span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold">{visibleCount}/{totalCount}</span>
                </div>
            </div>

            {/* Recherche */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Rechercher un module..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
                )}
            </div>

            {/* Résultats de recherche */}
            {searchQuery ? (
                <div className="space-y-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{filteredFields.length} module(s)</div>
                    <div className="grid grid-cols-2 gap-2">
                        {filteredFields.map((f) => (
                            <ModuleToggle key={f.key} field={f} isVisible={!!contentModules[f.key]} hasData={reviewData ? fieldHasData(reviewData, f) : false} onToggle={() => toggleContentModule(f.key)} />
                        ))}
                    </div>
                    {filteredFields.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <span className="text-3xl mb-2 block">🔍</span>
                            <p className="text-sm">Aucun module trouvé pour « {searchQuery} »</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Vue par catégories */
                <div className="space-y-3">
                    {categories.map((category) => (
                        <CategorySection
                            key={category.key}
                            category={category}
                            contentModules={contentModules}
                            reviewData={reviewData}
                            onToggle={toggleContentModule}
                            onToggleAll={handleToggleAll}
                            expanded={expandedCategories[category.key] || false}
                            onExpandToggle={() => toggleCategory(category.key)}
                        />
                    ))}
                </div>
            )}

            {/* Actions globales */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setAll(true)} className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:shadow-lg transition-all shadow-sm">✓ Tout afficher</motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setAll(false)} className="flex-1 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">✕ Tout masquer</motion.button>
            </div>
        </div>
    );
}
