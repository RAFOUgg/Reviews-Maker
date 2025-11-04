# 🚀 Installation du Démarrage Automatique

Ce guide t'explique comment faire en sorte que Reviews-Maker se lance **automatiquement au démarrage de Windows**.

## 📋 Méthode Simple (Dossier Démarrage)

### Étape 1 : Créer un raccourci

1. **Clic droit** sur `START_DEV_AUTO.bat`
2. Sélectionne **"Créer un raccourci"**
3. Un fichier `START_DEV_AUTO.bat - Raccourci` apparaît

### Étape 2 : Déplacer dans le dossier Démarrage

1. Appuie sur **Win + R**
2. Tape : `shell:startup`
3. Appuie sur **Entrée**
4. **Copie** le raccourci dans ce dossier

✅ **C'est tout !** Au prochain démarrage de Windows, le site se lancera automatiquement.

---

## 🔧 Méthode Avancée (Planificateur de Tâches)

Si tu veux plus de contrôle (par exemple retarder le lancement) :

### Étape 1 : Ouvrir le Planificateur

1. Appuie sur **Win + R**
2. Tape : `taskschd.msc`
3. Appuie sur **Entrée**

### Étape 2 : Créer une tâche

1. Dans le menu de droite, clique **"Créer une tâche..."**
2. **Nom** : `Reviews-Maker AutoStart`
3. Coche **"Exécuter avec les autorisations maximales"**

### Étape 3 : Déclencheur

1. Onglet **"Déclencheurs"** → **"Nouveau"**
2. **Lancer la tâche** : `À l'ouverture de session`
3. **Utilisateur spécifique** : Ton compte Windows
4. **Retarder la tâche de** : `30 secondes` (pour laisser Windows démarrer)
5. Clique **OK**

### Étape 4 : Action

1. Onglet **"Actions"** → **"Nouveau"**
2. **Action** : `Démarrer un programme`
3. **Programme** : `C:\Users\Rafi\Documents\.0AMes-Logiciel\Reviews-Maker\START_DEV_AUTO.bat`
4. Clique **OK**

### Étape 5 : Conditions

1. Onglet **"Conditions"**
2. **Décoche** "Démarrer uniquement si connecté au secteur" (si laptop)
3. Clique **OK**

### Étape 6 : Paramètres

1. Onglet **"Paramètres"**
2. Coche **"Autoriser l'exécution de la tâche à la demande"**
3. Coche **"Si la tâche échoue, recommencer toutes les"** : `1 minute`
4. Clique **OK**

✅ **Terminé !** La tâche est créée.

---

## 🌐 Accès depuis le Réseau Local

### Trouver ton IP locale

Ouvre PowerShell et tape :
```powershell
ipconfig | Select-String "IPv4"
```

Tu verras quelque chose comme : `192.168.1.X`

### Accéder depuis un autre appareil

Sur **n'importe quel appareil connecté au même WiFi** :

1. Ouvre un navigateur
2. Va sur : `http://192.168.1.X:5173` (remplace X par ton IP)
3. Le site Reviews-Maker s'affiche ! 🎉

### ⚠️ Pare-feu Windows

Si ça ne fonctionne pas, autorise le port 5173 :

1. Ouvre **Pare-feu Windows Defender**
2. **"Paramètres avancés"** → **"Règles de trafic entrant"**
3. **"Nouvelle règle..."**
4. Type : **Port**
5. Protocole : **TCP**, Port : **5173**
6. Autoriser la connexion
7. Nom : `Vite Dev Server (Reviews-Maker)`

---

## 🛑 Arrêter les Services

Si tu veux arrêter manuellement :

1. Cherche les fenêtres **"Reviews-Backend"** et **"Reviews-Frontend"**
2. Ferme-les (ou tape `Ctrl+C` dedans)

Ou crée un fichier `STOP_DEV.bat` :

```bat
@echo off
taskkill /FI "WINDOWTITLE eq Reviews-Backend*" /F
taskkill /FI "WINDOWTITLE eq Reviews-Frontend*" /F
echo ✅ Services arrêtés !
pause
```

---

## 📊 Vérifier que ça tourne

Ouvre un navigateur et va sur :
- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000/api/health

Si tu vois les pages, c'est que ça fonctionne ! 🎉

---

## 💡 Astuces

### 1. Réduire automatiquement les fenêtres

Modifie `START_DEV_AUTO.bat`, remplace `cmd /k` par `cmd /c` :

```bat
start "Reviews-Backend" /MIN cmd /c "cd server-new && npm run dev"
start "Reviews-Frontend" /MIN cmd /c "cd client && npm run dev"
```

Les fenêtres se lanceront réduites dans la barre des tâches.

### 2. Logs dans un fichier

Pour garder une trace des logs :

```bat
start "Reviews-Backend" cmd /c "cd server-new && npm run dev >> logs-backend.txt 2>&1"
start "Reviews-Frontend" cmd /c "cd client && npm run dev >> logs-frontend.txt 2>&1"
```

### 3. Notification au démarrage

Ajoute avant `exit` :

```bat
powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.MessageBox]::Show('Reviews-Maker est en ligne !', 'Démarrage', 'OK', 'Information')"
```

---

## 🐛 Problèmes Courants

### Le site ne démarre pas

- Vérifie que Node.js est installé : `node --version`
- Vérifie que les dépendances sont installées :
  ```bat
  cd server-new && npm install
  cd client && npm install
  ```

### Port déjà utilisé

Si le port 3000 ou 5173 est occupé :

1. Trouve le processus : `netstat -ano | findstr :3000`
2. Tue-le : `taskkill /PID [numero] /F`

### Pas d'accès réseau

- Vérifie que le pare-feu autorise Vite (port 5173)
- Vérifie que ton PC et l'autre appareil sont sur le même réseau WiFi
- Essaye de désactiver temporairement le pare-feu pour tester

---

**🌿 Profite de Reviews-Maker en mode automatique !**
