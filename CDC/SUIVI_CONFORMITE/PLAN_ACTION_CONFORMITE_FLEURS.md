# Plan d'Action - Mise en Conformité CDC Reviews Fleurs
**Date** : 19 décembre 2025  
**Objectif** : Atteindre 100% de conformité avec le CDC pour les reviews de type Fleur  
**Conformité actuelle** : 66%  
**Conformité cible** : 100%

---

## 🎯 Vue d'Ensemble

Ce plan d'action détaille les étapes précises pour aligner complètement l'implémentation des reviews de type Fleur avec les spécifications du Cahier des Charges (CDC).

**Durée estimée totale** : 3-4 semaines  
**Sprints** : 4 sprints d'une semaine

---

## 🔴 SPRINT 1 : Fonctionnalités CRITIQUES (Semaine 1)

### Objectif : Implémenter les 3 fonctionnalités bloquantes

### Tâche 1.1 : Section Récolte & Post-Récolte [BLOQUANT]
**Priorité** : 🔴 CRITIQUE  
**Effort** : 2 jours  
**Dépendances** : Aucune

#### Sous-tâches :
1. **Créer composant Recolte.jsx**
   ```bash
   Fichier: client/src/pages/CreateFlowerReview/sections/Recolte.jsx
   ```
   
   **Champs à implémenter** :
   - Fenêtre de récolte (select: Précoce/Optimal/Tardif)
   - Couleur trichomes (3 sliders verrouillés 100%: Translucides/Laiteux/Ambrés)
   - Mode récolte (select: Plante entière/Branches/Buds/Machine trim/Hand trim)
   - Poids brut humide (slider 50-5000g)
   - Poids net après manucure (slider 10-3000g)
   - Rendement par plante (auto-calculé)
   - Rendement au m² (auto-calculé + badge qualité)

2. **Créer config RECOLTE_CONFIG**
   ```bash
   Fichier: client/src/config/flowerReviewConfig.js
   ```
   
   Ajouter après `PALISSAGE_CONFIG` :
   ```javascript
   export const RECOLTE_CONFIG = {
       id: 'recolte',
       title: '🌾 Récolte & Post-Récolte',
       icon: '🌾',
       fields: [
           // ... 7 champs définis ci-dessus
       ]
   }
   ```

3. **Intégrer dans navigation**
   ```bash
   Fichier: client/src/pages/CreateFlowerReview/index.jsx
   ```
   
   Modifier ligne 67-78 (sections array) :
   ```javascript
   const sections = [
       // ... sections existantes
       { id: 'curing', icon: '🌡️', title: 'Curing & Maturation' },
       { id: 'recolte', icon: '🌾', title: 'Récolte & Post-Récolte', required: false }, // NOUVEAU
   ]
   ```
   
   Ajouter rendu ligne 320 :
   ```javascript
   {currentSection === 11 && (
       <Recolte formData={formData} handleChange={handleChange} />
   )}
   ```

4. **Tests manuels**
   - Vérifier calculs auto rendements
   - Tester sliders trichomes (somme = 100%)
   - Valider badges qualité rendement

**Livrable** : Section Récolte fonctionnelle et intégrée

---

### Tâche 1.2 : Code Phénotype Auto-Incrémenté [BLOQUANT]
**Priorité** : 🔴 CRITIQUE  
**Effort** : 1 jour  
**Dépendances** : Aucune

#### Sous-tâches :
1. **Créer composant PhenoCodeGenerator.jsx**
   ```bash
   Fichier: client/src/components/genetics/PhenoCodeGenerator.jsx
   ```
   
   **Fonctionnalités** :
   - Sélection préfixe (PH, F, CUT, CLONE, S)
   - Auto-incrément depuis dernier code utilisateur (API call)
   - Affichage preview : "PH-01", "F2-03", etc.
   - Possibilité override manuel

2. **Créer API endpoint**
   ```bash
   Fichier: server-new/routes/genetics.js
   ```
   
   ```javascript
   // GET /api/genetics/next-pheno-code/:prefix
   router.get('/next-pheno-code/:prefix', async (req, res) => {
       const { prefix } = req.params
       const userId = req.user.id
       
       // Chercher dernier code avec ce préfixe pour cet utilisateur
       const lastCode = await prisma.review.findFirst({
           where: { 
               userId, 
               genetics: { path: '$.codePheno', string_starts_with: prefix }
           },
           orderBy: { createdAt: 'desc' }
       })
       
       // Incrémenter
       const nextNumber = lastCode ? parseInt(lastCode.genetics.codePheno.split('-')[1]) + 1 : 1
       
       res.json({ code: `${prefix}-${String(nextNumber).padStart(2, '0')}` })
   })
   ```

3. **Intégrer dans Genetiques.jsx**
   ```bash
   Fichier: client/src/pages/CreateFlowerReview/sections/Genetiques.jsx
   ```
   
   Ajouter après champ "Généalogie" :
   ```jsx
   <PhenoCodeGenerator
       value={genetics.codePheno}
       onChange={(code) => handleGeneticsChange('codePheno', code)}
       userId={user.id}
   />
   ```

4. **Tests**
   - Générer codes pour différents préfixes
   - Vérifier incrémentation correcte
   - Tester override manuel

**Livrable** : Système de codes phénotype fonctionnel

---

### Tâche 1.3 : Arbre Généalogique - Base [BLOQUANT]
**Priorité** : 🔴 CRITIQUE  
**Effort** : 2 jours  
**Dépendances** : Bibliothèque cultivars (API existante)

#### Sous-tâches :
1. **Créer composant GeneticCanvas.jsx (MVP)**
   ```bash
   Fichier: client/src/components/genetics/GeneticCanvas.jsx
   ```
   
   **Fonctionnalités MVP Sprint 1** :
   - Zone canva vide (SVG ou Canvas HTML)
   - Affichage liste cultivars utilisateur (sidebar)
   - Drag cultivar vers canva (création nœud)
   - Affichage nœuds simples (rectangles avec nom)
   - Bouton "Créer lien" entre 2 nœuds (flèche parent→enfant)
   
   **Reporter à Sprint 3** :
   - Visualisation graphique avancée (arbre automatique)
   - Détection cycles
   - Export arbre en image

2. **Schéma DB genealogie**
   ```prisma
   // server-new/prisma/schema.prisma
   model GeneticLink {
       id        Int      @id @default(autoincrement())
       userId    Int
       parentId  Int      // ID cultivar parent
       childId   Int      // ID cultivar enfant
       type      String   // "backcross", "F1", "S1", "clone", etc.
       createdAt DateTime @default(now())
       
       user      User     @relation(fields: [userId], references: [id])
   }
   ```

3. **API endpoints genealogie**
   ```bash
   Fichier: server-new/routes/genetics.js
   ```
   
   ```javascript
   // POST /api/genetics/links - Créer lien généalogique
   // GET /api/genetics/links/:userId - Récupérer tous les liens
   // DELETE /api/genetics/links/:id - Supprimer lien
   ```

4. **Intégrer dans Genetiques.jsx**
   ```jsx
   <GeneticCanvas
       userId={user.id}
       selectedCultivars={genetics.genealogie || []}
       onChange={(genealogieData) => handleGeneticsChange('genealogie', genealogieData)}
   />
   ```

**Livrable** : Canva génétique basique avec drag & drop et liens manuels

---

## 🟠 SPRINT 2 : Fonctionnalités IMPORTANTES (Semaine 2)

### Objectif : Compléter les éléments à 50-70% de conformité

### Tâche 2.1 : Multi-Select Cultivars avec Pills
**Priorité** : 🟠 IMPORTANT  
**Effort** : 1 jour

#### Sous-tâches :
1. **Créer composant MultiSelectPills.jsx**
   ```bash
   Fichier: client/src/components/ui/MultiSelectPills.jsx
   ```
   
   **Features** :
   - Affichage pills sélectionnés
   - Drag & drop pour réordonner
   - Autocomplete recherche cultivars
   - Bouton "+ Nouveau cultivar"

2. **Remplacer input texte dans InfosGenerales.jsx**
   ```jsx
   <MultiSelectPills
       value={formData.cultivars || []}
       onChange={(cultivars) => handleChange('cultivars', cultivars)}
       source="user-library"
       placeholder="Sélectionner cultivars"
       addNewButton
   />
   ```

**Livrable** : Sélection cultivars conforme CDC

---

### Tâche 2.2 : Tags Photos
**Priorité** : 🟠 IMPORTANT  
**Effort** : 0.5 jour

#### Sous-tâches :
1. **Modifier composant PhotoUpload**
   ```bash
   Fichier: client/src/pages/CreateFlowerReview/sections/InfosGenerales.jsx
   ```
   
   Ajouter sous chaque preview photo :
   ```jsx
   <div className="flex flex-wrap gap-1 mt-2">
       {['Macro', 'Full plant', 'Bud sec', 'Trichomes', 'Drying', 'Curing'].map(tag => (
           <button
               className={`px-2 py-1 text-xs rounded ${
                   photo.tags?.includes(tag) ? 'bg-purple-500 text-white' : 'bg-gray-200'
               }`}
               onClick={() => togglePhotoTag(index, tag)}
           >
               {tag}
           </button>
       ))}
   </div>
   ```

2. **Modifier hook usePhotoUpload**
   ```javascript
   const togglePhotoTag = (photoIndex, tag) => {
       setPhotos(prev => prev.map((photo, idx) => {
           if (idx === photoIndex) {
               const tags = photo.tags || []
               return {
                   ...photo,
                   tags: tags.includes(tag) 
                       ? tags.filter(t => t !== tag)
                       : [...tags, tag]
               }
           }
           return photo
       }))
   }
   ```

**Livrable** : Système de tags photos fonctionnel

---

### Tâche 2.3 : Pipeline Culture - Mode Phases vs Personnalisé
**Priorité** : 🟠 IMPORTANT  
**Effort** : 1 jour

#### Sous-tâches :
1. **Ajouter toggle dans CulturePipelineTimeline**
   ```jsx
   <SegmentedControl
       options={[
           { id: 'phases', label: 'Mode Phases (12 étapes)' },
           { id: 'custom', label: 'Mode Personnalisé' }
       ]}
       value={timelineConfig.mode || 'custom'}
       onChange={(mode) => handleConfigChange('mode', mode)}
   />
   
   {timelineConfig.mode === 'phases' && (
       <div>
           {/* Afficher 12 phases avec durées ajustables */}
           {timelineConfig.phases.map(phase => (
               <PhaseEditor phase={phase} onChange={...} />
           ))}
       </div>
   )}
   ```

**Livrable** : Sélecteur mode phases intégré

---

### Tâche 2.4 : Bibliothèque Cultivars Complète
**Priorité** : 🟠 IMPORTANT  
**Effort** : 1.5 jours

#### Sous-tâches :
1. **Créer page dédiée bibliothèque**
   ```bash
   Fichier: client/src/pages/CultivarLibraryPage.jsx
   ```

2. **CRUD cultivars**
   - Créer nouveau cultivar (modal)
   - Éditer cultivar existant
   - Supprimer cultivar
   - Filtrer/rechercher

3. **Lier au système genetics**

**Livrable** : Bibliothèque cultivars complète

---

## 🟡 SPRINT 3 : Fonctionnalités MOYENNES (Semaine 3)

### Objectif : Améliorer sections partielles

### Tâche 3.1 : Pipeline Curing - Évolutions Sensorielles
**Priorité** : 🟡 MOYEN  
**Effort** : 2 jours

#### Sous-tâches :
1. **Ajouter panneau "MODIFICATIONS NOTES"**
   ```javascript
   {
       id: 'observations',
       label: 'OBSERVATIONS',
       icon: '🔍',
       items: [
           { key: 'evolutionVisuel', label: 'Évolution visuel', type: 'mini-sliders' },
           { key: 'evolutionOdeurs', label: 'Évolution odeurs', type: 'cata-chips' },
           { key: 'evolutionGouts', label: 'Évolution goûts', type: 'cata-chips' },
           { key: 'evolutionEffets', label: 'Évolution effets', type: 'cata-chips' }
       ]
   }
   ```

2. **Stocker modifications par timestamp**

3. **Afficher graphiques évolution**

**Livrable** : Tracking évolutions sensorielles

---

### Tâche 3.2 : Saisie Manuelle Terpènes
**Priorité** : 🟡 MOYEN  
**Effort** : 1.5 jours

#### Sous-tâches :
1. **Créer TerpeneWheel.jsx**
2. **Sliders par terpène majeur**
3. **Affichage roue aromatique**

**Livrable** : Profil terpénique manuel

---

### Tâche 3.3 : Palissage - Moment d'Application
**Priorité** : 🟡 MOYEN  
**Effort** : 0.5 jour

**Livrable** : Checkboxes phases pour palissage

---

### Tâche 3.4 : Arbre Généalogique - Visualisation Avancée
**Priorité** : 🟡 MOYEN  
**Effort** : 1 jour

**Livrable** : Génération automatique arbre, export image

---

## 🟢 SPRINT 4 : POLISH & UX (Semaine 4)

### Objectif : Finaliser les détails UI/UX

### Tâche 4.1 : Pie Builder Substrat
**Effort** : 0.5 jour

### Tâche 4.2 : VPD Auto-Calculé
**Effort** : 0.5 jour

### Tâche 4.3 : Distance Lampe Zone Recommandée
**Effort** : 0.25 jour

### Tâche 4.4 : Modal Création Breeder
**Effort** : 0.5 jour

### Tâche 4.5 : Tests E2E Complets
**Effort** : 1 jour

---

## 📊 Suivi de Progression

| Sprint | Tâches | Conformité avant | Conformité après | Status |
|--------|--------|------------------|------------------|--------|
| Sprint 1 | 3 critiques | 66% | 78% | ⏳ À faire |
| Sprint 2 | 4 importantes | 78% | 88% | ⏳ À faire |
| Sprint 3 | 4 moyennes | 88% | 95% | ⏳ À faire |
| Sprint 4 | 5 polish | 95% | 100% | ⏳ À faire |

---

## ✅ Critères de Validation Finale

Pour marquer la mise en conformité comme **COMPLÈTE** :

- [ ] Toutes les sections du CDC sont implémentées
- [ ] Score conformité = 100%
- [ ] Tests manuels passés sur chaque section
- [ ] Documentation utilisateur mise à jour
- [ ] Pas de régression sur fonctionnalités existantes
- [ ] Performance acceptable (temps chargement < 3s)
- [ ] Responsive mobile OK

---

## 🚀 Déploiement

### Pre-déploiement
1. Revue code complète
2. Tests E2E sur staging
3. Validation UX par équipe produit

### Déploiement
```bash
# 1. Merge feature branches
git checkout main
git merge feat/recolte-section
git merge feat/genetic-canvas
git merge feat/pheno-codes
# ...

# 2. Build production
cd client && npm run build
cd ../server-new && npm run prisma:migrate

# 3. Deploy VPS
./deploy-vps.sh
```

---

**Responsable Plan** : Équipe Dev Reviews-Maker  
**Prochaine revue** : Fin de chaque sprint (vendredi 17h)
