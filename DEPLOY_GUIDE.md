# 📦 Guide de Déploiement Reviews-Maker

## Aperçu

Le script `deploy.sh` est **bi-directionnel** et peut être exécuté en **LOCAL** ou directement sur le **VPS**.

### Mode LOCAL
Compile le frontend, fait un git push, puis déploie sur le VPS via SSH.

### Mode VPS  
Git pull, vide le cache nginx, recharge nginx, met à jour les dépendances et redémarre le serveur.

---

## 🚀 Déploiement depuis le LOCAL (Recommandé)

### Syntaxe

```bash
./deploy.sh "message de commit"
```

### Exemples

```bash
# Déploiement simple
./deploy.sh "feat: fix pipeline curing phases"

# Déploiement rapide (sans confirmations)
./deploy.sh "fix: nginx cache issue" --force

# Déploiement sur une branche spécifique
./deploy.sh "feat: new feature" develop
```

### Phases exécutées

1. ✅ **Build Frontend** - Compile avec Vite
2. ✅ **Git Operations** - Commit + Push vers GitHub
3. ✅ **SSH Déploiement** - Se connecte au VPS et lance le déploiement

---

## 🖥️ Déploiement DIRECT sur le VPS

Quand vous êtes directement sur le VPS (SSH), vous pouvez déployer localement :

### Syntaxe

```bash
./deploy.sh --vps
```

### Exemple

```bash
ubuntu@vps-acc1787d:~/Reviews-Maker$ ./deploy.sh --vps
```

### Phases exécutées

1. ✅ **Git Pull** - Récupère les changements distants
2. ✅ **Nginx Cache Clear** - Vide le cache et les anciens chunks
3. ✅ **Nginx Reload** - Recharge la configuration
4. ✅ **Backend Update** - Met à jour les dépendances + Prisma
5. ✅ **PM2 Restart** - Redémarre le serveur Node.js

---

## 🔧 Options Disponibles

```bash
./deploy.sh [message] [branche] [options]
```

### Flags

| Flag | Description | Exemple |
|------|-------------|---------|
| `--force` | Force sans confirmations | `./deploy.sh "msg" --force` |
| `--skip-git` | Saute la phase git | `./deploy.sh --skip-git --vps` |
| `--vps` | Force le mode VPS | `./deploy.sh --vps` |
| `--local` | Force le mode LOCAL (même sur VPS) | `./deploy.sh "msg" --local` |

---

## 📊 Logs et Vérification

### Voir les logs du serveur

```bash
# En direct
pm2 logs reviews-maker

# Les 50 dernières lignes
pm2 logs reviews-maker --lines 50

# Depuis le LOCAL
ssh vps-lafoncedalle "pm2 logs reviews-maker --lines 20"
```

### Vérifier le statut

```bash
pm2 status
# ou depuis LOCAL
ssh vps-lafoncedalle "pm2 status"
```

### Redémarrer manuellement

```bash
pm2 restart reviews-maker
```

### Arrêter le serveur

```bash
pm2 stop reviews-maker
```

---

## 🐛 Troubleshooting

### Cache Nginx verrouille l'ancienne version

Le script vide automatiquement le cache :
```bash
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

### PM2 n'a pas redémarré correctement

Vérifiez les logs :
```bash
pm2 logs reviews-maker
pm2 show reviews-maker
```

Redémarrez manuellement :
```bash
pm2 kill
pm2 start ecosystem.config.cjs
```

### Erreur "Git unstaged changes"

Le script les stash automatiquement, mais vous pouvez le faire manuellement :
```bash
git stash
git pull origin main
```

### Nginx refuse de recharger

Vérifiez la configuration :
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## 🎯 Cas d'usage courants

### Corriger un bug en prod

```bash
# LOCAL
./deploy.sh "fix: correct bug in pipeline"
# → Build + Push + Déploie automatiquement
```

### Faire un déploiement rapide en prod (vous êtes déjà sur le VPS)

```bash
# SUR LE VPS
./deploy.sh --vps
# → Git pull + Cache clear + Nginx reload + PM2 restart
```

### Déployer une nouvelle branche

```bash
# LOCAL (branche develop)
./deploy.sh "feat: new feature" develop
```

### Force sans confirmations

```bash
./deploy.sh "urgent fix" --force
```

---

## 📝 Checklist avant déploiement

- [ ] Code testé localement
- [ ] Pas d'erreurs de compilation (Vite)
- [ ] Message commit clair et descriptif
- [ ] Pas de secrets/tokens dans les fichiers
- [ ] Vérifier les logs post-déploiement

---

## 🚨 Important

- **Cache Nginx** : Le script vide automatiquement `/var/cache/nginx` pour éviter que les anciennes versions soient servies
- **PM2 Graceful Reload** : Attend que les anciennes connexions se ferment avant de redémarrer
- **Backup** : Pas de backup automatique. Faites un `git pull` avant de déployer pour sauvegarder l'état précédent

---

## 📞 Commandes rapides

```bash
# Déployer depuis local avec message
./deploy.sh "feat: my feature"

# Déployer sur VPS
./deploy.sh --vps

# Voir les logs
pm2 logs reviews-maker

# Statut complet
pm2 show reviews-maker

# Redémarrer
pm2 restart reviews-maker

# Vérifier config nginx
sudo nginx -t
```

---

**Dernière mise à jour** : Février 2026  
**Nginx Reloadé** : ✅  
**Cache Nettoyé** : ✅  
**PM2 Actif** : ✅
