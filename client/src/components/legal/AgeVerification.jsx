/**
 * Modal de vérification d'âge
 * Version simplifiée et robuste
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDatePicker from 'react-datepicker';
import { ShieldCheck, Calendar, Globe, MapPin, Loader2 } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const DEFAULT_COUNTRIES = [
    { code: 'FR', minAge: 18, name: 'France' },
    { code: 'CA', minAge: 18, name: 'Canada' },
    { code: 'US', minAge: 21, name: 'États-Unis' },
    { code: 'ES', minAge: 18, name: 'Espagne' },
    { code: 'NL', minAge: 18, name: 'Pays-Bas' },
    { code: 'DE', minAge: 18, name: 'Allemagne' },
    { code: 'PT', minAge: 18, name: 'Portugal' },
    { code: 'CH', minAge: 18, name: 'Suisse' },
    { code: 'BE', minAge: 18, name: 'Belgique' },
    { code: 'LU', minAge: 18, name: 'Luxembourg' },
];

const DEFAULT_US_STATES = [
    { code: 'CA', name: 'Californie' },
    { code: 'CO', name: 'Colorado' },
    { code: 'NY', name: 'New York' },
    { code: 'WA', name: 'Washington' },
    { code: 'OR', name: 'Oregon' },
    { code: 'NV', name: 'Nevada' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'IL', name: 'Illinois' },
    { code: 'MI', name: 'Michigan' },
    { code: 'AZ', name: 'Arizona' },
];

const AgeVerification = ({ isOpen, onVerified, onReject }) => {
    const { t } = useTranslation();
    const [birthdate, setBirthdate] = useState(null);
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [allowedCountries, setAllowedCountries] = useState(DEFAULT_COUNTRIES);

    useEffect(() => {
        const fetchAllowedCountries = async () => {
            try {
                const response = await fetch('/api/legal/countries', { credentials: 'include' });
                if (!response.ok) return;
                const data = await response.json();
                if (data.countries && Array.isArray(data.countries)) {
                    const normalized = data.countries.map((c) => ({
                        code: c.code,
                        minAge: c.minimumAge || 18,
                        name: DEFAULT_COUNTRIES.find(d => d.code === c.code)?.name || c.code,
                    }));
                    setAllowedCountries(normalized);
                }
            } catch (err) {
                console.warn('Fallback local utilisé pour les pays');
            }
        };
        if (isOpen) fetchAllowedCountries();
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        setError('');
        setLoading(true);

        if (!birthdate || !country) {
            setError('Veuillez remplir tous les champs');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/legal/verify-age', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    birthdate: birthdate.toISOString(),
                    country,
                    region: country === 'US' ? region : null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'underage') {
                    onReject?.(data.message || 'Vous devez avoir l\'âge légal pour accéder à cette plateforme');
                } else if (data.error === 'country_not_allowed') {
                    setError('Ce pays ne permet pas l\'accès à cette plateforme');
                } else if (data.error === 'unauthorized') {
                    setError('Session expirée. Veuillez vous reconnecter.');
                } else {
                    setError(data.message || 'Erreur lors de la vérification');
                }
                setLoading(false);
                return;
            }

            onVerified?.(data);
        } catch (err) {
            console.error('Erreur vérification âge:', err);
            setError('Erreur réseau, veuillez réessayer');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-gradient-to-br from-[#1a1a2e] to-[#16162a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Vérification de l'âge</h2>
                            <p className="text-sm text-white/50">Accès réservé aux adultes</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    <p className="text-sm text-white/60">
                        Pour accéder à cette plateforme, vous devez confirmer que vous avez l'âge légal dans votre pays.
                    </p>

                    {/* Date de naissance */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <Calendar className="w-4 h-4 text-violet-400" />
                            Date de naissance
                        </label>
                        <ReactDatePicker
                            selected={birthdate}
                            onChange={(date) => setBirthdate(date)}
                            dateFormat="dd/MM/yyyy"
                            maxDate={new Date()}
                            showYearDropdown
                            scrollableYearDropdown
                            yearDropdownItemNumber={100}
                            placeholderText="JJ/MM/AAAA"
                            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-violet-500/50 focus:outline-none"
                        />
                        <p className="text-xs text-white/40">
                            Nous vérifions uniquement votre éligibilité.
                        </p>
                    </div>

                    {/* Pays */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <Globe className="w-4 h-4 text-violet-400" />
                            Pays
                        </label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-violet-500/50 focus:outline-none appearance-none cursor-pointer"
                        >
                            <option value="" className="bg-[#1a1a2e]">Sélectionnez un pays</option>
                            {allowedCountries.map((c) => (
                                <option key={c.code} value={c.code} className="bg-[#1a1a2e]">
                                    {c.name} (min. {c.minAge} ans)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* État US si applicable */}
                    {country === 'US' && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-white">
                                <MapPin className="w-4 h-4 text-violet-400" />
                                État
                            </label>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white focus:border-violet-500/50 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-[#1a1a2e]">Sélectionnez un état</option>
                                {DEFAULT_US_STATES.map((s) => (
                                    <option key={s.code} value={s.code} className="bg-[#1a1a2e]">
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Erreur */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    <p className="text-xs text-white/40 text-center">
                        Vos données sont confidentielles et utilisées uniquement pour vérifier votre éligibilité.
                    </p>
                </div>

                {/* Footer avec le bouton */}
                <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !birthdate || !country}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all
                            ${loading || !birthdate || !country
                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-purple-500/25'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Vérification...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-5 h-5" />
                                Vérifier mon âge
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgeVerification;
