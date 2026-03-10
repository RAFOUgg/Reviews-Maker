/**
 * GalleryReviewCard — Standalone interactive HTML review renderer for public gallery
 * 
 * Unlike InteractiveReviewCard (which reads from orchardStore), this component
 * receives reviewData and orchardConfig as props, making it suitable for the
 * public gallery and detail pages where the zustand store isn't populated.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    asArray, extractLabel, formatRating, formatDate,
    extractCategoryRatings, extractPipelines
} from '../../utils/orchardHelpers';
import InteractivePipelineViewer from './InteractivePipelineViewer';
import { Star, ChevronDown, Eye, ImageIcon, X, ChevronLeft, ChevronRight, Leaf } from 'lucide-react';

function Section({ title, icon, children, defaultOpen = true, badge }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl border border-white/10 overflow-hidden transition-colors hover:border-white/15">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.04] hover:bg-white/[0.07] transition-colors"
            >
                <div className="flex items-center gap-2.5">
                    <span className="text-lg">{icon}</span>
                    <span className="text-sm font-semibold text-white">{title}</span>
                    {badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/25 text-purple-300 font-medium">
                            {badge}
                        </span>
                    )}
                </div>
                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-white/40" />
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 py-3 space-y-3">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Stars({ value, max = 10 }) {
    const stars = 5;
    const filled = Math.round((value / max) * stars);
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: stars }, (_, i) => (
                <Star
                    key={i}
                    className={`w-4 h-4 ${i < filled ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'}`}
                />
            ))}
            <span className="ml-1.5 text-sm font-bold text-white">{value}/10</span>
        </div>
    );
}

function ScoreBar({ label, value }) {
    const percentage = Math.min(100, (value / 10) * 100);
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-white/60 w-28 truncate">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                        background: percentage > 70
                            ? 'linear-gradient(90deg, #22c55e, #10b981)'
                            : percentage > 40
                                ? 'linear-gradient(90deg, #eab308, #f59e0b)'
                                : 'linear-gradient(90deg, #ef4444, #f87171)'
                    }}
                />
            </div>
            <span className="text-xs font-semibold text-white/80 w-8 text-right">{value}</span>
        </div>
    );
}

function TagPill({ label, color = 'purple' }) {
    const colorMap = {
        purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        cyan: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };
    return (
        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${colorMap[color] || colorMap.purple}`}>
            {label}
        </span>
    );
}

function CategoryCard({ cat }) {
    const [expanded, setExpanded] = useState(false);
    const iconMap = { visual: '👁️', smell: '👃', texture: '✋', taste: '👅', effects: '⚡' };

    return (
        <div
            className={`rounded-xl border transition-all cursor-pointer ${expanded ? 'bg-white/[0.06] border-purple-500/30' : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'}`}
            onClick={() => cat.subDetails && setExpanded(!expanded)}
        >
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                    <span className="text-base">{iconMap[cat.key] || '📊'}</span>
                    <span className="text-sm font-medium text-white">{cat.label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Stars value={cat.value} />
                    {cat.subDetails && (
                        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
                            <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                        </motion.div>
                    )}
                </div>
            </div>
            <AnimatePresence>
                {expanded && cat.subDetails && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-3 pb-3 space-y-1.5">
                            {cat.subDetails.map(sub => (
                                <ScoreBar key={sub.key} label={sub.label} value={sub.value} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function GalleryReviewCard({ reviewData, orchardConfig }) {
    const config = orchardConfig || {};
    const cm = config?.contentModules || {};
    const typo = config?.typography || {};

    const categoryRatings = useMemo(() => extractCategoryRatings(reviewData?.categoryRatings, reviewData), [reviewData]);
    const pipelines = useMemo(() => extractPipelines(reviewData), [reviewData]);
    const aromas = useMemo(() => asArray(reviewData?.aromas).map(extractLabel).filter(Boolean), [reviewData]);
    const secondaryAromas = useMemo(() => asArray(reviewData?.secondaryAromas).map(extractLabel).filter(Boolean), [reviewData]);
    const effects = useMemo(() => asArray(reviewData?.effects).map(extractLabel).filter(Boolean), [reviewData]);
    const terpenes = useMemo(() => asArray(reviewData?.terpenes).map(extractLabel).filter(Boolean), [reviewData]);
    const cultivars = useMemo(() => asArray(reviewData?.cultivarsList).map(extractLabel).filter(Boolean), [reviewData]);
    const dryPuffNotes = useMemo(() => asArray(reviewData?.dryPuffNotes).map(extractLabel).filter(Boolean), [reviewData]);
    const inhalationNotes = useMemo(() => asArray(reviewData?.inhalationNotes).map(extractLabel).filter(Boolean), [reviewData]);
    const exhalationNotes = useMemo(() => asArray(reviewData?.exhalationNotes).map(extractLabel).filter(Boolean), [reviewData]);

    if (!reviewData) return null;

    const title = reviewData.title || reviewData.holderName || reviewData.productName || 'Sans titre';
    const rating = parseFloat(reviewData.rating || reviewData.overallRating || reviewData.note || 0);
    const author = reviewData.author || reviewData.ownerName || 'Anonyme';
    const authorStr = typeof author === 'object' ? (author.username || author.name || 'Anonyme') : author;
    const type = reviewData.type || reviewData.category || '';
    const typeLabels = { flower: 'Fleurs', hash: 'Hash', concentrate: 'Concentré', edible: 'Comestible' };
    const mainImageUrl = reviewData.mainImageUrl || reviewData.imageUrl;
    const images = asArray(reviewData.images);

    const isVisible = (key) => {
        if (!Object.keys(cm).length) return true; // No config = show all
        return cm[key] !== false;
    };

    return (
        <div className="space-y-4" style={{ fontFamily: typo.fontFamily || 'Inter, system-ui, sans-serif' }}>
            {/* Header */}
            <div className="space-y-3">
                {type && (
                    <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase tracking-wider">
                        {typeLabels[type] || type}
                    </span>
                )}
                <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                    {authorStr && <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> {authorStr}</span>}
                    {reviewData.createdAt && <span>· {formatDate(reviewData.createdAt)}</span>}
                    {reviewData.farm && <span>· 🌾 {reviewData.farm}</span>}
                    {reviewData.hashmaker && <span>· ⚗️ {reviewData.hashmaker}</span>}
                </div>
                {cultivars.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {cultivars.map((c, i) => <TagPill key={i} label={c} color="green" />)}
                    </div>
                )}
                {rating > 0 && (
                    <div className="flex items-center gap-3 py-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border border-yellow-500/30 flex items-center justify-center">
                            <span className="text-xl font-black text-yellow-400">{rating.toFixed(1)}</span>
                        </div>
                        <Stars value={rating} />
                    </div>
                )}
            </div>

            {/* Image */}
            {mainImageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/10">
                    <img src={mainImageUrl} alt={title} className="w-full aspect-video object-cover" />
                </div>
            )}

            {/* Category Ratings */}
            {isVisible('categoryRatings') && categoryRatings.length > 0 && (
                <Section title="Notes par catégorie" icon="📊" badge={`${categoryRatings.length} cat.`}>
                    <div className="space-y-2">
                        {categoryRatings.map(cat => <CategoryCard key={cat.key} cat={cat} />)}
                    </div>
                </Section>
            )}

            {/* Aromas */}
            {isVisible('aromas') && (aromas.length > 0 || secondaryAromas.length > 0) && (
                <Section title="Arômes" icon="👃" badge={`${aromas.length + secondaryAromas.length}`}>
                    {aromas.length > 0 && (
                        <div>
                            <span className="text-xs text-white/40 mb-1.5 block">Notes dominantes</span>
                            <div className="flex flex-wrap gap-1.5">{aromas.map((a, i) => <TagPill key={i} label={a} color="pink" />)}</div>
                        </div>
                    )}
                    {secondaryAromas.length > 0 && (
                        <div>
                            <span className="text-xs text-white/40 mb-1.5 block">Notes secondaires</span>
                            <div className="flex flex-wrap gap-1.5">{secondaryAromas.map((a, i) => <TagPill key={i} label={a} color="purple" />)}</div>
                        </div>
                    )}
                </Section>
            )}

            {/* Terpenes */}
            {isVisible('terpenes') && terpenes.length > 0 && (
                <Section title="Terpènes" icon="🧬" badge={`${terpenes.length}`}>
                    <div className="flex flex-wrap gap-1.5">{terpenes.map((t, i) => <TagPill key={i} label={t} color="cyan" />)}</div>
                </Section>
            )}

            {/* Tastes */}
            {(dryPuffNotes.length > 0 || inhalationNotes.length > 0 || exhalationNotes.length > 0) && (
                <Section title="Goûts" icon="👅">
                    {dryPuffNotes.length > 0 && (
                        <div>
                            <span className="text-xs text-white/40 mb-1.5 block">Tirage à sec</span>
                            <div className="flex flex-wrap gap-1.5">{dryPuffNotes.map((t, i) => <TagPill key={i} label={t} color="amber" />)}</div>
                        </div>
                    )}
                    {inhalationNotes.length > 0 && (
                        <div>
                            <span className="text-xs text-white/40 mb-1.5 block">Inhalation</span>
                            <div className="flex flex-wrap gap-1.5">{inhalationNotes.map((t, i) => <TagPill key={i} label={t} color="blue" />)}</div>
                        </div>
                    )}
                    {exhalationNotes.length > 0 && (
                        <div>
                            <span className="text-xs text-white/40 mb-1.5 block">Expiration</span>
                            <div className="flex flex-wrap gap-1.5">{exhalationNotes.map((t, i) => <TagPill key={i} label={t} color="green" />)}</div>
                        </div>
                    )}
                </Section>
            )}

            {/* Effects */}
            {isVisible('effects') && effects.length > 0 && (
                <Section title="Effets ressentis" icon="⚡" badge={`${effects.length}`}>
                    <div className="flex flex-wrap gap-1.5">{effects.map((e, i) => <TagPill key={i} label={e} color="purple" />)}</div>
                </Section>
            )}

            {/* Pipelines */}
            {pipelines.length > 0 && (
                <Section title="Pipelines" icon="⚗️" badge={`${pipelines.length}`}>
                    <div className="space-y-4">
                        {pipelines.map((pl, i) => (
                            <InteractivePipelineViewer
                                key={i}
                                pipeline={pl}
                                pipelineName={pl.name || pl.label || `Pipeline ${i + 1}`}
                                pipelineIcon={pl.icon || '⚗️'}
                                config={config}
                            />
                        ))}
                    </div>
                </Section>
            )}

            {/* Description */}
            {reviewData.description && (
                <Section title="Description" icon="📝" defaultOpen={false}>
                    <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{reviewData.description}</p>
                </Section>
            )}
        </div>
    );
}
