import React, { useState } from 'react';
import { usePipelineStore } from '../store/pipelineStore';
import TimelineGrid from './TimelineGrid';
import PipelineStepModal from './PipelineStepModal';
import LiquidCard from './LiquidCard';
import LiquidButton from './LiquidButton';
import LiquidInput from './LiquidInput';
import { Calendar, Settings } from 'lucide-react';

/**
 * REVIEWS-MAKER MVP - Culture Pipeline Form
 * Formulaire complet pour pipeline de culture
 */

const CulturePipelineForm = ({ onSave }) => {
  const {
    culturePipeline,
    setCultureConfig,
    addCultureStep,
    updateCultureStep,
    deleteCultureStep,
  } = usePipelineStore();

  const [showStepModal, setShowStepModal] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);
  const [showConfig, setShowConfig] = useState(true);

  const { config, steps } = culturePipeline;

  // Calculer maxSteps selon intervalType
  const getMaxSteps = () => {
    switch (config.intervalType) {
      case 'days':
        return 365;
      case 'weeks':
        return 52;
      case 'phases':
        return 12;
      default:
        return 365;
    }
  };

  const handleConfigChange = (field, value) => {
    setCultureConfig({ [field]: value });
  };

  const handleAddStep = (stepIndex) => {
    setSelectedStepIndex(stepIndex);
    setShowStepModal(true);
  };

  const handleSaveStep = (stepData) => {
    if (steps.find((s) => s.stepIndex === stepData.stepIndex)) {
      updateCultureStep(stepData.stepIndex, stepData);
    } else {
      addCultureStep(stepData);
    }
  };

  const handleDeleteStep = (stepData) => {
    deleteCultureStep(stepData.stepIndex);
  };

  const selectedStep = steps.find((s) => s.stepIndex === selectedStepIndex);

  return (
    <div className="space-y-6">
      {/* Configuration Pipeline */}
      <LiquidCard padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} className="text-[var(--accent-primary)]" />
            Configuration Pipeline Culture
          </h3>
          <LiquidButton
            size="sm"
            variant="ghost"
            onClick={() => setShowConfig(!showConfig)}
          >
            {showConfig ? 'Masquer' : 'Afficher'}
          </LiquidButton>
        </div>

        {showConfig && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Type d'intervalle */}
            <div>
              <label className="block text-sm font-medium mb-2">Type d'intervalle</label>
              <select
                value={config.intervalType}
                onChange={(e) => handleConfigChange('intervalType', e.target.value)}
                className="liquid-glass w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-smooth"
              >
                <option value="days">Jours</option>
                <option value="weeks">Semaines</option>
                <option value="phases">Phases</option>
              </select>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {config.intervalType === 'days' && 'Chaque case = 1 jour (max 365)'}
                {config.intervalType === 'weeks' && 'Chaque case = 1 semaine (max 52)'}
                {config.intervalType === 'phases' && '12 phases prédéfinies'}
              </p>
            </div>

            {/* Date début */}
            {config.intervalType !== 'phases' && (
              <LiquidInput
                label="Date de début"
                type="date"
                value={config.startDate || ''}
                onChange={(e) => handleConfigChange('startDate', e.target.value)}
              />
            )}

            {/* Date fin */}
            {config.intervalType !== 'phases' && (
              <LiquidInput
                label="Date de fin (optionnel)"
                type="date"
                value={config.endDate || ''}
                onChange={(e) => handleConfigChange('endDate', e.target.value)}
              />
            )}

            {/* Durée */}
            <LiquidInput
              label={`Durée (${config.intervalType === 'days' ? 'jours' : 'semaines'})`}
              type="number"
              value={config.duration || ''}
              onChange={(e) => handleConfigChange('duration', parseInt(e.target.value) || null)}
              hint="Optionnel si vous avez défini les dates"
            />

            {/* Saison */}
            <div>
              <label className="block text-sm font-medium mb-2">Saison (optionnel)</label>
              <select
                value={config.season || ''}
                onChange={(e) => handleConfigChange('season', e.target.value)}
                className="liquid-glass w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-smooth"
              >
                <option value="">-- Non spécifié --</option>
                <option value="spring">Printemps</option>
                <option value="summer">Été</option>
                <option value="autumn">Automne</option>
                <option value="winter">Hiver</option>
              </select>
            </div>
          </div>
        )}
      </LiquidCard>

      {/* Timeline Grid */}
      <LiquidCard padding="md">
        <TimelineGrid
          steps={steps}
          intervalType={config.intervalType}
          maxSteps={getMaxSteps()}
          onStepClick={(cell) => {
            setSelectedStepIndex(cell.index);
            setShowStepModal(true);
          }}
          onStepAdd={(index) => handleAddStep(index)}
          onStepDelete={(step) => handleDeleteStep(step)}
        />
      </LiquidCard>

      {/* Modal saisie étape */}
      <PipelineStepModal
        isOpen={showStepModal}
        onClose={() => {
          setShowStepModal(false);
          setSelectedStepIndex(null);
        }}
        onSave={handleSaveStep}
        stepData={selectedStep}
        stepIndex={selectedStepIndex}
        stepName={`${config.intervalType === 'days' ? 'Jour' : config.intervalType === 'weeks' ? 'Semaine' : 'Phase'} ${(selectedStepIndex || 0) + 1}`}
        pipelineType="culture"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-tertiary)]">
          {steps.length} étape{steps.length > 1 ? 's' : ''} enregistrée{steps.length > 1 ? 's' : ''}
        </p>

        {onSave && (
          <LiquidButton
            variant="primary"
            onClick={() => onSave(culturePipeline)}
            disabled={steps.length === 0}
          >
            Valider Pipeline
          </LiquidButton>
        )}
      </div>
    </div>
  );
};

export default CulturePipelineForm;

