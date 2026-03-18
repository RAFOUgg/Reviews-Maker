# Checklist de Vérification Manuelle ExportMaker

## ITÉRATION 2-BIS : Vérification Manuelle Systématique

### Instructions
1. Lancer l'application Reviews-Maker en mode développement
2. Naviguer vers une review existante
3. Ouvrir ExportMaker
4. Suivre cette checklist point par point
5. Noter tous les problèmes, bugs, ou comportements inattendus

---

## 📋 A. TESTS DES 4 ONGLETS SYSTÈME

### A.1 Onglet Template (par défaut au démarrage)
- [ ] Interface s'ouvre sur l'onglet Template
- [ ] 4 templates disponibles : Modern Compact, Fiche Détaillée, Article Blog, Story Social
- [ ] Preview se met à jour quand on change de template
- [ ] Sélection de ratio (1:1, 16:9, 9:16, 4:3, A4) fonctionne
- [ ] Canvas se redimensionne correctement selon le ratio
- [ ] Preview responsive dans la zone de droite

**Notes Onglet Template :**
```
- Bugs identifiés :
- Comportements inattendus :
- Performance (lent/rapide) :
```

### A.2 Onglet Contenu
- [ ] Click "Contenu" change l'onglet correctement
- [ ] ContentModuleControls s'affiche
- [ ] Modules peuvent être activés/désactivés
- [ ] Preview se met à jour en temps réel quand on disable un module
- [ ] DragDropExport visible si permissions PRO (sinon FeatureGate)

**Notes Onglet Contenu :**
```
- Modules disponibles :
- Drag & Drop fonctionnel (PRO) :
- Bugs identifiés :
```

### A.3 Onglet Apparence
- [ ] Click "Apparence" change l'onglet correctement
- [ ] TypographyControls présent et fonctionnel
- [ ] ColorPaletteControls avec 6 palettes + custom
- [ ] ImageBrandingControls visible
- [ ] WatermarkEditor accessible (PRO) ou locked (Free)
- [ ] Changements d'apparence visibles immédiatement en preview

**Notes Onglet Apparence :**
```
- Palettes couleurs disponibles :
- Fonts disponibles :
- Watermark (PRO/Free) :
- Bugs identifiés :
```

### A.4 Onglet Préréglages
- [ ] Click "Préréglages" change l'onglet correctement
- [ ] PresetManager s'affiche
- [ ] Bouton "Sauvegarder preset" disponible
- [ ] Liste des presets existants (si existants)
- [ ] Actions "Charger", "Modifier", "Supprimer" fonctionnelles

**Notes Onglet Préréglages :**
```
- Presets existants :
- Save/Load fonctionne :
- Persistence entre sessions :
- Bugs identifiés :
```

---

## 📤 B. TESTS DES 5 FORMATS D'EXPORT

### B.1 Exports de Base (tous comptes)
- [ ] Bouton "Export PNG" visible et cliquable
- [ ] Export PNG télécharge un fichier .png
- [ ] Bouton "Export JPEG" visible et cliquable
- [ ] Export JPEG télécharge un fichier .jpg
- [ ] Bouton "Export PDF" visible et cliquable
- [ ] Export PDF télécharge un fichier .pdf avec bon contenu
- [ ] Nomenclature fichiers : `review-{nom}-{timestamp}.{ext}`

**Notes Formats de Base :**
```
- Temps export PNG :
- Temps export JPEG :
- Temps export PDF :
- Qualité visuelle :
- Bugs identifiés :
```

### B.2 Exports PRO (si compte PRO seulement)
- [ ] Toggle "Haute Qualité" visible (PRO) ou FeatureGate (Free)
- [ ] Bouton "Export SVG" visible (PRO) ou FeatureGate (Free)
- [ ] Export SVG fonctionne si PRO
- [ ] Bouton "Pipeline en GIF" visible si pipeline dans review + PRO

**Notes Exports PRO :**
```
- Type de compte testé :
- SVG accessible :
- GIF accessible (si pipeline) :
- Haute qualité fonctionne :
```

### B.3 Gestion d'Erreurs
- [ ] Export sans preview → affiche erreur claire
- [ ] Export GIF sans pipeline → affiche message explicatif
- [ ] Exports multiples simultanés → pas de crash
- [ ] Network timeout → gestion gracieuse

---

## 🌍 C. TESTS SAVE TO LIBRARY / GALERIE PUBLIQUE

### C.1 Modal Save to Library
- [ ] Bouton "Sauvegarder" visible
- [ ] Modal s'ouvre avec champs Nom, Description, Public checkbox
- [ ] Champ Nom requis (validation)
- [ ] Description optionnelle
- [ ] Checkbox "Public" état correct selon permissions

**Notes Save Modal :**
```
- Validation forme :
- UI responsive :
- Bugs identifiés :
```

### C.2 Workflow de Sauvegarde
- [ ] Save privé → succès, pas d'impact review visibility
- [ ] Save public (si propriétaire) → succès + review devient publique
- [ ] Save public (si pas propriétaire) → checkbox disabled
- [ ] Network error → message d'erreur + possibilité retry

**Notes Workflow Save :**
```
- Type ownership testé :
- Save privé fonctionne :
- Save public fonctionne :
- Error handling :
```

---

## 🎨 D. TESTS FONCTIONNALITÉS AVANCÉES

### D.1 Templates + Customisation
- [ ] Template Modern Compact → style correct
- [ ] Template Fiche Détaillée → tous modules visibles
- [ ] Template Story Social → format 9:16 adapté
- [ ] Customisation couleurs persist pendant la session
- [ ] Customisation typo persist pendant la session

### D.2 Watermarks
- [ ] Watermark Terpologie automatique (Free accounts)
- [ ] WatermarkEditor complet (PRO accounts)
- [ ] Position watermark drag & drop (PRO)
- [ ] Rotation, opacité, couleur custom (PRO)

### D.3 Performance & Stabilité
- [ ] Changement template → preview update <2s
- [ ] Changement ratio → re-render immédiat
- [ ] Changement couleurs → preview temps réel
- [ ] Aucun crash lors navigation entre onglets
- [ ] Memory usage stable (pas de leak visible)

---

## 🚨 E. EDGE CASES CRITIQUES

### E.1 Données de Review
- [ ] Review avec champs manquants → pas de crash, fallbacks gracieux
- [ ] Review sans pipeline → GIF export disabled proprement
- [ ] Review avec données malformées → error handling

### E.2 UI States
- [ ] Redimensionnement window → UI responsive
- [ ] Modal au-dessus autres éléments (z-index)
- [ ] Loading states visibles pendant exports
- [ ] Prevention double-export (disabled pendant export)

### E.3 Cross-Product Types
- [ ] Flower review → tous templates fonctionnent
- [ ] Hash review → modules adaptés
- [ ] Concentrate review → modules adaptés
- [ ] Edible review → modules adaptés

---

## 📊 RÉSUMÉ DE VÉRIFICATION

### Statistiques
- **Total checks :** 60+ points
- **✅ Fonctionnel :** ___ / ___
- **⚠️ Problèmes mineurs :** ___
- **🚨 Bugs bloquants :** ___
- **⏱️ Performance moyenne :** Export ___s, Preview ___ms

### Top 3 Problèmes Identifiés
1. ________________________
2. ________________________
3. ________________________

### Recommandations Prioritaires
1. ________________________
2. ________________________
3. ________________________

Cette vérification manuelle nous donnera une base solide pour prioriser les améliorations et revenir aux tests automatisés avec des objectifs clairs.