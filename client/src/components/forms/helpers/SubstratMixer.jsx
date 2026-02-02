import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * SubstratMixer - Gestionnaire de mélange de substrat personnalisé
 * Permet de composer un substrat avec plusieurs composants et leurs pourcentages
 * Validation automatique : total = 100%
 */
const SubstratMixer = ({ value = [], onChange, availableSubstrats = [] }) => {
    // État formulaire pour nouveau composant
    const [selectedSubstrat, setSelectedSubstrat] = useState('');
    const [percentage, setPercentage] = useState('');

    // Normaliser la valeur: peut être string JSON, csv ou déjà array
    const normalizedValue = Array.isArray(value) ? value : (typeof value === 'string' ? (() => {
        try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed; } catch (e) { }
        return value.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => ({ id: `legacy-${i}`, substrat: s, percentage: 0 }))
    })() : []);

    // Calculer le pourcentage total actuel
    const totalPercentage = normalizedValue.reduce((sum, item) => sum + parseFloat(item.percentage || 0), 0);
    const remainingPercentage = 100 - totalPercentage;

    /**
     * Validation avant ajout
     */
    const canAddComponent = () => {
        if (!selectedSubstrat || !percentage) return false;
        const pct = parseFloat(percentage);
        if (isNaN(pct) || pct <= 0 || pct > 100) return false;
        if (totalPercentage + pct > 100) return false;
        return true;
    };

    /**
     * Ajouter un composant au mélange
     */
    const handleAddComponent = () => {
        if (!canAddComponent()) return;

        const newComponent = {
            id: Date.now().toString(),
            substrat: selectedSubstrat,
            percentage: parseFloat(percentage)
        };

        onChange([...normalizedValue, newComponent]);

        // Reset formulaire
        setSelectedSubstrat('');
        setPercentage('');
    };

    /**
     * Supprimer un composant
     */
    const handleRemove = (id) => {
        onChange(normalizedValue.filter(item => item.id !== id));
    };

    /**
     * Modifier le pourcentage d'un composant existant
     */
    const handlePercentageChange = (id, newPercentage) => {
        const pct = parseFloat(newPercentage);
        if (isNaN(pct) || pct <= 0 || pct > 100) return;

        // Vérifier que le total ne dépasse pas 100%
        const otherTotal = normalizedValue
            .filter(item => item.id !== id)
            .reduce((sum, item) => sum + parseFloat(item.percentage), 0);

        if (otherTotal + pct > 100) return;

        onChange(normalizedValue.map(item =>
            item.id === id ? { ...item, percentage: pct } : item
        ));
    };

    /**
     * Réorganiser (monter/descendre)
     */
    const handleMoveUp = (index) => {
        if (index === 0) return;
        const newArray = [...normalizedValue];
        [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]];
        onChange(newArray);
    };

    const handleMoveDown = (index) => {
        if (index === value.length - 1) return;
        const newArray = [...normalizedValue];
        [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]];
        onChange(newArray);
    };

    return (
        <div className="space-y-4">
            {/* Formulaire d'ajout */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-sm font-medium text-white mb-3">🌱 Composer votre substrat</h4>

                <div className="space-y-3">
                    {/* Sélection du substrat */}
                    <div>
                        <label className="block text-xs text-white/60 mb-1">Composant</label>
                        <select
                            value={selectedSubstrat}
                            onChange={(e) => setSelectedSubstrat(e.target.value)}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-violet-500/20 focus:border-violet-500/50"
                        >
                            <option value="">Sélectionner un composant...</option>
                            {availableSubstrats.map((substrat) => (
                                <option key={substrat} value={substrat}>
                                    {substrat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Pourcentage */}
                    <div>
                        <label className="block text-xs text-white/60 mb-1">
                            Pourcentage ({remainingPercentage}% restant)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                max={remainingPercentage}
                                step="1"
                                value={percentage}
                                onChange={(e) => setPercentage(e.target.value)}
                                placeholder="Ex: 50"
                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-violet-500/20 focus:border-violet-500/50"
                            />
                            <span className="text-white text-sm font-medium">%</span>
                        </div>
                        {percentage && parseFloat(percentage) > remainingPercentage && (
                            <p className="text-xs text-red-400 mt-1">
                                ⚠️ Dépasse le total disponible ({remainingPercentage}%)
                            </p>
                        )}
                    </div>

                    {/* Bouton Ajouter */}
                    <button
                        type="button"
                        onClick={handleAddComponent}
                        disabled={!canAddComponent()}
                        className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${canAddComponent()
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                            }`}
                    >
                        ➕ Ajouter au mélange
                    </button>
                </div>
            </div>

            {/* Affichage du mélange actuel */}
            {value.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-white">
                            📋 Composition du substrat ({value.length} composant{value.length > 1 ? 's' : ''})
                        </h4>
                        <div className={`text-sm font-bold ${totalPercentage === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                            Total: {totalPercentage.toFixed(1)}%
                            {totalPercentage === 100 && ' ✓'}
                            {totalPercentage < 100 && ` (${remainingPercentage}% restant)`}
                        </div>
                    </div>

                    {totalPercentage !== 100 && (
                        <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">
                            ℹ️ Le total doit atteindre 100% pour être valide
                        </div>
                    )}

                    <div className="space-y-2">
                        {value.map((component, index) => (
                            <div
                                key={component.id}
                                className="bg-white/5 rounded-lg p-3 border border-white/10"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Numéro */}
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center text-green-400 text-xs font-bold">
                                        {index + 1}
                                    </div>

                                    {/* Infos */}
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-white text-sm mb-1">
                                            {component.substrat}
                                        </h5>

                                        {/* Pourcentage éditable */}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                step="1"
                                                value={component.percentage}
                                                onChange={(e) => handlePercentageChange(component.id, e.target.value)}
                                                className="w-20 px-2 py-1 bg-white/5 border border-white/10 rounded text-white text-xs focus:outline-none focus:ring-violet-500/20 focus:border-violet-500/50"
                                            />
                                            <span className="text-white/60 text-xs font-medium">%</span>
                                        </div>
                                    </div>

                                    {/* Contrôles */}
                                    <div className="flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0}
                                            className={`px-2 py-1 rounded text-xs ${index === 0
                                                ? 'text-white/30 cursor-not-allowed'
                                                : 'text-white/60 hover:text-white hover:bg-white/10'
                                                }`}
                                            title="Monter"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === value.length - 1}
                                            className={`px-2 py-1 rounded text-xs ${index === value.length - 1
                                                ? 'text-white/30 cursor-not-allowed'
                                                : 'text-white/60 hover:text-white hover:bg-white/10'
                                                }`}
                                            title="Descendre"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemove(component.id)}
                                            className="px-2 py-1 rounded text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            title="Supprimer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                {/* Barre de progression visuelle */}
                                <div className="mt-2">
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                                            style={{ width: `${component.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Barre de progression totale */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                            <span>Progression totale</span>
                            <span className="font-mono">{totalPercentage.toFixed(1)}% / 100%</span>
                        </div>
                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${totalPercentage === 100
                                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                                    : totalPercentage > 100
                                        ? 'bg-gradient-to-r from-red-500 to-red-400'
                                        : 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                                    }`}
                                style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

SubstratMixer.propTypes = {
    value: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            substrat: PropTypes.string.isRequired,
            percentage: PropTypes.number.isRequired
        })
    ),
    onChange: PropTypes.func.isRequired,
    availableSubstrats: PropTypes.arrayOf(PropTypes.string)
};

export default SubstratMixer;


