import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useToast } from '../ToastContainer'
import { usersService } from '../../services/apiService'

/**
 * Disclaimers RDR par pays - Conforme CDC
 */
const DISCLAIMERS = {
    FR: {
        title: "Réduction des Risques - France",
        content: [
            "La consommation de cannabis présente des risques pour la santé physique et mentale.",
            "L'usage régulier peut entraîner une dépendance psychologique.",
            "La conduite sous influence est illégale et dangereuse.",
            "Femmes enceintes : risques pour le développement fœtal.",
            "Ne pas mélanger avec alcool ou autres substances.",
            "Consulter un professionnel de santé en cas de doute.",
            "Respectez la législation en vigueur dans votre pays."
        ]
    },
    US: {
        title: "Risk Reduction - United States",
        content: [
            "Cannabis use may cause serious health risks including addiction.",
            "Regular use may impair cognitive function and memory.",
            "Do not drive or operate machinery while under the influence.",
            "Pregnant women: risk of birth defects and developmental issues.",
            "Consult your healthcare provider before use.",
            "Keep out of reach of children and pets.",
            "Follow state and local laws regarding cannabis use."
        ]
    },
    CA: {
        title: "Réduction des Méfaits - Canada",
        content: [
            "La consommation de cannabis comporte des risques pour la santé.",
            "L'usage peut affecter la mémoire et la concentration.",
            "Ne conduisez jamais sous l'influence du cannabis.",
            "Femmes enceintes ou allaitantes : risques pour le bébé.",
            "Consultez un professionnel de la santé si nécessaire.",
            "Gardez hors de la portée des enfants.",
            "Respectez les lois fédérales et provinciales."
        ]
    },
    ES: {
        title: "Reducción de Riesgos - España",
        content: [
            "El consumo de cannabis conlleva riesgos para la salud.",
            "El uso regular puede causar dependencia psicológica.",
            "No conducir bajo los efectos del cannabis.",
            "Mujeres embarazadas: riesgos para el desarrollo fetal.",
            "No mezclar con alcohol u otras sustancias.",
            "Consulte a un profesional sanitario en caso de duda.",
            "Respete la legislación vigente."
        ]
    },
    DE: {
        title: "Risikominderung - Deutschland",
        content: [
            "Cannabiskonsum birgt gesundheitliche Risiken.",
            "Regelmäßiger Gebrauch kann zu psychischer Abhängigkeit führen.",
            "Fahren unter Einfluss ist illegal und gefährlich.",
            "Schwangere Frauen: Risiken für die fötale Entwicklung.",
            "Nicht mit Alkohol oder anderen Substanzen mischen.",
            "Konsultieren Sie bei Zweifeln einen Arzt.",
            "Beachten Sie die geltenden Gesetze."
        ]
    },
    IT: {
        title: "Riduzione del Rischio - Italia",
        content: [
            "Il consumo di cannabis comporta rischi per la salute.",
            "L'uso regolare può causare dipendenza psicologica.",
            "Non guidare sotto l'influenza della cannabis.",
            "Donne in gravidanza: rischi per lo sviluppo fetale.",
            "Non mescolare con alcol o altre sostanze.",
            "Consultare un medico in caso di dubbi.",
            "Rispettare la legislazione vigente."
        ]
    },
    NL: {
        title: "Risicovermindering - Nederland",
        content: [
            "Cannabisgebruik brengt gezondheidsrisico's met zich mee.",
            "Regelmatig gebruik kan leiden tot psychische afhankelijkheid.",
            "Niet rijden onder invloed van cannabis.",
            "Zwangere vrouwen: risico's voor foetale ontwikkeling.",
            "Niet mengen met alcohol of andere middelen.",
            "Raadpleeg bij twijfel een arts.",
            "Respecteer de geldende wetgeving."
        ]
    },
    UK: {
        title: "Risk Reduction - United Kingdom",
        content: [
            "Cannabis use carries health risks including addiction.",
            "Regular use may impair memory and cognitive function.",
            "Do not drive under the influence of cannabis.",
            "Pregnant women: risk to fetal development.",
            "Do not mix with alcohol or other substances.",
            "Consult a healthcare professional if in doubt.",
            "Comply with current legislation."
        ]
    },
    BE: {
        title: "Réduction des Risques - Belgique",
        content: [
            "La consommation de cannabis présente des risques pour la santé.",
            "L'usage régulier peut entraîner une dépendance.",
            "Ne conduisez jamais sous l'influence du cannabis.",
            "Femmes enceintes : risques pour le développement du bébé.",
            "Ne pas mélanger avec l'alcool.",
            "Consultez un professionnel de santé si nécessaire.",
            "Respectez la législation belge."
        ]
    },
    CH: {
        title: "Réduction des Risques - Suisse",
        content: [
            "La consommation de cannabis comporte des risques.",
            "L'usage peut affecter la santé mentale.",
            "Ne pas conduire sous influence.",
            "Femmes enceintes : risques pour le fœtus.",
            "Consultez un médecin en cas de doute.",
            "Respectez la législation suisse.",
            "Gardez hors de portée des enfants."
        ]
    },
    PT: {
        title: "Redução de Riscos - Portugal",
        content: [
            "O consumo de cannabis apresenta riscos para a saúde.",
            "O uso regular pode causar dependência psicológica.",
            "Não conduzir sob o efeito de cannabis.",
            "Mulheres grávidas: riscos para o desenvolvimento fetal.",
            "Não misturar com álcool ou outras substâncias.",
            "Consulte um profissional de saúde em caso de dúvida.",
            "Respeite a legislação em vigor."
        ]
    }
}

/**
 * Composant Disclaimer RDR (Réduction des Risques)
 * Affiche un avertissement légal adapté au pays de l'utilisateur
 */
export default function DisclaimerRDR() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user, updateUser } = useStore()

    const [accepted, setAccepted] = useState(false)
    const [loading, setLoading] = useState(false)

    // Récupérer le pays de l'utilisateur ou défaut FR
    const country = user?.country || 'FR'
    const disclaimer = DISCLAIMERS[country] || DISCLAIMERS.FR

    /**
     * Accepter le disclaimer et finaliser l'inscription
     */
    const handleAccept = async () => {
        if (!accepted) {
            toast.warning('Vous devez accepter les conditions pour continuer')
            return
        }

        setLoading(true)

        try {
            // Enregistrer le consentement RDR
            const response = await usersService.acceptRDR({
                consentRDR: true,
                consentDate: new Date().toISOString()
            })

            // Mettre à jour le store local
            updateUser({ consentRDR: true })

            toast.success('Inscription finalisée !')

            // Rediriger vers la page d'accueil
            navigate('/home')

        } catch (error) {
}
