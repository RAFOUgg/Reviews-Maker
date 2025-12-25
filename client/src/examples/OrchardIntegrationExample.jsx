/**
 * Exemple d'intégration d'Orchard Studio dans une page de review
 * 
 * Ce fichier montre comment utiliser le système Orchard pour permettre
 * aux utilisateurs de personnaliser et exporter leurs reviews.
 */

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import OrchardPanel from '../components/orchard/OrchardPanel';
import '../assets/orchard.css';

export default function ReviewDetailPage() {
    const [showOrchard, setShowOrchard] = useState(false);

    // Exemple de données de review
    // Dans une vraie app, ces données viendraient de votre API/state
    const reviewData = {
        title: "Purple Haze - Test Review",
        rating: 4.5,
        category: "Fleur",
        author: "Jean Dupont",
        date: "2025-01-15T10:30:00Z",
        imageUrl: "https://example.com/purple-haze.jpg",
        thcLevel: 22,
        cbdLevel: 0.5,
        cultivar: "Sativa",
        description: "Une variété légendaire avec des arômes fruités prononcés et des effets énergisants. Parfaite pour la journée et les activités créatives. Les bourgeons sont denses avec une belle couleur violette.",
        effects: ["Euphorique", "Créatif", "Énergisant", "Social"],
        aromas: ["Fruité", "Terreux", "Sucré", "Épicé"],
        tags: ["Premium", "Daytime", "Social", "Classic"]
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header de la page */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {reviewData.title}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-lg text-gray-600 dark:text-gray-400">
                            {(() => {
                                const authorName = reviewData.ownerName || (reviewData.author ? (typeof reviewData.author === 'string' ? reviewData.author : (reviewData.author.username || reviewData.author.id)) : null) || 'Anonyme'
                                return `Par ${authorName}`
                            })()}
                        </span>
                        <span className="text-lg text-purple-500 font-semibold">
                            ⭐ {reviewData.rating}/5
                        </span>
                    </div>
                </div>

                {/* Contenu de la review */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-6">
                    <img
                        src={reviewData.imageUrl}
                        alt={reviewData.title}
                        className="w-full h-64 object-cover rounded-xl mb-6"
                    />

                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                        {reviewData.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">THC</div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {reviewData.thcLevel}%
                            </div>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">CBD</div>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {reviewData.cbdLevel}%
                            </div>
                        </div>
                    </div>

                    {/* Effets */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Effets
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {reviewData.effects.map((effect, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                                >
                                    {effect}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Arômes */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Arômes
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {reviewData.aromas.map((aroma, i) => (
                                <span
                                    key={i}
                                    className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                                >
                                    {aroma}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bouton pour ouvrir Orchard Studio */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowOrchard(true)}
                        className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Personnaliser & Exporter avec Orchard Studio
                    </button>

                    <button
                        className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        Partager
                    </button>
                </div>

                {/* Informations sur Orchard */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                Nouveau : Orchard Studio 🎨
                            </h4>
                            <p className="text-sm text-purple-700 dark:text-purple-300">
                                Personnalisez entièrement l'apparence de vos reviews et exportez-les en PNG, JPEG, PDF ou Markdown !
                                Choisissez parmi plusieurs templates, personnalisez les couleurs, la typographie et plus encore.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orchard Panel (modal) */}
            <AnimatePresence>
                {showOrchard && (
                    <OrchardPanel
                        reviewData={reviewData}
                        onClose={() => setShowOrchard(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * NOTES D'INTÉGRATION :
 * 
 * 1. Assurez-vous d'importer orchard.css dans votre point d'entrée principal (main.jsx ou index.css)
 * 
 * 2. Les données de review doivent suivre cette structure :
 *    {
 *      title: string,
 *      rating: number (0-5),
 *      category: string,
 *      author: string,
 *      date: string (ISO),
 *      imageUrl: string,
 *      thcLevel?: number,
 *      cbdLevel?: number,
 *      cultivar?: string,
 *      description: string,
 *      effects?: string[],
 *      aromas?: string[],
 *      tags?: string[]
 *    }
 * 
 * 3. Pour intégrer dans votre routing React Router :
 *    <Route path="/reviews/:id" element={<ReviewDetailPage />} />
 * 
 * 4. Pour l'utiliser dans un composant existant, ajoutez simplement :
 *    - Le state : const [showOrchard, setShowOrchard] = useState(false)
 *    - Le bouton : <button onClick={() => setShowOrchard(true)}>...</button>
 *    - Le composant : {showOrchard && <OrchardPanel ... />}
 * 
 * 5. Les préréglages sont automatiquement sauvegardés dans localStorage
 * 
 * 6. Les exports sont téléchargés directement dans le navigateur
 */
