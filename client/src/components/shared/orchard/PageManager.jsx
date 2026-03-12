import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { useOrchardStore } from '../../../store/orchardStore';
import { useOrchardPagesStore, PAGE_TEMPLATES } from '../../../store/orchardPagesStore';

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
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${isActive ? ' bg-gradient-to-br dark:/30 dark:/30 ring-2 dark: shadow-lg shadow-purple-500/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover: dark:hover:'}`}
            >
                <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <div
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                    </div>

                    {/* Icon */}
                    <span className="text-2xl">{page.icon}</span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            <span className="text-gray-400 dark:text-gray-500 mr-1">#{pageNumber}</span>
                            {page.label}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {page.modules.length} module{page.modules.length > 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Actions */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer cette page"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                {/* Modules preview */}
                {isActive && page.modules.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-1">
                            {page.modules.slice(0, 6).map((module, i) => (
                                <span
                                    key={i}
                                    className="text-xs px-2 py-1 dark: dark: rounded"
                                >
                                    {module}
                                </span>
                            ))}
                            {page.modules.length > 6 && (
                                <span className="text-xs px-2 py-1 text-gray-500">
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

    const config = useOrchardStore((state) => state.config);
    const reviewData = useOrchardStore((state) => state.reviewData);

    const pagesEnabled = useOrchardPagesStore((state) => state.pagesEnabled);
    const pages = useOrchardPagesStore((state) => state.pages);
    const currentPageIndex = useOrchardPagesStore((state) => state.currentPageIndex);
    const togglePagesMode = useOrchardPagesStore((state) => state.togglePagesMode);
    const addPage = useOrchardPagesStore((state) => state.addPage);
    const removePage = useOrchardPagesStore((state) => state.removePage);
    const setCurrentPage = useOrchardPagesStore((state) => state.setCurrentPage);
    const reorderPages = useOrchardPagesStore((state) => state.reorderPages);
    const loadDefaultPages = useOrchardPagesStore((state) => state.loadDefaultPages);

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
        <div className={`flex flex-col ${embedded ? 'space-y-4' : 'h-full bg-gray-50 dark:bg-gray-900'}`}>

            {/* Header - only when not embedded */}
            {!embedded && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">Pages</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {pages.length} page{pages.length > 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={togglePagesMode}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${pagesEnabled ? 'bg-gradient-to-r text-white shadow-lg shadow-purple-500/30 ring-2 dark:' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            <span>{pagesEnabled ? 'ON' : 'OFF'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Embedded header */}
            {embedded && (
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            Trame de pages
                        </h3>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                            {pages.length} page{pages.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Glissez pour réordonner · Cliquez pour sélectionner
                    </p>
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
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex-1 p-2.5 border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-500 dark:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-xs font-medium flex items-center justify-center gap-1.5"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Ajouter une page
                        </button>
                        <button
                            onClick={handleResetPages}
                            title="Réinitialiser les pages par défaut"
                            className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs"
                        >
                            ↺
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation buttons */}
            {!embedded && pagesEnabled && pages.length > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPageIndex - 1))}
                            disabled={currentPageIndex === 0}
                            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            ← Précédent
                        </button>
                        <div className="px-3 py-2 dark: rounded-lg font-bold dark:">
                            {currentPageIndex + 1} / {pages.length}
                        </div>
                        <button
                            onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPageIndex + 1))}
                            disabled={currentPageIndex === pages.length - 1}
                            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Suivant →
                        </button>
                    </div>
                </div>
            )}

            {/* Add page modal */}
            <AnimatePresence>
                {showAddModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                            onClick={() => setShowAddModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto"
                        >
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ajouter une page</h3>

                            <div className="space-y-2">
                                {/* Blank page */}
                                <button
                                    onClick={() => handleAddPage({ label: 'Nouvelle page', icon: '📄', modules: [] })}
                                    className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📄</span>
                                        <div>
                                            <div className="font-semibold text-gray-900 dark:text-white">Page vierge</div>
                                            <div className="text-xs text-gray-500">Contenu personnalisé vide</div>
                                        </div>
                                    </div>
                                </button>

                                {/* Available page templates */}
                                {availablePageTemplates.length > 0 && (
                                    <>
                                        <div className="pt-2 pb-1">
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Modèles disponibles
                                            </p>
                                        </div>
                                        {availablePageTemplates.map((tpl, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAddPage(tpl)}
                                                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{tpl.icon || '📋'}</span>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white">{tpl.label}</div>
                                                        {tpl.description && (
                                                            <div className="text-xs text-gray-500">{tpl.description}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => setShowAddModal(false)}
                                className="mt-4 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                            >
                                Annuler
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

PageManager.propTypes = {
    embedded: PropTypes.bool,
};

