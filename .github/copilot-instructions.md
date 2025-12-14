## Purpose
Short, actionable guidance for AI coding agents working on Reviews-Maker: how the repo is organized, how to run and debug locally, key patterns and integration points to preserve when making changes.

## Quick architecture summary
- Frontend: `client/` — Vite + React (hooks, `zustand`, `react-router`, `i18next`). Exports built with `html-to-image`, `jspdf`, `jszip`. See `client/src/components/export/ExportMaker.jsx` for export logic.
- Backend: `server-new/` — Express + Passport + Prisma. API routes in `server-new/routes/`, session options in `server-new/session-options.js`, seed data `server-new/seed-templates.js`.
- Data & assets: `data/` (static lookup JSON like `aromas.json`, `effects.json`), `db/review_images/`, `db/kyc_documents/` for uploads, `public/` for static files.
- Deploy/scripts: top-level `deploy*.sh`, `ecosystem.config.cjs` (PM2), `nginx-terpologie.conf`, and `scripts/` for diagnostics and VPS helpers.

## How to run locally (most common tasks)
- Frontend: open a shell in `client/` and run `npm install` then `npm run dev` (Vite). Default port 5173.
- Backend: open a shell in `server-new/` and run `npm install` then `npm run check-env` then `npm run dev` (node --watch server.js). Set env vars from `.env` as required.
- Prisma: in `server-new/` run `npm run prisma:generate` and `npm run prisma:migrate` when schema changes. Use `npm run prisma:studio` to inspect DB.

Notes: There is no standard test suite in the repo — rely on manual validation and the browser preview tasks. Use `scripts/diagnostic-*` tools for environment checks.

## Important repo conventions & domain patterns
- Domain-first UI: most forms use selectors/structured inputs rather than free text (the PipeLine model). Preserve this constraint when changing forms.
- Export pipeline: `ExportMaker.jsx` uses `html-to-image` → `jspdf/jszip`. Avoid changing DOM structure that export code relies on.
- Data-driven lists live in `data/*.json` — add new options there (e.g., `aromas.json`) rather than hardcoding strings.
- OAuth and uploads: backend uses Passport strategies (`passport-*` libs) and `multer` for file uploads. Tokens, sessions, and KYC flows are centralized in `server-new/routes/` and `server-new/session-options.js`.

## Key files to inspect for common changes
- Frontend examples: `client/src/components/export/ExportMaker.jsx`, `client/src/components/legal/` (age/consent), `client/src/pages/ReviewForm*` (forms). Data: `data/*.json`.
- Backend examples: `server-new/routes/` (API shape), `server-new/server.js` (startup), `server-new/session-options.js`, `server-new/prisma/` (schema).
- Devops/deploy: `ecosystem.config.cjs`, `deploy-vps.sh`, `scripts/deploy*`, `nginx-terpologie.conf`.

## Debugging & common commands
- Check environment: `cd server-new && npm run check-env`.
- Start client: `cd client && npm run dev` and open `http://localhost:5173` (or use the provided VS Code task to open `index.html`).
- Start server: `cd server-new && npm run dev`, tail logs or use PM2 via `ecosystem.config.cjs` for production.
- Quick sanity checks: `scripts/diagnostics.sh` and `scripts/diagnostic-console.js` exist for environment validation.

## Safety & change guidance for agents
- Preserve existing API contracts in `server-new/routes/*`. If you add fields to JSON payloads, update both frontend forms (`client/src`) and backend validation/routes.
- When touching export or canvas code, verify end-to-end export (preview + final export file) manually — exports are fragile to DOM changes.
- Avoid changing lookups in `data/*.json` without also updating UI components that use them (autocomplete/select lists).

## PR & workflow notes (repo-specific)
- Always `git pull` before working and create a feature branch (`feat/...` or `fix/...`). Commit small atomic changes and open a PR for review.
- For deployments to the VPS use `deploy-vps.sh` / `deploy.sh` or PM2 (`ecosystem.config.cjs`). SSH alias `vps-lafoncedalle` is used in project docs for server access.

## If something is missing
- Ask for the specific area (frontend export, pipeline model, OAuth, or DB schema) and which environment (local/dev/vps) you want to validate. Include the failing route or component path for faster iteration.

---
Please review this draft and tell me which areas need more detail (examples, commands, or file links) so I can iterate.

## Project domain notes (synthèse depuis `.docs/CLAUDE.md`)
These are repository-specific product rules and UI constraints—follow them when changing UX, data models, or exports.

- Minimal free-text: most inputs are controlled selectors, multi-selects and structured fields (PipeLine model). Avoid replacing selectors with free text.
- PipeLines: time-series entry model supporting intervals (seconds, minutes, hours, days, weeks, months, phases). UI modes: "jours", "semaines", "phases" — each maps to a different granularity and storage shape; keep pipeline UI and export expectations intact (see `client/src/pages/ReviewForm*`).
- Exports & templates: predefined templates (Compact, Détaillé, Complète, Influenceur, Personnalisé). Export flow relies on DOM structure in `client/src/components/export/ExportMaker.jsx` and static lookup files in `data/` — changing DOM or data keys will break exports.
- Account tiers: three role behaviors are enforced in UI and export permissions — `Amateur`, `Producteur` (paid), `Influenceur` (paid). Check frontend guards and backend routes for permission checks when adding features.
- Legal / KYC: age verification and optional KYC uploads are implemented in `client/src/components/legal/` and server handling under `server-new/routes/` (see `legal.js`); do not remove or rename these routes without updating related front-end calls.
- Data sources: long lists (aromas, terpenes, effects, tastes) live in `data/*.json`. Add new options there and update any front-end selects that consume them.
- Pipeline export expectations: curing/maturation pipeline stores repeated measurements (temp, humidity, container, packaging). When adding fields, ensure export templates and CSV/JSON serializers include mappings.

Files to consult for domain rules:
- `client/src/components/export/ExportMaker.jsx`
- `client/src/components/legal/` and `server-new/routes/legal.js`
- `data/*.json` (aromas.json, effects.json, tastes.json, terpenes.json)

Follow-up: tell me which domain area you want fully expanded (API examples, Prisma model excerpts, or export test checklist) and I'll add them.

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
