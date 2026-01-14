# ⚛️ Frontend React - Architecture & Guide Développement

## 📋 Vue d'Ensemble

Documentation exhaustive de l'architecture frontend Vite + React + Zustand.

**Stack:**
- **Build:** Vite 4+
- **Framework:** React 18+
- **State Management:** Zustand
- **Routing:** React Router v6
- **Styling:** TailwindCSS + PostCSS
- **Internationalization:** i18next
- **Charts:** Chart.js / Recharts
- **Export:** html-to-image, jspdf, jszip

---

## 🗂️ Structure des Dossiers

```
client/
├── src/
│   ├── App.jsx                      # Root component
│   ├── main.jsx                     # Entry point
│   ├── index.css                    # Global styles
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── Button.jsx
│   │   │   └── Modal.jsx
│   │   │
│   │   ├── forms/
│   │   │   ├── ReviewForm.jsx       # Form principale création
│   │   │   ├── GeneralInfoSection.jsx
│   │   │   ├── GeneticsSection.jsx
│   │   │   ├── VisualsSection.jsx
│   │   │   ├── AromasSection.jsx
│   │   │   ├── TastesSection.jsx
│   │   │   ├── EffectsSection.jsx
│   │   │   ├── TextureSection.jsx
│   │   │   └── MultiSelectField.jsx
│   │   │
│   │   ├── pipelines/
│   │   │   ├── PipelineGitHubGrid.jsx        # Timeline visualisation
│   │   │   ├── PipelineStageEditor.jsx
│   │   │   ├── CultivationPipelineForm.jsx
│   │   │   ├── CuringPipelineForm.jsx
│   │   │   ├── SeparationPipelineForm.jsx
│   │   │   ├── ExtractionPipelineForm.jsx
│   │   │   └── RecipePipelineForm.jsx
│   │   │
│   │   ├── export/
│   │   │   ├── ExportMaker.jsx               # Main export builder
│   │   │   ├── ExportTemplateSelector.jsx
│   │   │   ├── ExportPreview.jsx
│   │   │   ├── ExportCustomizer.jsx
│   │   │   ├── ColorPicker.jsx
│   │   │   ├── WatermarkConfig.jsx
│   │   │   └── SocialShareDialog.jsx
│   │   │
│   │   ├── genetics/
│   │   │   ├── GeneticsCanvas.jsx            # Genealogy visualization
│   │   │   ├── CultivarLibrary.jsx
│   │   │   ├── PhenoHuntProjects.jsx
│   │   │   └── GenealogicalTree.jsx
│   │   │
│   │   ├── legal/
│   │   │   ├── AgeVerification.jsx
│   │   │   ├── KYCUpload.jsx
│   │   │   └── TermsAndConditions.jsx
│   │   │
│   │   └── gallery/
│   │       ├── PublicGallery.jsx
│   │       ├── ReviewCard.jsx
│   │       ├── GalleryFilters.jsx
│   │       └── ReviewDetail.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Dashboard.jsx
│   │   ├── ReviewForm.jsx             # Route wrapper
│   │   ├── ReviewEdit.jsx
│   │   ├── ExportPage.jsx
│   │   ├── Gallery.jsx
│   │   ├── Library.jsx
│   │   ├── Profile.jsx
│   │   ├── Settings.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Onboarding.jsx
│   │   └── NotFound.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth hook
│   │   ├── useReview.ts             # Review management
│   │   ├── useExport.ts             # Export logic
│   │   ├── usePipeline.ts
│   │   ├── useGallery.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── store/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── reviewStore.ts           # Reviews state
│   │   ├── exportStore.ts           # Export configuration
│   │   ├── galleryStore.ts
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   │
│   ├── services/
│   │   ├── api.ts                   # HTTP client
│   │   ├── authService.ts
│   │   ├── reviewService.ts
│   │   ├── exportService.ts
│   │   └── pipelineService.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts            # Format numbers, dates
│   │   ├── validators.ts            # Input validation
│   │   ├── featureFlags.ts          # Tier-based features
│   │   ├── constants.ts             # App constants
│   │   ├── colorScales.ts           # Color palettes
│   │   └── localStorage.ts          # Storage helpers
│   │
│   ├── types/
│   │   ├── index.ts                 # TypeScript types
│   │   ├── review.ts
│   │   ├── user.ts
│   │   ├── pipeline.ts
│   │   └── export.ts
│   │
│   ├── config/
│   │   └── constants.ts
│   │
│   ├── i18n/
│   │   ├── index.ts
│   │   ├── locales/
│   │   │   ├── fr.json
│   │   │   └── en.json
│   │   └── config.ts
│   │
│   ├── data/
│   │   ├── aromas.json              # Linked to root /data
│   │   ├── effects.json
│   │   ├── tastes.json
│   │   └── terpenes.json
│   │
│   └── examples/
│       └── exampleReviews.ts         # Example data pour dev
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── og-image.png
│
├── index.html                        # Vite entry HTML
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── .env.example
```

---

## ⚙️ Configuration Vite

**File:** `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          // Optimize bundle splits
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['zustand', 'i18next', 'react-i18next'],
          'vendor-chart': ['recharts', 'chart.js'],
          'vendor-export': ['html-to-image', 'jspdf', 'jszip']
        }
      }
    },
    
    sourcemap: process.env.NODE_ENV === 'development',
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 500
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@store': path.resolve(__dirname, './src/store'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@data': path.resolve(__dirname, '../data')
    }
  }
});
```

---

## 🔄 State Management (Zustand)

### AuthStore

**File:** `src/store/authStore.ts`

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  
  // Selectors
  getTier: () => Tier;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post('/auth/login', { email, password });
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({
              error: error.message,
              isLoading: false
            });
            throw error;
          }
        },
        
        register: async (email, password, name) => {
          set({ isLoading: true, error: null });
          try {
            const response = await api.post('/auth/register', {
              email,
              password,
              name
            });
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false
            });
          } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
          }
        },
        
        logout: () => {
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        },
        
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token }),
        clearError: () => set({ error: null }),
        
        getTier: () => get().user?.tier || 'AMATEUR',
        isAdmin: () => get().user?.role === 'admin'
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated
        })
      }
    )
  )
);
```

### ReviewStore

```typescript
import { create } from 'zustand';

interface ReviewState {
  reviews: Review[];
  currentReview: Review | null;
  isLoading: boolean;
  
  // Actions
  fetchReviews: (filters?: ReviewFilters) => Promise<void>;
  createReview: (data: CreateReviewInput) => Promise<Review>;
  updateReview: (id: string, data: Partial<Review>) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  setCurrentReview: (review: Review | null) => void;
  
  // Selectors
  getReviewById: (id: string) => Review | undefined;
  getReviewsByType: (type: ReviewType) => Review[];
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  currentReview: null,
  isLoading: false,
  
  fetchReviews: async (filters) => {
    set({ isLoading: true });
    try {
      const response = await reviewService.fetchReviews(filters);
      set({ reviews: response });
    } finally {
      set({ isLoading: false });
    }
  },
  
  createReview: async (data) => {
    const review = await reviewService.create(data);
    set(state => ({
      reviews: [...state.reviews, review]
    }));
    return review;
  },
  
  updateReview: async (id, data) => {
    await reviewService.update(id, data);
    set(state => ({
      reviews: state.reviews.map(r =>
        r.id === id ? { ...r, ...data } : r
      )
    }));
  },
  
  deleteReview: async (id) => {
    await reviewService.delete(id);
    set(state => ({
      reviews: state.reviews.filter(r => r.id !== id)
    }));
  },
  
  setCurrentReview: (review) => set({ currentReview: review }),
  
  getReviewById: (id) => get().reviews.find(r => r.id === id),
  
  getReviewsByType: (type) =>
    get().reviews.filter(r => r.type === type)
}));
```

### ExportStore

```typescript
interface ExportState {
  // Configuration
  selectedTemplate: string;
  format: ExportFormat;
  quality: QualityLevel;
  colors: CustomColors;
  
  // Preview
  previewHtml: string | null;
  isGeneratingPreview: boolean;
  
  // Actions
  setTemplate: (template: string) => void;
  setFormat: (format: ExportFormat) => void;
  setQuality: (quality: QualityLevel) => void;
  setColors: (colors: Partial<CustomColors>) => void;
  generatePreview: (review: Review) => Promise<void>;
  export: (review: Review, outputFormat: string) => Promise<Blob>;
  
  // Selectors
  getConfiguration: () => ExportConfig;
}

export const useExportStore = create<ExportState>((set, get) => ({
  selectedTemplate: 'Compact',
  format: '1:1',
  quality: 'standard',
  colors: { /* default colors */ },
  previewHtml: null,
  isGeneratingPreview: false,
  
  setTemplate: (template) => set({ selectedTemplate: template }),
  setFormat: (format) => set({ format }),
  setQuality: (quality) => set({ quality }),
  
  setColors: (colors) => set(state => ({
    colors: { ...state.colors, ...colors }
  })),
  
  generatePreview: async (review) => {
    set({ isGeneratingPreview: true });
    try {
      const html = await exportService.generatePreview(
        review,
        get().getConfiguration()
      );
      set({ previewHtml: html });
    } finally {
      set({ isGeneratingPreview: false });
    }
  },
  
  export: (review, outputFormat) => {
    return exportService.generateExport(
      review,
      get().getConfiguration(),
      outputFormat
    );
  },
  
  getConfiguration: () => ({
    template: get().selectedTemplate,
    format: get().format,
    quality: get().quality,
    colors: get().colors
  })
}));
```

---

## 🎣 Hooks Personnalisés

### useAuth

```typescript
// src/hooks/useAuth.ts

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register
  } = useAuthStore();
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register,
    isLoading: useAuthStore(s => s.isLoading),
    error: useAuthStore(s => s.error),
    canAccessFeature: (feature: string) => {
      return canAccessFeature(feature, user?.tier);
    }
  };
}
```

### useReview

```typescript
export function useReview(reviewId?: string) {
  const { currentReview, reviews, updateReview, fetchReviews } = useReviewStore();
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (reviewId) {
      setIsLoading(true);
      reviewService.getById(reviewId)
        .then(review => useReviewStore.setState({ currentReview: review }))
        .finally(() => setIsLoading(false));
    }
  }, [reviewId]);
  
  return {
    review: reviewId
      ? useReviewStore(s => s.reviews.find(r => r.id === reviewId))
      : currentReview,
    reviews,
    isLoading,
    updateReview,
    fetchReviews
  };
}
```

### usePipeline

```typescript
export function usePipeline(reviewId: string, type: PipelineType) {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  
  const addStage = useCallback(async (stageData) => {
    const newStage = await pipelineService.addStage(reviewId, type, stageData);
    setStages(prev => [...prev, newStage]);
  }, [reviewId, type]);
  
  const updateStage = useCallback(async (stageId, data) => {
    await pipelineService.updateStage(reviewId, type, stageId, data);
    setStages(prev => prev.map(s =>
      s.id === stageId ? { ...s, ...data } : s
    ));
  }, [reviewId, type]);
  
  const removeStage = useCallback(async (stageId) => {
    await pipelineService.removeStage(reviewId, type, stageId);
    setStages(prev => prev.filter(s => s.id !== stageId));
  }, [reviewId, type]);
  
  return {
    pipeline,
    stages,
    addStage,
    updateStage,
    removeStage
  };
}
```

---

## 📡 Services API

### api.ts (HTTP Client)

```typescript
import axios from 'axios';
import { useAuthStore } from '@store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### reviewService.ts

```typescript
export const reviewService = {
  fetchReviews: async (filters?: ReviewFilters) => {
    const { data } = await api.get('/reviews', { params: filters });
    return data.data;
  },
  
  getById: async (id: string) => {
    const { data } = await api.get(`/reviews/${id}`);
    return data.review;
  },
  
  create: async (reviewData: CreateReviewInput) => {
    const { data } = await api.post('/reviews', reviewData);
    return data.review;
  },
  
  update: async (id: string, updateData: Partial<Review>) => {
    const { data } = await api.patch(`/reviews/${id}`, updateData);
    return data.review;
  },
  
  delete: async (id: string) => {
    await api.delete(`/reviews/${id}`);
  },
  
  publish: async (id: string, options?: PublishOptions) => {
    const { data } = await api.post(`/reviews/${id}/publish`, options);
    return data.review;
  },
  
  duplicate: async (id: string, name?: string) => {
    const { data } = await api.post(`/reviews/${id}/duplicate`, { name });
    return data.review;
  }
};
```

---

## 🎨 Components Clés

### ReviewForm

**File:** `src/components/forms/ReviewForm.jsx`

```jsx
import { useState, useEffect } from 'react';
import { useReviewStore } from '@/store/reviewStore';
import GeneralInfoSection from './GeneralInfoSection';
import GeneticsSection from './GeneticsSection';
import VisualsSection from './VisualsSection';
import AromasSection from './AromasSection';
// ... autres sections

export default function ReviewForm({ reviewId }) {
  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState({});
  const { createReview, updateReview, reviews } = useReviewStore();
  
  const review = reviewId
    ? reviews.find(r => r.id === reviewId)
    : null;
  
  useEffect(() => {
    if (review) {
      setFormData(review);
    }
  }, [review]);
  
  const handleSectionChange = (sectionName, data) => {
    setFormData(prev => ({
      ...prev,
      [sectionName]: data
    }));
  };
  
  const handleSave = async () => {
    try {
      if (reviewId) {
        await updateReview(reviewId, formData);
      } else {
        await createReview(formData);
      }
      // Notification de succès
    } catch (error) {
      // Erreur handling
    }
  };
  
  return (
    <div className="review-form-container">
      {/* Tabs/Navigation */}
      <div className="form-navigation">
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={activeSection === section.id ? 'active' : ''}
          >
            {section.label}
          </button>
        ))}
      </div>
      
      {/* Section actuelle */}
      <div className="form-content">
        {activeSection === 'general' && (
          <GeneralInfoSection
            data={formData}
            onChange={(data) => handleSectionChange('generalInfo', data)}
          />
        )}
        {activeSection === 'visuals' && (
          <VisualsSection
            data={formData}
            onChange={(data) => handleSectionChange('visualTechnical', data)}
          />
        )}
        {/* ... autres sections ... */}
      </div>
      
      {/* Boutons actions */}
      <div className="form-actions">
        <button onClick={handleSave} className="btn-primary">
          {reviewId ? 'Mettre à jour' : 'Créer review'}
        </button>
        <button onClick={() => history.back()} className="btn-secondary">
          Annuler
        </button>
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: 'general', label: 'Infos Générales' },
  { id: 'genetics', label: 'Génétiques' },
  { id: 'visuals', label: 'Visuels' },
  { id: 'aromas', label: 'Arômes' },
  { id: 'tastes', label: 'Goûts' },
  { id: 'effects', label: 'Effets' }
];
```

### ExportMaker

**File:** `src/components/export/ExportMaker.jsx`

```jsx
export default function ExportMaker({ review }) {
  const exportStore = useExportStore();
  const [outputFormat, setOutputFormat] = useState('PNG');
  
  const handleExport = async () => {
    try {
      const blob = await exportStore.export(review, outputFormat);
      
      // Télécharger
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `review-${review.id}.${outputFormat.toLowerCase()}`;
      a.click();
    } catch (error) {
      // Erreur handling
    }
  };
  
  return (
    <div className="export-maker">
      <div className="export-sidebar">
        {/* Template selection */}
        {/* Personalization options */}
      </div>
      
      <div className="export-preview">
        <ExportPreview review={review} />
      </div>
      
      <div className="export-actions">
        <select value={outputFormat} onChange={e => setOutputFormat(e.target.value)}>
          <option>PNG</option>
          <option>PDF</option>
          <option>JPEG</option>
        </select>
        <button onClick={handleExport} className="btn-primary">
          Exporter
        </button>
      </div>
    </div>
  );
}
```

---

## 🛣️ Routing

**File:** `src/App.jsx`

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Pages
import Home from '@pages/Home';
import Dashboard from '@pages/Dashboard';
import ReviewForm from '@pages/ReviewForm';
import ExportPage from '@pages/ExportPage';
import Gallery from '@pages/Gallery';
import Login from '@pages/Login';
import Register from '@pages/Register';

// Protégé
function ProtectedRoute({ element, requiredTier }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredTier && !canAccessTier(user.tier, requiredTier)) {
    return <div>Accès insuffisant</div>;
  }
  
  return element;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gallery" element={<Gallery />} />
        
        {/* Protected */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/review/new"
          element={<ProtectedRoute element={<ReviewForm />} />}
        />
        <Route
          path="/review/:id"
          element={<ProtectedRoute element={<ReviewForm />} />}
        />
        <Route
          path="/review/:id/export"
          element={<ProtectedRoute element={<ExportPage />} />}
        />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🌐 Internationalization (i18n)

**File:** `src/i18n/index.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: { fr: { translation: fr }, en: { translation: en } },
    lng: localStorage.getItem('language') || 'fr',
    interpolation: { escapeValue: false }
  });

export default i18n;
```

**Usage dans composants:**

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('reviews.title')}</h1>;
}
```

---

## 🎯 Roadmap Frontend

1. **Composants animés** - Transitions/animations React
2. **Notifications toast** - Toast library intégration
3. **Drag & Drop** - React DnD pour pipelines
4. **Charts avancées** - Statistiques visuelles
5. **Offline support** - Service workers + cache
6. **Performance** - Code splitting, lazy loading
7. **Accessibility** - WCAG 2.1 compliance
8. **PWA** - Progressive Web App support
9. **Tests** - Vitest + React Testing Library
10. **Storybook** - Component documentation
