# Pop-up Légale - Quick Start

## Installation ✅ Terminée

Le système est déjà intégré dans l'application. Aucune installation supplémentaire requise.

## Tester localement

### 1. Forcer l'affichage
```js
// Dans la console du navigateur
localStorage.removeItem('terpologie_legal_consent')
// Recharger la page
```

### 2. Vérifier le stockage
```js
// Voir le consentement actuel
console.log(JSON.parse(localStorage.getItem('terpologie_legal_consent')))
```

### 3. Simuler différents pays
Modifier la sélection dans la modal ou :
```js
const consent = JSON.parse(localStorage.getItem('terpologie_legal_consent'))
consent.country = 'CA' // ou US, FR, ES, etc.
localStorage.setItem('terpologie_legal_consent', JSON.stringify(consent))
```

## Personnalisation rapide

### Modifier un texte
Éditer `client/src/i18n/legalWelcome.json`

### Ajouter un pays
Éditer `client/src/data/legalConfig.json`

### Changer la durée de validité
Éditer `client/src/hooks/useLegalConsent.js` → `CONSENT_VALIDITY_DAYS`

## API Endpoints

- `GET /api/legal/user-preferences` - Récupère pays/langue
- `POST /api/legal/update-preferences` - Met à jour pays/langue

## Structure

```
client/src/
├── components/
│   ├── LegalWelcomeModal.jsx       # Modal principale
│   └── LegalConsentGate.jsx        # Wrapper qui bloque l'accès
├── hooks/
│   └── useLegalConsent.js          # Gestion du consentement
├── data/
│   └── legalConfig.json            # Pays/âges
└── i18n/
    └── legalWelcome.json           # Traductions
```

## Documentation complète

Voir `docs/LEGAL_WELCOME_SYSTEM.md`

## Support

Questions ? Voir `.github/copilot-instructions.md`
