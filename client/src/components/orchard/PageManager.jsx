import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { useOrchardPagesStore } from '../../store/orchardPagesStore';

/**
 * Composant pour une page triable dans la liste
 */
function SortablePage({ page, isActive, onClick, onRemove }) {
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
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer shadow-sm hover:shadow-md ${isActive ? ' bg-gradient-to-br dark:/30 dark:/30 ring-2 dark: shadow-lg shadow-purple-500/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover: dark:hover:' }`}
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
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">{page.label}</h4>
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
    isActive: PropTypes.bool,
    onClick: PropTypes.func,
    onRemove: PropTypes.func,
};

/**
 * Composant principal de gestion des pages
 */
export default function PageManager() {
    const [showAddModal, setShowAddModal] = useState(false);

    const pagesEnabled = useOrchardPagesStore((state) => state.pagesEnabled);
    const pages = useOrchardPagesStore((state) => state.pages);
    const currentPageIndex = useOrchardPagesStore((state) => state.currentPageIndex);
    const togglePagesMode = useOrchardPagesStore((state) => state.togglePagesMode);
    const addPage = useOrchardPagesStore((state) => state.addPage);
    const removePage = useOrchardPagesStore((state) => state.removePage);
    const setCurrentPage = useOrchardPagesStore((state) => state.setCurrentPage);
    const reorderPages = useOrchardPagesStore((state) => state.reorderPages);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = pages.findIndex((p) => p.id === active.id);
            const newIndex = pages.findIndex((p) => p.id === over.id);
            reorderPages(oldIndex, newIndex);
        }
    };

    const handleAddPage = (template) => {
        addPage(template);
        setShowAddModal(false);
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header */}
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

                    {/* Toggle mode pages */}
                    <button
                        onClick={togglePagesMode}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${pagesEnabled ? 'bg-gradient-to-r text-white shadow-lg shadow-purple-500/30 ring-2 dark:' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' }`}
                    >
                        {pagesEnabled ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>ON</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>OFF</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Info tooltip */}
                {!pagesEnabled && (
                    <div className="p-3 bg-gradient-to-r dark:/20 dark:/20 rounded-lg border-2 dark:">
                        <div className="flex gap-2">
                            <svg className="w-5 h-5 dark: flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-xs dark: leading-relaxed">
                                <strong>Mode Multi-Pages :</strong> Répartissez vos informations sur plusieurs pages pour une meilleure lisibilité
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Pages list */}
            {pagesEnabled && (
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-purple-300 dark:scrollbar-thumb-purple-700 scrollbar-track-transparent hover:scrollbar-thumb-purple-400 dark:hover:scrollbar-thumb-purple-600">
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={pages.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                            {pages.map((page, index) => (
                                <SortablePage
                                    key={page.id}
                                    page={page}
                                    isActive={index === currentPageIndex}
                                    onClick={() => setCurrentPage(index)}
                                    onRemove={() => removePage(page.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>

                    {/* Add page button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover: hover: transition-all"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="font-medium">Ajouter une page</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Navigation buttons */}
            {pagesEnabled && pages.length > 1 && (
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
                                <button
                                    onClick={() => handleAddPage({ label: 'Nouvelle page', icon: '📄', modules: [] })}
                                    className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-lg hover: transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📄</span>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">Page vierge</div>
                                            <div className="text-sm text-gray-500">Personnalisez votre contenu</div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            <button
                                onClick={() => setShowAddModal(false)}
                                className="mt-4 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
