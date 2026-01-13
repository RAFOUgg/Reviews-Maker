import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  GripVertical, Plus, Trash2, Eye, EyeOff, 
  Type, Image, BarChart3, Sparkles, Settings,
  ChevronDown, ChevronUp, Lock, Unlock
} from 'lucide-react';
import { useAccountType } from '../../hooks/useAccountType';
import { FeatureGate } from '../account';

// Données des sections disponibles pour drag & drop
const AVAILABLE_SECTIONS = {
  flower: [
    { id: 'general', name: 'Informations générales', icon: '📋', required: true },
    { id: 'genetics', name: 'Génétiques', icon: '🧬' },
    { id: 'culture', name: 'Culture Pipeline', icon: '🌱', producerOnly: true },
    { id: 'analytics', name: 'Analytiques', icon: '🔬' },
    { id: 'visual', name: 'Visuel & Technique', icon: '👁️' },
    { id: 'odors', name: 'Odeurs', icon: '👃' },
    { id: 'texture', name: 'Texture', icon: '🤚' },
    { id: 'tastes', name: 'Goûts', icon: '😋' },
    { id: 'effects', name: 'Effets', icon: '💥' },
    { id: 'curing', name: 'Curing & Maturation', icon: '🔥' },
    { id: 'experience', name: 'Expérience', icon: '🧪' },
  ],
  hash: [
    { id: 'general', name: 'Informations générales', icon: '📋', required: true },
    { id: 'separation', name: 'Pipeline Séparation', icon: '🔬' },
    { id: 'purification', name: 'Purification', icon: '⚗️' },
    { id: 'visual', name: 'Visuel & Technique', icon: '👁️' },
    { id: 'odors', name: 'Odeurs', icon: '👃' },
    { id: 'texture', name: 'Texture', icon: '🤚' },
    { id: 'tastes', name: 'Goûts', icon: '😋' },
    { id: 'effects', name: 'Effets', icon: '💥' },
    { id: 'curing', name: 'Curing', icon: '🔥' },
  ],
  concentrate: [
    { id: 'general', name: 'Informations générales', icon: '📋', required: true },
    { id: 'extraction', name: 'Pipeline Extraction', icon: '🔬' },
    { id: 'purification', name: 'Purification', icon: '⚗️' },
    { id: 'visual', name: 'Visuel & Technique', icon: '👁️' },
    { id: 'odors', name: 'Odeurs', icon: '👃' },
    { id: 'texture', name: 'Texture', icon: '🤚' },
    { id: 'tastes', name: 'Goûts', icon: '😋' },
    { id: 'effects', name: 'Effets', icon: '💥' },
  ],
  edible: [
    { id: 'general', name: 'Informations générales', icon: '📋', required: true },
    { id: 'recipe', name: 'Recette', icon: '🥘' },
    { id: 'tastes', name: 'Goûts', icon: '😋' },
    { id: 'effects', name: 'Effets', icon: '💥' },
  ],
};

/**
 * DragDropExport - Éditeur personnalisé avec drag & drop pour exports
 * Disponible pour Producteurs et Influenceurs
 */
const DragDropExport = ({
  productType = 'flower',
  selectedSections = [],
  onSectionsChange,
  format = '1:1',
  className = '',
}) => {
  const { canAccess, isProducer, isPremium } = useAccountType();
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  const availableSections = useMemo(() => {
    return AVAILABLE_SECTIONS[productType] || AVAILABLE_SECTIONS.flower;
  }, [productType]);

  // Sections non encore sélectionnées
  const unselectedSections = useMemo(() => {
    const selectedIds = selectedSections.map(s => s.id);
    return availableSections.filter(s => !selectedIds.includes(s.id));
  }, [availableSections, selectedSections]);

  // Gérer le drag start
  const handleDragStart = useCallback((e, section, index) => {
    setDraggedItem({ section, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(section));
  }, []);

  // Gérer le drag over
  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  // Gérer le drop pour réorganiser
  const handleDrop = useCallback((e, targetIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedItem && draggedItem.index !== targetIndex) {
      const newSections = [...selectedSections];
      const [removed] = newSections.splice(draggedItem.index, 1);
      newSections.splice(targetIndex, 0, removed);
      onSectionsChange?.(newSections);
    }
    setDraggedItem(null);
  }, [draggedItem, selectedSections, onSectionsChange]);

  // Ajouter une section
  const handleAddSection = useCallback((section) => {
    if (section.producerOnly && !isProducer) return;
    
    const newSection = {
      ...section,
      visible: true,
      settings: {},
    };
    onSectionsChange?.([...selectedSections, newSection]);
  }, [selectedSections, onSectionsChange, isProducer]);

  // Supprimer une section
  const handleRemoveSection = useCallback((index) => {
    const section = selectedSections[index];
    if (section.required) return;
    
    const newSections = selectedSections.filter((_, i) => i !== index);
    onSectionsChange?.(newSections);
  }, [selectedSections, onSectionsChange]);

  // Toggle visibilité
  const handleToggleVisibility = useCallback((index) => {
    const newSections = [...selectedSections];
    newSections[index] = {
      ...newSections[index],
      visible: !newSections[index].visible,
    };
    onSectionsChange?.(newSections);
  }, [selectedSections, onSectionsChange]);

  // Déplacer vers le haut/bas
  const handleMoveSection = useCallback((index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedSections.length) return;

    const newSections = [...selectedSections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    onSectionsChange?.(newSections);
  }, [selectedSections, onSectionsChange]);

  return (
    <FeatureGate
      hasAccess={isPremium}
      upgradeType="influencer_pro"
      featureName="le mode personnalisé"
    >
      <div className={`drag-drop-export ${className}`}>
        {/* En-tête */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Mode Personnalisé
          </h3>
          <span className="text-sm text-gray-500">
            {selectedSections.length} sections
          </span>
        </div>

        {/* Sections sélectionnées (zone de drop) */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 min-h-[200px] mb-4">
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Sections incluses (glisser pour réorganiser)
          </div>
          
          {selectedSections.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Glissez des sections ici pour les inclure dans l'export
            </div>
          ) : (
            <div className="space-y-2">
              {selectedSections.map((section, index) => (
                <div
                  key={section.id}
                  draggable={!section.required}
                  onDragStart={(e) => handleDragStart(e, section, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={() => { setDraggedItem(null); setDragOverIndex(null); }}
                  className={`flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-700 border-2 transition-all cursor-move ${dragOverIndex === index ? ' border-dashed' : 'border-transparent'} ${draggedItem?.index === index ? 'opacity-50' : 'opacity-100'} ${!section.visible ? 'opacity-60' : ''}`}
                >
                  {/* Grip handle */}
                  <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  
                  {/* Icon & Name */}
                  <span className="text-xl">{section.icon}</span>
                  <span className="flex-1 font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {section.name}
                  </span>
                  
                  {/* Required badge */}
                  {section.required && (
                    <span className="px-2 py-0.5 dark: dark: text-xs rounded-full">
                      Requis
                    </span>
                  )}
                  
                  {/* Producer badge */}
                  {section.producerOnly && (
                    <span className="px-2 py-0.5 dark: dark: text-xs rounded-full">
                      Pro
                    </span>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveSection(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(index, 'down')}
                      disabled={index === selectedSections.length - 1}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(index)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                    >
                      {section.visible ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {!section.required && (
                      <button
                        onClick={() => handleRemoveSection(index)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sections disponibles */}
        <div>
          <div className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Sections disponibles
          </div>
          <div className="grid grid-cols-2 gap-2">
            {unselectedSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleAddSection(section)}
                disabled={section.producerOnly && !isProducer}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 border-dashed transition-all text-left ${section.producerOnly && !isProducer ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed' : 'border-gray-300 dark:border-gray-600 hover: hover: dark:hover: cursor-pointer' }`}
              >
                <Plus className="w-4 h-4 text-gray-400" />
                <span className="text-lg">{section.icon}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{section.name}</span>
                {section.producerOnly && !isProducer && (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

DragDropExport.propTypes = {
  productType: PropTypes.oneOf(['flower', 'hash', 'concentrate', 'edible']),
  selectedSections: PropTypes.array,
  onSectionsChange: PropTypes.func,
  format: PropTypes.string,
  className: PropTypes.string,
};

export default DragDropExport;

