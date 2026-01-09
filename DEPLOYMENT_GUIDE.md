# 🚀 Guide Déploiement - Corrections & Arbre Généalogique

## Étape 1: Test local

```bash
# Dans le dossier client/
cd client
npm run dev

# Accéder à http://localhost:5173
# Naviguer vers "Créer Review > Fleur"
# Section 2: Génétiques
```

### Tester les corrections

1. **AnalyticsSection** (Hash page):
   - Aller dans Créer Review > Hash
   - Section 4: Analytiques
   - Vérifier: Pas d'erreur "u is not a function"
   - Hover sur les boutons: animation smooth

2. **VisuelTechnique** (Fleur):
   - Créer Review Fleur
   - Section 5: Visuel & Technique
   - Vérifier: Sliders fonctionnent sans erreur
   - Vérifier: Affichage des scores (0/10)

3. **Arbre Généalogique** (Fleur):
   - Créer Review Fleur
   - Section 2: Génétiques
   - Cliquer sur bouton "🌳 Arbre Généalogique Interactive"
   - Vérifier: Section se déplie
   - Vérifier: Bibliothèque visible (gauche)
   - Vérifier: Canva visible (droite)

## Étape 2: Test arbre généalogique (si données disponibles)

```bash
# Créer quelques cultivars en base (ou charger depuis seed)

# Si cultivars existants:
1. Dans le panneau bibliothèque: chercher par nom
2. Filtrer par type (Indica/Sativa/Hybrid)
3. Drag & drop un cultivar vers le canva
   ✅ Noeud apparaît avec image + nom
4. Ajouter plusieurs cultivars
5. Click "Parent" sur noeud A
6. Click "✓ Enfant" sur noeud B
   ✅ Ligne avec flèche A→B apparaît
7. Drag un noeud
   ✅ Connexions bougent avec
8. Click corbeille
   ✅ Noeud supprimé, connexions also
9. Click "Exporter JSON"
   ✅ JSON téléchargé: genealogie.json
```

## Étape 3: Build de production

```bash
# Vérifier aucune erreur
npm run build

# Vérifier dist/ créé
ls dist/

# Vérifier fichiers générés
ls -la dist/assets/
```

## Étape 4: Déploiement VPS

### Option 1: Script automatique (recommandé)

```bash
# À la racine du projet
./deploy-vps.sh

# Logs du déploiement
# ✅ Build successful
# ✅ Files copied
# ✅ Prisma regenerated
# ✅ PM2 restarted
# ✅ Nginx reloaded
# ✅ Site live
```

### Option 2: Déploiement manuel

```bash
# 1. Construire localement
npm run build

# 2. Copier vers VPS
scp -r dist/* vps-lafoncedalle:/var/www/reviews-maker/

# 3. SSH au VPS
ssh vps-lafoncedalle

# 4. Sur VPS
cd /var/www/reviews-maker
npm run prisma:generate
npm run prisma:migrate

# 5. Redémarrer
pm2 restart reviews-maker
nginx -s reload

# 6. Vérifier
curl http://localhost:5173
```

## Étape 5: Vérification post-déploiement

```bash
# Accéder au site VPS
# https://terpologie.eu/create/flower

# Test 1: Création review fleur
1. Aller dans Créer Review > Fleur
2. Remplir section 1 (Infos générales)
3. Aller section 2 (Génétiques)
4. Vérifier: Pas de TypeScript errors dans console

# Test 2: Arbre généalogique
1. Dérouler "🌳 Arbre Généalogique Interactive"
2. Vérifier:
   - Bibliothèque charge les cultivars
   - Canva drag & drop fonctionne
   - Connexions apparaissent/disparaissent

# Test 3: Analytics (Hash)
1. Aller dans Créer Review > Hash
2. Section 4: Analytiques
3. Vérifier: Pas d'erreur au scroll/interaction

# Test 4: Visuel Technique
1. Rester sur section 5: Visuel & Technique
2. Déplacer les sliders
3. Vérifier: Valeurs mises à jour sans erreur
```

## Vérification logs

```bash
# Sur VPS
# Logs Vite (frontend)
tail -f /var/log/reviews-maker/vite.log

# Logs Node (backend)
tail -f ~/.pm2/logs/reviews-maker-out.log
tail -f ~/.pm2/logs/reviews-maker-err.log

# Chercher erreurs TypeScript
grep -i "typeerror\|syntax error\|cannot read" ~/.pm2/logs/reviews-maker-err.log
```

## Rollback (si problème)

```bash
# Sauvegarder commit précédent
git log --oneline | head -5

# Si besoin de revenir
git revert HEAD

# Rebuild et redeploy
npm run build
./deploy-vps.sh
```

## Points de vérification clés

- [ ] Aucune erreur "u is not a function"
- [ ] Aucune erreur "Cannot read properties"
- [ ] AnalyticsSection hover animations fonctionnent
- [ ] VisuelTechnique sliders réactifs
- [ ] Arbre généalogique drag & drop actif
- [ ] Cultivars chargent depuis API
- [ ] Connexions SVG se dessinent correctement
- [ ] Export JSON valide

## Git commit

```bash
git add -A
git commit -m "feat(flower): Complete genealogy tree implementation + fix critical bugs

- Implement GenealogyCanvas.jsx with drag & drop
- Implement CultivarLibraryPanel.jsx with search
- Integrate genealogy into Genetiques.jsx
- Fix AnalyticsSection Tailwind classes
- Fix VisuelTechnique data guards"

git push origin main
```

---

**⏱️ Temps total**: ~2.5 heures
**📦 Fichiers**: 5 modifiés/créés
**✅ Erreurs corrigées**: 3
**🎯 Fonctionnalités ajoutées**: 1 complète (arbre généalogique)

Vous êtes prêt pour le déploiement! 🚀
