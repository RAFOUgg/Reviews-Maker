# Configuration Remote SSH pour VS Code

But: configurer une connexion SSH unique réutilisable pour tous les projets.

1) Placer votre clé privée dans `C:\Users\<votre_user>\.ssh\` (ex: `id_rsa_lafoncedalle`).
2) Mettre à jour `C:\Users\<votre_user>\.ssh\config` en ajoutant un hôte pour le VPS :

Host vps-lafoncedalle
  HostName 51.75.22.192
  User ubuntu
  IdentityFile C:\\Users\\Rafi\\.ssh\\id_rsa_lafoncedalle
  IdentitiesOnly yes
  ForwardAgent yes

Remplacez `IdentityFile` si votre clé porte un autre nom.

3) Ouvrez VS Code -> Remote-SSH -> Connect to Host... -> choisissez `vps-lafoncedalle`.

4) Une fois connecté, vous verrez le filesystem du VPS; ouvrez le dossier `~/Reviews-Maker`.

Diagnostics rapides (script): exécutez `./scripts/vps-diagnostics.sh` sur le VPS pour collecter les logs et l'état de pm2, node, docker (si présent) et l'accès aux DB.