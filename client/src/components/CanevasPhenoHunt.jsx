import React, { useCallback } from 'react';
import ReactFlow, { addEdge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

const initialNodes = [
    {
        id: '1',
        type: 'default',
        position: { x: 250, y: 5 },
        data: { label: 'Root Node' },
    },
];

const initialEdges = [];

const CanevasPhenoHunt = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleNodeDragStop = (event, node) => {
        // Node drag handled
    };

    const saveTreeChanges = async () => {
        try {
            const response = await fetch('/api/phenotrees/1', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nodes, edges }),
            });
            if (!response.ok) {
                throw new Error('Failed to save tree changes');
            }
        } catch (error) {
            // Error silently caught
        }
    };

    return (
        <div className="h-full bg-gradient-to-br from-gray-900 to-gray-800 md:w-3/4 w-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={(changes) => {
                    onNodesChange(changes);
                    saveTreeChanges();
                }}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeDragStop={handleNodeDragStop}
                fitView
                className="shadow-lg rounded-lg border border-gray-700"
            />
        </div>
    );
};

export default CanevasPhenoHunt;