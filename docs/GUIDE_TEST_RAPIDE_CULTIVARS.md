# 🚀 Guide Rapide - Tester le Système Cultivars & Pipelines

## Objectif
Validation rapide (5 minutes) des nouvelles fonctionnalités professionnelles pour Hash et Concentrés.

---

## 📋 Prérequis

### 1. Lancer le serveur de développement

```powershell
# Depuis le dossier client/
cd client
npm install  # Si première fois
npm run dev
```

✅ Serveur doit être sur http://localhost:5174

### 2. S'authentifier
- Ouvrir http://localhost:5174
- Se connecter avec vos identifiants
- Vérifier que vous êtes authentifié

---

## 🧪 Test Rapide #1 : Hash Multi-Cultivars

### Étape 1 : Créer une review Hash
1. Page d'accueil → Bouton **"Créer une review"**
2. Sélectionner type **"Hash"**
3. Vous devriez voir la barre de progression avec 8 étapes

### Étape 2 : Infos générales
```
Section "📋 Informations générales"
├─ Nom commercial: "Purple Dream Full Spectrum"
└─ Hash Maker: "John Doe"
```
→ Cliquer **"Suivant"**

### Étape 3 : Ajouter des photos
```
Section "📸 Photos"
└─ Upload 1-4 images
```
→ Cliquer **"Suivant"**

### Étape 4 : 🌱 NOUVEAU - Cultivars & Matières
```
Section "🌱 Cultivars & Matières"

1. Cliquer "+ Ajouter un cultivar"
   
   Cultivar 1:
   ├─ Nom: "Purple Haze"
   ├─ Farm: "La Fonce d'Alle"
   ├─ Matière première: [Fleurs fraîches ▼]
   └─ Pourcentage dans le mix: 50

2. Cliquer "+ Ajouter un cultivar"
   
   Cultivar 2:
   ├─ Nom: "Gorilla Glue"
   ├─ Farm: "Swiss Gardens"
   ├─ Matière première: [Fleurs fraîches ▼]
   └─ Pourcentage dans le mix: 30

3. Cliquer "+ Ajouter un cultivar"
   
   Cultivar 3:
   ├─ Nom: "White Widow"
   ├─ Farm: "La Fonce d'Alle"
   ├─ Matière première: [Trim ▼]
   └─ Pourcentage dans le mix: 20
```

✅ **Vérifications :**
- 3 cartes cultivars visibles
- Grid layout 2 colonnes (desktop)
- Bouton "✕" sur chaque carte
- Total pourcentages = 100% (optionnel mais bon exemple)

→ Cliquer **"Suivant"**

### Étape 5 : 🧪 NOUVEAU - Pipeline de Séparation
```
Section "🧪 Pipeline de Séparation"

1. Cliquer "+ Ajouter une étape au pipeline"
   
   Étape 1:
   ├─ Méthode: [Tamisage WPFF ▼]
   ├─ Cultivar: [Purple Haze ▼]  ← Dropdown dynamique !
   ├─ Maille (microns): "160-220µ"  ← Champ apparaît automatiquement
   ├─ Température: "-20°C"
   ├─ Durée: "5min"
   └─ Notes: "Premier grade - head"

2. Cliquer "+ Ajouter une étape au pipeline"
   
   Étape 2:
   ├─ Méthode: [Tamisage à l'eau glacée ▼]
   ├─ Cultivar: [-- Tous / Mélange -- ▼]  ← Tous les cultivars
   ├─ Maille (microns): "73-120µ"
   ├─ Température: "0°C"
   ├─ Durée: "15min"
   └─ Notes: "Full spectrum extraction"

3. Cliquer "+ Ajouter une étape au pipeline"
   
   Étape 3:
   ├─ Méthode: [Pressage à froid ▼]
   ├─ Cultivar: [Gorilla Glue ▼]
   ├─ Maille: [PAS DE CHAMP - normal, pas un tamisage]
   ├─ Température: "25°C"
   ├─ Durée: "2min"
   └─ Notes: "Rosin finish"
```

✅ **Vérifications critiques :**
- Dropdown "Cultivar" contient les 3 cultivars + option "Tous"
- Champ "Maille" apparaît SEULEMENT pour tamisages
- Boutons ↑↓ fonctionnels (tester réorganisation)
- Bouton ↑ désactivé sur Étape 1
- Bouton ↓ désactivé sur Étape 3
- Bandeau bleu d'info en bas : "💡 Ordre du pipeline..."

→ Cliquer **"Suivant"** et remplir les sections suivantes normalement

### Étape 6 : Vérifier les données
**Avant de soumettre, ouvrir DevTools (F12) → Console**

```javascript
// Vérifier dans l'onglet Application > Local Storage ou dans formData
formData.cultivarsList = [
    { id: xxx, name: "Purple Haze", farm: "La Fonce d'Alle", matiere: "Fleurs fraîches", percentage: 50 },
    { id: xxx, name: "Gorilla Glue", farm: "Swiss Gardens", matiere: "Fleurs fraîches", percentage: 30 },
    { id: xxx, name: "White Widow", farm: "La Fonce d'Alle", matiere: "Trim", percentage: 20 }
]

formData.pipelineSeparation = [
    { id: xxx, method: "Tamisage WPFF", cultivar: "Purple Haze", microns: "160-220µ", ... },
    { id: xxx, method: "Tamisage à l'eau glacée", cultivar: "", microns: "73-120µ", ... },
    { id: xxx, method: "Pressage à froid", cultivar: "Gorilla Glue", microns: "", ... }
]
```

→ Soumettre le formulaire

✅ **Succès si :**
- Pas d'erreurs console
- Redirection vers page d'accueil
- Review créée dans la liste

---

## 🧪 Test Rapide #2 : Concentré avec Pipeline d'Extraction

### Étape 1 : Créer une review Concentré
1. Page d'accueil → **"Créer une review"**
2. Type **"Concentré"**

### Étape 2-3 : Infos + Photos
```
Nom: "Live Rosin Diamonds"
Type d'extraction: [Rosin ▼]
Photos: upload images
```

### Étape 4 : 🌱 Cultivars & Matières
```
Cultivar 1:
├─ Nom: "Ice Cream Cake"
├─ Farm: "Premium Genetics"
├─ Matière: [Hash ▼]  ← Notez les choix différents !
└─ %: 100
```

✅ **Vérifier :** matiereChoices = ["Fleurs fraîches", "Fleurs sèches", "Trim", "Trichomes", "Hash", "Larf", "Autre"]

### Étape 5 : 🧪 Pipeline d'Extraction
```
Étape 1:
├─ Méthode: [Pressage à chaud (Rosin) ▼]  ← Différentes méthodes !
├─ Cultivar: [Ice Cream Cake ▼]
├─ Maille: [PAS DE CHAMP - normal]
├─ Température: "80°C"
├─ Durée: "3min"
└─ Notes: "First press"

Étape 2:
├─ Méthode: [Extraction au CO₂ supercritique ▼]
├─ Température: "35°C"
└─ ...

[✓] Purge à vide  ← Checkbox additionnel
```

✅ **Vérifier :** 
- Dropdown méthodes = extractionSolvants + extractionSansSolvants
- Checkbox "Purge à vide" en bas de section
- Pas de champ microns (méthodes différentes)

→ Compléter et soumettre

---

## 🎯 Tests de régression (Important)

### Test A : Navigation entre sections
1. Remplir cultivars (Section 3)
2. Aller au pipeline (Section 4)
3. Retour cultivars (Section 3)
4. Retour pipeline (Section 4)

✅ **Attendu :** Toutes les données préservées

### Test B : Suppression de cultivar après usage
1. Créer cultivar "Test"
2. Créer étape pipeline avec "Test"
3. Retour cultivars, supprimer "Test"
4. Retour pipeline

✅ **Attendu :** Étape garde "Test" mais n'apparaît plus dans dropdown (OK)

### Test C : Réorganisation pipeline
1. Créer 3 étapes
2. Cliquer ↓ sur Étape 1
3. Vérifier ordre : Étape 2, Étape 1, Étape 3

✅ **Attendu :** Swap correct, numérotation mise à jour

---

## 🐛 Checklist erreurs courantes

| ❌ Problème | ✅ Solution |
|-------------|-------------|
| Composant ne s'affiche pas | Vérifier imports dans CreateReviewPage.jsx |
| Dropdown cultivar vide | Vérifier cultivarsSource dans productStructures |
| Champ microns toujours visible | Vérifier methodsWithMicrons dans PipelineWithCultivars |
| Erreur soumission | F12 → Network → voir payload JSON |
| Styles cassés | npm run dev redémarré ? Tailwind compile ? |

---

## 📊 Résumé des validations

- [x] CultivarList affiche et fonctionne
- [x] PipelineWithCultivars affiche et fonctionne
- [x] Dropdown cultivar dynamique
- [x] Champ microns conditionnel
- [x] Réorganisation étapes
- [x] Navigation préserve données
- [x] Soumission sans erreurs
- [x] formData structure correcte

---

## 🎓 Prochaines étapes

### Si tests OK :
✅ Système prêt pour usage production

### Si bugs détectés :
1. Noter le problème exact
2. Ouvrir DevTools → Console (copier erreurs)
3. Vérifier fichiers concernés
4. Corriger et re-tester

### Améliorations futures (optionnel) :
- [ ] Preview visuel du pipeline (flow diagram)
- [ ] Auto-save toutes les 30s
- [ ] Export PDF du process
- [ ] Validation stricte formats (regex microns)

---

**Temps estimé :** 5-10 minutes pour tests rapides  
**Temps complet :** 30 minutes pour tous les edge cases  
**Support :** Voir docs/SYSTEME_PROFESSIONNEL_CULTIVARS.md pour détails
