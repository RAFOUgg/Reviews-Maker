# 🗑️ AUDIT FICHIERS OBSOLÈTES & ORGANISATION

**Version**: 1.0  
**Date**: 16 janvier 2026  
**Objectif**: Identifier & nettoyer les fichiers inutiles ou hors-projet

---

## 📋 FICHIERS AUDIT (À ARCHIVER)

Ces fichiers ont été générés durant l'audit technique. Non-essentiels pour développement.

| Fichier | Raison | Action | Blocker? |
|---|---|---|---|
| `AUDIT_FLEURS_COMPLET.json` | Rapport audit exhaustif (904 lignes) | 📦 Archiver `/docs/audit-2026/` | ❌ Non |
| `AUDIT_FLEURS_Q1_2024.md` | Rapport Q1 2024 outdated | 🗑️ Supprimer | ❌ Non |
| `AUDIT_FLEURS_RAPPORT.md` | Résumé audit technique | 📦 Archiver | ❌ Non |
| `AUDIT_LIVRABLES_FINAUX.md` | Rapport livrables | 📦 Archiver | ❌ Non |
| `AUDIT_PIPELINE.md` | Audit architecture pipeline | 📦 Archiver | ❌ Non |
| `AUDIT_PIPELINE_SUMMARY.md` | Résumé audit pipeline | 📦 Archiver | ❌ Non |
| `AUDIT_VUE_GLOBALE_VISUELLE.md` | Vue globale visuelle | 📦 Archiver | ❌ Non |
| `FICHIERS_AUDIT_LOCALISATION.md` | Index fichiers audit | 📦 Archiver | ❌ Non |
| `INDEX_AUDIT_FLEURS.md` | Index audit Fleurs | 📦 Archiver | ❌ Non |
| `RESUME_EXECUTIF_AUDIT_FLEURS.md` | Résumé exécutif | 📦 Archiver | ❌ Non |
| `QUICK_START_AUDIT_FLEURS.txt` | Quick start audit | 📦 Archiver | ❌ Non |

**Dossier Archive Proposé**: `/ARCHIVE_AUDIT_2026/`

---

## 🧹 SCRIPTS REFACTOR (À NETTOYER)

Scripts générés pour refactor/réorganisation. Plupart obsolètes après refactor complet.

| Fichier | Raison | Utilisé? | Action |
|---|---|---|---|
| `fix-imports.js` | Fix imports v1 | ❌ Non | 🗑️ Supprimer |
| `fix-imports-v2.js` | Fix imports v2 | ❌ Non | 🗑️ Supprimer |
| `fix-imports-mega.js` | Fix imports mega | ❌ Non | 🗑️ Supprimer |
| `fix-imports-complete.js` | Fix imports complete | ❌ Non | 🗑️ Supprimer |
| `fix-nested-imports.js` | Fix nested imports | ❌ Non | 🗑️ Supprimer |
| `fix-all-imports.js` | Fix all imports v1 | ❌ Non | 🗑️ Supprimer |
| `check-imports.js` | Check imports validation | ❌ Non | 📦 Archiver (référence?) |
| `audit-validation-fleurs.js` | Validation audit Fleurs | ❌ Non | 📦 Archiver |

**Raison Suppression**: Tous concernent réorg imports ancienne. Actuellement structure stable.

---

## 🔧 SCRIPTS POWERSHELL (À NETTOYER)

Scripts batch PowerShell pour refactor massive. Non-maintenables, hors projet.

| Fichier | Raison | Sûr de Supprimer? | Action |
|---|---|---|---|
| `fix-all-data-imports.ps1` | Fix data imports | ✅ Oui | 🗑️ Supprimer |
| `fix-all-imports.ps1` | Fix all imports batch | ✅ Oui | 🗑️ Supprimer |
| `fix-broken-quotes.ps1` | Fix quotes | ✅ Oui | 🗑️ Supprimer |
| `fix-root-component-imports.ps1` | Fix root imports | ✅ Oui | 🗑️ Supprimer |
| `final-components-reorganize.ps1` | Final reorganize components | ✅ Oui | 🗑️ Supprimer |
| `final-pages-reorganize.ps1` | Final reorganize pages | ✅ Oui | 🗑️ Supprimer |
| `flatten-structure.ps1` | Flatten structure | ✅ Oui | 🗑️ Supprimer |
| `move-remaining-files.ps1` | Move remaining | ✅ Oui | 🗑️ Supprimer |
| `organize-by-imports.ps1` | Organize by imports | ✅ Oui | 🗑️ Supprimer |
| `reorganize-components.ps1` | Reorganize components | ✅ Oui | 🗑️ Supprimer |
| `reorganize-pages.ps1` | Reorganize pages | ✅ Oui | 🗑️ Supprimer |
| `restore_corrupted_files.ps1` | Restore corrupted | ✅ Oui | 🗑️ Supprimer |
| `setup-dev-local.ps1` | Setup dev local | ⚠️ Garder? | 📦 Archive ou ✅ Garder |

**Note setup-dev-local.ps1**: Peut être utile référence. À décider.

---

## 📄 DOCUMENTS REFACTOR (À ARCHIVER)

Documentation générée durant refactor. Non-essentiels pour V1 MVP.

| Fichier | Raison | Action |
|---|---|---|
| `COMPONENT_MOVE_PLAN.md` | Plan réorganisation components | 📦 Archive |
| `CLEANUP.md` | Cleanup list | 📦 Archive |
| `CORRUPTION_REPORT.md` | Corruption report | 📦 Archive |
| `IMPORT_UPDATES_GUIDE.md` | Import updates guide | 📦 Archive |
| `FLEURS_DOCUMENTATION_BUILD.md` | Fleurs documentation build | 📦 Archive |
| `PIPELINE_ARCHITECTURE.md` | Pipeline architecture (vieux) | 📦 Archive |
| `PIPELINE_AUDIT_REPORT.md` | Pipeline audit report | 📦 Archive |
| `PIPELINE_RESTRUCTURE_REPORT.md` | Pipeline restructure | 📦 Archive |
| `PIPELINE_UNIFICATION_COMPLETE.md` | Pipeline unification complete | 📦 Archive |
| `PIPELINE_UNIFIED_ARCHITECTURE.md` | Unified architecture | 📦 Archive |
| `PROJECT_STRUCTURE.md` | Project structure (vieux) | 📦 Archive |
| `LOCAL_DEV_CHECKLIST.md` | Local dev checklist | 📦 Archive |
| `DEV_LOCAL_SETUP.md` | Dev local setup | 📦 Archive |
| `ACTION_ITEMS.md` | Action items (vieux) | 📦 Archive |

---

## 📚 DOCUMENTATION ACTIVE (GARDER)

Ces docs sont utiles pour développement V1 MVP.

| Fichier | Raison | Statut |
|---|---|---|
| `CAHIER_DES_CHARGES_V1_MVP_FLEURS.md` | ✅ **NOUVELLE VERSION** | 🟢 ACTIF |
| `GUIDE_LECTURE_CAHIER_DES_CHARGES.md` | ✅ **NOUVEAU** Guide équipe | 🟢 ACTIF |
| `VALIDATION_V1_MVP_FLEURS.md` | ✅ **NOUVEAU** Validation checklist | 🟢 ACTIF |
| `QUICK_REFERENCE.md` | Référence rapide architecture | 🟢 ACTIF |
| `README.md` | Doc projet principale | 🟢 ACTIF |
| `RECOMMANDATIONS_IMPLEMENTATION_FLEURS.md` | Recommandations implémentation | 🟢 ACTIF? |
| `MVP_BETA_READY.txt` | Status MVP beta | ⚠️ À valider |

---

## 🗂️ STRUCTURE RÉPERTOIRES À NETTOYER

### Root Projet

**Avant** (40+ fichiers markdown):
```
- AUDIT_*.md (10 fichiers)
- PIPELINE_*.md (5 fichiers)
- fix-*.js (6 fichiers)
- fix-*.ps1 (13 fichiers)
- CLEANUP.md, COMPONENT_MOVE_PLAN.md, etc. (10+ fichiers)
```

**Après** (clean):
```
- CAHIER_DES_CHARGES_V1_MVP_FLEURS.md ✅ Principal
- GUIDE_LECTURE_CAHIER_DES_CHARGES.md ✅ Support
- VALIDATION_V1_MVP_FLEURS.md ✅ Checklist
- QUICK_REFERENCE.md ✅ Ref rapide
- README.md ✅ Principal
- /ARCHIVE_AUDIT_2026/ ← Tous anciens audits
```

### Dossier /scripts/

**À nettoyer**:
```
- check-imports.js → archive
- audit-validation-fleurs.js → archive
- fix-*.js → supprimer (tous obsolètes)
- fix-*.sh → garder utiles?
```

**À garder**:
```
- deploy-vps.sh ✅
- db-backup.sh ✅
- db-restore.sh ✅
- migrate-database-vps.sh ✅
- diagnostics.sh ✅
- README.md ✅
```

---

## 🎯 PLAN NETTOYAGE (PAR PRIORITÉ)

### Phase 1: Suppression Complète (30 min)

**Supprimer immédiatement** - Zéro valeur:

```bash
# Scripts fix imports (tous obsolètes)
rm fix-imports.js
rm fix-imports-v2.js
rm fix-imports-mega.js
rm fix-imports-complete.js
rm fix-nested-imports.js
rm fix-all-imports.js

# Scripts PowerShell (tous obsolètes)
rm fix-all-data-imports.ps1
rm fix-all-imports.ps1
rm fix-broken-quotes.ps1
rm fix-root-component-imports.ps1
rm final-components-reorganize.ps1
rm final-pages-reorganize.ps1
rm flatten-structure.ps1
rm move-remaining-files.ps1
rm organize-by-imports.ps1
rm reorganize-components.ps1
rm reorganize-pages.ps1
rm restore_corrupted_files.ps1

# Docs refactor obsolètes
rm AUDIT_FLEURS_Q1_2024.md
```

**Fichiers**: 19 fichiers → Suppression

---

### Phase 2: Archivage (45 min)

**Créer dossier archivage**:

```bash
mkdir ARCHIVE_AUDIT_2026
```

**Archiver rapidement** - Reference future possible:

```bash
# Audits techniques
mv AUDIT_FLEURS_COMPLET.json ARCHIVE_AUDIT_2026/
mv AUDIT_FLEURS_RAPPORT.md ARCHIVE_AUDIT_2026/
mv AUDIT_LIVRABLES_FINAUX.md ARCHIVE_AUDIT_2026/
mv AUDIT_PIPELINE.md ARCHIVE_AUDIT_2026/
mv AUDIT_PIPELINE_SUMMARY.md ARCHIVE_AUDIT_2026/
mv AUDIT_VUE_GLOBALE_VISUELLE.md ARCHIVE_AUDIT_2026/
mv FICHIERS_AUDIT_LOCALISATION.md ARCHIVE_AUDIT_2026/
mv INDEX_AUDIT_FLEURS.md ARCHIVE_AUDIT_2026/
mv RESUME_EXECUTIF_AUDIT_FLEURS.md ARCHIVE_AUDIT_2026/
mv QUICK_START_AUDIT_FLEURS.txt ARCHIVE_AUDIT_2026/

# Scripts reference
mv check-imports.js ARCHIVE_AUDIT_2026/
mv audit-validation-fleurs.js ARCHIVE_AUDIT_2026/

# Docs refactor
mv COMPONENT_MOVE_PLAN.md ARCHIVE_AUDIT_2026/
mv CLEANUP.md ARCHIVE_AUDIT_2026/
mv CORRUPTION_REPORT.md ARCHIVE_AUDIT_2026/
mv IMPORT_UPDATES_GUIDE.md ARCHIVE_AUDIT_2026/
mv FLEURS_DOCUMENTATION_BUILD.md ARCHIVE_AUDIT_2026/
mv PIPELINE_ARCHITECTURE.md ARCHIVE_AUDIT_2026/
mv PIPELINE_AUDIT_REPORT.md ARCHIVE_AUDIT_2026/
mv PIPELINE_RESTRUCTURE_REPORT.md ARCHIVE_AUDIT_2026/
mv PIPELINE_UNIFICATION_COMPLETE.md ARCHIVE_AUDIT_2026/
mv PIPELINE_UNIFIED_ARCHITECTURE.md ARCHIVE_AUDIT_2026/
mv PROJECT_STRUCTURE.md ARCHIVE_AUDIT_2026/
mv LOCAL_DEV_CHECKLIST.md ARCHIVE_AUDIT_2026/
mv DEV_LOCAL_SETUP.md ARCHIVE_AUDIT_2026/
mv ACTION_ITEMS.md ARCHIVE_AUDIT_2026/

# PowerShell utile (possiblement)
mv setup-dev-local.ps1 ARCHIVE_AUDIT_2026/
```

**Fichiers**: 29 fichiers → Archivage

**Résultat**: Root = 10 fichiers nettoyés ✅

---

### Phase 3: Décisions Reste (30 min)

**À valider**:

1. `MVP_BETA_READY.txt` - Supprimer ou garder?
   - Contenu: Status MVP beta
   - Décision: ✅ **Garder** (reference status)

2. `RECOMMANDATIONS_IMPLEMENTATION_FLEURS.md` - Utile?
   - Contenu: Recommandations pour implementation
   - Décision: ⚠️ **À vérifier** vs CAHIER_DES_CHARGES (possiblement doublon)

3. `package-lock.json` - Garder?
   - Contenu: npm lockfile
   - Décision: ✅ **GARDER** (essentiels npm)

---

## 📝 CHECKLIST EXÉCUTION

### Nettoyage Root (Phase 1-2)

- [ ] Créer `/ARCHIVE_AUDIT_2026/`
- [ ] Supprimer 19 fichiers obsolètes
- [ ] Archiver 29 fichiers références
- [ ] Vérifier root clean
- [ ] Commit: "chore: clean up audit/refactor artifacts"

### Vérification Scripts

- [ ] `/scripts/` contient: deploy*.sh, db*.sh, migrate*.sh, diagnostics.sh, README.md OK?
- [ ] fix-*.js tous partis?
- [ ] Aucun .ps1 en root?
- [ ] Aucun double audit?

### Git Cleanup

```bash
# Avant commit, vérifier structure
git status

# Commit
git add -A
git commit -m "chore: clean audit artifacts and organize structure

- Archive 29 audit/refactor docs into ARCHIVE_AUDIT_2026/
- Remove 19 obsolete fix/refactor scripts
- Keep: CAHIER_DES_CHARGES, VALIDATION, GUIDE_LECTURE
- Root now clean with 10 essential docs only"

git push
```

---

## 📊 RÉSUMÉ IMPACT

### Avant

```
Root: ~50 fichiers markdown + scripts
Scripts/: Multiple fix-*.js + diagnostics
Confusion: Quel document lire?
Maintenance: Difficile, doublons
```

### Après

```
Root: 10 fichiers essentiels
  - CAHIER_DES_CHARGES_V1_MVP_FLEURS.md (principal)
  - VALIDATION_V1_MVP_FLEURS.md (checklist)
  - GUIDE_LECTURE_CAHIER_DES_CHARGES.md (support)
  - QUICK_REFERENCE.md (rapide)
  - README.md (projet)
  - MVR_BETA_READY.txt
  - + 4 configs nginx/ecosystem

Scripts/: Clean + essentiels
  - deploy-vps.sh
  - db-*.sh
  - migrate-*.sh
  - diagnostics.sh

Archive/: Accessible si future référence
  - 29 docs audit/refactor
  - 2 scripts check/validation
```

**Impact**: 
- ✅ Clarté: Où commencer? → CAHIER_DES_CHARGES
- ✅ Maintenance: Zéro doublons
- ✅ Onboarding: Équipe sait quoi lire
- ✅ Référence: Audit accessible archive

---

## 🔄 APRÈS NETTOYAGE

**Prochaines étapes**:

1. ✅ Équipe reçoit 3 docs principaux:
   - CAHIER_DES_CHARGES_V1_MVP_FLEURS.md
   - GUIDE_LECTURE_CAHIER_DES_CHARGES.md
   - VALIDATION_V1_MVP_FLEURS.md

2. ✅ Devs commencent implémentation sprint 1
   - Focus: Permissions + Section 1-2
   - Refer: CAHIER + VALIDATION

3. ✅ Archive reste accessible si besoin audit
   - `/ARCHIVE_AUDIT_2026/AUDIT_FLEURS_COMPLET.json`
   - Mais pas clutter root

---

**Document**: Audit Fichiers Obsolètes & Nettoyage  
**Effort**: 2h total (30m suppression + 45m archivage + 30m validation + 15m git)  
**Prochaine étape**: Exécuter nettoyage Phase 1-2, valider Phase 3
