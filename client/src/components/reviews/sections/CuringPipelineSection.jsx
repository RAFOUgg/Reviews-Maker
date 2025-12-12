/**
 * Section Pipeline Curing/Maturation
 * Phase 2.4 - Universel (Hash, Concentrés, Fleurs)
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, Thermometer, Droplets, Box, Package, 
  Gauge, TrendingUp, Plus, Edit2, Trash2, AlertCircle, Sun
} from 'lucide-react';
import {
  CURING_TYPES,
  CONTAINER_TYPES,
  PACKAGING_TYPES,
  OPACITY_LEVELS,
  TIMELINE_INTERVALS,
  EVOLVABLE_DATA_FIELDS,
  calculateCuringDuration,
  estimateFinalQuality
} from '../../../data/curingMethods';

const CuringPipelineSection = ({ productType = 'Fleurs', data = {}, onChange }) => {
  const [config, setConfig] = useState({
    timelineInterval: data.timelineInterval || 'days',
    duration: data.duration || 14,
    type: data.type || 'warm',
    ...data
  });

  const [conditions, setConditions] = useState({
    temperature: data.conditions?.temperature || 18,
    humidity: data.conditions?.humidity || 62,
    containerType: data.conditions?.containerType || 'glass',
    packagingType: data.conditions?.packagingType || 'none',
    opacityLevel: data.conditions?.opacityLevel || 'opaque',
    productVolume: data.conditions?.productVolume || 100,
    ...data.conditions
  });

  const [snapshots, setSnapshots] = useState(data.snapshots || []);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);

  const selectedInterval = TIMELINE_INTERVALS.find(i => i.id === config.timelineInterval);
  const curingType = CURING_TYPES.find(t => t.id === config.type);
  const finalQuality = estimateFinalQuality(
    config.type,
    conditions.temperature,
    conditions.humidity,
    config.duration,
    conditions.containerType
  );

  useEffect(() => {
    onChange?.({
      timelineInterval: config.timelineInterval,
      duration: config.duration,
      type: config.type,
      conditions,
      snapshots,
      finalQuality,
      totalDuration: calculateCuringDuration(config.timelineInterval, config.duration)
    });
  }, [config, conditions, snapshots]);

  const handleAddSnapshot = () => {
    const newSnapshot = {
      id: Date.now(),
      timestamp: snapshots.length > 0 ? snapshots[snapshots.length - 1].timestamp + 1 : 1,
      label: `Jour ${snapshots.length + 1}`,
      notes: '',
      dataChanges: {}
    };
    setSnapshots([...snapshots, newSnapshot]);
  };

  const handleRemoveSnapshot = (snapshotId) => {
    setSnapshots(snapshots.filter(s => s.id !== snapshotId));
    if (selectedSnapshot?.id === snapshotId) setSelectedSnapshot(null);
  };

  const handleSnapshotChange = (snapshotId, field, value) => {
    setSnapshots(snapshots.map(s =>
      s.id === snapshotId ? { ...s, [field]: value } : s
    ));
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">Pipeline Curing & Maturation</h3>
        <p className="text-gray-600">Configurez les conditions de maturation et suivez l'évolution</p>
      </div>

      {/* Configuration Timeline */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900">Configuration de la trame</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Intervalle */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intervalle temporel
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {TIMELINE_INTERVALS.map(interval => (
                <button
                  key={interval.id}
                  onClick={() => setConfig({ ...config, timelineInterval: interval.id })}
                  className={`px-3 py-2 rounded-xl font-medium text-sm transition-all ${
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

          {/* Durée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durée ({selectedInterval?.unit})
            </label>
            <input
              type="number"
              min="1"
              max={selectedInterval?.max || 365}
              value={config.duration}
              onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Total: {calculateCuringDuration(config.timelineInterval, config.duration)}
            </p>
          </div>
        </div>
      </div>

      {/* Type de curing */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Thermometer className="w-5 h-5 text-red-500" />
          <h4 className="font-semibold text-gray-900">Type de curing</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CURING_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setConfig({ ...config, type: type.id })}
              className={`p-4 rounded-xl text-center transition-all ${
                config.type === type.id
                  ? `bg-${type.color}-500 text-white shadow-lg scale-105`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-medium">{type.label}</div>
              <div className="text-xs opacity-75 mt-1">
                {type.tempRange[0]}°C à {type.tempRange[1]}°C
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conditions environnementales */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Gauge className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-900">Conditions environnementales</h4>
        </div>

        <div className="space-y-4">
          {/* Température */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Thermometer className="w-4 h-4 inline mr-2" />
              Température: {conditions.temperature}°C
            </label>
            <input
              type="range"
              min="-5"
              max="30"
              value={conditions.temperature}
              onChange={(e) => setConditions({ ...conditions, temperature: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-5°C</span>
              <span className="text-green-600 font-medium">Optimal: 15-21°C</span>
              <span>30°C</span>
            </div>
          </div>

          {/* Humidité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Droplets className="w-4 h-4 inline mr-2" />
              Humidité relative: {conditions.humidity}%
            </label>
            <input
              type="range"
              min="20"
              max="90"
              value={conditions.humidity}
              onChange={(e) => setConditions({ ...conditions, humidity: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20%</span>
              <span className="text-green-600 font-medium">Optimal: 60-65%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Volume produit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume produit dans récipient (mL)
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              value={conditions.productVolume}
              onChange={(e) => setConditions({ ...conditions, productVolume: parseInt(e.target.value) })}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Récipient */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Box className="w-5 h-5 text-green-500" />
          <h4 className="font-semibold text-gray-900">Récipient de curing</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type de récipient</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {CONTAINER_TYPES.map(container => (
              <button
                key={container.id}
                onClick={() => setConditions({ ...conditions, containerType: container.id })}
                className={`p-3 rounded-xl transition-all ${
                  conditions.containerType === container.id
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="text-2xl mb-1">{container.icon}</div>
                <div className="text-xs font-medium">{container.label}</div>
              </button>
            ))}
          </div>

          {CONTAINER_TYPES.find(c => c.id === conditions.containerType) && (
            <p className="mt-3 text-sm text-gray-600 text-center">
              {CONTAINER_TYPES.find(c => c.id === conditions.containerType).description}
            </p>
          )}
        </div>
      </div>

      {/* Emballage */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-amber-500" />
          <h4 className="font-semibold text-gray-900">Emballage primaire</h4>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'emballage</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {PACKAGING_TYPES.map(packaging => (
                <button
                  key={packaging.id}
                  onClick={() => setConditions({ ...conditions, packagingType: packaging.id })}
                  className={`p-3 rounded-xl transition-all ${
                    conditions.packagingType === packaging.id
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{packaging.icon}</div>
                  <div className="text-xs font-medium">{packaging.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Sun className="w-4 h-4 inline mr-2" />
              Opacité du récipient
            </label>
            <div className="grid grid-cols-5 gap-2">
              {OPACITY_LEVELS.map(opacity => (
                <button
                  key={opacity.id}
                  onClick={() => setConditions({ ...conditions, opacityLevel: opacity.id })}
                  className={`p-3 rounded-xl transition-all ${
                    conditions.opacityLevel === opacity.id
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{opacity.icon}</div>
                  <div className="text-xs font-medium">{opacity.label}</div>
                  <div className="text-xs opacity-75 mt-1">{opacity.lightBlock}%</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Snapshots évolutifs */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-indigo-500" />
            <h4 className="font-semibold text-gray-900">Snapshots évolutifs</h4>
          </div>
          <button
            onClick={handleAddSnapshot}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter snapshot
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="text-center py-8 bg-indigo-50 rounded-xl border border-indigo-200">
            <AlertCircle className="w-12 h-12 text-indigo-500 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">
              Aucun snapshot. Ajoutez des snapshots pour suivre l'évolution des données.
            </p>
            <p className="text-sm text-gray-500">
              Vous pourrez modifier Visuel, Odeurs, Texture, Goûts et Effets à chaque snapshot
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {snapshots.map((snapshot, index) => (
              <div key={snapshot.id} className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={snapshot.label}
                          onChange={(e) => handleSnapshotChange(snapshot.id, 'label', e.target.value)}
                          placeholder="Label..."
                          className="flex-1 px-3 py-1 rounded-lg border border-indigo-300 bg-white text-sm"
                        />
                        <input
                          type="number"
                          value={snapshot.timestamp}
                          onChange={(e) => handleSnapshotChange(snapshot.id, 'timestamp', parseInt(e.target.value))}
                          className="w-20 px-2 py-1 rounded-lg border border-indigo-300 text-sm"
                          placeholder="Temps"
                        />
                        <span className="text-sm text-gray-600">{selectedInterval?.unit}</span>
                      </div>
                      <textarea
                        value={snapshot.notes}
                        onChange={(e) => handleSnapshotChange(snapshot.id, 'notes', e.target.value)}
                        placeholder="Notes d'observation (optionnel)..."
                        maxLength={500}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-300 text-sm resize-none"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSnapshot(snapshot.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Données évolutives */}
                <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
                  <p className="text-xs text-gray-600 mb-2">Données modifiées à ce snapshot :</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.keys(EVOLVABLE_DATA_FIELDS).map(fieldKey => {
                      const field = EVOLVABLE_DATA_FIELDS[fieldKey];
                      return (
                        <button
                          key={fieldKey}
                          onClick={() => setSelectedSnapshot(snapshot)}
                          className="p-2 rounded-lg bg-gray-50 hover:bg-indigo-100 transition-colors text-xs"
                        >
                          <div className="mb-1">{field.icon}</div>
                          <div className="font-medium">{field.label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {snapshots.length > 0 && (
          <p className="mt-4 text-xs text-gray-500 text-center">
            Les données évolutives permettront de voir les changements de Visuel, Odeurs, Texture, Goûts et Effets au fil du temps
          </p>
        )}
      </div>

      {/* Qualité finale estimée */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <div className="text-sm opacity-90">Qualité finale estimée</div>
              <div className="text-3xl font-bold">{finalQuality}%</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Durée totale</div>
            <div className="text-2xl font-bold">
              {calculateCuringDuration(config.timelineInterval, config.duration)}
            </div>
          </div>
        </div>

        {finalQuality < 70 && (
          <div className="mt-4 p-3 bg-white/20 rounded-xl">
            <p className="text-sm">
              💡 Suggestions pour améliorer la qualité :
              {conditions.temperature < 15 || conditions.temperature > 21 ? ' Température optimale 15-21°C.' : ''}
              {conditions.humidity < 60 || conditions.humidity > 65 ? ' Humidité optimale 60-65%.' : ''}
              {conditions.containerType === 'open-air' ? ' Utiliser un récipient hermétique.' : ''}
              {config.duration < 14 ? ' Prolonger le curing (min 2 semaines).' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuringPipelineSection;
