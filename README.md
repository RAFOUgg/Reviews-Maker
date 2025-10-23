# Reviews Maker

Studio web ergonomique pour composer, visualiser et exporter des fiches de review produits cannabiniques avec un rendu premium prêt à partager.

<!-- Optional: Add a screenshot or GIF of the application in action -->
<!-- ![Aperçu de Reviews Maker](link/to/screenshot.png) -->

## ✨ Fonctionnalités Principales

- **Assistant de Création Guidé** : Choisissez parmi plusieurs types de produits (Hash, Fleur, Concentré, Comestible) pour obtenir un formulaire de saisie adapté.
- **Formulaires Détaillés et Dynamiques** : Des sections et des champs spécifiques à chaque type de produit, avec des listes de choix prédéfinis pour accélérer la saisie.
- **Prévisualisation en Temps Réel** : Visualisez le rendu final de votre review au fur et à mesure que vous remplissez les informations.
- **Export Studio** : Personnalisez et exportez vos reviews en images PNG haute définition, prêtes à être partagées.
- **Gestion des Reviews** : Une galerie publique pour découvrir les créations de la communauté et une bibliothèque personnelle pour gérer vos propres reviews (publiques ou privées).
- **Comptes Utilisateurs** : Liez votre compte via un système d'authentification par e-mail (intégré avec Discord) pour synchroniser vos reviews et accéder à vos statistiques.
- **Profils Publics** : Consultez les statistiques et les reviews publiques d'autres utilisateurs.
- **Raccourcis Clavier** : Optimisez votre vitesse de saisie avec des raccourcis pour la navigation entre les sections et la génération de l'aperçu.
- **Interface Responsive** : Une expérience utilisateur optimale sur ordinateur de bureau.

## 🚀 Comment Utiliser

1.  **Accueil (`index.html`)**
    - Sélectionnez le type de produit que vous souhaitez analyser.
    - Parcourez la galerie des dernières reviews publiques.

2.  **Studio de Création (`review.html`)**
    - Remplissez les champs du formulaire.
    - Utilisez l'aperçu en direct pour voir le résultat.
    - Une fois terminé, enregistrez votre review.
    - Exportez votre fiche en tant qu'image PNG via l'Export Studio.

## Vues de l'application

L'application est composée de deux vues principales :

-   **`index.html` (Accueil)** : Le point d'entrée où l'utilisateur choisit le type de produit à évaluer. Cette page affiche également une galerie compacte des reviews publiques récentes et permet d'accéder à la galerie complète.
-   **`review.html` (Studio)** : L'espace de travail principal. Il contient le formulaire de saisie dynamique à gauche et le panneau de prévisualisation à droite. C'est ici que la magie opère : de la saisie des données à l'export final.

Des fenêtres modales sont utilisées pour des fonctionnalités telles que :
- La connexion et l'inscription (`authModal`)
- La gestion du compte utilisateur (`accountModal`)
- La visualisation des profils publics (`publicProfileModal`)
- L'affichage de la bibliothèque complète (`libraryModal`)
- Les astuces et raccourcis (`tipsModal`)
- L'export personnalisé (`exportStudioModal`)

## 🔧 Stack Technique

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla JS). Aucune dépendance à un framework, ce qui le rend léger et rapide.
- **Export d'image** : Utilise la bibliothèque `html2canvas` (chargée via CDN).
- **Backend (Optionnel)** : Un serveur Node.js/Express est disponible dans le dossier `/server` pour gérer :
    - L'authentification des utilisateurs.
    - Le stockage des reviews dans une base de données SQLite.
    - Le stockage des images uploadées.

## 🔐 Authentification

L'authentification est gérée par un backend qui s'intègre avec le **LaFoncedalleBot** (Discord) pour lier les comptes utilisateurs à leur identité Discord via leur adresse e-mail.

---

Bonnes reviews ! 🌿
