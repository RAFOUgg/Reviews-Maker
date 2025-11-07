# 🚨 THÈMES NE S'AFFICHENT PAS - CHECKLIST DE RÉSOLUTION

## ✅ Ce qui a été fait
1. ✅ Variables CSS définies pour tous les 6 thèmes
2. ✅ Classes Tailwind mappées vers les variables CSS
3. ✅ Gradients ajoutés pour tous les thèmes
4. ✅ Code committed sur la branche `feat/theme-refactor`

## ❌ Pourquoi ça ne s'affiche pas

### Cause Probable #1: **Cache du Navigateur**
Le navigateur affiche l'ancienne version du CSS qui n'a pas les variables.

**Solution:**
```
Dans le navigateur:
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### Cause Probable #2: **Vite n'a pas rechargé le CSS**
Le serveur de développement doit être redémarré.

**Solution:**
```bash
# Arrêter tous les serveurs Node
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process

# Redémarrer
cd client
npm run dev
```

### Cause Probable #3: **CSS non chargé**
Le fichier `index.css` n'est peut-être pas importé dans l'application.

**Vérification:**
1. F12 → Network
2. Recharger la page
3. Chercher "index.css" ou "main.css"
4. Cliquer dessus et vérifier qu'il contient bien les variables `--primary`, etc.

## 🧪 DIAGNOSTIC RAPIDE

### Dans la Console DevTools (F12 → Console)

Copier-coller ce code:

```javascript
// Vérifier les variables CSS
const styles = getComputedStyle(document.documentElement);
console.log('data-theme:', document.documentElement.getAttribute('data-theme'));
console.log('--primary:', styles.getPropertyValue('--primary'));
console.log('--accent:', styles.getPropertyValue('--accent'));
```

**Résultat attendu:**
```
data-theme: "violet-lean"
--primary: " #A855F7"
--accent: " #E91E63"
```

**Si les variables sont vides:**
- ❌ Le CSS n'est PAS chargé
- Solution: Hard reload (Ctrl+Shift+R)

### Tester le changement de thème

```javascript
// Changer vers Émeraude
document.documentElement.setAttribute('data-theme', 'emerald');

// Vérifier
console.log('--primary:', getComputedStyle(document.documentElement).getPropertyValue('--primary'));
// Devrait afficher: " #06B6D4"
```

## 🛠️ SOLUTION COMPLÈTE

### Étape 1: Arrêter le serveur
```powershell
# Dans le terminal où tourne npm run dev
Ctrl + C
```

### Étape 2: Nettoyer le cache Vite
```powershell
cd client
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
```

### Étape 3: Redémarrer
```powershell
npm run dev
```

### Étape 4: Dans le navigateur
```
1. Fermer tous les onglets de localhost:5174
2. Ouvrir un NOUVEL onglet
3. Aller sur http://localhost:5174
4. Faire Ctrl+Shift+R
```

### Étape 5: Tester
```
1. Aller dans Settings
2. Cliquer sur "Émeraude"
3. Observer si les couleurs changent (cyan/vert)
```

## 🔍 VÉRIFICATION FINALE

Si après tout ça ça ne marche toujours pas:

### 1. Vérifier que le CSS contient bien les variables

```powershell
Get-Content "client\src\index.css" | Select-String "\-\-primary:" | Select-Object -First 5
```

Devrait afficher:
```
    --primary: #A855F7;
    --primary-light: #D8B4FE;
    --primary-dark: #7E22CE;
```

### 2. Vérifier que les classes de mapping existent

```powershell
Get-Content "client\src\index.css" | Select-String "\.bg-purple-600"
```

Devrait afficher:
```
.bg-purple-600,
```

### 3. Copier le script de diagnostic

Le fichier `diagnostic-console.js` contient un script complet à copier dans la console.

```powershell
Get-Content "diagnostic-console.js"
```

Copier tout le contenu, coller dans Console DevTools (F12).

## 📞 SI PROBLÈME PERSISTE

Envoyez-moi une capture d'écran de:
1. F12 → Network → index.css (ou main.css) - le contenu
2. F12 → Console → résultat du script diagnostic
3. F12 → Elements → `<html>` → attribut `data-theme`

---

**Fichiers de diagnostic créés:**
- `diagnostic-console.js` - Script à copier dans la console
- Ce guide - `RESOLUTION_THEMES.md`