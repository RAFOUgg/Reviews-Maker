# Changelog - Système de Pop-up Légale

## [1.0.0] - 2025-12-10

### ✨ Ajouté

#### Frontend
- **LegalWelcomeModal.jsx** : Composant modal principal affichant l'avertissement légal complet
  - Sélection pays/langue (manuel ou auto depuis compte)
  - Confirmation d'âge légal selon le pays
  - Avertissement de réduction des risques (RDR)
  - Informations sur le système d'analyse
  - Lois applicables par pays
  - Règles essentielles et charte
  - Trois cases de consentement obligatoires
  - Boutons Continuer / Se connecter / Quitter

- **LegalConsentGate.jsx** : Wrapper de protection qui bloque l'accès à l'application
  - Vérifie le consentement au chargement
  - Affiche la modal si nécessaire
  - Gère l'état de chargement
  - Bloque l'accès en cas de refus

- **useLegalConsent.js** : Hook personnalisé de gestion du consentement
  - `hasConsent` : État du consentement
  - `consentData` : Données du consentement
  - `isLoading` : État de chargement
  - `checkConsent()` : Vérification du consentement
  - `giveConsent()` : Enregistrement du consentement
  - `revokeConsent()` : Révocation du consentement
  - `updateConsentCountry()` : Mise à jour pays/langue
  - Validation d'expiration (30 jours)

- **legalConfig.json** : Configuration des pays et âges légaux
  - 15 pays configurés (FR, CA, US, ES, NL, DE, PT, UY, MX, AU, NZ, GB, IT, BE, CH)
  - Âge légal par pays
  - Statut d'autorisation
  - Réglementations spécifiques traduites

- **legalWelcome.json** : Traductions complètes FR/EN/ES
  - Sections : welcome, rdr, analysis, laws, rules, consent, actions, errors
  - Support des variables dynamiques ({country}, {age})
  - Textes juridiques adaptés à chaque langue

- **legalSystemTests.js** : Suite de tests pour validation
  - Test des fichiers de configuration
  - Test du localStorage
  - Test des endpoints API
  - Simulation d'expiration
  - Forcer l'affichage
  - Validation du consentement

- **LEGAL_README.md** : Guide rapide pour développeurs
- **check-legal-system.sh** : Script de vérification pour déploiement VPS

#### Backend
- **GET /api/legal/user-preferences** : Récupère les préférences utilisateur
  - Retourne pays, langue, legalAge, consentRDR
  - Authentification requise

- **POST /api/legal/update-preferences** : Met à jour les préférences
  - Body : { country, language }
  - Validation du pays autorisé
  - Authentification requise

#### Documentation
- **LEGAL_WELCOME_SYSTEM.md** : Documentation complète du système
  - Vue d'ensemble et architecture
  - Configuration des pays
  - Traductions et variables
  - API backend
  - Stockage local
  - Intégration
  - Hook useLegalConsent
  - Relation avec le système existant
  - Tests manuels
  - Maintenance et sécurité

### 🔄 Modifié

- **App.jsx** : Ajout de LegalConsentGate comme premier niveau de protection
  - Enveloppe toute l'application
  - Prioritaire sur AgeVerification, ConsentModal, AccountSelector
  - Import de LegalConsentGate

- **routes/legal.js** : Ajout de deux nouveaux endpoints
  - GET /user-preferences
  - POST /update-preferences

### 🎯 Objectifs atteints

✅ Affichage obligatoire avant tout contenu  
✅ Gestion utilisateur connecté/non connecté  
✅ Sélection pays/langue avec validation  
✅ Âge légal dynamique selon le pays  
✅ Avertissements RDR complets  
✅ Charte et règles essentielles  
✅ Triple consentement (âge, règles, confidentialité)  
✅ Stockage local + backend (si connecté)  
✅ Expiration automatique (30 jours)  
✅ Support multi-langues (FR/EN/ES)  
✅ 15 pays configurés  
✅ Tests et validation  
✅ Documentation complète  

### 🔒 Sécurité

- Validation côté serveur des pays autorisés
- Vérification de tous les champs obligatoires
- Expiration automatique du consentement
- Stockage sécurisé (localStorage + base de données)
- Protection contre les modifications localStorage

### 📊 Statistiques

- **Fichiers créés** : 9
- **Fichiers modifiés** : 2
- **Lignes de code** : ~1500
- **Pays configurés** : 15
- **Langues supportées** : 3 (FR, EN, ES)
- **Endpoints API** : 2 nouveaux

### 🚀 Déploiement

1. Pull les dernières modifications
2. Vérifier avec `bash scripts/check-legal-system.sh`
3. Installer les dépendances si nécessaire
4. Build du frontend : `npm run build`
5. Redémarrer le serveur

### 🧪 Tests à effectuer

- [ ] Première visite (non connecté)
- [ ] Utilisateur connecté avec préférences
- [ ] Utilisateur connecté sans préférences
- [ ] Modification de pays/langue
- [ ] Refus d'accès
- [ ] Expiration après 30 jours
- [ ] Pays non autorisé
- [ ] Tous les checkboxes requis
- [ ] Redirection vers login
- [ ] Sauvegarde backend

### 📝 Notes de migration

Aucune migration base de données requise. Les champs `country` et `preferredLanguage` existent déjà dans le modèle User.

### 🐛 Problèmes connus

Aucun pour le moment.

### 🔮 Améliorations futures

- [ ] Ajout d'autres pays
- [ ] Statistiques de consentement (analytics)
- [ ] Export des consentements (RGPD)
- [ ] Historique des modifications
- [ ] Notification avant expiration
- [ ] Support d'autres langues (DE, IT, PT)
- [ ] Modal responsive optimisée mobile
- [ ] Animations de transition

---

**Contributeurs** : Reviews-Maker Team  
**Date** : 10 décembre 2025  
**Version** : 1.0.0
