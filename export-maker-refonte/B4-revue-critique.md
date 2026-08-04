# B4 — Revue critique des artefacts A1→C3

> Passe de contre-vérification (2026-08-04) : chaque affirmation des artefacts A1/A2/B1/B2/B3/C1/C2/C3 a été confrontée au code réel, pas relue. 9 écarts trouvés, dont 4 qui auraient produit un bug ou une régression s'ils avaient été implémentés tels quels.
>
> Méthode : lecture directe de `exportMakerHelpers.js`, `exportMakerConstants.js`, `chainCellPipelines.js`, des 5 templates, de `templates/sections/`, `TypographyControls.jsx`, `index.html` + calcul WCAG réel des contrastes.

---

## R1 — **BLOQUANT** · A1 §3 est faux : la bibliothèque de composants partagés existe déjà

A1 affirme : *« Pas de bibliothèque de composants atomiques formalisée (`MetricChip`, `DataRow`, `SectionHeader`…) : chaque template a ses propres sous-composants locaux »*. C'est faux depuis les commits `dd553971` / `ebcbc618` (2026-08-02/03), soit **la veille** de la rédaction de A1.

`client/src/components/templates/sections/` contient 6 composants partagés, tous consommés par les templates :

| Fichier | Rôle réel | Consommé par |
|---|---|---|
| `ScoreMetric.jsx` | Barre de score /10 + bande sémantique — *« seule source pour toute note affichée dans les 5 templates »* (son propre en-tête) | 5 templates |
| `PipelineStepFields.jsx` | Grille label/valeur des champs d'une étape + `PIPELINE_FIELD_ICONS` | DetailedCard, ModernCompact, BlogArticle |
| `RegistrySections.jsx` | Sections dérivées de `fieldRegistry` (récolte/labo/extraction/…) | 4 templates |
| `SensoryRadar.jsx` | Radar SVG N axes | DetailedCard |
| `TemplateSection.jsx` | Carte de section (glassmorphism) | TraceabilityReport |
| `CultureStatsChart.jsx` | Graphe Recharts stats de culture | DetailedCard |

**Conséquence sur C2** : la spec propose `MetricChip` (= `ScoreMetric` + variantes) et `DataRow` (= le pattern déjà rendu par `RegistrySections`/`PipelineStepFields`). Les implémenter créerait **une deuxième source de vérité parallèle** — exactement le mode de défaillance que ce repo a déjà payé 6 fois (« vocabulaire deviné », cf. CLAUDE.md).

**Correction** : C2 est réécrit en deux catégories — *composants existants à étendre* vs *composants réellement manquants*. Seuls 3 composants sont réellement à créer (`ConstantsBanner`, `PhaseGroup`, `PipelineTimeline` partagé). `MetricChip`/`DataRow` sont supprimés de la spec.

---

## R2 — **BLOQUANT** · C1/B2/C2 utilisent des clés de score qui n'existent pas (7ᵉ occurrence du vocabulaire deviné)

Réel (`exportMakerHelpers.js:140`) :
```js
export const SEMANTIC_SCORE_COLORS = { hi: '#3E7C5A', mid: '#C9922E', lo: '#B5533A' };
export function getScoreBand(v) { … return 'hi' | 'mid' | 'lo' }
```

Les artefacts écrivent partout `good` / `mid` / `low` :
- `C1-tokens.json` → `color.semanticScore.good/mid/low`
- `C1-theme.css` → `--em-score-good` / `--em-score-low`
- `C2-composants.md` → `MetricChip.band?: 'good'|'mid'|'low'`

Un composant écrit sur cette spec ferait `SEMANTIC_SCORE_COLORS['good']` → `undefined` → couleur absente (texte transparent/noir selon le contexte), **sans erreur console**. C'est le scénario exact des 6 bugs déjà documentés.

**Correction** : `hi`/`mid`/`lo` partout dans les artefacts, alignés sur le code qui est la source de vérité.

---

## R3 — **MAJEUR** · La table de densité C1 change silencieusement le ratio 4:3 (et révèle du code mort)

`C1-tokens.json > density.byRatio['4:3'].scaleFactor = 0.85`. Le code réel renvoie **0.9**.

Pourquoi : `4:3` = 1600×1200, donc `isLandscape` (1600 > 1200×1.2 = 1440) est vrai, et la cascade est
```js
isSquare ? 0.7 : isA4 ? 1.0 : isPortrait ? 0.8 : isLandscape ? 0.9 : 0.85
```
Le `0.85` final n'est atteint que par un ratio ni carré, ni A4, ni portrait, ni paysage — c'est-à-dire un ratio strictement entre 1:1.2 et 1.2:1 et différent de 1:1. **Aucun des 5 ratios de `RATIO_DIMENSIONS` ne satisfait ça : la branche `0.85` est du code mort.**

Implémenter l'étape 2 du stepsheet « sortie strictement identique » à partir de cette table aurait donc rétréci tout le format 4:3 de 5,5 % — une régression visuelle silencieuse sur un format entier, introduite par l'étape censée garantir zéro changement.

**Correction** : `4:3 → 0.9` dans la table ; la branche morte est signalée pour suppression explicite (pas de repli implicite dans la nouvelle table).

---

## R4 — **MAJEUR** · La table de densité C1 est à la fois incomplète et surspécifiée

Vérifié par relevé des accès réels dans les 5 templates (35 occurrences) :

| Clé | Réellement consommée ? | Présente dans C1 ? |
|---|---|---|
| `limits.maxTags`, `limits.descriptionLines` | oui | oui |
| `limits.maxCategoryRatings`, `limits.maxInfoCards` | **oui** | **non — manquante** |
| `image.maxHeight`, `image.borderRadius` | **oui** | **non — manquante** |
| `fontSize.title/subtitle/section/text/small` | oui (formules + planchers) | **non — seule l'échelle de base est notée, pas les formules ni les planchers** |
| `layout.columns / imageHeight / contentHeight` | **non — zéro occurrence dans les 5 templates** | **oui (`columns`)** |

Deux conséquences : (a) un `ExportFrame` construit sur cette table ne fournirait pas des valeurs que les templates lisent déjà → `undefined` en cascade ; (b) C2 fait piloter le `Masthead` par `ExportFrame.columns`, une prop dérivée d'un champ que plus personne ne consomme (`layout.*` est mort dans les templates).

**Correction** : la table C1 devient la transcription *exhaustive et exacte* de `getResponsiveAdjustments`, avec `layout.*` marqué mort (candidat suppression, pas fondation).

---

## R5 — **MAJEUR** · Le contraste AA est affirmé, jamais mesuré — et il n'est pas tenu

La checklist devflow exige « Contraste AA minimum sur fond sombre partout » ; B3 ne le mesure nulle part. Calcul WCAG réel (fond charcoal `#0E1512`, fond papier A4 `#F5F2E9` lu dans `DetailedCardTemplate.jsx:120`) :

| Couleur | sur charcoal | sur papier A4 |
|---|---|---|
| `inkCream` #EDEAE0 | 15.38 ✅ | 1.07 ❌ (non utilisé en papier) |
| `sageMuted` #A9B2AA | 8.49 ✅ | 1.93 ❌ (non utilisé en papier) |
| `accentResin` #C9922E | 6.73 ✅ | **2.44 ❌** |
| `score hi` #3E7C5A | **3.73 ⚠️** | 4.40 ⚠️ |
| `score lo` #B5533A | **3.76 ⚠️** | 4.37 ⚠️ |

Deux problèmes réels, pas théoriques :
1. `ScoreMetric.jsx:26` utilise `barColor` (donc `hi`/`lo`) comme **couleur du texte de la valeur chiffrée**, à `fontSize.small` (12-14 px, non-gras au sens WCAG « large text »). À 3.73/3.76 c'est **sous le seuil AA de 4.5** — sur les 5 templates, puisque `ScoreMetric` est partagé.
2. En **mode papier A4**, l'accent ambre est conservé à l'identique (décision actée au correctif #10) : `#C9922E` sur crème = **2.44**. Or c'est le format explicitement pensé pour l'impression. Tout texte accentué y est hors norme.

**Correction** : deux variantes de bande sémantique ajoutées aux tokens — `*Text` (assombri/éclairci pour atteindre ≥4.5 selon le fond) pour le texte, la valeur actuelle restant réservée aux **surfaces** (barres, pastilles, filets) où le seuil applicable est 3:1. C'est un ajout de token, pas un changement de langage visuel : les barres gardent exactement leurs couleurs actuelles.

---

## R6 — **MAJEUR** · Le gap polices est plus grave que ce que décrit B3 §3.3

B3 décrit « ~10 polices proposées non chargées ». Le vrai problème est en amont, dans `TEMPLATE_DEFAULT_IDENTITY` (`exportMakerConstants.js:267`) :

| Template | Police par défaut | Chargée dans `index.html` ? |
|---|---|---|
| `modernCompact` | Inter | ❌ |
| `detailedCard` | Space Grotesk | ✅ |
| `blogArticle` | Merriweather | ❌ |
| `socialStory` | Poppins | ❌ |
| `traceabilityReport` | Inter | ❌ |

**4 templates sur 5 rendent leur identité par défaut dans une police de repli système** — l'utilisateur n'a rien à faire de « mal » pour tomber dessus, c'est l'état par défaut. Un `Merriweather` (serif) qui retombe sur une sans-serif système change complètement le caractère de « Article de Blog ». `index.html` ne charge que Space Grotesk + JetBrains Mono.

**Correction** : c'est l'étape 1 du stepsheet, et sa portée passe de « charger IBM Plex Sans » à « aligner les 5 identités par défaut sur des polices réellement chargées » — décision à trancher (charger Inter/Merriweather/Poppins, ou ramener les défauts sur les 3 polices du territoire retenu).

---

## R7 — **MAJEUR** · Le symptôme central n'est pas localisé : la spec le traite dans l'abstrait

C2 spécifie `ConstantsBanner`/`PhaseGroup` sans dire où ils s'insèrent. Le point d'intervention réel est identifié et unique :

- `DetailedCardTemplate.jsx:287-350` — `StepCard` + `PipelineTimeline` : `rawSteps.map(...)` rend **tous** les champs de **chaque** étape via `summarizeCellFields`. C'est là, et nulle part ailleurs, que 25 étapes à 24 °C / 68 % / 888 ppm produisent 25 cartes identiques.
- La même boucle est **réimplémentée à l'identique** dans `ModernCompactTemplate.jsx:536-569`, `BlogArticleTemplate.jsx:485-511`, `TraceabilityReportTemplate.jsx:342`.
- `PIPELINE_TYPE_BY_KEY` est dupliqué dans 3 fichiers, avec le commentaire aveu « même mapping que DetailedCardTemplate » / « même mapping que ModernCompactTemplate ».

Donc corriger le symptôme central template par template signifierait l'écrire 4 fois — et c'est précisément ce genre de duplication qui a produit les régressions « corrigé sur une surface, pas sur les autres » de l'historique (correctifs #3, #11).

**Correction** : la bonne unité d'extraction n'est pas un atome mais **un `PipelineTimeline` partagé** (bandeau constantes + groupes de phase + `PipelineStepFields` existant + `PIPELINE_TYPE_BY_KEY` unique), consommé par les 4 templates. Une seule implémentation du symptôme central, une seule correction possible.

---

## R8 — **MINEUR** · Incohérences factuelles dans A1/C1

- A1 §1 date la refonte COA v2 au « 2026-08-03 / correctif #10 » ; CLAUDE.md la date du **2026-07-30**, et le 08-03 correspond au correctif #12 (pagination adaptative). Sans impact technique, mais une chronologie fausse dans le document de cadrage.
- C1 `palettesExisting` annonce « 6 entrées » puis en liste 7 (`modern, nature, ocean, sunset, elegant, minimal, resin`) — il y en a bien **7**.
- A1 §2 donne 1:1 = 800×800 (correct), alors que le commentaire du code juste au-dessus dit « 1:1 (1080x1080) » — le **commentaire du code** est faux, pas l'artefact. Signalé pour correction côté code.

---

## R9 — **MINEUR** · Une incohérence DA déjà en prod, non relevée par B3

`ScoreMetric.jsx:36` applique `boxShadow: 0 0 6px <barColor>` — un glow. Le moodboard B2 (§Do/Don't, territoire « Lab Clinique Sombre ») interdit explicitement le glow, qualifié d'héritage du territoire 2 (glassmorphism) écarté. Ce composant étant partagé par les 5 templates, le glow est aujourd'hui présent partout, y compris sur le pilote COA v2 censé incarner le territoire retenu.

Décision à prendre en Phase D : retirer le glow (cohérence stricte avec B2) ou l'assumer comme exception documentée. Recommandation : le retirer — il ne porte aucune information et se rasterise mal en petite taille.

---

## Décisions à consigner (jamais tracées dans un artefact daté)

C3 s'ouvre sur « les 3 décisions utilisateur » sans qu'aucune ne soit consignée ailleurs. Elles sont figées ici pour éviter de les re-litiguer :

| # | Décision | Conséquence |
|---|---|---|
| D1 | L'interactivité (accordéons, tooltips, radar) reste **dans l'aperçu Studio uniquement** — aucun export HTML/JS interactif. | B3 §5.1 clos. `PhaseGroup` est mesuré et exporté **toujours replié**. |
| D2 | Le PDF reste **une image rastérisée par page** (`html-to-image` + `jsPDF.addImage`). | B3 §6.1 clos. Pas d'en-tête/pied de page répété ; la checklist devflow est amendée sur ce point, pas satisfaite. |
| D3 | Le territoire « Lab Clinique Sombre » est **déployé sur les 5 templates**. | `TemplateSection.jsx`/`getGlassTokens` dépréciés en fin de parcours. |

**Nouvelle décision requise (R6)** : polices par défaut des 4 templates non-`detailedCard` — charger Inter/Merriweather/Poppins, ou ramener leurs défauts sur Space Grotesk / IBM Plex Sans / JetBrains Mono ? Bloque l'étape 1 du stepsheet.
