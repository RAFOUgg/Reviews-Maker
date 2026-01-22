# 🧹 AUDIT & PLAN DE CLEANUP DOCUMENTATION

**Date**: 22 janvier 2026  
**Scope**: Nettoyer root + DOCUMENTATION/IN_DEV, keeper DOCUMENTATION + PAGES  
**Status**: AUDIT COMPLET

---

## 📊 STATISTIQUES ACTUELLES

### **Root Level (.md files)**
```
Total: 99+ files at root
├─ Nouveaux (SPRINT 2/3): ✅ 14 files
│   ├─ PLAN_ACCOUNT_PAGE_REFONTE.md ✅
│   ├─ PLAN_EXECUTION_FINAL.md ✅
│   ├─ PLAN_EXPORTMAKER_UNIFIEE.md ✅
│   ├─ PLAN_LIBRARY_COMPLETE.md ✅
│   ├─ SPRINT_2_GETTING_STARTED.md ✅
│   ├─ INDEX_DOCUMENTATION_SPRINT_2_3.md ✅
│   ├─ EXECUTIVE_SUMMARY_SPRINT_2_3.md ✅
│   ├─ TLDR_SPRINT_2_3.md ✅
│   ├─ ARCHITECTURE_GLOBALE_V2.md ✅
│   └─ Others (Deployment, MVP audit, etc)
│
├─ Obsolète (à déleter): 🗑️ ~50+ files
│   ├─ AUDIT_*.md (multiple)
│   ├─ SESSION_REPORT_*.md
│   ├─ SPRINT_1_*.md (old phase)
│   ├─ *_SUMMARY.md (duplicates)
│   ├─ *_REPORT.md (old phase)
│   ├─ FIX_*.md (debug scripts)
│   ├─ reorganize-*.ps1 (scripts)
│   ├─ restore_*.ps1 (scripts)
│   └─ ...many others
│
└─ Scripts (.sh, .ps1): 🗑️ ~15 files
    ├─ fix-*.js/ps1
    ├─ setup-*.sh/ps1
    ├─ deploy*.sh
    └─ reorganize/restore scripts
```

### **DOCUMENTATION/IN_DEV/**
```
Total: 91 files
├─ Audit/validation docs: 🗑️ ~40 files
│   ├─ AUDIT_*.md
│   ├─ INDEX_AUDIT_*.md
│   ├─ VALIDATION_*.md
│   ├─ SESSION_*.md
│   ├─ SPRINT_*.md (old phases)
│   ├─ REPORT_*.md
│   └─ etc
│
├─ Setup/install docs: 🗑️ ~10 files
│   ├─ LOCAL_DEV_CHECKLIST.md
│   ├─ DEV_LOCAL_SETUP.md
│   ├─ NGINX_CACHE_FIX.md
│   ├─ NODE_INSTALL_BLOCKER.md
│   └─ etc
│
├─ Scripts: 🗑️ ~3 files
│   ├─ reorganize-*.ps1
│   ├─ restore_*.ps1
│   └─ etc
│
└─ Core docs to keep: ✅ ~10 files
    ├─ 🚀_COMMENCE_ICI.md
    ├─ README.md
    ├─ CAHIER_DES_CHARGES_V1_MVP_FLEURS.md (reference)
    ├─ PIPELINE_UNIFIED_ARCHITECTURE.md (reference)
    ├─ DEV_LOCAL_SETUP.md (keep - setup guide)
    └─ etc
```

---

## 🎯 STRATÉGIE DE CLEANUP

### **STEP 1: Move Core Docs to DOCUMENTATION/** (Keep)
```
FROM: DOCUMENTATION/IN_DEV/
TO: DOCUMENTATION/

Files to move (keep):
├─ 🚀_COMMENCE_ICI.md → DOCUMENTATION/START_HERE.md
├─ README.md → DOCUMENTATION/README.md (update)
├─ CAHIER_DES_CHARGES_V1_MVP_FLEURS.md → DOCUMENTATION/SPECIFICATIONS.md
├─ PIPELINE_UNIFIED_ARCHITECTURE.md → DOCUMENTATION/ARCHITECTURE.md
├─ DEV_LOCAL_SETUP.md → DOCUMENTATION/SETUP.md
├─ DATA.md → DOCUMENTATION/DATA_SCHEMA.md
└─ ... (others core docs)
```

### **STEP 2: Delete from Root** (All debug/obsolete)
```
DELETE from root:
├─ All AUDIT_*.md (debug)
├─ All SESSION_*.md (old logs)
├─ All SPRINT_1_*.md (old phase)
├─ All *_REPORT.md (old phase)
├─ All FIX_*.md / fix-*.js (debug scripts)
├─ All deploy*.sh (old deploy)
├─ All reorganize*.ps1 (debug scripts)
├─ All restore*.ps1 (debug scripts)
├─ All QUICK_START_*.md (superseded)
├─ All INDEX_AUDIT*.md (debug)
├─ All VALIDATION_*.md except in PAGES
├─ All NEXT_ACTIONS*.md (superseded)
├─ All PLAN_ACTION*.md (superseded)
├─ DECISION_*.md (obsolete)
├─ PHILOSOPHIES_*.md (reference only)
└─ ... (50+ files total)
```

### **STEP 3: Delete from DOCUMENTATION/IN_DEV** (Move useful, delete rest)
```
DELETE from DOCUMENTATION/IN_DEV/:
├─ All AUDIT_*.md (~15)
├─ All SESSION_*.md (~10)
├─ All SPRINT_1_*.md (~10)
├─ All *_REPORT.md (~8)
├─ All INDEX_AUDIT*.md (~5)
├─ All VALIDATION_*.md (keep only in PAGES)
├─ All reorganize*.ps1
├─ All restore*.ps1
├─ NGINX_CACHE_FIX.md
├─ NODE_INSTALL_BLOCKER.md
├─ ACTION_ITEMS.md
├─ NEXT_ACTIONS*.md
└─ ... (~60 files total)

MOVE TO DOCUMENTATION/:
├─ 🚀_COMMENCE_ICI.md → START_HERE.md
├─ README.md
├─ CAHIER_DES_CHARGES_V1_MVP_FLEURS.md → SPECIFICATIONS.md
├─ PIPELINE_*.md (architecture docs)
├─ DEV_LOCAL_SETUP.md
├─ DATA.md → DATA_SCHEMA.md
└─ ... (~8 files)
```

### **STEP 4: Delete Scripts from Root** (All)
```
DELETE:
├─ fix-*.js (all)
├─ fix-*.ps1 (all)
├─ setup-dev*.sh
├─ setup-dev*.ps1
├─ deploy*.sh (keep ecosystem.config.cjs, deploy-vps.sh in scripts/)
├─ reorganize*.ps1 (all)
├─ restore*.ps1 (all)
├─ check-imports.js
├─ audit-validation-*.js
└─ ... (~20 scripts total)
```

### **STEP 5: Validate DOCUMENTATION/ Structure**
```
DOCUMENTATION/
├─ README.md (Updated: points to PAGES/)
├─ START_HERE.md (New: entry point)
├─ SETUP.md (From IN_DEV)
├─ SPECIFICATIONS.md (CDD reference)
├─ ARCHITECTURE.md (Pipeline + system)
├─ DATA_SCHEMA.md (Reference)
│
├─ PAGES/ (Already well-structured) ✅
│   ├─ INDEX.md
│   ├─ CREATE_REVIEWS/
│   │   ├─ FLEURS/
│   │   ├─ HASHS/
│   │   ├─ CONCENTRES/
│   │   └─ COMESTIBLES/
│   ├─ BIBLIOTHEQUE/
│   ├─ PROFILS/
│   └─ ...
│
└─ IN_DEV/ (Cleaned, minimal)
    └─ Only active Sprint planning docs
```

### **STEP 6: Move Root SPRINT_2_3 Docs to DOCUMENTATION/**
```
DOCUMENTATION/SPRINT_2_3/
├─ EXECUTIVE_SUMMARY_SPRINT_2_3.md
├─ ARCHITECTURE_GLOBALE_V2.md
├─ PLAN_ACCOUNT_PAGE_REFONTE.md
├─ PLAN_EXPORTMAKER_UNIFIEE.md
├─ PLAN_LIBRARY_COMPLETE.md
├─ PLAN_EXECUTION_FINAL.md
├─ SPRINT_2_GETTING_STARTED.md
├─ INDEX_DOCUMENTATION_SPRINT_2_3.md
├─ TLDR_SPRINT_2_3.md
└─ (All 9 docs organized)
```

---

## 📋 DELETE LIST (EXACT)

### **Root Level - DELETE these:**
```
AUDIT_STABILITE_COMPLET.md
AUDIT_FICHIERS_OBSOLETES.md (in IN_DEV too)
AUDIT_LIVRABLES_FINAUX.md
AUDIT_FLEURS_COMPLET.json
AUDIT_FLEURS_Q1_2024.md
AUDIT_FLEURS_RAPPORT.md
AUDIT_PIPELINE_SUMMARY.md
AUDIT_PIPELINE.md
AUDIT_VUE_GLOBALE_VISUELLE.md
audit-validation-fleurs.js
check-imports.js
CHECKLIST_PRE_SPRINT_1.md
CLEANUP.md
COMPONENT_MOVE_PLAN.md
CORRUPTION_REPORT.md
DASHBOARD_V1_MVP_STATUS.md (move to IN_DEV for archive)
DEBUT_LISEZ_MOI.txt
DECISION_EXPRESS_V1_MVP.md
DOCUMENT_DELIVERY_REPORT.md
FICHIERS_AUDIT_LOCALISATION.md
final-components-reorganize.ps1
final-pages-reorganize.ps1
fix-all-data-imports.ps1
fix-all-imports.ps1
fix-broken-quotes.ps1
fix-imports-complete.js
fix-imports-mega.js
fix-imports-v2.js
fix-imports.js
fix-nested-imports.js
fix-nginx-cache.sh
fix-root-component-imports.ps1
flatten-structure.ps1
LOCAL_DEV_CHECKLIST.md
move-remaining-files.ps1
reorganize-components.ps1
reorganize-pages.ps1
restore_corrupted_files.ps1
QUICK_REFERENCE.md (superseded by TLDR_SPRINT_2_3)
QUICK_REFERENCE_SPRINT1.md
QUICK_START_AUDIT_FLEURS.txt
QUICK_START_PHASE_1.md
SESSION_COMPLETE_VISUAL.md
SESSION_COMPLETION_SUMMARY.md
SESSION_FINAL_SUMMARY_JAN16.md
SESSION_REPORT_JAN16_2026.md
SESSION_REPORT_JAN16_CONTINUED.md
SESSION_REPORT_JAN16_PHASE2.md
SESSION_SUMMARY_SPRINT2_ANALYSIS.md
SPRINT_1_COMPLETE_STATUS_REPORT.md
SPRINT_1_DOCUMENTATION_INDEX.md
SPRINT_1_FINAL_SUMMARY.md
SPRINT_1_PART_1_2_INTEGRATION_GUIDE.md
SPRINT_1_QUICK_START_TESTING.md
SPRINT_1_SESSION_LOG.md
SPRINT_1_TASK_1_1_PERMISSIONS.md
SPRINT_1_VALIDATION_CHECKLIST.md

... and many more (50+ total)
```

### **DOCUMENTATION/IN_DEV/ - DELETE these:**
```
(Same files as above in IN_DEV)
+ All AUDIT_*.md (~15 files)
+ All SESSION_*.md (~10 files)
+ All SPRINT_1_*.md (~10 files)
+ All *_REPORT.md (~8 files)
+ All validation/audit checklists
+ All development logs
+ All session reports
+ NGINX_CACHE_FIX.md
+ NODE_INSTALL_BLOCKER.md
+ ... (~60 files)
```

---

## ✅ KEEP LIST (EXACT)

### **At Root:**
```
✅ PLAN_ACCOUNT_PAGE_REFONTE.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ PLAN_EXECUTION_FINAL.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ PLAN_EXPORTMAKER_UNIFIEE.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ PLAN_LIBRARY_COMPLETE.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ SPRINT_2_GETTING_STARTED.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ INDEX_DOCUMENTATION_SPRINT_2_3.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ EXECUTIVE_SUMMARY_SPRINT_2_3.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ TLDR_SPRINT_2_3.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ ARCHITECTURE_GLOBALE_V2.md → Move to DOCUMENTATION/SPRINT_2_3/
✅ MVP_V1_AUDIT_COMPLET.md → Move to DOCUMENTATION/REFERENCE/ (for context)

✅ ecosystem.config.cjs (PM2)
✅ nginx-*.conf (Nginx config)
✅ deploy-vps.sh (Deployment)
✅ deploy.sh (Deployment)
✅ README.md (Update: point to DOCUMENTATION/)
✅ .env.example
✅ package.json
✅ .gitignore
✅ ... (core project files)
```

### **In DOCUMENTATION/**
```
✅ README.md (Updated - navigation hub)
✅ START_HERE.md (Main entry point)
✅ SETUP.md (Development setup)
✅ SPECIFICATIONS.md (CDD reference)
✅ ARCHITECTURE.md (System architecture)
✅ DATA_SCHEMA.md (Data reference)
│
✅ PAGES/ (Keep all - well structured)
│   ├─ All CREATE_REVIEWS/ docs
│   ├─ All BIBLIOTHEQUE/ docs
│   ├─ All PROFILS/ docs
│   └─ All other sections
│
✅ SPRINT_2_3/ (New folder)
│   ├─ EXECUTIVE_SUMMARY_SPRINT_2_3.md
│   ├─ ARCHITECTURE_GLOBALE_V2.md
│   ├─ PLAN_ACCOUNT_PAGE_REFONTE.md
│   ├─ PLAN_EXPORTMAKER_UNIFIEE.md
│   ├─ PLAN_LIBRARY_COMPLETE.md
│   ├─ PLAN_EXECUTION_FINAL.md
│   ├─ SPRINT_2_GETTING_STARTED.md
│   ├─ INDEX_DOCUMENTATION_SPRINT_2_3.md
│   └─ TLDR_SPRINT_2_3.md
│
✅ REFERENCE/ (Archive important context)
│   ├─ MVP_V1_AUDIT_COMPLET.md
│   ├─ PHASE_1_DOCUMENTATION.md (if exists)
│   └─ ... (historical docs)
│
└─ IN_DEV/ (Minimal - only active work)
    └─ (Empty or just temporary files)
```

---

## 🎬 EXECUTION STEPS

### **Step 0: Backup** (Safety)
```bash
# Create backup
cp -r DOCUMENTATION DOCUMENTATION.backup
cp -r . project.backup

# Or in PowerShell
Copy-Item -Path "DOCUMENTATION" -Destination "DOCUMENTATION.backup" -Recurse
```

### **Step 1: Create Folder Structure**
```bash
# Create new directories
mkdir -p DOCUMENTATION/SPRINT_2_3
mkdir -p DOCUMENTATION/REFERENCE
mkdir -p DOCUMENTATION/ARCHIVE
```

### **Step 2: Move SPRINT_2_3 Docs**
```bash
# Move these from root to DOCUMENTATION/SPRINT_2_3/
mv PLAN_ACCOUNT_PAGE_REFONTE.md DOCUMENTATION/SPRINT_2_3/
mv PLAN_EXECUTION_FINAL.md DOCUMENTATION/SPRINT_2_3/
# ... (all 9 docs)
```

### **Step 3: Move Core Docs to DOCUMENTATION/**
```bash
# From IN_DEV, move to DOCUMENTATION/
mv DOCUMENTATION/IN_DEV/🚀_COMMENCE_ICI.md DOCUMENTATION/START_HERE.md
mv DOCUMENTATION/IN_DEV/CAHIER_DES_CHARGES_V1_MVP_FLEURS.md DOCUMENTATION/SPECIFICATIONS.md
# ... (others)
```

### **Step 4: Delete Obsolete Root Files**
```bash
# Delete ~50 files (use script or manual)
rm AUDIT_*.md
rm SESSION_*.md
rm SPRINT_1_*.md
rm fix-*.js fix-*.ps1
rm *-reorganize.ps1
rm restore_*.ps1
# ... etc
```

### **Step 5: Delete Obsolete IN_DEV Files**
```bash
# Delete ~60 files from IN_DEV
rm DOCUMENTATION/IN_DEV/AUDIT_*.md
rm DOCUMENTATION/IN_DEV/SESSION_*.md
# ... etc
```

### **Step 6: Update README.md**
```markdown
# Reviews-Maker

## 📚 Documentation

- **[START_HERE](DOCUMENTATION/START_HERE.md)** - Entry point
- **[SETUP](DOCUMENTATION/SETUP.md)** - Development setup
- **[PAGES](DOCUMENTATION/PAGES/)** - Feature documentation
- **[SPRINT 2/3 Planning](DOCUMENTATION/SPRINT_2_3/)** - Current sprint
- **[Reference](DOCUMENTATION/REFERENCE/)** - Historical docs
```

---

## 📊 CLEANUP SUMMARY

### **Before**
```
Root: 99+ files (mostly debug)
DOCUMENTATION/IN_DEV: 91 files (mostly obsolete)
Scripts: ~20 debug/fix files
TOTAL: 200+ unnecessary files
```

### **After**
```
Root: ~30 files (clean, only essentials)
DOCUMENTATION: ~50 files (organized by section)
├─ Core: 6 files
├─ PAGES/: ~30 files (feature docs)
├─ SPRINT_2_3/: 9 files (planning)
└─ REFERENCE/: ~5 files (archive)
Scripts: 0 debug files (only deployment)
TOTAL: 80 files (clean, organized)
```

### **Reduction**
```
120+ files deleted
50+ files organized
Documentation clarity: 📈 MUCH IMPROVED
Development friction: 📉 REDUCED
```

---

## ✨ RESULT

✅ Clean root directory (only essential project files)  
✅ Organized DOCUMENTATION/ (by feature + sprint)  
✅ Preserved PAGES/ (already well-structured)  
✅ All useful docs preserved (moved, not deleted)  
✅ All debug/obsolete removed  
✅ Scripts cleaned (only deployment left)  

---

## 🔄 NEXT AFTER CLEANUP

1. ✅ Move SPRINT_2_3 docs to DOCUMENTATION/
2. ✅ Clean root & IN_DEV
3. 🔜 Update README navigation
4. 🔜 Ask for missing PAGES documentation
5. 🔜 Start SPRINT 2 with clean structure

---

**Status**: 📋 AUDIT COMPLETE - READY FOR CLEANUP

Ready to execute cleanup?
