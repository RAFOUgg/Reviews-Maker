import { useEffect, useRef, useState } from 'react'
import { LiquidCard, LiquidButton, LiquidInput, LiquidSelect, LiquidBadge } from '@/components/ui/LiquidUI'
import {
    Scale, Building2, MapPin, FileCheck, Upload, Search, ShieldCheck, ShieldAlert,
    Clock, XCircle, Save
} from 'lucide-react'
import { companyLegalService } from '../../../services/apiService'
import { useToast } from '../../../components/shared/ToastContainer'

/**
 * Dossier légal de l'entreprise : identité juridique, siège social, justificatif KYC.
 *
 * Ces informations identifient la personne morale responsable des données publiées — elles
 * deviennent nécessaires dès qu'un compte pro publie commercialement. Le SIRET sert de clé :
 * il permet de pré-remplir l'essentiel depuis le registre officiel (INSEE), ce qui évite une
 * ressaisie longue et fautive.
 */

const BUSINESS_TYPES = [
    { value: 'farm', label: 'Producteur / Exploitation agricole' },
    { value: 'laboratory', label: 'Laboratoire' },
    { value: 'extractor', label: 'Extracteur' },
    { value: 'manufacturer', label: 'Fabricant / Transformateur' },
    { value: 'distributor', label: 'Distributeur' },
    { value: 'other', label: 'Autre' },
]

const VERIFICATION_BADGES = {
    verified: { variant: 'success', icon: ShieldCheck, label: 'Vérifiée' },
    pending: { variant: 'warning', icon: Clock, label: 'En cours d’examen' },
    rejected: { variant: 'danger', icon: XCircle, label: 'Refusée' },
    none: { variant: 'default', icon: ShieldAlert, label: 'Non vérifiée' },
}

// Champ de saisie simple, pour éviter de répéter le label et l'aide sur chaque ligne.
function Field({ label, hint, children }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs text-white/50 uppercase tracking-wider font-semibold">{label}</label>
            {children}
            {hint && <p className="text-xs text-white/35">{hint}</p>}
        </div>
    )
}

export default function CompanyLegalSection({ canEdit = true, onSaved }) {
    const toast = useToast()
    const fileInputRef = useRef(null)

    const [form, setForm] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [lookingUp, setLookingUp] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState(null) // verificationStatus + doc + motif de refus

    useEffect(() => {
        let active = true
        companyLegalService.get()
            .then(p => {
                if (!active) return
                setForm({
                    companyName: p.companyName || '',
                    businessType: p.businessType || 'farm',
                    siret: p.siret || '',
                    legalForm: p.legalForm || '',
                    siren: p.siren || '',
                    vatNumber: p.vatNumber || '',
                    nafCode: p.nafCode || '',
                    shareCapital: p.shareCapital || '',
                    registeredAt: p.registeredAt ? String(p.registeredAt).slice(0, 10) : '',
                    addressLine: p.addressLine || '',
                    postalCode: p.postalCode || '',
                    city: p.city || '',
                    country: p.country || 'FR',
                    rcsCity: p.rcsCity || '',
                    legalRepresentative: p.legalRepresentative || '',
                    licenseNumber: p.licenseNumber || '',
                })
                setStatus({
                    verificationStatus: p.verificationStatus || 'none',
                    verificationDoc: p.verificationDoc,
                    verificationRejectionReason: p.verificationRejectionReason,
                })
            })
            .catch(() => { if (active) setForm(null) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [])

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

    // Interroge le registre officiel et pré-remplit ce qui en revient, sans écraser ce que
    // l'utilisateur a déjà saisi lui-même.
    const handleLookup = async () => {
        if (!form.siret.trim()) return
        setLookingUp(true)
        try {
            const r = await companyLegalService.lookupSiret(form.siret)

            if (!r.validFormat) {
                toast.error('SIRET invalide : 14 chiffres et clé de contrôle attendus.')
                return
            }
            if (r.found === false) {
                toast.error('Aucune entreprise trouvée avec ce SIRET au registre officiel.')
                return
            }
            if (r.found === null) {
                toast.warning('Registre officiel injoignable. Vous pouvez saisir les informations à la main.')
                return
            }

            setForm(prev => ({
                ...prev,
                companyName: prev.companyName || r.officialName || '',
                legalForm: prev.legalForm || r.legalForm || '',
                siren: r.siren || prev.siren,
                vatNumber: r.vatNumber || prev.vatNumber,
                nafCode: prev.nafCode || r.activityCode || '',
                addressLine: prev.addressLine || r.addressLine || '',
                postalCode: prev.postalCode || r.postalCode || '',
                city: prev.city || r.city || '',
                registeredAt: prev.registeredAt || (r.registeredAt ? String(r.registeredAt).slice(0, 10) : ''),
            }))

            toast.success(
                r.active === false
                    ? 'Entreprise trouvée, mais signalée comme cessée au registre.'
                    : 'Informations récupérées depuis le registre officiel.'
            )
        } catch (err) {
            toast.error(err.message || 'La vérification a échoué')
        } finally {
            setLookingUp(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await companyLegalService.save(form)
            toast.success('Informations légales enregistrées')
            onSaved?.()
        } catch (err) {
            toast.error(err.message || 'Enregistrement impossible')
        } finally {
            setSaving(false)
        }
    }

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const r = await companyLegalService.uploadDocument(file)
            setStatus(prev => ({ ...prev, verificationDoc: r.path || r.document || 'envoyé' }))
            toast.success('Justificatif envoyé')
        } catch (err) {
            toast.error(err.message || 'Envoi impossible')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const handleRequestVerification = async () => {
        setSaving(true)
        try {
            // On enregistre avant de soumettre : l'examen doit porter sur les données à l'écran.
            await companyLegalService.save(form)
            await companyLegalService.requestVerification({
                companyName: form.companyName,
                businessType: form.businessType,
                siret: form.siret,
                country: form.country,
            })
            setStatus(prev => ({ ...prev, verificationStatus: 'pending' }))
            toast.success('Dossier soumis à vérification')
            onSaved?.()
        } catch (err) {
            toast.error(err.message || 'Soumission impossible')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <p className="text-white/50 py-8 text-center">Chargement…</p>

    if (!form) {
        return (
            <LiquidCard glow="amber" padding="lg">
                <p className="text-white/50 text-sm">
                    Aucune entreprise n’est associée à votre compte : ces informations ne s’appliquent pas.
                </p>
            </LiquidCard>
        )
    }

    const badge = VERIFICATION_BADGES[status?.verificationStatus] || VERIFICATION_BADGES.none
    const BadgeIcon = badge.icon
    const readOnly = !canEdit

    return (
        <div className="space-y-6">
            {/* Statut de vérification */}
            <LiquidCard glow={status?.verificationStatus === 'verified' ? 'green' : 'amber'} padding="lg">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <FileCheck className="w-5 h-5" />
                            Vérification de l’entreprise
                        </h3>
                        <p className="text-white/50 text-sm mt-1">
                            {status?.verificationStatus === 'verified'
                                ? 'Votre entreprise est vérifiée : vous pouvez publier publiquement.'
                                : 'La vérification est requise pour publier vos reviews publiquement.'}
                        </p>
                    </div>
                    <LiquidBadge variant={badge.variant} size="sm">
                        <BadgeIcon className="w-4 h-4 mr-1 inline" />{badge.label}
                    </LiquidBadge>
                </div>

                {status?.verificationStatus === 'rejected' && status.verificationRejectionReason && (
                    <div className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/10">
                        <p className="text-sm text-red-300">
                            <strong>Motif du refus :</strong> {status.verificationRejectionReason}
                        </p>
                    </div>
                )}

                {canEdit && (
                    <div className="mt-4 flex flex-wrap gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleUpload}
                            className="hidden"
                        />
                        <LiquidButton
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading ? 'Envoi…' : status?.verificationDoc ? 'Remplacer le justificatif' : 'Joindre un justificatif (Kbis…)'}
                        </LiquidButton>

                        {status?.verificationStatus !== 'pending' && status?.verificationStatus !== 'verified' && (
                            <LiquidButton glow="green" onClick={handleRequestVerification} disabled={saving}>
                                Demander la vérification
                            </LiquidButton>
                        )}
                    </div>
                )}
            </LiquidCard>

            {/* Identité juridique */}
            <LiquidCard glow="purple" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                    <Scale className="w-5 h-5" />
                    Identité juridique
                </h3>
                <p className="text-white/50 text-sm mb-5">
                    Renseignez le SIRET puis lancez la recherche : le registre officiel remplit le reste.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="SIRET" hint="14 chiffres. Sert de clé pour le pré-remplissage.">
                        <div className="flex gap-2">
                            <LiquidInput
                                value={form.siret}
                                onChange={(e) => set('siret', e.target.value)}
                                placeholder="123 456 789 00012"
                                disabled={readOnly}
                            />
                            <LiquidButton
                                variant="secondary"
                                onClick={handleLookup}
                                disabled={readOnly || lookingUp || !form.siret.trim()}
                            >
                                <Search className="w-4 h-4" />
                                {lookingUp ? '…' : ''}
                            </LiquidButton>
                        </div>
                    </Field>

                    <Field label="Raison sociale">
                        <LiquidInput value={form.companyName} onChange={(e) => set('companyName', e.target.value)} disabled={readOnly} />
                    </Field>

                    <Field label="Forme juridique" hint="SAS, SARL, EI…">
                        <LiquidInput value={form.legalForm} onChange={(e) => set('legalForm', e.target.value)} placeholder="SAS" disabled={readOnly} />
                    </Field>

                    <Field label="Type d’activité">
                        <LiquidSelect
                            value={form.businessType}
                            onChange={(v) => set('businessType', v)}
                            options={BUSINESS_TYPES}
                            disabled={readOnly}
                        />
                    </Field>

                    <Field label="SIREN" hint="Déduit automatiquement du SIRET.">
                        <LiquidInput value={form.siren} disabled />
                    </Field>

                    <Field label="TVA intracommunautaire" hint="Calculée à partir du SIREN.">
                        <LiquidInput value={form.vatNumber} disabled />
                    </Field>

                    <Field label="Code APE / NAF">
                        <LiquidInput value={form.nafCode} onChange={(e) => set('nafCode', e.target.value)} placeholder="01.19Z" disabled={readOnly} />
                    </Field>

                    <Field label="Capital social">
                        <LiquidInput value={form.shareCapital} onChange={(e) => set('shareCapital', e.target.value)} placeholder="10 000 €" disabled={readOnly} />
                    </Field>

                    <Field label="Date de création">
                        <LiquidInput type="date" value={form.registeredAt} onChange={(e) => set('registeredAt', e.target.value)} disabled={readOnly} />
                    </Field>

                    <Field label="RCS — ville du greffe">
                        <LiquidInput value={form.rcsCity} onChange={(e) => set('rcsCity', e.target.value)} placeholder="Lille" disabled={readOnly} />
                    </Field>
                </div>
            </LiquidCard>

            {/* Siège social */}
            <LiquidCard glow="cyan" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                    <MapPin className="w-5 h-5" />
                    Siège social
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Field label="Adresse">
                            <LiquidInput value={form.addressLine} onChange={(e) => set('addressLine', e.target.value)} disabled={readOnly} />
                        </Field>
                    </div>
                    <Field label="Code postal">
                        <LiquidInput value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} disabled={readOnly} />
                    </Field>
                    <Field label="Ville">
                        <LiquidInput value={form.city} onChange={(e) => set('city', e.target.value)} disabled={readOnly} />
                    </Field>
                    <Field label="Pays">
                        <LiquidInput value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="FR" disabled={readOnly} />
                    </Field>
                </div>
            </LiquidCard>

            {/* Représentation & autorisations */}
            <LiquidCard glow="default" padding="lg">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                    <Building2 className="w-5 h-5" />
                    Représentation et autorisations
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Représentant légal" hint="Gérant, président… la personne qui engage la société.">
                        <LiquidInput value={form.legalRepresentative} onChange={(e) => set('legalRepresentative', e.target.value)} disabled={readOnly} />
                    </Field>
                    <Field label="Numéro de licence / autorisation" hint="Si votre activité en exige une.">
                        <LiquidInput value={form.licenseNumber} onChange={(e) => set('licenseNumber', e.target.value)} disabled={readOnly} />
                    </Field>
                </div>
            </LiquidCard>

            {canEdit ? (
                <LiquidButton glow="green" onClick={handleSave} disabled={saving} fullWidth size="lg">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Enregistrement…' : 'Enregistrer les informations légales'}
                </LiquidButton>
            ) : (
                <p className="text-sm text-white/40 text-center">
                    Seul le titulaire du compte peut modifier les informations légales de l’entreprise.
                </p>
            )}
        </div>
    )
}
