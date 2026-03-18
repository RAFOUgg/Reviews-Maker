# 📋 CHECKLIST RENDU DONNÉES EXPORT - REVIEWS MAKER

## **🌸 FLEURS (Flower Reviews)**

### **📷 Section Image**
- [ ] Image principale (mainImage/image/photo)
- [ ] Galerie d'images (gallery array)
- [ ] Image de fond pour le rendu
- [ ] Watermark optionnel

### **ℹ️ Informations Générales**
- [ ] Nom commercial (holderName/nomCommercial/name)
- [ ] Type de variété (varietyType: Indica/Sativa/Hybride)
- [ ] Breeder/Éleveur (genetics.breeder)
- [ ] Variété (genetics.variety/genetics.strain)
- [ ] Phénotype (genetics.phenotype)
- [ ] Pourcentage Indica (genetics.indicaPercent)
- [ ] Pourcentage Sativa (genetics.sativaPercent)
- [ ] Génération (genetics.generation)
- [ ] Statut clone/graines (genetics.isClone)
- [ ] Date de création/test
- [ ] Auteur de la review

### **🧪 Analyses/Analytics**
- [ ] THC % (analytics.thc)
- [ ] CBD % (analytics.cbd)
- [ ] CBG % (analytics.cbg)
- [ ] CBC % (analytics.cbc)
- [ ] CBN % (analytics.cbn)
- [ ] THCV % (analytics.thcv)
- [ ] Delta-8 THC % (analytics.delta8)
- [ ] Delta-9 THC % (analytics.delta9)
- [ ] THCA % (analytics.thca)
- [ ] CBDA % (analytics.cbda)
- [ ] Rapport THC:CBD (calculé)
- [ ] Total cannabinoïdes (calculé)
- [ ] Labo/certificat (labReport/labReportUrl)

### **👁️ Évaluation Visuelle**
- [ ] Cristallisation (visual.crystallization)
- [ ] Trichomes (visual.trichomes)
- [ ] Pistils (visual.pistils)
- [ ] Manucure (visual.manucure)
- [ ] Densité (visual.density)
- [ ] Couleurs dominantes (visual.primaryColors)
- [ ] Couleurs secondaires (visual.secondaryColors)
- [ ] Forme des bourgeons (visual.budShape)
- [ ] Compacité (visual.compactness)

### **🌿 Terpènes**
- [ ] Profil terpénique complet (terpenes/terpeneProfile)
- [ ] Top 3 terpènes principaux
- [ ] Top 6 terpènes détaillés
- [ ] Pourcentages individuels
- [ ] Total terpènes
- [ ] Graphique terpènes (TerpeneBar)

### **🏺 Texture (pour Hash/Concentrates)**
- [ ] Dureté (texture.hardness)
- [ ] Élasticité (texture.elasticity)
- [ ] Collant (texture.stickiness)
- [ ] Friabilité (texture.friability)
- [ ] Aspect (texture.appearance)
- [ ] Consistance (texture.consistency)

### **👃 Évaluation Olfactive**
- [ ] Intensité odeur (odor.intensity)
- [ ] Arômes dominants (odor.dominant)
- [ ] Arômes secondaires (odor.secondary)
- [ ] Persistance (odor.persistence)
- [ ] Première impression (odor.firstImpression)
- [ ] Évolution (odor.evolution)

### **😋 Évaluation Gustative**
- [ ] Intensité goût (taste.intensity)
- [ ] Agressivité (taste.aggressiveness)
- [ ] Bouffée sèche (taste.dryPuff)
- [ ] Inhalation (taste.inhalation)
- [ ] Expiration (taste.expiration)
- [ ] Arrière-goût (taste.aftertaste)
- [ ] Évolution en bouche (taste.evolution)

### **💥 Effets**
- [ ] Intensité effets (effects.intensity)
- [ ] Vitesse de montée (effects.onset)
- [ ] Durée effets (effects.duration/dureeEffetsHeures)
- [ ] Effets sélectionnés (effects.selected)
- [ ] Pic d'effet (effects.peak)
- [ ] Redescente (effects.comedown)
- [ ] Effets secondaires (effects.sideEffects)

### **📊 Scores de Catégories**
- [ ] Score Visuel (moyenne des scores visuels)
- [ ] Score Odeur (moyenne des scores olfactifs)
- [ ] Score Goût (moyenne des scores gustatifs)
- [ ] Score Effets (moyenne des scores d'effets)
- [ ] Score Texture (pour concentrés)
- [ ] **Score Global** (overallRating/rating)

### **🏭 Culture & Production**
- [ ] Méthode de culture (culture.method: Indoor/Outdoor/Greenhouse)
- [ ] Substrat (culture.substrate)
- [ ] Nutriments (culture.nutrients)
- [ ] Durée floraison (culture.floweringTime)
- [ ] Saison récolte (culture.season)
- [ ] Séchage (culture.drying)
- [ ] Affinage (culture.curing)


## **🟫 HASH**

### **Spécifique Hash en plus des champs Flower:**
- [ ] Type de hash (hashType: Bubble, Rosin, etc.)
- [ ] Méthode extraction (extractionMethod)
- [ ] Microns (bubbleHash.microns)
- [ ] Fondu (meltLevel: 1-6 star)
- [ ] Solubilité (solubility)
- [ ] Rendement extraction (yieldPercent)


## **🍯 CONCENTRÉS**

### **Spécifique Concentrés:**
- [ ] Type concentré (concentrateType: Shatter, Wax, Live Resin, etc.)
- [ ] Méthode extraction (extractionMethod: CO2, BHO, Rosin, etc.)
- [ ] Solvants (solvants utilisés)
- [ ] Purge (purgeMethod/temps)
- [ ] Consistance finale (consistency)
- [ ] Couleur (color)
- [ ] Clarté/transparence (clarity)


## **🍪 COMESTIBLES (Edibles)**

### **Spécifique Comestibles:**
- [ ] Type comestible (edibleType: Brownies, Gummies, etc.)
- [ ] Dosage par unité (dosagePerUnit)
- [ ] Nombre d'unités (numberOfUnits)
- [ ] Dosage total (totalDosage)
- [ ] Ingrédients (ingredients)
- [ ] Goût/arôme (flavor)
- [ ] Début d'action (onsetTime)
- [ ] Durée totale (totalDuration)
- [ ] Instructions dosage (dosageInstructions)


## **📋 TEMPLATES À TESTER**

### **Templates:**
- [ ] **Moderne Compact** (modernCompact)
- [ ] **Fiche Technique Détaillée** (detailedCard)
- [ ] **Article de Blog** (blogArticle)
- [ ] **Story Social Media** (socialStory)

### **Formats:**
- [ ] **1:1** (Carré 540x540)
- [ ] **16:9** (Paysage 720x405)
- [ ] **9:16** (Portrait 405x720)
- [ ] **A4** (Document 530x750)

### **Combinaisons à valider:** (4 Templates × 4 Formats = 16 combinaisons)
- [ ] Compact + 1:1
- [ ] Compact + 16:9
- [ ] Compact + 9:16
- [ ] Compact + A4
- [ ] Détaillée + 1:1
- [ ] Détaillée + 16:9
- [ ] Détaillée + 9:16
- [ ] Détaillée + A4
- [ ] Blog + 1:1
- [ ] Blog + 16:9
- [ ] Blog + 9:16
- [ ] Blog + A4
- [ ] Story + 1:1
- [ ] Story + 16:9
- [ ] Story + 9:16
- [ ] Story + A4


## **🎨 ÉLÉMENTS VISUELS**

### **Rendu graphique:**
- [ ] Jauges de scores (ScoreGauge)
- [ ] Barres de scores (MiniBars)
- [ ] Graphiques terpènes (TerpeneBar)
- [ ] Pills/badges cannabinoïdes
- [ ] Fond dégradé personnalisé
- [ ] Marque Terpologie
- [ ] Date/timestamp
- [ ] Filigrane utilisateur

### **Couleurs & Style:**
- [ ] Couleurs terpènes
- [ ] Couleurs cannabinoïdes
- [ ] Couleurs catégories
- [ ] Police personnalisée
- [ ] Tailles de texte adaptatives
- [ ] Espacement responsive


## **⚠️ POINTS CRITIQUES À VÉRIFIER**

1. **Images ne s'affichent pas** → Vérifier getMainImage()
2. **Scores manquants** → Vérifier getCategoryScores()
3. **Terpènes invisibles** → Vérifier resolveReviewField('terpenes')
4. **Analytics vides** → Vérifier templateData.analytics
5. **Pagination cassée** → Vérifier calculateOptimalLayout()
6. **FontSize non appliqué** → Vérifier tous les styles inline
