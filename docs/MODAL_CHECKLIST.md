# Checklist de Vérification - Modal de Compte

## ✅ Tests Fonctionnels

### Affichage du modal
- [ ] Cliquer sur le bouton 🔗 ouvre le modal si connecté
- [ ] Cliquer sur le bouton 🔗 ouvre le modal d'auth si non connecté
- [ ] L'overlay sombre apparaît derrière le modal
- [ ] Le modal est centré à l'écran
- [ ] Le contenu du modal est lisible

### Fermeture du modal
- [ ] Cliquer sur le bouton ✕ ferme le modal
- [ ] Cliquer sur l'overlay ferme le modal
- [ ] Appuyer sur Échap ferme le modal
- [ ] L'overlay disparaît avec le modal

### Navigation au clavier
- [ ] Tab permet de naviguer entre les éléments
- [ ] Shift+Tab permet de naviguer en arrière
- [ ] Le focus reste dans le modal (pas de sortie)
- [ ] Premier élément est focus automatiquement

### Contenu du modal
- [ ] L'email est affiché correctement
- [ ] Les statistiques sont affichées (Total, Public, Privé)
- [ ] Le bouton "Ma bibliothèque" fonctionne
- [ ] Le bouton "Se déconnecter" fonctionne
- [ ] Le bouton "⚙️ Paramètres" fonctionne

## 🔍 Tests Techniques

### CSS
- [ ] Aucun conflit de `display: none !important`
- [ ] La classe `.show` s'applique correctement
- [ ] Le z-index est correct (modal > overlay > page)
- [ ] Pas de règles CSS en double
- [ ] L'overlay a un blur et une transparence

### JavaScript
- [ ] Aucune erreur dans la console
- [ ] `dom.accountModal` est défini
- [ ] `dom.accountModalOverlay` est défini
- [ ] Les event listeners sont attachés
- [ ] `openAccountModal()` fonctionne
- [ ] `closeAccountModal()` fonctionne

### HTML
- [ ] L'overlay est en dehors du modal
- [ ] Le modal a un ID unique
- [ ] Les attributs ARIA sont présents
- [ ] Les boutons ont des labels appropriés

## 🎨 Tests Visuels

### Desktop (> 980px)
- [ ] Le modal fait 980px de large
- [ ] Le modal est centré
- [ ] L'overlay couvre tout l'écran
- [ ] Les animations sont fluides

### Tablet (768px - 980px)
- [ ] Le modal fait 94vw de large
- [ ] Le modal reste centré
- [ ] Le contenu est lisible
- [ ] Les marges sont appropriées

### Mobile (< 768px)
- [ ] Le modal s'adapte à la largeur
- [ ] Le contenu ne déborde pas
- [ ] Les boutons sont accessibles
- [ ] Le scroll fonctionne dans le modal

## 🐛 Tests de Régression

### Autres modaux
- [ ] Le modal d'auth fonctionne toujours
- [ ] Le modal de bibliothèque fonctionne
- [ ] Le modal d'export fonctionne
- [ ] Aucun conflit entre modaux

### Fonctionnalités
- [ ] La déconnexion fonctionne
- [ ] La connexion fonctionne
- [ ] Les reviews s'affichent correctement
- [ ] Les statistiques se mettent à jour

## 📊 Performance

- [ ] Le modal s'ouvre en < 100ms
- [ ] Pas de lag lors de l'ouverture
- [ ] Pas de lag lors de la fermeture
- [ ] Le blur de l'overlay est performant

## ♿ Accessibilité

- [ ] Le modal est annoncé par les lecteurs d'écran
- [ ] Les boutons ont des labels
- [ ] Le contraste est suffisant
- [ ] La navigation au clavier fonctionne

## 📝 Code Quality

- [ ] Pas de `console.log` inutiles
- [ ] Le code est commenté
- [ ] Les fonctions ont des JSDoc
- [ ] Pas de code dupliqué
- [ ] Les noms de variables sont clairs

## 🚀 Prêt pour Production

- [ ] Tous les tests passent
- [ ] Aucune erreur console
- [ ] Performance OK
- [ ] Accessibilité OK
- [ ] Code propre et documenté

---

**Date de vérification :** _____________  
**Testeur :** _____________  
**Résultat :** ⭕ OK / ❌ À corriger
