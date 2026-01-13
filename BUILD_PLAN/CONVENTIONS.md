# Code Conventions - Reviews-Maker

## 📐 Naming Conventions

### JavaScript/React Files

```javascript
// Components (PascalCase)
ReviewForm.jsx
ExportMaker.jsx
PipelineSection.jsx
AuthCallback.jsx

// Pages (PascalCase)
HomePage.jsx
ReviewFormPage.jsx
GalleryPage.jsx

// Hooks (camelCase, prefix with 'use')
useReviewForm.js
usePipelineData.js
useAuth.js
useLocalStorage.js

// Utils (camelCase)
formatDate.js
validateEmail.js
calculateRendement.js
generatePDF.js

// Constants (UPPER_SNAKE_CASE)
PRODUCT_TYPES.js
TEMPLATE_FORMATS.js
API_ENDPOINTS.js

// Styles (kebab-case)
form-styles.css
button-styles.css
grid-styles.css
```

### Variables & Functions

```javascript
// Constants
const MAX_REVIEW_LENGTH = 500;
const DEFAULT_TIMEOUT = 5000;
const THEME_COLORS = { light: '#fff', dark: '#000' };

// Variables (camelCase)
let currentReviewId = null;
const userData = { name: 'John', email: 'john@example.com' };
const isValidEmail = email => email.includes('@');

// Boolean variables (prefix with is/has/can)
const isLoading = true;
const hasError = false;
const canExport = userTier === 'producteur';

// Event handlers (prefix with handle)
const handleSubmit = (e) => { ... };
const handleClick = () => { ... };
const handleChange = (event) => { ... };

// Data fetchers (prefix with fetch)
const fetchReviews = async () => { ... };
const fetchUserProfile = async () => { ... };

// Callbacks (prefix with on)
const onSuccess = (data) => { ... };
const onError = (error) => { ... };
```

### React Components

```javascript
// Props (destructured, camelCase)
function ReviewCard({ reviewId, onDelete, isPublic }) {
  return (...)
}

// State (useState)
const [reviews, setReviews] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// Context (PascalCase, suffix with Context)
export const AuthContext = createContext();
export const ReviewDataContext = createContext();

// Custom Hooks (camelCase, prefix with use)
export const useReviewForm = () => { ... };
export const usePipelineValidation = () => { ... };
```

### CSS/Tailwind Classes

```css
/* Component styles (kebab-case) */
.review-card { }
.export-button { }
.pipeline-grid { }

/* BEM-like naming */
.review-card--featured { }
.review-card__header { }
.review-card__body { }

/* Tailwind (use provided classes) */
className="flex items-center justify-between gap-4 p-6 rounded-lg bg-white shadow-md"
```

---

## 🎨 React Component Patterns

### Functional Component Structure

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

/**
 * ReviewForm - Manages review creation and editing
 * @param {Object} props
 * @param {string} props.reviewId - ID of review to edit (optional)
 * @param {Function} props.onSuccess - Callback when form is submitted
 * @returns {JSX.Element}
 */
function ReviewForm({ reviewId, onSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data fetching
  useEffect(() => {
    if (reviewId) {
      fetchReviewData(reviewId);
    }
  }, [reviewId]);

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await submitReview(formData);
      onSuccess(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return <div>Not authenticated</div>;

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save Review'}
      </Button>
    </form>
  );
}

export default ReviewForm;
```

### Props Interface

```javascript
/**
 * @typedef {Object} ReviewFormProps
 * @property {string} reviewId - ID of review to edit
 * @property {Function} onSuccess - Success callback
 * @property {boolean} [isPublic=false] - Whether review is public
 */

function ReviewForm(props) {
  const { reviewId, onSuccess, isPublic = false } = props;
  // ...
}
```

---

## 📝 JSDoc Standards

### Function Documentation

```javascript
/**
 * Calculates the rendement (yield) based on grow parameters
 * @param {number} harvestWeight - Weight of dried harvest in grams
 * @param {number} growSpace - Growing space in m²
 * @returns {number} Rendement in g/m²
 * @throws {Error} If parameters are invalid
 * @example
 * const yield = calculateRendement(250, 1.5); // 166.67
 */
function calculateRendement(harvestWeight, growSpace) {
  if (harvestWeight <= 0 || growSpace <= 0) {
    throw new Error('Invalid parameters');
  }
  return Math.round((harvestWeight / growSpace) * 100) / 100;
}
```

### Component Documentation

```javascript
/**
 * PipelineGrid - Interactive grid for pipeline data entry
 * 
 * Displays a grid of cells for tracking data over time (days, weeks, phases).
 * Supports drag-and-drop for cell management and color coding by status.
 * 
 * @component
 * @param {Object} props
 * @param {string} props.mode - 'days' | 'weeks' | 'phases'
 * @param {Array<Object>} props.cells - Array of cell data
 * @param {Function} props.onChange - Called when cells change
 * @param {boolean} [props.editable=true] - Allow editing
 * @returns {JSX.Element}
 * 
 * @example
 * <PipelineGrid 
 *   mode="weeks"
 *   cells={weekData}
 *   onChange={handleCellChange}
 *   editable={true}
 * />
 */
```

---

## 🏗️ Project Structure Conventions

### Frontend (`client/src/`)

```
client/src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── ...
│   ├── forms/           # Form components
│   │   ├── ReviewForm.jsx
│   │   ├── LoginForm.jsx
│   │   └── ...
│   ├── review/          # Review-specific components
│   │   ├── ReviewCard.jsx
│   │   ├── ReviewList.jsx
│   │   └── ...
│   ├── pipeline/        # Pipeline components
│   │   ├── PipelineGrid.jsx
│   │   ├── PipelineCell.jsx
│   │   └── ...
│   ├── export/          # Export components
│   │   ├── ExportMaker.jsx
│   │   ├── TemplateSelector.jsx
│   │   └── ...
│   ├── genetics/        # Genetics/genealogy components
│   │   ├── CultivarTree.jsx
│   │   ├── PhenoHuntCanvas.jsx
│   │   └── ...
│   ├── gallery/         # Gallery components
│   │   ├── ReviewGallery.jsx
│   │   ├── SearchBar.jsx
│   │   └── ...
│   ├── shared/          # Shared layout/wrapper components
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── ...
│   └── ...
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ...
│   ├── reviews/
│   │   ├── ReviewFormPage.jsx
│   │   ├── ReviewDetailPage.jsx
│   │   ├── EditReviewPage.jsx
│   │   └── ...
│   ├── gallery/
│   │   └── GalleryPage.jsx
│   ├── account/
│   │   ├── ProfilePage.jsx
│   │   ├── LibraryPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── ...
│   ├── genetics/
│   │   └── GeneticsPage.jsx
│   ├── HomePage.jsx
│   └── NotFoundPage.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useReviewForm.js
│   ├── usePipelineData.js
│   └── ...
├── store/               # Zustand stores
│   ├── authStore.js
│   ├── reviewStore.js
│   ├── uiStore.js
│   └── ...
├── services/            # API calls
│   ├── authService.js
│   ├── reviewService.js
│   ├── exportService.js
│   └── ...
├── utils/
│   ├── formatters.js
│   ├── validators.js
│   ├── constants.js
│   └── ...
├── styles/
│   ├── globals.css
│   ├── tailwind.config.js
│   └── ...
├── i18n/
│   ├── en.json
│   ├── fr.json
│   └── ...
├── App.jsx
└── main.jsx
```

### Backend (`server-new/`)

```
server-new/
├── routes/              # API endpoints
│   ├── auth.js
│   ├── reviews.js
│   ├── exports.js
│   ├── gallery.js
│   ├── genetics.js
│   ├── uploads.js
│   ├── users.js
│   ├── legal.js
│   └── ...
├── controllers/         # Route handlers
│   ├── authController.js
│   ├── reviewController.js
│   ├── exportController.js
│   └── ...
├── services/            # Business logic
│   ├── authService.js
│   ├── reviewService.js
│   ├── exportService.js
│   ├── pdfService.js
│   ├── emailService.js
│   └── ...
├── validators/          # Input validation
│   ├── authValidators.js
│   ├── reviewValidators.js
│   ├── pipelineValidators.js
│   └── ...
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimit.js
│   ├── validation.js
│   └── ...
├── prisma/
│   └── schema.prisma
├── config/
│   ├── database.js
│   ├── email.js
│   ├── oauth.js
│   └── ...
├── utils/
│   ├── logger.js
│   ├── formatters.js
│   ├── fileHandler.js
│   └── ...
├── server.js
└── session-options.js
```

---

## 🔤 Code Style

### Imports/Exports

```javascript
// ✅ DO: Organize imports (external, internal, assets)
import React, { useState } from 'react';
import axios from 'axios';

import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils/formatters';

// ✅ DO: Named exports for reusable components
export function ReviewCard(props) { ... }

// ✅ DO: Default export for page components
export default ReviewFormPage;

// ❌ DON'T: Mix default and named exports in same file
// ❌ DON'T: Use relative paths with many ../../../
```

### Spacing & Formatting

```javascript
// ✅ DO: Consistent spacing
function calculateValue(a, b) {
  const sum = a + b;
  const product = a * b;
  return { sum, product };
}

// ✅ DO: Break long lines
const validationRules = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  password: (value) => value.length >= 8,
};

// ✅ DO: Consistent object formatting
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};

// ❌ DON'T: Inconsistent spacing
function x(a,b){return a+b;}
```

### Error Handling

```javascript
// ✅ DO: Descriptive error messages
try {
  const response = await fetchReviews();
} catch (error) {
  console.error('Failed to fetch reviews:', error.message);
  setError('Unable to load reviews. Please try again later.');
}

// ✅ DO: Use custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ❌ DON'T: Silent failures
try {
  await fetchReviews();
} catch (error) {
  // Do nothing
}
```

---

## 🎯 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no feature change)
- `style`: Formatting, missing semicolons, etc.
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `perf`: Performance improvement
- `chore`: Build, dependency, CI/CD changes

### Examples

```
feat(review): add pipeline curing UI

- Implement PipelineGrid component with week selection
- Add cell context menu for data entry
- Support drag-and-drop for cell management

Closes #42

---

fix(export): resolve PDF generation timeout

Fixed issue where exports >10MB would fail to generate.
Implemented streaming for large files.

Closes #118

---

refactor(components): reorganize folder structure

Moved components to logical categories:
- ui/ for reusable components
- forms/ for form components
- review/ for review-specific components

No functional changes.
```

---

## 🧪 Testing Conventions

### Test File Structure

```javascript
// reviewService.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchReviews, createReview } from '@/services/reviewService';

describe('reviewService', () => {
  describe('fetchReviews', () => {
    it('should fetch reviews successfully', async () => {
      const reviews = await fetchReviews();
      expect(reviews).toBeArray();
      expect(reviews.length).toBeGreaterThan(0);
    });

    it('should handle network errors', async () => {
      // Mock network error
      expect(() => fetchReviews()).rejects.toThrow();
    });
  });

  describe('createReview', () => {
    it('should create review with valid data', async () => {
      const review = await createReview({
        type: 'flower',
        name: 'Test Strain',
      });
      expect(review.id).toBeDefined();
    });

    it('should throw validation error for invalid data', async () => {
      expect(() => createReview({})).rejects.toThrow('ValidationError');
    });
  });
});
```

---

## 🔄 Git Workflow

### Branch Naming

```
feat/review-export-templates
fix/pipeline-grid-selection-bug
refactor/component-folder-structure
docs/api-documentation-update
chore/update-dependencies
```

### Commit Workflow

```bash
# 1. Create feature branch
git checkout -b feat/new-feature

# 2. Make changes, commit atomically
git add src/components/NewComponent.jsx
git commit -m "feat(components): add NewComponent with props"

# 3. Keep branch updated
git fetch origin
git rebase origin/main

# 4. Push and create PR
git push origin feat/new-feature

# 5. After review, merge with squash
git merge --squash feat/new-feature
git commit -m "feat: add new feature"
```

---

## 📊 Code Quality Standards

### ESLint Configuration

```javascript
// .eslintrc.cjs
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'react/prop-types': 'warn',
  },
};
```

### Prettier Configuration

```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

---

## 📚 Additional Resources

- [React Hooks Rules](https://react.dev/reference/rules)
- [ESLint Rules](https://eslint.org/docs/rules)
- [Prettier Docs](https://prettier.io/docs)
- [Conventional Commits](https://www.conventionalcommits.org)
- [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)

---

**Dernière mise à jour**: 13 Jan 2026
**Auteur**: Reviews-Maker Team
**Version**: 1.0
