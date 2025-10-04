# Script de Réparation - review.html Corrompu

## Le fichier review.html est corrompu à nouveau !

Le fichier a des balises HTML mélangées. Voici la procédure de réparation :

### Option 1: Restaurer depuis Git (Recommandé)

```bash
# Sur le VPS
cd ~/Reviews-Maker

# Voir les versions disponibles
git log --oneline review.html | head -10

# Restaurer depuis un commit propre (avant la corruption)
# Utiliser le commit 86dd96f ou un commit antérieur propre
git show 86dd96f:review.html > review.html

# Ou forcer la restauration
git checkout 86dd96f -- review.html
```

### Option 2: Télécharger le Fichier Propre depuis GitHub

1. Aller sur : https://github.com/RAFOUgg/Reviews-Maker
2. Naviguer vers `review.html`
3. Cliquer sur "Raw"
4. Copier tout le contenu
5. Sur le VPS :
```bash
cd ~/Reviews-Maker
nano review.html
# Coller le contenu, sauvegarder (Ctrl+X, Y, Enter)
```

### Option 3: Recréer Manuellement (Avancé)

Si les options précédentes ne fonctionnent pas, le fichier doit être recréé à partir de zéro.

## ⚠️ IMPORTANT

**NE PAS ÉDITER review.html MANUELLEMENT DANS UN ÉDITEUR SIMPLE !**

Le fichier semble avoir un problème de corruption qui se produit lors de l'édition manuelle. Utilisez toujours Git pour les modifications.

## Après Réparation

1. Vérifier que le fichier est correct :
```bash
head -20 review.html
```

Devrait commencer par :
```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Studio professionnel pour composer, prévisualiser et exporter des reviews produits cannabis." />
    <title>Reviews Maker · Studio professionnel</title>
```

2. Redémarrer le serveur :
```bash
pm2 restart reviews-maker
```

3. Tester dans le navigateur (Ctrl+Shift+R pour vider le cache)

## Prévention Future

**Pour éviter cette corruption à l'avenir** :

1. **Ne jamais éditer review.html directement** sur le serveur
2. Faire les modifications en local dans VS Code
3. Tester en local
4. Commit + Push
5. Pull sur le VPS

**Workflow recommandé** :
```bash
# Sur votre PC
cd "C:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker"
# Éditer les fichiers dans VS Code
git add -A
git commit -m "Description des changements"
git push origin main

# Sur le VPS
cd ~/Reviews-Maker
git pull origin main
pm2 restart reviews-maker
```
