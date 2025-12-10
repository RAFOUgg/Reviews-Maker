# Système de Pop-up Légale - Documentation

## Vue d'ensemble

Le système de pop-up légale "Bienvenue sur Terpologie Reviews Maker" est le premier niveau de protection et de conformité de l'application. Il s'affiche **AVANT** tout autre contenu et gère :

- ✅ Sélection du pays et de la langue
- ✅ Vérification de l'âge légal selon le pays
- ✅ Avertissement de réduction des risques (RDR)
- ✅ Informations légales et réglementaires par pays
- ✅ Acceptation de la charte et des règles
- ✅ Consentement au traitement des données

## Architecture

### Fichiers créés

```
client/src/
├── components/
│   ├── LegalWelcomeModal.jsx       # Modal principale
│   └── LegalConsentGate.jsx        # Wrapper qui bloque l'accès
├── hooks/
│   └── useLegalConsent.js          # Hook de gestion du consentement
├── data/
│   └── legalConfig.json            # Configuration pays/âges légaux
└── i18n/
    └── legalWelcome.json           # Traductions FR/EN/ES

server-new/routes/
└── legal.js                        # Endpoints supplémentaires
```

### Flux d'utilisation

1. **Chargement de l'app** → `LegalConsentGate` vérifie le localStorage
2. **Pas de consentement** → Affiche `LegalWelcomeModal`
3. **Utilisateur non connecté** → Sélection manuelle pays/langue
4. **Utilisateur connecté** → Récupération auto depuis `/api/legal/user-preferences`
5. **Acceptation** → Stockage localStorage + backend (si connecté)
6. **Validité** → 30 jours, puis redemander

## Configuration des pays

### Fichier `legalConfig.json`

Chaque pays possède :
- **name** : Traductions du nom (fr, en, es)
- **legalAge** : Âge minimum requis
- **allowed** : Autorisation d'accès
- **regulations** : Texte légal spécifique au pays

Exemple :
```json
{
  "FR": {
    "name": { "fr": "France", "en": "France", "es": "Francia" },
    "legalAge": 18,
    "allowed": true,
    "regulations": {
      "fr": "En France, l'usage récréatif est interdit..."
    }
  }
}
```

### Ajouter un nouveau pays

1. Éditer `client/src/data/legalConfig.json`
2. Ajouter la configuration du pays
3. Vérifier `server-new/config/legal.js` pour la cohérence backend

## Traductions

### Fichier `legalWelcome.json`

Structure :
```json
{
  "fr": {
    "welcome": { "title": "...", "subtitle": "..." },
    "rdr": { "title": "...", "content": "..." },
    "analysis": { ... },
    "laws": { ... },
    "rules": { ... },
    "consent": { ... },
    "actions": { ... },
    "errors": { ... }
  },
  "en": { ... },
  "es": { ... }
}
```

### Variables dynamiques

Utilisez `{country}` et `{age}` dans les textes :
```
"L'âge légal d'accès pour {country} est de {age} ans."
```

## API Backend

### Nouveaux endpoints

#### `GET /api/legal/user-preferences`
Récupère les préférences de l'utilisateur connecté.

**Réponse :**
```json
{
  "country": "FR",
  "language": "fr",
  "legalAge": true,
  "consentRDR": true
}
```

#### `POST /api/legal/update-preferences`
Met à jour le pays et la langue de l'utilisateur.

**Body :**
```json
{
  "country": "CA",
  "language": "en"
}
```

**Réponse :**
```json
{
  "success": true,
  "country": "CA",
  "language": "en"
}
```

## Stockage Local

### Format du consentement

```json
{
  "country": "FR",
  "language": "fr",
  "ageConfirmed": true,
  "rulesAccepted": true,
  "privacyAccepted": true,
  "timestamp": "2025-12-10T14:30:00.000Z",
  "userId": "user123"
}
```

### Clé localStorage
`terpologie_legal_consent`

### Expiration
30 jours après l'acceptation

## Intégration dans App.jsx

```jsx
import LegalConsentGate from './components/LegalConsentGate'

function App() {
  return (
    <ErrorBoundary>
      <LegalConsentGate>
        {/* Reste de l'application */}
      </LegalConsentGate>
    </ErrorBoundary>
  )
}
```

## Hook useLegalConsent

### Méthodes

- `hasConsent` : Boolean, true si consentement valide
- `consentData` : Objet avec les données du consentement
- `isLoading` : Boolean, pendant la vérification
- `checkConsent()` : Revérifie le consentement
- `giveConsent(info)` : Enregistre un nouveau consentement
- `revokeConsent()` : Supprime le consentement
- `updateConsentCountry(country, language)` : Met à jour pays/langue

### Exemple d'utilisation

```jsx
const { hasConsent, consentData, giveConsent } = useLegalConsent()

if (!hasConsent) {
  // Afficher la modal
}

// Accepter
giveConsent({
  country: 'FR',
  language: 'fr',
  ageConfirmed: true,
  rulesAccepted: true,
  privacyAccepted: true
})
```

## Relation avec le système existant

### Ordre d'affichage

1. ✅ **LegalConsentGate** (nouveau) - Bloque TOUT
2. ✅ **AgeVerification** (existant) - Si authentifié
3. ✅ **ConsentModal** (existant) - Après AgeVerification
4. ✅ **AccountSelector** (existant) - Après ConsentModal

### Complémentarité

- `LegalConsentGate` : Protection générale, pays/langue, charte complète
- `AgeVerification` : Vérification précise date de naissance (backend)
- `ConsentModal` : RDR détaillé spécifique au compte

## Tests manuels

### Scénario 1 : Première visite (non connecté)
1. Ouvrir l'app → Modal s'affiche
2. Sélectionner pays/langue
3. Cocher les 3 cases
4. Cliquer "Continuer" → Accès accordé
5. localStorage contient le consentement

### Scénario 2 : Utilisateur connecté
1. Se connecter
2. Modal charge les préférences du compte
3. Affiche "Pays/langue de votre compte : France / FR"
4. Cliquer "Modifier" pour changer
5. Backend met à jour à l'acceptation

### Scénario 3 : Refus
1. Cliquer "Quitter" → Redirection `about:blank`

### Scénario 4 : Expiration
1. Attendre 30 jours (ou modifier manuellement le timestamp)
2. Recharger l'app → Modal réapparaît

### Scénario 5 : Pays interdit
1. Modifier `legalConfig.json` : `"allowed": false`
2. Sélectionner ce pays → Message d'erreur

## Maintenance

### Mise à jour des âges légaux
Éditer `client/src/data/legalConfig.json` et modifier `legalAge`.

### Ajouter une langue
1. Ajouter dans `supportedLanguages` de `legalConfig.json`
2. Créer les traductions dans `legalWelcome.json`

### Modifier la durée de validité
Éditer `CONSENT_VALIDITY_DAYS` dans `useLegalConsent.js`.

### Textes juridiques
Modifier les sections dans `legalWelcome.json` (rdr, laws, rules).

## Sécurité

- ✅ Validation côté serveur des pays autorisés
- ✅ Stockage local + backend pour utilisateurs connectés
- ✅ Expiration automatique après 30 jours
- ✅ Vérification de tous les champs obligatoires
- ✅ Protection contre les modifications localStorage (rechargement)

## Accessibilité

- ✅ Clavier : Tab pour naviguer, Enter pour valider
- ✅ Contraste élevé (fond sombre + texte clair)
- ✅ Focus visible sur les éléments interactifs
- ✅ Labels explicites pour les checkboxes

## Performance

- ✅ Chargement des préférences en parallèle
- ✅ Pas de re-render inutiles
- ✅ localStorage rapide
- ✅ Modal bloque l'app (pas de chargement inutile en arrière-plan)

## Débogage

### Forcer l'affichage de la modal
```js
localStorage.removeItem('terpologie_legal_consent')
```

### Simuler un utilisateur connecté
Modifier le backend pour retourner des préférences fictives.

### Logs
Activer les console.log dans `useLegalConsent.js` et `LegalWelcomeModal.jsx`.

---

## Contact & Support

Pour toute question ou problème, consulter :
- `.github/copilot-instructions.md` - Instructions générales
- `.github/instructions/vps.instructions.md` - Déploiement VPS
- `docs/COMMENCEZ_ICI.md` - Guide de démarrage

---

**Date de création** : 10 décembre 2025  
**Version** : 1.0.0  
**Auteur** : Reviews-Maker Team
