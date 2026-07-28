import { useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { GripVertical, Trash2, FileText, Plus, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { useExportMakerPagesStore, PAGE_TEMPLATES } from '../../../store/exportMakerPagesStore';
import { LiquidButton, LiquidToggle, LiquidModal, LiquidBadge } from '../../ui/LiquidUI';

/**
 * Composant pour une page triable dans la liste
 */
function SortablePage({ page, pageNumber, isActive, onClick, onRemove }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={onClick}
                className={`liquid-card p-3 cursor-pointer ${isActive ? 'ring-2 ring-purple-500' : ''}`}
            >
                <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded">
                        <GripVertical className="w-4 h-4 text-white/40" />
                    </div>

                    {/* Icon */}
                    <span className="text-2xl">{page.icon}</span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-white/90 truncate">
                            <span className="text-white/40 mr-1">#{pageNumber}</span>
                            {page.label}
                        </h4>
                        <p className="text-xs text-white/50">
                            {page.modules.length} module{page.modules.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="p-1.5 rounded-lg hover:bg-red-500/15 text-white/40 hover:text-red-400 transition-colors"
                        title="Supprimer cette page"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Modules preview */}
                {isActive && page.modules.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex flex-wrap gap-1">
                            {page.modules.slice(0, 6).map((module, i) => (
                                <LiquidBadge key={i} size="sm">{module}</LiquidBadge>
                            ))}
                            {page.modules.length > 6 && (
                                <span className="text-xs px-2 py-1 text-white/40">
                                    +{page.modules.length - 6}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

SortablePage.propTypes = {
    page: PropTypes.object.isRequired,
    pageNumber: PropTypes.number,
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
    onRemove: PropTypes.func,
};

/**
 * Composant principal de gestion des pages
 */
export default function PageManager({ embedded = false }) {
    const [showAddModal, setShowAddModal] = useState(false);

    const config = useExportMakerStore((state) => state.config);
    const reviewData = useExportMakerStore((state) => state.reviewData);

    const pagesEnabled = useExportMakerPagesStore((state) => state.pagesEnabled);
    const pages = useExportMakerPagesStore((state) => state.pages);
    const currentPageIndex = useExportMakerPagesStore((state) => state.currentPageIndex);
    const togglePagesMode = useExportMakerPagesStore((state) => state.togglePagesMode);
    const addPage = useExportMakerPagesStore((state) => state.addPage);
    const removePage = useExportMakerPagesStore((state) => state.removePage);
    const setCurrentPage = useExportMakerPagesStore((state) => state.setCurrentPage);
    const reorderPages = useExportMakerPagesStore((state) => state.reorderPages);
    const loadDefaultPages = useExportMakerPagesStore((state) => state.loadDefaultPages);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    // Page templates available for current review type + ratio
    const reviewType = reviewData?.type || 'Fleur';
    const currentRatio = config?.ratio || '1:1';
    const availablePageTemplates = (PAGE_TEMPLATES[reviewType]?.[currentRatio] || PAGE_TEMPLATES[reviewType]?.['1:1'] || []);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = pages.findIndex((p) => p.id === active.id);
            const newIndex = pages.findIndex((p) => p.id === over.id);
            reorderPages(oldIndex, newIndex);
        }
    };

    const handleAddPage = (template) => {
        addPage({
            ...template,
            id: `page-${Date.now()}`
        });
        setShowAddModal(false);
    };

    const handleResetPages = () => {
        loadDefaultPages(reviewType, currentRatio);
    };

    return (
        <div className={`flex flex-col ${embedded ? 'space-y-4' : 'h-full'}`}>

            {/* Header - only when not embedded */}
            {!embedded && (
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-white/90">Pages</h3>
                                <p className="text-xs text-white/50">
                                    {pages.length} page{pages.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <LiquidToggle checked={pagesEnabled} onChange={togglePagesMode} size="sm" />
                    </div>
                </div>
            )}

            {/* Embedded header */}
            {embedded && (
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-white/90">
                            Trame de pages
                        </h3>
                        {pagesEnabled && (
                            <span className="text-xs text-indigo-400 font-semibold">
                                {pages.length} page{pages.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    {pagesEnabled ? (
                        <p className="text-xs text-white/50 mb-3">
                            Glissez pour réordonner · Cliquez pour sélectionner
                        </p>
                    ) : (
                        <div className="liquid-card p-4 mt-2 text-center space-y-3">
                            <p className="text-xs text-white/60">
                                La pagination répartit la fiche sur plusieurs pages (utile pour les
                                contenus denses : pipelines longs, beaucoup de données).
                            </p>
                            <LiquidButton size="sm" variant="primary" onClick={togglePagesMode}>
                                Activer la pagination
                            </LiquidButton>
                        </div>
                    )}
                </div>
            )}

            {/* Pages list */}
            {pagesEnabled && (
                <div className={`${embedded ? '' : 'flex-1 overflow-y-auto p-4'} space-y-2`}>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                            {pages.map((page, index) => (
                                <SortablePage
                                    key={page.id}
                                    page={page}
                                    pageNumber={index + 1}
                                    isActive={index === currentPageIndex}
                                    onClick={() => setCurrentPage(index)}
                                    onRemove={() => pages.length > 1 && removePage(page.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {/* Actions row */}
                    <div className="flex gap-2 pt-1">
                        <LiquidButton size="sm" variant="ghost" icon={Plus} className="flex-1" onClick={() => setShowAddModal(true)}>
                            Ajouter une page
                        </LiquidButton>
                        <LiquidButton size="sm" variant="ghost" icon={RotateCcw} onClick={handleResetPages} title="Réinitialiser les pages par défaut" />
                    </div>
                </div>
            )}

            {/* Navigation buttons */}
            {!embedded && pagesEnabled && pages.length > 1 && (
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center justify-between gap-2">
                        <LiquidButton
                            size="sm" variant="ghost" icon={ChevronLeft} className="flex-1"
                            onClick={() => setCurrentPage(Math.max(0, currentPageIndex - 1))}
                            disabled={currentPageIndex === 0}
                        >
                            Précédent
                        </LiquidButton>
                        <LiquidBadge variant="info">{currentPageIndex + 1} / {pages.length}</LiquidBadge>
                        <LiquidButton
                            size="sm" variant="ghost" icon={ChevronRight} iconPosition="right" className="flex-1"
                            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPageIndex + 1))}
                            disabled={currentPageIndex === pages.length - 1}
                        >
                            Suivant
                        </LiquidButton>
                    </div>
                </div>
            )}

            {/* Add page modal */}
            <LiquidModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter une page" size="sm">
                <div className="space-y-2 px-6 pb-6">
                    {/* Blank page */}
                    <button
                        onClick={() => handleAddPage({ label: 'Nouvelle page', icon: '📄', modules: [] })}
                        className="liquid-card w-full p-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📄</span>
                            <div>
                                <div className="font-semibold text-white/90">Page vierge</div>
                                <div className="text-xs text-white/50">Contenu personnalisé vide</div>
                            </div>
                        </div>
                    </button>

                    {/* Available page templates */}
                    {availablePageTemplates.length > 0 && (
                        <>
                            <div className="pt-2 pb-1">
                                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                                    Modèles disponibles
                                </p>
                            </div>
                            {availablePageTemplates.map((tpl, i) => (
                                <button key={i} onClick={() => handleAddPage(tpl)} className="liquid-card w-full p-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{tpl.icon || '📋'}</span>
                                        <div>
                                            <div className="font-semibold text-white/90">{tpl.label}</div>
                                            {tpl.description && (
                                                <div className="text-xs text-white/50">{tpl.description}</div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>
            </LiquidModal>
        </div>
    );
}

PageManager.propTypes = {
    embedded: PropTypes.bool,
};
