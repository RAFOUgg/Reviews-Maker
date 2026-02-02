/**
 * Stub tabs for Account Page - Phase 1
 * These are placeholders that will be expanded in future phases
 */

import React from 'react'
import { LiquidCard, LiquidButton, LiquidInput, LiquidSelect, LiquidBadge } from '@/components/ui/LiquidUI'
import { Palette, Globe, Building2, Upload, CreditCard, FileText, Landmark, HelpCircle, Book, MessageCircle, Activity } from 'lucide-react'

// Preferences Tab
export const PreferencesTab = ({ user, onStatusChange }) => {
    return (
        <div className="space-y-6">
            <LiquidCard glow="purple" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Palette className="w-5 h-5" />
                    Thème
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {[{ key: 'light', label: 'Clair' }, { key: 'dark', label: 'Sombre' }, { key: 'system', label: 'Système' }].map(theme => (
                        <button
                            key={theme.key}
                            className={`p-4 rounded-xl border text-center font-medium transition-all ${user?.theme === theme.key
                                ? 'border-purple-500 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20'
                                : 'border-white/10 text-white/60 hover:border-white/30 hover:bg-white/5'
                                }`}
                        >
                            {theme.label}
                        </button>
                    ))}
                </div>
            </LiquidCard>

            <LiquidCard glow="cyan" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5" />
                    Langue
                </h3>
                <LiquidSelect
                    value={user?.language || 'fr'}
                    options={[
                        { value: 'fr', label: 'Français' },
                        { value: 'en', label: 'English' },
                        { value: 'es', label: 'Español' },
                        { value: 'de', label: 'Deutsch' }
                    ]}
                />
            </LiquidCard>

            <LiquidButton glow="green" className="w-full">
                Sauvegarder les préférences
            </LiquidButton>
        </div>
    )
}

// Company Tab (Producteur only)
export const CompanyTab = ({ user }) => {
    return (
        <div className="space-y-6">
            <LiquidCard glow="amber" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5" />
                    Informations Entreprise
                </h3>
                <p className="text-white/50 text-sm mb-6">
                    Gérez les informations de votre entreprise pour la facturation et la vérification
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Nom de l'entreprise</label>
                        <LiquidInput placeholder="Nom de votre entreprise" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Numéro SIRET</label>
                        <LiquidInput placeholder="123 456 789 00012" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Type d'activité</label>
                        <LiquidInput placeholder="Production, Distribution..." />
                    </div>
                    <LiquidButton glow="green" className="w-full">
                        Sauvegarder
                    </LiquidButton>
                </div>
            </LiquidCard>
        </div>
    )
}

// KYC Tab (Producteur only)
export const KYCTab = ({ user }) => {
    return (
        <div className="space-y-6">
            <LiquidCard glow="cyan" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <Upload className="w-5 h-5" />
                    Vérification KYC
                </h3>
                <p className="text-white/50 text-sm mb-6">
                    Complétez votre vérification KYC pour débloquer les fonctionnalités Producteur
                </p>

                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
                    <p className="text-sm text-amber-400 flex items-center gap-2">
                        <span className="font-semibold">Statut:</span>
                        <LiquidBadge variant={user?.kycStatus === 'verified' ? 'success' : 'warning'}>
                            {user?.kycStatus === 'verified' ? '✓ Vérifié' : 'En attente'}
                        </LiquidBadge>
                    </p>
                </div>

                <LiquidButton glow="purple" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Télécharger les documents
                </LiquidButton>
            </LiquidCard>
        </div>
    )
}

// Payment Tab
export const PaymentTab = ({ user }) => {
    return (
        <div className="space-y-6">
            <LiquidCard glow="blue" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5" />
                    Moyens de Paiement
                </h3>
                <p className="text-white/50 text-sm mb-6">
                    Ajoutez ou gérez vos moyens de paiement
                </p>

                <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/10">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucun moyen de paiement enregistré</p>
                </div>

                <LiquidButton glow="purple" className="w-full mt-4">
                    Ajouter un moyen de paiement
                </LiquidButton>
            </LiquidCard>
        </div>
    )
}

// Invoices Tab
export const InvoicesTab = ({ user }) => {
    return (
        <div className="space-y-6">
            <LiquidCard glow="green" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5" />
                    Factures
                </h3>
                <p className="text-white/50 text-sm mb-6">
                    Consultez et téléchargez vos factures
                </p>

                <div className="text-center py-8 text-white/40 bg-white/5 rounded-xl border border-white/10">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune facture disponible</p>
                </div>
            </LiquidCard>
        </div>
    )
}

// Bank Tab (Producteur only)
export const BankTab = ({ user }) => {
    return (
        <div className="space-y-6">
            <LiquidCard glow="amber" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <Landmark className="w-5 h-5" />
                    Compte Bancaire
                </h3>
                <p className="text-white/50 text-sm mb-6">
                    Ajoutez votre compte bancaire pour la génération de factures et les paiements
                </p>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">Titulaire du compte</label>
                        <LiquidInput placeholder="Nom complet" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">IBAN</label>
                        <LiquidInput placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">SWIFT/BIC</label>
                        <LiquidInput placeholder="BNPAFRPP" />
                    </div>
                    <LiquidButton glow="green" className="w-full">
                        Sauvegarder le compte bancaire
                    </LiquidButton>
                </div>
            </LiquidCard>
        </div>
    )
}

// Support Tab
export const SupportTab = ({ user }) => {
    return (
        <div className="space-y-6">
            <LiquidCard padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <HelpCircle className="w-5 h-5" />
                    Aide & Support
                </h3>
                <p className="text-white/50 text-sm mb-6">
                    Obtenez de l'aide et explorez les ressources disponibles
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                        href="/docs"
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-purple-500/50 hover:bg-purple-500/10 transition-all group"
                    >
                        <Book className="w-6 h-6 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-white mb-1">Documentation</h4>
                        <p className="text-sm text-white/50">
                            Apprenez à utiliser Reviews-Maker
                        </p>
                    </a>
                    <a
                        href="/faq"
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all group"
                    >
                        <HelpCircle className="w-6 h-6 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-white mb-1">FAQ</h4>
                        <p className="text-sm text-white/50">
                            Réponses aux questions fréquentes
                        </p>
                    </a>
                    <a
                        href="/contact"
                        className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-green-500/50 hover:bg-green-500/10 transition-all group"
                    >
                        <MessageCircle className="w-6 h-6 text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                        <h4 className="font-semibold text-white mb-1">Contacter le support</h4>
                        <p className="text-sm text-white/50">
                            Entrez en contact avec notre équipe
                        </p>
                    </a>
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <Activity className="w-6 h-6 text-amber-400 mb-2" />
                        <h4 className="font-semibold text-white mb-1">Statut du système</h4>
                        <p className="text-sm text-white/50">
                            Vérifiez l'état des services
                        </p>
                    </div>
                </div>
            </LiquidCard>
        </div>
    )
}
