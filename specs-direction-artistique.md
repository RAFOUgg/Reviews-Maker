# Terpologie · Export Maker — Direction artistique v2

Specs accompagnant la maquette `terpologie-coa-v2.html`. Objectif : un **produit fini**
pro, cohérent sur tous les formats d'export (image / vidéo / doc / vectoriel / GIF / HTML /
tableur) depuis un **template unique** paramétrable.

---

## 1. Le problème diagnostiqué

Les 3 rendus actuels partagent la même racine : **le mapping donnée → visuel est unique
alors que les données sont de natures différentes.**

| Type de donnée | Rendu actuel (cassé) | Rendu correct |
|---|---|---|
| Score /10 | 20 barres violettes identiques | barre courte, couleur selon valeur, chiffre attaché |
| Tag / arôme | pills empilées sans ordre | chips **catégorisées** (dominant vs secondaire) |
| Mesure + unité | prose dense (`Type : glass Volume...`) | **grille** clé/valeur/unité |
| % cannabinoïde | absent ou noyé | barres à échelle réelle + total |
| Note globale | perdue | **un** grand chiffre, gagné |

Second problème : **tout brille** (glassmorphism partout + 5 accents concurrents violet/
vert/ambre/cyan/rose) → aucune hiérarchie. La refonte impose **un système**, pas un
arc-en-ciel.

---

## 2. Tokens (à câbler dans le thème Export Maker)

### Couleur — 1 accent, 2 signaux
```
--ink      #0E1512   surface fond (charcoal-vert)
--ink-2/3  #16201B / #1E2B24   surfaces surélevées / cartes
--line     #2C3A32   filet
--resin    #C9922E   AMBRE RÉSINE — accent unique (scores, marque)
--plant    #3E7C5A   VERT PLANTE — signal "conforme / vérifié"
--clay     #B5533A   TERRACOTTA — signal "attention / bas"
--tx/2/3   #EDEAE0 / #A9B2AA / #6E7A72   texte
```
Ambre = trichome, vert = plante : **l'identité vient du sujet**, pas d'un dégradé SaaS
générique. Le violet actuel disparaît.

Mode papier (export doc/print) : fond `#F5F2E9`, encre `#1A211D`, filets `#D8D2C2`.
Les accents restent identiques → cohérence écran/print.

### Couleur des scores (règle unique, réutilisable partout)
```
valeur ≥ 7.5  → vert  (hi)
5 ≤ v < 7.5   → ambre (mid)
v < 5         → terracotta (lo)
```
Cette règle seule règle 80 % de la lisibilité : l'œil trie les scores par couleur.

### Typographie — 3 rôles
- **Display** : Space Grotesk 600/700 — titres, nom de variété, gros chiffres.
- **Body** : Inter 400/500/600 — labels, textes.
- **Data** : JetBrains Mono (chiffres tabulaires) — **essentiel pour un COA** : les
  décimales s'alignent, les % se lisent en colonne.

### Espacement / rayons
Base 4 px. Rayons : cartes 14 px, éléments 9 px. Filets 1 px `--line`.

---

## 3. Structure du template "Fiche Technique"

```
┌───────────────────────────────┬──────────────────┐
│ marque · doctype              │                  │
│ CATÉGORIE (eyebrow)           │   visuel produit │
│ Jiattela  (display 52px)      │   4:3, dégradé   │
│ producteur · lot · date       │   de lisibilité  │
│ [Type][Conso][Labo][Cert]     │   côté texte     │
│                    7.6/10 ◄─── note globale       │
├───────────────────────────────┴──────────────────┤
│ 01 ÉVALUATION SENSORIELLE                         │
│  ┌ Visuel&texture ┐ ┌ Odeur&arôme ┐ ┌ Goût&effets ┐│
│  │ 3 colonnes = 3 familles, moyenne par famille   ││
│  │ barres courtes color-codées, chiffre attaché   ││
├───────────────────────────────────────────────────┤
│ 02 PROFIL CANNABINOÏDE     │  radar 6 axes         │
│  THC/THCA/CBD... % réel     │  empreinte sensorielle│
├───────────────────────────────────────────────────┤
│ 03 PROFIL AROMATIQUE  — chips dominants / secondaires│
├───────────────────────────────────────────────────┤
│ 04 DONNÉES LABO & CURING — grille 4 col clé/val/unité│
├───────────────────────────────────────────────────┤
│ QR · identifiant non-réglementaire · TERPOLOGIE   │
└───────────────────────────────────────────────────┘
```

**Numérotation 01–04** : gardée parce que le doc EST une séquence de lecture
(identité → sensoriel → chimie → arôme → labo). Pas de la déco.

### Signature de marque
Le **pastille conique ambre→vert** (logo) + le **QR + mention "identifiant non
réglementaire"** en pied = la chose qu'on retient et qui dit "certificat Terpologie".
C'est là qu'on dépense l'audace ; tout le reste reste discipliné.

---

## 4. Adaptation par format (un template → tous les exports)

Le même modèle de données alimente chaque format ; seul le **layout token** change.

| Format | Ratio / support | Adaptations |
|---|---|---|
| **HTML interactif** | responsive | radar animé, toggle écran/papier, barres animées |
| **Image PNG/JPG** | 1:1 · 16:9 · 4:3 | snapshot du DOM (Playwright/Satori) à `scale=2` |
| **Story / vidéo** | 9:16 | 1 famille par "carte", reveal séquentiel des barres |
| **Document / PDF** | A4 | **mode papier**, filets, pas d'ombres, QR contrasté |
| **Vectoriel SVG** | ∞ | radar + barres déjà en SVG → export direct propre |
| **GIF** | 1:1 | boucle : radar qui se trace + barres qui montent |
| **Tableur** | .xlsx | familles=onglets, métriques=lignes, valeurs=colonnes |

> ⚠️ Le SVG actuel (`review-Jiattela...svg`, 4,5 Mo) est un **dump de styles calculés**
> (tout le CSS inline, `foreignObject`). Inexploitable pour un pipeline propre. Le bon
> export vectoriel se génère **depuis le modèle de données**, pas en aplatissant le DOM.

---

## 5. Règles de rendu à coder (checklist d'implémentation)

1. **Jamais** deux types de données dans le même composant visuel.
2. Score → composant `<Metric>` : label + valeur mono + barre color-codée (règle §2).
3. Regrouper les métriques par **famille** avec moyenne ; max ~6 lignes par colonne.
4. Tags → `<ChipGroup>` avec niveau (`primary` = dominant, sinon neutre).
5. Mesures → `<DataGrid>` clé / valeur / unité ; **jamais** de prose concaténée.
6. Cannabinoïdes → barres à échelle sur le **max du jeu**, + ligne Total distincte.
7. Un seul gros chiffre : la note globale. Rien d'autre ne rivalise en taille.
8. Chiffres toujours en police mono à chasse tabulaire.
9. Qualité plancher : responsive mobile, focus clavier visible, `prefers-reduced-motion`.
10. Écran ↔ papier = même structure, seuls fond/filets/ombres changent.

---

## 6. Ce qui reste à faire (hors périmètre de cette itération)

- Décliner les 4 autres templates (Moderne Compact, Article, Story, Rapport traçabilité)
  sur ces mêmes tokens.
- Brancher le pipeline d'export réel (Satori pour SVG/PNG, Playwright pour vidéo/GIF,
  `docx`/`xlsx` pour doc/tableur).
- Intégration en composants React dans l'app Terpologie.

Fichier maquette : **`terpologie-coa-v2.html`** — ouvre-le, bascule Écran / Document,
inspecte le code : chaque composant est isolé et piloté par le bloc de données en haut du
`<script>`.
