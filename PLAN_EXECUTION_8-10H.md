# 📋 PLAN EXÉCUTION CRITIQUE - 8-10 HEURES
**Date**: 2 avril 2026  
**Statut**: Chef de projet DÉTAILLÉ  
**Objectif**: Fixer les 5 problèmes critiques du Reviews-Maker  
**Durée totale**: 7h 50min - 10h 10min  

---

## 🎯 CONTEXTE & PRIORITÉS

### Problèmes à Résoudre (par ordre critique)
1. ❌ **PhenoHunt = État 0** (UI complètement cassée) → PRIORITY #1
2. ❌ **Images/Analytics non sauvegardées** (pas de persistance DB export configs) → PRIORITY #2
3. ❌ **ExportMaker onglets non fonctionnels** (tabSwitching broken) → PRIORITY #3
4. ❌ **Export Maker rendus incomplets** (pipelines/genetics/analytics manquants) → PRIORITY #4
5. ❌ **Bouton exporter ne configure pas** (missing config save endpoints) → PRIORITY #5

### Dépendances Critiques
- **PHASE 1** (PhenoHunt) → Nécessaire avant PHASE 3 (layouts avec genetics)
- **PHASE 2** (Database) → Doit être fait avant PHASE 3 (save config)
- **PHASE 3** (Frontend) → Dépend de PHASE 1 & PHASE 2 complétées
- **PHASE 4** (Export Polish) → Dépend de PHASE 3 achevée
- **PHASE 5** (Pipeline Rendering) → Peut commencer en parallèle avec PHASE 4

---

## ⏱️ CALENDRIER EXÉCUTION

```
00:00 - 00:10  → PHASE 0: Setup (10min)
00:10 - 02:40  → PHASE 1: PhenoHunt Rebuild (2h 30min)
02:40 - 04:10  → PHASE 2: Database + API (1h 30min)
04:10 - 05:50  → PHASE 3: Frontend Integration (1h 40min)
05:50 - 07:20  → PHASE 4: Export Maker Polish (1h 30min)
07:20 - 08:50  → PHASE 5: Pipeline Rendering (1h 30min)
08:50 - 09:45  → PHASE 6: Testing + Validation (55min)
09:45 - 10:10  → PHASE 7: Deploy (25min)
```

---

# PHASE 0: SETUP (10 min)
**Durée**: 5-10 min  
**Prérequis**: Backend + Frontend accessibles en local

## 🎯 Tâches

### TÂCHE 0.1: Brancher et Pull
```bash
# Terminal 1 - Backend
cd server-new
git pull origin main
npm install  # Si packages.lock changé
npm run check-env

# Terminal 2 - Frontend
cd client
git pull origin main
npm install  # Si packages.lock changé
npm run dev  # Lance le dev server

# Terminal 3 - Vérification
npm run prisma:studio  # DB inspection optionnel
```

**✅ Checkpoint**: 
- `npm run dev` tourne sans erreur sur les 2 terminals
- `localhost:5173` accessible
- `localhost:3000` accessible (ou votre port backend)

### TÂCHE 0.2: Branch de travail
```bash
git checkout main
git pull origin main
git checkout -b fix/critic-bugs-phenohunt-export

# Commit initial (vide)
git commit --allow-empty -m "INIT: Critical bugs fix - PhenoHunt + ExportConfig"
```

### TÂCHE 0.3: Documenter l'état pré-fix
```bash
# Vérifier que les problèmes existent toujours
curl http://localhost:3000/api/export/templates
# Doit montrer tous les templates disponibles

# Vérifier que PhenoHunt est broken
open http://localhost:5173/#/phenohunt
# Doit montrer sidebar vide ou canvas vide
```

**✅ Checkpoint**: 
- Branche créée et switchée
- Backend + Frontend en local
- Tous les 5 problèmes confirmés comme présents

---

# PHASE 1: PHENOHUNT REBUILD (2h 30 min) - PRIORITY #1
**Durée**: 2h - 2h 30min  
**Dépendances**: Setup PHASE 0 complété  
**Fichier principal**: `client/src/pages/public/PhenoHuntPage.jsx`

## 🎯 Objectif
Reconstruire complètement PhenoHuntPage avec React Flow + Canvas + Sidebar opérationnels

## 📂 Fichiers à Modifier
```
client/src/pages/public/
├── PhenoHuntPage.jsx                 [REWRITE 80%]
├── PhenoHuntPage.css                 [CREATE]

client/src/components/genetics/
├── UnifiedGeneticsCanvas.jsx         [CHECK - should work]
├── CultivarNode.jsx                  [CHECK - should exist]
├── NodeContextMenu.jsx               [CHECK - should exist]
├── NodeFormModal.jsx                 [CHECK - should exist]
└── EdgeFormModal.jsx                 [CHECK - should exist]
```

---

## TÂCHE 1.1: Vérifier structures existantes (10 min)

### Étape 1.1.1: Vérifier que React Flow est bien importé
```bash
grep -r "ReactFlow\|useReactFlow" client/src/components/genetics/
```

**Résultat attendu**: Voir UnifiedGeneticsCanvas.jsx avec imports React Flow

### Étape 1.1.2: Vérifier la dépendance react-flow-renderer
```bash
grep "reactflow" client/package.json
```

**Résultat attendu**: 
```json
"reactflow": "^11.11.0"  // ou version plus récente
```

**Si absent**: Ajouter immédiatement
```bash
npm install reactflow
```

### Étape 1.1.3: Vérifier useGeneticsStore
```bash
grep -A 20 "export default function\|export const useGeneticsStore" client/src/store/useGeneticsStore.js | head -30
```

**Résultat attendu**: Store avec méthodes: `fetchTrees()`, `loadTree()`, `createTree()`, `deleteNode()`, `updateNode()`, `addEdge()`

**✅ Checkpoint**: Tous les composants dependency existent

---

## TÂCHE 1.2: Reconstruire PhenoHuntPage.jsx (90 min)

### Étape 1.2.1: Sauvegarder l'ancienne version (0 min)
```bash
cp client/src/pages/public/PhenoHuntPage.jsx client/src/pages/public/PhenoHuntPage.jsx.backup
```

### Étape 1.2.2: Vérifier la structure actuelle
Lire les 200 premières lignes de PhenoHuntPage.jsx:
- Voir si ReactFlowProvider est importé
- Voir si UnifiedGeneticsCanvas est appelé
- Voir si le rendu du canvas existe

**État actuel (confirmé)**:
- ✅ `ReactFlowProvider` importé
- ❌ `<UnifiedGeneticsCanvas />` jamais appelé dans le rendu
- ❌ Sidebar affichée mais pas de drag-drop cultivars
- ❌ Canvas vide ou non rendu

### Étape 1.2.3: Remplacer le corps du fichier PhenoHuntPage.jsx

**REPLACE**: Remplacer tout le JSX de retour du composant

**Ancien code** (à partir de `return (`) jusqu'à `</div>` final):

```javascript
// ================== ANCIEN CODE À REMPLACER ==================
// (Voir le fichier actuel - c'est une page avec header + expand buttons + sidebar vide)
// Le dernier return () est le JSX à remplacer entièrement
```

**Nouveau code** (copier-coller exact):

```jsx
// FILE: client/src/pages/public/PhenoHuntPage.jsx
// Remplacer la section RETURN complètement

    const isLoading = store.treeLoading && store.trees.length === 0;
    const selectedTreeName = store.trees.find(t => t.id === store.selectedTreeId)?.name;

    return (
        <ReactFlowProvider>
            <div className="h-screen bg-slate-950 flex flex-col">
                {/* HEADER */}
                <header className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-emerald-500/20 px-6 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                            title="Retour"
                        >
                            <Home className="w-5 h-5" />
                        </button>
                        <h1 className="text-2xl font-bold text-white">🌿 PhenoHunt</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowNewTreeModal(true)}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-lg"
                        >
                            <Plus className="w-4 h-4" />
                            Nouvel arbre
                        </button>

                        <div className="w-px h-6 bg-slate-600" />

                        {store.trees.length > 0 && (
                            <select
                                value={store.selectedTreeId || ''}
                                onChange={(e) => handleSelectTree(e.target.value)}
                                className="px-3 py-1.5 bg-slate-800 border border-slate-600 text-white text-sm rounded-lg focus:outline-none focus:border-emerald-400"
                            >
                                <option value="">Choisir un arbre...</option>
                                {store.trees.map(tree => (
                                    <option key={tree.id} value={tree.id}>
                                        {tree.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <button
                            className="p-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
                            title="Paramètres"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* MAIN LAYOUT: Sidebar + Canvas */}
                <div className="flex-1 flex overflow-hidden">
                    {/* SIDEBAR LEFT - Cultivar Library */}
                    <aside className="w-80 bg-slate-900 border-r border-slate-700 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            {/* Cultivar Library Section */}
                            <div>
                                <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                    <FolderOpen className="w-4 h-4" />
                                    Bibliothèque
                                </h2>
                                {cultivarLibrary.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">
                                        Aucun cultivar disponible. Créez-en d'abord.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-2">
                                        {cultivarLibrary.map(cultivar => (
                                            <div
                                                key={cultivar.id}
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.effectAllowed = 'copy';
                                                    e.dataTransfer.setData('application/cultivar', JSON.stringify({
                                                        id: cultivar.id,
                                                        name: cultivar.name,
                                                        genetics: cultivar.genetics,
                                                        group: cultivar.group
                                                    }));
                                                }}
                                                className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded cursor-grab active:cursor-grabbing text-xs text-slate-200 transition-colors"
                                                title={`Drag ${cultivar.name} to canvas`}
                                            >
                                                🌱 {cultivar.name}
                                                {cultivar.genetics && <span className="text-slate-400 block text-xs">{cultivar.genetics}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-slate-600" />

                            {/* Trees Section */}
                            <div>
                                <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" />
                                    Mes Arbres
                                </h2>
                                {store.trees.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">
                                        Aucun arbre. Créez-en un nouveau.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {store.trees.map(tree => (
                                            <button
                                                key={tree.id}
                                                onClick={() => handleSelectTree(tree.id)}
                                                className={`w-full text-left p-2 rounded text-xs transition-colors ${
                                                    store.selectedTreeId === tree.id
                                                        ? 'bg-emerald-600/30 border border-emerald-500 text-white'
                                                        : 'bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700'
                                                }`}
                                            >
                                                <div className="font-medium">{tree.name}</div>
                                                {tree.description && (
                                                    <div className="text-slate-400 line-clamp-2">{tree.description}</div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Grouped Cultivars Section (optionnel) */}
                            {Object.keys(groupedCultivars).length > 0 && (
                                <>
                                    <div className="h-px bg-slate-600" />
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                            <Leaf className="w-4 h-4" />
                                            Par Catégorie
                                        </h2>
                                        <div className="space-y-2">
                                            {Object.entries(groupedCultivars).map(([groupName, cultivars]) => (
                                                <div key={groupName}>
                                                    <button
                                                        onClick={() => toggleGroup(groupName)}
                                                        className="w-full text-left p-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded flex items-center justify-between text-xs text-slate-300 transition-colors"
                                                    >
                                                        <span className="font-medium">{groupName}</span>
                                                        {expandedGroups.has(groupName) ? (
                                                            <ChevronDown className="w-3 h-3" />
                                                        ) : (
                                                            <ChevronRight className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                    {expandedGroups.has(groupName) && (
                                                        <div className="mt-1 space-y-1 ml-2">
                                                            {cultivars.map(c => (
                                                                <div
                                                                    key={c.id}
                                                                    draggable
                                                                    onDragStart={(e) => {
                                                                        e.dataTransfer.effectAllowed = 'copy';
                                                                        e.dataTransfer.setData('application/cultivar', JSON.stringify(c));
                                                                    }}
                                                                    className="p-1.5 bg-slate-750 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 cursor-grab active:cursor-grabbing"
                                                                >
                                                                    {c.name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>

                    {/* CANVAS CENTER */}
                    <main className="flex-1 bg-slate-950 relative">
                        {isLoading ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <p className="text-slate-400">Chargement des arbres...</p>
                            </div>
                        ) : store.selectedTreeId ? (
                            <UnifiedGeneticsCanvas 
                                treeId={store.selectedTreeId}
                                readOnly={false}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                <GitBranch className="w-12 h-12 opacity-50" />
                                <p className="text-center max-w-xs">
                                    Sélectionnez ou créez un arbre généalogique pour commencer à mapper vos cultivars
                                </p>
                            </div>
                        )}
                    </main>
                </div>

                {/* NEW TREE MODAL */}
                {showNewTreeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-96 shadow-2xl">
                            <h2 className="text-lg font-bold text-white mb-4">Créer un nouvel arbre</h2>
                            <input
                                type="text"
                                placeholder="Nom de l'arbre (ex: Pheno Hunt 2026)"
                                value={newTreeName}
                                onChange={(e) => setNewTreeName(e.target.value)}
                                className="w-full px-3 py-2 mb-3 bg-slate-800 border border-slate-600 text-white rounded focus:outline-none focus:border-emerald-400"
                            />
                            <textarea
                                placeholder="Description (optionnel)"
                                value={newTreeDesc}
                                onChange={(e) => setNewTreeDesc(e.target.value)}
                                className="w-full px-3 py-2 mb-4 bg-slate-800 border border-slate-600 text-white rounded focus:outline-none focus:border-emerald-400 text-sm"
                                rows={3}
                            />
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowNewTreeModal(false);
                                        setNewTreeName('');
                                        setNewTreeDesc('');
                                    }}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleCreateNewTree}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors font-medium"
                                >
                                    Créer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ReactFlowProvider>
    );
};

export default PhenoHuntPage;
```

**⚙️ Substitution exacte**:
```
FILE: client/src/pages/public/PhenoHuntPage.jsx
FIND: const isLoading = store.treeLoading && store.trees.length === 0;
      const selectedTreeName = store.trees.find(t => t.id === store.selectedTreeId)?.name;

      return (
      ...
```

REPLACE avec le code ci-dessus, EXACTEMENT du `const isLoading` jusqu'au final `export default PhenoHuntPage;`

### Étape 1.2.4: Vérifier les imports du fichier

**Ajouter en haut du fichier si absent**:
```javascript
import { ReactFlowProvider } from 'reactflow';
import UnifiedGeneticsCanvas from '../../components/genetics/UnifiedGeneticsCanvas';
```

**S'assurer que existent**:
```javascript
import { Plus, Settings, Home, Leaf, FolderOpen, ChevronDown, ChevronRight, GitBranch } from 'lucide-react';
```

**✅ Checkpoint**: 
- PhenoHuntPage.jsx compilé sans erreurs
- Browser ouvre `localhost:5173/#/phenohunt` sans crashes

---

## TÂCHE 1.3: Créer CSS du PhenoHunt (20 min - optionnel)

**Créer fichier**: `client/src/pages/public/PhenoHuntPage.css`

```css
/* FILE: client/src/pages/public/PhenoHuntPage.css */
/* Styles personnalisés pour PhenoHunt si nécessaire */

/* Override React Flow styles if needed */
.react-flow {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.react-flow__background pattern {
    fill: #334155;
}

.react-flow__background {
    background-color: #0f172a;
}

/* Cultivar nodes styling */
.react-flow__node-cultivar {
    background: linear-gradient(135deg, #FF6B9D 0%, #FF8A5B 100%);
    border: 2px solid #334155;
    border-radius: 12px;
    padding: 10px;
    min-width: 100px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-weight: 600;
    color: white;
}

.react-flow__node-cultivar.selected {
    border-color: #fbbf24;
    box-shadow: 0 0 0 2px #fbbf24;
}

/* Edge styling */
.react-flow__edge path {
    stroke: #64748b;
    stroke-width: 2;
}

.react-flow__edge.selected path {
    stroke: #ec4899;
    stroke-width: 3;
}

/* Controls styling */
.react-flow__controls {
    background-color: rgba(15, 23, 42, 0.8);
    border-radius: 8px;
}

.react-flow__controls button {
    background-color: #334155;
    color: #e2e8f0;
    border: 1px solid #475569;
}

.react-flow__controls button:hover {
    background-color: #475569;
}
```

**✅ Checkpoint**: 
- Fichier créé (optionnel mais recommandé)

---

## TÂCHE 1.4: Vérifier le fonctionnement  (30 min)

### Étape 1.4.1: Frontend test
```bash
# Terminal frontend
cd client
npm run dev
# Naviguer à http://localhost:5173/#/phenohunt
```

### Étape 1.4.2: Vérifications (checklist)

**✅ À vérifier dans le browser**:
1. [ ] Page affiche le header avec titre "🌿 PhenoHunt" 
2. [ ] Bouton "+ Nouvel arbre" clickable
3. [ ] Sidebar gauche affiche "Bibliothèque" (vide si pas de cultivars)
4. [ ] Sidebar affiche "Mes Arbres" (vide ou liste si arbres existants)
5. [ ] Canvas central affiche:
   - Soit message "Sélectionnez ou créez un arbre..."
   - Soit React Flow canvas vide si arbre chargé
6. [ ] Cliquer "+ Nouvel arbre" ouvre modal
7. [ ] Modal: saisir nom et créer → devrait charger le nouvel arbre
8. [ ] Canvas: essayer drag-drop d'un cultivar depuis sidebar → devrait créer un node
9. [ ] Canvas: right-click sur node → devrait afficher context menu
10. [ ] Canvas: clic sur node → should select (border change)

### Étape 1.4.3: Console browser check
```javascript
// Dans console browser (F12):
console.log(window?.useGeneticsStore?.getState?.());
// Doit montrer l'état du store avec trees, nodes, edges, etc.
```

**Erreur commune**: "Cannot read property 'fetchTrees' of undefined"
- Vérifier que useGeneticsStore est importé correctement
- Vérifier que le backend `/api/genetics` répond

### Étape 1.4.4: Backend API vérification (5 min)
```bash
# Terminal backend/API test
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/genetics/trees
# Doit retourner un array JSON avec les arbres

# Si authentification nécessaire, utiliser l'endpoint public
curl http://localhost:3000/api/cultivars
# Doit retourner un array JSON avec les cultivars
```

**✅ Checkpoint FINAL PHASE 1**:
- ✅ PhenoHuntPage.jsx compile et rendu sans crash
- ✅ Sidebar + Canvas affichés
- ✅ Drag-drop cultivars → nodes créés
- ✅ Context menu → node édition
- ✅ React Flow canvas responsive
- ✅ Pas d'erreurs console (warnings acceptés)

**Commit**:
```bash
git add client/src/pages/public/PhenoHuntPage.jsx client/src/pages/public/PhenoHuntPage.css
git commit -m "PHASE 1: PhenoHunt UI rebuild - ReactFlow canvas + sidebar + drag-drop functional"
```

---

# PHASE 2: DATABASE + API (1h 30 min)
**Durée**: 1h - 1h 30min  
**Dépendances**: PHASE 1 ✅  
**Objectif**: Ajouter persistance DB pour ExportConfiguration + routes API save/load/delete

## 📂 Fichiers à Modifier

```
server-new/prisma/
├── schema.prisma                     [MODIFY - Add ExportConfiguration table]
└── migrations/
    └── [YYYYMMDDHHMMSS]_add_export_configuration  [CREATE AUTO]

server-new/routes/
├── export.js                         [ADD 3 routes: save, get, delete]
└── library.js                        [VERIFY functions exist]

server-new/middleware/
└── permissions.js                    [CHECK - export permissions]
```

---

## TÂCHE 2.1: Ajouter table Prisma ExportConfiguration (30 min)

### Étape 2.1.1: Vérifier le schema.prisma actuel
```bash
# Voir la fin du fichier schema.prisma
tail -100 server-new/prisma/schema.prisma | head -50
```

### Étape 2.1.2: Trouver la bonne place pour ajouter la table

Dans `server-new/prisma/schema.prisma`, **avant le dernier model** (ou après SavedTemplate), ajouter:

**Rechercher FirstLine SavedTemplate model** (environ ligne 1000):
```prisma
model SavedTemplate {
```

**Ajouter APRÈS SavedTemplate, avant le dernier model**:

```prisma
// ========== EXPORT CONFIGURATION TABLE ==========
model ExportConfiguration {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation("userExportConfigs", fields: [userId], references: [id], onDelete: Cascade)
  
  reviewId          String?   // Linked review si config spécifique (nullable)
  review            Review?   @relation("reviewExportConfigs", fields: [reviewId], references: [id], onDelete: SetNull)

  // Nom et description
  name              String    @default("Ma Configuration")
  description       String?
  isDefault         Boolean   @default(false)

  // Template et format
  templateName      String    @default("modernCompact") // ID du template (modernCompact, detailedCard, etc.)
  format            String    @default("1:1") // 1:1, 16:9, A4, 9:16
  ratio             String    @default("1:1")

  // Couleurs et apparence
  colors            String    // JSON: { background, accent, textPrimary, textSecondary, border }
  typography        String    // JSON: { fontFamily, fontSize, fontWeight, lineHeight }
  
  // Configuration des contenus visibles
  contentModules    String    // JSON: { title: true, images: true, aromas: true, effects: true, ... }
  
  // Branding
  watermark         String?   // JSON: { visible, type, content, position, size, opacity, rotation, color }
  branding          String?   // JSON: { logo, filigrane, customFont }
  
  // Image settings
  imageSettings     String?   // JSON: { selectedIndex, effects, border, qualityHighRes }

  // Métadonnées
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastUsedAt        DateTime?

  @@unique([userId, name])
  @@index([userId])
  @@index([reviewId])
}

// ========== UPDATE USER MODEL ==========
// Ajouter cette relation dans le model User (chercher la ligne avec relations):
//   exportConfigs      ExportConfiguration[] @relation("userExportConfigs")
```

**⚙️ ACTION EXACTE**:

1. Ouvrir `server-new/prisma/schema.prisma`
2. Chercher `model SavedTemplate {` (~ligne 1002)
3. Aller au dernier modèle de SavedTemplate (fermeture `}`)
4. Ajouter après le `}` du SavedTemplate:

```prisma

// ========== EXPORT CONFIGURATION TABLE ==========
model ExportConfiguration {
  id                String    @id @default(uuid())
  userId            String
  user              User      @relation("userExportConfigs", fields: [userId], references: [id], onDelete: Cascade)
  
  reviewId          String?
  review            Review?   @relation("reviewExportConfigs", fields: [reviewId], references: [id], onDelete: SetNull)

  name              String    @default("Ma Configuration")
  description       String?
  isDefault         Boolean   @default(false)

  templateName      String    @default("modernCompact")
  format            String    @default("1:1")
  ratio             String    @default("1:1")

  colors            String
  typography        String
  contentModules    String
  
  watermark         String?
  branding          String?
  imageSettings     String?

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  lastUsedAt        DateTime?

  @@unique([userId, name])
  @@index([userId])
  @@index([reviewId])
}
```

5. Dans le `model User` (trouver la section relations), ajouter:
```prisma
  exportConfigs      ExportConfiguration[] @relation("userExportConfigs")
```

6. Dans le `model Review` (trouver la section relations), ajouter:
```prisma
  exportConfigs      ExportConfiguration[] @relation("reviewExportConfigs")
```

### Étape 2.1.3: Migration Prisma
```bash
cd server-new

# Générer la migration
npm run prisma:migrate:dev -- --name add_export_configuration

# Ou si npx disponible:
npx prisma migrate dev --name add_export_configuration

# Vérifier que la DB a été updatée
npm run prisma:studio
# Dans l'interface, vérifier que la table ExportConfiguration existe
```

**Résultat attendu**:
- Nouveau fichier: `server-new/prisma/migrations/[timestamp]_add_export_configuration/migration.sql`
- Table créée dans la DB SQLite

**✅ Checkpoint**: 
- `npm run prisma:generate` succeed
- `npm run prisma:studio` montre ExportConfiguration table

---

## TÂCHE 2.2: Ajouter routes API export config (60 min)

### Étape 2.2.1: Ajouter 3 routes dans export.js

**FILE**: `server-new/routes/export.js`

**Trouver la fin du fichier** (~ligne qui a `export default router`):

**Ajouter AVANT `export default router`**:

```javascript
/**
 * POST /api/export/config/save
 * Save an export configuration to DB
 * Body: { reviewId?, name, description?, template, format, colors, typography, contentModules, watermark?, branding?, imageSettings? }
 */
router.post('/config/save',
    requireAuth,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { reviewId, name, description, templateName, format, colors, typography, contentModules, watermark, branding, imageSettings } = req.body;

        // Validation
        if (!name || !templateName || !format || !colors || !typography || !contentModules) {
            throw Errors.VALIDATION_ERROR(['name', 'templateName', 'format', 'colors', 'typography', 'contentModules are required']);
        }

        // Stringify JSON fields
        const configData = {
            userId,
            reviewId: reviewId || null,
            name,
            description: description || null,
            templateName,
            format,
            ratio: format, // Même valeur
            colors: JSON.stringify(colors),
            typography: JSON.stringify(typography),
            contentModules: JSON.stringify(contentModules),
            watermark: watermark ? JSON.stringify(watermark) : null,
            branding: branding ? JSON.stringify(branding) : null,
            imageSettings: imageSettings ? JSON.stringify(imageSettings) : null,
            lastUsedAt: new Date()
        };

        // Upsert: Update if exists with same (userId, name), create otherwise
        let config;
        try {
            config = await prisma.exportConfiguration.upsert({
                where: {
                    userId_name: {
                        userId,
                        name
                    }
                },
                update: configData,
                create: configData
            });

            res.json({
                success: true,
                data: serializeExportConfig(config),
                message: 'Configuration sauvegardée'
            });
        } catch (error) {
            // Handle unique constraint error differently
            if (error.code === 'P2002') {
                // Try to update existing
                config = await prisma.exportConfiguration.update({
                    where: {
                        userId_name: { userId, name }
                    },
                    data: configData
                });
                res.json({
                    success: true,
                    data: serializeExportConfig(config),
                    message: 'Configuration mise à jour'
                });
            } else {
                throw error;
            }
        }
    })
);

/**
 * GET /api/export/config/list
 * Get all saved export configurations for current user
 * Optional query: reviewId (filter by review)
 */
router.get('/config/list',
    requireAuth,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { reviewId } = req.query;

        const where = { userId };
        if (reviewId) {
            where.reviewId = reviewId;
        }

        const configs = await prisma.exportConfiguration.findMany({
            where,
            orderBy: { lastUsedAt: 'desc' }
        });

        res.json({
            success: true,
            data: configs.map(serializeExportConfig),
            count: configs.length
        });
    })
);

/**
 * GET /api/export/config/:id
 * Get specific export configuration by ID
 */
router.get('/config/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;

        const config = await prisma.exportConfiguration.findUnique({
            where: { id }
        });

        if (!config) {
            throw Errors.NOT_FOUND('Export configuration not found');
        }

        // Verify ownership
        if (config.userId !== userId) {
            throw Errors.FORBIDDEN('You do not have access to this configuration');
        }

        res.json({
            success: true,
            data: serializeExportConfig(config)
        });
    })
);

/**
 * DELETE /api/export/config/:id
 * Delete an export configuration
 */
router.delete('/config/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { id } = req.params;

        const config = await prisma.exportConfiguration.findUnique({
            where: { id }
        });

        if (!config) {
            throw Errors.NOT_FOUND('Export configuration not found');
        }

        // Verify ownership
        if (config.userId !== userId) {
            throw Errors.FORBIDDEN('You do not have access to this configuration');
        }

        await prisma.exportConfiguration.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Configuration supprimée'
        });
    })
);

/**
 * Helper: Serialize ExportConfiguration (parse JSON fields)
 */
function serializeExportConfig(config) {
    if (!config) return null;
    return {
        id: config.id,
        userId: config.userId,
        reviewId: config.reviewId,
        name: config.name,
        description: config.description,
        isDefault: config.isDefault,
        templateName: config.templateName,
        format: config.format,
        ratio: config.ratio,
        colors: config.colors ? JSON.parse(config.colors) : {},
        typography: config.typography ? JSON.parse(config.typography) : {},
        contentModules: config.contentModules ? JSON.parse(config.contentModules) : {},
        watermark: config.watermark ? JSON.parse(config.watermark) : null,
        branding: config.branding ? JSON.parse(config.branding) : null,
        imageSettings: config.imageSettings ? JSON.parse(config.imageSettings) : null,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
        lastUsedAt: config.lastUsedAt
    };
}

export default router
```

### Étape 2.2.2: Vérifier qu'Errors.FORBIDDEN existe

```bash
grep -n "FORBIDDEN\|NOT_FOUND" server-new/utils/errorHandler.js | head -5
```

**Si absent**: Ajouter dans `server-new/utils/errorHandler.js`:

```javascript
export const Errors = {
    // ... existing errors
    FORBIDDEN: (msg) => ({
        code: 'FORBIDDEN',
        status: 403,
        message: msg || 'Forbidden'
    }),
    NOT_FOUND: (msg) => ({
        code: 'NOT_FOUND',
        status: 404,
        message: msg || 'Not found'
    })
    // ...
};
```

### Étape 2.2.3: Tester les routes API

```bash
# Terminal: API test
curl -X POST http://localhost:3000/api/export/config/save \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Test Config",
    "templateName": "modernCompact",
    "format": "1:1",
    "colors": {"background": "#000", "accent": "#fff"},
    "typography": {"fontFamily": "Inter"},
    "contentModules": {"title": true, "images": true}
  }'
```

**Résultat attendu**: 
```json
{
  "success": true,
  "data": { "id": "...", "name": "Test Config", ... },
  "message": "Configuration sauvegardée"
}
```

**✅ Checkpoint**: 
- POST /api/export/config/save → 200 OK
- GET /api/export/config/list → 200 OK avec array
- GET /api/export/config/:id → 200 OK
- DELETE /api/export/config/:id → 200 OK

**Commit**:
```bash
git add server-new/prisma/schema.prisma server-new/routes/export.js
git commit -m "PHASE 2: Add ExportConfiguration table + API routes (save/GET/delete)"
```

---

# PHASE 3: FRONTEND INTEGRATION (1h 40 min)
**Durée**: 1h 30min - 2h  
**Dépendances**: PHASE 1 ✅ + PHASE 2 ✅  
**Objectif**: Frontend hook + tab switching + config save + export button integration

## 📂 Fichiers à Modifier

```
client/src/hooks/
├── useExportConfigSave.js            [CREATE]

client/src/components/export/
├── ExportMaker.jsx                   [MODIFY - Add tab switching logic]
├── hooks/
│   └── useReviewData.js              [VERIFY]

client/src/store/
└── orchardStore.js                   [VERIFY - check persist middleware]
```

---

## TÂCHE 3.1: Créer hook useExportConfigSave (30 min)

**CREATE FILE**: `client/src/hooks/useExportConfigSave.js`

```javascript
/**
 * Hook: useExportConfigSave
 * 
 * Gère la sauvegarde et le chargement des configurations d'export
 * - Sauvegarde en DB + localStorage
 * - Récupération des configs sauvegardées
 * - Suppression d'une config
 */

import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const API_BASE = '/api/export/config';

export function useExportConfigSave() {
    const { user } = useAuth();
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Charger toutes les configs de l'utilisateur
     */
    const loadConfigs = useCallback(async (reviewId = null) => {
        if (!user) return;

        setLoading(true);
        setError(null);
        try {
            const url = new URL(`${API_BASE}/list`, window.location.origin);
            if (reviewId) {
                url.searchParams.append('reviewId', reviewId);
            }

            const response = await fetch(url, {
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const json = await response.json();
            setConfigs(json.data || []);
        } catch (err) {
            console.error('[useExportConfigSave] loadConfigs error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    /**
     * Sauvegarder une configuration
     * @param {Object} config - Configuration object
     * @returns {Promise<Object>} Saved config with ID
     */
    const saveConfig = useCallback(async (config) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        setError(null);
        try {
            const payload = {
                ...config,
                // Ensure JSON fields are objects, not strings
                colors: typeof config.colors === 'string' ? JSON.parse(config.colors) : config.colors,
                typography: typeof config.typography === 'string' ? JSON.parse(config.typography) : config.typography,
                contentModules: typeof config.contentModules === 'string' ? JSON.parse(config.contentModules) : config.contentModules,
                watermark: config.watermark ? (typeof config.watermark === 'string' ? JSON.parse(config.watermark) : config.watermark) : null,
                branding: config.branding ? (typeof config.branding === 'string' ? JSON.parse(config.branding) : config.branding) : null,
                imageSettings: config.imageSettings ? (typeof config.imageSettings === 'string' ? JSON.parse(config.imageSettings) : config.imageSettings) : null
            };

            const response = await fetch(`${API_BASE}/save`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            const json = await response.json();
            
            // Update local cache
            setConfigs(prev => {
                const index = prev.findIndex(c => c.id === json.data.id);
                if (index !== -1) {
                    const newConfigs = [...prev];
                    newConfigs[index] = json.data;
                    return newConfigs;
                }
                return [...prev, json.data];
            });

            // Save to localStorage for quick access
            const storage = JSON.parse(localStorage.getItem('reviewMaker_exportConfigs') || '{}');
            storage[json.data.id] = json.data;
            localStorage.setItem('reviewMaker_exportConfigs', JSON.stringify(storage));

            return json.data;
        } catch (err) {
            console.error('[useExportConfigSave] saveConfig error:', err);
            setError(err.message);
            throw err;
        }
    }, [user]);

    /**
     * Supprimer une configuration
     */
    const deleteConfig = useCallback(async (configId) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        setError(null);
        try {
            const response = await fetch(`${API_BASE}/${configId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            // Update local cache
            setConfigs(prev => prev.filter(c => c.id !== configId));

            // Remove from localStorage
            const storage = JSON.parse(localStorage.getItem('reviewMaker_exportConfigs') || '{}');
            delete storage[configId];
            localStorage.setItem('reviewMaker_exportConfigs', JSON.stringify(storage));
        } catch (err) {
            console.error('[useExportConfigSave] deleteConfig error:', err);
            setError(err.message);
            throw err;
        }
    }, [user]);

    /**
     * Récupérer une config depuis le cache local
     */
    const getLocalConfig = useCallback((configId) => {
        const storage = JSON.parse(localStorage.getItem('reviewMaker_exportConfigs') || '{}');
        return storage[configId] || null;
    }, []);

    return {
        configs,
        loading,
        error,
        loadConfigs,
        saveConfig,
        deleteConfig,
        getLocalConfig
    };
}

export default useExportConfigSave;
```

**✅ Checkpoint**: 
- Fichier créé sans erreurs de syntaxe
- Hook compilé avec succès

---

## TÂCHE 3.2: Fixer ExportMaker tab switching (45 min)

### Étape 3.2.1: Ouvrir ExportMaker.jsx et localiser le problème

```bash
# Trouver la ligne du sidebarTab
grep -n "sidebarTab\|setSidebarTab" client/src/components/export/ExportMaker.jsx | head -10
```

**Résultat attendu**: `const [sidebarTab, setSidebarTab] = useState('template');`

### Étape 3.2.2: Localiser le rendu et vérifier le problème

Chercher dans le JSX la section des onglets (tabs) et le contenu de la sidebar.

**Le problème**: Le contenu des onglets ne change pas quand `sidebarTab` change

**Chercher cette section** (ligne ~350-400):
```jsx
{/* Tabs */}
<button onClick={() => setSidebarTab('template')}>Templates</button>
...
{/* Content - TOUJOURS affichés peu importe le tab */}
<ConfigPane />
<ContentPanel />
...
```

### Étape 3.2.3: Remplacer le système d'onglets

**⚙️ REPLACE**: Chercher le retour du JSX de ExportMaker (après tous les states) et remplacer la section du sidebar avec ceci:

**FIND**: Le JSX qui contient les onglets Template / Contenu / Apparence / Préréglages

**REPLACE**: Avec ce code exact (structure avec conditional rendering):

```jsx
                {/* SIDEBAR - EXPORT CONFIGURATION */}
                <aside className="w-80 h-full bg-slate-900 border-l border-slate-700 overflow-hidden flex flex-col">
                    {/* TAB HEADERS */}
                    <div className="flex gap-0 border-b border-slate-700 bg-slate-950">
                        {[
                            { id: 'template', label: 'Template', icon: Layout },
                            { id: 'contenu', label: 'Contenu', icon: Grid },
                            { id: 'apparence', label: 'Apparence', icon: Palette },
                            { id: 'prereglages', label: 'Préréglages', icon: Save }
                        ].map(tab => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSidebarTab(tab.id)}
                                    className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 flex items-center justify-center gap-1 transition-all ${
                                        sidebarTab === tab.id
                                            ? 'bg-slate-800 text-emerald-400 border-b-emerald-400'
                                            : 'bg-slate-900 text-slate-400 border-b-transparent hover:text-white'
                                    }`}
                                >
                                    <TabIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB CONTENT */}
                    <div className="flex-1 overflow-y-auto">
                        {/* TAB: TEMPLATE */}
                        {sidebarTab === 'template' && (
                            <div className="p-4 space-y-3">
                                <h3 className="text-sm font-bold text-slate-300 mb-3">
                                    Sélectionnez un template
                                </h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {templates.map(tpl => {
                                        const TplIcon = tpl.icon;
                                        return (
                                            <button
                                                key={tpl.id}
                                                onClick={() => setSelectedTemplate(tpl.id)}
                                                className={`p-2 text-left rounded border transition-all ${
                                                    selectedTemplate === tpl.id
                                                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                                                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-slate-500'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TplIcon className="w-4 h-4" />
                                                    <span className="font-medium text-xs">{tpl.name}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 ml-6">{tpl.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="h-px bg-slate-700 my-4" />

                                {/* Format selector */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 mb-2 block">Format d'export</label>
                                    <select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded focus:outline-none focus:border-emerald-400"
                                    >
                                        <option value="1:1">Carré (1:1)</option>
                                        <option value="16:9">Paysage (16:9)</option>
                                        <option value="9:16">Histoire (9:16)</option>
                                        <option value="A4">Document (A4)</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* TAB: CONTENU */}
                        {sidebarTab === 'contenu' && (
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-slate-300 mb-3">
                                    Modules de contenu
                                </h3>
                                {/* Utiliser ContentModuleControls depuis orchardStore */}
                                <ContentModuleControls 
                                    config={orchardConfig}
                                    onUpdate={(updates) => {
                                        useOrchardStore.setState(s => ({
                                            ...s,
                                            config: { ...s.config, ...updates }
                                        }));
                                    }}
                                />
                            </div>
                        )}

                        {/* TAB: APPARENCE */}
                        {sidebarTab === 'apparence' && (
                            <div className="p-4 space-y-4">
                                <h3 className="text-sm font-bold text-slate-300 mb-3">
                                    Aparence et branding
                                </h3>
                                
                                {/* Colors */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 mb-2 block">Couleurs</label>
                                    <ColorPaletteControls 
                                        colors={orchardConfig?.colors || {}}
                                        onColorChange={(colorKey, colorValue) => {
                                            useOrchardStore.setState(s => ({
                                                ...s,
                                                config: {
                                                    ...s.config,
                                                    colors: {
                                                        ...s.config?.colors,
                                                        [colorKey]: colorValue
                                                    }
                                                }
                                            }));
                                        }}
                                    />
                                </div>

                                {/* Typography */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 mb-2 block">Typographie</label>
                                    <TypographyControls
                                        typography={orchardConfig?.typography || {}}
                                        onTypographyChange={(updates) => {
                                            useOrchardStore.setState(s => ({
                                                ...s,
                                                config: {
                                                    ...s.config,
                                                    typography: {
                                                        ...s.config?.typography,
                                                        ...updates
                                                    }
                                                }
                                            }));
                                        }}
                                    />
                                </div>

                                {/* Image & Branding */}
                                <div>
                                    <label className="text-xs font-bold text-slate-300 mb-2 block">Images et filigrane</label>
                                    <ImageBrandingControls
                                        imageSettings={orchardConfig?.imageSettings || {}}
                                        watermark={watermark}
                                        onImageSettingsChange={(updates) => {
                                            useOrchardStore.setState(s => ({
                                                ...s,
                                                config: {
                                                    ...s.config,
                                                    imageSettings: updates
                                                }
                                            }));
                                        }}
                                        onWatermarkChange={setWatermark}
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB: PRÉRÉGLAGES */}
                        {sidebarTab === 'prereglages' && (
                            <div className="p-4">
                                <h3 className="text-sm font-bold text-slate-300 mb-3">
                                    Mes configurations
                                </h3>
                                <PresetManager 
                                    currentConfig={orchardConfig}
                                    onLoadPreset={(config) => {
                                        useOrchardStore.setState(s => ({
                                            ...s,
                                            config: { ...s.config, ...config }
                                        }));
                                        // Optionally switch to template tab to show result
                                        setSidebarTab('template');
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </aside>
```

### Étape 3.2.4: Vérifier l'import des composants

S'assurer que les imports en haut du fichier incluent:

```javascript
import {
    Download, Palette,
    Grid, Layout, Maximize2, Save, X, ChevronsRight,
    Share2, Film, Plus,
    Settings, Edit2, Trash2  // Ajouter si absent
} from 'lucide-react';
import ContentModuleControls from '../shared/config/ContentModuleControls';
import TypographyControls from '../shared/config/TypographyControls';
import ColorPaletteControls from '../shared/config/ColorPaletteControls';
import ImageBrandingControls from '../shared/config/ImageBrandingControls';
import PresetManager from '../shared/config/PresetManager';
import { useOrchardStore } from '../../store/orchardStore';
```

**✅ Checkpoint**: 
- ExportMaker.jsx compilé sans erreurs
- Onglets affichés et cliquables
- Contenu change quand on clique sur les onglets

**Test dans browser**:
```javascript
// Console browser:
// 1. Cliquer sur chaque onglet (Template, Contenu, Apparence, Préréglages)
// Attendu: Le contenu du sidebar change
// 2. Modifier une couleur dans Apparence
// Attendu: La preview rafraichie
```

---

## TÂCHE 3.3: Intégrer hook useExportConfigSave (25 min)

### Étape 3.3.1: Ajouter le hook dans ExportMaker

**Au top du composant ExportMaker** (après les autres hooks), ajouter:

```javascript
import useExportConfigSave from '../../hooks/useExportConfigSave';

// ... autres imports ...

const ExportMaker = ({ reviewData, productType = 'flower', onClose }) => {
    // ... autres hooks ...
    
    // ADD THIS:
    const exportConfigSave = useExportConfigSave();
    const [savingConfig, setSavingConfig] = useState(false);
```

### Étape 3.3.2: Charger les configs au mount

```javascript
// Après useEffect pour les permissions, ajouter:

    useEffect(() => {
        // Charger les configurations sauvegardées au démarrage
        if (user && reviewData?.id) {
            exportConfigSave.loadConfigs(reviewData.id);
        }
    }, [user, reviewData?.id, exportConfigSave]);
```

### Étape 3.3.3: Ajouter bouton Save Config

**Dans le footer ou avant les boutons d'export**, ajouter:

```jsx
                {/* SAVE CONFIG BUTTON */}
                <button
                    onClick={async () => {
                        setSavingConfig(true);
                        try {
                            const configName = prompt('Nom de la configuration:', 'Ma configuration');
                            if (!configName) return;

                            await exportConfigSave.saveConfig({
                                reviewId: reviewData?.id,
                                name: configName,
                                templateName: selectedTemplate,
                                format,
                                ratio: format,
                                colors: orchardConfig?.colors || {},
                                typography: orchardConfig?.typography || {},
                                contentModules: orchardConfig?.contentModules || {},
                                watermark,
                                branding: orchardConfig?.branding,
                                imageSettings: orchardConfig?.imageSettings
                            });

                            alert('Configuration sauvegardée!');
                        } catch (error) {
                            alert('Erreur: ' + error.message);
                        } finally {
                            setSavingConfig(false);
                        }
                    }}
                    disabled={savingConfig || !reviewData}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {savingConfig ? 'Sauvegarde...' : 'Sauvegarder config'}
                </button>
```

**✅ Checkpoint**: 
- Hook intégré sans erreurs
- Configurations se chargent au démarrage
- Bouton "Sauvegarder config" fonctionne
- Configs sauvegardées en DB et localStorage

**Commit**:
```bash
git add client/src/hooks/useExportConfigSave.js client/src/components/export/ExportMaker.jsx
git commit -m "PHASE 3: Add tab switching + useExportConfigSave hook + save button"
```

---

# PHASE 4: EXPORT MAKER POLISH (1h 30 min)
**Durée**: 1h 30min - 1h 50min  
**Dépendances**: PHASE 3 ✅  
**Objectif**: Fixer onglets dynamiques + gallery + fix localStorage reset

## 📂 Fichiers à Modifier

```
client/src/store/
└── orchardStore.js                   [MODIFY - Fix localStorage reset]

client/src/components/export/
├── ExportMaker.jsx                   [ADD gallery display]
└── services/
    └── exportService.js              [VERIFY - add tracking]
```

---

## TÂCHE 4.1: Fixer orchardStore localStorage reset (20 min)

### Étape 4.1.1: Diagnostiquer le problème

```bash
# Chercher CURRENT_STORAGE_VERSION
grep -n "CURRENT_STORAGE_VERSION\|persist\|removeItem" client/src/store/orchardStore.js | head -20
```

**Le problème**: CURRENT_STORAGE_VERSION force `localStorage.removeItem(STORAGE_KEY)` au chaque render

### Étape 4.1.2: Localiser et corriger

**Chercher cette section** dans orchardStore.js:

```javascript
const STORAGE_KEY = 'orchard-config';
const CURRENT_STORAGE_VERSION = 8;

// or similar

export const useOrchardStore = create(
    persist(
        (set, get) => ({
            // ... state
        }),
        {
            name: STORAGE_KEY,
            version: CURRENT_STORAGE_VERSION,
            migrate: (state, version) => {
                // Problème: force removeItem si version change
            }
        }
    )
);
```

**REPLACE**: Mettre à jour la configuration persist pour ne pas perdre les données:

```javascript
export const useOrchardStore = create(
    persist(
        (set, get) => ({
            // ... reste du code existant ...
        }),
        {
            name: STORAGE_KEY,
            version: CURRENT_STORAGE_VERSION,
            // Fix: Only migrate when version actually changes
            migrate: (state, version) => {
                // V1 to V8 migration logic (garder si existe)
                if (version < CURRENT_STORAGE_VERSION) {
                    // Do migration steps
                    // BUT: Don't force remove - it wipes user data!
                    console.log('[orchardStore] Migrating from version', version, 'to', CURRENT_STORAGE_VERSION);
                    // Return migrated state
                    return state;
                }
                return state;
            }
        }
    )
);
```

**Important**: Ne pas supprimer les données existantes dans localStorage. La version doit incrementer seulement si schema change vraiment.

**✅ Checkpoint**: 
- localStorage persist fonctionne
- Données restent après page refresh
- `localStorage.getItem('orchard-config')` retourne un JSON valide

---

## TÂCHE 4.2: Ajouter affichage galerie d'images (30 min)

### Étape 4.2.1: Ajouter ImageGallery component

**CREATE FILE**: `client/src/components/export/ImageGallery.jsx`

```javascript
/**
 * ImageGallery Component
 * Affiche les images de la review avec sélection et prévisualisation
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ImageGallery({ images = [], currentImageIndex = 0, onSelectImage }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    if (!images || images.length === 0) {
        return (
            <div className="p-4 bg-slate-800 rounded border border-slate-700 text-center">
                <p className="text-xs text-slate-400">Aucune image disponible</p>
            </div>
        );
    }

    const handlePrevious = () => {
        const newIndex = (currentImageIndex - 1 + images.length) % images.length;
        onSelectImage?.(newIndex);
    };

    const handleNext = () => {
        const newIndex = (currentImageIndex + 1) % images.length;
        onSelectImage?.(newIndex);
    };

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
                <img
                    src={images[currentImageIndex]}
                    alt={`Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                    <>
                        {/* Previous button */}
                        <button
                            onClick={handlePrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Next button */}
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>

                        {/* Image counter */}
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                            {currentImageIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelectImage?.(idx)}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                                idx === currentImageIndex
                                    ? 'border-emerald-500'
                                    : 'border-slate-600 hover:border-slate-500'
                            }`}
                        >
                            <img
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Étape 4.2.2: Intégrer ImageGallery dans ExportMaker

**Dans ExportMaker.jsx**, dans la section du footer ou du panel image:

```jsx
import ImageGallery from './ImageGallery';

// ... dans le composant:

const [selectedImageIndex, setSelectedImageIndex] = useState(0);

// ...

// Dans le JSX de la sidebar ou de la zone d'images:
{reviewData?.images && reviewData.images.length > 0 && (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-300">Images</label>
        <ImageGallery
            images={reviewData.images}
            currentImageIndex={selectedImageIndex}
            onSelectImage={setSelectedImageIndex}
        />
    </div>
)}
```

**✅ Checkpoint**: 
- Gallery affichée avec images
- Navigation prev/next fonctionne
- Thumbnails cliquables

---

## TÂCHE 4.3: Ajouter tracking export (20 min)

### Étape 4.3.1: Créer endpoint de tracking (backend)

**Dans `server-new/routes/export.js`**, ajouter une nouvelle route AVANT `export default router`:

```javascript
/**
 * POST /api/export/track
 * Track an export event (for analytics)
 * Body: { reviewId, format, template, timestamp }
 */
router.post('/track',
    requireAuth,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { reviewId, format, template, fileSize } = req.body;

        // Log export event (optionally save to DB for stats)
        console.log(`[EXPORT] User ${userId} exported review ${reviewId} as ${template}/${format}`);

        // Optionally update user stats
        if (userId) {
            try {
                const user = await prisma.user.findUnique({ where: { id: userId } });
                if (user) {
                    // Track export counts if you have that table
                    // Could update a stats table here
                }
            } catch (error) {
                console.error('[EXPORT] Error tracking export:', error);
            }
        }

        res.json({
            success: true,
            message: 'Export tracked'
        });
    })
);
```

### Étape 4.3.2: Appeler le tracking côté frontend

**Dans ExportMaker.jsx**, après chaque export réussi:

```javascript
// Ajouter cette fonction helper
const trackExport = async (format, template, fileSize) => {
    try {
        await fetch('/api/export/track', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewId: reviewData?.id,
                format,
                template,
                fileSize,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.warn('[ExportMaker] Failed to track export:', error);
    }
};

// Dans chaque fonction d'export (exportToJpeg, exportToPng, etc.), ajouter après succès:
// trackExport(format, selectedTemplate, blob.size);
```

**✅ Checkpoint**: 
- Export events sont loggés en backend
- Tracking ne bloque pas l'export

---

## TÂCHE 4.4: Vérifier le rendu de toutes les sections (20 min)

### Étape 4.4.1: Test complet du flow

1. Ouvrir une review dans ExportMaker
2. Cliquer sur chaque onglet:
   - [ ] Template → Voir les templates + format selector
   - [ ] Contenu → Voir les ContentModuleControls
   - [ ] Apparence → Voir ColorPalette + Typography
   - [ ] Préréglages → Voir PresetManager
3. Modifier les options dans chaque tab
4. Cliquer "Sauvegarder config" → devoir prompt un nom
5. Exporter en PNG/PDF
6. Check backend logs pour le tracking

**✅ Checkpoint**: 
- Tous les onglets fonctionnels
- Config sauvegardée en DB
- Export tracked
- Pas d'erreurs console graves

**Commit**:
```bash
git add client/src/store/orchardStore.js client/src/components/export/ImageGallery.jsx client/src/components/export/ExportMaker.jsx server-new/routes/export.js
git commit -m "PHASE 4: Fix localStorage persist + add ImageGallery + export tracking"
```

---

# PHASE 5: PIPELINE RENDERING (1h 30 min)
**Durée**: 1h 30min - 1h 45min  
**Dépendances**: PHASE 3 ✅  
**Objectif**: Afficher pipelines (culture, curing, extraction) dans les templates d'export

## 📂 Fichiers à Modifier

```
client/src/components/export/
├── PipelineGrid.jsx                  [VERIFY & ENHANCE]
├── TemplateRenderer.jsx              [ADD pipeline rendering]
└── templates/
    ├── ModernCompactTemplate.jsx     [ADD pipeline section]
    ├── DetailedCardTemplate.jsx      [ADD pipeline section]
    └── CompleteTemplate.jsx          [ADD pipeline section]
```

---

## TÂCHE 5.1: Vérifier PipelineGrid component (15 min)

### Étape 5.1.1: Vérifier son existence et contenu

```bash
ls -la client/src/components/export/PipelineGrid.jsx
head -100 client/src/components/export/PipelineGrid.jsx
```

**Résultat attendu**: Composant affichant une grille GitHub-style de pipeline

### Étape 5.1.2: Si PipelineGrid existe, vérifier sa signature

Le composant doit accepter:
```javascript
<PipelineGrid 
    pipeline={{ stages: [...], type: 'culture|curing|extraction', startDate, endDate }}
    format="1:1|16:9|A4|9:16"  // Optionnel - adapte le rendu
/>
```

**Si absent ou incomplet**: Créer une version simple

---

## TÂCHE 5.2: Ajouter pipeline rendering aux templates (60 min)

### Étape 5.2.1: Créer fonction extractPipelines

**Dans client/src/components/export/TemplateRenderer.jsx** ou dans un utils file, ajouter:

```javascript
/**
 * Extract all pipelines from review data
 * Retourne un array de pipelines avec type et données
 */
export function extractPipelines(reviewData) {
    if (!reviewData) return [];

    const pipelines = [];

    // Culture pipeline (Flowers, Hash, Concentrates)
    if (reviewData.culturePipeline) {
        pipelines.push({
            type: 'culture',
            name: 'Culture',
            data: reviewData.culturePipeline,
            icon: '🌱',
            description: 'Cycle de culture complet'
        });
    }

    // Curing pipeline (applicable à tous après récolte)
    if (reviewData.curingPipeline) {
        pipelines.push({
            type: 'curing',
            name: 'Curing/Séchage',
            data: reviewData.curingPipeline,
            icon: '🎯',
            description: 'Maturation et stockage'
        });
    }

    // Extraction pipeline (Hash, Concentrates)
    if (reviewData.extractionPipeline) {
        pipelines.push({
            type: 'extraction',
            name: 'Extraction',
            data: reviewData.extractionPipeline,
            icon: '⚗️',
            description: 'Processs d\'extraction'
        });
    }

    // Purification pipeline (Concentrates)
    if (reviewData.purificationPipeline) {
        pipelines.push({
            type: 'purification',
            name: 'Purification',
            data: reviewData.purificationPipeline,
            icon: '✨',
            description: 'Raffinement et purification'
        });
    }

    return pipelines;
}
```

### Étape 5.2.2: Créer un PipelinePreview component simple

**CREATE FILE**: `client/src/components/export/templates/PipelinePreview.jsx`

```javascript
/**
 * PipelinePreview Component
 * Affiche un aperçu simplifié d'une pipeline pour l'export
 */

import React from 'react';

export default function PipelinePreview({ pipeline, compact = false }) {
    if (!pipeline) return null;

    const { type, name, data, icon, description } = pipeline;

    // Extract stage count
    const stageCount = data?.stages?.length || 0;
    const averageTemp = data?.averageTemperature || null;
    const duration = data?.duration || null;

    if (compact) {
        return (
            <div className="p-2 bg-slate-800/50 rounded border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{icon}</span>
                    <h4 className="text-xs font-bold text-slate-300">{name}</h4>
                </div>
                <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-slate-400">
                        <span className="text-slate-500 block">Étapes</span>
                        <span className="font-bold text-slate-200">{stageCount}</span>
                    </div>
                    {averageTemp && (
                        <div className="text-slate-400">
                            <span className="text-slate-500 block">Température</span>
                            <span className="font-bold text-slate-200">{averageTemp}°C</span>
                        </div>
                    )}
                    {duration && (
                        <div className="text-slate-400">
                            <span className="text-slate-500 block">Durée</span>
                            <span className="font-bold text-slate-200">{duration}j</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Full version
    return (
        <div className="p-3 bg-slate-800/50 rounded border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{icon}</span>
                <div>
                    <h4 className="text-sm font-bold text-slate-300">{name}</h4>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>

            {/* Stage breakdown */}
            {data?.stages && data.stages.length > 0 && (
                <div className="space-y-2 mt-3">
                    <p className="text-xs font-bold text-slate-400 uppercase">Étapes ({stageCount})</p>
                    <div className="space-y-1">
                        {data.stages.slice(0, 4).map((stage, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">{stage.name || `Étape ${idx + 1}`}</span>
                                {stage.duration && <span className="text-slate-500">{stage.duration}j</span>}
                                {stage.temperature && <span className="text-slate-500">{stage.temperature}°C</span>}
                            </div>
                        ))}
                        {stageCount > 4 && (
                            <p className="text-xs text-slate-500 italic">+{stageCount - 4} étapes</p>
                        )}
                    </div>
                </div>
            )}

            {/* Summary stats */}
            {(averageTemp || duration) && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {averageTemp && (
                        <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-slate-500">Temp moyenne</p>
                            <p className="font-bold text-slate-200">{averageTemp}°C</p>
                        </div>
                    )}
                    {duration && (
                        <div className="bg-slate-700/50 p-2 rounded">
                            <p className="text-slate-500">Durée totale</p>
                            <p className="font-bold text-slate-200">{duration} jours</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
```

### Étape 5.2.3: Ajouter pipelines au ModernCompactTemplate

**FILE**: `client/src/components/export/templates/ModernCompactTemplate.jsx`

**Search for**: La section finale du rendu (avant le `</div>` de fermeture)

**ADD**: Avant la fermeture finale:

```jsx
import PipelinePreview from './PipelinePreview';
import { extractPipelines } from '../TemplateRenderer';

// Dans le rendering du template:

{/* PIPELINES SECTION */}
{(() => {
    const pipelines = extractPipelines(data);
    return pipelines.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Processus</h3>
            <div className="grid grid-cols-1 gap-2">
                {pipelines.map((pipeline, idx) => (
                    <PipelinePreview key={idx} pipeline={pipeline} compact={true} />
                ))}
            </div>
        </div>
    );
})()}
```

### Étape 5.2.4: Ajouter pipelines au DetailedTemplate

**FILE**: `client/src/components/export/templates/DetailedCardTemplate.jsx`

**ADD** (même section que ModernCompactTemplate mais sans `compact={true}`):

```jsx
{/* PIPELINES SECTION */}
{(() => {
    const pipelines = extractPipelines(data);
    return pipelines.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
            <h3 className="text-l font-bold text-slate-300 mb-4">📊 Processus de Production</h3>
            <div className="grid grid-cols-1 gap-3">
                {pipelines.map((pipeline, idx) => (
                    <PipelinePreview key={idx} pipeline={pipeline} compact={false} />
                ))}
            </div>
        </div>
    );
})()}
```

### Étape 5.2.5: Ajouter genetics tree rendering si fleur

**Dans les templates Detailed+ (pour Flowers seulement)**:

```jsx
{/* GENETICS TREE - Fleurs seulement */}
{data.type === 'flower' && data.cultivarsList && (
    <div className="mt-6 pt-6 border-t border-slate-700">
        <h3 className="text-l font-bold text-slate-300 mb-4">🌱 Généalogie</h3>
        <div className="bg-slate-800/50 p-4 rounded border border-slate-700">
            {/* Simple genetics display or tree diagram */}
            {data.cultivarsList.map(c => (
                <div key={c.id} className="text-xs text-slate-400 mb-2">
                    <span className="font-bold text-slate-200">{c.name}</span>
                    {c.genetics && <span className="text-slate-500"> - {c.genetics}</span>}
                </div>
            ))}
        </div>
    </div>
)}
```

**✅ Checkpoint**: 
- Pipelines affichées dans les exports
- PipelinePreview component fonctionnel
- Fleurs affichent génétiques if available

**Test**: 
```javascript
// Browser console:
// 1. Créer/exporter une review avec pipeline de culture
// 2. Dans l'export, vérifier que les étapes de culture affichés
// 3. Check que les données (temp, humidité, dates) sont visibles
```

**Commit**:
```bash
git add client/src/components/export/templates/PipelinePreview.jsx \
        client/src/components/export/TemplateRenderer.jsx \
        client/src/components/export/templates/ModernCompactTemplate.jsx \
        client/src/components/export/templates/DetailedCardTemplate.jsx
git commit -m "PHASE 5: Add pipeline rendering to templates + genetics display for flowers"
```

---

# PHASE 6: TESTING + VALIDATION (55 min - 1h)
**Durée**: 45min - 1h  
**Dépendances**: Toutes PHASES 1-5 ✅  
**Objectif**: Tester tous les fixes et valider la stabilité

## ✅ CHECKLIST DE VALIDATION

### TEST 1: PhenoHunt Functionality (10 min)
- [ ] Page charge sans erreur
- [ ] Sidebar affiche cultivar library (ou message vide si aucun)
- [ ] Drag-drop un cultivar vers canvas → crée un node
- [ ] Right-click sur node → affiche context menu
- [ ] Modal "Créer arbre" fonctionne
- [ ] Sélectionner arbre dans dropdown → charge le tree
- [ ] React Flow responsive au zoom/pan

### TEST 2: Export Config Save (15 min)
- [ ] Cliquer onglet "Template" → contenu change
- [ ] Cliquer onglet "Contenu" → ContentModuleControls affichés
- [ ] Cliquer onglet "Apparence" → ColorPalette + Typography affichés
- [ ] Modifier couleur → preview rafraichie immédiatement
- [ ] Cliquer "Sauvegarder config" → demande un nom
- [ ] Vérifier DB: config sauvegardée
- [ ] Refresh page → config persiste
- [ ] Charger une config sauvegardée → restaure les settings

### TEST 3: Export Functionality (15 min)
- [ ] Exporter en PNG → file téléchargée
- [ ] Exporter en PDF → file téléchargée et valide
- [ ] Exporter en SVG (si disponible) → file SVG valide
- [ ] Watermark affiché si activé
- [ ] Image gallery affichée avec toutes les images
- [ ] Image sélectionnée dans export
- [ ] Export tracking loggé en backend

### TEST 4: Pipeline Display (10 min)
- [ ] Exporter review avec pipeline culture
- [ ] Template "Detailed" affiche les étapes de pipeline
- [ ] Données Temperature, Humidity, Dates visibles
- [ ] Template "Compact" affiche summary seulement
- [ ] Genetique tree visible pour fleurs

### TEST 5: Storage Persistence (5 min)
- [ ] localStorage ne se réinitialise pas au refresh
- [ ] `localStorage.getItem('orchard-config')` retourne JSON valide
- [ ] LocalStorage cleanup au logout

### TEST 6: Error Handling (5 min)
- [ ] Network error → toast message approprié
- [ ] Invalid config → validation error
- [ ] Missing required fields → form validation
- [ ] No console errors (warnings acceptés)

---

## 🔍 DEBUGGING COMMANDS

### Backend Logs
```bash
# Terminal backend
tail -f ~/.pm2/logs/reviews-maker-error.log || npm run dev
# Chercher pour: EXPORT, tracking, migration errors
```

### Frontend Console
```javascript
// Browser F12:
// 1. Vérifier l'état du store
console.log(JSON.stringify(window.localStorage.getItem('orchard-config'), null, 2));

// 2. Checker genetics store
console.log(window?.useGeneticsStore?.getState?.());

// 3. Vérifier les configs d'export
console.log(JSON.parse(localStorage.getItem('reviewMaker_exportConfigs')));
```

### Database Check
```bash
# Terminal backend
npm run prisma:studio
# Chercher:
# 1. User table → ses exportConfigs relation
# 2. ExportConfiguration table → configs sauvegardées
# 3. GeneticTree table → les arbres du PhenoHunt
```

---

## 🎯 VALIDATION FINALE

**Checkpoints Critiques**:

1. ✅ PhenoHuntPage interactive + canvas ReactFlow responsive
2. ✅ ExportConfiguration table existe en DB + API routes working
3. ✅ ExportMaker onglets dynamiques + tab content change
4. ✅ useExportConfigSave hook integr → configs save/load/delete
5. ✅ Pipelines renderent dans templates
6. ✅ localStorage persiste sans reset aléatoire
7. ✅ Export button sauvegarde config avant export
8. ✅ Pas d'erreurs critical console

---

## 📊 COMMANDS DE TEST COMPLET

```bash
# Test de tous les endpoints (en parallèle avec frontend)

# 1. Auth (get current user)
curl -H "Cookie: YOUR_SESSION" http://localhost:3000/api/auth/me

# 2. Sauvegarder une config export
curl -X POST http://localhost:3000/api/export/config/save \
  -H "Cookie: YOUR_SESSION" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","templateName":"modernCompact","format":"1:1","colors":{},"typography":{},"contentModules":{}}'

# 3. Lister les configs
curl -H "Cookie: YOUR_SESSION" http://localhost:3000/api/export/config/list

# 4. Supprimer une config
curl -X DELETE http://localhost:3000/api/export/config/CONFIG_ID \
  -H "Cookie: YOUR_SESSION"

# 5. Vérifier les genetique trees
curl -H "Cookie: YOUR_SESSION" http://localhost:3000/api/genetics/trees
```

**Résultats attendus**:
- Tous les endpoints retournent 200 OK
- Aucune erreur 500
- Données persistes en DB

---

# PHASE 7: DEPLOY (25-30 min)
**Durée**: 20-30 min  
**Dépendances**: Toutes PHASES 1-6 ✅ + tests OK

## 🚀 DEPLOYMENT STEPS

### ÉTAPE 7.1: Commit et Push changes

```bash
# Vérifier l'état
git status

# Ajouter tous les fichiers modifiés
git add -A

# Commit final
git commit -m "FIX: Critical bugs - PhenoHunt rebuild + ExportConfig persistence + Pipeline rendering

- PHASE 1: PhenoHunt UI rebuild with ReactFlow canvas
- PHASE 2: Add ExportConfiguration Prisma table + API routes
- PHASE 3: Frontend integration - useExportConfigSave hook
- PHASE 4: Fix localStorage persist + gallery display
- PHASE 5: Pipeline and genetics rendering in templates
- PHASE 6: Full testing + validation

Closes: Critical export/phenohunt issues"

# Push vers main
git push origin fix/critic-bugs-phenohunt-export

# Créer PR si vous utilisez GitHub
# gh pr create --title "Fix: Critical bugs - PhenoHunt + ExportConfig" --body "See commit message"
```

### ÉTAPE 7.2: Migration DB sur VPS

```bash
# Sur VPS:
ssh vps-lafoncedalle

cd ~/Reviews-Maker/server-new

# Récupérer les derniers changements
git pull origin main

# Installer les dépendances si besoin
npm install

# IMPORTANT: Générer Prisma Client avec nouvelle table
npm run prisma:generate

# Exécuter la migration
npm run prisma:migrate:deploy

# Vérifier la migration
npm run prisma:studio
# Vérifier que ExportConfiguration table existe
```

### ÉTAPE 7.3: Redémarrer les services

```bash
# Sur VPS:
# Redémarrer avec PM2
pm2 restart reviews-maker

# Ou redémarrer tous les services
pm2 restart all

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs reviews-maker --lines 50
```

### ÉTAPE 7.4: Validation post-deploy

```bash
# Vérifier que le frontend charge
curl -I https://reviews-maker-vps-url.com

# Vérifier que l'API répond
curl https://reviews-maker-vps-url.com/api/auth/me \
  -H "Cookie: YOUR_SESSION"

# Vérifier la nouvelle route
curl https://reviews-maker-vps-url.com/api/export/config/list \
  -H "Cookie: YOUR_SESSION"

# Tester au browser
# Ouvrir https://reviews-maker-vps-url.com
# Tester PhenoHunt, export config, etc.
```

### ÉTAPE 7.5: Rollback plan (if needed)

```bash
# Si quelque chose se casse:

# Revenir à la version précédente
git revert HEAD

# Ou simplement checkout la branche précédente
git checkout main
git reset --hard origin/main

# Redémarrer les services
pm2 restart reviews-maker

# Annuler la migration (ATTENTION: risqué!)
# npm run prisma:migrate:resolve -- --rolled-back TIMESTAMP
```

---

## 📋 CHECKLIST FINAL

- [ ] Tous les 5 problèmes critiques fixés
- [ ] PhenoHunt opérationnel
- [ ] ExportConfiguration DB + API working
- [ ] Frontend save/load/delete configurations
- [ ] Onglets ExportMaker dynamiques
- [ ] Pipelines affichées dans templates
- [ ] localStorage persiste
- [ ] Tests passent
- [ ] Commits pushés
- [ ] PR créée (si applicable)
- [ ] VPS migrated et restarted
- [ ] Post-deploy validation OK
- [ ] Logs monitored pour erreurs

---

## 🎓 NOTES & LESSONS LEARNED

### Points critiques rencontrés:
1. **localStorage CURRENT_STORAGE_VERSION**: Force removeItem au update - fixé en simplifiant la migration
2. **PhenoHuntPage non rendu Canvas**: React Flow Provider importé mais canvas jamais appelé
3. **ExportMaker tabs ne changeaient pas**: sidebarTab state existait mais jamais utilisé dans le JSX
4. **ExportConfiguration**: Pas de table Prisma pour persister - ajoutée avec relations User + Review

### Bonnes pratiques appliquées:
- ✅ Migrations Prisma versionnées automatiquement
- ✅ useState hook pour tab management avec conditional rendering
- ✅ useCallback pour les fonctions de fetch/save
- ✅ localStorage + DB sync pour resilience
- ✅ Error handling avec try-catch + user feedback
- ✅ Modular components (PipelinePreview, ImageGallery, config controls)

### Tests recommandés post-deliver:
1. Stress test: 1000 pipelines items
2. Concurrent exports: 10 users exporting simultaneously
3. Large image gallery: 50+ images
4. localStorage quota: 5MB+ configs
5. Network latency: Disable network, test fallbacks

---

## 📚 RESSOURCES UTILES

- ReactFlow docs: https://reactflow.dev/
- Prisma migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate
- localStorage limits: ~5-10MB per domain
- PM2 docs: https://pm2.keymetrics.io/

---

**FIN DU PLAN D'EXÉCUTION**

Durée estimée: **7h 50min à 10h 10min** (selon tempo et debugging)

Bon courage! 🚀
