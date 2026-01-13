/**
 * GeneticsLibraryCanvas - Système d'arbre généalogique des cultivars
 * Disponible uniquement pour les Producteurs avec type Fleurs
 * 
 * Fonctionnalités:
 * - Bibliothèque de cultivars (bandeau latéral gauche)
 * - Canva vide à droite pour drag & drop
 * - Création de relations parents/enfants (lignée généalogique)
 * - Visualisation graphique de l'arbre
 * - Projets PhenoHunt (gestion cultivars en développement)
 */

import { useState } from 'react';
import { Plus, Save, Share2, Download, Upload, Trash2, Edit2, GitBranch, Search, Filter } from 'lucide-react';

export default function GeneticsLibraryCanvas({ userId, accountType }) {
    const [cultivars, setCultivars] = useState([
        // Exemples initiaux
        { id: 1, name: 'OG Kush', type: 'Hybride', breeder: 'Unknown', notes: '', position: null },
        { id: 2, name: 'Sour Diesel', type: 'Sativa', breeder: 'Chemdog', notes: '', position: null },
        { id: 3, name: 'Girl Scout Cookies', type: 'Hybride', breeder: 'Berner', notes: '', position: null }
    ]);

    const [canvasItems, setCanvasItems] = useState([]); // Cultivars placés sur le canva
    const [relationships, setRelationships] = useState([]); // Relations parent-enfant
    const [selectedCultivar, setSelectedCultivar] = useState(null);
    const [activeTab, setActiveTab] = useState('library'); // library | phenohunt
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    // Vérifier si compte Producteur
    if (accountType !== 'Producteur') {
        return (
            <div className="p-8 text-center">
                <div className="max-w-md mx-auto p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl">
                    <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                        🔒 Fonctionnalité réservée aux comptes <strong>Producteur</strong>
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                        Passez à un compte Producteur pour accéder au système d'arbre généalogique des cultivars.
                    </p>
                </div>
            </div>
        );
    }

    // Handlers drag & drop
    const handleDragStart = (e, cultivar) => {
        e.dataTransfer.setData('cultivar', JSON.stringify(cultivar));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const cultivarData = JSON.parse(e.dataTransfer.getData('cultivar'));
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Ajouter au canva avec position
        const newItem = {
            ...cultivarData,
            canvasId: Date.now(),
            position: { x, y }
        };

        setCanvasItems([...canvasItems, newItem]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    // Créer relation parent-enfant
    const handleCreateRelationship = (parentId, childId) => {
        const newRelationship = {
            id: Date.now(),
            parent: parentId,
            child: childId
        };
        setRelationships([...relationships, newRelationship]);
    };

    // Filtrer cultivars selon recherche
    const filteredCultivars = cultivars.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.breeder.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen">
            {/* BANDEAU LATÉRAL GAUCHE */}
            <aside className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <GitBranch className="w-6 h-6 text-green-500" />
                        Génétiques
                    </h2>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={() => setActiveTab('library')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'library' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}
                        >
                            📚 Bibliothèque
                        </button>
                        <button
                            onClick={() => setActiveTab('phenohunt')}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'phenohunt' ? ' text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}
                        >
                            🔬 PhenoHunt
                        </button>
                    </div>
                </div>

                {/* Recherche */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un cultivar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Liste des cultivars */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {activeTab === 'library' && (
                        <>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter un cultivar
                            </button>

                            {filteredCultivars.map((cultivar) => (
                                <div
                                    key={cultivar.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, cultivar)}
                                    className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                {cultivar.name}
                                            </h3>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {cultivar.type} • {cultivar.breeder}
                                            </p>
                                        </div>
                                        <div className="text-xs text-gray-400 group-hover:text-green-500">
                                            ⋮⋮
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {activeTab === 'phenohunt' && (
                        <div className="text-center p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                🔬 Projets PhenoHunt
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                Gérez vos cultivars en cours de développement
                            </p>
                            <button className="mt-4 px-4 py-2 hover: text-white rounded-lg text-sm font-medium transition-colors">
                                Créer un projet
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* CANVA PRINCIPAL */}
            <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
                {/* Toolbar */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                    <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Save className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Share2 className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Download className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                {/* Zone de drop */}
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="w-full h-full relative"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}
                >
                    {canvasItems.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center max-w-md">
                                <GitBranch className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Créez votre arbre généalogique
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Glissez des cultivars depuis la bibliothèque pour construire votre lignée génétique
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Lignes de relations */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                {relationships.map((rel) => {
                                    const parent = canvasItems.find(item => item.canvasId === rel.parent);
                                    const child = canvasItems.find(item => item.canvasId === rel.child);
                                    if (!parent || !child) return null;

                                    return (
                                        <line
                                            key={rel.id}
                                            x1={parent.position.x + 60}
                                            y1={parent.position.y + 40}
                                            x2={child.position.x + 60}
                                            y2={child.position.y + 40}
                                            stroke="#10b981"
                                            strokeWidth="2"
                                            strokeDasharray="5,5"
                                        />
                                    );
                                })}
                            </svg>

                            {/* Cultivars placés */}
                            {canvasItems.map((item) => (
                                <div
                                    key={item.canvasId}
                                    className="absolute p-4 bg-white dark:bg-gray-800 border-2 border-green-500 rounded-xl shadow-lg cursor-move"
                                    style={{
                                        left: item.position.x,
                                        top: item.position.y,
                                        width: '120px'
                                    }}
                                >
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                        {item.name}
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                        {item.type}
                                    </p>
                                    <div className="flex gap-1 mt-2">
                                        <button className="flex-1 p-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs">
                                            👪
                                        </button>
                                        <button className="flex-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}


