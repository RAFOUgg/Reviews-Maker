import React, { useState } from 'react';
import PipelineWithSidebar from '../../components/pipelines/views/PipelineWithSidebar';
import { CONTENT_SCHEMAS } from '../../components/PipelineContentsSidebar';
import LiquidCard from '../../components/ui/LiquidCard';

/**
 * EXEMPLE D'INTÉGRATION - Pipeline Culture Fleurs
 * 
 * Ce composant montre comment intégrer le nouveau système PipeLine
 * dans une page de création de review.
 * 
 * À utiliser comme référence pour remplacer les anciens composants
 */

const ExamplePipelineIntegration = () => {
    // État du formulaire complet
    const [formData, setFormData] = useState({
        // Informations générales
        commercialName: '',
        cultivars: [],
        farm: '',

        // Pipeline de culture
        culturePipeline: {
            intervalType: 'phases', // ou 'days', 'weeks', etc.
            duration: 12,
            customPhases: undefined, // Utilise CULTURE_PHASES par défaut
            cells: {
                // Exemple de données pré-remplies pour démonstration
                0: {
                    contents: [
                        {
                            type: 'mode',
                            category: 'general',
                            label: 'Mode de culture',
                            icon: '🏕️',
                            data: { value: 'Indoor' }
                        }
                    ]
                },
                3: {
                    contents: [
                        {
                            type: 'temperature',
                            category: 'environment',
                            label: 'Température',
                            icon: '🌡️',
                            data: { value: 24.5, notes: 'Température stable' }
                        },
                        {
                            type: 'humidity',
                            category: 'environment',
                            label: 'Humidité relative',
                            icon: '💧',
                            data: { value: 65 }
                        }
                    ]
                }
            }
        },

        // Pipeline de curing
        curingPipeline: {
            intervalType: 'days',
            duration: 30,
            cells: {}
        }
    });

    // Handler: Mise à jour des données du formulaire
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handler: Mise à jour du pipeline de culture
    const handleCulturePipelineChange = (newPipelineData) => {
        setFormData(prev => ({
            ...prev,
            culturePipeline: newPipelineData
        }));

        console.log('Pipeline culture mis à jour:', newPipelineData);
    };

    // Handler: Mise à jour du pipeline de curing
    const handleCuringPipelineChange = (newPipelineData) => {
        setFormData(prev => ({
            ...prev,
            curingPipeline: newPipelineData
        }));

        console.log('Pipeline curing mis à jour:', newPipelineData);
    };

    // Handler: Sauvegarde complète
    const handleSave = async () => {
        try {
            console.log('Sauvegarde des données:', formData);

            // Exemple d'appel API
            // const response = await fetch('/api/reviews', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(formData)
            // });

            alert('Review sauvegardée avec succès !');
        } catch (error) {
            console.error('Erreur de sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    // Handler: Export JSON pour débogage
    const handleExportJSON = () => {
        const dataStr = JSON.stringify(formData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pipeline-data.json';
        link.click();
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        Exemple d'Intégration Pipeline
                    </h1>
                    <p className="text-gray-400 mt-2">
                        Démonstration du nouveau système PipeLine CDC-compliant
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExportJSON}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    >
                        📥 Export JSON
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 hover: text-white rounded-lg transition-colors"
                    >
                        💾 Sauvegarder
                    </button>
                </div>
            </div>

            {/* Section 1: Informations générales (exemple) */}
            <LiquidCard title="📋 Informations générales" bordered>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nom commercial *
                        </label>
                        <input
                            type="text"
                            value={formData.commercialName}
                            onChange={(e) => handleFormChange('commercialName', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            placeholder="Ex: Gorilla Glue #4"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Farm
                        </label>
                        <input
                            type="text"
                            value={formData.farm}
                            onChange={(e) => handleFormChange('farm', e.target.value)}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            placeholder="Ex: Green Valley Farm"
                        />
                    </div>
                </div>
            </LiquidCard>

            {/* Section 2: Pipeline de Culture */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    🌱 Pipeline de Culture
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    Documentez toutes les étapes de culture avec le système PipeLine.
                    Glissez-déposez les contenus sur les cases, cliquez pour éditer.
                </p>

                <PipelineWithSidebar
                    pipelineType="culture"
                    productType="flower"
                    value={formData.culturePipeline}
                    onChange={handleCulturePipelineChange}
                    contentSchema={CONTENT_SCHEMAS.culture}
                />
            </div>

            {/* Section 3: Pipeline de Curing/Maturation */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    🔥 Pipeline Curing / Maturation
                </h2>
                <p className="text-sm text-gray-400 mb-4">
                    Suivez l'évolution du curing jour par jour ou semaine par semaine.
                </p>

                <PipelineWithSidebar
                    pipelineType="curing"
                    productType="flower"
                    value={formData.curingPipeline}
                    onChange={handleCuringPipelineChange}
                    contentSchema={CONTENT_SCHEMAS.curing}
                />
            </div>

            {/* Section Debug: Visualisation des données */}
            <LiquidCard title="🐛 Debug - Structure des données" bordered>
                <details className="cursor-pointer">
                    <summary className="text-sm font-medium text-gray-300 mb-2">
                        Cliquez pour voir les données brutes
                    </summary>
                    <pre className="bg-gray-800 p-4 rounded-lg text-xs text-gray-300 overflow-auto max-h-96">
                        {JSON.stringify(formData, null, 2)}
                    </pre>
                </details>
            </LiquidCard>

            {/* Section Exemples: Différents intervalles */}
            <LiquidCard title="📚 Exemples d'intervalles" bordered>
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            🔹 Mode Phases (12 phases prédéfinies)
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                            Idéal pour culture complète avec phases distinctes
                        </p>
                        <button
                            onClick={() => handleFormChange('culturePipeline', {
                                ...formData.culturePipeline,
                                intervalType: 'phases',
                                duration: 12
                            })}
                            className="px-3 py-1 hover: text-white rounded text-sm"
                        >
                            Activer mode Phases
                        </button>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            🔹 Mode Jours (max 365)
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                            Suivi quotidien détaillé
                        </p>
                        <button
                            onClick={() => handleFormChange('culturePipeline', {
                                ...formData.culturePipeline,
                                intervalType: 'days',
                                duration: 90
                            })}
                            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
                        >
                            Activer mode Jours (90j)
                        </button>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            🔹 Mode Dates (calcul automatique)
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                            Spécifiez date début et fin
                        </p>
                        <button
                            onClick={() => handleFormChange('culturePipeline', {
                                ...formData.culturePipeline,
                                intervalType: 'dates',
                                startDate: '2025-01-01',
                                endDate: '2025-04-01'
                            })}
                            className="px-3 py-1 hover: text-white rounded text-sm"
                        >
                            Activer mode Dates (Jan-Avr)
                        </button>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                            🔹 Mode Semaines (max 52)
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                            Suivi hebdomadaire
                        </p>
                        <button
                            onClick={() => handleFormChange('culturePipeline', {
                                ...formData.culturePipeline,
                                intervalType: 'weeks',
                                duration: 16
                            })}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded text-sm"
                        >
                            Activer mode Semaines (16S)
                        </button>
                    </div>
                </div>
            </LiquidCard>

            {/* Instructions d'utilisation */}
            <LiquidCard title="📖 Instructions d'utilisation" bordered>
                <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex gap-3">
                        <span className="text-2xl">1️⃣</span>
                        <div>
                            <strong>Configurer la trame</strong>
                            <p className="text-gray-400">
                                Choisissez le type d'intervalle (phases, jours, semaines, etc.) et la durée
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <span className="text-2xl">2️⃣</span>
                        <div>
                            <strong>Glisser-déposer les contenus</strong>
                            <p className="text-gray-400">
                                Depuis le volet latéral, glissez les éléments (température, lumière, etc.) sur les cases de la timeline
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <span className="text-2xl">3️⃣</span>
                        <div>
                            <strong>Remplir les données</strong>
                            <p className="text-gray-400">
                                Cliquez sur une case pour ouvrir le modal d'édition et saisir les valeurs
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <span className="text-2xl">4️⃣</span>
                        <div>
                            <strong>Multi-sélection (optionnel)</strong>
                            <p className="text-gray-400">
                                Maintenez Ctrl/Cmd et cliquez sur plusieurs cases pour appliquer les mêmes données en masse
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <span className="text-2xl">5️⃣</span>
                        <div>
                            <strong>Sauvegarder</strong>
                            <p className="text-gray-400">
                                Cliquez sur "Sauvegarder" en haut pour enregistrer votre review
                            </p>
                        </div>
                    </div>
                </div>
            </LiquidCard>
        </div>
    );
};

export default ExamplePipelineIntegration;
