# C6 — Plan de finition des rendus

> Établi le 2026-08-05 pour un run autonome. Objectif : amener les 5 templates à un état
> commercialement présentable sur toutes leurs combinaisons format × densité × type.
>
> Règle du run : ne rien déclarer fait sans mesure. Toute correction sans effet mesurable est
> **retirée**, pas laissée en place avec un commentaire optimiste.

---

## 1. État mesuré au démarrage

### Remplissage (règle E6, cible 65–95 %)

| Template | 1:1 | 16:9 | 9:16 | 4:3 | A4 |
|---|---|---|---|---|---|
| Moderne Compact | 66–83 % | **98 %** ✔ | **54–67 %** ✖ | — | — |
| Fiche Technique | — | ~77–80 % | — | ~77 % | 77–98 % |
| Article de Blog | — | ? | — | — | 71–75 % |
| Story | 64–90 % | — | 50–61 % | — | — |
| Traçabilité | — | — | — | — | 96 % |

### Défauts résiduels

| Règle | Reste | Localisation |
|---|---|---|
| E1 contraste | 2 | « Non disponible », mode papier A4 |
| E2 polices | ~12 | hors Moderne Compact (résolu à 0 sur ce template) |
| E3 troncature | 1 | « Humidité ambiante » en mode compact |
| E5 longueur de ligne | 1–2 | ~175 caractères/ligne, A4 |
| G4 numérotation | 3–9 | « 01 / 02 » de Fiche Technique |
| S1 échelle 4/8 | ~600 warn | `gap: 6px` et `10px` de la table de densité |
| S3 chasse tabulaire | ~60 warn | valeurs chiffrées sans `tabular-nums` |

---

## 2. Failles connues, par nature

### 2.1 Faille bloquante — l'ajustement automatique est inerte

`FitToFill` est posé sur Moderne Compact et **n'a aucun effet mesurable** : deux exécutions
successives rendent des remplissages identiques à la décimale. Une hypothèse testée (hauteur du
conteneur non résolue en contexte flex) n'a rien changé. **Cause non diagnostiquée.**

C'est la faille la plus importante : sans ce mécanisme, aucun jeu de constantes ne permettra
d'approcher 100 % sur toutes les configurations, puisque le volume de contenu varie et que le
canevas est fixe.

### 2.2 Faille structurelle — pas de composition par format

Le contrat `FORMAT_LAYOUT` déclare `columns: 2` pour 16:9 et 4:3. Seule Fiche Technique le
consomme. Les autres templates empilent en une colonne quel que soit le format, ce qui laisse
mécaniquement du vide sur les formats larges et de la compression sur les formats hauts.

### 2.3 Faille de méthode — E6 mesure l'étendue, pas la densité

La règle prend le bas du dernier module rapporté à la hauteur du canevas. Un `space-between`
suffirait à afficher ~100 % en écartant des blocs dans le vide. **Une fois l'ajustement
automatique fonctionnel, E6 sera vert par construction et cessera d'être un signal.** Il faudra
basculer sur le débordement (toujours valide) et la validation visuelle.

### 2.4 Manques fonctionnels non entamés

- **Rendu HTML interactif** (`/r/:id` en mode Site) : cellules de pipeline cliquables, sections
  repliables, recette par catégories. Rien de commencé.
- **Réutilisation des vrais canevas** en `readOnly` : `ProductionChainCanvas` et
  `UnifiedGeneticsCanvas` ont déjà le prop ; les `ReadOnly*Canvas` restent des doublons.
- **Grammaire des formulaires** : pastille d'icône, couleur par section, suppression du « 01 ».
- **Traçabilité réellement paginé** (déclaré `false` aujourd'hui).

---

## 3. Ordre d'exécution du run

Chaque item a un critère de sortie **mesurable**. Un item sans effet mesuré est retiré, pas conservé.

| # | Item | Critère de sortie |
|---|---|---|
| 1 | **Diagnostiquer `FitToFill`** par sonde instrumentée (exposer `scale` et `clientHeight` dans le DOM, ne pas inférer depuis le remplissage) | La cause est identifiée et écrite |
| 2 | Rendre l'ajustement automatique effectif, ou le retirer | Remplissage Compact ≥ 90 % sur les 9 combinaisons, ou composant supprimé |
| 3 | Étendre aux autres templates non paginés (Story) | Story ≥ 90 % sur ses 4 combinaisons |
| 4 | Dernière page des templates paginés | Aucune dernière page < 65 % |
| 5 | E2 résiduels hors Compact | 0 violation |
| 6 | E1 papier + E3 + E5 | 0 violation |
| 7 | S1 : aligner la table de densité sur l'échelle 4/8 | 0 avertissement |
| 8 | S3 : `tabular-nums` sur les valeurs chiffrées | 0 avertissement |
| 9 | G4 : retirer la numérotation « 01 / 02 » | 0 violation |
| 10 | Passe finale sur la matrice complète | Rapport consigné |

---

## 4. Journal du run

*(rempli au fil de l'exécution — chaque entrée porte la mesure avant/après)*

### Item 1 — Diagnostic de `FitToFill` ✅

**Cause trouvée, et elle était mienne.** Sonde DOM (attributs `data-fit-*` exposant l'état réel,
plutôt qu'une déduction depuis le remplissage) : `available = 768`, `natural = 768`, échelle 1.

Le conteneur interne porte `height: 100%` — les enfants du template utilisent `h-full`/`flex-1` et
ont besoin d'une hauteur définie. Son `scrollHeight` valait donc la hauteur du canevas, jamais
celle du contenu. **Ma propre compensation détruisait la mesure.**

Correction : mesurer l'extension réelle du contenu (bas du dernier bloc rapporté au haut du
conteneur), divisée par l'échelle courante pour obtenir une valeur invariante — ce qui rend le
calcul stable au lieu de créer une boucle.

### Item 2 — Ajustement automatique effectif ✅

Moderne Compact, remplissage avant → après :

| | 1:1 | 9:16 |
|---|---|---|
| flower/minimal | 66,1 → **88,5 %** | 53,8 → **72,3 %** |
| flower/nominal | 83,1 → **98 %** | 66,8 → **89,8 %** |
| flower/dense | 83,1 → **98 %** | 66,8 → **89,8 %** |
| edible (toutes) | 64,9 → **86,9 %** | 53,6 → **72 %** |

**E6 : 5 erreurs → 0.**

### Item 3 — Extension à Story ⚠ partiel

`FitToFill` + hero élastique (`flex: 1 1 38%`, sans plancher, pour qu'il grandisse ET cède).

| | 1:1 | 9:16 |
|---|---|---|
| flower/minimal | 58,7 → **86,8 %** | 48,4 → **77,9 %** |
| flower/dense | **114,1 %** ✖ | 71,9 → **99,6 %** |
| edible/minimal | 52,9 → **81 %** | 45,8 → **75,3 %** |
| edible/dense | 75,9 → **99,7 %** | 55,8 → **85,3 %** |

**7 combinaisons sur 8 nettement améliorées. Une reste en débordement : flower/dense 1:1 à 114 %.**

Trois tentatives sans effet mesurable sur ce cas précis :
1. hero avec plancher `minHeight: 38%` → retiré (soupçonné d'empêcher la compression) : aucun effet ;
2. hero `minHeight: 0` : aucun effet ;
3. mesure élargie aux blocs de premier niveau, hypothèse du pied de page non compté : aucun effet.

**Cause non diagnostiquée.** Le débordement précédait partiellement ce chantier (100,3 % avant
`FitToFill`), il s'est aggravé de 14 points. À reprendre par sonde instrumentée, comme l'item 1 —
c'est la méthode qui a fonctionné, l'inférence depuis le remplissage ne fonctionne pas.

Effet de bord relevé au passage : un contraste à 3,04:1 apparaît sur `edible/dense` Story 1:1,
probablement lié au hero qui change de hauteur et modifie la superposition. Non traité.
