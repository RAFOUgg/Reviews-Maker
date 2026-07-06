# Registre des sources — entité transversale `Source`

> Applique le principe directeur du brief méthodologique `DOCUMENTATION/terpologie-knowledge-base-brief.md` : **aucune donnée n'entre en base sans être taguée avec son niveau de preuve, sa source, sa date et sa juridiction**. Ce registre est l'entité `Source` du schéma suggéré (§3 du brief) — chaque affirmation des documents 01-12 doit pouvoir pointer vers une entrée `id` de ce tableau plutôt que de rester un fait orphelin.
>
> **Hiérarchie de preuve** (reprise du brief) : **T1** peer-reviewed/méta-analyses · **T2** agences/pharmacopées/normes · **T3** technique industriel/brevets/COA labo accrédité · **T4** praticiens experts/SOP artisanales · **T5** marketing/forums (quarantaine, n'entre jamais comme fait).

## Sources T1 — peer-reviewed

| id | Citation | DOI/réf. | Tier | Utilisé dans | Contesté ? |
|---|---|---|---|---|---|
| `pertwee2008` | Pertwee R.G. (2008). The diverse CB1 and CB2 receptor pharmacology of three plant cannabinoids: Δ9-THC, CBD and Δ9-THCV. *Br. J. Pharmacol.* 153:199-215 | — | T1 | 05 §7 (Ki/mécanismes cannabinoïdes) | Non |
| `cascio2010` | Cascio M.G. et al. (2010). Evidence that the plant cannabinoid cannabigerol is a highly potent alpha2-adrenoceptor agonist. *Br. J. Pharmacol.* 159:129-141 | — | T1 | 05 §7 (CBG) | Non |
| `laprairie2015` | Laprairie R.B. et al. (2015). Cannabidiol is a negative allosteric modulator of the cannabinoid CB1 receptor. *Br. J. Pharmacol.* 172:4790-4805 | — | T1 | 05 §7 (CBD) | Non |
| `bolognini2013` | Bolognini D. et al. (2013). Cannabidiolic acid prevents vomiting... *Br. J. Pharmacol.* 168:1456-1470 | — | T1 | 05 §7 (CBDA) | Non |
| `gertsch2008` | Gertsch J. et al. (2008). Beta-caryophyllene is a dietary cannabinoid. *PNAS* 105:9099-9104 | — | T1 | 05 §7, §terpènes (β-caryophyllène agoniste CB2) | Non |
| `karniol1975` | Karniol I.G. et al. (1975). *Pharmacology* 13:502-512 | — | T1 | 05 §7 (CBN, puissance relative) | Non |
| `hlozek2017` | Hložek T. et al. (2017). Pharmacokinetic and behavioural profile of THC, CBD, and CBN in rats. *Eur. Neuropsychopharmacol.* 27:1223-1237 | — | T1 | 05 §7 (CBN sédatif) | **Oui** — remet en cause l'attribution de l'effet sédatif au CBN lui-même |
| `rock2013` | Rock E.M. et al. (2013). *Br. J. Pharmacol.* 170:671-678 | — | T1 | 05 §7 (THCA antiémétique) | Non |
| `jadoon2016` | Jadoon K.A. et al. (2016). *Diabetes Care* 39:1777-1786 | — | T1 | 05 §7 (THCV antidiabétique) | Non, mais **petit essai clinique** (`uncertainty` : effectif réduit) |
| `sawler2015` | Sawler J. et al. (2015). *PLOS ONE* 10:e0133292 | — | T1 | 05 §3 (35%+ étiquetage Indica/Sativa faux) | Non (résultat robuste, 81 individus/13 marqueurs SSR — `uncertainty` : échantillon modeste) |
| `mcpartland2018` | McPartland J.M. (2018). Cannabis systematics at the levels of family, genus, and species. *Cannabis Cannabinoid Res.* 3:203-212 | — | T1 | 05 §3 (chémotypes I-V) | Non |
| `bakel2011` | Bakel H. van et al. (2011). The draft genome and transcriptome of *Cannabis sativa*. *Genome Biology* 12:R102 | — | T1 | 05 §3 (génome de référence Purple Kush) | Non |
| `grassa2018` | Grassa C.J. et al. (2018/2021). *New Phytologist* 230:1665-1679 | — | T1 | 05 §3 (génome CBDRx) | Non |
| `toth2022` | Toth J. et al. (2022). *Plants* 11:215 | — | T1 | 05 §7 (gène Autoflower) | Non |
| `dayanandan1976` | Dayanandan P. & Kaufman P.B. (1976). *Am. J. Bot.* 63:578-591 | — | T1 | 05 §7 (classification trichomes) | Non |
| `livingston2020` | Livingston S.J. et al. (2020). *Plant J.* 101:37-56 | — | T1 | 05 §7 (biologie trichomes) | Non |
| `kim2003` | Kim E.S. & Mahlberg P.G. (2003). *J. Nat. Prod.* 66:1192-1196 | — | T1 | 05 §7 (densité trichomale) | Non |
| `booth2019` | Booth J.K. & Bohlmann J. (2019). *Plant Science* 284:67-72 | — | T1 | 05 §7 (terpènes) | Non |
| `hazekamp2012` | Hazekamp A. & Fischedick J.T. (2012). *Drug Test. Anal.* 4:660-667 | — | T1 | 05 §7 (chemovar) | Non |
| `christianson2017` | Christianson D.W. (2017). *Chem. Rev.* 117:11570-11648 | — | T1 | 05 §7 (>80000 structures terpéniques) | Non |
| `aizpurua2016` | Aizpurua-Olaizola O. et al. (2016). *J. Nat. Prod.* 79:324-331 | — | T1 | 06 §1.8 (évolution THC/terpènes par semaine de floraison) | Non, mais **6 chémotypes seulement** (`uncertainty` : généralisabilité limitée) |
| `lydon1987` | Lydon J., Teramura A.H. & Coffman C.B. (1987). *Photochem. Photobiol.* 46:201-206 | — | T1 | 08 §1 (UV-B +28% THC) | Non |
| `magagnini2018` | Magagnini G. et al. (2018). *Med. Cannabis Cannabinoids* 1:19-27 | — | T1 | 08 §1 (UV-B, confirmation à dose plus faible) | Non |
| `caplan2019` | Caplan D., Dixon M. & Zheng Y. (2019). *HortScience* 54:964-969 | — | T1 | 08 §1 (stress hydrique +12-18% THC) | Non |
| `bagheri2015` | Bagheri M. & Mansouri H. (2015). *J. Plant Stud.* 4:1-8 | — | T1 | 08 §1 (polyploïdie) | Non, mais stabilité reproductive multi-générations **non établie** (`uncertainty` explicite déjà dans doc 08) |
| `wang2016` | Wang M. et al. (2016). *Cannabis Cannabinoid Res.* 1:262-271 | — | T1 | 06 §5 (cinétique décarboxylation) | Non |
| `trofin2012` | Trofin I.G. et al. (2012). *Cellulose Chem. Technol.* 46:285-289 | — | T1 | 06 §2 (photoisomérisation THC→CBN sous UV-A) | Non |
| `zgair2017` | Zgair A. et al. (2017). *Sci. Rep.* 7:14542 | — | T1 | 08 §5 (effet alimentaire ×2-3 biodisponibilité orale) | Non |
| `pomahacova2009` | Pomahacova B., Van der Kooy F. & Verpoorte R. (2009). *Inhalation Toxicology* 21:1108-1112 | — | T1 | 09 (vaporisation vs combustion) | Non |
| `moir2008` | Moir D. et al. (2008). *Chem. Res. Toxicol.* 21:494-502 | — | T1 | 09 (HAP fumée joint vs tabac) | Non |
| `citti2018` | Citti C. et al. (2018). *J. Pharm. Biomed. Anal.* 147:565-579 | — | T1 | 09 (protocole HPLC de référence) | Non |
| `benshabat1998` | Ben-Shabat S. et al. (1998). *Eur. J. Pharmacol.* 353:23-31 | — | T1 | 05 §7 (formulation initiale entourage effect) | **Oui** — origine du concept, cf. `russo2011` et contestation ci-dessous |
| `russo2011` | Russo E.B. (2011). *Br. J. Pharmacol.* 163:1344-1364 | — | T1 | 05 §7 (popularisation entourage effect) | **Oui** — voir `contested-entourage` ci-dessous |
| `adams2017` | Adams T.C. et al. (2017). *NEJM* 376:235-242 | — | T1 | 05 §7 (épidémie AMB-FUBINACA, cannabinoïdes de synthèse) | Non |
| `demeijer2003` | de Meijer E.P.M. et al. (2003) — système de chémotype I-III précurseur | ⚠️ **non vérifié directement dans les sources consultées** | T1 (à confirmer) | 05 §3 (mention historique, remplacé par `mcpartland2018` dans le texte) | `uncertainty` : citation reprise de connaissance générale, pas extraite d'un document consulté cette session — **à vérifier avant toute réutilisation stricte** |

## Sources T3-T4 — technique industriel / praticiens (à valider empiriquement, jamais comme fait établi)

| id | Source | Tier | Utilisé dans | Note |
|---|---|---|---|---|
| `hashcru_site` | hashcru.com (pages HashVac, Headhunter, True Solventless, Naked Press) | **T4** | 08 §2.2, 09, 06 §3 | SOP/pratique propriétaire non peer-reviewed — specs Headhunter (acier 304, >99% pureté) publiées publiquement par le fabricant donc vérifiables, mais Naked Press (0,5µm) reste une donnée de praticien non publiée indépendamment |
| `lowtemp_plates_blog` | lowtemp-plates.com/blogs/knowledge (micron guide, température rosin) | **T3/T4** | 06 §4, 08, 12 | Fabricant de plaques de presse — source technique spécialisée mais commerciale, à recouper |
| `thepressclub_blog` | thepressclub.co (guide température rosin, HashVac 101) | **T4** | 06 §4, 08 | Média communautaire spécialisé solventless |
| `dabpress_blog` | dabpress.com (180°F vs 210°F guide) | **T4** | 06 §4 | Fabricant/blog commercial |
| `frenchycannoli_science` | frenchycannoli.com/science-behind (citations, corpus historique) | **T4** | 06 §2, 08 §2 | Figure historique fondamentale mais praticien, pas chercheur publié — citations traitées comme témoignage qualitatif, pas comme donnée quantitative |

## Sources hors échelle T1-T5 — à traiter à part

| id | Source | Statut | Utilisé dans |
|---|---|---|---|
| `synthese_420_710` | « De 420 à 710 », M.R. — Terpologie, 2023-2025 | **Synthèse secondaire** compilant très majoritairement des sources T1 (citées individuellement ci-dessus quand identifiées) — pas elle-même peer-reviewed en tant qu'ouvrage, mais son contenu factuel hérite du tier de ses citations primaires. Les passages sans citation primaire explicite (rares) doivent être traités comme `uncertainty` non quantifiée. | 05, 06, 08, 09 (base de la mise à jour scientifique 2026-07-06) |
| `marche_estimations` | Connaissances générales de marché (BDSA/Prohibition Partners/New Frontier Data — non revérifiées en session) | **Non noté, hors échelle** — estimation qualitative d'ordre de grandeur, explicitement signalée comme telle en tête du document 07 | 07 (intégralité) |

## Sources T2 — normatif/réglementaire (mentionnées mais pas encore individuellement sourcées)

Le document 09 (méthodes analytiques, normes) cite des référentiels normatifs (USP, Pharmacopée Européenne, ISO/IEC 17025, ASTM) sans DOI/URL individuelle — cohérent avec leur nature de norme plutôt que de publication. **Action de suivi recommandée** (cf. brief §1.9/§2) : lier explicitement aux sources T2 listées dans le brief (AOAC CASP, ASTM D37, NIST, EUDA/ANSM/WHO ECDD/EFSA pour le document 07/réglementation) lors d'une prochaine passe — non fait à ce stade faute de vérification directe cette session.

## Point de contestation majeur consolidé — `contested-entourage`

**Claim** : les terpènes et cannabinoïdes agiraient en synergie pour moduler l'effet ressenti ("entourage effect").
**Position favorable** : `benshabat1998` (formulation initiale), `russo2011` (cadre théorique largement popularisé et cité dans l'industrie).
**Position critique** : le brief méthodologique cite explicitement *Frontiers in Pharmacology* (2020) — étude non consultée directement cette session, à vérifier — selon laquelle les terpénoïdes n'agiraient pas aux récepteurs cannabinoïdes, et des essais THC pur vs fleur entière ne montrant pas de différence significative.
**Statut** : `contested = true`. Ne jamais trancher unilatéralement dans l'app — présenter les deux positions si le sujet est abordé côté utilisateur (cf. document 05 §7, déjà formulé avec la prudence requise, mais sans citer explicitement la contre-étude Frontiers 2020 — **à ajouter lors d'une prochaine vérification**).

## Registre à compléter (mode `contested`/`uncertainty` non encore appliqué systématiquement)

Ce registre couvre les sources déjà mobilisées dans les documents 01-12. Il ne couvre pas encore :
- Les 12 domaines du brief (§1.1-1.12) non explorés dans cette session (ex. HLVd/culture tissulaire au-delà de ce qui est déjà dans 08, IPM/ravageurs, contaminants réglementaires détaillés par juridiction, statut légal HHC/THCP).
- Les acteurs/labos listés au brief §2 non encore individuellement vérifiés (Kannapedia/Medicinal Genomics, Torkamaneh, Root Sciences, etc.).

Ce sont les prochaines cibles naturelles si une passe "domaine par domaine" (option non retenue cette fois, cf. mémoire projet) est engagée ultérieurement.
