# 🛠️ GUIDE IMPLÉMENTATION - FIXES CRITIQUES EXPORT MAKER & PHENOHUNT

**Objectif**: Corriger les 5 problèmes critiques en 8-10h d'implémentation.  
**Prérequis**: VSCode, PostMan/client HTTP, accès VPS.

---

## ÉTAPE 1: CRÉER TABLE PRISMA `ExportConfiguration` (30min)

### 1.1 Modifier `server-new/prisma/schema.prisma`

Ajouter ce modèle:

```prisma
// ============================================================================
// ExportConfiguration - Sauvegarde des configurations d'export
// ============================================================================
model ExportConfiguration {
  id              String    @id @default(cuid())
  userId          String
  reviewId        String
  
  // Configuration d'export
  template        String    // 'modernCompact', 'detailedCard', 'blogArticle', etc.
  format          String    // '1:1', '16:9', '9:16', 'A4'
  config          Json      // { colors, typography, contentModules, image, branding }
  
  // Timestamps
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  review          Review    @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([reviewId])
  @@unique([reviewId, template, format]) // Une seule config par review/template/format combo
}

// Dans le modèle Review, ajouter:
model Review {
  // ... existing fields
  exportConfigurations  ExportConfiguration[]  // Nouvelles configs
}

// Dans le modèle User, ajouter:
model User {
  // ... existing fields
  exportConfigurations  ExportConfiguration[]  // Ses configs
}
```

### 1.2 Créer migration Prisma

```bash
# Dans le terminal (from server-new/ folder)
npm run prisma:migrate -- --name add_export_configuration

# Générer client Prisma
npm run prisma:generate
```

### 1.3 Vérifier la création

```bash
# Voir la migration créée
ls server-new/prisma/migrations/ | tail -1

# Vérifier que la table existe (dev DB SQLite)
npm run prisma:studio
# Si production, voir avec pg_dump le schéma PostgreSQL
```

---

## ÉTAPE 2: CRÉER ROUTES BACKEND `POST /api/export/config/save` (45min)

### 2.1 Modifier `server-new/routes/export.js`

Ajouter ces routes après les routes existantes:

```javascript
/**
 * POST /api/export/config/save
 * Sauvegarder une configuration d'export
 */
router.post('/config/save',
    requireAuth,
    asyncHandler(async (req, res) => {
        const { reviewId, template, format, config } = req.body;

        // Validation
        if (!reviewId || !template || !format || !config) {
            throw Errors.VALIDATION_ERROR(['reviewId', 'template', 'format', 'config required']);
        }

        // Vérifier que la review existe et appartient à l'utilisateur ou est publique
        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            throw Errors.REVIEW_NOT_FOUND();
        }

        if (review.authorId !== req.user.id && !review.isPublic) {
            throw Errors.FORBIDDEN('Cannot save export config for private review');
        }

        // Sauvegarder ou mettre à jour la configuration
        const saved = await prisma.exportConfiguration.upsert({
            where: {
                reviewId_template_format: {
                    reviewId,
                    template,
                    format
                }
            },
            create: {
                userId: req.user.id,
                reviewId,
                template,
                format,
                config
            },
            update: {
                config,
                updatedAt: new Date()
            }
        });

        // Track dans stats
        await prisma.exportLog?.create?.({
            data: {
                userId: req.user.id,
                reviewId,
                action: 'config_saved',
                template,
                format,
                timestamp: new Date()
            }
        }).catch(() => {}); // Ignore si table n'existe pas

        res.json({
            success: true,
            config: saved
        });
    })
);

/**
 * GET /api/export/config/:reviewId
 * Charger une configuration d'export pour une review
 */
router.get('/config/:reviewId',
    requireAuth,
    asyncHandler(async (req, res) => {
        const { reviewId } = req.params;
        const { template, format } = req.query;

        const review = await prisma.review.findUnique({
            where: { id: reviewId }
        });

        if (!review || (review.authorId !== req.user.id && !review.isPublic)) {
            throw Errors.FORBIDDEN('Cannot access this review');
        }

        // Si template et format spécifiés, charger cette config exacte
        if (template && format) {
            const config = await prisma.exportConfiguration.findUnique({
                where: {
                    reviewId_template_format: {
                        reviewId,
                        template,
                        format
                    }
                }
            });
            return res.json({
                success: true,
                config: config || null
            });
        }

        // Sinon charger toutes les configs pour cette review
        const configs = await prisma.exportConfiguration.findMany({
            where: { reviewId },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            configs
        });
    })
);

/**
 * DELETE /api/export/config/:configId
 * Supprimer une configuration d'export
 */
router.delete('/config/:configId',
    requireAuth,
    asyncHandler(async (req, res) => {
        const { configId } = req.params;

        const config = await prisma.exportConfiguration.findUnique({
            where: { id: configId }
        });

        if (!config) {
            throw Errors.NOT_FOUND('Export configuration not found');
        }

        // Vérifier que c'est l'utilisateur qui l'a créée
        if (config.userId !== req.user.id) {
            throw Errors.FORBIDDEN('Cannot delete export config of another user');
        }

        await prisma.exportConfiguration.delete({
            where: { id: configId }
        });

        res.json({
            success: true,
            message: 'Export configuration deleted'
        });
    })
);

/**
 * POST /api/export/config/use/:configId
 * Appliquer une configuration existante à une review
 */
router.post('/config/use/:configId',
    requireAuth,
    asyncHandler(async (req, res) => {
        const { configId } = req.params;

        const config = await prisma.exportConfiguration.findUnique({
            where: { id: configId }
        });

        if (!config) {
            throw Errors.NOT_FOUND('Export configuration not found');
        }

        // Vérifier que c'est public ou appartient à l'utilisateur
        if (config.userId !== req.user.id) {
            throw Errors.FORBIDDEN('Cannot use export config of another user');
        }

        res.json({
            success: true,
            config: config.config
        });
    })
);
```

### 2.2 Vérifier les imports de routes

Vérifier que dans `server-new/server.js`:

```javascript
// S'assurer que export routes sont importées
import exportRoutes from './routes/export.js';
app.use('/api/export', exportRoutes);
```

### 2.3 Tester les routes

```bash
# Test 1: Sauvegarder une config
curl -X POST http://localhost:3000/api/export/config/save \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID" \
  -d '{
    "reviewId": "review123",
    "template": "modernCompact",
    "format": "1:1",
    "config": {
      "colors": {"background": "#1a1a2e"},
      "typography": {"fontFamily": "Inter"}
    }
  }'

# Test 2: Charger la config
curl -X GET "http://localhost:3000/api/export/config/review123?template=modernCompact&format=1:1" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"

# Test 3: Lister toutes les configs d'une review
curl -X GET "http://localhost:3000/api/export/config/review123" \
  -H "Cookie: connect.sid=YOUR_SESSION_ID"
```

---

## ÉTAPE 3: INTÉGRER FRONTEND - HOOK DE PERSISTANCE (45min)

### 3.1 Créer `client/src/hooks/useExportConfigSave.js`

```javascript
import { useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook pour sauvegarder les configurations d'export
 * - Sauvegarde en backend API
 * - Cache en localStorage comme fallback
 * - Synchronise orchardStore avec backend
 */
export function useExportConfigSave() {
    const { user } = useAuth();
    const saveTimeoutRef = useRef(null);
    const savingRef = useRef(false);

    /**
     * Sauvegarder la configuration d'export
     */
    const saveConfig = useCallback(async (reviewId, template, format, config) => {
        if (!user || !reviewId) return null;

        // Éviter les saves doubles rapides
        if (savingRef.current) return null;
        savingRef.current = true;

        try {
            const response = await fetch('/api/export/config/save', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewId,
                    template,
                    format,
                    config
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('Failed to save export config:', error);
                
                // Fallback: sauvegarder en localStorage comme backup
                const cacheKey = `export-config-${reviewId}-${template}-${format}`;
                localStorage.setItem(cacheKey, JSON.stringify(config));
                
                return null;
            }

            const data = await response.json();
            console.log('✅ Export config saved to backend:', data);
            
            // Aussi sauvegarder en localStorage comme cache
            const cacheKey = `export-config-${reviewId}-${template}-${format}`;
            localStorage.setItem(cacheKey, JSON.stringify(config));

            return data;
        } catch (error) {
            console.error('Error saving export config:', error);
            
            // Fallback localStorage
            const cacheKey = `export-config-${reviewId}-${template}-${format}`;
            localStorage.setItem(cacheKey, JSON.stringify(config));
            
            return null;
        } finally {
            savingRef.current = false;
        }
    }, [user]);

    /**
     * Charger une configuration d'export
     */
    const loadConfig = useCallback(async (reviewId, template, format) => {
        if (!reviewId) return null;

        try {
            // D'abord checker le cache localStorage
            const cacheKey = `export-config-${reviewId}-${template}-${format}`;
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch {
                    localStorage.removeItem(cacheKey);
                }
            }

            // Charger du backend
            const response = await fetch(
                `/api/export/config/${reviewId}?template=${template}&format=${format}`,
                { credentials: 'include' }
            );

            if (!response.ok) return null;

            const data = await response.json();
            const config = data.config?.config || null;

            if (config) {
                // Mettre en cache
                localStorage.setItem(cacheKey, JSON.stringify(config));
            }

            return config;
        } catch (error) {
            console.error('Error loading export config:', error);
            return null;
        }
    }, []);

    /**
     * Lister toutes les configs pour une review
     */
    const listConfigs = useCallback(async (reviewId) => {
        if (!reviewId) return [];

        try {
            const response = await fetch(`/api/export/config/${reviewId}`, {
                credentials: 'include'
            });

            if (!response.ok) return [];

            const data = await response.json();
            return data.configs || [];
        } catch (error) {
            console.error('Error listing export configs:', error);
            return [];
        }
    }, []);

    /**
     * Supprimer une configuration
     */
    const deleteConfig = useCallback(async (configId, reviewId, template, format) => {
        try {
            // Supprimer du backend
            const response = await fetch(`/api/export/config/${configId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) return false;

            // Supprimer du cache localStorage
            const cacheKey = `export-config-${reviewId}-${template}-${format}`;
            localStorage.removeItem(cacheKey);

            console.log('✅ Export config deleted');
            return true;
        } catch (error) {
            console.error('Error deleting export config:', error);
            return false;
        }
    }, []);

    return {
        saveConfig,
        loadConfig,
        listConfigs,
        deleteConfig
    };
}
```

### 3.2 Intégrer dans `OrchardPanel.jsx`

Ajouter au composant:

```javascript
import { useExportConfigSave } from '../../../hooks/useExportConfigSave';

export default function OrchardPanel({ reviewData, onClose, onPresetApplied }) {
    // ... existing hooks
    const { saveConfig, loadConfig } = useExportConfigSave();
    const config = useOrchardStore((state) => state.config);

    // Charger la config précédente au montage
    useEffect(() => {
        if (reviewData?.id && config) {
            loadConfig(reviewData.id, selectedTemplate, format).then(savedConfig => {
                if (savedConfig) {
                    // Appliquer la config sauvegardée
                    useOrchardStore.setState({ config: { ...config, ...savedConfig } });
                    console.log('Loaded saved export config');
                }
            });
        }
    }, [reviewData?.id, selectedTemplate, format, loadConfig]);

    // Sauvegarder après chaque changement de config
    useEffect(() => {
        if (!reviewData?.id) return;

        // Debounce pour éviter trop de saves
        const timeout = setTimeout(() => {
            saveConfig(reviewData.id, selectedTemplate, format, config);
        }, 800);

        return () => clearTimeout(timeout);
    }, [config, selectedTemplate, format, reviewData?.id, saveConfig]);

    // ... rest of component
}
```

---

## ÉTAPE 4: RECONSTRUIRE PhenoHuntPage.jsx (1.5h)

### 4.1 Remplacer `client/src/pages/public/PhenoHuntPage.jsx`

```javascript
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReactFlowProvider } from 'reactflow';
import useGeneticsStore from '../../store/useGeneticsStore';
import UnifiedGeneticsCanvas from '../../components/genetics/UnifiedGeneticsCanvas';
import { Plus, Settings, Home, Leaf, FolderOpen, ChevronDown, ChevronRight, GitBranch, Save, X, Download } from 'lucide-react';
import LiquidGlass from '../../components/ui/LiquidGlass';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * PhenoHuntPage - Module Genetics/Genealogy Tree
 * 
 * Permet aux producteurs de:
 * - Créer des arbres généalogiques de cultivars
 * - Ajouter cultivars parents/enfants
 * - Éditer propriétés génétiques
 * - Exporter l'arbre en image
 * - Intégrer dans les exports de reviews
 */
export default function PhenoHuntPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const store = useGeneticsStore();

    // State
    const [cultivarLibrary, setCultivarLibrary] = useState([]);
    const [librarySearch, setLibrarySearch] = useState('');
    const [showNewTreeModal, setShowNewTreeModal] = useState(false);
    const [newTreeName, setNewTreeName] = useState('');
    const [newTreeDesc, setNewTreeDesc] = useState('');
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [showEditNodeModal, setShowEditNodeModal] = useState(false);
    const [editingNode, setEditingNode] = useState(null);
    const [exportingAsImage, setExportingAsImage] = useState(false);

    // Charger arbres et cultivars au montage
    useEffect(() => {
        store.fetchTrees();

        const loadCultivars = async () => {
            try {
                const response = await fetch('/api/cultivars', { credentials: 'include' });
                if (response.ok) {
                    const cultivars = await response.json();
                    setCultivarLibrary(Array.isArray(cultivars) ? cultivars : []);
                }
            } catch (error) {
                console.error('Error loading cultivars:', error);
            }
        };
        loadCultivars();
    }, []);

    // Auto-load tree from ?tree= param
    useEffect(() => {
        const treeId = searchParams.get('tree');
        if (treeId && treeId !== store.selectedTreeId) {
            store.loadTree(treeId);
        }
    }, [searchParams, store.selectedTreeId]);

    // Filtrer cultivars par recherche
    const filteredCultivars = useMemo(() => {
        if (!librarySearch) return cultivarLibrary;
        return cultivarLibrary.filter(c =>
            (c.name || '').toLowerCase().includes(librarySearch.toLowerCase()) ||
            (c.breeder || '').toLowerCase().includes(librarySearch.toLowerCase())
        );
    }, [cultivarLibrary, librarySearch]);

    // Handlers
    const handleSelectTree = async (treeId) => {
        if (treeId) {
            await store.loadTree(treeId);
        }
    };

    const handleCreateNewTree = async () => {
        if (!newTreeName.trim()) {
            alert("Veuillez entrer un nom pour l'arbre");
            return;
        }

        const result = await store.createTree({
            name: newTreeName,
            description: newTreeDesc,
            projectType: 'phenohunt'
        });

        if (result?.data) {
            setNewTreeName('');
            setNewTreeDesc('');
            setShowNewTreeModal(false);
            await store.loadTree(result.data.id);
        } else if (result?.error) {
            alert(`Erreur: ${result.error}`);
        }
    };

    const toggleGroup = (groupName) => {
        const next = new Set(expandedGroups);
        next.has(groupName) ? next.delete(groupName) : next.add(groupName);
        setExpandedGroups(next);
    };

    const handleDeleteTree = async (treeId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet arbre?')) return;

        const result = await store.deleteTree(treeId);
        if (result?.data) {
            if (store.selectedTreeId === treeId) {
                // Sélectionner le premier arbre restant ou désélectionner
                if (store.trees.length > 0) {
                    await store.loadTree(store.trees[0].id);
                } else {
                    store.setState({ selectedTreeId: null, nodes: [], edges: [] });
                }
            }
        }
    };

    const handleExportAsImage = async () => {
        if (!store.selectedTreeId) return;

        setExportingAsImage(true);
        try {
            // Utiliser la fonction d'export du canvas
            const canvas = document.querySelector('[data-phenohunt-export]');
            if (canvas) {
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = `phenohunt-${store.selectedTreeId}-${Date.now()}.png`;
                link.click();
            }
        } catch (error) {
            console.error('Error exporting tree:', error);
            alert('Erreur lors de l\'export de l\'arbre');
        } finally {
            setExportingAsImage(false);
        }
    };

    // Grouper cultivars par type
    const groupedCultivars = useMemo(() => {
        const groups = {};
        filteredCultivars.forEach(c => {
            const type = c.type || 'Autre';
            if (!groups[type]) groups[type] = [];
            groups[type].push(c);
        });
        return groups;
    }, [filteredCultivars]);

    const trees = store.trees || [];
    const selectedTree = trees.find(t => t.id === store.selectedTreeId);
    const isLoading = store.treeLoading || store.canvasLoading;
    const hasError = store.treeError;

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* SIDEBAR - Bibliothèque et arborescence */}
            <motion.div
                className="bg-slate-800/80 backdrop-blur border-r border-slate-700/50 flex flex-col overflow-hidden"
                animate={{ width: sidebarExpanded ? 280 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: sidebarExpanded ? '280px' : '0px' }}
            >
                <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            <GitBranch size={16} /> Arbres
                        </h2>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowNewTreeModal(true)}
                            className="p-1 hover:bg-slate-700 rounded text-amber-400"
                            title="Créer un nouvel arbre"
                        >
                            <Plus size={16} />
                        </motion.button>
                    </div>

                    {/* Liste des arbres */}
                    <div className="space-y-2">
                        {trees.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Aucun arbre. Créez-en un!</p>
                        ) : (
                            trees.map(tree => (
                                <motion.div
                                    key={tree.id}
                                    whileHover={{ x: 4 }}
                                    className={`p-2 rounded cursor-pointer transition ${
                                        store.selectedTreeId === tree.id
                                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                                            : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                                    }`}
                                    onClick={() => handleSelectTree(tree.id)}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        if (window.confirm('Supprimer cet arbre?')) {
                                            handleDeleteTree(tree.id);
                                        }
                                    }}
                                >
                                    <p className="text-xs font-medium truncate">{tree.name}</p>
                                    <p className="text-xs opacity-60 truncate">{tree.projectType}</p>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Bibliothèque de cultivars */}
                {selectedTree && (
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Chercher cultivar..."
                                value={librarySearch}
                                onChange={(e) => setLibrarySearch(e.target.value)}
                                className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-sm text-white placeholder-slate-500"
                            />
                        </div>

                        <p className="text-xs font-bold text-slate-300 mb-2">Cultivars ({filteredCultivars.length})</p>

                        {Object.entries(groupedCultivars).map(([type, cultivars]) => (
                            <div key={type} className="mb-3">
                                <button
                                    onClick={() => toggleGroup(type)}
                                    className="flex items-center gap-1 text-xs font-semi bold text-slate-300 hover:text-amber-400 w-full"
                                >
                                    {expandedGroups.has(type) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                    {type} ({cultivars.length})
                                </button>

                                {expandedGroups.has(type) && (
                                    <div className="ml-2 mt-1 space-y-1">
                                        {cultivars.map(cultivar => (
                                            <div
                                                key={cultivar.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('cultivar', JSON.stringify(cultivar));
                                                }}
                                                className="p-1.5 bg-slate-700/30 hover:bg-slate-600/50 rounded text-xs cursor-move text-slate-300 hover:text-amber-400"
                                            >
                                                <p className="font-medium truncate">{cultivar.name}</p>
                                                <p className="text-xs opacity-60">{cultivar.breeder}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* CANVAS PRINCIPAL */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-slate-800/50 border-b border-slate-700/50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSidebarExpanded(!sidebarExpanded)}
                            className="p-2 hover:bg-slate-700 rounded text-slate-300"
                        >
                            <FolderOpen size={20} />
                        </motion.button>

                        <div>
                            {selectedTree ? (
                                <>
                                    <h1 className="text-lg font-bold text-white">{selectedTree.name}</h1>
                                    <p className="text-sm text-slate-400">{selectedTree.description || 'Sans description'}</p>
                                </>
                            ) : (
                                <p className="text-slate-400">Sélectionnez un arbre pour commencer</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedTree && (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={handleExportAsImage}
                                    disabled={isLoading}
                                    className="px-3 py-2 bg-emerald-600/80 hover:bg-emerald-500 rounded text-white text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Download size={16} />
                                    Exporter
                                </motion.button>
                            </>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/account')}
                            className="p-2 hover:bg-slate-700 rounded text-slate-300"
                        >
                            <Home size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative overflow-hidden bg-slate-900/50">
                    {!selectedTree ? (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <Leaf size={48} className="mb-4 opacity-50" />
                            <p className="text-lg">Aucun arbre sélectionné</p>
                            <p className="text-sm opacity-75 mt-2">Créez ou sélectionnez un arbre pour commencer</p>
                        </div>
                    ) : isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-2"></div>
                                <p className="text-slate-400">Chargement...</p>
                            </div>
                        </div>
                    ) : hasError ? (
                        <div className="w-full h-full flex items-center justify-center text-red-400">
                            <div className="text-center">
                                <p className="font-bold">Erreur</p>
                                <p className="text-sm">{hasError}</p>
                            </div>
                        </div>
                    ) : (
                        <ReactFlowProvider>
                            <div data-phenohunt-export>
                                <UnifiedGeneticsCanvas
                                    nodes={store.nodes}
                                    edges={store.edges}
                                    tree={selectedTree}
                                    cultivarLibrary={cultivarLibrary}
                                    onNodeChange={store.updateNode}
                                    onEdgeChange={store.updateEdge}
                                    onNodesChange={(changes) => store.handleNodesChange?.(changes)}
                                    onEdgesChange={(changes) => store.handleEdgesChange?.(changes)}
                                    onConnect={store.createEdge}
                                />
                            </div>
                        </ReactFlowProvider>
                    )}
                </div>
            </div>

            {/* MODAL - Créer nouvel arbre */}
            <AnimatePresence>
                {showNewTreeModal && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                        onClick={() => setShowNewTreeModal(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-slate-800 rounded-lg p-6 w-96 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                        >
                            <h2 className="text-xl font-bold text-white mb-4">Créer un nouvel arbre</h2>

                            <input
                                type="text"
                                placeholder="Nom de l'arbre"
                                value={newTreeName}
                                onChange={(e) => setNewTreeName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-500 mb-3"
                            />

                            <textarea
                                placeholder="Description (optionnel)"
                                value={newTreeDesc}
                                onChange={(e) => setNewTreeDesc(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded text-white placeholder-slate-500 mb-4 h-20"
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={handleCreateNewTree}
                                    className="flex-1 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition"
                                >
                                    <Plus size={16} className="inline mr-2" />
                                    Créer
                                </button>
                                <button
                                    onClick={() => setShowNewTreeModal(false)}
                                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
```

---

## ÉTAPE 5: FIXER ONGLETS CONFIG EXPORT MAKER (45min)

### 5.1 Modifier `ExportMaker.jsx` - Section des onglets

Chercher la ligne où `sidebarTab` est déclaré et remplacer le rendu:

```javascript
return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-900 rounded-xl w-5/6 h-5/6 max-w-7xl flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                <h2 className="text-xl font-bold text-white">Export Maker - {productType}</h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded">
                    <X size={20} className="text-slate-300" />
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR - ONGLETS */}
                <div className="w-72 border-r border-slate-700 bg-slate-800/30 flex flex-col">
                    <div className="space-y-2 p-4">
                        {/* Onglet Templates */}
                        <motion.button
                            onClick={() => setSidebarTab('template')}
                            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                                sidebarTab === 'template'
                                    ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                                    : 'text-slate-300 hover:bg-slate-700/30'
                            }`}
                            whileHover={{ x: 4 }}
                        >
                            <Layout size={18} />
                            <span className="font-medium">Templates</span>
                        </motion.button>

                        {/* Onglet Contenu */}
                        <motion.button
                            onClick={() => setSidebarTab('contenu')}
                            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                                sidebarTab === 'contenu'
                                    ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                                    : 'text-slate-300 hover:bg-slate-700/30'
                            }`}
                            whileHover={{ x: 4 }}
                        >
                            <Grid size={18} />
                            <span className="font-medium">Contenu</span>
                        </motion.button>

                        {/* Onglet Apparence */}
                        <motion.button
                            onClick={() => setSidebarTab('apparence')}
                            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                                sidebarTab === 'apparence'
                                    ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                                    : 'text-slate-300 hover:bg-slate-700/30'
                            }`}
                            whileHover={{ x: 4 }}
                        >
                            <Palette size={18} />
                            <span className="font-medium">Apparence</span>
                        </motion.button>

                        {/* Onglet Préréglages */}
                        <motion.button
                            onClick={() => setSidebarTab('prereglages')}
                            className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                                sidebarTab === 'prereglages'
                                    ? 'bg-amber-600/20 border border-amber-500/30 text-amber-400'
                                    : 'text-slate-300 hover:bg-slate-700/30'
                            }`}
                            whileHover={{ x: 4 }}
                        >
                            <Save size={18} />
                            <span className="font-medium">Préréglages</span>
                        </motion.button>
                    </div>
                </div>

                {/* CONTENT PANE - Contenu dynamique */}
                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {sidebarTab === 'template' && (
                            <motion.div
                                key="template"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Sélectionner un template</h3>
                                <TemplateSelector />
                            </motion.div>
                        )}

                        {sidebarTab === 'contenu' && (
                            <motion.div
                                key="contenu"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Configurer le contenu</h3>
                                <ContentModuleControls />
                            </motion.div>
                        )}

                        {sidebarTab === 'apparence' && (
                            <motion.div
                                key="apparence"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Personnaliser l'apparence</h3>
                                <div className="space-y-6">
                                    <ColorPaletteControls />
                                    <TypographyControls />
                                    <ImageBrandingControls />
                                </div>
                            </motion.div>
                        )}

                        {sidebarTab === 'prereglages' && (
                            <motion.div
                                key="prereglages"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <h3 className="text-lg font-bold text-white mb-4">Gérer vos préréglages</h3>
                                <PresetManager />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* PREVIEW PANE */}
                <div className="w-1/3 border-l border-slate-700 bg-slate-800/20 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-700">
                        <p className="text-sm font-medium text-slate-300">Aperçu</p>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {pagesEnabled ? <PagedPreviewPane /> : <PreviewPane />}
                    </div>
                </div>
            </div>

            {/* FOOTER - Actions */}
            <div className="border-t border-slate-700 bg-slate-800/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label className="text-sm text-slate-300 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={pagesEnabled}
                            onChange={(e) => setMultiPageMode(e.target.checked)}
                            className="w-4 h-4"
                        />
                        Mode pages
                    </label>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-medium transition disabled:opacity-50 flex items-center gap-2"
                    >
                        <Download size={16} />
                        {exporting ? 'Export...' : 'Exporter'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
```

### 5.2 S'assurer que les contrôles appellent updateConfig()

Vérifier que dans chaque contrôle (ColorPaletteControls, etc.), les onChange handlers appellent:

```javascript
// Dans chaque composant de control:
const updateOrchardConfig = useOrchardStore((s) => s.updateConfig); // Si elle existe
// Ou directement
import useOrchardStore from '../../store/orchardStore';

const handleColorChange = (newColor) => {
    useOrchardStore.setState(state => ({
        config: {
            ...state.config,
            colors: { ...state.config.colors, ...newColor }
        }
    }));
    // Force preview refresh
    setPreviewRefreshKey(prev => prev + 1);
};
```

---

## ÉTAPE 6: AJOUTER EXPORT BUTTON HANDLER (30min)

### 6.1 Modifier `handleExport()` dans ExportMaker.jsx

```javascript
const handleExport = async () => {
    if (!reviewData?.id) {
        alert('Erreur: ID de review manquant');
        return;
    }

    setExporting(true);

    try {
        // ÉTAPE 1: Sauvegarder la configuration en BD
        console.log('📊 Saving export config to backend...');
        const saveResult = await saveConfig(
            reviewData.id,
            selectedTemplate,
            format,
            config
        );

        if (!saveResult) {
            console.warn('Config save returned null, but continuing with export');
        }

        // ÉTAPE 2: Générer le fichier d'export
        console.log(`📸 Generating ${format} ${selectedTemplate} export...`);
        let blob;

        const exportOptions = {
            quality: highQuality ? 1.5 : 1.0,
            scale: highQuality ? 2 : 1
        };

        if (format === 'PDF') {
            blob = await exportToPdf(previewAreaRef.current, { ...exportOptions, filename: reviewName });
        } else if (format === 'SVG') {
            blob = await exportToSvg(previewAreaRef.current, { ...exportOptions, filename: reviewName });
        } else if (format === 'JPEG') {
            blob = await exportToJpeg(previewAreaRef.current, { ...exportOptions, filename: reviewName });
        } else {
            // Default: PNG
            blob = await exportToPng(previewAreaRef.current, { ...exportOptions, filename: reviewName });
        }

        // ÉTAPE 3: Tracer l'export dans les statistiques
        console.log('📈 Tracking export...');
        await fetch('/api/stats/exports/track', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewId: reviewData.id,
                format: format.toUpperCase(),
                size: blob.size,
                template: selectedTemplate,
                quality: highQuality ? 'high' : 'standard'
            })
        }).catch(e => console.warn('Failed to track export:', e));

        // ÉTAPE 4: Télécharger le fichier
        console.log('💾 Downloading file...');
        downloadBlob(blob, `${reviewName}-${selectedTemplate}-${format.toLowerCase()}.${
            format === 'PDF' ? 'pdf'
            : format === 'SVG' ? 'svg'
            : format === 'JPEG' ? 'jpg'
            : 'png'
        }`);

        console.log('✅ Export completed successfully');
        setExporting(false);
        // Optionnel: fermer le modal après export
        // onClose();

    } catch (error) {
        console.error('❌ Export failed:', error);
        alert(`Erreur lors de l'export: ${error.message}`);
        setExporting(false);
    }
};
```

---

## ✅ CHECKLIST DE VALIDATION

Après implémentation, tester:

- [ ] **Database**: Migration Prisma appliquée, table ExportConfiguration existe
- [ ] **Backend API**: 
  - [ ] POST /api/export/config/save fonctionne 
  - [ ] GET /api/export/config/:reviewId retourne la config
  - [ ] DELETE /api/export/config/:id supprime la config
- [ ] **Frontend - Export Save**:
  - [ ] Créer review → Open Export Maker
  - [ ] Changer template/format/couleurs → config sauvegardée
  - [ ] Refresh page → config persiste
- [ ] **Frontend - PhenoHunt**:
  - [ ] Page charge avec sidebar + canvas
  - [ ] Créer arbre fonctionne
  - [ ] Cultiva library appear ts dans le sidebar
  - [ ] Drag-drop cultivars dans le canvas fonctionne
  - [ ] Export tree en image fonctionne
- [ ] **Frontend - Export Maker**:
  - [ ] Onglets Template/Contenu/Apparence/Préréglages switchent correctement
  - [ ] Changer couleur → preview rafraîchit
  - [ ] Toggler module → preview rafraîchit
  - [ ] Bouton exporter sauvegarde + génère + track
  - [ ] Fichier téléchargé correctement

---

## 🚀 DÉPLOIEMENT

Une fois tout testé:

```bash
# 1. Commit les changes
cd /path/to/Reviews-Maker
git add -A
git commit -m "feat: fix ExportMaker DB save, PhenoHunt rebuild, tab switching, pipeline rendering"

# 2. Push vers VPS
git push origin main

# 3. Sur le VPS
ssh vps-lafoncedalle
cd ~/Reviews-Maker

# 4. Deploy backend
npm run prisma:migrate
pm2 restart reviews-maker

# 5. Deploy frontend
npm run build --prefix client
# Nginx serving automatic

# 6. Vérifier
pm2 logs reviews-maker

# 7. Test en production
# Ouvrir https://reviews-maker.terpologie.com
```
