# 🔍 AUDIT DE CONFORMITÉ AU CDC - 14 Décembre 2025

## 📊 RÉSUMÉ EXÉCUTIF

### ✅ Points Conformes (70%)
- Structure des 4 types de produits (Fleurs, Hash, Concentrés, Comestibles)
- Système de PipeLines (Culture, Curing, Séparation, Extraction)
- OAuth2 multi-providers (Discord, Google, Apple, Facebook, Amazon)
- Système de templates et export basique
- Sections reviews (Visuel, Odeurs, Texture, Goûts, Effets)

### ⚠️ Écarts Majeurs Identifiés (30%)

#### 1. **Types de Comptes - NON CONFORME**
**CDC Requis:**
- Amateur (gratuit, limité)
- Producteur (29.99€/mois)
- Influenceur (15.99€/mois)

**Implémentation Actuelle:**
```javascript
// server-new/services/account.js
ACCOUNT_TYPES = {
    CONSUMER: 'consumer',
    INFLUENCER_BASIC: 'influencer_basic',
    INFLUENCER_PRO: 'influencer_pro',
    PRODUCER: 'producer'
}
```

**❌ PROBLÈME:** 4 types au lieu de 3, nomenclature différente

---

#### 2. **PipeLines - PARTIELLEMENT CONFORME**

**✅ CE QUI FONCTIONNE:**
- Timeline visuelle style GitHub
- Configuration intervalles (jours/semaines/phases)
- Composants existants:
  - `CulturePipelineTimeline.jsx`
  - `CuringMaturationTimeline.jsx`
  - `SeparationPipelineSection.jsx`
  - `ExtractionPipelineSection.jsx`

**❌ MANQUE:**
- Pipeline Purification (Hash/Concentrés) - CDC exige:
  ```
  "Chromatographie, Flash Chromatography, HPLC, GC, TLC, 
   Winterisation, Décarboxylation, Fractionnement..."
  ```
- Pipeline Recette (Comestibles) - Incomplet
- Morphologie plante (taille, volume, poids, branches, feuilles, buds)
- Récolte détaillée (couleur trichomes, dates, poids brut/net, rendement)

---

#### 3. **Système de Génétiques - NON IMPLÉMENTÉ**

**CDC Requis:**
```
"Création d'arbre généalogique avec relations parents/enfants
Gestion projet PhenoHunt
Canva drag & drop depuis bibliothèque
Visualisation graphique arbre généalogique"
```

**État:** ❌ Aucun fichier trouvé

---

#### 4. **Export Maker - BASIQUE**

**✅ CE QUI EXISTE:**
- Templates: Compact, Détaillé, Complète
- Formats basiques
- Système Orchard pour personnalisation

**❌ MANQUE:**
- Template "Influenceur" (format 9:16)
- Pagination (max 9 pages pour 1:1 et 16:9)
- Export GIF pour évolution culture (producteurs)
- Limites par format (nombre contenus selon ratio)
- Système de filigrane personnalisé
- Export CSV/JSON pour données pipeline

---

#### 5. **Vérification d'Âge & KYC - INCOMPLET**

**✅ CE QUI EXISTE:**
- Route `/api/kyc/upload` (server-new/routes/kyc.js)
- Champs Prisma: `birthdate`, `legalAge`, `kycStatus`

**❌ MANQUE:**
- Interface utilisateur vérification âge à l'inscription
- Disclaimer RDR adapté par pays
- Workflow eKYC complet (upload → vérification → validation)
- Différenciation pays (18 vs 21 ans)

---

#### 6. **Données Utilisateur selon Type de Compte - PARTIEL**

**CDC Exige par Type:**

**PRODUCTEUR:**
```javascript
// MANQUE dans Prisma:
- denomi nationsociale
- representantLegal
- adresseProfessionnelle
- numeroSIRET/SIREN
- formeJuridique
- numeroTVA
- justificatifsActivite
- licenceCannabis
```

**INFLUENCEUR:**
```javascript
// MANQUE:
- reseauxSociaux (structured)
- siteWeb/portfolio
- statistiquesAudience
```

---

## 🔧 CORRECTIONS PRIORITAIRES

### Phase 1 - Types de Comptes (2h)
1. Refondre `ACCOUNT_TYPES` conforme CDC:
   ```javascript
   ACCOUNT_TYPES = {
       AMATEUR: 'amateur',
       PRODUCTEUR: 'producteur',
       INFLUENCEUR: 'influenceur'
   }
   ```

2. Migrer Prisma schema:
   ```prisma
   model User {
       accountType String @default("amateur") // amateur, producteur, influenceur
       subscriptionType String? // null (amateur), "producteur" (29.99€), "influenceur" (15.99€)
       subscriptionPrice Float?
   }
   ```

3. Mettre à jour:
   - `server-new/services/account.js`
   - `server-new/routes/auth.js`
   - Tous les middlewares permissions

---

### Phase 2 - PipeLines Manquants (4h)

#### 2.1 - Pipeline Purification (Hash/Concentrés)
**Fichier:** `client/src/components/pipelines/PurificationPipeline.jsx`

**Méthodes à implémenter:**
```javascript
const PURIFICATION_METHODS = [
    { id: 'chromatographie', name: 'Chromatographie sur colonne', params: ['solvant', 'temperature', 'duree'] },
    { id: 'winterisation', name: 'Winterisation', params: ['temperature', 'duree', 'solvant'] },
    { id: 'decarboxylation', name: 'Décarboxylation', params: ['temperature', 'duree'] },
    { id: 'filtration', name: 'Filtration', params: ['type', 'microns'] },
    // ... 15 autres méthodes
]
```

#### 2.2 - Compléter Données Culture
**Fichier:** `server-new/prisma/schema.prisma` + `client/src/pages/CreateFlowerReview.jsx`

**Ajouter champs:**
```prisma
model FlowerReview {
    // Morphologie plante
    plantHeight Float?
    plantVolume Float?
    plantWeight Float?
    mainBranches Int?
    leavesCount Int?
    budsCount Int?
    
    // Récolte
    trichomeColor String? // JSON: {laiteux: 70, ambre: 20, translucide: 10}
    harvestDate DateTime?
    grossWeight Float?
    netWeight Float?
    yieldPerM2 Float?
    yieldPerPlant Float?
}
```

---

### Phase 3 - Système Génétiques (6h)

#### 3.1 - Backend
**Fichier:** `server-new/prisma/schema.prisma`

```prisma
model Cultivar {
    id String @id @default(uuid())
    userId String
    name String
    breeder String?
    type String // indica, sativa, hybride
    indicaPercent Int?
    sativaPercent Int?
    
    // Relations généalogiques
    parentMaleId String?
    parentFemaleId String?
    parentMale Cultivar? @relation("CultivarParentMale", fields: [parentMaleId], references: [id])
    parentFemale Cultivar? @relation("CultivarParentFemale", fields: [parentFemaleId], references: [id])
    children Cultivar[] @relation("CultivarChildren")
    
    // PhenoHunt
    phenoHuntProject String?
    phenoNumber String?
    selected Boolean @default(false)
    
    user User @relation(fields: [userId], references: [id])
    
    @@index([userId])
}
```

#### 3.2 - Frontend
**Fichiers à créer:**
- `client/src/pages/GeneticsLibraryPage.jsx`
- `client/src/components/genetics/GeneticsCanvas.jsx`
- `client/src/components/genetics/CultivarCard.jsx`
- `client/src/components/genetics/FamilyTree.jsx`

**Interface:**
```jsx
// Bandeau latéral gauche
- Onglet "Bibliothèque" (galerie cultivars)
- Onglet "Projets PhenoHunt"
- Filtres & recherche

// Canvas principal (droite)
- Drag & drop cultivars depuis bibliothèque
- Lignes de relation parents/enfants (SVG)
- Édition inline (double-clic)
- Export arbre en PNG/SVG
```

---

### Phase 4 - Export Maker Avancé (5h)

#### 4.1 - Template Influenceur (9:16)
**Fichier:** `server-new/seed-templates.js` + `client/src/components/orchard/templates/`

```javascript
{
    name: "Influenceur Mode",
    format: "9:16",
    allowedAccountTypes: { influenceur: true },
    zones: [
        { id: 'header', type: 'typeProduit', fixed: true },
        { id: 'photo', type: 'mainImage', fixed: true },
        { id: 'cultivars', type: 'cultivars', fixed: true },
        { id: 'pipeline', type: 'curingPipeline', scrollable: true },
        { id: 'notes', type: 'scores', layout: 'compact' }
    ]
}
```

#### 4.2 - Système Pagination
**Limites par format:**
```javascript
const FORMAT_LIMITS = {
    '1:1': { maxElements: 25, maxPages: 9 },
    '16:9': { maxElements: 30, maxPages: 9 },
    '9:16': { maxElements: 15, maxPages: 1 }, // Mobile, pas de pagination
    'A4': { maxElements: 40, maxPages: 9 }
}
```

#### 4.3 - Export GIF Évolution
**Fichier:** `client/src/components/export/GifExporter.jsx`

```javascript
import GIF from 'gif.js'

export async function exportPipelineAsGif(timelineData, config) {
    const gif = new GIF({ workers: 2, quality: 10 })
    
    for (const frame of timelineData) {
        const canvas = await renderFrameToCanvas(frame, config)
        gif.addFrame(canvas, { delay: config.frameDuration || 500 })
    }
    
    return new Promise((resolve) => {
        gif.on('finished', (blob) => resolve(blob))
        gif.render()
    })
}
```

---

### Phase 5 - Vérification Âge & KYC (3h)

#### 5.1 - Page Vérification Âge
**Fichier:** `client/src/pages/AgeVerificationPage.jsx`

```jsx
export default function AgeVerificationPage() {
    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('FR')
    
    const getMinAge = () => country === 'US' || country === 'CA' ? 21 : 18
    
    const handleSubmit = async () => {
        const age = calculateAge(birthdate)
        const minAge = getMinAge()
        
        if (age < minAge) {
            return showError(`Vous devez avoir ${minAge} ans minimum`)
        }
        
        await api.users.updateProfile({ birthdate, legalAge: true })
        navigate('/disclaimer-rdr')
    }
    
    return <AgeVerificationForm />
}
```

#### 5.2 - Disclaimer RDR
**Fichier:** `client/src/components/legal/DisclaimerRDR.jsx`

```jsx
const DISCLAIMERS = {
    FR: "La consommation de cannabis présente des risques pour la santé...",
    US: "Cannabis use may cause serious health risks...",
    // ... autres pays
}

export default function DisclaimerRDR({ country, onAccept }) {
    return (
        <Modal>
            <h2>Avertissement Réduction des Risques</h2>
            <p>{DISCLAIMERS[country] || DISCLAIMERS.FR}</p>
            <Checkbox onChange={onAccept}>
                J'ai lu et j'accepte ces informations
            </Checkbox>
        </Modal>
    )
}
```

#### 5.3 - Workflow KYC Complet
**Fichiers:**
- `client/src/pages/KYCVerificationPage.jsx` (upload docs)
- `server-new/routes/admin/kyc.js` (validation admin)
- `client/src/pages/admin/KYCReviewPage.jsx` (panel admin)

---

### Phase 6 - Données Utilisateur Étendues (2h)

#### 6.1 - ProducerProfile
**Fichier:** `server-new/prisma/schema.prisma`

```prisma
model ProducerProfile {
    id String @id @default(uuid())
    userId String @unique
    
    // Identité légale
    legalName String? // Dénomination sociale
    legalRepresentative String?
    businessAddress String?
    siretNumber String?
    vatNumber String?
    legalForm String? // Auto-entrepreneur, SARL, etc.
    
    // Justificatifs
    businessLicense String? // JSON array documents
    cannabisLicense String?
    extractKbis String? // Path fichier
    
    // Infos publiques
    logoUrl String?
    websiteUrl String?
    socialLinks String? // JSON: {instagram: '', facebook: ''}
    
    user User @relation(fields: [userId], references: [id])
    
    @@map("producer_profiles")
}
```

#### 6.2 - InfluencerProfile
**Fichier:** `server-new/prisma/schema.prisma`

```prisma
model InfluencerProfile {
    id String @id @default(uuid())
    userId String @unique
    
    // Présence en ligne
    socialLinks String // JSON: {instagram: '', youtube: '', tiktok: ''}
    websiteUrl String?
    portfolioUrl String?
    
    // Statistiques (auto-déclarées)
    followersCount Int?
    avgEngagementRate Float?
    
    // Vérification
    verificationBadge Boolean @default(false)
    
    user User @relation(fields: [userId], references: [id])
    
    @@map("influencer_profiles")
}
```

---

## 📋 PLAN D'IMPLÉMENTATION COMPLET

### Semaine 1 (16-22 Déc)
- [ ] Phase 1: Types de comptes (2h)
- [ ] Phase 5: Vérification âge/KYC (3h)
- [ ] Phase 6: Données utilisateur (2h)
- [ ] Tests intégration (2h)

### Semaine 2 (23-29 Déc)
- [ ] Phase 2: PipeLines manquants (4h)
- [ ] Phase 4: Export Maker avancé (5h)
- [ ] Tests export/pipelines (2h)

### Semaine 3 (30 Déc - 5 Jan)
- [ ] Phase 3: Système génétiques (6h)
- [ ] Intégration complète (3h)
- [ ] Tests finaux (2h)

### Semaine 4 (6-12 Jan)
- [ ] Déploiement VPS
- [ ] Documentation utilisateur
- [ ] Monitoring production

---

## 🎯 PRIORITÉS IMMÉDIATES (Aujourd'hui)

### 1. Types de Comptes (CRITIQUE)
**Impact:** Toutes les permissions et fonctionnalités
**Durée:** 2h
**Fichiers:**
- `server-new/services/account.js`
- `server-new/prisma/schema.prisma`
- Migration base de données

### 2. Pipeline Purification (HAUTE)
**Impact:** Reviews Hash et Concentrés incomplètes
**Durée:** 2h
**Fichiers:**
- `client/src/components/pipelines/PurificationPipeline.jsx`
- `client/src/data/purificationMethods.js`

### 3. Vérification Âge (LÉGAL)
**Impact:** Conformité légale obligatoire
**Durée:** 1h30
**Fichiers:**
- `client/src/pages/AgeVerificationPage.jsx`
- `client/src/components/legal/DisclaimerRDR.jsx`

---

## ✅ VALIDATION FINALE

Avant déploiement VPS, vérifier:
- [ ] Tous les types de comptes fonctionnent
- [ ] Chaque type de produit a TOUS ses champs CDC
- [ ] PipeLines complets (Culture, Curing, Séparation, Extraction, Purification, Recette)
- [ ] Export Maker avec 5 templates + pagination
- [ ] Vérification âge obligatoire à l'inscription
- [ ] KYC fonctionnel pour Producteur/Influenceur
- [ ] Système génétiques opérationnel (bibliothèque + canva)

---

**Audit réalisé le:** 14 Décembre 2025
**Conformité globale:** 70%
**Objectif:** 100% avant fin janvier 2026
