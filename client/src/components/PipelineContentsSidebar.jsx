import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronDown, ChevronRight, Thermometer, Droplets, Wind, Sun,
    Sprout, Scissors, Ruler, Scale, Calendar, Package, Beaker, Leaf
} from 'lucide-react';
import PresetsPanel from './PresetsPanelCDC';
import PresetGroupQuickPicker from './PresetGroupQuickPicker';

/**
 * PipelineContentsSidebar - Volet latéral hiérarchisé avec contenus drag & drop
 * 
 * Structure:
 * - Sections pliables (Environnement, Lumière, Irrigation, etc.)
 * - Contenus draggables avec icônes
 * - Filtrage/recherche
 * - Badges pour identification rapide
 */

// Icônes par catégorie
const CATEGORY_ICONS = {
    environment: <Thermometer className="w-4 h-4" />,
    light: <Sun className="w-4 h-4" />,
    irrigation: <Droplets className="w-4 h-4" />,
    fertilizer: <Beaker className="w-4 h-4" />,
    training: <Scissors className="w-4 h-4" />,
    morphology: <Ruler className="w-4 h-4" />,
    harvest: <Scale className="w-4 h-4" />,
    substrate: <Leaf className="w-4 h-4" />,
    general: <Package className="w-4 h-4" />
};

// Schémas de contenus par type de pipeline
export const CONTENT_SCHEMAS = {
    culture: [
        {
            category: 'general',
            label: 'Informations générales',
            icon: <Package className="w-4 h-4" />,
            expanded: true,
            items: [
                { type: 'mode', label: 'Mode de culture', icon: '🏕️', badge: 'Config' },
                { type: 'spaceType', label: "Type d'espace", icon: '📦', badge: 'Config' },
                { type: 'dimensions', label: 'Dimensions', icon: '📏', badge: 'Config' },
                { type: 'surface', label: 'Surface au sol', icon: '📐', badge: 'Config' },
                { type: 'volume', label: 'Volume total', icon: '📦', badge: 'Config' }
            ]
        },
        {
            category: 'environment',
            label: 'Environnement',
            icon: <Thermometer className="w-4 h-4" />,
            expanded: true,
            items: [
                { type: 'temperature', label: 'Température', icon: '🌡️', badge: 'Évolutif' },
                { type: 'humidity', label: 'Humidité relative', icon: '💧', badge: 'Évolutif' },
                { type: 'co2', label: 'CO2 (ppm)', icon: '🫧', badge: 'Évolutif' },
                { type: 'ventilation', label: 'Ventilation', icon: '🌀', badge: 'Évolutif' }
            ]
        },
        {
            category: 'substrate',
            label: 'Substrat',
            icon: <Leaf className="w-4 h-4" />,
            expanded: false,
            items: [
                { type: 'substrateType', label: 'Type de substrat', icon: '🧪', badge: 'Config' },
                { type: 'substrateVolume', label: 'Volume (L)', icon: '📊', badge: 'Config' },
                { type: 'substrateComposition', label: 'Composition', icon: '📝', badge: 'Config' },
                { type: 'substrateBrands', label: 'Marques', icon: '🏷️', badge: 'Config' }
            ]
        },
        {
            category: 'light',
            label: 'Lumière',
            icon: <Sun className="w-4 h-4" />,
            expanded: false,
            items: [
                { type: 'lightType', label: 'Type de lampe', icon: '💡', badge: 'Évolutif' },
                { type: 'spectrum', label: 'Type de spectre', icon: '🌈', badge: 'Évolutif' },
                { type: 'lightDistance', label: 'Distance lampe/plante', icon: '📏', badge: 'Évolutif' },
                { type: 'power', label: 'Puissance totale (W)', icon: '⚡', badge: 'Évolutif' },
                { type: 'photoperiod', label: 'Durée éclairage (h)', icon: '⏱️', badge: 'Évolutif' },
                { type: 'dli', label: 'DLI (mol/m²/j)', icon: '☀️', badge: 'Évolutif' },
                { type: 'ppfd', label: 'PPFD (µmol/m²/s)', icon: '🔆', badge: 'Évolutif' },
                { type: 'kelvin', label: 'Kelvin (K)', icon: '🌡️', badge: 'Évolutif' }
            ]
        },
        {
            category: 'irrigation',
            label: 'Irrigation',
            icon: <Droplets className="w-4 h-4" />,
            expanded: false,
            items: [
                { type: 'irrigationType', label: "Système d'irrigation", icon: '💧', badge: 'Évolutif' },
                { type: 'irrigationFrequency', label: 'Fréquence', icon: '🔁', badge: 'Évolutif' },
                { type: 'waterVolume', label: "Volume d'eau (L)", icon: '🪣', badge: 'Évolutif' }
            ]
        },
        {
            category: 'fertilizer',
            label: 'Engrais',
            icon: <Beaker className="w-4 h-4" />,
            expanded: false,
            items: [
                { type: 'fertilizerType', label: "Type d'engrais", icon: '🧪', badge: 'Évolutif' },
                { type: 'fertilizerBrand', label: 'Marque et gamme', icon: '🏷️', badge: 'Évolutif' },
                { type: 'fertilizerDosage', label: 'Dosage (g/L ou ml/L)', icon: '💊', badge: 'Évolutif' },
                { type: 'fertilizerFrequency', label: 'Fréquence', icon: '📅', badge: 'Évolutif' }
            ]
        },
        {
            category: 'training',
            label: 'Palissage LST/HST',
            icon: <Scissors className="w-4 h-4" />,
            expanded: false,
            items: [
                { type: 'trainingMethod', label: 'Méthodologie', icon: '✂️', badge: 'Évolutif' },
                { type: 'trainingDescription', label: 'Description', icon: '📝', badge: 'Évolutif' }
            ]
        },
        {
            category: 'morphology',
            label: 'Morphologie de la plante',
            icon: <Ruler className="w-4 h-4" />,
            expanded: false,
            items: [
                { type: 'plantHeight', label: 'Taille', icon: '📏', badge: 'Évolutif' },
                { type: 'plantVolume', label: 'Volume', icon: '📦', badge: 'Évolutif' },
                { type: 'plantWeight', label: 'Poids', icon: '⚖️', badge: 'Évolutif' },
                { type: 'mainBranches', label: 'Nombre branches principales', icon: '🌳', badge: 'Évolutif' },
                { type: 'leaves', label: 'Nombre de feuilles', icon: '🍃', badge: 'Évolutif' },
                { type: 'buds', label: 'Nombre de buds', icon: '🌸', badge: 'Évolutif' }
            ]
        },
        {
            category: 'harvest',
            label: 'Récolte',
            icon: <Scale className="w-4 h-4" />,
            expanded: false,
            items: [
                { type: 'trichomeColor', label: 'Couleur des trichomes', icon: '💎', badge: 'Fixe' },
                { type: 'harvestDate', label: 'Date de récolte', icon: '📅', badge: 'Fixe' },
                { type: 'wetWeight', label: 'Poids brut (g)', icon: '⚖️', badge: 'Fixe' },
                { type: 'dryWeight', label: 'Poids net (g)', icon: '⚖️', badge: 'Fixe' },
                { type: 'yield', label: 'Rendement', icon: '📈', badge: 'Fixe' }
            ]
        }
    ],

    curing: [
        {
            category: 'general',
            label: 'Configuration Curing',
            icon: <Package className="w-4 h-4" />,
            expanded: true,
            items: [
                { type: 'curingType', label: 'Type de curing', icon: '❄️', badge: 'Config' },
                { type: 'containerType', label: 'Type de récipient', icon: '🫙', badge: 'Évolutif' },
                { type: 'packaging', label: 'Emballage primaire', icon: '📦', badge: 'Évolutif' },
                { type: 'opacity', label: 'Opacité récipient', icon: '🌑', badge: 'Config' },
                { type: 'volumeOccupied', label: 'Volume occupé', icon: '📊', badge: 'Config' }
            ]
        },
        {
            category: 'environment',
            label: 'Paramètres environnement',
            icon: <Thermometer className="w-4 h-4" />,
            expanded: true,
            items: [
                { type: 'curingTemperature', label: 'Température (°C)', icon: '🌡️', badge: 'Évolutif' },
                { type: 'curingHumidity', label: 'Humidité relative (%)', icon: '💧', badge: 'Évolutif' }
            ]
        }
    ]
};

const PipelineContentsSidebar = ({
    contentSchema = [],
    onDragStart,
    pipelineType = 'culture',
    readonly = false
}) => {
    const [expandedCategories, setExpandedCategories] = useState(
        contentSchema.reduce((acc, cat) => ({ ...acc, [cat.category]: cat.expanded || false }), {})
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [draggedItem, setDraggedItem] = useState(null);

    // Utiliser le schéma fourni ou celui par défaut
    const schema = contentSchema.length > 0 ? contentSchema : CONTENT_SCHEMAS[pipelineType] || [];

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const handleDragStart = (e, item, category) => {
        if (readonly) return;

        setDraggedItem(item);
        onDragStart({ ...item, category });

        // Styling du drag
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', JSON.stringify({ ...item, category }));
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    // Filtrer les items selon recherche
    const filterItems = (items) => {
        if (!searchTerm) return items;
        return items.filter(item =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return (
        <div className="w-80 border-r border-gray-700 bg-gray-900/50 overflow-y-auto">
            {/* En-tête */}
            <div className="p-4 border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
                <h3 className="text-lg font-semibold text-white mb-2">
                    📋 Contenus disponibles
                </h3>
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
                <p className="text-xs text-gray-400 mt-2">
                    Glissez les éléments vers les cases de la timeline
                </p>
            </div>

            {/* Panneau préréglages */}
            <div className="p-2">
                <PresetsPanel
                    sidebarContent={schema}
                    onPresetsSelected={(selected) => {
                        console.log('Préréglages sélectionnés:', selected);
                    }}
                    onDragPreset={(preset) => {
                        console.log('Drag preset:', preset);
                        onDragStart(preset);
                    }}
                />
            </div>

            {/* Liste des catégories et contenus */}
            <div className="p-2">
                {schema.map((category) => {
                    const filteredItems = filterItems(category.items);
                    if (searchTerm && filteredItems.length === 0) return null;

                    return (
                        <div key={category.category} className="mb-2">
                            {/* En-tête de catégorie */}
                            <button
                                onClick={() => toggleCategory(category.category)}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <div className="flex items-center gap-2 text-white font-medium">
                                    {category.icon}
                                    <span>{category.label}</span>
                                    <span className="text-xs text-gray-400">
                                        ({filteredItems.length})
                                    </span>
                                </div>
                                {expandedCategories[category.category] ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            {/* Items de la catégorie */}
                            {expandedCategories[category.category] && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="ml-2 mt-1 space-y-1"
                                >
                                    {filteredItems.map((item) => (
                                        <div
                                            key={item.type}
                                            draggable={!readonly}
                                            onDragStart={(e) => handleDragStart(e, item, category.category)}
                                            onDragEnd={handleDragEnd}
                                            className={`flex items-center justify-between p-2 rounded-lg ${readonly ? 'opacity-50' : 'cursor-grab active:cursor-grabbing hover:bg-gray-800'} ${draggedItem?.type === item.type ? 'opacity-50' : ''} transition-all duration-200 border border-transparent hover:/50`}
                                        >
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <span className="text-lg">{item.icon}</span>
                                                <span>{item.label}</span>
                                            </div>

                                            {/* Badge */}
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.badge === 'Config' ? 'bg-white/5 text-gray-200' : ''} ${item.badge === 'Évolutif' ? 'bg-green-500/20 text-green-300' : ''} ${item.badge === 'Fixe' ? ' ' : ''}`}>
                                                {item.badge}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Légende */}
            <div className="p-4 border-t border-gray-700 bg-gray-900 text-xs text-gray-400">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/5"></span>
                        <span>Config: Défini une seule fois</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span>Évolutif: Peut varier dans le temps</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full"></span>
                        <span>Fixe: Valeur unique finale</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PipelineContentsSidebar;


