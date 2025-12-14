import { useMemo } from 'react';
import { useStore } from '../store/useStore';

/**
 * useAccountType - Hook pour gérer les permissions selon le type de compte
 * 
 * Types de comptes:
 * - consumer (Amateur) : Gratuit, fonctionnalités de base
 * - influencer_pro : 15.99€/mois, exports avancés
 * - producer : 29.99€/mois, toutes fonctionnalités
 */
export function useAccountType() {
  const { user } = useStore();
  
  const accountType = useMemo(() => {
    return user?.accountType || user?.type || 'consumer';
  }, [user]);

  const isProducer = accountType === 'producer';
  const isInfluencer = accountType === 'influencer_pro';
  const isConsumer = accountType === 'consumer';
  const isPremium = isProducer || isInfluencer;

  // Permissions par fonctionnalité
  const permissions = useMemo(() => ({
    // Sections de review accessibles
    sections: {
      infosGenerales: true,
      genetiques: true,
      culture: isProducer, // PipeLine Culture = Producteur uniquement
      analytics: true,
      visual: true,
      odeurs: true,
      texture: true,
      gouts: true,
      effets: true,
      curing: true,
      experience: true,
    },
    
    // PipeLines
    pipelines: {
      culture: isProducer,
      curing: true,
      separation: isPremium,
      extraction: isPremium,
      recipe: true,
      configurable: isProducer, // PipeLines entièrement configurables
    },
    
    // Export Maker
    export: {
      formats: {
        png: true,
        jpeg: true,
        pdf: true,
        svg: isPremium,
        csv: isProducer,
        json: isProducer,
        html: isProducer,
      },
      quality: {
        standard: true,
        high: isPremium, // 300dpi
      },
      templates: {
        compact: true,
        detailed: true,
        complete: true,
        influencer: isInfluencer || isProducer,
        custom: isProducer,
      },
      features: {
        watermark: isPremium,
        dragDrop: isPremium,
        customFonts: isProducer,
        formatChoice: isPremium, // Choix libre du format
      },
    },
    
    // Bibliothèque
    library: {
      reviews: true,
      templates: isPremium,
      watermarks: isPremium,
      savedData: true,
    },
    
    // Galerie publique
    gallery: {
      view: true,
      publish: isPremium,
      like: true,
      comment: true,
      share: true,
    },
    
    // Génétique (arbres généalogiques)
    genetics: {
      canva: isProducer,
      library: true,
    },
    
    // Statistiques
    stats: {
      basic: true,
      advanced: isPremium,
      production: isProducer,
    },
  }), [isProducer, isInfluencer, isPremium]);

  // Vérifier si une fonctionnalité est accessible
  const canAccess = (feature) => {
    const parts = feature.split('.');
    let current = permissions;
    for (const part of parts) {
      if (current[part] === undefined) return false;
      current = current[part];
    }
    return current === true;
  };

  // Message pour upgrade
  const getUpgradeMessage = (feature) => {
    if (isProducer) return null;
    
    const producerFeatures = [
      'pipelines.culture',
      'pipelines.configurable',
      'export.formats.csv',
      'export.formats.json',
      'export.formats.html',
      'export.templates.custom',
      'export.features.customFonts',
      'genetics.canva',
      'stats.production',
    ];
    
    if (producerFeatures.includes(feature)) {
      return {
        title: 'Fonctionnalité Producteur',
        message: 'Cette fonctionnalité nécessite un compte Producteur (29.99€/mois)',
        upgradeType: 'producer',
      };
    }
    
    if (isConsumer) {
      return {
        title: 'Fonctionnalité Premium',
        message: 'Passez à Influenceur (15.99€/mois) ou Producteur pour accéder à cette fonctionnalité',
        upgradeType: 'influencer_pro',
      };
    }
    
    return null;
  };

  // Informations du compte
  const accountInfo = useMemo(() => ({
    type: accountType,
    name: isProducer ? 'Producteur' : isInfluencer ? 'Influenceur' : 'Amateur',
    price: isProducer ? 29.99 : isInfluencer ? 15.99 : 0,
    isPremium,
    isProducer,
    isInfluencer,
    isConsumer,
  }), [accountType, isPremium, isProducer, isInfluencer, isConsumer]);

  return {
    accountType,
    accountInfo,
    permissions,
    canAccess,
    getUpgradeMessage,
    isProducer,
    isInfluencer,
    isConsumer,
    isPremium,
  };
}

export default useAccountType;
