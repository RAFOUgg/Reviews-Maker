/**
 * MediaBubbleImportModal Component
 *
 * Point d'entrée partagé (Chaîne de production ET PhenoHunt) pour épingler une photo/vidéo
 * directement sur le fond du canvas comme sa propre "bulle" — distinct de l'attache de média à
 * un nœud/liaison existant (MediaAttachmentModal) : ici la photo/vidéo EST le nœud, pas une pièce
 * jointe d'un autre nœud. Réutilise les mêmes briques que MediaAttachmentModal (upload générique
 * /api/media-upload, 200 Mo max) et ReviewPhotoLibraryPicker ("Ma bibliothèque", photos only).
 */

import React, { useState, useRef } from 'react';
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI';
import { Image as ImageIcon, Camera, FolderOpen, Library, Loader2, X } from 'lucide-react';
import ReviewPhotoLibraryPicker from '../shared/ReviewPhotoLibraryPicker';

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 Mo
const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime';

const MediaBubbleImportModal = ({ onImport, onClose }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [showLibraryPicker, setShowLibraryPicker] = useState(false);
    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleFileSelected = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            setError(`Fichier trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} Mo) — 200 Mo maximum`);
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
            // onImport (fourni par le canvas) crée réellement la bulle côté serveur — attendre son
            // retour et afficher l'erreur ici plutôt que de fermer la modale à l'aveugle : sans ce
            // garde-fou, un échec de création (ex: session expirée) refermait silencieusement la
            // modale sans que la photo n'apparaisse jamais sur le canvas.
            const result = await onImport({ url: uploaded.url, type: uploaded.type });
            if (result?.error) {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message || 'Échec de l\'envoi');
        } finally {
            setUploading(false);
        }
    };

    const handleLibrarySelect = async (url) => {
        setShowLibraryPicker(false);
        setError(null);
        const result = await onImport({ url, type: 'photo' });
        if (result?.error) {
            setError(result.error);
        }
    };

    return (
        <>
            <LiquidModal
                isOpen={true}
                onClose={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <ImageIcon size={18} />
                        <span>Importer une photo/vidéo</span>
                    </div>
                }
                size="md"
                glowColor="amber"
                footer={
                    <LiquidButton variant="ghost" onClick={onClose} icon={X} className="w-full">
                        Fermer
                    </LiquidButton>
                }
            >
                <div className="space-y-3">
                    {error && (
                        <div className="p-3 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}
                    <p className="text-sm text-white/50">
                        La photo/vidéo apparaîtra comme sa propre bulle sur le canvas, déplaçable librement.
                    </p>

                    <input ref={cameraInputRef} type="file" accept="image/*,video/*" capture="environment" onChange={handleFileSelected} className="hidden" />
                    <input ref={galleryInputRef} type="file" accept={ACCEPTED} onChange={handleFileSelected} className="hidden" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                </div>
            </LiquidModal>

            {showLibraryPicker && (
                <ReviewPhotoLibraryPicker
                    onSelect={handleLibrarySelect}
                    onClose={() => setShowLibraryPicker(false)}
                />
            )}
        </>
    );
};

export default MediaBubbleImportModal;
