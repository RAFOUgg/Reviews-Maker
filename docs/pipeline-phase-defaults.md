# Pipeline: 'phase' as system default (Summary)

✅ Objectif : harmoniser le comportement des timelines pour toutes les pipelines afin que le mode "phase" soit le comportement par défaut du système (UI + sauvegarde côté serveur), et restreindre les options d'intervalle par type de pipeline.

## Changements appliqués
- Client :
  - `PipelineDragDropView` :
    - Ajout des options d'intervalle conformes aux règles demandées (culture, curing, separation, extraction, purification, recipe).
    - Support de `phase` par défaut et génération des cellules de phases basées sur le type (culture, curing, separation, extraction, recipe).
    - Correction du titre d'en-tête pour afficher le bon label par type.
  - Wrappers : `SeparationPipelineDragDrop` et `ExtractionPipelineDragDrop` => maintenant `type` par défaut = `'phase'` et injectent les phases par défaut si nécessaires.
  - `CuringMaturationSection` => `type` par défaut = `'phase'` et injecte `CURING_PHASES`.
  - `client/src/config/pipelinePhases.js` : ajout de jeux de phases par défaut pour `SEPARATION_PHASES` et `EXTRACTION_PHASES`.

- Server :
  - `server-new/routes/pipeline-culture.js`
    - POST `/api/reviews/:reviewId/pipeline` accepte maintenant `phases` et les persiste (JSON string).
    - PUT `/api/reviews/:reviewId/pipeline` accepte la mise à jour de `phases`.
    - GET renvoie `phases` en tant que tableau (parsing sécurisé si null).

- Tests / verification :
  - Ajout d'un script d'aide `server-new/scripts/verify-pipeline-phases.js` pour vérifier la persistance/parsing des `phases` via Prisma.

## Checklist de vérification (PR / QA)
1. Démarrer le client et le serveur en local.
2. Créer/éditer une review (Flower, Hash, Concentré) et ouvrir la section pipeline correspondante.
3. Vérifier que le type par défaut est `phase` et que les phases s'affichent (culture => 12 phases, curing/separation/extraction => phases par défaut).
4. Enregistrer la review et vérifier que le champ `*TimelineConfig.phases*` est envoyé au backend (contrôler requête réseau).
5. Appeler `GET /api/reviews/:id/pipeline` et vérifier que `phases` est retourné comme tableau JSON.
6. Lancer `node server-new/scripts/verify-pipeline-phases.js` (avec DB et env configurés) pour valider la création/suppression test.
7. Ouvrir la page de détail publique / galerie et l'Export Maker pour vérifier que la timeline s'affiche en lecture seule (Export Maker doit consommer `timelineConfig.phases` ou les cellules correspondantes).

## Notes techniques & décisions
- Le backend continue de générer automatiquement des `pipelineStage` seulement pour `mode === 'jours'` (comportement inchangé). Le mode `phase` est un concept UI/structural (phases groupées). Si vous voulez que le backend auto-crée des `PipelineStage` pour `phase`, on peut ajouter cette génération (demande explicite requise).
- Les phases par défaut pour `separation` et `extraction` sont génériques (4 phases). On peut affiner les libellés si vous fournissez le contenu exact.

---
Si vous validez cette approche je peux :
- Ajouter des tests automatisés (Jest/Mocha) pour le backend et le frontend, ou
- Modifier le backend pour auto-générer `PipelineStage` pour `phase` (si vous le souhaitez).

