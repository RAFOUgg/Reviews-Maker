# 🔧 Guide de Test - Pop-up Légale & Logo

## ✅ Modifications effectuées

### 1. Logo de l'application
- ✅ Logo copié dans `client/public/branding_logo.png`
- ✅ Favicon mis à jour dans `client/index.html`
- ✅ Logo ajouté dans le header (Layout.jsx)

### 2. Correction du hook useLegalConsent
- ✅ Ajout de `useCallback` pour éviter les boucles infinies
- ✅ Correction des dépendances de `useEffect`

## 🧪 Pour tester la pop-up légale

### Méthode 1 : Console du navigateur (Recommandé)
1. Ouvrir l'application dans Edge : http://localhost:5173
2. Appuyer sur **F12** pour ouvrir la console
3. Exécuter :
```js
localStorage.removeItem('terpologie_legal_consent')
location.reload()
```

### Méthode 2 : Script de débogage
1. Ouvrir la console (F12)
2. Charger le script :
```js
fetch('/debug-legal.js').then(r => r.text()).then(eval)
```
3. Suivre les instructions affichées

### Méthode 3 : Mode navigation privée
1. Ouvrir Edge en mode privé (Ctrl+Shift+N)
2. Aller sur http://localhost:5173
3. La modal devrait s'afficher automatiquement

## 🔍 Vérifications à faire

### ✅ Logo
- [ ] Le logo apparaît dans l'onglet du navigateur (favicon)
- [ ] Le logo apparaît en haut à gauche de la page
- [ ] Le logo a un effet hover (ombre qui s'illumine)
- [ ] Le logo est cliquable et retourne à l'accueil

### ✅ Pop-up légale
- [ ] La modal s'affiche au premier accès (sans consentement)
- [ ] Les champs Pays et Langue sont présents
- [ ] Les 3 checkboxes sont présentes (âge, règles, confidentialité)
- [ ] Le bouton "Continuer" est désactivé par défaut
- [ ] Cocher les 3 cases active le bouton "Continuer"
- [ ] Cliquer "Continuer" ferme la modal et donne accès à l'app
- [ ] Le consentement est enregistré dans localStorage

### ✅ Utilisateur connecté
- [ ] Si connecté, les préférences pays/langue sont pré-remplies
- [ ] Un bouton "Modifier" permet de changer les préférences
- [ ] Les préférences sont sauvegardées sur le serveur

### ✅ Expiration
- [ ] Le consentement expire après 30 jours
- [ ] La modal réapparaît après expiration

## 🐛 Si la modal ne s'affiche pas

### Diagnostic
1. Ouvrir la console (F12)
2. Vérifier les erreurs dans l'onglet "Console"
3. Vérifier l'onglet "Application" → "Local Storage" → Chercher `terpologie_legal_consent`

### Solutions
1. **Supprimer le localStorage** :
```js
localStorage.clear()
location.reload()
```

2. **Vérifier que le composant est chargé** :
```js
// Dans la console
console.log('LegalConsentGate:', window.location.pathname)
```

3. **Vérifier les erreurs React** :
   - Regarder l'onglet "Console" pour des erreurs rouges
   - Vérifier que `npm run dev` tourne sans erreur

4. **Hard refresh** :
   - Ctrl+F5 pour forcer le rechargement complet
   - Ou Ctrl+Shift+R

## 📝 Informations techniques

### Structure du consentement (localStorage)
```json
{
  "country": "FR",
  "language": "fr",
  "ageConfirmed": true,
  "rulesAccepted": true,
  "privacyAccepted": true,
  "timestamp": "2025-12-10T15:30:00.000Z",
  "userId": "user_id_or_null"
}
```

### Endpoints API utilisés
- `GET /api/legal/user-preferences` - Récupère pays/langue (si connecté)
- `POST /api/legal/update-preferences` - Sauvegarde pays/langue (si connecté)

### Fichiers modifiés
- ✅ `client/index.html` - Favicon
- ✅ `client/src/components/Layout.jsx` - Logo header
- ✅ `client/src/hooks/useLegalConsent.js` - Correction bug
- ✅ `client/public/branding_logo.png` - Logo copié

## 🚀 Déploiement sur le VPS

Une fois les tests validés localement :

```bash
# Sur votre machine
git add .
git commit -m "fix: Add branding logo and fix legal popup display"
git push

# Sur le VPS
ssh vps-lafoncedalle
cd ~/Reviews-Maker
git pull
cd client
npm run build
cd ..
pm2 restart reviews-maker
```

## 📞 Support

Si problème persistant :
1. Vérifier les logs : `npm run dev` dans le terminal
2. Vérifier la console du navigateur (F12)
3. Consulter `docs/LEGAL_WELCOME_SYSTEM.md` pour plus de détails

---

**Date** : 10 décembre 2025  
**Testeur** : _________________  
**Statut** : ⬜ En cours  ⬜ Réussi  ⬜ Échec
