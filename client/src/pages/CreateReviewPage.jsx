import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function CreateReviewPage() {
    const navigate = useNavigate()
    const { isAuthenticated } = useStore()
    
    const [formData, setFormData] = useState({
        holderName: '',
        type: 'Fleur',
        description: '',
        overallRating: 5
    })
    const [images, setImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    if (!isAuthenticated) {
        navigate('/')
        return null
    }

    const productTypes = ['Fleur', 'Hash', 'Concentre', 'Comestible']

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setError('')
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setImages(prev => [...prev, ...files])
    }

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!formData.holderName.trim()) {
            setError('Le nom du produit est requis')
            return
        }

        setIsSubmitting(true)

        try {
            const submitData = new FormData()
            submitData.append('holderName', formData.holderName)
            submitData.append('type', formData.type)
            submitData.append('description', formData.description || '')
            submitData.append('overallRating', formData.overallRating)
            
            images.forEach((image) => {
                submitData.append('images', image)
            })

            const response = await fetch('/api/reviews', {
                method: 'POST',
                credentials: 'include',
                body: submitData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la creation')
            }

            const result = await response.json()
            console.log('Review creee:', result)
            navigate('/')
        } catch (err) {
            console.error('Erreur:', err)
            setError(err.message || 'Une erreur est survenue')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Creer une Review</h1>
                    <p className="text-gray-400">Partagez votre experience avec la communaute</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">Type de produit</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {productTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleInputChange('type', type)}
                                    className={`p-4 rounded-xl text-center transition-all ${
                                        formData.type === type
                                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">
                                        {type === 'Fleur' && String.fromCodePoint(0x1F33F)}
                                        {type === 'Hash' && String.fromCodePoint(0x1F7EB)}
                                        {type === 'Concentre' && String.fromCodePoint(0x1F52E)}
                                        {type === 'Comestible' && String.fromCodePoint(0x1F370)}
                                    </div>
                                    <div className="text-xs font-medium">{type}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit *</label>
                        <input
                            type="text"
                            placeholder="Ex: Blue Dream, Sour Diesel..."
                            value={formData.holderName}
                            onChange={(e) => handleInputChange('holderName', e.target.value)}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Note globale: {formData.overallRating}/10
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={formData.overallRating}
                            onChange={(e) => handleInputChange('overallRating', parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            placeholder="Decrivez votre experience..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all resize-none"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Photos</label>
                        <input
                            type="file"
                            id="image-upload"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => document.getElementById('image-upload').click()}
                            className="w-full py-3 px-4 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl text-gray-300 transition-colors"
                        >
                            Ajouter des photos
                        </button>

                        {images.length > 0 && (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Preview ${index}`}
                                            className="w-full h-24 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                            disabled={isSubmitting}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-medium shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Publication...' : 'Publier la review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
