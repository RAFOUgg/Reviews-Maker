import React, { useState, useRef, useEffect } from 'react'
import '../../assets/liquid-visuals.css'
import LiquidCard from '../../components/ui/LiquidCard'
import LiquidButton from '../../components/ui/LiquidButton'
import { Plus, Search, Settings } from 'lucide-react'

const SimpleSelect = ({ options = [], value, onChange, placeholder = 'Select' }) => {
    const [open, setOpen] = useState(false)
    const ref = useRef()

    useEffect(() => {
        const onDoc = (e) => {
            if (!ref.current) return
            if (!ref.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('click', onDoc)
        return () => document.removeEventListener('click', onDoc)
    }, [])

    const selected = options.find((o) => o.value === value)

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="input-surface w-full rounded-lg px-3 py-2 text-left flex items-center justify-between"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={`${selected ? 'text-title' : 'text-muted'}`}>{selected?.label ?? placeholder}</span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="opacity-70"><path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>

            {open && (
                <div className="absolute z-20 mt-2 w-full bg-card border border-[var(--card-border)] rounded-lg shadow-lg p-2">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className="px-3 py-2 rounded hover:bg-white/5 cursor-pointer text-title"
                            onClick={() => {
                                onChange(opt.value)
                                setOpen(false)
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function LiquidPreview() {
    const [type, setType] = useState('Fleur')
    const [name, setName] = useState('')
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-app flex items-start justify-center py-12 px-6 no-panel-bg">
            <div className="w-full max-w-6xl space-y-8">
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
                                    <input value={name} onChange={(e) => setName(e.target.value)} className="input-surface w-full rounded-lg px-3 py-2" placeholder="Ex: Purple Haze" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-muted text-sm">Type</label>
                                    <SimpleSelect
                                        options={[{ value: 'Fleur', label: 'Fleur' }, { value: 'Hash', label: 'Hash' }, { value: 'Concentre', label: 'Concentré' }]}
                                        value={type}
                                        onChange={setType}
                                        placeholder="Choisir un type"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <LiquidButton variant="primary" onClick={() => setModalOpen(true)}>Enregistrer</LiquidButton>
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
                        <div className="flex gap-2 mt-3">
                            <span className="chip p-2 rounded-md bg-card text-muted">Montée rapide</span>
                            <span className="chip p-2 rounded-md bg-card text-muted">Fort</span>
                        </div>
                    </LiquidCard>
                    <LiquidCard padding="md" hover>
                        <h4 className="text-title">Odeurs & Goûts</h4>
                        <p className="text-muted">Exemples de listes et chips</p>
                        <div className="flex gap-2 mt-3 flex-wrap">
                            <span className="pill chip p-2 rounded-md bg-card text-muted">Agrumes</span>
                            <span className="pill chip p-2 rounded-md bg-card text-muted">Épicé</span>
                            <span className="pill chip p-2 rounded-md bg-card text-muted">Sucré</span>
                        </div>
                    </LiquidCard>
                    <LiquidCard padding="md" hover>
                        <h4 className="text-title">Pipeline</h4>
                        <p className="text-muted">Aperçu du pipeline</p>
                    </LiquidCard>
                </div>

                {/* Modal demo */}
                {modalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
                        <div className="relative w-full max-w-2xl">
                            <LiquidCard padding="lg" className="mx-4" hover={false}>
                                <div className="space-y-4">
                                    <h2 className="text-2xl text-title">Confirmer l'enregistrement</h2>
                                    <p className="text-muted">Vous êtes sur le point d'enregistrer la fiche "{name || '—'}" ({type}).</p>
                                    <div className="flex.justify-end flex-row-reverse gap-3 flex items-end justify-end">
                                        <div className="flex gap-3 justify-end">
                                            <LiquidButton variant="ghost" onClick={() => setModalOpen(false)}>Annuler</LiquidButton>
                                            <LiquidButton variant="primary" onClick={() => setModalOpen(false)}>Confirmer</LiquidButton>
                                        </div>
                                    </div>
                                </div>
                            </LiquidCard>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
