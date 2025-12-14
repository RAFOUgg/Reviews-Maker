# Fonctionnalités de Terpologie : Reviews-Maker

### Outils de tracabilité produit cannabinique.

#### Apparence de l'application : 

Page principal : 
HomePage avec accès aux fonctionnalités principales :
Par defaut : Mode clair/sombre (système de détection automatique selon préférence OS avec option de forçage manuel dans les paramètres)
Interface claire, moderne et épurée, apple-like design. Intégration du liquid glass dans les modaux, boutons, menus, etc...
    - Choix de thèmes
Depuis paramètre utilisateur : 
    - Thèmes : Violet Lean, Vert émeraude, Bleu tahiti, Sakura
# Adaptation format pc, téléphone et tablette (responsive design) :
- Interface adaptative selon la taille de l'écran (mobile, tablette, desktop)
- Optimisation des performances pour chaque type d'appareil
- Immersion totale en mode mobile (PWA)

---

# Choix de type de compte à l’inscription
Revoir le système de choix du type de compte à l’inscription, avec une interface claire, designe et apple-like, expliquant les différences et obligations associées à chaque type de compte. Utiliser "## Répartition des fonctionnalités selon les types de comptes utilisateurs :" comme base.

# CONNEXION ET APPLICATIONS DE CONNEXION ET DE SECURITE :
- Connexion par email/mot de passe (pseudo obligatoire)
- Connexion via compte tiers : OAuth2 (Google, Facebook, Apple, Amazon, Discord)
    - Pseudo facultatif, sinon utilisé celui du compte tiers
    - Photo de profil depuis compte tiers
    - Adresse mail depuis compte tiers  
    - Langue et pays depuis compte tiers, sinon demander à l'inscription
- Système de réinitialisation de mot de passe (email de réinitialisation avec token sécurisé, lien valable 1h)
- Système de double authantification (2FA) via application d'authentification (Mail, Google Authenticator, Authy, etc...) depuis paramètre de compte
- Gestion des sessions actives (liste des appareils connectés, possibilité de déconnecter un appareil depuis paramètre de compte)

# Vérification d'âge légal :

- Système de vérification d'âge légal (>18/21 ans selon pays) à l'inscription
    - Collecte de la date de naissance
    - Affichage d'un disclaimer légal (RDR) adapté au pays
    - Option de vérification via pièce d'identité (upload sécurisé, vérification manuelle ou via service tiers eKYC) (pour les producteurs uniquement et influenceurs)

# Informations personnels des comptes et données sauvegardables : 

# 1. **Producteurs** (comptes payants, accès à des fonctionnalités avancées et à l’export pro)

### **A. Identité légale et conformité**
- **Nom ou dénomination sociale**
- **Prénom / Nom du représentant légal (si société)**
- **Adresse professionnelle ou siège social**
- **Pays, région, code postal**
- **Numéro SIRET/SIREN pour la France ou équivalent national (registre du commerce, numéro fiscal)**
- **Forme juridique** (auto-entrepreneur, société, association…)
- **Numéro de TVA intracommunautaire (entreprises UE)**
- **Pièce d'identité du représentant légal (RIB, passeport, carte d’identité)**
- **Justificatif d'activité légale** (licence, attestation, extrait K-bis, licence cannabis légal/chanvre, ou équivalent selon réglementation locale)
- **Adresse mail professionnelle vérifiée**
- **Numéro de téléphone professionnel (pour vérification/SMS)**
- **Documents prouvant la légalité de production ou distribution** (certificat d'autorisation, déclaration préfectorale…)
- **Preuve d’âge légal** du/des représentants (>18/21 ans ou selon réglementation locale)

### **B. Données de compte**
- **Pseudo/nom d’affichage**
- **Mot de passe sécurisé (hashé)**
- **Logo/visuels entreprise**
- **URL du site web ou boutique**
- **Réseaux sociaux/publics professionnels**

### **C. Paiement et facturation**
- **Adresse de facturation**
- **Méthode de paiement (CB, SEPA, Paypal, autres : tokenisée/sécurisée)**
- **Historique des transactions et abonnements**

- **Acceptation des CGU, politique de confidentialité et mentions légales**

### **D. Préférences et utilisation de la plateforme : depuis parametre**
- **Langue préférée**
- **Types de produits cultivés/fabriqués**
- **Accès API ou shop connecté (Shopify, autre)**
- **Bibliothèque des reviews déposées**
- **Thème/design du compte**

---

# 2. **Influenceurs** (compte intermédiaire, accès à la publication publique et partagée)

**Données à recueillir :**

### **A. Identité et présence en ligne**
- **Nom / Prénom**
- **Pseudo**
- **Adresse mail vérifiée**
- **Pays/région (pour conformité légale à la publication)**
- **Preuve d’âge légal** (>18 ou 21 ans selon pays)
- **Réseaux sociaux** (Instagram, TikTok, Youtube, etc.)
- **ID de connexion tiers (Discord, Google, Facebook, Apple, Amazon)**
- **Photo de profil/avatar**
- **Site web/portfolio (facultatif)**

### **B. Données de compte**
- **Mot de passe sécurisé (ou login tiers)**
- **Historique des reviews partagées**
- **Statistiques de publication/Audience**
- **Préférences utilisateur (langue, thèmes, notifications)**

### **C. Conditions légales**
- **Acceptation des CGU, politique confidentialité, politique publication**
- **Accord pour publication de contenus (droit à l’image, gestion droits d’auteur des reviews/photos)**


---

# 3. **Amateurs** (consommateurs classiques, accès gratuit)

**Données à recueillir :**

### **A. Identité minimale**
- **Pseudo**
- **Adresse mail valide** (vérification nécessaire)
- **Pays/région/âge déclaré** (contrôle âge >18 ou 21 ans, selon pays)
- **ID de connexion tiers (Discord, Google, Facebook, Apple, Amazon)**
- **Photo de profil/avatar (facultatif)**

### **B. Données de compte**
- **Mot de passe sécurisé (ou login tiers)**
- **Historique des reviews déposées**
- **Préférences utilisateur (langue d’interface, thème, notifications)**

### **C. Légalité**
- **Acceptation des CGU et des conditions légales d’utilisation**
- **Mention et affichage du disclaimer RDR et réglementation locale à l’inscription et lors de chaque publication**

---

## **Synthèse des points légaux**

Définir des CGU et politiques de confidentialité adaptées à chaque type de compte, en tenant compte des obligations légales spécifiques aux producteurs et influenceurs.

---

- ## Répartition des fonctionnalités selon les types de comptes utilisateurs :

- **Compte standard (Amateur) :**
    - Accès aux section : 
        - Information général
        - Visuel & Technique
        - PipeLine CURING MATURATION
        - Odeurs
        - Goûts
        - Effets ressentis
    - Accès aux templates prédéfinis (Compact, Détaillé, Complète)
        - Format imposé par les templates obligatoire.
    - Export en PNG/JPEG/PDF moyenne qualité
    - Personnalisation limitée (thème clair/sombre, choix de couleurs complet, configuration image et typo)
Détailler
- **Compte Producteur (Payant 29.99€/mois) :**
    - Accès à tous les templates (y compris Personnalisé)
        - Mode contenus zone personnalisable avec drag and drop des contenus sur mesure 
    - Export en haute qualité (PNG/JPEG/PDF 300dpi, SVG, CSV, JSON, HTML)
    - Personnalisation avancée (polices personnalisées, filigrane, agencement complet)
    - Accès au PipeLine configurable pour exports
Détailler
- **Influenceur (Payant 15.99€/mois) :**
    - Accès aux aperçus et rendu détaillé et complet avec système drag and drop, configuration etc...
    - Export en haute qualité (PNG/JPEG/SVG/PDF 300dpi)
Détailler


--- 


### Création des reviews et export :

# Interface générale et règles de saisie des données
Presque aucune saisie ne doit être textuelles, tout doit se faire via des séléctions, des choix, des boutons, des menu déroulant etc...
Interface ergonomique avec aide contextuelle (tooltips, modales d’aide, etc...) pour guider l’utilisateur dans la saisie des données.
Apple-like design, épuré, moderne et intuitif. Assistance à la saisie (auto-complete, suggestions, etc...).
    - Incorporation d'UI liquid au style d'apple.
    - Modern et épuré. Stylysé

# Règles générale : 

Unités et formats standards pour les champs chiffrés :
Utiliser les unités du système international (SI) lorsque c’est possible (g, ml, cm, m², °C, ppm, etc...) Préciser l’unité entre parenthèses si nécessaire.

# Introduction aux PipeLines :

Les PipeLines sont des systèmes de saisie structurée permettant aux utilisateurs de documenter les différentes étapes de production, culture, extraction, conservation ou préparation de leurs produits. 

Chaque PipeLine est adaptée au type de produit (fleurs, hash, concentrés, comestibles) et permet une saisie détaillée et organisée de certaines des données pertinentes.
Les PipeLine permettent d'avoir des reviews et fiches technique évolutives et complètes, reflétant fidèlement le processus de production et les caractéristiques du produit final. Les producteur peuvent avoir des exports GIF pour refleter l'évolution de leur culture, et les influenceurs peuvent montrer les étapes de curing ou de préparation de leurs comestibles.

"Chaque infos est définissable, et modifiable à un moment de la PipeLine. Chaque PipeLine permet de définir sa trame (type et temps d'une case : seconde, heure, mois phase, etc...). J'aimerais reprendre le principe visuel du nombre de commit de github. On voit (dans ce cas) les 365 case équivalante aux 365 jours de l'année. Chaque jours contient des infos (pour github c'est le nombre de commit). Mais dans notre projet, chaque "case" jours, semaines, mois ou phase / autres, contiendras des données et informations. Pour chaque PipeLine, ce n'est plus un simple détails des données et statistiques mais une vraie tracabilité évolutive et représentative des actions évènements."

"Lorsque on choisi :
- jours : date debut et fin obligatoire
- Semaines : semaine début obligatoire et fin facultatif
- Phases : Phase prédéfinit selon type de PipeLine

Jours : chaque case correspond à un jours
Semaines : chaque case représente S1, S2 Sn ...
Phase : Une case pour chacune des 12 phases prédéfinis"
"Une culture ou fabrication/maturation de résine n'est pas toutes simple et récitable ene quelque ligne, en plusieurs mois il peut se passer des milliers d'actions sur un plant de cannabis, de la germination à la récolte, en passant par la croissance, le stretch, la floraison, le séchage et le curing. Chaque étape peut influencer le produit final de manière significative. C'est pour cela qu'il doit être possible non pas de faire une review en 2D, mais en 3D, le plan, et le temps.


# Introduction au systèmes de génétique avec canva de séléctions (Pour Producteur et type Fleurs uniquement):

Disponible depuis la bibliothèque de l'utilisateur :
Création d'arbe généalogique avec des relations parents/enfants entre les cultivars de sa propre bibliothèque.
    - Gestion de projet PhenoHunt, nomination et création de cultivars spécifique
Un système de gestion des génétiques permet aux utilisateurs de créer et gérer une bibliothèque de cultivars, variétés et lignées.
[Interface]
bandeau lateral gauche contenant :
    - onglet en haut : Bibliothèque (liste des cultivars enregistrés)
    - onglet en haut : Projets PhenoHunt (gestion des cultivars en cours de développement, des canvas de sélection, etc...)
    - Navigation dans les onglet jusqu'à sa bibliothèque de génétiques. Galerie ou liste (filtre etc...)
Canva vide à droite : 
    - Drag and drop des cultivars depuis la bibliothèque vers le canva
    - Création de relations parents/enfants entre les cultivars (lignée généalogique)
    - Visualisation graphique de l'arbre généalogique
    - Options pour ajouter/modifier/supprimer des cultivars directement depuis le canva
    - Canva utilisable dans le rendu. 
---

## 1. Enumération des types de produits et de leurs champs spécifiques

### **A. Fleurs (Herbes/Buds)**
**Champs récupérés et configurables :**
- **📋 Informations générales**
    - Nom commercial*
    - Cultivar(s)
    - Farm
    - Type (indica, sativa, hybride indica-dominant, sativa-dominant, CBD-dominant)
    - Photo (1-4)*
- **Génétiques**
    - Breeder de la graine
    - Variété (auto-complete)
    - Type : Indica / Sativa / Hybride
    - Pourcentage de chaque génétique (si dispo)
    - Généalogie (parents, lignée, phénotype/clone)
    - Code phénotype ou sélection (“Pheno” pour hunt)
- **PipeLine GLOBAL : Données de culture**
    Système de saisie structuré pour producteurs avec PipeLine complète.
    Pipeline :
    - Configurations :
        - Définition de la trame de la PipeLine (intervalles : phase (0day=graine, Germination, Plantule, debut/milieu/fin de croissance, debut/milieu/fin du stretch, debut/milieu/fin de floraison.))
            - Définition d'un début et d'une fin de culture.
            - En mode semaine : permettre d'ajouter les semaine une par une, commme une journal de bord.

        - Période de culture (dates début/fin/durée/saisons)
    - Fonctionnement de la PiepeLine :
        - Saisie des données à chaque étape (J+X, semaine Y, saison, phase Z etc...)
        - Possibilité d’ajouter/supprimer des étapes custom (données modifiables)
        - Champs custom par étape (notes (commentaire 500 caractères), ajouts / modification d'une données de la review)
    - Données modifiables :       
        [GENERAL]
        - Définition des phases (si pipeline par phase choisie)
        - Début et fin de culture (date) 1 MAX
        - Mode : Indoor / Outdoor / Greenhouse / No-till / Autre
        - Espace de culture : 
            - Type (armoire, tente, serre, extérieur, autre)
            - Dimensions (LxlxH en cm/m)
            - Surface au sol (m²)
            - Volume total (m³)
        [ENVIRONEMENT]
        - Technique de propagation : (graine, clone, bouture, sopalin, coton, serviette etc... )
        - Substrat : 
            - Type : (Hydro / Bio / Organique)
            - Volume (L) :
            - Composition % : (terre, coco, laine roche, etc.)
                - Préciser la marque des ingrédiants si possible
        - Système d'irrigation : 
            - Type (goutte à goutte, inondation, manuel, etc.)
            - Fréquence (par jour/semaine)
            - Volume d'eau par arrosage (L)
        - Engrais utilisés (liaison possible entre un arrosage et un engraissage dans la pipeline) :
            - Type (bio, chimique, mixte)
            - Marque et gamme
            - Dosage (g/L ou ml/L)
            - Fréquence d'application (seconde, minute, heure, jour, semaine)
        - Lumière : 
            - Type de lampe (LED, HPS, CFL, Naturel, Mixte, etc.)
            - Type de spectre (complet, bleu, rouge, etc.) si dispo
            - Distance lampe/plante (cm/m/pieds etc...)
            - Puissance totale (W)
            - Durée d'éclairage par jour (heures)
            - DLI (mol/m²/jour) si dispo
            - PPFD moyen (µmol/m²/s) si dispo
            - Kelvin (température de couleur) si dispo
        - Environnement : 
            - Température moyenne (°C)
            - Humidité relative moyenne (%)
            - CO2 (ppm) si dispo
            - Ventilation (type, fréquence)
        - Palissage LST/HST : 
            - Méthodologies : SCROG, SOG, Main-Lining, etc.
                - Commentaire pour décrire la manipulations
        - Morphologie de la plante :
            - Taille
            - Volume
            - Poid
            - Nombre de branches principales
            - Nombre de feuilles
            - Nombre de buds
        - Recolte :
            - Couleur des trichomes au moment de la récolte (nuancier (laiteux, ambré, translucide))
            - Date de récolte
            - Poids brut (g)
            - Poids net (après 1er defoliation) (g)
            - Rendement (g/m² ou g/plante)
- **Données analytiques, PDF**
    - Taux THC (%)
    - Taux CBD (%)
    - Taux CBG/CBC autres (%) ou mg/g
    - Profil terpénique complet (par certificat d’analyse pdf/image uniquement)
- **👁️ Visuel et Technique**
    - Couleur/10 (echelle de couleur (nuancier des couleurs du cannabis)vert, violet, jaune, breun, gris etc dégradé.)
    - Densité visuelle/10
    - Trichomes/10
    - Pistils/10
    - Manucure/10
    - Moisissure (10=aucune)/10
    - Graines (10=aucune)/10
- **👃 Odeurs**
    - Notes dominantes (max 7 parmis une liste pré-définie ultra complète)
    - Notes secondaires (max 7)
    - Arômes à l’inhalation (primaire/secondaire)
    - Saveur en bouche, rétro-olfaction
    - Intensité de l’arôme (échelle 1 à 10)
- **🤚 Texture**
    - Dureté/10
    - Densité tactile/10
    - Élasticité/10
    - Collant/10
- **Goûts**
    - Intensité/10
    - Agressivité/piquant (fidélité aux cultivars) /10
    - Dry puff/tirage à sec (max 7 parmis une liste pré-définie ultra complète)
    - Inhalation (max 7)
    - Expiration/arrière-goût (max 7)
- **💥 Effets ressentis**
    - Montée (rapidité)/10
    - Intensité/10
    - Choix (max 8 parmis une liste pré-définie ultra complète classée par type (mentaux, physique, thérapeutiques) déjà codé)
        - Filtre par tous,  neutre, positif et négatif
    - **Expérience d’utilisation durant les tests**
        - Méthode de consommation (Combustion/Vapeur/Infusion)
        - Dosage utilisé (estimé en grammes/mg)
        - Durée des effets (HH:MM)
        - Profils d’effets (choix multiples ; anxiolytique, relaxant, énergisant, créatif, euphorique, etc.)
        - Effets secondaires ressentis (yeux secs, faim, anxiété, etc.)
        - Début des effets (immédiat, différé, etc.)
        - Durée des effets (courte/moyenne/longue)
        - Usage préféré (soir, journée, seul, social, médical)
    
- **🔥 PipeLine CURING MATURATION :** 
- Configurations :
        - Définition de la trame de la PipeLine (intervalles : seconde, minute, heures, jour, semaine, mois)
        - Durée de curing (trame choisie)
    - Type de maturation/curing (froid <5°C/ chaud >5°C)
    - Température de curing (°C)
    - Humidité relative dans recipient (%)
    - Type de recipient (aire libre, verre, plastique, etc... et autre)
    - Emballage/Ballotage primaire : (celophane, papier cuisson, aliminium, paper hash, sac à viade, congelation, sous vide(complète par machine, partiel manuellement), autre)
    - Opacité du recipient de curing (opaque, semi-opaque, transparent, ambré, etc...)
    - Volume ocupé par le produit dans le recipient (L/mL)
    - Modification des testes : 
        - Visuel & Technique
        - Odeurs
        - Goûts
        - Effets ressentis

---

### **B. Hash (Hash, Kief, Ice-O-Lator, Dry-Sift)**
**Champs récupérés :**
- **📋 Informations générales**
    - Nom commercial*
    - Hashmaker
    - Laboratoir de production
    - Cultivars utilisés : nouveau ou depuis la bibliothèque de l'utilistateur via pup-up
    - Photo (1-4)*
- **🔬 Pipeline & Séparation**
**Système de saisie structuré pour producteurs avec PipeLine complète.**
Pipeline :
- Configurations :
        - Définition de la trame de la PipeLine (intervalles : s, m, h)
    - Méthode de séparation (manuelle, tamisage à sec, eau/glace, autre)
    - Nombre de passes (si eau/glace)
    - Température de l’eau (si eau/glace)
    - Taille des mailles utilisées (si tamisage à sec)
    - Type de matière première utilisée (trim, buds, sugar leaves, etc... et autres)
    - Qualité de la matière première (échelle 1-10)
    - Rendement (%) estimé
    - Temps total de séparation (minutes)
- Chaque étape de la PipeLine permet de saisir des données spécifiques (température, durée, matériel utilisé, etc...)
Pipeline purification : 
"Chromatographie sur colonne, Flash Chromatography, HPLC, GC, TLC, Winterisation, Décarboxylation, Fractionnement par température, Fractionnement par solubilité, Filtration, Centrifugation, Décantation, Séchage sous vide, Recristallisation, Sublimation, Extraction liquide-liquide, Adsorption sur charbon actif, Filtration membranaire " 

Avec pour chacun des valeurs et données associées (température, durée, solvant, etc... VALEUR ET DONNEES A DEFINIR POUR CHAQUE METHODE)

- **👁️ Visuel & Technique**
    - Couleur/transparence/10
        - echelle de couleur (nuancier)noir, brun, ambre, doré, jaune clair, blanc dégradé.
    - Pureté visuelle/10
    - Densité visuelle/10
    - Pistils/10
    - Moisissure (10=aucune)/10
    - Graines (10=aucune)/10
- **👃 Odeurs**
    - Fidélité au cultivars/10
    - Intensité aromatique/10
    - Notes dominantes (max 7 parmis une liste pré-définie ultra complète)
    - Notes secondaires (max 7 parmis une liste pré-définie ultra complète)
- **🤚 Texture**
    - Dureté/10
    - Densité tactile/10
    - Friabilité/Viscosité/10
    - Melting/Résidus/10
- **😋 Goûts**
    - Intensité/10
    - Agressivité/piquant/10
    - Dry puff/tirage à sec (max 7)
    - Inhalation (max 7)
    - Expiration/arrière-goût (max 7)
- **💥 Effets ressentis**
    - Montée (rapidité)/10
    - Intensité/10
    - Choix (max 8 parmis une liste pré-définie ultra complète classée par type (mentaux, physique, thérapeutiques) déjà codé)
        - Filtre par tous,  neutre, positif et négatif
    - **Expérience d’utilisation durant les tests**
        - Méthode de consommation (Combustion/Vapeur/Infusion)
        - Dosage utilisé (estimé en grammes/mg)
        - Durée des effets (HH:MM)
        - Profils d’effets (choix multiples ; anxiolytique, relaxant, énergisant, créatif, euphorique, etc.)
        - Effets secondaires ressentis (yeux secs, faim, anxiété, etc.)
        - Début des effets (immédiat, différé, etc.)
        - Durée des effets (courte/moyenne/longue)
        - Usage préféré (soir, journée, seul, social, médical)
- **🔥 PipeLine CURING MATURATION :** 
- Configurations :
        - Définition de la trame de la PipeLine (intervalles : s, m, h)
        - Durée de curing (jours/semaines/mois selon trame choisie)
    - Type de maturation/curing (froid <5°C/ chaud >5°C)
    - Température de curing (°C)
    - Humidité relative dans recipient (%)
    - Type de recipient (aire libre, verre, plastique, etc... et autre)
    - Emballage/Ballotage primaire : (celophane, papier cuisson, aliminium, paper hash, sac à viade, congelation, sous vide(complète par machine, partiel manuellement), autre)
    - Opacité du recipient de curing (opaque, semi-opaque, transparent, ambré, etc...)
    - Volume ocupé par le produit dans le recipient (L/mL)
 
---

### **C. Concentrés (Rosin, BHO, etc.)**
**Champs récupérés :**
- **📋 Informations générales**
    - Nom commercial*
    - Hashmaker
    - Laboratoir de production
    - Cultivars utilisés : nouveau ou depuis la bibliothèque de l'utilistateur via pup-up
    - Photo (1-4)*
- **🔬 Pipeline Extraction**
- Configurations :
        - Définition de la trame de la PipeLine (intervalles : s, m, h)
    - Méthode d'extraction - Vous devez spécifier les cultivars avant de définir les étapes du pipeline
"Extraction à l'éthanol (EHO)Extraction à l'alcool isopropylique (IPA)Extraction à l'acétone (AHO)Extraction au butane (BHO)Extraction a l'isobutane (IHO)Extraction au propane (PHO)Extraction à l'hexane (HHO)Extraction aux huiles végétales (coco, olive)Extraction au CO₂ supercritiqueAutrePressage à chaud (Rosin)Pressage à froidExtraction par ultrasons (UAE)Extraction assistée par micro-ondes (MAE)Extraction avec tensioactifs (Tween 20)Autre"
Pipeline de purification : 
Choisir des méthode + définir des paramètres associés :
"Chromatographie sur colonne, Flash Chromatography, HPLC, GC, TLC, Winterisation, Décarboxylation, Fractionnement par température, Fractionnement par solubilité, Filtration, Centrifugation, Décantation, Séchage sous vide, Sublimation, Recristallisation, Extraction liquide-liquide, Adsorption sur charbon actif, Filtration membranaire"


- **👁️ Visuel & Technique**
    - Couleur / Transparence/10
    - Viscosité/10
    - Pureté visuelle/10
    - Melting (10=FullMelt)/10
    - Résidus (10=aucune)/10
    - Pistils (10=aucune)/10
    - Moisissure (10=aucune)/10
- **👃 Odeurs**
    - Fidélité au cultivars/10
    - Intensité aromatique/10
    - Notes dominantes (max 7 parmis une liste pré-définie ultra complète)
    - Notes secondaires (max 7 parmis une liste pré-définie ultra complète)
- **🤚 Texture**
    - Dureté/10
    - Densité tactile/10
    - Friabilité/Viscosité/10
    - Melting/Résidus/10
- **😋 Goûts**
    - Intensité/10
    - Agressivité/piquant/10
    - Dry puff/tirage à sec (max 7)
    - Inhalation (max 7)
    - Expiration/arrière-goût (max 7)
- **💥 Effets ressentis**
    - Montée (rapidité)/10
    - Intensité/10
    - Choix (max 8 parmis une liste pré-définie ultra complète classée par type (mentaux, physique, thérapeutiques) déjà codé)
        - Filtre par tous,  neutre, positif et négatif
    - **Expérience d’utilisation durant les tests**
        - Méthode de consommation (Combustion/Vapeur/Infusion)
        - Dosage utilisé (estimé en grammes/mg)
        - Durée des effets (HH:MM)
        - Profils d’effets (choix multiples ; anxiolytique, relaxant, énergisant, créatif, euphorique, etc.)
        - Effets secondaires ressentis (yeux secs, faim, anxiété, etc.)
        - Début des effets (immédiat, différé, etc.)
        - Durée des effets (courte/moyenne/longue)
        - Usage préféré (soir, journée, seul, social, médical)
- **🔥 PipeLine CURING MATURATION :** 
- Configurations :
        - Définition de la trame de la PipeLine (intervalles : s, m, h)
        - Durée de curing (jours/semaines/mois selon trame choisie)
    - Type de maturation/curing (froid <5°C/ chaud >5°C)
    - Température de curing (°C)
    - Humidité relative dans recipient (%)
    - Type de recipient (aire libre, verre, plastique, etc... et autre)
    - Emballage/Ballotage primaire : (celophane, papier cuisson, aliminium, paper hash, sac à viade, congelation, sous vide(complète par machine, partiel manuellement), autre)
    - Opacité du recipient de curing (opaque, semi-opaque, transparent, ambré, etc...)
    - Volume ocupé par le produit dans le recipient (L/mL)

---

### **D. Comestibles**
**Champs récupérés :**
- **📋 Informations générales**
    - Nom du produit*
    - Type de comestible
    - Fabricant
    - Type de genétiques
    - Photo (1-4)*
- **PipeLine Recette**
    - 🥘 Ingrédients :
        - Choix entre produit standard et produit cannabinique
        - Ajout de l'ingrediant, d'une qtt et d'une unité (g, ml, pcs, etc...)
        - Possibilité d'ajouter plusieurs ingrédients
        - Étapes de préparation (actions prédéfinis,assignable à chaque ingrediant)
- **😋 Goûts**
    - Intensité/10
    - Agressivité/piquant/10
    - Saveurs dominantes (max 7 parmis une liste pré-définie ultra complète)
- **💥 Effets ressentis**
    - Montée (rapidité)/10
    - Intensité/10
    - Choix (max 8 parmis une liste pré-définie ultra complète classée par type (mentaux, physique, thérapeutiques) déjà codé)
        - Filtre par tous,  neutre, positif et négatif
    - Durée des effets (5-15min, 15-30min, 30-60min, 1-2h, 2h+, 4h+, 8h+, 24h+)

---

## 2. Export Maker, l'exporter des reviews, formats et options
Nombre de contenus limité par template et format (ex: format 9:16 ne peut pas contenir autant d'éléments que le format 1:1)
    - Pagination possible pour les formats 1:1 et 16:9 (max 9 pages par export) 
    - Formats choisissable : 1:1, 16:9, A4, 9:16 etc...
    - Templates prédéfinis :
     - Contenus non choisissables depuis les templates prédéfinis, si ajout / suppression d'éléments souhaitée, passer en mode personnalisé (si compte producteur/influenceur).
        - Compact Format : 1:1 uniquement
            - Contenus : 
                - Type de produit
                - Nom commercial
                - Cultivars
                - Farm / Hashmaker
                - Photo principale
                - PipeLine CURING MATURATION
                - Total de Visuel & Technique 
                - Total de Odeurs
                - Total de Goûts
                - Total de Effets ressentis
        - Détaillé Format : 1:1, 16:9, 9:16 A4
            - Contenus : 
                - Informations générales complètes
                - 5 étapes de chaque Pipeline (si existant et available)
                - PipeLine CURING MATURATION 
                - Chaque note de Visuel & Technique
                - Chaque note de Odeurs
                - Chaque note de Texture
                - Chaque note de Goûts
                - Chaque note de Effets ressentis
        - Complète
            - Contenus : 
                - Informations générales complètes
                - Toutes les Pipeline complètes (si existant et available)
                - Toutes les séction et notes détaillées avec données associés
                - Arbre généalogique des cultivars (si fleurs et si available)
        - Influenceur Mode (Format 9:16 uniquement) :
        - Contenus : 
            - Type de produit
            - Nom commercial
            - Cultivars
            - Farm / Hashmaker
            - Photo principale
            - PipeLine CURING MATURATION
            - Total de Visuel & Technique 
            - Total de Odeurs
            - Total de Goûts
            - Total de Effets ressentis        
        - Personnalisé (drag and drop des données à inclure dans les zones prévues de la reviews (format 1:1 ou 9:16 choisi non modifiable dans ce mode))
        - PipeLine configurable (Producteur):
            - Choix des étapes à afficher (avec possibilité d'ajouter des étapes custom)
            - Choix des données à afficher par étape (notes, images, données chiffrées, etc...)
    Export : 
    - Système d'export des reviews en PNG/JPEG/SVG, PDF, CSV, JSON et HTML avec options de qualité (dpi, compression, etc...)
    - Partage direct sur les réseaux sociaux (Twitter, Instagram, Facebook, Reddit, etc...)
    - Envoi par email (avec options de mise en page et de format)

- **Apparence de Export Maker**
[BANDEAU_LATERAL_GAUCHE] :
- Onglet en haut du bandeau :
    - Templates : 
        - Templates prédéfinis et personnalisés par l'utilisateur (si available selon type de compte)
    - Personnalisation gratuite :
        - Thème clair/sombre
        - Choix des couleurs : textes, bordure, fonds, etc... (palette prédéfinie ou personnalisée)
        - Polices personnalisées (choix parmi une liste de polices web-safe et Google Fonts)
        - Filigrane (option d'ajout d'un filigrane personnalisé sur les exports) (Choix de la position, taille, opacité)
        - Apparences et choix des images affichées (bordure, effet colorimétrique, flou, etc...)
[CANVA PRODUCTEUR/INFLUENCEUR MODE]
    - Contenu (Personnalisation payante si avaialable) :  
        - Choix du format (1:1, 16:9, A4, 9:16)
        - Choix des sections à inclure/exclure
        - Définition des zones personnalisées :
            - Drag and drop des éléments dans les zones définits
        - Options d'agencement des éléments (drag and drop pour réorganiser les emplacement des sections de la review avant export)

# UTILISATION DES APERÇUS D'EXPORTS : 

L'aperçus est crée par l'utilisateur, il peux le sauvegarder dans sa bibliothèque pour réutilisation rapide dans d'autre review.
Il est possible de partager une templates crée avec d'autre utilisateur via un système de code unique (lien de partage directe aussi).
L'aperçus définit est celui qui sera utilisé par défaut lors de l'export de la review.
L'aperus définit est celui qui sera visible par tous si la review est publique dans la galerie publique.
Pas besoins d'aperçus pour des reviews privées.


### Système de bibliothèque personnel (Partiellement déjà codé) : 
- Reviews sauvegardées
    - Suppression, édition, duplication, partage, visibilité
- Sauvegarde des templates/configuration d'aperçus créés
    - Gestion des aperçus (édition, suppression, duplication)
- sauvegarde des filigranes personnalisés
- Sauvegarde de certaines données : 
    - Système de cultures complet etc...
    - Substrat utilisé fréquemment etc ...
    - Engrais utilisés fréquemment etc...
    - Matériel utilisé fréquemment etc...
    Permet de remplir les reviews plus rapidement via auto-complete et suggestions par préférence.

# Système de galerie publique pour les reviews partagées publiquement : 
    - Navigation par type de produit, popularité, notes, récence, etc...
    - Système de recherche avancée (filtres multiples par tout les contenus possibles)
    - Possibilité pour les utilisateurs de liker, commenter et partager les reviews publiques
    - Système de modération des contenus (signalement, revue par l'équipe admin) : panel admin doc en construction
    - Classement des reviews (top hebdo, mensuel, annuel, tout temps)

### Système de statistique de l'utilisateur (partiellement déjà codé) : 
    - Nombre de reviews créées
    - Nombre d'exports réalisés
    - Types de produits les plus recensés
    - Notes moyennes données par type de produit
    - Notes moyennes reçues par type de produit (si reviews publiques)
    - Engagements sur les reviews publiques (likes, partages, commentaires)
Les comptes producteurs et influenceurs auront accès à des statistiques plus détaillées sur leurs publications et exports.
Les producteur nottament pourront voir des statistiques sur leurs cultures, rendements, etc...

---
