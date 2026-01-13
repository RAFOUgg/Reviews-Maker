import React, { useState } from 'react';
import LiquidModal from './LiquidModal';
import LiquidButton from './LiquidButton';
import LiquidInput from './LiquidInput';
import { Save, X } from 'lucide-react';

/**
 * REVIEWS-MAKER MVP - Pipeline Step Modal
 * Modal pour saisir/modifier données d'une étape de pipeline
 */

const PipelineStepModal = ({
  isOpen,
  onClose,
  onSave,
  stepData = null,
  stepIndex,
  stepName,
  pipelineType = 'culture', // 'culture', 'curing'
}) => {
  const [formData, setFormData] = useState(stepData?.data || {});
  const [notes, setNotes] = useState(stepData?.notes || '');

  // Champs selon type de pipeline
  const getFields = () => {
    if (pipelineType === 'culture') {
      return [
        { key: 'mode', label: 'Mode culture', type: 'select', options: ['Indoor', 'Outdoor', 'Greenhouse', 'No-till', 'Autre'] },
        { key: 'substrat', label: 'Substrat', type: 'text' },
        { key: 'substratVolume', label: 'Volume substrat (L)', type: 'number' },
        { key: 'irrigation', label: 'Système irrigation', type: 'select', options: ['Goutte à goutte', 'Inondation', 'Manuel', 'Autre'] },
        { key: 'irrigationFrequence', label: 'Fréquence irrigation', type: 'text' },
        { key: 'engrais', label: 'Engrais', type: 'text' },
        { key: 'engraisDosage', label: 'Dosage (g/L ou ml/L)', type: 'text' },
        { key: 'lumiere', label: 'Type lumière', type: 'select', options: ['LED', 'HPS', 'CFL', 'Naturel', 'Mixte'] },
        { key: 'lumierePuissance', label: 'Puissance (W)', type: 'number' },
        { key: 'lumiereDistance', label: 'Distance lampe/plante (cm)', type: 'number' },
        { key: 'lumiereDuree', label: 'Durée éclairage (h/jour)', type: 'number' },
        { key: 'temperature', label: 'Température (°C)', type: 'number' },
        { key: 'humidite', label: 'Humidité (%)', type: 'number' },
        { key: 'co2', label: 'CO2 (ppm)', type: 'number' },
        { key: 'palissage', label: 'Palissage', type: 'select', options: ['Aucun', 'LST', 'HST', 'SCROG', 'SOG', 'Main-Lining', 'Autre'] },
        { key: 'taille', label: 'Taille plante (cm)', type: 'number' },
        { key: 'nombreBranches', label: 'Nombre branches', type: 'number' },
      ];
    }

    if (pipelineType === 'curing') {
      return [
        { key: 'temperature', label: 'Température (°C)', type: 'number' },
        { key: 'humidite', label: 'Humidité (%)', type: 'number' },
        { key: 'recipient', label: 'Type récipient', type: 'select', options: ['Aire libre', 'Verre', 'Plastique', 'Autre'] },
        { key: 'emballage', label: 'Emballage primaire', type: 'select', options: ['Cellophane', 'Papier cuisson', 'Aluminium', 'Paper hash', 'Sac à vide', 'Sous vide', 'Autre'] },
        { key: 'opacite', label: 'Opacité', type: 'select', options: ['Opaque', 'Semi-opaque', 'Transparent', 'Ambré'] },
        { key: 'volume', label: 'Volume occupé (L/mL)', type: 'number' },
      ];
    }

    return [];
  };

  const fields = getFields();

  const handleChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave({
      stepIndex,
      stepName,
      data: formData,
      notes,
    });
    onClose();
  };

  return (
    <LiquidModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${stepData ? 'Modifier' : 'Ajouter'} - ${stepName}`}
      size="lg"
      footer={
        <>
          <LiquidButton variant="ghost" onClick={onClose} icon={X}>
            Annuler
          </LiquidButton>
          <LiquidButton variant="primary" onClick={handleSave} icon={Save}>
            Enregistrer
          </LiquidButton>
        </>
      }
    >
      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
        {/* Formulaire dynamique */}
        {fields.map((field) => (
          <div key={field.key}>
            {field.type === 'select' ? (
              <div>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="liquid-glass w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-smooth"
                >
                  <option value="">-- Sélectionner --</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <LiquidInput
                label={field.label}
                type={field.type}
                value={formData[field.key] || ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.label}
              />
            )}
          </div>
        ))}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes (optionnel, max 500 car.)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            placeholder="Ajouter des notes sur cette étape..."
            maxLength={500}
            rows={4}
            className="liquid-glass w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-smooth resize-none"
          />
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            {notes.length}/500 caractères
          </p>
        </div>
      </div>
    </LiquidModal>
  );
};

export default PipelineStepModal;

