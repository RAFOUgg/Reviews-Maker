/**
 * ContentPanel Component
 * Panel gauche affichant TOUS les champs draggables disponibles pour l'Aperçu Export Maker
 * Version complète avec tous les champs détaillés par catégorie
 */

import { useMemo, useState } from 'react';
import { useStore } from '../../../store/useStore';
import { useExportMakerPagesStore } from '../../../store/exportMakerPagesStore';
import { getFieldRegistry, getAllFields, getOverflowFields, GROUPS, GROUP_LABELS } from '../../../utils/fieldRegistry';
import PropTypes from 'prop-types';

// Types de champs disponibles pour le drag & drop (utilisé par dnd-kit ou react-dnd)
export const DRAGGABLE_FIELD_TYPES = {
    ORCHARD_FIELD: 'ORCHARD_FIELD'
};

// ============================================================================
// CHAMPS DRAGGABLES — dérivés de `fieldRegistry.js` (2026-07-30, Chantier C2)
// ============================================================================
// Avant ce jour, ce panneau utilisait sa PROPRE taxonomie de champs codée à la main (noms de
// formData legacy type `densite`/`durete`/`categoryRatings.visual`), une 2e source de vérité
// parallèle à `fieldRegistry.js` (déjà la référence unique pour les 5 templates réels) — elle ne
// fonctionnait qu'accidentellement, `exportDataAdapter.js` remontant aussi les clés brutes de
// reviewData en plus des clés canoniques. `GROUP_LABELS` existait déjà dans le registre avec le
// commentaire "pour l'UI du panneau Contenu" sans jamais y être branché — fait maintenant.
//
// Types UI (slider/tags/pipeline/rating/...) dérivés du `type` du registre (score/percent/number/
// list/rich/text/...), pas devinés à la main.
const REGISTRY_TYPE_TO_UI_TYPE = {
    score: 'rating',
    percent: 'slider',
    number: 'text',
    list: 'tags',
    rich: 'json',
    bool: 'boolean',
    date: 'date',
    url: 'text',
    view: 'pipeline',
    text: 'text',
};

const GROUP_ICONS = {
    presentation: '🖼️', general: '📋', genetics: '🧬', culture: '🌱', harvest: '🌾',
    analytics: '🔬', lab: '🧪', visual: '👁️', smell: '👃', texture: '🤚', taste: '👅',
    effects: '⚡', usage: '💨', curing: '🔥', separation: '🧊', extraction: '⚗️',
    purification: '💧', recipe: '🍯', traceability: '🔗', overflow: '➕',
};

// Groupes réservés aux comptes Influenceur/Producteur (mêmes catégories "avancées" que l'ancien
// filtrage par compte, approximées sur la nouvelle taxonomie de groupes plutôt que reconduites
// depuis `productTypeMappings.js` — supprimé de ce fichier, 3e taxonomie parallèle devenue inutile).
const ADVANCED_GROUPS = new Set(['analytics', 'lab', 'culture', 'harvest', 'separation', 'extraction', 'purification', 'recipe', 'curing']);

/** Construit la structure `{groupKey: [{id,label,icon,type}]}` pour un type de produit + review. */
function buildDraggableFields(productType, reviewData, accountType) {
    const isAdvancedAccount = accountType === 'influenceur' || accountType === 'influencer' || accountType === 'producteur' || accountType === 'producer';
    const byGroup = {};
    getFieldRegistry(productType).forEach((f) => {
        if (f.type === 'score') return; // catégories de score gérées via `categoryRatings` (presentation)
        if (ADVANCED_GROUPS.has(f.group) && !isAdvancedAccount) return;
        if (!byGroup[f.group]) byGroup[f.group] = [];
        byGroup[f.group].push({ id: f.key, label: f.label, icon: GROUP_ICONS[f.group] || '📦', type: REGISTRY_TYPE_TO_UI_TYPE[f.type] || 'text' });
    });
    // Champs réels non curés (nouveau champ de formulaire sans entrée registre) — mêmes filtres
    // que les templates réels via `getOverflowFields`, groupés à part.
    const overflow = getOverflowFields(reviewData || {});
    if (overflow.length > 0) {
        byGroup.overflow = overflow.map((f) => ({ id: f.key, label: f.label, icon: GROUP_ICONS.overflow, type: REGISTRY_TYPE_TO_UI_TYPE[f.type] || 'text' }));
    }
    return byGroup;
}

// Labels de section pour l'affichage — repris tels quels de `GROUP_LABELS` (même registre que les
// 5 templates réels), pas une traduction ad-hoc séparée.
const SECTION_LABELS = Object.fromEntries(
    [...GROUPS, 'overflow'].map((g) => [g, `${GROUP_ICONS[g] || '📦'} ${GROUP_LABELS[g] || g}`])
);

// Recherche un champ déjà posé sur le canevas par son id, tous types de produit confondus (un
// champ placé appartenait forcément à un type de produit valide au moment du dépôt) — utilisé par
// `CustomTemplate.jsx`/`CustomLayoutPane.jsx` pour retrouver l'icône/le type d'un champ déjà placé
// sans connaître son groupe. Remplace l'ancienne itération sur `DRAGGABLE_FIELDS` (objet statique
// retiré, cf. `buildDraggableFields` ci-dessus qui a besoin de `productType`/`reviewData`).
export function findFieldDef(id) {
    const found = getAllFields().find((f) => f.key === id);
    if (!found) return { id, label: id, icon: '🔲', type: 'text' };
    return { id: found.key, label: found.label, icon: GROUP_ICONS[found.group] || '📦', type: REGISTRY_TYPE_TO_UI_TYPE[found.type] || 'text' };
}

// Helper pour extraire la valeur d'un champ (gère les chemins comme "categoryRatings.visual")
const getFieldValue = (id, data) => {
    if (!data) return undefined;
    if (id.includes('.')) {
        const parts = id.split('.');
        let val = data;
        for (const p of parts) {
            if (val === undefined || val === null) return undefined;
            val = val[p];
        }
        // Si c'est un objet avec des sous-valeurs (ex: {densite: 6.5, trichome: 5.5})
        // calculer la moyenne
        if (val && typeof val === 'object' && !Array.isArray(val)) {
            const nums = Object.values(val).filter(v => typeof v === 'number');
            if (nums.length > 0) {
                return nums.reduce((a, b) => a + b, 0) / nums.length;
            }
        }
        return val;
    }
    return data[id];
};

// Vérifier si un champ a des données
const hasData = (id, data) => {
    const value = getFieldValue(id, data);
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    if (typeof value === 'number') return true;
    return Boolean(value);
};

// Obtenir un aperçu de la valeur
const getValuePreview = (id, data) => {
    const value = getFieldValue(id, data);
    if (value === undefined || value === null) return null;

    if (Array.isArray(value)) {
        if (value.length === 0) return null;
        const first = typeof value[0] === 'object'
            ? (value[0].name || value[0].label || JSON.stringify(value[0]).slice(0, 20))
            : value[0];
        return value.length > 1 ? `${first} +${value.length - 1}` : String(first);
    }
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        return keys.length > 0 ? `{${keys.slice(0, 2).join(', ')}${keys.length > 2 ? '...' : ''}}` : null;
    }
    if (typeof value === 'number') {
        return value % 1 === 0 ? String(value) : value.toFixed(1);
    }
    if (typeof value === 'string') return value.length > 25 ? value.slice(0, 25) + '...' : value;
    return String(value);
};

// ============================================================================
// COMPOSANTS UI - Utilisant @dnd-kit au lieu de react-dnd
// ============================================================================

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// Composant pour un champ draggable avec @dnd-kit
function DraggableField({ field, isPlaced, hasValue, valuePreview }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: field.id,
        data: { field }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`p-2.5 rounded-lg cursor-grab active:cursor-grabbing transition-all select-none ${isDragging ? 'scale-105 shadow-xl z-50' : 'scale-100'} ${isPlaced ? 'bg-green-500/20 border-green-500 border-2' : hasValue ? 'bg-blue-500/20 border-blue-500/50 border hover:bg-blue-500/30 hover:border-blue-500' : 'bg-gray-700/30 border-gray-600/50 border border-dashed opacity-50'} hover:shadow-lg`}
            title={hasValue ? `Valeur: ${valuePreview}` : 'Aucune donnée'}
        >
            <div className="flex items-center gap-2">
                <span className="text-lg flex-shrink-0">{field.icon}</span>
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium block truncate text-white">{field.label}</span>
                    {hasValue && valuePreview && (
                        <span className="text-[10px] text-green-400/80 block truncate">{valuePreview}</span>
                    )}
                </div>
                {isPlaced && <span className="text-xs text-green-400 flex-shrink-0">✓</span>}
                {hasValue && !isPlaced && <span className="text-[10px] flex-shrink-0">●</span>}
            </div>
        </div>
    );
}

DraggableField.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    }).isRequired,
    isPlaced: PropTypes.bool,
    hasValue: PropTypes.bool,
    valuePreview: PropTypes.string
};

// Section de champs avec titre (collapsible)
function FieldSection({ title, sectionKey, fields, placedFieldIds, reviewData, isOpen, onToggle, showOnlyWithData }) {
    const fieldsToShow = showOnlyWithData
        ? fields.filter(f => hasData(f.id, reviewData))
        : fields;
    const fieldsWithData = fields.filter(f => hasData(f.id, reviewData)).length;

    if (showOnlyWithData && fieldsToShow.length === 0) return null;

    return (
        <div className="mb-3">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
            >
                <span className="text-xs font-bold uppercase tracking-wide">
                    {title}
                </span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-normal">
                        {fieldsWithData}/{fields.length}
                    </span>
                    <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            {isOpen && (
                <div className="mt-2 space-y-1.5 pl-1">
                    {fieldsToShow.map(field => (
                        <DraggableField
                            key={field.id}
                            field={field}
                            isPlaced={placedFieldIds.includes(field.id)}
                            hasValue={hasData(field.id, reviewData)}
                            valuePreview={getValuePreview(field.id, reviewData)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

FieldSection.propTypes = {
    title: PropTypes.string.isRequired,
    sectionKey: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    placedFieldIds: PropTypes.array,
    reviewData: PropTypes.object,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    showOnlyWithData: PropTypes.bool
};

// ============================================================================
// PANEL PRINCIPAL
// ============================================================================

export default function ContentPanel({ reviewData, placedFields, onFieldSelect }) {
    const accountType = useStore(state => state.accountType) || 'amateur';
    const productType = reviewData?.type || reviewData?.productType || 'flower';
    const pages = useExportMakerPagesStore(state => state.pages) || [];

    // Structure {groupe: [{id,label,icon,type}]} dérivée du registre partagé — remplace l'ancienne
    // taxonomie DRAGGABLE_FIELDS codée à la main (cf. commentaire en tête de fichier).
    const draggableFields = useMemo(
        () => buildDraggableFields(productType, reviewData, accountType),
        [productType, reviewData, accountType]
    );
    const sectionOrder = useMemo(() => [...GROUPS, 'overflow'], []);

    // Si des pages STATIQUES sont définies (mode pagination), ne montrer que les champs présents
    // sur au moins une page — les ids de `contentModules`/`pages[].modules` statiques sont déjà les
    // mêmes clés canoniques que celles du registre, donc comparables directement. Les pages
    // ADAPTATIVES (Chantier D, `page.adaptive === true`) sont explicitement exclues de ce filtre :
    // leurs ids (`masthead`, `pipeline:xxx`, `gisement:xxx`...) sont des régions de mise en page
    // mesurées, pas des clés de champ — les comparer au vocabulaire du registre ne laissait passer
    // que les rares coïncidences de nom (ex. `description`), masquant presque tous les champs
    // réels (bug trouvé en vérification, 2026-07-31).
    const modulesFromPages = useMemo(
        () => new Set(pages.filter((p) => !p.adaptive).flatMap((p) => p.modules || [])),
        [pages]
    );

    // État pour les sections ouvertes/fermées — initialisé une fois les groupes réels connus
    const [openSections, setOpenSections] = useState(() => {
        const initial = {};
        sectionOrder.forEach((k) => { initial[k] = ['presentation', 'general'].includes(k); });
        return initial;
    });

    // Filtre: afficher seulement les champs avec données
    const [showOnlyWithData, setShowOnlyWithData] = useState(false);

    // Extraire les IDs des champs déjà placés
    const placedFieldIds = useMemo(() => {
        return (placedFields || []).reduce((acc, f) => {
            acc.push(f.id);
            if (f.assignedFields && Array.isArray(f.assignedFields)) {
                acc.push(...f.assignedFields);
            }
            return acc;
        }, []);
    }, [placedFields]);

    const filteredSectionOrder = useMemo(
        () => sectionOrder.filter((k) => (draggableFields[k] || []).length > 0),
        [sectionOrder, draggableFields]
    );

    const visibleFields = (sectionKey) => {
        const fields = draggableFields[sectionKey] || [];
        return modulesFromPages.size === 0 ? fields : fields.filter((f) => modulesFromPages.has(f.id));
    };

    const totalFieldsWithData = useMemo(() => {
        let count = 0;
        filteredSectionOrder.forEach(sectionKey => {
            visibleFields(sectionKey).forEach(f => { if (hasData(f.id, reviewData)) count++; });
        });
        return count;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reviewData, filteredSectionOrder, modulesFromPages]);

    const totalFields = useMemo(() => {
        let sum = 0;
        filteredSectionOrder.forEach(sectionKey => { sum += visibleFields(sectionKey).length; });
        return sum;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredSectionOrder, modulesFromPages]);

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleAll = (open) => {
        const newState = {};
        Object.keys(openSections).forEach(key => {
            newState[key] = open;
        });
        setOpenSections(newState);
    };

    return (
        <div className="h-full bg-gray-900/95 backdrop-blur-sm flex flex-col border-r border-purple-900/30">
            {/* Header sticky */}
            <div className="sticky top-0 bg-gray-900 p-3 border-b border-purple-900/30 z-20">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <span>📦</span>
                    <span>Contenu Disponible</span>
                </h2>
                <p className="text-xs text-gray-400 mb-3">
                    {totalFieldsWithData}/{totalFields} champs avec données
                </p>

                {/* Contrôles */}
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => toggleAll(true)}
                        className="px-2 py-1 text-[10px] rounded bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                        Tout afficher
                    </button>
                    <button
                        onClick={() => toggleAll(false)}
                        className="px-2 py-1 text-[10px] rounded bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        Tout masquer
                    </button>
                    <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer ml-auto">
                        <input
                            type="checkbox"
                            checked={showOnlyWithData}
                            onChange={(e) => setShowOnlyWithData(e.target.checked)}
                            className="w-3 h-3 rounded"
                        />
                        Remplis uniquement
                    </label>
                </div>
            </div>

            {/* Sections scrollables */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {filteredSectionOrder.map(sectionKey => {
                    const fieldsToRender = visibleFields(sectionKey);
                    if (fieldsToRender.length === 0) return null;
                    return (
                        <FieldSection
                            key={sectionKey}
                            sectionKey={sectionKey}
                            title={SECTION_LABELS[sectionKey] || sectionKey}
                            fields={fieldsToRender}
                            placedFieldIds={placedFieldIds}
                            reviewData={reviewData}
                            isOpen={openSections[sectionKey]}
                            onToggle={() => toggleSection(sectionKey)}
                            showOnlyWithData={showOnlyWithData}
                        />
                    );
                })}
            </div>

            {/* Footer avec actions */}
            <div className="p-3 border-t border-gray-700 bg-gray-900">
                <div className="text-[10px] text-gray-500 mb-2 flex items-center gap-2">
                    <span className="text-blue-400">●</span> = Données
                    <span className="text-green-400">✓</span> = Placé
                </div>
                <button
                    onClick={() => onFieldSelect?.({ type: 'zone' })}
                    className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                    ➕ Ajouter une zone libre
                </button>
            </div>
        </div>
    );
}

ContentPanel.propTypes = {
    reviewData: PropTypes.object,
    placedFields: PropTypes.array,
    onFieldSelect: PropTypes.func
};


