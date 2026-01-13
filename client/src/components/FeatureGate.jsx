import React from 'react';
import { Lock, Star, Zap, Crown } from 'lucide-react';
import { LiquidGlass } from '../ui';

/**
 * FeatureGate - Composant pour restreindre l'accès aux fonctionnalités
 * Affiche un overlay ou un message si l'utilisateur n'a pas le niveau requis
 */
export const FeatureGate = ({ 
  children, 
  hasAccess, 
  upgradeType = 'all', // 'producer', 'influencer_pro', 'all'
  featureName = 'cette fonctionnalité',
  showOverlay = true,
  fallback = null
}) => {
  if (hasAccess) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  const upgradeConfig = {
    producer: {
      title: "Réservé aux Producteurs",
      message: "Cette fonctionnalité avancée est conçue pour les producteurs professionnels.",
      gradient: "from-amber-500 to-orange-600",
      icon: Crown,
      btnText: "Devenir Producteur"
    },
    influencer_pro: {
      title: "Fonctionnalité Pro",
      message: "Améliorez vos reviews avec le compte Influenceur Pro.",
      gradient: " ",
      icon: Star,
      btnText: "Passer Pro"
    },
    all: {
      title: "Compte Premium Requis",
      message: "Cette fonctionnalité nécessite un compte supérieur.",
      gradient: " ",
      icon: Lock,
      btnText: "Voir les offres"
    }
  };

  const config = upgradeConfig[upgradeType] || upgradeConfig.all;
  const Icon = config.icon;

  if (!showOverlay) {
    return null; // Juste cacher sans rien montrer
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 group">
      {/* Contenu flouté en arrière-plan */}
      <div className="filter blur-md opacity-30 pointer-events-none select-none grayscale" aria-hidden="true">
        {children}
      </div>

      {/* Overlay de verrouillage */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <LiquidGlass variant="card" glow={true} className="p-6 text-center max-w-sm mx-4 rounded-xl">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${config.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">{config.title}</h3>
          <p className="text-gray-300 mb-6 text-sm">
            {featureName ? `L'accès à ${featureName} est restreint.` : config.message}
            <br/>
            Passer à la vitesse supérieure !
          </p>
          
          <button className={`px-6 py-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white font-bold hover:brightness-110 transition-all shadow-lg`}>
            {config.btnText}
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
};

export default FeatureGate;
