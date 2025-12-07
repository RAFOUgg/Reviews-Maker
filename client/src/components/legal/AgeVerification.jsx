/**
 * Modal de vérification d'âge
 * Affichée au premier accès pour vérifier date de naissance + pays
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AgeVerification = ({ isOpen, onVerified, onReject }) => {
    const { t } = useTranslation();
    const [birthdate, setBirthdate] = useState(null);
    const [country, setCountry] = useState('');
    const [region, setRegion] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // UI helpers to enforce readable contrast on dark backgrounds
    const labelClasses = 'block text-sm font-semibold text-white mb-2';
    const inputClasses = 'w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500';
    const selectClasses = 'w-full px-4 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

    // Liste des pays légaux (à synchroniser avec backend)
    const LEGAL_COUNTRIES = [
        { code: 'CA', name: t('countries.CA', 'Canada'), minAge: 18 },
        { code: 'US', name: t('countries.US', 'États-Unis'), minAge: 21 },
        { code: 'FR', name: t('countries.FR', 'France'), minAge: 18 },
        { code: 'ES', name: t('countries.ES', 'Espagne'), minAge: 18 },
        { code: 'NL', name: t('countries.NL', 'Pays-Bas'), minAge: 18 },
        { code: 'DE', name: t('countries.DE', 'Allemagne'), minAge: 18 },
        { code: 'PT', name: t('countries.PT', 'Portugal'), minAge: 18 },
        { code: 'UY', name: t('countries.UY', 'Uruguay'), minAge: 18 },
        { code: 'MX', name: t('countries.MX', 'Mexique'), minAge: 18 },
    ];

    // États US légaux
    const US_STATES = [
        { code: 'CA', name: 'Californie' },
        { code: 'CO', name: 'Colorado' },
        { code: 'WA', name: 'Washington' },
        { code: 'OR', name: 'Oregon' },
        { code: 'NV', name: 'Nevada' },
        { code: 'AZ', name: 'Arizona' },
        { code: 'NY', name: 'New York' },
        { code: 'IL', name: 'Illinois' },
        return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="max-w-md w-full bg-gray-900 text-white rounded-2xl shadow-2xl border border-violet-500/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <svg className="w-8 h-8 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
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
                            {LEGAL_COUNTRIES.map(c => (
                                <option key={c.code} value={c.code}>
                                    {c.name} (min. {c.minAge} ans)
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
                                {US_STATES.map(s => (
                                    <option key={s.code} value={s.code}>{s.name}</option>
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
    { c.name } (min. { c.minAge } ans)
                                </option >
                            ))}
                        </select >
                    </div >

    {/* État US si applicable */ }
{
    country === 'US' && (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('ageVerification.state', 'État')}
            </label>
            <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                required
            >
                <option value="">{t('ageVerification.selectState', 'Sélectionnez un état')}</option>
                {US_STATES.map(s => (
                    <option key={s.code} value={s.code}>{s.name}</option>
                ))}
            </select>
        </div>
    )
}

{/* Erreur */ }
{
    error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
    )
}

{/* Bouton */ }
<button
    type="submit"
    disabled={loading}
    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
    {loading
        ? t('ageVerification.verifying', 'Vérification...')
        : t('ageVerification.verify', 'Vérifier mon âge')}
</button>
                </form >

    <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
        {t('ageVerification.privacy', 'Vos données sont confidentielles et utilisées uniquement pour vérifier votre éligibilité.')}
    </p>
            </div >
        </div >
    );
};

export default AgeVerification;
