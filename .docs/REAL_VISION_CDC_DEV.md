# Fonctionnalités de Terpologie : Reviews-Maker

### Outils de tracabilité produit cannabinique.

#### Apparence de l'application : 
[FRONT-END]

    BANDEAU UNIVERSEL EN HAUT DE PAGE :
    - Branding (home) : 
        - Logo Terpologie en haut à gauche (cliquable, redirige vers home)
    - Menu de profil en haut à droite : 
            - Mon compte : Profil & paramètres
            - Ma bibliothèque : Reviews et préférences
            - Statistiques
    - Pied de page avec liens vers CGU, Politique de confidentialité, Contact, Réseaux sociaux

Pop-up RDR récurente : 
- Affichage d'un pop-up de rappel RDR (Responsibility, Disclosure, Regulation) à chaque venu sur le site. Validation d'âge légal obligatoire (>18/21 ans selon pays) pour accéder au contenu.
    - Bouton "J'ai +18 ans" pour valider l'âge et fermer le pop-up
    - Lien vers la politique de confidentialité et les conditions d'utilisation


Page principal (terpologie.eu): 
HomePage avec accès aux fonctionnalités principales :
    - Section "Mes reviews récentes" avec aperçu des dernières reviews créées (uniquement pour utilisateur déjà connecté)

- Création d'une reviews via les 4 boutons : 
    - Créer une review Fleurs
    - Créer une review Hash
    - Créer une review Concentrés
    - Créer une review Comestibles
- Galerie Publique 
    - Filtres par données des produits, date, popularité etc..


#### Thèmes et design :
Par defaut : Mode clair/sombre (système de détection automatique selon préférence OS avec option de forçage manuel dans les paramètres)
Interface claire, moderne et épurée, apple-like design. Intégration du liquid glass dans les modaux, boutons, menus, etc...
    - Choix de thèmes depuis les paramètres utilisateur :
        - Mode clair
        - Mode sombre
        - Mode Violet Lean
        - Vert émeraude
        - Bleu Tahiti

# Adaptation format pc, téléphone et tablette (responsive design) :
- Interface adaptative selon la taille de l'écran (mobile, tablette, desktop)
- Optimisation des performances pour chaque type d'appareil
- Immersion totale en mode mobile (PWA) Indentation et positionnement à améliorer pour immersion et lisibilité totale.

---

[FRONT-END]
# Choix de type de compte à l’inscription
Interface claire, designe et apple-like, expliquant les différences et obligations associées à chaque type de compte.
┌─────────────────────────────────────────────────────────────────┐
│                        Choisissez votre Plan                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Des outils de traçabilité adaptés à vos besoins, du simple amateur au producteur professionnel │
│                                                                 │
│ GRILLE 3 COLONNES (Responsive: 1 col mobile, 2  tablet, 3 PC)  │
│                                                                 │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│ │     ✨       │  │      📱      │  │      👨🏼‍🌾     |          │
│ │       GRATUIT│  │         15.99│  │         29.99│          │
│ │ ■════════■   │  │ ■════════■   │  │ ■════════■   │          │
│ │ Spécs        │  │ Spécs        │  │ Spécs        │          │
│ │ Amateur      │  │ Influenceur  │  │ Producteur   │          │
│ └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘

[BACK-END]
En cliquant sur un des 3 boutons, la fenètre pop-up des informations détaillées du compte s'affiche avec :
- Description complète des fonctionnalités incluses
- Prix et modalités de paiement (mensuel/annuel)
- Obligations légales (KYC pour Influenceur et Producteur)
- Bouton "Passer à l'inscription"(amateur) ou "Passer au paiment"(producteur/influenceur) pour confirmer le choix
    - Redirection vers la page d'inscription avec le type de compte pré-sélectionné

# CONNEXION ET APPLICATIONS DE CONNEXION ET DE SECURITE :
[Amateur]
- Inscription par mail/mot de passe (pseudo obligatoire)
- Inscription par compte tiers : OAuth2 (Google, Facebook, Apple, Amazon, Discord)
    - Utilisé pseudo récupérée du compte tiers
    - Photo de profil récupérée depuis compte tiers
    - Adresse mail récupérée depuis compte tiers  
    - Date de naissance récupérée depuis compte tiers.
    - Langue et pays depuis compte tiers, si introuvable car non renseigné à l'app OAuth2 -> demander à l'inscription et sauvegardé

- Connexion rapide par email/mot de passe - vérification email obligatoire à chaque connexion (code de vérification à 6 chiffres/Lettres envoyé par mail)
- Connexion rapide via compte tiers : OAuth2 (Google, Facebook, Apple, Amazon, Discord)
- Système de réinitialisation de mot de passe (email de réinitialisation avec token sécurisé, lien valable 1h)
Depuis les paramètres : 
- Système de double authantification (2FA) via application d'authentification (Mail, Google Authenticator, Authy, etc...) 
- Gestion des sessions actives (liste des appareils connectés, possibilité de déconnecter un appareil depuis paramètre de compte)

[PRODUCTEUR_INFLUENCEUR] :

# Vérification d'âge légal :

- Système de vérification d'âge légal (>18/21 ans selon pays) à l'inscription
    - Collecte de la date de naissance via méthode de connexion OAuhth2 ou formulaire d'inscription
    - Option de vérification via pièce d'identité (upload sécurisé, vérification manuelle ou via service tiers eKYC)

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

- ## Répartition des fonctionnalités de création de reviews selon les types de comptes utilisateurs :

- **Compte standard (Amateur) :**

- Limitations : 
FILIGRANE TERPOLOGIE SUR TOUT LES REVIEWS (EXPORT ET APERCUS)
    - Bibliothèque privée restreintes 20 reviews max.
    - Accès restreint à la galerie publique : 5 reviews publique max.
    DANS LES REVIEWS :
    - Accès aux sections : 
        - Information général
        - Visuel & Technique
        - PipeLine CURING MATURATION
        - Odeurs
        - Goûts
        - Effets ressentis
    EXPORT ET APERCUS :
    - Accès aux templates prédéfinis (Compact, Détaillé, Complète)
        - Format et contenus des reviews imposé par les templates obligatoire.
    - Export en PNG/JPEG/PDF moyenne qualité
    - Personnalisation limitée (choix de couleurs complet, configuration image et typo)

- **Influenceur (Payant 15.99€/mois) :**
PAS DE FILIGRANNE TERPOLOGIE
    DANS LES REVIEWS :
    - Accès aux sections : 
        - Information général
        - Visuel & Technique
        - PipeLine CURING MATURATION
        - Odeurs
        - Goûts
        - Effets ressentis
    EXPORT ET APERCUS :
    - Accès aux templates prédéfinis (Compact, Détaillé, Complète, Social Media Influenceur, etc...)
    - Accès aux aperçus et rendu détaillé complet avec système de configuration précises etc...
    - Export en haute qualité (GIF/PNG/JPEG/SVG/PDF 300dpi)
        - Format et contenus des reviews imposé par les templates obligatoire.
        - GIF pour évolution des PipeLine
    - Personnalisation complète (choix de couleurs complet, configuration image et typo, ajout logo filigrane, )
    - Accès aux aperçus et rendu détaillé et complet avec système drag and drop, configuration etc...
    - Export en haute qualité (PNG/JPEG/SVG/PDF/GIF 300dpi)

- **Compte Producteur (Payant 29.99€/mois) :**
PAS DE FILIGRANNE TERPOLOGIE
    DANS LES REVIEWS :
    - Accès aux sections : 
        - Information général
        - PipeLine (Culture, Sépération&Purifications, Extraction, Recèttes) 
        - Visuel & Technique
        - PipeLine CURING MATURATION
        - Odeurs
        - Goûts
        - Effets ressentis
    EXPORT ET APERCUS :
    - Accès aux templates prédéfinis (Compact, Détaillé, Complète), Social Media Influenceur, Professionnel, Personnalisé etc...
        - Mode contenus zone personnalisable avec drag and drop des contenus sur mesure
    - Accès aux aperçus et rendu détaillé complet avec système de configuration précises etc...
    - Export en haute qualité (GIF/PNG/JPEG/SVG/PDF, CSV, JSON, HTML 300dpi)
        - Format et contenus des reviews imposé par les templates obligatoire.
        - GIF pour évolution des PipeLine
    - Personnalisation complète (choix de couleurs complet, configuration image et typo, ajout logo filigrane, branding, entreprise)
    - Accès aux aperçus et rendu détaillé et complet avec système drag and drop, configuration etc...
    - Accès à tous les templates (y compris Personnalisé)


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

Les PipeLines sont des systèmes de saisie structurée permettant aux utilisateurs de documenter les différentes étapes de production, culture, sepération/extraction, purification, conservation ou les préparation de leurs produits commestibles. 

"Une culture ou fabrication/maturation de résine n'est pas toutes simple et récitable en quelque ligne, en plusieurs mois il peut se passer des milliers d'actions sur un plant de cannabis, de la germination à la récolte, en passant par la croissance, le stretch, la floraison, le séchage et le curing. Chaque étape peut influencer le produit final de manière significative. C'est pour cela qu'il doit être possible non pas de faire une review en 2D, mais en 3D, le plan, et le temps."

Chaque PipeLine est adaptée au type de produit (fleurs, hash, concentrés, comestibles) et permet une saisie détaillée et organisée de certaines voir toutes les données pertinentes.
Les PipeLine permettent d'avoir des reviews et fiches technique évolutives et complètes, reflétant fidèlement le processus de production et les caractéristiques du produit final. Les producteur peuvent avoir des exports GIF depuis export maker pour utiliser à 100% leurs PipeLine pour refleter l'évolution de leur culture et curing nottament, et les influenceurs peuvent montrer les étapes de curing ou de préparation de leurs comestibles.

Concept visuel des PipeLines :

┌─────────────────────────────────────────────────────────────────┐
│                        PipeLine ***                             │
├─────────────────────────────────────────────────────────────────┤
│ (nombre de secondes,heures, jours, mois, phases, dates)         │
│ _______________________________________________________________ │
│            │☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ ☐ +             │
│            │                                                    │
│   Contenus │                                                    │
│     et     │                                                    │
│    données │                                                    │ 
└─────────────────────────────────────────────────────────────────┘
"Lorsque on choisi en haut la trame de la PipeLine (secondes, heures, jours, phases etc...), la partie du bas s'adapte automatiquement pour afficher les cases correspondantes à la trame choisie. :
- secondes : nombre de secondes total de la PipeLine (max 900s pagination car trop gros)
- Heures : nombre d'heures total de la PipeLine (max 336h)
- jours : nombre de jours total de la PipeLine (max 365 jours)
- Dates : date de début et date de fin, avec calcul automatique du nombre de jours entre les 2 dates. Pagination si plus de 365 jours.
- Semaines : nombre de semaines total de la PipeLine
- Phases : Phase prédéfinit selon type de PipeLine (nombre de phases variable selon type de PipeLine mais prédéfinit dans l'application)

Au bout de toutes les cases il est possible d'ajouter des étapes supplémentaires (+) pour allonger la PipeLine si besoin.

L'utilisateur déplace les contenus et données spécifiques rangée par sections hierarchisée dans le volet latéral gauche,  à chaque étape de la PipeLine dans les cases correspondantes en droite.

A chaque case correspondante à une étape de la PipeLine, l'utilisateur peut aussi cliquer pour ouvrir un menu contextuel lui permettant de saisir les données spécifiques à cette étape (via des menus déroulants, boutons, choix multiples, etc...).

Chaque formulaire de saisie est adapté au type de PipeLine et permet à l'utilisateur de sauvegardé ses préréglages pour les réutiliser rapidement dans d'autres étapes ou d'autres PipeLines du même type.

Depuis la vue principale de la PipeLine, l'utilisateur peut visualiser un résumé des données saisies pour chaque étape (icônes, couleurs, graphiques miniatures, etc...) pour avoir une vue d'ensemble rapide de son processus de production. 
Il à accès à un système de séléction lui permettant d'assigner rapidement une masse de donnée à plusieurs étapes en une seule fois (ex: même arrosage/engraissage/lumière/ventilation/etc... sur plusieurs jours/phases etc...), les préréglage sont sauvegardé dans la bibliothèque utilisateur pour une réutilisation rapide depuis le créateur de reviews.

---

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
- **PipeLine : Données de culture**
    - Configurations :
        - Définition de la trame de la PipeLine :
        Trames possibles : heures, jours, dates, semaines, mois, phases
            - Phases : 0day = Graine, Germination, Plantule, Debut/Milieu/Fin de Croissance, Debut/Milieu/Fin du Stretch, Debut/Milieu/Fin de Floraison.
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
            - PDF ou IMAGE du spectre 1 max
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
    - Modification des notes : 
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
        - Définition de la trame de la PipeLine (intervalles : secondes, minutes, heures)
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
        - Définition de la trame de la PipeLine (intervalles : seconde, minute, heures, jour, semaine, mois)
        - Durée de curing (trame choisie)
    - Type de maturation/curing (froid <5°C/ chaud >5°C)
    - Température de curing (°C)
    - Humidité relative dans recipient (%)
    - Type de recipient (aire libre, verre, plastique, etc... et autre)
    - Emballage/Ballotage primaire : (celophane, papier cuisson, aliminium, paper hash, sac à viade, congelation, sous vide(complète par machine, partiel manuellement), autre)
    - Opacité du recipient de curing (opaque, semi-opaque, transparent, ambré, etc...)
    - Volume ocupé par le produit dans le recipient (L/mL)
    - Modification des notes : 
        - Visuel & Technique
        - Odeurs
        - Goûts
        - Effets ressentis
 
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
        - Définition de la trame de la PipeLine (intervalles : secondes, minutes, heures)
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
        - Définition de la trame de la PipeLine (intervalles : seconde, minute, heures, jour, semaine, mois)
        - Durée de curing (trame choisie)
    - Type de maturation/curing (froid <5°C/ chaud >5°C)
    - Température de curing (°C)
    - Humidité relative dans recipient (%)
    - Type de recipient (aire libre, verre, plastique, etc... et autre)
    - Emballage/Ballotage primaire : (celophane, papier cuisson, aliminium, paper hash, sac à viade, congelation, sous vide(complète par machine, partiel manuellement), autre)
    - Opacité du recipient de curing (opaque, semi-opaque, transparent, ambré, etc...)
    - Volume ocupé par le produit dans le recipient (L/mL)
    - Modification des notes : 
        - Visuel & Technique
        - Odeurs
        - Goûts
        - Effets ressentis

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
