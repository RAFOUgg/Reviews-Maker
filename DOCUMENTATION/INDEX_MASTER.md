# 📚 DOCUMENTATION REVIEWS-MAKER - INDEX MASTER

**Dernière mise à jour** : 28 janvier 2026  
**État du projet** : 65% conforme au CDD  
**Prochaine action** : Implémenter gestion abonnements UI

---

## 🚀 COMMENCER ICI

| Votre rôle | Document à lire | Temps |
|-----------|-----------------|-------|
| **CEO/Manager** | [AUDIT_OPERATIONNEL_JANVIER_2026.md](../AUDIT_OPERATIONNEL_JANVIER_2026.md) | 10 min |
| **Tech Lead** | [IN_DEV/AUDIT_MVP_V1_JANVIER_2026.md](IN_DEV/AUDIT_MVP_V1_JANVIER_2026.md) | 45 min |
| **Développeur** | [IN_DEV/PLAN_ACTION_IMMEDIATE_PRIORITY.md](IN_DEV/PLAN_ACTION_IMMEDIATE_PRIORITY.md) | 30 min |
| **QA** | [IN_DEV/INCOHÉRENCES_DOCS_CODE_DETAILS.md](IN_DEV/INCOHÉRENCES_DOCS_CODE_DETAILS.md) | 30 min |

---

## 📂 STRUCTURE DOCUMENTATION

```
DOCUMENTATION/
│
├── 📋 INDEX_MASTER.md .............. CE FICHIER (point d'entrée)
├── 📋 DATA.md ...................... Specs Pipeline Culture (998 lignes)
├── 📋 PAGES_AUDIT_MISSING.md ....... Audit docs manquantes
│
├── 📁 PAGES/ ....................... SPECS FONCTIONNELLES
│   ├── INDEX.md .................... Hub navigation pages
│   ├── PERMISSIONS.md .............. Matrice 3 tiers × 20+ features
│   ├── SYSTEMES_GLOBAUX.md ......... Architecture Export, Auth, DB
│   ├── DONNEES_SCHEMAS.md .......... Référence modèles données
│   │
│   ├── 📁 CREATE_REVIEWS/ .......... Specs création reviews
│   │   ├── FLEURS/ ................. 9 sections complètes (478 lignes)
│   │   ├── HASHS/ .................. Partiellement documenté
│   │   ├── CONCENTRES/ ............. Partiellement documenté
│   │   ├── COMESTIBLES/ ............ Partiellement documenté
│   │   └── PIPELINE_SYSTEME/ ....... Architecture pipelines
│   │
│   ├── 📁 BIBLIOTHEQUE/ ............ Specs bibliothèque
│   ├── 📁 PROFILS/ ................. Specs page compte (312 lignes)
│   ├── 📁 Home/ .................... Specs page accueil
│   └── 📁 PANNEAU_ADMIN/ ........... Specs admin panel
│
└── 📁 IN_DEV/ ...................... AUDITS & PLANS D'ACTION
    ├── 🚀_COMMENCE_ICI.md .......... Guide lecture rapide
    ├── 00_CONCLUSION_AUDIT_FINAL.md  Verdict final (17/01/2026)
    ├── AUDIT_MVP_V1_JANVIER_2026.md  Audit détaillé complet
    ├── PLAN_ACTION_IMMEDIATE*.md ... Code snippets prêts
    └── ... (60+ fichiers historiques)
```

---

## 📊 ÉTAT CONFORMITÉ PAR MODULE

### Création Reviews
| Module | Specs (lignes) | Code | Conformité |
|--------|----------------|------|------------|
| Fleurs | 478 | ✅ | 80% |
| Hash | ~200 | ⚠️ | 67% |
| Concentrés | ~200 | ⚠️ | 47% |
| Comestibles | ~100 | ⚠️ | 50% |

### Systèmes
| Module | Specs (lignes) | Code | Conformité |
|--------|----------------|------|------------|
| Export Maker | 371 | ⚠️ | 60% |
| Profils/Account | 312 | ❌ | **15%** |
| Permissions | 226 | ❌ | **40%** |
| Bibliothèque | ~200 | ⚠️ | 50% |
| Admin Panel | ~100 | ⚠️ | 73% |

---

## 🔴 PRIORITÉS IMMÉDIATES

### P0 - Bloquant Production (Cette semaine)
1. **Onglet Abonnement dans AccountPage**
   - Afficher type de compte actuel
   - Afficher dates début/fin/renouvellement
   - Bouton upgrade/downgrade

2. **Modal Upgrade avec tarifs**
   - Afficher les 3 tiers avec prix
   - Comparaison features
   - Bouton vers paiement Stripe

3. **Hook useAccountFeatures**
   - Vérifier permissions par tier
   - Retourner features accessibles
   - Gating automatique des sections

### P1 - Important (Semaine prochaine)
4. Stats différenciées par tier
5. Restrictions export par tier
6. Dashboard Producteur/Influenceur

### P2 - Amélioration (Backlog)
7. Export PDF/SVG/CSV complets
8. Admin Panel dark theme
9. Galerie publique avancée

---

## 🔗 LIENS RAPIDES

### Code Source
- Frontend : `client/src/`
- Backend : `server-new/`
- Schéma DB : `server-new/prisma/schema.prisma`

### Fichiers Clés à Modifier
- `client/src/pages/account/AccountPage.jsx`
- `client/src/hooks/useAccountType.js`
- `client/src/components/account/FeatureGate.jsx`
- `server-new/routes/account.js`

### Données Statiques
- `data/aromas.json`
- `data/effects.json`
- `data/tastes.json`
- `data/terpenes.json`

---

## 📝 HISTORIQUE AUDITS

| Date | Fichier | Conclusion |
|------|---------|------------|
| 28/01/2026 | AUDIT_OPERATIONNEL_JANVIER_2026.md | 65% - 3 blockers |
| 17/01/2026 | IN_DEV/00_CONCLUSION_AUDIT_FINAL.md | 65% - Plan 5 jours |
| 16/01/2026 | IN_DEV/SESSION_REPORT_JAN16*.md | Sprint 1 complet |

---

*Ce fichier est le point d'entrée unique pour naviguer la documentation.*
