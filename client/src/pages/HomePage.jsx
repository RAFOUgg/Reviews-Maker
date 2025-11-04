import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

export default function HomePage() {
    const { user, isAuthenticated } = useStore()
    const [reviews, setReviews] = useState([])

    useEffect(() => {
        // Mock data
        setReviews([
            {
                id: 1,
                holderName: 'Blue Dream',
                type: 'Fleur',
                note: 8.5,
                description: 'Une variété incroyable avec des arômes fruités et terreux. Parfait pour la journée.',
                author: 'RAFOUgg',
            },
            {
                id: 2,
                holderName: 'Granddaddy Purple',
                type: 'Fleur',
                note: 9.0,
                description: 'Relaxation profonde et saveurs sucrées de raisin. Idéal pour le soir.',
                author: 'User123',
            },
        ])
    }, [])

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-bold text-dark-text">
                    Reviews-Maker
                </h1>
                <p className="text-xl text-dark-muted">
                    Créez et partagez vos avis sur les produits cannabis
                </p>
                {isAuthenticated && (
                    <p className="text-lg text-primary-400">
                        Bienvenue {user?.username} 👋
                    </p>
                )}
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review) => (
                    <div key={review.id} className="glass rounded-xl p-6">
                        <h3 className="text-xl font-bold text-dark-text">{review.holderName}</h3>
                        <p className="text-sm text-dark-muted mb-2">{review.type}</p>
                        <p className="text-dark-text mb-4">{review.description}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-primary-600 font-bold">{review.note}/10</span>
                            <span className="text-dark-muted text-sm">Par {review.author}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
