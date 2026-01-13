/**
 * GeneticsManagementPage Component
 * 
 * Page dédiée pour la gestion complète des arbres généalogiques
 * Accessible depuis la bibliothèque personnelle de l'utilisateur
 * 
 * Features:
 * - Listing des arbres de l'utilisateur
 * - Création/modification/suppression d'arbres
 * - Accès au canvas pour édition
 * - Partage d'arbres publics
 * - Statistiques sur les arbres
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import useGeneticsStore from '../../store/useGeneticsStore';
import UnifiedGeneticsCanvas from '../../components/genetics/UnifiedGeneticsCanvas';
import TreeFormModal from '../../components/genetics/TreeFormModal';
import './GeneticsManagementPage.css';

const GeneticsManagementPage = () => {
    const navigate = useNavigate();
    const store = useGeneticsStore();
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'canvas'
    const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'created' | 'name'
    const [filterType, setFilterType] = useState('all'); // 'all' | 'phenohunt' | 'selection' | 'crossing' | 'hunt'

    // Charger les arbres au montage
    useEffect(() => {
        store.fetchTrees();
    }, [store.fetchTrees]);

    // Tri des arbres
    const sortedTrees = [...store.trees].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'created':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'updated':
            default:
                return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
    });

    // Filtrage des arbres
    const filteredTrees = filterType === 'all'
        ? sortedTrees
        : sortedTrees.filter(t => t.projectType === filterType);

    // Gestionnaires
    const handleCreateTree = () => {
        store.openTreeForm({
            name: '',
            description: '',
            projectType: 'phenohunt',
            isPublic: false
        });
    };

    const handleEditTree = (tree) => {
        store.openTreeForm(tree);
    };

    const handleDeleteTree = async (treeId, treeName) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${treeName}" et tous ses contenus ?`)) {
            await store.deleteTree(treeId);
        }
    };

    const handleOpenCanvas = (treeId) => {
        store.loadTree(treeId);
        setViewMode('canvas');
    };

    const handleBackToList = () => {
        setViewMode('list');
        store.clearSelection();
    };

    const getProjectTypeLabel = (type) => {
        const labels = {
            'phenohunt': '🔍 PhenoHunt',
            'selection': '🌿 Sélection',
            'crossing': '🔄 Croisement',
            'hunt': '🎯 Hunt'
        };
        return labels[type] || type;
    };

    // Vue Canvas
    if (viewMode === 'canvas' && store.selectedTreeId) {
        return (
            <div className="genetics-page canvas-mode">
                <div className="canvas-header">
                    <button className="btn-back" onClick={handleBackToList}>
                        ← Retour à la liste
                    </button>
                    <h1>{store.nodes.length > 0 ? store.nodes[0].cultivarName : 'Arbre généalogique'}</h1>
                    <div className="canvas-actions">
                        {/* Actions supplémentaires si nécessaire */}
                    </div>
                </div>

                <div className="canvas-container">
                    <ReactFlowProvider>
                        <UnifiedGeneticsCanvas treeId={store.selectedTreeId} readOnly={false} />
                    </ReactFlowProvider>
                </div>
            </div>
        );
    }

    // Vue Liste
    return (
        <div className="genetics-page list-mode">
            <div className="page-header">
                <div>
                    <h1>🧬 Arbres Généalogiques</h1>
                    <p>Gérez et explorez vos arbres généalogiques, phénotypes et sélections</p>
                </div>
                <button className="btn-primary" onClick={handleCreateTree}>
                    ➕ Nouvel arbre
                </button>
            </div>

            {/* Filters & Sorting */}
            <div className="filters-bar">
                <div className="filter-group">
                    <label>Type:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">Tous les types</option>
                        <option value="phenohunt">🔍 PhenoHunt</option>
                        <option value="selection">🌿 Sélection</option>
                        <option value="crossing">🔄 Croisement</option>
                        <option value="hunt">🎯 Hunt</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Trier par:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="updated">Récemment modifié</option>
                        <option value="created">Récemment créé</option>
                        <option value="name">Nom (A-Z)</option>
                    </select>
                </div>

                <div className="filter-info">
                    Affichage {filteredTrees.length} / {store.trees.length} arbre(s)
                </div>
            </div>

            {/* Loading State */}
            {store.treeLoading && (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement des arbres...</p>
                </div>
            )}

            {/* Error State */}
            {store.treeError && (
                <div className="error-banner">
                    <p>❌ Erreur: {store.treeError}</p>
                    <button onClick={() => store.fetchTrees()}>Réessayer</button>
                </div>
            )}

            {/* Empty State */}
            {!store.treeLoading && filteredTrees.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🌳</div>
                    <h3>Aucun arbre généalogique</h3>
                    <p>
                        {filterType === 'all'
                            ? 'Créez votre premier arbre pour commencer'
                            : `Aucun arbre de type "${filterType}" trouvé`}
                    </p>
                    {filterType !== 'all' && (
                        <button
                            className="btn-secondary"
                            onClick={() => setFilterType('all')}
                        >
                            Voir tous les arbres
                        </button>
                    )}
                    <button className="btn-primary" onClick={handleCreateTree}>
                        ➕ Créer un nouvel arbre
                    </button>
                </div>
            )}

            {/* Trees Grid */}
            {!store.treeLoading && filteredTrees.length > 0 && (
                <div className="trees-grid">
                    {filteredTrees.map(tree => (
                        <div key={tree.id} className="tree-card">
                            {/* Card Header */}
                            <div className="card-header">
                                <div>
                                    <h3>{tree.name}</h3>
                                    <p className="tree-type">{getProjectTypeLabel(tree.projectType)}</p>
                                </div>
                                {tree.isPublic && (
                                    <span className="badge public">🌐 Public</span>
                                )}
                            </div>

                            {/* Card Description */}
                            {tree.description && (
                                <p className="card-description">{tree.description}</p>
                            )}

                            {/* Card Stats */}
                            <div className="card-stats">
                                <div className="stat">
                                    <span className="stat-value">{tree._count?.nodes || 0}</span>
                                    <span className="stat-label">Cultivars</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{tree._count?.edges || 0}</span>
                                    <span className="stat-label">Relations</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">
                                        {new Date(tree.updatedAt).toLocaleDateString('fr')}
                                    </span>
                                    <span className="stat-label">Modifié</span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="card-actions">
                                <button
                                    className="btn-primary btn-sm"
                                    onClick={() => handleOpenCanvas(tree.id)}
                                    title="Ouvrir le canvas"
                                >
                                    🎨 Éditer
                                </button>
                                <button
                                    className="btn-secondary btn-sm"
                                    onClick={() => handleEditTree(tree)}
                                    title="Modifier les informations"
                                >
                                    ✏️ Infos
                                </button>
                                <button
                                    className="btn-danger btn-sm"
                                    onClick={() => handleDeleteTree(tree.id, tree.name)}
                                    title="Supprimer cet arbre"
                                >
                                    🗑️ Supprimer
                                </button>
                            </div>

                            {/* Card Footer */}
                            <div className="card-footer">
                                <small>
                                    Créé le {new Date(tree.createdAt).toLocaleDateString('fr')}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tree Form Modal */}
            {store.showTreeForm && (
                <TreeFormModal
                    isEdit={store.treeFormData?.id !== undefined}
                    onClose={store.closeTreeForm}
                />
            )}
        </div>
    );
};

export default GeneticsManagementPage;
