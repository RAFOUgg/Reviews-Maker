REVIEW FLEUR – INVENTAIRE COMPLET DES DONNÉES
1. INFORMATIONS GÉNÉRALES
1.1 Identification produit
Champ	Type	Valeurs / Options	Unité	Interaction
Nom commercial	Texte libre	Libre	–	Obligatoire, unique ou concat (Cultivar – Phéno – Batch)
Cultivar / Strain	Multi‑select	Bibliothèque DB cultivars (dropdown)	–	Obligatoire → remplit auto Breeder, type génétique
Code phénotype	Texte court	Auto‑généré (PH‑01, S1‑02, CUT‑03, etc.)	–	Optional, lie à code clone si applicable
Code clone	Texte court	CUT‑XXXXX, MOTHER‑XXXXX	–	Optional, si issu de clone maternel
Code batch / Lot	Texte court	Numéro interne producteur	–	Lié à Farm / Producteur pour traçabilité
Producteur / Farm	Auto‑complete	DB fermes existantes ou new entry	–	Lié à région, type légal, certifications
Région / Pays	Enum + texte	France (énumération par région : Grand Est, Île‑de‑France, Provence…), UE (liste pays), International	–	Affecte légalité, conditions climat simulées
1.2 Classification légale & commerciale
Champ	Type	Valeurs / Options	Unité	Interaction
Type légal	Enum	CBD ≤0,3% THC (EU), THC récréatif (légal juridiction), Médical/Pharma, CBN/CBG spécialisé, Expérimental non‑commercialisé	–	Conditionne affichage données THC/CBD
Type de produit	Enum	Fleur brute, Fleur enrichie (hash/kief/distillat/live rosin), Fleur transformée (moulu, compressé), Pré‑roll, Pré‑roll enrichi	–	Optionnel; affecte méthodo goûts/odeurs
Certification / Label	Multi‑enum	Bio (AB/Demeter/Ecocert), Fair‑trade, GMP, GACP, aucune, autre (texte)	–	Optionnel; informatif
1.3 Traçabilité temporelle
Champ	Type	Valeurs / Options	Unité	Interaction
Date de récolte	Date	JJ/MM/AAAA	–	Source de vérité pour durée séchage + curing
Date de fin de séchage	Date	JJ/MM/AAAA	–	Auto‑calculable (récolte + durée séchage pipeline)
Date de début de curing	Date	JJ/MM/AAAA	–	Généralement = fin séchage
Date d'analyse sensorielle / Review	Date	JJ/MM/AAAA (auto : aujourd'hui)	–	Permet calcul "âge du produit à l'analyse"
Âge du produit au test	Nombre + enum	Calc = Date review – Date récolte	Jours / Semaines / Mois	Auto‑calculé; affecte profil organoléptique
Stade de maturation au test	Enum	Fraîchement curé (< 1 sem), Jeune curing (1–2 sem), Bien curé (2–4 sem), Mature (1–3 mois), Très mature (3–6 mois), Archive (6+ mois)	–	Dérivé âge; labels effet attendu
1.4 Métadonnées visuelles produit
Champ	Type	Valeurs / Options	Unité	Interaction
Galerie photos (1–4)	Upload images	Formats : JPG, PNG, WebP; max 5 MB/photo	–	Optionnel; tags par photo
Tags photos	Multi‑enum par photo	Macro tête, Macro trichomes, Packaging, Certificat labo, Full bud, Broken pieces, Trim debris, Scale reference	–	Aide catalogage visuel
Vidéo (optionnel)	Upload video	Format MP4 < 30 sec; 1080p souhaité	–	Optionnel; affiche qualité emballage, texture
2. GÉNÉTIQUE & TRAÇABILITÉ LIGNÉE
2.1 Arborescence génétique
Champ	Type	Valeurs / Options	Unité	Interaction
Nom breeder / Sélectionneur	Auto‑complete	DB breeders (ex : Barney's, DNA, Compound Genetics, Cannarado…)	–	Pré‑rempli si cultivar sélectionné
Variété parente (P1)	Texte + select DB	Nom lignée source	–	Optionnel; enrichit arbre généalogique
Variété parente (P2)	Texte + select DB	Nom lignée source	–	Optionnel; pour crosses documentées
Type de cross / Hybridation	Multi‑enum	F1, F2, BX1–BX5, S1–S5 (selfing générations), IBL (inbreeding line), Landraces, Polyhybride	–	Affecte stabilité génétique, rendement
Composition génétique	Multi + %	Indica % : 0–100, Sativa % : 0–100, Ruderalis % : 0–100	%	Calc auto : doit = 100%
Dominante cannabinoïde estimée	Enum	THC‑dominant (> 15% THC, < 1% CBD), CBD‑dominant (> 5% CBD, < 3% THC), Équilibré (1–5% THC, 1–5% CBD), CBG‑dominant, Rare (THCV‑dom, CBDV‑dom, CBN), Inconnue	–	Dérivable des analyses cannabinoïdes
Statut phénotype	Enum	Keeper (garde à cloner), Test (évaluation), Phénominale (exceptionnelle), Rejet (non conserver), Clone‑only (propagation végétal)	–	Affecte décision reproduction
Notes généalogie	Texte libre	Données breeder (date sortie, stabilité, notes reproduction)	–	Optionnel; contexte historique
3. DONNÉES ANALYTIQUES (CANNABINOÏDES & TERPÈNES)
3.1 Cannabinoïdes majeurs & mineurs
Champ	Type	Valeurs / Options	Unité	Interaction
Δ9‑THC	Nombre décimal	0.0 – 35.0 (réaliste; max ~32% labs confirmés)	% poids sec	Obligatoire si certificat fourni
THCa (acide)	Nombre décimal	0.0 – 30.0	% poids sec	Optionnel; conversion calc si décarb
CBD (Cannabidiol)	Nombre décimal	0.0 – 20.0	% poids sec	Obligatoire si certificat fourni
CBDa (acide)	Nombre décimal	0.0 – 18.0	% poids sec	Optionnel
CBG (Cannabigérol)	Nombre décimal	0.0 – 3.0	% poids sec	Optionnel; parfois trace
CBGa (acide)	Nombre décimal	0.0 – 2.5	% poids sec	Optionnel
CBC (Cannabichromène)	Nombre décimal	0.0 – 0.5	% poids sec	Optionnel; généralement trace
CBN (Cannabinol)	Nombre décimal	0.0 – 3.0	% poids sec	Optionnel; augmente avec age/oxydation
THCV (Tétrahydrocannabivarine)	Nombre décimal	0.0 – 2.0	% poids sec	Optionnel; rare, trace
CBDV (Cannabidivarine)	Nombre décimal	0.0 – 1.0	% poids sec	Optionnel; rare
Autres cannabinoïdes	Multi‑champs dynamiques	CBL, CBE, CBDM, etc.	% poids sec	Optionnel; ajouter sur demande
Δ9‑THC total équivalent	Calc auto	THC + (THCa × 0.877)	%	Dérivé; base légale FR
CBD total équivalent	Calc auto	CBD + (CBDa × 0.877)	%	Dérivé
Ratio THC:CBD	Calc auto	THC / CBD (ou texte si CBD=0)	Ratio numérique	Aide classification effet
Total cannabinoïdes	Calc auto	Somme tous cannabinoïdes détectés	% poids sec	Qualité fleur (>15% = bon)
3.2 Terpènes (profil complet)
Champ	Type	Valeurs / Options	Unité	Interaction
Terpène 1 : Myrcène	Nombre décimal	0.0 – 2.5	% poids sec ou mg/g	Majeur; sédatif
Terpène 2 : Caryophyllène (β‑Caryophyllène)	Nombre décimal	0.0 – 1.5	% poids sec ou mg/g	Anti‑inflammatoire
Terpène 3 : Limonène	Nombre décimal	0.0 – 1.2	% poids sec ou mg/g	Citronneux; énergisant
Terpène 4 : Pinène (α + β)	Nombre décimal	0.0 – 1.0	% poids sec ou mg/g	Boisé; focus
Terpène 5 : Linalol	Nombre décimal	0.0 – 0.8	% poids sec ou mg/g	Floral; relaxant
Terpène 6 : Humulène	Nombre décimal	0.0 – 0.6	% poids sec ou mg/g	Houblonneux; anti‑inflammatoire
Terpène 7 : Terpinolène	Nombre décimal	0.0 – 0.5	% poids sec ou mg/g	Herbes fraîches; complexe
Terpène 8 : Ocimène (α + β)	Nombre décimal	0.0 – 0.4	% poids sec ou mg/g	Sucré; floral léger
Terpène 9 : Camphène	Nombre décimal	0.0 – 0.3	% poids sec ou mg/g	Boisé épicé
Terpène 10 : Nerolidol	Nombre décimal	0.0 – 0.2	% poids sec ou mg/g	Floral boisé
Terpène 11 : Borneol	Nombre décimal	0.0 – 0.1	% poids sec ou mg/g	Rafraîchissant
Terpène 12 : Geraniol	Nombre décimal	0.0 – 0.1	% poids sec ou mg/g	Rose géranium
Autres terpènes	Multi‑champs dynamiques	Eucalyptol, Phytol, Isopulegol, etc.	% poids sec ou mg/g	Optionnel; ajouter trace
Total terpènes	Calc auto	Somme tous terpènes	% poids sec	Qualité fleur (>0.5% = intéressant)
Type chémotype terpénique	Enum (auto)	Myrcène‑dom, Caryophyllène‑dom, Limonène‑dom, Équilibré, Exotique (rare profile)	–	Dérivé du profil majeur
Certificat terpènes	Upload	PDF/image labo	–	Optionnel; rarement fourni
3.3 Contaminants & pureté (si disponible)
Champ	Type	Valeurs / Options	Unité	Interaction
Résidus de pesticides	Enum + valeur	Aucun détecté, Traces (< LDM), Non testé	mg/kg ou ppm	Optionnel; critère légal
Moisissures pathogènes (AFG, OTA)	Enum + valeur	Aucun, Traces, Présent	CFU/g ou "négatif/positif"	Optionnel; critère légal FR
Métaux lourds (Pb, Cd, etc.)	Enum + valeur	Aucun, Traces, Présent	mg/kg	Optionnel
Résidus de solvants	Enum + valeur	Aucun, Traces, Non testé	ppm	Optionnel; si extraction antérieure
3.4 Métadonnées certificat d'analyse
Champ	Type	Valeurs / Options	Unité	Interaction
Certificat d'analyse (upload)	Upload PDF/Image	Formats PDF, JPG, PNG; max 10 MB	–	Optionnel; pré‑remplit cannabinoïdes auto
Nom du laboratoire	Texte / Select DB	Labo certifié (WEPAL, ISO 17025, etc.)	–	Optionnel
Référence / N° échantillon	Texte court	ID interne labo	–	Optionnel; traçabilité
Date d'analyse	Date	JJ/MM/AAAA	–	Optionnel; âge du certificat
Méthode analytique	Enum	HPLC (chromatographie liquide), GC‑MS (spectrométrie masse gaz), GC‑FID (détection ionisation flamme), LC‑MS, CCM (chromatographie couche mince), Autre	–	Optionnel; affecte précision
Type de standardisation	Enum	Poids sec, Poids frais, Inconnu	–	Important pour conversions
4. VISUEL & ASPECT MACRO
4.1 Couleur & apparence générale
Champ	Type	Valeurs / Options	Unité	Interaction
Couleur dominante	Roue couleur + %	Sélecteur visuel : Vert olive, Vert clair, Vert foncé, Gris‑vert, Violet, Rose, Orange, Brun clair, Brun foncé, Noir	% dominance (0–100)	Visuel prédominant
Couleur secondaire 1	Roue couleur + %	Idem palette	% (0–100)	Optionnel; couleur d'accent
Couleur secondaire 2	Roue couleur + %	Idem palette	% (0–100)	Optionnel
Intensité couleur	Échelle	1–10 (1 = pâle/délavé, 10 = très saturée/intense)	–	Indicateur qualité pigmentation
Uniformité couleur	Échelle	1–10 (1 = très hétérogène, 10 = très uniforme)	–	QC aspect
4.2 Structure & densité têtes
Champ	Type	Valeurs / Options	Unité	Interaction
Densité visuelle globale	Échelle	1–10 (1 = très aérée/poudreuse, 10 = extrêmement compacte)	–	Corrèle avec poids/mL
Type de structure	Multi‑enum	Aérée (foxtail‑like, popcorn, buds lâches), Moyenne (équilibrée, compacte normale), Compacte (dense classique), Rock‑hard (extrêmement solide), Leafy (feuillage résiduel important), Foxtail (calices étagés, pointus)	–	Trait génétique + environnement
Taille moyenne des têtes	Enum	Micro (< 0.5 g/bud), Mini (0.5–2 g), Small (2–5 g), Medium (5–10 g), Large (10–20 g), Huge (> 20 g)	Grammes estimé	Affecte broyage, rolling
Espacement inter‑calices	Échelle	1–10 (1 = très espacés/aérés, 10 = très serrés/compacts)	–	Indicateur densité calice
4.3 Trichomes (visuel microscopique requis loupe 60x+)
Champ	Type	Valeurs / Options	Unité	Interaction
Abondance trichomes	Échelle	1–10 (1 = rares/clairsemés, 10 = densément recouverts, blanc brillant)	–	Indicateur puissance cannabinoïde
Types trichomes visibles	Multi‑enum	Trichomes glandulaires capitatus (têtes claires), Trichromes glandulaires sessiles (petits incolores), Trichomes non glandulaires (poils fins), Cristaux/trichomes fendus	–	Optionnel; complexité
Couleur trichome dominante	Enum	Cristallin transparent / incolore, Blanc laiteux / opaque (récolte optimale), Ambre / brun doré (maturité avancée, THCa → THC), Jaune/rougeâtre oxydé (sur‑maturité/dégradation)	–	Indicateur point de récolte
Proportion trichomes laiteux / ambre	Nombre + %	Laiteux % : 0–100, Ambre % : 0–100	% estimé à loupe	Calc : Laiteux + Ambre ≤ 100% (reste transparent)
Intégrité trichomes	Échelle	1–10 (1 = majorité cassés/manquants, 10 = 100% intacts)	–	QC manutention; perte résine
Trichomes oxydés / décolorés	Échelle	1–10 (1 = beaucoup oxydés/foncés, 10 = zéro dégradation)	–	Indicateur âge / stockage
4.4 Pistils (stigmates)
Champ	Type	Valeurs / Options	Unité	Interaction
Couleur dominante pistils	Enum	Blanc pur (sous‑maturité), Crème (pré‑maturité), Orange clair (maturité précoce), Orange intense, Brun rougeâtre (maturité avancée), Brun foncé / noir (sur‑maturité)	–	Indicateur maturité récolte
Couleur secondaire pistils	Enum	Idem liste	–	Optionnel; hétérogénéité
Proportion pistils recourbés / matures	Nombre + %	0–100%	% estimé	Agrégat maturité
Abondance pistils visibles	Échelle	1–10 (1 = rares/cachés, 10 = très visibles, couvrant densément)	–	Trait génétique femelle
Intégrité pistils	Échelle	1–10 (1 = cassés/manquants, 10 = intacts, ondulés)	–	QC manutention
4.5 Contamination & défauts visuels
Champ	Type	Valeurs / Options	Unité	Interaction
Moisissure visible (botrytis, oidium)	Échelle	1–10 (1 = moisissure visible dense/grossière, 10 = zéro moisissure)	–	Défaut critique; peut invalider produit
Graine / Nana seeds	Échelle	1–10 (1 = nombreuses graines, 10 = aucune)	–	QC hermaphrodisme maternel
Corps étrangers / contaminants visuels	Multi‑enum + desc	Poils (cheveux), fibres textiles, débris matières, insectes morts, terre, autre	–	Describtion courte; impact sécurité
Dégâts d'insectes / mites	Échelle	1–10 (1 = gros dégâts visibles, 10 = aucune trace)	–	Optionnel; historique stockage
4.6 Feuilles résiduelles & manucure
Champ	Type	Valeurs / Options	Unité	Interaction
Proportion feuilles vertes résiduelles	Échelle	1–10 (1 = très feuillue, couvert > 50%, 10 = très propre, < 5%)	% estimé	Indicateur qualité trim
Type de manucure appliquée	Enum	Machine (trim machine, tumblers), Ciseaux (sec‑trim avec ciseau professionnel), Main soignée (soigneuse manuelle qualité), Sloppy (grossier, bâclé), Live (humide fraîch récolte), Aucune / Raw (non manucuré)	–	Affecte rendu final
Qualité manucure exécutée	Échelle	1–10 (1 = très mauvaise, arêtes feuilles partout, 10 = parfaite, propre, précis)	–	Évaluation résultat trim
Débris trim visibles	Échelle	1–10 (1 = beaucoup poussière feuille/débris dans bocal, 10 = propre immaculé)	–	QC nettoyage
Type de débris	Multi‑enum	Poussière feuille fine, Petits bouts stems, Trichomes libres/résine miette, Terre/matière, Autre	–	Optionnel; impact confort
5. PROFIL AROMATIQUE (CATA – NEZ)
5.1 Intensité générale
Champ	Type	Valeurs / Options	Unité	Interaction
Intensité odeur globale	Échelle	1–10 (1 = très discret/peu d'odeur, 10 = très intense/dominant)	–	Majeure; corrèle terps + vieillissement
5.2 Notes dominantes (multi‑sélection max 7)
Catégories CATA avec sous‑arômes (base 140+ arômes possibles) :

Catégorie 1 : FRUITÉ (32 arômes)
Agrumes : Citron, Citron vert, Orange, Mandarine, Pamplemousse, Bergamote

Fruits rouges : Fraise, Framboise, Cerise, Cassis, Mûre, Cranberry

Fruits exotiques : Mangue, Ananas, Banane, Papaye, Passion, Kiwi

Fruits secs : Raisin sec, Datte, Figue, Cranberry séché, Abricot sec

Fermenté : Vin rouge, Vin blanc, Bière, Kombucha, Vinaigre

Catégorie 2 : FLORAL (11 arômes)
Rose, Géranium, Lavande, Lilas, Muguet, Violette, Pivoine, Camomille, Mimosa, Jasmin, Fleur de cerisier

Catégorie 3 : TERREUX / BOISÉ (14 arômes)
Terreux : Terre mouillée, Tourbe, Champignon, Sous‑bois, Racine

Boisé : Pin, Cèdre, Bois de santal, Chêne, Épicéa, Châtaigne, Écorce

Musqué : Musc, Ambre gris, Oud, Néroli

Catégorie 4 : PIQUANT / ÉPICÉ (15 arômes)
Poivre (noir, blanc, rose), Clou de girofle, Cannelle, Cardamome, Anis, Badiane, Curcuma, Fenugrec, Ail, Oignon, Piment sec, Wasabi, Gingembre, Réglisse, Menthe poivrée

Catégorie 5 : SKUNKY / ANIMALIC (7 arômes)
Skunk (phénylacétaldéhyde), Chat / Urine chat, Cheval, Cuir, Sueur / Saumure, Fromage bleu / Fromage puant, Fourrure mouillée

Catégorie 6 : CHIMIQUE / GAZ (11 arômes)
Carburant / Essence, Gaz naturel, Plastique brûlé, Caoutchouc, Antiseptique, Alcool dénaturé, Kérosène, Gaz chlore, Ammoniac, Solvant, Peinture fraîche

Catégorie 7 : SUCRÉ / GOURMAND (14 arômes)
Sucre / Caramel, Miel, Sirop d'érable, Caramelle, Toffee, Chocolat, Vanille, Crème / Lait, Brioche, Noix / Noisette, Cacahuète, Amande, Noix de coco, Praline

Catégorie 8 : VÉGÉTAL / HERBACÉ (11 arômes)
Herbe fraîche coupée, Foin sec, Paille, Roquette, Céleri, Persil, Thé vert, Luzerne, Menthe classique, Thym, Origan

5.3 Saisie arômes (pour chaque catégorie sélectionnée)
Champ	Type	Valeurs / Options	Unité	Interaction
Arôme sélectionné (ex : Limonène → Citron)	Enum dans catégorie	Listes déroulantes par catégorie	–	Multi‑sélection max 7 total
Intensité arôme	Échelle	1–5 (1 = très léger/note, 5 = extrêmement prononcé)	–	Par arôme sélectionné
Type d'arôme	Enum	Dominant (1ère sensation), Secondaire (présent mais moins), Arrière (traîne), Trait accessoire (très discret)	–	Hiérarchie
5.4 Évolutions olfactives (optionnel)
Champ	Type	Valeurs / Options	Unité	Interaction
Odeur fraîche (< 1 sem curing)	Multi‑sélection	Idem arômes, max 3	–	Optionnel; note évolution
Odeur curé standard (2–4 sem)	Multi‑sélection	Idem arômes, max 3	–	Profil principal
Odeur mature (1–3 mois)	Multi‑sélection	Idem arômes, max 3	–	Optionnel; complexification
Dévouement / Altération note	Texte libre	Descrizione changements en positif ou négatif	–	Optionnel; exemple "prise d'intensité épicée, perte fruité"
6. TEXTURE & TOUCHÉ
6.1 Propriétés tactiles
Champ	Type	Valeurs / Options	Unité	Interaction
Dureté / Rigidité	Échelle	1–10 (1 = extrêmement mou/mushy, 10 = rock‑hard, cassant)	–	Corrèle densité, âge curing
Compacité / Densité tactile	Échelle	1–10 (1 = très léger/aérien, 10 = dense compact/lourd)	–	Poids volume petit volume
Élasticité / Ressort	Échelle	1–10 (1 = casse nettement, 10 = reprend forme, très flexible)	–	Indicateur humidité résiduelle
Friabilité / Délitement	Échelle	1–10 (1 = cohésion forte, impossible casser/déliter à main, 10 = poudre se désagrège facilement)	–	Affect convenance
Collant / Résineux	Échelle	1–10 (1 = très collant, dépôts résine mains, 10 = zéro colle, sec sec)	–	Signe fraîcheur / maturité
Élasticité résine	Échelle	1–10 (1 = caoutchouc mou/flexible résine, 10 = cristallin/cassant trichomes)	–	Optionnel; maturation résine
6.2 Propriétés de broyage
Champ	Type	Valeurs / Options	Unité	Interaction
Nécessité de grinder	Enum	Très facile (main, sans outil), Facile (grinder léger), Normal (grinder standard), Difficile (résistance forte), Trop dur (cassant poudre)	–	Affecte préparation/consommation
Texture post‑broyage	Enum	Fine homogène, Granuleuse moyenne, Morceaux fins persistants, Poudre fine excessive, Collant boulette (trop résine)	–	Impact experience
Perte poids post‑broyage	Pourcentage	0–30% (résidu grinder)	% poids avant	Optionnel; haut = perte tritchomes
6.3 Humidité résiduelle (si testée)
Champ	Type	Valeurs / Options	Unité	Interaction
Taux d'humidité estimé (hygromètre)	Nombre + enum	Très sec (< 7%), Sec (7–9%), Optimal (9–12%), Humide (12–15%), Très humide (> 15%)	% humidité relative	Optionnel; affecte brûlure, goût
Test pli/cassure	Enum	Casse net (très sec), Plie puis casse (bon), Plie sans casser (humide), Mou/mushy (trop humide)	–	Optionnel; vérif rapide
7. GOÛTS & SAVEURS
7.1 Intensité générale
Champ	Type	Valeurs / Options	Unité	Interaction
Intensité gustative globale	Échelle	1–10 (1 = très subtil/peu goût, 10 = extrêmement intense/prononcé)	–	Majeure; corrèle cannabinoïdes, terps, age
Harshness / Rugosité gorge	Échelle	1–10 (1 = très rêche/irritant, 10 = très doux/smooth)	–	Indicateur qualité cure, combustion
Sécheresse bouche	Échelle	1–10 (1 = très sec/coton, 10 = mouillé/humide dans bouche)	–	Normal faible; haut = défaut
7.2 Profil aromatique par phase (CATA goûts, 4 phases)
Phase 1 : DRY PUFF (bouffée sèche avant combustion / chauffage)
Champ	Type	Valeurs / Options	Unité	Interaction
Arômes secs (avant fumée)	Multi‑select	Idem catégories 8 CATA (max 7 arômes)	–	Contact sec fleur dents
Intensité goût sec	Échelle	1–5 (subtil → très prononcé)	–	Prélude combustion
Phase 2 : INHALATION (fumée chaude / vapeur entrée poumons)
Champ	Type	Valeurs / Options	Unité	Interaction
Arômes inhalation	Multi‑select	Idem catégories 8 CATA (max 7 arômes)	–	Impression première combustion/vape
Intensité inhalation	Échelle	1–5	–	Force sensation
Température perçue	Enum	Froide, tiède, chaude, très chaude, brûlante	–	Optionnel; confort inhalation
Phase 3 : EXPIRATION (goût fumée en bouche, après rejet)
Champ	Type	Valeurs / Options	Unité	Interaction
Arômes expiration	Multi‑select	Idem catégories 8 CATA (max 7 arômes)	–	Notes secondaires après bouffée
Intensité expiration	Échelle	1–5	–	Persistance goût
Phase 4 : ARRIÈRE‑GOÛT (finish, traîne palais)
Champ	Type	Valeurs / Options	Unité	Interaction
Arômes arrière‑goût	Multi‑select	Idem catégories 8 CATA (max 7 arômes)	–	Notes finales persistantes
Durée arrière‑goût	Enum	Très court (< 10 sec), Court (10–30 sec), Moyen (30 sec – 2 min), Long (2–5 min), Très long (> 5 min)	–	Intensité résiduelle
Type arrière‑goût	Enum	Agréable, Neutre, Désagréable, Persistant plaisant, Persistant dérangeant	–	Évaluation positive/négative
7.3 Évolutions goût (optionnel, par âge curing)
Champ	Type	Valeurs / Options	Unité	Interaction
Goût jeune curing (< 1 sem)	Multi‑select	Idem arômes, max 3	–	Note : plutôt « vert / cru » attendu
Goût curé standard (2–4 sem)	Multi‑select	Idem arômes, max 3	–	Profil principal
Goût mature (1–3 mois)	Multi‑select	Idem arômes, max 3	–	Optionnel; complexification attente
Notes évolution saveur	Texte libre	Exemple : "fruité initiale devient épicé, arrière‑goût caramélisé au mois 2"	–	Contextualisation changements
7.4 Comparaison avec référence (optionnel)
Champ	Type	Valeurs / Options	Unité	Interaction
Cultivar référence pour goût	Select DB	Bibliothèque cultivars testés	–	Optionnel; aide classification
Similarité goût	Texte court	Exemple : "Proche GMO Barney's, mais plus sucré"	–	Comparatif organoleptique
8. EFFETS & EXPÉRIENCE CONSOMMATION
8.1 Contexte & méthodologie
Champ	Type	Valeurs / Options	Unité	Interaction
Méthode consommation (multi)	Multi‑enum	Voir détail ci‑dessous	–	Obligatoire; 1+ méthodes testées
SOUS‑SECTION : Combustion (joint, pipe, bong, etc.)
Champ	Type	Valeurs / Options	Unité	Interaction
Type combustion	Enum	Joint (tabac / paille), Blunt (feuille tabac), Spliff (mixte joint herbe + tabac), Pipe (verre, bois), Bong (verre eau), Chillum (cône terre), Vape conduction classique, Autre	–	Conditionne "méthode" sélectionnée
Matériel spécifique	Texte libre	Ex : "Bong verre borosilicate 40cm, bol 4mm"	–	Optionnel; reproductibilité
SOUS‑SECTION : Vaporisation (vapo herbe sèche, dab, etc.)
Champ	Type	Valeurs / Options	Unité	Interaction
Type vape	Enum	Vapo portable (Dynavap, Mighty…), Vapo bureau (Volcano, Evo…), Dab rig (concentré), Puffco type e‑nail, Autre	–	Conditionne "méthode" sélectionnée
Contrôle température	Enum	Oui (précis), Oui (approximatif cadrans), Non (fixe), Inconnu	–	Affecte profil effet
Température(s) utilisée(s)	Nombre(s)	160–220 °C (plage typiqu)	°C	Si "Oui contrôle" obligatoire
Matériel spécifique	Texte libre	Ex : "Mighty @ 200°C", "Dynavap MV avec torch"	–	Optionnel
SOUS‑SECTION : Ingestion (comestible, infusion, etc.)
Champ	Type	Valeurs / Options	Unité	Interaction
Type ingestion	Enum	Comestible fait maison (beurre, huile, déco fleur), Comestible industriel, Infusion/tisane, Smoothie, Teinture, Suppositoire, Autre	–	Conditionne profil absorption
Matière grasse / vecteur	Enum	Beurre de cannabis (clarified), Huile coco, Huile olive, Graisse animale, Pas de graisse (tisane), Autre	–	Affecte biodisponibilité THC/CBD
Durée infusion / trempage	Nombre + unité	30 min – 24h	min ou h	Si tisane / infusion
8.2 Dosage
Champ	Type	Valeurs / Options	Unité	Interaction
Dose consommée	Nombre + unité	Nombre estimé	mg cannabinoïdes, g fleur brute, ou nb bouffées	Optionnel mais recommandé
Unité dose	Enum	Milligrammes THC, Milligrammes CBD, Grammes fleur brute, Nombre bouffées, Nombre joints/pré‑rolls, Nombre tasses (infusion), Nombre tablettes (comestible)	–	Varie selon méthode
Poids fleur consommée	Nombre	Estimation	g	Optionnel; aide traçabilité
Estimation THC consommé	Nombre (calc)	Calc = (% THC × poids fleur) / 100	mg THC théorique	Auto‑calculé si données analytiques présentes
8.3 Cinétique des effets
Champ	Type	Valeurs / Options	Unité	Interaction
Délai avant ressenti d'effets	Nombre + enum	Combustion : 1–5 min, Vape : 2–10 min, Comestible : 30 min – 2h	min ou "rapide/progressif/lent"	Dépend méthode + individu
Temps de montée en puissance	Nombre + enum	Phase montée effet	min	Combustion/vape rapide; comestible lent
Pic d'intensité d'effet	Nombre + unité	Temps auquel effet maximal atteint	min après consommation	Typiquement 15–60 min combustion
Durée totale session	Nombre + unité	Du ressenti initial à retour baseline	h ou min	Combustion : 2–4h, Comestible : 4–8h+
Durée remontée (déescalade)	Nombre + unité	Temps pour revenir à baseline normal	h	Implication séance suivante
8.4 Profil d'effets (sélection jusqu'à 8 effets)
Effets Cognitifs
Focus / Concentration (concentration accrue vs dispersé)

Créativité (pensées associatives, imagination)

Euphorie (bien‑être intense, rires)

Confusion / Brain fog (pensées brouillées)

Introspection / Philosophie (réflexion interne)

Vigilance accrue (alerte, sensorielle)

Dépression cognitive (ralentissement, apathie)

Effets Physiques
Relaxation musculaire (détente corps)

Lourdeur corporelle (body stone, poids)

Stimulation / Énergie (activité motrice)

Analgésie / Soulagement douleur (sédation douleur)

Antiémétique (anti‑nausée)

Appétit augmenté (munchies, envie manger)

Appétit diminué (anoréxie effet)

Sommeil induit (envie dormir, somnolence)

Tremblements / Spasmes (tics involontaires)

Libido (augmentation ou baisse)

Effets Émotionnels
Anxiété / Paranoïa (anxiété légère à panique)

Apaisement / Zen (calme, détente émotionnelle)

Sociabilité (envie interaction, bavard)

Isolement / Introspection (retrait social)

Euphorie (voir cognition)

Dépression légère (blues, baisse morale)

Stabilité émotionnelle (régulation affect)

Effets Sensoriels
Acuité auditive (sons plus clairs, musique intense)

Synesthésie / Distorsion (perception altérée, hallucinations bénignes)

Sensibilité visuelle (couleurs saturées, brillance)

Temps déformé (perception temps dilatée)

8.5 Saisie effets
Champ	Type	Valeurs / Options	Unité	Interaction
Effet sélectionné (max 8)	Multi‑select	Listes catégories ci‑dessus (8 catégories, 40+ effets possibles)	–	Sélection libre
Intensité effet	Échelle (par effet)	1–5 (1 = très léger/subtil, 5 = très intense/dominant)	–	Évaluation personnelle
Polarité effet	Enum	Positif (apprécié), Neutre (présent sans opinion), Négatif (dérangeant)	–	Contextualise effet
8.6 Effets indésirables
Champ	Type	Valeurs / Options	Unité	Interaction
Effets indésirables (multi)	Multi‑enum	Dry mouth, Dry eyes, Tachycardie (cœur accéléré), Dizziness (vertiges), Paranoia, Anxiety escalade, Couch lock extrême, Fatigue post‑session, Mal de tête, Nausée, Paranoia, Insomnie, Oublis / amnésie très forte	–	Optionnel; listing effet négatifs
Sévérité effet indésirable	Échelle (par effet)	1–5 (1 = très léger/gérable, 5 = très intense/problématique)	–	Évaluation impact
Gestion effet indésirable	Texte libre	Stratégie utilisée (ex : "eau, calme, dodo")	–	Optionnel; aide
8.7 Notes expérience globale
Champ	Type	Valeurs / Options	Unité	Interaction
Recommandation (thumbs up/down)	Enum	✓ Recommandé / Oui, ✗ Non recommandé, Neutre, À retest	–	Synthèse simple
Note experience globale	Échelle	1–10 (1 = très mauvaise, 10 = excellente)	–	Synthèse numérique
Notes libres experience	Texte libre	Résumé impressions session (max 250 car)	–	Contexte qualitatif
Recommandation type utilisateur	Enum	Débutant, Utilisateur occasionnel, Utilisateur régulier, Connaisseur, Médical spécifique, Autre	–	Optionnel; cible audience
Moment idéal consommation	Enum	Matin (énergisant), Jour (sociable), Soir (relaxant), Nuit (sommeil), Flexible (any time), Pas idéal (inadapté)	–	Timing recommandé
9. PIPELINE CULTURE (résumé à la review)
Agrégats des données culture pipeline vers review fleur (non saisie ici, mais données remontées) :

9.1 Modes & Espace
Champ	Type	Valeurs / Options	Unité	Interaction
Mode culture	Enum (read‑only)	Indoor, Outdoor, Greenhouse, Glasshouse, No‑till, Guerrilla	–	Remontée pipeline
Type espace	Enum	Tente, Chambre, Armoire, Serre, Extérieur direct, Guerrilla	–	Remontée pipeline
Dimensions espace (résumé)	Texte	Ex : "80x80x160 cm"	–	Optionnel display
Surface au sol	Nombre	m²	m²	Optionnel; impact rendement
9.2 Substrat & Nutrition
Champ	Type	Valeurs / Options	Unité	Interaction
Type substrat principal	Enum	Terre / coco / hydro / living soil / no‑till, etc.	–	Remontée pipeline
Type nutrition	Enum	Organique, Minéral, Organo‑minéral, Living soil, Autre	–	Remontée pipeline
Système irrigation	Enum	Manuel, goutte à goutte, drip to waste, table inondation, DWC, NFT, autre	–	Remontée pipeline
9.3 Lumière & Environnement
Champ	Type	Valeurs / Options	Unité	Interaction
Type lumière	Enum	LED, HPS, CMH, Lumière naturelle, Mixte	–	Remontée pipeline
Puissance lumière totale	Nombre	W total	W	Remontée pipeline
PPFD moyen récolte	Nombre	µmol/m²/s	µmol/m²/s	Optionnel; affecte rendement
Photopériode récolte	Enum	18/6, 12/12, outdoor naturel	h/h	Remontée pipeline
9.4 Climat & durée
Champ	Type	Valeurs / Options	Unité	Interaction
Température moyenne floraison	Nombre	Calc jour + nuit	°C	Optionnel; affecte terpènes
Humidité moyenne floraison	Nombre	%	%	Optionnel; affecte mold risk
Durée totale culture	Nombre	Days → semaines	jours	Remontée pipeline
Durée floraison effective	Nombre	Semaines	sem	Remontée pipeline
9.5 Formations & techniques
Champ	Type	Valeurs / Options	Unité	Interaction
Technique principal (LST, HST, SCROG, SOG, etc.)	Enum	Main‑lining, LST, HST, Topping, SCROG, SOG, Defoil, Lollipopping, Autre	–	Remontée pipeline
Intensité palissage	Échelle	1–10 (soft training → heavy defoliation)	–	Optionnel
9.6 Post‑récolte
Champ	Type	Valeurs / Options	Unité	Interaction
Rinçage appliqué	Enum	Oui, Non, Partial	–	Remontée pipeline
Durée séchage	Nombre	Jours	j	Remontée pipeline
Conditions séchage	Texte résumé	Ex : "Noir, 60–70% HR, 18°C, ventilation"	–	Optionnel; impact goût
10. PIPELINE CURING (résumé à la review – finalisant culture)
Agrégats données curing pipeline vers review fleur :

10.1 Emballage & récipient
Champ	Type	Valeurs / Options	Unité	Interaction
Type emballage initial	Enum	Sous vide, Papier cuisson, Celophane, Mylar, Kraft, Autre	–	Remontée pipeline
Type récipient curing	Enum (correspond images)	Air libre (aucun) – défaut, Bocal verre clair, Bocal verre ambré, Bocal plastique, Tupperware, Grove Bag (lettres oxyabsorb), CVault / Humidor, Sac papier, Autre	–	Remontée pipeline
Opacité récipient	%	0–100%	%	Optionnel; protection lumière
Volume occupé	Nombre	ml ou L	ml / L	Optionnel; remplissage optimal
10.2 Conditions curing
Champ	Type	Valeurs / Options	Unité	Interaction
Température moyenne curing	Nombre	En récipient / hors récipient	°C	Optionnel; impact oxydation
Humidité moyenne curing	Nombre	En récipient / hors récipient	% RH	Optionnel; curing mold risk
Durée totale curing	Nombre	Jour(s)	j	Remontée pipeline
Fréquence ouverture ("burps")	Nombre + unité	Si bocal : 1–3 times/week typique	fois/j ou /sem	Optionnel; affecte aération
Lumière curing	Enum	Noir total, Semi‑ombre, Lumière indirecte, Lumière directe	–	Optionnel; protection THC/terps
Ventilation curing	Enum	Aucune, Passive (circulation air diffuse), Active (ventilo), Dynamique	–	Optionnel
10.3 Évolutions organoleptiques durant curing
Champ	Type	Valeurs / Options	Unité	Interaction
Intensité odeur J0 (fraîche)	Échelle	1–10	–	Optionnel; comparatif
Intensité odeur après 2–4 sem curing	Échelle	1–10	–	Optionnel; évolution attendue
Intensité odeur après 1–3 mois	Échelle	1–10	–	Optionnel; complexification
Évolution arômatique notes	Texte libre	Ex : "Fruité initiale → épicé + floral mois 2"	–	Optionnel; tracking maturation
Intensité goût J0	Échelle	1–10	–	Optionnel
Intensité goût après curing	Échelle	1–10	–	Optionnel
Douceur fumée J0 vs curé	Enum + desc	Exemple : "Rêche → lisse après 3 sem"	–	Optionnel
Notes couleur évolution	Texte libre	Exemple : "Vert olive → brun doré après 6 sem"	–	Optionnel; oxydation positive
10.4 Stade maturation final
Champ	Type	Valeurs / Options	Unité	Interaction
Stade maturation	Enum	Fraîchement curé (< 7 jours), Jeune curing (1–2 sem), Bien curé (2–4 sem), Mature (1–3 mois), Très mature (3–6 mois), Archive (6+ mois)	–	Dérivé âge curing
Recommandation consommation optimale	Enum	Maintenant (optimum atteint), Attendre semaines (trop jeune), À consommer (vieillissement >6m risque), Varié (bon sur longue plage)	–	Optionnel; guidage utilisateur
11. DONNÉES SYNTHÉTIQUES & ÉVALUATIONS GLOBALES
11.1 Scores synthétiques
Champ	Type	Valeurs / Options	Unité	Interaction
Note globale produit	Échelle	1–10 (synthèse visuel + odeur + goût + effets)	–	Optionnel; agrégat
Qualité générale	Enum	Classe A (excellent), B (bon), C (moyen), D (faible), E (mauvais)	–	Optionnel; classification simple
Value for money	Énumé	Excellent, Bon, Acceptable, Mauvais, Très mauvais	–	Optionnel; prix vs qualité
Recommandation finale	Enum	Fortement recommandé, Recommandé, Neutre, Pas recommandé, Fortement déconseillé	–	Synthèse utilisateur
11.2 Comparatifs
Champ	Type	Valeurs / Options	Unité	Interaction
Cultivar de référence similaire	Select DB	Bibliothèque cultivars (optionnel)	–	Aide positionnement
Différenciation vs référence	Texte libre	Exemple : "Plus citronné que GMO standard"	–	Optionnel; contextualisation
Classement personnel (si multi‑tests)	Nombre	Rang parmi N produits testés	Rang	Optionnel; statistique
11.3 Métadonnées review
Champ	Type	Valeurs / Options	Unité	Interaction
Testeur / Rédacteur	Texte	Nom ou pseudonyme	–	Optionnel; traçabilité
Conditions test standardisées	Enum	Oui (protocole strict), Non (libre), Partiel	–	Optionnel; reproductibilité
Statut review	Enum	Brouillon (en cours), Finalisée, Archivée, À revoir	–	Gestion publication
Visibilité review	Enum	Privée (user seul), Shared (groupe), Publique (DB commune)	–	Contrôle accès
Notes additionnelles	Texte libre	Contexte test, anomalies, remarques misc.	–	Optionnel; libre
