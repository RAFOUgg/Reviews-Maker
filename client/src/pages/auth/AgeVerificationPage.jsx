import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, AlertTriangle } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import { usersService } from '../services/apiService'

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
}
