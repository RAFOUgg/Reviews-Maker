/**
 * Modal pour les Conditions Générales d'Utilisation
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react'
import { LiquidModal, LiquidButton, LiquidCard } from '@/components/ui/LiquidUI'

export default function TermsModal({ isOpen, onClose, onAccept }) {
    const [accepted, setAccepted] = useState(false)

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            title="Conditions Générales d'Utilisation"
            size="lg"
            glowColor="violet"
            footer={
                <div className="space-y-4 w-full">
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 hover:border-violet-500/50 transition-colors">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                            className="w-5 h-5 rounded border-white/30 bg-white/5 accent-violet-500"
                        />
                        <span className="text-sm text-white/80">
                            J'accepte les Conditions Générales d'Utilisation
                        </span>
                    </label>

                    <div className="flex gap-3">
                        <LiquidButton variant="ghost" onClick={onClose} className="flex-1">
                            Refuser
                        </LiquidButton>
                        <LiquidButton
                            variant="primary"
                            onClick={() => onAccept && onAccept()}
                            disabled={!accepted}
                            className="flex-1"
                        >
                            Accepter
                        </LiquidButton>
                    </div>
                </div>
            }
        >
            <div className="max-h-[50vh] overflow-y-auto space-y-4 text-sm text-white/70 pr-2">
                <section>
                    <h3 className="font-semibold text-base text-white mb-2">1. Introduction</h3>
                    <p>
                        Bienvenue sur Review Maker by Terpologie. Ces Conditions Générales d'Utilisation (« CGU ») régissent votre accès et votre utilisation de notre plateforme en ligne.
                        En accédant à notre site, vous acceptez pleinement ces conditions. Si vous n'acceptez pas ces conditions,
                        veuillez ne pas utiliser notre plateforme.
                    </p>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">2. Exigences d'Âge et Restrictions Légales</h3>
                    <p className="mb-2">
                        Vous confirmez que vous avez au moins l'âge légal minimum requis pour consommer du cannabis dans votre juridiction:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong className="text-white">États-Unis:</strong> 21 ans (dans les États où le cannabis est légal)</li>
                        <li><strong className="text-white">Canada:</strong> 18-19 ans selon la province</li>
                        <li><strong className="text-white">Europe:</strong> 18 ans minimum</li>
                        <li><strong className="text-white">Autres juridictions:</strong> Conformément à la loi locale</li>
                    </ul>
                    <p className="mt-2">
                        Vous reconnaissez que vous avez vérifié votre date de naissance et votre localisation,
                        et que vous respectez les lois applicables dans votre juridiction concernant le cannabis.
                    </p>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">3. Utilisation Autorisée</h3>
                    <p className="mb-2">
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
                    <h3 className="font-semibold text-base text-white mb-2">4. Contenu Utilisateur</h3>
                    <p>
                        Tout contenu que vous créez (reviews, commentaires, images) reste votre propriété.
                        Cependant, en le publiant sur notre plateforme, vous nous accordez une licence pour l'afficher et le distribuer.
                    </p>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">5. Responsabilité et Exonération</h3>
                    <p>
                        Orchard Studio est fourni « tel quel » sans garantie. Nous ne sommes pas responsables des dommages directs,
                        indirects ou consécutifs découlant de votre utilisation de la plateforme.
                    </p>
                </section>

                <section>
                    <h3 className="font-semibold text-base text-white mb-2">6. Modifications des CGU</h3>
                    <p>
                        Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications seront effectives immédiatement
                        après la publication. Votre utilisation continue de la plateforme implique votre acceptation des modifications.
                    </p>
                </section>
            </div>
        </LiquidModal>
    )
}
