/*
 * Auditeur de rendu Export Maker — critères mesurables du plan C5 (§5.1).
 *
 * CONTRAINTE DE CONCEPTION : ce fichier doit tourner tel quel dans un navigateur SANS build ni
 * import. Il est injecté par Playwright (`addScriptTag({ path })`) sur la page réelle, et importé
 * par les tests unitaires pour vérifier les helpers purs. Une seule implémentation, deux usages —
 * pas de duplication entre l'outil et ses tests.
 *
 * Il ne juge que ce qui se MESURE. Le jugement visuel (grammaire, style) reste humain, et
 * n'intervient qu'après passage de ces règles (cf. C5 §5).
 */
(function (root) {
    'use strict';

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers purs (testables isolément)
    // ─────────────────────────────────────────────────────────────────────────

    /** Parse toute couleur CSS calculée (`rgb()`/`rgba()`) en {r,g,b,a}. */
    function parseColor(css) {
        if (!css) return null;
        const s = String(css).trim();
        if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
        const m = s.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const parts = m[1].split(/[,/]/).map((p) => parseFloat(p.trim()));
        if (parts.length < 3 || parts.some((p) => Number.isNaN(p))) return null;
        return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }

    /** Luminance relative WCAG. */
    function luminance({ r, g, b }) {
        const f = (v) => {
            const c = v / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    }

    /** Le texte n'est-il fait que d'emoji/pictogrammes (et d'espaces) ? */
    function isEmojiOnly(text) {
        const s = String(text).replace(/\s|‍|️/g, '');
        if (!s) return false;
        return !/[^\p{Extended_Pictographic}\p{Emoji_Component}]/u.test(s);
    }

    /** Rend une couleur analysée en `rgb()` — sérialisable et directement comparable au CSS source. */
    function fmtColor(c) {
        if (!c) return null;
        return `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
    }

    /** Ratio de contraste WCAG entre deux couleurs OPAQUES. */
    function contrastRatio(fg, bg) {
        const l1 = luminance(fg);
        const l2 = luminance(bg);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    }

    /** Composite `over` (avec alpha) au-dessus de `under` (opaque). */
    function composite(over, under) {
        const a = over.a == null ? 1 : over.a;
        return {
            r: over.r * a + under.r * (1 - a),
            g: over.g * a + under.g * (1 - a),
            b: over.b * a + under.b * (1 - a),
            a: 1,
        };
    }

    /**
     * Seuil AA applicable selon la taille : 3:1 pour du "grand texte" (≥24px, ou ≥18.66px gras),
     * 4.5:1 sinon. C'est la règle WCAG, pas une tolérance maison.
     */
    function requiredContrast(fontSizePx, fontWeight) {
        const bold = Number(fontWeight) >= 700;
        const large = fontSizePx >= 24 || (bold && fontSizePx >= 18.66);
        return large ? 3 : 4.5;
    }

    /** Une valeur d'espacement est-elle sur l'échelle 4/8 ? */
    function isOnSpacingScale(px) {
        const v = Math.abs(px);
        if (v === 0) return true;
        return Math.abs(v % 4) < 0.51 || Math.abs((v % 4) - 4) < 0.51;
    }

    /**
     * Aplatit une pile de couches translucides sur un fond opaque.
     * @param {Array} layers - du plus PROCHE de l'élément au plus lointain
     * @param {Object} base - fond opaque
     */
    function compositeStack(layers, base) {
        let result = base;
        for (let i = layers.length - 1; i >= 0; i--) result = composite(layers[i], result);
        return result;
    }

    /** Estimation du nombre de caractères par ligne d'un bloc de texte. */
    function charsPerLine(textLength, blockHeight, lineHeightPx) {
        if (!textLength || !lineHeightPx || lineHeightPx <= 0) return null;
        const lines = Math.max(1, Math.round(blockHeight / lineHeightPx));
        return textLength / lines;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Règles DOM
    // ─────────────────────────────────────────────────────────────────────────

    const ACCENT_SURFACE_ONLY = ['rgb(139, 92, 246)']; // #8B5CF6 — surface uniquement (G7)

    function isVisible(el, cs) {
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
    }

    /** Texte propre à l'élément (hors descendants) — évite de compter 10 fois le même texte. */
    function ownText(el) {
        let t = '';
        for (const node of el.childNodes) {
            if (node.nodeType === 3) t += node.nodeValue;
        }
        return t.trim();
    }

    /**
     * Couleur de fond réellement perçue derrière un élément.
     *
     * Méthode en deux temps, et c'est important : on EMPILE d'abord les couches translucides en
     * remontant les ancêtres, puis on les composite sur le premier fond OPAQUE trouvé, du plus
     * lointain au plus proche. Compositer au fil de la remontée est faux — `composite()` renvoie
     * une couleur opaque, donc deux couches translucides successives produiraient un fond opaque
     * arbitraire qui masquerait le vrai fond. Ce bug a fait remonter des faux contrastes de 1.48:1
     * sur du texte réellement à ~12:1 (première exécution de l'outil, 2026-08-04).
     */
    function effectiveBackground(el) {
        const layers = []; // du plus proche de l'élément au plus lointain
        let node = el;
        while (node && node.nodeType === 1) {
            const cs = getComputedStyle(node);
            const c = parseColor(cs.backgroundColor);
            const hasGradient = cs.backgroundImage && cs.backgroundImage !== 'none'
                && /gradient/.test(cs.backgroundImage);

            if (c && c.a >= 1) {
                // Fond opaque atteint : on peut résoudre. Un dégradé posé sur ce même nœud reste
                // une approximation acceptable (la couleur de fond en est la base).
                return { color: compositeStack(layers, c), gradient: false };
            }
            if (c && c.a > 0) layers.push(c);
            // Dégradé sans fond opaque dessous : non résoluble en une couleur, on ne devine pas.
            if (hasGradient) return { color: null, gradient: true };
            node = node.parentElement;
        }
        return { color: null, gradient: false };
    }

    function isInteractive(el) {
        const tag = el.tagName.toLowerCase();
        if (tag === 'button' || tag === 'a' || tag === 'input' || tag === 'select') return true;
        const role = el.getAttribute('role');
        if (role === 'button' || role === 'link' || role === 'tab') return true;
        return getComputedStyle(el).cursor === 'pointer';
    }

    /**
     * Audite un sous-arbre rendu.
     * @param {Element} rootEl - conteneur du rendu (une page d'export, ou la page site entière)
     * @param {Object} [opts]
     * @param {boolean} [opts.paged=true] - mode Document (canevas à hauteur fixe) vs mode Site
     * @returns {{violations: Array, stats: Object}}
     */
    function auditRender(rootEl, opts) {
        const options = opts || {};
        const paged = options.paged !== false;
        const violations = [];
        const push = (rule, severity, message, el, extra) => {
            violations.push({
                rule, severity, message,
                selector: el ? describe(el) : null,
                path: el ? ancestry(el) : null,
                ...(extra || {}),
            });
        };

        const els = [rootEl, ...rootEl.querySelectorAll('*')];
        let textNodes = 0;
        let minFont = Infinity;

        for (const el of els) {
            const cs = getComputedStyle(el);
            if (!isVisible(el, cs)) continue;
            const rect = el.getBoundingClientRect();
            const text = ownText(el);
            const fontSize = parseFloat(cs.fontSize) || 0;

            // ── E2 : taille de police effective ──
            if (text) {
                textNodes++;
                if (fontSize < minFont) minFont = fontSize;
                if (fontSize < 12) {
                    push('E2', 'error', `Police à ${fontSize.toFixed(1)}px — plancher 12px`, el, { fontSize });
                }
            }

            // ── E1 : contraste ──
            // Un texte composé UNIQUEMENT d'emoji est rendu par la police couleur du système : la
            // déclaration `color` ne l'atteint pas. Le juger revenait à rapporter le contraste d'une
            // couleur qui n'est pas celle affichée — 75 fausses violations sur une seule fiche, qui
            // auraient envoyé corriger une couleur sans effet possible.
            if (text && !isEmojiOnly(text)) {
                const fg = parseColor(cs.color);
                const bgInfo = effectiveBackground(el);
                if (fg && bgInfo.color && !bgInfo.gradient && fg.a > 0) {
                    const fgOpaque = fg.a >= 1 ? fg : composite(fg, bgInfo.color);
                    const ratio = contrastRatio(fgOpaque, bgInfo.color);
                    const need = requiredContrast(fontSize, cs.fontWeight);
                    if (ratio < need) {
                        push('E1', 'error',
                            `Contraste ${ratio.toFixed(2)}:1 < ${need}:1 requis (${fontSize.toFixed(0)}px)`,
                            // `fg`/`bg` rapportés : sans eux, corriger un contraste revient à
                            // deviner quelle déclaration de couleur est en cause parmi celles qui
                            // se ressemblent. Deux tentatives inertes le 2026-08-06 avant ajout.
                            // `bg` doit être LISIBLE : `String({r,g,b})` donnait « [object Object] »,
                            // c'est-à-dire une violation qu'on ne peut pas relier à une déclaration
                            // de couleur — exactement le défaut que ce champ était censé corriger.
                            el, { ratio: +ratio.toFixed(2), required: need, text: text.slice(0, 40),
                                fg: cs.color, bg: fmtColor(bgInfo.color) });
                    }
                }

                // ── G7 : l'accent violet ne doit jamais porter du texte ──
                if (ACCENT_SURFACE_ONLY.includes(cs.color.replace(/\s+/g, ' ').trim())) {
                    push('G7', 'error', 'Accent #8B5CF6 utilisé comme couleur de TEXTE (surface uniquement)', el);
                }
            }

            // ── E4b : conteneur INTERNE qui coupe son contenu ──
            // E4 ne regarde que la page. Un conteneur imbriqué qui défile (une zone d'édition
            // réutilisée telle quelle dans un rendu figé) coupe son contenu ET rasterise sa barre
            // de défilement dans le PNG, sans qu'aucune règle ne le voie — trouvé à l'œil sur un
            // export réel le 2026-08-06, la moitié d'un pipeline de culture manquante.
            if (el !== rootEl && el.scrollHeight > el.clientHeight + 2 && /auto|scroll|hidden|clip/.test(cs.overflowY) && rect.height > 40) {
                push('E4b', 'error',
                    `Conteneur coupé : contenu ${el.scrollHeight}px dans ${el.clientHeight}px (overflow-y: ${cs.overflowY})`,
                    el, { overflow: el.scrollHeight - el.clientHeight, overflowY: cs.overflowY });
            }

            // ── E3 : troncature silencieuse ──
            if (text && el.scrollWidth > el.clientWidth + 1 && /hidden|clip/.test(cs.overflowX)) {
                push('E3', 'error', `Texte tronqué (${el.scrollWidth}px dans ${el.clientWidth}px)`, el,
                    { text: text.slice(0, 40) });
            }

            // ── E5 : longueur de ligne en lecture longue ──
            if (text.length > 120) {
                const lh = parseFloat(cs.lineHeight) || fontSize * 1.4;
                const cpl = charsPerLine(text.length, rect.height, lh);
                if (cpl && (cpl < 45 || cpl > 90)) {
                    push('E5', cpl > 90 ? 'error' : 'warn',
                        `≈${Math.round(cpl)} caractères/ligne (cible 45–90)`, el, { charsPerLine: Math.round(cpl) });
                }
            }

            // ── E12 : cible tactile ──
            if (isInteractive(el) && (rect.width < 44 || rect.height < 44)) {
                push('E12', 'warn',
                    `Cible ${Math.round(rect.width)}×${Math.round(rect.height)} — minimum 44×44`, el);
            }

            // ── S1 : espacements sur l'échelle 4/8 ──
            for (const prop of ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'gap']) {
                const v = parseFloat(cs[prop]);
                if (Number.isFinite(v) && v > 0 && !isOnSpacingScale(v)) {
                    push('S1', 'warn', `${prop} = ${v}px hors échelle 4/8`, el, { prop, value: v });
                }
            }

            // ── S3 : chiffres en chasse tabulaire ──
            if (text && /^[\d\s.,%°/-]{3,}$/.test(text) && !/tabular-nums/.test(cs.fontVariantNumeric)) {
                push('S3', 'warn', `Valeur chiffrée sans tabular-nums : "${text.slice(0, 20)}"`, el);
            }

            // ── G4 : numérotation « 01 / 02 » ──
            if (/^0\d$/.test(text)) {
                push('G4', 'error', `Numérotation de section "${text}" — grammaire absente du produit`, el);
            }
        }

        // ── E4 / E6 : débordement et remplissage (mode Document) ──
        const rootRect = rootEl.getBoundingClientRect();
        const stats = {
            canvasHeight: Math.round(rootRect.height),
            contentHeight: Math.round(rootEl.scrollHeight),
            textNodes,
            minFontSize: minFont === Infinity ? null : +minFont.toFixed(1),
        };

        if (paged) {
            // ATTENTION : l'aperçu Studio applique un `transform: scale()` au canevas.
            // `getBoundingClientRect()` renvoie des pixels ÉCRAN (mis à l'échelle) alors que
            // `scrollHeight` renvoie des pixels de LAYOUT. Les comparer produit un faux
            // débordement systématique (mesuré : 1080 vs 626 sur un canevas parfaitement sain).
            // On compare donc deux grandeurs de layout : `scrollHeight` vs `clientHeight`.
            const layoutHeight = rootEl.clientHeight || rootRect.height;
            stats.layoutHeight = Math.round(layoutHeight);
            if (rootEl.scrollHeight > layoutHeight + 1) {
                push('E4', 'error',
                    `Débordement : contenu ${rootEl.scrollHeight}px > canevas ${Math.round(layoutHeight)}px`,
                    rootEl, { overflow: Math.round(rootEl.scrollHeight - layoutHeight) });
            }
            // Composition de la page — indispensable pour DIAGNOSTIQUER un mauvais remplissage :
            // sans la liste des modules et de leurs hauteurs, un « 29 % » ne dit pas s'il s'agit
            // d'un module isolé de force, d'un bloc trop gros pour cohabiter, ou d'un reliquat.
            // Position ET hauteur. La seule hauteur ne dit pas dans QUELLE colonne un bloc a
            // atterri ni jusqu'où il descend — or c'est exactement ce qu'il faut savoir pour
            // comprendre un débordement sur une mise en page à deux colonnes (le paginateur
            // raisonne en colonnes, il faut pouvoir confronter sa prédiction au rendu).
            stats.modules = [...rootEl.querySelectorAll('[data-module]')].map((m) => {
                const r = m.getBoundingClientRect();
                return {
                    id: m.getAttribute('data-module'),
                    height: Math.round(r.height),
                    top: Math.round(r.top - rootRect.top),
                    bottom: Math.round(r.bottom - rootRect.top),
                    left: Math.round(r.left - rootRect.left),
                };
            });

            // Remplissage réel : bas du dernier module, pas scrollHeight (qui peut inclure du vide).
            // Ici les deux grandeurs viennent de `getBoundingClientRect`, donc la mise à l'échelle
            // se simplifie dans le rapport — le pourcentage reste juste même en aperçu réduit.
            let bottom = 0;
            rootEl.querySelectorAll('[data-module]').forEach((m) => {
                const r = m.getBoundingClientRect();
                bottom = Math.max(bottom, r.bottom - rootRect.top);
            });
            if (bottom > 0 && rootRect.height > 0) {
                const fill = (bottom / rootRect.height) * 100;
                stats.fillPercent = +fill.toFixed(1);
                // Au-delà de 100 %, le dernier module dépasse le bas du canevas : sur une page à
                // taille fixe, ce qui dépasse est COUPÉ, donc définitivement perdu à l'export.
                // C'est le défaut le plus grave que cette règle puisse voir — il était pourtant
                // classé en simple avertissement jusqu'au 2026-08-06, ce qui a fait passer pour
                // bon un Article de Blog rendu à 134 %. Une règle qui affiche en vert un export
                // amputé est pire qu'une règle absente : elle donne une garantie fausse.
                if (fill > 100) {
                    push('E6', 'error', `Page remplie à ${fill.toFixed(1)}% — contenu coupé`, rootEl, { fill: +fill.toFixed(1) });
                } else if (fill < 65) {
                    push('E6', 'error', `Page remplie à ${fill.toFixed(1)}% (cible 65–95%)`, rootEl, { fill: +fill.toFixed(1) });
                } else if (fill > 95) {
                    push('E6', 'warn', `Page remplie à ${fill.toFixed(1)}% — marge faible`, rootEl, { fill: +fill.toFixed(1) });
                }
            }
        }

        // ── E11 : section vide (titre sans contenu mesurable) ──
        rootEl.querySelectorAll('[data-module]').forEach((m) => {
            const r = m.getBoundingClientRect();
            const t = m.textContent.trim();
            if (r.height > 0 && r.height < 8 && !t) {
                push('E11', 'warn', `Module "${m.getAttribute('data-module')}" rendu vide`, m);
            }
        });

        return { violations, stats };
    }

    function describe(el) {
        if (!el || !el.tagName) return null;
        const mod = el.getAttribute && el.getAttribute('data-module');
        if (mod) return `[data-module="${mod}"]`;
        const cls = (el.className && typeof el.className === 'string')
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : '';
        return el.tagName.toLowerCase() + cls;
    }

    /**
     * Chemin remontant jusqu'au module englobant.
     *
     * `describe` seul rend « div » ou « span » — de quoi confirmer qu'il y a un défaut, pas de quoi
     * TROUVER le code fautif. Deux corrections du 2026-08-06 ont visé le mauvais site de rendu
     * faute de cette information, et sont reparties inertes. Le chemin dit dans quelle section du
     * template chercher.
     */
    function ancestry(el) {
        const parts = [];
        let cur = el;
        for (let i = 0; i < 8 && cur && cur.tagName; i += 1) {
            const mod = cur.getAttribute && cur.getAttribute('data-module');
            if (mod) { parts.unshift(`[${mod}]`); break; }
            parts.unshift(describe(cur));
            cur = cur.parentElement;
        }
        return parts.join(' > ');
    }

    /** Agrège les violations par règle — la vue utile pour décider quoi corriger en premier. */
    function summarize(violations) {
        const byRule = {};
        for (const v of violations) {
            if (!byRule[v.rule]) byRule[v.rule] = { rule: v.rule, error: 0, warn: 0, samples: [] };
            byRule[v.rule][v.severity] = (byRule[v.rule][v.severity] || 0) + 1;
            if (byRule[v.rule].samples.length < 3) byRule[v.rule].samples.push(v.message);
        }
        return Object.values(byRule).sort((a, b) => (b.error - a.error) || (b.warn - a.warn));
    }

    root.__exportAudit = {
        auditRender,
        summarize,
        // exposés pour les tests unitaires
        parseColor, luminance, contrastRatio, composite, compositeStack,
        requiredContrast, isOnSpacingScale, charsPerLine, isEmojiOnly, fmtColor,
    };
})(typeof globalThis !== 'undefined' ? globalThis : window);
