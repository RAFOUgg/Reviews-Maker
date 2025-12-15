# 🎯 PLAN D'ACTION CONFORMITÉ CDC - Reviews-Maker

**Date**: 15 Décembre 2024  
**Validations Utilisateur**: ✅ Confirmées  
**Estimation Totale**: 7-10 jours de développement

---

## ✅ VALIDATIONS CONFIRMÉES

### 1. Types de Comptes
- ✅ **UN SEUL** type "Influenceur" à 15.99€/mois
- ✅ Supprimer `influencer_basic` et `influencer_pro`
- ✅ Garder: `consumer` (gratuit), `influencer` (15.99€), `producer` (29.99€)

### 2. Filigrane Terpologie
- ✅ Visible sur **Exports ET Aperçus** pour Amateurs
- ✅ Position: Bas à droite
- ✅ Opacité: 30%
- ✅ Texte: "Terpologie"

### 3. Limites Amateur
- ✅ Max 20 reviews bibliothèque privée
- ✅ Max 5 reviews galerie publique
- ✅ Max 3 exports par jour

### 4. Composants à Refondre (Priorité)
1. 🔴 AccountChoicePage
2. 🔴 HomePage
3. 🔴 Pop-up RDR
4. 🟡 ExportMaker
5. 🟡 ReviewForm
6. 🟡 Profils & Paramètres
7. 🟢 Statistiques
8. 🟢 Bibliothèque

---

## 📊 SPÉCIFICATIONS PAR TYPE DE COMPTE

### 🆓 AMATEUR (Gratuit)

#### Limitations Visuelles
- **Filigrane Terpologie**:
  - Position: `bottom: 20px; right: 20px;`
  - Opacité: `0.3`
  - Taille: `font-size: 14px;`
  - Couleur: `#8B5CF6` (violet)
  - Présent sur: Exports (PNG/JPEG/PDF) + Aperçus (modal ExportMaker)

#### Limites Bibliothèque
```javascript
EXPORT_LIMITS.consumer = {
  daily: 3,              // 3 exports par jour
  reviews: 20,           // 20 reviews privées max
  publicReviews: 5,      // 5 reviews publiques max
  templates: 3,          // Templates prédéfinis uniquement
  watermarks: 0,         // Pas de filigrane perso
  savedData: 10          // 10 presets données max
}
```

#### Sections Accessibles
```javascript
sections: {
  infosGenerales: true,
  visuelTechnique: true,
  pipelineCuring: true,
  odeurs: true,
  texture: true,
  gouts: true,
  effets: true,
  // BLOQUÉ
  pipelineCulture: false,
  pipelineSeparation: false,
  pipelineExtraction: false,
  genetiques: false
}
```

#### Export & Aperçus
```javascript
export: {
  formats: ['png', 'jpeg', 'pdf'],
  quality: 150,          // dpi
  templates: ['compact', 'detailed', 'complete'],
  customTemplates: false,
  dragDrop: false,
  watermark: 'terpologie' // FORCÉ
}
```

---

### 💎 INFLUENCEUR (15.99€/mois)

#### Avantages vs Amateur
- ✅ **PAS de filigrane Terpologie**
- ✅ **Filigrane personnel** (logo/texte custom)
- ✅ **Export GIF** pour PipeLines
- ✅ **Drag & Drop** configuration avancée
- ✅ **300dpi** haute qualité

#### Limites
```javascript
EXPORT_LIMITS.influencer = {
  daily: 50,             // 50 exports par jour
  reviews: -1,           // Illimité
  publicReviews: -1,     // Illimité
  templates: 20,         // 20 templates custom max
  watermarks: 10,        // 10 filigranes perso
  savedData: 100         // 100 presets données
}
```

#### Sections Accessibles
```javascript
sections: {
  // Tout Amateur +
  infosGenerales: true,
  visuelTechnique: true,
  pipelineCuring: true,
  odeurs: true,
  texture: true,
  gouts: true,
  effets: true,
  // BLOQUÉ (réservé Producteur)
  pipelineCulture: false,
  pipelineSeparation: false,
  pipelineExtraction: false,
  genetiques: false
}
```

#### Export & Aperçus
```javascript
export: {
  formats: ['png', 'jpeg', 'svg', 'pdf', 'gif'],
  quality: 300,          // dpi
  templates: [
    'compact', 'detailed', 'complete',
    'socialMedia', 'influencer'
  ],
  customTemplates: true,  // Drag & drop zones
  dragDrop: true,
  watermark: 'custom'     // Filigrane perso
}
```

---

### 🏢 PRODUCTEUR (29.99€/mois)

#### Avantages vs Influenceur
- ✅ **PipeLines Culture/Extraction/Séparation**
- ✅ **Système Génétique** (canva arbres généalogiques)
- ✅ **Export CSV/JSON/HTML**
- ✅ **Templates 100% personnalisés**
- ✅ **Branding entreprise** (logo, SIRET)
- ✅ **Polices personnalisées**

#### Limites
```javascript
EXPORT_LIMITS.producer = {
  daily: -1,             // Illimité
  reviews: -1,           // Illimité
  publicReviews: -1,     // Illimité
  templates: -1,         // Illimité
  watermarks: -1,        // Illimité
  savedData: -1,         // Illimité
  cultivars: -1,         // Bibliothèque génétique
  phenoProjects: -1      // Projets PhenoHunt
}
```

#### Sections Accessibles
```javascript
sections: {
  // TOUT accessible
  infosGenerales: true,
  visuelTechnique: true,
  pipelineCuring: true,
  odeurs: true,
  texture: true,
  gouts: true,
  effets: true,
  pipelineCulture: true,      // ✅
  pipelineSeparation: true,   // ✅
  pipelineExtraction: true,   // ✅
  genetiques: true            // ✅
}
```

#### Export & Aperçus
```javascript
export: {
  formats: ['png', 'jpeg', 'svg', 'pdf', 'gif', 'csv', 'json', 'html'],
  quality: 300,          // dpi
  templates: [
    'compact', 'detailed', 'complete',
    'socialMedia', 'influencer', 'professional',
    'custom'             // 100% personnalisé
  ],
  customTemplates: true,
  dragDrop: true,
  watermark: 'custom',
  branding: true,        // Logo entreprise
  customFonts: true      // Google Fonts
}
```

---

## 🔴 PHASE 1 - CORRECTIFS CRITIQUES (2-3 jours)

### Todo #1: Unifier Type Influenceur
**Priorité**: 🔴 HAUTE  
**Estimation**: 4 heures

**Fichiers à Modifier**:
1. `server-new/services/account.js`
   ```javascript
   // SUPPRIMER
   INFLUENCER_BASIC: 'influencer_basic',
   INFLUENCER_PRO: 'influencer_pro',
   
   // REMPLACER PAR
   INFLUENCER: 'influencer',  // 15.99€/mois
   ```

2. `server-new/middleware/permissions.js`
   ```javascript
   // Fusionner EXPORT_LIMITS
   [ACCOUNT_TYPES.INFLUENCER]: {
     daily: 50,
     templates: 20,
     watermarks: 10,
     reviews: -1,
     savedData: 100
   }
   ```

3. `client/src/hooks/useAccountType.js`
   ```javascript
   const isInfluencer = accountType === 'influencer';
   const isPremium = isProducer || isInfluencer;
   ```

4. `server-new/routes/account.js`
   ```javascript
   {
     type: ACCOUNT_TYPES.INFLUENCER,
     name: 'Influenceur',
     price: 15.99,
     features: [/* ... */]
   }
   ```

**Tests**:
- [ ] Inscription Influenceur fonctionne
- [ ] Prix affiché: 15.99€
- [ ] Permissions correctes appliquées

---

### Todo #2: Filigrane Terpologie Amateurs
**Priorité**: 🔴 HAUTE  
**Estimation**: 6 heures

**Fichier Principal**: `client/src/components/export/ExportMaker.jsx`

**Implémentation**:
```jsx
// Dans ExportMaker.jsx, ajouter composant TerpologieWatermark

const TerpologieWatermark = ({ visible }) => {
  if (!visible) return null;
  
  return (
    <div 
      className="absolute bottom-5 right-5 z-50"
      style={{
        opacity: 0.3,
        fontSize: '14px',
        fontWeight: 600,
        color: '#8B5CF6',
        textShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      Terpologie
    </div>
  );
};

// Dans le render du preview
<div ref={exportRef} className="relative">
  {/* Contenu review */}
  
  {/* Filigrane Terpologie pour Amateurs */}
  {accountType === 'consumer' && (
    <TerpologieWatermark visible={true} />
  )}
</div>
```

**Export PNG/JPEG/PDF**:
```javascript
const handleExport = async (exportFormat) => {
  // Forcer le filigrane visible avant capture
  const shouldShowWatermark = accountType === 'consumer';
  
  if (shouldShowWatermark) {
    // Le filigrane est déjà visible dans le DOM
  }
  
  const canvas = await html2canvas(exportRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
  });
  
  // ... rest of export
};
```

**Tests**:
- [ ] Filigrane visible sur aperçu modal (Amateur)
- [ ] Filigrane présent dans export PNG (Amateur)
- [ ] Filigrane présent dans export JPEG (Amateur)
- [ ] Filigrane présent dans export PDF (Amateur)
- [ ] PAS de filigrane pour Influenceur
- [ ] PAS de filigrane pour Producteur

---

### Todo #3: Limites Bibliothèque
**Priorité**: 🔴 HAUTE  
**Estimation**: 4 heures

**Fichier**: `server-new/middleware/permissions.js`

```javascript
export const EXPORT_LIMITS = {
  [ACCOUNT_TYPES.CONSUMER]: {
    daily: 3,              // ✅ 3 exports/jour
    reviews: 20,           // ✅ 20 reviews privées max
    publicReviews: 5,      // ✅ 5 reviews publiques max
    templates: 3,
    watermarks: 0,
    savedData: 10
  },
  // ...
};
```

**Route Reviews**: `server-new/routes/reviews.js`

```javascript
router.post('/create', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const accountType = getUserAccountType(req.user);
  
  // Vérifier limite reviews privées
  if (req.body.visibility === 'private') {
    const privateCount = await prisma.review.count({
      where: { authorId: userId, visibility: 'private' }
    });
    
    const limit = EXPORT_LIMITS[accountType]?.reviews || 20;
    if (limit !== -1 && privateCount >= limit) {
      return res.status(403).json({
        error: 'Limite atteinte',
        message: `Vous avez atteint la limite de ${limit} reviews privées.`,
        upgradeRequired: true
      });
    }
  }
  
  // Vérifier limite reviews publiques
  if (req.body.visibility === 'public') {
    const publicCount = await prisma.review.count({
      where: { authorId: userId, visibility: 'public' }
    });
    
    const limit = EXPORT_LIMITS[accountType]?.publicReviews || 5;
    if (limit !== -1 && publicCount >= limit) {
      return res.status(403).json({
        error: 'Limite atteinte',
        message: `Vous avez atteint la limite de ${limit} reviews publiques.`,
        upgradeRequired: true
      });
    }
  }
  
  // Créer la review...
});
```

**Frontend**: Afficher compteur dans LibraryPage

```jsx
const LibraryHeader = ({ user, reviewCounts }) => {
  const { accountType } = useAccountType();
  const limits = EXPORT_LIMITS[accountType];
  
  return (
    <div className="flex justify-between items-center mb-6">
      <h1>Ma Bibliothèque</h1>
      
      {limits.reviews !== -1 && (
        <div className="text-sm">
          <span className={reviewCounts.private >= limits.reviews ? 'text-red-400' : 'text-gray-400'}>
            Privées: {reviewCounts.private}/{limits.reviews}
          </span>
        </div>
      )}
      
      {limits.publicReviews !== -1 && (
        <div className="text-sm">
          <span className={reviewCounts.public >= limits.publicReviews ? 'text-red-400' : 'text-gray-400'}>
            Publiques: {reviewCounts.public}/{limits.publicReviews}
          </span>
        </div>
      )}
    </div>
  );
};
```

**Tests**:
- [ ] Amateur: 21ème review privée bloquée
- [ ] Amateur: 6ème review publique bloquée
- [ ] Amateur: 4ème export/jour bloqué (reset à minuit)
- [ ] Influenceur: Illimité
- [ ] Producteur: Illimité

---

### Todo #4: Restrictions Sections par Compte
**Priorité**: 🔴 HAUTE  
**Estimation**: 6 heures

**Fichier**: `client/src/hooks/useAccountType.js`

```javascript
const permissions = useMemo(() => ({
  sections: {
    // Accessible à TOUS
    infosGenerales: true,
    visuelTechnique: true,
    pipelineCuring: true,
    odeurs: true,
    texture: true,
    gouts: true,
    effets: true,
    
    // PRODUCTEUR UNIQUEMENT
    pipelineCulture: isProducer,
    pipelineSeparation: isProducer,
    pipelineExtraction: isProducer,
    genetiques: isProducer,
  },
  
  pipelines: {
    curing: true,                    // TOUS
    culture: isProducer,             // Producteur uniquement
    separation: isProducer,          // Producteur uniquement
    extraction: isProducer,          // Producteur uniquement
    recipe: true,                    // TOUS (comestibles)
  },
  
  // ... rest
}), [isProducer, isInfluencer]);
```

**ReviewForm**: Masquer sections non autorisées

```jsx
// Dans CreateReviewPage.jsx / EditReviewPage.jsx

const { canAccess, getUpgradeMessage } = useAccountType();

// Section Pipeline Culture
{canAccess('sections.pipelineCulture') ? (
  <PipelineCultureSection {...props} />
) : (
  <FeatureGate
    hasAccess={false}
    upgradeType="producer"
    featureName="le Pipeline de Culture"
  >
    <PipelineCultureSection {...props} />
  </FeatureGate>
)}
```

**Tests**:
- [ ] Amateur: PipeLines Culture/Extraction MASQUÉS
- [ ] Influenceur: PipeLines Culture/Extraction MASQUÉS
- [ ] Producteur: TOUT visible

---

## 🟡 PHASE 2 - REFONTE UX/UI (3-4 jours)

### Todo #5: AccountChoicePage
**Priorité**: 🟡 MOYENNE  
**Estimation**: 8 heures

**Design Apple-like**:
```jsx
// Nouvelles cartes épurées style Apple

const accountCards = [
  {
    id: 'consumer',
    name: 'Amateur',
    price: 'Gratuit',
    gradient: 'from-green-400 to-emerald-600',
    icon: '✨',
    features: [
      'Sections essentielles',
      'Templates prédéfinis',
      'Export PNG/JPEG/PDF',
      'Bibliothèque 20 reviews'
    ],
    limitations: [
      'Filigrane Terpologie',
      'Formats imposés',
      '3 exports/jour max'
    ]
  },
  {
    id: 'influencer',
    name: 'Influenceur',
    price: '15.99€/mois',
    gradient: 'from-purple-400 to-indigo-600',
    icon: '💎',
    popular: true,  // Badge "POPULAIRE"
    features: [
      'Sans filigrane',
      'Export GIF animations',
      'Config drag & drop',
      'Export 300dpi HD',
      'Templates avancés',
      'Logo personnalisé'
    ]
  },
  {
    id: 'producer',
    name: 'Producteur',
    price: '29.99€/mois',
    gradient: 'from-amber-400 to-orange-600',
    icon: '👨‍🌾',
    features: [
      'PipeLines Culture/Extraction',
      'Système Génétique',
      'Export CSV/JSON/HTML',
      'Templates 100% custom',
      'Branding entreprise',
      'Polices personnalisées'
    ]
  }
];
```

**Modal Détails**:
```jsx
const AccountDetailModal = ({ account, onClose, onContinue }) => {
  return (
    <LiquidGlass variant="modal">
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{account.icon}</div>
          <h2 className="text-3xl font-bold">{account.name}</h2>
          <p className="text-2xl text-purple-400 mt-2">{account.price}</p>
        </div>
        
        {/* Features complètes */}
        <div className="space-y-4 mb-8">
          <h3 className="font-bold text-xl">Fonctionnalités incluses</h3>
          {account.features.map(feature => (
            <div key={feature} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Obligations légales */}
        {(account.id === 'influencer' || account.id === 'producer') && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
            <h4 className="font-bold mb-2">⚠️ Vérification requise</h4>
            <p className="text-sm text-gray-300">
              {account.id === 'producer' 
                ? 'Compte Producteur : Justificatifs légaux (SIRET/SIREN) et pièce d\'identité requis.'
                : 'Compte Influenceur : Vérification d\'âge par pièce d\'identité requise.'}
            </p>
          </div>
        )}
        
        {/* Boutons */}
        <div className="flex gap-4">
          <LiquidButton variant="secondary" onClick={onClose} className="flex-1">
            Retour
          </LiquidButton>
          <LiquidButton onClick={onContinue} className="flex-1">
            {account.price === 'Gratuit' ? 'Passer à l\'inscription' : 'Passer au paiement'}
          </LiquidButton>
        </div>
      </div>
    </LiquidGlass>
  );
};
```

**Tests**:
- [ ] 3 cartes visibles et épurées
- [ ] Modal s'ouvre au clic
- [ ] Features complètes affichées
- [ ] Obligations KYC visibles
- [ ] Bouton redirection OK

---

### Todo #6: HomePage
**Priorité**: 🟡 MOYENNE  
**Estimation**: 6 heures

**Nouvelles Sections**:

```jsx
// Section "Mes Reviews Récentes"
const MyRecentReviews = ({ userId }) => {
  const [recentReviews, setRecentReviews] = useState([]);
  
  useEffect(() => {
    fetch(`/api/reviews?authorId=${userId}&limit=6&sort=createdAt:desc`)
      .then(res => res.json())
      .then(data => setRecentReviews(data.reviews));
  }, [userId]);
  
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          📝 Mes Reviews Récentes
        </h2>
        <Link to="/library" className="text-purple-400 hover:text-purple-300">
          Voir toutes →
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentReviews.map(review => (
          <HomeReviewCard key={review.id} review={review} compact />
        ))}
      </div>
    </section>
  );
};

// Section "Statistiques Rapides"
const QuickStats = ({ userId }) => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    fetch(`/api/stats/quick/${userId}`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, [userId]);
  
  if (!stats) return <LoadingSpinner />;
  
  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      <LiquidGlass className="p-6 text-center">
        <div className="text-4xl font-bold text-purple-400">
          {stats.totalReviews}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Reviews créées
        </div>
      </LiquidGlass>
      
      <LiquidGlass className="p-6 text-center">
        <div className="text-4xl font-bold text-green-400">
          {stats.totalExports}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Exports réalisés
        </div>
      </LiquidGlass>
      
      <LiquidGlass className="p-6 text-center">
        <div className="text-4xl">{stats.favoriteProductType.icon}</div>
        <div className="text-sm text-gray-400 mt-2">
          Type favori: {stats.favoriteProductType.name}
        </div>
      </LiquidGlass>
      
      <LiquidGlass className="p-6 text-center">
        <div className="text-4xl font-bold text-yellow-400">
          {stats.totalLikes}
        </div>
        <div className="text-sm text-gray-400 mt-2">
          Likes reçus
        </div>
      </LiquidGlass>
    </section>
  );
};
```

**Tests**:
- [ ] Reviews récentes s'affichent (6 max)
- [ ] Stats rapides chargent
- [ ] Liens navigation OK

---

### Todo #7: Pop-up RDR Récurrent
**Priorité**: 🟡 MOYENNE  
**Estimation**: 4 heures

**Fichier**: `client/src/components/legal/DisclaimerRDRModal.jsx`

```jsx
import React, { useEffect, useState } from 'react';
import { LiquidGlass } from '../ui';
import { AlertTriangle, X } from 'lucide-react';

const DisclaimerRDRModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Vérifier dernière acceptation
    const lastAccepted = localStorage.getItem('rdr_last_accepted');
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    
    if (!lastAccepted || (now - parseInt(lastAccepted)) > oneDayMs) {
      // Afficher après 2 secondes
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);
  
  const handleAccept = () => {
    localStorage.setItem('rdr_last_accepted', Date.now().toString());
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <LiquidGlass variant="modal" className="max-w-2xl w-full p-8 relative">
        <button
          onClick={handleAccept}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Rappel RDR
          </h2>
          <p className="text-gray-400">
            Responsibility, Disclosure, Regulation
          </p>
        </div>
        
        <div className="space-y-4 text-gray-300 text-sm mb-8">
          <p>
            <strong className="text-white">Conformité légale:</strong> Terpologie est une plateforme de traçabilité 
            pour produits cannabiniques légaux. L'accès et l'utilisation sont soumis aux lois locales.
          </p>
          
          <p>
            <strong className="text-white">Âge légal:</strong> Vous devez avoir 18 ans minimum 
            (ou 21 ans selon votre juridiction) pour utiliser cette plateforme.
          </p>
          
          <p>
            <strong className="text-white">Responsabilité:</strong> Les informations partagées sont fournies 
            par les utilisateurs. Terpologie ne garantit pas l'exactitude des données.
          </p>
          
          <p>
            <strong className="text-white">Usage:</strong> Les produits cannabiniques peuvent avoir des effets 
            sur la santé. Consultez un professionnel avant utilisation, surtout si vous êtes enceinte, 
            allaitez, ou prenez des médicaments.
          </p>
        </div>
        
        <button
          onClick={handleAccept}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-bold hover:brightness-110 transition-all"
        >
          J'ai compris et j'accepte
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Ce message s'affiche tous les jours pour rappeler les conditions d'utilisation.
        </p>
      </LiquidGlass>
    </div>
  );
};

export default DisclaimerRDRModal;
```

**Intégration dans App.jsx**:
```jsx
import DisclaimerRDRModal from './components/legal/DisclaimerRDRModal';

function App() {
  return (
    <Router>
      <DisclaimerRDRModal />
      {/* ... rest of app */}
    </Router>
  );
}
```

**Tests**:
- [ ] Modal s'affiche 2s après visite
- [ ] Pas d'affichage si accepté < 24h
- [ ] Bouton fermer fonctionne
- [ ] localStorage persiste

---

## 🟢 PHASE 3 - FINITIONS (2-3 jours)

### Todo #8-15: Autres Refont Composants

*(Détails complets dans les todos suivants)*

---

## 📈 MÉTRIQUES DE SUIVI

### Conformité CDC
- **Phase 1**: 0% → 85% (corrections critiques)
- **Phase 2**: 85% → 95% (UX/UI)
- **Phase 3**: 95% → 100% (finitions)

### Tests de Validation
```markdown
## Checklist Finale

### Types de Comptes
- [ ] UN SEUL type influencer existe
- [ ] Prix affichés: 0€, 15.99€, 29.99€
- [ ] Permissions correctement appliquées

### Filigrane Terpologie
- [ ] Visible exports Amateur
- [ ] Visible aperçus Amateur
- [ ] Absent Influenceur/Producteur
- [ ] Position/opacité correcte

### Limites Amateur
- [ ] 20 reviews privées max
- [ ] 5 reviews publiques max
- [ ] 3 exports/jour max
- [ ] Messages d'erreur clairs

### Sections par Compte
- [ ] Amateur: sections de base
- [ ] Influenceur: sections de base
- [ ] Producteur: toutes sections

### Design UX/UI
- [ ] AccountChoicePage épurée
- [ ] HomePage avec sections
- [ ] Pop-up RDR récurrent
- [ ] ExportMaker simplifié
- [ ] Tooltips partout
```

---

## 🚀 PROCHAINE ÉTAPE

Je vais commencer par **Phase 1.1 - Unifier Type Influenceur**.

Souhaitez-vous que je commence maintenant ou avez-vous des ajustements à apporter au plan ?
