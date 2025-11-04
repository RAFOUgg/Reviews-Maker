# 🚀 Guide d'Installation - Démarrage Automatique

## 📦 Scripts Disponibles

### 1. **START_DEV_AUTO.bat** - Lancer les serveurs
- Démarre le backend (Express)
- Démarre le frontend (React)
- Ouvre automatiquement le navigateur
- Les serveurs tournent en arrière-plan

**Usage** : Double-clic sur le fichier

---

### 2. **STOP_DEV.bat** - Arrêter les serveurs
- Arrête tous les processus Node.js
- Ferme le backend et le frontend

**Usage** : Double-clic quand tu veux tout arrêter

---

### 3. **INSTALL_AUTO_START.bat** - Installer le démarrage automatique
- Crée un raccourci dans le dossier Démarrage de Windows
- Le site se lancera automatiquement à chaque démarrage du PC

**Usage** : Double-clic pour installer le démarrage auto

---

### 4. **UNINSTALL_AUTO_START.bat** - Désinstaller le démarrage automatique
- Supprime le raccourci du dossier Démarrage
- Le site ne se lancera plus automatiquement

**Usage** : Double-clic pour désinstaller

---

### 5. **CREATE_DESKTOP_SHORTCUT.bat** - Créer un raccourci Bureau
- Crée un raccourci sur ton Bureau
- Pour lancer facilement Reviews-Maker

**Usage** : Double-clic pour créer le raccourci

---

### 6. **OPEN_SITE.bat** - Ouvrir le site
- Ouvre directement http://localhost:5173 dans ton navigateur
- (Le serveur doit être lancé avant)

**Usage** : Double-clic pour ouvrir le site rapidement

---

### 7. **OPEN_NETWORK.bat** - Accéder depuis le réseau local
- Affiche ton adresse IP locale
- Ouvre le site accessible depuis ton téléphone/tablette

**Usage** : Double-clic pour voir l'URL réseau

---

## 🎯 Installation Recommandée

### Étape 1 : Installer les dépendances (première fois)

```powershell
# Backend
cd server-new
npm install

# Frontend
cd ../client
npm install
```

### Étape 2 : Créer le fichier .env

```powershell
cd server-new
# Copier .env.example vers .env
copy .env.example .env
# Éditer .env avec tes credentials Discord
```

### Étape 3 : Tester le lancement

Double-clic sur **START_DEV_AUTO.bat**

Le site devrait s'ouvrir sur http://localhost:5173

### Étape 4 : Installer le démarrage automatique (optionnel)

Double-clic sur **INSTALL_AUTO_START.bat**

Maintenant, à chaque démarrage de Windows, le site se lancera automatiquement ! 🎉

---

## 📱 Accès depuis ton téléphone/tablette

1. Lance **OPEN_NETWORK.bat**
2. Note ton adresse IP (ex: `192.168.1.50`)
3. Sur ton téléphone, ouvre le navigateur et va sur :
   ```
   http://192.168.1.50:5173
   ```

**⚠️ Important** : Ton téléphone et ton PC doivent être sur le même réseau WiFi !

---

## 🛑 Désinstaller le démarrage automatique

Si tu ne veux plus que le site se lance au démarrage de Windows :

Double-clic sur **UNINSTALL_AUTO_START.bat**

---

## 🔧 Dépannage

### Le site ne se lance pas
1. Vérifie que Node.js est installé : `node --version`
2. Vérifie que les dépendances sont installées (voir Étape 1)
3. Vérifie le fichier `.env` dans `server-new/`

### Le navigateur ne s'ouvre pas automatiquement
- Ouvre manuellement http://localhost:5173
- Ou lance **OPEN_SITE.bat**

### Les serveurs ne s'arrêtent pas
- Lance **STOP_DEV.bat**
- Ou ouvre le Gestionnaire des tâches et tue les processus Node.js

### Accès réseau local ne fonctionne pas
1. Vérifie que le pare-feu Windows autorise les connexions entrantes sur le port 5173
2. Dans Vite config, vérifie que `host: '0.0.0.0'` est configuré

---

## 💡 Astuces

### Épingler à la barre des tâches
1. Clic droit sur **START_DEV_AUTO.bat**
2. Créer un raccourci
3. Glisse le raccourci dans la barre des tâches

### Personnaliser l'icône du raccourci Bureau
1. Clic droit sur le raccourci → Propriétés
2. Changer l'icône → Parcourir
3. Choisis une icône dans `C:\Windows\System32\imageres.dll`

---

**Prêt à coder ! 🚀**
