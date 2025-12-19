## 1. Informations générales & génétiques (Fleurs)

### 1.1 Informations générales

- Nom commercial*  
  - Saisie : champ texte unique (seul champ vraiment textuel obligatoire).  
  - Aides : auto-complete sur noms déjà utilisés, suggestions de formats (ex. “Marque – Cultivar – Batch #”).  
- Cultivar(s)  
  - Type : multi-select depuis bibliothèque perso + moteur de recherche.  
  - UI : pill-buttons sélectionnés, drag pour ordonner.  
- Farm / Producteur  
  - Type : select + auto-complete (liste de fermes enregistrées).  
- Type (indica / sativa / etc.)  
  - Type : segmented control (boutons arrondis) :  
    - Indica pure  
    - Sativa pure  
    - Hybride indica-dominant  
    - Hybride sativa-dominant  
    - Hybride 50/50  
    - CBD-dominant  
    - CBG-dominant  
    - “Non déterminé”
- Photos (1–4)*  
  - UI : dropzone + grille 2×2, réordonnable par drag & drop.  
  - Tags rapides sur chaque photo :  
    - “Macro”, “Full plant”, “Bud sec”, “Trichomes”, “Drying”, “Curing”.

### 1.2 Génétiques & PhenoHunt (sans texte)

- Breeder de la graine  
  - Select depuis bibliothèque Breeders + bouton “+ nouveau breeder” (modale avec peu de champs).  
- Variété (auto-complete)  
  - Auto-complete sur base interne / bibliothèque utilisateur.  
- Type génétique  
  - Boutons : Indica / Sativa / Hybride.  
- Pourcentages de génétique  
  - UI : wheel ou sliders verrouillés pour total = 100%  
  - ex. 3 segments max : Cultivar A / B / C → slider circulaire.  
- Généalogie, parents / phénotype  
  - Tout via **canva génétique**, sans texte :  
    - Drag & drop des cultivars “parents” → liens visuels (flèches).  
    - Tags : “clone élite”, “seed run”, “selfed (S1)”, “BX1, BX2…”, “polyhybride”.  
- Code phénotype / sélection  
  - Choix de format + auto-incrément :  
    - Boutons : “PH-#”, “F#”, “CUT-#” → le système propose “PH-01”, “PH-02”, etc.

***

## 2. PipeLine Culture – Paramètres globaux

### 2.1 Trame & durée

- Trame PipeLine (segmented control) :  
  - Heures / Jours / Semaines / Mois / Phases / Dates.  
- Longueur / durée  
  - Heures : stepper (24, 48, 72, 96, 168, 336 h).  
  - Jours : slider 1–120 jours + presets (60/70/90).  
  - Semaines : slider 1–20.  
  - Mois : slider 1–12.  
  - Phases : toggle “Mode par phases” → préset auto (Graine → Floraison fin).  
  - Dates : date-pickers début/fin + calcul auto de jours, pagination si >365.

### 2.2 Mode de culture & espace

- Mode  
  - Boutons illustrés : Indoor / Outdoor / Greenhouse / No-till / Autre.  
- Espace de culture  
  - Type :  
    - “Tente”, “Armoire”, “Room”, “Serre”, “Extérieur direct”, “Guérilla”, “Autre”.  
  - Dimensions :  
    - 3 sliders alignés (L, l, H) avec unité “cm” ou “m” (switch en haut).  
    - Calcul auto m² et m³ affiché en carte info.  
  - Densité de plantation  
    - Slider “Plantes/m²” (0.5 → 16) + chips suggestions (1 / 4 / 9 / 16).[3][4]

***

## 3. Environnement & Substrat (Fleurs)

### 3.1 Propagation

- Méthode de départ  
  - Boutons cartes :  
    - “Graine”, “Clone”, “Bouture”, “Tissu humide (sopalin/coton/serviette)”, “Autre”.  
  - Si graine : options  
    - “Régulière”, “Féminisée”, “Auto-florissante”.

### 3.2 Substrat (tout en select/slider)

- Type principal  
  - “Terreau”, “Coco”, “Laine de roche”, “Mélange organique vivant”, “Hydroponique drain-to-waste”, “DWC”, “NFT”, “Autre”.  
- Volume par pot  
  - Slider (0.5 L → 100 L).  
- Composition %  
  - UI : pie builder  
    - Composants pré-définis : Terreau, Coco, Perlite, Vermiculite, Compost, Humus, Biochar, Sable, Laine de roche, Autre.  
    - Sliders verrouillés → somme 100%.  
- Marque de substrat / base  
  - Select (auto-complete sur base interne de substrats).  

### 3.3 Irrigation & solution nutritive

- Type d’irrigation  
  - “Manuel”, “Goutte à goutte”, “Table inondation”, “Drip-to-waste”, “Autopot”, “Autre”.  
- Fréquence  
  - Toggle : “Par jour” / “Par semaine”.  
  - Stepper + slider (ex. 1–10 fois/jour).  
- Volume par arrosage  
  - Slider 0.1–5.0 L.  
- pH eau d’arrosage  
  - Slider 4.5–8.0 (pas 0.1).[2][3]
- EC / Conductivité  
  - Slider 0.2–3.0 mS/cm.[2]
- Type d’eau  
  - “Robinet”, “Osmose inverse”, “Source”, “Pluie”, “Mélange”.

### 3.4 Engrais (tout en boutons / listes)

- Type d’engrais  
  - “Organique”, “Minéral”, “Organo-minéral”, “Autre”.  
- Marque  
  - Select (auto-complete + favoris).  
- Gamme/produit  
  - Select multi (Grow / Bloom / Booster / CalMag / Additifs).  
- Schéma de dosage  
  - Choix “utiliser tableau de la marque” (preset) ou “personnalisé”.  
  - Dosage : slider 0.1–5.0 mL/L (ou g/L).  
- Fréquence d’application  
  - Choix : “1 fois sur 2 arrosages”, “Chaque arrosage”, “Hebdomadaire”, “Custom”.  
  - Custom : slider + unité (jour/semaine).

***

## 4. Lumière & climat (Fleurs)

### 4.1 Lumière

- Type de lampe  
  - “LED”, “HPS”, “MH”, “CMH/LEC”, “CFL/T5”, “Naturel”, “Mixte”.  
- Nombre de lampes & puissance  
  - Stepper nombre + slider W/lampe → calcul auto W total.  
- Distance lampe/plante  
  - Slider 10–200 cm (avec zone recommandée en surbrillance).  
- Photopériode  
  - UI : switch “Veg” / “Flo” + slider heures ON (ex. 18/6, 20/4, 12/12…).  
- DLI & PPFD  
  - Entrées optionnelles via sliders :  
    - PPFD moyen : 200–1200 µmol/m²/s.  
    - DLI : 10–60 mol/m²/j.[5][1]
- Spectre  
  - Choix : “Full Spectrum”, “Veg (bleu)”, “Flo (rouge)”, “UV+”, “Far Red”, “Autre”.

### 4.2 Climat

- Température  
  - Deux sliders : “Jour” et “Nuit”, plage 10–35 °C.  
- Humidité relative  
  - Deux sliders : “Jour” / “Nuit”, 20–90%.  
- VPD (optionnel)  
  - Calcul auto + affichage badge “Zone idéale / Trop sec / Trop humide”.[1][2]
- CO₂  
  - Toggle “Enrichissement CO₂” ON/OFF.  
  - Si ON : slider 400–1600 ppm + mode “Continu / Par phases”.  
- Ventilation  
  - Type : “Extracteur + intracteur”, “Extracteur seul”, “Passif + ventilateurs”, “Autre”.  
  - Intensité : 0–10 (slider).  
  - Renouvellement d’air estimé : x volumes/h (choix preset 10/20/30).

***

## 5. Palissage, opérations & morphologie

### 5.1 Palissage / training (LST/HST)

- Méthodes  
  - Multi-select boutons :  
    - LST, HST, Topping, FIM, Main-lining, SCROG, SOG, Supercropping, Defoliation, Lollipopping, “Autre”.  
- Intensité par méthode  
  - Slider 0–10 (faible → agressif).  
- Moment d’application  
  - Checkboxes par phase : “Pré-croissance”, “Croissance”, “Debut stretch”, “Milieu stretch”, “Debut flo”, etc.

### 5.2 Morphologie

Tous les champs sont pilotés par sliders ou steps :

- Taille plante  
  - Slider 10–300 cm.  
- Largeur canopée  
  - Slider 10–200 cm.  
- Volume approximatif  
  - Choix quick : “Petit”, “Moyen”, “Grand”, “Très grand” (internement mappé à m³).  
- Poids végétatif estimé (optionnel)  
  - Slider 10–3000 g.  
- Nombre de branches principales  
  - Stepper 1–32.  
- Nombre de buds principaux visibles  
  - Stepper 1–200.

***

## 6. Récolte & post-récolte (Fleurs)

### 6.1 Paramètres de récolte

- Fenêtre de récolte  
  - Sélecteur : “Précoce”, “Optimal”, “Tardif”.  
- Couleur des trichomes  
  - 3 sliders verrouillés (total 100%) :  
    - Translucides  
    - Laiteux  
    - Ambrés  
- Mode de récolte  
  - “Plante entière”, “Branches”, “Buds unitaires”, “Machine trim”, “Hand trim”.

### 6.2 Poids & rendement

- Poids brut humide  
  - Slider 50–5000 g.  
- Poids net après 1ère manucure  
  - Slider 10–3000 g.  
- Rendement par plante  
  - Calcul auto (affichage) + possibilité d’override via slider.  
- Rendement au m²  
  - Calcul auto (g/m²) + badge “Faible / Moyen / Élevé / Exceptionnel” selon ranges prédéfinis.[3]

***

## 7. Données analytiques (Fleurs)

### 7.1 Cannabinoïdes

- THC  
  - Slider 0–40% (valeur certif).  
- CBD  
  - Slider 0–20%.  
- CBG, CBC, CBN, THCV…  
  - Liste dynamique : bouton “+ ajouter cannabinoïde” → select liste standard + slider % ou mg/g.[6]
- Somme des cannabinoïdes  
  - Calcul auto + vérification cohérence.

### 7.2 Terpènes (si saisie manuelle)

- Liste terpéniques standard  
  - Myrcène, Limonène, Caryophyllène, Linalol, Pinène (α/β), Terpinolène, Humulène, Ocimène, etc.[7][8]
- Pour chaque terpène : slider % ou mg/g.  
- Affichage roue aromatique terpénique (Aroma Wheel).[9]

***

## 8. Visuel & technique (Fleurs)

### 8.1 Scores techniques (sliders)

- Couleur (nuancier cannabis)  
  - Slider 0–10 + roue de couleur (vert clair, vert foncé, lime, yellow, orange, violet, noir, etc.).  
- Densité visuelle  
  - 0–10 (fluffy → ultra dense).  
- Trichomes  
  - 0–10 (peu visibles → tapis complet).  
- Pistils  
  - 0–10 (absents → très nombreux).  
- Manucure  
  - 0–10 (feux larges → full trim).  
- Moisissure  
  - 0–10 (0 = très présente / 10 = aucune, sans trace).  
- Graines  
  - 0–10 (0 = très grainé / 10 = aucune graine).

### 8.2 Propreté & contaminants

- Corps étrangers  
  - Multi-select : “Cheveux”, “Fibre textile”, “Poussière visible”, “Insectes morts”, “Aucun”.  
- Propreté globale  
  - Slider 0–10.

***

## 9. Odeurs & goûts (lexicon UI only)

### 9.1 Odeurs – lexique structuré

Basé sur lexiques sensoriels modernes avec CATA (check-all-that-apply).[10][11][12][7]

- Notes dominantes (max 7)  
  - UI : roue aromatique + catégories :  
    - Fruité : agrumes, tropical, fruits rouges, fruits secs, melon…  
    - Floral : rose, lavande, jasmin, fleur blanche…  
    - Terreux / boisé : terre humide, pin, cèdre, mousse…  
    - Piquant / épicé : poivre, clou de girofle, cannelle, herbes sèches…  
    - Skunky / animalic : mouffette, musc, ferme, fromage…  
    - Chimique / gaz : diesel, essence, solvant, plastique…  
    - Sucré / gourmand : bonbon, caramel, miel, vanille…  
    - Végétal / herbacé : herbe coupée, foin, thé vert…  
- Notes secondaires  
  - Même roue, max 7, priorité secondaire.

- Intensité globale odeur  
  - Slider 0–10.  
- Complexité aromatique  
  - Slider 0–10 (simple → très complexe).

### 9.2 Goûts / bouche

- Dry puff / tirage à sec  
  - Multi-select dans même roue aromatique (max 7).  
- Inhalation  
  - Multi-select (max 7).  
- Expiration / rétro-olfaction  
  - Multi-select (max 7).  
- Intensité du goût  
  - Slider 0–10.  
- Agressivité / gratte gorge  
  - Slider 0–10.  
- Douceur / rondeur en bouche  
  - Slider 0–10.  

***

## 10. Texture & toucher (Fleurs)

- Dureté au doigt  
  - Slider 0–10 (très mou → roche).  
- Densité tactile  
  - 0–10.  
- Élasticité  
  - 0–10 (friable → très spongieux).  
- Collant / résineux  
  - 0–10 (sec → colle aux doigts).  
- Humidité perçue  
  - 0–10 (trop sec → trop humide).  
- Friabilité  
  - 0–10 (poudreux → ne se casse pas).

***

## 11. Effets & expérience d’utilisation

### 11.1 Effets

- Montée (rapidité)  
  - Slider 0–10 (très lent → instantané).  
- Intensité globale  
  - Slider 0–10.  
- Effets (max 8, multi-select)  
  - Mental : euphoriant, créatif, focus, sociable, anxiogène, dissociatif…  
  - Physique : relaxant, lourd, énergisant, body high, analgésique…  
  - Thérapeutique : anxiolytique, antidouleur, somnifère, anti-nauséeux, ouvre l’appétit, etc.[13][14]
  - Chaque effet a tag “positif / neutre / négatif” pré-codé.

### 11.2 Contexte de test

- Méthode de consommation  
  - “Joint”, “Bang”, “Pipe”, “Vaporisateur herbe sèche”, “Vape cart”, “Autre”.  
- Dosage (grammes estimés)  
  - Slider 0.05–1.0 g.  
- Durée des effets mesurée  
  - Time-picker HH:MM ou catégories : <1h / 1–2h / 2–4h / 4h+.  
- Moment de la journée  
  - “Matin”, “Après-midi”, “Soir”, “Nuit”.  
- Contexte  
  - “Seul”, “Entre amis”, “Événement social”, “Travail créatif”, “Usage médical”, “Autre”.  
- Usage préféré  
  - Multi-select : “Soir”, “Journée”, “Social”, “Solo”, “Productif”, “Médical”.

### 11.3 Effets secondaires & tolérance

- Effets secondaires (multi-select)  
  - Yeux secs, bouche sèche, faim, anxiété, parano, tachycardie, somnolence, confusion, aucun.  
- Tolérance du testeur  
  - “Faible”, “Moyenne”, “Élevée”, “Très élevée”.  

***

## 12. PipeLine Curing / Maturation (Fleurs)

### 12.1 Config curing

- Trame  
  - Secondes / Minutes / Heures / Jours / Semaines / Mois (segmented control).  
- Durée totale  
  - Slider (ex. 7–180 jours en mode “jours”).[15][16][17]
- Type de curing  
  - “Bocal verre”, “Room curing”, “Bag curing”, “Autre”.  
- Type de maturation  
  - “Froid (<5 °C)”, “Temp. ambiante (5–25 °C)”, “Chaud (>25 °C)”.

### 12.2 Paramètres par étape

- Température curing  
  - Slider 5–25 °C.  
- HR dans récipient  
  - Slider 45–70%.[17][15]
- Type de récipient  
  - “Verre transparent”, “Verre ambré”, “Plastique”, “Métal”, “Curing room”, “Autre”.[18]
- Opacité  
  - Opaque / Semi-opaque / Transparent / Ambré.  
- Remplissage récipient  
  - Slider 10–90% du volume.  
- Gestion de l’oxygène  
  - Toggle : “Burping” ON/OFF.  
  - Si ON : fréquence (1–3 fois/jour au début, puis slider).[16][17]
  - Option “Sachets régulateurs HR” : ON/OFF + HR cible (58/62%).  

### 12.3 Impact sensoriel

Pour chaque étape ou par période :

- Évolution visuel (mini sliders) :  
  - “+/-” sur densité, couleur, manucure perçue.  
- Évolution odeurs  
  - sliders “plus skunky / plus fruité / plus terreux / plus doux / plus complexe”.  
- Évolution goûts  
  - “Plus doux en bouche”, “Moins agressif”, “Plus sucré”, “Plus boisé”… (CATA).  
- Évolution effets  
  - “Plus stone”, “Plus cérébral”, “Plus équilibré”, “Pas de changement”.
