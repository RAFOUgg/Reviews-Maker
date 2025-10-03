# Reviews Maker

Studio web ergonomique pour composer, visualiser et exporter des fiches de review produits cannabiniques avec un rendu premium prêt à partager.

## ✨ Points clés

- Assistant de création guidé par type de produit (Hash, Fleur, Concentré, Comestible).
- Interface en 2 étapes : choix du type puis formulaire détaillé.
- Mise en page responsive optimisée desktop avec masquage automatique de l'assistant.
- Indentation uniforme: une ligne par champ (fields-stack) pour une lecture fluide.
- Menus à sélection multiple unifiés pour tous les champs à choix prédéfinis (chips, menu déroulant cliquable).
- Pipelines (séquences ordonnées) avec ajout par menu déroulant cliquable, réordonnables, suppression rapide.
- Système de pipeline de séparation/extraction avec étapes ordonnées.
- Sauvegarde automatique en temps réel des brouillons lors de modifications.
- Distinction claire entre brouillons (auto-sauvegardés) et reviews terminées.
- Système de score global avec affichage visuel des performances.
- Rendu optimisé avec badges de type de produit et barres de progression.
- Calcul automatique des totaux et suivi de progression dynamique.
- Aperçu en temps réel de la fiche de review stylisée.
- Export instantané en PNG haute définition.
- Boutons harmonisés (primaire/secondaire/ghost/danger) et champ fichier stylé.
- Barres de défilement (scrollbars) stylisées et cohérentes.
- Invite de nom intelligent lors de l'enregistrement (prérempli selon le type et les champs clés).
- Raccourcis clavier dédiés (Ctrl/⌘ + ↑/↓, Ctrl/⌘ + Entrée) pour accélérer la saisie sur PC.

## 🚀 Prise en main

1. Ouvrez `index.html` dans votre navigateur.
    Le bouton de la bibliothèque de reviews sauvegardées/brouillons s'affiche en haut à droite.
    Les dernières reviews enregistrées et brouillons sont visible en galerie sous l'assistant de création.

2. **Étape 1** : `index.html` Sélectionnez le type de produit (Hash, Fleur, Concentré, Comestible).

3. **Étape 2** : `review.html` s'ouvre avec les blocs adaptés au type choisi.
    - Formulaire dynamique avec sections et champs adaptés. + barre de progression de la review.
    - Aperçu en temps réel de la fiche de review stylisée avec bascule compact/complète et modal d'aperçu.

4. Renseignez les informations dans le formulaire (sauvegarde automatique en temps réel).

5. Cliquez sur **Enregistrer** pour marquer votre review comme terminée et complète.

6. Utilisez le bouton **Exporter en image** pour récupérer votre livrable final.

7. Le logo/branding en haut à gauche renvoie vers `index.html`.
(Si des infos étaient renseignées sans que la review soit enregistrée, elles seront sauvegardées comme brouillon).

8. Depuis `index.html` il est possible de visualiser la bibliothèque complète des reviews et brouillons, de les éditer ou supprimer. Lors de l'édition, il ne faut modifier et sauvegarder que les champs nécessaires.
> **Astuce** : Les reviews en cours d'édition sont automatiquement sauvegardées comme brouillons. Utilisez le bouton *Bibliothèque* pour consulter vos reviews et brouillons. (Ou depuis l'aperçu compact sous l'assistant de création).
> **Raccourcis** : `Ctrl/⌘ + ↑/↓` change la section active, `Ctrl/⌘ + Entrée` déclenche la génération.

## Technique de filtrations nécessitant une indication particulière
    Tamisage WPFF (Whole Plant Fresh Frozen) -> maillage du/des tamis utilisé(s)
    Tamisage à l'eau glacée (Bubble Hash) -> maillage du/des tamis utilisé(s)
    Tamisage à la glace carbonique (Ice Hash) -> maillage du/des tamis utilisé(s)
    Tamisage à sec (Dry) -> maillage du/des tamis utilisé(s)
    Tamisage à sec congelé (Ice Dry) -> maillage du/des tamis utilisé(s)
    Pressage à chaud (Rosin) -> maillage du/des tamis utilisé(s) + température de pressage
    C02 supercritique -> pression et température

## 📋 Types de produits et informations collectées

### 🔷 Hash
*Produit résineux obtenu par séparation physique des glandes résineuses (trichomes) du cannabis, sans solvant par définition.*
**Informations générales :**
- Cultivars (variété)
    - Breeders de la graine
Possibilité de choisir une weed déjà reviewée dans la base de données comme matière première.
- Type de matière végétale utilisée (fleurs fraîches/sèches, trim, kief)
- Farm
- Hash Maker
- Photo du produit
- Methode de séparation, pouvant être une pipeline de séparation (séquence ordonnée) : WPFF, Bubble Hash, Ice'O Lator, tamisage à sec, séparation électrostatique, etc.
- Possible taille de trichome par rapport au maillage du/des tamis utilisé(s) : XXµm -> XXµm , par defaut : 0-Xµm où X est a completer par l'utilisateur.
**Post-traitement & purification :**
- Séparations chromatographiques
- Techniques de fractionnement
- Séparations physiques
- Purifications avancées
**Visuel & Technique (notes /10) :**
- Maturation initiale/finale
- Durée et température de maturation
- Densité (/10),
- Qualité des trichomes (/10)
- Melting (/10)
- Pureté (/10)
**Odeur :**
- Intensité (/10)
- Notes dominantes et secondaires (description)
**Texture (notes /10) :**
- Dureté (/10)
- Densité (/10) 
- Friabilité (/10) 
- Collant (/10)
**Gouts & Expérience fumée :**
- Notes (dry puff/tirage à sec/froid) (description)
- Notes 1er inhalation (description)
- Notes expiration (description)
- Intensité (/10)
- agressivité (/10) (0=pas assez; 10=Trop)
- Cendre (/10)
**Effet :**
- Montée (rapidité, /10)
- Intensité (/10)
- Type d'effet (description)
- Durée : choix entre (<15min ; <30min ; <1h ; <2h ; 2h+)

### 🌸 Fleur
*Inflorescences de cannabis séchées et affinées.*
**Informations générales :**
- Cultivars (description)
    Breeder (description)
- farm (description)
- type de culture (choix multiple)
- Spectre lumineux  (choix multiple)
- Photo du produits
**Plan cultural :**
- Substrats & systèmes culturaux
- Engrais organiques/minéraux
- Additifs & stimulants
**Visuel (notes /10) :**
- Densité, 
- Trichomes, 
- Pistils, 
- Manucure, 
**Odeur :**
- Intensité (/10)
- Notes dominantes/secondaires
**Texture (notes /10) :**
- Dureté, densité, élasticité, collant
**Gouts & Expérience fumée :**
- Notes (dry puff/tirage à sec/froid) (description)
- Notes 1er inhalation (description)
- Notes expiration (description)
- Intensité (/10)
- agressivité (/10) (0=pas assez; 10=Trop)
- Cendre (/10)
**Effet :**
- Montée (rapidité, /10)
- Intensité (/10)
- Type d'effet (description)
- Durée : choix entre (<15min ; <30min ; <1h ; <2h ; 2h+)

### 💎 Concentré
*Extraits concentrés en cannabinoïdes et terpènes.*
**Informations générales :**
- Strain, farm/producteur
- Type d'extraction principal
- Solvant utilisé
- Méthode de purge
- Photo
**Procédés d'extraction :**
- Méthodes avec/sans solvants - Pipeline extraction/séparation (séquence ordonnée)
**Purification & séparation :**
- Séparations chromatographiques
- Fractionnement, séparations physiques
- Purifications avancées
- Possible taille de trichome par rapport au maillage du/des tamis utilisé(s) : XXµm -> XXµm , par defaut : 0-Xµm où X est a completer par l'utilisateur.
**Visuel & Technique (notes /10) :**
- Couleur (description),
- Viscosité /10,
- Transparence /10,
- Pureté visuelle /10,
- Melting, résidus /10,
**Odeur :**
- Intensité (/10)
- Notes dominantes/secondaires
**Gouts & expériences fumée :**
- Notes (dry puff/tirage à sec/froid) (description)
- Notes 1er inhalation (description)
- Notes expiration (description)
- Intensité (/10)
- agressivité (/10) (0=pas assez; 10=Trop)
- Cendre (/10)
**Effet :**
- Montée (rapidité, /10)
- Intensité (/10)
- Type d'effet (description)
- Durée : choix entre (<15min ; <30min ; <1h ; <2h ; 2h+)

### 🍬 Comestible
**Informations Générales :**
- Nom du produit
- Marque / Producteur / Cuisinier
- Type de produit (Pâtisserie, Confiserie, Boisson, Capsule, Huile, …)
- Photo du produit
- Ingrédients principaux (hors cannabis)
- Informations diététiques (choix multiple : Vegan, Sans gluten, Sans sucre, …)
**Informations sur l'infusion :**
- Matière première du cannabis utilisée
- Cultivars (variété)
- Type d'extrait utilisé pour l'infusion (choix multiple : Distillat, Rosin, RSO/FECO, Beurre de Marrakech, Huile infusée, Isolat…)
- Profil cannabinoïde annoncé (par portion / total) : THC (mg), CBD (mg), autres cannabinoïdes (mg)
- Profil terpénique (si connu)
**Expérience gustative & sensorielle :**
- Description générale
- Apparence (/10)
- Intensité Odeur (/10)
- Goût (/10)
- Notes dominantes / Notes de cannabis / Équilibre des saveurs
- Texture (/10)
- Qualité globale du produit alimentaire (/10)
**Effets & expérience psychotrope :**
- Dosage pris (ex: 1/2 gummy, 1 carré de chocolat, 10 mg)
- Temps de montée (<30min, 30-60min, 60-90min, 90min+)
- Intensité maximale (/10)
- Plateau (<1h, 1-2h, 2-4h, 4h+)
- Type d'effet (description)


## 🧱 Structure du projet

```
Reviews-Maker/
├── app.js         # Logique métier et interactions dynamiques
├── review.html    # Layout principal et structure de la page
├── styles.css     # Thème graphique et responsive design
└── README.md      # Ce guide
```

## 🔧 Personnalisation

- Ajoutez ou ajustez des sections/critères dans `app.js` via l'objet `productStructures`.
- Affinez la palette ou les effets visuels dans `styles.css` (variables CSS en tête de fichier).
- Pour des intégrations externes (base de données, API), greffez-vous sur la fonction `saveReview()`.
- Pour modifier le comportement de l'aperçu (modal/colonne), voyez `setupEditorPageEvents()` et `togglePreviewMode()`.
- Les pipelines utilisent un composant "dropdown-adder" réutilisant le style du multi-select.

## 📋 Prérequis & compatibilité

- Aucune dépendance serveur ou build : un simple navigateur moderne suffit.
- `html2canvas` est chargé via CDN pour l'export d'images.
- Pour exécuter des vérifications syntaxiques JS en local, installez Node.js (`node --check app.js`).

Bonnes reviews ! 🌿


TODOLIST :
- [ ] Faire en sorte que le bouton Réinitialiser demande confirmation si des données ont été saisies. Puis qu'il remette à zero tout les zone de séléction (y compris les pipelines) etc...
- [ ] Afficher/Masquer l'aperçu en modal depuis le bouton d'entête.
- [ ] Activer le bouton Astuce (popover/modal)
- [ ] Ouvrir la bibliothèque depuis review.html (comme sur l'accueil)
- [ ] Dans le contenu détaillé, "Informations du produit" inclut le type sélectionné (Hash, Fleur, Concentré, Comestible)