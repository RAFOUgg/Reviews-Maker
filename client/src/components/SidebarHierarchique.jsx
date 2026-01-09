import React from 'react';
import { TreeView } from '@minoru/react-dnd-treeview';

const SidebarHierarchique = ({ data, onAddGroup, onDuplicateCultivar }) => {
    const handleDrop = (newTree) => {
        console.log('Tree updated:', newTree);
    };

    return (
        <div className="p-4 bg-gray-800 text-white h-full">
            <h2 className="text-lg font-bold mb-4">PhénoHunt</h2>
            <TreeView
                data={data}
                onDrop={handleDrop}
                draggable
                render={(node, { depth, isOpen, onToggle }) => (
                    <div
                        style={{ marginLeft: depth * 20 }}
                        className="flex items-center gap-2 p-2 bg-gray-700 rounded-md"
                    >
                        {node.children && (
                            <button onClick={onToggle}>
                                {isOpen ? '-' : '+'}
                            </button>
                        )}
                        <span>{node.name}</span>
                    </div>
                )}
            />
            <button
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                onClick={() => onAddGroup('root')}
            >
                Ajouter un groupe
            </button>
            <button
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                onClick={() => onDuplicateCultivar('example-id')}
            >
                Dupliquer un cultivar
            </button>
        </div>
    );
};

export default SidebarHierarchique;