# 📝 EXEMPLE INTÉGRATION - CreateFlowerReview avec corrections

```jsx
import React, { useState } from 'react';
import { ResponsiveCreateReviewLayout } from '@/components/ResponsiveCreateReviewLayout';
import MobilePipelineViewV2 from '@/components/pipeline/MobilePipelineViewV2';
import { MobilePhotoGallery } from '@/components/MobilePhotoGallery';

const CreateFlowerReview = () => {
    const [currentSection, setCurrentSection] = useState(0);
    const [photos, setPhotos] = useState([]);
    const [culturePipeline, setCulturePipeline] = useState({});
    const [curingPipeline, setCuringPipeline] = useState({});

    // Émojis pour chaque section
    const sectionEmojis = [
        '📋', // Informations générales
        '🌱', // Génétiques
        '🌿', // Culture
        '👁️', // Visuel & Technique
        '👃', // Odeurs
        '🤚', // Texture
        '😋', // Goûts
        '💥', // Effets
        '🔥', // Curing
    ];

    const sections = [
        {
            id: 'infos',
            title: 'Informations générales',
            component: <InfosGenerales photos={photos} onPhotosChange={setPhotos} />
        },
        {
            id: 'genetics',
            title: 'Génétiques',
            component: <GeneticsSection />
        },
        {
            id: 'culture',
            title: 'Culture',
            component: (
                <MobilePipelineViewV2
                    cells={culturePipeline}
                    config={{
                        intervalType: 'phases',
                        duration: 12,
                        startDate: new Date()
                    }}
                    cellIndices={Object.keys(culturePipeline)}
                    onCellChange={setCulturePipeline}
                    title="Pipeline Culture"
                />
            )
        },
        {
            id: 'visuel',
            title: 'Visuel & Technique',
            component: <VisuelTechniqueSection />
        },
        {
            id: 'odeurs',
            title: 'Odeurs',
            component: <OdeursSection />
        },
        {
            id: 'texture',
            title: 'Texture',
            component: <TextureSection />
        },
        {
            id: 'gouts',
            title: 'Goûts',
            component: <GoutsSection />
        },
        {
            id: 'effets',
            title: 'Effets ressentis',
            component: <EffetsSection />
        },
        {
            id: 'curing',
            title: 'Curing & Maturation',
            component: (
                <MobilePipelineViewV2
                    cells={curingPipeline}
                    config={{
                        intervalType: 'weeks',
                        duration: 4,
                        startDate: new Date()
                    }}
                    cellIndices={Object.keys(curingPipeline)}
                    onCellChange={setCuringPipeline}
                    title="Pipeline Curing"
                />
            )
        },
    ];

    return (
        <ResponsiveCreateReviewLayout
            currentSection={currentSection}
            totalSections={sections.length}
            onSectionChange={setCurrentSection}
            title="Créer une review Fleur"
            subtitle="Documentez votre variété en détail"
            sectionEmojis={sectionEmojis}
            showProgress
        >
            {sections[currentSection].component}
        </ResponsiveCreateReviewLayout>
    );
};

// Section Infos Générales avec galerie photos
const InfosGenerales = ({ photos, onPhotosChange }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-100 mb-4">Informations générales</h2>
                
                {/* Photos */}
                <MobilePhotoGallery
                    photos={photos}
                    onAddPhoto={(file) => onPhotosChange([...photos, file])}
                    onRemovePhoto={(idx) => onPhotosChange(photos.filter((_, i) => i !== idx))}
                    maxPhotos={4}
                />
            </div>

            {/* Autres champs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nom commercial *
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Marque – Cultivar"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                    />
                </div>
            </div>
        </div>
    );
};

// Placeholder sections
const GeneticsSection = () => <div className="text-gray-300">Sections Génétiques...</div>;
const VisuelTechniqueSection = () => <div className="text-gray-300">Sections Visuel & Technique...</div>;
const OdeursSection = () => <div className="text-gray-300">Sections Odeurs...</div>;
const TextureSection = () => <div className="text-gray-300">Sections Texture...</div>;
const GoutsSection = () => <div className="text-gray-300">Sections Goûts...</div>;
const EffetsSection = () => <div className="text-gray-300">Sections Effets...</div>;

export default CreateFlowerReview;
```

---

## 🎯 KEY CHANGES

1. **sectionEmojis Array**
   - Correspond à chaque section
   - Utilisé par ResponsiveCreateReviewLayout pour carousel

2. **MobilePipelineViewV2**
   - Remplace ancienne pipeline
   - Config + cellules passées en props
   - onCellChange pour updates

3. **Boutons Prev/Next**
   - Gérés automatiquement par ResponsiveCreateReviewLayout
   - Toujours visibles en footer sticky

4. **MobilePhotoGallery**
   - Intégrée dans InfosGenerales
   - Carousel horizontal swipeable

---

## ✅ À VÉRIFIER

- [ ] Émojis affichent en carousel sur mobile
- [ ] Boutons Prev/Next toujours visibles
- [ ] Pipeline scrollable horizontalement
- [ ] Click sur cellule pipeline ouvre modal
- [ ] Photos en carousel avec dots
- [ ] Responsive sur téléphone réel

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile (< 768px):
├─ Full-width content
├─ Emoji carousel (3 visible)
├─ Footer sticky buttons
└─ Bottom sheet modals

Tablet (768px - 1024px):
├─ Optimized spacing
├─ Emoji carousel (4-5 visible)
└─ Normal modals

Desktop (> 1024px):
├─ Max-width container
├─ All emojis visible
└─ Side-by-side layouts
```

---

**Créé par:** GitHub Copilot  
**Date:** 08 Janvier 2026
