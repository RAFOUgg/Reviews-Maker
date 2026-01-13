/**
 * Modal pour les Mentions Légales et Confidentialité
 */

import React from 'react'
import { createPortal } from 'react-dom'

export default function LegalNoticeModal({ isOpen, onClose }) {
    if (!isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6">
            <div className="w-full max-w-2xl max-h-[80vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Mentions Légales</h2>
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
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Informations Légales</h3>
                        <div className="space-y-2">
                            <p><strong>Dénomination:</strong> Terpologie</p>
                            <p><strong>Plateforme:</strong> Review Maker</p>
                            <p><strong>Statut juridique:</strong> SARL</p>
                            <p><strong>Site Web:</strong> terpologie.eu</p>
                            <p><strong>Contact:</strong> legal@terpologie.eu</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Conformité et Responsabilité</h3>
                        <p>
                            Terpologie opère en conformité avec les lois et réglementations applicables dans les juridictions où le cannabis est légal.
                        </p>
                        <p>
                            <strong>Important:</strong> Review Maker ne facilite pas la vente, l'achat ou la distribution de cannabis.
                            C'est une plateforme exclusivement dédiée au partage d'expériences et d'avis sur des produits légalement consommables.
                        </p>
                        <p>
                            Nous ne sommes pas responsables de l'utilisation du contenu par nos utilisateurs.
                            Chaque utilisateur est responsable du respect des lois locales.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Données Personnelles</h3>
                        <p>
                            En conformité avec le RGPD et les lois sur la protection des données:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Nous collectons uniquement les données nécessaires</li>
                            <li>Vos données ne sont jamais vendues à des tiers</li>
                            <li>Vous avez le droit d'accès et de suppression de vos données</li>
                            <li>Les données de vérification d'âge sont stockées de manière sécurisée</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Vérification d'Âge</h3>
                        <p>
                            Notre système de vérification d'âge:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Utilise une technologie sécurisée et chiffrée</li>
                            <li>Respecte votre confidentialité</li>
                            <li>Est conforme aux réglementations RDR (Responsible Distribution Regulations)</li>
                            <li>N'est effectué qu'une seule fois par utilisateur</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Contenu Généré par les Utilisateurs</h3>
                        <p>
                            Les reviews, commentaires et images publiés par les utilisateurs:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Restent la propriété de l'utilisateur qui les a créés</li>
                            <li>Peuvent être modérés ou supprimés s'ils violent nos politiques</li>
                            <li>Ne reflètent pas nécessairement l'opinion d'Orchard Studio</li>
                            <li>Sont accessibles au public conformément aux paramètres de confidentialité</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Limitation de Responsabilité</h3>
                        <p>
                            Orchard Studio et ses propriétaires, dirigeants, salariés et agents ne seront pas responsables des:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Dommages directs, indirects ou consécutifs</li>
                            <li>Pertes de profits ou de données</li>
                            <li>Interruptions de service</li>
                            <li>Actes de tiers ou forces majeures</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Droit Applicable</h3>
                        <p>
                            Ces mentions légales et l'utilisation de la plateforme sont régies par les lois applicables
                            dans votre juridiction et par les lois internationales sur la protection des données.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Modification des Mentions Légales</h3>
                        <p>
                            Orchard Studio se réserve le droit de modifier ces mentions légales à tout moment.
                            Les modifications seront publiées sur cette page avec la date de mise à jour.
                            Votre utilisation continue de la plateforme implique votre acceptation des modifications.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Contact pour Questions Légales</h3>
                        <p>
                            Pour toute question concernant nos obligations légales ou réglementaires:
                        </p>
                        <p className="mt-2">
                            <strong>Email:</strong> legal@orchardstudio.app<br />
                            <strong>Adresse:</strong> [À compléter]
                        </p>
                    </section>

                    <p className="text-xs text-gray-500 pt-4 border-t">
                        Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
                    </p>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-8 py-4 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg hover: text-white font-semibold transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}

