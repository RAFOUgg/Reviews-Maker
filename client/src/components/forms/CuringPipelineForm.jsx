import React, { useState } from 'react';
import { usePipelineStore } from '../../store/pipelineStore';
import TimelineGrid from './TimelineGrid';
import PipelineStepModal from './PipelineStepModal';
import LiquidCard from './LiquidCard';
import LiquidButton from './LiquidButton';
import LiquidInput from './LiquidInput';
import { Snowflake, Flame } from 'lucide-react';

/**
 * REVIEWS-MAKER MVP - Curing Pipeline Form
 * Formulaire pour pipeline de curing/maturation
 */

const CuringPipelineForm = ({ onSave }) => {
  const {
    curingPipeline,
    setCuringConfig,
    addCuringStep,
    updateCuringStep,
    deleteCuringStep,
  } = usePipelineStore();

  const [showStepModal, setShowStepModal] = useState(false);
  const [selectedStepIndex, setSelectedStepIndex] = useState(null);

  const { config, steps } = curingPipeline;

  const handleConfigChange = (field, value) => {
    setCuringConfig({ [field]: value });
  };

  const handleAddStep = (stepIndex) => {
    setSelectedStepIndex(stepIndex);
    setShowStepModal(true);
  };

  const handleSaveStep = (stepData) => {
    if (steps.find((s) => s.stepIndex === stepData.stepIndex)) {
      updateCuringStep(stepData.stepIndex, stepData);
    } else {
      addCuringStep(stepData);
    }
  };

  const handleDeleteStep = (stepData) => {
    deleteCuringStep(stepData.stepIndex);
  };

  const getMaxSteps = () => {
    switch (config.intervalType) {
      case 'hours':
        return 168; // 7 jours
      case 'days':
        return 90; // 3 mois
      case 'weeks':
        return 52;
      case 'months':
        return 12;
      default:
        return 90;
    }
  };

  const selectedStep = steps.find((s) => s.stepIndex === selectedStepIndex);

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <LiquidCard padding="md">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          {config.curingType === 'cold' ? (
            <Snowflake size={24} className="" />
          ) : (
            <Flame size={24} className="text-orange-500" />
          )}
          Configuration Curing/Maturation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type curing */}
          <div>
            <label className="block text-sm font-medium mb-2">Type de curing</label>
            <select
              value={config.curingType}
              onChange={(e) => handleConfigChange('curingType', e.target.value)}
              className="liquid-glass w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-smooth"
            >
              <option value="cold">Froid (&lt; 5°C)</option>
              <option value="warm">Chaud (&gt; 5°C)</option>
            </select>
          </div>

          {/* Intervalle */}
          <div>
            <label className="block text-sm font-medium mb-2">Intervalle de temps</label>
            <select
              value={config.intervalType}
              onChange={(e) => handleConfigChange('intervalType', e.target.value)}
              className="liquid-glass w-full px-4 py-3 rounded-xl border border-[var(--border-primary)] focus:border-[var(--accent-primary)] outline-none transition-smooth"
            >
              <option value="hours">Heures</option>
              <option value="days">Jours</option>
              <option value="weeks">Semaines</option>
              <option value="months">Mois</option>
            </select>
          </div>

          {/* Durée */}
          <LiquidInput
            label={`Durée totale (${config.intervalType})`}
            type="number"
            value={config.duration || ''}
            onChange={(e) => handleConfigChange('duration', parseInt(e.target.value) || null)}
            hint="Durée totale du curing"
          />
        </div>
      </LiquidCard>

      {/* Timeline */}
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

      {/* Modal */}
      <PipelineStepModal
        isOpen={showStepModal}
        onClose={() => {
          setShowStepModal(false);
          setSelectedStepIndex(null);
        }}
        onSave={handleSaveStep}
        stepData={selectedStep}
        stepIndex={selectedStepIndex}
        stepName={`${config.intervalType === 'hours' ? 'Heure' : config.intervalType === 'days' ? 'Jour' : config.intervalType === 'weeks' ? 'Semaine' : 'Mois'} ${(selectedStepIndex || 0) + 1}`}
        pipelineType="curing"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-tertiary)]">
          {steps.length} point{steps.length > 1 ? 's' : ''} de contrôle
        </p>

        {onSave && (
          <LiquidButton
            variant="primary"
            onClick={() => onSave(curingPipeline)}
          >
            Valider Curing
          </LiquidButton>
        )}
      </div>
    </div>
  );
};

export default CuringPipelineForm;


