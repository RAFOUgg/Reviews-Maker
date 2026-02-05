# 🏗️ AUDIT STRUCTUREL SPRINT 2 - Organisation Complète

**Date**: 17 janvier 2026  
**Objectif**: Mapper la structure réelle et créer hiérarchie claire sans doublons

---

## 🔧 FIX APPLIQUÉ

✅ **App.jsx ligne 34**: Retrait de l'import `SettingsPage` (n'existe pas, causait build error)

**Status**: Build doit passer maintenant ✅

---

## 📊 STRUCTURE ACTUELLE ANALYSÉE

### 1. Pages Account (`client/src/pages/account/`)

```
AccountPage.jsx             ← Page profil principale (actuelle? À vérifier)
AccountChoicePage.jsx       ← Sélection type de compte
ManageSubscription.jsx      ← Gestion abonnement  
PaymentPage.jsx             ← Paiement
PreferencesPage.jsx         ← Préférences
ProfileSettingsPage.jsx     ← Paramètres profil (conflit? AccountPage?)
StatsPage.jsx               ← Statistiques
❌ SettingsPage.jsx        ← SUPPRIMÉ (horrible, KYC incomplet)
```

**Questions à clarifier**:
- AccountPage vs ProfileSettingsPage: c'est le même truc?
- PreferencesPage: incluse dans AccountPage ou séparée?
- StatsPage: ça fonctionne?

---

### 2. Orchard System (`client/src/components/shared/orchard/`)

```
OrchardPanel.jsx              ← Panel principal (683 lignes)
├─ PagedPreviewPane.jsx       ← Aperçu avec pagination
├─ PageManager.jsx            ← Gestion pages
├─ PipelineContentsSidebar.jsx ← Barre contenu pipeline
├─ PipelineEditor.jsx         ← Éditeur pipeline
├─ PipelineGitHubGrid.jsx     ← Grid style GitHub (CDC)
├─ PipelineToolbar.jsx        ← Toolbar pipeline
├─ PresetGroupQuickPicker.jsx ← Sélecteur presets
├─ PresetsPanelCDC.jsx        ← Panel presets
├─ SidebarHierarchique.jsx     ← Sidebar hiérarchie
└─ UnifiedPipeline.jsx        ← Pipeline générique (191 lignes)

**État**: ANCIEN, non à jour avec pipelines + généalogie
**Usage**: Appelé depuis CreateFlowerReview seulement
**À Faire**: Généraliser pour Hash/Concentrés/Comestibles
```

---

### 3. Export System (`client/src/components/export/`)

```
ExportMaker.jsx        ← Gestionnaire exports (principal)
ExportModal.jsx        ← Modal export (appelé par Export Maker)
ExportOptions.jsx      ← Options (probable)
```

**État**: Fonctionne pour Fleurs  
**À Faire**: Intégrer avec Export Maker pour généraliser

---

### 4. Library (`client/src/pages/review/LibraryPage.jsx`)

```
LibraryPage.jsx        ← Bibliothèque reviews (principal)
├─ Filtre visibilité (public/private)
├─ FilterBar component
├─ Actions (edit, delete, visibility toggle)
└─ À enrichir: templates Export Maker, cultvars, données récurrentes
```

**État**: OK mais incomplet  
**À Faire**: Ajouter templates, cultivars, données récurrentes

---

## 🎯 HIÉRARCHIE À CONSTRUIRE

### A. PAGE PROFIL UTILISATEUR (Reorganiser)

```
/account                     ← Route principale
├─ AccountPage.jsx           ← Vue principale (à refactoriser)
│  ├─ Infos personnelles
│  ├─ Entreprise data (Producteur/Influenceur)
│  ├─ Préférences
│  ├─ Facturation
│  └─ Intégrations
├─ ProfileSettingsPage       ← À fusionner dans AccountPage
├─ PreferencesPage           ← À fusionner dans AccountPage
├─ ManageSubscription        ← À garder (facturation avancée)
└─ StatsPage                 ← Route séparée /stats
```

**Action**: Fusionner ProfileSettingsPage + PreferencesPage dans AccountPage

---

### B. EXPORT SYSTEM (Généraliser Orchard)

```
ExportMaker.jsx (principal)
├─ Template selection
├─ OrchardPanel (pour producteurs/influenceurs)
│  ├─ OrchardComponents/
│  │  ├─ OrchardPreview.jsx
│  │  ├─ OrchardEditor.jsx
│  │  ├─ OrchardPageManager.jsx
│  │  └─ OrchardSidebar.jsx
│  └─ UnifiedPipeline (générique)
└─ ExportOptions (format, qualité, etc.)
```

**Action**: Restructurer orchard/ en sous-dossier organisé

---

### C. LIBRARY (Enrichir)

```
LibraryPage.jsx
├─ Reviews management
├─ Templates section
│  ├─ Saved OrchardMaker configs
│  └─ Custom templates
├─ Cultivars library (Producteur)
│  ├─ Genetics tree
│  └─ Pheno management
├─ Recurring data
│  ├─ Common nutrients
│  ├─ Common substrates
│  └─ Equipment
└─ Watermarks section
```

**Action**: Créer sous-sections avec données exhaustives

---

## ✅ CHECKLIST NETTOYAGE

### Files à Supprimer (Obsolètes)
- [ ] SettingsPage.jsx (déjà supprimé de l'import)
- [ ] Autres? À identifier

### Files à Fusionner
- [ ] ProfileSettingsPage → AccountPage
- [ ] PreferencesPage → AccountPage

### Files à Créer/Refactoriser
- [ ] Réorganiser orchard/ en structure claire
- [ ] Créer OrchardPanel wrapper réutilisable
- [ ] Enrichir LibraryPage sections

### Files à Vérifier
- [ ] PreferencesPage.jsx (existe? compatible?)
- [ ] ProfileSettingsPage.jsx (existe? incompatible?)
- [ ] StatsPage.jsx (fonctionne?)

---

## 🔍 PROCHAINES ÉTAPES

### PHASE 1: DIAGNOSTIQUE (30 min)
1. [ ] Vérifier existence ProfileSettingsPage + PreferencesPage
2. [ ] Vérifier AccountPage contenu actuel
3. [ ] Vérifier commits hier (SPRINT 2 finaux)
4. [ ] Test build local

### PHASE 2: NETTOYAGE (1-2H)
1. [ ] Fusionner PreferencesPage dans AccountPage
2. [ ] Fusionner ProfileSettingsPage dans AccountPage
3. [ ] Supprimer fichiers obsolètes
4. [ ] Test routes /account, /preferences, /profile-settings

### PHASE 3: RESTRUCTURE ORCHARD (2-3H)
1. [ ] Créer dossier orchard/components/
2. [ ] Reorganiser fichiers Orchard
3. [ ] Créer wrapper réutilisable
4. [ ] Intégrer Hash/Concentrés/Comestibles

### PHASE 4: ENRICHIR LIBRARY (2-3H)
1. [ ] Ajouter sections templates
2. [ ] Ajouter section cultivars
3. [ ] Ajouter section données récurrentes
4. [ ] Ajouter section filigrane

### PHASE 5: GÉNÉALOGIE PHENOHUNT (?)
1. [ ] À coordonner après que Orchard fonctionne

---

## 📋 DÉCOUVERTES

**SettingsPage**:
- Horrible (accord)
- Juste KYC incomplet
- "Complete your setup" modal
- Suppression confirmée

**Orchard**:
- Ancien (non à jour)
- Générique mais limité à Fleurs
- Doit être généraliser
- 683 lignes (volumineux)

**LibraryPage**:
- OK mais basique
- Prêt à enrichir
- Filtre + actions présentes

**AccountPage**:
- Unclear (plusieurs versions?)
- À vérifier contenu exact

---

## 🚀 GO?

Dis-moi:
1. **Vérifier les fichiers**: Je lis ProfileSettingsPage + PreferencesPage?
2. **Vérifier commits**: Je regarde les commits hier?
3. **Vérifier AccountPage**: C'est quoi dedans actuellement?
4. **Test build**: Je fais npm run build local?

**Status**: Build error FIXÉ, prêt pour PHASE 1 ✅
