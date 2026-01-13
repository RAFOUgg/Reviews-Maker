import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    useReactFlow,
    getIncomers,
    getOutgoers,
    getConnectedEdges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { usePhenoHuntStore } from '../../store/index';
import PhenoNode from './PhenoNode';
import PhenoEdge from './PhenoEdge';
import { ZoomIn, ZoomOut, Edit3, Trash2, Copy, Save } from 'lucide-react';

const nodeTypes = {
    phenoNode: PhenoNode,
};

const edgeTypes = {
    phenoEdge: PhenoEdge,
};

/**
 * CanevasPhenoHunt - Canvas interactif avec React Flow
 * Features: Drag-drop, edge connections, layout, zoom/pan, duplication
 */
export default function CanevasPhenoHunt() {
    const {
        phenoTrees,
        activeTreeId,
        selectedNodeId,
        selectNode,
        updateNode,
        deleteNode,
        deleteEdge,
        duplicateNode,
        addEdge: addEdgeToStore,
        saveTree,
        getActiveTree,
        addNode
    } = usePhenoHuntStore();

    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isSaving, setIsSaving] = useState(false);

    const tree = getActiveTree();

    // Synchroniser l'état local avec le store
    useEffect(() => {
        if (tree) {
            setNodes(tree.nodes || []);
            setEdges(tree.edges || []);
        }
    }, [tree, setNodes, setEdges]);

    // Sauvegarder les changements localement
    const updateStoreFromLocal = useCallback((localNodes, localEdges) => {
        if (!activeTreeId) return;

        // Mettre à jour les positions des nœuds
        localNodes.forEach(node => {
            updateNode(node.id, { 
                position: node.position,
                data: node.data
            });
        });

        // Sauvegarder les edges
        localEdges.forEach(edge => {
            // Les edges sont déjà gérés par le store
        });
    }, [activeTreeId, updateNode]);

    const handleNodesChange = useCallback((changes) => {
        onNodesChange(changes);
        updateStoreFromLocal(nodes, edges);
    }, [onNodesChange, nodes, edges, updateStoreFromLocal]);

    const handleConnect = useCallback((connection) => {
        // Validation des cycles
        const hasRecursion = tree?.nodes?.some(node =>
            node.id === connection.source &&
            tree.edges?.some(edge => edge.target === connection.source && edge.source === connection.target)
        );

        if (hasRecursion) {
            alert('❌ Cycle détecté! Impossible de créer cette connexion.');
            return;
        }

        // Ajouter l'edge
        const newEdge = {
            id: `edge-${connection.source}-${connection.target}`,
            source: connection.source,
            target: connection.target,
            type: 'phenoEdge',
            label: 'Croisement F1',
            animated: true,
        };

        setEdges(eds => addEdge(newEdge, eds));
        addEdgeToStore({
            source: connection.source,
            target: connection.target,
            type: 'phenoEdge'
        });
    }, [tree, setEdges, addEdgeToStore]);

    const handleNodeClick = useCallback((event, node) => {
        event.stopPropagation();
        selectNode(node.id);
    }, [selectNode]);

    const handlePaneClick = useCallback(() => {
        selectNode(null);
    }, [selectNode]);

    // Handlers pour drag & drop depuis le sidebar
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        
        try {
            const cultivarData = e.dataTransfer.getData('application/json');
            if (!cultivarData) return;

            const cultivar = JSON.parse(cultivarData);
            
            if (!activeTreeId) {
                alert('⚠️ Veuillez d\'abord sélectionner ou créer un arbre généalogique');
                return;
            }

            // Ajouter le nœud au canvas
            addNode({
                cultivarId: cultivar.id,
                cultivarName: cultivar.name,
                position: { x: Math.random() * 400, y: Math.random() * 400 },
                genetics: cultivar.genetics || {},
                phenoCode: cultivar.phenoCode
            });
        } catch (error) {
            console.error('Erreur lors du drop:', error);
        }
    }, [addNode, activeTreeId]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedNodeId) return;

            // Ctrl+D: Dupliquer
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                duplicateNode(selectedNodeId);
            }

            // Delete: Supprimer
            if (e.key === 'Delete') {
                deleteNode(selectedNodeId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedNodeId, duplicateNode, deleteNode]);

    // Sauvegarder l'arbre
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveTree();
            alert('✅ Arbre sauvegardé avec succès!');
        } catch (error) {
            alert('❌ Erreur lors de la sauvegarde: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const selectedNode = tree?.nodes?.find(n => n.id === selectedNodeId);

    return (
        <div className="h-full w-full bg-slate-950 flex flex-col">
            {/* Toolbar */}
            <div className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-emerald-500/20 px-4 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-white">
                        {tree?.metadata?.name || 'Arbre Génétique'}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    {selectedNode && (
                        <>
                            <ToolbarButton
                                icon={Copy}
                                label="Dupliquer (Ctrl+D)"
                                onClick={() => duplicateNode(selectedNodeId)}
                            />
                            <ToolbarButton
                                icon={Trash2}
                                label="Supprimer (Del)"
                                onClick={() => deleteNode(selectedNodeId)}
                                className="hover:text-red-400"
                            />
                            <div className="w-px h-6 bg-slate-600" />
                        </>
                    )}

                    <ToolbarButton
                        icon={ZoomIn}
                        label="Zoom avant"
                        onClick={() => fitView({ duration: 200 })}
                    />
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={handleNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={handleConnect}
                    onNodeClick={handleNodeClick}
                    onPaneClick={handlePaneClick}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
                >
                    <Background
                        color="#334155"
                        variant="dots"
                        gap={20}
                        size={1.5}
                        style={{
                            backgroundColor: '#0f172a'
                        }}
                    />
                    <Controls
                        showInteractive={false}
                        className="bg-slate-800/80 border border-emerald-500/20 rounded-lg"
                    />
                    <MiniMap
                        nodeColor={(node) =>
                            selectedNodeId === node.id
                                ? '#10b981'
                                : '#475569'
                        }
                        style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.8)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                        }}
                    />
                </ReactFlow>

                {/* Drop Zone Hint */}
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <div className="text-center text-slate-400 bg-slate-950/60 p-6 rounded-lg">
                            <div className="text-4xl mb-3">🌳</div>
                            <p className="text-lg font-medium mb-2">
                                Commencez votre arbre généalogique
                            </p>
                            <p className="text-sm text-slate-500 mb-3">
                                Glissez des cultivars depuis la sidebar
                            </p>
                            <p className="text-xs text-slate-600">
                                💡 Connectez ensuite les nœuds pour créer les relations
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Panel */}
            {selectedNode && (
                <NodeInfoPanel node={selectedNode} />
            )}
        </div>
    );
}

function ToolbarButton({ icon: Icon, label, onClick, className = '' }) {
    return (
        <button
            onClick={onClick}
            title={label}
            className={`p-1.5 text-slate-400 hover:text-emerald-400 transition-colors ${className}`}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
}

function NodeInfoPanel({ node }) {
    return (
        <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-emerald-500/20 px-4 py-3 flex items-center gap-4 text-sm">
            <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                    {node.data.cultivarName || 'Cultivar sans nom'}
                </h3>
                <p className="text-slate-400">
                    Code: <span className="text-emerald-400 font-mono">{node.data.phenoCode}</span>
                </p>
                {node.data.metadata?.notes && (
                    <p className="text-slate-400 text-xs mt-1 italic">
                        {node.data.metadata.notes}
                    </p>
                )}
            </div>
            <div className="flex-shrink-0 px-3 py-2 bg-slate-800/50 rounded text-slate-300 text-xs">
                Position: {Math.round(node.position.x)}, {Math.round(node.position.y)}
            </div>
        </div>
    );
}

