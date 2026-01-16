# 📖 GUIDE DE LECTURE - CAHIER DES CHARGES FLEURS V1 MVP

**Durée totale de lecture**: 1-2 heures  
**Audience**: Tous membres équipe  
**Format**: Simple et structuré

---

## 🎯 LES 3 POINTS CLÉS À RETENIR

Si vous n'avez que **5 minutes**, retenez ceci:

### 1️⃣ **On construit quoi?**
Un système pour documenter des revues de fleur cannabis avec:
- Création review (10 sections remplies)
- Tracking culture via pipeline (jour/semaine/phase)
- Arbre généalogique PhenoHunt (pour producteurs)
- Export en PNG/PDF/JSON
- Galerie publique pour partager

### 2️⃣ **Différences par compte**:
- **Amateur** (gratuit): Sections 1-8, export PNG/PDF basique
- **Producteur** ($29.99/mois): Tout accès, tous exports, pipeline complet
- **Influenceur** ($15.99/mois): Sections 1-8, export social 9:16

### 3️⃣ **Timeline V1 MVP**:
**3-4 semaines**, 2-3 devs, puis déployer les 3 autres types

---

## 📚 CHEMIN DE LECTURE RECOMMANDÉ

### **Pour Product Manager / Décideur** (20 min)

```
1. Cette page (5 min)
2. Section "VISION GÉNÉRALE" (5 min)
3. Section "ARCHITECTURE GÉNÉRALE" (5 min)
4. Section "DÉFINITION V1 MVP COMPLÈTE" (5 min)
✅ Vous comprenez: QUOI on construit, POUR QUI, QUAND
```

---

### **Pour Tech Lead / Architect** (1 heure)

```
1. Cette page (5 min)
2. Section "VISION GÉNÉRALE" (5 min)
3. Section "ARCHITECTURE GÉNÉRALE" (5 min)
4. Section "STRUCTURE DÉTAILLÉE" (30 min)
   └─ Lire: Toutes 10 sections
5. Section "SYSTÈME PERMISSIONS" (10 min)
6. Section "STOCKAGE & PERSISTANCE" (5 min)
✅ Vous comprenez: Architecture tech, data models, workflows
```

---

### **Pour Frontend Developer** (1.5 heures)

```
1. Cette page (5 min)
2. Section "VISION GÉNÉRALE" (5 min)
3. Section "STRUCTURE DÉTAILLÉE" (40 min)
   └─ Chaque section = 1 formulaire à coder
4. Section "EXPORT & RENDU" (20 min)
5. Section "GALERIE PUBLIQUE" (10 min)
✅ Vous comprenez: Components à créer, inputs, UI flow
```

---

### **Pour Backend Developer** (1.5 heures)

```
1. Cette page (5 min)
2. Section "VISION GÉNÉRALE" (5 min)
3. Section "STOCKAGE & PERSISTANCE" (30 min)
   └─ Lire: Tables, schemas, relations
4. Section "STRUCTURE DÉTAILLÉE" (30 min)
   └─ Focus: Les 9 groupes Pipeline, données complexes
5. Section "SYSTÈME PERMISSIONS" (15 min)
6. Section "WORKFLOWS PRINCIPAUX" (10 min)
✅ Vous comprenez: DB models, APIs, validation rules
```

---

### **Pour QA / Tester** (1 heure)

```
1. Cette page (5 min)
2. Section "VISION GÉNÉRALE" (5 min)
3. Section "WORKFLOWS PRINCIPAUX" (20 min)
4. Section "SYSTÈME PERMISSIONS" (15 min)
5. Section "DÉFINITION V1 MVP COMPLÈTE" (15 min)
✅ Vous comprenez: Test scenarios, permissions to test, validation
```

---

## 🔑 TERMES CLÉ EXPLIQUÉS

### **Review**
Une fiche technique complète d'une fleur. Contient toutes les données de la création à la consommation.

### **Pipeline Culture**
Système de suivi de la culture en 3 modes:
- **Jours**: 365 carrés, 1 par jour
- **Semaines**: S1 à S52
- **Phases**: 12 phases (Graine → Floraison-fin)

Chaque jour/semaine/phase contient les données des 9 groupes (Espace, Substrat, etc.).

### **PhenoHunt**
Arbre généalogique de cultivars. Montre relations parents → enfants. Permet tracer lignées.

### **Preset**
Configuration réutilisable. Ex: "Setup LED 3×3m" = configuration Espace reutilisable dans plusieurs reviews.

### **Template Export**
Format d'export prédéfini. Ex: "Compact" = synthétique, "Complète" = détaillé.

### **Galerie Publique**
Espace de partage. Les users peuvent rendre leurs reviews publiques, autres users les voir, liker, commenter.

### **Permissions**
Niveaux d'accès basés sur type de compte (Amateur/Producteur/Influenceur).

---

## 📊 STRUCTURE VUE D'ENSEMBLE

```
UTILISATEUR CRÉE REVIEW
    ↓
REMPLIT 10 SECTIONS
    ├─ 1: Infos (nom, photos, cultivar)
    ├─ 2: Génétiques + PhenoHunt (si Producteur)
    ├─ 3: Pipeline Culture (suivi cultivation)
    ├─ 4: Analytiques (THC/CBD)
    ├─ 5-8: Évaluations (Visuel, Odeurs, Goûts, Effets)
    ├─ 9: Pipeline Curing (post-récolte)
    └─ 10: Expérience (détails consommation)
    ↓
SAUVEGARDE EN BIBLIOTHÈQUE
    ├─ Accès privé
    ├─ Peut dupliquer
    ├─ Peut partager publiquement
    └─ Peut exporter
    ↓
OPTION: EXPORTER
    ├─ Format: PNG/PDF/JSON/CSV/HTML
    ├─ Template: Compact/Détaillé/Complète/Influenceur
    └─ Qualité: Standard/Haute/Impression
    ↓
OPTION: PARTAGER EN GALERIE
    ├─ URL publique
    ├─ Autres users voient
    ├─ Peuvent liker/commenter
    └─ Stats d'engagement
```

---

## 🔍 FOCUS AREAS PAR RÔLE

### **Managers:**
- Valider vision & timeline
- Approuver ressources
- Tracker progression

### **Tech Lead:**
- Valider architecture
- Créer sprint plan
- Assigner tickets

### **Devs Frontend:**
- Implémenter 10 formulaires
- Componente réutilisables
- Export UI + prévisualisation

### **Devs Backend:**
- Modèles Prisma
- APIs CRUD
- Validation rules

### **QA:**
- Test chaque section
- Test permissions
- Test workflows

---

## ⚡ QUICK FACTS

| Aspect | Detail |
|--------|--------|
| **Type produit** | Fleurs (cannabis) |
| **Sections** | 10 (Infos → Curing) |
| **Comptes** | 3 types (Amateur/Producteur/Influenceur) |
| **Pipeline modes** | 3 (Jours/Semaines/Phases) |
| **Groupes données** | 9 (Espace, Substrat, etc.) |
| **Export formats** | 5 (PNG/PDF/JSON/CSV/HTML) |
| **Templates export** | 4 (+Custom Producteur) |
| **Galerie** | Publique + interactions |
| **Bibliothèque** | Revues + Presets + Cultivars + Arbres |
| **Timeline V1** | 3-4 semaines |
| **Ressources** | 2-3 devs |
| **Après V1** | Hash, Concentrés, Comestibles |

---

## 🚀 ÉTAPES SUIVANTES

1. **Approuver** ce cahier des charges
2. **Distribuer** à l'équipe
3. **Chacun lit** sa section
4. **Tech lead** crée sprint plan
5. **Démarrer** développement

---

## ❓ QUESTIONS FRÉQUENTES

**Q: La V1 est vraiment "MVP"?**  
A: Oui. Minimaliste mais complet. Toutes les features essentielles pour le type Fleurs. Pas de features "nice-to-have".

**Q: Pourquoi 3-4 semaines?**  
A: 2 semaines pipeline + 1 semaine export + 1 semaine galerie/permissions.

**Q: Amateur peut faire quoi?**  
A: Créer reviews (8 sections), exporter PNG/PDF format Compact. Voilà.

**Q: Producteur justifie le prix 29.99€?**  
A: Pipeline complet (9 groupes), PhenoHunt, tous exports, analytics. Oui.

**Q: Influenceur différent de Producteur?**  
A: Oui. Social-first. Pas pipeline complexe. Format 9:16 Stories.

**Q: Qu'après V1?**  
A: Même architecture pour Hash, Concentrés, Comestibles. 2-3 semaines chacun.

---

## 📋 CHECKLIST ÉQUIPE

- [ ] Manager: Approuvé plan + ressources
- [ ] Tech lead: Validé architecture
- [ ] Devs: Lus sections correspondantes
- [ ] QA: Créé test plan initial
- [ ] Tous: Questions clarifiées
- [ ] Go: Démarrage développement

---

**Fin du guide**

➡️ **Prochaine étape**: Lire section correspondant à votre rôle dans le cahier des charges complet.

Durée totale: 1-2 heures par rôle  
Confiance: ✅ 100% clair après lecture
