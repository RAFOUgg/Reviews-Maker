import { useState } from 'react'import { useState } from 'react'

import { useNavigate } from 'react-router-dom'import { useNavigate } from 'react-router-dom'

import { useStore } from '../store/useStore'import { useStore } from '../store/useStore'



export default function CreateReviewPage() {
    export default function CreateReviewPage() {

        const navigate = useNavigate()    const navigate = useNavigate()

        const { user, isAuthenticated } = useStore()    const { user, isAuthenticated } = useStore()



        // État du formulaire simplifié    // État du formulaire simplifié

        const [formData, setFormData] = useState({
            const [formData, setFormData] = useState({

                holderName: '', holderName: '',

                type: 'Fleur', type: 'Fleur',

                description: '', description: '',

                overallRating: 5        overallRating: 5

            })
        })

        const [images, setImages] = useState([])    const [images, setImages] = useState([])

        const [isSubmitting, setIsSubmitting] = useState(false)    const [isSubmitting, setIsSubmitting] = useState(false)

        const [error, setError] = useState('')    const [error, setError] = useState('')



        // Redirection si pas authentifié    // Redirection si pas authentifié

        if (!isAuthenticated) {
            if (!isAuthenticated) {

                navigate('/')        navigate('/')

                return null        return null

            }
        }



        const productTypes = ['Fleur', 'Hash', 'Concentré', 'Comestible']    const productTypes = ['Fleur', 'Hash', 'Concentré', 'Comestible']



        const handleInputChange = (field, value) => {
            const handleInputChange = (field, value) => {

                setFormData(prev => ({ ...prev, [field]: value }))        setFormData(prev => ({ ...prev, [field]: value }))

                setError('')        setError('')

            }
        }



        const handleImageChange = (e) => {
            const handleImageChange = (e) => {

                const files = Array.from(e.target.files)        const files = Array.from(e.target.files)

                setImages(prev => [...prev, ...files])        setImages(prev => [...prev, ...files])

            }
        }



        const removeImage = (index) => {
            const removeImage = (index) => {

                setImages(prev => prev.filter((_, i) => i !== index))        setImages(prev => prev.filter((_, i) => i !== index))

            }
        }



        const handleSubmit = async (e) => {
            const handleSubmit = async (e) => {

                e.preventDefault()        e.preventDefault()

                setError('')        setError('')



                // Validation simple        // Validation simple

                if (!formData.holderName.trim()) {
                    if (!formData.holderName.trim()) {

                        setError('Le nom du produit est requis')            setError('Le nom du produit est requis')

                        return            return

                    }
                }



                setIsSubmitting(true)        setIsSubmitting(true)



                try {
                    try {

                        // Créer le FormData pour l'upload            // Créer le FormData pour l'upload

                        const submitData = new FormData()            const submitData = new FormData()

                        submitData.append('holderName', formData.holderName)            submitData.append('holderName', formData.holderName)

                        submitData.append('type', formData.type)            submitData.append('type', formData.type)

                        submitData.append('description', formData.description || '')            submitData.append('description', formData.description || '')

                        submitData.append('overallRating', formData.overallRating)            submitData.append('overallRating', formData.overallRating)



                        // Ajouter les images            // Ajouter les images

                        images.forEach((image) => {
                            images.forEach((image, index) => {

                                submitData.append('images', image)                submitData.append('images', image)

                            })
                        })



                        const response = await fetch('/api/reviews', {
                            const response = await fetch('/api/reviews', {

                                method: 'POST', method: 'POST',

                                credentials: 'include', credentials: 'include',

                                body: submitData                body: submitData

                            })
                        })



                        if (!response.ok) {
                            if (!response.ok) {

                                const errorData = await response.json()                const errorData = await response.json()

                                throw new Error(errorData.message || 'Erreur lors de la création')                throw new Error(errorData.message || 'Erreur lors de la création')

                            }
                        }



                        const result = await response.json()            const result = await response.json()

                        console.log('✅ Review créée:', result)            console.log('✅ Review créée:', result)



                        // Rediriger vers la page d'accueil            // Rediriger vers la page d'accueil

                        navigate('/')            navigate('/')

                    } catch (err) { } catch (err) {

                        console.error('❌ Erreur:', err)            console.error('❌ Erreur:', err)

                        setError(err.message || 'Une erreur est survenue')            setError(err.message || 'Une erreur est survenue')

                    } finally { } finally {

                        setIsSubmitting(false)            setIsSubmitting(false)

                    }
                }

    }
        }



        return (    return (

            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">

                <div className="max-w-2xl mx-auto">            <div className="max-w-2xl mx-auto">

                    {/* Header */}                {/* Header */}

                    <div className="text-center mb-8">                <div className="text-center mb-8">

                        <h1 className="text-4xl font-bold text-white mb-2">                    <h1 className="text-4xl font-bold text-white mb-2">

                            Créer une Review                        Créer une Review

                        </h1>                    </h1>

                        <p className="text-gray-400">                    <p className="text-gray-400">

                            Partagez votre expérience avec la communauté                        Partagez votre expérience avec la communauté

                        </p>                    </p>

                    </div>                </div>



                    {/* Formulaire */}                {/* Formulaire */}

                    <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700">                <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700">

                        {/* Message d'erreur */}                    {/* Message d'erreur */}

                        {error && ({ error && (

                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">

                                {error}                            {error}

                            </div>                        </div>

                        )}                    )}



                        {/* Type de produit */}                    {/* Type de produit */}

                        <div className="mb-6">                    <div className="mb-6">

                            <label className="block text-sm font-medium text-gray-300 mb-3">                        <label className="block text-sm font-medium text-gray-300 mb-3">

                                Type de produit                            Type de produit

                            </label>                        </label>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                                {productTypes.map((type) => ({
                                    productTypes.map((type) => (

                                <button                                <button

                                    key={type}                                    key={type}

                                    type="button"                                    type="button"

                                    onClick={() => handleInputChange('type', type)}                                    onClick={() => handleInputChange('type', type)}

                                    className={`p-4 rounded-xl text-center transition-all ${                                    className={`p-4 rounded-xl text-center transition-all ${

                                        formData.type === type                                        formData.type === type

                                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/50' ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'

                                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'

                                    }`}                                    }`}

                                >                                >

                                <div className="text-2xl mb-1">                                    <div className="text-2xl mb-1">

                                    {type === 'Fleur' && '🌿'}                                        {type === 'Fleur' && '🌿'}

                                    {type === 'Hash' && '🟫'}                                        {type === 'Hash' && '🟫'}

                                    {type === 'Concentré' && '🔮'}                                        {type === 'Concentré' && '🔮'}

                                    {type === 'Comestible' && '🍰'}                                        {type === 'Comestible' && '🍰'}

                                </div>                                    </div>

                                <div className="text-xs font-medium">{type}</div>                                    <div className="text-xs font-medium">{type}</div>

                            </button>                                </button>

                            ))}                            ))}

                        </div>                        </div>

                    </div>                    </div>



                    {/* Nom du produit */}                    {/* Nom du produit */}

                    <div className="mb-6">                    <div className="mb-6">

                        <label className="block text-sm font-medium text-gray-300 mb-2">                        <label className="block text-sm font-medium text-gray-300 mb-2">

                            Nom du produit *                            Nom du produit *

                        </label>                        </label>

                        <input                        <input

                            type="text" type="text"

                            placeholder="Ex: Blue Dream, Sour Diesel..." placeholder="Ex: Blue Dream, Sour Diesel..."

                            value={formData.holderName} value={formData.holderName}

                            onChange={(e) => handleInputChange('holderName', e.target.value)} onChange={(e) => handleInputChange('holderName', e.target.value)}

                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all"

                            required required

                        />                        />

                    </div>                    </div>



                    {/* Note globale */}                    {/* Note globale */}

                    <div className="mb-6">                    <div className="mb-6">

                        <label className="block text-sm font-medium text-gray-300 mb-2">                        <label className="block text-sm font-medium text-gray-300 mb-2">

                            Note globale: {formData.overallRating}/10                            Note globale: {formData.overallRating}/10

                        </label>                        </label>

                        <input                        <input

                            type="range" type="range"

                            min="0" min="0"

                            max="10" max="10"

                            step="0.5" step="0.5"

                            value={formData.overallRating} value={formData.overallRating}

                            onChange={(e) => handleInputChange('overallRating', parseFloat(e.target.value))} onChange={(e) => handleInputChange('overallRating', parseFloat(e.target.value))}

                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"

                        />                        />

                        <div className="flex justify-between text-xs text-gray-500 mt-1">                        <div className="flex justify-between text-xs text-gray-500 mt-1">

                            <span>0</span>                            <span>0</span>

                            <span>5</span>                            <span>5</span>

                            <span>10</span>                            <span>10</span>

                        </div>                        </div>

                    </div>                    </div>



                    {/* Description */}                    {/* Description */}

                    <div className="mb-6">                    <div className="mb-6">

                        <label className="block text-sm font-medium text-gray-300 mb-2">                        <label className="block text-sm font-medium text-gray-300 mb-2">

                            Description                            Description

                        </label>                        </label>

                        <textarea                        <textarea

                            placeholder="Décrivez votre expérience..." placeholder="Décrivez votre expérience..."

                            value={formData.description} value={formData.description}

                            onChange={(e) => handleInputChange('description', e.target.value)} onChange={(e) => handleInputChange('description', e.target.value)}

                            rows="4" rows="4"

                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all resize-none" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all resize-none"

                        />                        />

                    </div>                    </div>



                    {/* Upload d'images */}                    {/* Upload d'images */}

                    <div className="mb-8">                    <div className="mb-8">

                        <label className="block text-sm font-medium text-gray-300 mb-2">                        <label className="block text-sm font-medium text-gray-300 mb-2">

                            Photos                            Photos

                        </label>                        </label>

                        <input                        <input

                            type="file" type="file"

                            id="image-upload" id="image-upload"

                            multiple multiple

                            accept="image/*" accept="image/*"

                            onChange={handleImageChange} onChange={handleImageChange}

                            className="hidden" className="hidden"

                        />                        />

                        <button                        <button

                            type="button" type="button"

                            onClick={() => document.getElementById('image-upload').click()} onClick={() => document.getElementById('image-upload').click()}

                            className="w-full py-3 px-4 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl text-gray-300 transition-colors" className="w-full py-3 px-4 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl text-gray-300 transition-colors"

                        >                        >

                            📸 Ajouter des photos                            📸 Ajouter des photos

                        </button>                        </button>



                        {/* Aperçu des images */}                        {/* Aperçu des images */}

                        {images.length > 0 && ({
                            images.length > 0 && (

                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">                            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">

                                    {images.map((image, index) => ({
                                        images.map((image, index) => (

                                            <div key={index} className="relative group">                                    <div key={index} className="relative group">

                                                <img                                        <img

                                                    src={URL.createObjectURL(image)} src={URL.createObjectURL(image)}

                                                    alt={`Preview ${index}`} alt={`Preview ${index}`}

                                                    className="w-full h-24 object-cover rounded-lg" className="w-full h-24 object-cover rounded-lg"

                                                />                                        />

                                                <button                                        <button

                                                    type="button" type="button"

                                                    onClick={() => removeImage(index)} onClick={() => removeImage(index)}

                                                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all" className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"

                                                >                                        >

                                                    ✕                                            ✕

                                                </button>                                        </button>

                                            </div>                                    </div>

                                ))}                                ))}

                                </div>                            </div>

                        )}                        )}

                </div>                    </div>



                {/* Boutons d'action */}                    {/* Boutons d'action */}

                <div className="flex gap-4">                    <div className="flex gap-4">

                    <button                        <button

                        type="button" type="button"

                        onClick={() => navigate('/')} onClick={() => navigate('/')}

                        className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors" className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"

                        disabled={isSubmitting} disabled={isSubmitting}

                    >                        >

                        Annuler                            Annuler

                    </button>                        </button>

                    <button                        <button

                        type="submit" type="submit"

                        disabled={isSubmitting} disabled={isSubmitting}

                        className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-medium shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed" className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-medium shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"

                    >                        >

                        {isSubmitting ? 'Publication...' : '✅ Publier la review'}                            {isSubmitting ? 'Publication...' : '✅ Publier la review'}

                    </button>                        </button>

            </div>                    </div >

                </form >                </form >

            </div >            </div >

        </div >        </div >

    )    )

    }
}

<h2 className="text-2xl font-bold text-dark-text">Informations générales</h2>

{/* Nom du produit */ }
<div>
    <label className="block text-sm font-medium text-dark-text mb-2">
        Nom du produit
    </label>
    <input
        type="text"
        placeholder="Ex: Blue Dream, Sour Diesel..."
        value={reviewData.holderName || ''}
        onChange={(e) => updateField('holderName', e.target.value)}
        className={`w-full px-4 py-2 rounded-lg bg-dark-bg border ${errors.holderName ? 'border-red-500' : 'border-dark-border'
            } text-dark-text placeholder-dark-muted focus:outline-none focus:border-primary-600 transition-colors`}
    />
    {errors.holderName && (
        <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>
    )}
</div>

{/* Photo */ }
<div>
    <label className="block text-sm font-medium text-dark-text mb-2">
        Photo du produit
    </label>
    <div className="relative">
        <div className="flex gap-2">
            <input
                type="file"
                id="photo-input"
                multiple
                accept="image/*"
                onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                className="hidden"
            />
            <button
                type="button"
                onClick={() => document.getElementById('photo-input').click()}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
                📸 Ajouter des photos
            </button>
        </div>

        {/* Aperçu des photos */}
        {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="relative group">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${idx}`}
                            className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
</div>

{/* Description */ }
<div>
    <label className="block text-sm font-medium text-dark-text mb-2">
        Description
    </label>
    <textarea
        placeholder="Décrivez votre expérience..."
        value={reviewData.description || ''}
        onChange={(e) => updateField('description', e.target.value)}
        rows={4}
        className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-muted focus:outline-none focus:border-primary-600 transition-colors resize-none"
    />
</div>
                    </section >

    {/* Ratings / Scores */ }
    < section className = "glass rounded-xl p-6 space-y-4" >
                        <h2 className="text-2xl font-bold text-dark-text">Scores</h2>
                        <p className="text-dark-muted text-sm">Évaluez les différents aspects sur 0-10</p>

{/* Note: En production, vous créeriez des composants pour chaque type de produit */ }
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Object.entries(reviewData.ratings || {}).map(([key, value]) => (
        <div key={key}>
            <label className="block text-sm font-medium text-dark-text mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <div className="flex items-center gap-4">
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={value || 0}
                    onChange={(e) => updateRating(key, parseInt(e.target.value))}
                    className="flex-1"
                />
                <span className="text-dark-text font-bold w-8 text-center">{value || 0}</span>
            </div>
        </div>
    ))}
</div>

{/* Totals */ }
{
    totals && Object.keys(totals).length > 0 && (
        <div className="mt-6 pt-6 border-t border-dark-border">
            <h3 className="text-lg font-semibold text-dark-text mb-3">Totaux calculés</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(totals).map(([section, total]) => (
                    <div key={section} className="bg-dark-bg rounded-lg p-3">
                        <p className="text-dark-muted text-xs uppercase">{section}</p>
                        <p className="text-2xl font-bold text-primary-600">{total}/10</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
                    </section >

    {/* Messages de statut */ }
{
    submitStatus && (
        <div
            className={`rounded-lg p-4 ${submitStatus.type === 'success'
                ? 'bg-green-900/30 border border-green-600 text-green-400'
                : 'bg-red-900/30 border border-red-600 text-red-400'
                }`}
        >
            {submitStatus.message}
        </div>
    )
}

{/* Erreurs générales */ }
{
    Object.keys(errors).length > 0 && !submitStatus && (
        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-400">
            <p className="font-semibold mb-2">Erreurs dans le formulaire:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                ))}
            </ul>
        </div>
    )
}

{/* Boutons */ }
<div className="flex gap-4 justify-end pt-6 border-t border-dark-border">
    <button
        type="button"
        onClick={() => navigate('/')}
        className="px-6 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-text hover:bg-dark-border transition-colors"
    >
        Annuler
    </button>
    <button
        type="button"
        onClick={handleSaveDraft}
        disabled={isSubmitting}
        className="px-6 py-2 rounded-lg bg-dark-border text-dark-text hover:bg-dark-border/70 transition-colors disabled:opacity-50"
    >
        💾 Brouillon
    </button>
    <button
        type="submit"
        disabled={isSubmitting || completionPercentage < 50}
        className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
        {isSubmitting ? '⏳ Envoi...' : '✅ Publier la Review'}
    </button>
</div>
                </form >
            )}
        </div >
    )
}
