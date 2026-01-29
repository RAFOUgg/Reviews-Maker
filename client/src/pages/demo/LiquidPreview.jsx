import React from 'react'
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'
import { Plus, Search, Settings } from 'lucide-react'

export default function LiquidPreview() {
    return (
        <div className="min-h-screen bg-app flex items-start justify-center py-12 px-6 no-panel-bg">
            <div className="w-full max-w-5xl space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl text-title">Liquid Glass — Preview</h1>
                    <div className="flex items-center gap-3">
                        <LiquidButton variant="secondary" size="md" className="" icon={Search}>Recherche</LiquidButton>
                        <LiquidButton variant="primary" size="md" icon={Plus}>Créer</LiquidButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LiquidCard padding="lg" className="col-span-2" hover>
                        <div className="space-y-4">
                            <h2 className="text-2xl text-title">Dashboard</h2>
                            <p className="text-muted">Exemple de carte principale avec contenu et actions.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-muted text-sm">Nom</label>
                                    <input className="input-surface w-full rounded-lg px-3 py-2" placeholder="Ex: Purple Haze" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-muted text-sm">Type</label>
                                    <select className="input-surface w-full rounded-lg px-3 py-2">
                                        <option>Fleur</option>
                                        <option>Hash</option>
                                        <option>Concentré</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <LiquidButton variant="primary">Enregistrer</LiquidButton>
                                <LiquidButton variant="ghost">Annuler</LiquidButton>
                            </div>
                        </div>
                    </LiquidCard>

                    <LiquidCard padding="md" className="col-span-1" hover>
                        <div className="space-y-4">
                            <h3 className="text-lg text-title">Actions rapides</h3>
                            <p className="text-muted text-sm">Outils et raccourcis</p>

                            <div className="flex flex-col gap-3">
                                <LiquidButton variant="secondary" icon={Settings}>Paramètres</LiquidButton>
                                <LiquidButton variant="outline">Exporter</LiquidButton>
                                <LiquidButton variant="danger">Supprimer</LiquidButton>
                            </div>
                        </div>
                    </LiquidCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LiquidCard padding="md" hover>
                        <h4 className="text-title">Statut</h4>
                        <p className="text-muted">Montée rapide, intensité, etc.</p>
                    </LiquidCard>
                    <LiquidCard padding="md" hover>
                        <h4 className="text-title">Odeurs & Goûts</h4>
                        <p className="text-muted">Exemples de listes et chips</p>
                    </LiquidCard>
                    <LiquidCard padding="md" hover>
                        <h4 className="text-title">Pipeline</h4>
                        <p className="text-muted">Aperçu du pipeline</p>
                    </LiquidCard>
                </div>
            </div>
        </div>
    )
}
