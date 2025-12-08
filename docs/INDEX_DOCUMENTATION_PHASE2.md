# 📚 Index Documentation - Reviews-Maker

**Dernière mise à jour** : 7 décembre 2025  
**Version** : Phase 2 Complétée

---

## 🎯 Documents par Catégorie

### 📖 Guides de Démarrage
- **[COMMENCEZ_ICI.md](COMMENCEZ_ICI.md)** - Point d'entrée principal pour nouveaux développeurs
- **[DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)** - Installation et lancement rapide
- **[AI_DEV_GUIDE.md](AI_DEV_GUIDE.md)** - Guide spécifique pour développement par IA

### 🏗️ Architecture & Technique
- **[MVP_PLAN_TECHNIQUE.md](MVP_PLAN_TECHNIQUE.md)** - Plan technique complet du MVP (architecture, roadmap)
- **[ARCHITECTURE_THEMES_STRATEGY.md](ARCHITECTURE_THEMES_STRATEGY.md)** - Système de thèmes
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - Instructions globales du projet
- **[.github/instructions/vps.instructions.md](.github/instructions/vps.instructions.md)** - Workflow VPS et déploiement

### 📝 Documentation Phase 2 (OAuth & Accounts)
- **[PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md](PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md)** ⭐ - Rapport complet Phase 2
  - OAuth Discord/Google
  - Système de comptes (5 types)
  - Flux d'onboarding (Age → Consent → Account Type)
  - API 7 endpoints
  - Test suite HTML

### 🔍 Audits & Analyses
- **[AUDIT_QUALITE_CODE_2025-11-08.md](AUDIT_QUALITE_CODE_2025-11-08.md)** - Audit qualité code complet
- **[AUDIT_UX_COMPLET.md](AUDIT_UX_COMPLET.md)** - Audit UX/UI
- **[AUDIT_ORCHARD_MAKER_COMPLET.md](AUDIT_ORCHARD_MAKER_COMPLET.md)** - Audit mode Orchard
- **[FINAL_AUDIT_COMPLETE.md](FINAL_AUDIT_COMPLETE.md)** - Audit final global

### 🎨 Design & Thèmes
- **[CORRECTIF_THEMES_COMPLET.md](CORRECTIF_THEMES_COMPLET.md)** - Système de thèmes corrigé
- **[GUIDE_TEST_THEMES.md](GUIDE_TEST_THEMES.md)** - Tests thèmes
- **[APERCU_VISUAL_THEMES.md](APERCU_VISUAL_THEMES.md)** - Preview visuel thèmes
- **[HARMONISATION_COULEURS.md](HARMONISATION_COULEURS.md)** - Palette de couleurs

### 🔧 Correctifs & Améliorations
- **[CORRECTIFS_APPLIQUES.md](CORRECTIFS_APPLIQUES.md)** - Liste des correctifs appliqués
- **[AMELIORATIONS_UI_UX.md](AMELIORATIONS_UI_UX.md)** - Améliorations UI/UX
- **[HOTFIX_ORCHARD_CALCUL_NOTES.md](HOTFIX_ORCHARD_CALCUL_NOTES.md)** - Correctif calcul notes

### 🚀 Déploiement
- **[COMMANDES_DEPLOIEMENT.md](COMMANDES_DEPLOIEMENT.md)** - Commandes déploiement VPS
- **[DEPLOIEMENT_VPS_PROCEDURE.md](DEPLOIEMENT_VPS_PROCEDURE.md)** - Procédure complète déploiement
- **[deploy-vps.sh](deploy-vps.sh)** - Script déploiement automatisé
- **[deploy-quick.sh](deploy-quick.sh)** - Déploiement rapide

### 📊 Documentation API
- **[server-new/routes/](server-new/routes/)** - Routes API documentées (JSDoc)
  - `auth.js` - Authentification OAuth
  - `legal.js` - Vérification légale (âge, RDR)
  - `account.js` - Gestion des comptes utilisateurs
  - `reviews.js` - CRUD reviews
  - `users.js` - Profils utilisateurs
  - `templates.js` - Templates export

### 🧪 Tests
- **[test-phase2.html](test-phase2.html)** - Suite de test API interactive
- **[demo-filtrage-avance.html](demo-filtrage-avance.html)** - Démo filtrage
- **[GUIDE_TEST_LISIBILITE.md](GUIDE_TEST_LISIBILITE.md)** - Tests de lisibilité

### 📋 Changelog & Historique
- **[CHANGELOG.md](CHANGELOG.md)** - Journal des modifications
- **[COMMIT_MESSAGE.md](COMMIT_MESSAGE.md)** - Convention messages commit
- **[COMPLETE_SUMMARY.md](COMPLETE_SUMMARY.md)** - Résumé complet projet

---

## 🗺️ Parcours Recommandés

### Pour un Nouveau Développeur
1. [COMMENCEZ_ICI.md](COMMENCEZ_ICI.md)
2. [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)
3. [MVP_PLAN_TECHNIQUE.md](MVP_PLAN_TECHNIQUE.md)
4. [AI_DEV_GUIDE.md](AI_DEV_GUIDE.md)

### Pour Comprendre l'État Actuel (Phase 2)
1. [PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md](PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md) ⭐
2. [.github/copilot-instructions.md](.github/copilot-instructions.md)
3. [test-phase2.html](test-phase2.html) (ouvrir dans navigateur)
4. [server-new/routes/account.js](server-new/routes/account.js)

### Pour Déployer sur VPS
1. [.github/instructions/vps.instructions.md](.github/instructions/vps.instructions.md)
2. [DEPLOIEMENT_VPS_PROCEDURE.md](DEPLOIEMENT_VPS_PROCEDURE.md)
3. [COMMANDES_DEPLOIEMENT.md](COMMANDES_DEPLOIEMENT.md)
4. [deploy-vps.sh](deploy-vps.sh)

### Pour Comprendre le Design
1. [ARCHITECTURE_THEMES_STRATEGY.md](ARCHITECTURE_THEMES_STRATEGY.md)
2. [CORRECTIF_THEMES_COMPLET.md](CORRECTIF_THEMES_COMPLET.md)
3. [APERCU_VISUAL_THEMES.md](APERCU_VISUAL_THEMES.md)
4. [GUIDE_TEST_THEMES.md](GUIDE_TEST_THEMES.md)

---

## 📊 État du Projet

### ✅ Phases Complétées

#### Phase 1 - Fondations Légales & i18n (Novembre 2025)
- OAuth multi-providers (Discord, Google, Apple, Amazon, Facebook)
- Système légal RDR complet (bannière, âge, consentement)
- Internationalisation FR/EN (react-i18next)
- 31 fichiers créés

#### Phase 2 - Account System (Décembre 2025) ⭐ ACTUEL
- 5 types de comptes (consumer, influencer_basic/pro, producer, merchant)
- Backend : services/account.js (290 lignes) + routes/account.js (250 lignes)
- Frontend : OAuthButtons, AccountTypeSelector, useAuth étendu
- Flux onboarding : Age → Consent → Account Type → Dashboard
- Test suite interactive (test-phase2.html)

### 🚧 En Cours

#### Phase 3 - Stripe & Verification (Prévu Décembre 2025)
- Intégration Stripe pour subscriptions
- Producer verification workflow (upload documents)
- Settings page complète
- Google OAuth credentials configuration

### 📋 Backlog

#### Phase 4 - Features Avancées
- Orchard Mode Pro (analytics, branding avancé)
- Export Studio amélioré
- Modération avancée
- Notifications email

---

## 🔍 Recherche Rapide

### Par Fonctionnalité

| Fonctionnalité | Documentation | Code Backend | Code Frontend |
|----------------|---------------|--------------|---------------|
| **OAuth Login** | [PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md](PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md) | [routes/auth.js](server-new/routes/auth.js) | [OAuthButtons.jsx](client/src/components/auth/OAuthButtons.jsx) |
| **Age Verification** | [copilot-instructions.md](.github/copilot-instructions.md) | [routes/legal.js](server-new/routes/legal.js) | [AgeVerification.jsx](client/src/components/legal/AgeVerification.jsx) |
| **Account Types** | [PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md](PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md) | [services/account.js](server-new/services/account.js) | [AccountTypeSelector.jsx](client/src/components/account/AccountTypeSelector.jsx) |
| **RDR Consent** | [copilot-instructions.md](.github/copilot-instructions.md) | [routes/legal.js](server-new/routes/legal.js) | [ConsentModal.jsx](client/src/components/legal/ConsentModal.jsx) |
| **Thèmes** | [ARCHITECTURE_THEMES_STRATEGY.md](ARCHITECTURE_THEMES_STRATEGY.md) | N/A | [App.jsx](client/src/App.jsx) |
| **Reviews CRUD** | [AI_DEV_GUIDE.md](AI_DEV_GUIDE.md) | [routes/reviews.js](server-new/routes/reviews.js) | [CreateReviewPage.jsx](client/src/pages/CreateReviewPage.jsx) |

### Par Type de Problème

| Problème | Documents Utiles |
|----------|------------------|
| Erreur OAuth | [PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md](PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md), [routes/auth.js](server-new/routes/auth.js) |
| Problème de déploiement | [vps.instructions.md](.github/instructions/vps.instructions.md), [DEPLOIEMENT_VPS_PROCEDURE.md](DEPLOIEMENT_VPS_PROCEDURE.md) |
| UI/UX cassée | [AUDIT_UX_COMPLET.md](AUDIT_UX_COMPLET.md), [CORRECTIFS_APPLIQUES.md](CORRECTIFS_APPLIQUES.md) |
| Thème incorrect | [CORRECTIF_THEMES_COMPLET.md](CORRECTIF_THEMES_COMPLET.md), [GUIDE_TEST_THEMES.md](GUIDE_TEST_THEMES.md) |
| Base de données | [schema.prisma](server-new/prisma/schema.prisma), [AI_DEV_GUIDE.md](AI_DEV_GUIDE.md) |
| i18n manquant | [copilot-instructions.md](.github/copilot-instructions.md) (Phase 1) |

---

## 🆘 Support & Questions

### Où trouver de l'aide ?

1. **Problème de démarrage** → [DEMARRAGE_RAPIDE.md](DEMARRAGE_RAPIDE.md)
2. **Architecture floue** → [MVP_PLAN_TECHNIQUE.md](MVP_PLAN_TECHNIQUE.md) + [AI_DEV_GUIDE.md](AI_DEV_GUIDE.md)
3. **OAuth ne fonctionne pas** → [PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md](PHASE_2_OAUTH_ACCOUNTS_COMPLETE.md)
4. **Déploiement VPS** → [vps.instructions.md](.github/instructions/vps.instructions.md)
5. **Modifier le design** → [ARCHITECTURE_THEMES_STRATEGY.md](ARCHITECTURE_THEMES_STRATEGY.md)

### Outils de Diagnostic

- **Check Status** : `CHECK_STATUS.bat` (Windows)
- **Test API** : Ouvrir [test-phase2.html](test-phase2.html) dans navigateur
- **Logs Backend** : `Get-Content server-new\server.log -Tail 50 -Wait`
- **Database UI** : `cd server-new && npx prisma studio`

---

## 📞 Contact & Contribution

- **Repository** : Reviews-Maker
- **Branch principale** : `main`
- **Branch actuelle** : `feat/templates-backend`
- **Conventions** : Voir [COMMIT_MESSAGE.md](COMMIT_MESSAGE.md)

---

**Document généré automatiquement - Phase 2 Complétée**  
**Prochaine mise à jour** : Phase 3 (Stripe Integration)
