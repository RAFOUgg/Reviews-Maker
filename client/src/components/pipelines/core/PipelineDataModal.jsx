import React, { useState, useEffect } from 'react';
import { Save, X, Bookmark, Plus, Sparkles, LayoutGrid, Image as ImageIcon, Trash2, Search } from 'lucide-react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidSelect, LiquidTextarea, LiquidCard, LiquidBadge } from '../../ui/LiquidUI';
import LiquidCheckbox from '../../ui/LiquidCheckbox';
import ConfirmModal from '../../shared/ConfirmModal';
import { MediaGallery } from '../../shared/MediaAttachmentModal';
import usePresets from '../../../hooks/usePresets';
import { GroupedPresetModal } from '../views/PipelineDragDropView';
import { getUnitAlternates, toDisplayUnit, toCanonicalUnit } from '../../../utils/unitConversions';
import CultivarAutocomplete from '../../forms/helpers/CultivarAutocomplete';

/**
 * PipelineDataModal - Modal pour saisir les valeurs lors d'un drop
 *
 * Comportement CDC:
 * - Si droppedItem existe: affiche uniquement le champ correspondant
 * - Sinon: affiche tous les champs assignés à cette cellule, groupés par section
 */

// Types de champs qui ont besoin de toute la largeur de la grille (2 colonnes) plutôt que de se
// retrouver comprimés dans une seule colonne — textarea, listes/groupes multi-lignes.
const WIDE_FIELD_TYPES = new Set(['textarea', 'records-list', 'subscore-group', 'multiselect', 'dimensions']);

// Comparaison insensible à la casse ET aux accents (ex: "duree" doit trouver "Durée totale") —
// simple recherche substring, pas besoin de fuzzy-matching pour une liste de quelques dizaines
// de champs par pipeline.
const normalizeSearchText = (s) => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function PipelineDataModal({
    isOpen,
    onClose,
    cellData = {},
    sidebarSections = [],
    onSave,
    timestamp,
    intervalLabel = '',
    droppedItem = null,
    pipelineType = 'culture',
    onFieldDelete,
    onDragOver = null,
    onDrop = null,
    groupedPresets = [],
    preConfiguredItems = {},
    selectedCells = [],  // Array of selected cell timestamps for apply-to-selection
    // New: show a button to set the timeline start-month from within the data modal
    showSetStartMonthButton = false,
    onOpenStartMonth = null,
    onGroupsChange = null,
    onMediaChange = null
}) {
    const [formData, setFormData] = useState({});
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
    const [showCreateGroupedModal, setShowCreateGroupedModal] = useState(false);
    const [createGroupedPrefill, setCreateGroupedPrefill] = useState(null);
    const [localGroupedPresets, setLocalGroupedPresets] = useState(groupedPresets);
    // Unité d'affichage choisie par champ (ex: 'temperature' -> '°F') — la valeur stockée dans
    // formData reste toujours dans l'unité canonique du champ (cf. utils/unitConversions.js).
    const [fieldDisplayUnits, setFieldDisplayUnits] = useState({});
    // Highlight discret pendant un drag&drop sur le contenu — remplace l'ancienne zone en
    // pointillé toujours visible, le glisser-déposer depuis le panneau latéral reste actif.
    const [isDragOver, setIsDragOver] = useState(false);
    // Filtre texte de la grille "Ajouter un champ" — utile dès qu'un pipeline a beaucoup de champs.
    const [fieldSearchQuery, setFieldSearchQuery] = useState('');

    useEffect(() => {
        setLocalGroupedPresets(groupedPresets);
    }, [groupedPresets]);

    // Hook pour gérer les préréglages (localStorage + serveur)
    const { presets } = usePresets(pipelineType);

    useEffect(() => {
        const initialData = { ...cellData };
        delete initialData.timestamp;
        delete initialData._meta;

        setFormData(initialData);
        setFieldSearchQuery('');
    }, [cellData, timestamp, droppedItem, pipelineType]);

    // Obtenir tous les items disponibles depuis les sections
    const getAllItems = () => {
        const items = [];
        sidebarSections.forEach(section => {
            if (section.items) {
                section.items.forEach(item => {
                    items.push({ ...item, sectionLabel: section.label, sectionIcon: section.icon });
                });
            }
        });
        return items;
    };

    // Obtenir les items à afficher, groupés par section pour une lecture plus claire
    const getItemsToDisplay = () => {
        if (droppedItem) {
            if (droppedItem.content.type === 'multi' && Array.isArray(droppedItem.content.items)) {
                return droppedItem.content.items.map(item => ({ ...item, sectionLabel: '' }));
            }
            return [{ ...droppedItem.content, sectionLabel: '' }];
        }

        const allItems = getAllItems();
        return allItems.filter(item => {
            const itemKey = item.id || item.key || item.type;
            const hasData = formData[itemKey] !== undefined && formData[itemKey] !== null && formData[itemKey] !== '';
            return hasData;
        });
    };

    const groupItemsBySection = (items) => {
        const groups = [];
        const indexBySection = new Map();
        items.forEach(item => {
            const label = item.sectionLabel || 'Autres';
            if (!indexBySection.has(label)) {
                indexBySection.set(label, groups.length);
                groups.push({ label, icon: item.sectionIcon, items: [] });
            }
            groups[indexBySection.get(label)].items.push(item);
        });
        return groups;
    };

    // Handler pour modifier une valeur
    const handleChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Handler pour sauvegarder
    const handleSubmit = (e) => {
        e?.preventDefault?.();
        onSave({
            timestamp: timestamp,
            data: formData
        });
        onClose();
    };

    const findSidebarFieldByKey = (key) => {
        for (const section of sidebarSections) {
            const match = section.items?.find(item => (item.key || item.id || item.type) === key);
            if (match) {
                return { ...match, sectionLabel: section.label };
            }
        }
        return null;
    };

    const applyPresetFields = (fields = {}) => {
        if (!fields || Object.keys(fields).length === 0) return;
        setFormData(prev => ({ ...prev, ...fields }));
    };

    // Ajout direct d'un champ sans passer par le drag&drop ni par un groupe de préréglages —
    // liste tous les champs disponibles dans les sections du panneau latéral qui ne sont pas
    // déjà présents dans la cellule, pour un ajout en un clic.
    const getAvailableFieldsToAdd = () => {
        const items = [];
        sidebarSections.forEach(section => {
            (section.items || []).forEach(item => {
                const key = item.id || item.key || item.type;
                if (!key) return;
                const hasData = formData[key] !== undefined && formData[key] !== null && formData[key] !== '';
                if (!hasData) items.push({ ...item, key, sectionLabel: section.label, sectionIcon: section.icon });
            });
        });
        return items;
    };

    const handleAddFieldDirectly = (key) => {
        if (!key) return;
        const field = findSidebarFieldByKey(key);
        const defaultValue = field?.defaultValue !== undefined ? field.defaultValue : (field?.type === 'multiselect' ? [] : '');
        handleChange(key, defaultValue);
    };

    const handleRemoveField = (item) => {
        const itemKey = item?.id || item?.key || item?.type;
        if (!itemKey) return;
        if (onFieldDelete) onFieldDelete(timestamp, itemKey);
        setFormData(prev => {
            const updated = { ...prev };
            delete updated[itemKey];
            return updated;
        });
    };

    const FieldWrapper = ({ item, children }) => (
        <div className="relative group">
            {children}
            <button
                type="button"
                title="Supprimer ce champ de la cellule"
                onClick={() => handleRemoveField(item)}
                className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
                <X className="w-3 h-3" />
            </button>
        </div>
    );

    // Charger un préréglage
    const handleLoadPreset = (preset) => {
        if (preset && preset.data && preset.data.fieldKey && preset.data.value !== undefined) {
            handleChange(preset.data.fieldKey, preset.data.value);
        }
    };

    const handleDropPayload = (e) => {
        try {
            const data = e.dataTransfer.getData('application/json');
            if (data) {
                const dropped = JSON.parse(data);
                if (dropped.type === 'grouped-preset') {
                    const fields = dropped.data?.fields || dropped.fields || {};
                    applyPresetFields(fields);
                } else if (dropped.content || dropped.key) {
                    const key = dropped.content?.key || dropped.key;
                    const value = dropped.defaultValue || '';
                    if (key) handleChange(key, value);
                }
            }
        } catch (err) {
            console.error('Erreur drop:', err);
        }
        onDrop && onDrop(e);
    };

    // Rendu du champ selon le type — habillage cohérent avec le reste de l'app (liquid glass),
    // conversion d'unité pour number/slider quand le champ a des unités alternatives connues.
    const renderField = (item) => {
        if (!item) return null;

        const itemKey = item.id || item.key || item.type;
        const value = formData[itemKey] || '';
        const { label, icon, type = 'text' } = item;
        const fieldLabel = icon ? `${icon} ${label}` : label;

        // SELECT
        if (type === 'select') {
            if (!Array.isArray(item.options)) {
                return (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl">
                        ❌ Select "{label}" n'a pas d'options défini
                    </div>
                );
            }
            const options = item.options.map((opt, idx) => {
                const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                const labelOpt = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                return { value: val, label: labelOpt, _idx: idx };
            });
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <LiquidSelect
                        label={fieldLabel}
                        value={value}
                        onChange={(v) => handleChange(itemKey, v)}
                        options={options}
                    />
                </FieldWrapper>
            );
        }

        // AUTOCOMPLETE branché sur la bibliothèque de cultivars — évite de retaper à la main un
        // nom déjà documenté ailleurs (Bibliothèque > Cultivars).
        if (type === 'autocomplete' && item.librarySource === 'cultivars') {
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/60 ml-1">{fieldLabel}</label>
                        <CultivarAutocomplete
                            value={value}
                            onChange={(v) => handleChange(itemKey, v)}
                            placeholder={item.placeholder}
                        />
                    </div>
                </FieldWrapper>
            );
        }

        // SLIDER / STEPPER — range + valeur + sélecteur d'unité convertible
        if (type === 'slider' || type === 'stepper') {
            const canonicalUnit = item.unit || '';
            const alternates = getUnitAlternates(canonicalUnit);
            const activeUnit = fieldDisplayUnits[itemKey] || canonicalUnit;
            const rawValue = value || item.defaultValue || item.min || 0;
            const displayValue = toDisplayUnit(canonicalUnit, activeUnit, rawValue);
            const min = alternates ? toDisplayUnit(canonicalUnit, activeUnit, item.min || 0) : (item.min || 0);
            const max = alternates ? toDisplayUnit(canonicalUnit, activeUnit, item.max || 100) : (item.max || 100);
            const step = alternates && activeUnit !== canonicalUnit ? 'any' : (item.step || 1);
            const handleDisplayChange = (raw) => {
                if (raw === '' || raw === undefined) { handleChange(itemKey, ''); return; }
                const canonicalValue = alternates ? toCanonicalUnit(canonicalUnit, activeUnit, parseFloat(raw)) : parseFloat(raw);
                handleChange(itemKey, canonicalValue);
            };
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/60 ml-1">{fieldLabel}</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="range"
                                value={displayValue === '' ? min : displayValue}
                                onChange={(e) => handleDisplayChange(e.target.value)}
                                min={min}
                                max={max}
                                step={step === 'any' ? (item.step || 1) : step}
                                className="flex-1 h-1.5 accent-violet-500 bg-white/10 rounded-full appearance-none cursor-pointer"
                            />
                            <input
                                type="number"
                                value={displayValue}
                                onChange={(e) => handleDisplayChange(e.target.value)}
                                min={min}
                                max={max}
                                step={step}
                                placeholder={`${min}-${max}`}
                                className="liquid-input w-20 text-center"
                            />
                            {alternates ? (
                                <select
                                    value={activeUnit}
                                    onChange={(e) => setFieldDisplayUnits(prev => ({ ...prev, [itemKey]: e.target.value }))}
                                    className="liquid-input w-auto px-2 text-sm"
                                >
                                    {alternates.map(u => (
                                        <option key={u.unit} value={u.unit} className="bg-gray-900">{u.unit}</option>
                                    ))}
                                </select>
                            ) : (
                                canonicalUnit && <span className="text-sm text-white/40">{canonicalUnit}</span>
                            )}
                        </div>
                        {item.suggestions && item.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {item.suggestions.map((sugg, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleChange(itemKey, sugg.value)}
                                        className="px-2.5 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/70 rounded-full border border-white/10 transition-colors"
                                    >
                                        {sugg.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </FieldWrapper>
            );
        }

        // FREQUENCY - Valeur + période (ex: 2 fois par jour)
        if (type === 'frequency') {
            const freqValue = value || item.defaultValue || { value: 1, period: 'day' };
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/60 ml-1">{fieldLabel}</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                value={freqValue.value || 1}
                                onChange={(e) => handleChange(itemKey, { ...freqValue, value: parseFloat(e.target.value) || 1 })}
                                min="0.1"
                                step="0.1"
                                className="liquid-input w-20"
                            />
                            <span className="text-sm text-white/50">fois par</span>
                            <select
                                value={freqValue.period || 'day'}
                                onChange={(e) => handleChange(itemKey, { ...freqValue, period: e.target.value })}
                                className="liquid-input flex-1"
                            >
                                <option value="hour" className="bg-gray-900">heure</option>
                                <option value="day" className="bg-gray-900">jour</option>
                                <option value="week" className="bg-gray-900">semaine</option>
                                <option value="month" className="bg-gray-900">mois</option>
                            </select>
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // DIMENSIONS - L × l × H
        if (type === 'dimensions') {
            const dimValue = value || item.defaultValue || { length: 0, width: 0, height: 0 };
            const unit = item.unit || 'cm';
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/60 ml-1">{fieldLabel}</label>
                        <div className="grid grid-cols-3 gap-2">
                            {[['length', 'L'], ['width', 'l'], ['height', 'H']].map(([key, placeholder]) => (
                                <div key={key}>
                                    <label className="text-[11px] text-white/40 ml-1">{placeholder === 'L' ? 'Longueur' : placeholder === 'l' ? 'Largeur' : 'Hauteur'}</label>
                                    <input
                                        type="number"
                                        value={dimValue[key] || ''}
                                        onChange={(e) => handleChange(itemKey, { ...dimValue, [key]: parseFloat(e.target.value) || 0 })}
                                        placeholder={placeholder}
                                        className="liquid-input w-full text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="text-xs text-white/40 ml-1">
                            {unit} • {dimValue.length || 0} × {dimValue.width || 0} × {dimValue.height || 0}
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // COMPUTED - Champ calculé automatiquement (read-only)
        if (type === 'computed') {
            const computedValue = item.computeFn ? item.computeFn(formData) : (value || 0);
            const unit = item.unit || '';
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/40 ml-1">
                            {fieldLabel} {item.tooltip && <span className="text-[11px]">({item.tooltip})</span>}
                        </label>
                        <div className="liquid-input flex items-center text-white/70">
                            {computedValue} {unit}
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // SUBSCORE-GROUP - plusieurs sous-notes /max liées
        if (type === 'subscore-group') {
            const subScores = Array.isArray(item.subScores) ? item.subScores : [];
            const groupValue = (value && typeof value === 'object') ? value : {};
            const filled = subScores.filter(s => groupValue[s.key] !== undefined && groupValue[s.key] !== null && groupValue[s.key] !== '');
            const overall = filled.length > 0
                ? (filled.reduce((sum, s) => sum + Number(groupValue[s.key] || 0), 0) / filled.length).toFixed(1)
                : null;
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                        <label className="text-[13px] font-medium text-white/60">{fieldLabel}</label>
                        {subScores.map((sub) => {
                            const max = sub.max || 10;
                            const subVal = groupValue[sub.key] ?? '';
                            return (
                                <div key={sub.key} className="flex items-center gap-3">
                                    <span className="text-xs text-white/50 w-24 flex-shrink-0">{sub.label}</span>
                                    <input
                                        type="range"
                                        value={subVal === '' ? 0 : subVal}
                                        onChange={(e) => handleChange(itemKey, { ...groupValue, [sub.key]: parseFloat(e.target.value) })}
                                        min={0}
                                        max={max}
                                        step={sub.step || 0.5}
                                        className="flex-1 h-1.5 accent-violet-500 bg-white/10 rounded-full appearance-none cursor-pointer"
                                    />
                                    <span className="w-14 text-right text-sm text-white/70 flex-shrink-0">
                                        {subVal === '' ? '—' : subVal} /{max}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs font-medium text-white/40">Moyenne (overall)</span>
                            <span className="text-sm font-bold text-white">{overall ?? '—'} /10</span>
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // RECORDS-LIST - liste répétable d'enregistrements
        if (type === 'records-list') {
            const recordFields = Array.isArray(item.recordFields) ? item.recordFields : [];
            const records = Array.isArray(value) ? value : [];
            const recordLabel = item.recordLabel || 'Entrée';

            const updateRecord = (recordId, fieldKey, fieldValue) => {
                const updated = records.map(r => r.id === recordId ? { ...r, [fieldKey]: fieldValue } : r);
                handleChange(itemKey, updated);
            };
            const addRecord = () => {
                const blank = { id: Date.now() };
                recordFields.forEach(f => { blank[f.key] = f.defaultValue ?? ''; });
                handleChange(itemKey, [...records, blank]);
            };
            const removeRecord = (recordId) => {
                handleChange(itemKey, records.filter(r => r.id !== recordId));
            };

            const renderRecordInput = (record, field) => {
                const val = record[field.key] ?? '';
                if (field.type === 'select' && Array.isArray(field.options)) {
                    return (
                        <select
                            value={val}
                            onChange={(e) => updateRecord(record.id, field.key, e.target.value)}
                            className="liquid-input w-full text-xs py-1.5"
                        >
                            <option value="" className="bg-gray-900">—</option>
                            {field.options.map((opt, idx) => {
                                const optVal = typeof opt === 'string' ? opt : (opt.value ?? opt);
                                const optLabel = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                                return <option key={idx} value={optVal} className="bg-gray-900">{optLabel}</option>;
                            })}
                        </select>
                    );
                }
                if (field.type === 'slider' || field.type === 'number') {
                    return (
                        <input
                            type="number"
                            value={val}
                            onChange={(e) => updateRecord(record.id, field.key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            placeholder={field.unit || ''}
                            className="liquid-input w-full text-xs py-1.5"
                        />
                    );
                }
                return (
                    <input
                        type="text"
                        value={val}
                        onChange={(e) => updateRecord(record.id, field.key, e.target.value)}
                        className="liquid-input w-full text-xs py-1.5"
                    />
                );
            };

            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/60 ml-1">{fieldLabel}</label>
                        {records.map((record, idx) => (
                            <div key={record.id} className="p-2 bg-white/5 border border-white/10 rounded-xl">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-white/50">{recordLabel} {idx + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeRecord(record.id)}
                                        className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                    {recordFields.map(field => (
                                        <div key={field.key}>
                                            <label className="block text-[10px] text-white/40 mb-0.5">{field.label}{field.unit ? ` (${field.unit})` : ''}</label>
                                            {renderRecordInput(record, field)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addRecord}
                            className="w-full py-1.5 border border-dashed border-white/15 rounded-xl text-xs text-white/50 hover:border-violet-400/50 hover:text-violet-300 transition-colors"
                        >
                            ➕ Ajouter {recordLabel.toLowerCase()}
                        </button>
                    </div>
                </FieldWrapper>
            );
        }

        // MULTISELECT
        if (type === 'multiselect') {
            if (!Array.isArray(item.options)) {
                return (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl">
                        ❌ Multiselect "{label}" n'a pas d'options défini
                    </div>
                );
            }
            const selected = Array.isArray(formData[itemKey]) ? formData[itemKey] : [];
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/60 ml-1">{fieldLabel}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {item.options.map((opt, idx) => {
                                const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                                const lab = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                                const checked = selected.includes(val);
                                return (
                                    <label key={`${itemKey}-ms-${idx}`} className="flex items-center gap-2 p-2 bg-white/5 border border-white/10 rounded-xl">
                                        <LiquidCheckbox
                                            checked={checked}
                                            onChange={(next) => {
                                                const nextArr = next ? [...selected, val] : selected.filter(s => s !== val);
                                                handleChange(itemKey, nextArr);
                                            }}
                                        />
                                        <span className="text-sm text-white/80 flex-1">{lab}</span>
                                        {item.withPercentage && (
                                            <input
                                                type="number"
                                                value={item._percentages?.[val] ?? ''}
                                                onChange={(e) => {
                                                    const percent = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                    const pctObj = { ...item._percentages, [val]: percent };
                                                    handleChange(`${itemKey}__percentages`, pctObj);
                                                }}
                                                placeholder="%"
                                                className="liquid-input w-16 text-sm py-1"
                                            />
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // DATE
        if (type === 'date') {
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <LiquidInput
                        type="date"
                        label={fieldLabel}
                        value={value || ''}
                        onChange={(e) => handleChange(itemKey, e.target.value)}
                    />
                </FieldWrapper>
            );
        }

        // NUMBER — avec sélecteur d'unité convertible si le champ a des unités alternatives connues
        if (type === 'number') {
            const canonicalUnit = item.unit || '';
            const alternates = getUnitAlternates(canonicalUnit);
            const activeUnit = fieldDisplayUnits[itemKey] || canonicalUnit;
            const displayValue = toDisplayUnit(canonicalUnit, activeUnit, value);
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-medium text-white/60 ml-1">{fieldLabel}</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={displayValue}
                                onChange={(e) => {
                                    if (e.target.value === '') { handleChange(itemKey, ''); return; }
                                    const raw = parseFloat(e.target.value);
                                    handleChange(itemKey, alternates ? toCanonicalUnit(canonicalUnit, activeUnit, raw) : raw);
                                }}
                                step={alternates && activeUnit !== canonicalUnit ? 'any' : (item.step || '0.1')}
                                min={alternates ? undefined : item.min}
                                max={alternates ? undefined : item.max}
                                placeholder={item.placeholder || `Ex: ${item.defaultValue || ''}`}
                                className="liquid-input flex-1"
                            />
                            {alternates && (
                                <select
                                    value={activeUnit}
                                    onChange={(e) => setFieldDisplayUnits(prev => ({ ...prev, [itemKey]: e.target.value }))}
                                    className="liquid-input w-auto px-2 text-sm"
                                >
                                    {alternates.map(u => (
                                        <option key={u.unit} value={u.unit} className="bg-gray-900">{u.unit}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // CHECKBOX
        if (type === 'checkbox') {
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="flex items-center gap-3 p-2">
                        <LiquidCheckbox
                            checked={Boolean(value)}
                            onChange={(v) => handleChange(itemKey, v)}
                            label={fieldLabel}
                        />
                    </div>
                </FieldWrapper>
            );
        }

        // TEXTAREA
        if (type === 'textarea') {
            const textValue = String(value || '');
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <LiquidTextarea
                        label={fieldLabel}
                        value={textValue}
                        onChange={(e) => handleChange(itemKey, e.target.value)}
                        rows={3}
                        maxLength={item.maxLength || 500}
                        placeholder={item.placeholder || ''}
                        hint={item.maxLength ? `${textValue.length} / ${item.maxLength} caractères` : undefined}
                    />
                </FieldWrapper>
            );
        }

        // TEXT par défaut
        return (
            <FieldWrapper item={item} key={itemKey}>
                <LiquidInput
                    label={fieldLabel}
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleChange(itemKey, e.target.value)}
                    placeholder={item.placeholder || ''}
                />
            </FieldWrapper>
        );
    };

    const itemsToDisplay = getItemsToDisplay();
    const groupedItemsToDisplay = groupItemsBySection(itemsToDisplay);
    const availableFields = !droppedItem ? getAvailableFieldsToAdd() : [];
    const filteredAvailableFields = fieldSearchQuery.trim()
        ? availableFields.filter(item => {
            const needle = normalizeSearchText(fieldSearchQuery);
            return normalizeSearchText(item.label).includes(needle)
                || normalizeSearchText(item.tooltip).includes(needle)
                || normalizeSearchText(item.sectionLabel).includes(needle);
        })
        : availableFields;
    const availableFieldGroups = groupItemsBySection(filteredAvailableFields);

    const allGroupedPresets = [
        ...(presets.grouped || []).map(g => ({
            id: g.id,
            name: g.name,
            fieldCount: g.data?.selectedFields?.length || Object.keys(g.data?.fields || {}).length || 0,
            preview: g.data?.selectedFields ? g.data.selectedFields.slice(0, 3).join(', ') : Object.keys(g.data?.fields || {}).slice(0, 3).join(', '),
            onLoad: () => applyPresetFields(g.data?.fields || {})
        })),
        ...(localGroupedPresets || []).map(g => ({
            id: g.name,
            name: g.name,
            fieldCount: g.fields?.length || 0,
            preview: (g.fields || []).slice(0, 3).map(f => f.key).join(', '),
            onLoad: () => {
                const merged = {};
                (g.fields || []).forEach(f => {
                    const key = f.key || f.id;
                    if (key) merged[key] = f.value;
                });
                applyPresetFields(merged);
            }
        }))
    ];

    return (
        <>
            <LiquidModal
                isOpen={isOpen}
                onClose={onClose}
                size="wide"
                glowColor="violet"
                title={
                    <div>
                        <div className="text-lg font-semibold text-white">
                            {droppedItem ? `📝 Attribution pour ${intervalLabel}` : '✏️ Modifier les données'}
                        </div>
                        <p className="text-sm text-white/50 mt-0.5">
                            {droppedItem
                                ? `Définir les valeurs de "${droppedItem.content.label}"`
                                : `${intervalLabel} • ${itemsToDisplay.length} champ(s)`}
                        </p>
                    </div>
                }
                footer={
                    <div className="flex items-center justify-end gap-3 w-full flex-wrap">
                        {showSetStartMonthButton && typeof onOpenStartMonth === 'function' && (
                            <LiquidButton type="button" variant="outline" size="sm" onClick={onOpenStartMonth} className="mr-auto">
                                Définir 1er mois
                            </LiquidButton>
                        )}
                        <LiquidButton type="button" variant="ghost" onClick={onClose}>
                            Annuler
                        </LiquidButton>
                        <LiquidButton
                            type="button"
                            variant="primary"
                            icon={Save}
                            disabled={itemsToDisplay.length === 0}
                            onClick={handleSubmit}
                        >
                            {selectedCells && selectedCells.length > 1
                                ? `Appliquer à ${selectedCells.length} cases`
                                : 'Enregistrer'}
                        </LiquidButton>
                    </div>
                }
            >
                <form
                    onSubmit={handleSubmit}
                    className={`space-y-4 rounded-2xl transition-shadow ${isDragOver ? 'ring-2 ring-violet-500/60' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); onDragOver && onDragOver(e); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleDropPayload(e); }}
                >
                    {/* Données de la cellule */}
                    {itemsToDisplay.length === 0 ? (
                        <div className="text-center py-8 text-white/40">
                            <LayoutGrid className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm font-medium text-white/60">Aucune donnée pour le moment</p>
                            <p className="text-xs mt-1">Ajoutez un champ ci-dessous ou chargez un groupe de préréglages</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {groupedItemsToDisplay.map(group => (
                                <div key={group.label || 'defaut'} className="space-y-3">
                                    {group.label && !droppedItem && (
                                        <p className="text-xs font-semibold uppercase tracking-wide text-white/35 ml-1 flex items-center gap-1.5">
                                            {group.icon && <span className="text-sm not-italic normal-case">{group.icon}</span>}
                                            {group.label}
                                        </p>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {group.items.map((item, idx) => {
                                            const rendered = renderField(item);
                                            const itemKey = item?.key || item?.type;
                                            if (!rendered) {
                                                return (
                                                    <div key={idx} className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-xl md:col-span-2">
                                                        ⚠️ Item {idx} ({itemKey}) n'a pas d'input compatible (type={item?.type})
                                                    </div>
                                                );
                                            }
                                            const isWide = WIDE_FIELD_TYPES.has(item?.type);
                                            return <div key={itemKey || idx} className={isWide ? 'md:col-span-2' : ''}>{rendered}</div>;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {droppedItem && (
                        <LiquidCard padding="sm" glow="amber">
                            <p className="text-sm text-white/70 flex items-start gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                                Vous devez renseigner une valeur avant d'ajouter ce champ à la cellule.
                            </p>
                        </LiquidCard>
                    )}

                    {!droppedItem && (
                        <>
                            {/* Ajouter un champ — grille de boutons icône+label groupés par section, cliquables directement */}
                            <LiquidCard padding="sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Plus className="w-4 h-4 text-violet-400" />
                                    <p className="text-sm font-semibold text-white">Ajouter un champ</p>
                                </div>
                                {availableFields.length === 0 ? (
                                    <p className="text-sm text-white/40 text-center py-2">Tous les champs sont déjà ajoutés</p>
                                ) : (
                                    <>
                                        <div className="relative mb-3">
                                            <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={fieldSearchQuery}
                                                onChange={(e) => setFieldSearchQuery(e.target.value)}
                                                placeholder="Rechercher un champ... (ex: température, durée, substrat)"
                                                className="liquid-input w-full pl-9"
                                            />
                                        </div>
                                        {filteredAvailableFields.length === 0 ? (
                                            <p className="text-sm text-white/40 text-center py-4">Aucun champ ne correspond à "{fieldSearchQuery}"</p>
                                        ) : (
                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                        {availableFieldGroups.map(group => (
                                            <div key={group.label || 'defaut'}>
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/30 mb-1.5 ml-0.5 flex items-center gap-1.5">
                                                    {group.icon && <span className="text-sm not-italic normal-case">{group.icon}</span>}
                                                    {group.label}
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                                    {group.items.map(item => (
                                                        <button
                                                            key={item.key}
                                                            type="button"
                                                            title={item.tooltip || item.label}
                                                            onClick={() => handleAddFieldDirectly(item.key)}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-violet-500/15 hover:border-violet-500/40 text-left transition-colors"
                                                        >
                                                            <span className="text-base leading-none flex-shrink-0">{item.icon || '▫️'}</span>
                                                            <span className="text-xs text-white/80 truncate">{item.label || item.key}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                        )}
                                    </>
                                )}
                            </LiquidCard>

                            {/* Photos/Vidéos + Groupes de préréglages côte à côte sur desktop — pas besoin de
                                pleine largeur chacun, ça évite un long scroll vertical inutile. Empilé en
                                dessous de md (téléphone/tablette portrait). */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                {/* Photos / Vidéos */}
                                {onMediaChange && (
                                    <LiquidCard padding="sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <ImageIcon className="w-4 h-4 text-amber-400" />
                                            <p className="text-sm font-semibold text-white">Photos / Vidéos</p>
                                        </div>
                                        <MediaGallery media={cellData?.media || []} onChange={onMediaChange} compact />
                                    </LiquidCard>
                                )}

                                {/* Groupes de préréglages */}
                                <LiquidCard padding="sm">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Bookmark className="w-4 h-4 text-emerald-400" />
                                            <p className="text-sm font-semibold text-white">Groupes de préréglages</p>
                                        </div>
                                        <LiquidButton
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            icon={Plus}
                                            onClick={() => { setCreateGroupedPrefill(null); setShowCreateGroupedModal(true); }}
                                        >
                                            Nouveau
                                        </LiquidButton>
                                    </div>

                                    {allGroupedPresets.length === 0 ? (
                                        <div className="text-center py-5 text-white/40 border border-dashed border-white/10 rounded-xl">
                                            <p className="text-sm font-medium">📦 Aucun groupe préréglage</p>
                                            <p className="text-xs mt-1">Créez un groupe pour réutiliser rapidement des configurations</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {allGroupedPresets.map(group => (
                                                <div key={group.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm text-white truncate">{group.name}</p>
                                                        <p className="text-xs text-white/40 mt-0.5 truncate">
                                                            <LiquidBadge size="sm">{group.fieldCount} champ(s)</LiquidBadge>
                                                            {group.preview && <span className="ml-2">{group.preview}</span>}
                                                        </p>
                                                    </div>
                                                    <LiquidButton type="button" variant="outline" size="sm" onClick={group.onLoad}>
                                                        Charger
                                                    </LiquidButton>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </LiquidCard>
                            </div>
                        </>
                    )}
                </form>
            </LiquidModal>

            <GroupedPresetModal
                isOpen={showCreateGroupedModal}
                onClose={() => { setShowCreateGroupedModal(false); setCreateGroupedPrefill(null); }}
                onSave={() => {
                    setShowCreateGroupedModal(false);
                    setCreateGroupedPrefill(null);
                }}
                groups={localGroupedPresets}
                setGroups={(newGroups) => {
                    setLocalGroupedPresets(newGroups);
                    if (typeof onGroupsChange === 'function') onGroupsChange(newGroups);
                }}
                sidebarContent={sidebarSections}
                type={pipelineType}
            />
            <ConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))}
                onConfirm={() => setConfirmState(prev => { const cb = prev && prev.onConfirm; if (typeof cb === 'function') cb(); return { ...prev, open: false }; })}
            />
        </>
    );
}

export default PipelineDataModal;
