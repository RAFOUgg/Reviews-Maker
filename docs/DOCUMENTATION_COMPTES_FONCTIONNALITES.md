# 📋 Documentation Types de Comptes et Fonctionnalités - Reviews-Maker

**Version** : 2.0.0 (Refonte complète)  
**Date** : Décembre 2025  
**Auteur** : RAFOUgg  

---

## 👤 Système de Comptes Utilisateur

### Vue d'ensemble
Reviews-Maker utilise actuellement un **système de comptes unifié** où tous les utilisateurs authentifiés via Discord ont accès aux mêmes fonctionnalités de base. Il n'y a pas de hiérarchie de rôles ou de types de comptes différents.

### Types de Comptes Disponibles

#### 1. **Utilisateur Non Connecté (Visiteur)**
- **Accès limité** : Consultation uniquement
- **Fonctionnalités restreintes** : Lecture seule
- **Pas de personnalisation** : Interface générique

#### 2. **Utilisateur Connecté (Membre Discord)**
- **Accès complet** : Lecture + écriture + gestion
- **Fonctionnalités avancées** : Toutes disponibles
- **Personnalisation** : Profil, préférences, statistiques

---

## 🔐 États d'Authentification

### Visiteur (Non Connecté)
```
Permissions: Lecture seule
Interface: Générique, boutons "Se connecter"
Navigation: Accueil uniquement
```

### Membre (Connecté)
```
Permissions: Lecture + Écriture + Gestion
Interface: Personnalisée avec avatar Discord
Navigation: Toutes les pages disponibles
```

---

## 📋 Fonctionnalités Détaillées par Module

### 1. 🔐 **Authentification & Gestion de Compte**

#### Pour Tous les Utilisateurs
- **Connexion Discord OAuth2**
  - Flux sécurisé avec scopes `identify` et `email`
  - Callback automatique via `/auth/callback`
  - Sessions persistantes (7 jours)
  - Gestion des erreurs et fallbacks

- **Gestion de Session**
  - Vérification automatique au démarrage
  - Persistance cross-rechargements
  - Déconnexion sécurisée avec nettoyage

#### Pour Utilisateurs Connectés Uniquement
- **Profil Discord Intégré**
  - Avatar avec fallback UI-Avatars
  - Nom d'utilisateur + discriminateur
  - Email (si autorisé)
  - Date d'inscription

- **Menu Profil Dropdown**
  - Navigation rapide vers Bibliothèque/Stats/Paramètres
  - Indicateur visuel de connexion
  - Actions de déconnexion

---

### 2. 📝 **Système de Reviews**

#### Pour Visiteurs
- **Consultation Publique**
  - Liste des reviews publiques uniquement
  - Lecture détaillée des reviews
  - Tri et filtrage basique
  - Recherche par nom/description

#### Pour Membres Connectés
- **Création Complète**
  - Formulaire détaillé multi-étapes
  - Upload jusqu'à 10 images (10MB max chacune)
  - Sélection terpénique avec interface visuelle
  - Notation détaillée (apparence/arôme/goût/effets)
  - Gestion des métadonnées (cultivars, pipelines, etc.)

- **Gestion Personnelle**
  - Modification de ses propres reviews
  - Suppression avec confirmation
  - Changement visibilité (public/privé)
  - Historique complet des modifications

- **Interaction Sociale**
  - Système de likes/dislikes
  - Commentaires (planifié)
  - Partage (planifié)

---

### 3. 📚 **Bibliothèque Personnelle**

#### Fonctionnalités (Membres Connectés Uniquement)
- **Double Filtrage Avancé**
  - **Par visibilité** : Toutes / Publiques / Privées
  - **Par type** : Toutes / Fleur / Hash / Concentré / Comestible

- **Gestion des Reviews**
  - Vue grille/liste des reviews personnelles
  - Actions rapides : modifier, supprimer, changer visibilité
  - Statistiques par review (likes, vues, etc.)

- **Tri et Organisation**
  - Tri par date, note, popularité
  - Recherche dans ses propres reviews
  - Pagination optimisée

---

### 4. 📊 **Statistiques & Analytics**

#### Fonctionnalités (Membres Connectés Uniquement)
- **Tableau de Bord Complet**
  - **4 cartes principales** :
    - 📊 Total des reviews
    - ⭐ Note moyenne globale
    - 📈 Type de produit préféré
    - 📅 Membre depuis (date d'inscription)

- **Analyse Détaillée par Catégorie**
  - **Visuel** : Calculé depuis densité, trichomes, pistils, etc.
  - **Odeur** : Basé sur les arômes sélectionnés
  - **Goût** : Basé sur les goûts sélectionnés
  - **Effets** : Durée et intensité des effets

- **Répartition par Type**
  - Graphique en barres horizontales
  - Pourcentages visuels avec gradients
  - Compteurs détaillés par catégorie

- **Top Cultivars**
  - Classement 1-5 avec médailles
  - Comptage automatique des mentions
  - Extraction intelligente depuis le champ cultivars

- **Activité Récente**
  - 5 dernières reviews créées
  - Icônes par type de produit
  - Liens cliquables vers les détails

---

### 5. ⚙️ **Paramètres & Préférences**

#### Fonctionnalités (Membres Connectés Uniquement)
- **Système de Thème Dynamique**
  - **3 modes principaux** :
    - ☀️ **Clair** : Thème lumineux
    - 🌙 **Sombre** : Thème sombre
    - 🔄 **Automatique** : Suit les préférences système
  - Application en temps réel sans rechargement
  - Persistence via localStorage
  - Support media queries système

- **Préférences Utilisateur**
  - **Type de produit par défaut** : Fleur/Hash/Concentré/Comestible
  - **Visibilité par défaut** : Publique/Privée
  - **Format d'export** : PNG/PDF/JSON (planifié)
  - **Vue compacte** : Toggle pour densité d'affichage
  - **Notifications** : Activation/désactivation des toasts

- **Informations Compte**
  - Avatar Discord avec bordure stylisée
  - Nom utilisateur + email
  - Statut "Connecté via Discord • Membre depuis [date]"
  - Confirmation visuelle des sauvegardes

---

### 6. 🎨 **Interface Utilisateur**

#### Pour Tous les Utilisateurs
- **Design System Cohérent**
  - Palette de couleurs (Violet/Émeraude/Rose)
  - Typographie Inter + JetBrains Mono
  - Grille d'espacement 8px
  - Animations Framer Motion fluides

- **Responsive Design**
  - Optimisé mobile et desktop
  - Breakpoints Tailwind CSS
  - Navigation adaptative

#### Pour Membres Connectés
- **Interface Personnalisée**
  - Avatar dans la navigation
  - Menu dropdown professionnel
  - Thème persistant
  - État de connexion visible

---

### 7. 📤 **Système d'Export** (Archivé)

#### Statut : Fonctionnalités Archivées
Les fonctionnalités d'export ont été **déplacées vers `archive/debug/`** et ne sont plus actives dans la version actuelle.

#### Fonctionnalités Historiques (Non Disponibles)
- **Export Studio** : `export-studio.js` + `export-studio-ui.js`
- **Formats Supportés** : PNG, PDF, JSON
- **Interface Modale** : Intégrée dans `review.html`
- **Styles Dédiés** : `export-studio.css`

#### Migration Planifiée
- Réintégration dans la nouvelle architecture React
- Support des nouveaux formats d'export
- Interface modernisée avec les composants actuels

---

### 8. 💰 **Système de Prix** (Planifié)

#### Statut : Non Implémenté
Aucune fonctionnalité de prix/monétisation n'est actuellement implémentée.

#### Concepts Futurs (Roadmap)
- **Prix des Produits** : Champ optionnel dans les reviews
- **Évolution des Prix** : Historique et graphiques
- **Comparaisons** : Prix moyens par cultivar/type
- **Alertes Prix** : Notifications de changements

---

### 9. 🌿 **Données Cannabis Structurées**

#### Pour Tous les Utilisateurs
- **Base de Données Terpènes** : 20+ terpènes avec propriétés complètes
- **Arômes, Goûts, Effets** : Listes exhaustives pour sélections
- **Données Structurées** : JSON normalisé pour tous les champs

#### Pour Membres Connectés
- **Sélection Interactive** : Roue des terpènes, sélecteurs visuels
- **Validation Automatique** : Contrôle des données saisies
- **Suggestions IA** : Planifié pour recommandations

---

## 🔄 États et Transitions

### Flux Utilisateur Standard

```
Visiteur
    ↓ Connexion Discord
Membre Connecté
    ↓ Actions disponibles
├── Créer Review
├── Gérer Bibliothèque
├── Consulter Stats
├── Modifier Paramètres
└── Interagir (likes)
```

### États d'Interface

#### Non Connecté
- Boutons "Se connecter" prominents
- Fonctionnalités grisées ou masquées
- Messages d'encouragement à la connexion

#### Connecté
- Interface complète accessible
- Avatar et menu profil visibles
- Actions contextuelles disponibles
- État de session maintenu

---

## 🚀 Fonctionnalités Planifiées (Roadmap)

### Court Terme (2026)
- **Système de Commentaires** : Discussion sous reviews
- **Notifications Web** : Alertes personnalisées
- **Export Réactivé** : Nouveaux formats et interface
- **Recherche Avancée** : Filtres complexes

### Moyen Terme
- **Système de Prix** : Intégration économique
- **API Publique** : Accès développeur
- **Analytics Avancés** : Métriques détaillées
- **Modération** : Outils administrateur

### Long Terme
- **Rôles Utilisateur** : Système hiérarchique
- **Monétisation** : Abonnements, premium
- **IA Intégrée** : Suggestions, analyses
- **Mobile App** : Applications natives

---

## 📊 Métriques d'Utilisation

### Statistiques par Type de Compte

#### Visiteurs
- **Sessions** : Navigation, consultation
- **Actions** : Recherche, tri, lecture
- **Conversion** : Taux d'inscription

#### Membres
- **Création** : Nombre de reviews publiées
- **Interaction** : Likes, commentaires (futur)
- **Engagement** : Fréquence d'utilisation
- **Retention** : Durée des sessions

---

## 🔧 Configuration Technique

### Permissions par Endpoint

#### Public (Sans Auth)
```
GET /api/reviews           # Liste reviews publiques
GET /api/reviews/:id       # Détail review publique
GET /api/users/:id/profile # Profil public utilisateur
```

#### Authentifié Uniquement
```
POST /api/reviews          # Créer review
PUT /api/reviews/:id       # Modifier sa review
DELETE /api/reviews/:id    # Supprimer sa review
GET /api/users/me/*        # Données personnelles
POST /api/reviews/*/like   # Système de likes
```

### Gestion des Sessions
- **Stockage** : SQLite via connect-sqlite3
- **Sérialisation** : User ID uniquement
- **Expiration** : 7 jours par défaut
- **Sécurité** : Cookies httpOnly, secure en production

---

## 🎯 Recommandations d'Amélioration

### Pour l'Expérience Utilisateur
1. **Onboarding Amélioré** : Guide pour nouveaux membres
2. **Progression Visuelle** : Indicateurs d'accomplissement
3. **Gamification** : Badges, niveaux, récompenses

### Pour la Sécurité
1. **Rôles Hiérarchiques** : Admin, Modérateur, Utilisateur
2. **Permissions Granulaires** : Contrôle fin des accès
3. **Audit Trail** : Logs des actions sensibles

### Pour la Monétisation
1. **Fonctionnalités Premium** : Export avancé, analytics
2. **API Payante** : Accès développeur tarifé
3. **Marketplace** : Vente de données/reviews

---

**Documentation générée le 9 décembre 2025**  
*Révision basée sur l'analyse du code source actuel*</content>
<parameter name="filePath">c:\Users\jadeb\Desktop\RAFOU\Reviews-Maker\DOCUMENTATION_COMPTES_FONCTIONNALITES.md
