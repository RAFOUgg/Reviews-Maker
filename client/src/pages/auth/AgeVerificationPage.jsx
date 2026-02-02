import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, AlertTriangle, Shield } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useToast } from '../../components/shared/ToastContainer'
import { usersService } from '../../services/apiService'
import { LiquidCard, LiquidButton, LiquidSelect } from '@/components/ui/LiquidUI'

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

    // Convert country config to select options
    const countryOptions = Object.entries(LEGAL_AGE_CONFIG).map(([code, config]) => ({
        value: code,
        label: `${config.name} (âge min: ${config.minAge} ans)`
    }))

    // Convert regions to select options
    const regionOptions = LEGAL_AGE_CONFIG[country]?.regions?.map(r => ({
        value: r,
        label: r
    })) || []

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
            await usersService.updateLegalInfo({
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
        <div className="min-h-screen bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10 backdrop-blur-xl mb-4">
                        <Shield className="w-10 h-10 text-purple-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Vérification d'âge
                    </h1>
                    <p className="text-white/50">
                        Vous devez avoir l'âge légal pour accéder à Reviews-Maker
                    </p>
                </div>

                <LiquidCard glow="purple" padding="lg">
                    {/* Avertissement */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-200">
                            L'accès à cette plateforme est strictement réservé aux personnes majeures selon la législation de votre pays
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Pays */}
                        <LiquidSelect
                            label="Pays de résidence"
                            options={countryOptions}
                            value={country}
                            onChange={(val) => {
                                setCountry(val)
                                setRegion('') // Reset région
                            }}
                            placeholder="Sélectionnez un pays"
                        />

                        {/* Région (si applicable) */}
                        {LEGAL_AGE_CONFIG[country]?.regions && (
                            <LiquidSelect
                                label="État/Province"
                                options={regionOptions}
                                value={region}
                                onChange={setRegion}
                                placeholder="Sélectionnez..."
                            />
                        )}

                        {/* Date de naissance */}
                        <div className="flex flex-col gap-2">
                            <label className="text-[13px] font-medium text-white/60 ml-1 flex items-center gap-2">
                                <Calendar size={14} />
                                Date de naissance
                            </label>
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                max={new Date().toISOString().split('T')[0]}
                                className="liquid-input w-full"
                                required
                            />
                        </div>

                        {/* Affichage âge minimum */}
                        <div className="text-center py-3 px-4 rounded-xl bg-white/5 border border-white/10">
                            <span className="text-sm text-white/50">Âge minimum requis : </span>
                            <span className="text-lg font-bold text-purple-400">{getMinAge()} ans</span>
                        </div>

                        {/* Bouton validation */}
                        <LiquidButton
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            className="w-full"
                        >
                            {loading ? 'Vérification...' : 'Vérifier mon âge'}
                        </LiquidButton>
                    </form>

                    {/* Note légale */}
                    <p className="mt-6 text-xs text-center text-white/40">
                        En continuant, vous confirmez avoir l'âge légal requis dans votre juridiction
                    </p>
                </LiquidCard>
            </div>
        </div>
    )
}
