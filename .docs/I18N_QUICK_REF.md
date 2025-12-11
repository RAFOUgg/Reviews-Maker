# 🌍 i18n Quick Reference

## Langues supportées
- 🇺🇸 English (US) - `en`
- 🇬🇧 English (UK) - `en`
- 🇫🇷 Français - `fr`
- 🇩🇪 Deutsch - `de`
- 🇪🇸 Español - `es`

## Fichiers

### Frontend
```
client/src/i18n/
├── i18n.js              # Configuration principale
├── fr.json              # Traductions françaises
├── en.json              # Traductions anglaises
├── de.json              # Traductions allemandes
├── es.json              # Traductions espagnoles
└── legalWelcome.json    # Traductions Legal Modal (legacy)
```

### Backend
```
server-new/
├── prisma/schema.prisma         # Model User.locale
└── routes/account.js            # PATCH /api/account/language
```

## Usage rapide

### Dans un composant React
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
    const { t, i18n } = useTranslation();
    
    return (
        <div>
            <p>{t('common.loading')}</p>
            <button onClick={() => i18n.changeLanguage('de')}>
                Deutsch
            </button>
        </div>
    );
}
```

### Changer la langue (avec sauvegarde)
```javascript
import { changeLanguage } from '../i18n/i18n';

// Change langue + localStorage + HTML lang attribute
await changeLanguage('es');

// Sauvegarder en DB
await fetch('/api/account/language', {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locale: 'es' }),
});
```

## Où la langue est gérée

1. **Legal Modal** : Sélection initiale avec drapeaux
2. **Settings Page** : Section dédiée pour changement
3. **Backend** : Champ `locale` dans table `users`
4. **localStorage** : `userLanguage` pour persistance frontend
5. **i18next** : État global de la langue active

## Ajouter une langue

1. Créer `client/src/i18n/XX.json` (copier `fr.json`)
2. Traduire tous les textes
3. Dans `i18n.js` :
   ```javascript
   import translationXX from './XX.json';
   
   const resources = {
       // ... existing
       xx: { translation: translationXX },
   };
   
   export const SUPPORTED_LANGUAGES = [
       // ... existing
       { code: 'xx', flag: '🏴', label: 'My Language', i18nCode: 'xx' },
   ];
   ```
4. Dans `account.js` (backend) :
   ```javascript
   const validLocales = ['fr', 'en', 'de', 'es', 'xx'];
   ```

## Traductions disponibles

### Sections complètes
- ✅ `rdr.banner` - Bannière Réduction des Risques
- ✅ `ageVerification` - Vérification de l'âge
- ✅ `consent` - Consentement legal complet
- ✅ `countries` - Liste des pays
- ✅ `common` - Messages communs

### Clés communes
```javascript
t('common.loading')    // "Chargement..."
t('common.error')      // "Erreur"
t('common.success')    // "Succès"
t('common.save')       // "Enregistrer"
t('common.cancel')     // "Annuler"
t('common.close')      // "Fermer"
```

## Debug

```javascript
// Console
console.log('Current language:', i18n.language);
console.log('Stored language:', localStorage.getItem('userLanguage'));

// Force langue
localStorage.setItem('userLanguage', 'de');
window.location.reload();

// Activer debug i18next
// Dans i18n.js: debug: true
```

## Priorités de détection

1. **Profil utilisateur** (DB `users.locale`) - Si authentifié
2. **localStorage** (`userLanguage`) - Si visité avant
3. **Navigateur** (`navigator.language`) - Premier visite
4. **Fallback** : `en` (anglais)

## API Backend

### PATCH /api/account/language
```bash
curl -X PATCH https://terpologie.eu/api/account/language \
  -H "Content-Type: application/json" \
  -d '{"locale": "de"}' \
  --cookie "session=..."
```

**Response:**
```json
{
  "success": true,
  "message": "Langue mise à jour avec succès",
  "locale": "de"
}
```

**Errors:**
- `401` - Non authentifié
- `400` - Langue invalide

## Checklist intégration

- [ ] Importer `useTranslation` dans le composant
- [ ] Remplacer textes hardcodés par `t('key')`
- [ ] Ajouter clés manquantes dans tous les fichiers JSON
- [ ] Tester avec chaque langue
- [ ] Vérifier que la sauvegarde backend fonctionne
- [ ] Valider affichage des drapeaux

---

**Voir documentation complète** : `.docs/SYSTEME_INTERNATIONALISATION.md`
