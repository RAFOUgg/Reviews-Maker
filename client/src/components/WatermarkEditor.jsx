import React, { useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { 
  Image, Type, Move, RotateCcw, Trash2, Download,
  AlignLeft, AlignCenter, AlignRight, Eye, EyeOff,
  Plus, Minus, Lock
} from 'lucide-react';
import { useAccountType } from '../hooks/useAccountType';
import { FeatureGate } from './FeatureGate';

/**
 * WatermarkEditor - Éditeur de filigrane personnalisé
 * Permet d'ajouter texte ou image en watermark sur les exports
 */
const WatermarkEditor = ({
  watermark,
  onWatermarkChange,
  previewSize = { width: 400, height: 400 },
  className = '',
}) => {
  const { isPremium } = useAccountType();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // État initial du watermark
  const defaultWatermark = {
    type: 'text', // 'text' | 'image'
    content: '',
    imageUrl: null,
    position: { x: 50, y: 90 }, // pourcentages
    size: 20,
    opacity: 30,
    rotation: 0,
    color: '#ffffff',
    fontFamily: 'Arial',
    visible: true,
  };

  const currentWatermark = { ...defaultWatermark, ...watermark };

  const handleChange = (key, value) => {
    onWatermarkChange?.({ ...currentWatermark, [key]: value });
  };

  // Upload image
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleChange('imageUrl', event.target?.result);
        handleChange('type', 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag pour position
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = ((e.clientX - dragStart.x) / previewSize.width) * 100;
    const deltaY = ((e.clientY - dragStart.y) / previewSize.height) * 100;
    
    const newX = Math.min(100, Math.max(0, currentWatermark.position.x + deltaX));
    const newY = Math.min(100, Math.max(0, currentWatermark.position.y + deltaY));
    
    handleChange('position', { x: newX, y: newY });
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, currentWatermark.position, previewSize]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Positions prédéfinies
  const presetPositions = [
    { name: 'Haut gauche', x: 10, y: 10 },
    { name: 'Haut centre', x: 50, y: 10 },
    { name: 'Haut droite', x: 90, y: 10 },
    { name: 'Centre', x: 50, y: 50 },
    { name: 'Bas gauche', x: 10, y: 90 },
    { name: 'Bas centre', x: 50, y: 90 },
    { name: 'Bas droite', x: 90, y: 90 },
  ];

  return (
    <FeatureGate
      hasAccess={isPremium}
      upgradeType="influencer_pro"
      featureName="les filigranes personnalisés"
    >
      <div className={`watermark-editor ${className}`}>
        {/* Type de watermark */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleChange('type', 'text')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${ currentWatermark.type === 'text' ? ' text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' }`}
          >
            <Type className="w-4 h-4" />
            Texte
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${ currentWatermark.type === 'image' ? ' text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' }`}
          >
            <Image className="w-4 h-4" />
            Image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Contenu texte */}
        {currentWatermark.type === 'text' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Texte du filigrane
            </label>
            <input
              type="text"
              value={currentWatermark.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="© Votre nom"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
          </div>
        )}

        {/* Preview image */}
        {currentWatermark.type === 'image' && currentWatermark.imageUrl && (
          <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <img 
              src={currentWatermark.imageUrl} 
              alt="Watermark preview" 
              className="max-h-20 mx-auto"
            />
            <button
              onClick={() => { handleChange('imageUrl', null); handleChange('type', 'text'); }}
              className="mt-2 w-full py-1 text-red-500 text-sm hover:underline"
            >
              Supprimer l'image
            </button>
          </div>
        )}

        {/* Contrôles */}
        <div className="space-y-4">
          {/* Taille */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Taille</span>
              <span>{currentWatermark.size}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={currentWatermark.size}
              onChange={(e) => handleChange('size', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Opacité */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Opacité</span>
              <span>{currentWatermark.opacity}%</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={currentWatermark.opacity}
              onChange={(e) => handleChange('opacity', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Rotation */}
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>Rotation</span>
              <span>{currentWatermark.rotation}°</span>
            </label>
            <input
              type="range"
              min="-45"
              max="45"
              value={currentWatermark.rotation}
              onChange={(e) => handleChange('rotation', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Couleur (texte seulement) */}
          {currentWatermark.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Couleur
              </label>
              <div className="flex gap-2">
                {['#ffffff', '#000000', '#9333EA', '#10B981', '#F59E0B'].map((color) => (
                  <button
                    key={color}
                    onClick={() => handleChange('color', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${ currentWatermark.color === color ? ' scale-110' : 'border-gray-300' }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <input
                  type="color"
                  value={currentWatermark.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Position rapide */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetPositions.map((pos) => (
                <button
                  key={pos.name}
                  onClick={() => handleChange('position', { x: pos.x, y: pos.y })}
                  className={`px-2 py-1 text-xs rounded transition-all ${ Math.abs(currentWatermark.position.x - pos.x) < 5 && Math.abs(currentWatermark.position.y - pos.y) < 5 ? ' text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600' }`}
                >
                  {pos.name}
                </button>
              ))}
            </div>
          </div>

          {/* Visibilité */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">Afficher le filigrane</span>
            <button
              onClick={() => handleChange('visible', !currentWatermark.visible)}
              className={`p-2 rounded-lg transition-all ${ currentWatermark.visible ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400' }`}
            >
              {currentWatermark.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
};

WatermarkEditor.propTypes = {
  watermark: PropTypes.object,
  onWatermarkChange: PropTypes.func,
  previewSize: PropTypes.shape({ width: PropTypes.number, height: PropTypes.number }),
  className: PropTypes.string,
};

export default WatermarkEditor;



