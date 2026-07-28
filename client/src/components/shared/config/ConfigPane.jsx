import { motion } from 'framer-motion';
import { LayoutGrid, Type, Palette, ListChecks, Image as ImageIcon, Bookmark, Files } from 'lucide-react';
import { useOrchardStore } from '../../../store/orchardStore';
import { LiquidTabs } from '../../ui/LiquidUI';
import TemplateSelector from './TemplateSelector';
import TypographyControls from './TypographyControls';
import ColorPaletteControls from './ColorPaletteControls';
import ContentModuleControls from './ContentModuleControls';
import ImageBrandingControls from './ImageBrandingControls';
import PresetManager from './PresetManager';
import PageManager from '../../shared/orchard/PageManager';

// Ordre : Template en 1er (choix du gabarit), puis Contenu/Pagination en 2e/3e position — ce sont
// les réglages qui pilotent QUOI s'affiche et OÙ, donc les plus consultés après le choix du
// template — avant les réglages plus cosmétiques (typo/couleurs/image/préréglages).
const BASE_PANELS = [
    { id: 'template', label: 'Template', icon: LayoutGrid },
    { id: 'content', label: 'Contenu', icon: ListChecks },
    { id: 'pagination', label: 'Pagination', icon: Files },
    { id: 'typography', label: 'Typographie', icon: Type },
    { id: 'colors', label: 'Couleurs', icon: Palette },
    { id: 'image', label: 'Image & Logo', icon: ImageIcon },
    { id: 'presets', label: 'Préréglages', icon: Bookmark },
];

export default function ConfigPane() {
    const activePanel = useOrchardStore((state) => state.activePanel);
    const setActivePanel = useOrchardStore((state) => state.setActivePanel);

    return (
        <div className="h-full min-h-0 flex flex-col" style={{ background: 'var(--app-bg, transparent)' }}>
            {/* Navigation par onglets — fondu de bord en masque CSS : signale que la barre défile
                horizontalement (le scrollbar natif est masqué par `.liquid-tabs`), sans quoi une
                rangée d'onglets coupée donne l'impression d'un contenu manquant/cassé. */}
            <div
                className="p-2 border-b border-white/10 overflow-x-auto"
                style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)', maskImage: 'linear-gradient(to right, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)' }}
            >
                <LiquidTabs tabs={BASE_PANELS} activeTab={activePanel} onChange={setActivePanel} variant="pills" />
            </div>

            {/* Contenu du panneau actif */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
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
