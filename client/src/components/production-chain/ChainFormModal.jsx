/**
 * ChainFormModal Component
 * Modale de renommage/édition d'une chaîne de production — équivalent minimal de
 * TreeFormModal.jsx (PhenoHunt), sans type de projet (ProductionChain n'a pas ce champ).
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidTextarea, LiquidCard } from '@/components/ui/LiquidUI';
import useProductionChainStore from '../../store/useProductionChainStore';
import { useToast } from '../shared/ToastContainer';
import { Save, X, Link2, Copy, Ban } from 'lucide-react';

const ChainFormModal = ({ chain, onClose }) => {
    const store = useProductionChainStore();
    const toast = useToast();
    const [name, setName] = useState(chain?.name || '');
    const [description, setDescription] = useState(chain?.description || '');
    const [isPublic, setIsPublic] = useState(chain?.isPublic || false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [shareBusy, setShareBusy] = useState(false);
    const shareCode = chain?.shareCode;
    const shareUrl = shareCode ? `${window.location.origin}/production-chain/shared/${shareCode}` : null;

    const handleGenerateShare = async () => {
        setShareBusy(true);
        const result = await store.generateShareLink(chain.id);
        setShareBusy(false);
        if (result?.error) {
            toast.error(result.error);
        } else {
            setIsPublic(true);
            toast.success('Lien de partage généré.');
        }
    };

    const handleRevokeShare = async () => {
        setShareBusy(true);
        const result = await store.revokeShareLink(chain.id);
        setShareBusy(false);
        if (result?.error) toast.error(result.error);
        else toast.info('Lien de partage révoqué.');
    };

    const handleCopyShareUrl = async () => {
        if (!shareUrl) return;
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Lien copié.');
        } catch {
            toast.error('Impossible de copier le lien.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!name || name.trim().length === 0) {
                throw new Error('Le nom de la chaîne est requis');
            }

            const result = await store.updateChain(chain.id, { name, description, isPublic });
            if (result?.error) throw new Error(result.error);

            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <span>✏️</span>
                    <span>Éditer la chaîne</span>
                </div>
            }
            size="lg"
            glowColor="green"
            footer={
                <div className="flex gap-3">
                    <LiquidButton variant="ghost" onClick={onClose} disabled={loading} icon={X} className="flex-1">
                        Annuler
                    </LiquidButton>
                    <LiquidButton
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={loading || !name}
                        loading={loading}
                        icon={Save}
                        className="flex-1"
                    >
                        Mettre à jour
                    </LiquidButton>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <LiquidCard className="p-3" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                        <p className="text-red-400 text-sm">{error}</p>
                    </LiquidCard>
                )}

                <LiquidInput
                    label="Nom de la chaîne *"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Extraction Rosin Batch 3"
                    required
                    maxLength={200}
                    hint={`${name.length}/200`}
                />

                <LiquidTextarea
                    label="Description (optionnel)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Objectifs, notes sur cette chaîne..."
                    maxLength={1000}
                    rows={3}
                    hint={`${description.length}/1000`}
                />

                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-green-500/50 transition-colors">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="w-5 h-5 rounded border-white/30 bg-white/5 mt-0.5 accent-green-500"
                    />
                    <div>
                        <span className="text-sm font-semibold text-white">Rendre cette chaîne publique</span>
                        <p className="text-xs text-white/50 mt-1">
                            Les utilisateurs pourront la voir dans la galerie publique
                        </p>
                    </div>
                </label>

                <div className="p-3 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                        <Link2 size={14} className="text-emerald-400" />
                        <span className="text-sm font-semibold text-white">Lien de partage</span>
                    </div>
                    <p className="text-xs text-white/50">
                        Un tiers avec ce lien peut consulter la chaîne en lecture seule, sans compte —
                        générer un lien rend automatiquement la chaîne publique.
                    </p>
                    {shareCode ? (
                        <>
                            <div className="flex items-center gap-2">
                                <LiquidInput value={shareUrl} readOnly className="flex-1 text-xs" />
                                <LiquidButton type="button" variant="ghost" icon={Copy} onClick={handleCopyShareUrl} title="Copier le lien" />
                            </div>
                            <LiquidButton type="button" variant="ghost" size="sm" icon={Ban} disabled={shareBusy} onClick={handleRevokeShare}>
                                Révoquer le lien
                            </LiquidButton>
                        </>
                    ) : (
                        <LiquidButton type="button" variant="outline" size="sm" icon={Link2} disabled={shareBusy} loading={shareBusy} onClick={handleGenerateShare}>
                            Générer un lien de partage
                        </LiquidButton>
                    )}
                </div>
            </form>
        </LiquidModal>
    );
};

export default ChainFormModal;
