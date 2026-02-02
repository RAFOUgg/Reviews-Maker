/**
 * Modal pour les Mentions Légales et Confidentialité
 * Liquid Glass UI Design System
 */

import React from 'react'
import { LiquidModal, LiquidButton } from '@/components/ui/LiquidUI'

export default function LegalNoticeModal({ isOpen, onClose }) {
    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            title="Mentions Légales"
            size="lg"
            glowColor="rose"
            footer={
                <LiquidButton variant="ghost" onClick={onClose}>
                    Fermer
                </LiquidButton>
            }
        >
            <div className="max-h-[60vh] overflow-y-auto space-y-4 text-sm text-white/70 pr-2">
                <section>
                    <h3 className="font-semibold text-base text-white mb-2">Informations Légales</h3>
                    <div className="space-y-1">
                        <p><strong className="text-white">Dénomination:</strong> Terpologie</p>
                        <p><strong className="text-white">Plateforme:</strong> Review Maker</p>
                        <p><strong className="text-white">Statut juridique:</strong> SARL</p>
                        <p><strong className="text-white">Site Web:</strong> terpologie.eu</p>
                        <p><strong className="text-white">Contact:</strong> legal@terpologie.eu</p>
                    </div>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">Conformité et Responsabilité</h3>
                    <p className="mb-2">
                        Terpologie opère en conformité avec les lois et réglementations applicables dans les juridictions où le cannabis est légal.
                    </p>
                    <p>
                        <strong className="text-amber-300">Important:</strong> Review Maker ne facilite pas la vente, l'achat ou la distribution de cannabis.
                        C'est une plateforme exclusivement dédiée au partage d'expériences et d'avis sur des produits légalement consommables.
                    </p>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">Données Personnelles</h3>
                    <p className="mb-2">En conformité avec le RGPD et les lois sur la protection des données:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Nous collectons uniquement les données nécessaires</li>
                        <li>Vos données ne sont jamais vendues à des tiers</li>
                        <li>Vous avez le droit d'accès et de suppression de vos données</li>
                        <li>Les données de vérification d'âge sont stockées de manière sécurisée</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">Vérification d'Âge</h3>
                    <p className="mb-2">Notre système de vérification d'âge:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Utilise une technologie sécurisée et chiffrée</li>
                        <li>Respecte votre confidentialité</li>
                        <li>Est conforme aux réglementations RDR</li>
                        <li>N'est effectué qu'une seule fois par utilisateur</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">Contenu Généré par les Utilisateurs</h3>
                    <p className="mb-2">Les reviews, commentaires et images publiés par les utilisateurs:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Restent la propriété de l'utilisateur qui les a créés</li>
                        <li>Peuvent être modérés ou supprimés s'ils violent nos politiques</li>
                        <li>Ne reflètent pas nécessairement l'opinion d'Orchard Studio</li>
                        <li>Sont accessibles au public conformément aux paramètres de confidentialité</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">Limitation de Responsabilité</h3>
                    <p className="mb-2">
                        Orchard Studio et ses propriétaires ne seront pas responsables des:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Dommages directs, indirects ou consécutifs</li>
                        <li>Pertes de profits ou de données</li>
                        <li>Interruptions de service</li>
                        <li>Actes de tiers ou forces majeures</li>
                    </ul>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">Contact pour Questions Légales</h3>
                    <p className="mt-2">
                        <strong className="text-white">Email:</strong> legal@orchardstudio.app
                    </p>
                </section>

                <p className="text-xs text-white/40 pt-4 border-t border-white/10">
                    Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
                </p>
            </div>
        </LiquidModal>
    )
}
