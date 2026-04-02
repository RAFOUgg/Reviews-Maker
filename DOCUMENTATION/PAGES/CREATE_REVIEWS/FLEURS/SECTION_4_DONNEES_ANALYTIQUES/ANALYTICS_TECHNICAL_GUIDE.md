# Section Analytics - Guide Technique Complet

**Chemin** : `client/src/components/sections/AnalyticsSection.jsx`  
**Type de Compte** : Tous (optionnel)  
**Dernière Mise à Jour** : 2026-04-01

---

## 📋 Vue d'Ensemble

La section **Analytics** permet aux utilisateurs d'uploader des certificats d'analyse (cannabinoïdes et terpènes) et de saisir manuellement les taux de cannabinoïdes principaux.

### Captures d'écran
![Upload Certificat Cannabinoïdes](./assets/analytics-upload-cannabinoids.png)
![Upload Profil Terpénique](./assets/analytics-upload-terpenes.png)

---

## 🎯 Fonctionnalités

### 1. **Saisie Manuelle des Taux de Cannabinoïdes**
- ✅ THC (%)
- ✅ CBD (%)
- ✅ CBG (%)
- ✅ CBC (%)

**Validation** :
- Valeurs numériques uniquement (regex : `^\d*\.?\d*$`)
- Pas de limite max (permet >100% pour concentrés)

### 2. **Upload Certificat Cannabinoïdes**
**Formats acceptés** :
- PDF (`application/pdf`)
- JPEG/JPG (`image/jpeg`)
- PNG (`image/png`)

**Limites** :
- Taille max : **5 MB**
- 1 fichier uniquement

**Affichage** :
- Icône selon type (📄 PDF, 🖼️ image)
- Nom du fichier
- Bouton de suppression
- Bouton d'aperçu (modal)

### 3. **Upload Profil Terpénique Complet**
**Conformité CDC** : Le profil terpénique **DOIT** être fourni via certificat (PDF ou image). La saisie manuelle n'est **PAS autorisée**.

**Formats & limites** : Identiques au certificat cannabinoïdes.

**Affichage** : 
- Zone d'upload avec icône 🧪
- Message de conformité CDC
- Nom du fichier uploadé
- Actions (aperçu, suppression)

---

## 🔧 Implémentation Technique

### Props du Composant
```javascript
<AnalyticsSection 
  productType="flower" // 'flower' | 'hash' | 'concentrate'
  data={formData.analytics || {}}  // Objet analytics
  onChange={(payload) => handleChange('analytics', payload)}
  formData={formData}  // Fallback pattern
  handleChange={handleChange}  // Fallback pattern
/>
```

### Structure de Données
```javascript
// formData.analytics
{
  thcPercent: 25.5,          // number | null
  cbdPercent: 1.2,           // number | null
  cbgPercent: 0.8,           // number | null
  cbcPercent: 0.3,           // number | null
  terpeneProfile: [],        // array (legacy, non utilisé)
  certificateFile: File,     // File object
  terpeneFile: File          // File object
}
```

### État Interne (State)
```javascript
const [thc, setThc] = useState(String(data?.thcPercent ?? ''))
const [cbd, setCbd] = useState(String(data?.cbdPercent ?? ''))
const [cbg, setCbg] = useState(String(data?.cbgPercent ?? ''))
const [cbc, setCbc] = useState(String(data?.cbcPercent ?? ''))
const [uploadedFile, setUploadedFile] = useState(data?.certificateFile || null)
const [terpeneFile, setTerpeneFile] = useState(data?.terpeneFile || null)
const [uploadError, setUploadError] = useState('')
const [showPreview, setShowPreview] = useState(false)
const [previewType, setPreviewType] = useState(null) // 'cannabinoid' | 'terpene'
```

### Synchronisation Parent-Enfant
**Direction Parent → Enfant** :
```javascript
// useEffect pour re-sync quand data change (mode édition)
useEffect(() => {
  if (!data || data === prevDataRef.current) return;
  const hasValues = data.thcPercent != null || data.cbdPercent != null;
  if (!hasValues) return;
  prevDataRef.current = data;
  setThc(String(data.thcPercent ?? ''));
  setCbd(String(data.cbdPercent ?? ''));
  // ...
}, [data]);
```

**Direction Enfant → Parent** :
```javascript
// useEffect pour remonter les changements
useEffect(() => {
  safeUpdate({
    thcPercent: thc ? parseFloat(thc) : null,
    cbdPercent: cbd ? parseFloat(cbd) : null,
    cbgPercent: cbg ? parseFloat(cbg) : null,
    cbcPercent: cbc ? parseFloat(cbc) : null,
    certificateFile: uploadedFile,
    terpeneFile: terpeneFile
  });
}, [thc, cbd, cbg, cbc, uploadedFile, terpeneFile]);
```

---

## 📤 Upload de Fichiers

### Fonction handleFileUpload
```javascript
const handleFileUpload = (e, type = 'cannabinoid') => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Vérifier type de fichier
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    setUploadError('Format non supporté. Utilisez PDF, JPEG ou PNG.');
    return;
  }

  // Vérifier taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    setUploadError('Fichier trop volumineux. Maximum 5 MB.');
    return;
  }

  setUploadError('');

  if (type === 'terpene') {
    setTerpeneFile(file);
  } else {
    setUploadedFile(file);
  }
};
```

### HTML Input
```jsx
<input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleFileUpload(e, 'cannabinoid')}
  className="hidden"
  id="certificate-upload"
/>
```

---

## 💾 Sauvegarde Backend

### Aplatissement des Données (formDataFlattener.js)
```javascript
// Dans flattenFlowerFormData()
if (data.analytics) {
  if (data.analytics.thcPercent !== undefined) flat.thcPercent = data.analytics.thcPercent
  if (data.analytics.cbdPercent !== undefined) flat.cbdPercent = data.analytics.cbdPercent
  if (data.analytics.cbgPercent !== undefined) flat.cbgPercent = data.analytics.cbgPercent
  if (data.analytics.cbcPercent !== undefined) flat.cbcPercent = data.analytics.cbcPercent
  if (data.analytics.terpeneProfile) flat.terpeneProfile = data.analytics.terpeneProfile
  // ✅ FICHIERS AJOUTÉS (correction 2026-04-01)
  if (data.analytics.certificateFile) flat.certificateFile = data.analytics.certificateFile
  if (data.analytics.terpeneFile) flat.terpeneFile = data.analytics.terpeneFile
}
```

### Création du FormData (createFormDataFromFlat)
```javascript
export function createFormDataFromFlat(flatData, photos = [], status = 'draft', existingImages = []) {
  const formData = new FormData()

  // ✅ Extraire les fichiers AVANT la boucle
  const certificateFile = flatData.certificateFile
  const terpeneFile = flatData.terpeneFile
  
  // Ajouter toutes les données aplaties (sauf les fichiers)
  Object.keys(flatData).forEach(key => {
    // ✅ Skip les fichiers - ils seront ajoutés séparément
    if (key === 'certificateFile' || key === 'terpeneFile') return
    
    const value = flatData[key]
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value)
      }
    }
  })

  // ... photos existantes et nouvelles ...

  // ✅ Ajouter les fichiers analytiques (certificats)
  if (certificateFile && certificateFile instanceof File) {
    formData.append('certificateFile', certificateFile)
  }
  if (terpeneFile && terpeneFile instanceof File) {
    formData.append('terpeneFile', terpeneFile)
  }

  formData.append('status', status)
  formData.append('isPublic', status === 'published' ? 'true' : 'false')

  return formData
}
```

### Backend Expected (server-new/routes/flowers.js)
```javascript
// Route POST /api/flowers
upload.fields([
  { name: 'images', maxCount: 4 },
  { name: 'certificateFile', maxCount: 1 },  // ✅ REQUIS
  { name: 'terpeneFile', maxCount: 1 }       // ✅ REQUIS
])
```

---

## 🎨 UI/UX

### Design System : Liquid Glass
- **Card** : `<LiquidCard glow="blue" padding="lg">`
- **Inputs** : `<LiquidInput>` avec validation en temps réel
- **Divider** : `<LiquidDivider />` entre sections

### États Visuels
| État | Condition | Affichage |
|------|-----------|-----------|
| **Vide** | Pas de fichier | Zone upload avec icône ⬆️ |
| **Uploadé** | Fichier présent | Nom + icône + actions |
| **Erreur** | Validation échouée | Message rouge + icône ⚠️ |
| **Aperçu** | Clic bouton 👁️ | Modal plein écran |

### Messages d'Alerte
```jsx
<div className="p-4 border border-blue-500/20 rounded-xl bg-blue-500/10">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
    <div className="text-sm text-white/80">
      <p className="font-semibold mb-1">Section optionnelle</p>
      <p className="text-white/60">
        Les données analytiques ne sont pas obligatoires. 
        Vous pouvez laisser vide si vous n'avez pas de certificat d'analyse.
      </p>
    </div>
  </div>
</div>
```

---

## 🔍 Affichage dans ExportMaker

### Normalisation des Données (useReviewData.js)
```javascript
// templateData.analytics
analytics: {
  thc: resolveReviewField('thc'),
  cbd: resolveReviewField('cbd'),
  cbg: resolveReviewField('cbg'),
  cbc: resolveReviewField('cbc'),
  cbn: resolveReviewField('cbn'),
  thcv: resolveReviewField('thcv')
}
```

### Rendu dans ExportMaker
```javascript
const renderCannabinoidBadges = () => {
  const analytics = templateData.analytics || {};
  const cannabinoids = [
    { key: 'thc', value: analytics.thc, color: '#F87171', label: 'THC' },
    { key: 'cbd', value: analytics.cbd, color: '#34D399', label: 'CBD' },
    { key: 'cbg', value: analytics.cbg, color: '#FBBF24', label: 'CBG' },
    { key: 'cbc', value: analytics.cbc, color: '#A78BFA', label: 'CBC' }
  ].filter(c => c.value != null && c.value !== '');

  if (!cannabinoids.length) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {cannabinoids.map(c => (
        <span key={c.key} style={{
          padding: '4px 12px',
          background: `${c.color}20`,
          border: `1px solid ${c.color}`,
          borderRadius: '20px',
          color: c.color,
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {c.label} {c.value}%
        </span>
      ))}
    </div>
  );
};
```

---

## ⚠️ Problèmes Connus & Solutions

### 🐛 Bug #1 : Fichiers non sauvegardés (CORRIGÉ 2026-04-01)
**Symptôme** : Les fichiers uploadés disparaissaient après sauvegarde.

**Cause** : `flattenFlowerFormData` ne copiait pas `certificateFile` et `terpeneFile`.

**Solution** : Ajout des fichiers dans l'aplatissement + gestion File objects dans `createFormDataFromFlat`.

**Commit** : `fix: save analytics certificate files to backend`

---

### 🐛 Bug #2 : Validation trop stricte
**Symptôme** : Impossible de saisir 0.5 ou 100+

**Solution** : Regex `^\d*\.?\d*$` autorise décimales et pas de max.

---

### ⚠️ Attention : Types de Fichiers
Les `File` objects **NE PEUVENT PAS** être JSON.stringified. Il faut les extraire AVANT la boucle et les ajouter directement au FormData.

```javascript
// ❌ MAUVAIS
formData.append('certificateFile', JSON.stringify(file)) // TypeError

// ✅ BON
formData.append('certificateFile', file) // File object directement
```

---

## 🧪 Tests

### Test 1 : Upload PDF cannabinoïdes
1. Cliquer sur "Cliquez pour uploader un certificat"
2. Sélectionner un PDF < 5MB
3. Vérifier affichage : nom + icône 📄 + boutons
4. Cliquer aperçu → modal s'ouvre
5. Sauvegarder brouillon
6. Vérifier DevTools Network : `certificateFile` dans FormData
7. Recharger page → fichier toujours présent

### Test 2 : Upload image terpènes
1. Uploader PNG/JPEG dans "Profil terpénique"
2. Vérifier icône 🖼️
3. Sauvegarder
4. Vérifier `terpeneFile` dans payload

### Test 3 : Validation fichiers
1. Essayer upload fichier > 5MB → Erreur
2. Essayer upload .txt → Erreur format
3. Essayer upload .pdf valide → ✅

### Test 4 : Saisie manuelle
1. Saisir "25.5" dans THC → ✅
2. Saisir "abc" → bloqué par regex
3. Saisir "" (vide) → null envoyé

---

## 📚 Références

### Fichiers Liés
- **Component** : `client/src/components/sections/AnalyticsSection.jsx`
- **Flattener** : `client/src/utils/formDataFlattener.js`
- **Hook** : `client/src/pages/review/CreateFlowerReview/hooks/useFlowerForm.js`
- **Export** : `client/src/components/export/hooks/useReviewData.js`

### Documentation Connexe
- [Section 3 - Pipeline Culture](../SECTION_3_PIPELINE_CULTURE/README.md)
- [Section 5 - Visuel & Technique](../SECTION_5_VISUEL_TECHNIQUE/README.md)
- [ExportMaker Guide](../../EXPORT_MAKER/EXPORT_MAKER_GUIDE.md)
- [Corrections 2026-04-01](../../../../../CORRECTIONS_APPLIQUEES.md)

---

**Dernière révision** : 2026-04-01  
**Auteur** : Copilot AI  
**Version** : 1.1.0
