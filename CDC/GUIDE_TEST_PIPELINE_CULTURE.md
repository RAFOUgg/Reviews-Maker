# 🧪 Guide de test - Pipeline Culture (Fleurs)

**Date :** 2026-01-06  
**Objectif :** Tester le système complet de Pipeline avec drag & drop et assignation de valeurs

---

## 🎯 Objectifs de test

1. ✅ **Drag & Drop** : Glisser des champs depuis la sidebar vers les cellules
2. ✅ **MultiAssignModal** : Modal responsive avec scroll et sticky headers
3. ✅ **PieCompositionField** : Composition substrat avec % par composant
4. ✅ **Image Upload** : Upload image du spectre lumineux
5. ✅ **Sauvegarde valeurs** : Les valeurs doivent être sauvegardées dans les cellules
6. ✅ **Multi-drag cross-sections** : Sélectionner des champs de plusieurs sections

---

## 📋 Tests à effectuer

### Test 1 : Drag & Drop simple
**Étapes :**
1. Ouvrir CreateFlowerReview
2. Aller dans l'onglet "Pipeline Culture"
3. Configurer la trame (ex: Semaines, S1 à S12)
4. Glisser "Mode de culture" depuis GENERAL vers S1
5. Remplir le modal → Sélectionner "Indoor"
6. Cliquer "Appliquer"

**Résultat attendu :**
- ✅ Modal s'ouvre correctement
- ✅ Champ "Mode de culture" visible avec options
- ✅ Sélection "Indoor" fonctionne
- ✅ Clic "Appliquer" → Modal se ferme
- ✅ Cellule S1 affiche "Indoor" (ou indicateur)

**Console (F12) :**
- 🎯 onApply doit afficher les valeurs
- 📝 Doit montrer l'application du champ
- ✅ Succès confirmé

---

### Test 2 : PieCompositionField (Composition substrat)
**Étapes :**
1. Glisser "Composition du substrat" depuis ENVIRONNEMENT vers S2
2. Modal s'ouvre
3. Cliquer sur "✏️ Modifier la composition"
4. Saisir :
   - Terreau (soil) : 40%
   - Coco (coco) : 30%
   - Perlite (perlite) : 20%
   - Humus (humus) : 10%
5. Vérifier que Total = 100%
6. Cliquer "Appliquer"

**Résultat attendu :**
- ✅ Modal affiche le PieCompositionField
- ✅ Mode édition ouvert avec liste des composants
- ✅ Saisie des % fonctionne
- ✅ Total calculé = 100% (texte vert)
- ✅ Pie chart s'affiche avec couleurs
- ✅ Légende visible avec % de chaque composant
- ✅ Bouton "Normaliser à 100%" disponible si total ≠ 100
- ✅ Valeurs sauvegardées après "Appliquer"

**Console :**
- 🎯 onApply avec `substrateComposition: { soil: 40, coco: 30, perlite: 20, humus: 10 }`
- ✅ Succès

---

### Test 3 : Image Upload (Spectre lumineux)
**Étapes :**
1. Glisser "Graphique spectre" depuis LUMIERE vers S3
2. Modal s'ouvre
3. Cliquer "📁 Choisir un fichier"
4. Sélectionner une image PNG/JPEG (<5MB)
5. Vérifier l'aperçu
6. Cliquer "Appliquer"

**Résultat attendu :**
- ✅ Modal affiche le champ image-upload
- ✅ Bouton "Choisir un fichier" visible
- ✅ Sélection d'image fonctionne
- ✅ Aperçu s'affiche correctement
- ✅ Nom fichier + taille affichés
- ✅ Bouton "🗑️ Supprimer" visible et fonctionnel
- ✅ Valeurs sauvegardées (base64)

**Console :**
- 🎯 onApply avec `spectrumImage: { filename: '...', type: 'image/png', size: 12345, data: 'data:image/png;base64,...' }`
- ✅ Succès

---

### Test 4 : Multi-drag cross-sections
**Étapes :**
1. Maintenir Ctrl
2. Cliquer sur "Température jour" (CLIMAT)
3. Cliquer sur "pH de l'eau" (IRRIGATION)
4. Cliquer sur "PPFD moyen" (LUMIERE)
5. Cliquer sur "Poids sec final" (RECOLTE)
6. Cliquer sur "Taille de la plante" (MORPHOLOGIE)
7. Glisser vers S4

**Résultat attendu :**
- ✅ 5 champs sélectionnés (border violet)
- ✅ Drag fonctionne avec les 5 items
- ✅ Modal s'ouvre avec les 5 champs visibles
- ✅ Sections organisées avec sticky headers
- ✅ Scroll fonctionne correctement
- ✅ Tous les champs sont éditables
- ✅ "Appliquer" sauvegarde les 5 valeurs

**Console :**
- 🎯 onApply avec 5 champs
- 📝 Application individuelle de chaque champ
- ✅ Succès pour les 5

---

### Test 5 : Responsive Modal (scroll)
**Étapes :**
1. Ctrl+clic sur 10+ champs de différentes sections
2. Glisser vers une cellule
3. Observer le modal

**Résultat attendu :**
- ✅ Header fixe en haut (titre + compteur + tabs)
- ✅ Zone content scrollable avec `overflow-y-auto`
- ✅ Section headers sticky (restent visibles au scroll)
- ✅ Footer fixe en bas (boutons Annuler/Appliquer)
- ✅ Grid 2 colonnes sur écrans larges (md:grid-cols-2)
- ✅ Pas de débordement hors écran

---

### Test 6 : Valeurs par défaut
**Étapes :**
1. Glisser "Densité de plantation" vers S5
2. Observer la valeur pré-remplie

**Résultat attendu :**
- ✅ Champ pré-rempli avec `defaultValue: 4`
- ✅ Slider affiché avec valeur 4
- ✅ Suggestions visibles (SOG faible, Standard, SOG dense, SOG très dense)

---

### Test 7 : Champs conditionnels
**Étapes :**
1. Glisser "Enrichissement CO2" vers S6
2. Toggle activé (true)
3. Observer les nouveaux champs

**Résultat attendu :**
- ✅ Toggle CO2 fonctionne
- ✅ Champs "Niveau CO2" et "Mode CO2" apparaissent si activé
- ✅ Champs masqués si toggle désactivé

---

### Test 8 : Champs computed
**Étapes :**
1. Saisir "Début culture" = 2026-01-01
2. Saisir "Fin culture" = 2026-04-10
3. Glisser "Durée totale" vers S7

**Résultat attendu :**
- ✅ Champ "Durée totale" affiche la différence (100 jours)
- ✅ Lecture seule (non éditable)
- ✅ Texte "Calculé automatiquement" visible

---

### Test 9 : Fréquence et Photopériode
**Étapes :**
1. Glisser "Fréquence d'arrosage" vers S8
2. Glisser "Photopériode" vers S9
3. Tester les presets

**Résultat attendu :**
- ✅ FrequencyField affiche input + période
- ✅ PhotoperiodField affiche ON/OFF heures
- ✅ Presets cliquables (18/6, 12/12, etc.)

---

### Test 10 : Zones de validation
**Étapes :**
1. Glisser "pH de l'eau" vers S10
2. Déplacer le slider
3. Observer les zones colorées

**Résultat attendu :**
- ✅ Zone 5.5-6.5 : Optimal terre (vert)
- ✅ Zone 5.8-6.2 : Optimal hydro (bleu)
- ✅ Indicateur visuel change selon valeur

---

## 🐛 Bugs connus (à corriger)

### Bug 1 : Valeurs ne se sauvegardent pas
**Symptôme :** Drop → Fill → Apply → Cellule reste vide

**Diagnostic :**
1. Ouvrir F12 Console
2. Faire le test complet
3. Observer les logs 🎯/📝/✅
4. Identifier où le processus échoue

**Causes possibles :**
- `onDataChange` non appelé
- `handleDataChange` dans parent incorrect
- `values` objet vide
- Problème de clé (id vs key)

**Solution :**
- Debug avec console logs ajoutés
- Vérifier props du parent
- Tracer le flux de données

---

## 📊 Checklist finale

### Système complet :
- [ ] Drag & drop fonctionne
- [ ] MultiAssignModal s'ouvre
- [ ] Tous les types de champs s'affichent
- [ ] PieCompositionField fonctionne (substrat)
- [ ] Image upload fonctionne (spectre)
- [ ] Multi-drag cross-sections OK
- [ ] Modal responsive (scroll, sticky)
- [ ] Valeurs sauvegardées dans cellules ⚠️ À TESTER
- [ ] Champs conditionnels (showIf)
- [ ] Champs computed
- [ ] Zones de validation affichées
- [ ] Suggestions/Presets cliquables
- [ ] Tooltips visibles

### Performance :
- [ ] Pas de lag au drag
- [ ] Modal s'ouvre rapidement
- [ ] Scroll fluide
- [ ] Pas de re-render inutiles

### UX :
- [ ] Feedback visuel clair (border violet, loading, etc.)
- [ ] Messages d'erreur explicites
- [ ] Boutons bien positionnés
- [ ] Navigation intuitive

---

## 🚀 Prochaines étapes

1. **Tester le workflow complet** avec une vraie culture
2. **Vérifier la sauvegarde** (valeurs persistées après reload)
3. **Tester l'export** (inclure données de pipeline dans export PDF/PNG)
4. **Documenter les bugs** trouvés
5. **Créer des screenshots** pour documentation

---

**IMPORTANT :** Garder la console F12 ouverte pendant TOUS les tests pour tracer les problèmes !
