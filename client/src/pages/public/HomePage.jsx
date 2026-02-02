import { useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../components/shared/ToastContainer'
import { LiquidButton, LiquidCard } from '@/components/ui/LiquidUI'
import HeroSection from '../../components/shared/ui-helpers/HeroSection'
import ProductTypeCards from '../../components/shared/ui-helpers/ProductTypeCards'
import { Dna } from 'lucide-react'

export default function HomePage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user, isAuthenticated } = useStore()
    const { hasFeature } = usePermissions()

    const handleCreateReview = (type) => {
        if (!isAuthenticated) {
            toast.warning('Vous devez être connecté pour créer une review')
            return
        }

        // Mapping des noms français vers les routes anglaises
        const typeMap = {
            'Fleur': 'flower',
            'Hash': 'hash',
            'Concentré': 'concentrate',
            'Comestible': 'edible'
        }

        const route = typeMap[type] || type.toLowerCase()
        navigate(`/create/${route}`)
    }

    const handleNavigateToPhenoHunt = () => {
        navigate('/phenohunt');
    };

    return (
        <div className="min-h-screen relative">
            <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-10">
                {/* Hero Section */}
                <LiquidCard glow="purple" padding="lg" className="overflow-hidden">
                    <HeroSection user={user} isAuthenticated={isAuthenticated} title="Terpologie" />
                </LiquidCard>

                {/* Create Review Section */}
                <LiquidCard glow="cyan" padding="md">
                    <ProductTypeCards
                        isAuthenticated={isAuthenticated}
                        onCreateReview={handleCreateReview}
                    />
                </LiquidCard>

                {/* PhénoHunt Navigation Button - Producer only */}
                {hasFeature('phenohunt') && (
                    <div className="text-center pt-8">
                        <LiquidButton
                            onClick={handleNavigateToPhenoHunt}
                            variant="secondary"
                            size="lg"
                            glow="cyan"
                            icon={Dna}
                        >
                            Accéder à PhénoHunt
                        </LiquidButton>
                    </div>
                )}
            </div>
        </div>
    )
}
