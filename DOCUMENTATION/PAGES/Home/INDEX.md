# Home - Page d'Accueil & Dashboard Principal

## 📋 Overview

La **Home** est le point d'entrée après authentification. Elle combine navigation, statistiques rapides et accès aux fonctionnalités principales.

---

## 🎯 Sections de Home

### **1. HEADER NAVIGATION**

#### Barre Supérieure
```
[Logo] [Recherche Globale] [Notifications] [Profil Dropdown] [Menu Mobile]
```

**Logo**
- Cliquable → Retour à Home
- Logo Reviews-Maker

**Recherche Globale**
- Recherche reviews, cultivars, utilisateurs
- Auto-suggest pendant saisie
- Filtres rapides: type produit, date

**Bell Notifications**
- Nombre notifications non-lues
- Dropdown: voir notifications récentes
- Lien vers "All Notifications"
- Clear all option

**Profil Dropdown**
```
┌─────────────────────────┐
│ [Avatar] Mon Profil     │
│ ─────────────────────── │
│ ⚙️  Paramètres          │
│ 📊 Statistiques         │
│ 🚪 Déconnexion         │
└─────────────────────────┘
```

---

### **2. NAVIGATION PRINCIPALE**

#### Sidebar/Menu Horizontal

**Éléments Principaux**
```
├── 🏠 Accueil
├── ➕ Nouvelle Review
├── 📚 Bibliothèque
├── 🖼️  Export Maker
├── 👤 Mon Profil
├── 🌍 Galerie Publique
└── ⋮ Plus...
    ├── ❓ Aide
    ├── 📢 Feedback
    └── 🔗 Communauté
```

**States**
- Home: bouton actif
- New Review: ouvre modal/navigation
- Export Maker: navigation vers page export
- etc.

---

### **3. DASHBOARD PRINCIPAL**

#### Section Bienvenue
```
┌──────────────────────────────────────┐
│ Bienvenue, [Username]! 👋            │
│ Tier: [Amateur/Producteur/Influenceur]│
│ Dernier accès: [Date]                 │
└──────────────────────────────────────┘
```

#### Quick Actions
```
┌─────────────────────────────────────┐
│ Actions Rapides                      │
├─────────────────────────────────────┤
│ [+ Créer Review] [Export] [Galerie] │
│ [Voir Stats]     [Aide]   [Profil]  │
└─────────────────────────────────────┘
```

#### Cartes Statistiques Rapides
```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ 42   │ │ 156  │ │ 3.2K │ │ 87   │
│ Revs │ │Export│ │Likes │ │Comm. │
└──────┘ └──────┘ └──────┘ └──────┘
```

**Cliquables**
- Reviews: vers Bibliothèque
- Exports: vers historique exports
- Likes: vers reviews publiques
- Comments: vers commentaires reçus

---

### **4. CONTENU PRINCIPAL - GRILLE**

#### Onglets Navigation
```
👉 Aperçu | 📋 Mes Reviews | ⭐ Favorites | 🔥 Trending
```

---

#### **Tab 1: APERÇU (Par Défaut)**

**Mes Reviews Récentes**
```
┌─────────────────────────────────────┐
│ Dernières Reviews (5-8 mostrecent)  │
├─────────────────────────────────────┤
│ [Card Review 1]  [Card Review 2]    │
│ [Card Review 3]  [Card Review 4]    │
│ [Voir tout →]                        │
└─────────────────────────────────────┘
```

**Structure Card Review**
```
┌──────────────────────────┐
│ [Thumbnail Image]        │
├──────────────────────────┤
│ Titre: Girl Scout       │
│ Type: Fleurs            │
│ Rating: ⭐⭐⭐⭐⭐ (4.5)  │
│ État: Publiée / Brouillon │
├──────────────────────────┤
│ [Éditer] [Export] [...]  │
└──────────────────────────┘
```

**Brouillons en Attente**
```
┌─────────────────────────────────────┐
│ Brouillons en Attente (1-3)         │
├─────────────────────────────────────┤
│ • Concentré Rosin (50% complet)     │
│ • Hash Dry Sift (30% complet)       │
│ [Reprendre] [Supprimer]              │
└─────────────────────────────────────┘
```

**Activity Timeline**
```
Activité Récente:
├─ Vous avez aimé "Girl Scout Cookies" (3h)
├─ Export PDF réussi (5h)
├─ Review publiée "Brownie Chocolate" (1 jour)
└─ Commentaire reçu (2 jours)
```

---

#### **Tab 2: MES REVIEWS**

**Affichage Options**
- List view (tableau)
- Grid view (cards)
- Timeline view (chronologique)

**Filtres**
```
[Type ▼] [Statut ▼] [Date ▼] [Recherche...]
├─ Type: Fleurs | Hash | Concentré | Comestible
├─ Statut: Tous | Brouillon | Finalisée | Publiée
├─ Trier: Récent | Anciens | Alphabétique | Rating
└─ Recherche: Titre, cultivar, farm
```

**Colonnes (List View)**
- Titre
- Type
- Rating (scores moyenne)
- Statut (brouillon/finalisée/publiée)
- Créée
- Actions (Éditer, Export, Supprimer)

---

#### **Tab 3: FAVORIS**

Reviews marquées comme "favorites" (cœur/star)

**Sources Favoris**
- Vos propres reviews favorites
- Reviews publiques likées
- Reviews à revoir

---

#### **Tab 4: TRENDING**

**Trending Now** (Galerie Publique - Top de la semaine)
```
Classement Live:
1. 🔥 Review Title (542 likes, 89 comments)
2. 🔥 Another Review (387 likes, 54 comments)
3. 🔥 Third Review (198 likes, 32 comments)
```

**Fonctionnalités**
- Voir détails
- Like/Comment
- Partager
- Aller vers reviews complètes

---

### **5. STATISTIQUES RÉSUMÉES**

#### Cards Statistiques

**Cette Semaine**
- Reviews créées: X
- Exports réalisés: X
- Engagement reçu: X likes, X comments

**Ce Mois**
- Reviews créées: X
- Reviews publiées: X
- Vues totales: X

**Graphiques**
- Timeline des exports (graphique courbe)
- Types produits (pie chart)
- Engagement timeline (bar chart)

---

### **6. PIED DE PAGE & LIENS**

```
┌─────────────────────────────────────┐
│ [Aide] [À Propos] [Conditions]      │
│ [Politique] [Contact] [Feedback]    │
│                                      │
│ © 2025 Reviews-Maker | Made with ❤️ │
└─────────────────────────────────────┘
```

---

## 🎨 Layout Responsive

### Desktop (1024px+)
- Sidebar gauche fixe
- Contenu principal flexible
- 2-3 colonnes si possible

### Tablet (768px-1023px)
- Menu hamburger ou sidebar réduit
- Contenu full-width
- 1-2 colonnes

### Mobile (< 768px)
- Menu hamburger complet
- Full-width contenu
- Stack vertical unique colonne
- Bottom navigation bar

---

## 🔍 Recherche Globale

**Fonctionnalités**
```
[Recherche...] → Auto-suggest pendant saisie

Catégories Résultats:
├─ Reviews
│  ├─ Titre: "Girl Scout"
│  ├─ Cultivar: "Skywalker OG"
│  └─ Farm: "Green Paradise"
├─ Utilisateurs
│  ├─ Username: "ProducerXYZ"
│  └─ Bio matching
├─ Cultivars
│  ├─ "Master Kush"
│  └─ Breeder: "DNA Genetics"
└─ Tags
   └─ "Indoor Growing", etc.
```

---

## 💾 Modèle de Données

### HomePage Metadata
```typescript
// Pas de table distinct - données calculées depuis relations
// Statistiques: agregation depuis User + Reviews + Exports
// Timeline: agrégation depuis Activity logs

model ActivityLog {
  id: String @id
  userId: String
  user: User @relation(fields: [userId], references: [id])
  
  action: String // "review_created", "export_made", "like_received", etc
  targetType: String? // "review", "comment", "user"
  targetId: String?
  
  metadata: Json? // {"reviewTitle": "...", "exportFormat": "pdf"}
  
  createdAt: DateTime @default(now())
}
```

---

## 🔗 Fichiers Référence

- Frontend: `client/src/pages/Home.jsx` ou `client/src/pages/Dashboard.jsx`
- Composants: `client/src/components/home/` ou `client/src/components/dashboard/`
- Backend: `server-new/routes/home.js` (si données API)
- Store: `client/src/store/dashboardStore.js` (Zustand)
- Hooks: `client/src/hooks/useHome.js`

---

## ✅ Éléments à Implémenter

- [ ] Navigation principale responsive
- [ ] Onglets contenu (Aperçu, Mes Reviews, etc.)
- [ ] Cartes statistiques
- [ ] Filtrage reviews
- [ ] Recherche globale
- [ ] Dropdown profil
- [ ] Notifications dropdown
- [ ] Activity timeline
- [ ] Graphiques statistiques
- [ ] Pagination reviews

