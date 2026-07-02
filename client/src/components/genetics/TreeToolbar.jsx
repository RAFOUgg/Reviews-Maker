/**
 * TreeToolbar Component
 * 
 * Barre d'outils pour les actions sur l'arbre généalogique
 */

import React from 'react';
import { toSvg } from 'html-to-image';
import useGeneticsStore from '../../store/useGeneticsStore';

const TreeToolbar = ({ treeId }) => {
    const store = useGeneticsStore();

    const handleAddNode = () => {
        store.openNodeForm({
            cultivarName: '',
            position: { x: 0, y: 0 },
            color: '#FF6B9D',
            genetics: null,
            notes: ''
        });
    };

    const handleAddEdge = () => {
        store.openEdgeForm();
    };

    const handleResetZoom = () => {
        store.resetCanvas();
    };

    const handleExportJSON = async () => {
        try {
            const data = {
                tree: {
                    id: treeId,
                    nodes: store.nodes,
                    edges: store.edges
                },
                exportDate: new Date().toISOString()
            };

            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `genetic-tree-${treeId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'export: ' + error.message);
        }
    };

    const handleExportSVG = async () => {
        try {
            const viewport = document.querySelector('.react-flow__viewport');
            if (!viewport) {
                throw new Error('Canvas introuvable');
            }

            const dataUrl = await toSvg(viewport, { backgroundColor: '#0a0a14' });
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `genetic-tree-${treeId}.svg`;
            a.click();
        } catch (error) {
            console.error('Export SVG error:', error);
            alert('Erreur lors de l\'export SVG: ' + error.message);
        }
    };

    return (
        <div className="tree-toolbar">
            <div className="toolbar-group">
                <button
                    className="toolbar-btn"
                    onClick={handleAddNode}
                    title="Ajouter un cultivar"
                >
                    ➕ Nœud
                </button>
                <button
                    className="toolbar-btn"
                    onClick={handleAddEdge}
                    title="Créer une relation"
                >
                    🔗 Relation
                </button>
            </div>

            <div className="toolbar-group">
                <button
                    className="toolbar-btn secondary"
                    onClick={handleResetZoom}
                    title="Réinitialiser le zoom"
                >
                    🔍 Zoom
                </button>
            </div>

            <div className="toolbar-group">
                <button
                    className="toolbar-btn secondary"
                    onClick={handleExportJSON}
                    title="Exporter en JSON"
                >
                    💾 JSON
                </button>
                <button
                    className="toolbar-btn secondary"
                    onClick={handleExportSVG}
                    title="Exporter en SVG"
                >
                    🖼️ SVG
                </button>
            </div>

            <div className="toolbar-info">
                {store.nodes.length > 0 && (
                    <span title="Nœuds">📍 {store.nodes.length}</span>
                )}
                {store.edges.length > 0 && (
                    <span title="Relations">🔗 {store.edges.length}</span>
                )}
            </div>
        </div>
    );
};

export default TreeToolbar;




