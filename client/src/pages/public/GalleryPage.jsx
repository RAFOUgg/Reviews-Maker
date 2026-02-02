import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Grid, List, Heart, MessageCircle, Eye, Star,
  Calendar, TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { LiquidCard, LiquidChip, LiquidInput } from '@/components/ui/LiquidUI';

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
 * ReviewCard - Carte de preview pour une review
 */
const ReviewCard = ({ review, onLike, onView }) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked((s) => !s);
    onLike?.(review.id, !isLiked);
  };

  const getTypeIcon = (type) => {
    const types = { flower: '🌸', hash: '🟤', concentrate: '💎', edible: '🍪' };
    return types[type] || '🌿';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={() => onView?.(review.id)}
      className="cursor-pointer group"
    >
      <LiquidCard glow="purple" padding="none">
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          <img
            src={review.imageUrl || '/placeholder-review.jpg'}
            alt={review.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />

          <div className="absolute top-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-sm font-medium flex items-center gap-1">
            <span>{getTypeIcon(review.type)}</span>
            {review.typeName || 'Produit'}
          </div>

          <div className="absolute top-3 right-3 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/30">
            {review.rating?.toFixed(1) || '-'}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <button className="w-full py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">Voir la review</button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-white truncate mb-1">{review.name || 'Sans nom'}</h3>
          <p className="text-sm text-white/50 truncate mb-3">par @{review.author?.username || 'anonyme'}</p>

          <div className="flex items-center justify-between text-sm text-white/60">
            <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'}`}>
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {(review.likes || 0) + (isLiked ? 1 : 0)}
            </button>
            <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{review.comments || 0}</div>
            <div className="flex items-center gap-1"><Eye className="w-4 h-4" />{review.views || 0}</div>
          </div>
        </div>
      </LiquidCard>
    </motion.div>
  );
};

export default function GalleryPage() {
  const navigate = useNavigate();
  const { user } = useStore();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [timePeriod, setTimePeriod] = useState('month');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const mockReviews = Array.from({ length: 12 }, (_, i) => ({
          id: `review-${i}`,
          name: `Purple Haze ${i + 1}`,
          type: ['flower', 'hash', 'concentrate', 'edible'][i % 4],
          typeName: ['Fleur', 'Hash', 'Concentré', 'Comestible'][i % 4],
          rating: (7 + Math.random() * 3),
          imageUrl: `https://picsum.photos/seed/${i}/400/400`,
          author: { username: `grower${i}` },
          likes: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 20),
          views: Math.floor(Math.random() * 500),
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        }));
        setReviews(mockReviews);
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

  const handleViewReview = (id) => navigate(`/reviews/${id}`);
  const handleLike = (id, liked) => console.log('Like:', id, liked);

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
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} onView={handleViewReview} onLike={handleLike} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
