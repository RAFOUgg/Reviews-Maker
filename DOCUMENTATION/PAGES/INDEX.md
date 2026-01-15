# Documentation PAGES - Index Complet

## 📋 Vue d'ensemble

Cette documentation référence l'intégralité des pages, systèmes et données du projet Reviews-Maker selon leur structure fonctionnelle et interfaciale.

---

## 🗂️ Structure Principale

### 1. **CREATE_REVIEWS** - Création de Reviews
Système principal de création et édition de reviews pour tous les types de produits.

- [Fleurs (Herbes/Buds)](./CREATE_REVIEWS/FLEURS/INDEX.md)
  - Section 1: Informations Générales
  - Section 2: Génétiques & Généalogie
  - Section 3: Pipeline Culture
  - Section 4: Visuel & Technique
  - Section 5: Odeurs
  - Section 6: Texture
  - Section 7: Goûts
  - Section 8: Effets Ressentis
  - Section 9: Pipeline Curing/Maturation

- [Hash (Hash, Kief, Ice-O-Lator, Dry-Sift)](./CREATE_REVIEWS/HASHS/INDEX.md)
  - Section 1: Informations Générales
  - Section 2: Pipeline Séparation
  - Section 3: Visuel & Technique
  - Section 4: Odeurs
  - Section 5: Texture
  - Section 6: Goûts
  - Section 7: Effets Ressentis
  - Section 8: Pipeline Curing/Maturation

- [Concentrés (Rosin, BHO, etc.)](./CREATE_REVIEWS/CONCENTRES/INDEX.md)
  - Section 1: Informations Générales
  - Section 2: Pipeline Extraction
  - Section 3: Pipeline Purification
  - Section 4: Visuel & Technique
  - Section 5: Odeurs
  - Section 6: Texture
  - Section 7: Goûts
  - Section 8: Effets Ressentis
  - Section 9: Pipeline Curing/Maturation

- [Comestibles](./CREATE_REVIEWS/COMESTIBLES/INDEX.md)
  - Section 1: Informations Générales
  - Section 2: Pipeline Recette
  - Section 3: Goûts
  - Section 4: Effets Ressentis

---

### 2. **BIBLIOTHEQUE** - Gestion des Ressources Utilisateur
Système de gestion des ressources sauvegardées et réutilisables.

- [Cultivars & Génétiques](./BIBLIOTHEQUE/CULTIVARS/INDEX.md)
- [Reviews Sauvegardées](./BIBLIOTHEQUE/REVIEWS/INDEX.md)
- [Templates & Aperçus Export](./BIBLIOTHEQUE/TEMPLATES/INDEX.md)
- [Filigranes Personnalisés](./BIBLIOTHEQUE/FILIGRANES/INDEX.md)
- [Données Récurrentes](./BIBLIOTHEQUE/DONNEES_RECURRENTES/INDEX.md)
  - Substrats utilisés
  - Engrais utilisés
  - Matériel utilisé
  - Techniques de culture

---

### 3. **PROFILS** - Gestion des Comptes
Système de gestion des profils utilisateurs et leurs données.

- [Informations Personnelles](./PROFILS/INFORMATIONS_PERSONNELLES/INDEX.md)
- [Données Entreprise](./PROFILS/DONNEE_COMPTES/DONNES_ENTREPRISE/INDEX.md)
  - Profil Entreprise
  - Statistiques
  - Préférences
- [KYC & Vérification](./PROFILS/KYC/INDEX.md)
- [Préférences & Paramètres](./PROFILS/PREFERENCES/INDEX.md)

---

### 4. **HOME** - Page d'Accueil
Page d'accueil et navigation principale.

- [Navigation Principale](./Home/NAVIGATION/INDEX.md)
- [Dashboard Utilisateur](./Home/DASHBOARD/INDEX.md)
- [Statistiques Rapides](./Home/STATISTIQUES/INDEX.md)
- [Galerie Publique](./Home/GALERIE_PUBLIQUE/INDEX.md)

---

## 🔄 Systèmes Transversaux

### Systèmes Globaux (voir [SYSTEMES_GLOBAUX.md](./SYSTEMES_GLOBAUX.md))

- **Export Maker** - Système d'export des reviews
- **Authentification** - OAuth, sessions, JWT
- **Base de Données** - Prisma, schéma entités
- **Gestion des Fichiers** - Uploads, images, documents
- **Internationalization** - Multilingue (i18n)
- **Stockage Données** - Données statiques (JSON)

---

## 📊 Type de Comptes & Permissions

- **Amateur** - Accès basique aux templates
- **Producteur** - Accès complet + templates personnalisés
- **Influenceur** - Accès aperçus détaillés

Voir: [PERMISSIONS.md](./PERMISSIONS.md)

---

## 🔗 Navigation

- [Lire la documentation complète des systèmes](./SYSTEMES_GLOBAUX.md)
- [Voir les permissions par rôle](./PERMISSIONS.md)
- [Consulter les modèles de données](./DONNEES_SCHEMAS.md)
