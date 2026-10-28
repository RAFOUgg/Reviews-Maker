# Terpologie Ops — bot Discord de pilotage

Pilote le robot de développement depuis Discord : salons rangés, un fil par conversation avec Claude (abonnement Pro du compte `hermes`), rapports du robot de nuit en fils dans `#logs`, plan publié dans `#plan`, questions remontées dans `#questions`.

Tourne sur le VPS sous l'utilisateur `hermes`. Claude y travaille dans `~/Reviews-Maker-jour` ; il ne pousse jamais sur `main`, ne déploie jamais, ne touche pas `/home/ubuntu`.

## Salons créés au démarrage
| Catégorie | Salons | Claude peut… |
|---|---|---|
| 📋 PILOTAGE | `#plan` (bot seul), `#questions`, `#brainstorming` | analyser (lecture seule) |
| 🛠 DEV | `#dev`, `#front-end`, `#back-end`, `#da` | coder sur une branche + PR |
| 🚀 PROD | `#prod` (lecture seule), `#logs` (bot seul) | analyser |
| 🗄 ARCHIVES | `#archives` (bot seul) | — |

Écrire dans un salon ouvre un **fil** = une conversation suivie. Une seule exécution Claude à la fois (file d'attente).

## Commandes
- `/statut` — robot libre/occupé, santé prod, PR ouvertes.
- `/lot id:L18 statut:prêt` — change le statut d'un lot (commit du seul fichier du plan sur `main`) ; `prêt` = pris par le robot de nuit à 2h UTC.
- `/plan` — republie le plan. `/archiver` (dans un fil). `/oublier` — conversation vierge dans le fil.

## Installation (VPS, utilisateur `hermes`)
1. Bot Discord : Developer Portal → Bot → activer **Message Content Intent** ; OAuth2 → scopes `bot` + `applications.commands`, permission **Administrator** (ou Manage Channels + Manage Threads + Send Messages + Read Message History) → inviter sur le serveur.
2. Activer le mode développeur Discord (Paramètres → Avancés) → clic droit sur le serveur « Copier l'identifiant » (`GUILD_ID`) et sur ton profil (`OWNER_ID`).
3. ```bash
   cd ~/Reviews-Maker-jour && git pull && cp -r tools/ops-bot ~/ops-bot && cd ~/ops-bot && npm install --omit=dev
   cp .env.example .env && chmod 600 .env && nano .env      # DISCORD_TOKEN, GUILD_ID, OWNER_ID
   mkdir -p ~/.config/systemd/user && cp ops-bot.service ~/.config/systemd/user/
   systemctl --user daemon-reload && systemctl --user enable --now ops-bot
   journalctl --user -u ops-bot -f     # doit afficher « Prêt : … »
   ```
4. Arrêter l'ancienne session Channels (plus nécessaire) : `tmux kill-session -t robot`.
