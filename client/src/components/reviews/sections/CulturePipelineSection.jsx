/**
 * Section Pipeline Culture (Fleurs)
 * Phase 2.3 - Pipeline Culture avec 12 phases de croissance
 */

import React, { useState, useEffect } from 'react';
import { 
  Sprout, Home, Sun, Droplets, Thermometer, Wind, Zap,
  Ruler, Weight, TrendingUp, Calendar, Plus, Settings,
  Edit2, Check, X, AlertCircle
} from 'lucide-react';
import { 
  GROWTH_PHASES,
  CULTIVATION_MODES,
  SPACE_TYPES,
  PROPAGATION_METHODS,
  GERMINATION_METHODS,
  SUBSTRATE_TYPES,
  IRRIGATION_SYSTEMS,
  LIGHT_TYPES,
  SPECTRUM_TYPES,
  TRAINING_METHODS,
  TRICHOME_COLORS,
  FERTILIZER_TYPES,
  calculateTotalDuration,
  estimateYield
} from '../../../data/cultureMethods';

const CulturePipelineSection = ({ data = {}, onChange }) => {
  const [config, setConfig] = useState({
    mode: data.mode || 'indoor',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    endDate: data.endDate || '',
    startPhase: data.startPhase || 'seed',
    endPhase: data.endPhase || 'flower-late',
    ...data
  });

  const [space, setSpace] = useState({
    type: data.space?.type || 'tent',
    width: data.space?.width || 100,
    length: data.space?.length || 100,
    height: data.space?.height || 200,
    plantCount: data.space?.plantCount || 1,
    ...data.space
  });

  const [propagation, setPropagation] = useState({
    method: data.propagation?.method || 'seed',
    germinationMethod: data.propagation?.germinationMethod || 'paper-towel',
    ...data.propagation
  });

  const [environment, setEnvironment] = useState({
    substrate: data.environment?.substrate || 'soil-bio',
    irrigation: data.environment?.irrigation || 'manual',
    lightType: data.environment?.lightType || 'led',
    lightPower: data.environment?.lightPower || 200,
    lightDistance: data.environment?.lightDistance || 40,
    lightSchedule: data.environment?.lightSchedule || '18/6',
    spectrum: data.environment?.spectrum || 'full',
    temperature: data.environment?.temperature || 24,
    humidity: data.environment?.humidity || 60,
    co2: data.environment?.co2 || 400,
    ventilation: data.environment?.ventilation || 'passive',
    ...data.environment
  });

  const [fertilization, setFertilization] = useState({
    type: data.fertilization?.type || 'bio',
    brands: data.fertilization?.brands || [],
    frequency: data.fertilization?.frequency || 'weekly',
    ...data.fertilization
  });

  const [training, setTraining] = useState(data.training || []);
  const [phaseData, setPhaseData] = useState(data.phaseData || {});
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [harvest, setHarvest] = useState({
    trichomeColor: data.harvest?.trichomeColor || 'milky',
    date: data.harvest?.date || '',
    wetWeight: data.harvest?.wetWeight || 0,
    dryWeight: data.harvest?.dryWeight || 0,
    ...data.harvest
  });

  const cultivationMode = CULTIVATION_MODES.find(m => m.id === config.mode);
  const totalDuration = calculateTotalDuration(config.startPhase, config.endPhase);
  const estimatedYield = estimateYield(
    space.width * space.length / 10000, 
    environment.lightPower, 
    space.plantCount, 
    config.mode
  );

  useEffect(() => {
    onChange?.({
      mode: config.mode,
      startDate: config.startDate,
      endDate: config.endDate,
      startPhase: config.startPhase,
      endPhase: config.endPhase,
      space,
      propagation,
      environment,
      fertilization,
      training,
      phaseData,
      harvest,
      estimatedYield,
      totalDuration
    });
  }, [config, space, propagation, environment, fertilization, training, phaseData, harvest]);

  const getPhaseProgress = (phaseId) => {
    const phase = GROWTH_PHASES.find(p => p.id === phaseId);
    const startPhase = GROWTH_PHASES.find(p => p.id === config.startPhase);
    const endPhase = GROWTH_PHASES.find(p => p.id === config.endPhase);
    
    if (!phase || !startPhase || !endPhase) return 0;
    if (phase.order < startPhase.order || phase.order > endPhase.order) return 0;
    
    return 100;
  };

  const toggleTraining = (methodId) => {
    if (training.includes(methodId)) {
      setTraining(training.filter(t => t !== methodId));
    } else {
      setTraining([...training, methodId]);
    }
  };

  const updatePhaseData = (phaseId, field, value) => {
    setPhaseData({
      ...phaseData,
      [phaseId]: {
        ...phaseData[phaseId],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Pipeline Culture</h3>
        <p className="text-gray-600">Configurez les 12 phases de croissance et suivez l'évolution</p>
      </div>

      {/* Mode de culture */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-gray-900">Mode de culture</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CULTIVATION_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setConfig({ ...config, mode: mode.id })}
              className={`p-4 rounded-xl text-center transition-all ${
                config.mode === mode.id
                  ? 'bg-green-500 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="font-medium text-sm">{mode.label}</div>
            </button>
          ))}
        </div>

        {cultivationMode && (
          <p className="mt-4 text-sm text-gray-600 text-center">{cultivationMode.description}</p>
        )}
      </div>

      {/* Dates et phases */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900">Période de culture</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin (optionnel)
            </label>
            <input
              type="date"
              value={config.endDate}
              onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-purple-50 rounded-xl">
          <div className="text-sm text-gray-600 mb-2">Durée totale estimée</div>
          <div className="text-2xl font-bold text-purple-600">{totalDuration} jours</div>
        </div>
      </div>

      {/* Espace de culture */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Ruler className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-900">Espace de culture</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'espace</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {SPACE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSpace({ ...space, type: type.id })}
                  className={`p-3 rounded-xl transition-all ${
                    space.type === type.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Largeur (cm)</label>
              <input
                type="number"
                min="10"
                value={space.width}
                onChange={(e) => setSpace({ ...space, width: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longueur (cm)</label>
              <input
                type="number"
                min="10"
                value={space.length}
                onChange={(e) => setSpace({ ...space, length: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hauteur (cm)</label>
              <input
                type="number"
                min="10"
                value={space.height}
                onChange={(e) => setSpace({ ...space, height: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nb plantes</label>
              <input
                type="number"
                min="1"
                value={space.plantCount}
                onChange={(e) => setSpace({ ...space, plantCount: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-sm text-gray-600">Volume total</div>
            <div className="text-xl font-bold text-blue-600">
              {((space.width * space.length * space.height) / 1000000).toFixed(2)} m³
            </div>
          </div>
        </div>
      </div>

      {/* Propagation */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sprout className="w-5 h-5 text-emerald-500" />
          <h4 className="font-semibold text-gray-900">Propagation</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Méthode</label>
            <div className="grid grid-cols-2 gap-2">
              {PROPAGATION_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => setPropagation({ ...propagation, method: method.id })}
                  className={`p-3 rounded-xl transition-all ${
                    propagation.method === method.id
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{method.icon}</div>
                  <div className="text-xs font-medium">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          {propagation.method === 'seed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Germination</label>
              <select
                value={propagation.germinationMethod}
                onChange={(e) => setPropagation({ ...propagation, germinationMethod: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500"
              >
                {GERMINATION_METHODS.map(method => (
                  <option key={method.id} value={method.id}>
                    {method.icon} {method.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Environnement */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-cyan-500" />
          <h4 className="font-semibold text-gray-900">Environnement</h4>
        </div>

        <div className="space-y-6">
          {/* Substrat */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Substrat</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SUBSTRATE_TYPES.map(substrate => (
                <button
                  key={substrate.id}
                  onClick={() => setEnvironment({ ...environment, substrate: substrate.id })}
                  className={`p-3 rounded-xl transition-all ${
                    environment.substrate === substrate.id
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xl mb-1">{substrate.icon}</div>
                  <div className="text-xs font-medium">{substrate.label}</div>
                  <div className="text-xs opacity-75">{substrate.category}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Irrigation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplets className="w-4 h-4 inline mr-2" />
              Irrigation
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {IRRIGATION_SYSTEMS.map(system => (
                <button
                  key={system.id}
                  onClick={() => setEnvironment({ ...environment, irrigation: system.id })}
                  className={`p-3 rounded-xl transition-all ${
                    environment.irrigation === system.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-xl mb-1">{system.icon}</div>
                  <div className="text-xs font-medium">{system.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lumière */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Sun className="w-4 h-4 inline mr-2" />
              Éclairage
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Type</label>
                <select
                  value={environment.lightType}
                  onChange={(e) => setEnvironment({ ...environment, lightType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                >
                  {LIGHT_TYPES.map(light => (
                    <option key={light.id} value={light.id}>
                      {light.icon} {light.label} ({light.efficiency}%)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Puissance (W)</label>
                <input
                  type="number"
                  min="10"
                  max="2000"
                  value={environment.lightPower}
                  onChange={(e) => setEnvironment({ ...environment, lightPower: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Distance (cm)</label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={environment.lightDistance}
                  onChange={(e) => setEnvironment({ ...environment, lightDistance: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Cycle (h)</label>
                <select
                  value={environment.lightSchedule}
                  onChange={(e) => setEnvironment({ ...environment, lightSchedule: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="24/0">24/0</option>
                  <option value="20/4">20/4</option>
                  <option value="18/6">18/6</option>
                  <option value="16/8">16/8</option>
                  <option value="12/12">12/12</option>
                  <option value="natural">Naturel</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Spectre</label>
                <select
                  value={environment.spectrum}
                  onChange={(e) => setEnvironment({ ...environment, spectrum: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500"
                >
                  {SPECTRUM_TYPES.map(spectrum => (
                    <option key={spectrum.id} value={spectrum.id}>
                      {spectrum.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Climat */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 inline mr-2" />
                Température: {environment.temperature}°C
              </label>
              <input
                type="range"
                min="15"
                max="35"
                value={environment.temperature}
                onChange={(e) => setEnvironment({ ...environment, temperature: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4 inline mr-2" />
                Humidité: {environment.humidity}%
              </label>
              <input
                type="range"
                min="20"
                max="90"
                value={environment.humidity}
                onChange={(e) => setEnvironment({ ...environment, humidity: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Wind className="w-4 h-4 inline mr-2" />
                CO₂: {environment.co2} ppm
              </label>
              <input
                type="range"
                min="300"
                max="1500"
                step="50"
                value={environment.co2}
                onChange={(e) => setEnvironment({ ...environment, co2: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ventilation</label>
              <select
                value={environment.ventilation}
                onChange={(e) => setEnvironment({ ...environment, ventilation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-cyan-500"
              >
                <option value="passive">Passive</option>
                <option value="active">Active</option>
                <option value="extraction">Extraction</option>
                <option value="intraction">Intraction</option>
                <option value="both">Les deux</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Palissage */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h4 className="font-semibold text-gray-900">Palissage LST/HST</h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {TRAINING_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => toggleTraining(method.id)}
              className={`p-4 rounded-xl text-left transition-all ${
                training.includes(method.id)
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <div className="font-medium text-sm">{method.label}</div>
                  <div className="text-xs opacity-75">{method.type}</div>
                </div>
              </div>
              <div className="text-xs">{method.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Récolte */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Weight className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900">Récolte</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur trichomes (maturité)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {TRICHOME_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setHarvest({ ...harvest, trichomeColor: color.id })}
                  className={`p-3 rounded-xl transition-all ${
                    harvest.trichomeColor === color.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{color.icon}</div>
                  <div className="text-xs font-medium">{color.label}</div>
                  <div className="text-xs opacity-75">{color.maturity}%</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date récolte</label>
              <input
                type="date"
                value={harvest.date}
                onChange={(e) => setHarvest({ ...harvest, date: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poids brut (g)</label>
              <input
                type="number"
                min="0"
                value={harvest.wetWeight}
                onChange={(e) => setHarvest({ ...harvest, wetWeight: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Poids sec (g)</label>
              <input
                type="number"
                min="0"
                value={harvest.dryWeight}
                onChange={(e) => setHarvest({ ...harvest, dryWeight: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rendement estimé */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <div className="text-sm opacity-90">Rendement estimé</div>
              <div className="text-3xl font-bold">{estimatedYield}g</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Durée totale</div>
            <div className="text-2xl font-bold">{totalDuration} jours</div>
          </div>
        </div>
      </div>

      {/* Note info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">Pipeline en cours de développement</p>
            <p>
              La visualisation détaillée par phase (type GitHub commits) et les données évolutives
              (morphologie, notes par phase) seront ajoutées dans une prochaine mise à jour.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CulturePipelineSection;
