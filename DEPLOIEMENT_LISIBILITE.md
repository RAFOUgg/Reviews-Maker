# 🚀 Déploiement et Tests - Correctif Lisibilité

## Commandes de Déploiement

### 1. Tester localement

```powershell
# Se placer dans le dossier client
cd client

# Installer les dépendances (si nécessaire)
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
start msedge http://localhost:5173
```

### 2. Build de production

```powershell
# Build optimisé
cd client
npm run build

# Prévisualiser le build
npm run preview
```

### 3. Déployer sur le VPS

```powershell
# Connexion SSH
ssh vps-lafoncedalle

# Naviguer vers le projet
cd /path/to/Reviews-Maker

# Pull des derniers changements
git pull origin feat/templates-backend

# Installer les dépendances
cd client
npm install

# Build de production
npm run build

# Redémarrer le serveur (si PM2)
pm2 restart reviews-maker

# Ou redémarrer le service systemd
sudo systemctl restart reviews-maker
```

---

## 🧪 Commandes de Test Console

### Tester les 5 Thèmes en Séquence

Copier-coller dans la console du navigateur :

```javascript
// Test automatique des 5 thèmes (3s chacun)
const themes = ['violet-lean', 'emerald', 'tahiti', 'sakura', 'dark'];
let index = 0;

function cycleThemes() {
    const theme = themes[index];
    document.documentElement.setAttribute('data-theme', theme);
    console.log(`🎨 Thème ${index + 1}/5 : ${theme}`);
    
    index++;
    if (index < themes.length) {
        setTimeout(cycleThemes, 3000);
    } else {
        console.log('✅ Test de tous les thèmes terminé !');
    }
}

console.log('🚀 Démarrage du test des thèmes...');
cycleThemes();
```

### Vérifier les Variables CSS

```javascript
// Lire toutes les variables d'un thème
function getThemeVariables() {
    const root = document.documentElement;
    const theme = root.getAttribute('data-theme') || 'default';
    const styles = getComputedStyle(root);
    
    console.log(`📊 Variables pour le thème: ${theme}\n`);
    
    const vars = [
        '--text-primary',
        '--text-secondary',
        '--text-tertiary',
        '--text-on-light',
        '--text-on-dark',
        '--bg-primary',
        '--bg-secondary',
        '--bg-tertiary',
        '--bg-input',
        '--primary',
        '--accent'
    ];
    
    vars.forEach(varName => {
        const value = styles.getPropertyValue(varName).trim();
        console.log(`${varName}: ${value}`);
    });
}

getThemeVariables();
```

### Tester le Contraste

```javascript
// Calculer le ratio de contraste entre deux couleurs
function getContrastRatio(color1, color2) {
    function getLuminance(rgb) {
        const [r, g, b] = rgb.match(/\d+/g).map(x => {
            x /= 255;
            return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
}

// Test du contraste actuel
const root = document.documentElement;
const styles = getComputedStyle(root);
const textColor = styles.getPropertyValue('--text-primary').trim();
const bgColor = styles.getPropertyValue('--bg-primary').trim();

// Convertir en RGB si nécessaire
function hexToRgb(hex) {
    if (hex.startsWith('#')) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return hex;
}

const ratio = getContrastRatio(hexToRgb(textColor), hexToRgb(bgColor));
console.log(`📊 Ratio de contraste: ${ratio}:1`);
console.log(`✅ ${ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : '❌ Échec'}`);
```

---

## 📋 Checklist de Validation Pré-Déploiement

### Développement

- [ ] Tous les fichiers CSS modifiés sont sauvegardés
- [ ] Aucune erreur de syntaxe CSS
- [ ] Build local réussi (`npm run build`)
- [ ] Preview fonctionnel (`npm run preview`)

### Tests Manuels

- [ ] Thème Violet-Lean testé
- [ ] Thème Emerald testé
- [ ] Thème Tahiti testé
- [ ] Thème Sakura testé
- [ ] Thème Minuit/Dark testé

### Composants Critiques

- [ ] Page d'accueil
- [ ] Formulaire de création/édition
- [ ] Orchard Studio
- [ ] Galerie de reviews
- [ ] Page Settings

### Accessibilité

- [ ] Tous les ratios de contraste ≥ 7:1
- [ ] Boutons avec texte blanc
- [ ] Inputs lisibles
- [ ] Badges contrastés
- [ ] Labels visibles

### Git

- [ ] Commit créé avec message descriptif
- [ ] Push vers la branche `feat/templates-backend`
- [ ] Pull request créée (si applicable)

---

## 🐛 Commandes de Debug

### Identifier les Éléments Problématiques

```javascript
// Trouver tous les éléments avec contraste insuffisant
function findLowContrast() {
    const elements = document.querySelectorAll('*');
    const issues = [];
    
    elements.forEach(el => {
        const styles = getComputedStyle(el);
        const color = styles.color;
        const bgColor = styles.backgroundColor;
        
        if (color && bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            // Calcul de contraste simplifié
            const text = color.match(/\d+/g);
            const bg = bgColor.match(/\d+/g);
            
            if (text && bg) {
                const textLum = (text[0] * 0.299 + text[1] * 0.587 + text[2] * 0.114) / 255;
                const bgLum = (bg[0] * 0.299 + bg[1] * 0.587 + bg[2] * 0.114) / 255;
                const ratio = textLum > bgLum 
                    ? (textLum + 0.05) / (bgLum + 0.05)
                    : (bgLum + 0.05) / (textLum + 0.05);
                
                if (ratio < 4.5) {
                    issues.push({
                        element: el.tagName,
                        class: el.className,
                        ratio: ratio.toFixed(2),
                        color: color,
                        bgColor: bgColor
                    });
                }
            }
        }
    });
    
    console.table(issues);
    return issues;
}

findLowContrast();
```

### Logs de Variables CSS

```javascript
// Logger toutes les variables CSS définies
function logAllCSSVariables() {
    const allVars = [];
    const sheets = document.styleSheets;
    
    for (let sheet of sheets) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.style) {
                    for (let prop of rule.style) {
                        if (prop.startsWith('--')) {
                            allVars.push({
                                variable: prop,
                                value: rule.style.getPropertyValue(prop).trim(),
                                selector: rule.selectorText
                            });
                        }
                    }
                }
            }
        } catch (e) {
            // Cross-origin stylesheet
        }
    }
    
    console.table(allVars);
}

logAllCSSVariables();
```

---

## 🔄 Rollback (en cas de problème)

### Git Revert

```powershell
# Annuler le dernier commit
git revert HEAD

# Annuler un commit spécifique
git revert <commit-hash>

# Push du revert
git push origin feat/templates-backend
```

### Restauration Manuelle

```powershell
# Restaurer un fichier depuis un commit précédent
git checkout <commit-hash> -- client/src/index.css

# Ou restaurer depuis la branche main
git checkout main -- client/src/index.css

# Commit de la restauration
git add client/src/index.css
git commit -m "Rollback: Restauration de index.css"
git push origin feat/templates-backend
```

---

## 📊 Monitoring Post-Déploiement

### Commandes Serveur

```bash
# Vérifier les logs PM2
pm2 logs reviews-maker --lines 50

# Ou journalctl pour systemd
sudo journalctl -u reviews-maker -n 50 -f

# Vérifier le statut
pm2 status reviews-maker
# ou
sudo systemctl status reviews-maker
```

### Analytics à Surveiller

- Temps passé moyen par page
- Taux de rebond
- Clics sur boutons
- Changements de thème
- Retours utilisateurs

---

## 🎉 Commandes de Célébration

```javascript
// Afficher un message de succès stylé
console.log('%c✨ CORRECTIF DE LISIBILITÉ DÉPLOYÉ ! ✨', 
    'font-size: 24px; font-weight: bold; color: #9333EA; text-shadow: 2px 2px 4px rgba(147, 51, 234, 0.3);');

console.log('%c🎨 Tous les thèmes sont maintenant conformes WCAG 2.1 AAA !', 
    'font-size: 16px; color: #059669;');

console.log('%c📊 Ratios de contraste : 7.2:1 à 15.2:1', 
    'font-size: 14px; color: #0891B2;');

console.log('%c👥 Accessibilité maximale pour tous les utilisateurs', 
    'font-size: 14px; color: #EC4899;');
```

---

## 📞 Support

**En cas de problème :**

1. Vérifier les logs serveur
2. Consulter la documentation :
   - `CORRECTIF_LISIBILITE_THEMES.md`
   - `GUIDE_TEST_LISIBILITE.md`
   - `VARIABLES_CSS_THEMES.md`
3. Tester localement avec les commandes ci-dessus
4. Créer un issue GitHub si nécessaire

---

**Bonne mise en production ! 🚀**
