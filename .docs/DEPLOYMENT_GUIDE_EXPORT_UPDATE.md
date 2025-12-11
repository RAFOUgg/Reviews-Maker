# 🚀 Guide de Déploiement Rapide - Export System Update

## Local (Windows)

### 1. Appliquer la migration

```powershell
# Depuis la racine du projet
.\scripts\migrate-export-system.ps1
```

Ce script va:
- ✅ Créer un backup de la DB
- ✅ Appliquer la migration SQL
- ✅ Vérifier les templates prédéfinis
- ✅ Régénérer le client Prisma

### 2. Tester localement

```powershell
# Terminal 1 - Backend
cd server-new
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Ouvrir: http://localhost:5173

---

## Production (VPS)

### 1. Connexion SSH

```bash
ssh vps-lafoncedalle
```

### 2. Pull des modifications

```bash
cd /var/www/reviews-maker
git fetch
git checkout feat/templates-backend
git pull origin feat/templates-backend
```

### 3. Backup de la DB

```bash
# Créer le dossier de backup
mkdir -p db/backups

# Backup avec timestamp
cp db/reviews.sqlite db/backups/reviews-backup-$(date +%Y%m%d-%H%M%S).sqlite
```

### 4. Appliquer la migration

```bash
# Vérifier que sqlite3 est installé
which sqlite3

# Si non installé (Ubuntu/Debian)
sudo apt install sqlite3

# Appliquer la migration
sqlite3 db/reviews.sqlite < server-new/db/migrations/2025-01-11_templates_permissions.sql
```

### 5. Régénérer Prisma et rebuild

```bash
# Prisma
cd server-new
npx prisma generate

# Build frontend
cd ../client
npm run build
```

### 6. Redémarrer le service

**Option A - PM2**:
```bash
pm2 restart reviews-maker
pm2 logs reviews-maker --lines 50
```

**Option B - Systemd**:
```bash
sudo systemctl restart reviews-maker
sudo systemctl status reviews-maker
sudo journalctl -u reviews-maker -n 50 -f
```

### 7. Vérifier que tout fonctionne

```bash
# Tester l'API
curl https://terpologie.eu/reviews/api/templates

# Vérifier la DB
sqlite3 db/reviews.sqlite "SELECT COUNT(*) FROM templates WHERE category='predefined';"
# Devrait retourner: 4
```

---

## Tests Rapides

### 1. Traductions

- Aller sur la page de connexion
- Vérifier que les textes changent selon la langue du navigateur
- Tester le sélecteur de langue dans les paramètres

### 2. Export Modal

**Compte Gratuit (Consumer)**:
- Créer/ouvrir une review
- Ouvrir l'ExportModal
- Vérifier: Badge "Amateur" visible
- Vérifier: Formats SVG/CSV/JSON avec badge "PRO"
- Vérifier: Résolution 3x bloquée (🔒)
- Vérifier: Branding marqué "Obligatoire"

**Compte Influenceur** (si disponible):
- Vérifier: Tous les formats disponibles
- Vérifier: Résolution 3x débloquée
- Vérifier: Branding désactivable

### 3. Templates

```bash
# Lister les templates prédéfinis
sqlite3 db/reviews.sqlite "SELECT id, name, format, category FROM templates WHERE category='predefined';"
```

Devrait afficher:
```
tpl-compact-1x1|Compact (1:1)|1:1|predefined
tpl-detailed-16x9|Détaillé (16:9)|16:9|predefined
tpl-complete-a4|Complet (A4)|A4|predefined
tpl-premium-9x16|Stories (9:16)|9:16|predefined
```

---

## Rollback en cas de problème

### 1. Restaurer la DB

```bash
# Trouver le backup le plus récent
ls -lth db/backups/

# Restaurer
cp db/backups/reviews-backup-YYYYMMDD-HHMMSS.sqlite db/reviews.sqlite
```

### 2. Revenir à la branche précédente

```bash
git checkout main
# ou la branche stable précédente
```

### 3. Rebuild et restart

```bash
cd client
npm run build

# PM2
pm2 restart reviews-maker

# Systemd
sudo systemctl restart reviews-maker
```

---

## Logs et Debug

### Backend

**PM2**:
```bash
pm2 logs reviews-maker --lines 100
pm2 monit  # Interface de monitoring
```

**Systemd**:
```bash
sudo journalctl -u reviews-maker -f
sudo journalctl -u reviews-maker --since "10 minutes ago"
```

**Fichiers de log**:
```bash
tail -f server-new/logs/error.log
tail -f server-new/logs/access.log
```

### Base de données

```bash
# Inspecter les tables
sqlite3 db/reviews.sqlite

.tables
.schema templates
.schema template_shares

SELECT * FROM templates LIMIT 5;
SELECT * FROM template_shares LIMIT 5;

.quit
```

### Frontend

- Ouvrir DevTools (F12)
- Onglet Console pour les erreurs JS
- Onglet Network pour les appels API
- Vérifier les erreurs i18n

---

## Checklist Finale

- [ ] Backup DB créé
- [ ] Migration SQL appliquée sans erreur
- [ ] 4 templates prédéfinis en DB
- [ ] Client Prisma régénéré
- [ ] Frontend rebuild
- [ ] Service redémarré
- [ ] Traductions fonctionnelles
- [ ] ExportModal affiche les bonnes permissions
- [ ] Logs backend sans erreur critique
- [ ] Tests manuels OK

---

## Support

En cas de problème:

1. Vérifier les logs backend/frontend
2. Consulter `.docs/EXPORT_SYSTEM_UPDATE_2025-01-11.md`
3. Tester en local d'abord
4. Restaurer le backup si nécessaire

**Documentation complète**: `.docs/EXPORT_SYSTEM_UPDATE_2025-01-11.md`
