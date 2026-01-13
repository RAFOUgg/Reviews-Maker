import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus, Download, RotateCcw } from 'lucide-react'

/**
 * GenealogyCanvas - Canva interactif pour créer l'arbre généalogique
 * Drag & drop des cultivars, création de liens parent/enfant
 * Style GitHub (grille de points)
 */
export default function GenealogyCanvas({ 
    genealogy = {}, 
    cultivarLibrary = [],
    onChange = () => {},
    disabled = false 
}) {
    const canvasRef = useRef(null)
    const [nodes, setNodes] = useState(genealogy.nodes || [])
    const [connections, setConnections] = useState(genealogy.connections || [])
    const [selectedNode, setSelectedNode] = useState(null)
    const [creatingConnection, setCreatingConnection] = useState(null)
    const [draggedNode, setDraggedNode] = useState(null)
    const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
    const [scale, setScale] = useState(1)

    // Sync avec parent
    useEffect(() => {
        onChange({ nodes, connections })
    }, [nodes, connections])

    // Gestion du drag & drop depuis la bibliothèque
    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    }

    const handleDrop = (e) => {
        e.preventDefault()
        if (disabled) return

        const cultivarId = e.dataTransfer.getData('cultivar-id')
        const cultivarName = e.dataTransfer.getData('cultivar-name')
        
        if (!cultivarId) return

        // Calculer la position relative au canvas
        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / scale - canvasOffset.x
        const y = (e.clientY - rect.top) / scale - canvasOffset.y

        // Vérifier si cultivar existe déjà
        const exists = nodes.some(n => n.cultivarId === cultivarId)
        if (exists) return

        // Ajouter le noeud
        const newNode = {
            id: `node-${Date.now()}`,
            cultivarId,
            cultivarName,
            x,
            y,
            image: cultivarLibrary.find(c => c.id === cultivarId)?.image
        }

        setNodes([...nodes, newNode])
    }

    // Ajouter connexion parent > enfant
    const addConnection = (parentId, childId) => {
        if (disabled) return
        
        const exists = connections.some(
            c => c.parentId === parentId && c.childId === childId
        )
        if (!exists) {
            setConnections([...connections, { id: `conn-${Date.now()}`, parentId, childId }])
        }
        setCreatingConnection(null)
    }

    // Supprimer noeud
    const deleteNode = (nodeId) => {
        if (disabled) return
        
        setNodes(nodes.filter(n => n.id !== nodeId))
        setConnections(connections.filter(
            c => c.parentId !== nodeId && c.childId !== nodeId
        ))
        setSelectedNode(null)
    }

    // Drag noeud sur canvas
    const handleNodeMouseDown = (nodeId) => {
        setDraggedNode(nodeId)
    }

    const handleNodeMouseMove = (e) => {
        if (!draggedNode || disabled) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / scale - canvasOffset.x
        const y = (e.clientY - rect.top) / scale - canvasOffset.y

        setNodes(nodes.map(n =>
            n.id === draggedNode ? { ...n, x, y } : n
        ))
    }

    const handleNodeMouseUp = () => {
        setDraggedNode(null)
    }

    // Réinitialiser vue
    const resetView = () => {
        setCanvasOffset({ x: 0, y: 0 })
        setScale(1)
    }

    // Dessiner les connexions SVG
    const drawConnections = () => {
        return (
            <svg
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
                viewBox={`${-canvasOffset.x * scale} ${-canvasOffset.y * scale} ${(canvasRef.current?.offsetWidth || 800) * scale} ${(canvasRef.current?.offsetHeight || 600) * scale}`}
            >
                {connections.map(conn => {
                    const parentNode = nodes.find(n => n.id === conn.parentId)
                    const childNode = nodes.find(n => n.id === conn.childId)

                    if (!parentNode || !childNode) return null

                    const x1 = parentNode.x + 40
                    const y1 = parentNode.y + 40
                    const x2 = childNode.x + 40
                    const y2 = childNode.y + 40

                    return (
                        <line
                            key={conn.id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(147, 51, 234, 0.5)"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                        />
                    )
                })}
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3, 0 6" fill="rgba(147, 51, 234, 0.7)" />
                    </marker>
                </defs>
            </svg>
        )
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={resetView}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                    disabled={disabled}
                >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser
                </button>
                
                <button
                    onClick={() => {
                        const data = JSON.stringify({ nodes, connections }, null, 2)
                        const blob = new Blob([data], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = 'genealogie.json'
                        a.click()
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-200 dark:bg-blue-900 hover:bg-blue-300 dark:hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
                    disabled={disabled || nodes.length === 0}
                >
                    <Download className="w-4 h-4" />
                    Exporter JSON
                </button>

                <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-auto">
                    {nodes.length} cultivar(s) • {connections.length} relation(s)
                </span>
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onMouseMove={handleNodeMouseMove}
                onMouseUp={handleNodeMouseUp}
                onMouseLeave={handleNodeMouseUp}
                className="relative w-full h-96 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-xl bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 overflow-auto"
                style={{
                    backgroundImage: `radial-gradient(circle, rgba(107, 114, 128, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                    cursor: creatingConnection ? 'crosshair' : draggedNode ? 'grabbing' : 'grab'
                }}
            >
                {/* SVG Connexions */}
                {drawConnections()}

                {/* Noeuds */}
                {nodes.map(node => (
                    <motion.div
                        key={node.id}
                        layoutId={node.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`absolute w-24 cursor-move transition-all ${'ring-2 ' + (selectedNode === node.id ? 'ring-purple-500 ring-offset-2' : 'ring-transparent')}`}
                        style={{
                            left: `${node.x}px`,
                            top: `${node.y}px`
                        }}
                        onMouseDown={() => {
                            handleNodeMouseDown(node.id)
                            setSelectedNode(node.id)
                        }}
                    >
                        {/* Cultivar Card */}
                        <div
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            {/* Image */}
                            {node.image && (
                                <img
                                    src={node.image}
                                    alt={node.cultivarName}
                                    className="w-full h-16 object-cover"
                                />
                            )}
                            <div className={`${!node.image ? 'h-16 ' : ''}bg-gradient-to-b from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 flex items-center justify-center`}>
                                {!node.image && <span className="text-2xl">🌱</span>}
                            </div>

                            {/* Nom */}
                            <div className="p-2 text-center">
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                                    {node.cultivarName}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 p-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                                {creatingConnection ? (
                                    <button
                                        onClick={() => addConnection(creatingConnection, node.id)}
                                        className="flex-1 text-xs py-1 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                        title="Cliquer pour créer le lien enfant"
                                    >
                                        ✓ Enfant
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCreatingConnection(node.id)}
                                        className="flex-1 text-xs py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                        title="Créer un lien vers un enfant"
                                        disabled={disabled}
                                    >
                                        Parent
                                    </button>
                                )}
                                <button
                                    onClick={() => deleteNode(node.id)}
                                    className="text-xs py-1 px-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                    disabled={disabled}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Message vide */}
                {nodes.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400 dark:text-gray-600">
                            <p className="text-lg font-medium mb-2">📭 Canva vide</p>
                            <p className="text-sm">Drag & drop les cultivars depuis la bibliothèque</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>💡 Glissez-déposez les cultivars de la bibliothèque vers le canva</p>
                <p>🔗 Cliquez sur "Parent" pour créer une relation parent→enfant</p>
                <p>🗑️ Cliquez sur la corbeille pour supprimer un cultivar</p>
            </div>
        </div>
    )
}
