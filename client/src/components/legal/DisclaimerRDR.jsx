import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { useToast } from '../shared/ToastContainer'
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
            console.error('Erreur acceptation RDR:', error)
            toast.error(error.response?.data?.message || 'Erreur lors de l\'acceptation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-2 sm:p-4">
            <div className="max-w-2xl w-full">
                {/* Card principale */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8">
                    {/* Header avec icône */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {disclaimer.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Veuillez lire attentivement ces informations importantes
                        </p>
                    </div>

                    {/* Contenu du disclaimer */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl p-4 sm:p-6 mb-6 max-h-[60vh] sm:max-h-96 overflow-y-auto">
                        <ul className="space-y-3 sm:space-y-4">
                            {disclaimer.content.map((item, index) => (
                                <li key={index} className="flex gap-3 text-gray-800 dark:text-gray-200">
                                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Checkbox acceptation */}
                    <div className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-6 mb-6 border-2 border-gray-200 dark:border-gray-600">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                className="mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 focus:ring-2 focus:ring-violet-500 cursor-pointer"
                            />
                            <div className="flex-1">
                                <p className="text-gray-900 dark:text-white font-semibold mb-2 group-hover: dark:group-hover: transition">
                                    Je confirme avoir lu et compris
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    J'ai pris connaissance des risques liés à la consommation de cannabis et j'accepte d'utiliser Reviews-Maker en connaissance de cause. Je comprends que cette plateforme est à visée informative et éducative uniquement.
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate('/login')}
                            className="flex-1 py-3 sm:py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-xl transition text-sm sm:text-base"
                        >
                            <X className="w-5 h-5 inline mr-2" />
                            Annuler
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={!accepted || loading}
                            className="flex-1 py-3 sm:py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                        >
                            {loading ? (
                                'Validation...'
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 inline mr-2" />
                                    J'accepte et je continue
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer légal */}
                    <p className="mt-6 text-xs sm:text-sm text-center text-gray-500 dark:text-gray-400">
                        Reviews-Maker ne promeut ni n'encourage la consommation illégale de substances.
                        Respectez la législation en vigueur dans votre pays.
                    </p>
                </div>
            </div>
        </div>
    )
}
