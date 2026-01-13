import { motion } from 'framer-motion';
import { useOrchardStore } from '../store/orchardStore';
import TemplateSelector from './controls/TemplateSelector';
import TypographyControls from './controls/TypographyControls';
import ColorPaletteControls from './controls/ColorPaletteControls';
import ContentModuleControls from './controls/ContentModuleControls';
import ImageBrandingControls from './controls/ImageBrandingControls';
import PresetManager from './PresetManager';

const PANELS = [
    { id: 'template', name: 'Template', icon: 'template' },
    { id: 'typography', name: 'Typographie', icon: 'text' },
    { id: 'colors', name: 'Couleurs', icon: 'palette' },
    { id: 'content', name: 'Contenu', icon: 'list' },
    { id: 'image', name: 'Image & Logo', icon: 'image' },
    { id: 'presets', name: 'Préréglages', icon: 'bookmark' }
];

const ICONS = {
    template: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
    ),
    text: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    ),
    palette: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    ),
    list: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    ),
    image: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    bookmark: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    )
};

export default function ConfigPane() {
    const activePanel = useOrchardStore((state) => state.activePanel);
    const setActivePanel = useOrchardStore((state) => state.setActivePanel);

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Tab Navigation - Improved visibility */}
            <div className="flex items-center gap-1 p-2 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-b-2 border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                {PANELS.map((panel) => (
                    <motion.button
                        key={panel.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActivePanel(panel.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 shadow-sm ${activePanel === panel.id ? 'bg-gradient-to-r text-white shadow-lg shadow-purple-500/30 ring-2 dark:' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600' }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {ICONS[panel.icon]}
                        </svg>
                        <span>{panel.name}</span>
                    </motion.button>
                ))}
            </div>

            {/* Panel Content - Better scrollbar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                <motion.div
                    key={activePanel}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activePanel === 'template' && <TemplateSelector />}
                    {activePanel === 'typography' && <TypographyControls />}
                    {activePanel === 'colors' && <ColorPaletteControls />}
                    {activePanel === 'content' && <ContentModuleControls />}
                    {activePanel === 'image' && <ImageBrandingControls />}
                    {activePanel === 'presets' && <PresetManager />}
                </motion.div>
            </div>
        </div>
    );
}


