import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ImageOff, Film } from 'lucide-react';
import { extractReviewCoverMedia, fetchReviewFilesFor } from '../../utils/reviewFilesAggregator';
import { normalizePageTemplateType } from '../../store/exportMakerPagesStore';

// Cadences de défilement. Au repos on ne montre QUE les médias de la section 1 (produit fini),
// lentement pour ne pas transformer la grille en sapin de Noël. Au survol on parcourt tous les
// médias de la review (section 1 + médias attachés aux cellules de pipeline), plus vite.
const REST_INTERVAL_MS = 3200;
const HOVER_INTERVAL_MS = 1300;
// Une vidéo avance à sa fin réelle (`onEnded`) mais jamais au-delà de ce plafond : un clip de
// 3 minutes bloquerait sinon le défilement sur une seule vignette.
const VIDEO_MAX_MS = 5000;

// Cache module : une review déjà survolée une fois ne redéclenche pas de requête (la galerie
// remonte/démonte ses cartes au filtrage et au tri).
const fullMediaCache = new Map();

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
    useEffect(() => {
        const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        if (!mq) return;
        const onChange = (e) => setReduced(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    return reduced;
}

// Le défilement au repos ne tourne que pour les cartes réellement à l'écran — une galerie peut
// afficher des dizaines de cartes, chacune avec son timer et ses décodages d'image.
function useIsOnScreen(ref) {
    const [onScreen, setOnScreen] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => setOnScreen(entry.isIntersecting),
            { rootMargin: '100px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [ref]);
    return onScreen;
}

function formatDate(value) {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Couverture d'une carte de galerie : les photos/vidéos du produit fini (section 1 « Informations
 * générales »). Au survol, la couverture parcourt TOUS les médias de la review, puis revient aux
 * médias de la section 1 dès que le curseur sort.
 *
 * Les médias de pipeline ne sont pas dans la liste `/api/reviews` (payload volontairement léger) :
 * ils sont chargés paresseusement au premier survol via l'agrégateur déjà utilisé par le sélecteur
 * de médias du canvas Chaîne de production, jamais réimplémenté ici.
 */
export default function ReviewCoverMedia({ review }) {
    const containerRef = useRef(null);
    const reducedMotion = usePrefersReducedMotion();
    const onScreen = useIsOnScreen(containerRef);

    const [hovering, setHovering] = useState(false);
    const [index, setIndex] = useState(0);
    const [failed, setFailed] = useState(() => new Set());
    const [fullMedia, setFullMedia] = useState(() => fullMediaCache.get(review?.id) || null);

    const baseMedia = useMemo(() => extractReviewCoverMedia(review), [review]);

    const playable = useCallback(
        (list) => list.filter((m) => m?.url && !failed.has(m.url)),
        [failed]
    );

    const activeMedia = useMemo(() => {
        const base = playable(baseMedia);
        if (!hovering || !fullMedia?.length) return base;
        const full = playable(fullMedia);
        return full.length ? full : base;
    }, [hovering, fullMedia, baseMedia, playable]);

    const count = activeMedia.length;
    const safeIndex = count ? index % count : 0;
    const current = count ? activeMedia[safeIndex] : null;

    const advanceFrom = useCallback((from) => {
        setIndex((i) => (i === from ? i + 1 : i));
    }, []);

    // Un seul minuteur pilote le défilement, quel que soit l'état (repos/survol, photo/vidéo).
    useEffect(() => {
        if (count <= 1) return;
        if (!hovering && (!onScreen || reducedMotion)) return;

        const delay = current?.type === 'video'
            ? VIDEO_MAX_MS
            : (hovering ? HOVER_INTERVAL_MS : REST_INTERVAL_MS);

        const timer = setTimeout(() => advanceFrom(index), delay);
        return () => clearTimeout(timer);
    }, [count, hovering, onScreen, reducedMotion, current, index, advanceFrom]);

    const handleEnter = useCallback(() => {
        setHovering(true);
        setIndex(0);
        if (fullMedia !== null || !review?.id) return;

        const cached = fullMediaCache.get(review.id);
        if (cached) {
            setFullMedia(cached);
            return;
        }
        fetchReviewFilesFor([review.id]).then((files) => {
            const media = files.filter((f) => f.type === 'photo' || f.type === 'video');
            fullMediaCache.set(review.id, media);
            setFullMedia(media);
        }).catch(() => {
            // Échec réseau : on garde le défilement des médias de la section 1, déjà chargés.
            fullMediaCache.set(review.id, []);
            setFullMedia([]);
        });
    }, [fullMedia, review?.id]);

    const handleLeave = useCallback(() => {
        setHovering(false);
        setIndex(0);
    }, []);

    const markFailed = useCallback((url) => {
        setFailed((prev) => {
            if (prev.has(url)) return prev;
            const next = new Set(prev);
            next.add(url);
            return next;
        });
    }, []);

    const name = review?.holderName || review?.nomCommercial || review?.name || 'Sans nom';
    const typeLabel = normalizePageTemplateType(review?.type);
    const author = review?.author?.username || review?.ownerName;
    const date = formatDate(review?.createdAt);
    const rating = typeof review?.computedOverall === 'number' ? review.computedOverall : null;
    // Au survol le compteur reflète l'ensemble des médias parcourus, au repos les seuls 1-4 de la
    // section 1 — c'est la même liste que celle réellement affichée, jamais un total théorique.
    const extraCount = hovering && fullMedia?.length ? Math.max(0, count - playable(baseMedia).length) : 0;

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <AnimatePresence initial={false}>
                {current ? (
                    <motion.div
                        key={`${current.url}-${safeIndex}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute inset-0"
                    >
                        {current.type === 'video' ? (
                            <video
                                src={current.url}
                                className="w-full h-full object-cover"
                                autoPlay
                                muted
                                playsInline
                                onEnded={() => advanceFrom(index)}
                                onError={() => markFailed(current.url)}
                            />
                        ) : (
                            <img
                                src={current.url}
                                alt={name}
                                loading="lazy"
                                className="w-full h-full object-cover"
                                onError={() => markFailed(current.url)}
                            />
                        )}
                    </motion.div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/25">
                        <ImageOff className="w-8 h-8" />
                        <span className="text-xs">Aucune photo</span>
                    </div>
                )}
            </AnimatePresence>

            {/* Pastilles de position : le nombre de médias réellement dans le cycle en cours. */}
            {count > 1 && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
                    {current?.type === 'video' && <Film className="w-3 h-3 text-white/70" />}
                    {activeMedia.map((m, i) => (
                        <span
                            key={m.key || `${m.url}-${i}`}
                            className={`block rounded-full transition-all duration-300 ${i === safeIndex ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'
                                }`}
                        />
                    ))}
                </div>
            )}

            {extraCount > 0 && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-purple-500/25 backdrop-blur-md border border-purple-400/30 text-[10px] font-semibold text-purple-100">
                    +{extraCount} média{extraCount > 1 ? 's' : ''} de traçabilité
                </div>
            )}

            {/* Bandeau d'identification permanent — la galerie doit rester lisible sans survol. */}
            <div className="absolute inset-x-0 bottom-0 p-3 pt-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300/90">
                            {typeLabel}
                        </span>
                        <h3 className="text-base font-bold text-white truncate drop-shadow">{name}</h3>
                        <p className="text-xs text-white/60 truncate">
                            {author ? `Par ${author}` : ''}{author && date ? ' · ' : ''}{date || ''}
                        </p>
                    </div>
                    {rating !== null && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 shrink-0">
                            <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                            <span className="text-xs font-bold text-white">{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
