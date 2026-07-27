import { motion } from 'framer-motion';
import { LayoutGrid, Type, Palette, ListChecks, Image as ImageIcon, Bookmark, Files } from 'lucide-react';
import { useOrchardStore } from '../../../store/orchardStore';
import { useOrchardPagesStore } from '../../../store/orchardPagesStore';
import { LiquidTabs } from '../../ui/LiquidUI';
import TemplateSelector from './TemplateSelector';
import TypographyControls from './TypographyControls';
import ColorPaletteControls from './ColorPaletteControls';
import ContentModuleControls from './ContentModuleControls';
import ImageBrandingControls from './ImageBrandingControls';
import PresetManager from './PresetManager';
import PageManager from '../../shared/orchard/PageManager';

const BASE_PANELS = [
    { id: 'template', label: 'Template', icon: LayoutGrid },
    { id: 'typography', label: 'Typographie', icon: Type },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'content', label: 'Contenu', icon: ListChecks },
    { id: 'image', label: 'Image & Logo', icon: ImageIcon },
    { id: 'presets', label: 'Préréglages', icon: Bookmark },
];

export default function ConfigPane() {
    const activePanel = useOrchardStore((state) => state.activePanel);
    const setActivePanel = useOrchardStore((state) => state.setActivePanel);
    const pagesEnabled = useOrchardPagesStore((state) => state.pagesEnabled);

    // Onglet Pagination ajouté uniquement quand le mode pages est activé
    const panels = pagesEnabled
        ? [...BASE_PANELS, { id: 'pagination', label: 'Pagination', icon: Files }]
        : BASE_PANELS;

    return (
        <div className="h-full flex flex-col" style={{ background: 'var(--app-bg, transparent)' }}>
            {/* Navigation par onglets */}
            <div className="p-2 border-b border-white/10 overflow-x-auto">
                <LiquidTabs tabs={panels} activeTab={activePanel} onChange={setActivePanel} variant="pills" />
            </div>

            {/* Contenu du panneau actif */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    {activePanel === 'pagination' && <PageManager embedded />}
                </motion.div>
            </div>
        </div>
    );
}
