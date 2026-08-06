# Prompt à coller dans la prochaine session

---

Tu reprends le chantier Export Maker de Reviews-Maker (Terpologie). Lis `CLAUDE.md` puis, dans
`export-maker-refonte/`, **C11** (état mesuré + priorités) et **C12** (le plan de fond). Ne relis
pas les autres documents C*, ce sont des archives.

## Ta première tâche, et rien d'autre avant

**Fiche Technique Détaillée en A4 : 108,2 % de remplissage — du contenu est coupé à l'export.**
C'est le seul défaut qui perde de la donnée ; tout le reste n'est que du vide.

Régression introduite en passant l'A4 de 1 à 2 colonnes (commit `2f9ce905`, motivé par des lignes
de ~175 caractères). Avant : 80,5 %.

**Piste déjà éliminée par mesure — ne la refais pas** : durcir la marge de sécurité en
multi-colonnes (`BUDGET_SAFETY_FACTOR` × pénalité 0,78) n'a eu **aucun effet**, chiffres
strictement identiques. Ce n'est pas le budget de pagination.

**Méthode imposée** : instrumente `computeAdaptivePages` pour qu'il rapporte la hauteur mesurée de
chaque module face au budget. Si un seul module dépasse à lui seul la page, c'est la limite connue
des blocs indivisibles — il faut le rendre sécable, pas retoucher le packer. **Sonde, ne déduis
pas.**

Pour mesurer :
```
# deux serveurs requis
cd server-new && NODE_ENV=development node server.js &
cd client && npm run dev &
node tools/export-audit/run.mjs --matrix --templates=detailedCard --ratios=A4 --types=flower --densities=dense
```

## Les 5 règles, non négociables

Elles ont toutes été payées en heures perdues. Les ignorer les fera repayer.

1. **Sonde, n'infère jamais.** Trois tentatives d'affilée ont échoué par déduction depuis le
   remplissage ; une sonde exposant l'état réel dans le DOM a donné la cause en une mesure.
2. **Une mesure inchangée ne prouve rien si le jeu de test ne contient pas la donnée.** Une
   régression faisant disparaître deux canevas est partie en production avec des métriques
   « identiques » — les fixtures n'avaient ni chaîne ni arbre. C'est corrigé, mais le réflexe reste :
   demande-toi toujours *ce que cette mesure ne voit pas*.
3. **Retire ce qui n'a pas d'effet mesuré.** Six corrections se sont révélées inertes cette
   session ; toutes ont été retirées. Un commentaire qui affirme plus que la mesure est un piège.
4. **Vérifie au clic avant de déployer ce qui touche l'édition.** Build vert et 82 tests verts ne
   prouvent pas qu'un graphe s'édite encore.
5. **Le vocabulaire deviné est LE bug récurrent — 8 occurrences documentées.** N'écris jamais un
   nom de champ « qui semble correct » : vérifie-le dans `fieldRegistry.js`, `extractPipelines()`,
   `DEFAULT_CONFIG.contentModules` ou la table de données concernée.

## Ce qui est acquis — ne le défais pas

- **Répartition des surfaces** : l'ÉCRAN (`/r/:id`, aperçu Studio) est la Vue Détaillée, fluide et
  interactive. Le FICHIER (PNG/PDF/SVG) reste les 5 templates à canevas fixe — seul endroit où
  pagination et calibrage ont un sens.
- **Cinq sources uniques**, chacune ayant remplacé des copies divergentes : `fieldRegistry.js`
  (champs), `fieldIcons.js` (icônes — a absorbé 5 tables concurrentes), `noteEmoji.js` (valeurs),
  `getTemplateColumns()` (colonnes), `PipelineGridView` (grille). **Toute nouvelle table parallèle
  est une régression.**
- **Contrat de projection statique** : aucun composant ne passe en interactif tant que
  l'information révélée au clic n'est pas AUSSI présente dans le fichier exporté.

## Ensuite, dans cet ordre

1. **Réorganiser la Fiche Technique** (doublons, zones vides — captures utilisateur). C'est un
   problème de structure, pas de calcul. **Fais valider le plan de page par l'utilisateur AVANT
   d'écrire une ligne**, sinon ça part en préférences subjectives.
2. **Rendre les grosses sections sécables** — c'est la cause unique des pages à 17 % et 41 %.
3. **Le système de règles du C12** : chaque bloc déclare ses contraintes, le template devient un
   jeu de préférences. C'est ce qui couvre les combinaisons que l'utilisateur demande, sans écrire
   une mise en page par cas.

## Comment travailler avec cet utilisateur

- Français. Ne committe jamais sans demande explicite ; déploie via
  `ssh vps-lafoncedalle "cd ~/Reviews-Maker && bash deploy.sh --vps"`.
- Il a explicitement demandé de **ne pas poser de questions** et d'enchaîner plusieurs corrections
  dans un même tour plutôt que de rendre la main après chacune.
- Il tranche sur le produit, pas sur la technique. Dis-lui ce que tu as **mesuré**, ce que tu as
  **cassé**, et ce que tu n'as **pas pu vérifier**. Il l'accepte ; ce qu'il n'accepte pas, c'est
  qu'on lui annonce « corrigé » sans preuve.
- Une correction sans effet mesuré doit être annoncée comme telle, pas maquillée.
