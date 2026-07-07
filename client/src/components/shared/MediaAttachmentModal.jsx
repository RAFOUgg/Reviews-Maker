/**
 * MediaAttachmentModal Component
 *
 * Galerie de photos/vidéos (200 Mo max chacune) attachées à un nœud/liaison de canvas (Chaîne de
 * production / PhenoHunt) ou à une cellule de pipeline — pour illustrer visuellement une étape.
 * Composant partagé : ne connaît rien du contexte appelant, juste `media` (tableau actuel) et
 * `onChange(nextMedia)` pour que l'appelant persiste (store.updateNode/updateEdge, onDataChange
 * d'une cellule...).
 */

import React, { useState, useRef } from 'react';
import { LiquidModal, LiquidButton, LiquidInput } from '@/components/ui/LiquidUI';
import { Image as ImageIcon, Film, FileText, Upload, X, Trash2, Loader2, Camera, FolderOpen, Library } from 'lucide-react';
import ReviewPhotoLibraryPicker from './ReviewPhotoLibraryPicker';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 Mo
const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';

function formatSize(bytes) {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${Math.round(bytes / 1024)} Ko`;
}

/**
 * MediaGallery — contenu réutilisable (bouton d'envoi + grille de vignettes), sans le
 * wrapper modal, pour pouvoir être intégré directement dans un autre modal (ex: la modale
 * "Modifier les données" d'une cellule de pipeline) plutôt que d'ouvrir une modale imbriquée.
 */
export const MediaGallery = ({ media = [], onChange, compact = false }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [showLibraryPicker, setShowLibraryPicker] = useState(false);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handlePickFromLibrary = (url) => {
        onChange([...media, {
            id: crypto.randomUUID(),
            url,
            filename: null, // référence une photo déjà hébergée par une autre review, pas un nouvel envoi
            type: 'photo',
            caption: '',
            uploadedAt: new Date().toISOString()
        }]);
    };

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // permet de re-sélectionner le même fichier ensuite
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setError(`Fichier trop volumineux (${formatSize(file.size)}) — 200 Mo maximum`);
            return;
        }

        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/media-upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Échec de l\'envoi');
            }
            const uploaded = await res.json();
            const newItem = {
                id: crypto.randomUUID(),
                url: uploaded.url,
                filename: uploaded.filename,
                type: uploaded.type,
                caption: '',
                uploadedAt: new Date().toISOString()
            };
            onChange([...media, newItem]);
        } catch (err) {
            setError(err.message || 'Échec de l\'envoi');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async (item) => {
        onChange(media.filter(m => m.id !== item.id));
        if (item.filename) {
            fetch(`/api/media-upload/${item.filename}`, { method: 'DELETE', credentials: 'include' }).catch(() => {});
        }
    };

    const handleCaptionChange = (id, caption) => {
        onChange(media.map(m => m.id === id ? { ...m, caption } : m));
    };

    return (
        <div className="space-y-3">
            {error && (
                <div className="p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Deux inputs distincts plutôt qu'un seul : `capture` force l'ouverture directe de
                l'appareil photo sur mobile (pas le choix habituel caméra/galerie du navigateur) —
                indispensable pour proposer "Prendre une photo" comme option à part entière plutôt
                que de dépendre du sélecteur natif, qui varie selon navigateur/OS. */}
            <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" onChange={handleFileSelected} className="hidden" />
            <input ref={galleryInputRef} type="file" accept={ACCEPTED} onChange={handleFileSelected} className="hidden" />

            <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-3'}`}>
                <LiquidButton
                    variant="outline"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    loading={uploading}
                    icon={uploading ? Loader2 : Camera}
                    className="w-full"
                >
                    Prendre une photo
                </LiquidButton>
                <LiquidButton
                    variant="outline"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={uploading}
                    loading={uploading}
                    icon={uploading ? Loader2 : FolderOpen}
                    className="w-full"
                >
                    Depuis la galerie
                </LiquidButton>
                <LiquidButton
                    variant="outline"
                    onClick={() => setShowLibraryPicker(true)}
                    disabled={uploading}
                    icon={Library}
                    className="w-full"
                >
                    Ma bibliothèque
                </LiquidButton>
            </div>

            {showLibraryPicker && (
                <ReviewPhotoLibraryPicker
                    onSelect={handlePickFromLibrary}
                    onClose={() => setShowLibraryPicker(false)}
                />
            )}

            {media.length === 0 ? (
                <p className="text-sm text-white/40 text-center py-4">Aucun média attaché.</p>
            ) : (
                <div className={`grid gap-3 overflow-y-auto pr-1 ${compact ? 'grid-cols-3 sm:grid-cols-4 max-h-64' : 'grid-cols-2 sm:grid-cols-3 max-h-96'}`}>
                    {media.map(item => (
                        <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                            <div className="aspect-video bg-black/30 flex items-center justify-center relative">
                                {item.type === 'video' ? (
                                    <video src={item.url} controls className="w-full h-full object-contain" />
                                ) : item.type === 'pdf' ? (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center justify-center gap-1 w-full h-full text-white/70 hover:text-white"
                                        title="Ouvrir le PDF"
                                    >
                                        <FileText size={28} className="text-red-400" />
                                        <span className="text-[10px]">Ouvrir le PDF</span>
                                    </a>
                                ) : (
                                    <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                                )}
                                <span className="absolute top-1 left-1 p-1 rounded bg-black/50 text-white/80">
                                    {item.type === 'video' ? <Film size={11} /> : item.type === 'pdf' ? <FileText size={11} /> : <ImageIcon size={11} />}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(item)}
                                    title="Retirer"
                                    className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white/70 hover:text-red-400 hover:bg-black/70"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            {!compact && (
                                <LiquidInput
                                    value={item.caption || ''}
                                    onChange={(e) => handleCaptionChange(item.id, e.target.value)}
                                    placeholder="Légende (optionnel)"
                                    className="text-xs"
                                    maxLength={100}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MediaAttachmentModal = ({ media = [], onChange, onClose, title = 'Photos / Vidéos' }) => {
    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-2">
                    <ImageIcon size={18} />
                    <span>{title}</span>
                </div>
            }
            size="lg"
            glowColor="amber"
            footer={
                <LiquidButton variant="ghost" onClick={onClose} icon={X} className="w-full">
                    Fermer
                </LiquidButton>
            }
        >
            <MediaGallery media={media} onChange={onChange} />
        </LiquidModal>
    );
};

export default MediaAttachmentModal;
