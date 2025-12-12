# CAHIER DES CHARGES — Reviews‑Maker (Version enrichie)

Résumé
- Objectif : documenter, clarifier et structurer les fonctionnalités de Reviews‑Maker (Terpologie) pour le design, le front, et le backend, en conservant l'intégralité du cahier des charges original (annexe intégrale en fin de fichier).
- Contraintes majeures : conformité (âge, producteurs), responsive, PWA, exports haute qualité, pipelines traçables, modularité (templates / mode producteur / influenceur).

Principes généraux
- Ne pas supprimer d'information de l'annexe original (tout est repris). Cette version réorganise, clarifie et ajoute schémas, précisions et données manquantes.
- Terminologie : "Pipeline" = suite chronologique d'étapes (unités temporelles configurables). "Review" = fiche structurée et exportable.

Table des matières
1. Apparence & UI
2. Comptes & Authentification
3. Vérifications légales
4. Types d'utilisateurs et données associées
5. Pipelines (concept, trames, UX)
6. Génétique (canva / arbre)
7. Produits : champs par type
8. PipeLine Curing & Maturation (détails)
9. Export Maker (templates, formats, UX)
10. Bibliothèque & Galerie
11. Statistiques & modération
12. Schémas ASCII (timeline, export flow, data model, génétique)
13. Annexes : contenu original (intégral)


**1. Apparence & UI**
- Mode clair/sombre automatique + override manuel.
- Design "Apple-like" : minimal, liquid-glass pour modals, boutons et panels.
- Thèmes prédéfinis : Violet Lean, Vert Émeraude, Bleu Tahiti, Sakura.
- Responsive (mobile/tablette/desktop), PWA, performance progressive.

Recommandations UI techniques :
- Charger `scripts/logger.js` en debug via `?debug=1`.
- V2 module-based components, utiliser `eventBus`/`stateManager`/`modalController` pour plug-in.


**2. Comptes & Authentification**
- Méthodes : email+mot de passe (pseudo obligatoire) + OAuth2 (Google/Facebook/Apple/Amazon/Discord).
- 2FA optionnel (TOTP via Authenticator apps, mail, etc.).
- Gestion des sessions actives (liste d'appareils, possibilité logout à distance).
- Réinitialisation via token (1h).
- Tokens staff/admin sont des fichiers dans `server/tokens/` (convention projet).

Sécurité & Privacy :
- Passwords hachés, champs sensibles chiffrés en stockage selon RGPD
- Logs d'accès et audit pour actions admin (export, suppression, modération).


**3. Vérifications légales**
- Vérif âge >18/21 selon pays (collecte DOB + disclaimer RDR).
- Option eKYC (upload pièce) pour producteurs/influenceurs.
- Conservation des preuves et documents en stockage restreint (`db/`), accès restreint par rôles.


**4. Types d'utilisateurs (résumé)**
- Producteurs (payant) : accès complet, exports pro, pipeline avancé.
- Influenceurs (payant) : exports avancés, partages, statistiques.
- Amateurs (gratuit) : accès standard, templates prédéfinis.

Chaque type : spécifications de données (voir détails par section) + consentements CGU.


**5. Pipelines — concept et UX**
- Trame configurable : seconde, minute, heure, jour, semaine, mois, phases prédéfinies.
- Modes d'usage : Journal (jours), Semaine (S1..Sn), Phase (prédefs 12 ph.)
- Chaque case/step contient : métadonnées (date, phase), mesures (temp, humidité, ppfd...), notes, images et champs custom.
- Export et visualisation timeline interactive (heatmap-like, badges).

UX patterns :
- Première case = configuration globale; autres cases editables.
- Possibilité d'ajouter étapes custom et champs par étape.
- Historique d'édition et versioning minimal (timestamps + auteur).


**6. Génétique — canva & arbre**
- Bibliothèque personnelle : cultivars, projets PhenoHunt.
- Canvas drag & drop, création relations parents/enfants, exportable (SVG/PNG) pour inclusion dans exports.


**7. Produits : champs par type**
- Voir sections détaillées reprises depuis l'original (Fleurs, Hash, Concentrés, Comestibles).
- Ajouts suggérés :
  - Standardiser unités (SI), normaliser échelles (1-10) et labels.
  - Référence aux certificats d'analyse (PDF) : stocker métadonnées et lien vers fichier.
  - Ajouter champs `labBatchId`, `coaFileId` pour traçabilité laboratoire.


**8. PipeLine Curing & Maturation**
- Paramètres : temp, RH, containerType, opacity, volume, duration, packaging.
- Monitoring : possibilités d'attacher capteurs (IoT) via API (optionnel), ou import CSV de logs.
- Exporter évolution (GIF / timelapse) pour producteurs.


**9. Export Maker (templates & UX)**
- Templates : Compact, Détaillé, Complète, Influenceur, Personnalisé (drag & drop).
- Formats : 1:1, 16:9, 9:16, A4, SVG.
- Options qualité : DPI, compression, filigrane, polices.
- Pagination : maximum 9 pages export pour 1:1/16:9.
- Exports disponibles selon rôle (haut débit pour Producteur/Influenceur).

Connecteurs : partage réseaux sociaux, envoi email, téléchargement direct.


**10. Bibliothèque & Galerie**
- Sauvegarde templates, reviews, filigranes, sets d'ingrédients, substrats, engrais, matériel.
- Partage template par code unique.
- Galerie publique : filtres (type, notes, popularité, récence), modération/flagging.


**11. Statistiques & modération**
- Indicateurs : nombre reviews, exports, engagement, top cultivars.
- Panel admin pour modération (review, suppression, bannissement), workflows d'alerte.


**12. Schémas ASCII**

A. Timeline (ex. 12 phases) — vue résumé (phases horizontales)

+--------------------------------------------------------------------------------+
| Timeline (Phases prédéfinies : 12)                                             |
+--------------------------------------------------------------------------------+
| [Graine] [Germination] [Plantule] [Croissance-Début] [Croissance-Milieu] [Croissance-Fin] |
| [Stretch-Début] [Stretch-Milieu] [Floraison-Début] [Floraison-Milieu] [Floraison-Fin] [Récolte] |
+--------------------------------------------------------------------------------+

Exemple d'une mini-vue "grille" (12 cases) :
[ 01 ][ 02 ][ 03 ][ 04 ][ 05 ][ 06 ][ 07 ][ 08 ][ 09 ][ 10 ][ 11 ][ 12 ]
Chaque case => clic => formulaire d'étape (mesures + notes + images)


B. Export Flow

+---------+    +-----------+    +------------+    +------------+
| Review  | -> | Template  | -> | Render     | -> | Delivery   |
| Builder |    | Selector  |    | (SVG/PNG)   |    | (DL/Share) |
+---------+    +-----------+    +------------+    +------------+

- Render steps: layout -> assets embed -> rasterize/pdf -> compress -> apply watermark


C. Génétique (arbre simplifié ASCII)

       [Parent A]
          /   \
  [Child 1]   [Child 2]
     |            |
  [Pheno A]    [Pheno B]

Canvas supports drag/drop, link creation, naming and pheno tagging.


D. Data Model (simplified ER ASCII)

[users]--<owns>--[reviews]--<has>--[pipelines]--<has>--[pipeline_steps]
   |                 |                     |
   |                 |                     +--[measurements]
   +--[tokens]       +--[exports]          +--[attachments]
                      +--[templates]

Key entities: users, reviews, pipelines, pipeline_steps, attachments (images, COAs), exports, templates.


**13. Annexes : contenu original (intégral)**
- L'intégralité du fichier original est jointe ci‑dessous pour garantir qu'aucune information n'a été supprimée.

--- DEBUT ANNEXE ORIGINELLE ---

```markdown
# Fonctionnalités de Terpologie : Reviews-Maker

### Outils de tracabilité produit cannabinique.

#### Apparence de l'application : 

Par defaut : Mode clair/sombre (système de détection automatique selon préférence OS avec option de forçage manuel dans les paramètres)
Interface claire, moderne et épurée, apple-like design. Intégration du liquid glass dans les modals, boutons, menus, etc...
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

### **A. Fleurs (Herbes/Buds)**n*** End Patch
