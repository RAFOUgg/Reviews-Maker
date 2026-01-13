import React from 'react';
import { TreeView } from '@minoru/react-dnd-treeview';

const SidebarHierarchique = ({ data, onAddGroup, onDuplicateCultivar, onDrop }) => {
    return (
        <div className="p-4 bg-gradient-to-br from-gray-800 to-gray-700 text-white h-full shadow-lg rounded-lg border border-gray-600 md:w-1/4 w-full">
            <h2 className="text-lg font-bold mb-4">PhénoHunt</h2>
            <TreeView
                data={data}
                onDrop={onDrop}
                draggable
                render={(node, { depth, isOpen, onToggle }) => (
                    <div
                        style={{ marginLeft: depth * 20 }}
                        className="flex items-center gap-2 p-2 bg-gray-600 rounded-md shadow-sm hover:bg-gray-500"
                    >
                        {node.children && (
                            <button onClick={onToggle} className="text-gray-300 hover:text-white">
                                {isOpen ? '-' : '+'}
                            </button>
                        )}
                        <span>{node.name}</span>
                    </div>
                )}
            />
            <button
                className="mt-4 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded shadow-md"
                onClick={() => onAddGroup('root')}
            >
                Ajouter un groupe
            </button>
            <button
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow-md"
                onClick={() => onDuplicateCultivar('example-id')}
            >
                Dupliquer un cultivar
            </button>
        </div>
    );
};

export default SidebarHierarchique;