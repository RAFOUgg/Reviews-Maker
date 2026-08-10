/**
 * Placement d'une page de rendu dans une page PDF.
 *
 * Extrait d'`ExportModal.jsx` pour être VÉRIFIABLE : le pipeline PDF complet (capture html-to-image
 * de deux pages A4 en pixelRatio 2, puis assemblage jsPDF) n'est exercé par aucun outil, et je n'ai
 * pas réussi à le piloter de bout en bout. Le calcul, lui, est une fonction pure — donc testable
 * pour de vrai, ce qui vaut mieux qu'une conviction sur du code non couvert.
 *
 * RÈGLE. Quand le rendu a DÉJÀ le format de la page (cas normal : une fiche A4 exportée en PDF A4),
 * il occupe la page entière. La marge de 20 mm appliquée jusqu'ici s'ajoutait aux marges internes du
 * document, qui en a déjà : la fiche sortait réduite d'environ 10 % et flottait dans un blanc
 * tournant double. Sur un document destiné à être imprimé et classé, c'est de la surface utile
 * perdue, pas un raffinement.
 *
 * La marge garde tout son sens dans l'autre cas — une carte 16:9 posée sur une feuille A4 — où
 * centrer avec du blanc autour est le comportement attendu.
 */

/** Tolérance de correspondance des formats : 1 % absorbe l'arrondi au pixel de la capture. */
export const PDF_RATIO_TOLERANCE = 0.01;

/** Marge (mm) appliquée quand le rendu n'a PAS le format de la page. */
export const PDF_MARGIN_MM = 20;

/**
 * @param {number} imgW largeur du rendu capturé (px)
 * @param {number} imgH hauteur du rendu capturé (px)
 * @param {number} pageW largeur de la page PDF (mm)
 * @param {number} pageH hauteur de la page PDF (mm)
 * @returns {{x:number, y:number, width:number, height:number, fullBleed:boolean}}
 */
export function fitImageToPdfPage(imgW, imgH, pageW, pageH) {
    const imgRatio = imgW / imgH;
    const pdfRatio = pageW / pageH;
    let width;
    let height;
    let fullBleed = false;

    if (Math.abs(imgRatio - pdfRatio) / pdfRatio < PDF_RATIO_TOLERANCE) {
        width = pageW;
        height = pageH;
        fullBleed = true;
    } else if (imgRatio > pdfRatio) {
        width = pageW - PDF_MARGIN_MM;
        height = width / imgRatio;
    } else {
        height = pageH - PDF_MARGIN_MM;
        width = height * imgRatio;
    }

    return { x: (pageW - width) / 2, y: (pageH - height) / 2, width, height, fullBleed };
}
