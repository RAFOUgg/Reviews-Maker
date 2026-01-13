import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const FertilizationPipeline = ({ value = [], onChange, availableFertilizers = [] }) => {
    // ✅ Garantir que value est toujours un tableau
    const safeValue = Array.isArray(value) ? value : [];

    const [steps, setSteps] = useState(safeValue);
    const [selectedFertilizer, setSelectedFertilizer] = useState('');
    const [phase, setPhase] = useState('croissance');
    const [commercialName, setCommercialName] = useState('');
    const [npk, setNpk] = useState({ n: '', p: '', k: '' });
    const [doseAmount, setDoseAmount] = useState('');
    const [doseUnit, setDoseUnit] = useState('ml/L');
    const [frequencyNumber, setFrequencyNumber] = useState('1');
    const [frequencyUnit, setFrequencyUnit] = useState('sem');

    useEffect(() => {
        const newValue = Array.isArray(value) ? value : [];
        setSteps(newValue);
    }, [value]);

    const isNPK = selectedFertilizer === 'Solutions nutritives NPK';
    const isCommercial = selectedFertilizer && !['Solutions nutritives NPK', 'Fumiers compostés', 'Compost végétal', 'Algues marines (kelp)', 'Mélasses'].includes(selectedFertilizer);

    const canAddStep = () => {
        if (!selectedFertilizer || !doseAmount || !frequencyNumber) return false;
        if (isNPK && (!npk.n || !npk.p || !npk.k)) return false;
        if (isCommercial && !commercialName) return false;
        return true;
    };

    const addStep = () => {
        if (!canAddStep()) return;

        const newStep = {
            id: Date.now().toString(),
            name: selectedFertilizer,
            commercialName: isCommercial ? commercialName : undefined,
            npk: isNPK ? `${npk.n}-${npk.p}-${npk.k}` : undefined,
            phase,
            dose: `${doseAmount} ${doseUnit}`,
            frequency: `${frequencyNumber}x/${frequencyUnit}`
        };

        const updatedSteps = [...steps, newStep];
        setSteps(updatedSteps);
        onChange(updatedSteps);

        // Reset form
        setSelectedFertilizer('');
        setCommercialName('');
        setNpk({ n: '', p: '', k: '' });
        setDoseAmount('');
        setFrequencyNumber('1');
    };

    const removeStep = (id) => {
        const updatedSteps = steps.filter(step => step.id !== id);
        setSteps(updatedSteps);
        onChange(updatedSteps);
    };

    const moveStep = (index, direction) => {
        const newSteps = [...steps];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newSteps.length) return;

        [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
        setSteps(newSteps);
        onChange(newSteps);
    };

    const updateStep = (id, field, value) => {
        const updatedSteps = steps.map(step =>
            step.id === id ? { ...step, [field]: value } : step
        );
        setSteps(updatedSteps);
        onChange(updatedSteps);
    };

    return (
        <div className="space-y-4">
            {/* Formulaire d'ajout */}
            <div className="p-4 bg-theme-input rounded-xl border border-theme">
                <h4 className="text-sm font-medium text-[rgb(var(--color-accent))] mb-3">🌱 Ajouter un engrais</h4>

                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Phase */}
                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Phase</label>
                            <select
                                value={phase}
                                onChange={(e) => setPhase(e.target.value)}
                                className="w-full px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none"
                            >
                                <option value="croissance">🌿 Croissance</option>
                                <option value="floraison">🌸 Floraison</option>
                                <option value="tout">🔄 Tout au long</option>
                            </select>
                        </div>

                        {/* Engrais */}
                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Type d'engrais</label>
                            <select
                                value={selectedFertilizer}
                                onChange={(e) => {
                                    setSelectedFertilizer(e.target.value);
                                    setCommercialName('');
                                    setNpk({ n: '', p: '', k: '' });
                                }}
                                className="w-full px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none"
                            >
                                <option value="">-- Sélectionner --</option>
                                {availableFertilizers.map((fert, idx) => (
                                    <option key={idx} value={fert}>{fert}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Nom commercial (si engrais commercial) */}
                    {isCommercial && (
                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Nom commercial *</label>
                            <input
                                type="text"
                                value={commercialName}
                                onChange={(e) => setCommercialName(e.target.value)}
                                placeholder="Ex: BioBizz Grow, Advanced Nutrients..."
                                className="w-full px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none placeholder-[rgb(var(--text-secondary))] placeholder:opacity-50"
                            />
                        </div>
                    )}

                    {/* NPK (si Solutions nutritives NPK) */}
                    {isNPK && (
                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Valeurs NPK *</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={npk.n}
                                    onChange={(e) => setNpk({ ...npk, n: e.target.value })}
                                    placeholder="N"
                                    className="w-full px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none placeholder-[rgb(var(--text-secondary))] placeholder:opacity-50 text-center"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={npk.p}
                                    onChange={(e) => setNpk({ ...npk, p: e.target.value })}
                                    placeholder="P"
                                    className="w-full px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none placeholder-[rgb(var(--text-secondary))] placeholder:opacity-50 text-center"
                                />
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={npk.k}
                                    onChange={(e) => setNpk({ ...npk, k: e.target.value })}
                                    placeholder="K"
                                    className="w-full px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none placeholder-[rgb(var(--text-secondary))] placeholder:opacity-50 text-center"
                                />
                            </div>
                            <p className="text-xs text-[rgb(var(--text-secondary))] opacity-70 mt-1">Format: Azote (N) - Phosphore (P) - Potassium (K)</p>
                        </div>
                    )}

                    {/* Dose */}
                    <div>
                        <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Dose *</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={doseAmount}
                                onChange={(e) => setDoseAmount(e.target.value)}
                                placeholder="Quantité"
                                className="flex-1 px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none placeholder-[rgb(var(--text-secondary))] placeholder:opacity-50"
                            />
                            <select
                                value={doseUnit}
                                onChange={(e) => setDoseUnit(e.target.value)}
                                className="px-3 py-2 bg-theme-input text-[rgb(var(--text-primary))] rounded-lg border border-theme focus:border-[rgb(var(--color-accent))] focus:outline-none"
                            >
                                <option value="ml/L">ml/L</option>
                                <option value="g/L">g/L</option>
                                <option value="g">g</option>
                                <option value="oz">oz</option>
                            </select>
                        </div>
                    </div>

                    {/* Fréquence */}
                    <div>
                        <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Fréquence *</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={frequencyNumber}
                                onChange={(e) => setFrequencyNumber(e.target.value)}
                                className="w-20 px-3 py-2 rounded-lg border focus:outline-none text-center"
                                style={{
                                    backgroundColor: 'var(--bg-input)',
                                    color: 'var(--text-primary)',
                                    borderColor: 'var(--border)'
                                }}
                            />
                            <span className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>fois par</span>
                            <div className="flex gap-1 flex-1">
                                {['sec', 'jours', 'sem', 'mois'].map((unit) => (
                                    <button
                                        key={unit}
                                        type="button"
                                        onClick={() => setFrequencyUnit(unit)}
                                        className="flex-1 px-2 py-2 rounded-lg text-sm font-medium transition"
                                        style={{
                                            backgroundColor: frequencyUnit === unit ? 'var(--primary)' : 'var(--bg-tertiary)',
                                            color: frequencyUnit === unit ? '#FFFFFF' : 'var(--text-secondary)'
                                        }}
                                    >
                                        {unit}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={addStep}
                    disabled={!canAddStep()}
                    className="mt-4 w-full px-4 py-2 rounded-lg font-medium transition disabled:cursor-not-allowed"
                    style={{
                        backgroundColor: !canAddStep() ? 'var(--bg-tertiary)' : 'var(--primary)',
                        color: '#FFFFFF',
                        opacity: !canAddStep() ? 0.5 : 1
                    }}
                >
                    ➕ Ajouter à la routine
                </button>
            </div>

            {/* Liste des étapes */}
            {steps.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[rgb(var(--text-secondary))] opacity-80">
                        📋 Routine d'engraissage ({steps.length} engrais)
                    </h4>

                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className="flex items-start gap-3 p-4 bg-theme-surface hover:bg-theme-input rounded-xl border border-theme transition group"
                        >
                            {/* Numéro + Phase icon */}
                            <div className="flex flex-col items-center gap-1 min-w-[50px]">
                                <span className="text-2xl font-bold text-[rgb(var(--color-accent))] opacity-70">
                                    {index + 1}
                                </span>
                                <span className="text-lg">
                                    {step.phase === 'croissance' && '🌿'}
                                    {step.phase === 'floraison' && '🌸'}
                                    {step.phase === 'tout' && '🔄'}
                                </span>
                            </div>

                            {/* Contenu */}
                            <div className="flex-1 space-y-2">
                                {/* Nom engrais + infos complémentaires */}
                                <div>
                                    <h5 className="font-medium text-[rgb(var(--text-primary))]">{step.name}</h5>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="text-xs px-2 py-0.5 bg-theme-secondary rounded text-[rgb(var(--text-secondary))] capitalize">
                                            {step.phase === 'tout' ? 'Tout au long' : step.phase}
                                        </span>
                                        {step.commercialName && (
                                            <span className="text-xs px-2 py-0.5 bg-theme-accent rounded text-[rgb(var(--color-accent))]">
                                                {step.commercialName}
                                            </span>
                                        )}
                                        {step.npk && (
                                            <span className="text-xs px-2 py-0.5 bg-theme-tertiary rounded text-[rgb(var(--text-primary))] font-mono">
                                                NPK {step.npk}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Dose & Fréquence (lecture seule avec badges) */}
                                <div className="flex flex-wrap gap-3 items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[rgb(var(--text-secondary))] opacity-70">💧 Dose:</span>
                                        <span className="text-sm font-medium text-[rgb(var(--text-primary))] px-2 py-1 bg-theme-secondary rounded">
                                            {step.dose}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-[rgb(var(--text-secondary))] opacity-70">📅 Fréquence:</span>
                                        <span className="text-sm font-medium text-[rgb(var(--text-primary))] px-2 py-1 bg-theme-secondary rounded">
                                            {step.frequency}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contrôles */}
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => moveStep(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 bg-theme-tertiary hover:bg-theme-tertiary disabled:opacity-30 disabled:cursor-not-allowed text-[rgb(var(--text-primary))] rounded text-sm transition"
                                    title="Déplacer vers le haut"
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => moveStep(index, 'down')}
                                    disabled={index === steps.length - 1}
                                    className="p-1 bg-theme-tertiary hover:bg-theme-tertiary disabled:opacity-30 disabled:cursor-not-allowed text-[rgb(var(--text-primary))] rounded text-sm transition"
                                    title="Déplacer vers le bas"
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={() => removeStep(step.id)}
                                    className="p-1 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:bg-red-900/30 text-[rgb(var(--color-danger))] rounded text-sm transition"
                                    title="Supprimer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Message si vide */}
            {steps.length === 0 && (
                <div className="text-center py-6 text-[rgb(var(--text-secondary))] opacity-70 text-sm">
                    Aucun engrais ajouté. Utilisez le formulaire ci-dessus pour construire votre routine d'engraissage.
                </div>
            )}
        </div>
    );
};

FertilizationPipeline.propTypes = {
    value: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        commercialName: PropTypes.string,
        npk: PropTypes.string,
        phase: PropTypes.oneOf(['croissance', 'floraison', 'tout']).isRequired,
        dose: PropTypes.string.isRequired,
        frequency: PropTypes.string.isRequired
    })),
    onChange: PropTypes.func.isRequired,
    availableFertilizers: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default FertilizationPipeline;

