import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import { post } from '../services/apiService'

/**
 * Page de vérification d'âge légal - Conforme CDC
 * Obligatoire à l'inscription selon pays (18 ou 21 ans)
 */
export default function AgeVerificationPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user } = useStore()

    const [birthdate, setBirthdate] = useState('')
    const [country, setCountry] = useState('FR')
    const [region, setRegion] = useState('')
    const [loading, setLoading] = useState(false)

    /**
     * Configuration âge minimum par pays
     */
    const LEGAL_AGE_CONFIG = {
        'FR': { minAge: 18, name: 'France' },
        'BE': { minAge: 18, name: 'Belgique' },
        'CH': { minAge: 18, name: 'Suisse' },
        'CA': { minAge: 18, name: 'Canada', regions: ['QC', 'ON', 'BC', 'AB'] },
        'US': { minAge: 21, name: 'États-Unis', regions: ['CA', 'CO', 'WA', 'OR', 'MA'] },
        'ES': { minAge: 18, name: 'Espagne' },
        'PT': { minAge: 18, name: 'Portugal' },
        'NL': { minAge: 18, name: 'Pays-Bas' },
        'DE': { minAge: 18, name: 'Allemagne' },
        'IT': { minAge: 18, name: 'Italie' },
        'UK': { minAge: 18, name: 'Royaume-Uni' },
        'AU': { minAge: 18, name: 'Australie' },
        'NZ': { minAge: 18, name: 'Nouvelle-Zélande' },
    }

    /**
     * Calcule l'âge à partir de la date de naissance
     */
    const calculateAge = (birthdate) => {
        const today = new Date()
        const birth = new Date(birthdate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }

        return age
    }

    /**
     * Récupère l'âge minimum requis pour le pays sélectionné
     */
    const getMinAge = () => {
        return LEGAL_AGE_CONFIG[country]?.minAge || 18
    }

    /**
     * Vérifie si l'utilisateur a l'âge légal
     */
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!birthdate) {
            toast.error('Veuillez entrer votre date de naissance')
            return
        }

        const age = calculateAge(birthdate)
        const minAge = getMinAge()

        if (age < minAge) {
            toast.error(`Vous devez avoir ${minAge} ans minimum pour accéder à ce service`)
            return
        }

        setLoading(true)

        try {
            // Sauvegarder les données de vérification
            await post('/api/users/update-legal-info', {
                birthdate,
                country,
                region: region || null,
                legalAge: true
            })

            toast.success('Vérification d\'âge validée')

            // Rediriger vers le disclaimer RDR
            navigate('/disclaimer-rdr')

        } catch (error) {
            console.error('Erreur vérification âge:', error)
            toast.error(error.response?.data?.message || 'Erreur lors de la vérification')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card principale */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
                    {/* Icône et titre */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Vérification d'âge
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Vous devez avoir l'âge légal pour accéder à Reviews-Maker
                        </p>
                    </div>

                    {/* Avertissement */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                L'accès à cette plateforme est strictement réservé aux personnes majeures selon la législation de votre pays
                            </p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Pays */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin className="w-4 h-4 inline mr-2" />
                                Pays de résidence
                            </label>
                            <select
                                value={country}
                                onChange={(e) => {
                                    setCountry(e.target.value)
                                    setRegion('') // Reset région
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition"
                                required
                            >
                                {Object.entries(LEGAL_AGE_CONFIG).map(([code, config]) => (
                                    <option key={code} value={code}>
                                        {config.name} (âge min: {config.minAge} ans)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Région (si applicable) */}
                        {LEGAL_AGE_CONFIG[country]?.regions && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    État/Province
                                </label>
                                <select
                                    value={region}
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition"
                                >
                                    <option value="">Sélectionnez...</option>
                                    {LEGAL_AGE_CONFIG[country].regions.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Date de naissance */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                <Calendar className="w-4 h-4 inline mr-2" />
                                Date de naissance
                            </label>
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 transition"
                                required
                            />
                        </div>

                        {/* Affichage âge minimum */}
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Âge minimum requis: <strong className="text-violet-600 dark:text-violet-400">{getMinAge()} ans</strong>
                        </div>

                        {/* Bouton validation */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Vérification...' : 'Vérifier mon âge'}
                        </button>
                    </form>

                    {/* Note légale */}
                    <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                        En continuant, vous confirmez avoir l'âge légal requis dans votre juridiction
                    </p>
                </div>
            </div>
        </div>
    )
}
