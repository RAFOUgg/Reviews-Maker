/**
 * Modal de vérification d'âge
 * Affichée au premier accès pour vérifier date de naissance + pays
 */

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDatePicker from 'react-datepicker';
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

    // UI helpers to enforce readable contrast on dark backgrounds
    const labelClasses = 'block text-sm font-semibold text-white mb-2';
    const inputClasses = 'w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500';
    const selectClasses = 'w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="max-w-md w-full bg-gray-900 text-white rounded-2xl shadow-2xl border border-violet-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-violet-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-2xl font-bold">
                        {t('ageVerification.title', 'Vérification de l\'âge')}
                    </h2>
                </div>

                <p className="text-sm text-gray-300 mb-6">
                    {t('ageVerification.description', 'Pour accéder à cette plateforme, vous devez confirmer que vous avez l\'âge légal dans votre pays.')}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Date de naissance */}
                    <div>
                        <label className={labelClasses}>
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
                            className={inputClasses}
                            popperClassName="z-50"
                            calendarClassName="bg-gray-900 text-white border border-violet-500/30 rounded-xl shadow-2xl p-3"
                            dayClassName={() => 'text-sm text-gray-100 hover:!bg-violet-600 hover:!text-white focus:!bg-violet-600 focus:!text-white rounded-full'}
                            weekDayClassName={() => 'text-violet-300 text-xs font-semibold'}
                            required
                        />
                        <p className="mt-2 text-xs text-gray-400">
                            {t('ageVerification.hint', 'Nous vérifions uniquement votre éligibilité, aucune donnée n\'est partagée.')}
                        </p>
                    </div>

                    {/* Pays */}
                    <div>
                        <label className={labelClasses}>
                            {t('ageVerification.country', 'Pays')}
                        </label>
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={selectClasses}
                            required
                        >
                            <option value="">{t('ageVerification.selectCountry', 'Sélectionnez un pays')}</option>
                            {allowedCountries.map((c) => (
                                <option key={c.code} value={c.code}>
                                    {t(`countries.${c.code}`, c.name || c.code)} (min. {c.minAge} ans)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* État US si applicable */}
                    {country === 'US' && (
                        <div>
                            <label className={labelClasses}>
                                {t('ageVerification.state', 'État')}
                            </label>
                            <select
                                value={region}
                                onChange={(e) => setRegion(e.target.value)}
                                className={selectClasses}
                                required
                            >
                                <option value="">{t('ageVerification.selectState', 'Sélectionnez un état')}</option>
                                {(allowedRegions.US || DEFAULT_US_STATES).map((s) => (
                                    <option key={s.code} value={s.code}>{s.name || s.code}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Erreur */}
                    {error && (
                        <div className="bg-red-900/40 border border-red-700 rounded-lg p-3" role="alert">
                            <p className="text-sm text-red-100">{error}</p>
                        </div>
                    )}

                    {/* Bouton */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-violet-400"
                    >
                        {loading
                            ? t('ageVerification.verifying', 'Vérification...')
                            : t('ageVerification.verify', 'Vérifier mon âge')}
                    </button>
                </form>

                <p className="text-xs text-gray-400 mt-4 text-center">
                    {t('ageVerification.privacy', 'Vos données sont confidentielles et utilisées uniquement pour vérifier votre éligibilité.')}
                </p>
            </div>
        </div>
    );
};

export default AgeVerification;
