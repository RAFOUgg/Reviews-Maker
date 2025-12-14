# 🚀 PLAN DE MISE EN PRODUCTION - 14 Décembre 2025

## ✅ MODIFICATIONS IMPLÉMENTÉES

### 1. Refonte Types de Comptes ✅

#### Backend
**Fichier: `server-new/services/account.js`**
- ✅ Nouveau système: `AMATEUR` / `PRODUCTEUR` / `INFLUENCEUR`
- ✅ Prix abonnements: 0€ / 29.99€ / 15.99€
- ✅ Logique transitions entre types
- ✅ Rétrocompatibilité avec anciens types

**Fichier: `server-new/scripts/migrate-account-types-cdc.js`**
- ✅ Script migration base de données
- ✅ Mapping ancien → nouveau système
- ✅ Statistiques migration

#### Frontend
Pas de modifications frontend nécessaires pour cette partie, le système utilise les roles depuis le backend.

---

### 2. Vérification d'Âge & RDR ✅

#### Pages Créées
**Fichier: `client/src/pages/AgeVerificationPage.jsx`**
- ✅ Formulaire date de naissance
- ✅ Sélection pays (18 ou 21 ans selon législation)
- ✅ Calcul automatique âge
- ✅ Design Apple-like avec Liquid Glass

**Fichier: `client/src/components/legal/DisclaimerRDR.jsx`**
- ✅ Disclaimers multilingues (FR, EN, ES, DE, IT, NL, UK, etc.)
- ✅ Checkbox acceptation obligatoire
- ✅ Enregistrement consentement avec date

#### Routes API
**Fichier: `server-new/routes/users.js`**
- ✅ `POST /api/users/update-legal-info` - Enregistrer âge + pays
- ✅ `POST /api/users/accept-rdr` - Enregistrer consentement RDR
- ✅ Validation âge minimum selon pays
- ✅ Codes erreur spécifiques

#### Routing
**Fichier: `client/src/App.jsx`**
- ✅ Route `/age-verification`
- ✅ Route `/disclaimer-rdr`
- ✅ Import composants

---

### 3. Documentation ✅

**Fichier: `.docs/AUDIT_CONFORMITE_CDC_2025-12-14.md`**
- ✅ Audit complet conformité
- ✅ Identification écarts
- ✅ Plan d'implémentation
- ✅ Priorités et estimations

**Fichier: `.docs/PLAN_MISE_EN_PRODUCTION_2025-12-14.md`** (ce fichier)
- ✅ Récapitulatif modifications
- ✅ Checklist déploiement
- ✅ Commandes VPS

---

## 📋 CHECKLIST PRÉ-DÉPLOIEMENT

### Tests Locaux
- [ ] Tester migration types de comptes
- [ ] Vérifier formulaire âge (tous pays)
- [ ] Tester Disclaimer RDR (toutes langues)
- [ ] Vérifier routes API `/api/users/*`
- [ ] Tester création compte avec nouveau flow
- [ ] Vérifier compatibilité anciens comptes

### Vérifications Backend
- [ ] Variables environnement `.env` complètes
- [ ] Base de données sauvegardée
- [ ] Script migration testé en local
- [ ] Routes API documentées
- [ ] Logs erreurs configurés

### Vérifications Frontend
- [ ] Build production sans erreurs
- [ ] Routes configurées correctement
- [ ] Redirections flow inscription OK
- [ ] Traductions i18n complètes
- [ ] Responsive mobile/desktop

---

## 🚢 PROCÉDURE DE DÉPLOIEMENT

### Étape 1: Sauvegarde Base de Données
```bash
# Connexion VPS
ssh vps-lafoncedalle

# Sauvegarde DB
cd /root/Reviews-Maker/db
sqlite3 reviews-maker.db ".backup backup-$(date +%Y%m%d-%H%M%S).db"
ls -lh backup-*.db  # Vérifier
```

### Étape 2: Pull Code depuis GitHub
```bash
cd /root/Reviews-Maker

# Vérifier branche actuelle
git branch

# Pull dernières modifications
git pull origin main

# Ou si vous êtes sur une branche spécifique
git pull origin feat/templates-backend
```

### Étape 3: Migration Base de Données
```bash
cd /root/Reviews-Maker/server-new

# Installer dépendances si nouvelles
npm install

# Générer Prisma Client
npm run prisma:generate

# Exécuter migration types de comptes
node scripts/migrate-account-types-cdc.js

# Vérifier résultat
# Devrait afficher: "✅ Migration réussie! X/Y utilisateurs migrés"
```

### Étape 4: Build Frontend
```bash
cd /root/Reviews-Maker/client

# Installer dépendances si nouvelles
npm install

# Build production
npm run build

# Vérifier dist/
ls -lh dist/
```

### Étape 5: Restart Services
```bash
cd /root/Reviews-Maker

# Restart PM2
pm2 restart ecosystem.config.cjs

# Vérifier statut
pm2 status
pm2 logs --lines 50

# Restart Nginx si nécessaire
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Étape 6: Tests Production
```bash
# Tester endpoints API
curl https://terpologie.fr/api/auth/providers
curl https://terpologie.fr/api/health

# Vérifier logs
pm2 logs reviews-maker-server --lines 100

# Tester dans navigateur
# https://terpologie.fr/age-verification
# https://terpologie.fr/disclaimer-rdr
```

---

## 🔍 VÉRIFICATIONS POST-DÉPLOIEMENT

### Fonctionnalités à Tester

#### 1. Vérification d'Âge
- [ ] Accès page `/age-verification`
- [ ] Sélection pays change âge minimum
- [ ] Erreur si âge insuffisant
- [ ] Redirection vers `/disclaimer-rdr` si OK
- [ ] Données sauvegardées en DB (`birthdate`, `country`, `legalAge`)

#### 2. Disclaimer RDR
- [ ] Affichage selon pays utilisateur
- [ ] Checkbox obligatoire pour continuer
- [ ] Bouton "Annuler" retourne login
- [ ] Bouton "Accepter" enregistre consentement
- [ ] Redirection vers `/home` après acceptation
- [ ] Données sauvegardées en DB (`consentRDR`, `consentDate`)

#### 3. Types de Comptes
- [ ] Anciens comptes migrés correctement
- [ ] Nouveaux comptes créés avec type `amateur`
- [ ] Permissions selon type (amateur/producteur/influenceur)
- [ ] Interface choix type de compte fonctionne
- [ ] Upgrade/downgrade possible selon règles

#### 4. API Endpoints
- [ ] `POST /api/users/update-legal-info` retourne 200
- [ ] `POST /api/users/accept-rdr` retourne 200
- [ ] Validation erreurs (âge insuffisant, champs manquants)
- [ ] Logs serveur clean (pas d'erreurs critiques)

---

## 🐛 ROLLBACK SI PROBLÈME

### Restaurer Base de Données
```bash
ssh vps-lafoncedalle
cd /root/Reviews-Maker/db

# Lister backups
ls -lh backup-*.db

# Restaurer backup (remplacer par le bon fichier)
cp reviews-maker.db reviews-maker-broken.db
cp backup-20251214-HHMMSS.db reviews-maker.db

# Restart services
cd /root/Reviews-Maker
pm2 restart all
```

### Rollback Code
```bash
ssh vps-lafoncedalle
cd /root/Reviews-Maker

# Voir commits récents
git log --oneline -10

# Rollback au commit précédent
git reset --hard <commit-hash>

# Rebuild
cd client && npm run build
cd ../server-new && pm2 restart all
```

---

## 📊 MONITORING POST-DÉPLOIEMENT

### Première Heure
- [ ] Vérifier logs PM2 toutes les 10 minutes
- [ ] Surveiller erreurs Nginx (`/var/log/nginx/error.log`)
- [ ] Tester tous les flows utilisateur
- [ ] Vérifier métriques DB (taille, requêtes)

### Premier Jour
- [ ] Analyser logs complets
- [ ] Vérifier migrations utilisateurs
- [ ] Collecter feedback utilisateurs
- [ ] Surveiller performances

### Première Semaine
- [ ] Statistiques adoption vérification âge
- [ ] Taux acceptation RDR
- [ ] Distribution types de comptes
- [ ] Bugs reportés

---

## 📝 COMMANDES UTILES VPS

### Logs
```bash
# Logs PM2
pm2 logs reviews-maker-server --lines 100
pm2 logs reviews-maker-server --err --lines 50

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs système
journalctl -u nginx -n 100
```

### Status Services
```bash
# PM2
pm2 status
pm2 describe reviews-maker-server

# Nginx
sudo systemctl status nginx

# Processus
ps aux | grep node
netstat -tulpn | grep :3001
```

### Base de Données
```bash
cd /root/Reviews-Maker/db
sqlite3 reviews-maker.db

# Dans SQLite
.tables
.schema users
SELECT COUNT(*) FROM users;
SELECT roles, COUNT(*) FROM users GROUP BY roles;
SELECT * FROM users WHERE legalAge = 1 LIMIT 5;
.quit
```

---

## ⚠️ POINTS D'ATTENTION

### Sécurité
- Vérifier que les âges sont bien validés côté serveur
- S'assurer que consentRDR est requis avant accès features
- Logs ne doivent pas contenir de données sensibles (dates naissance)

### Performance
- Migration DB peut prendre du temps si beaucoup d'utilisateurs
- Build frontend prend ~2-3 minutes
- Restart PM2 cause ~10 secondes downtime

### UX
- Flow inscription plus long (âge + RDR) → expliquer clairement
- Messages d'erreur doivent être clairs
- Traductions complètes pour tous pays supportés

---

## 📞 CONTACTS URGENCE

**En cas de problème critique:**
1. Rollback immédiat (voir section ci-dessus)
2. Vérifier logs (`pm2 logs`)
3. Contacter équipe dev
4. Documenter incident

**Backup Plan:**
- Base de données sauvegardée avant migration
- Code Git permet rollback instantané
- Nginx peut servir page maintenance si nécessaire

---

## ✅ VALIDATION FINALE

Avant de considérer le déploiement réussi:

- [ ] Tous les tests post-déploiement passent
- [ ] Aucune erreur critique dans les logs
- [ ] Flow inscription complet testé
- [ ] Anciens utilisateurs peuvent toujours se connecter
- [ ] Nouveaux utilisateurs passent par âge + RDR
- [ ] Performance stable (temps réponse API < 200ms)
- [ ] Documentation à jour
- [ ] Équipe informée du déploiement

---

**Date déploiement:** À planifier
**Durée estimée:** 30-45 minutes
**Downtime:** ~10 secondes (restart PM2)
**Risque:** FAIBLE (migration réversible, backups en place)

**Déployé par:** _________________
**Vérifié par:** _________________
**Date:** _________________
