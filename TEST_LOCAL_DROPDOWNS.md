# 🧪 TEST LOCAL - VÉRIFICATION DROPDOWNS

## ⚠️ AVANT DE DÉPLOYER SUR LE VPS - TESTER LOCALEMENT

Le serveur Vite tourne déjà sur votre machine : `http://localhost:5173/`

### 1️⃣ Ouvrir le site local dans le navigateur

```
http://localhost:5173/
```

### 2️⃣ Test des dropdowns sur TOUS les thèmes

#### ✅ Checklist par thème :

**🟣 Violet Lean** (défaut)
- [ ] Dropdown "Type" → Options avec fond violet
- [ ] Dropdown "Trier par" → Options lisibles
- [ ] CreateReview → Dropdown "Type" avec fond violet

**🟢 Émeraude**
- [ ] Changer de thème → Émeraude
- [ ] Dropdown "Type" → **Options avec fond VERT** (pas blanc !)
- [ ] Options lisibles avec texte contrasté
- [ ] Chevron visible en haut à droite du select

**🌊 Tahiti** (cyan)
- [ ] Changer de thème → Tahiti
- [ ] Dropdown "Type" → **Options avec fond CYAN** (pas blanc !)
- [ ] Options lisibles

**🌸 Sakura** (rose)
- [ ] Changer de thème → Sakura
- [ ] Dropdown "Type" → **Options avec fond ROSE** (pas blanc !)
- [ ] Options lisibles avec texte foncé

**🌙 Minuit** (sombre)
- [ ] Changer de thème → Minuit
- [ ] Dropdown "Type" → Options avec fond sombre
- [ ] Options lisibles avec texte clair

### 3️⃣ Test d'une création de review

1. Cliquer sur "Nouvelle Review"
2. Sélectionner le type : **Fleur**
3. Vérifier que le dropdown montre :
   - ✅ Fond avec couleur du thème actif
   - ✅ Options lisibles (pas blanc/bleu navigateur)
   - ✅ Option sélectionnée avec gradient
4. Dans les sections suivantes :
   - **Informations générales** → Dropdown "Type de culture"
   - **Plan cultural & Engraissage** → Dropdown avec méthodes
   - Tous doivent avoir le style du thème actif

### 4️⃣ Vérification DevTools (F12)

1. Ouvrir DevTools (F12)
2. Inspecter un `<select>` :
   ```html
   <select class="... select-themed">
   ```
3. Vérifier dans l'onglet "Computed" :
   - `background-color` = valeur de `var(--bg-input)`
   - `color` = valeur de `rgb(var(--text-primary))`
   - `border` = `2px solid` avec couleur primary

### 5️⃣ Test navigateurs

- [ ] **Chrome/Edge** : Dropdowns stylisés ?
- [ ] **Firefox** : Dropdowns stylisés ?
- [ ] **Safari** (si disponible) : Dropdowns stylisés ?

### 6️⃣ Screenshot de validation

Prendre un screenshot d'un dropdown OUVERT sur le thème Sakura ou Émeraude :
- Si les options sont **blanches/bleues** → ❌ Problème
- Si les options ont la **couleur du thème** → ✅ OK

---

## ✅ SI TOUT FONCTIONNE LOCALEMENT

**ALORS vous pouvez déployer sur le VPS :**

```bash
ssh vps-lafoncedalle "cd /var/www/Reviews-Maker && git pull origin feat/templates-backend && cd client && npm install && npm run build && cd .. && pm2 restart reviews-maker && sudo systemctl reload nginx"
```

## ❌ SI LES DROPDOWNS RESTENT BLANCS LOCALEMENT

**Cela signifie que les navigateurs ne supportent pas le style des `<option>`.**

### Solution alternative : Custom Select component

Si les styles CSS natifs ne fonctionnent pas, il faudra créer un composant React custom pour les dropdowns avec :
- Div stylée comme un select
- Liste déroulante en position absolue
- JavaScript pour gérer l'ouverture/fermeture

Mais testons d'abord les styles CSS avant de passer à cette solution plus complexe.

---

## 🔍 Diagnostic si problème

### Les options restent blanches/bleues ?

**Cause possible 1** : Le navigateur ignore les styles sur `<option>`
- Solution : Créer un CustomSelect component React

**Cause possible 2** : Le CSS n'est pas chargé
- Vérifier dans DevTools → Network → Chercher le fichier CSS
- Vérifier qu'il contient `.select-themed`

**Cause possible 3** : !important pas assez fort
- Inspecter l'élément et voir quel style est appliqué
- Augmenter la spécificité CSS si nécessaire

---

**⏭️ Prochaine étape : Ouvrir http://localhost:5173 et tester !**
