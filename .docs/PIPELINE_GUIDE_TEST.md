# 🧪 GUIDE TEST - Nouvelles fonctionnalités Pipeline Culture

## 🎯 Objectif
Tester les corrections apportées à la Pipeline Culture pour conformité CDC

---

## ✅ TESTS À EFFECTUER

### TEST 1 : Ctrl+clic - Sélection multiple de contenus ⭐

**Objectif** : Vérifier que Ctrl+clic permet de sélectionner plusieurs données avant drag & drop

**Étapes** :
1. Ouvrir page création review Fleurs
2. Aller à section "Pipeline de culture"
3. Dans panneau gauche "Contenus" → ouvrir section **GÉNÉRAL**
4. **Ctrl + clic** sur "Mode de culture"
5. **Ctrl + clic** sur "Type d'espace"
6. **Ctrl + clic** sur "Longueur"

**✅ Résultat attendu** :
- Les 3 contenus sont surlignés en bleu (classe `bg-primary-100`)
- Badge ou indicateur "3 sélectionnés"

7. **Glisser** la sélection vers case J1 de la timeline
8. Cliquer sur case J1 pour voir les données

**✅ Résultat attendu** :
- Les 3 données sont présentes dans J1
- Case J1 colorée en vert

---

### TEST 2 : Clic droit - Menu contextuel ⭐⭐

**Objectif** : Vérifier que le clic droit sur un contenu ouvre un menu avec 2 options

**Étapes** :
1. Dans panneau "Contenus" → section **CLIMAT**
2. **Clic droit** sur "Température moyenne"

**✅ Résultat attendu** :
- Menu contextuel s'affiche à position du curseur
- 2 options visibles :
  - 📍 "Assigner à la trame (cases X à X)"
  - 💾 "Définir valeur(s) + enregistrer préréglage"

3. Cliquer sur **"Assigner à la trame"**

**✅ Résultat attendu** :
- Modal "📍 Assigner à la trame" s'ouvre
- Champs : Case début, Case fin, Valeur
- Pré-rempli : début=1, fin=(nb total cases)

---

### TEST 3 : Assigner à plage (cases X à X) ⭐⭐⭐

**Objectif** : Appliquer une donnée à une plage de cases consécutives

**Étapes** :
1. **Clic droit** sur "Température moyenne" → "Assigner à la trame"
2. Saisir :
   - Case début : **7**
   - Case fin : **45**
   - Valeur : **26**
3. Cliquer **"Appliquer"**

**✅ Résultat attendu** :
- Modal se ferme
- Cases J7 à J45 colorées en **vert** (données configurées)
- Cliquer sur J7, J20, J45 → toutes ont "Température moyenne : 26°C"

**Scénario avancé** :
4. **Clic droit** à nouveau sur "Température moyenne"
5. Assigner J46 à J90 → Valeur **24**
6. **✅ Vérifier** : J7-J45 = 26°C, J46-J90 = 24°C (deux plages différentes)

---

### TEST 4 : Multiselect - Ventilation ⭐⭐

**Objectif** : Sélectionner plusieurs types de ventilation simultanément

**Étapes** :
1. Sélectionner case **J1** sur timeline (clic simple)
2. Dans "Contenus" → section **CLIMAT**
3. **Glisser** "Type(s) de ventilation" vers J1
4. Modal s'ouvre avec label "(sélection multiple)"

**✅ Résultat attendu** :
- Liste avec **checkboxes** (pas de select dropdown)
- Options visibles :
  - ☐ Extracteur d'air
  - ☐ Intracteur d'air
  - ☐ Ventilateur oscillant
  - ☐ Ventilation au plafond
  - ☐ Ventilation par gaines (HVACD)
  - ☐ Déshumidificateur
  - ☐ Humidificateur
  - ☐ Filtre à charbon

5. **Cocher** :
   - ☑ Extracteur d'air
   - ☑ Ventilateur oscillant
   - ☑ Filtre à charbon

6. Cliquer **"Appliquer"**

**✅ Résultat attendu** :
- Modal se ferme
- Case J1 enregistre 3 valeurs
- Réouvrir J1 → voir "Ventilation : Extracteur d'air, Ventilateur oscillant, Filtre à charbon"

---

### TEST 5 : Multiselect - Palissage ⭐⭐

**Objectif** : Combiner plusieurs techniques de palissage

**Étapes** :
1. Sélectionner cases **J21 à J60** (Shift+clic)
2. **Glisser** "Méthodologies LST/HST" (section PALISSAGE)
3. Modal multiselect s'ouvre

4. **Cocher** :
   - ☑ LST (Low Stress Training)
   - ☑ SCROG (Screen of Green)
   - ☑ Lollipopping

5. Cliquer **"Appliquer"**

**✅ Résultat attendu** :
- Cases J21 à J60 colorées en vert
- Chaque case contient les 3 techniques sélectionnées

---

### TEST 6 : Nouveaux champs Marque ⭐

**Objectif** : Vérifier que les 3 nouveaux champs marque sont présents

**Vérifications** :
1. Section **IRRIGATION** :
   - ✅ Champ "Marque système irrigation" existe
   - Placeholder : "Gardena, Blumat, AutoPot..."

2. Section **LUMIÈRE** :
   - ✅ Champ "Marque lampe / fabricant" existe
   - Placeholder : "Mars Hydro, Spider Farmer, Lumatek..."

3. Section **CLIMAT** :
   - ✅ Champ "Marque(s) équipement ventilation" existe
   - Placeholder : "Prima Klima, Can-Fan, RVK..."

---

### TEST 7 : Substrat composition (Type composition) ⚠️

**Objectif** : Vérifier que le type composition est présent (même si pas encore implémenté)

**Étapes** :
1. Section **SUBSTRAT**
2. Chercher "Composition substrat (ingrédients élémentaires)"
3. Glisser vers une case timeline

**✅ Résultat attendu ACTUEL** :
- Modal s'ouvre
- Message affiché : "⚠️ Type "composition" nécessite un modal dédié (à implémenter)"

**📌 Note** : Modal `CompositionBuilder` reste à développer

---

### TEST 8 : Options substrat (pures, sans combinaisons) ⭐

**Objectif** : Vérifier que les options de substrat sont élémentaires

**Étapes** :
1. Section **SUBSTRAT**
2. Glisser "Type de substrat" vers J1
3. Ouvrir select dropdown

**✅ Résultat attendu** :
Options visibles :
- Hydroponique recirculé
- Hydroponique drain-to-waste
- DWC (deep water culture)
- RDWC
- NFT
- Aéroponie haute pression
- Aéroponie basse pression
- **Substrat inerte** (SANS détail matériaux)
- Terreau « Bio »
- Terreau organique vivant
- Super-soil / no-till
- **Mélange personnalisé (définir composition ci-dessous)**

**❌ NE DOIT PAS contenir** :
- ~~Mélange terre / coco~~
- ~~Mélange terre / perlite~~
- ~~Mélange coco / perlite~~
- ~~Substrat inerte (coco, laine de roche, ...)~~

---

## 📊 RÉCAPITULATIF RÉSULTATS

| Test | Fonctionnalité | Statut |
|------|----------------|--------|
| 1 | Ctrl+clic sélection multiple | ☐ |
| 2 | Clic droit menu contextuel | ☐ |
| 3 | Assigner à plage (X à X) | ☐ |
| 4 | Multiselect ventilation | ☐ |
| 5 | Multiselect palissage | ☐ |
| 6 | Nouveaux champs marque | ☐ |
| 7 | Type composition présent | ☐ |
| 8 | Options substrat pures | ☐ |

**Légende** :
- ✅ Fonctionne correctement
- ⚠️ Fonctionne partiellement
- ❌ Ne fonctionne pas
- ☐ Non testé

---

## 🐛 BUGS DÉTECTÉS

### Bug #1 : [À remplir]
**Description** :
**Étapes de reproduction** :
**Résultat attendu** :
**Résultat obtenu** :

---

## 💡 SUGGESTIONS D'AMÉLIORATION

1. **CompositionBuilder modal** (Priorité HAUTE)
   - Système drag & drop ingrédients
   - Validation Total = 100%
   - Auto-complétion marques

2. **Relations conditionnelles** (Priorité MOYENNE)
   - Masquer champs selon contexte
   - Ex: Si "Plein champ" → masquer L×l×H

3. **Validation temps réel** (Priorité BASSE)
   - Indicateur % rempli global
   - Alertes si données incohérentes

---

## 🎉 PROCHAINES ÉTAPES

1. ✅ Tester toutes les fonctionnalités (checklist ci-dessus)
2. 📝 Reporter bugs dans `.docs/PIPELINE_BUGS.md`
3. 🚀 Implémenter `CompositionBuilder` modal
4. 🔄 Ajouter relations conditionnelles
5. ✨ Polish UI/UX (animations, feedback)

---

**Date test** : _______________
**Testeur** : _______________
**Environnement** : Dev / Prod
**Navigateur** : Chrome / Firefox / Edge
