# 📋 PLAN DE REFONTE BIBLIOTHÈQUE - EXECUTION

**Date**: 3 février 2026  
**Basé sur**: AUDIT_BIBLIOTHEQUE_COMPLET.md

---

## 🎯 OBJECTIFS

1. Bibliothèque complète avec tous les onglets (Reviews, Cultivars, Templates, Filigranes, Données, Stats)
2. Support complet des 4 types de produits
3. Enrichissement des champs manquants selon cahier des charges
4. API backend complète avec partage et statistiques

---

## 📆 PLANNING DÉTAILLÉ

### SPRINT 1: Frontend Refonte (3-4 jours)

#### Jour 1: Architecture de base

**Tâche 1.1**: Créer structure des dossiers
```
mkdir -p client/src/pages/library/tabs
mkdir -p client/src/pages/library/components
mkdir -p client/src/pages/library/hooks
```

**Tâche 1.2**: Créer LibraryPage.jsx refactorisé

```jsx
// client/src/pages/library/LibraryPage.jsx
import { useState } from 'react'
import { useStore } from '../../store/useStore'
import LibraryHeader from './components/LibraryHeader'
import LibrarySidebar from './components/LibrarySidebar'
import ReviewsTab from './tabs/ReviewsTab'
import CultivarsTab from './tabs/CultivarsTab'
import TemplatesTab from './tabs/TemplatesTab'
import WatermarksTab from './tabs/WatermarksTab'
import DataTab from './tabs/DataTab'
import StatsTab from './tabs/StatsTab'

const TABS = [
  { id: 'reviews', label: 'Mes Reviews', icon: '📝', all: true },
  { id: 'cultivars', label: 'Cultivars', icon: '🧬', producerOnly: true },
  { id: 'templates', label: 'Templates', icon: '📦', all: true },
  { id: 'watermarks', label: 'Filigranes', icon: '🎨', all: true },
  { id: 'data', label: 'Données', icon: '💾', producerOnly: true },
  { id: 'stats', label: 'Statistiques', icon: '📊', all: true },
]

export default function LibraryPage() {
  const { user } = useStore()
  const [activeTab, setActiveTab] = useState('reviews')
  const isProducer = user?.accountType === 'producer'
  
  const availableTabs = TABS.filter(t => t.all || (t.producerOnly && isProducer))
  
  const renderTab = () => {
    switch (activeTab) {
      case 'reviews': return <ReviewsTab />
      case 'cultivars': return <CultivarsTab />
      case 'templates': return <TemplatesTab />
      case 'watermarks': return <WatermarksTab />
      case 'data': return <DataTab />
      case 'stats': return <StatsTab />
      default: return <ReviewsTab />
    }
  }
  
  return (
    <div className="min-h-screen bg-[#07070f]">
      <LibraryHeader />
      <div className="flex">
        <LibrarySidebar 
          tabs={availableTabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        <main className="flex-1 p-6">
          {renderTab()}
        </main>
      </div>
    </div>
  )
}
```

**Tâche 1.3**: Créer composants communs
- LibraryHeader.jsx
- LibrarySidebar.jsx
- LibraryCard.jsx (générique)

#### Jour 2: Onglet Reviews

**Tâche 2.1**: ReviewsTab avec filtres par type

```jsx
// client/src/pages/library/tabs/ReviewsTab.jsx
import { useState, useEffect } from 'react'
import { useLibraryReviews } from '../hooks/useLibraryReviews'
import ReviewCard from '../components/ReviewCard'
import FilterBar from '../../../components/shared/ui-helpers/FilterBar'

const PRODUCT_TYPES = ['all', 'Fleur', 'Hash', 'Concentré', 'Comestible']
const VIEW_MODES = ['grid', 'list', 'timeline']

export default function ReviewsTab() {
  const { reviews, loading, deleteReview, toggleVisibility } = useLibraryReviews()
  const [typeFilter, setTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [filteredReviews, setFilteredReviews] = useState([])
  
  useEffect(() => {
    const filtered = typeFilter === 'all' 
      ? reviews 
      : reviews.filter(r => r.type === typeFilter)
    setFilteredReviews(filtered)
  }, [reviews, typeFilter])
  
  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Type Filter */}
        <div className="flex gap-2">
          {PRODUCT_TYPES.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 rounded-lg ${
                typeFilter === type 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white/5 text-white/60'
              }`}
            >
              {type === 'all' ? 'Tous' : type}
            </button>
          ))}
        </div>
        
        {/* View Mode */}
        <div className="flex gap-2">
          {VIEW_MODES.map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`p-2 rounded-lg ${
                viewMode === mode ? 'bg-purple-600' : 'bg-white/5'
              }`}
            >
              {/* Icons */}
            </button>
          ))}
        </div>
      </div>
      
      {/* Reviews Display */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {filteredReviews.map(review => (
          <ReviewCard 
            key={review.id}
            review={review}
            viewMode={viewMode}
            onDelete={deleteReview}
            onToggleVisibility={toggleVisibility}
          />
        ))}
      </div>
    </div>
  )
}
```

**Tâche 2.2**: Créer hook useLibraryReviews

```jsx
// client/src/pages/library/hooks/useLibraryReviews.js
import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../../components/shared/ToastContainer'

export function useLibraryReviews() {
  const toast = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews/my', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (err) {
      toast.error('Erreur chargement reviews')
    } finally {
      setLoading(false)
    }
  }, [toast])
  
  useEffect(() => { fetchReviews() }, [fetchReviews])
  
  const deleteReview = useCallback(async (id) => {
    if (!confirm('Supprimer cette review ?')) return
    const res = await fetch(`/api/reviews/${id}`, { 
      method: 'DELETE', 
      credentials: 'include' 
    })
    if (res.ok) {
      setReviews(prev => prev.filter(r => r.id !== id))
      toast.success('Review supprimée')
    }
  }, [toast])
  
  const toggleVisibility = useCallback(async (id, isPublic) => {
    const res = await fetch(`/api/reviews/${id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isPublic: !isPublic })
    })
    if (res.ok) {
      setReviews(prev => prev.map(r => 
        r.id === id ? { ...r, isPublic: !isPublic } : r
      ))
    }
  }, [])
  
  return { reviews, loading, deleteReview, toggleVisibility, refetch: fetchReviews }
}
```

#### Jour 3: Onglets Templates et Filigranes

**Tâche 3.1**: TemplatesTab

```jsx
// client/src/pages/library/tabs/TemplatesTab.jsx
import { useState, useEffect } from 'react'
import { useLibraryTemplates } from '../hooks/useLibraryTemplates'
import TemplateCard from '../components/TemplateCard'
import ShareTemplateModal from '../components/ShareTemplateModal'

export default function TemplatesTab() {
  const { templates, loading, deleteTemplate, shareTemplate } = useLibraryTemplates()
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Templates Sauvegardés</h2>
        <button className="px-4 py-2 bg-purple-600 rounded-lg">
          Importer un template
        </button>
      </div>
      
      {/* Prédéfinis */}
      <section>
        <h3 className="text-lg text-white/70 mb-4">Templates Prédéfinis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['Compact', 'Détaillé', 'Complète', 'Influenceur'].map(name => (
            <TemplateCard 
              key={name}
              template={{ name, isPredefined: true }}
              readOnly
            />
          ))}
        </div>
      </section>
      
      {/* Personnalisés */}
      <section>
        <h3 className="text-lg text-white/70 mb-4">Mes Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onDelete={deleteTemplate}
              onShare={() => {
                setSelectedTemplate(template)
                setShowShareModal(true)
              }}
            />
          ))}
        </div>
      </section>
      
      {showShareModal && (
        <ShareTemplateModal
          template={selectedTemplate}
          onClose={() => setShowShareModal(false)}
          onShare={shareTemplate}
        />
      )}
    </div>
  )
}
```

**Tâche 3.2**: WatermarksTab (similaire structure)

#### Jour 4: Onglets Cultivars, Data, Stats

**Tâche 4.1**: CultivarsTab (Producteur only)

```jsx
// client/src/pages/library/tabs/CultivarsTab.jsx
import { useState } from 'react'
import { useLibraryCultivars } from '../hooks/useLibraryCultivars'
import CultivarCard from '../components/CultivarCard'
import GeneticTreeCanvas from '../../../components/genetics/GeneticTreeCanvas'

export default function CultivarsTab() {
  const { cultivars, trees, loading } = useLibraryCultivars()
  const [viewMode, setViewMode] = useState('list') // 'list' | 'tree'
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Mes Cultivars & Génétiques</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-600' : 'bg-white/5'}
          >
            Liste
          </button>
          <button 
            onClick={() => setViewMode('tree')}
            className={viewMode === 'tree' ? 'bg-purple-600' : 'bg-white/5'}
          >
            Arbre généalogique
          </button>
        </div>
      </div>
      
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cultivars.map(cultivar => (
            <CultivarCard key={cultivar.id} cultivar={cultivar} />
          ))}
        </div>
      ) : (
        <GeneticTreeCanvas cultivars={cultivars} trees={trees} />
      )}
    </div>
  )
}
```

**Tâche 4.2**: StatsTab

```jsx
// client/src/pages/library/tabs/StatsTab.jsx
import { useLibraryStats } from '../hooks/useLibraryStats'
import { PieChart, BarChart } from '../../../components/shared/charts'

export default function StatsTab() {
  const { stats, loading } = useLibraryStats()
  
  if (loading) return <div>Chargement...</div>
  
  return (
    <div className="space-y-8">
      {/* Vue d'ensemble */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Reviews créées" value={stats.totalReviews} />
        <StatCard label="Exports réalisés" value={stats.totalExports} />
        <StatCard label="Cultivars" value={stats.cultivarsCount} />
        <StatCard label="Templates" value={stats.templatesCount} />
      </section>
      
      {/* Par type de produit */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4">Reviews par Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PieChart data={stats.reviewsByType} />
          <BarChart data={stats.reviewsByType} />
        </div>
      </section>
      
      {/* Tendances */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4">Tendances</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TrendCard title="Cultivars préférés" items={stats.topCultivars} />
          <TrendCard title="Templates utilisés" items={stats.topTemplates} />
          <TrendCard title="Notes moyennes" items={stats.avgRatings} />
        </div>
      </section>
    </div>
  )
}
```

---

### SPRINT 2: Enrichissement 4 Types (2-3 jours)

#### Jour 5: Enrichir productStructures.js

**Tâche 5.1**: Ajouter choiceCatalog manquants

```javascript
// Ajouts dans choiceCatalog (productStructures.js)

export const choiceCatalog = {
  // ... existants ...
  
  // Containers de curing
  curingContainers: [
    "Bocal en verre",
    "Bocal hermétique",
    "Sac sous vide",
    "Sac Grove Bags",
    "Tupperware",
    "Jar Mason",
    "Pot plastique alimentaire",
    "Aire libre",
    "Autre"
  ],
  
  // Emballages primaires
  emballagesPrimaires: [
    "Cellophane",
    "Papier cuisson",
    "Aluminium",
    "Paper hash",
    "Sac à viade",
    "Sac congélation",
    "Sous vide machine",
    "Sous vide manuel",
    "Autre"
  ],
  
  // Opacité récipients
  opaciteRecipients: [
    "Transparent",
    "Semi-opaque",
    "Opaque",
    "Ambré",
    "Noir",
    "Autre"
  ],
  
  // Méthodes consommation
  methodesConsommation: [
    "Combustion (joint)",
    "Combustion (bong)",
    "Combustion (pipe)",
    "Vapeur (vaporisateur)",
    "Dab (concentrés)",
    "Infusion (tisane)",
    "Ingestion orale",
    "Sublingual",
    "Autre"
  ],
  
  // Effets secondaires
  effetsSecondaires: [
    "Bouche sèche",
    "Yeux rouges",
    "Yeux secs",
    "Faim (munchies)",
    "Soif",
    "Anxiété légère",
    "Paranoïa légère",
    "Vertiges",
    "Nausées",
    "Maux de tête",
    "Fatigue",
    "Somnolence",
    "Aucun"
  ],
  
  // Usage préféré
  usagesPreferes: [
    "Matinée",
    "Journée",
    "Après-midi",
    "Soirée",
    "Nuit",
    "Seul",
    "En couple",
    "En groupe",
    "Social",
    "Médical",
    "Créatif",
    "Productivité",
    "Détente",
    "Autre"
  ],
  
  // Phases de culture (pour pipeline)
  phasesCulture: [
    { id: "germination", label: "Germination", defaultDays: 3 },
    { id: "plantule", label: "Plantule", defaultDays: 7 },
    { id: "croissance_debut", label: "Début croissance", defaultDays: 14 },
    { id: "croissance_milieu", label: "Milieu croissance", defaultDays: 14 },
    { id: "croissance_fin", label: "Fin croissance", defaultDays: 14 },
    { id: "stretch_debut", label: "Début stretch", defaultDays: 7 },
    { id: "stretch_milieu", label: "Milieu stretch", defaultDays: 7 },
    { id: "stretch_fin", label: "Fin stretch", defaultDays: 7 },
    { id: "floraison_debut", label: "Début floraison", defaultDays: 14 },
    { id: "floraison_milieu", label: "Milieu floraison", defaultDays: 21 },
    { id: "floraison_fin", label: "Fin floraison", defaultDays: 14 },
    { id: "recolte", label: "Récolte", defaultDays: 1 }
  ],
  
  // Couleurs trichomes
  couleursTrichomes: [
    "Translucide (0%)",
    "Légèrement laiteux (25%)",
    "Laiteux (50%)",
    "Majoritairement laiteux (75%)",
    "Laiteux + ambré (10%)",
    "Laiteux + ambré (20%)",
    "Laiteux + ambré (30%)",
    "Majoritairement ambré (50%+)"
  ]
}
```

**Tâche 5.2**: Ajouter sections manquantes aux types

```javascript
// Modifications dans productStructures.Fleur.sections

// Ajouter après section "Plan cultural"
{
  title: "🌱 PipeLine Culture Global",
  producerOnly: true,
  fields: [
    { 
      key: "pipelineTimeframe", 
      label: "Type de trame", 
      type: "select", 
      choices: ["jours", "semaines", "phases"],
      default: "phases"
    },
    { key: "cultureStartDate", label: "Date de début", type: "date" },
    { key: "cultureEndDate", label: "Date de fin", type: "date" },
    { key: "cultureMode", label: "Mode de culture", type: "select", choices: ["Indoor", "Outdoor", "Greenhouse", "No-till", "Autre"] },
    { 
      key: "espaceculture", 
      label: "Espace de culture", 
      type: "dimensions",
      fields: ["type", "longueur", "largeur", "hauteur"]
    },
    { 
      key: "culturePipeline", 
      label: "Données par étape", 
      type: "culture-pipeline-global",
      phases: choiceCatalog.phasesCulture
    }
  ]
},

// Ajouter après section Effets
{
  title: "🔥 PipeLine CURING MATURATION",
  fields: [
    { 
      key: "curingTimeframe", 
      label: "Intervalle de suivi", 
      type: "select", 
      choices: ["heures", "jours", "semaines", "mois"],
      default: "jours"
    },
    { key: "curingDuration", label: "Durée totale", type: "number" },
    { key: "curingType", label: "Type de curing", type: "select", choices: ["Froid (<5°C)", "Chaud (>5°C)", "Température ambiante"] },
    { key: "curingTemp", label: "Température (°C)", type: "number", min: 0, max: 30 },
    { key: "curingHumidity", label: "Humidité (%)", type: "slider", max: 100 },
    { key: "curingContainer", label: "Type de récipient", type: "select", choices: choiceCatalog.curingContainers },
    { key: "curingEmballage", label: "Emballage primaire", type: "select", choices: choiceCatalog.emballagesPrimaires },
    { key: "curingOpacite", label: "Opacité récipient", type: "select", choices: choiceCatalog.opaciteRecipients },
    { key: "curingVolume", label: "Volume occupé (mL)", type: "number" },
    { key: "curingPipeline", label: "Évolution du curing", type: "curing-pipeline" }
  ]
},

{
  title: "🧪 Expérience d'utilisation",
  fields: [
    { key: "consumptionMethod", label: "Méthode de consommation", type: "select", choices: choiceCatalog.methodesConsommation },
    { key: "dosageUsed", label: "Dosage utilisé (g)", type: "number", step: 0.1 },
    { key: "effectsDurationMinutes", label: "Durée des effets (minutes)", type: "number" },
    { key: "effectsProfile", label: "Profil des effets", type: "multiselect", choices: ["Anxiolytique", "Relaxant", "Énergisant", "Créatif", "Euphorique", "Sédatif", "Social"] },
    { key: "sideEffectsExperienced", label: "Effets secondaires", type: "multiselect", choices: choiceCatalog.effetsSecondaires },
    { key: "effectsOnset", label: "Début des effets", type: "select", choices: ["Immédiat (<1min)", "Rapide (1-5min)", "Modéré (5-15min)", "Lent (>15min)"] },
    { key: "preferredUsage", label: "Usage préféré", type: "multiselect", choices: choiceCatalog.usagesPreferes }
  ]
}
```

**Tâche 5.3**: Ajouter sections similaires à Hash et Concentré

```javascript
// Hash et Concentré: ajouter les mêmes sections
// - PipeLine CURING MATURATION
// - Expérience d'utilisation

// Pour Comestible: ajouter champs manquants
// Dans section Goûts:
{ key: "agressivite", label: "Agressivité/piquant", type: "slider", max: 10 }

// Dans section Effets:
{ key: "montee", label: "Montée (rapidité)", type: "slider", max: 10 }
```

#### Jour 6: Créer composants Pipeline

**Tâche 6.1**: CuringPipelineField.jsx

```jsx
// client/src/components/forms/CuringPipelineField.jsx
import { useState } from 'react'

export default function CuringPipelineField({ value, onChange, timeframe }) {
  const [entries, setEntries] = useState(value || [])
  
  const addEntry = () => {
    const newEntry = {
      id: Date.now(),
      step: entries.length + 1,
      temperature: null,
      humidity: null,
      notes: '',
      dateTime: new Date().toISOString()
    }
    const updated = [...entries, newEntry]
    setEntries(updated)
    onChange(updated)
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-white/70">Évolution du curing</span>
        <button onClick={addEntry} className="px-3 py-1 bg-purple-600 rounded">
          + Ajouter entrée
        </button>
      </div>
      
      {/* Timeline visuelle style GitHub */}
      <div className="flex flex-wrap gap-1">
        {entries.map((entry, idx) => (
          <div
            key={entry.id}
            className={`w-4 h-4 rounded cursor-pointer ${
              entry.humidity > 60 ? 'bg-green-500' :
              entry.humidity > 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            title={`${timeframe} ${idx + 1}: ${entry.humidity}% RH, ${entry.temperature}°C`}
            onClick={() => editEntry(entry.id)}
          />
        ))}
      </div>
      
      {/* Liste détaillée */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="p-3 bg-white/5 rounded-lg flex gap-4">
            <span className="text-purple-400 font-bold">{idx + 1}</span>
            <input
              type="number"
              placeholder="Temp °C"
              value={entry.temperature || ''}
              onChange={e => updateEntry(entry.id, 'temperature', e.target.value)}
              className="w-20 bg-white/10 rounded px-2 py-1"
            />
            <input
              type="number"
              placeholder="RH %"
              value={entry.humidity || ''}
              onChange={e => updateEntry(entry.id, 'humidity', e.target.value)}
              className="w-20 bg-white/10 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Notes"
              value={entry.notes || ''}
              onChange={e => updateEntry(entry.id, 'notes', e.target.value)}
              className="flex-1 bg-white/10 rounded px-2 py-1"
            />
            <button onClick={() => removeEntry(entry.id)} className="text-red-400">×</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

### SPRINT 3: Backend API (1-2 jours)

#### Jour 7: Endpoints manquants

**Tâche 7.1**: Ajouter routes cultivars dans library.js

```javascript
// server-new/routes/library.js - Ajouts

// ===========================
// CULTIVARS (Producteur only)
// ===========================

/**
 * GET /api/library/cultivars
 */
router.get('/cultivars', requireAuth, asyncHandler(async (req, res) => {
    // Vérifier compte producteur
    if (req.user.accountType !== 'producer') {
        return res.status(403).json({ error: 'producer_only' })
    }
    
    const cultivars = await prisma.cultivar.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' }
    })
    res.json(cultivars)
}))

/**
 * POST /api/library/cultivars
 */
router.post('/cultivars', requireAuth, asyncHandler(async (req, res) => {
    if (req.user.accountType !== 'producer') {
        return res.status(403).json({ error: 'producer_only' })
    }
    
    const { name, breeder, type, indicaRatio, phenoCode, traits, images } = req.body
    
    const cultivar = await prisma.cultivar.create({
        data: {
            userId: req.user.id,
            name,
            breeder,
            type,
            indicaRatio,
            phenoCode,
            traits: traits ? JSON.stringify(traits) : null,
            images: images ? JSON.stringify(images) : null
        }
    })
    
    res.status(201).json(cultivar)
}))

// ===========================
// PARTAGE TEMPLATES
// ===========================

/**
 * POST /api/library/templates/:id/share
 * Génère un code de partage unique
 */
router.post('/templates/:id/share', requireAuth, asyncHandler(async (req, res) => {
    const template = await prisma.savedTemplate.findFirst({
        where: { id: req.params.id, userId: req.user.id }
    })
    
    if (!template) {
        return res.status(404).json({ error: 'not_found' })
    }
    
    // Générer code unique 8 caractères
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    const share = await prisma.templateShare.create({
        data: {
            templateId: template.id,
            shareCode,
            createdBy: req.user.id,
            expiresAt: req.body.expiresAt || null,
            maxUses: req.body.maxUses || null
        }
    })
    
    res.json({ 
        shareCode: share.shareCode,
        shareUrl: `${process.env.APP_URL}/import-template/${share.shareCode}`
    })
}))

/**
 * GET /api/library/templates/shared/:code
 * Récupère un template partagé (public)
 */
router.get('/templates/shared/:code', asyncHandler(async (req, res) => {
    const share = await prisma.templateShare.findUnique({
        where: { shareCode: req.params.code }
    })
    
    if (!share || !share.isActive) {
        return res.status(404).json({ error: 'invalid_code' })
    }
    
    if (share.expiresAt && new Date() > share.expiresAt) {
        return res.status(410).json({ error: 'expired' })
    }
    
    if (share.maxUses && share.usedCount >= share.maxUses) {
        return res.status(410).json({ error: 'max_uses_reached' })
    }
    
    const template = await prisma.savedTemplate.findUnique({
        where: { id: share.templateId }
    })
    
    res.json({
        id: template.id,
        name: template.name,
        description: template.description,
        templateType: template.templateType,
        format: template.format,
        config: JSON.parse(template.config),
        thumbnail: template.thumbnail
    })
}))

/**
 * POST /api/library/templates/import/:code
 * Importe un template partagé
 */
router.post('/templates/import/:code', requireAuth, asyncHandler(async (req, res) => {
    const share = await prisma.templateShare.findUnique({
        where: { shareCode: req.params.code }
    })
    
    if (!share || !share.isActive) {
        return res.status(404).json({ error: 'invalid_code' })
    }
    
    const original = await prisma.savedTemplate.findUnique({
        where: { id: share.templateId }
    })
    
    // Dupliquer le template
    const imported = await prisma.savedTemplate.create({
        data: {
            userId: req.user.id,
            name: req.body.name || `${original.name} (importé)`,
            description: original.description,
            templateType: original.templateType,
            format: original.format,
            config: original.config,
            thumbnail: original.thumbnail,
            tags: original.tags
        }
    })
    
    // Incrémenter compteur
    await prisma.templateShare.update({
        where: { id: share.id },
        data: { usedCount: share.usedCount + 1 }
    })
    
    res.status(201).json(imported)
}))

// ===========================
// STATISTIQUES
// ===========================

/**
 * GET /api/library/stats
 */
router.get('/stats', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id
    
    const [
        reviewsCount,
        reviewsByType,
        templatesCount,
        watermarksCount,
        cultivarsCount,
        exportsCount
    ] = await Promise.all([
        prisma.review.count({ where: { authorId: userId } }),
        prisma.review.groupBy({
            by: ['type'],
            where: { authorId: userId },
            _count: true
        }),
        prisma.savedTemplate.count({ where: { userId } }),
        prisma.watermark.count({ where: { userId } }),
        prisma.cultivar.count({ where: { userId } }),
        prisma.export.count({ where: { userId } })
    ])
    
    const avgRatings = await prisma.review.aggregate({
        where: { authorId: userId },
        _avg: { note: true }
    })
    
    res.json({
        totalReviews: reviewsCount,
        reviewsByType: reviewsByType.reduce((acc, r) => {
            acc[r.type] = r._count
            return acc
        }, {}),
        templatesCount,
        watermarksCount,
        cultivarsCount,
        totalExports: exportsCount,
        avgRatingGiven: avgRatings._avg.note
    })
}))

// ===========================
// BACKUP / RESTORE
// ===========================

/**
 * GET /api/library/backup
 */
router.get('/backup', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user.id
    
    const [reviews, templates, watermarks, cultivars, savedData] = await Promise.all([
        prisma.review.findMany({ where: { authorId: userId } }),
        prisma.savedTemplate.findMany({ where: { userId } }),
        prisma.watermark.findMany({ where: { userId } }),
        prisma.cultivar.findMany({ where: { userId } }),
        prisma.savedData.findMany({ where: { userId } })
    ])
    
    const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        userId,
        data: {
            reviews,
            templates,
            watermarks,
            cultivars,
            savedData
        }
    }
    
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename=library-backup-${Date.now()}.json`)
    res.json(backup)
}))
```

---

### SPRINT 4: Prisma Schema (0.5-1 jour)

#### Jour 8: Migrations

**Tâche 8.1**: Ajouter modèles manquants

```prisma
// server-new/prisma/schema.prisma - Ajouts

model CuringPipeline {
  id            String   @id @default(uuid())
  reviewId      String   @unique
  pipelineType  String   // "heures" | "jours" | "semaines" | "mois"
  startDate     DateTime?
  duration      Int?
  entries       String   // JSON: [{step, temperature, humidity, notes, dateTime}]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  @@map("curing_pipelines")
}

model UsageExperience {
  id                String   @id @default(uuid())
  reviewId          String   @unique
  consumptionMethod String?
  dosageUsed        Float?
  effectsDuration   Int?     // minutes
  effectsProfile    String?  // JSON array
  sideEffects       String?  // JSON array
  effectsOnset      String?
  preferredUsage    String?  // JSON array
  notes             String?
  createdAt         DateTime @default(now())
  
  review Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  @@map("usage_experiences")
}

model LibraryStats {
  id                String   @id @default(uuid())
  userId            String   @unique
  totalReviews      Int      @default(0)
  reviewsByType     String?  // JSON
  totalExports      Int      @default(0)
  cultivarsCount    Int      @default(0)
  templatesCount    Int      @default(0)
  watermarksCount   Int      @default(0)
  avgRatingGiven    Float?
  avgRatingReceived Float?
  lastUpdated       DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("library_stats")
}
```

**Tâche 8.2**: Ajouter relations dans Review

```prisma
model Review {
  // ... champs existants ...
  
  // Ajouter relations
  curingPipeline   CuringPipeline?
  usageExperience  UsageExperience?
}
```

**Tâche 8.3**: Exécuter migrations

```bash
cd server-new
npx prisma migrate dev --name add_library_models
npx prisma generate
```

---

## 📊 RÉCAPITULATIF

| Sprint | Durée | Composants |
|--------|-------|------------|
| Sprint 1 | 4 jours | Frontend Library refonte |
| Sprint 2 | 2 jours | Enrichissement 4 types |
| Sprint 3 | 2 jours | Backend API |
| Sprint 4 | 1 jour | Prisma migrations |
| **Total** | **9 jours** | |

---

## ✅ CRITÈRES DE VALIDATION

### Frontend
- [ ] LibraryPage avec 6 onglets fonctionnels
- [ ] Reviews filtrables par type (Fleur, Hash, Concentré, Comestible)
- [ ] Affichage Grid/List/Timeline
- [ ] Templates avec partage par code
- [ ] Filigranes CRUD complet
- [ ] Stats visibles

### Backend
- [ ] Tous endpoints /api/library/* fonctionnels
- [ ] Partage templates opérationnel
- [ ] Backup/Restore fonctionnel

### 4 Types
- [ ] PipeLine Curing pour Fleur/Hash/Concentré
- [ ] Expérience utilisation pour tous types
- [ ] Champs Comestible complétés

---

**Document créé le 3 février 2026**  
**Prochaine action**: Démarrer Sprint 1, Jour 1
