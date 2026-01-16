# 🚀 POINT DE DÉPART - V1 MVP SPRINT 1

**Date**: 17 janvier 2026  
**Status**: ⏳ À COMMENCER  
**Duration estimée**: 2-3 heures  
**Équipe**: Frontend Developer (1 personne)  

---

## 📖 GUIDE DE DÉMARRAGE (5 minutes)

### 1. Comprendre ce qu'on fait
**BUT**: Empêcher les utilisateurs Amateur et Influenceur d'accéder à PhenoHunt

**Règles V1 MVP**:
- Amateur: ❌ **PAS** de section Génétiques
- Producteur: ✅ Accès COMPLET à Génétiques + PhenoHunt
- Influenceur: ⚠️ Accès à Génétiques MAIS **PAS** de PhenoHunt

### 2. Documents à lire (Dans cet ordre)
1. Ce fichier (2 min) ← Vous êtes ici
2. [RESUME_EXECUTIF_V1_MVP_CONFORMITE.md](RESUME_EXECUTIF_V1_MVP_CONFORMITE.md) (5 min)
3. [PLAN_IMPLEMENTATION_V1_MVP_CORRECTIONS.md](PLAN_IMPLEMENTATION_V1_MVP_CORRECTIONS.md#sprint-1-genetics-permissions-2-3-heures) (15 min) - **Sections SPRINT 1 uniquement**

### 3. Tâches à faire
**Tâche 1**: Ajouter middleware `requireProducteur` à `server-new/routes/genetics.js`
**Tâche 2**: Masquer section Génétiques pour Amateur dans `CreateFlowerReview`
**Tâche 3**: Masquer PhenoHunt pour Influenceur dans `Genetiques.jsx`

### 4. Valider votre travail
- [ ] Amateur crée review: Section Génétiques DISPARUE
- [ ] Producteur crée review: Section visible avec PhenoHunt
- [ ] Influenceur crée review: Section visible SANS PhenoHunt
- [ ] Console browser: Pas d'erreurs

### 5. Merger et continuer à SPRINT 2
```bash
git add -A
git commit -m "refactor: Implement Genetics section permissions by account type (V1 MVP SPRINT 1)

Changes:
- server-new/routes/genetics.js: Add requireProducteur middleware to 11 endpoints
- CreateFlowerReview/index.jsx: Hide Genetics section for Amateur accounts
- Genetiques.jsx: Hide PhenoHunt canvas for Influenceur accounts

Account type behavior:
- Amateur: Genetics section masked (show info message)
- Producteur: Full access with PhenoHunt
- Influenceur: Genetics without PhenoHunt

Tests:
- API: Amateur/Influenceur get 403 on /api/genetics/*
- UI: All 3 account types display correct sections
- No console errors"

git push origin refactor/project-structure
```

---

## ⚙️ DÉTAILS TECHNIQUE SPRINT 1

### Fichier 1: server-new/routes/genetics.js
**Ligne de départ**: 34-42 (avant requireAuth)

**À ajouter** (copier-coller exactement):
```javascript
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

**Puis, remplacer TOUTES les routes par** `requireProducteur` **au lieu de** `requireAuth`:

```javascript
// Ligne ~47 - AVANT:
router.get("/trees", requireAuth, async (req, res) => {

// Après:
router.get("/trees", requireProducteur, async (req, res) => {

// FAIRE PAREIL pour:
// - router.post("/trees", ...)
// - router.get("/trees/:id", ...)
// - router.put("/trees/:id", ...)
// - router.delete("/trees/:id", ...)
// - router.get("/trees/:id/nodes", ...)
// - router.post("/trees/:id/nodes", ...)
// - router.put("/nodes/:nodeId", ...)
// - router.delete("/nodes/:nodeId", ...)
// - router.get("/trees/:id/edges", ...)
// - router.post("/trees/:id/edges", ...)
// - router.delete("/edges/:edgeId", ...)
// - router.get("/next-pheno-code/:prefix", ...)
```

**Vérification**: Ctrl+F "requireAuth" dans genetics.js → Tous les endpoints genetics utilisent maintenant "requireProducteur"

---

### Fichier 2: client/src/pages/review/CreateFlowerReview/index.jsx
**Ligne de départ**: Vers le haut du composant

**À ajouter** (après autres imports/useState):
```javascript
// Vérifier le type de compte pour les permissions
const { user } = useAuthStore(); // ou votre hook d'auth
const accountType = user?.accountType;

// Déterminer les accès
const isProducteur = accountType === 'producteur';
const isInfluenceur = accountType === 'influenceur';
const canAccessGenetics = isProducteur || isInfluenceur;
const canAccessPhenoHunt = isProducteur;
```

**Ligne ~268 - Où se rend la section Génétiques, remplacer**:
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

**Vérification**: 
- [ ] Accès à la page sans erreur
- [ ] Message jaune visible pour Amateur
- [ ] Section Génétiques absente pour Amateur

---

### Fichier 3: client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx
**Ligne 11 - Modifier la signature du composant**:
```javascript
// AVANT:
export default function Genetiques({ formData, handleChange }) {

// APRÈS:
export default function Genetiques({ formData, handleChange, allowPhenoHunt = true }) {
```

**Ligne ~199-214 - Trouver le bouton PhenoHunt et l'entourer**:
```javascript
// AVANT:
{/* Arbre Généalogique / PhenoHunt Interactive */}
<button 
    onClick={() => setShowPhenoHunt(!showPhenoHunt)}
    // ... autres props
>
    PhenoHunt - Arbre Généalogique Interactive
</button>

// APRÈS:
{/* Arbre Généalogique / PhenoHunt Interactive - Producteur uniquement */}
{allowPhenoHunt && (
    <button 
        onClick={() => setShowPhenoHunt(!showPhenoHunt)}
        // ... autres props existantes
    >
        PhenoHunt - Arbre Généalogique Interactive
    </button>
)}

{/* Message informatif pour Influenceur */}
{!allowPhenoHunt && (
    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-400">
        💡 PhenoHunt (arbre généalogique complet) est disponible pour les comptes Producteur
    </div>
)}
```

**Vérification**:
- [ ] Producteur voit le bouton PhenoHunt
- [ ] Influenceur ne voit pas le bouton PhenoHunt
- [ ] Influenceur voit le message bleu
- [ ] Pas d'erreur console

---

## 🧪 TESTER AVANT DE MERGER

### Test 1: API Permissions
```bash
# Ouvrir terminal
cd server-new

# Récupérer les tokens de test (ou créer des comptes test)
# Amateur token: <amateur_user_token>
# Producteur token: <producteur_user_token>
# Influenceur token: <influenceur_user_token>

# Test Amateur (doit retourner 403)
curl -X GET http://localhost:4000/api/genetics/trees \
  -H "Authorization: Bearer <amateur_token>"
# Expected response: 
# {
#   "error": "PhenoHunt est accessible uniquement pour les comptes Producteur",
#   "requiredPlan": "producteur"
# }

# Test Producteur (doit retourner 200)
curl -X GET http://localhost:4000/api/genetics/trees \
  -H "Authorization: Bearer <producteur_token>"
# Expected: [] ou liste d'arbres
```

### Test 2: UI Display
1. Ouvrir http://localhost:5173 dans browser
2. Login avec Amateur → Créer review → Vérifier: Section Génétiques **ABSENTE**, message jaune visible
3. Logout → Login Producteur → Créer review → Section Génétiques **PRÉSENTE**, bouton PhenoHunt visible
4. Logout → Login Influenceur → Créer review → Section Génétiques **PRÉSENTE**, bouton PhenoHunt **ABSENT**, message bleu visible
5. F12 → Console → Pas d'erreurs rouges

### Test 3: Form Submission
1. Amateur: Essayer de remplir formulaire jusqu'à la fin → Doit sauvegarder sans Génétiques
2. Producteur: Remplir tous les champs y compris Génétiques → Doit sauvegarder tout
3. Vérifier DB: `SELECT genetics FROM flowers WHERE userId=<user_id>` → Doit être NULL pour Amateur

---

## 📋 CHECKLIST AVANT COMMIT

```
CODE CHANGES
- [ ] server-new/routes/genetics.js: requireProducteur middleware ajouté
- [ ] server-new/routes/genetics.js: Tous les endpoints utilisent requireProducteur
- [ ] CreateFlowerReview/index.jsx: States accountType + canAccessGenetics ajoutés
- [ ] CreateFlowerReview/index.jsx: Rendering conditionnel pour Génétiques
- [ ] Genetiques.jsx: Signature accepte allowPhenoHunt
- [ ] Genetiques.jsx: PhenoHunt button enveloppé dans {allowPhenoHunt && ...}
- [ ] Genetiques.jsx: Message bleu pour Influenceur ajouté

TESTING
- [ ] Amateur: Section Génétiques masquée + message visible
- [ ] Producteur: Section Génétiques visible + PhenoHunt visible
- [ ] Influenceur: Section visible + PhenoHunt masqué + message bleu
- [ ] API test Amateur: GET /api/genetics/trees → 403
- [ ] API test Producteur: GET /api/genetics/trees → 200
- [ ] Console browser: Pas d'erreurs rouges
- [ ] Form submit: Amateur ne sauvegarde pas genetics

CLEANUP
- [ ] Pas de console.log() laissé dans le code
- [ ] Pas de commented-out code
- [ ] Pas de fichiers uncommitted
- [ ] git status → clean working tree

COMMIT MESSAGE
- [ ] Format: "refactor: Implement Genetics section permissions (V1 MVP SPRINT 1)"
- [ ] Détails des changements dans body
- [ ] Reference V1 MVP spec
- [ ] Mention des 3 fichiers modifiés
```

---

## 🚨 PROBLÈMES COURANTS & SOLUTIONS

### Problème: "user is undefined"
**Cause**: useAuthStore() ne retourne pas l'utilisateur
**Solution**: Vérifier le hook d'authentification correct dans votre app
```javascript
// Option 1: useAuthStore
const { user } = useAuthStore();

// Option 2: useAuth hook
const { user } = useAuth();

// Option 3: useContext
const { user } = useContext(AuthContext);

// Option 4: Props passés par parent
const user = useUser();
```

### Problème: "allowPhenoHunt is not defined"
**Cause**: Prop non passé de CreateFlowerReview → Genetiques
**Solution**: Vérifier le passage correct du prop lors du rendu
```javascript
// Vérifier:
<Genetiques 
    formData={formData} 
    handleChange={handleChange}
    allowPhenoHunt={canAccessPhenoHunt}  ← Assurez-vous
/>
```

### Problème: API retourne 200 même pour Amateur
**Cause**: Middleware requireProducteur non appliqué
**Solution**: Vérifier tous les routes utilisent requireProducteur
```bash
# Vérifier:
grep -n "requireAuth" server-new/routes/genetics.js
# Résultat: Doit être 0 (tous doivent être requireProducteur)

grep -n "requireProducteur" server-new/routes/genetics.js
# Résultat: Doit être 11+
```

---

## ✅ SUCCÈS = Quand...

1. ✅ Amateur crée review: Sections 1, 4-9 présentes, **2 (Génétiques) absente**
2. ✅ Producteur crée review: Toutes sections 1-10 présentes
3. ✅ Influenceur crée review: Sections 1, 2 (sans PhenoHunt), 4-10 présentes
4. ✅ API GET /api/genetics/trees:
   - Amateur → 403 "PhenoHunt est accessible..."
   - Producteur → 200 + liste d'arbres
   - Influenceur → 403 "PhenoHunt est accessible..."
5. ✅ Console browser: 0 erreurs rouges
6. ✅ Tous les tests passent

---

## 🎯 APRÈS SPRINT 1: Ce qui vient après

Une fois votre travail mergé et testé:
1. Attendez que le backend dev termine SPRINT 2 (flowers validation)
2. Ensemble: Testez l'intégration complète
3. Mergez tout dans master
4. Déployez sur le VPS

**SPRINT 2** (Backend): +2-3h, en parallèle
**SPRINT 3** (Testing): +2h, après les 2 premiers sprints

---

## 📞 QUESTIONS?

Si quelque chose n'est pas clair:
1. Re-lisez [PLAN_IMPLEMENTATION_V1_MVP_CORRECTIONS.md](PLAN_IMPLEMENTATION_V1_MVP_CORRECTIONS.md#sprint-1-genetics-permissions-2-3-heures)
2. Regardez le code example exact fourni
3. Testez incremental (une petite partie à la fois)
4. Les erreurs du compilateur/browser sont vos amis (lis-les!)

---

**Status**: 🟡 À commencer  
**Durée estimée**: 2-3 heures  
**Deadline**: Aujourd'hui EOD  
**Impact**: CRITIQUE pour V1 MVP  

**Prêt à commencer?** → Ouvrez `server-new/routes/genetics.js` et commencez par ajouter le middleware `requireProducteur` 🚀
