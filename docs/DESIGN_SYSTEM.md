# 🎨 Design System - Reviews Maker 2025

> **Style Apple-like : Épuré, Élégant, Professionnel**

---

## 🎯 Principes de Design

### 1. Simplicité
- **Moins c'est plus** : Chaque élément a une raison d'être
- **Hiérarchie claire** : L'œil est guidé naturellement
- **Espaces respirants** : Ne pas surcharger l'interface

### 2. Cohérence
- **Composants réutilisables** : Design system unifié
- **Comportements prévisibles** : Pas de surprises
- **Animations fluides** : 60fps partout

### 3. Accessibilité
- **Contraste WCAG AA** : Lisibilité garantie
- **Keyboard navigation** : Navigation complète au clavier
- **Screen readers** : ARIA labels partout

---

## 🎨 Palette de Couleurs

### Thème Violet (Défaut)
```css
--primary:     #8B5CF6  /* Violet profond */
--secondary:   #A78BFA  /* Lavande */
--accent:      #C4B5FD  /* Lilas clair */
--background:  #0F0A1E  /* Noir bleuté */
--surface:     #1A1432  /* Gris violet foncé */
--text:        #F5F3FF  /* Blanc cassé */
--text-muted:  #A78BFA  /* Violet doux */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%);
--gradient-surface: linear-gradient(180deg, #1A1432 0%, #0F0A1E 100%);
```

### Thème Émeraude
```css
--primary:     #10B981
--secondary:   #34D399
--accent:      #6EE7B7
--background:  #0F1C17
--surface:     #1A2F26
--text:        #ECFDF5
```

### Thème Rose
```css
--primary:     #F43F5E
--secondary:   #FB7185
--accent:      #FDA4AF
--background:  #1C0A14
--surface:     #2F1A24
--text:        #FFF1F2
```

---

## 📐 Espacements (8px Grid)

```css
--space-0:   0px
--space-1:   4px    /* Micro spacing */
--space-2:   8px    /* Base unit */
--space-3:   12px
--space-4:   16px   /* Padding standard */
--space-5:   20px
--space-6:   24px   /* Section spacing */
--space-8:   32px
--space-10:  40px
--space-12:  48px   /* Large sections */
--space-16:  64px
--space-20:  80px
--space-24:  96px   /* Hero spacing */
```

---

## 🔤 Typographie

### Fonts
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### Tailles
```css
--text-xs:   12px  /* Captions, labels */
--text-sm:   14px  /* Body small, buttons */
--text-base: 16px  /* Body text */
--text-lg:   18px  /* Emphasized text */
--text-xl:   20px  /* Headings H3 */
--text-2xl:  24px  /* Headings H2 */
--text-3xl:  30px  /* Headings H1 */
--text-4xl:  36px  /* Display text */
--text-5xl:  48px  /* Hero titles */
```

### Poids
```css
--font-light:     300
--font-regular:   400
--font-medium:    500
--font-semibold:  600
--font-bold:      700
--font-extrabold: 800
```

---

## 🔲 Border Radius

```css
--radius-sm:   6px   /* Badges, small buttons */
--radius-md:   8px   /* Buttons, inputs */
--radius-lg:   12px  /* Cards */
--radius-xl:   16px  /* Modals, panels */
--radius-2xl:  24px  /* Hero sections */
--radius-full: 9999px /* Pills, avatars */
```

---

## 🌫️ Ombres (Layered Depth)

```css
/* Subtle */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Cards */
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1),
             0 1px 2px rgba(0, 0, 0, 0.06);

/* Floating elements */
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1),
             0 2px 4px rgba(0, 0, 0, 0.06);

/* Modals */
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1),
             0 4px 6px rgba(0, 0, 0, 0.05);

/* Popovers */
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15),
             0 10px 10px rgba(0, 0, 0, 0.04);

/* Glass effect */
--shadow-glass: 0 8px 32px rgba(139, 92, 246, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
```

---

## ⚡ Animations

### Transitions
```css
--transition-fast:   150ms cubic-bezier(0.4, 0, 0.2, 1);  /* Micro-interactions */
--transition-base:   250ms cubic-bezier(0.4, 0, 0.2, 1);  /* Standard */
--transition-slow:   350ms cubic-bezier(0.4, 0, 0.2, 1);  /* Modals, panels */
--transition-slower: 500ms cubic-bezier(0.4, 0, 0.2, 1);  /* Page transitions */

/* Apple-like ease */
--ease-apple: cubic-bezier(0.25, 0.1, 0.25, 1);
```

### Keyframes Prédéfinis
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Shimmer (loading) */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## 🧩 Composants UI

### Button
```jsx
// Variantes
<Button variant="primary">Action principale</Button>
<Button variant="secondary">Action secondaire</Button>
<Button variant="ghost">Action discrète</Button>
<Button variant="danger">Action destructive</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="md">Moyen (défaut)</Button>
<Button size="lg">Grand</Button>

// États
<Button loading>Chargement...</Button>
<Button disabled>Désactivé</Button>

// CSS
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  transition: all var(--transition-fast);
  cursor: pointer;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
}

.btn-ghost {
  background: transparent;
  color: var(--text);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
}
```

### Card
```jsx
<Card variant="default">
  <CardHeader>
    <CardTitle>Titre</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Contenu principal
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// CSS
.card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Glass variant */
.card-glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Input
```jsx
<Input 
  type="text" 
  placeholder="Entrez du texte..."
  label="Nom du produit"
  hint="Visible sur la review finale"
  error="Champ requis"
/>

// CSS
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  color: var(--text);
  transition: all var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input::placeholder {
  color: var(--text-muted);
  opacity: 0.5;
}
```

### Modal
```jsx
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Titre de la modale</ModalTitle>
      <ModalClose />
    </ModalHeader>
    <ModalBody>
      Contenu de la modale
    </ModalBody>
    <ModalFooter>
      <Button variant="ghost" onClick={onClose}>Annuler</Button>
      <Button variant="primary" onClick={onConfirm}>Confirmer</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

// CSS
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  animation: fadeIn var(--transition-base);
  z-index: 50;
}

.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  background: var(--surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  animation: scaleIn var(--transition-base);
  z-index: 51;
}
```

### Badge
```jsx
<Badge variant="primary">Nouveau</Badge>
<Badge variant="success">✓ Publié</Badge>
<Badge variant="warning">⚠ Brouillon</Badge>
<Badge variant="danger">✗ Erreur</Badge>

// CSS
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.badge-primary {
  background: rgba(139, 92, 246, 0.15);
  color: var(--primary);
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
}
```

### Avatar
```jsx
<Avatar 
  src={user.avatarUrl} 
  alt={user.username}
  fallback={user.username[0]}
  size="sm|md|lg"
/>

// CSS
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--gradient-primary);
  color: white;
  font-weight: var(--font-semibold);
}

.avatar-sm { width: 32px; height: 32px; font-size: var(--text-sm); }
.avatar-md { width: 40px; height: 40px; font-size: var(--text-base); }
.avatar-lg { width: 56px; height: 56px; font-size: var(--text-xl); }
```

---

## 🎭 Micro-interactions

### Hover Effects
```css
/* Lift on hover */
.hover-lift {
  transition: transform var(--transition-fast);
}
.hover-lift:hover {
  transform: translateY(-2px);
}

/* Glow on hover */
.hover-glow {
  transition: box-shadow var(--transition-fast);
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
}

/* Scale on hover */
.hover-scale {
  transition: transform var(--transition-fast);
}
.hover-scale:hover {
  transform: scale(1.05);
}
```

### Loading States
```css
/* Skeleton loader */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

/* Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile first */
/* xs: 0-639px (défaut) */

@media (min-width: 640px) {
  /* sm: Tablettes portrait */
}

@media (min-width: 768px) {
  /* md: Tablettes paysage */
}

@media (min-width: 1024px) {
  /* lg: Desktop */
}

@media (min-width: 1280px) {
  /* xl: Large desktop */
}

@media (min-width: 1536px) {
  /* 2xl: Ultra-wide */
}
```

---

## 🎬 Exemples de Layouts

### Hero Section
```jsx
<section className="hero">
  <div className="hero-content">
    <h1 className="hero-title">
      Créez des reviews professionnelles
    </h1>
    <p className="hero-description">
      Studio complet pour composer, prévisualiser et exporter vos reviews cannabis
    </p>
    <div className="hero-actions">
      <Button size="lg" variant="primary">
        🚀 Commencer maintenant
      </Button>
      <Button size="lg" variant="ghost">
        📚 Voir la galerie
      </Button>
    </div>
  </div>
</section>

// CSS
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-24) var(--space-6);
  background: var(--gradient-surface);
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: var(--space-6);
}
```

### Gallery Grid
```jsx
<div className="gallery-grid">
  {reviews.map(review => (
    <ReviewCard key={review.id} {...review} />
  ))}
</div>

// CSS
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-6);
  padding: var(--space-6);
}
```

---

## 🌈 Exemples de Thèmes Complets

### Violet Theme (Copier-coller complet)
```css
:root[data-theme="violet"] {
  /* Colors */
  --primary: #8B5CF6;
  --secondary: #A78BFA;
  --accent: #C4B5FD;
  --background: #0F0A1E;
  --surface: #1A1432;
  --text: #F5F3FF;
  --text-muted: #A78BFA;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #C4B5FD 100%);
  --gradient-surface: linear-gradient(180deg, #1A1432 0%, #0F0A1E 100%);
  
  /* Shadows */
  --shadow-colored: 0 8px 32px rgba(139, 92, 246, 0.15);
}
```

---

**Documentation créée le** : 3 novembre 2025  
**Statut** : ✅ Prêt pour implémentation  
**Version** : 1.0
