# 🧪 Guide de Test des Thèmes

## ❌ Problème Identifié

Les thèmes ne s'appliquent pas correctement car les variables CSS utilisent des valeurs **hexadécimales** (`#A855F7`) mais le code CSS essayait de les utiliser avec `rgb(var(--primary))` ce qui ne fonctionne pas.

## ✅ Corrections Apportées

1. **Suppression de `rgb()` autour des variables** : `rgb(var(--primary))` → `var(--primary)`
2. **Ajout des gradients `--gradient-accent`** pour tous les thèmes
3. **Mapping complet des classes Tailwind** vers les variables CSS

## 🧪 Comment Tester

### 1. Recharger l'Application

Rechargez la page : http://localhost:5174/

### 2. Aller dans Settings

Cliquez sur l'icône utilisateur → **Settings**

### 3. Tester Chaque Thème

Cliquez sur chaque carte de thème et observez les changements :

#### 🟣 **Violet Lean** (Par défaut)
- Primaire : Violet vif (#A855F7)
- Accent : Rose-rouge (#E91E63)
- Gradient : Violet → Rose

#### 💚 **Émeraude**
- Primaire : Cyan clair (#06B6D4)
- Accent : Vert émeraude (#10B981)
- Gradient : Cyan → Vert

#### 🔵 **Bleu Tahiti**
- Primaire : Cyan brillant (#06D6D0)
- Accent : Bleu eau (#0891B2)
- Gradient : Cyan → Bleu

#### 🌸 **Sakura**
- Primaire : Rose Sakura (#EC4899)
- Accent : Blanc rosé (#F8E8F0)
- Gradient : Rose → Blanc rosé

#### ⚫ **Minuit**
- Primaire : Gris (#6B7280)
- Accent : Noir (#111827)
- Gradient : Gris → Noir

#### 🔄 **Auto**
- Suit les préférences système
- Clair → Violet Lean
- Sombre → Minuit

### 4. Vérifier dans la Console

Ouvrez DevTools (F12) → Console, et tapez :

```javascript
// Vérifier le thème actuel
document.documentElement.getAttribute('data-theme')

// Vérifier les variables CSS
const styles = getComputedStyle(document.documentElement);
console.log('Primary:', styles.getPropertyValue('--primary'));
console.log('Accent:', styles.getPropertyValue('--accent'));
console.log('Gradient:', styles.getPropertyValue('--gradient-primary'));
```

### 5. Vérifier la Persistance

1. Sélectionner "Émeraude"
2. Recharger la page (F5)
3. Vérifier que le thème Émeraude est toujours actif

## 🐛 Si Les Thèmes Ne Fonctionnent Toujours Pas

### Vérification 1 : Cache du Navigateur

```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Vérification 2 : Serveur Vite

Le serveur doit être redémarré pour prendre en compte les changements CSS :

```bash
# Arrêter le serveur (Ctrl+C)
cd client
npm run dev
```

### Vérification 3 : Inspecter un Élément

1. Clic droit sur un bouton ou élément coloré
2. "Inspecter"
3. Vérifier dans l'onglet "Computed" si `--primary` a une valeur
4. Vérifier dans "Styles" si les classes `.bg-purple-600` utilisent `var(--primary)`

## 📊 Résultat Attendu

Quand vous changez de thème, **toute l'application** doit changer de couleurs :

- ✅ Boutons
- ✅ Accents
- ✅ Bordures
- ✅ Gradients
- ✅ Icônes
- ✅ Textes de surbrillance

## 💡 Note Importante

Les thèmes fonctionnent maintenant grâce aux **overrides CSS** que nous avons ajoutés dans `index.css`. Toutes les classes Tailwind hardcodées (`bg-purple-600`, `bg-green-600`, etc.) sont maintenant **mappées** vers les variables CSS dynamiques.