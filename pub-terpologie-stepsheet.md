# Terpologie — Stepsheet pub audiovisuelle (cible PRO)

## Charte extraite du repo

- **Logo** (`client/public/assets/branding/branding_logo.png`) : feuille de cannabis en dégradé violet, cerclée d'un anneau vert, traversée par un réseau de nœuds ambre reliés par des lignes — littéralement le motif "plante + data" déjà présent dans la marque.
- **Palette codée** (`client/tailwind.config.js`, `client/src/assets/apple-liquid-glass.css`) : violet primaire `#8B5CF6 / #9333EA / #A855F7`, cyan secondaire `#06B6D4 / #22D3EE`, vert accent `#16A34A / #22C55E`, ambre `#F59E0B / #FBBF24`, fond sombre `#07070F`.
- **Système de design** : fichier nommé littéralement `apple-liquid-glass.css` — cartes en verre dépoli (`backdrop-filter: blur`), bordures en dégradé fin 1px, reflets liquides diagonaux ("sheen"), ombres "glow" néon basse opacité, rayons d'angle larges (14–24px, pastilles 999px), easings `cubic-bezier(0.4,0,0.2,1)` et `cubic-bezier(0.25,0.46,0.45,0.94)`.
- **Typo** : pas de webfont custom dans le repo — stack système `-apple-system / SF Pro Display / Segoe UI / Roboto` (voir Hypothèses).
- **Ton produit** : titre HTML "Terpologie - Cannabis Reviews" ; le périmètre réel couvre traçabilité (reviews/pipeline culture), base de données + IA (genetics/PhenoHunt) et automatisation (GrowBrain) — aucune landing page marketing existante dans le repo, copy ci-dessous rédigée pour ce brief.

## Direction artistique retenue

**Apple liquid glass, variante sombre premium.** Verre dépoli, reflets doux et bordures en dégradé — mais sur fond très sombre (`#07070F`) avec lueurs néon violet/cyan/ambre, exactement la combinaison déjà en production dans `apple-liquid-glass.css`. Pour un SaaS pro data-lourd, ce choix évite le "néon gadget" façon Discord tout en gardant la crédibilité technique : la pub montre le produit tel qu'il est, pas un style importé.

## Stepsheet

| # | Durée | Visuel (3D/relief) | Mouvement caméra | Texte écran (FR) | Son/musique | Transition |
|---|---|---|---|---|---|---|
| 1 | 3 s | Vide sombre `#07070F`. Fragments de données brisés en suspension : captures de spreadsheets, étiquettes labo illisibles, lignes de connexion grises/rouges qui clignotent et se cassent. Aucun verre encore — juste du chaos low-opacity. | Travelling avant lent à travers les fragments épars. | DONNÉES ÉPARPILLÉES<br>TRAÇABILITÉ OPAQUE | Nappe synthé sombre, basse pulsée, grain/glitch statique discret. | Flash lumineux violet — les fragments sont "happés" vers le centre. |
| 2 | 3 s | Les fragments se cristallisent en 3 dalles de verre dépoli flottantes (triptyque), bordures en dégradé fin violet→cyan, reflet liquide diagonal qui balaie chaque dalle. | Travelling avant continu, léger arc vers la droite révélant les 3 dalles. | UN SEUL ÉCOSYSTÈME | Montée de nappe + carillon de verre sur la cristallisation. | Push-through : la caméra traverse la dalle centrale. |
| 3 | 4 s | **Pilier Traçabilité** — fil lumineux tubulaire violet→cyan reliant 3 nœuds en verre : icône plante, icône fiole de labo, icône packaging produit. Relief net, glow sur les jonctions. | Travelling latéral suivant le fil de gauche à droite. | DU PLANT AU PRODUIT<br>CHAQUE ÉTAPE TRACÉE | Bips data discrets synchronisés sur chaque nœud traversé. | Le nœud final explose en lumière → cut. |
| 4 | 4 s | **Pilier Data + IA** — molécule de terpène translucide (ball-and-stick, liaisons ambre/violet) en rotation, au-dessus d'une pile de cartes-verre (profils terpènes/cannabinoïdes) qui s'éventaillent en relief léger. | Orbite lente autour de la molécule (~35°). | COMPARER. COMPRENDRE.<br>AVEC L'IA | Arpège scintillant, micro-carillon à chaque carte qui s'éventaille. | Les cartes se replient en un faisceau de lumière qui part vers la caméra. |
| 5 | 4 s | **Pilier Automatisation** — module capteur stylisé (forme ESP32 minimaliste, LED pulsée cyan/vert) d'où montent de fines lignes de données vers un panneau de verre affichant des courbes temps réel en relief. | Contre-plongée, push-in montant du capteur vers le dashboard. | VOTRE CULTURE<br>PILOTÉE EN TEMPS RÉEL | Hum mécanique grave + bips électroniques calés sur les pulsations LED. | Le panneau s'illumine et envahit le cadre (flare blanc). |
| 6 | 3 s | Les 3 objets hero (fil lumineux, molécule, capteur) dérivent vers le centre, orbitent puis fusionnent dans le glyphe feuille-réseau de la marque (écho direct du logo). | Léger retour caméra (pull-back) révélant la convergence des 3 objets. | TROIS PILIERS<br>UN SEUL SYSTÈME | Accord harmonique unique — les trois motifs sonores se résolvent ensemble. | Fondu doux sur le glyphe formé. |
| 7 | 3 s | Le glyphe feuille-réseau flotte, complet, entouré de dalles de verre en orbite lente façon HUD de contrôle — calme, premium. | Orbite à 180° autour du glyphe, cadrage qui se stabilise de face. | TERPOLOGIE<br>L'ÉCOSYSTÈME DATA DU CANNABIS PRO | Nappe tenue, résolution douce. | Le glyphe se simplifie vers le logo officiel. |
| 8 | 4 s | Le glyphe devient le logo Terpologie extrudé en 3D (feuille violette + anneau vert + nœuds ambre), halo de lumière doux. CTA et URL apparaissent en dessous en verre. | Statique, léger zoom-out final révélant le lockup complet. | REJOIGNEZ LES CONTRIBUTEURS<br>terpologie.eu — Accès anticipé | Accord final + fade vers le silence. | Fade to black. |

**Durée totale : 28 s (8 plans).**

## Moodboard

- **Fond** : `#07070F` → `#0F172A`, noir bleuté profond, jamais un noir pur plat.
- **Violet signature** (feuille + UI primaire) : `#581C87 → #7E22CE → #9333EA → #A855F7 → #8B5CF6`.
- **Vert anneau** (halo, contours, repris du fichier logo lui-même) : `#145442 → #299575 → #49B67F`.
- **Ambre réseau** (nœuds data, cohérent avec les nœuds oranges du logo) : `#F59E0B → #FBBF24 → #FCD34D`.
- **Cyan secondaire** (UI/data, hors logo) : `#06B6D4 → #22D3EE`.
- **Matériaux** : verre dépoli en lévitation, bordures 1px en dégradé lumineux, reflet diagonal liquide ("sheen"), objets hero en surface satinée douce (subsurface scattering léger) pour rester cohérents avec le rendu organique/translucide du logo.
- **Lumière** : toujours diffuse, jamais dure ; larges halos flous (façon `liquid-blob`, blur ~80px) en contre-jour violet/cyan ; reflets spéculaires fins uniquement sur les arêtes de verre.
- **Ambiance sonore** : nappes synthétiques sombres et premium (registre keynote tech), percussion minimale, bips électroniques discrets pour souligner la donnée, un seul accord de résolution à la convergence (plan 6), fade propre en sortie.

## Spec technique animateur

| Paramètre | Valeur |
|---|---|
| Ratio | 16:9 (1920×1080, ou 3840×2160 si rendu 4K) |
| FPS | 30 |
| Durée totale | 28 s = 840 frames |
| Easing recommandé | `cubic-bezier(0.4,0,0.2,1)` pour les mouvements UI/verre ; `cubic-bezier(0.25,0.46,0.45,0.94)` pour les reveals d'objets hero — les deux courbes sont déjà utilisées en production dans le design system de l'app |

| Plan | Durée | Frames | Timecode (in–out) |
|---|---|---|---|
| 1 | 3 s | 90 | 0:00–0:03 |
| 2 | 3 s | 90 | 0:03–0:06 |
| 3 | 4 s | 120 | 0:06–0:10 |
| 4 | 4 s | 120 | 0:10–0:14 |
| 5 | 4 s | 120 | 0:14–0:18 |
| 6 | 3 s | 90 | 0:18–0:21 |
| 7 | 3 s | 90 | 0:21–0:24 |
| 8 | 4 s | 120 | 0:24–0:28 |

## Assets 3D à modéliser

1. Logo Terpologie extrudé (feuille violette + anneau vert + nœuds ambre, version volumétrique pour le plan final).
2. Molécule de terpène stylisée (ball-and-stick translucide, liaisons ambre/violet).
3. Fil de traçabilité lumineux (tube courbe animé, dégradé violet→cyan, 3 nœuds : plante / labo / produit).
4. Cartes-données empilables (glass cards avec graphes terpènes/cannabinoïdes en relief léger).
5. Module capteur/grow stylisé (forme ESP32 minimaliste + LED pulsée).
6. Panneau dashboard en verre (courbes temps réel en relief, style `liquid-card`).
7. Particules ambiantes (poussière lumineuse violette/cyan, profondeur de champ).
8. Halos de fond (`liquid-blob` : radial gradient flou, violet/cyan/ambre, animation flottante lente).
9. Fragments de données brisées (plan 1, faible opacité, gris/rouge).

## CTA

- **Principal** : "Rejoignez les contributeurs — terpologie.eu"
- **Variante LinkedIn / B2B** : "Terpologie ouvre son accès anticipé aux professionnels du secteur. Devenez contributeur fondateur — terpologie.eu"

## Hypothèses

- Aucune landing page ou copy marketing existante dans le repo → ton et formulations FR rédigés pour ce brief, dans le cadre légal demandé (aucune promesse médicale/effet thérapeutique).
- Aucune police custom embarquée (stack système façon SF Pro) → recommandation **Inter** ou **General Sans** comme substitut libre pour l'animateur, cohérent avec le style "display" déjà déclaré dans `tailwind.config.js`.
- Aucun asset sonore existant dans le repo → direction sonore proposée ci-dessus à valider avec un sound designer.
- URL `terpologie.eu` reprise du brief fourni, non vérifiable dans le repo (pas de config de domaine en dur côté client/serveur).
- Aucun asset 3D existant au-delà du logo 2D → la liste d'assets ci-dessus est à modéliser intégralement.
- Le vert de l'anneau du logo (`#145442→#49B67F`, mesuré dans le fichier SVG/PNG lui-même) diffère légèrement du vert "accent" utilisé dans l'UI (`#16A34A`) — le moodboard reste fidèle à la couleur réelle du logo plutôt qu'au token Tailwind, pour la cohérence du rendu 3D final.
