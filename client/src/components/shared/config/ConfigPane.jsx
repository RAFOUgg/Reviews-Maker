import { motion } from 'framer-motion';
import { LayoutGrid, Type, Palette, ListChecks, Image as ImageIcon, Bookmark, Files, Lock, Pencil } from 'lucide-react';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { LiquidTabs } from '../../ui/LiquidUI';
import TemplateSelector from './TemplateSelector';
import TypographyControls from './TypographyControls';
import ColorPaletteControls from './ColorPaletteControls';
import ContentModuleControls from './ContentModuleControls';
import ImageBrandingControls from './ImageBrandingControls';
import PresetManager from './PresetManager';
import PageManager from '../../shared/export-maker/PageManager';

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

// Onglets dont le contenu est piloté par l'identité par défaut du template — affichent le badge
// d'état (verrouillé/personnalisé) tant qu'on y est. "Template" reste à part (changer de template
// redémarre le verrou avec ses propres défauts) ; "Pagination" a son propre verrou indépendant
// (`shouldAutoLockPagination`) ; "Préréglages" n'a pas de notion de verrou.
const LOCKABLE_TABS = new Set(['content', 'typography', 'colors', 'image']);

export default function ConfigPane() {
    const activePanel = useExportMakerStore((state) => state.activePanel);
    const setActivePanel = useExportMakerStore((state) => state.setActivePanel);
    const templateLocked = useExportMakerStore((state) => state.config.templateLocked);

    const showStatusBadge = LOCKABLE_TABS.has(activePanel);

    return (
        <div className="h-full min-h-0 flex flex-col" style={{ background: 'var(--app-bg, transparent)' }}>
            {/* Navigation par onglets — passe en retour à la ligne (au lieu du scroll horizontal
                caché par défaut de `.liquid-tabs`) : avec 7 onglets, le scroll masqué laissait
                plusieurs onglets totalement hors champ sans indice fiable qu'il y en avait
                davantage (trouvé 2026-07-29, capture montrant l'onglet "Typographie" coupé net
                au bord de la modale). Tous les onglets restent ainsi visibles d'un coup. */}
            <div className="p-2 border-b border-white/10">
                <LiquidTabs
                    tabs={BASE_PANELS}
                    activeTab={activePanel}
                    onChange={setActivePanel}
                    variant="pills"
                    className="!flex-wrap !overflow-visible"
                />
            </div>

            {/* Badge d'état — non bloquant (Chantier C1, 2026-07-30) : le premier changement sur un
                onglet piloté par le template déverrouille désormais automatiquement la config (voir
                exportMakerStore.js) — ce badge informe seulement, il ne grise/bloque plus rien. */}
            {showStatusBadge && (
                <div className={`flex items-center gap-2 px-4 py-1.5 text-xs border-b ${templateLocked ? 'text-amber-200/80 border-amber-400/15 bg-amber-400/5' : 'text-emerald-200/80 border-emerald-400/15 bg-emerald-400/5'}`}>
                    {templateLocked ? <Lock size={12} className="flex-shrink-0" /> : <Pencil size={12} className="flex-shrink-0" />}
                    <span>{templateLocked ? 'Config de template — le premier réglage la personnalisera' : 'Personnalisé'}</span>
                </div>
            )}

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
