# 🔄 Guide de Migration - Liquid Glass V3

Guide étape par étape pour migrer les pages existantes vers le nouveau design system Liquid Glass V3.

---

## 📋 Checklist Globale

### Phase 1: Composants de base ✅
- [x] Upgrade Tailwind config (50+ nouvelles utilities)
- [x] Réécriture liquid-glass.css (V2 → V3, +305 lignes)
- [x] Création de 5 nouveaux composants (Select, Slider, MultiSelect, Alert, Badge)
- [x] Système d'export centralisé (liquid/index.js)
- [x] Documentation complète du design system

### Phase 2: Composants manquants ⏳
- [ ] LiquidTextarea (avec auto-resize, character count)
- [ ] LiquidCheckbox (avec état indeterminate)
- [ ] LiquidRadio (avec sélection visuelle)
- [ ] LiquidToggle (switch avec animation slide)
- [ ] Mise à jour LiquidButton (classes V3)
- [ ] Mise à jour LiquidCard (classes V3)
- [ ] Mise à jour LiquidInput (classes V3)

### Phase 3: Pages de reviews 🎯
- [ ] CreateHashReview/index.jsx
- [ ] CreateConcentrateReview/index.jsx
- [ ] CreateEdibleReview/index.jsx
- [ ] Sections partagées (InfosGenerales, etc.)

### Phase 4: Pages principales
- [ ] HomePage
- [ ] LibraryPage
- [ ] GalleryPage
- [ ] ProfilePage
- [ ] SettingsPage

### Phase 5: Finitions
- [ ] Transitions entre pages (Framer Motion)
- [ ] Micro-interactions globales
- [ ] Tests et optimisations
- [ ] Documentation mise à jour

---

## 🔧 Patterns de Migration

### 1. Remplacer les divs avec glassmorphisme basique

**Avant:**
```jsx
<div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
  {/* Contenu */}
</div>
```

**Après:**
```jsx
import { LiquidCard } from '@/components/ui/liquid';

<LiquidCard padding="md" hover>
  {/* Contenu */}
</LiquidCard>
```

---

### 2. Remplacer les inputs standards

**Avant:**
```jsx
<div>
  <label className="block text-sm font-medium mb-2">Nom</label>
  <input 
    type="text"
    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10"
    placeholder="Entrer un nom"
  />
</div>
```

**Après:**
```jsx
import { LiquidInput } from '@/components/ui/liquid';

<LiquidInput
  label="Nom"
  type="text"
  placeholder="Entrer un nom"
/>
```

---

### 3. Remplacer les selects

**Avant:**
```jsx
<select className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10">
  <option value="fleurs">Fleurs</option>
  <option value="hash">Hash</option>
</select>
```

**Après:**
```jsx
import { LiquidSelect } from '@/components/ui/liquid';

<LiquidSelect
  options={[
    { value: 'fleurs', label: 'Fleurs' },
    { value: 'hash', label: 'Hash' }
  ]}
  value={productType}
  onChange={(e) => setProductType(e.target.value)}
/>
```

---

### 4. Remplacer les range sliders

**Avant:**
```jsx
<div>
  <label>Intensité: {value}/10</label>
  <input 
    type="range" 
    min="0" 
    max="10" 
    value={value}
    onChange={(e) => setValue(e.target.value)}
    className="w-full"
  />
</div>
```

**Après:**
```jsx
import { LiquidSlider } from '@/components/ui/liquid';

<LiquidSlider
  label="Intensité"
  min={0}
  max={10}
  value={value}
  onChange={setValue}
  color="purple"
  showValue
  unit="/10"
/>
```

---

### 5. Remplacer les multi-selects/tags

**Avant:**
```jsx
<div>
  <label>Arômes</label>
  <div className="flex flex-wrap gap-2">
    {aromas.map(aroma => (
      <span 
        key={aroma}
        className="px-3 py-1 bg-primary-500/20 rounded-full text-sm"
      >
        {aroma}
        <button onClick={() => removeAroma(aroma)}>×</button>
      </span>
    ))}
  </div>
</div>
```

**Après:**
```jsx
import { LiquidMultiSelect } from '@/components/ui/liquid';

<LiquidMultiSelect
  label="Arômes"
  options={aromaOptions}
  value={selectedAromas}
  onChange={setSelectedAromas}
  maxSelections={7}
/>
```

---

### 6. Remplacer les boutons

**Avant:**
```jsx
<button 
  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg"
  onClick={handleSubmit}
>
  Enregistrer
</button>
```

**Après:**
```jsx
import { LiquidButton } from '@/components/ui/liquid';

<LiquidButton
  variant="primary"
  size="lg"
  onClick={handleSubmit}
>
  Enregistrer
</LiquidButton>
```

---

### 7. Remplacer les alerts/toasts

**Avant:**
```jsx
{showSuccess && (
  <div className="fixed top-4 right-4 bg-green-500/20 p-4 rounded-lg">
    ✅ Succès !
    <button onClick={() => setShowSuccess(false)}>×</button>
  </div>
)}
```

**Après:**
```jsx
import { LiquidAlert } from '@/components/ui/liquid';

{showSuccess && (
  <LiquidAlert
    type="success"
    title="Succès !"
    message="Opération réussie"
    onClose={() => setShowSuccess(false)}
  />
)}
```

---

### 8. Remplacer les badges/status

**Avant:**
```jsx
<span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
  Actif
</span>
```

**Après:**
```jsx
import { LiquidBadge } from '@/components/ui/liquid';

<LiquidBadge variant="success" size="sm">
  Actif
</LiquidBadge>
```

---

## 📄 Migration des Pages

### CreateHashReview/index.jsx

**Étapes:**

1. **Importer les composants Liquid**
```jsx
import {
  LiquidCard,
  LiquidInput,
  LiquidSelect,
  LiquidSlider,
  LiquidMultiSelect,
  LiquidButton,
  LiquidAlert
} from '@/components/ui/liquid';
```

2. **Remplacer le container principal**
```jsx
// Avant
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
  {/* Contenu */}
</div>

// Après
<div className="min-h-screen bg-slate-900 relative">
  {/* Background gradient comme overlay */}
  <div className="fixed inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />
  
  {/* Contenu avec z-index */}
  <div className="relative z-10">
    {/* Sections */}
  </div>
</div>
```

3. **Migrer les sections**
```jsx
// Chaque section devient une LiquidCard
<LiquidCard padding="lg" className="mb-6">
  <h2 className="text-xl font-bold mb-4">Informations générales</h2>
  
  <div className="space-y-4">
    <LiquidInput
      label="Nom commercial"
      placeholder="Ex: Bubble Hash Premium"
      required
    />
    
    <LiquidSelect
      label="Type de hash"
      options={hashTypes}
      required
    />
  </div>
</LiquidCard>
```

4. **Remplacer les sliders de notation**
```jsx
// Section Visuel & Technique
<LiquidCard padding="lg" className="mb-6">
  <h2 className="text-xl font-bold mb-4">👁️ Visuel & Technique</h2>
  
  <div className="space-y-6">
    <LiquidSlider
      label="Couleur / Transparence"
      min={0}
      max={10}
      color="purple"
      showValue
      unit="/10"
    />
    
    <LiquidSlider
      label="Pureté visuelle"
      min={0}
      max={10}
      color="cyan"
      showValue
      unit="/10"
    />
  </div>
</LiquidCard>
```

5. **Migrer les multi-selects (Odeurs, Goûts, Effets)**
```jsx
<LiquidCard padding="lg" className="mb-6">
  <h2 className="text-xl font-bold mb-4">👃 Odeurs</h2>
  
  <div className="space-y-6">
    <LiquidSlider
      label="Fidélité aux cultivars"
      min={0}
      max={10}
      color="green"
      showValue
      unit="/10"
    />
    
    <LiquidMultiSelect
      label="Notes dominantes"
      options={aromas}
      maxSelections={7}
      placeholder="Choisir jusqu'à 7 arômes"
    />
    
    <LiquidMultiSelect
      label="Notes secondaires"
      options={aromas}
      maxSelections={7}
      placeholder="Choisir jusqu'à 7 arômes"
    />
  </div>
</LiquidCard>
```

6. **Boutons d'action**
```jsx
<div className="flex gap-4 justify-end mt-8">
  <LiquidButton
    variant="ghost"
    onClick={handleCancel}
  >
    Annuler
  </LiquidButton>
  
  <LiquidButton
    variant="primary"
    size="lg"
    onClick={handleSave}
    loading={isSaving}
  >
    Enregistrer
  </LiquidButton>
</div>
```

---

### HomePage

**Stratégie:**

1. **Hero section glassmorphique**
```jsx
<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0 bg-gradient-radial from-primary-500/20 via-slate-900 to-slate-900" />
  
  {/* Animated blobs */}
  <motion.div
    className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.5, 0.3]
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
  
  {/* Hero content */}
  <LiquidCard padding="lg" className="max-w-4xl text-center">
    <motion.h1 
      className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      Reviews-Maker
    </motion.h1>
    
    <p className="text-xl text-gray-300 mb-8">
      Créez des reviews professionnelles de cannabis
    </p>
    
    <div className="flex gap-4 justify-center">
      <LiquidButton variant="primary" size="lg">
        Commencer
      </LiquidButton>
      <LiquidButton variant="outline" size="lg">
        En savoir plus
      </LiquidButton>
    </div>
  </LiquidCard>
</section>
```

2. **Features grid**
```jsx
<section className="py-20 px-6">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-12">Fonctionnalités</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, i) => (
        <motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <LiquidCard padding="lg" hover className="h-full">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </LiquidCard>
        </motion.div>
      ))}
    </div>
  </div>
</section>
```

---

### LibraryPage

**Stratégie:**

1. **Header avec filtres**
```jsx
<div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
  <div className="max-w-7xl mx-auto px-6 py-4">
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-3xl font-bold">Ma Bibliothèque</h1>
      
      <LiquidButton variant="primary" leftIcon={<Plus size={20} />}>
        Nouvelle review
      </LiquidButton>
    </div>
    
    <div className="flex gap-4">
      <LiquidInput
        placeholder="Rechercher..."
        leftIcon={<Search size={18} />}
        className="flex-1"
      />
      
      <LiquidSelect
        options={filterOptions}
        placeholder="Filtrer par type"
        className="w-48"
      />
    </div>
  </div>
</div>
```

2. **Grid de reviews**
```jsx
<div className="max-w-7xl mx-auto px-6 py-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {reviews.map((review) => (
      <motion.div
        key={review.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <LiquidCard padding="md" hover className="cursor-pointer">
          {/* Image */}
          <div className="aspect-video bg-gradient-to-br from-primary-500/20 to-cyan-500/20 rounded-lg mb-4" />
          
          {/* Info */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg">{review.name}</h3>
            <LiquidBadge variant="success" size="sm">
              {review.type}
            </LiquidBadge>
          </div>
          
          <p className="text-gray-400 text-sm mb-4">{review.cultivar}</p>
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>👁️ {review.views}</span>
            <span>❤️ {review.likes}</span>
            <span>💬 {review.comments}</span>
          </div>
        </LiquidCard>
      </motion.div>
    ))}
  </div>
</div>
```

---

### GalleryPage

**Stratégie:**

1. **Masonry layout avec Liquid Cards**
```jsx
import Masonry from 'react-masonry-css';

<Masonry
  breakpointCols={{ default: 4, 1536: 3, 1024: 2, 640: 1 }}
  className="flex gap-6 px-6"
  columnClassName="flex flex-col gap-6"
>
  {reviews.map((review) => (
    <LiquidCard 
      key={review.id} 
      padding="none" 
      hover 
      className="overflow-hidden"
    >
      <img 
        src={review.image} 
        alt={review.name}
        className="w-full h-auto"
      />
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <img 
            src={review.author.avatar} 
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm text-gray-400">
            {review.author.name}
          </span>
        </div>
        
        <h3 className="font-semibold mb-2">{review.name}</h3>
        
        <div className="flex gap-2">
          <LiquidBadge variant="primary" size="sm">
            {review.type}
          </LiquidBadge>
          <LiquidBadge variant="default" size="sm">
            {review.rating}/10
          </LiquidBadge>
        </div>
      </div>
    </LiquidCard>
  ))}
</Masonry>
```

---

## 🎨 Patterns d'Animation

### Page transitions
```jsx
// App.jsx ou Router
import { AnimatePresence, motion } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <Routes location={location}>
      {/* Routes */}
    </Routes>
  </motion.div>
</AnimatePresence>
```

### Scroll-triggered animations
```jsx
import { useInView } from 'framer-motion';

function Section({ children }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.section>
  );
}
```

### Stagger animations (lists)
```jsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      <LiquidCard>
        {/* Content */}
      </LiquidCard>
    </motion.div>
  ))}
</motion.div>
```

---

## ⚡ Optimisations

### Lazy loading des composants
```jsx
import { lazy, Suspense } from 'react';
import { LiquidCard } from '@/components/ui/liquid';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={
  <LiquidCard padding="lg" className="animate-pulse">
    <div className="h-64 bg-white/5 rounded" />
  </LiquidCard>
}>
  <HeavyComponent />
</Suspense>
```

### Virtualization pour listes longues
```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedReviewList({ reviews }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: reviews.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5
  });
  
  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <LiquidCard padding="md" hover>
              {/* Review content */}
            </LiquidCard>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Checklist par Page

### CreateHashReview
- [ ] Importer composants Liquid
- [ ] Remplacer container principal
- [ ] Migrer section Infos Générales (Input, Select)
- [ ] Migrer section Pipeline (conserve le custom)
- [ ] Migrer section Visuel & Technique (Sliders)
- [ ] Migrer section Odeurs (Sliders + MultiSelect)
- [ ] Migrer section Texture (Sliders)
- [ ] Migrer section Goûts (Sliders + MultiSelect)
- [ ] Migrer section Effets (Sliders + MultiSelect)
- [ ] Migrer boutons d'action
- [ ] Ajouter alerts succès/erreur
- [ ] Tester formulaire complet

### CreateConcentrateReview
- [ ] Même checklist que Hash
- [ ] Adapter les options spécifiques aux concentrés

### CreateEdibleReview
- [ ] Même checklist que Hash
- [ ] Adapter la section recette/ingrédients

### HomePage
- [ ] Hero section glassmorphique
- [ ] Features grid avec LiquidCard
- [ ] CTA section
- [ ] Footer

### LibraryPage
- [ ] Header sticky avec filtres
- [ ] Grid de reviews avec LiquidCard
- [ ] Empty state si aucune review
- [ ] Pagination ou infinite scroll

### GalleryPage
- [ ] Masonry layout
- [ ] Filtres avancés
- [ ] Modal détails review
- [ ] Interactions (like, comment)

### ProfilePage
- [ ] Header avec avatar
- [ ] Stats cards glassmorphiques
- [ ] Reviews grid
- [ ] Settings button

---

## 🚀 Ordre de Migration Recommandé

1. **Jour 1: Composants manquants**
   - Créer LiquidTextarea, Checkbox, Radio, Toggle
   - Mettre à jour les composants existants (Button, Card, Input)
   - Tester tous les composants

2. **Jour 2: Review pages**
   - Migrer CreateHashReview (template de référence)
   - Appliquer le même pattern à Concentrate et Edible
   - Tester tous les formulaires

3. **Jour 3: Main pages**
   - Migrer HomePage
   - Migrer LibraryPage
   - Migrer GalleryPage

4. **Jour 4: Finitions**
   - Migrer ProfilePage et SettingsPage
   - Ajouter transitions entre pages
   - Micro-interactions globales

5. **Jour 5: Tests & polish**
   - Tests d'intégration
   - Optimisations performances
   - Documentation finale

---

## 📝 Notes Importantes

### À conserver
- ❗ Ne pas toucher aux sections Pipeline custom (déjà complexes)
- ❗ Conserver la logique métier existante
- ❗ Garder les validations de formulaires
- ❗ Ne pas modifier les API calls

### À améliorer
- ✨ Remplacer tous les inputs par composants Liquid
- ✨ Uniformiser les espacements (space-y-4, space-y-6)
- ✨ Ajouter des animations de chargement
- ✨ Améliorer les messages d'erreur avec LiquidAlert
- ✨ Ajouter des tooltips avec infos contextuelles

### À tester
- 🧪 Formulaires: validation, soumission, erreurs
- 🧪 Navigation: transitions, back button
- 🧪 Responsive: mobile, tablette, desktop
- 🧪 Dark mode: tous les composants
- 🧪 Accessibilité: keyboard, screen readers
- 🧪 Performance: Lighthouse, bundle size

---

**Prochaine étape:** Créer les 4 composants manquants (Textarea, Checkbox, Radio, Toggle) puis commencer la migration des pages de reviews.
