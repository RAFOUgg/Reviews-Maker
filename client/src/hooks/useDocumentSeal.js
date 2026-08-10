import { useEffect, useState } from 'react';
import { computeContentHash } from '../utils/exportSnapshot';

/**
 * Sceau du document : date d'émission + empreinte du contenu.
 *
 * POURQUOI. Une fiche exportée affiche aujourd'hui un identifiant de lot et rien d'autre — elle ne
 * dit ni QUAND elle a été émise, ni SUR QUELLES DONNÉES. Deux PNG du même lot, produits à trois mois
 * d'écart après correction d'une valeur de labo, sont alors strictement indiscernables. C'est ce qui
 * sépare une fiche technique d'un document opposable : sans date ni empreinte, rien n'est
 * archivable, et personne ne peut établir laquelle de deux versions fait foi.
 *
 * CE QUE CE N'EST PAS. Ni une signature électronique, ni un horodatage qualifié : l'empreinte est
 * calculée côté client et n'est certifiée par personne. Elle permet de DÉTECTER une divergence
 * (recalculer le hash de la review actuelle et le comparer à celui imprimé), pas de PROUVER une
 * antériorité opposable à un tiers. Le libellé du pied de page doit rester à la hauteur de cette
 * limite — cf. `export-maker-refonte/D1-plan-refonte-produit.md` §2.2.
 *
 * GS1 Digital Link, lui, reste hors de portée sans démarche commerciale : il exige un GTIN sous
 * licence GS1 (250 à 10 500 $ pour un préfixe entreprise, ou 30 $ par GTIN unitaire), licencié par
 * CHAQUE producteur — Terpologie ne peut pas en émettre à leur place.
 *
 * Le calcul est asynchrone (`crypto.subtle.digest`) mais quasi instantané sur un objet de cette
 * taille ; le sceau se rend donc sans son empreinte pendant un tick, jamais dans un fichier capturé.
 */
export function useDocumentSeal(reviewData) {
    const [hash, setHash] = useState(null);

    useEffect(() => {
        if (!reviewData) { setHash(null); return undefined; }
        let cancelled = false;
        computeContentHash(reviewData)
            .then((h) => { if (!cancelled) setHash(h); })
            .catch(() => { if (!cancelled) setHash(null); });
        return () => { cancelled = true; };
    }, [reviewData]);

    return {
        // 12 caractères : assez pour distinguer deux versions d'une même fiche à l'œil, assez court
        // pour être recopié. L'empreinte complète reste calculable depuis les données.
        shortHash: hash ? hash.slice(0, 12).toUpperCase() : null,
        hash,
    };
}

/**
 * Date d'émission, au format court et non ambigu (AAAA-MM-JJ).
 *
 * ISO plutôt que localisé : un document qui circule entre pays ne peut pas se permettre
 * l'ambiguïté 03/04 (3 avril ou 4 mars selon le lecteur).
 */
export function formatIssuedAt(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
