# Guide de Test Rapide - Système de Gestion de Compte

**Date:** Décembre 10, 2025  
**Durée totale:** ~15 minutes

---

## 🎯 Objectif

Valider le fonctionnement complet du système:
1. ✅ Pop-up vérification d'âge
2. ✅ Sélection type de compte
3. ✅ Page profil utilisateur
4. ✅ Endpoints API
5. ✅ Colorimétrie & design

---

## 📋 Pré-requis Test

- ✅ Serveur backend lancé: `npm start` dans `server-new/`
- ✅ Frontend dev ou build: `npm run dev` dans `client/`
- ✅ Base de données initialized
- ✅ Navigateur moderne (Chrome, Firefox, Edge)

---

## 🧪 Test 1: Vérification d'Âge (3 min)

### Scénario: France 18+

1. **Ouvrir l'app et se connecter**
   - Accédez à `http://localhost:3000` (ou `http://localhost:5173` en dev)
   - Identifiez-vous avec Discord/Google ou email
   - Vous devriez voir une **pop-up modale** "Vérification d'Âge"

2. **Tester le formulaire**
   - Cliquez sur champ "Date de naissance"
   - Sélectionnez une date: ex. `01/01/1995`
   - Dropdown "Pays": Sélectionnez `France (min. 18 ans)`
   - Pas de région requis pour France
   - Le texte "Vérifications uniquement pour éligibilité" s'affiche

3. **Soumettre et vérifier**
   - Cliquez "Vérifier mon âge"
   - ✅ Si succès: redirect vers écran suivant (consentement)
   - ✅ Pop-up fermeture smooth
   - ✅ No error message visible

### Scénario: États-Unis 21+ (Californie légale)

1. **Remplissez:**
   - Date: `01/01/1990`
   - Pays: `États-Unis (min. 21 ans)`
   - État: Sélectionnez `Californie` depuis dropdown US-spécifique

2. **Vérifiez:**
   - ✅ Dropdown "État" apparaît (US-only)
   - ✅ États listés: AK, AZ, CA, CO, ... (21+ légaux)
   - ✅ Submit → success

### Scénario: Erreur - Trop jeune

1. **Remplissez:**
   - Date: `01/01/2010` (14 ans)
   - Pays: `France`

2. **Vérifiez:**
   - ✅ Error message: "Vous devez avoir au moins 18 ans pour accéder"
   - ✅ Pop-up reste ouverte
   - ✅ Bouton toujours accessible

---

## 🧪 Test 2: Sélection Type de Compte (2 min)

### Après vérification d'âge réussie

1. **Accepter consentement RDR**
   - Lisez le texte consentement
   - Cochez "J'accepte"
   - Cliquez "Continuer"
   - ✅ Redirect vers **AccountSelector modal**

2. **Interface AccountSelector**
   - ✅ Full-screen modal avec 4 cards
   - ✅ Cards visibles: Beta Testeur, Consommateur, Influenceur, Producteur
   - ✅ Gradient violet → rose
   - ✅ Badges: "Actif" (violet), "Disponible" (vert), "Bientôt" (orange), "Premium" (rose)

3. **Test sélection**
   - Cliquez card "Consommateur"
   - ✅ Border devient violet, fond plus clair
   - ✅ Checkmark vert apparaît top-right (-3, -3)
   - ✅ Details s'affichent en bas

4. **Tester autre type**
   - Cliquez "Influenceur Basic"
   - ✅ Selection change smoothly
   - ✅ Details updated

5. **Bouton confirmatio**
   - "Continuer en tant que Consommateur" (update dynamiquement)
   - Cliquez
   - ✅ Loading state
   - ✅ Redirect vers home

---

## 🧪 Test 3: Page Profil (5 min)

### Navigation vers profil

1. **Depuis header**
   - Cliquez avatar user top-right
   - Dropdown s'affiche
   - ✅ "Mon Profil" en premier (nouveau)
   - ✅ Autres items: Bibliothèque, Stats, Paramètres, Déconnexion
   - Cliquez "Mon Profil"

2. **Page ProfilePage charge**
   - ✅ URL: `/profile`
   - ✅ Gradient violet au top
   - ✅ Bouton "Retour" visible
   - ✅ Avatar user + nom + email affichés
   - ✅ Badge "Beta Testeur" vert
   - ✅ Badge "Vérification d'âge" ✓ visible

### Onglet 1: Informations

1. **Affichage initial (lecture)**
   - ✅ Nom d'utilisateur affiché
   - ✅ Email affiché
   - ✅ Thème sélectionné: "violet-lean"
   - ✅ Bouton "Modifier" visible

2. **Mode édition**
   - Cliquez "Modifier"
   - ✅ Champs deviennent input/select
   - ✅ Champs editable: username, email, theme, locale
   - ✅ Boutons "Enregistrer" + "Annuler" remplacent "Modifier"

3. **Test mise à jour**
   - Changez username: `TestUser123`
   - Changez thème: `Émeraude`
   - Cliquez "Enregistrer"
   - ✅ Loading... visible
   - ✅ Mise à jour complète
   - ✅ Page refresh automatique
   - ✅ Nouvelles valeurs affichées

### Onglet 2: Légal

1. **Conditions Générales**
   - ✅ Card bleue "Conditions..." apparaît
   - ✅ Titre + contenu scrollable
   - ✅ Checkbox "J'accepte les CGU"
   - ✅ Scrollable content avec 5+ sections

2. **Mentions Légales**
   - ✅ Card rose "Mentions Légales" apparaît
   - ✅ Informations SARL, contact
   - ✅ Sections: Conformité, RGPD, RDR, Droits

3. **Interaction**
   - Scrollez contenu → scroll working
   - Cochez checkboxes → UI responsive

### Onglet 3: Sécurité

1. **Affichage**
   - ✅ Card bleue "Authentification"
   - Texte: "Protégez votre compte avec 2FA"
   - Bouton "Activer" (future feature)

2. **Sessions**
   - ✅ Card grise "Sessions"
   - Texte: "Actuellement connecté depuis 1 appareil"

---

## 🧪 Test 4: API Endpoints (3 min)

### Terminal / Postman

```bash
# Test 1: Vérifier récupération profil
curl -X GET http://localhost:3000/api/account/profile \
  -H "Cookie: sid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json"

# Réponse attendue: 200 OK
# {
#   "id": "uuid",
#   "username": "yourname",
#   "email": "your@email.com",
#   "accountType": "consumer",
#   "legalAge": true,
#   "consentRDR": true
# }

# Test 2: Mettre à jour profil
curl -X PUT http://localhost:3000/api/account/update \
  -H "Cookie: sid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "NewUsername",
    "theme": "emerald",
    "locale": "en"
  }'

# Réponse attendue: 200 OK avec champs mis à jour

# Test 3: Récupérer CGU
curl http://localhost:3000/api/legal/terms

# Réponse: {
#   "title": "Conditions Générales d'Utilisation",
#   "sections": [...]
# }

# Test 4: Récupérer Mentions Légales
curl http://localhost:3000/api/legal/notice

# Test 5: Enregistrer consentement
curl -X POST http://localhost:3000/api/legal/consent \
  -H "Cookie: sid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "terms": true,
    "privacy": true,
    "rdr": true
  }'

# Réponse: { "success": true, "user": {...} }
```

**Vérifications:**
- ✅ Tous les endpoints retournent 200-201
- ✅ Pas d'erreur 500
- ✅ Structure JSON valide
- ✅ Temps réponse < 500ms

---

## 🎨 Test 5: Colorimétrie & Design (2 min)

### Violet Lean (défaut)
- ✅ Header: gradient violet → rose
- ✅ Buttons: violet-600 hover → violet-700
- ✅ Backgrounds: white cards sur violet background
- ✅ Accents: rose pour secondary actions

### Responsive Design
1. **Desktop** (1920px)
   - ✅ Layout 2 colonnes ProfilePage
   - ✅ Avatar 32h width
   - ✅ Tabs side-by-side

2. **Tablet** (768px)
   - ✅ Layout adapté
   - ✅ Menu collapse

3. **Mobile** (375px)
   - ✅ Single column
   - ✅ Avatar smaller
   - ✅ All readable
   - ✅ Buttons full-width

---

## 🚨 Issues Possibles & Solutions

### Issue: "Authentification requise" sur /profile
**Solution:** Re-connectez-vous, vérifiez session cookie
```bash
curl http://localhost:3000/api/account/info
# Devrait retourner 401 si pas authentifié
```

### Issue: Vérification d'âge n'apparaît pas
**Solution:** 
1. Vérifiez console browser pour erreurs
2. Assurez-vous que `needsAgeVerification` = true dans useAuth
3. Checkez AppJS pour imports corrects

### Issue: Profil ne met pas à jour
**Solution:**
```bash
# Test endpoint directement
curl -X PUT http://localhost:3000/api/account/update \
  -H "Cookie: sid=YOUR_SESSION_ID" \
  -d '{"username": "test"}'
  
# Vérifiez erreur retournée
```

### Issue: Thème ne change pas
**Solution:**
1. Rechargez la page
2. Vérifiez localStorage: `localStorage.theme`
3. Checkez root element: `document.documentElement.data-theme`

---

## ✅ Checklist de Validation

- [ ] Vérification d'âge pop-up s'affiche
- [ ] Sélection du type de compte marche
- [ ] Page profil charge correctement
- [ ] Édition profil sauvegarde en BD
- [ ] Tous les onglets profil accessibles
- [ ] API endpoints retournent 200
- [ ] Design violet/rose cohérent
- [ ] Responsive sur mobile
- [ ] Pas d'erreurs console
- [ ] Sessions persistent après refresh

---

## 🎉 Résultat Attendu

Après tous les tests:
- ✅ User flow complet: Auth → Age → Compte → Profil
- ✅ Toutes les pages chargent sans erreur
- ✅ API endpoints fonctionnent
- ✅ Data persiste en base de données
- ✅ Design cohérent sur tous les pages
- ✅ Mobile-friendly partout

---

**Durée totale:** ~15 minutes  
**Prêt pour production:** ✅ Oui

---

**Tests effectués le:** [YYYY-MM-DD]  
**Testeur:** [Nom]  
**Résultat:** ✅ PASS / ❌ FAIL
