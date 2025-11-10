# 🧪 Tests d'Intégration Orchard Studio

## Checklist de tests complets

### ✅ Phase 1: Tests de base

#### Test 1.1: Accès depuis CreateReviewPage
- [ ] Naviguer vers `/create?type=Fleur`
- [ ] Vérifier que le bouton "🎨 Aperçu" est visible dans le header (en haut à droite)
- [ ] Le bouton a un gradient purple→pink
- [ ] Au survol, le bouton change de couleur

#### Test 1.2: Ouverture du modal
- [ ] Cliquer sur "🎨 Aperçu"
- [ ] Le modal Orchard Studio s'ouvre en plein écran
- [ ] Animation d'apparition fluide (fade + scale)
- [ ] L'overlay sombre apparaît derrière le modal

#### Test 1.3: Fermeture du modal
- [ ] Cliquer sur le bouton X (en haut à droite)
- [ ] Le modal se ferme avec animation
- [ ] Appuyer sur ESC
- [ ] Le modal se ferme
- [ ] Cliquer sur l'overlay (zone sombre)
- [ ] Le modal se ferme
- [ ] Après fermeture, retour au formulaire de création

#### Test 1.4: Accès depuis EditReviewPage
- [ ] Créer une review (si pas déjà fait)
- [ ] Naviguer vers `/edit/{id}`
- [ ] Vérifier que le bouton "🎨 Aperçu" est visible
- [ ] Cliquer dessus, Orchard s'ouvre
- [ ] Les données de la review existante sont chargées

---

### ✅ Phase 2: Tests de transmission de données

#### Test 2.1: Données du formulaire (CreateReviewPage)
**Prérequis:** Remplir le formulaire avec:
- Nom commercial: "Test Cannabis"
- Type: "Fleur"
- Description: "Ceci est une description de test"
- Upload d'au moins 1 image
- Tags: ["indica", "relaxant"]

**Tests:**
- [ ] Ouvrir Orchard Studio
- [ ] Vérifier que le titre affiché est "Test Cannabis"
- [ ] Vérifier que la catégorie est "Fleur"
- [ ] Vérifier que la description apparaît
- [ ] Vérifier que l'image uploadée s'affiche
- [ ] Vérifier que les tags sont visibles (si module activé)

#### Test 2.2: Données existantes (EditReviewPage)
**Prérequis:** Éditer une review existante

**Tests:**
- [ ] Ouvrir Orchard Studio
- [ ] Vérifier que toutes les données de la review sont chargées
- [ ] Vérifier que les images existantes s'affichent
- [ ] Modifier un champ dans le formulaire (ex: description)
- [ ] Fermer Orchard, rouvrir
- [ ] La modification doit apparaître (données en temps réel)

#### Test 2.3: Calcul de la note globale
**Prérequis:** Remplir des notes dans différentes catégories

**Tests:**
- [ ] Ajouter des notes visuelles, aromatiques, etc.
- [ ] Ouvrir Orchard Studio
- [ ] Vérifier que la note globale affichée correspond au calcul
- [ ] Modifier une note dans le formulaire
- [ ] Fermer et rouvrir Orchard
- [ ] La note globale doit être mise à jour

---

### ✅ Phase 3: Tests des fonctionnalités Orchard

#### Test 3.1: Sélection de templates
- [ ] Ouvrir Orchard Studio
- [ ] Onglet "Templates"
- [ ] Sélectionner "Modern Compact"
- [ ] La prévisualisation change instantanément
- [ ] Sélectionner "Detailed Card"
- [ ] La prévisualisation change
- [ ] Sélectionner "Blog Article"
- [ ] La prévisualisation change
- [ ] Sélectionner "Social Story"
- [ ] La prévisualisation change

#### Test 3.2: Changement de ratio
- [ ] Template: Modern Compact
- [ ] Sélectionner ratio 1:1
- [ ] Prévisualisation s'adapte (carré)
- [ ] Sélectionner ratio 16:9
- [ ] Prévisualisation s'adapte (rectangle horizontal)
- [ ] Sélectionner ratio 9:16
- [ ] Prévisualisation s'adapte (rectangle vertical)

#### Test 3.3: Personnalisation des couleurs
- [ ] Onglet "Couleurs"
- [ ] Sélectionner palette "Ocean"
- [ ] Les couleurs changent instantanément
- [ ] Sélectionner palette "Sunset"
- [ ] Les couleurs changent
- [ ] Activer mode "Personnalisé"
- [ ] Changer la couleur d'accent
- [ ] La prévisualisation reflète le changement

#### Test 3.4: Typographie
- [ ] Onglet "Typographie"
- [ ] Changer la police (ex: "Montserrat")
- [ ] Le texte change dans la preview
- [ ] Ajuster la taille du titre (slider)
- [ ] Le titre change de taille
- [ ] Changer le poids (ex: Bold)
- [ ] Le poids change

#### Test 3.5: Modules de contenu
- [ ] Onglet "Contenu"
- [ ] Désactiver le module "Tags"
- [ ] Les tags disparaissent de la preview
- [ ] Réactiver le module "Tags"
- [ ] Les tags réapparaissent
- [ ] Réorganiser les modules par drag & drop
- [ ] L'ordre change dans la preview

#### Test 3.6: Image & Branding
- [ ] Onglet "Image & Branding"
- [ ] Ajuster le border-radius
- [ ] L'image prend des coins arrondis
- [ ] Appliquer filtre "Sepia"
- [ ] L'image prend une teinte sépia
- [ ] Activer le branding
- [ ] Upload un logo (ou URL)
- [ ] Le logo apparaît sur la preview
- [ ] Changer la position du logo
- [ ] Le logo se déplace

---

### ✅ Phase 4: Tests d'export

#### Test 4.1: Export PNG
- [ ] Configurer une preview (template, couleurs, etc.)
- [ ] Cliquer sur "Exporter"
- [ ] Modal d'export s'ouvre
- [ ] Sélectionner format "PNG"
- [ ] Sélectionner résolution "2x"
- [ ] Cocher "Fond transparent"
- [ ] Cliquer "Télécharger PNG"
- [ ] Le fichier se télécharge
- [ ] Ouvrir le fichier téléchargé
- [ ] Vérifier qualité et transparence

#### Test 4.2: Export JPEG
- [ ] Ouvrir modal d'export
- [ ] Sélectionner format "JPEG"
- [ ] Ajuster la qualité à 80%
- [ ] Cliquer "Télécharger JPEG"
- [ ] Le fichier se télécharge
- [ ] Ouvrir le fichier
- [ ] Vérifier qualité et compression

#### Test 4.3: Export PDF
- [ ] Ouvrir modal d'export
- [ ] Sélectionner format "PDF"
- [ ] Orientation: Portrait
- [ ] Format: A4
- [ ] Cliquer "Télécharger PDF"
- [ ] Le fichier se télécharge
- [ ] Ouvrir le PDF
- [ ] Vérifier mise en page et qualité

#### Test 4.4: Export Markdown
- [ ] Ouvrir modal d'export
- [ ] Sélectionner format "Markdown"
- [ ] Cliquer "Télécharger Markdown"
- [ ] Le fichier .md se télécharge
- [ ] Ouvrir dans un éditeur de texte
- [ ] Vérifier structure (titre, rating, description, etc.)

---

### ✅ Phase 5: Tests de presets

#### Test 5.1: Sauvegarder un preset
- [ ] Configurer Orchard (template, couleurs, typo)
- [ ] Onglet "Presets"
- [ ] Cliquer "Sauvegarder la configuration actuelle"
- [ ] Modal s'ouvre
- [ ] Entrer nom: "Mon Preset Instagram"
- [ ] Entrer description: "Pour posts Instagram"
- [ ] Cliquer "Sauvegarder"
- [ ] Toast de confirmation apparaît
- [ ] Le preset apparaît dans la liste

#### Test 5.2: Charger un preset
- [ ] Changer la configuration actuelle
- [ ] Cliquer "Charger" sur le preset créé
- [ ] La configuration se restaure instantanément
- [ ] Tous les paramètres sont appliqués

#### Test 5.3: Éditer un preset
- [ ] Cliquer "Éditer" sur un preset
- [ ] Modal s'ouvre avec données actuelles
- [ ] Modifier le nom ou la description
- [ ] Sauvegarder
- [ ] Les modifications sont appliquées

#### Test 5.4: Supprimer un preset
- [ ] Cliquer "Supprimer" sur un preset
- [ ] Confirmation demandée
- [ ] Confirmer
- [ ] Le preset disparaît de la liste

---

### ✅ Phase 6: Tests responsive

#### Test 6.1: Desktop (1920x1080)
- [ ] Ouvrir Orchard Studio
- [ ] Vérifier que les deux panels sont visibles côte à côte
- [ ] Vérifier que tous les contrôles sont accessibles
- [ ] Vérifier que la preview est bien proportionnée

#### Test 6.2: Tablette (768x1024)
- [ ] Ouvrir Orchard Studio
- [ ] Vérifier adaptation du layout
- [ ] Tester défilement
- [ ] Vérifier que le bouton "🎨 Aperçu" est visible

#### Test 6.3: Mobile (375x667)
- [ ] Ouvrir Orchard Studio
- [ ] Vérifier que l'interface s'adapte
- [ ] Vérifier que le modal est plein écran
- [ ] Tester navigation entre onglets
- [ ] Vérifier que le bouton est accessible

---

### ✅ Phase 7: Tests de performance

#### Test 7.1: Temps de chargement
- [ ] Ouvrir Orchard Studio
- [ ] Mesurer le temps d'ouverture (< 300ms souhaité)
- [ ] Vérifier qu'il n'y a pas de lag visuel

#### Test 7.2: Réactivité des contrôles
- [ ] Changer rapidement entre templates
- [ ] La preview doit se mettre à jour instantanément
- [ ] Ajuster les sliders rapidement
- [ ] Pas de lag perceptible

#### Test 7.3: Export de gros fichiers
- [ ] Utiliser une image haute résolution (>5MB)
- [ ] Exporter en PNG 3x
- [ ] Vérifier que l'export se termine
- [ ] Vérifier la qualité du fichier exporté

#### Test 7.4: Mémoire et fuites
- [ ] Ouvrir et fermer Orchard 10 fois
- [ ] Ouvrir DevTools → Onglet Performance
- [ ] Prendre un snapshot mémoire
- [ ] Vérifier qu'il n'y a pas de fuite mémoire significative

---

### ✅ Phase 8: Tests de compatibilité

#### Test 8.1: Chrome
- [ ] Ouvrir dans Chrome
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier export PNG/JPEG/PDF/MD

#### Test 8.2: Firefox
- [ ] Ouvrir dans Firefox
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier export

#### Test 8.3: Safari
- [ ] Ouvrir dans Safari
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier export

#### Test 8.4: Edge
- [ ] Ouvrir dans Edge
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier export

---

### ✅ Phase 9: Tests d'intégration workflow

#### Test 9.1: Scénario complet - Création
**Étapes:**
1. [ ] Naviguer vers `/create?type=Fleur`
2. [ ] Remplir Section 1 (Infos générales)
3. [ ] Ouvrir Orchard Studio
4. [ ] Vérifier preview avec données partielles
5. [ ] Fermer Orchard
6. [ ] Remplir Section 2 (Composition)
7. [ ] Rouvrir Orchard
8. [ ] Vérifier que les nouvelles données apparaissent
9. [ ] Configurer et exporter
10. [ ] Fermer Orchard
11. [ ] Finir de remplir toutes les sections
12. [ ] Enregistrer la review
13. [ ] Vérifier que la review est créée avec succès

#### Test 9.2: Scénario complet - Édition
**Étapes:**
1. [ ] Ouvrir une review existante en édition
2. [ ] Ouvrir Orchard Studio
3. [ ] Vérifier que toutes les données existantes sont chargées
4. [ ] Exporter un visuel (baseline)
5. [ ] Fermer Orchard
6. [ ] Modifier des champs (ex: description, tags)
7. [ ] Rouvrir Orchard
8. [ ] Vérifier que les modifications apparaissent
9. [ ] Exporter nouveau visuel
10. [ ] Comparer les deux exports
11. [ ] Enregistrer les modifications
12. [ ] Vérifier que la review est mise à jour

---

### ✅ Phase 10: Tests d'erreur et cas limites

#### Test 10.1: Review vide
- [ ] Ouvrir Orchard sans avoir rempli le formulaire
- [ ] Vérifier que le message "Aucune donnée de review disponible" s'affiche
- [ ] Vérifier qu'il n'y a pas d'erreur console

#### Test 10.2: Données incomplètes
- [ ] Remplir uniquement le nom commercial
- [ ] Ouvrir Orchard
- [ ] Vérifier que la preview s'affiche avec les données disponibles
- [ ] Les champs vides ne doivent pas causer d'erreur

#### Test 10.3: Images très grandes
- [ ] Upload une image >10MB
- [ ] Ouvrir Orchard
- [ ] Vérifier que l'image s'affiche
- [ ] Exporter en PNG 3x
- [ ] Vérifier que l'export se termine (peut prendre du temps)

#### Test 10.4: Caractères spéciaux
- [ ] Utiliser des émojis dans le nom commercial 🌿💚
- [ ] Ouvrir Orchard
- [ ] Vérifier que les émojis s'affichent correctement
- [ ] Exporter
- [ ] Vérifier que les émojis sont présents dans l'export

#### Test 10.5: Connexion réseau lente
- [ ] Simuler connexion lente (DevTools → Network → Slow 3G)
- [ ] Ouvrir Orchard Studio
- [ ] Vérifier que l'interface reste réactive
- [ ] Vérifier que les polices Google Fonts se chargent

---

## 📊 Rapport de tests

### Résumé

| Phase | Tests | Passés | Échoués | Ratio |
|-------|-------|--------|---------|-------|
| Phase 1: Tests de base | 4 | 0 | 0 | 0% |
| Phase 2: Transmission données | 3 | 0 | 0 | 0% |
| Phase 3: Fonctionnalités | 6 | 0 | 0 | 0% |
| Phase 4: Export | 4 | 0 | 0 | 0% |
| Phase 5: Presets | 4 | 0 | 0 | 0% |
| Phase 6: Responsive | 3 | 0 | 0 | 0% |
| Phase 7: Performance | 4 | 0 | 0 | 0% |
| Phase 8: Compatibilité | 4 | 0 | 0 | 0% |
| Phase 9: Workflow | 2 | 0 | 0 | 0% |
| Phase 10: Cas limites | 5 | 0 | 0 | 0% |
| **TOTAL** | **39** | **0** | **0** | **0%** |

### Bugs identifiés

| # | Description | Sévérité | Phase | Statut |
|---|-------------|----------|-------|--------|
| - | Aucun bug identifié | - | - | - |

### Recommandations

1. **Priorité haute:** Compléter tous les tests de base (Phase 1-4)
2. **Priorité moyenne:** Tests responsive et performance (Phase 6-7)
3. **Priorité basse:** Tests de compatibilité navigateurs (Phase 8)
4. **Tests continus:** Workflow complet et cas limites (Phase 9-10)

---

## 🎯 Critères de validation

Pour considérer l'intégration comme **Production Ready**, les critères suivants doivent être respectés:

- [ ] ✅ 100% des tests Phase 1-4 passés (fonctionnalités essentielles)
- [ ] ✅ 80%+ des tests Phase 5-7 passés (features avancées)
- [ ] ✅ 2+ navigateurs testés et fonctionnels (Phase 8)
- [ ] ✅ 1 workflow complet validé (Phase 9)
- [ ] ✅ Aucun bug critique (sévérité haute)
- [ ] ✅ Performance acceptable (<500ms pour ouverture)
- [ ] ✅ Responsive mobile validé
- [ ] ✅ Export fonctionnel dans les 4 formats

---

## 📝 Notes de test

**Testeur:** _____________________  
**Date:** _____________________  
**Environnement:**
- OS: _____________________
- Navigateur: _____________________
- Résolution: _____________________

**Observations générales:**
```
[Espace pour notes]
```

**Points positifs:**
```
[Espace pour notes]
```

**Points d'amélioration:**
```
[Espace pour notes]
```

---

*Document de tests créé le 10 novembre 2025*  
*Version: 1.0.0*  
*Statut: Prêt pour tests*
