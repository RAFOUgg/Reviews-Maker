# 📗 BIBLIOTHÈQUE (LIBRARY) IMPLEMENTATION GUIDE

**Durée**: 16 heures (Fleurs complete, scaffold pour autres)  
**Scope**: Reviews saved + Tech sheets + Saved data + Presets + Watermarks + Company  
**Pour**: Réutiliser configs, données, templates, organiser sa bibliothèque

---

## 🎯 ARCHITECTURE GLOBALE

```
LIBRARY PAGE
│
├─ Sidebar (navigation)
│  ├─ My Reviews (browse/search)
│  ├─ Technical Sheets (templates)
│  ├─ Saved Data (auto-complete values)
│  ├─ Export Presets (configurations)
│  ├─ Watermarks (custom)
│  └─ Company (Producteur only)
│
└─ Main Panel
   ├─ REVIEWS section (grid/list)
   │  ├─ Search/filter
   │  ├─ Bulk operations
   │  ├─ Preview
   │  └─ Open to edit
   │
   ├─ TECH SHEETS section (cards)
   │  ├─ Create new
   │  ├─ Import to review
   │  └─ Clone/share
   │
   ├─ SAVED DATA section (tables)
   │  ├─ Grow rooms
   │  ├─ Fertilizers
   │  ├─ Light configs
   │  └─ Add/edit/delete
   │
   ├─ PRESETS section (cards)
   │  ├─ Create config
   │  ├─ Apply to export
   │  ├─ Clone/share
   │  └─ Delete
   │
   ├─ WATERMARKS section (upload)
   │  ├─ Upload image
   │  ├─ Preview
   │  ├─ Opacity/Position
   │  └─ Delete
   │
   └─ COMPANY section (Producteur)
      ├─ Company info
      ├─ Legal entity
      └─ KYC documents
```

---

## 📋 DATABASE SCHEMA (Prisma)

```prisma
// ============================================================================
// SAVED REVIEWS
// ============================================================================
model SavedReview {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  reviewId          String?     // Reference to actual review (if saved from review)
  review            Review?     @relation(fields: [reviewId], references: [id])
  
  // Metadata
  name              String      @db.VarChar(255)
  description       String?     @db.Text
  productType       String      // 'flower', 'hash', 'concentrate', 'edible'
  
  // Organization
  tags              String[]    @default([])
  folderId          String?     // Nested in folder
  folder            Folder?     @relation(fields: [folderId], references: [id])
  
  isFavorite        Boolean     @default(false)
  isPinned          Boolean     @default(false)
  
  // Snapshot data (for library copy)
  snapshotData      Json?       // Full review data at save time
  
  // Timestamps
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
  @@index([folderId])
  @@fulltext([name, description])
}

// ============================================================================
// FOLDERS (for organizing reviews)
// ============================================================================
model Folder {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  name              String      @db.VarChar(255)
  parentId          String?     // Nested folders
  parent            Folder?     @relation("FolderParent", fields: [parentId], references: [id])
  children          Folder[]    @relation("FolderParent")
  
  reviews           SavedReview[]
  
  createdAt         DateTime    @default(now())
  
  @@index([userId])
  @@index([parentId])
}

// ============================================================================
// TECHNICAL SHEETS (reusable configurations)
// ============================================================================
model TechnicalSheet {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  name              String      @db.VarChar(255)
  description       String?     @db.Text
  productType       String      // 'flower', 'hash', 'concentrate', 'edible'
  
  // Sheet data (full config)
  sheetData         Json        // {section1Data, section2Data, ...}
  
  // Metadata
  tags              String[]    @default([])
  isFavorite        Boolean     @default(false)
  isPublic          Boolean     @default(false)
  
  // Version tracking
  version           Int         @default(1)
  versionHistory    Json?       // [{version, changedAt, changes}]
  
  // Usage stats
  timesUsed         Int         @default(0)
  lastUsedAt        DateTime?
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
  @@index([productType])
  @@fulltext([name, description])
}

// ============================================================================
// SAVED DATA (auto-complete values)
// ============================================================================
model SavedDataItem {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  // Item type
  itemType          String      // 'growRoom', 'fertilizer', 'lightConfig', 'strain', etc.
  category          String      // grouping (e.g., 'fertilizer' category = 'Biobizz')
  
  // Data
  name              String      @db.VarChar(255)
  data              Json        // Full config object
  
  // Usage
  usageCount        Int         @default(0)
  lastUsedAt        DateTime?
  
  // Metadata
  tags              String[]    @default([])
  isFavorite        Boolean     @default(false)
  
  createdAt         DateTime    @default(now())
  
  @@index([userId])
  @@index([itemType])
  @@unique([userId, itemType, name])
}

// ============================================================================
// EXPORT PRESETS (save export configurations)
// ============================================================================
model ExportPreset {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  name              String      @db.VarChar(255)
  description       String?
  
  // Preset config
  template          String      // 'compact', 'detailed', 'complete', 'custom'
  format            String      // 'png', 'jpg', 'pdf', 'svg', 'csv', 'json'
  pageSize          String      // 'A4', '1:1', '16:9', '9:16'
  
  // Customization
  theme             String      // 'light', 'dark'
  colors            Json        // {primary, secondary, text, bg}
  typography        Json        // {font, size, weight}
  layout            Json?       // Custom layout for premium
  
  // Advanced
  watermarkId       String?
  watermark         Watermark?  @relation(fields: [watermarkId], references: [id])
  
  // Metadata
  isDefault         Boolean     @default(false)
  isFavorite        Boolean     @default(false)
  timesUsed         Int         @default(0)
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
}

// ============================================================================
// WATERMARKS
// ============================================================================
model Watermark {
  id                String      @id @default(cuid())
  userId            String
  user              User        @relation(fields: [userId], references: [id])
  
  name              String      @db.VarChar(255)
  
  // Image data
  imageUrl          String      // URL to uploaded watermark
  imagePath         String      // Local path in storage
  
  // Settings
  opacity           Float       @default(0.5) // 0-1
  position          String      @default('bottom-right') // top-left, center, etc.
  scale             Float       @default(1.0) // 0.5-2.0
  
  // Usage
  timesUsed         Int         @default(0)
  presets           ExportPreset[]
  
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  
  @@index([userId])
}

// ============================================================================
// COMPANY DATA (Producteur)
// ============================================================================
model CompanyData {
  id                String      @id @default(cuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id])
  
  // Business info
  companyName       String      @db.VarChar(255)
  businessType      String      // 'sole_proprietor', 'llc', 'corp', etc.
  
  // Contact
  email             String      @db.VarChar(255)
  phone             String?
  website           String?
  
  // Address
  street            String?
  city              String?
  province          String?
  zipCode           String?
  country           String?
  
  // Legal
  businessNumber    String?     // Registration number
  taxId             String?     // VAT/Tax ID
  
  // Banking
  bankName          String?
  accountName       String?
  accountNumber     String? @db.Text // encrypted
  routingNumber     String?     // For US
  iban              String?     // For EU
  
  // KYC documents
  kycDocuments      KYCDocument[]
  
  updatedAt         DateTime    @updatedAt
}

// ============================================================================
// KYC DOCUMENTS
// ============================================================================
model KYCDocument {
  id                String      @id @default(cuid())
  companyId         String
  company           CompanyData @relation(fields: [companyId], references: [id])
  
  documentType      String      // 'id_proof', 'address_proof', 'business_license'
  fileName          String      @db.VarChar(255)
  fileUrl           String
  fileSize          Int
  
  status            String      @default('pending') // pending, approved, rejected
  notes             String?     @db.Text
  
  uploadedAt        DateTime    @default(now())
  approvedAt        DateTime?
}

// Add to User model:
// savedReviews     SavedReview[]
// folders          Folder[]
// technicalSheets  TechnicalSheet[]
// savedData        SavedDataItem[]
// exportPresets    ExportPreset[]
// watermarks       Watermark[]
// companyData      CompanyData?
```

---

## 🎨 FRONTEND COMPONENTS

### 1. **LibraryPage.jsx** (400 lines)
```javascript
// Main library container - tabs/sections

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReviewsLibrary from './sections/ReviewsLibrary';
import TechnicalSheets from './sections/TechnicalSheets';
import SavedDataManager from './sections/SavedDataManager';
import ExportPresetsManager from './sections/ExportPresetsManager';
import WatermarkManager from './sections/WatermarkManager';
import CompanyManager from './sections/CompanyManager';
import { useAccountFeatures } from '../../hooks/useAccountFeatures';

export default function LibraryPage() {
  const [activeSection, setActiveSection] = useState('reviews');
  const { canAccessLibrary, canEditCompanyData } = useAccountFeatures();
  
  if (!canAccessLibrary) {
    return <UpgradePrompt feature="Library" />;
  }
  
  const sections = [
    { id: 'reviews', label: '📋 Mes Reviews', icon: '📋' },
    { id: 'sheets', label: '📄 Fiches Techniques', icon: '📄' },
    { id: 'savedData', label: '💾 Données Sauvegardées', icon: '💾' },
    { id: 'presets', label: '🎨 Configurations Export', icon: '🎨' },
    { id: 'watermarks', label: '🌊 Filigranes', icon: '🌊' },
    ...(canEditCompanyData ? [{ id: 'company', label: '🏢 Entreprise', icon: '🏢' }] : []),
  ];
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">📚 Ma Bibliothèque</h1>
          <p className="text-neutral-600">Organisez et réutilisez vos configurations</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  px-4 py-3 font-medium text-sm whitespace-nowrap
                  border-b-2 transition-colors
                  ${activeSection === section.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }
                `}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === 'reviews' && <ReviewsLibrary />}
            {activeSection === 'sheets' && <TechnicalSheets />}
            {activeSection === 'savedData' && <SavedDataManager />}
            {activeSection === 'presets' && <ExportPresetsManager />}
            {activeSection === 'watermarks' && <WatermarkManager />}
            {activeSection === 'company' && <CompanyManager />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

### 2. **ReviewsLibrary.jsx** (300 lines)
```javascript
// Browse/search/organize saved reviews

import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export default function ReviewsLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  
  // Fetch reviews
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['library', 'reviews', { search: searchTerm, type: filterType }],
    queryFn: () => fetch(
      `/api/library/reviews?search=${searchTerm}&type=${filterType}`
    ).then(r => r.json()),
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId) => fetch(`/api/library/reviews/${reviewId}`, {
      method: 'DELETE',
    }).then(r => r.json()),
    onSuccess: () => {
      // Refetch
    },
  });
  
  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Chercher une review..."
          className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
        />
        
        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg"
          >
            <option value="all">Tous les types</option>
            <option value="flower">Fleurs</option>
            <option value="hash">Hash</option>
            <option value="concentrate">Concentré</option>
            <option value="edible">Comestible</option>
          </select>
          
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 border rounded-lg ${
                viewMode === 'grid' ? 'bg-green-100 border-green-500' : ''
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 border rounded-lg ${
                viewMode === 'list' ? 'bg-green-100 border-green-500' : ''
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>
      
      {/* Grid/List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : reviews?.length === 0 ? (
        <EmptyState message="Aucune review sauvegardée" />
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-2'
        }>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={() => deleteMutation.mutate(review.id)}
              isCompact={viewMode === 'list'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ReviewCard component
function ReviewCard({ review, onDelete, isCompact }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{review.name}</h3>
          <p className="text-sm text-neutral-600">{review.productType}</p>
          {review.description && (
            <p className="text-sm text-neutral-600 mt-1">{review.description}</p>
          )}
        </div>
        <span className="px-2 py-1 bg-neutral-100 text-xs rounded">
          {review.productType}
        </span>
      </div>
      
      {/* Tags */}
      {review.tags?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {review.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
          Ouvrir
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
        >
          Suppr.
        </button>
      </div>
    </div>
  );
}
```

### 3. **TechnicalSheets.jsx** (250 lines)
```javascript
// Reusable technical sheet templates

import { useQuery } from '@tanstack/react-query';

export default function TechnicalSheets() {
  const [productType, setProductType] = useState('flower');
  
  const { data: sheets } = useQuery({
    queryKey: ['library', 'sheets', productType],
    queryFn: () => fetch(
      `/api/library/sheets?productType=${productType}`
    ).then(r => r.json()),
  });
  
  return (
    <div>
      {/* Product type filter */}
      <div className="flex gap-2 mb-6">
        {['flower', 'hash', 'concentrate', 'edible'].map((type) => (
          <button
            key={type}
            onClick={() => setProductType(type)}
            className={`px-4 py-2 rounded-lg border ${
              productType === type
                ? 'bg-green-100 border-green-500'
                : 'bg-white border-neutral-300'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      {/* New sheet button */}
      <button className="mb-6 px-4 py-2 bg-green-500 text-white rounded-lg">
        + Créer une fiche technique
      </button>
      
      {/* Sheets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheets?.map((sheet) => (
          <SheetCard key={sheet.id} sheet={sheet} />
        ))}
      </div>
    </div>
  );
}

function SheetCard({ sheet }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-4">
      <h3 className="font-semibold">{sheet.name}</h3>
      <p className="text-sm text-neutral-600">{sheet.description}</p>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">
          Importer
        </button>
        <button className="px-3 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm">
          Cloner
        </button>
      </div>
    </div>
  );
}
```

### 4. **SavedDataManager.jsx** (200 lines)
```javascript
// Manage frequently used values (grow rooms, fertilizers, etc)

export default function SavedDataManager() {
  const [dataType, setDataType] = useState('growRoom');
  
  const dataTypes = [
    { id: 'growRoom', label: '🏠 Espaces de culture' },
    { id: 'fertilizer', label: '🌱 Engrais' },
    { id: 'lightConfig', label: '💡 Configurations lumière' },
    { id: 'strain', label: '🌿 Souches' },
  ];
  
  const { data: items } = useQuery({
    queryKey: ['library', 'savedData', dataType],
    queryFn: () => fetch(`/api/library/saved-data?type=${dataType}`).then(r => r.json()),
  });
  
  return (
    <div>
      {/* Type selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {dataTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setDataType(type.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              dataType === type.id
                ? 'bg-green-100 border-green-500'
                : 'bg-white border border-neutral-300'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>
      
      {/* New item button */}
      <button className="mb-6 px-4 py-2 bg-green-500 text-white rounded-lg">
        + Ajouter {dataTypes.find(t => t.id === dataType)?.label}
      </button>
      
      {/* Items table */}
      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">Nom</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Catégorie</th>
              <th className="px-4 py-2 text-left text-sm font-semibold">Utilisations</th>
              <th className="px-4 py-2 text-right text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item) => (
              <tr key={item.id} className="border-b hover:bg-neutral-50">
                <td className="px-4 py-2">{item.name}</td>
                <td className="px-4 py-2 text-sm text-neutral-600">{item.category}</td>
                <td className="px-4 py-2 text-sm text-neutral-600">{item.usageCount}</td>
                <td className="px-4 py-2 text-right space-x-2">
                  <button className="text-sm text-blue-600 hover:underline">Edit</button>
                  <button className="text-sm text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 5. **ExportPresetsManager.jsx** (200 lines)
```javascript
// Manage export presets

export default function ExportPresetsManager() {
  const { data: presets } = useQuery({
    queryKey: ['library', 'presets'],
    queryFn: () => fetch('/api/library/presets').then(r => r.json()),
  });
  
  return (
    <div>
      {/* New preset button */}
      <button className="mb-6 px-4 py-2 bg-green-500 text-white rounded-lg">
        + Créer une configuration
      </button>
      
      {/* Presets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets?.map((preset) => (
          <div key={preset.id} className="bg-white border border-neutral-200 rounded-lg p-4">
            <h3 className="font-semibold">{preset.name}</h3>
            <div className="text-sm text-neutral-600 space-y-1 mt-2">
              <div>Template: {preset.template}</div>
              <div>Format: {preset.format}</div>
              <div>Utilisée {preset.timesUsed}x</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">
                Utiliser
              </button>
              <button className="px-3 py-2 bg-neutral-100 text-neutral-600 rounded-lg text-sm">
                ...
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. **WatermarkManager.jsx** (150 lines)
```javascript
// Upload and manage custom watermarks

export default function WatermarkManager() {
  const { data: watermarks } = useQuery({
    queryKey: ['library', 'watermarks'],
    queryFn: () => fetch('/api/library/watermarks').then(r => r.json()),
  });
  
  return (
    <div>
      {/* Upload section */}
      <div className="bg-white border border-dashed border-neutral-300 rounded-lg p-8 mb-6 text-center">
        <input type="file" accept="image/*" className="hidden" id="watermark-upload" />
        <label
          htmlFor="watermark-upload"
          className="cursor-pointer"
        >
          <div className="text-4xl mb-2">🖼️</div>
          <p className="font-semibold mb-1">Uploader un filigrane</p>
          <p className="text-sm text-neutral-600">PNG, JPG, GIF (transparent supporté)</p>
        </label>
      </div>
      
      {/* Watermarks list */}
      <div className="space-y-4">
        {watermarks?.map((wm) => (
          <div key={wm.id} className="bg-white border border-neutral-200 rounded-lg p-4">
            <div className="flex gap-4">
              <img src={wm.imageUrl} alt={wm.name} className="w-20 h-20 object-contain" />
              <div className="flex-1">
                <h3 className="font-semibold">{wm.name}</h3>
                <div className="text-sm text-neutral-600 mt-2">
                  <p>Opacité: {Math.round(wm.opacity * 100)}%</p>
                  <p>Position: {wm.position}</p>
                  <p>Utilisé {wm.timesUsed}x</p>
                </div>
              </div>
              <button className="text-red-600 hover:text-red-700">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 7. **CompanyManager.jsx** (150 lines - Producteur only)
```javascript
// Manage company profile, banking, KYC

export default function CompanyManager() {
  const { data: company, isLoading } = useQuery({
    queryKey: ['library', 'company'],
    queryFn: () => fetch('/api/library/company').then(r => r.json()),
  });
  
  const [formData, setFormData] = useState(company || {});
  const saveMutation = useMutation({
    mutationFn: (data) => fetch('/api/library/company', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(r => r.json()),
  });
  
  return (
    <div className="max-w-2xl">
      <form onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
      }}>
        {/* Business Info */}
        <fieldset className="mb-6 p-4 bg-white border border-neutral-200 rounded-lg">
          <legend className="font-semibold mb-4">Informations Entreprise</legend>
          <div className="space-y-4">
            <FormField label="Nom Entreprise">
              <input value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
            </FormField>
            <FormField label="Type de Société">
              <select value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})}>
                <option>Choisir...</option>
                <option value="sole_proprietor">Auto-Entreprise</option>
                <option value="llc">SARL</option>
                <option value="corp">SAISON</option>
              </select>
            </FormField>
          </div>
        </fieldset>
        
        {/* Banking */}
        <fieldset className="mb-6 p-4 bg-white border border-neutral-200 rounded-lg">
          <legend className="font-semibold mb-4">Informations Bancaires</legend>
          <div className="space-y-4">
            <FormField label="IBAN">
              <input value={formData.iban} onChange={(e) => setFormData({...formData, iban: e.target.value})} />
            </FormField>
            <FormField label="Nom Bénéficiaire">
              <input value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} />
            </FormField>
          </div>
        </fieldset>
        
        {/* KYC Documents */}
        <fieldset className="mb-6 p-4 bg-white border border-neutral-200 rounded-lg">
          <legend className="font-semibold mb-4">Documents KYC</legend>
          <div className="space-y-4">
            {/* Document upload inputs */}
          </div>
        </fieldset>
        
        <button type="submit" className="w-full px-4 py-2 bg-green-500 text-white rounded-lg">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
```

---

## 🔧 BACKEND ROUTES

### `server-new/routes/library.js` (500 lines)

```javascript
import express from 'express';
import { prisma } from '../db.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// REVIEWS
// ============================================================================

// GET /api/library/reviews
router.get('/reviews', authenticateUser, async (req, res) => {
  const { search, type } = req.query;
  const reviews = await prisma.savedReview.findMany({
    where: {
      userId: req.user.id,
      ...(search && { name: { contains: search } }),
      ...(type !== 'all' && { productType: type }),
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(reviews);
});

// POST /api/library/reviews (save new review)
router.post('/reviews', authenticateUser, async (req, res) => {
  const { reviewId, name, productType } = req.body;
  const review = await prisma.savedReview.create({
    data: {
      userId: req.user.id,
      reviewId,
      name,
      productType,
      snapshotData: req.body.data,
    },
  });
  res.json(review);
});

// DELETE /api/library/reviews/:id
router.delete('/reviews/:id', authenticateUser, async (req, res) => {
  await prisma.savedReview.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// ============================================================================
// TECHNICAL SHEETS
// ============================================================================

// GET /api/library/sheets
router.get('/sheets', authenticateUser, async (req, res) => {
  const { productType } = req.query;
  const sheets = await prisma.technicalSheet.findMany({
    where: {
      userId: req.user.id,
      ...(productType && { productType }),
    },
  });
  res.json(sheets);
});

// POST /api/library/sheets
router.post('/sheets', authenticateUser, async (req, res) => {
  const sheet = await prisma.technicalSheet.create({
    data: {
      userId: req.user.id,
      ...req.body,
    },
  });
  res.json(sheet);
});

// ============================================================================
// SAVED DATA
// ============================================================================

// GET /api/library/saved-data
router.get('/saved-data', authenticateUser, async (req, res) => {
  const { type } = req.query;
  const items = await prisma.savedDataItem.findMany({
    where: {
      userId: req.user.id,
      itemType: type,
    },
    orderBy: { usageCount: 'desc' },
  });
  res.json(items);
});

// POST /api/library/saved-data
router.post('/saved-data', authenticateUser, async (req, res) => {
  const item = await prisma.savedDataItem.create({
    data: {
      userId: req.user.id,
      ...req.body,
    },
  });
  res.json(item);
});

// ============================================================================
// EXPORT PRESETS
// ============================================================================

// GET /api/library/presets
router.get('/presets', authenticateUser, async (req, res) => {
  const presets = await prisma.exportPreset.findMany({
    where: { userId: req.user.id },
    orderBy: { timesUsed: 'desc' },
  });
  res.json(presets);
});

// POST /api/library/presets
router.post('/presets', authenticateUser, async (req, res) => {
  const preset = await prisma.exportPreset.create({
    data: {
      userId: req.user.id,
      ...req.body,
    },
  });
  res.json(preset);
});

// ============================================================================
// WATERMARKS
// ============================================================================

// GET /api/library/watermarks
router.get('/watermarks', authenticateUser, async (req, res) => {
  const watermarks = await prisma.watermark.findMany({
    where: { userId: req.user.id },
  });
  res.json(watermarks);
});

// POST /api/library/watermarks (file upload)
router.post('/watermarks', authenticateUser, async (req, res) => {
  // Handle file upload with multer
  const watermark = await prisma.watermark.create({
    data: {
      userId: req.user.id,
      name: req.body.name,
      imageUrl: req.body.imageUrl,
      imagePath: req.file.path,
    },
  });
  res.json(watermark);
});

// ============================================================================
// COMPANY
// ============================================================================

// GET /api/library/company
router.get('/company', authenticateUser, async (req, res) => {
  const company = await prisma.companyData.findUnique({
    where: { userId: req.user.id },
    include: { kycDocuments: true },
  });
  res.json(company);
});

// POST /api/library/company
router.post('/company', authenticateUser, async (req, res) => {
  const company = await prisma.companyData.upsert({
    where: { userId: req.user.id },
    create: { userId: req.user.id, ...req.body },
    update: req.body,
  });
  res.json(company);
});

export default router;
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Database & Prisma (2h)
- [ ] Create all models in schema
- [ ] Run migration
- [ ] Test queries

### Phase 2: Library UI (8h)
- [ ] LibraryPage.jsx
- [ ] ReviewsLibrary.jsx
- [ ] TechnicalSheets.jsx
- [ ] SavedDataManager.jsx
- [ ] ExportPresetsManager.jsx
- [ ] WatermarkManager.jsx
- [ ] CompanyManager.jsx (Producteur)

### Phase 3: Backend Routes (4h)
- [ ] library.js with all endpoints
- [ ] File upload handling
- [ ] Permissions checks

### Phase 4: Integration (2h)
- [ ] Link to Phenohunt
- [ ] Save phenotypes to Library
- [ ] Quick-import to reviews
- [ ] Auto-complete in forms

---

**Total**: 16 hours  
**Status**: Ready for Phase 1 execution

