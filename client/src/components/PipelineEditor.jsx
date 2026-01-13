import React, { useState } from 'react';
import { X, Check, Calendar, Thermometer, Droplets, Clock } from 'lucide-react';
import { LiquidGlass } from '../ui';

/**
 * PipelineEditor - Modale pour éditer les données d'une cellule de pipeline
 */
const PipelineEditor = ({
  cell,
  onSave,
  onClose,
  type = 'culture' // 'culture', 'curing', etc.
}) => {
  const [data, setData] = useState(cell.value || {});

  // Configuration des champs selon le type de pipeline
  const fields = {
    culture: [
      { id: 'temperature', label: 'Température', icon: Thermometer, unit: '°C', type: 'number' },
      { id: 'humidity', label: 'Humidité', icon: Droplets, unit: '%', type: 'number' },
      { id: 'light', label: 'Lumière', icon: Calendar, unit: 'h', type: 'number' }, // 12/12, 18/6
    ],
    curing: [
      { id: 'temperature', label: 'Température', icon: Thermometer, unit: '°C', type: 'number' },
      { id: 'humidity', label: 'Humidité', icon: Droplets, unit: '%', type: 'number' },
      { id: 'burping', label: 'Burping', icon: Clock, unit: 'min', type: 'number' },
    ],
    // Ajouter d'autres configurations si nécessaire
  };

  const currentFields = fields[type] || fields.culture;

  const handleChange = (id, value) => {
    setData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSave = () => {
    onSave && onSave(data);
    onClose && onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4">
      <LiquidGlass variant="modal" className="w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="font-bold text-lg dark:text-white">
            Édition {cell.label}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {currentFields.map(field => (
            <div key={field.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <field.icon className="w-4 h-4" />
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.type}
                  value={data[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  {field.unit}
                </span>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              Notes
            </label>
            <textarea
              value={data.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3 py-2 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none transition-all min-h-[80px]"
              placeholder="Observation particulière..."
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-2 bg-gray-50/50 dark:bg-black/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="liquid-btn liquid-btn--primary"
          >
            <Check className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </LiquidGlass>
    </div>
  );
};

export default PipelineEditor;
