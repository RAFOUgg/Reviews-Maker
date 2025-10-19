---
applyTo: '**'
---

# Instructions Copilot – Workflow de développement Reviews-Maker

## 1. Analyse et lecture de code
- Toujours lire exhaustivement tous les scripts et fichiers nécessaires à la requête utilisateur avant de générer ou modifier du code.
- Analyser la structure du projet, les dépendances, les interactions entre modules et les impacts potentiels de chaque modification.
- Prendre en compte les instructions spécifiques du projet et les guidelines de codage présentes dans ce dossier.

## 2. Connexion et gestion du VPS
- Pour toute action nécessitant un accès serveur, se connecter au VPS cible (`vps-lafoncedalle`) via SSH :`ssh vps-lafoncedalle`.
- Vérifier l'état des services (Node.js, PM2, etc.), relancer ou diagnostiquer en cas de crash.
- Toujours valider le bon fonctionnement du serveur après déploiement ou modification.

## 3. Gestion du projet GitHub
- Utiliser les commandes git standards pour garantir un workflow propre :
  - `git pull` avant toute modification pour récupérer les dernières mises à jour.
  - Créer une nouvelle branche pour chaque fonctionnalité ou bugfix (`git checkout -b feat/ma-fonctionnalite`).
  - Commiter des changements atomiques et explicites.
  - Utiliser `git merge` ou `git rebase` pour intégrer les modifications, en résolvant proprement les conflits.
  - Ouvrir une Pull Request pour toute intégration sur la branche principale.
- Toujours documenter les changements majeurs dans les messages de commit et/ou le changelog.

## 4. Bonnes pratiques de développement
- Respecter la structure du projet et les conventions de nommage.
- Privilégier la clarté, la maintenabilité et la sécurité du code.
- Ajouter des commentaires explicatifs pour tout code complexe ou critique.
- Tester systématiquement les modifications localement et/ou sur un environnement de staging avant mise en production.
- Nettoyer le code et supprimer les logs ou traces de debug inutiles avant tout merge.

## 5. Réponse aux requêtes utilisateur
- Toujours expliquer les choix techniques et les impacts potentiels lors de la réponse.
- Proposer des alternatives si plusieurs solutions sont possibles.
- S'assurer que la solution proposée est adaptée à l'environnement (VPS, Node.js, front/back, etc.) et au contexte métier du projet.

---
Ce guide doit être respecté à chaque requête ou modification apportée au projet Reviews-Maker.