/**
 * TabNavigator Component
 * Composant pour gérer les onglets d'export avec conditional rendering
 * Remplace le système de tabs broken dans ExportMaker/OrchardPanel
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Layout,
    Layers,
    Settings,
} from 'lucide-react';

const TAB_LIST = [
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'content', label: 'Contenu', icon: Layers },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'presets', label: 'Préréglages', icon: Settings },
];

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render based on activeTab
 * @param {string} props.defaultTab - Default tab ID
 * @param {Function} props.onTabChange - Callback when tab changes
 * @param {Function} props.renderContent - Function to render content based on tab ID
 */
export function TabNavigator({
    defaultTab = 'templates',
    onTabChange,
    renderContent,
}) {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        onTabChange?.(tabId);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Tab Navigation */}
            <div className="flex gap-1 p-2 bg-slate-900/50 border-b border-slate-700 flex-shrink-0">
                {TAB_LIST.map(({ id, label, icon: Icon }) => (
                    <motion.button
                        key={id}
                        onClick={() => handleTabChange(id)}
                        initial={false}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                            transition-all duration-200
                            ${activeTab === id
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }
                        `}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </motion.button>
                ))}
            </div>

            {/* Tab Content - AnimatePresence for smooth transitions */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="w-full h-full overflow-y-auto"
                    >
                        {renderContent ? renderContent(activeTab) : null}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default TabNavigator;
