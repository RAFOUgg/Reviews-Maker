# 🔧 PLAN D'IMPLÉMENTATION - CORRECTIONS V1 MVP

## Status: 🔴 À IMPLÉMENTER IMMÉDIATEMENT

**Deadline**: Avant déploiement V1 MVP  
**Branche**: `refactor/project-structure`  
**Commits**: Groupés par sprint

---

## SPRINT 1: GENETICS PERMISSIONS (Aujourd'hui - 2-3 heures)

### CORRECTION 1.1: Ajouter middleware requireProducteur à genetics.js

**Fichier**: `server-new/routes/genetics.js`

**Avant** (ligne 38-42):
```javascript
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};
```

**Après - Ajouter ce middleware**:
```javascript
// Middleware d'authentification et vérification du type de compte
const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
};

// Middleware pour vérifier que l'utilisateur est Producteur
// Selon V1 MVP: PhenoHunt accessible UNIQUEMENT pour Producteur ($29.99/mois)
const requireProducteur = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    // V1 MVP: Seul Producteur peut accéder à PhenoHunt
    if (req.user.accountType !== 'producteur') {
        return res.status(403).json({ 
            error: "PhenoHunt est accessible uniquement pour les comptes Producteur",
            requiredPlan: "producteur"
        });
    }
    
    next();
};
```

**Puis appliquer à toutes les routes**:
```javascript
// TREES ROUTES
router.get("/trees", requireProducteur, async (req, res) => { ... })
router.post("/trees", requireProducteur, validateTreeCreation, async (req, res) => { ... })
router.get("/trees/:id", requireProducteur, async (req, res) => { ... })
router.put("/trees/:id", requireProducteur, validateTreeUpdate, async (req, res) => { ... })
router.delete("/trees/:id", requireProducteur, async (req, res) => { ... })

// NODES ROUTES
router.get("/trees/:id/nodes", requireProducteur, async (req, res) => { ... })
router.post("/trees/:id/nodes", requireProducteur, validateNodeCreation, async (req, res) => { ... })
router.put("/nodes/:nodeId", requireProducteur, validateNodeUpdate, async (req, res) => { ... })
router.delete("/nodes/:nodeId", requireProducteur, async (req, res) => { ... })

// EDGES ROUTES
router.get("/trees/:id/edges", requireProducteur, async (req, res) => { ... })
router.post("/trees/:id/edges", requireProducteur, validateEdgeCreation, async (req, res) => { ... })
router.delete("/edges/:edgeId", requireProducteur, async (req, res) => { ... })

// PHENO CODE ENDPOINT
router.get("/next-pheno-code/:prefix", requireProducteur, async (req, res) => { ... })
```

**Validation**:
- [ ] Route GET /api/genetics/trees retourne 403 pour Amateur
- [ ] Route GET /api/genetics/trees retourne 403 pour Influenceur
- [ ] Route GET /api/genetics/trees retourne 200 pour Producteur
- [ ] Message d'erreur clair et informatif

**Commit**: `fix: Add Producteur guard to genetics API routes (V1 MVP)`

---

### CORRECTION 1.2: Masquer section Génétiques pour Amateur dans CreateFlowerReview

**Fichier**: `client/src/pages/review/CreateFlowerReview/index.jsx`

**Étape 1**: Récupérer le type de compte
```javascript
import { useAuthStore } from '../../../store/index'; // À vérifier si existe

// Dans le composant
const { user } = useAuthStore(); // ou useAuth() ou autre hook
const accountType = user?.accountType;

const isProducteur = accountType === 'producteur';
const isInfluenceur = accountType === 'influenceur';
const canAccessGenetics = isProducteur || isInfluenceur;
const canAccessPhenoHunt = isProducteur; // Seulement Producteur
```

**Étape 2**: Conditionner le rendu (ligne ~268)
```javascript
// AVANT:
<Genetiques formData={formData} handleChange={handleChange} />

// APRÈS:
{canAccessGenetics ? (
    <Genetiques 
        formData={formData} 
        handleChange={handleChange}
        allowPhenoHunt={canAccessPhenoHunt}
    />
) : (
    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <p className="text-sm text-yellow-400">
            💡 Section Génétiques disponible pour les comptes Producteur ($29.99/mois)
        </p>
    </div>
)}
```

**Validation**:
- [ ] Amateur ne voit pas section Génétiques
- [ ] Amateur ne voit que message informatif
- [ ] Producteur voit section complète avec PhenoHunt
- [ ] Influenceur voit section sans PhenoHunt

**Commit**: `refactor: Restrict Genetics section to Producteur and Influenceur accounts`

---

### CORRECTION 1.3: Adapter section Génétiques pour Influenceur

**Fichier**: `client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx`

**Signature du composant** (ligne 11):
```javascript
// AVANT:
export default function Genetiques({ formData, handleChange }) {

// APRÈS:
export default function Genetiques({ formData, handleChange, allowPhenoHunt = true }) {
```

**Masquer PhenoHunt pour Influenceur** (ligne ~199-214):
```javascript
// AVANT:
{/* Arbre Généalogique / PhenoHunt Interactive */}
<button onClick={() => setShowPhenoHunt(!showPhenoHunt)}>
    PhenoHunt - Arbre Généalogique Interactive
</button>

// APRÈS:
{/* Arbre Généalogique / PhenoHunt Interactive - Producteur uniquement */}
{allowPhenoHunt && (
    <button onClick={() => setShowPhenoHunt(!showPhenoHunt)}>
        PhenoHunt - Arbre Généalogique Interactive
        {showPhenoHunt ? '▼' : '▶'}
    </button>
)}

{/* Message informatif pour Influenceur */}
{!allowPhenoHunt && (
    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-400">
        💡 PhenoHunt (arbre généalogique complet) est disponible pour les comptes Producteur
    </div>
)}
```

**Validation**:
- [ ] Producteur voit bouton PhenoHunt + canvas
- [ ] Influenceur ne voit pas bouton PhenoHunt
- [ ] Influenceur voit message informatif
- [ ] Champs de base (Cultivars) restent accessibles

**Commit**: `refactor: Hide PhenoHunt canvas from Influenceur accounts`

---

## SPRINT 2: BACKEND FLOWERS PERMISSIONS (Demain - 2-3 heures)

### CORRECTION 2.1: Valider permissions sur POST/PUT flowers

**Fichier**: `server-new/routes/flowers.js` (ou équivalent)

**Créer middleware de validation** (à ajouter avant les routes):
```javascript
/**
 * Middleware pour valider que les sections POST/PUT sont autorisées 
 * selon le type de compte (V1 MVP)
 */
const validateSectionPermissions = (req, res, next) => {
    const { accountType } = req.user;
    const { formData } = req.body;
    
    if (!formData) {
        return next(); // Pas de données = pas de problème
    }
    
    // Sections interdites par type de compte
    const forbiddenSections = {
        'amateur': [
            'genetics',              // Section 2
            'pipelineCulture',      // Section 3
            'pipelineCuring'        // Section 10
        ],
        'influenceur': [
            'pipelineCulture',      // Section 3
            'phenoHuntTreeId',      // Spécifiquement PhenoHunt
            'phenoHuntData'
        ]
        // 'producteur': aucune restriction
    };
    
    const notAllowed = forbiddenSections[accountType] || [];
    
    // Vérifier si une section interdite est présente
    for (const section of notAllowed) {
        if (formData[section]) {
            return res.status(403).json({
                error: `Section ${section} is not available for ${accountType} accounts`,
                requiredPlan: 'producteur',
                section: section
            });
        }
    }
    
    next();
};

// Appliquer aux routes
router.post("/", requireAuth, validateSectionPermissions, async (req, res) => { ... })
router.put("/:id", requireAuth, validateSectionPermissions, async (req, res) => { ... })
```

**Validation**:
- [ ] POST avec `genetics` pour Amateur retourne 403
- [ ] POST avec `pipelineCulture` pour Influenceur retourne 403
- [ ] POST sans sections interdites passe pour tous
- [ ] PUT avec données interdites retourne 403

**Commit**: `fix: Add section permission validation to flowers routes`

---

### CORRECTION 2.2: Filtrer sections GET flowers par accountType

**Fichier**: `server-new/routes/flowers.js` (GET by ID)

**Ajouter filtering sur le retour**:
```javascript
router.get("/:id", async (req, res) => {
    try {
        const flower = await prisma.flower.findUnique({
            where: { id: req.params.id }
        });
        
        if (!flower) {
            return res.status(404).json({ error: "Review not found" });
        }
        
        // NOUVEAU: Filtrer les sections selon le type de compte du viewer
        const viewerAccountType = req.user?.accountType || 'anonymous';
        
        // Sections à masquer pour certains compte types
        if (viewerAccountType === 'amateur') {
            // Amateur ne voit pas: genetics, pipelineCulture, pipelineCuring
            flower.genetics = null;
            flower.pipelineCulture = null;
            flower.pipelineCuring = null;
            flower.phenoHuntTreeId = null;
            flower.phenoHuntData = null;
        } else if (viewerAccountType === 'influenceur') {
            // Influenceur ne voit pas: pipelineCulture, phenoHuntTreeId
            flower.pipelineCulture = null;
            flower.phenoHuntTreeId = null;
            flower.phenoHuntData = null;
        }
        // Producteur: aucun filtrage
        
        res.json(flower);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch review" });
    }
});
```

**Validation**:
- [ ] Amateur ne voit pas genetics dans GET /api/flowers/:id
- [ ] Influenceur ne voit pas pipelineCulture
- [ ] Producteur voit tout
- [ ] Données masquées = null, pas suppression d'autres champs

**Commit**: `fix: Filter restricted sections in flowers GET response by account type`

---

## SPRINT 3: TESTING & VALIDATION (2 heures)

### CORRECTION 3.1: Tests API genetics permissions

**Command** (depuis racine du projet):
```bash
# Test 1: Amateur accédant à genetics (doit retourner 403)
curl -X GET http://localhost:4000/api/genetics/trees \
  -H "Authorization: Bearer <amateur_token>"
# Expected: 403 with message "PhenoHunt est accessible uniquement pour..."

# Test 2: Producteur accédant à genetics (doit retourner 200)
curl -X GET http://localhost:4000/api/genetics/trees \
  -H "Authorization: Bearer <producteur_token>"
# Expected: 200 with trees array

# Test 3: Influenceur POST genetics (doit retourner 403)
curl -X POST http://localhost:4000/api/genetics/trees \
  -H "Authorization: Bearer <influenceur_token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'
# Expected: 403 with message
```

**Validation**:
- [ ] Amateur 403 pour GET /api/genetics/trees
- [ ] Influenceur 403 pour GET /api/genetics/trees
- [ ] Producteur 200 pour GET /api/genetics/trees
- [ ] Message d'erreur clair

---

### CORRECTION 3.2: Tests UI par account type

**Tests manuels** (dans browser):

**Amateur account**:
- [ ] Créer review: Section Génétiques **MASQUÉE** (message informatif visible)
- [ ] Créer review: Sections 1, 4-9 présentes
- [ ] GET /api/flowers/:id: genetics est null

**Producteur account**:
- [ ] Créer review: Section Génétiques **VISIBLE** avec PhenoHunt
- [ ] Créer review: Toutes sections présentes
- [ ] GET /api/genetics/trees: 200 OK

**Influenceur account**:
- [ ] Créer review: Section Génétiques **VISIBLE** MAIS sans PhenoHunt
- [ ] Créer review: Message "PhenoHunt disponible pour Producteur"
- [ ] POST /api/genetics/trees: 403 Forbidden

---

## COMMIT SUMMARY

```bash
# Commit 1: Genetics API permissions
git commit -m "fix: Add Producteur guard to genetics API routes (V1 MVP)

- Add requireProducteur middleware to all /api/genetics/* endpoints
- Only Producteur accounts can create/access PhenoHunt trees
- Amateur and Influenceur return 403 with clear message
- Aligns with V1 MVP spec: PhenoHunt for Producteur only"

# Commit 2: Frontend Genetics section restrictions
git commit -m "refactor: Restrict Genetics section by account type (V1 MVP)

- Hide entire Genetics section for Amateur accounts
- Pass allowPhenoHunt prop to Genetiques component
- Show info message: 'Available for Producteur accounts'
- Amateur: No genetics at all
- Producteur: Full access with PhenoHunt
- Influenceur: Genetics without PhenoHunt"

# Commit 3: Backend flowers validation
git commit -m "fix: Add section permission validation to flowers routes (V1 MVP)

- Validate POST/PUT don't include forbidden sections
- Amateur: Cannot save genetics, pipelineCulture, pipelineCuring
- Influenceur: Cannot save pipelineCulture, phenoHuntTreeId
- Producteur: No restrictions
- Return 403 with section name if violation"

# Commit 4: GET response filtering
git commit -m "fix: Filter restricted sections in flowers GET by account type (V1 MVP)

- GET /api/flowers/:id filters sections based on viewer's account
- Amateur: genetics, pipelineCulture, pipelineCuring → null
- Influenceur: pipelineCulture, phenoHuntTreeId → null
- Producteur: No filtering
- Prevents data leakage in gallery/shares"

# Final push
git push origin refactor/project-structure
```

---

## DEPLOYMENT

Once all corrections tested:

```bash
# Build and sync to Nginx
ssh -p 4200 ubuntu@51.75.22.192 "cd /home/ubuntu/Reviews-Maker && \
  git pull origin refactor/project-structure && \
  cd client && npm run build && cd ../server-new && npm run build && \
  sudo rm -rf /var/www/reviews-maker/client/dist/* && \
  sudo cp -r /home/ubuntu/Reviews-Maker/client/dist/* /var/www/reviews-maker/client/dist/ && \
  sudo chown -R www-data:www-data /var/www/reviews-maker/client/dist && \
  pm2 restart all && \
  echo '✅ V1 MVP Permissions Deployed'"
```

---

## ROLLBACK PLAN

If issues found:

```bash
git revert 6eeab58
git push origin refactor/project-structure
# Redeploy
```

---

## NEXT STEPS AFTER SPRINT 3

Once genetics permissions are done:

1. **SPRINT 4**: Pipeline Culture permissions (Section 3)
2. **SPRINT 5**: Pipeline Curing permissions (Section 10)
3. **SPRINT 6**: Export template permissions
4. **SPRINT 7**: Full end-to-end V1 MVP compliance validation

---

## ESTIMATED TIMELINE

- Sprint 1 (Genetics Frontend): 2-3 hours
- Sprint 2 (Genetics Backend): 2-3 hours
- Sprint 3 (Testing & Validation): 2 hours
- **Total**: 6-8 hours
- **Target**: Today/Tomorrow

---

**Status**: 🔴 À commencer  
**Blocker**: Non - Peut commencer immédiatement  
**Dependencies**: None - Ces corrections sont indépendantes
