import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewsService } from '../../services/apiService';
import {
  Search, Grid, List, Heart, MessageCircle, Eye, Star,
  Calendar, TrendingUp, MoreVertical, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { LiquidCard, LiquidChip, LiquidInput, LiquidButton } from '@/components/ui/LiquidUI';
import GalleryReviewCard from '../../components/gallery/GalleryReviewCard';

// Types de produits avec icônes
const PRODUCT_TYPES = [
  { id: 'all', name: 'Tous', icon: '🌿' },
  { id: 'flower', name: 'Fleurs', icon: '🌸' },
  { id: 'hash', name: 'Hash', icon: '🟤' },
  { id: 'concentrate', name: 'Concentrés', icon: '💎' },
  { id: 'edible', name: 'Comestibles', icon: '🍪' },
];

// Options de tri
const SORT_OPTIONS = [
  { id: 'recent', name: 'Plus récents', icon: Calendar },
  { id: 'popular', name: 'Plus populaires', icon: TrendingUp },
  { id: 'rated', name: 'Mieux notés', icon: Star },
  { id: 'views', name: 'Plus vus', icon: Eye },
];

// Périodes pour classements
const TIME_PERIODS = [
  { id: 'week', name: 'Cette semaine' },
  { id: 'month', name: 'Ce mois' },
  { id: 'year', name: 'Cette année' },
  { id: 'all', name: 'Tout temps' },
];

/**
 * InteractiveGallery - Enhanced gallery with context menu, modals, and templates
 */
export default function GalleryPage() {
  const navigate = useNavigate();
  const { user } = useStore();

  // Existing states
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [timePeriod, setTimePeriod] = useState('month');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // New interactive states
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // Context menu handler
  const handleContextMenu = (e, review) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      review
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleShowDetails = (review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
    closeContextMenu();
  };

  const handleSelectTemplate = (review) => {
    setSelectedReview(review);
    setShowTemplateSelector(true);
    closeContextMenu();
  };

  const handleViewReview = (reviewId) => {
    navigate(`/reviews/${reviewId}`);
  };

  const handleLike = async (reviewId, liked) => {
    // TODO: Implement like functionality
    console.log('Like review:', reviewId, liked);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const res = await reviewsService.getAll({ type: selectedType === 'all' ? undefined : selectedType });
        if (res?.reviews) setReviews(res.reviews);
        else if (Array.isArray(res)) setReviews(res);
      } catch (error) {
        console.error('Erreur chargement reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [selectedType, sortBy, timePeriod]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.name?.toLowerCase().includes(query) ||
        r.author?.username?.toLowerCase().includes(query)
      );
    }
    if (selectedType !== 'all') {
      result = result.filter(r => r.type === selectedType);
    }
    switch (sortBy) {
      case 'popular': result.sort((a, b) => b.likes - a.likes); break;
      case 'rated': result.sort((a, b) => b.rating - a.rating); break;
      case 'views': result.sort((a, b) => b.views - a.views); break;
      default: result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return result;
  }, [reviews, searchQuery, selectedType, sortBy]);

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
            🌿 Galerie Publique
          </h1>
          <p className="text-xl text-white/60">
            Découvrez les meilleures reviews de la communauté
          </p>
        </div>

        <LiquidCard glow="purple" padding="md" className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une review..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {PRODUCT_TYPES.map((type) => (
                <LiquidChip
                  key={type.id}
                  active={selectedType === type.id}
                  onClick={() => setSelectedType(type.id)}
                  color="purple"
                >
                  {type.icon} {type.name}
                </LiquidChip>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#1a1a2e]">{opt.name}</option>
                ))}
              </select>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </LiquidCard>

        {loading ? (
          <div className="text-center text-white/50 py-16">Chargement...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 text-white/50">Aucune review trouvée</div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="relative group"
                onContextMenu={(e) => handleContextMenu(e, review)}
              >
                <GalleryReviewCard
                  reviewData={review}
                  orchardConfig={review.orchardPreset || {}}
                  compact={viewMode === 'grid'}
                  onView={() => handleViewReview(review.id)}
                  showInteractiveElements={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Context Menu */}
        <AnimatePresence>
          {contextMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={closeContextMenu}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed z-30 bg-[#1a1a2e] border border-white/15 rounded-xl shadow-2xl py-2 min-w-48"
                style={{
                  left: contextMenu.x,
                  top: contextMenu.y,
                  transform: 'translate(-50%, 0)'
                }}
              >
                <button
                  onClick={() => handleShowDetails(contextMenu.review)}
                  className="w-full px-4 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Eye className="w-4 h-4" />
                  Voir les détails complets
                </button>

                <button
                  onClick={() => handleSelectTemplate(contextMenu.review)}
                  className="w-full px-4 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Grid className="w-4 h-4" />
                  Exporter avec template
                </button>

                <div className="h-px bg-white/10 my-1 mx-2" />

                <button
                  onClick={() => {
                    navigator.share?.({
                      title: contextMenu.review.name,
                      url: window.location.origin + `/reviews/${contextMenu.review.id}`
                    });
                    closeContextMenu();
                  }}
                  className="w-full px-4 py-2 text-left text-white/80 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <ExternalLink className="w-4 h-4" />
                  Partager
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedReview && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a2e] border border-white/15 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">
                    {selectedReview.name || 'Review détaillée'}
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                  <GalleryReviewCard
                    reviewData={selectedReview}
                    orchardConfig={selectedReview.orchardPreset || {}}
                    compact={false}
                    fullDetails={true}
                    showInteractiveElements={true}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
