import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Edit2, Trash2, Copy, FolderPlus, Check, X,
    ChevronDown, ChevronRight, Save, Download, Upload
} from 'lucide-react';
import { LiquidButton, LiquidInput } from './liquid';

/**
 * PresetGroupsManager - Gestionnaire avancé de groupes de pré-réglages
 * 
 * Fonctionnalités:
 * - Créer des groupes de données multi-champs avec valeurs pré-configurées
 * - Sauvegarder et charger des groupes entiers
 * - Catégorisation personnalisée
 * - Export/Import JSON des groupes
 * - Application rapide d'un groupe complet sur une cellule
 * 
 * Exemple de groupe:
 * {
 *   id: 'floraison-indoor-1',
 *   name: 'Floraison Indoor Optimale',
 *   category: 'Environnement',
 *   icon: '🌸',
 *   description: 'Configuration complète pour phase de floraison indoor',
 *   fields: {
 *     temperature: 22,
 *     humidity: 55,
 *     co2: 800,
 *     lightHours: 12,
 *     lightType: 'LED',
 *     lightPower: 600
 *   }
 * }
 */

const PresetGroupsManager = ({
    pipelineType = 'culture',
    sidebarSections = [],
    onApplyGroup,
    isOpen = false,
    onClose
}) => {
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [editingGroup, setEditingGroup] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Charger les groupes depuis localStorage
    useEffect(() => {
        const storedGroups = localStorage.getItem(`${pipelineType}_preset_groups`);
        const storedCategories = localStorage.getItem(`${pipelineType}_preset_categories`);

        if (storedGroups) {
            try {
                setGroups(JSON.parse(storedGroups));
            } catch (e) {
                console.error('Erreur chargement groupes:', e);
                setGroups(getDefaultGroups());
            }
        } else {
            setGroups(getDefaultGroups());
        }

        if (storedCategories) {
            try {
                setCategories(JSON.parse(storedCategories));
            } catch (e) {
                setCategories(getDefaultCategories());
            }
        } else {
            setCategories(getDefaultCategories());
        }
    }, [pipelineType]);

    // Sauvegarder automatiquement
    useEffect(() => {
        localStorage.setItem(`${pipelineType}_preset_groups`, JSON.stringify(groups));
    }, [groups, pipelineType]);

    useEffect(() => {
        localStorage.setItem(`${pipelineType}_preset_categories`, JSON.stringify(categories));
    }, [categories, pipelineType]);

    // Groupes par défaut
    const getDefaultGroups = () => {
        if (pipelineType === 'culture') {
            return [
                {
                    id: 'croissance-indoor-basic',
                    name: 'Croissance Indoor Basique',
                    category: 'Phase - Croissance',
                    icon: '🌱',
                    description: 'Configuration standard pour croissance végétative indoor',
                    fields: {
                        temperature: 24,
                        humidity: 65,
                        lightHours: 18,
                        lightType: 'LED',
                        co2: 400
                    }
                },
                {
                    id: 'floraison-indoor-optimal',
                    name: 'Floraison Indoor Optimale',
                    category: 'Phase - Floraison',
                    icon: '🌸',
                    description: 'Configuration optimisée pour floraison avec CO2',
                    fields: {
                        temperature: 22,
                        humidity: 50,
                        lightHours: 12,
                        lightType: 'LED',
                        lightPower: 600,
                        co2: 1200
                    }
                },
                {
                    id: 'outdoor-summer',
                    name: 'Outdoor Été',
                    category: 'Mode - Outdoor',
                    icon: '☀️',
                    description: 'Configuration pour culture extérieure estivale',
                    fields: {
                        mode: 'Outdoor',
                        lightType: 'Naturel',
                        temperature: 26,
                        humidity: 60
                    }
                },
                {
                    id: 'substrat-coco-perlite',
                    name: 'Coco 70 / Perlite 30',
                    category: 'Substrat',
                    icon: '🥥',
                    description: 'Mélange coco-perlite optimal drainage',
                    fields: {
                        substrateType: 'Coco-Perlite',
                        composition: 'coco:70,perlite:30',
                        potVolume: 11
                    }
                },
                {
                    id: 'bio-compost-full',
                    name: 'Bio Complet',
                    category: 'Substrat',
                    icon: '♻️',
                    description: 'Substrat 100% bio avec compost et humus',
                    fields: {
                        substrateType: 'Bio organique',
                        composition: 'terreau:40,compost:35,humus:15,perlite:10',
                        potVolume: 15
                    }
                }
            ];
        } else if (pipelineType === 'curing') {
            return [
                {
                    id: 'curing-cold-standard',
                    name: 'Curing Froid Standard',
                    category: 'Température',
                    icon: '❄️',
                    description: 'Curing à froid pour préservation terpènes',
                    fields: {
                        curingType: 'cold',
                        temperature: 4,
                        humidity: 62,
                        containerType: 'glass',
                        packaging: 'none'
                    }
                },
                {
                    id: 'curing-warm-fast',
                    name: 'Curing Chaud Rapide',
                    category: 'Température',
                    icon: '🌡️',
                    description: 'Curing accéléré pour maturation rapide',
                    fields: {
                        curingType: 'warm',
                        temperature: 18,
                        humidity: 58,
                        containerType: 'glass',
                        packaging: 'cellophane'
                    }
                }
            ];
        }
        return [];
    };

    // Catégories par défaut
    const getDefaultCategories = () => {
        if (pipelineType === 'culture') {
            return [
                { id: 'phase-croissance', name: 'Phase - Croissance', icon: '🌱', color: '#10B981' },
                { id: 'phase-floraison', name: 'Phase - Floraison', icon: '🌸', color: '#EC4899' },
                { id: 'mode-indoor', name: 'Mode - Indoor', icon: '💡', color: '#3B82F6' },
                { id: 'mode-outdoor', name: 'Mode - Outdoor', icon: '☀️', color: '#F59E0B' },
                { id: 'substrat', name: 'Substrat', icon: '🪴', color: '#8B4513' },
                { id: 'personnalise', name: 'Personnalisé', icon: '⭐', color: '#6366F1' }
            ];
        } else if (pipelineType === 'curing') {
            return [
                { id: 'temperature', name: 'Température', icon: '🌡️', color: '#3B82F6' },
                { id: 'conditionnement', name: 'Conditionnement', icon: '📦', color: '#8B4513' },
                { id: 'personnalise', name: 'Personnalisé', icon: '⭐', color: '#6366F1' }
            ];
        }
        return [];
    };

    // Obtenir tous les champs disponibles depuis sidebarSections
    const getAllAvailableFields = () => {
        const fields = [];
        sidebarSections.forEach(section => {
            if (section.items) {
                section.items.forEach(item => {
                    fields.push({
                        key: item.key,
                        label: item.label,
                        icon: item.icon,
                        type: item.type,
                        options: item.options,
                        unit: item.unit,
                        min: item.min,
                        max: item.max
                    });
                });
            }
        });
        return fields;
    };

    // Créer un nouveau groupe
    const handleCreateGroup = (groupData) => {
        const newGroup = {
            id: `group_${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...groupData
        };
        setGroups([...groups, newGroup]);
        setShowCreateModal(false);
    };

    // Modifier un groupe
    const handleUpdateGroup = (groupId, updates) => {
        setGroups(groups.map(g => g.id === groupId ? { ...g, ...updates } : g));
        setShowEditModal(false);
        setEditingGroup(null);
    };

    // Supprimer un groupe
    const handleDeleteGroup = (groupId) => {
        if (confirm('Supprimer ce groupe de pré-réglages ?')) {
            setGroups(groups.filter(g => g.id !== groupId));
        }
    };

    // Dupliquer un groupe
    const handleDuplicateGroup = (group) => {
        const duplicate = {
            ...group,
            id: `group_${Date.now()}`,
            name: `${group.name} (copie)`,
            createdAt: new Date().toISOString()
        };
        setGroups([...groups, duplicate]);
    };

    // Appliquer un groupe à une cellule
    const handleApplyGroup = (group) => {
        if (onApplyGroup) {
            onApplyGroup(group.fields);
        }
    };

    // Export JSON
    const handleExportGroups = () => {
        const dataStr = JSON.stringify({ groups, categories }, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `preset-groups-${pipelineType}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Import JSON
    const handleImportGroups = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (imported.groups) {
                    setGroups([...groups, ...imported.groups]);
                }
                if (imported.categories) {
                    setCategories([...categories, ...imported.categories]);
                }
                alert(`✓ ${imported.groups?.length || 0} groupes importés !`);
            } catch (err) {
                alert('❌ Erreur lors de l\'import: fichier invalide');
            }
        };
        reader.readAsText(file);
    };

    // Grouper par catégorie
    const groupsByCategory = groups.reduce((acc, group) => {
        const cat = group.category || 'Personnalisé';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(group);
        return acc;
    }, {});

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <FolderPlus className="w-7 h-7" />
                                Groupes de Pré-réglages
                            </h2>
                            <p className="text-sm text-purple-100 mt-1">
                                Créez et gérez des configurations multi-champs pour compléter rapidement vos données
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-2 mt-4">
                        <LiquidButton
                            onClick={() => setShowCreateModal(true)}
                            variant="secondary"
                            className="flex items-center gap-2 text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Nouveau groupe
                        </LiquidButton>
                        <LiquidButton
                            onClick={handleExportGroups}
                            variant="secondary"
                            className="flex items-center gap-2 text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Exporter
                        </LiquidButton>
                        <label className="cursor-pointer">
                            <LiquidButton
                                as="span"
                                variant="secondary"
                                className="flex items-center gap-2 text-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Importer
                            </LiquidButton>
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImportGroups}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {Object.keys(groupsByCategory).length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FolderPlus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Aucun groupe créé</p>
                            <p className="text-sm">Créez votre premier groupe pour commencer</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupsByCategory).map(([categoryName, categoryGroups]) => {
                                const category = categories.find(c => c.name === categoryName);
                                const isExpanded = expandedCategories[categoryName] !== false;

                                return (
                                    <div key={categoryName} className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
                                        <button
                                            onClick={() => setExpandedCategories({
                                                ...expandedCategories,
                                                [categoryName]: !isExpanded
                                            })}
                                            className="w-full flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{category?.icon || '📁'}</span>
                                                <div className="text-left">
                                                    <h3 className="font-semibold text-white">{categoryName}</h3>
                                                    <p className="text-xs text-gray-400">{categoryGroups.length} groupe(s)</p>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-700"
                                                >
                                                    <div className="p-4 space-y-3">
                                                        {categoryGroups.map(group => (
                                                            <GroupCard
                                                                key={group.id}
                                                                group={group}
                                                                onApply={() => handleApplyGroup(group)}
                                                                onEdit={() => {
                                                                    setEditingGroup(group);
                                                                    setShowEditModal(true);
                                                                }}
                                                                onDuplicate={() => handleDuplicateGroup(group)}
                                                                onDelete={() => handleDeleteGroup(group.id)}
                                                            />
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modals */}
                <CreateGroupModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateGroup}
                    categories={categories}
                    availableFields={getAllAvailableFields()}
                />

                <EditGroupModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingGroup(null);
                    }}
                    group={editingGroup}
                    onUpdate={handleUpdateGroup}
                    categories={categories}
                    availableFields={getAllAvailableFields()}
                />
            </motion.div>
        </motion.div>
    );
};

// Carte d'un groupe
const GroupCard = ({ group, onApply, onEdit, onDuplicate, onDelete }) => {
    const fieldCount = Object.keys(group.fields || {}).length;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all group"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{group.icon}</span>
                    <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">{group.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{group.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded">
                                {fieldCount} champ{fieldCount > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-2 hover:bg-blue-600/30 rounded text-blue-400 transition-colors"
                        title="Modifier"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDuplicate}
                        className="p-2 hover:bg-green-600/30 rounded text-green-400 transition-colors"
                        title="Dupliquer"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 hover:bg-red-600/30 rounded text-red-400 transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Aperçu des champs */}
            <div className="flex flex-wrap gap-2 mb-3">
                {Object.entries(group.fields || {}).slice(0, 5).map(([key, value]) => (
                    <span key={key} className="text-xs bg-gray-600/50 text-gray-300 px-2 py-1 rounded">
                        {key}: {typeof value === 'object' ? JSON.stringify(value) : value}
                    </span>
                ))}
                {fieldCount > 5 && (
                    <span className="text-xs text-gray-400 px-2 py-1">
                        +{fieldCount - 5} autre{fieldCount - 5 > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <LiquidButton
                onClick={onApply}
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
            >
                <Check className="w-4 h-4" />
                Appliquer ce groupe
            </LiquidButton>
        </motion.div>
    );
};

// Modal de création (simplifié, à développer)
const CreateGroupModal = ({ isOpen, onClose, onCreate, categories, availableFields }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: categories[0]?.name || 'Personnalisé',
        icon: '⭐',
        description: '',
        fields: {}
    });

    const [selectedFields, setSelectedFields] = useState([]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700"
            >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Plus className="w-6 h-6" />
                    Créer un groupe de pré-réglages
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nom du groupe</label>
                        <LiquidInput
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="ex: Floraison Indoor Optimale"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                            rows={2}
                            placeholder="Description de ce groupe..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                            <LiquidInput
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="🌸"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <p className="text-sm text-gray-400 mb-3">
                            Sélectionnez les champs et définissez leurs valeurs par défaut:
                        </p>

                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {availableFields.slice(0, 10).map(field => (
                                <div key={field.key} className="flex items-center gap-3 bg-gray-700/50 p-2 rounded">
                                    <input
                                        type="checkbox"
                                        checked={selectedFields.includes(field.key)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedFields([...selectedFields, field.key]);
                                                setFormData({
                                                    ...formData,
                                                    fields: { ...formData.fields, [field.key]: '' }
                                                });
                                            } else {
                                                setSelectedFields(selectedFields.filter(k => k !== field.key));
                                                const newFields = { ...formData.fields };
                                                delete newFields[field.key];
                                                setFormData({ ...formData, fields: newFields });
                                            }
                                        }}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm text-gray-300 flex-1">{field.icon} {field.label}</span>
                                    {selectedFields.includes(field.key) && (
                                        <input
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            value={formData.fields[field.key] || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                fields: { ...formData.fields, [field.key]: e.target.value }
                                            })}
                                            className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm w-32"
                                            placeholder="Valeur"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <LiquidButton
                        onClick={() => {
                            onCreate(formData);
                            setFormData({ name: '', category: categories[0]?.name || '', icon: '⭐', description: '', fields: {} });
                            setSelectedFields([]);
                        }}
                        variant="primary"
                        className="flex-1"
                        disabled={!formData.name || Object.keys(formData.fields).length === 0}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Créer le groupe
                    </LiquidButton>
                    <LiquidButton
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                    >
                        Annuler
                    </LiquidButton>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Modal d'édition (réutilise CreateGroupModal avec pre-fill)
const EditGroupModal = ({ isOpen, onClose, group, onUpdate, categories, availableFields }) => {
    if (!isOpen || !group) return null;

    const [formData, setFormData] = useState({
        name: group.name || '',
        category: group.category || '',
        icon: group.icon || '⭐',
        description: group.description || '',
        fields: group.fields || {}
    });

    return (
        <CreateGroupModal
            isOpen={isOpen}
            onClose={onClose}
            onCreate={(data) => onUpdate(group.id, data)}
            categories={categories}
            availableFields={availableFields}
        />
    );
};

export default PresetGroupsManager;

