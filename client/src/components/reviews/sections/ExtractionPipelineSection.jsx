/**
 * Section Pipeline Extraction (Concentrés)
 * Phase 2.2 - Pipeline Extraction avec purification
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, Thermometer, Gauge, Droplets, Zap, Beaker, 
  Plus, Trash2, AlertCircle, TrendingUp, FlaskConical 
} from 'lucide-react';
import { 
  EXTRACTION_METHODS,
  PURIFICATION_METHODS,
  TIMELINE_INTERVALS,
  OIL_TYPES,
  SOLVENT_TYPES,
  getAllExtractionMethods,
  getAllPurificationMethods,
  estimatePurity
} from '../../../data/extractionMethods';

const ExtractionPipelineSection = ({ data = {}, onChange }) => {
  const [config, setConfig] = useState({
    timelineInterval: data.timelineInterval || 'minutes',
    duration: data.duration || 120,
    method: data.method || 'bho',
    ...data
  });

  const [extractionParams, setExtractionParams] = useState({
    temperature: data.extractionParams?.temperature || 25,
    pressure: data.extractionParams?.pressure || 50,
    duration: data.extractionParams?.duration || 60,
    solventVolume: data.extractionParams?.solventVolume || 500,
    passes: data.extractionParams?.passes || 1,
    oilType: data.extractionParams?.oilType || 'coconut',
    solvent: data.extractionParams?.solvent || 'ethanol',
    ...data.extractionParams
  });

  const [purificationSteps, setPurificationSteps] = useState(data.purificationSteps || []);
  const [customSteps, setCustomSteps] = useState(data.customSteps || []);

  const selectedMethod = EXTRACTION_METHODS[config.method];
  const selectedInterval = TIMELINE_INTERVALS.find(i => i.id === config.timelineInterval);

  useEffect(() => {
    onChange?.({
      timelineInterval: config.timelineInterval,
      duration: config.duration,
      method: config.method,
      extractionParams,
      purificationSteps,
      customSteps,
      estimatedPurity: estimatePurity(config.method, purificationSteps)
    });
  }, [config, extractionParams, purificationSteps, customSteps]);

  const handleAddPurificationStep = () => {
    const newStep = {
      id: Date.now(),
      method: 'winterization',
      parameters: {},
      timestamp: purificationSteps.length > 0 ? purificationSteps[purificationSteps.length - 1].timestamp + 10 : 10
    };
    setPurificationSteps([...purificationSteps, newStep]);
  };

  const handleRemovePurificationStep = (stepId) => {
    setPurificationSteps(purificationSteps.filter(s => s.id !== stepId));
  };

  const handlePurificationChange = (stepId, field, value) => {
    setPurificationSteps(purificationSteps.map(s =>
      s.id === stepId ? { ...s, [field]: value } : s
    ));
  };

  const handleAddCustomStep = () => {
    const newStep = {
      id: Date.now(),
      timestamp: customSteps.length > 0 ? customSteps[customSteps.length - 1].timestamp + 5 : 5,
      action: '',
      notes: ''
    };
    setCustomSteps([...customSteps, newStep]);
  };

  const handleRemoveCustomStep = (stepId) => {
    setCustomSteps(customSteps.filter(s => s.id !== stepId));
  };

  const handleCustomStepChange = (stepId, field, value) => {
    setCustomSteps(customSteps.map(s =>
      s.id === stepId ? { ...s, [field]: value } : s
    ));
  };

  const getCategoryColor = (category) => {
    const colors = {
      solvent: 'purple',
      hydrocarbon: 'red',
      gas: 'cyan',
      natural: 'green',
      mechanical: 'amber',
      advanced: 'blue',
      custom: 'gray'
    };
    return colors[category] || 'gray';
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Pipeline Extraction</h3>
        <p className="text-gray-600">Configurez la méthode d'extraction et les étapes de purification</p>
      </div>

      {/* Configuration Timeline */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900">Configuration de la trame</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalle temporel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIMELINE_INTERVALS.map(interval => (
                <button
                  key={interval.id}
                  onClick={() => setConfig({ ...config, timelineInterval: interval.id })}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    config.timelineInterval === interval.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée totale ({selectedInterval?.unit})
            </label>
            <input
              type="number"
              min="1"
              max={selectedInterval?.max || 1440}
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Méthode d'extraction */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Beaker className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-900">Méthode d'extraction</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {getAllExtractionMethods().map(method => {
            const colorClass = getCategoryColor(method.category);
            return (
              <button
                key={method.id}
                onClick={() => setConfig({ ...config, method: method.id })}
                className={`p-4 rounded-xl text-center transition-all ${
                  config.method === method.id
                    ? `bg-${colorClass}-500 text-white shadow-lg scale-105`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-3xl mb-2">{method.icon}</div>
                <div className="font-medium text-xs">{method.label}</div>
              </button>
            );
          })}
        </div>

        {selectedMethod && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 text-center mb-3">{selectedMethod.description}</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                Pureté: {selectedMethod.purityRange[0]}-{selectedMethod.purityRange[1]}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Paramètres extraction */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <FlaskConical className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-gray-900">Paramètres d'extraction</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Température (si applicable) */}
          {selectedMethod?.fields.includes('temperature') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 inline mr-2" />
                Température: {extractionParams.temperature}°C
              </label>
              <input
                type="range"
                min={config.method === 'hotPress' ? 60 : -20}
                max={config.method === 'hotPress' ? 120 : 100}
                value={extractionParams.temperature}
                onChange={(e) => setExtractionParams({ ...extractionParams, temperature: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{config.method === 'hotPress' ? '60°C' : '-20°C'}</span>
                <span>{config.method === 'hotPress' ? '120°C' : '100°C'}</span>
              </div>
            </div>
          )}

          {/* Pression (si applicable) */}
          {selectedMethod?.fields.includes('pressure') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Gauge className="w-4 h-4 inline mr-2" />
                Pression: {extractionParams.pressure} 
                {config.method === 'co2' ? ' bar' : ' PSI'}
              </label>
              <input
                type="range"
                min={config.method === 'co2' ? 50 : 10}
                max={config.method === 'co2' ? 300 : 200}
                value={extractionParams.pressure}
                onChange={(e) => setExtractionParams({ ...extractionParams, pressure: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{config.method === 'co2' ? '50 bar' : '10 PSI'}</span>
                <span>{config.method === 'co2' ? '300 bar' : '200 PSI'}</span>
              </div>
            </div>
          )}

          {/* Volume solvant (si applicable) */}
          {selectedMethod?.fields.includes('solventVolume') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4 inline mr-2" />
                Volume solvant (mL)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                step="50"
                value={extractionParams.solventVolume}
                onChange={(e) => setExtractionParams({ ...extractionParams, solventVolume: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Durée (toujours applicable) */}
          {selectedMethod?.fields.includes('duration') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Durée (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={extractionParams.duration}
                onChange={(e) => setExtractionParams({ ...extractionParams, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Type huile (si végétale) */}
          {selectedMethod?.fields.includes('oilType') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type d'huile</label>
              <div className="grid grid-cols-2 gap-2">
                {OIL_TYPES.map(oil => (
                  <button
                    key={oil.id}
                    onClick={() => setExtractionParams({ ...extractionParams, oilType: oil.id })}
                    className={`p-3 rounded-xl transition-all ${
                      extractionParams.oilType === oil.id
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-xl mb-1">{oil.icon}</div>
                    <div className="text-xs font-medium">{oil.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Type solvant (si applicable) */}
          {selectedMethod?.fields.includes('solvent') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de solvant</label>
              <select
                value={extractionParams.solvent}
                onChange={(e) => setExtractionParams({ ...extractionParams, solvent: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
              >
                {SOLVENT_TYPES.map(solvent => (
                  <option key={solvent.id} value={solvent.id}>
                    {solvent.label} ({solvent.purity}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nombre de passes (si applicable) */}
          {selectedMethod?.fields.includes('passes') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de passes: {extractionParams.passes}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={extractionParams.passes}
                onChange={(e) => setExtractionParams({ ...extractionParams, passes: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Purification */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h4 className="font-semibold text-gray-900">Pipeline Purification</h4>
          </div>
          <button
            onClick={handleAddPurificationStep}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter étape
          </button>
        </div>

        {purificationSteps.length === 0 ? (
          <div className="text-center py-8 bg-amber-50 rounded-xl border border-amber-200">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
            <p className="text-gray-600">
              Aucune étape de purification. Ajoutez des étapes pour améliorer la pureté.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {purificationSteps.map((step, index) => {
              const purificationMethod = PURIFICATION_METHODS[step.method];
              return (
                <div key={step.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <select
                          value={step.method}
                          onChange={(e) => handlePurificationChange(step.id, 'method', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500"
                        >
                          {getAllPurificationMethods().map(method => (
                            <option key={method.id} value={method.id}>
                              {method.icon} {method.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-600 mt-1">{purificationMethod?.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemovePurificationStep(step.id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Paramètres spécifiques méthode purification */}
                  {purificationMethod?.fields && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {purificationMethod.fields.map(field => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            {field === 'temperature' && '🌡️ Température (°C)'}
                            {field === 'duration' && '⏱️ Durée (min)'}
                            {field === 'pressure' && '📊 Pression (bar)'}
                            {field === 'solvent' && '💧 Solvant'}
                            {field === 'filterSize' && '🔬 Taille filtre (µ)'}
                            {field === 'speed' && '🌀 Vitesse (rpm)'}
                            {field === 'passes' && '🔄 Passes'}
                            {field === 'columnType' && '🧪 Type colonne'}
                          </label>
                          {field === 'solvent' || field === 'columnType' ? (
                            <input
                              type="text"
                              placeholder={`Saisir ${field}...`}
                              className="w-full px-2 py-1 rounded-lg border border-amber-300 text-sm"
                              onChange={(e) => {
                                const params = step.parameters || {};
                                params[field] = e.target.value;
                                handlePurificationChange(step.id, 'parameters', params);
                              }}
                            />
                          ) : (
                            <input
                              type="number"
                              placeholder="..."
                              className="w-full px-2 py-1 rounded-lg border border-amber-300 text-sm"
                              onChange={(e) => {
                                const params = step.parameters || {};
                                params[field] = parseInt(e.target.value);
                                handlePurificationChange(step.id, 'parameters', params);
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pureté estimée */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <div className="text-sm opacity-90">Pureté estimée</div>
              <div className="text-3xl font-bold">
                {estimatePurity(config.method, purificationSteps)}%
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Étapes purification</div>
            <div className="text-2xl font-bold">{purificationSteps.length}</div>
          </div>
        </div>
      </div>

      {/* Étapes personnalisées */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Étapes personnalisées</h4>
          <button
            onClick={handleAddCustomStep}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        {customSteps.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune étape personnalisée</p>
        ) : (
          <div className="space-y-3">
            {customSteps.map((step, index) => (
              <div key={step.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <input
                      type="number"
                      value={step.timestamp}
                      onChange={(e) => handleCustomStepChange(step.id, 'timestamp', parseInt(e.target.value))}
                      className="w-20 px-2 py-1 rounded-lg border border-gray-300 text-sm"
                      placeholder="Temps"
                    />
                    <span className="text-sm text-gray-600">{selectedInterval?.unit}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveCustomStep(step.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={step.action}
                  onChange={(e) => handleCustomStepChange(step.id, 'action', e.target.value)}
                  placeholder="Action effectuée..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 mb-2 text-sm"
                />
                <textarea
                  value={step.notes}
                  onChange={(e) => handleCustomStepChange(step.id, 'notes', e.target.value)}
                  placeholder="Notes (max 500 caractères)..."
                  maxLength={500}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtractionPipelineSection;
