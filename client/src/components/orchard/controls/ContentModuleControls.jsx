import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';

const MODULE_LABELS = {
    // Informations de base
    title: { name: 'Titre / Nom commercial', icon: '📝' },
    holderName: { name: 'Nom du produit', icon: '🏷️' },
    rating: { name: 'Note globale', icon: '⭐' },
    overallRating: { name: 'Note globale (alt)', icon: '⭐' },
    author: { name: 'Auteur', icon: '👤' },
    ownerName: { name: 'Publié par', icon: '🧾' },
    image: { name: 'Image principale', icon: '🖼️' },
    images: { name: 'Galerie d\'images', icon: '📷' },
    mainImage: { name: 'Couverture', icon: '🖼️' },
    description: { name: 'Description', icon: '📄' },
    date: { name: 'Date de publication', icon: '📅' },
    category: { name: 'Catégorie', icon: '📂' },
    type: { name: 'Type de produit', icon: '📦' },
    tags: { name: 'Tags', icon: '🏷️' },
    
    // Provenance & Cultivar
    cultivar: { name: 'Cultivar', icon: '🌱' },
    cultivarsList: { name: 'Liste des cultivars', icon: '🌿' },
    breeder: { name: 'Breeder / Génétique', icon: '🧬' },
    farm: { name: 'Farm / Producteur', icon: '🏡' },
    hashmaker: { name: 'Hash Maker', icon: '👨‍🔬' },
    
    // Notes par catégorie
    categoryRatings: { name: 'Notes détaillées', icon: '📊' },
    'categoryRatings.visual': { name: 'Note Visuel', icon: '👁️' },
    'categoryRatings.smell': { name: 'Note Odeur', icon: '👃' },
    'categoryRatings.taste': { name: 'Note Goût', icon: '👅' },
    'categoryRatings.effects': { name: 'Note Effets', icon: '⚡' },
    ratings: { name: 'Toutes les notes', icon: '📋' },
    
    // Détails sensoriels
    terpenes: { name: 'Terpènes', icon: '🍃' },
    aromas: { name: 'Arômes', icon: '🌸' },
    tastes: { name: 'Goûts', icon: '👅' },
    effects: { name: 'Effets', icon: '✨' },
    aromasIntensity: { name: 'Intensité arômes', icon: '💨' },
    tastesIntensity: { name: 'Intensité goûts', icon: '🔥' },
    effectsIntensity: { name: 'Intensité effets', icon: '💪' },
    
    // Informations techniques
    thcLevel: { name: 'Niveau THC', icon: '🔬' },
    cbdLevel: { name: 'Niveau CBD', icon: '💊' },
    strainType: { name: 'Type (Indica/Sativa)', icon: '🧪' },
    indicaRatio: { name: 'Ratio Indica', icon: '⚖️' },
    dureeEffet: { name: 'Durée des effets', icon: '⏱️' },
    purgevide: { name: 'Purge à vide', icon: '🫧' },
    
    // Pipelines & process
    pipelineExtraction: { name: 'Pipeline Extraction', icon: '⚗️' },
    pipelineSeparation: { name: 'Pipeline Séparation', icon: '🧪' },
    pipelinePurification: { name: 'Pipeline Purification', icon: '✨' },
    fertilizationPipeline: { name: 'Fertilisation', icon: '🌾' },
    substratMix: { name: 'Substrat', icon: '🪴' },
    
    // Extra
    extraData: { name: 'Données supplémentaires', icon: '📎' }
};

function SortableModule({ id, module, isVisible, onToggle }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${isVisible
                    ? 'bg-white dark:bg-gray-800 border-2 border-purple-500'
                    : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                }
            `}
        >
            {/* Drag handle */}
            <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </button>

            {/* Icon et label */}
            <div className="flex-1 flex items-center gap-2">
                <span className="text-lg">{module.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {module.name}
                </span>
            </div>

            {/* Toggle */}
            <button
                onClick={onToggle}
                className={`
                    relative w-11 h-6 rounded-full transition-colors
                    ${isVisible ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'}
                `}
            >
                <span
                    className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                        ${isVisible ? 'translate-x-5' : 'translate-x-0'}
                    `}
                />
            </button>
        </div>
    );
}

export default function ContentModuleControls() {
    const config = useOrchardStore((state) => state.config);
    const toggleContentModule = useOrchardStore((state) => state.toggleContentModule);
    const reorderModules = useOrchardStore((state) => state.reorderModules);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = config.moduleOrder.indexOf(active.id);
            const newIndex = config.moduleOrder.indexOf(over.id);
            const newOrder = arrayMove(config.moduleOrder, oldIndex, newIndex);
            reorderModules(newOrder);
        }
    };

    const visibleCount = Object.values(config.contentModules).filter(Boolean).length;
    const totalCount = Object.keys(config.contentModules).length;

    return (
        <div className="space-y-6">
            {/* Titre et stats */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Modules de Contenu
                    </h3>
                    <span className="text-sm font-medium text-purple-500">
                        {visibleCount}/{totalCount}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Activez et organisez les éléments de votre review
                </p>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        Object.keys(config.contentModules).forEach(key => {
                            if (!config.contentModules[key]) toggleContentModule(key);
                        });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                    Tout afficher
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        Object.keys(config.contentModules).forEach(key => {
                            if (config.contentModules[key]) toggleContentModule(key);
                        });
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    Tout masquer
                </motion.button>
            </div>

            {/* Liste des modules (drag & drop) */}
            <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    ⚡ Glissez pour réorganiser l'ordre d'affichage
                </p>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={config.moduleOrder}
                        strategy={verticalListSortingStrategy}
                    >
                        {config.moduleOrder.map((moduleName) => (
                            <SortableModule
                                key={moduleName}
                                id={moduleName}
                                module={MODULE_LABELS[moduleName]}
                                isVisible={config.contentModules[moduleName]}
                                onToggle={() => toggleContentModule(moduleName)}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
