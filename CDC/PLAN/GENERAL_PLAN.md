## 1. Architecture Globale & Stack Technique

```
FRONT-END : React 18+ / Next.js 15 / TypeScript
- UI : Tailwind CSS + shadcn/ui + Framer Motion (animations liquid glass)
- State : Zustand (global) + React Query (API)
- Charts : Recharts / D3.js (mini-charts pipeline)
- PWA : Next PWA + Workbox
- Design : Apple Human Interface Guidelines + Liquid Glass (CSS custom)

BACK-END : Next.js API Routes / Supabase (PostgreSQL + Auth + Storage)
- Auth : Supabase Auth (OAuth2 + 2FA)
- DB : Supabase PostgreSQL (Row Level Security)
- Files : Supabase Storage (photos, exports, PDFs analytiques)
- Payments : Stripe (abonnements)
- Queue : Supabase Edge Functions (exports lourds : GIF/HTML)

EXPORT ENGINE :
- Static : html2canvas / Puppeteer (PNG/SVG/PDF)
- Dynamic : Custom HTML viewer + FFmpeg.wasm (GIF curing)
```

***

## 2. Structure Base de Données (Schéma Principal)

```sql
-- Utilisateurs & Comptes
users (
  id UUID PRIMARY KEY,
  account_type ENUM('amateur', 'influenceur', 'producteur'),
  email TEXT UNIQUE,
  pseudo TEXT UNIQUE,
  verified_age BOOLEAN DEFAULT FALSE,
  country TEXT,
  stripe_customer_id TEXT,
  subscription_status ENUM('free', 'active', 'cancelled'),
  created_at TIMESTAMP
);

-- Reviews (noyau applicatif)
reviews (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  product_type ENUM('fleurs', 'hash', 'concentres', 'comestibles'),
  nom_commercial TEXT NOT NULL,
  visibility ENUM('private', 'public'),
  account_type_used ENUM('amateur', 'influenceur', 'producteur'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Pipelines (3D time dimension)
pipelines (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews,
  type ENUM('culture', 'separation', 'extraction', 'purification', 'curing', 'recette'),
  time_axis ENUM('secondes', 'minutes', 'heures', 'jours', 'semaines', 'mois', 'phases', 'dates'),
  time_extent INTEGER, -- durée totale en unités
  steps JSONB[] -- [{t_start, t_end, emojis[], data_refs[]}]
);

-- Export Templates (specs de rendu)
export_templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  name TEXT,
  format ENUM('1:1', '16:9', '9:16', 'A4_portrait', 'A4_paysage'),
  template_type ENUM('compact', 'detaille', 'complete', 'influenceur', 'personnalise'),
  layout_spec JSONB, -- zones, policies temporelles, styles
  is_default BOOLEAN DEFAULT FALSE
);
```

***

## 3. Interface Utilisateur - Layout Global

### 3.1 Bandeau Universel (tous les écrans)

```
[HEADER FIXE - HAUTEUR 64px]
┌──────────────────────┬─────────────────────────────────────────────────────┐
│ Logo Terpologie     │ [Recherche] [Créer Review ▼] [Galerie] [Stats] [Profil ▼] │
│ (cliquable → home)  │ Fleurs | Hash | Concentrés | Comestibles               │
└──────────────────────┴─────────────────────────────────────────────────────┘
```

**Menu Profil (dropdown)** :
```
- Mon compte (paramètres)
- Ma bibliothèque (reviews/templates)
- Statistiques
- Abonnement (producteur/influenceur)
- Déconnexion
```

### 3.2 Pop-up RDR (à chaque visite)

```
┌─────────────────────────────────────┐
│ ⚠️ Vérification d'âge légale       │
│ Ce site contient du contenu sur     │
│ le cannabis. Vous devez avoir       │
│ +18 ans (ou +21 selon votre pays).  │
│                                     │
│ [J'ai +18 ans] [Politique]          │
└─────────────────────────────────────┘
```

**Stockage** : `localStorage.rdr_accepted = true` + `user.verified_age = true`

***

## 4. Page d'Inscription - Choix de Compte

**Écran plein, responsive** :
```
┌─────────────────────────────────────────────────────────────────┐
│                    Choisissez votre Plan                        │
├─────────────────────────────────────────────────────────────────┤
│ Des outils de traçabilité adaptés à vos besoins                 │
│ Amateur → Influenceur → Producteur                              │
├─────────────────────────────────────────────────────────────────┤
│ ✨ GRATUIT     📱 15.99€/mois    👨‍🌾 29.99€/mois               │
│ Amateur        Influenceur        Producteur                    │
│ [Sélectionner]  [Sélectionner]    [Sélectionner]                │
└─────────────────────────────────────────────────────────────────┘
```

**Pop-up détail au clic** :
```
┌─────────────────────────────────────┐
│ Influenceur - 15.99€/mois           │
│ ✓ Pas de filigrane                  │
│ ✓ Pipeline Curing                   │
│ ✓ Exports GIF 300dpi                │
│ ✗ Pipelines avancés                 │
│ [Passer au paiement]                │
└─────────────────────────────────────┘
```

***

## 5. Authentification & Sécurité

### 5.1 Flux d'authentification

```
1. OAuth2 providers : Google, Apple, Discord, Facebook, Amazon
   → auto-fill : email, pseudo, photo, date_naissance, pays

2. Email verification : code 6 caractères (exp 5min)

3. Producteur/Influenceur :
   → KYC upload (pièce ID + justificatif activité)
   → vérification manuelle (admin panel)

4. 2FA (paramètres) : TOTP (Google Authenticator)
```

### 5.2 Permissions par rôle (Row Level Security)

```typescript
// Exemple permissions
const permissions = {
  amateur: {
    reviews_create: true,
    reviews_max_private: 20,
    reviews_max_public: 5,
    pipelines: false,
    exports: ['png', 'jpeg', 'pdf_low'],
    watermark: 'terpologie'
  },
  influenceur: {
    reviews_unlimited: true,
    pipelines: ['curing'],
    exports: ['png_hd', 'gif', 'pdf_hd'],
    watermark: false
  },
  producteur: {
    reviews_unlimited: true,
    pipelines: ['all'],
    exports: ['all_formats'],
    custom_templates: true,
    watermark: false,
    api_access: true
  }
}
```

***

## 6. Reviews-Maker - Interface de Création

### 6.1 Sélection Type Produit (Écran d'entrée)

```
┌─────────────────────────────────────┐
│        Créer une Review             │
├─────────────────────────────────────┤
│ [Fleurs 🌿]  [Hash 🔥] [Concentrés 💎] [Comestibles 🍫] │
└─────────────────────────────────────┘
```

### 6.2 Interface Review (Layout principal)

```
[Écran split 70/30 - Responsive]
┌─────────────────────────────┬──────────────┐
│ 1. Infos Générales          │ Prévisualisation │
│ 2. [Pipeline Culture] ←     │ Temps réel    │
│ 3. Visuel & Technique       │ (Export Maker)│
│ 4. Odeurs                   │               │
│ 5. Texture                  │ [Exporter ▼]  │
│ 6. Goûts                    │               │
│ 7. Effets                   │               │
│ 8. [Pipeline Curing] ←      │               │
└─────────────────────────────┴──────────────┘
```

### 6.3 PipeLines - Interface Détaillée

```
[Vue Pipeline - Split 30/70]
┌─────────────────────────────┐
│ Préréglages 📋              │
│ ├─ Substrats courants       │  ☐ ☐ ☐ ☐ ☐ ☐ + 
│ ├─ Engrais                  │ Phase 1 2 3 4 5
│ ├─ Environnement            │
│ └─ [Sauvegarder preset]     │
└─────────────────────────────┘  ← Drag & Drop contenus
```

**Case Pipeline** (hover/click) :
```
┌─────────────┐
│ 🧪 🌡️ 📊 💧 │  ← 4 emojis superposés
│ Phase 3     │
│ [Détails ▼] │
└─────────────┘
```

**Modale Case** (clic) :
```
┌─────────────────────────────────────┐
│ Données assignées à Phase 3         │
├─────────────────────────────────────┤
│ 🧪 Engrais A : 2ml/L [✏️][🗑️]       │
│ 🌡️ Temp: 24°C [✏️][🗑️]             │
│ 📊 PPFD: 800µmol [✏️][🗑️]           │
│                                     │
│ [Drag depuis gauche] [Preset rapide]│
└─────────────────────────────────────┘
```

***

## 7. Export Maker - Système Complet

### 7.1 Règles Intelligentes

```
SI Pipeline présente → Export HTML interactif obligatoire
+ PNG cover optionnel (social media)

SI Seulement Curing → GIF animation notes/10 disponible
```

### 7.2 Templates Prédéfinis

```typescript
const templates = {
  compact: {
    format: '1:1',
    sections: ['type', 'nom', 'cultivars', 'photo', 'curing_timeline_mini', 'notes_summary'],
    pipeline_policy: 'summary_only' // durée + type
  },
  detaille: {
    format: ['1:1', '16:9', '9:16', 'A4'],
    sections: ['full_info', 'pipelines_5_steps', 'all_notes'],
    pipeline_policy: 'even_sampling_5'
  },
  influenceur: {
    format: '9:16',
    sections: ['social_card', 'curing_timeline', 'notes_summary'],
    optimized_social: true
  }
}
```

### 7.3 Bandeau Export Maker

```
[GAUCHE 25%]          [CENTRE 50%]           [DROITE 25%]
Templates ▼           Canvas aperçu         [Exporter ▼]
├─ Prédéfinis         Drag & Drop zones     PNG | GIF | HTML
├─ Mes templates                    │        PDF | CSV | JSON
└─ Nouveau template                │        [Qualité 300dpi]
Thème ▼                           │
├─ Couleurs                      │
├─ Typo                         │
└─ Filigrane                    │
```

***

## 8. Restrictions par Type de Compte

| Fonctionnalité | Amateur | Influenceur | Producteur |
|---|---|---|---|
| **Reviews privées max** | 20 | Illimité | Illimité |
| **Reviews publiques** | 5 | Illimité | Illimité |
| **Pipelines Culture/Separation** | ❌ | ❌ | ✅ |
| **Pipeline Curing** | ❌ | ✅ | ✅ |
| **Templates prédéfinis** | ✅ | ✅ | ✅ |
| **Templates personnalisés** | ❌ | ❌ | ✅ |
| **Exports PNG/JPEG/PDF** | Low DPI + Watermark | HD | HD |
| **GIF Curing** | ❌ | ✅ | ✅ |
| **HTML interactif** | ❌ | ❌ | ✅ |
| **CSV/JSON** | ❌ | ❌ | ✅ |

***

## 9. Galerie Publique

```
[Filtres avancés]
Type: [Fleurs ▼] [Hash ▼] Notes: [8+ ▼] Date: [2025 ▼]

[Grille responsive 1/2/3/4 col]
┌─────────────────────────────┐
│ [PNG Cover du template]     │  ← Export par défaut
│ Nom commercial              │
│ 🌿 Fleurs | 8.7/10          │
│ Cultivar X | Farm Y         │
│ [Culture 70j] [Curing 30j]  │  ← Badges pipelines
│ 1.2k ❤️  456 💬            │
└─────────────────────────────┘

[Clic → Page Review]
- Cover + infos principales
- Sections notes (sliders visuels)
- Pipelines interactives (cases cliquables → modales)
- Bouton "Version Producteur HTML" (si disponible)
```

***

## 10. Bibliothèque Personnelle

```
Organisée par onglets :
1. Reviews [Éditer/Supprimer/Dupliquer/Exporter]
2. Templates Export [Éditer/Partager/Code unique]
3. Presets Pipeline [Substrats/Engrais/Environnements]
4. Filigranes [Logo/PNG upload]
```

***

## 11. Statistiques Utilisateur

```
**Amateur/Influenceur** :
- Reviews créées : 47
- Exports : 23 PNG, 12 PDF
- Notes moyennes : Fleurs 8.2 | Hash 7.9
- Engagement public : 1.2k likes

**Producteur** (avancé) :
+ Rendements moyens : 450g/m²
+ Pipeline stats : DLI moyen 42mol, VPD 1.2kPa
+ Top cultivars : CultivarX (12 reviews)
```

***

## 12. API Endpoints Principaux

```typescript
POST /api/reviews/create
POST /api/pipelines/:review_id/add-step
POST /api/export/generate (multipart: template_spec + review_id)
GET  /api/reviews/public?filters...
GET  /api/templates/user/:user_id
POST /api/kyc/verify (producteur uniquement)
```

***

## 13. PWA & Performances

- **Offline** : Cache reviews bibliothèque + templates
- **Push** : Notifications exports terminés
- **Install** : Prompt PWA après 2 visites
- **Lazy loading** : Pipelines + modales
