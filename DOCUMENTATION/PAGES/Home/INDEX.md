# Home & Galerie Publique — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit. La version précédente décrivait un dashboard riche (timeline d'activité, graphiques, onglets Aperçu/Mes Reviews/Favoris/Trending, recherche globale multi-entités) — **rien de tout cela n'existe**. La Home réelle est une landing page minimaliste ; c'est la Galerie qui est réellement développée.

## Home — landing page simple, pas un dashboard

- **Page** : `client/src/pages/public/HomePage.jsx`
- **Contenu réel** : Hero avec titre "Terpologie" + infos utilisateur si connecté, et `ProductTypeCards` — 4 boutons de navigation vers les formulaires de création (Fleur/Hash/Concentré/Comestible)
- **Pas présent** : pas de dashboard de stats perso, pas de timeline d'activité, pas de galerie intégrée, pas de feed communautaire, pas de recherche globale, pas d'onglets Favoris/Trending

## Galerie Publique — fonctionnelle et complète

- **Frontend** : `client/src/pages/public/GalleryPage.jsx`
- **Backend** : `server-new/routes/gallery.js`

Fonctionnalités réelles confirmées :
- `GET /api/gallery` — liste des reviews publiques, filtres type/cultivar/breeder/farm/recherche texte, tri (récent/populaire/noté/vues)
- `GET /api/gallery/:id` — détails + tracking de vue (IP + user-agent enregistrés, anonyme)
- `POST /api/gallery/:id/like` — toggle like/dislike (une action par utilisateur)
- `POST /api/gallery/:id/comment` — commentaire (max 1000 caractères)
- `PUT /api/gallery/comments/:commentId` — édition de son propre commentaire
- `DELETE /api/gallery/comments/:commentId` — suppression douce (soft delete)

## Fichiers référence

- Frontend : `client/src/pages/public/HomePage.jsx`, `client/src/pages/public/GalleryPage.jsx`
- Backend : `server-new/routes/gallery.js`
