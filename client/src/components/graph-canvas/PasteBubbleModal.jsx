/**
 * PasteBubbleModal Component
 *
 * Crée une bulle épinglée à partir d'un TEXTE COLLÉ — une bulle copiée ailleurs sur le canevas
 * (« Copier les données »), ou n'importe quel contenu venu du dehors : bulletin d'analyse, extrait
 * de tableur, message d'un fournisseur. Pendant du MediaBubbleImportModal (photo/vidéo), même
 * gabarit LiquidUI, et comme lui posé dans graph-canvas/ pour rester utilisable par les deux
 * canevas (Chaîne de production, PhenoHunt).
 *
 * Pourquoi une modale alors que le presse-papiers est lisible en une ligne : `readText()` n'est PAS
 * disponible partout (Firefox le refuse aux pages web, Safari/Chrome peuvent demander une
 * autorisation qu'on peut refuser). L'appelant tente donc la lecture directe d'abord ; cette modale
 * est le chemin qui marche toujours — on y colle à la main (Ctrl+V), avec l'aperçu de ce qui sera
 * réellement créé, et la possibilité de corriger le texte avant.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI';
import { ClipboardPaste, X, Plus } from 'lucide-react';
import { parsePastedBubble } from '../../utils/graphDataBubble';

const PasteBubbleModal = ({ initialText = '', onCreate, onClose }) => {
    const [text, setText] = useState(initialText);
    const [error, setError] = useState(null);
    const [creating, setCreating] = useState(false);
    const areaRef = useRef(null);

    // Le champ est prêt à recevoir un Ctrl+V dès l'ouverture : sans ce focus, le raccourci ne va
    // nulle part et la modale a l'air inerte.
    useEffect(() => {
        const id = setTimeout(() => areaRef.current?.focus(), 60);
        return () => clearTimeout(id);
    }, []);

    // Aperçu = le MÊME analyseur que la création, jamais une seconde lecture approximative du texte.
    const preview = useMemo(() => parsePastedBubble(text), [text]);

    const handleCreate = async () => {
        if (!preview) return;
        setCreating(true);
        setError(null);
        const result = await onCreate(preview);
        setCreating(false);
        if (result?.error) setError(result.error);
        else onClose();
    };

    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <ClipboardPaste size={18} />
                    <span>Créer une bulle depuis le presse-papiers</span>
                </div>
            }
            size="md"
            glowColor="emerald"
            footer={
                <div className="flex gap-2 w-full">
                    <LiquidButton variant="ghost" onClick={onClose} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleCreate}
                        disabled={!preview || creating}
                        loading={creating}
                        icon={Plus}
                        className="flex-1"
                    >
                        Créer la bulle
                    </LiquidButton>
                </div>
            }
        >
            <div className="space-y-3">
                {error && (
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}
                <p className="text-sm text-white/50">
                    Collez ici (Ctrl+V) les informations à épingler. La 1<sup>re</sup> ligne devient le titre,
                    chaque ligne « Libellé : valeur » devient une donnée, une ligne seule devient un intertitre.
                </p>

                <textarea
                    ref={areaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    spellCheck={false}
                    className="w-full rounded-xl p-3 text-sm text-white/90 font-mono"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', resize: 'vertical' }}
                    placeholder={'Extraction — ext-2\nMéthode d\'extraction : live-rosin\nPression appliquée : 850 PSI'}
                />

                {preview ? (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-xs uppercase tracking-wide text-white/40 mb-2">Aperçu de la bulle</p>
                        <p className="text-sm text-white/90 font-medium">{preview.title}</p>
                        <div className="mt-1 space-y-0.5">
                            {preview.body.slice(0, 8).map((line, i) => (
                                <p key={i} className="text-xs text-white/60">
                                    {line.group ? <span className="uppercase tracking-wide text-white/40">{line.label}</span> : `${line.label} : ${line.value}`}
                                </p>
                            ))}
                            {preview.body.length > 8 && (
                                <p className="text-xs text-white/40">+{preview.body.length - 8} ligne(s)</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-white/40">Rien à créer pour l'instant — le presse-papiers était vide ou n'a pas pu être lu.</p>
                )}
            </div>
        </LiquidModal>
    );
};

export default PasteBubbleModal;
