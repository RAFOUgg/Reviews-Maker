import { motion } from 'framer-motion';
import { useOrchardStore, DEFAULT_TEMPLATES } from '../../../store/orchardStore';

export default function TemplateSelector() {
    const config = useOrchardStore((state) => state.config);
    const setTemplate = useOrchardStore((state) => state.setTemplate);
    const setRatio = useOrchardStore((state) => state.setRatio);
    const registerTemplate = useOrchardStore((state) => state.registerTemplate);
    const templates = useOrchardStore((state) => state.templates);
    const unregisterTemplate = useOrchardStore((state) => state.unregisterTemplate);

    const ratios = [
        { id: '1:1', name: 'Carré (1:1)', icon: '⬜' },
        { id: '16:9', name: 'Paysage (16:9)', icon: '▭' },
        { id: '9:16', name: 'Portrait (9:16)', icon: '▯' },
        { id: '4:3', name: 'Standard (4:3)', icon: '▭' },
        { id: 'A4', name: 'A4 (Document)', icon: '📄' }
    ];

    return (
        <div className="space-y-4">
            {/* Titre */}
            <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                    Choix du Template
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Sélectionnez un style de présentation pour votre review
                </p>
            </div>

            {/* Galerie de templates */}
            <div className="flex items-center justify-between">
                <div />
                <button onClick={() => {
                    const id = prompt('ID du template (ex: my-custom-template)');
                    if (!id) return;
                    const name = prompt('Nom du template (ex: Ma mise en page)') || id;
                    registerTemplate(id, {
                        name,
                        description: 'Template personnalisé',
                        layout: 'custom',
                        defaultRatio: '1:1',
                        supportedRatios: ['1:1', '16:9']
                    });
                }} className="px-3 py-2 text-white rounded-lg text-sm">➕ Créer Template</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {Object.values(templates).map((template) => (
                    <motion.button
                        key={template.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setTemplate(template.id)}
                        className={`p-3 rounded-lg text-left transition-all border-2 ${config.template === template.id ? ' dark:' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:' }`}
                    >
                        <div className="flex items-start justify-between mb-1.5">
                            <div>
                                <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                                    {template.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {template.description}
                                </p>
                            </div>
                            {config.template === template.id && (
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    {/* Supprimer template custom */}
                                    {!DEFAULT_TEMPLATES[template.id] && (
                                        <button title="Supprimer le template" onClick={(e) => { e.stopPropagation(); if (window.confirm(`Supprimer le template ${template.name}?`)) unregisterTemplate(template.id); }} className="ml-2 p-1 text-xs bg-red-100 rounded">×</button>
                                    )}
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </div>

                        <div className="flex gap-1 mt-1.5">
                            {template.supportedRatios.slice(0, 3).map((ratio) => (
                                <span
                                    key={ratio}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                                >
                                    {ratio}
                                </span>
                            ))}
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Sélecteur de ratio */}
            <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Format d'affichage
                </h4>
                <div className="grid grid-cols-2 gap-1.5">
                    {ratios.map((ratio) => {
                        const currentTemplate = templates[config.template];
                        const isSupported = currentTemplate?.supportedRatios.includes(ratio.id);

                        return (
                            <motion.button
                                key={ratio.id}
                                whileHover={isSupported ? { scale: 1.01 } : {}}
                                whileTap={isSupported ? { scale: 0.99 } : {}}
                                onClick={() => isSupported && setRatio(ratio.id)}
                                disabled={!isSupported}
                                className={`p-2 rounded-md text-xs font-medium transition-all ${config.ratio === ratio.id ? 'bg-gradient-to-r text-white shadow-md' : isSupported ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' }`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <span className="text-sm">{ratio.icon}</span>
                                    <span className="text-[11px]">{ratio.name}</span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}




