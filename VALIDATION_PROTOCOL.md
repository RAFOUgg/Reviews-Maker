# 🧪 PLAN DE VALIDATION - EXPORT RENDERING

## **PROTOCOLE DE TEST SYSTÉMATIQUE**

### **Phase 1: Tests Fondamentaux ⚡**

#### **Test 1.1 - Images & Info de base**
- [ ] ✓ Image principale s'affiche
- [ ] ✓ Nom du produit visible
- [ ] ✓ Breeder/Éleveur affiché
- [ ] ✓ Variété affichée
- [ ] ✓ Type (Indica/Sativa %) affiché
- [ ] ✓ Marque Terpologie présente
- [ ] ✓ Type de produit (🌸 🟫 🍯 🍪) affiché

#### **Test 1.2 - Analytics/Cannabinoïdes**
- [ ] ✓ Badge THC % affiché avec bonne couleur
- [ ] ✓ Badge CBD % affiché avec bonne couleur
- [ ] ✓ Badge CBG % affiché si présent
- [ ] ✓ Badge CBC % affiché si présent
- [ ] ✓ Badge CBN % affiché si présent
- [ ] ✓ Badge THCV % affiché si présent
- [ ] ✓ Valeurs = 0 ne s'affichent pas
- [ ] ✓ Valeurs manquantes ignorées

#### **Test 1.3 - Scores & Ratings**
- [ ] ✓ Note globale (ScoreGauge) affichée
- [ ] ✓ Score visuel affiché si données présentes
- [ ] ✓ Score odeur affiché si données présentes
- [ ] ✓ Score goût affiché si données présentes
- [ ] ✓ Score effets affiché si données présentes
- [ ] ✓ Score texture affiché (concentrés/hash)
- [ ] ✓ Barres de score MiniBars fonctionnelles

### **Phase 2: Tests Détaillés par Section 🔍**

#### **Test 2.1 - Section Terpènes**
- [ ] ✓ Titre "Terpènes" affiché
- [ ] ✓ Top 3-6 terpènes affichés selon template
- [ ] ✓ Graphiques TerpeneBar fonctionnels
- [ ] ✓ Pourcentages corrects affichés
- [ ] ✓ Tri décroissant par pourcentage
- [ ] ✓ Terpènes = 0% ignorés

#### **Test 2.2 - Section Visuelle/Texture (Templates Détaillés)**
- [ ] ✓ Section "Aspect" présente si données
- [ ] ✓ Crystallisation score affiché (hash/concentrate)
- [ ] ✓ Trichomes score affiché
- [ ] ✓ Pistils score affiché
- [ ] ✓ Manucure score affiché
- [ ] ✓ Dureté score affiché (texture)
- [ ] ✓ Élasticité score affiché (texture)
- [ ] ✓ Collant score affiché (texture)
- [ ] ✓ Friabilité score affiché (texture)

#### **Test 2.3 - Section Odeur**
- [ ] ✓ Titre "Odeur" + icône 👃
- [ ] ✓ Score intensité affiché
- [ ] ✓ Arômes dominants listés (pills)
- [ ] ✓ Arômes secondaires listés (pills)
- [ ] ✓ Maximum 4-6 arômes selon template
- [ ] ✓ Couleur verte cohérente

#### **Test 2.4 - Section Goût**
- [ ] ✓ Titre "Goût" + icône 😋
- [ ] ✓ Score intensité affiché
- [ ] ✓ Score agressivité affiché
- [ ] ✓ Goûts bouffée sèche listés
- [ ] ✓ Goûts inhalation listés
- [ ] ✓ Goûts expiration listés
- [ ] ✓ Couleur orange cohérente

#### **Test 2.5 - Section Effets**
- [ ] ✓ Titre "Effets" + icône 💥
- [ ] ✓ Score intensité affiché
- [ ] ✓ Score montée affiché
- [ ] ✓ Effets sélectionnés listés (pills)
- [ ] ✓ Maximum 5-8 effets selon template
- [ ] ✓ Couleur cyan cohérente

### **Phase 3: Tests Responsive par Format 📱**

#### **Test 3.1 - Format 1:1 (Carré)**
- [ ] ✓ Layout compact approprié
- [ ] ✓ Image ratio correcte
- [ ] ✓ Texte lisible
- [ ] ✓ Spacing adaptatif
- [ ] ✓ Tous éléments visibles

#### **Test 3.2 - Format 16:9 (Paysage)**
- [ ] ✓ Layout horizontal optimisé
- [ ] ✓ Image côté gauche
- [ ] ✓ Détails côté droit
- [ ] ✓ Plus d'espace pour sections
- [ ] ✓ FontSize adapté (0.9)

#### **Test 3.3 - Format 9:16 (Story)**
- [ ] ✓ Layout vertical
- [ ] ✓ Contenu compact
- [ ] ✓ FontSize optimisé (1.1)
- [ ] ✓ Sections essentielles prioritaires
- [ ] ✓ Image compacte en haut

#### **Test 3.4 - Format A4 (Document)**
- [ ] ✓ Layout portrait complet
- [ ] ✓ Densité maximale d'informations
- [ ] ✓ FontSize adapté (0.85)
- [ ] ✓ Toutes sections affichées
- [ ] ✓ Prêt pour impression

### **Phase 4: Tests par Template 🎨**

#### **Test 4.1 - Moderne Compact**
- [ ] ✓ Sections essentielles uniquement
- [ ] ✓ 2-3 cannabinoïdes max affichés
- [ ] ✓ Terpènes top 3 seulement
- [ ] ✓ Pas de sections détaillées
- [ ] ✓ Layout minimaliste

#### **Test 4.2 - Fiche Technique Détaillée**
- [ ] ✓ Toutes sections disponibles affichées
- [ ] ✓ Tous cannabinoïdes affichés
- [ ] ✓ Terpènes top 6 affichés
- [ ] ✓ Sections sensorielles complètes
- [ ] ✓ Aspects visuels/texture complets

#### **Test 4.3 - Article de Blog**
- [ ] ✓ Densité médium équilibrée
- [ ] ✓ Sections narratives
- [ ] ✓ 4-5 cannabinoïdes affichés
- [ ] ✓ Balance info/lisibilité

#### **Test 4.4 - Story Social Media**
- [ ] ✓ Ultra minimal
- [ ] ✓ 2 cannabinoïdes max
- [ ] ✓ Note globale prominent
- [ ] ✓ 3 terpènes max
- [ ] ✓ Optimisé réseaux sociaux

### **Phase 5: Tests Données Spécifiques par Type 🧬**

#### **Test 5.1 - Fleurs (Flower)**
- [ ] ✓ Tous champs flower supportés
- [ ] ✓ Génétiques complètes
- [ ] ✓ Aspects visuels fleurs
- [ ] ✓ Pas de données texture hash/concentrate

#### **Test 5.2 - Hash**
- [ ] ✓ Données texture spécifiques hash
- [ ] ✓ Type hash affiché
- [ ] ✓ Méthode extraction
- [ ] ✓ Niveau de fonte (stars)

#### **Test 5.3 - Concentrés**
- [ ] ✓ Type concentré affiché
- [ ] ✓ Méthode extraction
- [ ] ✓ Consistance/couleur
- [ ] ✓ Données texture appropriées

#### **Test 5.4 - Comestibles**
- [ ] ✓ Dosage par unité
- [ ] ✓ Type comestible
- [ ] ✓ Durée d'action
- [ ] ✓ Goût/arôme

## **🎯 CRITÈRES DE SUCCÈS GLOBAL**

### **✅ VALIDATION RÉUSSIE SI:**
- 95%+ des champs disponibles sont affichés
- Images s'affichent dans 100% des cas si présentes
- Cannabinoïdes tous visibles avec bonnes couleurs
- Terpènes complets avec graphiques fonctionnels
- Scores et notes globales toujours affichés
- Layout adaptatif fonctionne sur tous formats
- Densité template respectée (minimal/compact/détaillé)
- Aucune donnée importante manquante
- Performance acceptable (<2s rendu)

### **❌ ÉCHEC SI:**
- Images ne s'affichent pas
- Cannabinoïdes manquants ou mal affichés
- Sections vides malgré données disponibles
- Crash ou erreur JavaScript
- Layout cassé sur certains formats
- Données important non rendues

---
**📋 Cette checklist sera utilisée pour validation systématique de chaque fix jusqu'à obtention de 100% de conformité.**