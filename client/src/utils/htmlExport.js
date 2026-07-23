/**
 * htmlExport — Sérialise un nœud de rendu (le canvas TemplateRenderer) en un document HTML
 * AUTONOME : styles calculés inlinés sur chaque élément + images converties en data URI.
 * Le fichier s'ouvre hors-ligne, s'envoie par mail, et reproduit fidèlement le rendu de la
 * galerie publique (même arbre DOM que TemplateRenderer). C'est le même rendu que la galerie —
 * pas une capture image, du vrai HTML.
 */

// Propriétés calculées qu'on recopie en inline (sous-ensemble suffisant au rendu fidèle,
// évite de sérialiser les ~350 propriétés de getComputedStyle par élément).
const COPIED_PROPS = [
    'display', 'position', 'top', 'left', 'right', 'bottom', 'z-index', 'float', 'clear',
    'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height', 'box-sizing',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border', 'border-width', 'border-style', 'border-color', 'border-radius',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    'background', 'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat',
    'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
    'letter-spacing', 'text-align', 'text-transform', 'text-decoration', 'white-space', 'word-break',
    'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
    'align-items', 'align-content', 'justify-content', 'justify-items', 'gap', 'row-gap', 'column-gap',
    'grid-template-columns', 'grid-template-rows', 'grid-column', 'grid-row', 'grid-auto-flow',
    'opacity', 'overflow', 'overflow-x', 'overflow-y', 'object-fit', 'object-position',
    'box-shadow', 'text-shadow', 'transform', 'transform-origin', 'filter', 'backdrop-filter',
    'isolation', 'mix-blend-mode', 'aspect-ratio', 'vertical-align',
];

async function urlToDataUri(url) {
    try {
        const res = await fetch(url, { mode: 'cors' });
        const blob = await res.blob();
        return await new Promise((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result);
            r.onerror = () => resolve(null);
            r.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

function copyComputedStyle(src, dst) {
    const cs = window.getComputedStyle(src);
    let inline = '';
    for (const prop of COPIED_PROPS) {
        const val = cs.getPropertyValue(prop);
        if (val && val !== 'auto' && val !== 'normal' && val !== 'none' || prop === 'display') {
            // On garde 'none'/'auto' seulement si signifiants — display toujours conservé
            if (val) inline += `${prop}:${val};`;
        }
    }
    dst.setAttribute('style', inline);
}

async function inlineTree(srcRoot, dstRoot) {
    const srcNodes = [srcRoot, ...srcRoot.querySelectorAll('*')];
    const dstNodes = [dstRoot, ...dstRoot.querySelectorAll('*')];
    const imgTasks = [];
    for (let i = 0; i < srcNodes.length; i++) {
        const s = srcNodes[i];
        const d = dstNodes[i];
        if (!s || !d || s.nodeType !== 1) continue;
        copyComputedStyle(s, d);
        d.removeAttribute('class');
        if (d.tagName === 'IMG' && d.getAttribute('src') && !d.getAttribute('src').startsWith('data:')) {
            imgTasks.push(urlToDataUri(s.currentSrc || s.src).then((uri) => { if (uri) d.setAttribute('src', uri); else d.remove(); }));
        }
        // Neutraliser les transform de scale (le canvas d'aperçu est scalé pour l'écran)
    }
    await Promise.all(imgTasks);
}

/**
 * Construit le document HTML autonome à partir d'un nœud de rendu.
 * @param {HTMLElement} node - le canvas #orchard-template-canvas (ou conteneur d'aperçu)
 * @param {Object} opts - { title, width, height, background }
 * @returns {Promise<string>} document HTML complet
 */
export async function serializeRenderToHtml(node, opts = {}) {
    const width = opts.width || node.getAttribute('data-width') || node.offsetWidth;
    const height = opts.height || node.getAttribute('data-height') || node.offsetHeight;
    const title = (opts.title || 'Fiche Reviews-Maker').replace(/</g, '&lt;');

    const clone = node.cloneNode(true);
    await inlineTree(node, clone);
    // Le clone porte le style du canvas ; on annule tout transform hérité de l'aperçu scalé
    clone.style.transform = 'none';
    clone.style.margin = '0';
    // Le canvas d'aperçu a une hauteur fixe + overflow:hidden (ratio 16:9/A4) qui TRONQUE une
    // fiche détaillée longue. Dans un document HTML autonome (scrollable), on laisse tout couler :
    // hauteur auto + overflow visible sur le canvas racine ET son enfant direct (le template, en
    // height:100%). On NE touche PAS les descendants profonds — leurs height:100% servent au layout
    // en colonnes et les casser provoque des chevauchements.
    // NB : on reproduit fidèlement le canvas (taille du ratio choisi). Les templates de type
    // « carte » sont dimensionnés au ratio (overflow caché) ; pour une fiche longue et complète,
    // choisir le ratio A4 avant l'export. On ne force PAS le débordement ici : neutraliser les
    // hauteurs internes casse le layout en colonnes du template détaillé.

    const inner = clone.outerHTML;
    return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  html,body { margin:0; padding:0; }
  body { display:flex; justify-content:center; align-items:flex-start; background:#0b0b14; padding:24px; min-height:100vh; }
  .rm-frame { width:${width}px; max-width:100%; box-shadow:0 10px 40px rgba(0,0,0,.4); border-radius:16px; overflow:hidden; }
  @media (max-width:${width}px){ .rm-frame{ transform-origin: top center; } }
</style>
</head>
<body>
<div class="rm-frame">${inner}</div>
</body>
</html>`;
}

export function downloadHtml(html, filename = 'fiche.html') {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default serializeRenderToHtml;
