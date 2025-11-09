# Correctif - Photo de Profil Galerie Publique

## Date : 9 novembre 2025

## Problème identifié
La photo de profil Discord des auteurs n'était pas affichée dans la galerie publique (page d'accueil). Seules les initiales étaient visibles, même quand une vraie photo de profil était disponible.

## Solution apportée

### 1. Affichage de l'avatar réel
Modification du composant avatar dans les cartes de review pour :
- Vérifier si `review.author?.avatar` existe
- Afficher la vraie photo de profil si disponible
- Fallback automatique vers les initiales si l'image ne charge pas ou n'existe pas

### 2. Intégration du système de thèmes
Application des variables CSS du thème actif pour harmoniser l'affichage :
- Utilisation de `var(--gradient-primary)` pour le fond des initiales
- Bordure de l'avatar avec `var(--primary)`
- Cohérence visuelle avec la modal de profil

### Code avant (ligne 246-258)
```jsx
<div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold group-hover/author:scale-110 transition-transform">
    {(review.ownerName || review.author?.username || 'A')[0].toUpperCase()}
</div>
```

### Code après
```jsx
<div className="relative w-6 h-6 flex-shrink-0">
    {review.author?.avatar ? (
        <img
            src={review.author.avatar}
            alt={review.author.username || 'Avatar'}
            className="w-6 h-6 rounded-full object-cover border-2 group-hover/author:scale-110 transition-all shadow-sm"
            style={{ 
                borderColor: 'var(--primary)',
                opacity: 0.8
            }}
            onError={(e) => {
                // Fallback si l'image ne charge pas
                e.target.style.display = 'none'
                e.target.nextSibling.style.display = 'flex'
            }}
        />
    ) : null}
    <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold group-hover/author:scale-110 transition-transform shadow-sm"
        style={{ 
            background: 'var(--gradient-primary)',
            display: review.author?.avatar ? 'none' : 'flex' 
        }}
    >
        {(review.ownerName || review.author?.username || 'A')[0].toUpperCase()}
    </div>
</div>
```

## Fonctionnalités ajoutées

### Affichage conditionnel intelligent
1. **Photo disponible** : Affichage de l'image Discord avec bordure thématique
2. **Photo indisponible ou erreur** : Fallback automatique vers les initiales stylisées
3. **Hover effect** : Animation de zoom (scale 110%) au survol

### Gestion d'erreur robuste
```jsx
onError={(e) => {
    e.target.style.display = 'none'
    e.target.nextSibling.style.display = 'flex'
}}
```
Cette fonction garantit que si l'image Discord ne charge pas (serveur indisponible, avatar supprimé, etc.), l'utilisateur voit immédiatement le fallback élégant.

### Style thématique
- **Bordure** : `var(--primary)` - s'adapte au thème actif
- **Fond initiales** : `var(--gradient-primary)` - cohérent avec le reste de l'UI
- **Ombre** : `shadow-sm` - profondeur visuelle subtile
- **Opacité** : 0.8 sur la photo pour adoucir l'apparence

## Fichiers modifiés
1. `client/src/pages/HomePageV2.jsx`
   - Lignes 246-268 : Refactorisation du composant avatar
   - Ajout de la logique d'affichage conditionnel
   - Intégration des variables CSS du thème

## Cohérence avec la modal de profil
Cette modification aligne l'affichage des avatars dans la galerie avec celui de la modal `AuthorStatsModal`, garantissant une expérience utilisateur cohérente dans toute l'application.

## Tests à effectuer
1. ✅ Ouvrir http://localhost:5173
2. ✅ Vérifier que les photos Discord s'affichent dans les cartes de review
3. ✅ Tester le fallback en simulant une erreur de chargement
4. ✅ Changer de thème et vérifier l'adaptation des couleurs
5. ✅ Tester le hover effect (zoom au survol)

## Avant/Après

### Avant
- ❌ Initiales uniquement (cercle vert fixe)
- ❌ Pas de photo de profil Discord
- ❌ Couleur hardcodée (vert)

### Après
- ✅ Photo de profil Discord affichée
- ✅ Fallback intelligent vers initiales
- ✅ Couleurs adaptées au thème actif
- ✅ Cohérence visuelle avec toute l'application

## Impact utilisateur
Les utilisateurs peuvent maintenant :
- **Identifier facilement** les auteurs grâce à leur vraie photo
- **Personnaliser** l'apparence avec leur thème préféré
- **Bénéficier d'une UI cohérente** partout dans l'application

## Notes techniques
- Format d'avatar Discord : géré par `server-new/utils/reviewFormatter.js`
- URL : `https://cdn.discordapp.com/avatars/{discordId}/{avatar}.png`
- Taille optimisée : 6x6 (24x24px) pour les cartes compactes
- 24x24 (96x96px) pour la modal de profil

## Prochaines améliorations possibles
- [ ] Ajouter un indicateur de chargement pour les avatars
- [ ] Précharger les avatars pour optimiser les performances
- [ ] Ajouter un tooltip avec le nom complet au survol
- [ ] Cache des avatars côté client (localStorage)
