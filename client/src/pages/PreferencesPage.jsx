import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import UsageQuotas from '../components/UsageQuotas';

export default function PreferencesPage() {
    const user = useStore(state => state.user);
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Général', icon: '⚙️' },
        { id: 'saved-data', label: 'Données sauvegardées', icon: '💾' },
        { id: 'templates', label: 'Templates favoris', icon: '⭐' },
        { id: 'watermarks', label: 'Filigranes', icon: '🏷️' },
        { id: 'export', label: 'Export', icon: '📤' }
    ];

    return (
        <div className="min-h-screen bg-transparent">
            <div className="container-glass mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Préférences
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Configurez vos données sauvegardées et préférences d'export
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-white/5 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-800/50' }`}
                                    >
                                        <span className="text-xl">{tab.icon}</span>
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Quotas */}
                        <UsageQuotas compact={false} />
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-transparent rounded-2xl p-6"
                        >
                            {activeTab === 'general' && <GeneralPreferences />}
                            {activeTab === 'saved-data' && <SavedDataPreferences />}
                            {activeTab === 'templates' && <TemplatesPreferences />}
                            {activeTab === 'watermarks' && <WatermarksPreferences />}
                            {activeTab === 'export' && <ExportPreferences />}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GeneralPreferences() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Préférences générales
            </h2>

            <div className="space-y-6">
                {/* Langue */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Langue
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-700 bg-transparent text-white">
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                    </select>
                </div>

                {/* Theme removed — application is dark-only */}

                {/* Notifications */}
                <div>
                    <label className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 rounded" />
                        <span className="text-gray-700 dark:text-gray-300">
                            Recevoir des notifications par email
                        </span>
                    </label>
                </div>

                <button className="w-full px-6 py-3 liquid-btn liquid-btn--primary">
                    Sauvegarder les modifications
                </button>
            </div>
        </div>
    );
}

function SavedDataPreferences() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Données sauvegardées
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enregistrez vos substrats, engrais et matériel fréquemment utilisés pour un remplissage rapide des reviews.
            </p>

            <div className="space-y-6">
                {/* Substrats favoris */}
                <div className="p-4 border border-gray-700 rounded-xl bg-transparent">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>🌱</span>
                        <span>Substrats favoris</span>
                    </h3>
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300">Terre BioBizz Light Mix</span>
                            <button className="text-red-500 hover:text-red-600">🗑️</button>
                        </div>
                    </div>
                    <button className="w-full px-4 py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-300 hover:border-white/20 hover:text-white transition-all">
                        + Ajouter un substrat
                    </button>
                </div>

                {/* Engrais favoris */}
                <div className="p-4 border border-gray-700 rounded-xl bg-transparent">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>🧪</span>
                        <span>Engrais favoris</span>
                    </h3>
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300">BioBizz Grow</span>
                            <button className="text-red-500 hover:text-red-600">🗑️</button>
                        </div>
                    </div>
                    <button className="w-full px-4 py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-300 hover:border-white/20 hover:text-white transition-all">
                        + Ajouter un engrais
                    </button>
                </div>

                {/* Matériel favori */}
                <div className="p-4 border border-gray-700 rounded-xl bg-transparent">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span>🔧</span>
                        <span>Matériel favori</span>
                    </h3>
                    <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-300">LED Spider Farmer SF2000</span>
                            <button className="text-red-500 hover:text-red-600">🗑️</button>
                        </div>
                    </div>
                    <button className="w-full px-4 py-2 border-2 border-dashed border-gray-700 rounded-lg text-gray-300 hover:border-white/20 hover:text-white transition-all">
                        + Ajouter du matériel
                    </button>
                </div>
            </div>
        </div>
    );
}

function TemplatesPreferences() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Templates favoris
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Gérez vos templates d'export personnalisés et marquez vos favoris.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Template card example */}
                <div className="p-4 border border-gray-700 rounded-xl transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Template Instagram</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Format 1:1 • Compact</p>
                        </div>
                        <button className="text-yellow-500 text-xl">⭐</button>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 liquid-btn liquid-btn--primary text-sm">
                            Utiliser
                        </button>
                        <button className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                            Modifier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WatermarksPreferences() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Filigranes personnalisés
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Créez et gérez vos filigranes personnalisés pour vos exports.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover: hover: transition-all">
                    <div className="text-4xl mb-2">+</div>
                    <div className="font-semibold">Créer un filigrane</div>
                </button>
            </div>
        </div>
    );
}

function ExportPreferences() {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Préférences d'export
            </h2>

            <div className="space-y-6">
                {/* Format par défaut */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Format par défaut
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="pdf">PDF</option>
                        <option value="svg">SVG</option>
                    </select>
                </div>

                {/* Qualité par défaut */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Qualité par défaut
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="standard">Standard (72 dpi)</option>
                        <option value="high">Haute (300 dpi)</option>
                        <option value="ultra">Ultra (600 dpi)</option>
                    </select>
                </div>

                {/* Template par défaut */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Template par défaut
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="compact">Compact</option>
                        <option value="detailed">Détaillé</option>
                        <option value="complete">Complète</option>
                    </select>
                </div>

                <button className="w-full px-6 py-3 bg-gradient-to-r text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Sauvegarder les modifications
                </button>
            </div>
        </div>
    );
}
