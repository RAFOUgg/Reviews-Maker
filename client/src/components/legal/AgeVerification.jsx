/**
 * Modal de vérification d'âge
 * Affichée au premier accès pour vérifier date de naissance + pays
 * Liquid Glass UI Design System
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDatePicker from 'react-datepicker';
import { LiquidModal, LiquidButton, LiquidSelect, LiquidCard } from '@/components/ui/LiquidUI';
import { ShieldCheck, Calendar, Globe, MapPin, Loader2 } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';

const DEFAULT_COUNTRIES = [
    { code: 'CA', minAge: 18 },
    { code: 'US', minAge: 21 },
    { code: 'FR', minAge: 18 },
    { code: 'ES', minAge: 18 },
    { code: 'NL', minAge: 18 },
    { code: 'DE', minAge: 18 },
    { code: 'PT', minAge: 18 },
    { code: 'UY', minAge: 18 },
    { code: 'MX', minAge: 18 },
];

const DEFAULT_US_STATES = [
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'CA', name: 'Californie' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'IL', name: 'Illinois' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'Nouveau-Mexique' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NY', name: 'New York' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OR', name: 'Oregon' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginie' },
    { code: 'WA', name: 'Washington' },
];

const COUNTRY_LABELS = {
    CA: 'Canada',
    US: 'États-Unis',
    FR: 'France',
    ES: 'Espagne',
    NL: 'Pays-Bas',
    DE: 'Allemagne',
    PT: 'Portugal',
    UY: 'Uruguay',
    MX: 'Mexique',
    CH: 'Suisse',
    LU: 'Luxembourg',
    MT: 'Malte',
    IL: 'Israël',
    TH: 'Thaïlande',
    AU: 'Australie',
    NZ: 'Nouvelle-Zélande',
    ZA: 'Afrique du Sud',
};

const REGION_LABELS = {
    US: DEFAULT_US_STATES.reduce((acc, state) => ({ ...acc, [state.code]: state.name }), {}),
};

const AgeVerification = ({ isOpen, onVerified, onReject }) => {
    const { t } = useTranslation();
    const [birthdate, setBirthdate] = useState(null);
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [allowedCountries, setAllowedCountries] = useState(DEFAULT_COUNTRIES);
    const [allowedRegions, setAllowedRegions] = useState({ US: DEFAULT_US_STATES });

    useEffect(() => {
        const fetchAllowedCountries = async () => {
            try {
                const response = await fetch('/api/legal/countries', { credentials: 'include' });
                if (!response.ok) return;
                const data = await response.json();

                const normalizedCountries = data.countries.map((c) => ({
                    code: c.code,
                    minAge: c.minimumAge || 18,
                    name: COUNTRY_LABELS[c.code] || c.code,
                }));

                const regions = {};
                data.countries.forEach((c) => {
                    if (Array.isArray(c.regions) && c.regions.length > 0) {
                        regions[c.code] = c.regions.map((r) => ({
                            code: r.code,
                            name: (REGION_LABELS[c.code] && REGION_LABELS[c.code][r.code]) || r.code,
                        }));
                    }
                });

                setAllowedCountries(normalizedCountries);
                setAllowedRegions((prev) => ({ ...prev, ...regions }));
            } catch (err) {
                console.warn('Impossible de charger les pays autorisés, fallback local utilisé:', err);
            }
        };

        if (isOpen) {
            fetchAllowedCountries();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!birthdate || !country) {
            setError(t('ageVerification.errorMissingFields', 'Veuillez remplir tous les champs'));
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
                    onReject(data.message);
                } else if (data.error === 'country_not_allowed') {
                    setError(t('ageVerification.countryNotAllowed', 'Ce pays ne permet pas l\'accès à cette plateforme'));
                } else {
                    setError(data.message || t('ageVerification.errorGeneric', 'Erreur lors de la vérification'));
                }
                setLoading(false);
                return;
            }

            onVerified(data);
        } catch (err) {
            console.error('Erreur vérification âge:', err);
            setError(t('ageVerification.errorNetwork', 'Erreur réseau, veuillez réessayer'));
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <LiquidModal
            isOpen={true}
            onClose={() => { }}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
                        <ShieldCheck className="w-6 h-6 text-violet-400" />
                    </div>
                    <span className="text-xl font-bold text-white">
                        {t('ageVerification.title', 'Vérification de l\'âge')}
                    </span>
                </div>
            }
            size="lg"
            glowColor="violet"
            footer={
                <LiquidButton
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={loading || !birthdate || !country}
                    loading={loading}
                    className="w-full"
                    icon={ShieldCheck}
                >
                    {loading
                        ? t('ageVerification.verifying', 'Vérification...')
                        : t('ageVerification.verify', 'Vérifier mon âge')}
                </LiquidButton>
            }
        >
            <div className="space-y-5">
                <p className="text-sm text-white/60">
                    {t('ageVerification.description', 'Pour accéder à cette plateforme, vous devez confirmer que vous avez l\'âge légal dans votre pays.')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date de naissance */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <Calendar className="w-4 h-4 text-violet-400" />
                            {t('ageVerification.birthdate', 'Date de naissance')}
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
                            className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
                            popperClassName="react-datepicker-popper"
                            portalId="datepicker-portal"
                            required
                        />
                        <p className="text-xs text-white/40">
                            {t('ageVerification.hint', 'Nous vérifions uniquement votre éligibilité, aucune donnée n\'est partagée.')}
                        </p>
                    </div>

                    {/* Pays */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <Globe className="w-4 h-4 text-violet-400" />
                            {t('ageVerification.country', 'Pays')}
                        </label>
                        <LiquidSelect
                            value={country}
                            onChange={(value) => setCountry(value)}
                            options={[
                                { value: '', label: t('ageVerification.selectCountry', 'Sélectionnez un pays') },
                                ...allowedCountries.map((c) => ({
                                    value: c.code,
                                    label: `${t(`countries.${c.code}`, c.name || c.code)} (min. ${c.minAge} ans)`
                                }))
                            ]}
                        />
                    </div>

                    {/* État US si applicable */}
                    {country === 'US' && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-white">
                                <MapPin className="w-4 h-4 text-violet-400" />
                                {t('ageVerification.state', 'État')}
                            </label>
                            <LiquidSelect
                                value={region}
                                onChange={(value) => setRegion(value)}
                                options={[
                                    { value: '', label: t('ageVerification.selectState', 'Sélectionnez un état') },
                                    ...(allowedRegions.US || DEFAULT_US_STATES).map((s) => ({
                                        value: s.code,
                                        label: s.name || s.code
                                    }))
                                ]}
                            />
                        </div>
                    )}

                    {/* Erreur */}
                    {error && (
                        <LiquidCard className="p-3" style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            borderColor: 'rgba(239, 68, 68, 0.3)'
                        }}>
                            <p className="text-sm text-red-400">{error}</p>
                        </LiquidCard>
                    )}
                </form>

                <p className="text-xs text-white/40 text-center">
                    {t('ageVerification.privacy', 'Vos données sont confidentielles et utilisées uniquement pour vérifier votre éligibilité.')}
                </p>
            </div>
        </LiquidModal>
    );
};

export default AgeVerification;
