# 🚀 DÉMARRAGE RAPIDE - Reviews-Maker (Post-Refonte Nov 2025)

## ⚡ Lancement immédiat

### Terminal 1 - Backend (Server-New)
```powershell
cd server-new
npm install  # Si première fois
npm start    # Lance sur http://localhost:3000
```

### Terminal 2 - Frontend (Client Vite)
```powershell
cd client
npm install  # Si première fois
npm run dev  # Lance sur http://localhost:5173
```

### Accès :
🌐 **Frontend** : http://localhost:5173  
🔧 **Backend** : http://localhost:3000/api

---

## 🎯 Navigation complète

### Pages publiques :
- **/** → Accueil (liste reviews publiques)
- **/review/:id** → Détail d'une review

### Pages authentifiées :
- **/create** → Créer nouvelle review
- **/edit/:id** → Modifier review existante
- **/library** → Ma bibliothèque (filtres visibilité + type)
- **/stats** → Mes statistiques (graphiques, top cultivars)
- **/settings** → Paramètres (thème, préférences)

### Auth :
- **/auth/callback** → Callback Discord OAuth2

---

## 🎨 Nouvelles fonctionnalités (Nov 2025)

### 1. Menu Profil (Dropdown)
Clic sur avatar en haut à droite :
- 📚 **Ma bibliothèque** → Gérer reviews
- 📊 **Mes statistiques** → Voir stats détaillées
- ⚙️ **Paramètres** → Thème + préférences
- ➡️ **Déconnexion** → Logout

### 2. Page Statistiques (`/stats`)
**Overview Cards :**
- 📊 Total Reviews
- ⭐ Note moyenne /10
- 📈 Type préféré
- 📅 Membre depuis

**Sections :**
- Notes moyennes par catégorie (👁️👃👅⚡)
- Répartition par type (graphiques)
- 🌿 Top 5 Cultivars
- 📈 Activité récente (5 dernières reviews)

### 3. Page Paramètres (`/settings`)
**Thème de l'application :**
- ☀️ Clair
- 🌙 Sombre
- 🔄 Automatique (suit système)
- ✅ Changement temps réel sans rechargement

**Préférences par défaut :**
- Type de produit (Fleur/Hash/Concentré/Comestible)
- Visibilité (Publique/Privée)
- Format d'export (PNG/PDF/JSON)
- Vue compacte (toggle)
- Notifications (toggle)

**Persistence :** Tout sauvegardé dans `localStorage`

### 4. Bibliothèque améliorée (`/library`)
**Nouveaux filtres :**
- **Visibilité** : Toutes / Publiques / Privées
- **Type** : Tous / 🌸 Fleur / 🧊 Hash / 💎 Concentré / 🍪 Comestible

**Actions par review :**
- 👁️ Changer visibilité
- 🔍 Voir détails
- ✏️ Modifier
- 🗑️ Supprimer

---

## 🛠️ Modifications récentes

### Champs produits remplacés :
**Ancien :**
- `couleur` (texte libre)

**Nouveau :**
- `pistils` (slider /10)
- `moisissure` (slider /10, 10 = aucune)
- `graines` (slider /10, 10 = aucune)

### Calcul notes automatique :
**Catégorie Visuel** calculée depuis :
- pistils, moisissure, graines
- densite, trichomes
- malleabilite, transparence

**Affichage header :**
```
👁️ 7.5 • 👃 0.0 • 👅 0.0 • ⚡ 0.0 │ Global 7.5 /10
```

---

## 🎨 Système de thème

### Activation :
1. Connectez-vous
2. Menu profil → Paramètres
3. Section "Thème de l'application"
4. Cliquez sur ☀️ Clair / 🌙 Sombre / 🔄 Auto

### Technique :
- Classe `dark` ajoutée/supprimée sur `<html>`
- Tailwind CSS applique automatiquement variants `dark:`
- Mode auto écoute `prefers-color-scheme`
- Persistence via `localStorage.theme`

---

## 📊 API Endpoints utilisés

### Auth :
- `GET /api/auth/me` → Vérifier session
- `POST /api/auth/logout` → Déconnexion

### Reviews :
- `GET /api/reviews` → Liste publiques
- `GET /api/reviews/my` → Mes reviews
- `POST /api/reviews` → Créer
- `PUT /api/reviews/:id` → Modifier
- `DELETE /api/reviews/:id` → Supprimer
- `PATCH /api/reviews/:id/visibility` → Changer visibilité

### User :
- `GET /api/users/me/stats` → Mes statistiques
- `GET /api/users/:id/profile` → Profil public

---

## 🐛 Troubleshooting

### Le thème ne change pas ?
1. Vérifiez `localStorage.theme` dans DevTools
2. Inspectez `<html class="dark">` dans Elements
3. Rechargez la page (Ctrl+R)

### Statistiques vides ?
- Créez au moins 1 review
- Vérifiez `/api/reviews/my` retourne vos reviews
- Vérifiez `/api/users/me/stats` retourne données

### Menu profil n'apparaît pas ?
- Vérifiez authentification (`user` dans store)
- Console DevTools → erreurs réseau ?
- Rechargez session (F5)

### Filtres bibliothèque ne marchent pas ?
- Vérifiez `filter` et `typeFilter` dans React DevTools
- Console → erreurs JS ?
- Reviews ont bien propriétés `type` et `isPublic` ?

---

## 📁 Structure fichiers clés

```
client/src/
├── App.jsx                        # Routes (/, /stats, /settings...)
├── pages/
│   ├── HomePage.jsx              # Liste reviews publiques
│   ├── CreateReviewPage.jsx      # Formulaire création
│   ├── EditReviewPage.jsx        # Formulaire édition
│   ├── ReviewDetailPage.jsx      # Détail review
│   ├── LibraryPage.jsx           # Bibliothèque (filtres++)
│   ├── StatsPage.jsx             # ✨ NOUVEAU - Statistiques
│   └── SettingsPage.jsx          # ✨ NOUVEAU - Paramètres
├── components/
│   ├── UserProfileDropdown.jsx   # Menu profil (liens stats/settings)
│   ├── Layout.jsx                # Layout général
│   └── ToastContainer.jsx        # Notifications
└── utils/
    └── productStructures.js      # Structures formulaires

server-new/
├── server.js                      # Express app
├── routes/
│   ├── auth.js                   # Discord OAuth2
│   ├── reviews.js                # CRUD reviews
│   └── users.js                  # Stats + profils
└── middleware/
    └── auth.js                   # requireAuth, optionalAuth
```

---

## ✅ Checklist démarrage

- [ ] `npm install` dans `server-new` et `client`
- [ ] Variables d'environnement `.env` configurées
- [ ] Backend lancé sur :3000
- [ ] Frontend lancé sur :5173
- [ ] Connexion Discord fonctionne
- [ ] Créer une review test
- [ ] Tester filtres bibliothèque
- [ ] Voir stats dans `/stats`
- [ ] Changer thème dans `/settings`
- [ ] Vérifier menu profil dropdown

---

## 🎉 Tout est prêt !

Le système complet est fonctionnel :
- ✅ Menu profil professionnel
- ✅ Bibliothèque avec filtres avancés
- ✅ Statistiques détaillées
- ✅ Paramètres avec thème dynamique
- ✅ Notes calculées automatiquement
- ✅ Nouveaux champs qualité (pistils/moisissure/graines)

**Bon développement ! 🚀**
