# Refonte Système de Comptes & Restrictions — 12 décembre 2025

## Vue d'ensemble

Simplification du système de comptes de 6 vers 3 types principaux selon cahier des charges enrichi :

| Type Actuel | Nouveau Type | Prix | Migration |
|------------|--------------|------|-----------|
| Consumer | **Amateur** | Gratuit | Automatique |
| Beta Tester | Beta Tester | Gratuit | Conservé (temporaire) |
| Influencer Basic | **Influencer** | 15.99€/mois | Conservé |
| Influencer Pro | **Influencer** | 15.99€/mois | Downgrade tarifaire |
| Producer | **Producer** | 29.99€/mois | Conservé |
| Merchant | Producer | 29.99€/mois | Automatique |

---

## Matrice des Fonctionnalités

### 1. Sections Accessibles (Création Review)

| Section | Amateur | Influencer | Producer |
|---------|---------|------------|----------|
| Information générale | ✅ | ✅ | ✅ |
| Visuel & Technique | ✅ | ✅ | ✅ |
| Pipeline Curing/Maturation | ✅ | ✅ | ✅ |
| Odeurs | ✅ | ✅ | ✅ |
| Goûts | ✅ | ✅ | ✅ |
| Effets ressentis | ✅ | ✅ | ✅ |
| Pipeline Culture (phases configurables) | ❌ | ❌ | ✅ |
| Pipeline Extraction | ❌ | ❌ | ✅ |
| Génétique (Canva arbre) | ❌ | ❌ | ✅ |

### 2. Templates Export

| Template | Amateur | Influencer | Producer |
|----------|---------|------------|----------|
| Compact (prédéfini) | ✅ | ✅ | ✅ |
| Détaillé (prédéfini) | ✅ | ✅ | ✅ |
| Complet (prédéfini) | ✅ | ✅ | ✅ |
| Personnalisé (drag & drop) | ❌ | ❌ | ✅ |

**Restrictions Amateur :**
- Format imposé par template (pas de personnalisation dimensions)
- Templates système uniquement
- Pas d'accès mode drag & drop

**Ouvertures Influencer :**
- Accès drag & drop pour arrangement zones
- Personnalisation avancée layout
- Templates sauvegardables

**Accès complet Producer :**
- Mode contenus personnalisable
- Drag & drop total
- Création templates from scratch

### 3. Formats & Qualité Export

| Format | Amateur | Influencer | Producer |
|--------|---------|------------|----------|
| PNG (150dpi) | ✅ | ❌ | ❌ |
| JPEG (150dpi) | ✅ | ❌ | ❌ |
| PDF (150dpi) | ✅ | ❌ | ❌ |
| PNG (300dpi) | ❌ | ✅ | ✅ |
| JPEG (300dpi) | ❌ | ✅ | ✅ |
| PDF (300dpi) | ❌ | ✅ | ✅ |
| SVG | ❌ | ✅ | ✅ |
| CSV | ❌ | ❌ | ✅ |
| JSON | ❌ | ❌ | ✅ |
| HTML | ❌ | ❌ | ✅ |
| GIF (Pipeline timeline) | ❌ | ❌ | ✅ |

**Limites :**
- Amateur : max 3 exports/jour
- Influencer : 50 exports/jour
- Producer : illimité

### 4. Personnalisation Export

| Fonctionnalité | Amateur | Influencer | Producer |
|----------------|---------|------------|----------|
| Thème clair/sombre | ✅ | ✅ | ✅ |
| Choix couleurs (palette) | ✅ | ✅ | ✅ |
| Configuration typo (tailles) | ✅ | ✅ | ✅ |
| Configuration image (ratio, filters) | ✅ | ✅ | ✅ |
| Polices personnalisées (upload TTF/OTF) | ❌ | ❌ | ✅ |
| Filigrane personnalisé | ❌ | ✅ | ✅ |
| Filigrane système (obligatoire) | ✅ (forcé) | ❌ | ❌ |
| Agencement complet modules | ❌ | ✅ | ✅ |
| Branding (logo entreprise) | ❌ | ❌ | ✅ |

### 5. Bibliothèque Personnelle

| Élément | Amateur | Influencer | Producer |
|---------|---------|------------|----------|
| Sauvegarde templates | 3 max | 20 max | Illimité |
| Filigranes | 1 max | 5 max | Illimité |
| Reviews privées | 10 max | 100 max | Illimité |
| Cultivars (bibliothèque) | ❌ | ❌ | Illimité |
| Projets PhenoHunt | ❌ | ❌ | Illimité |
| Saved Data (substrats, engrais) | 10 max | 50 max | Illimité |

### 6. Galerie Publique

| Fonctionnalité | Amateur | Influencer | Producer |
|----------------|---------|------------|----------|
| Publication reviews publiques | ✅ | ✅ | ✅ |
| Likes | ✅ | ✅ | ✅ |
| Commentaires | ✅ | ✅ | ✅ |
| Badge "Vérifié" | ❌ | ✅ | ✅ |
| Badge "Producteur Certifié" | ❌ | ❌ | ✅ |
| Analytics vues | ❌ | ✅ | ✅ |
| Partage réseaux sociaux (API) | ❌ | ✅ | ✅ |

### 7. Statistiques

| Donnée | Amateur | Influencer | Producer |
|--------|---------|------------|----------|
| Total reviews | ✅ | ✅ | ✅ |
| Reviews par type | ❌ | ✅ | ✅ |
| Engagement (likes/vues) | ❌ | ✅ | ✅ |
| Top cultivars | ❌ | ❌ | ✅ |
| Rendements cultures | ❌ | ❌ | ✅ |
| Exports par format | ❌ | ✅ | ✅ |
| Graphiques évolution | ❌ | ✅ | ✅ |

---

## Implémentation Technique

### Modèle Prisma User (simplification)

**Champ `roles` actuel :**
```json
{"roles": ["consumer"]}
{"roles": ["influencer_basic"]}
{"roles": ["influencer_pro"]}
{"roles": ["producer"]}
{"roles": ["beta_tester"]}
```

**Nouveaux rôles (post-migration) :**
```json
{"roles": ["amateur"]}          // Consumer
{"roles": ["influencer"]}       // Influencer Basic/Pro fusionnés
{"roles": ["producer"]}         // Producer + Merchant
{"roles": ["beta_tester"]}      // Conservé temporairement
```

**Nouveaux champs Prisma à ajouter (optionnel) :**
```prisma
model User {
  // ... champs existants
  
  // Abonnement (pour Influencer/Producer)
  subscriptionType    String?   @default(null)  // "influencer", "producer"
  subscriptionStart   DateTime?
  subscriptionEnd     DateTime?
  subscriptionStatus  String?   @default("inactive")  // "active", "cancelled", "expired"
  
  // Limites quotidiennes
  dailyExportsUsed    Int       @default(0)
  dailyExportsReset   DateTime  @default(now())
}
```

### Service account.js — Nouvelles constantes

```javascript
export const ACCOUNT_TYPES = {
    BETA_TESTER: 'beta_tester',    // Temporaire (accès complet)
    AMATEUR: 'amateur',            // Gratuit (restrictions)
    INFLUENCER: 'influencer',      // 15.99€/mois
    PRODUCER: 'producer',          // 29.99€/mois
};

export const EXPORT_LIMITS = {
    AMATEUR: { daily: 3, templates: 3, watermarks: 1, reviews: 10 },
    INFLUENCER: { daily: 50, templates: 20, watermarks: 5, reviews: 100 },
    PRODUCER: { daily: -1, templates: -1, watermarks: -1, reviews: -1 },  // -1 = illimité
};

export const EXPORT_FORMATS = {
    AMATEUR: ['png', 'jpeg', 'pdf'],  // 150dpi
    INFLUENCER: ['png', 'jpeg', 'pdf', 'svg'],  // 300dpi
    PRODUCER: ['png', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html', 'gif'],  // 300dpi
};

export const EXPORT_DPI = {
    AMATEUR: 150,
    INFLUENCER: 300,
    PRODUCER: 300,
};
```

### Middleware permissions.js (nouveau)

```javascript
/**
 * Vérifie si utilisateur peut accéder à une fonctionnalité
 * @param {Object} user - User Prisma
 * @param {string} feature - Nom de la feature
 * @param {Object} options - Options supplémentaires
 * @returns {Object} { allowed: boolean, reason?: string, limit?: number }
 */
export function canAccessFeature(user, feature, options = {}) {
    const accountType = getUserAccountType(user);
    
    switch(feature) {
        case 'template_custom':
            return accountType === ACCOUNT_TYPES.PRODUCER 
                ? { allowed: true }
                : { allowed: false, reason: 'Réservé aux Producteurs' };
        
        case 'export_high_quality':
            return [ACCOUNT_TYPES.INFLUENCER, ACCOUNT_TYPES.PRODUCER].includes(accountType)
                ? { allowed: true }
                : { allowed: false, reason: 'Abonnement Influencer ou Producer requis' };
        
        case 'export_format':
            const allowedFormats = EXPORT_FORMATS[accountType] || EXPORT_FORMATS.AMATEUR;
            const requestedFormat = options.format;
            
            if (!allowedFormats.includes(requestedFormat)) {
                return { 
                    allowed: false, 
                    reason: `Format ${requestedFormat} non disponible pour ${accountType}`,
                    allowedFormats 
                };
            }
            return { allowed: true, allowedFormats };
        
        case 'pipeline_culture':
        case 'genetics_canvas':
            return accountType === ACCOUNT_TYPES.PRODUCER
                ? { allowed: true }
                : { allowed: false, reason: 'Réservé aux Producteurs' };
        
        case 'library_templates':
            const limits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS.AMATEUR;
            const currentCount = options.currentCount || 0;
            
            if (limits.templates === -1) {
                return { allowed: true, limit: -1 };
            }
            
            if (currentCount >= limits.templates) {
                return { 
                    allowed: false, 
                    reason: `Limite de ${limits.templates} templates atteinte`,
                    limit: limits.templates 
                };
            }
            
            return { allowed: true, limit: limits.templates };
        
        case 'daily_exports':
            const exportLimits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS.AMATEUR;
            const todayExports = options.todayCount || 0;
            
            if (exportLimits.daily === -1) {
                return { allowed: true, limit: -1 };
            }
            
            if (todayExports >= exportLimits.daily) {
                return { 
                    allowed: false, 
                    reason: `Limite quotidienne de ${exportLimits.daily} exports atteinte`,
                    limit: exportLimits.daily 
                };
            }
            
            return { allowed: true, limit: exportLimits.daily };
        
        case 'stats_advanced':
            return [ACCOUNT_TYPES.INFLUENCER, ACCOUNT_TYPES.PRODUCER].includes(accountType)
                ? { allowed: true }
                : { allowed: false, reason: 'Statistiques avancées réservées aux abonnés' };
        
        default:
            return { allowed: false, reason: 'Feature inconnue' };
    }
}

/**
 * Middleware Express pour vérifier permissions
 */
export function requireFeature(feature, optionsGetter = null) {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'authentication_required' });
        }
        
        const options = typeof optionsGetter === 'function' 
            ? await optionsGetter(req) 
            : {};
        
        const check = canAccessFeature(req.user, feature, options);
        
        if (!check.allowed) {
            return res.status(403).json({ 
                error: 'feature_restricted',
                message: check.reason,
                accountType: getUserAccountType(req.user),
                upgradeRequired: feature.includes('_') 
                    ? feature.split('_')[0] 
                    : null
            });
        }
        
        req.featureCheck = check;
        next();
    };
}
```

---

## Migration Base de Données

### Migration SQL `004_simplify_account_types.sql`

```sql
-- Migration simplification types de comptes
-- Reviews-Maker 2025-12-12

-- Étape 1: Ajouter nouveaux champs abonnement
ALTER TABLE users ADD COLUMN subscriptionType TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscriptionStart TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscriptionEnd TEXT DEFAULT NULL;
ALTER TABLE users ADD COLUMN subscriptionStatus TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN dailyExportsUsed INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN dailyExportsReset TEXT DEFAULT CURRENT_TIMESTAMP;

-- Étape 2: Créer index pour performances
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscriptionType, subscriptionStatus);
CREATE INDEX IF NOT EXISTS idx_users_daily_exports ON users(dailyExportsReset);

-- Étape 3: Migration données (script Node.js requis pour JSON parsing)
-- Voir server-new/scripts/migrate-account-types.js

-- Étape 4: Mise à jour timestamps
UPDATE users SET updatedAt = CURRENT_TIMESTAMP WHERE subscriptionType IS NOT NULL;
```

### Script Migration Node.js `migrate-account-types.js`

```javascript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function migrateAccountTypes() {
    console.log('🔄 Migration types de comptes...\n');
    
    const users = await prisma.user.findMany();
    let migrated = { amateur: 0, influencer: 0, producer: 0, beta: 0 };
    
    for (const user of users) {
        let roles;
        try {
            roles = JSON.parse(user.roles).roles || [];
        } catch {
            roles = ['consumer'];
        }
        
        let newRoles = [];
        let subType = null;
        let subStatus = 'inactive';
        
        // Mapping ancien -> nouveau
        if (roles.includes('beta_tester')) {
            newRoles = ['beta_tester'];
            migrated.beta++;
        }
        else if (roles.includes('producer') || roles.includes('merchant')) {
            newRoles = ['producer'];
            subType = 'producer';
            subStatus = 'active';
            migrated.producer++;
        }
        else if (roles.includes('influencer_pro') || roles.includes('influencer_basic')) {
            newRoles = ['influencer'];
            subType = 'influencer';
            subStatus = 'active';
            migrated.influencer++;
        }
        else {
            newRoles = ['amateur'];
            migrated.amateur++;
        }
        
        await prisma.user.update({
            where: { id: user.id },
            data: {
                roles: JSON.stringify({ roles: newRoles }),
                subscriptionType: subType,
                subscriptionStatus: subStatus,
                subscriptionStart: subType ? new Date() : null,
            }
        });
    }
    
    console.log('✅ Migration terminée :');
    console.log(`   - Amateur: ${migrated.amateur}`);
    console.log(`   - Influencer: ${migrated.influencer}`);
    console.log(`   - Producer: ${migrated.producer}`);
    console.log(`   - Beta Tester: ${migrated.beta}`);
    console.log(`   - Total: ${users.length}\n`);
}

migrateAccountTypes()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
```

---

## Endpoints API Modifiés

### Routes à protéger avec `requireFeature`

**`/api/templates` (POST personnalisé) :**
```javascript
router.post('/', requireAuth, requireFeature('template_custom'), async (req, res) => {
    // Création template personnalisé (drag & drop)
});
```

**`/api/export` (format/qualité) :**
```javascript
router.post('/render', requireAuth, async (req, res) => {
    const { format, dpi } = req.body;
    
    // Vérifier format autorisé
    const formatCheck = canAccessFeature(req.user, 'export_format', { format });
    if (!formatCheck.allowed) {
        return res.status(403).json({ 
            error: 'format_restricted',
            message: formatCheck.reason,
            allowedFormats: formatCheck.allowedFormats
        });
    }
    
    // Vérifier limite quotidienne
    const exportCheck = canAccessFeature(req.user, 'daily_exports', { 
        todayCount: await getTodayExportsCount(req.user.id) 
    });
    if (!exportCheck.allowed) {
        return res.status(429).json({
            error: 'export_limit_reached',
            message: exportCheck.reason,
            limit: exportCheck.limit
        });
    }
    
    // Appliquer DPI selon type compte
    const accountType = getUserAccountType(req.user);
    const maxDpi = EXPORT_DPI[accountType];
    const finalDpi = Math.min(dpi || 150, maxDpi);
    
    // ... render avec finalDpi
});
```

**`/api/library/templates` (limite) :**
```javascript
router.post('/', requireAuth, async (req, res) => {
    const currentCount = await prisma.savedTemplate.count({
        where: { userId: req.user.id }
    });
    
    const check = canAccessFeature(req.user, 'library_templates', { currentCount });
    if (!check.allowed) {
        return res.status(403).json({ 
            error: 'library_limit_reached',
            message: check.reason,
            limit: check.limit,
            current: currentCount
        });
    }
    
    // ... créer template
});
```

**`/api/stats` (avancé) :**
```javascript
router.get('/engagement', requireAuth, requireFeature('stats_advanced'), async (req, res) => {
    // Statistiques engagement détaillées
});
```

---

## Frontend React — Composants Clés

### AccountTypeSelector.jsx (inscription)

```jsx
import React, { useState } from 'react';
import './AccountTypeSelector.css';

const ACCOUNT_TIERS = [
    {
        type: 'amateur',
        name: 'Amateur',
        price: 'Gratuit',
        color: '#8B5CF6',
        features: [
            'Reviews illimitées',
            'Templates prédéfinis (3)',
            'Export PNG/JPEG/PDF (150dpi)',
            '3 exports/jour',
            'Bibliothèque limitée (10 items)'
        ],
        limitations: [
            'Filigrane système obligatoire',
            'Pas de templates personnalisés',
            'Pas de statistiques avancées'
        ]
    },
    {
        type: 'influencer',
        name: 'Influencer',
        price: '15.99€/mois',
        color: '#10B981',
        recommended: true,
        features: [
            'Tout de Amateur',
            'Templates personnalisés',
            'Export haute qualité (300dpi + SVG)',
            '50 exports/jour',
            'Bibliothèque étendue (100 items)',
            'Statistiques avancées',
            'Badge vérifié',
            'Partage réseaux sociaux'
        ],
        limitations: [
            'Pas de pipelines culture',
            'Pas de génétique canvas'
        ]
    },
    {
        type: 'producer',
        name: 'Producteur',
        price: '29.99€/mois',
        color: '#F59E0B',
        features: [
            'Tout de Influencer',
            'Pipelines culture configurables',
            'Génétique canvas (arbre)',
            'Export GIF (timeline)',
            'Export CSV/JSON/HTML',
            'Exports illimités',
            'Bibliothèque illimitée',
            'Branding entreprise',
            'Badge Producteur Certifié'
        ],
        limitations: []
    }
];

export default function AccountTypeSelector({ onSelect }) {
    const [selected, setSelected] = useState('amateur');
    
    const handleSelect = (type) => {
        setSelected(type);
        onSelect(type);
    };
    
    return (
        <div className="account-type-selector">
            <h2 className="selector-title">Choisissez votre type de compte</h2>
            <p className="selector-subtitle">
                Sélectionnez l'offre qui correspond à vos besoins
            </p>
            
            <div className="tiers-grid">
                {ACCOUNT_TIERS.map(tier => (
                    <div 
                        key={tier.type}
                        className={`tier-card ${selected === tier.type ? 'selected' : ''} ${tier.recommended ? 'recommended' : ''}`}
                        onClick={() => handleSelect(tier.type)}
                        style={{ '--tier-color': tier.color }}
                    >
                        {tier.recommended && (
                            <div className="recommended-badge">Recommandé</div>
                        )}
                        
                        <div className="tier-header">
                            <h3 className="tier-name">{tier.name}</h3>
                            <div className="tier-price">{tier.price}</div>
                        </div>
                        
                        <div className="tier-features">
                            <h4>Fonctionnalités :</h4>
                            <ul>
                                {tier.features.map((feature, i) => (
                                    <li key={i}>
                                        <span className="icon">✓</span> {feature}
                                    </li>
                                ))}
                            </ul>
                            
                            {tier.limitations.length > 0 && (
                                <>
                                    <h4 className="limitations-title">Limitations :</h4>
                                    <ul className="limitations">
                                        {tier.limitations.map((limit, i) => (
                                            <li key={i}>
                                                <span className="icon">✗</span> {limit}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                        
                        <button 
                            className={`tier-button ${selected === tier.type ? 'selected' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelect(tier.type);
                            }}
                        >
                            {selected === tier.type ? 'Sélectionné' : 'Choisir'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

### AccountTypeSelector.css (Liquid Glass)

```css
.account-type-selector {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
}

.selector-title {
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 10px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.selector-subtitle {
    text-align: center;
    color: #6b7280;
    margin-bottom: 40px;
}

.tiers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
}

.tier-card {
    position: relative;
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    padding: 30px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.tier-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    border-color: var(--tier-color);
}

.tier-card.selected {
    border-width: 2px;
    border-color: var(--tier-color);
    box-shadow: 0 0 0 3px rgba(var(--tier-color), 0.1);
}

.tier-card.recommended {
    border-color: #10B981;
    background: rgba(16, 185, 129, 0.05);
}

.recommended-badge {
    position: absolute;
    top: -12px;
    right: 20px;
    background: linear-gradient(135deg, #10B981, #059669);
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.tier-header {
    margin-bottom: 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding-bottom: 20px;
}

.tier-name {
    font-size: 24px;
    font-weight: 700;
    color: var(--tier-color);
    margin-bottom: 8px;
}

.tier-price {
    font-size: 28px;
    font-weight: 800;
    color: #1f2937;
}

.tier-features h4 {
    font-size: 14px;
    font-weight: 600;
    color: #6b7280;
    margin: 20px 0 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tier-features ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.tier-features li {
    padding: 8px 0;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    color: #374151;
}

.tier-features .icon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--tier-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
}

.limitations-title {
    color: #ef4444 !important;
}

.limitations li {
    color: #6b7280;
}

.limitations .icon {
    background: #ef4444;
}

.tier-button {
    width: 100%;
    padding: 14px 24px;
    border: 2px solid var(--tier-color);
    background: white;
    color: var(--tier-color);
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 24px;
}

.tier-button:hover {
    background: var(--tier-color);
    color: white;
    transform: scale(1.02);
}

.tier-button.selected {
    background: var(--tier-color);
    color: white;
    box-shadow: 0 4px 12px rgba(var(--tier-color), 0.3);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    .tier-card {
        background: rgba(31, 41, 55, 0.7);
        border-color: rgba(255, 255, 255, 0.1);
    }
    
    .tier-price {
        color: #f9fafb;
    }
    
    .tier-features li {
        color: #d1d5db;
    }
    
    .tier-button {
        background: rgba(31, 41, 55, 0.5);
    }
}
```

---

## Prochaines Étapes

1. ✅ **Documentation matrice restrictions** (ce fichier)
2. ⏳ **Créer middleware `permissions.js`**
3. ⏳ **Migration Prisma schema** (nouveaux champs abonnement)
4. ⏳ **Script migration données** (`migrate-account-types.js`)
5. ⏳ **Protéger routes API** (templates, export, library, stats)
6. ⏳ **Composant frontend** `AccountTypeSelector.jsx`
7. ⏳ **Tests déploiement VPS**

---

## Notes Importantes

- **Beta Testers** conservent accès complet temporairement
- **Migration réversible** : backup DB avant migration
- **Abonnements existants** : Influencer Pro downgrade vers Influencer (notification users)
- **Merchant** devient Producer automatiquement
- **Limites quotidiennes** : reset automatique via cron job ou middleware
- **Feature flags** : utiliser pour rollout progressif restrictions

---

**Dernière mise à jour :** 2025-12-12  
**Auteur :** GitHub Copilot  
**Statut :** 📝 Documentation initiale
