# 📋 AUDIT V1 MVP CONFORMITÉ - 16 JANVIER 2026

## 🎯 CONTEXTE

Audit complet de l'application Reviews-Maker pour vérifier la conformité avec le cahier des charges V1 MVP spécifié dans:
- `CAHIER_DES_CHARGES_V1_MVP_FLEURS.md` (ligne 613-709)
- Détails spécificités des comptes utilisateurs (Amateur, Producteur, Influenceur)

---

## ✅ ACTIONS COMPLÉTÉES

### 1. Suppression des routes publiques PhenoHunt/Genetics
**Status**: ✅ COMPLET (Commit 0267255)

**Fichiers modifiés**:
- `client/src/components/UserProfileDropdown.jsx` - Removed `/genetics` menu link
- `client/src/App.jsx` - Removed `/phenohunt` and `/genetics` routes + lazy imports
- `client/src/pages/public/HomePage.jsx` - Removed "Accéder à PhénoHunt" button

**Vérification**:
- Routes `/phenohunt` et `/genetics` plus accessibles publiquement ✅
- Menu utilisateur ne propose plus d'accès ✅
- HomePage n'a plus de bouton de redirection ✅

---

## 🔴 PROBLÈMES IDENTIFIÉS & À CORRIGER

### PROBLÈME 1: Manque de permission guard sur les routes API genetics
**Sévérité**: HAUTE  
**Fichier**: `server-new/routes/genetics.js`  
**Ligne**: 47, 77, 105+  
**Issue**: Les routes `/api/genetics/*` vérifient seulement `requireAuth` mais pas le type de compte

**Cahier des charges exige**:
- ✅ Amateur: ❌ **PAS d'accès** à génétiques du tout
- ✅ Producteur: ✅ Accès complet à PhenoHunt
- ✅ Influenceur: ⚠️ Accès Section Génétiques SANS PhenoHunt

**Solution à implémenter**:
```javascript
// Ajouter un middleware de permission
const requireProducteur = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    if (req.user.accountType !== 'producteur') {
        return res.status(403).json({ 
            error: "PhenoHunt accessible uniquement pour les comptes Producteur" 
        });
    }
    next();
};

// Appliquer sur les routes sensibles
router.get("/trees", requireProducteur, async (req, res) => { ... })
router.post("/trees", requireProducteur, async (req, res) => { ... })
router.put("/trees/:id", requireProducteur, async (req, res) => { ... })
router.delete("/trees/:id", requireProducteur, async (req, res) => { ... })
```

---

### PROBLÈME 2: Composants PhenoHunt jamais masqués dans CreateFlowerReview
**Sévérité**: HAUTE  
**Fichier**: `client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx`  
**Issue**: Section Génétiques affichée à tous sans vérification du type de compte

**Cahier des charges exige**:
- Amateur: ❌ Pas accès à Section 2 (Génétiques) du tout
- Producteur: ✅ Accès complet à Section 2 + PhenoHunt
- Influenceur: ⚠️ Accès à Section 2 SANS PhenoHunt

**Solution à implémenter**:
1. Récupérer `user.accountType` dans CreateFlowerReview
2. Masquer toute la section pour Amateur
3. Pour Influenceur, afficher section génétiques MAIS masquer les controls PhenoHunt

```javascript
// Dans CreateFlowerReview/index.jsx
const [user, setUser] = useState(null);
const isProducteur = user?.accountType === 'producteur';
const isInfluenceur = user?.accountType === 'influenceur';
const canAccessGenetics = isProducteur || isInfluenceur;

// Puis dans le rendu:
{canAccessGenetics && (
    <Genetiques 
        formData={formData} 
        handleChange={handleChange}
        allowPhenoHunt={isProducteur}  // Seulement Producteur
    />
)}
```

---

### PROBLÈME 3: Section Génétiques ne gère pas l'absence de PhenoHunt pour Influenceur
**Sévérité**: MOYENNE  
**Fichier**: `client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx`  
**Issue**: Le composant affiche toujours les options PhenoHunt

**Cahier des charges exige**:
- Influenceur doit avoir accès à champs de base (Cultivars, Type) MAIS pas au canvas PhenoHunt

**Solution à implémenter**:
```javascript
export default function Genetiques({ 
    formData, 
    handleChange,
    allowPhenoHunt = true  // Nouveau paramètre
}) {
    // ...
    
    // Masquer le bouton PhenoHunt pour Influenceur
    {allowPhenoHunt && (
        <button onClick={() => setShowPhenoHunt(!showPhenoHunt)}>
            PhenoHunt - Arbre Généalogique Interactive
        </button>
    )}
}
```

---

### PROBLÈME 4: Pas de restriction d'accès au composant CultivarList
**Sévérité**: BASSE  
**Fichier**: `client/src/components/genetics/CultivarList.jsx`  
**Issue**: Importé dans CreateFlowerReview et EditReviewPage sans vérification

**Cahier des charges exige**:
- Affichable pour Producteur et Influenceur seulement

**Note**: C'est un composant raisonnable pour Influenceur, mais à vérifier si édition accessible.

---

### PROBLÈME 5: Backend routes fleurs ne vérifient pas les permissions de section
**Sévérité**: HAUTE  
**Fichier**: `server-new/routes/flowers.js` (ou équivalent)  
**Issue**: À vérifier si les routes POST/PUT vérifient que l'utilisateur a accès à chaque section

**Cahier des charges exige**:
- Amateur: Pas de `genetics`, pas de `pipelineCulture`, pas de `pipelineCuring`
- Producteur: Accès à toutes les sections
- Influenceur: Pas de `pipelineCulture`, mais accès à `genetics` sans PhenoHunt

**Solution à implémenter**:
```javascript
// Valider les permissions avant de sauvegarder
const validateReviewPermissions = (req, res, next) => {
    const { accountType } = req.user;
    const { formData } = req.body;
    
    const forbiddenFields = {
        'amateur': ['genetics', 'pipelineCulture', 'pipelineCuring'],
        'influenceur': ['pipelineCulture']
        // Producteur: aucune restriction
    };
    
    const notAllowed = forbiddenFields[accountType] || [];
    for (const field of notAllowed) {
        if (formData[field]) {
            return res.status(403).json({ 
                error: `Field ${field} not allowed for ${accountType}` 
            });
        }
    }
    next();
};
```

---

### PROBLÈME 6: Aucun vérification de droits lors du chargement d'une review
**Sévérité**: MOYENNE  
**Fichier**: `server-new/routes/reviews.js` (GET by ID)  
**Issue**: À vérifier si un utilisateur Amateur peut voir les données génétiques d'une autre review

**Cahier des charges exige**:
- En galerie publique: Afficher seulement ce qui est autorisé au viewer's account type
- Amateur voyant une review Producteur: Masquer sections génétiques et pipelines

**Note**: C'est un problème d'export/display, pas seulement d'API

---

## 📊 MATRICE DE CONFORMITÉ

### CRÉATION REVIEWS

| Section | Amateur | Producteur | Influenceur | Statut |
|---------|---------|------------|-------------|--------|
| 1. Infos Générales | ✅ | ✅ | ✅ | ✅ OK |
| 2. Génétiques | ❌ | ✅ | ✅ | 🔴 NON masquée pour Amateur |
| 2a. PhenoHunt | ❌ | ✅ | ❌ | 🔴 Pas de guard |
| 3. Pipeline Culture | ❌ | ✅ | ❌ | ❌ À vérifier |
| 4. Analytiques | ✅ | ✅ | ✅ | ✅ OK |
| 5-9. Évaluations | ✅ | ✅ | ✅ | ✅ OK |
| 10. Pipeline Curing | ❌ | ✅ | ✅ | ❌ À vérifier |

### EXPORT

| Format | Amateur | Producteur | Influenceur | Statut |
|--------|---------|------------|-------------|--------|
| PNG/PDF | ✅ | ✅ | ✅ | À vérifier |
| JSON/CSV/HTML | ❌ | ✅ | ❌ | À vérifier |
| Templates | Compact | Tous | Influenceur | À vérifier |

### PERMISSIONS API

| Endpoint | Auth? | AccountType? | Statut |
|----------|-------|--------------|--------|
| /api/genetics/* | ✅ | ❌ | 🔴 À corriger |
| /api/flowers POST/PUT | À vérifier | À vérifier | 🔴 À vérifier |
| /api/exports | À vérifier | À vérifier | 🔴 À vérifier |

---

## ⚙️ PLAN D'ACTIONS PRIORITAIRES

### SPRINT 1: PERMISSIONS CORE (Haute Priorité)

1. **Ajouter middleware `requireProducteur` à genetics.js**
   - Bloquer Amateur et Influenceur
   - Retourner 403 avec message clair
   - Estimation: 30 min

2. **Masquer section Génétiques pour Amateur dans CreateFlowerReview**
   - Vérifier accountType au chargement
   - Conditionnel rendering
   - Estimation: 45 min

3. **Adapter section Génétiques pour Influenceur (sans PhenoHunt)**
   - Passer paramètre `allowPhenoHunt`
   - Masquer canvas PhenoHunt
   - Estimation: 30 min

4. **Tester permissions API genetics**
   - Curl test avec différents accountType
   - Vérifier 403 pour non-producteur
   - Estimation: 30 min

### SPRINT 2: BACKEND PERMISSIONS (Haute Priorité)

5. **Vérifier/implémenter validation des permissions sur POST/PUT flowers**
   - Valider sections autorisées
   - Rejeter avec 403 si nécessaire
   - Estimation: 1h

6. **Vérifier GET reviews ne expose pas données interdites**
   - Filtrer fields en base de données
   - Retourner null pour champs non-autorisés
   - Estimation: 1h 30 min

7. **Documenter les règles de filtrage**
   - Créer matrice pour chaque section par accountType
   - Estimation: 30 min

### SPRINT 3: PIPELINES (Moyenne Priorité)

8. **Vérifier Pipeline Culture n'est pas accessible pour Amateur/Influenceur**
   - Lire cahier des charges Section 3
   - Masquer dans UI
   - Vérifier API validation
   - Estimation: 1h

9. **Vérifier Pipeline Curing accessible pour tous sauf Amateur**
   - Lire cahier des charges Section 10
   - Masquer pour Amateur
   - Vérifier API validation
   - Estimation: 45 min

### SPRINT 4: TESTING & DEPLOYMENT

10. **Tests end-to-end création reviews par account type**
    - Amateur: Sections 1, 4-9 seulement
    - Producteur: Toutes sections
    - Influenceur: 1, 2 (sans PhenoHunt), 4-10
    - Estimation: 2h

11. **Commit et deploy**
    - Message: "refactor: Add V1 MVP account-type permission guards"
    - Estimation: 30 min

---

## 📋 CHECKLIST FINAL AVANT DÉPLOIEMENT

- [ ] Middleware `requireProducteur` implémenté
- [ ] Section Génétiques masquée pour Amateur
- [ ] PhenoHunt masqué pour Influenceur
- [ ] Routes API genetics rejettent non-producteurs
- [ ] POST/PUT flowers valident permissions
- [ ] GET flowers/reviews ne retournent données autorisées
- [ ] Tests end-to-end passent
- [ ] Pas de console.error dans browser
- [ ] Nginx dist synchronisé
- [ ] Cache-Control headers en place
- [ ] Deployé en production
- [ ] Vérifié live sur https://51.75.22.192:4200

---

## 📌 NOTES

1. **Amateur account type**: Selon cahier des charges, "Gratuit" = pas accès Génétiques ni Pipelines
2. **Influenceur nuance**: Peut accéder à Génétiques (section 2) MAIS pas au canvas PhenoHunt
3. **API gateway**: Toutes les routes API genetiques doivent être protégées au niveau authentification + autorisation
4. **Export filtering**: Important que en galerie publique, les données interdites ne s'affichent pas selon type de viewer

---

**Audit réalisé par**: GitHub Copilot  
**Date**: 16 janvier 2026  
**Status**: 🔴 NON CONFORME - Corrections requises avant V1 MVP  
**Effort estimé**: 8-10 heures  
**Impact**: CRITIQUE - Compliance avec cahier des charges
