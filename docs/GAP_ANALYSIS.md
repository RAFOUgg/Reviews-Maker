# 📊 Gap Analysis - État Actuel vs MVP Requis

**Date:** 7 décembre 2025  
**Version:** 1.0.0  

---

## 📋 Résumé Exécutif

Reviews-Maker possède déjà **une base solide** (React 18, Express, Prisma, Discord OAuth, CRUD reviews complet). Pour atteindre le MVP, il faut principalement :

1. **Étendre l'authentification** (4 providers OAuth manquants)
2. **Ajouter conformité légale** (RDR, âge, pays, RGPD)
3. **Implémenter abonnements** (Stripe, 4 plans, RBAC)
4. **Créer modération** (signalements, audit, bannissements)
5. **Internationaliser** (i18n FR/EN complet)
6. **Enrichir exports** (mode Orchard influenceur)

**Temps estimé:** 8-12 semaines avec 1 développeur full-stack à temps plein.

---

## ✅ Déjà en Place (État Actuel)

### Frontend React 18 ✅
| Fonctionnalité | État | Qualité |
|----------------|------|---------|
| React 18.3 + Vite 6.0 | ✅ | Excellent |
| React Router 6.28 | ✅ | Excellent |
| TailwindCSS 3.4 | ✅ | Excellent |
| Framer Motion 11.11 | ✅ | Excellent |
| Zustand 5.0 (state) | ✅ | Bon |
| Pages principales (Home, Library, Stats, Settings) | ✅ | Bon |
| Composants UI (Layout, Toast, ErrorBoundary) | ✅ | Bon |
| Hook `useAuth` (Discord) | ✅ | Basique |

### Backend Express + Prisma ✅
| Fonctionnalité | État | Qualité |
|----------------|------|---------|
| Express 4.18 | ✅ | Excellent |
| Prisma 5.7 + SQLite | ✅ | Excellent |
| Passport.js (Discord) | ✅ | Excellent |
| Sessions sécurisées (7 jours) | ✅ | Excellent |
| CRUD Reviews complet | ✅ | Excellent |
| Upload médias (Multer) | ✅ | Bon |
| Likes/Dislikes | ✅ | Excellent |
| Profils publics | ✅ | Bon |
| Stats basiques | ✅ | Basique |
| Templates export | ✅ | Basique |

### Modèles Prisma ✅
| Modèle | Champs Clés | État |
|--------|-------------|------|
| User | id, discordId, username, avatar, email | ✅ Complet |
| Session | sid, userId, expiresAt | ✅ Complet |
| Review | holderName, type, ratings, terpenes, effects, images, authorId | ✅ Très riche (150+ champs) |
| ReviewLike | reviewId, userId, isLike | ✅ Complet |
| Template | name, ownerId, config, thumbnail | ✅ Basique |

### Endpoints API ✅
| Endpoint | Méthode | État |
|----------|---------|------|
| `/api/auth/discord` | GET | ✅ |
| `/api/auth/discord/callback` | GET | ✅ |
| `/api/auth/me` | GET | ✅ |
| `/api/auth/logout` | POST | ✅ |
| `/api/reviews` | GET | ✅ Filtres riches |
| `/api/reviews/:id` | GET/PUT/DELETE | ✅ |
| `/api/reviews` | POST | ✅ Multipart |
| `/api/reviews/:id/like` | POST | ✅ |
| `/api/users/me/stats` | GET | ✅ Basique |
| `/api/users/:id/profile` | GET | ✅ |
| `/api/templates` | GET/POST/PUT/DELETE | ✅ |

---

## ❌ Gaps Critiques pour MVP

### 1. Authentification Multi-Providers ❌

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Discord OAuth | ✅ Implémenté | - |
| Google OAuth | ❌ Absent | **Bloquant** |
| Apple Sign In | ❌ Absent | **Bloquant** |
| Amazon Login | ❌ Absent | **Bloquant** |
| Facebook Login | ❌ Absent | **Bloquant** |
| Email backup | ❌ Absent | **Bloquant** |
| TOTP 2FA | ❌ Absent | Important |

**Impact:** Utilisateurs limités à Discord uniquement.  
**Effort:** 5-7 jours (configuration providers + strategies Passport + tests).

---

### 2. Conformité Légale & RDR ❌

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Bandeau RDR permanent | ❌ Absent | **Bloquant** |
| Vérification âge (18/21) | ❌ Absent | **Bloquant** |
| Vérification pays | ❌ Absent | **Bloquant** |
| Modal consentement | ❌ Absent | **Bloquant** |
| Mentions légales par pays | ❌ Absent | **Bloquant** |
| Export données RGPD | ❌ Absent | **Bloquant** |
| Suppression compte RGPD | ❌ Absent | **Bloquant** |

**Impact:** Non-conformité légale, risques juridiques.  
**Effort:** 7-10 jours (middleware légal + UI + DB fields + policies).

---

### 3. Abonnements & RBAC ❌

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Model Subscription | ❌ Absent | **Bloquant** |
| Intégration Stripe | ❌ Absent | **Bloquant** |
| 4 plans (free, influencer, producer, merchant) | ❌ Absent | **Bloquant** |
| Webhooks Stripe | ❌ Absent | **Bloquant** |
| RBAC (rôles User) | ❌ Absent | **Bloquant** |
| Model InfluencerProfile | ❌ Absent | Important |
| Model ProducerProfile | ❌ Absent | Important |
| Quotas par plan | ❌ Absent | Important |

**Impact:** Pas de monétisation, tous utilisateurs gratuits.  
**Effort:** 10-14 jours (Stripe setup + RBAC + models + tests).

---

### 4. Modération & Admin ❌

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Model Report | ❌ Absent | **Bloquant** |
| Model AuditLog | ❌ Absent | Important |
| Signalements reviews | ❌ Absent | **Bloquant** |
| Panel admin modération | ❌ Absent | **Bloquant** |
| Bannissement users | ❌ Absent | Important |
| Masquage reviews | ❌ Absent | Important |
| Suppression médias | ❌ Absent | Important |
| Journal audit | ❌ Absent | Important |

**Impact:** Impossible de modérer contenu illicite/spam.  
**Effort:** 7-10 jours (models + routes + UI admin).

---

### 5. Internationalisation (i18n) ❌

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| react-i18next | ❌ Absent | **Bloquant** |
| Traductions FR | ❌ Textes en dur | **Bloquant** |
| Traductions EN | ❌ Absent | **Bloquant** |
| Language switcher | ❌ Absent | Important |
| User.locale | ❌ Absent | Important |
| API errors i18n | ❌ Absent | Important |

**Impact:** Application monolingue française uniquement.  
**Effort:** 5-7 jours (setup i18n + extraction chaînes + traductions).

---

### 6. Exports Avancés ❌

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Templates basiques | ✅ Existant | Basique |
| Mode Orchard influenceur | ❌ Absent | Important |
| Presets Orchard | ❌ Absent | Important |
| Branding custom (logo, couleurs) | ❌ Absent | Important |
| Filigrane | ❌ Absent | Optionnel |
| Export PDF | ❌ Absent | Important |
| Export PNG | ⚠️ Partiel | Améliorer |

**Impact:** Exports simples, pas de différenciation influenceurs.  
**Effort:** 5-7 jours (UI customizer + presets + PDF generation).

---

### 7. Éditeur Reviews ⚠️

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Formulaires 4 types | ✅ Existant | À améliorer UX |
| Presets mobile | ❌ Absent | Important |
| Autosave brouillon | ❌ Absent | Important |
| Stepper validation | ❌ Absent | Important |
| Aperçu temps réel | ❌ Absent | Optionnel |

**Impact:** UX création lourde, risque perte données.  
**Effort:** 5-7 jours (refacto UI + autosave + presets).

---

### 8. Statistiques Personnelles ⚠️

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Endpoint `/me/stats` | ✅ Existant | Basique |
| Total reviews | ✅ | OK |
| Moyenne notes | ✅ | OK |
| Top 5 tags/effets | ❌ Absent | Important |
| Activité par période | ❌ Absent | Important |
| Export CSV stats | ❌ Absent | Optionnel |
| Graphiques UI | ❌ Absent | Important |

**Impact:** Stats très limitées, pas de visualisation.  
**Effort:** 3-5 jours (enrichir endpoint + UI graphiques).

---

### 9. Sécurité & Observabilité ⚠️

| Requis MVP | État Actuel | Gap |
|------------|-------------|-----|
| Helmet (CSP) | ❌ Absent | Important |
| CSRF protection | ❌ Absent | Important |
| Rate limiting | ❌ Absent | Important |
| Logs structurés | ❌ Absent | Important |
| Monitoring (Sentry) | ❌ Absent | Important |
| Métriques API | ❌ Absent | Optionnel |

**Impact:** Vulnérabilités potentielles, debugging difficile.  
**Effort:** 3-5 jours (middlewares + Winston + Sentry setup).

---

## 📊 Récapitulatif Priorisation

### 🔴 Bloquants MVP (Ne peut pas livrer sans)
1. **OAuth multi-providers** (5-7j)
2. **Légal & RDR** (7-10j)
3. **Stripe + RBAC** (10-14j)
4. **Modération** (7-10j)
5. **I18n FR/EN** (5-7j)

**Total bloquants:** ~34-48 jours (7-10 semaines)

### 🟡 Importants (Dégradent MVP si absent)
1. **Exports Orchard** (5-7j)
2. **Éditeur amélioré** (5-7j)
3. **Stats enrichies** (3-5j)
4. **Sécurité** (3-5j)

**Total importants:** ~16-24 jours (3-5 semaines)

### 🟢 Optionnels (Nice-to-have)
- Filigrane exports
- Aperçu temps réel éditeur
- Export CSV stats
- Métriques API avancées

---

## 🎯 Estimation Globale

### Scénario Optimal (1 dev full-stack expérimenté)
- **Bloquants:** 7 semaines
- **Importants:** 3 semaines
- **Buffer bugs/tests:** 2 semaines
- **Total:** **12 semaines**

### Scénario Réaliste (1 dev avec courbe apprentissage)
- **Bloquants:** 9 semaines
- **Importants:** 4 semaines
- **Buffer bugs/tests:** 3 semaines
- **Total:** **16 semaines** (4 mois)

### Scénario Accéléré (2 devs parallèles)
- **Bloquants:** 5 semaines (parallélisation auth/legal + stripe/moderation)
- **Importants:** 2 semaines
- **Buffer bugs/tests:** 1 semaine
- **Total:** **8 semaines**

---

## 🚀 Recommandations Stratégiques

### 1. Prioriser Conformité Légale
**Action:** Sprint 1-2 doit inclure RDR + âge/pays impérativement.  
**Raison:** Risques juridiques > fonctionnalités.

### 2. OAuth Stratégique
**Action:** Implémenter Google + Apple en priorité (80% utilisateurs), Amazon/Facebook phase 2.  
**Gain:** Livraison 3-4 jours plus rapide.

### 3. Stripe en Dernière Phase
**Action:** MVP peut démarrer en beta sans Stripe si conformité OK.  
**Gain:** Focus sur UX/légal d'abord, monétisation après validation produit.

### 4. i18n Architecture First
**Action:** Setup react-i18next dès Sprint 1, traductions progressives.  
**Gain:** Évite refacto massive en fin de projet.

### 5. Tests Automatisés Critiques
**Action:** E2E Playwright sur flows auth + création review + export dès Sprint 4.  
**Gain:** Détection régression rapide.

---

## 📋 Checklist Validation MVP

### Critères Minimaux Absolus
- [ ] ✅ Auth multi-providers (au moins Google + Discord)
- [ ] ✅ Bandeau RDR + vérification âge/pays
- [ ] ✅ Création reviews 4 types + médias
- [ ] ✅ Galerie publique + filtres
- [ ] ✅ Exports basiques PNG
- [ ] ✅ I18n FR/EN complet
- [ ] ✅ Modération signalements
- [ ] ✅ RGPD export/suppression données

### Critères Souhaitables
- [ ] 🟡 Stripe + 4 plans
- [ ] 🟡 Mode Orchard influenceur
- [ ] 🟡 Stats enrichies + graphiques
- [ ] 🟡 TOTP 2FA
- [ ] 🟡 Autosave éditeur
- [ ] 🟡 CSP + CSRF + rate limiting

### Critères Phase 2
- [ ] 🟢 Apple + Amazon + Facebook OAuth
- [ ] 🟢 Pipelines producteur
- [ ] 🟢 Connecteur Shopify
- [ ] 🟢 I18n ES/DE
- [ ] 🟢 Mind-map phénotypes

---

## 📞 Prochaines Actions Immédiates

### Semaine 1
1. Configurer OAuth Google (1j)
2. Créer middleware légal (2j)
3. Implémenter bandeau RDR (1j)
4. Setup react-i18next (1j)

### Semaine 2
1. Ajouter vérification âge/pays (2j)
2. Implémenter email backup auth (2j)
3. Traduire FR/EN existant (1j)

---

**Document créé par:** GitHub Copilot  
**Dernière révision:** 7 décembre 2025  
**Statut:** Draft v1.0 - À valider avec product owner
