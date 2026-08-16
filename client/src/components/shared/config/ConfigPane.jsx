import { motion } from 'framer-motion';
import { LayoutGrid, Type, Palette, ListChecks, Image as ImageIcon, Bookmark, Lock, Pencil } from 'lucide-react';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { LiquidTabs } from '../../ui/LiquidUI';
import TemplateSelector from './TemplateSelector';
import TypographyControls from './TypographyControls';
import ColorPaletteControls from './ColorPaletteControls';
import ContentModuleControls from './ContentModuleControls';
import ImageBrandingControls from './ImageBrandingControls';
import PresetManager from './PresetManager';

// Ordre : Template en 1er (choix du gabarit), puis Contenu — ce sont les réglages qui pilotent CE
// QUI s'affiche, donc les plus consultés — avant les réglages cosmétiques (typo/couleurs/image) et
// les préréglages.
//
// PLUS D'ONGLET « PAGINATION » ICI (2026-08-16). Cet éditeur compose le rendu ÉCRAN : un document
// continu, sans page ni marge d'impression. La pagination ne concerne que le FICHIER exporté — elle
// vit donc désormais dans la modale d'export, à côté du format, exactement comme le choix du format
// y a été déplacé le 2026-08-13 pour la même raison.
//
// Ce n'était pas seulement un onglet sans effet visible : la « trame de pages » qu'il composait
// prenait le pas sur la pagination MESURÉE au moment d'exporter (`ExportModal` désactivait tout
// calcul dès qu'une session de pages existait), et ses gabarits statiques décrivaient leurs pages
// avec des clés `contentModules` (`typeCulture`, `cannabinoids`…) là où le rendu attend des ids de
// BLOCS (`masthead`, `pipeline:*`, `gisement:*`). Ajouter une page à la main produisait donc une
// page dont le contenu ne pouvait pas être résolu — l'ExportModal documentait déjà le symptôme :
// « 5 pages identiques remplies à 98,6 % » là où la mesure en produit 2.
const BASE_PANELS = [
    { id: 'template', label: 'Template', icon: LayoutGrid },
    { id: 'content', label: 'Contenu', icon: ListChecks },
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
                </motion.div>
            </div>
        </div>
    );
}
