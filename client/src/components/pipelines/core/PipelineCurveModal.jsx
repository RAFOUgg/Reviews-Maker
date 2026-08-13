import { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ÉVOLUTION D'UNE DONNÉE SUR UNE SÉLECTION DE LA TRAME.
 *
 * Pourquoi ce composant existe. Une mesure qui évolue dans le temps (température, humidité, CO₂,
 * pH…) se saisissait cellule par cellule : sur une culture de 90 jours, renseigner une seule
 * grandeur demandait 90 ouvertures de modale. En pratique personne ne le fait, les pipelines
 * restent creux, et les « Statistiques de culture » du rendu tracent alors des lignes plates sur
 * deux points — c'est le défaut signalé (« les statistiques des pipelines sont mal faites »). Le
 * problème n'était pas le graphique : c'était qu'il n'y avait presque jamais de données à tracer.
 *
 * On dessine donc l'évolution, et ce sont les CELLULES qui sont remplies. Aucune donnée nouvelle,
 * aucun format parallèle : chaque point écrit la même clé, dans la même cellule, que la saisie
 * manuelle — le rendu, les statistiques et le bilan matière les lisent sans rien savoir d'ici.
 *
 * ── Orientation des axes ────────────────────────────────────────────────────────────────────────
 * Le TEMPS est en ORDONNÉE (les cellules, de haut en bas) et les VALEURS chiffrées en ABSCISSE,
 * avec leur unité — c'est la disposition demandée (2026-08-13), et elle a un mérite pratique : une
 * trame longue (90 jours) s'étire alors dans le sens où une modale défile naturellement, au lieu de
 * réclamer un défilement latéral. Chaque ligne est une étape, on tire son point vers la droite pour
 * monter la valeur.
 *
 * ── Portée : la SÉLECTION ───────────────────────────────────────────────────────────────────────
 * L'éditeur agit sur les cellules SÉLECTIONNÉES dans la trame (« assigner une évolution d'une
 * donnée au cours d'une sélection dans la trame »). Sans sélection, il porte sur la trame entière —
 * c'est le cas courant d'un premier remplissage, et refuser d'ouvrir aurait été un piège.
 */

// Un point par cellule : le tracé est toujours exactement à la résolution de la trame — pas
// d'interpolation à inventer, pas de valeur posée sur une étape qui n'existe pas.
const MARGE = { haut: 18, bas: 30, gauche: 118, droite: 22 };
const LIGNE_PX = 26;      // hauteur d'une étape
const LIGNE_MIN_PX = 14;  // au-delà de ~30 étapes, on resserre plutôt que d'allonger sans fin
const HAUTEUR_MAX = 460;

function champsNumeriques(sidebarContent) {
    const sections = Array.isArray(sidebarContent) ? sidebarContent : Object.values(sidebarContent || {});
    const out = [];
    for (const section of sections) {
        for (const item of section?.items || []) {
            // `slider` et `stepper` sont les deux types numériques réels des `*SidebarContent.js`.
            // `computed` est exclu : c'est une valeur dérivée, l'écraser à la main n'aurait pas de sens.
            if (item?.type !== 'slider' && item?.type !== 'stepper') continue;
            out.push({
                id: item.id,
                label: item.label,
                icon: item.icon,
                unit: item.unit || '',
                min: Number.isFinite(item.min) ? item.min : 0,
                max: Number.isFinite(item.max) ? item.max : 100,
                step: Number.isFinite(item.step) ? item.step : 1,
                defaut: Number.isFinite(item.defaultValue) ? item.defaultValue : null,
                section: section.label,
            });
        }
    }
    return out;
}

/**
 * Une mesure forme-t-elle DÉJÀ une série sur ces étapes ?
 *
 * « permet l'autodétection de chaîne de donnée pouvant formée une courbe, même avec 1 ou 2 point
 * manquant suivant le nombre de cellule ». Une saisie partielle reste une courbe : on la reconnaît,
 * on la propose en tête de liste, et on rebouche ses trous par interpolation plutôt que de repartir
 * de la valeur par défaut — sinon rouvrir l'éditeur écraserait le travail déjà fait.
 *
 * La tolérance suit le nombre d'étapes : deux trous sur 13 ne veulent pas dire la même chose que
 * deux trous sur 3. On demande au moins deux points (un point unique n'est pas une évolution) et au
 * moins la moitié des étapes.
 */
function detecterSeries(cells, champs, getCellValue) {
    const total = cells?.length || 0;
    if (total < 2 || !getCellValue) return [];
    const tolerance = Math.max(1, Math.round(total * 0.2));
    const out = [];
    for (const champ of champs) {
        let presents = 0;
        for (const cellule of cells) {
            if (Number.isFinite(Number(getCellValue(cellule.timestamp, champ.id)))) presents += 1;
        }
        const manquants = total - presents;
        if (presents >= 2 && presents >= total / 2 && manquants <= tolerance) {
            out.push({ id: champ.id, presents, total, manquants });
        }
    }
    // La série la plus complète d'abord : c'est celle sur laquelle on a le plus de chances de vouloir
    // revenir.
    return out.sort((a, b) => b.presents - a.presents);
}

/**
 * Rebouche les trous d'une série par interpolation linéaire entre les points connus, et prolonge
 * les bords par la valeur connue la plus proche. Sans ça, un trou au milieu d'une courbe retombait
 * sur la valeur par défaut du champ et créait un décrochement que l'utilisateur n'a jamais saisi.
 */
function interpoler(connus, repli) {
    const n = connus.length;
    const out = connus.slice();
    const indices = [];
    for (let i = 0; i < n; i++) if (Number.isFinite(out[i])) indices.push(i);
    if (indices.length === 0) return out.map(() => repli);
    for (let i = 0; i < indices[0]; i++) out[i] = out[indices[0]];
    for (let i = indices[indices.length - 1] + 1; i < n; i++) out[i] = out[indices[indices.length - 1]];
    for (let k = 0; k < indices.length - 1; k++) {
        const a = indices[k], b = indices[k + 1];
        if (b === a + 1) continue;
        for (let i = a + 1; i < b; i++) {
            out[i] = out[a] + ((out[b] - out[a]) * (i - a)) / (b - a);
        }
    }
    return out;
}

export default function PipelineCurveModal({ isOpen, onClose, cells, sidebarContent, getCellValue, onApply }) {
    const champs = useMemo(() => champsNumeriques(sidebarContent), [sidebarContent]);
    const [champId, setChampId] = useState(null);
    const [valeurs, setValeurs] = useState([]);
    const [enCours, setEnCours] = useState(false);
    const svgRef = useRef(null);

    const champ = champs.find((c) => c.id === champId) || null;
    const nb = cells?.length || 0;
    const series = useMemo(() => detecterSeries(cells, champs, getCellValue), [cells, champs, getCellValue]);
    const serieDe = (id) => series.find((s) => s.id === id) || null;

    const pasLigne = nb > 0 ? Math.max(LIGNE_MIN_PX, Math.min(LIGNE_PX, (HAUTEUR_MAX - MARGE.haut - MARGE.bas) / nb)) : LIGNE_PX;
    const hauteur = MARGE.haut + MARGE.bas + Math.max(1, nb) * pasLigne;
    const largeur = 560;
    const traceL = largeur - MARGE.gauche - MARGE.droite;
    const traceH = hauteur - MARGE.haut - MARGE.bas;

    // Temps en ORDONNÉE : une étape par ligne, dans l'ordre de la trame.
    const yDe = (i) => MARGE.haut + (i + 0.5) * (traceH / Math.max(1, nb));
    // Valeurs en ABSCISSE.
    const xDe = (v) => {
        if (!champ) return MARGE.gauche;
        const part = (v - champ.min) / Math.max(1e-6, champ.max - champ.min);
        return MARGE.gauche + Math.min(1, Math.max(0, part)) * traceL;
    };
    const valeurDe = (x) => {
        if (!champ) return 0;
        const part = (x - MARGE.gauche) / traceL;
        const brut = champ.min + Math.min(1, Math.max(0, part)) * (champ.max - champ.min);
        // Arrondi au pas du champ, puis à 2 décimales : `0.1 * 3` vaut 0.30000000000000004 en
        // flottant, et cette valeur partirait telle quelle dans la cellule.
        return Math.round((Math.round(brut / champ.step) * champ.step) * 100) / 100;
    };

    // À la sélection d'un champ : on PART DES VALEURS DÉJÀ SAISIES. Dessiner ne doit pas effacer ce
    // qui existe — une cellule vide prend le défaut du champ, une cellule renseignée garde la sienne.
    const choisirChamp = (id) => {
        const def = champs.find((c) => c.id === id);
        if (!def) return;
        setChampId(id);
        const repli = Number.isFinite(def.defaut) ? def.defaut : (def.min + def.max) / 2;
        const connus = (cells || []).map((cellule) => {
            const n = Number(getCellValue ? getCellValue(cellule.timestamp, id) : undefined);
            return Number.isFinite(n) ? n : undefined;
        });
        // Une série déjà saisie (même trouée) est REPRISE telle quelle, trous interpolés ; un champ
        // vierge part de son défaut. Dans les deux cas, ouvrir l'éditeur n'efface jamais rien.
        setValeurs(connus.some((v) => Number.isFinite(v)) ? interpoler(connus, repli) : connus.map(() => repli));
    };

    const poser = (event) => {
        if (!champ || !svgRef.current || nb === 0) return;
        const boite = svgRef.current.getBoundingClientRect();
        // Coordonnées ramenées au repère du SVG : la modale peut être mise à l'échelle ou défiler.
        const x = (event.clientX - boite.left) * (largeur / boite.width);
        const y = (event.clientY - boite.top) * (hauteur / boite.height);
        const i = Math.floor(((y - MARGE.haut) / traceH) * nb);
        if (i < 0 || i >= nb) return;
        setValeurs((prev) => {
            const next = [...prev];
            next[i] = valeurDe(x);
            return next;
        });
    };

    const appliquer = () => {
        if (!champ) return;
        onApply(champ.id, (cells || []).map((cellule, i) => ({ timestamp: cellule.timestamp, valeur: valeurs[i] })));
        onClose();
    };

    const remplirConstant = () => {
        if (!champ || valeurs.length === 0) return;
        setValeurs(valeurs.map(() => valeurs[0]));
    };
    const rampe = () => {
        if (!champ || valeurs.length < 2) return;
        const a = valeurs[0];
        const b = valeurs[valeurs.length - 1];
        setValeurs(valeurs.map((_, i) => {
            const v = a + ((b - a) * i) / (valeurs.length - 1);
            return Math.round((Math.round(v / champ.step) * champ.step) * 100) / 100;
        }));
    };

    if (!isOpen || typeof document === 'undefined') return null;

    const chemin = valeurs.length
        ? valeurs.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xDe(v).toFixed(1)} ${yDe(i).toFixed(1)}`).join(' ')
        : '';
    // Un libellé d'étape sur n : sous ~11px de pas, ils se chevaucheraient.
    const pasLibelle = Math.max(1, Math.ceil(11 / pasLigne));

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100000] flex items-center justify-center p-4"
                style={{ background: 'rgba(6,8,14,0.75)', backdropFilter: 'blur(6px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, y: 12 }}
                    onClick={(e) => e.stopPropagation()}
                    className="liquid-card w-full max-w-2xl p-5 space-y-4 max-h-[92vh] overflow-y-auto"
                    style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }}
                >
                    <div>
                        <h3 className="text-lg font-bold text-white/90">📈 Évolution d&apos;une donnée</h3>
                        <p className="text-xs text-white/50 mt-0.5">
                            Choisissez une mesure, puis tirez chaque étape vers la droite pour monter sa valeur.
                            L&apos;évolution s&apos;applique aux <span className="text-white/80 font-semibold">{nb} étape{nb > 1 ? 's' : ''}</span> concernée{nb > 1 ? 's' : ''} — chaque
                            point remplit sa cellule, exactement comme une saisie manuelle.
                        </p>
                    </div>

                    {/* CHOIX DE LA MESURE — liste maison, pas un `<select>`.
                        Le menu déroulant natif est peint par le SYSTÈME : sur Windows il s'ouvre en
                        blanc sur blanc au-dessus d'une interface sombre, et aucune règle CSS ne le
                        rattrape (capture utilisateur, 2026-08-14 : « menu contextuelle blanc
                        illisible »). Une liste rendue par l'application est lisible partout, et elle
                        peut porter l'information qui compte ici : quelles mesures forment DÉJÀ une
                        série sur ces étapes. */}
                    <div>
                        <div className="text-xs font-medium text-white/60 mb-1.5">Mesure</div>
                        {champs.length === 0 ? (
                            <p className="text-[11px] text-amber-300/80">
                                Ce pipeline ne déclare aucune mesure numérique.
                            </p>
                        ) : (
                            <div className="max-h-52 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] divide-y divide-white/5">
                                {[...champs]
                                    // Les séries déjà saisies remontent en tête : c'est là qu'on
                                    // revient corriger une courbe, et ça les rend découvrables.
                                    .sort((a, b) => (serieDe(b.id)?.presents || 0) - (serieDe(a.id)?.presents || 0))
                                    .map((c) => {
                                        const serie = serieDe(c.id);
                                        const actif = c.id === champId;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => choisirChamp(c.id)}
                                                className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors ${
                                                    actif ? 'bg-violet-600/25 text-white' : 'text-white/75 hover:bg-white/5 hover:text-white'
                                                }`}
                                            >
                                                <span className="w-5 text-center">{c.icon || '•'}</span>
                                                <span className="flex-1 truncate">
                                                    {c.label}{c.unit ? ` (${c.unit})` : ''}
                                                    <span className="text-white/35"> — {c.section}</span>
                                                </span>
                                                {serie && (
                                                    <span
                                                        title={serie.manquants ? `${serie.manquants} étape(s) sans valeur — comblées par interpolation` : 'Série complète'}
                                                        className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 whitespace-nowrap"
                                                    >
                                                        série {serie.presents}/{serie.total}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {champ && (
                        <>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2">
                                <svg
                                    ref={svgRef}
                                    width="100%"
                                    viewBox={`0 0 ${largeur} ${hauteur}`}
                                    style={{ cursor: 'crosshair', touchAction: 'none', display: 'block' }}
                                    onPointerDown={(e) => { setEnCours(true); e.currentTarget.setPointerCapture(e.pointerId); poser(e); }}
                                    onPointerMove={(e) => { if (enCours) poser(e); }}
                                    onPointerUp={() => setEnCours(false)}
                                    onPointerCancel={() => setEnCours(false)}
                                >
                                    {/* ABSCISSE — graduations de valeur, avec l'unité de la mesure. */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                                        const x = MARGE.gauche + p * traceL;
                                        const v = champ.min + p * (champ.max - champ.min);
                                        return (
                                            <g key={p}>
                                                <line x1={x} y1={MARGE.haut} x2={x} y2={hauteur - MARGE.bas} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" />
                                                <text x={x} y={hauteur - MARGE.bas + 15} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.45)">
                                                    {Math.round(v * 10) / 10}
                                                </text>
                                            </g>
                                        );
                                    })}
                                    <text x={MARGE.gauche + traceL / 2} y={hauteur - 4} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.55)">
                                        {champ.label}{champ.unit ? ` (${champ.unit})` : ''}
                                    </text>

                                    {/* ORDONNÉE — le temps : une étape de la trame par ligne. */}
                                    {(cells || []).map((cellule, i) => (
                                        (i % pasLibelle === 0) && (
                                            <text key={cellule.timestamp} x={MARGE.gauche - 8} y={yDe(i) + 3} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.45)">
                                                {String(cellule.label ?? cellule.cellLabel ?? i + 1).slice(0, 16)}
                                            </text>
                                        )
                                    ))}

                                    {chemin && <path d={chemin} fill="none" stroke="#a78bfa" strokeWidth="2" />}
                                    {valeurs.map((v, i) => (
                                        <circle key={i} cx={xDe(v)} cy={yDe(i)} r={pasLigne > 18 ? 3.5 : 2.5} fill="#a78bfa" />
                                    ))}
                                </svg>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={remplirConstant} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-white/10">
                                    Constante (valeur de la 1ʳᵉ étape)
                                </button>
                                <button onClick={rampe} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-white/10">
                                    Rampe (1ʳᵉ → dernière)
                                </button>
                                <span className="text-[11px] text-white/35 ml-auto">
                                    {champ.min}–{champ.max} {champ.unit}
                                </span>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white/70 hover:bg-white/10">
                            Annuler
                        </button>
                        <button
                            onClick={appliquer}
                            disabled={!champ}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold ${champ ? 'bg-violet-600 text-white hover:bg-violet-500' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                        >
                            Appliquer à {nb} étape{nb > 1 ? 's' : ''}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body,
    );
}

PipelineCurveModal.propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    /** Étapes CONCERNÉES, dans l'ordre — la sélection, ou toute la trame à défaut. */
    cells: PropTypes.array,
    /** Sections de champs du pipeline (`*SidebarContent.js`) — source des mesures proposées. */
    sidebarContent: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Lit la valeur déjà saisie d'une cellule, pour partir de l'existant plutôt que de l'écraser. */
    getCellValue: PropTypes.func,
    /** `(champId, [{ timestamp, valeur }]) => void` */
    onApply: PropTypes.func.isRequired,
};
