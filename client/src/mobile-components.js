/**
 * Index des composants mobiles optimisés
 * 
 * Import facile des sections et composants adaptés au mobile
 */

// Layout et structure
export { default as MobileReviewLayout, MobileSectionContainer, MobileFormRow, CollapsibleMobileSection, MobileFormGroup, MobileActionBar } from '@/components/layout/MobileReviewLayout';

// Composants UI responsives
export { 
    ResponsiveSection,
    ResponsiveGrid,
    ResponsiveFormField,
    ResponsiveInput,
    ResponsiveSelect,
    ResponsiveButton,
    ResponsiveCard,
    ResponsiveSlider
} from '@/components/ui/ResponsiveSectionComponents';

// Hooks
export { default as useResponsiveLayout } from '@/hooks/useResponsiveLayout';
export { default as useMobileFormSection } from '@/hooks/useMobileFormSection';

// Pipeline (Flower)
export { default as MobilePipelineOptimized } from '@/components/pipeline/MobilePipelineOptimized';
export { default as MobilePipelineCellEditor } from '@/components/pipeline/MobilePipelineCellEditor';

// Sections optimisées (Flower - CreateFlowerReview)
export { default as InfosGeneralesOptimized } from '@/pages/CreateFlowerReview/sections/InfosGeneralesOptimized';
export { default as OdeursOptimized } from '@/pages/CreateFlowerReview/sections/OdeursOptimized';
export { default as VisuelTechniqueOptimized } from '@/pages/CreateFlowerReview/sections/VisuelTechniqueOptimized';
export { default as GoutsOptimized } from '@/pages/CreateFlowerReview/sections/GoutsOptimized';
export { default as EffetsOptimized } from '@/pages/CreateFlowerReview/sections/EffetsOptimized';

// Note: TextureOptimized, GenetiquesOptimized, RecolteOptimized, CulturePipelineOptimized, CuringPipelineOptimized à ajouter
