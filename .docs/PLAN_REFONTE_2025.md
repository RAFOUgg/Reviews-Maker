# PLAN DE REFONTE REVIEWS-MAKER 2025
**Date de création** : 12 décembre 2025  
**Branche de travail** : feat/templates-backend → main (après validation)  
**Objectif** : Conformité complète aux cahiers des charges avec déploiement progressif

---

## 📋 PHASE 1 : SYSTÈME DE COMPTES & AUTHENTIFICATION (Priorité HAUTE)

### 1.1 Interface de Choix de Compte Stylisée ✨
**Fichiers** : `client/src/pages/AccountChoicePage.jsx`

**Actions** :
- [ ] Refonte UI complète Apple-like avec liquid glass
- [ ] Affichage clair des 3 types : Amateur (gratuit), Influenceur (15.99€/mois), Producteur (29.99€/mois)
- [ ] Détails des fonctionnalités par type avec comparaison visuelle
- [ ] Animations fluides et responsive (mobile/tablette/desktop)
- [ ] Retirer le mode "beta_tester" uniquement et basculer sur les vrais types
- [ ] Ajouter disclaimers légaux selon type choisi

**Spécifications UI** :
```jsx
// Amateur (Consumer)
- Accès sections : Info générale, Visuel, Curing, Odeurs, Goûts, Effets
- Templates : Compact, Détaillé, Complète (formats imposés)
- Export : PNG/JPEG/PDF qualité moyenne
- Personnalisation limitée (thèmes, couleurs)

// Influenceur (15.99€/mois)
- Accès à tous les aperçus et rendus détaillés
- Drag & drop de contenus
- Export haute qualité : PNG/JPEG/SVG/PDF 300dpi
- Templates avancés

// Producteur (29.99€/mois)
- Accès complet + PipeLine configurable
- Templates personnalisés avec drag & drop
- Export : PNG/JPEG/PDF/SVG/CSV/JSON/HTML haute qualité
- Polices custom, filigranes, agencement complet
```

---

### 1.2 Vérification d'Âge & Conformité Légale 🔞
**Fichiers** : `server-new/routes/legal.js`, `server-new/prisma/schema.prisma`

**Actions** :
- [ ] Système de vérification d'âge (18/21 ans selon pays) à l'inscription
- [ ] Collecte date de naissance + validation
- [ ] Disclaimer RDR adapté au pays (détection IP/locale)
- [ ] eKYC optionnel pour Producteurs/Influenceurs (upload pièce d'identité sécurisé)
- [ ] Stockage sécurisé des documents dans `db/kyc_documents/`
- [ ] Champs Prisma : `birthdate`, `country`, `region`, `legalAge`, `consentRDR`, `kycDocuments`
- [ ] Route `/api/legal/verify-age` et `/api/legal/upload-kyc`

**Conformité RGPD** :
- Chiffrement des documents sensibles
- Logs d'accès aux données KYC
- Suppression automatique après validation (ou conservation conforme 3 ans)

---

### 1.3 Données Utilisateurs selon Type de Compte 📝
**Fichiers** : `server-new/prisma/schema.prisma`, `server-new/routes/account.js`

**Actions** :
- [ ] Créer modèles `ProducerProfile` et `InfluencerProfile` (déjà existants, à enrichir)
- [ ] Champs Producteur : identité légale (SIRET/SIREN, TVA intracommunautaire, justificatifs activité)
- [ ] Champs Influenceur : réseaux sociaux, stats audience, portfolio
- [ ] Système de paiement (Stripe/PayPal) pour abonnements
- [ ] Gestion abonnements : création, renouvellement, annulation, historique
- [ ] Route `/api/account/upgrade` pour passer de Amateur → Influenceur/Producteur

**Nouveaux champs `ProducerProfile`** :
```prisma
model ProducerProfile {
  id                    String   @id @default(uuid())
  userId                String   @unique
  
  // Identité légale
  companyName           String?
  legalRepresentative   String?
  businessAddress       String?
  siret                 String?  @unique
  vatNumber             String?
  legalForm             String?  // SARL, SAS, Auto-entrepreneur
  businessLicense       String?  // Chemin vers justificatif
  
  // Coordonnées pro
  professionalEmail     String?
  professionalPhone     String?
  website               String?
  
  // Documents KYC
  idDocument            String?
  businessDocument      String?
  verifiedAt            DateTime?
  
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("producer_profiles")
}
```

---

### 1.4 Profils & Paramètres Utilisateur ⚙️
**Fichiers** : `client/src/pages/ProfilePage.jsx`, `client/src/pages/SettingsPage.jsx`

**Actions** :
- [ ] Refonte page profil avec affichage selon type (Amateur/Influenceur/Producteur)
- [ ] Affichage infos entreprise pour Producteurs (logo, nom, SIRET, site web)
- [ ] Gestion sessions actives (liste appareils, logout distant)
- [ ] Paramètres 2FA : activation/désactivation TOTP
- [ ] Préférences : langue, thème (Violet Lean, Vert Émeraude, Bleu Tahiti, Sakura)
- [ ] Gestion abonnement : changement plan, facturation, historique

**Interface Profil Producteur** :
- Logo entreprise
- Nom commercial
- Informations légales (SIRET, TVA, forme juridique)
- Lien site web et réseaux sociaux
- Statistiques de production (nombre de reviews, cultivars, exports)

---

## 📋 PHASE 2 : PIPELINES & SYSTÈME DE REVIEWS (Priorité HAUTE)

### 2.1 PipeLine Global (Culture, Extraction, Curing)
**Fichiers** : `server-new/routes/pipelines.js`, `client/src/components/pipeline/*`

**Actions** :
- [ ] Système de configuration de trame (seconde, minute, heure, jour, semaine, mois, phase)
- [ ] Modes : Journal (jours), Semaine (S1..Sn), Phase (12 phases prédéfinies)
- [ ] UI type heatmap GitHub commits (grille de cases cliquables)
- [ ] Chaque case : métadonnées (date, phase), mesures (temp, RH, PPFD), notes, images
- [ ] Champs custom par étape
- [ ] Historique d'édition et versioning
- [ ] Export timeline interactive (GIF, timelapse pour Producteurs)

**12 Phases Prédéfinies (Fleurs)** :
1. Graine
2. Germination
3. Plantule
4. Croissance-Début
5. Croissance-Milieu
6. Croissance-Fin
7. Stretch-Début
8. Stretch-Milieu
9. Floraison-Début
10. Floraison-Milieu
11. Floraison-Fin
12. Récolte

---

### 2.2 Système de Génétique (Canva de Sélection)
**Fichiers** : `client/src/pages/GeneticsLibrary.jsx`, `server-new/routes/cultivars.js`

**Actions** :
- [ ] Bibliothèque personnelle de cultivars
- [ ] Interface drag & drop pour création d'arbres généalogiques
- [ ] Relations parents/enfants entre cultivars
- [ ] Projets PhenoHunt (sélection, nomination)
- [ ] Export SVG/PNG de l'arbre pour inclusion dans reviews
- [ ] Réservé aux Producteurs uniquement

---

### 2.3 Création de Reviews par Type de Produit
**Fichiers** : `client/src/pages/Create*Review.jsx`, `server-new/routes/*-reviews.js`

**Actions** :
- [ ] Interfaces par type : Fleurs, Hash, Concentrés, Comestibles
- [ ] Saisie quasi non-textuelle (sélections, sliders, menus déroulants)
- [ ] Assistance contextuelle (tooltips, modales d'aide)
- [ ] Intégration PipeLines selon type
- [ ] Restrictions d'accès selon type de compte
- [ ] Validation des données et sauvegarde progressive

**Restrictions par Type de Compte** :
- Amateur : sections de base uniquement
- Influenceur : accès complet sauf PipeLine configurable
- Producteur : accès total + PipeLines avancés

---

## 📋 PHASE 3 : EXPORT MAKER & TEMPLATES (Priorité MOYENNE)

### 3.1 Système de Templates
**Fichiers** : `server-new/routes/templates.js`, `client/src/components/export/*`

**Actions** :
- [ ] Templates : Compact, Détaillé, Complète, Influenceur, Personnalisé
- [ ] Formats : 1:1, 16:9, 9:16, A4, SVG
- [ ] Options qualité : DPI, compression, filigrane, polices
- [ ] Pagination max 9 pages pour 1:1 et 16:9
- [ ] Drag & drop pour template Personnalisé (Producteurs/Influenceurs)
- [ ] Restrictions selon type de compte

**Fonctionnalités par Type** :
```
Amateur → Compact/Détaillé/Complète (formats imposés), PNG/JPEG/PDF moyenne qualité
Influenceur → Tous templates + drag & drop, PNG/JPEG/SVG/PDF 300dpi
Producteur → Personnalisé complet, tous formats + CSV/JSON/HTML 300dpi
```

---

### 3.2 Bibliothèque Personnelle
**Fichiers** : `client/src/pages/LibraryPage.jsx`, `server-new/routes/library.js`

**Actions** :
- [ ] Gestion reviews (suppression, édition, duplication, partage, visibilité)
- [ ] Sauvegarde templates/aperçus créés
- [ ] Filigranes personnalisés
- [ ] Sets d'ingrédients, substrats, engrais, matériel
- [ ] Auto-complete intelligent basé sur historique
- [ ] Partage de templates via code unique

---

## 📋 PHASE 4 : GALERIE PUBLIQUE & STATISTIQUES (Priorité BASSE)

### 4.1 Galerie Publique
**Fichiers** : `client/src/pages/GalleryPage.jsx`, `server-new/routes/gallery.js`

**Actions** :
- [ ] Navigation par type de produit, popularité, notes, récence
- [ ] Système de filtres avancés
- [ ] Modération et flagging
- [ ] Classements (top hebdo, mensuel, annuel, all-time)
- [ ] Intégration social (likes, commentaires, partages)

---

### 4.2 Statistiques Utilisateur
**Fichiers** : `client/src/pages/StatsPage.jsx`, `server-new/routes/stats.js`

**Actions** :
- [ ] Nombre de reviews créées, exports, engagement
- [ ] Top cultivars
- [ ] Stats avancées pour Producteurs (rendements, cultures)
- [ ] Stats détaillées Influenceurs (publications, audience)
- [ ] Panel admin pour modération

---

## 🚀 STRATÉGIE DE DÉPLOIEMENT

### Déploiement Progressif sur VPS
```bash
# 1. Travailler sur branche feat/templates-backend
# 2. Tester en local
# 3. Commit + Push
# 4. SSH sur VPS
ssh vps-lafoncedalle

# 5. Pull sur VPS
cd /home/ubuntu/Reviews-Maker
git pull origin feat/templates-backend

# 6. Build client
cd client
npm run build

# 7. Migration Prisma (si schema modifié)
cd ../server-new
npx prisma migrate deploy
npx prisma generate

# 8. Restart serveur Node
pkill -f "node.*server.js"
NODE_ENV=production node server.js &

# 9. Tester sur https://terpologie.eu
```

### Checklist de Déploiement
- [ ] Migration Prisma testée en local
- [ ] Build client sans erreurs
- [ ] Variables d'environnement VPS configurées
- [ ] Backup base de données avant migration
- [ ] Tests fonctionnels post-déploiement
- [ ] Rollback plan en cas d'erreur

---

## 📅 PLANNING ESTIMATIF

| Phase | Tâches | Durée estimée | Priorité |
|-------|--------|---------------|----------|
| **Phase 1** | Comptes & Auth | 2-3 jours | HAUTE |
| **Phase 2** | PipeLine & Reviews | 3-4 jours | HAUTE |
| **Phase 3** | Export & Templates | 2-3 jours | MOYENNE |
| **Phase 4** | Galerie & Stats | 1-2 jours | BASSE |

**Total estimé** : 8-12 jours de développement intensif

---

## 🎯 PROCHAINES ÉTAPES IMMÉDIATES

1. ✅ Analyser l'existant (TERMINÉ)
2. ✅ Créer plan de travail (EN COURS)
3. 🔄 **Commencer Phase 1.1** : Refonte AccountChoicePage
4. 🔄 **Phase 1.2** : Système de vérification d'âge
5. 🔄 **Phase 1.3** : Enrichissement profils Producteur/Influenceur

---

*Document vivant - Mise à jour au fur et à mesure de la progression*
