/**
 * Modal pour les Conditions Générales d'Utilisation
 */

import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export default function TermsModal({ isOpen, onClose, onAccept }) {
    const [accepted, setAccepted] = useState(false)

    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6">
            <div className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r px-8 py-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Conditions Générales d'Utilisation</h2>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 text-gray-800 space-y-4 text-sm leading-relaxed">
                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">1. Introduction</h3>
                        <p>
                            Bienvenue sur Review Maker by Terpologie. Ces Conditions Générales d'Utilisation (« CGU ») régissent votre accès et votre utilisation de notre plateforme en ligne.
                            En accédant à notre site, vous acceptez pleinement ces conditions. Si vous n'acceptez pas ces conditions,
                            veuillez ne pas utiliser notre plateforme.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">2. Exigences d'Âge et Restrictions Légales</h3>
                        <p>
                            Vous confirmez que vous avez au moins l'âge légal minimum requis pour consommer du cannabis dans votre juridiction:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li><strong>États-Unis:</strong> 21 ans (dans les États où le cannabis est légal)</li>
                            <li><strong>Canada:</strong> 18-19 ans selon la province</li>
                            <li><strong>Europe:</strong> 18 ans minimum</li>
                            <li><strong>Autres juridictions:</strong> Conformément à la loi locale</li>
                        </ul>
                        <p className="mt-2">
                            Vous reconnaissez que vous avez vérifié votre date de naissance et votre localisation,
                            et que vous respectez les lois applicables dans votre juridiction concernant le cannabis.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">3. Utilisation Autorisée</h3>
                        <p>
                            Vous acceptez d'utiliser cette plateforme uniquement à des fins légales et de manière responsable.
                            Vous ne devez pas:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Contourner les restrictions d'âge ou de localisation</li>
                            <li>Partager votre compte ou vos identifiants</li>
                            <li>Publier du contenu offensant, illégal ou dangereux</li>
                            <li>Utiliser la plateforme à des fins commerciales non autorisées</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">4. Contenu Utilisateur</h3>
                        <p>
                            Tout contenu que vous créez (reviews, commentaires, images) reste votre propriété.
                            Cependant, en le publiant sur notre plateforme, vous nous accordez une licence pour l'afficher et le distribuer.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">5. Responsabilité et Exonération</h3>
                        <p>
                            Orchard Studio est fourni « tel quel » sans garantie. Nous ne sommes pas responsables des dommages directs,
                            indirects ou consécutifs découlant de votre utilisation de la plateforme.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">6. Modifications des CGU</h3>
                        <p>
                            Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications seront effectives immédiatement
                            après la publication. Votre utilisation continue de la plateforme implique votre acceptation des modifications.
                        </p>
                    </section>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                            J'accepte les Conditions Générales d'Utilisation
                        </span>
                    </label>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Refuser
                        </button>
                        <button
                            onClick={() => onAccept && onAccept()}
                            disabled={!accepted}
                            className="px-6 py-2 rounded-lg hover: text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Accepter
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}


