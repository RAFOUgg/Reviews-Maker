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

## 1. Règle simple : HTML obligatoire si PipeLine

- Si le rendu choisi ne contient **aucune** PipeLine → export possible en PNG/JPEG/SVG/PDF statique.  
- Si le rendu inclut **au moins une** PipeLine (culture, curing, séparation…) :  
  - soit :
    - export **HTML interactif** (review interactive producteur),  
  - soit :
    - combo : **image sociale** (PNG 1:1 ou 9:16) + **fichier HTML** lié.  
- Dans l’UI Export Maker :  
  - message clair du type : *“Les templates avec PipeLine sont exportés en HTML interactif (recommandé) + image de couverture optionnelle.”*

***

## 2. HTML interactif = review producteur

L’export HTML contient :

- Les mêmes sections que le template (infos, notes, photos).  
- Une ou plusieurs timelines interactives :  
  - scroll horizontal / vertical  
  - hover / clic sur chaque case pour ouvrir la modale d’étape (exactement les mêmes champs que dans l’éditeur, mais en lecture seule).  
- Les policies de sélection d’étapes (5 steps, full timeline, etc.) deviennent juste :  
  - *“décider quelles étapes sont visibles dans le layout initial”*  
  - mais l’utilisateur peut naviguer sur toute la timeline si on le souhaite.

Cela te donne une **review producteur interactive** sans limitation de longueur de pipeline.[2][3][1]

***

## 3. GIF pour la timeline de curing

Pour le **curing**, tu peux ajouter un mode export GIF (ou MP4 court) spécial :

- Sélectionne une PipeLine de type “Curing/Maturation”.  
- Génère une animation où :  
  - l’axe X/Y de la carte reste fixe (photo, nom, notes globales)  
  - seul ce qui change à chaque “frame” :
    - les notes /10 (Visuel, Odeurs, Goûts, Effets)  
    - éventuellement une mini timeline qui avance.  
- Options :
  - nombre d’étapes (ex. début / milieu / fin + éventuellement quelques points intermédiaires)  
  - vitesse (durée total du GIF)  
  - boucle on/off.

Ce GIF devient parfait pour :  
- stories / reels (9:16)  
- preview dynamique dans la galerie.[4][5]

***

## 4. Galerie publique : entrer dans les PipeLines

Fonctionnement possible :

- La **vignette** de la review :  
  - reprend l’export PNG “par défaut” du template  
  - montre déjà un mini indicateur de timeline (ex. badges “Culture + Curing”).  
- Au clic sur la vignette :  
  - ouverture d’une page “review” :  
    - en haut : image de couverture + infos principales  
    - en dessous : sections (notes, arbre génétique, etc.)  
    - bloc “PipeLines” :  
      - chaque PipeLine affichée comme timeline stylée (avec les cases & emojis).  
- Clic sur une case de PipeLine :  
  - ouvre une **modale de détails d’étape** avec toutes les infos (température, engrais, paramètres d’extraction, notes, etc.)  
  - design identique à la modale d’édition, mais en lecture seule.  

Tu peux proposer en plus un bouton “**Ouvrir en version producteur (HTML)**” :  
- qui charge l’export HTML complet (vue 3D) dans un nouvel onglet / iframe.

***

## 5. Résumé des règles techniques

- Pipeline dans le rendu →  
  - **HTML interactif obligatoire** (review producteur),  
  - PNG/JPEG/SVG/PDF optionnels uniquement comme **covers** ou variantes “flattened” très simplifiées.  
- Curing PipeLine →  
  - mode export spécial **GIF/MP4** de l’évolution des notes /10.  
- Galerie publique →  
  - covers = exports statiques  
  - navigation = step/case cliquable + modale détail  
  - lien “version interactive” = export HTML.  

# UTILISATION DES APERÇUS D'EXPORTS : 

L'aperçus est crée par l'utilisateur, il peux le sauvegarder dans sa bibliothèque pour réutilisation rapide dans d'autre review.
Il est possible de partager une templates crée avec d'autre utilisateur via un système de code unique (lien de partage directe aussi).
L'aperçus définit est celui qui sera utilisé par défaut lors de l'export de la review.
L'aperus définit est celui qui sera visible par tous si la review est publique dans la galerie publique.
Pas besoins d'aperçus pour des reviews privées.