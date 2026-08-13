import { useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ÉDITEUR DE COURBE — saisir une mesure sur TOUTE une plage d'étapes, d'un geste.
 *
 * Pourquoi ce composant existe. Une mesure qui évolue dans le temps (température, humidité, CO₂,
 * pH…) se saisissait cellule par cellule : sur une culture de 90 jours, renseigner une seule
 * grandeur demandait 90 ouvertures de modale. En pratique personne ne le fait, les pipelines
 * restent creux, et les « Statistiques de culture » du rendu tracent alors des lignes plates sur
 * deux points — c'est le défaut signalé (« les statistiques des pipelines sont mal faites »). Le
 * problème n'était pas le graphique : c'était qu'il n'y avait presque jamais de données à tracer.
 *
 * On dessine donc la courbe, et ce sont les CELLULES qui sont remplies. Aucune donnée nouvelle,
 * aucun format parallèle : chaque point écrit la même clé, dans la même cellule, que la saisie
 * manuelle — le rendu, les statistiques et le bilan matière les lisent sans rien savoir d'ici.
 */

// Un point par cellule. Le tracé est donc toujours exactement à la résolution de la trame :
// pas d'interpolation à inventer, pas de valeur posée sur une étape qui n'existe pas.
const MARGE = { haut: 16, bas: 28, gauche: 44, droite: 12 };
const HAUTEUR = 220;

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

export default function PipelineCurveModal({ isOpen, onClose, cells, sidebarContent, getCellValue, onApply }) {
    const champs = useMemo(() => champsNumeriques(sidebarContent), [sidebarContent]);
    const [champId, setChampId] = useState(null);
    const [valeurs, setValeurs] = useState([]);
    const [enCours, setEnCours] = useState(false);
    const svgRef = useRef(null);

    const champ = champs.find((c) => c.id === champId) || null;
    const nb = cells?.length || 0;

    const largeur = Math.max(320, MARGE.gauche + MARGE.droite + Math.max(1, nb - 1) * 26);
    const traceL = largeur - MARGE.gauche - MARGE.droite;
    const traceH = HAUTEUR - MARGE.haut - MARGE.bas;

    const xDe = (i) => MARGE.gauche + (nb <= 1 ? traceL / 2 : (i / (nb - 1)) * traceL);
    const yDe = (v) => {
        if (!champ) return MARGE.haut + traceH;
        const part = (v - champ.min) / Math.max(1e-6, champ.max - champ.min);
        return MARGE.haut + (1 - Math.min(1, Math.max(0, part))) * traceH;
    };
    const valeurDe = (y) => {
        if (!champ) return 0;
        const part = 1 - (y - MARGE.haut) / traceH;
        const brut = champ.min + Math.min(1, Math.max(0, part)) * (champ.max - champ.min);
        return Math.round(brut / champ.step) * champ.step;
    };

    // À la sélection d'un champ : on PART DES VALEURS DÉJÀ SAISIES. Dessiner ne doit pas effacer ce
    // qui existe — une cellule vide prend le défaut du champ, une cellule renseignée garde la sienne.
    const choisirChamp = (id) => {
        const def = champs.find((c) => c.id === id);
        if (!def) return;
        setChampId(id);
        setValeurs((cells || []).map((cellule) => {
            const actuelle = getCellValue ? getCellValue(cellule.timestamp, id) : undefined;
            const n = Number(actuelle);
            if (Number.isFinite(n)) return n;
            return Number.isFinite(def.defaut) ? def.defaut : (def.min + def.max) / 2;
        }));
    };

    const poser = (event) => {
        if (!champ || !svgRef.current || nb === 0) return;
        const boite = svgRef.current.getBoundingClientRect();
        // Coordonnées ramenées au repère du SVG : la modale peut être mise à l'échelle ou défiler.
        const x = (event.clientX - boite.left) * (largeur / boite.width);
        const y = (event.clientY - boite.top) * (HAUTEUR / boite.height);
        const i = nb <= 1 ? 0 : Math.round(((x - MARGE.gauche) / traceL) * (nb - 1));
        if (i < 0 || i >= nb) return;
        setValeurs((prev) => {
            const next = [...prev];
            next[i] = valeurDe(y);
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
            return Math.round(v / champ.step) * champ.step;
        }));
    };

    if (!isOpen || typeof document === 'undefined') return null;

    const chemin = valeurs.length
        ? valeurs.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xDe(i).toFixed(1)} ${yDe(v).toFixed(1)}`).join(' ')
        : '';

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
                    className="liquid-card w-full max-w-3xl p-5 space-y-4"
                    style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }}
                >
                    <div>
                        <h3 className="text-lg font-bold text-white/90">📈 Tracer une courbe de valeurs</h3>
                        <p className="text-xs text-white/50 mt-0.5">
                            Choisissez une mesure, puis dessinez son évolution sur les {nb} étapes. Chaque point
                            remplit la cellule correspondante — exactement comme une saisie manuelle.
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-white/60 mb-1.5">Mesure</label>
                        <select
                            value={champId || ''}
                            onChange={(e) => choisirChamp(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/90"
                        >
                            <option value="">— choisir une mesure —</option>
                            {champs.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.icon ? `${c.icon} ` : ''}{c.label}{c.unit ? ` (${c.unit})` : ''} — {c.section}
                                </option>
                            ))}
                        </select>
                        {champs.length === 0 && (
                            <p className="text-[11px] text-amber-300/80 mt-1.5">
                                Ce pipeline ne déclare aucune mesure numérique.
                            </p>
                        )}
                    </div>

                    {champ && (
                        <>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 overflow-x-auto">
                                <svg
                                    ref={svgRef}
                                    width="100%"
                                    viewBox={`0 0 ${largeur} ${HAUTEUR}`}
                                    style={{ minWidth: largeur, cursor: 'crosshair', touchAction: 'none' }}
                                    onPointerDown={(e) => { setEnCours(true); e.currentTarget.setPointerCapture(e.pointerId); poser(e); }}
                                    onPointerMove={(e) => { if (enCours) poser(e); }}
                                    onPointerUp={() => setEnCours(false)}
                                    onPointerCancel={() => setEnCours(false)}
                                >
                                    {[0, 0.25, 0.5, 0.75, 1].map((p) => {
                                        const y = MARGE.haut + (1 - p) * traceH;
                                        const v = champ.min + p * (champ.max - champ.min);
                                        return (
                                            <g key={p}>
                                                <line x1={MARGE.gauche} y1={y} x2={largeur - MARGE.droite} y2={y} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 3" />
                                                <text x={MARGE.gauche - 6} y={y + 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.45)">
                                                    {Math.round(v * 10) / 10}
                                                </text>
                                            </g>
                                        );
                                    })}
                                    {chemin && <path d={chemin} fill="none" stroke="#a78bfa" strokeWidth="2" />}
                                    {valeurs.map((v, i) => (
                                        <circle key={i} cx={xDe(i)} cy={yDe(v)} r="3.5" fill="#a78bfa" />
                                    ))}
                                    {(cells || []).map((cellule, i) => (
                                        // Un repère sur une étape sur cinq : au-delà, les libellés se chevauchent.
                                        (i % Math.max(1, Math.ceil(nb / 12)) === 0) && (
                                            <text key={cellule.timestamp} x={xDe(i)} y={HAUTEUR - 8} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.4)">
                                                {cellule.label}
                                            </text>
                                        )
                                    ))}
                                </svg>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button onClick={remplirConstant} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-white/10">
                                    Constante (valeur du 1ᵉʳ point)
                                </button>
                                <button onClick={rampe} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-white/70 hover:bg-white/10">
                                    Rampe (1ᵉʳ → dernier)
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
    /** Cellules de la trame, dans l'ordre — `{ timestamp, label }` au minimum. */
    cells: PropTypes.array,
    /** Sections de champs du pipeline (`*SidebarContent.js`) — source des mesures proposées. */
    sidebarContent: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Lit la valeur déjà saisie d'une cellule, pour partir de l'existant plutôt que de l'écraser. */
    getCellValue: PropTypes.func,
    /** `(champId, [{ timestamp, valeur }]) => void` */
    onApply: PropTypes.func.isRequired,
};
