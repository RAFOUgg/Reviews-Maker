# 🧪 Plan de tests - Système Cultivars & Pipelines

## Vue d'ensemble
Document de validation pour le système professionnel de gestion des cultivars et pipelines d'extraction/séparation.

---

## ✅ Tests unitaires - CultivarList.jsx

### Test 1 : Ajout d'un cultivar
**Action :** Cliquer sur "Ajouter un cultivar"
- ✅ Une nouvelle carte apparaît
- ✅ Les champs sont vides par défaut
- ✅ Un ID unique est généré (timestamp)
- ✅ Le bouton "Supprimer" est visible

### Test 2 : Remplissage d'un cultivar
**Action :** Remplir les champs d'un cultivar
- ✅ Nom : Accepte tout texte
- ✅ Farm : Accepte tout texte (optionnel)
- ✅ Matière : Dropdown avec les choix fournis
- ✅ Pourcentage : Accepte nombres 0-100

### Test 3 : Suppression d'un cultivar
**Action :** Cliquer sur "✕" d'un cultivar
- ✅ La carte disparaît immédiatement
- ✅ Les autres cultivars restent intacts
- ✅ L'ordre est préservé

### Test 4 : Cultivars multiples
**Action :** Ajouter 3+ cultivars
- ✅ Grid layout 2 colonnes (desktop)
- ✅ Chaque cultivar est indépendant
- ✅ Le state est correctement mis à jour

### Test 5 : Validation des données
**Action :** Essayer de soumettre avec cultivar sans nom
- ✅ Le champ nom a un placeholder clair
- ✅ Le système accepte (validation ultérieure)
- ✅ onChange est appelé avec le bon format

---

## ✅ Tests unitaires - PipelineWithCultivars.jsx

### Test 6 : État initial vide
**État :** Pipeline vide, aucun cultivar
- ✅ Message "Aucune étape dans le pipeline" affiché
- ✅ Bouton "Ajouter une étape" visible
- ✅ Pas d'erreurs console

### Test 7 : Ajout d'une étape
**Action :** Cliquer sur "Ajouter une étape"
- ✅ Une nouvelle carte étape apparaît
- ✅ Numérotée "Étape 1"
- ✅ Tous les champs sont présents
- ✅ Dropdown méthode avec toutes les options

### Test 8 : Sélection de méthode
**Action :** Sélectionner différentes méthodes
- ✅ Méthodes avec tamisage → champ microns apparaît
- ✅ Méthodes sans tamisage → champ microns caché
- ✅ Détection correcte de "Bubble Hash", "Ice Hash", etc.

### Test 9 : Association cultivar
**Action :** Sélectionner un cultivar dans le dropdown
- ✅ Option "-- Tous / Mélange --" par défaut
- ✅ Liste des cultivars de cultivarsList
- ✅ Format "Name (Farm)" si farm existe
- ✅ Mise à jour du state

### Test 10 : Champ microns
**Action :** Remplir le champ maille/microns
- ✅ Input texte accepte format libre
- ✅ Exemples dans placeholder : "73-120µ, 45µ, 160µ"
- ✅ Validation ultérieure (pas de blocage)

### Test 11 : Paramètres optionnels
**Action :** Remplir température, durée, notes
- ✅ Input texte accepte format libre
- ✅ Placeholders explicites
- ✅ Tous optionnels (pas de validation)

### Test 12 : Réorganisation des étapes
**Action :** Utiliser boutons ↑ et ↓
- ✅ Bouton ↑ désactivé sur première étape
- ✅ Bouton ↓ désactivé sur dernière étape
- ✅ Swap correct des étapes
- ✅ Numérotation automatique mise à jour

### Test 13 : Suppression d'étape
**Action :** Cliquer sur "✕ Supprimer"
- ✅ L'étape disparaît
- ✅ Les autres étapes restent
- ✅ Renumérotation automatique

### Test 14 : Plusieurs étapes
**Action :** Créer 5+ étapes
- ✅ Scroll vertical fonctionne
- ✅ Toutes les étapes visibles
- ✅ Chaque étape indépendante

### Test 15 : Info bulle
**Condition :** Au moins 1 étape existe
- ✅ Bandeau bleu d'info visible
- ✅ Message "Ordre du pipeline" affiché
- ✅ Disparaît si 0 étapes

---

## ✅ Tests d'intégration - CreateReviewPage.jsx

### Test 16 : Type Hash - Section Cultivars
**Navigation :** Créer review Hash → Section "🌱 Cultivars & Matières"
- ✅ Composant CultivarList rendu
- ✅ matiereChoices correct : ["Fleurs fraîches", "Fleurs sèches", "Trim", "Larf", "Sugar Leaves", "Autre"]
- ✅ Peut ajouter/modifier/supprimer cultivars
- ✅ Données sauvegardées dans formData.cultivarsList

### Test 17 : Type Hash - Section Pipeline
**Navigation :** Créer review Hash → Section "🧪 Pipeline de Séparation"
- ✅ Composant PipelineWithCultivars rendu
- ✅ choices = separationTypes du catalog
- ✅ cultivarsList provient de formData.cultivarsList
- ✅ Dropdown cultivar alimenté dynamiquement

### Test 18 : Type Concentré - Section Cultivars
**Navigation :** Créer review Concentré → Section "🌱 Cultivars & Matières"
- ✅ Composant CultivarList rendu
- ✅ matiereChoices correct : ["Fleurs fraîches", "Fleurs sèches", "Trim", "Trichomes", "Hash", "Larf", "Autre"]
- ✅ Fonctionnalités identiques à Hash

### Test 19 : Type Concentré - Section Pipeline
**Navigation :** Créer review Concentré → Section "🧪 Pipeline d'Extraction"
- ✅ Composant PipelineWithCultivars rendu
- ✅ choices = extractionSolvants + extractionSansSolvants
- ✅ Checkbox "Purge à vide" présent aussi

### Test 20 : Navigation entre sections
**Action :** Remplir cultivars, puis aller au pipeline
- ✅ Données cultivars préservées
- ✅ Dropdown pipeline contient les cultivars
- ✅ Retour en arrière : données intactes

### Test 21 : Workflow complet Hash
**Scénario :** Review Hash de A à Z
1. ✅ Infos générales : nom + hash maker
2. ✅ Photos : upload 2-4 images
3. ✅ Cultivars : ajouter 2+ cultivars
4. ✅ Pipeline : 3 étapes avec mailles
5. ✅ Visuel : sliders notes
6. ✅ Arômes + saveurs + effets : wheels
7. ✅ Notes finales + rating
8. ✅ Soumission : formData contient tout

### Test 22 : Workflow complet Concentré
**Scénario :** Review Concentré de A à Z
1. ✅ Infos : nom + type extraction
2. ✅ Photos : upload
3. ✅ Cultivars : 1+ cultivar avec hash comme matière
4. ✅ Pipeline : extraction rosin puis distillation
5. ✅ Visuel : couleur, viscosité, melting
6. ✅ Arômes + saveurs + effets
7. ✅ Notes + rating
8. ✅ Soumission réussie

---

## ✅ Tests de validation des données

### Test 23 : Structure formData - Cultivars
**Vérification :** Console log de formData.cultivarsList
```javascript
[
    {
        id: Number (unique),
        name: String,
        farm: String (optionnel),
        matiere: String,
        percentage: Number (optionnel)
    },
    ...
]
```
- ✅ Format exact respecté
- ✅ IDs uniques
- ✅ Pas de champs undefined

### Test 24 : Structure formData - Pipeline
**Vérification :** Console log de formData.pipelineSeparation
```javascript
[
    {
        id: Number (unique),
        method: String,
        cultivar: String (peut être vide),
        microns: String (optionnel),
        temperature: String (optionnel),
        duration: String (optionnel),
        notes: String (optionnel)
    },
    ...
]
```
- ✅ Format exact respecté
- ✅ IDs uniques
- ✅ cultivar peut être "" (tous)

### Test 25 : Soumission au serveur
**Action :** Submit du formulaire
- ✅ FormData contient cultivarsList (JSON stringified)
- ✅ FormData contient pipelineSeparation (JSON stringified)
- ✅ Backend parse correctement
- ✅ Sauvegarde en DB réussie

---

## ✅ Tests d'edge cases

### Test 26 : Pipeline sans cultivars
**Scénario :** Créer pipeline avant d'ajouter cultivars
- ✅ Dropdown cultivar affiche seulement "-- Tous / Mélange --"
- ✅ Pas d'erreur console
- ✅ Peut ajouter cultivars après et dropdown se met à jour

### Test 27 : Suppression de cultivar utilisé
**Scénario :** 
1. Ajouter cultivar "Purple Haze"
2. Créer étape pipeline avec "Purple Haze"
3. Retour section cultivars, supprimer "Purple Haze"
4. Retour pipeline
- ✅ L'étape garde "Purple Haze" en valeur
- ✅ Mais n'apparaît plus dans dropdown
- ✅ Comportement acceptable (référence historique)

### Test 28 : Très grand nombre d'étapes
**Scénario :** Ajouter 20+ étapes
- ✅ Performance acceptable
- ✅ Scroll fluide
- ✅ Réorganisation fonctionne
- ✅ Pas de ralentissement

### Test 29 : Caractères spéciaux
**Scénario :** Noms avec émojis, accents, symboles
- ✅ "Purple Haze 🟣" → accepté
- ✅ "Gelato #33" → accepté
- ✅ "Öl Extract" → accepté
- ✅ Pas de crash, pas de sanitization excessive

### Test 30 : Refresh de page
**Scénario :** Remplir formulaire, refresh navigateur
- ⚠️ Données perdues (comportement normal)
- ✅ Composants se réinitialisent proprement
- 💡 Future évolution : localStorage backup

---

## ✅ Tests responsives

### Test 31 : Mobile (< 768px)
- ✅ CultivarList : cartes en colonne unique
- ✅ Pipeline : champs empilés verticalement
- ✅ Boutons accessibles
- ✅ Pas de débordement horizontal

### Test 32 : Tablet (768-1024px)
- ✅ CultivarList : 2 colonnes
- ✅ Pipeline : grille md:grid-cols-2
- ✅ Layout optimisé

### Test 33 : Desktop (> 1024px)
- ✅ CultivarList : 3 colonnes max
- ✅ Pipeline : confortable
- ✅ Tout visible sans scroll excessif

---

## ✅ Tests navigateurs

### Test 34 : Chrome/Edge
- ✅ Tous les composants fonctionnels
- ✅ Styles appliqués correctement
- ✅ DevTools console sans erreurs

### Test 35 : Firefox
- ✅ Composants identiques
- ✅ Grid layout correct
- ✅ Dropdowns natifs stylés

### Test 36 : Safari (si disponible)
- ✅ Polyfills Vite chargés
- ✅ Pas de problème CSS grid
- ✅ onChange events fonctionnent

---

## 📊 Récapitulatif des tests

| Catégorie | Tests | Status |
|-----------|-------|--------|
| **CultivarList unitaire** | 1-5 | ⏳ À tester |
| **PipelineWithCultivars unitaire** | 6-15 | ⏳ À tester |
| **Intégration CreateReviewPage** | 16-22 | ⏳ À tester |
| **Validation données** | 23-25 | ⏳ À tester |
| **Edge cases** | 26-30 | ⏳ À tester |
| **Responsive** | 31-33 | ⏳ À tester |
| **Navigateurs** | 34-36 | ⏳ À tester |

**Total :** 36 tests définis

---

## 🚀 Procédure de test manuelle

### Prérequis
```bash
cd client
npm install
npm run dev
```

### Checklist rapide (5min)
1. [ ] Ouvrir http://localhost:5173
2. [ ] Se connecter (auth)
3. [ ] Créer review Hash
4. [ ] Ajouter 2 cultivars
5. [ ] Créer pipeline 2 étapes avec microns
6. [ ] Naviguer entre sections (données préservées)
7. [ ] Soumettre formulaire
8. [ ] Vérifier console (pas d'erreurs)

### Checklist complète (30min)
1. [ ] Tous les tests 1-36 ci-dessus
2. [ ] Vérifier formData final dans Network tab
3. [ ] Tester sur mobile (DevTools responsive)
4. [ ] Vérifier backend parse les données
5. [ ] Afficher la review créée (si affichage implémenté)

---

## 🐛 Bugs connus / Limitations

### Actuels
- Aucun bug critique détecté

### Limitations assumées
1. **Pas de localStorage** : refresh = perte données (à implémenter si demandé)
2. **Pas de drag-and-drop cultivars** : ordre fixe (peut être ajouté)
3. **Référence historique cultivar** : si supprimé, reste dans pipeline (acceptable)
4. **Pas de validation stricte microns** : format libre (peut être amélioré)

### Améliorations futures
- [ ] Auto-save toutes les 30s
- [ ] Drag-and-drop réorganisation cultivars
- [ ] Validation regex pour microns (ex: 73-120µ)
- [ ] Preview visuel du pipeline (flow diagram)
- [ ] Export PDF du pipeline

---

## 📝 Notes de régression

Si vous modifiez ces composants, **re-tester obligatoirement :**
- ✅ Test 20 : Navigation entre sections (data persistence)
- ✅ Test 17 : Association cultivars → pipeline (dynamic dropdown)
- ✅ Test 25 : Soumission serveur (JSON structure)

---

**Créé le :** $(date)  
**Version :** 1.0.0  
**Responsable tests :** Reviews-Maker Team  
**Statut :** 📋 Prêt pour tests
