import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CultivarLibraryModal from './CultivarLibraryModal';

export default function CultivarList({ value, onChange, matiereChoices = [], showBreeder = false }) {
    const cultivars = Array.isArray(value) ? value : [];
    const navigate = useNavigate();
    const [showLibraryModal, setShowLibraryModal] = useState(false);

    const addCultivar = () => {
        const newCultivar = {
            id: Date.now(),
            name: '',
            farm: '',
            breeder: '',
            matiere: matiereChoices[0] || '',
            percentage: '',
            reviewId: null, // ID de la review liée (si depuis bibliothèque)
            reviewType: null
        };
        onChange([...cultivars, newCultivar]);
    };

    const addCultivarFromLibrary = (cultivarData) => {
        const newCultivar = {
            id: Date.now(),
            name: cultivarData.name,
            farm: cultivarData.farm,
            breeder: cultivarData.breeder,
            matiere: matiereChoices[0] || '',
            percentage: '',
            reviewId: cultivarData.reviewId,
            reviewType: cultivarData.reviewType
        };
        onChange([...cultivars, newCultivar]);
    };

    const updateCultivar = (id, field, val) => {
        onChange(cultivars.map(c => c.id === id ? { ...c, [field]: val } : c));
    };

    const removeCultivar = (id) => {
        onChange(cultivars.filter(c => c.id !== id));
    };

    return (
        <div className="space-y-4">
            {cultivars.map((cultivar, idx) => (
                <div key={cultivar.id} className="bg-theme-input border border-theme rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[rgb(var(--color-accent))]">Cultivar #{idx + 1}</span>
                        <button
                            type="button"
                            onClick={() => removeCultivar(cultivar.id)}
                            className="px-3 py-1.5 text-sm bg-[rgba(220,38,38,0.15)] hover:bg-[rgba(220,38,38,0.3)] text-[rgb(220,38,38)] rounded-lg transition-colors border border-[rgba(220,38,38,0.3)]"
                        >
                            ✕ Supprimer
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Nom du cultivar</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ex: Blue Dream"
                                    value={cultivar.name || ''}
                                    onChange={(e) => updateCultivar(cultivar.id, 'name', e.target.value)}
                                    disabled={!!cultivar.reviewId}
                                    className={`flex-1 px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-[rgb(var(--text-primary))] text-sm focus:outline-none focus:border-[rgb(var(--color-accent))] ${cultivar.reviewId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                                {cultivar.reviewId && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/review/${cultivar.reviewId}`)}
                                        className="px-3 py-2 bg-transparent border border-theme hover:border-[rgb(var(--color-accent))] text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-accent))] rounded-lg text-sm font-medium transition-colors flex items-center gap-1 hover:shadow-[0_0_15px_rgba(var(--color-accent),0.3)]"
                                        title="Voir la review d'origine"
                                    >
                                        <span>🔗</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Farm</label>
                            <input
                                type="text"
                                placeholder="Ex: Green Valley"
                                value={cultivar.farm || ''}
                                onChange={(e) => updateCultivar(cultivar.id, 'farm', e.target.value)}
                                disabled={!!cultivar.reviewId}
                                className={`w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-[rgb(var(--text-primary))] text-sm focus:outline-none focus:border-[rgb(var(--color-accent))] ${cultivar.reviewId ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {showBreeder && (
                            <div>
                                <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Breeder de la graine</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Barney's Farm"
                                    value={cultivar.breeder || ''}
                                    onChange={(e) => updateCultivar(cultivar.id, 'breeder', e.target.value)}
                                    disabled={!!cultivar.reviewId}
                                    className={`w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-[rgb(var(--text-primary))] text-sm focus:outline-none focus:border-[rgb(var(--color-accent))] ${cultivar.reviewId ? 'opacity-60 cursor-not-allowed' : ''}`}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Matière première</label>
                            <select
                                value={cultivar.matiere || ''}
                                onChange={(e) => updateCultivar(cultivar.id, 'matiere', e.target.value)}
                                className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-[rgb(var(--text-primary))] text-sm focus:outline-none focus:border-[rgb(var(--color-accent))]"
                            >
                                {matiereChoices.map((choice, i) => (
                                    <option key={i} value={choice}>{choice}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs text-[rgb(var(--text-secondary))] opacity-80 mb-1">Pourcentage (optionnel)</label>
                            <input
                                type="text"
                                placeholder="Ex: 40%"
                                value={cultivar.percentage || ''}
                                onChange={(e) => updateCultivar(cultivar.id, 'percentage', e.target.value)}
                                className="w-full px-3 py-2 bg-theme-secondary border border-theme rounded-lg text-[rgb(var(--text-primary))] text-sm focus:outline-none focus:border-[rgb(var(--color-accent))]"
                            />
                        </div>
                    </div>
                </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={addCultivar}
                    className="py-3 border-2 border-dashed border-theme hover:border-[rgb(var(--color-accent))] rounded-xl text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--color-accent))] transition-colors flex items-center justify-center gap-2"
                >
                    <span className="text-2xl">✏️</span>
                    <span>Nouveau cultivar</span>
                </button>

                <button
                    type="button"
                    onClick={() => setShowLibraryModal(true)}
                    className="py-3 border-2 border-dashed border-theme hover:border-[rgb(var(--color-primary))] rounded-xl text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-accent))] transition-colors flex items-center justify-center gap-2 bg-theme-surface"
                >
                    <span className="text-2xl">🌿</span>
                    <span>Depuis bibliothèque</span>
                </button>
            </div>

            <CultivarLibraryModal
                isOpen={showLibraryModal}
                onClose={() => setShowLibraryModal(false)}
                onSelect={addCultivarFromLibrary}
            />
        </div>
    );
}
