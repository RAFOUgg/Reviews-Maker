# Mission: Audit et Refonte du Système de Rendu des Reviews ("Orchard Studio")

## 1. Contexte

Le système actuel de gestion des reviews présente une fragmentation et des incohérences majeures entre la prévisualisation, l'affichage final et les fonctionnalités d'exportation prévues. L'objectif de cette mission est d'auditer l'existant, de concevoir une solution unifiée et de l'implémenter.

- **La Vision :** Le fichier `orchard-preview.html` décrit un système de rendu sophistiqué nommé "Orchard Studio", permettant la prévisualisation live, l'utilisation de templates, la personnalisation avancée et l'export multi-format (PNG, PDF, etc.).
- **La Réalité :**
    - **Prévisualisation :** Seule la page de création (`CreateReviewPage.jsx`) utilise un composant de prévisualisation (`OrchardPanel`), qui est une implémentation isolée.
    - **Affichage Final :** La page de détail (`ReviewDetailPage.jsx`) ignore complètement le système "Orchard" et affiche les données brutes via un rendu Tailwind CSS basique. Il y a donc une déconnexion totale entre ce que l'utilisateur voit en prévisualisation et le résultat final.
    - **Export :** La fonctionnalité d'export est inexistante côté backend (`server-new/routes/reviews.js`). L'API ne fait que servir du JSON.

## 2. Objectifs

1.  **Analyser et Documenter :** Cartographier précisément le flux de données actuel pour la création, la prévisualisation et l'affichage des reviews.
2.  **Auditer les Écarts :** Lister toutes les incohérences visuelles et fonctionnelles entre `OrchardPanel` et `ReviewDetailPage.jsx`.
3.  **Concevoir une Architecture Unifiée :** Proposer une stratégie pour que la prévisualisation, l'affichage final et l'exportation utilisent un **moteur de rendu unique et centralisé**.
4.  **Implémenter la Solution :**
    - Créer un composant de rendu React réutilisable (`ReviewRenderer`) qui accepte les données d'une review et un nom de template en props.
    - Intégrer ce `ReviewRenderer` dans `OrchardPanel` (pour la prévisualisation) et dans `ReviewDetailPage.jsx` (pour l'affichage final), garantissant une cohérence parfaite.
    - Développer une nouvelle route API sur le backend (`/api/reviews/:id/export`) capable de générer des rendus côté serveur.
5.  **Activer l'Exportation :** Implémenter la logique d'exportation, en commençant par le format PNG. Utiliser une bibliothèque comme `puppeteer` ou `html-to-image` pour "capturer" le rendu du composant React et le convertir en image.

## 3. Plan d'Action Détaillé

### Phase 1 : Analyse et Nettoyage (Frontend)

1.  **Isoler le Moteur de Rendu :**
    - Créez un nouveau composant `client/src/components/review/ReviewRenderer.jsx`.
    - Extrayez la logique de rendu actuellement dans `ReviewDetailPage.jsx` et placez-la dans `ReviewRenderer`. Ce composant prendra `review` (un objet JSON) comme prop.
    - Faites de même avec la logique de rendu de `OrchardPanel`. L'objectif est d'avoir un seul composant capable de générer le HTML final d'une review.
2.  **Unifier l'Affichage :**
    - Modifiez `ReviewDetailPage.jsx` pour qu'il utilise uniquement `<ReviewRenderer review={reviewData} />`.
    - Modifiez `OrchardPanel.jsx` pour qu'il utilise également `<ReviewRenderer review={previewData} />`.
    - Assurez-vous que le style est cohérent. Le `ReviewRenderer` doit être stylé pour correspondre à la vision de `orchard-preview.html`.

### Phase 2 : Développement du Service d'Export (Backend)

1.  **Ajouter la Dépendance :**
    - Dans `server-new/`, installez une bibliothèque pour le rendu HTML-vers-image. `puppeteer` est un bon choix pour sa robustesse.
    - `npm install puppeteer`
2.  **Créer la Route d'Export :**
    - Dans `server-new/routes/reviews.js`, ajoutez une nouvelle route `GET /api/reviews/:id/export`.
    - Cette route prendra un paramètre query `format` (ex: `?format=png`).
3.  **Implémenter la Logique d'Export :**
    - Dans le handler de la nouvelle route :
        a. Récupérez les données de la review depuis la base de données.
        b. **Générez le HTML :** Créez une fonction qui prend les données de la review et génère une chaîne de caractères HTML complète. Cette structure HTML et le CSS associé doivent être **identiques** à ceux produits par le composant React `ReviewRenderer`. Vous pouvez utiliser un moteur de template simple comme EJS ou simplement des template literals pour injecter les données de la review dans un squelette HTML/CSS.
        c. **Lancez Puppeteer :**
            - Lancez un navigateur headless.
            - Créez une nouvelle page.
            - Utilisez `page.setContent(htmlString)` pour charger votre HTML.
            - Utilisez `page.screenshot({ type: 'png', ... })` pour générer l'image.
        d. **Retournez l'Image :**
            - Envoyez l'image générée dans la réponse HTTP avec le `Content-Type` approprié (`image/png`).

### Phase 3 : Intégration Finale (Frontend)

1.  **Ajouter un Bouton d'Export :**
    - Sur la page `ReviewDetailPage.jsx`, ajoutez un bouton "Exporter en PNG".
2.  **Lier le Bouton à l'API :**
    - Au clic sur le bouton, le frontend doit déclencher le téléchargement de l'image en créant un lien vers `/api/reviews/{review.id}/export?format=png` et en le "cliquant" programmatiquement.

## 4. Critères de Succès

- Le rendu d'une review est **visuellement identique** sur la page de création (preview), la page de détail (affichage final).
- Un utilisateur peut cliquer sur un bouton "Exporter" sur la page de détail d'une review et télécharger une image PNG de cette review.
- Le code est propre, modulaire et le `ReviewRenderer` est le seul responsable de l'apparence d'une review.
