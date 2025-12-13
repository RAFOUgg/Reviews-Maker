# 🤖 CLAUDE - Plan de travail autonome
# Reviews-Maker MVP - Développement complet
# Dernière mise à jour : 13/12/2024 22:30

## 🎯 MISSION PRINCIPALE
Implémenter TOUTES les fonctionnalités MVP du cahier des charges CLAUDE.md
de manière autonome, professionnelle et testée.

---

## ✅ PHASE 1 - DESIGN SYSTEM (TERMINÉE)
- [x] ThemeStore avec 6 thèmes
- [x] Composants Liquid Glass (Button, Modal, Card, Input)
- [x] ThemeSwitcher dans navbar
- [x] LoginPage refonte complète
- [x] Variables CSS thématiques
- [x] Configuration accountFeatures
- [x] Documentation MVP

**Status** : ✅ DÉPLOYÉ

---

## 🔨 PHASE 2 - PIPELINES SYSTÈME (EN COURS)

### Priorité 1 : Pipeline Culture
**Objectif** : Système de saisie structurée pour tracer la culture de fleurs

#### Tâches Backend :
- [ ] Créer schéma Prisma `CulturePipeline`
- [ ] Routes API : POST/GET/PUT/DELETE `/api/pipelines/culture`
- [ ] Validation données par étape
- [ ] Relations avec Review (1-to-1)

#### Tâches Frontend :
- [ ] Composant `TimelineGrid.jsx` (style GitHub contributions)
- [ ] Composant `CulturePipelineForm.jsx`
- [ ] Composant `PipelineStepModal.jsx` (saisie par étape)
- [ ] Intégration dans `CreateFlowerReview.jsx`
- [ ] Store Zustand `pipelineStore.js`

#### Données à gérer :
- Configuration : intervalles (jours/semaines/phases), dates début/fin
- Étapes modifiables : substrat, irrigation, engrais, lumière, environnement, palissage
- Timeline visuelle avec 365 cases maximum
- Édition inline des données

**Durée estimée** : 6-8 heures

---

### Priorité 2 : Pipeline Curing/Maturation
**Objectif** : Tracer l'évolution post-récolte

#### Tâches Backend :
- [ ] Schéma Prisma `CuringPipeline`
- [ ] Routes API `/api/pipelines/curing`

#### Tâches Frontend :
- [ ] Composant `CuringTimelineGrid.jsx`
- [ ] Formulaire de configuration (température, humidité, récipient)
- [ ] Modification tests (visuel, odeurs, goûts, effets) par étape

**Durée estimée** : 4-5 heures

---

## 🎨 PHASE 3 - EXPORTS AVANCÉS

### Priorité 1 : Templates Système
**Objectif** : Générer exports PNG/PDF selon templates

#### Tâches Backend :
- [ ] Route `/api/export/render` (génération images)
- [ ] Service `exportService.js` (HTML → Canvas → PNG/PDF)
- [ ] Gestion qualité selon type compte

#### Tâches Frontend :
- [ ] Templates React :
  - [ ] `CompactTemplate.jsx` (format 1:1)
  - [ ] `DetailedTemplate.jsx` (formats 1:1, 16:9, A4)
  - [ ] `CompleteTemplate.jsx` (multi-page)
  - [ ] `SocialTemplate.jsx` (format 9:16 stories)
- [ ] Composant `TemplateSelector.jsx`
- [ ] Composant `ExportModal.jsx` avec preview
- [ ] Bouton export dans `ReviewDetailPage.jsx`

**Durée estimée** : 8-10 heures

---

### Priorité 2 : Drag & Drop Personnalisation (Producteurs)
**Objectif** : Canvas personnalisé pour producteurs

#### Tâches Frontend :
- [ ] Composant `CustomCanvasEditor.jsx` (react-dnd)
- [ ] Zones droppables configurables
- [ ] Sauvegarde layout personnalisé
- [ ] Bibliothèque templates utilisateur

**Durée estimée** : 6-8 heures

---

## 🔐 PHASE 4 - AUTHENTIFICATION 2FA

### Priorité 1 : TOTP (Google Authenticator)
**Objectif** : Double authentification fonctionnelle

#### Tâches Backend :
- [ ] Route POST `/api/auth/2fa/enable` (génère QR + secret)
- [ ] Route POST `/api/auth/2fa/verify` (valide code TOTP)
- [ ] Route POST `/api/auth/2fa/disable`
- [ ] Route GET `/api/auth/2fa/backup-codes`
- [ ] Middleware `require2FA.js`

#### Tâches Frontend :
- [ ] Page `SettingsSecurityPage.jsx`
- [ ] Composant `Enable2FAModal.jsx` (affiche QR Code)
- [ ] Composant `Verify2FAModal.jsx` (input 6 digits)
- [ ] Composant `BackupCodesModal.jsx`
- [ ] Intégration au login (vérif si 2FA activé)

**Durée estimée** : 4-5 heures

---

### Priorité 2 : Gestion Sessions
**Objectif** : Voir et déconnecter les appareils actifs

#### Tâches Backend :
- [ ] Route GET `/api/auth/sessions`
- [ ] Route DELETE `/api/auth/sessions/:id`
- [ ] Schéma Prisma `ActiveSession` (device, IP, lastActivity)

#### Tâches Frontend :
- [ ] Composant `ActiveSessionsList.jsx`
- [ ] Intégration dans `SettingsSecurityPage.jsx`

**Durée estimée** : 3-4 heures

---

## 📋 PHASE 5 - KYC & VÉRIFICATION ÂGE

### Priorité 1 : Vérification d'âge stricte
**Objectif** : Conformité légale robuste

#### Tâches Backend :
- [ ] Route POST `/api/kyc/verify-age` (avec date de naissance)
- [ ] Validation âge selon pays (>18 ou >21)
- [ ] Disclaimer RDR dynamique par pays

#### Tâches Frontend :
- [ ] Refonte `AgeVerificationModal.jsx` (plus stricte)
- [ ] Sélecteur pays avec flags
- [ ] Affichage disclaimer adapté au pays
- [ ] Blocage si âge insuffisant

**Durée estimée** : 3-4 heures

---

### Priorité 2 : Upload pièce d'identité (Producteurs/Influenceurs)
**Objectif** : KYC manuel ou via service tiers

#### Tâches Backend :
- [ ] Route POST `/api/kyc/upload-document` (Multer)
- [ ] Stockage sécurisé (hors webroot)
- [ ] Route GET `/api/kyc/status`
- [ ] Panel admin pour validation manuelle

#### Tâches Frontend :
- [ ] Composant `KYCUploadForm.jsx`
- [ ] Preview document avant envoi
- [ ] Status KYC dans profil

**Durée estimée** : 4-5 heures

---

## 🌐 PHASE 6 - GALERIE PUBLIQUE

### Priorité 1 : Reviews publiques avec interactions
**Objectif** : Galerie sociale avec likes/comments

#### Tâches Backend :
- [ ] Route GET `/api/gallery` (reviews publiques)
- [ ] Routes likes : POST `/api/reviews/:id/like`, DELETE
- [ ] Routes comments : GET/POST/DELETE `/api/reviews/:id/comments`
- [ ] Système de modération (signalement)

#### Tâches Frontend :
- [ ] Page `GalleryPage.jsx` (grille de reviews)
- [ ] Composant `ReviewCard.jsx` amélioré (likes, commentaires)
- [ ] Composant `CommentSection.jsx`
- [ ] Filtres avancés (type, notes, date)

**Durée estimée** : 6-8 heures

---

## 📊 PHASE 7 - STATISTIQUES AVANCÉES

### Priorité 1 : Dashboard Producteurs/Influenceurs
**Objectif** : Analytics détaillées

#### Tâches Backend :
- [ ] Route GET `/api/stats/user` (agrégations)
- [ ] Calculs : vues, engagements, exports, tendances

#### Tâches Frontend :
- [ ] Refonte `StatsPage.jsx`
- [ ] Graphiques : Chart.js ou Recharts
- [ ] Export stats en CSV/PDF

**Durée estimée** : 5-6 heures

---

## 🧬 PHASE 8 - GÉNÉTIQUE CANVAS (Producteurs uniquement)

### Priorité 1 : Arbre généalogique cultivars
**Objectif** : Visualisation relations parents/enfants

#### Tâches Backend :
- [ ] Schéma Prisma `Cultivar` avec relations self-referencing
- [ ] Routes CRUD cultivars
- [ ] Endpoint génération arbre JSON

#### Tâches Frontend :
- [ ] Composant `GeneticsCanvas.jsx` (React Flow ou D3.js)
- [ ] Drag & drop cultivars
- [ ] Création relations visuelles
- [ ] Export canvas en PNG

**Durée estimée** : 8-10 heures

---

## 📱 PHASE 9 - PWA MOBILE

### Priorité 1 : Progressive Web App
**Objectif** : Installation sur mobile

#### Tâches :
- [ ] `manifest.json` complet
- [ ] Service Worker pour offline
- [ ] Icônes toutes tailles
- [ ] Optimisation tactile (boutons plus grands)
- [ ] Tests iOS/Android

**Durée estimée** : 4-5 heures

---

## 🔄 WORKFLOW AUTONOME

### Étapes pour chaque fonctionnalité :

1. **Implémenter Backend**
   - Créer schémas Prisma si nécessaire
   - Générer migration : `npx prisma migrate dev`
   - Créer routes API
   - Tester avec curl/Postman

2. **Implémenter Frontend**
   - Créer composants React
   - Intégrer dans pages existantes
   - Tester dans navigateur

3. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: [description]"
   git push origin feat/mvp-v1
   ```

4. **Build & Test**
   ```bash
   cd client && npm run build
   ```

5. **Déployer si stable**
   ```bash
   bash deploy-mvp.sh
   ```

---

## 📝 CHECKLIST AVANT CHAQUE COMMIT

- [ ] Code compilé sans erreur
- [ ] Pas de console.log inutiles
- [ ] Variables CSS utilisées (pas de couleurs hardcodées)
- [ ] Composants responsive testés
- [ ] Gestion erreurs implémentée
- [ ] Types de comptes respectés (permissions)

---

## 🎯 OBJECTIFS QUOTIDIENS

**Jour 1 (aujourd'hui 13/12)** :
- ✅ Phase 1 Design System (FAIT)
- 🔨 Démarrer Phase 2 Pipelines

**Jour 2** :
- Terminer Phase 2 Pipelines
- Démarrer Phase 3 Exports

**Jour 3** :
- Terminer Phase 3 Exports
- Phase 4 2FA

**Jour 4** :
- Phase 5 KYC
- Phase 6 Galerie (début)

**Jour 5** :
- Terminer Phase 6
- Phase 7 Stats
- Phase 8 Génétique (début)

**Jour 6** :
- Terminer Phase 8
- Phase 9 PWA
- Tests finaux

**Jour 7** :
- Debugging
- Optimisations
- Documentation finale

---

## 🚨 RÈGLES IMPORTANTES

1. **Commit fréquemment** : Après chaque fonctionnalité terminée
2. **Tester localement** avant de push
3. **Déployer** seulement si tout fonctionne
4. **Documenter** : README-MVP.md à jour
5. **Respecter le cahier des charges** CLAUDE.md
6. **Code propre** : Pas de code mort, commentaires utiles uniquement

---

## 📞 NOTIFICATIONS AU USER

Me notifier (via commit message détaillé) quand :
- ✅ Phase complétée (avec captures d'écran si possible)
- ⚠️ Blocage technique rencontré
- 🚀 Déploiement effectué
- 🐛 Bug critique découvert

---

## 🎉 OBJECTIF FINAL

**Application complète et fonctionnelle avec :**
- ✅ Design moderne et cohérent (6 thèmes)
- ✅ Authentification robuste (Email, OAuth2, 2FA)
- ✅ Pipelines de traçabilité complets
- ✅ Exports professionnels multi-formats
- ✅ Galerie publique sociale
- ✅ Stats avancées
- ✅ Génétique pour producteurs
- ✅ PWA mobile-ready
- ✅ KYC & compliance légale

**Délai MVP complet : 7 jours max**

---

**🤖 Claude, tu peux maintenant travailler en autonomie. Bonne chance ! 🚀**
