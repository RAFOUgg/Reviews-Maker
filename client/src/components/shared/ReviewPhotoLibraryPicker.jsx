/**
 * ReviewPhotoLibraryPicker Component
 *
 * Modale de sélection d'une photo déjà présente dans une des reviews de l'utilisateur (au lieu
 * d'en envoyer une nouvelle) — réutilise `/api/reviews/my` (déjà chargé par la Bibliothèque),
 * pas de nouvel endpoint : chaque review y expose déjà `images` (flower) ou son fallback
 * hash/concentrate/edible (cf. reviewFormatter.js). Sélectionner une photo ici ne l'upload pas
 * à nouveau, elle référence juste la même URL — donc pas de doublon sur le disque.
 */

import React, { useEffect, useState } from 'react';
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI';
import { X, Search } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const ReviewPhotoLibraryPicker = ({ onSelect, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch('/api/reviews/my', { credentials: 'include' });
                if (!res.ok) throw new Error('Impossible de charger vos fiches techniques');
                const data = await res.json();
                if (!cancelled) setReviews(Array.isArray(data) ? data : []);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Erreur de chargement');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const normalizedQuery = query.trim().toLowerCase();
    const photos = reviews
        .filter(r => !normalizedQuery || (r.cultivars || r.name || '').toLowerCase().includes(normalizedQuery))
        .flatMap(review => (Array.isArray(review.images) ? review.images : []).map((img, index) => ({
            key: `${review.id}-${index}`,
            url: getImageUrl(img),
            reviewLabel: review.cultivars || review.name || 'Sans nom'
        })));

    return (
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title="Choisir depuis ma bibliothèque"
            size="lg"
            glowColor="amber"
            footer={
                <LiquidButton variant="ghost" onClick={onClose} icon={X} className="w-full">
                    Fermer
                </LiquidButton>
            }
        >
            <div className="space-y-3">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Filtrer par nom de fiche..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-white/30"
                    />
                </div>

                {loading && <p className="text-sm text-white/40 text-center py-6">Chargement...</p>}
                {error && <p className="text-sm text-red-400 text-center py-6">{error}</p>}
                {!loading && !error && photos.length === 0 && (
                    <p className="text-sm text-white/40 text-center py-6">Aucune photo trouvée dans vos fiches techniques.</p>
                )}

                {!loading && !error && photos.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-96 overflow-y-auto pr-1">
                        {photos.map(photo => (
                            <button
                                key={photo.key}
                                type="button"
                                onClick={() => { onSelect(photo.url); onClose(); }}
                                title={photo.reviewLabel}
                                className="aspect-square rounded-xl border border-white/10 bg-black/30 overflow-hidden hover:border-white/40 transition-colors"
                            >
                                <img src={photo.url} alt={photo.reviewLabel} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </LiquidModal>
    );
};

export default ReviewPhotoLibraryPicker;
